/**
 * 课程文章头图：随章节/文章自动变化的动画卡片图案。
 * 作用范围：博客内的「课程」系列文章与课程目录页（AI 与 Agent、Agent Harness、
 * AI Town、多 Agent 编排、服务端、计网与代理、软件质量寓言版/修仙版/对比文）。
 * 非课程文章（晨读、项目工坊、桌宠、工具箱等）不受影响。
 *
 * 做法：识别文章所属课程系列 → 取该系列基色 → 按文章里的序号（或 slug 哈希）
 * 偏移色相、轮换纹理变体 → 给 #banner 加 .sqc-banner 并写入 CSS 变量；
 * 具体样式见 /css/course-banner.css。
 */
(function () {
  // 各课程系列的基色（hue, saturation%）。顺序即匹配优先级。
  var SERIES = [
    { key: "sq-compare", needles: ["software-quality-two-styles", "软件质量与测试·对比"], h: 30, s: 54 },
    { key: "sq-xianxia", needles: ["software-quality-xianxia", "质道九境", "修仙版"], h: 262, s: 46 },
    { key: "sq-fables", needles: ["software-quality-fables", "软件质量与测试大寓言", "榫卯镇"], h: 158, s: 40 },
    { key: "ai-fables", needles: ["ai-agent-fables", "ai 与 agent 大寓言", "会分类的农夫"], h: 214, s: 44 },
    { key: "agent-harness", needles: ["agent-harness-fables", "agent harness"], h: 192, s: 42 },
    { key: "ai-town", needles: ["ai-town", "ai town"], h: 286, s: 44 },
    { key: "multi-agent", needles: ["multi-agent", "多 agent", "多agent", "多 智能体"], h: 332, s: 46 },
    { key: "network-proxy", needles: ["network-proxy", "计网与代理", "代理工具"], h: 18, s: 52 },
    { key: "server-side", needles: ["server-side", "go-server", "服务端", "go 与服务端"], h: 142, s: 40 }
  ];

  function meta(prop) {
    var n = document.querySelector('meta[property="' + prop + '"]');
    return (n && n.getAttribute("content")) || "";
  }

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function init() {
    var banner = document.getElementById("banner");
    if (!banner) return;

    var path = decodeURIComponent(location.pathname || "");
    var slug = path.split("/").filter(Boolean).pop() || "";
    var tags = Array.prototype.map
      .call(document.querySelectorAll('meta[property="article:tag"]'), function (n) {
        return n.getAttribute("content") || "";
      })
      .join(" ");
    var haystack = [path, slug, meta("og:title") || document.title, meta("article:section"), tags]
      .join(" ")
      .toLowerCase();

    // 找到所属课程系列；都不匹配则不是课程文章，直接退出
    var series = null;
    for (var i = 0; i < SERIES.length; i++) {
      var ns = SERIES[i].needles;
      for (var j = 0; j < ns.length; j++) {
        if (haystack.indexOf(ns[j].toLowerCase()) >= 0) {
          series = SERIES[i];
          break;
        }
      }
      if (series) break;
    }
    if (!series) return;

    // 文章序号：优先用 slug 里的数字（讲号/章号），否则用 slug 哈希，保证逐篇不同
    var nums = slug.match(/\d+/g);
    var ord;
    if (nums && nums.length) {
      ord = parseInt(nums[0], 10) * 5 + (nums[1] ? parseInt(nums[1], 10) : 0);
    } else {
      ord = hashStr(slug) % 20;
    }

    // 在该系列基色 ±40° 的色带内逐篇取一个不同的色相：
    // 既保留课程的整体色彩识别度，又让每一讲明显不同。
    var hue = ((series.h + ((ord * 37) % 81) - 40) % 360 + 360) % 360;
    var hue2 = (hue + 28) % 360;
    var variant = ord % 4; // 4 种卡片纹理轮换

    document.documentElement.classList.add("sqc-on");
    banner.classList.add("sqc-banner");
    banner.setAttribute("data-sqc-variant", String(variant));
    banner.style.setProperty("--sqc-h", String(hue));
    banner.style.setProperty("--sqc-h2", String(hue2));
    banner.style.setProperty("--sqc-s", series.s + "%");
  }

  if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
