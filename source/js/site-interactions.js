/* global jQuery */
(function () {
  'use strict';
  function init() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return; // Standalone tools own their UI.
    var root = document.documentElement;
    var main = document.querySelector('main');
    var footer = document.querySelector('footer');
    if (main) {
      main.id = main.id || 'main-content';
      main.tabIndex = -1;
      var skip = document.createElement('a');
      skip.className = 'skip-content';
      skip.href = '#' + main.id;
      skip.textContent = '跳到正文';
      document.body.prepend(skip);
    }
    var normalize = function (path) { return path.replace(/index\.html$/, '').replace(/\/$/, '') || '/'; };
    var current = normalize(location.pathname);
    navbar.querySelectorAll('a[href^="/"]').forEach(function (link) {
      if (normalize(new URL(link.href).pathname) === current) link.setAttribute('aria-current', 'page');
    });

    // Own the mobile menu state. Fluid's click handler and Bootstrap's collapse
    // handler otherwise toggle different surfaces from the same button.
    var toggle = document.getElementById('navbar-toggler-btn');
    var menu = document.getElementById('mobile-grid-menu');
    var open = false;
    var previousInert = [];
    function setMenu(value, restoreFocus) {
      open = value;
      menu.classList.toggle('show', open);
      document.body.classList.toggle('mobile-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      var icon = toggle.querySelector('.animated-icon');
      if (icon) icon.classList.toggle('open', open);
      if (open) {
        previousInert = [main, footer].filter(Boolean).map(function (el) { var prior = el.inert; el.inert = true; return [el, prior]; });
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else {
        previousInert.forEach(function (pair) { pair[0].inert = pair[1]; });
        previousInert = [];
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    }
    if (toggle && menu) {
      jQuery(toggle).off('click');
      jQuery(menu).off('click');
      toggle.removeAttribute('data-toggle');
      toggle.removeAttribute('data-target');
      toggle.setAttribute('aria-controls', menu.id);
      menu.setAttribute('aria-label', '导航菜单');
      setMenu(false);
      toggle.addEventListener('click', function () { setMenu(!open, open); });
      menu.addEventListener('click', function (event) {
        var link = event.target.closest('a');
        if (link && !link.closest('#mobile-color-toggle-btn')) setMenu(false);
      });
      document.addEventListener('keydown', function (event) {
        if (!open) return;
        if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
        if (event.key === 'Tab') {
          var controls = [toggle].concat(Array.from(menu.querySelectorAll('a[href],button')));
          var first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });
      window.addEventListener('resize', function () { if (window.innerWidth >= 992 && open) setMenu(false); });
      window.addEventListener('pageshow', function () { setMenu(false); });
      jQuery('#modalSearch').on('show.bs.modal', function () { if (open) setMenu(false); });
    }

    function syncThemeLabels() {
      var dark = root.getAttribute('data-user-color-scheme') === 'dark';
      document.querySelectorAll('#color-toggle-btn a, #mobile-color-toggle-btn a').forEach(function (link) {
        link.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
        link.title = link.getAttribute('aria-label');
      });
    }
    syncThemeLabels();
    new MutationObserver(syncThemeLabels).observe(root, { attributes: true, attributeFilter: ['data-user-color-scheme'] });
    document.querySelectorAll('[data-target="#modalSearch"]').forEach(function (link) {
      link.setAttribute('aria-label', '搜索文章');
      link.title = '搜索文章';
    });

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = false;
    try { paused = localStorage.getItem('Blog_Motion_Paused') === 'true'; } catch (_) {}
    var banner = document.getElementById('banner');
    var motionButton;
    if (document.querySelector('.village')) {
      motionButton = document.createElement('button');
      motionButton.type = 'button';
      motionButton.className = 'motion-toggle';
      banner.appendChild(motionButton);
      motionButton.addEventListener('click', function () {
        paused = !paused;
        try { localStorage.setItem('Blog_Motion_Paused', String(paused)); } catch (_) {}
        syncMotion();
      });
    }
    function syncMotion() {
      var reduced = paused || motionQuery.matches;
      root.dataset.motion = reduced ? 'paused' : 'running';
      if (motionButton) {
        motionButton.disabled = motionQuery.matches;
        motionButton.textContent = motionQuery.matches ? '已跟随系统减少动态' : paused ? '播放景物动效' : '暂停景物动效';
        motionButton.setAttribute('aria-pressed', String(reduced));
      }
      document.dispatchEvent(new Event('blog:motion'));
    }
    syncMotion();
    motionQuery.addEventListener('change', syncMotion);
    if ('IntersectionObserver' in window) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('arrived');
          reveal.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.index-card, .home-project-card, .home-showcase__heading').forEach(function (card) { reveal.observe(card); });
    }

    var article = document.querySelector('.post-content .markdown-body');
    var progress;
    if (article) {
      var headings = Array.from(article.querySelectorAll('h2[id], h3[id]'));
      // Hexo and AnchorJS both insert heading anchors. Keep the visible,
      // keyboard-operable one and remove the duplicate zero-size link.
      article.querySelectorAll('.headerlink').forEach(function (link) {
        if (link.parentElement.querySelector('.anchorjs-link')) link.remove();
      });
      article.querySelectorAll('.anchorjs-link').forEach(function (link) {
        link.setAttribute('aria-label', '章节链接：' + link.parentElement.textContent.trim());
      });
      if (headings.length > 1 && document.getElementById('toc')) {
        var toc = document.createElement('details');
        toc.className = 'mobile-toc';
        var summary = document.createElement('summary');
        summary.textContent = '本文目录 · ' + headings.length + ' 节';
        var nav = document.createElement('nav');
        nav.setAttribute('aria-label', '本文目录');
        headings.forEach(function (heading) {
          var link = document.createElement('a');
          link.href = '#' + encodeURIComponent(heading.id);
          link.textContent = heading.textContent.trim();
          nav.appendChild(link);
        });
        toc.append(summary, nav);
        article.before(toc);
        nav.addEventListener('click', function (event) {
          if (event.target.closest('a')) toc.open = false;
        });
      }
      progress = document.createElement('div');
      progress.className = 'reading-progress';
      progress.setAttribute('aria-hidden', 'true');
      navbar.appendChild(progress);
    }
    var topButton = document.getElementById('scroll-top-button');
    if (topButton) {
      jQuery(topButton).off('click');
      topButton.setAttribute('aria-label', '回到顶部');
      topButton.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: root.dataset.motion === 'paused' ? 'auto' : 'smooth' }); });
    }
    var frame = 0;
    function updateScroll() {
      frame = 0;
      navbar.classList.toggle('has-scrolled', window.scrollY > 24);
      if (topButton) topButton.classList.toggle('is-visible', window.scrollY > 600);
      if (progress) {
        var rect = article.getBoundingClientRect();
        var total = Math.max(1, rect.height - innerHeight + 90);
        progress.style.transform = 'scaleX(' + Math.max(0, Math.min(1, (90 - rect.top) / total)) + ')';
      }
    }
    function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll);
    if (article && 'ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(article);
    updateScroll();
    if (document.querySelector('.home-showcase') && /^#(latest-writing|token-usage)$/.test(location.hash)) {
      var destination = document.querySelector(location.hash);
      if (destination) requestAnimationFrame(function () { destination.scrollIntoView({ behavior: 'auto', block: 'start' }); });
    }
  }
  // boot.js registers its DOMContentLoaded listener after custom scripts.
  // Run in the next task so replacements happen after Fluid binds its handlers.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})();
