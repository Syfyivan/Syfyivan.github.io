/* global hexo */
'use strict';
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { plainText } = require('../source/js/search-core');

hexo.extend.helper.register('blog_excerpt', content => plainText(content).slice(0, 200));

// Keep the upstream layouts and patch the specific markup we customize.
// A theme upgrade that changes this contract must fail visibly at build time.
hexo.extend.filter.register('before_generate', () => {
  const original = fs.readFileSync(path.join(hexo.theme_dir, 'layout/index.ejs'), 'utf8');
  const expression = "<%- strip_html(excerpt).substring(0, 200).trim().replace(/\\n/g, ' ') %>";
  if (!original.includes(expression)) throw new Error('Fluid excerpt template changed; review blog-presentation.js');
  hexo.theme.setView('index.ejs', original.replace(expression, '<%= blog_excerpt(excerpt) %>')
    .replace('<h1 style="display: none">', '<h1 class="sr-only">'));

  const navigationPath = '_partials/header/navigation.ejs';
  const navigation = fs.readFileSync(path.join(hexo.theme_dir, 'layout', navigationPath), 'utf8');
  const searchAsset = "'local-search.js'";
  if (!navigation.includes(searchAsset)) throw new Error('Fluid search script reference changed; review blog-presentation.js');
  const searchSource = fs.readFileSync(path.join(__dirname, '../source/js/local-search.js'), 'utf8').replace(/\r\n/g, '\n');
  const searchVersion = createHash('sha256').update(searchSource).digest('hex').slice(0, 12);
  hexo.theme.setView(navigationPath, navigation.replace(searchAsset, "'local-search.js?v=" + searchVersion + "'"));

  const categoryPath = '_partials/category-list.ejs';
  const categories = fs.readFileSync(path.join(hexo.theme_dir, 'layout', categoryPath), 'utf8');
  const panelId = 'collapse-<%= md5(cat.name) %>';
  const panelLink = 'href="#' + panelId + '"';
  if (!categories.includes(panelLink)) throw new Error('Fluid category disclosure changed; review blog-presentation.js');
  // Category paths distinguish equal names under different parents.
  hexo.theme.setView(categoryPath, categories
    .replace(panelLink, panelLink + ' aria-controls="' + panelId + '"')
    .replaceAll('md5(cat.name)', 'md5(cat.path)'));
});

function isPublicPost(post) {
  return post.published !== false && post.indexing !== false && !post.hide && !post.encrypt;
}

// Keep title and summary search small while full-text search stays available.
hexo.extend.generator.register('blog-search-index', locals => {
  const entries = locals.posts.sort('-date').toArray()
    .filter(isPublicPost)
    .map(post => ({ title: post.title || '未命名文章', content: plainText(post.content), url: '/' + post.path.replace(/^\/+/, '') }));
  const previews = entries.map(entry => ({ ...entry, content: entry.content.slice(0, 150) }));
  return [
    { path: 'search-preview.json', data: JSON.stringify(previews) },
    { path: 'search-index.json', data: JSON.stringify(entries) },
  ];
});

hexo.extend.generator.register('blog-sitemap', locals => {
  const publicPages = ['', 'about/', 'archives/', 'categories/', 'tags/', 'projects/', 'courses/', 'morning-read/', 'game-mod-research/'];
  const articlePaths = locals.posts.toArray().filter(isPublicPost).map(post => post.path);
  const siteUrl = hexo.config.url;
  const urls = new Set(publicPages.concat(articlePaths).map(route => new URL(route, siteUrl).href.replace(/\/index\.html$/, '/')));
  const entries = [...urls].sort().map(url => '  <url><loc>' + url.replaceAll('&', '&amp;').replaceAll("'", '&apos;') + '</loc></url>');
  return [
    {
      path: 'sitemap.xml',
      data: ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join('\n'),
    },
    {
      path: 'robots.txt',
      data: 'User-agent: *\nDisallow:\nSitemap: ' + new URL('sitemap.xml', siteUrl).href + '\n',
    },
  ];
});
