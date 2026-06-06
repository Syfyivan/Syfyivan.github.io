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
  var roomInput = document.getElementById("roomInput");
  var nameInput = document.getElementById("nameInput");
  var serverInput = document.getElementById("serverInput");
  var inviteInput = document.getElementById("inviteInput");
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
  var handRow = document.getElementById("handRow");
  var actionRow = document.getElementById("actionRow");

  var state = {
    socket: null,
    view: null,
    reconnectTimer: null,
    endDialogRound: null,
    clientId: getClientId()
  };

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

  function randomRoomCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 5; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
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
    if (window.location.hostname.endsWith("github.io")) {
      return "ws://localhost:8787/mahjong/ws";
    }
    var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return protocol + "//" + window.location.host + "/mahjong/ws";
  }

  function normalizeServerUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) {
      return defaultServerUrl();
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
    nameInput.value = query.get("name") || profile.name || "玩家" + Math.floor(Math.random() * 90 + 10);
    roomInput.value = (query.get("room") || profile.room || randomRoomCode()).toUpperCase();
    serverInput.value = query.get("server") || profile.server || defaultServerUrl();
    setRadioValue(variantInputs, query.get("variant") || profile.variant || "sichuan");
    setRadioValue(seatCountInputs, query.get("seatCount") || profile.seatCount || 3);
    inviteInput.value = query.get("invite") || "";
    if (window.location.hostname.endsWith("github.io")) {
      setNotice("粘贴房主邀请码或打开房主局域网页面");
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
      setNotice("HTTPS 页面需要 wss 邀请码，或打开房主局域网页面");
      return;
    }

    var socket = new WebSocket(profile.server);
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
      if (window.location.hostname.endsWith("github.io")) {
        setNotice("GitHub Pages 不运行房间服务器");
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
      if (window.location.hostname.endsWith("github.io")) {
        setNotice("请使用 npm run mahjong:lan 打印的地址");
      } else {
        setNotice("连接失败");
      }
    });
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
    if (opts.drawn) {
      element.className += " tile-drawn";
    }
    element.dataset.suit = meta.group;
    element.dataset.type = String(type);
    element.title = meta.label;
    element.setAttribute("aria-label", meta.label);
    createTileImage(tileAsset(type), meta.label).forEach(function (node) {
      element.appendChild(node);
    });

    if (opts.button) {
      element.type = "button";
      element.disabled = Boolean(opts.disabled);
      element.addEventListener("click", function () {
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
    button.addEventListener("click", onClick);
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
      text.append(name, status);

      var count = document.createElement("div");
      count.className = "player-state";
      count.textContent = player.handCount + " 张";

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

  function renderHand(view) {
    handRow.textContent = "";
    var drawnTileId = view.player ? view.player.drawnTileId : "";
    view.hand.forEach(function (tile) {
      handRow.appendChild(createTile(tile, {
        button: true,
        disabled: !view.canDiscard,
        drawn: tile.id === drawnTileId,
        onClick: function (selected) {
          send({ type: "discard", tileId: selected.id });
        }
      }));
    });

    renderMelds(view.selfMelds, selfMelds, true);
  }

  function renderActions(view) {
    actionRow.textContent = "";
    claimBar.textContent = "";
    claimBar.hidden = true;

    if (view.canPeekBao) {
      actionRow.appendChild(createActionButton("看宝", "peekBao", function () {
        send({ type: "peekBao" });
      }));
      var peekHint = document.createElement("span");
      peekHint.className = "player-state action-hint";
      peekHint.textContent = "看宝后锁定听口";
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
      hint.className = "player-state";
      hint.textContent = "请选择一张牌";
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
    } else {
      note.textContent = view.bao.label || "上听后可选择看宝";
    }
    if (view.bao.dice && view.bao.dice.values) {
      note.title = "看宝骰子：" + view.bao.dice.values.join(" + ") + " = " + view.bao.dice.total +
        "\n明面数量：牌河和副露里已经亮出的宝牌数量，满 3 张会换宝";
    } else {
      note.title = "只有已上听且已选择看宝的人能看到宝牌；看宝后不能换听";
    }

    baoTray.append(label, tileWrap, note);
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
    endResult.textContent = view.result || "本局结束";
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
    state.endDialogRound = null;
    hideEndModal();
    hideRulesModal();
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
    renderLog(view);
    showEndModal(view);
  }

  joinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    connect();
  });

  randomRoomButton.addEventListener("click", function () {
    roomInput.value = randomRoomCode();
    inviteInput.value = "";
    setNotice("新房号已生成，房主先创建");
  });

  applyInviteButton.addEventListener("click", function () {
    applyInviteCode(inviteInput.value, true);
  });

  profileForm.addEventListener("submit", function (event) {
    var nextName;
    event.preventDefault();
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
    send({ type: "ready" });
  });

  addBotButton.addEventListener("click", function () {
    send({ type: "addBot" });
  });

  startButton.addEventListener("click", function () {
    send({ type: "startRound" });
  });

  newRoundButton.addEventListener("click", function () {
    send({ type: "newRound" });
  });

  modalNewRoundButton.addEventListener("click", function () {
    hideEndModal();
    send({ type: "newRound" });
  });

  modalExitButton.addEventListener("click", function () {
    resetToLobby();
  });

  rulesDetailsButton.addEventListener("click", showRulesModal);

  rulesCloseButton.addEventListener("click", hideRulesModal);

  rulesModal.addEventListener("click", function (event) {
    if (event.target === rulesModal) {
      hideRulesModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !rulesModal.hidden) {
      hideRulesModal();
    }
  });

  copyRoomButton.addEventListener("click", function () {
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

  initForm();
  if (!inviteInput.value && (getQuery().get("join") === "1" || getQuery().get("autojoin") === "1")) {
    setTimeout(connect, 0);
  }
}());
