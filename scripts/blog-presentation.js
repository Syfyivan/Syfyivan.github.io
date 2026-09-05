/* global hexo */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { plainText } = require('../source/js/search-core');

hexo.extend.helper.register('blog_excerpt', content => plainText(content).slice(0, 200));

// Keep the upstream layout; replace only the unsafe excerpt expression.
// A theme upgrade that changes this contract must fail visibly at build time.
hexo.extend.filter.register('before_generate', () => {
  const original = fs.readFileSync(path.join(hexo.theme_dir, 'layout/index.ejs'), 'utf8');
  const expression = "<%- strip_html(excerpt).substring(0, 200).trim().replace(/\\n/g, ' ') %>";
  if (!original.includes(expression)) throw new Error('Fluid excerpt template changed; review blog-presentation.js');
  hexo.theme.setView('index.ejs', original.replace(expression, '<%= blog_excerpt(excerpt) %>')
    .replace('<h1 style="display: none">', '<h1 class="sr-only">'));
});

// Full readable text, without repeated CSS/HTML payloads. URLs remain local
// so preview search and production search have identical navigation behavior.
hexo.extend.generator.register('blog-search-index', locals => ({
  path: 'search-index.json',
  data: JSON.stringify(locals.posts.sort('-date').toArray()
    .filter(post => post.published !== false && post.indexing !== false && !post.hide && !post.encrypt)
    .map(post => ({ title: post.title || '未命名文章', content: plainText(post.content), url: '/' + post.path })))
}));
