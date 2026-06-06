import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.PAINTERS_GUILD_PORT || process.env.PORT || 8788);
const HOST = process.env.PAINTERS_GUILD_HOST || "0.0.0.0";
const ALLOWED_ORIGINS = (process.env.PAINTERS_GUILD_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const STYLE_LABELS = {
  portrait: "肖像",
  religious: "宗教",
  landscape: "风景",
  poster: "海报",
  abstract: "实验"
};

const ROLE_DATA = {
  sketch: { label: "速写师", phase: "构图", color: "#d8a54b" },
  finisher: { label: "精修师", phase: "精修", color: "#1f8f86" },
  mixer: { label: "调色师", phase: "上色", color: "#bd6244" },
  social: { label: "社交画家", phase: "交付", color: "#7d5d7e" }
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
  { type: "easel", label: "画架", cost: 90 },
  { type: "bed", label: "床", cost: 75 },
  { type: "storage", label: "颜料柜", cost: 60 },
  { type: "gallery", label: "展示墙", cost: 110 }
];

const INITIAL_STATIONS = [
  { id: "door", type: "door", label: "门口", x: 0, y: 0 },
  { id: "easel-1", type: "easel", label: "画架一", x: 1, y: 0, taskId: null },
  { id: "easel-2", type: "easel", label: "画架二", x: 2, y: 0, taskId: null },
  { id: "mixer", type: "mixer", label: "调色台", x: 4, y: 0 },
  { id: "desk", type: "desk", label: "书桌", x: 5, y: 0 },
  { id: "bed-1", type: "bed", label: "床一", x: 0, y: 1 },
  { id: "bed-2", type: "bed", label: "床二", x: 1, y: 1 },
  { id: "gallery", type: "gallery", label: "展示墙", x: 4, y: 1 },
  { id: "storage", type: "storage", label: "颜料柜", x: 5, y: 1 },
  { id: "empty-1", type: "empty", label: "空位", x: 2, y: 2 },
  { id: "empty-2", type: "empty", label: "空位", x: 3, y: 2 },
  { id: "empty-3", type: "empty", label: "空位", x: 4, y: 2 }
];

const PHASES = ["构图", "打底", "上色", "精修", "装裱"];
const RUSH_DEADLINE_DAYS = 30;
const RUSH_ORDER_RATE = 0.28;
const rooms = new Map();

function createInitialState(roomId) {
  const state = {
    roomId,
    day: 1,
    dayProgress: 0,
    coins: 120,
    paint: 42,
    paintMax: 80,
    prestige: 8,
    selectedPainterId: "p1",
    paused: false,
    speed: 1,
    orderTimer: 0,
    trendIndex: 0,
    players: [],
    painters: [
      createPainter("p1", "青岚", "sketch", "door"),
      createPainter("p2", "阿澈", "finisher", "desk"),
      createPainter("p3", "南星", "mixer", "mixer"),
      createPainter("p4", "小满", "social", "gallery")
    ],
    stations: createInitialStations(),
    orders: [],
    activeTasks: [],
    artworks: [],
    log: []
  };
  state.orders.push(makeOrder(state), makeOrder(state));
  addLog(state, "联机画室开张，第一批客户已经到了。");
  return state;
}

function createInitialStations() {
  const stations = structuredClone(INITIAL_STATIONS);
  const occupied = new Set(stations.map((station) => station.x + ":" + station.y));
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 6; x += 1) {
      const key = x + ":" + y;
      if (!occupied.has(key)) {
        stations.push({ id: "empty-" + x + "-" + y, type: "empty", label: "空位", x, y });
      }
    }
  }
  return stations;
}

function createPainter(id, name, role, stationId) {
  return {
    id,
    name,
    role,
    stationId,
    skill: role === "finisher" ? 17 : role === "mixer" ? 13 : 12,
    fatigue: role === "social" ? 10 : 14,
    mood: 72,
    mode: "steady",
    action: defaultActionForStationId(stationId)
  };
}

function activeTrend(state) {
  return Object.keys(STYLE_LABELS)[state.trendIndex % Object.keys(STYLE_LABELS).length];
}

function addLog(state, message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 18);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function isRushOrder(order) {
  return Boolean(order.rush) || order.deadline < RUSH_DEADLINE_DAYS;
}

function makeOrder(state) {
  const client = randomItem(TOWN_CLIENTS);
  const style = Math.random() < 0.45 ? client.taste : randomItem(Object.keys(STYLE_LABELS));
  const trendBonus = style === activeTrend(state) ? 1.18 : 1;
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

function stationById(state, id) {
  return state.stations.find((station) => station.id === id);
}

function painterById(state, id) {
  return state.painters.find((painter) => painter.id === id);
}

function taskAtStation(state, stationId) {
  return state.activeTasks.find((task) => task.stationId === stationId);
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

function syncPainterAction(state, painter) {
  const station = stationById(state, painter.stationId);
  const task = station?.type === "easel" ? taskAtStation(state, station.id) : null;
  painter.action = defaultActionForStation(station, task);
}

function syncPaintersAtStation(state, stationId) {
  state.painters
    .filter((painter) => painter.stationId === stationId)
    .forEach((painter) => syncPainterAction(state, painter));
}

function freeEasel(state) {
  return state.stations.find((station) => station.type === "easel" && !taskAtStation(state, station.id));
}

function emptyStation(state) {
  return state.stations.find((station) => station.type === "empty");
}

function assignPainterToStation(state, painterId, stationId) {
  const painter = painterById(state, painterId);
  const station = stationById(state, stationId);
  if (!painter || !station || station.type === "empty") return;

  painter.stationId = station.id;
  syncPainterAction(state, painter);
  addLog(state, painter.name + "前往" + station.label + "。");
}

function acceptOrder(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  const station = freeEasel(state);
  if (!station) return addLog(state, "没有空画架，暂时接不了新活。");
  if (state.paint < order.paintCost) return addLog(state, "颜料不足，先去调色。");

  state.orders = state.orders.filter((item) => item.id !== orderId);
  state.paint -= order.paintCost;
  state.activeTasks.push(createTask(order, station.id));
  syncPaintersAtStation(state, station.id);
  addLog(state, "承接" + (isRushOrder(order) ? "加急" : "") + "《" + order.title + "》，放到" + station.label + "。");
}

function declineOrder(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  state.orders = state.orders.filter((item) => item.id !== orderId);
  state.prestige = Math.max(0, state.prestige - 1);
  addLog(state, "婉拒了" + order.client + "的订单。");
}

function buyItem(state, type) {
  const item = SHOP_ITEMS.find((entry) => entry.type === type);
  if (!item || state.coins < item.cost) return addLog(state, "金币还不够。");
  if (type !== "storage" && !emptyStation(state)) return addLog(state, "画室没有空位了。");

  state.coins -= item.cost;
  if (type === "storage") {
    state.paintMax += 18;
    state.paint = Math.min(state.paintMax, state.paint + 10);
  } else if (type === "gallery") {
    Object.assign(emptyStation(state), {
      id: "gallery-" + Date.now().toString(36),
      type: "gallery",
      label: "展示墙"
    });
    state.prestige += 6;
  } else {
    const count = state.stations.filter((station) => station.type === type).length + 1;
    Object.assign(emptyStation(state), {
      id: type + "-" + Date.now().toString(36),
      type,
      label: item.label + count,
      taskId: null
    });
  }
  addLog(state, "购买了" + item.label + "。");
}

function setPainterMode(state, painterId, mode) {
  if (!["fast", "steady", "detail"].includes(mode)) return;
  const painter = painterById(state, painterId);
  if (!painter) return;
  painter.mode = mode;
  addLog(state, painter.name + "改用" + { fast: "快画", steady: "稳画", detail: "精修" }[mode] + "。");
}

function setPainterIdle(state, painterId) {
  const painter = painterById(state, painterId);
  if (!painter) return;
  painter.action = "idle";
  addLog(state, painter.name + "停手了。");
}

function stepGame(state, dt) {
  if (state.paused) return;
  const scaled = dt * state.speed;
  state.dayProgress += scaled / 8;
  state.orderTimer += scaled;

  while (state.dayProgress >= 1) {
    state.dayProgress -= 1;
    state.day += 1;
    if (state.day % 4 === 0) {
      state.trendIndex += 1;
      addLog(state, "市场风向变成" + STYLE_LABELS[activeTrend(state)] + "。");
    }
  }

  if (state.orderTimer > 7.2 && state.orders.length < 5) {
    state.orderTimer = 0;
    const order = makeOrder(state);
    state.orders.push(order);
    addLog(state, order.client + "送来" + (isRushOrder(order) ? "加急" : "") + "《" + order.title + "》。");
  }

  updatePainters(state, scaled);
  updateDeadlines(state, scaled);
}

function updatePainters(state, dt) {
  for (const painter of state.painters) {
    const station = stationById(state, painter.stationId);
    if (!station) continue;

    if (painter.fatigue >= 100 && painter.action !== "resting") {
      painter.action = "idle";
      painter.mood = Math.max(24, painter.mood - 8);
      addLog(state, painter.name + "太累了，停下来喘口气。");
    }

    if (station.type === "bed" && painter.action === "resting") {
      painter.fatigue = Math.max(0, painter.fatigue - dt * 7.4);
      painter.mood = Math.min(100, painter.mood + dt * 1.8);
      if (painter.fatigue <= 1) painter.action = "idle";
    }

    if (station.type === "mixer" && painter.action === "mixing") {
      const roleBonus = painter.role === "mixer" ? 1.45 : 1;
      state.paint = Math.min(state.paintMax, state.paint + dt * (1.8 + painter.skill / 45) * roleBonus);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 1.45);
      painter.skill = Math.min(100, painter.skill + dt * 0.035);
    }

    if (station.type === "desk" && painter.action === "studying") {
      painter.skill = Math.min(100, painter.skill + dt * 0.22);
      painter.fatigue = Math.min(100, painter.fatigue + dt * 0.8);
      painter.mood = Math.max(12, painter.mood - dt * 0.25);
    }

    if (station.type === "easel" && painter.action === "painting") {
      const task = taskAtStation(state, station.id);
      if (!task) {
        painter.action = "practicing";
      } else {
        updatePainting(state, painter, task, dt);
      }
    }

    if (station.type === "easel" && painter.action === "practicing") {
      const task = taskAtStation(state, station.id);
      if (task) {
        painter.action = "painting";
        updatePainting(state, painter, task, dt);
      } else {
        painter.skill = Math.min(100, painter.skill + dt * 0.035);
        painter.fatigue = Math.min(100, painter.fatigue + dt * 0.35);
      }
    }
  }

  for (const task of [...state.activeTasks]) {
    if (task.progress >= 100) completeTask(state, task);
  }
}

function updatePainting(state, painter, task, dt) {
  if (state.paint <= 0) {
    addLog(state, "颜料见底，作画暂停。");
    painter.action = "idle";
    return;
  }

  const role = ROLE_DATA[painter.role];
  const phase = PHASES[task.phaseIndex] || "精修";
  const roleBonus = role.phase === phase ? 1.28 : 1;
  const trendBonus = task.style === activeTrend(state) ? 1.12 : 1;
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
}

function updateDeadlines(state, dt) {
  const dayDelta = dt / 8;

  for (const order of [...state.orders]) {
    order.deadline -= dayDelta;
    if (order.deadline <= 0) {
      state.orders = state.orders.filter((item) => item.id !== order.id);
      state.prestige = Math.max(0, state.prestige - 1);
      addLog(state, order.client + "等不及，带走了订单。");
    }
  }

  for (const task of [...state.activeTasks]) {
    task.deadline -= dayDelta;
    if (task.deadline <= 0) failTask(state, task);
  }
}

function completeTask(state, task) {
  const qualityBonus = 0.72 + task.quality / 100;
  const reward = Math.round(task.reward * qualityBonus);
  const prestigeGain = Math.max(1, Math.round(task.prestige * qualityBonus));
  state.coins += reward;
  state.prestige += prestigeGain;
  state.artworks.unshift({
    id: task.id,
    title: task.title,
    place: task.place,
    style: task.style,
    quality: Math.round(task.quality),
    authors: state.painters.filter((painter) => painter.stationId === task.stationId).map((painter) => painter.name)
  });
  state.artworks = state.artworks.slice(0, 18);
  state.activeTasks = state.activeTasks.filter((item) => item.id !== task.id);
  state.painters
    .filter((painter) => painter.stationId === task.stationId)
    .forEach((painter) => {
      syncPainterAction(state, painter);
      painter.mood = Math.min(100, painter.mood + 8);
    });
  addLog(state, "《" + task.title + "》交付到" + task.place + "，收入 " + reward + "。");
}

function failTask(state, task) {
  state.activeTasks = state.activeTasks.filter((item) => item.id !== task.id);
  state.prestige = Math.max(0, state.prestige - Math.max(2, task.prestige));
  state.painters
    .filter((painter) => painter.stationId === task.stationId)
    .forEach((painter) => {
      syncPainterAction(state, painter);
      painter.mood = Math.max(10, painter.mood - 10);
    });
  addLog(state, "《" + task.title + "》错过了期限。");
}

function createRoom(roomId) {
  return {
    id: roomId,
    state: createInitialState(roomId),
    clients: new Set(),
    lastBroadcastAt: 0
  };
}

function serializeRoom(room) {
  room.state.players = [...room.clients]
    .filter((client) => client.name && client.painterId)
    .map((client) => ({ id: client.id, name: client.name, painterId: client.painterId }));
  return room.state;
}

function getRoom(roomId) {
  const normalized = normalizeRoomId(roomId);
  if (!rooms.has(normalized)) rooms.set(normalized, createRoom(normalized));
  return rooms.get(normalized);
}

function normalizeRoomId(value) {
  return String(value || "atelier")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 16) || "ATELIER";
}

function assignPainter(room) {
  const occupied = new Set([...room.clients].map((client) => client.painterId).filter(Boolean));
  const free = room.state.painters.find((painter) => !occupied.has(painter.id));
  return free?.id || room.state.painters[0].id;
}

function sendJson(client, payload) {
  if (client.socket.destroyed) return;
  client.socket.write(encodeFrame(JSON.stringify(payload)));
}

function broadcast(room, force = false) {
  const now = Date.now();
  if (!force && now - room.lastBroadcastAt < 220) return;
  room.lastBroadcastAt = now;
  const snapshot = serializeRoom(room);
  for (const client of room.clients) {
    sendJson(client, { type: "snapshot", state: snapshot });
  }
}

function handleClientMessage(client, message) {
  let payload;
  try {
    payload = JSON.parse(message);
  } catch {
    return sendJson(client, { type: "error", message: "消息格式错误" });
  }

  if (payload.type === "join") {
    const room = getRoom(payload.roomId);
    client.room = room;
    client.name = String(payload.name || "画家").slice(0, 16);
    client.painterId = assignPainter(room);
    room.clients.add(client);
    addLog(room.state, client.name + "加入画室，认领了" + painterById(room.state, client.painterId).name + "。");
    sendJson(client, {
      type: "welcome",
      roomId: room.id,
      painterId: client.painterId,
      state: serializeRoom(room)
    });
    broadcast(room, true);
    return;
  }

  const room = client.room;
  if (!room) return sendJson(client, { type: "error", message: "请先加入房间" });
  const state = room.state;

  switch (payload.type) {
    case "assign_station":
      assignPainterToStation(state, client.painterId, payload.stationId);
      break;
    case "set_mode":
      setPainterMode(state, client.painterId, payload.mode);
      break;
    case "idle":
      setPainterIdle(state, client.painterId);
      break;
    case "accept_order":
      acceptOrder(state, payload.orderId);
      break;
    case "decline_order":
      declineOrder(state, payload.orderId);
      break;
    case "buy_item":
      buyItem(state, payload.itemType);
      break;
    case "new_order": {
      const order = makeOrder(state);
      state.orders.push(order);
      addLog(state, order.client + "送来《" + order.title + "》。");
      break;
    }
    case "pause":
      state.paused = !state.paused;
      addLog(state, state.paused ? "画室暂停。" : "画室继续运转。");
      break;
    case "speed":
      state.speed = state.speed === 1 ? 1.8 : state.speed === 1.8 ? 3 : 1;
      addLog(state, "时间速度 x" + state.speed + "。");
      break;
    case "reset":
      room.state = createInitialState(room.id);
      addLog(room.state, client.name + "重新开张画室。");
      break;
    default:
      return sendJson(client, { type: "error", message: "未知操作：" + payload.type });
  }

  broadcast(room, true);
}

function detachClient(client) {
  const room = client.room;
  if (!room) return;
  room.clients.delete(client);
  if (client.name) addLog(room.state, client.name + "离开画室。");
  if (!room.clients.size) {
    setTimeout(() => {
      if (!room.clients.size) rooms.delete(room.id);
    }, 60_000);
  } else {
    broadcast(room, true);
  }
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x81, payload.length]);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  return Buffer.concat([header, payload]);
}

function encodePong(payload) {
  const data = payload || Buffer.alloc(0);
  return Buffer.concat([Buffer.from([0x8a, data.length]), data]);
}

function parseFrames(client) {
  const frames = [];
  let offset = 0;
  const buffer = client.buffer;

  while (buffer.length - offset >= 2) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let headerLength = 2;

    if (length === 126) {
      if (buffer.length - offset < 4) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (buffer.length - offset < 10) break;
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }

    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + length;
    if (buffer.length - offset < frameLength) break;

    let payload = buffer.subarray(offset + headerLength + maskLength, offset + frameLength);
    if (masked) {
      const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }
    frames.push({ opcode, payload });
    offset += frameLength;
  }

  client.buffer = buffer.subarray(offset);
  return frames;
}

const server = http.createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Painters Guild WebSocket server. Use /guild-ws for WebSocket.\n");
});

server.on("upgrade", (req, socket) => {
  if (!req.url?.startsWith("/guild-ws")) {
    socket.destroy();
    return;
  }
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  if (!key) return socket.destroy();
  const accept = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      "Sec-WebSocket-Accept: " +
      accept +
      "\r\n\r\n"
  );

  const client = {
    id: crypto.randomUUID(),
    socket,
    buffer: Buffer.alloc(0),
    name: "",
    painterId: "",
    room: null
  };

  socket.on("data", (chunk) => {
    client.buffer = Buffer.concat([client.buffer, chunk]);
    for (const frame of parseFrames(client)) {
      if (frame.opcode === 0x1) handleClientMessage(client, frame.payload.toString("utf8"));
      if (frame.opcode === 0x8) socket.end();
      if (frame.opcode === 0x9) socket.write(encodePong(frame.payload));
    }
  });
  socket.on("close", () => detachClient(client));
  socket.on("error", () => detachClient(client));
});

setInterval(() => {
  for (const room of rooms.values()) {
    if (!room.clients.size) continue;
    stepGame(room.state, 0.1);
    broadcast(room);
  }
}, 100);

server.listen(PORT, HOST, () => {
  console.log(`Painters Guild server listening on http://${HOST}:${PORT}`);
  if (ALLOWED_ORIGINS.length) console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
