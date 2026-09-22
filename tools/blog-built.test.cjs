'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const routes = ['/', '/index.html', '/page/2/', '/page/54/', '/archives/', '/categories/', '/tags/',
  '/projects/', '/courses/', '/courses/ai-town/', '/courses/network-proxy/', '/about/', '/editor/',
  '/morning-read/', '/mahjong/', '/painters-guild/', '/flipbook/', '/2026/08/21/browser-course-12/'];
function fileFor(url) {
  let pathname = decodeURIComponent(new URL(url, 'https://syfyivan.github.io').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(output, '.' + pathname);
  assert.ok(file.startsWith(output + path.sep), 'URL must stay inside public output');
  return file;
}

test('all primary navigation, project, pagination and article routes exist', () => {
  for (const route of routes) assert.ok(fs.existsSync(fileFor(route)), `Missing route ${route}`);
});

test('farm map assets, collection icons and every destination survive static generation', () => {
  const farm = require('../source/js/farm-world-core.js');
  for (const place of farm.places) assert.ok(fs.existsSync(fileFor(place.href)), `Missing farm destination ${place.href}`);
  const icons = new Set(farm.places.concat(farm.discoveries).map(item => item.icon).concat('medal'));
  for (const icon of icons) assert.ok(fs.existsSync(fileFor(`/img/journal/${icon}.svg`)));
  for (const time of ['day', 'night']) assert.ok(fs.statSync(fileFor(`/img/farm-world/${time}.webp`)).size > 50000);
  const html = fs.readFileSync(fileFor('/'), 'utf8');
  for (const asset of ['/js/farm-world-core.js', '/js/farm-world.js', '/css/farm-world.css']) assert.ok(html.includes(asset));
  assert.ok(!html.includes('/js/farm.js?'), 'Old farm renderer must not run alongside the new world');
});

test('all search results resolve to generated articles, without embedded styles', () => {
  const entries = JSON.parse(fs.readFileSync(path.join(output, 'search-index.json'), 'utf8'));
  assert.ok(entries.length > 500, 'Expected the existing article collection');
  for (const entry of entries) {
    assert.ok(fs.existsSync(fileFor(entry.url)), `Broken search result ${entry.url}`);
    assert.equal(typeof entry.title, 'string');
    assert.equal(typeof entry.content, 'string');
  }
  const browser = entries.find(entry => entry.url.includes('browser-course-12/'));
  assert.ok(browser.content.includes('主线已经'));
  assert.ok(!browser.content.includes('.bc-sec{'));
});

test('generated home excerpts are readable and theme search is replaced exactly', () => {
  const html = fs.readFileSync(fileFor('/'), 'utf8');
  assert.ok(html.includes('主线已经'));
  assert.ok(!html.includes('.bc-sec{'));
  assert.ok(html.includes('/css/blog-refinement.css'));
  assert.equal(fs.readFileSync(path.join(output, 'js/local-search.js'), 'utf8'), fs.readFileSync(path.join(root, 'source/js/local-search.js'), 'utf8'));
});

test('shared blog pages reference only existing local scripts, styles and images', () => {
  for (const route of ['/', '/page/2/', '/archives/', '/categories/', '/tags/', '/about/', '/2026/08/21/browser-course-12/']) {
    const html = fs.readFileSync(fileFor(route), 'utf8');
    const resources = [...html.matchAll(/(?:src|href)="(\/(?!\/)[^"<>]+)"/g)].map(match => match[1]).filter(url => /\.(js|css|png|jpe?g|svg|webp)(?:\?|$)/i.test(url));
    for (const resource of resources) assert.ok(fs.existsSync(fileFor(resource)), `${route} has missing asset ${resource}`);
  }
});
