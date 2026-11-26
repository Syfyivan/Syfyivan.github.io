/* global BlogSearch, jQuery */
(function () {
  'use strict';
  var input = document.getElementById('local-search-input');
  var result = document.getElementById('local-search-result');
  if (!input || !result) return;
  var modal = jQuery('#modalSearch');
  var preview = { url: '/search-preview.json', label: '标题和摘要' };
  var fullText = { url: '/search-index.json', label: '全文' };
  var index = preview;
  var timer;
  var composing = false;
  var modalOpen = false;
  var opener;
  var status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  var scope = document.createElement('button');
  scope.type = 'button';
  scope.className = 'search-retry search-scope';
  scope.textContent = '搜索全文';
  result.before(scope, status);
  input.placeholder = '搜索文章标题和摘要…';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('maxlength', '160');
  input.setAttribute('aria-label', '搜索文章');
  document.getElementById('local-search-close').setAttribute('aria-label', '关闭搜索');
  modal.attr('aria-modal', 'true').attr('aria-label', '搜索文章').removeAttr('aria-labelledby');

  function render() {
    if (!index.entries || composing) return;
    result.removeAttribute('aria-busy');
    result.replaceChildren();
    if (!input.value.trim()) {
      status.textContent = '搜索 ' + index.entries.length + ' 篇文章的' + index.label + '。支持多个关键词。';
      return;
    }
    var matches = BlogSearch.search(index.entries, input.value);
    if (!matches.length) {
      status.textContent = index === preview ? '标题和摘要没有匹配，可以搜索全文。' : '全文没有匹配，试试其他关键词。';
      return;
    }
    status.textContent = index.label + '匹配 ' + matches.length + ' 篇文章' + (matches.length > 40 ? '，先展示最相关的 40 篇，可增加关键词缩小范围。' : '。');
    var fragment = document.createDocumentFragment();
    matches.slice(0, 40).forEach(function (match) {
      // Static index only; never accept script/data/external navigation URLs.
      if (!/^\/(?!\/)/.test(match.url)) return;
      var link = document.createElement('a');
      link.className = 'search-hit';
      link.href = match.url;
      var title = document.createElement('strong');
      title.textContent = match.title;
      var snippet = document.createElement('span');
      snippet.textContent = match.snippet;
      link.append(title, snippet);
      fragment.appendChild(link);
    });
    result.appendChild(fragment);
  }

  function load() {
    var target = index;
    if (target.entries) { render(); return; }
    status.textContent = '正在加载' + target.label + '索引…';
    result.replaceChildren();
    result.setAttribute('aria-busy', 'true');
    if (target.pending) return;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);
    target.pending = fetch(target.url, { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('Index unavailable'); return response.json(); })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('Invalid index');
        target.entries = data;
        if (target === index && modalOpen) render();
      })
      .catch(function () {
        if (target !== index || !modalOpen) return;
        status.textContent = target.label + '索引暂时加载失败，请检查网络后重试。';
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'search-retry';
        retry.textContent = '重新加载';
        retry.addEventListener('click', load);
        result.replaceChildren(retry);
      }).finally(function () {
        clearTimeout(timeout);
        target.pending = null;
        if (target === index) result.removeAttribute('aria-busy');
      });
  }
  scope.addEventListener('click', function () {
    index = index === preview ? fullText : preview;
    scope.textContent = index === preview ? '搜索全文' : '只搜标题和摘要';
    input.placeholder = '搜索文章' + index.label + '…';
    load();
  });
  input.addEventListener('input', function () {
    clearTimeout(timer);
    if (!composing) timer = setTimeout(render, 100);
  });
  input.addEventListener('compositionstart', function () { composing = true; clearTimeout(timer); });
  input.addEventListener('compositionend', function () { composing = false; render(); });
  input.addEventListener('keydown', function (event) {
    if (!event.isComposing && event.key === 'ArrowDown') {
      var first = result.querySelector('a');
      if (first) { event.preventDefault(); first.focus(); }
    }
  });
  modal.on('show.bs.modal', function () {
    modalOpen = true;
    opener = document.activeElement;
    load();
  });
  modal.on('shown.bs.modal', function () { input.focus(); render(); });
  modal.on('hidden.bs.modal', function () {
    modalOpen = false;
    composing = false;
    clearTimeout(timer);
    input.value = '';
    result.replaceChildren();
    result.removeAttribute('aria-busy');
    status.textContent = '';
    if (opener && opener.closest('#mobile-grid-menu')) document.getElementById('navbar-toggler-btn').focus();
  });
})();
