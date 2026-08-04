/* 明·江南一生 · 文字版 Demo v2 —— 完整人生链路
 * 农事一季（旬循环）→ 成家 → 当户（分家/当役）→ 养老 → 死亡传承 → 下一代递归重开
 * 三内核不变：① 行动点取舍 ② 逐人资源守恒台账 ③ 看天吃饭的不确定性
 * 全部点数与概率显式标注。数值均为玩法占位（非史实精确值），全部可调。
 * 史料红线：不评分（无孝顺/毅力/成败分）；生育夭折寿命破家均为概率；资源守恒；务农不写成低等。
 */
(function () {
  'use strict';

  // ── 常量：节气·旬 ────────────────────────────────
  var SOLAR = ['立夏', '芒种', '夏至'];
  var XUN = ['上旬', '中旬', '下旬'];
  var TOTAL_XUN = 9;
  var HARVEST_XUN = 8;
  var AP_PER_XUN = 4;
  var GROW_TARGET = 12;

  var WEATHERS = [
    { k: '晴', w: 34, grow: 1, note: '日头足，秧苗稳长' },
    { k: '多云', w: 26, grow: 1, note: '不温不火' },
    { k: '喜雨', w: 20, grow: 2, note: '及时雨，禾苗猛长' },
    { k: '暴雨', w: 12, grow: 0, risk: 'flood', note: '雨势过猛，恐涝' },
    { k: '干旱', w: 8, grow: 0, risk: 'drought', note: '连日无雨，田土发裂' }
  ];

  // ── 全局状态 ───────────────────────────────────
  var S, ledger, seq, xunIndex, picks, resolved, gameOver;
  var phase;                 // 'farm' | 'marriage' | 'household' | 'elder' | 'death'
  var generation = 0;        // 第几代
  var carryOver = null;      // 上一代传下的期初结余
  var curStage = null;       // 当前人生阶段卡（非农事时）

  function initState(carry) {
    S = {
      年龄: 16, 身份: '民籍·佃农子',
      体魄: 88, 家族: 60,
      白银: 1, 铜钱: 1200, 存米: 3,
      秧苗进度: 0, 已插秧: false, 田亩: 4, 租额石: 3, 菜圃进度: 0, 母出工: true,
      // 人生链路字段
      妻室: false, 子数: 0, 女数: 0, 负债银: 0, 口食田: 0, 分家: false, 应役: '未役'
    };
    if (carry) {
      S.白银 = Math.max(0, carry.白银 || 0);
      S.存米 = Math.max(0, carry.存米 || 0);
      S.铜钱 = carry.铜钱 != null ? carry.铜钱 : 1200;
      S.田亩 = Math.max(1, carry.田亩 || 4);
      S.家族 = Math.max(20, Math.min(80, carry.家族 == null ? 60 : carry.家族));
    }
    ledger = []; seq = 0; xunIndex = 0; picks = []; resolved = null; gameOver = false;
    phase = 'farm'; curStage = null;
    recordEntry('立身开账', null,
      generation > 1 ? ('第' + generation + '代次子立身：承上一代遗产分得田' + S.田亩 + '亩、存米' + S.存米 + '石、白银' + S.白银 + '两。')
        : '期初：分得薄田4亩、存米3石、少量现钱，母可帮工。');
  }

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
    if (phase !== 'farm') return curStage ? curStage.label : (S.年龄 + '岁');
    if (xunIndex >= TOTAL_XUN) return '一季终';
    return SOLAR[Math.floor(xunIndex / 3)] + '·' + XUN[xunIndex % 3];
  }

  // ── 随机工具 ──────────────────────────────────
  function pickWeighted(arr) {
    var sum = arr.reduce(function (a, b) { return a + b.w; }, 0), r = Math.random() * sum;
    for (var i = 0; i < arr.length; i++) { r -= arr[i].w; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }
  // 概率表 [{p:0.6,r:'safe'},...] p 之和应=1，返回命中的 r
  function rollProb(table) {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < table.length; i++) { acc += table[i].p; if (r <= acc) return table[i].r; }
    return table[table.length - 1].r;
  }
  function clampAttr(k) { if (S[k] < 0) S[k] = 0; if (S[k] > 100) S[k] = 100; }

  function growthInfo() {
    if (!S.已插秧) return { planted: false, ratio: 0, pct: 0, label: '未插秧', cls: 'g-none' };
    var ratio = S.秧苗进度 / GROW_TARGET;
    var pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    var label, cls;
    if (ratio >= 1) { label = '长足'; cls = 'g-good'; }
    else if (ratio >= 0.7) { label = '尚可'; cls = 'g-ok'; }
    else if (ratio >= 0.4) { label = '偏薄'; cls = 'g-thin'; }
    else { label = '瘦弱'; cls = 'g-bad'; }
    return { planted: true, ratio: ratio, pct: pct, label: label, cls: cls };
  }

  // ── 农事：本旬天气与事件 ────────────────────────
  var curWeather, curEvents;
  function rollXun() {
    curWeather = pickWeighted(WEATHERS);
    curEvents = [];
    if (!S.已插秧 && xunIndex <= 2) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秧苗待插，立夏正是插秧时。错过则误农时、影响收成。' });
    if (S.已插秧 && xunIndex >= 2 && xunIndex < HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '禾苗生长中，需时时看水、除草。当前生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '。' });
    if (xunIndex === HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '夏至已过，稻谷成熟，正是收割结算之时！' });
    if (xunIndex === 3 && S.母出工) curEvents.push({ t: 'rel', tag: '[关系]', txt: '母亲腰痛加重。若这一旬去照护，可稳住她的身子（家族+4），否则她将无法帮工。' });
    S._米价 = (Math.random() < 0.5) ? '低' : '高';
    curEvents.push({ t: 'rand', tag: '[随机]', txt: '米行传来消息：今旬新米价走' + S._米价 + '。' + (S._米价 === '高' ? '若有余米，正是好价钱（1石≈550文）。' : '此时卖米不划算（1石≈350文），可压仓。') });
  }

  // 农事动作（eff = 显式点数标注）
  function availableActions() {
    var A = [];
    if (xunIndex === HARVEST_XUN) {
      A.push({ id: 'harvest', name: '收割稻谷', cost: 2, eff: '体魄-6·得米按长势(1~7石)', desc: '召集人手抢收。收成取决于这一季的生长与天气。', can: S.已插秧, why: S.已插秧 ? '' : '未曾插秧，无可收' });
      A.push({ id: 'hire_harvest', name: '雇短工助收', cost: 1, money: 100, eff: '铜钱-100·收成+1石', desc: '花100文雇人，抢在天变前收完，减少损耗。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文' });
      A.push({ id: 'pay_rent', name: '向地主缴租', cost: 1, eff: '存米-' + S.租额石 + '石(不足则家族-8)', desc: '按佃约缴租' + S.租额石 + '石米。这是佃田的本分，也是守恒的一环。', can: true });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, eff: '体魄+6', desc: '养回体魄，收割季尤其耗人。', can: true });
    } else {
      A.push({ id: 'plant', name: '水田·插秧', cost: 2, eff: '体魄-4·生长+1·开启生长期', desc: '把秧插下，作物才进入生长期。越早插越好。', can: !S.已插秧, why: S.已插秧 ? '已插过秧' : '' });
      A.push({ id: 'hire_plant', name: '雇短工帮插秧', cost: 1, money: 80, eff: '铜钱-80·防暴雨烂秧', desc: '花80文抢在雨前插完，降低烂秧风险（需同旬插秧）。', can: !S.已插秧 && S.铜钱 >= 80, why: S.已插秧 ? '已插过秧' : (S.铜钱 < 80 ? '铜钱不足80文' : '') });
      A.push({ id: 'tend', name: '水田·看水除草', cost: 1, eff: '体魄-2·生长+1(喜雨+2·封顶12)', desc: '照料禾苗，本旬生长+1（好天气更佳）。', can: S.已插秧, why: S.已插秧 ? '' : '尚未插秧' });
      A.push({ id: 'garden', name: '菜圃·浇灌', cost: 1, eff: '体魄-1·满3旬存米+1石', desc: '侍弄时蔬，几旬后收一茬省口粮。', can: true });
      A.push({ id: 'care', name: '灶间·照护母亲', cost: 1, eff: '家族+4·母病时稳住帮工', desc: '照料家人，家族关系+；母病时可稳住她的身子。', can: true });
      A.push({ id: 'exchange', name: '里社·换工互助', cost: 1, eff: '家族+3·体魄-2', desc: '与邻里换工：这一旬帮人，日后人手紧时有人还工。', can: true });
      A.push({ id: 'sell', name: '市镇·米行卖米', cost: 1, eff: '存米-1·铜钱+(高550/低350)', desc: '卖1石存米换现钱。今旬米价' + (S._米价 || '?') + '。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '无米可卖' });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, eff: '体魄+6', desc: '养回体魄，别把身子累垮。', can: true });
    }
    return A;
  }

  // ── DOM ────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };

  function renderStatus() {
    var h = '';
    h += '<span class="chip">第 <b>' + generation + '</b> 代</span>';
    h += '<span class="chip">' + curLabel() + '</span>';
    h += '<span class="chip">年龄 <b>' + S.年龄 + '</b></span>';
    h += '<span class="chip">身份 <b>' + S.身份 + '</b></span>';
    h += '<span class="chip">田产 <b>' + S.田亩 + '</b>亩</span>';
    if (phase === 'farm') {
      var g = growthInfo();
      h += '<span class="chip crop"><span class="g-dot ' + g.cls + '"></span>庄稼 <b>' + (g.planted ? g.label + ' ' + g.pct + '%' : '未插秧') + '</b></span>';
    } else {
      h += '<span class="chip">妻室 <b>' + (S.妻室 ? '已娶' : '未娶') + '</b></span>';
      h += '<span class="chip">子嗣 <b>' + S.子数 + '</b>男' + S.女数 + '女</span>';
    }
    h += '<span class="chip hp">体魄 <b>' + S.体魄 + '</b></span>';
    h += '<span class="chip">家族 <b>' + S.家族 + '</b></span>';
    h += '<span class="chip coin">白银 <b>' + S.白银 + '</b>两</span>';
    h += '<span class="chip coin">铜钱 <b>' + S.铜钱 + '</b>文</span>';
    h += '<span class="chip coin">存米 <b>' + S.存米 + '</b>石</span>';
    if (S.负债银 > 0) h += '<span class="chip debt">负债 <b>' + S.负债银 + '</b>两</span>';
    $('status').innerHTML = h;
  }

  function spent() { return picks.reduce(function (a, p) { return a + p.cost; }, 0); }
  function remainAP() { return AP_PER_XUN - spent(); }

  // ═══════════════ 农事阶段渲染（旬循环）═══════════════
  function renderStage() {
    if (phase !== 'farm') { renderLifeStage(); return; }
    if (gameOver) return;
    var last = (xunIndex === HARVEST_XUN);
    var h = '';
    h += '<div class="season-line">◆ ' + curLabel() + ' ｜ 天气：' + curWeather.k + '（' + curWeather.note + '）</div>';
    var g = growthInfo();
    h += '<div class="crop-bar ' + g.cls + '">' +
      '<div class="cb-head"><span class="cb-title">🌾 田亩 ' + S.田亩 + ' 亩 · 庄稼长势</span>' +
      '<span class="cb-val">' + (g.planted ? (g.label + '（' + S.秧苗进度 + '/' + GROW_TARGET + '，' + g.pct + '%）') : '尚未插秧') + '</span></div>' +
      '<div class="cb-track"><i style="width:' + g.pct + '%"></i></div>' +
      '<div class="cb-tip">' + (g.planted ? (S.秧苗进度 >= GROW_TARGET ? '禾苗已<b>长足封顶（12/12）</b>，再看水也不会长了——把人手匀去挣钱或顾家更划算。' : '离"长足丰收（12/12）"还差 ' + (GROW_TARGET - S.秧苗进度) + ' 点生长；勤看水除草、遇喜雨可加快。到 12 即封顶。') : '立夏正是插秧时，越早插下，可生长的旬数越多（生长满 12 即达丰收上限）。') + '</div>' +
      '</div>';
    h += '<div class="narr">' + narrative() + '</div>';

    h += '<div class="events">';
    curEvents.forEach(function (e) { h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>'; });
    h += '</div>';

    if (resolved) {
      h += resolved;
      h += '<div class="commit"><button id="btn-next">' + (xunIndex >= TOTAL_XUN ? '一季终了 · 步入人生下一程 →' : '进入下一旬 →') + '</button></div>';
      $('stage').innerHTML = h;
      var nb = $('btn-next'); if (nb) nb.addEventListener('click', nextXun);
      return;
    }

    h += '<div class="ap-head"><h3>' + (last ? '收割旬 · 分配行动点' : '这一旬 · 分配行动点') + '</h3>' +
      '<span class="ap-dots">剩余 <b>' + remainAP() + '</b> / ' + AP_PER_XUN + ' 点</span></div>';
    h += '<div class="actions">';
    availableActions().forEach(function (a) {
      var picked = picks.filter(function (p) { return p.id === a.id; }).length;
      var disabled = !a.can || a.cost > remainAP() || (picked > 0 && isOnce(a.id));
      h += '<button class="act" data-id="' + a.id + '"' + (disabled ? ' disabled' : '') + '>' +
        '<span class="a-top"><span class="a-name">' + a.name + '</span>' +
        '<span class="a-cost">' + a.cost + '点' + (a.money ? ' -' + a.money + '文' : '') + '</span></span>' +
        '<span class="a-eff">▸ ' + a.eff + '</span>' +
        '<span class="a-desc">' + a.desc + (a.can ? '' : '（' + (a.why || '不可选') + '）') + '</span>' +
        (picked ? '<span class="a-picked">已选 ×' + picked + '</span>' : '') +
        '</button>';
    });
    h += '</div>';

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

  function isOnce(id) { return ['plant', 'hire_plant', 'care', 'harvest', 'hire_harvest', 'pay_rent', 'rest', 'exchange'].indexOf(id) >= 0; }

  function narrative() {
    if (xunIndex === 0) return '你是<span class="em">陈阿二</span>' + (generation > 1 ? '（第' + generation + '代）' : '') + '，江南某县民籍佃农之子，十六岁成丁。父兄承了祖业薄田，你分得<span class="em">' + S.田亩 + '亩水田</span>与口粮，向本村地主佃田耕作。这一季从插秧到秋收，能落下多少米、缴完租还剩几何，全看你如何安排这有限的人手与光阴。';
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

  function commitXun() {
    var before = snapshot();
    var log = [];
    var didPlantThisXun = false, hiredPlant = false, tendCount = 0, didHarvest = false, hiredHarvest = false;

    picks.forEach(function (p) {
      switch (p.id) {
        case 'plant': S.已插秧 = true; S.秧苗进度 += 1; S.体魄 -= 4; didPlantThisXun = true; log.push(['插秧完成，禾苗入田（体魄-4，生长+1）', 'good']); break;
        case 'hire_plant': S.铜钱 -= p.money; hiredPlant = true; log.push(['雇短工帮插秧，付 ' + p.money + ' 文（铜钱-80）', 'bad']); break;
        case 'tend':
          if (S.秧苗进度 >= GROW_TARGET) { log.push(['禾苗已长足，本旬看水无额外增长（宜把人手匀去别处）', 'good']); }
          else { var gg = (1 + (curWeather.grow >= 2 ? 1 : 0)); S.秧苗进度 += gg; S.体魄 -= 2; tendCount++; log.push(['看水除草，禾苗生长+' + gg + '（体魄-2）', 'good']); }
          break;
        case 'garden': S.菜圃进度 += 1; S.体魄 -= 1; if (S.菜圃进度 >= 3) { S.存米 += 1; S.菜圃进度 = 0; log.push(['菜圃收了一茬，存米+1石', 'good']); } else { log.push(['浇灌菜圃（' + S.菜圃进度 + '/3，体魄-1）', 'good']); } break;
        case 'care': S.家族 += 4; if (curEvents.some(function (e) { return e.t === 'rel'; })) { S.母出工 = true; log.push(['照护母亲，腰痛稳住，家族+4', 'good']); } else { log.push(['照护家人，家族+4', 'good']); } break;
        case 'exchange': S.家族 += 3; S.体魄 -= 2; log.push(['与邻里换工，家族+3、体魄-2（日后有人还工）', 'good']); break;
        case 'sell':
          var price = (S._米价 === '高') ? 550 : 350;
          S.存米 -= 1; S.铜钱 += price; log.push(['卖米1石，米价' + S._米价 + '，得 ' + price + ' 文', 'good']); break;
        case 'rest': S.体魄 += 6; log.push(['歇息养身，体魄+6', 'good']); break;
        case 'harvest': didHarvest = true; S.体魄 -= 6; break;
        case 'hire_harvest': S.铜钱 -= p.money; hiredHarvest = true; log.push(['雇短工助收，付 ' + p.money + ' 文（铜钱-100）', 'bad']); break;
        case 'pay_rent':
          if (S.存米 >= S.租额石) { S.存米 -= S.租额石; log.push(['向地主缴租 ' + S.租额石 + ' 石，佃约了讫（存米-' + S.租额石 + '）', 'bad']); }
          else { S.家族 -= 8; log.push(['存米不足缴租！欠租，家族-8（来年恐失佃权）', 'bad']); }
          break;
      }
    });

    if (didPlantThisXun && !hiredPlant && curWeather.risk === 'flood') { S.秧苗进度 = Math.max(0, S.秧苗进度 - 1); log.push(['暴雨冲了新插的秧，生长-1（若雇工可避）', 'bad']); }
    if (S.已插秧 && !didHarvest) {
      if (curWeather.risk === 'drought' && tendCount === 0) { S.秧苗进度 = Math.max(0, S.秧苗进度 - 1); log.push(['干旱又无人看水，禾苗打蔫，生长-1', 'bad']); }
      if (curWeather.k === '喜雨') { S.秧苗进度 += 1; log.push(['喜雨润田，禾苗额外生长+1', 'good']); }
    }
    if (didHarvest) { var y = computeYield(hiredHarvest); S.存米 += y.mi; log.push(['收割：得米 ' + y.mi + ' 石（' + y.reason + '）', y.mi >= S.租额石 ? 'good' : 'bad']); }

    clampAttr('体魄'); clampAttr('家族');
    if (S.秧苗进度 > GROW_TARGET) S.秧苗进度 = GROW_TARGET;
    recordEntry(picks.length ? ('本旬：' + picks.map(function (p) { return p.name; }).join('、')) : '本旬歇息', before, '');

    var rh = '<div class="resolve"><h4>旬末结算 · ' + curLabel() + ' · 天气' + curWeather.k + '</h4>';
    if (!log.length) rh += '<div class="line">这一旬无所作为，光阴空过。</div>';
    log.forEach(function (l) { rh += '<div class="line ' + l[1] + '">· ' + l[0] + '</div>'; });
    var after = snapshot();
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + ' ｜ 体魄 ' + before.体魄 + '→' + after.体魄 + '</div>';
    rh += '</div>';
    resolved = rh;
    renderStage(); renderLedger(); renderStatus();
  }

  function computeYield(hired) {
    var base = 0, reason = '', ratio = S.秧苗进度 / GROW_TARGET;
    if (ratio >= 1) { base = 7; reason = '禾苗长足'; }
    else if (ratio >= 0.7) { base = 5; reason = '生长尚可'; }
    else if (ratio >= 0.4) { base = 3; reason = '照料不足，收成偏薄'; }
    else { base = 1; reason = '几近荒废，颗粒无几'; }
    if (hired) { base += 1; reason += '，雇工抢收减损'; }
    var luck = Math.floor(Math.random() * 3) - 1; base += luck;
    if (luck > 0) reason += '，年景好'; else if (luck < 0) reason += '，年景欠佳';
    if (base < 0) base = 0;
    return { mi: base, reason: reason };
  }

  function nextXun() {
    resolved = null; picks = [];
    xunIndex += 1;
    if (xunIndex >= TOTAL_XUN) { endSeason(); return; }
    rollXun();
    renderStage(); renderStatus(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 农事一季结束 → 结算并步入人生阶段（不再是终局）
  function endSeason() {
    var before = snapshot();
    var comment;
    if (S.存米 >= 5) comment = '这一季经营得法，缴租之后仓中尚有余粮，可安稳过冬。';
    else if (S.存米 >= 2) comment = '勉强温饱，缴租后所剩无多。一分耕耘一分收成，看天亦看人。';
    else if (S.存米 >= 0) comment = '这一季过得紧巴，几乎无米过冬，怕是要向人借贷或打短工补贴。';
    else comment = '入不敷出，已然欠债。佃农一遇歉年便是如此艰难。';
    recordEntry('一季秋收了结', before, comment);
    enterPhase('marriage');
  }

  // ═══════════════ 人生阶段决策机 ═══════════════
  function enterPhase(p) {
    phase = p; picks = []; resolved = null;
    if (p === 'marriage') { S.年龄 = 20; curStage = stageMarriage(); }
    else if (p === 'household') { S.年龄 = 35; curStage = stageHousehold(); }
    else if (p === 'elder') { S.年龄 = 55; curStage = stageElder(); }
    else if (p === 'death') { S.年龄 = S._deathAge || 58; curStage = stageDeath(); }
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 阶段卡通用渲染：叙事 + 事件 + 选项（每项显式点数/概率）
  function renderLifeStage() {
    var st = curStage; if (!st) return;
    var h = '';
    h += '<div class="season-line phase">◆ 人生阶段 · ' + st.title + ' ｜ ' + S.年龄 + ' 岁</div>';
    h += '<div class="phase-note">' + st.note + '</div>';
    h += '<div class="narr">' + st.narrative + '</div>';
    if (st.events && st.events.length) {
      h += '<div class="events">';
      st.events.forEach(function (e) { h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>'; });
      h += '</div>';
    }
    if (st.outcome) {
      h += st.outcome;
      var isLast = (st.next === null);
      h += '<div class="commit"><button id="btn-pnext">' + (isLast ? '以次子身份 · 递归重开新一生 →' : (st.nextLabel || '继续 →')) + '</button></div>';
      $('stage').innerHTML = h;
      var pn = $('btn-pnext');
      if (pn) pn.addEventListener('click', function () { isLast ? startNextGeneration() : enterPhase(st.next); });
      return;
    }
    h += '<div class="ap-head"><h3>' + st.prompt + '</h3></div>';
    h += '<div class="choices">';
    st.choices.forEach(function (c, i) {
      var dis = c.can === false;
      h += '<button class="choice" data-i="' + i + '"' + (dis ? ' disabled' : '') + '>';
      h += '<span class="ch-name">' + c.name + (dis ? '（' + (c.why || '不可选') + '）' : '') + '</span>';
      if (c.cost) h += '<span class="ch-line ch-cost">花费：' + c.cost + '</span>';
      if (c.gain) h += '<span class="ch-line ch-gain">获得：' + c.gain + '</span>';
      if (c.prob) h += '<span class="ch-line ch-prob">概率：' + c.prob + '</span>';
      if (c.note) h += '<span class="ch-line ch-desc">' + c.note + '</span>';
      h += '</button>';
    });
    h += '</div>';
    $('stage').innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll('.choice:not(:disabled)'), function (btn) {
      btn.addEventListener('click', function () { resolveChoice(parseInt(btn.getAttribute('data-i'), 10)); });
    });
  }

  function resolveChoice(i) {
    var st = curStage, c = st.choices[i];
    if (!c || c.can === false) return;
    var before = snapshot();
    var log = [];
    c.run(log);          // 应用点数 + 概率 + 改状态
    clampAttr('体魄'); clampAttr('家族');
    recordEntry(st.title + '：' + c.name, before, '');
    var rh = '<div class="resolve"><h4>结算 · ' + st.title + '（' + S.年龄 + '岁）</h4>';
    log.forEach(function (l) { rh += '<div class="line ' + l[1] + '">· ' + l[0] + '</div>'; });
    var after = snapshot();
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：白银 ' + before.白银 + '→' + after.白银 + ' ｜ 铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + '</div>';
    rh += '</div>';
    st.outcome = rh;
    renderStatus(); renderLifeStage(); renderLedger();
  }

  // 生育 roll（婚后触发）：显式概率
  function bearChildren(log) {
    // 育有男丁分布（玩法占位；史料：出生5-6、存活到成年约50%）
    var sons = rollProb([{ p: 0.20, r: 0 }, { p: 0.35, r: 1 }, { p: 0.30, r: 2 }, { p: 0.15, r: 3 }]);
    var daus = rollProb([{ p: 0.30, r: 0 }, { p: 0.40, r: 1 }, { p: 0.30, r: 2 }]);
    S.子数 = sons; S.女数 = daus; S.存米 = Math.max(0, S.存米 - sons - daus); // 养育耗口粮
    log.push(['生育结算（概率）：育成 ' + sons + ' 男 ' + daus + ' 女，养育耗存米 ' + (sons + daus) + ' 石', sons > 0 ? 'good' : 'bad']);
    if (sons === 0) log.push(['暂无育成男丁——夭折是概率非惩罚，日后或需过继立嗣', 'bad']);
  }

  // ── 成家（20岁）──
  function stageMarriage() {
    return {
      title: '成家 · 议亲', label: '成家', next: 'household', nextLabel: '步入中年 · 当户 →',
      note: '聘礼是成家路上第一笔大额外流。〔玩法占位：明代平民聘礼/嫁妆货币规模缺权威史料，此处为设计区间，非史实点值〕',
      narrative: '立身数年，你已<span class="em">二十岁</span>。父母张罗着说一门亲事。走"六礼"框架（平民多简化合并），聘礼从哪来，决定这门亲事成不成。<span class="em">聘礼是真实外流，须记入女方家账（镜像记账）；嫁妆则随妻流入小家庭账。</span>',
      events: [{ t: 'rel', tag: '[关系]', txt: '媒人往来，女方索聘。凑得齐则风光正娶，凑不齐只能借贷、或延后婚事。' }],
      prompt: '如何操办这门亲事？（择一）',
      choices: [
        {
          name: '倾力筹办·正娶', cost: '白银4两 + 存米2石', gain: '妻室（嫁妆铜钱+800）、家族+10',
          prob: '成婚 90% ｜ 议亲告吹·婚事推迟 10%（告吹退回半数聘礼）',
          can: S.白银 >= 4 && S.存米 >= 2, why: '需白银≥4两且存米≥2石',
          run: function (log) {
            S.白银 -= 4; S.存米 -= 2;
            var r = rollProb([{ p: 0.90, r: 'wed' }, { p: 0.10, r: 'fail' }]);
            if (r === 'wed') { S.妻室 = true; S.家族 += 10; S.铜钱 += 800; log.push(['成婚！聘礼外流(白银-4、米-2)，妻带奁产铜钱+800，家族+10', 'good']); bearChildren(log); }
            else { S.白银 += 2; log.push(['议亲告吹，婚事推迟。退回半数聘礼(白银+2)，家族无进益', 'bad']); }
          }
        },
        {
          name: '向宗族义庄借助·成婚', cost: '白银1两，另借银3两（计入负债）', gain: '妻室（嫁妆铜钱+600）、家族+6',
          prob: '成婚 85% ｜ 婚事推迟 15%',
          can: S.白银 >= 1, why: '需白银≥1两',
          run: function (log) {
            S.白银 -= 1; S.负债银 += 3;
            var r = rollProb([{ p: 0.85, r: 'wed' }, { p: 0.15, r: 'fail' }]);
            if (r === 'wed') { S.妻室 = true; S.家族 += 6; S.铜钱 += 600; log.push(['借义庄银成婚！自付白银-1、负债+3两，妻带奁产铜钱+600，家族+6', 'good']); bearChildren(log); }
            else { log.push(['婚事仍告吹，白银-1已花、负债+3仍在，家族无进益', 'bad']); }
          }
        },
        {
          name: '暂缓婚事·先积累', cost: '不花钱', gain: '保留现钱',
          prob: '必然：不成家、家族-2（村中风言），日后成家更难',
          can: true,
          run: function (log) { S.家族 -= 2; log.push(['暂缓婚事，攒下现钱。家族-2，仍是单身汉（后续养老、传承将更艰难）', 'bad']); }
        }
      ]
    };
  }

  // ── 当户（35岁）：分家均分 + 里甲当役 ──
  function stageHousehold() {
    return {
      title: '当户 · 分家与应役', label: '当户', next: 'elder', nextLabel: '步入老年 →',
      note: '这是全生命周期最关键的守恒节点：诸子均分在父账与子账同步结算；里甲当役是概率性高风险事件。〔均分与破家为制度事实，具体银额为占位〕',
      narrative: '你已<span class="em">三十五岁</span>。父陈老栓年迈，家产按<span class="em">诸子"品搭均分"</span>分家，你正式立户、进入里甲黄册。立户便要<span class="em">轮值当役</span>——这是明代中期最典型的"当役破家"风险所在。',
      events: [
        { t: 'rel', tag: '[分家]', txt: '立阄书、品搭均分：好田差田搭配成价值相当数份，拈阄定份。你分得田产正式归户，养老田另立专账不入你可支配。' },
        { t: 'rand', tag: '[赋役]', txt: '今年恰轮到你这一甲"见年"当役。民收民解，遇官府需索、吏胥勒索，赔累破家者不在少数。' }
      ],
      prompt: '面对轮值当役，如何应对？（分家所得已自动结算，择一应役）',
      choices: [
        {
          name: '亲身应役', cost: '不花钱（担风险）', gain: '平安则家族+5',
          prob: '平安 60% ｜ 加派赔累(铜钱-1500) 30% ｜ 破家(失田2亩+负债2两) 10%',
          can: true,
          run: function (log) {
            doInherit(log);
            var r = rollProb([{ p: 0.60, r: 'safe' }, { p: 0.30, r: 'levy' }, { p: 0.10, r: 'ruin' }]);
            if (r === 'safe') { S.家族 += 5; S.应役 = '平安应役'; log.push(['应役平安了讫，乡里称许，家族+5', 'good']); }
            else if (r === 'levy') { S.铜钱 = Math.max(0, S.铜钱 - 1500); S.应役 = '赔累'; log.push(['遭加派赔累！解运垫赔，铜钱-1500', 'bad']); }
            else { S.田亩 = Math.max(1, S.田亩 - 2); S.负债银 += 2; S.应役 = '破家'; log.push(['当役破家！失田2亩、负债+2两——制度性风险落到个人账上（不是你的无能）', 'bad']); }
          }
        },
        {
          name: '纳银代役', cost: '白银2两', gain: '免除当役风险',
          prob: '必然：平安免役（花钱买平安）',
          can: S.白银 >= 2, why: '需白银≥2两',
          run: function (log) { doInherit(log); S.白银 -= 2; S.应役 = '纳银代役'; log.push(['纳银代役，白银-2，平安免除赔累风险', 'good']); }
        }
      ]
    };
  }
  // 分家均分结算（进入当户即自动发生一次）
  function doInherit(log) {
    if (S.分家) return;
    S.分家 = true;
    S.存米 += 2; S.家族 += 4; S.口食田 = 1;
    log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩(口食田，不入可支配)', 'good']);
  }

  // ── 养老（55岁）──
  function stageElder() {
    return {
      title: '养老', label: '养老', next: 'death', nextLabel: '走向人生终点 →',
      note: '功能容量随龄下降，劳作让位于休息医药。养老靠口食田收租＋诸子轮养协商——奉养是协商结果不是默认义务，逐人记账。〔机制事实，标准为占位〕',
      narrative: '你已<span class="em">五十五岁</span>，在明代平民已属高寿门槛。身子大不如前，' + (S.子数 > 0 ? '育有 ' + S.子数 + ' 子，可商议轮养。' : '膝下无育成之子，养老无所依。') + '如何安度晚年？',
      events: [{ t: 'rel', tag: '[养老]', txt: S.子数 > 0 ? '诸子就"谁出米、谁出工"协商轮养，须双方同意、镜像入各自账本。' : '无子可依，只能靠口食田薄租与自身积蓄，或变卖田产。' }],
      prompt: '如何安排养老？（择一）',
      choices: [
        {
          name: '依口食田与诸子轮养', cost: '不花钱', gain: S.子数 > 0 ? ('诸子供养存米+' + (2 * S.子数) + '石、家族+8') : '（无子·供养有限）存米+1',
          prob: '必然（供养多寡取决于子数）',
          can: true,
          run: function (log) {
            if (S.子数 > 0) { var mi = 2 * S.子数; S.存米 += mi; S.家族 += 8; S.体魄 -= 4; log.push(['诸子轮养：' + S.子数 + '子供养存米+' + mi + '，家族+8，体魄-4（自然衰老）', 'good']); }
            else { S.存米 += 1; S.体魄 -= 8; log.push(['无子轮养，仅靠口食田薄租存米+1，体魄-8，晚景清苦', 'bad']); }
          }
        },
        {
          name: '变卖部分田产养老', cost: '田产-1亩', gain: '白银+2、存米+2',
          prob: '必然（换现钱防身，田少则后代起点低）',
          can: S.田亩 >= 2, why: '需田产≥2亩',
          run: function (log) { S.田亩 -= 1; S.白银 += 2; S.存米 += 2; S.体魄 -= 4; log.push(['变卖田1亩换养老：田产-1、白银+2、存米+2、体魄-4（下一代可分田减少）', 'bad']); }
        }
      ]
    };
  }

  // ── 死亡与传承 ──
  function stageDeath() {
    // 寿命 roll：多数五十余，长尾少数活到60-70+
    var ageRoll = rollProb([{ p: 0.45, r: 56 }, { p: 0.35, r: 62 }, { p: 0.15, r: 68 }, { p: 0.05, r: 74 }]);
    S._deathAge = ageRoll; S.年龄 = ageRoll;
    // 丧葬支出（棺木为大项）：从遗产扣
    var funeral = 1; // 白银
    var funeralMi = 1;
    var estateSilver = Math.max(0, S.白银 - funeral) - S.负债银;
    var estateMi = Math.max(0, S.存米 - funeralMi);
    var estateTian = S.田亩;
    var sons = S.子数;
    var narrative, outcome;
    if (sons > 0) {
      var shareSilver = Math.floor(Math.max(0, estateSilver) / sons);
      var shareMi = Math.floor(estateMi / sons);
      var shareTian = Math.max(1, Math.floor(estateTian / sons));
      S._carry = { 白银: shareSilver, 存米: shareMi, 田亩: shareTian, 铜钱: 1200, 家族: Math.min(80, S.家族) };
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>。丧礼依家礼办讫（棺木等丧葬支出白银1两、米1石从遗产扣除）。遗产按<span class="em">诸子均分</span>传给下一代——你这一辈子的每一分积累与亏空，都成了子孙的期初。';
    } else {
      S._carry = { 白银: 0, 存米: 1, 田亩: 2, 铜钱: 800, 家族: 45 };
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>，然膝下无育成之子。依明代常俗，触发<span class="em">过继/立嗣</span>：族中侄辈过继承祧，仅得旁支薄产起家——这不是"游戏失败"，而是明代极高绝嗣率下的真实分支。';
    }
    return {
      title: '死亡与传承', label: '传承', next: null, nextLabel: '递归重开 →',
      note: '死亡不是失败结算，而是把资源账结清、生成下一代期初快照。绝嗣/破家是真实分支，不评分。',
      narrative: narrative,
      events: [
        { t: 'rand', tag: '[丧葬]', txt: '丧葬支出：棺木等白银1两、米1石，从遗产/诸子分摊账扣除（镜像入出资子账，不凭空消失）。' },
        { t: 'rel', tag: '[传承]', txt: sons > 0 ? ('遗产品搭均分给 ' + sons + ' 子：每子分得白银' + S._carry.白银 + '两、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩。下一代次子将以此为期初重开。') : '无嗣过继，下一代以旁支薄产（田2亩、存米1石）起家。' }
      ],
      prompt: '',
      // 直接给 outcome，无需选择
      choices: [],
      _autoOutcome: true
    };
  }

  // ── 下一代递归重开 ──
  function startNextGeneration() {
    generation += 1;
    var carry = S._carry || null;
    initState(carry);
    generation = generation; // keep
    rollXun(); renderStatus(); renderStage(); renderLedger();
    window.scrollTo({ top: 0 });
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
    h += '<div class="lg-sum" style="margin-bottom:.5rem">结余：' + sum + (S.负债银 > 0 ? ' ｜ <span style="color:var(--danger)">负债' + S.负债银 + '两</span>' : '') + '</div>';
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
  function restart() { generation = 1; carryOver = null; initState(null); rollXun(); renderStatus(); renderStage(); renderLedger(); window.scrollTo({ top: 0 }); }
  document.getElementById('btn-restart').addEventListener('click', restart);
  restart();

  // 死亡阶段无选项，进入即自动展示传承 outcome
  var _origEnter = enterPhase;
  enterPhase = function (p) {
    _origEnter(p);
    if (p === 'death' && curStage && curStage._autoOutcome) {
      var before = snapshot();
      // 应用丧葬扣除与守恒记账
      S.白银 = Math.max(0, S.白银 - 1); S.存米 = Math.max(0, S.存米 - 1);
      recordEntry('丧葬支出结算', before, '棺木等：白银-1、存米-1（从遗产扣，镜像入出资子账）');
      var rh = '<div class="resolve"><h4>身后结算 · 享年 ' + S.年龄 + ' 岁</h4>';
      rh += '<div class="line bad">· 丧葬支出：白银-1、存米-1</div>';
      if (S.子数 > 0) rh += '<div class="line good">· 遗产品搭均分给 ' + S.子数 + ' 子，各得白银' + (S._carry.白银) + '两、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩</div>';
      else rh += '<div class="line bad">· 绝嗣过继：下一代旁支薄产（田2亩、存米1石）起家</div>';
      rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">这一世了结。账本可继承、可回放、可重开——这正是徽州文书"归户"的玩法化。</div>';
      rh += '</div>';
      curStage.outcome = rh;
      renderLifeStage(); renderLedger(); renderStatus();
    }
  };
})();
