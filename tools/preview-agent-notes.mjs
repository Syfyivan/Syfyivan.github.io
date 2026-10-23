import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(process.argv.slice(2).map(value => {
  const index = value.indexOf('=');
  return index < 0 ? [value, true] : [value.slice(0, index), value.slice(index + 1)];
}));
assert.ok(args.get('--modules'), 'Provide --modules with an existing Playwright package directory');
assert.ok(args.get('--artifacts'), 'Provide --artifacts for screenshots and validation output');
const { chromium } = createRequire(path.join(args.get('--modules'), 'package.json'))('playwright');
const config = JSON.parse(fs.readFileSync(path.join(root, 'tools/agent-notes/outline.json'), 'utf8'));
const output = path.resolve(root, 'public');
const artifacts = path.resolve(args.get('--artifacts'));
fs.mkdirSync(artifacts, { recursive: true });
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.woff2':'font/woff2' };
let server;
let base = args.get('--base');
if (!base) {
  server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = path.resolve(output, '.' + pathname);
      if (!file.startsWith(output + path.sep)) { response.writeHead(403); response.end(); return; }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(400); response.end();
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
}
base = base.replace(/\/$/, '');
const prefix = args.get('--base') ? 'live' : 'local';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const article of config.articles) {
    for (const profile of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
      const context = await browser.newContext({ viewport: profile, reducedMotion:'reduce', isMobile:profile.name==='mobile', hasTouch:profile.name==='mobile' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(base + article.route, { waitUntil:'domcontentloaded', timeout:45000 });
      assert.equal(response.status(), 200, `${article.key}: HTTP error`);
      await page.locator('.markdown-body').waitFor();
      await page.waitForFunction(() => document.querySelectorAll('#toc .toc-body a').length > 0, {timeout:20000});
      const metrics = await page.evaluate(() => {
        const body = document.querySelector('.markdown-body');
        const anchors = [...body.querySelectorAll('a[id]')].map(node => node.id);
        const viewport = document.documentElement.clientWidth;
        return {
          title:document.querySelector('#seo-header').textContent,
          characters:body.textContent.length,
          mechanisms:anchors.length,
          tables:body.querySelectorAll('table').length,
          tocLinks:document.querySelectorAll('#toc .toc-body a').length,
          viewport,
          scrollWidth:document.documentElement.scrollWidth,
          height:document.documentElement.scrollHeight,
          brokenAnchors:[...body.querySelectorAll('a[href^="#"]')].map(a=>decodeURIComponent(a.hash.slice(1))).filter(id=>!document.getElementById(id)),
        };
      });
      assert.equal(metrics.title, article.title);
      assert.equal(metrics.mechanisms, 26);
      assert.ok(metrics.characters > 11000, 'Expected a full independent article');
      assert.ok(metrics.tables >= 10, 'Expected all technical mapping tables');
      assert.equal(metrics.brokenAnchors.length, 0);
      assert.ok(metrics.scrollWidth <= metrics.viewport + 2, `${article.key}/${profile.name}: horizontal page overflow ${metrics.scrollWidth}/${metrics.viewport}`);
      await page.locator('#terms').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(artifacts, `${prefix}-${article.key}-${profile.name}-start.png`)});
      if (profile.name === 'desktop') {
        const toc = page.locator('#toc .toc-body a').filter({hasText:/Memory|记忆供给/}).first();
        await toc.scrollIntoViewIfNeeded();
        await toc.click();
        await page.waitForFunction(() => location.hash.length > 1);
        assert.ok(await page.evaluate(() => window.scrollY > 500), 'TOC must navigate inside the single page');
      }
      await page.locator('#correlation').scrollIntoViewIfNeeded();
      let tableScroll = 'not-required';
      if (profile.name === 'mobile') {
        tableScroll = await page.locator('.markdown-body table').filter({hasText:'function_call_output'}).first().evaluate(table => {
          const excess = table.scrollWidth - table.clientWidth;
          table.scrollLeft = table.scrollWidth;
          return {excess, scrollLeft:table.scrollLeft};
        });
        assert.ok(tableScroll.excess > 0 && tableScroll.scrollLeft > 0, 'Wide protocol table must scroll inside its container');
      }
      await page.screenshot({path:path.join(artifacts, `${prefix}-${article.key}-${profile.name}-protocol.png`)});
      await page.locator(`.markdown-body a[href="${article.other}"]`).first().click();
      await page.waitForURL(base + article.other, {timeout:20000});
      assert.equal(errors.length, 0, `Page errors: ${errors.join('; ')}`);
      results.push({article:article.key, profile:profile.name, ...metrics, errors, tableScroll, otherVersionNavigation:'passed'});
      await context.close();
    }
  }
  const report = {base, results, status:'passed'};
  fs.writeFileSync(path.join(artifacts, `${prefix}-browser-report.json`), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
