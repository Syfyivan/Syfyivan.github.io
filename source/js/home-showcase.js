(function () {
  "use strict";

  var PROJECTS = [
    {
      tone: "blue",
      label: "课程沉淀",
      title: "计网与代理",
      subtitle: "Network Proxy Course",
      desc: "把 DNS、代理模式、规则引擎、策略组和排障路径拆成一组可复习的系统课程。",
      url: "/courses/network-proxy/",
      displayUrl: "syfyivan.github.io/courses/network-proxy",
    },
    {
      tone: "rust",
      label: "用量看板",
      title: "Token 用量",
      subtitle: "Codex Usage Board",
      desc: "汇总本地 Codex 会话消耗，观察模型使用、项目节奏和长期趋势。",
      url: "#token-usage",
      displayUrl: "syfyivan.github.io/#token-usage",
    },
    {
      tone: "green",
      label: "独立游戏站",
      title: "游戏入口",
      subtitle: "Garden Games",
      desc: "麻将、协作画室和小型互动实验都收在这里，保留公开访问入口。",
      url: "/mahjong/",
      displayUrl: "syfyivan.github.io/mahjong",
    },
    {
      tone: "violet",
      label: "视觉实验",
      title: "浏览器画册",
      subtitle: "Visual Browser",
      desc: "把 AI 视觉浏览器的执行过程整理成可翻阅、可复盘的独立展示页。",
      url: "/flipbook/",
      displayUrl: "syfyivan.github.io/flipbook",
    },
  ];

  function isHomePage() {
    var path = window.location.pathname || "/";
    return path === "/" || path === "/index.html" || /\/index\.html$/.test(path);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function projectCard(project) {
    return (
      '<article class="home-project-card home-project-card--' + escapeHtml(project.tone) + '">' +
        '<div class="home-project-card__top">' +
          '<span class="home-project-card__label">' + escapeHtml(project.label) + "</span>" +
          '<span class="home-project-card__pill">独立页</span>' +
        "</div>" +
        '<div class="home-project-card__body">' +
          '<h3>' + escapeHtml(project.title) + "</h3>" +
          '<p class="home-project-card__subtitle">' + escapeHtml(project.subtitle) + "</p>" +
          '<p class="home-project-card__desc">' + escapeHtml(project.desc) + "</p>" +
        "</div>" +
        '<div class="home-project-card__bottom">' +
          '<span class="home-project-card__url">' + escapeHtml(project.displayUrl) + "</span>" +
          '<a class="home-project-card__button" href="' + escapeHtml(project.url) + '" aria-label="打开 ' + escapeHtml(project.title) + '">' +
            '<span>打开网站</span><span aria-hidden="true">↗</span>' +
          "</a>" +
        "</div>" +
      "</article>"
    );
  }

  function renderProjects() {
    var html = "";
    for (var i = 0; i < PROJECTS.length; i += 1) {
      html += projectCard(PROJECTS[i]);
    }
    return html;
  }

  function run() {
    if (!isHomePage()) return;
    var boardCol = document.querySelector("#board .col-12.col-md-10.m-auto");
    if (!boardCol || boardCol.querySelector(".home-showcase")) return;

    var firstCard = boardCol.querySelector(".index-card");
    if (!firstCard) return;

    boardCol.classList.add("home-layout");

    var showcase = document.createElement("section");
    showcase.className = "home-showcase";
    showcase.setAttribute("aria-labelledby", "home-projects-title");
    showcase.innerHTML =
      '<div class="home-showcase__heading">' +
        '<div>' +
          '<p class="home-kicker">STANDALONE PROJECTS</p>' +
          '<h2 id="home-projects-title">已独立维护的项目</h2>' +
        "</div>" +
        '<p class="home-showcase__intro">长期维护的小项目都放在这里，保留简短索引和公开地址。</p>' +
      "</div>" +
      '<a class="home-workshop-banner" href="/projects/">' +
        '<div class="home-workshop-banner__text">' +
          '<p class="home-kicker">PROJECT WORKSHOP</p>' +
          '<h3>项目工坊：每个项目一张工单，配一篇拆解教程</h3>' +
          '<p class="home-workshop-banner__desc">EPUB 阅读器、实时德扑、飞书 × Codex、自动化管线……自研项目和源码学习笔记，拆给你看怎么做。</p>' +
        "</div>" +
        '<span class="home-workshop-banner__cta"><span>进入工坊</span><span aria-hidden="true">→</span></span>' +
      "</a>" +
      '<div class="home-showcase__projects">' + renderProjects() + "</div>";

    var writingHead = document.createElement("section");
    writingHead.className = "home-writing-head";
    writingHead.setAttribute("aria-labelledby", "home-writing-title");
    writingHead.innerHTML =
      '<p class="home-kicker">LATEST WRITING</p>' +
      '<h2 id="home-writing-title">最新文章</h2>';

    boardCol.insertBefore(showcase, firstCard);
    boardCol.insertBefore(writingHead, firstCard);

    buildMeadow();
    buildVillage();
  }

  function buildMeadow() {
    var main = document.querySelector("main");
    if (!main || main.querySelector(".meadow")) return;

    var meadow = document.createElement("section");
    meadow.className = "meadow";
    meadow.innerHTML =
      '<div class="meadow__deco" aria-hidden="true"></div>' +
      '<div class="meadow__horse" aria-hidden="true"></div>' +
      '<div class="meadow__cow" aria-hidden="true"></div>' +
      '<div class="meadow__duck" aria-hidden="true"></div>' +
      '<div class="meadow__fx" aria-hidden="true"></div>';
    main.insertBefore(meadow, main.firstElementChild);
  }

  // 巴士入口指向已部署的 AI 小镇（溪山镇）首页。注意：10.37.87.203 是内网地址，
  // 仅在字节内网可访问；公网访客点击会连不上。换成公网地址后此处替换即可。
  var AI_TOWN_URL = "http://10.37.87.203:5173/ai-town/";

  var TOWN = [
    { key: "school", name: "课程", desc: "把文章串成可连续学习的课程", href: "/courses/", row: "back", pet: "sheep" },
    { key: "workshop", name: "项目工坊", desc: "每个项目一张工单，配拆解教程", href: "/projects/", row: "back", pet: null },
    { key: "wizard", name: "AI 视觉", desc: "AI 视觉浏览器的魔法画册", href: "/flipbook/", row: "back", pet: "butterfly" },
    { key: "aitown", name: "AI 小镇", desc: "坐巴士去 AI 小镇逛逛", href: AI_TOWN_URL, row: "front", pet: null, bus: true },
    { key: "about", name: "关于我", desc: "村长一凡住在这里", href: "/about/", row: "front", pet: "babychick", smoke: true },
    { key: "news", name: "晨读", desc: "每天早上的技术晨报", href: "/morning-read/", row: "front", pet: "duck" },
    { key: "painters", name: "画室", desc: "协作像素画室", href: "/painters-guild/", row: "front", pet: "fox" },
    { key: "archive", name: "归档", desc: "全部文章按时间归档", href: "/archives/", row: "front", pet: "rabbit" },
    { key: "mahjong", name: "麻将", desc: "在线麻将小游戏", href: "/mahjong/", row: "front", pet: null },
  ];

  function isExternal(href) {
    return /^https?:\/\//.test(href);
  }

  function townLot(lot) {
    var tgt = isExternal(lot.href) ? '" target="_blank" rel="noopener"' : '"';
    return (
      '<a class="town-lot town-lot--' + lot.key + ' town-lot--' + lot.row + '" href="' + lot.href + tgt + ' aria-label="' + escapeHtml(lot.name) + '：' + escapeHtml(lot.desc) + '">' +
        '<span class="town-lot__bubble">' + escapeHtml(lot.desc) + "</span>" +
        (lot.smoke ? '<span class="town-lot__smoke"></span>' : "") +
        '<span class="town-lot__house"></span>' +
        (lot.pet ? '<span class="town-lot__pet town-lot__pet--' + lot.pet + '"></span>' : "") +
        '<span class="town-lot__sign">' + escapeHtml(lot.name) + "</span>" +
      "</a>"
    );
  }

  function buildVillage() {
    var banner = document.querySelector(".banner");
    if (!banner || banner.querySelector(".village")) return;

    var lots = "";
    for (var i = 0; i < TOWN.length; i += 1) lots += townLot(TOWN[i]);

    var village = document.createElement("div");
    village.className = "village";
    village.innerHTML =
      '<div class="village__sun" aria-hidden="true"></div>' +
      '<div class="village__cloud village__cloud--a" aria-hidden="true"></div>' +
      '<div class="village__cloud village__cloud--b" aria-hidden="true"></div>' +
      '<div class="village__ground" aria-hidden="true"></div>' +
      '<div class="village__path" aria-hidden="true"></div>' +
      '<div class="village__fence" aria-hidden="true"></div>' +
      '<div class="village__tree village__tree--big village__tree--l" aria-hidden="true"></div>' +
      '<div class="village__tree village__tree--mid village__tree--l2" aria-hidden="true"></div>' +
      '<div class="village__tree village__tree--big village__tree--r" aria-hidden="true"></div>' +
      '<div class="village__tree village__tree--mid village__tree--r2" aria-hidden="true"></div>' +
      '<nav class="town" aria-label="小镇导航">' + lots + "</nav>" +
      '<div class="village__well" aria-hidden="true"></div>' +
      '<div class="village__chicken village__chicken--a" aria-hidden="true"></div>' +
      '<div class="village__chicken village__chicken--b" aria-hidden="true"></div>';
    banner.appendChild(village);

    var bannerText = banner.querySelector(".banner-text");
    if (bannerText && !bannerText.querySelector(".home-start")) {
      var start = document.createElement("div");
      start.className = "home-start";
      start.innerHTML =
        '<a class="home-start__btn" href="#board">先逛逛文章 <span aria-hidden="true">▼</span></a>';
      bannerText.appendChild(start);
    }

    startPetals(banner);
    initPlayer(banner, village);
  }

  function initPlayer(banner, village) {
    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (coarse || banner.clientWidth < 720) return;

    var meadow = document.querySelector(".meadow");
    var fx = meadow ? meadow.querySelector(".meadow__fx") : null;

    var player = document.createElement("div");
    player.className = "village__player";
    player.setAttribute("aria-hidden", "true");
    village.appendChild(player);

    var prompt = document.createElement("div");
    prompt.className = "meadow-prompt";
    if (meadow) meadow.appendChild(prompt);

    var hint = document.createElement("div");
    hint.className = "player-hint";
    hint.innerHTML =
      '<span class="player-hint__keys"><b>W</b><b>A</b><b>S</b><b>D</b></span> 控制小人走动，走进房门进板块，沿小路往下到河边';
    banner.appendChild(hint);

    var SIZE = 64;
    var SPEED = 2.7;
    var zone = "hero";
    // hero coordinates: x = left in banner, yBottom = distance from banner bottom
    var x = banner.clientWidth / 2 - SIZE / 2 + 4;
    var yBottom = 44;
    // meadow coordinates: mx = left, my = top in the meadow
    var mx = 0;
    var my = 0;
    var dirRow = 0;        // 0 down, 1 up, 2 side
    var flip = false;
    var frame = 0;
    var frameClock = 0;
    var keys = {};
    var doors = [];
    var backLine = 0;
    var frontLine = 0;
    var leaving = false;
    var moved = false;
    var armed = true;
    var fishing = false;
    var fishCool = 0;
    var puffClock = 0;

    var KEYMAP = {
      KeyW: "up", ArrowUp: "up",
      KeyS: "down", ArrowDown: "down",
      KeyA: "left", ArrowLeft: "left",
      KeyD: "right", ArrowRight: "right",
    };

    function groundHeight() {
      var g = village.querySelector(".village__ground");
      return g ? g.clientHeight : 320;
    }

    function computeDoors() {
      doors = [];
      backLine = 0;
      frontLine = 0;
      var bannerRect = banner.getBoundingClientRect();
      var lots = village.querySelectorAll(".town-lot");
      for (var i = 0; i < lots.length; i += 1) {
        var r = lots[i].getBoundingClientRect();
        var foot = r.bottom - bannerRect.top;
        if (lots[i].classList.contains("town-lot--back")) {
          backLine = Math.max(backLine, foot);
        } else {
          frontLine = Math.max(frontLine, foot);
        }
        doors.push({
          href: lots[i].getAttribute("href"),
          external: lots[i].target === "_blank",
          x1: r.left - bannerRect.left + r.width * 0.3,
          x2: r.left - bannerRect.left + r.width * 0.7,
          y1: foot - 10,
          y2: foot + 20,
          el: lots[i],
        });
      }
    }

    // pond and picnic zones in meadow-local coordinates (deco is 1680 wide, centered)
    function meadowZones() {
      if (!meadow) return { pond: null, picnic: null };
      var ox = meadow.clientWidth / 2 - 840;
      var water = { x1: ox + 138, x2: ox + 430, y1: 222, y2: 392 };
      return {
        // the pond water is solid; the fishing zone is the bank ringing it,
        // so you can fish from any side and the rod follows your facing
        water: water,
        pond: { x1: water.x1 - 44, x2: water.x2 + 44, y1: water.y1 - 44, y2: water.y2 + 44 },
        picnic: { x1: ox + 910, x2: ox + 1060, y1: 372, y2: 500 },
      };
    }

    function inZone(z, fx2, fy2) {
      return z && fx2 > z.x1 && fx2 < z.x2 && fy2 > z.y1 && fy2 < z.y2;
    }

    function worldVisible() {
      var top = banner.getBoundingClientRect().top;
      var bottom = meadow ? meadow.getBoundingClientRect().bottom : banner.getBoundingClientRect().bottom;
      return bottom > 160 && top < window.innerHeight - 120;
    }

    function onKey(down) {
      return function (e) {
        var dir = KEYMAP[e.code];
        var isAction = e.code === "Space" || e.code === "KeyE" || e.code === "Enter";
        if (!dir && !isAction) return;
        if (!worldVisible()) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        if (dir) keys[dir] = down;
        if (isAction) keys.action = down;
        if (down && !moved) {
          moved = true;
          hint.classList.add("player-hint--fade");
        }
      };
    }

    function setZone(next) {
      zone = next;
      if (next === "meadow") {
        meadow.appendChild(player);
        player.style.bottom = "auto";
        player.style.top = "0";
        player.style.zIndex = 6;
        var top = meadow.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top - 110, behavior: "smooth" });
      } else {
        village.appendChild(player);
        player.style.top = "auto";
        player.style.bottom = "0";
        var btop = banner.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: btop + banner.clientHeight - window.innerHeight + 80, behavior: "smooth" });
      }
    }

    function renderHero() {
      player.style.transform = "translate(" + Math.round(x) + "px, " + -Math.round(yBottom) + "px)" + (flip ? " scaleX(-1)" : "");
      player.style.backgroundPosition = -(frame * SIZE) + "px " + -(dirRow * SIZE) + "px";
      var footY = banner.clientHeight - yBottom - 4;
      player.style.zIndex = footY > frontLine - 14 ? 5 : footY > backLine - 14 ? 3 : 1;
    }

    function renderMeadow() {
      player.style.transform = "translate(" + Math.round(mx) + "px, " + Math.round(my) + "px)" + (flip ? " scaleX(-1)" : "");
      player.style.backgroundPosition = -(frame * SIZE) + "px " + -(dirRow * SIZE) + "px";
    }

    function spawnFx(cls, lx, ly, life) {
      if (!fx) return null;
      var el = document.createElement("div");
      el.className = cls;
      el.style.left = lx + "px";
      el.style.top = ly + "px";
      fx.appendChild(el);
      if (life) setTimeout(function () { el.remove(); }, life);
      return el;
    }

    function startFishing(zonePond) {
      fishing = true;
      keys = {};
      // cast in whatever direction the player is currently facing
      var vx = 0, vy = 0;
      if (dirRow === 2) vx = flip ? -1 : 1;
      else vy = dirRow === 1 ? -1 : 1;
      renderMeadow();

      var castDist = 66;
      var handX = mx + SIZE / 2, handY = my + 32;
      var floatX = handX + vx * castDist, floatY = handY + vy * castDist;

      var line = spawnFx("meadow-fish__line", 0, 0);
      if (line) {
        line.style.left = handX + "px";
        line.style.top = handY + "px";
        line.style.width = castDist + "px";
        line.style.transform = "rotate(" + (Math.atan2(vy, vx) * 180 / Math.PI) + "deg)";
      }
      var splash = spawnFx("meadow-fish__splash", floatX - 32, floatY - 16);
      prompt.className = "meadow-prompt meadow-prompt--show meadow-prompt--wait";
      prompt.textContent = "抛竿中…";
      positionPrompt();
      setTimeout(function () {
        if (line) line.remove();
        if (splash) splash.remove();
        spawnFx("meadow-fish__catch", mx + SIZE / 2 - 24, my - 14, 1500);
        for (var i = 0; i < 5; i += 1) {
          (function (k) {
            spawnFx("meadow-sparkle", mx + 12 + k * 9, my - 6 - (k % 2) * 8, 700);
          })(i);
        }
        prompt.textContent = "🎣 钓到一条鱼！";
        setTimeout(function () {
          fishing = false;
          fishCool = nowTs() + 1200;
          prompt.className = "meadow-prompt";
        }, 1100);
      }, 1100);
    }

    function positionPrompt() {
      prompt.style.left = Math.round(mx + SIZE / 2) + "px";
      prompt.style.top = Math.round(my - 8) + "px";
    }

    function nowTs() {
      return (window.performance && performance.now()) ? performance.now() : +new Date();
    }

    function updateHero(now, dx, dy) {
      var moving = dx !== 0 || dy !== 0;
      if (moving) {
        if (dx !== 0) { dirRow = 2; flip = dx < 0; }
        else { dirRow = dy > 0 ? 1 : 0; }
        var norm = dx !== 0 && dy !== 0 ? 0.7071 : 1;
        x += dx * SPEED * norm;
        yBottom += dy * SPEED * norm;
        x = Math.max(-8, Math.min(banner.clientWidth - SIZE + 8, x));
        yBottom = Math.max(2, Math.min(groundHeight() - 26, yBottom));

        if (now - frameClock > 110) { frame = (frame + 1) % 6; frameClock = now; }

        var footX = x + SIZE / 2;
        var footY = banner.clientHeight - yBottom - 4;

        // descend onto the meadow path (walking down = dy < 0)
        if (meadow && dy < 0 && yBottom <= 2 && Math.abs(footX - banner.clientWidth / 2) < 100) {
          mx = meadow.clientWidth / 2 - SIZE / 2;
          my = 2;
          dirRow = 0;
          setZone("meadow");
          return;
        }

        var inAnyDoor = false;
        for (var i = 0; i < doors.length; i += 1) {
          var d = doors[i];
          if (footX > d.x1 && footX < d.x2 && footY > d.y1 && footY < d.y2) {
            inAnyDoor = true;
            if (!armed) break;
            armed = false;
            d.el.classList.add("town-lot--entering");
            if (d.external) {
              window.open(d.href, "_blank", "noopener");
              (function (el) { setTimeout(function () { el.classList.remove("town-lot--entering"); }, 600); })(d.el);
              break;
            }
            leaving = true;
            player.classList.add("village__player--enter");
            setTimeout(function (href) { return function () { window.location.assign(href); }; }(d.href), 320);
            renderHero();
            return;
          }
        }
        if (!inAnyDoor) armed = true;
      } else {
        frame = 0;
      }
      renderHero();
    }

    function updateMeadow(now, dx, dy) {
      var zones = meadowZones();
      var fxX = mx + SIZE / 2;
      var fyY = my + SIZE - 8;
      var atPond = inZone(zones.pond, fxX, fyY);
      var atPicnic = inZone(zones.picnic, fxX, fyY);

      if (fishing) { renderMeadow(); return; }

      if (keys.action && atPond && now > fishCool) {
        keys.action = false;
        startFishing(zones.pond);
        return;
      }

      var moving = dx !== 0 || dy !== 0;
      if (moving) {
        if (dx !== 0) { dirRow = 2; flip = dx < 0; }
        else { dirRow = dy > 0 ? 1 : 0; }
        var norm = dx !== 0 && dy !== 0 ? 0.7071 : 1;
        var prevX = mx, prevY = my;
        mx += dx * SPEED * norm;
        my -= dy * SPEED * norm; // meadow is top-anchored: up (dy>0) decreases my
        mx = Math.max(-6, Math.min(meadow.clientWidth - SIZE + 6, mx));
        my = Math.max(-2, Math.min(meadow.clientHeight - SIZE - 6, my));

        // the pond water is solid — block the foot from entering it (axis-wise)
        if (zones.water) {
          var ftX = mx + SIZE / 2, ftY = my + SIZE - 8;
          if (ftX > zones.water.x1 && ftX < zones.water.x2 && ftY > zones.water.y1 && ftY < zones.water.y2) {
            var ftXprev = prevX + SIZE / 2;
            if (!(ftXprev > zones.water.x1 && ftXprev < zones.water.x2)) mx = prevX;
            else my = prevY;
          }
        }

        if (now - frameClock > 110) { frame = (frame + 1) % 6; frameClock = now; }

        // climb back up to the town (walking up = dy > 0)
        if (dy > 0 && my <= 0 && Math.abs(fxX - meadow.clientWidth / 2) < 110) {
          x = banner.clientWidth / 2 - SIZE / 2 + 4;
          yBottom = 6;
          dirRow = 1;
          setZone("hero");
          return;
        }

        // grass / petal puffs while wandering
        if (now - puffClock > 360) {
          puffClock = now;
          spawnFx("meadow-sparkle meadow-sparkle--petal", mx + 18 + (frame % 3) * 8, my + SIZE - 18, 650);
        }
      } else {
        frame = 0;
      }

      // contextual prompt
      if (atPond && now > fishCool) {
        prompt.className = "meadow-prompt meadow-prompt--show";
        prompt.textContent = "按 空格 钓鱼";
        positionPrompt();
      } else if (atPicnic) {
        prompt.className = "meadow-prompt meadow-prompt--show meadow-prompt--rest";
        prompt.textContent = "♪ 在野餐垫上歇会儿";
        positionPrompt();
      } else {
        prompt.className = "meadow-prompt";
      }

      renderMeadow();
    }

    function tick(now) {
      if (leaving) { return; }
      var dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      var dy = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
      if (zone === "hero") updateHero(now, dx, dy);
      else updateMeadow(now, dx, dy);
      requestAnimationFrame(tick);
    }

    // Coming back via the browser's back button restores the page from
    // bfcache with `leaving` still true and the animation loop stopped —
    // the player would be frozen mid-exit. Reset and restart on return.
    window.addEventListener("pageshow", function () {
      if (!leaving) return;
      leaving = false;
      armed = false; // re-arm only after the player steps off the door
      keys = {};
      fishing = false;
      player.classList.remove("village__player--enter");
      var ent = document.querySelector(".town-lot--entering");
      if (ent) ent.classList.remove("town-lot--entering");
      requestAnimationFrame(tick);
    });

    computeDoors();
    renderHero();
    window.addEventListener("resize", computeDoors);
    document.addEventListener("keydown", onKey(true));
    document.addEventListener("keyup", onKey(false));
    requestAnimationFrame(tick);
  }

  function startPetals(banner) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var canvas = document.createElement("canvas");
    canvas.className = "village__petals";
    banner.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var petals = [];
    var COUNT = 28;

    function isDark() {
      return document.documentElement.getAttribute("data-user-color-scheme") === "dark";
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = banner.clientWidth * dpr;
      canvas.height = banner.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(randomY) {
      return {
        x: Math.random() * banner.clientWidth,
        y: randomY ? Math.random() * banner.clientHeight : -12,
        size: 4 + Math.random() * 5,
        fall: 0.35 + Math.random() * 0.65,
        drift: 0.4 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: 0.01 + Math.random() * 0.025,
      };
    }

    for (var i = 0; i < COUNT; i += 1) petals.push(spawn(true));

    function tick() {
      if (document.hidden) {
        requestAnimationFrame(tick);
        return;
      }
      var w = banner.clientWidth;
      var h = banner.clientHeight;
      ctx.clearRect(0, 0, w, h);
      var dark = isDark();
      for (var i = 0; i < petals.length; i += 1) {
        var p = petals[i];
        p.phase += 0.012;
        p.spin += p.spinSpeed;
        p.y += p.fall;
        p.x += Math.sin(p.phase) * p.drift;
        if (p.y > h + 14 || p.x < -20 || p.x > w + 20) petals[i] = p = spawn(false);
        ctx.save();
        ctx.translate(p.x, p.y);
        if (dark) {
          ctx.fillStyle = "rgba(240, 246, 255, 0.85)";
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.rotate(p.spin);
          ctx.fillStyle = "rgba(255, 170, 192, 0.82)";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
