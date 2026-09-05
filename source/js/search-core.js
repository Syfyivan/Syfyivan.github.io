(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BlogSearch = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  function plainText(html) {
    var entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    return String(html || '')
      .replace(/<!--[^]*?-->/g, ' ')
      .replace(/<(style|script|template|svg|noscript)\b[^>]*>[^]*?<\/\1\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (_, entity) {
        var key = entity.toLowerCase();
        if (key[0] !== '#') return entities[key];
        var code = key[1] === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
        return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
      }).replace(/\s+/g, ' ').trim();
  }

  // Literal matching: user input is never compiled into a regular expression.
  function search(entries, query) {
    var words = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return entries.map(function (entry) {
      var title = entry.title.toLowerCase();
      var content = entry.content.toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        if (title.indexOf(words[i]) >= 0) score += 10;
        else if (content.indexOf(words[i]) >= 0) score += 1;
        else return null;
      }
      var start = Math.max(0, content.indexOf(words[0]) - 28);
      return { title: entry.title, url: entry.url, score: score,
        snippet: (start ? '…' : '') + entry.content.slice(start, start + 150) + (entry.content.length > start + 150 ? '…' : '') };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
  }
  return { plainText: plainText, search: search };
});
