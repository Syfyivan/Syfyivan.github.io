(function () {
  'use strict';
  function init() {
    if (location.pathname !== '/' && location.pathname !== '/index.html') return;
    var core = window.FarmWorld, banner = document.querySelector('#banner');
    if (!core || !banner || document.querySelector('.farm-world')) return;
    document.body.classList.add('home-journal', 'home-world');
    var root = document.createElement('section');
    root.className = 'farm-world'; root.dataset.time = 'day'; root.dataset.weather = 'sun';
    root.setAttribute('aria-label', '一凡的互动像素农场');
    var icon = function (name) { return '<img src="/img/journal/' + name + '.svg" width="28" height="28" alt="">'; };
    root.innerHTML = `
      <header class="world-heading">
        <div><p class="world-eyebrow">A LITTLE PLACE TO GROW</p><h1>一凡的小院<span class="world-title-leaf" aria-hidden="true">${icon('sprout')}</span></h1><p class="world-intro">种下好奇，收获日常。欢迎来我的数字小农场坐坐。</p></div>
        <div class="world-season"><span class="world-season-icon" aria-hidden="true">✦</span><span><b>春日来信</b><small>代码 · 生活 · 一点点奇思妙想</small></span></div>
      </header>
      <div class="world-layout">
        <div class="world-main">
          <div class="world-frame">
            <div class="world-toolbar"><span class="world-location"><i aria-hidden="true"></i> 小院漫游</span><div class="world-controls">
              <button type="button" data-action="time" aria-label="切换到夜晚" title="切换昼夜"><span aria-hidden="true">☀</span><b>白昼</b></button>
              <button type="button" data-action="weather" aria-label="开启小雨" aria-pressed="false" title="切换天气"><span aria-hidden="true">☁</span><b>晴天</b></button>
              <button type="button" data-action="sound" aria-label="开启自然声音" aria-pressed="false" title="自然声音，默认关闭"><span aria-hidden="true">♫</span><b>声音关</b></button>
              <button type="button" data-action="motion" aria-label="暂停景物动效" aria-pressed="false" title="暂停动效"><span aria-hidden="true">Ⅱ</span><b>暂停</b></button>
            </div></div>
            <div class="world-viewport" tabindex="0" aria-label="农场地图，建筑可以进入，闪光处藏着小发现">
              <div class="world-map">
                <img class="world-art world-art--day" src="/img/farm-world/day.webp" width="1536" height="1024" fetchpriority="high" alt="春日农场全景：课程书屋、工坊、玻璃花房、酒馆和观测站，沿小路围绕喷泉与池塘分布。">
                <img class="world-art world-art--night" data-src="/img/farm-world/night.webp" width="1536" height="1024" alt="" aria-hidden="true">
                <div class="world-atmosphere" aria-hidden="true"><div class="world-cloud world-cloud--one"></div><div class="world-cloud world-cloud--two"></div><div class="world-rain"></div><div class="world-fireflies"></div><div class="world-water"></div></div>
                <nav class="world-buildings" aria-label="农场建筑入口">${core.places.map(function (p) {
                  return '<a class="world-place world-place--' + p.id + '" style="--x:' + p.x + '%;--y:' + p.y + '%;--w:' + (p.w || 5) + '%;--h:' + (p.h || 5) + '%" href="' + p.href + '" aria-label="' + p.name + '：' + p.subtitle + '"><span class="world-place__pin" aria-hidden="true">' + icon(p.icon) + '</span><span class="world-place__name">' + p.name + '</span><span class="world-place__tip">' + p.subtitle + ' →</span></a>';
                }).join('')}</nav>
                <div class="world-discoveries">${core.discoveries.map(function (d) {
                  return '<button type="button" class="world-discovery world-discovery--' + d.id + '" data-discovery="' + d.id + '" style="--x:' + d.x + '%;--y:' + d.y + '%" aria-label="' + d.title + '：' + d.hint + '"><span class="world-discovery__spark" aria-hidden="true">✦</span><span class="world-discovery__label">' + ({berry:'摘草莓',fish:'钓个鱼',chick:'打招呼'})[d.id] + '</span></button>';
                }).join('')}</div>
                <div class="world-animals" aria-hidden="true"><i class="world-animal world-animal--hen"></i><i class="world-animal world-animal--chick"></i><i class="world-animal world-animal--duck"></i><i class="world-butterfly"></i></div>
                <div class="world-action-scene" aria-hidden="true"></div>
              </div>
            </div>
            <div class="world-map-footer"><button type="button" class="world-pocket" data-action="pocket" aria-label="打开收集手册">${icon('book')}<span>0 / 3</span></button><span class="world-footer-hint">点闪光，收集小惊喜</span><button type="button" data-action="zoom" aria-pressed="false">＋ 放大逛逛</button></div>
          </div>
          <div class="world-message" role="status" aria-live="polite"><span class="world-message__icon" aria-hidden="true">${icon('letter')}</span><span class="world-message__text">小院的门一直开着。今天，想先去哪里？</span></div>
        </div>
        <aside class="world-sidebar" aria-label="小院旅人手册">
          <div class="world-notice"><div class="world-paper-pin" aria-hidden="true"></div><p class="world-eyebrow">THE GARDENER’S NOTE</p><h2>嗨，我是一凡。</h2><p>白天写代码，闲时捣鼓些有趣的东西。这里收着我的学习笔记、项目，还有一座慢慢长大的小院。</p><a href="/about/">认识小院主人 <span aria-hidden="true">↗</span></a><span class="world-signature">愿好奇心常在。</span></div>
          <section class="world-quests" aria-labelledby="world-quest-title"><div class="world-quests__heading"><h2 id="world-quest-title">小院散步手册</h2><span class="world-progress">0 / 3</span></div><p>不赶时间，收集三个小小的发现。</p><ol>${core.discoveries.map(function (d) {
            return '<li><button type="button" class="world-find" data-find="' + d.id + '"><span class="world-check" aria-hidden="true"></span><span><strong>' + d.title + '</strong><small>' + d.hint + '</small></span></button></li>';
          }).join('')}</ol><div class="world-stamp"><span aria-hidden="true">✿</span><span>收集完成，留下一枚小院纪念章</span></div><button type="button" class="world-notebook-button" data-action="notebook">${icon('book')} 翻开我的散步手册</button></section>
          <a class="world-reading" href="#latest-writing">${icon('book')}<span><small>坐下来，读一会儿</small><strong>最近写下的故事 →</strong></span></a>
        </aside>
      </div>
      <nav class="world-directory" aria-label="小院快捷导航"><span>小院路牌</span>${core.places.map(function (p) { return '<a href="' + p.href + '">' + icon(p.icon) + p.name + '</a>'; }).join('')}<a href="/reading-lab/">${icon('sprout')}阅读实验室</a><a href="/courses/ai-town/">${icon('house')}AI 小镇</a><a href="/archives/">${icon('letter')}文章归档</a></nav>
      <dialog class="world-notebook" aria-labelledby="world-notebook-title"><button type="button" class="world-notebook-close" aria-label="关闭散步手册">×</button><p class="world-eyebrow">LITTLE MOMENTS, KEPT FOREVER</p><h2 id="world-notebook-title">我的小院散步手册</h2><p>不必完成什么大事，记住这三个小瞬间就好。</p><div class="world-notebook-pages"></div><p class="world-save-note">收集记录保存在当前浏览器里。</p><button type="button" class="world-notebook-done">继续逛逛 →</button></dialog>`;
    banner.appendChild(root);
    var found = [], storage = null;
    try { storage = window.localStorage; found = core.restore(storage.getItem('yifan-farm-discoveries')); } catch (_) {}
    var reduced = matchMedia('(prefers-reduced-motion: reduce)'), paused = false, visible = true;
    try { paused = storage && storage.getItem('Blog_Motion_Paused') === 'true'; } catch (_) {}
    var timeOverride = false, hintTimer = 0;
    var viewport = root.querySelector('.world-viewport'), map = root.querySelector('.world-map');
    var notebook = root.querySelector('.world-notebook');
    var $ = function (selector) { return root.querySelector(selector); };
    var message = function (text) { $('.world-message__text').textContent = text; };
    function syncFound() {
      $('.world-progress').textContent = found.length + ' / 3';
      $('.world-pocket span').textContent = found.length + ' / 3';
      core.discoveries.forEach(function (d) {
        $('[data-find="' + d.id + '"]').classList.toggle('is-found', found.includes(d.id));
        $('[data-discovery="' + d.id + '"]').classList.toggle('is-found', found.includes(d.id));
      });
      root.classList.toggle('is-complete', found.length === 3);
      $('.world-stamp').lastElementChild.textContent = found.length === 3 ? '小院常客 · 很高兴在这里遇见你' : '收集完成，留下一枚小院纪念章';
      $('.world-notebook-pages').innerHTML = core.discoveries.map(function (d) {
        var yes = found.includes(d.id);
        return '<article class="world-memory ' + (yes ? 'is-found' : '') + '">' + icon(d.icon) + '<h3>' + d.title + '</h3><p>' + (yes ? d.message : d.hint) + '</p><span>' + (yes ? '已收进手册 ✓' : '等你来发现') + '</span></article>';
      }).join('') + (found.length === 3 ? '<div class="world-completion">' + icon('medal') + '<span><strong>小院常客</strong><small>这枚纪念章，属于愿意慢下来发现美好的你。</small></span></div>' : '');
    }
    function award(d) {
      var repeated = found.includes(d.id);
      found = core.collect(found, d.id);
      var saved = core.save(storage, found);
      $('.world-save-note').textContent = saved ? '收集记录保存在当前浏览器里。' : '当前浏览器无法保存记录，本次散步仍可正常收集。';
      syncFound();
      message((repeated ? '再来看一眼：' : '') + d.message + (!repeated && found.length === 3 ? ' 三个小瞬间集齐，散步手册里多了一枚纪念章。' : ''));
      if (audioOn) chime();
    }
    var scene = $('.world-action-scene'), flight = null;
    var artReady = false, artFailed = false, actionArt = new Image();
    actionArt.onload = function () { artReady = true; };
    actionArt.onerror = function () { artFailed = true; };
    actionArt.src = '/img/farm-world/actions-v2.png';
    var action = core.sequence({ set: function (fn, ms) { return setTimeout(fn, ms); }, clear: function (id) { clearTimeout(id); } });
    function flyMemory(d) {
      var from = scene.getBoundingClientRect(), to = $('.world-pocket').getBoundingClientRect();
      var token = document.createElement('span'); token.className = 'world-memory-flight'; token.innerHTML = '<i class="world-atlas world-atlas--' + d.id + '"></i>';
      token.style.left = from.left + 'px'; token.style.top = from.top + 'px'; root.appendChild(token);
      var dx = to.left + to.width / 2 - from.left, dy = to.top + to.height / 2 - from.top;
      flight = token;
      if (token.animate) token.animate([
        { transform:'translate(-50%,-50%) scale(1)', opacity:1 },
        { transform:'translate(' + (dx*.45-14) + 'px,' + (Math.min(-65,dy*.2)-14) + 'px) scale(.9)', opacity:1, offset:.4 },
        { transform:'translate(' + (dx-14) + 'px,' + (dy-14) + 'px) scale(.4)', opacity:.2 }
      ], { duration:850, easing:'cubic-bezier(.3,.1,.5,1)', fill:'forwards' });
    }
    root.querySelectorAll('[data-discovery]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (action.busy()) return;
        var d = core.discoveries.find(function (item) { return item.id === button.dataset.discovery; });
        if (root.classList.contains('world-still')) { award(d); return; }
        if (artFailed) { award(d); return; }
        if (!artReady) { message('小院里的小伙伴还在准备，稍等一下再来。'); return; }
        var m = map.getBoundingClientRect(), scale = m.width / 1536;
        // Scene anchors are in the original painting's coordinate system, not UI-label positions.
        var anchors = { berry:[153,374], fish:[780,792], chick:[937,480] };
        var anchor = anchors[d.id];
        scene.style.left = anchor[0] / 1536 * 100 + '%';
        scene.style.top = anchor[1] / 1024 * 100 + '%';
        scene.style.setProperty('--scene-scale', scale);
        scene.className = 'world-action-scene world-action--' + d.id;
        scene.innerHTML = '<div class="world-action-stage">' +
          '<i class="world-crop-rustle"></i><i class="world-action-shadow"></i>' +
          '<svg class="world-fishing-tackle" viewBox="0 0 240 210"><defs><linearGradient id="world-rod-wood" x2="1" y2="1"><stop stop-color="#cbaa70"/><stop offset="1" stop-color="#624728"/></linearGradient></defs>' +
          '<path class="world-rod" d="M47 77 Q77 37 118 32"/><path class="world-rod-grip" d="M47 77 L59 63"/><path class="world-fishing-line" d="M118 32 Q131 68 132 130"/></svg>' +
          '<i class="world-underwater-fish"></i><i class="world-action-ripple"></i><i class="world-action-ripple world-action-ripple--two"></i>' +
          '<i class="world-action-bobber"></i><i class="world-action-splash world-atlas"></i>' +
          '<span class="world-action-actor"><i class="world-atlas world-atlas--' + d.id + '"></i></span>' +
          '<span class="world-action-affection"><i></i><i></i><i></i></span>' +
          Array.from({length:7},function(_,i){return '<i class="world-action-particle" style="--i:'+i+';--dx:'+(Math.cos(i*Math.PI/3.5)*18)+'px;--dy:'+(Math.sin(i*Math.PI/3.5)*11-7)+'px"></i>';}).join('') + '</div>';
        var captions = { berry:['拨开叶子，发现一颗熟透的草莓。','轻轻摘下，叶片还在晃动。'], fish:['鱼线落进池塘，等水面轻轻一动……','咬钩了！银色的鱼背闪过水面。'], chick:['撒下一点谷粒，等小鸡慢慢走近。','它低头啄了几粒，又抬头看了看你。'] };
        message(captions[d.id][0]); root.dataset.interacting = d.id;
        button.classList.add('is-acting'); button.setAttribute('aria-busy','true');
        root.querySelectorAll('[data-discovery]').forEach(function (b) { b.setAttribute('aria-disabled','true'); });
        var reveal = d.id === 'fish' ? 2400 : d.id === 'chick' ? 1300 : 800;
        var after = d.id === 'chick' ? 2400 : 1700;
        action.start([
          { at:reveal, run:function () { scene.classList.add('is-revealed'); message(captions[d.id][1]); } },
          { at:reveal+after, run:function () { scene.classList.add('is-collected'); flyMemory(d); } },
          { at:reveal+after+900, run:function () { action.finish(); } }
        ], function () {
          if(flight) { flight.remove(); flight=null; }
          scene.className='world-action-scene'; scene.innerHTML=''; delete root.dataset.interacting;
          button.classList.remove('is-acting'); button.removeAttribute('aria-busy');
          root.querySelectorAll('[data-discovery]').forEach(function (b) { b.removeAttribute('aria-disabled'); });
          award(d);
          var pocket=$('.world-pocket'); pocket.classList.remove('is-received'); void pocket.offsetWidth; pocket.classList.add('is-received');
        });
      });
    });
    root.querySelectorAll('[data-find]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = $('[data-discovery="' + button.dataset.find + '"]');
        var d = core.discoveries.find(function (item) { return item.id === button.dataset.find; });
        root.querySelectorAll('.is-hinted').forEach(function (e) { e.classList.remove('is-hinted'); });
        clearTimeout(hintTimer); target.classList.add('is-hinted');
        target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center', inline: 'center' });
        target.focus({ preventScroll: true }); message(d.hint);
        hintTimer = setTimeout(function () { target.classList.remove('is-hinted'); }, 6000);
      });
    });
    var nightImage = $('.world-art--night');
    function setTime(night) {
      if (night && !nightImage.getAttribute('src')) nightImage.src = nightImage.dataset.src;
      root.dataset.time = night ? 'night' : 'day';
      var button = $('[data-action="time"]');
      button.setAttribute('aria-label', night ? '切换到白昼' : '切换到夜晚');
      button.innerHTML = '<span aria-hidden="true">' + (night ? '☾' : '☀') + '</span><b>' + (night ? '夜晚' : '白昼') + '</b>';
    }
    function followTheme() { if (!timeOverride) setTime(document.documentElement.getAttribute('data-user-color-scheme') === 'dark'); }
    var themeObserver = new MutationObserver(followTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-user-color-scheme'] });
    followTheme();
    $('[data-action="time"]').addEventListener('click', function () { timeOverride = true; setTime(root.dataset.time !== 'night'); });
    $('[data-action="weather"]').addEventListener('click', function () {
      var rain = root.dataset.weather !== 'rain'; root.dataset.weather = rain ? 'rain' : 'sun';
      this.setAttribute('aria-pressed', String(rain)); this.setAttribute('aria-label', rain ? '切换为晴天' : '开启小雨');
      this.innerHTML = '<span aria-hidden="true">' + (rain ? '☂' : '☁') + '</span><b>' + (rain ? '小雨' : '晴天') + '</b>';
      message(rain ? '下起了一场温柔的小雨。屋檐下有灯，花房里也很暖和。' : '雨停了，小路重新晒到了阳光。');
    });
    function syncMotion() {
      var stop = paused || reduced.matches || !visible || document.hidden;
      root.classList.toggle('world-still', stop);
      if (stop && action) action.finish();
      var button = $('[data-action="motion"]');
      button.disabled = reduced.matches;
      button.setAttribute('aria-pressed', String(paused || reduced.matches));
      button.setAttribute('aria-label', reduced.matches ? '已跟随系统减少动态' : paused ? '播放景物动效' : '暂停景物动效');
      button.innerHTML = '<span aria-hidden="true">' + (paused || reduced.matches ? '▷' : 'Ⅱ') + '</span><b>' + (reduced.matches ? '静态' : paused ? '播放' : '暂停') + '</b>';
      syncAudio();
    }
    $('[data-action="motion"]').addEventListener('click', function () { paused = !paused; try { if(storage)storage.setItem('Blog_Motion_Paused',String(paused)); } catch (_) {} syncMotion(); });
    reduced.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncMotion(); }, { threshold: 0 }).observe(root);
    $('[data-action="zoom"]').addEventListener('click', function () {
      action.finish();
      var zoomed = !viewport.classList.contains('is-zoomed'); viewport.classList.toggle('is-zoomed', zoomed);
      this.setAttribute('aria-pressed', String(zoomed)); this.textContent = zoomed ? '− 返回全景' : '＋ 放大逛逛';
      if (zoomed) { viewport.scrollTo({left:(map.scrollWidth - viewport.clientWidth) / 2, top:(map.scrollHeight - viewport.clientHeight) / 2, behavior:'auto'}); message('已放大，可以横向和纵向滑动地图。建筑和闪光仍然可以点击。'); }
      else { viewport.scrollLeft = 0; viewport.scrollTop = 0; message('回到全景。每一条小路，都通往一点新的发现。'); }
    });
    root.querySelectorAll('[data-action="notebook"], [data-action="pocket"]').forEach(function(button) { button.addEventListener('click', function () { syncFound(); notebook.showModal(); }); });
    $('.world-notebook-close').addEventListener('click', function () { notebook.close(); });
    $('.world-notebook-done').addEventListener('click', function () { notebook.close(); });
    notebook.addEventListener('click', function (e) { if (e.target === notebook) { var r = notebook.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) notebook.close(); } });
    var audio = null, audioOn = false, audioTimer = 0;
    function note(frequency, when, duration, volume) {
      var osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, when);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.15, when + duration / 2);
      gain.gain.setValueAtTime(0, when); gain.gain.linearRampToValueAtTime(volume, when + .02); gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
      osc.connect(gain); gain.connect(audio.destination); osc.start(when); osc.stop(when + duration + .05);
    }
    function chime() { if (audio && audio.state === 'running') [523,659,784].forEach(function (f,i) { note(f,audio.currentTime+i*.13,.4,.035); }); }
    function ambience() {
      clearTimeout(audioTimer); if (!audioOn || !visible || document.hidden || paused) return;
      if (audio && audio.state === 'running') { var t=audio.currentTime; note(root.dataset.time === 'night'?1100:1900,t,.16,.014); note(root.dataset.time === 'night'?1450:2600,t+.22,.12,.009); }
      audioTimer = setTimeout(ambience, 4500 + Math.random() * 5000);
    }
    function syncAudio() { clearTimeout(audioTimer); if (audioOn && visible && !document.hidden && !paused) { if (audio) audio.resume().catch(function(){}); ambience(); } else if (audio) audio.suspend().catch(function(){}); }
    $('[data-action="sound"]').addEventListener('click', function () {
      if (!audio) { var Context = window.AudioContext || window.webkitAudioContext; if (!Context) { message('当前浏览器暂不支持自然声音，仍然可以安静地逛小院。'); return; } try { audio = new Context(); } catch (_) { message('声音暂时无法开启，其他互动仍可正常使用。'); return; } }
      audioOn = !audioOn; this.setAttribute('aria-pressed', String(audioOn)); this.setAttribute('aria-label', audioOn ? '关闭自然声音' : '开启自然声音');
      this.innerHTML = '<span aria-hidden="true">♫</span><b>' + (audioOn ? '声音开' : '声音关') + '</b>'; syncAudio();
    });
    // Decorative particles are deterministic and never cover input targets.
    $('.world-fireflies').innerHTML = Array.from({length:14},function (_,i) { return '<i style="left:' + (8 + i * 37 % 86) + '%;top:' + (15 + i * 19 % 75) + '%;animation-delay:-' + (i*.71) + 's"></i>'; }).join('');
    window.addEventListener('pagehide', function () { action.finish(); clearTimeout(audioTimer); if(audio)audio.suspend().catch(function(){}); });
    window.addEventListener('pageshow', syncMotion);
    window.addEventListener('resize', function () { action.finish(); });
    syncFound(); syncMotion();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
