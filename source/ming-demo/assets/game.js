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

  // ── 幼年阶段：分段 + 每段行动点循环（与农事同构）──
  // 每一"段"代表一个成长年龄区间；每段内有若干"轮"日常活计，每轮分配行动点。
  // 段末自动跑一次"家计结算"（父母耕田进米−佃租−全家口粮），让存米逐龄真实涨落。
  var CHILD_AP = 3;      // 幼年每一轮的行动点（比成丁略少：孩子力气小）
  var CHILD_STAGES = [
    { key: 'baby',   name: '襁褓', age: 1,  rounds: 2, mouths: 5, note: '两三岁前最难养，一场时疫风寒都可能夭折。' },
    { key: 'tot',    name: '蒙童', age: 7,  rounds: 3, mouths: 6, note: '能跑能跳，可放牛拾柴帮补，也可开蒙识字。' },
    { key: 'kid',    name: '半大', age: 11, rounds: 3, mouths: 6, note: '顶半个劳力，可拜师学艺，也可随父下田。' },
    { key: 'teen',   name: '将成丁', age: 15, rounds: 3, mouths: 6, note: '明年入黄册成丁，最后一年为立身打底。' }
  ];
  var CHILD_STAGE_N = CHILD_STAGES.length;

  var WEATHERS = [
    { k: '晴', w: 34, grow: 1, note: '日头足，秧苗稳长' },
    { k: '多云', w: 26, grow: 1, note: '不温不火' },
    { k: '喜雨', w: 20, grow: 2, note: '及时雨，禾苗猛长' },
    { k: '暴雨', w: 12, grow: 0, risk: 'flood', note: '雨势过猛，恐涝' },
    { k: '干旱', w: 8, grow: 0, risk: 'drought', note: '连日无雨，田土发裂' }
  ];

  // ── 全局状态 ───────────────────────────────────
  var S, ledger, seq, xunIndex, picks, resolved, gameOver;
  var phase;                 // 'childhood' | 'farm' | 'marriage' | 'household' | 'elder' | 'death'
  var generation = 0;        // 第几代
  var carryOver = null;      // 上一代传下的期初结余
  var curStage = null;       // 当前人生阶段卡（非农事时）
  var childStage = 0;        // 幼年第几段（0..CHILD_STAGE_N-1）
  var childRound = 0;        // 本段第几轮
  var childPicks = [];       // 本轮已排的幼年活计
  var childResolved = null;  // 本轮结算文本
  var curChildEvents = [];   // 本轮随机事件

  function initState(carry) {
    S = {
      年龄: 1, 身份: '民籍·佃农子(孩提)',
      体魄: 60, 家族: 60,
      白银: 1, 铜钱: 1200, 存米: 3,
      秧苗进度: 0, 已插秧: false, 田亩: 4, 租额石: 3, 菜圃进度: 0, 母出工: true,
      // 幼年字段
      识字: false, 技艺: '无', 兄弟序: 1, 农事历练: 0, 家务历练: 0, 识字进度: 0, 技艺进度: 0,
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
    phase = 'childhood';
    childStage = 0; childRound = 0; childPicks = []; childResolved = null;
    S.年龄 = CHILD_STAGES[0].age;
    recordEntry('出生开账', null,
      generation > 1 ? ('第' + generation + '代降生：这一户现有田' + S.田亩 + '亩、存米' + S.存米 + '石、白银' + S.白银 + '两，你排行次子，全赖父母养育。')
        : '出生：降生于江南民籍佃农之家，排行次子。这户现有薄田4亩、存米3石、少量现钱。');
    rollChildRound();
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
    if (phase === 'childhood') { var cs = CHILD_STAGES[childStage]; return cs.name + '·' + cs.age + '岁'; }
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

  // ── 事件委托：在永不销毁的 #stage 容器上挂唯一监听器 ──
  // 修复根因：旧写法每次 re-render 都重查 DOM + 重新 addEventListener，
  // 导致（a）某些轮次按钮绑定时机错位 → 点不动；（b）重复绑定 → 单击触发两次
  // → 段末家计结算跑两遍 → 全家口粮被扣两次 → 存米被压成负数（再钳到 0/借贷）。
  // 委托只在 #stage 上挂一个监听器，任何 re-render 都不影响，单击必定只派发一次。
  var _delegated = false;
  function installDelegation() {
    if (_delegated) return;
    var stage = $('stage'); if (!stage) return;
    _delegated = true;
    stage.addEventListener('click', function (ev) {
      var t = ev.target;
      while (t && t !== stage) {
        if (t.nodeType === 1) {
          if (t.classList.contains('act') || t.classList.contains('choice') ||
            (t.id && t.id.indexOf('btn-') === 0)) break;
        }
        t = t.parentNode;
      }
      if (!t || t === stage) return;
      if (t.disabled) return;
      if (t.classList.contains('act')) {
        var id = t.getAttribute('data-id');
        if (phase === 'childhood') addChildPick(id);
        else if (phase === 'farm') addPick(id);
        else addLifePick(id);
        return;
      }
      if (t.classList.contains('choice')) {
        resolveChoice(parseInt(t.getAttribute('data-i'), 10));
        return;
      }
      switch (t.id) {
        case 'btn-commit': commitXun(); break;
        case 'btn-next': nextXun(); break;
        case 'btn-ccommit': commitChildRound(); break;
        case 'btn-cnext': nextChildRound(); break;
        case 'btn-lcommit': commitLifeRound(); break;
        case 'btn-pnext': handlePNext(); break;
      }
    });
  }
  // 统一处理"继续/下一程"按钮，不再依赖渲染闭包（旧代码此处调用了未定义的 advanceChildhood）
  function handlePNext() {
    if (phase === 'childhood') { nextChildRound(); return; }
    var st = curStage; if (!st) return;
    if (st.next === null) startNextGeneration(); else enterPhase(st.next);
  }

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
    } else if (phase === 'childhood') {
      h += '<span class="chip">识字 <b>' + (S.识字 ? '已启蒙' : '未识字') + '</b></span>';
      h += '<span class="chip">技艺 <b>' + S.技艺 + '</b></span>';
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
    if (phase === 'childhood') { renderChildhood(); return; }
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
    if (resolved) return; // 防重复结算
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

  // ═══════════════ 幼年阶段（分段行动点循环，与农事同构）═══════════════
  // 每段有若干"轮"日常活计，每轮分配行动点；段末自动跑一次"家计结算"（父母耕田−佃租−全家口粮），
  // 让存米随年岁真实涨落；早夭为跨童年的概率分支（Coale-Demeny），非惩罚分。

  function childSpent() { return childPicks.reduce(function (a, p) { return a + p.cost; }, 0); }
  function childRemainAP() { return CHILD_AP - childSpent(); }

  function rollChildRound() {
    curChildEvents = [];
    var st = CHILD_STAGES[childStage];
    if (st.key === 'baby') curChildEvents.push({ t: 'rel', tag: '[抚育]', txt: '襁褓最难养：母亲若停下农活精养你，活下来的机会大些，但家里就少一个下田的劳力。' });
    else if (st.key === 'tot') curChildEvents.push({ t: 'rand', tag: '[蒙学]', txt: '识字是佃农子跳出田亩的跳板；可对次子而言，多一双帮补的手也很实在。累计入塾 2 次即开蒙。' });
    else if (st.key === 'kid') curChildEvents.push({ t: 'rel', tag: '[立身]', txt: '一门手艺农闲能挣现钱、荒年不至饿死；累计随师 2 次即学成傍身。' });
    else curChildEvents.push({ t: 'rand', tag: '[立身]', txt: '明年成丁入黄册，即接手佃田一季。这一年攒下的身子、识字、手艺，都会化成下田的底子。' });
    if (childRound === st.rounds - 1) curChildEvents.push({ t: 'nong', tag: '[家计]', txt: '这一段的年月将尽，段末要结一次家计账：父母耕田进米，扣佃租、全家口粮，存米随之涨落。' });
  }

  // 幼年活计（eff = 显式点数标注）；cost 多为 1 点
  function childActions() {
    var st = CHILD_STAGES[childStage], A = [];
    if (st.key === 'baby') {
      A.push({ id: 'c_fine', name: '母亲停农·精养', cost: 2, eff: '体魄+8·家族+2·夭折率↓', desc: '母亲停下田里的活精心哺育（少一劳力）。', can: true, once: true });
      A.push({ id: 'c_nurse', name: '寻常哺乳', cost: 1, eff: '体魄+3', desc: '照旧粗养，母亲仍能下田帮工。', can: true, once: true });
      A.push({ id: 'c_herb', name: '求医问药', cost: 1, money: 60, eff: '铜钱-60·体魄+6·夭折率↓', desc: '请郎中抓药，度过时疫风寒。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文' });
      A.push({ id: 'c_sib', name: '兄姊帮看顾', cost: 1, eff: '家族+3·体魄+1', desc: '哥哥姐姐轮流照看，母亲得空。', can: true });
      A.push({ id: 'c_rest', name: '安睡将养', cost: 1, eff: '体魄+4', desc: '好生睡觉长身子。', can: true });
    } else if (st.key === 'tot') {
      A.push({ id: 'c_study', name: '入村塾·开蒙', cost: 2, money: 150, eff: '铜钱-150·识字进度+1(满2开蒙)', desc: '交束脩随蒙师认字。累计2次即识字。', can: S.铜钱 >= 150, why: S.铜钱 >= 150 ? '' : '铜钱不足150文' });
      A.push({ id: 'c_cow', name: '放牛·拾柴', cost: 1, eff: '铜钱+20·家务历练+1', desc: '给人放牛、拾柴换几个钱，帮补家用。', can: true });
      A.push({ id: 'c_pig', name: '打猪草·喂猪', cost: 1, eff: '家务历练+1·家族+1', desc: '割猪草喂猪，添个进项的指望。', can: true });
      A.push({ id: 'c_field', name: '田头·帮工', cost: 1, eff: '农事历练+1·体魄+2', desc: '跟着大人在田头递秧送水。', can: true });
      A.push({ id: 'c_care', name: '带弟妹', cost: 1, eff: '家族+3', desc: '照看更小的弟妹，母亲得空下田。', can: true });
      A.push({ id: 'c_rest', name: '玩耍将养', cost: 1, eff: '体魄+4', desc: '孩子也得歇，长身子。', can: true });
    } else if (st.key === 'kid') {
      A.push({ id: 'c_appr', name: '拜师·学手艺', cost: 2, money: 100, eff: '铜钱-100·技艺进度+1(满2学成)', desc: '贴师父饭食随师学篾木泥水。累计2次学成。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文' });
      A.push({ id: 'c_study2', name: '继续读书', cost: 2, money: 150, eff: '铜钱-150·识字进度+1', desc: '继续入塾进学（累计2次开蒙）。', can: S.铜钱 >= 150, why: S.铜钱 >= 150 ? '' : '铜钱不足150文' });
      A.push({ id: 'c_plow', name: '随父·下田', cost: 1, eff: '农事历练+1·体魄+3', desc: '正经跟父亲学庄稼把式。', can: true });
      A.push({ id: 'c_chore', name: '挑水·舂米', cost: 1, eff: '家务历练+1·体魄+2', desc: '担起家里的重活。', can: true });
      A.push({ id: 'c_hire', name: '打零工', cost: 1, eff: '铜钱+50·体魄-2', desc: '给殷实人家做零活挣现钱。', can: true });
      A.push({ id: 'c_rest', name: '歇息将养', cost: 1, eff: '体魄+4', desc: '别把半大身子累垮。', can: true });
    } else { // teen
      A.push({ id: 'c_strong', name: '强身·习劳', cost: 2, eff: '存米-1·体魄+10', desc: '卯足劲儿长成壮劳力（吃得多）。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '存米不足1石', once: true });
      A.push({ id: 'c_plow', name: '下田·历练', cost: 1, eff: '农事历练+1·体魄+3', desc: '成丁前把田里把式练扎实。', can: true });
      A.push({ id: 'c_craft', name: '精进·手艺', cost: 1, eff: (S.技艺进度 > 0 || S.技艺 !== '无') ? '技艺进度+1·铜钱+40' : '（尚无手艺根底）', desc: '接零活磨手艺、挣现钱。', can: S.技艺进度 > 0 || S.技艺 !== '无', why: (S.技艺进度 > 0 || S.技艺 !== '无') ? '' : '未曾学过手艺' });
      A.push({ id: 'c_study3', name: '温书·习字', cost: 1, eff: '识字进度+1', desc: '把认得的字记牢，日后记账当役不吃亏。', can: true });
      A.push({ id: 'c_hire', name: '打短工·攒钱', cost: 1, eff: '铜钱+80·体魄-2', desc: '给人打短工攒点防身钱。', can: true });
      A.push({ id: 'c_rest', name: '歇息将养', cost: 1, eff: '体魄+4', desc: '养回体魄。', can: true });
    }
    return A;
  }

  function isChildOnce(id) {
    var a = childActions().filter(function (x) { return x.id === id; })[0];
    return a && a.once;
  }

  function addChildPick(id) {
    var a = childActions().filter(function (x) { return x.id === id; })[0];
    if (!a || !a.can || a.cost > childRemainAP()) return;
    if (a.once && childPicks.some(function (p) { return p.id === id; })) return;
    childPicks.push({ id: a.id, name: a.name, cost: a.cost, money: a.money || 0 });
    renderChildhood();
  }

  // 成长档案条：识字/技艺/历练进度可视化
  function childDossier() {
    var rows = [
      { label: '识字开蒙', cur: S.识字 ? 2 : S.识字进度, max: 2, done: S.识字, doneTxt: '已识字', cls: 'g-ok' },
      { label: '手艺傍身', cur: S.技艺 !== '无' ? 2 : S.技艺进度, max: 2, done: S.技艺 !== '无', doneTxt: '已学成', cls: 'g-good' },
      { label: '农事历练', cur: Math.min(6, S.农事历练), max: 6, done: false, cls: 'g-thin' },
      { label: '家务历练', cur: Math.min(6, S.家务历练), max: 6, done: false, cls: 'g-thin' }
    ];
    var h = '<div class="crop-bar g-ok"><div class="cb-head"><span class="cb-title">🧒 成长档案 · 这些年攒下的底子</span>' +
      '<span class="cb-val">体魄 ' + S.体魄 + '</span></div>';
    rows.forEach(function (r) {
      var pct = Math.round(r.cur / r.max * 100);
      h += '<div style="margin:.25rem 0"><div class="cb-head" style="font-size:.85em"><span>' + r.label + '</span>' +
        '<span class="cb-val">' + (r.done ? r.doneTxt : (r.cur + '/' + r.max)) + '</span></div>' +
        '<div class="cb-track"><i style="width:' + pct + '%"></i></div></div>';
    });
    h += '</div>';
    return h;
  }

  function renderChildhood() {
    if (gameOver) return;
    var st = CHILD_STAGES[childStage];
    var isLast = (childRound === st.rounds - 1);
    var h = '';
    h += '<div class="season-line phase">◆ 幼年 · ' + st.name + '（' + st.age + '岁）｜ 第 ' + (childRound + 1) + ' / ' + st.rounds + ' 轮</div>';
    h += '<div class="phase-note">' + st.note + '</div>';
    h += childDossier();

    var narr;
    if (childStage === 0 && childRound === 0) narr = '你降生在江南一户民籍佃农家，<span class="em">排行次子</span>。这户有薄田 ' + S.田亩 + ' 亩、存米 ' + S.存米 + ' 石。往后十几年，你一天天长大，家里也一年年在耕、在缴租、在吃饭——你的每一样活计，都掺进这本家计账里。';
    else if (isLast) narr = '这一段的日子将到头。手里还有几分气力，是再学一学、练一练，还是帮衬家里？段末就要结这几年的家计账了。';
    else narr = '日子一天天地过。你掂量着这点力气：是去认几个字、学门手艺，还是下田、帮补家用、带弟妹？';
    h += '<div class="narr">' + narr + '</div>';

    h += '<div class="events">';
    curChildEvents.forEach(function (e) { h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>'; });
    h += '</div>';

    if (childResolved) {
      h += childResolved;
      var btnLabel;
      if (S._childDied) btnLabel = '这一世早夭 · 由弟妹接续（递归重开）→';
      else if (childStage >= CHILD_STAGE_N - 1 && isLast) btnLabel = '十六成丁 · 下田立身 →';
      else if (isLast) btnLabel = '长大几岁 · 步入 ' + CHILD_STAGES[childStage + 1].name + ' →';
      else btnLabel = '过些日子 · 下一轮 →';
      h += '<div class="commit"><button id="btn-cnext">' + btnLabel + '</button></div>';
      $('stage').innerHTML = h;
      return;
    }

    h += '<div class="ap-head"><h3>' + (isLast ? '这一轮（段末）· 分配行动点' : '这一轮 · 分配行动点') + '</h3>' +
      '<span class="ap-dots">剩余 <b>' + childRemainAP() + '</b> / ' + CHILD_AP + ' 点</span></div>';
    h += '<div class="actions">';
    childActions().forEach(function (a) {
      var picked = childPicks.filter(function (p) { return p.id === a.id; }).length;
      var disabled = !a.can || a.cost > childRemainAP() || (picked > 0 && a.once);
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
    h += '<button id="btn-ccommit"' + (childPicks.length ? '' : ' disabled') + '>' + (isLast ? '结算这一轮并结家计账 →' : '结算这一轮 →') + '</button>';
    h += '<span class="hint">' + (childPicks.length ? ('已排：' + childPicks.map(function (p) { return p.name; }).join('、')) : '点上面的活计来安排这一轮。行动点用不完也可提前结算。') + '</span>';
    h += '</div>';

    $('stage').innerHTML = h;
  }

  function commitChildRound() {
    if (childResolved) return; // 防重复结算：已结算过就不再跑一遍（避免家计账/口粮被扣两次）
    var before = snapshot();
    var log = [];
    var wellCared = false;
    childPicks.forEach(function (p) {
      switch (p.id) {
        case 'c_fine': S.体魄 += 8; S.家族 += 2; wellCared = true; S.母出工 = false; log.push(['母亲停农精养，体魄+8、家族+2（少一劳力，夭折率↓）', 'good']); break;
        case 'c_nurse': S.体魄 += 3; log.push(['寻常哺乳，体魄+3', 'good']); break;
        case 'c_herb': S.铜钱 -= p.money; S.体魄 += 6; wellCared = true; log.push(['求医问药，铜钱-60、体魄+6（夭折率↓）', 'good']); break;
        case 'c_sib': S.家族 += 3; S.体魄 += 1; log.push(['兄姊帮看顾，家族+3、体魄+1', 'good']); break;
        case 'c_care': S.家族 += 3; log.push(['带弟妹，家族+3', 'good']); break;
        case 'c_cow': S.铜钱 += 20; S.家务历练 += 1; log.push(['放牛拾柴，铜钱+20、家务历练+1', 'good']); break;
        case 'c_pig': S.家务历练 += 1; S.家族 += 1; log.push(['打猪草喂猪，家务历练+1、家族+1', 'good']); break;
        case 'c_field': S.农事历练 += 1; S.体魄 += 2; log.push(['田头帮工，农事历练+1、体魄+2', 'good']); break;
        case 'c_plow': S.农事历练 += 1; S.体魄 += 3; log.push(['随父下田，农事历练+1、体魄+3', 'good']); break;
        case 'c_chore': S.家务历练 += 1; S.体魄 += 2; log.push(['挑水舂米，家务历练+1、体魄+2', 'good']); break;
        case 'c_hire': S.铜钱 += 50; S.体魄 -= 2; log.push(['打零工，铜钱+50、体魄-2', 'good']); break;
        case 'c_study': case 'c_study2':
          S.铜钱 -= p.money; S.识字进度 += 1;
          if (!S.识字 && S.识字进度 >= 2) { S.识字 = true; log.push(['入塾进学，识字进度满 2 —— 开蒙识字！铜钱-' + p.money, 'good']); }
          else log.push(['入塾进学，识字进度+1（' + Math.min(2, S.识字进度) + '/2），铜钱-' + p.money, 'good']); break;
        case 'c_study3': S.识字进度 += 1; if (!S.识字 && S.识字进度 >= 2) { S.识字 = true; log.push(['温书习字，识字进度满 2 —— 开蒙识字！', 'good']); } else log.push(['温书习字，识字进度+1（' + Math.min(2, S.识字进度) + '/2）', 'good']); break;
        case 'c_appr':
          S.铜钱 -= p.money; S.技艺进度 += 1;
          if (S.技艺 === '无' && S.技艺进度 >= 2) { S.技艺 = '手艺'; log.push(['随师满 2 次 —— 学成一门手艺（篾木泥水）傍身！铜钱-100', 'good']); }
          else log.push(['拜师学艺，技艺进度+1（' + Math.min(2, S.技艺进度) + '/2），铜钱-100', 'good']); break;
        case 'c_craft': S.技艺进度 += 1; S.铜钱 += 40; if (S.技艺 === '无' && S.技艺进度 >= 2) { S.技艺 = '手艺'; log.push(['精进手艺满 2 —— 学成手艺傍身！铜钱+40', 'good']); } else log.push(['精进手艺，技艺进度+1、铜钱+40', 'good']); break;
        case 'c_strong': S.存米 -= 1; S.体魄 += 10; log.push(['强身习劳，体魄+10（存米-1）', 'good']); break;
        case 'c_rest': S.体魄 += 4; log.push(['歇息将养，体魄+4', 'good']); break;
      }
    });
    clampAttr('体魄'); clampAttr('家族');

    var st = CHILD_STAGES[childStage];
    var isLast = (childRound === st.rounds - 1);
    if (isLast) {
      settleHousehold(log, wellCared);          // 段末家计结算（存米涨落）
      if (!S._childDied) rollChildMortality(log, wellCared); // 段末早夭概率分支
    }

    if (S.存米 < 0) S.存米 = 0;
    recordEntry(childPicks.length ? (st.name + '：' + childPicks.map(function (p) { return p.name; }).join('、')) : (st.name + '·无所事事'), before, isLast ? ('第' + (childStage + 1) + '段家计已结') : '');

    var rh = '<div class="resolve"><h4>结算 · ' + st.name + '（' + st.age + '岁）· 第 ' + (childRound + 1) + '/' + st.rounds + ' 轮</h4>';
    if (!log.length) rh += '<div class="line">这一轮无所作为，光阴空过。</div>';
    log.forEach(function (l) { rh += '<div class="line ' + l[1] + '">· ' + l[0] + '</div>'; });
    var after = snapshot();
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + ' ｜ 体魄 ' + before.体魄 + '→' + after.体魄 + '</div>';
    rh += '</div>';
    childResolved = rh;
    renderChildhood(); renderLedger(); renderStatus();
  }

  // 段末家计结算：父母耕田毛产 − 佃租 − 全家口粮（占位：亩产~2石/年、每口~1石/年）
  function settleHousehold(log, wellCared) {
    var st = CHILD_STAGES[childStage];
    var nextAge = (childStage < CHILD_STAGE_N - 1) ? CHILD_STAGES[childStage + 1].age : 16;
    var years = Math.max(1, nextAge - st.age);
    var gross = S.田亩 * 2 * years;                    // 父母耕作毛产
    var wr = rollProb([{ p: 0.30, r: '丰' }, { p: 0.45, r: '平' }, { p: 0.25, r: '歉' }]);
    var wd = wr === '丰' ? Math.round(gross * 0.2) : wr === '歉' ? -Math.round(gross * 0.2) : 0;
    gross += wd;
    var rent = S.租额石 * years;
    // 母亲精养/求医这一段少了一个劳力，口粮照吃：多耗一点
    var food = st.mouths * years + (wellCared ? years : 0);
    var net = gross - rent - food;
    S.存米 += net;
    log.push(['〔家计·经历' + years + '年〕父母耕' + S.田亩 + '亩毛产' + gross + '石（' + wr + '年）− 佃租' + rent + '石 − 全家口粮' + food + '石 = 存米' + (net >= 0 ? '+' + net : net) + '石',
      net >= 0 ? 'good' : 'bad']);
    if (S.存米 < 0) {
      var借 = -S.存米; S.存米 = 0; S.负债银 += Math.ceil(借 / 3); S.家族 -= 4;
      log.push(['存米见底，青黄不接只得借贷度荒：负债+' + Math.ceil(借 / 3) + '两、家族-4', 'bad']);
    }
  }

  // 段末早夭概率分支（Coale-Demeny：越小越危险；体魄/精养可降低）
  function rollChildMortality(log, wellCared) {
    var st = CHILD_STAGES[childStage];
    var base = { baby: 0.16, tot: 0.06, kid: 0.03, teen: 0.01 }[st.key] || 0.02;
    if (wellCared) base *= 0.5;
    if (S.体魄 >= 70) base *= 0.7;
    var pct = Math.round(base * 100);
    if (rollProb([{ p: base, r: 'die' }, { p: 1 - base, r: 'live' }]) === 'die') { childDeath(log); }
    else { log.push(['〔天命·' + st.name + '〕闯过这一段的疫病风寒（本段夭折概率约 ' + pct + '%），平安长大。', 'good']); }
  }

  // 早夭：真实概率分支，非惩罚；本户资源原样传给接续的弟妹（递归重开）
  function childDeath(log) {
    var st = CHILD_STAGES[childStage];
    S._childDied = true;
    S._carry = { 白银: S.白银, 存米: Math.max(0, S.存米), 铜钱: S.铜钱, 田亩: S.田亩, 家族: Math.max(20, S.家族 - 4) };
    log.push(['幼殇于' + st.name + '（' + st.age + '岁）——依 Coale-Demeny 模型(出生预期寿命≈30岁)，约半数孩子活不到二十岁。这不是你的过错，是那个时代的真实概率。本户田产由弟妹接续。', 'bad']);
  }

  function nextChildRound() {
    if (S._childDied) { startNextGeneration(); return; }
    childResolved = null; childPicks = [];
    var st = CHILD_STAGES[childStage];
    if (childRound < st.rounds - 1) {
      childRound += 1; rollChildRound();
      renderChildhood(); renderStatus(); renderLedger();
    } else if (childStage < CHILD_STAGE_N - 1) {
      childStage += 1; childRound = 0; S.年龄 = CHILD_STAGES[childStage].age; rollChildRound();
      renderChildhood(); renderStatus(); renderLedger();
    } else {
      enterFarm();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 幼年结束 → 十六成丁，步入佃田一季（沿用旬循环）
  function enterFarm() {
    phase = 'farm'; S.年龄 = 16; S.身份 = '民籍·佃农子'; picks = []; resolved = null; curStage = null;
    var 底子 = [];
    if (S.识字) 底子.push('略识文字（记账当役不吃亏）');
    if (S.技艺 !== '无') 底子.push('有手艺傍身（可退可进的后路）');
    if (S.农事历练 >= 3) 底子.push('农活扎实（下田更耐劳）');
    if (S.家务历练 >= 3) 底子.push('家务麻利');
    recordEntry('十六成丁·立身开账', snapshot(), '幼年既过，成丁下田。' + (底子.length ? '这些年攒下：' + 底子.join('、') + '。' : '这些年不曾攒下特别的底子，只识些寻常农事。'));
    rollXun(); renderStatus(); renderStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════ 人生阶段决策机 ═══════════════
  // 人生阶段行动点循环所用的临时状态（成家/当户/养老已升级为多维循环）
  var lifePicks = [];
  function lifeAP() { return (curStage && curStage.ap) || 4; }
  function lifeSpent() { return lifePicks.reduce(function (a, p) { return a + p.cost; }, 0); }
  function lifeRemainAP() { return lifeAP() - lifeSpent(); }
  function lifeActions() { return (curStage && curStage.actions) ? curStage.actions() : []; }
  function addLifePick(id) {
    var a = lifeActions().filter(function (x) { return x.id === id; })[0];
    if (!a || a.can === false || a.cost > lifeRemainAP()) return;
    if (a.once && lifePicks.some(function (p) { return p.id === id; })) return;
    lifePicks.push({ id: a.id, name: a.name, cost: a.cost });
    renderLifeStage();
  }
  function commitLifeRound() {
    var st = curStage; if (!st || st.outcome) return; // 防重复结算
    var before = snapshot();
    var log = [];
    lifePicks.forEach(function (p) {
      var a = lifeActions().filter(function (x) { return x.id === p.id; })[0];
      if (a && a.run) a.run(log);
    });
    if (st.settle) st.settle(log);       // 该阶段的收尾结算（概率分支等）
    clampAttr('体魄'); clampAttr('家族');
    recordEntry(st.title + '：' + (lifePicks.length ? lifePicks.map(function (p) { return p.name; }).join('、') : '未作安排'), before, '');
    var rh = '<div class="resolve"><h4>结算 · ' + st.title + '（' + S.年龄 + '岁）</h4>';
    if (!log.length) rh += '<div class="line">这一程未作特别安排。</div>';
    log.forEach(function (l) { rh += '<div class="line ' + l[1] + '">· ' + l[0] + '</div>'; });
    var after = snapshot();
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：白银 ' + before.白银 + '→' + after.白银 + ' ｜ 铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + '</div>';
    rh += '</div>';
    st.outcome = rh;
    renderStatus(); renderLifeStage(); renderLedger();
  }

  function enterPhase(p) {
    phase = p; picks = []; resolved = null; lifePicks = [];
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
    var kind = (phase === 'childhood') ? '幼年阶段' : '人生阶段';
    h += '<div class="season-line phase">◆ ' + kind + ' · ' + st.title + ' ｜ ' + S.年龄 + ' 岁</div>';
    h += '<div class="phase-note">' + st.note + '</div>';
    h += '<div class="narr">' + st.narrative + '</div>';
    if (st.events && st.events.length) {
      h += '<div class="events">';
      st.events.forEach(function (e) { h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>'; });
      h += '</div>';
    }
    if (st.outcome) {
      h += st.outcome;
      var isChild = (phase === 'childhood');
      var isLast = (st.next === null);
      var label;
      if (isChild) label = S._childDied ? '这一世早夭 · 由弟妹接续（递归重开）→' : (st.nextLabel || '长大一岁 →');
      else label = isLast ? '以次子身份 · 递归重开新一生 →' : (st.nextLabel || '继续 →');
      h += '<div class="commit"><button id="btn-pnext">' + label + '</button></div>';
      $('stage').innerHTML = h;
      return;
    }
    // ── 多维行动点循环（成家/当户/养老已升级为此模式）──
    if (st.actions) {
      if (st.dossier) h += st.dossier();
      h += '<div class="ap-head"><h3>' + st.prompt + '</h3>' +
        '<span class="ap-dots">剩余 <b>' + lifeRemainAP() + '</b> / ' + lifeAP() + ' 点</span></div>';
      h += '<div class="actions">';
      lifeActions().forEach(function (a) {
        var picked = lifePicks.filter(function (p) { return p.id === a.id; }).length;
        var disabled = a.can === false || a.cost > lifeRemainAP() || (picked > 0 && a.once);
        h += '<button class="act" data-id="' + a.id + '"' + (disabled ? ' disabled' : '') + '>' +
          '<span class="a-top"><span class="a-name">' + a.name + '</span>' +
          '<span class="a-cost">' + a.cost + '点</span></span>' +
          '<span class="a-eff">▸ ' + a.eff + '</span>' +
          (a.prob ? '<span class="a-eff" style="color:var(--info)">概率 ' + a.prob + '</span>' : '') +
          '<span class="a-desc">' + a.desc + (a.can === false ? '（' + (a.why || '不可选') + '）' : '') + '</span>' +
          (picked ? '<span class="a-picked">已选 ×' + picked + '</span>' : '') +
          '</button>';
      });
      h += '</div>';
      h += '<div class="commit">';
      h += '<button id="btn-lcommit">' + (st.commitLabel || '定夺这一程 →') + '</button>';
      h += '<span class="hint">' + (lifePicks.length ? ('已排：' + lifePicks.map(function (p) { return p.name; }).join('、')) : '点上面的安排来定夺这一程；行动点用不完也可提前结算。') + '</span>';
      h += '</div>';
      $('stage').innerHTML = h;
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
  }

  function resolveChoice(i) {
    var st = curStage, c = st.choices[i];
    if (!c || c.can === false) return;
    if (st.outcome) return; // 防重复结算
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

  // 人生阶段"共享状态账"面板：把幼年至今攒下的底子显性摆出来，让玩家看清路径依赖
  function lifeDossier(extra) {
    var tags = [];
    tags.push(S.识字 ? '识字·已启蒙' : '识字·无');
    tags.push(S.技艺 !== '无' ? '手艺·傍身' : '手艺·无');
    tags.push('农事历练 ' + S.农事历练);
    tags.push('家族声望 ' + S.家族);
    if (S.负债银 > 0) tags.push('负债 ' + S.负债银 + '两');
    var h = '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">📇 共享状态账 · 这本账一路带到底</span>' +
      '<span class="cb-val">体魄 ' + S.体魄 + '</span></div>' +
      '<div class="cb-tip">' + tags.join(' ｜ ') + (extra ? ('<br>' + extra) : '') + '</div></div>';
    return h;
  }

  // ── 成家（20岁）：多维行动点循环 —— 攒聘礼/托媒/凭识字手艺增议亲筹码 ──
  function stageMarriage() {
    return {
      title: '成家 · 议亲', label: '成家', next: 'household', nextLabel: '步入中年 · 当户 →',
      ap: 4, commitLabel: '下聘·定亲事 →',
      note: '成家不是一次"选套餐"，而是几年里一步步攒钱、托媒、抬身价：聘礼是真实外流（镜像入女方家账），识字/手艺会抬高你在媒人眼里的行情。〔货币规模为玩法占位，非史实点值〕',
      narrative: '立身数年，你已<span class="em">二十岁</span>。父母张罗说亲。走"六礼"框架（平民多简化合并）——这一程你有 <span class="em">4 个行动点</span>，用来筹聘礼、托媒人、办酒席。你这些年攒下的<span class="em">识字、手艺、家族声望</span>，都会折进议亲的成算里。',
      dossier: function () { return lifeDossier('议亲成算 = 基础 + 聘礼档 + 识字/手艺加成 + 家族声望；下聘时按当前筹码一次性 roll。'); },
      events: [{ t: 'rel', tag: '[关系]', txt: '女方是邻村自耕农之女，有自己的意愿：她与父母看重的是这户的家底与后生的本分，不是你单方面"提亲"就能定。' }],
      prompt: '这几年怎么张罗亲事？（分配 4 点，末了一次下聘）',
      actions: function () {
        var A = [];
        A.push({ id: 'm_save', name: '卖粮·攒聘礼', cost: 1, eff: '存米-1·白银+1（备聘）', desc: '把余粮换成硬通货备作聘礼。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '无存米可卖' });
        A.push({ id: 'm_gift', name: '厚备聘礼', cost: 2, eff: '白银-3·聘礼档↑↑·成算+', desc: '以银三两下重聘，风光正娶，行情最高。', can: S.白银 >= 3, why: S.白银 >= 3 ? '' : '白银不足3两', once: true });
        A.push({ id: 'm_gift1', name: '薄备聘礼', cost: 1, eff: '白银-1·聘礼档↑·成算+', desc: '尽力凑一份体面的薄聘。', can: S.白银 >= 1, why: S.白银 >= 1 ? '' : '白银不足1两', once: true });
        A.push({ id: 'm_borrow', name: '向义庄借银', cost: 1, eff: '负债+3两·白银+3（供下聘）', desc: '宗族义庄借贷办婚，先成家后还债。', can: true, once: true });
        A.push({ id: 'm_match', name: '托媒·多方相看', cost: 1, eff: '家族+2·成算+（媒妁之言）', desc: '多走几家媒人，抬一抬相看的成算。', can: true });
        A.push({ id: 'm_show', name: '显本事·亮身价', cost: 1, eff: (S.识字 || S.技艺 !== '无') ? '成算+（识字/手艺抬行情）' : '（无识字手艺可亮）', desc: '让女方家看到你识字或有手艺——佃农子跳板。', can: S.识字 || S.技艺 !== '无', why: (S.识字 || S.技艺 !== '无') ? '' : '尚无识字或手艺' });
        A.push({ id: 'm_wait', name: '暂缓·先积累', cost: 1, eff: '体魄+4（不催婚）', desc: '这一程先不急，养身攒钱。', can: true });
        return A;
      },
      settle: function (log) {
        // 议亲成算：基础 + 聘礼档 + 加成；下聘时一次性 roll（女方独立回应）
        var giftTier = 0, chance = 0.35;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'm_save': S.存米 -= 1; S.白银 += 1; log.push(['卖粮备聘：存米-1、白银+1', 'good']); break;
            case 'm_gift': S.白银 -= 3; giftTier = 2; chance += 0.40; log.push(['厚备聘礼：银-3下重聘（成算大增）', 'bad']); break;
            case 'm_gift1': S.白银 -= 1; giftTier = Math.max(giftTier, 1); chance += 0.20; log.push(['薄备聘礼：银-1（成算增）', 'bad']); break;
            case 'm_borrow': S.负债银 += 3; S.白银 += 3; log.push(['义庄借银3两供下聘（负债+3、白银+3）', 'bad']); break;
            case 'm_match': S.家族 += 2; chance += 0.12; log.push(['托媒多方相看：家族+2（成算增）', 'good']); break;
            case 'm_show': chance += (S.识字 ? 0.12 : 0) + (S.技艺 !== '无' ? 0.12 : 0); log.push(['亮出' + (S.识字 ? '识字' : '') + (S.识字 && S.技艺 !== '无' ? '、' : '') + (S.技艺 !== '无' ? '手艺' : '') + '身价（成算增）', 'good']); break;
            case 'm_wait': S.体魄 += 4; log.push(['暂缓催婚，养身：体魄+4', 'good']); break;
          }
        });
        chance += Math.min(0.10, S.家族 >= 70 ? 0.10 : 0); // 家族声望高更好说亲
        chance = Math.max(0.05, Math.min(0.95, chance));
        var pct = Math.round(chance * 100);
        if (giftTier === 0) {
          S.家族 -= 2;
          log.push(['这一程没备下聘礼，媒人无从说合——婚事推迟，家族-2（单身汉在村中难免风言）。日后可再攒。', 'bad']);
          return;
        }
        var r = rollProb([{ p: chance, r: 'wed' }, { p: 1 - chance, r: 'fail' }]);
        if (r === 'wed') {
          S.妻室 = true;
          var dowry = giftTier === 2 ? 800 : 500;
          S.铜钱 += dowry; S.家族 += giftTier === 2 ? 10 : 6;
          log.push(['〔女方应允〕成婚成算约 ' + pct + '%，命中！妻带奁产铜钱+' + dowry + '、家族+' + (giftTier === 2 ? 10 : 6), 'good']);
          bearChildren(log);
        } else {
          if (giftTier === 2) { S.白银 += 1; log.push(['〔女方另议〕成算约 ' + pct + '%，未成。退回部分重聘白银+1，婚事推迟（聘礼档在，来生仍可再议）', 'bad']); }
          else log.push(['〔女方另议〕成算约 ' + pct + '%，未成。薄聘已花，婚事推迟', 'bad']);
        }
      }
    };
  }

  // ── 当户（35岁）：多维行动点循环 —— 分家立户后，一整轮应役经营 ──
  function stageHousehold() {
    return {
      title: '当户 · 分家与应役', label: '当户', next: 'elder', nextLabel: '步入老年 →',
      ap: 4, commitLabel: '了此一役 · 定当户之局 →',
      note: '这是全生命周期最关键的守恒节点：诸子均分在父账/子账同步结算；里甲当役是概率性高风险事件。你能否躲过"当役破家"，取决于识字（应付吏胥）、家族声望（乡里担保）、现银（纳银代役）这本一路带来的账。〔均分与破家为制度事实，具体银额为占位〕',
      narrative: '你已<span class="em">三十五岁</span>。父陈老栓年迈，家产按<span class="em">诸子"品搭均分"</span>分家，你正式立户、进入里甲黄册。立户便要<span class="em">轮值当役</span>——明代中期最典型的"当役破家"风险所在。这一程 <span class="em">4 个行动点</span>，用来把风险压到最低。',
      dossier: function () { return lifeDossier('应役赔累风险 = 基础风险 − 纳银 − 识字应吏 − 家族担保；末了按当前风险 roll 平安/赔累/破家。'); },
      events: [
        { t: 'rel', tag: '[分家]', txt: '立阄书、品搭均分：好田差田搭配成价值相当数份，拈阄定份。你分得田产正式归户，养老田另立专账不入你可支配。' },
        { t: 'rand', tag: '[赋役]', txt: '今年恰轮到你这一甲"见年"当役。民收民解，遇官府需索、吏胥勒索，赔累破家者不在少数——你并非当役对象的选择者，制度把风险摊到了你头上。' }
      ],
      prompt: '这一任当户怎么当？（分配 4 点压低赔累风险）',
      actions: function () {
        var A = [];
        A.push({ id: 'h_pay', name: '纳银代役', cost: 2, eff: '白银-2·赔累风险大降', desc: '花钱买平安，正差雇人代解。', can: S.白银 >= 2, why: S.白银 >= 2 ? '' : '白银不足2两', once: true });
        A.push({ id: 'h_literate', name: '识字·亲核账册', cost: 1, eff: S.识字 ? '风险降·防吏胥虚加' : '（不识字·无从核账）', desc: '亲自核对黄册税则，吏胥难以虚报勒索。', can: S.识字, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: '托家族·乡里担保', cost: 1, eff: '家族≥60则风险降·家族+3', desc: '倚仗宗族与乡邻，摊派时有人分担、说话。', can: true, once: true });
        A.push({ id: 'h_hire', name: '雇工·顾住农事', cost: 1, eff: '铜钱-300·当役误工不减产', desc: '当役耗时，雇短工顶上，田里不至于荒。', can: S.铜钱 >= 300, why: S.铜钱 >= 300 ? '' : '铜钱不足300文' });
        A.push({ id: 'h_side', name: '农闲营生', cost: 1, eff: S.技艺 !== '无' ? '手艺副业·铜钱+400' : '（无手艺·仅+120）', desc: '当户之年也要养家，凭手艺或杂工挣现钱。', can: true });
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年劳碌，别把身子熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var risk = 0.40; var paid = false, guarded = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_pay': S.白银 -= 2; S.应役 = '纳银代役'; risk -= 0.35; paid = true; log.push(['纳银代役：白银-2，赔累风险大降', 'good']); break;
            case 'h_literate': risk -= 0.15; log.push(['识字亲核账册：吏胥难虚加，赔累风险降', 'good']); break;
            case 'h_clan': S.家族 += 3; guarded = true; if (S.家族 >= 60) risk -= 0.12; log.push(['托家族乡里担保：家族+3' + (S.家族 >= 60 ? '，摊派有人分担（风险降）' : '（家族声望尚浅，担保有限）'), 'good']); break;
            case 'h_hire': S.铜钱 = Math.max(0, S.铜钱 - 300); log.push(['雇工顾农事：铜钱-300，当役误工不减产', 'bad']); break;
            case 'h_side': var g = S.技艺 !== '无' ? 400 : 120; S.铜钱 += g; log.push(['农闲营生：' + (S.技艺 !== '无' ? '凭手艺' : '打杂工') + '铜钱+' + g, 'good']); break;
            case 'h_rest': S.体魄 += 5; log.push(['将养身子：体魄+5', 'good']); break;
          }
        });
        risk = Math.max(0.03, Math.min(0.85, risk));
        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') { S.家族 += 5; if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役'; log.push(['〔当役了讫〕赔累风险约 ' + pct + '%，平安过关！乡里称许，家族+5', 'good']); }
        else if (r === 'levy') { S.铜钱 = Math.max(0, S.铜钱 - 1500); S.应役 = '赔累'; log.push(['〔遭加派〕赔累风险约 ' + pct + '%命中：解运垫赔，铜钱-1500', 'bad']); }
        else { S.田亩 = Math.max(1, S.田亩 - 2); S.负债银 += 2; S.应役 = '破家'; log.push(['〔当役破家〕失田2亩、负债+2两——制度性风险落到个人账上（不是你的无能）', 'bad']); }
      }
    };
  }
  // 分家均分结算（进入当户即自动发生一次）
  function doInherit(log) {
    if (S.分家) return;
    S.分家 = true;
    S.存米 += 2; S.家族 += 4; S.口食田 = 1;
    log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩(口食田，不入可支配)', 'good']);
  }

  // ── 养老（55岁）：多维行动点循环 —— 与诸子协商奉养，逐人记账 ──
  function stageElder() {
    return {
      title: '养老', label: '养老', next: 'death', nextLabel: '走向人生终点 →',
      ap: 3, commitLabel: '安顿晚景 →',
      note: '功能容量随龄下降，劳作让位于休息医药。奉养是与诸子协商的结果、不是默认义务——你提，儿子未必都应；识字/家族声望影响协商的成算，逐人镜像入账。〔机制事实，标准为占位〕',
      narrative: '你已<span class="em">五十五岁</span>，在明代平民已属高寿门槛。身子大不如前，' + (S.子数 > 0 ? '育有 ' + S.子数 + ' 子，可商议轮养——但奉养多寡是协商出来的。' : '膝下无育成之子，养老无所依，只能靠口食田与积蓄。') + '这一程 <span class="em">3 个行动点</span>安顿晚景。',
      dossier: function () { return lifeDossier(S.子数 > 0 ? ('诸子 ' + S.子数 + ' 人各有小家，是否足额奉养要看协商成算（家族声望↑更顺）。') : '无子可依，奉养这条路走不通，须自筹。'); },
      events: [{ t: 'rel', tag: '[养老]', txt: S.子数 > 0 ? '诸子就"谁出米、谁出工"各持立场——他们也有自己的妻儿要养，奉养须双方同意、镜像入各自账本。' : '无子可依，只能靠口食田薄租、自身积蓄，或变卖田产。' }],
      prompt: '如何安顿晚年？（分配 3 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'e_negotiate', name: '与诸子协商轮养', cost: 2, eff: S.子数 > 0 ? '按成算得诸子供养·家族+' : '（无子·此路不通）', desc: '召集诸子议定谁出米谁出工——他们可应可辞。', can: S.子数 > 0, why: S.子数 > 0 ? '' : '膝下无育成之子', once: true, prob: S.子数 > 0 ? '足额 / 半额 / 只象征奉养' : '' });
        A.push({ id: 'e_sell', name: '变卖田产养老', cost: 1, eff: '田-1亩·白银+2·存米+2', desc: '换现钱防身，但下一代可分田减少。', can: S.田亩 >= 2, why: S.田亩 >= 2 ? '' : '需田产≥2亩', once: true });
        A.push({ id: 'e_rent', name: '收口食田薄租', cost: 1, eff: '存米+2（养老田进项）', desc: '当年立户分得的养老田，此时收租过活。', can: S.口食田 > 0, why: S.口食田 > 0 ? '' : '未有养老田', once: true });
        A.push({ id: 'e_med', name: '延医问药·调养', cost: 1, eff: '铜钱-500·体魄+8', desc: '花钱请郎中调养，延一延寿数。', can: S.铜钱 >= 500, why: S.铜钱 >= 500 ? '' : '铜钱不足500文' });
        A.push({ id: 'e_rest', name: '静养含饴', cost: 1, eff: '体魄+4·家族+2', desc: '不再劳作，含饴弄孙，安养身心。', can: true });
        return A;
      },
      settle: function (log) {
        var didProvide = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'e_negotiate':
              didProvide = true;
              var base = 0.30 + (S.家族 >= 65 ? 0.25 : 0.10) + (S.识字 ? 0.10 : 0);
              base = Math.min(0.9, base);
              var out = rollProb([{ p: base, r: 'full' }, { p: (1 - base) * 0.6, r: 'half' }, { p: (1 - base) * 0.4, r: 'token' }]);
              if (out === 'full') { var m = 2 * S.子数; S.存米 += m; S.家族 += 8; log.push(['〔诸子应允〕协商成算约 ' + Math.round(base * 100) + '%：足额轮养，存米+' + m + '、家族+8', 'good']); }
              else if (out === 'half') { var m2 = S.子数; S.存米 += m2; S.家族 += 3; log.push(['〔各有难处〕诸子只能半额奉养：存米+' + m2 + '、家族+3', 'bad']); }
              else { S.存米 += 1; S.家族 -= 2; log.push(['〔诸子推辞〕只象征性奉养：存米+1、家族-2（他们也有自己的妻儿要养）', 'bad']); }
              break;
            case 'e_sell': S.田亩 -= 1; S.白银 += 2; S.存米 += 2; log.push(['变卖田1亩养老：田-1、白银+2、存米+2（下一代起点降低）', 'bad']); break;
            case 'e_rent': S.存米 += 2; log.push(['收口食田薄租：存米+2', 'good']); break;
            case 'e_med': S.铜钱 = Math.max(0, S.铜钱 - 500); S.体魄 += 8; log.push(['延医问药：铜钱-500、体魄+8（益寿）', 'good']); break;
            case 'e_rest': S.体魄 += 4; S.家族 += 2; log.push(['静养含饴：体魄+4、家族+2', 'good']); break;
          }
        });
        S.体魄 -= 4; // 自然衰老
        if (!didProvide && S.子数 > 0) log.push(['这一程未与诸子协商奉养——晚景多靠自筹', 'bad']);
        if (S.子数 === 0 && !lifePicks.some(function (p) { return p.id === 'e_sell' || p.id === 'e_rent'; })) log.push(['无子无进项，晚景清苦，体魄再-4', 'bad']), S.体魄 -= 4;
        log.push(['岁月不居，自然衰老：体魄-4', 'bad']);
      }
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
  function restart() { installDelegation(); generation = 1; carryOver = null; initState(null); rollXun(); renderStatus(); renderStage(); renderLedger(); window.scrollTo({ top: 0 }); }
  document.getElementById('btn-restart').addEventListener('click', restart);
  installDelegation();
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
