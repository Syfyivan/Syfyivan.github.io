/* 明·江南一生 · 文字版 Demo v1 —— 佃田一季核心循环
 * 验证三内核：① 一旬一操作·行动点取舍 ② 逐人资源守恒台账 ③ 看天吃饭的不确定性
 * 纯前端、无依赖、单文件驱动。数值为玩法占位（非史实精确值），全部可调。
 */
(function () {
  'use strict';

  // ── 常量：节气·旬 ────────────────────────────────
  // Demo 覆盖：立夏→芒种→夏至 三个节气、每节气 3 旬 = 9 旬一季（自插秧到收割缴租）
  var SOLAR = ['立夏', '芒种', '夏至'];
  var XUN = ['上旬', '中旬', '下旬'];
  var TOTAL_XUN = 9;              // 一季 9 旬
  var HARVEST_XUN = 8;            // 第 9 旬（index 8）为收割结算旬
  var AP_PER_XUN = 4;            // 本人每旬行动点（母另计，可雇短工加点）

  // ── 天气模型（看天吃饭）────────────────────────────
  // 每旬 roll 一个天气，影响秧苗生长与风险
  var WEATHERS = [
    { k: '晴', w: 34, grow: 1, note: '日头足，秧苗稳长' },
    { k: '多云', w: 26, grow: 1, note: '不温不火' },
    { k: '喜雨', w: 20, grow: 2, note: '及时雨，禾苗猛长' },
    { k: '暴雨', w: 12, grow: 0, risk: 'flood', note: '雨势过猛，恐涝' },
    { k: '干旱', w: 8, grow: 0, risk: 'drought', note: '连日无雨，田土发裂' }
  ];

  // ── 玩家状态 ───────────────────────────────────
  var S, ledger, seq, xunIndex, picks, resolved, gameOver;

  function initState() {
    S = {
      年龄: 16, 身份: '民籍·佃农子',
      体魄: 88, 家族: 60,
      白银: 1, 铜钱: 1200, 存米: 3,   // 立身分得的口粮与少量现钱
      // 佃田专属
      秧苗进度: 0,        // 0=未插秧；插秧后累积，达到 GROW_TARGET 可丰收
      已插秧: false,
      田亩: 4,            // 次子分得薄田
      租额石: 3,          // 秋后需向地主缴的租（以米计）
      菜圃进度: 0,        // 菜圃种植，几旬后省口粮
      母出工: true        // 母是否可帮工（腰痛事件会改变）
    };
    ledger = []; seq = 0; xunIndex = 0; picks = []; resolved = null; gameOver = false;
    recordEntry('立身开账', null, '期初：分得薄田4亩、存米3石、少量现钱，母可帮工。');
  }

  var GROW_TARGET = 12;   // 秧苗累计生长达到即可正常收成

  // ── 资源守恒台账 ─────────────────────────────────
  var LK = [
    { k: '白银', unit: '两' }, { k: '铜钱', unit: '文' }, { k: '存米', unit: '石' },
    { k: '体魄', unit: '' }, { k: '家族', unit: '' }
  ];
  function snapshot() { var o = {}; LK.forEach(function (x) { o[x.k] = S[x.k] || 0; }); return o; }
  function recordEntry(name, before, note) {
    seq += 1;
    var after = snapshot();
    var deltas = LK.map(function (x) {
      return { k: x.k, unit: x.unit, d: before ? (after[x.k] - before[x.k]) : 0, val: after[x.k] };
    });
    ledger.push({ seq: seq, name: name, solar: curLabel(), age: S.年龄, deltas: deltas, note: note || '' });
  }

  function curLabel() {
    if (xunIndex >= TOTAL_XUN) return '一季终';
    return SOLAR[Math.floor(xunIndex / 3)] + '·' + XUN[xunIndex % 3];
  }

  // ── 加权随机 & 工具 ──────────────────────────────
  function pickWeighted(arr) {
    var sum = arr.reduce(function (a, b) { return a + b.w; }, 0), r = Math.random() * sum;
    for (var i = 0; i < arr.length; i++) { r -= arr[i].w; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }
  function clampAttr(k) { if (S[k] < 0) S[k] = 0; if (S[k] > 100) S[k] = 100; }

  // ── 庄稼长势判定（统一口径，状态栏/叙事区/收成公式共用）──
  function growthInfo() {
    if (!S.已插秧) return { planted: false, ratio: 0, pct: 0, label: '未插秧', cls: 'g-none', tip: '尚未插秧，作物还没进入生长期' };
    var ratio = S.秧苗进度 / GROW_TARGET;
    var pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    var label, cls;
    if (ratio >= 1) { label = '长足'; cls = 'g-good'; }
    else if (ratio >= 0.7) { label = '尚可'; cls = 'g-ok'; }
    else if (ratio >= 0.4) { label = '偏薄'; cls = 'g-thin'; }
    else { label = '瘦弱'; cls = 'g-bad'; }
    return { planted: true, ratio: ratio, pct: pct, label: label, cls: cls, tip: '禾苗生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '，长势' + label };
  }

  // ── 本旬天气与事件（每进入一旬生成一次）──────────────
  var curWeather, curEvents;
  function rollXun() {
    curWeather = pickWeighted(WEATHERS);
    curEvents = [];
    // [农时] 事件：随节气推进给农时提示
    if (!S.已插秧 && xunIndex <= 2) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秧苗待插，立夏正是插秧时。错过则误农时、影响收成。' });
    if (S.已插秧 && xunIndex >= 2 && xunIndex < HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '禾苗生长中，需时时看水、除草。当前生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '。' });
    if (xunIndex === HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '夏至已过，稻谷成熟，正是收割结算之时！' });
    // [关系] 事件：母亲腰痛（中旬概率触发一次）
    if (xunIndex === 3 && S.母出工) curEvents.push({ t: 'rel', tag: '[关系]', txt: '母亲腰痛加重。若这一旬去照护，可稳住她的身子（家族+），否则她将无法帮工。' });
    // [随机] 事件：米价波动
    S._米价 = (Math.random() < 0.5) ? '低' : '高';
    curEvents.push({ t: 'rand', tag: '[随机]', txt: '米行传来消息：今旬新米价走' + S._米价 + '。' + (S._米价 === '高' ? '若有余米，正是好价钱。' : '此时卖米不划算，可压仓。') });
  }

  // ── 行动定义（每旬可选，受行动点约束）──────────────
  // cost=行动点; 有的行动带额外资源花费/前置
  function availableActions() {
    var A = [];
    var last = (xunIndex === HARVEST_XUN);
    if (last) {
      // 收割旬：动作聚焦收割与缴租
      A.push({ id: 'harvest', name: '收割稻谷', cost: 2, desc: '召集人手抢收。收成取决于这一季的生长与天气。', can: S.已插秧, why: S.已插秧 ? '' : '未曾插秧，无可收' });
      A.push({ id: 'hire_harvest', name: '雇短工助收', cost: 1, money: 100, desc: '花100文雇人，抢在天变前收完，减少损耗。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文' });
      A.push({ id: 'pay_rent', name: '向地主缴租', cost: 1, desc: '按佃约缴租' + S.租额石 + '石米。这是佃田的本分，也是守恒的一环。', can: true });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, desc: '养回体魄，收割季尤其耗人。', can: true });
    } else {
      A.push({ id: 'plant', name: '水田·插秧', cost: 2, desc: '把秧插下，作物才进入生长期。越早插越好。', can: !S.已插秧, why: S.已插秧 ? '已插过秧' : '' });
      A.push({ id: 'hire_plant', name: '雇短工帮插秧', cost: 1, money: 80, desc: '花80文抢在雨前插完，降低烂秧风险（需同旬插秧）。', can: !S.已插秧 && S.铜钱 >= 80, why: S.已插秧 ? '已插过秧' : (S.铜钱 < 80 ? '铜钱不足80文' : '') });
      A.push({ id: 'tend', name: '水田·看水除草', cost: 1, desc: '照料禾苗，本旬生长+1（好天气更佳）。', can: S.已插秧, why: S.已插秧 ? '' : '尚未插秧' });
      A.push({ id: 'garden', name: '菜圃·浇灌', cost: 1, desc: '侍弄时蔬，几旬后收一茬省口粮（存米+）。', can: true });
      A.push({ id: 'care', name: '灶间·照护母亲', cost: 1, desc: '照料家人，家族关系+；母病时可稳住她的身子。', can: true });
      A.push({ id: 'exchange', name: '里社·换工互助', cost: 1, desc: '与邻里换工：这一旬帮人，日后人手紧时有人还工（家族+，不涉现钱）。', can: true });
      A.push({ id: 'sell', name: '市镇·米行卖米', cost: 1, desc: '卖1石存米换现钱。米价' + (S._米价 || '?') + '时到手不同。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '无米可卖' });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, desc: '养回体魄（+6），别把身子累垮。', can: true });
    }
    return A;
  }

  // ── DOM ────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };

  function renderStatus() {
    var h = '';
    h += '<span class="chip">第 <b>' + generationLabel() + '</b></span>';
    h += '<span class="chip">' + curLabel() + '</span>';
    h += '<span class="chip">年龄 <b>' + S.年龄 + '</b></span>';
    h += '<span class="chip">身份 <b>' + S.身份 + '</b></span>';
    h += '<span class="chip">佃田 <b>' + S.田亩 + '</b>亩</span>';
    var g = growthInfo();
    h += '<span class="chip crop"><span class="g-dot ' + g.cls + '"></span>庄稼 <b>' + (g.planted ? g.label + ' ' + g.pct + '%' : '未插秧') + '</b></span>';
    h += '<span class="chip hp">体魄 <b>' + S.体魄 + '</b></span>';
    h += '<span class="chip">家族 <b>' + S.家族 + '</b></span>';
    h += '<span class="chip coin">白银 <b>' + S.白银 + '</b>两</span>';
    h += '<span class="chip coin">铜钱 <b>' + S.铜钱 + '</b>文</span>';
    h += '<span class="chip coin">存米 <b>' + S.存米 + '</b>石</span>';
    $('status').innerHTML = h;
  }
  function generationLabel() { return '陈阿二 · 佃田一季'; }

  function spent() { return picks.reduce(function (a, p) { return a + p.cost; }, 0); }
  function remainAP() { return AP_PER_XUN - spent(); }

  function renderStage() {
    if (gameOver) return;
    var last = (xunIndex === HARVEST_XUN);
    var h = '';
    h += '<div class="season-line">◆ ' + curLabel() + ' ｜ 天气：' + curWeather.k + '（' + curWeather.note + '）</div>';
    // 庄稼长势条：一眼看清插了多少、长到几成
    var g = growthInfo();
    h += '<div class="crop-bar ' + g.cls + '">' +
      '<div class="cb-head"><span class="cb-title">🌾 田亩 ' + S.田亩 + ' 亩 · 庄稼长势</span>' +
      '<span class="cb-val">' + (g.planted ? (g.label + '（' + S.秧苗进度 + '/' + GROW_TARGET + '，' + g.pct + '%）') : '尚未插秧') + '</span></div>' +
      '<div class="cb-track"><i style="width:' + g.pct + '%"></i></div>' +
      '<div class="cb-tip">' + (g.planted ? (S.秧苗进度 >= GROW_TARGET ? '禾苗已<b>长足封顶（12/12）</b>，再看水也不会长了——把人手匀去挣钱或顾家更划算。' : '离"长足丰收（12/12）"还差 ' + (GROW_TARGET - S.秧苗进度) + ' 点生长；勤看水除草、遇喜雨可加快。到 12 即封顶。') : '立夏正是插秧时，越早插下，可生长的旬数越多（生长满 12 即达丰收上限）。') + '</div>' +
      '</div>';
    h += '<div class="narr">' + narrative() + '</div>';

    // 事件
    h += '<div class="events">';
    curEvents.forEach(function (e) {
      h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>';
    });
    h += '</div>';

    // 若本旬已结算，显示结算面板
    if (resolved) {
      h += resolved;
      h += '<div class="commit"><button id="btn-next">' + (xunIndex >= TOTAL_XUN ? '查看一季总结 →' : '进入下一旬 →') + '</button></div>';
      $('stage').innerHTML = h;
      var nb = $('btn-next'); if (nb) nb.addEventListener('click', nextXun);
      return;
    }

    // 行动点分配
    h += '<div class="ap-head"><h3>' + (last ? '收割旬 · 分配行动点' : '这一旬 · 分配行动点') + '</h3>' +
      '<span class="ap-dots">剩余 <b>' + remainAP() + '</b> / ' + AP_PER_XUN + ' 点</span></div>';
    h += '<div class="actions">';
    availableActions().forEach(function (a) {
      var picked = picks.filter(function (p) { return p.id === a.id; }).length;
      var disabled = !a.can || a.cost > remainAP() || (picked > 0 && a.once !== false && isOnce(a.id));
      h += '<button class="act" data-id="' + a.id + '"' + (disabled ? ' disabled' : '') + '>' +
        '<span class="a-top"><span class="a-name">' + a.name + '</span>' +
        '<span class="a-cost">' + a.cost + '点' + (a.money ? ' -' + a.money + '文' : '') + '</span></span>' +
        '<span class="a-desc">' + a.desc + (a.can ? '' : '（' + (a.why || '不可选') + '）') + '</span>' +
        (picked ? '<span class="a-picked">已选 ×' + picked + '</span>' : '') +
        '</button>';
    });
    h += '</div>';

    // 已选清单 + 提交
    h += '<div class="commit">';
    h += '<button id="btn-commit"' + (picks.length ? '' : ' disabled') + '>结算这一旬（旬末看天）</button>';
    h += '<span class="hint">' + (picks.length ? ('已排：' + picks.map(function (p) { return p.name; }).join('、')) : '点上面的动作来安排这一旬。剩余行动点用不完也可提前结算。') + '</span>';
    h += '</div>';

    $('stage').innerHTML = h;

    Array.prototype.forEach.call(document.querySelectorAll('.act:not(:disabled)'), function (btn) {
      btn.addEventListener('click', function () { addPick(btn.getAttribute('data-id')); });
    });
    var cb = $('btn-commit'); if (cb) cb.addEventListener('click', commitXun);
  }

  // 哪些动作一旬只能做一次
  function isOnce(id) { return ['plant', 'hire_plant', 'care', 'harvest', 'hire_harvest', 'pay_rent', 'rest', 'exchange'].indexOf(id) >= 0; }

  function narrative() {
    if (xunIndex === 0) return '你是<span class="em">陈阿二</span>，江南某县民籍佃农之子，十六岁成丁。父兄承了祖业薄田，你分得<span class="em">四亩水田</span>与三石口粮，向本村地主佃田耕作。这一季从插秧到秋收，能落下多少米、缴完租还剩几何，全看你如何安排这有限的人手与光阴。';
    if (xunIndex === HARVEST_XUN) return '九旬光阴倏忽而过，稻子黄了。这一旬要抢收、要缴租——一季的成败，就看仓里最后能剩下多少米。';
    return '农事未歇，日子一旬一旬地过。你掂量着手里的人手：是下田侍弄禾苗，还是去挣几个现钱，或是顾一顾家里？';
  }

  function addPick(id) {
    var a = availableActions().filter(function (x) { return x.id === id; })[0];
    if (!a || !a.can || a.cost > remainAP()) return;
    if (isOnce(id) && picks.some(function (p) { return p.id === id; })) return;
    picks.push({ id: a.id, name: a.name, cost: a.cost, money: a.money || 0 });
    renderStage();
  }

  // ── 结算这一旬（应用选择后果 + 看天）──────────────
  function commitXun() {
    var before = snapshot();
    var log = [];
    var didPlantThisXun = false, hiredPlant = false, tendCount = 0, didHarvest = false, hiredHarvest = false;

    picks.forEach(function (p) {
      switch (p.id) {
        case 'plant': S.已插秧 = true; S.秧苗进度 += 1; S.体魄 -= 4; didPlantThisXun = true; log.push(['插秧完成，禾苗入田', 'good']); break;
        case 'hire_plant': S.铜钱 -= p.money; hiredPlant = true; log.push(['雇短工帮插秧，付 ' + p.money + ' 文', 'bad']); break;
        case 'tend':
          if (S.秧苗进度 >= GROW_TARGET) { log.push(['禾苗已长足，本旬看水无额外增长（宜把人手匀去别处）', 'good']); }
          else { S.秧苗进度 += (1 + (curWeather.grow >= 2 ? 1 : 0)); S.体魄 -= 2; tendCount++; log.push(['看水除草，禾苗生长', 'good']); }
          break;
        case 'garden': S.菜圃进度 += 1; S.体魄 -= 1; if (S.菜圃进度 >= 3) { S.存米 += 1; S.菜圃进度 = 0; log.push(['菜圃收了一茬，存米+1石', 'good']); } else { log.push(['浇灌菜圃（' + S.菜圃进度 + '/3）', 'good']); } break;
        case 'care': S.家族 += 4; if (curEvents.some(function (e) { return e.t === 'rel'; })) { S.母出工 = true; log.push(['照护母亲，腰痛稳住，家族+4', 'good']); } else { log.push(['照护家人，家族+4', 'good']); } break;
        case 'exchange': S.家族 += 3; S.体魄 -= 2; log.push(['与邻里换工，家族+3（日后有人还工）', 'good']); break;
        case 'sell':
          var price = (S._米价 === '高') ? 550 : 350; // 1石到手铜钱（占位区间）
          S.存米 -= 1; S.铜钱 += price; log.push(['卖米1石，米价' + S._米价 + '，得 ' + price + ' 文', 'good']); break;
        case 'rest': S.体魄 += 6; log.push(['歇息养身，体魄+6', 'good']); break;
        case 'harvest': didHarvest = true; S.体魄 -= 6; break;
        case 'hire_harvest': S.铜钱 -= p.money; hiredHarvest = true; log.push(['雇短工助收，付 ' + p.money + ' 文', 'bad']); break;
        case 'pay_rent':
          if (S.存米 >= S.租额石) { S.存米 -= S.租额石; log.push(['向地主缴租 ' + S.租额石 + ' 石，佃约了讫', 'bad']); }
          else { S.家族 -= 8; log.push(['存米不足缴租！欠租，家族-8（来年恐失佃权）', 'bad']); }
          break;
      }
    });

    // 若这一旬插秧但没雇工、恰逢暴雨→烂秧风险
    if (didPlantThisXun && !hiredPlant && curWeather.risk === 'flood') {
      S.秧苗进度 = Math.max(0, S.秧苗进度 - 1);
      log.push(['暴雨冲了新插的秧，生长-1（若雇工可避）', 'bad']);
    }
    // 天气对已成田的额外影响
    if (S.已插秧 && !didHarvest) {
      if (curWeather.risk === 'drought' && tendCount === 0) { S.秧苗进度 = Math.max(0, S.秧苗进度 - 1); log.push(['干旱又无人看水，禾苗打蔫，生长-1', 'bad']); }
      if (curWeather.k === '喜雨' && S.已插秧) { S.秧苗进度 += 1; log.push(['喜雨润田，禾苗额外生长+1', 'good']); }
    }

    // 收割结算
    var harvestLine = '';
    if (didHarvest) {
      var yield0 = computeYield(hiredHarvest);
      S.存米 += yield0.mi;
      log.push(['收割：得米 ' + yield0.mi + ' 石（' + yield0.reason + '）', yield0.mi >= S.租额石 ? 'good' : 'bad']);
    }

    clampAttr('体魄'); clampAttr('家族');
    if (S.秧苗进度 > GROW_TARGET) S.秧苗进度 = GROW_TARGET;  // 长足即封顶，超出无益
    recordEntry(picks.length ? ('本旬：' + picks.map(function (p) { return p.name; }).join('、')) : '本旬歇息', before, '');

    // 生成结算面板
    var rh = '<div class="resolve"><h4>旬末结算 · ' + curLabel() + ' · 天气' + curWeather.k + '</h4>';
    if (!log.length) rh += '<div class="line">这一旬无所作为，光阴空过。</div>';
    log.forEach(function (l) { rh += '<div class="line ' + l[1] + '">· ' + l[0] + '</div>'; });
    // 守恒提示
    var after = snapshot();
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + ' ｜ 体魄 ' + before.体魄 + '→' + after.体魄 + '</div>';
    rh += '</div>';
    resolved = rh;
    renderStage(); renderLedger(); renderStatus();
  }

  // 收成公式：看生长达标度 + 是否雇工抢收 + 随机年景
  function computeYield(hired) {
    var base = 0, reason = '';
    var ratio = S.秧苗进度 / GROW_TARGET;
    if (ratio >= 1) { base = 7; reason = '禾苗长足'; }
    else if (ratio >= 0.7) { base = 5; reason = '生长尚可'; }
    else if (ratio >= 0.4) { base = 3; reason = '照料不足，收成偏薄'; }
    else { base = 1; reason = '几近荒废，颗粒无几'; }
    // 抢收减损
    if (hired) { base += 1; reason += '，雇工抢收减损'; }
    // 年景随机 ±1
    var luck = Math.floor(Math.random() * 3) - 1;
    base += luck;
    if (luck > 0) reason += '，年景好'; else if (luck < 0) reason += '，年景欠佳';
    if (base < 0) base = 0;
    return { mi: base, reason: reason };
  }

  // ── 进入下一旬 / 结束 ────────────────────────────
  function nextXun() {
    resolved = null; picks = [];
    xunIndex += 1;
    if (xunIndex >= TOTAL_XUN) { endSeason(); return; }
    rollXun();
    renderStage(); renderStatus(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function endSeason() {
    gameOver = true;
    var rentPaid = ledger.some(function (e) { return /缴租/.test(e.name) || e.deltas; });
    var h = '<div class="end">';
    h += '<h2>一季终了 · 秋收结算</h2>';
    h += '<div class="stat">最终存米：<b>' + S.存米 + '</b> 石</div>';
    h += '<div class="stat">白银 ' + S.白银 + ' 两 · 铜钱 ' + S.铜钱 + ' 文</div>';
    h += '<div class="stat">体魄 ' + S.体魄 + ' · 家族 ' + S.家族 + '</div>';
    var comment;
    if (S.存米 >= 5) comment = '这一季经营得法，缴租之后仓中尚有余粮，可安稳过冬，来年或能续佃甚至添田。';
    else if (S.存米 >= 2) comment = '勉强温饱，缴租后所剩无多。佃田的日子本就如此，一分耕耘一分收成，看天亦看人。';
    else if (S.存米 >= 0) comment = '这一季过得紧巴，几乎无米过冬，怕是要向人借贷或打短工补贴。';
    else comment = '入不敷出，已然欠债。佃农一遇歉年便是如此艰难——这正是这游戏想让你体会的重量。';
    h += '<div class="stat" style="margin-top:.8rem;color:var(--ink)">' + comment + '</div>';
    h += '<div class="stat credi" style="margin-top:.6rem">这只是一生中的一季。完整游戏里，它将接续到婚育、当户、养老与子孙传承。</div>';
    h += '<div class="commit" style="justify-content:center"><button id="btn-again">再玩一季 →</button></div>';
    h += '</div>';
    $('stage').innerHTML = h;
    renderStatus(); renderLedger();
    var ab = $('btn-again'); if (ab) ab.addEventListener('click', restart);
  }

  // ── 流水账渲染 ───────────────────────────────────
  function fmtD(o) {
    if (o.d > 0) return '<span class="lg-up">' + o.k + '+' + o.d + o.unit + '</span>';
    if (o.d < 0) return '<span class="lg-down">' + o.k + o.d + o.unit + '</span>';
    return '';
  }
  function renderLedger() {
    var sum = ['白银', '铜钱', '存米'].map(function (k) {
      var u = k === '白银' ? '两' : k === '铜钱' ? '文' : '石';
      return k + ' <b style="color:var(--info)">' + (S[k] || 0) + '</b>' + u;
    }).join(' · ');
    var h = '<div class="lg-head"><span>人生流水账</span><span class="lg-sum">共 ' + ledger.length + ' 笔</span></div>';
    h += '<div class="lg-sum" style="margin-bottom:.5rem">结余：' + sum + '</div>';
    for (var i = ledger.length - 1; i >= 0; i--) {
      var en = ledger[i];
      var changed = en.deltas.filter(function (o) { return o.d !== 0; });
      var dh = changed.map(fmtD).join('');
      if (en.seq === 1) dh = '<span class="lg-flat">期初开账</span>';
      else if (!dh) dh = '<span class="lg-flat">资源无增减</span>';
      h += '<div class="lg-item">' +
        '<div class="lg-top"><span>#' + en.seq + ' ' + en.solar + '</span><span>' + en.age + '岁</span></div>' +
        '<div class="lg-name">' + en.name + '</div>' +
        '<div class="lg-d">' + dh + '</div>' +
        (en.note ? '<div class="lg-top" style="color:var(--muted)">' + en.note + '</div>' : '') +
        '</div>';
    }
    $('ledger').innerHTML = h;
  }

  // ── 启动 ────────────────────────────────────────
  function restart() { initState(); rollXun(); renderStatus(); renderStage(); renderLedger(); window.scrollTo({ top: 0 }); }
  document.getElementById('btn-restart').addEventListener('click', restart);
  restart();
})();
