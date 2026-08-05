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
  var FARM_YEARS = 3;      // 成丁后佃田耕作的农年数（16→18岁），每年秋收强制结算佃约
  var WAGE_YEARS = 3;      // 成丁后受雇谋生的工年数（16→18岁）
  var WAGE_SEASONS = [
    { id: 'spring', name: '春忙', note: '插秧、整地、找长工、抢春忙短工的时候。', actionLead: '春忙里先抢工、先签约，谁慢半拍，后头一年都要跟着吃紧。 ' },
    { id: 'summer', name: '夏忙', note: '伏夏最熬人，旺工与劳损一并上身。', actionLead: '天热、活重、家计紧，身子和工钱都在这里被一寸寸磨出来。 ' },
    { id: 'autumn', name: '秋收', note: '秋收旺工最值钱，也是家里最盼你回去搭手的时候。', actionLead: '秋收里一手是现钱，一手是家中口粮；同一双手，不可能两头都分到十足。 ' },
    { id: 'winter', name: '冬闲', note: '冬闲零工、修具盘账与年关清账并到一处。', actionLead: '冬天看着像缓下来，实际上是把讨薪、口粮、差役、旧债一口气算清的时候。 ' }
  ];
  var APPRENTICE_SEASONS = [
    { id: 'opening', name: '投师季', note: '年头先跑说合、作保、立据，把能不能入店坐实。', actionLead: '年头先看门路开不开、保人肯不肯担、字据立不立得成。没把这几步走通，后头再勤快也还在门外。 ' },
    { id: 'middling', name: '坐店季', note: '字据若已立成，这一季主要熬守店、跑腿、认货、抄账。', actionLead: '真正熬人的不是拜师那一下，而是字据立成后日复一日的站柜、搬货、跑街和认账。 ' },
    { id: 'closing', name: '年关季', note: '忙市、归省、差役钱和去留都在年关前后一起落账。', actionLead: '年关前后最像“这一年到底值不值”的总盘：店里看你能不能留下，家里看你到底有没有把这一路撑起来。 ' }
  ];
  var MERCHANT_SEASONS = [
    { id: 'spring', name: '春开路', note: '先认铺面、认人情、认哪几笔钱能动。', actionLead: '春里最先要坐实的，不是能不能发财，而是铺里肯不肯把门路递到你手上、家里又急不急着等你回钱。 ' },
    { id: 'summer', name: '夏坐店', note: '伏夏最熬人，坐店、抄账、跑街都在这时磨出来。', actionLead: '天热、货重、人情杂，真正把商路底子坐稳，多半靠的是夏里这一段看不见高光的苦工。 ' },
    { id: 'autumn', name: '秋试手', note: '旺季问价走货，也是最像“试贩”和“反哺”的时节。', actionLead: '秋里货热、价动、家里又盼口粮与现钱；这一程最能看出商路是不是只停在“会说”，还是开始真能回账。 ' },
    { id: 'winter', name: '冬清账', note: '年关盘账、回款、差役和旧债一起压下来。', actionLead: '冬里最要紧的不是再多跑一趟，而是把哪笔钱回来了、哪笔钱还没回、该不该先寄回家，全在这一程里摊开。 ' }
  ];
  var EXAM_SEASONS = [
    { id: 'spring', name: '春课', note: '年头先定这一年走塾馆、半耕半读还是寄读，也把保结与束脩先开头。', actionLead: '春里最先被掂量的，不是“你有没有志气”，而是这户人家今年到底还能不能继续供你读、又准备怎么供。 ' },
    { id: 'summer', name: '夏课', note: '伏夏最耗心力，温书、评文、誊抄补贴与家计一起压上来。', actionLead: '天热、心躁、纸墨不停往外走，真正把火候磨出来，多半靠的是这一季看不见结果的苦读与杂支。 ' },
    { id: 'autumn', name: '秋试', note: '秋里才像真正要碰资格、盘缠与下场成败的时候。', actionLead: '秋里一头要准备下场，一头又得顾家中口粮和赴试盘缠；举业最怕的不是没天分，而是别的账先把路卡死。 ' },
    { id: 'winter', name: '冬清账', note: '年关把束脩、差役、旧债、读书成色与是否继续供读一并结清。', actionLead: '冬里不是只等一个“中没中”的说法，而是要把这一年所有纸墨、人情、差役与旧债都真正算清。 ' }
  ];
  var APPRENTICE_YEARS = 3; // 成丁后入城学徒的学年数（16→18岁）
  var MERCHANT_YEARS = 3;   // 成丁后学生意的商年数（16→18岁）
  var EXAM_YEARS = 3;       // 成丁后读书应举的举业年数（16→18岁）
  var YEAR_KOULIANG = 3;   // 全家一年口粮消耗（石·占位）
  var RENT_SEIZE_P = 0.35; // 欠租被夺佃概率（占位）
  var CORVEE_P = 0.40;     // 里甲赋役佥派概率（占位）
  var DEBT_RATE = 0.2;     // 旧债年息（占位）

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
  var _yearEndNext = null;   // 年终结账面板之后要去的地方：'newyear' | 'marriage'
  var phase;                 // 'childhood' | 'establishment' | 'farm' | 'wage' | 'apprentice' | 'merchant' | 'civilExam' | 'marriage' | 'household' | 'elder' | 'death'
  var generation = 0;        // 第几代
  var carryOver = null;      // 上一代传下的期初结余
  var curStage = null;       // 当前人生阶段卡（非农事时）
  var childStage = 0;        // 幼年第几段（0..CHILD_STAGE_N-1）
  var childRound = 0;        // 本段第几轮
  var childPicks = [];       // 本轮已排的幼年活计
  var childResolved = null;  // 本轮结算文本
  var curChildEvents = [];   // 本轮随机事件
  // 默认从 16 岁立身开始，便于“立身五路→成家→当户→养老→死亡传承→下一代重开”闭环回放。
  // 仍保留“从出生跑起”模式，用于验证幼年与“弟妹接续”分支。
  var startMode = 'establishment'; // 'establishment' | 'childhood'
  var phaseTrace = [];             // 运行时阶段轨迹：供无头验证锁定“立身→成家→当户→养老→死亡”闭环

  function currentPhaseTitle() {
    if (curStage && curStage.title) return curStage.title;
    if (phase === 'childhood') {
      var st = CHILD_STAGES[childStage] || CHILD_STAGES[0];
      return st ? st.name : '幼年';
    }
    if (phase === 'establishment') return '立身';
    if (phase === 'farm') return '留乡佃田';
    if (phase === 'wage') return '受雇谋生';
    if (phase === 'apprentice') return '入城学徒';
    if (phase === 'merchant') return '徽商学生意';
    if (phase === 'civilExam') return '读书应举';
    if (phase === 'marriage') return '成家';
    if (phase === 'family') return '养家';
    if (phase === 'household') return '当户';
    if (phase === 'elder') return '养老';
    if (phase === 'death') return '死亡与传承';
    return curLabel();
  }

  function tracePhase(reason) {
    var next = {
      i: phaseTrace.length + 1,
      generation: generation,
      phase: phase || 'unknown',
      title: currentPhaseTitle(),
      age: S ? S.年龄 : 0,
      route: S ? (S.路线 || '未立身') : '未立身',
      reason: reason || ''
    };

    // 轨迹去重：避免同一阶段因重复 enter/render 造成的“连刷”，
    // 让无头回放与人工阅读都更稳定（只记录“状态真的变了”的点）。
    var prev = phaseTrace.length ? phaseTrace[phaseTrace.length - 1] : null;
    if (prev
      && prev.generation === next.generation
      && prev.phase === next.phase
      && prev.age === next.age
      && prev.title === next.title) {
      return;
    }
    phaseTrace.push(next);
  }

  function phaseTraceLabel(maxSteps) {
    maxSteps = Math.max(4, Number(maxSteps) || 12);
    var list = (phaseTrace || []).map(function (t) {
      return (t.phase || 'unknown') + '@' + (t.age || 0);
    });
    // 连续重复再压一层，保证 tooltip 更短（即使 tracePhase 未来被改回不去重也不脏）。
    var folded = [];
    list.forEach(function (s) {
      if (!folded.length || folded[folded.length - 1] !== s) folded.push(s);
    });
    var tail = folded.slice(Math.max(0, folded.length - maxSteps));
    return (tail.join(' → ')) + (folded.length > maxSteps ? ('（省略' + (folded.length - maxSteps) + '步）') : '');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initState(carry, opts) {
    opts = opts || {};
    carryOver = carry || null;
    startMode = (opts.start === 'childhood' || opts.start === 'establishment') ? opts.start : startMode;
    S = {
      年龄: 1, 身份: '民籍·佃农子(孩提)',
      体魄: 60, 家族: 60,
      白银: 1, 铜钱: 1200, 存米: 3,
      秧苗进度: 0, 已插秧: false, 田亩: 4, 租额石: 3, 菜圃进度: 0, 母出工: true, 农年: 1,
      // 幼年字段
      识字: false, 技艺: '无', 兄弟序: 1, 农事历练: 0, 家务历练: 0, 识字进度: 0, 技艺进度: 0,
      // 立身与雇工路径字段
      路线: '未立身', 工年: 1, 工季: 1, 工段: 1, 雇身份: '未定', 雇工历练: 0, 雇技进度: 0, _advanceWageYear: false, _advanceWageSeason: false,
      本年雇约: '未定', 本年工食银: 0, 本年工食钱: 0, 本年口粮减免: 0, 本年帮家次数: 0, 本年短工次数: 0, 本年外出次数: 0, 本年看账次数: 0, 本年学艺次数: 0, 本年贴家次数: 0, 本年备役次数: 0, 本年季务: [],
      // 学徒路径字段
      学年: 1, 学季: 1, 学旬: 1, 学徒阶段: '未定', 学徒合同: '未议', 学徒保人: false, 学徒保证金银: 0, 学徒束脩文: 0,
      学徒授艺度: 0, 学徒信任: 0, 学徒历练: 0, 学徒去向: '未定', _advanceApprenticeYear: false, _advanceApprenticeStep: false,
      本年学徒说合: 0, 本年学徒守店: 0, 本年学徒学账: 0, 本年学徒帮家: 0, 本年学徒奔走: 0, 本年学徒歇养: 0, 本年学徒备役: 0, 本年学徒旬记: [],
      // 徽商路径字段（四季三旬：借用“商段”字段记录当前旬位 1/2/3，避免破坏既有快照结构）
      商年: 1, 商季: 1, 商段: 1, 商身份: '未定', 商历练: 0, 识货进度: 0, 账房进度: 0, 商信誉: 0,
      带本银: 0, 未回款银: 0, 累计反哺银: 0, 商路供读银: 0, 商路亏折: 0, _merchantLockedTradeTable: null, _advanceMerchantYear: false, _advanceMerchantSeason: false,
      本年商路坐店: 0, 本年商路跑单: 0, 本年商路认货: 0, 本年商路核账: 0, 本年商路催账: 0, 本年商路贴家: 0, 本年商路归乡: 0, 本年商路试贩: 0, 本年商路备役: 0, 本年商路歇养: 0, 本年商路季务: [],
      // 科举路径字段
      举业年: 1, 举季: 1, 举段: 1, 读书方式: '未定', 童试层级: 0, 保结进度: 0, 文章火候: 0,
      供读状态: '家中供读', 供读压力: 0, 读书成本档: 0, 本年下场: false,
      生员身份: false, 生员层级: '无', 优免启用: false, 举业结局: '未定', 识字转业值: 0, _advanceExamYear: false, _advanceExamSeason: false,
      本年馆课次数: 0, 本年半读次数: 0, 本年寄读次数: 0, 本年评文次数: 0, 本年保结次数: 0, 本年誊抄次数: 0, 本年归家次数: 0, 本年备役次数: 0, 本年将养次数: 0, 本年举业季务: [],
      // 人生链路字段
      妻室: false, 子数: 0, 女数: 0, 负债银: 0, 口食田: 0, 分家: false, 应役: '未役',
      婚配路径: '未定', 合爨状态: '未合爨', 定额佃状态: '未立',
      // 成家后的“养家”阶段：按四季推进，用更细的年内节奏把 20~40 岁之间的家计过细（不引入成功分/最优评分）
      家年: 1, 家季: 1, 本年家备役: 0, 本年家季务: [],
      委托营生: '无', 委托租谷: 0, 委托待收租谷: 0, 最近农闲营生层级: '未定', 最近农闲营生收益: 0,
      // 代际承接字段（不直接折现，只改变下一代入口分布）
      父辈路线: '未定', 承继身份: '次子', 承嗣来路: '本支次子承继', 承继定位: '本房次子另起一手', 家传书香: 0, 城里门路: 0, 商路门路: 0, 家传手艺: 0, 家传农事: 0, 亦贾亦儒底子: 0, 供读底子: 0,
      _farmLegacyApplied: false, _wageLegacyApplied: false, _apprenticeLegacyApplied: false, _merchantLegacyApplied: false, _examLegacyApplied: false,
      // 起步模式：用于入口文案区分“从出生跑起” vs “从 16 岁立身起算”
      _startMode: startMode,
      // 成家节点：允许“推迟婚事→再议亲”，用显式年份推移来改写婚育窗口（不靠隐藏剧本）
      _marriageAgeAdj: 0,       // 相对路线默认议亲年龄的推迟年数（以 2 年为步长）
      _marriageAttempts: 0,     // 已经历的“议亲节点”轮数（用于限制无限拖延）
      _marriageAtAge: null      // 成婚时的实际年龄（用于回放与对照，不参与评分）
    };
    if (carry) {
      S.白银 = Math.max(0, carry.白银 || 0);
      S.存米 = Math.max(0, carry.存米 || 0);
      S.铜钱 = carry.铜钱 != null ? carry.铜钱 : 1200;
      S.田亩 = Math.max(0, carry.田亩 != null ? carry.田亩 : 4);
      S.负债银 = Math.max(0, carry.负债银 || 0);
      S.家族 = Math.max(20, Math.min(80, carry.家族 == null ? 60 : carry.家族));
      S.父辈路线 = carry.父辈路线 || '未定';
      S.承继身份 = carry.承继身份 || (isCollateralCarry(carry) ? '旁支继子' : '次子');
      S.承嗣来路 = carry.承嗣来路 || '本支次子承继';
      S.承继定位 = carry.承继定位 || '本房次子另起一手';
      S.家传书香 = Math.max(0, carry.家传书香 || 0);
      S.城里门路 = Math.max(0, carry.城里门路 || 0);
      S.商路门路 = Math.max(0, carry.商路门路 || 0);
      S.家传手艺 = Math.max(0, carry.家传手艺 || 0);
      S.家传农事 = Math.max(0, carry.家传农事 || 0);
      S.亦贾亦儒底子 = Math.max(0, carry.亦贾亦儒底子 || 0);
      S.供读底子 = Math.max(0, carry.供读底子 || 0);
    }
    ledger = []; seq = 0; xunIndex = 0; picks = []; resolved = null; gameOver = false;
    phaseTrace = [];
    _invViolations = [];
    if (typeof window !== 'undefined') window.__INV = _invViolations;
    _yearEndNext = null;
    phase = 'childhood';
    childStage = 0; childRound = 0; childPicks = []; childResolved = null;
    if (startMode === 'childhood') {
      S.年龄 = CHILD_STAGES[0].age;
      recordEntry('出生开账', null,
        generation > 1 ? ('第' + generation + '代降生：这一户现有田' + S.田亩 + '亩、存米' + S.存米 + '石、白银' + S.白银 + '两' + (S.负债银 > 0 ? ('、旧债' + S.负债银 + '两') : '') + '，' + inheritedRoleBirthLead(carryOver) + inheritedCarryNote(carryOver))
          : '出生：降生于江南民籍佃农之家，排行次子。这户现有薄田4亩、存米3石、少量现钱。');
      tracePhase('init:childhood');
      rollChildRound();
    } else {
      // 直接从 16 岁立身起算：少一层“幼年点点点”的摩擦，便于五路入口回放与闭环验证。
      enterEstablishment();
    }
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
    checkInvariants(name);
  }

  // ══════════ 可机器检查的不变量（invariants）══════════
  // 现代版要求第11条：任何时刻这些约束都必须成立；违反即为设计/实现 bug。
  // 暴露到 window.__INV 供无头测试断言；运行时违规会 console.warn 但不崩游戏。
  var _invViolations = [];
  function checkInvariants(ctx) {
    var v = [];
    // 1) 资源不为负（存米/铜钱/白银/负债）
    if (S.存米 < 0) v.push('存米为负(' + S.存米 + ')');
    if (S.铜钱 < 0) v.push('铜钱为负(' + S.铜钱 + ')');
    if (S.白银 < 0) v.push('白银为负(' + S.白银 + ')');
    if (S.负债银 < 0) v.push('负债为负(' + S.负债银 + ')');
    if (S.未回款银 < 0) v.push('未回款为负(' + S.未回款银 + ')');
    // 2) 属性钳制在 [0,100]
    if (S.体魄 < 0 || S.体魄 > 100) v.push('体魄越界(' + S.体魄 + ')');
    if (S.家族 < 0 || S.家族 > 100) v.push('家族越界(' + S.家族 + ')');
    // 3) 田亩不得为负；分家后这一房可能已无整亩可分，只能带着旧门路再外求
    if (S.田亩 < 0) v.push('田亩<0(' + S.田亩 + ')');
    // 4) 概念分离：未婚不得有子嗣（成家先于生育）
    if (!S.妻室 && (S.子数 > 0 || S.女数 > 0)) v.push('未婚却有子嗣(概念分离被破坏)');
    // 5) 时间与死亡：已确认死亡后不得再写入活人状态
    if (S._dead && ctx !== '丧葬支出结算' && ctx.indexOf('传承') < 0) v.push('死者仍被写入状态: ' + ctx);
    // 6) 代际 carry 合法（若存在）
    if (S._carry) {
      if (S._carry.田亩 < 0) v.push('传承田亩<0');
      if (S._carry.存米 < 0 || S._carry.白银 < 0) v.push('传承资源为负');
      if ((S._carry.负债银 || 0) < 0) v.push('传承负债为负');
    }
    // 7) 路线专有约束
    if (S.生员身份 && S.童试层级 < 3) v.push('未过院试却写成生员');
    if (S.优免启用 && !S.生员身份) v.push('未成生员却启用优免');
    if (S.童试层级 < 0 || S.童试层级 > 3) v.push('童试层级越界(' + S.童试层级 + ')');
    if (S.学徒阶段 === '留店伙计' && S.学徒授艺度 < 2) v.push('学徒授艺未达标却留店为伙计');
    if (S.带本银 > 0 && S.白银 < 0) v.push('带本与现银结算异常');
    if (v.length) {
      v.forEach(function (msg) { _invViolations.push({ ctx: ctx, msg: msg, seq: seq }); });
      if (typeof console !== 'undefined' && console.warn) console.warn('[不变量违规@' + ctx + '] ' + v.join('; '));
    }
    if (typeof window !== 'undefined') window.__INV = _invViolations;
    return v;
  }
  function curLabel() {
    if (phase === 'childhood') { var cs = CHILD_STAGES[childStage]; return cs.name + '·' + cs.age + '岁'; }
    if (phase !== 'farm') return curStage ? curStage.label : (S.年龄 + '岁');
    if (xunIndex >= TOTAL_XUN) return '一季终';
    return SOLAR[Math.floor(xunIndex / 3)] + '·' + XUN[xunIndex % 3];
  }

  // ── 随机工具 ──────────────────────────────────
  var _rngQueue = [];
  var _rngState = null;
  function normalizeRandValue(v) {
    var n = Number(v);
    if (!isFinite(n)) return 0.5;
    if (n <= 0) return 0;
    if (n >= 1) return 0.999999;
    return n;
  }
  function setRandomSequence(seq) {
    _rngQueue = Array.isArray(seq) ? seq.map(normalizeRandValue) : [];
  }
  function setRandomSeed(seed) {
    if (seed == null || seed === '') { _rngState = null; return; }
    var n = Number(seed);
    if (!isFinite(n)) n = 1;
    _rngState = (Math.abs(Math.floor(n)) || 1) >>> 0;
  }
  function clearRandomControls() {
    _rngQueue = [];
    _rngState = null;
  }
  function spendSilver(amount) {
    amount = Math.max(0, Number(amount) || 0);
    if (amount <= 0) return true;
    if (S.白银 < amount) return false;
    S.白银 -= amount;
    return true;
  }
  function spendCopper(amount) {
    amount = Math.max(0, Number(amount) || 0);
    if (amount <= 0) return true;
    if (S.铜钱 < amount) return false;
    S.铜钱 -= amount;
    return true;
  }
  function rand() {
    if (_rngQueue.length) return _rngQueue.shift();
    if (_rngState !== null) {
      _rngState = (_rngState * 1664525 + 1013904223) >>> 0;
      return _rngState / 4294967296;
    }
    return Math.random();
  }
  function pickWeighted(arr) {
    var sum = arr.reduce(function (a, b) { return a + b.w; }, 0), r = rand() * sum;
    for (var i = 0; i < arr.length; i++) { r -= arr[i].w; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }
  // 概率表 [{p:0.6,r:'safe'},...] p 之和应=1，返回命中的 r
  function rollProb(table) {
    var r = rand(), acc = 0;
    for (var i = 0; i < table.length; i++) { acc += table[i].p; if (r <= acc) return table[i].r; }
    return table[table.length - 1].r;
  }
  function clampAttr(k) { if (S[k] < 0) S[k] = 0; if (S[k] > 100) S[k] = 100; }
  function inheritedCarryTags(carry) {
    if (!carry) return [];
    var tags = [];
    if ((carry.承继定位 || '')) tags.push('这一房眼下的家业内部分工是“' + carry.承继定位 + '”');
    if ((carry.家传手艺 || 0) > 0) tags.push('家里还认得一层手艺门路');
    if ((carry.家传农事 || 0) > 1) tags.push('父辈把看天、看水、守薄田的农事门道也守下来了');
    else if ((carry.家传农事 || 0) > 0) tags.push('家里还留着一层守薄田的农事底子');
    if ((carry.城里门路 || 0) > 1) tags.push('父辈在城里留下了熟门熟路的铺面人脉');
    else if ((carry.城里门路 || 0) > 0) tags.push('父辈在城里留过几层熟识');
    if ((carry.商路门路 || 0) > 1) tags.push('商路旧识与账面门道还在');
    else if ((carry.商路门路 || 0) > 0) tags.push('家里还认得几条商路');
    if ((carry.家传书香 || 0) > 1) tags.push('屋里留着旧书与师承门路');
    else if ((carry.家传书香 || 0) > 0) tags.push('家里还存一点书香与识字底子');
    if ((carry.亦贾亦儒底子 || 0) > 0) tags.push('这一房已隐约有了亦贾亦儒的分工念头');
    if ((carry.供读底子 || 0) > 0) tags.push('家里还留着几手供读专账的老规矩');
    return tags;
  }
  function isCollateralCarry(carry) {
    if (!carry) return false;
    var via = carry.承嗣来路 || '';
    return via.indexOf('旁支过继') >= 0 || via.indexOf('旁支续承') >= 0;
  }
  function isSiblingCarry(carry) {
    if (!carry) return false;
    return (carry.承嗣来路 || '').indexOf('弟妹接续') >= 0;
  }
  function lineageTokens(via) {
    return (via || '').split('·').map(function (part) { return (part || '').trim(); }).filter(Boolean);
  }
  function composeLineageSource(baseVia, currentTag) {
    var tokens = lineageTokens(baseVia);
    if (currentTag && tokens.indexOf(currentTag) < 0) tokens.push(currentTag);
    return tokens.length ? tokens.join('·') : (currentTag || '本支次子承继');
  }
  function currentInheritanceRole(carry) {
    if (!carry) return '次子';
    return carry.承继身份 || (isCollateralCarry(carry) ? '旁支继子' : '次子');
  }
  function inheritedRoleBirthLead(carry) {
    var role = currentInheritanceRole(carry);
    if (role === '旁支继子') return '你如今以旁支继子续这一房香火，全赖父母养育。';
    if (role === '独子') return '你是这一房独子，全赖父母养育。';
    if (role === '长子') return '你排行长子，全赖父母养育。';
    return '你排行次子，全赖父母养育。';
  }
  function inheritanceRoleNarrative(carry) {
    var role = currentInheritanceRole(carry);
    if (role === '旁支继子') return '你这一代是以旁支继子续这一房，接的是结清后的真实余产，不是凭空补回一张“本支次子”模板。';
    if (role === '独子') return '你这一代是以独子承家，少了“长兄先分去大头”的缓冲，门路与亏空会更直接压在你身上。';
    if (role === '长子') return '你这一代是以长子承这一本账，户里日常与门路都更直接落在你肩上。';
    return '你仍是这一房的次子，长兄多半承更多家产；但父辈留下的门路与亏空，也都会改写你五条路的入口。';
  }
  function inheritedCarryNote(carry) {
    var tags = inheritedCarryTags(carry);
    if (isCollateralCarry(carry)) tags.push('这一房经旁支接祧，门路比本支更薄一层');
    if (isSiblingCarry(carry)) tags.push('这一手是幼年早夭后由弟妹接续，旧账与门路都沿前一手继续传下');
    return tags.length ? ('上一代还给这一房留下：' + tags.join('、') + '。') : '';
  }
  function carryRouteAwareSummary(carry) {
    if (!carry) return '无额外承接状态位';
    var tags = [];
    if ((carry.承继身份 || '')) tags.push('承继身份=' + carry.承继身份);
    if ((carry.承嗣来路 || '')) tags.push('承嗣来路=' + carry.承嗣来路);
    if ((carry.承继定位 || '')) tags.push('承继定位=' + carry.承继定位);
    if ((carry.家传书香 || 0) > 0) tags.push('家传书香' + carry.家传书香 + '层');
    if ((carry.城里门路 || 0) > 0) tags.push('城里门路' + carry.城里门路 + '层');
    if ((carry.商路门路 || 0) > 0) tags.push('商路门路' + carry.商路门路 + '层');
    if ((carry.家传手艺 || 0) > 0) tags.push('家传手艺' + carry.家传手艺 + '层');
    if ((carry.家传农事 || 0) > 0) tags.push('家传农事' + carry.家传农事 + '层');
    if ((carry.亦贾亦儒底子 || 0) > 0) tags.push('亦贾亦儒底子' + carry.亦贾亦儒底子 + '层');
    if ((carry.供读底子 || 0) > 0) tags.push('供读底子' + carry.供读底子 + '层');
    return tags.length ? tags.join('｜') : '无额外承接状态位';
  }
  function isFarmRouteState() {
    return (S.路线 || '').indexOf('留乡佃田') === 0;
  }
  function isWageRouteState() {
    return (S.路线 || '').indexOf('受雇长工/短工') === 0;
  }
  function routeEntryHook(routeKey, carry) {
    if (!carry) return '';
    var hints = [];
    if (routeKey === 'farm') {
      if ((carry.家传农事 || 0) > 0) hints.push('回头守田时不至只剩几亩数字，知道该怎么看水、守租和换工');
      if ((carry.家传书香 || 0) > 0) hints.push('田上记账、认税则不至全靠别人念给你听');
      if ((carry.商路门路 || 0) > 0 || (carry.城里门路 || 0) > 0) hints.push('去市镇卖米换钱时不至样样都吃生');
      if ((carry.家传手艺 || 0) > 0) hints.push('农闲还能凭一点手艺补贴家计');
    } else if (routeKey === 'wage') {
      if ((carry.家传农事 || 0) > 0) hints.push('将来真回头守薄田时，不至两眼一抹黑');
      if ((carry.家传手艺 || 0) > 0) hints.push('一上手就有熟活可跟');
      if ((carry.城里门路 || 0) > 0) hints.push('外出寻工不至全凭陌生脸');
      if ((carry.家传书香 || 0) > 0) hints.push('识字核账更不易吃闷亏');
    } else if (routeKey === 'apprentice') {
      if ((carry.城里门路 || 0) > 0) hints.push('求师说合会更快坐实');
      if ((carry.商路门路 || 0) > 0) hints.push('认货记账不是全然白手');
      if ((carry.家传手艺 || 0) > 0) hints.push('上手守店比寻常学徒更快');
      if ((carry.承继定位 || '').indexOf('次子循城外求') >= 0) hints.push('长兄先在家守着户头，你这一手本就是被放出来往城里外求的，说合时少一道“为何偏要外出”的掣肘');
    } else if (routeKey === 'merchant') {
      if ((carry.商路门路 || 0) > 0) hints.push('进号就能接上旧识和账面门道');
      if ((carry.城里门路 || 0) > 0) hints.push('在城里更容易找到落脚与牙口');
      if ((carry.家传书香 || 0) > 0) hints.push('抄单核账起步更顺');
      if ((carry.亦贾亦儒底子 || 0) > 0) hints.push('家里对商路反哺供读并不陌生');
      if ((carry.供读底子 || 0) > 0) hints.push('你会更早记得替家里另划几手供读专账');
      if ((carry.承继定位 || '').indexOf('长兄续商') >= 0) hints.push('长兄那一房先续着旧号，你这一手若再走商，多半要在旧账旁另起一支');
    } else if (routeKey === 'civilExam') {
      if ((carry.家传书香 || 0) > 0) hints.push('识字、文章和保结起步更顺');
      if ((carry.商路门路 || 0) > 0) hints.push('商路旧识更容易替你递条子、垫几步人情');
      if ((carry.亦贾亦儒底子 || 0) > 0) hints.push('家里更知道怎么先供几年书');
      if ((carry.供读底子 || 0) > 0) hints.push('束脩纸墨前头先有一笔不折现的供读缓冲');
      if ((carry.承继定位 || '').indexOf('次子候读') >= 0) hints.push('家里原本就把你这一手留作先读的一房，长兄那边续号回钱更像你背后的暗底');
      if ((carry.承继定位 || '').indexOf('次子续读') >= 0) hints.push('长兄先守着户里那摊日常，你这一手本就被家里留作续读，起手少一层“先回去扛家计”的拉扯');
    }
    if (isCollateralCarry(carry)) hints.push('只是这份门路经旁支接祧后已薄了一层，未必还能照本支那样使');
    if (isSiblingCarry(carry)) hints.push('这一手是弟妹接着前一个孩子的旧账往下活，门路不会凭空洗回空白');
    return hints.length ? ('上一代余绪会先替你垫这几步：' + hints.join('；') + '。') : '';
  }
  function currentFamilySnapshotText() {
    if (generation <= 1 || !carryOver) {
      return '共同父快照不变：民籍次子、家庭公账白银6两/铜钱2000文/存米8石、薄田12亩、本人无独立现金。此处只分“路”，不倒填未来。';
    }
    return '这一代不再回滚到初代父快照，而是沿上一代真实传承快照继续：本房现有白银' + S.白银 + '两、铜钱' + S.铜钱 + '文、存米' + S.存米 + '石、田' + S.田亩 + '亩' + (S.负债银 > 0 ? ('，另背旧债' + S.负债银 + '两') : '') + '。' +
      '这一手如今以<span class="em">' + currentInheritanceRole(carryOver) + '</span>承这一本账。' +
      (carryOver.父辈路线 && carryOver.父辈路线 !== '未定' ? ('父辈走的是“' + carryOver.父辈路线 + '”。') : '') +
      inheritedCarryNote(carryOver);
  }
  function currentEstablishmentLead(baseSummary) {
    if (generation <= 1 || !carryOver) {
      var fromBirthLead = (S._startMode === 'childhood') ? '幼年既过，' : '';
      return fromBirthLead + '你已<span class="em">十六岁</span>。父兄会留在这户田上，你得决定自己怎么立身。' +
        (baseSummary.length ? ('你这些年攒下的底子：<span class="em">' + baseSummary.join('、') + '</span>。') : '你手上并无特别底子，只有一副年轻身子和一点寻常农事。') +
        '五条路共享同一个过去、同一份家底，但以后会走成完全不同的一生。';
    }
    return '你已<span class="em">十六岁</span>。这一代承的是上一代身后结清后留下的家底：田' + S.田亩 + '亩、存米' + S.存米 + '石、白银' + S.白银 + '两' + (S.负债银 > 0 ? ('、旧债' + S.负债银 + '两') : '') + '。' +
      (baseSummary.length ? ('你眼下能动用的底子：<span class="em">' + baseSummary.join('、') + '</span>。') : '你手里没攒出太多新底子，只能从上一代留给你的薄产与门路里找出路。') +
      inheritanceRoleNarrative(carryOver);
  }
  function currentLifeProfile() {
    var route = S.路线 || '';
    var settledApprentice = (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商');
    var profile = {
      marriageAge: 22,
      householdAge: 38,
      elderAge: 50,
      fertilityTag: 'normal',
      marriageLead: '这一路在二十出头就会被拿去和聘礼、家计与身价一道算账。',
      fertilityLead: '成婚较早，生育窗口相对宽些，但仍受夭折与家计所限。',
      deathTable: [{ p: 0.50, r: 52 }, { p: 0.28, r: 58 }, { p: 0.16, r: 64 }, { p: 0.06, r: 70 }]
    };
    if (route.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      profile.marriageAge = settledApprentice ? 28 : 24;
      profile.fertilityTag = settledApprentice ? 'late' : 'normal';
      profile.marriageLead = settledApprentice
        ? '学徒路要先把去向坐实，往往要拖到二十八岁前后，媒人才肯把“有没有正经去处”当回事。'
        : '若中途退师或被辞回乡，婚事虽会比留乡务农晚，却不至于拖到最窄的窗口。';
      profile.fertilityLead = settledApprentice
        ? '去向坐实得晚，生育窗口随之变窄，育成男嗣的期望会被压低。'
        : '虽已归乡另谋，婚育仍比早婚务农晚一截。';
    } else if (route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
      profile.marriageAge = S.生员身份 ? 28 : 29;
      profile.fertilityTag = 'lateStrict';
      profile.marriageLead = '举业路会先把几年乃至十余年的束脩、下场、保结和笔墨底子折进婚事账，迟婚是这一路最明显的结构性代价。';
      profile.fertilityLead = '成婚更晚，生育窗口最窄，绝嗣风险也会比其他路更高。';
    } else if (route.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计反哺银 > 0) {
      profile.fertilityTag = 'split';
      profile.marriageLead = '商路现金往来更活，但“到账”和“在路上”不是一回事；议亲时认的是手里现钱与这些年有没有回钱。';
      profile.fertilityLead = '婚龄未必更晚，但常年在外、聚少离多，会把添丁的节奏拉长。';
      profile.deathTable = [{ p: 0.58, r: 52 }, { p: 0.24, r: 58 }, { p: 0.13, r: 64 }, { p: 0.05, r: 70 }];
    } else if (route.indexOf('受雇') === 0) {
      profile.marriageLead = '卖工路的婚事更多取决于你能不能把几年工食和一点现钱稳稳攒在手里。';
      profile.fertilityLead = '婚龄与务农路接近，但口粮更依赖工钱换米。';
    } else if (route.indexOf('留乡佃田') === 0) {
      profile.marriageLead = '务农路的婚事走得相对早，聘礼和田上收成、家里米缸直接相连。';
      profile.fertilityLead = '成婚较早，婚后很快就进入养家与生育的长账。';
    }
    // ── 议亲推迟：把“被推迟事项”落到可验证的年龄与婚育窗口上 ──
    // 只在玩家明确选择“暂缓/凑不齐聘礼”时累加；不凭空自动推迟。
    var adj = Math.max(0, Math.floor(S._marriageAgeAdj || 0));
    if (adj) {
      profile.marriageAge += adj;
      profile.householdAge += adj;
      profile.elderAge += adj;
      var baseTag = profile.fertilityTag;
      // “分居”是商路结构性标签：仍以分居为主，不因年龄推迟而改写为窄窗
      if (profile.fertilityTag !== 'split') {
        var ma = profile.marriageAge;
        if (profile.fertilityTag === 'normal') {
          if (ma >= 29) profile.fertilityTag = 'lateStrict';
          else if (ma >= 26) profile.fertilityTag = 'late';
        } else if (profile.fertilityTag === 'late') {
          if (ma >= 30) profile.fertilityTag = 'lateStrict';
        }
      }
      if (profile.marriageLead && adj > 0) profile.marriageLead += '（若聘礼凑不齐或主动暂缓，婚事会顺延，后面的账也随之改写）';
      if (profile.fertilityTag !== baseTag) profile.fertilityLead += '（因婚事推迟，婚育窗口随之变窄，绝嗣风险上移；不评分，只记因果与守恒。）';
    }
    return profile;
  }
  function normalizeProbTable(dict) {
    var keys = Object.keys(dict || {});
    var floor = 0.02;
    var total = keys.reduce(function (acc, k) { return acc + Math.max(floor, dict[k] || 0); }, 0);
    if (!keys.length) return [];
    if (total <= 0) return keys.map(function (k) { return { p: 1 / keys.length, r: k }; });
    var acc = 0;
    return keys.map(function (k, idx) {
      var p = Math.max(floor, dict[k] || 0) / total;
      if (idx === keys.length - 1) p = Math.max(0, 1 - acc);
      acc += p;
      return { p: p, r: k };
    });
  }
  function merchantTradeProfile() {
    var weights = { flat: 0.35, profit: 0.30, loss: 0.20, receivable: 0.15 };
    var notes = [];
    if (S.商路门路 > 0) {
      weights.profit += 0.05; weights.loss -= 0.03; weights.receivable -= 0.02;
      notes.push('旧商路还认得人和账，货价与回款不至全靠撞运气');
    }
    if ((S.账房进度 + S.商信誉) >= 3) {
      weights.profit += 0.04; weights.loss -= 0.02; weights.receivable -= 0.02;
      notes.push('账房底子与信誉较稳，试贩时更不易吃结账的闷亏');
    }
    if (S.城里门路 > 0) {
      weights.flat += 0.02; weights.loss -= 0.02;
      notes.push('城里熟识让你找牙口和落脚处时少吃一点生');
    }
    if ((S.承继定位 || '').indexOf('长兄续商') >= 0) {
      weights.receivable += 0.05; weights.loss -= 0.02; weights.flat -= 0.03;
      notes.push('长兄续着旧号，你这一手多半得在旁另起一支，货走得出去，回钱却更容易拖期');
    }
    if (S.亦贾亦儒底子 > 0 || S.供读底子 > 0) {
      weights.profit += 0.02; weights.flat += 0.02; weights.loss -= 0.02; weights.receivable -= 0.02;
      notes.push('家里本就认得反哺与供读账，先顾哪笔现钱更稳当，你心里更有数');
    }
    if (S.商路供读银 > 0) {
      weights.flat += 0.02; weights.profit += 0.04; weights.loss -= 0.03; weights.receivable -= 0.03;
      notes.push('这一年已经先寄银回家并另划供读账，试贩结账时也会把“哪笔回钱更不能断”一起算进去');
    }
    if (isCollateralCarry(carryOver)) {
      weights.profit -= 0.04; weights.receivable += 0.02; weights.loss += 0.02;
      notes.push('这一房经旁支接祧后，旧商路只剩薄薄一层，真正坐实还得靠你自己续');
    }
    return {
      table: normalizeProbTable(weights),
      note: notes.length ? ('试贩结果会继续吃到上一代余绪：' + notes.join('；') + '。') : '试贩结果主要看你这一年自己把认货、核账和回钱做到什么地步。'
    };
  }
  function merchantSupportProfile() {
    var familyGain = 1, trustGain = 0;
    var desc = '你在外挣来的银，不只填自家嘴，还可先寄回去顶住家里供读的那条链。';
    var boosted = false;
    if (S.亦贾亦儒底子 > 0 || S.供读底子 > 0 || (S.承继定位 || '').indexOf('次子候读') >= 0) {
      boosted = true;
      familyGain = 2;
      trustGain = 1;
      desc = '这一房本就认得“挣钱的人在外回钱、家里另划供读账”的老规矩；同样一两银回去，更容易被当成要紧的专账而不被日常花销冲散。';
    }
    if (boosted && currentLineageIsCollateral()) {
      familyGain = Math.max(1, familyGain - 1);
      trustGain = Math.max(0, trustGain - 1);
      desc = '这一房虽也承到一点“外头回钱、家里另划供读账”的旧规矩，但如今是旁支续起，这层门路终究比本支薄一线；同样一两银回去，仍能替家里稳住一点供读压力，却不如本支那样稳。';
    }
    return {
      familyGain: familyGain,
      trustGain: trustGain,
      effect: '白银-1·反哺+1·家中供读稳一稳·家族+' + familyGain + (trustGain > 0 ? '·商信誉+1' : ''),
      desc: desc
    };
  }
  function childbearingProfile() {
    var life = currentLifeProfile();
    var profile = {
      label: '常窗',
      note: life.fertilityLead,
      sonsTable: [{ p: 0.18, r: 0 }, { p: 0.34, r: 1 }, { p: 0.32, r: 2 }, { p: 0.16, r: 3 }],
      dausTable: [{ p: 0.25, r: 0 }, { p: 0.45, r: 1 }, { p: 0.30, r: 2 }]
    };
    if (life.fertilityTag === 'split') {
      profile.label = '分居';
      profile.sonsTable = [{ p: 0.22, r: 0 }, { p: 0.36, r: 1 }, { p: 0.28, r: 2 }, { p: 0.14, r: 3 }];
      profile.dausTable = [{ p: 0.28, r: 0 }, { p: 0.42, r: 1 }, { p: 0.30, r: 2 }];
    } else if (life.fertilityTag === 'late') {
      profile.label = '晚婚';
      profile.sonsTable = [{ p: 0.34, r: 0 }, { p: 0.40, r: 1 }, { p: 0.20, r: 2 }, { p: 0.06, r: 3 }];
      profile.dausTable = [{ p: 0.35, r: 0 }, { p: 0.45, r: 1 }, { p: 0.20, r: 2 }];
    } else if (life.fertilityTag === 'lateStrict') {
      profile.label = '窄窗';
      profile.sonsTable = [{ p: 0.45, r: 0 }, { p: 0.36, r: 1 }, { p: 0.15, r: 2 }, { p: 0.04, r: 3 }];
      profile.dausTable = [{ p: 0.40, r: 0 }, { p: 0.42, r: 1 }, { p: 0.18, r: 2 }];
    }
    return profile;
  }
  function applyRouteInheritance(routeKey) {
    if (generation <= 1 || !carryOver) return [];
    var notes = [];
    if (routeKey === 'farm' && !S._farmLegacyApplied) {
      S._farmLegacyApplied = true;
      if (S.家传农事 > 0) {
        S.农事历练 = Math.max(S.农事历练, S.家传农事);
        notes.push('父辈守下来的那层农事底子，让你一回头看田就认得水、租和换工的门道');
      }
      if (S.家传书香 > 0 && !S.识字) {
        S.识字 = true; S.识字进度 = Math.max(1, S.识字进度);
        notes.push('父辈留下的一点书香，让你留乡种田时也看得懂些税则与契字');
      }
      if (S.家传手艺 > 0) {
        S.家族 += 1; clampAttr('家族');
        notes.push('农闲时你还能借家里留的一层手艺去补贴家计，不至全指望田上出息');
      }
      if (S.商路门路 > 0 || S.城里门路 > 0) {
        S.家族 += 1; clampAttr('家族');
        notes.push('父辈在市镇留过些门道，卖米换钱、托人问价都少一点生分');
      }
      if (isCollateralCarry(carryOver) && notes.length) notes.push('只是这一房经旁支接祧后，能借到的门路终究比本支薄一层');
    } else if (routeKey === 'wage' && !S._wageLegacyApplied) {
      S._wageLegacyApplied = true;
      if (S.家传农事 > 0) {
        S.农事历练 = Math.max(S.农事历练, S.家传农事);
        notes.push('虽先走卖工路，父辈守下来的农事底子仍让你知道将来若回头顾田，该从哪几步起手');
      }
      if (S.家传手艺 > 0 && S.技艺 === '无') {
        S.雇技进度 = Math.max(S.雇技进度, 1);
        notes.push('父辈留下的一层手艺门路，让你一入行就知道该跟哪样活计上手');
      }
      if (S.城里门路 > 0) {
        S.家族 += 1; clampAttr('家族');
        notes.push('父辈在城里留过几层熟识，外出谋工不至全凭陌生脸');
      }
      if (S.家传书香 > 0 && !S.识字) {
        S.识字 = true; S.识字进度 = Math.max(1, S.识字进度);
        notes.push('家里剩下的一点书香，让你做雇工时起码看得懂工账和契字');
      }
      if (S.亦贾亦儒底子 > 0) notes.push('这一房早知道挣工食也得给家里留后手，你入行时会更留心把现钱和手艺一起攒住');
      if (isCollateralCarry(carryOver) && notes.length) notes.push('只是这一房经旁支接祧后，可借的旧门路已薄一层，终究还得靠你自己续上');
    } else if (routeKey === 'apprentice' && !S._apprenticeLegacyApplied) {
      S._apprenticeLegacyApplied = true;
      if (S.城里门路 > 0 && S.学徒合同 === '未议') {
        S.学徒合同 = '说合中';
        S.学徒信任 = Math.max(S.学徒信任, S.城里门路);
        notes.push('父辈留下的城里熟识先替你把求师推到了说合中');
      }
      if (S.商路门路 > 0) {
        S.学徒授艺度 = Math.max(S.学徒授艺度, 1);
        notes.push('家里认得一点商路门道，你认货记账不再完全白手起家');
      }
      if (S.家传手艺 > 0) {
        S.学徒历练 = Math.max(S.学徒历练, 1);
        notes.push('父辈留下的一层手艺，让你守店看活时不至完全手生');
      }
      if (S.家传书香 > 0 && !S.识字) {
        S.识字 = true; S.识字进度 = Math.max(1, S.识字进度);
        notes.push('家里还有一点书香底子，你抄单认货时更容易上手');
      }
      if (S.亦贾亦儒底子 > 0) {
        S.学徒信任 = Math.max(S.学徒信任, 1);
        notes.push('这一房早就见过“先学门道、再谈供读”的走法，师门看你也更像是来认真续路子的');
      }
      if ((S.承继定位 || '').indexOf('次子循城外求') >= 0) {
        if (S.学徒合同 === '未议') S.学徒合同 = '说合中';
        S.学徒信任 = Math.max(S.学徒信任, 1);
        S.家族 += 1; clampAttr('家族');
        notes.push('这一房上一代就把你这一手留作“次子循城外求”，长兄先守着户里那摊事，你进城求师时少了一层家里拦着不放的掣肘');
      }
      if (isCollateralCarry(carryOver) && notes.length) notes.push('只是你这一支经旁支接祧后，师门和城里旧识能借到的情分终究比本支薄一层');
    } else if (routeKey === 'merchant' && !S._merchantLegacyApplied) {
      S._merchantLegacyApplied = true;
      if (S.商路门路 > 0) {
        S.账房进度 = Math.max(S.账房进度, 1);
        S.商信誉 = Math.max(S.商信誉, S.商路门路);
        notes.push('父辈留下的商路旧识与账面门道，让你一上来就能看懂些账、认得些人');
      }
      if (S.城里门路 > 0) {
        S.识货进度 = Math.max(S.识货进度, 1);
        notes.push('父辈在城里留过熟识，你进号落脚、认牙行都少走几步弯路');
      }
      if (S.家传书香 > 0 && !S.识字) {
        S.识字 = true; S.识字进度 = Math.max(2, S.识字进度);
        notes.push('屋里剩下的旧书和识字家风，让你不至于做个全然不识字的跑腿');
      }
      if (S.亦贾亦儒底子 > 0) {
        S.账房进度 = Math.max(S.账房进度, 1);
        S.家族 += 1; clampAttr('家族');
        notes.push('这一房早已习惯商路反哺、供读分工，你既会跑路，也更知道怎样把现钱送回家里');
      }
      if (S.供读底子 > 0) notes.push('父辈留过供读专账的老规矩，你更知道要把哪几手现钱另划出来，不和日常花销混在一处');
      if ((S.承继定位 || '').indexOf('长兄续商') >= 0) {
        S.商信誉 = Math.max(S.商信誉, 1);
        notes.push('这一房原就是“长兄续商、次子另起一手”的格局：你若再走商，起手就默认要在长兄旧号旁另续一支门路');
      }
      if (isCollateralCarry(carryOver) && notes.length) notes.push('只是你这一房是旁支续起，旧商路与亦贾亦儒的余绪都只剩薄薄一层，还得靠这一代重新坐实');
    } else if (routeKey === 'civilExam' && !S._examLegacyApplied) {
      S._examLegacyApplied = true;
      if (S.家传书香 > 0 && !S.识字) {
        S.识字 = true; S.识字进度 = Math.max(2, S.识字进度);
        notes.push('父辈留下的旧书与家学，让你少时就识得些字');
      }
      if (S.家传书香 > 1) {
        S.文章火候 = Math.max(S.文章火候, 1);
        S.保结进度 = Math.max(S.保结进度, 1);
        notes.push('父辈遗下的师承与书香，使你这一代赴考资格和起步火候都更顺一层');
      }
      if (S.商路门路 > 0) {
        S.保结进度 = Math.max(S.保结进度, 1);
        notes.push('商路上的旧识未必识文，却更容易替你递人情、补几层说合门路');
      }
      if (S.亦贾亦儒底子 > 0) {
        S.供读压力 = Math.max(0, S.供读压力 - 1);
        S.家族 += 1; clampAttr('家族');
        notes.push('这一房已有亦贾亦儒的旧念头，家里对先供几年书这条路不算全然陌生，供读压力也轻了一线');
      }
      if (S.供读底子 > 0) notes.push('上一代确曾另划供读专账，这一代走举业时，束脩纸墨的压力会在年终结算里先被缓上一线，但不会直接化成现银');
      if ((S.承继定位 || '').indexOf('次子候读') >= 0) {
        S.供读压力 = Math.max(0, S.供读压力 - 1);
        S.家族 += 1; clampAttr('家族');
        notes.push('这一房在上一代就把你这一手留成“次子候读”，长兄续号回钱的那层预期，会让这一代起手再少一线断供压力');
      }
      if ((S.承继定位 || '').indexOf('次子续读') >= 0) {
        S.供读压力 = Math.max(0, S.供读压力 - 1);
        S.家族 += 1; clampAttr('家族');
        notes.push('这一房上一代就把你这一手留作“次子续读”，长兄先守着户里那摊日常，你起手就少一层被拉回家计的压力');
      }
      if (isCollateralCarry(carryOver) && notes.length) notes.push('只是这一支经旁支接祧后，书香与旧识都比本支薄一层，保结与供读仍得你这一代重新坐实');
    }
    return notes;
  }
  function sideHustleProfile() {
    if (S.技艺 !== '无') return { gain: 400, mode: '自有手艺', effect: '手艺副业·铜钱+400' };
    if (S.家传手艺 > 0) return { gain: 220, mode: '家传手艺底子', effect: '凭家传手艺底子接零活·铜钱+220' };
    return { gain: 120, mode: '杂工', effect: '（无手艺·仅+120）' };
  }
  function currentLineageIsCollateral() {
    return (S.承嗣来路 || '').indexOf('旁支') >= 0;
  }
  function farmMarketCarryBonus() {
    var layers = Math.max(0, S.城里门路 || 0) + Math.max(0, S.商路门路 || 0);
    if (layers <= 0) return 0;
    var bonus = Math.min(120, layers * 40);
    if (currentLineageIsCollateral()) bonus = Math.max(20, bonus - 40);
    return bonus;
  }
  function farmSellPrice() {
    return (S._米价 === '高' ? 550 : 350) + farmMarketCarryBonus();
  }
  function farmCraftProfile() {
    if (S.技艺 !== '无') return {
      gain: 240,
      mode: '自有手艺',
      effect: '凭自有手艺接零活·铜钱+240·体魄-1',
      desc: '雨隙里替乡邻修具补器，挣几文现钱，也让自家农具顺手整一整。'
    };
    if (S.家传手艺 > 0) return {
      gain: 140 + Math.min(80, Math.max(0, S.家传手艺 - 1) * 40),
      mode: '家传手艺底子',
      effect: '凭家传手艺底子接零活·铜钱+' + (140 + Math.min(80, Math.max(0, S.家传手艺 - 1) * 40)) + '·体魄-1',
      desc: '田里空下一口气时，凭家里留过的那层手艺底子去修具补器，挣一点不靠收成的活钱。'
    };
    return null;
  }
  function wageOutworkProfile(pass) {
    pass = pass || 1;
    var layers = Math.max(0, S.城里门路 || 0);
    var bonus = 0;
    var familyCost = 1;
    var desc = '去邻县或市镇做活，现钱更多，但离乡更久，家里使唤不上你。';
    if (layers > 0) {
      bonus = Math.min(160, layers * 80);
      if (currentLineageIsCollateral()) bonus = Math.max(40, bonus - 40);
      else familyCost = 0;
      desc = currentLineageIsCollateral()
        ? '去邻县或市镇做活；上一代留过一点城里熟识，但这一房经旁支承接后，情分已比本支薄。'
        : '去邻县或市镇做活；上一代若在城里留过熟识，这一手外出就不必全靠陌生脸硬闯。';
    }
    var copper = 300 + bonus;
    var silver = 1;
    if (pass === 2) {
      copper = Math.max(180, copper - 120);
      silver = 0;
      desc += ' 这一程只算半季回流，钱比整季外出薄一些，但胜在能把前面定下的外路继续坐实。';
    }
    return {
      silver: silver,
      copper: copper,
      familyCost: familyCost,
      effect: (silver > 0 ? ('白银+' + silver + '·') : '') + '铜钱+' + copper + '·体魄-8' + (familyCost > 0 ? ('·家族-' + familyCost) : '·家族不减（旧识照应）'),
      desc: desc
    };
  }
  function wageMarriageOutworkProfile() {
    var base = wageOutworkProfile();
    var currentDoor = Math.max(0, S.城里门路 || 0);
    var cityDoor = Math.max(currentDoor, currentLineageIsCollateral() ? 1 : 1);
    if (!currentLineageIsCollateral() && currentDoor > 0) cityDoor = Math.max(cityDoor, Math.min(2, currentDoor));
    else cityDoor = Math.min(2, cityDoor);
    var copper = Math.max(180, base.copper - 80);
    var cityText = cityDoor > currentDoor ? '城里门路+1' : '城里门路坐实';
    var desc = currentDoor > 0
      ? (currentLineageIsCollateral()
        ? '先拿现银顶过这一程差役，再去邻县或市镇做活；旧识还剩一点，但这一房经旁支承接后，情分终究比本支薄。'
        : '先拿现银顶过这一程差役，再去邻县或市镇做活；旧工头与熟识还能替你把落脚与牙口稳上一线。')
      : '先把这一程差役用现银顶过去，再外出佣工攒回几手现钱；婚事不立刻成，只是带着外出工账往后拖。';
    return {
      silverCost: 1,
      copper: copper,
      familyCost: base.familyCost,
      cityDoor: cityDoor,
      effect: '白银-1·铜钱+' + copper + '·' + cityText + '·婚事推迟两年' + (base.familyCost > 0 ? ('·家族-' + base.familyCost) : '·家族不减（旧识照应）'),
      desc: desc
    };
  }
  function wageSkillProfile() {
    if (S.技艺 !== '无') return {
      progress: 0,
      cash: 180,
      learnNow: false,
      effect: '凭手艺铜钱+180',
      desc: '跟着师傅接些熟活，农闲也能靠木活换一点现钱。'
    };
    var step = 1;
    var cash = 0;
    var desc = '跟着师傅学木活/修具。头两年是攒进度，学成后农闲可换现钱。';
    if (S.家传手艺 > 0) {
      step = Math.min(2, 1 + S.家传手艺);
      if ((S.雇技进度 || 0) + step >= 2) cash = 80;
      desc = '跟着师傅学木活/修具；父辈留过一层手艺门路，这一手不只是在旁打杂，坐实后当年就能先挣几文熟活钱。';
    }
    return {
      progress: step,
      cash: cash,
      learnNow: ((S.雇技进度 || 0) + step) >= 2,
      effect: (S.家传手艺 > 0 ? ('家传底子带路·手艺进度+' + step) : ('手艺进度+' + step)) + (cash > 0 ? ('·坐实后铜钱+' + cash) : ''),
      desc: desc
    };
  }
  function wageBookkeepingProfile() {
    var copper = 180;
    var family = 1;
    var desc = '若你识字，可替雇主看账、抄单，比纯卖力气更值钱。';
    var tags = [];
    if (S.家传书香 > 0) {
      copper += 80;
      family += 1;
      tags.push('家传书香');
      desc = '若你识字，又承了家里的书香底子，看账抄单更容易被东家交给你。';
    }
    if (S.亦贾亦儒底子 > 0) {
      family += 1;
      tags.push('家里早习惯替家计留后手');
    }
    return {
      copper: copper,
      family: family,
      effect: '识字者铜钱+' + copper + '·家族+' + family + (tags.length ? ('（' + tags.join('·') + '）') : ''),
      desc: desc
    };
  }
  function wageHouseholdSupportProfile(seasonId) {
    var copperCost = seasonId === 'autumn' ? 140 : (seasonId === 'winter' ? 120 : 100);
    var familyGain = seasonId === 'summer' ? 4 : (seasonId === 'autumn' ? 3 : 2);
    var riceGain = seasonId === 'autumn' ? 1 : 0;
    return {
      copperCost: copperCost,
      familyGain: familyGain,
      riceGain: riceGain,
      effect: '铜钱-' + copperCost + '·家族+' + familyGain + (riceGain > 0 ? ('·存米+' + riceGain) : ''),
      desc: seasonId === 'autumn'
        ? '把半季挣回的一点现钱和米先带回家，秋收口粮便不至全压在父兄身上。'
        : (seasonId === 'summer'
          ? '青黄不接时先把一点现钱贴回家里，免得家中火头断得太紧。'
          : '把零碎挣头先贴回家里，让父兄知道你这一手不是只顾自己在外头混。')
    };
  }
  function wageMarketProfile(seasonId) {
    var copper = seasonId === 'autumn' ? 160 : (seasonId === 'winter' ? 120 : 100);
    var body = seasonId === 'summer' ? 2 : 1;
    if ((S.城里门路 || 0) > 0) copper += Math.min(80, (S.城里门路 || 0) * 40);
    return {
      copper: copper,
      body: body,
      effect: '铜钱+' + copper + '·体魄-' + body,
      desc: seasonId === 'winter'
        ? '趁冬闲替牙行、米行、脚店跑跑腿，把散碎活钱和市面消息一起摸回来。'
        : '趁集日替人搬运、跑脚、问价，挣点小钱，也把市面冷热摸得更清楚。'
    };
  }
  function wageReserveCorveeProfile() {
    return {
      copperCost: 180,
      effect: '铜钱-180·本年差役准备+1',
      desc: '先把年关差役钱留出一角，等真轮到本户时，不至两手一空。'
    };
  }
  function wageMendProfile(seasonId) {
    var copperCost = seasonId === 'winter' ? 100 : 80;
    var bodyGain = seasonId === 'winter' ? 5 : 3;
    var familyGain = seasonId === 'winter' ? 1 : 0;
    return {
      copperCost: copperCost,
      bodyGain: bodyGain,
      familyGain: familyGain,
      effect: '铜钱-' + copperCost + '·体魄+' + bodyGain + (familyGain > 0 ? ('·家族+' + familyGain) : ''),
      desc: seasonId === 'winter'
        ? '年关前先补棉袄、药钱和草鞋，身子顾住了，冬里这口气才不断。'
        : '买点药、补补鞋衣，把这一程磨出来的伤先压住。'
    };
  }

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

  function wageSeasonInfo(index) {
    var i = Math.max(1, Math.min(WAGE_SEASONS.length, index || 1)) - 1;
    return WAGE_SEASONS[i];
  }
  function wagePassLabel(index) {
    return (Number(index) || 1) >= 2 ? '下半程' : '上半程';
  }
  function wageHalfAmount(total, pass) {
    var whole = Math.max(0, Number(total) || 0);
    var first = Math.ceil(whole * 0.55);
    return (pass === 2) ? Math.max(0, whole - first) : first;
  }
  function wageHalfBody(total, pass) {
    var whole = Math.max(0, Number(total) || 0);
    var first = Math.max(1, Math.ceil(whole / 2));
    var second = Math.max(0, whole - first);
    return (pass === 2) ? second : first;
  }
  function pushWageSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年季务) S.本年季务 = [];
    if (S.本年季务.indexOf(tag) < 0) S.本年季务.push(tag);
  }
  function resetWageYearLedger() {
    S.工季 = 1;
    S.工段 = 1;
    S.本年雇约 = '未定';
    S.本年工食银 = 0;
    S.本年工食钱 = 0;
    S.本年口粮减免 = 0;
    S.本年帮家次数 = 0;
    S.本年短工次数 = 0;
    S.本年外出次数 = 0;
    S.本年看账次数 = 0;
    S.本年学艺次数 = 0;
    S.本年贴家次数 = 0;
    S.本年备役次数 = 0;
    S.本年季务 = [];
  }
  function apprenticeSeasonInfo(index) {
    var i = Math.max(1, Math.min(APPRENTICE_SEASONS.length, index || 1)) - 1;
    return APPRENTICE_SEASONS[i];
  }
  function apprenticeXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function pushApprenticeSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年学徒旬记) S.本年学徒旬记 = [];
    if (S.本年学徒旬记.indexOf(tag) < 0) S.本年学徒旬记.push(tag);
  }
  function resetApprenticeYearLedger() {
    S.学季 = 1;
    S.学旬 = 1;
    S.本年学徒说合 = 0;
    S.本年学徒守店 = 0;
    S.本年学徒学账 = 0;
    S.本年学徒帮家 = 0;
    S.本年学徒奔走 = 0;
    S.本年学徒歇养 = 0;
    S.本年学徒备役 = 0;
    S.本年学徒旬记 = [];
  }
  function merchantSeasonInfo(index) {
    var i = Math.max(1, Math.min(MERCHANT_SEASONS.length, index || 1)) - 1;
    return MERCHANT_SEASONS[i];
  }
  function merchantXunLabel(index) {
    var i = Math.max(1, Math.min(3, index || 1)) - 1;
    return XUN[i];
  }
  function pushMerchantSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年商路季务) S.本年商路季务 = [];
    if (S.本年商路季务.indexOf(tag) < 0) S.本年商路季务.push(tag);
  }
  function resetMerchantYearLedger() {
    S.商季 = 1;
    S.商段 = 1;
    S.本年商路坐店 = 0;
    S.本年商路跑单 = 0;
    S.本年商路认货 = 0;
    S.本年商路核账 = 0;
    S.本年商路催账 = 0;
    S.本年商路贴家 = 0;
    S.本年商路归乡 = 0;
    S.本年商路试贩 = 0;
    S.本年商路备役 = 0;
    S.本年商路歇养 = 0;
    S.本年商路季务 = [];
    S._merchantLockedTradeTable = null;
  }
  function examSeasonInfo(index) {
    var i = Math.max(1, Math.min(EXAM_SEASONS.length, index || 1)) - 1;
    return EXAM_SEASONS[i];
  }
  function pushExamSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年举业季务) S.本年举业季务 = [];
    if (S.本年举业季务.indexOf(tag) < 0) S.本年举业季务.push(tag);
  }
  function resetExamYearLedger() {
    S.举季 = 1;
    S.举段 = 1;
    S.读书方式 = '未定';
    S.读书成本档 = 0;
    S.本年下场 = false;
    S.本年馆课次数 = 0;
    S.本年半读次数 = 0;
    S.本年寄读次数 = 0;
    S.本年评文次数 = 0;
    S.本年保结次数 = 0;
    S.本年誊抄次数 = 0;
    S.本年归家次数 = 0;
    S.本年备役次数 = 0;
    S.本年将养次数 = 0;
    S.本年举业季务 = [];
  }

  // ── 农事：本旬天气与事件 ────────────────────────
  var curWeather, curEvents;
  function rollXun() {
    curWeather = pickWeighted(WEATHERS);
    curEvents = [];
    if (!S.已插秧 && xunIndex <= 2) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秧苗待插，立夏正是插秧时。错过则误农时、影响收成。' });
    if (S.已插秧 && xunIndex >= 2 && xunIndex < HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '禾苗生长中，需时时看水、除草。当前生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '。' });
    if (xunIndex === HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '夏至已过，稻谷成熟，正是收割之时！秋收之后便是<b>年终结账</b>：佃租照约要缴、全家口粮照吃，缴不出便得折银举债，甚至被夺佃——由不得你选。' });
    if (xunIndex === 3 && S.母出工) curEvents.push({ t: 'rel', tag: '[关系]', txt: '母亲腰痛加重。若这一旬去照护，可稳住她的身子（家族+4），否则她将无法帮工。' });
    S._米价 = (rand() < 0.5) ? '低' : '高';
    curEvents.push({ t: 'rand', tag: '[随机]', txt: '米行传来消息：今旬新米价走' + S._米价 + '。' + (S._米价 === '高' ? '若有余米，正是好价钱（1石≈550文）。' : '此时卖米不划算（1石≈350文），可压仓。') });
  }

  // 农事动作（eff = 显式点数标注）
  function availableActions() {
    var A = [];
    var sellPrice = farmSellPrice();
    var sellBonus = farmMarketCarryBonus();
    var craft = farmCraftProfile();
    if (xunIndex === HARVEST_XUN) {
      A.push({ id: 'harvest', name: '收割稻谷', cost: 2, eff: '体魄-6·得米按长势(1~7石)', desc: '召集人手抢收。收成取决于这一季的生长与天气。', can: S.已插秧, why: S.已插秧 ? '' : '未曾插秧，无可收' });
      A.push({ id: 'hire_harvest', name: '雇短工助收', cost: 1, money: 100, eff: '铜钱-100·收成+1石', desc: '花100文雇人，抢在天变前收完，减少损耗。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文' });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, eff: '体魄+6', desc: '养回体魄，收割季尤其耗人。', can: true });
    } else {
      A.push({ id: 'plant', name: '水田·插秧', cost: 2, eff: '体魄-4·生长+1·开启生长期', desc: '把秧插下，作物才进入生长期。越早插越好。', can: !S.已插秧, why: S.已插秧 ? '已插过秧' : '' });
      A.push({ id: 'hire_plant', name: '雇短工帮插秧', cost: 1, money: 80, eff: '铜钱-80·防暴雨烂秧', desc: '花80文抢在雨前插完，降低烂秧风险（需同旬插秧）。', can: !S.已插秧 && S.铜钱 >= 80, why: S.已插秧 ? '已插过秧' : (S.铜钱 < 80 ? '铜钱不足80文' : '') });
      A.push({ id: 'tend', name: '水田·看水除草', cost: 1, eff: '体魄-2·生长+1(喜雨+2·封顶12)', desc: '照料禾苗，本旬生长+1（好天气更佳）。', can: S.已插秧, why: S.已插秧 ? '' : '尚未插秧' });
      A.push({ id: 'garden', name: '菜圃·浇灌', cost: 1, eff: '体魄-1·满3旬存米+1石', desc: '侍弄时蔬，几旬后收一茬省口粮。', can: true });
      A.push({ id: 'care', name: '灶间·照护母亲', cost: 1, eff: '家族+4·母病时稳住帮工', desc: '照料家人，家族关系+；母病时可稳住她的身子。', can: true });
      A.push({ id: 'exchange', name: '里社·换工互助', cost: 1, eff: '家族+3·体魄-2', desc: '与邻里换工：这一旬帮人，日后人手紧时有人还工。', can: true });
      if (craft) {
        A.push({
          id: 'craft_side',
          name: '农闲·接零活',
          cost: 1,
          eff: craft.effect,
          desc: craft.desc,
          can: true
        });
      }
      A.push({
        id: 'sell',
        name: '市镇·米行卖米',
        cost: 1,
        eff: '存米-1·铜钱+' + sellPrice + (sellBonus > 0 ? '（旧门路问价）' : ''),
        desc: '卖1石存米换现钱。今旬米价' + (S._米价 || '?') + '。' + (sellBonus > 0
          ? ('父辈留下的市镇门路让你问价时少吃一点生，能多卖 ' + sellBonus + ' 文' + (currentLineageIsCollateral() ? '（只是旁支承接后旧识只剩薄一层）' : '') + '。')
          : ''),
        can: S.存米 >= 1,
        why: S.存米 >= 1 ? '' : '无米可卖'
      });
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
    if (st.next === null) startNextGeneration('establishment'); else enterPhase(st.next);
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
      h += '<span class="chip">佃田 <b>第' + S.农年 + '/' + FARM_YEARS + '</b>年</span>';
      h += '<span class="chip crop"><span class="g-dot ' + g.cls + '"></span>庄稼 <b>' + (g.planted ? g.label + ' ' + g.pct + '%' : '未插秧') + '</b></span>';
    } else if (phase === 'wage') {
      h += '<span class="chip">路线 <b>受雇谋生</b></span>';
      h += '<span class="chip">工年 <b>' + S.工年 + '/' + WAGE_YEARS + '</b></span>';
      h += '<span class="chip">工季 <b>' + wageSeasonInfo(S.工季 || 1).name + '·' + wagePassLabel(S.工段 || 1) + '</b></span>';
      h += '<span class="chip">雇身分 <b>' + S.雇身份 + '</b></span>';
    } else if (phase === 'apprentice') {
      h += '<span class="chip">路线 <b>入城学徒</b></span>';
      h += '<span class="chip">学年 <b>' + S.学年 + '/' + APPRENTICE_YEARS + '</b></span>';
      h += '<span class="chip">学程 <b>' + apprenticeSeasonInfo(S.学季 || 1).name + '·' + apprenticeXunLabel(S.学旬 || 1) + '</b></span>';
      h += '<span class="chip">学徒阶段 <b>' + S.学徒阶段 + '</b></span>';
    } else if (phase === 'merchant') {
      h += '<span class="chip">路线 <b>徽商学生意</b></span>';
      h += '<span class="chip">商年 <b>' + S.商年 + '/' + MERCHANT_YEARS + '</b></span>';
      h += '<span class="chip">商程 <b>' + merchantSeasonInfo(S.商季 || 1).name + '·' + merchantXunLabel(S.商段 || 1) + '</b></span>';
      h += '<span class="chip">商身分 <b>' + S.商身份 + '</b></span>';
    } else if (phase === 'civilExam') {
      h += '<span class="chip">路线 <b>读书应举</b></span>';
      h += '<span class="chip">举业 <b>' + S.举业年 + '/' + EXAM_YEARS + '</b>年</span>';
      h += '<span class="chip">举程 <b>' + examSeasonInfo(S.举季 || 1).name + '·' + wagePassLabel(S.举段 || 1) + '</b></span>';
      h += '<span class="chip">童试层级 <b>' + (S.生员身份 ? '生员' : ('第' + S.童试层级 + '层')) + '</b></span>';
    } else if (phase === 'family') {
      var sn = SOLAR[Math.max(0, Math.min(3, (S.家季 || 1) - 1))];
      h += '<span class="chip">阶段 <b>养家</b></span>';
      h += '<span class="chip">家年 <b>' + (S.家年 || 1) + '</b></span>';
      h += '<span class="chip">家程 <b>' + sn + '</b></span>';
      h += '<span class="chip">妻室 <b>' + (S.妻室 ? '已娶' : '未娶') + '</b></span>';
      h += '<span class="chip">子嗣 <b>' + S.子数 + '</b>男' + S.女数 + '女</span>';
    } else if (phase === 'childhood') {
      h += '<span class="chip">识字 <b>' + (S.识字 ? '已启蒙' : '未识字') + '</b></span>';
      h += '<span class="chip">技艺 <b>' + S.技艺 + '</b></span>';
    } else if (phase === 'establishment') {
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

    // 轨迹可见化：用于人工复核“立身→成家→当户→养老→死亡→重开”的闭环是否在同一程里真实跑通。
    // 仅用 title tooltip 展示，不额外占版面；数字显式，便于截图对照。
    h += '<span class="chip" title="' + escapeHtml(phaseTraceLabel(14)) + '">轨迹 <b>' + (phaseTrace || []).length + '</b>步</span>';
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
      h += '<div class="commit"><button id="btn-next">' + (xunIndex >= HARVEST_XUN ? (S.农年 < FARM_YEARS ? '年终结账 · 缴租嚼用当差 →' : '末年结账 · 步入成家 →') : '进入下一旬 →') + '</button></div>';
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

  function isOnce(id) { return ['plant', 'hire_plant', 'care', 'craft_side', 'harvest', 'hire_harvest', 'rest', 'exchange'].indexOf(id) >= 0; }

  function narrative() {
    if (xunIndex === 0) return generation > 1
      ? ('你是<span class="em">陈阿二</span>（第' + generation + '代），江南某县民籍' + currentInheritanceRole(carryOver) + '。上一代结清后，这一房手里还剩<span class="em">' + S.田亩 + '亩田、' + S.存米 + '石米、' + S.白银 + '两银</span>；你如今接着这一房的旧账继续往下活。若仍走留乡佃田，这一季能缴租后剩几何，全看你如何安排这有限的人手与光阴。')
      : '你是<span class="em">陈阿二</span>，江南某县民籍佃农之子，十六岁成丁。父兄承了祖业薄田，你分得<span class="em">' + S.田亩 + '亩水田</span>与口粮，向本村地主佃田耕作。这一季从插秧到秋收，能落下多少米、缴完租还剩几何，全看你如何安排这有限的人手与光阴。';
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
        case 'craft_side':
          var craft = farmCraftProfile();
          if (craft) {
            S.铜钱 += craft.gain;
            S.体魄 -= 1;
            S.最近农闲营生层级 = craft.mode;
            S.最近农闲营生收益 = craft.gain;
            log.push(['农闲接零活：' + (craft.mode === '自有手艺' ? '凭自有手艺' : '凭家传手艺底子') + '挣得 ' + craft.gain + ' 文（体魄-1）', 'good']);
          }
          break;
        case 'sell':
          var price = farmSellPrice();
          var bonus = farmMarketCarryBonus();
          S.存米 -= 1; S.铜钱 += price;
          log.push(['卖米1石，米价' + S._米价 + '，得 ' + price + ' 文' + (bonus > 0 ? '（旧门路问价多卖 ' + bonus + ' 文）' : ''), 'good']); break;
        case 'rest': S.体魄 += 6; log.push(['歇息养身，体魄+6', 'good']); break;
        case 'harvest': didHarvest = true; S.体魄 -= 6; S.农事历练 += 1; break;
        case 'hire_harvest': S.铜钱 -= p.money; hiredHarvest = true; log.push(['雇短工助收，付 ' + p.money + ' 文（铜钱-100）', 'bad']); break;
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
    var luck = Math.floor(rand() * 3) - 1; base += luck;
    if (luck > 0) reason += '，年景好'; else if (luck < 0) reason += '，年景欠佳';
    if (base < 0) base = 0;
    return { mi: base, reason: reason };
  }

  function nextXun() {
    if (_yearEndNext) { afterYearEnd(); return; } // 年终结账面板 → 续耕/成家
    resolved = null; picks = [];
    xunIndex += 1;
    if (xunIndex >= TOTAL_XUN) { endSeason(); return; }
    rollXun();
    renderStage(); renderStatus(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 农事一年结束 → 强制结算佃约义务（租/口粮/赋役/债息），再决定续耕或步入成家
  // 这些义务外生于玩家的行动点选择：不是"选了才缴"，而是"到期照缴，缴不出就折银举债/夺佃"。
  function endSeason() {
    var before = snapshot();
    var log = [];
    var 银价 = 550; // 1石米折银占位（文/石，用于折银缴租）

    // ① 佃租：照约必缴（制度义务，非可选）
    if (S.存米 >= S.租额石) {
      S.存米 -= S.租额石;
      log.push(['〔佃租〕按约缴租 ' + S.租额石 + ' 石，佃约了讫（存米-' + S.租额石 + '）', 'bad']);
    } else {
      var 欠 = S.租额石 - S.存米;
      var 缴 = S.存米;
      S.存米 = 0;
      // 不足部分折银举债抵租
      S.负债银 += 欠; // 每欠1石米折银约1两举债（占位）
      log.push(['〔佃租〕存米仅 ' + 缴 + ' 石，不足租额 ' + S.租额石 + ' 石；欠 ' + 欠 + ' 石折银举债抵租（负债银+' + 欠 + '）', 'bad']);
      if (rand() < RENT_SEIZE_P) {
        S.田亩 = Math.max(1, S.田亩 - 1);
        S.家族 -= 6;
        log.push(['〔夺佃〕两年欠租，地主收回佃田 1 亩、乡里失信（田亩-1、家族-6）——制度性风险，不是你的无能', 'bad']);
      } else {
        log.push(['〔宽限〕地主念佃约旧情，暂缓夺佃，但债已挂在账上', 'warn']);
      }
    }

    // ② 全家口粮：照吃不误（制度/生理义务）
    if (S.存米 >= YEAR_KOULIANG) {
      S.存米 -= YEAR_KOULIANG;
      log.push(['〔口粮〕全家一年嚼用 ' + YEAR_KOULIANG + ' 石（存米-' + YEAR_KOULIANG + '）', 'bad']);
    } else {
      var 缺 = YEAR_KOULIANG - S.存米;
      var 补钱 = 缺 * 银价;
      log.push(['〔口粮〕存米不足嚼用，缺 ' + 缺 + ' 石', 'bad']);
      S.存米 = 0;
      if (S.铜钱 >= 补钱) { S.铜钱 -= 补钱; log.push(['沽米补口粮，付 ' + 补钱 + ' 文（铜钱-' + 补钱 + '）', 'bad']); }
      else { S.负债银 += 缺; S.体魄 -= 6; log.push(['无钱沽米，举债糊口并饿了肚子（负债银+' + 缺 + '、体魄-6）', 'bad']); }
    }

    // ③ 里甲赋役：概率佥派，外生强制
    if (rand() < CORVEE_P) {
      var 免 = S.识字;
      if (免 && S.铜钱 >= 200) { S.铜钱 -= 200; log.push(['〔赋役〕本甲轮派差役，识字应吏、纳银代役 200 文脱身（铜钱-200）', 'warn']); }
      else if (S.白银 >= 1) { S.白银 -= 1; log.push(['〔赋役〕本甲轮派差役，纳银 1 两代役（白银-1）', 'bad']); }
      else { S.体魄 -= 8; S.家族 -= 3; log.push(['〔赋役〕本甲轮派差役，无银代役只得亲身应役，误了农时（体魄-8、家族-3）', 'bad']); }
    }

    // ④ 旧债滚息
    if (S.负债银 > 0) {
      var 息 = Math.ceil(S.负债银 * DEBT_RATE);
      S.负债银 += 息;
      log.push(['〔债息〕旧债 ' + (S.负债银 - 息) + ' 两滚息 ' + 息 + ' 两（负债银→' + S.负债银 + '）', 'bad']);
    }

    clampAttr('体魄'); clampAttr('家族');
    var comment;
    if (S.负债银 > 0) comment = '缴租、嚼用、当差之后，账上还挂着 ' + S.负债银 + ' 两债——佃农一遇歉年便是如此，债滚债最是磨人。';
    else if (S.存米 >= 3) comment = '这一年经营得法，缴租、嚼用、当差之后仓中尚有 ' + S.存米 + ' 石余粮，可安稳过冬。';
    else comment = '勉强温饱，缴租嚼用之后所剩无多。一分耕耘一分收成，看天亦看人。';
    recordEntry('第 ' + S.农年 + ' 农年·年终结账（缴租/口粮/赋役/债息）', before, comment);

    // 把强制结算显示给玩家（并保持台账"存米 A→B"连续），再由续耕/成家按钮推进
    var after = snapshot();
    var moreYear = (S.农年 < FARM_YEARS);
    var rh = '<div class="resolve"><h4>第 ' + S.农年 + ' 农年 · 年终结账（照约强制）</h4>';
    log.forEach(function (l) { rh += '<div class="line ' + (l[1] === 'warn' ? 'good' : l[1]) + '">· ' + l[0] + '</div>'; });
    rh += '<div class="line" style="margin-top:.4rem">· ' + comment + '</div>';
    rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">守恒：白银 ' + before.白银 + '→' + after.白银 + ' ｜ 铜钱 ' + before.铜钱 + '→' + after.铜钱 + ' ｜ 存米 ' + before.存米 + '→' + after.存米 + (S.负债银 > 0 ? ' ｜ 负债 ' + S.负债银 + '两' : '') + '</div>';
    rh += '</div>';
    resolved = rh;
    _yearEndNext = moreYear ? 'newyear' : 'marriage';
    xunIndex = HARVEST_XUN; // 让 renderStage 显示"结账续耕"按钮
    renderStage(); renderStatus(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 年终结账面板之后：续下一农年 或 步入成家
  function afterYearEnd() {
    resolved = null; picks = [];
    var nx = _yearEndNext; _yearEndNext = null;
    if (nx === 'newyear') {
      S.农年 += 1; S.年龄 = 16 + (S.农年 - 1);
      startFarmYear();
    } else {
      enterPhase('marriage');
    }
  }

  // 开一个新的农年：重置旬与庄稼，保留三币种/负债/田亩等跨年账
  function startFarmYear() {
    xunIndex = 0; picks = []; resolved = null;
    S.秧苗进度 = 0; S.已插秧 = false; S.菜圃进度 = 0; S.母出工 = true;
    recordEntry('第 ' + S.农年 + ' 农年·春耕开账（' + S.年龄 + '岁）', snapshot(),
      '又是一年立夏。' + (S.负债银 > 0 ? '债还挂在账上（负债 ' + S.负债银 + ' 两），这一年得多挣些米还债、缴租。' : '这一年仍要缴租 ' + S.租额石 + ' 石、供全家嚼用，能落下多少全看安排。'));
    rollXun(); renderStatus(); renderStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (childStage === 0 && childRound === 0) narr = '你降生在江南一户民籍佃农家，<span class="em">排行次子</span>。这户有薄田 ' + S.田亩 + ' 亩、存米 ' + S.存米 + ' 石。' +
      (generation > 1 && carryOver ? ('这一手不是凭空重置，而是沿上一手结清后的家底接着长：' + inheritedCarryNote(carryOver)) : '') +
      '往后十几年，你一天天长大，家里也一年年在耕、在缴租、在吃饭——你的每一样活计，都掺进这本家计账里。';
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
      var deficit = -S.存米; S.存米 = 0; S.负债银 += Math.ceil(deficit / 3); S.家族 -= 4;
      log.push(['存米见底，青黄不接只得借贷度荒：负债+' + Math.ceil(deficit / 3) + '两、家族-4', 'bad']);
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
    var via = composeLineageSource(S.承嗣来路 || '本支次子承继', '弟妹接续');
    S._childDied = true;
    S._carry = {
      白银: S.白银, 存米: Math.max(0, S.存米), 铜钱: S.铜钱, 田亩: S.田亩, 负债银: Math.max(0, S.负债银 || 0), 家族: Math.max(20, S.家族 - 4),
      父辈路线: S.父辈路线 || '未定',
      承嗣来路: via,
      家传书香: S.家传书香 || 0,
      城里门路: S.城里门路 || 0,
      商路门路: S.商路门路 || 0,
      家传手艺: S.家传手艺 || 0,
      亦贾亦儒底子: S.亦贾亦儒底子 || 0,
      供读底子: S.供读底子 || 0
    };
    log.push(['幼殇于' + st.name + '（' + st.age + '岁）——依 Coale-Demeny 模型(出生预期寿命≈30岁)，约半数孩子活不到二十岁。这不是你的过错，是那个时代的真实概率。本户田产由弟妹接续。', 'bad']);
  }

  function nextChildRound() {
    if (S._childDied) { startNextGeneration('childhood'); return; }
    childResolved = null; childPicks = [];
    var st = CHILD_STAGES[childStage];
    if (childRound < st.rounds - 1) {
      childRound += 1; rollChildRound();
      renderChildhood(); renderStatus(); renderLedger();
    } else if (childStage < CHILD_STAGE_N - 1) {
      childStage += 1; childRound = 0; S.年龄 = CHILD_STAGES[childStage].age; rollChildRound();
      renderChildhood(); renderStatus(); renderLedger();
    } else {
      enterEstablishment();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function routeBaseSummary() {
    var 底子 = [];
    if (S.识字) 底子.push('略识文字（记账、核账、投师都不吃亏）');
    if (S.技艺 !== '无') 底子.push('有手艺傍身（乱世多一条退路）');
    if (S.农事历练 >= 3) 底子.push('农活扎实');
    if (S.家务历练 >= 3) 底子.push('家务麻利');
    if (generation > 1 && carryOver) {
      if (isCollateralCarry(carryOver)) 底子.push('这一房是旁支接祧起家（门路比本支更薄一层）');
      if (isSiblingCarry(carryOver)) 底子.push('这一手是弟妹接续前账起家（旧门路没有被洗回空白）');
      if (S.负债银 > 0) 底子.push('家里还背着旧债（起手更紧）');
    }
    inheritedCarryTags(carryOver).forEach(function (x) { 底子.push(x); });
    return 底子;
  }

  // 幼年结束 → 十六成丁，先进入立身分叉
  function enterEstablishment() {
    phase = 'establishment';
    S.年龄 = 16; S.身份 = '民籍·' + ((generation > 1 && carryOver) ? currentInheritanceRole(carryOver) : '次子') + '待立身'; S.路线 = '未立身';
    picks = []; resolved = null; lifePicks = []; curStage = stageEstablishment();
    tracePhase('enter:establishment');
    var 底子 = routeBaseSummary();
    var 起步口径 = (S._startMode === 'childhood')
      ? '幼年既过，成丁立身。'
      : '从十六成丁起算，先立身分路。';
    recordEntry('十六成丁·立身开账', snapshot(), 起步口径 +
      (generation > 1 ? ('这一代沿上一代真实传承快照起步：田' + S.田亩 + '亩、存米' + S.存米 + '石、白银' + S.白银 + '两。') : '') +
      (底子.length ? '这些年攒下：' + 底子.join('、') + '。' : '这些年不曾攒下特别的底子，只识些寻常农事。'));
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 立身走佃田路 → 十六成丁，步入佃田三农年（沿用旬循环）
  function enterFarm() {
    phase = 'farm'; S.年龄 = 16; S.身份 = '民籍·佃农子'; S.路线 = '留乡佃田'; S.农年 = 1; picks = []; resolved = null; curStage = null;
    var inherited = (S.农年 === 1) ? applyRouteInheritance('farm') : [];
    tracePhase('route:farm');
    recordEntry('立身分路·留乡佃田', snapshot(), '你没去城里，也没再继续读书，而是留在乡里，接下这几亩水田，准备靠一双手和九旬光阴吃饭。' + (inherited.length ? ' 父辈留下的余绪在田上也不是全无用处：' + inherited.join('；') + '。' : ''));
    rollXun(); renderStatus(); renderStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 立身走受雇路 → 十六成丁，步入受雇谋生三工年
  function enterWage() {
    phase = 'wage';
    if (S._advanceWageYear) {
      S.工年 += 1; S._advanceWageYear = false; S._advanceWageSeason = false; resetWageYearLedger();
    } else if (S._advanceWageSeason) {
      if ((S.工段 || 1) === 1) {
        S.工段 = 2;
      } else {
        S.工季 = Math.min(WAGE_SEASONS.length, (S.工季 || 1) + 1);
        S.工段 = 1;
      }
      S._advanceWageSeason = false;
    } else if (!S.工季 || S.工季 < 1) {
      resetWageYearLedger();
    }
    S.年龄 = 16 + (S.工年 - 1);
    S.身份 = '民籍·雇工子';
    S.路线 = '受雇长工/短工';
    var inherited = (S.工年 === 1) ? applyRouteInheritance('wage') : [];
    picks = []; resolved = null; lifePicks = [];
    curStage = stageWage();
    if (S.工年 === 1) tracePhase('route:wage');
    if (S.工年 === 1) recordEntry('立身分路·受雇谋生', snapshot(), '你没去守那几亩佃田，而是去乡里和市镇寻工：靠体魄、识字和一点手艺底子，先把工食挣出来。' + (inherited.length ? ' 父辈承下来的余绪在这里先起了作用：' + inherited.join('；') + '。' : ''));
    else if (S.工季 === 1 && (S.工段 || 1) === 1) recordEntry('第 ' + S.工年 + ' 工年·春忙开账', snapshot(), '上一工年已了，这一年改按“春忙→夏忙→秋收→冬闲”四季、每季再分上下两程过账；工食、口粮、差役、补贴家里与旧债不再只在年末一把糊过去。');
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 立身走学徒路 → 十六成丁，步入入城学徒三学年
  function enterApprentice() {
    phase = 'apprentice';
    if (S._advanceApprenticeYear) {
      S.学年 += 1; S._advanceApprenticeYear = false; S._advanceApprenticeStep = false; resetApprenticeYearLedger();
    } else if (S._advanceApprenticeStep) {
      if ((S.学旬 || 1) >= 3) {
        S.学季 = Math.min(APPRENTICE_SEASONS.length, (S.学季 || 1) + 1);
        S.学旬 = 1;
      } else {
        S.学旬 = (S.学旬 || 1) + 1;
      }
      S._advanceApprenticeStep = false;
    } else if (!S.学季 || S.学季 < 1) {
      resetApprenticeYearLedger();
    }
    S.年龄 = 16 + (S.学年 - 1);
    S.身份 = '民籍·商铺学徒';
    S.路线 = '入城学徒';
    var inherited = (S.学年 === 1) ? applyRouteInheritance('apprentice') : [];
    picks = []; resolved = null; lifePicks = [];
    curStage = stageApprentice();
    if (S.学年 === 1) tracePhase('route:apprentice');
    if (S.学年 === 1) recordEntry('立身分路·入城学徒', snapshot(), '你不留乡守田，也不先去打长短工，而是进城投商铺学徒：先求师、立据、守店、识货，看三年后能不能留店或另谋。' + (inherited.length ? ' 父辈留下的门路先替你垫了一步：' + inherited.join('；') + '。' : ''));
    else if ((S.学季 || 1) === 1 && (S.学旬 || 1) === 1) recordEntry('第 ' + S.学年 + ' 学年·投师季上旬开账', snapshot(), '这一学年不再按“一年一把过账”，而是拆成投师季、坐店季、年关季三季九旬推进。你得把说合、守店、认账、归省、备差与去留，逐旬算在同一本账里。');
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 立身走商路 → 十六成丁，步入学生意三商年
  function enterMerchant() {
    phase = 'merchant';
    if (S._advanceMerchantYear) {
      S.商年 += 1; S._advanceMerchantYear = false; S._advanceMerchantSeason = false; resetMerchantYearLedger();
    } else if (S._advanceMerchantSeason) {
      if ((S.商段 || 1) >= 3) {
        S.商季 = Math.min(MERCHANT_SEASONS.length, (S.商季 || 1) + 1);
        S.商段 = 1;
      } else {
        S.商段 = (S.商段 || 1) + 1;
      }
      S._advanceMerchantSeason = false;
    } else if (!S.商季 || S.商季 < 1) {
      resetMerchantYearLedger();
    }
    S.年龄 = 16 + (S.商年 - 1);
    S.身份 = '民籍·随号学生意';
    S.路线 = '徽商式亦贾亦儒';
    var inherited = (S.商年 === 1) ? applyRouteInheritance('merchant') : [];
    picks = []; resolved = null; lifePicks = [];
    curStage = stageMerchant();
    if (S.商年 === 1) tracePhase('route:merchant');
    if (S.商年 === 1) recordEntry('立身分路·徽商学生意', snapshot(), '你决定投族叔商号学生意：先当伙计学认货、跑单、看账，再看能否挣出反哺家中的现钱。' + (inherited.length ? ' 上一代留下的商路余绪先替你开了个口：' + inherited.join('；') + '。' : ''));
    else if ((S.商季 || 1) === 1 && (S.商段 || 1) === 1) recordEntry('第 ' + S.商年 + ' 商年·春开路上旬开账', snapshot(), '这一商年不再按“一年一把过账”，而是拆成春开路、夏坐店、秋试手、冬清账四季、每季三旬推进。认货、跑单、催账、试贩、贴家、差役准备与补衣买药，都要在同一年里逐旬配平。');
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 立身走举业路 → 十六成丁，步入三举业年
  function enterCivilExam() {
    phase = 'civilExam';
    if (S._advanceExamYear) {
      S.举业年 += 1; S._advanceExamYear = false; S._advanceExamSeason = false; resetExamYearLedger();
    } else if (S._advanceExamSeason) {
      if ((S.举段 || 1) === 1) {
        S.举段 = 2;
      } else {
        S.举季 = Math.min(EXAM_SEASONS.length, (S.举季 || 1) + 1);
        S.举段 = 1;
      }
      S._advanceExamSeason = false;
    } else if (!S.举季 || S.举季 < 1) {
      resetExamYearLedger();
    }
    S.年龄 = 16 + (S.举业年 - 1);
    S.身份 = S.生员身份 ? '民籍·生员' : '民籍·读书子';
    S.路线 = '读书应举';
    var inherited = (S.举业年 === 1) ? applyRouteInheritance('civilExam') : [];
    picks = []; resolved = null; lifePicks = [];
    curStage = stageCivilExam();
    if (S.举业年 === 1) tracePhase('route:civilExam');
    if (S.举业年 === 1) recordEntry('立身分路·读书应举', snapshot(), '你把家中有限的银钱、纸墨与人情先压到读书上：供读不等于录取，只意味着这一户先把资源让给你。' + (inherited.length ? ' 父辈留下的书香与旧门路，先替你省了几步白手起家的折腾：' + inherited.join('；') + '。' : ''));
    else if ((S.举季 || 1) === 1 && (S.举段 || 1) === 1) recordEntry('第 ' + S.举业年 + ' 举业年·春课上半程开账', snapshot(), '这一举业年不再按“整年四点一次结账”推进，而是拆成春课、夏课、秋试、冬清账四季、每季上下两程。束脩纸墨、保结、盘缠、抄写补贴、回家缓家计与差役小账，都要在同一年里逐程配平。');
    renderStatus(); renderLifeStage(); renderLedger();
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
    if (st.shock !== false) rollShock(log); // 外部冲击：外生于玩家选择，一程一掷
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
    var prevPhase = phase;
    phase = p; picks = []; resolved = null; lifePicks = [];
    if (p === 'farmRoute' || p === 'farm') { enterFarm(); return; }
    else if (p === 'wage') { enterWage(); return; }
    else if (p === 'apprentice') { enterApprentice(); return; }
    else if (p === 'merchant') { enterMerchant(); return; }
    else if (p === 'civilExam') { enterCivilExam(); return; }
    else if (p === 'establishment') { enterEstablishment(); return; }
    else if (p === 'marriage') { S.年龄 = currentLifeProfile().marriageAge; curStage = stageMarriage(); }
    else if (p === 'family') {
      var life = currentLifeProfile();
      // 初入“养家”时，把节奏清零：从成家之后的第一年春起算。
      if (prevPhase !== 'family') { S.家年 = 1; S.家季 = 1; S.本年家备役 = 0; S.本年家季务 = []; }
      var base = (S._marriageAtAge != null ? S._marriageAtAge : life.marriageAge) + 1;
      S.年龄 = base + Math.max(0, (S.家年 || 1) - 1);
      curStage = stageFamily();
    }
    else if (p === 'household') { S.年龄 = currentLifeProfile().householdAge; curStage = stageHousehold(); }
    else if (p === 'elder') { S.年龄 = currentLifeProfile().elderAge; curStage = stageElder(); }
    else if (p === 'death') { S.年龄 = S._deathAge || 58; curStage = stageDeath(); }
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 阶段卡通用渲染：叙事 + 事件 + 选项（每项显式点数/概率）
  function restartIdentityLabel() {
    // “死亡→传承→下一代重开”是闭环验收点：按钮文案必须与真实承继一致，避免把独子/过继误写成“次子”。
    if (phase === 'childhood') return '';
    var sons = S.子数 || 0;
    var ord = S._heirOrdinal || (sons > 1 ? 2 : 1);
    if (sons <= 0) return '旁支继子身份';
    if (sons === 1) return '独子身份';
    if (ord === 2) return '次子身份';
    return '长子身份';
  }
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
      else label = isLast ? ('以' + restartIdentityLabel() + ' · 递归重开新一生 →') : (st.nextLabel || '继续 →');
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
    var fertility = childbearingProfile();
    var sons = rollProb(fertility.sonsTable);
    var daus = rollProb(fertility.dausTable);
    S.子数 = sons; S.女数 = daus; S.存米 = Math.max(0, S.存米 - sons - daus); // 养育耗口粮
    log.push(['生育结算（' + fertility.label + '·概率）：育成 ' + sons + ' 男 ' + daus + ' 女，养育耗存米 ' + (sons + daus) + ' 石。' + fertility.note, sons > 0 ? 'good' : 'bad']);
    if (sons === 0) log.push(['暂无育成男丁——夭折是概率非惩罚，日后或需过继立嗣', 'bad']);
  }

  // ══════════ 外部冲击系统（外生风险，非玩家选择触发）══════════
  // 现代版要求：外部冲击 + 多系统冲突。冲击由概率 roll 决定"是否发生"，
  // 受灾轻重再读取共享状态账（存粮/负债/家族/识字）——攒了底子的人扛得住，
  // 月光又负债的人被同一场灾荒打垮。体现"风险转移/路径依赖"，非道德评分。
  var SHOCKS = [
    {
      k: '大水', w: 10, tag: '[天灾]',
      txt: '梅雨连月，圩田溃堤，晚稻淹没大半。',
      hit: function (log) {
        var loss = Math.min(S.存米, 2 + (S.田亩 >= 4 ? 1 : 0));
        S.存米 -= loss;
        var buffer = S.家族 >= 60 ? '（宗族义仓匀出些许，未至断炊）' : '';
        log.push(['大水冲田：损存米' + loss + '石' + buffer, 'bad']);
        if (S.存米 <= 0 && S.家族 < 60) { S.负债银 += 1; log.push(['青黄不接，借贷度荒：负债+1两', 'bad']); }
      }
    },
    {
      k: '大疫', w: 9, tag: '[疫病]',
      txt: '时疫流行，一村十病七八，你也染上寒热。',
      hit: function (log) {
        var base = 8; if (S.体魄 >= 70) base = 5; // 底子好扛得住
        S.体魄 -= base;
        var cure = S.铜钱 >= 400 ? 400 : 0;
        if (cure) { S.铜钱 -= cure; S.体魄 += 4; log.push(['时疫染身：体魄-' + base + '；有现钱请医买药-' + cure + '文，体魄回+4', 'bad']); }
        else log.push(['时疫染身：体魄-' + base + '（无钱请医，只能硬扛）', 'bad']);
      }
    },
    {
      k: '加派', w: 9, tag: '[苛政]',
      txt: '朝廷加征辽饷/杂办，里长挨户摊派。',
      hit: function (log) {
        var levy = S.识字 ? 300 : 500; // 识字者能据则力争，少被虚加
        var pay = Math.min(S.铜钱, levy); S.铜钱 -= pay;
        var rest = levy - pay; if (rest > 0) { S.存米 = Math.max(0, S.存米 - 1); }
        log.push(['官府加派：铜钱-' + pay + (rest > 0 ? '文、折米-1石' : '文') + (S.识字 ? '（识字据则力争，少被虚加）' : '（不识字，任凭吏胥填数）'), 'bad']);
      }
    },
    {
      k: '米贵', w: 8, tag: '[市场]',
      txt: '邻省歉收，米价腾贵，籴米者叫苦，粜米者得利。',
      hit: function (log) {
        if (S.存米 >= 3) { S.铜钱 += 400; S.存米 -= 1; log.push(['米价腾贵：家有余粮，粜米1石得铜钱+400（市场两面性）', 'good']); }
        else { S.铜钱 = Math.max(0, S.铜钱 - 300); log.push(['米价腾贵：家无余粮，籴米度日铜钱-300（同一场行情，穷者更苦）', 'bad']); }
      }
    },
    {
      k: '兵燹', w: 5, tag: '[兵祸]',
      txt: '流寇/过境兵扰，四乡骚动，人人自危。',
      hit: function (log) {
        var loot = Math.min(S.白银, 1); S.白银 -= loot; S.体魄 -= 4;
        var save = S.家族 >= 65 ? '（合族结寨自保，损失稍轻）' : '';
        log.push(['兵燹过境：白银-' + loot + '两、体魄-4' + save, 'bad']);
      }
    },
    { k: '太平', w: 30, tag: '[太平]', txt: '这些年风调雨顺，未逢大灾。', hit: function (log) { log.push(['这一程未逢外部大灾，是难得的太平岁月。', 'good']); } }
  ];
  // 在每个人生阶段结算后掷一次外部冲击（外生于玩家选择）
  function rollShock(log) {
    var s = pickWeighted(SHOCKS);
    var pctMap = {}; var sum = SHOCKS.reduce(function (a, b) { return a + b.w; }, 0);
    var pct = Math.round(s.w / sum * 100);
    log.push(['〔外部冲击·概率约' + pct + '%〕' + s.txt + '（外生事件，与你的选择无关，但你攒下的底子决定扛不扛得住）', s.k === '太平' ? 'good' : 'bad']);
    s.hit(log);
    clampAttr('体魄'); clampAttr('家族');
    return s.k;
  }

  // 人生阶段"共享状态账"面板：把幼年至今攒下的底子显性摆出来，让玩家看清路径依赖
  function lifeDossier(extra) {
    var tags = [];
    tags.push(S.识字 ? '识字·已启蒙' : '识字·无');
    tags.push(S.技艺 !== '无' ? '手艺·傍身' : '手艺·无');
    tags.push('农事历练 ' + S.农事历练);
    if (S.雇工历练) tags.push('雇工历练 ' + S.雇工历练);
    if (S.学徒历练) tags.push('学徒历练 ' + S.学徒历练);
    if (S.商历练) tags.push('商路历练 ' + S.商历练);
    if (S.文章火候) tags.push('文章火候 ' + S.文章火候);
    if (S.委托营生 !== '无') {
      var rentTag = S.委托租谷 > 0 ? '·年租谷+' + S.委托租谷 : '';
      if ((S.委托待收租谷 || 0) > 0) rentTag += '·待收租谷' + S.委托待收租谷;
      tags.push('分家后' + S.委托营生 + rentTag);
    }
    if (S.商路供读银 > 0) tags.push('供读专账 ' + S.商路供读银 + '两');
    tags.push('家族声望 ' + S.家族);
    var h = '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">📇 共享状态账 · 这本账一路带到底</span>' +
      '<span class="cb-val">体魄 ' + S.体魄 + '</span></div>' +
      '<div class="cb-tip">' + tags.join(' ｜ ') + (extra ? ('<br>' + extra) : '') + '</div></div>';
    return h;
  }

  // ── 立身分叉（16岁）：五路入口（佃田/受雇/学徒/商路/举业）──
  function stageEstablishment() {
    var 底子 = routeBaseSummary();
    var startNote = generation > 1
      ? '这一代不再沿用初代那张“固定父快照”，而是直接吃上一代真实死亡结算留下的期初账。五条路仍共享同一个过去，但这个“过去”现在来自真实传承，不再回滚。'
      : '你要求的是“同一父快照、16岁再分路”。这里不再默认锁死进佃田，而是在同一户、同一年、同一份家底下分叉。现在五条路都接了首版循环：佃田、受雇、学徒、商路、举业。';
    var startEvents = generation > 1 ? [
      { t: 'rel', tag: '[承继]', txt: '这一代的起点不是白纸：父辈传下多少薄田、多少债、多少门路，都会先落在你身上。' },
      { t: 'rand', tag: '[立身]', txt: inheritedCarryTags(carryOver).length ? ('父辈留下的：' + inheritedCarryTags(carryOver).join('、') + '。这些都不会直接变成现银，却会改写你五条路的入口。') : '这一房只剩薄产，几乎没有额外门路可倚。你的五条路更接近再次白手起家。' }
    ] : [
      { t: 'rel', tag: '[立身]', txt: '兄将承祖业多数薄田，你这次子分不到够养一家的田。你的路，从来不可能只是“照旧过下去”。' },
      { t: 'rand', tag: '[制度]', txt: '五条路并无高下：耕、雇、学、商、举都是真实入口。区别只在它们如何读取同一份时间、身体、现金与他人意愿。' }
    ];
    return {
      title: '立身 · 五路分叉', label: '立身',
      next: null, nextLabel: '走上这条路 →',
      note: startNote,
      narrative: currentEstablishmentLead(底子),
      dossier: function () {
        return lifeDossier(currentFamilySnapshotText());
      },
      events: startEvents,
      prompt: '十六成丁，你先走哪条路？',
      choices: [
        {
          name: '路径一 · 留乡佃田',
          gain: '直接进入三农年佃田循环（16→18岁）',
          note: '接下几亩水田，照约缴租、吃自己种出的米。你已经玩过这条路，但现在它是五路之一，而不是默认唯一入口。' + (generation > 1 ? ' ' + routeEntryHook('farm', carryOver) : ''),
          run: function (log) {
            curStage.next = 'farmRoute'; curStage.nextLabel = '下田立身 →'; S.路线 = '留乡佃田';
            log.push(['你决定留在乡里，先靠佃田吃饭：这一路已接入完整三农年循环。', 'good']);
          }
        },
        {
          name: '路径二 · 受雇长工 / 短工',
          gain: '进入三工年受雇循环（16→18岁）',
          note: '不守这几亩田，去替经营型地主和市镇东家出力挣工食。长工有管饭和年工银，短工日结快但失工频繁；现已拆成“一年四季、每季上下两程”的更细年内节奏。' + (generation > 1 ? ' ' + routeEntryHook('wage', carryOver) : ''),
          run: function (log) {
            curStage.next = 'wage'; curStage.nextLabel = '去谋第一年工食 →'; S.路线 = '受雇长工/短工';
            log.push(['你决定先把工食挣出来：这一路已接入“三工年 × 每季上下两程”的细化循环。', 'good']);
            if (S.识字) log.push(['你略识文字，日后做长工核账、做书手看单都不至吃大亏。', 'good']);
            if (S.技艺 !== '无') log.push(['你有手艺傍身，农闲时可做副业，比纯卖力气多一条退路。', 'good']);
          }
        },
        {
          name: '路径三 · 入城学徒',
          gain: '进入三学年学徒循环（16→18岁）',
          note: '先接商铺学徒主干：求师、作保、立据、守店、学货、留店/被辞/退师。条款细节仍为玩法占位，不冒充明代精确契约。' + (generation > 1 ? ' ' + routeEntryHook('apprentice', carryOver) : ''),
          run: function (log) {
            curStage.next = 'apprentice'; curStage.nextLabel = '去投第一年学徒 →'; S.路线 = '入城学徒';
            log.push(['你决定先去城里投师：这一路已接入首版三学年循环。', 'good']);
            if (S.识字) log.push(['你略识文字，学记账、认货、抄单会比纯跑腿更快上手。', 'good']);
          }
        },
        {
          name: '路径四 · 徽商式亦贾亦儒',
          gain: '进入三商年学生意循环（16→18岁）',
          note: '首版先做“随号学生意 + 少量带本试贩 + 年终结账”，把未回款、反哺银、原籍赋役先接进运行时。' + (generation > 1 ? ' ' + routeEntryHook('merchant', carryOver) : ''),
          run: function (log) {
            curStage.next = 'merchant'; curStage.nextLabel = '去学生意 →'; S.路线 = '徽商式亦贾亦儒';
            log.push(['你决定投族叔商号学生意：这一路已接入首版三商年循环。', 'good']);
            if (S.识字) log.push(['你识字，核账抄单会比纯跑腿更值钱。', 'good']);
          }
        },
        {
          name: '路径五 · 读书应举',
          gain: '进入三举业年循环（四季上下两程）',
          note: '这一路现已拆成“春课→夏课→秋试→冬清账”四季、每季上下两程：把束脩纸墨、保结资格、盘缠、抄写补贴、家计与身体小账都放回一年里，不再整年一把糊过。' + (generation > 1 ? ' ' + routeEntryHook('civilExam', carryOver) : ''),
          run: function (log) {
            curStage.next = 'civilExam'; curStage.nextLabel = '去走第一年举业 →'; S.路线 = '读书应举';
            log.push(['你决定先把这一户有限的资源压到读书上：这一路现已按四季上下两程推进，不再是一年点一下就结账。', 'good']);
          }
        }
      ]
    };
  }

  // ── 受雇谋生（16-18岁）：四季循环，冬闲清全年总账 ──
  function stageWage() {
    var age = 16 + (S.工年 - 1);
    var season = wageSeasonInfo(S.工季 || 1);
    var wagePass = S.工段 || 1;
    var isBackHalf = wagePass === 2;
    var isWinter = season.id === 'winter';
    var nextSeason = wageSeasonInfo(Math.min(WAGE_SEASONS.length, (S.工季 || 1) + 1));
    var baseShort = season.id === 'spring' ? 180 : season.id === 'summer' ? 220 : season.id === 'autumn' ? 320 : 140;
    var baseShortBody = season.id === 'winter' ? 1 : 2;
    var seasonalShort = wageHalfAmount(baseShort, wagePass);
    var seasonalShortBody = wageHalfBody(baseShortBody, wagePass);
    var homeRice = season.id === 'autumn' ? 1 : 0;
    var homeFamily = season.id === 'summer' ? 3 : 4;
    var outwork = wageOutworkProfile(wagePass);
    var skill = wageSkillProfile();
    var bookkeeping = wageBookkeepingProfile();
    var support = wageHouseholdSupportProfile(season.id);
    var market = wageMarketProfile(season.id);
    var reserve = wageReserveCorveeProfile();
    var mend = wageMendProfile(season.id);
    var seasonalEvents = {
      spring: [
        { t: 'rel', tag: '[雇主]', txt: '春忙前后正是签长工、抢旺工的时候。东家和地主都在挑人，不是谁先开口谁就一定能接到。' },
        { t: 'rand', tag: '[农时]', txt: '家里也正缺手：你在外多挣一程，父兄就少一程帮手；你若回家搭手，现钱便少一截。' }
      ],
      summer: [
        { t: 'rel', tag: '[身体]', txt: '伏夏最耗人，长工、挑担、看账、学活都在逼着你拿体魄换一点更稳的明天。' },
        { t: 'rand', tag: '[市面]', txt: '青黄不接时，饭口与现钱都发紧。城里有零活，乡里也有家计，谁都不是白白等你。' }
      ],
      autumn: [
        { t: 'rel', tag: '[家里]', txt: '秋收最盼人手。你若还在外抢工，家里口粮和家族声气都要重新掂量。' },
        { t: 'rand', tag: '[旺工]', txt: '秋收旺工钱最厚，但也是最伤身的一程；挣得多，不等于这一手就没有后账。' }
      ],
      winter: [
        { t: 'rel', tag: '[年关]', txt: '冬闲看似松一口气，实际上是把讨工银、修具、盘账、回家过年全挤在一起。' },
        { t: 'rand', tag: '[清账]', txt: '这一季结完还要过全年总账：口粮、差役、债息都不会因为你辛苦过就自动消失。' }
      ]
    };
    var extraEvent = isBackHalf
      ? { t: 'rand', tag: '[细账]', txt: '这一程不只是再多挣一点钱：还得管差役钱要不要先留、家里柴米要不要先贴、衣鞋药钱要不要先补。' }
      : { t: 'rel', tag: '[排工]', txt: '上半程先定主路：是守长差、抢旺工、外出一趟，还是先把一门手艺或识字活坐实。' };
    var events = seasonalEvents[season.id].slice();
    events.push(extraEvent);
    return {
      title: '受雇谋生 · 第' + S.工年 + '工年·' + season.name + '·' + wagePassLabel(wagePass), label: '佣工第' + S.工年 + '年·' + season.name + '·' + wagePassLabel(wagePass),
      next: 'wage', nextLabel: isWinter
        ? (isBackHalf ? (S.工年 < WAGE_YEARS ? '翻到下一工年春忙上半程 →' : '带着三年工账去议亲 →') : ('转入冬闲下半程 →'))
        : (isBackHalf ? ('转入' + nextSeason.name + '上半程 →') : ('转入' + season.name + '下半程 →')),
      ap: 2, commitLabel: (isWinter && isBackHalf) ? '结这一程并清年账 →' : '结这一程工食细账 →',
      note: '这一路现已从“全年一点式结算”继续拆成“每季上下两程”：上半程先定主工路，下半程再结家计、身体、差役与市面小账。一年不再只点四下，仍保持三币种守恒，不写成功分。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一工年走到<span class="em">' + season.name + '·' + wagePassLabel(wagePass) + '</span>。' + season.actionLead + (isBackHalf ? '这半程不只看挣不挣钱，还得把家里、身子和年关后手一起摊开。' : '这半程先把主要工路定下来，后半程再看这些安排压出什么后账。') + ' 你这一程有 <span class="em">2 个行动点</span>。',
      dossier: function () {
        var seasonTags = (S.本年季务 && S.本年季务.length) ? S.本年季务.join('、') : '尚未坐实';
        return lifeDossier('当前工季=' + season.name + '·' + wagePassLabel(wagePass) + '｜本年雇约=' + S.本年雇约 + '｜本年工食银=' + S.本年工食银 + '两｜本年工食钱=' + S.本年工食钱 + '文｜口粮减免=' + S.本年口粮减免 + '石｜贴家=' + S.本年贴家次数 + '次｜备差=' + S.本年备役次数 + '次｜已坐实=' + seasonTags + '。');
      },
      events: events,
      prompt: isBackHalf ? '这一程怎么把细账收住？（分配 2 点）' : '这一程怎么排主工路？（分配 2 点）',
      actions: function () {
        var A = [];
        var longEff = (season.id === 'spring')
          ? '年终白银+2·管饭减口粮1石·体魄-' + (isBackHalf ? 2 : 4)
          : (season.id === 'summer')
            ? '守年长工差·口粮减免1石·体魄-' + (isBackHalf ? 2 : 3)
            : (season.id === 'autumn')
              ? '守年长工秋收·口粮减免1石·体魄-' + (isBackHalf ? 2 : 4)
              : '守年长工到年关·年终工银坐实·体魄-' + (isBackHalf ? 1 : 2);
        var longDesc = (season.id === 'spring')
          ? (isBackHalf ? '春忙下半程继续把这份长工差守稳：饭口是稳些了，但人也真被拴住了。' : '先把这一年最稳的饭碗签下来：银要到年关才真正落袋，但平时管饭能先替家里省一口。')
          : (season.id === 'summer')
            ? (isBackHalf ? '伏夏后半程还是要守长差：这时最能看出“稳饭口”到底值不值这身汗。' : '人既在长工名下，这一季就得把苦力和饭口一并扛住。')
            : (season.id === 'autumn')
              ? (isBackHalf ? '秋收下半程仍是最缺人的时候；能不能再扛一程，常常就决定年关手里多一把现钱还是多一身伤。' : '秋收是长工最累也最不能缺人的时候；守住这程，年终那笔银才更像是真的。')
              : (isBackHalf ? '年关到了，把这一年的长工细账与口粮账都收稳：不只是讨工银，还得看这一身骨头还剩多少。' : '年关到了，把这一年的长工账坐实：该守的差、该讨的工银，都得在这季扛完。');
        if (!isBackHalf) {
          A.push({
            id: 'w_long',
            name: season.id === 'spring' ? '签一年长工' : (S.本年雇约 === '年长工' ? '先守这半程长差' : '转去守地主长差'),
            cost: 2,
            eff: longEff,
            desc: longDesc,
            can: true,
            once: true
          });
          A.push({
            id: 'w_short',
            name: season.id === 'winter' ? '冬前先接零工' : (season.id === 'autumn' ? '先抢秋收短工' : '先抢这一程短工'),
            cost: 1,
            eff: '铜钱+' + seasonalShort + '·体魄-' + seasonalShortBody,
            desc: season.id === 'winter'
              ? '年关前先接一点零碎活路，先让锅底火不断。'
              : (season.id === 'autumn'
                ? '秋收上半程先抢一轮旺工，钱来得快，也更先伤身。'
                : '上半程先把这一口现钱抢到手，后半程再看怎么收尾。'),
            can: true
          });
          A.push({ id: 'w_out', name: season.id === 'winter' ? '趁冬前外出一趟' : '外出佣工一程', cost: 2, eff: outwork.effect, desc: outwork.desc, can: true, once: true });
          A.push({ id: 'w_skill', name: season.id === 'winter' ? '冬前修具学活' : '随工学一门活', cost: 1, eff: skill.effect, desc: skill.desc, can: true });
          A.push({ id: 'w_book', name: season.id === 'winter' ? '先替东家盘年账' : '识字帮看账', cost: 1, eff: bookkeeping.effect, desc: bookkeeping.desc, can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
          A.push({ id: 'w_home', name: season.id === 'autumn' ? '回家搭半程抢收' : '回家帮父看田', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? '·存米+1' : ''), desc: season.id === 'autumn' ? '秋收上半程先回家搭一把，虽少挣一手现钱，但米缸与家里脸面都稳些。' : '先回家帮父兄看田一程，少挣工钱，换家里气顺与后手。', can: true, once: true });
          A.push({ id: 'w_rest', name: '歇一歇养身', cost: 1, eff: '体魄+5', desc: '年轻也不是铁打的，别把身子先熬坏。', can: true });
        } else {
          A.push({ id: 'w_short', name: season.id === 'winter' ? '再接一口冬闲零工' : (season.id === 'autumn' ? '再抢半程旺工' : '再接半程短工'), cost: 1, eff: '铜钱+' + seasonalShort + '·体魄-' + seasonalShortBody, desc: season.id === 'autumn' ? '这一程再抢一口旺工，把秋收现钱尽量拢厚。' : '前头工路既定，这一程再补一口现钱。', can: true });
          A.push({ id: 'w_market', name: season.id === 'winter' ? '趁集跑腿问价' : '趁集跑脚问价', cost: 1, eff: market.effect, desc: market.desc, can: true, once: true });
          A.push({ id: 'w_send', name: season.id === 'autumn' ? '把钱粮先贴回家' : '把一点现钱贴回家', cost: 1, eff: support.effect, desc: support.desc, can: S.铜钱 >= support.copperCost, why: S.铜钱 >= support.copperCost ? '' : ('铜钱不足' + support.copperCost + '文'), once: true });
          A.push({ id: 'w_duty', name: '先留一角差役钱', cost: 1, eff: reserve.effect, desc: reserve.desc, can: S.铜钱 >= reserve.copperCost, why: S.铜钱 >= reserve.copperCost ? '' : ('铜钱不足' + reserve.copperCost + '文'), once: true });
          A.push({ id: 'w_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: mend.effect, desc: mend.desc, can: S.铜钱 >= mend.copperCost, why: S.铜钱 >= mend.copperCost ? '' : ('铜钱不足' + mend.copperCost + '文'), once: true });
          A.push({ id: 'w_skill', name: season.id === 'winter' ? '冬闲再学一手活' : '再挪一口气学活', cost: 1, eff: skill.effect, desc: skill.desc, can: true });
          A.push({ id: 'w_book', name: season.id === 'winter' ? '年关帮看账收尾' : '再替人核一轮账', cost: 1, eff: bookkeeping.effect, desc: bookkeeping.desc, can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
          A.push({ id: 'w_rest', name: '歇一歇养身', cost: 1, eff: '体魄+5', desc: '让这一程别只剩下硬熬。', can: true });
        }
        return A;
      },
      settle: function (log) {
        var tookLong = false, tookOut = false, shortCount = 0, didEarn = false;
        var hadLongBeforeWinter = S.本年雇约 === '年长工';
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'w_long':
              tookLong = true; didEarn = true;
              S.雇身份 = '长工'; S.雇工历练 += 1;
              S.本年雇约 = '年长工';
              S.本年口粮减免 += 1;
              S.体魄 -= (season.id === 'spring' ? (isBackHalf ? 2 : 4) : season.id === 'autumn' ? (isBackHalf ? 2 : 4) : season.id === 'summer' ? (isBackHalf ? 2 : 3) : (isBackHalf ? 1 : 2));
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程长工' : '上半程长工'));
              if (season.id === 'spring') log.push([isBackHalf ? '春忙下半程仍守长工差：年关那 2 两工银还没到手，但这一口饭已真靠这身力气换出来。' : '春忙先把长工签下：银要到年关才真正落袋，但这口饭先稳了。', 'good']);
              else if (season.id === 'winter') log.push([isBackHalf ? '把年长工一路守到冬闲下半程：工银不再只是“说定的价”，这一年的饭口与力气终于换成了能结清的账。' : '冬前仍守在长差上：年关真正坐账前，还得再熬这一程。', 'good']);
              else log.push([isBackHalf ? ('这一季后半程仍守在长工差上：饭口更稳，人也更真切地被这条差路拴住。') : ('这一季先把长差守住：后半程还得继续把这条路扛完。'), 'good']);
              break;
            case 'w_short':
              shortCount += 1; didEarn = true;
              S.铜钱 += seasonalShort; S.本年工食钱 += seasonalShort; S.体魄 -= seasonalShortBody; S.雇工历练 += 1; S.本年短工次数 += 1;
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程短工' : '上半程短工'));
              log.push([season.name + (isBackHalf ? '下半程' : '上半程') + '短工一轮：铜钱+' + seasonalShort + '、体魄-' + seasonalShortBody + (season.id === 'winter' ? '（冬闲零工不断不了根本，只能先续锅火）' : '（日结快，但这一程一过就散）'), 'good']);
              break;
            case 'w_out':
              tookOut = true; didEarn = true;
              S.白银 += outwork.silver; S.铜钱 += outwork.copper; S.体魄 -= 8; S.家族 -= outwork.familyCost; S.雇身份 = '外出佣工';
              S.本年工食银 += outwork.silver; S.本年工食钱 += outwork.copper; S.本年外出次数 += 1; S.本年口粮减免 += 1;
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程外出' : '上半程外出'));
              log.push(['外出佣工：' + (outwork.silver > 0 ? ('白银+' + outwork.silver + '、') : '') + '铜钱+' + outwork.copper + '、体魄-8' + (outwork.familyCost > 0 ? ('、家族-' + outwork.familyCost) : '、家族不减') + (S.城里门路 > 0 ? '（城里旧识先替你照应了落脚与工头）' : '（离乡更久，家里使唤不上你）'), 'good']);
              break;
            case 'w_skill':
              S.本年学艺次数 += 1;
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程学活' : '上半程学活'));
              if (S.技艺 === '无') {
                S.雇技进度 += skill.progress;
                log.push(['随工学活：手艺进度+' + skill.progress + '（' + S.雇技进度 + '/2）' + (S.家传手艺 > 0 ? '，家传底子让你一上手就不是纯打杂' : ''), 'good']);
                if (S.雇技进度 >= 2) {
                  S.技艺 = '木活';
                  if (skill.cash > 0) { S.铜钱 += skill.cash; S.本年工食钱 += skill.cash; }
                  log.push(['手艺攒够两轮，学成一门木活——以后农闲可换钱', 'good']);
                  if (skill.cash > 0) log.push(['这年里因家传手艺门路先坐实，顺手又挣得熟活钱铜钱+' + skill.cash, 'good']);
                }
              } else {
                S.铜钱 += skill.cash; S.本年工食钱 += skill.cash;
                log.push(['凭手艺接点零活：铜钱+' + skill.cash, 'good']);
              }
              break;
            case 'w_book':
              S.铜钱 += bookkeeping.copper; S.家族 += bookkeeping.family;
              S.本年工食钱 += bookkeeping.copper; S.本年看账次数 += 1;
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程看账' : '上半程看账'));
              log.push(['识字帮看账：铜钱+' + bookkeeping.copper + '、家族+' + bookkeeping.family + (S.家传书香 > 0 ? '（家传书香让你更容易被交给账册与契字）' : '（会认字，工价就是比纯卖力气高一点）'), 'good']);
              break;
            case 'w_home':
              S.家族 += homeFamily; S.本年帮家次数 += 1;
              if (homeRice > 0) S.存米 += 1;
              pushWageSeasonTag(season.name + (isBackHalf ? '下半程帮家' : '上半程帮家'));
              log.push([season.id === 'autumn'
                ? ('回家帮父兄抢收：家族+' + homeFamily + '、存米+1（少挣一份旺工，但米缸与家里脸面都稳住了）')
                : ('回家帮父兄看田：家族+' + homeFamily + (homeRice > 0 ? '、存米+1' : '') + '（这一季少挣工钱，但家里稳些）'), 'good']);
              break;
            case 'w_market':
              didEarn = true;
              S.铜钱 += market.copper; S.体魄 -= market.body;
              pushWageSeasonTag(season.name + '市集跑脚');
              log.push(['趁集跑脚问价：铜钱+' + market.copper + '、体魄-' + market.body + ((S.城里门路 || 0) > 0 ? '（旧熟口让你接脚更快）' : ''), 'good']);
              break;
            case 'w_send':
              if (spendCopper(support.copperCost)) {
                S.家族 += support.familyGain; S.本年贴家次数 += 1;
                if (support.riceGain > 0) S.存米 += support.riceGain;
                pushWageSeasonTag(season.name + '贴补家用');
                log.push(['把一口现钱贴回家里：铜钱-' + support.copperCost + '、家族+' + support.familyGain + (support.riceGain > 0 ? ('、存米+' + support.riceGain) : '') + '。这钱不再在你手里，却让家里那口锅稳一点。', 'good']);
              } else {
                log.push(['想把现钱贴回家里，但这一程零碎支出已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'w_duty':
              if (spendCopper(reserve.copperCost)) {
                S.本年备役次数 += 1;
                pushWageSeasonTag(season.name + '先留差役钱');
                log.push(['先留下一角差役钱：铜钱-' + reserve.copperCost + '。这钱眼下看不见好处，只是防冬里忽然轮到本户时手忙脚乱。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一程铜钱已先被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'w_mend':
              if (spendCopper(mend.copperCost)) {
                S.体魄 += mend.bodyGain;
                if (mend.familyGain > 0) S.家族 += mend.familyGain;
                pushWageSeasonTag(season.name + '补衣买药');
                log.push(['补鞋衣、备药钱：铜钱-' + mend.copperCost + '、体魄+' + mend.bodyGain + (mend.familyGain > 0 ? ('、家族+' + mend.familyGain) : '') + '。', 'good']);
              } else {
                log.push(['想先把衣鞋药钱补上，但这一程铜钱不够，只能先硬熬。', 'bad']);
              }
              break;
            case 'w_rest':
              S.体魄 += 5;
              log.push(['歇一歇养身：体魄+5', 'good']);
              break;
          }
        });
        if (!didEarn && season.id !== 'winter') {
          S.家族 -= 1;
          log.push(['这一季没真正挣出工食，家里对你“这一手到底值不值”难免更紧一分（家族-1）。', 'bad']);
        }
        if (season.id === 'winter' && isBackHalf) {
          if (hadLongBeforeWinter) {
            S.白银 += 2; S.本年工食银 += 2;
            log.push(['〔年工银〕这一年长工到年关结清：白银+2。到这一步，春天那份“说定了的价”才真正落袋。', 'good']);
          } else if (tookLong) {
            log.push(['〔长工〕你这季才临时转去守地主长差，能保下一手饭口，却还不足以把整年长工银按足坐实。', 'bad']);
          }
          var mouths = Math.max(1, 2 - Math.min(1, S.本年口粮减免 > 0 ? 1 : 0) - Math.min(1, S.本年贴家次数 > 0 ? 1 : 0));
          if (S.存米 >= mouths) {
            S.存米 -= mouths;
            log.push(['〔口粮〕这一工年家中口粮计 ' + mouths + ' 石（存米-' + mouths + '）；长工管饭、外出少吃在家、以及半路贴补家里，都在这里显出差别。', 'bad']);
          } else {
            var lack = mouths - S.存米;
            S.存米 = 0;
            if (S.铜钱 >= lack * 350) {
              S.铜钱 -= lack * 350;
              log.push(['〔口粮〕家中米不够，只得籴米补口粮：铜钱-' + (lack * 350), 'bad']);
            } else {
              S.负债银 += lack;
              S.体魄 -= 4;
              log.push(['〔口粮〕工食补不上这一年的口粮缺口，只得举债糊口（负债+' + lack + '两、体魄-4）', 'bad']);
            }
          }
          if (rand() < 0.35) {
            if (S.本年备役次数 > 0) {
              log.push(['〔赋役〕先前留出的一角差役钱派上了用场，这一回没有再临时拆家里别的现钱。', 'good']);
            } else if (S.铜钱 >= 200) {
              S.铜钱 -= 200;
              log.push(['〔赋役〕本户轮到差役，拿铜钱200文找人顶上（铜钱-200）', 'bad']);
            } else {
              S.体魄 -= 6; S.家族 -= 2;
              log.push(['〔赋役〕无钱代役，只得亲身应付差役，误工伤身（体魄-6、家族-2）', 'bad']);
            }
          }
          if (S.负债银 > 0) {
            var oldDebt = S.负债银;
            var interest = Math.ceil(oldDebt * DEBT_RATE);
            S.负债银 += interest;
            log.push(['〔债息〕旧债 ' + oldDebt + ' 两滚息 ' + interest + ' 两（负债→' + S.负债银 + '）', 'bad']);
          }
          if ((S.本年工食银 + S.本年工食钱) <= 0) {
            S.家族 -= 3;
            log.push(['这一工年没真正挣出多少工食，家里难免把怨气都算到你这一路上（家族-3）。', 'bad']);
          } else if (S.本年雇约 === '年长工' && S.本年短工次数 >= 1) {
            log.push(['这一工年既有长工保底、又趁旺季多抢了短工，账面比“只守一头”更厚实。', 'good']);
          } else if (S.本年短工次数 >= 2) {
            log.push(['这一工年主要靠季节短工拼现钱，钱来得快，但每一文都更吃体魄。', 'good']);
          }
          if (S.本年贴家次数 > 0) log.push(['这一工年你有 ' + S.本年贴家次数 + ' 次把现钱贴回家里；这些钱不在你手里积着，却把家里那口气真续住了。', 'good']);
          curStage.next = (S.工年 < WAGE_YEARS) ? 'wage' : 'marriage';
          curStage.nextLabel = (S.工年 < WAGE_YEARS) ? '翻到下一工年春忙 →' : '带着三年工账去议亲 →';
          if (S.工年 < WAGE_YEARS) {
            S._advanceWageYear = true;
          } else {
            S.年龄 = 20;
          }
        } else {
          curStage.next = 'wage';
          curStage.nextLabel = isBackHalf ? ('转入' + nextSeason.name + '上半程 →') : ('转入' + season.name + '下半程 →');
          S._advanceWageSeason = true;
          if (tookLong && tookOut) {
            log.push(['这一季你一头守长工、一头又外出抢活，账是厚了，人也被撕得更紧。', 'good']);
          } else if (shortCount >= 1 && S.本年帮家次数 >= 1) {
            log.push(['这一季一边抢短工、一边还顾着家里，现钱和脸面都算勉强稳住。', 'good']);
          }
          if (isBackHalf && S.本年备役次数 > 0 && season.id !== 'winter') log.push(['这半程你还先留下一角差役钱：好处不立刻显，但到冬里能少一分手忙脚乱。', 'good']);
        }
        clampAttr('体魄'); clampAttr('家族');
      }
    };
  }

  // ── 入城学徒（16-18岁）：求师/立据/守店/去向 ──
  function stageApprentice() {
    var age = 16 + (S.学年 - 1);
    var season = apprenticeSeasonInfo(S.学季 || 1);
    var xun = S.学旬 || 1;
    var xunLabel = apprenticeXunLabel(xun);
    var isYearEnd = season.id === 'closing' && xun === 3;
    var nextSeason = apprenticeSeasonInfo(Math.min(APPRENTICE_SEASONS.length, (S.学季 || 1) + 1));
    var seasonalCounts = '本年说合=' + S.本年学徒说合 + '｜守店=' + S.本年学徒守店 + '｜学账=' + S.本年学徒学账 + '｜奔走=' + S.本年学徒奔走 + '｜帮家=' + S.本年学徒帮家;
    return {
      title: '入城学徒 · 第' + S.学年 + '学年·' + season.name + xunLabel, label: '学徒第' + S.学年 + '年',
      next: 'apprentice',
      nextLabel: isYearEnd
        ? (S.学年 < APPRENTICE_YEARS ? '翻到下一学年投师季上旬 →' : '带着这门去向去议亲 →')
        : (xun >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + apprenticeXunLabel(xun + 1) + ' →')),
      ap: 2, commitLabel: isYearEnd ? '了这一学年 →' : '了这一旬学徒 →',
      note: '学徒路现改成“每学年三季九旬”推进：投师季先跑说合/作保/立据，坐店季熬守店/跑街/认账，年关季把口粮、差役与去留一并结清。保证金、食宿、去留数额仍是玩法占位，不当作明代精确契约。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一学年走到<span class="em">' + season.name + xunLabel + '</span>。' + season.actionLead + '投师不是自动成功；立据不等于学成，学成也不等于准你留下。你这一旬有 <span class="em">2 个行动点</span>，要在说合、守店、学账、奔走、帮家、备差与养身之间取舍。',
      dossier: function () {
        return lifeDossier('立据≠学成≠出师；师傅收不收、留不留、准不准你转伙计，都是分开判的。当前：合同=' + S.学徒合同 + '｜阶段=' + S.学徒阶段 + '｜授艺度=' + S.学徒授艺度 + '｜信任=' + S.学徒信任 + '｜' + seasonalCounts + '。');
      },
      events: [
        { t: 'rel', tag: '[师傅]', txt: S.学徒合同 === '已立据' ? '字据立成后，师傅看的是你这一旬守不守得住、账看不看得明，不会因为你已经进店就自动一路留你。' : '师傅收徒先看年貌、门路、保人和手脚是不是稳当，不因你可怜或勤快自动点头。' },
        { t: 'rand', tag: '[店规]', txt: season.note + (isYearEnd ? ' 这一旬还要把口粮、差役、旧债与去留一并结账。' : ' 同一旬里，店里和家里往往同时来要你这双手。') }
      ],
      prompt: '这一旬怎么过？（分配 2 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'a_seek', name: season.id === 'opening' ? '托中人说合' : '再托人续问门路', cost: 1, eff: '合同推进·信任+1', desc: season.id === 'opening' ? '先去把门路问出来，让人家肯见你。' : '门路若还没坐实，就不能真把人和钱押进去。', can: S.学徒合同 !== '已立据', once: true });
        A.push({ id: 'a_bond', name: '请族邻作保', cost: 1, eff: '铜钱-80·作保到位', desc: '请人替你担保身家清白。没保也许能成，有保总更容易。', can: !S.学徒保人 && S.铜钱 >= 80, why: !S.学徒保人 ? (S.铜钱 >= 80 ? '' : '铜钱不足80文') : '已有保人', once: true });
        A.push({ id: 'a_sign', name: season.id === 'opening' ? '立投师字据' : '把投师字据补立', cost: 2, eff: '白银-1或铜钱-200·合同成立', desc: '没立据，求师都还只是意向。真要入店，就得把这笔成本掏出来。', can: S.学徒合同 !== '已立据' && (S.学徒合同 === '说合中' || S.学徒保人) && (S.白银 >= 1 || S.铜钱 >= 200), why: S.学徒合同 === '已立据' ? '已立据' : ((S.学徒合同 === '说合中' || S.学徒保人) ? ((S.白银 >= 1 || S.铜钱 >= 200) ? '' : '银钱不够立据') : '尚未说合或作保'), once: true });
        A.push({ id: 'a_drudge', name: season.id === 'closing' ? '应节守柜搬货' : '铺中杂役守店', cost: 1, eff: '学徒历练+1·信任+1·体魄-2', desc: season.id === 'closing' ? '年关前后店里最忙，站柜搬货最能看出你扛不扛得住。' : '看店、跑腿、搬货、招呼客人。这是人家看你靠不靠谱的第一关。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_learn', name: season.id === 'middling' ? '随师认货学账' : '盯账认货', cost: 1, eff: '授艺度+1·学徒历练+1', desc: '跟着看账认货，先学会不吃亏，再谈以后能不能留下。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_run', name: season.id === 'closing' ? '跟单跑街送货' : '替铺里跑街办货', cost: 1, eff: '学徒历练+1·奔走+1·体魄-2', desc: '替铺里跑街送货、问价、催小账，学的不是柜面，而是门路怎么跑。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_book', name: '替师抄账认字', cost: 1, eff: '授艺度+1·信任+1' + (S.识字 ? '·铜钱+40' : ''), desc: S.识字 ? '你认字，抄账核货更容易被交到手里。' : '不识字也能跟着认柜面常用字，只是难学得快。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据', once: true });
        A.push({ id: 'a_home', name: season.id === 'closing' ? '回乡归省帮父' : '回乡帮父应急', cost: 1, eff: '家族+3·存米+1', desc: '店里少上一旬工，家里却稳一些。', can: true, once: true });
        A.push({ id: 'a_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-60·年关差役更稳', desc: '先把一点现钱从手边扣出来，免得年关本户轮到差役时再临时拆账。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        A.push({
          id: 'a_keep', name: '第三年议留店', cost: 1, eff: '年末判留店去向', desc: '到了第三年，试着问问能不能留下做伙计。',
          can: isYearEnd && S.学年 === APPRENTICE_YEARS && S.学徒合同 === '已立据' && S.学徒授艺度 >= 2,
          why: isYearEnd ? (S.学年 === APPRENTICE_YEARS ? (S.学徒合同 === '已立据' ? (S.学徒授艺度 >= 2 ? '' : '授艺度至少要到2') : '尚未立据') : '要到第三年') : '只在第三年年关结去向',
          once: true
        });
        A.push({ id: 'a_shift', name: '第三年带门路投店工', cost: 1, eff: '年末判店铺做工去向', desc: '不求留本店，带着这三年的门道去别家店里找活路。', can: isYearEnd && S.学年 === APPRENTICE_YEARS && S.学徒合同 === '已立据', why: isYearEnd ? (S.学年 === APPRENTICE_YEARS ? (S.学徒合同 === '已立据' ? '' : '尚未立据') : '要到第三年') : '只在第三年年关结去向', once: true });
        A.push({ id: 'a_trade', name: '第三年跟货外跑试路', cost: 1, eff: '年末判随行商去向', desc: '借师门门路跟着跑一趟货，试试能不能转去学生意。', can: isYearEnd && S.学年 === APPRENTICE_YEARS && S.学徒合同 === '已立据', why: isYearEnd ? (S.学年 === APPRENTICE_YEARS ? (S.学徒合同 === '已立据' ? '' : '尚未立据') : '要到第三年') : '只在第三年年关结去向', once: true });
        A.push({ id: 'a_quit', name: '自请退师另谋', cost: 1, eff: '退师·沉没成本不退', desc: '若觉着再熬不值，就自己退下来，带着沉没成本另找路。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据', once: true });
        A.push({ id: 'a_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '别把身子先熬坏了。', can: true });
        return A;
      },
      settle: function (log) {
        var didContract = false, quit = false, askedKeep = false, askedShift = false, askedTrade = false, didEarn = false;
        var stepTag = season.name + xunLabel;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'a_seek':
              if (S.学徒合同 === '未议') S.学徒合同 = '说合中';
              S.本年学徒说合 += 1;
              S.学徒信任 += 1;
              pushApprenticeSeasonTag(stepTag + '说合');
              log.push(['托中人说合：先把门路问出来，学徒信任+1', 'good']);
              break;
            case 'a_bond':
              S.铜钱 -= 80; S.学徒保人 = true;
              pushApprenticeSeasonTag(stepTag + '作保');
              log.push(['请族邻作保：铜钱-80，保人到位', 'bad']);
              break;
            case 'a_sign':
              didContract = true;
              S.学徒合同 = '已立据';
              S.学徒阶段 = '学徒';
              pushApprenticeSeasonTag(stepTag + '立据');
              if (S.白银 >= 1) { S.白银 -= 1; S.学徒保证金银 += 1; log.push(['立投师字据：白银-1，合同立成', 'bad']); }
              else { S.铜钱 -= 200; S.学徒束脩文 += 200; log.push(['立投师字据：铜钱-200，合同立成', 'bad']); }
              break;
            case 'a_drudge':
              S.学徒历练 += 1; S.学徒信任 += 1; S.体魄 -= 2; S.本年学徒守店 += 1; didEarn = true;
              pushApprenticeSeasonTag(stepTag + '守店');
              log.push(['铺中杂役守店：学徒历练+1、信任+1、体魄-2', 'good']);
              break;
            case 'a_learn':
              S.学徒授艺度 += 1; S.学徒历练 += 1; S.本年学徒学账 += 1; didEarn = true;
              pushApprenticeSeasonTag(stepTag + '认货学账');
              log.push(['随师认货记账：授艺度+1、学徒历练+1', 'good']);
              break;
            case 'a_run':
              S.学徒历练 += 1; S.体魄 -= 2; S.本年学徒奔走 += 1; didEarn = true;
              if (S.学年 === APPRENTICE_YEARS) S.商历练 += 1;
              pushApprenticeSeasonTag(stepTag + '跑街办货');
              log.push(['替铺里跑街办货：学徒历练+1、奔走门路+1、体魄-2' + (S.学年 === APPRENTICE_YEARS ? '，第三年这层奔走还顺手垫了商路底子。' : '。'), 'good']);
              break;
            case 'a_book':
              S.学徒授艺度 += 1; S.学徒信任 += 1; S.本年学徒学账 += 1; didEarn = true;
              if (S.识字) {
                S.铜钱 += 40;
                log.push(['替师抄账认字：授艺度+1、信任+1、铜钱+40（会认字，柜上更肯把账册递到你手里）', 'good']);
              } else {
                log.push(['替师抄账认字：授艺度+1、信任+1（不识字也能跟着认柜面常用字，只是还难真摸到账本里层）', 'good']);
              }
              pushApprenticeSeasonTag(stepTag + '抄账认字');
              break;
            case 'a_home':
              S.家族 += 3; S.存米 += 1; S.本年学徒帮家 += 1;
              pushApprenticeSeasonTag(stepTag + '归省帮家');
              log.push(['回乡帮父应急：家族+3、存米+1', 'good']);
              break;
            case 'a_reserve':
              if (spendCopper(60)) {
                S.本年学徒备役 += 1;
                pushApprenticeSeasonTag(stepTag + '预留差役钱');
                log.push(['先留一角差役钱：铜钱-60。眼下看不见好处，只是把年关的忙乱先压下去一点。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'a_keep':
              askedKeep = true;
              log.push(['你试着开口议留店：年末看师傅愿不愿意留你。', 'good']);
              break;
            case 'a_shift':
              askedShift = true;
              log.push(['你放话想带门路去别家店投工：年末看能不能坐实这条去向。', 'good']);
              break;
            case 'a_trade':
              askedTrade = true;
              log.push(['你跟着跑一趟货路，想试试能不能转去学生意。', 'good']);
              break;
            case 'a_quit':
              quit = true;
              S.学徒阶段 = '退师'; S.学徒去向 = '归乡另谋';
              S.学徒信任 -= 1;
              log.push(['你自请退师：这几年沉没的人情和钱都不会退回来。', 'bad']);
              break;
            case 'a_rest':
              S.体魄 += 5; S.本年学徒歇养 += 1;
              pushApprenticeSeasonTag(stepTag + '歇养');
              log.push(['歇息养身：体魄+5', 'good']);
              break;
          }
        });

        if (!isYearEnd) {
          curStage.next = 'apprentice';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + apprenticeXunLabel(xun + 1) + ' →');
          S._advanceApprenticeStep = true;
          if (S.学徒合同 !== '已立据' && S.本年学徒说合 <= 0 && !didContract) log.push(['这一旬你还没把门路真正问开，学徒路仍停在门外。', 'bad']);
          if (S.学徒合同 === '已立据' && S.本年学徒守店 > 0 && S.本年学徒学账 > 0) log.push(['这一旬既在柜上熬杂役、也往账货里探了一手，学徒路才算不是空耗。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.学徒合同 === '已立据' && !quit) {
          if (S.学年 < APPRENTICE_YEARS) {
            var keepChance = Math.max(0.25, Math.min(0.90, 0.36 + S.学徒信任 * 0.05 + S.学徒授艺度 * 0.07 + Math.min(2, S.本年学徒守店) * 0.06 + Math.min(2, S.本年学徒学账) * 0.05));
            if (rand() > keepChance) {
              S.学徒阶段 = '被辞'; S.学徒去向 = '归乡';
              S.家族 -= 2;
              log.push(['〔去留〕师傅觉得你还不值继续留用，你被辞了出来（家族-2）。', 'bad']);
            } else {
              S.学徒阶段 = '学徒';
              log.push(['〔去留〕师傅愿继续把你留在店里熬下一年。', 'good']);
            }
          } else {
            var canKeepShop = S.学徒授艺度 >= 2;
            if (askedKeep && !canKeepShop) {
              log.push(['〔门槛〕授艺度未满2，师傅不肯留你直接坐伙计。', 'bad']);
            }
            var outChance = canKeepShop ? Math.max(0.15, Math.min(0.92, 0.18 + S.学徒授艺度 * 0.10 + S.学徒信任 * 0.06 + Math.min(2, S.本年学徒守店) * 0.06 + Math.min(2, S.本年学徒学账) * 0.05 + (askedKeep ? 0.10 : 0))) : 0;
            var shiftChance = Math.max(0.12, Math.min(0.84, 0.16 + S.学徒授艺度 * 0.08 + S.学徒历练 * 0.04 + Math.min(2, S.本年学徒守店) * 0.05 + (askedShift ? 0.12 : 0)));
            var tradeChance = Math.max(0.10, Math.min(0.82, 0.15 + S.学徒授艺度 * 0.06 + S.学徒历练 * 0.05 + Math.min(2, S.本年学徒奔走) * 0.07 + (S.识字 ? 0.06 : 0) + (askedTrade ? 0.12 : 0)));
            if (rand() < outChance) {
              S.学徒阶段 = '留店伙计'; S.学徒去向 = '留店伙计'; S.学徒历练 += 1; S.铜钱 += 200;
              log.push(['〔去向〕三年熬下来，师傅愿把你留下做伙计：铜钱+200。', 'good']);
            } else if (askedTrade && rand() < tradeChance) {
              S.学徒阶段 = '未出师'; S.学徒去向 = '随行商'; S.学徒历练 += 1; S.商历练 += 1; S.商信誉 += 1; S.铜钱 += 120;
              log.push(['〔去向〕本店没留你，但你借着师门门路转去跟货学生意：铜钱+120、商路历练+1。', 'good']);
            } else if (askedShift && rand() < shiftChance) {
              S.学徒阶段 = '未出师'; S.学徒去向 = '店铺做工'; S.学徒历练 += 1; S.铜钱 += 150;
              log.push(['〔去向〕虽未留原店，你还是带着门道去别家店里坐了店工：铜钱+150。', 'good']);
            } else {
              S.学徒阶段 = '未出师'; S.学徒去向 = quit ? '归乡另谋' : '归乡另谋';
              log.push(['〔去向〕三年下来仍未能留店，你带着学到的一点门道另找出路。', 'bad']);
            }
          }
        } else if (S.学徒合同 !== '已立据') {
          S.家族 -= 2;
          log.push(['这一年求师未成，家里难免觉得你白折腾了一年（家族-2）。', 'bad']);
        }

        var mouths = (S.学徒合同 === '已立据' && S.学徒阶段 !== '退师') ? 1 : 2;
        if (S.本年学徒帮家 > 0) mouths = Math.max(1, mouths - 1);
        if (S.存米 >= mouths) {
          S.存米 -= mouths;
          log.push(['〔口粮〕这一学年家中口粮计 ' + mouths + ' 石（存米-' + mouths + '）', 'bad']);
        } else {
          var lack = mouths - S.存米;
          S.存米 = 0;
          if (S.铜钱 >= lack * 350) {
            S.铜钱 -= lack * 350;
            log.push(['〔口粮〕家中米不够，籴米补口粮：铜钱-' + (lack * 350), 'bad']);
          } else {
            S.负债银 += lack;
            S.体魄 -= 4;
            log.push(['〔口粮〕学徒一年也照样要吃饭，银钱不够，只得举债（负债+' + lack + '两、体魄-4）', 'bad']);
          }
        }
        if (rand() < 0.30) {
          if (S.本年学徒备役 > 0) {
            log.push(['〔赋役〕先前留出的一角差役钱派上了用场，这一回没有再临时拆别的现钱。', 'good']);
          } else if (S.铜钱 >= 160) {
            S.铜钱 -= 160;
            log.push(['〔赋役〕本户轮到差役，家里拿铜钱160文找人顶上', 'bad']);
          } else {
            S.体魄 -= 5; S.家族 -= 2;
            log.push(['〔赋役〕无钱代役，学徒人在城里也躲不开家里的役账（体魄-5、家族-2）', 'bad']);
          }
        }
        if (S.负债银 > 0) {
          var oldDebt = S.负债银;
          var interest = Math.ceil(oldDebt * DEBT_RATE);
          S.负债银 += interest;
          log.push(['〔债息〕旧债 ' + oldDebt + ' 两滚息 ' + interest + ' 两（负债→' + S.负债银 + '）', 'bad']);
        }
        if ((S.本年学徒守店 + S.本年学徒学账 + S.本年学徒奔走) <= 0 && S.学徒合同 === '已立据' && !quit) {
          S.家族 -= 2;
          log.push(['这一学年虽立了字据，却没真把多少旬数落到店里活计上，家里对你这条路更疑一分（家族-2）。', 'bad']);
        } else if (S.本年学徒守店 > 0 && S.本年学徒学账 > 0 && S.本年学徒奔走 > 0) {
          log.push(['这一学年你既守过店、也学过账货、还跑过街路，学徒路终于不再像一张“只写了拜师”的空纸。', 'good']);
        }

        clampAttr('体魄'); clampAttr('家族');
        if (S.学年 < APPRENTICE_YEARS) {
          curStage.next = 'apprentice';
          curStage.nextLabel = '翻到下一学年投师季上旬 →';
          S._advanceApprenticeYear = true;
        } else {
          curStage.next = 'marriage';
          curStage.nextLabel = '带着这门去向去议亲 →';
          S.年龄 = 20;
        }
      }
    };
  }

  // ── 徽商学生意（16-18岁）：四季三旬推进，把认货/跑单/催账/贴家拆回一年里 ──
  function stageMerchant() {
    var age = 16 + (S.商年 - 1);
    var season = merchantSeasonInfo(S.商季 || 1);
    var xun = S.商段 || 1;
    var xunLabel = merchantXunLabel(xun);
    var isMid = xun === 2;
    var isLate = xun >= 3;
    var isYearEnd = season.id === 'winter' && isLate;
    var nextSeason = merchantSeasonInfo(Math.min(MERCHANT_SEASONS.length, (S.商季 || 1) + 1));
    var tradePreview = merchantTradeProfile();
    var supportProfile = merchantSupportProfile();
    var xunLead = xun === 1
      ? '上旬先认人认路、把脚钱和货路摸清。'
      : (xun === 2
        ? '中旬最像把门路、压货与人情往深里坐实。'
        : '下旬就得把回钱、贴家、药钱与差役准备往账面上收。');
    var shopCopper = season.id === 'summer' ? 150 : (season.id === 'winter' ? 130 : 110);
    if (isMid) shopCopper += 20;
    if (isLate) shopCopper -= 10;
    var shopBody = season.id === 'summer' ? (isMid ? 3 : 2) : (isLate ? 2 : 1);
    var goodsGain = season.id === 'autumn' ? (isMid ? 2 : 1) : (isLate ? 0 : 1);
    var runSilver = (season.id === 'autumn' && xun >= 2) ? 1 : 0;
    var runCopper = season.id === 'autumn'
      ? (isLate ? 170 : (isMid ? 220 : 180))
      : (season.id === 'summer'
        ? (isLate ? 140 : 180)
        : (season.id === 'winter'
          ? (isLate ? 80 : 120)
          : (isLate ? 100 : 130)));
    if ((S.商路门路 || 0) > 0) {
      runCopper += Math.min(80, (S.商路门路 || 0) * 40);
      if (currentLineageIsCollateral()) runCopper = Math.max(80, runCopper - 40);
    }
    var runBody = season.id === 'summer' ? (isMid ? 5 : 4) : (season.id === 'autumn' ? (isLate ? 4 : 3) : (isLate ? 3 : 2));
    var runFamilyCost = currentLineageIsCollateral() ? 1 : 0;
    var bookCopper = season.id === 'winter' ? (isLate ? 240 : 200) : (isMid ? 180 : 150);
    if (S.家传书香 > 0) bookCopper += 40;
    if (S.亦贾亦儒底子 > 0) bookCopper += 20;
    var collectCopper = season.id === 'winter' ? (isLate ? 90 : 70) : (season.id === 'autumn' ? 60 : 40);
    var collectTrust = isLate ? 1 : 0;
    var homeFamily = season.id === 'autumn' ? (isLate ? 5 : 4) : (isLate ? 4 : 3);
    var homeRice = (season.id === 'autumn' || (season.id === 'winter' && isLate)) ? 1 : 0;
    var mendCost = season.id === 'winter' ? (isLate ? 140 : 120) : (season.id === 'summer' ? (isMid ? 100 : 90) : 70);
    var mendBody = season.id === 'winter' ? 5 : (isLate ? 4 : 3);
    var reserveCost = season.id === 'winter' ? 200 : 180;
    var seasonalCounts = '本年坐店=' + S.本年商路坐店 + '｜跑单=' + S.本年商路跑单 + '｜认货=' + S.本年商路认货 + '｜核账=' + S.本年商路核账 + '｜催账=' + S.本年商路催账 + '｜贴家=' + S.本年商路贴家 + '｜试贩=' + S.本年商路试贩;
    return {
      title: '徽商学生意 · 第' + S.商年 + '商年·' + season.name + '·' + xunLabel,
      label: '商路第' + S.商年 + '年·' + season.name + '·' + xunLabel,
      next: 'merchant',
      nextLabel: isYearEnd
        ? (S.商年 < MERCHANT_YEARS ? '翻到下一商年春开路上旬 →' : '攒着商路底子去议亲 →')
        : (isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + merchantXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一商年 →' : '了这一旬商路 →',
      note: '商路现改成“春开路→夏坐店→秋试手→冬清账”四季、每季三旬。关键不是多给几次发财判定，而是把认货、跑单、催账、贴家、差役准备、补衣药与旧债都拆回一年里的真实节奏。' + (generation > 1 ? ' ' + tradePreview.note : ''),
      narrative: '你已<span class="em">' + age + '岁</span>，这一商年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + xunLead
        + (isLate ? '这一旬最像收账：哪笔钱先回、哪笔钱先贴家、差役钱和药钱有没有先留，都开始逼到眼前。' : '这一旬还在铺里、货路和家里之间掂量先后，真正厚的地方是同一年里许多小账一起抢。')
        + (((S.承继定位 || '').indexOf('长兄续商') >= 0)
          ? ' 只是这一手并不是平白承了长兄的旧号，多半还得挨着旧路数、在旁边另起一支，认人认账与回钱节奏都会因此改写。'
          : '')
        + ' 你这一旬有 <span class="em">2 个行动点</span>。',
      dossier: function () {
        var seasonTags = (S.本年商路季务 && S.本年商路季务.length) ? S.本年商路季务.join('、') : '尚未坐实';
        return lifeDossier('本钱≠利润；货卖出但银没回，不算现钱。当前商程=' + season.name + '·' + xunLabel + '｜识货进度=' + S.识货进度 + '｜账房进度=' + S.账房进度 + '｜信誉=' + S.商信誉 + '｜未回款=' + S.未回款银 + '两｜累计反哺=' + S.累计反哺银 + '两｜' + seasonalCounts + '｜本年季务=' + seasonTags + '。');
      },
      events: [
        {
          t: 'rel',
          tag: season.id === 'winter' ? '[回钱]' : '[东家]',
          txt: season.id === 'winter'
            ? (isLate
              ? '年关下旬最像把人情和账本一起摊平：族叔肯不肯认你这一年的账、哪笔钱真算回了、哪笔钱还在外头拖，都不会因为“都是亲戚”自动算你赢。'
              : '冬里先要盯着旧账慢慢回：催得太紧伤和气，催得太松又像把现钱白放在外头。')
            : (isLate
              ? '这一旬东家更看你能不能把前两旬摸来的门路收成真账，而不是只会跟着跑热闹。'
              : '族叔肯不肯带你跑单、肯不肯把账面门道教给你，并不因“都是亲戚”自动成立。')
        },
        {
          t: 'life',
          tag: season.id === 'autumn' ? '[市面]' : '[商路]',
          txt: season.id === 'autumn'
            ? (isMid
              ? '秋里中旬最像“压货还是先回钱”的分水岭：货路热、米价也动，家里又催着现钱和口粮，商路厚在这些账一起抢同一笔银。'
              : '秋里一头可以问价、走货、试探带本，一头又得顾家里秋收与现钱；同一双手不可能两头都分到十足。')
            : (season.id === 'winter'
              ? '冬里会一起撞上：回款未回、年关盘账、差役、旧债滚息与家里要不要先得一手现钱。'
              : '这一旬会一起撞上：坐店、跑单、认货、回乡与家里供读的拉扯。商路不是一笔收入，而是一整套拖延与回款。')
        },
        {
          t: 'body',
          tag: '[身子]',
          txt: S.体魄 <= 45
            ? '这一阵身子已经有些发虚：若再只顾跑路不顾药钱和歇脚，后头很可能不是账先坏，而是人先撑不住。'
            : (season.id === 'summer'
              ? '伏夏里最怕热毒和脚伤：钱路还没坐实，脚板和肩背先开始记账。'
              : '商路看着是走人情和银钱，其实鞋脚、棉衣、药钱这些碎账，一样会慢慢把人磨薄。')
        }
      ],
      prompt: '这一旬怎么过？（分配 2 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'm_shop', name: season.id === 'summer' ? '伏夏守柜看店' : '坐店学生意', cost: 1, eff: '铜钱+' + shopCopper + '·账房进度+1·商历练+1·体魄-' + shopBody, desc: season.id === 'summer' ? '伏夏守柜、搬货、看人情，钱不算最厚，却最能把柜上这层底子坐实。' : '守柜、搬货、看着人来人往，把规矩学会。', can: true });
        A.push({ id: 'm_goods', name: season.id === 'autumn' ? (isLate ? '趁尾市复核货价' : '趁旺季认货辨价') : '认货辨价', cost: 1, eff: goodsGain > 0 ? ('识货进度+' + goodsGain) : '稳住货眼·不退步', desc: season.id === 'autumn' ? '秋里的货最活，也最容易看走眼；这一步不是发财，而是少吃一次生。' : '先学会认货，不然谈不上自己试着带本。', can: goodsGain > 0 || season.id === 'autumn' });
        A.push({ id: 'm_run', name: season.id === 'autumn' ? (isLate ? '趁旺季外出催单回钱' : '跟号外出探价走货') : (season.id === 'winter' ? (isLate ? '年关短路催最后一笔账' : '趁年关外出收账') : '跟号外出跑单'), cost: 1, eff: (runSilver > 0 ? ('白银+' + runSilver + '·') : '') + '铜钱+' + runCopper + '·商历练+2·体魄-' + runBody + (runFamilyCost > 0 ? ('·家族-' + runFamilyCost) : ''), desc: season.id === 'autumn' ? '秋里跟单问价、认牙口，也把今年能不能往试贩上迈一步坐实。' : (season.id === 'winter' ? '把“账面上有”与“手里真回了钱”分开看清。' : '跟着押货、跑埠、走路子，钱厚一些，离乡也久些。'), can: !(season.id === 'winter' && isLate && S.本年商路催账 > 0), why: (season.id === 'winter' && isLate && S.本年商路催账 > 0) ? '这一旬已催过旧账' : '', once: true });
        A.push({ id: 'm_book', name: season.id === 'winter' ? (isLate ? '年关总盘账' : '年关盘账核账') : (isLate ? '趁旬尾收一遍流水' : '识字帮核账'), cost: 1, eff: '铜钱+' + bookCopper + '·账房进度+1·商信誉+1', desc: '若你识字，可帮着抄单、核账，比纯跑腿更值钱。', can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
        A.push({ id: 'm_collect', name: S.未回款银 > 0 ? '追催旧账回钱' : (season.id === 'winter' ? '先去盯几笔散账' : '带口信催几笔小账'), cost: 1, eff: S.未回款银 > 0 ? ('未回款银-1·白银+1' + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')) : ('铜钱+' + collectCopper + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')), desc: S.未回款银 > 0 ? '把“还挂在账面上”的一两先催回手里，省得年关只剩一堆空账。' : '就算还没有大笔拖账，也先把散碎口信、回话和小账盯紧。', can: season.id === 'winter' || season.id === 'autumn' || S.未回款银 > 0, once: true });
        A.push({ id: 'm_try', name: isLate ? '赶在旬尾定试贩' : '争取带本试贩', cost: 2, eff: '白银-1锁作本钱·冬里按门路/账房/承继定位判回本/小利/亏折/未回款', desc: '拿一两本钱试着跑一单。钱先锁在货里，回没回得来，不只看运气，也看你这一年把门路和账面坐实到哪一步。', can: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) && S.本年商路试贩 < 1 && S.带本银 <= 0 && S.白银 >= 1 && (S.识货进度 >= 1 || S.账房进度 >= 1), why: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) ? (S.本年商路试贩 < 1 ? (S.带本银 <= 0 ? (S.白银 >= 1 ? ((S.识货进度 >= 1 || S.账房进度 >= 1) ? '' : '尚未学会最基本认货/核账') : '白银不足1两') : '已有一笔本钱锁在货里') : '本年已试贩过一回') : '通常要到秋中旬以后才谈得上试贩', once: true });
        A.push({ id: 'm_support', name: season.id === 'autumn' ? '先把回钱贴回家' : '寄银回家供读', cost: 1, eff: supportProfile.effect, desc: supportProfile.desc, can: S.白银 >= 1, why: S.白银 >= 1 ? '' : '白银不足1两', once: true });
        A.push({ id: 'm_home', name: season.id === 'autumn' ? '回乡省亲搭秋收' : (isLate ? '回乡把家里这旬过住' : '回乡省亲'), cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : ''), desc: season.id === 'autumn' ? '秋里先回乡搭一把，虽少跑一程货，却把家里口粮与脸面先稳住。' : '回乡看看父母，也把一点心力和米粮带回去。', can: true, once: true });
        A.push({ id: 'm_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把年关差役钱留出一角，等真轮到本户时，不至两手一空。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
        A.push({ id: 'm_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '年关前先补棉袄、药钱和脚力，别让这一年最后一程先把身子拖垮。' : '先把这程跑出来的劳损压住，免得后面账还没清，人先垮了。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
        A.push({ id: 'm_rest', name: '歇养身子', cost: 1, eff: '体魄+5', desc: '别把身子先走坏。', can: true });
        return A;
      },
      settle: function (log) {
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'm_shop':
              S.铜钱 += shopCopper; S.账房进度 += 1; S.商历练 += 1; S.体魄 -= shopBody; S.商身份 = '学生意伙计'; S.本年商路坐店 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '坐店');
              log.push([season.id === 'summer'
                ? ('伏夏守柜看店：铜钱+' + shopCopper + '、账房进度+1、商历练+1、体魄-' + shopBody)
                : ('坐店学生意：铜钱+' + shopCopper + '、账房进度+1、商历练+1、体魄-' + shopBody), 'good']);
              break;
            case 'm_goods':
              if (goodsGain > 0) S.识货进度 += goodsGain;
              S.本年商路认货 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '认货辨价');
              log.push([season.id === 'autumn'
                ? (goodsGain > 0 ? ('趁旺季认货辨价：识货进度+' + goodsGain) : '趁尾市复核货价：先把货眼稳住，不求再猛进')
                : ('认货辨价：识货进度+' + goodsGain), 'good']);
              break;
            case 'm_run':
              if (runSilver > 0) { S.白银 += runSilver; S.累计反哺银 += runSilver; }
              S.铜钱 += runCopper; S.商历练 += 2; S.体魄 -= runBody; if (runFamilyCost > 0) S.家族 -= runFamilyCost;
              S.商身份 = (season.id === 'winter' || (season.id === 'autumn' && isLate)) ? '外出催账' : '外出跑单';
              S.本年商路跑单 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + ((season.id === 'winter' || (season.id === 'autumn' && isLate)) ? '催单回钱' : '外出跑单'));
              log.push([season.id === 'winter'
                ? ('趁年关外出收账：' + (runSilver > 0 ? ('白银+' + runSilver + '、') : '') + '铜钱+' + runCopper + '、商历练+2、体魄-' + runBody + (runFamilyCost > 0 ? ('、家族-' + runFamilyCost) : ''))
                : ('跟号外出跑单：' + (runSilver > 0 ? ('白银+' + runSilver + '、') : '') + '铜钱+' + runCopper + '、商历练+2、体魄-' + runBody + (runFamilyCost > 0 ? ('、家族-' + runFamilyCost) : '')), 'good']);
              break;
            case 'm_book':
              S.铜钱 += bookCopper; S.账房进度 += 1; S.商信誉 += 1; S.本年商路核账 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '核账');
              log.push([season.id === 'winter'
                ? ('年关盘账核账：铜钱+' + bookCopper + '、账房进度+1、商信誉+1')
                : ('识字帮核账：铜钱+' + bookCopper + '、账房进度+1、商信誉+1'), 'good']);
              break;
            case 'm_collect':
              S.本年商路催账 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '催账');
              if (S.未回款银 > 0) {
                S.未回款银 -= 1; S.白银 += 1; if (collectTrust > 0) S.商信誉 += collectTrust;
                log.push(['追催旧账回钱：未回款银-1、白银+1' + (collectTrust > 0 ? ('、商信誉+' + collectTrust) : '') + '。账面上的银，终于落回手里。', 'good']);
              } else {
                S.铜钱 += collectCopper; if (collectTrust > 0) S.商信誉 += collectTrust;
                log.push(['带口信催几笔散账：铜钱+' + collectCopper + (collectTrust > 0 ? ('、商信誉+' + collectTrust) : '') + '。虽还没催回整两白银，至少把散碎回话和脚钱先拢回了一些。', 'good']);
              }
              break;
            case 'm_try':
              if (spendSilver(1)) {
                S.带本银 += 1; S.本年商路试贩 += 1; S._merchantLockedTradeTable = merchantTradeProfile().table.slice();
                pushMerchantSeasonTag(season.name + xunLabel + '试贩');
                log.push(['争取带本试贩：白银-1锁作本钱，待冬里结账。', 'bad']);
              } else {
                log.push(['想拿一两现银去试贩，但这一旬别处已先占了这笔钱，只得暂缓，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'm_support':
              if (spendSilver(1)) {
                S.累计反哺银 += 1; S.商路供读银 += 1; S.供读压力 = Math.max(0, S.供读压力 - 1); S.家族 += supportProfile.familyGain;
                if (supportProfile.trustGain > 0) S.商信誉 += supportProfile.trustGain;
                S.本年商路贴家 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '贴家供读');
                log.push(['寄银回家供读：白银-1、累计反哺+1、商路供读+1、家族+' + supportProfile.familyGain + (supportProfile.trustGain > 0 ? ('、商信誉+' + supportProfile.trustGain) : '') + '；这笔银被更稳地划进家里的供读账。', 'good']);
              } else {
                log.push(['本想寄银回家供读，但这一旬手头现银已先被别处占住，只得暂缓，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'm_home':
              S.家族 += homeFamily; if (homeRice > 0) S.存米 += homeRice; S.本年商路归乡 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '回乡');
              log.push([season.id === 'autumn'
                ? ('回乡省亲搭秋收：家族+' + homeFamily + '、存米+' + homeRice)
                : ('回乡省亲：家族+' + homeFamily + (homeRice > 0 ? ('、存米+' + homeRice) : '')), 'good']);
              break;
            case 'm_reserve':
              if (spendCopper(reserveCost)) {
                S.本年商路备役 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '预留差役钱');
                log.push(['先留一角差役钱：铜钱-' + reserveCost + '。眼下看不见好处，只是把年关的忙乱先压下去一点。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'm_mend':
              if (spendCopper(mendCost)) {
                S.体魄 += mendBody; S.本年商路歇养 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '补衣买药');
                log.push([season.id === 'winter'
                  ? ('补衣买药过冬：铜钱-' + mendCost + '、体魄+' + mendBody)
                  : ('补鞋买药养身：铜钱-' + mendCost + '、体魄+' + mendBody), 'good']);
              } else {
                log.push(['想补衣买药，但这一旬手头铜钱不够，只得硬扛。', 'bad']);
              }
              break;
            case 'm_rest':
              S.体魄 += 5; S.本年商路歇养 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '歇养');
              log.push(['歇养身子：体魄+5', 'good']);
              break;
          }
        });

        if (!isYearEnd) {
          curStage.next = 'merchant';
          curStage.nextLabel = isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + merchantXunLabel(xun + 1) + ' →');
          S._advanceMerchantSeason = true;
          if (S.本年商路坐店 > 0 && S.本年商路认货 > 0) log.push(['这一旬既守柜、也认货，商路不再只是“在号里混熟脸”。', 'good']);
          if (S.本年商路贴家 > 0 && S.本年商路试贩 > 0) log.push(['这一旬一边试着把货跑出去，一边又先顾家里回钱，商路与家计已经开始真拉在一处。', 'good']);
          if (S.本年商路催账 > 0 && S.未回款银 <= 0) log.push(['这一旬催账见了真回钱，账面和手里终于不是两本书。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.本年商路试贩 > 0 && S.带本银 > 0) {
          var tradeTable = (S._merchantLockedTradeTable && S._merchantLockedTradeTable.length)
            ? S._merchantLockedTradeTable
            : merchantTradeProfile().table;
          var r = rollProb(tradeTable);
          log.push(['〔试贩成算〕这一单不再只按固定概率落下：会继续吃到旧商路、账房、承继定位与旁支衰减的影响。', 'good']);
          if (r === 'flat') {
            S.白银 += S.带本银;
            log.push(['〔试贩结账〕回本而已：锁定本钱如数回账。', 'good']);
          } else if (r === 'profit') {
            S.白银 += S.带本银 + 1; S.累计反哺银 += 1;
            log.push(['〔试贩结账〕小利：回本并净得白银+1。', 'good']);
          } else if (r === 'loss') {
            S.商路亏折 += 1;
            log.push(['〔试贩结账〕货价不利，本钱亏折1两。', 'bad']);
          } else {
            S.未回款银 += S.带本银;
            log.push(['〔试贩结账〕货已走出但银未回：记未回款，不入现钱。', 'bad']);
          }
          S.带本银 = 0;
          S._merchantLockedTradeTable = null;
        }

        var mouths = S.本年商路跑单 > 1 ? 1 : 2;
        if (S.存米 >= mouths) {
          S.存米 -= mouths;
          log.push(['〔口粮〕这一商年口粮计 ' + mouths + ' 石（存米-' + mouths + '）', 'bad']);
        } else {
          var lack = mouths - S.存米;
          S.存米 = 0;
          if (S.铜钱 >= lack * 350) {
            S.铜钱 -= lack * 350;
            log.push(['〔口粮〕家中米不够，籴米补口粮：铜钱-' + (lack * 350), 'bad']);
          } else {
            S.负债银 += lack;
            S.体魄 -= 4;
            log.push(['〔口粮〕商路也补不上口粮缺口，只得举债糊口（负债+' + lack + '两、体魄-4）', 'bad']);
          }
        }
        if (rand() < 0.35) {
          if (S.本年商路备役 > 0) {
            log.push(['〔赋役〕先前留出的一角差役钱派上了用场，这一回没有再临时拆别的现钱。', 'good']);
          } else if (S.铜钱 >= 200) {
            S.铜钱 -= 200;
            log.push(['〔赋役〕本户轮到差役，拿铜钱200文找人顶上', 'bad']);
          } else {
            S.体魄 -= 6; S.家族 -= 2;
            log.push(['〔赋役〕无钱代役，只得误业亲身应付差役（体魄-6、家族-2）', 'bad']);
          }
        }
        if (S.负债银 > 0) {
          var oldDebt = S.负债银;
          var interest = Math.ceil(oldDebt * DEBT_RATE);
          S.负债银 += interest;
          log.push(['〔债息〕旧债 ' + oldDebt + ' 两滚息 ' + interest + ' 两（负债→' + S.负债银 + '）', 'bad']);
        }
        if ((S.本年商路坐店 + S.本年商路跑单 + S.本年商路核账) <= 0) {
          S.家族 -= 3;
          log.push(['这一商年没真把多少时辰落到商路活计上，家里难免焦躁（家族-3）。', 'bad']);
        } else if (S.本年商路坐店 > 0 && S.本年商路跑单 > 0 && S.本年商路核账 > 0 && S.本年商路催账 > 0) {
          log.push(['这一商年你既坐过店、也跑过单、还真摸过账，又亲手追过回钱，商路终于不再像一张“只写了学生意”的空纸。', 'good']);
        }
        if (S.本年商路贴家 > 0) log.push(['这一商年你有 ' + S.本年商路贴家 + ' 次先把现钱贴回家里；这些钱不一定留在你手里，却把家里的供读和锅火真续住了。', 'good']);
        if (S.本年商路催账 > 0 && S.未回款银 > 0) log.push(['这一商年你已追过几回账，但仍有 ' + S.未回款银 + ' 两挂在外头；这正是商路最磨人的地方。', 'bad']);

        clampAttr('体魄'); clampAttr('家族');
        if (S.商年 < MERCHANT_YEARS) {
          curStage.next = 'merchant';
          curStage.nextLabel = '翻到下一商年春开路上旬 →';
          S._advanceMerchantYear = true;
        } else {
          curStage.next = 'marriage';
          curStage.nextLabel = '攒着商路底子去议亲 →';
          S.年龄 = 20;
        }
      }
    };
  }

  // ── 读书应举（16-18岁）：供读/保结/童试/优免 ──
  function stageCivilExam() {
    var age = 16 + (S.举业年 - 1);
    var season = examSeasonInfo(S.举季 || 1);
    var pass = S.举段 || 1;
    var isBackHalf = pass === 2;
    var isYearEnd = season.id === 'winter' && isBackHalf;
    var nextSeason = examSeasonInfo(Math.min(EXAM_SEASONS.length, (S.举季 || 1) + 1));
    var copyCopper = season.id === 'winter' ? 180 : (season.id === 'autumn' ? 160 : (season.id === 'summer' ? 140 : 120));
    var homeFamily = season.id === 'autumn' ? 4 : 3;
    var homeRice = (season.id === 'autumn' || season.id === 'winter') ? 1 : 0;
    var reserveCost = season.id === 'winter' ? 120 : 100;
    var mendCost = season.id === 'winter' ? 120 : (season.id === 'summer' ? 90 : 70);
    var mendBody = season.id === 'winter' ? 5 : 3;
    var essayGain = season.id === 'summer' ? 2 : 1;
    var tutorGain = season.id === 'spring' ? 2 : (season.id === 'summer' ? 2 : 1);
    if (S.家传书香 > 0) copyCopper += 40;
    if (S.供读底子 > 0) copyCopper += 20;
    return {
      title: '读书应举 · 第' + S.举业年 + '举业年·' + season.name + '·' + wagePassLabel(pass), label: '举业第' + S.举业年 + '年·' + season.name + '·' + wagePassLabel(pass),
      next: 'civilExam',
      nextLabel: isYearEnd
        ? (S.举业年 < EXAM_YEARS ? '翻到下一举业年春课上半程 →' : '带着这三年账本去议亲 →')
        : (isBackHalf ? ('转入' + nextSeason.name + '上半程 →') : ('转入' + season.name + '下半程 →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一举业年 →' : '了这一程举业细账 →',
      note: '举业路现改成“春课→夏课→秋试→冬清账”四季、每季上下两程：上半程先定今年供读主路，下半程再把保结、盘缠、抄写补贴、回家缓家计、衣药与差役钱一笔笔收紧。供读不推出录取，仍不展开乡试会试。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一举业年走到<span class="em">' + season.name + '·' + wagePassLabel(pass) + '</span>。' + season.actionLead + (isBackHalf ? '这一程不只是再多背几篇文章，还得把保结、盘缠、家计、衣药和差役这些小账一并收住。' : '这一程先定主读法：是狠下心继续塾馆、走低成本寄读，还是一边帮家一边硬撑着读。') + ' 你这一程有 <span class="em">2 个行动点</span>。',
      dossier: function () {
        return lifeDossier('当前举程=' + season.name + '·' + wagePassLabel(pass) + '｜童试层级=' + S.童试层级 + '｜保结进度=' + S.保结进度 + '｜文章火候=' + S.文章火候 + '｜供读状态=' + S.供读状态 + '｜本年馆课=' + S.本年馆课次数 + '｜半读=' + S.本年半读次数 + '｜评文=' + S.本年评文次数 + '｜保结=' + S.本年保结次数 + '｜誊抄=' + S.本年誊抄次数 + '｜归家=' + S.本年归家次数 + (S.生员身份 ? '｜已是生员' : '') + '。');
      },
      events: [
        {
          t: 'rel',
          tag: '[供读]',
          txt: isBackHalf
            ? '下半程更像“把细账摊平”：家里肯不肯再替你顶一口、你愿不愿先回去缓一缓锅火，都不会因为“读书最体面”就自动成立。'
            : '父、兄、母、塾师、廪保都不是默认帮手。家里肯不肯继续供、塾师肯不肯续教、保结肯不肯替你担，都得各自成立。'
        },
        {
          t: 'rand',
          tag: season.id === 'autumn' ? '[应试]' : (season.id === 'winter' ? '[清账]' : '[家计]'),
          txt: season.note + (isYearEnd ? ' 这一程还要把束脩纸墨、口粮、差役与旧债一起结成全年总账。' : ' 同一程里，文章火候、盘缠与家中口粮常常在抢同一笔钱。')
        }
      ],
      prompt: isBackHalf ? '这一程怎么把举业细账收住？（分配 2 点）' : '这一程先怎么定今年读法？（分配 2 点）',
      actions: function () {
        var A = [];
        if (!isBackHalf) {
          A.push({ id: 'e_tutor', name: season.id === 'spring' ? '先入塾定今年馆课' : '继续塾馆温书', cost: 2, eff: '文章火候+' + tutorGain + '·成本档+' + (season.id === 'spring' ? 2 : 1) + '·供读压力+1', desc: season.id === 'spring' ? '先把今年最重也最贵的读法定下来：银钱、纸墨、人情都得先压进去。' : '继续把时辰压在馆课与温书上，推得稳，也更吃家里。', can: S.供读状态 !== '已断供', once: true });
          A.push({ id: 'e_half', name: '半耕半读', cost: 1, eff: '文章火候+1' + (season.id === 'autumn' ? '·存米+1' : '') + '·体魄-1', desc: '农忙帮家里、农闲读书，推进慢些，却能把家里那口气续住。', can: true });
          A.push({ id: 'e_school', name: season.id === 'spring' ? '投社学/寄读' : '低成本寄读', cost: 1, eff: '成本档+1·文章火候+1', desc: '不走正经塾馆，先把这一年读书成本压低一线。', can: S.供读状态 !== '已断供', once: true });
          A.push({ id: 'e_essay', name: season.id === 'summer' ? '伏夏专心评文改卷' : '请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '再花一点纸墨和人情，把文章火候往前磨一层。', can: S.供读状态 !== '已断供' });
          A.push({ id: 'e_guarantee', name: season.id === 'autumn' ? '赶在秋里通保结' : '奔走保结与报名', cost: 1, eff: '保结进度+1·铜钱-80', desc: '资格不通，本年就算想下场也不成。', can: !S.生员身份 && S.保结进度 < 1 && S.铜钱 >= 80, why: !S.生员身份 ? (S.保结进度 < 1 ? (S.铜钱 >= 80 ? '' : '铜钱不足80文') : '本年保结已通') : '已是生员', once: true });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '年关抄单写契补贴' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '就算不中，识字、誊抄和替人看账也会慢慢沉成转业底子。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          A.push({ id: 'e_home', name: season.id === 'autumn' ? '回家帮父缓秋里家计' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '这一程少读一点，先让家里那口锅别翻。', can: true, once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '别把眼睛和身子先熬坏。', can: true });
        } else {
          A.push({ id: 'e_essay', name: season.id === 'autumn' ? '临场再磨一轮文章' : '再请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '把这一程能再稳一稳的文章火候压出来。', can: S.供读状态 !== '已断供' });
          A.push({ id: 'e_exam', name: season.id === 'winter' ? '冬前补撞一回童试' : '下场应童试', cost: 2, eff: '触发童试结果·盘缠档+1', desc: '只有保结通了、这一年又真下了功夫，才值得去撞一撞。', can: !S.生员身份 && !S.本年下场 && (season.id === 'autumn' || season.id === 'winter') && S.保结进度 >= 1 && S.供读状态 !== '已断供', why: !S.生员身份 ? (!S.本年下场 ? ((season.id === 'autumn' || season.id === 'winter') ? (S.保结进度 >= 1 ? (S.供读状态 !== '已断供' ? '' : '家中已断供') : '保结未通') : '通常要到秋冬才真正下场') : '本年已下场过') : '已是生员', once: true });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '誊抄契字补年关钱' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '把识字底子临时换成一点现钱，也算给后路添一层。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          A.push({ id: 'e_home', name: season.id === 'winter' ? '回家陪着把年关过住' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '读书这条路还没坐实的时候，家里先稳住就是一笔真账。', can: true, once: true });
          A.push({ id: 'e_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把差役钱留出来，免得到年关再把读书账拆得满地都是。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
          A.push({ id: 'e_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '先补棉衣、药钱和灯下熬出来的亏空。' : '先把眼睛和身子这口气养回一点。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '让这一程别只剩下硬熬。', can: true });
        }
        return A;
      },
      settle: function (log) {
        var didStudy = false, progressed = false;
        var stepTag = season.name + '·' + wagePassLabel(pass);
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'e_tutor':
              var tutorPressure = 1;
              if (S.供读底子 > 0 && S.本年馆课次数 <= 0) tutorPressure = 0;
              S.文章火候 += tutorGain; S.读书成本档 += (season.id === 'spring' ? 2 : 1); S.供读压力 += tutorPressure; S.读书方式 = '塾馆'; S.本年馆课次数 += 1; didStudy = true;
              pushExamSeasonTag(stepTag + '馆课');
              log.push([season.id === 'spring'
                ? ('先把今年馆课定下来：文章火候+' + tutorGain + '、成本档+2、供读压力+' + tutorPressure + (tutorPressure === 0 ? '（供读专账先替你垫住了第一口气）' : ''))
                : ('继续塾馆温书：文章火候+' + tutorGain + '、成本档+1、供读压力+' + tutorPressure + (tutorPressure === 0 ? '（供读专账先替你垫住了第一口气）' : '')), 'good']);
              break;
            case 'e_half':
              S.文章火候 += 1; if (season.id === 'autumn') S.存米 += 1; S.体魄 -= 1; S.读书方式 = '半耕半读'; S.本年半读次数 += 1; didStudy = true;
              pushExamSeasonTag(stepTag + '半耕半读');
              log.push(['半耕半读：文章火候+1' + (season.id === 'autumn' ? '、存米+1' : '') + '、体魄-1', 'good']);
              break;
            case 'e_school':
              S.文章火候 += 1; S.读书成本档 += 1; S.读书方式 = '社学寄读'; S.本年寄读次数 += 1; didStudy = true;
              pushExamSeasonTag(stepTag + '寄读');
              log.push(['投社学/寄读：文章火候+1、成本档+1', 'good']);
              break;
            case 'e_essay':
              S.文章火候 += essayGain; S.读书成本档 += 1; S.本年评文次数 += 1; didStudy = true;
              pushExamSeasonTag(stepTag + '评文');
              log.push([(season.id === 'summer' ? '伏夏专心评文改卷' : '请塾师评文改卷') + '：文章火候+' + essayGain + '、成本档+1', 'good']);
              break;
            case 'e_guarantee':
              if (spendCopper(80)) {
                S.保结进度 = Math.min(1, S.保结进度 + 1); S.本年保结次数 += 1;
                pushExamSeasonTag(stepTag + '保结');
                log.push(['奔走保结与报名：保结进度+1、铜钱-80', 'bad']);
              } else {
                log.push(['想把保结赶紧通下，但这一程零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'e_exam':
              S.本年下场 = true; S.读书成本档 += 1;
              pushExamSeasonTag(stepTag + '下场');
              log.push(['你决定这一年下场试一次：盘缠成本再记一档。', 'good']);
              break;
            case 'e_copy':
              S.铜钱 += copyCopper; S.识字转业值 += 1; S.文章火候 += 1; S.本年誊抄次数 += 1;
              pushExamSeasonTag(stepTag + '誊抄补贴');
              log.push(['抄书/看账补贴：铜钱+' + copyCopper + '、识字转业值+1、文章火候+1' + (S.家传书香 > 0 ? '（家传书香让这层笔墨活更容易接到）' : ''), 'good']);
              break;
            case 'e_home':
              S.家族 += homeFamily; if (homeRice > 0) S.存米 += homeRice; S.供读压力 = Math.max(0, S.供读压力 - 1); S.本年归家次数 += 1;
              pushExamSeasonTag(stepTag + '归家');
              log.push(['回家帮父与缓冲家计：家族+' + homeFamily + (homeRice > 0 ? ('、存米+' + homeRice) : '') + '、供读压力-1', 'good']);
              break;
            case 'e_reserve':
              if (spendCopper(reserveCost)) {
                S.本年备役次数 += 1;
                pushExamSeasonTag(stepTag + '预留差役钱');
                log.push(['先留一角差役钱：铜钱-' + reserveCost + '。眼下看不见好处，只是把年关的忙乱先压下一层。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一程零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'e_mend':
              if (spendCopper(mendCost)) {
                S.体魄 += mendBody; S.本年将养次数 += 1;
                pushExamSeasonTag(stepTag + '补衣买药');
                log.push([(season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身') + '：铜钱-' + mendCost + '、体魄+' + mendBody, 'good']);
              } else {
                log.push(['想先补衣药钱，但这一程手头铜钱不够，只能先硬熬。', 'bad']);
              }
              break;
            case 'e_rest':
              S.体魄 += 5; S.本年将养次数 += 1;
              pushExamSeasonTag(stepTag + '歇养');
              log.push(['歇息养身：体魄+5', 'good']);
              break;
          }
        });

        if (!isYearEnd) {
          curStage.next = 'civilExam';
          curStage.nextLabel = isBackHalf ? ('转入' + nextSeason.name + '上半程 →') : ('转入' + season.name + '下半程 →');
          S._advanceExamSeason = true;
          if ((S.本年馆课次数 + S.本年半读次数 + S.本年寄读次数) <= 0 && !didStudy) log.push(['这一程你还没把真正的读书主路坐实，举业只是在账边打转。', 'bad']);
          if (S.本年保结次数 > 0 && S.本年评文次数 > 0) log.push(['这一程既在跑保结、也在磨文章，举业终于不再只是嘴上说要读。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.本年下场) {
          if (S.保结进度 < 1) {
            log.push(['〔资格闸〕本年保结未通，终究没能真正下场。', 'bad']);
          } else {
            var chance = 0.12 + S.文章火候 * 0.08 + (S.读书方式 === '塾馆' ? 0.08 : 0) + (S.读书方式 === '社学寄读' ? 0.03 : 0) + Math.min(0.08, S.本年评文次数 * 0.03) + (S.本年保结次数 > 0 ? 0.02 : 0);
            chance = Math.max(0.08, Math.min(0.78, chance));
            if (rand() < chance && S.童试层级 < 3) {
              S.童试层级 += 1; progressed = true;
              if (S.童试层级 >= 3) {
                S.童试层级 = 3;
                S.生员身份 = true; S.生员层级 = '生员'; S.优免启用 = true; S.身份 = '民籍·生员';
                log.push(['〔院试中式〕你这一年终于冲过童试最后一关，成了生员。', 'good']);
              } else {
                log.push(['〔童试推进〕这一年应试有进：童试层级升到第 ' + S.童试层级 + ' 层。', 'good']);
              }
            } else {
              log.push(['〔应试未进〕你下了场，但这一年未能再推进一层。', 'bad']);
            }
          }
        }

        if (didStudy && S.供读底子 > 0) {
          S.供读压力 = Math.max(0, S.供读压力 - 1);
          log.push(['〔供读专账〕上一代留下的供读底子替这一年缓去一线压力（供读压力-1，不折现成现银）。', 'good']);
        }
        var studyCost = S.读书成本档 * 120;
        if (studyCost > 0) {
          if (S.铜钱 >= studyCost) {
            S.铜钱 -= studyCost;
            log.push(['〔束脩纸墨〕本年读书成本结算：铜钱-' + studyCost, 'bad']);
          } else {
            var left = studyCost - S.铜钱;
            S.铜钱 = 0;
            var silverNeed = Math.ceil(left / 300);
            if (S.白银 >= silverNeed) {
              S.白银 -= silverNeed;
              log.push(['〔束脩纸墨〕铜钱不够，改从白银支出 ' + silverNeed + ' 两。', 'bad']);
            } else {
              var gap = silverNeed - S.白银;
              S.白银 = 0; S.负债银 += gap;
              log.push(['〔束脩纸墨〕供读链吃紧，读书成本最终压成债（负债+' + gap + '两）。', 'bad']);
            }
          }
        }

        var mouths = (S.读书方式 === '社学寄读') ? 1 : 2;
        if (S.本年归家次数 > 0) mouths = Math.max(1, mouths - 1);
        if (S.存米 >= mouths) {
          S.存米 -= mouths;
          log.push(['〔口粮〕这一举业年口粮计 ' + mouths + ' 石（存米-' + mouths + '）', 'bad']);
        } else {
          var lack = mouths - S.存米;
          S.存米 = 0;
          if (S.铜钱 >= lack * 350) {
            S.铜钱 -= lack * 350;
            log.push(['〔口粮〕家中米不够，籴米补口粮：铜钱-' + (lack * 350), 'bad']);
          } else {
            S.负债银 += lack;
            S.体魄 -= 4;
            log.push(['〔口粮〕读书也照样吃饭，家里只得举债糊口（负债+' + lack + '两、体魄-4）', 'bad']);
          }
        }

        if (rand() < 0.35) {
          if (S.优免启用) {
            if (S.铜钱 >= 80) { S.铜钱 -= 80; log.push(['〔赋役〕因已是生员，本年差徭外流减轻，只花铜钱80文代役。', 'good']); }
            else { log.push(['〔赋役〕因已是生员，本年差徭外流减轻，但并非一文不出。', 'good']); }
          } else if (S.本年备役次数 > 0) {
            log.push(['〔赋役〕先前留出的一角差役钱派上了用场，这一回没有再临时拆别的现钱。', 'good']);
          } else if (S.铜钱 >= 200) {
            S.铜钱 -= 200;
            log.push(['〔赋役〕本户轮到差役，拿铜钱200文找人顶上。', 'bad']);
          } else {
            S.体魄 -= 5; S.家族 -= 2;
            log.push(['〔赋役〕无钱代役，只得误业应付差役（体魄-5、家族-2）。', 'bad']);
          }
        }
        if (S.负债银 > 0) {
          var oldDebt = S.负债银;
          var interest = Math.ceil(oldDebt * DEBT_RATE);
          S.负债银 += interest;
          log.push(['〔债息〕旧债 ' + oldDebt + ' 两滚息 ' + interest + ' 两（负债→' + S.负债银 + '）', 'bad']);
        }

        if (!progressed && !S.生员身份 && didStudy) {
          S.供读压力 += 1;
          log.push(['这一年供读有投入却未见推进，家里继续供你的压力又重了一层。', 'bad']);
        }
        if ((S.本年馆课次数 + S.本年半读次数 + S.本年寄读次数 + S.本年评文次数) <= 0) {
          S.家族 -= 2;
          log.push(['这一举业年没真把多少时辰落到课业与文章上，家里难免觉得你只是在拖账（家族-2）。', 'bad']);
        } else if (S.本年馆课次数 > 0 && S.本年评文次数 > 0 && S.本年保结次数 > 0) {
          log.push(['这一举业年你既稳住了馆课、也磨了文章、还把资格门槛跑通，读书路终于不再像一张“只说要考”的空纸。', 'good']);
        }
        if (S.供读压力 >= 4) S.供读状态 = '已断供';
        else if (S.供读压力 >= 2) S.供读状态 = '断供边缘';
        else if (S.生员身份) S.供读状态 = '生员在案';
        else S.供读状态 = '家中供读';

        clampAttr('体魄'); clampAttr('家族');
        if (S.举业年 < EXAM_YEARS) {
          curStage.next = 'civilExam';
          curStage.nextLabel = '再过一年举业 →';
          S._advanceExamYear = true;
        } else {
          if (S.生员身份) S.举业结局 = '成生员';
          else if (S.供读状态 === '已断供') S.举业结局 = '断供改路';
          else if (S.识字转业值 >= 2) S.举业结局 = '屡试未第';
          else S.举业结局 = '仍是童生';
          curStage.next = 'marriage';
          curStage.nextLabel = '带着这三年账本去议亲 →';
          S.年龄 = 20;
        }
      }
    };
  }

  function marriageRoutePack() {
    var baseShowBonus = (S.识字 ? 0.12 : 0) + (S.技艺 !== '无' ? 0.12 : 0);
    var baseShowCan = S.识字 || S.技艺 !== '无';
    var baseShowLog = '亮出' + (S.识字 ? '识字' : '') + (S.识字 && S.技艺 !== '无' ? '、' : '') + (S.技艺 !== '无' ? '手艺' : '') + '身价（成算增）';
    var pack = {
      note: '',
      narrative: '',
      dossier: '',
      event: null,
      baseAdj: 0,
      showName: '显本事·亮身价',
      showEff: baseShowCan ? '成算+（识字/手艺抬行情）' : '（无识字手艺可亮）',
      showDesc: '让女方家看到你识字或有手艺——佃农子跳板。',
      showCan: baseShowCan,
      showWhy: baseShowCan ? '' : '尚无识字或手艺',
      showBonus: baseShowBonus,
      showLog: baseShowLog,
      extraActions: []
    };

    if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      pack.note = '学徒路议亲看重的，不只是识字，还看你三年后到底有没有坐实去向。';
      pack.dossier = '学徒去向=' + S.学徒去向 + '｜授艺度=' + S.学徒授艺度 + '｜学徒历练=' + S.学徒历练;
      pack.event = { t: 'rel', tag: '[去向]', txt: '媒人会打听你这三年学徒到底是留店、坐店工、跟货学生意，还是仍旧归乡另谋。学过几年是一回事，最后有没有坐实去处又是另一回事。' };
      if (S.学徒去向 === '留店伙计') {
        pack.baseAdj = 0.06;
        pack.showName = '显去向·说你已留店';
        pack.showEff = '成算++（店里已有去处）';
        pack.showDesc = '让女方家知道你不是白熬三年，如今已有店中去处。';
        pack.showBonus = 0.16;
        pack.showLog = '亮出你已留店做伙计的去向（成算大增）';
      } else if (S.学徒去向 === '店铺做工') {
        pack.baseAdj = 0.03;
        pack.showName = '显门道·说你已坐店工';
        pack.showEff = '成算+（已有营生）';
        pack.showDesc = '虽未留原店，但已能凭这三年门道在别家店里吃饭。';
        pack.showBonus = 0.10;
        pack.showLog = '亮出你已有店铺做工去向（成算增）';
      } else if (S.学徒去向 === '随行商') {
        pack.baseAdj = 0.02;
        pack.showName = '显见识·说你跟货学生意';
        pack.showEff = '成算+（见过市面）';
        pack.showDesc = '你常在外跑货，见识和活路都更活一些，但安稳度未必最好。';
        pack.showBonus = 0.08;
        pack.showLog = '亮出你跟货学生意、见过外头路数（成算增）';
      } else if (S.学徒历练 > 0) {
        pack.baseAdj = 0.01;
        pack.showName = '显见识·说你在城里历练过';
        pack.showEff = '成算小增';
        pack.showDesc = '虽未坐实去处，好歹见过铺面规矩，不全是空手回乡。';
        pack.showBonus = 0.05;
        pack.showLog = '亮出你在城里历练过几年（成算小增）';
      }
    } else if (S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0) {
      pack.note = '商路议亲看的是回钱、旧账和顾不顾家，不是只看你在外跑过多少路。';
      pack.dossier = '商身份=' + S.商身份 + '｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉 + '｜未回款=' + S.未回款银 + '两｜累计反哺=' + S.累计反哺银 + '两｜供读银=' + S.商路供读银 + '两';
      pack.event = { t: 'rand', tag: '[账期]', txt: '在外学生意，媒人不认“路上银”，只认你手里现钱、这些年有没有寄回过银、账上还有没有旧货款压着。' };
      pack.baseAdj = S.累计反哺银 >= 2 ? 0.04 : ((S.账房进度 + S.商信誉) >= 3 ? 0.02 : 0);
      pack.showName = '亮账面·说这些年有回钱';
      pack.showCan = S.商历练 > 0 || S.累计反哺银 > 0 || S.账房进度 > 0 || S.未回款银 > 0;
      pack.showWhy = pack.showCan ? '' : '眼下还无可亮的商路账面';
      pack.showDesc = '让女方家看到你这几年不是空跑商路：账面门道、回家银路、旧账压力都摆在眼前。';
      pack.showBonus = (S.累计反哺银 >= 2 ? 0.14 : (S.累计反哺银 >= 1 ? 0.10 : 0.04)) + ((S.账房进度 + S.商信誉) >= 3 ? 0.04 : 0) - (S.未回款银 > 0 ? 0.03 : 0) - (S.商路亏折 > 0 ? 0.02 : 0);
      pack.showBonus = Math.max(0, pack.showBonus);
      pack.showLog = '亮出这几年回家的银路与账面门道（成算增）';
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'm_collect', name: '折价催收旧账', cost: 1, eff: '未回款→部分现银·成算+', desc: '议亲前先把路上旧账折价催回来一些，媒人才认得手里现银。', can: true, once: true });
      }
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
      pack.note = '读书路议亲看的是名分与退路：生员、童生、屡试未第或断供改路，行情并不一样。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜童试层级=' + S.童试层级 + '｜识字转业值=' + S.识字转业值 + (S.生员身份 ? '｜已入泮（优免只减流出，不算现银）' : '');
      pack.event = { t: 'rel', tag: '[名分]', txt: '读书人议亲，看重的不只是识字，而是你如今是生员、仍是童生，还是已断供改路。供读过几年，未必就能换来一纸体面。' };
      if (S.生员身份) {
        pack.baseAdj = 0.12;
        pack.showName = '凭生员名色托媒';
        pack.showEff = '成算++（名分抬行情）';
        pack.showDesc = '让媒人明说你已入泮。体面与优免会抬一抬行情，但不等于白银入账。';
        pack.showCan = true;
        pack.showWhy = '';
        pack.showBonus = 0.18;
        pack.showLog = '凭生员名色托媒（成算大增）';
      } else if (S.举业结局 === '屡试未第') {
        pack.baseAdj = 0.03;
        pack.showName = '亮笔墨·说可教蒙童';
        pack.showEff = '成算+（有识字营生）';
        pack.showDesc = '虽未得功名，但已能把笔墨底子转成教书、账房、书手的活路。';
        pack.showCan = S.识字 || S.识字转业值 >= 2;
        pack.showWhy = pack.showCan ? '' : '尚无可亮的笔墨底子';
        pack.showBonus = 0.10;
        pack.showLog = '亮出你虽未中式，却已有笔墨营生的去处（成算增）';
        if (S.识字 && S.识字转业值 >= 2) {
          pack.extraActions.push({ id: 'm_tutor', name: '代馆教蒙童', cost: 1, eff: '铜钱+120·家族+2·成算+', desc: '多年应举虽未得功名，但可先代塾师带几名蒙童，换一点体面与现钱。', can: true, once: true });
        }
      } else if (S.举业结局 === '断供改路') {
        pack.baseAdj = 0;
        pack.showName = '亮识字底子';
        pack.showEff = '成算小增';
        pack.showDesc = '家里虽已断供，但你多少还留下几分识字和笔墨底子。';
        pack.showCan = S.识字;
        pack.showWhy = S.识字 ? '' : '尚不识字';
        pack.showBonus = S.识字 ? 0.04 : 0;
        pack.showLog = '亮出你仍有一层识字底子（成算小增）';
        if (S.识字) {
          pack.extraActions.push({ id: 'm_copywork', name: '替人抄账写契', cost: 1, eff: '铜钱+180·成算+', desc: '既已断供，就先把识字底子换成现钱：替商号、地主抄单写契，先攒聘资。', can: true, once: true });
        }
      } else {
        pack.baseAdj = -0.05;
        pack.showName = '亮识字底子';
        pack.showEff = S.识字 ? '成算小增' : '（无识字可亮）';
        pack.showDesc = '仍是童生，媒人看的是你眼下到底有没有坐实营生。';
        pack.showCan = S.识字;
        pack.showWhy = S.识字 ? '' : '尚不识字';
        pack.showBonus = S.识字 ? 0.06 : 0;
        pack.showLog = '亮出你这些年读下来的识字底子（成算小增）';
      }
    }
    return pack;
  }

  // ── 成家：多维行动点循环 —— 攒聘礼/托媒/凭路线尾账增议亲筹码 ──
  function stageMarriage() {
    var rp = marriageRoutePack();
    var life = currentLifeProfile();
    var fertility = childbearingProfile();
    var events = [{ t: 'rel', tag: '[关系]', txt: '女方是邻村自耕农之女，有自己的意愿：她与父母看重的是这户的家底与后生的本分，不是你单方面"提亲"就能定。' }];
    if (rp.event) events.push(rp.event);
    function scheduleMarriageRetry(log, retryLine, finalLine, familyPenaltyRetry, familyPenaltyFinal) {
      S._marriageAttempts = (S._marriageAttempts || 0) + 1;
      var nextAdj = (S._marriageAgeAdj || 0) + 2;
      var maxTries = 2; // 防止无限拖延：最多再议亲两轮（即 +4 年）
      if (S._marriageAttempts <= maxTries && (currentLifeProfile().marriageAge + 2) < (currentLifeProfile().householdAge - 2)) {
        S._marriageAgeAdj = nextAdj;
        if ((familyPenaltyRetry || 0) > 0) S.家族 -= familyPenaltyRetry;
        curStage.next = 'marriage';
        curStage.nextLabel = '再攒两年再议亲 →';
        log.push([retryLine, 'bad']);
        return true;
      }
      if ((familyPenaltyFinal || 0) > 0) S.家族 -= familyPenaltyFinal;
      log.push([finalLine, 'bad']);
      return false;
    }
    return {
      title: '成家 · 议亲', label: '成家', next: 'family', nextLabel: '成家之后 · 养家长账 →',
      ap: 4, commitLabel: '下聘·定亲事 →',
      note: '成家不是一次"选套餐"，而是几年里一步步攒钱、托媒、抬身价：聘礼是真实外流（镜像入女方家账），媒人看的是你带到这个年纪的整本账。〔货币规模为玩法占位，非史实点值〕 ' + life.marriageLead + ' 这一代当前按<span class="em">' + S.年龄 + '岁</span>议亲，婚后走的是<span class="em">' + fertility.label + '</span>生育窗口。' + (S.定额佃状态 === '已立定额佃' ? ' 上一轮你已把一两现银压进定额佃约，婚事正是沿着这本押租账往后拖。' : '') + (S.合爨状态 === '随兄合户' ? ' 眼下仍在兄户合爨；若再不另立小家，这份共账会直接被带进父故后的分家与当户。' : '') + (S.婚配路径 === '先应差·外出佣工' ? ' 上一轮你先拿现银顶过差役、又外出佣工攒回几手现钱，婚事便沿着这本外出工账继续顺延。' : '') + (rp.note ? ' ' + rp.note : ''),
      narrative: '立身数年，你已<span class="em">' + S.年龄 + '岁</span>，也到了议亲年纪。走"六礼"框架（平民多简化合并）——这一程你有 <span class="em">4 个行动点</span>，用来筹聘礼、托媒人、办酒席。你这些年攒下的<span class="em">识字、手艺、家族声望与路线尾账</span>，都会折进议亲的成算里；婚成之后，下一阶段读的也是这一路带出来的<span class="em">' + fertility.label + '</span>婚育窗口。' + (S.定额佃状态 === '已立定额佃' ? ' 这一回你不是白手重来，而是带着上一轮已经立下的定额佃押租账继续议亲。' : '') + (S.合爨状态 === '随兄合户' ? ' 若改走合爨，这一程便不是“先成婚再当户”，而是把婚配与立户原题一起拖进后面的共账清算。' : '') + (S.婚配路径 === '先应差·外出佣工' ? ' 你先前已经把一回差役和外出工账顶了过去，如今再议亲时，媒人看的也不只是现钱多少，还看这层城里落脚与工头熟识是不是能坐实。' : '') + (rp.narrative ? rp.narrative : ''),
      dossier: function () { return lifeDossier('议亲成算 = 基础 + 路线结局 + 聘礼档 + 识字/营生加成 + 家族声望；下聘时按当前筹码一次性 roll。｜婚配年龄=' + life.marriageAge + '｜婚育窗口=' + fertility.label + (rp.dossier ? '｜' + rp.dossier : '')); },
      events: events,
      prompt: '这几年怎么张罗亲事？（分配 4 点，末了一次下聘）',
      actions: function () {
        var A = [];
        var pickedGift = lifePicks.some(function (p) { return p.id === 'm_gift' || p.id === 'm_gift1'; });
        var pickedMarriageBranch = lifePicks.some(function (p) { return p.id === 'm_fixedrent' || p.id === 'm_joint' || p.id === 'm_wage_out'; });
        A.push({ id: 'm_save', name: '卖粮·攒聘礼', cost: 1, eff: '存米-1·白银+1（备聘）', desc: '把余粮换成硬通货备作聘礼。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '无存米可卖' });
        A.push({ id: 'm_gift', name: '厚备聘礼', cost: 2, eff: '白银-3·聘礼档↑↑·成算+', desc: '以银三两下重聘，风光正娶，行情最高。', can: !pickedGift && !pickedMarriageBranch && S.白银 >= 3, why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= 3 ? '' : '白银不足3两')), once: true });
        A.push({ id: 'm_gift1', name: '薄备聘礼', cost: 1, eff: '白银-1·聘礼档↑·成算+', desc: '尽力凑一份体面的薄聘。', can: !pickedGift && !pickedMarriageBranch && S.白银 >= 1, why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= 1 ? '' : '白银不足1两')), once: true });
        A.push({ id: 'm_borrow', name: '向义庄借银', cost: 1, eff: '负债+3两·白银+3（供下聘）', desc: '宗族义庄借贷办婚，先成家后还债。', can: true, once: true });
        A.push({ id: 'm_match', name: '托媒·多方相看', cost: 1, eff: '家族+2·成算+（媒妁之言）', desc: '多走几家媒人，抬一抬相看的成算。', can: true });
        A.push({ id: 'm_show', name: rp.showName, cost: 1, eff: rp.showEff, desc: rp.showDesc, can: rp.showCan, why: rp.showWhy });
        rp.extraActions.forEach(function (x) { A.push(x); });
        if (isFarmRouteState()) {
          A.push({
            id: 'm_fixedrent',
            name: '暂不婚·改定额佃',
            cost: 2,
            eff: '白银-1·立定额佃账·婚事推迟两年',
            desc: '把原本想作聘银的一两先压成押租，改立定额佃约，先把经营自主与农事底子攒出来，婚事两年后再议。',
            can: !pickedGift && !pickedMarriageBranch && S.白银 >= 1,
            why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= 1 ? '' : '白银不足1两')),
            once: true
          });
          A.push({
            id: 'm_joint',
            name: '合爨随兄·缓立小家',
            cost: 2,
            eff: '并账缓婚·家族+3·先把小户压力压下',
            desc: '暂不分爨、不另立小家，先把账并回兄户共耕：婚事与立户原题不消失，只是带着合爨余绪往后拖。',
            can: !pickedGift && !pickedMarriageBranch,
            why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : ''),
            once: true
          });
        }
        if (isWageRouteState()) {
          var marriageOut = wageMarriageOutworkProfile();
          A.push({
            id: 'm_wage_out',
            name: '先应差·外出佣工',
            cost: 2,
            eff: marriageOut.effect,
            desc: marriageOut.desc,
            can: !pickedGift && !pickedMarriageBranch && S.白银 >= marriageOut.silverCost,
            why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= marriageOut.silverCost ? '' : ('白银不足' + marriageOut.silverCost + '两'))),
            once: true
          });
        }
        A.push({ id: 'm_wait', name: '暂缓·先积累', cost: 1, eff: '体魄+4（不催婚）', desc: '这一程先不急，养身攒钱。', can: true });
        return A;
      },
      settle: function (log) {
        var giftTier = 0, chance = 0.35 + rp.baseAdj;
        var borrowedForGift = false;
        var fixedRentChosen = false, jointChosen = false, wageOutChosen = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'm_save': S.存米 -= 1; S.白银 += 1; log.push(['卖粮备聘：存米-1、白银+1', 'good']); break;
            case 'm_gift': S.白银 -= 3; giftTier = 2; chance += 0.40; log.push(['厚备聘礼：银-3下重聘（成算大增）', 'bad']); break;
            case 'm_gift1': S.白银 -= 1; giftTier = Math.max(giftTier, 1); chance += 0.20; log.push(['薄备聘礼：银-1（成算增）', 'bad']); break;
            case 'm_borrow':
              S.负债银 += 3; S.白银 += 3;
              borrowedForGift = true;
              log.push(['义庄借银3两供下聘（负债+3、白银+3）', 'bad']);
              break;
            case 'm_match': S.家族 += 2; chance += 0.12; log.push(['托媒多方相看：家族+2（成算增）', 'good']); break;
            case 'm_show': chance += rp.showBonus; log.push([rp.showLog, 'good']); break;
            case 'm_collect':
              var owed = S.未回款银;
              var got = Math.max(1, Math.ceil(owed * 0.6));
              var lost = Math.max(0, owed - got);
              S.白银 += got; S.未回款银 = 0; if (lost > 0) S.商路亏折 += lost; chance += 0.08;
              log.push(['折价催收旧账：未回款' + owed + '两里先收回白银+' + got + (lost > 0 ? '，另有' + lost + '两只得认亏' : '') + '（成算增）', 'good']);
              break;
            case 'm_copywork':
              S.铜钱 += 180; chance += 0.08;
              log.push(['替人抄账写契：铜钱+180，让女方家看见你不是空读书（成算增）', 'good']);
              break;
            case 'm_tutor':
              S.铜钱 += 120; S.家族 += 2; chance += 0.10;
              log.push(['代馆教蒙童：铜钱+120、家族+2；虽无功名，已有几分体面营生（成算增）', 'good']);
              break;
            case 'm_fixedrent':
              if (S.白银 >= 1) {
                S.白银 -= 1;
                S.定额佃状态 = '已立定额佃';
                S.婚配路径 = '暂不婚·改定额佃';
                S.农事历练 += 1;
                fixedRentChosen = true;
                log.push(['暂不婚改定额佃：白银-1作押租，先把定额佃账立起来；这一步不直接给你好结局，只把婚事往后推，也把农事底子往后带。', 'good']);
              }
              break;
            case 'm_joint':
              S.婚配路径 = '合爨随兄';
              S.合爨状态 = '随兄合户';
              S.家族 += 3;
              S.存米 += 1;
              jointChosen = true;
              log.push(['合爨随兄：你这一程不另立小家，先把账并回兄户共耕；家族+3、存米+1，但婚事与立户原题都被整体推后。', 'good']);
              break;
            case 'm_wage_out':
              var marriageOut = wageMarriageOutworkProfile();
              if (S.白银 >= marriageOut.silverCost) {
                S.白银 -= marriageOut.silverCost;
                S.铜钱 += marriageOut.copper;
                S.家族 -= marriageOut.familyCost;
                S.雇工历练 += 1;
                S.雇身份 = '外出佣工';
                S.婚配路径 = '先应差·外出佣工';
                S.城里门路 = Math.max(S.城里门路 || 0, marriageOut.cityDoor);
                wageOutChosen = true;
                log.push(['先应差再外出佣工：白银-' + marriageOut.silverCost + '、铜钱+' + marriageOut.copper + (marriageOut.familyCost > 0 ? ('、家族-' + marriageOut.familyCost) : '、家族不减') + '；婚事往后顺延，但城里牙口与工头熟识也被真实坐进这一房的账里。', 'good']);
              }
              break;
            case 'm_wait': S.体魄 += 4; log.push(['暂缓催婚，养身：体魄+4', 'good']); break;
          }
        });
        if (jointChosen) {
          S._marriageAttempts = 0;
          curStage.next = 'household';
          curStage.nextLabel = '带着合爨余绪去当户 →';
          log.push(['这一程没有另立小家，而是带着“合爨随兄”的共账、口粮与面子继续往后走；到父故分家时，这份缓冲也得一并清账。', 'good']);
          return;
        }
        if (fixedRentChosen) {
          scheduleMarriageRetry(
            log,
            '把原本想作聘银的一两先压成押租，改走定额佃约；婚事推迟两年（后面这份经营自主与农事底子会继续写进当户账）',
            '把原本想作聘银的一两先压成押租，改走定额佃约；婚事仍未赶上，这一房只得先带着单身与薄田往后过（后续仍可能走向绝嗣过继分支）',
            0,
            1
          );
          return;
        }
        if (wageOutChosen) {
          scheduleMarriageRetry(
            log,
            '先把这一程差役用现银顶过，再外出佣工攒回几手现钱；婚事推迟两年，往后会带着这本外出工账与一层城里门路再回来议亲。',
            '先把这一程差役与外出工账顶过去后，婚事仍没赶上；这一房只得先带着单身、薄田与外头门路往后过（后续仍可能走向绝嗣过继分支）',
            0,
            1
          );
          return;
        }
        chance += Math.min(0.10, S.家族 >= 70 ? 0.10 : 0);
        chance = Math.max(0.05, Math.min(0.95, chance));
        var pct = Math.round(chance * 100);
        // “借银”本身就是为下聘凑现银：若本轮未点“薄聘/重聘”，则按“薄聘”口径自动从现银里划出 1 两下聘，
        // 避免出现“明明借了银，却被判定没备聘礼”的断链。
        if (giftTier === 0 && borrowedForGift && S.白银 >= 1) {
          S.白银 -= 1;
          giftTier = 1;
          chance += 0.18;
          log.push(['借来的一两先作薄聘下聘：白银-1（成算增）', 'bad']);
        }
        if (giftTier === 0) {
          // 视为“被推迟事项”：允许再议亲，并把推迟真实落到年龄与婚育窗口上。
          scheduleMarriageRetry(
            log,
            '这一程仍凑不出可下聘的聘银，婚事推迟两年（家族-1；推迟会改写婚育窗口）',
            '这一程仍未能成婚：先把日子过下去（家族-2；后续仍可能走向绝嗣过继分支）',
            1,
            2
          );
          return;
        }
        var r = rollProb([{ p: chance, r: 'wed' }, { p: 1 - chance, r: 'fail' }]);
        if (r === 'wed') {
          S.妻室 = true;
          S._marriageAtAge = S.年龄;
          S._marriageAttempts = 0;
          var dowry = giftTier === 2 ? 800 : 500;
          S.铜钱 += dowry; S.家族 += giftTier === 2 ? 10 : 6;
          log.push(['〔女方应允〕成婚成算约 ' + pct + '%，命中！妻带奁产铜钱+' + dowry + '、家族+' + (giftTier === 2 ? 10 : 6), 'good']);
          bearChildren(log);
        } else {
          if (giftTier === 2) {
            S.白银 += 1;
            scheduleMarriageRetry(
              log,
              '〔女方另议〕成算约 ' + pct + '%，未成。退回部分重聘白银+1；这一回记为被推迟事项，隔两年还能再议（家族-1；婚育窗口随之改写）',
              '〔女方另议〕成算约 ' + pct + '%，未成。退回部分重聘白银+1；这一房先把后面的日子过下去（家族-2；后续仍可能走向绝嗣过继分支）',
              1,
              2
            );
          } else {
            scheduleMarriageRetry(
              log,
              '〔女方另议〕成算约 ' + pct + '%，未成。薄聘已花；这一回记为被推迟事项，隔两年还能再议（家族-1；婚育窗口随之改写）',
              '〔女方另议〕成算约 ' + pct + '%，未成。薄聘已花；这一房先把后面的日子过下去（家族-2；后续仍可能走向绝嗣过继分支）',
              1,
              2
            );
          }
        }
      }
    };
  }

  function householdRoutePack() {
    var pack = { note: '', dossier: '', event: null, baseAdj: 0, extraActions: [] };
    if (isFarmRouteState() || isWageRouteState()) {
      if (isFarmRouteState()) {
        pack.note = '留乡佃田到了当户，看的是分得那 4 亩薄田到底守成自耕，还是另立租账把口粮稳住。你先前积下的农事历练、识字与乡里换工，此时都会折成“能不能把小户撑住”。';
        if (S.定额佃状态 === '已立定额佃') pack.note += ' 先前为缓婚而改立的定额佃约，并不会替你自动免灾，却说明你早几年就把“经营自主”压进了这几亩薄田。';
        if (S.合爨状态 === '随兄合户' || S.合爨状态 === '已析爨') pack.note += ' 先前合爨随兄省下的那点缓冲，如今也要跟着共账一起摊到分家与当役上。';
        pack.dossier = '农事历练=' + S.农事历练 + '｜家传农事=' + (S.家传农事 || 0) + '｜识字=' + (S.识字 ? '是' : '否') + '｜婚配路径=' + S.婚配路径 + '｜定额佃=' + S.定额佃状态 + '｜合爨=' + S.合爨状态 + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + S.委托租谷 + '｜待收租谷=' + (S.委托待收租谷 || 0) + '｜应役=' + S.应役;
        pack.event = { t: 'rel', tag: '[薄田]', txt: '分家后这 4 亩薄田就是你这一房的根脚。守住它，老来至少还有一口口食；若这一任当户把田面赔进去，下一代就会重新落回“有门路没田面”或“既没田也没门路”的窄路。' };
        if (S.家传农事 > 0) pack.baseAdj -= 0.03;
        if (S.农事历练 >= 4) pack.baseAdj -= 0.05;
        else if (S.农事历练 >= 2) pack.baseAdj -= 0.02;
      } else {
        pack.note = '雇工路到了当户，关键转折不是“忽然发财”，而是这辈子第一次真把 4 亩薄田拿到自己名下：要么转成半自耕、少受人拿捏；要么先出佃收租，保住口粮再继续卖工。';
        if (S.合爨状态 === '随兄合户' || S.合爨状态 === '已析爨') pack.note += ' 先前若合爨随兄，眼下就不是从“一个人硬扛”起步，而是先从共账里清出你这一房该背与该分的那一部分。';
        if (S.婚配路径 === '先应差·外出佣工') pack.note += ' 当年先拿现银顶过差役、再外出佣工那一步，并没有消失；到了当户这年，你手里多的是一层外头牙口和旧工头的人情，不必只剩本宗这一条路。';
        if (S.城里门路 > 0) pack.note += ' 这些年在外跑出来的城里熟识，也会改写你请人代办、问价和落脚的难易。';
        pack.dossier = '农事历练=' + S.农事历练 + '｜家传农事=' + (S.家传农事 || 0) + '｜雇工历练=' + S.雇工历练 + '｜婚配路径=' + S.婚配路径 + '｜定额佃=' + S.定额佃状态 + '｜合爨=' + S.合爨状态 + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + S.委托租谷 + '｜待收租谷=' + (S.委托待收租谷 || 0) + '｜应役=' + S.应役;
        pack.event = { t: 'rel', tag: '[得田]', txt: '你前半生靠卖工吃饭，到这一步才第一次有了可写进自己户下的薄田。它未必够一家人吃饱，却能决定你老来还剩不剩一口自己能支配的口粮。' };
        if (S.家传农事 > 0) pack.baseAdj -= 0.03;
        if (S.雇工历练 >= 3) pack.baseAdj -= 0.03;
        if (S.农事历练 >= 2) pack.baseAdj -= 0.02;
        if (S.城里门路 > 0) pack.baseAdj -= 0.03;
      }
      if (S.定额佃状态 === '已立定额佃') pack.baseAdj -= 0.02;
      if (S.合爨状态 === '随兄合户') pack.baseAdj -= 0.04;
      if (S.识字) pack.baseAdj -= 0.03;
      if (S.委托营生 === '无' || S.委托营生 === '分得薄田自耕') {
        pack.extraActions.push({
          id: 'h_hold_field',
          name: isFarmRouteState() ? '守着分得薄田自耕' : '把分得薄田改作自耕',
          cost: 1,
          eff: isFarmRouteState()
            ? ('立薄田自耕账·存米+' + (1 + ((S.家传农事 || 0) > 0 ? 1 : 0)) + (((S.家传农事 || 0) > 0) ? '·农事历练+1' : '') + '·风险降')
            : ('半自耕半卖工·存米+' + (1 + ((S.家传农事 || 0) > 0 ? 1 : 0)) + '·农事历练+' + ((S.家传农事 || 0) > 0 ? 2 : 1) + '·风险降'),
          desc: isFarmRouteState()
            ? '分家后把那 4 亩当作自家薄底，亲自照看、靠换工与认税则把这一房先稳住。'
            : '卖工多年后终于把这 4 亩攥到手里：先拿一部分时日回头顾田，把“无地雇工”改成“半自耕半卖工”。',
          can: true,
          once: true
        });
      }
      if (S.委托租谷 <= 0) {
        pack.extraActions.push({
          id: 'h_lease_home',
          name: isFarmRouteState() ? '把薄田另立佃约收租' : '把薄田出佃保口粮',
          cost: 1,
          eff: '立委托经营账·年租谷+1·风险降',
          desc: isFarmRouteState()
            ? '若不愿把一家老小都压在亲耕上，就把分得的薄田另立租账，租谷只算你这一房的老底。'
            : '你还得继续靠卖工挣现钱，就先把薄田出佃换稳定租谷，免得当役与农闲断工两头一起掐脖子。',
          can: true,
          once: true
        });
      }
      if (isWageRouteState() && S.城里门路 > 0) {
        pack.extraActions.push({
          id: 'h_proxy_wage',
          name: '凭旧工头请人代应',
          cost: 1,
          eff: '白银-1或铜钱-180·风险降',
          desc: '年轻时外出佣工攒下的牙口与旧工头，此时可替你请人代应，不必凡事都回乡里硬扛。',
          can: true,
          once: true
        });
      }
      if (S.合爨状态 === '随兄合户') {
        pack.extraActions.push({
          id: 'h_split_joint',
          name: '父故后析爨清共账',
          cost: 1,
          eff: '铜钱+180·家族-1·立独户账·风险降',
          desc: '趁父故分家这一步，把先前随兄合爨的共账清出来：不是白得一份家财，而是把这些年攒下的合力余粮与人情，一并折成你这一房自己的独户账。',
          can: true,
          once: true
        });
      }
    } else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      pack.note = '学徒路到了当户，看的是去向是否坐实，能不能把城中门路换成代办与担保。';
      pack.dossier = '学徒去向=' + S.学徒去向 + '｜学徒历练=' + S.学徒历练 + '｜授艺度=' + S.学徒授艺度;
      pack.event = { t: 'rel', tag: '[去向]', txt: '乡里这时要看的，不只是你年轻时学过几年徒，而是你如今到底已留店、已坐店工，还是仍旧归乡另谋。门路坐不坐实，会直接影响你这一任当户能否请人代办。' };
      if (S.学徒去向 === '留店伙计') pack.baseAdj = -0.06;
      else if (S.学徒去向 === '店铺做工') pack.baseAdj = -0.04;
      else if (S.学徒去向 === '随行商') pack.baseAdj = -0.02;
      if ((S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') && (S.白银 >= 1 || S.铜钱 >= 150)) {
        pack.extraActions.push({ id: 'h_proxy', name: '凭师门门路请人代办', cost: 1, eff: '白银-1或铜钱-150·风险降', desc: '若你已留店或坐店工，可借店里门路请人代应里役，不必全靠本宗硬扛。', can: true, once: true });
      }
      if ((S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') && S.委托租谷 <= 0) {
        pack.extraActions.push({ id: 'h_lease_city', name: '把分得薄田出佃收租', cost: 1, eff: '立委托经营账·年租谷+1·风险降', desc: '你人在城里，就把分得的薄田立约出佃：租谷归你，欠租记应收，不再硬把身子摁回田里。', can: true, once: true });
      }
    } else if (S.路线.indexOf('徽商') === 0 || S.累计反哺银 > 0 || S.未回款银 > 0 || S.商历练 > 0) {
      pack.note = '商路到当户，看的是旧账、回钱与顾不顾家，不是只看你跑过多少路。';
      pack.dossier = '累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉;
      pack.event = { t: 'rand', tag: '[账期]', txt: '里甲不认“路上银”，只认你眼下能不能拿出代役钱；乡里却记得你这些年有没有寄银回家。账在外，役在乡，两头都要结。' };
      if (S.累计反哺银 >= 2) pack.baseAdj -= 0.04;
      if ((S.账房进度 + S.商信誉) >= 3) pack.baseAdj -= 0.03;
      if (S.未回款银 > 0) pack.baseAdj += 0.03;
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'h_collect', name: '折价催收旧账备役银', cost: 1, eff: '未回款→部分现银·风险降', desc: '先把旧账催回一点，里甲才认得手里的钱。', can: true, once: true });
      }
      if (S.委托租谷 <= 0) {
        pack.extraActions.push({ id: 'h_trust_field', name: '托兄代管分得薄田', cost: 1, eff: '立委托经营账·年租谷+1·家族+2·风险降', desc: '你常年在外，把分得的 4 亩交兄长代管并分账结租，换来稳定租谷与代役照应。', can: true, once: true });
      }
      if (S.白银 >= 1) {
        pack.extraActions.push({ id: 'h_school_fund', name: '划银为供读专账', cost: 1, eff: '白银-1·供读专账+1·家族+2', desc: '从现钱里单独划出一两，明说留给下一代读书。它不算随手可花的现银，但会改变后面的承接。', can: true, once: true });
      }
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用) {
      pack.note = '举业路到了当户，看的是名分与退路：生员可减一层差役外流，童生与屡试未第者仍要回到现银与笔墨活路。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜优免=' + (S.优免启用 ? '启用' : '未启用') + '｜识字转业值=' + S.识字转业值;
      pack.event = { t: 'rel', tag: '[名分]', txt: S.生员身份 ? '乡里认你这一层名色，但名色不是现银；它能减轻一部分差役外流，却不能替你凭空生出代役钱。' : '若你多年应举仍未入泮，乡里就不看“读过几年书”，只看你如今能不能把笔墨底子换成核账、教馆或抄写的活路。' };
      if (S.生员身份 || S.优免启用) {
        pack.baseAdj -= 0.12;
        pack.extraActions.push({ id: 'h_exempt', name: '凭名色申优免缓派', cost: 1, eff: '生员优免·风险降', desc: '若你已入泮，可凭名色争取减轻差役外流。优免只减外流，不生现钱。', can: true, once: true });
      }
      if ((S.生员身份 || S.识字 || S.识字转业值 >= 2) && S.铜钱 >= 0) {
        pack.extraActions.push({ id: 'h_copy_mid', name: '以笔墨代写文契', cost: 1, eff: '铜钱+160·风险降', desc: '分家立户之际替人抄账写契，先把识字底子换成一点现钱，也让乡里知道你不是白读书。', can: S.识字 || S.识字转业值 >= 2, once: true });
      }
    }
    return pack;
  }

  // ── 养家：把成家到当户之间的长账拆成“四季循环” ──
  // 设计目标：让单代一生在 20~40 岁之间也有“年内节奏与内容密度”，而不是一跳跳过。
  // 约束：不引入成功分/最优评分；不破坏现有守恒与不变量；尽量不额外消耗 RNG（保持回放可比）。
  function stageFamily() {
    var life = currentLifeProfile();
    var seasonIdx = Math.max(1, Math.min(4, S.家季 || 1));
    var seasonName = SOLAR[seasonIdx - 1];
    var year = Math.max(1, S.家年 || 1);
    var baseStartAge = (S._marriageAtAge != null ? S._marriageAtAge : life.marriageAge) + 1;
    var targetAge = life.householdAge;
    var route = S.路线 || '';

    // “行情”不再随机：用年份与季节的奇偶交替模拟（避免额外消耗 RNG，回放更稳）。
    var priceHigh = ((year + seasonIdx) % 2 === 0);
    var miPrice = (priceHigh ? 520 : 360) + farmMarketCarryBonus(); // 文/石（占位）

    function workProfile() {
      // 这里不是“后日谈自动结算”，而是按季把日常账拆出来，让玩家能做更多选择。
      if (route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) {
        var mi = 1 + (S.农事历练 >= 3 ? 1 : 0);
        return {
          name: '守田·换工',
          eff: '存米+' + mi + '·体魄-2',
          desc: '春耕夏耘秋收冬修：能多守下一口米，就少欠一笔债。',
          run: function (log) { S.存米 += mi; S.体魄 -= 2; log.push(['守田换工：存米+' + mi + '、体魄-2', 'good']); }
        };
      }
      if (route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) {
        var gain = 180 + (S.雇技进度 >= 2 ? 60 : (S.雇技进度 >= 1 ? 30 : 0));
        return {
          name: '续走工路',
          eff: '铜钱+' + gain + '·体魄-3',
          desc: '成家后仍得靠工钱买米。手上若攒出一门活计，行情就更稳。',
          run: function (log) { S.铜钱 += gain; S.体魄 -= 3; log.push(['续走工路：铜钱+' + gain + '、体魄-3', 'good']); }
        };
      }
      if (route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) {
        var g = 200 + (S.学徒授艺度 >= 3 ? 50 : (S.学徒授艺度 >= 2 ? 25 : 0));
        return {
          name: (S.学徒去向 && S.学徒去向 !== '未定') ? '随铺做活' : '跑铺面谋活',
          eff: '铜钱+' + g + '·体魄-2',
          desc: '出师后也不算一劳永逸：守柜、跑腿、接活计，都是一季一季算。',
          run: function (log) { S.铜钱 += g; S.体魄 -= 2; log.push(['铺面做活：铜钱+' + g + '、体魄-2', 'good']); }
        };
      }
      if (route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) {
        var cg = 160 + (S.识货进度 >= 2 ? 40 : 0) + (S.账房进度 >= 2 ? 30 : 0);
        return {
          name: '照应商计',
          eff: '铜钱+' + cg + '·体魄-2',
          desc: '不是每一季都能“回钱”。先把账照住，才有后头的翻身。',
          run: function (log) { S.铜钱 += cg; S.体魄 -= 2; log.push(['照应商计：铜钱+' + cg + '、体魄-2', 'good']); }
        };
      }
      // 路径五：举业退路（不做功名评分，只把笔墨换钱与人情写进账）
      var teach = 140 + (S.生员身份 ? 60 : 20);
      return {
        name: S.生员身份 ? '设馆授徒' : '抄写馆课',
        eff: '铜钱+' + teach + '·体魄-2',
        desc: '举业路成家后的家计往往靠代写、设馆与师门人情撑着，钱不多，却要日日熬。',
        run: function (log) { S.铜钱 += teach; S.体魄 -= 2; log.push(['抄写馆课：铜钱+' + teach + '、体魄-2', 'good']); }
      };
    }

    var wp = workProfile();
    var events = [
      { t: 'life', tag: '[家计]', txt: '成家之后，日子不再是“几年一把结账”。这一阶段按<span class="em">四季</span>推进：同一年的口粮、差役、人情与病痛，会在四季里一层层露出来。' },
      { t: 'rand', tag: '[行情]', txt: '今季米价走' + (priceHigh ? '高' : '低') + '（1石≈' + miPrice + '文，占位）。' }
    ];

    return {
      title: '养家 · 第' + year + '年' + seasonName,
      label: S.年龄 + '岁·' + seasonName,
      next: 'family',
      nextLabel: seasonIdx < 4 ? ('入' + SOLAR[seasonIdx] + ' →') : '又一年春起 →',
      ap: 2,
      commitLabel: '结这一季 →',
      // 不额外 rollShock：养家本身已经是“把日常账拆细”，避免把 RNG 再洗一遍导致回放漂移。
      shock: false,
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>。这一季你有 <span class="em">2 个行动点</span>：不是为了追求“最优”，而是把这口家计真正在一年四季里过细。',
      dossier: function () {
        return lifeDossier('家年=' + year + '｜家季=' + seasonName + '｜米价=' + (priceHigh ? '高' : '低') + '｜本年备役=' + (S.本年家备役 || 0) + '。');
      },
      events: events,
      prompt: '这一季怎么过？（分配 2 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'f_work', name: wp.name, cost: 1, eff: wp.eff, desc: wp.desc, can: true });
        A.push({
          id: 'f_sell',
          name: '粜米换钱',
          cost: 1,
          eff: '存米-1·铜钱+' + miPrice,
          desc: '卖 1 石存米换现钱。价高则好卖，价低则只能薄收。',
          can: S.存米 >= 1,
          why: S.存米 >= 1 ? '' : '存米不足1石'
        });
        A.push({
          id: 'f_duty',
          name: '备差打点',
          cost: 1,
          eff: '铜钱-200·本年赔累风险降',
          desc: '里甲催差时先备一点打点钱，能少吃一层“到期才慌”的亏。',
          can: S.铜钱 >= 200,
          why: S.铜钱 >= 200 ? '' : '铜钱不足200文',
          once: true
        });
        A.push({
          id: 'f_child',
          name: (S.子数 + S.女数 > 0) ? '教蒙与照看' : '看护家口',
          cost: 1,
          eff: '家族+2·体魄-1',
          desc: (S.子数 + S.女数 > 0)
            ? '孩子不识字也得认得规矩；教蒙、看病、找师傅，都是费心费力的细账。'
            : '虽未添丁，家口与人情仍要照看。',
          can: true
        });
        A.push({ id: 'f_rest', name: '将养', cost: 1, eff: '体魄+5', desc: '别把身子熬坏。', can: true });
        return A;
      },
      settle: function (log) {
        var dutyReserved = false;
        lifePicks.forEach(function (p) {
          if (Array.isArray(S.本年家季务)) S.本年家季务.push(p.id);
          switch (p.id) {
            case 'f_work': wp.run(log); break;
            case 'f_sell':
              if (S.存米 >= 1) { S.存米 -= 1; S.铜钱 += miPrice; log.push(['粜米1石：铜钱+' + miPrice, 'good']); }
              else log.push(['想卖米换钱，但这一季存米不足，只得作罢。', 'bad']);
              break;
            case 'f_duty':
              if (spendCopper(200)) { S.本年家备役 = (S.本年家备役 || 0) + 1; dutyReserved = true; log.push(['备差打点：铜钱-200，本年赔累风险先压一线', 'good']); }
              else log.push(['想备差打点，但这一季铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_child':
              S.家族 += 2; clampAttr('家族'); S.体魄 -= 1;
              log.push(['照看家口：家族+2、体魄-1（不显功名，只记家计厚薄）', 'good']);
              break;
            case 'f_rest':
              S.体魄 += 5;
              log.push(['将养：体魄+5', 'good']);
              break;
          }
        });

        // 年末（冬）统一结一次“口粮+差役”的硬账：缴不出就折银举债（守恒，不评分）。
        if (seasonIdx === 4) {
          var mouths = (S.妻室 ? 2 : 1) + (S.子数 || 0) + (S.女数 || 0);
          var needMi = Math.max(1, mouths); // 占位：每口人每年约 1 石口粮
          var payMi = Math.min(S.存米, needMi);
          S.存米 -= payMi;
          var 欠 = needMi - payMi;
          if (欠 > 0) {
            S.负债银 += 欠;
            log.push(['〔口粮〕年末口粮需' + needMi + '石，存米仅缴' + payMi + '石；欠' + 欠 + '石折银举债（负债银+' + 欠 + '）', 'bad']);
          } else {
            log.push(['〔口粮〕年末口粮结清：全家口粮' + needMi + '石照数吃下', 'good']);
          }
          // 里甲差役：若全年未备差，年末更容易被摊派一笔现钱或劳役折损。
          var dutyRisk = (S.本年家备役 || 0) > 0 ? 0.12 : 0.22; // 仍保持概率占位，但这里不消耗 RNG：用 deterministic 条件触发
          var hit = (((year + mouths) % 9) / 10) < dutyRisk; // 0.0~0.8 的离散“命中”
          if (hit) {
            if (spendCopper(300)) log.push(['〔差役〕年末里甲催差：铜钱-300（备差不足，硬账照摊）', 'bad']);
            else { S.体魄 -= 8; log.push(['〔差役〕年末里甲催差：现钱不够，只得亲自应役，体魄-8', 'bad']); }
          } else {
            log.push(['〔差役〕这一年里甲催差未落到你头上', 'good']);
          }
          // 新年清账
          S.本年家备役 = 0;
          S.本年家季务 = [];
        }

        clampAttr('体魄'); clampAttr('家族');

        // 推进到下一季 / 下一年（年龄在 enterPhase('family') 时按“家年”重算）
        if (seasonIdx < 4) {
          S.家季 = seasonIdx + 1;
          curStage.next = 'family';
          curStage.nextLabel = '入' + SOLAR[seasonIdx] + ' →';
        } else {
          S.家季 = 1;
          S.家年 = year + 1;
          curStage.next = (baseStartAge + (S.家年 - 1) >= targetAge) ? 'household' : 'family';
          curStage.nextLabel = (curStage.next === 'household') ? '转入当户节点 →' : '又一年春起 →';
        }
      }
    };
  }


  function stageHousehold() {
    var hp = householdRoutePack();
    var events = [
      { t: 'rel', tag: '[分家]', txt: '立阄书、品搭均分：好田差田搭配成价值相当数份，拈阄定份。你分得田产正式归户，养老田另立专账不入你可支配。' },
    ];
    if (hp.event) events.push(hp.event);
    return {
      title: '当户 · 分家与应役', label: '当户', next: 'elder', nextLabel: '步入老年 →',
      ap: 4, commitLabel: '了这一任当户 →',
      note: '这是全生命周期最关键的守恒节点：诸子均分在父账/子账同步结算；里甲当役是概率性高风险事件。你能否躲过"当役破家"，取决于识字（应付吏胥）、家族声望（乡里担保）、现银（纳银代役）与一路带到中年的尾账。〔均分与破家为制度事实，具体银额为占位〕' + (hp.note ? ' ' + hp.note : ''),
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>。父陈老栓年迈，家产按<span class="em">诸子"品搭均分"</span>分家，你正式立户、进入里甲黄册。立户便要<span class="em">轮值当役</span>——明代中期最典型的"当役破家"风险所在。这一程 <span class="em">4 个行动点</span>，用来把风险压到最低。你年轻时走过哪条路，如今都要折成这一本当户账。', 
      dossier: function () { return lifeDossier('应役赔累风险 = 基础风险 − 纳银 − 识字应吏 − 家族担保 − 路线承接；末了按当前风险 roll 平安/赔累/破家。' + (hp.dossier ? '｜' + hp.dossier : '')); },
      events: events,
      prompt: '这一任当户怎么当？（分配 4 点压低赔累风险）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        A.push({ id: 'h_pay', name: '纳银代役', cost: 2, eff: '白银-2·赔累风险大降', desc: '花钱买平安，正差雇人代解。', can: S.白银 >= 2, why: S.白银 >= 2 ? '' : '白银不足2两', once: true });
        A.push({ id: 'h_literate', name: '识字·亲核账册', cost: 1, eff: S.识字 ? '风险降·防吏胥虚加' : '（不识字·无从核账）', desc: '亲自核对黄册税则，吏胥难以虚报勒索。', can: S.识字, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: '托家族·乡里担保', cost: 1, eff: '家族≥60则风险降·家族+3', desc: '倚仗宗族与乡邻，摊派时有人分担、说话。', can: true, once: true });
        A.push({ id: 'h_hire', name: '雇工·顾住农事', cost: 1, eff: '铜钱-300·当役误工不减产', desc: '当役耗时，雇短工顶上，田里不至于荒。', can: S.铜钱 >= 300, why: S.铜钱 >= 300 ? '' : '铜钱不足300文' });
        A.push({
          id: 'h_side',
          name: '农闲营生',
          cost: 1,
          eff: side.effect,
          desc: S.家传手艺 > 0 && S.技艺 === '无'
            ? '当户之年也要养家。你虽未另学成一门手艺，但家里留过的那层手艺底子，已经够你接些比纯打杂更熟的零活。'
            : '当户之年也要养家，凭手艺或杂工挣现钱。',
          can: true
        });
        hp.extraActions.forEach(function (x) { A.push(x); });
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年劳碌，别把身子熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var risk = 0.40 + hp.baseAdj; var paid = false, guarded = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役'; risk -= 0.35; paid = true;
                log.push(['纳银代役：白银-2，赔累风险大降', 'good']);
              } else {
                log.push(['想拿现银代役，但这一程别处已先占了现银，只得改回硬扛，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'h_literate': risk -= 0.15; log.push(['识字亲核账册：吏胥难虚加，赔累风险降', 'good']); break;
            case 'h_clan': S.家族 += 3; guarded = true; if (S.家族 >= 60) risk -= 0.12; log.push(['托家族乡里担保：家族+3' + (S.家族 >= 60 ? '，摊派有人分担（风险降）' : '（家族声望尚浅，担保有限）'), 'good']); break;
            case 'h_hire':
              if (spendCopper(300)) {
                log.push(['雇工顾农事：铜钱-300，当役误工不减产', 'bad']);
              } else {
                log.push(['想雇短工顾住农事，但这一程铜钱已先被别处占住，只得暂缓，免得把铜钱记成负数。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              log.push(['农闲营生：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain, 'good']);
              break;
            case 'h_proxy':
              if (spendSilver(1)) { risk -= 0.16; log.push(['凭师门门路请人代办：白银-1，少吃了一层应役的人情亏（风险降）', 'good']); }
              else if (spendCopper(150)) { risk -= 0.12; log.push(['凭师门门路请人代办：铜钱-150，少吃了一层应役的人情亏（风险降）', 'good']); }
              else { log.push(['想凭师门门路请人代办，但这一程现钱已先被别处占住，只得暂缓，免得把白银或铜钱记成负数。', 'bad']); }
              break;
            case 'h_proxy_wage':
              if (spendSilver(1)) { risk -= 0.15; log.push(['凭旧工头请人代应：白银-1，外头熟识替你把这一任里役顶去一线（风险降）', 'good']); }
              else if (spendCopper(180)) { risk -= 0.11; log.push(['凭旧工头请人代应：铜钱-180，靠旧牙口少吃了一层应役的人情亏（风险降）', 'good']); }
              else { log.push(['想凭旧工头请人代应，但这一程现钱已先被别处占住，只得暂缓，免得把白银或铜钱记成负数。', 'bad']); }
              break;
            case 'h_collect':
              var owed = S.未回款银;
              var got = Math.max(1, Math.ceil(owed * 0.6));
              var lost = Math.max(0, owed - got);
              S.白银 += got; S.未回款银 = 0; if (lost > 0) S.商路亏折 += lost; risk -= 0.10;
              log.push(['折价催收旧账备役银：未回款' + owed + '两里先收回白银+' + got + (lost > 0 ? '，另有' + lost + '两只得认亏' : '') + '（风险降）', 'good']);
              break;
            case 'h_hold_field':
              S.委托营生 = '分得薄田自耕';
              S.委托租谷 = 0;
              S.委托待收租谷 = 0;
              var fieldGain = 1 + ((S.家传农事 || 0) > 0 ? 1 : 0);
              var fieldPractice = isFarmRouteState()
                ? ((S.家传农事 || 0) > 0 ? 1 : 0)
                : ((S.家传农事 || 0) > 0 ? 2 : 1);
              S.存米 += fieldGain;
              if (fieldPractice > 0) S.农事历练 += fieldPractice;
              risk -= isFarmRouteState() ? 0.10 : 0.08;
              log.push([isFarmRouteState()
                ? ('守着分得薄田自耕：立下自耕薄田账，存米+' + fieldGain + (fieldPractice > 0 ? ('、农事历练+' + fieldPractice) : '') + '；' + ((S.家传农事 || 0) > 0 ? '父辈留下的农事底子让你一接手就不至手生，' : '') + '这 4 亩先稳住你这一房的口粮根脚（风险降）')
                : ('把分得薄田改作自耕：存米+' + fieldGain + '、农事历练+' + fieldPractice + '；从“纯卖工”转成“半自耕半卖工”' + ((S.家传农事 || 0) > 0 ? '，而且不是从零学起' : '') + '，不再只凭雇主脸色吃饭（风险降）'), 'good']);
              break;
            case 'h_lease_home':
              S.委托营生 = '出佃收租';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              risk -= 0.06;
              log.push([isFarmRouteState()
                ? '把薄田另立佃约收租：立下委托经营账，年租谷+1；口粮虽少了亲手把握，却替这一房留下一条稳租路（风险降）'
                : '把薄田出佃保口粮：立下委托经营账，年租谷+1；你仍可继续卖工，但家里先多了一口不随失工断掉的租谷（风险降）', 'good']);
              break;
            case 'h_split_joint':
              S.合爨状态 = '已析爨';
              S.铜钱 += 180;
              S.家族 -= 1;
              risk -= 0.05;
              log.push(['父故后析爨清共账：把先前合爨积下的共账与人情清回你这一房，铜钱+180、家族-1；账虽分开了，往后再遇事也不至全从零起手（风险降）', 'good']);
              break;
            case 'h_lease_city':
              S.委托营生 = '出佃收租';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              risk -= 0.06;
              log.push(['分家后把薄田出佃收租：立下委托经营账，年租谷+1；你仍在城里求生，不必硬回乡亲耕（风险降）', 'good']);
              break;
            case 'h_trust_field':
              S.委托营生 = '兄代管薄田';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.家族 += 2;
              risk -= 0.08;
              log.push(['托兄代管分得薄田：年租谷+1、家族+2；兄代你照看田面与部分里役人情（风险降）', 'good']);
              break;
            case 'h_school_fund':
              if (spendSilver(1)) {
                S.商路供读银 += 1;
                S.家族 += 2;
                log.push(['划银为供读专账：白银-1、供读专账+1、家族+2（这笔钱不算随手可花的现银，但会传到下一代承接）', 'good']);
              } else {
                log.push(['想划一两现银给下一代留作供读专账，但这一程现钱已先拿去应役/周转，只得暂缓，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'h_exempt':
              risk -= 0.18;
              log.push(['凭名色申优免缓派：这一任差役外流减了一层，但并非凭空多出役银。', 'good']);
              break;
            case 'h_copy_mid':
              S.铜钱 += 160;
              risk -= 0.06;
              log.push(['以笔墨代写文契：铜钱+160，也让乡里看到你能自己核账写契（风险降）', 'good']);
              break;
            case 'h_rest': S.体魄 += 5; log.push(['将养身子：体魄+5', 'good']); break;
          }
        });
        risk = Math.max(0.03, Math.min(0.85, risk));
        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if ((S.家传农事 || 0) > 0 && S.委托营生 === '分得薄田自耕') {
            S.存米 += 1;
            log.push(['〔守田承接〕父辈留下的农事底子不只帮你躲过赔累，这一年还多守下一口口粮：存米+1', 'good']);
          }
          log.push(['〔当役了讫〕赔累风险约 ' + pct + '%，平安过关！乡里称许，家族+5', 'good']);
        }
        else if (r === 'levy') { S.铜钱 = Math.max(0, S.铜钱 - 1500); S.应役 = '赔累'; log.push(['〔遭加派〕赔累风险约 ' + pct + '%命中：解运垫赔，铜钱-1500', 'bad']); }
        else { S.田亩 = Math.max(0, S.田亩 - 2); S.负债银 += 2; S.应役 = '破家'; log.push(['〔当役破家〕失田2亩、负债+2两——制度性风险落到个人账上（不是你的无能）', 'bad']); }
      }
    };
  }
  // 分家均分结算（进入当户即自动发生一次）
  function doInherit(log) {
    if (S.分家) return;
    S.分家 = true;
    S.存米 += 2; S.家族 += 4; S.口食田 = 1; S.委托待收租谷 = 0;
    if (isFarmRouteState()) {
      if (S.合爨状态 === '随兄合户') {
        log.push(['分家均分：先前一直随兄合爨，到父故这一步才把共账清开。你这一房照样分得应有那份田与口粮，只是多带着几年的合爨余绪一起立户。', 'good']);
        S.合爨状态 = '已析爨';
        S.委托营生 = '分得薄田自耕';
        return;
      }
      S.委托营生 = '分得薄田自耕';
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你这一房眼下先把薄田按自耕账守住，往后若撑不住，再改写成出佃/换工的账。', 'good']);
      return;
    }
    if (isWageRouteState()) {
      if (S.合爨状态 === '随兄合户') {
        log.push(['分家均分：这些年先随兄合爨，父故后才把共账清开。你这时第一次把该归自己这一房的田与口粮真正写进独户账里，不再只是跟着兄户吃饭。', 'good']);
        S.合爨状态 = '已析爨';
        return;
      }
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。这 4 亩是你前半生第一次真正攥到手里的田面：可改作自耕，也可另立租账，但无论怎么选，都不再只是“纯卖工”的账。', 'good']);
      return;
    }
    if ((S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') && (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商')) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。只是你人在城里，这 4 亩薄田更像待立约的租谷来路，不再是能日日亲耕的田面。', 'good']);
      return;
    }
    if (S.路线.indexOf('徽商') === 0 || S.累计反哺银 > 0 || S.商历练 > 0) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你常年在外，这份田更接近“委托兄长/佃户代管后按账回租”的资产。', 'good']);
      return;
    }
    if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。只是父账早被多年供读侵蚀过，这一份分到你手里，更显得薄。', 'good']);
      return;
    }
    log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩(口食田，不入可支配)', 'good']);
  }

  function elderRoutePack() {
    var pack = { note: '', dossier: '', event: null, negotiateAdj: 0, extraActions: [] };
    if (isFarmRouteState() || isWageRouteState()) {
      pack.note = isFarmRouteState()
        ? '留乡佃田一路到了晚年，真正托底的不是“曾经佃过田”，而是分家后那 4 亩薄田到底守成了自耕、还是改成了租谷。'
        : '雇工一路到了晚年，老来靠不靠得住，不看你年轻时卖过多少工，而看分家后这 4 亩薄田有没有真的替你挡住断炊。';
      if (S.定额佃状态 === '已立定额佃') pack.note += ' 早年那次“先押租、后议亲”的决定，到了老来仍会体现在你守薄田时更不陌生。';
      if (S.合爨状态 === '已析爨') pack.note += ' 先前合爨再析爨留下的那层共账缓冲，也会继续改写你如今向兄弟与子孙开口时的分寸。';
      if (isWageRouteState() && (S.婚配路径 === '先应差·外出佣工' || S.城里门路 > 0)) pack.note += ' 早年先应差再外出佣工攒下的那层旧牙口，到老来仍可能替你换回一点外头照应，不必只靠家里这口饭。';
      pack.dossier = '农事历练=' + S.农事历练 + '｜雇工历练=' + S.雇工历练 + '｜婚配路径=' + S.婚配路径 + '｜定额佃=' + S.定额佃状态 + '｜合爨=' + S.合爨状态 + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + S.委托租谷 + '｜待收租谷=' + (S.委托待收租谷 || 0) + '｜田亩=' + S.田亩 + '｜应役=' + S.应役 +
        '｜最近农闲营生=' + S.最近农闲营生层级 + (S.最近农闲营生收益 > 0 ? ('(' + S.最近农闲营生收益 + '文)') : '');
      pack.event = { t: 'rel', tag: '[田面]', txt: S.委托营生 === '分得薄田自耕'
        ? '你老来还能不能把饭碗捧稳，关键就看这几亩薄田是否还在自己手里照看。它未必富裕，却能把“无地”这件事拦在门外一点。'
        : (S.委托租谷 > 0
          ? '这几年你把薄田立成了委托/出佃账，老来口粮里已有一口是按年回来的租谷，不必每一口都向子孙张嘴。'
          : '老来最怕的不是苦，而是“田还在，却没立清楚怎么养自己”。这几亩薄田若既不自耕也不出佃，就会在养老账上变成空转的家底。') };
      if (S.委托租谷 > 0) pack.negotiateAdj += 0.05;
      if (S.委托营生 === '分得薄田自耕') pack.negotiateAdj += 0.04;
      if (S.农事历练 >= 4) pack.negotiateAdj += 0.03;
      if ((S.委托营生 === '分得薄田自耕' || (S.委托营生 === '无' && S.田亩 > 0))) {
        pack.extraActions.push({
          id: 'e_field_keep',
          name: '守薄田慢慢收',
          cost: 1,
          eff: '存米+' + (isFarmRouteState() ? 2 : 1) + '·体魄-1',
          desc: isFarmRouteState()
            ? '还走得动，就亲自照看那几亩薄田，收一口老来口粮。'
            : '卖工出身的人到这把年纪，肯回头守田，就是替自己多留一口不看雇主脸色的饭。',
          can: S.田亩 > 0,
          why: S.田亩 > 0 ? '' : '眼下已无田面可守',
          once: true
        });
      }
    } else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      pack.note = '学徒一路到了晚年，看的是城中门路有没有坐实：留店、坐店工、跟货，都会改变你老来靠谁照应。';
      pack.dossier = '学徒去向=' + S.学徒去向 + '｜学徒历练=' + S.学徒历练 + '｜授艺度=' + S.学徒授艺度;
      pack.event = { t: 'rel', tag: '[旧识]', txt: '你年轻时若在城里站稳过，老来可托旧东家、旧同门、旧行口照应；若只是归乡另谋，养老结构就更接近普通薄田人家。' };
      if (S.学徒去向 === '留店伙计') pack.negotiateAdj += 0.08;
      else if (S.学徒去向 === '店铺做工') pack.negotiateAdj += 0.05;
      else if (S.学徒去向 === '随行商') pack.negotiateAdj += 0.03;
      if (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') {
        pack.extraActions.push({ id: 'e_city', name: '托城中旧识照应', cost: 1, eff: '铜钱+180·家族+1', desc: '老来还能托城里旧东家或旧同行给些照应，不全靠家里硬扛。', can: true, once: true });
      }
    } else if (S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0) {
      pack.note = '商路一路到了晚年，关键是旧账、分红和反哺名声能不能真的落回养老账。';
      pack.dossier = '累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜商身份=' + S.商身份 + '｜委托营生=' + S.委托营生;
      pack.event = { t: 'rand', tag: '[旧账]', txt: '商路上最怕的是老来还有账压在外头：你年轻时寄回家的银会被诸子记住，路上的旧账却未必能赶在身子垮前收齐。' };
      if (S.累计反哺银 >= 2) pack.negotiateAdj += 0.06;
      if (S.商路供读银 >= 1) pack.negotiateAdj += 0.04;
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'e_collect_old', name: '催回商路旧账', cost: 1, eff: '未回款→部分现银', desc: '趁还走得动，把商路上的旧账催回一部分作养老钱。', can: true, once: true });
      }
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用) {
      pack.note = '举业一路到了晚年，看的是名色留下多少实际照应：生员能减一层外流，笔墨底子则更容易换来教馆、抄写和体面。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜优免=' + (S.优免启用 ? '启用' : '未启用') + '｜识字转业值=' + S.识字转业值;
      pack.event = { t: 'rel', tag: '[名色]', txt: S.生员身份 ? '名色到了晚年仍有余温：不必然给你现钱，却更容易让诸子和乡里愿意按体面来办。' : '若多年应举未成，老来能靠的不是“读过几年书”，而是这点笔墨底子能不能真换来教馆、抄写与照应。' };
      if (S.生员身份 || S.优免启用) pack.negotiateAdj += 0.10;
      else if (S.举业结局 === '屡试未第' && S.识字转业值 >= 2) pack.negotiateAdj += 0.04;
      if (S.生员身份 || (S.识字 && S.识字转业值 >= 2)) {
        pack.extraActions.push({ id: 'e_write_old', name: '凭笔墨换照应', cost: 1, eff: '铜钱+120·家族+2', desc: '老来仍可凭名色、笔墨或代书，换一点体面与照应。', can: true, once: true });
      }
    }
    return pack;
  }

  // ── 养老：多维行动点循环 —— 与诸子协商奉养，逐人记账 ──
  function stageElder() {
    var ep = elderRoutePack();
    var events = [{ t: 'rel', tag: '[养老]', txt: S.子数 > 0 ? '诸子就"谁出米、谁出工"各持立场——他们也有自己的妻儿要养，奉养须双方同意、镜像入各自账本。' : '无子可依，只能靠口食田薄租、自身积蓄，或变卖田产。' }];
    if (ep.event) events.push(ep.event);
    return {
      title: '养老', label: '养老', next: 'death', nextLabel: '走向人生终点 →',
      ap: 3, commitLabel: '安顿晚景 →',
      note: '功能容量随龄下降，劳作让位于休息医药。奉养是与诸子协商的结果、不是默认义务——你提，儿子未必都应；识字/家族声望影响协商的成算，逐人镜像入账。〔机制事实，标准为占位〕' + (ep.note ? ' ' + ep.note : ''),
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>，在明代平民已属高寿门槛。身子大不如前，' + (S.子数 > 0 ? '育有 ' + S.子数 + ' 子，可商议轮养——但奉养多寡是协商出来的。' : '膝下无育成之子，养老无所依，只能靠口食田与积蓄。') + '这一程 <span class="em">3 个行动点</span>安顿晚景。你年轻时走的那条路，此时会变成旧识、旧账、名色和体面。', 
      dossier: function () { return lifeDossier((S.子数 > 0 ? ('诸子 ' + S.子数 + ' 人各有小家，是否足额奉养要看协商成算（家族声望↑更顺）。') : '无子可依，奉养这条路走不通，须自筹。') + (ep.dossier ? '｜' + ep.dossier : '')); },
      events: events,
      prompt: '如何安顿晚年？（分配 3 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'e_negotiate', name: '与诸子协商轮养', cost: 2, eff: S.子数 > 0 ? '按成算得诸子供养·家族+' : '（无子·此路不通）', desc: '召集诸子议定谁出米谁出工——他们可应可辞。', can: S.子数 > 0, why: S.子数 > 0 ? '' : '膝下无育成之子', once: true, prob: S.子数 > 0 ? '足额 / 半额 / 只象征奉养' : '' });
        A.push({ id: 'e_sell', name: '变卖田产养老', cost: 1, eff: '田-1亩·白银+2·存米+2', desc: '换现钱防身，但下一代可分田减少。', can: S.田亩 >= 2, why: S.田亩 >= 2 ? '' : '需田产≥2亩', once: true });
        A.push({ id: 'e_rent', name: '收口食田薄租', cost: 1, eff: '存米+' + (2 + (S.委托待收租谷 || 0)) + '（口食田' + ((S.委托待收租谷 || 0) > 0 ? '+待收委托田租' : '') + '）', desc: '当年立户分得的养老田，加上若早年已把薄田委托出佃/代管、尚有待收租谷，此时一并结回养老账。', can: S.口食田 > 0 || S.委托待收租谷 > 0, why: (S.口食田 > 0 || S.委托待收租谷 > 0) ? '' : '眼下无可收租谷', once: true });
        A.push({ id: 'e_med', name: '延医问药·调养', cost: 1, eff: '铜钱-500·体魄+8', desc: '花钱请郎中调养，延一延寿数。', can: S.铜钱 >= 500, why: S.铜钱 >= 500 ? '' : '铜钱不足500文' });
        ep.extraActions.forEach(function (x) { A.push(x); });
        A.push({ id: 'e_rest', name: '静养含饴', cost: 1, eff: '体魄+4·家族+2', desc: '不再劳作，含饴弄孙，安养身心。', can: true });
        return A;
      },
      settle: function (log) {
        var didProvide = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'e_negotiate':
              didProvide = true;
              var base = 0.30 + (S.家族 >= 65 ? 0.25 : 0.10) + (S.识字 ? 0.10 : 0) + ep.negotiateAdj;
              base = Math.min(0.9, base);
              var out = rollProb([{ p: base, r: 'full' }, { p: (1 - base) * 0.6, r: 'half' }, { p: (1 - base) * 0.4, r: 'token' }]);
              if (out === 'full') { var m = 2 * S.子数; S.存米 += m; S.家族 += 8; log.push(['〔诸子应允〕协商成算约 ' + Math.round(base * 100) + '%：足额轮养，存米+' + m + '、家族+8', 'good']); }
              else if (out === 'half') { var m2 = S.子数; S.存米 += m2; S.家族 += 3; log.push(['〔各有难处〕诸子只能半额奉养：存米+' + m2 + '、家族+3', 'bad']); }
              else { S.存米 += 1; S.家族 -= 2; log.push(['〔诸子推辞〕只象征性奉养：存米+1、家族-2（他们也有自己的妻儿要养）', 'bad']); }
              break;
            case 'e_sell': S.田亩 -= 1; S.白银 += 2; S.存米 += 2; log.push(['变卖田1亩养老：田-1、白银+2、存米+2（下一代起点降低）', 'bad']); break;
            case 'e_field_keep':
              var fieldGain = isFarmRouteState() ? 2 : 1;
              S.存米 += fieldGain;
              S.体魄 -= 1;
              log.push([isFarmRouteState()
                ? '守薄田慢慢收：自耕薄田仍替你收回口粮，存米+' + fieldGain + '、体魄-1'
                : '守着薄田慢慢收：卖工出身的晚景终于还能靠自家田收一口饭，存米+' + fieldGain + '、体魄-1', 'good']);
              break;
            case 'e_rent':
              var rentGain = 2 + (S.委托待收租谷 || 0);
              S.存米 += rentGain;
              log.push(['收口食田薄租' + ((S.委托待收租谷 || 0) > 0 ? '并结委托田租' : '') + '：存米+' + rentGain, 'good']);
              S.委托待收租谷 = 0;
              break;
            case 'e_med': S.铜钱 = Math.max(0, S.铜钱 - 500); S.体魄 += 8; log.push(['延医问药：铜钱-500、体魄+8（益寿）', 'good']); break;
            case 'e_city':
              S.铜钱 += 180; S.家族 += 1;
              log.push(['托城中旧识照应：铜钱+180、家族+1（老来还能吃到些年轻时攒下的门路）', 'good']);
              break;
            case 'e_collect_old':
              var oldOwed = S.未回款银;
              var oldGot = Math.max(1, Math.ceil(oldOwed * 0.5));
              var oldLost = Math.max(0, oldOwed - oldGot);
              S.白银 += oldGot; S.未回款银 = 0; if (oldLost > 0) S.商路亏折 += oldLost;
              log.push(['催回商路旧账：未回款' + oldOwed + '两里先收回白银+' + oldGot + (oldLost > 0 ? '，仍有' + oldLost + '两收不齐' : '') + '。', 'good']);
              break;
            case 'e_write_old':
              S.铜钱 += 120; S.家族 += 2;
              log.push(['凭笔墨换照应：铜钱+120、家族+2（老来体面仍能换一点活路）', 'good']);
              break;
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
    var life = currentLifeProfile();
    function shareByOrdinal(total, count, ordinal) {
      var whole = Math.max(0, Math.floor(total || 0));
      var n = Math.max(1, Math.floor(count || 1));
      var idx = Math.max(1, Math.min(n, Math.floor(ordinal || 1)));
      var base = Math.floor(whole / n);
      var extra = whole % n;
      return base + (idx <= extra ? 1 : 0);
    }
    function attenuateLegacy(legacy, steps) {
      var n = Math.max(0, steps || 0);
      if (!n) return legacy;
      ['家传书香', '城里门路', '商路门路', '家传手艺', '家传农事', '亦贾亦儒底子', '供读底子'].forEach(function (k) {
        legacy[k] = Math.max(0, (legacy[k] || 0) - n);
      });
      if (legacy.商路门路 <= 0 || legacy.家传书香 <= 0) legacy.亦贾亦儒底子 = 0;
      if (legacy.供读底子 > 0 && legacy.亦贾亦儒底子 <= 0 && legacy.家传书香 <= 0) legacy.供读底子 = Math.max(0, legacy.供读底子 - 1);
      return legacy;
    }
    function nextGenLegacy() {
      var legacy = {
        父辈路线: S.路线 || '未定',
        承嗣来路: composeLineageSource(S.承嗣来路, S.子数 > 0 ? (isCollateralCarry(S) ? '旁支续承' : '本支次子承继') : '旁支过继'),
        承继定位: '本房次子另起一手',
        家传书香: 0, 城里门路: 0, 商路门路: 0, 家传手艺: 0, 家传农事: 0, 亦贾亦儒底子: 0, 供读底子: 0
      };
      if (S.技艺 !== '无' || S.雇技进度 >= 2 || S.雇工历练 >= 3) legacy.家传手艺 = 1;
      if (S.学徒去向 === '留店伙计') legacy.城里门路 = 2;
      else if (S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') legacy.城里门路 = 1;
      if (isWageRouteState() && (S.雇身份 === '外出佣工' || S.婚配路径 === '先应差·外出佣工')) {
        legacy.城里门路 = Math.max(legacy.城里门路, S.雇工历练 >= 3 ? 2 : 1);
      }
      if (S.商历练 > 0 || S.累计反哺银 > 0 || S.商身份 !== '未定') legacy.商路门路 = 1;
      if ((S.账房进度 + S.商信誉) >= 3 || S.累计反哺银 >= 2) legacy.商路门路 = 2;
      if (S.生员身份) legacy.家传书香 = 2;
      else if (S.识字 || S.识字转业值 >= 2 || S.举业结局 === '屡试未第') legacy.家传书香 = 1;
      if ((legacy.商路门路 > 0 && legacy.家传书香 > 0) || S.商路供读银 >= 1) legacy.亦贾亦儒底子 = 1;
      if (S.商路供读银 >= 1) legacy.供读底子 = S.商路供读银 >= 2 ? 2 : 1;
      if ((S.路线.indexOf('徽商') === 0 || S.累计反哺银 > 0 || S.商历练 > 0) && S.子数 > 1) {
        legacy.承继定位 = (legacy.亦贾亦儒底子 > 0 || legacy.供读底子 > 0)
          ? '长兄续商·次子候读'
          : '长兄续商·次子另起一手';
      } else if ((S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && S.子数 > 1) {
        legacy.承继定位 = '长兄守户·次子续读';
      } else if ((S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') && S.子数 > 1) {
        legacy.承继定位 = '长兄守户·次子循城外求';
      } else if ((isFarmRouteState() || isWageRouteState()) && S.子数 > 1) {
        legacy.承继定位 = '长兄守田·次子另起一手';
      }
      if (isFarmRouteState() && S.委托营生 === '分得薄田自耕' && S.农事历练 >= 5) legacy.家传农事 = 2;
      else if ((isFarmRouteState() && S.农事历练 >= 3) || (isWageRouteState() && S.委托营生 === '分得薄田自耕' && S.农事历练 >= 2)) legacy.家传农事 = 1;
      var collateralDepth = 0;
      if (isCollateralCarry(S)) collateralDepth += 1;
      if (S.子数 <= 0) collateralDepth += 1;
      attenuateLegacy(legacy, collateralDepth);
      return legacy;
    }
    // 寿命 roll：多数五十余，长尾少数活到60-70+
    var ageRoll = rollProb(life.deathTable);
    S._deathAge = ageRoll; S.年龄 = ageRoll;
    // 丧葬支出（棺木为大项）：从遗产扣
    var funeral = 1; // 白银
    var funeralMi = 1;
    var recoveredReceivable = S.未回款银 > 0 ? Math.floor(S.未回款银 * 0.6) : 0;
    var estateSilverGross = Math.max(0, S.白银 - funeral + recoveredReceivable);
    var estateDebt = Math.max(0, S.负债银 - estateSilverGross);
    var estateSilver = Math.max(0, estateSilverGross - S.负债银);
    var pendingRentMi = Math.max(0, S.委托待收租谷 || 0);
    var estateMi = Math.max(0, S.存米 - funeralMi) + pendingRentMi;
    var estateTian = S.田亩;
    var estateCopper = Math.max(0, S.铜钱);
    var sons = S.子数;
    var heirOrdinal = sons > 1 ? 2 : 1;
    // 仅用于 UI 文案与回放断言，不参与任何评分；避免“独子/过继”仍显示“次子”造成闭环误读。
    S._heirOrdinal = heirOrdinal;
    var legacyCarry = nextGenLegacy();
    var heirIdentity = sons <= 0 ? '旁支继子' : (sons === 1 ? '独子' : (heirOrdinal === 2 ? '次子' : '长子'));
    var narrative, deathTag, collateralEstateNote = '';
    if (sons > 0) {
      var shareSilver = shareByOrdinal(estateSilver, sons, heirOrdinal);
      var shareMi = shareByOrdinal(estateMi, sons, heirOrdinal);
      var shareTian = shareByOrdinal(estateTian, sons, heirOrdinal);
      var shareCopper = shareByOrdinal(estateCopper, sons, heirOrdinal);
      var shareDebt = shareByOrdinal(estateDebt, sons, heirOrdinal);
      S._carry = {
        白银: shareSilver, 存米: shareMi, 田亩: shareTian, 铜钱: shareCopper, 负债银: shareDebt, 家族: Math.min(80, S.家族), 承继身份: heirIdentity,
        父辈路线: legacyCarry.父辈路线, 承嗣来路: legacyCarry.承嗣来路, 家传书香: legacyCarry.家传书香,
        承继定位: legacyCarry.承继定位, 城里门路: legacyCarry.城里门路, 商路门路: legacyCarry.商路门路, 家传手艺: legacyCarry.家传手艺, 家传农事: legacyCarry.家传农事, 亦贾亦儒底子: legacyCarry.亦贾亦儒底子, 供读底子: legacyCarry.供读底子
      };
      if (S.路线.indexOf('徽商') === 0 || S.累计反哺银 > 0 || S.商历练 > 0) deathTag = '你这一生在外跑过商路，身后连旧账、反哺名声' + (S.商路供读银 > 0 ? '与供读专账' : '') + (pendingRentMi > 0 ? '、尚未结回的委托田租' : '') + '也一并结进遗产。';
      else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') deathTag = '你这一生把乡里与城里缝到了一起，临了能传下去的不只是薄田' + ((S.委托租谷 > 0 || pendingRentMi > 0) ? '与委托田租' : '') + '，还有一层见过世面的门路。';
      else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) deathTag = '你这一生的名分与笔墨不会直接分成银两，却会作为体面与起点留在下一代门前。';
      else deathTag = '你这一辈子的每一分积累与亏空，都成了子孙的期初。';
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>。丧礼依家礼办讫（棺木等丧葬支出白银1两、米1石从遗产扣除）' + (pendingRentMi > 0 ? '；另有委托经营账上待结的租谷 ' + pendingRentMi + ' 石，也按遗产一并入账' : '') + '。遗产按<span class="em">诸子均分</span>传给下一代' + (estateDebt > 0 ? '，未抵清的旧债也随房分担' : '') + '——' + deathTag;
    } else {
      collateralEstateNote = '结清丧葬与旧债后，这一房真正还能被过继承走的，只剩白银' + estateSilver + '两、铜钱' + estateCopper + '文、存米' + estateMi + '石、田' + estateTian + '亩。';
      S._carry = {
        白银: estateSilver, 存米: estateMi, 田亩: estateTian, 铜钱: estateCopper, 负债银: estateDebt, 家族: Math.max(35, Math.min(75, S.家族 - 5)), 承继身份: heirIdentity,
        父辈路线: legacyCarry.父辈路线, 承嗣来路: legacyCarry.承嗣来路, 家传书香: legacyCarry.家传书香,
        承继定位: legacyCarry.承继定位, 城里门路: legacyCarry.城里门路, 商路门路: legacyCarry.商路门路, 家传手艺: legacyCarry.家传手艺, 家传农事: legacyCarry.家传农事, 亦贾亦儒底子: legacyCarry.亦贾亦儒底子, 供读底子: legacyCarry.供读底子
      };
      if (S.路线.indexOf('徽商') === 0 || S.累计反哺银 > 0 || S.商历练 > 0) deathTag = '你这一生在外跑过商路，临了虽未留下亲生承嗣，旧账、顾家名声' + (S.商路供读银 > 0 ? '与供读专账' : '') + (pendingRentMi > 0 ? '、委托经营账上的待结田租' : '') + '仍要在旁支账里结清。';
      else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') deathTag = '你这一生把乡里与城里缝到了一起，临了虽绝嗣，城中门路与见识' + ((S.委托租谷 > 0 || pendingRentMi > 0) ? '连同委托田租的薄底子' : '') + '也只剩旁支可续。';
      else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) deathTag = '你这一生的名分与笔墨终究未能直接传给亲子，只在旁支门前留下些体面与余绪。';
      else deathTag = '这不是"游戏失败"，而是明代极高绝嗣率下的真实分支。';
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>，然膝下无育成之子。依明代常俗，触发<span class="em">过继/立嗣</span>：族中侄辈过继承祧，但承的不是一张重置模板，而是这户结清后的真实余产' + (pendingRentMi > 0 ? '、待结委托田租' : '') + (estateDebt > 0 ? '与未了旧债' : '') + '——' + deathTag;
    }
    return {
      title: '死亡与传承', label: '传承', next: null, nextLabel: '递归重开 →',
      note: '死亡不是失败结算，而是把资源账结清、生成下一代期初快照。绝嗣/破家是真实分支，不评分。',
      narrative: narrative,
      events: [
        { t: 'rand', tag: '[丧葬]', txt: '丧葬支出：棺木等白银1两、米1石，从遗产/诸子分摊账扣除（镜像入出资子账，不凭空消失）。' },
        { t: 'rel', tag: '[传承]', txt: sons > 0
          ? ('遗产品搭均分给 ' + sons + ' 子：你继续跟的是第' + heirOrdinal + '子这一房，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.负债银 > 0 ? ('，并分担旧债' + S._carry.负债银 + '两') : '') + '。田不足整分时，这一房也可能暂时分不到整亩，只能带着旧门路再外求。' + inheritedCarryNote(S._carry))
          : ('无嗣过继：旁支承进这一房结清后的真实余产，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.负债银 > 0 ? ('，并接过旧债' + S._carry.负债银 + '两') : '') + '。' + collateralEstateNote + inheritedCarryNote(S._carry)) }
      ],
      prompt: '',
      // 直接给 outcome，无需选择
      choices: [],
      _autoOutcome: true
    };
  }

  // ── 下一代递归重开 ──
  function startNextGeneration(nextStart) {
    generation += 1;
    var carry = S._carry || null;
    carryOver = carry;
    // 主闭环：默认从 16 岁立身重开；幼年“弟妹接续”分支则继续从幼年跑起。
    var start = (nextStart === 'childhood') ? 'childhood' : 'establishment';
    initState(carry, { start: start });
    renderStatus(); renderStage(); renderLedger();
    window.scrollTo({ top: 0 });
  }
  function restartFromCarry(carry, gen) {
    generation = Math.max(2, gen || 2);
    carryOver = carry || null;
    // 传承快照本质是“下一代 16 岁立身”的期初账：用于五路入口承接回放，固定从立身开始。
    initState(carryOver, { start: 'establishment' });
    renderStatus(); renderStage(); renderLedger();
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
  function restartAt16() { installDelegation(); generation = 1; carryOver = null; initState(null, { start: 'establishment' }); renderStatus(); renderStage(); renderLedger(); window.scrollTo({ top: 0 }); }
  function restartFromBirth() { installDelegation(); generation = 1; carryOver = null; initState(null, { start: 'childhood' }); renderStatus(); renderStage(); renderLedger(); window.scrollTo({ top: 0 }); }
  document.getElementById('btn-restart').addEventListener('click', restartAt16);
  var _btnBirth = document.getElementById('btn-restart-birth');
  if (_btnBirth) _btnBirth.addEventListener('click', restartFromBirth);
  installDelegation();
  restartAt16();

  // 死亡阶段无选项，进入即自动展示传承 outcome
  var _origEnter = enterPhase;
  enterPhase = function (p) {
    _origEnter(p);
    tracePhase('enter:' + p);
    if (p === 'death' && curStage && curStage._autoOutcome) {
      var before = snapshot();
      // 应用丧葬扣除与守恒记账
      S.白银 = Math.max(0, S.白银 - 1); S.存米 = Math.max(0, S.存米 - 1);
      S._dead = true; // 死亡确认：此后除“丧葬/传承”外，任何再写入本世状态都视为不变量违规
      recordEntry('丧葬支出结算', before, '棺木等：白银-1、存米-1（从遗产扣，镜像入出资子账）');
      var rh = '<div class="resolve"><h4>身后结算 · 享年 ' + S.年龄 + ' 岁</h4>';
      rh += '<div class="line bad">· 丧葬支出：白银-1、存米-1</div>';
      if (S.子数 > 0) rh += '<div class="line good">· 遗产品搭均分给 ' + S.子数 + ' 子；你继续跟的这一房分得白银' + (S._carry.白银) + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.负债银 > 0 ? ('，并分担旧债' + S._carry.负债银 + '两') : '') + '</div>';
      else rh += '<div class="line bad">· 绝嗣过继：旁支承进这一房结清后的真实余产，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.负债银 > 0 ? ('，并接过旧债' + S._carry.负债银 + '两') : '') + '</div>';
      rh += '<div class="line">· 下一代承接：' + carryRouteAwareSummary(S._carry) + '</div>';
      rh += '<div class="line" style="margin-top:.4rem;color:var(--muted)">这一世了结。账本可继承、可回放、可重开——这正是徽州文书"归户"的玩法化。</div>';
      rh += '</div>';
      curStage.outcome = rh;
      renderLifeStage(); renderLedger(); renderStatus();
    }
  };
  if (typeof window !== 'undefined') {
    window.__MING_TEST_API = {
      restart: restartAt16,
      restartFromBirth: restartFromBirth,
      restartWithHeir: function () { startNextGeneration('establishment'); },
      restartFromCarry: restartFromCarry,
      getState: function () { return JSON.parse(JSON.stringify(S)); },
      getPhase: function () { return phase; },
      getGeneration: function () { return generation; },
      getCarryOver: function () { return carryOver ? JSON.parse(JSON.stringify(carryOver)) : null; },
      patchState: function (patch) {
        if (!patch || typeof patch !== 'object') return false;
        Object.keys(patch).forEach(function (k) { S[k] = patch[k]; });
        clampAttr('体魄'); clampAttr('家族');
        renderStatus(); renderStage(); renderLedger();
        return true;
      },
      setRandomSequence: function (seq) { setRandomSequence(seq); return true; },
      setRandomSeed: function (seed) { setRandomSeed(seed); return true; },
      clearRandomControls: function () { clearRandomControls(); return true; },
      getStageTitle: function () { return curStage ? curStage.title : curLabel(); },
      getStageHTML: function () { return $('stage').innerHTML; },
      getPhaseTrace: function () { return JSON.parse(JSON.stringify(phaseTrace)); },
      getStageAP: function () {
        if (phase === 'childhood') return CHILD_AP;
        if (phase === 'farm') return AP_PER_XUN;
        if (curStage && curStage.ap) return curStage.ap;
        return 0;
      },
      getAvailableActions: function () {
        if (phase === 'childhood') return childActions().map(function (a) { return { id: a.id, name: a.name, can: a.can !== false, cost: a.cost || 0, once: !!a.once, why: a.why || '', eff: a.eff || '' }; });
        if (phase === 'farm') return availableActions().map(function (a) { return { id: a.id, name: a.name, can: a.can !== false, cost: a.cost || 0, once: !!a.once, why: a.why || '', eff: a.eff || '' }; });
        if (curStage && curStage.actions) return lifeActions().map(function (a) { return { id: a.id, name: a.name, can: a.can !== false, cost: a.cost || 0, once: !!a.once, why: a.why || '', eff: a.eff || '' }; });
        if (curStage && curStage.choices) return curStage.choices.map(function (c, i) { return { id: i, name: c.name, can: c.can !== false, cost: 0, once: true, why: '', eff: c.gain || '' }; });
        return [];
      },
      getChoices: function () {
        if (!curStage || !curStage.choices) return [];
        return curStage.choices.map(function (c, i) {
          return {
            id: i,
            name: c.name,
            can: c.can !== false,
            gain: c.gain || '',
            cost: c.cost || '',
            prob: c.prob || '',
            note: c.note || '',
            why: c.why || ''
          };
        });
      },
      getLifeProfile: function () { return JSON.parse(JSON.stringify(currentLifeProfile())); },
      getChildbearingProfile: function () { return JSON.parse(JSON.stringify(childbearingProfile())); },
      pickAction: function (id) {
        if (phase === 'childhood') addChildPick(id);
        else if (phase === 'farm') addPick(id);
        else addLifePick(id);
        return true;
      },
      commit: function () {
        if (phase === 'childhood') commitChildRound();
        else if (phase === 'farm') commitXun();
        else if (curStage && curStage.actions) commitLifeRound();
        return true;
      },
      next: function () {
        if (phase === 'childhood') nextChildRound();
        else if (phase === 'farm') nextXun();
        else handlePNext();
        return true;
      },
      enterPhase: function (p) { enterPhase(p); return true; },
      choose: function (index) { resolveChoice(index); return true; },
      chooseByName: function (name) {
        if (!curStage || !curStage.choices) return false;
        for (var i = 0; i < curStage.choices.length; i++) {
          if (curStage.choices[i].name === name) { resolveChoice(i); return true; }
        }
        return false;
      },
      getLedger: function () { return JSON.parse(JSON.stringify(ledger)); },
      getInvariants: function () { return JSON.parse(JSON.stringify(_invViolations)); }
    };
  }
})();
