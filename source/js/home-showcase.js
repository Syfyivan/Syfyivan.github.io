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

    buildVillage();
  }

  function buildVillage() {
    var banner = document.querySelector(".banner");
    if (!banner || banner.querySelector(".village")) return;

    var village = document.createElement("div");
    village.className = "village";
    village.setAttribute("aria-hidden", "true");
    village.innerHTML =
      '<div class="village__sun"></div>' +
      '<div class="village__cloud village__cloud--a"></div>' +
      '<div class="village__cloud village__cloud--b"></div>' +
      '<div class="village__ground"></div>' +
      '<div class="village__fence"></div>' +
      '<div class="village__tree village__tree--big village__tree--l"></div>' +
      '<div class="village__tree village__tree--mid village__tree--l2"></div>' +
      '<div class="village__house"></div>' +
      '<div class="village__tree village__tree--big village__tree--r"></div>' +
      '<div class="village__tree village__tree--mid village__tree--r2"></div>' +
      '<div class="village__chicken village__chicken--a"></div>' +
      '<div class="village__chicken village__chicken--b"></div>' +
      '<div class="village__walker"></div>';
    banner.appendChild(village);

    var bannerText = banner.querySelector(".banner-text");
    if (bannerText && !bannerText.querySelector(".home-start")) {
      var start = document.createElement("div");
      start.className = "home-start";
      start.innerHTML =
        '<a class="home-start__btn home-start__btn--primary" href="/projects/"><span aria-hidden="true">▶</span> 进入项目工坊</a>' +
        '<a class="home-start__btn" href="#board">先逛逛文章 <span aria-hidden="true">▼</span></a>';
      bannerText.appendChild(start);
    }

    startPetals(banner);
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
