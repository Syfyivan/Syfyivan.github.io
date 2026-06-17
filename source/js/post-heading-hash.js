(function () {
  "use strict";

  var INITIAL_HASH_GRACE_MS = 1500;
  var initialHash = window.location.hash || "";
  var startedAt = Date.now();
  var headings = [];
  var scheduled = false;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function currentHashId() {
    var hash = window.location.hash || "";
    if (!hash || hash === "#") return "";
    try {
      return decodeURIComponent(hash.slice(1));
    } catch (e) {
      return hash.slice(1);
    }
  }

  function replaceHash(id) {
    if (!window.history || typeof window.history.replaceState !== "function") return;
    if ((id || "") === currentHashId()) return;

    var url = new URL(window.location.href);
    url.hash = id || "";
    window.history.replaceState(window.history.state, document.title, url.pathname + url.search + url.hash);
  }

  function topOffset() {
    var navbar = document.getElementById("navbar");
    var navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
    return Math.max(72, Math.round(navHeight + 24));
  }

  function activationOffset() {
    return Math.max(topOffset(), Math.min(Math.round(window.innerHeight * 0.32), 320));
  }

  function scrollTop() {
    return Math.max(
      window.pageYOffset || 0,
      document.documentElement ? document.documentElement.scrollTop || 0 : 0,
      document.body ? document.body.scrollTop || 0 : 0
    );
  }

  function headingTop(heading) {
    var top = 0;
    var node = heading;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return top;
  }

  function refreshHeadings() {
    var markdown = document.querySelector(".post-content .markdown-body");
    if (!markdown) {
      headings = [];
      return;
    }

    headings = Array.prototype.slice
      .call(markdown.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"))
      .filter(function (heading) {
        return heading.id && heading.offsetParent !== null;
      });
  }

  function activeHeadingId() {
    if (!headings.length) return "";

    var readLine = scrollTop() + activationOffset();
    var firstTop = headingTop(headings[0]);
    if (readLine < firstTop - 8) return "";

    var active = headings[0];
    for (var i = 1; i < headings.length; i += 1) {
      if (headingTop(headings[i]) > readLine) break;
      active = headings[i];
    }
    return active.id || "";
  }

  function updateHashFromScroll() {
    scheduled = false;
    var id = activeHeadingId();

    if (!id && initialHash && Date.now() - startedAt < INITIAL_HASH_GRACE_MS) return;
    replaceHash(id);
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateHashFromScroll);
  }

  function init() {
    refreshHeadings();
    if (!headings.length) return;

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        refreshHeadings();
        scheduleUpdate();
      },
      { passive: true }
    );

    window.setTimeout(scheduleUpdate, 250);
  }

  ready(init);
})();
