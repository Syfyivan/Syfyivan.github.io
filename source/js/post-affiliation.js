(function () {
  "use strict";

  var path = window.location.pathname;
  var slug = path.split("/").filter(Boolean).pop() || "";
  var titleNode = document.querySelector('meta[property="og:title"]');
  var title = cleanText((titleNode && titleNode.getAttribute("content")) || document.title);
  var tags = Array.from(document.querySelectorAll('meta[property="article:tag"]')).map(function (node) {
    return node.getAttribute("content") || "";
  });
  var section = (document.querySelector('meta[property="article:section"]') || {}).content || "";
  var info = classify();

  highlightNav(info.navHref);
  insertAffiliation(info);

  function cleanText(value) {
    return String(value || "").replace(/\s+-\s+一凡的博客\s*$/, "").trim();
  }

  function includesAny(values, needles) {
    var text = values.join(" ").toLowerCase();
    return needles.some(function (needle) {
      return text.indexOf(needle.toLowerCase()) >= 0;
    });
  }

  function classify() {
    var haystack = [path, slug, title, section].concat(tags);

    if (path === "/" || path.indexOf("/page/") === 0) {
      return { navHref: "/", path: [] };
    }
    if (path.indexOf("/editor/") === 0) {
      return { navHref: "/editor/", path: [] };
    }
    if (path.indexOf("/projects/") === 0 || includesAny(haystack, ["project-workshop", "项目工坊"])) {
      return {
        navHref: "/projects/",
        path: [
          { label: "项目工坊", href: "/projects/" },
          { label: includesAny(haystack, ["源码学习"]) ? "源码学习" : "项目拆解" },
          { label: title || "项目文章" }
        ]
      };
    }
    if (path.indexOf("/morning-read/") === 0 || slug.indexOf("x-tech-morning-read") === 0) {
      return {
        navHref: "/morning-read/",
        path: [
          { label: "晨读", href: "/morning-read/" },
          { label: "每日技术窗口" },
          { label: title || "晨读文章" }
        ]
      };
    }
    if (path.indexOf("/courses/ai-agent-fables/") === 0) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "AI 与 Agent", href: "/courses/#ai" },
          { label: "AI 与 Agent 大寓言课" }
        ]
      };
    }
    if (path.indexOf("/courses/") === 0 || includesAny(haystack, ["agent-harness-fables", "agent harness 寓言课", "multi-agent", "ai-town", "go-server", "network-proxy", "服务端学习", "计网与代理"])) {
      return courseInfo(haystack);
    }
    if (path.indexOf("/flipbook/") === 0 || path.indexOf("/mahjong/") === 0 || path.indexOf("/painters-guild/") === 0) {
      return {
        navHref: "/flipbook/",
        path: [
          { label: "作品" },
          { label: title || "可运行作品" }
        ]
      };
    }
    if (includesAny(haystack, ["lynx", "reactlynx", "前端", "前端工程", "sdui", "lottie", "canvas", "客户端"])) {
      return {
        navHref: "/categories/",
        path: [
          { label: "技术笔记", href: "/categories/" },
          { label: "前端与客户端", href: "/courses/#client" },
          { label: topicLabel(haystack, "前端工程") }
        ]
      };
    }
    if (includesAny(haystack, ["go", "服务端", "redis", "mq", "rpc", "网络", "proxy", "代理", "dns", "tls"])) {
      return {
        navHref: "/categories/",
        path: [
          { label: "技术笔记", href: "/categories/" },
          { label: "服务端与网络", href: "/courses/#backend" },
          { label: topicLabel(haystack, "工程笔记") }
        ]
      };
    }
    if (includesAny(haystack, ["ai", "agent", "mcp", "claude", "openai", "codex"])) {
      return {
        navHref: "/categories/",
        path: [
          { label: "技术笔记", href: "/categories/" },
          { label: "AI 与 Agent", href: "/courses/#ai" },
          { label: topicLabel(haystack, "AI 工程") }
        ]
      };
    }
    return {
      navHref: "/categories/",
      path: [
        { label: "技术笔记", href: "/categories/" },
        { label: section || "文章" },
        { label: title || "当前文章" }
      ]
    };
  }

  function courseInfo(haystack) {
    if (includesAny(haystack, ["agent-harness-fables", "agent harness 寓言课"])) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "AI 与 Agent", href: "/courses/#ai" },
          { label: "AI 与 Agent 大寓言课", href: "/courses/ai-agent-fables/" },
          { label: "Agent Harness 寓言课", href: "/courses/agent-harness-fables/" }
        ]
      };
    }
    if (includesAny(haystack, ["multi-agent", "多agent", "多 agent"])) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "AI 与 Agent", href: "/courses/#ai" },
          { label: "多 Agent 编排", href: "/courses/multi-agent-orchestration/" }
        ]
      };
    }
    if (includesAny(haystack, ["ai-town", "ai town"])) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "AI 与 Agent", href: "/courses/#ai" },
          { label: "AI Town", href: "/courses/ai-town/" }
        ]
      };
    }
    if (includesAny(haystack, ["go-server", "服务端学习"])) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "服务端与网络", href: "/courses/#backend" },
          { label: "Go 与服务端", href: "/courses/server-side/" }
        ]
      };
    }
    if (includesAny(haystack, ["network-proxy", "计网与代理"])) {
      return {
        navHref: "/courses/",
        path: [
          { label: "课程", href: "/courses/" },
          { label: "服务端与网络", href: "/courses/#backend" },
          { label: "计网与代理", href: "/courses/network-proxy/" }
        ]
      };
    }
    return {
      navHref: "/courses/",
      path: [
        { label: "课程", href: "/courses/" },
        { label: title || "课程页" }
      ]
    };
  }

  function topicLabel(haystack, fallback) {
    if (includesAny(haystack, ["sdui"])) return "SDUI";
    if (includesAny(haystack, ["lottie", "animax"])) return "动效";
    if (includesAny(haystack, ["lynx", "reactlynx"])) return "Lynx";
    if (includesAny(haystack, ["canvas"])) return "Canvas";
    if (includesAny(haystack, ["mcp"])) return "MCP";
    if (includesAny(haystack, ["codex"])) return "Codex";
    if (includesAny(haystack, ["claude"])) return "Claude";
    return fallback;
  }

  function highlightNav(href) {
    if (!href) return;
    var links = document.querySelectorAll("#navbar a.nav-link, #navbar a.dropdown-item, #navbar a");
    links.forEach(function (link) {
      var linkPath = new URL(link.getAttribute("href") || "", window.location.origin).pathname;
      if (linkPath === href) {
        link.classList.add("yf-nav-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function insertAffiliation(info) {
    if (!info.path || !info.path.length || document.querySelector(".yf-affiliation-bar")) {
      return;
    }
    var content = document.querySelector(".post-content") || document.querySelector(".markdown-body");
    if (!content || !content.parentElement) {
      return;
    }
    var bar = document.createElement("nav");
    bar.className = "yf-affiliation-bar";
    bar.setAttribute("aria-label", "文章归属");
    bar.innerHTML = [
      '<span class="yf-affiliation-kicker">You are here</span>',
      '<ol class="yf-affiliation-path">',
      info.path.map(function (item, index) {
        var label = escapeHtml(item.label);
        var body = item.href && index !== info.path.length - 1
          ? '<a href="' + escapeAttribute(item.href) + '">' + label + "</a>"
          : "<strong>" + label + "</strong>";
        return "<li>" + body + "</li>";
      }).join(""),
      "</ol>"
    ].join("");
    content.parentElement.insertBefore(bar, content);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }
})();
