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

  var observer = new MutationObserver(schedule);
  tocBody.querySelectorAll("a").forEach(function (link) {
    observer.observe(link, { attributes: true, attributeFilter: ["class"] });
  });

  window.addEventListener("scroll", schedule, { passive: true });
  document.addEventListener("scroll", schedule, { passive: true, capture: true });
  if (document.body) {
    document.body.addEventListener("scroll", schedule, { passive: true });
  }
  window.addEventListener("hashchange", schedule);
  window.setTimeout(schedule, 500);
})();
