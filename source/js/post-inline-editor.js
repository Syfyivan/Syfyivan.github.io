(function () {
  "use strict";

  var article = document.querySelector(".markdown-body");
  if (!article || document.querySelector(".yf-post-editbar") || !isAuthorMode()) {
    return;
  }

  var STORAGE_PREFIX = "syfyivan.inlineEditor.";
  var titleMeta = document.querySelector('meta[property="og:title"]');
  var state = {
    mode: "visual",
    title: cleanTitle((titleMeta && titleMeta.getAttribute("content")) || document.title),
    slug: slugFromPath(window.location.pathname),
    category: readMeta("article:section") || "技术笔记",
    tags: Array.from(document.querySelectorAll('meta[property="article:tag"]')).map(function (node) {
      return node.getAttribute("content");
    }).filter(Boolean).join(", "),
    markdown: ""
  };

  var editor = null;
  var syncLock = false;

  function isAuthorMode() {
    var host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  }

  function cleanTitle(value) {
    return String(value || "文章草稿").replace(/\s+-\s+一凡的博客\s*$/, "").trim();
  }

  function readMeta(name) {
    var node = document.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]');
    return node ? node.getAttribute("content") : "";
  }

  function slugFromPath(pathname) {
    var parts = String(pathname || "").split("/").filter(Boolean);
    return parts[parts.length - 1] || "new-post-draft";
  }

  function nowText() {
    var date = new Date();
    var pad = function (value) {
      return String(value).padStart(2, "0");
    };
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " +
      pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
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

  function markdownToHtml(markdown) {
    var lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    var output = [];
    var paragraph = [];
    var listType = null;
    var inCode = false;
    var codeLines = [];

    function flushParagraph() {
      if (paragraph.length) {
        output.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
        paragraph = [];
      }
    }

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
          flushParagraph();
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
        flushParagraph();
        closeList();
        return;
      }

      match = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph();
        closeList();
        output.push("<h" + match[1].length + ">" + inlineMarkdown(match[2]) + "</h" + match[1].length + ">");
        return;
      }

      match = /^>\s?(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph();
        closeList();
        output.push("<blockquote><p>" + inlineMarkdown(match[1]) + "</p></blockquote>");
        return;
      }

      match = /^[-*]\s+(.+)$/.exec(trimmed);
      if (match) {
        flushParagraph();
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
        flushParagraph();
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
    flushParagraph();
    closeList();
    return output.join("\n");
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

    if (/^h[1-4]$/.test(tag)) {
      return "#".repeat(Number(tag.slice(1))) + " " + text + "\n\n";
    }
    if (tag === "p" || tag === "div") {
      return text + "\n\n";
    }
    if (tag === "strong" || tag === "b") {
      return "**" + text + "**";
    }
    if (tag === "em" || tag === "i") {
      return "*" + text + "*";
    }
    if (tag === "code") {
      if (node.parentElement && node.parentElement.tagName.toLowerCase() === "pre") {
        return node.textContent;
      }
      return "`" + node.textContent + "`";
    }
    if (tag === "pre") {
      return "```\n" + node.textContent.replace(/\n+$/g, "") + "\n```\n\n";
    }
    if (tag === "blockquote") {
      return text.split("\n").map(function (line) {
        return line.trim() ? "> " + line.trim() : ">";
      }).join("\n") + "\n\n";
    }
    if (tag === "ul") {
      return Array.from(node.children).map(function (child) {
        return "- " + nodeToMarkdown(child).trim();
      }).join("\n") + "\n\n";
    }
    if (tag === "ol") {
      return Array.from(node.children).map(function (child, index) {
        return (index + 1) + ". " + nodeToMarkdown(child).trim();
      }).join("\n") + "\n\n";
    }
    if (tag === "li") {
      return text;
    }
    if (tag === "a") {
      return "[" + text + "](" + (node.getAttribute("href") || "#") + ")";
    }
    if (tag === "br") {
      return "\n";
    }
    if (tag === "hr") {
      return "---\n\n";
    }
    return text;
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

  function fullMarkdown() {
    var tags = editor.tags.value.split(",").map(function (tag) {
      return tag.trim();
    }).filter(Boolean);
    return [
      "---",
      "title: " + yamlString(editor.title.value || state.title),
      "date: " + nowText(),
      "categories:",
      "  - " + (editor.category.value.trim() || "技术笔记"),
      "tags:",
      tags.length ? tags.map(function (tag) { return "  - " + tag; }).join("\n") : "  - 博客",
      "---",
      "",
      editor.markdown.value.trim(),
      ""
    ].join("\n");
  }

  function buildBar() {
    var postContent = article.closest(".post-content") || article.parentElement;
    var bar = document.createElement("div");
    var currentPath = window.location.pathname + window.location.search + window.location.hash;
    var editHref = "/editor/?from=" + encodeURIComponent(currentPath);
    bar.className = "yf-post-editbar";
    bar.innerHTML = [
      '<a class="yf-edit-action" href="' + escapeAttribute(editHref) + '">编辑本文</a>',
      '<a class="yf-new-action" href="/editor/">写新文章</a>'
    ].join("");
    postContent.parentElement.insertBefore(bar, postContent);
  }

  function buildEditor() {
    var wrapper = document.createElement("section");
    wrapper.className = "yf-inline-editor";
    wrapper.hidden = true;
    wrapper.setAttribute("aria-label", "文章就地编辑器");
    wrapper.innerHTML = [
      '<div class="yf-inline-editor-shell">',
      '  <header class="yf-inline-editor-head">',
      '    <div class="yf-inline-editor-title"><p>Editing this post</p><h2>直接编辑当前文章</h2></div>',
      '    <button class="yf-close-editor" type="button">关闭</button>',
      "  </header>",
      '  <div class="yf-inline-editor-meta">',
      '    <label>标题<input class="yf-title" type="text"></label>',
      '    <label>文件名<input class="yf-slug" type="text"></label>',
      '    <label>分类<input class="yf-category" type="text"></label>',
      '    <label>标签<input class="yf-tags" type="text"></label>',
      "  </div>",
      '  <div class="yf-inline-editor-toolbar">',
      '    <button class="yf-mode-visual is-active" type="button">可视化</button>',
      '    <button class="yf-mode-md" type="button">Markdown</button>',
      '    <button data-command="h2" type="button">H2</button>',
      '    <button data-command="h3" type="button">H3</button>',
      '    <button data-command="bold" type="button">B</button>',
      '    <button data-command="italic" type="button">I</button>',
      '    <button data-command="ul" type="button">列表</button>',
      '    <button data-command="quote" type="button">引用</button>',
      "  </div>",
      '  <div class="yf-inline-surface">',
      '    <div class="yf-inline-visual" contenteditable="true" spellcheck="true"></div>',
      '    <textarea class="yf-inline-markdown" aria-label="Markdown 编辑"></textarea>',
      "  </div>",
      '  <footer class="yf-inline-editor-foot">',
      '    <button class="yf-apply yf-primary" type="button">应用到当前页预览</button>',
      '    <button class="yf-save" type="button">保存本地草稿</button>',
      '    <button class="yf-copy" type="button">复制 Markdown</button>',
      '    <button class="yf-download" type="button">导出 .md</button>',
      '    <span class="yf-inline-status" role="status" aria-live="polite">准备就绪</span>',
      "  </footer>",
      "</div>",
      '<aside class="yf-inline-editor-side">',
      '  <header class="yf-inline-preview-head"><div><p>Preview</p><strong>导出预览</strong></div></header>',
      '  <article class="yf-inline-preview"></article>',
      '  <footer class="yf-inline-editor-foot"><a class="yf-new-action" href="/editor/">打开新文章编辑页</a></footer>',
      "</aside>"
    ].join("");
    document.body.appendChild(wrapper);

    editor = {
      root: wrapper,
      title: wrapper.querySelector(".yf-title"),
      slug: wrapper.querySelector(".yf-slug"),
      category: wrapper.querySelector(".yf-category"),
      tags: wrapper.querySelector(".yf-tags"),
      visual: wrapper.querySelector(".yf-inline-visual"),
      markdown: wrapper.querySelector(".yf-inline-markdown"),
      surface: wrapper.querySelector(".yf-inline-surface"),
      preview: wrapper.querySelector(".yf-inline-preview"),
      status: wrapper.querySelector(".yf-inline-status"),
      visualMode: wrapper.querySelector(".yf-mode-visual"),
      markdownMode: wrapper.querySelector(".yf-mode-md")
    };

    wrapper.querySelector(".yf-close-editor").addEventListener("click", closeEditor);
    wrapper.querySelector(".yf-apply").addEventListener("click", applyToPage);
    wrapper.querySelector(".yf-save").addEventListener("click", saveDraft);
    wrapper.querySelector(".yf-copy").addEventListener("click", function () {
      copyMarkdown().catch(function () {
        setStatus("复制失败，可直接导出 Markdown");
      });
    });
    wrapper.querySelector(".yf-download").addEventListener("click", downloadMarkdown);
    editor.visualMode.addEventListener("click", function () { setMode("visual"); });
    editor.markdownMode.addEventListener("click", function () { setMode("markdown"); });
    editor.visual.addEventListener("input", debounce(syncFromVisual, 160));
    editor.markdown.addEventListener("input", debounce(syncFromMarkdown, 160));
    [editor.title, editor.slug, editor.category, editor.tags].forEach(function (input) {
      input.addEventListener("input", debounce(renderPreview, 120));
    });
    wrapper.querySelectorAll("[data-command]").forEach(function (button) {
      button.addEventListener("click", function () {
        runCommand(button.dataset.command);
      });
    });
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

  function setStatus(message) {
    editor.status.textContent = message;
  }

  function loadStateFromPage() {
    var cached = localStorage.getItem(STORAGE_PREFIX + window.location.pathname);
    if (cached) {
      try {
        var draft = JSON.parse(cached);
        state.title = draft.title || state.title;
        state.slug = draft.slug || state.slug;
        state.category = draft.category || state.category;
        state.tags = draft.tags || state.tags;
        state.markdown = draft.markdown || "";
      } catch (error) {
        localStorage.removeItem(STORAGE_PREFIX + window.location.pathname);
      }
    }
    if (!state.markdown) {
      var clone = article.cloneNode(true);
      clone.querySelectorAll(".headerlink, script, style").forEach(function (node) {
        node.remove();
      });
      state.markdown = htmlToMarkdown(clone);
    }
  }

  function openEditor() {
    if (!editor) {
      buildEditor();
    }
    loadStateFromPage();
    editor.title.value = state.title;
    editor.slug.value = state.slug;
    editor.category.value = state.category;
    editor.tags.value = state.tags;
    editor.markdown.value = state.markdown;
    syncFromMarkdown();
    editor.root.hidden = false;
    document.body.classList.add("yf-inline-editor-open");
    editor.visual.focus();
  }

  function closeEditor() {
    editor.root.hidden = true;
    document.body.classList.remove("yf-inline-editor-open");
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === "markdown") {
      syncFromVisual();
      editor.surface.classList.add("is-markdown");
      editor.markdownMode.classList.add("is-active");
      editor.visualMode.classList.remove("is-active");
      editor.markdown.focus();
    } else {
      syncFromMarkdown();
      editor.surface.classList.remove("is-markdown");
      editor.visualMode.classList.add("is-active");
      editor.markdownMode.classList.remove("is-active");
      editor.visual.focus();
    }
  }

  function syncFromMarkdown() {
    if (syncLock) {
      return;
    }
    syncLock = true;
    editor.visual.innerHTML = sanitizeHtml(markdownToHtml(editor.markdown.value));
    syncLock = false;
    renderPreview();
  }

  function syncFromVisual() {
    if (syncLock) {
      return;
    }
    syncLock = true;
    editor.visual.innerHTML = sanitizeHtml(editor.visual.innerHTML);
    editor.markdown.value = htmlToMarkdown(editor.visual);
    syncLock = false;
    renderPreview();
  }

  function renderPreview() {
    editor.preview.innerHTML = [
      "<h1>",
      escapeHtml(editor.title.value || state.title),
      "</h1>",
      sanitizeHtml(markdownToHtml(editor.markdown.value))
    ].join("");
  }

  function runCommand(action) {
    setMode("visual");
    editor.visual.focus();
    if (action === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (action === "h3") {
      document.execCommand("formatBlock", false, "h3");
    } else if (action === "bold") {
      document.execCommand("bold");
    } else if (action === "italic") {
      document.execCommand("italic");
    } else if (action === "ul") {
      document.execCommand("insertUnorderedList");
    } else if (action === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
    }
    syncFromVisual();
  }

  function saveDraft() {
    localStorage.setItem(STORAGE_PREFIX + window.location.pathname, JSON.stringify({
      title: editor.title.value,
      slug: editor.slug.value,
      category: editor.category.value,
      tags: editor.tags.value,
      markdown: editor.markdown.value,
      savedAt: new Date().toISOString()
    }));
    setStatus("已保存到当前浏览器本地草稿");
  }

  function applyToPage() {
    if (state.mode === "markdown") {
      syncFromMarkdown();
    } else {
      syncFromVisual();
    }
    article.innerHTML = sanitizeHtml(markdownToHtml(editor.markdown.value));
    state.markdown = editor.markdown.value;
    saveDraft();
    setStatus("已应用到当前页面预览，导出 Markdown 后可提交发布");
  }

  async function copyMarkdown() {
    var text = fullMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      setStatus("Markdown 已复制");
    } else {
      downloadMarkdown();
    }
  }

  function downloadMarkdown() {
    var blob = new Blob([fullMarkdown()], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = (editor.slug.value || state.slug || "post") + ".md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
    setStatus("Markdown 已导出");
  }

  buildBar();
})();
