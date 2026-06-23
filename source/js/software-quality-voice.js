(function () {
  "use strict";

  var PAGE_SELECTOR = ".sqr-page, .sqc-page, .sqd-page, .sqe-page";
  var STORAGE_RATE = "softwareQualityVoiceRate";
  var STORAGE_AUTO = "softwareQualityVoiceAuto";
  var MAX_CHUNK = 150;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[ \t]+([，。；：！？、])/g, "$1")
      .replace(/([，。；：！？、])[ \t]+/g, "$1")
      .trim();
  }

  function removeNoise(root) {
    [
      "script",
      "style",
      "noscript",
      "button",
      "select",
      "input",
      "textarea",
      "details",
      ".sqv-root",
      ".sqr-side",
      ".sqc-side",
      ".sqd-nav",
      ".sqe-nav",
      ".sqe-side-toc",
      ".sqe-filter",
      ".sqr-nav",
      ".sqc-nav",
      ".sqr-actions",
      ".sqc-actions",
      ".sqd-actions",
      ".sqe-actions",
      ".sqr-detail-link",
      ".sqr-chip",
      ".sqc-chip",
      ".sqd-chip",
      ".sqe-chip",
      ".sqr-link",
      ".sqd-link",
      ".sqe-link",
      ".sqe-answer"
    ].forEach(function (selector) {
      root.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
    });
  }

  function extractText(nodes) {
    var holder = document.createElement("div");
    nodes.forEach(function (node) {
      holder.appendChild(node.cloneNode(true));
    });
    removeNoise(holder);

    var pieces = [];
    holder.querySelectorAll("h1,h2,h3,h4,p,li,th,td").forEach(function (node) {
      var text = cleanText(node.textContent);
      if (text && text.length > 1 && pieces[pieces.length - 1] !== text) {
        pieces.push(text);
      }
    });

    if (!pieces.length) {
      var fallback = cleanText(holder.textContent);
      if (fallback) pieces.push(fallback);
    }

    return pieces.join("。");
  }

  function extractExerciseText(section) {
    var holder = section.cloneNode(true);
    [
      "script",
      "style",
      "noscript",
      "button",
      "select",
      "input",
      "textarea",
      "details",
      ".sqe-answer",
      ".sqe-meta",
      ".sqe-source-pill"
    ].forEach(function (selector) {
      holder.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
    });
    return cleanText(holder.textContent);
  }

  function directChildrenSections(main) {
    var sections = [];
    var current = null;
    Array.prototype.forEach.call(main.children, function (child) {
      if (child.tagName === "H2") {
        if (current) sections.push(current);
        current = {
          title: cleanText(child.textContent),
          anchor: child.id || "",
          nodes: [child]
        };
      } else if (current) {
        current.nodes.push(child);
      }
    });
    if (current) sections.push(current);
    return sections;
  }

  function buildSections(page) {
    var isChapter = page.classList.contains("sqc-page");
    var isDesign = page.classList.contains("sqd-page");
    var isExercise = page.classList.contains("sqe-page");
    var sections = [];
    var hero = page.querySelector(isChapter ? ".sqc-hero" : isDesign ? ".sqd-hero" : isExercise ? ".sqe-hero" : ".sqr-hero");
    if (hero) {
      sections.push({
        title: isChapter ? "本章导读" : isDesign ? "设计题导读" : isExercise ? "题库导读" : "总复习导读",
        anchor: "",
        text: extractText([hero])
      });
    }

    if (isExercise) {
      document.querySelectorAll(".sqe-chapter, .sqe-tip").forEach(function (section) {
        var heading = section.querySelector("h2,h3");
        var text = extractExerciseText(section);
        if (heading && text.length > 20) {
          sections.push({
            title: cleanText(heading.textContent),
            anchor: section.id || "",
            text: text
          });
        }
      });

      return sections.filter(function (section) {
        return section.text && section.text.length > 20;
      });
    }

    var main = isChapter ? page.querySelector(".sqc-main") : isDesign ? page : page.querySelector(".sqr-main");
    main = main || page;
    directChildrenSections(main).forEach(function (section) {
      var text = extractText(section.nodes);
      if (text.length > 20) {
        sections.push({
          title: section.title,
          anchor: section.anchor,
          text: text
        });
      }
    });

    return sections.filter(function (section) {
      return section.text && section.text.length > 20;
    });
  }

  function splitText(text) {
    var normalized = cleanText(text);
    if (!normalized) return [];

    var parts = normalized.match(/[^。！？；.!?;]+[。！？；.!?;]?/g) || [normalized];
    var chunks = [];
    var current = "";

    parts.forEach(function (part) {
      var piece = cleanText(part);
      if (!piece) return;

      if ((current + piece).length <= MAX_CHUNK) {
        current += piece;
        return;
      }

      if (current) {
        chunks.push(current);
        current = "";
      }

      while (piece.length > MAX_CHUNK) {
        chunks.push(piece.slice(0, MAX_CHUNK));
        piece = piece.slice(MAX_CHUNK);
      }
      current = piece;
    });

    if (current) chunks.push(current);
    return chunks;
  }

  function bestChineseVoice() {
    if (!("speechSynthesis" in window)) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    return voices.find(function (voice) {
      return /zh[-_]?CN/i.test(voice.lang || "") || /Chinese|Mandarin|普通话|中文/i.test(voice.name || "");
    }) || voices.find(function (voice) {
      return /^zh/i.test(voice.lang || "");
    }) || null;
  }

  function init() {
    var page = document.querySelector(PAGE_SELECTOR);
    if (!page || document.querySelector(".sqv-root")) return;

    var sections = buildSections(page);
    if (!sections.length) return;

    var supported = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    var root = document.createElement("div");
    root.className = "sqv-root";
    root.innerHTML = [
      '<section class="sqv-panel" aria-label="语音听课模式">',
      '<div class="sqv-head">',
      '<p class="sqv-title">语音听课模式</p>',
      '<button class="sqv-close" type="button" aria-label="关闭语音面板">×</button>',
      "</div>",
      '<label class="sqv-label">听哪一段<select class="sqv-select sqv-section"></select></label>',
      '<div class="sqv-controls">',
      '<button class="sqv-button" type="button" data-sqv="prev">上一段</button>',
      '<button class="sqv-button" type="button" data-sqv="play">播放</button>',
      '<button class="sqv-button" type="button" data-sqv="pause">暂停</button>',
      '<button class="sqv-button" type="button" data-sqv="stop">停止</button>',
      '<button class="sqv-button" type="button" data-sqv="next">下一段</button>',
      "</div>",
      '<div class="sqv-options">',
      '<label class="sqv-label">速度<select class="sqv-select sqv-rate"><option value="0.85">0.85x</option><option value="1">1x</option><option value="1.15">1.15x</option><option value="1.3">1.3x</option></select></label>',
      '<label class="sqv-auto"><input class="sqv-autoplay" type="checkbox">连续播放</label>',
      "</div>",
      '<div class="sqv-current" aria-live="polite"></div>',
      '<div class="sqv-progress" aria-hidden="true"><span></span></div>',
      '<p class="sqv-status"></p>',
      "</section>",
      '<button class="sqv-toggle" type="button" aria-expanded="false">听课模式</button>'
    ].join("");
    document.body.appendChild(root);

    var panel = root.querySelector(".sqv-panel");
    var toggle = root.querySelector(".sqv-toggle");
    var close = root.querySelector(".sqv-close");
    var sectionSelect = root.querySelector(".sqv-section");
    var rateSelect = root.querySelector(".sqv-rate");
    var autoplay = root.querySelector(".sqv-autoplay");
    var currentEl = root.querySelector(".sqv-current");
    var progressEl = root.querySelector(".sqv-progress span");
    var statusEl = root.querySelector(".sqv-status");
    var playButton = root.querySelector('[data-sqv="play"]');

    sections.forEach(function (section, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = section.title.replace(/^[一二三四五六七八九十]+、\s*/, "");
      sectionSelect.appendChild(option);
    });

    var storedRate = window.localStorage ? window.localStorage.getItem(STORAGE_RATE) : "";
    if (storedRate && rateSelect.querySelector('option[value="' + storedRate + '"]')) {
      rateSelect.value = storedRate;
    } else {
      rateSelect.value = "1";
    }

    var storedAuto = window.localStorage ? window.localStorage.getItem(STORAGE_AUTO) : "";
    autoplay.checked = storedAuto ? storedAuto === "1" : true;

    var state = {
      sectionIndex: 0,
      chunkIndex: 0,
      chunks: splitText(sections[0].text),
      speaking: false,
      paused: false,
      token: 0
    };

    function setStatus(text) {
      statusEl.textContent = text;
    }

    function updateUi() {
      var section = sections[state.sectionIndex];
      sectionSelect.value = String(state.sectionIndex);
      var total = Math.max(1, state.chunks.length);
      var current = Math.min(total, state.chunkIndex + 1);
      var percent = state.chunks.length ? (state.chunkIndex / state.chunks.length) * 100 : 0;
      progressEl.style.width = Math.min(100, Math.max(0, percent)) + "%";
      currentEl.textContent = section.title + " · " + current + "/" + total;
      playButton.textContent = state.paused ? "继续" : "播放";
      root.classList.toggle("is-speaking", state.speaking && !state.paused);
    }

    function openPanel() {
      root.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function loadSection(index) {
      state.sectionIndex = Math.max(0, Math.min(sections.length - 1, index));
      state.chunkIndex = 0;
      state.chunks = splitText(sections[state.sectionIndex].text);
      updateUi();
    }

    function speakCurrent() {
      if (!supported) {
        setStatus("当前浏览器不支持系统语音。可以换 Safari、Chrome 或 Edge 打开。");
        return;
      }

      if (state.chunkIndex >= state.chunks.length) {
        if (autoplay.checked && state.sectionIndex < sections.length - 1) {
          loadSection(state.sectionIndex + 1);
          speakCurrent();
          return;
        }
        state.speaking = false;
        state.paused = false;
        progressEl.style.width = "100%";
        setStatus("本页已读完。");
        updateUi();
        return;
      }

      state.speaking = true;
      state.paused = false;
      state.token += 1;
      var token = state.token;
      var utterance = new window.SpeechSynthesisUtterance(state.chunks[state.chunkIndex]);
      utterance.lang = "zh-CN";
      utterance.rate = Number(rateSelect.value || 1);
      utterance.pitch = 1;
      var voice = bestChineseVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = function () {
        if (token !== state.token) return;
        state.chunkIndex += 1;
        updateUi();
        speakCurrent();
      };

      utterance.onerror = function () {
        if (token !== state.token) return;
        state.speaking = false;
        state.paused = false;
        setStatus("语音播放被浏览器中断，重新点播放即可继续。");
        updateUi();
      };

      window.speechSynthesis.cancel();
      window.setTimeout(function () {
        if (token !== state.token) return;
        window.speechSynthesis.speak(utterance);
        setStatus("正在朗读：" + sections[state.sectionIndex].title);
        updateUi();
      }, 60);
    }

    function play() {
      openPanel();
      if (!supported) {
        setStatus("当前浏览器不支持系统语音。可以换 Safari、Chrome 或 Edge 打开。");
        return;
      }
      if (state.paused) {
        window.speechSynthesis.resume();
        state.paused = false;
        state.speaking = true;
        setStatus("继续朗读：" + sections[state.sectionIndex].title);
        updateUi();
        return;
      }
      speakCurrent();
    }

    function pause() {
      if (!supported || !state.speaking) return;
      window.speechSynthesis.pause();
      state.paused = true;
      setStatus("已暂停。");
      updateUi();
    }

    function stop(resetChunk) {
      if (supported) {
        state.token += 1;
        window.speechSynthesis.cancel();
      }
      state.speaking = false;
      state.paused = false;
      if (resetChunk) state.chunkIndex = 0;
      setStatus(resetChunk ? "已停止，下一次从本段开头播放。" : "已停止。");
      updateUi();
    }

    function jump(delta) {
      var wasSpeaking = state.speaking && !state.paused;
      stop(false);
      state.chunkIndex += delta;
      if (state.chunkIndex < 0) {
        if (state.sectionIndex > 0) {
          loadSection(state.sectionIndex - 1);
          state.chunkIndex = Math.max(0, state.chunks.length - 1);
        } else {
          state.chunkIndex = 0;
        }
      } else if (state.chunkIndex >= state.chunks.length) {
        if (state.sectionIndex < sections.length - 1) {
          loadSection(state.sectionIndex + 1);
        } else {
          state.chunkIndex = Math.max(0, state.chunks.length - 1);
        }
      }
      updateUi();
      if (wasSpeaking) speakCurrent();
    }

    toggle.addEventListener("click", function () {
      if (root.classList.contains("is-open")) {
        closePanel();
      } else {
        openPanel();
      }
    });

    close.addEventListener("click", closePanel);

    root.addEventListener("click", function (event) {
      var action = event.target && event.target.getAttribute("data-sqv");
      if (!action) return;
      if (action === "play") play();
      if (action === "pause") pause();
      if (action === "stop") stop(true);
      if (action === "prev") jump(-1);
      if (action === "next") jump(1);
    });

    sectionSelect.addEventListener("change", function () {
      stop(false);
      loadSection(Number(sectionSelect.value || 0));
      setStatus("已切换到：" + sections[state.sectionIndex].title);
    });

    rateSelect.addEventListener("change", function () {
      if (window.localStorage) window.localStorage.setItem(STORAGE_RATE, rateSelect.value);
      if (state.speaking && !state.paused) {
        speakCurrent();
      }
    });

    autoplay.addEventListener("change", function () {
      if (window.localStorage) window.localStorage.setItem(STORAGE_AUTO, autoplay.checked ? "1" : "0");
    });

    window.addEventListener("beforeunload", function () {
      if (supported) window.speechSynthesis.cancel();
    });

    if (supported && "onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = bestChineseVoice;
    }

    setStatus(supported ? "选择一段后点播放。手机上请保持浏览器页面打开。" : "当前浏览器不支持系统语音。");
    updateUi();
  }

  ready(init);
})();
