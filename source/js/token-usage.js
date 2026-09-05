(function () {
  "use strict";

  var REFRESH_INTERVAL_MS = 5 * 60 * 1000;
  var VISIBILITY_REFRESH_MIN_GAP_MS = 30 * 1000;

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
    var isHome = window.location.pathname === "/" || window.location.pathname === "/index.html";
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
      '<div class="token-usage__header">' +
      '<div class="token-usage__title">用量记录</div>' +
      '<button class="token-usage__refresh" type="button" data-role="refresh" aria-label="刷新用量记录">刷新</button>' +
      "</div>" +
      '<div class="token-usage__subtitle" data-role="subtitle">加载中...</div>' +
      '<div class="token-usage__meta" data-role="meta"></div>' +
      '<div class="token-usage__periods" data-role="periods"></div>' +
      '<div class="token-usage__grid" data-role="grid"></div>';

    // Insert inside the main content column, never into the banner.
    if (boardCol) {
      var homeShowcase = boardCol.querySelector(".home-showcase") || null;
      var paginator = boardCol.querySelector(".pagination") || null;
      var firstCard = boardCol.querySelector(".index-card") || null;
      if (homeShowcase && paginator && paginator.parentNode) {
        paginator.parentNode.insertBefore(box, paginator.nextSibling);
      } else if (firstCard && firstCard.parentNode) {
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
    var metaEl = box.querySelector('[data-role="meta"]');
    var periodsEl = box.querySelector('[data-role="periods"]');
    var gridEl = box.querySelector('[data-role="grid"]');

    var totalTokens = pick(data, ["total", "tokens"]) || 0;
    var inputTokens = pick(data, ["total", "input_tokens"]) || 0;
    var outputTokens = pick(data, ["total", "output_tokens"]) || 0;
    var costUSD = pick(data, ["total", "cost_usd"]);
    var hasCost = typeof costUSD === "number" && isFinite(costUSD);
    var codexTotal = pick(data, ["by_agent", "codex", "total_tokens"]) || pick(data, ["by_agent", "codex", "tokens"]) || 0;
    var cocoTotal = pick(data, ["by_agent", "coco", "total_tokens"]) || pick(data, ["by_agent", "coco", "tokens"]) || 0;

    var day = pick(data, ["periods", "day"]) || null;
    var week = pick(data, ["periods", "week"]) || null;
    var month = pick(data, ["periods", "month"]) || null;
    var generated = new Date(pick(data, ['generated_at']));
    var historical = !isNaN(generated.getTime()) && generated.toDateString() !== new Date().toDateString();

    var subtitle = "已用 Token " + formatCompact(totalTokens) + "（输入 " + formatCompact(inputTokens) + " / 输出 " + formatCompact(outputTokens) + "）";
    if (hasCost) {
      subtitle += " · 约 " + formatUSD(costUSD);
    } else {
      subtitle += " · 未配置单价";
    }
    subtitleEl.textContent = subtitle;

    if (metaEl) {
      var ga = pick(data, ["generated_at"]);
      var updatedText = "";
      if (typeof ga === "string" && ga) {
        var d = new Date(ga);
        if (!isNaN(d.getTime())) {
          updatedText = "更新于 " + d.toLocaleString() + (historical ? ' · 历史快照，非实时用量' : '');
        }
      }
      metaEl.textContent = updatedText || "";
    }

    if (periodsEl) {
      var ps = [
        { k: historical ? '统计当日' : '今日', p: day },
        { k: historical ? '统计当周' : '本周', p: week },
        { k: historical ? '统计当月' : '本月', p: month },
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
      { k: "总量", v: formatCompact(totalTokens), hint: formatInt(totalTokens) },
      { k: "输入", v: formatCompact(inputTokens), hint: formatInt(inputTokens) },
      { k: "输出", v: formatCompact(outputTokens), hint: formatInt(outputTokens) },
      { k: "Codex", v: formatCompact(codexTotal), hint: formatInt(codexTotal) },
      { k: "Coco", v: formatCompact(cocoTotal), hint: formatInt(cocoTotal) },
    ];

    cells.push({
      k: "费用",
      v: hasCost ? formatUSD(costUSD) : "—",
      hint: hasCost
        ? "estimated"
        : "在 GitHub Repo Variables 配置 TOKEN_PRICE_INPUT_PER_1M_USD / TOKEN_PRICE_OUTPUT_PER_1M_USD 后显示",
    });

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

  function setMeta(box, text) {
    var metaEl = box.querySelector('[data-role="meta"]');
    if (metaEl) metaEl.textContent = text || "";
  }

  function setLoading(box, loading) {
    if (!box) return;
    if (loading) box.classList.add("is-loading");
    else box.classList.remove("is-loading");
    var btn = box.querySelector('[data-role="refresh"]');
    if (btn) btn.disabled = !!loading;
  }

  function fetchAndRender(box) {
    var url = "/stats/token-usage.json?t=" + Date.now();
    setLoading(box, true);
    setMeta(box, "刷新中…");
    return fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        render(box, data);
        box.__tokenUsageLastOkAt = Date.now();
      })
      .catch(function (e) {
        // Keep previous data if any, but surface the error.
        var msg = e && e.message ? e.message : "unknown";
        setMeta(box, "刷新失败（" + msg + "）");
        var subtitleEl = box.querySelector('[data-role="subtitle"]');
        if (subtitleEl && !subtitleEl.textContent) subtitleEl.textContent = "用量记录暂不可用";
      })
      .finally(function () {
        setLoading(box, false);
      });
  }

  function run() {
    var box = ensureContainer();
    if (!box) return;

    // Manual refresh
    var btn = box.querySelector('[data-role="refresh"]');
    if (btn && !btn.__tokenUsageBound) {
      btn.__tokenUsageBound = true;
      btn.addEventListener("click", function () {
        fetchAndRender(box);
      });
    }

    // Initial load
    fetchAndRender(box);

    // Timed refresh (kept conservative for GitHub Pages)
    if (!box.__tokenUsageTimerId) {
      box.__tokenUsageTimerId = window.setInterval(function () {
        // Avoid hammering when tab is hidden.
        if (document.hidden) return;
        fetchAndRender(box);
      }, REFRESH_INTERVAL_MS);
    }

    // Refresh when user comes back to the tab.
    if (!box.__tokenUsageVisibilityBound) {
      box.__tokenUsageVisibilityBound = true;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) return;
        var lastOkAt = box.__tokenUsageLastOkAt || 0;
        if (Date.now() - lastOkAt < VISIBILITY_REFRESH_MIN_GAP_MS) return;
        fetchAndRender(box);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
