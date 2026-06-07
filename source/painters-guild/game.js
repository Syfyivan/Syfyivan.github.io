const STYLE_LABELS = {
  portrait: "肖像",
  religious: "宗教",
  landscape: "风景",
  poster: "海报",
  abstract: "实验"
};

const MODE_LABELS = {
  fast: "快画",
  steady: "稳画",
  detail: "精修"
};

const ROLE_DATA = {
  sketch: { label: "速写师", phase: "构图", color: "#d8a54b" },
  finisher: { label: "精修师", phase: "精修", color: "#1f8f86" },
  mixer: { label: "调色师", phase: "上色", color: "#bd6244" },
  social: { label: "社交画家", phase: "交付", color: "#7d5d7e" },
  apprentice: { label: "学徒", phase: "构图", color: "#6da7d7" }
};

const ASSET_ROOT = "./assets/kenney-tiny-dungeon/Tiles/";
const APPRENTICE_PAINTER_ID = "me";
const VIEW_MODES = {
  boss: "老板",
  apprentice: "学徒"
};

const PAINTER_ASSETS = {
  p1: "tile_0061.png",
  p2: "tile_0074.png",
  p3: "tile_0075.png",
  p4: "tile_0060.png",
  me: "tile_0069.png"
};

const STATION_ASSETS = {
  bed: { base: "tile_0072.png" },
  desk: { base: "tile_0066.png", prop: "tile_0074.png" },
  door: { base: "tile_0045.png", prop: "tile_0046.png" },
  gallery: { base: "tile_0089.png", prop: "tile_0101.png" },
  mixer: { base: "tile_0113.png", prop: "tile_0114.png" },
  storage: { base: "tile_0063.png", prop: "tile_0090.png" }
};

const TOWN_CLIENTS = [
  { name: "咖啡馆老板", place: "咖啡馆", taste: "poster" },
  { name: "镇长办公室", place: "镇政厅", taste: "portrait" },
  { name: "学校老师", place: "学校走廊", taste: "landscape" },
  { name: "教堂管事", place: "教堂侧廊", taste: "religious" },
  { name: "广场策展人", place: "小镇广场", taste: "abstract" },
  { name: "面包店姐妹", place: "面包店", taste: "poster" },
  { name: "旅店老板", place: "旅店大厅", taste: "landscape" }
];

const ORDER_TITLES = {
  portrait: ["纪念肖像", "候选人画像", "家族小像", "店主肖像"],
  religious: ["祭坛草图", "圣徒壁画", "节日宗教画", "穹顶习作"],
  landscape: ["河岸风景", "花园长卷", "晨雾小景", "小镇远眺"],
  poster: ["新店招牌", "节日海报", "菜单插画", "工坊广告"],
  abstract: ["实验挂画", "色块练习", "梦境屏风", "新派展品"]
};

const SHOP_ITEMS = [
  { type: "easel", label: "小画架", cost: 90, desc: "增加一个单人作画位置", stationType: "easel", slots: 1 },
  { type: "large-easel", label: "大画架", cost: 150, desc: "增加一个三人协作画位", stationType: "easel", slots: 3, size: "large" },
  { type: "bed", label: "床", cost: 75, desc: "增加一个恢复疲劳的位置" },
  { type: "storage", label: "颜料柜", cost: 60, desc: "颜料上限增加 18" },
  { type: "gallery", label: "展示墙", cost: 110, desc: "声望增加 6，作品展示位更醒目" }
];

const DEFAULT_STATION_SLOTS = {
  bed: 1,
  desk: 1,
  door: 1,
  easel: 1,
  gallery: 1,
  mixer: 1,
  storage: 1
};

const INITIAL_STATIONS = [
  { id: "door", type: "door", label: "门口", x: 0, y: 0, slots: 1 },
  { id: "easel-1", type: "easel", label: "小画架", x: 1, y: 0, taskId: null, slots: 1, size: "small" },
  { id: "easel-2", type: "easel", label: "大画架", x: 2, y: 0, taskId: null, slots: 3, size: "large" },
  { id: "apprentice-bench", type: "desk", label: "学徒桌", x: 3, y: 0, slots: 1 },
  { id: "mixer", type: "mixer", label: "调色台", x: 4, y: 0, slots: 1 },
  { id: "desk", type: "desk", label: "书桌", x: 5, y: 0, slots: 1 },
  { id: "bed-1", type: "bed", label: "床一", x: 0, y: 1, slots: 1 },
  { id: "bed-2", type: "bed", label: "床二", x: 1, y: 1, slots: 1 },
  { id: "gallery", type: "gallery", label: "展示墙", x: 4, y: 1, slots: 1 },
  { id: "storage", type: "storage", label: "颜料柜", x: 5, y: 1, slots: 1 },
  { id: "empty-1", type: "empty", label: "空位", x: 2, y: 2 },
  { id: "empty-2", type: "empty", label: "空位", x: 3, y: 2 },
  { id: "empty-3", type: "empty", label: "空位", x: 4, y: 2 }
];

const PHASES = ["构图", "打底", "上色", "精修", "装裱"];
const MONTH_DAYS = 30;
const RUSH_DEADLINE_DAYS = 30;
const RUSH_ORDER_RATE = 0.28;

const els = {
  apprenticeCoin: document.getElementById("apprenticeCoinLabel"),
  apprenticePanel: document.getElementById("apprenticePanel"),
  artCount: document.getElementById("artCountLabel"),
  artworkTrack: document.getElementById("artworkTrack"),
  coin: document.getElementById("coinLabel"),
  connect: document.getElementById("connectButton"),
  connectionForm: document.getElementById("connectionForm"),
  connectionStatus: document.getElementById("connectionStatus"),
  day: document.getElementById("dayLabel"),
  disconnect: document.getElementById("disconnectButton"),
  eventLog: document.getElementById("eventLog"),
  identitySwitch: document.getElementById("identitySwitch"),
  newOrder: document.getElementById("newOrderButton"),
  orderList: document.getElementById("orderList"),
  paint: document.getElementById("paintLabel"),
  painterList: document.getElementById("painterList"),
  playerName: document.getElementById("playerNameInput"),
  pause: document.getElementById("pauseButton"),
  prestige: document.getElementById("prestigeLabel"),
  reset: document.getElementById("resetButton"),
  roomId: document.getElementById("roomIdInput"),
  roomGrid: document.getElementById("roomGrid"),
  selectedPainter: document.getElementById("selectedPainterLabel"),
  serverUrl: document.getElementById("serverUrlInput"),
  shopList: document.getElementById("shopList"),
  speed: document.getElementById("speedButton"),
  trend: document.getElementById("trendLabel")
};

const state = createInitialState();
const online = {
  socket: null,
  connected: false,
  painterId: "",
  playerName: "",
  roomId: "",
  status: "本地试玩"
};
let lastTime = performance.now();
let lastAutoRender = performance.now();
let renderQueued = false;
let activeDragPainterId = "";

function createInitialState() {
  return {
    roomId: "",
    day: 1,
    dayProgress: 0,
    coins: 120,
    paint: 42,
    paintMax: 80,
    prestige: 8,
    selectedPainterId: "p1",
    viewMode: "boss",
    apprentice: createApprenticeState(),
    paused: false,
    speed: 1,
    orderTimer: 0,
    trendIndex: 0,
    players: [],
    painters: [
      createPainter("p1", "青岚", "sketch", "door"),
      createPainter("p2", "阿澈", "finisher", "desk"),
      createPainter("p3", "南星", "mixer", "mixer"),
      createPainter("p4", "小满", "social", "gallery"),
      createPainter(APPRENTICE_PAINTER_ID, "我", "apprentice", "apprentice-bench")
    ],
    stations: createInitialStations(),
    orders: [],
    activeTasks: [],
    artworks: [],
    log: []
  };
}

function createApprenticeState() {
  return {
    wallet: 0,
    shifts: 0,
    completedWorks: 0,
    totalEarned: 0
  };
}

function createInitialStations() {
  const stations = structuredClone(INITIAL_STATIONS);
  const occupied = new Set(stations.map((station) => station.x + ":" + station.y));
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 6; x += 1) {
      const key = x + ":" + y;
      if (!occupied.has(key)) {
        stations.push({
          id: "empty-" + x + "-" + y,
          type: "empty",
          label: "空位",
          x,
          y
        });
      }
    }
  }
  return stations;
}

function createPainter(id, name, role, stationId, slotIndex = 0) {
  const startingSkill = role === "finisher" ? 17 : role === "mixer" ? 13 : role === "apprentice" ? 8 : 12;
  const startingFatigue = role === "social" ? 10 : role === "apprentice" ? 6 : 14;
  return {
    id,
    name,
    role,
    stationId,
    slotIndex,
    skill: startingSkill,
    fatigue: startingFatigue,
    mood: 72,
    mode: "steady",
    action: defaultActionForStationId(stationId)
  };
}

function cloneFreshState() {
  if (sendOnline("reset")) return;
  const next = createInitialState();
  Object.keys(state).forEach((key) => {
    delete state[key];
  });
  Object.assign(state, next);
  state.orders.push(makeOrder(), makeOrder());
  addLog("画室重新开张。");
}

function activeTrend() {
  return Object.keys(STYLE_LABELS)[state.trendIndex % Object.keys(STYLE_LABELS).length];
}

function isApprenticeView() {
  return state.viewMode === "apprentice";
}

function ensureApprenticeState() {
  if (!state.apprentice) state.apprentice = createApprenticeState();
  return state.apprentice;
}

function apprenticePainter() {
  return painterById(APPRENTICE_PAINTER_ID);
}

function apprenticeRank(painter = apprenticePainter()) {
  const skill = painter?.skill || 0;
  if (skill >= 70) return "准画师";
  if (skill >= 45) return "熟练学徒";
  if (skill >= 24) return "工坊助手";
  return "新学徒";
}

function addApprenticePay(amount) {
  if (amount <= 0) return;
  const apprentice = ensureApprenticeState();
  apprentice.wallet += amount;
  apprentice.totalEarned += amount;
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 18);
  scheduleRender();
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeOrder() {
  const client = randomItem(TOWN_CLIENTS);
  const style = Math.random() < 0.45 ? client.taste : randomItem(Object.keys(STYLE_LABELS));
  const trendBonus = style === activeTrend() ? 1.18 : 1;
  const difficulty = Math.floor(18 + state.prestige * 1.1 + Math.random() * 18);
  const rush = Math.random() < RUSH_ORDER_RATE;
  const deadline = rush
    ? Math.round((10 + Math.random() * 19) * 10) / 10
    : Math.round((36 + difficulty * 0.85 + Math.random() * 88) * 10) / 10;
  const rushMultiplier = rush ? 1.75 + (RUSH_DEADLINE_DAYS - deadline) / RUSH_DEADLINE_DAYS : 1;
  const reward = Math.round((76 + difficulty * 2.35) * trendBonus * rushMultiplier);
  const title = randomItem(ORDER_TITLES[style]);
  return {
    id: "o" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36),
    client: client.name,
    place: client.place,
    title,
    style,
    difficulty,
    deadline,
    rush,
    reward,
    prestige: Math.max(2, Math.round(difficulty / 15)),
    paintCost: Math.max(5, Math.round(difficulty / 5)),
    status: "offered"
  };
}

function createTask(order, stationId) {
  return {
    ...order,
    stationId,
    status: "active",
    progress: 0,
    quality: 54,
    phaseIndex: 0,
    usedPaint: 0
  };
}

function stationById(id) {
  return state.stations.find((station) => station.id === id);
}

function painterById(id) {
  return state.painters.find((painter) => painter.id === id);
}

function selectedPainter() {
  return painterById(state.selectedPainterId);
}

function setViewMode(mode) {
  if (!VIEW_MODES[mode]) return;
  if (mode === "apprentice" && isOnline()) {
    setConnectionStatus("学徒视角先在本地试玩");
    return;
  }
  state.viewMode = mode;
  if (mode === "apprentice") {
    state.selectedPainterId = APPRENTICE_PAINTER_ID;
  } else if (state.selectedPainterId === APPRENTICE_PAINTER_ID) {
    state.selectedPainterId = state.painters.find((painter) => painter.id !== APPRENTICE_PAINTER_ID)?.id || APPRENTICE_PAINTER_ID;
  }
  addLog("切换为" + VIEW_MODES[mode] + "视角。");
  scheduleRender();
}

function canControlPainter(painterId) {
  if (isApprenticeView()) return !isOnline() && painterId === APPRENTICE_PAINTER_ID;
  return !isOnline() || painterId === online.painterId;
}

function selectPainter(painterId) {
  if (!painterById(painterId)) return false;
  if (isApprenticeView() && painterId !== APPRENTICE_PAINTER_ID) {
    setConnectionStatus("学徒视角只能操作自己");
    return false;
  }
  if (!canControlPainter(painterId)) {
    setConnectionStatus("联机时只能操作你认领的画家");
    return false;
  }
  state.selectedPainterId = painterId;
  scheduleRender();
  return true;
}

function playerForPainter(painterId) {
  return (state.players || []).find((player) => player.painterId === painterId);
}

function taskAtStation(stationId) {
  return state.activeTasks.find((task) => task.stationId === stationId);
}

function stationSlotCount(station) {
  if (!station || station.type === "empty") return 0;
  const slots = Number(station.slots || DEFAULT_STATION_SLOTS[station.type] || 1);
  return Math.max(1, Math.min(4, Math.floor(slots)));
}

function validSlotIndex(station, slotIndex) {
  return Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex < stationSlotCount(station);
}

function paintersAtStation(stationId) {
  return state.painters
    .filter((painter) => painter.stationId === stationId)
    .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0) || a.id.localeCompare(b.id));
}

function normalizePainterSlots() {
  for (const station of state.stations) {
    const slots = stationSlotCount(station);
    if (!slots) continue;
    const used = new Set();
    for (const painter of paintersAtStation(station.id)) {
      if (!validSlotIndex(station, painter.slotIndex) || used.has(painter.slotIndex)) {
        painter.slotIndex = firstOpenSlot(station, used);
      }
      used.add(painter.slotIndex);
    }
  }
}

function firstOpenSlot(station, usedSlots) {
  for (let index = 0; index < stationSlotCount(station); index += 1) {
    if (!usedSlots.has(index)) return index;
  }
  return -1;
}

function occupiedSlots(stationId, exceptPainterId = "") {
  const station = stationById(stationId);
  const used = new Set();
  if (!station) return used;
  for (const painter of state.painters) {
    if (painter.stationId !== stationId || painter.id === exceptPainterId) continue;
    if (validSlotIndex(station, painter.slotIndex)) used.add(painter.slotIndex);
  }
  return used;
}

function freeSlotForStation(station, painterId = "") {
  if (!station || station.type === "empty") return -1;
  normalizePainterSlots();
  const painter = painterById(painterId);
  if (painter?.stationId === station.id && validSlotIndex(station, painter.slotIndex)) return painter.slotIndex;
  return firstOpenSlot(station, occupiedSlots(station.id, painterId));
}

function defaultActionForStation(station, task = null) {
  if (!station) return "idle";
  if (station.type === "easel") return task ? "painting" : "practicing";
  if (station.type === "bed") return "resting";
  if (station.type === "mixer") return "mixing";
  if (station.type === "desk") return "studying";
  if (station.type === "door") return "receiving";
  if (station.type === "gallery") return "curating";
  if (station.type === "storage") return "sorting";
  return "idle";
}

function defaultActionForStationId(stationId) {
  const station = INITIAL_STATIONS.find((item) => item.id === stationId);
  return defaultActionForStation(station);
}

function syncPainterAction(painter) {
  const station = stationById(painter.stationId);
  const task = station?.type === "easel" ? taskAtStation(station.id) : null;
  painter.action = defaultActionForStation(station, task);
}

function syncPaintersAtStation(stationId) {
  state.painters
    .filter((painter) => painter.stationId === stationId)
    .forEach(syncPainterAction);
}

function freeEasel(preferredPainterId = state.selectedPainterId) {
  const easels = state.stations.filter((station) => station.type === "easel" && !taskAtStation(station.id));
  const preferredPainter = painterById(preferredPainterId);
  const preferredStation = preferredPainter ? stationById(preferredPainter.stationId) : null;
  if (preferredStation?.type === "easel" && !taskAtStation(preferredStation.id)) return preferredStation;
  return easels.sort((a, b) => paintersAtStation(b.id).length - paintersAtStation(a.id).length)[0];
}

function emptyStation() {
  return state.stations.find((station) => station.type === "empty");
}

function assignPainterToStation(stationId) {
  if (sendOnline("assign_station", { stationId })) return;
  const painter = selectedPainter();
  const station = stationById(stationId);
  if (!painter || !station || station.type === "empty") return;
  const slotIndex = freeSlotForStation(station, painter.id);
  if (slotIndex < 0) {
    addLog(station.label + "的点位已经站满了。");
    return;
  }

  const moved = painter.stationId !== station.id;
  painter.stationId = station.id;
  painter.slotIndex = slotIndex;
  syncPainterAction(painter);
  if (moved && painter.id === APPRENTICE_PAINTER_ID) ensureApprenticeState().shifts += 1;
  addLog(painter.name + "前往" + station.label + "。");
}

function acceptOrder(orderId) {
  if (sendOnline("accept_order", { orderId })) return;
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const apprenticeMode = isApprenticeView();
  let station = freeEasel(apprenticeMode ? APPRENTICE_PAINTER_ID : state.selectedPainterId);
  if (apprenticeMode) {
    const apprentice = apprenticePainter();
    const canStandAtChosen = station ? freeSlotForStation(station, apprentice?.id) >= 0 : false;
    if (!canStandAtChosen) {
      station = state.stations.find(
        (item) => item.type === "easel" && !taskAtStation(item.id) && freeSlotForStation(item, apprentice?.id) >= 0
      );
    }
  }
  if (!station) {
    addLog("没有空画架，暂时接不了新活。");
    return;
  }
  if (state.paint < order.paintCost) {
    addLog("颜料不足，先去调色。");
    return;
  }
  state.orders = state.orders.filter((item) => item.id !== orderId);
  state.paint -= order.paintCost;
  const task = createTask(order, station.id);
  state.activeTasks.push(task);
  if (apprenticeMode) {
    const apprentice = apprenticePainter();
    const slotIndex = apprentice ? freeSlotForStation(station, apprentice.id) : -1;
    if (apprentice && slotIndex >= 0) {
      const moved = apprentice.stationId !== station.id;
      apprentice.stationId = station.id;
      apprentice.slotIndex = slotIndex;
      if (moved) ensureApprenticeState().shifts += 1;
    }
  }
  syncPaintersAtStation(station.id);
  addLog(
    (apprenticeMode ? "你领到" : "承接") +
      (isRushOrder(order) ? "加急" : "") +
      "《" +
      order.title +
      "》，放到" +
      station.label +
      "。"
  );
}

function declineOrder(orderId) {
  if (sendOnline("decline_order", { orderId })) return;
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  state.orders = state.orders.filter((item) => item.id !== orderId);
  if (isApprenticeView()) {
    addLog("你把《" + order.title + "》放回了柜台。");
    return;
  }
  state.prestige = Math.max(0, state.prestige - 1);
  addLog("婉拒了" + order.client + "的订单。");
}

function buyItem(type) {
  if (sendOnline("buy_item", { itemType: type })) return;
  if (isApprenticeView()) {
    addLog("学徒不能动用工坊账本。");
    return;
  }
  const item = SHOP_ITEMS.find((entry) => entry.type === type);
  if (!item || state.coins < item.cost) {
    addLog("金币还不够。");
    return;
  }

  if (type !== "storage" && !emptyStation()) {
    addLog("画室没有空位了。");
    return;
  }

  state.coins -= item.cost;

  if (type === "storage") {
    state.paintMax += 18;
    state.paint = Math.min(state.paintMax, state.paint + 10);
  } else if (type === "gallery") {
    const empty = emptyStation();
    Object.assign(empty, {
      id: "gallery-" + Date.now().toString(36),
      type: "gallery",
      label: "展示墙"
    });
    state.prestige += 6;
  } else {
    const empty = emptyStation();
    const stationType = item.stationType || type;
    const count = state.stations.filter((station) => station.type === stationType).length + 1;
    Object.assign(empty, {
      id: stationType + "-" + Date.now().toString(36),
      type: stationType,
      label: item.label + count,
      taskId: null,
      slots: item.slots || DEFAULT_STATION_SLOTS[stationType] || 1,
      size: item.size || "small"
    });
  }
  addLog("购买了" + item.label + "。");
}

function setSelectedMode(mode) {
  if (sendOnline("set_mode", { mode })) return;
  const painter = selectedPainter();
  if (!painter) return;
  painter.mode = mode;
  addLog(painter.name + "改用" + MODE_LABELS[mode] + "。");
}

function setSelectedIdle() {
  if (sendOnline("idle")) return;
  const painter = selectedPainter();
  if (!painter) return;
  painter.action = "idle";
  addLog(painter.name + "停手了。");
}

function stepGame(dt) {
  if (state.paused) return;
  const scaled = dt * state.speed;
  state.dayProgress += scaled / 8;
  state.orderTimer += scaled;

  while (state.dayProgress >= 1) {
    state.dayProgress -= 1;
    state.day += 1;
    if (state.day % 4 === 0) {
      state.trendIndex += 1;
      addLog("市场风向变成" + STYLE_LABELS[activeTrend()] + "。");
    }
  }

  if (state.orderTimer > 7.2 && state.orders.length < 5) {
    state.orderTimer = 0;
    const order = makeOrder();
    state.orders.push(order);
    addLog(order.client + "送来" + (isRushOrder(order) ? "加急" : "") + "《" + order.title + "》。");
  }

  updatePainters(scaled);
  updateDeadlines(scaled);
}

function updatePainters(dt) {
  for (const painter of state.painters) {
    const station = stationById(painter.stationId);
    if (!station) continue;

    if (painter.fatigue >= 100 && painter.action !== "resting") {
      painter.action = "idle";
      painter.mood = Math.max(24, painter.mood - 8);
      addLog(painter.name + "太累了，停下来喘口气。");
    }

    if (station.type === "bed" && painter.action === "resting") {
      painter.fatigue = Math.max(0, painter.fatigue - dt * 7.4);
      painter.mood = Math.min(100, painter.mood + dt * 1.8);
      if (painter.fatigue <= 1) painter.action = "idle";
    }

    if (station.type === "door" && painter.action === "receiving") {
      const roleBonus = painter.role === "social" ? 1.35 : 1;
      state.prestige += dt * 0.006 * roleBonus;
      painter.fatigue = Math.min(100, painter.fatigue + dt * 0.52);
      painter.skill = Math.min(100, painter.skill + dt * 0.02);
      awardApprenticeShiftPay(painter, dt * 0.14);
    }

    if (station.type === "mixer" && painter.action === "mixing") {
      const roleBonus = painter.role === "mixer" ? 1.45 : 1;
      state.paint = Math.min(state.paintMax, state.paint + dt * (1.8 + painter.skill / 45) * roleBonus);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 1.45);
      painter.skill = Math.min(100, painter.skill + dt * 0.035);
      awardApprenticeShiftPay(painter, dt * 0.18);
    }

    if (station.type === "desk" && painter.action === "studying") {
      painter.skill = Math.min(100, painter.skill + dt * 0.22);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 0.8);
      painter.mood = Math.max(12, painter.mood - dt * 0.25);
    }

    if (station.type === "gallery" && painter.action === "curating") {
      state.prestige += dt * 0.005;
      painter.skill = Math.min(100, painter.skill + dt * 0.018);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 0.48);
      awardApprenticeShiftPay(painter, dt * 0.12);
    }

    if (station.type === "storage" && painter.action === "sorting") {
      state.paint = Math.min(state.paintMax, state.paint + dt * 0.32);
      painter.skill = Math.min(100, painter.skill + dt * 0.018);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 0.55);
      awardApprenticeShiftPay(painter, dt * 0.13);
    }

    if (station.type === "easel" && painter.action === "painting") {
      const task = taskAtStation(station.id);
      if (!task) {
        painter.action = "practicing";
        continue;
      }
      updatePainting(painter, task, dt);
    }

    if (station.type === "easel" && painter.action === "practicing") {
      const task = taskAtStation(station.id);
      if (task) {
        painter.action = "painting";
        updatePainting(painter, task, dt);
      } else {
        painter.skill = Math.min(100, painter.skill + dt * 0.035);
        painter.fatigue = Math.min(100, painter.fatigue + dt * 0.35);
        awardApprenticeShiftPay(painter, dt * 0.04);
      }
    }
  }

  for (const task of [...state.activeTasks]) {
    if (task.progress >= 100) completeTask(task);
  }
}

function updatePainting(painter, task, dt) {
  if (state.paint <= 0) {
    addLog("颜料见底，作画暂停。");
    painter.action = "idle";
    return;
  }

  const role = ROLE_DATA[painter.role];
  const phase = PHASES[task.phaseIndex] || "精修";
  const roleBonus = role.phase === phase ? 1.28 : 1;
  const trendBonus = task.style === activeTrend() ? 1.12 : 1;
  const fatiguePenalty = Math.max(0.25, 1 - painter.fatigue / 135);
  const modeSpeed = painter.mode === "fast" ? 1.38 : painter.mode === "detail" ? 0.74 : 1;
  const modeQuality = painter.mode === "fast" ? -0.018 : painter.mode === "detail" ? 0.052 : 0.018;
  const amount = dt * (0.75 + painter.skill / 38) * roleBonus * trendBonus * fatiguePenalty * modeSpeed;
  const paintUse = dt * (0.18 + task.difficulty / 420) * (painter.mode === "fast" ? 1.18 : 1);

  task.progress = Math.min(100, task.progress + amount);
  task.phaseIndex = Math.min(PHASES.length - 1, Math.floor(task.progress / 20));
  task.quality = Math.max(10, Math.min(100, task.quality + amount * modeQuality + painter.skill * 0.0008));
  task.usedPaint += paintUse;
  state.paint = Math.max(0, state.paint - paintUse);
  painter.fatigue = Math.min(100, painter.fatigue + dt * (painter.mode === "fast" ? 2.2 : 1.45));
  painter.mood = Math.max(8, painter.mood - dt * 0.16);
  painter.skill = Math.min(100, painter.skill + dt * 0.045);
  awardApprenticeShiftPay(painter, dt * (0.2 + task.difficulty / 500));
}

function awardApprenticeShiftPay(painter, amount) {
  if (painter.id !== APPRENTICE_PAINTER_ID) return;
  addApprenticePay(amount);
}

function updateDeadlines(dt) {
  const dayDelta = dt / 8;

  for (const order of [...state.orders]) {
    order.deadline -= dayDelta;
    if (order.deadline <= 0) {
      state.orders = state.orders.filter((item) => item.id !== order.id);
      state.prestige = Math.max(0, state.prestige - 1);
      addLog(order.client + "等不及，带走了订单。");
    }
  }

  for (const task of [...state.activeTasks]) {
    task.deadline -= dayDelta;
    if (task.deadline <= 0) failTask(task);
  }
}

function completeTask(task) {
  const qualityBonus = 0.72 + task.quality / 100;
  const reward = Math.round(task.reward * qualityBonus);
  const prestigeGain = Math.max(1, Math.round(task.prestige * qualityBonus));
  state.coins += reward;
  state.prestige += prestigeGain;
  const art = {
    id: task.id,
    title: task.title,
    place: task.place,
    style: task.style,
    quality: Math.round(task.quality),
    authors: state.painters
      .filter((painter) => painter.stationId === task.stationId)
      .map((painter) => painter.name)
  };
  state.artworks.unshift(art);
  state.artworks = state.artworks.slice(0, 18);
  state.activeTasks = state.activeTasks.filter((item) => item.id !== task.id);
  const apprenticeHelped = state.painters.some(
    (painter) => painter.id === APPRENTICE_PAINTER_ID && painter.stationId === task.stationId
  );
  if (apprenticeHelped) {
    const bonus = Math.max(3, Math.round(reward * 0.06));
    const apprentice = ensureApprenticeState();
    apprentice.completedWorks += 1;
    addApprenticePay(bonus);
    addLog("你参与《" + task.title + "》，拿到 " + bonus + " 工钱。");
  }
  state.painters
    .filter((painter) => painter.stationId === task.stationId)
    .forEach((painter) => {
      syncPainterAction(painter);
      painter.mood = Math.min(100, painter.mood + 8);
    });
  addLog("《" + task.title + "》交付到" + task.place + "，收入 " + reward + "。");
}

function failTask(task) {
  state.activeTasks = state.activeTasks.filter((item) => item.id !== task.id);
  state.prestige = Math.max(0, state.prestige - Math.max(2, task.prestige));
  state.painters
    .filter((painter) => painter.stationId === task.stationId)
    .forEach((painter) => {
      syncPainterAction(painter);
      painter.mood = Math.max(10, painter.mood - 10);
  });
  addLog("《" + task.title + "》错过了期限。");
}

function isOnline() {
  return typeof WebSocket !== "undefined" && online.connected && online.socket?.readyState === WebSocket.OPEN;
}

function sendOnline(type, payload = {}) {
  if (!isOnline()) return false;
  online.socket.send(JSON.stringify({ type, ...payload }));
  return true;
}

function hydrateConnectionForm() {
  els.playerName.value = readStored("paintersGuildPlayerName", "画家" + Math.floor(10 + Math.random() * 90));
  els.roomId.value = readStored("paintersGuildRoomId", "ATELIER");
  els.serverUrl.value = readStored("paintersGuildServerUrl", defaultServerUrl());
}

function readStored(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Local storage can be unavailable in hardened browsers; the game still works.
  }
}

function defaultServerUrl() {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return "ws://localhost:8788/guild-ws";
  }
  return "";
}

function normalizeRoomId(value) {
  return (
    String(value || "ATELIER")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 16) || "ATELIER"
  );
}

function normalizeSocketUrl(value) {
  let input = String(value || "").trim();
  if (!input) return "";
  if (!input.includes("://")) {
    const local = input.startsWith("localhost") || input.startsWith("127.") || input.startsWith("[::1]");
    input = (local ? "ws://" : "wss://") + input;
  }
  try {
    const url = new URL(input);
    if (url.protocol === "http:") url.protocol = "ws:";
    if (url.protocol === "https:") url.protocol = "wss:";
    if (url.protocol !== "ws:" && url.protocol !== "wss:") return "";
    if (!url.pathname || url.pathname === "/") url.pathname = "/guild-ws";
    return url.toString();
  } catch {
    return "";
  }
}

function connectOnline() {
  if (typeof WebSocket === "undefined") {
    setConnectionStatus("浏览器不支持 WebSocket");
    return;
  }

  const serverUrl = normalizeSocketUrl(els.serverUrl.value);
  const roomId = normalizeRoomId(els.roomId.value);
  const playerName = String(els.playerName.value || "画家").trim().slice(0, 16) || "画家";
  if (!serverUrl) {
    setConnectionStatus("填写服务器地址");
    return;
  }

  if (online.socket) online.socket.close();
  writeStored("paintersGuildPlayerName", playerName);
  writeStored("paintersGuildRoomId", roomId);
  writeStored("paintersGuildServerUrl", serverUrl);

  online.connected = false;
  online.painterId = "";
  online.playerName = playerName;
  online.roomId = roomId;
  online.status = "连接中...";
  if (isApprenticeView()) state.viewMode = "boss";

  let socket;
  try {
    socket = new WebSocket(serverUrl);
  } catch {
    setConnectionStatus("服务器地址无效");
    return;
  }
  online.socket = socket;
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", roomId, name: playerName }));
  });
  socket.addEventListener("message", (event) => {
    handleOnlineMessage(event.data);
  });
  socket.addEventListener("close", () => {
    if (online.socket !== socket) return;
    online.socket = null;
    online.connected = false;
    online.painterId = "";
    online.status = "已断开，本地继续";
    scheduleRender();
  });
  socket.addEventListener("error", () => {
    if (online.socket === socket) setConnectionStatus("连接失败");
  });
  scheduleRender();
}

function disconnectOnline() {
  const socket = online.socket;
  online.socket = null;
  online.connected = false;
  online.painterId = "";
  online.roomId = "";
  online.status = "本地试玩";
  if (socket && (typeof WebSocket === "undefined" || socket.readyState !== WebSocket.CLOSED)) socket.close();
  scheduleRender();
}

function handleOnlineMessage(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    setConnectionStatus("服务器消息格式错误");
    return;
  }

  if (payload.type === "welcome") {
    online.connected = true;
    online.roomId = payload.roomId;
    online.painterId = payload.painterId;
    applySnapshot(payload.state);
    const painter = painterById(online.painterId);
    setConnectionStatus("联机 " + online.roomId + " · 你是" + (painter?.name || "画家"));
    return;
  }

  if (payload.type === "snapshot") {
    applySnapshot(payload.state);
    return;
  }

  if (payload.type === "error") {
    setConnectionStatus("服务器：" + payload.message);
  }
}

function applySnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.painters)) return;
  const preferredPainterId = online.painterId || state.selectedPainterId;
  Object.keys(state).forEach((key) => {
    delete state[key];
  });
  Object.assign(state, snapshot);
  if (!Array.isArray(state.players)) state.players = [];
  if (!state.viewMode || !VIEW_MODES[state.viewMode]) state.viewMode = "boss";
  ensureApprenticeState();
  normalizePainterSlots();
  state.selectedPainterId = isOnline() ? preferredPainterId : state.selectedPainterId;
  if (!painterById(state.selectedPainterId)) state.selectedPainterId = state.painters[0]?.id || "";
  scheduleRender();
}

function setConnectionStatus(status) {
  online.status = status;
  scheduleRender();
}

function renderConnection() {
  const connecting = typeof WebSocket !== "undefined" && online.socket?.readyState === WebSocket.CONNECTING;
  const connected = isOnline();
  const painter = online.painterId ? painterById(online.painterId) : null;
  els.connect.disabled = connecting;
  els.connect.textContent = connected ? "换房" : connecting ? "连接中" : "联机";
  els.disconnect.disabled = !online.socket && !connected;
  els.connectionStatus.textContent = connected
    ? "联机 " + online.roomId + " · 你是" + (painter?.name || "画家")
    : online.status;
  els.identitySwitch.querySelectorAll("[data-view-mode]").forEach((button) => {
    const active = state.viewMode === button.dataset.viewMode;
    button.classList.toggle("is-active", active);
    button.disabled = connected && button.dataset.viewMode === "apprentice";
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function startPainterDrag(event, painterId) {
  activeDragPainterId = painterId;
  document.body.classList.add("is-dragging-painter");
  event.dataTransfer?.setData("text/painter-id", painterId);
  event.dataTransfer?.setData("text/plain", painterId);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function endPainterDrag() {
  activeDragPainterId = "";
  document.body.classList.remove("is-dragging-painter");
  document.querySelectorAll(".station.is-drop-target").forEach((station) => {
    station.classList.remove("is-drop-target");
  });
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function render() {
  document.body.dataset.viewMode = state.viewMode || "boss";
  ensureApprenticeState();
  renderConnection();
  els.day.textContent = "第 " + state.day + " 天";
  els.coin.textContent = String(Math.round(state.coins));
  els.apprenticeCoin.textContent = String(Math.round(state.apprentice.wallet));
  els.paint.textContent = String(Math.round(state.paint)) + "/" + state.paintMax;
  els.prestige.textContent = String(Math.round(state.prestige));
  els.trend.textContent = "今日流行：" + STYLE_LABELS[activeTrend()];
  els.selectedPainter.textContent = isApprenticeView()
    ? "我 · " + apprenticeRank()
    : isOnline()
    ? (selectedPainter()?.name || "--") + "（你）"
    : selectedPainter()?.name || "--";
  els.pause.title = state.paused ? "继续" : "暂停";
  els.pause.setAttribute("aria-label", state.paused ? "继续" : "暂停");
  els.speed.title = "速度 x" + state.speed;
  els.speed.setAttribute("aria-label", "速度 x" + state.speed);

  renderPainters();
  renderApprenticePanel();
  renderRoom();
  renderOrders();
  renderShop();
  renderArtworks();
  renderLog();
}

function renderPainters() {
  els.painterList.innerHTML = "";
  for (const painter of state.painters) {
    const role = ROLE_DATA[painter.role];
    const owner = playerForPainter(painter.id);
    const ownerLabel =
      painter.id === APPRENTICE_PAINTER_ID
        ? isApprenticeView()
          ? "你"
          : "本地学徒"
        : owner
        ? owner.painterId === online.painterId
          ? "你"
          : owner.name
        : isOnline()
        ? "无人"
        : "本地";
    const locked = !canControlPainter(painter.id);
    const button = document.createElement("button");
    button.className =
      "painter-card" +
      (painter.id === APPRENTICE_PAINTER_ID ? " is-apprentice" : "") +
      (painter.id === state.selectedPainterId ? " is-selected" : "") +
      (locked ? " is-locked" : "");
    button.type = "button";
    button.dataset.painterId = painter.id;
    button.draggable = !locked;
    button.innerHTML = `
      <span class="painter-face" style="--face-color:${role.color}">
        ${assetImage(painterAsset(painter), "painter-face-img")}
      </span>
      <span>
        <h3>${painter.name}</h3>
        <p>${role.label} · ${actionLabel(painter)} · ${escapeHtml(ownerLabel)}</p>
        <span class="painter-meters">
          <span class="meter-row"><span>技艺</span><span class="meter"><span style="width:${painter.skill}%"></span></span></span>
          <span class="meter-row"><span>疲劳</span><span class="meter is-fatigue"><span style="width:${painter.fatigue}%"></span></span></span>
          <span class="meter-row"><span>心情</span><span class="meter"><span style="width:${painter.mood}%"></span></span></span>
        </span>
      </span>
    `;
    els.painterList.append(button);
  }

  document.querySelectorAll(".action-dock [data-mode]").forEach((button) => {
    button.classList.toggle("is-active", selectedPainter()?.mode === button.dataset.mode);
  });
}

function renderApprenticePanel() {
  const painter = apprenticePainter();
  const apprentice = ensureApprenticeState();
  if (!painter) {
    els.apprenticePanel.innerHTML = "";
    return;
  }
  els.apprenticePanel.innerHTML = `
    <div class="apprentice-card-head">
      <span>${apprenticeRank(painter)}</span>
      <b>${Math.round(apprentice.wallet)} 工钱</b>
    </div>
    <div class="apprentice-stats">
      <span><b>${Math.round(painter.skill)}</b> 技艺</span>
      <span><b>${Math.round(painter.fatigue)}</b> 疲劳</span>
      <span><b>${apprentice.shifts}</b> 上工</span>
      <span><b>${apprentice.completedWorks}</b> 作品</span>
    </div>
    <span class="meter"><span style="width:${clampStat(painter.skill)}%"></span></span>
  `;
}

function actionLabel(painter) {
  if (painter.action === "painting") return MODE_LABELS[painter.mode];
  if (painter.action === "practicing") return "练习";
  if (painter.action === "resting") return "休息";
  if (painter.action === "mixing") return "调色";
  if (painter.action === "studying") return "学习";
  if (painter.action === "receiving") return "接待";
  if (painter.action === "curating") return "布展";
  if (painter.action === "sorting") return "整理";
  return "待命";
}

function clampStat(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isRushOrder(order) {
  return Boolean(order.rush) || order.deadline < RUSH_DEADLINE_DAYS;
}

function deadlineLabel(days) {
  const safeDays = Math.max(0, Number(days) || 0);
  if (safeDays >= MONTH_DAYS) return (safeDays / MONTH_DAYS).toFixed(1) + "个月";
  return safeDays.toFixed(1) + "天";
}

function deadlineBadge(order) {
  return (isRushOrder(order) ? "加急 · " : "") + deadlineLabel(order.deadline);
}

function compactDeadlineBadge(order) {
  return (isRushOrder(order) ? "急 " : "") + deadlineLabel(order.deadline);
}

function assetPath(fileName) {
  return ASSET_ROOT + fileName;
}

function assetImage(fileName, className) {
  return `<img class="${className}" src="${assetPath(fileName)}" alt="" loading="lazy" decoding="async" draggable="false" />`;
}

function painterAsset(painter) {
  return PAINTER_ASSETS[painter.id] || PAINTER_ASSETS.p1;
}

function renderRoom() {
  els.roomGrid.innerHTML = "";
  normalizePainterSlots();
  const cells = new Map(state.stations.map((station) => [station.x + ":" + station.y, station]));
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 6; x += 1) {
      const station = cells.get(x + ":" + y);
      const task = station.type === "easel" ? taskAtStation(station.id) : null;
      const stationPainters = paintersAtStation(station.id);
      const working = stationPainters.some((painter) => painter.action === "painting");
      const slotCount = stationSlotCount(station);
      const stationEl = document.createElement("button");
      stationEl.type = "button";
      stationEl.className =
        "station is-clickable is-" +
        station.type +
        " floor-" +
        y +
        " room-" +
        x +
        (station.type === "empty" ? " is-empty" : "") +
        (task ? " has-task" : "") +
        (task && isRushOrder(task) ? " is-rush" : "") +
        (working ? " is-working" : "") +
        (slotCount > 1 ? " is-large-easel" : "") +
        (slotCount && stationPainters.length >= slotCount ? " is-full" : " has-open-slot");
      stationEl.dataset.stationId = station.id;
      stationEl.dataset.stationType = station.type;
      stationEl.dataset.slotCount = String(slotCount);
      stationEl.innerHTML = stationMarkup(station, task, working);

      stationPainters.forEach((painter) => {
        const role = ROLE_DATA[painter.role];
        const token = document.createElement("span");
        const slotIndex = validSlotIndex(station, painter.slotIndex) ? painter.slotIndex : 0;
        const slotOffset = (slotIndex - (slotCount - 1) / 2) * (station.type === "easel" && task ? 28 : 31);
        token.className = "painter-token is-" + painter.action + " role-" + painter.role;
        token.style.setProperty("--painter-color", role.color);
        token.style.setProperty("--painter-slot-offset", slotOffset + "px");
        token.dataset.painterId = painter.id;
        token.dataset.slotIndex = String(slotIndex);
        token.draggable = canControlPainter(painter.id);
        token.title = painter.name;
        token.innerHTML = `
          <span class="painter-name-tag">${escapeHtml(painter.name)} · ${actionLabel(painter)}</span>
          ${assetImage(painterAsset(painter), "painter-sprite")}
          <span class="painter-head"></span>
          <span class="painter-body"></span>
          <span class="painter-arm"></span>
          <span class="painter-legs"></span>
          <span class="painter-brush"></span>
          <span class="painter-stat-bars" aria-hidden="true">
            <span class="mini-stat is-skill" style="--value:${clampStat(painter.skill)}%"></span>
            <span class="mini-stat is-fatigue" style="--value:${clampStat(painter.fatigue)}%"></span>
            <span class="mini-stat is-mood" style="--value:${clampStat(painter.mood)}%"></span>
          </span>
        `;
        stationEl.append(token);
      });
      els.roomGrid.append(stationEl);
    }
  }
}

function stationMarkup(station, task, working = false) {
  const subtitle = stationSubtitle(station, task);
  const progress = task
    ? `<span class="station-progress">
        <span class="meter"><span style="width:${task.progress}%"></span></span>
        <small>${PHASES[task.phaseIndex]} · 品质 ${Math.round(task.quality)}</small>
      </span>`
    : "";
  const stationArt = task ? paintingMarkup(task, working) : stationAssetMarkup(station);
  return `
    <span class="station-label">
      <span class="station-title"><span>${station.label}</span><b>${station.type === "easel" && task ? compactDeadlineBadge(task) : ""}</b></span>
      <span class="station-subtitle">${subtitle}</span>
    </span>
    <span class="station-art">${stationArt}</span>
    ${workSlotsMarkup(station)}
    ${progress}
  `;
}

function workSlotsMarkup(station) {
  const slotCount = stationSlotCount(station);
  if (!slotCount) return "";
  const used = occupiedSlots(station.id);
  const slots = Array.from({ length: slotCount }, (_, index) => {
    return `<span class="work-slot ${used.has(index) ? "is-occupied" : ""}"></span>`;
  }).join("");
  return `<span class="work-slot-row" aria-hidden="true">${slots}</span>`;
}

function stationAssetMarkup(station) {
  const iconClass = stationIconClass(station.type);
  const baseAsset = STATION_ASSETS[station.type];
  if (!baseAsset) return `<span class="${iconClass}" aria-hidden="true"></span>`;

  const config = { ...baseAsset };
  if (station.type === "bed" && station.id.includes("2")) {
    config.base = "tile_0072.png";
  }

  const prop = config.prop ? assetImage(config.prop, "asset-sprite station-prop") : "";
  const base = config.base ? assetImage(config.base, "asset-sprite station-sprite") : "";
  return `<span class="station-asset is-${station.type}" aria-hidden="true">${prop}${base}</span>`;
}

function stationIconClass(type) {
  return (
    {
      bed: "pixel-bed",
      desk: "pixel-desk",
      door: "pixel-door",
      easel: "pixel-easel",
      empty: "pixel-empty",
      gallery: "pixel-gallery",
      mixer: "pixel-mixer",
      storage: "pixel-storage"
    }[type] || "pixel-empty"
  );
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function paintingMarkup(task, working) {
  const [a, b, c] = paintingPalette(task.style);
  const progress = Math.max(0, Math.min(100, Math.round(task.progress)));
  const visualProgress = progress <= 0 ? 0 : Math.min(100, Math.round(Math.pow(progress / 100, 0.65) * 100));
  const fill = Math.max(0, Math.min(58, Math.round(visualProgress * 0.58)));
  const strokeOne = Math.max(0, Math.min(42, Math.round(visualProgress * 0.42)));
  const strokeTwo = Math.max(0, Math.min(36, Math.round(visualProgress * 0.36)));
  const strokeThree = Math.max(0, Math.min(31, Math.round(visualProgress * 0.31)));
  const blank = clamp01(1 - visualProgress / 16).toFixed(2);
  const sketch = clamp01(visualProgress / 18).toFixed(2);
  const color = clamp01((visualProgress - 9) / 32).toFixed(2);
  const detail = clamp01((visualProgress - 46) / 30).toFixed(2);
  const finish = clamp01((visualProgress - 78) / 18).toFixed(2);
  const figureScale = (0.86 + clamp01((visualProgress - 12) / 56) * 0.14).toFixed(2);
  return `
    <span class="painting-canvas style-${task.style} ${working ? "is-working" : "is-paused"}" style="--paint-progress:${fill}px;--stroke-one:${strokeOne}px;--stroke-two:${strokeTwo}px;--stroke-three:${strokeThree}px;--blank-opacity:${blank};--sketch-opacity:${sketch};--color-opacity:${color};--detail-opacity:${detail};--finish-opacity:${finish};--figure-scale:${figureScale};--paint-a:${a};--paint-b:${b};--paint-c:${c}">
      <span class="blank-label">空白画布</span>
      <span class="paint-sketch"></span>
      <span class="paint-wash"></span>
      <span class="paint-figure"></span>
      <span class="paint-stroke stroke-one"></span>
      <span class="paint-stroke stroke-two"></span>
      <span class="paint-stroke stroke-three"></span>
      <span class="finish-glint"></span>
      <span class="brush-sprite" aria-hidden="true"></span>
    </span>
  `;
}

function paintingPalette(style) {
  return {
    portrait: ["#bd6244", "#f4dfb8", "#2f2922"],
    religious: ["#d8a54b", "#477da5", "#f4dfb8"],
    landscape: ["#66854c", "#1f8f86", "#d6bd8d"],
    poster: ["#bd6244", "#d8a54b", "#1f8f86"],
    abstract: ["#7d5d7e", "#477da5", "#d8a54b"]
  }[style] || ["#bd6244", "#d8a54b", "#1f8f86"];
}

function stationSubtitle(station, task) {
  if (task) return "《" + task.title + "》";
  if (station.type === "easel") return "等待订单";
  if (station.type === "bed") return "恢复疲劳";
  if (station.type === "mixer") return "补充颜料";
  if (station.type === "desk") return "提升技艺";
  if (station.type === "gallery") return "提高声望";
  if (station.type === "storage") return "颜料上限 " + state.paintMax;
  if (station.type === "door") return "客户入口";
  return "可放家具";
}

function renderOrders() {
  els.orderList.innerHTML = "";
  const items = [...state.orders, ...state.activeTasks];
  const apprenticeMode = isApprenticeView();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "order-card";
    empty.textContent = "暂无订单";
    els.orderList.append(empty);
    return;
  }

  for (const order of items) {
    const card = document.createElement("article");
    const rush = isRushOrder(order);
    card.className = "order-card" + (order.status === "active" ? " is-active" : "") + (rush ? " is-rush" : "");
    const active = order.status === "active";
    card.innerHTML = `
      <div class="order-head">
        <span class="commission-thumb" style="background:${artBackground(order)}"></span>
        <div class="order-title"><span>${order.title}</span><b>${rush ? "加急 · " : ""}${STYLE_LABELS[order.style]}</b></div>
      </div>
      <div class="order-meta">
        <span>${order.client}</span>
        <span class="${rush ? "is-rush-deadline" : ""}">${deadlineBadge(order)}</span>
        <span>${order.reward} 金币</span>
        <span>${order.paintCost} 颜料</span>
      </div>
      ${
        active
          ? `<div class="station-progress">
              <span class="meter"><span style="width:${order.progress}%"></span></span>
              <small>${PHASES[order.phaseIndex]} · ${order.place}</small>
            </div>`
          : `<div class="order-actions">
              <button type="button" data-accept="${order.id}">${apprenticeMode ? "领活" : "承接"}</button>
              <button type="button" data-decline="${order.id}">${apprenticeMode ? "跳过" : "婉拒"}</button>
            </div>`
      }
    `;
    els.orderList.append(card);
  }
}

function renderShop() {
  els.shopList.innerHTML = "";
  for (const item of SHOP_ITEMS) {
    const el = document.createElement("article");
    el.className = "shop-item";
    const disabled = isApprenticeView() || state.coins < item.cost || (item.type !== "storage" && !emptyStation());
    const iconType = item.stationType || item.type;
    el.innerHTML = `
      <span class="shop-icon is-${iconType}" aria-hidden="true"></span>
      <span>
        <h3>${item.label}</h3>
        <p>${item.desc}</p>
      </span>
      <button type="button" data-buy="${item.type}" ${disabled ? "disabled" : ""}>${isApprenticeView() ? "账本" : item.cost}</button>
    `;
    els.shopList.append(el);
  }
}

function renderArtworks() {
  els.artCount.textContent = String(state.artworks.length);
  els.artworkTrack.innerHTML = "";
  if (!state.artworks.length) {
    const empty = document.createElement("span");
    empty.className = "station-subtitle";
    empty.textContent = "作品会挂进小镇。";
    els.artworkTrack.append(empty);
    return;
  }
  for (const art of state.artworks) {
    const tile = document.createElement("span");
    tile.className = "art-tile";
    tile.title = art.title + " · " + art.place + " · 品质 " + art.quality;
    tile.style.background = artBackground(art);
    els.artworkTrack.append(tile);
  }
}

function artBackground(art) {
  const palettes = {
    portrait: ["#f4dfb8", "#bd6244", "#2f2922"],
    religious: ["#d8a54b", "#477da5", "#f4dfb8"],
    landscape: ["#66854c", "#1f8f86", "#f4dfb8"],
    poster: ["#bd6244", "#d8a54b", "#1f8f86"],
    abstract: ["#7d5d7e", "#477da5", "#d8a54b"]
  };
  const [a, b, c] = palettes[art.style];
  return `linear-gradient(135deg, ${a} 0 34%, ${b} 34% 62%, ${c} 62%)`;
}

function renderLog() {
  els.eventLog.innerHTML = state.log.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function bindEvents() {
  els.connectionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    connectOnline();
  });

  els.disconnect.addEventListener("click", () => {
    disconnectOnline();
  });

  els.identitySwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-mode]");
    if (!button) return;
    setViewMode(button.dataset.viewMode);
  });

  els.painterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-painter-id]");
    if (!button) return;
    selectPainter(button.dataset.painterId);
  });

  els.painterList.addEventListener("dragstart", (event) => {
    const button = event.target.closest("[data-painter-id]");
    if (!button || !selectPainter(button.dataset.painterId)) {
      event.preventDefault();
      return;
    }
    startPainterDrag(event, button.dataset.painterId);
  });

  els.painterList.addEventListener("dragend", () => {
    endPainterDrag();
  });

  els.roomGrid.addEventListener("click", (event) => {
    const token = event.target.closest("[data-painter-id]");
    if (token) {
      selectPainter(token.dataset.painterId);
      return;
    }
    const station = event.target.closest("[data-station-id]");
    if (!station) return;
    assignPainterToStation(station.dataset.stationId);
  });

  els.roomGrid.addEventListener("dragstart", (event) => {
    const token = event.target.closest(".painter-token[data-painter-id]");
    if (!token || !selectPainter(token.dataset.painterId)) {
      event.preventDefault();
      return;
    }
    startPainterDrag(event, token.dataset.painterId);
  });

  els.roomGrid.addEventListener("dragover", (event) => {
    const station = event.target.closest("[data-station-id]");
    if (!station || station.dataset.stationType === "empty") return;
    const stationState = stationById(station.dataset.stationId);
    const painterId = activeDragPainterId || state.selectedPainterId;
    if (freeSlotForStation(stationState, painterId) < 0) return;
    event.preventDefault();
    station.classList.add("is-drop-target");
  });

  els.roomGrid.addEventListener("dragleave", (event) => {
    const station = event.target.closest("[data-station-id]");
    if (station) station.classList.remove("is-drop-target");
  });

  els.roomGrid.addEventListener("drop", (event) => {
    const station = event.target.closest("[data-station-id]");
    endPainterDrag();
    if (!station || station.dataset.stationType === "empty") return;
    event.preventDefault();
    const painterId = event.dataTransfer?.getData("text/painter-id") || state.selectedPainterId;
    if (!selectPainter(painterId)) return;
    assignPainterToStation(station.dataset.stationId);
  });

  els.roomGrid.addEventListener("dragend", () => {
    endPainterDrag();
  });

  els.orderList.addEventListener("click", (event) => {
    const accept = event.target.closest("[data-accept]");
    const decline = event.target.closest("[data-decline]");
    if (accept) acceptOrder(accept.dataset.accept);
    if (decline) declineOrder(decline.dataset.decline);
  });

  els.shopList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy]");
    if (!button) return;
    buyItem(button.dataset.buy);
  });

  document.querySelector(".action-dock").addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-mode]");
    const actionButton = event.target.closest("[data-action]");
    if (modeButton) setSelectedMode(modeButton.dataset.mode);
    if (actionButton?.dataset.action === "idle") setSelectedIdle();
  });

  els.newOrder.addEventListener("click", () => {
    if (sendOnline("new_order")) return;
    const order = makeOrder();
    state.orders.push(order);
    addLog(order.client + "送来" + (isRushOrder(order) ? "加急" : "") + "《" + order.title + "》。");
  });

  els.pause.addEventListener("click", () => {
    if (sendOnline("pause")) return;
    state.paused = !state.paused;
    addLog(state.paused ? "画室暂停。" : "画室继续运转。");
  });

  els.speed.addEventListener("click", () => {
    if (sendOnline("speed")) return;
    state.speed = state.speed === 1 ? 1.8 : state.speed === 1.8 ? 3 : 1;
    addLog("时间速度 x" + state.speed + "。");
  });

  els.reset.addEventListener("click", () => {
    cloneFreshState();
  });
}

function loop(now) {
  const dt = Math.min(0.08, (now - lastTime) / 1000);
  lastTime = now;
  if (!isOnline()) stepGame(dt);
  if (!activeDragPainterId && now - lastAutoRender > 320) {
    lastAutoRender = now;
    scheduleRender();
  }
  requestAnimationFrame(loop);
}

hydrateConnectionForm();
bindEvents();
state.orders.push(makeOrder(), makeOrder());
addLog("画室开张，第一批客户已经到了。");
render();
requestAnimationFrame(loop);
