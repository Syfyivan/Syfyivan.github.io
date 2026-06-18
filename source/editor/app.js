(function () {
  "use strict";

  var STORAGE_PREFIX = "syfyivan.editor.draft.";
  var AUTO_KEY = "syfyivan.editor.autosave";
  var syncLock = false;

  var els = {
    title: document.getElementById("post-title"),
    slug: document.getElementById("post-slug"),
    category: document.getElementById("post-category"),
    tags: document.getElementById("post-tags"),
    articleUrl: document.getElementById("article-url"),
    status: document.getElementById("status-line"),
    importArticle: document.getElementById("import-article"),
    loadSample: document.getElementById("load-sample"),
    visualTab: document.getElementById("visual-tab"),
    markdownTab: document.getElementById("markdown-tab"),
    visual: document.getElementById("visual-editor"),
    markdown: document.getElementById("markdown-editor"),
    surfaceWrap: document.querySelector(".surface-wrap"),
    preview: document.getElementById("preview"),
    wordCount: document.getElementById("word-count"),
    headingCount: document.getElementById("heading-count"),
    readingTime: document.getElementById("reading-time"),
    saveDraft: document.getElementById("save-draft"),
    loadDraft: document.getElementById("load-draft"),
    draftList: document.getElementById("draft-list"),
    copyMarkdown: document.getElementById("copy-markdown"),
    downloadMd: document.getElementById("download-md"),
    downloadHtml: document.getElementById("download-html")
  };

  var sampleMarkdown = [
    "## 小镇里的总编辑",
    "",
    "总编辑每天收到很多来稿。他不急着排版，而是先问三件事：读者是谁、要解决什么问题、哪些证据可以公开引用。",
    "",
    "> 好文章不是把资料堆满，而是让读者知道下一步该怎么做。",
    "",
    "### 写作清单",
    "",
    "- 先写一句话结论",
    "- 再补故事和例子",
    "- 最后检查资料来源",
    "",
    "如果要继续完善课程，可以把每一讲都拆成 `故事 -> 道理 -> 工程做法 -> 练习` 四段。"
  ].join("\n");

  function nowText() {
    var date = new Date();
    var pad = function (value) {
      return String(value).padStart(2, "0");
    };
    return [
      date.getFullYear(),
      "-",
      pad(date.getMonth() + 1),
      "-",
      pad(date.getDate()),
      " ",
      pad(date.getHours()),
      ":",
      pad(date.getMinutes()),
      ":",
      pad(date.getSeconds())
    ].join("");
  }

  function setStatus(message) {
    els.status.textContent = message;
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(null, args);
      }, delay);
    };
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

  function safeUrl(value) {
    var url = String(value || "").trim();
    if (!url || /^javascript:/i.test(url)) {
      return "#";
    }
    return url;
  }

  function inlineMarkdown(text) {
    var html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
      return '<a href="' + escapeAttribute(safeUrl(url)) + '" target="_blank" rel="noopener">' + label + "</a>";
    });
    return html;
  }

  function flushParagraph(parts, output) {
    if (!parts.length) {
      return;
    }
    output.push("<p>" + inlineMarkdown(parts.join(" ")) + "</p>");
    parts.length = 0;
  }

  function markdownToHtml(markdown) {
    var lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    var output = [];
    var paragraph = [];
    var listType = null;
    var inCode = false;
    var codeLines = [];

    function closeList() {
      if (listType) {
        output.push("</" + listType + ">");
        listType = null;
      }
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();
      var match;

      if (trimmed.indexOf("```") === 0) {
        if (inCode) {
          output.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
          codeLines = [];
          inCode = false;
        } else {
          flushParagraph(paragraph, output);
          closeList();
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (!trimmed) {
        flushParagraph(paragraph, output);
        closeList();
        return;
      }

      if (/^---+$/.test(trimmed)) {
        flushParagraph(paragraph, output);
        closeList();
        output.push("<hr>");
        return;
      }

      match = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph(paragraph, output);
        closeList();
        output.push("<h" + match[1].length + ">" + inlineMarkdown(match[2]) + "</h" + match[1].length + ">");
        return;
      }

      match = /^>\s?(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph(paragraph, output);
        closeList();
        output.push("<blockquote><p>" + inlineMarkdown(match[1]) + "</p></blockquote>");
        return;
      }

      match = /^[-*]\s+(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph(paragraph, output);
        if (listType !== "ul") {
          closeList();
          output.push("<ul>");
          listType = "ul";
        }
        output.push("<li>" + inlineMarkdown(match[1]) + "</li>");
        return;
      }

      match = /^\d+\.\s+(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph(paragraph, output);
        if (listType !== "ol") {
          closeList();
          output.push("<ol>");
          listType = "ol";
        }
        output.push("<li>" + inlineMarkdown(match[1]) + "</li>");
        return;
      }

      paragraph.push(trimmed);
    });

    if (inCode) {
      output.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
    }
    flushParagraph(paragraph, output);
    closeList();
    return output.join("\n");
  }

  function sanitizeHtml(html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll("script, style, iframe, object, embed, form").forEach(function (node) {
      node.remove();
    });
    template.content.querySelectorAll("*").forEach(function (node) {
      Array.from(node.attributes).forEach(function (attr) {
        var name = attr.name.toLowerCase();
        var value = attr.value || "";
        if (name.indexOf("on") === 0 || value.trim().toLowerCase().indexOf("javascript:") === 0) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, " ");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    var tag = node.tagName.toLowerCase();
    var children = Array.from(node.childNodes).map(nodeToMarkdown).join("");
    var text = children.trim();

    if (!text && tag !== "br" && tag !== "hr") {
      return "";
    }

    switch (tag) {
      case "h1":
        return "# " + text + "\n\n";
      case "h2":
        return "## " + text + "\n\n";
      case "h3":
        return "### " + text + "\n\n";
      case "h4":
        return "#### " + text + "\n\n";
      case "p":
      case "div":
        return text + "\n\n";
      case "strong":
      case "b":
        return "**" + text + "**";
      case "em":
      case "i":
        return "*" + text + "*";
      case "code":
        if (node.parentElement && node.parentElement.tagName.toLowerCase() === "pre") {
          return node.textContent;
        }
        return "`" + node.textContent + "`";
      case "pre":
        return "```\n" + node.textContent.replace(/\n+$/g, "") + "\n```\n\n";
      case "blockquote":
        return text.split("\n").map(function (line) {
          return line.trim() ? "> " + line.trim() : ">";
        }).join("\n") + "\n\n";
      case "ul":
        return Array.from(node.children).map(function (child) {
          return "- " + nodeToMarkdown(child).trim();
        }).join("\n") + "\n\n";
      case "ol":
        return Array.from(node.children).map(function (child, index) {
          return (index + 1) + ". " + nodeToMarkdown(child).trim();
        }).join("\n") + "\n\n";
      case "li":
        return text;
      case "a":
        return "[" + text + "](" + (node.getAttribute("href") || "#") + ")";
      case "br":
        return "\n";
      case "hr":
        return "---\n\n";
      default:
        return text;
    }
  }

  function htmlToMarkdown(root) {
    return Array.from(root.childNodes)
      .map(nodeToMarkdown)
      .join("")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function yamlString(value) {
    return '"' + String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  function makeFrontMatter() {
    var tags = els.tags.value.split(",").map(function (tag) {
      return tag.trim();
    }).filter(Boolean);
    var lines = [
      "---",
      "title: " + yamlString(els.title.value || "新文章草稿"),
      "date: " + nowText(),
      "categories:",
      "  - " + (els.category.value.trim() || "写作"),
      "tags:"
    ];
    if (tags.length) {
      tags.forEach(function (tag) {
        lines.push("  - " + tag);
      });
    } else {
      lines.push("  - 博客");
    }
    lines.push("---", "");
    return lines.join("\n");
  }

  function fullMarkdown() {
    return makeFrontMatter() + els.markdown.value.trim() + "\n";
  }

  function renderPreview() {
    var bodyHtml = sanitizeHtml(markdownToHtml(els.markdown.value));
    var tags = els.tags.value.split(",").map(function (tag) {
      return tag.trim();
    }).filter(Boolean);
    els.preview.innerHTML = [
      "<h1>",
      escapeHtml(els.title.value || "新文章草稿"),
      "</h1>",
      '<div class="preview-meta">',
      "<span>",
      escapeHtml(els.category.value || "写作"),
      "</span>",
      tags.map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join(""),
      "</div>",
      bodyHtml || "<p>还没有正文。</p>"
    ].join("");

    var plain = els.markdown.value.replace(/[#>*_`[\]()\-.]/g, "").trim();
    var words = plain ? plain.length : 0;
    var headings = (els.markdown.value.match(/^#{1,4}\s+/gm) || []).length;
    els.wordCount.textContent = String(words);
    els.headingCount.textContent = String(headings);
    els.readingTime.textContent = String(Math.max(1, Math.ceil(words / 450)));
  }

  function syncFromMarkdown() {
    if (syncLock) {
      return;
    }
    syncLock = true;
    els.visual.innerHTML = sanitizeHtml(markdownToHtml(els.markdown.value));
    syncLock = false;
    renderPreview();
    autosave();
  }

  function syncFromVisual() {
    if (syncLock) {
      return;
    }
    syncLock = true;
    els.visual.innerHTML = sanitizeHtml(els.visual.innerHTML);
    els.markdown.value = htmlToMarkdown(els.visual);
    syncLock = false;
    renderPreview();
    autosave();
  }

  function setMode(mode) {
    var markdownMode = mode === "markdown";
    els.surfaceWrap.classList.toggle("is-markdown", markdownMode);
    els.visualTab.classList.toggle("is-active", !markdownMode);
    els.markdownTab.classList.toggle("is-active", markdownMode);
    els.visualTab.setAttribute("aria-selected", String(!markdownMode));
    els.markdownTab.setAttribute("aria-selected", String(markdownMode));
    if (markdownMode) {
      syncFromVisual();
      els.markdown.focus();
    } else {
      syncFromMarkdown();
      els.visual.focus();
    }
  }

  function command(action) {
    setMode("visual");
    els.visual.focus();
    if (action === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (action === "h3") {
      document.execCommand("formatBlock", false, "h3");
    } else if (action === "bold") {
      document.execCommand("bold");
    } else if (action === "italic") {
      document.execCommand("italic");
    } else if (action === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else if (action === "ul") {
      document.execCommand("insertUnorderedList");
    } else if (action === "ol") {
      document.execCommand("insertOrderedList");
    } else if (action === "code") {
      document.execCommand("insertHTML", false, "<code>code</code>");
    } else if (action === "link") {
      var url = window.prompt("链接地址", "https://");
      if (url) {
        document.execCommand("createLink", false, safeUrl(url));
      }
    }
    syncFromVisual();
  }

  function slugify(value) {
    return String(value || "new-post-draft")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "new-post-draft";
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function draftPayload() {
    return JSON.stringify({
      title: els.title.value,
      slug: els.slug.value,
      category: els.category.value,
      tags: els.tags.value,
      markdown: els.markdown.value,
      savedAt: new Date().toISOString()
    });
  }

  function applyDraft(payload) {
    els.title.value = payload.title || "新文章草稿";
    els.slug.value = payload.slug || slugify(els.title.value);
    els.category.value = payload.category || "写作";
    els.tags.value = payload.tags || "博客";
    els.markdown.value = payload.markdown || "";
    syncFromMarkdown();
  }

  function draftKey() {
    return STORAGE_PREFIX + slugify(els.slug.value || els.title.value);
  }

  function listDrafts() {
    els.draftList.innerHTML = "";
    var keys = Object.keys(localStorage).filter(function (key) {
      return key.indexOf(STORAGE_PREFIX) === 0;
    }).sort();
    if (!keys.length) {
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "暂无草稿";
      els.draftList.appendChild(empty);
      return;
    }
    keys.forEach(function (key) {
      var option = document.createElement("option");
      option.value = key;
      option.textContent = key.replace(STORAGE_PREFIX, "");
      els.draftList.appendChild(option);
    });
  }

  function saveDraft() {
    localStorage.setItem(draftKey(), draftPayload());
    localStorage.setItem(AUTO_KEY, draftPayload());
    listDrafts();
    setStatus("已保存到浏览器本地草稿");
  }

  var autosave = debounce(function () {
    localStorage.setItem(AUTO_KEY, draftPayload());
  }, 600);

  function loadSelectedDraft() {
    var key = els.draftList.value;
    if (!key) {
      setStatus("没有可读取的本地草稿");
      return;
    }
    var payload = JSON.parse(localStorage.getItem(key) || "{}");
    applyDraft(payload);
    setStatus("已读取草稿：" + key.replace(STORAGE_PREFIX, ""));
  }

  function standaloneHtml() {
    return [
      "<!doctype html>",
      '<html lang="zh-CN">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>",
      escapeHtml(els.title.value || "文章"),
      "</title>",
      "<style>body{max-width:820px;margin:48px auto;padding:0 20px;color:#2f3742;font:17px/1.8 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif}h1,h2,h3{color:#20242b;line-height:1.25}blockquote{border-left:4px solid #2f765f;margin:1em 0;padding:8px 16px;background:#eef7f2}code{background:#f7e9e6;color:#b73a2c;padding:2px 5px;border-radius:4px}pre{background:#20242b;color:#fff;padding:16px;overflow:auto}a{color:#3f5d7e}</style>",
      "</head>",
      "<body>",
      els.preview.innerHTML,
      "</body>",
      "</html>"
    ].join("\n");
  }

  async function copyMarkdown() {
    var text = fullMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      setStatus("Markdown 已复制到剪贴板");
    } else {
      download(slugify(els.slug.value) + ".md", text, "text/markdown;charset=utf-8");
      setStatus("当前浏览器不支持复制，已改为下载 Markdown");
    }
  }

  async function importArticle() {
    var raw = els.articleUrl.value.trim();
    if (!raw) {
      setStatus("先输入同站文章地址");
      return;
    }

    try {
      var target = new URL(raw, window.location.href);
      if (target.origin !== window.location.origin) {
        throw new Error("只能读取同一域名下的页面，跨站文章会被浏览器拦截。");
      }
      var response = await fetch(target.href, { credentials: "same-origin" });
      if (!response.ok) {
        throw new Error("读取失败：" + response.status);
      }
      var html = await response.text();
      var doc = new DOMParser().parseFromString(html, "text/html");
      var title = doc.querySelector('meta[property="og:title"]');
      var titleText = title ? title.getAttribute("content") : "";
      if (!titleText) {
        titleText = (doc.querySelector("h1, title") || {}).textContent || "导入文章";
      }
      titleText = titleText.replace(/\s+-\s+一凡的博客\s*$/, "").trim();

      var content = doc.querySelector(".markdown-body, .post-content, article .content, article, main");
      if (!content) {
        throw new Error("没有识别到正文区域。");
      }
      var clone = content.cloneNode(true);
      clone.querySelectorAll("script, style, nav, .toc, .post-meta, .post-copyright, .comments").forEach(function (node) {
        node.remove();
      });
      els.title.value = titleText || "导入文章";
      els.slug.value = slugify(target.pathname.split("/").filter(Boolean).pop() || titleText);
      els.visual.innerHTML = sanitizeHtml(clone.innerHTML);
      syncFromVisual();
      setStatus("已导入文章正文，可继续编辑并导出。");
    } catch (error) {
      setStatus(error.message || "导入失败");
    }
  }

  function loadSample() {
    els.title.value = "小镇里的总编辑";
    els.slug.value = "editor-sample";
    els.category.value = "写作";
    els.tags.value = "博客, 课程, Agent";
    els.markdown.value = sampleMarkdown;
    syncFromMarkdown();
    setStatus("已载入示例文章");
  }

  function bindEvents() {
    els.visualTab.addEventListener("click", function () {
      setMode("visual");
    });
    els.markdownTab.addEventListener("click", function () {
      setMode("markdown");
    });
    document.querySelectorAll("[data-command]").forEach(function (button) {
      button.addEventListener("click", function () {
        command(button.dataset.command);
      });
    });
    els.markdown.addEventListener("input", debounce(syncFromMarkdown, 180));
    els.visual.addEventListener("input", debounce(syncFromVisual, 180));
    [els.title, els.slug, els.category, els.tags].forEach(function (input) {
      input.addEventListener("input", debounce(function () {
        if (input === els.title && !els.slug.dataset.touched) {
          els.slug.value = slugify(els.title.value);
        }
        renderPreview();
        autosave();
      }, 120));
    });
    els.slug.addEventListener("input", function () {
      els.slug.dataset.touched = "true";
    });
    els.importArticle.addEventListener("click", importArticle);
    els.loadSample.addEventListener("click", loadSample);
    els.saveDraft.addEventListener("click", saveDraft);
    els.loadDraft.addEventListener("click", loadSelectedDraft);
    els.copyMarkdown.addEventListener("click", function () {
      copyMarkdown().catch(function () {
        setStatus("复制失败，可使用导出 Markdown。");
      });
    });
    els.downloadMd.addEventListener("click", function () {
      download(slugify(els.slug.value) + ".md", fullMarkdown(), "text/markdown;charset=utf-8");
      setStatus("Markdown 文件已导出");
    });
    els.downloadHtml.addEventListener("click", function () {
      download(slugify(els.slug.value) + ".html", standaloneHtml(), "text/html;charset=utf-8");
      setStatus("HTML 文件已导出");
    });
  }

  function init() {
    bindEvents();
    listDrafts();
    var autosaved = localStorage.getItem(AUTO_KEY);
    if (autosaved) {
      try {
        applyDraft(JSON.parse(autosaved));
        setStatus("已恢复上次自动保存的草稿");
        return;
      } catch (error) {
        localStorage.removeItem(AUTO_KEY);
      }
    }
    loadSample();
  }

  init();
})();
