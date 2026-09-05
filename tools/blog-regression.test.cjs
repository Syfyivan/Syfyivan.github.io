'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('homepage enhancements never mount on inner index.html routes', () => {
  for (const file of ['home-showcase.js', 'token-usage.js']) {
    for (const pathname of ['/courses/index.html', '/page/2/index.html', '/2026/08/21/browser-course-12/index.html']) {
      let queried = false;
      const sandbox = {
        window: { location: { pathname } },
        document: { readyState: 'complete', querySelector() { queried = true; }, getElementById() { queried = true; } },
      };
      vm.runInNewContext(fs.readFileSync(path.join(root, 'source/js', file), 'utf8'), sandbox);
      assert.equal(queried, false, `${file} mounted on ${pathname}`);
    }
  }
});

test('search treats punctuation literally, matches all words and ranks titles first', () => {
  const { search } = require('../source/js/search-core.js');
  const entries = [
    { title: 'A guide', content: 'C++ array[0] a.b', url: '/body/' },
    { title: 'C++ guide', content: 'array[0]', url: '/title/' },
    { title: 'Unrelated', content: 'axb', url: '/other/' },
  ];
  assert.equal(search(entries, 'C++')[0].url, '/title/');
  assert.equal(search(entries, '[').length, 2);
  assert.equal(search(entries, 'a.b').length, 1);
  assert.equal(search(entries, 'C++ missing').length, 0);
  assert.equal(search(entries, '   ').length, 0);
  assert.equal(search(entries, 'GUIDE array').length, 2);
});

test('excerpt cleaning removes embedded styles/scripts while preserving readable text', () => {
  const { plainText } = require('../source/js/search-core.js');
  assert.equal(plainText('<style>.bc-sec{display:flex}</style><p>前端 &amp; 浏览器</p><script>alert(1)</script><p>下一步</p>'), '前端 & 浏览器 下一步');
  assert.equal(plainText('<p>&lt;script&gt; &#x4E2D; &#25991; &#999999999;</p>'), '<script> 中 文 �');
  assert.equal(plainText('<template>hidden</template><!-- hidden --><p>visible</p>'), 'visible');
});
