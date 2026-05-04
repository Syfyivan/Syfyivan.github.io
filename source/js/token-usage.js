(function () {
  "use strict";

  function formatInt(n) {
    var x = Number(n);
    if (!isFinite(x)) return "0";
    try {
      return x.toLocaleString("en-US");
    } catch (e) {
      return String(Math.trunc(x));
    }
  }

  function pick(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (!cur || typeof cur !== "object") return undefined;
      cur = cur[path[i]];
    }
    return cur;
  }

  function ensureContainer() {
    // Home page only.
    var isHome = window.location.pathname === "/" || /\/index\.html$/.test(window.location.pathname);
    if (!isHome) return null;

    // Try to place inside banner first.
    var banner = document.querySelector("header .banner, .banner, .index-img");
    var parent = banner || document.querySelector("main") || document.body;

    var existing = document.getElementById("token-usage");
    if (existing) return existing;

    var box = document.createElement("div");
    box.id = "token-usage";
    box.className = "token-usage";
    box.innerHTML =
      '<div class="token-usage__title">Token Usage</div>' +
      '<div class="token-usage__subtitle" data-role="subtitle">Loading…</div>' +
      '<div class="token-usage__grid" data-role="grid"></div>';

    if (banner) {
      // Put after existing subtitle if possible, otherwise append.
      var subtitle = banner.querySelector(".subtitle, .banner-subtitle, .index-info .subtitle");
      if (subtitle && subtitle.parentNode) {
        subtitle.parentNode.insertBefore(box, subtitle.nextSibling);
      } else {
        parent.appendChild(box);
      }
    } else {
      parent.insertBefore(box, parent.firstChild);
    }

    return box;
  }

  function render(box, data) {
    var subtitleEl = box.querySelector('[data-role="subtitle"]');
    var gridEl = box.querySelector('[data-role="grid"]');

    var totalTokens = pick(data, ["total", "tokens"]) || 0;
    var inputTokens = pick(data, ["total", "input_tokens"]) || 0;
    var outputTokens = pick(data, ["total", "output_tokens"]) || 0;
    var codexTotal = pick(data, ["by_agent", "codex", "total_tokens"]) || pick(data, ["by_agent", "codex", "tokens"]) || 0;
    var cocoTotal = pick(data, ["by_agent", "coco", "total_tokens"]) || pick(data, ["by_agent", "coco", "tokens"]) || 0;

    var subtitle = data && data.subtitle ? String(data.subtitle) :
      ("已用 Token " + formatInt(totalTokens) + "（输入 " + formatInt(inputTokens) + " / 输出 " + formatInt(outputTokens) + "）");
    subtitleEl.textContent = subtitle;

    var cells = [
      { k: "Total", v: formatInt(totalTokens) },
      { k: "Input", v: formatInt(inputTokens) },
      { k: "Output", v: formatInt(outputTokens) },
      { k: "Codex", v: formatInt(codexTotal) },
      { k: "Coco", v: formatInt(cocoTotal) },
    ];

    var html = "";
    for (var i = 0; i < cells.length; i++) {
      html += '<div class="token-usage__cell"><div class="token-usage__k">' +
        cells[i].k +
        '</div><div class="token-usage__v">' +
        cells[i].v +
        "</div></div>";
    }
    gridEl.innerHTML = html;
  }

  function run() {
    var box = ensureContainer();
    if (!box) return;

    var url = "/stats/token-usage.json";
    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        render(box, data);
      })
      .catch(function () {
        var subtitleEl = box.querySelector('[data-role="subtitle"]');
        if (subtitleEl) subtitleEl.textContent = "Token Usage 暂不可用";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

