(function () {
  "use strict";

  var tocBody = document.querySelector("#toc .toc-body");
  if (!tocBody) {
    return;
  }

  var raf = 0;

  function activeLink() {
    return tocBody.querySelector(".tocbot-active-link") || tocBody.querySelector(".is-active-link");
  }

  function keepActiveVisible() {
    var link = activeLink();
    if (!link) {
      return;
    }
    var linkRect = link.getBoundingClientRect();
    var bodyRect = tocBody.getBoundingClientRect();
    var upper = bodyRect.top + 24;
    var lower = bodyRect.bottom - 24;

    if (linkRect.top < upper || linkRect.bottom > lower) {
      var targetTop = tocBody.scrollTop + (linkRect.top - bodyRect.top) - tocBody.clientHeight * 0.35;
      tocBody.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth"
      });
    }
  }

  function schedule() {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(keepActiveVisible);
  }

  // 只在「高亮项变化」时才把目录滚动到该项 —— 不再监听页面滚动，
  // 避免每次滚动都触发 smooth 动画导致目录抖动。
  // tocbot 切换 .is-active-link / .tocbot-active-link 时，MutationObserver 触发一次。
  var observer = new MutationObserver(schedule);
  tocBody.querySelectorAll("a").forEach(function (link) {
    observer.observe(link, { attributes: true, attributeFilter: ["class"] });
  });

  // 点击目录项：立即把高亮强制打到被点的项（修复"点击后高亮不变"——
  // tocbot 滚动监听在页面滚不到底时会把高亮回退，这里先给即时反馈）。
  window.addEventListener("hashchange", schedule);
  tocBody.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a) {
      tocBody.querySelectorAll(".is-active-link, .tocbot-active-link").forEach(function (el) {
        el.classList.remove("is-active-link");
        el.classList.remove("tocbot-active-link");
      });
      a.classList.add("is-active-link");
      a.classList.add("tocbot-active-link");
    }
    window.setTimeout(schedule, 60);
  });
  window.setTimeout(schedule, 500);
})();
