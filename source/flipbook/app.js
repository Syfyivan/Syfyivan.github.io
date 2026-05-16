(function () {
  "use strict";

  var promptForm = document.getElementById("promptForm");
  var promptInput = document.getElementById("promptInput");
  var imageInput = document.getElementById("imageInput");
  var uploadButton = document.getElementById("uploadButton");
  var emptyUploadButton = document.getElementById("emptyUploadButton");
  var languageSelect = document.getElementById("languageSelect");
  var creditCost = document.getElementById("creditCost");
  var canvas = document.getElementById("visualCanvas");
  var ctx = canvas.getContext("2d");
  var emptyState = document.getElementById("emptyState");
  var loadingState = document.getElementById("loadingState");
  var historyTrack = document.getElementById("historyTrack");
  var workspace = document.getElementById("workspace");
  var branchToggle = document.getElementById("branchToggle");
  var branchClose = document.getElementById("branchClose");
  var branchMap = document.getElementById("branchMap");
  var branchSummary = document.getElementById("branchSummary");
  var rippleLayer = document.getElementById("rippleLayer");
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");

  var ratios = {
    "1:1": [1, 1],
    "4:3": [4, 3],
    "3:4": [3, 4],
    "9:16": [9, 16],
    "16:9": [16, 9]
  };

  var costByQuality = {
    low: 1,
    medium: 3,
    high: 6
  };

  var palettes = [
    ["#f7efe0", "#0f766e", "#d77606", "#2f6f9f", "#171411"],
    ["#f5efe5", "#a43d5b", "#2869a8", "#d69f26", "#171411"],
    ["#f2eadf", "#315c78", "#b54d2a", "#0f766e", "#171411"],
    ["#f7f0dc", "#4b5baf", "#d77606", "#5f8d62", "#171411"]
  ];

  var focusWords = [
    "skyline",
    "texture",
    "artifact",
    "map",
    "garden",
    "signal",
    "machine",
    "archive",
    "diagram",
    "market",
    "river",
    "studio"
  ];

  var nodes = [];
  var activeId = null;
  var idCounter = 0;
  var settings = {
    quality: "low",
    ratio: "16:9",
    language: "English"
  };
  var imageEndpoint = (window.VisualBrowserConfig && window.VisualBrowserConfig.endpoint) || "/api/visual-branch";

  function hashString(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function makeRandom(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getActiveNode() {
    return nodes.find(function (node) {
      return node.id === activeId;
    });
  }

  function createNode(prompt, parentId, focus, uploadedImage) {
    var parent = nodes.find(function (node) {
      return node.id === parentId;
    });
    var depth = parent ? parent.depth + 1 : 0;
    var id = "node-" + idCounter;
    idCounter += 1;

    var seed = hashString([prompt, settings.quality, settings.ratio, settings.language, depth, id].join("|"));
    var palette = palettes[seed % palettes.length];
    var node = {
      id: id,
      parentId: parentId || null,
      prompt: prompt,
      title: makeTitle(prompt),
      depth: depth,
      seed: seed,
      focus: focus || null,
      quality: settings.quality,
      ratio: settings.ratio,
      language: settings.language,
      image: uploadedImage || (parent && parent.image ? parent.image : null),
      generatedImage: null,
      provider: "local",
      pending: false,
      palette: palette,
      createdAt: new Date()
    };

    nodes.push(node);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(id);
    }
    activeId = id;
    return node;
  }

  function makeTitle(prompt) {
    var normalized = prompt.replace(/\s+/g, " ").trim();
    if (!normalized) return "Untitled visual";
    return normalized.length > 38 ? normalized.slice(0, 35) + "..." : normalized;
  }

  function getChildren(parentId) {
    return nodes.filter(function (node) {
      return node.parentId === parentId;
    });
  }

  function getLineage(node) {
    var result = [];
    var current = node;
    while (current) {
      result.unshift(current);
      current = nodes.find(function (candidate) {
        return candidate.id === current.parentId;
      });
    }
    return result;
  }

  function updateCanvasSize() {
    var ratio = ratios[settings.ratio] || ratios["16:9"];
    canvas.style.aspectRatio = ratio[0] + " / " + ratio[1];
    var logicalWidth = 1440;
    var logicalHeight = Math.round((logicalWidth * ratio[1]) / ratio[0]);
    var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.round(logicalWidth * dpr);
    canvas.height = Math.round(logicalHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: logicalWidth, height: logicalHeight };
  }

  function drawActiveNode() {
    var node = getActiveNode();
    var size = updateCanvasSize();
    ctx.clearRect(0, 0, size.width, size.height);
    if (!node) return;
    drawGeneratedPage(node, size.width, size.height);
  }

  function drawGeneratedPage(node, width, height) {
    var random = makeRandom(node.seed);
    var colors = node.palette;

    if (node.generatedImage) {
      drawCoverImage(node.generatedImage, width, height, 1);
      if (node.focus) {
        drawFocusMarker(node.focus.x * width, node.focus.y * height, colors);
      }
      return;
    }

    var bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors[0]);
    bg.addColorStop(0.5, soften(colors[2], 0.18));
    bg.addColorStop(1, soften(colors[1], 0.2));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    if (node.image) {
      drawUploadedImage(node.image, width, height);
    }

    drawTexture(width, height, random);
    drawVisualObjects(width, height, random, colors, node);
    drawPixelText(width, height, node, colors);

    if (node.focus) {
      drawFocusMarker(node.focus.x * width, node.focus.y * height, colors);
    }
  }

  function drawUploadedImage(image, width, height) {
    drawCoverImage(image, width, height, 0.32);
  }

  function drawCoverImage(image, width, height, alpha) {
    var scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    var imageWidth = image.naturalWidth * scale;
    var imageHeight = image.naturalHeight * scale;
    var x = (width - imageWidth) / 2;
    var y = (height - imageHeight) / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = "saturate(0.95) contrast(1.08)";
    ctx.drawImage(image, x, y, imageWidth, imageHeight);
    ctx.restore();
  }

  function drawTexture(width, height, random) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(23,20,17,0.18)";
    ctx.lineWidth = 1;
    var gap = Math.max(28, Math.round(width / 34));
    for (var x = 0; x <= width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + random() * 20 - 10, height);
      ctx.stroke();
    }
    for (var y = 0; y <= height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + random() * 20 - 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawVisualObjects(width, height, random, colors, node) {
    ctx.save();
    var count = node.quality === "high" ? 52 : node.quality === "medium" ? 38 : 24;
    for (var i = 0; i < count; i += 1) {
      var x = random() * width;
      var y = random() * height;
      var radius = (random() * 0.09 + 0.025) * Math.min(width, height);
      var color = colors[1 + (i % 3)];
      ctx.globalAlpha = 0.11 + random() * 0.34;
      if (i % 4 === 0) {
        ctx.fillStyle = soften(color, 0.2);
        roundRect(ctx, x - radius, y - radius * 0.55, radius * 2.2, radius * 1.15, radius * 0.22);
        ctx.fill();
      } else {
        var gradient = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
        gradient.addColorStop(0, soften(color, 0.82));
        gradient.addColorStop(1, "rgba(255,250,240,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(23,20,17,0.34)";
    ctx.lineWidth = Math.max(2, width * 0.002);
    var baseY = height * (0.62 + random() * 0.1);
    ctx.beginPath();
    ctx.moveTo(width * 0.08, baseY);
    for (var p = 0; p < 9; p += 1) {
      ctx.lineTo(width * (0.1 + p * 0.105), baseY - random() * height * 0.24);
    }
    ctx.lineTo(width * 0.96, baseY);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,250,240,0.68)";
    for (var b = 0; b < 7; b += 1) {
      var bx = width * (0.11 + b * 0.12 + random() * 0.03);
      var bw = width * (0.055 + random() * 0.055);
      var bh = height * (0.08 + random() * 0.18);
      roundRect(ctx, bx, baseY - bh, bw, bh, 10);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawPixelText(width, height, node, colors) {
    var title = node.title;
    var subtitle = [
      node.language,
      node.quality.toUpperCase(),
      node.ratio,
      "depth " + node.depth
    ].join(" / ");
    var centerX = width * 0.5;
    var blockY = height * 0.2;
    var maxWidth = width * 0.72;

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(23,20,17,0.9)";
    ctx.font = "900 " + clamp(width * 0.072, 42, 94) + "px Inter, system-ui, sans-serif";
    wrapText(ctx, title, centerX, blockY, maxWidth, clamp(width * 0.076, 48, 96), 2);

    ctx.fillStyle = "rgba(23,20,17,0.58)";
    ctx.font = "700 " + clamp(width * 0.018, 16, 26) + "px 'Comic Sans MS', cursive";
    ctx.fillText(subtitle, centerX, blockY + height * 0.19, maxWidth);

    var plateWidth = Math.min(width * 0.55, 660);
    var plateHeight = Math.max(74, height * 0.13);
    var plateX = centerX - plateWidth / 2;
    var plateY = height * 0.74;
    ctx.fillStyle = "rgba(255,250,240,0.72)";
    ctx.strokeStyle = "rgba(23,20,17,0.22)";
    ctx.lineWidth = 2;
    roundRect(ctx, plateX, plateY, plateWidth, plateHeight, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors[1];
    ctx.font = "900 " + clamp(width * 0.018, 17, 26) + "px Inter, system-ui, sans-serif";
    ctx.fillText("CLICK A DETAIL TO BRANCH", centerX, plateY + plateHeight * 0.45, plateWidth - 40);
    ctx.fillStyle = "rgba(23,20,17,0.62)";
    ctx.font = "700 " + clamp(width * 0.014, 14, 20) + "px 'Comic Sans MS', cursive";
    ctx.fillText("The next image uses your click point as its focus", centerX, plateY + plateHeight * 0.72, plateWidth - 40);
    ctx.restore();
  }

  function drawFocusMarker(x, y, colors) {
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,250,240,0.95)";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors[2];
    ctx.beginPath();
    ctx.arc(x, y, 43, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(23,20,17,0.86)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(context, x, y, width, height, radius) {
    var safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y, safeRadius);
    context.closePath();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = text.split(" ");
    var line = "";
    var lines = [];
    words.forEach(function (word) {
      var testLine = line ? line + " " + word : word;
      if (context.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);
    lines = lines.slice(0, maxLines);
    lines.forEach(function (lineText, index) {
      context.fillText(lineText, x, y + index * lineHeight, maxWidth);
    });
  }

  function soften(hex, alpha) {
    var clean = hex.replace("#", "");
    var bigint = parseInt(clean, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setNodePending(node, pending) {
    node.pending = pending;
    renderAll();
  }

  function buildVisualPrompt(node) {
    var parent = nodes.find(function (candidate) {
      return candidate.id === node.parentId;
    });
    var focus = node.focus
      ? "Focus the new page around the clicked point at x=" + node.focus.x.toFixed(2) + ", y=" + node.focus.y.toFixed(2) + "."
      : "Create the opening visual page for this exploration.";
    var lineage = getLineage(node).map(function (item) {
      return item.prompt;
    }).join(" -> ");

    return [
      "Create one cohesive visual browser page as a single image.",
      "The page should communicate the topic visually, including any useful labels as pixels inside the image.",
      "Do not draw browser chrome, buttons, address bars, or UI controls.",
      "Use a rich editorial composition with clear hierarchy, real-world detail, and inspectable visual regions.",
      "Topic: " + node.prompt + ".",
      parent ? "Parent page topic: " + parent.prompt + "." : "",
      "Exploration path: " + lineage + ".",
      focus,
      "Language for any rendered labels: " + node.language + "."
    ].filter(Boolean).join(" ");
  }

  async function maybeAttachAiImage(node) {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, 45000);

    try {
      var response = await fetch(imageEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: buildVisualPrompt(node),
          userPrompt: node.prompt,
          focus: node.focus,
          ratio: node.ratio,
          quality: node.quality,
          language: node.language,
          parentId: node.parentId
        }),
        signal: controller.signal
      });

      if (!response.ok) return;
      var data = await response.json();
      var imageSource = data.imageUrl || data.url || data.dataUrl;
      if (!imageSource && (data.b64_json || data.imageBase64)) {
        imageSource = "data:image/png;base64," + (data.b64_json || data.imageBase64);
      }
      if (!imageSource) return;

      node.generatedImage = await loadImage(imageSource);
      node.provider = data.provider || "ai";
    } catch (error) {
      node.provider = "local";
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  async function createAndRenderNode(prompt, parentId, focus, uploadedImage) {
    var node = createNode(prompt, parentId, focus, uploadedImage);
    node.pending = true;
    renderAll();
    await maybeAttachAiImage(node);
    setNodePending(node, false);
    return node;
  }

  function renderAll() {
    var node = getActiveNode();
    emptyState.hidden = Boolean(node);
    loadingState.hidden = !(node && node.pending);
    drawActiveNode();
    renderHistory(node);
    renderBranchMap();
    branchSummary.textContent = nodes.length ? nodes.length + " visual pages in this session." : "No visual pages yet.";
  }

  function renderHistory(node) {
    historyTrack.innerHTML = "";
    if (!node) return;
    getLineage(node).forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "history-button" + (item.id === activeId ? " active" : "");
      button.textContent = item.title;
      button.addEventListener("click", function () {
        activeId = item.id;
        promptInput.value = item.prompt;
        renderAll();
      });
      historyTrack.appendChild(button);
    });
  }

  function renderBranchMap() {
    branchMap.innerHTML = "";
    var roots = getChildren(null);
    if (!roots.length) {
      var empty = document.createElement("p");
      empty.className = "branch-map-empty";
      empty.textContent = "Generate a visual page to start the map.";
      branchMap.appendChild(empty);
      return;
    }
    roots.forEach(function (root) {
      branchMap.appendChild(renderBranchNode(root));
    });
  }

  function renderBranchNode(node) {
    var shell = document.createElement("div");
    shell.className = "branch-map-node-shell";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "branch-map-node" + (node.id === activeId ? " active" : "");
    button.addEventListener("click", function () {
      activeId = node.id;
      promptInput.value = node.prompt;
      renderAll();
    });

    var thumb = document.createElement("span");
    thumb.className = "branch-map-thumb";
    thumb.style.setProperty("--thumb", "linear-gradient(135deg, " + node.palette[1] + ", " + node.palette[2] + ")");

    var copy = document.createElement("span");
    copy.className = "branch-map-copy";
    var title = document.createElement("strong");
    title.textContent = node.title;
    var meta = document.createElement("small");
    meta.textContent = node.quality + " / " + node.ratio + " / depth " + node.depth;
    copy.appendChild(title);
    copy.appendChild(meta);

    button.appendChild(thumb);
    button.appendChild(copy);
    shell.appendChild(button);

    var children = getChildren(node.id);
    if (children.length) {
      var childWrap = document.createElement("div");
      childWrap.className = "branch-map-children";
      children.forEach(function (child) {
        childWrap.appendChild(renderBranchNode(child));
      });
      shell.appendChild(childWrap);
    }
    return shell;
  }

  async function generateFromPrompt(event) {
    event.preventDefault();
    var prompt = promptInput.value.trim();
    if (!prompt) {
      promptInput.focus();
      return;
    }
    nodes = [];
    activeId = null;
    idCounter = 0;
    workspace.classList.remove("branch-map-open");
    workspace.classList.add("branch-map-closed");
    await createAndRenderNode(prompt, null, null, null);
  }

  function branchFromCanvas(event) {
    var node = getActiveNode();
    if (!node) return;

    var rect = canvas.getBoundingClientRect();
    var x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    var word = pickFocusWord(node, x, y);
    var prompt = node.prompt + " / " + word;
    showRipple(event.clientX - rect.left, event.clientY - rect.top);
    window.setTimeout(function () {
      promptInput.value = prompt;
      createAndRenderNode(prompt, node.id, { x: x, y: y }, null);
    }, 260);
  }

  function pickFocusWord(node, x, y) {
    var index = Math.floor((hashString(node.prompt) + Math.round(x * 100) + Math.round(y * 100)) % focusWords.length);
    return focusWords[index];
  }

  function showRipple(x, y) {
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.setProperty("--x", x + "px");
    ripple.style.setProperty("--y", y + "px");
    rippleLayer.appendChild(ripple);
    window.setTimeout(function () {
      ripple.remove();
    }, 900);
  }

  function handleImageUpload(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = async function () {
        var prompt = promptInput.value.trim() || "Uploaded image exploration";
        nodes = [];
        activeId = null;
        idCounter = 0;
        promptInput.value = prompt;
        await createAndRenderNode(prompt, null, null, img);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function setSegment(group, key, value) {
    settings[key] = value;
    group.querySelectorAll(".segment").forEach(function (button) {
      var active = button.dataset[key] === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    creditCost.textContent = "Cost " + costByQuality[settings.quality] + " credits";
    var node = getActiveNode();
    if (node) {
      node.quality = settings.quality;
      node.ratio = settings.ratio;
      node.language = settings.language;
      node.seed = hashString([node.prompt, node.quality, node.ratio, node.language, node.depth, node.id].join("|"));
      node.palette = palettes[node.seed % palettes.length];
    }
    renderAll();
  }

  promptForm.addEventListener("submit", generateFromPrompt);
  canvas.addEventListener("click", branchFromCanvas);
  uploadButton.addEventListener("click", function () {
    imageInput.click();
  });
  emptyUploadButton.addEventListener("click", function () {
    imageInput.click();
  });
  imageInput.addEventListener("change", function () {
    handleImageUpload(imageInput.files && imageInput.files[0]);
    imageInput.value = "";
  });

  document.querySelectorAll("[data-setting='quality']").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var target = event.target.closest("[data-quality]");
      if (target) setSegment(group, "quality", target.dataset.quality);
    });
  });

  document.querySelectorAll("[data-setting='ratio']").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var target = event.target.closest("[data-ratio]");
      if (target) setSegment(group, "ratio", target.dataset.ratio);
    });
  });

  languageSelect.addEventListener("change", function () {
    settings.language = languageSelect.value;
    var node = getActiveNode();
    if (node) {
      node.language = settings.language;
      node.seed = hashString([node.prompt, node.quality, node.ratio, node.language, node.depth, node.id].join("|"));
      node.palette = palettes[node.seed % palettes.length];
    }
    renderAll();
  });

  branchToggle.addEventListener("click", function () {
    workspace.classList.toggle("branch-map-open");
    workspace.classList.toggle("branch-map-closed");
  });

  branchClose.addEventListener("click", function () {
    workspace.classList.remove("branch-map-open");
    workspace.classList.add("branch-map-closed");
  });

  menuToggle.addEventListener("click", function () {
    var isOpen = header.getAttribute("data-menu") === "open";
    header.setAttribute("data-menu", isOpen ? "closed" : "open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
  });

  document.querySelectorAll(".mobile-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.setAttribute("data-menu", "closed");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", drawActiveNode);

  updateCanvasSize();
  renderAll();
})();
