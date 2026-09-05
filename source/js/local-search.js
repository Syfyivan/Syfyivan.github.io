/* global BlogSearch, jQuery */
(function () {
  'use strict';
  var input = document.getElementById('local-search-input');
  var result = document.getElementById('local-search-result');
  if (!input || !result) return;
  var modal = jQuery('#modalSearch');
  var entries = null;
  var pending = null;
  var timer;
  var composing = false;
  var opener;
  var status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  result.before(status);
  input.placeholder = '搜索文章标题或正文…';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('maxlength', '160');
  input.setAttribute('aria-label', '搜索文章');
  document.getElementById('local-search-close').setAttribute('aria-label', '关闭搜索');
  modal.attr('aria-modal', 'true').attr('aria-label', '搜索文章').removeAttr('aria-labelledby');

  function render() {
    if (!entries) return;
    result.replaceChildren();
    if (!input.value.trim()) {
      status.textContent = '输入关键词，查找 ' + entries.length + ' 篇文章。支持多个关键词。';
      return;
    }
    var matches = BlogSearch.search(entries, input.value);
    status.textContent = matches.length ? '找到 ' + matches.length + ' 篇文章' + (matches.length > 40 ? '，先展示最相关的 40 篇，可增加关键词缩小范围。' : '') : '没有找到相关文章，试试其他关键词。';
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
    if (entries) { render(); return; }
    if (pending) return;
    status.textContent = '正在加载文章索引…';
    result.replaceChildren();
    result.setAttribute('aria-busy', 'true');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);
    pending = fetch('/search-index.json', { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('Index unavailable'); return response.json(); })
      .then(function (data) { if (!Array.isArray(data)) throw new Error('Invalid index'); entries = data; if (modal.hasClass('show')) render(); })
      .catch(function () {
        status.textContent = '文章索引暂时加载失败，请检查网络后重试。';
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'search-retry';
        retry.textContent = '重新加载';
        retry.addEventListener('click', load);
        result.replaceChildren(retry);
      }).finally(function () { clearTimeout(timeout); pending = null; result.removeAttribute('aria-busy'); });
  }
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
  modal.on('show.bs.modal', function () { opener = document.activeElement; load(); });
  modal.on('shown.bs.modal', function () { input.focus(); if (entries) render(); });
  modal.on('hidden.bs.modal', function () {
    clearTimeout(timer);
    input.value = '';
    result.replaceChildren();
    status.textContent = '';
    if (opener && opener.closest('#mobile-grid-menu')) document.getElementById('navbar-toggler-btn').focus();
  });
})();
