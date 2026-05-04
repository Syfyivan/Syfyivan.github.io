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

  function formatCompact(n) {
    var x = Number(n);
    if (!isFinite(x)) return "0";
    var abs = Math.abs(x);
    var sign = x < 0 ? "-" : "";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(abs >= 1e10 ? 1 : 2) + "B";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(abs >= 1e8 ? 1 : 2) + "M";
    if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "K";
    return sign + String(Math.round(abs));
  }

  function formatUSD(n) {
    var x = Number(n);
    if (!isFinite(x)) return "—";
    return "$" + x.toFixed(x >= 100 ? 0 : x >= 10 ? 1 : 2);
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

    var existing = document.getElementById("token-usage");

    // Prefer placing inside the main board (avoids covering the banner/nav).
    var boardCol = document.querySelector("#board .col-12.col-md-10.m-auto") || document.querySelector("#board") || null;
    var parent = boardCol || document.querySelector("main") || document.body;

    // If an old/cached widget exists but is in the header/banner area, move it into the board.
    if (existing) {
      var inBoard = !!(existing.closest && existing.closest("#board"));
      var inHeader = !!(existing.closest && existing.closest("header"));
      if (!inBoard && inHeader && parent && parent.insertBefore) {
        parent.insertBefore(existing, parent.firstChild);
      }
      return existing;
    }

    var box = document.createElement("div");
    box.id = "token-usage";
    box.className = "token-usage";
    box.innerHTML =
      '<div class="token-usage__title">Token Usage</div>' +
      '<div class="token-usage__subtitle" data-role="subtitle">Loading…</div>' +
      '<div class="token-usage__periods" data-role="periods"></div>' +
      '<div class="token-usage__grid" data-role="grid"></div>';

    // Insert at the top of the main content column (before the post cards), never into the banner.
    if (boardCol) {
      var firstCard = boardCol.querySelector(".index-card") || null;
      if (firstCard && firstCard.parentNode) {
        firstCard.parentNode.insertBefore(box, firstCard);
      } else {
        boardCol.insertBefore(box, boardCol.firstChild);
      }
    } else {
      parent.insertBefore(box, parent.firstChild);
    }

    return box;
  }

  function render(box, data) {
    var subtitleEl = box.querySelector('[data-role="subtitle"]');
    var periodsEl = box.querySelector('[data-role="periods"]');
    var gridEl = box.querySelector('[data-role="grid"]');

    var totalTokens = pick(data, ["total", "tokens"]) || 0;
    var inputTokens = pick(data, ["total", "input_tokens"]) || 0;
    var outputTokens = pick(data, ["total", "output_tokens"]) || 0;
    var costUSD = pick(data, ["total", "cost_usd"]);
    var codexTotal = pick(data, ["by_agent", "codex", "total_tokens"]) || pick(data, ["by_agent", "codex", "tokens"]) || 0;
    var cocoTotal = pick(data, ["by_agent", "coco", "total_tokens"]) || pick(data, ["by_agent", "coco", "tokens"]) || 0;

    var day = pick(data, ["periods", "day"]) || null;
    var week = pick(data, ["periods", "week"]) || null;
    var month = pick(data, ["periods", "month"]) || null;

    var subtitle = "已用 Token " + formatCompact(totalTokens) + "（输入 " + formatCompact(inputTokens) + " / 输出 " + formatCompact(outputTokens) + "）";
    if (typeof costUSD === "number" && isFinite(costUSD)) {
      subtitle += " · 约 " + formatUSD(costUSD);
    }
    subtitleEl.textContent = subtitle;

    if (periodsEl) {
      var ps = [
        { k: "今日", p: day },
        { k: "本周", p: week },
        { k: "本月", p: month },
      ];
      var ph = "";
      for (var j = 0; j < ps.length; j++) {
        var p = ps[j].p;
        var pt = p && typeof p === "object" ? (Number(p.tokens) || 0) : 0;
        var pi = p && typeof p === "object" ? (Number(p.input_tokens) || 0) : 0;
        var po = p && typeof p === "object" ? (Number(p.output_tokens) || 0) : 0;
        var pc = p && typeof p === "object" ? p.cost_usd : undefined;
        var hint = "Token " + formatInt(pt) + "（输入 " + formatInt(pi) + " / 输出 " + formatInt(po) + "）";
        if (typeof pc === "number" && isFinite(pc)) {
          hint += " · 约 " + formatUSD(pc);
        }
        ph += '<div class="token-usage__period" title="' + hint.replace(/"/g, "&quot;") + '">'
          + '<div class="token-usage__period-k">' + ps[j].k + '</div>'
          + '<div class="token-usage__period-v">' + formatCompact(pt) + '</div>'
          + '<div class="token-usage__period-s">输入 ' + formatCompact(pi) + ' / 输出 ' + formatCompact(po) + '</div>'
          + "</div>";
      }
      periodsEl.innerHTML = ph;
    }

    var cells = [
      { k: "Total", v: formatCompact(totalTokens), hint: formatInt(totalTokens) },
      { k: "Input", v: formatCompact(inputTokens), hint: formatInt(inputTokens) },
      { k: "Output", v: formatCompact(outputTokens), hint: formatInt(outputTokens) },
      { k: "Codex", v: formatCompact(codexTotal), hint: formatInt(codexTotal) },
      { k: "Coco", v: formatCompact(cocoTotal), hint: formatInt(cocoTotal) },
    ];

    if (typeof costUSD === "number" && isFinite(costUSD)) {
      cells.push({ k: "USD", v: formatUSD(costUSD), hint: "estimated" });
    }

    var html = "";
    for (var i = 0; i < cells.length; i++) {
      var titleAttr = cells[i].hint ? ' title="' + String(cells[i].hint).replace(/"/g, "&quot;") + '"' : "";
      html += '<div class="token-usage__cell"' + titleAttr + '><div class="token-usage__k">' +
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
