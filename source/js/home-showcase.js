(function () {
  "use strict";

  var PROJECTS = [
    {
      tone: "green",
      label: "阅读训练",
      title: "一目 · 阅读实验室",
      subtitle: "Reading Lab",
      desc: "闪视词语、滚读故事、寻找数字，用短练习探索阅读节奏，支持导入自己的词库。",
      url: "/reading-lab/",
      displayUrl: "syfyivan.github.io/reading-lab",
    },
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
      tone: "blue",
      label: "桥接器控制面 · 内网",
      title: "Bridge Viewer",
      subtitle: "Task Session Viewer",
      desc: "飞书机器人任务进度的可视化入口，用 Goofy Preview 分享给内网同事查看。",
      url: "https://bridge-task-viewer-syf.gf-preview.bytedance.net",
      displayUrl: "bridge-task-viewer-syf.gf-preview.bytedance.net",
      external: true,
      access: "需内网",
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
    return path === "/" || path === "/index.html";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function projectCard(project) {
    var linkAttrs = project.external ? ' target="_blank" rel="noopener"' : "";
    return (
      '<article class="home-project-card home-project-card--' + escapeHtml(project.tone) + '">' +
        '<div class="home-project-card__top">' +
          '<span class="home-project-card__label">' + escapeHtml(project.label) + "</span>" +
          '<span class="home-project-card__pill">' + (project.access || '公开访问') + '</span>' +
        "</div>" +
        '<div class="home-project-card__body">' +
          '<h3>' + escapeHtml(project.title) + "</h3>" +
          '<p class="home-project-card__subtitle">' + escapeHtml(project.subtitle) + "</p>" +
          '<p class="home-project-card__desc">' + escapeHtml(project.desc) + "</p>" +
        "</div>" +
        '<div class="home-project-card__bottom">' +
          '<span class="home-project-card__url">' + escapeHtml(project.displayUrl) + "</span>" +
          '<a class="home-project-card__button" href="' + escapeHtml(project.url) + '"' + linkAttrs + ' aria-label="打开 ' + escapeHtml(project.title) + '">' +
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
          '<p class="home-kicker">THE WORKBENCH</p>' +
          '<h2 id="home-projects-title">小院里的作品</h2>' +
        "</div>" +
        '<p class="home-showcase__intro">学习、创造，也偶尔玩一会儿</p>' +
      "</div>" +
      '<a class="home-workshop-banner" href="/projects/">' +
        '<div class="home-workshop-banner__text">' +
          '<p class="home-kicker">FROM SEED TO SOMETHING</p>' +
          '<h3>项目工坊 · 把想法做成真的</h3>' +
          '<p class="home-workshop-banner__desc">EPUB 阅读器、实时德扑、飞书 × Codex、自动化管线……自研项目和源码学习笔记，拆给你看怎么做。</p>' +
        "</div>" +
        '<span class="home-workshop-banner__cta"><span>进入工坊</span><span aria-hidden="true">→</span></span>' +
      "</a>" +
      '<div class="home-showcase__projects">' + renderProjects() + "</div>";

    var writingHead = document.createElement("section");
    writingHead.className = "home-writing-head";
    writingHead.id = "latest-writing";
    writingHead.setAttribute("aria-labelledby", "home-writing-title");
    writingHead.innerHTML =
      '<p class="home-kicker">FIELD NOTES</p>' +
      '<h2 id="home-writing-title">最近的手帐</h2>' +
      '<a class="home-all-posts" href="/archives/">全部文章 <span aria-hidden="true">↗</span></a>';

    boardCol.insertBefore(showcase, firstCard);
    boardCol.insertBefore(writingHead, firstCard);

    buildJournal();
  }

  function buildJournal() {
    document.body.classList.add('home-journal');
    var icons = ['book', 'sprout', 'jar', 'letter', 'chicken', 'flower'];
    document.querySelectorAll('.home-project-card').forEach(function(card, i) {
      var icon = document.createElement('img');
      icon.className = 'journal-project-icon'; icon.alt = ''; icon.width = 40; icon.height = 40;
      icon.src = '/img/journal/' + icons[i % icons.length] + '.svg';
      card.querySelector('.home-project-card__body').prepend(icon);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
