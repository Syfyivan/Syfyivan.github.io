(function () {
  "use strict";

  var CHINESE_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var TILE_DEFS = [
    { key: "characters", label: "万", group: "characters" },
    { key: "dots", label: "筒", group: "dots" },
    { key: "bamboo", label: "条", group: "bamboo" }
  ].flatMap(function (suit, suitIndex) {
    return CHINESE_NUMBERS.map(function (rank, index) {
      return {
        type: suitIndex * 9 + index,
        group: suit.group,
        rank: index + 1,
        rankLabel: rank,
        suit: suit.label,
        label: String(index + 1) + suit.label
      };
    });
  }).concat("东南西北中发白".split("").map(function (label, index) {
    return {
      type: 27 + index,
      group: index < 4 ? "wind" : "dragon",
      rank: 0,
      rankLabel: label,
      suit: "字",
      label: label
    };
  }));

  var STORAGE_KEY = "lanMahjongProfile";
  var BROWSER_GAME_SERVER = "browser://local";
  var roomInput = document.getElementById("roomInput");
  var nameInput = document.getElementById("nameInput");
  var serverInput = document.getElementById("serverInput");
  var inviteInput = document.getElementById("inviteInput");
  var soloPlayButton = document.getElementById("soloPlayButton");
  var platformGuideBadge = document.getElementById("platformGuideBadge");
  var variantInputs = Array.from(document.querySelectorAll('input[name="variant"]'));
  var seatCountInputs = Array.from(document.querySelectorAll('input[name="seatCount"]'));
  var joinForm = document.getElementById("joinForm");
  var randomRoomButton = document.getElementById("randomRoomButton");
  var applyInviteButton = document.getElementById("applyInviteButton");
  var lobbyPanel = document.getElementById("lobbyPanel");
  var lobbyNote = document.getElementById("lobbyNote");
  var gamePanel = document.getElementById("gamePanel");
  var connectionStatus = document.getElementById("connectionStatus");
  var roomStatus = document.getElementById("roomStatus");
  var wallStatus = document.getElementById("wallStatus");
  var activeRoomLabel = document.getElementById("activeRoomLabel");
  var roomConfigLabel = document.getElementById("roomConfigLabel");
  var copyRoomButton = document.getElementById("copyRoomButton");
  var profileForm = document.getElementById("profileForm");
  var activeNameInput = document.getElementById("activeNameInput");
  var playerList = document.getElementById("playerList");
  var readyButton = document.getElementById("readyButton");
  var addBotButton = document.getElementById("addBotButton");
  var startButton = document.getElementById("startButton");
  var newRoundButton = document.getElementById("newRoundButton");
  var soundButton = document.getElementById("soundButton");
  var guideButton = document.getElementById("guideButton");
  var modalNewRoundButton = document.getElementById("modalNewRoundButton");
  var modalExitButton = document.getElementById("modalExitButton");
  var endModal = document.getElementById("endModal");
  var endResult = document.getElementById("endResult");
  var rulesTitle = document.getElementById("rulesTitle");
  var rulesDetailsButton = document.getElementById("rulesDetailsButton");
  var rulesModal = document.getElementById("rulesModal");
  var rulesModalTitle = document.getElementById("rulesModalTitle");
  var rulesCloseButton = document.getElementById("rulesCloseButton");
  var rulesDetailsContent = document.getElementById("rulesDetailsContent");
  var guideModal = document.getElementById("guideModal");
  var guideCloseButton = document.getElementById("guideCloseButton");
  var guideExitButton = document.getElementById("guideExitButton");
  var guideStartButton = document.getElementById("guideStartButton");
  var guideCoach = document.getElementById("guideCoach");
  var guideCoachStep = document.getElementById("guideCoachStep");
  var guideCoachTitle = document.getElementById("guideCoachTitle");
  var guideCoachText = document.getElementById("guideCoachText");
  var guideCoachExitButton = document.getElementById("guideCoachExitButton");
  var rulesList = document.getElementById("rulesList");
  var eventLog = document.getElementById("eventLog");
  var seatTop = document.getElementById("seatTop");
  var seatLeft = document.getElementById("seatLeft");
  var seatRight = document.getElementById("seatRight");
  var roundLabel = document.getElementById("roundLabel");
  var turnLabel = document.getElementById("turnLabel");
  var diceTray = document.getElementById("diceTray");
  var baoTray = document.getElementById("baoTray");
  var lastDiscard = document.getElementById("lastDiscard");
  var discardRiver = document.getElementById("discardRiver");
  var claimBar = document.getElementById("claimBar");
  var selfMelds = document.getElementById("selfMelds");
  var guideAdvice = document.getElementById("guideAdvice");
  var handRow = document.getElementById("handRow");
  var actionRow = document.getElementById("actionRow");

  var state = {
    socket: null,
    view: null,
    reconnectTimer: null,
    endDialogRound: null,
    clientId: getClientId(),
    selectedTileId: null,
    lastSignals: {},
    audioContext: null,
    soundEnabled: localStorage.getItem(STORAGE_KEY + ".sound") !== "off",
    soloAutoStart: false,
    guide: {
      active: false,
      currentKey: "",
      round: null,
      completed: false
    }
  };

  class BrowserGameSocket extends EventTarget {
    constructor() {
      super();
      this.readyState = WebSocket.CONNECTING;
      this.manualClose = false;
      this.worker = new Worker("./local-game-worker.mjs", { type: "module" });
      this.worker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "open") {
          this.readyState = WebSocket.OPEN;
          this.dispatchEvent(new Event("open"));
        }
        if (event.data && event.data.type === "message") {
          this.dispatchEvent(new MessageEvent("message", { data: event.data.data }));
        }
      });
      this.worker.addEventListener("error", () => {
        if (this.readyState === WebSocket.CLOSED) {
          return;
        }
        this.dispatchEvent(new Event("error"));
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent(new CloseEvent("close"));
      });
    }

    send(data) {
      if (this.readyState !== WebSocket.OPEN) {
        throw new Error("浏览器牌局尚未连接");
      }
      this.worker.postMessage({ type: "send", data });
    }

    close() {
      if (this.readyState === WebSocket.CLOSED) {
        return;
      }
      this.worker.postMessage({ type: "close" });
      this.worker.terminate();
      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(new CloseEvent("close"));
    }
  }

  function getClientId() {
    var existing = localStorage.getItem(STORAGE_KEY + ".clientId");
    if (existing) {
      return existing;
    }
    var next = "client-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY + ".clientId", next);
    return next;
  }

  function loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function updateSavedName(name) {
    var profile = loadProfile();
    profile.name = name;
    saveProfile(profile);
  }

  function radioValue(inputs, fallback) {
    var selected = inputs.find(function (input) {
      return input.checked;
    });
    return selected ? selected.value : fallback;
  }

  function setRadioValue(inputs, value) {
    inputs.forEach(function (input) {
      input.checked = input.value === String(value);
    });
  }

  function selectedVariant() {
    return radioValue(variantInputs, "sichuan");
  }

  function selectedSeatCount() {
    return Number(radioValue(seatCountInputs, "3")) === 4 ? 4 : 3;
  }

  function getQuery() {
    return new URLSearchParams(window.location.search);
  }

  function isGithubPagesHost() {
    return window.location.hostname.endsWith("github.io");
  }

  function isBrowserGameServer(value) {
    return String(value || "") === BROWSER_GAME_SERVER;
  }

  function randomRoomCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 5; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  function updatePlatformGuide() {
    if (platformGuideBadge) {
      platformGuideBadge.textContent = "无需服务器";
    }
  }

  function encodeInvitePayload(payload) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function decodeInvitePayload(value) {
    var normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) {
      normalized += "=";
    }
    return JSON.parse(decodeURIComponent(escape(atob(normalized))));
  }

  function createInviteCode(room, server) {
    return "MJ1-" + encodeInvitePayload({
      room: String(room || "").toUpperCase(),
      server: normalizeServerUrl(server),
      variant: selectedVariant(),
      seatCount: selectedSeatCount()
    });
  }

  function parseInviteCode(value) {
    var raw = String(value || "").trim();
    var maybeUrl;
    if (!raw) {
      throw new Error("请先粘贴邀请码");
    }
    try {
      maybeUrl = new URL(raw);
      raw = maybeUrl.searchParams.get("invite") || raw;
    } catch (error) {
      // Plain invite codes are expected most of the time.
    }
    raw = raw.replace(/\s+/g, "");

    if (/^[A-Z0-9]{4,8}$/i.test(raw)) {
      return { room: raw.toUpperCase(), server: serverInput.value };
    }
    if (!raw.toUpperCase().startsWith("MJ1-")) {
      throw new Error("邀请码格式不对");
    }

    var payload = decodeInvitePayload(raw.slice(4));
    return {
      room: String(payload.room || payload.r || "").toUpperCase(),
      server: normalizeServerUrl(payload.server || payload.s || ""),
      variant: payload.variant || payload.v || selectedVariant(),
      seatCount: Number(payload.seatCount || payload.n || selectedSeatCount()) === 4 ? 4 : 3
    };
  }

  function applyInviteCode(value, autoConnect) {
    var invite;
    try {
      invite = parseInviteCode(value);
      if (!invite.room) {
        throw new Error("邀请码缺少房号");
      }
    } catch (error) {
      setNotice(error.message || "邀请码不可用");
      return false;
    }

    roomInput.value = invite.room;
    if (invite.server) {
      serverInput.value = invite.server;
    }
    if (invite.variant) {
      setRadioValue(variantInputs, invite.variant);
    }
    if (invite.seatCount) {
      setRadioValue(seatCountInputs, invite.seatCount);
    }
    inviteInput.value = String(value || "").trim();
    updatePlatformGuide();
    setNotice(autoConnect ? "使用邀请码连接中" : "已填入邀请码");
    if (autoConnect) {
      connect();
    }
    return true;
  }

  function defaultServerUrl() {
    if (window.location.protocol === "file:") {
      return "ws://localhost:8787/mahjong/ws";
    }
    if (isGithubPagesHost()) {
      return BROWSER_GAME_SERVER;
    }
    var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return protocol + "//" + window.location.host + "/mahjong/ws";
  }

  function normalizeServerUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) {
      return defaultServerUrl();
    }
    if (isBrowserGameServer(raw)) {
      return BROWSER_GAME_SERVER;
    }
    if (!/^[a-z]+:\/\//i.test(raw)) {
      raw = "ws://" + raw;
    }
    var url = new URL(raw);
    if (url.protocol === "http:") {
      url.protocol = "ws:";
    }
    if (url.protocol === "https:") {
      url.protocol = "wss:";
    }
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      throw new Error("服务器地址需要使用 ws、wss、http 或 https");
    }
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/mahjong/ws";
    }
    return url.toString();
  }

  function initForm() {
    var query = getQuery();
    var profile = loadProfile();
    var queryServer = query.get("server");
    var savedServer = profile.server || "";
    nameInput.value = query.get("name") || profile.name || "玩家" + Math.floor(Math.random() * 90 + 10);
    roomInput.value = (query.get("room") || profile.room || randomRoomCode()).toUpperCase();
    serverInput.value = queryServer || (isGithubPagesHost()
      ? BROWSER_GAME_SERVER
      : savedServer || defaultServerUrl());
    setRadioValue(variantInputs, query.get("variant") || profile.variant || "sichuan");
    setRadioValue(seatCountInputs, query.get("seatCount") || profile.seatCount || 3);
    inviteInput.value = query.get("invite") || "";
    updatePlatformGuide();
    if (isGithubPagesHost()) {
      setNotice("点“单机人机”，直接在浏览器里开局");
    }
    if (inviteInput.value) {
      applyInviteCode(inviteInput.value, query.get("join") === "1" || query.get("autojoin") === "1");
    }
  }

  function setNotice(text) {
    lobbyNote.textContent = text;
  }

  function send(message) {
    if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
      setNotice("连接未就绪");
      return;
    }
    state.socket.send(JSON.stringify(message));
  }

  function connect() {
    var profile;
    try {
      profile = {
        name: nameInput.value.trim() || "玩家",
        room: roomInput.value.trim().toUpperCase() || randomRoomCode(),
        server: normalizeServerUrl(serverInput.value),
        variant: selectedVariant(),
        seatCount: selectedSeatCount()
      };
    } catch (error) {
      setNotice(error.message);
      return;
    }

    saveProfile(profile);
    nameInput.value = profile.name;
    roomInput.value = profile.room;
    serverInput.value = profile.server;
    updatePlatformGuide();

    clearTimeout(state.reconnectTimer);

    if (state.socket) {
      state.socket.manualClose = true;
      state.socket.close();
    }

    setNotice("连接中");
    connectionStatus.textContent = "连接中";

    if (
      window.location.protocol === "https:" &&
      profile.server.indexOf("ws://") === 0 &&
      !/^ws:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/)/.test(profile.server)
    ) {
      connectionStatus.textContent = "连接受限";
      setNotice("HTTPS 页面需要 wss 联机地址；和人机玩请点“单机人机”");
      return;
    }

    var socket = isBrowserGameServer(profile.server) ? new BrowserGameSocket() : new WebSocket(profile.server);
    socket.manualClose = false;
    state.socket = socket;

    socket.addEventListener("open", function () {
      if (state.socket !== socket) {
        return;
      }
      connectionStatus.textContent = "已连接";
      setNotice("已连接");
      send({
        type: "join",
        name: profile.name,
        room: profile.room,
        clientId: state.clientId,
        variant: profile.variant,
        seatCount: profile.seatCount
      });
    });

    socket.addEventListener("message", function (event) {
      var data;
      if (state.socket !== socket) {
        return;
      }
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        return;
      }
      if (data.type === "view") {
        state.view = data.view;
        render();
        continueSoloAutoStart(data.view);
      }
      if (data.type === "error") {
        setNotice(data.message || "操作失败");
      }
    });

    socket.addEventListener("close", function () {
      if (state.socket !== socket) {
        return;
      }
      state.socket = null;
      if (socket.manualClose) {
        return;
      }
      connectionStatus.textContent = "重连中";
      if (isBrowserGameServer(profile.server)) {
        setNotice("浏览器牌局正在重启");
      } else if (isGithubPagesHost()) {
        setNotice("联机服务器已断开；和人机玩请点“单机人机”");
      } else {
        setNotice("连接断开，正在重连");
      }
      state.reconnectTimer = setTimeout(connect, 1800);
    });

    socket.addEventListener("error", function () {
      if (state.socket !== socket) {
        return;
      }
      connectionStatus.textContent = "连接失败";
      if (isBrowserGameServer(profile.server)) {
        state.soloAutoStart = false;
        setNotice("浏览器牌局启动失败，请刷新后重试");
      } else if (isGithubPagesHost()) {
        setNotice("联机服务器连接失败；和人机玩请点“单机人机”");
      } else {
        setNotice("连接失败");
      }
    });
  }

  function continueSoloAutoStart(view) {
    if (!state.soloAutoStart) {
      return;
    }
    if (view.phase === "playing") {
      state.soloAutoStart = false;
      return;
    }
    if (view.players.length < view.config.seatCount && view.canAddBot) {
      send({ type: "addBot" });
      return;
    }
    if (!view.player.ready) {
      send({ type: "ready" });
      return;
    }
    if (view.canStart) {
      state.soloAutoStart = false;
      send({ type: "startRound" });
    }
  }

  function tileMeta(type) {
    return TILE_DEFS[type] || {
      type: type,
      group: "unknown",
      rank: 0,
      rankLabel: "?",
      suit: "",
      label: "未知牌"
    };
  }

  function tileAsset(type) {
    if (type < 9) {
      return "assets/tiles/wan-" + (type + 1) + ".png";
    }
    if (type < 18) {
      return "assets/tiles/tong-" + (type - 8) + ".png";
    }
    if (type < 27) {
      return "assets/tiles/tiao-" + (type - 17) + ".png";
    }
    return {
      27: "assets/tiles/east.png",
      28: "assets/tiles/south.png",
      29: "assets/tiles/west.png",
      30: "assets/tiles/north.png",
      31: "assets/tiles/red.png",
      32: "assets/tiles/green.png",
      33: "assets/tiles/white.png"
    }[type] || "assets/tiles/back.png";
  }

  function createTileImage(src, label) {
    var image = document.createElement("img");
    image.className = "tile-image";
    image.src = src;
    image.alt = "";
    image.draggable = false;

    var fallback = document.createElement("span");
    fallback.className = "tile-fallback";
    fallback.textContent = label;

    return [image, fallback];
  }

  function createTile(tile, options) {
    var opts = options || {};
    var type = typeof tile === "number" ? tile : tile.type;
    var meta = tileMeta(type);
    var element = document.createElement(opts.button ? "button" : "div");
    element.className = opts.mini ? "mini-tile" : "tile";
    if (tile && tile.id) {
      element.dataset.tileId = tile.id;
    }
    if (opts.drawn) {
      element.className += " tile-drawn";
    }
    if (opts.selected) {
      element.className += " tile-selected";
      element.setAttribute("aria-pressed", "true");
    }
    if (opts.guideAdvice && opts.guideAdvice.level) {
      element.className += " tile-guide-" + opts.guideAdvice.level;
    }
    element.dataset.suit = meta.group;
    element.dataset.type = String(type);
    element.title = meta.label + (opts.selected ? "，再次点击确认出牌" : "");
    if (opts.guideAdvice) {
      element.title += "。建议：" + opts.guideAdvice.summary + "。效果：" + opts.guideAdvice.effect;
    }
    element.setAttribute("aria-label", meta.label);
    createTileImage(tileAsset(type), meta.label).forEach(function (node) {
      element.appendChild(node);
    });
    if (opts.guideAdvice && opts.guideAdvice.badge) {
      var badge = document.createElement("span");
      badge.className = "tile-guide-badge";
      badge.textContent = opts.guideAdvice.badge;
      badge.title = opts.guideAdvice.summary;
      element.appendChild(badge);
    }

    if (opts.button) {
      element.type = "button";
      element.disabled = Boolean(opts.disabled);
      element.addEventListener("click", function () {
        unlockAudio();
        opts.onClick(tile);
      });
    }
    return element;
  }

  function createTileBack() {
    var tile = document.createElement("div");
    tile.className = "tile-back";
    tile.setAttribute("aria-label", "牌背");
    createTileImage("assets/tiles/back.png", "牌背").forEach(function (node) {
      tile.appendChild(node);
    });
    return tile;
  }

  function renderMelds(melds, target, mini) {
    target.textContent = "";
    (melds || []).forEach(function (meld) {
      var set = document.createElement("div");
      set.className = "meld-set";
      meld.tiles.forEach(function (type) {
        set.appendChild(createTile(type, { mini: mini !== false }));
      });
      target.appendChild(set);
    });
  }

  function renderRules(view) {
    var config = view.config || {};
    rulesTitle.textContent = (config.variantLabel || "规则") + " · " + (config.seatCount || 3) + "人";
    rulesModalTitle.textContent = (config.variantLabel || "规则") + " · " + (config.seatCount || 3) + "人完整规则";
    rulesDetailsButton.setAttribute("aria-label", "查看" + (config.variantLabel || "规则") + "完整规则");
    rulesList.textContent = "";
    (config.rules || []).forEach(function (rule) {
      var item = document.createElement("li");
      item.textContent = rule;
      rulesList.appendChild(item);
    });
    renderDetailedRules(config);
  }

  function renderDetailedRules(config) {
    rulesDetailsContent.textContent = "";
    var sections = config.detailedRules || [];
    if (sections.length === 0) {
      sections = [{
        title: "规则",
        items: config.rules || []
      }];
    }

    sections.forEach(function (section) {
      var block = document.createElement("section");
      block.className = "rules-detail-section";

      var title = document.createElement("h3");
      title.textContent = section.title || "规则";
      block.appendChild(title);

      var list = document.createElement("ul");
      (section.items || []).forEach(function (rule) {
        var item = document.createElement("li");
        item.textContent = rule;
        list.appendChild(item);
      });
      block.appendChild(list);
      rulesDetailsContent.appendChild(block);
    });
  }

  function showRulesModal() {
    if (!state.view) {
      return;
    }
    rulesModal.hidden = false;
  }

  function hideRulesModal() {
    rulesModal.hidden = true;
  }

  function showGuideModal() {
    guideModal.hidden = false;
  }

  function hideGuideModal() {
    guideModal.hidden = true;
  }

  function clearGuideTargets() {
    document.querySelectorAll(".guide-target").forEach(function (element) {
      element.classList.remove("guide-target");
    });
  }

  function stopFullGuide() {
    state.guide.active = false;
    state.guide.currentKey = "";
    state.guide.round = null;
    state.guide.completed = false;
    guideCoach.hidden = true;
    if (guideAdvice) {
      guideAdvice.hidden = true;
    }
    gamePanel.classList.remove("has-guide-advice");
    clearGuideTargets();
  }

  function startFullGuide() {
    hideGuideModal();
    state.guide.active = true;
    state.guide.currentKey = "";
    state.guide.round = state.view && state.view.phase === "playing" ? state.view.round : null;
    state.guide.completed = false;
    guideCoach.hidden = false;
    playTone("select");
    updateGuideCoach(state.view);
  }

  function guideStep(key, title, text, target) {
    return {
      key: key,
      title: title,
      text: text,
      target: target
    };
  }

  function enabledActionButton(label) {
    return Array.from(actionRow.querySelectorAll("button")).find(function (button) {
      return button.textContent.trim() === label && !button.disabled;
    });
  }

  function enabledClaimButton() {
    return Array.from(claimBar.querySelectorAll("button")).find(function (button) {
      return !button.disabled;
    });
  }

  function firstEnabledHandTile() {
    return Array.from(handRow.querySelectorAll(".tile")).find(function (tile) {
      return !tile.disabled;
    });
  }

  function handTileById(tileId) {
    return Array.from(handRow.querySelectorAll(".tile")).find(function (tile) {
      return tile.dataset.tileId === String(tileId);
    });
  }

  function isNumberTile(type) {
    return type >= 0 && type < 27;
  }

  function isTerminalOrHonor(type) {
    var meta = tileMeta(type);
    return type >= 27 || meta.rank === 1 || meta.rank === 9;
  }

  function neighborType(type, offset) {
    var meta = tileMeta(type);
    var nextRank = meta.rank + offset;
    if (!isNumberTile(type) || nextRank < 1 || nextRank > 9) {
      return null;
    }
    return type + offset;
  }

  function countTypes(tiles) {
    var counts = {};
    (tiles || []).forEach(function (tile) {
      var type = typeof tile === "number" ? tile : tile.type;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  function selfOpenTypes(view) {
    return (view.selfMelds || []).flatMap(function (meld) {
      return meld.tiles || [];
    });
  }

  function visibleTypeCount(view, type) {
    var count = 0;
    (view.discardHistory || []).forEach(function (entry) {
      if (entry.tile && entry.tile.type === type) {
        count += 1;
      }
    });
    (view.players || []).forEach(function (player) {
      (player.melds || []).forEach(function (meld) {
        (meld.tiles || []).forEach(function (tileType) {
          if (tileType === type) {
            count += 1;
          }
        });
      });
    });
    return count;
  }

  function terminalHonorCount(view, exceptTileId) {
    var concealed = (view.hand || []).filter(function (tile) {
      return tile.id !== exceptTileId && isTerminalOrHonor(tile.type);
    }).length;
    var opened = selfOpenTypes(view).filter(isTerminalOrHonor).length;
    return concealed + opened;
  }

  function waitingLabel(view) {
    var waits = view.player && Array.isArray(view.player.waitingTypes) ? view.player.waitingTypes : [];
    if (!waits.length) {
      return "";
    }
    return waits.map(function (type) {
      return tileMeta(type).label;
    }).join("、");
  }

  function baseDiscardEffect(view, advice) {
    var parts = ["打出 " + advice.label + " 后，会结束你的出牌。"];
    var waits = waitingLabel(view);
    if (view.config && view.config.allowChow) {
      parts.push("别人可能吃、碰、杠或胡；无人响应就轮到下家摸牌。");
    } else {
      parts.push("别人可能碰、杠或胡；无人响应就轮到下家摸牌。");
    }
    if (waits) {
      parts.push("你现在已上听，当前听 " + waits + "。");
    }
    return parts.join("");
  }

  function discardAdviceList(view) {
    var counts = countTypes(view.hand || []);
    var lockedDiscardTileId = view.player ? view.player.lockedDiscardTileId : "";
    var drawnTileId = view.player ? view.player.drawnTileId : "";
    var baoType = view.bao && view.bao.revealed && view.player && view.player.baoSeen ? view.bao.type : null;
    var variant = view.config ? view.config.variant : "";
    var raw = (view.hand || []).map(function (tile) {
      var meta = tileMeta(tile.type);
      var same = counts[tile.type] || 0;
      var visible = visibleTypeCount(view, tile.type);
      var reasons = [];
      var score = 0;
      var legal = Boolean(view.canDiscard);
      var forced = false;

      if (lockedDiscardTileId && tile.id !== lockedDiscardTileId) {
        return {
          tile: tile,
          label: meta.label,
          legal: false,
          level: "blocked",
          badge: "锁",
          score: 99,
          summary: "看宝后不能改听，这张不能打",
          effect: "你已看宝锁定牌局，只能打刚摸到的那张牌。"
        };
      }

      if (lockedDiscardTileId && tile.id === lockedDiscardTileId) {
        forced = true;
        reasons.push("看宝后只能摸切");
        return {
          tile: tile,
          label: meta.label,
          legal: legal,
          level: "forced",
          badge: "摸切",
          score: -99,
          summary: "已看宝锁定，只能打刚摸到的 " + meta.label,
          effect: "打出它会保持原来的听口，继续等宝牌或幺鸡摸宝胡。",
          forced: true
        };
      }

      if (same >= 4) {
        score += 10;
        reasons.push("四张同牌有机会杠，通常别先拆");
      } else if (same === 3) {
        score += 8;
        reasons.push("三张同牌是刻子，价值较高");
      } else if (same === 2) {
        score += 5;
        reasons.push("对子可做将，也可能碰牌");
      }

      if (isNumberTile(tile.type)) {
        var left = neighborType(tile.type, -1);
        var right = neighborType(tile.type, 1);
        var nearLeft = neighborType(tile.type, -2);
        var nearRight = neighborType(tile.type, 2);
        var hasLeft = left !== null && counts[left] > 0;
        var hasRight = right !== null && counts[right] > 0;
        var hasNear = (nearLeft !== null && counts[nearLeft] > 0) || (nearRight !== null && counts[nearRight] > 0);

        if (hasLeft && hasRight) {
          score += 6;
          reasons.push("两边都有邻张，容易组成顺子");
        } else if (hasLeft || hasRight) {
          score += 3;
          reasons.push("旁边有搭子，留下来更容易进张");
        } else if (hasNear) {
          score += 1;
          reasons.push("隔一张有连接，价值一般");
        } else if (meta.rank === 1 || meta.rank === 9) {
          score -= 3;
          reasons.push("孤张幺九进张少，通常可以先处理");
        } else {
          score -= 1;
          reasons.push("孤张中张，暂时没有直接搭子");
        }
      } else if (same === 1) {
        score -= 2;
        reasons.push("单张字牌不能成顺，通常先处理");
      }

      if (variant === "dongbei" && isTerminalOrHonor(tile.type) && terminalHonorCount(view, tile.id) === 0) {
        score += 12;
        reasons.push("东北麻将胡牌常需要幺九或字牌，最后一张要谨慎");
      }

      if (baoType !== null && tile.type === baoType) {
        score += 12;
        reasons.push("这是你看过的宝牌，别主动打掉");
      }

      if (visible >= 3) {
        score -= 4;
        reasons.push("明面已见 " + visible + " 张，剩余少，保留价值下降");
      } else if (visible === 2) {
        score -= 2;
        reasons.push("明面已见 2 张，价值略降");
      }

      if (tile.id === drawnTileId) {
        reasons.push("这是刚摸到的牌");
      }

      return {
        tile: tile,
        label: meta.label,
        legal: legal,
        level: "normal",
        badge: "",
        score: score,
        summary: reasons[0] || "这张牌可以打，但不是特别明显的推荐",
        effect: "",
        forced: forced
      };
    });
    var legalItems = raw.filter(function (item) {
      return item.legal;
    }).sort(function (a, b) {
      return a.score - b.score || a.tile.type - b.tile.type;
    });
    legalItems.forEach(function (item, index) {
      if (item.forced) {
        item.level = "forced";
        item.badge = "摸切";
      } else if (index === 0 || (index === 1 && item.score <= legalItems[0].score + 2)) {
        item.level = "recommended";
        item.badge = "荐";
      } else if (item.score >= 8) {
        item.level = "caution";
        item.badge = "慎";
      }
      if (!item.forced) {
        item.effect = baseDiscardEffect(view, item);
      }
    });
    return raw;
  }

  function discardAdviceById(view) {
    var map = {};
    discardAdviceList(view).forEach(function (advice) {
      map[advice.tile.id] = advice;
    });
    return map;
  }

  function selectedAdvice(view) {
    if (!state.selectedTileId) {
      return null;
    }
    return discardAdviceById(view)[state.selectedTileId] || null;
  }

  function recommendedAdvice(view) {
    return discardAdviceList(view).filter(function (item) {
      return item.legal;
    }).sort(function (a, b) {
      return a.score - b.score || a.tile.type - b.tile.type;
    })[0] || null;
  }

  function selectTileForPreview(tileId, message) {
    state.selectedTileId = tileId;
    playTone("select");
    setNotice(message || "已选中，第二次点击同一张牌才会打出");
    renderHand(state.view);
    renderActions(state.view);
    renderGuideAdvice(state.view);
    updateGuideCoach(state.view);
  }

  function determineGuideStep(view) {
    var seatCount;
    var playerCount;
    var actionLabels;
    if (!view) {
      return guideStep(
        "join",
        "先进入房间",
        "填写名字和房号，或粘贴朋友发来的邀请码，然后加入房间。",
        joinForm
      );
    }

    seatCount = view.config ? Number(view.config.seatCount || 3) : 3;
    playerCount = Array.isArray(view.players) ? view.players.length : 0;

    if (view.phase === "lobby") {
      if (playerCount < seatCount) {
        if (view.canAddBot) {
          return guideStep(
            "fill-seats",
            "第 1 步：凑齐这一桌",
            "把邀请码发给朋友；如果人数不齐，点“补人机”补满座位。",
            addBotButton
          );
        }
        return guideStep(
          "wait-seats",
          "第 1 步：等房主凑齐人",
          "房主可以发邀请码或补人机。你先确认自己已经入座，等人数满了再准备。",
          playerList
        );
      }
      if (!view.player.ready) {
        return guideStep(
          "ready",
          "第 2 步：准备",
          "人齐后先点“准备”。所有真人准备好后，房主才能开局。",
          readyButton
        );
      }
      if (view.canStart) {
        return guideStep(
          "start",
          "第 3 步：开局",
          "你是房主，大家准备好了就点“开局”。",
          startButton
        );
      }
      return guideStep(
        "wait-start",
        "第 3 步：等房主开局",
        "你已经准备好，等房主点击开局。可以先看左侧规则卡。",
        rulesDetailsButton
      );
    }

    if (view.phase === "ended") {
      return guideStep(
        "round-ended",
        "本局完成",
        "这一局已经结束。查看结算后，可以点“再来”继续下一局，或退出房间。",
        endModal.hidden ? newRoundButton : endModal
      );
    }

    if (view.claimActions && view.claimActions.length > 0) {
      return guideStep(
        "claim",
        "响应别人打出的牌",
        "这里会出现吃、碰、杠、胡。胡会直接结算；碰/吃会拿走这张牌并轮到你出牌；不想改变手牌就点“过”。",
        enabledClaimButton() || claimBar
      );
    }

    if (view.canPeekBao) {
      return guideStep(
        "peek-bao",
        "上听后看宝",
        "你已经上听了。点“看宝”查看宝牌；看宝后锁定牌局，只能摸什么打什么，摸到宝牌或幺鸡可摸宝胡。",
        enabledActionButton("看宝") || baoTray.querySelector(".bao-peek-button") || baoTray
      );
    }

    actionLabels = (view.selfActions || []).map(function (action) {
      return action.action;
    });
    if (actionLabels.includes("baoHu")) {
      return guideStep(
        "bao-hu",
        "可以摸宝胡",
        "你已看宝并摸到了宝牌或幺鸡。点“摸宝胡”会立刻结束本局并按宝胡分结算。",
        enabledActionButton("摸宝胡") || actionRow
      );
    }
    if (actionLabels.includes("hu")) {
      return guideStep(
        "self-hu",
        "可以胡牌",
        "你当前可以自摸胡。点“胡”会结束本局并结算；如果想放弃胡牌，也可以继续按出牌建议打牌。",
        enabledActionButton("胡") || actionRow
      );
    }
    if (actionLabels.includes("kong")) {
      return guideStep(
        "self-kong",
        "可以杠",
        "你手里有可杠的牌。点“杠”会亮出四张并补摸一张，可能杠上开花，也会产生杠分。",
        enabledActionButton("杠") || actionRow
      );
    }
    if (view.canDraw) {
      return guideStep(
        "draw",
        "轮到你摸牌",
        "点“摸牌”拿一张新牌。摸完后再选择要打出的牌。",
        enabledActionButton("摸牌") || actionRow
      );
    }
    if (view.canDiscard) {
      var advice = selectedAdvice(view);
      var recommended = recommendedAdvice(view);
      if (state.selectedTileId) {
        return guideStep(
          "confirm-discard",
          "确认打出 " + (advice ? advice.label : "这张牌"),
          advice
            ? advice.summary + "。打出后的效果：" + advice.effect + " 再次点击高亮手牌才会真正打出。"
            : "已高亮选中的牌。再次点击同一张牌，才会真正打出。",
          handRow.querySelector(".tile-selected") || handRow
        );
      }
      return guideStep(
        "discard",
        recommended ? "建议先看 " + recommended.label : "选择要打出的牌",
        recommended
          ? recommended.summary + "。打出后的效果：" + recommended.effect + " 先点它高亮，再点一次确认。"
          : "先点一张手牌让它高亮；为了防误触，第二次点同一张牌才会打出。",
        (recommended && handTileById(recommended.tile.id)) || firstEnabledHandTile() || guideAdvice || handRow
      );
    }

    return guideStep(
      "watch",
      "观察牌河",
      "现在是别人回合。看下方牌河，记住每个人打过的牌，等轮到你或出现可响应按钮。",
      discardRiver
    );
  }

  function updateGuideCoach(view) {
    var step;
    if (!state.guide.active) {
      guideCoach.hidden = true;
      clearGuideTargets();
      return;
    }

    step = determineGuideStep(view);
    guideCoach.hidden = false;
    guideCoachStep.textContent = step.key === "round-ended" ? "新手指导 · 完成" : "新手指导 · 全程";
    guideCoachTitle.textContent = step.title;
    guideCoachText.textContent = step.text;

    clearGuideTargets();
    if (step.target && step.target.classList && !step.target.hidden) {
      step.target.classList.add("guide-target");
    }
    if (state.guide.currentKey !== step.key) {
      state.guide.currentKey = step.key;
      playTone(step.key === "round-ended" ? "end" : "select");
    }
  }

  function updateSoundButton() {
    soundButton.textContent = state.soundEnabled ? "提示音开" : "提示音关";
    soundButton.setAttribute("aria-pressed", state.soundEnabled ? "true" : "false");
    soundButton.title = state.soundEnabled ? "轮到你、可响应、看宝和结算时会播放提示音" : "点击开启回合提示音";
  }

  function setSoundEnabled(enabled) {
    state.soundEnabled = Boolean(enabled);
    localStorage.setItem(STORAGE_KEY + ".sound", state.soundEnabled ? "on" : "off");
    updateSoundButton();
    if (state.soundEnabled) {
      unlockAudio();
      playTone("select");
    }
  }

  function unlockAudio() {
    var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!state.soundEnabled || !AudioContextCtor) {
      return null;
    }
    if (!state.audioContext) {
      state.audioContext = new AudioContextCtor();
    }
    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  function tonePattern(kind) {
    return {
      turn: [660, 880],
      claim: [520, 660, 780],
      bao: [760, 1040],
      end: [420, 330],
      select: [620],
      discard: [360]
    }[kind] || [560];
  }

  function playTone(kind) {
    var context = unlockAudio();
    var notes = tonePattern(kind);
    if (!context || !notes.length) {
      return;
    }
    notes.forEach(function (frequency, index) {
      var start = context.currentTime + index * 0.065;
      var oscillator = context.createOscillator();
      var gain = context.createGain();
      oscillator.type = kind === "discard" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "turn" || kind === "bao" ? 0.085 : 0.055, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.15);
    });
  }

  function pulseElement(element, className) {
    if (!element) {
      return;
    }
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    setTimeout(function () {
      element.classList.remove(className);
    }, 760);
  }

  function clearInvalidSelection(view) {
    if (!state.selectedTileId || !view.canDiscard) {
      state.selectedTileId = null;
      return;
    }
    if (!view.hand.some(function (tile) {
      return tile.id === state.selectedTileId;
    })) {
      state.selectedTileId = null;
      return;
    }
    if (view.player && view.player.lockedDiscardTileId && state.selectedTileId !== view.player.lockedDiscardTileId) {
      state.selectedTileId = null;
    }
  }

  function notifyForView(view) {
    var claimActions = Array.isArray(view.claimActions) ? view.claimActions : [];
    var selfTurn = Boolean(view.canDraw || view.canDiscard);
    var turnSignal = [
      view.phase,
      view.round,
      view.turnSeat,
      view.canDraw ? "draw" : "",
      view.canDiscard ? "discard" : ""
    ].join(":");
    var claimSignal = claimActions.map(function (action) {
      return action.id;
    }).join("|");
    var baoSignal = view.canPeekBao ? view.round + ":" + view.wallCount + ":" + view.player.seat : "";
    var endSignal = view.phase === "ended" ? view.round + ":" + (view.result || "") : "";

    gamePanel.classList.toggle("is-my-turn", selfTurn);
    gamePanel.classList.toggle("has-claim", claimActions.length > 0);
    gamePanel.classList.toggle("can-peek-bao", Boolean(view.canPeekBao));

    if (selfTurn && state.lastSignals.turn !== turnSignal) {
      playTone("turn");
      pulseElement(gamePanel, "attention-pulse");
      pulseElement(soundButton, "sound-pulse");
    }
    if (claimSignal && state.lastSignals.claim !== claimSignal) {
      playTone("claim");
      pulseElement(claimBar, "attention-pulse");
    }
    if (baoSignal && state.lastSignals.bao !== baoSignal) {
      playTone("bao");
      pulseElement(actionRow, "attention-pulse");
    }
    if (endSignal && state.lastSignals.end !== endSignal) {
      playTone("end");
    }

    state.lastSignals = {
      turn: turnSignal,
      claim: claimSignal,
      bao: baoSignal,
      end: endSignal
    };
  }

  function actionLabel(action) {
    if (action.action === "hu") {
      return "胡";
    }
    if (action.action === "baoHu") {
      return "摸宝胡";
    }
    if (action.action === "pong") {
      return "碰";
    }
    if (action.action === "kong") {
      return "杠";
    }
    if (action.action === "chow") {
      return "吃 " + action.tiles.map(function (type) {
        return tileMeta(type).label;
      }).join(" ");
    }
    return action.action;
  }

  function formatDelta(value) {
    var number = Number(value || 0);
    return (number > 0 ? "+" : "") + number;
  }

  function renderEndResult(view) {
    var scoreResult = view.scoreResult || null;
    endResult.textContent = "";

    var title = document.createElement("p");
    title.className = "end-result-title";
    title.textContent = view.result || "本局结束";
    endResult.appendChild(title);

    if (!scoreResult) {
      return;
    }

    if (scoreResult.winSummaries && scoreResult.winSummaries.length > 0) {
      var wins = document.createElement("div");
      wins.className = "score-detail-list";
      scoreResult.winSummaries.forEach(function (summary) {
        var line = document.createElement("p");
        line.textContent = summary.playerName + "：" + summary.items.join("，") + " => 每家/点炮者 " + summary.points + " 分";
        wins.appendChild(line);
      });
      endResult.appendChild(wins);
    }

    var deltas = document.createElement("div");
    deltas.className = "score-deltas";
    (scoreResult.deltas || []).forEach(function (item) {
      var chip = document.createElement("span");
      chip.className = "score-chip";
      chip.dataset.positive = Number(item.delta || 0) >= 0 ? "true" : "false";
      chip.textContent = item.name + " " + formatDelta(item.delta) + " / 总 " + item.total;
      deltas.appendChild(chip);
    });
    endResult.appendChild(deltas);

    if (scoreResult.transfers && scoreResult.transfers.length > 0) {
      var transfers = document.createElement("details");
      transfers.className = "score-transfers";
      var summaryLabel = document.createElement("summary");
      summaryLabel.textContent = "计分明细";
      transfers.appendChild(summaryLabel);
      scoreResult.transfers.forEach(function (transfer) {
        var row = document.createElement("p");
        row.textContent = transfer.fromName + " -> " + transfer.toName + "：" + transfer.points + " 分（" + transfer.reason + "）";
        transfers.appendChild(row);
      });
      endResult.appendChild(transfers);
    }
  }

  function claimShortLabel(action) {
    return {
      hu: "胡",
      pong: "碰",
      kong: "杠",
      chow: "吃"
    }[action] || "";
  }

  function createActionButton(label, kind, onClick) {
    var button = document.createElement("button");
    button.className = "action-button";
    button.dataset.kind = kind || "";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", function (event) {
      unlockAudio();
      onClick(event);
    });
    return button;
  }

  function renderPlayers(view) {
    playerList.textContent = "";
    view.players.forEach(function (player) {
      var item = document.createElement("div");
      item.className = "player-item";
      item.dataset.bot = player.bot ? "true" : "false";

      var dot = document.createElement("div");
      dot.className = "seat-dot";
      dot.textContent = String(player.seat + 1);

      var text = document.createElement("div");
      var name = document.createElement("div");
      name.className = "player-name";
      name.textContent = player.name + (player.isSelf ? "（我）" : "");
      var status = document.createElement("div");
      status.className = "player-state";
      if (view.phase === "playing") {
        status.textContent = player.baoSeen ? "已看宝" : (player.ting ? "已上听" : (player.bot ? "人机进行中" : "进行中"));
      } else if (player.bot) {
        status.textContent = "人机已就位";
      } else {
        status.textContent = player.connected ? (player.ready ? "已准备" : "未准备") : "离线";
      }
      status.textContent += " · 总分 " + Number(player.score || 0);
      text.append(name, status);

      var count = document.createElement("div");
      count.className = "player-state";
      count.textContent = view.phase === "ended" ? formatDelta(player.roundDelta) : player.handCount + " 张";

      item.append(dot, text, count);
      playerList.appendChild(item);
    });
  }

  function renderSeat(container, player) {
    container.textContent = "";
    container.hidden = !player;
    if (!player) {
      return;
    }

    var header = document.createElement("div");
    header.className = "seat-header";
    var name = document.createElement("div");
    name.className = "seat-name";
    name.textContent = player.name;
    var count = document.createElement("div");
    count.className = "seat-count";
    count.textContent = player.baoSeen ? "已看宝" : (player.ting ? "已上听" : player.handCount + " 张");
    header.append(name, count);

    var backs = document.createElement("div");
    backs.className = "mini-row";
    for (var i = 0; i < Math.min(player.handCount, 14); i += 1) {
      backs.appendChild(createTileBack());
    }

    var melds = document.createElement("div");
    melds.className = "meld-row";
    renderMelds(player.melds, melds, true);

    var discards = document.createElement("div");
    discards.className = "discard-row";
    player.discards.forEach(function (tile) {
      discards.appendChild(createTile(tile.type, { mini: true }));
    });

    container.append(header, backs, melds, discards);
  }

  function renderSeats(view) {
    seatTop.hidden = true;
    seatTop.textContent = "";
    seatLeft.hidden = true;
    seatRight.hidden = true;
    seatLeft.textContent = "";
    seatRight.textContent = "";

    var selfSeat = view.player ? view.player.seat : 0;
    var seatCount = view.config ? view.config.seatCount : 3;
    view.players.forEach(function (player) {
      if (player.isSelf) {
        return;
      }
      var delta = (player.seat - selfSeat + seatCount) % seatCount;
      if (seatCount === 4 && delta === 2) {
        renderSeat(seatTop, player);
      } else {
        renderSeat(delta === 1 ? seatRight : seatLeft, player);
      }
    });
  }

  function renderDiscardRiver(view) {
    discardRiver.textContent = "";
    var history = Array.isArray(view.discardHistory) ? view.discardHistory : [];
    view.players.forEach(function (player) {
      var group = document.createElement("section");
      group.className = "river-group";
      if (player.isSelf) {
        group.dataset.self = "true";
      }

      var title = document.createElement("div");
      title.className = "river-title";
      title.textContent = player.name + (player.isSelf ? "（我）" : "");

      var tiles = document.createElement("div");
      tiles.className = "river-tiles";
      var playerDiscards = history.length > 0
        ? history.filter(function (entry) {
          return entry.fromSeat === player.seat;
        })
        : player.discards.map(function (tile) {
          return { tile: tile, fromSeat: player.seat, claim: null };
        });

      if (playerDiscards.length === 0) {
        var empty = document.createElement("span");
        empty.className = "river-empty";
        empty.textContent = "未出牌";
        tiles.appendChild(empty);
      } else {
        playerDiscards.forEach(function (entry) {
          var tile = createTile(entry.tile.type, { mini: true });
          var claim = claimShortLabel(entry.claim);
          if (claim) {
            tile.className += " mini-tile-claimed";
            tile.dataset.claim = claim;
            tile.title = tile.title + "（已" + claim + "）";
          }
          tiles.appendChild(tile);
        });
      }

      group.append(title, tiles);
      discardRiver.appendChild(group);
    });
  }

  function renderGuideAdvice(view) {
    var adviceItems;
    var selected;
    var legalItems;
    var header;
    var title;
    var note;
    var cards;
    if (!guideAdvice) {
      return;
    }
    guideAdvice.textContent = "";
    guideAdvice.hidden = !(state.guide.active && view && view.canDiscard);
    gamePanel.classList.toggle("has-guide-advice", !guideAdvice.hidden);
    if (guideAdvice.hidden) {
      return;
    }

    adviceItems = discardAdviceList(view);
    selected = selectedAdvice(view);
    legalItems = adviceItems.filter(function (item) {
      return item.legal;
    }).sort(function (a, b) {
      return a.score - b.score || a.tile.type - b.tile.type;
    });

    header = document.createElement("div");
    header.className = "guide-advice-header";
    title = document.createElement("strong");
    title.textContent = selected ? "已选 " + selected.label : "出牌建议";
    note = document.createElement("span");
    if (selected) {
      note.textContent = selected.summary + "。再次点击手牌会打出；想换牌就点另一张。";
    } else if (view.player && view.player.lockedDiscardTileId) {
      note.textContent = "你已看宝，不能换听，这轮只能摸切高亮的那张。";
    } else {
      note.textContent = "绿色“荐”是相对更适合先打的牌；点建议卡或手牌只会先高亮。";
    }
    header.append(title, note);
    guideAdvice.appendChild(header);

    if (selected) {
      var selectedEffect = document.createElement("p");
      selectedEffect.className = "guide-advice-effect";
      selectedEffect.textContent = selected.effect;
      guideAdvice.appendChild(selectedEffect);
    }

    cards = document.createElement("div");
    cards.className = "guide-advice-cards";
    legalItems.slice(0, 4).forEach(function (advice) {
      var card = document.createElement("button");
      var text = document.createElement("span");
      var cardTitle = document.createElement("strong");
      var cardNote = document.createElement("span");
      card.className = "guide-advice-card";
      card.dataset.level = advice.level;
      card.type = "button";
      card.title = advice.summary + "。" + advice.effect;
      card.appendChild(createTile(advice.tile.type, { mini: true }));
      cardTitle.textContent = advice.label + (advice.badge ? " · " + advice.badge : "");
      cardNote.textContent = advice.summary;
      text.append(cardTitle, cardNote);
      card.appendChild(text);
      card.addEventListener("click", function () {
        selectTileForPreview(advice.tile.id, "已选中 " + advice.label + "，再点手牌确认出牌");
      });
      cards.appendChild(card);
    });
    guideAdvice.appendChild(cards);

    if (legalItems.length > 4) {
      var more = document.createElement("p");
      more.className = "guide-advice-more";
      more.textContent = "还有 " + (legalItems.length - 4) + " 张也能打；点任意手牌会显示这张牌的解释。";
      guideAdvice.appendChild(more);
    }
  }

  function renderHand(view) {
    handRow.textContent = "";
    var adviceMap = state.guide.active && view.canDiscard ? discardAdviceById(view) : {};
    var drawnTileId = view.player ? view.player.drawnTileId : "";
    var lockedDiscardTileId = view.player ? view.player.lockedDiscardTileId : "";
    view.hand.forEach(function (tile) {
      var lockedOut = Boolean(lockedDiscardTileId && tile.id !== lockedDiscardTileId);
      handRow.appendChild(createTile(tile, {
        button: true,
        disabled: !view.canDiscard || lockedOut,
        drawn: tile.id === drawnTileId,
        guideAdvice: adviceMap[tile.id],
        selected: tile.id === state.selectedTileId,
        onClick: function (selected) {
          if (!view.canDiscard) {
            return;
          }
          if (state.selectedTileId !== selected.id) {
            selectTileForPreview(selected.id, "已选中，第二次点击同一张牌才会打出");
            return;
          }
          state.selectedTileId = null;
          playTone("discard");
          send({ type: "discard", tileId: selected.id });
        }
      }));
    });

    renderMelds(view.selfMelds, selfMelds, true);
  }

  function requestPeekBao() {
    playTone("bao");
    send({ type: "peekBao" });
  }

  function renderActions(view) {
    actionRow.textContent = "";
    claimBar.textContent = "";
    claimBar.hidden = true;

    if (view.canPeekBao) {
      actionRow.appendChild(createActionButton("看宝", "peekBao", requestPeekBao));
      var peekHint = document.createElement("span");
      peekHint.className = "player-state action-hint";
      peekHint.textContent = "看宝后锁定牌局；之后只能摸切";
      actionRow.appendChild(peekHint);
    }

    if (view.canDraw) {
      actionRow.appendChild(createActionButton("摸牌", "draw", function () {
        send({ type: "draw" });
      }));
      if (view.player.ting && view.bao && view.bao.revealed && view.player.baoSeen) {
        var drawHint = document.createElement("span");
        drawHint.className = "player-state action-hint";
        drawHint.textContent = "已看宝，摸到宝牌或幺鸡可摸宝胡";
        actionRow.appendChild(drawHint);
      }
    }

    view.selfActions.forEach(function (action) {
      actionRow.appendChild(createActionButton(actionLabel(action), action.action, function () {
        send({ type: "selfAction", actionId: action.id });
      }));
    });

    if (view.phase === "playing" && view.canDiscard) {
      var hint = document.createElement("span");
      var advice = selectedAdvice(view);
      hint.className = "player-state action-hint discard-confirm-hint";
      if (advice) {
        hint.textContent = advice.summary + "；再点高亮手牌确认";
      } else if (view.player && view.player.lockedDiscardTileId) {
        hint.textContent = state.selectedTileId ? "再次点击确认摸切" : "已看宝，只能打刚摸到的牌";
      } else {
        hint.textContent = state.guide.active ? "看出牌建议，先点推荐牌，高亮后再点一次" : "先点一张牌，高亮后再点一次出牌";
      }
      actionRow.appendChild(hint);
    }

    if (view.claimActions.length > 0) {
      claimBar.hidden = false;
      view.claimActions.forEach(function (action) {
        claimBar.appendChild(createActionButton(actionLabel(action), action.action, function () {
          send({ type: "claim", actionId: action.id });
        }));
      });
      claimBar.appendChild(createActionButton("过", "pass", function () {
        send({ type: "claim", actionId: "pass" });
      }));
    }
  }

  function renderCenter(view) {
    roundLabel.textContent = "第 " + view.round + " 局";
    diceTray.textContent = "";
    diceTray.hidden = !(view.dice && view.dice.values);
    if (!diceTray.hidden) {
      view.dice.values.forEach(function (value) {
        var die = document.createElement("span");
        die.className = "die";
        die.textContent = String(value);
        diceTray.appendChild(die);
      });
    }
    renderBao(view);
    if (view.phase === "ended") {
      turnLabel.innerHTML = "";
      var result = document.createElement("span");
      result.className = "result-banner";
      result.textContent = view.result || "本局结束";
      turnLabel.appendChild(result);
    } else if (view.turnName) {
      turnLabel.textContent = view.turnName + " 的回合";
    } else {
      turnLabel.textContent = view.players.length + "/" + (view.config ? view.config.seatCount : 3) + " 入座";
    }

    lastDiscard.textContent = "";
    if (view.lastDiscard) {
      lastDiscard.appendChild(createTile(view.lastDiscard.tile.type, {}));
    }
  }

  function renderBao(view) {
    baoTray.textContent = "";
    baoTray.hidden = !view.bao;
    baoTray.classList.toggle("has-peek-action", Boolean(view.canPeekBao));
    if (!view.bao) {
      return;
    }

    var label = document.createElement("span");
    label.className = "bao-label";
    label.textContent = "宝牌";

    var tileWrap = document.createElement("div");
    tileWrap.className = "bao-tile";
    if (view.bao.revealed && typeof view.bao.type === "number") {
      tileWrap.appendChild(createTile(view.bao.type, { mini: true }));
    } else {
      tileWrap.appendChild(createTileBack());
    }

    var note = document.createElement("span");
    note.className = "bao-note";
    if (view.bao.revealed) {
      var visibleCount = Number(view.bao.visibleCount || 0);
      var seenPrefix = view.bao.allSeen ? "全员已看宝" : "你已看宝";
      note.textContent = (view.bao.label || tileMeta(view.bao.type).label) +
        " · " + seenPrefix + " · 明面" + visibleCount + "/3";
    } else if (view.canPeekBao) {
      note.textContent = "已上听，可点看宝";
    } else {
      note.textContent = view.bao.label || "上听后点看宝";
    }
    if (view.bao.dice && view.bao.dice.values) {
      note.title = "看宝骰子：" + view.bao.dice.values.join(" + ") + " = " + view.bao.dice.total +
        "\n明面数量：牌河和副露里已经亮出的宝牌数量，满 3 张会换宝";
    } else {
      note.title = "只有已上听且已选择看宝的人能看到宝牌；看宝后只能摸切";
    }

    baoTray.append(label, tileWrap, note);
    if (view.canPeekBao) {
      var peekButton = createActionButton("看宝", "peekBao", requestPeekBao);
      peekButton.className += " bao-peek-button";
      baoTray.appendChild(peekButton);
    }
  }

  function renderLog(view) {
    eventLog.textContent = "";
    view.events.slice().reverse().forEach(function (entry) {
      var line = document.createElement("p");
      line.textContent = entry;
      eventLog.appendChild(line);
    });
  }

  function showEndModal(view) {
    if (view.phase !== "ended") {
      state.endDialogRound = null;
      endModal.hidden = true;
      return;
    }
    if (state.endDialogRound === view.round) {
      return;
    }
    state.endDialogRound = view.round;
    renderEndResult(view);
    modalNewRoundButton.disabled = !view.canStart;
    endModal.hidden = false;
  }

  function hideEndModal() {
    endModal.hidden = true;
  }

  function resetToLobby() {
    clearTimeout(state.reconnectTimer);
    if (state.socket) {
      state.socket.manualClose = true;
      state.socket.close();
    }
    state.socket = null;
    state.view = null;
    state.soloAutoStart = false;
    state.endDialogRound = null;
    state.selectedTileId = null;
    state.lastSignals = {};
    stopFullGuide();
    hideEndModal();
    hideRulesModal();
    hideGuideModal();
    lobbyPanel.hidden = false;
    gamePanel.hidden = true;
    connectionStatus.textContent = "未连接";
    roomStatus.textContent = "房间 --";
    wallStatus.textContent = "牌山 --";
    setNotice("已退出房间");
  }

  function render() {
    var view = state.view;
    if (!view) {
      return;
    }

    lobbyPanel.hidden = true;
    gamePanel.hidden = false;
    connectionStatus.textContent = view.connected ? "已连接" : "已断开";
    roomStatus.textContent = "房间 " + view.room;
    wallStatus.textContent = "牌山 " + view.wallCount;
    activeRoomLabel.textContent = view.room;
    if (document.activeElement !== activeNameInput) {
      activeNameInput.value = view.player.name || nameInput.value;
    }
    if (view.config) {
      roomConfigLabel.textContent = view.config.variantLabel + " · " + view.config.seatCount + "人局";
      setRadioValue(variantInputs, view.config.variant);
      setRadioValue(seatCountInputs, view.config.seatCount);
    }
    clearInvalidSelection(view);
    readyButton.textContent = view.player.ready ? "取消准备" : "准备";
    readyButton.disabled = view.phase === "playing";
    addBotButton.disabled = !view.canAddBot;
    startButton.disabled = !view.canStart;
    newRoundButton.hidden = view.phase !== "ended";

    renderPlayers(view);
    renderSeats(view);
    renderRules(view);
    renderDiscardRiver(view);
    renderCenter(view);
    renderHand(view);
    renderActions(view);
    renderGuideAdvice(view);
    renderLog(view);
    notifyForView(view);
    showEndModal(view);
    updateGuideCoach(view);
  }

  joinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    unlockAudio();
    connect();
  });

  randomRoomButton.addEventListener("click", function () {
    unlockAudio();
    roomInput.value = randomRoomCode();
    inviteInput.value = "";
    updatePlatformGuide();
    setNotice("新房号已生成，房主先创建");
  });

  [nameInput, roomInput, serverInput].forEach(function (input) {
    input.addEventListener("input", updatePlatformGuide);
  });

  variantInputs.concat(seatCountInputs).forEach(function (input) {
    input.addEventListener("change", updatePlatformGuide);
  });

  if (soloPlayButton) {
    soloPlayButton.addEventListener("click", function () {
      unlockAudio();
      roomInput.value = randomRoomCode();
      inviteInput.value = "";
      serverInput.value = BROWSER_GAME_SERVER;
      state.soloAutoStart = true;
      setNotice("正在创建单机人机牌局");
      connect();
    });
  }

  applyInviteButton.addEventListener("click", function () {
    unlockAudio();
    applyInviteCode(inviteInput.value, true);
  });

  profileForm.addEventListener("submit", function (event) {
    var nextName;
    event.preventDefault();
    unlockAudio();
    nextName = activeNameInput.value.trim();
    if (!nextName) {
      setNotice("名字不能为空");
      return;
    }
    nameInput.value = nextName;
    updateSavedName(nextName);
    send({ type: "rename", name: nextName });
  });

  readyButton.addEventListener("click", function () {
    unlockAudio();
    send({ type: "ready" });
  });

  addBotButton.addEventListener("click", function () {
    unlockAudio();
    send({ type: "addBot" });
  });

  startButton.addEventListener("click", function () {
    unlockAudio();
    send({ type: "startRound" });
  });

  newRoundButton.addEventListener("click", function () {
    unlockAudio();
    send({ type: "newRound" });
  });

  modalNewRoundButton.addEventListener("click", function () {
    unlockAudio();
    hideEndModal();
    send({ type: "newRound" });
  });

  modalExitButton.addEventListener("click", function () {
    unlockAudio();
    resetToLobby();
  });

  rulesDetailsButton.addEventListener("click", showRulesModal);

  rulesCloseButton.addEventListener("click", hideRulesModal);

  soundButton.addEventListener("click", function () {
    setSoundEnabled(!state.soundEnabled);
  });

  guideButton.addEventListener("click", function () {
    unlockAudio();
    showGuideModal();
  });

  guideCloseButton.addEventListener("click", hideGuideModal);

  guideExitButton.addEventListener("click", function () {
    hideGuideModal();
    stopFullGuide();
  });

  guideStartButton.addEventListener("click", function () {
    unlockAudio();
    startFullGuide();
  });

  guideCoachExitButton.addEventListener("click", stopFullGuide);

  rulesModal.addEventListener("click", function (event) {
    if (event.target === rulesModal) {
      hideRulesModal();
    }
  });

  guideModal.addEventListener("click", function (event) {
    if (event.target === guideModal) {
      hideGuideModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !rulesModal.hidden) {
      hideRulesModal();
    }
    if (event.key === "Escape" && !guideModal.hidden) {
      hideGuideModal();
    }
  });

  copyRoomButton.addEventListener("click", function () {
    unlockAudio();
    var view = state.view;
    var profile = loadProfile();
    var room = view ? view.room : roomInput.value;
    var server = profile.server || serverInput.value;
    var inviteCode = createInviteCode(room, server);
    var pageUrl = new URL(window.location.href);
    pageUrl.search = "";
    pageUrl.searchParams.set("invite", inviteCode);
    var text = [
      "邀请码：" + inviteCode,
      "房间：" + room,
      "服务器：" + server,
      "页面：" + pageUrl.toString()
    ].join("\n");
    inviteInput.value = inviteCode;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        setNotice("已复制邀请码");
      });
    }
  });

  document.addEventListener("pointerdown", unlockAudio, { once: true });
  updateSoundButton();
  initForm();
  if (!inviteInput.value && (getQuery().get("join") === "1" || getQuery().get("autojoin") === "1")) {
    setTimeout(connect, 0);
  }
}());
