/* 明·江南一生 · 文字版 Demo v2 —— 完整人生链路
 * 农事一季（旬循环）→ 成家 → 当户（分家/当役）→ 养老 → 死亡传承 → 下一代递归重开
 * 三内核不变：① 行动点取舍 ② 逐人资源守恒台账 ③ 看天吃饭的不确定性
 * 全部点数与概率显式标注。数值均为玩法占位（非史实精确值），全部可调。
 * 史料红线：不评分（无孝顺/毅力/成败分）；生育夭折寿命破家均为概率；资源守恒；务农不写成低等。
 */
(function () {
  'use strict';

  // ── 常量：季务·旬 ────────────────────────────────
  // 农路的“年内节奏”先不强行改成完整十二月月历（那会牵动过多史料口径与既有叙事），
  // 先用“春耕→夏管→秋收→冬闲”四季、每季三旬把一年撑起来，并保留：
  // 1) 前八旬主要围绕种植与长势；2) 秋收下旬强制收割；3) 冬闲三旬专门摊“修缮/零活/旧债/年关后手”。
  // 目标不是更换称谓，而是让玩家更容易把“走到哪一旬”与“今年到底过了多少”对齐。
  var SOLAR = ['春耕', '夏管', '秋收', '冬闲'];
  var XUN = ['上旬', '中旬', '下旬'];
  var TOTAL_XUN = 12;
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
    { id: 'spring', name: '投师季', note: '年头先跑说合、作保、立据，把能不能入店坐实。', actionLead: '年头先看门路开不开、保人肯不肯担、字据立不立得成。没把这几步走通，后头再勤快也还在门外。 ' },
    { id: 'summer', name: '坐店季', note: '字据若已立成，这一季主要熬守店、跑腿、认货、抄账。', actionLead: '真正熬人的不是拜师那一下，而是字据立成后日复一日的站柜、搬货、跑街和认账。 ' },
    { id: 'autumn', name: '行市季', note: '秋里市面旺，问价、送货、贴补家里与回乡缓家计常在一季里撞上。', actionLead: '秋里最不像“单纯学艺”：你既得跟着铺里认行市，也得想着家里口粮、自己鞋药和年关前的后手。 ' },
    { id: 'winter', name: '年关季', note: '忙市、归省、差役钱、衣药与去留都在年关前后一起落账。', actionLead: '年关前后最像“这一年到底值不值”的总盘：店里看你能不能留下，家里看你有没有把这一路撑起来，自己身子也得熬得住。 ' }
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
  var FAMILY_SEASONS = [
    { id: 'spring', name: '春起', note: '春里先修具、清旧账、问米价，把一年锅火与人情账起起来。', actionLead: '春起最先露头的不是“大事”，而是修具、欠账、口粮、亲族往来这些一笔笔细账。 ' },
    { id: 'summer', name: '夏长', note: '伏夏最熬人，汗疹、痢疾、赶活、照家与小孩病痛常一起压来。', actionLead: '夏里最怕的不是一件大祸，而是热、累、病与工钱一寸寸互相磨薄。 ' },
    { id: 'autumn', name: '秋收', note: '秋里米价、口粮、孩子衣药与年关前的现钱后手，一起往脸上撞。', actionLead: '秋收时看着有进项，真正磨人的却是“这一口钱先顾哪边”。 ' },
    { id: 'winter', name: '冬藏', note: '冬里像收住，实际是把口粮、差役、旧债、衣药与明年开春后手一并结清。', actionLead: '冬藏最不像歇息，反倒最像把一年里欠下和预留的那些小账都翻出来见光。 ' }
  ];
  var HOUSEHOLD_SEASONS = [
    { id: 'spring', name: '春分书', note: '父故分家后的第一季，先把阄书、旧账、口食田与谁替这一房说话分开记。', actionLead: '分家不是把 4 亩往账上一填就完了。春里最先要坐实的，是这份田怎么管、旧账怎么催、哪层乡里门路肯替你扛一截。 ' },
    { id: 'summer', name: '夏催账', note: '伏夏最怕役还没到、账先断在路上：旧账、水脚、兄代管田与家用后手都要先理。', actionLead: '天热、路远、账慢，真正把当户这一年撑住的，往往不是当场多出一锭银，而是你有没有先把哪口钱能回、哪口田能养自己理清。 ' },
    { id: 'autumn', name: '秋定租', note: '秋后租谷、差钱、供读与乡里人情一起逼近，要把“这一房怎么过下去”先拆成几本账。', actionLead: '秋里最像“看着总算有回钱，实际更要赶紧拆账”的时候。租谷、差役、孩子来年读不读，都开始跟这一房的现银直接碰账。 ' },
    { id: 'winter', name: '冬应役', note: '年关前后真正轮到应役时，前面留没留后手、账有没有先分开，就都会现形。', actionLead: '冬里不是只掷一次“会不会破家”的骰。前头整年没先留住的租谷、旧账、供读和代役银，到这里都会一起反咬回来。 ' }
  ];
  // ── 老年（养老）年内节奏：四季拆账（不额外耗 RNG，便于回放锁定）──
  // 目标：让“养老”不再只是一次性年末结算，而是在同一年里继续被“医药/口食田/诸子奉养/旧识照应/旧账”这些细账反复咬住。
  var ELDER_SEASONS = [
    { id: 'spring', name: '春安顿', note: '春里先把谁来照看、谁来出米、口食田租谷怎么收说清。', actionLead: '老来最怕的不是没吃的，而是“该谁出、怎么出”一直说不定。春里先坐实一回，后面才不至旬旬扯皮。 ' },
    { id: 'summer', name: '夏将养', note: '伏夏最伤人，热病、旧伤与药钱往往一起冒头。', actionLead: '夏里最像“身子先垮还是钱先垮”的两难：躲热要花钱，将养不够又要花身子。 ' },
    { id: 'autumn', name: '秋结租', note: '秋后该收的租谷与该清的旧账一起到眼前。', actionLead: '秋里最怕把“田还在”误当成“口粮自然回”。租谷要人去收、账要人去催，缺一步就会落成空话。 ' },
    { id: 'winter', name: '冬收束', note: '年关把灯油炭火、年礼薄耗与来春后手一并压来。', actionLead: '冬里看着像歇，其实是把一年里欠下与预留的那些小账翻出来见光；不先收束，下一年只会更薄。 ' }
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
      本年学徒说合: 0, 本年学徒守店: 0, 本年学徒学账: 0, 本年学徒帮家: 0, 本年学徒奔走: 0, 本年学徒问价: 0, 本年学徒贴家: 0, 本年学徒衣药: 0, 本年学徒歇养: 0, 本年学徒备役: 0, 本年学徒旬记: [],
      // 徽商路径字段（四季三旬：借用“商段”字段记录当前旬位 1/2/3，避免破坏既有快照结构）
      商年: 1, 商季: 1, 商段: 1, 商身份: '未定', 商历练: 0, 识货进度: 0, 账房进度: 0, 商信誉: 0,
      带本银: 0, 未回款银: 0, 累计回钱银: 0, 累计反哺银: 0, 商路供读银: 0, 商路亏折: 0, _merchantLockedTradeTable: null, _advanceMerchantYear: false, _advanceMerchantSeason: false,
      本年商路坐店: 0, 本年商路跑单: 0, 本年商路认货: 0, 本年商路问价: 0, 本年商路核账: 0, 本年商路催账: 0, 本年商路贴家: 0, 本年商路归乡: 0, 本年商路家书: 0, 本年商路试贩: 0, 本年商路备役: 0, 本年商路歇养: 0, 本年商路拖欠: 0, 本年商路供读: 0, 本年商路回钱银: 0, 本年商路反哺银: 0, 本年商路身乏: 0, 本年商路龃龉: 0, 本年商路役扰: 0, 本年商路季务: [],
      // 科举路径字段
      // `举旬` 为当前主字段；`举段` 作为兼容镜像保留，避免旧快照/旧回放直接失效。
      举业年: 1, 举季: 1, 举旬: 1, 举段: 1, 读书方式: '未定', 投塾进度: 0, 童试层级: 0, 保结进度: 0, 文章火候: 0,
      供读状态: '家中供读', 供读压力: 0, 读书成本档: 0, 本年下场: false, 本年应试结果: '未下场',
      生员身份: false, 生员层级: '无', 优免启用: false, 举业结局: '未定', 识字转业值: 0, _advanceExamYear: false, _advanceExamSeason: false,
      本年馆课次数: 0, 本年半读次数: 0, 本年寄读次数: 0, 本年投塾次数: 0, 本年识字旬数: 0, 本年评文次数: 0, 本年保结次数: 0, 本年誊抄次数: 0, 本年归家次数: 0, 本年备役次数: 0, 本年将养次数: 0, 本年举业季务: [],
      本年束脩支出文: 0, 本年纸墨支出文: 0, 本年保结支出文: 0, 本年盘缠支出文: 0, 本年零耗支出文: 0, 本年衣药支出文: 0, 本年役扰支出文: 0, 本年债息增银: 0, 本年役扰已结: false, 本年债息已结: false, 本年已落举业支出文: 0, 本年家中供读次: 0, 本年家中供读文: 0, 本年家中供读米: 0, 本年举业自筹文: 0, 本年举业自筹缓压: 0, 本年家中贴补次: 0, 本年家中贴补米: 0, 本年母纺贴补次: 0, 本年母纺贴补文: 0, 本年落第次数: 0, 本年身子亏空: 0, 本年延婚牵扯: 0, 本年供读转折旬数: 0, 本年婚事转折旬数: 0, 本年身耗转折旬数: 0,
      举业累计投塾次数: 0, 举业累计识字旬数: 0, 举业累计保结次数: 0, 举业累计落第次数: 0, 举业累计身子亏空: 0, 举业累计延婚牵扯: 0, 举业累计供读转折旬数: 0, 举业累计婚事转折旬数: 0, 举业累计身耗转折旬数: 0,
      // 人生链路字段
      妻室: false, 子数: 0, 女数: 0, 负债银: 0, 口食田: 0, 分家: false, 应役: '未役',
      婚配路径: '未定', 合爨状态: '未合爨', 定额佃状态: '未立',
      // “人情欠条”不是评分字段，只是把“借出一口急钱/回收一口人情钱”显式写进账，
      // 避免被口头带过或被误解为“凭空通融”。欠条不计入现银，只有讨回时才入铜钱流水。
      人情欠条: 0,
      // 成家后的“养家”阶段：按四季三旬推进，用更细的年内节奏把 20~40 岁之间的家计过细（不引入成功分/最优评分）
      家年: 1, 家季: 1, 家旬: 1, 本年家做活: 0, 本年家粜米: 0, 本年家问价: 0, 本年家备役: 0, 本年家衣药: 0, 本年家照家: 0, 本年家借粮: 0, 本年家还债: 0, 本年家贴家: 0, 本年家催账: 0, 本年家将养: 0, 本年家修缮: 0, 本年家通融: 0, 本年家捎信: 0, 本年家供读: 0, 本年家季务: [],
      // 成家（议亲）阶段：拆成三旬推进（说合→回话→下聘），避免“成年只点一下就结算”
      议旬: 1,
      // 当户样板：先把商路的“中年当户”拆成四季三旬，让分家、催账、委托田面与应役在同一年里分段落账
      户季: 1, 户旬: 1, 本年户核账: 0, 本年户催账: 0, 本年户备役: 0, 本年户通融: 0, 本年户委托: 0, 本年户供读: 0, 本年户季务: [],
      委托营生: '无', 委托租谷: 0, 委托待收租谷: 0, 最近农闲营生层级: '未定', 最近农闲营生收益: 0,
      // 养老阶段：按四季推进（同一年内继续拆账），避免“老年只点一次就结算”
      老季: 1, 老旬: 1, 本年养老协商: 0, 本年养老收租: 0, 本年养老卖田: 0, 本年养老医药: 0, 本年养老守田: 0, 本年养老旧识: 0, 本年养老铺账: 0, 本年养老节礼: 0, 本年养老季务: [],
      _advanceElderSeason: false,
      // 代际承接字段（不直接折现，只改变下一代入口分布）
      父辈路线: '未定', 承继身份: '次子', 承嗣来路: '本支次子承继', 承继定位: '本房次子另起一手', 家传书香: 0, 城里门路: 0, 商路门路: 0, 家传手艺: 0, 家传农事: 0, 亦贾亦儒底子: 0, 供读底子: 0, 旧门路衰减: 0,
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
      S.承继身份 = carry.承继身份 || inheritanceRoleFromLineage(carry.承嗣来路) || (isCollateralCarry(carry) ? '旁支继子' : '次子');
      S.承嗣来路 = carry.承嗣来路 || directHeirLineageTag(S.承继身份);
      S.承继定位 = carry.承继定位 || '本房次子另起一手';
      S.家传书香 = Math.max(0, carry.家传书香 || 0);
      S.城里门路 = Math.max(0, carry.城里门路 || 0);
      S.商路门路 = Math.max(0, carry.商路门路 || 0);
      S.家传手艺 = Math.max(0, carry.家传手艺 || 0);
      S.家传农事 = Math.max(0, carry.家传农事 || 0);
      S.亦贾亦儒底子 = Math.max(0, carry.亦贾亦儒底子 || 0);
      S.供读底子 = Math.max(0, carry.供读底子 || 0);
      S.旧门路衰减 = Math.max(0, carry.旧门路衰减 || 0);

      // 委托田租：作为“应收”承接到下一代，不自动折算为存米
      if (typeof carry.委托营生 === 'string') S.委托营生 = carry.委托营生;
      S.委托租谷 = Math.max(0, carry.委托租谷 || 0);
      S.委托待收租谷 = Math.max(0, carry.委托待收租谷 || 0);
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

  // 成家（议亲）跨旬临时态：只服务本轮议亲，不进入跨代承接字段。
  function resetMarriageAttemptState() {
    S.议旬 = 1;
    S._marriageBonus = 0;
    S._marriageGiftTier = 0;          // 0=未定，1=薄聘，2=重聘
    S._marriageBorrowedForGift = false;
    S._marriageDidMatch = false;
    S._marriageDidShow = false;
    S._marriageDidCollect = false;
    S._marriageDidCollectRent = false;
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
    if (S.保结进度 < 0 || S.保结进度 > 2) v.push('保结进度越界(' + S.保结进度 + ')');
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
    if ((carry.负债银 || 0) > 0) tags.push('这一房还背着旧债' + carry.负债银 + '两');
    return tags;
  }
  function isCollateralCarry(carry) {
    if (!carry) return false;
    var via = carry.承嗣来路 || '';
    return via.indexOf('旁支过继') >= 0 || via.indexOf('旁支续承') >= 0;
  }
  function lineageDecayLevel(carry) {
    if (!carry) return 0;
    var raw = Number(carry.旧门路衰减 || 0);
    var decay = isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    if (decay <= 0 && isCollateralCarry(carry)) decay = 1;
    return decay;
  }
  function currentLineageDecayLevel() {
    return Math.max(lineageDecayLevel(carryOver || null), Math.max(0, Math.floor(Number(S.旧门路衰减 || 0))));
  }
  function lineageDecayHint(level) {
    level = Math.max(0, Math.floor(level || 0));
    if (level <= 0) return '';
    if (level === 1) return '这一房经旁支接祧后，旧门路已比本支薄一层';
    return '这一房旧门路已连薄' + level + '层，再往后多半只剩一点旧影子';
  }
  function isSiblingCarry(carry) {
    if (!carry) return false;
    return (carry.承嗣来路 || '').indexOf('弟妹接续') >= 0;
  }
  function lineageTokens(via) {
    return (via || '').split('·').map(function (part) { return (part || '').trim(); }).filter(Boolean);
  }
  function inheritanceRoleFromLineage(via) {
    var raw = String(via || '');
    if (!raw) return '';
    if (raw.indexOf('本支独子承继') >= 0) return '独子';
    if (raw.indexOf('本支长子承继') >= 0) return '长子';
    if (raw.indexOf('本支次子承继') >= 0) return '次子';
    if (raw.indexOf('旁支') >= 0) return '旁支继子';
    return '';
  }
  function composeLineageSource(baseVia, currentTag) {
    var tokens = lineageTokens(baseVia);
    var directTags = ['本支长子承继', '本支次子承继', '本支独子承继'];
    if (currentTag && directTags.indexOf(currentTag) >= 0) {
      tokens = tokens.filter(function (token) { return directTags.indexOf(token) < 0; });
    }
    if (currentTag && tokens.indexOf(currentTag) < 0) tokens.push(currentTag);
    return tokens.length ? tokens.join('·') : (currentTag || '本支次子承继');
  }
  function directHeirLineageTag(roleOrSons, carry) {
    if (typeof roleOrSons === 'string') {
      if (roleOrSons === '旁支继子') return '旁支过继';
      if (roleOrSons === '独子') return '本支独子承继';
      if (roleOrSons === '长子') return '本支长子承继';
      return '本支次子承继';
    }
    var count = Math.max(0, Math.floor(roleOrSons || 0));
    if (count <= 0) return '旁支过继';
    if (count === 1) return '本支独子承继';
    return '本支次子承继';
  }
  function currentInheritanceRole(carry) {
    if (!carry) return '次子';
    return carry.承继身份 || inheritanceRoleFromLineage(carry.承嗣来路) || (isCollateralCarry(carry) ? '旁支继子' : '次子');
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
    var decayHint = lineageDecayHint(lineageDecayLevel(carry));
    if (decayHint) tags.push(decayHint);
    if (isSiblingCarry(carry)) tags.push('这一手是幼年早夭后由弟妹接续，旧账与门路都沿前一手继续传下');
    return tags.length ? ('上一代还给这一房留下：' + tags.join('、') + '。') : '';
  }
  function carryRouteAwareSummary(carry) {
    if (!carry) return '无额外承接状态位';
    var tags = [];
    if ((carry.父辈路线 || '') && carry.父辈路线 !== '未定') tags.push('父辈路线=' + carry.父辈路线);
    if ((carry.承继身份 || '')) tags.push('承继身份=' + carry.承继身份);
    if ((carry.承嗣来路 || '')) tags.push('承嗣来路=' + carry.承嗣来路);
    if ((carry.承继定位 || '')) tags.push('承继定位=' + carry.承继定位);
    if ((carry.负债银 || 0) > 0) tags.push('负债银=' + carry.负债银 + '两');
    if ((carry.家传书香 || 0) > 0) tags.push('家传书香' + carry.家传书香 + '层');
    if ((carry.城里门路 || 0) > 0) tags.push('城里门路' + carry.城里门路 + '层');
    if ((carry.商路门路 || 0) > 0) tags.push('商路门路' + carry.商路门路 + '层');
    if ((carry.家传手艺 || 0) > 0) tags.push('家传手艺' + carry.家传手艺 + '层');
    if ((carry.家传农事 || 0) > 0) tags.push('家传农事' + carry.家传农事 + '层');
    if ((carry.亦贾亦儒底子 || 0) > 0) tags.push('亦贾亦儒底子' + carry.亦贾亦儒底子 + '层');
    if ((carry.供读底子 || 0) > 0) tags.push('供读底子' + carry.供读底子 + '层');
    if ((carry.旧门路衰减 || 0) > 0) tags.push('旧门路衰减' + carry.旧门路衰减 + '层');
    if ((carry.委托营生 || '') && carry.委托营生 !== '无') tags.push('委托营生=' + carry.委托营生);
    if ((carry.委托租谷 || 0) > 0) tags.push('委托租谷' + carry.委托租谷 + '石/年');
    if ((carry.委托待收租谷 || 0) > 0) tags.push('待收委托田租' + carry.委托待收租谷 + '石');
    return tags.length ? tags.join('｜') : '无额外承接状态位';
  }
  function lifecycleInheritanceBridge() {
    var role = currentInheritanceRole(carryOver || S || null);
    var inherited = generation > 1
      || !!carryOver
      || (S.父辈路线 || '') !== '未定'
      || role !== '次子'
      || (S.承嗣来路 || '') !== '本支次子承继'
      || (S.承继定位 || '') !== '本房次子另起一手'
      || (S.家传书香 || 0) > 0
      || (S.城里门路 || 0) > 0
      || (S.商路门路 || 0) > 0
      || (S.家传手艺 || 0) > 0
      || (S.家传农事 || 0) > 0
      || (S.亦贾亦儒底子 || 0) > 0
      || (S.供读底子 || 0) > 0
      || (S.负债银 || 0) > 0
      || currentLineageDecayLevel() > 0
      || ((S.委托营生 || '无') !== '无' && ((S.委托租谷 || 0) > 0 || (S.委托待收租谷 || 0) > 0));
    if (!inherited) return { note: '', narrative: '', dossier: '', event: null };
    var parts = ['承继身份=' + role];
    if ((S.父辈路线 || '') && S.父辈路线 !== '未定') parts.push('父辈路线=' + S.父辈路线);
    if (S.承继定位) parts.push('承继定位=' + S.承继定位);
    if (S.承嗣来路) parts.push('承嗣来路=' + S.承嗣来路);
    if ((S.负债银 || 0) > 0) parts.push('负债银=' + S.负债银 + '两');
    if ((S.家传书香 || 0) > 0) parts.push('家传书香=' + S.家传书香 + '层');
    if ((S.城里门路 || 0) > 0) parts.push('城里门路=' + S.城里门路 + '层');
    if ((S.商路门路 || 0) > 0) parts.push('商路门路=' + S.商路门路 + '层');
    if ((S.家传手艺 || 0) > 0) parts.push('家传手艺=' + S.家传手艺 + '层');
    if ((S.家传农事 || 0) > 0) parts.push('家传农事=' + S.家传农事 + '层');
    if ((S.亦贾亦儒底子 || 0) > 0) parts.push('亦贾亦儒底子=' + S.亦贾亦儒底子 + '层');
    var decay = currentLineageDecayLevel();
    if (decay > 0) parts.push('旧门路衰减=' + decay + '层');
    if ((S.供读底子 || 0) > 0) parts.push('供读底子=' + S.供读底子 + '层');
    if ((S.委托营生 || '无') !== '无') parts.push('委托营生=' + S.委托营生);
    if ((S.委托租谷 || 0) > 0) parts.push('委托租谷=' + S.委托租谷 + '石/年');
    if ((S.委托待收租谷 || 0) > 0) parts.push('待收委托田租=' + S.委托待收租谷 + '石');
    var explain = [];
    if ((S.父辈路线 || '') && S.父辈路线 !== '未定') explain.push('父辈这一手走的是“' + S.父辈路线 + '”');
    if (role !== '次子') explain.push('这一手眼下是以“' + role + '”续承上一代结清后的账');
    if (S.承继定位) explain.push('这一房仍按“' + S.承继定位 + '”分工');
    if ((S.家传书香 || 0) > 1) explain.push('屋里旧书、师承和识字底子还算扎实');
    else if ((S.家传书香 || 0) > 0) explain.push('屋里还留着一点书香与识字底子');
    if ((S.城里门路 || 0) > 1) explain.push('父辈在城里留了较熟的铺面人脉');
    else if ((S.城里门路 || 0) > 0) explain.push('父辈在城里还认得几层熟识');
    if ((S.商路门路 || 0) > 1) explain.push('旧商路上的熟号、账面与回钱门道还在');
    else if ((S.商路门路 || 0) > 0) explain.push('家里还认得几条旧商路');
    if ((S.家传手艺 || 0) > 0) explain.push('上一代留下的一层手艺门路还没断');
    if ((S.家传农事 || 0) > 1) explain.push('父辈把守薄田、看水色的农事门道守下来了');
    else if ((S.家传农事 || 0) > 0) explain.push('家里还留着一层守薄田的农事底子');
    if ((S.亦贾亦儒底子 || 0) > 0) explain.push('这一房仍带着一点亦贾亦儒的家内分工底子');
    if ((S.供读底子 || 0) > 0) explain.push('上一代划下的供读专账老规矩还在');
    if ((S.负债银 || 0) > 0) explain.push('上一代没还清的旧债还有' + S.负债银 + '两，起手不能装作没发生');
    var decayHint = lineageDecayHint(decay);
    if (decayHint) explain.push(decayHint);
    if ((S.委托待收租谷 || 0) > 0) explain.push('账上另有待收委托田租' + S.委托待收租谷 + '石，不能当作已经落袋的存米');
    return {
      note: explain.length ? ('承继底子：' + explain.join('；') + '。') : '',
      narrative: explain.length ? ('这一程不是白纸起步：' + explain.join('；') + '。') : '',
      dossier: parts.join('｜'),
      event: { t: 'rel', tag: '[承继]', txt: '你这一手承的是上一代真实结余后的家底，不只是几项数值：' + parts.join('｜') + '。' }
    };
  }
  function isFarmRouteState() {
    return (S.路线 || '').indexOf('留乡佃田') === 0;
  }
  function isWageRouteState() {
    var route = S.路线 || '';
    return route.indexOf('受雇长工/短工') === 0
      || route.indexOf('受雇长工 / 短工') === 0
      || route.indexOf('路径二') === 0;
  }
  function isApprenticeRouteState() {
    var route = S.路线 || '';
    return route.indexOf('入城学徒') === 0
      || route.indexOf('路径三') === 0
      || (S.学徒去向 || '未定') !== '未定';
  }
  function isCivilExamRouteState() {
    var route = S.路线 || '';
    return route.indexOf('读书应举') === 0
      || route.indexOf('路径五') === 0
      || (S.举业结局 || '未定') !== '未定'
      || !!S.生员身份
      || !!S.优免启用;
  }
  function usesSeasonalHouseholdRhythm() {
    // “当户”阶段也要按年内节奏做厚：不仅是出外四路，留乡佃田亦应拆回同一年里逐旬拆账。
    return isFarmRouteState() || isMerchantRouteState() || isWageRouteState() || isApprenticeRouteState() || isCivilExamRouteState();
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
    if ((carry.负债银 || 0) > 0) hints.push('只是这一房还背着旧债' + carry.负债银 + '两，起手无论走哪条路都得先想着别让旧账再滚大');
    var decayHint = lineageDecayHint(lineageDecayLevel(carry));
    if (decayHint) hints.push('只是' + decayHint.replace(/^这一房/, '') + '，未必还能照本支那样使');
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
    } else if (route.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计回钱银 > 0 || S.累计反哺银 > 0) {
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
    if (S.本年商路问价 > 0) {
      weights.flat += 0.03; weights.profit += 0.03; weights.loss -= 0.04; weights.receivable -= 0.02;
      notes.push('这一年先拿脚费与茶钱去抄过行市、摸过牙价，试贩时不至拿最生的价去硬碰');
    }
    var decay = currentLineageDecayLevel();
    if (decay > 0) {
      weights.profit -= 0.04 * decay; weights.receivable += 0.02 * decay; weights.loss += 0.02 * decay;
      notes.push(decay > 1
        ? '这一房旧商路已连薄' + decay + '层，真要把货路坐实，比旁支初接那一手还更难'
        : '这一房经旁支接祧后，旧商路只剩薄薄一层，真正坐实还得靠你自己续');
    }
    return {
      table: normalizeProbTable(weights),
      note: notes.length ? ('试贩结果会继续吃到上一代余绪：' + notes.join('；') + '。') : '试贩结果主要看你这一年自己把认货、核账和回钱做到什么地步。'
    };
  }
  function merchantHomeRemittanceProfile() {
    var familyGain = 2;
    var desc = '先把已经回手的一两银贴回家里，让锅火、口粮或差钱先过住；这只是反哺到账，不等于已经另划成供读专账。';
    var decay = currentLineageDecayLevel();
    if (currentLineageIsCollateral() && decay > 0) {
      familyGain = 1;
      desc = decay > 1
        ? '这一房如今是旁支续起，旧门路又连薄几层；同样一两银贴回去，也多半先被拿去压锅火、口粮与差钱，不再像本支那样能稳稳留后手。'
        : '这一房如今是旁支续起；同样一两银贴回去，仍能让家里先缓一口气，但更容易先被锅火与差钱吃住。';
    } else if (S.累计回钱银 > 0 || S.商路门路 > 0 || S.累计反哺银 > 0) {
      desc = '先把已经回手的一两银贴回家里，让锅火、口粮或差钱先过住；家里至少认得这条回钱路，不至还把你这一手当空话。';
    }
    return {
      familyGain: familyGain,
      trustGain: 0,
      effect: '白银-1·反哺+1·贴家+1·家族+' + familyGain,
      desc: desc
    };
  }
  function merchantSupportProfile() {
    var familyGain = 1, trustGain = 0;
    var desc = '你在外挣来的银，不只贴家，还可另划一两进供读专账，专门顶住家里那条读书链。';
    var boosted = false;
    var decay = currentLineageDecayLevel();
    if (S.亦贾亦儒底子 > 0 || S.供读底子 > 0 || (S.承继定位 || '').indexOf('次子候读') >= 0) {
      boosted = true;
      familyGain = 2;
      trustGain = 1;
      desc = '这一房本就认得“挣钱的人在外回钱、家里另划供读账”的老规矩；同样一两银回去，更容易被当成要紧的供读专账，而不被日常花销冲散。';
    }
    if (boosted && decay > 0) {
      familyGain = Math.max(1, familyGain - Math.min(1, decay));
      trustGain = Math.max(0, trustGain - decay);
      desc = decay > 1
        ? '这一房虽也承到一点“外头回钱、家里另划供读账”的旧规矩，但旧门路已连薄几层；同样一两银回去，也只够勉强把供读账续住，不再像本支那样稳。'
        : '这一房虽也承到一点“外头回钱、家里另划供读账”的旧规矩，但如今是旁支续起，这层门路终究比本支薄一线；同样一两银回去，仍能替家里稳住一点供读压力，却不如本支那样稳。';
    }
    return {
      familyGain: familyGain,
      trustGain: trustGain,
      effect: '白银-1·反哺+1·供读专账+1·家族+' + familyGain + (trustGain > 0 ? '·商信誉+1' : ''),
      desc: desc
    };
  }
  function merchantRemittanceCapacity() {
    var received = Math.max(0, S.累计回钱银 || 0);
    var remitted = Math.max(0, S.累计反哺银 || 0);
    var pending = Math.max(0, S.未回款银 || 0);
    var lockedTrial = Math.max(0, S.带本银 || 0);
    var available = received + pending + lockedTrial - remitted;
    return Math.max(0, available);
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
      var farmDecayHint = lineageDecayHint(currentLineageDecayLevel());
      if (farmDecayHint && notes.length) notes.push('只是' + farmDecayHint.replace(/^这一房/, '') + '，能借到的门路终究不如本支稳');
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
      var wageDecayHint = lineageDecayHint(currentLineageDecayLevel());
      if (wageDecayHint && notes.length) notes.push('只是' + wageDecayHint.replace(/^这一房/, '') + '，可借的旧门路终究还得靠你自己续上');
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
      var apprenticeDecayHint = lineageDecayHint(currentLineageDecayLevel());
      if (apprenticeDecayHint && notes.length) notes.push('只是' + apprenticeDecayHint.replace(/^这一房/, '你这一支') + '，师门和城里旧识能借到的情分终究不如本支厚');
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
      var merchantDecayHint = lineageDecayHint(currentLineageDecayLevel());
      if (merchantDecayHint && notes.length) notes.push('只是' + merchantDecayHint.replace(/^这一房/, '你这一房') + '，旧商路与亦贾亦儒的余绪还得靠这一代重新坐实');
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
      if (S.供读底子 > 0) notes.push('上一代确曾另划供读专账，这一代走举业时，束脩纸墨的压力会在逐旬开账里先被缓上一线，但不会直接化成现银');
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
      var examDecayHint = lineageDecayHint(currentLineageDecayLevel());
      if (examDecayHint && notes.length) notes.push('只是' + examDecayHint.replace(/^这一房/, '这一支') + '，书香与旧识都不如本支厚，保结与供读仍得你这一代重新坐实');
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
    var decay = currentLineageDecayLevel();
    if (decay > 0) bonus = Math.max(0, bonus - decay * 40);
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
    var decay = currentLineageDecayLevel();
    var bonus = 0;
    var familyCost = 1;
    var desc = '去邻县或市镇做活，现钱更多，但离乡更久，家里使唤不上你。';
    if (layers > 0) {
      bonus = Math.min(160, layers * 80);
      if (decay > 0) {
        bonus = Math.max(0, bonus - decay * 40);
        familyCost = Math.min(2, Math.max(1, decay));
        desc = decay > 1
          ? '去邻县或市镇做活；上一代留过的城里熟识已经连薄几层，这一手能借到的情分比旁支初接时还更少。'
          : '去邻县或市镇做活；上一代留过一点城里熟识，但这一房经旁支承接后，情分已比本支薄。';
      } else familyCost = 0;
      if (decay <= 0) desc = '去邻县或市镇做活；上一代若在城里留过熟识，这一手外出就不必全靠陌生脸硬闯。';
    }
    var copper = 300 + bonus;
    var silver = 1;
    if (pass === 2) {
      copper = Math.max(220, copper - 100);
      silver = 0;
      desc += ' 这一旬只算顺着前头探过的门路再跑一趟，钱比整季外出薄一些，但能把外路坐得更稳。';
    } else if (pass >= 3) {
      copper = Math.max(160, copper - 160);
      silver = 0;
      desc += ' 这一旬更像把前头踩熟的工头与脚路再续一口，现钱不厚，却能把“外出也有去处”这件事真留在账上。';
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
    var decay = currentLineageDecayLevel();
    var cityDoor = Math.max(currentDoor, 1);
    if (decay <= 0 && currentDoor > 0) cityDoor = Math.max(cityDoor, Math.min(2, currentDoor));
    else cityDoor = Math.min(2, cityDoor);
    var copper = Math.max(180, base.copper - 80);
    var cityText = cityDoor > currentDoor ? '城里门路+1' : '城里门路坐实';
    var desc = currentDoor > 0
      ? (decay > 0
        ? (decay > 1
          ? '先拿现银顶过这一程差役，再去邻县或市镇做活；旧识还剩一点影子，但这一房旧门路已连薄几层，情分终究比初接旁支时还更淡。'
          : '先拿现银顶过这一程差役，再去邻县或市镇做活；旧识还剩一点，但这一房经旁支承接后，情分终究比本支薄。')
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
    if (S._已收割) return { planted: true, ratio: 1, pct: 100, label: '已收', cls: 'g-ok' };
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
  function wageXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function wageSplitAmount(total, pass) {
    var whole = Math.max(0, Number(total) || 0);
    var base = Math.floor(whole / 3);
    var rem = whole % 3;
    return base + (pass <= rem ? 1 : 0);
  }
  function wageSplitBody(total, pass) {
    var whole = Math.max(0, Number(total) || 0);
    if (whole <= 0) return 0;
    var base = Math.floor(whole / 3);
    var rem = whole % 3;
    return base + (pass <= rem ? 1 : 0);
  }
  function pushWageSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年季务) S.本年季务 = [];
    if (S.本年季务.indexOf(tag) < 0) S.本年季务.push(tag);
  }
  function applySeasonalWageFriction(log, stepLabel, season, xun, picked) {
    function hasPicked(ids) {
      return (ids || []).some(function (id) { return !!picked[id]; });
    }
    function apply(entry) {
      if (!entry) return;
      if (hasPicked(entry.handledIds)) {
        pushWageSeasonTag(stepLabel + entry.doneTag);
        log.push([entry.doneLog, 'good']);
      } else if (spendCopper(entry.cost)) {
        pushWageSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        pushWageSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'spring' && xun === 1) apply({
      handledIds: ['w_long', 'w_short', 'w_out', 'w_book', 'w_home'],
      doneTag: '春头脚费已理',
      doneLog: '〔春工脚费〕这一旬先把草鞋、带话脚费和工棚茶钱分开了；春忙开头不再只剩“签不签长工”，连找工前那层小耗也重新压回了真账。',
      cost: 35,
      costTag: '春工脚费',
      costLog: '〔春工脚费〕草鞋、带话脚费和工棚茶钱一起要钱：铜钱-{cost}。不是大账，却正把“先问活路”这一下重新压回真账。',
      failTag: '春头硬顶',
      failLog: '〔春工脚费〕这一旬连草鞋和带话脚费都腾挪不开，只得先硬顶过去；旧工头和乡里看你这层熟面又生了一线（家族-1）。',
      hardship: 'clan'
    });
    // 春忙中旬补一层“回话与饭口碎账”：
    // 不额外耗 RNG；只把“工头回话 / 饭钱 / 草鞋”这类不大、却会持续磨人的细钱压回同一年中旬。
    if (season.id === 'spring' && xun === 2) apply({
      handledIds: ['w_market', 'w_send', 'w_tea', 'w_book', 'w_home', 'w_short'],
      doneTag: '春中回话已顾',
      doneLog: '〔春中回话〕这一旬你把旧工头回话、路边饭钱与草鞋碎账先顾住了；春忙中旬不再只剩“再干一旬”，而是真把“回话未定、饭口先紧”的细摩擦压回真账。',
      cost: 30,
      costTag: '春中回话',
      costLog: '〔春中回话〕旧工头回话、路边饭钱与草鞋碎账一起要钱：铜钱-{cost}。不是大账，却最容易把“工路似乎快定了”的那口气一点点磨薄。',
      failTag: '春中硬顶',
      failLog: '〔春中回话〕这一旬连回话脚费和饭钱都腾挪不开，只得先硬顶过去；工棚这层熟口更冷一线（家族-1）。',
      hardship: 'clan'
    });
    // 伏夏上旬补一层“落脚与消暑碎账”：
    // 让夏忙刚起头就开始咬身子与现钱，而不是只等到中旬才出现零耗。
    if (season.id === 'summer' && xun === 1) apply({
      handledIds: ['w_out', 'w_short', 'w_skill', 'w_mend', 'w_rest', 'w_home'],
      doneTag: '伏夏落脚已理',
      doneLog: '〔伏夏落脚〕这一旬你先把落脚凉汤、汗药与草鞋碎账分开了；夏忙开头不再只是“能不能抢到活”，连“先把人撑住”这层细钱也回到了同一年里。',
      cost: 35,
      costTag: '伏夏落脚',
      costLog: '〔伏夏落脚〕落脚凉汤、汗药与草鞋碎账一起冒头：铜钱-{cost}。不是大祸，却正把伏夏开头那层“热里先磨人”的真实摩擦压回真账。',
      failTag: '伏夏落脚硬扛',
      failLog: '〔伏夏落脚〕这一旬连凉汤汗药钱都腾挪不开，只得先硬扛过去（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['w_market', 'w_send', 'w_tea', 'w_home', 'w_book', 'w_rest'],
      doneTag: '伏夏零耗已顾',
      doneLog: '〔伏夏零耗〕这一旬先把凉汤、草鞋、汗药和工棚茶钱顾住了；伏夏里那层不大、却天天磨人的零耗没有再顺着身子和家计一起滚大。',
      cost: 40,
      costTag: '伏夏零耗',
      costLog: '〔伏夏零耗〕凉汤、草鞋、汗药和工棚茶钱一起冒头：铜钱-{cost}。不是大祸，只是卖工路这一年又多出一层真摩擦。',
      failTag: '伏夏硬扛',
      failLog: '〔伏夏零耗〕这一旬连凉汤和汗药钱都腾挪不开，只得靠身子硬扛过去（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'autumn' && xun === 1) apply({
      handledIds: ['w_short', 'w_home', 'w_market', 'w_send'],
      doneTag: '旺工脚费已理',
      doneLog: '〔旺工脚费〕这一旬先把旺工茶水、回乡脚费和田埂草鞋拆开了；秋收上旬不再只剩“抢不抢旺工”，连回乡搭手前那层碎费也进了账。',
      cost: 45,
      costTag: '旺工脚费',
      costLog: '〔旺工脚费〕旺工茶水、回乡脚费和田埂草鞋一起要钱：铜钱-{cost}。不是新主线，只是把秋收上旬那层赶路碎费重新压回真账。',
      failTag: '旺工硬顶',
      failLog: '〔旺工脚费〕这一旬连回乡脚费和草鞋都腾挪不开，只得先硬顶过去；家里等你搭手的口风又更急了一线（家族-1）。',
      hardship: 'clan'
    });
    // 秋收中旬补一层“回乡饭钱 / 回话脚费”：
    // 旺工钱看着厚，但回乡搭手与捎口信这层饭钱脚费会先来抢现钱。
    if (season.id === 'autumn' && xun === 2) apply({
      handledIds: ['w_market', 'w_send', 'w_home', 'w_tea', 'w_short'],
      doneTag: '秋中饭脚已分',
      doneLog: '〔秋中饭脚〕这一旬你把回乡饭钱、递话脚费与草鞋碎账先分开了；旺工钱还没真落袋时，那层“回乡先要饭钱”的细账没有再混成一句“秋里忙”。',
      cost: 35,
      costTag: '秋中饭脚',
      costLog: '〔秋中饭脚〕回乡饭钱、递话脚费与草鞋碎账一起要钱：铜钱-{cost}。不是大账，却正把秋收中旬最常见的“钱将回未回、饭钱先来追”压回真账。',
      failTag: '秋中硬顶',
      failLog: '〔秋中饭脚〕这一旬连回乡饭钱与递话脚费都腾挪不开，只得先硬顶过去；家里与工棚两头都更急一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['w_book', 'w_short', 'w_tea', 'w_send', 'w_mend'],
      doneTag: '工棚年礼已分',
      doneLog: '〔工棚年礼〕年关前旧工头薄礼、回话脚费和明春头程小脚费已被你先分开；卖工路这层门路没有在冬里忽然断掉。',
      cost: 45,
      costTag: '工棚年礼',
      costLog: '〔工棚年礼〕旧工头薄礼、回话脚费和明春头程脚费一起要钱：铜钱-{cost}。不是讲排场，而是让明春第一口活路不必重新从冷面求人开始。',
      failTag: '工棚年礼硬顶',
      failLog: '〔工棚年礼〕这一旬连薄礼和回话脚费都腾挪不开，只得先硬顶过去；旧工头与工棚这层熟面又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    // 年底最后一旬再补一层“收束碎账”：
    // 不是新增大节点，而是把“讨薪脚费 / 炭火药钱 / 年下回话”这类容易被一句话带过的年关摩擦，
    // 压回冬闲下旬的同旬结算，让卖工路的年尾不再只剩“拿到工银就完事”。
    if (season.id === 'winter' && xun === 3) apply({
      handledIds: ['w_book', 'w_duty', 'w_mend', 'w_send', 'w_tea'],
      doneTag: '年尾炭脚已分',
      doneLog: '〔年尾炭脚〕这一旬先把讨薪回话脚费、炭火药钱与来春头程后手分开了；年尾这层“碎账抢钱”没有再混成一句“年关难过”。',
      cost: 55,
      costTag: '年尾炭脚',
      costLog: '〔年尾炭脚〕讨薪回话脚费、炭火药钱与来春头程脚费一起要钱：铜钱-{cost}。不是新主线，只是把年尾最常见的碎账摩擦重新压回真账。',
      failTag: '年尾硬顶',
      failLog: '〔年尾炭脚〕这一旬连炭火药钱与讨薪脚费都腾挪不开，只得硬顶过去；人更虚一线（体魄-1）。',
      hardship: 'body'
    });
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
  function applySeasonalApprenticeFriction(log, stepLabel, season, xun, picked) {
    function hasPicked(ids) {
      return (ids || []).some(function (id) { return !!picked[id]; });
    }
    function apply(entry) {
      if (!entry) return;
      if (hasPicked(entry.handledIds)) {
        pushApprenticeSeasonTag(stepLabel + entry.doneTag);
        log.push([entry.doneLog, 'good']);
      } else if (spendCopper(entry.cost)) {
        if (entry.bumpField) S[entry.bumpField] = (S[entry.bumpField] || 0) + entry.bumpValue;
        pushApprenticeSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        pushApprenticeSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    // 投师季也要有“门路碎费”的真账：拜帖脚费、回话茶钱、作保薄礼等，
    // 不加随机、不改评分，只把过去常被一句话带过的小耗压回同一年上旬。
    if (season.id === 'spring' && xun === 1) apply({
      handledIds: ['a_seek', 'a_bond', 'a_sign'],
      doneTag: '投师门路已走',
      doneLog: '〔投师门路〕这一旬先把拜帖脚费、保人茶钱与中人回话走通了；投师季不再只剩一句“去说合”，门路本身也回到了真账。',
      cost: 30,
      costTag: '投师门路',
      costLog: '〔投师门路〕拜帖脚费、保人茶钱与中人回话一起要钱：铜钱-{cost}。不是大账，却正把“能不能见到师傅”这一步重新压回真账。',
      failTag: '投师硬顶',
      failLog: '〔投师门路〕这一旬连拜帖脚费都腾挪不开，只得先硬顶；门路跑得更慢，家里也更疑一分（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'spring' && xun === 2) apply({
      handledIds: ['a_spring_split', 'a_drudge', 'a_mend', 'a_home'],
      doneTag: '春铺零用已分',
      doneLog: '〔春铺零用〕这一旬先把布鞋、灯油、草绳与灶下零用分开了；开春这口脚钱没有再被误当成“终于松快”的整钱。',
      cost: 30,
      costTag: '春铺零用',
      costLog: '〔春铺零用〕布鞋、灯油、草绳和灶下零用一起冒头：铜钱-{cost}、衣药+1。不是大账，却正把学徒成家前开春这层最细的小耗压回真账。',
      failTag: '春铺硬顶',
      failLog: '〔春铺零用〕这一旬连布鞋灯油都腾挪不开，只得先硬扛过去；铺里与家里都更难把你这口日子看成稳当（家族-1）。',
      hardship: 'clan',
      bumpField: '本年学徒衣药',
      bumpValue: 1
    });
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['a_book', 'a_run', 'a_mend', 'a_supply', 'a_rest'],
      doneTag: '伏夏零耗已顾',
      doneLog: '〔伏夏零耗〕这一旬先把铺里茶汤、脚夫点心、汗药针线与回乡带话的小脚费顾住了；学徒路这层“人在铺里、钱却一丝丝漏掉”的磨损没有继续滚大。',
      cost: 35,
      costTag: '伏夏零耗',
      costLog: '〔伏夏零耗〕铺里茶汤、脚夫点心、汗药针线和一口回乡带话的小脚费一起冒头：铜钱-{cost}、衣药+1。不是大账，却正把学徒路这一年的细钱一点点磨薄。',
      failTag: '伏夏硬扛',
      failLog: '〔伏夏零耗〕这一旬连茶汤脚费与汗药针线都腾挪不开，只得先硬扛过去（体魄-1）。',
      hardship: 'body',
      bumpField: '本年学徒衣药',
      bumpValue: 1
    });
    // 行市季开头先把“脚路小钱”摊开：不等到秋尾才被碎账咬住。
    if (season.id === 'autumn' && xun === 1) apply({
      handledIds: ['a_run', 'a_market', 'a_send', 'a_home'],
      doneTag: '行市脚费已分',
      doneLog: '〔行市脚费〕秋里刚起头，脚费、茶汤与抄价小钱已先分开；行市季不必等到秋尾才被碎账咬住。',
      cost: 25,
      costTag: '行市脚费',
      costLog: '〔行市脚费〕跑街脚费、茶汤点心与抄价小钱一起冒头：铜钱-{cost}。不是大账，却会把“行市季”从头就咬得更紧。',
      failTag: '行市硬顶',
      failLog: '〔行市脚费〕这一旬连脚费和茶汤钱都腾挪不开，只得先硬扛过去（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'autumn' && xun === 2) apply({
      handledIds: ['a_autumn_split', 'a_send', 'a_home', 'a_reserve'],
      doneTag: '秋脚锅火已分',
      doneLog: '〔秋脚锅火〕这一旬先把秋脚钱、锅火、差钱和家里灯火拆开了；学徒路最容易被误写成“秋里终于宽了”的那口钱，没有再一转身就漏光。',
      cost: 40,
      costTag: '秋脚锅火',
      costLog: '〔秋脚锅火〕锅火、差钱、家里灯火和回铺脚费一起要钱：铜钱-{cost}。不是大账，却正把学徒路秋中那层“钱刚回手、家里立刻要用”的摩擦重新压回真账。',
      failTag: '秋锅硬顶',
      failLog: '〔秋脚锅火〕这一旬连锅火和差钱的小后手都腾挪不开，只得先硬顶过去；秋里家里与铺里两头都更难替这一房接气了（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'autumn' && xun === 3) apply({
      handledIds: ['a_market', 'a_send', 'a_home', 'a_reserve'],
      doneTag: '秋脚路已压',
      doneLog: '〔秋脚路〕这一旬先把回铺脚路、托人带话与给掌柜照面的薄礼压进后手里；秋里这口脚钱没再只停在“该回”的账面上。',
      cost: 45,
      costTag: '秋脚路',
      costLog: '〔秋脚路〕回铺脚路、托人带话和给掌柜照面的薄礼一起要钱：铜钱-{cost}。不是新主线，只是把“该回的脚钱”真正拢回来前必经的一层摩擦。',
      failTag: '秋脚硬顶',
      failLog: '〔秋脚路〕这一旬连回铺脚路与薄礼都腾挪不开，只得先硬顶过去；这一房在铺里那层熟面又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['a_book', 'a_send', 'a_mend', 'a_supply', 'a_rest'],
      doneTag: '年关铺耗已分',
      doneLog: '〔年关铺耗〕年关里旧掌柜的薄礼、回铺脚路、灯油针线与来春头程小脚费已被你先分开；学徒路这层门路没有在年关忽然断掉。',
      cost: 40,
      costTag: '年关铺耗',
      costLog: '〔年关铺耗〕旧掌柜薄礼、回铺脚路、灯油针线和来春头程小脚费一起要钱：铜钱-{cost}。不是体面消费，而是让“铺里还认你”这层门路能撑到明春。',
      failTag: '年关硬顶',
      failLog: '〔年关铺耗〕这一旬连薄礼与回铺脚路都腾挪不开，只得靠身子硬顶过去（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'winter' && xun === 2) apply({
      handledIds: ['a_book', 'a_send', 'a_mend', 'a_rest'],
      doneTag: '守岁灯油已留',
      doneLog: '〔守岁灯油〕这一旬先把灯油炭火与守岁零用留出来；年关季不只在上旬才有碎账，冬里中旬也会慢慢把人磨薄。',
      cost: 22,
      costTag: '守岁灯油',
      costLog: '〔守岁灯油〕灯油炭火与守岁零用一起要钱：铜钱-{cost}。不显眼，却会把年关这几旬的底子一点点掏空。',
      failTag: '守岁硬顶',
      failLog: '〔守岁灯油〕这一旬连灯油炭火都腾挪不开，只得先硬扛过去（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'winter' && xun === 3) apply({
      handledIds: ['a_winter_post', 'a_run', 'a_reserve', 'a_rest'],
      doneTag: '来春铺路已稳',
      doneLog: '〔来春铺路〕这一旬先把来春回铺脚费、递话薄礼与差役后手留住了；学徒路到冬尾也不再只剩一句“过了年再说”。',
      cost: 40,
      costTag: '来春铺路',
      costLog: '〔来春铺路〕来春回铺脚费、递话薄礼和差役小耗一起要钱：铜钱-{cost}。不是新主线，却把冬藏收束前最后一层铺路后手重新压回了这一旬。',
      failTag: '冬尾硬顶',
      failLog: '〔来春铺路〕这一旬连来春回铺脚费和递话薄礼都腾挪不开，只得继续靠身子硬顶过去（体魄-1）。',
      hardship: 'body'
    });
  }
  function resetApprenticeYearLedger() {
    S.学季 = 1;
    S.学旬 = 1;
    S.本年学徒说合 = 0;
    S.本年学徒守店 = 0;
    S.本年学徒学账 = 0;
    S.本年学徒帮家 = 0;
    S.本年学徒奔走 = 0;
    S.本年学徒问价 = 0;
    S.本年学徒贴家 = 0;
    S.本年学徒衣药 = 0;
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
    S.本年商路问价 = 0;
    S.本年商路核账 = 0;
    S.本年商路催账 = 0;
    S.本年商路贴家 = 0;
    S.本年商路归乡 = 0;
    S.本年商路家书 = 0;
    S.本年商路试贩 = 0;
    S.本年商路备役 = 0;
    S.本年商路歇养 = 0;
    S.本年商路拖欠 = 0;
    S.本年商路供读 = 0;
    S.本年商路回钱银 = 0;
    S.本年商路反哺银 = 0;
    S.本年商路身乏 = 0;
    S.本年商路龃龉 = 0;
    S.本年商路役扰 = 0;
    S.本年商路季务 = [];
    S._merchantLockedTradeTable = null;
  }
  function examSeasonInfo(index) {
    var i = Math.max(1, Math.min(EXAM_SEASONS.length, index || 1)) - 1;
    return EXAM_SEASONS[i];
  }
  function currentExamXun() {
    var raw = Number(S && (S.举旬 || S.举段 || 1)) || 1;
    return Math.max(1, Math.min(3, raw));
  }
  function syncExamXunState(next) {
    var value = Math.max(1, Math.min(3, Number(next) || 1));
    if (!S) return value;
    S.举旬 = value;
    S.举段 = value;
    return value;
  }
  function examXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function examGuaranteeLabel(progress) {
    if ((progress || 0) >= 2) return '保结已通';
    if ((progress || 0) >= 1) return '已递帖样';
    return '未递保结';
  }
  function examEnrollmentLabel(progress) {
    if ((progress || 0) >= 2) return '塾门坐实';
    if ((progress || 0) >= 1) return '已递塾帖';
    return '未投塾';
  }
  function examTierLabel(level, shengyuan) {
    if (shengyuan) return '生员';
    if ((level || 0) <= 0) return '未过县试';
    if (level === 1) return '县试已过';
    if (level === 2) return '府试已过';
    return '院试待核';
  }
  function examAttemptResultLabel(result) {
    if (!result || result === '未下场') return '未下场';
    if (result === '成生员') return '生员';
    return result;
  }
  function examSupportStateDetail() {
    return (S.供读状态 || '观望供读') + '·压' + (S.供读压力 || 0);
  }
  function examDelayStatusLabel() {
    var drag = Math.max(0, Number(S.本年延婚牵扯) || 0);
    if (drag >= 5) return '婚窗更窄';
    if (drag >= 3) return '婚期越拖越迟';
    if (drag >= 1) return '已见拖延';
    return '暂未受牵';
  }
  function examLifetimeDelayLoad() {
    return Math.max(0, Number(S.举业累计延婚牵扯) || 0) + Math.max(0, Number(S.本年延婚牵扯) || 0);
  }
  function examLifetimeWearLoad() {
    return Math.max(0, Number(S.举业累计身子亏空) || 0) + Math.max(0, Number(S.本年身子亏空) || 0);
  }
  function examLifetimeFallLoad() {
    return Math.max(0, Number(S.举业累计落第次数) || 0) + Math.max(0, Number(S.本年落第次数) || 0);
  }
  function examLifetimeDelayLabel() {
    var drag = examLifetimeDelayLoad();
    if (drag >= 10) return '三年婚窗已大窄';
    if (drag >= 6) return '三年婚期连拖';
    if (drag >= 3) return '三年已显迟婚';
    if (drag >= 1) return '三年已起牵扯';
    return '三年尚可议亲';
  }
  function examBodyStatusLabel() {
    var wear = Math.max(0, Number(S.本年身子亏空) || 0);
    var body = Number(S.体魄) || 0;
    if (wear >= 4 || body <= 35) return '已伤根气';
    if (wear >= 2 || body <= 45) return '肩眼见亏';
    if (wear >= 1 || body <= 55) return '灯下微亏';
    return '身子尚稳';
  }
  function examStudyTrackReady() {
    return ((S.本年馆课次数 || 0) + (S.本年半读次数 || 0) + (S.本年寄读次数 || 0)) > 0
      || (S.投塾进度 || 0) >= 1
      || ((S.读书方式 || '未定') !== '未定');
  }
  function examArticleReady() {
    return examStudyTrackReady() && (((S.文章火候 || 0) >= 2) || (S.本年评文次数 || 0) > 0);
  }
  function examAttemptReady() {
    return !S.生员身份
      && !S.本年下场
      && (S.保结进度 || 0) >= 2
      && S.供读状态 !== '已断供'
      && examArticleReady();
  }
  function examAttemptBlockedWhy(seasonId) {
    if (S.生员身份) return '已是生员';
    if (S.本年下场) return '本年已下场过';
    if (!(seasonId === 'autumn' || seasonId === 'winter')) return '通常要到秋冬才真正下场';
    if ((S.保结进度 || 0) < 2) return '保结未通';
    if (S.供读状态 === '已断供') return '家中已断供';
    if (!examArticleReady()) return '先把文章火候磨到可下场';
    return '';
  }
  function noteExamIntraYearSignals(log, stepTag, beforeSignals) {
    beforeSignals = beforeSignals || {};
    var support = examSupportStateDetail();
    var delay = examDelayStatusLabel();
    var body = examBodyStatusLabel();
    if (support !== beforeSignals.support) {
      S.本年供读转折旬数 = (S.本年供读转折旬数 || 0) + 1;
      pushExamSeasonTag(stepTag + '供读口风·' + support);
      if (S.供读状态 === '已断供') {
        log.push(['〔供读口风〕这一旬过后，父兄母对再压束脩、纸墨与盘缠的口风已经实质断掉；你若还想续读，往后就得另找米脚、人情或转靠识字补贴来拖住。', 'bad']);
      } else if (S.供读状态 === '断供边缘') {
        log.push(['〔供读口风〕这一旬过后，家里这条供读线已逼到断供边缘。账不是年终才忽然坏，而是在这一旬就已经露出“再多压一口便要翻锅”的样子。', 'bad']);
      } else if (S.供读状态 === '家中供读') {
        log.push(['〔供读口风〕这一旬过后，家里仍肯把锅火、口粮与现钱往你这边压。供读继续成立，但也只是把这条线又勉强续住，不推出录取。', 'good']);
      } else if (S.供读状态 === '观望供读') {
        log.push(['〔供读口风〕这一旬过后，家里对继续供读转成观望：不是当场赶你停读，而是这条钱路和口粮路都开始等下一旬的回话。', 'bad']);
      }
    }
    if (delay !== beforeSignals.delay) {
      S.本年婚事转折旬数 = (S.本年婚事转折旬数 || 0) + 1;
      pushExamSeasonTag(stepTag + '婚事口风·' + delay);
      if (delay === '已见拖延') {
        log.push(['〔婚事口风〕这一旬的束脩、保结和家中贴补，已经开始往婚事上挤。议亲还没明着停，但口风先慢了一层。', 'bad']);
      } else if (delay === '婚期越拖越迟') {
        log.push(['〔婚事口风〕这一旬过后，婚期已不只是“以后再议”，而是被举业开销和家里供读真往后拖开了一截。', 'bad']);
      } else if (delay === '婚窗更窄') {
        log.push(['〔婚事口风〕这一旬过后，延婚已经不是一句客气话，而是把婚配窗口真往后挤窄了。举业并非道德加分，只是实打实改写了成家的时点。', 'bad']);
      }
    }
    if (body !== beforeSignals.body) {
      S.本年身耗转折旬数 = (S.本年身耗转折旬数 || 0) + 1;
      pushExamSeasonTag(stepTag + '身子账·' + body);
      if (body === '灯下微亏') {
        log.push(['〔身子账〕这一旬的灯下久坐、往返跑腿或回家帮工，已经先在肩眼和睡气上留下了细亏。', 'bad']);
      } else if (body === '肩眼见亏') {
        log.push(['〔身子账〕这一旬过后，肩背、眼力与寒热的亏空已经见了形；举业耗的不是抽象毅力，而是你这一副身子。', 'bad']);
      } else if (body === '已伤根气') {
        log.push(['〔身子账〕这一旬过后，身子亏空已伤到根气。若还只按“年轻扛得住”来写，这条路就不诚实了。', 'bad']);
      }
    }
  }
  function applyCivilExamSharedBaseline() {
    var notes = [];
    if (generation !== 1 || !S || S._startMode !== 'establishment' || S._civilExamSharedBaselineApplied) return notes;
    S._civilExamSharedBaselineApplied = true;
    if (!S.识字 || (S.识字进度 || 0) < 2) {
      S.识字 = true;
      S.识字进度 = Math.max(2, S.识字进度 || 0);
      notes.push('共同父快照里你本就读过“三百千”，这一回走举业不是从零开蒙起步。');
    }
    return notes;
  }
  function pushExamSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年举业季务) S.本年举业季务 = [];
    if (S.本年举业季务.indexOf(tag) < 0) S.本年举业季务.push(tag);
  }
  function noteExamOutlay(amount, opts) {
    amount = Math.max(0, Number(amount) || 0);
    opts = opts || {};
    if (amount <= 0) return;
    S.本年已落举业支出文 += amount;
    if (opts.familySupport !== false) S.本年家中供读文 += amount;
    if (opts.countSupport) S.本年家中供读次 += 1;
    if (opts.buckets) {
      Object.keys(opts.buckets).forEach(function (key) {
        var delta = Math.max(0, Number(opts.buckets[key]) || 0);
        if (delta <= 0) return;
        S[key] = (S[key] || 0) + delta;
      });
    }
  }
  function noteExamSelfRaised(amount) {
    amount = Math.max(0, Number(amount) || 0);
    if (amount <= 0) return 0;
    S.本年举业自筹文 = (S.本年举业自筹文 || 0) + amount;
    return amount;
  }
  function settleExamSelfRaisedRelief(log, stepTag) {
    if (!S || S.生员身份) return false;
    if ((S.本年举业自筹缓压 || 0) >= 1) return false;
    if ((S.本年举业自筹文 || 0) < 180) return false;
    if ((S.供读压力 || 0) <= 0) return false;
    S.供读压力 = Math.max(0, (S.供读压力 || 0) - 1);
    S.本年举业自筹缓压 = (S.本年举业自筹缓压 || 0) + 1;
    pushExamSeasonTag(stepTag + '笔墨补贴缓压');
    if (log) log.push(['〔笔墨补贴〕这一旬前后靠抄书、看账和誊写补回来的钱，终于真替家里缓去一线供读压力。举业路仍旧是消耗路，只是这一口不再全靠父兄硬顶。', 'good']);
    return true;
  }
  function settleExamAdvanceCost(amount) {
    amount = Math.max(0, Number(amount) || 0);
    if (amount <= 0) return { text: '', copper: 0, silver: 0, debt: 0 };
    var remain = amount;
    var copperPaid = Math.min(S.铜钱, remain);
    if (copperPaid > 0) {
      S.铜钱 -= copperPaid;
      remain -= copperPaid;
    }
    var silverPaid = 0;
    var debtPaid = 0;
    if (remain > 0) {
      var silverNeed = Math.ceil(remain / 300);
      silverPaid = Math.min(S.白银, silverNeed);
      if (silverPaid > 0) {
        S.白银 -= silverPaid;
      }
      if (silverPaid < silverNeed) {
        debtPaid = silverNeed - silverPaid;
        S.负债银 += debtPaid;
      }
    }
    noteExamOutlay(amount, { countSupport: true });
    var parts = [];
    if (copperPaid > 0) parts.push('铜钱-' + copperPaid);
    if (silverPaid > 0) parts.push('白银-' + silverPaid);
    if (debtPaid > 0) parts.push('负债+' + debtPaid + '两');
    return {
      copper: copperPaid,
      silver: silverPaid,
      debt: debtPaid,
      text: parts.length ? ('、先支' + parts.join(' / ')) : ''
    };
  }
  function applySeasonalExamFriction(log, stepLabel, season, xun, picked) {
    function hasPicked(ids) {
      return (ids || []).some(function (id) { return !!picked[id]; });
    }
    function apply(entry) {
      if (!entry) return;
      if (hasPicked(entry.handledIds)) {
        pushExamSeasonTag(stepLabel + entry.doneTag);
        log.push([entry.doneLog, 'good']);
      } else if (spendCopper(entry.cost)) {
        noteExamOutlay(entry.cost, { buckets: entry.buckets || { 本年零耗支出文: entry.cost } });
        pushExamSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        pushExamSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'spring' && xun === 1) apply({
      handledIds: ['e_enroll', 'e_tutor', 'e_school', 'e_half', 'e_literacy', 'e_family_grain', 'e_mother_help', 'e_brother_help', 'e_spring_open_packet'],
      doneTag: '春课开销已理',
      doneLog: '〔春课开销〕这一旬先把拜师帖、启蒙纸样、塾馆茶水与家里开春锅火分开了；春课刚起头时最容易被当作“不过几文钱”的那层开销，没有再悄悄把今年第一口供读钱磨薄。',
      cost: 30,
      costTag: '春课开销',
      costLog: '〔春课开销〕拜师帖、启蒙纸样、塾馆茶水和家里开春锅火一起要钱：铜钱-{cost}。不是大账，却正是举业路一年开头最先咬人的那层细钱。',
      failTag: '春课开销硬顶',
      failLog: '〔春课开销〕这一旬连拜师帖和启蒙纸样都腾挪不开，只得先硬顶过去；塾师与父兄眼里你这层“真要开读”的口风又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'spring' && xun === 2) apply({
      handledIds: ['e_essay', 'e_home', 'e_rest', 'e_spring_packet'],
      doneTag: '春馆回话已理',
      doneLog: '〔春馆回话〕这一旬先把塾师评文回话、税则小纸与替保结递话的小脚费分开了；春课中旬不再只剩“继续读不读”，而是真把制度与家计碎账压回了这一旬。',
      cost: 35,
      costTag: '春馆回话',
      costLog: '〔春馆回话〕评文回话、税则小纸与递话脚费一起要钱：铜钱-{cost}。不是大账，却正把春课中旬最容易被一句“再撑一撑”带过去的细耗重新拖回真账。',
      failTag: '春馆回话硬顶',
      failLog: '〔春馆回话〕这一旬连评文回话和递话脚费都腾挪不开，只得先硬顶过去；刚起头的馆课门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'spring' && xun === 3) apply({
      handledIds: ['e_copy', 'e_home', 'e_rest', 'e_spring_tail_packet'],
      doneTag: '春尾香纸已分',
      doneLog: '〔春尾香纸〕这一旬先把清明香纸、回馆脚费与春尾抄写纸墨分开了；春课收尾不再只是“再抄两页补贴”，而把季末这层家用与笔墨碎账一并摊回了同一年里。',
      cost: 40,
      costTag: '春尾香纸',
      costLog: '〔春尾香纸〕清明香纸、回馆脚费和春尾抄写纸墨一起要钱：铜钱-{cost}。不是新主线，却正把春课末尾最容易拖进夏里的那层细账压回了这一旬。',
      failTag: '春尾香纸硬顶',
      failLog: '〔春尾香纸〕这一旬连清明香纸和回馆脚费都腾挪不开，只得先硬顶过去；春尾这层馆课与家计后手又更薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'summer' && xun === 1) apply({
      handledIds: ['e_enroll', 'e_tutor', 'e_school', 'e_half', 'e_literacy', 'e_home', 'e_family_grain', 'e_mother_help', 'e_brother_help', 'e_summer_open_packet'],
      doneTag: '伏夏馆账已顾',
      doneLog: '〔伏夏馆账〕这一旬先把夏课束脩、凉茶脚费与家里消暑小耗分开了；伏夏刚起头时最容易把“继续读书”磨成一句空话的那层馆账，没有继续滚大。',
      cost: 30,
      costTag: '伏夏馆账',
      costLog: '〔伏夏馆账〕夏课束脩、凉茶脚费和家里消暑小耗一起冒头：铜钱-{cost}。不是大账，却正把伏夏第一旬的真摩擦重新摊回了账上。',
      failTag: '伏夏馆账硬顶',
      failLog: '〔伏夏馆账〕这一旬连凉茶脚费和消暑小耗都腾挪不开，只得先硬扛过去；伏夏这层继续读下去的口风又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['e_essay', 'e_copy', 'e_mend', 'e_rest', 'e_summer_packet', 'e_summer_cough'],
      doneTag: '馆课零耗已顾',
      doneLog: '〔馆课零耗〕这一旬先把潮纸、投帖脚费、塾馆茶汤和家里凉热小耗顾住了；举业路这层最容易被一句“不过几文钱”带过的小耗，没有继续滚成更大的缺口。',
      cost: 35,
      costTag: '馆课零耗',
      costLog: '〔馆课零耗〕潮纸、投帖脚费、塾馆茶汤和家里凉热小耗一起冒头：铜钱-{cost}。不是大账，却正把举业路这一年的细钱一点点磨薄。',
      failTag: '馆课零耗硬顶',
      failLog: '〔馆课零耗〕这一旬连潮纸脚费与塾馆茶汤都腾挪不开，只得先硬扛过去；塾师和学生家眼里这层门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'summer' && xun === 3) apply({
      handledIds: ['e_copy', 'e_mend', 'e_rest', 'e_home', 'e_summer_tail_packet'],
      doneTag: '夏尾衣药已分',
      doneLog: '〔夏尾衣药〕这一旬先把补鞋药钱、伏夏尾声纸墨与回家带药小耗分开了；夏课收尾不再只剩“熬过这一旬”，而是真把人和账都往秋里收住了一层。',
      cost: 35,
      buckets: { 本年衣药支出文: 35 },
      costTag: '夏尾衣药',
      costLog: '〔夏尾衣药〕补鞋药钱、伏夏尾声纸墨和回家带药小耗一起要钱：铜钱-{cost}。不是大账，却正把夏尾最躲不开的身子与家计摩擦重新压回这一旬。',
      failTag: '夏尾衣药硬顶',
      failLog: '〔夏尾衣药〕这一旬连药钱和补鞋碎费都腾挪不开，只得先硬扛过去；伏夏最后这层亏空先落到了身上（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'autumn' && xun === 1) apply({
      handledIds: ['e_enroll', 'e_tutor', 'e_half', 'e_literacy', 'e_home', 'e_rest', 'e_family_grain', 'e_mother_help', 'e_brother_help', 'e_autumn_open_packet'],
      doneTag: '秋前盘缠已理',
      doneLog: '〔秋前盘缠〕这一旬先把应试盘缠、拜帖小礼与家里秋收锅火分开了；秋试刚起头时最容易被一句“先把书读下去”盖过去的那层临场后手，没有再混成一团。',
      cost: 40,
      costTag: '秋前盘缠',
      costLog: '〔秋前盘缠〕应试盘缠、拜帖小礼和秋收锅火一起要钱：铜钱-{cost}。不是新主线，只是把秋试开头那层真摩擦重新压回这一旬。',
      failTag: '秋前盘缠硬顶',
      failLog: '〔秋前盘缠〕这一旬连盘缠和拜帖小礼都腾挪不开，只得先硬顶过去；应试前这层人情门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'autumn' && xun === 2) apply({
      handledIds: ['e_guarantee', 'e_copy', 'e_home', 'e_autumn_packet'],
      doneTag: '秋后纸墨已拆',
      doneLog: '〔秋后纸墨〕这一旬先把保结薄礼、学生家回话脚费和润笔纸墨拆开了；秋试前最容易把“还能不能再往前推一口气”磨薄的那层碎耗，没有继续滚大。',
      cost: 45,
      costTag: '秋后纸墨',
      costLog: '〔秋后纸墨〕保结薄礼、学生家回话脚费和秋后纸墨杂支一起要钱：铜钱-{cost}。不是新主线，只是把举业路这一年的细账又往下压了一层。',
      failTag: '秋后纸墨硬顶',
      failLog: '〔秋后纸墨〕这一旬连保结薄礼和学生家回话脚费都腾挪不开，只得先硬顶过去；这一房靠笔墨吃饭的人情面又紧了一层（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'autumn' && xun === 3) apply({
      handledIds: ['e_exam', 'e_reserve', 'e_mend', 'e_home', 'e_autumn_tail_packet', 'e_autumn_register'],
      doneTag: '临场盘缠已留',
      doneLog: '〔临场盘缠〕这一旬先把下场盘缠、誊卷纸样、回乡脚费与秋尾锅火分开了；秋试下旬终于不再只是“去不去考”，而把临场前后那层真后手压进了这一旬。',
      cost: 50,
      costTag: '临场盘缠',
      costLog: '〔临场盘缠〕下场盘缠、誊卷纸样、回乡脚费和秋尾锅火一起要钱：铜钱-{cost}。不是另起一条新线，却正把临场前最磨人的那层细账重新压回同一年里。',
      failTag: '临场盘缠硬顶',
      failLog: '〔临场盘缠〕这一旬连下场盘缠和誊卷纸样都腾挪不开，只得先硬顶过去；到临场前，这层人和钱都更紧了一口（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['e_enroll', 'e_half', 'e_literacy', 'e_home', 'e_rest', 'e_copy', 'e_mend', 'e_mother_help', 'e_brother_help', 'e_winter_open_packet', 'e_fail_talk'],
      doneTag: '年关纸墨已分',
      doneLog: '〔年关纸墨〕旧馆账、来春纸墨定钱、灯油和拜帖脚费已被你先分开；举业路这层门路没有在年关忽然断掉。',
      cost: 40,
      costTag: '年关纸墨',
      costLog: '〔年关纸墨〕旧馆账脚费、来春纸墨定钱和灯油一起要钱：铜钱-{cost}。不是体面消费，而是让“读书这一路还续得下去”不至在年关先断掉。',
      failTag: '年关纸墨硬顶',
      failLog: '〔年关纸墨〕这一旬连纸墨定钱和拜帖脚费都腾挪不开，只得先硬顶过去；举业路这层门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 2) apply({
      handledIds: ['e_copy', 'e_mend', 'e_rest', 'e_winter_mid_packet', 'e_fail_copy', 'e_winter_cough'],
      doneTag: '冬中灯炭已分',
      doneLog: '〔冬中灯炭〕这一旬先把灯炭、旧馆回话脚费与来春笔墨样纸分开了；冬清账中旬不再只是翻旧账，而把“明春这条笔墨门路怎么续”提前压进了这一旬。',
      cost: 45,
      costTag: '冬中灯炭',
      costLog: '〔冬中灯炭〕灯炭、旧馆回话脚费和来春笔墨样纸一起要钱：铜钱-{cost}。不是大账，却正把年关中旬最容易被忽略的续门路成本重新摊回了真账。',
      failTag: '冬中灯炭硬顶',
      failLog: '〔冬中灯炭〕这一旬连灯炭和旧馆回话脚费都腾挪不开，只得先硬顶过去；冬里这层旧馆门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 3) apply({
      handledIds: ['e_reserve', 'e_home', 'e_mend', 'e_rest', 'e_exam', 'e_winter_packet'],
      doneTag: '冬尾门包已留',
      doneLog: '〔冬尾门包〕这一旬先把来春投帖门包、年下薄礼、回乡脚钱与锅火后手分开了；冬清账最后一程终于也不再只是等总账，而把明春第一口门路和眼前家计一并收住。',
      cost: 50,
      costTag: '冬尾门包',
      costLog: '〔冬尾门包〕来春投帖门包、年下薄礼、回乡脚钱和锅火后手一起要钱：铜钱-{cost}。不是大账，却正把举业路冬尾最细、也最躲不开的后手重新压回这一旬。',
      failTag: '冬尾门包硬顶',
      failLog: '〔冬尾门包〕这一旬连投帖门包和年下薄礼都腾挪不开，只得先硬顶过去；明春门路还没开，冬尾这层后手先薄了一线（家族-1）。',
      hardship: 'clan'
    });
  }
  function applyExamSeasonCarry(log, stepLabel, season, xun) {
    if (season.id === 'autumn' && xun === 3 && !S.本年役扰已结) {
      if (S.优免启用 || S.生员身份) {
        if (S.铜钱 >= 80) {
          S.铜钱 -= 80;
          S.本年役扰支出文 += 80;
          pushExamSeasonTag(stepLabel + '秋尾优免已落');
          log.push(['〔秋尾差钱〕这一旬轮到里甲差钱时，因你已在生员案内，只需照着优免后手支出铜钱80文。优免减的是外流，不是凭空多一笔现钱；但这口制度钱已在秋尾见光，不再拖到年终才忽然来追。', 'good']);
        } else {
          pushExamSeasonTag(stepLabel + '秋尾优免暂顶');
          log.push(['〔秋尾差钱〕这一旬轮到里甲差钱，生员优免已替你减下一截外流；虽手头铜钱紧，这口制度账也已在秋尾现形，不再拖到年终才忽然追到门前。', 'good']);
        }
        S.本年役扰已结 = true;
      } else if ((S.本年备役次数 || 0) > 0) {
        S.本年役扰已结 = true;
        pushExamSeasonTag(stepLabel + '秋尾差钱已留');
        log.push(['〔秋尾差钱〕这一旬真轮到差钱时，先前留出的一角差役钱正好派上用场。举业路这一口制度后手，终于也在秋尾旬内见光，不再等年终总账一把压下来。', 'good']);
      } else if (S.铜钱 >= 120) {
        S.铜钱 -= 120;
        S.本年役扰支出文 += 120;
        S.本年役扰已结 = true;
        pushExamSeasonTag(stepLabel + '秋尾差钱');
        log.push(['〔秋尾差钱〕这一旬轮到里甲差钱，只得当场拿铜钱120文找人顶上。书还没读完，制度后手却已在秋尾先来咬钱；这一层不再拖到年终才突然翻账。', 'bad']);
      } else {
        S.本年役扰已结 = true;
        S.体魄 -= 3;
        S.家族 = Math.max(0, S.家族 - 1);
        S.本年身子亏空 += 1;
        pushExamSeasonTag(stepLabel + '秋尾差钱硬扛');
        log.push(['〔秋尾差钱〕这一旬手头腾不出差钱，只得先误业硬应一层役扰：体魄-3、家族-1。举业路这口制度账，如今也在秋尾当旬压到了身上，不再留待年终一句带过。', 'bad']);
      }
    }
    if (season.id === 'winter' && xun === 2 && !S.本年债息已结 && (S.负债银 || 0) > 0) {
      var oldDebt = S.负债银;
      var interest = Math.ceil(oldDebt * DEBT_RATE);
      S.负债银 += interest;
      S.本年债息增银 += interest;
      S.本年债息已结 = true;
      pushExamSeasonTag(stepLabel + '冬中债息');
      log.push(['〔冬中债息〕冬清账中旬把旧债利上先滚了一回：旧债' + oldDebt + '两滚息' + interest + '两（负债→' + S.负债银 + '）。这层借来撑束脩、纸墨与盘缠的后手，现在就在冬中见光，不再等到年终才忽然多一笔。', 'bad']);
    }
  }
  function resetExamYearLedger() {
    S.举季 = 1;
    S.举旬 = 1;
    S.举段 = 1;
    S.读书方式 = '未定';
    S.读书成本档 = 0;
    S.本年下场 = false;
    S.本年应试结果 = '未下场';
    S.本年馆课次数 = 0;
    S.本年半读次数 = 0;
    S.本年寄读次数 = 0;
    S.本年投塾次数 = 0;
    S.本年识字旬数 = 0;
    S.本年评文次数 = 0;
    S.本年保结次数 = 0;
    S.本年誊抄次数 = 0;
    S.本年归家次数 = 0;
    S.本年备役次数 = 0;
    S.本年将养次数 = 0;
    S.本年举业季务 = [];
    S.本年束脩支出文 = 0;
    S.本年纸墨支出文 = 0;
    S.本年保结支出文 = 0;
    S.本年盘缠支出文 = 0;
    S.本年零耗支出文 = 0;
    S.本年衣药支出文 = 0;
    S.本年役扰支出文 = 0;
    S.本年债息增银 = 0;
    S.本年役扰已结 = false;
    S.本年债息已结 = false;
    S.本年已落举业支出文 = 0;
    S.本年家中供读次 = 0;
    S.本年家中供读文 = 0;
    S.本年家中供读米 = 0;
    S.本年举业自筹文 = 0;
    S.本年举业自筹缓压 = 0;
    S.本年家中贴补次 = 0;
    S.本年家中贴补米 = 0;
    S.本年母纺贴补次 = 0;
    S.本年母纺贴补文 = 0;
    S.本年兄婚让读次 = 0;
    S.本年兄婚让读文 = 0;
    S.本年落第次数 = 0;
    S.本年身子亏空 = 0;
    S.本年延婚牵扯 = 0;
    S.本年供读转折旬数 = 0;
    S.本年婚事转折旬数 = 0;
    S.本年身耗转折旬数 = 0;
  }
  function refreshExamSupportState() {
    if (S.生员身份) {
      S.供读状态 = '生员在案';
      return;
    }
    if ((S.供读压力 || 0) >= 4) {
      S.供读状态 = '已断供';
      return;
    }
    if ((S.供读压力 || 0) >= 2) {
      S.供读状态 = '断供边缘';
      return;
    }
    if ((S.本年馆课次数 || 0) + (S.本年半读次数 || 0) + (S.本年寄读次数 || 0) + (S.本年投塾次数 || 0) + (S.本年家中供读次 || 0) + (S.本年家中供读米 || 0) > 0) {
      S.供读状态 = '家中供读';
      return;
    }
    S.供读状态 = '观望供读';
  }
  function resolveExamAttempt(log, stepTag) {
    if (!S.本年下场 || S.本年应试结果 !== '未下场') return false;
    if ((S.保结进度 || 0) < 2 || S.供读状态 === '已断供' || !examArticleReady()) {
      S.本年下场 = false;
      pushExamSeasonTag(stepTag + '应场受阻');
      log.push(['〔应场受阻〕这一旬纵把盘缠、誊卷纸样和人情后手先花出去了，塾门、文章或保结链条仍未真坐实，结果只算“赶到场外”，不算已下场。举业路这层资格闸，不再能被旧状态或一句“先撞一回再说”绕过去。', 'bad']);
      refreshExamSupportState();
      return false;
    }
    var chance = 0.12
      + S.文章火候 * 0.08
      + (S.读书方式 === '塾馆' ? 0.08 : 0)
      + (S.读书方式 === '社学寄读' ? 0.03 : 0)
      + Math.min(0.08, S.本年评文次数 * 0.03)
      + (S.本年保结次数 > 0 ? 0.02 : 0);
    chance = Math.max(0.08, Math.min(0.78, chance));
    if (rand() < chance && S.童试层级 < 3) {
      S.童试层级 += 1;
      if (S.童试层级 >= 3) {
        S.童试层级 = 3;
        S.生员身份 = true; S.生员层级 = '生员'; S.优免启用 = true; S.身份 = '民籍·生员';
        S.家族 += 2;
        S.本年应试结果 = '成生员';
        pushExamSeasonTag(stepTag + '当旬入泮');
        log.push(['〔院试回话〕这一旬下场、这一旬见榜：你终于冲过童试最后一关，成了生员。冬里的后账从此只按生员名分继续收，不再把这层回话拖到整年最后。', 'good']);
      } else {
        S.供读压力 = Math.max(0, (S.供读压力 || 0) - 1);
        S.家族 += 1;
        S.本年应试结果 = examTierLabel(S.童试层级, false);
        pushExamSeasonTag(stepTag + '当旬回话');
        log.push(['〔童试回话〕这一旬下场、这一旬就见了回话：' + S.本年应试结果 + '。举业有进，但供读、纸墨和家里口粮的后账仍得在这一年里继续配平。', 'good']);
      }
      refreshExamSupportState();
      return true;
    }
    S.本年落第次数 += 1;
    S.供读压力 += 1;
    S.本年延婚牵扯 += 1;
    S.家族 = Math.max(0, S.家族 - 1);
    S.本年应试结果 = '落第';
    pushExamSeasonTag(stepTag + '当旬落第');
    log.push(['〔应试回话〕这一旬下了场，也在这一旬见了回话：落第。盘缠、纸墨和保结人情都已先花出去，家里对再供多久也会更迟疑。', 'bad']);
    refreshExamSupportState();
    return false;
  }
  function absorbExamYearIntoLifetime() {
    S.举业累计投塾次数 = (S.举业累计投塾次数 || 0) + (S.本年投塾次数 || 0);
    S.举业累计识字旬数 = (S.举业累计识字旬数 || 0) + (S.本年识字旬数 || 0);
    S.举业累计保结次数 = (S.举业累计保结次数 || 0) + (S.本年保结次数 || 0);
    S.举业累计落第次数 = (S.举业累计落第次数 || 0) + (S.本年落第次数 || 0);
    S.举业累计身子亏空 = (S.举业累计身子亏空 || 0) + (S.本年身子亏空 || 0);
    S.举业累计延婚牵扯 = (S.举业累计延婚牵扯 || 0) + (S.本年延婚牵扯 || 0);
    S.举业累计供读转折旬数 = (S.举业累计供读转折旬数 || 0) + (S.本年供读转折旬数 || 0);
    S.举业累计婚事转折旬数 = (S.举业累计婚事转折旬数 || 0) + (S.本年婚事转折旬数 || 0);
    S.举业累计身耗转折旬数 = (S.举业累计身耗转折旬数 || 0) + (S.本年身耗转折旬数 || 0);
  }
  function familySeasonInfo(index) {
    var i = Math.max(1, Math.min(FAMILY_SEASONS.length, index || 1)) - 1;
    return FAMILY_SEASONS[i];
  }
  function familyXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function householdSeasonInfo(index) {
    var i = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, index || 1)) - 1;
    return HOUSEHOLD_SEASONS[i];
  }
  function householdXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function householdFlavorEvent(routeKey, seasonId, xun) {
    var seasonIdx = seasonId === 'spring' ? 0 : (seasonId === 'summer' ? 1 : (seasonId === 'autumn' ? 2 : 3));
    var key = routeKey || 'farm';
    var pools = {
      farm: [
        { t: 'life', tag: '[田面]', txt: '分家后的薄田最怕只留在纸上：谁去看水、谁去催租、谁先留锅火，少一步都会让“有田”重新变成空话。' },
        { t: 'inst', tag: '[里甲]', txt: '里甲看的是这一房如今到底算不算独立能扛事的人家；纸上分了户，不等于差票与口粮就会自动分清。' },
        { t: 'rel', tag: '[兄房]', txt: '分家后兄弟仍要抬头见低头见。哪句口风算帮衬、哪句口风算推托，常比明面的田亩更伤人。' },
        { t: 'body', tag: '[肩背]', txt: '中年当户最怕的不是“一次大病”，而是肩背、腰腿和睡不实这一点点慢耗。' }
      ],
      wage: [
        { t: 'inst', tag: '[差册]', txt: '卖工人家最怕差册和工路撞在同一旬：册上催你尽户役，外头工棚却只认你能不能准时到。' },
        { t: 'rel', tag: '[工头]', txt: '旧工头肯不肯替你递一句话，常决定这一房是多留一口现钱，还是多吃一层门包脚费。' },
        { t: 'life', tag: '[锅火]', txt: '工食钱回得零碎，锅火却日日要烧。真磨人的不是挣不到，而是每一小口钱都还没焐热就先有去处。' },
        { t: 'body', tag: '[劳乏]', txt: '中年卖工还要回头顾田，最先漏掉的常不是账，而是筋骨这口后劲。' }
      ],
      apprentice: [
        { t: 'inst', tag: '[铺规]', txt: '到了当户年，铺里旧规矩仍在起作用：回话要有次序、回脚费要有人情，晚一步就会显得这一房“只会张口求人”。' },
        { t: 'rel', tag: '[旧掌柜]', txt: '旧掌柜未必真帮你，可他若肯点个头，这一房回乡立户时就少一层“人在城里却没人认”的凉意。' },
        { t: 'life', tag: '[脚路]', txt: '铺里人家最怕的不是一口大钱不来，而是脚费、包纸、灯油和回乡小耗旬旬都先来追钱。' },
        { t: 'body', tag: '[脚底]', txt: '中年还要回城跑铺、回乡催租，最先知道日子紧不紧的，常是脚底那层旧泡和风寒。' }
      ],
      merchant: [
        { t: 'inst', tag: '[行栈]', txt: '当户后再看商路，最怕的不是没门路，而是门路都要靠小钱续着：牙帖、水脚、行栈回话，少一层都可能让旧识装作没看见。' },
        { t: 'rel', tag: '[熟号]', txt: '熟号肯不肯继续认这一房，不只看旧账多少，也看你有没有把回话、薄礼和锅火分明白。' },
        { t: 'life', tag: '[回钱]', txt: '商路人家最磨人的不是“大亏一场”，而是“钱像快回了”，家里锅火、供读和差钱却每旬都先来抢这一口。' },
        { t: 'body', tag: '[路耗]', txt: '年过三十再跑商，湿热风寒和路耗就不再只是小毛病；人一疲，整房的旧账都会跟着慢下来。' }
      ],
      exam: [
        { t: 'inst', tag: '[名色]', txt: '名色真有用时，往往不是替你生钱，而是替这一房少漏一层差役外流；可若平日不先翻出来，到了冬里也可能只剩空体面。' },
        { t: 'rel', tag: '[塾门]', txt: '塾师、廪保和旧学生家记得的，不只是你会不会写字，也看你这房如今还值不值得继续来往。' },
        { t: 'life', tag: '[笔墨]', txt: '中年举业人家最怕把笔墨活误看成体面差事：纸笔、回帖、馆账和锅火一样，都是旬旬来要钱。' },
        { t: 'body', tag: '[灯下]', txt: '年过三十再熬夜抄写，最怕的不是写不出来，而是肩背眼力和寒咳一点点把家计拖慢。' }
      ]
    };
    var pool = pools[key] || pools.farm;
    return pool[(seasonIdx * 3 + Math.max(0, (xun || 1) - 1)) % pool.length];
  }
  function householdSeasonPulseEvent(seasonId, xun) {
    if (seasonId === 'spring' && xun === 1) {
      return { t: 'rel', tag: '[春起]', txt: '立户第一旬最怕把“纸票已分清”当成“家计也分清了”；锅火、门包、脚费和乡里口风，往往比阄书落字更早来咬钱。' };
    }
    if (seasonId === 'spring' && xun === 2) {
      return { t: 'inst', tag: '[回话]', txt: '春中最像等回话的时节：阄书、代管、旧账和熟人递话都像快落手，却又都还要再垫一层脚费。' };
    }
    if (seasonId === 'spring' && xun === 3) {
      return { t: 'life', tag: '[春尾]', txt: '春尾最怕刚觉得“这一季总算有了眉目”，锅火、草鞋、香纸与下季脚路便一起扑上来，把手里那点现钱重新掏薄。' };
    }
    if (seasonId === 'summer' && xun === 1) {
      return { t: 'body', tag: '[伏夏]', txt: '伏夏最先压垮人的，常不是大病，而是凉汤、汗药、草鞋和睡不实这些细碎慢耗。' };
    }
    if (seasonId === 'summer' && xun === 2) {
      return { t: 'life', tag: '[热里]', txt: '夏中的账最难看：热里什么都贵一点、慢一点、急一点，同一口现钱往往既像要去续锅火，又像该去保门路。' };
    }
    if (seasonId === 'summer' && xun === 3) {
      return { t: 'rel', tag: '[夏尾]', txt: '夏尾最怕把“等秋里再说”挂在嘴上；真正拖到秋里的，多半会变成更贵的一层人情和更硬的一层后手。' };
    }
    if (seasonId === 'autumn' && xun === 1) {
      return { t: 'rand', tag: '[秋路]', txt: '秋里一有进项，家里和外头往往都更敢来开口；这不叫转运，只是同一年里该拆开的账忽然一起见光。' };
    }
    if (seasonId === 'autumn' && xun === 2) {
      return { t: 'rel', tag: '[秋中]', txt: '秋中最容易错把“钱像快回了”当成“已经宽了”；真正磨人的，是回话未落手前家里和制度都先来追钱。' };
    }
    if (seasonId === 'autumn' && xun === 3) {
      return { t: 'inst', tag: '[秋尾]', txt: '秋尾最该先分开的，往往不是最大的那口钱，而是门包、脚费、饭钱和锅火这些会把冬前后手悄悄磨空的小账。' };
    }
    if (seasonId === 'winter' && xun === 1) {
      return { t: 'body', tag: '[冬头]', txt: '冬头最怕的是身子、锅火和来春脚路一起怕冷：炭药、夹衣和门包都不大，却最容易把同一口现钱绞紧。' };
    }
    if (seasonId === 'winter' && xun === 2) {
      return { t: 'inst', tag: '[冬中]', txt: '冬中翻总账时，最难的不是认哪笔该花，而是认哪笔必须先留；差钱、来春脚费和旧账回话常都会说自己更急。' };
    }
    return { t: 'rel', tag: '[冬尾]', txt: '冬尾最怕把门路、人情和锅火都寄托在“过了年就好”；真能让下一年不至更薄的，只有这一旬先拆开的那几口小钱。' };
  }
  function elderSeasonInfo(index) {
    var i = Math.max(1, Math.min(ELDER_SEASONS.length, index || 1)) - 1;
    return ELDER_SEASONS[i];
  }
  function elderXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function pushFamilySeasonTag(tag) {
    if (!tag) return;
    if (!S.本年家季务) S.本年家季务 = [];
    if (S.本年家季务.indexOf(tag) < 0) S.本年家季务.push(tag);
  }
  function pushHouseholdSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年户季务) S.本年户季务 = [];
    if (S.本年户季务.indexOf(tag) < 0) S.本年户季务.push(tag);
  }
  function pushElderSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年养老季务) S.本年养老季务 = [];
    if (S.本年养老季务.indexOf(tag) < 0) S.本年养老季务.push(tag);
  }
function applySeasonalElderFriction(log, stepLabel, season, xun, picked) {
  function hasPicked(ids) {
    return (ids || []).some(function (id) { return !!picked[id]; });
  }
  function apply(entry) {
    if (!entry) return;
    if (hasPicked(entry.handledIds)) {
      pushElderSeasonTag(stepLabel + entry.doneTag);
      log.push([entry.doneLog, 'good']);
    } else if (spendCopper(entry.cost)) {
      pushElderSeasonTag(stepLabel + entry.costTag);
      log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
    } else {
      if (entry.hardship === 'body') S.体魄 -= 1;
      if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
      pushElderSeasonTag(stepLabel + entry.failTag);
      log.push([entry.failLog, 'bad']);
    }
  }
  var isWageElder = isWageRouteState();
  var isApprenticeElder = (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定');
  var isMerchantElder = (S.路线.indexOf('徽商') === 0 || (S.商历练 || 0) > 0 || (S.累计回钱银 || 0) > 0 || (S.累计反哺银 || 0) > 0 || (S.未回款银 || 0) > 0);
  var isExamElder = (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用);
  if (isMerchantElder && season.id === 'spring' && xun === 1) apply({
    handledIds: ['e_negotiate', 'e_route_spring_head_old', 'e_rest'],
    doneTag: '春头样纸已理',
    doneLog: '〔春头样纸〕这一旬先把熟号先递的口风、样纸脚费和家里灯油盐药分开了；商路晚景开春第一旬不再只有“议不议轮养”，连最先冒出来的样纸与家用也先在这一旬碰了账。',
    cost: 35,
    costTag: '春头样纸',
    costLog: '〔春头样纸〕熟号样纸、递话脚费和灯油盐药一起要钱：铜钱-{cost}。不是另起一笔大账，却正把商路养老春头最先冒出来的样纸与家用碎费重新压回真账。',
    failTag: '春头样纸硬顶',
    failLog: '〔春头样纸〕这一旬连样纸脚费和灯油盐药都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'spring' && xun === 1) apply({
    handledIds: ['e_negotiate', 'e_tutor_spring_head_old', 'e_write_old', 'e_rest'],
    doneTag: '春头馆契已理',
    doneLog: '〔春头馆契〕这一旬先把旧馆回帖、抄手纸费、递话脚费和灯油锅火分开了；举业路晚景开春上旬不再只有“议不议轮养”，连旧馆门路与家里锅火也先在这一旬碰了账。',
    cost: 40,
    costTag: '春头馆契',
    costLog: '〔春头馆契〕旧馆回帖、抄手纸费、递话脚费和灯油锅火一起要钱：铜钱-{cost}。不是另起一笔大账，却正把举业路养老春头最先冒出来的馆契与家用碎费重新压回真账。',
    failTag: '春头馆契硬顶',
    failLog: '〔春头馆契〕这一旬连回帖门包和灯油锅火都腾挪不开，只得先硬顶过去；旧馆与家里两头的开春口风都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (season.id === 'spring' && xun === 2) apply(isApprenticeElder ? {
    handledIds: ['e_city', 'e_shop_spring_reply_old', 'e_rest'],
    doneTag: '旧铺回话已理',
    doneLog: '〔旧铺回话〕这一旬先把托旧掌柜递话、回铺脚费和家里灯油锅火分开了；养老开春最容易起皱的那层铺里回话，没有再拖成旬旬空等。',
    cost: 35,
    costTag: '旧铺回话',
    costLog: '〔旧铺回话〕托旧掌柜递话、回铺脚费和灯油锅火一起要钱：铜钱-{cost}。不是大账，却正把学徒路晚年开春最先冒头的回话细账重新压回真账。',
    failTag: '旧铺回话硬顶',
    failLog: '〔旧铺回话〕这一旬连递话脚费和灯油都腾挪不开，只得先硬顶过去；那层旧铺门路在人情面上又薄了一线（家族-1）。',
    hardship: 'clan'
  } : isMerchantElder ? {
    handledIds: ['e_negotiate', 'e_route_price_old', 'e_route_spring_reply_old', 'e_rest'],
    doneTag: '春路回话已理',
    doneLog: '〔春路回话〕这一旬先把熟号回话脚费、春价抄单和家里盐药锅火分开了；商路养老开春最容易先皱起来的那层回话与家用，没有再拖成整季空等。',
    cost: 40,
    costTag: '春路回话',
    costLog: '〔春路回话〕熟号回话脚费、春价抄单和家里盐药锅火一起要钱：铜钱-{cost}。不是另起一笔大账，只是把商路晚景开春最先冒头的那层碎耗重新压回真账。',
    failTag: '春路回话硬顶',
    failLog: '〔春路回话〕这一旬连熟号回话脚费和家里盐药都腾挪不开，只得先硬顶过去；外头熟号与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  } : isExamElder ? {
    handledIds: ['e_negotiate', 'e_tutor_note_old', 'e_write_old', 'e_rest'],
    doneTag: '旧馆回话已理',
    doneLog: '〔旧馆回话〕这一旬先把旧馆回话、递帖脚费和灯油锅火分开了；举业路养老开春最容易先皱起来的那层旧馆人情，没有再拖成旬旬空等。',
    cost: 40,
    costTag: '旧馆回话',
    costLog: '〔旧馆回话〕旧馆回话、递帖脚费和灯油锅火一起要钱：铜钱-{cost}。不是大账，却正把举业路晚景开春最先冒头的旧馆细账重新压回真账。',
    failTag: '旧馆硬顶',
    failLog: '〔旧馆回话〕这一旬连递帖脚费和灯油都腾挪不开，只得先硬顶过去；旧馆和乡里两头的人情面都更薄了一线（家族-1）。',
    hardship: 'clan'
  } : isWageElder ? {
    handledIds: ['e_negotiate', 'e_wage_note_old', 'e_rest'],
    doneTag: '旧工回话已理',
    doneLog: '〔旧工回话〕这一旬先把旧工头回话、春里带话脚费和灶下灯火分开了；卖工路养老开春最容易先皱起来的那层工棚回话，没有再拖成旬旬空等。',
    cost: 35,
    costTag: '旧工回话',
    costLog: '〔旧工回话〕旧工头回话、带话脚费和灶下灯火一起要钱：铜钱-{cost}。不是大账，却正把卖工路晚景开春最先冒头的工棚细账重新压回真账。',
    failTag: '旧工硬顶',
    failLog: '〔旧工回话〕这一旬连带话脚费和灶下灯火都腾挪不开，只得先硬顶过去；旧工头与家里两头的口风都更凉了一线（家族-1）。',
    hardship: 'clan'
  } : {
    handledIds: ['e_negotiate', 'e_city', 'e_write_old', 'e_rest'],
    doneTag: '春安顿已理',
    doneLog: '〔春安顿碎账〕这一旬先把递话薄礼、灯油锅火和请子侄说合的口风分开了；养老开春最容易起皱的那层安顿细账，没有再被拖成旬旬扯皮。',
    cost: 35,
    costTag: '春安顿碎账',
    costLog: '〔春安顿碎账〕递话薄礼、灯油锅火和请子侄说合的脚费一起要钱：铜钱-{cost}。不是大账，却正把养老这一年最先冒头的安顿细账重新压回真账。',
    failTag: '春安顿硬顶',
    failLog: '〔春安顿碎账〕这一旬连递话薄礼与锅火都腾挪不开，只得先硬顶过去；子侄与邻里看你这一房的口风又紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isApprenticeElder && season.id === 'spring' && xun === 3) apply({
    handledIds: ['e_shop_spring_packet_old', 'e_rest'],
    doneTag: '春尾铺脚已分',
    doneLog: '〔春尾铺脚〕这一旬先把清明香纸、抄手纸费、回铺脚费和灶下锅火分开了；学徒路晚景春尾最怕“铺里还认你，香纸和锅火却先把现钱磨薄”的那层小账，没有再顺手拖进伏夏。',
    cost: 35,
    costTag: '春尾铺脚',
    costLog: '〔春尾铺脚〕清明香纸、抄手纸费、回铺脚费和灶下锅火一起要钱：铜钱-{cost}。不是大账，却正把学徒路老年春尾最细的香纸脚费重新压回这一旬。',
    failTag: '春尾铺脚硬顶',
    failLog: '〔春尾铺脚〕这一旬连香纸和回铺脚费都腾挪不开，只得先硬顶过去；旧铺与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'spring' && xun === 2) apply({
    handledIds: ['e_tutor_spring_reply_old', 'e_rest'],
    doneTag: '春中帖脚已理',
    doneLog: '〔春中帖脚〕这一旬先把旧馆帖样、回馆门包、递话脚费和家里盐药分开了；举业路晚景春中最怕“馆里仍认你，帖样和锅火却先来抢钱”的那层小账，没有再一路拖到春尾才一起反咬。',
    cost: 35,
    costTag: '春中帖脚',
    costLog: '〔春中帖脚〕旧馆帖样、回馆门包、递话脚费和家里盐药一起要钱：铜钱-{cost}。不是大账，却正把举业路老年春中最细的帖样脚费重新压回这一旬。',
    failTag: '春中帖脚硬顶',
    failLog: '〔春中帖脚〕这一旬连回馆门包和递话脚费都腾挪不开，只得先硬顶过去；旧馆与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'spring' && xun === 2) apply({
    handledIds: ['e_route_price_old', 'e_route_spring_reply_old', 'e_rest'],
    doneTag: '春中回签已理',
    doneLog: '〔春中回签〕这一旬先把熟号回签、样纸门包、递话脚费和家里盐药锅火分开了；商路晚景春安顿中旬最怕“旧账还没坐实，门包和锅火先来要钱”的那层小账，没有再顺手拖到春尾一起滚大。',
    cost: 35,
    costTag: '春中回签',
    costLog: '〔春中回签〕熟号回签、样纸门包、递话脚费和家里盐药锅火一起要钱：铜钱-{cost}。不是新主线，却正把商路养老春中那层最细的门包与锅火摩擦重新压回这一旬。',
    failTag: '春中回签硬顶',
    failLog: '〔春中回签〕这一旬连回签脚费和样纸门包都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'spring' && xun === 3) apply({
    handledIds: ['e_write_old', 'e_tutor_spring_packet_old', 'e_rest'],
    doneTag: '春尾纸香已分',
    doneLog: '〔春尾纸香〕这一旬先把春尾抄手、清明香纸和回馆脚费分开了；举业路养老开春最怕“旧馆还认你，纸香和脚费却先把那层门路磨薄”的那口小账，没有再拖到夏里才一起反咬。',
    cost: 35,
    costTag: '春尾纸香',
    costLog: '〔春尾纸香〕春尾抄手、清明香纸和回馆脚费一起要钱：铜钱-{cost}。不是大账，却正把举业路晚景开春收束前最细的那层纸香脚费重新压回这一旬。',
    failTag: '春尾纸香硬顶',
    failLog: '〔春尾纸香〕这一旬连香纸和回馆脚费都腾挪不开，只得先硬顶过去；旧馆与学生家这层口风先紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'spring' && xun === 3) apply({
    handledIds: ['e_wage_spring_packet_old', 'e_rest'],
    doneTag: '春尾工包已分',
    doneLog: '〔春尾工包〕这一旬先把春尾草鞋香纸、回话脚费和家里盐药锅火分开了；卖工路养老开春收束前最怕“工棚还认你，草鞋和锅火却先来抢钱”的那层小账，没有再顺手拖进伏夏。',
    cost: 35,
    costTag: '春尾工包',
    costLog: '〔春尾工包〕春尾草鞋香纸、回话脚费和盐药锅火一起要钱：铜钱-{cost}。不是大账，却正把卖工路晚景开春收束前最细的那层工包与锅火摩擦重新压回这一旬。',
    failTag: '春尾工包硬顶',
    failLog: '〔春尾工包〕这一旬连草鞋香纸和回话脚费都腾挪不开，只得先硬顶过去；旧工头与家里锅火两头都更凉了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'summer' && xun === 1) apply({
    handledIds: ['e_med', 'e_wage_summer_soup_old', 'e_rest'],
    doneTag: '伏夏工汤已理',
    doneLog: '〔伏夏工汤〕这一旬先把工棚茶汤、草鞋药脚、带话门包和家里凉药分开了；卖工路养老伏夏刚起头最怕“旧工路数还认你，身子和锅火却先被暑气磨薄”的那层工汤小耗，没有再顺着热里一起滚大。',
    cost: 40,
    costTag: '伏夏工汤',
    costLog: '〔伏夏工汤〕工棚茶汤、草鞋药脚、带话门包和家里凉药一起要钱：铜钱-{cost}。不是大祸，却正把卖工路养老夏头最先冒出来的工汤与药脚摩擦重新压回这一旬。',
    failTag: '伏夏工汤硬扛',
    failLog: '〔伏夏工汤〕这一旬连草鞋药脚和凉药小钱都腾挪不开，只得先硬扛过去；热里身子和旧工路数都更薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isApprenticeElder && season.id === 'summer' && xun === 2) apply({
    handledIds: ['e_med', 'e_shop_bundle_old', 'e_rest'],
    doneTag: '伏夏铺药已顾',
    doneLog: '〔伏夏铺药〕这一旬先把铺里茶汤、汗药针线、旧同门捎布药与回乡带话脚费分开了；学徒路晚景最怕“铺里门路还在，家里和身子却先被暑热磨穿”的那层伏夏耗损，没有再顺着热里一起滚大。',
    cost: 45,
    costTag: '伏夏铺药',
    costLog: '〔伏夏铺药〕铺里茶汤、汗药针线、旧同门捎布药和带话脚费一起要钱：铜钱-{cost}。不是另起一笔大账，只是把学徒路晚景伏夏最磨人的那层铺药与脚费重新压回这一旬。',
    failTag: '伏夏铺药硬扛',
    failLog: '〔伏夏铺药〕这一旬连汗药针线和带话脚费都腾挪不开，只得先硬扛过去；热里铺面门路和家里身子一并更吃紧了一层（体魄-1）。',
    hardship: 'body'
  });
  if (isApprenticeElder && season.id === 'summer' && xun === 3) apply({
    handledIds: ['e_shop_summer_tail_old', 'e_rest'],
    doneTag: '夏尾铺签已理',
    doneLog: '〔夏尾铺签〕这一旬先把旧掌柜回签、秋前脚单、递话门包和过路药包分开了；学徒路晚景伏夏收尾不再只剩“熬过暑气”，连秋前最细的回铺后手也先压回了这一旬。',
    cost: 35,
    costTag: '夏尾铺签',
    costLog: '〔夏尾铺签〕旧掌柜回签、秋前脚单、递话门包和过路药包一起要钱：铜钱-{cost}。不是大账，却正把学徒路养老夏尾那层“秋前脚路未开、回铺回签先来催钱”的细耗重新拖回这一旬。',
    failTag: '夏尾铺签硬顶',
    failLog: '〔夏尾铺签〕这一旬连回签脚费和秋前脚单都腾挪不开，只得先硬顶过去；旧掌柜与递话人这层口风又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'summer' && xun === 2) apply({
    handledIds: ['e_med', 'e_route_summer_wharf_old', 'e_route_bundle_old', 'e_rest'],
    doneTag: '伏夏布药已顾',
    doneLog: '〔伏夏布药〕这一旬先把熟号水脚、捎布药、凉茶汗药和回乡脚费分开了；商路养老最怕“人还撑着、家里先病着”的那层伏夏耗损，没有再顺着热里一起滚大。',
    cost: 45,
    costTag: '伏夏布药',
    costLog: '〔伏夏布药〕熟号水脚、捎布药、凉茶汗药和回乡脚费一起要钱：铜钱-{cost}。不是大祸，却正把晚景伏夏最磨人的那层家用与身子摩擦重新压回这一旬。',
    failTag: '伏夏布药硬扛',
    failLog: '〔伏夏布药〕这一旬连水脚、布药脚费与凉茶汗药都腾挪不开，只得先硬扛过去；热里家里和身子都更吃紧了一层（体魄-1）。',
    hardship: 'body'
  });
  if (isMerchantElder && season.id === 'summer' && xun === 3) apply({
    handledIds: ['e_route_summer_packet_old', 'e_rest'],
    doneTag: '夏尾客签已理',
    doneLog: '〔夏尾客签〕这一旬先把客签回话、秋前样纸、递话门包和过路药包理开了；商路养老伏夏收尾不再只剩“熬过暑气”，连秋前最细的客签后手也先压回了这一旬。',
    cost: 35,
    costTag: '夏尾客签',
    costLog: '〔夏尾客签〕客签回话、秋前样纸、递话门包和过路药包一起要钱：铜钱-{cost}。不是新主线，却正把商路养老夏尾那层“秋钱未到、秋前后手先来”的细耗重新拖回这一旬。',
    failTag: '夏尾客签硬顶',
    failLog: '〔夏尾客签〕这一旬连客签回话和秋前样纸都腾挪不开，只得先硬顶过去；熟号与客路这层口风又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'spring' && xun === 3) apply({
    handledIds: ['e_route_spring_packet_old', 'e_rest'],
    doneTag: '春尾香脚已分',
    doneLog: '〔春尾香脚〕这一旬先把春尾香纸、回话脚费和家里盐药锅火分开了；商路晚景开春收束前最怕那层“旧账还在路上、春礼与药脚却先到”的小耗，没有再顺着清明一起滚大。',
    cost: 35,
    costTag: '春尾香脚',
    costLog: '〔春尾香脚〕春尾香纸、回话脚费和盐药锅火一起要钱：铜钱-{cost}。不是大账，却正把商路养老开春收束前最细、也最躲不开的那层香脚碎费重新压回这一旬。',
    failTag: '春尾香脚硬顶',
    failLog: '〔春尾香脚〕这一旬连香纸和回话脚费都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更凉了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'summer' && xun === 1) apply({
    handledIds: ['e_med', 'e_route_summer_note_old', 'e_rest'],
    doneTag: '伏夏回签已理',
    doneLog: '〔伏夏回签〕这一旬先把熟号回签、凉药脚费和行栈茶钱分开了；商路养老伏夏刚起头最怕“旧账未稳、身子先热垮”的那层回签与药脚，没有再顺着热里一起滚大。',
    cost: 40,
    costTag: '伏夏回签',
    costLog: '〔伏夏回签〕熟号回签、凉药脚费和行栈茶钱一起要钱：铜钱-{cost}。不是新主线，只是把商路晚景伏夏刚起头最细的一层路签与药脚重新压回这一旬。',
    failTag: '伏夏回签硬顶',
    failLog: '〔伏夏回签〕这一旬连凉药脚费和熟号回签都腾挪不开，只得先硬扛过去；热里身子与熟号口风都更紧了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isApprenticeElder && season.id === 'summer' && xun === 1) apply({
    handledIds: ['e_med', 'e_shop_summer_note_old', 'e_rest'],
    doneTag: '伏夏铺签已理',
    doneLog: '〔伏夏铺签〕这一旬先把旧掌柜回签、铺里茶汤、凉药脚费和递话门包分开了；学徒路晚景伏夏刚起头最怕“旧铺还认你，身子和锅火却先被热里磨薄”的那层铺签小账，没有再顺手拖进中旬铺药。',
    cost: 40,
    costTag: '伏夏铺签',
    costLog: '〔伏夏铺签〕旧掌柜回签、铺里茶汤、凉药脚费和递话门包一起要钱：铜钱-{cost}。不是大祸，却正把学徒路老年伏夏头一旬最细的铺签与药脚重新压回这一旬。',
    failTag: '伏夏铺签硬扛',
    failLog: '〔伏夏铺签〕这一旬连茶汤药脚和递话门包都腾挪不开，只得先硬扛过去；热里身子与旧铺口风都更薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isWageElder && season.id === 'summer' && xun === 2) apply({
    handledIds: ['e_med', 'e_wage_bundle_old', 'e_rest'],
    doneTag: '伏夏药脚已顾',
    doneLog: '〔伏夏药脚〕这一旬先把凉汤药、布鞋药脚和旧工头捎话分开了；卖工路养老最怕“人还想硬撑、身子却先在伏夏散下来”的那层耗损，没有再顺着热里一起滚大。',
    cost: 40,
    costTag: '伏夏药脚',
    costLog: '〔伏夏药脚〕凉汤药、布鞋药脚和旧工头捎话一起要钱：铜钱-{cost}。不是大祸，却正把卖工路晚景伏夏最磨人的那层药脚摩擦重新压回这一旬。',
    failTag: '伏夏药脚硬扛',
    failLog: '〔伏夏药脚〕这一旬连凉汤药和药脚小钱都腾挪不开，只得先硬扛过去；热里身子和家计都更吃紧了一层（体魄-1）。',
    hardship: 'body'
  });
  if (isWageElder && season.id === 'summer' && xun === 3) apply({
    handledIds: ['e_wage_summer_tail_old', 'e_rest'],
    doneTag: '夏尾工信已理',
    doneLog: '〔夏尾工信〕这一旬先把旧工棚回话、秋前草料、递话脚费和过路药包理开了；卖工路养老伏夏收尾不再只剩“熬过暑气”，连秋前最细的回工后手也先压回了这一旬。',
    cost: 35,
    costTag: '夏尾工信',
    costLog: '〔夏尾工信〕旧工棚回话、秋前草料、递话脚费和过路药包一起要钱：铜钱-{cost}。不是大账，却正把卖工路养老夏尾那层“秋钱未到、秋前后手先来”的细耗重新拖回这一旬。',
    failTag: '夏尾工信硬顶',
    failLog: '〔夏尾工信〕这一旬连回工信脚费和秋前草料都腾挪不开，只得先硬顶过去；旧工头与回乡口风这层门路又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'summer' && xun === 1) apply({
    handledIds: ['e_med', 'e_tutor_summer_soup_old', 'e_rest'],
    doneTag: '伏夏馆汤已理',
    doneLog: '〔伏夏馆汤〕这一旬先把馆里茶汤、潮纸脚费、递话门包和家里凉药分开了；举业路晚景伏夏刚起头最怕“旧馆门路还认你，家里和身子却先被暑气磨薄”的那层馆汤小耗，没有再一起滚大。',
    cost: 40,
    costTag: '伏夏馆汤',
    costLog: '〔伏夏馆汤〕馆里茶汤、潮纸脚费、递话门包和家里凉药一起要钱：铜钱-{cost}。不是大祸，却正把举业路养老夏头最先冒出来的馆汤与锅火摩擦重新压回这一旬。',
    failTag: '伏夏馆汤硬顶',
    failLog: '〔伏夏馆汤〕这一旬连馆里茶汤和凉药脚费都腾挪不开，只得先硬扛过去；旧馆门路与身子都更薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isExamElder && season.id === 'summer' && xun === 2) apply({
    handledIds: ['e_med', 'e_tutor_bundle_old', 'e_rest'],
    doneTag: '伏夏纸药已顾',
    doneLog: '〔伏夏纸药〕这一旬先把凉药、纸墨、旧馆带话脚费和家里锅火分开了；举业路晚景最怕“笔墨底子还在，身子和家计却先被暑热磨穿”的那层伏夏耗损，没有再一起滚大。',
    cost: 45,
    costTag: '伏夏纸药',
    costLog: '〔伏夏纸药〕凉药、纸墨、旧馆带话脚费和家里锅火一起要钱：铜钱-{cost}。不是大祸，却正把举业路养老伏夏最磨人的那层身体与笔墨摩擦重新压回这一旬。',
    failTag: '伏夏纸药硬扛',
    failLog: '〔伏夏纸药〕这一旬连凉药和纸墨小钱都腾挪不开，只得先硬扛过去；身子与旧馆门路都更薄了一层（体魄-1）。',
    hardship: 'body'
  });
  if (isExamElder && season.id === 'summer' && xun === 3) apply({
    handledIds: ['e_tutor_summer_tail_old', 'e_rest'],
    doneTag: '夏尾馆信已理',
    doneLog: '〔夏尾馆信〕这一旬先把学生家回签、秋前纸样、递话脚费和过路药包分开了；举业路晚景最怕“伏夏刚熬住，秋前那层回签和纸样又先来抢钱”的那口夏尾细账，没有再拖到秋头才一起反咬。',
    cost: 35,
    costTag: '夏尾馆信',
    costLog: '〔夏尾馆信〕学生家回签、秋前纸样、递话脚费和过路药包一起要钱：铜钱-{cost}。不是大账，却正把举业路养老伏夏收尾前最细的一层馆信碎费重新压回这一旬。',
    failTag: '夏尾馆信硬顶',
    failLog: '〔夏尾馆信〕这一旬连回签脚费和秋前纸样都腾挪不开，只得先硬扛过去；旧馆与学生家这层口风又慢了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isApprenticeElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_rent', 'e_shop_autumn_note_old', 'e_rest'],
    doneTag: '秋头铺单已理',
    doneLog: '〔秋头铺单〕这一旬先把回铺脚单、租路次序和递话口风分开了；学徒路晚景秋头最怕“铺里都说会回、乡里都说会到，却没人说得清先后”的那层细账，没有再被拖成整季空等。',
    cost: 35,
    costTag: '秋头铺单',
    costLog: '〔秋头铺单〕回铺脚单、租路次序抄手和递话脚费一起要钱：铜钱-{cost}。不是大账，却正把学徒路老年秋头最容易糊过去的脚单碎费重新压回这一旬。',
    failTag: '秋头铺单硬顶',
    failLog: '〔秋头铺单〕这一旬连脚单抄手和递话脚费都腾挪不开，只得先硬顶过去；旧铺与乡里两头的回话都慢了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_rent', 'e_route_receipt_old', 'e_route_autumn_note_old', 'e_rest'],
    doneTag: '秋头回签已理',
    doneLog: '〔秋头回签〕这一旬先把秋头回签、米脚锅火和收租脚费分开了；商路晚景秋头最怕“租谷刚起、熟号回话先催、家里锅火也来要钱”的那层头账，没有再顺手拖进秋中。',
    cost: 40,
    costTag: '秋头回签',
    costLog: '〔秋头回签〕秋头回签、米脚锅火和收租脚单一起要钱：铜钱-{cost}。不是另起一笔大账，只是把商路养老秋头最先冒出来的家用、回签与租路碎费重新压回这一旬。',
    failTag: '秋头回签硬顶',
    failLog: '〔秋头回签〕这一旬连回签脚费和米脚锅火都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_tutor_receipt_old', 'e_rest'],
    doneTag: '秋馆回签已理',
    doneLog: '〔秋馆回签〕这一旬先把学生家回签、佃路次序和递话脚费分开了；举业路晚景秋头最怕“都说会回，却没人说明先后”的那层细账，没有再被拖成一句空等。',
    cost: 35,
    costTag: '秋馆回签',
    costLog: '〔秋馆回签〕学生家回签、佃路次序抄手和递话脚费一起要钱：铜钱-{cost}。不是大账，却正把举业路老年秋头最容易糊过去的回签碎费重新压回这一旬。',
    failTag: '秋馆回签硬顶',
    failLog: '〔秋馆回签〕这一旬连回签抄手和递话脚费都腾挪不开，只得先硬顶过去；学生家与乡里两头的回话都慢了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_wage_receipt_old', 'e_rest'],
    doneTag: '秋工欠单已理',
    doneLog: '〔秋工欠单〕这一旬先把旧工欠单、租路次序和回乡脚费分开了；卖工路晚景秋头最怕“都说会结，却没人说明先后”的那层细账，没有再被拖成一句空等。',
    cost: 35,
    costTag: '秋工欠单',
    costLog: '〔秋工欠单〕旧工欠单、租路次序抄手和回乡脚费一起要钱：铜钱-{cost}。不是大账，却正把卖工路老年秋头最容易糊过去的工单碎费重新压回这一旬。',
    failTag: '秋工欠单硬顶',
    failLog: '〔秋工欠单〕这一旬连抄单纸墨和回乡脚费都腾挪不开，只得先硬顶过去；旧工头和乡里两头的回话都慢了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_wage_autumn_head_old', 'e_rest'],
    doneTag: '秋头夹衣已理',
    doneLog: '〔秋头夹衣〕这一旬先把旧工头回签、夹衣药包、回乡门包和锅火小耗分开了；卖工路晚景秋头最怕“回音刚起一点，换季夹衣和药包却先来追钱”的那层细账，没有再一路拖到秋中才一起发硬。',
    cost: 40,
    costTag: '秋头夹衣',
    costLog: '〔秋头夹衣〕旧工头回签、夹衣药包、回乡门包和锅火小耗一起要钱：铜钱-{cost}。不是大账，却正把卖工路老年秋头最细的一层换季夹衣、药包与回签摩擦重新压回这一旬。',
    failTag: '秋头夹衣硬顶',
    failLog: '〔秋头夹衣〕这一旬连夹衣药包和回乡门包都腾挪不开，只得先硬顶过去；身上穿用和旧工头回话两头都更紧了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isExamElder && season.id === 'autumn' && xun === 1) apply({
    handledIds: ['e_tutor_autumn_reply_old', 'e_rest'],
    doneTag: '秋头帖脚已理',
    doneLog: '〔秋头帖脚〕这一旬先把馆帖回话、学生家门包、租路小脚费和锅火分开了；举业路老年秋头最怕“馆账未回，学生家和锅火先来抢钱”的那层帖脚碎账，没有再拖到秋中才一起发硬。',
    cost: 35,
    costTag: '秋头帖脚',
    costLog: '〔秋头帖脚〕馆帖回话、学生家门包、租路小脚费和锅火一起要钱：铜钱-{cost}。不是大账，却正把举业路老年秋头最细的那层帖脚与锅火摩擦重新压回这一旬。',
    failTag: '秋头帖脚硬顶',
    failLog: '〔秋头帖脚〕这一旬连门包和小脚费都腾挪不开，只得先硬顶过去；学生家和锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (season.id === 'autumn' && xun === 2) apply(isApprenticeElder ? {
    handledIds: ['e_shop_collect_old', 'e_shop_autumn_mid_old', 'e_rest'],
    doneTag: '秋中铺账已顾',
    doneLog: '〔秋中铺账〕这一旬先把结回旧脚钱、租路饭钱、回话脚费和家里锅火分开了；老来最怕“旧门路还在却回不到养老账，锅火和脚路又先来抢钱”的那层秋中碎费，没有再悄悄磨空。',
    cost: 45,
    costTag: '秋中铺账',
    costLog: '〔秋中铺账〕结回旧脚钱、租路饭钱、回话脚费和锅火小耗一起要钱：铜钱-{cost}。不是新主线，只是把学徒路老年真正磨人的秋中铺账、锅火与脚路重新压回养老账。',
    failTag: '秋中铺账硬顶',
    failLog: '〔秋中铺账〕这一旬连回话脚费和租路饭钱都腾挪不开，只得先硬顶过去；旧铺与乡里两头的话路都慢了一层（家族-1）。',
    hardship: 'clan'
  } : isMerchantElder ? {
    handledIds: ['e_rent', 'e_collect_old', 'e_route_receipt_old', 'e_rest'],
    doneTag: '秋后账路已顾',
    doneLog: '〔秋后账路〕这一旬先把收租脚费、催旧账回话和拖欠次序抄明了；商路晚景最怕“钱都说在路上，却没有哪口真回到养老账”，这一层秋后账路没有再继续糊着走。',
    cost: 45,
    costTag: '秋后账路',
    costLog: '〔秋后账路〕收租脚费、催旧账回话和脚单纸墨一起要钱：铜钱-{cost}。不是新主线，只是把商路老年真正磨人的秋后账路重新摊回这一旬。',
    failTag: '秋后账路硬顶',
    failLog: '〔秋后账路〕这一旬连脚单纸墨和回话脚费都腾挪不开，只得先硬顶过去；家里等钱与外头旧账两头都更慢了一层（家族-1）。',
    hardship: 'clan'
  } : isExamElder ? {
    handledIds: ['e_rent', 'e_tutor_collect_old', 'e_tutor_autumn_mid_old', 'e_rest'],
    doneTag: '馆账租路已顾',
    doneLog: '〔馆账租路〕这一旬先把旧馆润笔、秋后租谷、回话脚费和租路饭钱分开了；举业路老来最怕“馆账刚回到手，租路和锅火又把这一口钱分走”的那层秋中细账，没有再悄悄磨空。',
    cost: 45,
    costTag: '馆账租路',
    costLog: '〔馆账租路〕旧馆润笔、秋后租谷、回话脚费和租路饭钱一起要钱：铜钱-{cost}。不是新主线，只是把举业路老年这一层真正磨人的馆账、租路与锅火重新压回养老账。',
    failTag: '馆账租路硬顶',
    failLog: '〔馆账租路〕这一旬连回话脚费和租路饭钱都腾挪不开，只得先硬顶过去；旧馆与乡里两头的应声都慢了一层（家族-1）。',
    hardship: 'clan'
  } : isWageElder ? {
    handledIds: ['e_rent', 'e_wage_collect_old', 'e_wage_autumn_mid_old', 'e_rest'],
    doneTag: '工账租路已顾',
    doneLog: '〔工账租路〕这一旬先把结回旧欠工、催佃回话和回乡脚路分开了；卖工路老来最怕“旧工路还认你，养老账却接不回来”的那层秋后细账，没有再悄悄磨空。',
    cost: 45,
    costTag: '工账租路',
    costLog: '〔工账租路〕结回旧欠工、催佃回话和回乡脚路一起要钱：铜钱-{cost}。不是新主线，只是把卖工路老年真正磨人的工账与租路重新压回养老账。',
    failTag: '工账租路硬顶',
    failLog: '〔工账租路〕这一旬连回乡脚费和催佃回话都腾挪不开，只得先硬顶过去；旧工头和乡里两头的应声都慢了一层（家族-1）。',
    hardship: 'clan'
  } : {
    handledIds: ['e_rent', 'e_collect_old', 'e_field_keep', 'e_rest'],
    doneTag: '秋后脚路已顾',
    doneLog: '〔秋后脚路〕这一旬先把收租脚费、催账回话和看田饭食分开了；老年最怕的“田还在却收不回来”，没有再被秋后一层小耗悄悄磨空。',
    cost: 40,
    costTag: '秋后脚路',
    costLog: '〔秋后脚路〕收租脚费、催账回话和看田饭食一起要钱：铜钱-{cost}。不是新主线，只是把秋后这一层真正的行路碎费重新压回养老账。',
    failTag: '秋后脚路硬顶',
    failLog: '〔秋后脚路〕这一旬连脚费和饭食都腾挪不开，只得先硬顶过去；眼看着有田有账，回话却更慢了一层（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'autumn' && xun === 2) apply({
    handledIds: ['e_route_autumn_mid_old', 'e_rest'],
    doneTag: '秋中回签已理',
    doneLog: '〔秋中回签〕这一旬先把熟号回签、租路饭钱、递话脚费和家里锅火分开了；商路晚景秋中最怕“回音刚起一点，租路和锅火又先来追钱”的那层细账，没有再一路拖到秋尾才一起发硬。',
    cost: 35,
    costTag: '秋中回签',
    costLog: '〔秋中回签〕熟号回签、租路饭钱、递话脚费和家里锅火一起要钱：铜钱-{cost}。不是新主线，却正把商路老年秋中最细的那层回签、饭钱与锅火摩擦重新压回这一旬。',
    failTag: '秋中回签硬顶',
    failLog: '〔秋中回签〕这一旬连租路饭钱和递话脚费都腾挪不开，只得先硬顶过去；熟号与家里锅火两头的口风又紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isApprenticeElder && season.id === 'autumn' && xun === 3) apply({
    handledIds: ['e_shop_autumn_tail_old', 'e_rest'],
    doneTag: '秋尾铺脚已理',
    doneLog: '〔秋尾铺脚〕这一旬先把回铺脚费、催单脚路、灯炭锅火和过路药包分开了；学徒路老来最怕“秋账刚说快回，过冬锅火却先来抢钱”的那层尾账，没有再顺手拖进冬里。',
    cost: 40,
    costTag: '秋尾铺脚',
    costLog: '〔秋尾铺脚〕回铺脚费、催单脚路、灯炭锅火和过路药包一起要钱：铜钱-{cost}。不是大账，却正把学徒路养老秋尾那层“秋账未净、冬里先要过”的摩擦重新压回这一旬。',
    failTag: '秋尾铺脚硬顶',
    failLog: '〔秋尾铺脚〕这一旬连回铺脚费和锅火小耗都腾挪不开，只得先硬顶过去；旧铺与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'autumn' && xun === 3) apply({
    handledIds: ['e_route_autumn_tail_old', 'e_collect_old', 'e_rest'],
    doneTag: '秋尾账脚已理',
    doneLog: '〔秋尾账脚〕这一旬先把秋尾回话脚费、锅火碎用和催单脚路分开了；商路老来最怕“秋账看着将回、过冬锅火却先来要钱”的那层尾账，没有再被顺手拖进冬里。',
    cost: 40,
    costTag: '秋尾账脚',
    costLog: '〔秋尾账脚〕秋尾回话脚费、锅火碎用和催单脚路一起要钱：铜钱-{cost}。不是新主线，却正把商路养老秋尾那层“钱还没回到手、冬里先要过”的摩擦重新压回这一旬。',
    failTag: '秋尾账脚硬顶',
    failLog: '〔秋尾账脚〕这一旬连回话脚费和锅火小耗都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'autumn' && xun === 3) apply({
    handledIds: ['e_tutor_autumn_tail_reply_old', 'e_tutor_autumn_bundle_old', 'e_rest'],
    doneTag: '秋尾馆炭已分',
    doneLog: '〔秋尾馆炭〕这一旬先把学生家回帖、灯炭脚费、锅火零用和学生家小回礼分开了；举业路晚景最怕“秋账刚结回，学生回帖和冬里帖费又一起起”的那层尾账，没有再被顺手拖进年关。',
    cost: 35,
    costTag: '秋尾馆炭',
    costLog: '〔秋尾馆炭〕学生家回帖、灯炭脚费、锅火零用和学生家小回礼一起要钱：铜钱-{cost}。不是大账，却正把举业路老年秋尾最细、也最容易被忽略的回帖与炭脚账重新压回这一旬。',
    failTag: '秋尾馆炭硬顶',
    failLog: '〔秋尾馆炭〕这一旬连回帖脚费、炭脚和锅火零用都腾挪不开，只得先硬顶过去；秋尾这层身子与门路的后手又薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isWageElder && season.id === 'autumn' && xun === 3) apply({
    handledIds: ['e_wage_autumn_tail_old', 'e_rest'],
    doneTag: '秋尾工脚已理',
    doneLog: '〔秋尾工脚〕这一旬先把秋尾锅火、回乡草鞋脚和催单脚路分开了；卖工路晚景最怕“工账刚说快结，过冬锅火却先来要钱”的那层尾账，没有再被顺手拖进冬里。',
    cost: 35,
    costTag: '秋尾工脚',
    costLog: '〔秋尾工脚〕秋尾锅火、回乡草鞋脚和催单脚路一起要钱：铜钱-{cost}。不是大账，却正把卖工路养老秋尾最细、也最容易被忽略的工脚账重新压回这一旬。',
    failTag: '秋尾工脚硬顶',
    failLog: '〔秋尾工脚〕这一旬连草鞋脚和锅火小耗都腾挪不开，只得先硬顶过去；秋尾这层身子与旧工路数的后手又薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (season.id === 'winter' && xun === 1) apply(isApprenticeElder ? {
    handledIds: ['e_sell', 'e_shop_gift_old', 'e_rest'],
    doneTag: '年关门路已续',
    doneLog: '〔年关门路〕这一旬先把旧掌柜薄礼、来春回铺脚费和灯油药引留出来了；冬里不必再把“还认不认你这层旧门路”拖到明春临头。',
    cost: 50,
    costTag: '年关门路',
    costLog: '〔年关门路〕旧掌柜薄礼、来春回铺脚费和灯油药引一起要钱：铜钱-{cost}。不是大账，却正把学徒路晚景最磨人的年关门路重新压回这一旬。',
    failTag: '年关门路硬顶',
    failLog: '〔年关门路〕这一旬连薄礼与回铺脚费都挪不开，只得靠身子硬顶过去；那层旧门路到冬里又薄了一线（体魄-1）。',
    hardship: 'body'
  } : isMerchantElder ? {
    handledIds: ['e_sell', 'e_rest', 'e_route_guest_old', 'e_route_winter_medicine_old'],
    doneTag: '年关账火已分',
    doneLog: '〔年关账火〕这一旬先把灯油炭火、年下药包、熟号回签和卖田后手分开了；冬里不再把“年关先熬过去”与“明春还走不走得动这条商路”混作一团。',
    cost: 45,
    costTag: '年关账火',
    costLog: '〔年关账火〕灯油炭火、年下药包、熟号回签和卖田后手一起要钱：铜钱-{cost}。不是大账，却正把商路养老年关最磨人的那层账火重新压回这一旬。',
    failTag: '年关账火硬顶',
    failLog: '〔年关账火〕这一旬连灯油炭火和年下药包都挪不开，只得靠身子硬顶过去；冬里的锅火与明春路数一并更紧了一线（体魄-1）。',
    hardship: 'body'
  } : isExamElder ? {
    handledIds: ['e_sell', 'e_tutor_gift_old', 'e_rest'],
    doneTag: '年关帖礼已留',
    doneLog: '〔年关帖礼〕这一旬先把塾师薄礼、来春帖费和灯油炭火分开了；冬里不必再把“旧馆门路还认不认你”拖到明春临头才想起。',
    cost: 45,
    costTag: '年关帖礼',
    costLog: '〔年关帖礼〕塾师薄礼、来春帖费和灯油炭火一起要钱：铜钱-{cost}。不是体面消费，而是把举业路晚景最磨人的年关帖礼重新压回这一旬。',
    failTag: '帖礼硬顶',
    failLog: '〔年关帖礼〕这一旬连薄礼与帖费都挪不开，只得靠身子硬顶过去；旧馆门路到冬里又薄了一线（体魄-1）。',
    hardship: 'body'
  } : isWageElder ? {
    handledIds: ['e_sell', 'e_wage_winter_head_old', 'e_wage_gift_old', 'e_rest'],
    doneTag: '年关工礼已留',
    doneLog: '〔年关工礼〕这一旬先把旧工头薄礼、来春头程脚费和灯油炭火分开了；冬里不必再把“明春还有没有工棚肯留脚”拖到临头才想起。',
    cost: 45,
    costTag: '年关工礼',
    costLog: '〔年关工礼〕旧工头薄礼、来春头程脚费和灯油炭火一起要钱：铜钱-{cost}。不是排场，而是把卖工路晚景最磨人的年关工礼重新压回这一旬。',
    failTag: '工礼硬顶',
    failLog: '〔年关工礼〕这一旬连薄礼与头程脚费都挪不开，只得靠身子硬顶过去；旧工路数到冬里又薄了一线（体魄-1）。',
    hardship: 'body'
  } : {
    handledIds: ['e_sell', 'e_write_old', 'e_rest'],
    doneTag: '年下后手已留',
    doneLog: '〔年下后手〕这一旬先把灯油炭火、来春药引和薄礼脚费留住了；晚景不再只剩“熬过这个冬天再说”。',
    cost: 45,
    costTag: '年下后手',
    costLog: '〔年下后手〕灯油炭火、来春药引和薄礼脚费一起要钱：铜钱-{cost}。不是大账，却正把晚年年关最磨人的那层后手重新压回这一旬。',
    failTag: '年下硬顶',
    failLog: '〔年下后手〕这一旬连灯油炭火和来春药引都挪不开，只得靠身子硬顶过去（体魄-1）。',
    hardship: 'body'
  });
  if (isExamElder && season.id === 'winter' && xun === 1) apply({
    handledIds: ['e_tutor_winter_reply_old', 'e_rest'],
    doneTag: '冬头馆信已理',
    doneLog: '〔冬头馆信〕这一旬先把旧馆回签、灯油炭火、年下药包和递帖脚费分开了；举业路晚景冬头最怕“年关还没到，旧馆和锅火先一起要钱”的那层馆信碎账，没有再顺手拖进帖礼与来春帖费里。',
    cost: 35,
    costTag: '冬头馆信',
    costLog: '〔冬头馆信〕旧馆回签、灯油炭火、年下药包和递帖脚费一起要钱：铜钱-{cost}。不是体面消费，却正把举业路老年冬头最细的那层馆信与灯炭账重新压回这一旬。',
    failTag: '冬头馆信硬顶',
    failLog: '〔冬头馆信〕这一旬连递帖脚费和灯炭小钱都腾挪不开，只得先硬顶过去；旧馆门路和家里锅火一并更紧了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isMerchantElder && season.id === 'winter' && xun === 2) apply({
    handledIds: ['e_route_guest_old', 'e_route_winter_reply_old', 'e_rest'],
    doneTag: '熟号薄礼已留',
    doneLog: '〔熟号薄礼〕这一旬先把熟号薄礼、脚夫回话、来春样纸定钱和柜边回签门包分开了；商路老来最怕“人情还在，却没有哪口小钱把它续到明春”，这一层门路没有在冬里忽然断掉。',
    cost: 40,
    costTag: '熟号薄礼',
    costLog: '〔熟号薄礼〕熟号薄礼、脚夫回话、来春样纸定钱和柜边回签门包一起要钱：铜钱-{cost}。不是体面消费，而是让明春第一旬不必重新从冷面求人开始。',
    failTag: '熟号薄礼硬顶',
    failLog: '〔熟号薄礼〕这一旬连薄礼、样纸定钱和回签门包都腾挪不开，只得先硬顶过去；熟号与脚夫这层门路又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isApprenticeElder && season.id === 'winter' && xun === 2) apply({
    handledIds: ['e_shop_winter_reply_old', 'e_rest'],
    doneTag: '冬中铺签已理',
    doneLog: '〔冬中铺签〕这一旬先把旧掌柜回签、灯炭针线、脚夫门包和来春回铺脚单分开了；学徒路老来最怕“旧铺还认你，灯炭和回铺后手却先来抢钱”的那层冬中细账，没有再顺手拖进冬尾。',
    cost: 40,
    costTag: '冬中铺签',
    costLog: '〔冬中铺签〕旧掌柜回签、灯炭针线、脚夫门包和来春回铺脚单一起要钱：铜钱-{cost}。不是体面消费，却正把学徒路老年冬中最细的那层铺签与灯炭账重新压回这一旬。',
    failTag: '冬中铺签硬顶',
    failLog: '〔冬中铺签〕这一旬连回签脚费和灯炭针线都腾挪不开，只得先硬顶过去；旧掌柜与脚夫这层门路又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'winter' && xun === 2) apply({
    handledIds: ['e_tutor_post_old', 'e_rest'],
    doneTag: '来春帖费已留',
    doneLog: '〔来春帖费〕这一旬先把来春帖费、旧馆回话脚费和纸墨定钱分开了；举业路老来最怕“人情还在，却没有哪口小钱把它续到明春”，这一层后手没有在冬里忽然断掉。',
    cost: 40,
    costTag: '来春帖费',
    costLog: '〔来春帖费〕来春帖费、旧馆回话脚费和纸墨定钱一起要钱：铜钱-{cost}。不是体面消费，而是让明春第一旬不必重新从冷面递帖开始。',
    failTag: '帖费硬顶',
    failLog: '〔来春帖费〕这一旬连回话脚费和纸墨定钱都腾挪不开，只得先硬顶过去；旧馆与学生家这层门路又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'winter' && xun === 2) apply({
    handledIds: ['e_wage_winter_reply_old', 'e_rest'],
    doneTag: '冬中回话已理',
    doneLog: '〔冬中回话〕这一旬先把旧工头回话、灯炭小钱、来春草鞋定钱和递话门包分开了；卖工路老来最怕“人情还在，却没有哪口小钱把它续到明春”，这一层工棚后手没有在冬里忽然断掉。',
    cost: 40,
    costTag: '冬中回话',
    costLog: '〔冬中回话〕旧工头回话、灯炭小钱、来春草鞋定钱和递话门包一起要钱：铜钱-{cost}。不是体面消费，而是让明春第一旬不必重新从冷面问工开始。',
    failTag: '冬中回话硬顶',
    failLog: '〔冬中回话〕这一旬连回话脚费和灯炭小钱都腾挪不开，只得先硬顶过去；旧工头与带话人这层门路又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_wage_winter_tail_old', 'e_rest'],
    doneTag: '冬尾草鞋已理',
    doneLog: '〔冬尾草鞋〕这一旬先把年下回签、来春草鞋、递话门包和头程脚路分开了；卖工路晚景最怕“旧工头还有回音，明春第一口草鞋和脚路却先来要钱”的那层冬尾细账，没有再拖到年后。',
    cost: 35,
    costTag: '冬尾草鞋',
    costLog: '〔冬尾草鞋〕年下回签、来春草鞋、递话门包和头程脚路一起要钱：铜钱-{cost}。不是大账，却正把卖工路老年冬尾那层“年下回音未净、明春头程先来追钱”的细摩擦重新压回这一旬。',
    failTag: '冬尾草鞋硬顶',
    failLog: '〔冬尾草鞋〕这一旬连年下回签脚费和来春草鞋都腾挪不开，只得先硬顶过去；旧工头回话和明春工路这层熟面又薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isExamElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_tutor_winter_bundle_old', 'e_rest'],
    doneTag: '冬尾笔炭已分',
    doneLog: '〔冬尾笔炭〕这一旬先把炭药、守岁零碎和学生家回话脚费分开了；举业路晚景最怕“年关刚扛过去，明春口风就先断掉”的那层冬尾细账，没有再继续滚大。',
    cost: 35,
    costTag: '冬尾笔炭',
    costLog: '〔冬尾笔炭〕炭药、守岁零碎和学生家回话脚费一起要钱：铜钱-{cost}。不是体面消费，而是把举业路晚景冬尾最细、也最躲不开的那层炭脚账重新压回这一旬。',
    failTag: '冬尾笔炭硬顶',
    failLog: '〔冬尾笔炭〕这一旬连炭药和学生家回话脚费都腾挪不开，只得先硬扛过去；身子与旧馆门路又一起薄了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isExamElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_tutor_winter_tail_note_old', 'e_rest'],
    doneTag: '冬尾馆信已理',
    doneLog: '〔冬尾馆信〕这一旬先把旧馆年下回信、来春帖样、递话门包和守岁锅火分开了；举业路晚景最怕“旧馆还有回音，家里续帖样却先来追钱”的那层冬尾细账，没有再继续拖到明春。',
    cost: 35,
    costTag: '冬尾馆信',
    costLog: '〔冬尾馆信〕旧馆年下回信、来春帖样、递话门包和守岁锅火一起要钱：铜钱-{cost}。不是体面消费，却正把举业路晚景冬尾那层“旧馆未断、家里续帖样先来追钱”的细摩擦重新压回这一旬。',
    failTag: '冬尾馆信硬顶',
    failLog: '〔冬尾馆信〕这一旬连旧馆回信脚费和来春帖样都腾挪不开，只得先硬扛过去；旧馆门路与家里读写后手又一起薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isMerchantElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_route_wharf_old', 'e_route_winter_tail_old', 'e_rest'],
    doneTag: '明春水脚已问',
    doneLog: '〔明春水脚〕这一旬先把来春水脚、旧账缓催次序、年下回签和给家里回话的口风留住了；人虽然老了，明春却不必再从两眼一抹黑开始。',
    cost: 40,
    costTag: '明春水脚',
    costLog: '〔明春水脚〕来春水脚、旧账缓催口风、年下回签和回话脚费一起要钱：铜钱-{cost}。不是立刻变现，却正把商路晚景最关键的后手留在今冬。',
    failTag: '明春水脚硬顶',
    failLog: '〔明春水脚〕这一旬连回话脚费、年下回签和来春水脚都腾挪不开，只得先硬顶过去；明春第一程又更像瞎撞了一层（家族-1）。',
    hardship: 'clan'
  });
  if (isApprenticeElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_shop_winter_tail_old', 'e_rest'],
    doneTag: '冬尾铺签已理',
    doneLog: '〔冬尾铺签〕这一旬先把年下回铺回签、灯炭针线、递话脚费和来春回铺脚单分开了；学徒路老来最怕“旧铺还有回音，眼前锅火却先把明春脚路挤断”的那层冬尾细账，没有再拖到年后。',
    cost: 35,
    costTag: '冬尾铺签',
    costLog: '〔冬尾铺签〕年下回铺回签、灯炭针线、递话脚费和来春回铺脚单一起要钱：铜钱-{cost}。不是立刻变现，却正把学徒路晚景冬尾最细、也最躲不开的那层铺签与锅火摩擦重新压回这一旬。',
    failTag: '冬尾铺签硬顶',
    failLog: '〔冬尾铺签〕这一旬连回签脚费和灯炭针线都腾挪不开，只得先硬顶过去；眼前锅火与明春回铺脚路又一起更紧了一线（体魄-1）。',
    hardship: 'body'
  });
  if (isApprenticeElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_shop_route_old', 'e_rest'],
    doneTag: '来春铺路已理',
    doneLog: '〔来春铺路〕这一旬先把来春回铺脚路、递话薄礼和催佃回城口风分开了；学徒路老来最怕“旧掌柜还认你，明春脚路却又得从头求人”的那层冬尾后手，没有再悄悄断掉。',
    cost: 35,
    costTag: '来春铺路',
    costLog: '〔来春铺路〕来春回铺脚路、递话薄礼和催佃回城口风一起要钱：铜钱-{cost}。不是立刻变现，却正把学徒路晚景最关键的冬尾铺路重新留在今冬。',
    failTag: '来春铺路硬顶',
    failLog: '〔来春铺路〕这一旬连回铺脚费和递话薄礼都腾挪不开，只得先硬顶过去；明春第一程与旧铺口风又一起薄了一线（家族-1）。',
    hardship: 'clan'
  });
  if (isWageElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_wage_route_old', 'e_rest'],
    doneTag: '明春工路已问',
    doneLog: '〔明春工路〕这一旬先把明春工棚、头程脚费和给家里回话的口风留住了；人虽然老了，明春却不必再从两眼一抹黑开始。',
    cost: 35,
    costTag: '明春工路',
    costLog: '〔明春工路〕明春工棚、头程脚费和回话脚费一起要钱：铜钱-{cost}。不是立刻变现，却正把卖工路晚景最关键的工路后手留在今冬。',
    failTag: '明春工路硬顶',
    failLog: '〔明春工路〕这一旬连回话脚费和头程脚费都腾挪不开，只得先硬顶过去；明春第一程又更像瞎撞了一层（家族-1）。',
    hardship: 'clan'
  });
}
  function applySeasonalMerchantFriction(log, stepLabel, season, xun, picked) {
    function hasPicked(ids) {
      return (ids || []).some(function (id) { return !!picked[id]; });
    }
    function apply(entry) {
      if (!entry) return;
      if (hasPicked(entry.handledIds)) {
        pushMerchantSeasonTag(stepLabel + entry.doneTag);
        log.push([entry.doneLog, 'good']);
      } else if (spendCopper(entry.cost)) {
        pushMerchantSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        if (entry.hardship === 'trust') S.商信誉 = Math.max(0, S.商信誉 - 1);
        if (entry.hardship === 'body') S.本年商路身乏 += 1;
        if (entry.hardship === 'clan') S.本年商路龃龉 += 1;
        pushMerchantSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'spring' && xun === 1) apply({
      handledIds: ['m_shop', 'm_goods', 'm_market', 'm_letter', 'm_spring_head_packet', 'm_spring_school_split', 'm_spring_head_duty'],
      doneTag: '开路碎费已理',
      doneLog: '〔开路碎费〕这一旬先把头程脚费、样纸、门包和柜上零碎认清了；春开路没有再被“刚起头的小钱”悄悄咬薄。',
      cost: 35,
      costTag: '开路碎费',
      costLog: '〔开路碎费〕头程脚费、样纸、门包和柜上零碎一起要钱：铜钱-{cost}。不是大账，却正是商路一年开头最容易被忽略的真支出。',
      failTag: '开路硬顶',
      failLog: '〔开路碎费〕这一旬连头程脚费和门包都先挪不开，只得硬顶过去；旧路数看你更生了一层（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'spring' && xun === 2) apply({
      handledIds: ['m_book', 'm_market', 'm_letter', 'm_packet', 'm_spring_home_split'],
      doneTag: '开路回话已压',
      doneLog: '〔开路回话〕这一旬先把样价抄单、回话脚费和柜边包纸拆开了；春里第二程不再只剩“继续学生意”，而是真把人情回话和门面零耗压回同一年里。',
      cost: 30,
      costTag: '开路回话',
      costLog: '〔开路回话〕样价抄单、回话脚费和柜边包纸一起要钱：铜钱-{cost}。不是大账，却正把“要不要继续认你这一手”这层门面慢慢磨薄。',
      failTag: '开路回话硬顶',
      failLog: '〔开路回话〕这一旬连回话脚费和柜边包纸都挪不开，只得先硬顶过去；柜上看你这层门面又生了一线（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'spring' && xun === 3) apply({
      handledIds: ['m_letter', 'm_home', 'm_reserve', 'm_market', 'm_spring_tail_split', 'm_spring_tail_supply'],
      doneTag: '春尾脚费已留',
      doneLog: '〔春尾脚费〕这一旬先把回乡带话脚费、柜边包纸和递话门包分开了；春开路收尾不再只剩一句“过了春再说”，这一口细账也被压回同一年里。',
      cost: 30,
      costTag: '春尾脚费',
      costLog: '〔春尾脚费〕回乡带话脚费、柜边包纸和递话门包一起要钱：铜钱-{cost}。钱不大，却正把春尾那层“回不回话、认不认熟面”的碎账摊回这一旬。',
      failTag: '春尾脚费硬顶',
      failLog: '〔春尾脚费〕这一旬连回话脚费都腾挪不开，只得先硬顶过去；春尾回话更像拖着不回（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'summer' && xun === 1) apply({
      handledIds: ['m_run', 'm_letter', 'm_mend', 'm_rest', 'm_wharf', 'm_summer_head_packet', 'm_summer_head_home_split', 'm_summer_head_supply_duty'],
      doneTag: '伏夏茶脚已留',
      doneLog: '〔伏夏茶脚〕这一旬先把行栈茶钱、脚夫点心与家里带话脚费分开了；伏夏刚开头那层“先落脚、先递话、先顾一口凉药”的碎账，没有再悄悄拖到夏中夏尾一起爆。',
      cost: 35,
      costTag: '伏夏茶脚',
      costLog: '〔伏夏茶脚〕行栈茶钱、脚夫点心与带话脚费一起冒头：铜钱-{cost}。不是大账，却最容易把“伏夏第一程”磨得心火上来。',
      failTag: '伏夏茶脚硬扛',
      failLog: '〔伏夏茶脚〕这一旬连茶脚与带话脚费都腾挪不开，只得先硬顶过去；伏夏刚开头就更像“热里硬熬”（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['m_shop', 'm_book', 'm_mend', 'm_rest', 'm_letter', 'm_summer_bundle', 'm_summer_conflict'],
      doneTag: '伏夏零耗已顾',
      doneLog: '〔伏夏零耗〕这一旬先把茶汤、草鞋、汗药和号里脚钱顾住了；热里这层细碎磨损没有再顺着柜上、货路和身子一起滚大。',
      cost: 40,
      costTag: '伏夏零耗',
      costLog: '〔伏夏零耗〕伏夏茶汤、草鞋、汗药和一口临时脚钱一起冒头：铜钱-{cost}。不是大祸，只是商路这一年又多出一层真摩擦。',
      failTag: '伏夏硬扛',
      failLog: '〔伏夏零耗〕现钱已被别处先占，只得靠身子硬扛这一旬的热耗与脚路（体魄-1）。',
      hardship: 'body'
    });
    if (season.id === 'summer' && xun === 3) apply({
      handledIds: ['m_shop', 'm_market', 'm_letter', 'm_mend', 'm_counter', 'm_summer_tail_duty'],
      doneTag: '伏夏柜耗已分',
      doneLog: '〔伏夏柜耗〕这一旬先把柜边包纸、请脚夫的小茶钱、回客话的门包和凉茶杂支分开了；伏夏尾声这层“不大、却天天有”的柜上摩擦没有再混成一团。',
      cost: 35,
      costTag: '伏夏柜耗',
      costLog: '〔伏夏柜耗〕柜边包纸、脚夫茶钱、回客话门包和凉茶杂支一起冒头：铜钱-{cost}。不是另开一条新主线，只是把伏夏尾声那层细耗重新摊回这一旬。',
      failTag: '伏夏柜耗硬顶',
      failLog: '〔伏夏柜耗〕这一旬连脚夫茶钱和回客话门包都先腾挪不开，只得硬顶过去；人还站在柜上，门面却先薄了一层（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'autumn' && xun === 1) apply({
      handledIds: ['m_market', 'm_run', 'm_goods', 'm_collect', 'm_autumn_receipt', 'm_autumn_supply_split'],
      doneTag: '秋市碎费已拆',
      doneLog: '〔秋市碎费〕这一旬先把样货、牙行照面和秋路脚费拆开了；看着只是小钱，却没再把本年试手前的商路判断搅浑。',
      cost: 50,
      costTag: '秋市碎费',
      costLog: '〔秋市碎费〕样货茶钱、牙行照面和秋路脚费一起要钱：铜钱-{cost}。不是新主线，只是把秋里试手前的摩擦重新摊回同一年。',
      failTag: '秋市硬顶',
      failLog: '〔秋市碎费〕这一旬连牙行照面和样货脚费都先挪不开，只得硬顶过去；旧相识看你更生了一层（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'autumn' && xun === 2) apply({
      handledIds: ['m_try', 'm_market', 'm_book', 'm_autumn_mid_bundle', 'm_autumn_mid_school', 'm_autumn_mid_drag'],
      doneTag: '试贩门包已分',
      doneLog: '〔试贩门包〕这一旬争取带本试贩前，先把门包、脚费与样纸茶钱分开了；不是多掷一次运气，而是把押出去的那一两银前后的碎账先摊开。',
      cost: 45,
      costTag: '试贩门包',
      costLog: '〔试贩门包〕门包、脚费与样纸茶钱一起要钱：铜钱-{cost}。看着只是碎费，却最能把“带本银”这一口钱挤得更紧。',
      failTag: '试贩门包硬顶',
      failLog: '〔试贩门包〕这一旬连门包和脚费都挪不开，只得先硬顶过去；牙口与熟面都显得更生一层（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'autumn' && xun === 3) apply({
      handledIds: ['m_support', 'm_home', 'm_collect', 'm_letter', 'm_autumn_tail_split', 'm_autumn_tail_body'],
      doneTag: '回钱碎耗已拆',
      doneLog: '〔回钱碎耗〕这一旬先把回乡带话、样货耗损、药包和催回钱前的脚费拆开了；秋里最后这层“银快回却还没落手”的摩擦没再混成一团。',
      cost: 45,
      costTag: '回钱碎耗',
      costLog: '〔回钱碎耗〕回乡带话、样货耗损、药包和催回钱前的脚费一起要钱：铜钱-{cost}。不是新主线，只是把秋试手收束前那层“银未回、身子和家里却都在追钱”的真摩擦重新摊回同一年。',
      failTag: '回钱硬扛',
      failLog: '〔回钱碎耗〕这一旬连带话脚费和药包都挪不开，只得先硬扛过去；家里等钱更急，身子也更像硬顶着往前拖（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['m_collect', 'm_book', 'm_letter', 'm_reserve', 'm_mend', 'm_winter_head_packet', 'm_winter_head_school', 'm_corvee_split', 'm_winter_head_body'],
      doneTag: '年关路费已分',
      doneLog: '〔年关路费〕这一旬先把灯油、客脚、年礼和来春第一程水脚分开记了；钱没变多，却没再因为“只差一点”把清账路数搅混。',
      cost: 60,
      costTag: '年关路费',
      costLog: '〔年关路费〕灯油、客脚、年礼和来春第一程水脚一起压来：铜钱-{cost}。不是大账，却正是冬清账最磨人的那层零碎摩擦。',
      failTag: '年关硬顶',
      failLog: '〔年关路费〕这一旬连年礼和来春第一程小路费都腾挪不开，只得先硬顶过去；家里等钱的口风更急了一层（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 2) apply({
      handledIds: ['m_collect', 'm_book', 'm_letter', 'm_reserve', 'm_clear_packet', 'm_debt_split', 'm_winter_family_split', 'm_winter_mid_body', 'm_winter_mid_supply_duty'],
      doneTag: '清账回话已压',
      doneLog: '〔清账回话〕这一旬先把回话脚费、清账门包、药包、来春样纸定钱和给熟号递话的小礼分开了；冬里第二程不再只剩“催账”，而是真把清账的人情碎费与身子后手一起摊回这一旬。',
      cost: 45,
      costTag: '清账回话',
      costLog: '〔清账回话〕回话脚费、清账门包、药包、来春样纸定钱和递话小礼一起要钱：铜钱-{cost}。不是大账，却正把“旧账能不能顺顺当当地回、自己这副身子还能不能撑着清到年下”这层路数一点点磨出来。',
      failTag: '清账回话硬顶',
      failLog: '〔清账回话〕这一旬连回话脚费和药包都腾挪不开，只得先硬顶过去；熟号回话更迟一线，人也更像带着寒里旧乏撑账（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 3) apply({
      handledIds: ['m_reserve', 'm_collect', 'm_mend', 'm_letter', 'm_book', 'm_winter_tail', 'm_winter_tail_school', 'm_winter_drag_split', 'm_winter_body_split'],
      doneTag: '年下客礼已分',
      doneLog: '〔年下客礼〕这一旬先把守岁炭钱、客脚薄礼与来春样纸定钱分开了；冬清账的最后一程不再被年下这层碎账悄悄搅乱。',
      cost: 50,
      costTag: '年下客礼',
      costLog: '〔年下客礼〕守岁炭钱、客脚薄礼与来春样纸定钱一起压来：铜钱-{cost}。不是大账，却最容易把年关那点现钱拧紧。',
      failTag: '年下客礼硬顶',
      failLog: '〔年下客礼〕这一旬连炭钱与薄礼都腾挪不开，只得先硬顶过去；年下口风更冷一层（家族-1）。',
      hardship: 'clan'
    });
  }
  function applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, pack) {
    if (!pack) return;
    function hasPicked(ids) {
      return (ids || []).some(function (id) { return !!picked[id]; });
    }
    function apply(entry) {
      if (!entry) return;
      if (hasPicked(entry.handledIds)) {
        pushHouseholdSeasonTag(stepLabel + entry.doneTag);
        log.push([entry.doneLog, 'good']);
      } else if (spendCopper(entry.cost)) {
        pushHouseholdSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        pushHouseholdSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'spring' && xun === 1) apply(pack.spring);
    if (season.id === 'spring' && xun === 2) apply(pack.springMid);
    if (season.id === 'spring' && xun === 3) apply(pack.springLower);
    if (season.id === 'summer' && xun === 2) apply(pack.summer);
    if (season.id === 'summer' && xun === 3) apply(pack.summerLower);
    if (season.id === 'autumn' && xun === 1) apply(pack.autumnUpper);
    if (season.id === 'autumn' && xun === 2) apply(pack.autumn);
    if (season.id === 'autumn' && xun === 3) apply(pack.autumnLower);
    if (season.id === 'winter' && xun === 1) apply(pack.winter);
    if (season.id === 'winter' && xun === 2) apply(pack.winterMid);
    if (season.id === 'winter' && xun === 3) apply(pack.winterLower);
  }
  function resetFamilyYearLedger() {
    S.家季 = 1;
    S.家旬 = 1;
    S.本年家做活 = 0;
    S.本年家粜米 = 0;
    S.本年家问价 = 0;
    S.本年家备役 = 0;
    S.本年家衣药 = 0;
    S.本年家照家 = 0;
    S.本年家借粮 = 0;
    S.本年家还债 = 0;
    S.本年家贴家 = 0;
    S.本年家催账 = 0;
    S.本年家将养 = 0;
    S.本年家修缮 = 0;
    S.本年家通融 = 0;
    S.本年家捎信 = 0;
    S.本年家供读 = 0;
    S.本年家人情借 = 0;
    S.本年家人情收 = 0;
    S.本年家季务 = [];
  }
  function resetElderYearLedger() {
    S.老季 = 1;
    S.老旬 = 1;
    S.本年养老协商 = 0;
    S.本年养老收租 = 0;
    S.本年养老卖田 = 0;
    S.本年养老医药 = 0;
    S.本年养老守田 = 0;
    S.本年养老旧识 = 0;
    S.本年养老铺账 = 0;
    S.本年养老节礼 = 0;
    S.本年养老季务 = [];
  }
  function resetHouseholdYearLedger() {
    S.户季 = 1;
    S.户旬 = 1;
    S.本年户核账 = 0;
    S.本年户催账 = 0;
    S.本年户备役 = 0;
    S.本年户通融 = 0;
    S.本年户委托 = 0;
    S.本年户供读 = 0;
    S.本年户季务 = [];
  }
  function isMerchantRouteState() {
    return !!S && (
      (S.路线 || '').indexOf('徽商') === 0 ||
      (S.累计回钱银 || 0) > 0 ||
      (S.累计反哺银 || 0) > 0 ||
      (S.未回款银 || 0) > 0 ||
      (S.商历练 || 0) > 0
    );
  }

  // ── 农事：本旬天气与事件 ────────────────────────
  var curWeather, curEvents;
  function rollXun() {
    curWeather = pickWeighted(WEATHERS);
    curEvents = [];
    if (!S.已插秧 && xunIndex <= 2) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秧苗待插，春耕正是插秧时。错过则误农时、影响收成。' });
    if (S.已插秧 && xunIndex >= 2 && xunIndex < HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '禾苗生长中，需时时看水、除草。当前生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '。' });
    if (xunIndex === HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秋收将尽，稻谷渐黄，正是抢收之时！收割之后还有冬闲：修屋、接零活、清旧账、备年关后手，最后才到<b>年终结账</b>。' });
    if (xunIndex > HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[冬闲]', txt: '秋收已过，田里暂缓。冬闲看似松一口气，实则是把修缮、零活、旧债、年礼与来春后手一笔笔摊开的时候。' });
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
    var postHarvest = xunIndex > HARVEST_XUN;
    if (postHarvest) {
      A.push({
        id: 'winter_fix',
        name: '冬闲·修屋补漏',
        cost: 1,
        money: 120,
        eff: '铜钱-120·家族+1',
        desc: '把一年里拖着的漏雨、破篱笆先补一补。不是体面花销，是让来春不至再被小事拖住。',
        can: S.铜钱 >= 120,
        why: S.铜钱 >= 120 ? '' : '铜钱不足120文'
      });
      A.push({
        id: 'winter_work',
        name: '冬闲·打零工',
        cost: 1,
        eff: '铜钱+80·体魄-2',
        desc: '冬闲也有人要短工：挑脚、修渠、劈柴。钱不厚，但能把年关后手挤出一点。',
        can: true
      });
      if (S.负债银 > 0) {
        A.push({
          id: 'winter_repay',
          name: '冬闲·还一两旧债',
          cost: 1,
          eff: '白银-1·负债银-1',
          desc: '先把旧债压下一两，让来年不至债滚债。银从哪来是另一回事：要么卖米换银，要么别处挤出来。',
          can: S.白银 >= 1,
          why: S.白银 >= 1 ? '' : '白银不足1两'
        });
      }
      if (craft) {
        A.push({
          id: 'craft_side',
          name: '冬闲·接零活',
          cost: 1,
          eff: craft.effect,
          desc: craft.desc,
          can: true
        });
      }
      A.push({
        id: 'sell',
        name: '冬闲·卖米换现',
        cost: 1,
        eff: '存米-1·铜钱+' + sellPrice + (sellBonus > 0 ? '（旧门路问价）' : ''),
        desc: '年关前总有用现钱的地方。卖1石存米换现钱。今旬米价' + (S._米价 || '?') + '。',
        can: S.存米 >= 1,
        why: S.存米 >= 1 ? '' : '无米可卖'
      });
      A.push({ id: 'care', name: '灶间·照护家里', cost: 1, eff: '家族+4', desc: '冬闲也得顾家，别让小病小累拖成大亏空。', can: true });
      A.push({ id: 'rest', name: '歇息养身', cost: 1, eff: '体魄+6', desc: '冬里把身子养回一口气，来春才扛得动。', can: true });
      return A;
    }
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
      // 让“年内节奏”在状态栏里可见：不只显示庄稼条，也显式显示“走到哪一旬”。
      // 这不会改变守恒或随机序列，只是把节奏更清晰地亮出来，便于人工复核与回放对照。
      h += '<span class="chip">旬务 <b>' + curLabel() + '</b></span>';
      h += '<span class="chip crop"><span class="g-dot ' + g.cls + '"></span>庄稼 <b>' + (g.planted ? g.label + ' ' + g.pct + '%' : '未插秧') + '</b></span>';
    } else if (phase === 'wage') {
      h += '<span class="chip">路线 <b>受雇谋生</b></span>';
      h += '<span class="chip">工年 <b>' + S.工年 + '/' + WAGE_YEARS + '</b></span>';
      h += '<span class="chip">工季 <b>' + wageSeasonInfo(S.工季 || 1).name + '·' + wageXunLabel(S.工段 || 1) + '</b></span>';
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
      h += '<span class="chip">举程 <b>' + examSeasonInfo(S.举季 || 1).name + '·' + examXunLabel(currentExamXun()) + '</b></span>';
      h += '<span class="chip">童试层级 <b>' + examTierLabel(S.童试层级, S.生员身份) + '</b></span>';
      h += '<span class="chip">保结 <b>' + examGuaranteeLabel(S.保结进度) + '</b></span>';
      h += '<span class="chip">供读 <b>' + examSupportStateDetail() + '</b></span>';
      h += '<span class="chip">婚事 <b>' + examDelayStatusLabel() + '</b></span>';
      h += '<span class="chip">身耗 <b>' + examBodyStatusLabel() + '</b></span>';
    } else if (phase === 'family') {
      var familySeason = familySeasonInfo(S.家季 || 1);
      h += '<span class="chip">阶段 <b>养家</b></span>';
      h += '<span class="chip">家年 <b>' + (S.家年 || 1) + '</b></span>';
      h += '<span class="chip">家程 <b>' + familySeason.name + '·' + familyXunLabel(S.家旬 || 1) + '</b></span>';
      h += '<span class="chip">妻室 <b>' + (S.妻室 ? '已娶' : '未娶') + '</b></span>';
      h += '<span class="chip">子嗣 <b>' + S.子数 + '</b>男' + S.女数 + '女</span>';
    } else if (phase === 'household' && usesSeasonalHouseholdRhythm()) {
      var householdSeason = householdSeasonInfo(S.户季 || 1);
      h += '<span class="chip">阶段 <b>当户</b></span>';
      h += '<span class="chip">户程 <b>' + householdSeason.name + '·' + householdXunLabel(S.户旬 || 1) + '</b></span>';
      if (isWageRouteState()) {
        h += '<span class="chip">旧工门路 <b>' + (S.城里门路 || 0) + '</b>层</span>';
      } else if (isApprenticeRouteState()) {
        h += '<span class="chip">学徒去向 <b>' + (S.学徒去向 || '未定') + '</b></span>';
      } else if (isCivilExamRouteState()) {
        h += '<span class="chip">名色 <b>' + (S.生员身份 ? '生员' : (S.优免启用 ? '优免未尽失' : '未入泮')) + '</b></span>';
      } else {
        h += '<span class="chip">商路旧账 <b>' + (S.未回款银 || 0) + '</b>两</span>';
      }
      h += '<span class="chip">委托田租 <b>' + (S.委托租谷 || 0) + '</b>石</span>';
    } else if (phase === 'elder') {
      var elderSeason = elderSeasonInfo(S.老季 || 1);
      h += '<span class="chip">阶段 <b>养老</b></span>';
      h += '<span class="chip">老程 <b>' + elderSeason.name + '·' + elderXunLabel(S.老旬 || 1) + '</b></span>';
      h += '<span class="chip">妻室 <b>' + (S.妻室 ? '在' : '不在') + '</b></span>';
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
    var isHarvest = (xunIndex === HARVEST_XUN);
    var isLastXun = (xunIndex === (TOTAL_XUN - 1));
    var h = '';
    h += '<div class="season-line">◆ ' + curLabel() + ' ｜ 天气：' + curWeather.k + '（' + curWeather.note + '）</div>';
    var g = growthInfo();
    h += '<div class="crop-bar ' + g.cls + '">' +
      '<div class="cb-head"><span class="cb-title">🌾 田亩 ' + S.田亩 + ' 亩 · 庄稼长势</span>' +
      '<span class="cb-val">' + (g.planted ? (g.label + '（' + S.秧苗进度 + '/' + GROW_TARGET + '，' + g.pct + '%）') : '尚未插秧') + '</span></div>' +
      '<div class="cb-track"><i style="width:' + g.pct + '%"></i></div>' +
      '<div class="cb-tip">' + (g.planted ? (S.秧苗进度 >= GROW_TARGET ? '禾苗已<b>长足封顶（12/12）</b>，再看水也不会长了——把人手匀去挣钱或顾家更划算。' : '离"长足丰收（12/12）"还差 ' + (GROW_TARGET - S.秧苗进度) + ' 点生长；勤看水除草、遇喜雨可加快。到 12 即封顶。') : '春耕正是插秧时，越早插下，可生长的旬数越多（生长满 12 即达丰收上限）。') + '</div>' +
      '</div>';
    h += '<div class="narr">' + narrative() + '</div>';

    h += '<div class="events">';
    curEvents.forEach(function (e) { h += '<div class="evt ' + e.t + '"><span class="tag">' + e.tag + '</span>' + e.txt + '</div>'; });
    h += '</div>';

    if (resolved) {
      h += resolved;
      h += '<div class="commit"><button id="btn-next">' + (isLastXun ? (S.农年 < FARM_YEARS ? '年终结账 · 缴租嚼用当差 →' : '末年结账 · 步入成家 →') : '进入下一旬 →') + '</button></div>';
      $('stage').innerHTML = h;
      return;
    }

    h += '<div class="ap-head"><h3>' + (isHarvest ? '收割旬 · 分配行动点' : '这一旬 · 分配行动点') + '</h3>' +
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

  function isOnce(id) { return ['plant', 'hire_plant', 'care', 'craft_side', 'harvest', 'hire_harvest', 'rest', 'exchange', 'winter_fix', 'winter_work', 'winter_repay'].indexOf(id) >= 0; }

  function narrative() {
    if (xunIndex === 0) return generation > 1
      ? ('你是<span class="em">陈阿二</span>（第' + generation + '代），江南某县民籍' + currentInheritanceRole(carryOver) + '。上一代结清后，这一房手里还剩<span class="em">' + S.田亩 + '亩田、' + S.存米 + '石米、' + S.白银 + '两银</span>；你如今接着这一房的旧账继续往下活。若仍走留乡佃田，这一季能缴租后剩几何，全看你如何安排这有限的人手与光阴。')
      : '你是<span class="em">陈阿二</span>，江南某县民籍佃农之子，十六岁成丁。父兄承了祖业薄田，你分得<span class="em">' + S.田亩 + '亩水田</span>与口粮，向本村地主佃田耕作。这一季从插秧到秋收，能落下多少米、缴完租还剩几何，全看你如何安排这有限的人手与光阴。';
    if (xunIndex === HARVEST_XUN) return '九旬光阴倏忽而过，稻子黄了。这一旬要抢收、要缴租——一季的成败，就看仓里最后能剩下多少米。';
    if (xunIndex > HARVEST_XUN) return '秋收已过，田头暂缓。冬闲看似松一口气，实则最像把一年里欠下与预留的那些小账翻出来见光：修屋、零活、还债、年礼与来春后手，全都得在同一笔钱里腾挪。';
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
    var didCare = false, didExchange = false, didRest = false, didWinterFix = false;

    picks.forEach(function (p) {
      switch (p.id) {
        case 'plant': S.已插秧 = true; S.秧苗进度 += 1; S.体魄 -= 4; didPlantThisXun = true; log.push(['插秧完成，禾苗入田（体魄-4，生长+1）', 'good']); break;
        case 'hire_plant': S.铜钱 -= p.money; hiredPlant = true; log.push(['雇短工帮插秧，付 ' + p.money + ' 文（铜钱-80）', 'bad']); break;
        case 'tend':
          if (S.秧苗进度 >= GROW_TARGET) { log.push(['禾苗已长足，本旬看水无额外增长（宜把人手匀去别处）', 'good']); }
          else { var gg = (1 + (curWeather.grow >= 2 ? 1 : 0)); S.秧苗进度 += gg; S.体魄 -= 2; tendCount++; log.push(['看水除草，禾苗生长+' + gg + '（体魄-2）', 'good']); }
          break;
        case 'garden': S.菜圃进度 += 1; S.体魄 -= 1; if (S.菜圃进度 >= 3) { S.存米 += 1; S.菜圃进度 = 0; log.push(['菜圃收了一茬，存米+1石', 'good']); } else { log.push(['浇灌菜圃（' + S.菜圃进度 + '/3，体魄-1）', 'good']); } break;
        case 'care': S.家族 += 4; didCare = true; if (curEvents.some(function (e) { return e.t === 'rel'; })) { S.母出工 = true; log.push(['照护母亲，腰痛稳住，家族+4', 'good']); } else { log.push(['照护家人，家族+4', 'good']); } break;
        case 'exchange': S.家族 += 3; S.体魄 -= 2; didExchange = true; log.push(['与邻里换工，家族+3、体魄-2（日后有人还工）', 'good']); break;
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
        case 'rest': S.体魄 += 6; didRest = true; log.push(['歇息养身，体魄+6', 'good']); break;
        case 'harvest': didHarvest = true; S.体魄 -= 6; S.农事历练 += 1; break;
        case 'hire_harvest': S.铜钱 -= p.money; hiredHarvest = true; log.push(['雇短工助收，付 ' + p.money + ' 文（铜钱-100）', 'bad']); break;
        case 'winter_fix':
          S.铜钱 -= p.money;
          S.家族 += 1;
          didWinterFix = true;
          log.push(['冬闲修缮，付 ' + p.money + ' 文（铜钱-' + p.money + '、家族+1）', 'bad']);
          break;
        case 'winter_work':
          S.铜钱 += 80;
          S.体魄 -= 2;
          log.push(['冬闲打零工，得 80 文（铜钱+80、体魄-2）', 'good']);
          break;
        case 'winter_repay':
          if (S.负债银 > 0 && S.白银 >= 1) {
            S.白银 -= 1;
            S.负债银 = Math.max(0, S.负债银 - 1);
            log.push(['还旧债 1 两（白银-1、负债银-1）', 'good']);
          }
          break;
      }
    });

    // ── 农路旬内碎账（不额外消耗 RNG）────────────────────────────
    // 目标：把“草鞋、灯油、凉药、脚费”这类容易被一句话带过的小耗，压回到同一年里的每一旬。
    // 口径：不引入评分；不改变随机序列；现钱不够则用“硬扛”（体魄/家族受损）而不是让铜钱变负。
    (function applyFarmXunFriction() {
      var seasonId = Math.floor(xunIndex / 3);   // 0..3
      var pass = (xunIndex % 3) + 1;             // 1..3
      var stepLabel = curLabel();
      var cost = 0;
      var tag = '';
      var costLog = '';
      var doneLog = '';
      var failLog = '';

      // 春耕：草鞋/脚费/针线（不算大账，但会在年头先磨一层）
      // 注意：不放在“春耕上旬”（xun=1），避免影响基于首旬做断言的回归用例（如 carry 卖米/接零活对照）。
      if (seasonId === 0 && pass === 2) {
        tag = '春耕碎账';
        cost = 35;
        doneLog = '〔春耕碎账〕这一旬你先把草鞋、针线与赶集脚费这层开春小耗顾住了；不大，却免得一开头就先把锅火磨薄。';
        costLog = '〔春耕碎账〕草鞋、针线与赶集脚费一齐要钱：铜钱-' + cost + '。不是大账，却把这一年开头那层小耗压回了真账。';
        failLog = '〔春耕碎账〕这一旬连草鞋针线钱都腾挪不开，只得先硬顶过去：体魄-1、家族-1。';
        if (didExchange || didCare) { log.push([doneLog, 'good']); return; }
      }

      // 伏夏：凉药/汗疹/草绳（最容易在热里一起冒头）
      if (seasonId === 1 && pass === 2) {
        tag = '伏夏小耗';
        cost = 45;
        doneLog = '〔伏夏小耗〕这一旬你先把凉药、草绳与汗疹小耗顾住了；热里最磨人的那层碎耗没有继续滚大。';
        costLog = '〔伏夏小耗〕凉药、草绳与汗疹小耗一起冒头：铜钱-' + cost + '。不是大祸，只是同一年里又一口真支出。';
        failLog = '〔伏夏小耗〕现钱不够，只得先硬扛过去：体魄-1。';
        if (didCare || didRest) { log.push([doneLog, 'good']); return; }
      }

      // 秋收前后：脚路/茶水/收束杂支
      if (seasonId === 2 && pass === 2) {
        tag = '秋后杂支';
        cost = 55;
        doneLog = '〔秋后杂支〕这一旬你先把收束脚费、茶水与锅火杂支拆开了；秋后那层“看着有粮、其实现钱更紧”的摩擦没再悄悄磨空。';
        costLog = '〔秋后杂支〕脚费、茶水与锅火杂支一起压来：铜钱-' + cost + '。不是新主线，只是同一年里又一层真支出。';
        failLog = '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去：家族-1。';
        if (hiredHarvest || didExchange) { log.push([doneLog, 'good']); return; }
      }

      // 年关：灯油/炭火/小礼（冬闲里最磨人的一层）
      if (seasonId === 3 && pass === 2) {
        tag = '年关碎账';
        cost = 40;
        doneLog = '〔年关碎账〕这一旬你先把灯油炭火、年礼薄耗与来春后手分开了；年关没有把同一口现钱重新搅混。';
        costLog = '〔年关碎账〕灯油、炭火与年关薄耗一齐要钱：铜钱-' + cost + '。不是大账，却正是过冬最磨人的那一层。';
        failLog = '〔年关碎账〕这一旬连灯油炭火钱都挪不开，只得靠身子硬顶过去：体魄-1。';
        if (didWinterFix) { log.push([doneLog, 'good']); return; }
      }

      if (!tag || cost <= 0) return;
      if (S.铜钱 >= cost) {
        S.铜钱 -= cost;
        log.push([costLog, 'bad']);
      } else {
        if (tag === '春耕碎账') { S.体魄 -= 1; S.家族 -= 1; }
        else if (tag === '秋后杂支') { S.家族 -= 1; }
        else { S.体魄 -= 1; }
        log.push([failLog, 'bad']);
      }
    })();

    if (didPlantThisXun && !hiredPlant && curWeather.risk === 'flood') { S.秧苗进度 = Math.max(0, S.秧苗进度 - 1); log.push(['暴雨冲了新插的秧，生长-1（若雇工可避）', 'bad']); }
    if (S.已插秧 && !didHarvest) {
      if (curWeather.risk === 'drought' && tendCount === 0) { S.秧苗进度 = Math.max(0, S.秧苗进度 - 1); log.push(['干旱又无人看水，禾苗打蔫，生长-1', 'bad']); }
      if (curWeather.k === '喜雨') { S.秧苗进度 += 1; log.push(['喜雨润田，禾苗额外生长+1', 'good']); }
    }
    if (didHarvest) {
      var y = computeYield(hiredHarvest);
      S.存米 += y.mi;
      S._已收割 = true;
      // 秋收既过，不再让“长势进度”继续在冬闲里显得像还能增长；
      // 这里把显示进度钉到封顶值，避免“已收却还是 7/12”这种 UI 违和。
      S.秧苗进度 = Math.max(S.秧苗进度, GROW_TARGET);
      log.push(['收割：得米 ' + y.mi + ' 石（' + y.reason + '）', y.mi >= S.租额石 ? 'good' : 'bad']);
    }

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
    xunIndex = TOTAL_XUN - 1; // 让 renderStage 显示"结账续耕/步入成家"按钮（冬闲下旬）
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
    S.秧苗进度 = 0; S.已插秧 = false; S._已收割 = false; S.菜圃进度 = 0; S.母出工 = true;
    recordEntry('第 ' + S.农年 + ' 农年·春耕开账（' + S.年龄 + '岁）', snapshot(),
      '又是一年春耕。' + (S.负债银 > 0 ? '债还挂在账上（负债 ' + S.负债银 + ' 两），这一年得多挣些米还债、缴租。' : '这一年仍要缴租 ' + S.租额石 + ' 石、供全家嚼用，能落下多少全看安排。'));
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
      if ((S.工段 || 1) >= 3) {
        S.工季 = Math.min(WAGE_SEASONS.length, (S.工季 || 1) + 1);
        S.工段 = 1;
      } else {
        S.工段 = (S.工段 || 1) + 1;
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
    else if (S.工季 === 1 && (S.工段 || 1) === 1) recordEntry('第 ' + S.工年 + ' 工年·春忙开账', snapshot(), '上一工年已了，这一年改按“春忙→夏忙→秋收→冬闲”四季、每季再分上中下三旬过账；议雇、奔走、贴家、备差、衣药与旧债不再糊成两笔，而是逐旬摊开。');
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
    if (S.学年 === 1) recordEntry('立身分路·入城学徒', snapshot(), '你不留乡守田，也不先去打长短工，而是进城投商铺学徒：先求师、立据、守店、识货，再把行市、家计和年关去留一起熬出来，看三年后能不能留店或另谋。' + (inherited.length ? ' 父辈留下的门路先替你垫了一步：' + inherited.join('；') + '。' : ''));
    else if ((S.学季 || 1) === 1 && (S.学旬 || 1) === 1) recordEntry('第 ' + S.学年 + ' 学年·投师季上旬开账', snapshot(), '这一学年不再按“一年一把过账”，而是拆成投师季、坐店季、行市季、年关季四季、每季三旬推进。你得把说合、守店、认账、问价、贴家、衣药、备差与去留，逐旬算在同一本账里。');
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
      if (currentExamXun() < 3) {
        syncExamXunState(currentExamXun() + 1);
      } else {
        S.举季 = Math.min(EXAM_SEASONS.length, (S.举季 || 1) + 1);
        syncExamXunState(1);
      }
      S._advanceExamSeason = false;
    } else if (!S.举季 || S.举季 < 1) {
      resetExamYearLedger();
    }
    syncExamXunState(S.举旬 || S.举段 || 1);
    S.年龄 = 16 + (S.举业年 - 1);
    S.身份 = S.生员身份 ? '民籍·生员' : '民籍·读书子';
    S.路线 = '读书应举';
    refreshExamSupportState();
    var baselineNotes = (S.举业年 === 1) ? applyCivilExamSharedBaseline() : [];
    var inherited = (S.举业年 === 1) ? applyRouteInheritance('civilExam') : [];
    picks = []; resolved = null; lifePicks = [];
    curStage = stageCivilExam();
    if (S.举业年 === 1) tracePhase('route:civilExam');
    if (S.举业年 === 1) {
      var firstYearNotes = baselineNotes.concat(inherited);
      recordEntry('立身分路·读书应举', snapshot(), '你把家中有限的银钱、纸墨与人情先压到读书上：供读不等于录取，只意味着这一户先把资源让给你。' + (firstYearNotes.length ? ' 起手先承下这层底子：' + firstYearNotes.join('；') + '。' : ''));
    }
    else if ((S.举季 || 1) === 1 && currentExamXun() === 1) recordEntry('第 ' + S.举业年 + ' 举业年·春课上旬开账', snapshot(), '这一举业年不再按“整年四点一次结账”推进，而是拆成春课、夏课、秋试、冬清账四季、每季三旬。馆课、评文、保结、盘缠、抄写补贴、回家缓家计、差役钱与衣药小账，都要在同一年里逐旬配平。');
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 养老阶段：四季推进（同一年内拆账），避免“老年只点一次就结算”
  function enterElder() {
    phase = 'elder';
    if (S._advanceElderSeason) {
      var x = Math.max(1, Math.min(3, S.老旬 || 1));
      if (x < 3) {
        S.老旬 = x + 1;
      } else {
        S.老季 = Math.min(ELDER_SEASONS.length, (S.老季 || 1) + 1);
        S.老旬 = 1;
      }
      S._advanceElderSeason = false;
    } else if (!S.老季 || S.老季 < 1) {
      resetElderYearLedger();
    }
    S.年龄 = currentLifeProfile().elderAge;
    picks = []; resolved = null; lifePicks = [];
    curStage = stageElder();
    tracePhase('enter:elder');
    if (S.老季 === 1 && (S.老旬 || 1) === 1) {
      recordEntry('步入老年·' + elderSeasonInfo(S.老季).name + '·' + elderXunLabel(S.老旬), snapshot(),
        '人到五十上下，身子与家计都开始显出另一层“细账”：奉养要谈、医药要花、口食田要收、旧识要维。养老不再只是一跳跳过，而是照着一年四季继续过账。');
    }
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
    else if (p === 'marriage') {
      // 初入议亲时清零“议亲三旬”的内部节奏；同一次议亲在三旬内往返时不清零。
      if (prevPhase !== 'marriage') resetMarriageAttemptState();
      S.年龄 = currentLifeProfile().marriageAge;
      curStage = stageMarriage();
    }
    else if (p === 'family') {
      var life = currentLifeProfile();
      // 初入“养家”时，把节奏清零：从成家之后的第一年春起算。
      if (prevPhase !== 'family') { S.家年 = 1; resetFamilyYearLedger(); }
      var base = (S._marriageAtAge != null ? S._marriageAtAge : life.marriageAge) + 1;
      S.年龄 = base + Math.max(0, (S.家年 || 1) - 1);
      curStage = stageFamily();
    }
    else if (p === 'household') {
      S.年龄 = currentLifeProfile().householdAge;
      if (prevPhase !== 'household' && usesSeasonalHouseholdRhythm()) resetHouseholdYearLedger();
      curStage = stageHousehold();
    }
    else if (p === 'elder') {
      if (prevPhase !== 'elder') resetElderYearLedger();
      enterElder();
      return;
    }
    else if (p === 'death') { S.年龄 = S._deathAge || 58; curStage = stageDeath(); }
    renderStatus(); renderLifeStage(); renderLedger();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 阶段卡通用渲染：叙事 + 事件 + 选项（每项显式点数/概率）
  function restartIdentityLabel() {
    // “死亡→传承→下一代重开”是闭环验收点：按钮文案必须与真实承继一致，避免把独子/过继误写成“次子”。
    if (phase === 'childhood') return '';
    var carryIdentity = S._carry && S._carry.承继身份 ? String(S._carry.承继身份) : '';
    if (carryIdentity === '旁支继子') return '旁支继子身份';
    if (carryIdentity === '独子') return '独子身份';
    if (carryIdentity === '次子') return '次子身份';
    if (carryIdentity === '长子') return '长子身份';
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
    if (st.dossier) h += st.dossier();
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

  function establishmentAtlasDossier() {
    var routeRows = [
      '路径一 · 留乡佃田：三农年起手，后续接养家 / 当户 / 养老。',
      '路径二 · 受雇长工 / 短工：四季三旬抢工食，后续接家计与差役。',
      '路径三 · 入城学徒：投师、守店、认货、留店 / 被辞，都继续往后接一生。',
      '路径四 · 徽商式亦贾亦儒：学生意、反哺、供读与未回款都继续落到本代家计。',
      '路径五 · 读书应举：束脩、保结、盘缠、识字转业与家计摩擦都压回同一年。'
    ];
    var h = '';
    h += '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">🗺 交互图谱入口</span>' +
      '<span class="cb-val">总链路已挂出</span></div>' +
      '<div class="cb-tip">古代 → 明代 → 江南民籍次子立身的十二个月 → 一生 → 下一代' +
      '<br>立身 → 成家 → 当户 → 养老 → 死亡与传承 → 下一代重开</div></div>';
    h += '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">🧭 五条立身道路卡</span>' +
      '<span class="cb-val">五路齐开</span></div>' +
      '<div class="cb-tip">' + routeRows.join('<br>') + '</div></div>';
    h += '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">📚 生命周期延伸卡</span>' +
      '<span class="cb-val">单代闭环</span></div>' +
      '<div class="cb-tip">成年后不再只是按年一笔结算；五条路都继续拆到四季三旬，把家计、制度、身体与门路碎账压回同一年。' +
      '<br>保持守恒、不变量与史料诚实：不写成功分、排名或最优路线。</div></div>';
    h += '<div class="crop-bar g-ok"><div class="cb-head">' +
      '<span class="cb-title">🧾 五路多代账本卡</span>' +
      '<span class="cb-val">递归重开</span></div>' +
      '<div class="cb-tip">五路都接诸子均分、供养镜像、委托田租，以及独子/次子/旁支等真实承继；上一代留下的田、债与门路会直接改写下一代入口，而不是回滚成白纸。</div></div>';
    return h;
  }

  // ── 立身分叉（16岁）：五路入口（佃田/受雇/学徒/商路/举业）──
  function stageEstablishment() {
    var 底子 = routeBaseSummary();
    var inheritanceBridge = lifecycleInheritanceBridge();
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
        var summary = currentFamilySnapshotText();
        if (inheritanceBridge.dossier) summary += '｜' + inheritanceBridge.dossier;
        return lifeDossier(summary) + establishmentAtlasDossier();
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
          note: '不守这几亩田，去替经营型地主和市镇东家出力挣工食。长工有管饭和年工银，短工日结快但失工频繁；现已拆成“一年四季、每季上中下三旬”的更细年内节奏。' + (generation > 1 ? ' ' + routeEntryHook('wage', carryOver) : ''),
          run: function (log) {
            curStage.next = 'wage'; curStage.nextLabel = '去谋第一年工食 →'; S.路线 = '受雇长工/短工';
            log.push(['你决定先把工食挣出来：这一路已接入“三工年 × 每季三旬”的细化循环。', 'good']);
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
          note: '这一路现已拆成“三商年学生意 + 成年后养家/当户/养老继续四季三旬推进”：认货、坐店、跑单、回钱、拖欠、反哺、供读、差役与身家冲突都回到同一年里逐旬落账。' + (generation > 1 ? ' ' + routeEntryHook('merchant', carryOver) : ''),
          run: function (log) {
            curStage.next = 'merchant'; curStage.nextLabel = '去学生意 →'; S.路线 = '徽商式亦贾亦儒';
            log.push(['你决定投族叔商号学生意：这一路已接入首版三商年循环。', 'good']);
            if (S.识字) log.push(['你识字，核账抄单会比纯跑腿更值钱。', 'good']);
          }
        },
        {
          name: '路径五 · 读书应举',
          gain: '进入三举业年循环（四季三旬）',
          note: '这一路现已拆成“春课→夏课→秋试→冬清账”四季、每季三旬：把束脩纸墨、保结资格、盘缠、抄写补贴、家计与身体小账都放回一年里，不再整年一把糊过。' + (generation > 1 ? ' ' + routeEntryHook('civilExam', carryOver) : ''),
          run: function (log) {
            curStage.next = 'civilExam'; curStage.nextLabel = '去走第一年举业 →'; S.路线 = '读书应举';
            log.push(['你决定先把这一户有限的资源压到读书上：这一路现已按四季三旬推进，不再是一年点一下就结账。', 'good']);
          }
        }
      ]
    };
  }

  // ── 受雇谋生（16-18岁）：四季三旬循环，冬闲下旬清全年总账 ──
  function stageWage() {
    var age = 16 + (S.工年 - 1);
    var season = wageSeasonInfo(S.工季 || 1);
    var wagePass = Math.max(1, Math.min(3, S.工段 || 1));
    var xunLabel = wageXunLabel(wagePass);
    var isYearEnd = season.id === 'winter' && wagePass === 3;
    var nextSeason = wageSeasonInfo(Math.min(WAGE_SEASONS.length, (S.工季 || 1) + 1));
    var baseShort = season.id === 'spring' ? 180 : season.id === 'summer' ? 220 : season.id === 'autumn' ? 320 : 140;
    var baseShortBody = season.id === 'winter' ? 1 : 2;
    var seasonalShort = wageSplitAmount(baseShort, wagePass);
    var seasonalShortBody = wageSplitBody(baseShortBody, wagePass);
    var homeRice = season.id === 'autumn' ? 1 : 0;
    var homeFamily = season.id === 'summer' ? 3 : 4;
    var outwork = wageOutworkProfile(wagePass);
    var skill = wageSkillProfile();
    var bookkeeping = wageBookkeepingProfile();
    var support = wageHouseholdSupportProfile(season.id);
    var market = wageMarketProfile(season.id);
    var reserve = wageReserveCorveeProfile();
    var mend = wageMendProfile(season.id);
    var longCost = season.id === 'spring' ? (wagePass === 1 ? 2 : 1) : (season.id === 'summer' ? (wagePass === 3 ? 1 : 2) : (season.id === 'autumn' ? (wagePass === 2 ? 2 : 1) : 1));
    var wageCounts = '本年短工=' + S.本年短工次数 + '｜外出=' + S.本年外出次数 + '｜看账=' + S.本年看账次数 + '｜学活=' + S.本年学艺次数 + '｜贴家=' + S.本年贴家次数 + '｜备差=' + S.本年备役次数;
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
    var extraEvent = wagePass === 1
      ? { t: 'rel', tag: '[排工]', txt: '这一旬先定主路：是守长差、抢旺工、外出一趟，还是先把一门手艺或识字活坐实。' }
      : (wagePass === 2
        ? { t: 'rand', tag: '[家计]', txt: '这一旬多是把钱脚和家脚往一处拢：跑脚问价、贴补家用、回乡搭手，往往争的是同一笔散钱。' }
        : { t: 'rand', tag: '[后手]', txt: '这一旬最像“后账露头”的时候：差役钱要不要先留、鞋药要不要先补、这一口钱够不够熬到下季，都要摊开。' });
    var events = seasonalEvents[season.id].slice();
    events.push(extraEvent);
    return {
      title: '受雇谋生 · 第' + S.工年 + '工年·' + season.name + '·' + xunLabel, label: '佣工第' + S.工年 + '年·' + season.name + '·' + xunLabel,
      next: 'wage', nextLabel: isYearEnd
        ? (S.工年 < WAGE_YEARS ? '翻到下一工年春忙上旬 →' : '带着三年工账去议亲 →')
        : (wagePass >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + wageXunLabel(wagePass + 1) + ' →')),
      // 卖工路也按“三手并行”推进：一手抓工食主线，一手摊家计/市面碎账，再留一手给差役或身子后手。
      // 行动点用不完也可提前结算（不强制“点满”），避免强迫玩家每旬都做完美三选。
      ap: 3, commitLabel: isYearEnd ? '了这一工年 →' : '结这一旬工食细账 →',
      note: '这一路现已从“全年一点式结算”继续拆成“每季上中下三旬”：上旬先排工路，中旬把家用与市面摊开，下旬再收差役、衣药与旧债。并把“每旬只够做两件事”上调为“三手并行”——让工食、家计与制度/身子后手能在同一年里更真实地抢同一口现钱。仍保持三币种守恒，不写成功分。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一工年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + (wagePass === 1 ? '这一旬先把主工路定下来。' : (wagePass === 2 ? '这一旬更像把家里、市面与脚下活路往一处拢。' : '这一旬最像收后账：差役、衣药、旧债与年关后手都不肯再往后拖。')) + ' 你这一旬有 <span class="em">3 个行动点</span>。',
      dossier: function () {
        var seasonTags = (S.本年季务 && S.本年季务.length) ? S.本年季务.join('、') : '尚未坐实';
        return lifeDossier('当前工季=' + season.name + '·' + xunLabel + '｜本年雇约=' + S.本年雇约 + '｜本年工食银=' + S.本年工食银 + '两｜本年工食钱=' + S.本年工食钱 + '文｜口粮减免=' + S.本年口粮减免 + '石｜' + wageCounts + '｜已坐实=' + seasonTags + '。');
      },
      events: events,
      prompt: wagePass === 1 ? '这一旬怎么排主工路？（分配 3 点）' : (wagePass === 2 ? '这一旬怎么把家计和市面拢住？（分配 3 点）' : '这一旬怎么把后账收住？（分配 3 点）'),
      actions: function () {
        var A = [];
        var longEff = (season.id === 'spring')
          ? ('年终白银+2·管饭减口粮1石·体魄-' + longCost)
          : (season.id === 'summer')
            ? ('守年长工差·口粮减免1石·体魄-' + longCost)
            : (season.id === 'autumn')
              ? ('守年长工秋收·口粮减免1石·体魄-' + longCost)
              : ('守年长工到年关·年终工银坐实·体魄-' + longCost);
        var longDesc = wagePass === 1
          ? (season.id === 'spring'
            ? '先把这一年最稳的饭碗签下来：银要到年关才真正落袋，但平时管饭能先替家里省一口。'
            : (season.id === 'winter'
              ? '冬前先把守长差这条路定住：要不要一路守到账清，得从这一旬起。'
              : '这一旬先把长差坐实：钱虽没到手，饭口和去处先不能散。'))
          : (wagePass === 2
            ? '这一旬继续守长差：饭口稳一些，可你的人也更真切地被这条差路拴住。'
            : '这一旬把长差守到后账露头：工银还没真落袋，可疲惫、口粮和年关盘算都已压上身。');
        if (wagePass === 1) {
          A.push({
            id: 'w_long',
            name: season.id === 'spring' ? '签一年长工' : (S.本年雇约 === '年长工' ? '先守这一旬长差' : '转去守地主长差'),
            cost: 2,
            eff: longEff,
            desc: longDesc,
            can: true,
            once: true
          });
          A.push({
            id: 'w_short',
            name: season.id === 'winter' ? '冬前先接零工' : (season.id === 'autumn' ? '先抢秋收短工' : '先抢这一旬短工'),
            cost: 1,
            eff: '铜钱+' + seasonalShort + '·体魄-' + seasonalShortBody,
            desc: season.id === 'winter'
              ? '年关前先接一点零碎活路，先让锅底火不断。'
              : (season.id === 'autumn'
                ? '秋收上旬先抢一轮旺工，钱来得快，也更先伤身。'
                : '上旬先把这一口现钱抢到手，后面两旬再看怎么收尾。'),
            can: true
          });
          A.push({ id: 'w_out', name: season.id === 'winter' ? '趁冬前外出一趟' : '外出佣工一程', cost: 2, eff: outwork.effect, desc: outwork.desc, can: true, once: true });
          A.push({ id: 'w_skill', name: season.id === 'winter' ? '冬前修具学活' : '随工学一门活', cost: 1, eff: skill.effect, desc: skill.desc, can: true });
          A.push({ id: 'w_book', name: season.id === 'winter' ? '先替东家盘年账' : '识字帮看账', cost: 1, eff: bookkeeping.effect, desc: bookkeeping.desc, can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
          A.push({ id: 'w_home', name: season.id === 'autumn' ? '回家搭一旬抢收' : '回家帮父看田', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? '·存米+1' : ''), desc: season.id === 'autumn' ? '秋收上旬先回家搭一把，虽少挣一手现钱，但米缸与家里脸面都稳些。' : '先回家帮父兄看田一程，少挣工钱，换家里气顺与后手。', can: true, once: true });
          A.push({ id: 'w_rest', name: '歇一歇养身', cost: 1, eff: '体魄+5', desc: '年轻也不是铁打的，别把身子先熬坏。', can: true });
        } else if (wagePass === 2) {
          A.push({ id: 'w_short', name: season.id === 'winter' ? '再接一口冬闲零工' : (season.id === 'autumn' ? '趁旺市再抢一口工' : '再接一口短工'), cost: 1, eff: '铜钱+' + seasonalShort + '·体魄-' + seasonalShortBody, desc: season.id === 'autumn' ? '秋里这一旬再抢一口旺工，把现钱尽量拢厚。' : '先把这一旬的散钱再拢一点回来。', can: true });
          A.push({ id: 'w_market', name: season.id === 'winter' ? '趁集跑腿问价' : '趁集跑脚问价', cost: 1, eff: market.effect, desc: market.desc, can: true, once: true });
          A.push({ id: 'w_send', name: season.id === 'autumn' ? '把钱粮先贴回家' : '把一点现钱贴回家', cost: 1, eff: support.effect, desc: support.desc, can: S.铜钱 >= support.copperCost, why: S.铜钱 >= support.copperCost ? '' : ('铜钱不足' + support.copperCost + '文'), once: true });
          var teaCost = season.id === 'winter' ? 50 : 40;
          A.push({
            id: 'w_tea',
            name: season.id === 'winter' ? '给工头备茶水' : '请工头吃茶续熟口',
            cost: 1,
            eff: '铜钱-' + teaCost + '·城里门路+1(封顶2)·家族+1',
            desc: '工棚与乡里不是只靠“干得多”。一口茶水钱把熟口续住，日后外出落脚、找工头、跑脚问价都不至两眼一抹黑。',
            can: S.铜钱 >= teaCost,
            why: S.铜钱 >= teaCost ? '' : ('铜钱不足' + teaCost + '文'),
            once: true
          });
          A.push({ id: 'w_home', name: season.id === 'autumn' ? '回乡搭手收尾' : '抽身回家看父', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? '·存米+1' : ''), desc: season.id === 'autumn' ? '秋收中旬抽身回去搭手，虽少一旬现钱，却让米缸和家里气顺些。' : '先回去照看父兄与家里火头，把这一旬的人情账稳住。', can: true, once: true });
          A.push({ id: 'w_skill', name: '再挪一旬学活', cost: 1, eff: skill.effect, desc: skill.desc, can: true });
          A.push({ id: 'w_book', name: season.id === 'winter' ? '替人补一轮账' : '再替人核一轮账', cost: 1, eff: bookkeeping.effect, desc: bookkeeping.desc, can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
          A.push({ id: 'w_rest', name: '歇一歇养身', cost: 1, eff: '体魄+5', desc: '让这一旬别只剩下硬熬。', can: true });
        } else {
          A.push({ id: 'w_short', name: season.id === 'winter' ? '再接一口冬闲零工' : (season.id === 'autumn' ? '收尾前再抢一口工' : '收尾前再接短工'), cost: 1, eff: '铜钱+' + seasonalShort + '·体魄-' + seasonalShortBody, desc: season.id === 'autumn' ? '这一旬再抢一口旺工，把秋收现钱尽量拢厚。' : '前头几旬定下的工路，到这一旬再补一口现钱。', can: true });
          A.push({ id: 'w_send', name: season.id === 'autumn' ? '把钱粮先贴回家' : '把一点现钱贴回家', cost: 1, eff: support.effect, desc: support.desc, can: S.铜钱 >= support.copperCost, why: S.铜钱 >= support.copperCost ? '' : ('铜钱不足' + support.copperCost + '文'), once: true });
          A.push({ id: 'w_duty', name: '先留一角差役钱', cost: 1, eff: reserve.effect, desc: reserve.desc, can: S.铜钱 >= reserve.copperCost, why: S.铜钱 >= reserve.copperCost ? '' : ('铜钱不足' + reserve.copperCost + '文'), once: true });
          A.push({ id: 'w_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: mend.effect, desc: mend.desc, can: S.铜钱 >= mend.copperCost, why: S.铜钱 >= mend.copperCost ? '' : ('铜钱不足' + mend.copperCost + '文'), once: true });
          A.push({ id: 'w_skill', name: season.id === 'winter' ? '冬闲再学一手活' : '再挪一旬学活', cost: 1, eff: skill.effect, desc: skill.desc, can: true });
          A.push({ id: 'w_book', name: season.id === 'winter' ? '年关帮看账收尾' : '再替人核一轮账', cost: 1, eff: bookkeeping.effect, desc: bookkeeping.desc, can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
          A.push({ id: 'w_rest', name: '歇一歇养身', cost: 1, eff: '体魄+5', desc: '让这一程别只剩下硬熬。', can: true });
        }
        return A;
      },
      settle: function (log) {
        var tookLong = false, tookOut = false, shortCount = 0, didEarn = false;
        var hadLongBeforeWinter = S.本年雇约 === '年长工';
        var picked = {};
        lifePicks.forEach(function (p) {
          picked[p.id] = true;
          switch (p.id) {
            case 'w_long':
              tookLong = true; didEarn = true;
              S.雇身份 = '长工'; S.雇工历练 += 1;
              S.本年雇约 = '年长工';
              S.本年口粮减免 += 1;
              S.体魄 -= longCost;
              pushWageSeasonTag(season.name + xunLabel + '长工');
              if (season.id === 'spring') log.push([wagePass === 1 ? '春忙上旬先把长工签下：银要到年关才真正落袋，但这口饭先稳了。' : (wagePass === 2 ? '春忙中旬仍守长工差：工银未到手，饭口却已把你拴在这条路上。' : '春忙下旬还在长差上：年关那 2 两工银还远着，可这一身汗已先替它垫上。'), 'good']);
              else if (season.id === 'winter') log.push([wagePass === 1 ? '冬闲上旬先把长差守住：讨薪、守差、修具都要从这一旬开始收口。' : (wagePass === 2 ? '冬闲中旬仍守在长差上：钱还没全到手，年关细账却已挤到眼前。' : '把年长工一路守到冬闲下旬：工银不再只是“说定的价”，这一年的饭口与力气终于换成了能结清的账。'), 'good']);
              else log.push([wagePass === 1 ? '这一季上旬先把长差守住：饭口较稳，身子也先被这份活拴上。' : (wagePass === 2 ? '这一季中旬仍守长差：工路更稳，可人也更难抽身去顾别处。' : '这一季下旬还在长差上：现钱未必立刻变厚，但饭口、口粮与后账都更真切地压在你身上。'), 'good']);
              break;
            case 'w_short':
              shortCount += 1; didEarn = true;
              S.铜钱 += seasonalShort; S.本年工食钱 += seasonalShort; S.体魄 -= seasonalShortBody; S.雇工历练 += 1; S.本年短工次数 += 1;
              pushWageSeasonTag(season.name + xunLabel + '短工');
              log.push([season.name + xunLabel + '短工一轮：铜钱+' + seasonalShort + '、体魄-' + seasonalShortBody + (season.id === 'winter' ? '（冬闲零工不断不了根本，只能先续锅火）' : '（日结快，但这一旬一过就散）'), 'good']);
              break;
            case 'w_out':
              tookOut = true; didEarn = true;
              S.白银 += outwork.silver; S.铜钱 += outwork.copper; S.体魄 -= 8; S.家族 -= outwork.familyCost; S.雇身份 = '外出佣工';
              S.本年工食银 += outwork.silver; S.本年工食钱 += outwork.copper; S.本年外出次数 += 1; S.本年口粮减免 += 1;
              pushWageSeasonTag(season.name + xunLabel + '外出');
              log.push(['外出佣工：' + (outwork.silver > 0 ? ('白银+' + outwork.silver + '、') : '') + '铜钱+' + outwork.copper + '、体魄-8' + (outwork.familyCost > 0 ? ('、家族-' + outwork.familyCost) : '、家族不减') + (S.城里门路 > 0 ? '（城里旧识先替你照应了落脚与工头）' : '（离乡更久，家里使唤不上你）'), 'good']);
              break;
            case 'w_skill':
              S.本年学艺次数 += 1;
              pushWageSeasonTag(season.name + xunLabel + '学活');
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
              pushWageSeasonTag(season.name + xunLabel + '看账');
              log.push(['识字帮看账：铜钱+' + bookkeeping.copper + '、家族+' + bookkeeping.family + (S.家传书香 > 0 ? '（家传书香让你更容易被交给账册与契字）' : '（会认字，工价就是比纯卖力气高一点）'), 'good']);
              break;
            case 'w_home':
              S.家族 += homeFamily; S.本年帮家次数 += 1;
              if (homeRice > 0) S.存米 += 1;
              pushWageSeasonTag(season.name + xunLabel + '帮家');
              log.push([season.id === 'autumn'
                ? ('回家帮父兄抢收：家族+' + homeFamily + '、存米+1（少挣一份旺工，但米缸与家里脸面都稳住了）')
                : ('回家帮父兄看田：家族+' + homeFamily + (homeRice > 0 ? '、存米+1' : '') + '（这一季少挣工钱，但家里稳些）'), 'good']);
              break;
            case 'w_market':
              didEarn = true;
              S.铜钱 += market.copper; S.体魄 -= market.body;
              pushWageSeasonTag(season.name + xunLabel + '市集跑脚');
              log.push(['趁集跑脚问价：铜钱+' + market.copper + '、体魄-' + market.body + ((S.城里门路 || 0) > 0 ? '（旧熟口让你接脚更快）' : ''), 'good']);
              break;
            case 'w_tea':
              var teaCost = season.id === 'winter' ? 50 : 40;
              if (spendCopper(teaCost)) {
                S.城里门路 = Math.min(2, (S.城里门路 || 0) + 1);
                S.家族 += 1;
                pushWageSeasonTag(season.name + xunLabel + '茶水熟口');
                log.push(['请工头吃茶续熟口：铜钱-' + teaCost + '、城里门路+1、家族+1。钱不多，却把“下回外出不吃生”的路数先续住。', 'good']);
              } else {
                log.push(['想续熟口，但这一旬铜钱已先被别处占住，只得作罢。', 'bad']);
              }
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
          log.push(['这一旬没真正挣出工食，家里对你“这一手到底值不值”难免更紧一分（家族-1）。', 'bad']);
        }
        applySeasonalWageFriction(log, season.name + xunLabel, season, wagePass, picked);
        if (season.id === 'winter' && wagePass === 3) {
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
          curStage.nextLabel = wagePass >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + wageXunLabel(wagePass + 1) + ' →');
          S._advanceWageSeason = true;
          if (tookLong && tookOut) {
            log.push(['这一季你一头守长工、一头又外出抢活，账是厚了，人也被撕得更紧。', 'good']);
          } else if (shortCount >= 1 && S.本年帮家次数 >= 1) {
            log.push(['这一季一边抢短工、一边还顾着家里，现钱和脸面都算勉强稳住。', 'good']);
          }
          if (wagePass >= 2 && S.本年备役次数 > 0 && season.id !== 'winter') log.push(['这一旬你还先留下一角差役钱：好处不立刻显，但到冬里能少一分手忙脚乱。', 'good']);
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
    var isYearEnd = season.id === 'winter' && xun === 3;
    var nextSeason = apprenticeSeasonInfo(Math.min(APPRENTICE_SEASONS.length, (S.学季 || 1) + 1));
    var seasonalCounts = '本年说合=' + S.本年学徒说合 + '｜守店=' + S.本年学徒守店 + '｜学账=' + S.本年学徒学账 + '｜奔走=' + S.本年学徒奔走 + '｜问价=' + S.本年学徒问价 + '｜贴家=' + S.本年学徒贴家 + '｜帮家=' + S.本年学徒帮家;
    var marketReward = season.id === 'autumn' ? 90 : (season.id === 'winter' ? 60 : 50);
    var supportCost = season.id === 'autumn' ? 100 : (season.id === 'winter' ? 90 : 80);
    var mendCost = season.id === 'winter' ? 100 : 70;
    // 学徒路继续把“单代一年能玩很久”做厚：在不破坏守恒与回放稳定性的前提下，
    // 让每旬从“只够做两件事”上调到“三手并行”：一手铺里活计/门路，一手家计/脚费碎账，
    // 再留一手给衣药/备役/回乡等后手。仍不引入成功分与最优解。
    function apprenticeFlavorEvent(seasonId, xunIndex, yearIndex) {
      var seasonIdx = seasonId === 'spring' ? 0 : (seasonId === 'summer' ? 1 : (seasonId === 'autumn' ? 2 : 3));
      var base = (yearIndex * 9 + seasonIdx * 5 + xunIndex * 3);
      var pool = [
        { t: 'life', tag: '[城里]', txt: '城里跑久了，最磨人的不是一桩大祸，而是“处处要脚费”：过桥、递话、找人、买纸，都像一口口小钱把你磨薄。' },
        { t: 'inst', tag: '[制度]', txt: '里甲口风总会追到城里：差役、点名、递话、回乡几步路，常常不是大账，却最怕挤在同一旬里一起要现钱。' },
        { t: 'rel', tag: '[师门]', txt: '铺里记得谁肯先把零碎门包与回话坐实。你这一旬若只顾干活不顾口风，后头“留不留你”往往就在这些细处慢慢变冷。' },
        { t: 'body', tag: '[身子]', txt: '站柜、搬货、跑街都要靠脚。鞋底磨破不是戏剧，却会把你这一旬的心气和门路一起磨薄。' }
      ];
      return pool[base % pool.length];
    }
    return {
      title: '入城学徒 · 第' + S.学年 + '学年·' + season.name + xunLabel, label: '学徒第' + S.学年 + '年',
      next: 'apprentice',
      nextLabel: isYearEnd
        ? (S.学年 < APPRENTICE_YEARS ? '翻到下一学年投师季上旬 →' : '带着这门去向去议亲 →')
        : (xun >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + apprenticeXunLabel(xun + 1) + ' →')),
      ap: 3, commitLabel: isYearEnd ? '了这一学年 →' : '了这一旬学徒 →',
      note: '学徒路现改成“每学年四季三旬”推进：投师季先跑说合/作保/立据，坐店季熬守店/抄账，行市季把问价、送货、贴家与归省一并压进同一年，年关季再把口粮、差役、衣药与去留结清。保证金、食宿、去留数额仍是玩法占位，不当作明代精确契约。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一学年走到<span class="em">' + season.name + xunLabel + '</span>。' + season.actionLead + '投师不是自动成功；立据不等于学成，学成也不等于准你留下。你这一旬有 <span class="em">3 个行动点</span>，要在说合、守店、学账、奔走、问价、贴家、帮家、备差、衣药与养身之间取舍。',
      dossier: function () {
        return lifeDossier('立据≠学成≠出师；师傅收不收、留不留、准不准你转伙计，都是分开判的。当前：合同=' + S.学徒合同 + '｜阶段=' + S.学徒阶段 + '｜授艺度=' + S.学徒授艺度 + '｜信任=' + S.学徒信任 + '｜' + seasonalCounts + '。');
      },
      events: [
        { t: 'rel', tag: '[师傅]', txt: S.学徒合同 === '已立据' ? '字据立成后，师傅看的是你这一旬守不守得住、账看不看得明，不会因为你已经进店就自动一路留你。' : '师傅收徒先看年貌、门路、保人和手脚是不是稳当，不因你可怜或勤快自动点头。' },
        { t: 'rand', tag: season.id === 'autumn' ? '[行市]' : (season.id === 'winter' ? '[年关]' : '[店规]'), txt: season.note + (isYearEnd ? ' 这一旬还要把口粮、差役、旧债、衣药与去留一并结账。' : (season.id === 'autumn' ? ' 同一旬里，铺里的行市、家里的口粮和你脚上的鞋药，常常争的是同一笔现钱。' : ' 同一旬里，店里和家里往往同时来要你这双手。')) },
        apprenticeFlavorEvent(season.id, xun, S.学年)
      ],
      prompt: '这一旬怎么过？（分配 3 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'a_seek', name: season.id === 'spring' ? '托中人说合' : '再托人续问门路', cost: 1, eff: '合同推进·信任+1', desc: season.id === 'spring' ? '先去把门路问出来，让人家肯见你。' : '门路若还没坐实，就不能真把人和钱押进去。', can: S.学徒合同 !== '已立据', once: true });
        A.push({ id: 'a_bond', name: '请族邻作保', cost: 1, eff: '铜钱-80·作保到位', desc: '请人替你担保身家清白。没保也许能成，有保总更容易。', can: !S.学徒保人 && S.铜钱 >= 80, why: !S.学徒保人 ? (S.铜钱 >= 80 ? '' : '铜钱不足80文') : '已有保人', once: true });
        A.push({ id: 'a_sign', name: season.id === 'spring' ? '立投师字据' : '把投师字据补立', cost: 2, eff: '白银-1或铜钱-200·合同成立', desc: '没立据，求师都还只是意向。真要入店，就得把这笔成本掏出来。', can: S.学徒合同 !== '已立据' && (S.学徒合同 === '说合中' || S.学徒保人) && (S.白银 >= 1 || S.铜钱 >= 200), why: S.学徒合同 === '已立据' ? '已立据' : ((S.学徒合同 === '说合中' || S.学徒保人) ? ((S.白银 >= 1 || S.铜钱 >= 200) ? '' : '银钱不够立据') : '尚未说合或作保'), once: true });
        A.push({ id: 'a_drudge', name: season.id === 'winter' ? '应节守柜搬货' : (season.id === 'autumn' ? '随柜搬货看市' : '铺中杂役守店'), cost: 1, eff: '学徒历练+1·信任+1·体魄-2', desc: season.id === 'winter' ? '年关前后店里最忙，站柜搬货最能看出你扛不扛得住。' : (season.id === 'autumn' ? '秋里市面旺，先把柜前柜后守稳，师傅才肯让你跟着往外看价。' : '看店、跑腿、搬货、招呼客人。这是人家看你靠不靠谱的第一关。'), can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_learn', name: season.id === 'summer' ? '随师认货学账' : (season.id === 'autumn' ? '对市口认货色' : '盯账认货'), cost: 1, eff: '授艺度+1·学徒历练+1', desc: season.id === 'autumn' ? '秋里货色杂、问价快，趁这一旬把认货和认账再往深里压一层。' : '跟着看账认货，先学会不吃亏，再谈以后能不能留下。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_run', name: season.id === 'winter' ? '跟单跑街送货' : (season.id === 'autumn' ? '替铺里赶集送货' : '替铺里跑街办货'), cost: 1, eff: '学徒历练+1·奔走+1·体魄-2', desc: season.id === 'winter' ? '年关账催得紧，腿脚跑得勤，才能看出门路认不认你。' : '替铺里跑街送货、问价、催小账，学的不是柜面，而是门路怎么跑。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据' });
        A.push({ id: 'a_book', name: '替师抄账认字', cost: 1, eff: '授艺度+1·信任+1' + (S.识字 ? '·铜钱+40' : ''), desc: S.识字 ? '你认字，抄账核货更容易被交到手里。' : '不识字也能跟着认柜面常用字，只是难学得快。', can: S.学徒合同 === '已立据', why: S.学徒合同 === '已立据' ? '' : '尚未立据', once: true });
        A.push({ id: 'a_market', name: season.id === 'autumn' ? '跟市问价跑脚' : '替铺里打听行市', cost: 1, eff: '铜钱+' + marketReward + '·行市见识+1', desc: season.id === 'autumn' ? '跟着去市上问价、认客、跑脚，挣一点脚钱，也把行情记进肚里。' : '替铺里打听哪家的货紧、哪家的账慢，现钱不多，却能把门路摸熟。', can: S.学徒合同 === '已立据' && season.id !== 'spring', why: S.学徒合同 === '已立据' ? (season.id !== 'spring' ? '' : '春里先把门路坐实') : '尚未立据', once: true });
        A.push({ id: 'a_send', name: season.id === 'autumn' ? '把脚钱贴回家' : '把一点现钱贴回家', cost: 1, eff: '铜钱-' + supportCost + '·家族+4' + (season.id === 'autumn' ? '·存米+1' : ''), desc: season.id === 'autumn' ? '秋里家中最缺口粮和现钱，先贴回去，自己这一旬就更紧。' : '手边有一点现钱，先贴回家压住年关前的窘迫。', can: S.铜钱 >= supportCost, why: S.铜钱 >= supportCost ? '' : ('铜钱不足' + supportCost + '文'), once: true });
        A.push({ id: 'a_home', name: season.id === 'winter' ? '回乡归省帮父' : (season.id === 'autumn' ? '回乡缓一口家计' : '回乡帮父应急'), cost: 1, eff: '家族+3·存米+1', desc: season.id === 'autumn' ? '秋里回去搭一口，铺里少上一旬工，家里却能少慌一阵。' : '店里少上一旬工，家里却稳一些。', can: true, once: true });
        A.push({ id: 'a_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-60·年关差役更稳', desc: '先把一点现钱从手边扣出来，免得年关本户轮到差役时再临时拆账。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        A.push({ id: 'a_mend', name: season.id === 'winter' ? '添棉衣买药' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + (season.id === 'winter' ? 6 : 4), desc: season.id === 'winter' ? '入冬后不添棉衣不买药，年关前后最容易把身子熬坏。' : '鞋底药钱看着零碎，不先补，后头跑街守柜都要多吃亏。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
        if (season.id === 'spring' && xun === 2) {
          A.push({
            id: 'a_spring_split',
            name: '先把布鞋灯油与灶下零用分开',
            cost: 1,
            eff: '铜钱-35·衣药+1·信任+1',
            desc: '春里刚立住脚，最容易被布鞋、灯油、草绳与灶下零用咬掉一口现钱。先把开春这层小耗拆开，学徒路不至还没进伏夏就先松掉。',
            can: S.学徒合同 === '已立据' && S.铜钱 >= 35,
            why: S.学徒合同 === '已立据' ? (S.铜钱 >= 35 ? '' : '铜钱不足35文') : '尚未立据',
            once: true
          });
        }
        if (season.id === 'autumn' && xun === 2) {
          A.push({
            id: 'a_autumn_split',
            name: '把秋脚钱拆作锅火与差钱',
            cost: 1,
            eff: '铜钱-60·贴家+1·备役+1·家族+1',
            desc: '秋里脚钱一回手，锅火、灯油和差钱后手就会一起扑上来。先把这一口拆开，不让学徒路最容易被误写成“秋里终于宽了”的钱转头又漏光。',
            can: S.学徒合同 === '已立据' && S.铜钱 >= 60,
            why: S.学徒合同 === '已立据' ? (S.铜钱 >= 60 ? '' : '铜钱不足60文') : '尚未立据',
            once: true
          });
        }
        // 让“伏夏/年关”的小耗多一条主动处理口：不加随机、不加评分，只把同一年里会冒头的零碎账摊回这一旬。
        if ((season.id === 'summer' && xun === 2) || (season.id === 'winter' && xun === 1)) {
          var supplyCost = season.id === 'summer' ? 40 : 35;
          var supplyEff = '铜钱-' + supplyCost + '·衣药+1·信任+1';
          A.push({
            id: 'a_supply',
            name: season.id === 'summer' ? '先备茶汤汗药针线' : '先备灯油针线与薄礼',
            cost: 1,
            eff: supplyEff,
            desc: season.id === 'summer'
              ? '伏夏里最容易被一句“不过几文”带过的，就是茶汤、汗药、针线和零碎脚费。先把这一口小钱备出来，后头不至热里一乱就全靠硬扛。'
              : '年关里灯油、针线和掌柜薄礼都不是大账，却会把“铺里还认不认你”这层门路一点点磨薄。先备一口小钱，把这层碎账先分明。',
            can: S.铜钱 >= supplyCost,
            why: S.铜钱 >= supplyCost ? '' : ('铜钱不足' + supplyCost + '文'),
            once: true
          });
        }
        if (season.id === 'winter' && xun === 3) {
          A.push({
            id: 'a_winter_post',
            name: '先留来春回铺脚费与递话薄礼',
            cost: 1,
            eff: '铜钱-45·备役+1·信任+1·家族+1',
            desc: '冬尾最怕把来春回铺脚费、递话薄礼与差钱后手都拖到过年后。先把来春铺路分开，学徒路到冬尾也不只剩一句“过了年再说”。',
            can: S.学徒合同 === '已立据' && S.铜钱 >= 45,
            why: S.学徒合同 === '已立据' ? (S.铜钱 >= 45 ? '' : '铜钱不足45文') : '尚未立据',
            once: true
          });
        }
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
        var picked = {};
        var stepTag = season.name + xunLabel;
        lifePicks.forEach(function (p) {
          picked[p.id] = true;
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
            case 'a_market':
              S.铜钱 += marketReward; S.学徒历练 += 1; S.本年学徒问价 += 1; didEarn = true;
              if (season.id === 'autumn') S.本年学徒奔走 += 1;
              if (S.学年 === APPRENTICE_YEARS) S.商历练 += 1;
              pushApprenticeSeasonTag(stepTag + '问价跑脚');
              log.push([season.id === 'autumn'
                ? ('跟市问价跑脚：铜钱+' + marketReward + '、学徒历练+1、行市更熟一层' + (S.学年 === APPRENTICE_YEARS ? '，第三年这层问价还顺手替商路垫了底。' : '。'))
                : ('替铺里打听行市：铜钱+' + marketReward + '、学徒历练+1。钱不算厚，却把哪几家肯回钱、哪几家常压价摸得更清。'), 'good']);
              break;
            case 'a_send':
              if (spendCopper(supportCost)) {
                S.家族 += 4; S.本年学徒贴家 += 1;
                if (season.id === 'autumn') S.存米 += 1;
                pushApprenticeSeasonTag(stepTag + '贴家');
                log.push([season.id === 'autumn'
                  ? ('把脚钱先贴回家：铜钱-' + supportCost + '、家族+4、存米+1。铺里这一旬仍照站，自己手边却更紧了。')
                  : ('把一点现钱贴回家：铜钱-' + supportCost + '、家族+4。不是赚得多，只是让家里先缓一口气。'), 'good']);
              } else {
                log.push(['想把现钱贴回家，但这一旬零碎开销先把铜钱占住，只得暂缓。', 'bad']);
              }
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
            case 'a_mend':
              if (spendCopper(mendCost)) {
                S.体魄 += (season.id === 'winter' ? 6 : 4); S.本年学徒衣药 += 1;
                pushApprenticeSeasonTag(stepTag + '衣药');
                log.push([season.id === 'winter'
                  ? ('添棉衣买药：铜钱-' + mendCost + '、体魄+6。年关前先把寒气和旧酸痛压住一头。')
                  : ('补鞋买药养身：铜钱-' + mendCost + '、体魄+4。看着零碎，却是后头还能不能跑得动的底。'), 'good']);
              } else {
                log.push(['想补鞋买药，但这一旬铜钱不够，只能硬挨过去。', 'bad']);
              }
              break;
            case 'a_spring_split':
              if (spendCopper(35)) {
                S.本年学徒衣药 += 1;
                S.学徒信任 += 1;
                pushApprenticeSeasonTag(stepTag + '春铺零用');
                log.push(['先把布鞋灯油与灶下零用分开：铜钱-35、衣药+1、信任+1。开春这层最碎的小耗，总算没再把学徒路的第一口脚钱悄悄磨薄。', 'good']);
              } else {
                log.push(['想先把布鞋灯油与灶下零用分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              }
              break;
            case 'a_autumn_split':
              if (spendCopper(60)) {
                S.本年学徒贴家 += 1;
                S.本年学徒备役 += 1;
                S.家族 += 1;
                pushApprenticeSeasonTag(stepTag + '秋脚拆账');
                log.push(['把秋脚钱拆作锅火与差钱：铜钱-60、贴家+1、备役+1、家族+1。秋里刚回手的这口钱，终于先被拆进家用和差钱两本账里。', 'good']);
              } else {
                log.push(['想把秋脚钱拆作锅火与差钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              }
              break;
            case 'a_supply': {
              var supplyCost = season.id === 'summer' ? 40 : 35;
              if (spendCopper(supplyCost)) {
                S.本年学徒衣药 += 1;
                S.学徒信任 += 1;
                pushApprenticeSeasonTag(stepTag + '先备零耗');
                log.push([season.id === 'summer'
                  ? ('先备茶汤汗药针线：铜钱-' + supplyCost + '、衣药+1、信任+1。伏夏这层细耗不再只靠硬扛。')
                  : ('先备灯油针线与薄礼：铜钱-' + supplyCost + '、衣药+1、信任+1。年关门面小账先分明，铺里这层熟面就不至忽然断。'), 'good']);
              } else {
                log.push(['想先把零耗备出来，但这一旬铜钱不够，只能暂缓。', 'bad']);
              }
              break;
            }
            case 'a_winter_post':
              if (spendCopper(45)) {
                S.本年学徒备役 += 1;
                S.学徒信任 += 1;
                S.家族 += 1;
                pushApprenticeSeasonTag(stepTag + '来春铺路');
                log.push(['先留来春回铺脚费与递话薄礼：铜钱-45、备役+1、信任+1、家族+1。冬尾最细的那层来春铺路，总算先从眼前锅火里分了出去。', 'good']);
              } else {
                log.push(['想先留来春回铺脚费与递话薄礼，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
        applySeasonalApprenticeFriction(log, stepTag, season, xun, picked);

        if (!isYearEnd) {
          curStage.next = 'apprentice';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + apprenticeXunLabel(xun + 1) + ' →');
          S._advanceApprenticeStep = true;
          if (S.学徒合同 !== '已立据' && S.本年学徒说合 <= 0 && !didContract) log.push(['这一旬你还没把门路真正问开，学徒路仍停在门外。', 'bad']);
          if (S.学徒合同 === '已立据' && S.本年学徒守店 > 0 && (S.本年学徒学账 > 0 || S.本年学徒问价 > 0)) log.push(['这一旬既在柜上熬杂役、也往账货或行市里探了一手，学徒路才算不是空耗。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.学徒合同 === '已立据' && !quit) {
          if (S.学年 < APPRENTICE_YEARS) {
            var keepChance = Math.max(0.25, Math.min(0.90, 0.34 + S.学徒信任 * 0.05 + S.学徒授艺度 * 0.07 + Math.min(2, S.本年学徒守店) * 0.06 + Math.min(2, S.本年学徒学账) * 0.05 + Math.min(2, S.本年学徒问价) * 0.03 + Math.min(2, S.本年学徒贴家) * 0.02));
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
            var outChance = canKeepShop ? Math.max(0.15, Math.min(0.92, 0.18 + S.学徒授艺度 * 0.10 + S.学徒信任 * 0.06 + Math.min(2, S.本年学徒守店) * 0.06 + Math.min(2, S.本年学徒学账) * 0.05 + Math.min(2, S.本年学徒贴家) * 0.03 + (askedKeep ? 0.10 : 0))) : 0;
            var shiftChance = Math.max(0.12, Math.min(0.84, 0.16 + S.学徒授艺度 * 0.08 + S.学徒历练 * 0.04 + Math.min(2, S.本年学徒守店) * 0.05 + Math.min(2, S.本年学徒问价) * 0.04 + (askedShift ? 0.12 : 0)));
            var tradeChance = Math.max(0.10, Math.min(0.82, 0.14 + S.学徒授艺度 * 0.06 + S.学徒历练 * 0.05 + Math.min(2, S.本年学徒奔走) * 0.06 + Math.min(2, S.本年学徒问价) * 0.08 + (S.识字 ? 0.06 : 0) + (askedTrade ? 0.12 : 0)));
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
        if ((S.本年学徒守店 + S.本年学徒学账 + S.本年学徒奔走 + S.本年学徒问价) <= 0 && S.学徒合同 === '已立据' && !quit) {
          S.家族 -= 2;
          log.push(['这一学年虽立了字据，却没真把多少旬数落到店里活计上，家里对你这条路更疑一分（家族-2）。', 'bad']);
        } else if (S.本年学徒守店 > 0 && S.本年学徒学账 > 0 && S.本年学徒奔走 > 0 && S.本年学徒问价 > 0) {
          log.push(['这一学年你既守过店、也学过账货、跑过街路、摸过行市，学徒路终于不再像一张“只写了拜师”的空纸。', 'good']);
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
    var homeRemitProfile = merchantHomeRemittanceProfile();
    var supportProfile = merchantSupportProfile();
    var supportCapacity = merchantRemittanceCapacity();
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
    var marketCost = season.id === 'autumn' ? (isLate ? 60 : 50) : (season.id === 'winter' ? 40 : 30);
    var marketGoods = season.id === 'autumn' ? (isLate ? 2 : 1) : 1;
    var marketTrust = (season.id === 'autumn' || season.id === 'winter') ? 1 : 0;
    var letterCost = season.id === 'winter' ? (isLate ? 60 : 50) : 30;
    var letterFamily = season.id === 'winter' ? (isLate ? 3 : 2) : 2;
    // 商路补一条“识字补课”——不强制，但给未开蒙者一个在同一年里慢慢补齐账房能力的入口，
    // 让“能不能核账”不只靠出生时是否已识字，也能靠本代自己在商号里一点点磨出来。
    // 约束：不额外耗 RNG；只在被玩家选择时改变状态。
    var literacyCost = season.id === 'winter'
      ? (isLate ? 100 : 90)
      : (season.id === 'summer' ? (isMid ? 90 : 85) : 80);
    var seasonalCounts = '本年坐店=' + S.本年商路坐店 + '｜跑单=' + S.本年商路跑单 + '｜认货=' + S.本年商路认货 + '｜问价=' + S.本年商路问价 + '｜核账=' + S.本年商路核账 + '｜催账=' + S.本年商路催账 + '｜贴家=' + S.本年商路贴家 + '｜家书=' + S.本年商路家书 + '｜试贩=' + S.本年商路试贩 + '｜回钱银=' + S.本年商路回钱银 + '｜反哺银=' + S.本年商路反哺银 + '｜拖欠=' + S.本年商路拖欠 + '｜供读=' + S.本年商路供读 + '｜身乏=' + S.本年商路身乏 + '｜龃龉=' + S.本年商路龃龉 + '｜役扰=' + S.本年商路役扰;
    var bridge = lifecycleInheritanceBridge();
    return {
      title: '徽商学生意 · 第' + S.商年 + '商年·' + season.name + '·' + xunLabel,
      label: '商路第' + S.商年 + '年·' + season.name + '·' + xunLabel,
      next: 'merchant',
      nextLabel: isYearEnd
        ? (S.商年 < MERCHANT_YEARS ? '翻到下一商年春开路上旬 →' : '攒着商路底子去议亲 →')
        : (isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + merchantXunLabel(xun + 1) + ' →')),
      // 商路先把“单代一年内能玩很久”做厚：在不增加成功分/排名的前提下，
      // 让同一旬里能同时处理“柜上/货路/家计”三头细账（仍受现钱与守恒约束）。
      ap: 3,
      commitLabel: isYearEnd ? '了这一商年 →' : '了这一旬商路 →',
      note: '商路现改成“春开路→夏坐店→秋试手→冬清账”四季、每季三旬。关键不是多给几次发财判定，而是把认货、问价、跑单、家书、催账、贴家、差役准备、补衣药与旧债都拆回一年里的真实节奏。'
        + (generation > 1 ? ' ' + tradePreview.note : '')
        + (bridge.note ? ' ' + bridge.note : ''),
      narrative: '你已<span class="em">' + age + '岁</span>，这一商年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + xunLead
        + (isLate ? '这一旬最像收账：哪笔钱先回、哪笔钱先贴家、差役钱和药钱有没有先留，都开始逼到眼前。' : '这一旬还在铺里、货路和家里之间掂量先后，真正厚的地方是同一年里许多小账一起抢。')
        + (((S.承继定位 || '').indexOf('长兄续商') >= 0)
          ? ' 只是这一手并不是平白承了长兄的旧号，多半还得挨着旧路数、在旁边另起一支，认人认账与回钱节奏都会因此改写。'
          : '')
        + ' 你这一旬有 <span class="em">3 个行动点</span>。',
      dossier: function () {
        var seasonTags = (S.本年商路季务 && S.本年商路季务.length) ? S.本年商路季务.join('、') : '尚未坐实';
        return lifeDossier('本钱≠利润；货卖出但银没回，不算现钱。当前商程=' + season.name + '·' + xunLabel + '｜识货进度=' + S.识货进度 + '｜账房进度=' + S.账房进度 + '｜信誉=' + S.商信誉 + '｜累计回钱=' + (S.累计回钱银 || 0) + '两｜未回款=' + S.未回款银 + '两｜累计反哺=' + S.累计反哺银 + '两｜可调度回家商账=' + supportCapacity + '两（贴家/供读共用）｜' + seasonalCounts + '｜本年季务=' + seasonTags + '。'
          + (bridge.dossier ? ('｜' + bridge.dossier) : ''));
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
            : '这一旬会一起撞上：坐店、跑单、认货、问价、捎家书、回乡与家里供读的拉扯。商路不是一笔收入，而是一整套拖延与回款。')
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
      prompt: '这一旬怎么过？（分配 3 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'm_shop', name: season.id === 'summer' ? '伏夏守柜看店' : '坐店学生意', cost: 1, eff: '铜钱+' + shopCopper + '·账房进度+1·商历练+1·体魄-' + shopBody, desc: season.id === 'summer' ? '伏夏守柜、搬货、看人情，钱不算最厚，却最能把柜上这层底子坐实。' : '守柜、搬货、看着人来人往，把规矩学会。', can: true });
        A.push({ id: 'm_goods', name: season.id === 'autumn' ? (isLate ? '趁尾市复核货价' : '趁旺季认货辨价') : '认货辨价', cost: 1, eff: goodsGain > 0 ? ('识货进度+' + goodsGain) : '稳住货眼·不退步', desc: season.id === 'autumn' ? '秋里的货最活，也最容易看走眼；这一步不是发财，而是少吃一次生。' : '先学会认货，不然谈不上自己试着带本。', can: goodsGain > 0 || season.id === 'autumn' });
        A.push({ id: 'm_market', name: season.id === 'autumn' ? (isLate ? '拿脚费再抄一遍行市' : '拿脚费去抄行市') : (season.id === 'winter' ? '问米价与牙价' : '托熟客问一遍行市'), cost: 1, eff: '铜钱-' + marketCost + '·识货进度+' + marketGoods + (marketTrust > 0 ? '·商信誉+1' : '') + '·问价+1', desc: season.id === 'autumn' ? '先花一点脚费与茶钱，把市价和牙口摸熟；这一步不直接进账，却能让后头那笔试贩少吃一层生价。' : '先托熟客把米价、脚价和牙口问清，不必每一步都拿现钱去硬撞。', can: S.铜钱 >= marketCost, why: S.铜钱 >= marketCost ? '' : ('铜钱不足' + marketCost + '文'), once: true });
        A.push({ id: 'm_wharf', name: season.id === 'summer' ? '行栈落脚·问水脚与脚路' : (season.id === 'autumn' ? '牙行照面·问一口路数' : '托脚夫留一口口风'), cost: 1, eff: '铜钱-40·商信誉+1·家书+1', desc: season.id === 'summer'
          ? '伏夏第一程先把行栈、脚夫与水脚问清：不直接变现，却能让后头捎信、跑单不至处处生面。'
          : (season.id === 'autumn'
            ? '秋里要跑牙行、认熟面：先花一点脚费把人情口风留住，免得回钱一到又找不到门。'
            : '先托脚夫留一口口风：哪笔账在路上、哪家人情可催，先别等到年关才手忙脚乱。'),
        can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
        if (season.id === 'spring' && xun === 1) {
          A.push({ id: 'm_spring_head_packet', name: '先把春头柜签与样纸门包分开', cost: 1, eff: '铜钱-45·认货+1·家书+1·商信誉+1', desc: '春开路第一旬最怕柜签样纸、头程门包、递话脚费和柜边茶水一起冒头。先把这层春头碎账拆开，认货、问路和柜上门面才不至都挤在同一口现钱上。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
          A.push({ id: 'm_spring_school_split', name: '先把春头家书与供读纸样分开', cost: 1, eff: '铜钱-50·家书+1·供读+1·家族+1', desc: '春开路第一旬最怕家书脚费、供读纸样、柜边门包和家里锅火一起冒头。先把这层春头去向拆开，商路刚起手时，家里那条供读链就不至继续只停在一句“等你回钱”。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
          A.push({ id: 'm_spring_head_duty', name: '先把春头差钱口风与柜签门包分开', cost: 1, eff: '铜钱-55·家书+1·备役+1·家族+1·商信誉+1', desc: '春开路第一旬最怕差钱口风、柜签门包、递话脚费和家里锅火一起冒头。先把这层春头差钱拆开，商路刚起手时，柜上门面、家计和年里的差役后手就不至继续挤在同一口现钱上。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        }
        if (season.id === 'spring' && xun === 2) {
          A.push({ id: 'm_packet', name: '先把样价抄单与回话脚费分开', cost: 1, eff: '铜钱-50·家书+1·商信誉+1·问价+1', desc: '春开路中旬最怕样价抄单、回话脚费和柜边包纸一起冒头。先把这口小钱拆开，后面认货、核账和递话才不至都挤在同一口现钱上。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
          A.push({ id: 'm_spring_home_split', name: '先把春中回话与家里锅火分开', cost: 1, eff: '铜钱-55·家书+1·家族+1·商信誉+1', desc: '春开路中旬最怕熟号回话、递话门包、家里锅火和样纸小耗一起追钱。先把这层春中家计回话拆开，不让商路刚认到一半，就先被家里那口锅和门面碎费一起磨薄。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
          A.push({ id: 'm_spring_mid_school', name: '先把春中孩子纸样与差钱口风分开', cost: 1, eff: '铜钱-60·家书+1·供读+1·备役+1·家族+1', desc: '春开路中旬最怕孩子纸样、差钱口风、递话门包和熟号回话一起追钱。先把这层春中纸样与差钱拆开，不让商路刚认出一点门路，就先被家里读写和年里差役后手一并咬住。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        }
        if (season.id === 'spring' && xun === 3) {
          A.push({ id: 'm_spring_tail_split', name: '先把春尾回签与归乡脚费分开', cost: 1, eff: '铜钱-55·家书+1·家族+1·商信誉+1', desc: '春开路收尾这一旬，最怕熟号回签、归乡脚费、柜边包纸和递话门包一齐来要钱。先把这层春尾回签拆开，夏里要继续坐店、跑单与捎家书时，才不至还被春尾后手拖着走。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
          A.push({ id: 'm_spring_tail_supply', name: '先把春尾供读纸包与差钱口风分开', cost: 1, eff: '铜钱-60·家书+1·供读+1·备役+1·家族+1', desc: '春开路收尾这一旬，最怕家书回话、供读纸包、差钱口风和柜边包纸一起追钱。先把这层春尾供差去向拆开，夏里刚坐店时，家里那口供读和差役后手就不至继续混成一句“等你回钱”。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        }
        if (season.id === 'summer' && xun === 1) {
          A.push({ id: 'm_summer_head_packet', name: '先把伏夏行栈茶脚与家书药包分开', cost: 1, eff: '铜钱-50·家书+1·体魄+1·商信誉+1', desc: '伏夏第一旬最怕行栈茶脚、脚夫点心、家书药包和带话脚费一起冒头。先把这层起手碎账拆开，落脚、递话和这一旬身子后手才不至一并被热里磨薄。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
          A.push({ id: 'm_summer_head_home_split', name: '先把伏夏凉汤与家里纸样分开', cost: 1, eff: '铜钱-60·家书+1·供读+1·体魄+1·家族+1', desc: '伏夏第一旬最怕凉汤汗巾、家里纸样、递话脚费和柜边小门面一起冒头。先把这层伏夏身家细账拆开，落脚后的身子、家书和供读去向才不至继续挤在同一口现钱上。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
          A.push({ id: 'm_summer_head_supply_duty', name: '先把伏夏差帖与供读纸样分开', cost: 1, eff: '铜钱-65·家书+1·供读+1·备役+1·体魄+1·家族+1', desc: '伏夏第一旬最怕差帖门包、供读纸样、凉汤汗巾和递话脚费一起追钱。先把这层伏夏供差去向拆开，刚落脚时，家里供读、年里的差役后手和自己这副身子才不至继续挤在同一口现钱上。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
        }
        if (season.id === 'summer' && xun === 2) {
          A.push({ id: 'm_summer_bundle', name: '先把伏夏茶汤与汗药草鞋分开', cost: 1, eff: '铜钱-55·家书+1·体魄+1·商信誉+1', desc: '伏夏中旬最磨人的不是哪一笔大账，而是行栈茶汤、汗药草鞋、带话脚费和柜边小门面同时来要钱。先把这层伏夏碎耗拆开，后头坐店、核账和跑路才不至一起被热里磨薄。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
          A.push({ id: 'm_summer_conflict', name: '先把伏夏凉药与家里催信分开', cost: 1, eff: '铜钱-60·家书+1·体魄+1·家族+1', desc: '伏夏中旬最怕自己汗药、家里催信、孩子纸样和柜边回帖一起冒头。先把这层热里身家冲突拆开，不让“人先虚、家里先急”继续挤同一口现钱。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        }
        A.push({ id: 'm_run', name: season.id === 'autumn' ? (isLate ? '趁旺季外出催单回钱' : '跟号外出探价走货') : (season.id === 'winter' ? (isLate ? '年关短路催最后一笔账' : '趁年关外出收账') : '跟号外出跑单'), cost: 1, eff: (runSilver > 0 ? ('白银+' + runSilver + '·') : '') + '铜钱+' + runCopper + '·商历练+2·体魄-' + runBody + (runFamilyCost > 0 ? ('·家族-' + runFamilyCost) : ''), desc: season.id === 'autumn' ? '秋里跟单问价、认牙口，也把今年能不能往试贩上迈一步坐实。' : (season.id === 'winter' ? '把“账面上有”与“手里真回了钱”分开看清。' : '跟着押货、跑埠、走路子，钱厚一些，离乡也久些。'), can: !(season.id === 'winter' && isLate && S.本年商路催账 > 0), why: (season.id === 'winter' && isLate && S.本年商路催账 > 0) ? '这一旬已催过旧账' : '', once: true });
        A.push({ id: 'm_book', name: season.id === 'winter' ? (isLate ? '年关总盘账' : '年关盘账核账') : (isLate ? '趁旬尾收一遍流水' : '识字帮核账'), cost: 1, eff: '铜钱+' + bookCopper + '·账房进度+1·商信誉+1', desc: '若你识字，可帮着抄单、核账，比纯跑腿更值钱。', can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
        if (!S.识字 && (S.识字进度 || 0) < 2) {
          A.push({
            id: 'm_literacy',
            name: season.id === 'winter' ? '借账房灯下认字' : '跟账房认字记号',
            cost: 1,
            eff: '铜钱-' + literacyCost + '·识字进度+1(满2开蒙)·账房进度+1',
            desc: season.id === 'winter'
              ? '年关灯下，趁账房盘账时跟着认字记号。不是“忽然开窍”，而是一旬一旬把最基础的账面字眼磨出来。'
              : '在号里跟着账房认几行字、记几样号记：钱花得碎，却能把“只会跑路”慢慢补成“也认得账”。',
            can: S.铜钱 >= literacyCost,
            why: S.铜钱 >= literacyCost ? '' : ('铜钱不足' + literacyCost + '文'),
            once: true
          });
        }
        A.push({ id: 'm_collect', name: S.未回款银 > 0 ? '追催旧账回钱' : (season.id === 'winter' ? '先去盯几笔散账' : '带口信催几笔小账'), cost: 1, eff: S.未回款银 > 0 ? ('未回款银-1·白银+1' + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')) : ('铜钱+' + collectCopper + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')), desc: S.未回款银 > 0 ? '把“还挂在账面上”的一两先催回手里，省得年关只剩一堆空账。' : '就算还没有大笔拖账，也先把散碎口信、回话和小账盯紧。', can: season.id === 'winter' || season.id === 'autumn' || S.未回款银 > 0, once: true });
        if (season.id === 'autumn' && xun === 1) {
          A.push({ id: 'm_autumn_receipt', name: '先把秋头回签与牙帖脚费分开', cost: 1, eff: '铜钱-65·催账+1·家书+1·商信誉+1', desc: '秋试手一开头，最怕熟号回签、牙帖脚费、递话门包和锅火后手先来抢钱。先把这层秋头回签拆开，后头跑单、问价和试手才不至都挤在一句“钱还在路上”。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
          A.push({ id: 'm_autumn_supply_split', name: '先把秋头锅火与供读纸包分开', cost: 1, eff: '铜钱-70·家书+1·家族+1·供读+1', desc: '秋试手一开头，最怕秋头锅火、供读纸包、递话脚费和熟号回签一起追钱。先把这层秋头去向拆开，不让“钱像快回了”这一口现钱还没落手，就先被家里锅火和供读后手一并咬住。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
          A.push({ id: 'm_autumn_head_drag', name: '先把秋头拖欠口风与回乡药包分开', cost: 1, eff: '铜钱-75·催账+1·家书+1·拖欠+1·歇养+1·体魄+1·家族+1', desc: '秋试手一开头，最怕拖欠口风、回乡药包、递话脚费和锅火后手一起追钱。先把这层秋头拖账与药包拆开，秋市刚热时，未回银、家里催问和自己这副身子就不至继续抢同一口现钱。', can: S.铜钱 >= 75, why: S.铜钱 >= 75 ? '' : '铜钱不足75文', once: true });
        }
        if (season.id === 'autumn' && xun === 2) {
          A.push({ id: 'm_autumn_mid_bundle', name: '先把秋中门包与牙帖茶钱分开', cost: 1, eff: '铜钱-60·核账+1·问价+1·商信誉+1', desc: '秋试手中旬最怕试手门包、牙帖茶钱、递话脚费和样货小耗一起冒头。先把这层秋中碎账拆开，试贩、核账与问价才不至一口气全压在带本银边上。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
          A.push({ id: 'm_autumn_mid_school', name: '先把秋中回签与供读差票分开', cost: 1, eff: '铜钱-65·家书+1·供读+1·备役+1·家族+1', desc: '秋试手中旬最怕熟号回签、供读纸包、差票门包和租路饭钱一起追钱。先把这层秋中去向拆开，银还没真回手时，供读、差役和家里那口现钱也不至继续混成一团。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
          A.push({ id: 'm_autumn_mid_drag', name: '先把秋中拖欠口风与回乡饭钱分开', cost: 1, eff: '铜钱-70·催账+1·家书+1·拖欠+1·家族+1', desc: '秋试手中旬最怕拖欠口风、回乡饭钱、递话脚费和家里催问一起追钱。先把这层秋中拖账拆开，银还没落手时，家里那头也不至只听见一句“账还在路上”。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
        }
        if (season.id === 'autumn' && xun === 3) {
          A.push({ id: 'm_autumn_tail_split', name: '先把秋尾回话与样货耗损分开', cost: 1, eff: '铜钱-70·催账+1·家书+1·商信誉+1', desc: '秋试手收尾这一旬，最怕熟号回话、样货耗损、回乡脚费和递话门包一起把现钱咬薄。先把这层秋尾回话拆开，冬里清账、贴家和催回旧账时，才不至还被秋尾后手绊住。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
          A.push({ id: 'm_supply_split', name: '先把回钱拆作锅火与供读纸包', cost: 1, eff: '铜钱-65·家书+1·家族+1·供读+1', desc: '秋试手收尾这一旬，最怕银还在路上，家里锅火、供读纸包和差票后手却已先来追钱。先把这层回钱去处分开，冬里就不至只剩一句“等银回”。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
          A.push({ id: 'm_autumn_tail_body', name: '先把秋尾药包与回钱家书分开', cost: 1, eff: '铜钱-70·催账+1·家书+1·歇养+1·体魄+1·家族+1', desc: '秋试手收尾这一旬，最怕药包、回钱家书、回乡脚费和锅火后手一起追钱。先把这层秋尾身家冲突拆开，银未落手时，自己的身子和家里催信也不至继续抢同一口现钱。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
        }
        A.push({ id: 'm_try', name: isLate ? '赶在旬尾定试贩' : '争取带本试贩', cost: 2, eff: '白银-1锁作本钱·冬里按门路/账房/承继定位判回本/小利/亏折/未回款', desc: '拿一两本钱试着跑一单。钱先锁在货里，回没回得来，不只看运气，也看你这一年把门路和账面坐实到哪一步。', can: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) && S.本年商路试贩 < 1 && S.带本银 <= 0 && S.白银 >= 1 && (S.识货进度 >= 1 || S.账房进度 >= 1), why: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) ? (S.本年商路试贩 < 1 ? (S.带本银 <= 0 ? (S.白银 >= 1 ? ((S.识货进度 >= 1 || S.账房进度 >= 1) ? '' : '尚未学会最基本认货/核账') : '白银不足1两') : '已有一笔本钱锁在货里') : '本年已试贩过一回') : '通常要到秋中旬以后才谈得上试贩', once: true });
        A.push({
          id: 'm_support',
          name: season.id === 'autumn' ? '先把回钱贴回家' : '先寄一两回家过锅火',
          cost: 1,
          eff: homeRemitProfile.effect,
          desc: homeRemitProfile.desc + ' 但只可动用已经回到账、或账上已有明确回签/试贩可供调度的商路银。',
          can: S.白银 >= 1 && supportCapacity >= 1,
          why: S.白银 >= 1
            ? (supportCapacity >= 1 ? '' : '眼下还没有可调度回家的商路回账或浮账')
            : '白银不足1两',
          once: true
        });
        A.push({
          id: 'm_support_school',
          name: season.id === 'autumn' ? '另划一两进供读专账' : '寄银回家供读',
          cost: 1,
          eff: supportProfile.effect,
          desc: supportProfile.desc + ' 这笔银先按供读去向记账，不直接算成你手里还能再花的一两。',
          can: S.白银 >= 1 && supportCapacity >= 1,
          why: S.白银 >= 1
            ? (supportCapacity >= 1 ? '' : '眼下还没有可另划供读的商路回账或浮账')
            : '白银不足1两',
          once: true
        });
        A.push({ id: 'm_letter', name: season.id === 'winter' ? '托客脚捎家书回乡' : '托熟客捎家书回乡', cost: 1, eff: '铜钱-' + letterCost + '·家族+' + letterFamily + '·家书+1', desc: season.id === 'winter' ? '不一定立刻把银寄回去，但至少先让家里知道哪笔账还在外头、哪笔钱可等，省得年关两边都空等。' : '先花一点脚钱托人带家书报平安、问家计；不代替贴银，却能把家里的焦躁先压一线。', can: S.铜钱 >= letterCost, why: S.铜钱 >= letterCost ? '' : ('铜钱不足' + letterCost + '文'), once: true });
        if (season.id === 'summer' && xun === 3) {
          A.push({ id: 'm_counter', name: '先把柜边包纸与回客话门包分开', cost: 1, eff: '铜钱-60·家书+1·体魄+1·商信誉+1', desc: '伏夏尾声最磨人的不是哪一笔大钱，而是柜边包纸、脚夫茶钱、回客话门包和凉茶杂支一起压来。先把这层柜耗拆开，柜上和家里都不至被热里一并磨薄。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
          A.push({ id: 'm_summer_tail_duty', name: '先把伏夏差票与回客话门包分开', cost: 1, eff: '铜钱-65·备役+1·家书+1·商信誉+1·家族+1', desc: '伏夏尾声最怕差票回话、回客话门包、递话脚费和柜边碎耗一起上来。先把这层夏尾差票拆开，不让商路、家计和年底差役后手还没到秋里就先挤在同一口现钱上。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
        }
        A.push({ id: 'm_home', name: season.id === 'autumn' ? '回乡省亲搭秋收' : (isLate ? '回乡把家里这旬过住' : '回乡省亲'), cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : ''), desc: season.id === 'autumn' ? '秋里先回乡搭一把，虽少跑一程货，却把家里口粮与脸面先稳住。' : '回乡看看父母，也把一点心力和米粮带回去。', can: true, once: true });
        A.push({ id: 'm_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把年关差役钱留出一角，等真轮到本户时，不至两手一空。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
        if (season.id === 'winter' && xun === 1) {
          A.push({ id: 'm_winter_head_packet', name: '先把冬头客脚与明春水脚分开', cost: 1, eff: '铜钱-65·核账+1·家书+1·商信誉+1', desc: '冬清账上旬最怕灯油、客脚、年礼和明春第一程水脚一起压来。先把这层冬头路费拆开，后头催账、备差和来春起手才不至都挤在一句“年后再说”上。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
          A.push({ id: 'm_winter_head_school', name: '先把冬头回签与供读差票分开', cost: 1, eff: '铜钱-70·催账+1·家书+1·供读+1·备役+1·家族+1', desc: '冬清账上旬最怕熟号回签、供读纸样、差票回话和客脚年礼一起压来。先把这层冬头供差去向拆开，回钱未净时，供读和差役也开始在同一年里见真账。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
          A.push({ id: 'm_corvee_split', name: '先把差票回话与客脚年礼分开', cost: 1, eff: '铜钱-60·备役+1·家书+1·家族+1', desc: '冬清账上旬最怕差票回话、客脚年礼、明春水脚和家里锅火一起压来。先把这层差役后手拆开，贴家与备役才不至抢同一口现钱。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
          A.push({ id: 'm_winter_head_body', name: '先把冬头药包与回签家书分开', cost: 1, eff: '铜钱-65·催账+1·家书+1·歇养+1·体魄+1·商信誉+1', desc: '冬清账上旬最怕药包、熟号回签、递话家书和灯炭后手一起冒头。先把这层冬头身账拆开，回钱未净时，自己的身子和家里催问也不至继续抢同一口现钱。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
        }
        A.push({ id: 'm_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '年关前先补棉袄、药钱和脚力，别让这一年最后一程先把身子拖垮。' : '先把这程跑出来的劳损压住，免得后面账还没清，人先垮了。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
        if (season.id === 'winter' && xun === 2) {
          A.push({ id: 'm_clear_packet', name: '先把清账门包与来春样纸定钱分开', cost: 1, eff: '铜钱-70·核账+1·家书+1·商信誉+1', desc: '冬里第二程最怕清账门包、递话小礼和来春样纸定钱一起压来。先把这层清账碎费拆开，后头回款和明春起手才不至都挂在一句“再等等”。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
          A.push({ id: 'm_debt_split', name: '先把拖欠回话与供读次序分开', cost: 1, eff: '铜钱-65·催账+1·家书+1·供读+1·商信誉+1', desc: '冬里第二程最怕拖欠回话、供读纸包、清账门包和递话小礼一起压来。先把这层拖欠次序拆开，回钱不至一回手就被几头一起吞掉。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
          A.push({ id: 'm_winter_family_split', name: '先把拖欠回话与差票家书分开', cost: 1, eff: '铜钱-70·催账+1·备役+1·家书+1·家族+1', desc: '冬里第二程最怕旧账拖欠、差票回话、家书催问和锅火后手一起压来。先把这层家计与制度冲突拆开，回钱不至一回手就被几头一并咬住。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
          A.push({ id: 'm_winter_mid_supply_duty', name: '先把冬中拖欠与供读差票分开', cost: 1, eff: '铜钱-75·催账+1·家书+1·供读+1·备役+1·体魄+1·家族+1', desc: '冬里第二程最怕旧账拖欠、供读纸包、差票回话、药包和守岁灯炭一起追钱。先把这层冬中供差身账拆开，回钱未净时，供读、差役、家里催问和自己这副身子才不至继续抢同一口现钱。', can: S.铜钱 >= 75, why: S.铜钱 >= 75 ? '' : '铜钱不足75文', once: true });
          A.push({ id: 'm_winter_mid_body', name: '先把冬中药包与拖欠回话分开', cost: 1, eff: '铜钱-75·催账+1·家书+1·歇养+1·体魄+1·商信誉+1', desc: '冬里第二程最怕药包、拖欠回话、递话小礼和守岁灯炭一起追钱。先把这层冬中身账拆开，旧账未净时，身子与回话次序也不至继续抢同一口现钱。', can: S.铜钱 >= 75, why: S.铜钱 >= 75 ? '' : '铜钱不足75文', once: true });
        }
        if (season.id === 'winter' && xun === 3) {
          A.push({ id: 'm_winter_tail', name: '先把年下回签与来春样纸分开', cost: 1, eff: '铜钱-75·核账+1·家书+1·商信誉+1', desc: '冬清账最后一旬最怕年下回签、来春样纸定钱、递话门包和守岁前的小礼一起压来。先把这层冬尾碎账拆开，年关就不至只剩“再等等看”。', can: S.铜钱 >= 75, why: S.铜钱 >= 75 ? '' : '铜钱不足75文', once: true });
          A.push({ id: 'm_winter_tail_school', name: '先把冬尾回签与供读纸包分开', cost: 1, eff: '铜钱-80·催账+1·家书+1·供读+1·家族+1', desc: '冬清账最后一旬最怕年下回签、供读纸包、递话脚费和来春样纸定钱一起压来。先把这层冬尾供读去向拆开，年关收口时，回签、锅火和来春后手就不至继续抢同一口现钱。', can: S.铜钱 >= 80, why: S.铜钱 >= 80 ? '' : '铜钱不足80文', once: true });
          A.push({ id: 'm_winter_drag_split', name: '先把年下拖欠与差票回话分开', cost: 1, eff: '铜钱-80·催账+1·备役+1·家书+1·家族+1', desc: '冬清账最后一旬最怕年下拖欠、差票回话、递话门包和锅火后手一起追钱。先把这层冬尾拖欠拆开，不让旧账未回、差役已到和家里催信继续一股脑挤在同一口现钱上。', can: S.铜钱 >= 80, why: S.铜钱 >= 80 ? '' : '铜钱不足80文', once: true });
          A.push({ id: 'm_winter_body_split', name: '先把年下药包与拖欠回签分开', cost: 1, eff: '铜钱-85·催账+1·家书+1·体魄+1·商信誉+1', desc: '冬清账最后一旬最怕年下药包、拖欠回签、递话脚费和锅火后手一起磨人。先把这层冬尾身账拆开，旧账、家里催信和自己这副身子才不至继续挤在同一口现钱上。', can: S.铜钱 >= 85, why: S.铜钱 >= 85 ? '' : '铜钱不足85文', once: true });
        }
        A.push({ id: 'm_rest', name: '歇养身子', cost: 1, eff: '体魄+5', desc: '别把身子先走坏。', can: true });
        return A;
      },
      settle: function (log) {
        var picked = {};
        lifePicks.forEach(function (p) {
          picked[p.id] = true;
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
            case 'm_market':
              if (spendCopper(marketCost)) {
                S.识货进度 += marketGoods;
                if (marketTrust > 0) S.商信誉 += marketTrust;
                S.本年商路问价 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '问行市');
                log.push([season.id === 'autumn'
                  ? ('拿脚费去抄行市：铜钱-' + marketCost + '、识货进度+' + marketGoods + (marketTrust > 0 ? ('、商信誉+' + marketTrust) : '') + '。这一步先不挣钱，只把后头试贩与回钱要踩的价摸熟。')
                  : ('托熟客问行市：铜钱-' + marketCost + '、识货进度+' + marketGoods + (marketTrust > 0 ? ('、商信誉+' + marketTrust) : '') + '。先把米价、脚价和牙口问明，再决定下一步往哪边使力。'), 'good']);
              } else {
                log.push(['想拿脚费去抄行市，但这旬铜钱已先被别处占住，只得继续摸黑探路。', 'bad']);
              }
              break;
            case 'm_wharf':
              if (spendCopper(40)) {
                S.商信誉 += 1;
                S.本年商路家书 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '行栈脚路');
                log.push([season.id === 'summer'
                  ? '行栈落脚问水脚：铜钱-40、商信誉+1、家书+1。伏夏第一程先把脚路和口风坐实，后头捎信跑单不至处处生面。'
                  : (season.id === 'autumn'
                    ? '牙行照面问路数：铜钱-40、商信誉+1、家书+1。秋里先把牙口与熟面留住，回钱与催账才不至空转。'
                    : '托脚夫留一口口风：铜钱-40、商信誉+1、家书+1。先把回话与脚路拢住，免得年关才手忙脚乱。'), 'good']);
              } else {
                log.push(['想先把行栈脚路与口风坐实，但这旬铜钱已先紧，只得继续摸黑挤路。', 'bad']);
              }
              break;
            case 'm_packet':
              if (spendCopper(50)) {
                S.本年商路问价 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆样价回话');
                log.push(['先把样价抄单与回话脚费分开：铜钱-50、问价+1、家书+1、商信誉+1。春里第二程最碎的门面与回话，没有再混着压在同一口现钱上。', 'good']);
              } else {
                log.push(['想先把样价抄单与回话脚费拆开，但这旬铜钱已先被别处占住，只得继续挤在一口现钱里硬扛。', 'bad']);
              }
              break;
            case 'm_spring_home_split':
              if (spendCopper(55)) {
                S.本年商路家书 += 1;
                S.家族 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆春中锅火');
                log.push(['先把春中回话与家里锅火分开：铜钱-55、家书+1、家族+1、商信誉+1。熟号回话、递话门包、家里锅火和样纸小耗先被拆回这一旬，商路刚开年就不再把家计与门面一起拖成空等。', 'good']);
              } else {
                log.push(['想先把春中回话与家里锅火分开，但这旬铜钱已先被别处占住，只得让熟号回话、锅火和样纸小耗继续挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'm_spring_mid_school':
              if (spendCopper(60)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路备役 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆春中纸差');
                log.push(['先把春中孩子纸样与差钱口风分开：铜钱-60、家书+1、供读+1、备役+1、家族+1。孩子纸样、差钱口风、递话门包和熟号回话先被拆回这一旬，商路刚认出一点门路时，家里读写和差役后手也终于一起见了真账。', 'good']);
              } else {
                log.push(['想先把春中孩子纸样与差钱口风分开，但这旬铜钱已先被别处占住，只得让纸样、差钱和熟号回话继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_spring_head_packet':
              if (spendCopper(45)) {
                S.本年商路认货 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆春头柜签');
                log.push(['先把春头柜签与样纸门包分开：铜钱-45、认货+1、家书+1、商信誉+1。春开路刚起头这层柜签、样纸、门包和递话脚费先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把春头柜签与样纸门包拆开，但这旬铜钱已先被别处占住，只得让春头门包和柜边茶水继续抢同一口现钱。', 'bad']);
              }
              break;
            case 'm_spring_school_split':
              if (spendCopper(50)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆春头供读');
                log.push(['先把春头家书与供读纸样分开：铜钱-50、家书+1、供读+1、家族+1。春头这层家书脚费、供读纸样、柜边门包和家里锅火先被压回这一旬，商路刚开头时，供读去向终于不再只停在“以后再说”。', 'good']);
              } else {
                log.push(['想先把春头家书与供读纸样分开，但这旬铜钱已先被别处占住，只得让家书、纸样和锅火继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_spring_head_duty':
              if (spendCopper(55)) {
                S.本年商路家书 += 1;
                S.本年商路备役 += 1;
                S.家族 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆春头差钱');
                log.push(['先把春头差钱口风与柜签门包分开：铜钱-55、家书+1、备役+1、家族+1、商信誉+1。春头这层差钱口风、柜签门包、递话脚费和家里锅火先被拆回了这一旬，商路刚起手时，年里的差役后手也不再只停在一句“到时候再想办法”。', 'good']);
              } else {
                log.push(['想先把春头差钱口风与柜签门包分开，但这旬铜钱已先被别处占住，只得让差钱口风、柜签门包和锅火继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_spring_tail_split':
              if (spendCopper(55)) {
                S.本年商路家书 += 1;
                S.家族 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆春尾回签');
                log.push(['先把春尾回签与归乡脚费分开：铜钱-55、家书+1、家族+1、商信誉+1。春尾这层熟号回签、归乡脚费、柜边包纸和递话门包先被压回了这一旬，夏里不再还拖着春尾后手。', 'good']);
              } else {
                log.push(['想先把春尾回签与归乡脚费拆开，但这旬铜钱已先被别处占住，只得让春尾回话和归乡脚费继续挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'm_spring_tail_supply':
              if (spendCopper(60)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路备役 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆春尾供差');
                log.push(['先把春尾供读纸包与差钱口风分开：铜钱-60、家书+1、供读+1、备役+1、家族+1。春尾这层家书回话、供读纸包、差钱口风和柜边包纸先被拆回了这一旬，夏里刚坐店时，家里的供读与差役后手便不再只停在一句“等回钱再说”。', 'good']);
              } else {
                log.push(['想先把春尾供读纸包与差钱口风分开，但这旬铜钱已先被别处占住，只得让供读纸包、差钱口风和家书回话继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_summer_head_packet':
              if (spendCopper(50)) {
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.商信誉 += 1;
                S.体魄 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏行栈茶脚');
                log.push(['先把伏夏行栈茶脚与家书药包分开：铜钱-50、家书+1、体魄+1、商信誉+1。伏夏起手这一旬最细的茶脚、药包和带话脚费先被压回了账面。', 'good']);
              } else {
                log.push(['想先把伏夏行栈茶脚与家书药包拆开，但这旬铜钱已先被别处占住，只得让落脚茶脚和药包继续跟热里碎耗一起硬挤。', 'bad']);
              }
              break;
            case 'm_summer_head_home_split':
              if (spendCopper(60)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏纸样');
                log.push(['先把伏夏凉汤与家里纸样分开：铜钱-60、家书+1、供读+1、体魄+1、家族+1。伏夏起手这一旬最细的凉汤、纸样和递话脚费先被压回了账面，身子与家里那头不再一起挤这口现钱。', 'good']);
              } else {
                log.push(['想先把伏夏凉汤与家里纸样分开，但这旬铜钱已先被别处占住，只得让凉汤、纸样和递话脚费继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_summer_head_supply_duty':
              if (spendCopper(65)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路备役 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏供差');
                log.push(['先把伏夏差帖与供读纸样分开：铜钱-65、家书+1、供读+1、备役+1、体魄+1、家族+1。伏夏起手这一旬最细的差帖门包、供读纸样、凉汤汗巾和递话脚费先被压回了账面，家里供读、年里差役与自己这副身子不再继续一起抢这口现钱。', 'good']);
              } else {
                log.push(['想先把伏夏差帖与供读纸样分开，但这旬铜钱已先被别处占住，只得让差帖门包、纸样和凉汤脚费继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_summer_bundle':
              if (spendCopper(55)) {
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.商信誉 += 1;
                S.体魄 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏茶药');
                log.push(['先把伏夏茶汤与汗药草鞋分开：铜钱-55、家书+1、体魄+1、商信誉+1。伏夏中旬最容易一起冒头的茶汤、汗药、草鞋和带话脚费，先被压回这一旬。', 'good']);
              } else {
                log.push(['想先把伏夏茶汤与汗药草鞋拆开，但这旬铜钱已先被别处占住，只得让热里碎耗继续和柜上活一并挤。', 'bad']);
              }
              break;
            case 'm_summer_conflict':
              if (spendCopper(60)) {
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏身家冲突');
                log.push(['先把伏夏凉药与家里催信分开：铜钱-60、家书+1、体魄+1、家族+1。伏夏中旬这层“人先虚、家里先急”的冲突先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把伏夏凉药与家里催信拆开，但这旬铜钱已先被别处占住，只得让自己汗药、家里催信和孩子纸样继续挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'm_run':
              if (runSilver > 0) { S.白银 += runSilver; S.累计回钱银 += runSilver; S.本年商路回钱银 += runSilver; }
              S.铜钱 += runCopper; S.商历练 += 2; S.体魄 -= runBody; if (runFamilyCost > 0) S.家族 -= runFamilyCost;
              if (runBody >= 4) S.本年商路身乏 += 1;
              if (runFamilyCost > 0) S.本年商路龃龉 += 1;
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
            case 'm_literacy':
              if (spendCopper(literacyCost)) {
                S.账房进度 += 1;
                S.商历练 += 1;
                S.识字进度 += 1;
                var becameLiterate = (!S.识字 && S.识字进度 >= 2);
                if (becameLiterate) S.识字 = true;
                pushMerchantSeasonTag(season.name + xunLabel + (becameLiterate ? '开蒙识字' : '认字补课'));
                log.push([season.id === 'winter'
                  ? ('借账房灯下认字：铜钱-' + literacyCost + '、账房进度+1、识字进度+' + 1 + (becameLiterate ? '（满2开蒙识字）' : ''))
                  : ('跟账房认字记号：铜钱-' + literacyCost + '、账房进度+1、识字进度+' + 1 + (becameLiterate ? '（满2开蒙识字）' : '')), 'good']);
              } else {
                log.push(['想跟账房补一旬认字，却发现这一旬铜钱已先被脚费与门包占住，只得暂缓。', 'bad']);
              }
              break;
            case 'm_collect':
              S.本年商路催账 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '催账');
              if (S.未回款银 > 0) {
                S.本年商路拖欠 += 1;
                S.未回款银 -= 1; S.白银 += 1; S.累计回钱银 += 1; S.本年商路回钱银 += 1; if (collectTrust > 0) S.商信誉 += collectTrust;
                log.push(['追催旧账回钱：未回款银-1、白银+1' + (collectTrust > 0 ? ('、商信誉+' + collectTrust) : '') + '。账面上的银，终于落回手里。', 'good']);
              } else {
                S.铜钱 += collectCopper; if (collectTrust > 0) S.商信誉 += collectTrust;
                log.push(['带口信催几笔散账：铜钱+' + collectCopper + (collectTrust > 0 ? ('、商信誉+' + collectTrust) : '') + '。虽还没催回整两白银，至少把散碎回话和脚钱先拢回了一些。', 'good']);
              }
              break;
            case 'm_autumn_receipt':
              if (spendCopper(65)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋头回签');
                log.push(['先把秋头回签与牙帖脚费分开：铜钱-65、催账+1、家书+1、商信誉+1。秋头最细的一层回签、牙帖和递话门包先被拆开，后头试手才不至全挤在“钱还没回”上。', 'good']);
              } else {
                log.push(['想先把秋头回签与牙帖脚费拆开，但这旬铜钱已先紧，只得让回签、牙帖和锅火继续抢同一口现钱。', 'bad']);
              }
              break;
            case 'm_autumn_supply_split':
              if (spendCopper(70)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋头供读');
                log.push(['先把秋头锅火与供读纸包分开：铜钱-70、家书+1、家族+1、供读+1。秋头这层锅火、供读纸包、递话脚费和熟号回签先被拆回这一旬，回钱还没落手时，家里去向也不再糊成一团。', 'good']);
              } else {
                log.push(['想先把秋头锅火与供读纸包分开，但这旬铜钱已先紧，只得让锅火、供读后手和熟号回签继续一起追这口未回银。', 'bad']);
              }
              break;
            case 'm_autumn_head_drag':
              if (spendCopper(75)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路拖欠 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋头拖药');
                log.push(['先把秋头拖欠口风与回乡药包分开：铜钱-75、催账+1、家书+1、拖欠+1、歇养+1、体魄+1、家族+1。拖欠口风、回乡药包、递话脚费和锅火后手先被拆回这一旬，秋市刚热时，未回银、家里催问和自己的身子也不再继续抢同一口现钱。', 'good']);
              } else {
                log.push(['想先把秋头拖欠口风与回乡药包分开，但这旬铜钱已先紧，只得让拖欠口风、药包和递话脚费继续一起追这口未回银。', 'bad']);
              }
              break;
            case 'm_autumn_mid_bundle':
              if (spendCopper(60)) {
                S.本年商路核账 += 1;
                S.本年商路问价 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋中门包');
                log.push(['先把秋中门包与牙帖茶钱分开：铜钱-60、核账+1、问价+1、商信誉+1。秋试手中旬最细的一层门包、牙帖和样货脚费先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把秋中门包与牙帖茶钱拆开，但这旬铜钱已先紧，只得让试手门包和样货小耗继续挤在带本银边上。', 'bad']);
              }
              break;
            case 'm_autumn_mid_school':
              if (spendCopper(65)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路备役 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋中供差');
                log.push(['先把秋中回签与供读差票分开：铜钱-65、家书+1、供读+1、备役+1、家族+1。熟号回签、供读纸包、差票门包和租路饭钱先被拆回这一旬，秋里银未落手时，供读与差役也开始在同一年里见真账。', 'good']);
              } else {
                log.push(['想先把秋中回签与供读差票分开，但这旬铜钱已先紧，只得让回签、供读纸包和差票门包继续一起追这口未回银。', 'bad']);
              }
              break;
            case 'm_autumn_mid_drag':
              if (spendCopper(70)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路拖欠 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋中拖账');
                log.push(['先把秋中拖欠口风与回乡饭钱分开：铜钱-70、催账+1、家书+1、拖欠+1、家族+1。秋试手中旬这层“拖欠还在路上、回乡饭钱和家里催问先到”的冲突，先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把秋中拖欠口风与回乡饭钱分开，但这旬铜钱已先紧，只得让拖欠口风、回乡饭钱和家里催问继续一起追这口未回银。', 'bad']);
              }
              break;
            case 'm_autumn_tail_split':
              if (spendCopper(70)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋尾回话');
                log.push(['先把秋尾回话与样货耗损分开：铜钱-70、催账+1、家书+1、商信誉+1。秋尾这层熟号回话、样货耗损、回乡脚费和递话门包先被压回了这一旬，冬里清账不再还拖着秋尾后手。', 'good']);
              } else {
                log.push(['想先把秋尾回话与样货耗损拆开，但这旬铜钱已先紧，只得让秋尾回话、样货耗损和回乡脚费继续挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'm_supply_split':
              if (spendCopper(65)) {
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆回钱供读');
                log.push(['先把回钱拆作锅火与供读纸包：铜钱-65、家书+1、家族+1、供读+1。秋尾这层“银尚未落手、家里已先等锅火和纸包”的冲突先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把回钱拆作锅火与供读纸包，但这旬铜钱已先紧，只得让家里锅火、供读纸包和差票后手继续一起追这口未回银。', 'bad']);
              }
              break;
            case 'm_autumn_tail_body':
              if (spendCopper(70)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆秋尾药信');
                log.push(['先把秋尾药包与回钱家书分开：铜钱-70、催账+1、家书+1、歇养+1、体魄+1、家族+1。秋尾这层“银还在路上、药包和家里催信却已先来”的身家冲突，先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把秋尾药包与回钱家书分开，但这旬铜钱已先紧，只得让药包、催信和回乡脚费继续一起追这口未回银。', 'bad']);
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
                S.累计反哺银 += 1; S.本年商路反哺银 += 1; S.家族 += homeRemitProfile.familyGain;
                S.本年商路贴家 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '贴家回钱');
                log.push(['先寄一两回家过锅火：白银-1、累计反哺+1、贴家+1、家族+' + homeRemitProfile.familyGain + '；这笔银先让家里锅火、口粮或差钱过住，并未自动写成供读专账。', 'good']);
              } else {
                log.push(['本想先寄一两回家过锅火，但这一旬手头现银已先被别处占住，只得暂缓，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'm_support_school':
              if (spendSilver(1)) {
                S.累计反哺银 += 1; S.本年商路反哺银 += 1; S.商路供读银 += 1; S.供读压力 = Math.max(0, S.供读压力 - 1); S.家族 += supportProfile.familyGain;
                if (supportProfile.trustGain > 0) S.商信誉 += supportProfile.trustGain;
                S.本年商路供读 += 1;
                S.本年商路贴家 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '贴家供读');
                log.push(['寄银回家供读：白银-1、累计反哺+1、供读专账+1、家族+' + supportProfile.familyGain + (supportProfile.trustGain > 0 ? ('、商信誉+' + supportProfile.trustGain) : '') + '；这笔商路回账被更稳地另划进家里的供读账。', 'good']);
              } else {
                log.push(['本想寄银回家供读，但这一旬手头现银已先被别处占住，只得暂缓，免得把白银记成负数。', 'bad']);
              }
              break;
            case 'm_letter':
              if (spendCopper(letterCost)) {
                S.家族 += letterFamily; S.本年商路家书 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '捎家书');
                log.push([season.id === 'winter'
                  ? ('托客脚捎家书回乡：铜钱-' + letterCost + '、家族+' + letterFamily + '。银还未必立刻回去，但家里至少知道哪笔账还在路上。')
                  : ('托熟客捎家书回乡：铜钱-' + letterCost + '、家族+' + letterFamily + '。先用一封信把家计、米价和口信连起来，免得两边各自乱猜。'), 'good']);
              } else {
                log.push(['想托人捎家书回乡，但这旬铜钱已先紧，只得先把信压在心里。', 'bad']);
              }
              break;
            case 'm_counter':
              if (spendCopper(60)) {
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.商信誉 += 1;
                S.体魄 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆柜边门包');
                log.push(['先把柜边包纸与回客话门包分开：铜钱-60、家书+1、体魄+1、商信誉+1。伏夏尾声这层柜耗先被拆开，柜上门面和身子都没再一起被热里磨薄。', 'good']);
              } else {
                log.push(['想先把柜边包纸与回客话门包拆开，但这旬铜钱已先紧，只得让柜边碎耗继续和家里口信挤在一处。', 'bad']);
              }
              break;
            case 'm_summer_tail_duty':
              if (spendCopper(65)) {
                S.本年商路备役 += 1;
                S.本年商路家书 += 1;
                S.本年商路役扰 += 1;
                S.商信誉 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆伏夏差票');
                log.push(['先把伏夏差票与回客话门包分开：铜钱-65、备役+1、家书+1、商信誉+1、家族+1。差票回话、回客话门包、递话脚费和柜边碎耗先被拆回这一旬，秋路未开前，差役后手就不再和伏夏柜耗一起抢钱。', 'good']);
              } else {
                log.push(['想先把伏夏差票与回客话门包分开，但这旬铜钱已先紧，只得让差票回话、门包和柜边碎耗继续挤在同一口现钱上。', 'bad']);
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
                S.本年商路役扰 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '预留差役钱');
                log.push(['先留一角差役钱：铜钱-' + reserveCost + '。眼下看不见好处，只是把年关的忙乱先压下去一点。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'm_corvee_split':
              if (spendCopper(60)) {
                S.本年商路备役 += 1;
                S.本年商路家书 += 1;
                S.本年商路役扰 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆差票年礼');
                log.push(['先把差票回话与客脚年礼分开：铜钱-60、备役+1、家书+1、家族+1。冬头这层差票、客脚和锅火不再一股脑挤在同一口现钱上。', 'good']);
              } else {
                log.push(['想先把差票回话与客脚年礼拆开，但这旬铜钱已先被别处吃住，只得让差票、客脚和锅火继续一起抢钱。', 'bad']);
              }
              break;
            case 'm_winter_head_body':
              if (spendCopper(65)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬头药信');
                log.push(['先把冬头药包与回签家书分开：铜钱-65、催账+1、家书+1、歇养+1、体魄+1、商信誉+1。冬清账开头这层“药包、回签、家书和灯炭后手一起追钱”的身账，先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把冬头药包与回签家书分开，但这旬铜钱已先被别处吃住，只得让药包、回签和家书催问继续一起抢这口现钱。', 'bad']);
              }
              break;
            case 'm_winter_head_school':
              if (spendCopper(70)) {
                S.本年商路催账 += 1;
                S.本年商路备役 += 1;
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬头供差');
                log.push(['先把冬头回签与供读差票分开：铜钱-70、催账+1、备役+1、家书+1、供读+1、家族+1。冬头这层熟号回签、供读纸样、差票回话和客脚年礼先被拆回这一旬，回钱未净时，供读与差役也开始在同一年里抢这口现钱。', 'good']);
              } else {
                log.push(['想先把冬头回签与供读差票分开，但这旬铜钱已先被别处吃住，只得让回签、供读纸样和差票回话继续一起追钱。', 'bad']);
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
            case 'm_clear_packet':
              if (spendCopper(70)) {
                S.本年商路核账 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆清账门包');
                log.push(['先把清账门包与来春样纸定钱分开：铜钱-70、核账+1、家书+1、商信誉+1。冬里第二程最碎的清账门包和明春后手先被坐实，回话不再只停在嘴上。', 'good']);
              } else {
                log.push(['想先把清账门包与来春样纸定钱拆开，但这旬铜钱已先被别处吃住，只得继续让清账与明春后手挤在一处。', 'bad']);
              }
              break;
            case 'm_debt_split':
              if (spendCopper(65)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路拖欠 += 1;
                S.商信誉 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆拖欠供读');
                log.push(['先把拖欠回话与供读次序分开：铜钱-65、催账+1、家书+1、供读+1、商信誉+1。冬里第二程这层“拖欠、供读、清账门包一起追钱”的冲突先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把拖欠回话与供读次序拆开，但这旬铜钱已先被别处吃住，只得让拖欠回话、供读纸包和清账门包继续挤在一处。', 'bad']);
              }
              break;
            case 'm_winter_family_split':
              if (spendCopper(70)) {
                S.本年商路催账 += 1;
                S.本年商路备役 += 1;
                S.本年商路家书 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆拖欠差话');
                log.push(['先把拖欠回话与差票家书分开：铜钱-70、催账+1、备役+1、家书+1、家族+1。冬里第二程这层“旧账未回、差票先到、家里又来催信”的冲突先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把拖欠回话与差票家书拆开，但这旬铜钱已先被别处吃住，只得让旧账、差票和家书催问继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_winter_mid_supply_duty':
              if (spendCopper(75)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.本年商路备役 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬中供差');
                log.push(['先把冬中拖欠与供读差票分开：铜钱-75、催账+1、家书+1、供读+1、备役+1、体魄+1、家族+1。冬里第二程这层旧账拖欠、供读纸包、差票回话、药包和守岁灯炭，先被压回了这一旬，回钱未净时，供读、差役、家里催问和自己这副身子不再继续抢同一口现钱。', 'good']);
              } else {
                log.push(['想先把冬中拖欠与供读差票分开，但这旬铜钱已先被别处吃住，只得让旧账拖欠、供读纸包和差票回话继续一起追这口现钱。', 'bad']);
              }
              break;
            case 'm_winter_mid_body':
              if (spendCopper(75)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬中药拖');
                log.push(['先把冬中药包与拖欠回话分开：铜钱-75、催账+1、家书+1、歇养+1、体魄+1、商信誉+1。冬中这层“旧账拖着未回、药包和递话却已先来”的身账，先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把冬中药包与拖欠回话分开，但这旬铜钱已先被别处吃住，只得让药包、拖欠回话和守岁灯炭继续一起抢钱。', 'bad']);
              }
              break;
            case 'm_winter_tail':
              if (spendCopper(75)) {
                S.本年商路核账 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬尾回签');
                log.push(['先把年下回签与来春样纸分开：铜钱-75、核账+1、家书+1、商信誉+1。冬清账最后这层年下回签、样纸定钱和递话门包先被压回这一旬，年关不再只剩一句“来春再说”。', 'good']);
              } else {
                log.push(['想先把年下回签与来春样纸拆开，但这旬铜钱已先被别处吃住，只得让年下回话和来春后手继续挤在一处。', 'bad']);
              }
              break;
            case 'm_winter_tail_school':
              if (spendCopper(80)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路供读 += 1;
                S.家族 += 1;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬尾供读');
                log.push(['先把冬尾回签与供读纸包分开：铜钱-80、催账+1、家书+1、供读+1、家族+1。冬尾这层年下回签、供读纸包、递话脚费和来春样纸定钱先被压回了这一旬，年关收口时，回签、供读和来春后手不再继续抢同一口现钱。', 'good']);
              } else {
                log.push(['想先把冬尾回签与供读纸包分开，但这旬铜钱已先被别处吃住，只得让年下回签、供读纸包和来春样纸继续一起追钱。', 'bad']);
              }
              break;
            case 'm_winter_drag_split':
              if (spendCopper(80)) {
                S.本年商路催账 += 1;
                S.本年商路备役 += 1;
                S.本年商路家书 += 1;
                S.本年商路拖欠 += 1;
                S.家族 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬尾拖欠');
                log.push(['先把年下拖欠与差票回话分开：铜钱-80、催账+1、备役+1、家书+1、家族+1。年下拖欠、差票回话、递话门包和锅火后手先被拆回这一旬，冬尾不再把旧账、差役和家里催问一起硬顶。', 'good']);
              } else {
                log.push(['想先把年下拖欠与差票回话分开，但这旬铜钱已先被别处吃住，只得让旧账拖欠、差票回话和锅火后手继续一起追钱。', 'bad']);
              }
              break;
            case 'm_winter_body_split':
              if (spendCopper(85)) {
                S.本年商路催账 += 1;
                S.本年商路家书 += 1;
                S.本年商路拖欠 += 1;
                S.本年商路歇养 += 1;
                S.体魄 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬尾药拖');
                log.push(['先把年下药包与拖欠回签分开：铜钱-85、催账+1、家书+1、体魄+1、商信誉+1。冬尾这层药包、拖欠回签、递话脚费和锅火后手先被压回了这一旬，旧账、家里催信和自己这副身子不再继续抢同一口现钱。', 'good']);
              } else {
                log.push(['想先把年下药包与拖欠回签分开，但这旬铜钱已先被别处吃住，只得让药包、拖欠回签和锅火后手继续一起逼人。', 'bad']);
              }
              break;
            case 'm_winter_head_packet':
              if (spendCopper(65)) {
                S.本年商路核账 += 1;
                S.本年商路家书 += 1;
                S.商信誉 += 1;
                pushMerchantSeasonTag(season.name + xunLabel + '拆冬头客脚');
                log.push(['先把冬头客脚与明春水脚分开：铜钱-65、核账+1、家书+1、商信誉+1。冬清账开头这层客脚、年礼和明春头程水脚先被压回了这一旬。', 'good']);
              } else {
                log.push(['想先把冬头客脚与明春水脚拆开，但这旬铜钱已先被别处吃住，只得让灯油、客脚和明春起手继续挤在一处。', 'bad']);
              }
              break;
            case 'm_rest':
              S.体魄 += 5; S.本年商路歇养 += 1;
              pushMerchantSeasonTag(season.name + xunLabel + '歇养');
              log.push(['歇养身子：体魄+5', 'good']);
              break;
          }
        });
        applySeasonalMerchantFriction(log, season.name + xunLabel, season, xun, picked);

        if (!isYearEnd) {
          curStage.next = 'merchant';
          curStage.nextLabel = isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + merchantXunLabel(xun + 1) + ' →');
          S._advanceMerchantSeason = true;
          if (S.本年商路坐店 > 0 && S.本年商路认货 > 0) log.push(['这一旬既守柜、也认货，商路不再只是“在号里混熟脸”。', 'good']);
          if (S.本年商路问价 > 0 && S.本年商路试贩 > 0) log.push(['这一旬先抄了行市、后去试贩；不是多掷一次运气，而是先把价摸熟再把银押出去。', 'good']);
          if (S.本年商路贴家 > 0 && S.本年商路试贩 > 0) log.push(['这一旬一边试着把货跑出去，一边又先顾家里回钱，商路与家计已经开始真拉在一处。', 'good']);
          if (S.本年商路催账 > 0 && S.未回款银 <= 0) log.push(['这一旬催账见了真回钱，账面和手里终于不是两本书。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.本年商路试贩 > 0 && S.带本银 > 0) {
          var tradeTable = (S._merchantLockedTradeTable && S._merchantLockedTradeTable.length)
            ? S._merchantLockedTradeTable
            : merchantTradeProfile().table;
          var settledTradeSilver = 0;
          var r = rollProb(tradeTable);
          log.push(['〔试贩成算〕这一单不再只按固定概率落下：会继续吃到旧商路、账房、承继定位与旁支衰减的影响。', 'good']);
          if (r === 'flat') {
            S.白银 += S.带本银;
            S.累计回钱银 += S.带本银;
            settledTradeSilver = S.带本银;
            log.push(['〔试贩结账〕回本而已：锁定本钱如数回账。', 'good']);
          } else if (r === 'profit') {
            S.白银 += S.带本银 + 1; S.累计回钱银 += S.带本银 + 1;
            settledTradeSilver = S.带本银 + 1;
            log.push(['〔试贩结账〕小利：回本并净得白银+1。', 'good']);
          } else if (r === 'loss') {
            S.商路亏折 += 1;
            log.push(['〔试贩结账〕货价不利，本钱亏折1两。', 'bad']);
          } else {
            S.未回款银 += S.带本银;
            log.push(['〔试贩结账〕货已走出但银未回：记未回款，不入现钱。', 'bad']);
          }
          if (settledTradeSilver > 0) S.本年商路回钱银 += settledTradeSilver;
          S.带本银 = 0;
          S._merchantLockedTradeTable = null;
        }

        if (S.本年商路认货 > 0) log.push(['〔认货账〕这一商年你有 ' + S.本年商路认货 + ' 次把认货、辨价和看样真正落成旬内活计，而不只是在年尾笼统说“见过些世面”。', 'good']);
        if (S.本年商路坐店 > 0) log.push(['〔坐店账〕这一商年你有 ' + S.本年商路坐店 + ' 旬把时辰压在柜上与账边；坐店不是背景板，而是能被逐旬点清的门面工夫。', 'good']);
        if (S.本年商路跑单 > 0) log.push(['〔跑单账〕这一商年你有 ' + S.本年商路跑单 + ' 旬真在外头跑货、催路或追单；商路不是年底才忽然“算跑过”。', 'good']);
        if (S.本年商路回钱银 > 0) log.push(['〔回钱账〕这一商年共有 ' + S.本年商路回钱银 + ' 两白银真从外头回到了手里；不是账面上写着“应得”，而是已经落成现银。', 'good']);
        if (S.本年商路反哺银 > 0) log.push(['〔反哺账〕这一商年你有 ' + S.本年商路反哺银 + ' 两白银真从手里划回家中；“亦贾亦儒”的反哺不是死后评语，而是当年就能点清的现银去向。', 'good']);
        if (S.本年商路供读 > 0) {
          log.push(['〔供读链〕这一商年你有 ' + S.本年商路供读 + ' 次先把回钱、纸包或现银往家里供读那条链上压；这层专账不是平白生出来的，是从你本年跑回来的现钱和脚费里硬分出来的。', 'good']);
        }
        if (S.本年商路贴家 > 0 && S.本年商路备役 > 0) {
          S.本年商路役扰 += 1;
          log.push(['〔供读与差役〕这一年同一口现钱既得贴回家里供读，又得预留差票后手；商路不是“赚到就算赢”，而是回钱后立刻要被几头一起分。', 'bad']);
        }
        if (S.未回款银 > 0) {
          S.本年商路拖欠 += S.未回款银;
          if ((S.本年商路家书 + S.本年商路贴家 + S.本年商路供读) > 0) {
            log.push(['〔拖欠〕本年仍有 ' + S.未回款银 + ' 两在路上，但你至少先用家书、贴家或供读次序把家里解释住了；银未落手，账却已先压在当年。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 2);
            S.本年商路龃龉 += 1;
            log.push(['〔拖欠〕本年仍有 ' + S.未回款银 + ' 两挂在外头，家里又没先收到话或现钱，只得把这一层空等和口角记回当年（家族-2）。', 'bad']);
          }
        }
        if (S.本年商路跑单 >= 2 && S.本年商路歇养 <= 0) {
          S.体魄 -= 2;
          S.本年商路身乏 += 1;
          log.push(['〔路耗〕这一年多次跑单却没先留几回歇脚与药钱，年尾这层身子亏空没有再被“年轻扛得住”一句带过（体魄-2）。', 'bad']);
        }
        if (S.本年商路家书 <= 0 && S.本年商路归乡 <= 0 && S.本年商路贴家 <= 0 && S.未回款银 > 0) {
          S.家族 = Math.max(0, S.家族 - 1);
          S.本年商路龃龉 += 1;
          log.push(['〔家中口角〕银还在路上，家里又迟迟收不到信，这一年外头与家里之间的那层冲突便没有被拖到下一代才算（家族-1）。', 'bad']);
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
            S.本年商路役扰 += 1;
            log.push(['〔赋役〕先前留出的一角差役钱派上了用场，这一回没有再临时拆别的现钱。', 'good']);
          } else if (S.铜钱 >= 200) {
            S.本年商路役扰 += 1;
            S.铜钱 -= 200;
            log.push(['〔赋役〕本户轮到差役，拿铜钱200文找人顶上', 'bad']);
          } else {
            S.本年商路役扰 += 1;
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
        if (S.本年商路问价 > 0) log.push(['这一商年你有 ' + S.本年商路问价 + ' 次先花脚费去问行市、抄牙价；这点小钱没有直接变利，却把最生的那层价先摸薄了一些。', 'good']);
        if (S.本年商路家书 > 0) log.push(['这一商年你有 ' + S.本年商路家书 + ' 次托人捎家书回乡；家里未必立刻见钱，却少了几回“人在哪里、银什么时候回”的空等。', 'good']);
        if (S.本年商路贴家 > 0) log.push(['这一商年你有 ' + S.本年商路贴家 + ' 次先把现钱贴回家里；这些钱先续住的是锅火、口粮、差钱或供读中的某一口，不会自动被写成同一种去向。', 'good']);
        if (S.本年商路拖欠 > 0) log.push(['这一商年你至少有 ' + S.本年商路拖欠 + ' 层拖欠、旧账或回话次序要先压住；商路里最磨人的，不只是有没有赚，而是银多久才能真回手。', 'bad']);
        if (S.本年商路役扰 > 0) log.push(['这一商年商路现钱至少有 ' + S.本年商路役扰 + ' 回被差票、备役或顶役后手打断；制度不会等你先把生意做完。', 'bad']);
        if (S.本年商路身乏 > 0) log.push(['这一商年你至少有 ' + S.本年商路身乏 + ' 层身子亏空被记进了真账；跑单、茶脚和药钱没有再被“年轻扛得住”糊过去。', 'bad']);
        if (S.本年商路龃龉 > 0) log.push(['这一商年你至少有 ' + S.本年商路龃龉 + ' 层外路与家里口角被写回当年；家族冲突不再只留到跨代时才结算。', 'bad']);
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
    var xun = currentExamXun();
    var xunLabel = examXunLabel(xun);
    var isMid = xun === 2;
    var isLate = xun >= 3;
    var isYearEnd = season.id === 'winter' && isLate;
    var nextSeason = examSeasonInfo(Math.min(EXAM_SEASONS.length, (S.举季 || 1) + 1));
    var copyCopper = season.id === 'winter' ? (isLate ? 220 : (isMid ? 200 : 170)) : (season.id === 'autumn' ? (isLate ? 180 : 150) : (season.id === 'summer' ? (isLate ? 150 : 130) : (isLate ? 140 : 110)));
    var homeFamily = season.id === 'autumn' ? (isLate ? 5 : 4) : (season.id === 'winter' ? (isLate ? 4 : 3) : 3);
    var homeRice = (season.id === 'autumn' || (season.id === 'winter' && isLate)) ? 1 : 0;
    var reserveCost = season.id === 'winter' ? (isLate ? 140 : 120) : (season.id === 'autumn' ? 110 : 90);
    var mendCost = season.id === 'winter' ? (isLate ? 130 : 120) : (season.id === 'summer' ? (isLate ? 110 : 90) : 70);
    var mendBody = season.id === 'winter' ? 5 : (isLate ? 4 : 3);
    var essayGain = season.id === 'summer' ? (isMid ? 2 : 1) : (season.id === 'autumn' && isLate ? 2 : 1);
    var tutorGain = season.id === 'spring' ? 2 : (season.id === 'summer' ? 2 : 1);
    // 举业路补“识字开蒙”入口：用于从出生/幼年未开蒙的存档进入举业时，
    // 仍能在同一年里慢慢补齐最基础的识字底子（不额外耗 RNG；只在被选择时改写状态）。
    // 约束：不把“认字”写成一次性神迹；仍要花铜钱（纸墨/灯油/人情），并占用行动点。
    var literacyCost = season.id === 'winter'
      ? (isLate ? 95 : 85)
      : (season.id === 'summer' ? (isMid ? 85 : 75) : 70);
    var grainSupportCopper = season.id === 'autumn'
      ? 280
      : (season.id === 'winter' ? 240 : 220);
    var motherHelpCopper = season.id === 'autumn'
      ? 190
      : (season.id === 'winter' ? 170 : (season.id === 'summer' ? 160 : 150));
    var motherHelpName = season.id === 'autumn'
      ? '托母亲卖布钱垫保结盘缠'
      : (season.id === 'winter'
        ? '托母亲纺线钱留来春帖样'
        : (season.id === 'summer' ? '托母亲纺线钱垫潮纸灯油' : '托母亲先挪纺织钱垫塾帖'));
    var motherHelpDesc = season.id === 'autumn'
      ? '母亲若肯从自己纺织私账里先匀一口钱，保结薄礼、盘缠与纸样才不至全挤到父兄那口现钱上。'
      : (season.id === 'winter'
        ? '母亲若肯先从纺织钱里匀一口出来，来春帖样、门包和纸墨定钱就不必全压在年关锅火上。'
        : (season.id === 'summer'
          ? '母亲若肯从纺织私账里先匀一口钱，潮纸、灯油和投帖脚费就不必全靠家里口粮去换。'
          : '母亲若肯先从纺织私账里挪一口出来，塾帖、纸样和第一口束脩就不必全压在父兄现钱上。'));
    var brotherHelpCopper = season.id === 'autumn'
      ? 230
      : (season.id === 'winter' ? 210 : (season.id === 'summer' ? 190 : 180));
    var brotherHelpName = season.id === 'autumn'
      ? '先拿兄婚事钱垫秋试盘缠'
      : (season.id === 'winter'
        ? '先挪兄房年礼钱留来春帖样'
        : (season.id === 'summer' ? '先缓兄婚事钱垫伏夏馆账' : '先缓兄婚事钱换塾帖纸墨'));
    var brotherHelpDesc = season.id === 'autumn'
      ? '兄房若肯把原打算留给婚事与秋后置办的那口钱先让出来，秋试盘缠、薄礼与递帖脚费才不至全挤在父兄现钱和家里口粮上。'
      : (season.id === 'winter'
        ? '兄房若肯先把年下原要给婚事与人情置办的钱让一口出来，来春帖样、门包和纸墨定钱就不必全压在年关锅火上。'
        : (season.id === 'summer'
          ? '兄房若肯把原打算给婚事留的一口钱先让出来，伏夏束脩、凉茶脚费和潮纸灯油就不必全靠父兄硬顶。'
          : '兄房若肯把原要给婚事留的一口钱先让出来，塾帖、纸样和第一口束脩就不必全压在父兄现钱上。'));
    var xunLead = xun === 1
      ? '上旬先把这一季到底怎么读、谁来供、钱从哪边先压进去坐实。'
      : (xun === 2
        ? '中旬最像把资格、人情、纸墨和评文一起往前推。'
        : '下旬则把应不应场、回不回家、差役钱和衣药这些后手一并收住。');
    if (S.家传书香 > 0) copyCopper += 40;
    if (S.供读底子 > 0) copyCopper += 20;
    return {
      title: '读书应举 · 第' + S.举业年 + '举业年·' + season.name + '·' + xunLabel, label: '举业第' + S.举业年 + '年·' + season.name + '·' + xunLabel,
      next: 'civilExam',
      nextLabel: isYearEnd
        ? (S.举业年 < EXAM_YEARS ? '翻到下一举业年春课上旬 →' : '带着这三年账本去议亲 →')
        : (isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + examXunLabel(xun + 1) + ' →')),
      ap: 4,
      commitLabel: isYearEnd ? '了这一举业年 →' : '了这一旬举业细账 →',
      note: '举业路现改成“春课→夏课→秋试→冬清账”四季、每季三旬：上旬先定主读法、投塾与供读口风，中旬再磨文章、跑资格、补识字、接誊抄，下旬把应场、回家缓家计、差役钱与衣药后手一笔笔收紧。每旬现在按“四手预算”推进：一手顾课业主线，一手跑塾门/保结，一手拆家计与供读碎账，再留一手给身子、差役或回乡后手；供读口风、婚事口风与身子账的翻动，也会按旬累计，不再只留在年终一句“苦读几年”。若家里真要续供，也得显式粜米或另挪口粮来换纸墨盘缠，而不是把存米自动折成现银。如今下场后会在同一年里直接见“过县试 / 过府试 / 落第 / 成生员”的回话；冬里只继续收余账，不再把应试结果整笔拖到年终。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一举业年走到<span class="em">' + season.name + xunLabel + '</span>。' + season.actionLead + xunLead + (isLate ? '这一旬最像清账：若哪笔钱、哪口气、哪段家计没先留住，到了年关就会一起反噬。' : '同一年里，识字底子、投塾回话、保结、盘缠、家里锅火、婚事口风和身子亏空都在争同一笔钱。') + ' 你这一旬有 <span class="em">4 个行动点</span>，最好别只顾课业本身。',
      dossier: function () {
        return lifeDossier('当前举程=' + season.name + '·' + xunLabel + '｜投塾=' + examEnrollmentLabel(S.投塾进度) + '｜童试层级=' + examTierLabel(S.童试层级, S.生员身份) + '｜保结=' + examGuaranteeLabel(S.保结进度) + '｜文章火候=' + S.文章火候 + '｜供读状态=' + examSupportStateDetail() + '｜婚事口风=' + examDelayStatusLabel() + '｜三年婚事承压=' + examLifetimeDelayLabel() + '｜身耗=' + examBodyStatusLabel() + '｜本年应试=' + examAttemptResultLabel(S.本年应试结果) + '｜本年投塾=' + S.本年投塾次数 + '｜识字旬=' + S.本年识字旬数 + '｜馆课=' + S.本年馆课次数 + '｜半读=' + S.本年半读次数 + '｜评文=' + S.本年评文次数 + '｜保结奔走=' + S.本年保结次数 + '｜誊抄=' + S.本年誊抄次数 + '｜归家缓家=' + S.本年归家次数 + '回/' + S.本年家中贴补米 + '石｜母纺贴补=' + (S.本年母纺贴补次 || 0) + '回/' + (S.本年母纺贴补文 || 0) + '文｜兄婚让读=' + (S.本年兄婚让读次 || 0) + '回/' + (S.本年兄婚让读文 || 0) + '文｜供读转折=' + (S.本年供读转折旬数 || 0) + '旬｜婚事转折=' + (S.本年婚事转折旬数 || 0) + '旬｜身耗转折=' + (S.本年身耗转折旬数 || 0) + '旬｜家中供读=' + S.本年家中供读次 + '回/' + S.本年家中供读文 + '文/' + S.本年家中供读米 + '石｜笔墨自筹=' + (S.本年举业自筹文 || 0) + '文' + ((S.本年举业自筹缓压 || 0) > 0 ? '｜已缓供读一线' : '') + '｜已落举业支出=' + S.本年已落举业支出文 + '文｜束脩=' + S.本年束脩支出文 + '文｜纸墨=' + S.本年纸墨支出文 + '文｜保结脚费=' + S.本年保结支出文 + '文｜盘缠=' + S.本年盘缠支出文 + '文｜零耗=' + S.本年零耗支出文 + '文｜衣药=' + S.本年衣药支出文 + '文｜役扰=' + (S.本年役扰支出文 || 0) + '文' + ((S.本年役扰已结 || false) ? '｜役钱已见光' : '') + '｜债息=' + (S.本年债息增银 || 0) + '两' + ((S.本年债息已结 || false) ? '｜债息已滚' : '') + '｜落第=' + S.本年落第次数 + '｜延婚牵扯=' + S.本年延婚牵扯 + '｜身子亏空=' + S.本年身子亏空 + '｜累计投塾=' + (S.举业累计投塾次数 || 0) + '｜累计识字=' + (S.举业累计识字旬数 || 0) + '｜累计保结=' + (S.举业累计保结次数 || 0) + '｜累计落第=' + (S.举业累计落第次数 || 0) + '｜累计延婚=' + (S.举业累计延婚牵扯 || 0) + '｜累计身耗=' + (S.举业累计身子亏空 || 0) + (S.生员身份 ? '｜已是生员' : '') + '。');
      },
      events: [
        {
          t: 'rel',
          tag: '[供读]',
          txt: isLate
            ? '下旬更像“把细账摊平”：家里肯不肯再替你顶一口、你愿不愿先回去缓一缓锅火，都不会因为“读书最体面”就自动成立。'
            : (isMid
              ? '到中旬，塾师、廪保、父兄和你自己都要重新掂量：这一季的纸墨、人情与资格，值不值得继续往前推。'
              : '父、兄、母、塾师、廪保都不是默认帮手。家里肯不肯继续供、塾师肯不肯续教、保结肯不肯替你担，都得各自成立。')
        },
        {
          t: season.id === 'autumn' ? 'rand' : 'life',
          tag: season.id === 'autumn' ? '[应试]' : (season.id === 'winter' ? '[清账]' : '[家计]'),
          txt: season.note + (isYearEnd ? ' 这一旬还要把束脩纸墨、口粮、差役与旧债一起结成全年总账。' : ' 同一旬里，文章火候、盘缠与家中口粮常常在抢同一笔钱。')
        },
        {
          t: 'body',
          tag: '[身子]',
          txt: S.体魄 <= 45
            ? '灯下久坐、奔走保结、回家帮工挤在一起时，最先漏的往往不是文章，而是眼睛、肩背和这口能不能继续硬撑的气。'
            : (season.id === 'summer'
              ? '伏夏里最怕心浮气躁，白日要温书，夜里还想多抄几页换钱，热毒和眼花会一点点把人磨薄。'
              : '举业看似靠笔墨，其实鞋脚、棉衣、药钱和能不能歇一旬，一样会慢慢决定你还能不能继续读下去。')
        }
      ],
      prompt: xun === 1 ? '这一旬先怎么定主读法？（分配 4 点）' : (xun === 2 ? '这一旬怎么把文章、资格与补贴往前推？（分配 4 点）' : '这一旬怎么把应场、家计与后手收住？（分配 4 点）'),
      actions: function () {
        var A = [];
        if (xun === 1) {
          if ((S.投塾进度 || 0) < 2 && S.供读状态 !== '已断供') {
            A.push({
              id: 'e_enroll',
              name: season.id === 'spring' ? '先递塾帖试坐馆' : (season.id === 'summer' ? '催塾门回话' : '补一道塾门回帖'),
              cost: 1,
              eff: '投塾进度+1档·家族+1·供读压力+1',
              desc: season.id === 'spring'
                ? '先把塾师肯不肯收、帖子怎么递、第一口束脩从谁账上先压进去坐实。'
                : '塾门不续、回帖不来，后头的馆课、评文和应试都容易变成空话。',
              can: S.供读状态 !== '已断供',
              once: true
            });
          }
          A.push({ id: 'e_tutor', name: season.id === 'spring' ? '先入塾定今年馆课' : '继续塾馆温书', cost: 2, eff: '文章火候+' + tutorGain + '·成本档+' + (season.id === 'spring' ? 2 : 1) + '·供读压力+1', desc: season.id === 'spring' ? '先把今年最重也最贵的读法定下来：银钱、纸墨、人情都得先压进去。' : '继续把时辰压在馆课与温书上，推得稳，也更吃家里。', can: S.供读状态 !== '已断供', once: true });
          A.push({ id: 'e_half', name: '半耕半读', cost: 1, eff: '文章火候+1' + (season.id === 'autumn' ? '·存米+1' : '') + '·体魄-1', desc: '农忙帮家里、农闲读书，推进慢些，却能把家里那口气续住。', can: true });
          A.push({ id: 'e_school', name: season.id === 'spring' ? '投社学/寄读' : '低成本寄读', cost: 1, eff: '成本档+1·文章火候+1', desc: '不走正经塾馆，先把这一年读书成本压低一线。', can: S.供读状态 !== '已断供', once: true });
          if (!S.识字 && (S.识字进度 || 0) < 2) {
            A.push({
              id: 'e_literacy',
              name: season.id === 'winter' ? '借灯下认字记号' : '先开蒙识字',
              cost: 1,
              eff: '铜钱-' + literacyCost + '·识字进度+1(满2开蒙)·文章火候+1',
              desc: season.id === 'winter'
                ? '年关灯下跟塾师或同窗认几行字、记几样号记。钱花得碎，却能把“只会背、不会写”的窄口慢慢撑开。'
                : '先把最基础的字眼认出来：不求立刻会作文章，只求能看懂题目、抄得对字、记得住账。',
              can: S.铜钱 >= literacyCost,
              why: S.铜钱 >= literacyCost ? '' : ('铜钱不足' + literacyCost + '文'),
              once: true
            });
          }
          A.push({
            id: 'e_family_grain',
            name: season.id === 'autumn'
              ? '先粜一石口粮凑盘缠'
              : (season.id === 'winter'
                ? '先把一石存米换来春帖样'
                : (season.id === 'summer' ? '先把一石存米换潮纸灯油' : '先粜一石口粮换塾帖纸墨')),
            cost: 1,
            eff: '存米-1·铜钱+' + grainSupportCopper + '·供读压力-1',
            desc: season.id === 'autumn'
              ? '不把存米自动折银，只在这一旬明着从家里粜出一石，先凑赶考盘缠与递帖碎费。'
              : (season.id === 'winter'
                ? '明着挪一石存米，先换成来春投帖、样纸和门包后手。不是凭空多钱，而是把口粮的一部分真换成笔墨门路。'
                : '不把存米自动折成现银，而是在这一旬明着粜出一石，先换塾帖、纸墨、灯油和脚费。家里这口供读钱，得从口粮里真拆出来。'),
            can: S.存米 >= 1 && S.供读状态 !== '已断供',
            why: S.存米 >= 1 ? (S.供读状态 !== '已断供' ? '' : '家中已断供') : '存米不足1石',
            once: true
          });
          A.push({
            id: 'e_mother_help',
            name: motherHelpName,
            cost: 1,
            eff: '铜钱+' + motherHelpCopper + '·供读压力-1·家族+1',
            desc: motherHelpDesc + ' 这口钱来自母亲自愿匀出的纺织私账，不是户主公账自动拨下。',
            can: S.供读状态 !== '已断供' && (S.本年母纺贴补次 || 0) < 2,
            why: S.供读状态 !== '已断供' ? ((S.本年母纺贴补次 || 0) < 2 ? '' : '本年母纺贴补已到2回') : '家中已断供',
            once: true
          });
          A.push({
            id: 'e_brother_help',
            name: brotherHelpName,
            cost: 1,
            eff: '铜钱+' + brotherHelpCopper + '·供读压力-1·家族-2·延婚牵扯+1',
            desc: brotherHelpDesc + ' 兄并非默认提款机；这一步只是把他那口婚事钱、年礼钱或置办钱先往后让一截，换你这一旬的塾帖、束脩、盘缠或帖样。',
            can: S.供读状态 !== '已断供' && (S.本年兄婚让读次 || 0) < 1,
            why: S.供读状态 !== '已断供' ? ((S.本年兄婚让读次 || 0) < 1 ? '' : '本年兄婚让读已用过') : '家中已断供',
            once: true
          });
          if (season.id === 'spring') {
            A.push({ id: 'e_spring_open_packet', name: '先把拜师帖与开春锅火分开', cost: 1, eff: '铜钱-40·家族+1', desc: '春课上旬最怕拜师帖、启蒙纸样、塾馆茶水和家里开春锅火一起追钱。先把这层小账拆开，第一口供读钱才不至刚压进去就被磨薄。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
          } else if (season.id === 'summer') {
            A.push({ id: 'e_summer_open_packet', name: '先把伏夏馆账与凉茶脚费分开', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '夏课上旬最怕束脩、凉茶脚费和家里消暑小耗一起冒头。先把这层馆账拆开，伏夏刚起头时才不至又是钱紧又是气短。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
          } else if (season.id === 'autumn') {
            A.push({ id: 'e_autumn_open_packet', name: '先把秋前盘缠与拜帖小礼分开', cost: 1, eff: '铜钱-50·家族+1', desc: '秋试上旬最怕应试盘缠、拜帖小礼和家里秋收锅火一起追钱。先把这层临场前的后手拆开，保结与应场才不至先被现钱卡死。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
          } else if (season.id === 'winter') {
            A.push({ id: 'e_winter_open_packet', name: '先把年关纸墨与来春定钱分开', cost: 1, eff: '铜钱-55·家族+1', desc: '冬清账上旬最怕旧馆账脚费、来春纸墨定钱、灯油和拜帖脚费一起追钱。先把这层门路钱拆开，年关就不至先把读书路掐断。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
            if (S.本年应试结果 === '落第') {
              A.push({
                id: 'e_fail_talk',
                name: '落第后先回家缓口风',
                cost: 1,
                eff: '家族+2·供读压力-1',
                desc: '秋里落第回话已在当旬见了。冬头若不先回家把父兄母那口气缓住，来春束脩、纸墨与婚事口风就会一起更硬。',
                can: true,
                once: true
              });
            }
          }
          A.push({ id: 'e_home', name: season.id === 'autumn' ? '回家帮父缓秋里家计' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '这一旬少读一点，先让家里那口锅别翻。', can: true, once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '别把眼睛和身子先熬坏。', can: true });
        } else if (xun === 2) {
          A.push({ id: 'e_essay', name: season.id === 'summer' ? '伏夏专心评文改卷' : '请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '再花一点纸墨和人情，把文章火候往前磨一层。评文是建立在本年真有读法与塾门回话之上的，不是空转一旬就能凭空多出火候。', can: S.供读状态 !== '已断供' && examStudyTrackReady(), why: S.供读状态 !== '已断供' ? (examStudyTrackReady() ? '' : '先把塾门或半读读法坐实') : '家中已断供' });
          A.push({
            id: 'e_guarantee',
            name: (S.保结进度 || 0) <= 0
              ? '先递保结帖样'
              : (season.id === 'autumn' ? '赶在秋里通保结' : '奔走廪保通保结'),
            cost: 1,
            eff: ((S.保结进度 || 0) <= 0 ? '保结进度到“已递帖样”' : '保结进度到“保结已通”') + '·保结脚费先支80文',
            desc: (S.保结进度 || 0) <= 0
              ? '资格不通，本年就算想下场也不成。先把帖样、履历与廪保口风递到位，别把“已递帖样”省成一句话。没先坐实读法与塾门，保结也只是空跑人情。'
              : '资格不通，本年就算想下场也不成。帖样既已递过，这一旬再把廪保、互结与报名链条真正走通，才配说“保结已通”。',
            can: !S.生员身份 && S.保结进度 < 2 && (season.id === 'autumn' || season.id === 'winter') && examStudyTrackReady(),
            why: !S.生员身份 ? (S.保结进度 < 2 ? ((season.id === 'autumn' || season.id === 'winter') ? (examStudyTrackReady() ? '' : '先把塾门或半读读法坐实') : '通常到秋冬才真跑保结') : '本年保结已通') : '已是生员',
            once: true
          });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '年关抄单写契补贴' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '就算不中，识字、誊抄和替人看账也会慢慢沉成转业底子。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          if (season.id === 'spring') {
            A.push({ id: 'e_spring_packet', name: '先把春中评文回话与税则脚费分开', cost: 1, eff: '铜钱-45·家族+1', desc: '春课中旬最怕评文回话、税则小纸、递话脚费和家里锅火一起冒头。先把这层小钱拆开，馆课口风才不至刚起就被磨薄。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
          } else if (season.id === 'summer') {
            A.push({ id: 'e_summer_packet', name: '先把潮纸、投帖脚费与塾馆茶汤分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '伏夏中旬最怕潮纸、投帖脚费、塾馆茶汤和家里凉热小耗一起冒头。先把这层细耗拆开，文章和身子都不至同时被暑气磨薄。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
            A.push({
              id: 'e_summer_cough',
              name: '先把伏夏凉药与草鞋脚费分开',
              cost: 1,
              eff: '铜钱-55·体魄+1·家族+1·将养+1',
              desc: '伏夏中旬最怕评文、抄书刚换来一点现钱，凉药、草鞋脚费与递话门包又一起追钱。先把这层暑热小耗拆开，不让身子和回塾门的脚钱继续抢同一口现钱。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
              once: true
            });
          } else if (season.id === 'autumn') {
            A.push({ id: 'e_autumn_packet', name: '先把保结薄礼与学生回话脚费分开', cost: 1, eff: '铜钱-55·家族+1', desc: '秋试中旬最怕保结薄礼、学生家回话脚费和润笔纸墨一起追钱。先把这层后手拆开，临场前这口人情就不至先薄掉。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
          } else if (season.id === 'winter') {
            A.push({ id: 'e_winter_mid_packet', name: '先把冬中灯炭与旧馆回话脚费分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬清账中旬最怕灯炭、旧馆回话脚费和来春样纸一起追钱。先把这层续门路的钱拆开，冬里就不至一边熬身子一边把来春口风熬断。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
            A.push({
              id: 'e_winter_cough',
              name: '先把冬中咳药与坐馆灯油分开',
              cost: 1,
              eff: '铜钱-70·体魄+2·家族+1·将养+1',
              desc: '冬中最怕寒咳药包、灯下坐馆的灯油、递话脚费和守夜锅火一起追钱。先把这层过冬小耗拆开，不让“还能续塾门”与“人先别倒下”继续抢同一口现钱。',
              can: S.铜钱 >= 70,
              why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
              once: true
            });
            if (S.本年应试结果 === '落第') {
              A.push({
                id: 'e_fail_copy',
                name: '落第后重抄卷样与回帖',
                cost: 1,
                eff: '铜钱-45·文章火候+1·家族+1',
                desc: '冬中若还想把来春这一口门路续住，就得把落第后该递的回帖、卷样与口风当旬重整。钱花得碎，却能把“落第后是不是就此散掉”重新压回手里。',
                can: S.铜钱 >= 45 && S.识字,
                why: !S.识字 ? '尚不识字，难以自己重抄卷样' : (S.铜钱 >= 45 ? '' : '铜钱不足45文'),
                once: true
              });
            }
          }
          if (!S.识字 && (S.识字进度 || 0) < 2) {
            A.push({
              id: 'e_literacy',
              name: season.id === 'summer' ? '伏夏跟塾师认字' : '补一旬认字开蒙',
              cost: 1,
              eff: '铜钱-' + literacyCost + '·识字进度+1(满2开蒙)·文章火候+1',
              desc: '不求一旬就能写得好，只求把题目、号记与常用字先认全；后面誊抄补贴与写契才有路。',
              can: S.铜钱 >= literacyCost,
              why: S.铜钱 >= literacyCost ? '' : ('铜钱不足' + literacyCost + '文'),
              once: true
            });
          }
          A.push({
            id: 'e_mid_grain',
            name: season.id === 'spring'
              ? '再粜一石口粮续春中评文'
              : (season.id === 'summer'
                ? '先把一石存米换伏夏潮纸'
                : (season.id === 'autumn' ? '先粜一石口粮补秋中保结' : '先把一石存米换冬中灯炭')),
            cost: 1,
            eff: '存米-1·铜钱+' + grainSupportCopper + '·供读压力-1',
            desc: season.id === 'spring'
              ? '春中若不明着再粜一石口粮，评文回话、纸样和递话脚费很容易立刻把馆课口风磨薄。'
              : (season.id === 'summer'
                ? '伏夏中旬若不明着再从口粮里拆一石出来，潮纸、茶汤和投帖脚费就会继续贴着身子咬钱。'
                : (season.id === 'autumn'
                  ? '秋试中旬若不再明着粜一石口粮，保结薄礼、回话脚费和润笔纸墨就会继续挤在同一口现钱上。'
                  : '冬清账中旬若不再明着挪一石存米去换灯炭、样纸和旧馆回话脚费，来春门路就会先被冬里锅火掐住。')),
            can: S.存米 >= 1 && S.供读状态 !== '已断供',
            why: S.存米 >= 1 ? (S.供读状态 !== '已断供' ? '' : '家中已断供') : '存米不足1石',
            once: true
          });
          A.push({
            id: 'e_mid_mother_help',
            name: season.id === 'spring'
              ? '再托母亲纺线钱补春中纸样'
              : (season.id === 'summer'
                ? '托母亲纺线钱续伏夏馆课'
                : (season.id === 'autumn' ? '托母亲卖布钱补秋中保结' : '托母亲纺线钱续冬中灯炭')),
            cost: 1,
            eff: '铜钱+' + motherHelpCopper + '·供读压力-1·家族+1',
            desc: season.id === 'spring'
              ? '春中若母亲肯再从纺织私账里匀一口钱，评文纸样与递话脚费就不必全挤在父兄那口现钱上。'
              : (season.id === 'summer'
                ? '伏夏中旬若母亲肯再匀一口纺线钱，馆课、潮纸和茶汤这层零耗就不至继续只靠家里口粮去换。'
                : (season.id === 'autumn'
                  ? '秋中若母亲肯再卖一口布，保结薄礼和学生家回话脚费就不必全压在父兄那边。'
                  : '冬中若母亲肯再匀一口纺线钱，灯炭、样纸和旧馆回话脚费就不必全压在年关锅火上。')),
            can: S.供读状态 !== '已断供' && (S.本年母纺贴补次 || 0) < 2,
            why: S.供读状态 !== '已断供' ? ((S.本年母纺贴补次 || 0) < 2 ? '' : '本年母纺贴补已到2回') : '家中已断供',
            once: true
          });
          A.push({ id: 'e_home', name: season.id === 'autumn' ? '回家帮父缓秋里家计' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '这一旬少读一点，先让家里那口锅别翻。', can: true, once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '让眼睛和身子缓一口气。', can: true });
        } else {
          A.push({ id: 'e_essay', name: season.id === 'autumn' ? '临场再磨一轮文章' : '再请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '把这一旬能再稳一稳的文章火候压出来。临场前还能再改一轮，但前提仍是今年真有塾门、读法和评文链条。', can: S.供读状态 !== '已断供' && examStudyTrackReady(), why: S.供读状态 !== '已断供' ? (examStudyTrackReady() ? '' : '先把塾门或半读读法坐实') : '家中已断供' });
          A.push({ id: 'e_exam', name: season.id === 'winter' ? '冬前补撞一回童试' : '下场应童试', cost: 2, eff: '触发童试结果·盘缠档+1', desc: '只有保结真通了、这一年又真下了功夫，才值得去撞一撞。先有读法、再有评文和火候、再有保结，最后才是下场。', can: (season.id === 'autumn' || season.id === 'winter') && examAttemptReady(), why: examAttemptBlockedWhy(season.id), once: true });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '誊抄契字补年关钱' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '把识字底子临时换成一点现钱，也算给后路添一层。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          if (season.id === 'spring') {
            A.push({ id: 'e_spring_tail_packet', name: '先把春尾香纸与回馆脚费分开', cost: 1, eff: '铜钱-45·家族+1', desc: '春课下旬最怕清明香纸、回馆脚费和春尾抄写纸墨一起追钱。先把这层季末细账拆开，春尾就不至把夏里的纸墨后手一起拖进来。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
          } else if (season.id === 'summer') {
            A.push({ id: 'e_summer_tail_packet', name: '先把夏尾衣药与回家带药小耗分开', cost: 1, eff: '铜钱-50·体魄+2', desc: '夏课下旬最怕补鞋药钱、伏夏尾声纸墨和回家带药小耗一起追钱。先把这层身子账拆开，伏夏尾声就不至只剩硬熬。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
          } else if (season.id === 'autumn') {
            A.push({ id: 'e_autumn_tail_packet', name: '先把临场盘缠与誊卷纸样分开', cost: 1, eff: '铜钱-60·体魄+1·家族+1', desc: '秋试下旬最怕下场盘缠、誊卷纸样、回乡脚费和秋尾锅火一起追钱。先把这层临场细账拆开，真到下场时才不至临门又先被细钱绊住。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
            A.push({
              id: 'e_autumn_register',
              name: '先把秋尾簿册与回帖灯油分开',
              cost: 1,
              eff: '铜钱-60·家族+1·供读压力-1',
              desc: '秋尾最怕保结簿册、回帖灯油、递话脚费和来春帖样一起追钱。先把这层簿册后手拆开，不让“秋里刚下过场或刚跑完保结”这一层细账又拖进冬清账。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
              once: true
            });
          }
          A.push({
            id: 'e_tail_brother_help',
            name: season.id === 'spring'
              ? '再缓兄婚事钱垫春尾香纸'
              : (season.id === 'summer'
                ? '再缓兄婚事钱垫夏尾衣药'
                : (season.id === 'autumn' ? '再挪兄婚事钱补临场盘缠' : '再挪兄房年礼钱留冬尾门包')),
            cost: 1,
            eff: '铜钱+' + brotherHelpCopper + '·供读压力-1·家族-2·延婚牵扯+2',
            desc: season.id === 'spring'
              ? '春尾若兄房肯再让出一口原准备婚事与置办的钱，香纸、回馆脚费和春尾纸墨才不至继续拖进夏里。'
              : (season.id === 'summer'
                ? '夏尾若兄房肯再让出一口婚事钱，药钱、补鞋与伏夏尾声纸墨才不至继续贴着你这副身子来。'
                : (season.id === 'autumn'
                  ? '秋尾若兄房肯再让出一口婚事钱，临场盘缠、誊卷纸样和回乡脚费才不至临门断掉。'
                  : '冬尾若兄房肯再让出一口年礼与婚事钱，来春投帖门包、年下薄礼与回乡脚钱才不必继续跟锅火抢同一口现钱。')),
            can: S.供读状态 !== '已断供' && (S.本年兄婚让读次 || 0) < 2,
            why: S.供读状态 !== '已断供' ? ((S.本年兄婚让读次 || 0) < 2 ? '' : '本年兄婚让读已到2回') : '家中已断供',
            once: true
          });
          A.push({ id: 'e_home', name: season.id === 'winter' ? '回家陪着把年关过住' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '读书这条路还没坐实的时候，家里先稳住就是一笔真账。', can: true, once: true });
          A.push({ id: 'e_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把差役钱留出来，免得到年关再把读书账拆得满地都是。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
          if (season.id === 'winter') {
            A.push({ id: 'e_winter_packet', name: '先把来春投帖门包与年下薄礼分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬尾最怕来春投帖门包、年下薄礼、回乡脚钱和锅火后手一起压上来。先把这层小钱拆开，明春门路和今冬家计就不至继续挤同一口现钱。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
          }
          A.push({ id: 'e_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '先补棉衣、药钱和灯下熬出来的亏空。' : '先把眼睛和身子这口气养回一点。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '让这一旬别只剩下硬熬。', can: true });
        }
        return A;
      },
      settle: function (log) {
        var didStudy = false, progressed = false;
        var picked = {};
        var stepTag = season.name + '·' + xunLabel;
        var beforeSignals = {
          support: examSupportStateDetail(),
          delay: examDelayStatusLabel(),
          body: examBodyStatusLabel()
        };
        lifePicks.forEach(function (p) {
          picked[p.id] = true;
          switch (p.id) {
            case 'e_enroll':
              var enrollCost = season.id === 'spring' ? 45 : (season.id === 'summer' ? 35 : 30);
              var enrollPay = settleExamAdvanceCost(enrollCost);
              S.投塾进度 = Math.min(2, (S.投塾进度 || 0) + 1);
              S.本年投塾次数 += 1;
              S.家族 += 1;
              S.供读压力 += 1;
              S.本年延婚牵扯 += 1;
              S.本年束脩支出文 += 20;
              S.本年纸墨支出文 += 10;
              S.本年零耗支出文 += Math.max(0, enrollCost - 30);
              pushExamSeasonTag(stepTag + '投塾');
              log.push([
                (season.id === 'spring' ? '先递塾帖试坐馆' : (season.id === 'summer' ? '催塾门回话' : '补一道塾门回帖'))
                  + '：投塾进度推进到“' + examEnrollmentLabel(S.投塾进度) + '”、家族+1、供读压力+1'
                  + enrollPay.text
                  + ((S.投塾进度 || 0) >= 2 ? '。塾门终于坐实，后头的馆课、评文和应试才像真能往前走。' : '。这还只是把塾门和帖子先递到位，不等于全年供读就稳了。'),
                'good'
              ]);
              break;
            case 'e_tutor':
              var tutorCost = season.id === 'spring' ? 150 : 110;
              var tutorPay = settleExamAdvanceCost(tutorCost);
              var tutorPressure = 1;
              if (S.供读底子 > 0 && S.本年馆课次数 <= 0) tutorPressure = 0;
              S.文章火候 += tutorGain; S.读书成本档 += (season.id === 'spring' ? 2 : 1); S.供读压力 += tutorPressure; S.读书方式 = '塾馆'; S.本年馆课次数 += 1; S.本年束脩支出文 += (season.id === 'spring' ? 120 : 80); S.本年纸墨支出文 += 30; S.本年延婚牵扯 += 1; S.投塾进度 = Math.max(1, S.投塾进度 || 0); if (season.id === 'summer' || season.id === 'winter') { S.本年身子亏空 += 1; S.体魄 -= 1; } didStudy = true;
              pushExamSeasonTag(stepTag + '馆课');
              log.push([season.id === 'spring'
                ? ('先把今年馆课定下来：文章火候+' + tutorGain + '、成本档+2、供读压力+' + tutorPressure + tutorPay.text + (tutorPressure === 0 ? '（供读专账先替你垫住了第一口气）' : ''))
                : ('继续塾馆温书：文章火候+' + tutorGain + '、成本档+1、供读压力+' + tutorPressure + tutorPay.text + (tutorPressure === 0 ? '（供读专账先替你垫住了第一口气）' : '') + '、体魄-1'), 'good']);
              break;
            case 'e_half':
              var halfPay = settleExamAdvanceCost(20);
              S.文章火候 += 1; if (season.id === 'autumn') S.存米 += 1; S.体魄 -= 1; S.本年身子亏空 += 1; S.读书方式 = '半耕半读'; S.本年半读次数 += 1; S.本年纸墨支出文 += 20; S.本年延婚牵扯 += 1; didStudy = true;
              pushExamSeasonTag(stepTag + '半耕半读');
              log.push(['半耕半读：文章火候+1' + (season.id === 'autumn' ? '、存米+1' : '') + '、体魄-1' + halfPay.text, 'good']);
              break;
            case 'e_school':
              var schoolPay = settleExamAdvanceCost(80);
              S.文章火候 += 1; S.读书成本档 += 1; S.读书方式 = '社学寄读'; S.本年寄读次数 += 1; S.本年束脩支出文 += 60; S.本年纸墨支出文 += 20; S.本年延婚牵扯 += 1; S.投塾进度 = Math.max(1, S.投塾进度 || 0); didStudy = true;
              pushExamSeasonTag(stepTag + '寄读');
              log.push(['投社学/寄读：文章火候+1、成本档+1' + schoolPay.text, 'good']);
              break;
            case 'e_essay':
              var essayPay = settleExamAdvanceCost(35);
              S.文章火候 += essayGain; S.读书成本档 += 1; S.本年评文次数 += 1; S.本年纸墨支出文 += 35; if (season.id === 'summer' || season.id === 'autumn') { S.本年身子亏空 += 1; S.体魄 -= 1; } didStudy = true;
              pushExamSeasonTag(stepTag + '评文');
              log.push([(season.id === 'summer' ? '伏夏专心评文改卷' : '请塾师评文改卷') + '：文章火候+' + essayGain + '、成本档+1' + essayPay.text + ((season.id === 'summer' || season.id === 'autumn') ? '、体魄-1' : ''), 'good']);
              break;
            case 'e_guarantee':
              var guaranteePay = settleExamAdvanceCost(80);
              var guaranteeBefore = S.保结进度 || 0;
              S.保结进度 = Math.min(2, guaranteeBefore + 1); S.本年保结次数 += 1; S.本年保结支出文 += 80; S.本年延婚牵扯 += 1;
              pushExamSeasonTag(stepTag + '保结');
              log.push([
                ((guaranteeBefore <= 0)
                  ? '先递保结帖样'
                  : (season.id === 'autumn' ? '赶在秋里通保结' : '奔走廪保通保结'))
                  + '：保结进度推进到“' + examGuaranteeLabel(S.保结进度) + '”'
                  + guaranteePay.text
                  + (S.保结进度 >= 2
                    ? '。到这一步，廪保与报名链条才算真正走通。'
                    : '。这一旬只先把帖样、履历与廪保口风递到位，离“保结已通”还差后一步。'),
                'bad'
              ]);
              break;
            case 'e_exam':
              var examOutlay = season.id === 'winter' ? 240 : 200;
              var examPay = settleExamAdvanceCost(examOutlay);
              S.本年下场 = true; S.读书成本档 += 1; S.本年保结支出文 += 60; S.本年纸墨支出文 += 40; S.本年盘缠支出文 += (season.id === 'winter' ? 120 : 100); S.本年延婚牵扯 += 2; S.本年身子亏空 += 1; S.体魄 -= 1;
              pushExamSeasonTag(stepTag + '下场');
              log.push(['你决定这一年下场试一次：这一旬就把盘缠、保结后手与誊卷纸墨一起落账' + examPay.text + '、体魄-1。', 'good']);
              progressed = resolveExamAttempt(log, stepTag) || progressed;
              break;
            case 'e_copy':
              var copyPaperCost = season.id === 'winter' ? 20 : 15;
              var copyPaperPay = settleExamAdvanceCost(copyPaperCost);
              S.铜钱 += copyCopper; S.识字转业值 += 1; S.文章火候 += 1; S.本年誊抄次数 += 1; S.本年纸墨支出文 += copyPaperCost;
              noteExamSelfRaised(copyCopper);
              pushExamSeasonTag(stepTag + '誊抄补贴');
              log.push(['抄书/看账补贴：铜钱+' + copyCopper + '、识字转业值+1、文章火候+1' + copyPaperPay.text + (S.家传书香 > 0 ? '（家传书香让这层笔墨活更容易接到）' : ''), 'good']);
              settleExamSelfRaisedRelief(log, stepTag);
              break;
            case 'e_spring_open_packet':
              if (spendCopper(40)) {
                noteExamOutlay(40, { buckets: { 本年零耗支出文: 40 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆春课开销');
                log.push(['先把拜师帖与开春锅火分开：铜钱-40、家族+1。春课上旬这层拜师帖、启蒙纸样、塾馆茶水和锅火先被拆开，第一口供读钱没再刚压进去就被磨薄。', 'good']);
              } else {
                log.push(['想先把拜师帖与开春锅火拆开，但这一旬铜钱已先被别处占住，只得继续让春头这层细账磨第一口供读钱。', 'bad']);
              }
              break;
            case 'e_spring_packet':
              if (spendCopper(45)) {
                noteExamOutlay(45, { buckets: { 本年零耗支出文: 45 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆春馆回话');
                log.push(['先把春中评文回话与税则脚费分开：铜钱-45、家族+1。春课中旬这层评文回话、税则小纸与递话脚费先被拆开，馆课口风没再顺手被锅火磨薄。', 'good']);
              } else {
                log.push(['想先把春中评文回话与税则脚费拆开，但这一旬铜钱已先被别处占住，只得继续把馆课口风和家里锅火挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'e_summer_packet':
              if (spendCopper(50)) {
                noteExamOutlay(50, { buckets: { 本年零耗支出文: 50 } });
                S.家族 += 1; S.体魄 += 1;
                pushExamSeasonTag(stepTag + '拆馆课零耗');
                log.push(['先把潮纸、投帖脚费与塾馆茶汤分开：铜钱-50、家族+1、体魄+1。伏夏中旬这层潮纸、茶汤和家里凉热小耗先被拆开，文章和身子都没再一起被暑气磨薄。', 'good']);
              } else {
                log.push(['想先把潮纸、投帖脚费与塾馆茶汤拆开，但这一旬铜钱已先被别处占住，只得让伏夏中旬这层细耗继续一股脑追钱。', 'bad']);
              }
              break;
            case 'e_summer_cough':
              if (spendCopper(55)) {
                noteExamOutlay(55, { buckets: { 本年衣药支出文: 55 } });
                S.体魄 += 1;
                S.家族 += 1;
                S.本年将养次数 += 1;
                if (S.本年身子亏空 > 0) S.本年身子亏空 -= 1;
                pushExamSeasonTag(stepTag + '伏夏凉药');
                log.push(['先把伏夏凉药与草鞋脚费分开：铜钱-55、体魄+1、家族+1。凉药、草鞋脚费和递话门包先被拆开，伏夏中旬这层“评文和誊抄刚起、身子已先吃紧”的小耗不再继续往后滚。', 'good']);
              } else {
                log.push(['想先把伏夏凉药与草鞋脚费拆开，但这一旬铜钱已先被别处占住，只得让暑热和灯下久坐继续一起磨身子。', 'bad']);
              }
              break;
            case 'e_summer_open_packet':
              if (spendCopper(45)) {
                noteExamOutlay(45, { buckets: { 本年零耗支出文: 45 } });
                S.家族 += 1; S.体魄 += 1;
                pushExamSeasonTag(stepTag + '拆伏夏馆账');
                log.push(['先把伏夏馆账与凉茶脚费分开：铜钱-45、家族+1、体魄+1。夏课上旬这层束脩、凉茶脚费和家里消暑小耗先被拆开，伏夏刚起头时就没再又是钱紧又是气短。', 'good']);
              } else {
                log.push(['想先把伏夏馆账与凉茶脚费拆开，但这一旬铜钱已先被别处占住，只得让伏夏刚起头这层馆账继续贴着身子来。', 'bad']);
              }
              break;
            case 'e_summer_tail_packet':
              if (spendCopper(50)) {
                noteExamOutlay(50, { buckets: { 本年衣药支出文: 50 } });
                S.体魄 += 2;
                pushExamSeasonTag(stepTag + '拆夏尾衣药');
                log.push(['先把夏尾衣药与回家带药小耗分开：铜钱-50、体魄+2。夏课下旬这层补鞋药钱、伏夏尾声纸墨和回家带药小耗先被拆开，秋前总算没再只剩硬熬。', 'good']);
              } else {
                log.push(['想先把夏尾衣药与回家带药小耗拆开，但这一旬铜钱已先被别处占住，只得让伏夏尾声这层亏空先压到身上。', 'bad']);
              }
              break;
            case 'e_autumn_packet':
              if (spendCopper(55)) {
                noteExamOutlay(55, { buckets: { 本年零耗支出文: 55 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆秋后纸墨');
                log.push(['先把保结薄礼与学生回话脚费分开：铜钱-55、家族+1。秋试中旬这层保结薄礼、学生回话脚费和润笔纸墨先被拆开，临场前的人情后手没有再混成一团。', 'good']);
              } else {
                log.push(['想先把保结薄礼与学生回话脚费拆开，但这一旬铜钱已先被别处占住，只得继续让临场前的人情和纸墨挤在同一口现钱里。', 'bad']);
              }
              break;
            case 'e_autumn_open_packet':
              if (spendCopper(50)) {
                noteExamOutlay(50, { buckets: { 本年零耗支出文: 50 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆秋前盘缠');
                log.push(['先把秋前盘缠与拜帖小礼分开：铜钱-50、家族+1。秋试上旬这层应试盘缠、拜帖小礼和家里秋收锅火先被拆开，保结与应场没再先被现钱卡住。', 'good']);
              } else {
                log.push(['想先把秋前盘缠与拜帖小礼拆开，但这一旬铜钱已先被别处占住，只得让秋头临场后手继续和锅火挤同一口现钱。', 'bad']);
              }
              break;
            case 'e_autumn_tail_packet':
              if (spendCopper(60)) {
                noteExamOutlay(60, { buckets: { 本年零耗支出文: 60 } });
                S.体魄 += 1; S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆临场盘缠');
                log.push(['先把临场盘缠与誊卷纸样分开：铜钱-60、体魄+1、家族+1。秋试下旬这层盘缠、誊卷纸样、回乡脚费和锅火先被拆开，真到临场时没再被细钱绊住。', 'good']);
              } else {
                log.push(['想先把临场盘缠与誊卷纸样拆开，但这一旬铜钱已先被别处占住，只得让临场前这层细账继续一起追钱。', 'bad']);
              }
              break;
            case 'e_autumn_register':
              if (spendCopper(60)) {
                noteExamOutlay(60, { buckets: { 本年零耗支出文: 35, 本年纸墨支出文: 25 } });
                S.家族 += 1;
                if ((S.供读压力 || 0) > 0) S.供读压力 -= 1;
                pushExamSeasonTag(stepTag + '秋尾簿册');
                log.push(['先把秋尾簿册与回帖灯油分开：铜钱-60、家族+1、供读压力-1。保结簿册、回帖灯油、递话脚费和来春帖样先被拆开，秋尾这层“下场或保结刚过，冬里后手又来追钱”的细账没有再被顺手拖进年关。', 'good']);
              } else {
                log.push(['想先把秋尾簿册与回帖灯油拆开，但这一旬铜钱已先被别处占住，只得让秋尾这层簿册、灯油与递话脚费继续挤在同一口现钱上。', 'bad']);
              }
              break;
            case 'e_winter_open_packet':
              if (spendCopper(55)) {
                noteExamOutlay(55, { buckets: { 本年零耗支出文: 55 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆年关纸墨');
                log.push(['先把年关纸墨与来春定钱分开：铜钱-55、家族+1。冬清账上旬这层旧馆账脚费、来春纸墨定钱、灯油和拜帖脚费先被拆开，年关没有先把读书路掐断。', 'good']);
              } else {
                log.push(['想先把年关纸墨与来春定钱拆开，但这一旬铜钱已先被别处占住，只得让年关这层续门路钱继续一股脑追上来。', 'bad']);
              }
              break;
            case 'e_fail_talk':
              S.家族 += 2;
              S.供读压力 = Math.max(0, S.供读压力 - 1);
              S.本年归家次数 += 1;
              S.本年家中贴补次 += 1;
              pushExamSeasonTag(stepTag + '落第后回家缓口风');
              log.push(['落第后先回家缓口风：家族+2、供读压力-1。秋里落第的回话没有被拖成“明年再说”，而是在冬头这一旬就先去把父兄母那口气稳住。', 'good']);
              break;
            case 'e_winter_mid_packet':
              if (spendCopper(60)) {
                noteExamOutlay(60, { buckets: { 本年零耗支出文: 60 } });
                S.家族 += 1; S.体魄 += 1;
                pushExamSeasonTag(stepTag + '拆冬中灯炭');
                log.push(['先把冬中灯炭与旧馆回话脚费分开：铜钱-60、家族+1、体魄+1。冬清账中旬这层灯炭、旧馆回话脚费和来春样纸先被拆开，冬里就没再一边熬身子一边把来春口风熬断。', 'good']);
              } else {
                log.push(['想先把冬中灯炭与旧馆回话脚费拆开，但这一旬铜钱已先被别处占住，只得让冬里这层续门路钱继续贴着锅火来。', 'bad']);
              }
              break;
            case 'e_winter_cough':
              if (spendCopper(70)) {
                noteExamOutlay(70, { buckets: { 本年衣药支出文: 70 } });
                S.体魄 += 2;
                S.家族 += 1;
                S.本年将养次数 += 1;
                if (S.本年身子亏空 > 0) S.本年身子亏空 -= 1;
                pushExamSeasonTag(stepTag + '冬中咳药');
                log.push(['先把冬中咳药与坐馆灯油分开：铜钱-70、体魄+2、家族+1。寒咳药包、坐馆灯油、递话脚费和守夜锅火先被拆开，冬中这层“塾门还能续、人先别倒下”的小账不再继续混成一口硬扛。', 'good']);
              } else {
                log.push(['想先把冬中咳药与坐馆灯油拆开，但这一旬铜钱已先被别处占住，只得让冬里的寒咳、灯油和锅火继续一起追钱。', 'bad']);
              }
              break;
            case 'e_fail_copy':
              if (spendCopper(45)) {
                noteExamOutlay(45, { buckets: { 本年纸墨支出文: 45 } });
                S.文章火候 += 1;
                S.家族 += 1;
                S.本年评文次数 += 1;
                pushExamSeasonTag(stepTag + '落第后重抄卷样');
                log.push(['落第后重抄卷样与回帖：铜钱-45、文章火候+1、家族+1。冬中这一旬把卷样、回帖和塾门口风重新理顺，来春这一手才不至因秋里落第就整口散掉。', 'good']);
              } else {
                log.push(['想在落第后先把卷样与回帖重抄一遍，但这一旬铜钱已被别处占住，只得先拖着，来春门路也就更虚一线。', 'bad']);
              }
              break;
            case 'e_spring_tail_packet':
              if (spendCopper(45)) {
                noteExamOutlay(45, { buckets: { 本年零耗支出文: 45 } });
                S.家族 += 1;
                pushExamSeasonTag(stepTag + '拆春尾香纸');
                log.push(['先把春尾香纸与回馆脚费分开：铜钱-45、家族+1。春课下旬这层清明香纸、回馆脚费和春尾抄写纸墨先被拆开，春尾没再把夏里的纸墨后手一并拖上身。', 'good']);
              } else {
                log.push(['想先把春尾香纸与回馆脚费拆开，但这一旬铜钱已先被别处占住，只得让春尾这层季末细账继续拖着走。', 'bad']);
              }
              break;
            case 'e_literacy':
              if (spendCopper(literacyCost)) {
                noteExamOutlay(literacyCost, { buckets: { 本年纸墨支出文: literacyCost } });
                S.识字进度 = (S.识字进度 || 0) + 1;
                S.本年识字旬数 += 1;
                S.文章火候 += 1;
                didStudy = true;
                var becameLiterate = (!S.识字 && S.识字进度 >= 2);
                if (becameLiterate) S.识字 = true;
                pushExamSeasonTag(stepTag + (becameLiterate ? '开蒙识字' : '认字补课'));
                log.push([
                  (season.id === 'winter' ? '借灯下认字记号' : '开蒙识字')
                    + '：铜钱-' + literacyCost + '、识字进度+1、文章火候+1'
                    + (becameLiterate ? '（满2开蒙识字）' : ''),
                  'good'
                ]);
              } else {
                log.push(['想补一旬认字，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'e_family_grain':
            case 'e_mid_grain':
              if (S.存米 >= 1) {
                S.存米 -= 1;
                S.铜钱 += grainSupportCopper;
                S.供读压力 = Math.max(0, S.供读压力 - 1);
                S.本年家中供读次 += 1;
                S.本年家中供读米 += 1;
                S.本年延婚牵扯 += 1;
                pushExamSeasonTag(stepTag + (p.id === 'e_mid_grain' ? '米脚续供' : '米脚供读'));
                log.push([
                  p.name
                    + '：存米-1、铜钱+' + grainSupportCopper + '、供读压力-1。不是把米自动折成现银，而是家里这一旬明着少留一石口粮，先把举业路的纸墨盘缠换出来。',
                  'good'
                ]);
              } else {
                log.push(['想从家里先粜一石口粮换纸墨盘缠，但这一旬存米不够，只得暂缓。', 'bad']);
              }
              break;
            case 'e_mother_help':
            case 'e_mid_mother_help':
              S.铜钱 += motherHelpCopper;
              S.供读压力 = Math.max(0, S.供读压力 - 1);
              S.家族 += 1;
              S.本年母纺贴补次 = (S.本年母纺贴补次 || 0) + 1;
              S.本年母纺贴补文 = (S.本年母纺贴补文 || 0) + motherHelpCopper;
              S.本年家中供读次 += 1;
              S.本年延婚牵扯 += 1;
              pushExamSeasonTag(stepTag + (p.id === 'e_mid_mother_help' ? '母纺续供' : '母纺贴补'));
              log.push([p.name + '：铜钱+' + motherHelpCopper + '、供读压力-1、家族+1。母亲明着从自己的纺织私账里匀出这一口钱，只替你续住纸墨与门路，不等于这户人家忽然多了一笔公账现银。', 'good']);
              break;
            case 'e_brother_help':
            case 'e_tail_brother_help':
              S.铜钱 += brotherHelpCopper;
              S.供读压力 = Math.max(0, S.供读压力 - 1);
              S.家族 = Math.max(0, S.家族 - 2);
              S.本年兄婚让读次 = (S.本年兄婚让读次 || 0) + 1;
              S.本年兄婚让读文 = (S.本年兄婚让读文 || 0) + brotherHelpCopper;
              S.本年家中供读次 += 1;
              S.本年延婚牵扯 += (p.id === 'e_tail_brother_help' ? 2 : 1);
              pushExamSeasonTag(stepTag + (p.id === 'e_tail_brother_help' ? '兄婚续供' : '兄婚让读'));
              log.push([p.name + '：铜钱+' + brotherHelpCopper + '、供读压力-1、家族-2。兄房明着把原想留给婚事、年礼或置办的一口钱先让出来，才替你续住这一旬纸墨与门路；兄并不是默认让钱，这层牵扯也已在同一年里见了账。', 'bad']);
              break;
            case 'e_home':
              S.家族 += homeFamily; if (homeRice > 0) { S.存米 += homeRice; S.本年家中贴补米 += homeRice; } S.供读压力 = Math.max(0, S.供读压力 - 1); S.本年归家次数 += 1; S.本年家中贴补次 += 1;
              pushExamSeasonTag(stepTag + '归家');
              log.push(['回家帮父与缓冲家计：家族+' + homeFamily + (homeRice > 0 ? ('、存米+' + homeRice) : '') + '、供读压力-1', 'good']);
              break;
            case 'e_reserve':
              if (spendCopper(reserveCost)) {
                noteExamOutlay(reserveCost, { familySupport: false, buckets: { 本年零耗支出文: reserveCost } });
                S.本年备役次数 += 1;
                pushExamSeasonTag(stepTag + '预留差役钱');
                log.push(['先留一角差役钱：铜钱-' + reserveCost + '。眼下看不见好处，只是把年关的忙乱先压下一层。', 'good']);
              } else {
                log.push(['想先留差役钱，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'e_winter_packet':
              if (spendCopper(60)) {
                noteExamOutlay(60, { buckets: { 本年零耗支出文: 60 } });
                S.家族 += 1; S.体魄 += 1;
                pushExamSeasonTag(stepTag + '拆冬尾门包');
                log.push(['先把来春投帖门包与年下薄礼分开：铜钱-60、家族+1、体魄+1。冬尾这层来春门包、年下薄礼与回乡脚钱先被拆开，今冬锅火和明春门路没有再硬挤同一口现钱。', 'good']);
              } else {
                log.push(['想先把来春投帖门包与年下薄礼拆开，但这一旬铜钱已先被别处占住，只得继续让冬尾锅火和明春门路抢同一口现钱。', 'bad']);
              }
              break;
            case 'e_mend':
              if (spendCopper(mendCost)) {
                noteExamOutlay(mendCost, { buckets: { 本年衣药支出文: mendCost } });
                S.体魄 += mendBody; S.本年将养次数 += 1; if (S.本年身子亏空 > 0) S.本年身子亏空 -= 1;
                pushExamSeasonTag(stepTag + '补衣买药');
                log.push([(season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身') + '：铜钱-' + mendCost + '、体魄+' + mendBody, 'good']);
              } else {
                log.push(['想先补衣药钱，但这一旬手头铜钱不够，只能先硬熬。', 'bad']);
              }
              break;
            case 'e_rest':
              S.体魄 += 5; S.本年将养次数 += 1; if (S.本年身子亏空 > 0) S.本年身子亏空 -= 1;
              pushExamSeasonTag(stepTag + '歇养');
              log.push(['歇息养身：体魄+5', 'good']);
              break;
          }
        });
        applySeasonalExamFriction(log, stepTag, season, xun, picked);
        applyExamSeasonCarry(log, stepTag, season, xun);
        refreshExamSupportState();
        noteExamIntraYearSignals(log, stepTag, beforeSignals);

        if (!isYearEnd) {
          curStage.next = 'civilExam';
          curStage.nextLabel = isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + examXunLabel(xun + 1) + ' →');
          S._advanceExamSeason = true;
          if ((S.本年馆课次数 + S.本年半读次数 + S.本年寄读次数) <= 0 && !didStudy && xun === 1) log.push(['这一旬你还没把真正的读书主路坐实，举业只是在账边打转。', 'bad']);
          if (S.本年保结次数 > 0 && S.本年评文次数 > 0 && xun >= 2) log.push(['这一旬既在跑保结、也在磨文章，举业终于不再只是嘴上说要读。', 'good']);
          if (xun === 3 && S.本年归家次数 > 0 && S.本年备役次数 > 0) log.push(['这一旬你一边先把家里那口气续住，一边又把差役后手先留出来，年关就没那么容易把读书账撕散。', 'good']);
          clampAttr('体魄'); clampAttr('家族');
          return;
        }

        if (S.本年下场) {
          if (S.本年应试结果 === '成生员') log.push(['〔应试回话〕秋冬当旬已见榜：本年成了生员；冬里只是继续把供读、口粮与门路余账收完。', 'good']);
          else if (S.本年应试结果 === '落第') log.push(['〔应试回话〕本年这回下场的回话已在当旬坐实：落第。年终只继续结供读、口粮与差役后手，不再把落第拖到最后一笔。', 'bad']);
          else if (S.本年应试结果 !== '未下场') log.push(['〔应试回话〕本年这回下场的结果已在当旬坐实：' + S.本年应试结果 + '。冬里按新进度继续收余账。', 'good']);
        }

        if (S.本年投塾次数 > 0) {
          log.push(['〔投塾〕这一年为塾门、递帖与回话往返了 ' + S.本年投塾次数 + ' 旬；先把“能不能在这家塾里继续坐下去”坐实，馆课、评文和保结才不是空写。', 'good']);
        }
        if (S.本年识字旬数 > 0) {
          log.push(['〔识字〕这一年有 ' + S.本年识字旬数 + ' 旬真把认字、抄帖和灯下记号落进了账里；识字只是把路开宽一线，不直接顶替功名。', 'good']);
        }

        if (didStudy && S.供读底子 > 0) {
          S.供读压力 = Math.max(0, S.供读压力 - 1);
          log.push(['〔供读专账〕上一代留下的供读底子替这一年缓去一线压力（供读压力-1，不折现成现银）。', 'good']);
        }
        var declaredStudyCost = S.本年束脩支出文
          + S.本年纸墨支出文
          + S.本年保结支出文
          + S.本年盘缠支出文
          + S.本年零耗支出文
          + S.本年衣药支出文;
        var uncategorizedStudyCost = Math.max(0, S.本年已落举业支出文 - declaredStudyCost);
        if (uncategorizedStudyCost > 0) {
          S.本年零耗支出文 += uncategorizedStudyCost;
          declaredStudyCost += uncategorizedStudyCost;
        }
        var studyCost = Math.max(0, declaredStudyCost - S.本年已落举业支出文);
        var yearlyExamBreakdown = '全年约束脩' + S.本年束脩支出文 + '、纸墨' + S.本年纸墨支出文 + '、保结脚费' + S.本年保结支出文 + '、盘缠' + S.本年盘缠支出文 + '、零耗' + S.本年零耗支出文 + '、衣药' + S.本年衣药支出文;
        if (studyCost > 0) {
          S.本年家中供读次 += 1;
          S.本年家中供读文 += studyCost;
          if (S.铜钱 >= studyCost) {
            S.铜钱 -= studyCost;
            log.push(['〔束脩纸墨〕前面逐旬已落了 ' + S.本年已落举业支出文 + ' 文，本年余下主账再收尾：铜钱-' + studyCost + '（' + yearlyExamBreakdown + '）。', 'bad']);
          } else {
            var left = studyCost - S.铜钱;
            S.铜钱 = 0;
            var silverNeed = Math.ceil(left / 300);
            if (S.白银 >= silverNeed) {
              S.白银 -= silverNeed;
              log.push(['〔束脩纸墨〕前面逐旬已落了 ' + S.本年已落举业支出文 + ' 文，年终余下主账仍要再从家里硬银上支 ' + silverNeed + ' 两；里头还带着今年投塾、纸墨、盘缠与零耗后手（' + yearlyExamBreakdown + '）。', 'bad']);
            } else {
              var gap = silverNeed - S.白银;
              S.白银 = 0; S.负债银 += gap;
              log.push(['〔束脩纸墨〕前面逐旬虽已落账，但供读链还是吃紧，年终余下主账终究压成债（负债+' + gap + '两；' + yearlyExamBreakdown + '）。', 'bad']);
            }
          }
        } else if (declaredStudyCost > 0) {
          log.push(['〔束脩纸墨〕这一年束脩、纸墨、保结、盘缠连同零耗衣药的大头已在春夏秋冬逐旬落账（' + yearlyExamBreakdown + '），年终只剩零头，不再整笔挤到冬尾。', 'good']);
        }
        var selfRaisedSupport = Math.min(S.本年家中供读文 || 0, S.本年举业自筹文 || 0);
        var familySupportNeed = Math.max(0, (S.本年家中供读文 || 0) - selfRaisedSupport);
        if (studyCost > 0) {
          if (familySupportNeed > 0 || selfRaisedSupport > 0 || S.本年归家次数 > 0 || S.本年家中贴补米 > 0 || S.本年家中供读米 > 0 || (S.本年母纺贴补文 || 0) > 0 || (S.本年兄婚让读文 || 0) > 0) {
            log.push(['〔家中供养〕这一年家里净往你这边压了约 ' + familySupportNeed + ' 文供读钱，里头含投塾、束脩、纸墨、盘缠，也含逐旬自己冒头的零耗' + S.本年零耗支出文 + '文与衣药' + S.本年衣药支出文 + '文；你自己也靠抄书、看账与誊写补回了约 ' + selfRaisedSupport + ' 文，另有 ' + S.本年家中供读米 + ' 石存米被明着粜作纸墨盘缠' + ((S.本年母纺贴补文 || 0) > 0 ? ('，母亲也曾自愿从纺织私账里匀出约 ' + S.本年母纺贴补文 + ' 文（共' + (S.本年母纺贴补次 || 0) + '旬）') : '') + ((S.本年兄婚让读文 || 0) > 0 ? ('，兄房也曾明着让出约 ' + S.本年兄婚让读文 + ' 文婚事钱（共' + (S.本年兄婚让读次 || 0) + '旬）') : '') + '。你也回家缓了 ' + S.本年归家次数 + ' 旬、帮家贴回 ' + S.本年家中贴补米 + ' 石。供读只是让钱和口粮继续往你这边压，不推出录取，也不把米自动折银。', 'bad']);
          }
        } else if (S.本年家中供读文 > 0 || S.本年家中供读米 > 0 || selfRaisedSupport > 0 || (S.本年母纺贴补文 || 0) > 0 || (S.本年兄婚让读文 || 0) > 0) {
          log.push(['〔家中供养〕这一年供读钱多半已在逐旬直接落账：家里净往你这边压了约 ' + familySupportNeed + ' 文' + (selfRaisedSupport > 0 ? ('，你自己也靠笔墨补回了约 ' + selfRaisedSupport + ' 文') : '') + (S.本年家中供读米 > 0 ? ('，并另粜了 ' + S.本年家中供读米 + ' 石存米换纸墨脚费') : '') + ((S.本年母纺贴补文 || 0) > 0 ? ('，母亲还自愿从纺织私账里匀出约 ' + S.本年母纺贴补文 + ' 文') : '') + ((S.本年兄婚让读文 || 0) > 0 ? ('，兄房也曾先让出约 ' + S.本年兄婚让读文 + ' 文婚事钱') : '') + '；投塾、束脩、纸墨、盘缠，以及零耗' + S.本年零耗支出文 + '文、衣药' + S.本年衣药支出文 + '文，都已经在旬内现形。供读仍只代表家计让渡，不代表录取。', 'bad']);
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

        if (S.本年役扰已结) {
          if (S.本年役扰支出文 > 0) {
            log.push(['〔赋役〕这一年差钱已在秋尾旬内见光，共支出约' + S.本年役扰支出文 + '文；不再把制度后手整笔拖到年终才一起算。', S.优免启用 ? 'good' : 'bad']);
          } else if (S.优免启用) {
            log.push(['〔赋役〕这一年差徭外流已在秋尾按生员优免先减下去；冬里不再另起一笔年终差钱。', 'good']);
          } else if (S.本年备役次数 > 0) {
            log.push(['〔赋役〕这一年差钱已在秋尾按“先留后用”的口子落过一回；年终不再另起一整笔制度账。', 'good']);
          }
        }
        if (S.本年债息已结 && (S.本年债息增银 || 0) > 0) {
          log.push(['〔债息〕旧债利上已在冬中旬内滚过一回（+' + S.本年债息增银 + '两）；不再等到年终才忽然多出一笔。', 'bad']);
        }

        if (!progressed && !S.生员身份 && didStudy) {
          S.供读压力 += 1;
          log.push(['这一年供读有投入却未见推进，家里继续供你的压力又重了一层。', 'bad']);
        }
        if (S.本年落第次数 > 0) {
          log.push(['〔落第〕这一年确曾下场却未进一层；人情、纸墨和盘缠都已先花出去，婚事与家里口风也会跟着更迟疑。', 'bad']);
        }
        if (S.本年身子亏空 > 0) log.push(['〔身子消耗〕这一年已有 ' + S.本年身子亏空 + ' 层身子亏空在各旬实时落到账里；伏夏馆课、评文、下场与差役后手，不再拖到年尾才一起补扣。', 'bad']);
        if ((S.本年供读转折旬数 || 0) > 0 || (S.本年婚事转折旬数 || 0) > 0 || (S.本年身耗转折旬数 || 0) > 0) {
          log.push(['〔年内翻账〕这一年供读口风翻了 ' + (S.本年供读转折旬数 || 0) + ' 旬、婚事口风翻了 ' + (S.本年婚事转折旬数 || 0) + ' 旬、身子账起了 ' + (S.本年身耗转折旬数 || 0) + ' 旬；这些变化都已在旬内现形，不再等到年终才笼成一句“几年苦读”。', 'good']);
        }
        if ((S.本年馆课次数 + S.本年半读次数 + S.本年寄读次数 + S.本年评文次数) <= 0) {
          S.家族 -= 2;
          log.push(['这一举业年没真把多少时辰落到课业与文章上，家里难免觉得你只是在拖账（家族-2）。', 'bad']);
        } else if (S.本年馆课次数 > 0 && S.本年评文次数 > 0 && S.本年保结次数 > 0) {
          log.push(['这一举业年你既稳住了馆课、也磨了文章、还把资格门槛跑通，读书路终于不再像一张“只说要考”的空纸。', 'good']);
        }
        refreshExamSupportState();
        absorbExamYearIntoLifetime();
        if ((S.举业累计投塾次数 || 0) > 0 || (S.举业累计识字旬数 || 0) > 0 || (S.举业累计保结次数 || 0) > 0 || (S.举业累计落第次数 || 0) > 0 || (S.举业累计延婚牵扯 || 0) > 0 || (S.举业累计身子亏空 || 0) > 0) {
          log.push(['〔三年累账〕截至这一年，已累计投塾' + (S.举业累计投塾次数 || 0) + '旬、识字' + (S.举业累计识字旬数 || 0) + '旬、跑保结' + (S.举业累计保结次数 || 0) + '旬、落第' + (S.举业累计落第次数 || 0) + '回；婚事牵扯累计' + (S.举业累计延婚牵扯 || 0) + '层、身子亏空累计' + (S.举业累计身子亏空 || 0) + '层。举业的代价不只留在本年，会带着这些累账一起往下一年，或直接带去议亲。', 'bad']);
        }

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
          if (!S.生员身份) {
            var marriageDelay = 0;
            if (S.负债银 >= 2) marriageDelay += 2;
            if ((S.举业累计落第次数 || 0) > 0 || S.供读状态 === '已断供') marriageDelay += 2;
            if ((S.举业累计延婚牵扯 || 0) >= 8) marriageDelay += 2;
            else if ((S.举业累计延婚牵扯 || 0) >= 4) marriageDelay += 1;
            if ((S.举业累计身子亏空 || 0) >= 5) marriageDelay += 1;
            if (marriageDelay > 0) {
              S._marriageAgeAdj = Math.max(S._marriageAgeAdj || 0, marriageDelay);
              log.push(['〔延婚〕三年举业累下的供读、人情、落第、旧债与身子亏空，会把议亲至少再往后顺延 ' + marriageDelay + ' 年；不是惩罚，而是把这些年真实压出来的婚窗收窄，显式写回人生账。', 'bad']);
            }
          }
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
    } else if (S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计回钱银 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0) {
      pack.note = '商路议亲看的是回钱、旧账和顾不顾家，不是只看你在外跑过多少路。';
      pack.dossier = '商身份=' + S.商身份 + '｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉 + '｜累计回钱=' + (S.累计回钱银 || 0) + '两｜未回款=' + S.未回款银 + '两｜累计反哺=' + S.累计反哺银 + '两｜供读银=' + S.商路供读银 + '两';
      pack.event = { t: 'rand', tag: '[账期]', txt: '在外学生意，媒人不认“路上银”，只认你手里现钱、这些年有没有寄回过银、账上还有没有旧货款压着。' };
      pack.baseAdj = S.累计反哺银 >= 2 ? 0.04 : ((S.累计回钱银 || 0) >= 2 ? 0.03 : ((S.账房进度 + S.商信誉) >= 3 ? 0.02 : 0));
      pack.showName = '亮账面·说这些年有回钱';
      pack.showCan = S.商历练 > 0 || (S.累计回钱银 || 0) > 0 || S.累计反哺银 > 0 || S.账房进度 > 0 || S.未回款银 > 0;
      pack.showWhy = pack.showCan ? '' : '眼下还无可亮的商路账面';
      pack.showDesc = '让女方家看到你这几年不是空跑商路：账面门道、回家银路、旧账压力都摆在眼前。';
      pack.showBonus = (S.累计反哺银 >= 2 ? 0.10 : (S.累计反哺银 >= 1 ? 0.07 : 0.02))
        + ((S.累计回钱银 || 0) >= 2 ? 0.04 : ((S.累计回钱银 || 0) >= 1 ? 0.02 : 0))
        + ((S.账房进度 + S.商信誉) >= 3 ? 0.04 : 0)
        - (S.未回款银 > 0 ? 0.03 : 0) - (S.商路亏折 > 0 ? 0.02 : 0);
      pack.showBonus = Math.max(0, pack.showBonus);
      pack.showLog = '亮出这几年回家的银路与账面门道（成算增）';
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'm_collect', name: '折价催收旧账', cost: 1, eff: '未回款→部分现银·成算+', desc: '议亲前先把路上旧账折价催回来一些，媒人才认得手里现银。', can: true, once: true });
      }
      if ((S.供读底子 || 0) > 0) {
        pack.note += ' 这房还背着上一代留下的供读底子，女方家也会看你是不是只会跑外头账、不顾屋里往后有没有读书路。';
        pack.dossier += '｜承继供读=' + (S.供读底子 || 0) + '层';
      }
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
      pack.note = '读书路议亲看的是名分与退路：生员、童生、屡试未第或断供改路，行情并不一样。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜童试层级=' + S.童试层级 + '｜识字转业值=' + S.识字转业值 + '｜累计落第=' + (S.举业累计落第次数 || 0) + '｜累计延婚=' + (S.举业累计延婚牵扯 || 0) + '｜累计身耗=' + (S.举业累计身子亏空 || 0) + (S.生员身份 ? '｜已入泮（优免只减流出，不算现银）' : '');
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
      if ((S.供读底子 || 0) > 0) {
        pack.note += ' 上一代划下来的供读底子还在，议亲时别人也会掂量：你这一房婚后是不是还得继续把书路供下去。';
        pack.dossier += '｜承继供读=' + (S.供读底子 || 0) + '层';
      }
    }
    var inheritedPendingRent = Math.max(0, S.委托待收租谷 || 0);
    var inheritedDebt = Math.max(0, S.负债银 || 0);
    if (inheritedDebt > 0) {
      pack.baseAdj -= Math.min(0.08, inheritedDebt * 0.02);
      pack.note += (pack.note ? ' ' : '') + '议亲时还得把上一代留下的旧债一起端上桌，媒人认的是现成家底，不会把“往后慢慢还”当成白得的体面。';
      pack.dossier += (pack.dossier ? '｜' : '') + '旧债=' + inheritedDebt + '两';
    }
    if (inheritedPendingRent > 0) {
      pack.note += (pack.note ? ' ' : '') + '账上另有上一代留下的待收委托田租' + inheritedPendingRent + '石，这不是已经进仓的粮；真想拿它垫聘礼，得先把旧租催回来。';
      pack.dossier += (pack.dossier ? '｜' : '') + '待收租谷=' + inheritedPendingRent + '石';
      pack.extraActions.push({
        id: 'm_collect_rent',
        name: inheritedPendingRent > 1 ? '催回旧租·先收一石' : '催回旧租',
        cost: 1,
        eff: '待收租谷-1石·存米+1·家族+1',
        desc: '把上一代挂在账上的委托田租先催回一石，先落回米缸，再决定要不要卖粮作聘礼。',
        can: true,
        once: true
      });
    }
    return pack;
  }

  // ── 成家：多维行动点循环 —— 攒聘礼/托媒/凭路线尾账增议亲筹码 ──
  function stageMarriage() {
    var rp = marriageRoutePack();
    var bridge = lifecycleInheritanceBridge();
    var life = currentLifeProfile();
    var fertility = childbearingProfile();
    // 议亲拆成“三旬”：说合→回话→下聘。前两旬只做准备与细账，不额外耗 RNG，
    // 把唯一的“女方是否应允”roll 留在下旬，避免因为加厚阶段而改写全局随机序列。
    var step = Math.max(1, Math.min(3, Number(S.议旬) || 1));
    var stepName = step === 1 ? '说合' : (step === 2 ? '回话' : '下聘');
    var xunLabel = XUN[step - 1];
    var stepTitle = stepName + xunLabel;
    var events = [{ t: 'rel', tag: '[关系]', txt: '女方是邻村自耕农之女，有自己的意愿：她与父母看重的是这户的家底与后生的本分，不是你单方面"提亲"就能定。' }];
    if (rp.event) events.push(rp.event);
    if (bridge.event) events.push(bridge.event);
    events.push({
      t: 'rand',
      tag: '[议亲节奏]',
      txt: step === 1
        ? '这一旬先把话递出去：找媒、亮底子、跑脚回话。说合不等于点一下就成，门路与脸面也要花真钱。'
        : (step === 2
          ? '这一旬更像“回话与细账”：女方家口风、媒人转述、门包脚费、家里锅火一起挤这一口现钱。'
          : '这一旬才是真下聘：薄聘或重聘、借贷与酒席，都会一次性写进账里；女方是否应允也只在这一旬 roll。')
    });
    function scheduleMarriageRetry(log, retryLine, finalLine, familyPenaltyRetry, familyPenaltyFinal) {
      S._marriageAttempts = (S._marriageAttempts || 0) + 1;
      var nextAdj = (S._marriageAgeAdj || 0) + 2;
      var maxTries = 2; // 防止无限拖延：最多再议亲两轮（即 +4 年）
      if (S._marriageAttempts <= maxTries && (currentLifeProfile().marriageAge + 2) < (currentLifeProfile().householdAge - 2)) {
        // 重新开一轮议亲：三旬节奏清零，上一轮“说合/回话”不累加成无限成算。
        resetMarriageAttemptState();
        S._marriageAgeAdj = nextAdj;
        if ((familyPenaltyRetry || 0) > 0) S.家族 -= familyPenaltyRetry;
        curStage.next = 'marriage';
        curStage.nextLabel = '再攒两年再议亲 →';
        log.push([retryLine, 'bad']);
        return true;
      }
      resetMarriageAttemptState();
      if ((familyPenaltyFinal || 0) > 0) S.家族 -= familyPenaltyFinal;
      log.push([finalLine, 'bad']);
      return false;
    }
    return {
      title: '成家 · 议亲·' + stepTitle,
      label: '成家',
      next: step < 3 ? 'marriage' : 'family',
      nextLabel: step < 3
        ? ('续议亲·' + (step === 1 ? '回话中旬' : '下聘下旬') + ' →')
        : '成家之后 · 养家长账 →',
      ap: 4,
      // 前两旬只结“议亲细账”，不触发外部冲击，避免额外消耗 RNG 干扰回放序列。
      shock: step < 3 ? false : undefined,
      commitLabel: step < 3 ? '结这一旬议亲细账 →' : '下聘·定亲事 →',
      note: '成家不是一次"选套餐"，而是几旬里一步步攒钱、托媒、回话、再下聘：聘礼是真实外流（镜像入女方家账），媒人看的是你带到这个年纪的整本账。〔货币规模为玩法占位，非史实点值〕 ' + life.marriageLead + ' 当前按<span class="em">' + S.年龄 + '岁</span>议亲，婚后走的是<span class="em">' + fertility.label + '</span>婚育窗口。' + (step < 3 ? (' 本轮已走到<span class="em">' + stepTitle + '</span>。') : '') + (S.定额佃状态 === '已立定额佃' ? ' 上一轮你已把一两现银压进定额佃约，婚事正是沿着这本押租账往后拖。' : '') + (S.合爨状态 === '随兄合户' ? ' 眼下仍在兄户合爨；若再不另立小家，这份共账会直接被带进父故后的分家与当户。' : '') + (S.婚配路径 === '先应差·外出佣工' ? ' 上一轮你先拿现银顶过差役、又外出佣工攒回几手现钱，婚事便沿着这本外出工账继续顺延。' : '') + (bridge.note ? ' ' + bridge.note : '') + (rp.note ? ' ' + rp.note : ''),
      narrative: '立身数年，你已<span class="em">' + S.年龄 + '岁</span>，也到了议亲年纪。走"六礼"框架（平民多简化合并）——这一旬为<span class="em">' + stepTitle + '</span>，你有 <span class="em">4 个行动点</span>，用来筹聘礼、托媒人、递话回话与（下旬）下聘。你这些年攒下的<span class="em">识字、手艺、家族声望与路线尾账</span>，都会折进议亲的成算里；婚成之后，下一阶段读的也是这一路带出来的<span class="em">' + fertility.label + '</span>婚育窗口。' + (S.定额佃状态 === '已立定额佃' ? ' 这一回你不是白手重来，而是带着上一轮已经立下的定额佃押租账继续议亲。' : '') + (S.合爨状态 === '随兄合户' ? ' 若改走合爨，这一程便不是“先成婚再当户”，而是把婚配与立户原题一起拖进后面的共账清算。' : '') + (S.婚配路径 === '先应差·外出佣工' ? ' 你先前已经把一回差役和外出工账顶了过去，如今再议亲时，媒人看的也不只是现钱多少，还看这层城里落脚与工头熟识是不是能坐实。' : '') + (bridge.narrative ? (' ' + bridge.narrative) : '') + (rp.narrative ? rp.narrative : ''),
      dossier: function () {
        var bonus = Math.round(Math.max(0, (S._marriageBonus || 0)) * 100);
        var giftLabel = (S._marriageGiftTier || 0) >= 2 ? '重聘' : ((S._marriageGiftTier || 0) === 1 ? '薄聘' : '未定');
        return lifeDossier('议亲成算 = 基础 + 路线结局 + 说合/回话筹码 +（下旬）聘礼档 + 家族声望；只在下聘下旬一次性 roll。｜筹码+' + bonus + '%｜聘礼档=' + giftLabel + '｜婚配年龄=' + life.marriageAge + '｜婚育窗口=' + fertility.label + (bridge.dossier ? '｜' + bridge.dossier : '') + (rp.dossier ? '｜' + rp.dossier : ''));
      },
      events: events,
      prompt: step === 1 ? '这一旬怎么把话递出去？（分配 4 点）' : (step === 2 ? '这一旬怎么把回话与细账收住？（分配 4 点）' : '这一旬怎么下聘定亲？（分配 4 点，末了一次下聘）'),
      actions: function () {
        var A = [];
        var fixedTier = (S._marriageGiftTier || 0) > 0;
        var pickedGift = fixedTier || lifePicks.some(function (p) { return p.id === 'm_gift' || p.id === 'm_gift1'; });
        var pickedMarriageBranch = lifePicks.some(function (p) { return p.id === 'm_fixedrent' || p.id === 'm_joint' || p.id === 'm_wage_out'; });
        A.push({ id: 'm_save', name: '卖粮·攒聘礼', cost: 1, eff: '存米-1·白银+1（备聘）', desc: '把余粮换成硬通货备作聘礼。', can: S.存米 >= 1, why: S.存米 >= 1 ? '' : '无存米可卖' });
        if (step >= 3) {
          A.push({ id: 'm_gift', name: '厚备聘礼', cost: 2, eff: '白银-3·聘礼档↑↑·成算+', desc: '以银三两下重聘，风光正娶，行情最高。', can: !pickedGift && !pickedMarriageBranch && S.白银 >= 3, why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= 3 ? '' : '白银不足3两')), once: true });
          A.push({ id: 'm_gift1', name: '薄备聘礼', cost: 1, eff: '白银-1·聘礼档↑·成算+', desc: '尽力凑一份体面的薄聘。', can: !pickedGift && !pickedMarriageBranch && S.白银 >= 1, why: pickedMarriageBranch ? '本轮已改作别的婚配路数' : (pickedGift ? '本轮已定聘礼档' : (S.白银 >= 1 ? '' : '白银不足1两')), once: true });
        }
        A.push({ id: 'm_borrow', name: '向义庄借银', cost: 1, eff: '负债+3两·白银+3（供下聘）', desc: '宗族义庄借贷办婚，先成家后还债。', can: !S._marriageBorrowedForGift, why: S._marriageBorrowedForGift ? '本轮已借过银' : '', once: true });
        A.push({ id: 'm_match', name: '托媒·多方相看', cost: 1, eff: '家族+2·成算+（媒妁之言）', desc: '多走几家媒人，抬一抬相看的成算。', can: !S._marriageDidMatch, why: S._marriageDidMatch ? '本轮已托媒相看' : '', once: true });
        A.push({ id: 'm_show', name: rp.showName, cost: 1, eff: rp.showEff, desc: rp.showDesc, can: rp.showCan && !S._marriageDidShow, why: !rp.showCan ? rp.showWhy : (S._marriageDidShow ? '本轮已亮过筹码' : ''), once: true });
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
        var giftTier = (S._marriageGiftTier || 0);
        var chance = 0.35 + rp.baseAdj + (S._marriageBonus || 0);
        var borrowedForGift = !!S._marriageBorrowedForGift;
        var fixedRentChosen = false, jointChosen = false, wageOutChosen = false;
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'm_save': S.存米 -= 1; S.白银 += 1; log.push(['卖粮备聘：存米-1、白银+1', 'good']); break;
            case 'm_gift':
              if (step >= 3) {
                S.白银 -= 3;
                giftTier = 2;
                S._marriageGiftTier = 2;
                log.push(['厚备聘礼：银-3下重聘（成算大增）', 'bad']);
              }
              break;
            case 'm_gift1':
              if (step >= 3) {
                S.白银 -= 1;
                giftTier = Math.max(giftTier, 1);
                S._marriageGiftTier = Math.max(S._marriageGiftTier || 0, 1);
                log.push(['薄备聘礼：银-1（成算增）', 'bad']);
              }
              break;
            case 'm_borrow':
              S.负债银 += 3; S.白银 += 3;
              borrowedForGift = true; S._marriageBorrowedForGift = true;
              log.push(['义庄借银3两供下聘（负债+3、白银+3）', 'bad']);
              break;
            case 'm_match':
              S.家族 += 2;
              if (!S._marriageDidMatch) { S._marriageBonus = (S._marriageBonus || 0) + 0.12; S._marriageDidMatch = true; }
              log.push(['托媒多方相看：家族+2（成算增）', 'good']);
              break;
            case 'm_show':
              if (!S._marriageDidShow) { S._marriageBonus = (S._marriageBonus || 0) + rp.showBonus; S._marriageDidShow = true; }
              log.push([rp.showLog, 'good']);
              break;
            case 'm_collect':
              var owed = S.未回款银;
              var got = Math.max(1, Math.ceil(owed * 0.6));
              var lost = Math.max(0, owed - got);
              S.白银 += got; S.未回款银 = 0; if (lost > 0) S.商路亏折 += lost;
              if (!S._marriageDidCollect) { S._marriageBonus = (S._marriageBonus || 0) + 0.08; S._marriageDidCollect = true; }
              log.push(['折价催收旧账：未回款' + owed + '两里先收回白银+' + got + (lost > 0 ? '，另有' + lost + '两只得认亏' : '') + '（成算增）', 'good']);
              break;
            case 'm_collect_rent':
              if ((S.委托待收租谷 || 0) > 0) {
                S.委托待收租谷 -= 1;
                S.存米 += 1;
                S.家族 += 1;
                if (!S._marriageDidCollectRent) {
                  S._marriageBonus = (S._marriageBonus || 0) + 0.06;
                  S._marriageDidCollectRent = true;
                }
                log.push(['催回旧租一石：待收委托田租-1、存米+1、家族+1；媒人总算看见这不是悬账（成算增）', 'good']);
              }
              break;
            case 'm_copywork':
              S.铜钱 += 180;
              S._marriageBonus = (S._marriageBonus || 0) + 0.08;
              log.push(['替人抄账写契：铜钱+180，让女方家看见你不是空读书（成算增）', 'good']);
              break;
            case 'm_tutor':
              S.铜钱 += 120; S.家族 += 2;
              S._marriageBonus = (S._marriageBonus || 0) + 0.10;
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
          resetMarriageAttemptState();
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
        // 前两旬：只结细账并推进到下一旬；不做“女方是否应允”的 roll。
        if (step < 3) {
          // 议亲细碎脚费：不额外耗 RNG，只把媒人茶水/递话脚费这层小钱压回旬账。
          var handled = lifePicks.some(function (p) { return p.id === 'm_match' || p.id === 'm_show' || p.id === 'm_borrow' || p.id === 'm_save' || p.id === 'm_wait' || p.id === 'm_collect_rent'; });
          if (!handled) {
            if (spendCopper(20)) log.push(['〔递话脚费〕这一旬连托媒都没能跑通，只得先掏递话脚费与茶水钱：铜钱-20。', 'bad']);
            else { S.家族 = Math.max(0, S.家族 - 1); log.push(['〔递话脚费〕这一旬连递话脚费都腾挪不开，只得先硬顶过去；媒人这层口风更冷一线（家族-1）。', 'bad']); }
          }
          S.议旬 = step + 1;
          curStage.next = 'marriage';
          curStage.nextLabel = step === 1 ? '续议亲·回话中旬 →' : '续议亲·下聘下旬 →';
          log.push(['这一旬议亲细账已结，' + curStage.nextLabel.replace(' →', '') + '。', 'good']);
          return;
        }

        // 下聘下旬：一次性 roll
        chance += Math.min(0.10, S.家族 >= 70 ? 0.10 : 0);
        // 聘礼档只在最后一旬计入成算（避免前两旬反复切换导致“成算倒填”）
        if (giftTier === 2) chance += 0.40;
        else if (giftTier === 1) chance += 0.20;
        chance = Math.max(0.05, Math.min(0.95, chance));
        var pct = Math.round(chance * 100);
        // “借银”本身就是为下聘凑现银：若本轮未点“薄聘/重聘”，则按“薄聘”口径自动从现银里划出 1 两下聘，
        // 避免出现“明明借了银，却被判定没备聘礼”的断链。
        if (giftTier === 0 && borrowedForGift && S.白银 >= 1) {
          S.白银 -= 1;
          giftTier = 1;
          S._marriageGiftTier = 1;
          chance = Math.max(0.05, Math.min(0.95, chance + 0.18));
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
          resetMarriageAttemptState();
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
    } else if (S.路线.indexOf('徽商') === 0 || S.累计回钱银 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0 || S.商历练 > 0) {
      pack.note = '商路到当户，看的是旧账、回钱与顾不顾家，不是只看你跑过多少路。';
      pack.dossier = '累计回钱=' + (S.累计回钱银 || 0) + '两｜累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉;
      pack.event = { t: 'rand', tag: '[账期]', txt: '里甲不认“路上银”，只认你眼下能不能拿出代役钱；乡里却记得你这些年有没有寄银回家。账在外，役在乡，两头都要结。' };
      if (S.累计反哺银 >= 2) pack.baseAdj -= 0.04;
      else if ((S.累计回钱银 || 0) >= 2) pack.baseAdj -= 0.02;
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
    var bridge = lifecycleInheritanceBridge();
    if (bridge.note) pack.note += (pack.note ? ' ' : '') + bridge.note;
    if (bridge.dossier) pack.dossier += (pack.dossier ? '｜' : '') + bridge.dossier;
    if (bridge.event) pack.event = bridge.event;
    return pack;
  }

  // ── 养家：把成家到当户之间的长账拆成“四季三旬循环” ──
  // 设计目标：让单代一生在 20~40 岁之间也有“年内节奏与内容密度”，而不是一跳跳过。
  // 约束：不引入成功分/最优评分；不破坏现有守恒与不变量；尽量不额外消耗 RNG（保持回放可比）。
  function stageFamily() {
    var life = currentLifeProfile();
    var seasonIdx = Math.max(1, Math.min(FAMILY_SEASONS.length, S.家季 || 1));
    var season = familySeasonInfo(seasonIdx);
    var xun = Math.max(1, Math.min(3, S.家旬 || 1));
    var xunLabel = familyXunLabel(xun);
    var year = Math.max(1, S.家年 || 1);
    var baseStartAge = (S._marriageAtAge != null ? S._marriageAtAge : life.marriageAge) + 1;
    var targetAge = life.householdAge;
    var route = S.路线 || '';
    var nextSeason = familySeasonInfo(Math.min(FAMILY_SEASONS.length, seasonIdx + 1));
    var isYearEnd = season.id === 'winter' && xun >= 3;

    // “行情”仍保持确定性：用年份、季节、旬位交替模拟（避免额外消耗 RNG，回放更稳）。
    var priceHigh = ((year + seasonIdx + xun) % 2 === 0);
    var miPrice = (priceHigh ? 520 : 360) + farmMarketCarryBonus(); // 文/石（占位）
    var marketCost = (season.id === 'winter' ? 50 : 40);
    var marketBoostBase = (season.id === 'autumn' ? 80 : 60);
    var kitchenCost = (season.id === 'winter' ? 40 : 30);
    var dutyCost = (season.id === 'winter' ? 220 : 200);
    var mendCost = (season.id === 'summer' ? 180 : 150);
    var repairCost = season.id === 'winter' ? 120 : (season.id === 'summer' ? 100 : 80);
    var socialCost = season.id === 'autumn' ? 80 : 60;
    var xunLead = xun === 1
      ? '上旬先把这一季的主工、主账和主顾坐实。'
      : (xun === 2
        ? '中旬最像把市面、家里和孩子身上的零碎支出往一起拢。'
        : '下旬则要把差役、衣药、旧债与明年后手先收住。');

    function workProfile() {
      if (route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) {
        var mi = (xun === 1 ? 1 : 0) + (season.id === 'autumn' ? 1 : 0) + (S.农事历练 >= 3 ? 1 : 0);
        return {
          name: xun === 1 ? '守田·安排一旬农事' : (xun === 2 ? '田头换工补家计' : '修具看田收后手'),
          eff: '存米+' + Math.max(1, mi) + '·体魄-' + (xun === 3 ? 1 : 2),
          desc: xun === 1
            ? '把田头先守住，家里这一季才有口粮根脚。'
            : (xun === 2 ? '中旬常在“守田”和“换工挣现钱”之间来回挪手。' : '下旬虽像收尾，修具、看水和补田边一样算活。'),
          run: function (log) {
            var gain = Math.max(1, mi);
            S.存米 += gain;
            S.体魄 -= (xun === 3 ? 1 : 2);
            S.本年家做活 += 1;
            pushFamilySeasonTag(season.name + '·' + xunLabel + '守田');
            log.push(['守田换工：存米+' + gain + '、体魄-' + (xun === 3 ? 1 : 2), 'good']);
          }
        };
      }
      if (route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) {
        var gain = (xun === 1 ? 180 : (xun === 2 ? 150 : 130)) + (S.雇技进度 >= 2 ? 60 : (S.雇技进度 >= 1 ? 30 : 0));
        return {
          name: xun === 1 ? '续走工路' : (xun === 2 ? '抽身再接一口短工' : '把这旬工食收牢'),
          eff: '铜钱+' + gain + '·体魄-' + (xun === 3 ? 2 : 3),
          desc: xun === 1
            ? '成家后仍得靠工钱买米，先把这一旬主工坐住。'
            : (xun === 2 ? '家里和工头都来要你这双手，中旬最像把一口散钱再拢厚。' : '下旬更像收工食后手：钱不厚，却能把锅火接到下季。'),
          run: function (log) {
            S.铜钱 += gain;
            S.体魄 -= (xun === 3 ? 2 : 3);
            S.本年家做活 += 1;
            pushFamilySeasonTag(season.name + '·' + xunLabel + '工食');
            log.push(['续走工路：铜钱+' + gain + '、体魄-' + (xun === 3 ? 2 : 3), 'good']);
          }
        };
      }
      if (route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) {
        var g = (xun === 1 ? 200 : (xun === 2 ? 180 : 160)) + (S.学徒授艺度 >= 3 ? 50 : (S.学徒授艺度 >= 2 ? 25 : 0));
        return {
          name: (xun === 1 ? ((S.学徒去向 && S.学徒去向 !== '未定') ? '随铺做活' : '跑铺面谋活') : (xun === 2 ? '在铺里守柜跑街' : '把铺面脚钱收回家')),
          eff: '铜钱+' + g + '·体魄-' + (xun === 3 ? 1 : 2),
          desc: xun === 1
            ? '成家后也不算一劳永逸：柜上、街上、后仓都还要一旬一旬地熬。'
            : (xun === 2 ? '中旬最像店里和家里一齐来要你：守柜、送货、跑街全挤在这一程。' : '下旬把铺里挣出的脚钱收回家，锅火才算真续上。'),
          run: function (log) {
            S.铜钱 += g;
            S.体魄 -= (xun === 3 ? 1 : 2);
            S.本年家做活 += 1;
            pushFamilySeasonTag(season.name + '·' + xunLabel + '铺面');
            log.push(['铺面做活：铜钱+' + g + '、体魄-' + (xun === 3 ? 1 : 2), 'good']);
          }
        };
      }
      if (route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) {
        var cg = (xun === 1 ? 170 : (xun === 2 ? 150 : 130)) + (S.识货进度 >= 2 ? 40 : 0) + (S.账房进度 >= 2 ? 30 : 0);
        return {
          name: xun === 1 ? '照应商计' : (xun === 2 ? '看账走市补现钱' : '把这旬商路后手收住'),
          eff: '铜钱+' + cg + '·体魄-' + (xun === 3 ? 1 : 2),
          desc: xun === 1
            ? '不是每一旬都能“回钱”。先把账与门路照住，才有后头的翻身。'
            : (xun === 2 ? '中旬看的是“账在路上时家里怎么活”：脚钱、米价、孩子衣药一起撞来。'
              : '下旬最像把旧账、回钱和家里后手先捋直，不让它拖到下一季再炸。'),
          run: function (log) {
            S.铜钱 += cg;
            S.体魄 -= (xun === 3 ? 1 : 2);
            S.本年家做活 += 1;
            pushFamilySeasonTag(season.name + '·' + xunLabel + '商计');
            log.push(['照应商计：铜钱+' + cg + '、体魄-' + (xun === 3 ? 1 : 2), 'good']);
          }
        };
      }
      var teach = (xun === 1 ? 150 : (xun === 2 ? 170 : 140)) + (S.生员身份 ? 60 : 20);
      return {
        name: xun === 1 ? (S.生员身份 ? '设馆授徒' : '抄写馆课') : (xun === 2 ? '代写文契抄录' : '把笔墨钱收回家里'),
        eff: '铜钱+' + teach + '·体魄-' + (xun === 3 ? 1 : 2),
        desc: xun === 1
          ? '举业路成家后的家计，往往靠教馆、誊抄与师门人情撑着。'
          : (xun === 2 ? '中旬最像把识字底子换成一点现钱：代写、誊录、看账都算。'
            : '下旬要把纸墨换来的这点钱真正拢回家，不然就只是体面话。'),
        run: function (log) {
          S.铜钱 += teach;
          S.体魄 -= (xun === 3 ? 1 : 2);
          S.本年家做活 += 1;
          pushFamilySeasonTag(season.name + '·' + xunLabel + '笔墨活');
          log.push(['笔墨营生：铜钱+' + teach + '、体魄-' + (xun === 3 ? 1 : 2), 'good']);
        }
      };
    }

    function familyRoutePack() {
      var pack = { note: '', dossier: '', event: null, extraActions: [] };
      if (route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) {
        pack.note = '留乡佃田到了养家年，也不该只剩“守田、卖米、年末结账”三步。佃例、水口、换工、租话、谷种、仓脚与锅火，都会在同一年里一旬一旬冒头。';
        pack.dossier = '农事历练=' + S.农事历练 + '｜家传农事=' + (S.家传农事 || 0) + '｜定额佃=' + S.定额佃状态 + '｜婚配路径=' + S.婚配路径 + '｜人情欠条=' + (S.人情欠条 || 0);
        pack.event = {
          t: 'rel',
          tag: '[田面]',
          txt: season.id === 'summer' && xun === 2
            ? '伏夏中旬最怕的是人还在田头，草绳、凉药、挑水脚路和孩子汗热已经一起找上门；这一旬先顾哪口小钱，会直接改写整季的口粮后手。'
            : (season.id === 'autumn' && xun === 3
              ? '秋后下旬看着像“谷已进仓”，其实租谷、差票、借粮旧账和锅火才刚开始咬同一份家底。'
              : (season.id === 'winter' && xun === 1
                ? '冬藏上旬最怕把“仓里还有几石”误写成“明春自然能下种”。谷种、仓脚、修渠钱和年下小礼，都得在今冬先分开。'
                : (xun === 2
                  ? '这一旬最像把田面上的收成拆回家里：哪口留锅火、哪口留籽种、哪口先顶租谷或差钱，都是真账。'
                  : '养家后的农路不只是在田里出力，还得先问清佃例、水口和乡里口风，免得一家人都跟着田面一起吃生。')))
        };
        if (xun === 1) {
          pack.extraActions.push({
            id: 'f_route_farm_note',
            name: season.id === 'spring'
              ? '先问佃例与水口'
              : (season.id === 'summer'
                ? '先托邻保水口'
                : (season.id === 'autumn' ? '先问今年租话与米路' : '年关先点谷种与仓脚')),
            cost: 1,
            eff: (season.id === 'spring' || season.id === 'autumn')
              ? '铜钱-30·问价+1·通融+1·家族+1'
              : ('铜钱-' + (season.id === 'summer' ? 40 : 35) + '·通融+1·家族+1'),
            desc: season.id === 'spring'
              ? '先把今春佃例、水口和哪处田埂要先补问明。钱没有变多，却少一层“到地头才发现还没说定”的生亏。'
              : (season.id === 'summer'
                ? '伏夏先托邻里和看水的人把哪段水口最紧、哪家肯替你搭一手说明，后面顾田、照家和凉药钱才不至一起乱。'
                : (season.id === 'autumn'
                  ? '秋里先问清今年租话怎么说、米路往哪条市集去，后面拆租谷、留锅火和应差票才不至瞎碰。'
                  : '年关先把谷种要留几成、仓脚哪处先补、修渠钱与小礼怎么分明。它不生现钱，却能让明春第一口粮不至乱。')),
            can: S.铜钱 >= (season.id === 'summer' ? 40 : (season.id === 'winter' ? 35 : 30)),
            why: S.铜钱 >= (season.id === 'summer' ? 40 : (season.id === 'winter' ? 35 : 30))
              ? ''
              : ('铜钱不足' + (season.id === 'summer' ? 40 : (season.id === 'winter' ? 35 : 30)) + '文')
          });
        }
        if (xun === 2) {
          pack.extraActions.push({
            id: 'f_route_farm_split',
            name: season.id === 'spring'
              ? '把春钱拆作籽种与锅火'
              : (season.id === 'summer'
                ? '把伏夏钱拆作凉药与草绳'
                : (season.id === 'autumn' ? '把秋粮拆作纳租与锅火' : '把冬钱拆作灯油与明春谷种')),
            cost: 1,
            eff: season.id === 'autumn'
              ? '存米-1·贴家+1·备役+1·家族+2'
              : (season.id === 'summer'
                ? '铜钱-80·贴家+1·衣药+1·家族+1'
                : (season.id === 'winter'
                  ? '铜钱-90·贴家+1·修缮+1·家族+1'
                  : '铜钱-100·贴家+1·照家+1·家族+2')),
            desc: season.id === 'spring'
              ? '春钱最怕被一句“回头再买籽种”拖散。先把一口钱拆成籽种与锅火，后面田头和家里都不至空等。'
              : (season.id === 'summer'
                ? '伏夏这口钱最怕整手花掉。你先拆给凉药、草绳和家用，少让家里与田头同时被热耗磨穿。'
                : (season.id === 'autumn'
                  ? '秋粮进手后，不先拆开就会看着“仓里有粮”却转头哪口都不够。先留一石顶租谷与锅火，家里和差钱都能缓一线。'
                  : '冬钱看着只是灯油与谷种的小事，可若不先拆开，明春下种前往往最先断的就是这口后手。')),
            can: season.id === 'autumn' ? (S.存米 >= 1) : (S.铜钱 >= (season.id === 'summer' ? 80 : (season.id === 'winter' ? 90 : 100))),
            why: season.id === 'autumn'
              ? (S.存米 >= 1 ? '' : '存米不足1石')
              : (S.铜钱 >= (season.id === 'summer' ? 80 : (season.id === 'winter' ? 90 : 100))
                ? ''
                : ('铜钱不足' + (season.id === 'summer' ? 80 : (season.id === 'winter' ? 90 : 100)) + '文'))
          });
        }
        if (xun === 3) {
          pack.extraActions.push({
            id: 'f_route_farm_store',
            name: season.id === 'spring'
              ? '先记换工与佃账'
              : (season.id === 'summer'
                ? '托邻代浇并留秋租后手'
                : (season.id === 'autumn' ? '先把租谷与差票分开收住' : '先把修渠钱与年礼分开')),
            cost: 1,
            eff: '铜钱-' + (season.id === 'summer' ? 50 : (season.id === 'autumn' ? 60 : (season.id === 'winter' ? 50 : 40))) + '·通融+1·备役+1·家族+1',
            desc: season.id === 'spring'
              ? '把这一季换工、欠工、佃账与口粮账先记清。识字也好、不识字也罢，总得先把哪口是自家、哪口是租例压在手里。'
              : (season.id === 'summer'
                ? '先托邻里搭一手看水，把秋后租谷和家里这口锅火的后手提前压一线，免得热里一乱，到了秋里才发现两头都空。'
                : (season.id === 'autumn'
                  ? '秋后最怕“谷在仓里、差票在门外”。先把租谷和差票分开收住，这一房的现钱与口粮就不至转身全乱。'
                  : '年下修渠钱、小礼和来春第一口杂支若不先分开，看着不大，最容易把明春起手这一下先绊住。')),
            can: S.铜钱 >= (season.id === 'summer' ? 50 : (season.id === 'autumn' ? 60 : (season.id === 'winter' ? 50 : 40))),
            why: S.铜钱 >= (season.id === 'summer' ? 50 : (season.id === 'autumn' ? 60 : (season.id === 'winter' ? 50 : 40)))
              ? ''
              : ('铜钱不足' + (season.id === 'summer' ? 50 : (season.id === 'autumn' ? 60 : (season.id === 'winter' ? 50 : 40))) + '文')
          });
        }
      } else if (route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) {
        pack.note = '商路成家后最磨人的，不是“这一程赚没赚”，而是银在路上时家里这一旬怎么过。';
        pack.dossier = '累计回钱=' + (S.累计回钱银 || 0) + '两｜累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉;
        pack.event = { t: 'rand', tag: '[商路]', txt: (season.id === 'spring' && xun === 3)
          ? '春起下旬最像把“问来的路数”真拆成家里日用：春路回钱、清明香纸、熟号门包、孩子纸包与锅火后手会在这一旬一起追钱，哪口先拆给哪边都不能再糊成一句“回头再说”。'
          : (season.id === 'autumn' && xun === 2)
            ? '秋收中旬最磨人的不是“有没有回钱”，而是回钱脚单、锅火、牙税、差票回话和供读纸包后手一起先来抢这一口现钱。'
          : (season.id === 'winter' && xun === 2)
            ? '冬藏中旬看着像收住，实际最怕一口回钱被年关锅火、明春脚费和差钱一起抢空；你若不先拆账，明春还没到，现钱先薄。'
            : ((season.id === 'winter' && xun === 3)
              ? '冬藏下旬最怕的是人先歇下去，路数却没留：哪家熟号肯替你压一程水脚、哪笔旧账要等明春再讨，都得在今冬先摸明。'
              : (xun === 2
                ? '这一旬最像“在外回钱”和“家里等钱”正撞在一起：托谁带银、先留哪笔脚费，都是真账。'
                : (xun === 3
                  ? '下旬最怕旧账还压在路上：孩子要衣药、里甲要差钱，路上的银却未必赶得回来。'
                  : '春起先看的是门路和账本还在不在，不是先看今年能不能翻大钱。'))) };
        if (xun === 1) {
          pack.extraActions.push({
            id: 'f_route_letter',
            name: '托客脚捎家书问账',
            cost: 1,
            eff: '铜钱-40·捎信问账·下旬催款更稳',
            desc: '不是空写一封家书，而是先把哪笔货还在路上、哪位旧识还认这层面子问清。钱未回，账先被拢住。',
            can: S.铜钱 >= 40,
            why: S.铜钱 >= 40 ? '' : '铜钱不足40文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_spring_price',
              name: '先托熟号回问米价与旧账',
              cost: 1,
              eff: '铜钱-30·问价+1·捎信+1·家族+1',
              desc: '春起最怕两边都各猜各的：先托熟号把家里米价、路上旧账和哪边更急的一口问清，后面不管是催回现钱还是先拆家用，都不至盲着下手。',
              can: S.铜钱 >= 30,
              why: S.铜钱 >= 30 ? '' : '铜钱不足30文'
            });
            pack.extraActions.push({
              id: 'f_route_spring_packet',
              name: '先把样纸门包与回话脚费分开',
              cost: 1,
              eff: '铜钱-50·问价+1·捎信+1·通融+1',
              desc: '春起最先磨人的不是大账，而是样纸门包、回话脚费和柜上零碎一起冒头。你先把这层小耗拆开，后头家里等钱与外头问路才不会一起抓瞎。',
              can: S.铜钱 >= 50,
              why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
            });
            pack.extraActions.push({
              id: 'f_route_spring_child_note',
              name: '先把春头孩子纸样与回乡药单分开',
              cost: 1,
              eff: '铜钱-45·衣药+1·供读+1·捎信+1·家族+1',
              desc: '春起最怕外头熟号刚有一点回音，孩子纸样、回乡药单、递话脚费和锅火小耗就先一起冒头。你先把这层家内读写与春寒药单拆开，不让春头第一口现钱同时被旧账、孩子和锅火抢空。',
              can: S.铜钱 >= 45,
              why: S.铜钱 >= 45 ? '' : '铜钱不足45文'
            });
          }
        }
        if (season.id === 'summer' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_wharf',
            name: '先问水脚与行栈路数',
            cost: 1,
            eff: '铜钱-50·问价+1·通融+1',
            desc: '伏夏商路最怕“银在路上、货压在栈里”。先把哪条水脚更稳、哪家行栈肯暂压一程问清，后面催账和回钱才不是瞎撞。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_home_note',
            name: '先把家书药单与柜边回帖分开',
            cost: 1,
            eff: '铜钱-55·衣药+1·捎信+1·供读+1·家族+1',
            desc: '伏夏刚起时，最怕家书药单、柜边回帖、带话脚费和孩子纸样一起冒头。你先把这层家内读写和柜边回帖拆开，不让行栈路数、家里凉药和孩子纸样继续抢同一口现钱。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_heat',
            name: '先把自己汗药与孩子热包分开',
            cost: 1,
            eff: '铜钱-65·衣药+1·将养+1·捎信+1·家族+1',
            desc: '伏夏刚起时，最怕自己汗药、孩子热包、递话脚费和行中茶钱一起冒头。你先把这层身上伏热与家里小热拆开，不让商路开头这一口现钱既顾自己别倒、又顾孩子凉热时继续混成一团。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_register',
            name: '先把伏夏差帖与柜边回帖分开',
            cost: 1,
            eff: '铜钱-60·备役+1·捎信+1·通融+1·家族+1',
            desc: '伏夏刚起时，最怕差帖门包、柜边回帖、递话脚费和孩子纸样一起冒头。你先把这层差帖与回帖拆开，不让行栈路数才刚问上，里甲门上的制度后手和家里读写碎账就先抢同一口现钱。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_cool',
            name: '先把行栈茶钱与家里凉药分开',
            cost: 1,
            eff: '铜钱-60·衣药+1·捎信+1·通融+1',
            desc: '伏夏开头最怕哪条水脚能走还没问稳，行栈茶钱、带话脚费和家里凉药却先一起冒头。你先把这口小钱拆开，后头催账与捎布药才不至两头都空。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_ledger',
            name: '先把伏夏回签与行栈账单分开',
            cost: 1,
            eff: '铜钱-50·问价+1·捎信+1·通融+1',
            desc: '伏夏最怕上一程回签还没回稳，行栈账单、带话脚费和家里凉药就先一起冒头。你先把这层回签账拆开，后头捎布药、问水脚与催旧账才不至拿同一口现钱四处堵漏。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
        }
        if (season.id === 'summer' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_summer_guest',
            name: '先把夏尾客签与秋前样纸分开',
            cost: 1,
            eff: '铜钱-60·捎信+1·通融+1·家族+1',
            desc: '伏夏收尾最怕秋路未开，客签回话、秋前样纸、递话门包和过路药包却先一起找上门。你先把这层秋前后手拆开，不让同一口现钱既顾夏尾锅火、又顾秋前脚路。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
        }
        if (season.id === 'autumn' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_autumn_quote',
            name: '抄牙价认秋市',
            cost: 1,
            eff: '铜钱-40·问价+1',
            desc: '秋里货价活，先把哪口货正热、哪口货已回落抄清，后头拆账、催账和贴家才有准头。',
            can: S.铜钱 >= 40,
            why: S.铜钱 >= 40 ? '' : '铜钱不足40文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_packet',
            name: '先把秋样脚单与回乡药包分开',
            cost: 1,
            eff: '铜钱-70·问价+1·衣药+1·捎信+1·家族+1',
            desc: '秋头最怕刚闻到市热，牙样脚单、回乡带话和家里布药就先一起冒头。你先把这层碎账拆开，后面抄价、贴家和催回钱才不至拿同一口现钱四处堵漏。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_clothes',
            name: '先把秋头差帖与孩子夹衣分开',
            cost: 1,
            eff: '铜钱-65·衣药+1·备役+1·通融+1·家族+1',
            desc: '秋凉刚起时，最怕差帖门包、孩子夹衣、回乡药包和递话脚费一起先来。你先把这层秋头夹衣拆开，秋市刚热时就不至让制度后手和家里换季小耗一并抢空现钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_receipt',
            name: '先把秋头回签与牙帖脚费分开',
            cost: 1,
            eff: '铜钱-50·问价+1·捎信+1·通融+1',
            desc: '秋市刚热，最怕牙帖脚费、回签小纸、带话脚费和家里锅火一起先来要钱。你先把秋头回签拆开，后头抄价、回乡药包和催单脚路才不至混成一句“等货回了再说”。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
        }
        if (season.id === 'autumn' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_autumn_gate',
            name: '先把秋尾回话与差票门包分开',
            cost: 1,
            eff: '铜钱-55·备役+1·通融+1·家族+1',
            desc: '秋尾最怕秋钱看着将回，差票门包、递话脚费和锅火后手却先一起压来。你先把这层门包碎账拆开，秋市尾声就不至还没进冬就先被制度和家用一齐啃薄。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
          });
        }
        if (xun === 2) {
          pack.extraActions.push({
            id: 'f_route_remit',
            name: '托脚带银回乡',
            cost: 1,
            eff: '现钱外流·家族+3~4·回钱路继续坐实',
            desc: '趁脚路还在，把一手现钱先托人带回家。不是白给加分，而是真把“外头挣钱、家里续锅火”落到账上。',
            can: S.白银 >= 1 || S.铜钱 >= 180,
            why: (S.白银 >= 1 || S.铜钱 >= 180) ? '' : '现钱不够托脚带银'
          });
          pack.extraActions.push({
            id: 'f_route_split',
            name: '先分脚费留家兼备差',
            cost: 1,
            eff: '现钱外流·家族+2~3·备役+1',
            desc: '不把这一口现钱整手捎走，而是先分一段给家里续锅火，再留一段作差役后手。同一笔钱，这一旬就被家计和制度一起吃住。',
            can: S.白银 >= 1 || S.铜钱 >= 220,
            why: (S.白银 >= 1 || S.铜钱 >= 220) ? '' : '现钱不够分作家用与备差'
          });
        }
        if (season.id === 'spring' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_spring_ritual',
            name: '先把清明香纸与回话脚费分开',
            cost: 1,
            eff: '铜钱-60·贴家+1·捎信+1·家族+1',
            desc: '春中最怕清明香纸、回话脚费和柜边包纸一起冒头。你先把这一口拆开，家里等钱时不至连春礼和带话都一起失手。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_spring_mid_reply',
            name: '先把春中回签与孩子纸样分开',
            cost: 1,
            eff: '铜钱-65·捎信+1·通融+1·供读+1·家族+1',
            desc: '春中最怕熟号回签、孩子纸样、递话门包和清明后手一起冒头。你先把这层春中回签拆开，不让“钱像快回了”这一口现钱先被孩子读写、门包与节前锅火一并抢空。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
        }
        if (season.id === 'winter' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_winter_coal',
            name: '先留炭钱与来春样纸定钱',
            cost: 1,
            eff: '铜钱-80·衣药+1·备役+1·问价+1',
            desc: '冬藏中旬最怕炭钱、来春样纸定钱和差钱一起吃同一口现钱。你先把炭钱与样纸定钱拆开，年关和明春都不至一并断线。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_split',
            name: '把年关回钱拆作锅火与脚费',
            cost: 1,
            eff: '现钱外流·贴家+1·备役+1·捎信+1',
            desc: '年关最怕把一口回钱整手握死。你先拆一截续锅火，再留一截作明春脚费与差钱后手，免得明春第一程还没开，家里现钱先断。',
            can: S.白银 >= 1 || S.铜钱 >= 200,
            why: (S.白银 >= 1 || S.铜钱 >= 200) ? '' : '现钱不够拆作锅火与脚费'
          });
          pack.extraActions.push({
            id: 'f_route_winter_clear',
            name: '先把清账回话与柜边门包分开',
            cost: 1,
            eff: '铜钱-70·捎信+1·通融+1·问价+1',
            desc: '冬藏中旬最怕旧账回话、柜边门包、递话小礼和样纸定钱一起先来磨这一口现钱。你先把清账回话拆开，年关这层“账快回了、钱还没落手”的碎耗就不会再混成一团。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
        if (season.id === 'winter' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_winter_medicine',
            name: '先把冬头炭药与差票门包分开',
            cost: 1,
            eff: '铜钱-65·衣药+1·捎信+1·通融+1',
            desc: '冬藏刚起头时，最怕炭米、年下药包、熟号递话脚费和差票门包一起压向同一口现钱。你先把这层冬头炭药拆开，锅火、身子与来春路数才不至一开冬就互相抢钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
        }
        if (season.id === 'summer' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_bundle',
            name: '托熟号捎布药回家',
            cost: 1,
            eff: '铜钱-120·贴家+1·衣药+1·家族+2',
            desc: '不只捎钱，也捎夏里最缺的布、药和零碎针线。钱离手得更细，但家里这旬少一层病耗与干等。',
            can: S.铜钱 >= 120,
            why: S.铜钱 >= 120 ? '' : '铜钱不足120文'
          });
          pack.extraActions.push({
            id: 'f_route_sample',
            name: '先把样纸门包与回程脚费分开',
            cost: 1,
            eff: '铜钱-70·问价+1·衣药+1·家族+1',
            desc: '伏夏里样纸、门包、回程脚费和家里布药最容易一起冒头。你先把它们拆开，不让“银还在路上”先把家里这一旬磨空。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
          pack.extraActions.push({
            id: 'f_route_summer_packet',
            name: '先把柜边回帖与孩子纸样分开',
            cost: 1,
            eff: '铜钱-65·捎信+1·通融+1·供读+1',
            desc: '伏夏中旬最怕柜边回帖、孩子纸样、递话脚费和锅火凉药一起冒头。你先把这层纸样与回帖拆开，不让商路反哺、家里读写和伏夏锅火抢同一口现钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
        }
        if (season.id === 'autumn' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_autumn_split',
            name: '秋货回钱先拆锅火与牙税',
            cost: 1,
            eff: '现钱外流·贴家+1·备役+1',
            desc: '秋里这口钱最容易被误当成“有了就宽”。你先拆一截续锅火，再留一截应付牙税和差役，免得一口钱拖累两头。',
            can: S.白银 >= 1 || S.铜钱 >= 240,
            why: (S.白银 >= 1 || S.铜钱 >= 240) ? '' : '现钱不够拆作锅火与牙税'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_mid_reply',
            name: '先把秋中回签与锅火脚费分开',
            cost: 1,
            eff: '铜钱-55·贴家+1·捎信+1·通融+1',
            desc: '秋中最怕回签小纸、锅火脚费、差票回话和供读纸包后手一起先来抢钱。你先把秋中回签拆开，让这口“将回未回”的现钱不至一转身就被家用、制度和孩子纸包同时啃薄。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_mid_clothes',
            name: '先把秋中回签与孩子夹衣分开',
            cost: 1,
            eff: '铜钱-60·衣药+1·捎信+1·通融+1·家族+1',
            desc: '秋凉真正压到身上时，最怕熟号回签、孩子夹衣、递话脚费和锅火后手一起先来。你先把这层秋中夹衣拆开，不让“钱像快回了”这一口现钱先被换季穿用和家内碎账磨薄。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
        }
        if (season.id === 'autumn' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_receipt',
            name: '先抄回钱脚单与拖欠次序',
            cost: 1,
            eff: '铜钱-50·捎信+1·问价+1·通融+1',
            desc: '秋里最怕“明明该回的钱还在路上”，却没人知道先催哪笔、哪笔还能压一旬。你先把脚单、回话和拖欠次序抄明，后头的钱路才不会继续糊着走。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_tail',
            name: '先把秋尾回话脚费与供读纸包分开',
            cost: 1,
            eff: '铜钱-60·捎信+1·通融+1·备役+1',
            desc: '秋尾最怕“钱将回未回”，催单回话、差票门包、孩子纸包和锅火却先一起冒头。你先把这层末尾小账拆开，年关前这一房就不至只剩一句“再等等”。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_autumn_body',
            name: '先把秋尾药包与回话脚费分开',
            cost: 1,
            eff: '铜钱-35·体魄+1·衣药+1·家族+1',
            desc: '秋凉一起，跑单回来的人和家里孩子都容易先咳起来。你若先把药包、姜糖和回话脚费拆开，这一旬就不必让门包与药钱继续挤在同一口现钱里。',
            can: S.铜钱 >= 35,
            why: S.铜钱 >= 35 ? '' : '铜钱不足35文'
          });
        }
        if (season.id === 'summer' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_summer_reply',
            name: '先把夏尾回话脚费与柜边包纸分开',
            cost: 1,
            eff: '铜钱-60·捎信+1·通融+1·衣药+1',
            desc: '伏夏下旬最怕柜边包纸、回客话脚费、凉药锅火和催账门包一起压来。你先把夏尾回话拆开，后面回钱未必立刻到手，家里和熟号却不至先断口风。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
        }
        if (xun === 3 && S.未回款银 > 0) {
          pack.extraActions.push({
            id: 'f_route_collect',
            name: '催回在路旧账',
            cost: 1,
            eff: '未回款→部分现银·后手更稳',
            desc: '不是把旧账凭空变现，而是折价、催讨，先把眼前最要紧的一口钱拢回来。',
            can: true,
            once: true
          });
        }
        if (season.id === 'winter' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_winter_book',
            name: '年关对账并先留明春本钱',
            cost: 1,
            eff: '铜钱-60·捎信问账·备役+1',
            desc: '年关先把回乡账簿和明春本钱分开，哪笔仍在路上、哪笔得先留作开春与差役后手，先在今冬说清，不等明春再乱。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_guest_gift',
            name: '先备熟号薄礼与回话脚费',
            cost: 1,
            eff: '铜钱-70·家族+1·通融+1·捎信+1',
            desc: '年关前熟号、脚夫与带话人的薄礼若一并省掉，明春常常就得从头求人。你先把这层小钱记下，不让门路到冬里忽然断线。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
        if (season.id === 'spring' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_spring_bundle',
            name: '先把春钱拆作盐药与锅火',
            cost: 1,
            eff: '铜钱-110·贴家+1·衣药+1·家族+2',
            desc: '春起下旬不只怕旧账未回，也怕家里盐、药和零碎锅火先断。先把春钱拆回去，后头再跑市与催账，家里才不至整旬空等。',
            can: S.铜钱 >= 110,
            why: S.铜钱 >= 110 ? '' : '铜钱不足110文'
          });
          pack.extraActions.push({
            id: 'f_route_spring_reply',
            name: '先把春尾回话脚费与催账门包分开',
            cost: 1,
            eff: '铜钱-70·贴家+1·捎信+1·通融+1',
            desc: '春尾最怕的是家里还等旧账回话，催账门包、带话脚费和锅火却先撞上来。你先把这层小钱拆开，不让“快回来了”只停在嘴上。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
        if (xun === 3) {
          pack.extraActions.push({
            id: 'f_route_school',
            name: '另划一手供读专账',
            cost: 1,
            eff: '白银-1·供读专账+1·家族+2',
            desc: '把这一季手里现银另划一两，不和日用、差役、旧债混作一处。它不会立刻变成“成功”，却会改变后面一房怎么继续过下去。',
            can: S.白银 >= 1 && (S.商路供读银 || 0) < 2,
            why: S.白银 >= 1
              ? ((S.商路供读银 || 0) < 2 ? '' : '这一房供读专账已先留过两手')
              : '白银不足1两',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 3) {
          pack.extraActions.push({
            id: 'f_route_winter_wharf',
            name: '托熟号订明春水脚',
            cost: 1,
            eff: '铜钱-50·问价+1·通融+1·捎信+1',
            desc: '趁年关熟号还在，先把明春哪条水脚肯接、哪层脚路能压一程摸明。它不立刻变现，却能让来年第一旬不至重新瞎撞。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_guest_sign',
            name: '先把柜边回签与递话门包分开',
            cost: 1,
            eff: '铜钱-60·捎信+1·通融+1·家族+1',
            desc: '冬尾最怕柜边回签、递话门包、来春客账次序和锅火后手一起冒头。你先把这层柜签拆开，熟号回音和明春客账就不必再挤在同一口现钱里。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_packet',
            name: '先把熟号回签与孩子纸包分开',
            cost: 1,
            eff: '铜钱-65·家族+1·捎信+1·通融+1·供读+1',
            desc: '冬尾最怕熟号回签、孩子纸包、递话脚费和来春样纸定钱一起冒头。你先把这一口小钱拆开，门路、孩子纸墨与明春样纸就不必再抢同一口锅火钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_receipt',
            name: '先把年下回签与来春样纸分开',
            cost: 1,
            eff: '铜钱-65·捎信+1·通融+1·家族+1',
            desc: '冬尾最怕年下回签、来春样纸定钱、递话脚费和锅火后手一起压来。你先把年下回签拆开，冬尾这口现钱才不至既顾熟号口风，又顾来春头程。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_stamp',
            name: '先把明春牙帖脚费与熟号回签分开',
            cost: 1,
            eff: '铜钱-55·问价+1·备役+1·家族+1',
            desc: '冬尾最怕明春牙帖脚费、熟号回签、递话门包和样纸小账一起挤上来。你先把这层开春认牙的脚费拆开，不让第一笔货还没问价，门路和家里就先被碎账磨薄。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_reply',
            name: '先把年下回话、炭药与客账次序分开',
            cost: 1,
            eff: '铜钱-70·衣药+1·捎信+1·通融+1',
            desc: '冬尾最怕“熟号说会回话、家里也还能熬几天”这两句话都停在空里。你先把年下回话脚费、炭药和来春客账次序分开，不让明春未到就先断口风。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
          pack.extraActions.push({
            id: 'f_route_winter_copy',
            name: '先把冬尾帖样与孩子帖样分开',
            cost: 1,
            eff: '铜钱-60·家族+1·捎信+1·通融+1·供读+1',
            desc: '冬尾最怕柜边客账帖样、孩子来春帖样、递话门包和锅火后手一起冒头。你先把这层帖样拆开，不让熟号回音、家里读写与年火继续抢同一口现钱。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
        }
      } else if (route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) {
        var settledShopkeeper = S.学徒去向 === '留店伙计';
        pack.note = '学徒路成家后也不只是“在铺里站着”：铺里脚钱能不能捎回家、师门旧识还认不认你、哪一口人情能先替你打听差役，都会改写这一旬家计。现在连春头回铺回签、伏夏布药与回铺回签、夏尾回签与秋前样纸、秋里脚钱拆账与秋中回铺回签、秋尾回铺脚费与灯油针线、年关铺账与冬尾回铺回签，也继续拆回同一年里逐旬结算。';
        if (settledShopkeeper) pack.note += ' 若已在柜上站稳，春头柜簿、伏夏柜边零耗与年关值柜夜账，也会跟着铺账一起往回咬，成年后不再只有“铺里熟面”这句大话。';
        pack.dossier = '学徒去向=' + S.学徒去向 + '｜授艺度=' + S.学徒授艺度 + '｜学徒历练=' + S.学徒历练;
        var apprenticeEventTxt;
        if (settledShopkeeper && season.id === 'spring' && xun === 1) {
          apprenticeEventTxt = '留店伙计开春先怕的已不只是“掌柜还认不认你”，而是柜上记名、灯草门包和家里锅火会一起找同一口现钱；柜簿若不先拆，熟面也会被零耗磨薄。';
        } else if (settledShopkeeper && season.id === 'summer' && xun === 2) {
          apprenticeEventTxt = '伏夏中旬你明明还站在柜边，凉茶、脚夫点心、孩子布票和回乡门包却会一起往这一旬的脚钱上咬；留店伙计的成年日子，磨人的正是这些柜边细耗。';
        } else if (settledShopkeeper && season.id === 'winter' && xun === 1) {
          apprenticeEventTxt = '年关柜上最怕值夜灯炭、守岁炭药、明春脚路和差役后手一起压来；若不先把柜头夜账分开，旧铺熟面到了年关也会先被现实磨空。';
        } else if (season.id === 'summer' && xun === 2) {
          apprenticeEventTxt = '伏夏最怕的是人还站在铺里，家里却先缺了布药和针线；这一旬脚钱、布药和家口细耗会一起冒头。';
        } else if (season.id === 'autumn' && xun === 2) {
          apprenticeEventTxt = '秋里脚钱看着比夏里厚些，可回铺回签、锅火、差钱和年关后手也正一齐来抢；不先拆账，就很容易误当“这一旬终于宽了”。';
        } else if (season.id === 'winter' && xun === 1) {
          apprenticeEventTxt = '年关先要分清哪笔脚钱仍压在铺里、哪笔该留作明春脚路与差役后手；铺账不先理，明春就会拿同一口现钱连着撞墙。';
        } else if (xun === 2) {
          apprenticeEventTxt = '这一旬最像“铺里脚钱怎么回家”：你若真在城里站住过，带回家的不只是钱，还有门路。';
        } else if (xun === 3) {
          apprenticeEventTxt = '下旬更像把旧掌柜、同门和铺里零碎脚钱一起翻出来：哪口钱先结、哪口人情先用，都是真后手。';
        } else {
          apprenticeEventTxt = '成家后仍吃铺里这碗饭，最怕的是家里只知道你在外头忙，却看不见哪笔钱真回来了。';
        }
        pack.event = { t: 'rel', tag: '[铺面]', txt: apprenticeEventTxt };
        if (xun === 1) {
          pack.extraActions.push({
            id: 'f_route_shop_note',
            name: '托旧同门捎口信问铺账',
            cost: 1,
            eff: '铜钱-30·捎信问铺账·家族+1',
            desc: '先托旧同门问清这季铺里哪笔脚钱可捎、哪笔杂支还压着。钱还没到手，但家里不会两眼一抹黑地空等。',
            can: S.铜钱 >= 30,
            why: S.铜钱 >= 30 ? '' : '铜钱不足30文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_shop_spring_head_reply',
              name: '先把春头回铺回签与灯油门包分开',
              cost: 1,
              eff: '铜钱-55·衣药+1·捎信+1·通融+1·家族+1',
              desc: '春头最怕旧掌柜回签、灯油门包、递话脚费和灶下锅火一起先来。你先把这层春头铺签拆开，不让“铺里也许快有回音了”又被家里的灯油锅火和回铺脚路先吃成空话。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
            if (settledShopkeeper) {
              pack.extraActions.push({
                id: 'f_route_shop_spring_counter',
                name: '先把春头柜簿与灯草门包分开',
                cost: 1,
                eff: '铜钱-65·捎信+1·通融+1·备役+1·家族+1',
                desc: '留店伙计开春最怕柜上记名、灯草门包、递话脚费和家里锅火一起找同一口现钱。你先把柜簿这一层值柜细账拆开，不让“还能在柜上站得住”先被灯草门包和差役脚费磨薄。',
                can: S.铜钱 >= 65,
                why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
              });
            }
          }
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_shop_summer_head_reply',
              name: '先把伏夏回铺回签与茶汤药脚分开',
              cost: 1,
              eff: '铜钱-60·衣药+1·捎信+1·通融+1·家族+1',
              desc: '伏夏一上来最怕旧掌柜回签、铺里茶汤、凉药脚费和递话门包一起先找钱。你先把这层伏夏铺签拆开，不让“人还在铺里这层熟面”又和家里的药脚锅火抢同一口现钱。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_shop_autumn_packet',
              name: '先把秋头脚单与孩子布药分开',
              cost: 1,
              eff: '铜钱-70·贴家+1·衣药+1·通融+1·家族+1',
              desc: '秋头最怕刚闻到市热，回铺脚单、孩子布药、带话脚费和锅火零用就先一起冒头。你先把这层秋头小账拆开，不让“铺里也许快回钱了”又被家里和回乡脚路先吃成空话。',
              can: S.铜钱 >= 70,
              why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
            });
          }
        }
        if (xun === 2) {
          pack.extraActions.push({
            id: 'f_route_shop',
            name: '托铺里捎脚钱回家',
            cost: 1,
            eff: '铜钱-80·家族+2~3',
            desc: '把一旬脚钱托铺里熟人先带回家。若前一旬先问过铺账，这一口钱回得更实，不至又落成一句空话。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_shop_spring_bundle',
              name: '把春脚钱拆作布鞋与灯油',
              cost: 1,
              eff: '铜钱-90·贴家+1·衣药+1·家族+2',
              desc: '开春看着像刚回了一口脚钱，家里却先缺布鞋、灯油、草绳和灶下零用。先把春钱拆碎，后面再跑铺账与差役，才不至一开年就拿同一口现钱四处堵漏。',
              can: S.铜钱 >= 90,
              why: S.铜钱 >= 90 ? '' : '铜钱不足90文'
            });
          }
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_shop_bundle',
              name: '托铺里捎布药针线回家',
              cost: 1,
              eff: '铜钱-100·贴家+1·衣药+1·家族+2',
              desc: '伏夏家里最缺的常不是整锭银，而是布、药、针线和凉热应手的小物。先托铺里熟人把这些捎回去，钱离手更碎，可家里这一旬能少熬一层病耗。',
              can: S.铜钱 >= 100,
              why: S.铜钱 >= 100 ? '' : '铜钱不足100文'
            });
            if (settledShopkeeper) {
              pack.extraActions.push({
                id: 'f_route_shop_summer_counter',
                name: '先把伏夏柜边凉茶与孩子布票分开',
                cost: 1,
                eff: '铜钱-65·贴家+1·衣药+1·通融+1·家族+1',
                desc: '留店伙计伏夏中旬最怕柜边凉茶、脚夫点心、孩子布票、递话门包和家里凉药一起往脚钱上咬。你先把柜边这层细耗拆开，不让“人在柜上”又和孩子穿用、家里锅火抢同一口现钱。',
                can: S.铜钱 >= 65,
                why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
              });
            }
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_shop_split',
              name: '把脚钱拆作家用与备差',
              cost: 1,
              eff: '铜钱-150·贴家+1·备役+1·家族+2~3',
              desc: '秋里铺面脚钱回得快些，也更容易被误当“手里宽裕”。你先拆一口回家续锅火，再留一口作差役后手，不让同一笔钱被混着吃掉。',
              can: S.铜钱 >= 150,
              why: S.铜钱 >= 150 ? '' : '铜钱不足150文'
            });
            pack.extraActions.push({
              id: 'f_route_shop_autumn_reply',
              name: '先把秋中回铺回签与锅火门包分开',
              cost: 1,
              eff: '铜钱-60·衣药+1·捎信+1·通融+1',
              desc: '秋中最怕铺里回签、锅火门包、递话脚费和回乡饭钱一起先来。你先把这层秋中铺签拆开，不让“脚钱刚回一点”又先被回话门包和锅火后手吃薄。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
        }
        if (xun === 3) {
          pack.extraActions.push({
            id: 'f_route_shop_collect',
            name: '回铺结一回旧脚钱',
            cost: 1,
            eff: '铜钱+90~120·催回脚钱',
            desc: '把先前垫在铺里的脚钱、搬运钱和零碎杂支结回一点。不是凭空多一笔，只把该你的那口钱真正拢到家用账里。',
            can: (S.学徒历练 || 0) >= 1 || (S.本年家捎信 || 0) > 0,
            why: ((S.学徒历练 || 0) >= 1 || (S.本年家捎信 || 0) > 0) ? '' : '眼下还无可回头结算的铺里旧脚钱'
          });
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_shop_summer_tail',
              name: '先把夏尾回签与秋前样纸分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·家族+1',
              desc: '伏夏收尾最怕旧掌柜回签、秋前样纸、递话门包和过路药包一起先来。你先把这层夏尾铺签拆开，不让秋前门路和眼前锅火又去抢同一口刚结回的脚钱。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_shop_autumn_tail',
              name: '先把秋尾回铺脚费与灯油针线分开',
              cost: 1,
              eff: '铜钱-65·贴家+1·衣药+1·通融+1·备役+1',
              desc: '秋尾最怕回铺脚费、灯油针线、递话门包和来春脚单一起追钱。你先把这层秋尾铺脚拆开，不让秋里刚结回的一口脚钱转身又被锅火、门路和明春脚路同时吃薄。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
          pack.extraActions.push({
            id: 'f_route_master',
            name: '凭师门旧识先探差役路数',
            cost: 1,
            eff: '铜钱-70·家族+1·备役+1',
            desc: '不是到催差那天才四处求人，而是先托旧掌柜、同门和熟客打听请人代办与打点门路，把后手提前留住。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_shop_spring_post',
              name: '把春脚钱拆作香纸与回铺脚路',
              cost: 1,
              eff: '铜钱-100·贴家+1·通融+1·捎信+1·家族+1',
              desc: '春尾最怕刚结回的一口脚钱又被清明香纸、回铺脚路和带话脚费混吃。你先把它拆开，不让“已经有了回钱”只停在账面上。',
              can: S.铜钱 >= 100,
              why: S.铜钱 >= 100 ? '' : '铜钱不足100文'
            });
          }
          if (season.id === 'winter') {
            pack.extraActions.push({
              id: 'f_route_shop_winter_post',
              name: '先留来春回铺脚费与递话薄礼',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·备役+1',
              desc: '冬尾不是只等过年。你先把来春回铺脚路、递话小礼和差役后手分开，免得明春第一旬又拿同一口现钱四处堵漏。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_shop_winter_tail',
              name: '先把年下回铺回签与来春脚单分开',
              cost: 1,
              eff: '铜钱-70·催账+1·备役+1·家族+1',
              desc: '冬尾最怕年下回铺回签、来春脚单、递话脚费和锅火后手一起抢同一口现钱。你先把这层冬尾铺签拆开，来春门路和眼前锅火才不至再互相咬住。',
              can: S.铜钱 >= 70,
              why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
            });
          }
        }
        if (season.id === 'winter' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_shop_book',
            name: '年关先对铺账留明春脚路',
            cost: 1,
            eff: '铜钱-50·捎信问铺账·备役+1·家族+1',
            desc: '年关先把铺里旧脚钱、明春回铺路费和差役后手分开。钱没有变多，只是先把“哪口该回家、哪口该留在手里”说清，不让明春第一口现钱又被混着吃掉。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
          });
          if (settledShopkeeper) {
            pack.extraActions.push({
              id: 'f_route_shop_winter_counter',
              name: '先把年关柜头值夜与守岁灯炭分开',
              cost: 1,
              eff: '铜钱-70·衣药+1·通融+1·备役+1·家族+1',
              desc: '留店伙计年关最怕柜头值夜灯炭、守岁炭药、递话门包和来春脚路一起压上来。你先把柜头夜账拆开，不让“旧铺还认你”与“家里先熬过年关”继续抢同一口现钱。',
              can: S.铜钱 >= 70,
              why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
            });
          }
        }
        if (season.id === 'winter' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_shop_gift',
            name: '把年下客礼拆作炭药与回铺礼',
            cost: 1,
            eff: '铜钱-80·贴家+1·衣药+1·通融+1·家族+1',
            desc: '年下这旬最怕的是同一口脚钱既要守岁炭药，又要留给旧掌柜和来春回铺的那层薄礼。你先拆开，不让“还认不认你”与“家里能不能熬过这几天”抢同一口钱。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文'
          });
          pack.extraActions.push({
            id: 'f_route_shop_winter_sign',
            name: '先把冬中回铺回签与灯炭门包分开',
            cost: 1,
            eff: '铜钱-70·捎信+1·衣药+1·通融+1·备役+1',
            desc: '冬中最怕旧掌柜回签、灯炭门包、递话脚费和来春回铺脚单一起挤上来。你先把这层冬中铺签拆开，不让“旧铺还认你”与“家里这几天还熬不熬得住”抢同一口现钱。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
      } else if (route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
        pack.note = '举业路成家后要把“体面”和“家计”同时算：笔墨底子若只停在文案里，家里这一旬就真会翻锅。现在不只春里先问馆课和保结，连伏夏的课账、秋里的润笔拆账、年关的旧馆账、冬尾的孩子帖样与明春纸墨后手，也都继续压回同一年逐旬结算。';
        pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜识字转业值=' + S.识字转业值;
        var examEventTxt;
        if (season.id === 'summer' && xun === 1) {
          examEventTxt = '伏夏上旬先问的是哪家还开馆、哪位塾师肯续这层人情；天热纸潮，家里又催汤药和草鞋，这一口门路若不先摸清，后头的笔墨钱就落不住。';
        } else if (season.id === 'summer' && xun === 2) {
          examEventTxt = '伏夏中旬最像把笔墨底子换成药钱与锅火：代写、誊录、开蒙和凉热小耗一起来抢同一口现钱。';
        } else if (season.id === 'summer' && xun === 3) {
          examEventTxt = '伏夏下旬更像清两本账：馆课钱能不能催回、塾师人情要不要先拿来探差役，都得在暑气最重时先说定。';
        } else if (season.id === 'autumn' && xun === 1) {
          examEventTxt = '秋里上旬先问的是哪家学生家肯续馆课、哪层保结还认你；可孩子夹衣、帖脚与锅火不会等馆课坐稳才来，若不先拆开，秋后这口家计很快又会被磨薄。';
        } else if (season.id === 'autumn' && xun === 2) {
          examEventTxt = '秋里中旬看着更像“终于有了笔墨钱”，可锅火、差钱和秋后衣药也一起更急；若不先拆账，润笔很快就会被误写成宽裕。';
        } else if (season.id === 'autumn' && xun === 3) {
          examEventTxt = '秋里下旬最像把馆课、润笔和保结人情一起收回手里：哪笔钱先回、哪层面子先替你顶差役，都会改写这一年怎么过。';
        } else if (season.id === 'winter' && xun === 1) {
          examEventTxt = '年关上旬先要把旧馆账、明春纸墨和保结后手分开；钱没有变多，可若不先理，明春第一口现钱就会被同一本账混着吃掉。';
        } else if (season.id === 'winter' && xun === 2) {
          examEventTxt = '冬里中旬更像把年末零碎笔墨钱拢成现钱：誊账、写契和学生家零碎束脩看着都小，可正是这些小钱给了家里过冬的后手。';
        } else if (season.id === 'winter' && xun === 3) {
          examEventTxt = '冬里下旬最像清总账：馆课钱、差钱、明春纸墨和眼前衣药都不肯再往后拖，哪一步晚一旬，年后就可能先欠一口。';
        } else {
          examEventTxt = xun === 1
            ? '上旬先问的是哪家孩童要开蒙、哪位廪保还肯替你作保；这一路先落下的，常常不是现钱，而是一层门路。'
            : (xun === 2
              ? '中旬最像把笔墨底子换成一口真现钱：教蒙、写契、誊抄，都比“我读过书”更能续锅火。'
              : '下旬更像把馆课、抄写和保结的人情一起结回来：哪笔钱先到家、哪层面子能先替你探差役，都是真后手。');
        }
        pack.event = {
          t: 'rel',
          tag: '[笔墨]',
          txt: examEventTxt
        };
        if (xun === 1) {
          if (season.id === 'winter') {
            pack.extraActions.push({
              id: 'f_route_school_winter_book',
              name: '年关先理馆账与明春纸墨',
              cost: 1,
              eff: '铜钱-50·捎信+1·备役+1·家族+1',
              desc: '先把旧馆账、明春纸墨、差钱和塾师那层人情分开。钱没有变多，只是先把“哪口该回家、哪口该留作明春”说清。',
              can: S.铜钱 >= 50,
              why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
            });
          } else {
            if (season.id === 'spring') {
              pack.extraActions.push({
                id: 'f_route_school_spring_contract',
                name: '先把春头馆契与学生纸样分开',
                cost: 1,
                eff: '铜钱-50·捎信+1·通融+1·家族+1',
                desc: '春起最怕馆契纸样、递话脚费和家里盐炭锅火一起压上第一口现钱。你先把这层春头细账拆开，不让今年第一程馆课门路刚起步就被零碎磨薄。',
                can: S.铜钱 >= 50,
                why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
              });
            }
            if (season.id === 'autumn') {
              pack.extraActions.push({
                id: 'f_route_school_autumn_packet',
                name: '先把秋头馆帖与孩子纸包分开',
                cost: 1,
                eff: '铜钱-55·捎信+1·衣药+1·通融+1',
                desc: '秋头最怕学生家帖脚、孩子纸包和锅火先来抢钱，馆课口风却还没完全坐实。你先把这层秋头细账拆开，不让“秋里再说”又把家计和门路混成一团。',
                can: S.铜钱 >= 55,
                why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
              });
              pack.extraActions.push({
                id: 'f_route_school_autumn_cloth',
                name: '先把秋头馆回与孩子夹衣分开',
                cost: 1,
                eff: '铜钱-60·衣药+1·捎信+1·通融+1',
                desc: '秋凉刚起时，最怕旧馆回话、孩子夹衣、递话脚费和锅火一起先来。你先把这层秋头夹衣拆开，不让“馆课还未坐实、家里先要添衣”的换季细账又拖到秋中才一起反咬。',
                can: S.铜钱 >= 60,
                why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
              });
            }
            if (season.id === 'summer') {
              pack.extraActions.push({
                id: 'f_route_school_summer_soup',
                name: '先把伏夏馆汤与凉药门包分开',
                cost: 1,
                eff: '铜钱-55·衣药+1·捎信+1·通融+1',
                desc: '伏夏头一旬最怕馆里茶汤、凉药门包、递话脚费和家里锅火一起抢同一口现钱。你先把这层馆汤小耗拆开，不让夏课门路刚起头就被暑热和门包一起磨薄。',
                can: S.铜钱 >= 55,
                why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
              });
            }
            pack.extraActions.push({
              id: 'f_route_school_note',
              name: season.id === 'summer' ? '先问夏课馆账与保结门路' : (season.id === 'autumn' ? '先问秋馆课与学生人情' : '先问馆课与保结门路'),
              cost: 1,
              eff: '铜钱-40·问馆课·家族+1',
              desc: season.id === 'summer'
                ? '先托塾师、学生家与保结人问清伏夏哪家还续馆课、哪笔旧账还能回、谁还肯替你说一声。'
                : (season.id === 'autumn'
                  ? '秋里先问清哪家学生家愿续馆课、哪层人情还能换来一口润笔或保结，不让“读过书”只剩一句空名。'
                  : '先托塾师、学生家与保结人问清今季有没有馆课、谁还肯替你作保。钱还没回，可哪口笔墨活能接、哪层人情能用，先被你摸实了一层。'),
              can: S.铜钱 >= 40,
              why: S.铜钱 >= 40 ? '' : '铜钱不足40文'
            });
          }
        }
        if (xun === 2 && (S.识字 || S.识字转业值 >= 1)) {
          pack.extraActions.push({
            id: 'f_route_write',
            name: season.id === 'summer'
              ? '伏夏代写课单补家计'
              : (season.id === 'autumn'
                ? '秋里代写契纸补锅火'
                : (season.id === 'winter' ? '年关誊账补现钱' : '代写文契补家计')),
            cost: 1,
            eff: '铜钱+140~170·识字底子转活钱',
            desc: season.id === 'summer'
              ? '替学生家、塾馆或铺面誊写课单账页，把识字底子先换成一口能顶汤药和锅火的现钱。'
              : (season.id === 'autumn'
                ? '秋里替人写契、誊录与抄单，把识字底子真的拆成锅火和差钱，不让润笔只停在账面上。'
                : (season.id === 'winter'
                  ? '年关替人誊账、写契、抄礼单，把零碎笔墨钱拢成一口能过冬的现钱。'
                  : '替邻里、地主或铺面抄契写单，把识字底子真的换成一点现钱。')),
            can: true
          });
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_school_summer_fee',
              name: '把潮纸、投帖脚费与塾馆茶汤分开',
              cost: 1,
              eff: '铜钱-70·问价+1·衣药+1·通融+1',
              desc: '伏夏里最怕潮纸、投帖脚费、塾馆茶汤和家里凉热小耗一起挤同一口现钱。你先把这层碎费拆开，馆课与锅火才不至一齐发虚。',
              can: S.铜钱 >= 70,
              why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
            });
            pack.extraActions.push({
              id: 'f_route_school_summer_cough',
              name: '先把伏夏抄手凉药与孩子草鞋分开',
              cost: 1,
              eff: '铜钱-65·衣药+1·照家+1·通融+1',
              desc: '伏夏中旬最怕替人誊抄刚换来一点现钱，家里凉药、孩子草鞋、递话脚费和锅火又一起追上来。你先把这层身体与家内小耗拆开，不让识字活刚接上就先被暑热与穿用磨空。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_school_spring_copy',
              name: '把春里纸笔拆作香纸与课本',
              cost: 1,
              eff: '铜钱-90·贴家+1·衣药+1·家族+2',
              desc: '开春最怕馆课纸本、清明香纸和家里灯油草鞋挤在同一口现钱上。你先把这口小钱拆开，不让“还能写字补家计”一开年就被零碎磨薄。',
              can: S.铜钱 >= 90,
              why: S.铜钱 >= 90 ? '' : '铜钱不足90文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_school_split',
              name: '把秋里润笔拆作锅火与差钱',
              cost: 1,
              eff: '铜钱-150·贴家+1·备役+1·家族+2~3',
              desc: '秋里这口润笔最容易被误当成“终于宽了”。你先拆一口回家续锅火，再留一口作差钱与秋后后手，不让它转身就漏光。',
              can: S.铜钱 >= 150,
              why: S.铜钱 >= 150 ? '' : '铜钱不足150文'
            });
            pack.extraActions.push({
              id: 'f_route_school_autumn_mid_fee',
              name: '先把秋中馆账脚费与租路饭钱分开',
              cost: 1,
              eff: '铜钱-65·问价+1·捎信+1·通融+1',
              desc: '秋中最怕旧馆润笔、租路饭钱、回话脚费和锅火差钱一起压上来。你先把这层“馆账刚回一点，回乡和家用又来追钱”的细账拆开，不让秋里的笔墨钱又被错看成整口宽裕。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
        }
        if (xun === 3) {
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_school_spring_reply',
              name: '先把春尾馆批与端午纸样分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·衣药+1',
              desc: '春尾最怕旧馆回批、端午纸样、递话脚费和家里盐药锅火一起抢同一口现钱。你先把这层春尾细账拆开，不让“春里好不容易续起的馆课门路”转眼又被眼前锅火磨薄。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_school_spring_fan',
              name: '先把春尾扇药与塾门回帖分开',
              cost: 1,
              eff: '铜钱-55·衣药+1·捎信+1·通融+1·家族+1',
              desc: '春尾最怕旧馆回帖、端午蒲扇凉药、递话门包和灶下锅火一起抢同一口现钱。你先把这层春尾换季小耗拆开，不让“馆批快回了”转眼又被扇药和门包磨成空话。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
          }
          pack.extraActions.push({
            id: 'f_route_tutor_collect',
            name: season.id === 'autumn'
              ? '结回秋馆课与润笔'
              : (season.id === 'winter' ? '年关结回馆课与束脩' : '结回馆课与抄写钱'),
            cost: 1,
            eff: '铜钱+130~170·催回馆课钱',
            desc: season.id === 'autumn'
              ? '把秋里该得的馆课钱、润笔和学生家的零碎束脩真正结回一点。不是凭空多一笔，只把该到家的那口钱拢回来。'
              : (season.id === 'winter'
                ? '趁年关把旧馆账、抄写钱和学生家压着未清的那口束脩结回一点，免得拖到明春继续空挂着。'
                : '把前两旬应得的馆课钱、抄写钱和学生家的零碎束脩真正结回一点。不是凭空多一笔，只把该到家的那口钱拢回来。'),
            can: (S.识字 || S.识字转业值 >= 1),
            why: (S.识字 || S.识字转业值 >= 1) ? '' : '眼下还无可回头结算的笔墨活'
          });
          pack.extraActions.push({
            id: 'f_route_surety',
            name: season.id === 'autumn'
              ? '托廪保先问秋后差钱'
              : (season.id === 'winter' ? '趁年关先把保结与差钱说定' : '凭塾师保结先探差役'),
            cost: 1,
            eff: '铜钱-60·家族+1·备役+1',
            desc: season.id === 'autumn'
              ? '先托塾师、廪保和学生家问清秋后差钱与请托门路。不是到催差那天才求人，而是先把“读书认得的人”压进后手里。'
              : (season.id === 'winter'
                ? '趁年关先把塾师、廪保、学生家这层门路和来年差钱后手说定，不等明春第一口现钱再临时乱拆。'
                : '先托塾师、廪保和学生家问清这一年差役与请托路数。不是到催差那天才求人，而是先把“读书认得的人”压进后手里。'),
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_school_summer_reply',
              name: '先把夏尾馆信与秋前纸样分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·衣药+1',
              desc: '伏夏收尾最怕学生家回话、秋前纸样、递话脚费和家里锅火一起抢同一口现钱。你先把这层夏尾细账拆开，不让秋前门路和眼前锅火又被写成一句“再撑一旬”。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_school_autumn_reply',
              name: '先把保结薄礼与学生家回话脚费分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·家族+1',
              desc: '秋里最怕馆课钱还没真回手，学生家回话脚费、保结薄礼和锅火却先来抢这一口现钱。你先把这层小钱拆开，秋后人情与家计才不至挤成一团。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_school_autumn_tail',
              name: '先把秋尾回签与炭脚回礼分开',
              cost: 1,
              eff: '铜钱-55·捎信+1·通融+1·衣药+1',
              desc: '秋尾最怕学生家秋尾回签、炭脚锅火、小回礼和来春帖路后手一起抢同一口现钱。你先把这层秋尾细账拆开，不让“秋账未净、冬前门路先来问”的后手又拖到冬里才一起反咬。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
            pack.extraActions.push({
              id: 'f_route_school_autumn_register',
              name: '先把秋尾簿册与孩子灯油分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·供读+1',
              desc: '秋尾最怕学生家簿册、回话门包、孩子灯油和来春帖样一起追同一口现钱。你先把这层秋尾簿册拆开，不让“馆课还在续、家里也要接着读写”的后手又拖进冬里。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
          if (season.id === 'winter') {
            pack.extraActions.push({
              id: 'f_route_school_winter_post',
              name: '先留来春拜帖与开馆脚费',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·备役+1',
              desc: '冬藏下旬最怕旧馆账还没全清，来春拜帖与开馆脚费却先断。你先把这口小钱留下，让明春门路不至再去抢眼前锅火钱。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_school_winter_copy',
              name: '先把年下馆信与孩子帖样分开',
              cost: 1,
              eff: '铜钱-55·捎信+1·通融+1·家族+1·供读+1',
              desc: '冬藏下旬最怕旧馆年下回音、孩子来春帖样、递话门包和锅火后手一起抢同一口现钱。你先把这层冬尾帖样拆开，不让门路回音和家里读写又一起拖到年后才见光。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
            pack.extraActions.push({
              id: 'f_route_school_winter_medicine',
              name: '先把年下回话与炭药草鞋分开',
              cost: 1,
              eff: '铜钱-60·衣药+1·捎信+1·通融+1·家族+1',
              desc: '冬藏下旬最怕旧馆年下回话、守岁炭药、孩子来春草鞋和递话门包一起抢同一口现钱。你先把这层冬尾炭鞋拆开，不让旧馆回音、家里过冬与明春行走后手继续挤同一口年火钱。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
        }
        if (season.id === 'winter' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_school_winter_split',
            name: '把年尾笔墨拆作炭药与帖费',
            cost: 1,
            eff: '铜钱-100·贴家+1·衣药+1·备役+1·家族+1',
            desc: '冬里这口零碎束脩和誊账钱最怕被误当成整钱。你先拆一截给炭药和守岁小耗，再留一截作来春拜帖与差钱后手，不让“还能接笔墨活”只停在空话里。',
            can: S.铜钱 >= 100,
            why: S.铜钱 >= 100 ? '' : '铜钱不足100文'
          });
          pack.extraActions.push({
            id: 'f_route_school_winter_mid_reply',
            name: '先把冬中馆札与孩子炭笔分开',
            cost: 1,
            eff: '铜钱-60·捎信+1·通融+1·供读+1·家族+1',
            desc: '冬藏中旬最怕旧馆回札、孩子炭笔、递话门包和守岁锅火一起抢同一口现钱。你先把这层冬中馆札拆开，不让年关笔墨与家里读写又一起拖到年后。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_school_winter_cough',
            name: '先把冬中咳药与坐馆灯油分开',
            cost: 1,
            eff: '铜钱-70·衣药+1·将养+1·通融+1',
            desc: '冬中最怕年下寒咳、旧馆灯油、递话脚费和守夜锅火一起追钱。你先把这层寒月小耗拆开，不让“还能续馆”与“人先别倒下”继续抢同一口过冬钱。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
        if (season.id === 'winter' && xun === 1) {
          pack.extraActions.push({
            id: 'f_route_school_winter_fee',
            name: '先把旧馆灯油与拜帖脚费分开',
            cost: 1,
            eff: '铜钱-60·衣药+1·捎信+1·通融+1',
            desc: '年关上旬最怕旧馆回话脚费、灯油、拜帖小钱和家里锅火一起压来。你先把这层碎费拆开，不让“还能续馆”先被年下小耗磨断。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_school_winter_cloth',
            name: '先把冬头馆回与孩子夹袄分开',
            cost: 1,
            eff: '铜钱-55·衣药+1·捎信+1·通融+1·供读+1',
            desc: '年关上旬最怕旧馆回信、孩子夹袄、递话门包和锅火后手一起抢同一口现钱。你先把这层冬头夹衣拆开，不让旧馆门路、家里换季穿用和来春读写又一起拖进腊月。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
          });
        }
      } else if (route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) {
        pack.note = '卖工路成家后也不该只剩“这一年总共挣了多少工钱”。活路要先问、工食要分口回家、欠工要回头去结、差役也得先托旧工头探一层；现在又把春中回签与孩子草鞋、春尾回签与量斗草席、伏夏回签与锅火凉药、秋收旺工与秋中回签、秋尾回签与灯油针线、秋中回签与孩子夹衣、冬头夹衣与回签门包、冬头回签与孩子炭笔、冬中里书催册与工棚回话、年关欠工、年下回签与来春工棚草鞋脚路继续拆回同一年里逐旬结算。';
        pack.dossier = '雇技进度=' + S.雇技进度 + '｜雇工历练=' + S.雇工历练 + '｜婚配路径=' + S.婚配路径;
        var wageEventTxt;
        if (season.id === 'spring' && xun === 3) {
          wageEventTxt = '春尾最像“钱还没真回到家，夏前家用和脚路已经先来追钱”：旧工头回签、量斗草席、递话门包与夏前草鞋会先挤同一口现钱。';
        } else if (season.id === 'summer' && xun === 1) {
          wageEventTxt = '伏夏上旬最怕活还没断，人先被暑气和热病磨垮：先问哪处工棚肯留脚、哪口凉汤药能先赊，比空想“今年能挣多少”更要紧。';
        } else if (season.id === 'summer' && xun === 2) {
          wageEventTxt = '伏夏中旬最像把工食拆薄：旧工棚回签、锅火、草鞋、汤药和家里那口急米会一齐来抢同一口现钱。';
        } else if (season.id === 'autumn' && xun === 1) {
          wageEventTxt = '秋里一头是外头旺工，一头是家里也催你回去搭手；先问哪边更急，才不至两头都误。';
        } else if (season.id === 'autumn' && xun === 2) {
          wageEventTxt = '秋工钱看着比夏里厚一点，可锅火、差钱和回乡口粮也一起更急；若不先拆账，很容易错把忙季当宽裕。';
        } else if (season.id === 'winter' && xun === 1) {
          wageEventTxt = '冬里看着像缓下来，实际最像翻旧账：欠工结没结、明春哪处还有活、棉衣炭钱与孩子炭笔先留哪一口，都要今冬先说清。';
        } else if (season.id === 'winter' && xun === 2) {
          wageEventTxt = '冬中最像一手是欠工回话、炭鞋门包和来春草鞋，一手是里书催册、差票回签与工棚回话；年还没过，制度册子和旧工路已经先来抢同一口现钱。';
        } else if (xun === 1) {
          wageEventTxt = '上旬先问的不是“今年总共能挣多少”，而是哪一旬有活、哪一口工食能先结、哪位工头还认你这层熟面。';
        } else if (xun === 2) {
          wageEventTxt = '中旬最像把工钱往家里拢：自己手里少一点，家里那口锅却能先续上；同一口工钱若再拆一角留差役，才像真过日子。';
        } else {
          wageEventTxt = '下旬更像回头结欠工、探差役：工钱并不总在你手边，晚一旬结回来，年关里就可能差一层后手。';
        }
        pack.event = {
          t: 'rel',
          tag: '[工食]',
          txt: wageEventTxt
        };
        if (xun === 1) {
          pack.extraActions.push({
            id: 'f_route_wage_note',
            name: '托工头先问下季活路',
            cost: 1,
            eff: '铜钱-30·问工路·家族+1',
            desc: '先托工头和熟人问清下季哪处缺活、哪旬能结工食。钱还没回，可活路与回钱的门路先被你摸实了一层。',
            can: S.铜钱 >= 30,
            why: S.铜钱 >= 30 ? '' : '铜钱不足30文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_wage_spring_head_reply',
              name: '先把春头回签与门包盐药分开',
              cost: 1,
              eff: '铜钱-45·衣药+1·捎信+1·通融+1',
              desc: '春起上旬最怕旧工头回签、递话门包、盐药锅火和春头脚路一起先来。你先把这层春头回签拆开，不让“活路也许快回了”先被眼前门包和灶下盐药吃成空话。',
              can: S.铜钱 >= 45,
              why: S.铜钱 >= 45 ? '' : '铜钱不足45文'
            });
          }
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_wage_summer_note',
              name: '先问工棚落脚与凉汤药脚路',
              cost: 1,
              eff: '铜钱-40·家族+1·捎信+1·通融+1',
              desc: '伏夏最怕活还没断，人先热垮。先托工头问清哪处工棚肯留脚、哪家药铺能先赊一碗凉汤药，后面工食与家用才不至一起被热病截断。',
              can: S.铜钱 >= 40,
              why: S.铜钱 >= 40 ? '' : '铜钱不足40文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_summer_packet',
              name: '先把伏夏回签与草鞋药包分开',
              cost: 1,
              eff: '铜钱-55·衣药+1·捎信+1·通融+1',
              desc: '伏夏上旬最怕旧工棚回签、草鞋药包、递话门包和凉汤脚费一起先来。你先把这层伏夏回签拆开，活路还没断时，身子和门路也不至先被热里磨空。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_wage_autumn_note',
              name: '先问秋收旺工与回乡搭手',
              cost: 1,
              eff: '铜钱-30·家族+1·捎信+1·问价+1',
              desc: '秋里一头是外头旺工结现快，一头是家里也等你回去搭把手。先问清哪处抢工最值、家里哪天最缺人，后面拆账才不至两头都误。',
              can: S.铜钱 >= 30,
              why: S.铜钱 >= 30 ? '' : '铜钱不足30文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_autumn_packet',
              name: '先把秋头回签与草鞋脚费分开',
              cost: 1,
              eff: '铜钱-50·衣药+1·捎信+1·通融+1',
              desc: '秋头最怕旺工未真落袋，旧工回签、回乡草鞋、递话脚费和锅火已先来。你先把这层秋头回签拆开，不让“秋里也许能多挣一点”先被门包与脚费吃空。',
              can: S.铜钱 >= 50,
              why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
            });
          }
          if (season.id === 'winter') {
            pack.extraActions.push({
              id: 'f_route_wage_winter_book',
              name: '年关先问欠工与明春活路',
              cost: 1,
              eff: '铜钱-50·家族+1·捎信+1·备役+1',
              desc: '冬里先把欠工有没有着落、明春哪处工棚还肯留你、哪口现钱得先留给棉衣与差役分清。钱没有变多，只是不再等年后第一口现钱再被混着吃掉。',
              can: S.铜钱 >= 50,
              why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
            });
            if (xun === 1) {
              pack.extraActions.push({
                id: 'f_route_wage_winter_jacket',
                name: '先把孩子夹衣与回签门包分开',
                cost: 1,
                eff: '铜钱-55·衣药+1·捎信+1·通融+1',
                desc: '冬头最怕孩子夹衣、旧工头回签门包、递话脚费和灶下锅火后手一起冒头。你先把这层冬头家内小耗拆开，不让“工路还在回话”先被换季衣物和门包磨成空话。',
                can: S.铜钱 >= 55,
                why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
              });
              pack.extraActions.push({
                id: 'f_route_wage_winter_paper',
                name: '先把冬头回签与孩子炭笔分开',
                cost: 1,
                eff: '铜钱-60·供读+1·捎信+1·通融+1·家族+1',
                desc: '冬头最怕旧工头回签、孩子炭笔、递话门包和守岁锅火一起抢同一口现钱。你先把这层冬头炭笔拆开，不让“回话还在路上”又先被孩子来春读写和锅火后手吃空。',
                can: S.铜钱 >= 60,
                why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
              });
            }
          }
        }
        if (xun === 2) {
          pack.extraActions.push({
            id: 'f_route_send',
            name: '托工头先捎工食',
            cost: 1,
            eff: '铜钱-90·家族+2',
            desc: '把一口现钱先托工头或熟人带回家，自己手边更紧，家里却能少慌一程。',
            can: S.铜钱 >= 90,
            why: S.铜钱 >= 90 ? '' : '铜钱不足90文'
          });
          pack.extraActions.push({
            id: 'f_route_wage_split',
            name: '把工钱拆作家用与差钱',
            cost: 1,
            eff: '铜钱-140·家族+2~3·备役+1',
            desc: '趁这一旬手里还有零碎工钱，先拆一口回家续锅火，再留一口作差役后手。同一笔钱，这一旬就被家计与制度一齐吃住。',
            can: S.铜钱 >= 140,
            why: S.铜钱 >= 140 ? '' : '铜钱不足140文'
          });
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_wage_spring_bundle',
              name: '把春工钱拆作锅火与草鞋',
              cost: 1,
              eff: '铜钱-110·贴家+1·衣药+1·家族+2',
              desc: '春起看着只是刚接上活，真正先磨人的却是锅火、草鞋、带话脚路和家里零碎小耗。你先把这口春钱拆开，不让同一笔现钱一开年就四处漏。',
              can: S.铜钱 >= 110,
              why: S.铜钱 >= 110 ? '' : '铜钱不足110文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_spring_reply',
              name: '先把春中回签与孩子草鞋分开',
              cost: 1,
              eff: '铜钱-65·衣药+1·捎信+1·通融+1',
              desc: '春中最怕旧工头回签、孩子草鞋、递话门包和家里盐药锅火一起先来。你先把这层春中回签拆开，不让“活路快回了”又先被家里鞋药和回话脚费吃成空话。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
          if (season.id === 'summer') {
            pack.extraActions.push({
              id: 'f_route_wage_summer_bundle',
              name: '把伏夏工食拆作汤药与家用',
              cost: 1,
              eff: '铜钱-120·贴家+1·衣药+1·家族+2',
              desc: '伏夏挣来的这一口钱最怕整手花掉。先拿一截给家里续锅火，再拿一截给草药、草鞋和凉汤水，不让人还没撑到年关就先坏在夏里。',
              can: S.铜钱 >= 120,
              why: S.铜钱 >= 120 ? '' : '铜钱不足120文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_summer_reply',
              name: '先把伏夏回签与锅火凉药分开',
              cost: 1,
              eff: '铜钱-60·衣药+1·捎信+1·通融+1',
              desc: '伏夏中旬最怕旧工棚回签、锅火凉药、递话门包和家里急米一起先来。你先把这层伏夏回签拆开，不让“工食刚回到手”转头又被热里门包与锅火吃成空话。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
          }
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_wage_autumn_split',
              name: '把秋工钱拆作锅火与差钱',
              cost: 1,
              eff: '铜钱-160·贴家+1·备役+1·家族+2~3',
              desc: '秋工钱比伏夏厚一点，也更容易让人误以为手里松了。你先拆一口回家续锅火，再留一口顶差钱与秋后后手，不让旺工钱转头又漏光。',
              can: S.铜钱 >= 160,
              why: S.铜钱 >= 160 ? '' : '铜钱不足160文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_autumn_receipt',
              name: '先把秋中回签与租路饭钱分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·问价+1',
              desc: '秋中最怕旧工回签、租路饭钱、递话脚费和锅火后手一起先来。你先把这层秋中回签拆开，不让“旺工钱还没落手”先被回乡饭钱和带话门包吃薄。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_autumn_cloth',
              name: '先把秋中回签与孩子夹衣分开',
              cost: 1,
              eff: '铜钱-65·衣药+1·捎信+1·通融+1',
              desc: '秋凉刚起时，最怕旧工回签、孩子夹衣、递话脚费和锅火后手一齐来追钱。你先把这层秋中夹衣拆开，不让“旺工钱快回手了”又先被换季衣物和回话脚路磨薄。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
        }
        if (xun === 3) {
          pack.extraActions.push({
            id: 'f_route_wage_collect',
            name: '回工棚结一回欠工',
            cost: 1,
            eff: '铜钱+110~150·催回欠工',
            desc: '把先前压着未结的工钱、脚钱和零碎食钱结回一点。不是凭空添一笔，只把该到手的那口钱真正拢回来。',
            can: (S.雇工历练 || 0) >= 1 || (S.本年家捎信 || 0) > 0,
            why: ((S.雇工历练 || 0) >= 1 || (S.本年家捎信 || 0) > 0) ? '' : '眼下还无可回头结算的欠工'
          });
          pack.extraActions.push({
            id: 'f_route_wage_duty',
            name: '凭工头旧识先探差役',
            cost: 1,
            eff: '铜钱-60·家族+1·备役+1',
            desc: '不是等里甲催差时才四处求人，而是先托旧工头和熟手打听请人代办、凑现钱与避开误工的路数。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          if (season.id === 'autumn') {
            pack.extraActions.push({
              id: 'f_route_wage_autumn_tail',
              name: '先把秋尾差脚与锅火门包分开',
              cost: 1,
              eff: '铜钱-55·衣药+1·捎信+1·通融+1',
              desc: '秋尾最怕旺工将歇、回话差脚与递话门包却先一起要钱，锅火药钱也不肯等。你先把这层秋尾小账拆开，不让“秋里看着厚”转头就被年关前的细耗磨薄。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_autumn_lamp',
              name: '先把秋尾回签与灯油针线分开',
              cost: 1,
              eff: '铜钱-50·照家+1·捎信+1·通融+1·家族+1',
              desc: '秋尾最怕旧工回签、灯油针线、递话门包和年关前锅火后手一起先来。你先把这层秋尾灯油拆开，不让“旺工钱像还有余温”又先被年下家用和回话脚费磨薄。',
              can: S.铜钱 >= 50,
              why: S.铜钱 >= 50 ? '' : '铜钱不足50文'
            });
          }
          if (season.id === 'spring') {
            pack.extraActions.push({
              id: 'f_route_wage_spring_post',
              name: '先把回话脚费与下旬工路分开',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·备役+1',
              desc: '春尾不是只等下一旬自己转好。你先把旧工头回话脚费、下一程工路和差役后手分开，免得刚结回的一口工钱转头又被同一本账吃掉。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_spring_mat',
              name: '先把春尾回签与量斗草席分开',
              cost: 1,
              eff: '铜钱-55·贴家+1·捎信+1·通融+1',
              desc: '春尾最怕旧工头回签、量斗草席、递话门包和夏前草鞋一起先来。你先把这层春尾小账拆开，不让“下一程工路快有眉目”又先被家里草席和门包吃薄。',
              can: S.铜钱 >= 55,
              why: S.铜钱 >= 55 ? '' : '铜钱不足55文'
            });
          }
          if (season.id === 'winter') {
            pack.extraActions.push({
              id: 'f_route_wage_winter_post',
              name: '先问明春工棚与头程脚路',
              cost: 1,
              eff: '铜钱-60·捎信+1·通融+1·备役+1',
              desc: '冬尾最怕的是旧工头还认你这层熟面，明春头程脚费却没先留。你把回话脚费、头程脚路和差役后手先拆开，明春不必重新从冷面求人开始。',
              can: S.铜钱 >= 60,
              why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
            });
            pack.extraActions.push({
              id: 'f_route_wage_winter_tail',
              name: '先把年下回签与来春草鞋分开',
              cost: 1,
              eff: '铜钱-65·衣药+1·捎信+1·通融+1',
              desc: '冬尾最怕旧工头年下回签、来春草鞋、递话门包和灶下锅火后手一起冒头。你先把这层冬尾小账拆开，不让年下回音和来春头程继续抢同一口过冬现钱。',
              can: S.铜钱 >= 65,
              why: S.铜钱 >= 65 ? '' : '铜钱不足65文'
            });
          }
        }
        if (season.id === 'winter' && xun === 2) {
          pack.extraActions.push({
            id: 'f_route_wage_winter_register',
            name: '先把里书催册与工棚回话分开',
            cost: 1,
            eff: '铜钱-60·备役+1·通融+1·家族+1',
            desc: '冬中最怕一头是里书催你补册、点名、问差票，一头是旧工头还在回话；两边都不算大账，却会在年关一起挤同一口现钱。你先把这层册子与回话拆开，让制度后手不至把工路门路也一并磨薄。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文'
          });
          pack.extraActions.push({
            id: 'f_route_wage_winter_gift',
            name: '先把旧工头薄礼与炭钱分开',
            cost: 1,
            eff: '铜钱-80·贴家+1·衣药+1·通融+1·家族+1',
            desc: '年下最怕旧工头薄礼、炭钱、回话脚费和家里守岁药脚一齐来抢同一口工钱。你先把这层小钱拆开，不让门路与锅火在冬里互相咬住。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文'
          });
          pack.extraActions.push({
            id: 'f_route_wage_winter_reply',
            name: '先把冬中欠工回话与炭鞋门包分开',
            cost: 1,
            eff: '铜钱-70·衣药+1·捎信+1·通融+1',
            desc: '冬中最怕欠工回话、炭钱棉鞋、递话门包和来春头程草鞋一起冒头。你先把这层冬中小账拆开，不让年关锅火、回话与明春工路继续挤同一口现钱。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文'
          });
        }
      }
      return pack;
    }

    var wp = workProfile();
    var rp = familyRoutePack();
    var bridge = lifecycleInheritanceBridge();
    // 养家阶段的“旬节碎事”：只加内容密度与气口，不引入评分、也不额外消耗 RNG。
    // 注意史料口径：只写“常见碎事/口风/规矩”，不写确定的政策细则与数字。
    function familyFlavorEvent(route, year, seasonId, xun) {
      var seasonIdx = seasonId === 'spring' ? 0 : (seasonId === 'summer' ? 1 : (seasonId === 'autumn' ? 2 : 3));
      var key = 'farm';
      if (route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) key = 'wage';
      else if (route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) key = 'apprentice';
      else if (route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) key = 'merchant';
      else if (route.indexOf('路径五') === 0 || route.indexOf('读书应举') === 0 || S.生员身份) key = 'exam';
      var base = (year * 11 + seasonIdx * 5 + xun * 3);
      var pools = {
        farm: [
          { t: 'life', tag: '[旬节]', txt: '佃户与自耕户都爱在这旬里互探口风：今年谁家请短工、谁家借种借粪、谁家又欠了哪一笔。' },
          { t: 'inst', tag: '[里甲]', txt: '里甲贴了新告示：差役口风与秋粮预征的传言又起。真伪未必立刻见账，但人心先紧。' },
          { t: 'rel', tag: '[邻里]', txt: '邻里来借火借盐，推与不推都要落一句话。钱不大，却最能看出这一房在乡里“冷不冷”。' },
          { t: 'body', tag: '[身子]', txt: '田里活计与家里锅火挤在一起时，最先漏的往往不是粮，而是腰腿与这口气。' }
        ],
        wage: [
          { t: 'inst', tag: '[工路]', txt: '工棚里总有人在传：哪家头家肯结账、哪条工路要涨要跌。口风未必准，但脚费常要先掏。' },
          { t: 'rel', tag: '[熟面]', txt: '旧工头一句“认不认你这张熟面”，往往顶得过你手里多出的一点铜钱。' },
          { t: 'life', tag: '[锅火]', txt: '受雇钱多半是零碎进账：一手掏脚费、一手留锅火，最怕同一旬里全挤到一口现钱上。' },
          { t: 'body', tag: '[身子]', txt: '粗活久了，手脚起泡是常事。花不花一口小钱补药，差的不是面子，是能不能继续硬撑。' }
        ],
        apprentice: [
          { t: 'inst', tag: '[铺里]', txt: '铺里规矩最怕“忘了”：跑腿、抄写、看货、问价都不是大功劳，却常决定掌柜肯不肯继续留你。' },
          { t: 'rel', tag: '[掌柜]', txt: '掌柜嘴上不说，心里却记得谁肯替铺子先垫一口、谁遇事先回话。' },
          { t: 'life', tag: '[行市]', txt: '行市口风来得快：今旬哪样货好走、哪样货压仓。你未必能做主，但至少得听懂。' },
          { t: 'body', tag: '[奔走]', txt: '城里跑腿久了，脚底磨破比挨骂更磨人。修不修鞋，常常是这旬能不能顺过去的差别。' }
        ],
        merchant: [
          { t: 'inst', tag: '[行栈]', txt: '行栈、脚夫、码头、牙行各有一套“明话暗话”。你这一旬多跑一步，账就少漏一笔。' },
          { t: 'life', tag: '[账本]', txt: '商路最怕的不是赚少，而是账不清：脚费、仓脚、坏账、人情与回乡反哺常挤在同一口现钱上。' },
          { t: 'rel', tag: '[旧识]', txt: '旧识肯不肯替你回话、替你引路，常比你手里多出的一点带本银更关键。' },
          { t: 'body', tag: '[风寒]', txt: '跑商久了，风寒湿热都要算进账里。人若倒了，再好的门路也会断在半途。' }
        ],
        exam: [
          { t: 'inst', tag: '[书香]', txt: '塾师与廪保不一定看你“多苦读”，更看你这旬能不能把纸墨、拜帖与家里锅火的账讲明白。' },
          { t: 'life', tag: '[纸墨]', txt: '纸墨钱不算大，但来得勤：这旬若不先拆开，常会与衣药、差役挤在同一口现钱上。' },
          { t: 'rel', tag: '[口风]', txt: '同窗与邻里总爱问一句“读得如何”。你答得体面与否，会慢慢变成“这房还值不值得供”的口风。' },
          { t: 'body', tag: '[灯下]', txt: '灯下久坐，肩背酸痛不是矫情；一旦拖成病，耽误的不是一旬文章，是一年家计。' }
        ]
      };
      var pool = pools[key] || pools.farm;
      var idx = base % pool.length;
      return pool[idx];
    }
    var events = [
      { t: 'life', tag: '[家计]', txt: '成家之后，日子不再是“几年一把结账”。这一阶段按<span class="em">四季三旬</span>推进：同一年的口粮、差役、市场、孩子、身子和旧债，会在同一年里轮流冒头。' },
      { t: 'rand', tag: '[行情]', txt: '今旬米价走' + (priceHigh ? '高' : '低') + '（1石≈' + miPrice + '文，占位）。' },
      { t: 'body', tag: '[身子]', txt: season.note + (xun === 3 ? ' 到了下旬，衣药、汗疹、腰腿酸痛和明年后手常常不肯再往后拖。' : ' 这一旬里，锅火、孩子、身子和人情都在争同一笔钱。') }
    ];
    if (bridge.event) events.push(bridge.event);
    if (rp.event) events.push(rp.event);
    events.push(familyFlavorEvent(route, year, season.id, xun));
    // 节令：只做“密度”与气口，不给成功分与排名；影响尽量落在微小开销与家口关系上。
    if (season.id === 'spring' && xun === 1) {
      events.push({ t: 'rel', tag: '[节令]', txt: '清明将近，乡里讲究祭扫修谱；不一定铺张，但若全忘了，亲族话里总会添一层凉意。' });
    } else if (season.id === 'summer' && xun === 1) {
      events.push({ t: 'body', tag: '[节令]', txt: '端午前后湿热最重：艾草、雄黄、凉汤水都是“花不了多少却不花更难受”的细账。' });
    } else if (season.id === 'autumn' && xun === 2) {
      events.push({ t: 'rel', tag: '[节令]', txt: '中秋前后，人情往来、脚钱牙税与家里“还缺哪一口”常常挤在同一旬里见光。' });
    } else if (season.id === 'winter' && xun === 1) {
      events.push({ t: 'rand', tag: '[节令]', txt: '冬至将近，乡里添炭火、备年礼、分明春脚费；不是大账，却最容易把同一口现钱拧紧。' });
    }
    if (xun === 1) events.push({ t: 'rel', tag: '[起手]', txt: '上旬先定主路：先守哪口营生、先顾哪笔家账，不会因为你“已经成家了”就自动排整齐。' });
    else if (xun === 2) events.push({ t: 'rel', tag: '[碰账]', txt: '中旬最像“账碰账”：卖米、赶集、脚钱、孩子、回乡与人情都在抢这一旬仅有的两手空当。' });
    else events.push({ t: 'rel', tag: '[收尾]', txt: '下旬最像把后账翻出来：差役钱、衣药、旧债、明年春起修具，都不肯再往后拖。' });

    return {
      title: '养家 · 第' + year + '年' + season.name + '·' + xunLabel,
      label: S.年龄 + '岁·' + season.name + '·' + xunLabel,
      next: 'family',
      nextLabel: isYearEnd
        ? '又一年春起 →'
        : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + familyXunLabel(xun + 1) + ' →')),
      ap: 3,
      commitLabel: isYearEnd ? '了这一养家年 →' : '了这一旬家计细账 →',
      shock: false,
      note: '养家阶段现改成“春起→夏长→秋收→冬藏”四季、每季三旬，并把每旬操作厚到 3 手：通常要同时兼顾一手主营生、一手家内或市面细账，再留一手给差役、衣药、旧债或明春后手。仍不评分，只把家计与制度压力摊回同一年。'
        + (bridge.note ? ' ' + bridge.note : '')
        + (rp.note ? ' ' + rp.note : ''),
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>，这一养家年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + xunLead + ' 这一旬你有 <span class="em">3 个行动点</span>，得尽量把主营生、家里细账和制度后手一起摊开；若只顾一头，另一头往往会在同一年里立刻反咬回来。'
        + (bridge.narrative ? (' ' + bridge.narrative) : ''),
      dossier: function () {
        return lifeDossier('家年=' + year + '｜家程=' + season.name + '·' + xunLabel + '｜米价=' + (priceHigh ? '高' : '低') + '｜本年做活=' + (S.本年家做活 || 0) + '｜粜米=' + (S.本年家粜米 || 0) + '｜问价=' + (S.本年家问价 || 0) + '｜贴家=' + (S.本年家贴家 || 0) + '｜催账=' + (S.本年家催账 || 0) + '｜备役=' + (S.本年家备役 || 0) + '｜修缮=' + (S.本年家修缮 || 0) + '｜通融=' + (S.本年家通融 || 0) + '｜捎信=' + (S.本年家捎信 || 0) + '｜供读=' + (S.本年家供读 || 0) + '｜人情欠条=' + (S.人情欠条 || 0)
          + (bridge.dossier ? '｜' + bridge.dossier : '')
          + (rp.dossier ? '｜' + rp.dossier : '')
          + '。');
      },
      events: events,
      prompt: xun === 1 ? '这一旬先怎么定主营生？（分配 3 点）' : (xun === 2 ? '这一旬怎么把市面和家里细账拢住？（分配 3 点）' : '这一旬怎么把后账收住？（分配 3 点）'),
      actions: function () {
        var A = [];
        A.push({ id: 'f_work', name: wp.name, cost: 1, eff: wp.eff, desc: wp.desc, can: true });
        if (xun === 1) {
          A.push({
            id: 'f_repair',
            name: season.id === 'winter' ? '补屋缮仓过冬' : '修屋缮具',
            cost: 1,
            eff: '铜钱-' + repairCost + '·年末少漏耗1石',
            desc: season.id === 'winter'
              ? '屋漏、仓潮、门窗透风，都会在冬里悄悄吃掉口粮和身子。先花一口小钱，把这一年的漏耗压住。'
              : '修犁、补仓、补屋面，看着不显眼，却常决定年末到底还剩几成家底。',
            can: S.铜钱 >= repairCost,
            why: S.铜钱 >= repairCost ? '' : ('铜钱不足' + repairCost + '文')
          });
          A.push({
            id: 'f_registry',
            name: '翻黄册点役',
            cost: 1,
            eff: '铜钱-20·备役后手+1·通融+1',
            desc: '去里老或里甲处把这一年的差票、轮役口风先问明。不是“买通免役”，只是把制度这层后手早一点摊回同一年账里，免得到了秋后才四处拆钱。',
            can: S.铜钱 >= 20,
            why: S.铜钱 >= 20 ? '' : '铜钱不足20文',
            once: true
          });
          if (season.id === 'spring') {
            A.push({
              id: 'f_ancestral',
              name: '清明前先办祭扫修谱',
              cost: 1,
              eff: '铜钱-25·家族+1·通融+1',
              desc: '不求铺张，只求不失礼：买点纸香、请长辈点拨修谱口风。钱不多，却能把“这一房还记得祖上规矩”的气口留住。',
              can: S.铜钱 >= 25,
              why: S.铜钱 >= 25 ? '' : '铜钱不足25文'
            });
          }
        }
        if (xun === 2) {
          A.push({
            id: 'f_sell',
            name: season.id === 'autumn' ? '趁秋价粜米换钱' : '粜米换钱',
            cost: 1,
            eff: '存米-1·铜钱+' + miPrice,
            desc: '卖 1 石存米换现钱。价高时少吃一层亏，价低时也只是薄收，不会凭空发财。',
            can: S.存米 >= 1,
            why: S.存米 >= 1 ? '' : '存米不足1石'
          });
          A.push({
            id: 'f_market',
            name: '赶集抄价',
            cost: 1,
            eff: '铜钱-' + marketCost + '·若同旬粜米则多得+' + marketBoostBase + '文',
            desc: '跑一趟市集抄牙价、问米行。不是凭空多钱，只是让你这一旬卖米不至于吃生。',
            can: S.铜钱 >= marketCost,
            why: S.铜钱 >= marketCost ? '' : ('铜钱不足' + marketCost + '文')
          });
          A.push({
            id: 'f_message',
            name: '托人捎话回乡',
            cost: 1,
            eff: '铜钱-20·家族+1·捎信+1',
            desc: '托脚夫或熟人捎一封短话回乡：钱不多，却能把“这一房怎么过、哪笔账在路上”的口风先续上。',
            can: S.铜钱 >= 20,
            why: S.铜钱 >= 20 ? '' : '铜钱不足20文'
          });
          A.push({
            id: 'f_social',
            name: '走里甲人情',
            cost: 1,
            eff: '铜钱-' + socialCost + '·家族+1·年末差役更易通融',
            desc: '提一分薄礼、跑一趟里甲与邻里。不是刷好感，而是把“到期才求”改成“平日先通”。',
            can: S.铜钱 >= socialCost,
            why: S.铜钱 >= socialCost ? '' : ('铜钱不足' + socialCost + '文')
          });
          A.push({
            id: 'f_favor_lend',
            name: '借出一口人情钱',
            cost: 1,
            eff: '铜钱-80·人情欠条+1·家族+1',
            desc: '邻里或里甲忽来求急钱。你若借出，这一旬手头更紧，但这口人情会写成欠条：之后若抽空去讨，才能回到你这一本铜钱流水里。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文'
          });
          A.push({
            id: 'f_kitchen',
            name: '添灯油针线',
            cost: 1,
            eff: '铜钱-' + kitchenCost + '·家族+1·照家+1',
            desc: '灯油、针线、盐酱和一点点应急杂物，往往不值一提，却最容易在一年里把家计磨薄。先用一口小钱把“锅火边的细账”摊开。',
            can: S.铜钱 >= kitchenCost,
            why: S.铜钱 >= kitchenCost ? '' : ('铜钱不足' + kitchenCost + '文')
          });
          if (season.id === 'summer') {
            A.push({
              id: 'f_cool',
              name: '买艾草凉汤解暑',
              cost: 1,
              eff: '铜钱-25·体魄+1·衣药+1',
              desc: '不是治大病，只是把伏夏最常见的湿热小耗先压住：凉汤水、艾草、盐豆这些小钱，往往能换来一旬里少发一次热疹。',
              can: S.铜钱 >= 25,
              why: S.铜钱 >= 25 ? '' : '铜钱不足25文'
            });
          }
        }
        if (xun === 3) {
          A.push({
            id: 'f_duty',
            name: '备差打点',
            cost: 1,
            eff: '铜钱-' + dutyCost + '·本年赔累风险降',
            desc: '里甲催差前先备一点打点钱，能少吃一层“到期才慌”的亏。',
            can: S.铜钱 >= dutyCost,
            why: S.铜钱 >= dutyCost ? '' : ('铜钱不足' + dutyCost + '文'),
            once: true
          });
          A.push({
            id: 'f_mend',
            name: season.id === 'winter' ? '添衣买药过冬' : '补衣买药',
            cost: 1,
            eff: '铜钱-' + mendCost + '·体魄+3',
            desc: '针线、草药、热水姜汤，都是细碎却真实的花销。买得起，就少熬几分病。',
            can: S.铜钱 >= mendCost,
            why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文')
          });
          A.push({
            id: 'f_repay',
            name: '还一分旧债',
            cost: 1,
            eff: '白银-1·负债银-1',
            desc: '旧债不还就滚息。能挤出一两白银，先把债头压下一线。',
            can: (S.负债银 || 0) >= 1 && S.白银 >= 1,
            why: (S.负债银 || 0) >= 1 ? (S.白银 >= 1 ? '' : '白银不足1两') : '暂无旧债可还'
          });
          A.push({
            id: 'f_favor_collect',
            name: '讨回前头人情钱',
            cost: 1,
            eff: '铜钱+100·人情欠条-1',
            desc: '前头借出去的急钱，有时会在年关前被人还上一口。你若抽空去讨，这一旬就能把那口钱拢回锅火或差钱里。',
            can: (S.人情欠条 || 0) > 0,
            why: (S.人情欠条 || 0) > 0 ? '' : '眼下没有可讨回的人情欠条'
          });
          if (season.id === 'autumn') {
            A.push({
              id: 'f_tax',
              name: '先兑丁粮差票压秋后催缴',
              cost: 1,
              eff: '铜钱-90·备役+1·通融+1',
              desc: '秋后最怕“钱还在路上，里甲却先来催”。你先拿一口现钱兑成差票与零碎税钱，免得催缴到了门口才四处拆账。',
              can: S.铜钱 >= 90,
              why: S.铜钱 >= 90 ? '' : '铜钱不足90文',
              once: true
            });
          }
        }
        A.push({
          id: 'f_borrow',
          name: xun === 3 ? '借粮先过冬' : '借粮度口',
          cost: 1,
          eff: '存米+1·负债银+1',
          desc: '向邻里或宗族借一石口粮先过这一旬。不是白得：债记在账上，来年还。',
          can: (S.负债银 || 0) <= 8,
          why: (S.负债银 || 0) <= 8 ? '' : '旧债已重，再借只会把后头的路堵死'
        });
        A.push({
          id: 'f_child',
          name: (S.子数 + S.女数 > 0) ? (xun === 2 ? '照孩子与家口' : '教蒙与照看') : '看护家口',
          cost: 1,
          eff: '家族+2·体魄-1',
          desc: (S.子数 + S.女数 > 0)
            ? (xun === 2 ? '孩子衣药、找师傅、调吃食，都是一旬一旬摊开的细账。' : '孩子不识字也得认得规矩；教蒙、看病、找师傅，都费心费力。')
            : '虽未添丁，家口与人情仍要照看。',
          can: true
        });
        rp.extraActions.forEach(function (x) { A.push(x); });
        A.push({ id: 'f_rest', name: '将养', cost: 1, eff: '体魄+5', desc: '别把身子熬坏。', can: true });
        return A;
      },
      settle: function (log) {
        var dutyReserved = false;
        var picked = {};
        var stepTag = season.name + '·' + xunLabel;
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        var marketBoost = 0;
        if (picked.f_market) {
          if (spendCopper(marketCost)) {
            marketBoost = marketBoostBase;
            S.本年家问价 += 1;
            pushFamilySeasonTag(stepTag + '问价');
            log.push(['赶集抄价：铜钱-' + marketCost + '；若同旬卖米，则多得+' + marketBoostBase + '文（不靠运气，靠腿脚与信息）', 'good']);
          } else {
            log.push(['想赶集抄价，但这一旬铜钱已被别处占住，只得作罢。', 'bad']);
          }
        }

        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'f_work':
              wp.run(log);
              break;
            case 'f_sell':
              var sellPrice = miPrice + marketBoost;
              if (S.存米 >= 1) {
                S.存米 -= 1;
                S.铜钱 += sellPrice;
                S.本年家粜米 += 1;
                pushFamilySeasonTag(stepTag + '粜米');
                log.push(['粜米1石：铜钱+' + sellPrice + (marketBoost ? '（抄价不吃生）' : ''), 'good']);
              } else log.push(['想卖米换钱，但这一旬存米不足，只得作罢。', 'bad']);
              break;
            case 'f_market':
              break;
            case 'f_repair':
              if (spendCopper(repairCost)) {
                S.本年家修缮 += 1;
                pushFamilySeasonTag(stepTag + '修缮');
                log.push([(season.id === 'winter' ? '补屋缮仓过冬' : '修屋缮具') + '：铜钱-' + repairCost + '。钱先花出去，年末少漏一层米、少受一层寒。', 'good']);
              } else log.push(['想修屋缮具，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_duty':
              if (spendCopper(dutyCost)) {
                S.本年家备役 = (S.本年家备役 || 0) + 1;
                dutyReserved = true;
                pushFamilySeasonTag(stepTag + '备差');
                log.push(['备差打点：铜钱-' + dutyCost + '，本年赔累风险先压一线', 'good']);
              } else log.push(['想备差打点，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_mend':
              if (spendCopper(mendCost)) {
                S.体魄 += 3;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '衣药');
                log.push([(season.id === 'winter' ? '添衣买药过冬' : '补衣买药') + '：铜钱-' + mendCost + '、体魄+3', 'good']);
              } else log.push(['想补衣买药，但这一旬铜钱已先被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_repay':
              if ((S.负债银 || 0) >= 1 && spendSilver(1)) {
                S.负债银 = Math.max(0, (S.负债银 || 0) - 1);
                S.本年家还债 += 1;
                pushFamilySeasonTag(stepTag + '还债');
                log.push(['还一分旧债：白银-1、负债银-1（不评分，只把债头压下一线）', 'good']);
              } else log.push(['想还旧债，但现银或债额不足，只得暂缓。', 'bad']);
              break;
            case 'f_borrow':
              S.存米 += 1;
              S.负债银 = (S.负债银 || 0) + 1;
              S.本年家借粮 += 1;
              pushFamilySeasonTag(stepTag + '借粮');
              log.push(['借粮度口：存米+1、负债银+1（欠账记在账上，不伪装成白得）', 'bad']);
              break;
            case 'f_child':
              S.家族 += 2;
              S.体魄 -= 1;
              S.本年家照家 += 1;
              pushFamilySeasonTag(stepTag + '照家');
              log.push(['照看家口：家族+2、体魄-1（不显功名，只记家计厚薄）', 'good']);
              break;
            case 'f_route_remit':
              if (spendSilver(1)) {
                S.累计反哺银 += 1;
                S.家族 += 4;
                S.本年家贴家 += 1;
                pushFamilySeasonTag(stepTag + '带银回乡');
                log.push(['托脚带银回乡：白银-1、累计反哺+1、家族+4。银一离手，家里这一旬就能真续上锅火。', 'good']);
              } else if (spendCopper(180)) {
                S.家族 += 3;
                S.本年家贴家 += 1;
                pushFamilySeasonTag(stepTag + '捎钱回乡');
                log.push(['托脚带钱回乡：铜钱-180、家族+3。虽不是大银，却把这一旬家里最急的一口先接住。', 'good']);
              } else {
                log.push(['想托脚带银回乡，但这一旬现钱已先被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_split':
              if (spendSilver(1)) {
                S.累计反哺银 += 1;
                S.家族 += 3;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '分脚费');
                log.push(['先分脚费留家兼备差：白银-1、累计反哺+1、家族+3、备役后手+1。同一口现钱先被拆进家用与制度两本账里。', 'good']);
              } else if (spendCopper(220)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '分脚钱');
                log.push(['先分脚费留家兼备差：铜钱-220、家族+2、备役后手+1。现钱不厚，只能先拆成两小口：一口续锅火，一口顶差役。', 'good']);
              } else {
                log.push(['想把脚费分作家用与备差，但这一旬现钱已先被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_wharf':
              if (spendCopper(50)) {
                S.本年家问价 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '问水脚');
                log.push(['先问水脚与行栈路数：铜钱-50、问价+1、通融+1。你不是平白多一层门路，只是先把哪条路能走、哪家栈肯暂压一程摸清。', 'good']);
              } else log.push(['想先问水脚与行栈路数，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_cool':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏脚药');
                log.push(['先把行栈茶钱与家里凉药分开：铜钱-60、衣药+1、捎信+1、通融+1。水脚未必当旬回钱，但你先把伏夏最先咬人的那层茶钱、脚费和凉药压回了真账。', 'good']);
              } else log.push(['想先把行栈茶钱与家里凉药分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_ledger':
              if (spendCopper(50)) {
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏回签');
                log.push(['先把伏夏回签与行栈账单分开：铜钱-50、问价+1、捎信+1、通融+1。上一程回签、行栈账单和家里凉药这层伏夏开头最先起皱的小账，先被你拆回了真账。', 'good']);
              } else log.push(['想先把伏夏回签与行栈账单分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_home_note':
              if (spendCopper(55)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '伏夏家书药单');
                log.push(['先把家书药单与柜边回帖分开：铜钱-55、衣药+1、捎信+1、供读+1、家族+1。伏夏起手这一口现钱先被拆作家书药单、柜边回帖和孩子纸样，家里读写、凉药与门路不再全挤在一团。', 'good']);
              } else log.push(['想先把家书药单与柜边回帖分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_heat':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家将养 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '伏夏汗药热包');
                log.push(['先把自己汗药与孩子热包分开：铜钱-65、衣药+1、将养+1、捎信+1、家族+1。伏夏刚起头最容易混在一起的，不只行栈茶钱和柜边回帖，还有自己汗药、孩子热包与递话脚费；你先把这层“身子和家里一起发热”的小账拆回了真账。', 'good']);
              } else log.push(['想先把自己汗药与孩子热包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_register':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏帖册拆开');
                log.push(['先把伏夏差帖与柜边回帖分开：铜钱-60、备役+1、捎信+1、通融+1、家族+1。差帖门包、柜边回帖、递话脚费和孩子纸样先被拆回这一旬，商路养家伏夏开头终于连里甲门上的制度后手也开始和家里读写一起同旬咬账。', 'good']);
              } else log.push(['想先把伏夏差帖与柜边回帖分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_quote':
              if (spendCopper(40)) {
                S.本年家问价 += 1;
                pushFamilySeasonTag(stepTag + '抄秋价');
                log.push(['抄牙价认秋市：铜钱-40、问价+1。秋价不是“凭感觉”，你先拿腿脚把哪口货正热问明。', 'good']);
              } else log.push(['想先抄牙价认秋市，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_receipt':
              if (spendCopper(50)) {
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头回签');
                log.push(['先把秋头回签与牙帖脚费分开：铜钱-50、问价+1、捎信+1、通融+1。牙帖脚费、回签小纸和带话脚费这层“秋市刚热、细账先到”的碎耗，先被你拆回了真账。', 'good']);
              } else log.push(['想先把秋头回签与牙帖脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_packet':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家问价 += 1;
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '秋头脚药');
                log.push(['先把秋样脚单与回乡药包分开：铜钱-70、问价+1、衣药+1、捎信+1、家族+1。秋头这层样单、脚单、带话与布药没有再挤成一句“等回钱再说”。', 'good']);
              } else log.push(['想先把秋样脚单与回乡药包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_clothes':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头夹衣');
                log.push(['先把秋头差帖与孩子夹衣分开：铜钱-65、衣药+1、备役+1、通融+1、家族+1。差帖门包、孩子夹衣、回乡药包和递话脚费先被拆回这一旬，秋市刚热时，制度后手和家里换季小耗不再一起抢这一口现钱。', 'good']);
              } else log.push(['想先把秋头差帖与孩子夹衣分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_bundle':
              if (spendCopper(120)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '捎布药');
                log.push(['托熟号捎布药回家：铜钱-120、贴家+1、衣药+1、家族+2。不是只捎一口现钱，而是把夏里最缺的布、药和针线真送到锅火边。', 'good']);
              } else log.push(['想托熟号捎布药回家，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_sample':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家问价 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '样纸门包');
                log.push(['先把样纸门包与回程脚费分开：铜钱-70、问价+1、衣药+1、家族+1。你先把样纸、门包和布药这层伏夏细耗压进账里，不让“银在路上”先把家里这一旬磨空。', 'good']);
              } else log.push(['想先把样纸门包与回程脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_packet':
              if (spendCopper(65)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '伏夏纸样');
                log.push(['先把柜边回帖与孩子纸样分开：铜钱-65、捎信+1、通融+1、供读+1。柜边回帖、孩子纸样、递话脚费和锅火凉药先被你拆回这一旬，商路反哺、家里读写与伏夏锅火不再抢同一口现钱。', 'good']);
              } else log.push(['想先把柜边回帖与孩子纸样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_split':
              if (spendSilver(1)) {
                S.累计反哺银 += 1;
                S.家族 += 3;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '秋拆账');
                log.push(['秋货回钱先拆锅火与牙税：白银-1、累计反哺+1、贴家+1、备役+1、家族+3。秋里这口银没有被你一把花掉，而是先拆成家计与制度两本账。', 'good']);
              } else if (spendCopper(240)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '秋拆钱');
                log.push(['秋货回钱先拆锅火与牙税：铜钱-240、贴家+1、备役+1、家族+2。现钱不厚，也先被你拆成续锅火和应牙税的两小口。', 'good']);
              } else {
                log.push(['想把秋货回钱先拆作锅火与牙税，但这一旬现钱已先被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_autumn_mid_reply':
              if (spendCopper(55)) {
                S.本年家贴家 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋中回签');
                log.push(['先把秋中回签与锅火脚费分开：铜钱-55、贴家+1、捎信+1、通融+1。回签小纸、锅火脚费、差票回话和供读纸包后手先被你拆回了真账，秋中这口“将回未回”的现钱不再一转身就被几头同时吃掉。', 'good']);
              } else log.push(['想先把秋中回签与锅火脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_mid_clothes':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋中夹衣');
                log.push(['先把秋中回签与孩子夹衣分开：铜钱-60、衣药+1、捎信+1、通融+1、家族+1。熟号回签、孩子夹衣、递话脚费和锅火后手先被你拆开，商路养家秋中不再只是在翻回钱，连换季穿用和家内后手也开始同旬咬账。', 'good']);
              } else log.push(['想先把秋中回签与孩子夹衣分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_receipt':
              if (spendCopper(50)) {
                S.本年家捎信 += 1;
                S.本年家问价 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '抄回钱脚单');
                log.push(['先抄回钱脚单与拖欠次序：铜钱-50、捎信+1、问价+1、通融+1。秋里哪笔该催、哪笔还能压一程、哪笔得先回家续锅火，先被你理成了真账。', 'good']);
              } else log.push(['想先抄回钱脚单与拖欠次序，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_tail':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '秋尾回话');
                log.push(['先把秋尾回话脚费与供读纸包分开：铜钱-60、捎信+1、通融+1、备役+1。秋钱还没真落手，催单回话、差票门包和孩子纸包这层尾账，先被你从同一口现钱里拆开了。', 'good']);
              } else log.push(['想先把秋尾回话脚费与供读纸包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_body':
              if (spendCopper(35)) {
                S.体魄 += 1;
                S.家族 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '秋尾夹药');
                log.push(['先把秋尾药包与回话脚费分开：铜钱-35、体魄+1、衣药+1、家族+1。秋尾风凉、回话未净，药包与姜糖先被你从递话脚费里拆出来，家里这口气和你跑单回来的身子都没再硬顶。', 'good']);
              } else log.push(['想先把秋尾药包与回话脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_autumn_gate':
              if (spendCopper(55)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋尾门包');
                log.push(['先把秋尾回话与差票门包分开：铜钱-55、备役+1、通融+1、家族+1。差票门包、递话脚费与锅火后手先被拆开，秋钱将回未回时，这一房没再被最细的门包小耗先啃一口。', 'good']);
              } else log.push(['想先把秋尾回话与差票门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_reply':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '夏尾回话');
                log.push(['先把夏尾回话脚费与柜边包纸分开：铜钱-60、衣药+1、捎信+1、通融+1。伏夏尾声这层回客话、包纸和凉药锅火，终于不再等到秋头才一起算总账。', 'good']);
              } else log.push(['想先把夏尾回话脚费与柜边包纸分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_summer_guest':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '夏尾客签');
                log.push(['先把夏尾客签与秋前样纸分开：铜钱-60、捎信+1、通融+1、家族+1。客签回话、秋前样纸、递话门包和过路药包先被拆回了这一旬，秋路未开就不至先把夏尾锅火啃薄。', 'good']);
              } else log.push(['想先把夏尾客签与秋前样纸分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_collect':
              var owed = S.未回款银;
              if (owed > 0) {
                var collectRatio = 0.5;
                if ((S.本年家捎信 || 0) > 0) collectRatio += 0.15;
                if ((S.本年家问价 || 0) > 0) collectRatio += 0.1;
                if ((S.本年家通融 || 0) > 0) collectRatio += 0.1;
                collectRatio = Math.min(0.9, collectRatio);
                var got = Math.max(1, Math.ceil(owed * collectRatio));
                var lost = Math.max(0, owed - got);
                S.白银 += got;
                S.未回款银 = 0;
                if (lost > 0) S.商路亏折 += lost;
                S.本年家催账 += 1;
                pushFamilySeasonTag(stepTag + '催回旧账');
                log.push(['催回在路旧账：未回款' + owed + '两里先收回白银+' + got
                  + (((S.本年家捎信 || 0) > 0 || (S.本年家问价 || 0) > 0 || (S.本年家通融 || 0) > 0)
                    ? '（前头已先捎信、问价或通气口，回得更实）' : '')
                  + (lost > 0 ? ('，另有' + lost + '两只得认亏') : '') + '。', 'good']);
              } else {
                log.push(['想催旧账，但这一旬账面上已无待催的银。', 'bad']);
              }
              break;
            case 'f_route_letter':
              if (spendCopper(40)) {
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '捎家书');
                log.push(['托客脚捎家书问账：铜钱-40。钱还没回，可哪笔在路上、哪笔该催，先被你摸清了一层。', 'good']);
              } else log.push(['想托客脚捎家书问账，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_price':
              if (spendCopper(30)) {
                S.家族 += 1;
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '春问价旧账');
                log.push(['先托熟号回问米价与旧账：铜钱-30、问价+1、捎信+1、家族+1。春起先把米价、旧账和哪边更急问明，后头拆账和催账才不至瞎撞。', 'good']);
              } else log.push(['想先托熟号回问米价与旧账，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_packet':
              if (spendCopper(50)) {
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春纸门包');
                log.push(['先把样纸门包与回话脚费分开：铜钱-50、问价+1、捎信+1、通融+1。春起最先冒头的不是大银，而是样纸、门包、回话脚费和柜上零碎；你先把这层小耗压回了真账。', 'good']);
              } else log.push(['想先把样纸门包与回话脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_child_note':
              if (spendCopper(45)) {
                S.本年家衣药 += 1;
                S.本年家供读 += 1;
                S.本年家捎信 += 1;
                S.家族 += 1;
                pushFamilySeasonTag(stepTag + '春头纸样');
                log.push(['先把春头孩子纸样与回乡药单分开：铜钱-45、衣药+1、供读+1、捎信+1、家族+1。春头这口现钱先被拆作孩子纸样、回乡药单和递话脚费，旧账回音、家里锅火与孩子读写没有再一起挤成一团。', 'good']);
              } else log.push(['想先把春头孩子纸样与回乡药单分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_ritual':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '春礼脚费');
                log.push(['先把清明香纸与回话脚费分开：铜钱-60、贴家+1、捎信+1、家族+1。春中这一口小钱先被拆作家里春礼与回话脚费，不再等着路上银一到才临时抓瞎。', 'good']);
              } else log.push(['想先把清明香纸与回话脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_mid_reply':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '春中回签');
                log.push(['先把春中回签与孩子纸样分开：铜钱-65、捎信+1、通融+1、供读+1、家族+1。熟号回签、孩子纸样、递话门包和清明后手先被拆开，春中这层“钱像快回了、家里读写和锅火却先来”的细账没有再一起挤成一句空等。', 'good']);
              } else log.push(['想先把春中回签与孩子纸样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_book':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '年关对账');
                log.push(['年关对账并先留明春本钱：铜钱-60、捎信问账+1、备役+1。你先把路上账、本地差钱和开春本钱分开，不让明春第一口现钱又被混着吃掉。', 'good']);
              } else log.push(['想先在年关对账并留明春本钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_guest_gift':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '熟号薄礼');
                log.push(['先备熟号薄礼与回话脚费：铜钱-70、家族+1、通融+1、捎信+1。不是体面消费，而是把熟号、脚夫和带话人这层门路先续到明春。', 'good']);
              } else log.push(['想先备熟号薄礼与回话脚费，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_medicine':
              if (spendCopper(65)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬头炭药');
                log.push(['先把冬头炭药与差票门包分开：铜钱-65、衣药+1、捎信+1、通融+1。炭米、年下药包、熟号递话脚费和差票门包先被拆开，冬头这层锅火、身子与门路不必再一起硬顶。', 'good']);
              } else log.push(['想先把冬头炭药与差票门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_coal':
              if (spendCopper(80)) {
                S.本年家问价 += 1;
                S.本年家衣药 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '炭钱样纸');
                log.push(['先留炭钱与来春样纸定钱：铜钱-80、问价+1、衣药+1、备役+1。你先把年下炭火、样纸定钱和差钱拆开，明春未到，这一口现钱已不至被三边一起抢空。', 'good']);
              } else log.push(['想先留炭钱与来春样纸定钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_split':
              if (spendSilver(1)) {
                S.累计反哺银 += 1;
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '冬拆账');
                log.push(['把年关回钱拆作锅火与脚费：白银-1、累计反哺+1、贴家+1、备役+1、捎信+1、家族+2。不是多出一笔银，而是先把家里锅火、明春脚费与差钱拆开。', 'good']);
              } else if (spendCopper(200)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '冬拆钱');
                log.push(['把年关回钱拆作锅火与脚费：铜钱-200、贴家+1、备役+1、捎信+1、家族+1。现钱不厚，也先被你拆作家用与明春脚费的两小口。', 'good']);
              } else {
                log.push(['想把年关回钱拆作锅火与脚费，但这一旬现钱已先被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_winter_clear':
              if (spendCopper(70)) {
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '清账回话');
                log.push(['先把清账回话与柜边门包分开：铜钱-70、问价+1、捎信+1、通融+1。冬藏中旬这层“旧账快回、脚费先到”的碎耗，总算先被拆进了真账。', 'good']);
              } else log.push(['想先把清账回话与柜边门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_bundle':
              if (spendCopper(110)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春拆家用');
                log.push(['先把春钱拆作盐药与锅火：铜钱-110、贴家+1、衣药+1、家族+2。春里家计最怕空等，你先把最急的盐药与锅火拆回去了。', 'good']);
              } else log.push(['想先把春钱拆作盐药与锅火，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_spring_reply':
              if (spendCopper(70)) {
                S.本年家贴家 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春尾回话');
                log.push(['先把春尾回话脚费与催账门包分开：铜钱-70、贴家+1、捎信+1、通融+1。旧账未必当旬全回，但你先把春尾最磨人的那层回话脚费、门包与锅火压进了真账。', 'good']);
              } else log.push(['想先把春尾回话脚费与催账门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school':
              if ((S.商路供读银 || 0) >= 2) {
                log.push(['想再划供读专账，但这一房前头已经先留过两手，只得先顾眼下家计。', 'bad']);
              } else if (spendSilver(1)) {
                S.商路供读银 += 1;
                S.本年家供读 += 1;
                S.家族 += 2;
                pushFamilySeasonTag(stepTag + '供读专账');
                log.push(['另划一手供读专账：白银-1、供读专账+1、家族+2。钱没有消失，只是不再跟日用、差役和旧债混作一处。', 'good']);
              } else {
                log.push(['想另划供读专账，但这一旬现银不够，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_winter_wharf':
              if (spendCopper(50)) {
                S.本年家问价 += 1;
                S.本年家通融 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '订明春脚路');
                log.push(['托熟号订明春水脚：铜钱-50、问价+1、通融+1、捎信+1。你先把来年第一程能不能走、哪层熟号肯压一程问明，不让明春又从两眼一抹黑开始。', 'good']);
              } else log.push(['想先托熟号订明春水脚，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_guest_sign':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬尾柜签');
                log.push(['先把柜边回签与递话门包分开：铜钱-60、捎信+1、通融+1、家族+1。柜边回签、递话门包、来春客账次序和锅火后手先被拆开，冬尾这层“回音刚到、门包先来”的小耗没有再一口气挤进同一笔现钱。', 'good']);
              } else log.push(['想先把柜边回签与递话门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_packet':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '冬尾回签');
                log.push(['先把熟号回签与孩子纸包分开：铜钱-65、家族+1、捎信+1、通融+1、供读+1。熟号回签、孩子纸包、递话脚费和来春样纸定钱先被拆开，冬尾这层“门路要续、孩子也得接着读写”的小耗没有再一起挤锅火钱。', 'good']);
              } else log.push(['想先把熟号回签与孩子纸包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_receipt':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '年下回签');
                log.push(['先把年下回签与来春样纸分开：铜钱-65、捎信+1、通融+1、家族+1。年下回签、来春样纸定钱、递话脚费和锅火后手先被拆开，冬尾这层“熟号回音刚到、来春后手又先来”的碎账没有再挤成一句空等。', 'good']);
              } else log.push(['想先把年下回签与来春样纸分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_stamp':
              if (spendCopper(55)) {
                S.本年家问价 += 1;
                S.本年家备役 += 1;
                S.家族 += 1;
                pushFamilySeasonTag(stepTag + '冬尾牙帖');
                log.push(['先把明春牙帖脚费与熟号回签分开：铜钱-55、问价+1、备役+1、家族+1。你先把开春认牙的脚费从熟号回签、递话门包和样纸小账里拆出来，来春第一笔货还没问价，门路与家里就不会先被碎账磨薄。', 'good']);
              } else log.push(['想先把明春牙帖脚费与熟号回签分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_reply':
              if (spendCopper(70)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬尾回话');
                log.push(['先把年下回话、炭药与客账次序分开：铜钱-70、衣药+1、捎信+1、通融+1。年下最怕回话还在路上、炭药已经见底，你先把这层小账与客账次序拆开，明春前不至两头一起断线。', 'good']);
              } else log.push(['想先把年下回话、炭药与客账次序分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_winter_copy':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '冬尾帖样');
                log.push(['先把冬尾帖样与孩子帖样分开：铜钱-60、家族+1、捎信+1、通融+1、供读+1。柜边客账帖样、孩子来春帖样、递话门包和锅火后手先被拆开，冬尾这层“门路要续、家里也得接着读写”的细账没有再一起挤年火钱。', 'good']);
              } else log.push(['想先把冬尾帖样与孩子帖样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop':
              if (spendCopper(80)) {
                var shopFamily = (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.家族 += shopFamily;
                S.本年家贴家 += 1;
                pushFamilySeasonTag(stepTag + '铺里捎脚钱');
                log.push(['托铺里捎脚钱回家：铜钱-80、家族+' + shopFamily + ((S.本年家捎信 || 0) > 0 ? '。前一旬先问过铺账，这口脚钱没有再悬成一句空话。' : '。你手边更紧，家里却先稳了一口气。'), 'good']);
              } else log.push(['想托铺里捎脚钱回家，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_spring_bundle':
              if (spendCopper(90)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春脚拆家用');
                log.push(['把春脚钱拆作布鞋与灯油：铜钱-90、贴家+1、衣药+1、家族+2。春头那口脚钱没有被你误当成“终于宽了”，而是先拆回家里立刻就要用的几样小东西。', 'good']);
              } else log.push(['想把春脚钱拆作布鞋与灯油，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_bundle':
              if (spendCopper(100)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '捎布药');
                log.push(['托铺里捎布药针线回家：铜钱-100、贴家+1、衣药+1、家族+2。钱没变多，只是先把伏夏最缺的那几样真送回锅火边。', 'good']);
              } else log.push(['想托铺里捎布药针线回家，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_summer_counter':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏柜边已分');
                log.push(['先把伏夏柜边凉茶与孩子布票分开：铜钱-65、贴家+1、衣药+1、通融+1、家族+1。留店伙计这一旬最怕柜边凉茶、脚夫点心、孩子布票和家里凉药一起咬脚钱；你先把柜边细耗拆开，不让“人在柜上”与家里穿用又抢同一口现钱。', 'good']);
              } else log.push(['想先把伏夏柜边凉茶与孩子布票分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_note':
              if (spendCopper(30)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '问铺账');
                log.push(['托旧同门捎口信问铺账：铜钱-30、家族+1。钱还没回，可这一季哪笔脚钱能结、哪笔杂支还压着，先被你摸清了一层。', 'good']);
              } else log.push(['想托旧同门先问铺账，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_spring_head_reply':
              if (spendCopper(55)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春头铺签已分');
                log.push(['先把春头回铺回签与灯油门包分开：铜钱-55、衣药+1、捎信+1、通融+1、家族+1。旧掌柜回签、灯油门包、递话脚费和灶下锅火先被拆开，学徒路成年期开春第一旬终于不再只是“先问铺里口风”，连春头最先冒头的小账也压回了真账。', 'good']);
              } else log.push(['想先把春头回铺回签与灯油门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_spring_counter':
              if (spendCopper(65)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '春头柜簿已分');
                log.push(['先把春头柜簿与灯草门包分开：铜钱-65、捎信+1、通融+1、备役+1、家族+1。留店伙计春头最怕柜上记名、灯草门包、递话脚费和家里锅火一起找钱；你先把柜簿这层值柜细账拆开，不让“还能在柜上站得住”先被零耗磨薄。', 'good']);
              } else log.push(['想先把春头柜簿与灯草门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_summer_head_reply':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏铺签已分');
                log.push(['先把伏夏回铺回签与茶汤药脚分开：铜钱-60、衣药+1、捎信+1、通融+1、家族+1。旧掌柜回签、铺里茶汤、凉药脚费和递话门包先被拆开，学徒路成年人伏夏第一旬终于不再只靠“人在铺里”硬顶，连暑天最先追钱的那层门路与药脚也压回了真账。', 'good']);
              } else log.push(['想先把伏夏回铺回签与茶汤药脚分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_autumn_packet':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头脚单已分');
                log.push(['先把秋头脚单与孩子布药分开：铜钱-70、贴家+1、衣药+1、通融+1、家族+1。秋里第一口脚路没有再被你误当成“快回钱了”的空宽裕，而是先拆回孩子布药、回乡脚费和锅火边。', 'good']);
              } else log.push(['想先把秋头脚单与孩子布药分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_split':
              if (spendCopper(150)) {
                var shopSplitFamily = (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.家族 += shopSplitFamily;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '脚钱拆账');
                log.push(['把脚钱拆作家用与备差：铜钱-150、家族+' + shopSplitFamily + '、备役后手+1。铺里脚钱没有被你一把花掉，而是先拆进锅火和差役两本账里。', 'good']);
              } else log.push(['想把脚钱拆作家用与备差，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_autumn_reply':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋中铺签已分');
                log.push(['先把秋中回铺回签与锅火门包分开：铜钱-60、衣药+1、捎信+1、通融+1。铺里回签、锅火门包、递话脚费和回乡饭钱先被拆开，学徒路成年人秋中这层“脚钱刚回一点、回签和锅火又先来追”的细账，终于被压回了同旬。', 'good']);
              } else log.push(['想先把秋中回铺回签与锅火门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_autumn_tail':
              if (spendCopper(65)) {
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '秋尾铺脚已分');
                log.push(['先把秋尾回铺脚费与灯油针线分开：铜钱-65、贴家+1、衣药+1、通融+1、备役+1。回铺脚费、灯油针线、递话门包和来春脚单先被拆开，学徒路养家秋尾不再只剩“秋脚路”一层回头账，连入冬锅火和明春脚路也开始同旬咬钱。', 'good']);
              } else log.push(['想先把秋尾回铺脚费与灯油针线分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_collect':
              var shopCollectGain = (S.本年家捎信 || 0) > 0 ? 120 : 90;
              S.铜钱 += shopCollectGain;
              S.本年家催账 += 1;
              pushFamilySeasonTag(stepTag + '结回脚钱');
              log.push(['回铺结一回旧脚钱：铜钱+' + shopCollectGain + ((S.本年家捎信 || 0) > 0 ? '。因前头先问过铺账，这一口钱回得更实。' : '。这不是凭空添一笔，只把该你的零碎脚钱真正拢回来。'), 'good']);
              break;
            case 'f_route_shop_summer_tail':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '夏尾铺签已分');
                log.push(['先把夏尾回签与秋前样纸分开：铜钱-60、捎信+1、通融+1、家族+1。旧掌柜回签、秋前样纸、递话门包和过路药包先被拆回了这一旬，伏夏最后这口刚结回的脚钱不必再同时替夏尾锅火和秋前脚路顶账。', 'good']);
              } else log.push(['想先把夏尾回签与秋前样纸分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_spring_post':
              if (spendCopper(100)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家通融 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '春尾铺脚已分');
                log.push(['把春脚钱拆作香纸与回铺脚路：铜钱-100、贴家+1、通融+1、捎信+1、家族+1。你先把清明香纸、回铺脚路和带话脚费拆开，不让“钱已经回了一口”又被春尾零碎吃成空话。', 'good']);
              } else log.push(['想把春脚钱拆作香纸与回铺脚路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_book':
              if (spendCopper(50)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '铺账年关');
                log.push(['年关先对铺账留明春脚路：铜钱-50、家族+1、捎信问铺账+1、备役后手+1。铺里旧脚钱、明春脚路和差钱先被分开，不再等明春临头再乱。', 'good']);
              } else log.push(['想先在年关对铺账并留明春脚路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_winter_counter':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '年关柜头已分');
                log.push(['先把年关柜头值夜与守岁灯炭分开：铜钱-70、衣药+1、通融+1、备役+1、家族+1。留店伙计年关最怕柜头值夜灯炭、守岁炭药、递话门包和来春脚路一起压来；你先把柜头夜账拆开，不让旧铺熟面与家里守岁继续抢同一口现钱。', 'good']);
              } else log.push(['想先把年关柜头值夜与守岁灯炭分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_gift':
              if (spendCopper(80)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '年下客礼已分');
                log.push(['把年下客礼拆作炭药与回铺礼：铜钱-80、贴家+1、衣药+1、通融+1、家族+1。你先把守岁炭药、旧掌柜薄礼和来春回铺那层面子分开，不让同一口脚钱在年下被抢光。', 'good']);
              } else log.push(['想把年下客礼拆作炭药与回铺礼，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_winter_sign':
              if (spendCopper(70)) {
                S.本年家捎信 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '冬中铺签已分');
                log.push(['先把冬中回铺回签与灯炭门包分开：铜钱-70、捎信+1、衣药+1、通融+1、备役+1。你先把旧掌柜回签、灯炭门包和来春脚单拆开，不让冬中这口现钱一转身就被锅火、门路和差役后手一并咬空。', 'good']);
              } else log.push(['想先把冬中回铺回签与灯炭门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_winter_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '来春铺路已留');
                log.push(['先留来春回铺脚费与递话薄礼：铜钱-60、捎信+1、通融+1、备役+1。你先把来春回铺脚路、递话薄礼和差役后手分开，不让明春第一旬又拿同一口现钱四处堵漏。', 'good']);
              } else log.push(['想先留来春回铺脚费与递话薄礼，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_shop_winter_tail':
              if (spendCopper(70)) {
                S.本年家催账 += 1;
                S.本年家备役 += 1;
                S.家族 += 1;
                pushFamilySeasonTag(stepTag + '冬尾铺签已分');
                log.push(['先把年下回铺回签与来春脚单分开：铜钱-70、催账+1、备役+1、家族+1。你先把年下回铺回签、来春脚单、递话脚费和锅火后手拆开，不让旧铺回音和明春脚路继续挤同一口过冬钱。', 'good']);
              } else log.push(['想先把年下回铺回签与来春脚单分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_master':
              if (spendCopper(70)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '师门探差');
                log.push(['凭师门旧识先探差役路数：铜钱-70、家族+1、备役后手+1。不是到催差那天才求人，而是先把旧掌柜与同门这层门路压进后手里。', 'good']);
              } else log.push(['想凭师门旧识先探差役路数，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_write':
              var writeGain = 140 + (S.生员身份 ? 30 : 0);
              S.铜钱 += writeGain;
              S.识字转业值 += 1;
              S.本年家贴家 += 1;
              pushFamilySeasonTag(stepTag + '代写文契');
              log.push([season.id === 'summer'
                ? ('伏夏代写课单补家计：铜钱+' + writeGain + '、识字转业值+1。你把识字底子先换成了汤药和锅火能用的一口现钱。')
                : (season.id === 'autumn'
                  ? ('秋里代写契纸补锅火：铜钱+' + writeGain + '、识字转业值+1。润笔没有停在体面话里，而是真被你拆回了家计。')
                  : (season.id === 'winter'
                    ? ('年关誊账补现钱：铜钱+' + writeGain + '、识字转业值+1。零碎笔墨钱先被你拢成了一口能过冬的现钱。')
                    : ('代写文契补家计：铜钱+' + writeGain + '、识字转业值+1。笔墨底子终于不只停在体面话里。'))), 'good']);
              break;
            case 'f_route_school_summer_fee':
              if (spendCopper(70)) {
                S.本年家问价 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '夏课碎费');
                log.push(['把潮纸、投帖脚费与塾馆茶汤分开：铜钱-70、问价+1、衣药+1、通融+1。伏夏里最先咬人的不是大账，而是这层先冒头的纸墨脚费和凉热小耗。', 'good']);
              } else log.push(['想把潮纸、投帖脚费与塾馆茶汤分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_summer_cough':
              if (spendCopper(65)) {
                S.本年家衣药 += 1;
                S.本年家照家 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏抄手凉药');
                log.push(['先把伏夏抄手凉药与孩子草鞋分开：铜钱-65、衣药+1、照家+1、通融+1。誊抄小钱、孩子草鞋、凉药门包和锅火先被拆开，举业路伏夏中旬这层“识字活刚接上、身子和家里先来磨钱”的真摩擦终于被压回了同旬。', 'good']);
              } else log.push(['想先把伏夏抄手凉药与孩子草鞋分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_summer_soup':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏馆汤');
                log.push(['先把伏夏馆汤与凉药门包分开：铜钱-55、衣药+1、捎信+1、通融+1。馆里茶汤、凉药门包、递话脚费和锅火先被拆开，举业路养家阶段的伏夏上旬不再只剩“先问馆课”，连最先冒头的暑天碎账也压回了真账。', 'good']);
              } else log.push(['想先把伏夏馆汤与凉药门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_spring_copy':
              if (spendCopper(90)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春课拆家用');
                log.push(['把春里纸笔拆作香纸与课本：铜钱-90、贴家+1、衣药+1、家族+2。春头这口能写字换来的小钱，没有被误当成“先宽一旬”，而是先拆回家里眼前最缺的几样细账。', 'good']);
              } else log.push(['想把春里纸笔拆作香纸与课本，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_spring_contract':
              if (spendCopper(50)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春头馆契');
                log.push(['先把春头馆契与学生纸样分开：铜钱-50、捎信+1、通融+1、家族+1。你先把馆契纸样、递话脚费和家里盐炭锅火拆开，不让今年第一口门路钱刚起头就被零碎磨成一句空话。', 'good']);
              } else log.push(['想先把春头馆契与学生纸样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_note':
              if (spendCopper(40)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '问馆课保结');
                log.push([season.id === 'summer'
                  ? '先问夏课馆账与保结门路：铜钱-40、家族+1。伏夏哪家还续馆课、哪位保结还肯说话，先被你摸实了一层。'
                  : (season.id === 'autumn'
                    ? '先问秋馆课与学生人情：铜钱-40、家族+1。秋里哪家学生家还肯续馆、哪层人情能换来一口润笔，先被你摸清了一层。'
                    : '先问馆课与保结门路：铜钱-40、家族+1。馆课和保结都还没落到手里，可哪家要开蒙、哪位廪保肯说话，先被你摸清了一层。'), 'good']);
              } else log.push(['想先问馆课与保结门路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_book':
              if (spendCopper(50)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '年关馆账');
                log.push(['年关先理馆账与明春纸墨：铜钱-50、家族+1、捎信+1、备役后手+1。旧馆账、明春纸墨与差钱先被分开，不再等年后第一口现钱再乱拆。', 'good']);
              } else log.push(['想先在年关理馆账与明春纸墨，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_fee':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬馆灯脚');
                log.push(['先把旧馆灯油与拜帖脚费分开：铜钱-60、衣药+1、捎信+1、通融+1。年关上旬最容易把门路和锅火一起磨薄的那层灯脚细钱，这次先被你拆开了。', 'good']);
              } else log.push(['想先把旧馆灯油与拜帖脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_cloth':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '冬头夹衣');
                log.push(['先把冬头馆回与孩子夹袄分开：铜钱-55、衣药+1、捎信+1、通融+1、供读+1。旧馆回信、孩子夹袄、递话门包和锅火后手先被拆开，举业路成年人冬头这层“门路未断、家里却先要过冬添衣”的细账不再一起拖进腊月。', 'good']);
              } else log.push(['想先把冬头馆回与孩子夹袄分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_split':
              if (spendCopper(100)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '冬尾笔墨拆账');
                log.push(['把年尾笔墨拆作炭药与帖费：铜钱-100、贴家+1、衣药+1、备役后手+1、家族+1。零碎束脩与誊账钱没有被你整手握死，而是先拆进过冬与来春两本账里。', 'good']);
              } else log.push(['想把年尾笔墨拆作炭药与帖费，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_mid_reply':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '冬中馆札');
                log.push(['先把冬中馆札与孩子炭笔分开：铜钱-60、捎信+1、通融+1、供读+1、家族+1。旧馆回札、孩子炭笔、递话门包和守岁锅火先被拆开，举业路冬中这层“门路未断、家里也得续写字”的细账不再一起拖到年后。', 'good']);
              } else log.push(['想先把冬中馆札与孩子炭笔分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_cough':
              if (spendCopper(70)) {
                S.本年家衣药 += 1;
                S.本年家将养 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬中咳药');
                log.push(['先把冬中咳药与坐馆灯油分开：铜钱-70、衣药+1、将养+1、通融+1。寒咳药包、旧馆灯油、递话脚费和守夜锅火先被拆开，举业路冬中这层“门路还能续、身子先别倒”的小账终于不再混成一口硬扛。', 'good']);
              } else log.push(['想先把冬中咳药与坐馆灯油分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_split':
              if (spendCopper(150)) {
                var schoolSplitFamily = (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.家族 += schoolSplitFamily;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '馆课拆账');
                log.push(['把秋里润笔拆作锅火与差钱：铜钱-150、家族+' + schoolSplitFamily + '、贴家+1、备役后手+1。笔墨钱没有被你一把花掉，而是先拆进锅火和差役两本账里。', 'good']);
              } else log.push(['想把秋里润笔拆作锅火与差钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_mid_fee':
              if (spendCopper(65)) {
                S.本年家问价 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋中馆脚');
                log.push(['先把秋中馆账脚费与租路饭钱分开：铜钱-65、问价+1、捎信+1、通融+1。旧馆润笔、租路饭钱、回话脚费和锅火差钱没再混成一团；举业路成年人秋中这层“馆账刚回、回乡和家用又来追钱”的细账，也终于被压回了同旬。', 'good']);
              } else log.push(['想先把秋中馆账脚费与租路饭钱分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_reply':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋馆回话');
                log.push(['先把保结薄礼与学生家回话脚费分开：铜钱-60、家族+1、捎信+1、通融+1。秋里最细、也最会把润笔拖成空话的那层回话人情，这次先被你压回了真账。', 'good']);
              } else log.push(['想先把保结薄礼与学生家回话脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_tail':
              if (spendCopper(55)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '秋尾馆签');
                log.push(['先把秋尾回签与炭脚回礼分开：铜钱-55、捎信+1、通融+1、衣药+1。你先把学生家秋尾回签、炭脚锅火、小回礼和来春帖路后手拆开，不让“秋账未净、冬前后手先来”的那层细账又拖成一句空话。', 'good']);
              } else log.push(['想先把秋尾回签与炭脚回礼分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_register':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '秋尾簿册');
                log.push(['先把秋尾簿册与孩子灯油分开：铜钱-60、捎信+1、通融+1、供读+1。学生家簿册、回话门包、孩子灯油和来春帖样先被拆开，举业路秋尾这层“馆课尚续、家里读写也不能断”的后手终于被压回了真账。', 'good']);
              } else log.push(['想先把秋尾簿册与孩子灯油分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_packet':
              if (spendCopper(55)) {
                S.本年家捎信 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头馆帖');
                log.push(['先把秋头馆帖与孩子纸包分开：铜钱-55、捎信+1、衣药+1、通融+1。你先把学生家帖脚、孩子纸包和锅火拆开，不让秋头这口“馆课未稳、家里先要用”的细账又拖到秋中才一起反咬。', 'good']);
              } else log.push(['想先把秋头馆帖与孩子纸包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_autumn_cloth':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头夹衣');
                log.push(['先把秋头馆回与孩子夹衣分开：铜钱-60、衣药+1、捎信+1、通融+1。旧馆回话、孩子夹衣、递话脚费和锅火先被拆开，举业路秋头这层“馆课还未坐实、家里已先要换季”的细账终于被压回了真账。', 'good']);
              } else log.push(['想先把秋头馆回与孩子夹衣分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_tutor_collect':
              var tutorCollectGain = (S.本年家捎信 || 0) > 0 ? 170 : 130;
              S.铜钱 += tutorCollectGain;
              S.本年家催账 += 1;
              S.本年家贴家 += 1;
              pushFamilySeasonTag(stepTag + '结回馆课钱');
              log.push([season.id === 'autumn'
                ? ('结回秋馆课与润笔：铜钱+' + tutorCollectGain + ((S.本年家捎信 || 0) > 0 ? '。前头先问过秋馆课和学生人情，这口钱回得更实。' : '。这不是凭空添一笔，只把该你的那口秋里笔墨钱真正拢回家计。'))
                : (season.id === 'winter'
                  ? ('年关结回馆课与束脩：铜钱+' + tutorCollectGain + ((S.本年家捎信 || 0) > 0 ? '。前头先把旧馆账理清了，这口钱没有再悬到明春。' : '。不是凭空多一笔，只把旧馆账上该到家的那口钱先拢回来。'))
                  : ('结回馆课与抄写钱：铜钱+' + tutorCollectGain + ((S.本年家捎信 || 0) > 0 ? '。前头先问过馆课和保结，这口钱回得更实。' : '。这不是凭空添一笔，只把该你的笔墨钱真正拢回家计。'))), 'good']);
              break;
            case 'f_route_school_spring_reply':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春尾馆批');
                log.push(['先把春尾馆批与端午纸样分开：铜钱-60、捎信+1、通融+1、衣药+1。你先把旧馆回批、端午纸样、递话脚费和家里盐药锅火拆开，不让春尾这层“馆里还认你、锅火却先来要钱”的细账又拖到夏里一起反咬。', 'good']);
              } else log.push(['想先把春尾馆批与端午纸样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_spring_fan':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.家族 += 1;
                pushFamilySeasonTag(stepTag + '春尾扇药');
                log.push(['先把春尾扇药与塾门回帖分开：铜钱-55、衣药+1、捎信+1、通融+1、家族+1。旧馆回帖、端午蒲扇凉药、递话门包和灶下锅火先被拆回这一旬，举业路春尾那层“馆批将回未回、换季小耗却先来”的真摩擦不再被一句“再撑几天”带过。', 'good']);
              } else log.push(['想先把春尾扇药与塾门回帖分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_surety':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '保结探差');
                log.push([season.id === 'autumn'
                  ? '托廪保先问秋后差钱：铜钱-60、家族+1、备役后手+1。你先把塾师、廪保和学生家这层人情压进秋后后手里，不等催差到了门口才乱求人。'
                  : (season.id === 'winter'
                    ? '趁年关先把保结与差钱说定：铜钱-60、家族+1、备役后手+1。塾师、廪保和学生家这层门路先被你说定，明春差钱不至再抢同一口现钱。'
                    : '凭塾师保结先探差役：铜钱-60、家族+1、备役后手+1。不是到催差那天才求人，而是先把塾师、廪保和学生家这层门路压进后手里。'), 'good']);
              } else log.push(['想凭塾师保结先探差役，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_summer_reply':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '夏尾馆信');
                log.push(['先把夏尾馆信与秋前纸样分开：铜钱-60、捎信+1、通融+1、衣药+1。你先把学生家回话、秋前纸样、递话脚费和锅火拆成两三口小钱，不让伏夏尾声这一层门路后手又去抢家里眼前的凉药与灶火。', 'good']);
              } else log.push(['想先把夏尾馆信与秋前纸样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '来春帖费');
                log.push(['先留来春拜帖与开馆脚费：铜钱-60、捎信+1、通融+1、备役后手+1。明春该递哪张帖子、哪口脚费先留给开馆与差钱，这一旬先被你写进后手。', 'good']);
              } else log.push(['想先留来春拜帖与开馆脚费，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_copy':
              if (spendCopper(55)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.家族 += 1;
                S.本年家供读 += 1;
                pushFamilySeasonTag(stepTag + '冬尾帖样');
                log.push(['先把年下馆信与孩子帖样分开：铜钱-55、捎信+1、通融+1、家族+1、供读+1。旧馆年下回音、孩子来春帖样、递话门包和锅火后手先被拆开，举业路冬尾这层“门路要续、家里也得接着读写”的细账不再一起挤年火钱。', 'good']);
              } else log.push(['想先把年下馆信与孩子帖样分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_school_winter_medicine':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.家族 += 1;
                pushFamilySeasonTag(stepTag + '冬尾炭鞋');
                log.push(['先把年下回话与炭药草鞋分开：铜钱-60、衣药+1、捎信+1、通融+1、家族+1。旧馆年下回话、守岁炭药、孩子来春草鞋、递话门包和锅火后手先被拆开，举业路冬尾这层“旧馆还在回音、家里却得先过冬续脚”的细账不再一起挤年火钱。', 'good']);
              } else log.push(['想先把年下回话与炭药草鞋分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_send':
              if (spendCopper(90)) {
                var wageFamily = (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.家族 += wageFamily;
                S.本年家贴家 += 1;
                pushFamilySeasonTag(stepTag + '工头捎工食');
                log.push(['托工头先捎工食回家：铜钱-90、家族+' + wageFamily + ((S.本年家捎信 || 0) > 0 ? '。前一旬先问过活路与回钱门道，这口工食回得更实。' : '。虽少了一口手边现钱，家里这旬却不至先断。'), 'good']);
              } else log.push(['想先托工头捎工食回家，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_note':
              if (spendCopper(30)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '问活路');
                log.push(['托工头先问下季活路：铜钱-30、家族+1。钱还没回，可哪旬有活、哪口工食能结，先被你摸清了一层。', 'good']);
              } else log.push(['想先托工头问下季活路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_spring_head_reply':
              if (spendCopper(45)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春头回签已分');
                log.push(['先把春头回签与门包盐药分开：铜钱-45、衣药+1、捎信+1、通融+1。旧工头回签、递话门包和灶下盐药锅火先被拆开，卖工路开春第一旬不再只剩“去问活路”，连“钱将回未回、锅火已先来”这层细账也被压回了真账。', 'good']);
              } else log.push(['想先把春头回签与门包盐药分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_summer_note':
              if (spendCopper(40)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '问工棚药路');
                log.push(['先问工棚落脚与凉汤药脚路：铜钱-40、家族+1、捎信+1、通融+1。你先把哪处工棚肯留脚、哪家药铺肯先赊一口凉汤药摸清，不让伏夏把人和工路一并熬断。', 'good']);
              } else log.push(['想先问工棚落脚与凉汤药脚路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_summer_packet':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏回签已分');
                log.push(['先把伏夏回签与草鞋药包分开：铜钱-55、衣药+1、捎信+1、通融+1。旧工棚回签、草鞋药包、递话门包和凉汤脚费先被拆开，卖工路伏夏上旬不再只剩“先问工棚”，连这层热里最细的小耗也回到了真账。', 'good']);
              } else log.push(['想先把伏夏回签与草鞋药包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_note':
              if (spendCopper(30)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家问价 += 1;
                pushFamilySeasonTag(stepTag + '问秋工');
                log.push(['先问秋收旺工与回乡搭手：铜钱-30、家族+1、捎信+1、问价+1。你先把哪处旺工结现更快、家里哪天更缺人摸清，不让秋里两头都只顾着催你。', 'good']);
              } else log.push(['想先问秋收旺工与回乡搭手，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_packet':
              if (spendCopper(50)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋头回签已分');
                log.push(['先把秋头回签与草鞋脚费分开：铜钱-50、衣药+1、捎信+1、通融+1。旧工回签、回乡草鞋、递话脚费和锅火后手先被拆开，卖工路秋头不再只剩“问哪处旺工更值”，连秋钱未落袋前那层最先冒头的小耗也进了账。', 'good']);
              } else log.push(['想先把秋头回签与草鞋脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_tail':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋尾差脚');
                log.push(['先把秋尾差脚与锅火门包分开：铜钱-55、衣药+1、捎信+1、通融+1。回话差脚、递话门包和锅火药钱先被拆开，旺工将歇时这层最不起眼的细耗不再混成一句“秋后再算”。', 'good']);
              } else log.push(['想先把秋尾差脚与锅火门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_lamp':
              if (spendCopper(50)) {
                S.家族 += 1;
                S.本年家照家 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋尾灯油已分');
                log.push(['先把秋尾回签与灯油针线分开：铜钱-50、照家+1、捎信+1、通融+1、家族+1。旧工回签、灯油针线、递话门包和年下锅火后手先被拆开，卖工路秋尾不再只剩“再等等回话”，连年关前最细的家内小耗也开始同旬见光。', 'good']);
              } else log.push(['想先把秋尾回签与灯油针线分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_split':
              if (spendCopper(140)) {
                S.家族 += (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '工钱拆账');
                log.push(['把工钱拆作家用与差钱：铜钱-140、家族+' + ((S.本年家捎信 || 0) > 0 ? 3 : 2) + '、备役后手+1。同一口工钱先被拆进锅火与差役两本账里。', 'good']);
              } else log.push(['想把工钱拆作家用与差钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_spring_bundle':
              if (spendCopper(110)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春工拆家用');
                log.push(['把春工钱拆作锅火与草鞋：铜钱-110、贴家+1、衣药+1、家族+2。春头这口工钱没有被误当成“终于能缓一旬”，而是先拆回锅火、草鞋和家里零碎小耗。', 'good']);
              } else log.push(['想把春工钱拆作锅火与草鞋，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_spring_reply':
              if (spendCopper(65)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春中回签已分');
                log.push(['先把春中回签与孩子草鞋分开：铜钱-65、衣药+1、捎信+1、通融+1。旧工头回签、孩子草鞋、递话门包和家里盐药锅火先被拆开，卖工路春中不再只剩“工钱拆给锅火”，连这层将回未回的小耗也回到了真账。', 'good']);
              } else log.push(['想先把春中回签与孩子草鞋分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_summer_bundle':
              if (spendCopper(120)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '伏夏拆工食');
                log.push(['把伏夏工食拆作汤药与家用：铜钱-120、贴家+1、衣药+1、家族+2。钱没有多出来，只是先被你拆成锅火和汤药两小口，不让人先坏在夏里。', 'good']);
              } else log.push(['想把伏夏工食拆作汤药与家用，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_summer_reply':
              if (spendCopper(60)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '伏夏回签已分');
                log.push(['先把伏夏回签与锅火凉药分开：铜钱-60、衣药+1、捎信+1、通融+1。旧工棚回签、锅火凉药、递话门包和家里急米先被拆开，卖工路伏夏中旬不再只剩“工食拆账”，连这层将回未回的热里小耗也回到了真账。', 'good']);
              } else log.push(['想先把伏夏回签与锅火凉药分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_split':
              if (spendCopper(160)) {
                var autumnWageFamily = (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.家族 += autumnWageFamily;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '秋工拆账');
                log.push(['把秋工钱拆作锅火与差钱：铜钱-160、家族+' + autumnWageFamily + '、贴家+1、备役+1。秋里这一口旺工钱没被你当成宽裕，而是先拆进家用与差钱两本账里。', 'good']);
              } else log.push(['想把秋工钱拆作锅火与差钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_receipt':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家问价 += 1;
                pushFamilySeasonTag(stepTag + '秋中回签已分');
                log.push(['先把秋中回签与租路饭钱分开：铜钱-60、捎信+1、通融+1、问价+1。旧工回签、租路饭钱、递话脚费和锅火后手先被拆开，卖工路秋中不再只剩“秋工钱要不要拆账”，连这层旺工未落袋前的脚路小耗也进了真账。', 'good']);
              } else log.push(['想先把秋中回签与租路饭钱分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_autumn_cloth':
              if (spendCopper(65)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '秋中夹衣已分');
                log.push(['先把秋中回签与孩子夹衣分开：铜钱-65、衣药+1、捎信+1、通融+1。旧工回签、孩子夹衣、递话脚费和锅火后手先被拆回这一旬，卖工路秋中不再只剩“秋工钱快没快回手”，连秋凉换季这层家内小耗也开始同旬见光。', 'good']);
              } else log.push(['想先把秋中回签与孩子夹衣分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_collect':
              var wageCollectGain = (S.本年家捎信 || 0) > 0 ? 150 : 110;
              S.铜钱 += wageCollectGain;
              S.本年家催账 += 1;
              pushFamilySeasonTag(stepTag + '结回欠工');
              log.push(['回工棚结一回欠工：铜钱+' + wageCollectGain + ((S.本年家捎信 || 0) > 0 ? '。前头先问过活路与回钱门道，这口欠工回得更实。' : '。这不是凭空添一笔，只把该你的那口工钱真正拢回来。'), 'good']);
              break;
            case 'f_route_wage_winter_book':
              if (spendCopper(50)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '年关问欠工');
                log.push(['年关先问欠工与明春活路：铜钱-50、家族+1、捎信+1、备役+1。你先把欠工、明春工棚脚路和差钱后手分开，不让年后第一口现钱又被混着吃掉。', 'good']);
              } else log.push(['想先在年关问欠工与明春活路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_jacket':
              if (spendCopper(55)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬头夹衣已分');
                log.push(['先把孩子夹衣与回签门包分开：铜钱-55、衣药+1、捎信+1、通融+1。孩子夹衣、旧工头回签门包、递话脚费和锅火后手先被拆回这一旬，卖工路冬头不再只剩“问明春工路”，连家里换季这层小耗也开始同年见光。', 'good']);
              } else log.push(['想先把孩子夹衣与回签门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_paper':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家供读 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬头炭笔已分');
                log.push(['先把冬头回签与孩子炭笔分开：铜钱-60、供读+1、捎信+1、通融+1、家族+1。旧工头回签、孩子炭笔、递话门包和守岁锅火先被拆开，卖工路冬头不再只剩“先问明春活路”，连孩子来春读写这层家内细账也开始同旬见光。', 'good']);
              } else log.push(['想先把冬头回签与孩子炭笔分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_gift':
              if (spendCopper(80)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '工棚炭礼已分');
                log.push(['先把旧工头薄礼与炭钱分开：铜钱-80、贴家+1、衣药+1、通融+1、家族+1。你先把旧工头薄礼、炭钱和回话脚费拆开，不让卖工路年下最碎的那层门路耗损继续糊成一团。', 'good']);
              } else log.push(['想先把旧工头薄礼与炭钱分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_register':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬中抄册已理');
                log.push(['先把里书催册与工棚回话分开：铜钱-60、备役+1、通融+1、家族+1。里书要你补册点名、旧工头还在回话，两头都不算大账，却会在年关一起挤同一口现钱；这一旬先拆开，后面才不至把制度后手和工路门路一起磨薄。', 'good']);
              } else log.push(['想先把里书催册与工棚回话分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_reply':
              if (spendCopper(70)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬中回话已留');
                log.push(['先把冬中欠工回话与炭鞋门包分开：铜钱-70、衣药+1、捎信+1、通融+1。欠工回话、炭钱棉鞋、递话门包和来春草鞋后手先被拆开，年关这层“钱还没结、过冬与来春先要花”的小耗不再混成一句硬熬。', 'good']);
              } else log.push(['想先把冬中欠工回话与炭鞋门包分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_duty':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '工头探差');
                log.push(['凭工头旧识先探差役：铜钱-60、家族+1、备役后手+1。不是到催差那天才求人，而是先把工头与熟手这层门路压进后手里。', 'good']);
              } else log.push(['想凭工头旧识先探差役，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_spring_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '春尾工路已留');
                log.push(['先把回话脚费与下旬工路分开：铜钱-60、捎信+1、通融+1、备役+1。你先把旧工头回话脚费、下一程工路和差役后手拆开，不让春尾刚结回的一口工钱转头又被混吃。', 'good']);
              } else log.push(['想先把回话脚费与下旬工路分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_spring_mat':
              if (spendCopper(55)) {
                S.本年家贴家 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '春尾草席已分');
                log.push(['先把春尾回签与量斗草席分开：铜钱-55、贴家+1、捎信+1、通融+1。旧工头回签、量斗草席、递话门包和夏前草鞋先被拆开，卖工路春尾不再只剩“回头结欠工”，连夏前家用和门包这层小耗也回到了真账。', 'good']);
              } else log.push(['想先把春尾回签与量斗草席分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '问明春工棚');
                log.push(['先问明春工棚与头程脚路：铜钱-60、捎信+1、通融+1、备役+1。你先把明春头程脚路、回话脚费和差役后手压进账里，不让卖工路明春第一口现钱又从冷面求人开始。', 'good']);
              } else log.push(['想先问明春工棚与头程脚路，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_wage_winter_tail':
              if (spendCopper(65)) {
                S.本年家衣药 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '冬尾草鞋已分');
                log.push(['先把年下回签与来春草鞋分开：铜钱-65、衣药+1、捎信+1、通融+1。旧工头年下回签、来春草鞋、递话门包和锅火后手先被拆开，卖工路冬尾不再只剩“明春再说”。', 'good']);
              } else log.push(['想先把年下回签与来春草鞋分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_social':
              if (spendCopper(socialCost)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '里甲通融');
                log.push(['走里甲人情：铜钱-' + socialCost + '、家族+1。不是买平安，而是把“到期才慌”改成“平日先通一层气口”。', 'good']);
              } else log.push(['想走里甲人情，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_message':
              if (spendCopper(20)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '捎话');
                log.push(['托人捎话回乡：铜钱-20、家族+1、捎信+1。钱不多，却把家里这一旬的口风与心气先续了一口。', 'good']);
              } else log.push(['想托人捎话回乡，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_favor_lend':
              if (spendCopper(80)) {
                S.人情欠条 = (S.人情欠条 || 0) + 1;
                S.家族 += 1;
                S.本年家人情借 = (S.本年家人情借 || 0) + 1;
                pushFamilySeasonTag(stepTag + '人情借');
                log.push(['借出一口人情急钱：铜钱-80、家族+1，并记作“人情欠条+1”（欠条不算现银，须等日后讨回）。', 'good']);
              } else log.push(['想借出一口人情急钱，但这一旬铜钱已先被别处占住，只得推辞。', 'bad']);
              break;
            case 'f_kitchen':
              if (spendCopper(kitchenCost)) {
                S.家族 += 1;
                S.本年家照家 += 1;
                pushFamilySeasonTag(stepTag + '灯油针线');
                log.push(['添灯油针线：铜钱-' + kitchenCost + '、家族+1。不是体面消费，只是把锅火边最容易被一句话带过的细账摊回这一旬。', 'good']);
              } else log.push(['想先添灯油针线，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'f_ancestral':
              if (spendCopper(25)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '清明祭扫');
                log.push(['清明前先办祭扫修谱：铜钱-25、家族+1、通融+1。不是大铺张，只把“这一房还记得祖上规矩”的气口留住。', 'good']);
              } else log.push(['想清明前先办祭扫修谱，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_cool':
              if (spendCopper(25)) {
                S.体魄 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '艾草凉汤');
                log.push(['买艾草凉汤解暑：铜钱-25、体魄+1、衣药+1。不是治大病，只把伏夏湿热小耗先压住一层。', 'good']);
              } else log.push(['想买艾草凉汤解暑，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_tax':
              if (spendCopper(90)) {
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '兑差票');
                log.push(['先兑丁粮差票压秋后催缴：铜钱-90、备役后手+1、通融+1。钱没有变多，只是先把秋后那层催缴压在账里。', 'good']);
              } else log.push(['想先兑丁粮差票压秋后催缴，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_registry':
              if (spendCopper(20)) {
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '黄册点役');
                log.push(['翻黄册点役：铜钱-20、备役后手+1、通融+1。不是买通，只是先把差票口风与轮役次序问明，免得到了秋后才被制度账临门扯散。', 'good']);
              } else log.push(['想翻黄册点役先问明差票口风，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_favor_collect':
              if ((S.人情欠条 || 0) > 0) {
                S.人情欠条 -= 1;
                S.铜钱 += 100;
                S.本年家人情收 = (S.本年家人情收 || 0) + 1;
                pushFamilySeasonTag(stepTag + '人情收');
                log.push(['讨回一口人情钱：铜钱+100、人情欠条-1。不是凭空多钱，只把先前借出去的那口拢回来了。', 'good']);
              } else log.push(['想讨回人情钱，但眼下并无欠条可讨，只得作罢。', 'bad']);
              break;
            case 'f_route_farm_note':
              var farmNoteCost = season.id === 'summer' ? 40 : (season.id === 'winter' ? 35 : 30);
              if (spendCopper(farmNoteCost)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                if (season.id === 'spring' || season.id === 'autumn') S.本年家问价 += 1;
                pushFamilySeasonTag(stepTag + (season.id === 'spring'
                  ? '春问佃例'
                  : (season.id === 'summer' ? '保水口' : (season.id === 'autumn' ? '秋问租话' : '点谷种仓脚'))));
                log.push([(
                  season.id === 'spring'
                    ? '先问佃例与水口'
                    : (season.id === 'summer'
                      ? '先托邻保水口'
                      : (season.id === 'autumn' ? '先问今年租话与米路' : '年关先点谷种与仓脚')))
                  + '：铜钱-' + farmNoteCost + '、通融+1、家族+1'
                  + ((season.id === 'spring' || season.id === 'autumn') ? '、问价+1' : '')
                  + '。不是多得一笔，只把田面、租话和乡里口风先摸明。', 'good']);
              } else log.push(['想先把佃例、水口或谷种仓脚问明，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_route_farm_split':
              if (season.id === 'autumn') {
                if (S.存米 >= 1) {
                  S.存米 -= 1;
                  S.家族 += 2;
                  S.本年家贴家 += 1;
                  S.本年家备役 += 1;
                  pushFamilySeasonTag(stepTag + '秋拆租谷');
                  log.push(['把秋粮拆作纳租与锅火：存米-1、贴家+1、备役+1、家族+2。谷一进仓就先被分作口粮与差钱，不再只停在“今年有收”的大话上。', 'good']);
                } else log.push(['想把秋粮拆作纳租与锅火，但这一旬存米不够，只得暂缓。', 'bad']);
              } else {
                var farmSplitCost = season.id === 'summer' ? 80 : (season.id === 'winter' ? 90 : 100);
                if (spendCopper(farmSplitCost)) {
                  if (season.id === 'spring') {
                    S.家族 += 2;
                    S.本年家贴家 += 1;
                    S.本年家照家 += 1;
                    pushFamilySeasonTag(stepTag + '春拆籽种');
                    log.push(['把春钱拆作籽种与锅火：铜钱-' + farmSplitCost + '、贴家+1、照家+1、家族+2。先把籽种与家火分开，这一旬才不至两头都空等。', 'good']);
                  } else if (season.id === 'summer') {
                    S.家族 += 1;
                    S.体魄 += 1;
                    S.本年家贴家 += 1;
                    S.本年家衣药 += 1;
                    pushFamilySeasonTag(stepTag + '夏拆凉药');
                    log.push(['把伏夏钱拆作凉药与草绳：铜钱-' + farmSplitCost + '、贴家+1、衣药+1、体魄+1、家族+1。不是治大病，只把热里最先磨人的那层小耗先压住。', 'good']);
                  } else {
                    S.家族 += 1;
                    S.本年家贴家 += 1;
                    S.本年家修缮 += 1;
                    pushFamilySeasonTag(stepTag + '冬拆种谷');
                    log.push(['把冬钱拆作灯油与明春谷种：铜钱-' + farmSplitCost + '、贴家+1、修缮+1、家族+1。钱没变多，只是先把过冬与开春的两口后手分开。', 'good']);
                  }
                } else log.push(['想先把这一旬田头细钱拆开，但这一旬铜钱不够，只得暂缓。', 'bad']);
              }
              break;
            case 'f_route_farm_store':
              var farmStoreCost = season.id === 'summer' ? 50 : (season.id === 'autumn' ? 60 : (season.id === 'winter' ? 50 : 40));
              if (spendCopper(farmStoreCost)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + (season.id === 'spring'
                  ? '春记换工'
                  : (season.id === 'summer' ? '夏留秋租' : (season.id === 'autumn' ? '秋收租票' : '冬留修渠'))));
                log.push([(
                  season.id === 'spring'
                    ? '先记换工与佃账'
                    : (season.id === 'summer'
                      ? '托邻代浇并留秋租后手'
                      : (season.id === 'autumn' ? '先把租谷与差票分开收住' : '先把修渠钱与年礼分开')))
                  + '：铜钱-' + farmStoreCost + '、通融+1、备役+1、家族+1。不是多挣一笔，只把田头和家里的后手先留在这一旬账里。', 'good']);
              } else log.push(['想先把这一旬租谷、佃账或修渠后手收住，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_rest':
              S.体魄 += 5;
              S.本年家将养 += 1;
              pushFamilySeasonTag(stepTag + '将养');
              log.push(['将养：体魄+5', 'good']);
              break;
          }
        });

        if (season.id === 'spring' && xun === 2) {
          var springHandled = !!(picked.f_market || picked.f_social || picked.f_child || picked.f_kitchen
            || picked.f_route_split || picked.f_route_spring_price || picked.f_route_spring_bundle
            || picked.f_route_spring_ritual || picked.f_route_spring_mid_reply || picked.f_route_remit
            || picked.f_route_shop_note || picked.f_route_school_note || picked.f_route_wage_note);
          if (springHandled) {
            pushFamilySeasonTag(stepTag + '春起细账已理');
            log.push(['〔春起碎账〕开春里灯油针线、赶集脚费与零碎锅火已被你提前摊开；这一旬没有再被“开春小耗”悄悄磨薄。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '春起碎账');
            log.push(['〔春起碎账〕开春灯油针线、赶集脚费与零碎锅火一齐要钱：铜钱-40。不是大账，却把这一年一开头就先磨去一层。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春起硬顶');
            log.push(['〔春起碎账〕这一旬连开春小耗都腾挪不开，只得先硬顶过去（家族-1）。', 'bad']);
          }
        }

        if (season.id === 'spring' && xun === 3) {
          // 祭扫修谱本是独立一摊，但在回放策略里允许“同旬已为家口与里甲跑动”视作气口已顾，
          // 避免新增硬性扣款把既有回放打散。
          var qingmingHandled = !!(picked.f_ancestral || picked.f_social || picked.f_kitchen
            || picked.f_duty || picked.f_child || picked.f_route_school || picked.f_route_school_note);
          if (qingmingHandled) {
            pushFamilySeasonTag(stepTag + '清明已办');
            log.push(['〔清明人情〕祭扫修谱与乡里口风已被你提前顾住；这一旬没有再因为“全忘了礼”让亲族话里添凉。', 'good']);
          } else if (spendCopper(25)) {
            pushFamilySeasonTag(stepTag + '清明人情');
            log.push(['〔清明人情〕纸香、薄礼与修谱口风一齐要钱：铜钱-25。不是大账，却最容易让人情起皱。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '清明硬顶');
            log.push(['〔清明人情〕这一旬连薄礼纸香都挪不开，只得硬顶过去；亲族话里更凉一层（家族-1）。', 'bad']);
          }
        }

        if (season.id === 'summer' && xun >= 2 && !picked.f_mend && !picked.f_rest && !picked.f_cool) {
          S.体魄 -= 2;
          log.push(['〔伏夏损耗〕这一旬没顾上衣药也没将养，热毒和劳损还是悄悄把身子磨去一层（体魄-2）', 'bad']);
        }
        if (season.id === 'summer' && xun === 2) {
          var summerHandled = !!(picked.f_child || picked.f_mend || picked.f_rest || picked.f_cool
            || picked.f_route_bundle || picked.f_route_shop_bundle || picked.f_route_wage_summer_bundle || picked.f_route_write
            || picked.f_route_summer_home_note || picked.f_route_summer_heat || picked.f_route_summer_register
            || picked.f_route_sample || picked.f_route_summer_packet);
          if (summerHandled) {
            pushFamilySeasonTag(stepTag + '伏夏小耗已顾');
            log.push(['〔伏夏小耗〕这一旬先把孩子热耗、草鞋针线、零碎汤药或伏夏布药顾住了；小耗没有消失，但没再继续滚成更大的缺口。', 'good']);
          } else if (spendCopper(60)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏小耗');
            log.push(['〔伏夏小耗〕伏夏里草鞋、凉药、孩子小热和汗疹一齐冒头：铜钱-60、衣药+1。不是大祸，只是同一年里又多了一口真支出。', 'bad']);
          } else {
            S.体魄 -= 1;
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏硬扛');
            log.push(['〔伏夏小耗〕零碎病耗还是找上门来：现钱不够，只得硬扛，体魄-1、家族-1。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          var autumnHandled = !!(picked.f_social || picked.f_duty
            || picked.f_route_autumn_split || picked.f_route_shop_split || picked.f_route_wage_autumn_split
            || picked.f_route_autumn_mid_reply || picked.f_route_autumn_mid_clothes || picked.f_route_remit
            || picked.f_route_school_split || picked.f_route_split);
          if (autumnHandled) {
            pushFamilySeasonTag(stepTag + '秋后细账已拆');
            log.push(['〔秋后杂支〕秋后的牙税、脚钱、锅火与差钱都已被你提前拆开；同一口回钱这旬没有再被混着吃掉。', 'good']);
          } else if (spendCopper(70)) {
            pushFamilySeasonTag(stepTag + '秋后杂支');
            log.push(['〔秋后杂支〕秋后零碎脚钱、牙税与催差口风一起压来：铜钱-70。不是新主线，只是同一年里又一层真支出。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋后硬顶');
            log.push(['〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；家里这口气更紧了一层（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          var taxHandled = !!(picked.f_duty || picked.f_tax || picked.f_registry
            || picked.f_route_autumn_split || picked.f_route_school_split || picked.f_route_shop_split
            || picked.f_route_receipt || picked.f_route_autumn_tail || picked.f_route_autumn_gate
            || picked.f_route_wage_autumn_split || picked.f_route_split);
          if (taxHandled) {
            pushFamilySeasonTag(stepTag + '秋后催缴已压');
            log.push(['〔秋后催缴〕丁粮、差票与里甲口风这一旬已被你提前压进账里；催缴没有消失，但没再临门把你这一房的现钱扯散。', 'good']);
          } else if (spendCopper(90)) {
            pushFamilySeasonTag(stepTag + '秋后催缴');
            log.push(['〔秋后催缴〕里甲催缴丁粮差票：铜钱-90。不是新主线，只是秋后制度账又一次真落在你这一旬手里。', 'bad']);
          } else {
            S.体魄 -= 1;
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋后催缴硬顶');
            log.push(['〔秋后催缴〕现钱腾挪不开，只得硬顶催缴；误了手头营生又伤身（体魄-1、家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          var winterHandled = !!(picked.f_repair || picked.f_duty
            || picked.f_route_winter_book || picked.f_route_shop_book || picked.f_route_wage_winter_book
            || picked.f_route_winter_medicine || picked.f_route_guest_gift
            || picked.f_route_school_winter_book || picked.f_route_winter_wharf);
          if (winterHandled) {
            pushFamilySeasonTag(stepTag + '年关碎账已分');
            log.push(['〔年关碎账〕灯油、炭火、来春脚路、差钱和旧账已经被你先分开；年关没有因为“只差一点”把同一口现钱重新搅混。', 'good']);
          } else if (spendCopper(50)) {
            pushFamilySeasonTag(stepTag + '年关碎账');
            log.push(['〔年关碎账〕年礼、灯油、炭火和明春第一程的小脚费一齐要钱：铜钱-50。不是大账，却正是最磨人的年关小耗。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '年关硬顶');
            log.push(['〔年关碎账〕这一旬连年关小耗都挪不开，只得靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          var lunarHandled = !!(picked.f_kitchen || picked.f_mend || picked.f_rest
            || picked.f_route_winter_split || picked.f_route_winter_book || picked.f_route_winter_wharf
            || picked.f_route_winter_clear || picked.f_route_winter_coal
            || picked.f_route_shop_book || picked.f_route_wage_winter_book || picked.f_route_wage_winter_register
            || picked.f_route_wage_winter_reply || picked.f_route_wage_winter_gift || picked.f_route_school_winter_book);
          if (lunarHandled) {
            pushFamilySeasonTag(stepTag + '腊月碎账已分');
            log.push(['〔腊月小耗〕腊月里灯油针线、炭火小支与来春脚费已被你提前分开；年关前这一旬没有再被碎耗拧紧。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '腊月小耗');
            log.push(['〔腊月小耗〕腊月灯油针线、炭火小支与来春脚费一起要钱：铜钱-35。不是大账，却正是过冬最磨人的那一层。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '腊月硬顶');
            log.push(['〔腊月小耗〕这一旬连灯油炭火都挪不开，只得靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_farm_split || picked.f_route_farm_note || picked.f_cool || picked.f_mend || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '田头小耗已顾');
            log.push(['〔田头小耗〕这一旬先把凉药、草绳、挑水脚路或看水人情顾住了；伏夏最磨人的田头小耗没再顺着家里锅火一起滚大。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '田头小耗');
            log.push(['〔田头小耗〕草绳、看水脚路、凉药和孩子汗热一起冒头：铜钱-35、衣药+1。不是大祸，却正把农路这一年的细钱一点点磨薄。', 'bad']);
          } else {
            S.体魄 -= 1;
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '田头硬扛');
            log.push(['〔田头小耗〕这一旬连草绳凉药都腾挪不开，只得先硬扛过去；人和田都跟着更吃紧一层（体魄-1、家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_farm_store || picked.f_route_farm_split || picked.f_duty || picked.f_tax || picked.f_social) {
            pushFamilySeasonTag(stepTag + '租谷差票已分');
            log.push(['〔租谷差票〕这一旬先把租谷、差票和锅火后手分开了；秋后制度账没有再临门把这一房的粮与钱一把搅混。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '租谷差票');
            log.push(['〔租谷差票〕秋后催租口风、差票零碎和谷场脚费一起要钱：铜钱-45。不是新主线，只是农路这一年又一层真支出。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '租谷硬顶');
            log.push(['〔租谷差票〕这一旬连租谷和差票的小后手都腾挪不开，只得先硬顶过去；这一房的口粮和脸面都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_farm_note || picked.f_route_farm_split || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '谷种仓脚已分');
            log.push(['〔谷种仓脚〕这一旬先把谷种、仓脚、修渠钱与灯火细账分开了；农路过冬不再只剩“仓里还有几石”的粗账。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '谷种仓脚');
            log.push(['〔谷种仓脚〕谷种、仓脚、修渠小钱和年下小礼一起冒头：铜钱-40。不是大账，却最容易把明春起手先磨薄。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '仓脚硬顶');
            log.push(['〔谷种仓脚〕这一旬连谷种仓脚的小钱都腾挪不开，只得靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_wage_note || picked.f_work || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '春工脚费已理');
            log.push(['〔春工脚费〕开春去问活时的草鞋、带话脚费和工棚茶钱已被你先分开；卖工路这层熟口没有在春头就先被小钱磨薄。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '春工脚费');
            log.push(['〔春工脚费〕草鞋、带话脚费和工棚茶钱一起要钱：铜钱-35。不是大账，却把“先问活路”这一下也重新压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春工硬顶');
            log.push(['〔春工脚费〕这一旬连草鞋和带话脚费都腾挪不开，只得先硬顶过去；卖工路这层熟口又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_wage_spring_head_reply) {
            pushFamilySeasonTag(stepTag + '春头回签已理');
            log.push(['〔春头回签〕这一旬先把旧工头回签、递话门包、盐药锅火和春头脚路分开了；卖工路开春不再只剩“先问活路”，连“钱将回未回、锅火与门包先来”这层细账也开始同旬碰账。', 'good']);
          } else if (spendCopper(30)) {
            pushFamilySeasonTag(stepTag + '春头回签');
            log.push(['〔春头回签〕旧工头回签、递话门包、盐药锅火和春头脚路一起要钱：铜钱-30。不是大账，却正把卖工路开春那层“回签未稳、锅火先来”的细账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春头硬顶');
            log.push(['〔春头回签〕这一旬连回签脚费和盐药锅火都腾挪不开，只得先硬顶过去；旧工头与家里这层回话口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'spring' && xun === 2) {
          if (picked.f_route_wage_spring_bundle || picked.f_route_wage_spring_reply || picked.f_route_send || picked.f_child || picked.f_kitchen) {
            pushFamilySeasonTag(stepTag + '春锅草鞋已分');
            log.push(['〔春锅草鞋〕这一旬先把锅火、草鞋、春中回签和家里那层零碎小耗拆开了；春里刚回手的工钱没有再一转身就漏成空话，连“活路快回了”的那层小钱也先见了账。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '春锅草鞋');
            log.push(['〔春锅草鞋〕锅火、草鞋和带话脚费一起要钱：铜钱-35。不是大账，却正把卖工路春中那层最碎的小耗重新压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春锅硬顶');
            log.push(['〔春锅草鞋〕这一旬连锅火和草鞋的小钱都腾挪不开，只得先硬顶过去；家里和旧工头这层熟口都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_wage_collect || picked.f_route_wage_spring_post || picked.f_route_wage_spring_mat || picked.f_duty || picked.f_social) {
            pushFamilySeasonTag(stepTag + '春尾草席已理');
            log.push(['〔春尾草席〕这一旬先把旧工头回签、量斗草席、递话门包和夏前草鞋分开了；卖工路春尾不再只剩“回头结欠工、问下一程工路”，连夏前家用和门包这层会自己冒头的小耗也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家贴家 += 1;
            pushFamilySeasonTag(stepTag + '春尾草席');
            log.push(['〔春尾草席〕旧工头回签、量斗草席、递话门包和夏前草鞋一起要钱：铜钱-35、贴家+1。不是大账，却正把卖工路春尾那层“回签未净、草席和草鞋先来追钱”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春尾草席硬顶');
            log.push(['〔春尾草席〕这一旬连量斗草席和回签门包都腾挪不开，只得先硬顶过去；旧工头与家里这层夏前口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_wage_summer_note || picked.f_work || picked.f_route_wage_note || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '伏夏药脚已问');
            log.push(['〔伏夏药脚〕这一旬先把工棚落脚、凉汤药脚和带话脚路问明了；卖工路养家到了伏夏，不再只剩“还能不能再接一口工”，连身子和活路这层小后手也开始先顾。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '伏夏药脚');
            log.push(['〔伏夏药脚〕工棚落脚、凉汤药脚和带话脚路一起要钱：铜钱-40。不是大祸，却正把伏夏一开头最容易先咬住人和家计的那层小耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '伏夏硬扛');
            log.push(['〔伏夏药脚〕这一旬连凉汤药脚和带话脚费都腾挪不开，只得先硬扛过去；人还没倒，身子却先又薄了一线（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_wage_summer_bundle || picked.f_route_wage_summer_reply || picked.f_route_send || picked.f_market || picked.f_child || picked.f_kitchen) {
            pushFamilySeasonTag(stepTag + '伏夏工食已拆');
            log.push(['〔伏夏工食〕这一旬先把汤药、草鞋、锅火和家里急米拆开了；伏夏工食没有再被误当成整口宽钱，而是真在同一旬里被身子和锅火一起吃住。', 'good']);
          } else if (spendCopper(45)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏工食');
            log.push(['〔伏夏工食〕汤药、草鞋、锅火和家里急米一起要钱：铜钱-45、衣药+1。不是大账，却正把“工食刚到手就被拆薄”的那层伏夏真摩擦重新拖回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '伏夏工食硬顶');
            log.push(['〔伏夏工食〕这一旬连汤药和急米都腾挪不开，只得先硬扛过去；工食还没暖手，身子和锅火已一起更紧了一层（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_wage_summer_reply || picked.f_route_wage_summer_bundle || picked.f_route_send || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '伏夏回签已理');
            log.push(['〔伏夏回签〕这一旬先把旧工棚回签、锅火凉药、递话门包和家里急米分开了；卖工路伏夏中旬不再只是“工食刚到手”，连将回未回的回签与热里锅火也开始同旬碰账。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '伏夏回签');
            log.push(['〔伏夏回签〕旧工棚回签、锅火凉药、递话门包和家里急米一起要钱：铜钱-35。不是大账，却正把卖工路伏夏中旬那层“回签未稳、锅火先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏回签硬顶');
            log.push(['〔伏夏回签〕这一旬连回签脚费和锅火凉药都腾挪不开，只得先硬顶过去；旧工头与家里这层回话口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'summer' && xun === 3) {
          if (picked.f_route_wage_collect || picked.f_route_wage_duty || picked.f_mend || picked.f_rest || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '夏尾欠工已理');
            log.push(['〔夏尾欠工〕这一旬先把欠工回话、回乡脚费和补鞋药钱理开了；卖工路夏尾不再只是“这一季熬过去”，而会把欠工与后手一起提前摊回家账。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '夏尾欠工');
            log.push(['〔夏尾欠工〕欠工回话、回乡脚费和补鞋药钱一起要钱：铜钱-40。不是大账，却正把夏尾那层“钱还没结、脚下先要补”的细碎后手重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '夏尾硬顶');
            log.push(['〔夏尾欠工〕这一旬连回话脚费和补鞋药钱都腾挪不开，只得先硬顶过去；旧工头与家里这层回话口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_wage_autumn_note || picked.f_work || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '秋路搭手已问');
            log.push(['〔秋路搭手〕旺工茶水、回乡脚费和托人带话的人情已被你先问明；秋里这双手没再在外头结现与家里缺手之间盲撞。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '秋路搭手');
            log.push(['〔秋路搭手〕旺工茶水、回乡脚费和托人带话的小人情一起要钱：铜钱-40。不是大账，却正把“哪边更急”逼回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋路硬顶');
            log.push(['〔秋路搭手〕这一旬连回乡脚费与人情茶钱都腾挪不开，只得先硬顶过去；秋里两头都更难替你说话（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_wage_autumn_split || picked.f_route_wage_autumn_receipt || picked.f_route_wage_autumn_cloth || picked.f_social || picked.f_market || picked.f_child || picked.f_route_send) {
            pushFamilySeasonTag(stepTag + '秋工锅火已分');
            log.push(['〔秋工锅火〕这一旬先把旺工茶水、回乡脚费、秋中回签、租路饭钱、锅火小耗和差钱后手分开了；秋工钱看着厚一点，也没有再被你误写成“这一旬自然宽了”。', 'good']);
          } else if (spendCopper(50)) {
            pushFamilySeasonTag(stepTag + '秋工锅火');
            log.push(['〔秋工锅火〕旺工茶水、回乡脚费、锅火小耗和差钱后手一起要钱：铜钱-50。不是另开主线，却正把秋里“手里像有钱、转头又都要用”的那层磨人真账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋工硬顶');
            log.push(['〔秋工锅火〕这一旬连回乡脚费和锅火小耗都腾挪不开，只得先硬顶过去；秋里工头与家里替你接气的口风都又紧了一线（家族-1）。', 'bad']);
          }
          if (picked.f_route_wage_autumn_cloth || picked.f_child || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '秋中夹衣已理');
            log.push(['〔秋中夹衣〕这一旬先把孩子夹衣、递话脚费和锅火后手留出来了；卖工路秋中不再只盯着回签有没有回手，连秋凉刚起时的换季小耗也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋中夹衣');
            log.push(['〔秋中夹衣〕孩子夹衣、递话脚费和锅火后手一起要钱：铜钱-35、衣药+1。不是大账，却正把卖工路秋中那层“旺工钱像快回了、孩子夹衣却先要添”的换季小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋中夹衣硬顶');
            log.push(['〔秋中夹衣〕这一旬连孩子夹衣和递话脚费都腾挪不开，只得先硬顶过去；秋凉刚起时，家里替你接气的口风也一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_wage_collect || picked.f_route_wage_duty || picked.f_duty || picked.f_social || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '秋尾差脚已留');
            log.push(['〔秋尾差脚〕这一旬先把秋尾回话、催差脚费和递话门包分开了；卖工路秋尾不再只是“旺工结没结”，连差役门包和回话脚费也开始同年见光。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '秋尾差脚');
            log.push(['〔秋尾差脚〕秋尾回话、催差脚费和递话门包一起要钱：铜钱-45。不是大账，却正把“秋钱刚回一点、制度脚费又追上来”的那层细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋尾硬顶');
            log.push(['〔秋尾差脚〕这一旬连回话脚费和催差门包都腾挪不开，只得先硬顶过去；秋后这房在人情与差票上都更吃紧了一线（家族-1）。', 'bad']);
          }
          if (picked.f_route_wage_autumn_lamp || picked.f_kitchen || picked.f_child || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '秋尾灯油已理');
            log.push(['〔秋尾灯油〕这一旬先把旧工回签、灯油针线、递话门包和锅火后手分开了；卖工路秋尾不再只剩“等回话再说”，连年下最细的灯火针线也开始同旬咬钱。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家照家 += 1;
            pushFamilySeasonTag(stepTag + '秋尾灯油');
            log.push(['〔秋尾灯油〕旧工回签、灯油针线、递话门包和锅火后手一起要钱：铜钱-35、照家+1。不是大账，却正把卖工路秋尾那层“回签未净、年下灯火先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋尾灯油硬顶');
            log.push(['〔秋尾灯油〕这一旬连灯油针线和回签门包都腾挪不开，只得先硬顶过去；年下这房的锅火与回话口风又更薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_wage_winter_book || picked.f_work || picked.f_rest || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '工棚年礼已分');
            log.push(['〔工棚年礼〕年关前旧工头薄礼、回话脚费和明春头程小脚费已被你先分开；卖工路这层门路没有在冬里忽然断掉。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '工棚年礼');
            log.push(['〔工棚年礼〕旧工头薄礼、回话脚费和明春头程脚费一起要钱：铜钱-45。不是讲排场，而是让明春第一口活路不必重新从冷面求人开始。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '工棚礼硬顶');
            log.push(['〔工棚年礼〕这一旬连薄礼和回话脚费都腾挪不开，只得先硬顶过去；旧工头与工棚这层熟面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_wage_winter_jacket || picked.f_child || picked.f_mend || picked.f_route_wage_winter_book) {
            pushFamilySeasonTag(stepTag + '冬头夹衣已理');
            log.push(['〔冬头夹衣〕这一旬先把孩子夹衣、旧工头回签门包、递话脚费和锅火后手分开了；卖工路冬头不再只剩“问明春活路”，连家里换季和回签门包也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬头夹衣');
            log.push(['〔冬头夹衣〕孩子夹衣、回签门包、递话脚费和锅火后手一起要钱：铜钱-35、衣药+1。不是大账，却正把卖工路冬头那层“活路还在回话、家里先得添衣过冬”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬头硬顶');
            log.push(['〔冬头夹衣〕这一旬连孩子夹衣和回签门包都腾挪不开，只得先硬顶过去；旧工头与家里这层过冬口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_wage_winter_paper || picked.f_child || picked.f_route_wage_winter_book || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '冬头炭笔已理');
            log.push(['〔冬头炭笔〕这一旬先把旧工头回签、孩子炭笔、递话门包和守岁锅火分开了；卖工路冬头不再只剩“明春活路要不要先问”，连孩子来春读写与守岁锅火也开始同旬咬钱。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家供读 += 1;
            pushFamilySeasonTag(stepTag + '冬头炭笔');
            log.push(['〔冬头炭笔〕旧工头回签、孩子炭笔、递话门包和守岁锅火一起要钱：铜钱-35、供读+1。不是大账，却正把卖工路冬头那层“回话未净、孩子来春读写先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬头笔硬顶');
            log.push(['〔冬头炭笔〕这一旬连孩子炭笔和回签门包都腾挪不开，只得先硬顶过去；旧工头与家里这层守岁口风又更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_wage_winter_reply || picked.f_route_wage_winter_gift || picked.f_route_wage_winter_register || picked.f_route_wage_split || picked.f_route_send || picked.f_social || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '冬中炭鞋已分');
            log.push(['〔冬中炭鞋〕这一旬先把欠工回话、炭钱棉鞋、递话门包和来春草鞋分开了；卖工路冬中不再只剩“熬过腊月”，连过冬与来春头程这层小耗也开始同年见光。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬中炭鞋');
            log.push(['〔冬中炭鞋〕欠工回话、炭钱棉鞋、递话门包和来春草鞋一起要钱：铜钱-40、衣药+1。不是大账，却正把卖工路冬中那层“钱还没结、过冬与来春先来抢”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '冬中硬顶');
            log.push(['〔冬中炭鞋〕这一旬连炭钱棉鞋和递话门包都腾挪不开，只得先硬顶过去；过冬这一口现钱先薄了一线（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_wage_winter_register || picked.f_route_wage_winter_reply || picked.f_route_wage_winter_book || picked.f_social || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '冬中抄册已理');
            log.push(['〔冬中抄册〕这一旬先把里书催册、差票回签、工棚回话和来春头程脚路分开了；卖工路冬中不再只剩“过冬与来春草鞋”，连账册、差票和工路回话这层制度细账也开始同旬咬钱。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家备役 += 1;
            pushFamilySeasonTag(stepTag + '冬中抄册');
            log.push(['〔冬中抄册〕里书催册、差票回签、工棚回话和来春头程脚路一起要钱：铜钱-35、备役+1。不是大账，却正把卖工路冬中那层“账册未清、工路未稳”的制度摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬中册硬顶');
            log.push(['〔冬中抄册〕这一旬连催册脚费和回话门包都腾挪不开，只得先硬顶过去；里书与旧工头两头口风都更冷了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_wage_winter_tail || picked.f_route_wage_winter_post || picked.f_route_wage_collect || picked.f_route_wage_duty || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '冬尾草鞋已理');
            log.push(['〔冬尾草鞋〕这一旬先把年下回签、来春草鞋、递话门包和头程脚路分开了；卖工路冬尾不再只是“等明春再看”，连年下回音和来春第一口小耗都开始同年见光。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '冬尾草鞋');
            log.push(['〔冬尾草鞋〕年下回签、来春草鞋、递话门包和头程脚路一起要钱：铜钱-45。不是大账，却正把“年下回音未净、来春头程先来要钱”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬尾草鞋硬顶');
            log.push(['〔冬尾草鞋〕这一旬连年下回签脚费和来春草鞋都腾挪不开，只得先硬顶过去；旧工头回话和来春工路这层熟面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_bundle || picked.f_route_sample || picked.f_route_summer_packet || picked.f_route_wharf || picked.f_market || picked.f_work) {
            pushFamilySeasonTag(stepTag + '行中小耗已顾');
            log.push(['〔行中小耗〕这一旬先把样纸、门包、柜边回帖、孩子纸样、回程脚费和家里布药拆开了；“银还在路上”最磨人的那层行中小耗没有继续滚大。', 'good']);
          } else if (spendCopper(45)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '行中小耗');
            log.push(['〔行中小耗〕样纸、门包、柜边回帖、孩子纸样和家里布药一起冒头：铜钱-45、衣药+1。不是大账，却正把商路养家这一年的细钱一点点磨薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '行中硬扛');
            log.push(['〔行中小耗〕这一旬连样纸门包、柜边回帖和布药都腾挪不开，只得先硬扛过去；熟号和家里都更吃紧了一层（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_summer_packet || picked.f_route_bundle || picked.f_route_sample || picked.f_child || picked.f_market) {
            pushFamilySeasonTag(stepTag + '伏夏纸样已分');
            log.push(['〔伏夏纸样〕这一旬先把柜边回帖、孩子纸样、递话脚费和锅火凉药分开了；商路反哺与家里读写这层最细的小耗，也开始在伏夏中旬同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家供读 += 1;
            pushFamilySeasonTag(stepTag + '伏夏纸样');
            log.push(['〔伏夏纸样〕柜边回帖、孩子纸样、递话脚费和锅火凉药一起要钱：铜钱-35、供读+1。不是大账，却正把商路养家伏夏中旬这层“钱还在路上、孩子纸样先来”的细摩擦重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '纸样硬顶');
            log.push(['〔伏夏纸样〕这一旬连柜边回帖和孩子纸样都腾挪不开，只得先硬顶过去；熟号回音与家里读写这两头都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 3) {
          if (picked.f_route_collect || picked.f_repay || picked.f_mend || picked.f_route_sample || picked.f_route_letter || picked.f_route_summer_reply || picked.f_route_summer_guest) {
            pushFamilySeasonTag(stepTag + '夏尾账脚已压');
            log.push(['〔夏尾账脚〕这一旬先把柜边样单、回客话脚费、凉药锅火与催账前的小门包分开了；伏夏末尾最容易被拖成“反正下旬再说”的那层细账，没有再悄悄滚进下一季。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '夏尾账脚');
            log.push(['〔夏尾账脚〕柜边样单、回客话脚费、凉药锅火和催账前的小门包一起要钱：铜钱-40。不是新主线，却正把商路养家在伏夏下旬那层“账未回、家已先要过”的尾账重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '夏尾硬顶');
            log.push(['〔夏尾账脚〕这一旬连回客话脚费和凉药锅火的小后手都腾挪不开，只得先硬顶过去；熟号与家里两头都更难替这一房接气了（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_wharf || picked.f_route_summer_cool || picked.f_route_summer_ledger || picked.f_route_summer_heat || picked.f_route_letter || picked.f_child || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '伏夏路药已分');
            log.push(['〔伏夏路药〕这一旬先把行栈茶钱、回签账单、带话脚费和家里凉药拆开了；伏夏刚起头时最容易一起冒头的那层路上与家里小耗，没有再把现钱先磨薄。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏路药');
            log.push(['〔伏夏路药〕行栈茶钱、回签账单、带话脚费和家里凉药一起要钱：铜钱-35、衣药+1。不是大账，却正把商路养家这一年伏夏开头最先起皱的一层摩擦压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏硬顶');
            log.push(['〔伏夏路药〕这一旬连回签脚费和家里凉药都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_summer_register || picked.f_route_summer_home_note || picked.f_route_wharf || picked.f_route_letter || picked.f_child || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '伏夏帖册已理');
            log.push(['〔伏夏帖册〕这一旬先把伏夏差帖、柜边回帖、递话脚费和孩子纸样分开了；商路养家伏夏开头不再只顾水脚与凉药，连里甲门上的差帖和柜边回帖也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家备役 += 1;
            pushFamilySeasonTag(stepTag + '伏夏帖册');
            log.push(['〔伏夏帖册〕伏夏差帖、柜边回帖、递话脚费和孩子纸样一起要钱：铜钱-35、备役+1。不是大账，却正把商路养家伏夏开头那层制度与家内读写一起冒头的细耗重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏帖册硬顶');
            log.push(['〔伏夏帖册〕这一旬连差帖门包和柜边回帖都腾挪不开，只得先硬顶过去；熟号与乡里门上的口风都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_letter || picked.f_route_spring_price || picked.f_route_spring_packet || picked.f_route_spring_child_note || picked.f_work || picked.f_repair || picked.f_child) {
            pushFamilySeasonTag(stepTag + '春路碎账已理');
            log.push(['〔春路碎账〕这一旬先把熟号回话脚费、样纸门包和家里盐药锅火顾住了；商路顾家最先冒头的那层春路小耗，没有再在开春就把现钱磨薄。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '春路碎账');
            log.push(['〔春路碎账〕熟号回话脚费、样纸门包和家里盐药锅火一起要钱：铜钱-40、衣药+1。不是大账，却把商路养家这一年最先冒头的春路小耗重新压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春路硬顶');
            log.push(['〔春路碎账〕这一旬连熟号回话脚费和家里盐药小耗都腾挪不开，只得先硬顶过去；外头熟号与家里锅火两头都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 2) {
          if (picked.f_route_spring_ritual || picked.f_route_split || picked.f_route_remit || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '清明脚账已分');
            log.push(['〔清明脚账〕这一旬先把清明香纸、回话脚费和柜边包纸拆开了；家里等钱时最怕撞上的这层春礼小账，没有再临到节前才一起压来。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '清明脚账');
            log.push(['〔清明脚账〕清明香纸、回话脚费和柜边包纸一起要钱：铜钱-35。不是大账，却正把商路成家后“人在外、家里要过节”这层生活摩擦压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '清明硬顶');
            log.push(['〔清明脚账〕这一旬连清明香纸和回话脚费都腾挪不开，只得先硬顶过去；春里家里与熟号两头的人情都更薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 2) {
          if (picked.f_route_spring_mid_reply || picked.f_route_spring_ritual || picked.f_route_split || picked.f_route_remit || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '春中回签已理');
            log.push(['〔春中回签〕这一旬先把熟号回签、孩子纸样、递话门包和清明后手分开了；春中不再只剩一层春礼脚账，连“钱像快回了、家里读写却先来”的细账也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家供读 += 1;
            pushFamilySeasonTag(stepTag + '春中回签');
            log.push(['〔春中回签〕熟号回签、孩子纸样、递话门包和清明后手一起要钱：铜钱-35、供读+1。不是大账，却正把商路养家春中那层“旧账像快回了、家里读写和节前小耗先来”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春中硬顶');
            log.push(['〔春中回签〕这一旬连熟号回签脚费和孩子纸样都腾挪不开，只得先硬顶过去；春里熟号与家里两头替这一房转圜的口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_spring_bundle || picked.f_route_spring_reply || picked.f_route_school || picked.f_duty || picked.f_route_collect || picked.f_route_letter || picked.f_route_spring_price) {
            pushFamilySeasonTag(stepTag + '春路收束已压');
            log.push(['〔春路收束〕这一旬先把盐药锅火、清明带话脚费和旧账回话次序收住了；春起最后这层“钱还在路上、家里已经要过节”的摩擦没再混成一团。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '春路收束');
            log.push(['〔春路收束〕清明带话脚费、盐药锅火和催旧账前的小门包一起要钱：铜钱-35。不是大账，却正把春起收尾那层零碎后手重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春路收束硬顶');
            log.push(['〔春路收束〕这一旬连清明带话脚费和盐药锅火的小后手都腾挪不开，只得先硬顶过去；熟号和亲族口风都更凉了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_spring_reply || picked.f_route_collect || picked.f_route_spring_bundle || picked.f_route_school) {
            pushFamilySeasonTag(stepTag + '春尾回话已理');
            log.push(['〔春尾回话〕这一旬先把回客话脚费、催账门包和家里锅火拆开了；春尾这层“旧账快回却还没回到锅边”的摩擦，没有再顺着节后日用一起滚大。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家贴家 += 1;
            pushFamilySeasonTag(stepTag + '春尾回话');
            log.push(['〔春尾回话〕回客话脚费、催账门包和节后锅火一起要钱：铜钱-30、贴家+1。不是大账，却正把商路春尾最容易被一句“快回来了”带过的小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春尾硬顶');
            log.push(['〔春尾回话〕这一旬连回客话脚费和门包都腾挪不开，只得先硬顶过去；熟号与家里两头的口风都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_autumn_quote || picked.f_route_autumn_packet || picked.f_route_autumn_receipt || picked.f_work || picked.f_market || picked.f_child || picked.f_route_letter) {
            pushFamilySeasonTag(stepTag + '秋路样单已理');
            log.push(['〔秋路样单〕这一旬先把牙样、回签小纸、牙帖脚费、脚单与回乡带话理开了；秋里第一口看似要回暖的货路，没有再被样纸和照面小耗先磨成空话。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '秋路样单');
            log.push(['〔秋路样单〕牙样、回签小纸、牙帖脚费、脚单与秋市照面茶钱一起要钱：铜钱-40。不是大账，却正把商路养家在秋头那层“货价先热、细账先到”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋样硬顶');
            log.push(['〔秋路样单〕这一旬连牙样脚单和秋头回签的小钱都腾挪不开，只得先硬顶过去；秋里熟号与乡里这两头口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_autumn_clothes || picked.f_route_autumn_packet || picked.f_child || picked.f_market) {
            pushFamilySeasonTag(stepTag + '秋头夹衣已理');
            log.push(['〔秋头夹衣〕这一旬先把差帖门包、孩子夹衣、回乡药包和递话脚费分开了；秋头不再只是认牙抄价，连换季衣药、家里孩子和制度门包也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            S.本年家备役 += 1;
            pushFamilySeasonTag(stepTag + '秋头夹衣');
            log.push(['〔秋头夹衣〕差帖门包、孩子夹衣、回乡药包和递话脚费一起要钱：铜钱-35、衣药+1、备役+1。不是大账，却正把商路养家秋头那层“秋市刚热、家里先要换季、差帖也先来”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋夹硬顶');
            log.push(['〔秋头夹衣〕这一旬连孩子夹衣和差帖门包都腾挪不开，只得先硬顶过去；秋里熟号与家里替这一房转圜的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_autumn_split || picked.f_route_autumn_mid_reply || picked.f_route_remit || picked.f_social || picked.f_market || picked.f_route_school) {
            pushFamilySeasonTag(stepTag + '秋路锅火已分');
            log.push(['〔秋路锅火〕这一旬先把回钱脚单、锅火碎用、差票回话与供读纸包后手分开了；秋里这口现钱没有再被误写成“秋货一回便宽”。', 'good']);
          } else if (spendCopper(45)) {
            S.本年家贴家 += 1;
            pushFamilySeasonTag(stepTag + '秋路锅火');
            log.push(['〔秋路锅火〕回钱脚单、锅火碎用、差票回话和供读纸包后手一起要钱：铜钱-45、贴家+1。不是大账，却正把商路养家在秋中那层“钱将回未回、家里已先要用”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋锅硬顶');
            log.push(['〔秋路锅火〕这一旬连锅火与差票回话的小后手都腾挪不开，只得先硬顶过去；秋里熟号与家里锅火这两头都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_autumn_mid_clothes || picked.f_route_autumn_mid_reply || picked.f_route_autumn_split || picked.f_child || picked.f_market) {
            pushFamilySeasonTag(stepTag + '秋中夹衣已理');
            log.push(['〔秋中夹衣〕这一旬先把熟号回签、孩子夹衣、递话脚费和锅火后手分开了；商路养家秋中不再只剩回钱与锅火，连换季穿用和家里小后手也开始同旬见光。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋中夹衣');
            log.push(['〔秋中夹衣〕熟号回签、孩子夹衣、递话脚费和锅火后手一起要钱：铜钱-40、衣药+1。不是大账，却正把商路养家秋中那层“秋凉先到、回钱未回”的换季小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋凉硬顶');
            log.push(['〔秋中夹衣〕这一旬连孩子夹衣和锅火后手都腾挪不开，只得先硬顶过去；秋里熟号与家里替这一房转圜的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_receipt || picked.f_route_collect || picked.f_route_autumn_quote || picked.f_route_autumn_tail || picked.f_route_autumn_gate || picked.f_social || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '秋路催单已压');
            log.push(['〔秋路催单〕这一旬先把回钱脚单、带话次序和秋路催单脚费压进账里了；秋里这口钱不再只是“该回的银”。', 'good']);
          } else if (spendCopper(50)) {
            pushFamilySeasonTag(stepTag + '秋路催单');
            log.push(['〔秋路催单〕催单脚费、带话人情和拖欠碎耗一起要钱：铜钱-50。不是新主线，只是把“在路回钱”真正拖出了一层秋里摩擦。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋路硬顶');
            log.push(['〔秋路催单〕这一旬连催单脚费都腾挪不开，只得先硬顶过去；商路与乡里两头的话头都又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_autumn_tail || picked.f_route_autumn_gate || picked.f_route_receipt || picked.f_route_school || picked.f_route_collect || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '秋尾回话已理');
            log.push(['〔秋尾回话〕这一旬先把秋尾回话脚费、差票门包、供读纸包和锅火次序理开了；秋钱将回未回时，末尾这层最碎的制度与家用小耗没有再拖进年关。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家备役 += 1;
            pushFamilySeasonTag(stepTag + '秋尾回话');
            log.push(['〔秋尾回话〕秋尾回话脚费、差票门包、供读纸包和锅火次序一起要钱：铜钱-35、备役+1。不是大账，却正把商路养家在秋尾那层“钱还没回、后手先要留”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋尾硬顶');
            log.push(['〔秋尾回话〕这一旬连回话脚费和孩子纸包的小后手都腾挪不开，只得先硬顶过去；秋里熟号与家里这两头口风又更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_guest_gift || picked.f_route_winter_book || picked.f_route_winter_medicine || picked.f_work || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '熟号薄礼已分');
            log.push(['〔熟号薄礼〕年关前熟号薄礼、回话脚费和明春头程门包已被你先分开；商路这层门路没有在冬里忽然断掉。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '熟号薄礼');
            log.push(['〔熟号薄礼〕熟号薄礼、脚夫回话和明春门包一起要钱：铜钱-45。不是体面消费，而是让明春第一程不必重新从冷面求人开始。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '薄礼硬顶');
            log.push(['〔熟号薄礼〕这一旬连熟号薄礼与回话脚费都腾挪不开，只得先硬顶过去；旧门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_winter_coal || picked.f_route_winter_split || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '炭脚样纸已分');
            log.push(['〔炭脚样纸〕这一旬先把炭钱、来春样纸定钱和年下回话脚费拆开了；冬里最磨人的那层锅火与明春起手小账，没有再挤在同一口现钱上。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '炭脚样纸');
            log.push(['〔炭脚样纸〕炭钱、来春样纸定钱和年下回话脚费一起要钱：铜钱-45。不是大账，却正把“冬里先过年、明春还得起路”这层细账重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushFamilySeasonTag(stepTag + '炭脚硬顶');
            log.push(['〔炭脚样纸〕这一旬连炭钱和来春样纸定钱都腾挪不开，只得先硬顶过去；冬里锅火和来春起手都更紧了一线（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_winter_clear || picked.f_route_winter_book || picked.f_route_winter_coal || picked.f_route_guest_gift) {
            pushFamilySeasonTag(stepTag + '清账回话已理');
            log.push(['〔清账回话〕这一旬先把旧账回话、柜边门包、递话小礼和样纸定钱理开了；冬里这层“钱快回了、碎账先到”的门包脚费，没有再悄悄把现钱磨空。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '清账回话');
            log.push(['〔清账回话〕旧账回话脚费、柜边门包、递话小礼和样纸定钱一起要钱：铜钱-40。不是大账，却正把商路养家冬中那层“账快回、脚费先到”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '清账硬顶');
            log.push(['〔清账回话〕这一旬连回话脚费和柜边门包都腾挪不开，只得先硬顶过去；熟号与家里两头的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_wharf || picked.f_route_winter_reply || picked.f_route_winter_stamp || picked.f_route_school || picked.f_duty || picked.f_route_winter_split || picked.f_route_guest_gift || picked.f_route_winter_book) {
            pushFamilySeasonTag(stepTag + '冬路后手已留');
            log.push(['〔冬路后手〕这一旬先把来春水脚、供读后手、差钱和旧熟号回话都留住了；商路到年尾也不再只剩一句“明春再说”。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '冬路后手');
            log.push(['〔冬路后手〕来春水脚、递话小礼和供读纸包小耗一起要钱：铜钱-40。不是大账，却正把冬藏收束前最后一层后手重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬路硬顶');
            log.push(['〔冬路后手〕这一旬连来春水脚和递话小礼都腾挪不开，只得先硬顶过去；明春未到，熟号与家里口风先紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_guest_sign || picked.f_route_winter_reply || picked.f_route_winter_wharf || picked.f_route_guest_gift || picked.f_route_school) {
            pushFamilySeasonTag(stepTag + '冬尾柜签已理');
            log.push(['〔冬尾柜签〕这一旬先把柜边回签、递话门包、来春客账次序和锅火后手分开了；冬尾不再只剩熟号回音和样纸，连柜边这层最细的回签门包也开始同年见光。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家捎信 += 1;
            pushFamilySeasonTag(stepTag + '冬尾柜签');
            log.push(['〔冬尾柜签〕柜边回签、递话门包、来春客账次序和锅火后手一起要钱：铜钱-30、捎信+1。不是大账，却正把商路冬尾那层“回音刚到、门包先来”的最细小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '柜签硬顶');
            log.push(['〔冬尾柜签〕这一旬连柜边回签和递话门包都腾挪不开，只得先硬顶过去；熟号与家里两头替这一房递话的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_reply || picked.f_route_winter_wharf || picked.f_route_school || picked.f_route_guest_gift) {
            pushFamilySeasonTag(stepTag + '冬尾回话已理');
            log.push(['〔冬尾回话〕这一旬先把年下回话脚费、炭药和来春客账次序分开了；冬尾最怕“门路还在、家里药火先断”的那层小摩擦，没有再拖进明春。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬尾回话');
            log.push(['〔冬尾回话〕年下回话脚费、炭药和来春客账次序一起要钱：铜钱-35、衣药+1。不是大账，却正把商路冬尾最细、也最躲不开的那层回话药脚重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬尾硬顶');
            log.push(['〔冬尾回话〕这一旬连回话脚费和炭药都腾挪不开，只得先硬顶过去；熟号与家里两头都更凉了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_receipt || picked.f_route_winter_packet || picked.f_route_winter_wharf || picked.f_route_school || picked.f_route_guest_gift) {
            pushFamilySeasonTag(stepTag + '冬尾回签已理');
            log.push(['〔冬尾回签〕这一旬先把年下回签、来春样纸定钱、递话脚费和锅火后手分开了；商路到冬尾不再只是留住门路，还把“熟号回音已到、来春后手先来”的那层细账也压回了今冬。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家捎信 += 1;
            pushFamilySeasonTag(stepTag + '冬尾回签');
            log.push(['〔冬尾回签〕年下回签、来春样纸定钱、递话脚费和锅火后手一起要钱：铜钱-35、捎信+1。不是大账，却正把商路养家冬尾那层“熟号回音刚到、明春样纸先来”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬签硬顶');
            log.push(['〔冬尾回签〕这一旬连年下回签和来春样纸的小后手都腾挪不开，只得先硬顶过去；熟号与家里都更难把这一房看作还能稳稳接上明春（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_copy || picked.f_route_winter_packet || picked.f_route_school || picked.f_route_winter_guest_sign) {
            pushFamilySeasonTag(stepTag + '冬尾帖样已理');
            log.push(['〔冬尾帖样〕这一旬先把柜边客账帖样、孩子来春帖样、递话门包和锅火后手分开了；冬尾不再只是“等熟号回音”，连家里读写和客账帖样这层最细的纸耗也开始同年见光。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家供读 += 1;
            pushFamilySeasonTag(stepTag + '冬尾帖样');
            log.push(['〔冬尾帖样〕柜边客账帖样、孩子来春帖样、递话门包和锅火后手一起要钱：铜钱-30、供读+1。不是大账，却正把商路养家冬尾那层“回音刚到、家里帖样先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '帖样硬顶');
            log.push(['〔冬尾帖样〕这一旬连客账帖样和孩子帖样的小后手都腾挪不开，只得先硬顶过去；熟号与家里这两头都更难替这一房把明春帖样接稳（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_stamp || picked.f_route_winter_wharf || picked.f_route_school || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '冬尾牙帖已理');
            log.push(['〔冬尾牙帖〕这一旬先把明春牙帖脚费、熟号回签与柜边门包分开了；商路到冬尾不再只是留一句“明春去认牙”，而是把开春第一道制度门槛也压回今冬理清。', 'good']);
          } else if (spendCopper(30)) {
            pushFamilySeasonTag(stepTag + '冬尾牙帖');
            log.push(['〔冬尾牙帖〕明春牙帖脚费、熟号回签和柜边门包一起要钱：铜钱-30。不是大账，却正把商路年尾那层“开春先认牙还是先顾家里”重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '牙帖硬顶');
            log.push(['〔冬尾牙帖〕这一旬连牙帖脚费和熟号回签都腾挪不开，只得先硬顶过去；来春还没开市，熟号与家里口风已先薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_shop_spring_head_reply || picked.f_route_shop_spring_counter || picked.f_route_shop_note || picked.f_work || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '春头铺签已理');
            log.push(['〔春头铺签〕这一旬先把旧掌柜回签、灯油门包、递话脚费和灶下锅火分开了；学徒路成年期开春第一旬终于不再只剩“先问铺里口风”，连春头最先冒头的那层回签与锅火也一起压回了真账。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '春头铺签');
            log.push(['〔春头铺签〕旧掌柜回签、灯油门包、递话脚费和灶下锅火一起要钱：铜钱-35、通融+1。不是大账，却正把学徒路成年期开春第一旬那层“铺里回音刚起、家里灯油锅火先来”的细账压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春头硬顶');
            log.push(['〔春头铺签〕这一旬连回签脚费和灯油门包都腾挪不开，只得先硬顶过去；春头这一层铺里与家里两头的口风又一齐薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && S.学徒去向 === '留店伙计' && season.id === 'spring' && xun === 1) {
          if (picked.f_route_shop_spring_counter || picked.f_route_shop_note || picked.f_work || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '春头柜簿已理');
            log.push(['〔春头柜簿〕这一旬先把柜上记名、灯草门包、递话脚费和家里锅火理开了；留店伙计成年后开春第一旬不再只是“掌柜还认不认你”，连柜簿这层值柜细账也被压回了真账。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '春头柜簿');
            log.push(['〔春头柜簿〕柜上记名、灯草门包、递话脚费和锅火一起要钱：铜钱-35、通融+1。不是大账，却正把留店伙计开春那层“柜上细账先来追钱”的摩擦压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '柜簿硬顶');
            log.push(['〔春头柜簿〕这一旬连柜簿门包和灯草小钱都腾挪不开，只得先硬顶过去；柜上这层熟面与家里锅火都更难替你接气了（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_shop_summer_head_reply || picked.f_route_shop_note || picked.f_work || picked.f_repair || picked.f_child || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '伏夏铺药已问');
            log.push(['〔伏夏铺药〕这一旬先把铺里茶汤、家里凉药、带话脚费和草鞋线头问明了；伏夏刚起头时最先冒头的那层铺里与家用小耗，没有再把这一口脚钱先磨薄。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏铺药');
            log.push(['〔伏夏铺药〕铺里茶汤、凉药、带话脚费和草鞋线头一起要钱：铜钱-30、衣药+1。不是大账，却正把学徒路伏夏开头那层“人还站在铺里、家里先起小耗”的摩擦压回真账。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '伏夏先硬顶');
            log.push(['〔伏夏铺药〕这一旬连凉药和带话脚费都腾挪不开，只得先硬顶过去；伏夏还没过半，人和铺里门路都更吃紧了一线（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_shop_bundle || picked.f_route_shop_summer_counter || picked.f_route_shop || picked.f_route_shop_note || picked.f_mend || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '铺里零耗已顾');
            log.push(['〔铺里零耗〕这一旬先把铺里茶汤、脚夫点心、布药针线或家里凉热小耗顾住了；“人在铺里、家里还等着这口小钱”的磨损没有继续滚大。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '铺里零耗');
            log.push(['〔铺里零耗〕铺里茶汤、脚夫点心、针线布药和回乡带话的小脚费一起冒头：铜钱-35、衣药+1。不是大账，却正把学徒路这一年的细钱一点点磨薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '铺耗硬扛');
            log.push(['〔铺里零耗〕这一旬连茶汤脚费和布药针线都腾挪不开，只得先硬扛过去；人在铺里这层门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && S.学徒去向 === '留店伙计' && season.id === 'summer' && xun === 2) {
          if (picked.f_route_shop_summer_counter || picked.f_route_shop_bundle || picked.f_route_shop || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '伏夏柜边已理');
            log.push(['〔伏夏柜边〕这一旬先把柜边凉茶、脚夫点心、孩子布票和递话门包理开了；留店伙计伏夏中旬不再只是“柜边零耗有点多”，而是把柜上细账真正压回了这一旬。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏柜边');
            log.push(['〔伏夏柜边〕柜边凉茶、脚夫点心、孩子布票和递话门包一起要钱：铜钱-35、衣药+1。不是新主线，却正把留店伙计伏夏最磨人的那层柜边细耗压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '柜边硬扛');
            log.push(['〔伏夏柜边〕这一旬连柜边凉茶和孩子布票都腾挪不开，只得先硬扛过去；人在柜上这层熟面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'summer' && xun === 3) {
          if (picked.f_route_shop_collect || picked.f_route_shop_summer_tail || picked.f_route_master || picked.f_mend || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '夏尾铺签已理');
            log.push(['〔夏尾铺签〕这一旬先把旧掌柜回签、秋前样纸、递话门包和过路药包理开了；学徒路成年人伏夏收尾终于不再只剩“回铺结一回脚钱”，连秋前那层最细的后手也被压回了同一年。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '夏尾铺签');
            log.push(['〔夏尾铺签〕旧掌柜回签、秋前样纸、递话门包和过路药包一起要钱：铜钱-35、通融+1。不是大账，却正把学徒路伏夏收尾那层“夏尾刚结回一点、秋前样纸又先来”的细耗重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '夏尾硬顶');
            log.push(['〔夏尾铺签〕这一旬连回签脚费和秋前样纸都腾挪不开，只得先硬顶过去；旧掌柜与家里这两头口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_shop_collect || picked.f_route_master || picked.f_social || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '秋脚路已压');
            log.push(['〔秋脚路〕这一旬先把回铺脚路、掌柜薄礼和托人带话的人情压进后手里；秋里这口脚钱没再只停在“该回”的账面上。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '秋脚路');
            log.push(['〔秋脚路〕回铺脚费、掌柜薄礼和请人带话的小人情一起要钱：铜钱-45。不是新主线，只是把“该回的脚钱”真正拢回来前必经的一层摩擦。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋脚硬顶');
            log.push(['〔秋脚路〕这一旬连回铺脚路与薄礼都腾挪不开，只得先硬顶过去；这一房在铺里那层熟面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_shop_autumn_tail || picked.f_route_shop_collect || picked.f_route_master || picked.f_mend || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '秋尾铺脚已理');
            log.push(['〔秋尾铺脚〕这一旬先把回铺脚费、灯油针线、递话门包和来春脚单分开了；学徒路养家秋尾终于不再只是“秋脚路还要不要再跑一趟”，连入冬锅火与明春脚路也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋尾铺脚');
            log.push(['〔秋尾铺脚〕回铺脚费、灯油针线、递话门包和来春脚单一起要钱：铜钱-35、衣药+1。不是大账，却正把学徒路养家秋尾那层“脚钱刚回一点、灯油针线和明春脚路又先来追钱”的摩擦重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋尾硬顶');
            log.push(['〔秋尾铺脚〕这一旬连回铺脚费和灯油针线都腾挪不开，只得先硬顶过去；铺里熟面与家里锅火这两头口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_shop_note || picked.f_work || picked.f_child || picked.f_market || picked.f_social) {
            pushFamilySeasonTag(stepTag + '秋铺回话已问');
            log.push(['〔秋铺回话〕这一旬先把旧同门回话、回乡脚费和掌柜照面的人情问明了；秋里外头价热、家里也催，这层门路没有再只停在一句“该回头问问”。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '秋铺回话');
            log.push(['〔秋铺回话〕旧同门回话、回乡脚费和照面薄礼一起要钱：铜钱-35。不是大账，却正把学徒路秋里“先问哪口钱与哪层门路能动”的摩擦压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋问硬顶');
            log.push(['〔秋铺回话〕这一旬连回话脚费和照面小礼都腾挪不开，只得先硬顶过去；铺里旧识替你开口的那层熟面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_shop_autumn_packet || picked.f_route_shop_note || picked.f_work || picked.f_child || picked.f_market || picked.f_social) {
            pushFamilySeasonTag(stepTag + '秋头脚账已分');
            log.push(['〔秋头脚账〕这一旬先把秋头脚单、孩子布药、带话脚费和锅火零用分开了；学徒路秋头终于不再只是“先问铺里口风”，连家里最先追上来的那口细账也一起压回了同一年。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋头脚账');
            log.push(['〔秋头脚账〕秋头脚单、孩子布药、带话脚费和锅火零用一起要钱：铜钱-40、衣药+1。不是大账，却正把学徒路秋头那层“钱未回、家里先要用”的摩擦压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋头硬顶');
            log.push(['〔秋头脚账〕这一旬连孩子布药和脚单门包都腾挪不开，只得先硬顶过去；秋头还没走到热市，铺里与家里这两头口风已先薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_shop_split || picked.f_route_shop || picked.f_market || picked.f_child || picked.f_social) {
            pushFamilySeasonTag(stepTag + '秋脚锅火已分');
            log.push(['〔秋脚锅火〕这一旬先把秋脚钱、锅火、差钱和家里灯火拆开了；学徒路最容易被误写成“秋里终于宽了”的那口钱，没有再一转身就漏光。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '秋脚锅火');
            log.push(['〔秋脚锅火〕锅火、差钱、家里灯火和回铺脚费一起要钱：铜钱-40。不是大账，却正把学徒路秋中那层“钱刚回手、家里立刻要用”的摩擦重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋锅硬顶');
            log.push(['〔秋脚锅火〕这一旬连锅火和差钱的小后手都腾挪不开，只得先硬顶过去；秋里家里与铺里两头都更难替这一房接气了（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_shop_book || picked.f_route_shop_winter_counter || picked.f_work || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '年关铺耗已分');
            log.push(['〔年关铺耗〕年关里给旧掌柜的薄礼、回铺脚路和家里灯火针线已先被你分开；学徒路这层门路没有在年关忽然断掉。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '年关铺耗');
            log.push(['〔年关铺耗〕旧掌柜薄礼、回铺脚路和灯油针线一起要钱：铜钱-40。不是体面消费，而是让“铺里还认你”这层门路能撑到明春。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '年关铺耗硬扛');
            log.push(['〔年关铺耗〕这一旬连薄礼与回铺脚路都腾挪不开，只得靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && S.学徒去向 === '留店伙计' && season.id === 'winter' && xun === 1) {
          if (picked.f_route_shop_winter_counter || picked.f_route_shop_book || picked.f_work || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '年关柜头已理');
            log.push(['〔年关柜头〕这一旬先把柜头值夜灯炭、守岁炭药、递话门包和来春脚路理开了；留店伙计年关不再只有“旧掌柜还认不认你”，连柜头夜账也被压回了同一年。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '年关柜头');
            log.push(['〔年关柜头〕柜头值夜灯炭、守岁炭药、递话门包和来春脚路一起要钱：铜钱-40、衣药+1。不是体面消费，而是把留店伙计年关最先追钱的那层柜头夜账压回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '柜头硬顶');
            log.push(['〔年关柜头〕这一旬连柜头值夜灯炭和守岁炭药都腾挪不开，只得先靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'spring' && xun === 2) {
          if (picked.f_route_shop_spring_bundle || picked.f_route_shop || picked.f_route_shop_note || picked.f_child || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '春铺零用已分');
            log.push(['〔春铺零用〕这一旬先把布鞋、灯油、草绳与灶下零用分开了；开春这口脚钱没有再被误当成“终于松快”的整钱。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '春铺零用');
            log.push(['〔春铺零用〕布鞋、灯油、草绳和灶下零用一起冒头：铜钱-30、衣药+1。不是大账，却正把学徒成家后开春第一口脚钱重新拆薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春铺硬扛');
            log.push(['〔春铺零用〕这一旬连布鞋灯油都腾挪不开，只得先硬扛过去；铺里与家里都更难把你这口日子看成稳当（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_shop_collect || picked.f_route_master || picked.f_route_shop_spring_post || picked.f_duty || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '春尾铺账已理');
            log.push(['〔春尾铺账〕这一旬先把清明香纸、回铺脚路、递话小脚费与探差后手收住了；学徒路开春最后这层“钱刚回一点、家里立刻要用”没有再混成一团。', 'good']);
          } else if (spendCopper(35)) {
            pushFamilySeasonTag(stepTag + '春尾铺账');
            log.push(['〔春尾铺账〕清明香纸、回铺脚路和递话小脚费一起要钱：铜钱-35。不是大账，却正把学徒路春尾收束前最后一层后手重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春尾硬顶');
            log.push(['〔春尾铺账〕这一旬连清明香纸和回铺脚路都腾挪不开，只得先硬顶过去；铺里与家里都更难把你这口日子看成稳当（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_shop_gift || picked.f_route_master || picked.f_social || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '年下客礼已理');
            log.push(['〔年下客礼〕这一旬先把守岁炭药、旧掌柜薄礼和来春回铺的那层小人情理开了；学徒路年下不再只剩一句“先熬过去”。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '年下客礼');
            log.push(['〔年下客礼〕炭药、守岁零用和回铺薄礼一起要钱：铜钱-35、衣药+1。不是新主线，只是把学徒路年下那层最碎、也最躲不开的人情和家用压回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '年下硬扛');
            log.push(['〔年下客礼〕这一旬连炭药和回铺薄礼都腾挪不开，只得继续靠身子硬扛过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_shop_winter_sign || picked.f_route_shop_gift || picked.f_route_master || picked.f_social || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '冬中铺签已理');
            log.push(['〔冬中铺签〕这一旬先把旧掌柜回签、灯炭门包、递话脚费和来春脚单理开了；学徒路冬中终于不再只靠年下客礼撑密度，连“旧铺还认不认你”这一层回签细账也压回了真账。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '冬中铺签');
            log.push(['〔冬中铺签〕旧掌柜回签、灯炭门包、递话脚费和来春脚单一起要钱：铜钱-40、通融+1。不是大账，却正把学徒路冬中那层“铺里回话还在路上、家里炭药已先告急”的摩擦压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬中硬顶');
            log.push(['〔冬中铺签〕这一旬连回签脚费和灯炭门包都腾挪不开，只得先硬顶过去；旧铺与家里两头都更难替这一房接上气了（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_shop_winter_tail) {
            pushFamilySeasonTag(stepTag + '冬尾铺签已理');
            log.push(['〔冬尾铺签〕这一旬先把年下回铺回签、来春脚单、递话脚费和锅火后手理开了；学徒路到冬尾终于不再只剩“留明春铺路”，连旧铺回音和眼前锅火怎么抢同一口钱也压回了真账。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '冬尾铺签');
            log.push(['〔冬尾铺签〕年下回铺回签、来春脚单、递话脚费和锅火后手一起要钱：铜钱-40、通融+1。不是大账，却正把学徒路冬尾那层“旧铺还有回音、明春脚路也先来追钱”的碎账重新压回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '冬尾铺签硬顶');
            log.push(['〔冬尾铺签〕这一旬连回签脚费和来春脚单都腾挪不开，只得继续靠身子硬顶过去；眼前锅火与明春回铺脚路又一起更紧了一线（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_shop_winter_post || picked.f_route_shop_collect || picked.f_route_master || picked.f_duty || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '来春铺路已稳');
            log.push(['〔来春铺路〕这一旬先把来春回铺脚费、递话薄礼与差役后手留住了；学徒路到冬尾也不再只剩一句“过了年再说”。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '来春铺路');
            log.push(['〔来春铺路〕来春回铺脚费、递话薄礼和差役小耗一起要钱：铜钱-40。不是新主线，却把冬藏收束前最后一层铺路后手重新压回了这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushFamilySeasonTag(stepTag + '冬尾硬顶');
            log.push(['〔来春铺路〕这一旬连来春回铺脚费和递话薄礼都腾挪不开，只得继续靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_school_spring_contract || picked.f_route_school_note || picked.f_work || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '春头馆契已分');
            log.push(['〔春头馆契〕这一旬先把馆契纸样、学生家递话脚费和家里盐炭锅火分开了；举业路成年期的春头终于不再只剩一句“先问问有没有馆课”，连第一口会自己冒头的小钱也压回了真账。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '春头馆契');
            log.push(['〔春头馆契〕馆契纸样、递话脚费和家里盐炭锅火一起要钱：铜钱-35、通融+1。不是大账，却正把举业路成年期开春第一旬那层“门路刚起、锅火先追”的细账压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春头馆契硬顶');
            log.push(['〔春头馆契〕这一旬连馆契纸样和递话脚费都腾挪不开，只得先硬顶过去；春头这层塾师与学生家口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'spring' && xun === 2) {
          if (picked.f_route_school_spring_copy || picked.f_route_school_note || picked.f_market || picked.f_child) {
            pushFamilySeasonTag(stepTag + '春课纸香已分');
            log.push(['〔春课纸香〕这一旬先把清明香纸、课本纸笔和家里灯油草鞋分开了；举业路成年期开春第一口现钱，没有再被误当成“还能先拖一拖”的整钱。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '春课纸香');
            log.push(['〔春课纸香〕清明香纸、课本纸笔和灯油草鞋一起冒头：铜钱-30、衣药+1。不是大账，却正把举业路成家后开春第一口笔墨钱重新拆薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春课硬扛');
            log.push(['〔春课纸香〕这一旬连清明香纸和课本纸笔都腾挪不开，只得先硬扛过去；塾师与家里都更难把你这口笔墨活看成稳当（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_school_spring_reply || picked.f_route_tutor_collect || picked.f_route_surety || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '春尾馆批已分');
            log.push(['〔春尾馆批〕这一旬先把旧馆回批、端午纸样、递话脚费和家里盐药锅火分开了；举业路成年期的春尾终于不再只剩“把馆课钱结回来”，连端午前那层会自己冒头的小账也压回了同一年。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '春尾馆批');
            log.push(['〔春尾馆批〕旧馆回批、端午纸样、递话脚费和家里盐药锅火一起要钱：铜钱-35、通融+1。不是大账，却正把举业路成家后春尾那层“馆批未净、端午细耗先来”的小摩擦重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '春尾馆批硬顶');
            log.push(['〔春尾馆批〕这一旬连旧馆回批和端午纸样都腾挪不开，只得先硬顶过去；春尾这层旧馆与学生家口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_school_spring_fan || picked.f_child || picked.f_mend) {
            pushFamilySeasonTag(stepTag + '春尾扇药已理');
            log.push(['〔春尾扇药〕这一旬先把塾门回帖、端午蒲扇凉药、递话门包和灶下锅火分开了；举业路春尾不再只剩“馆批回不回”，连换季扇药和塾门回帖这层会自己来追钱的小耗也压回了真账。', 'good']);
          } else if (spendCopper(30)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '春尾扇药');
            log.push(['〔春尾扇药〕塾门回帖、端午蒲扇凉药、递话门包和灶下锅火一起要钱：铜钱-30、衣药+1。不是大账，却正把举业路春尾那层“馆批将回未回、端午换季先来”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushFamilySeasonTag(stepTag + '春尾扇药硬顶');
            log.push(['〔春尾扇药〕这一旬连塾门回帖和端午扇药的小钱都腾挪不开，只得先硬顶过去；春尾换季这层小耗最终还是先从身子上找补（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_school_summer_soup || picked.f_route_school_note || picked.f_work || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '伏夏馆汤已分');
            log.push(['〔伏夏馆汤〕这一旬先把馆里茶汤、凉药门包、递话脚费和家里锅火分开了；举业路养家阶段的伏夏上旬终于不再只剩“先问夏课馆账”，连暑天第一层会自己冒头的小耗也压回了真账。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏馆汤');
            log.push(['〔伏夏馆汤〕馆里茶汤、凉药门包、递话脚费和家里锅火一起要钱：铜钱-35、衣药+1。不是大账，却正把举业路养家阶段伏夏上旬那层“门路刚起、暑热先追”的细账压回了真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏馆汤硬顶');
            log.push(['〔伏夏馆汤〕这一旬连馆里茶汤和凉药门包都腾挪不开，只得先硬顶过去；伏夏刚起，塾师与学生家这层口风就先薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_write || picked.f_route_school_note || picked.f_route_school_summer_fee || picked.f_mend || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '馆课零耗已顾');
            log.push(['〔馆课零耗〕这一旬先把潮纸、投帖脚费、塾馆茶汤和家里凉热小耗顾住了；伏夏里最容易把“笔墨门路”一点点磨薄的那层碎耗，没有继续滚大。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '馆课零耗');
            log.push(['〔馆课零耗〕潮纸、投帖脚费、塾馆茶汤和家里凉热小耗一起冒头：铜钱-35、衣药+1。不是大账，却正把举业路这一年的细钱一点点磨薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '馆课硬扛');
            log.push(['〔馆课零耗〕这一旬连潮纸脚费与塾馆茶汤都腾挪不开，只得先硬扛过去；塾师与学生家这层门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'summer' && xun === 3) {
          if (picked.f_route_school_summer_reply || picked.f_route_tutor_collect || picked.f_route_surety || picked.f_mend || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '夏尾馆信已分');
            log.push(['〔夏尾馆信〕这一旬先把学生家回话、秋前纸样、递话脚费和锅火拆开了；举业路伏夏收尾终于不再只剩“把馆课钱结回来”，连秋前门路和眼前家用也一起压回了这一旬。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '夏尾馆信');
            log.push(['〔夏尾馆信〕学生家回话、秋前纸样、递话脚费和锅火一起要钱：铜钱-40、通融+1。不是大账，却正把举业路成家后伏夏尾声那层最细、最会拖薄秋前门路的小耗重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '夏尾馆信硬顶');
            log.push(['〔夏尾馆信〕这一旬连递话脚费和秋前纸样都腾挪不开，只得先硬顶过去；伏夏刚收尾，塾师与学生家这层口风就先薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_school_autumn_packet || picked.f_route_school_note || picked.f_work || picked.f_child || picked.f_social) {
            pushFamilySeasonTag(stepTag + '秋头馆帖已分');
            log.push(['〔秋头馆帖〕这一旬先把学生家帖脚、孩子纸包和锅火分开了；举业路成年期秋头终于不再只剩“先问秋馆课”，连“馆课还未稳、家里先要用”的那层细账也压回了同一年。', 'good']);
          } else if (spendCopper(40)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋头馆帖');
            log.push(['〔秋头馆帖〕学生家帖脚、孩子纸包和锅火一起要钱：铜钱-40、衣药+1。不是大账，却正把举业路秋头那层“门路未定、家里先追钱”的碎账重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋头馆帖硬顶');
            log.push(['〔秋头馆帖〕这一旬连学生家帖脚和孩子纸包都腾挪不开，只得先硬顶过去；秋头这层学生家与塾师口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 1) {
          if (picked.f_route_school_autumn_cloth || picked.f_child || picked.f_social) {
            pushFamilySeasonTag(stepTag + '秋头夹衣已分');
            log.push(['〔秋头夹衣〕这一旬先把旧馆回话、孩子夹衣、递话脚费和锅火留出来了；举业路成年人秋头不再只盯着馆课有没有续上，连换季这层家内小耗也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '秋头夹衣');
            log.push(['〔秋头夹衣〕旧馆回话、孩子夹衣、递话脚费和锅火一起要钱：铜钱-35、衣药+1。不是大账，却正把举业路秋头那层“秋凉先到、馆课未稳”的换季细耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushFamilySeasonTag(stepTag + '秋凉硬顶');
            log.push(['〔秋头夹衣〕这一旬连孩子夹衣和锅火都腾挪不开，只得先硬顶过去；秋凉刚起时，连身子与家里锅火都一起吃了一亏（体魄-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_school_split || picked.f_route_school_autumn_reply || picked.f_route_school_autumn_mid_fee || picked.f_social || picked.f_market || picked.f_route_write) {
            pushFamilySeasonTag(stepTag + '秋后纸墨已拆');
            log.push(['〔秋后纸墨〕这一旬先把润笔、保结薄礼、学生家回话脚费与锅火拆开；秋里这口笔墨钱没再被误写成“终于宽了”。', 'good']);
          } else if (spendCopper(45)) {
            pushFamilySeasonTag(stepTag + '秋后纸墨');
            log.push(['〔秋后纸墨〕保结薄礼、学生家回话脚费和秋后纸墨杂支一起要钱：铜钱-45。不是新主线，只是把举业路这一年的细账又往下压了一层。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋后纸墨硬顶');
            log.push(['〔秋后纸墨〕这一旬连保结薄礼和学生家回话脚费都腾挪不开，只得先硬顶过去；这一房靠笔墨吃饭的人情面又紧了一层（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_school_autumn_mid_fee || picked.f_route_school_split || picked.f_route_write || picked.f_market) {
            pushFamilySeasonTag(stepTag + '秋中馆脚已理');
            log.push(['〔秋中馆脚〕这一旬先把旧馆润笔、租路饭钱、回话脚费和锅火差钱分开了；举业路成年人秋中的那层“馆账刚回一点，回乡和家里锅火就先来追钱”的细账，没有再顺手拖到秋尾。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家问价 += 1;
            pushFamilySeasonTag(stepTag + '秋中馆脚');
            log.push(['〔秋中馆脚〕旧馆润笔、租路饭钱、回话脚费和锅火差钱一起要钱：铜钱-35、问价+1。不是大账，却正把举业路成年人秋中最像真实过日子的那层馆脚与饭钱摩擦重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋中馆脚硬顶');
            log.push(['〔秋中馆脚〕这一旬连租路饭钱和回话脚费都腾挪不开，只得先硬顶过去；旧馆与学生家这层口风又更薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_school_autumn_tail || picked.f_route_school_autumn_reply || picked.f_route_tutor_collect || picked.f_route_surety) {
            pushFamilySeasonTag(stepTag + '秋尾馆签已理');
            log.push(['〔秋尾馆签〕这一旬先把学生家秋尾回签、炭脚锅火、小回礼和来春帖路后手分开了；举业路成年人秋尾终于不再只剩“把馆课钱结回来”，连“秋账未净、冬前后手先来”的那层尾账也压回了同一年。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家通融 += 1;
            pushFamilySeasonTag(stepTag + '秋尾馆签');
            log.push(['〔秋尾馆签〕学生家秋尾回签、炭脚锅火、小回礼和来春帖路后手一起要钱：铜钱-35、通融+1。不是大账，却正把举业路成年人秋尾那层“秋钱未净、冬前门路先来问”的细账重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '秋尾馆签硬顶');
            log.push(['〔秋尾馆签〕这一旬连秋尾回签和炭脚小钱都腾挪不开，只得先硬顶过去；旧馆与学生家这层口风在入冬前又紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_school_winter_book || picked.f_route_school_winter_fee || picked.f_route_write || picked.f_repair || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '年关纸墨已分');
            log.push(['〔年关纸墨〕旧馆账、来春纸墨定钱、灯油与拜帖脚费已被你先分开；举业路这层门路没有在年关忽然断掉。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '年关纸墨');
            log.push(['〔年关纸墨〕旧馆账脚费、来春纸墨定钱和灯油一起要钱：铜钱-40。不是体面消费，而是让“读书这一路还续得下去”不至在年关先断掉。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '年关纸墨硬顶');
            log.push(['〔年关纸墨〕这一旬连纸墨定钱和拜帖脚费都腾挪不开，只得先硬顶过去；举业路这层门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_school_winter_cloth || picked.f_route_school_winter_fee || picked.f_route_school_winter_book || picked.f_child || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '冬头夹衣已理');
            log.push(['〔冬头夹衣〕这一旬先把旧馆回信、孩子夹袄、递话门包和锅火后手分开了；举业路成年人冬头不再只剩“年关先理纸墨”，连孩子过冬夹袄和旧馆回音这层会自己追钱的小耗也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬头夹衣');
            log.push(['〔冬头夹衣〕旧馆回信、孩子夹袄、递话门包和锅火后手一起要钱：铜钱-35、衣药+1。不是大账，却正把举业路成年人冬头那层“旧馆回音未断、家里先得添衣过冬”的细摩擦重新压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬头夹衣硬顶');
            log.push(['〔冬头夹衣〕这一旬连孩子夹袄和递话门包都腾挪不开，只得先硬顶过去；旧馆与家里两头替这一房过冬转圜的口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'winter' && xun === 2) {
          if (picked.f_route_school_winter_split || picked.f_route_write || picked.f_social || picked.f_rest) {
            pushFamilySeasonTag(stepTag + '冬尾笔炭已分');
            log.push(['〔冬尾笔炭〕这一旬先把炭药、守岁零碎和来春拜帖小钱分开了；冬里最容易把“还能接笔墨活”先磨断的那层细账，没有继续滚大。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬尾笔炭');
            log.push(['〔冬尾笔炭〕炭药、守岁零碎和来春拜帖小钱一起要钱：铜钱-35、衣药+1。不是大账，却正把举业路年下那层最碎、也最躲不开的细账压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬尾硬扛');
            log.push(['〔冬尾笔炭〕这一旬连炭药和来春拜帖小钱都腾挪不开，只得先硬扛过去；这一房靠笔墨续家的后手又薄了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_tutor_collect || picked.f_route_surety || picked.f_route_school_winter_post || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '来春帖费已留');
            log.push(['〔来春帖费〕这一旬先把来春拜帖、开馆脚费和差钱后手留住了；举业路到冬尾也不再只剩一句“明春再去问”。', 'good']);
          } else if (spendCopper(40)) {
            pushFamilySeasonTag(stepTag + '来春帖费');
            log.push(['〔来春帖费〕拜帖脚费、开馆回话和差钱小耗一起要钱：铜钱-40。不是新主线，却把冬藏收束前最后一层门路后手重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '来春帖费硬顶');
            log.push(['〔来春帖费〕这一旬连拜帖脚费和开馆回话都腾挪不开，只得先硬顶过去；明春未到，塾师与学生家这层口风先紧了一线（家族-1）。', 'bad']);
          }
          if (picked.f_route_school_winter_copy || picked.f_route_tutor_collect || picked.f_route_school_winter_post || picked.f_duty) {
            pushFamilySeasonTag(stepTag + '冬尾帖样已理');
            log.push(['〔冬尾帖样〕这一旬先把旧馆年下回音、孩子来春帖样、递话门包与锅火后手分开了；举业路冬尾不再只剩“留明春帖费”，连家里读写和旧馆回音这层最细的纸耗也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家供读 += 1;
            pushFamilySeasonTag(stepTag + '冬尾帖样');
            log.push(['〔冬尾帖样〕旧馆年下回音、孩子来春帖样、递话门包与锅火后手一起要钱：铜钱-35、供读+1。不是大账，却正把举业路养家冬尾那层“旧馆未断、家里也得续帖样”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬尾帖样硬顶');
            log.push(['〔冬尾帖样〕这一旬连旧馆回音脚费和孩子帖样都腾挪不开，只得先硬顶过去；冬尾这层旧馆与家里两头口风又一起紧了一线（家族-1）。', 'bad']);
          }
          if (picked.f_route_school_winter_medicine || picked.f_mend || picked.f_child) {
            pushFamilySeasonTag(stepTag + '冬尾炭鞋已分');
            log.push(['〔冬尾炭鞋〕这一旬先把旧馆年下回话、守岁炭药、孩子来春草鞋和递话门包分开了；举业路冬尾不再只剩“帖费与帖样”，连过冬药包和来春脚下穿用也开始在同一年里真找钱。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '冬尾炭鞋');
            log.push(['〔冬尾炭鞋〕旧馆年下回话、守岁炭药、孩子来春草鞋和递话门包一起要钱：铜钱-35、衣药+1。不是大账，却正把举业路冬尾那层“旧馆还在回音、家里却得先过冬续脚”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '冬尾炭鞋硬顶');
            log.push(['〔冬尾炭鞋〕这一旬连炭药和孩子来春草鞋都腾挪不开，只得先硬顶过去；旧馆回音与家里过冬这层口风又一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if (xun === 3 && !dutyReserved && season.id !== 'spring') {
          log.push(['这一旬还没把差役后手先留住，年关或里甲催差时更容易手忙脚乱。', 'bad']);
        }

        if (isYearEnd) {
          if ((S.本年家修缮 || 0) > 0) {
            S.存米 += 1;
            log.push(['〔修缮〕这一年缮过屋与仓，少漏少潮，年末守住存米1石。', 'good']);
          } else {
            log.push(['〔修缮〕这一年始终没顾上修屋缮仓，家里许多小漏耗只得硬扛过去。', 'bad']);
          }
          var mouths = (S.妻室 ? 2 : 1) + (S.子数 || 0) + (S.女数 || 0);
          var needMi = Math.max(1, mouths);
          var payMi = Math.min(S.存米, needMi);
          S.存米 -= payMi;
          var 欠 = needMi - payMi;
          if (欠 > 0) {
            S.负债银 += 欠;
            log.push(['〔口粮〕年末口粮需' + needMi + '石，存米仅缴' + payMi + '石；欠' + 欠 + '石折银举债（负债银+' + 欠 + '）', 'bad']);
          } else {
            log.push(['〔口粮〕年末口粮结清：全家口粮' + needMi + '石照数吃下', 'good']);
          }
          var dutyRisk = (S.本年家备役 || 0) > 0 ? 0.12 : 0.22;
          dutyRisk = Math.max(0.05, dutyRisk - Math.min(0.08, (S.本年家通融 || 0) * 0.04));
          var hit = (((year + mouths) % 9) / 10) < dutyRisk;
          if (hit) {
            if (spendCopper(300)) log.push(['〔差役〕年末里甲催差：铜钱-300（备差不足，硬账照摊）', 'bad']);
            else { S.体魄 -= 8; log.push(['〔差役〕年末里甲催差：现钱不够，只得亲自应役，体魄-8', 'bad']); }
          } else {
            log.push(['〔差役〕这一年里甲催差未落到你头上', 'good']);
          }
          if ((S.本年家通融 || 0) > 0) log.push(['这一养家年你跑了 ' + S.本年家通融 + ' 回里甲与邻里人情；制度压力不再只在年关那一刻才突然落下来。', 'good']);
          if ((S.本年家问价 || 0) > 0 && (S.本年家粜米 || 0) > 0) log.push(['这一养家年你不只卖米，还先跑了市集抄价；同一年里，信息和腿脚也开始真写进家账。', 'good']);
          if ((S.本年家贴家 || 0) > 0) log.push(['这一养家年你有 ' + S.本年家贴家 + ' 回把现钱或脚钱真拢回家里；“在外/在铺/在馆”不再只是文案。', 'good']);
          if ((S.本年家催账 || 0) > 0) log.push(['这一养家年你还亲手催过 ' + S.本年家催账 + ' 回旧账；家计不再只看“赚了没有”，也看“回了没有”。', 'good']);
          if ((S.本年家供读 || 0) > 0) log.push(['这一养家年你另划了 ' + S.本年家供读 + ' 回供读专账；“亦贾亦儒”不再只在死亡页才出现，而是当年就先从现银里被挤出来。', 'good']);
          if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && (S.本年家问价 || 0) > 0 && (S.本年家通融 || 0) > 0) log.push(['这一养家年你不只守田，还先把佃例、水口、租话与米路一旬旬问明；留乡佃田成年后也开始有了“先摸口风、再守家计”的年内节奏。', 'good']);
          if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && (S.本年家贴家 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你至少有一回把春钱、秋粮或冬钱先拆作锅火与差役后手；农路成家后也不再只是“收成进仓就算过了”。', 'good']);
          if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('田头小耗') >= 0; })) log.push(['这一养家年你连草绳、凉药、看水脚路这层田头小耗都摊回了伏夏；留乡务农的年内摩擦，不再只剩一句“庄稼辛苦”。', 'good']);
          if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('租谷差票') >= 0; })) log.push(['这一养家年你还把租谷、差票与锅火拆进秋后细账；“仓里有粮”第一次不再被误写成“秋后自然稳了”。', 'good']);
          if ((route.indexOf('路径一') === 0 || route.indexOf('留乡佃田') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('谷种仓脚') >= 0; })) log.push(['这一养家年你连谷种、仓脚和修渠钱都在冬里先分开；留乡佃田成年后的后手，也开始更像同一年里不断冒头的小事。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家贴家 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你至少有一回把铺里脚钱先拆进家用与差役后手；学徒路成年后也不再只是“在外头站柜”。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家衣药 || 0) > 0 && (S.本年家捎信 || 0) > 0) log.push(['这一养家年你还把铺里脚钱拆成布药、针线与口信；家里等的已不只是钱，也是哪几样东西真到了。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春脚拆家用') >= 0 || String(tag).indexOf('春铺零用已分') >= 0; })) log.push(['这一养家年你连开春第一口脚钱都先拆成布鞋、灯油和灶下零用；学徒路成年期终于不再默认“春头先空过去再说”。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏铺药已问') >= 0; })) log.push(['这一养家年你连伏夏刚起头的茶汤、凉药和带话脚费都先问明了；学徒路不必等到最热那一旬才显出身体与家计的拉扯。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('夏尾铺签') >= 0; })) log.push(['这一养家年你又把夏尾回签、秋前样纸和递话门包提前拆开；学徒路成年期连伏夏收尾那层“秋前后手抢先冒头”的细账，也开始像农路那样在同一年里持续找钱。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋脚锅火已分') >= 0; })) log.push(['这一养家年你还把秋里脚钱、锅火、差钱与家里灯火拆回了同一旬；学徒路成年期也开始像农路那样，一年里每一口回钱都得立刻找去处。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年下客礼已分') >= 0 || String(tag).indexOf('年下客礼已理') >= 0; })) log.push(['这一养家年你又把年下炭药、守岁零用和回铺薄礼先分开；学徒路连年尾那层最碎的人情账，也开始像同一年里不断冒头的小事。', 'good']);
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬尾铺签') >= 0; })) log.push(['这一养家年你又把年下回铺回签、来春脚单和递话脚费压回了冬尾；学徒路连“旧铺还有回音、明春脚路却先来抢钱”的那层回签后手，也开始像同一年里不断冒头的小事。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家贴家 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你至少有一回把同一口现钱拆作家用与差役后手；商路顾家不再只是“年末寄没寄银”，而是年内一直在拆账。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.未回款银 || 0) > 0 && (S.本年家催账 || 0) <= 0) log.push(['这一养家年仍有路上旧账没被催回；家里等钱与外头账期的摩擦，被完整留到了下一年。', 'bad']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家衣药 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你不只把银钱捎回去，还把布药针线也拆进了家计；“商路顾家”第一次不只剩下银两本身。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家问价 || 0) > 0 && (S.本年家通融 || 0) > 0) log.push(['这一养家年你还跑过水脚、问过价、通过行栈与乡里气口；市场与制度的细缝，也被一旬旬写进商路家账。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春路碎账') >= 0; })) log.push(['这一养家年你连熟号回话脚费、样纸门包与家里盐药锅火这层春路小耗都摊回了开春第一旬；商路成年期不必等到伏夏和秋后，春头就已经开始被细账咬住。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏帖册') >= 0; })) log.push(['这一养家年你连伏夏差帖、柜边回帖、递话脚费和孩子纸样都压回了盛夏第一旬；商路成年人在伏夏里终于不只顾水脚和凉药，连制度门包也开始和家内读写一起同年找钱。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏汗药热包') >= 0; })) log.push(['这一养家年你还把自己汗药、孩子热包和递话脚费压回了伏夏第一旬；商路成年人连“自己不能倒、家里也正发热”这层最容易被一句“先扛一下”带过的小账，也开始在本年里先见光。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋路样单') >= 0 || String(tag).indexOf('夏尾账脚') >= 0 || String(tag).indexOf('秋路锅火') >= 0; })) log.push(['这一养家年你连伏夏下旬的柜边样单、秋中的锅火与差票回话，和秋头的牙样脚单都先拆回了家账；商路成年期终于不只在“季中大账”才有内容，连季头、季中与季尾也都在持续咬人。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬尾柜签') >= 0 || String(tag).indexOf('冬尾回签') >= 0 || String(tag).indexOf('冬尾牙帖') >= 0; })) log.push(['这一养家年你又把柜边回签、递话门包、熟号回音与明春牙帖脚费一起压回了冬尾；商路年关终于不再只是“等开春”，连最细的柜边回签也开始在本年里先落账。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('夏尾回话') >= 0 || String(tag).indexOf('秋头脚药') >= 0; })) log.push(['这一养家年你又把夏尾回客话、柜边包纸、秋头药包与回乡脚单拆进了两头季尾季头；商路成年人一年里的内容密度，已经不再只靠“中旬大动作”撑着。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家捎信 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你不只卖工，还先问过活路、再把工食真捎回家里；卖工路成年后也开始有了“先摸活、再回钱”的年内节奏。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家催账 || 0) > 0) log.push(['这一养家年你还回工棚结过 ' + S.本年家催账 + ' 回欠工；家计不再只看“挣了没有”，也看“结了没有”。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家通融 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你还把工头旧识压进差役后手里；卖工路成年后的制度压力，也开始在同一年里被提前摊开。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家衣药 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你至少有一回把伏夏工食拆成汤药和家用；卖工路成年后的身体消耗，也开始在同一年里跟工钱正面碰账。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家问价 || 0) > 0 && (S.本年家捎信 || 0) > 0) log.push(['这一养家年你还先问过秋收旺工与回乡搭手；同一条卖工路里，“外头结现”和“家里缺手”也被你提前摊回了同一年。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏药脚') >= 0; })) log.push(['这一养家年你把工棚落脚、凉汤药脚和带话脚路压回了伏夏上旬；卖工路成年期终于不必等到最热最险时才忽然想起“身子也要钱”。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏工食') >= 0 || String(tag).indexOf('夏尾欠工') >= 0; })) log.push(['这一养家年你又把伏夏工食、夏尾欠工回话和补鞋药钱拆回了同一年夏里；卖工路不再只靠“中旬拆一回工食”撑密度，连夏头、夏中、夏尾都开始持续咬人。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏回签') >= 0; })) log.push(['这一养家年你还把伏夏中旬那层“旧工棚回签未稳、锅火凉药却先来追钱”的细账压回了同旬；卖工路成年期终于连盛夏中腰也开始像农路那样被回签、家用和身体一起咬住。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春中回签') >= 0; })) log.push(['这一养家年你连春中那层“旧工回签还没落手、孩子草鞋和锅火却先来”的细账都先拆开了；卖工路成年期终于不必等到伏夏才开始显出同年碎账密度。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋工锅火') >= 0 || String(tag).indexOf('秋尾差脚') >= 0 || String(tag).indexOf('秋中回签') >= 0 || String(tag).indexOf('秋中夹衣') >= 0; })) log.push(['这一养家年你还把秋工锅火、秋中回签、孩子夹衣、租路饭钱、差钱后手和秋尾回话门包一起摊回了秋中秋尾；旺工钱终于不再只是“挣得多”，而是当旬就要被家用、制度和人情拆开。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年关问欠工') >= 0; })) log.push(['这一养家年你在冬里先把欠工、明春活路和差钱后手分开；卖工路不再只是忙时挣钱、闲时挨过。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬头夹衣') >= 0; })) log.push(['这一养家年你连冬头那层“孩子夹衣还没添、旧工回签门包却先来”的细账都压回了同旬；卖工路成年人到了年关，也终于像农路一样在家内、门路与锅火三头同时过日子。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家捎信 || 0) > 0 && (S.本年家催账 || 0) > 0) log.push(['这一养家年你不只写字补贴，还先问过馆课与保结、再把馆课钱真正结回家里；举业路成年后也开始有了年内来回到账的节奏。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家通融 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你还把塾师、廪保和学生家的门路提前压进差役后手里；“读书人脉”第一次在本代年内真实落到制度账上。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春头馆契') >= 0; })) log.push(['这一养家年你连春头馆契、学生家纸样和递话脚费都先压回了第一旬；举业路成年期终于不再要等到春中春尾才开始“像是在过日子”。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春课纸香') >= 0; })) log.push(['这一养家年你连清明香纸、课本纸笔和灯油草鞋都在开春先分开；举业路成年期终于不再默认“春头先空过去再说”。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('馆课零耗') >= 0; })) log.push(['这一养家年你连潮纸、投帖脚费和塾馆茶汤这层碎耗都摊回了伏夏；举业路成年期不再只剩“接没接到馆课”的大开关。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('伏夏抄手凉药') >= 0; })) log.push(['这一养家年你还把伏夏誊抄刚换来的小钱，连同凉药、孩子草鞋和锅火一起拆回了盛夏中旬；举业路成年期终于也开始把身体和家内穿用压进同一年，而不只盯着馆课有没有续上。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('夏尾馆信') >= 0; })) log.push(['这一养家年你还把学生家回话、秋前纸样与递话脚费压回了伏夏尾声；举业路成年期连“秋前门路还没开、纸样却先来催钱”的那层小耗也开始进真账。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬尾帖样') >= 0; })) log.push(['这一养家年你又把旧馆年下回音、孩子来春帖样、递话门包与锅火后手压进了冬尾；举业路到年关最后一旬终于不再只剩“留明春帖费”，连家里续帖样这层生活细账也开始同年见光。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋头馆帖') >= 0; })) log.push(['这一养家年你又把秋头帖脚、孩子纸包和锅火压回了秋头第一旬；举业路成年期终于不再只靠秋中秋尾撑厚度，连秋头也开始自己冒细账。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋后纸墨') >= 0; })) log.push(['这一养家年你还把润笔、保结薄礼与学生家回话脚费拆进了秋后细账；“笔墨钱”第一次不再被误写成整口宽裕。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋尾馆签') >= 0; })) log.push(['这一养家年你又把学生家秋尾回签、炭脚锅火、小回礼和来春帖路后手压回了秋尾；举业路成年期终于不只是在秋头、秋中有内容，连入冬前最后那层尾账也开始同年见光。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋尾簿册') >= 0; })) log.push(['这一养家年你又把学生家簿册、回话门包、孩子灯油和来春帖样压回了秋尾；举业路成年人连“馆课还在续、家里读写也不能断”的那层秋尾后手，也开始在本年里自己找钱。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年关纸墨') >= 0; })) log.push(['这一养家年你连旧馆账、来春纸墨定钱和灯油脚费都在年关先分开；举业路成年后的后手开始更像同一年里不断冒头的小事。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬中咳药') >= 0; })) log.push(['这一养家年你还把冬中寒咳药包、旧馆灯油、递话脚费和守夜锅火拆回了同旬；举业路成年人终于不只在年关理门路，也开始把身体这层冬月真账压回本年。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('冬尾笔炭') >= 0 || String(tag).indexOf('来春帖费') >= 0; })) log.push(['这一养家年你又把炭药、来春拜帖与开馆脚费拆进了冬尾细账；举业路连年末那层最碎、也最不能断的门路后手，都开始像同一年里不断冒头的小事。', 'good']);
          if ((S.本年家季务 || []).length <= 4) log.push(['这一养家年落进账里的旬务仍嫌太薄，说明这一年多半只是硬过而没把细账真正摊开。', 'bad']);
        }

        clampAttr('体魄');
        clampAttr('家族');

        if (!isYearEnd) {
          if (xun >= 3) {
            S.家季 = seasonIdx + 1;
            S.家旬 = 1;
            curStage.next = 'family';
            curStage.nextLabel = '转入' + nextSeason.name + '·上旬 →';
          } else {
            S.家旬 = xun + 1;
            curStage.next = 'family';
            curStage.nextLabel = '转入' + season.name + '·' + familyXunLabel(xun + 1) + ' →';
          }
          return;
        }

        S.家年 = year + 1;
        resetFamilyYearLedger();
        curStage.next = (baseStartAge + (S.家年 - 1) >= targetAge) ? 'household' : 'family';
        curStage.nextLabel = (curStage.next === 'household') ? '转入当户节点 →' : '又一年春起 →';
      }
    };
  }

  function stageWageHousehold() {
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);
    var canCollect = (S.雇工历练 || 0) >= 1 || (S.城里门路 || 0) > 0 || (S.本年户通融 || 0) > 0;
    var canSelfField = (S.田亩 > 0) && (S.委托营生 === '无' || S.委托营生 === '分得薄田自耕');
    var canLeaseField = (S.田亩 > 0) && (S.委托租谷 || 0) <= 0;
    var canProxy = (S.婚配路径 === '先应差·外出佣工') || (S.城里门路 || 0) > 0;
    var canSplitJoint = S.合爨状态 === '随兄合户';
    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var collectName = seasonIdx === 1
      ? '回头结一回旧工账'
      : (seasonIdx === 2 ? '伏夏回工棚结旧工' : (seasonIdx === 3 ? '把秋旺工钱结回这一房' : '赶在年关前结一回欠工'));
    var proxyName = seasonIdx === 1
      ? '托旧工头先探这一年里役'
      : (seasonIdx === 2 ? '伏夏托旧工头先压差役' : (seasonIdx === 3 ? '托旧工头先留秋后代应' : '凭旧工头请人代应'));
    var holdFieldName = seasonIdx === 1
      ? '先把分得薄田改作自耕'
      : (seasonIdx === 2 ? '伏夏回头顾田守口粮' : (seasonIdx === 3 ? '把秋后薄田坐成自耕账' : '年关前把薄田自耕账写实'));
    var leaseFieldName = seasonIdx === 1
      ? '先把薄田出佃保口粮'
      : (seasonIdx === 2 ? '伏夏先把薄田立成租账' : (seasonIdx === 3 ? '把秋后薄田先分作租谷' : '年关前把薄田租账坐实'));
    var literateName = seasonIdx === 1
      ? '识字·先抄分书与工账'
      : (seasonIdx === 2 ? '识字·抄清田面与水脚' : (seasonIdx === 3 ? '识字·核秋钱与租谷' : '识字·对年关差钱'));
    var clanName = seasonIdx === 1
      ? '先跟兄房与里甲通气'
      : (seasonIdx === 2 ? '伏夏先托邻里照田' : (seasonIdx === 3 ? '先把秋后人情面压住' : '年关先托乡里说话'));
    var payName = seasonIdx <= 3 ? '先留纳银代役现钱' : '纳银代役';
    var wageEventTxt;
    if (season.id === 'spring' && xun === 1) {
      wageEventTxt = '春分书的上旬最怕把“得了 4 亩”听成“日后自然稳了”。这一旬先要把分书、旧工账、合爨余绪和谁肯替这一房说话一笔笔拆开。';
    } else if (season.id === 'spring' && xun === 2) {
      wageEventTxt = '春分书的中旬最像第一次真掂这 4 亩薄田：是回头顾田，把“纯卖工”改成半自耕，还是先立租账，让口粮不要全绑在雇主脸色上。';
    } else if (season.id === 'spring' && xun === 3) {
      wageEventTxt = '春分书的下旬更像清旧账：工棚里压着的欠工、先前合爨攒下的共账和旧工头这层熟面，要不要先结回来，全会改写这一房接下来靠什么过。';
    } else if (season.id === 'summer' && xun === 1) {
      wageEventTxt = '伏夏上旬最怕活还没断，人先被暑气和热病磨垮。外头工棚、田头缺水和家里草鞋汤药，会一齐来抢同一口现钱与同一双手。';
    } else if (season.id === 'summer' && xun === 2) {
      wageEventTxt = '伏夏中旬最像把工食和田面同时拆薄：旧工回签、田头草绳、凉汤药脚和锅火小耗会一齐来抢同一口现钱；若只顾外头做活，家里薄田就会发虚；若只顾守田，这一房眼前的现钱又会先断。';
    } else if (season.id === 'summer' && xun === 3) {
      wageEventTxt = '伏夏下旬更像给年关留后手：凉汤药、草鞋、工棚脚路与差钱若还不先分开，到了冬里就会一起反咬回来。';
    } else if (season.id === 'autumn' && xun === 1) {
      wageEventTxt = '秋定租的上旬，一头是外头旺工来得快，一头是自家薄田终于有点像样。你先把哪边坐成账，就决定这一房是多一口口粮，还是多一口现钱。';
    } else if (season.id === 'autumn' && xun === 2) {
      wageEventTxt = '秋定租的中旬看着最像“终于能松一口”，其实锅火、差钱、薄田秋后租谷与旧工钱一起更急；若不先拆账，忙季的钱会立刻漏光。';
    } else if (season.id === 'autumn' && xun === 3) {
      wageEventTxt = '秋定租的下旬最像把这一房真正坐稳：回头结工、压住人情、先留代应，不然到了冬里，分得的田与挣回的钱都还像浮在纸上。';
    } else if (season.id === 'winter' && xun === 1) {
      wageEventTxt = '冬应役的上旬不是只看你敢不敢扛，而是看这一年有没有先把欠工、租谷、旧工头和差钱后手一层层垫起来。';
    } else if (season.id === 'winter' && xun === 2) {
      wageEventTxt = '冬应役的中旬最像翻总账：哪笔欠工赶回来了、哪口田能回租、哪层人情能替你代应，都会在这一旬里见真章。';
    } else {
      wageEventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把钱、人情、田面与旧工账分开，都会在这一旬里一起现形。';
    }
    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '卖工路的当户阶段现也改成“四季三旬”。分家、薄田、旧工账、旧工头的人情、里甲差钱与年关后手，不再一口气糊成“一次 4 点”，而要在同一年里逐旬拆开。' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是再做一件“大事”，而是把“先守田、先结工、先托人、先留差钱”里最要紧的那两手先坐实。',
      dossier: function () {
        return lifeDossier('卖工路当户拆为四季三旬｜户程=' + stepLabel + '｜婚配路径=' + S.婚配路径 + '｜城里门路=' + (S.城里门路 || 0) + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '分家把 4 亩薄田真正写进了你这一房，但“名下有田”不等于“日子就稳了”。卖工出身的人，还得把这 4 亩怎么管、哪口工钱先回、哪层旧工头人情还能用逐一坐实。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[工账]', txt: wageEventTxt },
        hp.event,
        householdFlavorEvent('wage', season.id, xun),
        householdSeasonPulseEvent(season.id, xun)
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把卖工路的当户一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        if (canCollect) A.push({ id: 'h_wage_collect', name: collectName, cost: 1, eff: '铜钱+120~180·催回旧工钱', desc: '旧工钱不回手，这一房的差钱、锅火和田面后手都只是空话。', can: true, once: true });
        if (canSelfField) A.push({ id: 'h_hold_field', name: holdFieldName, cost: 1, eff: '存米+1~2·农事历练+1~2·风险降', desc: '把第一次分到自己名下的薄田先坐成自耕账，哪怕还要继续卖工，这一房也不至彻底断在雇主脸色上。', can: true, once: true });
        if (canLeaseField) A.push({ id: 'h_lease_home', name: leaseFieldName, cost: 1, eff: '年租谷+1·风险降', desc: '若眼下还得先靠工钱撑着，就把薄田先立成租账，让它先回一口稳定租谷。', can: true, once: true });
        if (canProxy) A.push({ id: 'h_proxy_wage', name: proxyName, cost: 1, eff: '白银-1或铜钱-180·差役后手更实', desc: '年轻时外出佣工或跑熟的工棚门路，此时能替你先问代应、脚路与凑现钱的门道。', can: true, once: true });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，年关轮值时就不至只剩硬扛。', can: true, once: true });
        if (canSplitJoint) A.push({ id: 'h_split_joint', name: '父故后析爨清共账', cost: 1, eff: '铜钱+180·家族-1·立独户账', desc: '趁分书这一季，把先前随兄合爨的共账、人情与余粮清回你这一房，不让“共着过日子”一直拖到冬里再炸。', can: true, once: true });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、工账、租谷、水脚和差钱抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把兄房、邻里、里甲与谁肯替这一房说话坐实，到冬里就不至一口气全吃人情亏。', can: (S.本年户通融 || 0) < 2, once: true });
        A.push({ id: 'h_hire', name: seasonIdx <= 2 ? '雇工顾住田面' : '雇短工把秋后田面收住', cost: 1, eff: '铜钱-300·田面不至空转', desc: '卖工出身的人最怕“分得了田，偏偏没空顾”。先花钱把田面顾住，少让这一房的根脚漏掉。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        if (season.id === 'spring' && xun === 1) A.push({ id: 'h_wage_spring_setup', name: '先把析灶锅火与分书脚费分开', cost: 1, eff: '铜钱-45·核账+1·通融+1·家族+1', desc: '春分书刚起头，最怕分灶锅火、分书脚费、回话门包和量斗草席一起先来要钱。先把这层立户第一口碎账拆开，刚从兄房分出来这一房才不至一开春就只剩锅火硬顶。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文' });
        if (season.id === 'spring' && xun === 2) A.push({ id: 'h_wage_spring_packet', name: '先把分书回话与草鞋丈绳分开', cost: 1, eff: '铜钱-50·核账+1·通融+1·家族+1', desc: '春分书到了中旬，最怕分书回话、田头丈绳、草鞋补绳和递话脚费一起挤这一口现钱。先把这层小耗拆开，刚分到手的薄田才不至还没坐实就先把锅火和地角一起拖虚。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文' });
        if (season.id === 'spring' && xun === 3) A.push({ id: 'h_wage_spring_bundle', name: '把春尾欠工拆作锅火与草鞋', cost: 1, eff: '铜钱-80·备役+1·通融+1·家族+1', desc: '春尾最怕刚结回的一口欠工，看着能救急，转头却被锅火、草鞋、带话脚费和差钱后手一起吃掉。先把这口钱拆开，立户第一季末才不至又回到“有回钱也像没回”的老样子。', can: S.铜钱 >= 80, why: S.铜钱 >= 80 ? '' : '铜钱不足80文' });
        if (season.id === 'summer' && xun === 1) A.push({ id: 'h_wage_summer_note', name: '先问工棚落脚与凉汤药脚路', cost: 1, eff: '铜钱-40·通融+1·家族+1', desc: '伏夏最怕活还在，人先被热和药脚磨穿。先把工棚落脚、凉汤药脚与带话脚路问明，后头工食和家用才不至一起被暑气截断。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文' });
        if (season.id === 'summer' && xun === 2) A.push({ id: 'h_wage_summer_split', name: '把伏夏工食拆作凉汤与家用', cost: 1, eff: '铜钱-90·通融+1·家族+1', desc: '伏夏看着还有工食，其实凉汤、汗药、草鞋和家里那口急米最会先来抢钱。先把这口工食拆开，少让热里一旬先把锅火磨穿。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文' });
        if (season.id === 'summer' && xun === 2) A.push({ id: 'h_wage_summer_reply', name: '先把伏夏回签与田头草绳分开', cost: 1, eff: '铜钱-60·核账+1·通融+1·家族+1', desc: '伏夏中旬最怕旧工回签、田头草绳、递话门包和凉汤药脚一起冒头。先把这层伏夏回签拆开，不让“工食和田面都还没稳”又先被草绳与门包磨空。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文' });
        if (season.id === 'summer' && xun === 3) A.push({ id: 'h_wage_summer_tail', name: '先把夏尾欠工回话与秋前草料分开', cost: 1, eff: '铜钱-55·备役+1·通融+1·家族+1', desc: '伏夏下旬最怕欠工回话、秋前草料、补鞋药钱和递话门包一起冒头。先把这层夏尾小耗拆开，秋前第一口后手就不必继续拿伏夏锅火去垫。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文' });
        if (season.id === 'autumn' && xun === 1) A.push({ id: 'h_wage_autumn_note', name: '先问秋收旺工与回乡看田路', cost: 1, eff: '铜钱-35·通融+1·家族+1', desc: '秋里一头是外头旺工，一头是回乡看田催租。先把哪天回乡、哪边更急、脚路要不要先留问清，后头才不至工钱和田路两头都误。', can: S.铜钱 >= 35, why: S.铜钱 >= 35 ? '' : '铜钱不足35文' });
        if (season.id === 'autumn' && xun === 1) A.push({ id: 'h_wage_autumn_packet', name: '先把秋头回签与草鞋脚费分开', cost: 1, eff: '铜钱-50·核账+1·通融+1·家族+1', desc: '秋头最怕旧工回签、草鞋脚费、回乡门包和看田回话一起挤同一口现钱。先把这层秋头小账拆开，旺工还没真正落手时，这一房也不至先把脚路和锅火揉成一团。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文' });
        if (season.id === 'autumn' && xun === 2) A.push({ id: 'h_wage_autumn_receipt', name: '先把秋中回签与租路饭钱分开', cost: 1, eff: '铜钱-60·核账+1·通融+1·家族+1', desc: '秋定租到了中旬，最怕旧工回签、租路饭钱、递话脚费和锅火后手一起先来。先把这层秋中回签拆开，旺工钱还没真正落袋时，这一房也不至先被回乡饭钱和回话门包磨空。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文' });
        if (season.id === 'autumn' && xun === 2) A.push({ id: 'h_wage_autumn_split', name: '把秋工回钱拆作锅火与差票', cost: 1, eff: '铜钱-95·备役+1·通融+1·家族+1', desc: '秋定租到了中旬，最怕旺工回钱看着厚一点，锅火、差票、回乡脚费和家里灯火却一起扑上来。先把秋工这口回钱拆进几层真后手，秋里就不必再把“终于宽一口”误写成整口可花的现钱。', can: S.铜钱 >= 95, why: S.铜钱 >= 95 ? '' : '铜钱不足95文' });
        if (season.id === 'autumn' && xun === 3) A.push({ id: 'h_wage_autumn_tail', name: '先把秋尾回话与催差脚费分开', cost: 1, eff: '铜钱-55·备役+1·通融+1', desc: '秋尾最怕旺工回话还没落手，催差脚费和回乡回话已经先来要钱。你先把这层小耗拆开，不让“秋里看着有进项”一转身又薄回去。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文' });
        if (season.id === 'winter' && xun === 1) A.push({ id: 'h_wage_winter_gift', name: '先把旧工头薄礼与炭钱分开', cost: 1, eff: '铜钱-70·通融+1·家族+1', desc: '年关最怕旧工头薄礼、炭钱和回话脚费一起挤同一口现钱。你先把这层小钱拆开，门路和锅火不至一并断。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文' });
        if (season.id === 'winter' && xun === 2) A.push({ id: 'h_wage_winter_clear', name: '先把冬中欠工回话与门包分开', cost: 1, eff: '铜钱-60·核账+1·通融+1', desc: '冬中最怕欠工回话、灯油炭钱、递话门包和回乡脚费一起先来要钱。你先把这层碎账拆开，翻年关总账时就不至只剩一句“钱快回来了”。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文' });
        if (season.id === 'winter' && xun === 2) A.push({ id: 'h_wage_winter_register', name: '先把冬中抄簿与孩子炭笔分开', cost: 1, eff: '铜钱-55·核账+1·通融+1·家族+1', desc: '冬中最怕欠工抄簿、孩子炭笔、递话脚费和守岁锅火一起先来抢钱。先把这层抄簿与炭笔拆开，年关中段就不再只剩“等回话、问明春”，而会继续被家里和账册细账咬住。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文' });
        if (season.id === 'winter' && xun === 2) A.push({ id: 'h_wage_winter_route', name: '先问明春工棚与头程脚路', cost: 1, eff: '铜钱-50·备役+1·通融+1', desc: '冬尾不是只熬过去。先把明春哪处工棚肯留脚、头程脚费和递话小门包问明，来春第一旬才不至重新拿身子去硬顶。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文' });
        if (season.id === 'winter' && xun === 3) A.push({ id: 'h_wage_winter_tail', name: '先把年下回签与来春草鞋分开', cost: 1, eff: '铜钱-55·核账+1·备役+1·通融+1·家族+1', desc: '冬尾最怕年下回签、来春草鞋、递话门包和眼前锅火一起压上来。先把这层年下碎账拆开并抄进真账，来春第一程和今冬最后几口家用才不必继续抢同一口现钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文' });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口零活补差钱', cost: 1, eff: side.effect, desc: '当户这一年照样得找现钱。哪怕只是多接一层零活，也是在给锅火、田面和差钱添后手。', can: true });
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年卖工出身，当户这一年若先把身子熬垮，后头再多账面后手也接不住。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var proxySet = false;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_wage_collect':
              var wageCollectGain = 120 + Math.min(40, Math.max(0, seasonIdx - 1) * 10) + ((S.城里门路 || 0) > 0 ? 20 : 0);
              S.铜钱 += wageCollectGain;
              S.本年户催账 += 1;
              pushHouseholdSeasonTag(season.name + '结回旧工');
              log.push(['你在' + stepLabel + '回头把先前压着的工钱与脚钱结回一点：铜钱+' + wageCollectGain + '。不是凭空添一笔，只把该你的那口钱真正拢回这一房。', 'good']);
              actionCount += 1;
              break;
            case 'h_hold_field':
              S.委托营生 = '分得薄田自耕';
              S.委托租谷 = 0;
              S.委托待收租谷 = 0;
              var fieldGain = 1 + ((S.家传农事 || 0) > 0 ? 1 : 0);
              var fieldPractice = ((S.家传农事 || 0) > 0 ? 2 : 1);
              S.存米 += fieldGain;
              S.农事历练 += fieldPractice;
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('薄田自耕');
              log.push(['你在' + stepLabel + '把分得薄田先坐成自耕账：存米+' + fieldGain + '、农事历练+' + fieldPractice + '。卖工出身的人到这一步，第一次真把“有田”写成了能养这一房的一口口粮。', 'good']);
              actionCount += 1;
              break;
            case 'h_lease_home':
              S.委托营生 = '出佃收租';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('薄田租账');
              log.push(['你在' + stepLabel + '先把薄田立成租账：年租谷+1。眼下仍要靠卖工找现钱，但口粮至少不再全绑在失工与旺工上。', 'good']);
              actionCount += 1;
              break;
            case 'h_proxy_wage':
              if (spendSilver(1)) {
                S.本年户备役 += 1;
                proxySet = true;
                pushHouseholdSeasonTag('工头代应');
                log.push(['你在' + stepLabel + '先托旧工头请人代应：白银-1。外头熟识替你把这一任里役顶开一线，不必全靠本宗这一条路。', 'good']);
                actionCount += 1;
              } else if (spendCopper(180)) {
                S.本年户备役 += 1;
                proxySet = true;
                pushHouseholdSeasonTag('工头代应');
                log.push(['你在' + stepLabel + '先托旧工头探代应门路：铜钱-180。现钱少一口，但年关就不至只剩硬扛。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先托旧工头压差役，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把纳银代役的现钱坐实：白银-2。等到冬里真轮到这一房，就不至把整年后手一起赔进去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留纳银代役现钱，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_split_joint':
              S.合爨状态 = '已析爨';
              S.铜钱 += 180;
              S.家族 -= 1;
              S.本年户核账 += 1;
              pushHouseholdSeasonTag('析爨清共账');
              log.push(['你在' + stepLabel + '把先前合爨的共账清回这一房：铜钱+180、家族-1。往后再遇差役和口粮，不必全从“还跟着兄房一起糊着过”算起。', 'good']);
              actionCount += 1;
              break;
            case 'h_literate':
              S.本年户核账 += 1;
              pushHouseholdSeasonTag(season.name + '核账');
              log.push(['你在' + stepLabel + '先把分书、工账、租谷和差钱抄清。识字不是加分，而是少让这一房在糊涂账里白漏一层。', 'good']);
              actionCount += 1;
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('乡里通气');
              log.push(['你在' + stepLabel + '先把兄房、邻里和里甲的人情面压实：家族+2。到冬里真轮值时，至少不是独自去吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得这一房“分得了田，却白荒一季”。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '雇工顾住田面，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_summer_note':
              if (spendCopper(40)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏药脚');
                log.push(['你在' + stepLabel + '先把工棚落脚、凉汤药脚与带话脚路问明：铜钱-40、家族+1。伏夏还没过去，但活路和药脚不再一上来就一起发虚。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先问工棚落脚与凉汤药脚路，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_summer_split':
              if (spendCopper(90)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏工食拆账');
                log.push(['你在' + stepLabel + '先把伏夏工食拆作凉汤与家用：铜钱-90、家族+1。热里这一口现钱不再一转身就全漏在药脚和锅火上。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏工食拆作凉汤与家用，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_summer_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏回签拆开');
                log.push(['你在' + stepLabel + '先把伏夏回签与田头草绳分开：铜钱-60、核账+1、通融+1、家族+1。旧工回签、田头草绳、递话门包和凉汤药脚先被拆开，卖工路当户到了伏夏中旬，也开始把“工食未稳、田头小耗先来”的细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏回签与田头草绳分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_spring_setup':
              if (spendCopper(45)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('析灶脚费拆开');
                log.push(['你在' + stepLabel + '先把析灶锅火与分书脚费分开：铜钱-45、核账+1、通融+1、家族+1。卖工路当户的第一旬不再只是“已经分家了”，连锅釜、量斗和回话脚费这层立户碎账也先被拆进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把析灶锅火与分书脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_spring_packet':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中地角拆开');
                log.push(['你在' + stepLabel + '先把分书回话、草鞋补绳、丈绳脚费和田头界纸分开：铜钱-50、核账+1、通融+1、家族+1。卖工路当户到了春中，最先磨人的那层地角碎费终于先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把分书回话与草鞋丈绳分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_spring_bundle':
              if (spendCopper(80)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春尾欠工拆开');
                log.push(['你在' + stepLabel + '先把春尾欠工拆作锅火与草鞋：铜钱-80、备役+1、通融+1、家族+1。刚回到手的一口欠工，没有再被春尾锅火、草鞋和差钱后手一口气混吃。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '把春尾欠工拆作锅火与草鞋，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_summer_tail':
              if (spendCopper(55)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('夏尾欠工拆开');
                log.push(['你在' + stepLabel + '先把夏尾欠工回话与秋前草料分开：铜钱-55、备役+1、通融+1、家族+1。伏夏收尾这层欠工回话、补鞋药钱和秋前草料，终于没再继续挤同一口锅火钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把夏尾欠工回话与秋前草料分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_autumn_note':
              if (spendCopper(35)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋旺工路');
                log.push(['你在' + stepLabel + '先把秋收旺工与回乡看田路问明：铜钱-35、家族+1。秋里这口现钱和脚路，总算不再两头各自瞎撞。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先问秋收旺工与回乡看田路，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_autumn_packet':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋头工签拆开');
                log.push(['你在' + stepLabel + '先把秋头回签、草鞋脚费和回乡门包拆开：铜钱-50、核账+1、通融+1、家族+1。秋里旺工还没真正落手，这一房先把最细的脚路与回话小账抄进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋头回签与草鞋脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_autumn_tail':
              if (spendCopper(55)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                pushHouseholdSeasonTag('秋尾差脚');
                log.push(['你在' + stepLabel + '先把秋尾回话与催差脚费分开：铜钱-55、备役+1。秋钱看着已回一点，差票和回话却没再来抢同一口钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾回话与催差脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_autumn_receipt':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋中回签拆开');
                log.push(['你在' + stepLabel + '先把旧工回签、租路饭钱、递话脚费和锅火后手分开：铜钱-60、核账+1、通融+1、家族+1。秋定租中旬这层“旧工还在回话、回乡和家用却先来追钱”的细账，总算先被拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋中回签与租路饭钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_autumn_split':
              if (spendCopper(95)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋工回钱拆开');
                log.push(['你在' + stepLabel + '先把秋工回钱拆作锅火与差票：铜钱-95、备役+1、通融+1、家族+1。秋里最像“终于宽一口”的那笔回钱，这回先被你拆成了这一房真能守住的后手。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '把秋工回钱拆作锅火与差票，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_winter_gift':
              if (spendCopper(70)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('工棚炭礼');
                log.push(['你在' + stepLabel + '先把旧工头薄礼、炭钱和回话脚费分开：铜钱-70、家族+1。年关这层门路与锅火，没有再硬挤同一口现钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把旧工头薄礼与炭钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_winter_clear':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                pushHouseholdSeasonTag('冬中回话');
                log.push(['你在' + stepLabel + '先把欠工回话、灯油炭钱与递话门包分开：铜钱-60、核账+1、通融+1。年关总账最容易先冒头的这层门包与脚费，这回先被你拆进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中欠工回话与门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_winter_register':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中抄簿拆开');
                log.push(['你在' + stepLabel + '先把冬中抄簿、孩子炭笔、递话脚费和守岁锅火分开：铜钱-55、核账+1、通融+1、家族+1。卖工路当户的年关中段不再只剩“等欠工回话”，连账册、孩子来春读写和锅火这层小耗也一起落进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中抄簿与孩子炭笔分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_winter_route':
              if (spendCopper(50)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                pushHouseholdSeasonTag('明春工路');
                log.push(['你在' + stepLabel + '先把明春工棚、头程脚费与递话门包问明：铜钱-50、备役+1。来春第一旬不必再拿身子去硬换这层脚路。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先问明春工棚与头程脚路，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wage_winter_tail':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾草鞋已留');
                log.push(['你在' + stepLabel + '先把年下回签与来春草鞋分开：铜钱-55、核账+1、备役+1、通融+1、家族+1。卖工路冬尾最细也最烦的那层回签、草鞋和门包碎账，这回也被你真抄进了账里，不再继续挤同一口过冬钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下回签与来春草鞋分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(season.name + '贴补');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先将养身子：体魄+5。', 'good']);
              actionCount += 1;
              break;
          }
        });
        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);
        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          summer: {
            handledIds: ['h_hire', 'h_side', 'h_rest', 'h_proxy_wage', 'h_hold_field', 'h_literate', 'h_wage_summer_note', 'h_wage_summer_split', 'h_wage_summer_tail'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬你先把凉药、草鞋、田面与工棚脚路里至少一层顾住；伏夏损耗没有消失，但没再把卖工路的身子和锅火一并熬穿。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕凉药、草鞋、工棚脚路和田边小耗一齐冒头：铜钱-{cost}。不是大祸，只是当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连凉药和草鞋钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_wage_collect', 'h_proxy_wage', 'h_pay', 'h_lease_home', 'h_clan', 'h_side', 'h_wage_autumn_note', 'h_wage_autumn_receipt', 'h_wage_autumn_tail', 'h_wage_autumn_split'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋里旧工钱、租谷、锅火与差钱已被你先拆开；旺工回钱这旬没再被误当成“终于宽裕”。',
            cost: 70,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕秋后催差口风、脚路人情和锅火碎用一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房的人情面更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_pay', 'h_proxy_wage', 'h_literate', 'h_wage_collect', 'h_side', 'h_rest', 'h_wage_winter_gift', 'h_wage_winter_clear', 'h_wage_winter_register', 'h_wage_winter_route', 'h_wage_winter_tail'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕欠工、明春活路、灯油草鞋与差钱已经被你先分开；年关没再把同一口现钱搅成一团。',
            cost: 50,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、草鞋、来春脚路和应役前的小脚费一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          }
        });
        if (season.id === 'spring' && xun === 1) {
          if (picked.h_split_joint || picked.h_literate || picked.h_clan || picked.h_wage_spring_setup) {
            pushHouseholdSeasonTag(stepLabel + '析灶锅火已安');
            log.push(['〔析灶锅火〕分书后该添的锅釜、草席、量斗和跟兄房分开的那口锅火，这一旬已被你先安顿；立户不是一句“分到了”，而是真把这一房的日子拆出来。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '析灶锅火');
            log.push(['〔析灶锅火〕分书后添锅釜、草席、量斗与分灶杂用一起冒头：铜钱-50。不是新主线，只是立户第一旬就得先把“各过各的日子”坐成真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '析灶硬顶');
            log.push(['〔析灶锅火〕这一旬连分灶杂用都腾挪不开，只得继续借着兄房锅火硬顶；这一房刚立起来的人情面先薄了一层（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_hold_field || picked.h_lease_home || picked.h_literate || picked.h_proxy_wage || picked.h_wage_spring_packet) {
            pushHouseholdSeasonTag(stepLabel + '分书地角已清');
            log.push(['〔分书地角〕这一旬先把分书抄样、地角丈绳、回话脚费和田头界纸分开了；“名下有田”不再只是纸上四亩，而开始像这一房自己得管的真账。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '分书地角');
            log.push(['〔分书地角〕分书抄样、地角丈绳、回话脚费和田头界纸一起要钱：铜钱-45。不是大账，却正把立户后“地虽然分到了、脚钱和纸样也得自己扛”的第一层制度小耗压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '地角硬顶');
            log.push(['〔分书地角〕这一旬连丈绳和回话脚费都腾挪不开，只得先硬顶过去；新分出来这一房在兄房与邻里眼里先虚了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 3) {
          if (picked.h_wage_collect || picked.h_wage_spring_bundle || picked.h_clan || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '春尾锅火已分');
            log.push(['〔春尾锅火〕这一旬先把欠工回话、锅火、草鞋和递话门包分开了；立户第一季末不再只剩“有一口旧工快回”，而是把哪口现钱先续灶火、哪口后手留给差役真拆成了几层。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '春尾锅火');
            log.push(['〔春尾锅火〕欠工回话、锅火、草鞋和递话门包一起要钱：铜钱-50。不是大账，却正把“春尾刚结回一点旧工、家里几层碎用也同时扑上来”的那口真摩擦压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '春尾硬顶');
            log.push(['〔春尾锅火〕这一旬连锅火和草鞋钱都腾挪不开，只得穿着旧草鞋两头硬跑，把这一季最后一口身子继续往里顶（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 1) {
          if (picked.h_wage_summer_note || picked.h_proxy_wage || picked.h_clan || picked.h_side) {
            pushHouseholdSeasonTag(stepLabel + '伏夏药脚已问');
            log.push(['〔伏夏药脚〕这一旬先把工棚落脚、凉汤药脚和回话脚路问明；卖工路当户在伏夏不再只剩“再接一口零活”，而开始先顾住身子和活路。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏药脚');
            log.push(['〔伏夏药脚〕工棚落脚、凉汤药脚和回话脚路一起要钱：铜钱-45。不是大祸，却正是伏夏一开始最容易先咬住这房的那层小耗。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏药脚硬顶');
            log.push(['〔伏夏药脚〕这一旬连凉汤药脚和带话脚费都腾挪不开，只得先硬扛过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_hold_field || picked.h_hire || picked.h_side || picked.h_rest || picked.h_literate || picked.h_wage_summer_split || picked.h_wage_summer_reply) {
            pushHouseholdSeasonTag(stepLabel + '伏夏田工已拆');
            log.push(['〔伏夏田工〕这一旬先把凉汤、田埂草鞋、看水饭食和工棚脚路拆开了；卖工出身的人第一次守这一房时，伏夏那层“田和工都要人”的磨损没再混成一口糊账。', 'good']);
          } else if (spendCopper(55)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏田工');
            log.push(['〔伏夏田工〕凉汤、田埂草鞋、看水饭食和工棚脚路一起要钱：铜钱-55。不是大祸，却正把“外头还得卖工、家里又要守田”的伏夏真摩擦重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏田工硬顶');
            log.push(['〔伏夏田工〕这一旬连凉汤草鞋和看水饭食都腾挪不开，只得靠身子两头硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_wage_summer_reply || picked.h_wage_summer_split || picked.h_literate || picked.h_hold_field) {
            pushHouseholdSeasonTag(stepLabel + '伏夏回签已理');
            log.push(['〔伏夏回签〕这一旬先把旧工回签、田头草绳、递话门包和凉汤药脚分开了；卖工路当户到了伏夏中旬，不再只剩“田和工都要人”，连回签未稳时先冒头的门包与草绳也开始同旬见光。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏回签');
            log.push(['〔伏夏回签〕旧工回签、田头草绳、递话门包和凉汤药脚一起要钱：铜钱-40。不是大账，却正把卖工路当户伏夏中旬那层“工钱未稳、草绳门包先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏回签硬顶');
            log.push(['〔伏夏回签〕这一旬连回签脚费和田头草绳都腾挪不开，只得先硬顶过去；旧工头与家里替这一房接气的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 3) {
          if (picked.h_wage_summer_tail || picked.h_rest || picked.h_side || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '夏尾欠工已理');
            log.push(['〔夏尾欠工〕这一旬先把夏尾欠工回话、秋前草料、补鞋药钱和递话脚费分开了；伏夏收尾终于不再把秋前第一口后手一起拖着走。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '夏尾欠工');
            log.push(['〔夏尾欠工〕夏尾回话、秋前草料、补鞋药钱和递话脚费一起要钱：铜钱-45。不是大账，却正把伏夏下旬最容易被一句“等秋里再说”拖过去的那层欠工小耗压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '夏尾硬顶');
            log.push(['〔夏尾欠工〕这一旬连夏尾回话与秋前草料都腾挪不开，只得先硬顶过去；旧工头与家里都更难替你把秋前脚路接顺（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_hold_field || picked.h_lease_home || picked.h_hire || picked.h_clan || picked.h_wage_autumn_note || S.委托营生 === '分得薄田自耕' || (S.委托租谷 || 0) > 0) {
            pushHouseholdSeasonTag(stepLabel + '秋看田脚路已坐');
            log.push(['〔秋看田脚路〕秋里要不要回乡看田、催租、看短工和压住邻里口风，这一旬已被你先拆开；薄田没有再被写成“账面上有、脚下却顾不到”。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋看田脚路');
            log.push(['〔秋看田脚路〕回乡看田、催租脚费和请人照看田面的碎支一起要钱：铜钱-50。不是大账，却正是“分得了田”以后每年都得先垫的一层脚路。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋看田硬顶');
            log.push(['〔秋看田脚路〕这一旬连回乡看田脚费都腾挪不开，只得自己来回硬跑硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_wage_autumn_packet || picked.h_wage_collect || picked.h_proxy_wage || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '秋头工签已理');
            log.push(['〔秋头工签〕这一旬先把秋头回签、草鞋脚费、回乡门包和看田回话分开了；卖工路当户到秋头不再只是“先问旺工和田路”，连将回未回的旧工细账也开始和锅火争同一口现钱。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋头工签');
            log.push(['〔秋头工签〕秋头回签、草鞋脚费、回乡门包和看田回话一起要钱：铜钱-45。不是大账，却正把“秋里还没见到旺工现钱，旧工细账却先来追钱”的那层摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋头硬顶');
            log.push(['〔秋头工签〕这一旬连秋头回签和草鞋脚费都腾挪不开，只得先硬顶过去；旧工头与家里都更难替这一房把秋前口风接顺（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_wage_collect || picked.h_proxy_wage || picked.h_pay || picked.h_clan || picked.h_side || picked.h_wage_autumn_receipt) {
            pushHouseholdSeasonTag(stepLabel + '秋中回签已理');
            log.push(['〔秋中回签〕这一旬先把旧工回签、租路饭钱、递话脚费和锅火后手分开了；卖工路当户的秋中终于不再只剩“有钱回手”，连回乡和家用先来追钱的那层小耗也压回了同旬。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋中回签');
            log.push(['〔秋中回签〕旧工回签、租路饭钱、递话脚费和锅火后手一起要钱：铜钱-50。不是大账，却正把卖工路当户秋中那层“旺工钱未落手、回乡饭钱先来追”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋中硬顶');
            log.push(['〔秋中回签〕这一旬连租路饭钱和递话脚费都腾挪不开，只得先硬顶过去；旧工头和家里两头替这一房接气的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_wage_collect || picked.h_proxy_wage || picked.h_pay || picked.h_clan || picked.h_side || picked.h_wage_autumn_split) {
            pushHouseholdSeasonTag(stepLabel + '秋工锅火已分');
            log.push(['〔秋工锅火〕这一旬先把旺工茶水、回乡脚费、锅火小耗和差票后手分开了；秋里看着终于有钱回手，这一房最容易漏掉的那层家内与制度细账没有再一齐反咬。', 'good']);
          } else if (spendCopper(60)) {
            pushHouseholdSeasonTag(stepLabel + '秋工锅火');
            log.push(['〔秋工锅火〕旺工茶水、回乡脚费、锅火小耗和差票后手一起要钱：铜钱-60。不是另开主线，只是把“秋里有回钱”背后那层真正磨人的锅火与制度细账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋工锅火硬顶');
            log.push(['〔秋工锅火〕这一旬连回乡脚费和锅火小耗都腾挪不开，只得先硬顶过去；秋后这一房在人情与差票上都更吃紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          if (picked.h_wage_autumn_tail || picked.h_wage_collect || picked.h_proxy_wage || picked.h_pay) {
            pushHouseholdSeasonTag(stepLabel + '秋尾差脚已留');
            log.push(['〔秋尾差脚〕这一旬先把秋尾回话、催差脚费和回乡递话门包分开了；卖工路秋尾不再只是“旺工结没结”，而会把差役后手一起摊回同一年里。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾差脚');
            log.push(['〔秋尾差脚〕秋尾回话、催差脚费和递话门包一起要钱：铜钱-50。不是大账，却正把“秋钱看着回来了、制度脚费也同时来了”的那层摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾硬顶');
            log.push(['〔秋尾差脚〕这一旬连回话脚费和催差门包都腾挪不开，只得先硬顶过去；秋后这房在人情与差票上都更吃紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          var oldWorkContact = S.婚配路径 === '先应差·外出佣工' || (S.城里门路 || 0) > 0;
          if (picked.h_proxy_wage || picked.h_pay || picked.h_clan || picked.h_wage_collect || picked.h_wage_winter_gift) {
            pushHouseholdSeasonTag(stepLabel + '工棚节礼已分');
            log.push([oldWorkContact
              ? '〔工棚节礼〕年关前旧工头、外头工棚和替你跑代应的人该有的薄礼与脚费，这一旬已被你先分开；早年外出工的门路没有到这时才忽然断掉。'
              : '〔工棚节礼〕年关前旧工头、工棚和替你说话的脚夫该有的薄礼与脚费，这一旬已被你先分开；卖工路的人情后手没有再拖到差役临头才想起。', 'good']);
          } else if (spendCopper(oldWorkContact ? 60 : 50)) {
            pushHouseholdSeasonTag(stepLabel + '工棚节礼');
            log.push([oldWorkContact
              ? '〔工棚节礼〕旧工头、工棚和替你跑门路的人到年关总要一层薄礼与脚费：铜钱-60。不是讲排场，而是在把早年外出佣工攒下的门路继续吊住。'
              : '〔工棚节礼〕旧工头、工棚和脚夫到年关总要一层薄礼与脚费：铜钱-50。不是讲排场，而是不让这一房来年再去求人时只剩冷面。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '节礼硬顶');
            log.push(['〔工棚节礼〕这一旬连薄礼和脚费都腾挪不开，只得先硬顶过去；旧工头与外头门路的人情面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_wage_collect || picked.h_side || picked.h_rest || picked.h_proxy_wage || picked.h_literate || picked.h_wage_winter_route) {
            pushHouseholdSeasonTag(stepLabel + '欠工活路已问');
            log.push(['〔欠工活路〕这一旬先把欠工回话、灯油炭钱、明春头程脚费和给旧工头递话的小门包分开了；卖工路当户到冬尾也不再只剩一句“等来春再找活”。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '欠工活路');
            log.push(['〔欠工活路〕欠工回话、灯油炭钱、明春头程脚费和递话门包一起要钱：铜钱-45。不是大账，却正把年下“今年欠工还没结、明春活路又要先问”的两层后手重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '欠工硬顶');
            log.push(['〔欠工活路〕这一旬连灯油炭钱和明春脚费都腾挪不开，只得继续靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_wage_winter_register || picked.h_wage_winter_clear || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '冬中抄簿已理');
            log.push(['〔冬中抄簿〕这一旬先把欠工抄簿、孩子炭笔、递话脚费和守岁锅火分开了；卖工路当户的年关中段不再只剩回话与工路，连家里来春读写和账册细碎也开始同旬见光。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '冬中抄簿');
            log.push(['〔冬中抄簿〕欠工抄簿、孩子炭笔、递话脚费和守岁锅火一起要钱：铜钱-45。不是大账，却正把卖工路当户冬中那层“回话未稳、家里读写与锅火先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬中抄簿硬顶');
            log.push(['〔冬中抄簿〕这一旬连炭笔和递话脚费都腾挪不开，只得先硬顶过去；孩子来春读写和旧工头回话这两头口风都更薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_wage_winter_clear || picked.h_wage_winter_route || picked.h_wage_collect || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '冬中回话已理');
            log.push(['〔冬中回话〕这一旬先把欠工回话、灯油炭钱、递话门包和回乡脚费理开了；卖工路当户的冬中不再只是“问明春工路”，还会先被这些回话碎账咬住。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '冬中回话');
            log.push(['〔冬中回话〕欠工回话脚费、灯油炭钱、递话门包和回乡脚费一起要钱：铜钱-40。不是大账，却正把卖工路当户冬中那层“钱快回了、门包先到”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬中硬顶');
            log.push(['〔冬中回话〕这一旬连回话脚费和递话门包都腾挪不开，只得先硬顶过去；旧工头与乡里两头替这一房接气的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_wage_winter_tail || picked.h_wage_collect || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '冬尾草鞋已理');
            log.push(['〔冬尾草鞋〕这一旬先把年下回签、来春草鞋、递话门包和锅火后手分开了；卖工路冬尾终于不再只是“等明春工路”，而会把最细的年下碎账也压回这一旬。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '冬尾草鞋');
            log.push(['〔冬尾草鞋〕年下回签、来春草鞋、递话门包和锅火零用一起要钱：铜钱-45。不是大账，却正把卖工路年下最细、也最会偷吃现钱的那层碎费重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬尾硬顶');
            log.push(['〔冬尾草鞋〕这一旬连来春草鞋和回签门包都腾挪不开，只得先硬顶过去；旧工头与家里都更难指望你来年一开春就接得上活（家族-1）。', 'bad']);
          }
        }
        clampAttr('体魄');
        clampAttr('家族');
        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、工账与差钱亲手核清，最容易吃的就是“明明熬出一点家底，却在糊涂账上漏掉”。', 'bad']);
        if ((S.本年户催账 || 0) <= 0) log.push(['这一任当户你一整年都没回头结过旧工钱；卖工路最容易吃的，正是“明明干过活，钱却一直挂在外头”。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || S.委托营生 === '分得薄田自耕' || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把分得薄田写成了真账：不是自耕，就是租谷；这一房从此不再只是嘴上“名下还有 4 亩”。', 'good']);
        else log.push(['这一任当户你始终没把分得薄田坐成自耕或租账；田还在名下，却还没开始真替这一房回口粮。', 'bad']);
        if ((S.本年户通融 || 0) > 0 && (S.本年户备役 || 0) > 0) log.push(['这一任当户你把乡里与旧工头的人情都先压进了差役后手里；制度压力不再只在冬里那一下才突然落下来。', 'good']);
        if (S.婚配路径 === '先应差·外出佣工' && proxySet) log.push(['这一任当户你把早年“先应差·外出佣工”攒下的旧牙口真正拿出来用了；婚配分叉不再只剩一行旧文案。', 'good']);
        if (S.婚配路径 === '先应差·外出佣工' && (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('工棚节礼') >= 0; })) log.push(['这一任当户你连年关工棚礼数都接上了早年外出佣工攒下的旧门路；这条婚配分叉已不只在春秋节点生效，而会一直拖到同一年最难的冬账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('析灶脚费') >= 0; })) log.push(['这一任当户你先把析灶锅火、分书脚费和回话门包压进了春分书上旬；卖工路中年开春终于不再只是“已立户”，而是从第一旬起就在处理这一房真正要花出去的零碎立户钱。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书地角') >= 0; })) log.push(['这一任当户你把分书抄样、地角丈绳和田头界纸压进了春分书中旬；“分到 4 亩”终于不再只是一个静态结果，而是同一年里要自己去坐实的制度细账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏药脚') >= 0; })) log.push(['这一任当户你先把工棚落脚、凉汤药脚和回话脚路压进了伏夏上旬；卖工路成年阶段的年内节奏又更像一开夏就被小账咬住，而不是等到年尾才一起结。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏田工') >= 0; })) log.push(['这一任当户你又把凉汤、田埂草鞋、看水饭食和工棚脚路拆进了伏夏中旬；卖工路当户终于更像一年里田、工、家用和身子一直互相咬住。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏回签') >= 0; })) log.push(['这一任当户你还把伏夏中旬那层“旧工回签未稳、田头草绳与门包却先来抢钱”的细账压回了同旬；卖工路中年终于连盛夏中腰也开始像农路那样，被回签、田面和锅火一起咬住。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春尾欠工拆开') >= 0 || String(tag).indexOf('夏尾欠工拆开') >= 0; })) log.push(['这一任当户你连春尾、夏尾那两口最容易被一句“等下回再算”糊过去的欠工碎账都先拆开了；雇工路年内密度不再只靠季中动作撑着。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋工锅火') >= 0; })) log.push(['这一任当户你还把旺工茶水、回乡脚费、锅火与差票后手压进了秋定租中旬；秋里有回钱也不再会被误写成“自然稳了”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋中回签') >= 0; })) log.push(['这一任当户你又把旧工回签、租路饭钱、递话脚费和锅火后手压进了秋定租中旬；卖工路秋中终于不再只剩“回钱分流”，而会把将回未回的旧工细账也一并压回同旬。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋工回钱拆开') >= 0; })) log.push(['这一任当户你又把秋工回钱拆成了锅火与差票；卖工路秋中不再只是“有钱回手”，而是回手当天就得重新分流。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾差脚') >= 0; })) log.push(['这一任当户你又把秋尾回话、催差脚费和递话门包压回了秋定租下旬；卖工路的制度细账不再只在冬里才忽然现形。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('工棚炭礼') >= 0; })) log.push(['这一任当户你把旧工头薄礼、炭钱和回话脚费拆进了冬应役上旬；年关的人情与锅火终于也被压回同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('明春工路') >= 0; })) log.push(['这一任当户你连明春工棚、头程脚费和递话门包都在冬应役中旬先问明了；卖工路冬尾也不再只是“等明春再说”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('欠工活路') >= 0; })) log.push(['这一任当户你连年下欠工回话、灯油炭钱和明春头程脚费都先分开了；卖工路的冬尾终于也像同一年里不断冒头的小事，而不只是一句“等明春再说”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬中抄簿') >= 0; })) log.push(['这一任当户你又把冬中抄簿、孩子炭笔、递话脚费和守岁锅火压进了冬应役中旬；卖工路成年人年关中段终于不再只有制度后手，也开始把家内读写与账册细账一起压回同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾草鞋') >= 0; })) log.push(['这一任当户你把年下回签、来春草鞋和门包碎费也压进了冬尾，并把这口年下回签真抄进账里；雇工路连年末最细、最不起眼的那层年下小耗，也开始像同一年里不断冒头的真账。', 'good']);
        if ((S.本年户季务 || []).length <= 4) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);
        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.10, (S.本年户催账 || 0) * 0.05);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if (S.委托营生 === '分得薄田自耕') risk -= 0.09;
        else if ((S.委托租谷 || 0) > 0) risk -= 0.07;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if (proxySet || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('工头代应') >= 0; })) risk -= 0.05;
        if ((S.城里门路 || 0) > 0) risk -= 0.03;
        if (S.合爨状态 === '已析爨') risk -= 0.03;
        if (S.负债银 > 0) risk += 0.04;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        risk = Math.max(0.03, Math.min(0.85, risk));
        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if (S.委托营生 === '分得薄田自耕') {
            S.存米 += 1;
            log.push(['〔守田承接〕这一年把薄田真写成了自耕账，年尾又替这一房多守下一口口粮：存米+1。', 'good']);
          }
          if ((S.委托租谷 || 0) > 0) S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        } else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        } else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
        curStage.next = 'elder';
        curStage.nextLabel = '步入老年 →';
      }
    };
  }

  // ── 留乡佃田 · 当户：同样拆成“四季三旬” ──
  // 目的：把“分家/薄田/租谷/差票/里甲人情/当役后手”压回同一年里逐旬拆账，
  // 避免留乡路线到了中年又退回“一次 4 点就结掉”的薄口径。
  // 约束：尽量不额外耗 RNG；本阶段默认不掷外部冲击（shock=false），把重点放在同年细账与制度节点本身。
  function stageFarmHousehold() {
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);

    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var canSplitJoint = S.合爨状态 === '随兄合户';
    var payName = seasonIdx <= 3 ? '先留纳银代役现钱' : '纳银代役';
    var literateName = seasonIdx === 1
      ? '识字·先抄分书与田账'
      : (seasonIdx === 2 ? '识字·抄清水口与差票' : (seasonIdx === 3 ? '识字·核秋租与差钱' : '识字·对年关差钱'));
    var clanName = seasonIdx === 1
      ? '先跟兄房与里甲通气'
      : (seasonIdx === 2 ? '伏夏先托邻里换工' : (seasonIdx === 3 ? '先把秋后人情面压住' : '年关先托乡里说话'));

    var eventTxt;
    if (season.id === 'spring' && xun === 1) {
      eventTxt = '春分书的上旬最怕把“分得了薄田”当成“日后自然稳了”。分书、阄口、旧账与谁肯替这一房说话，得先拆开坐实。';
    } else if (season.id === 'spring' && xun === 2) {
      eventTxt = '春分书的中旬最像第一次真把“薄田根脚”掂在手里：你要不要先把田面、自耕与租路分开写进账里，决定这一房往后是不是还只靠一句“有 4 亩”。';
    } else if (season.id === 'spring' && xun === 3) {
      eventTxt = '春分书的下旬更像清旧账：分灶杂用、换工情面与这一年差钱后手，要不要先留，都在这一旬里见真章。';
    } else if (season.id === 'summer' && xun === 1) {
      eventTxt = '夏催账的上旬最怕暑气先把人熬垮：田头水口、草鞋凉药与里甲口风，会一齐来抢同一口现钱与同一双手。';
    } else if (season.id === 'summer' && xun === 2) {
      eventTxt = '夏催账的中旬最像把“守田”和“跑里甲”一起拆开：若只顾田里，差票与口风会落到你头上；若只顾人情，田面与口粮就会发虚。';
    } else if (season.id === 'summer' && xun === 3) {
      eventTxt = '夏催账的下旬更像给年关留后手：哪口差钱、哪层人情、哪口田面要先稳住，不能再拖到秋后才想。';
    } else if (season.id === 'autumn' && xun === 1) {
      eventTxt = '秋定租的上旬最像“看田脚、催租话、压差票”：秋后租谷与差钱常一齐逼近，先把脚路坐实，才不至忙到年关才发现账都浮着。';
    } else if (season.id === 'autumn' && xun === 2) {
      eventTxt = '秋定租的中旬看着像“仓里总该宽一口”，其实锅火、差钱、租谷差票与旧债一起更急；若不先拆账，秋后的粮很快就会漏光。';
    } else if (season.id === 'autumn' && xun === 3) {
      eventTxt = '秋定租的下旬更像把这一房真正坐稳：租谷要真入仓、差票要真压住、人情要真用在该用处，不能只停在口头。';
    } else if (season.id === 'winter' && xun === 1) {
      eventTxt = '冬应役的上旬不是只看你敢不敢扛，而是看这一年有没有先把租谷、差票、里甲人情与代役现银一层层垫起来。';
    } else if (season.id === 'winter' && xun === 2) {
      eventTxt = '冬应役的中旬最像翻总账：哪口租谷真回来了、哪层乡里肯替你说话、哪口差钱先留住了，都在这一旬里见真章。';
    } else {
      eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把田面、租谷、差票、人情与差钱分开，都会在这一旬里一起现形。';
    }

    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      shock: false,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '留乡佃田的当户阶段现也改成“四季三旬”。分家后的薄田、自耕与租谷、差票与里甲人情、代役现银与年关后手，不再一口气糊成“一次 4 点”，而要在同一年里逐旬拆开。' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是“再做一件大事”，而是把田面、租路与差钱里最要紧的那两手先坐实。',
      dossier: function () {
        return lifeDossier('农路当户拆为四季三旬｜户程=' + stepLabel + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '阄书写定只是开始。留乡务农的人到这一步，最怕把“有田”写成一句空话：田面要守，租谷要收，差票要压，年关差钱要先留。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[田账]', txt: eventTxt },
        hp.event
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把留乡当户这一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        // route pack（薄田自耕/出佃/析爨等）：沿用 householdRoutePack 的统一守恒口径。
        hp.extraActions.forEach(function (x) { A.push(x); });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，年关轮值时就不至只剩硬扛。', can: true, once: true });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、田面、水口、租谷与差钱抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把兄房、邻里与里甲口风压住，到冬里就不至一口气全吃人情亏。', can: (S.本年户通融 || 0) < 2, once: true });
        if (season.id === 'spring' && xun === 2) {
          A.push({
            id: 'h_spring_mid_incense',
            name: '先把春中水口脚费与清明香纸分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕水口脚费、清明香纸、递话门包和灶下锅火一起挤这口现钱。先把这层春中碎账拆开，分书后的田面与家内后手才不至继续糊成一团。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
        }
        A.push({ id: 'h_hire', name: seasonIdx <= 2 ? '雇工顾住田面' : '雇短工把秋后田面收住', cost: 1, eff: '铜钱-300·田面不至空转', desc: '当户这一年照样要应役与跑腿，先花钱把田面顾住，少让这一房的根脚漏掉。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口零活补差钱', cost: 1, eff: side.effect, desc: '当户这一年也要现钱。哪怕只是多接一层零活，也是在给锅火与差钱添后手。', can: true });
        if (season.id === 'winter' && xun === 2) {
          A.push({
            id: 'h_winter_mid_seed',
            name: '先把冬中佃账回签与灯炭谷种分开',
            cost: 1,
            eff: '铜钱-60·核账+1·备役+1·家族+1',
            desc: '冬应役翻总账时，最怕佃账回签、灯炭谷种、递话门包和来春脚费一起冒头。先把这层冬中佃签拆开，年关里“账快回了”这口现钱才不至还没落手就被锅火和明春后手啃薄。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年当户，别把身子先熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });

        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把纳银代役的现钱坐实：白银-2。等到冬里真轮到这一房，就不至把整年后手一起赔进去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留纳银代役现钱，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_literate':
              S.本年户核账 += 1;
              pushHouseholdSeasonTag(season.name + '核账');
              log.push(['你在' + stepLabel + '先把分书、田账、水口与差钱抄清。识字不是加分，而是少让这一房在糊涂账里白漏一层。', 'good']);
              actionCount += 1;
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('乡里通气');
              log.push(['你在' + stepLabel + '先把兄房、邻里与里甲的人情面压实：家族+2。到冬里真轮值时，至少不是独自去吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_mid_incense':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中水口香纸');
                log.push(['你在' + stepLabel + '先把水口脚费、清明香纸和递话门包分开：铜钱-55、核账+1、通融+1、家族+1。农路当户的春中，这层家内与田面并行的小耗终于不再只剩一句“先顾着过”。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春中水口脚费与清明香纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得这一房“田还在名下，却白荒一季”。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '雇工顾住田面，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(season.name + '贴补');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_winter_mid_seed':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中佃账回签');
                log.push(['你在' + stepLabel + '先把佃账回签、灯炭谷种和递话门包分开：铜钱-60、核账+1、备役+1、家族+1。农路当户到了冬中，也终于不是只在等结果，而是在先给来春与年关分账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中佃账回签与灯炭谷种分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先将养身子：体魄+5。', 'good']);
              actionCount += 1;
              break;
            case 'h_hold_field':
              // 由 householdRoutePack 注入，但结算逻辑与通用当户一致
              S.委托营生 = '分得薄田自耕';
              S.委托租谷 = 0;
              S.委托待收租谷 = 0;
              var fieldGain = 1 + ((S.家传农事 || 0) > 0 ? 1 : 0);
              var fieldPractice = ((S.家传农事 || 0) > 0 ? 1 : 0);
              S.存米 += fieldGain;
              if (fieldPractice > 0) S.农事历练 += fieldPractice;
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('薄田自耕');
              log.push(['你在' + stepLabel + '把分得薄田先坐成自耕账：存米+' + fieldGain + (fieldPractice > 0 ? ('、农事历练+' + fieldPractice) : '') + '。留乡务农的人到这一步，最怕把“有田”写成一句空话。', 'good']);
              actionCount += 1;
              break;
            case 'h_lease_home':
              S.委托营生 = '出佃收租';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('薄田租账');
              log.push(['你在' + stepLabel + '先把薄田立成租账：年租谷+1。口粮虽少了亲手把握，却替这一房留下一条稳租路。', 'good']);
              actionCount += 1;
              break;
            case 'h_split_joint':
              S.合爨状态 = '已析爨';
              S.铜钱 += 180;
              S.家族 -= 1;
              S.本年户核账 += 1;
              pushHouseholdSeasonTag('析爨清共账');
              log.push(['你在' + stepLabel + '把先前合爨的共账清回这一房：铜钱+180、家族-1。往后再遇差役与口粮，不必再从“共着过日子”糊账起手。', 'good']);
              actionCount += 1;
              break;
          }
        });

        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);

        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          summer: {
            handledIds: ['h_hire', 'h_hold_field', 'h_literate', 'h_side', 'h_rest'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬你至少把田面、水口或凉药草鞋里的一层顾住；伏夏损耗没有消失，但没再把身子与锅火一并熬穿。',
            cost: 55,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕凉药、草鞋、田边水口与小脚费一齐冒头：铜钱-{cost}。不是大祸，只是当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连凉药草鞋钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_hold_field', 'h_lease_home', 'h_clan', 'h_literate', 'h_hire'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋里租谷、差票、锅火与人情脚路已被你先拆开；“仓里有粮”没有再被误写成“秋后自然稳了”。',
            cost: 65,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕催租差票、人情脚路与锅火碎用一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房的人情面更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_pay', 'h_clan', 'h_literate', 'h_side', 'h_rest', 'h_winter_mid_seed'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕差钱、灯油、草鞋与来春第一口谷种定钱已被你先分开；年关没再把同一口现钱搅成一团。',
            cost: 45,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、草鞋、来春谷种定钱与小脚费一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          }
        });

        // 春分书第一旬：分灶锅火与“另起一房”的小耗
        if (season.id === 'spring' && xun === 1) {
          if (picked.h_split_joint || picked.h_literate || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '析灶锅火已安');
            log.push(['〔析灶锅火〕分书后该添的锅釜、量斗与分灶杂用这一旬已被你先安顿；立户不是一句“分到了”，而是真把这一房的日子拆出来。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '析灶锅火');
            log.push(['〔析灶锅火〕分书后添锅釜、量斗与分灶杂用一起冒头：铜钱-45。不是新主线，只是立户第一旬就得先把“各过各的日子”坐成真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '析灶硬顶');
            log.push(['〔析灶锅火〕这一旬连分灶杂用都腾挪不开，只得继续借着兄房锅火硬顶；这一房刚立起来的人情面先薄了一层（家族-1）。', 'bad']);
          }
        }

        // 春分书中旬：水口脚费、清明香纸与递话门包
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_spring_mid_incense || picked.h_hold_field || picked.h_lease_home || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '春中香纸已分');
            log.push(['〔春中香纸〕水口脚费、清明香纸与递话门包这一旬已被你先拆开；农路当户的春中不再只是“把田坐稳”，还得把家里和田头一起顾住。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '春中香纸');
            log.push(['〔春中香纸〕水口脚费、清明香纸、递话门包和灶下锅火一起冒头：铜钱-50。不是大账，却正是立户后第二旬就得先认的一层家内与田面小耗。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中硬顶');
            log.push(['〔春中香纸〕这一旬连清明香纸与水口脚费都腾挪不开，只得先硬顶过去；乡里看你这一房手头更紧了一层（家族-1）。', 'bad']);
          }
        }

        // 秋定租上旬：租谷差票与脚路碎费
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_hold_field || picked.h_lease_home || picked.h_hire || picked.h_clan || (S.委托营生 === '分得薄田自耕') || (S.委托租谷 || 0) > 0) {
            pushHouseholdSeasonTag(stepLabel + '租谷差票已坐');
            log.push(['〔租谷差票〕秋里租谷与差票的脚路与口风这一旬已被你先拆开；薄田没有再被写成“账面上有、脚下却顾不到”。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '租谷差票');
            log.push(['〔租谷差票〕催租差票、跑脚路与秋里锅火碎支一起要钱：铜钱-50。不是大账，却正是“秋后得先垫的一层脚路”。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋租硬顶');
            log.push(['〔租谷差票〕这一旬连跑脚路都腾挪不开，只得自己来回硬跑硬顶过去（体魄-1）。', 'bad']);
          }
        }

        // 冬应役中旬：佃账回签、灯炭谷种与来春脚费
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_winter_mid_seed || picked.h_pay || picked.h_literate || picked.h_clan || picked.h_hold_field) {
            pushHouseholdSeasonTag(stepLabel + '冬中佃签已理');
            log.push(['〔冬中佃签〕佃账回签、灯炭谷种和来春脚费这一旬已被你先拆开；农路当户到了冬中，也开始像别路一样把“年关还没落袋的回签”压回同一年里处理。', 'good']);
          } else if (spendCopper(55)) {
            pushHouseholdSeasonTag(stepLabel + '冬中佃签');
            log.push(['〔冬中佃签〕佃账回签、灯炭谷种、递话门包和来春脚费一起要钱：铜钱-55。不是新主线，只是年关里又一层真会抢同一口现钱的小账。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬中硬顶');
            log.push(['〔冬中佃签〕这一旬连灯炭谷种和回签脚费都腾挪不开，只得拿身子去硬顶这口年关后手（体魄-1）。', 'bad']);
          }
        }

        clampAttr('体魄');
        clampAttr('家族');

        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }

        // 年终：评估这一任当户的制度风险（一次 roll，不额外耗 RNG）
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、田账与差票亲手核清，最容易吃的就是“明明守着薄田，却在糊涂账上漏掉”。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || S.委托营生 === '分得薄田自耕' || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把薄田写成了真账：不是自耕，就是租谷；这一房从此不再只剩“名下还有 4 亩”的一句空话。', 'good']);
        else log.push(['这一任当户你始终没把薄田坐成自耕或租账；田还在名下，却还没开始真替这一房回口粮。', 'bad']);
        if ((S.本年户季务 || []).length <= 6) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);

        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if ((S.本年户委托 || 0) > 0 || S.委托营生 === '分得薄田自耕' || (S.委托租谷 || 0) > 0) risk -= 0.09;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        if (S.负债银 > 0) risk += 0.04;
        if ((S.家传农事 || 0) > 0) risk -= 0.02;
        if ((S.农事历练 || 0) >= 4) risk -= 0.02;
        risk = Math.max(0.03, Math.min(0.85, risk));
        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if (S.委托营生 === '分得薄田自耕') {
            S.存米 += 1;
            log.push(['〔守田承接〕这一年把薄田真写成了自耕账，年尾又替这一房多守下一口口粮：存米+1。', 'good']);
          }
          if ((S.委托租谷 || 0) > 0) S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        } else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        } else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
        curStage.next = 'elder';
        curStage.nextLabel = '步入老年 →';
      }
    };
  }

  function stageApprenticeHousehold() {
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);
    var settledCity = (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商');
    var canCollect = settledCity || (S.学徒历练 || 0) >= 1;
    var canLeaseField = settledCity && S.田亩 > 0 && (S.委托租谷 || 0) <= 0;
    var canProxy = settledCity;
    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var collectName = seasonIdx === 1
      ? '先回铺里结一回旧脚钱'
      : (seasonIdx === 2 ? '伏夏回铺结脚钱' : (seasonIdx === 3 ? '把秋里铺账先结回这一房' : '赶在年关前结一回铺账'));
    var bookName = seasonIdx === 1
      ? '先托旧同门抄清分书与铺账'
      : (seasonIdx === 2 ? '伏夏先问铺里脚路与欠账' : (seasonIdx === 3 ? '先把铺里回钱与租路分开' : '年关对铺账留明春脚路'));
    var proxyName = seasonIdx === 1
      ? '凭师门旧识先探代役门路'
      : (seasonIdx === 2 ? '伏夏托旧掌柜先压差役' : (seasonIdx === 3 ? '凭旧掌柜先留秋后代应' : '凭师门门路请人代办'));
    var leaseName = seasonIdx <= 2 ? '把分得薄田出佃收租' : '把薄田租账坐实';
    var literateName = seasonIdx === 1
      ? '识字·先抄分书与铺账'
      : (seasonIdx === 2 ? '识字·抄清租谷与脚路' : (seasonIdx === 3 ? '识字·核秋钱与差钱' : '识字·对年关旧账'));
    var clanName = seasonIdx === 1
      ? '先跟兄房与乡里通气'
      : (seasonIdx === 2 ? '伏夏先托同门替这一房说话' : (seasonIdx === 3 ? '先把秋后人情面压住' : '年关先托乡里说话'));
    var hireName = seasonIdx <= 2 ? '雇工顾住分得薄田' : '雇短工把秋后田面收住';
    var payName = seasonIdx <= 3 ? '先留纳银代役现钱' : '纳银代役';
    var eventTxt;
    if (season.id === 'spring' && xun === 1) {
      eventTxt = '春分书的上旬最怕把“当年在铺里站稳过”误听成“如今这一房自然有人照应”。分书、铺账、同门面子与谁肯替你说一句话，都要先拆开坐实。';
    } else if (season.id === 'spring' && xun === 2) {
      eventTxt = '春分书的中旬最像第一次真把“旧铺回话”和“乡里代管纸票”摆在同一本账上：你若只顾分书与代管，旧掌柜回签、灯油盐药与清明香纸会先来抢这一口现钱；你若只顾旧铺口风，分得的 4 亩薄田又会继续只停在纸上。';
    } else if (season.id === 'spring' && xun === 3) {
      eventTxt = '春分书的下旬更像清旧脚钱：你年轻时在铺里垫下的脚钱、搬运钱与旧识，都得先回头结一层，不然“在城里有去处”就还是一句空话。';
    } else if (season.id === 'summer' && xun === 1) {
      eventTxt = '夏催账的上旬最怕暑气先把人熬垮，铺里脚路、家里药钱和分得薄田的租路却还没理清。';
    } else if (season.id === 'summer' && xun === 2) {
      eventTxt = '夏催账的中旬最像把“在铺里的人情”和“在乡里的锅火”一起拆开：若只顾城里旧识，家里会空等；若只顾眼前锅火，来年脚路又会断。';
    } else if (season.id === 'summer' && xun === 3) {
      eventTxt = '夏催账的下旬更像给年关留后手：哪笔脚钱先回、哪口人情先用、哪段租路先立，都不能再拖。';
    } else if (season.id === 'autumn' && xun === 1) {
      eventTxt = '秋定租的上旬，一头是铺里旺季脚钱，一头是乡里薄田终于该回租谷。你先把哪边坐成真账，就决定这一房是先多一口口粮，还是先多一口现钱。';
    } else if (season.id === 'autumn' && xun === 2) {
      eventTxt = '秋定租的中旬看着最像“总该宽一口了”，其实秋中铺账脚费、锅火、差钱、租谷与旧脚钱一起更急；若不先拆账，忙季的钱会立刻漏光。';
    } else if (season.id === 'autumn' && xun === 3) {
      eventTxt = '秋定租的下旬最像把这一房真正坐稳：铺里旧账、秋尾锅火、回铺脚费与乡里薄田，哪一项都不能只停在纸上。';
    } else if (season.id === 'winter' && xun === 1) {
      eventTxt = '冬应役的上旬不是只看你敢不敢扛，而是看这一年有没有先把铺账、租路、代应门路与差钱后手垫起来。';
    } else if (season.id === 'winter' && xun === 2) {
      eventTxt = '冬应役的中旬最像翻总账：哪笔铺里旧钱赶回来了、哪层师门门路还认你、哪口租谷能真落回这一房，都在这一旬见真章。';
    } else {
      eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把铺账、人情、薄田与差钱分开，都会在这一旬里一起现形。';
    }
    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '学徒路的当户阶段现也改成“四季三旬”。铺里旧脚钱、师门门路、分得薄田与差钱后手，不再一口气糊成“一次 4 点”，而要在同一年里逐旬拆开。' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是“再做一件大事”，而是把铺里旧账、乡里薄田与代应门路里最要紧的那两手先坐实。',
      dossier: function () {
        return lifeDossier('学徒路当户拆为四季三旬｜户程=' + stepLabel + '｜学徒去向=' + S.学徒去向 + '｜学徒历练=' + (S.学徒历练 || 0) + '｜授艺度=' + (S.学徒授艺度 || 0) + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '你年轻时若真在铺里站稳过，这一任当户看的就不是“学过几年徒”本身，而是那层旧掌柜、同门与熟客的人情，如今还能不能替这一房说上一句话。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[铺账]', txt: eventTxt },
        hp.event,
        householdFlavorEvent('apprentice', season.id, xun),
        householdSeasonPulseEvent(season.id, xun)
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把学徒路的当户一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        var bookCost = season.id === 'winter' ? 50 : 40;
        if (canCollect) A.push({ id: 'h_shop_collect', name: collectName, cost: 1, eff: '铜钱+110~170·催回铺里旧脚钱', desc: '不把铺里压着的脚钱拢回一点，这一房的差钱、锅火和薄田租路就都只是纸上账。', can: true, once: true });
        if (canLeaseField) A.push({ id: 'h_lease_city', name: leaseName, cost: 1, eff: '立委托经营账·年租谷+1·风险降', desc: '你人在城里，就把分得的薄田立约出佃：租谷归你，田面不再只是“名下有 4 亩”的空账。', can: true, once: true });
        if (canProxy) A.push({ id: 'h_proxy', name: proxyName, cost: 1, eff: '白银-1或铜钱-150·差役后手更实', desc: '若这几年真留店或坐店工，就把那层旧掌柜、同门和熟客的人情拿出来，请人先代应一层。', can: true, once: true });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，年关轮值时就不至只剩硬扛。', can: true, once: true });
        A.push({ id: 'h_shop_book', name: bookName, cost: 1, eff: '铜钱-' + bookCost + '·核账+1·通融+1' + (season.id === 'winter' ? '·备役+1' : ''), desc: '先把分书、铺账、脚路和谁还认这层旧识理清。钱没有变多，但后头回钱、租路和差钱才不至混成一团。', can: S.铜钱 >= bookCost, why: S.铜钱 >= bookCost ? '' : ('铜钱不足' + bookCost + '文'), once: true });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、租谷、铺账和差钱抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把兄房、乡里和谁肯替这一房说话坐实，不让“人在城里”变成回乡就无人应声。', can: (S.本年户通融 || 0) < 2, once: true });
        if (season.id === 'spring' && xun === 1) {
          A.push({
            id: 'h_shop_packet',
            name: '先把分书抄样与柜边包纸分开',
            cost: 1,
            eff: '铜钱-50·核账+1·通融+1·家族+1',
            desc: '春分书刚起头时，最先磨人的往往不是整笔旧账，而是抄样、柜边包纸和递话脚费这层小耗。先把它们拆开，这一房才不至开年就被碎账咬住。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文',
            once: true
          });
        }
        if (season.id === 'spring' && xun === 2) {
          A.push({
            id: 'h_spring_mid_shop',
            name: '先把春中回铺回话与灯油盐药分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕旧掌柜回话、灯油盐药、递话脚费和锅火小耗一起压来。先把这层“旧铺还认你、家里却先缺这一口”的春中铺话拆开，立户第二旬才不至又只剩“城里还有门路”的空话。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_spring_mid_festival',
            name: '先把春中代管回签与清明香纸分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕代管回签、清明香纸、递话脚费和灶下锅火一起找上门。先把这层家内与制度碎账拆开，分书、代管和清明前后的香火锅火才不必继续挤在同一口现钱上。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
        }
        A.push({ id: 'h_hire', name: hireName, cost: 1, eff: '铜钱-300·田面不至空转', desc: '先花钱顾住田面，别让“分得了田”变成忙完铺里回头只剩一地荒账。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口零活补差钱', cost: 1, eff: side.effect, desc: '当户这一年照样得找现钱。哪怕只是多接一层零活，也是在给锅火、租路和差钱添后手。', can: true });
        if (season.id === 'spring' && xun === 3) {
          A.push({
            id: 'h_spring_bundle',
            name: '把春脚钱拆作锅火与回铺脚路',
            cost: 1,
            eff: '铜钱-100·备役+1·通融+1·家族+1',
            desc: '春尾最怕刚结回的一口脚钱又被锅火、回铺脚路和带话脚费一起混吃。先把它拆开，立户第一季末才不至只剩“有一口钱”的空话。',
            can: S.铜钱 >= 100,
            why: S.铜钱 >= 100 ? '' : '铜钱不足100文',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 1) {
          A.push({
            id: 'h_summer_packet',
            name: '先把伏夏茶汤与回铺脚费分开',
            cost: 1,
            eff: '铜钱-70·备役+1·通融+1·家族+1',
            desc: '夏催账刚起头时，最容易先漏掉的不是整笔铺账，而是茶汤、凉药、回铺脚费和给同门捎话的那层小钱。先把它们拆开，伏夏第一旬才不至只靠身子和旧脸面硬顶。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 2) {
          A.push({
            id: 'h_summer_reply',
            name: '先把伏夏回签与柜边包纸分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '伏夏中旬最怕上一程回签、柜边包纸、递话脚费和家里凉药一起冒头。你先把这层柜边小账拆开，后面贴家、理铺账与代应后手才不至拿同一口现钱四处堵漏。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 3) {
          A.push({
            id: 'h_summer_tail',
            name: '先把夏尾回铺回签与秋前脚单分开',
            cost: 1,
            eff: '铜钱-65·催账+1·通融+1·家族+1',
            desc: '夏尾最怕旧掌柜回签、秋前脚单、递话门包和过路药包一起先来。你先把这层夏尾铺签拆开，秋钱未回前，这一房也不至让秋前脚路与眼前锅火继续抢同一口现钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
        }
        if (season.id === 'autumn' && xun === 1) {
          A.push({
            id: 'h_autumn_reply',
            name: '先把秋头回签与催佃脚费分开',
            cost: 1,
            eff: '铜钱-65·催账+1·通融+1·家族+1',
            desc: '秋头最怕铺里回签、催佃脚费、递话门包和锅火次序一起冒头。你先把这层秋头回签拆开，这一房才不至刚见旺季口风，就又被乡里租路和家里锅火一把吃空。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_autumn_head_cloth',
            name: '先把秋头回签与孩子夹衣分开',
            cost: 1,
            eff: '铜钱-60·通融+1·家族+1·体魄+1',
            desc: '秋凉刚起时，最怕旧铺回签、孩子夹衣、递话门包和锅火小耗一起先来。先把这层秋头夹衣拆开，不让“铺里回音刚起”这一口钱又先被换季穿用和家里锅火啃薄。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'autumn' && xun === 2) {
          A.push({
            id: 'h_autumn_mid_shop',
            name: '先把秋中铺账脚费与租路饭钱分开',
            cost: 1,
            eff: '铜钱-65·催账+1·通融+1·家族+1',
            desc: '秋中最怕铺里旧脚钱刚有回音，租路饭钱、递话脚费和灶下锅火又一起来抢钱。你先把这层秋中铺账拆开，不让“账快回了”这口现钱还没落手，就先被乡里脚路和家里锅火吃薄。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_autumn_bundle',
            name: '把秋脚钱拆作锅火与差钱',
            cost: 1,
            eff: '铜钱-120·备役+1·通融+1·家族+1',
            desc: '秋里脚钱看着比夏里厚些，也最容易被误当“总该宽一口”。先拆给锅火和差钱，这一房才不至转身又把忙季钱漏光。',
            can: S.铜钱 >= 120,
            why: S.铜钱 >= 120 ? '' : '铜钱不足120文',
            once: true
          });
        }
        if (season.id === 'autumn' && xun === 3) {
          A.push({
            id: 'h_autumn_tail_shop',
            name: '先把秋尾锅火与回铺脚费分开',
            cost: 1,
            eff: '铜钱-60·催账+1·通融+1·家族+1',
            desc: '秋尾最怕铺里回话、回铺脚费、过路药包和锅火后手一起挤上来。你先把这层秋尾铺脚拆开，不让“旧账就快回了”继续和眼前锅火、冬前脚路抢同一口现钱。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_autumn_tail',
            name: '先把秋尾回话、锅火与催佃脚费分开',
            cost: 1,
            eff: '铜钱-70·催账+1·通融+1·家族+1',
            desc: '秋尾最怕把铺里回话、乡里催佃脚费和家里锅火都拖到冬里。先把这口小钱拆开，这一房到年关前就不会又被“钱快回了”这句话空吊着。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 1) {
          A.push({
            id: 'h_winter_packet',
            name: '先把冬头回铺脚费与灯炭药包分开',
            cost: 1,
            eff: '铜钱-75·备役+1·衣药+1·通融+1',
            desc: '冬头最怕回铺脚费、灯炭药包、递话门包和差票后手一起先来。你先把这层冬头铺耗拆开，年关还没真正翻总账，锅火、身子与来春门路就不会先抢同一口现钱。',
            can: S.铜钱 >= 75,
            why: S.铜钱 >= 75 ? '' : '铜钱不足75文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 2) {
          A.push({
            id: 'h_winter_route',
            name: '先留来春回铺脚费与递话薄礼',
            cost: 1,
            eff: '铜钱-60·备役+1·通融+1·家族+1',
            desc: '冬里翻总账时，最怕把来春回铺脚费、递话薄礼和差钱后手一起拖到年后。先把这口小钱留下，明春门路才不至重新抢眼前锅火。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_winter_reply',
            name: '先把冬中回铺回签与灯炭门包分开',
            cost: 1,
            eff: '铜钱-65·核账+1·通融+1·家族+1',
            desc: '冬中最怕旧掌柜回签、灯炭门包、递话脚费和来春脚单一起找上门。你先把这层冬中回签拆开，年关里“铺里还认你”这句话才不会只剩空口风。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 3) {
          A.push({
            id: 'h_year_gift',
            name: '把年下炭药拆作守岁零用与回铺礼',
            cost: 1,
            eff: '铜钱-80·通融+1·家族+1',
            desc: '年下最怕守岁炭药、灶下零用和回铺薄礼一起找上门。先把它们拆开，不让过冬锅火和来春旧门路再抢同一口钱。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文',
            once: true
          });
          A.push({
            id: 'h_year_reply',
            name: '先把年下回铺回签与来春脚单分开',
            cost: 1,
            eff: '铜钱-70·催账+1·备役+1·家族+1',
            desc: '冬尾最怕年下回铺回签、来春脚单、递话脚费和锅火后手一起抢同一口现钱。你先把这层冬尾铺签拆开，来春门路和眼前锅火才不至再互相咬住。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
        }
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年这一口身子也是账本的一部分，别把年关应役前先熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var proxySet = false;
        var seasonTag = season.name;
        var bookCost = season.id === 'winter' ? 50 : 40;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_shop_collect':
              var shopGain = 110 + Math.min(45, Math.max(0, seasonIdx - 1) * 15) + (S.学徒去向 === '留店伙计' ? 20 : 0);
              S.铜钱 += shopGain;
              S.本年户催账 += 1;
              pushHouseholdSeasonTag(seasonTag + '结回铺账');
              log.push(['你在' + stepLabel + '回头把铺里旧脚钱与杂支结回一点：铜钱+' + shopGain + '。不是凭空添一笔，只把该你的那口钱真正拢回这一房。', 'good']);
              actionCount += 1;
              break;
            case 'h_lease_city':
              S.委托营生 = '出佃收租';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('城里出佃');
              log.push(['你在' + stepLabel + '把分得薄田立成出佃收租账：年租谷+1。人仍可留在城里，田面却开始真替这一房回一口粮。', 'good']);
              actionCount += 1;
              break;
            case 'h_proxy':
              if (spendSilver(1)) {
                S.本年户备役 += 1;
                proxySet = true;
                pushHouseholdSeasonTag('师门代办');
                log.push(['你在' + stepLabel + '凭师门旧识请人先代办一层：白银-1。年轻时攒下的旧掌柜与同门人情，这时终于被真拿出来替这一房挡事。', 'good']);
                actionCount += 1;
              } else if (spendCopper(150)) {
                S.本年户备役 += 1;
                proxySet = true;
                pushHouseholdSeasonTag('师门代办');
                log.push(['你在' + stepLabel + '凭师门旧识先探代应门路：铜钱-150。现钱少一口，但年关就不至只剩硬扛。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '凭师门门路请人代办，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把纳银代役的现钱坐实：白银-2。等到冬里真轮到这一房，就不至把整年后手一起赔进去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留纳银代役现钱，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_shop_book':
              if (spendCopper(bookCost)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                if (season.id === 'winter') S.本年户备役 += 1;
                pushHouseholdSeasonTag(seasonTag + '理铺账');
                log.push(['你在' + stepLabel + '先把分书、铺账和脚路理清：铜钱-' + bookCost + '、核账+1、通融+1' + (season.id === 'winter' ? '、备役后手+1' : '') + '。钱没有变多，但哪口该回、哪口该留先不再糊成一团。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先理清分书与铺账，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_literate':
              S.本年户核账 += 1;
              pushHouseholdSeasonTag(seasonTag + '核账');
              log.push(['你在' + stepLabel + '先把分书、租谷与差钱抄清。识字不是加分项，而是少让这一房白吃一层糊涂账。', 'good']);
              actionCount += 1;
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('乡里通气');
              log.push(['你在' + stepLabel + '先把兄房、乡里和谁肯替这一房说话压实：家族+2。到冬里真轮值时，至少不是独自回乡吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_shop_packet':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('分书抄样');
                log.push(['你在' + stepLabel + '先把分书抄样、柜边包纸和递话脚费分开：铜钱-50、核账+1、通融+1、家族+1。学徒路当户开年的第一层碎账，终于不再被一句“回头再算”糊过去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把分书抄样与柜边包纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得人在城里、薄田在乡却白荒一季。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '雇工顾住田面，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(seasonTag + '贴家');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_bundle':
              if (spendCopper(100)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春脚拆家用');
                log.push(['你在' + stepLabel + '先把春脚钱拆作锅火与回铺脚路：铜钱-100、备役+1、通融+1、家族+1。春尾刚结回的一口钱，总算没再被家里锅火和来春铺路一起混吃。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春脚钱拆作锅火与回铺脚路，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_mid_shop':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中铺话');
                log.push(['你在' + stepLabel + '先把春中回铺回话与灯油盐药分开：铜钱-60、核账+1、通融+1、家族+1。春分书中旬这层“旧铺还认你、家里锅火却先来追钱”的细账，总算先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春中回铺回话与灯油盐药分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_mid_festival':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中香脚');
                log.push(['你在' + stepLabel + '先把春中代管回签与清明香纸分开：铜钱-55、核账+1、通融+1、家族+1。春分书中旬这层“纸票、香火与锅火一起冒头”的碎账，总算先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春中代管回签与清明香纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_packet':
              if (spendCopper(70)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏茶汤');
                log.push(['你在' + stepLabel + '先把伏夏茶汤、凉药、回铺脚费与捎话小费分开：铜钱-70、备役+1、通融+1、家族+1。学徒路当户的夏头终于不再只靠“城里还有旧识”这句话硬顶过去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏茶汤与回铺脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏回签');
                log.push(['你在' + stepLabel + '先把伏夏回签与柜边包纸分开：铜钱-60、核账+1、通融+1、家族+1。学徒路当户到了伏夏中旬，也开始把“回签未稳、柜边小耗先来”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏回签与柜边包纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_tail':
              if (spendCopper(65)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('夏尾铺签');
                log.push(['你在' + stepLabel + '先把夏尾回铺回签与秋前脚单分开：铜钱-65、催账+1、通融+1、家族+1。学徒路当户到了伏夏尾声，也开始把“旧铺回签未净、秋前脚路已先来问”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把夏尾回铺回签与秋前脚单分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_reply':
              if (spendCopper(65)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋头回签');
                log.push(['你在' + stepLabel + '先把秋头回签与催佃脚费分开：铜钱-65、催账+1、通融+1、家族+1。学徒路当户到了秋头，也开始把“铺里回签先到、乡里租路也要先跑”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋头回签与催佃脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_head_cloth':
              if (spendCopper(60)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                S.体魄 += 1;
                pushHouseholdSeasonTag('秋头夹衣');
                log.push(['你在' + stepLabel + '先把秋头回签与孩子夹衣分开：铜钱-60、通融+1、家族+1、体魄+1。学徒路当户到了秋头，也开始把“铺里回音刚起、孩子夹衣和锅火却先来追钱”这层换季细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋头回签与孩子夹衣分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_bundle':
              if (spendCopper(120)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋脚拆账');
                log.push(['你在' + stepLabel + '先把秋脚钱拆作锅火与差钱：铜钱-120、备役+1、通融+1、家族+1。秋里看着厚起来的那口脚钱，终于先被拆成这一房能真正守住的后手。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋脚钱拆作锅火与差钱，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_mid_shop':
              if (spendCopper(65)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋中铺账');
                log.push(['你在' + stepLabel + '先把秋中铺账脚费与租路饭钱分开：铜钱-65、催账+1、通融+1、家族+1。学徒路当户到了秋中，也开始把“铺账刚有回音、租路饭钱和锅火已先追钱”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋中铺账脚费与租路饭钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_tail':
              if (spendCopper(70)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾回话');
                log.push(['你在' + stepLabel + '先把秋尾回话、锅火与催佃脚费分开：铜钱-70、催账+1、通融+1、家族+1。秋里那口“快回来了”的铺钱，这回终于先被拆成这一房真能用的后手。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾回话、锅火与催佃脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_tail_shop':
              if (spendCopper(60)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾铺脚');
                log.push(['你在' + stepLabel + '先把秋尾锅火与回铺脚费分开：铜钱-60、催账+1、通融+1、家族+1。学徒路当户到了秋尾，也开始把“回铺脚费未净、眼前锅火和冬前脚路已先来抢钱”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾锅火与回铺脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_packet':
              if (spendCopper(75)) {
                S.本年户备役 += 1;
                S.本年户衣药 += 1;
                S.本年户通融 += 1;
                pushHouseholdSeasonTag('冬头铺耗');
                log.push(['你在' + stepLabel + '先把冬头回铺脚费与灯炭药包分开：铜钱-75、备役+1、衣药+1、通融+1。学徒路当户到了冬头，也开始把“脚路未动、灯炭和药包先来”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬头回铺脚费与灯炭药包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_route':
              if (spendCopper(60)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('来春铺路');
                log.push(['你在' + stepLabel + '先把来春回铺脚费与递话薄礼留下：铜钱-60、备役+1、通融+1、家族+1。冬里翻总账时，来春第一程终于不必再和眼前锅火抢同一口现钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留来春回铺脚费与递话薄礼，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_reply':
              if (spendCopper(65)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中铺签');
                log.push(['你在' + stepLabel + '先把冬中回铺回签与灯炭门包分开：铜钱-65、核账+1、通融+1、家族+1。学徒路当户到了冬中，也开始把“旧铺回音还在、灯炭门包先到”这层细账压回同旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中回铺回签与灯炭门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_year_gift':
              if (spendCopper(80)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('年下客礼');
                log.push(['你在' + stepLabel + '先把年下炭药拆作守岁零用与回铺礼：铜钱-80、通融+1、家族+1。过冬锅火和来春旧门路，这回没有再来抢同一口钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下炭药拆作守岁零用与回铺礼，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_year_reply':
              if (spendCopper(70)) {
                S.本年户催账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾铺签');
                log.push(['你在' + stepLabel + '先把年下回铺回签与来春脚单分开：铜钱-70、催账+1、备役+1、家族+1。学徒路当户到冬尾也不再只剩守岁锅火，连来春脚路与旧铺回签都继续抢同一口现钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下回铺回签与来春脚单分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先缓口气，把身子留到冬里应役前：体魄+5。', 'good']);
              actionCount += 1;
              break;
          }
        });
        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);
        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          summer: {
            handledIds: ['h_shop_book', 'h_side', 'h_rest', 'h_proxy', 'h_hire', 'h_literate', 'h_summer_packet'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把铺里脚路、家里汤药和伏夏布药顾住了；在城里的人情没有再跟家里锅火一起空转。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕凉药、布药、脚路碎费和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连伏夏布药和凉汤钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          summerLower: {
            handledIds: ['h_summer_tail', 'h_shop_collect', 'h_shop_book', 'h_side', 'h_proxy', 'h_rest'],
            doneTag: '夏尾铺签已理',
            doneLog: '〔夏尾铺签〕这一旬先把旧掌柜回签、秋前脚单、递话门包和过路药包分开了；学徒路当户伏夏收尾不再只剩“把夏账熬完”，连秋前最细的脚路后手也先压回了这一旬。',
            cost: 50,
            costTag: '夏尾铺签',
            costLog: '〔夏尾铺签〕旧掌柜回签、秋前脚单、递话门包和过路药包一起要钱：铜钱-{cost}。不是大账，却正把学徒路当户伏夏下旬那层“夏账未净、秋前脚路先来”的尾账重新压回真账。',
            failTag: '夏尾硬顶',
            failLog: '〔夏尾铺签〕这一旬连回签脚费和秋前脚单都腾挪不开，只得先硬顶过去；旧铺与秋前脚路这两层口风又一起薄了一线（家族-1）。',
            hardship: 'clan'
          },
          autumn: {
            handledIds: ['h_shop_collect', 'h_proxy', 'h_pay', 'h_clan', 'h_lease_city', 'h_side', 'h_autumn_reply', 'h_autumn_mid_shop', 'h_autumn_bundle'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋后铺账、租谷、锅火与差钱已被你先拆开；忙季脚钱这旬没再被误写成宽裕。',
            cost: 70,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕秋后脚路碎费、租路人情和锅火杂支一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房在人情面上更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_pay', 'h_proxy', 'h_shop_book', 'h_shop_collect', 'h_literate', 'h_rest', 'h_winter_packet'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕铺里旧脚钱、明春脚路和差钱后手已被你先分开；年关不再只剩“人在城里却手里没口现钱”。',
            cost: 50,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、脚路、来春回铺盘缠和小差钱一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          }
        });
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_shop_book || picked.h_side || picked.h_proxy || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '铺耗已压');
            log.push(['〔铺里零耗〕这一旬先把铺里茶汤、捎口信脚费和家里凉药顾住了；伏夏里最容易把旧脚路一点点磨薄的那层零耗，没有继续滚大。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '铺里零耗');
            log.push(['〔铺里零耗〕伏夏里茶汤、脚夫点心、捎口信脚费和家里凉药一起冒头：铜钱-40。不是大账，却正把“仍认得铺里门路”一点点磨薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '铺耗硬扛');
            log.push(['〔铺里零耗〕这一旬连茶汤脚费和家里凉药都腾挪不开，只得先硬扛过去；旧门路在人情面上又薄了一层（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 3) {
          if (picked.h_summer_tail || picked.h_shop_collect || picked.h_shop_book || picked.h_side) {
            pushHouseholdSeasonTag(stepLabel + '夏尾铺签已理');
            log.push(['〔夏尾铺签〕这一旬先把旧掌柜回签、秋前脚单、递话门包和过路药包理开了；学徒路当户的伏夏收尾也不再只靠“铺钱快回了”一句话撑着。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '夏尾铺签');
            log.push(['〔夏尾铺签〕旧掌柜回签、秋前脚单、递话门包和过路药包一起要钱：铜钱-45。不是大账，却正把学徒路当户夏尾那层“秋前脚路先到、旧铺回音未净”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '夏尾硬顶');
            log.push(['〔夏尾铺签〕这一旬连回签脚费和秋前脚单都腾挪不开，只得先硬顶过去；旧掌柜与秋前脚路这两层口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 1) {
          if (picked.h_summer_packet || picked.h_shop_book || picked.h_proxy || picked.h_side) {
            pushHouseholdSeasonTag(stepLabel + '伏夏茶汤已理');
            log.push(['〔伏夏茶汤〕这一旬先把伏夏茶汤、凉药、回铺脚费与捎话小费拆开了；学徒路当户的夏头也开始像同一年里不断冒头的小账，而不再只靠通用伏夏损耗一句话带过。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏茶汤');
            log.push(['〔伏夏茶汤〕伏夏茶汤、凉药、回铺脚费与捎话小费一起要钱：铜钱-45。不是新主线，却把学徒路当户夏头最细、也最先磨薄旧门路的那层小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '夏头硬顶');
            log.push(['〔伏夏茶汤〕这一旬连茶汤脚费与凉药都腾挪不开，只得先硬顶过去；旧掌柜与同门那层回话门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 1) {
          if (picked.h_shop_packet || picked.h_shop_book || picked.h_literate || picked.h_clan || picked.h_proxy || picked.h_hire) {
            pushHouseholdSeasonTag(stepLabel + '分书抄样已理');
            log.push(['〔分书抄样〕这一旬先把分书抄样、柜边包纸和递话脚费理开了；学徒路当户的开春不再只剩“旧账要催”，连立户起手这层铺面碎账也先落进了真账。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '分书抄样');
            log.push(['〔分书抄样〕分书抄样、柜边包纸和递话脚费一起要钱：铜钱-35。不是大账，却正把学徒路当户开年第一旬的制度与铺面碎费重新压回账上。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '分书硬顶');
            log.push(['〔分书抄样〕这一旬连抄样和递话脚费都腾挪不开，只得先硬顶过去；立户第一旬这一房的人情面就先薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_spring_mid_shop || picked.h_shop_book || picked.h_proxy || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '春中铺话已理');
            log.push(['〔春中铺话〕这一旬先把旧掌柜回话、灯油盐药、递话脚费和锅火小耗分开了；春分书中旬终于不再只是在立纸票，连“旧铺还认你、家里却先来追钱”的那层细账也开始同年见光。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '春中铺话');
            log.push(['〔春中铺话〕旧掌柜回话、灯油盐药、递话脚费和锅火小耗一起要钱：铜钱-40。不是大账，却正把学徒路当户春分书中旬那层“旧铺回话还在路上、家里锅火先要续”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中铺话硬顶');
            log.push(['〔春中铺话〕这一旬连灯油盐药和递话脚费都腾挪不开，只得先硬顶过去；旧铺和家里两头替这一房接气的口风都更紧了一线（家族-1）。', 'bad']);
          }
          if (picked.h_spring_mid_festival || picked.h_lease_city || picked.h_clan || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚已分');
            log.push(['〔春中香脚〕这一旬先把代管回签、清明香纸、递话脚费和锅火小耗分开了；春分书中旬不再只是在翻代管纸票，连清明前后最躲不开的家内碎账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚');
            log.push(['〔春中香脚〕代管回签、清明香纸、递话脚费和锅火小耗一起要钱：铜钱-35。不是大账，却正把学徒路当户春分书中旬那层“纸票未稳、香脚先来”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中香脚硬顶');
            log.push(['〔春中香脚〕这一旬连清明香纸和递话脚费都腾挪不开，只得先硬顶过去；春分书还没坐稳，家里和乡里的口风就先紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_autumn_reply || picked.h_shop_collect || picked.h_lease_city || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋头回签已理');
            log.push(['〔秋头回签〕这一旬先把秋头回签、催佃脚费、递话门包和锅火次序拆开了；学徒路当户的秋头也不再只靠“旺季回钱”一句话撑着。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋头回签');
            log.push(['〔秋头回签〕秋头回签、催佃脚费、递话门包和锅火次序一起要钱：铜钱-45。不是新主线，却正把学徒路当户秋头最先冒出来的那层铺账与租路小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋头硬顶');
            log.push(['〔秋头回签〕这一旬连催佃脚费和递话门包都腾挪不开，只得先硬顶过去；铺里回签与乡里租路这两层口风又一起薄了一线（家族-1）。', 'bad']);
          }
          if (picked.h_autumn_head_cloth || picked.h_autumn_reply || picked.h_shop_collect || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣已理');
            log.push(['〔秋头夹衣〕这一旬先把秋头回签、孩子夹衣、递话门包和锅火小耗分开了；学徒路当户的秋头不再只是在问铺里回音，连换季穿用和家里锅火也开始同旬见光。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣');
            log.push(['〔秋头夹衣〕秋头回签、孩子夹衣、递话门包和锅火小耗一起要钱：铜钱-40。不是大账，却正把学徒路当户秋头那层“回音刚起、孩子先要添衣”的换季细耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣硬顶');
            log.push(['〔秋头夹衣〕这一旬连孩子夹衣和锅火小耗都腾挪不开，只得先硬顶过去；秋凉一到，身子和家里锅火先一起吃了一亏（体魄-1）。', 'bad']);
          }
          if (picked.h_lease_city || picked.h_shop_collect || picked.h_clan || (S.委托营生 === '出佃收租') || (S.委托租谷 || 0) > 0) {
            pushHouseholdSeasonTag(stepLabel + '秋租脚路已坐');
            log.push(['〔秋租脚路〕春里立下的租账与乡里路数这时开始起效，催佃脚路、回城脚费与锅火没有再撞成一团。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋租脚路');
            log.push(['〔秋租脚路〕催佃、回城脚费和秋里锅火一起要钱：铜钱-50。不是新主线，只是租谷要真落回这一房，总得先垫一层脚路。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋租硬顶');
            log.push(['〔秋租脚路〕这一旬连催佃脚路都挪不开，只得先硬顶过去；这一房在乡里的应声又薄了一层（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_mid_shop || picked.h_shop_collect || picked.h_proxy || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋中铺账已理');
            log.push(['〔秋中铺账〕这一旬先把铺账脚费、租路饭钱、递话脚费和锅火后手分开了；学徒路当户的秋中不再只剩“脚钱快回了”，连这层铺账与租路一起追钱的真摩擦也压回了同旬。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋中铺账');
            log.push(['〔秋中铺账〕铺账脚费、租路饭钱、递话脚费和锅火后手一起要钱：铜钱-45。不是新主线，却正把学徒路当户秋中那层“铺账回音未稳、租路和锅火先来追钱”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋中硬顶');
            log.push(['〔秋中铺账〕这一旬连租路饭钱和铺账脚费都腾挪不开，只得先硬顶过去；铺里和乡里两头替这一房接气的口风又薄了一线（家族-1）。', 'bad']);
          }
          if (picked.h_autumn_bundle || picked.h_pay || picked.h_shop_collect || picked.h_side || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋脚拆账已坐');
            log.push(['〔秋脚拆账〕这一旬先把秋脚钱、锅火、差钱和租路后手拆开了；忙季脚钱看着厚，却不再转头就被几本账一起吃空。', 'good']);
          } else if (spendCopper(55)) {
            pushHouseholdSeasonTag(stepLabel + '秋脚拆账');
            log.push(['〔秋脚拆账〕秋脚钱、锅火、差钱和租路后手一起要钱：铜钱-55。不是大账，却正把学徒路当户秋中最像“宽下来了”的那层忙季错觉重新压回账上。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋脚硬顶');
            log.push(['〔秋脚拆账〕这一旬连锅火和差钱后手都腾挪不开，只得先硬顶过去；秋里刚厚起来的那层脚钱转眼又薄了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          if (picked.h_autumn_tail_shop || picked.h_shop_collect || picked.h_proxy || picked.h_side) {
            pushHouseholdSeasonTag(stepLabel + '秋尾铺脚已理');
            log.push(['〔秋尾铺脚〕这一旬先把回铺脚费、锅火后手、过路药包和递话门包分开了；学徒路当户到了秋尾，也不再只是等铺里回话，连冬前最先冒头的那层铺脚与锅火摩擦都压回了同旬。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾铺脚');
            log.push(['〔秋尾铺脚〕回铺脚费、锅火后手、过路药包和递话门包一起要钱：铜钱-40。不是新主线，却正把学徒路当户秋尾那层“回铺脚费未净、锅火先来抢钱”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾铺脚硬顶');
            log.push(['〔秋尾铺脚〕这一旬连回铺脚费和锅火后手都腾挪不开，只得先硬顶过去；铺里回话和眼前锅火两头都更难替这一房接气了（家族-1）。', 'bad']);
          }
          if (picked.h_autumn_tail || picked.h_shop_collect || picked.h_proxy || picked.h_side || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋尾回话已坐');
            log.push(['〔秋尾回话〕这一旬先把铺里回话、锅火与催佃脚费拆开了；学徒路当户到了秋尾，也不再只是等着冬里翻总账才知道哪口钱会先断。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾回话');
            log.push(['〔秋尾回话〕铺里回话、锅火和催佃脚费一起要钱：铜钱-45。不是大账，却正把学徒路当户秋尾那层“回话快到了、催佃也要跑”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾硬顶');
            log.push(['〔秋尾回话〕这一旬连锅火和催佃脚费都腾挪不开，只得先硬顶过去；铺里回话和乡里脚路这两层口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          if (picked.h_winter_packet || picked.h_shop_book || picked.h_proxy || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '冬头铺耗已理');
            log.push(['〔冬头铺耗〕这一旬先把回铺脚费、灯炭药包、递话门包和差票后手拆开了；学徒路当户的冬头也不再只剩“等年关翻总账”一句话。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '冬头铺耗');
            log.push(['〔冬头铺耗〕回铺脚费、灯炭药包、递话门包和差票后手一起要钱：铜钱-50。不是大账，却正把学徒路当户冬头最先咬住现钱的那层铺耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬头硬顶');
            log.push(['〔冬头铺耗〕这一旬连灯炭药包和回铺脚费都腾挪不开，只得先硬顶过去；锅火、身子和来春脚路又一起更紧了一线（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 3) {
          if (picked.h_shop_collect || picked.h_spring_bundle || picked.h_side || picked.h_rest || picked.h_proxy) {
            pushHouseholdSeasonTag(stepLabel + '春脚拆家用已分');
            log.push(['〔春脚拆家用〕这一旬先把春脚钱、锅火、回铺脚路和带话小费拆开了；立户第一季末不再只剩“钱好像回来了”，而是真把家里和来春脚路都先顾住。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '春脚拆家用');
            log.push(['〔春脚拆家用〕春脚钱、锅火、回铺脚路和带话小费一起要钱：铜钱-45。不是新主线，却正把学徒路当户春尾那层“钱刚回、账先撞上”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春脚硬顶');
            log.push(['〔春脚拆家用〕这一旬连锅火和回铺脚路都腾挪不开，只得先硬顶过去；春里家里锅火和铺里门路两头都更难替这一房接气了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          if (picked.h_shop_book || picked.h_pay || picked.h_proxy) {
            pushHouseholdSeasonTag(stepLabel + '节礼脚费已分');
            log.push(['〔年关节礼〕年关前该给旧掌柜、同门与脚夫的薄礼、回铺脚费与差钱已被你先分开；这层门路没有到冬里忽然断掉。', 'good']);
          } else if (spendCopper(60)) {
            pushHouseholdSeasonTag(stepLabel + '年关节礼');
            log.push(['〔年关节礼〕年关前旧掌柜、同门和脚夫该有的薄礼与回铺脚费一起要钱：铜钱-60。不是体面消费，而是维持那层门路不立刻断掉。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '节礼硬扛');
            log.push(['〔年关节礼〕这一旬连薄礼与回铺脚费都挪不开，只得先硬扛过去；那层旧门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_winter_route || picked.h_shop_book || picked.h_proxy || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '来春铺路已留');
            log.push(['〔来春铺路〕这一旬先把来春回铺脚费、递话薄礼与差役后手留住了；学徒路到冬里翻总账时，也不再只剩一句“过了年再说”。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '来春铺路');
            log.push(['〔来春铺路〕来春回铺脚费、递话薄礼和差役小耗一起要钱：铜钱-40。不是新主线，却把冬里收束前最后一层铺路后手重新压回了这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '铺路硬顶');
            log.push(['〔来春铺路〕这一旬连来春回铺脚费和递话薄礼都腾挪不开，只得继续靠身子硬顶过去（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_year_gift || picked.h_shop_collect || picked.h_side || picked.h_rest || picked.h_proxy) {
            pushHouseholdSeasonTag(stepLabel + '年下客礼已理');
            log.push(['〔年下客礼〕这一旬先把年下炭药、守岁零用和回铺薄礼分开了；学徒路到冬尾也不再只剩“熬过这几天”，连来春那层旧门路都还留着。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '年下客礼');
            log.push(['〔年下客礼〕年下炭药、守岁零用和回铺薄礼一起要钱：铜钱-45。不是另开一条主线，却把学徒路当户冬尾最碎、也最不能断的人情账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '客礼硬顶');
            log.push(['〔年下客礼〕这一旬连守岁零用和回铺薄礼都腾挪不开，只得先硬顶过去；冬尾这房锅火和旧门路一起更薄了一线（家族-1）。', 'bad']);
          }
        }
        clampAttr('体魄');
        clampAttr('家族');
        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、铺账与差钱亲手核清，最容易吃的就是“明明有门路，却在糊涂账里磨掉”。', 'bad']);
        if ((S.本年户催账 || 0) <= 0) log.push(['这一任当户你一整年都没回头结过铺里旧脚钱；学徒路最容易吃的，正是“明明在城里跑过，钱却一直压在外头”。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把分得薄田立成了出佃租账，这一房从此不再只是嘴上“名下还有 4 亩”。', 'good']);
        else log.push(['这一任当户你始终没把分得薄田坐成租账；田还在名下，却还没开始真替这一房回口粮。', 'bad']);
        if ((S.本年户通融 || 0) > 0 && (S.本年户备役 || 0) > 0) log.push(['这一任当户你把乡里与师门的人情都先压进了差役后手里；制度压力不再只在冬里那一下才突然落下来。', 'good']);
        if (proxySet || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('师门代办') >= 0; })) log.push(['这一任当户你把年轻时攒下的那层师门旧识真正拿出来用了；学徒去向不再只剩一行旧文案。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春脚拆家用') >= 0; })) log.push(['这一任当户你连春尾第一口回脚钱都先拆成锅火与回铺脚路；学徒路立户后的开春终于不再默认“先空过去再说”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中铺话') >= 0; })) log.push(['这一任当户你又把旧掌柜回话、灯油盐药与递话脚费压进了春分书中旬；学徒路中年开春终于也把“旧铺尚有回音”这层市场细账重新摊回了同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中香脚') >= 0; })) log.push(['这一任当户你还把代管回签、清明香纸、递话脚费与锅火小耗压进了春分书中旬；立户第二旬也不再只是在立纸票，而是把清明前后的家内与制度碎账一起拆开。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏茶汤') >= 0; })) log.push(['这一任当户你连伏夏茶汤、回铺脚费与捎话小费都先拆回了夏头；学徒路的夏初终于也有了专属的细账密度，而不再只靠通用伏夏损耗撑过去。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋头夹衣') >= 0; })) log.push(['这一任当户你又把秋头回签、孩子夹衣、递话门包与锅火小耗提前拆开；学徒路中年秋头终于也把换季穿用和家内锅火重新压回了同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾回话') >= 0; })) log.push(['这一任当户又把秋尾回话、锅火与催佃脚费提前拆开；秋里最后那层“钱快回了却还没回到手”的摩擦，也终于被压回同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('来春铺路') >= 0 || String(tag).indexOf('年下客礼') >= 0; })) log.push(['这一任当户你又把冬里来春铺路、年下客礼和守岁零用先分开；学徒路连冬尾那层最碎的人情账，也开始像同一年里不断冒头的小事。', 'good']);
        if ((S.本年户季务 || []).length <= 6) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);
        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.10, (S.本年户催账 || 0) * 0.05);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) risk -= 0.08;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if (proxySet || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('师门代办') >= 0; })) risk -= 0.05;
        if (S.学徒去向 === '留店伙计') risk -= 0.05;
        else if (S.学徒去向 === '店铺做工') risk -= 0.03;
        if ((S.学徒授艺度 || 0) >= 2) risk -= 0.03;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        if (S.负债银 > 0) risk += 0.04;
        risk = Math.max(0.03, Math.min(0.85, risk));
        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if ((S.委托租谷 || 0) > 0) S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        } else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        } else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
        curStage.next = 'elder';
        curStage.nextLabel = '步入老年 →';
      }
    };
  }


  function stageMerchantHousehold() {
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);
    var owedSilver = S.未回款银 || 0;
    var canCollect = owedSilver > 0;
    var canTrustField = (S.委托租谷 || 0) <= 0 && S.田亩 > 0;
    var canSchoolFund = S.白银 >= 1 && (S.商路供读银 || 0) < 2;
    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var hasSchoolChildren = (S.子数 + S.女数) > 0;
    var summerMidSchoolName = hasSchoolChildren ? '先把伏夏柜边回帖与孩子纸样分开' : '先把伏夏柜边回帖与来春样纸分开';
    var summerMidSchoolDesc = hasSchoolChildren
      ? '夏催账到了中旬，最怕柜边回帖、孩子纸样、递话脚费和锅火凉药一起先来抢钱。先把这层伏夏回帖拆开，中旬就不只是在跑行饭和等旧账，连家里读写后手也会先压回这一旬。'
      : '夏催账到了中旬，最怕柜边回帖、来春样纸、递话脚费和锅火凉药一起先来抢钱。先把这层伏夏回帖拆开，中旬就不只是在跑行饭和等旧账，连这一房来春要续的纸样后手也会先压回这一旬。';
    var collectName = seasonIdx === 1 ? '催春路旧账' : (seasonIdx === 2 ? '催夏路旧账' : (seasonIdx === 3 ? '把旧账折回秋钱' : '赶在年关前收旧账'));
    var trustName = seasonIdx <= 2 ? '托兄代管分得薄田' : '把薄田租账坐实';
    var schoolName = seasonIdx <= 2 ? '先划一口供读后手' : '划银为供读专账';
    var wharfCost = (season.id === 'summer' || season.id === 'winter') ? 50 : 40;
    var wharfName = seasonIdx === 1
      ? '先问熟号与春路水脚'
      : (seasonIdx === 2
        ? '先问水脚与行栈路数'
        : (seasonIdx === 3 ? '先把秋路牙税与脚费分开' : '年关先订明春水脚'));
    var literateName = seasonIdx === 1 ? '识字·分书核账' : (seasonIdx === 2 ? '识字·抄水脚与租账' : '识字·对差钱与租谷');
    var clanName = seasonIdx <= 2 ? '托乡里先通气' : '托家族压住人情面';
    var payName = seasonIdx <= 3 ? '先留纳银代役现钱' : '纳银代役';
    var eventTxt;
    if (season.id === 'spring' && xun === 1) {
      eventTxt = '春分书的上旬最怕把“路上旧账还在、阄书刚写定、水脚还没问清”混成一句“回头再看”。常年在外的人家，到这一步得先把哪笔账认亏、哪口钱先回家、哪层熟号还能说话一并拆开。';
    } else if (season.id === 'spring' && xun === 2) {
      eventTxt = '春分书的中旬最像第一次真把“在外头的商路”和“分到手的 4 亩薄田”摆在同一本账上：你若不先坐实代管与租路，这房田很容易继续只停在纸上；可若只盯着纸票，熟号回签、样纸门包与清明锅火也会先来抢这一口现钱。';
    } else if (season.id === 'spring' && xun === 3) {
      eventTxt = '春分书的下旬更像清旧账：春路货款、分书杂支、家里锅火和差钱后手一起来要钱。路上银若还没拢回来，乡里可不会替你等。';
    } else if (season.id === 'summer' && xun === 1) {
      eventTxt = '夏催账的上旬最怕人先被暑气和路耗熬住，账却还在外头。伏夏的布药、水脚、行栈与家里小耗，都会来抢同一口现钱。';
    } else if (season.id === 'summer' && xun === 2) {
      eventTxt = '夏催账的中旬最像把“商路门道”“锅火现实”和“孩子读写后手”一起拆开：若只顾外头行栈，家里会空等；若只顾眼前家用，旧账、水脚和明春路数又会悄悄断掉，连柜边回帖与纸样都要先来抢钱。';
    } else if (season.id === 'summer' && xun === 3) {
      eventTxt = '夏催账的下旬更像给年关留后手：哪笔旧账先折回、哪层水脚先押住、哪口差钱要先留，都不能再拖到秋后才想。';
    } else if (season.id === 'autumn' && xun === 1) {
      eventTxt = '秋定租的上旬，一头是回款与牙价，一头是薄田终于该回租谷。你先把哪边坐成真账，就决定这一房是先多一口口粮，还是先多一口现银。';
    } else if (season.id === 'autumn' && xun === 2) {
      eventTxt = '秋定租的中旬看着最像“总该宽一口了”，其实脚费、牙税、供读后手与差钱一起更急；若不先拆账，秋路回钱很快就会被当成整口可花的银。';
    } else if (season.id === 'autumn' && xun === 3) {
      eventTxt = '秋定租的下旬最像把这一房真正坐稳：旧账、租谷、供读与水脚，哪一项都不能只停在纸上。';
    } else if (season.id === 'winter' && xun === 1) {
      eventTxt = '冬应役的上旬不是只看你敢不敢扛，而是看这一年有没有先把旧账、脚路、熟号与差钱后手一层层垫起来。';
    } else if (season.id === 'winter' && xun === 2) {
      eventTxt = '冬应役的中旬最像翻总账：哪笔旧账真回来了、哪层熟号还认你、哪口供读后手还能留住，都要在这一旬里见真章。';
    } else {
      eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把旧账、水脚、薄田、供读、抄簿回帖与差钱分开，都会在这一旬里一起现形。';
    }
    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '这任当户不再按“一次 4 点”一口气结掉，而是拆成四季三旬。分家后的薄田、商路旧账、供读后手与应役现银，都要在同一年里分段落账。' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是“再做一件大事”，而是把哪笔钱、哪层人情、哪口薄田先落到账上。',
      dossier: function () {
        return lifeDossier('商路当户拆为四季三旬｜户程=' + stepLabel + '｜未回款=' + (S.未回款银 || 0) + '两｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜商路供读=' + (S.商路供读银 || 0) + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '立阄书只是开始。对常年在外的人家而言，真正难的是把“这 4 亩薄田谁代看、哪笔旧账先回、哪口现银先备役”在同一年里逐笔坐实。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[商账]', txt: eventTxt },
        hp.event,
        householdFlavorEvent('merchant', season.id, xun),
        householdSeasonPulseEvent(season.id, xun)
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把当户这一年真正拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        if (canCollect) A.push({ id: 'h_collect', name: collectName, cost: 1, eff: '未回款→白银·备役后手更实', desc: '旧账不催回，后头的差钱、家用和供读就都只是纸上账。', can: true, once: true });
        if (canTrustField) A.push({ id: 'h_trust_field', name: trustName, cost: 1, eff: '年租谷+1·家族+2', desc: '把分得薄田先立成兄代管/代收租的账，这一房才不至于“有田等于没田”。', can: true, once: true });
        if (canSchoolFund) A.push({ id: 'h_school_fund', name: schoolName, cost: 1, eff: '白银-1·供读专账+1·家族+2', desc: '不是为了算成功分，只是把“孩子读不读”这笔钱真从现银里先分出来。', can: true, once: true });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·代役后手坐实', desc: '先把代役现银留出来，年关就不至只剩硬扛。', can: true, once: true });
        if (season.id === 'autumn' && xun === 2) {
          A.push({
            id: 'h_autumn_mid_reply',
            name: '先把秋中回签与租路饭钱分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '秋定租到了中旬，最怕熟号回签刚有回音，租路饭钱、递话脚费和锅火后手就先来追钱。先把这层秋中回签拆开，不让“秋路快回了”这句话又被饭钱和家内小耗先吃空。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_autumn_mid_cloth',
            name: '先把秋中回签与孩子夹衣分开',
            cost: 1,
            eff: '铜钱-65·通融+1·家族+1·体魄+2',
            desc: '秋凉刚起时，熟号回签、孩子夹衣、租路饭钱、递话脚费和锅火后手会一齐来追钱。先把这层秋中夹衣拆开，不让“秋钱快回了”又先被换季家用和回乡脚路啃薄。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_autumn_split',
            name: '把秋路回钱拆作牙税与锅火',
            cost: 1,
            eff: '现钱外流·备役+1·家族+2·通融+1',
            desc: '秋定租到了中旬，最怕秋路回钱看着快到手，牙税、锅火和代役后手却一起扑上来。先把这一口拆开，不让“秋里看着厚”转头又只剩几本空账。',
            can: S.白银 >= 1 || S.铜钱 >= 220,
            why: (S.白银 >= 1 || S.铜钱 >= 220) ? '' : '现钱不够拆作牙税与锅火',
            once: true
          });
        }
        A.push({ id: 'h_wharf', name: wharfName, cost: 1, eff: '铜钱-' + wharfCost + '·水脚与人情后手更稳', desc: '先把哪条水脚还通、哪家行栈肯压一程、哪口脚费和牙税该先拆开问清。钱没有变多，但后头的旧账、供读和差钱才不至再混成一团。', can: S.铜钱 >= wharfCost, why: S.铜钱 >= wharfCost ? '' : ('铜钱不足' + wharfCost + '文') });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·差钱/租谷更清' : '（不识字·无从核账）', desc: '把阄书、水脚、租谷、差钱都抄在自己看得懂的账上。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把谁肯替这一房说话、谁能替你分担一层里役人情坐实。', can: (S.本年户通融 || 0) < 2, once: true });
        if (season.id === 'spring' && xun === 1) {
          A.push({
            id: 'h_spring_packet',
            name: '先把分书抄样与界纸脚费分开',
            cost: 1,
            eff: '铜钱-50·核账+1·通融+1·家族+1',
            desc: '春分书刚起头时，最先磨人的往往不是整笔旧账，而是抄样、界纸、递话脚费和柜边包纸这层小耗。先把它们拆开，这一房才不至开年就被碎账咬住。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文',
            once: true
          });
          A.push({
            id: 'h_spring_head_reply',
            name: '先把春头代管脚单与熟号回话分开',
            cost: 1,
            eff: '铜钱-45·核账+1·通融+1·家族+1',
            desc: '春分书刚起头时，最怕代管脚单、熟号回话、界纸门包和锅火小耗一起冒头。先把这层春头回话拆开，分书、代管和旧商路口风才不至一开年就继续挤在同一口现钱上。',
            can: S.铜钱 >= 45,
            why: S.铜钱 >= 45 ? '' : '铜钱不足45文',
            once: true
          });
        }
        if (season.id === 'spring' && xun === 2) {
          A.push({
            id: 'h_spring_deed',
            name: '先把分书回话与代管纸票分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕阄书回话、代管薄田的纸票、丈绳脚费和柜边包纸一起压来。先把这层碎费分开，分得的田和要走的商路才不会还没落手就先互相抢现钱。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_spring_incense',
            name: '先把清明香纸与代管回签分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕清明香纸、代管回签、递话脚费和锅火小耗一起冒头。先把这层家内与制度碎账拆开，分书、代管和清明前后的锅火就不必继续挤在同一口现钱上。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_spring_reply',
            name: '先把春中回签与样纸门包分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '春分书到了中旬，最怕熟号回签、样纸门包、递话脚费和锅火小耗一起冒头。先把这层“旧商路还在、家里和代管也要钱”的春中回签拆开，分书第二旬才不至只剩纸票与丈绳在账上见光。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'spring' && xun === 3) {
          A.push({
            id: 'h_spring_tail_incense',
            name: '先把春尾香纸与熟号门包分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '春分书到了下旬，最怕清明香纸、熟号门包、递话脚费和孩子纸包一起先来要钱。先把这层春尾香脚拆开，春路回钱、家里锅火与孩子纸笔就不必继续挤同一口现钱。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_spring_split',
            name: '把春路回钱拆作锅火与差钱',
            cost: 1,
            eff: '现钱外流·备役+1·家族+2',
            desc: '春分书到了下旬，最怕春路旧账刚松一口，锅火和差钱就一起扑上来。先把这口回钱拆碎，不让“常年在外的人家”到立户第一季末还只会整口攥钱。',
            can: S.白银 >= 1 || S.铜钱 >= 180,
            why: (S.白银 >= 1 || S.铜钱 >= 180) ? '' : '现钱不够拆作锅火与差钱',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 2) {
          A.push({
            id: 'h_summer_market',
            name: '先把伏夏行饭与柜边回话分开',
            cost: 1,
            eff: '铜钱-65·通融+1·备役+1·家族+1',
            desc: '夏催账到了中旬，最怕行栈行饭、柜边回话、家里锅火和差钱一起扑上来。先把这几口钱拆开，旧账未回之前，这一房也不至只靠一句“再等等”硬顶。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_summer_packet',
            name: '先把伏夏样纸与回签门包分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '夏催账到了中旬，最怕样纸、柜边包纸、学生家回话小门包与过路药包一起扑上来。先把这层柜边细耗拆开，伏夏不只剩“行饭和大路数”两件大事。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_summer_mid_reply',
            name: summerMidSchoolName,
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·供读+1·家族+1',
            desc: summerMidSchoolDesc,
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 3) {
          A.push({
            id: 'h_summer_tail',
            name: '先把夏尾回话脚费与柜边包纸分开',
            cost: 1,
            eff: '铜钱-70·通融+1·备役+1',
            desc: '夏催账到了下旬，最怕回话脚费、柜边包纸、锅火凉药和催账小门包一起冒头。先把这几口钱拆开，秋里回款未到前，这一房至少还有可挪的后手。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
          A.push({
            id: 'h_summer_guest_sign',
            name: '先把夏尾客签与秋前样纸分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '夏催账到了下旬，最怕客签回话、秋前样纸、递话门包与过路药包先一步冒头。你先把这层客路后手拆开，秋钱未到时也不至让秋前样纸和客签口风继续挤在同一口现钱上。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'summer' && xun === 1) {
          A.push({
            id: 'h_summer_cool',
            name: '先把伏夏凉药与行栈茶钱分开',
            cost: 1,
            eff: '铜钱-60·通融+1·体魄+3·家族+1',
            desc: '夏催账刚起头时，伏夏凉药、行栈茶钱、带话脚费和家里凉热小耗最容易一起冒头。先把这几口钱拆开，别让暑热先把门路和锅火一并磨薄。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_summer_home_packet',
            name: '先把伏夏家书脚费与布药纸包分开',
            cost: 1,
            eff: '铜钱-65·核账+1·通融+1·家族+1',
            desc: '夏催账刚起头时，最怕家书脚费、布药纸包、递话门包和锅火凉热小耗一起找上门。先把这层伏夏家书与布药拆开，人在外头、家里要续的那口气才不至全压在同一口现钱上。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_summer_head_reply',
            name: '先把伏夏回签与孩子纸样分开',
            cost: 1,
            eff: '铜钱-60·核账+1·通融+1·家族+1',
            desc: '夏催账刚起头时，最怕熟号回签、孩子纸样、递话门包和锅火凉药一起冒头。先把这层伏夏回签拆开，伏夏第一旬就不只是在问路数与扛暑气，连家里读写后手也会先压回这一旬。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_summer_head_register',
            name: '先把伏夏柜帖与差票门包分开',
            cost: 1,
            eff: '铜钱-65·备役+1·通融+1·家族+1',
            desc: '伏夏上旬最怕柜帖回签、差票门包、里书帖样和递话脚费一起先来。先把这层帖册门包拆开，商路当户夏头就不只是在扛热和等回签，连里甲门上的制度小耗也会先落进这一旬。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
        }
        A.push({ id: 'h_hire', name: '雇工顾住田面', cost: 1, eff: '铜钱-300·分家薄田不至空转', desc: '你人在外头，先花钱把薄田顾住，别让“分得了田”变成一年的空账。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: '抽身贴补这一房', cost: 1, eff: side.effect, desc: '当户这一年照样要找现钱。哪怕只是多接一层零活，也是在给差钱和家用添后手。', can: true });
        if (season.id === 'autumn' && xun === 1) {
          A.push({
            id: 'h_autumn_receipt',
            name: '先把秋路样纸与回钱脚单分开',
            cost: 1,
            eff: '铜钱-70·核账+1·通融+1·家族+1',
            desc: '秋定租刚起头时，样纸、回钱脚单、牙行茶钱和回乡带话脚费会先撞上来。先把它们拆开，秋路这口钱才不至还没回到手就先被人情和锅火磨薄。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
          A.push({
            id: 'h_autumn_sign',
            name: '先把秋头回签与牙帖脚费分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '秋定租刚起头时，最怕回签小纸、牙帖门包、回钱脚单与递话脚费一起先来要钱。先把秋头回签拆开，这一房就不必等秋中秋尾才第一次看见最细的门包碎账。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_autumn_head_cloth_merchant',
            name: '先把秋头回签与孩子夹衣分开',
            cost: 1,
            eff: '铜钱-60·通融+1·家族+1·体魄+2',
            desc: '秋凉刚起时，最怕秋头回签、孩子夹衣、回钱脚单和锅火小耗一起先来挤钱。先把这层秋头夹衣拆开，秋定租刚起头就不至让回签、换季穿用和家里锅火继续挤在同一口现钱里。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
        }
        if (season.id === 'autumn' && xun === 3) {
          A.push({
            id: 'h_autumn_tail',
            name: '先留秋尾催单脚费与供读纸包',
            cost: 1,
            eff: '铜钱-80·核账+1·通融+1·家族+1',
            desc: '秋定租到了下旬，最怕秋钱看着快回到手，催单脚费、差票回话、供读纸包和锅火又一起先撞上。先把末尾这层细账记住，年关就不会突然整口塌下来。',
            can: S.铜钱 >= 80,
            why: S.铜钱 >= 80 ? '' : '铜钱不足80文',
            once: true
          });
          A.push({
            id: 'h_autumn_reply',
            name: '先把秋尾回话与差票门包分开',
            cost: 1,
            eff: '铜钱-55·备役+1·通融+1·家族+1',
            desc: '秋定租到了下旬，最怕秋尾回话、差票门包、递话脚费和锅火后手一起先来挤钱。先把这层门包拆开，秋钱将回未回时，这一房也不至又被最细的小耗先咬一口。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_autumn_register',
            name: '先把秋尾回批与抄簿次序分开',
            cost: 1,
            eff: '铜钱-50·核账+1·备役+1·家族+1',
            desc: '秋定租到了下旬，最怕租帖回批、回签抄簿、递话脚费和供读纸包一起先来抢钱。先把哪张回批先抄、哪笔脚费先付拆开，秋尾就不只是在等回款，而是真把制度次序也压回了这一旬。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 1) {
          A.push({
            id: 'h_winter_gift',
            name: '先把年下客礼拆作熟号薄礼与炭米',
            cost: 1,
            eff: '铜钱-70·通融+1·备役+1·家族+1',
            desc: '冬应役刚起头时，熟号薄礼、脚夫脚费、炭米和明春水脚最容易一齐来抢现钱。先把年下客礼拆开，门路和眼前锅火就不会继续挤在同一口钱里。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
          A.push({
            id: 'h_winter_medicine',
            name: '先把冬头炭药与差票门包分开',
            cost: 1,
            eff: '铜钱-55·备役+1·体魄+2·家族+1',
            desc: '冬应役刚起头时，最怕炭米、年下药包、差票门包与熟号递话脚费一起挤同一口现钱。先把冬头炭药拆开，锅火、身子与这一房的制度后手才不至一开冬就互相抢钱。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 2) {
          A.push({
            id: 'h_winter_route_split',
            name: '先把来春路引拆作回话与供读后手',
            cost: 1,
            eff: '铜钱-70·备役+1·通融+1·家族+1',
            desc: '冬应役到了中旬，最怕把来春水脚、熟号回话、供读后手和差钱都拖到年后。先把路引拆开，明春第一程和孩子纸包都不必再来抢今冬锅火。',
            can: S.铜钱 >= 70,
            why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
            once: true
          });
          A.push({
            id: 'h_winter_clear',
            name: '先把冬中回话脚费与脚夫门包分开',
            cost: 1,
            eff: '铜钱-65·核账+1·通融+1·家族+1',
            desc: '冬应役到了中旬，最怕旧账回话、脚夫门包、递话小礼和熟号回音一起抢这一口现钱。你先把这层冬中碎账拆开，翻总账时就不至只剩一句“快回来了”。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
          A.push({
            id: 'h_winter_register',
            name: '先把里书抄册与来春牙帖分开',
            cost: 1,
            eff: '铜钱-60·核账+1·备役+1·家族+1',
            desc: '冬应役到了中旬，最怕里书抄册、来春牙帖脚费、熟号递话小礼和脚夫回签一起抢现钱。先把这层帖册碎账拆开，明春认牙和今冬应役就不必继续抢同一口钱。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_winter_school_packet',
            name: '先把冬中纸样炭笔与柜边回帖分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '冬应役到了中旬，最怕孩子纸样炭笔、柜边回帖、递话脚费和守岁锅火一起先来要钱。先把这层冬中纸样拆开，供读小后手、熟号回音与眼前锅火就不必继续挤在同一口现钱里。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
        }
        if (season.id === 'winter' && xun === 3) {
          A.push({
            id: 'h_winter_coal',
            name: '先把炭钱、路引与熟号回话分开',
            cost: 1,
            eff: '铜钱-60·备役+1·通融+1·家族+1',
            desc: '到了冬应役下旬，最怕把炭火、来春路引和熟号回话都当成“等翻完总账再说”。先拆开这口小钱，来春第一程和这一房过冬的锅火才不至撞在一起。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_winter_sample',
            name: '先把来春样纸与熟号递话分开',
            cost: 1,
            eff: '铜钱-55·核账+1·通融+1·家族+1',
            desc: '冬应役到了下旬，最怕来春样纸定钱、熟号递话脚费、脚夫回签和眼前锅火一起先要钱。先把这层样纸后手拆开，明春开路不至又从一口零碎钱里硬挤出来。',
            can: S.铜钱 >= 55,
            why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
            once: true
          });
          A.push({
            id: 'h_winter_post',
            name: '先把明春牙帖与里书回签分开',
            cost: 1,
            eff: '铜钱-60·核账+1·备役+1·家族+1',
            desc: '冬应役到了下旬，最怕来春牙帖脚费、里书回签、熟号递话和锅火次序一起压来。先把这层牙帖后手拆开，明春认牙和今冬回话就不必继续挤在同一口现钱里。',
            can: S.铜钱 >= 60,
            why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
            once: true
          });
          A.push({
            id: 'h_winter_register_tail',
            name: '先把冬尾抄簿与柜边回帖分开',
            cost: 1,
            eff: '铜钱-50·核账+1·通融+1·家族+1',
            desc: '冬应役到了下旬，最怕里书回签抄簿、柜边回帖、熟号递话和孩子来春纸样一起先来要钱。先把这层抄簿与回帖后手拆开，年后翻账和明春接头就不必继续抢今冬这一口现钱。',
            can: S.铜钱 >= 50,
            why: S.铜钱 >= 50 ? '' : '铜钱不足50文',
            once: true
          });
          A.push({
            id: 'h_winter_tail',
            name: '先把年下回签与供读纸包分开',
            cost: 1,
            eff: '铜钱-65·核账+1·通融+1·家族+1',
            desc: '冬应役到了下旬，最怕熟号回签、孩子纸包、递话脚费与眼前锅火一起压上来。先把年下回签拆开，明春第一程和孩子来年的纸包就不必再抢今冬这一口现钱。',
            can: S.铜钱 >= 65,
            why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
            once: true
          });
        }
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年这口身子就是账本的一部分，别把应役前先熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_collect':
              var owed = S.未回款银 || 0;
              var got = Math.max(1, Math.ceil(owed * (seasonIdx >= 4 ? 0.5 : 0.6)));
              var lost = Math.max(0, owed - got);
              S.白银 += got;
              S.未回款银 = 0;
              if (lost > 0) S.商路亏折 += lost;
              S.本年户催账 += 1;
              pushHouseholdSeasonTag(season.name + '催回旧账');
              log.push(['你在' + stepLabel + '先把路上旧账折回作这一房现银：白银+' + got + (lost > 0 ? ('，另有' + lost + '两只得认亏') : '') + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_trust_field':
              S.委托营生 = '兄代管薄田';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.家族 += 2;
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('兄代管薄田');
              log.push(['你在' + stepLabel + '把分得薄田正式立成兄代管账：年租谷+1、家族+2。田面不再只是“名下有 4 亩”，而开始真替这一房回粮。', 'good']);
              actionCount += 1;
              break;
            case 'h_school_fund':
              if (spendSilver(1)) {
                S.商路供读银 += 1;
                S.家族 += 2;
                S.本年户供读 += 1;
                pushHouseholdSeasonTag('供读专账');
                log.push(['你在' + stepLabel + '另划白银 1 两作供读专账：这笔钱不再算随手可花，但下一代会记得这一房不是只顾眼前。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先划供读专账，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把代役现银坐实：白银-2。年关真轮到这一房时，就不至只剩硬扛。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留代役现银，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_split':
              var autumnPaid = '';
              // 与“春路拆账”一致：优先用现银把“拆账外流”这一口坐实，
              // 把零碎铜钱尽量留给后续的水脚/客礼/炭米等“必须用铜钱当场垫”的旬节开销。
              // 这也是“同一年里拆账”的核心：不是让玩家凭空更富，而是让钱的形态与用途在旬节上更可控。
              if (spendSilver(1)) autumnPaid = '白银-1';
              else if (spendCopper(220)) autumnPaid = '铜钱-220';
              if (autumnPaid) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 2;
                pushHouseholdSeasonTag('秋路拆账');
                log.push(['你在' + stepLabel + '先把秋路回钱拆作牙税与锅火：' + autumnPaid + '、备役+1、通融+1、家族+2。秋里看着厚的那口回钱，总算先被拆成这一房真能用的后手。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋路回钱拆作牙税与锅火，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_wharf':
              if (spendCopper(wharfCost)) {
                S.本年户通融 += 1;
                if (season.id === 'spring' || season.id === 'winter') S.本年户核账 += 1;
                if (season.id === 'winter') S.本年户备役 += 1;
                pushHouseholdSeasonTag(season.name + '问水脚');
                log.push([
                  season.id === 'spring'
                    ? ('你在' + stepLabel + '先把春路熟号、水脚与旧账次序问清：铜钱-' + wharfCost + '、通融+1、核账+1。分书刚落定时，先摸明哪条路还通，比回头乱撞更值钱。')
                    : (season.id === 'summer'
                      ? ('你在' + stepLabel + '先问水脚与行栈路数：铜钱-' + wharfCost + '、通融+1。伏夏里哪条脚路还稳、哪家行栈肯压一程，会直接改写这一房后手厚不厚。')
                      : (season.id === 'autumn'
                        ? ('你在' + stepLabel + '先把秋路牙税、脚费与回钱次序问清：铜钱-' + wharfCost + '、通融+1。秋路回钱看着厚，先拆明细账，才不会一手漏成几本空账。')
                        : ('你在' + stepLabel + '年关先订明春水脚：铜钱-' + wharfCost + '、通融+1、核账+1、备役+1。明春第一程还没走，后手已经先在今冬坐住了。'))),
                  'good'
                ]);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把水脚与行栈路数问清，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_literate':
              S.本年户核账 += 1;
              pushHouseholdSeasonTag(season.name + '核账');
              log.push(['你在' + stepLabel + '把阄书、水脚、租谷和差钱都先抄清。识字不是加分项，而是少让这一房白吃一层吏胥与糊涂账。', 'good']);
              actionCount += 1;
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('乡里通气');
              log.push(['你在' + stepLabel + '先把宗族与乡里的人情面压实：家族+2。到冬里真轮值时，至少不是独自去吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_packet':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('分书抄样');
                log.push(['你在' + stepLabel + '先把分书抄样、界纸脚费和柜边包纸分开：铜钱-50、核账+1、通融+1、家族+1。春分书刚起头时最先冒头的小耗，终于不再被一句“回头再算”糊过去。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把分书抄样与界纸脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_head_reply':
              if (spendCopper(45)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春头回话拆开');
                log.push(['你在' + stepLabel + '先把春头代管脚单、熟号回话、界纸门包和锅火小耗分开：铜钱-45、核账+1、通融+1、家族+1。商路当户开年第一旬不再只剩分书抄样，连“代管与旧商路一起回话”的那层细账也先落回了这一房。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春头代管脚单与熟号回话分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_deed':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('分书回话');
                log.push(['你在' + stepLabel + '先把分书回话、代管纸票、丈绳脚费与柜边包纸分开：铜钱-55、核账+1、通融+1、家族+1。春分书中旬这层最容易被略过的制度碎费，总算先落回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把分书回话与代管纸票分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_incense':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中香脚拆开');
                log.push(['你在' + stepLabel + '先把清明香纸、代管回签、递话脚费和锅火小耗分开：铜钱-60、核账+1、通融+1、家族+1。春分书中旬这层家里与制度一起冒头的小钱，总算先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把清明香纸与代管回签分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中回签拆开');
                log.push(['你在' + stepLabel + '先把熟号回签、样纸门包、递话脚费和锅火小耗分开：铜钱-60、核账+1、通融+1、家族+1。春分书中旬这层“旧商路还在回话、家里锅火和代管纸票也一起追钱”的细账，总算先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春中回签与样纸门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得人在外头、薄田在家却白荒一季。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '雇工顾田，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(season.name + '贴家');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_split':
              var splitPaid = '';
              if (spendSilver(1)) splitPaid = '白银-1';
              else if (spendCopper(180)) splitPaid = '铜钱-180';
              if (splitPaid) {
                S.本年户备役 += 1;
                S.家族 += 2;
                pushHouseholdSeasonTag('春路拆账');
                log.push(['你在' + stepLabel + '先把春路回钱拆作锅火与差钱：' + splitPaid + '、备役+1、家族+2。年头立户最怕“看着有钱、其实两头都没留住”，这一旬总算先把后手坐实了。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春路回钱拆作锅火与差钱，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_tail_incense':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春尾香脚拆开');
                log.push(['你在' + stepLabel + '先把春尾香纸、熟号门包、递话脚费和孩子纸包分开：铜钱-55、核账+1、通融+1、家族+1。商路当户到了春尾，不只是在拆回钱，连清明、门包和孩子纸包这层家里与门路一起冒头的小钱也先落回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春尾香纸与熟号门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_tail':
              if (spendCopper(70)) {
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('夏尾账脚拆开');
                log.push(['你在' + stepLabel + '先把夏尾回话脚费、柜边包纸与锅火凉药分开：铜钱-70、通融+1、备役+1。回款还没真拢到手前，秋里的后手总算先留住了一层。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把夏尾回话脚费与柜边包纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_guest_sign':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('夏尾客签拆开');
                log.push(['你在' + stepLabel + '先把夏尾客签回话、秋前样纸、递话门包与过路药包分开：铜钱-60、核账+1、通融+1、家族+1。秋钱还没回到手前，秋前最细的样纸与客签后手总算先被你拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把夏尾客签与秋前样纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_cool':
              if (spendCopper(60)) {
                S.本年户通融 += 1;
                S.体魄 += 3;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏路药');
                log.push(['你在' + stepLabel + '先把伏夏凉药、行栈茶钱和带话脚费分开：铜钱-60、通融+1、体魄+3、家族+1。暑热还在，可门路和锅火总算没先被这层小耗一起磨薄。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏凉药与行栈茶钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_home_packet':
              if (spendCopper(65)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏家书拆开');
                log.push(['你在' + stepLabel + '先把伏夏家书脚费、布药纸包、递话门包和锅火凉热小耗分开：铜钱-65、核账+1、通融+1、家族+1。商路当户伏夏上旬终于不只剩水脚与凉药，连人在外头、家里要续那口气的碎账也先压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏家书脚费与布药纸包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_head_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏回签拆开');
                log.push(['你在' + stepLabel + '先把熟号回签、孩子纸样、递话门包和锅火凉药分开：铜钱-60、核账+1、通融+1、家族+1。商路当户伏夏上旬终于不只是在问路数和将养身子，连“旧商路还在回话、家里读写后手先来追钱”的细账也先被拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏回签与孩子纸样分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_head_register':
              if (spendCopper(65)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏帖册拆开');
                log.push(['你在' + stepLabel + '先把伏夏柜帖、差票门包、里书帖样和递话脚费分开：铜钱-65、备役+1、通融+1、家族+1。商路当户伏夏上旬终于连“门上制度碎账比回钱先到”的那层小耗，也被你提前拆回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏柜帖与差票门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_market':
              if (spendCopper(65)) {
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏行饭');
                log.push(['你在' + stepLabel + '先把伏夏行饭、柜边回话、锅火和差钱后手分开：铜钱-65、通融+1、备役+1、家族+1。夏催账到了中旬，行栈与家里的小耗终于不再混成一句“再等等”。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏行饭与柜边回话分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_packet':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏样纸拆开');
                log.push(['你在' + stepLabel + '先把伏夏样纸、柜边包纸、学生家回话小门包与过路药包分开：铜钱-55、核账+1、通融+1、家族+1。夏催账中旬终于不只剩行饭和大路数，柜边最细的那层碎耗也被你主动拆进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏样纸与回签门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_mid_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.本年户供读 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏回帖拆开');
                log.push(['你在' + stepLabel + '先把伏夏柜边回帖、' + (hasSchoolChildren ? '孩子纸样' : '来春样纸') + '、递话脚费和锅火凉药分开：铜钱-60、核账+1、通融+1、供读+1、家族+1。夏催账到了中旬，旧账未回、家里读写后手先来追钱的那层细账，总算被你提前拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏柜边回帖与' + (hasSchoolChildren ? '孩子纸样' : '来春样纸') + '分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_receipt':
              if (spendCopper(70)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋路账脚');
                log.push(['你在' + stepLabel + '先把秋路样纸、回钱脚单和牙行茶钱分开：铜钱-70、核账+1、通融+1、家族+1。秋钱还没真正回到手，样纸与回话脚费这层碎账已先从同一口现钱里拆开。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋路样纸与回钱脚单分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_sign':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋头回签拆开');
                log.push(['你在' + stepLabel + '先把秋头回签、牙帖门包、回钱脚单与递话脚费分开：铜钱-55、核账+1、通融+1、家族+1。秋定租刚起头时，那层最细的回签门包没有再被拖到季中季尾才见光。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋头回签与牙帖脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_head_cloth_merchant':
              if (spendCopper(60)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                S.体魄 += 2;
                pushHouseholdSeasonTag('秋头夹衣拆开');
                log.push(['你在' + stepLabel + '先把秋头回签、孩子夹衣、回钱脚单和锅火小耗分开：铜钱-60、通融+1、家族+1、体魄+2。秋定租刚起头时，这一房不再只盯着回签和脚单，连换季穿用与锅火也开始同旬见光。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋头回签与孩子夹衣分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_mid_reply':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋中回签拆开');
                log.push(['你在' + stepLabel + '先把熟号回签、租路饭钱、递话脚费和锅火后手分开：铜钱-60、核账+1、通融+1、家族+1。秋定租中旬这层“秋钱未落手、回乡与家用先来追钱”的细账，总算先被拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋中回签与租路饭钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_mid_cloth':
              if (spendCopper(65)) {
                S.本年户通融 += 1;
                S.家族 += 1;
                S.体魄 += 2;
                pushHouseholdSeasonTag('秋中夹衣拆开');
                log.push(['你在' + stepLabel + '先把秋中回签、孩子夹衣、租路饭钱和锅火后手分开：铜钱-65、通融+1、家族+1、体魄+2。秋凉刚起时，这一房连身子和孩子添衣，都没再跟路上回钱挤成同一口现钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋中回签与孩子夹衣分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_tail':
              if (spendCopper(80)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾催单纸包');
                log.push(['你在' + stepLabel + '先留秋尾催单脚费与供读纸包：铜钱-80、核账+1、通融+1、家族+1。秋钱未必立刻就落袋，但末尾这层催单、纸包和锅火总算先从同一口现钱里拆出来了。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留秋尾催单脚费与供读纸包，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_reply':
              if (spendCopper(55)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾回话门包');
                log.push(['你在' + stepLabel + '先把秋尾回话、差票门包、递话脚费和锅火后手分开：铜钱-55、备役+1、通融+1、家族+1。秋尾最细的那层回话门包，总算没有再趁秋钱将回未回时先把这房现钱啃薄。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾回话与差票门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_register':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾抄簿拆开');
                log.push(['你在' + stepLabel + '先把租帖回批、回签抄簿、递话脚费和供读纸包次序分开：铜钱-50、核账+1、备役+1、家族+1。秋定租到了下旬，不只是在等秋钱回手，连“哪张回批先抄进账”这层制度碎账也总算先被压回了本年。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾回批与抄簿次序分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_route_split':
              if (spendCopper(70)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('来春路引拆开');
                log.push(['你在' + stepLabel + '先把来春路引拆作熟号回话与供读后手：铜钱-70、备役+1、通融+1、家族+1。冬里翻总账时，明春第一程和孩子纸包都不必再同眼前锅火抢一口钱。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把来春路引拆作熟号回话与供读后手，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_clear':
              if (spendCopper(65)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中回话');
                log.push(['你在' + stepLabel + '先把冬中回话脚费与脚夫门包分开：铜钱-65、核账+1、通融+1、家族+1。冬应役翻总账时最容易先冒头的那层门包脚费，这回先被你拆进了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中回话脚费与脚夫门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_register':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中帖册拆开');
                log.push(['你在' + stepLabel + '先把里书抄册、来春牙帖脚费、熟号递话小礼和脚夫回签分开：铜钱-60、核账+1、备役+1、家族+1。冬应役中旬这层“今冬还得过役、明春又要认牙”的制度细账，总算先被拆回了同一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把里书抄册与来春牙帖分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_school_packet':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中纸样拆开');
                log.push(['你在' + stepLabel + '先把冬中纸样炭笔、柜边回帖、递话脚费和守岁锅火分开：铜钱-55、核账+1、通融+1、家族+1。冬应役中旬终于不只是在翻帖册和脚路，连孩子纸样与熟号回帖这层家内细耗也先被拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中纸样炭笔与柜边回帖分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_gift':
              if (spendCopper(70)) {
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('年下客礼');
                log.push(['你在' + stepLabel + '先把年下客礼拆作熟号薄礼、脚夫脚费与炭米：铜钱-70、通融+1、备役+1、家族+1。冬账刚起头时，门路与锅火总算没再挤在同一口钱里。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下客礼拆作熟号薄礼与炭米，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_medicine':
              if (spendCopper(55)) {
                S.本年户备役 += 1;
                S.体魄 += 2;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬头炭药拆开');
                log.push(['你在' + stepLabel + '先把炭米、年下药包、差票门包与熟号递话脚费分开：铜钱-55、备役+1、体魄+2、家族+1。冬应役刚起头时，锅火、身子与差票后手总算先被拆进了各自的真账里。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬头炭药与差票门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_coal':
              if (spendCopper(60)) {
                S.本年户备役 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('炭脚路引');
                log.push(['你在' + stepLabel + '先把炭钱、来春路引与熟号回话分开：铜钱-60、备役+1、通融+1、家族+1。冬里最怕的不是穷，而是把明春还要走的那层路数和眼前锅火挤在同一口钱里。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把炭钱、路引与熟号回话分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_sample':
              if (spendCopper(55)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾样纸拆开');
                log.push(['你在' + stepLabel + '先把来春样纸定钱、熟号递话脚费和脚夫回签分开：铜钱-55、核账+1、通融+1、家族+1。冬尾最细的那层样纸后手，总算没有再被锅火和年下回话挤成一句“明春再说”。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把来春样纸与熟号递话分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_post':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾牙帖拆开');
                log.push(['你在' + stepLabel + '先把来春牙帖脚费、里书回签、熟号递话和锅火次序分开：铜钱-60、核账+1、备役+1、家族+1。冬尾这层“今冬回签未净、明春认牙先来”的制度后手，总算先被拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把明春牙帖与里书回签分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_register_tail':
              if (spendCopper(50)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾抄簿拆开');
                log.push(['你在' + stepLabel + '先把里书回签抄簿、柜边回帖、熟号递话和孩子来春纸样分开：铜钱-50、核账+1、通融+1、家族+1。冬尾这层“账先抄进哪一本、回帖先从谁手里接”的制度与门路后手，总算先被拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬尾抄簿与柜边回帖分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_tail':
              if (spendCopper(65)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('年下回签');
                log.push(['你在' + stepLabel + '先把年下回签与供读纸包分开：铜钱-65、核账+1、通融+1、家族+1。熟号回签、孩子纸包和递话脚费终于没再混成一句“年后再说”，冬尾这层细账先落到了这一房自己手里。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下回签与供读纸包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先缓口气，把身子留到冬里应役前：体魄+5。', 'good']);
              actionCount += 1;
              break;
          }
        });

        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);
        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          summer: {
            handledIds: ['h_collect', 'h_school_fund', 'h_side', 'h_rest', 'h_literate', 'h_clan', 'h_wharf', 'h_summer_tail', 'h_summer_guest_sign', 'h_summer_cool', 'h_summer_home_packet', 'h_summer_head_reply', 'h_summer_market', 'h_summer_packet'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把伏夏布药、凉药、水脚与家里零耗顾住了；商路现钱没有再被小耗悄悄磨薄。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕伏夏布药、凉药、水脚碎费和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是商路当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连伏夏布药和凉热小耗都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_collect', 'h_pay', 'h_school_fund', 'h_clan', 'h_trust_field', 'h_side', 'h_wharf', 'h_autumn_tail', 'h_autumn_reply', 'h_autumn_register', 'h_autumn_receipt', 'h_autumn_sign', 'h_autumn_head_cloth_merchant', 'h_autumn_mid_reply', 'h_autumn_mid_cloth'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋后回款、租谷、供读和差钱已被你先拆开；看着厚的秋钱这旬没再被误当成整口可花的银。',
            cost: 70,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕秋后脚路碎费、锅火、供读与差钱一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房在人情面上更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_pay', 'h_collect', 'h_literate', 'h_school_fund', 'h_clan', 'h_side', 'h_rest', 'h_wharf', 'h_winter_route_split', 'h_winter_clear', 'h_winter_register', 'h_winter_school_packet', 'h_winter_gift', 'h_winter_medicine', 'h_winter_sample', 'h_winter_post', 'h_winter_register_tail'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕旧账、明春脚路、供读后手与差钱已经先被你分开；年关没再把同一口现银搅成一团。',
            cost: 50,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、脚路、供读零碎和明春盘缠一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          }
        });
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_wharf || picked.h_collect || picked.h_clan || picked.h_side || picked.h_trust_field || picked.h_summer_market) {
            pushHouseholdSeasonTag(stepLabel + '行栈水脚已问');
            log.push(['〔行栈水脚〕这一旬先把行栈、水脚与回程脚费问住了；“银还在路上时这一房怎么办”没有再只剩一句空话。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '行栈水脚');
            log.push(['〔行栈水脚〕行栈脚费、托人递话与回程碎费一起冒头：铜钱-40。不是大账，却正把商路门路一点点磨薄。', 'bad']);
          } else {
            S.家族 -= 1;
            pushHouseholdSeasonTag(stepLabel + '行栈硬顶');
            log.push(['〔行栈水脚〕这一旬连递话脚费与回程碎费都腾挪不开，只得先硬顶过去；熟号那层人情面又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_summer_market || picked.h_summer_packet || picked.h_summer_mid_reply || picked.h_school_fund || picked.h_wharf || picked.h_collect || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '伏夏样纸已理');
            log.push(['〔伏夏样纸〕这一旬先把样纸、柜边包纸、学生家回话小门包与过路药包理开了；夏催账中旬不再只剩“行饭和大路数”，连柜边最细的那层零碎也开始单独落账。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏样纸');
            log.push(['〔伏夏样纸〕样纸、柜边包纸、学生家回话小门包与过路药包一起要钱：铜钱-35。不是新主线，却正把商路当户伏夏中旬那层最细的柜边耗用重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏样纸硬顶');
            log.push(['〔伏夏样纸〕这一旬连样纸和回话小门包都腾挪不开，只得先硬顶过去；夏里熟号与学生家那层回签口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_summer_mid_reply || picked.h_school_fund || picked.h_collect || picked.h_clan || picked.h_side || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '伏夏供读回帖已理');
            log.push(['〔伏夏供读回帖〕这一旬先把柜边回帖、' + (hasSchoolChildren ? '孩子纸样' : '来春样纸') + '、递话脚费和锅火凉药理开了；商路当户伏夏中腰终于不只是在催账，连家里读写后手也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏供读回帖');
            log.push(['〔伏夏供读回帖〕柜边回帖、' + (hasSchoolChildren ? '孩子纸样' : '来春样纸') + '、递话脚费和锅火凉药一起要钱：铜钱-35。不是另开主线，却正把商路当户伏夏中旬那层“旧账未回、家里读写后手先来追钱”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏供读回帖硬顶');
            log.push(['〔伏夏供读回帖〕这一旬连柜边回帖和' + (hasSchoolChildren ? '孩子纸样' : '来春样纸') + '都腾挪不开，只得先硬顶过去；伏夏中腰这房的熟号口风和家里读写后手又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 1) {
          if (picked.h_summer_cool || picked.h_summer_home_packet || picked.h_wharf || picked.h_side || picked.h_rest || picked.h_collect) {
            pushHouseholdSeasonTag(stepLabel + '伏夏路药已分');
            log.push(['〔伏夏路药〕这一旬先把伏夏凉药、行栈茶钱、带话脚费和家里凉热小耗拆开了；夏催账刚起头时，商路这层“身子与门路一起被暑气磨”的小事终于落进了真账。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏路药');
            log.push(['〔伏夏路药〕伏夏凉药、行栈茶钱、带话脚费和家里凉热小耗一起要钱：铜钱-35。不是新主线，却正把商路当户夏头那层“门路、锅火和身子同时要顾”的细摩擦重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏路药硬顶');
            log.push(['〔伏夏路药〕这一旬连带话脚费和家里凉药都腾挪不开，只得先硬顶过去；伏夏刚起头，熟号与家里替这一房接气的口风就先紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 1) {
          if (picked.h_summer_head_reply || picked.h_summer_home_packet || picked.h_school_fund || picked.h_wharf || picked.h_collect) {
            pushHouseholdSeasonTag(stepLabel + '伏夏回签已理');
            log.push(['〔伏夏回签〕这一旬先把熟号回签、孩子纸样、递话门包和锅火凉药分开了；夏催账刚起头时，这一房不再只顾路数与凉药，连“旧商路还在回话、孩子读写后手先来追钱”的细账也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏回签');
            log.push(['〔伏夏回签〕熟号回签、孩子纸样、递话门包和锅火凉药一起要钱：铜钱-35。不是新主线，却正把商路当户夏头那层“旧商路仍在回话、家里读写和锅火先来追钱”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏回签硬顶');
            log.push(['〔伏夏回签〕这一旬连回签脚费和孩子纸样都腾挪不开，只得先硬顶过去；伏夏刚起头，熟号与家里读写这两头口风就先紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 1) {
          if (picked.h_summer_head_register || picked.h_summer_home_packet || picked.h_side || picked.h_wharf || picked.h_collect) {
            pushHouseholdSeasonTag(stepLabel + '伏夏帖册已理');
            log.push(['〔伏夏帖册〕这一旬先把柜帖回签、差票门包、里书帖样和递话脚费分开了；夏催账刚起头时，这一房不再只是顾回签、凉药与锅火，连里甲门前最容易被一句“后头再说”带过的制度碎账也开始同旬见光。', 'good']);
          } else if (spendCopper(30)) {
            pushHouseholdSeasonTag(stepLabel + '伏夏帖册');
            log.push(['〔伏夏帖册〕柜帖回签、差票门包、里书帖样和递话脚费一起要钱：铜钱-30。不是另起新主线，却正把商路当户伏夏上旬那层“门上帖册比回钱先到”的制度小耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '伏夏帖册硬顶');
            log.push(['〔伏夏帖册〕这一旬连差票门包和里书帖样都腾挪不开，只得先硬顶过去；伏夏刚起头，里甲门上与熟号两头替这一房接气的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 3) {
          if (picked.h_summer_tail || picked.h_wharf || picked.h_collect || picked.h_side || picked.h_literate || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '夏尾账脚已压');
            log.push(['〔夏尾账脚〕这一旬先把回话脚费、柜边包纸、锅火凉药和夏尾催账的小后手分开了；夏催账末尾不再把“账还在路上、家里却已先要过”混成同一口现钱。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '夏尾账脚');
            log.push(['〔夏尾账脚〕回话脚费、柜边包纸、锅火凉药和催账小门包一起要钱：铜钱-45。不是新主线，却正把商路当户夏尾那层行栈、家计与制度碎账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '夏尾硬顶');
            log.push(['〔夏尾账脚〕这一旬连回话脚费和锅火凉药都腾挪不开，只得先硬顶过去；夏里熟号与家里锅火两头都更难替这一房接气了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'summer' && xun === 3) {
          if (picked.h_summer_tail || picked.h_summer_guest_sign || picked.h_collect || picked.h_wharf || picked.h_side || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '夏尾客签已理');
            log.push(['〔夏尾客签〕这一旬先把客签回话、秋前样纸、递话门包和过路药包理开了；夏催账收尾不再只剩“旧账快回了”，连秋前起手那层最细的柜边后手也先压回了这一房。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '夏尾客签');
            log.push(['〔夏尾客签〕客签回话、秋前样纸、递话门包和过路药包一起要钱：铜钱-35。不是新主线，却正把商路当户夏尾那层“秋钱未到、秋前后手先要留”的细耗重新拖回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '夏尾客签硬顶');
            log.push(['〔夏尾客签〕这一旬连客签回话和秋前样纸都腾挪不开，只得先硬顶过去；熟号与客路这层口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_wharf || picked.h_collect || picked.h_pay || picked.h_school_fund || picked.h_trust_field || picked.h_side) {
            pushHouseholdSeasonTag(stepLabel + '秋路牙税已拆');
            log.push(['〔秋路牙税〕秋里的脚费、牙税与回钱次序已被你先拆开；秋路这口钱没再被误当成整手可花的银。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋路牙税');
            log.push(['〔秋路牙税〕秋市脚费、牙税与带话碎用一起压来：铜钱-45。不是新主线，只是把“秋钱在路上”真正拖出了一层摩擦。', 'bad']);
          } else {
            S.家族 -= 1;
            pushHouseholdSeasonTag(stepLabel + '秋路硬顶');
            log.push(['〔秋路牙税〕这一旬连牙税脚费都腾挪不开，只得先硬顶过去；乡里和熟号都更难替你说话了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_autumn_receipt || picked.h_wharf || picked.h_collect || picked.h_school_fund || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋路账脚已理');
            log.push(['〔秋路账脚〕这一旬先把秋路样纸、回钱脚单、牙行茶钱与带话脚费理开了；秋定租刚起头时，回钱还没到手，末尾细账已经先被拆进了这一房。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '秋路账脚');
            log.push(['〔秋路账脚〕秋路样纸、回钱脚单、牙行茶钱与带话脚费一起要钱：铜钱-40。不是新主线，却正把商路当户秋头那层“回钱未回、脚单先到”的细账重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋路账脚硬顶');
            log.push(['〔秋路账脚〕这一旬连回钱脚单和带话脚费都腾挪不开，只得先硬顶过去；秋头熟号与乡里两头替这一房说话的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_autumn_receipt || picked.h_autumn_sign || picked.h_wharf || picked.h_collect || picked.h_school_fund || picked.h_clan || picked.h_pay) {
            pushHouseholdSeasonTag(stepLabel + '秋头回签已理');
            log.push(['〔秋头回签〕这一旬先把回签、牙帖、回钱脚单与递话脚费理开了；秋定租刚起头时，秋钱还没回，回签门包这层最细的小耗也先落进了真账。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '秋头回签');
            log.push(['〔秋头回签〕回签、牙帖、脚单与递话脚费一起要钱：铜钱-35。不是另起一条主线，却正把秋头那层“回钱未回、门包先到”的细账重新拖回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋头硬顶');
            log.push(['〔秋头回签〕这一旬连回签脚费和牙帖门包都腾挪不开，只得先硬顶过去；秋头熟号与乡里替这一房接气的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_autumn_head_cloth_merchant || picked.h_autumn_receipt || picked.h_autumn_sign || picked.h_wharf || picked.h_collect || picked.h_school_fund || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣已理');
            log.push(['〔秋头夹衣〕这一旬先把秋头回签、孩子夹衣、回钱脚单和锅火小耗分开了；商路当户的秋头不再只是在等回钱，连换季穿用和家里锅火也开始同旬见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣');
            log.push(['〔秋头夹衣〕秋头回签、孩子夹衣、回钱脚单和锅火小耗一起要钱：铜钱-35。不是大账，却正把商路当户秋头那层“回钱未回、孩子先要添衣”的换季细耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋头夹衣硬顶');
            log.push(['〔秋头夹衣〕这一旬连孩子夹衣和锅火小耗都腾挪不开，只得先硬顶过去；秋凉一到，这一房的身子和家里锅火先一起吃了一亏（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_mid_reply || picked.h_autumn_mid_cloth || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_wharf || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋中回签已理');
            log.push(['〔秋中回签〕这一旬先把熟号回签、租路饭钱、递话脚费和锅火后手分开了；秋定租中旬终于不再只剩“秋钱快回了”，连回乡脚路与家内锅火先来追钱的那层细账也压回了同旬。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '秋中回签');
            log.push(['〔秋中回签〕熟号回签、租路饭钱、递话脚费和锅火后手一起要钱：铜钱-40。不是大账，却正把商路当户秋中那层“秋钱未落手、回乡与家用先来追”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋中硬顶');
            log.push(['〔秋中回签〕这一旬连租路饭钱和递话脚费都腾挪不开，只得先硬顶过去；熟号与家里两头替这一房接气的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_mid_cloth || picked.h_autumn_mid_reply || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_wharf || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋中夹衣已理');
            log.push(['〔秋中夹衣〕这一旬先把孩子夹衣、回乡药包、递话脚费和锅火后手留出来了；秋凉刚起时，这一房不再只盯着回钱有没有回手，连换季这层家内小耗也开始同旬见光。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '秋中夹衣');
            log.push(['〔秋中夹衣〕孩子夹衣、回乡药包、递话脚费和锅火后手一起要钱：铜钱-40。不是大账，却正把商路当户秋中那层“秋凉先到、回钱未回”的换季小耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋凉硬顶');
            log.push(['〔秋中夹衣〕这一旬连孩子夹衣和回乡药包都腾挪不开，只得先硬顶过去；秋凉刚起时，连身子与锅火都一起吃了一亏（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_split || picked.h_autumn_mid_cloth || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_wharf || picked.h_clan || picked.h_autumn_mid_reply) {
            pushHouseholdSeasonTag(stepLabel + '秋路锅火已拆');
            log.push(['〔秋路锅火〕这一旬先把秋路回钱、牙税、锅火和代役后手拆开了；秋里那口看着“快回了”的钱，不再转头又被几本账一起吃空。', 'good']);
          } else if (spendCopper(45)) {
            pushHouseholdSeasonTag(stepLabel + '秋路锅火');
            log.push(['〔秋路锅火〕秋路牙税、锅火碎用与带话脚费一起要钱：铜钱-45。不是新主线，却把商路当户秋中的那层生活与制度摩擦重新拖回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋锅火硬顶');
            log.push(['〔秋路锅火〕这一旬连锅火和递话脚费都腾挪不开，只得先硬顶过去；秋里家里与熟号两头都更难替这一房说话了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          if (picked.h_autumn_tail || picked.h_autumn_reply || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '秋尾回话已留');
            log.push(['〔秋尾回话〕这一旬先把差票回话、催单脚费、锅火碎用和供读纸包后手分开了；秋钱看着要回到手时，末尾这层制度与家用小耗没有再悄悄把它吃空。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾回话');
            log.push(['〔秋尾回话〕差票回话、催单脚费、锅火碎用和供读纸包后手一起要钱：铜钱-50。不是新主线，却正把商路当户秋尾那层“钱将回未回、账先撞上”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾硬顶');
            log.push(['〔秋尾回话〕这一旬连催单脚费和锅火小耗都腾挪不开，只得先硬顶过去；秋后熟号与乡里两头都更难替这一房回话了（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          if (picked.h_autumn_reply || picked.h_autumn_tail || picked.h_pay || picked.h_collect || picked.h_wharf || picked.h_school_fund) {
            pushHouseholdSeasonTag(stepLabel + '秋尾门包已分');
            log.push(['〔秋尾门包〕这一旬先把秋尾回话脚费、差票门包、递话小礼和锅火后手理开了；秋尾最细的那层门包摩擦，也终于没有再躲到年关才现形。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾门包');
            log.push(['〔秋尾门包〕秋尾回话脚费、差票门包、递话小礼和锅火后手一起要钱：铜钱-35。不是大账，却正把商路当户秋尾那层最细的门包碎耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾门包硬顶');
            log.push(['〔秋尾门包〕这一旬连回话脚费和差票门包都腾挪不开，只得先硬顶过去；秋尾熟号与乡里两头替这一房递话的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 3) {
          if (picked.h_autumn_register || picked.h_autumn_tail || picked.h_autumn_reply || picked.h_pay || picked.h_collect || picked.h_school_fund) {
            pushHouseholdSeasonTag(stepLabel + '秋尾抄簿已理');
            log.push(['〔秋尾抄簿〕这一旬先把租帖回批、回签抄簿、递话脚费和供读纸包次序理开了；秋定租下旬不再只剩回话和门包，连“哪张回批先抄进账”这层制度碎账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '秋尾抄簿');
            log.push(['〔秋尾抄簿〕租帖回批、回签抄簿、递话脚费和供读纸包次序一起要钱：铜钱-35。不是大账，却正把商路当户秋尾那层“回款将回未回、回批先要落簿”的制度细耗重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋尾抄簿硬顶');
            log.push(['〔秋尾抄簿〕这一旬连回签抄簿和递话脚费都腾挪不开，只得先硬顶过去；秋尾里书与熟号替这一房回批转话的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_collect || picked.h_trust_field || picked.h_literate || picked.h_clan || picked.h_wharf || picked.h_spring_deed || picked.h_spring_incense || picked.h_spring_reply) {
            pushHouseholdSeasonTag(stepLabel + '分书脚费已理');
            log.push(['〔分书脚费〕这一旬先把阄书抄手、带话脚费和催旧账的小零嘴都理开了；分家第二程不再只剩“有田有账”，而是真把落手前的碎费记进了这一房。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '分书脚费');
            log.push(['〔分书脚费〕阄书抄手、递话脚费和催旧账前的小门包一起要钱：铜钱-35。不是大账，却正把“分到了手”之前最后一层碎费拖出来。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '分书硬顶');
            log.push(['〔分书脚费〕这一旬连抄手和递话脚费都腾挪不开，只得先硬顶过去；这一房刚立起来，人情面就先薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_spring_incense || picked.h_spring_deed || picked.h_spring_reply || picked.h_trust_field || picked.h_clan || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚已分');
            log.push(['〔春中香脚〕这一旬先把清明香纸、代管回签、递话脚费和锅火小耗分开了；春分书中旬不再只是在翻纸票与丈绳，连清明前后最躲不开的家内碎账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚');
            log.push(['〔春中香脚〕清明香纸、代管回签、递话脚费和锅火小耗一起要钱：铜钱-35。不是大账，却正把商路当户春中那层“分书未稳、清明家用先来”的细摩擦重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中硬顶');
            log.push(['〔春中香脚〕这一旬连清明香纸和递话脚费都腾挪不开，只得先硬顶过去；春分书还没坐稳，家里和乡里两头的口风就先紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_spring_reply || picked.h_spring_deed || picked.h_wharf || picked.h_collect) {
            pushHouseholdSeasonTag(stepLabel + '春中回签已理');
            log.push(['〔春中回签〕这一旬先把熟号回签、样纸门包、递话脚费和锅火小耗分开了；春分书中旬终于不再只是在立代管纸票，连“旧商路还在回话、家里却先来要钱”的那层细账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '春中回签');
            log.push(['〔春中回签〕熟号回签、样纸门包、递话脚费和锅火小耗一起要钱：铜钱-35。不是大账，却正把商路当户春中那层“旧商路未稳、样纸和锅火先来抢钱”的细摩擦重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中回签硬顶');
            log.push(['〔春中回签〕这一旬连样纸门包和递话脚费都腾挪不开，只得先硬顶过去；熟号与家里锅火这两头回话口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 1) {
          if (picked.h_spring_packet || picked.h_spring_head_reply || picked.h_collect || picked.h_literate || picked.h_clan || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '分书抄样已理');
            log.push(['〔分书抄样〕这一旬先把分书抄样、界纸脚费和柜边包纸理开了；商路当户的开年不再只剩“旧账要催”，连立户起手这层碎账也先落进了真账。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '分书抄样');
            log.push(['〔分书抄样〕分书抄样、界纸脚费和柜边包纸一起要钱：铜钱-35。不是大账，却正把商路当户开年第一旬的制度碎费重新压回账上。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '分书抄样硬顶');
            log.push(['〔分书抄样〕这一旬连分书抄样与递话脚费都腾挪不开，只得先硬顶过去；立户第一旬这房的人情面就先薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 3) {
          if (picked.h_spring_split || picked.h_collect || picked.h_school_fund || picked.h_side || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '春路锅火已拆');
            log.push(['〔春路锅火〕这一旬先把春路回钱、锅火和差钱后手拆开了；立户第一季末不再只剩“有一口钱”，而是真把这一房当下与下一旬的后手分了家。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '春路锅火');
            log.push(['〔春路锅火〕春路回话脚费、锅火碎用与差钱后手一起冒头：铜钱-40。不是新主线，却正把“外头有钱路、屋里要生火”这层摩擦压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春路硬顶');
            log.push(['〔春路锅火〕这一旬连锅火和回话脚费都腾挪不开，只得先硬顶过去；春里这房锅火和熟号口风都更薄了一线（家族-1）。', 'bad']);
          }
          if (picked.h_spring_tail_incense || picked.h_spring_split || picked.h_collect || picked.h_school_fund || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '春尾香脚已分');
            log.push(['〔春尾香脚〕这一旬先把清明香纸、熟号门包、递话脚费和孩子纸包分开了；商路当户春尾不再只是在拆回钱，连清明与孩子纸包这层家里细账也开始同旬咬住现钱。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '春尾香脚');
            log.push(['〔春尾香脚〕清明香纸、熟号门包、递话脚费和孩子纸包一起要钱：铜钱-35。不是另开主线，却正把商路当户春尾最容易拖进夏里的那层清明与门包碎账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春尾香脚硬顶');
            log.push(['〔春尾香脚〕这一旬连清明香纸和熟号门包都腾挪不开，只得先硬顶过去；春尾这房的锅火、孩子纸包和熟号口风又一起薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          if (picked.h_wharf || picked.h_literate || picked.h_clan || picked.h_side || picked.h_collect || picked.h_rest || picked.h_winter_gift) {
            pushHouseholdSeasonTag(stepLabel + '年关客礼已分');
            log.push(['〔年关客礼〕该给熟号、脚夫与带话人的薄礼、脚费和明春水脚已被你先分开；商路门路没有到冬里忽然断掉。', 'good']);
          } else if (spendCopper(60)) {
            pushHouseholdSeasonTag(stepLabel + '年关客礼');
            log.push(['〔年关客礼〕年关前熟号薄礼、脚夫脚费与明春第一程水脚一起要钱：铜钱-60。不是体面消费，而是维持门路不在冬里先断。', 'bad']);
          } else {
            S.家族 -= 1;
            pushHouseholdSeasonTag(stepLabel + '客礼硬扛');
            log.push(['〔年关客礼〕这一旬连熟号薄礼与脚费都腾挪不开，只得先硬顶过去；那层旧门路又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1) {
          if (picked.h_winter_gift || picked.h_winter_medicine || picked.h_wharf || picked.h_side || picked.h_collect || picked.h_pay || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '冬头炭药已分');
            log.push(['〔冬头炭药〕这一旬先把炭米、年下药包、熟号递话脚费和差票门包分开了；冬应役刚起头时，不只是在养门路，也把眼前锅火和身子先从同一口现钱里拆了出来。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬头炭药');
            log.push(['〔冬头炭药〕炭米、年下药包、熟号递话脚费和差票门包一起要钱：铜钱-35。不是大账，却正把商路当户冬头那层“门路、锅火与身子一起开销”的细耗重新压回这一旬。', 'bad']);
          } else {
            S.体魄 = Math.max(0, S.体魄 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬头硬顶');
            log.push(['〔冬头炭药〕这一旬连炭米和年下药包都腾挪不开，只得先硬顶过去；冬还没深，锅火与身子已经先吃了一亏（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_winter_route_split || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_side || picked.h_rest || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '来春路引已留');
            log.push(['〔来春路引〕这一旬先把来春水脚、供读后手、差钱和熟号回话都留住了；冬应役翻总账时，来年第一程也已经先有了落脚。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '来春路引');
            log.push(['〔来春路引〕来春水脚、回话脚费与旧熟号递话小礼一起要钱：铜钱-40。不是新主线，只是把冬里翻总账时那层明春后手重新拖回这一旬。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushHouseholdSeasonTag(stepLabel + '路引硬顶');
            log.push(['〔来春路引〕这一旬连来春水脚和回话脚费都腾挪不开，只得先硬顶过去；人还没老尽，身子先替这层后手吃了一亏（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_winter_clear || picked.h_winter_school_packet || picked.h_winter_route_split || picked.h_wharf || picked.h_literate || picked.h_collect) {
            pushHouseholdSeasonTag(stepLabel + '冬中回话已理');
            log.push(['〔冬中回话〕这一旬先把旧账回话、脚夫门包和递话小礼理开了；冬应役中段最容易先冒头的那层“账快回、脚费先到”的碎账，没有再悄悄把现钱磨空。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '冬中回话');
            log.push(['〔冬中回话〕旧账回话脚费、脚夫门包和递话小礼一起要钱：铜钱-40。不是大账，却正把商路当户冬中那层“账快回、脚费先到”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬中硬顶');
            log.push(['〔冬中回话〕这一旬连回话脚费和脚夫门包都腾挪不开，只得先硬顶过去；熟号与乡里两头替这一房接气的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 2) {
          if (picked.h_winter_register || picked.h_winter_school_packet || picked.h_winter_clear || picked.h_winter_route_split || picked.h_pay || picked.h_literate || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '冬中帖册已理');
            log.push(['〔冬中帖册〕这一旬先把里书抄册、来春牙帖脚费、熟号递话小礼和脚夫回签理开了；冬应役中段那层“明春要认牙、今冬还得过役”的制度碎账，也先被压回了这一旬。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬中帖册');
            log.push(['〔冬中帖册〕里书抄册、来春牙帖脚费、熟号递话小礼和脚夫回签一起要钱：铜钱-35。不是新主线，却正把商路当户冬中那层“今冬应役与明春认牙同时来要钱”的细账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '帖册硬顶');
            log.push(['〔冬中帖册〕这一旬连里书抄册和牙帖脚费都腾挪不开，只得先硬顶过去；熟号与里书两头替这一房递话的口风又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_coal || picked.h_winter_tail || picked.h_pay || picked.h_school_fund || picked.h_wharf || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '炭脚路引已分');
            log.push(['〔炭脚路引〕这一旬先把炭钱、来春路引与熟号回话分开了；冬应役落总账时，这一房不必再拿同一口现钱同时扛锅火和明春头程。', 'good']);
          } else if (spendCopper(40)) {
            pushHouseholdSeasonTag(stepLabel + '炭脚路引');
            log.push(['〔炭脚路引〕炭火、来春路引和熟号回话碎费一起要钱：铜钱-40。不是另开一条主线，却把“过冬”和“明春起身”重新拖回同一旬的真账里。', 'bad']);
          } else {
            S.体魄 -= 1;
            pushHouseholdSeasonTag(stepLabel + '炭路硬顶');
            log.push(['〔炭脚路引〕这一旬连炭钱和回话脚费都腾挪不开，只得靠身子硬顶过去；冬里这房锅火和来春后手一起更薄了一层（体魄-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_sample || picked.h_winter_tail || picked.h_winter_coal || picked.h_wharf || picked.h_school_fund) {
            pushHouseholdSeasonTag(stepLabel + '冬尾样纸已留');
            log.push(['〔冬尾样纸〕这一旬先把来春样纸定钱、熟号递话脚费、脚夫回签和锅火次序理开了；冬尾最细的那层样纸后手，也终于没有再等到明春开路时才第一次抢钱。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬尾样纸');
            log.push(['〔冬尾样纸〕来春样纸定钱、熟号递话脚费、脚夫回签和锅火次序一起要钱：铜钱-35。不是大账，却正把商路当户冬尾那层最细的样纸门包重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬尾样纸硬顶');
            log.push(['〔冬尾样纸〕这一旬连样纸定钱和熟号递话脚费都腾挪不开，只得先硬顶过去；冬尾熟号与脚夫这层回话后手又薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_post || picked.h_winter_sample || picked.h_winter_tail || picked.h_wharf || picked.h_winter_coal) {
            pushHouseholdSeasonTag(stepLabel + '冬尾牙帖已理');
            log.push(['〔冬尾牙帖〕这一旬先把来春牙帖脚费、里书回签、熟号递话和锅火次序理开了；冬尾不再只剩样纸和回签，连明春认牙前那层制度小耗也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬尾牙帖');
            log.push(['〔冬尾牙帖〕来春牙帖脚费、里书回签、熟号递话和锅火次序一起要钱：铜钱-35。不是另起主线，却正把商路当户冬尾那层“今冬回签未净、明春牙帖先到”的细账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '牙帖硬顶');
            log.push(['〔冬尾牙帖〕这一旬连牙帖脚费和里书回签都腾挪不开，只得先硬顶过去；冬尾熟号与里书两头替这一房递话的口风又紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_tail || picked.h_winter_sample || picked.h_winter_coal || picked.h_school_fund || picked.h_wharf) {
            pushHouseholdSeasonTag(stepLabel + '年下回签已理');
            log.push(['〔年下回签〕这一旬先把熟号回签、供读纸包、递话脚费和锅火次序分开了；冬尾最细的那层“明春还要续门路、孩子也要接着读”终于不再只剩一句空话。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '年下回签');
            log.push(['〔年下回签〕熟号回签、供读纸包、递话脚费和锅火次序一起要钱：铜钱-35。不是大账，却正把商路当户冬尾那层“门路未断、家计先紧”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '年下硬顶');
            log.push(['〔年下回签〕这一旬连回签脚费和孩子纸包的小后手都腾挪不开，只得先硬顶过去；冬尾熟号与家里这两头口风又更薄了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_register_tail || picked.h_winter_post || picked.h_winter_sample || picked.h_winter_tail || picked.h_school_fund || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '冬尾抄簿已理');
            log.push(['〔冬尾抄簿〕这一旬先把里书回签抄簿、熟号递话、孩子来春纸样和柜边回帖次序分开了；冬尾不再只是在等年后翻账，而是把“账要抄进哪一本、来春要从谁手里接回头程”这层细事也压回了今冬。', 'good']);
          } else if (spendCopper(30)) {
            pushHouseholdSeasonTag(stepLabel + '冬尾抄簿');
            log.push(['〔冬尾抄簿〕里书回签抄簿、熟号递话、孩子来春纸样和柜边回帖一起要钱：铜钱-30。不是新开大事，却把商路当户冬尾那层“先回签还是先抄簿”的碎账重新压回了这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '抄簿硬顶');
            log.push(['〔冬尾抄簿〕这一旬连回签抄簿和递话脚费都腾挪不开，只得先硬顶过去；冬尾里书与熟号替这一房转话的口风又紧了一线（家族-1）。', 'bad']);
          }
        }

        clampAttr('体魄');
        clampAttr('家族');

        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }

        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把阄书、差钱与租谷亲手核清，最容易吃的就是“明明有家底却被糊涂账磨掉”这一亏。', 'bad']);
        if ((S.未回款银 || 0) > 0 && (S.本年户催账 || 0) <= 0) log.push(['这一任当户到了年关仍有旧账压在外头，而你一整年都没先去催回；商路与家账的摩擦被完整留到了制度结点上。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把分得薄田立成了委托/代管账，这一房从此不再只是嘴上“名下还有 4 亩”。', 'good']);
        if ((S.本年户供读 || 0) > 0) log.push(['这一任当户你在应役、旧账和家用之外，还真划出了一口供读专账。孩子来年能不能接着读，不再只靠死后结语。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书抄样') >= 0; })) log.push(['这一任当户你连分书抄样、界纸脚费和柜边包纸这层春头碎账都先摊开了；商路立户开年终于也像一年里不断冒头的小事，而不只剩“旧账与薄田”两笔大账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春头回话') >= 0; })) log.push(['这一任当户你又把春头代管脚单、熟号回话和锅火门包压回了立户第一旬；商路中年开年终于不只是在分书，也开始把“旧商路与新分家同时来回话”的市场碎账摊回同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书回话') >= 0; })) log.push(['这一任当户你又把分书回话、代管纸票和丈绳脚费压进了春分书中旬；立户第二旬也不再只是“田先代管上”，而是真把制度小耗和家内后手继续拆开。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中香脚') >= 0; })) log.push(['这一任当户你又把清明香纸、代管回签、递话脚费和锅火小耗压进了春分书中旬；商路中年开春终于不只是在立纸票，也开始把清明前后最躲不开的生活碎账一起摊回同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中回签') >= 0; })) log.push(['这一任当户你还把熟号回签、样纸门包、递话脚费和锅火小耗压进了春分书中旬；商路中年开春终于也把“旧商路尚有回音”这层市场碎账，与家内锅火一起摊回了同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春尾香脚') >= 0; })) log.push(['这一任当户你又把春尾香纸、熟号门包、递话脚费和孩子纸包压进了春分书下旬；商路中年开春终于连清明前后最细的门包、纸包与锅火次序，也不再只等夏里再来追账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('问水脚') >= 0; })) log.push(['这一任当户你不只会“催旧账”，还一旬旬去摸水脚、行栈与熟号门路；市场摩擦终于也被写进了这一年的细账里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏家书') >= 0; })) log.push(['这一任当户你又把伏夏家书脚费、布药纸包和锅火凉热压进了夏催账上旬；人在外头、家里要续的那口气，终于不再只由通用损耗一笔带过。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏样纸') >= 0; })) log.push(['这一任当户你连伏夏样纸、柜边包纸和学生家回话小门包都先拆进了夏催账中旬；商路这一年不只在大路数上有账，连柜边那层细碎纸签也开始单独咬住现钱。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏行饭') >= 0; })) log.push(['这一任当户你连伏夏行饭、柜边回话与家里锅火都压进了夏催账中旬；暑天里那层“人在外头、家里也要过”的摩擦终于不再只由通用损耗代写。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏回帖') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏供读回帖') >= 0; })) log.push(['这一任当户你又把柜边回帖、孩子纸样与递话脚费压进了夏催账中旬；商路中年终于连“旧账未回、家里读写后手却先来追钱”的那层细账，也开始像农路那样被压回同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋头回签') >= 0; })) log.push(['这一任当户你又把秋头回签、牙帖、回钱脚单和递话脚费拆进了秋定租上旬；秋钱还没真正落袋之前，最细的那层回签门包也已经先被写回这一房。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋中回签') >= 0; })) log.push(['这一任当户你又把熟号回签、租路饭钱、递话脚费和锅火后手压进了秋定租中旬；商路秋中终于不再只剩“秋路回钱拆账”，连秋钱未落手时回乡与家用先来追钱的那层细耗也开始同旬见光。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋中夹衣') >= 0; })) log.push(['这一任当户你又把孩子夹衣、回乡药包和锅火后手压进了秋定租中旬；秋凉刚起时，连换季这层家内小耗也开始和回钱脚路一起同旬抢钱。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('夏尾账脚拆开') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾催单纸包') >= 0; })) log.push(['这一任当户你连夏尾回话脚费、秋尾催单纸包这种末尾细账都主动拆开了；商路这一年不再只是“季中有事”，连季尾也在持续咬人。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾门包') >= 0; })) log.push(['这一任当户你又把秋尾回话脚费、差票门包和递话小礼压回了秋定租下旬；秋钱将回未回时，连最细的门包后手也开始同年见光。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬中纸样') >= 0; })) log.push(['这一任当户你又把冬中纸样炭笔、柜边回帖和守岁锅火压进了冬应役中旬；商路这条路终于也把孩子纸样与年下回帖这层家内细耗，和制度帖册一起摊回了同一年。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾抄簿') >= 0; })) log.push(['这一任当户你还把租帖回批、回签抄簿、递话脚费和供读纸包压回了秋定租下旬；商路这一年到了秋尾，连“哪张回批先抄进账”这层制度次序也不再等到冬里才现形。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('夏尾客签') >= 0; })) log.push(['这一任当户你又把夏尾客签回话、秋前样纸和递话门包压回了伏夏最后一旬；秋路还没开，秋前那层最细的样纸与客签后手已经先写进了同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('年关客礼') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('客礼已分') >= 0; })) log.push(['这一任当户连年关熟号薄礼、脚夫脚费与明春水脚都被拆开记了；“门路要不要养”不再只停在一句设定里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('年下客礼') >= 0; })) log.push(['这一任当户你又把年下客礼先拆成熟号薄礼、脚夫脚费与炭米；冬账刚起头时，这一房连门路和锅火都开始有了各自的真账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬头炭药') >= 0; })) log.push(['这一任当户你还把冬头炭米、药包和差票门包先拆开了；年关刚起头时，这一房就已经在同时照看门路、锅火和身子。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('年下回签') >= 0; })) log.push(['这一任当户你又把冬尾熟号回签、孩子纸包和递话脚费拆成了各自的真账；商路这层“门路要续、孩子也要接着读”的压力，终于不再只停在年后想象里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾样纸') >= 0; })) log.push(['这一任当户你还把来春样纸定钱、熟号递话和脚夫回签压回了冬尾；商路这一年连“明春开路前最细的小钱”也开始在本年里先行落账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾牙帖') >= 0; })) log.push(['这一任当户你又把来春牙帖脚费、里书回签与熟号递话压回了冬尾；商路这一年到最后一旬，连“明春认牙前先来要钱”的制度细耗也开始和锅火一起同年见光。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾抄簿') >= 0; })) log.push(['这一任当户你连冬尾回签抄簿、熟号递话和孩子来春纸样都压进了同一旬里；商路年末终于不只是“等年后翻总账”，连哪一本账先落笔都成了本年的真事。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('来春路引拆开') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('炭脚路引') >= 0; })) log.push(['这一任当户你把冬里来春路引、熟号回话与供读后手都先拆了出来；年关不再只是收束，而是在给明春继续开账。', 'good']);
        if ((S.本年户季务 || []).length <= 4) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);

        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.10, (S.本年户通融 || 0) * 0.05);
        risk -= Math.min(0.10, (S.本年户催账 || 0) * 0.05);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) risk -= 0.08;
        if ((S.本年户供读 || 0) > 0) risk -= 0.04;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if ((S.未回款银 || 0) > 0) risk += 0.06;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        risk = Math.max(0.03, Math.min(0.85, risk));

        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if (S.委托租谷 > 0) S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        }
        else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        }
        else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
        curStage.next = 'elder';
        curStage.nextLabel = '步入老年 →';
      }
    };
  }

  function stageExamHousehold() {
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);
    var canExempt = !!S.生员身份 || !!S.优免启用;
    var canCopy = !!S.识字 || (S.识字转业值 || 0) >= 2;
    var canLeaseField = S.田亩 > 0 && (S.委托租谷 || 0) <= 0;
    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var hasSchoolChildren = (S.子数 + S.女数) > 0;
    var collectName = seasonIdx === 1
      ? '先结一回馆课与文契钱'
      : (seasonIdx === 2 ? '伏夏把润笔与抄手钱拢回' : (seasonIdx === 3 ? '把秋后馆课钱拆回这一房' : '赶在年关前结一回旧馆账'));
    var copyName = seasonIdx === 1
      ? '先抄分书与塾账'
      : (seasonIdx === 2 ? '伏夏代写文契换现钱' : (seasonIdx === 3 ? '把秋后润笔拆作锅火与差钱' : '年关对旧馆账留明春纸墨'));
    var exemptName = seasonIdx === 1
      ? '凭名色先压这一年里役'
      : (seasonIdx === 2 ? '伏夏凭名色缓一口差派' : (seasonIdx === 3 ? '秋后先把优免路数坐实' : '年关凭名色压住差钱'));
    var leaseName = seasonIdx <= 2 ? '托兄把分得薄田立成租账' : '把薄田租账坐实';
    var literateName = seasonIdx === 1
      ? '识字·先抄分书与税则'
      : (seasonIdx === 2 ? '识字·抄清馆账与租谷' : (seasonIdx === 3 ? '识字·核秋钱与差钱' : '识字·对年关旧账'));
    var clanName = seasonIdx === 1
      ? '先托塾师与乡里通气'
      : (seasonIdx === 2 ? '伏夏先请保结旧识递话' : (seasonIdx === 3 ? '先把秋后人情面压住' : '年关先托乡里说话'));
    var hireName = seasonIdx <= 2 ? '雇工顾住分得薄田' : '雇短工把秋后田面收住';
    var payName = seasonIdx <= 3 ? '先留纳银代役现钱' : '纳银代役';
    var splitCost = season.id === 'summer' ? 120 : (season.id === 'autumn' ? 140 : 100);
    var splitName = '';
    var splitEffect = '铜钱-' + splitCost + '·家族+1·备役+1';
    var splitDesc = '';
    if (season.id === 'summer') {
      splitName = xun === 2 ? '把伏夏润笔拆作凉药与纸墨' : '把伏夏馆钱拆作差钱与纸墨';
      splitDesc = xun === 2
        ? '伏夏这一口润笔最怕既顾纸墨又顾凉药时一下漏光。先把它拆成纸墨、凉药和差钱后手，才不至让读书这层门路先被暑气磨断。'
        : '伏夏下旬看着像只剩几笔碎钱，可馆账、纸墨和差钱一样都不能晚。先拆开，胜过等到冬里一口气乱顶。';
    } else if (season.id === 'autumn') {
      splitName = xun === 2 ? '把秋后润笔拆作锅火与差钱' : '把秋馆钱拆作锅火与脚费';
      splitDesc = xun === 2
        ? '秋里润笔回得比夏里厚一点，也更容易让人误当“终于宽了”。先拆进锅火、差钱和脚费，这一房才不至转身又断。'
        : '秋馆钱若不先分作锅火与脚费，到了冬里就会和年关旧账一起撞上来。钱没变多，只是先被你拆成几口能活下去的小账。';
    } else if (season.id === 'winter') {
      splitName = xun === 2 ? '把年关馆钱分作纸墨与灯油' : '把余钱先分作来春纸墨与锅火';
      splitDesc = xun === 2
        ? '年关这口馆钱最怕一把花散：来春纸墨、灯油和眼前锅火都在等。先分开，不让“读书底子”死在年关小耗上。'
        : '冬应役的下旬更怕只剩一口现钱硬顶。你先把余钱分作来春纸墨与锅火，给这一房留住不那么体面的后手。';
    }
    var eventTxt;
    if (season.id === 'spring' && xun === 1) {
      eventTxt = '春分书的上旬最怕把“读过几年书”误听成“这一房自然有人让路”。分书、税则、旧馆账与谁还认这层名色，都要先拆开坐实。';
    } else if (season.id === 'spring' && xun === 2) {
      eventTxt = '春分书的中旬最像第一次真把“名色”与“薄田”摆在一张账上：生员优免能缓掉一层外流，却缓不出锅火与口粮；薄田若不先立租账，也还只是纸上家底。';
    } else if (season.id === 'spring' && xun === 3) {
      eventTxt = '春分书的下旬更像清旧馆账：塾里馆课、替人抄契与早年递保结的人情，要不要先结回一点，都会改写这一房后头靠什么过。';
    } else if (season.id === 'summer' && xun === 1) {
      eventTxt = '夏催账的上旬最怕暑气先把人熬散，纸墨、凉药、馆账与家里田面的细耗却还没理清。';
    } else if (season.id === 'summer' && xun === 2) {
      eventTxt = '夏催账的中旬最像把“识字底子”和“锅火现实”一起拆开：保结薄礼、学生家回签、租帖脚费与锅火凉药会同时来抢这一口钱；若只顾塾馆体面，这一房现钱会先断；若只顾眼前现钱，来年那层名色又会发虚。';
    } else if (season.id === 'summer' && xun === 3) {
      eventTxt = '夏催账的下旬更像给年关留后手：哪笔润笔先回、哪层优免先坐实、哪口租谷先落账，都不能再拖。';
    } else if (season.id === 'autumn' && xun === 1) {
      eventTxt = '秋定租的上旬，一头是秋后馆课与代写钱，一头是乡里薄田终于该回租谷。你先把哪边坐成真账，就决定这一房是先多一口口粮，还是先多一口现钱。';
    } else if (season.id === 'autumn' && xun === 2) {
      eventTxt = '秋定租的中旬看着最像“总该宽一口了”，其实锅火、差钱、秋后租谷与旧馆账一起更急；若不先拆账，文墨挣来的钱也会立刻漏光。';
    } else if (season.id === 'autumn' && xun === 3) {
      eventTxt = '秋定租的下旬最像把这一房真正坐稳：名色、塾师旧识与乡里薄田，哪一项都不能只停在纸上。';
    } else if (season.id === 'winter' && xun === 1) {
      eventTxt = '冬应役的上旬不是只看你敢不敢扛，而是看这一年有没有先把旧馆账、优免路数、租谷与差钱后手垫起来。';
    } else if (season.id === 'winter' && xun === 2) {
      eventTxt = '冬应役的中旬最像翻总账：哪笔润笔赶回来了、哪层名色还真认你、哪口租谷能真落回这一房，连孩子来春要续的炭笔和帖样，也都会在这一旬见真章。';
    } else {
      eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把馆账、人情、薄田与差钱分开，都会在这一旬里一起现形。';
    }
    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '举业路的当户阶段现也改成“四季三旬”。分书、税则、旧馆账、保结人情、优免路数与分得薄田，不再一口气糊成“一次 4 点”，而要在同一年里逐旬拆开。' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是“再做一件大事”，而是把名色、馆账、薄田与差钱里最要紧的那两手先坐实。',
      dossier: function () {
        return lifeDossier('举业路当户拆为四季三旬｜户程=' + stepLabel + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜优免=' + (S.优免启用 ? '启用' : '未启用') + '｜识字转业值=' + (S.识字转业值 || 0) + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '立阄书只是开始。对举业路的人家而言，真正难的是把“名色能缓哪一层、馆账先回哪一笔、分得薄田谁代管”在同一年里逐笔坐实。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[名色]', txt: eventTxt },
        hp.event,
        householdFlavorEvent('exam', season.id, xun),
        householdSeasonPulseEvent(season.id, xun)
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把举业路的当户一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        if (canCopy) A.push({ id: 'h_copy_mid', name: copyName, cost: 1, eff: '铜钱+160·核账/备役更实', desc: '把识字底子真换成馆课、代写与抄契的现钱，不让“读过几年书”只剩一层空体面。', can: true, once: true });
        if (canExempt) A.push({ id: 'h_exempt', name: exemptName, cost: 1, eff: '名色缓派·风险降', desc: '若这一房真还有生员或优免名色，就先把它坐实为可用的缓派后手，而不是留到冬里才临时翻找。', can: true, once: true });
        if (canLeaseField) A.push({ id: 'h_exam_lease', name: leaseName, cost: 1, eff: '立租账·年租谷+1·风险降', desc: '你不可能日日守田，就先把分得薄田立成租账，让它先替这一房回一口口粮。', can: true, once: true });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，年关轮值时就不至只剩硬扛。', can: true, once: true });
        if (season.id === 'spring' && xun === 1) A.push({
          id: 'h_spring_packet',
          name: '先把春头帖样与旧馆脚费分开',
          cost: 1,
          eff: '铜钱-55·催账+1·通融+1·家族+1',
          desc: '春分书刚起头时，最怕阄书抄样、拜帖脚费、旧馆回话与给保结递话的小门包一起压上。先把这层小耗拆开，立户开年第一旬才不至只靠名色撑着。',
          can: S.铜钱 >= 55,
          why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
          once: true
        });
        if (season.id === 'spring' && xun === 1) A.push({
          id: 'h_spring_school_packet',
          name: hasSchoolChildren ? '先把孩子春课纸包与保结帖脚分开' : '先把春头学童纸包后手分开',
          cost: 1,
          eff: hasSchoolChildren ? '铜钱-50·供读+1·通融+1·家族+1' : '（眼下无子女，不必另留春课纸包）',
          desc: hasSchoolChildren
            ? '春分书刚起头时，孩子春课纸包、炭笔碎钱、保结帖脚与旧馆递话门包最容易挤在同一口现钱上。先把这层家里读写后手拆开，举业路立户开年第一旬才不至只顾自己名色。'
            : '眼下这一房还没有需要续春课纸包的孩子，这层家里读写后手暂时还落不到真账里。',
          can: hasSchoolChildren && S.铜钱 >= 50 && (S.本年户供读 || 0) < 1,
          why: !hasSchoolChildren ? '眼下尚无需要续春课纸包的孩子'
            : ((S.本年户供读 || 0) < 1 ? (S.铜钱 >= 50 ? '' : '铜钱不足50文') : '这一年已先留过一手供读后手'),
          once: true
        });
        if (season.id === 'spring' && xun === 2) A.push({
          id: 'h_spring_mid_packet',
          name: '先把春中税则与清明香纸分开',
          cost: 1,
          eff: '铜钱-60·核账+1·通融+1·家族+1',
          desc: '春分书到了中旬，最怕税则抄手、清明香纸、租账脚费与给保结递话的小门包一起压上来。先把这层春中小耗拆开，举业路开春中段才不至又只剩“有名色、回头再看”的空话。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id === 'summer' && xun === 1) A.push({
          id: 'h_summer_packet',
          name: '先把伏夏潮纸与学生家回话分开',
          cost: 1,
          eff: '铜钱-70·催账+1·通融+1·家族+1',
          desc: '夏催账刚起头时，最怕潮纸、馆里茶汤、学生家回话脚费与家里凉药一起压上来。先把这层小耗拆开，举业路的伏夏第一旬才不至只靠识字底子硬顶。',
          can: S.铜钱 >= 70,
          why: S.铜钱 >= 70 ? '' : '铜钱不足70文',
          once: true
        });
        if (season.id === 'summer' && xun === 1) A.push({
          id: 'h_summer_soup',
          name: '先把伏夏馆汤与凉药门包分开',
          cost: 1,
          eff: '铜钱-60·催账+1·通融+1·体魄+2·家族+1',
          desc: '夏催账刚起头时，最怕馆里茶汤、凉药、递话门包与家里伏热小耗撞在同一口现钱上。先把这层馆汤小账拆开，举业路伏夏上旬才不至一面护门路、一面把身子和锅火都熬薄。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id === 'summer' && xun === 2) A.push({
          id: 'h_summer_surety',
          name: '先把保结薄礼与租帖脚费分开',
          cost: 1,
          eff: '铜钱-65·催账+1·通融+1·备役+1·家族+1',
          desc: '夏催账到了中旬，最怕保结薄礼、学生家回签、租帖脚费与锅火凉药一起压上来。先把这层小耗拆开，举业路这旬才不至既顾名色又顾锅火时两头都漏。',
          can: S.铜钱 >= 65,
          why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
          once: true
        });
        if (season.id === 'summer' && xun === 3) A.push({
          id: 'h_summer_tail_packet',
          name: '先把夏尾馆信与秋前纸样分开',
          cost: 1,
          eff: '铜钱-55·催账+1·通融+1·家族+1',
          desc: '夏催账到了下旬，最怕旧馆回信、秋前纸样、学生家递话脚费与锅火凉药一起压上来。先把这层尾账拆开，举业路伏夏最后这一旬才不至把秋前门路又拖成一句“回头再问”。',
          can: S.铜钱 >= 55,
          why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
          once: true
        });
        if (season.id === 'autumn' && xun === 1) A.push({
          id: 'h_autumn_packet',
          name: '先把秋帖回话与回馆脚费分开',
          cost: 1,
          eff: '铜钱-75·催账+1·备役+1·家族+1',
          desc: '秋定租刚起头时，最怕拜帖、保结回话、回馆脚费与锅火后手一起撞上。先把这口小钱拆开，秋里第一旬才不至把“名色还认不认你”又拖成一句空话。',
          can: S.铜钱 >= 75,
          why: S.铜钱 >= 75 ? '' : '铜钱不足75文',
          once: true
        });
        if (season.id === 'autumn' && xun === 1) A.push({
          id: 'h_school_roll',
          name: hasSchoolChildren ? '先把孩子秋衣与来春纸包分开' : '先替来春孩子纸包留后手',
          cost: 1,
          eff: hasSchoolChildren ? '铜钱-70·供读+1·家族+1·通融+1' : '（眼下无子女，不必另留纸包）',
          desc: hasSchoolChildren
            ? '秋凉刚起时，最怕孩子夹衣、来春纸包、递话脚费与锅火小耗一起压来。先把这口小钱另划出来，让举业路当户这一年不只顾自己名色与应役，也先顾住家里下一口读写后手。'
            : '眼下这一房还没有需要续夹衣与纸包的孩子，这层家内读写后手暂时还落不到真账里。',
          can: hasSchoolChildren && S.铜钱 >= 70 && (S.本年户供读 || 0) < 1,
          why: !hasSchoolChildren ? '眼下尚无需要续纸样的孩子'
            : ((S.本年户供读 || 0) < 1 ? (S.铜钱 >= 70 ? '' : '铜钱不足70文') : '这一年已先留过一手供读后手'),
          once: true
        });
        if (season.id === 'autumn' && xun === 2) A.push({
          id: 'h_autumn_mid_packet',
          name: '先把秋中馆账脚费与租路饭钱分开',
          cost: 1,
          eff: '铜钱-65·催账+1·通融+1·备役+1·家族+1',
          desc: '秋定租到了中旬，最怕旧馆润笔、租路饭钱、回话脚费与锅火差钱一起挤同一口现钱。先把这层秋中细账拆开，秋后馆钱就不必刚回到眼前，又立刻被租路和家用一把吃空。',
          can: S.铜钱 >= 65,
          why: S.铜钱 >= 65 ? '' : '铜钱不足65文',
          once: true
        });
        if (season.id === 'autumn' && xun === 3) A.push({
          id: 'h_autumn_tail_packet',
          name: '先把秋尾回签与炭脚回礼分开',
          cost: 1,
          eff: '铜钱-60·催账+1·通融+1·家族+1',
          desc: '秋定租到了下旬，最怕学生家秋尾回签、炭脚锅火、小回礼与来春帖路后手一起冒头。先把这层尾账拆开，冬里才不必再拿来春帖费去垫秋尾余账。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id !== 'spring' && xun >= 2) A.push({ id: 'h_exam_split', name: splitName, cost: 1, eff: splitEffect, desc: splitDesc, can: S.铜钱 >= splitCost, why: S.铜钱 >= splitCost ? '' : ('铜钱不足' + splitCost + '文'), once: true });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、税则、租谷与差钱抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把塾师、保结旧识、兄房与乡里谁肯替这一房说话坐实，不让名色只停在牌面上。', can: (S.本年户通融 || 0) < 2, once: true });
        A.push({ id: 'h_hire', name: hireName, cost: 1, eff: '铜钱-300·田面不至空转', desc: '先花钱顾住田面，别让“分得了田”变成忙完馆账回头只剩一地荒账。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口润笔补差钱', cost: 1, eff: side.effect, desc: '当户这一年照样得找现钱。哪怕只是多接一层润笔、抄写或零活，也是在给锅火、租路和差钱添后手。', can: true });
        if (season.id === 'winter' && xun === 1) A.push({
          id: 'h_winter_packet',
          name: '先把旧馆回话与灯油炭火分开',
          cost: 1,
          eff: '铜钱-60·催账+1·通融+1·家族+1',
          desc: '冬应役刚起头时，最怕旧馆回话、灯油炭火、递帖脚费与来春开馆口风抢同一口钱。先把这层碎账拆开，年关第一旬才不至只剩“有名色但没后手”。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id === 'winter' && xun === 1) A.push({
          id: 'h_winter_school_packet',
          name: hasSchoolChildren ? '先把冬头灯课纸包与旧馆门包分开' : '先把冬头灯课纸包后手分开',
          cost: 1,
          eff: hasSchoolChildren ? '铜钱-55·催账+1·供读+1·通融+1·家族+1' : '（眼下无子女，不必另留灯课纸包）',
          desc: hasSchoolChildren
            ? '冬应役刚起头时，最怕孩子灯课纸包、炭笔小钱、旧馆门包与锅火后手一起挤同一口现钱。先把这层冬头课纸拆开，年关第一旬就不至只顾旧馆门路和灯炭，连家里下一口读写后手也压回了同一年。'
            : '眼下这一房还没有需要续灯课纸包的孩子，这层冬头读写后手暂时还落不到真账里。',
          can: hasSchoolChildren && S.铜钱 >= 55 && (S.本年户供读 || 0) < 1,
          why: !hasSchoolChildren ? '眼下尚无需要续灯课纸包的孩子'
            : ((S.本年户供读 || 0) < 1 ? (S.铜钱 >= 55 ? '' : '铜钱不足55文') : '这一年已先留过一手供读后手'),
          once: true
        });
        if (season.id === 'winter' && xun === 2) A.push({
          id: 'h_winter_mid_packet',
          name: '先把冬中帖路与旧馆门包分开',
          cost: 1,
          eff: '铜钱-55·催账+1·通融+1·家族+1',
          desc: '冬应役到了中旬，最怕旧馆回话、递帖门包、来春纸样与乡里递话脚费一起抢同一口钱。先把这层小耗拆开，翻总账时才不至让明春门路先断。',
          can: S.铜钱 >= 55,
          why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
          once: true
        });
        if (season.id === 'winter' && xun === 2) A.push({
          id: 'h_winter_mid_copy',
          name: hasSchoolChildren ? '先把冬中馆札与孩子炭笔分开' : '先把冬中馆札与来春纸样分开',
          cost: 1,
          eff: hasSchoolChildren ? '铜钱-50·催账+1·备役+1·供读+1·家族+1' : '铜钱-50·催账+1·备役+1·家族+1',
          desc: hasSchoolChildren
            ? '冬应役到了中旬，最怕旧馆回札、孩子来春炭笔、递话脚费与锅火后手一起抢同一口钱。先把这层馆札细账拆开，举业路这年冬中才不至一面续门路、一面把家里下一口读写后手拖到年后。'
            : '冬应役到了中旬，最怕旧馆回札、来春纸样、递话脚费与锅火后手一起抢同一口钱。先把这层馆札细账拆开，举业路这年冬中才不至把明春帖样又拖成一句“年后再说”。',
          can: S.铜钱 >= 50,
          why: S.铜钱 >= 50 ? '' : '铜钱不足50文',
          once: true
        });
        if (season.id === 'spring' && xun === 3) A.push({
          id: 'h_spring_tail',
          name: '先把春尾馆账与香纸脚费分开',
          cost: 1,
          eff: '铜钱-60·催账+1·备役+1·家族+1',
          desc: '春分书到了下旬，最怕旧馆回话、清明香纸、回馆脚费与差钱后手一起拖到夏里。先把这口小钱拆开，立户第一季末才不至又被碎账咬回去。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id === 'winter' && xun === 3) A.push({
          id: 'h_winter_tail',
          name: '先留来春帖费与开馆脚路',
          cost: 1,
          eff: '铜钱-60·通融+1·备役+1·家族+1',
          desc: '冬应役到了下旬，最怕把来春帖费、开馆脚路、学生家回话与眼前锅火都拖到年后再说。先把这口后手拆开，举业路明春第一程才不至刚开春就先断线。',
          can: S.铜钱 >= 60,
          why: S.铜钱 >= 60 ? '' : '铜钱不足60文',
          once: true
        });
        if (season.id === 'winter' && xun === 3) A.push({
          id: 'h_winter_receipt',
          name: '先把年下馆信与孩子帖样分开',
          cost: 1,
          eff: '铜钱-55·催账+1·通融+1·家族+1',
          desc: '冬应役到了下旬，最怕旧馆回信、孩子来春帖样、递话门包与锅火后手一起压上来。先把这层年下馆信拆开，来春开馆与家里续帖样就不必再抢今冬这一口现钱。',
          can: S.铜钱 >= 55,
          why: S.铜钱 >= 55 ? '' : '铜钱不足55文',
          once: true
        });
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年这一口身子也是账本的一部分，别把年关应役前先熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var exemptSet = false;
        var copySettled = false;
        var bookCost = season.id === 'winter' ? 50 : 40;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_copy_mid':
              S.铜钱 += 160;
              S.本年户催账 += 1;
              if (season.id === 'winter') S.本年户备役 += 1;
              copySettled = true;
              pushHouseholdSeasonTag(season.name + '结回馆账');
              log.push(['你在' + stepLabel + '把塾馆、代写与抄契的钱先拢回这一房：铜钱+160' + (season.id === 'winter' ? '、备役后手+1' : '') + '。不是凭空添一笔，只把识字底子真正换回现钱。', 'good']);
              actionCount += 1;
              break;
            case 'h_exempt':
              exemptSet = true;
              S.本年户备役 += 1;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('名色缓派');
              log.push(['你在' + stepLabel + '把生员/优免这层名色真压进了这一任差役后手里：它没有凭空生钱，却替这一房少吃了一层制度外流。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_packet':
              if (spendCopper(55)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春头帖样');
                log.push(['你在' + stepLabel + '先把阄书抄样、拜帖脚费、旧馆回话与给保结递话的小门包分开：铜钱-55、催账+1、通融+1、家族+1。举业路立户开春第一旬最细、也最容易被一句“读过书总会有人认”带过去的那层小耗，总算先被你压回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春头帖样与旧馆脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_school_packet':
              if (hasSchoolChildren && spendCopper(50)) {
                S.本年户供读 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春头课纸');
                log.push(['你在' + stepLabel + '先把孩子春课纸包、炭笔碎钱、保结帖脚与旧馆递话门包分开：铜钱-50、供读后手+1、通融+1、家族+1。举业路立户开年第一旬终于不只顾自己名色，连家里下一口读写后手也被你压回了同一年。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把孩子春课纸包与保结帖脚分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_spring_mid_packet':
              if (spendCopper(60)) {
                S.本年户核账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春中税香');
                log.push(['你在' + stepLabel + '先把税则抄手、清明香纸、租账脚费与给保结递话的小门包分开：铜钱-60、核账+1、通融+1、家族+1。举业路开春中旬这层“制度、家里和门路一起先来挤钱”的碎账，总算先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春中税则与清明香纸分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_exam_lease':
              S.委托营生 = '书户分得薄田出佃';
              S.委托租谷 = Math.max(S.委托租谷, 1);
              S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
              S.本年户委托 += 1;
              pushHouseholdSeasonTag('书户租账');
              log.push(['你在' + stepLabel + '先把分得薄田立成租账：年租谷+1。举业路的人不必硬把身子摁回田里，但这 4 亩也终于开始替这一房回粮。', 'good']);
              actionCount += 1;
              break;
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把纳银代役的现钱坐实：白银-2。年关真轮到这一房时，就不至只剩硬扛。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留纳银代役现钱，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_packet':
              if (spendCopper(70)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('夏馆纸香');
                log.push(['你在' + stepLabel + '先把伏夏潮纸、馆里茶汤、学生家回话脚费与家里凉药分开：铜钱-70、催账+1、通融+1、家族+1。举业路伏夏第一旬最细、也最会磨薄门路的那层小耗，总算先被你压回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏潮纸与学生家回话分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_soup':
              if (spendCopper(60)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.体魄 += 2;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏馆汤');
                log.push(['你在' + stepLabel + '先把馆里茶汤、凉药、递话门包与家里伏热小耗分开：铜钱-60、催账+1、通融+1、体魄+2、家族+1。举业路伏夏上旬最容易把门路、人情和身子一起磨薄的那层馆汤小账，这回先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把伏夏馆汤与凉药门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_surety':
              if (spendCopper(65)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('伏夏保结');
                log.push(['你在' + stepLabel + '先把保结薄礼、学生家回签、租帖脚费与锅火凉药分开：铜钱-65、催账+1、通融+1、备役+1、家族+1。举业路夏催账中旬最容易被“还认不认你”与“这一房还过不过得下去”一起磨薄的那层细账，总算先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把保结薄礼与租帖脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_summer_tail_packet':
              if (spendCopper(55)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('夏尾馆信');
                log.push(['你在' + stepLabel + '先把旧馆回信、秋前纸样、学生家递话脚费与锅火凉药分开：铜钱-55、催账+1、通融+1、家族+1。夏催账到了下旬，举业路这层“伏夏账未净、秋前门路已先来问”的尾账，总算先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把夏尾馆信与秋前纸样分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_packet':
              if (spendCopper(75)) {
                S.本年户催账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋帖回话');
                log.push(['你在' + stepLabel + '先把秋帖回话、回馆脚费、保结口风与锅火后手分开：铜钱-75、催账+1、备役+1、家族+1。秋定租开头最容易被一句“等回话”拖住的那层细账，这回先落回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋帖回话与回馆脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_school_roll':
              if (spendCopper(70)) {
                S.本年户供读 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋里供读');
                log.push(['你在' + stepLabel + '先把孩子夹衣、来春纸包、递话脚费与锅火小耗分开：铜钱-70、供读后手+1、通融+1、家族+1。举业路当户到了秋头，不再只剩秋帖回话和应役后手，连家里下一口读写也开始在同一年里占一席。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把孩子秋衣与来春纸包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_mid_packet':
              if (spendCopper(65)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋中馆脚');
                log.push(['你在' + stepLabel + '先把旧馆润笔、租路饭钱、回话脚费与锅火差钱分开：铜钱-65、催账+1、通融+1、备役+1、家族+1。秋定租到了中旬，举业路这层“馆账刚回到眼前、租路和家用又先来追钱”的细账，总算先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋中馆账脚费与租路饭钱分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_autumn_tail_packet':
              if (spendCopper(60)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('秋尾帖脚');
                log.push(['你在' + stepLabel + '先把秋尾回签、炭脚锅火、学生回礼与来春帖路后手分开：铜钱-60、催账+1、通融+1、家族+1。秋定租到了下旬，举业路这层“秋账未净、明春门路已先来要钱”的尾账，总算先被你拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把秋尾回签与炭脚回礼分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_exam_split':
              if (spendCopper(splitCost)) {
                S.家族 += 1;
                S.本年户备役 += 1;
                if (season.id === 'winter') S.本年户催账 += 1;
                pushHouseholdSeasonTag(season.name + '拆账');
                log.push([season.id === 'summer'
                  ? ('你在' + stepLabel + '先把伏夏润笔拆作凉药、纸墨与差钱后手：铜钱-' + splitCost + '、家族+1、备役后手+1。现钱没变多，却没再让暑热把门路和锅火一起磨穿。')
                  : (season.id === 'autumn'
                    ? ('你在' + stepLabel + '把秋馆钱先拆进锅火、脚费与差钱：铜钱-' + splitCost + '、家族+1、备役后手+1。秋后这口钱不再被误写成“终于宽了”。')
                    : ('你在' + stepLabel + '先把馆钱分作来春纸墨、灯油与锅火：铜钱-' + splitCost + '、家族+1、备役后手+1。年关最磨人的那层碎账，这次先被你拆开了。')), 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把馆钱拆作锅火、差钱与纸墨，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_literate':
              if (spendCopper(bookCost)) {
                S.本年户核账 += 1;
                pushHouseholdSeasonTag(season.name + '核账');
                log.push(['你在' + stepLabel + '先把分书、税则、租谷和差钱抄清：铜钱-' + bookCost + '。识字不是加分，而是少让这一房白吃一层糊涂账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先抄清分书与税则，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('保结通气');
              log.push(['你在' + stepLabel + '先把塾师、保结旧识与乡里的人情面压实：家族+2。到冬里真轮值时，至少不是独自回乡吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得人在写账、田在乡里却白荒一季。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '雇工顾住田面，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(season.name + '贴家');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_spring_tail':
              if (spendCopper(60)) {
                S.本年户催账 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('春尾馆账');
                log.push(['你在' + stepLabel + '先把春尾馆账、香纸脚费与回馆脚路分开：铜钱-60、催账+1、备役+1、家族+1。立户第一季末那层最容易被拖到夏里的碎账，总算先落回了真账。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把春尾馆账与香纸脚费分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_tail':
              if (spendCopper(60)) {
                S.本年户通融 += 1;
                S.本年户备役 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾笔炭');
                log.push(['你在' + stepLabel + '先把来春帖费、开馆脚路、学生家回话与锅火分开：铜钱-60、通融+1、备役+1、家族+1。冬尾最细、也最会拖断明春门路的那层碎账，总算先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先留来春帖费与开馆脚路，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_receipt':
              if (spendCopper(55)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬尾馆信');
                log.push(['你在' + stepLabel + '先把旧馆回信、孩子来春帖样、递话门包与锅火后手分开：铜钱-55、催账+1、通融+1、家族+1。冬尾最怕“旧馆还有回音、孩子明春也得续帖样”这两层小账一起挤钱，这回先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把年下馆信与孩子帖样分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_packet':
              if (spendCopper(60)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬馆灯炭');
                log.push(['你在' + stepLabel + '先把旧馆回话、灯油炭火、递帖脚费与来春开馆口风分开：铜钱-60、催账+1、通融+1、家族+1。举业路年关第一旬那层最会偷吃现钱的门路碎账，总算先被你拆回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把旧馆回话与灯油炭火分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_school_packet':
              if (hasSchoolChildren && spendCopper(55)) {
                S.本年户催账 += 1;
                S.本年户供读 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬头课纸');
                log.push(['你在' + stepLabel + '先把孩子灯课纸包、炭笔小钱、旧馆门包与锅火后手分开：铜钱-55、催账+1、供读+1、通融+1、家族+1。举业路当户到了年关第一旬，不再只顾旧馆门路和灯炭，连家里下一口读写后手也被你压回了同一年。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬头灯课纸包与旧馆门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_mid_packet':
              if (spendCopper(55)) {
                S.本年户催账 += 1;
                S.本年户通融 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中帖路');
                log.push(['你在' + stepLabel + '先把旧馆回话、递帖门包、来春纸样与乡里递话脚费分开：铜钱-55、催账+1、通融+1、家族+1。冬应役中旬最会把“旧馆还认不认你”和“明春还能不能接得上”混成一口现钱的那层小耗，这回先被你拆开了。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中帖路与旧馆门包分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_winter_mid_copy':
              if (spendCopper(50)) {
                S.本年户催账 += 1;
                S.本年户备役 += 1;
                if (hasSchoolChildren) S.本年户供读 += 1;
                S.家族 += 1;
                pushHouseholdSeasonTag('冬中馆札');
                log.push(['你在' + stepLabel + '先把旧馆回札、' + (hasSchoolChildren ? '孩子来春炭笔、' : '来春纸样、') + '递话脚费与锅火后手分开：铜钱-50、催账+1、备役+1' + (hasSchoolChildren ? '、供读+1' : '') + '、家族+1。冬应役中旬最怕“旧馆还有回音、孩子明春也要续读写后手”一起挤同一口现钱，这回先被你压回了这一旬。', 'good']);
                actionCount += 1;
              } else {
                log.push(['想在' + stepLabel + '先把冬中馆札与' + (hasSchoolChildren ? '孩子炭笔' : '来春纸样') + '分开，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              }
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先缓口气，把身子留到冬里应役前：体魄+5。', 'good']);
              actionCount += 1;
              break;
          }
        });
        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);
        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          spring: {
            handledIds: ['h_copy_mid', 'h_exempt', 'h_literate', 'h_clan', 'h_spring_packet', 'h_spring_school_packet'],
            doneTag: '分书碎费已理',
            doneLog: '〔分书碎费〕分书抄手、拜帖脚费、塾师回话与税则纸耗已被你先理清；春分书这一旬没再把第一口现钱先磨薄。',
            cost: 40,
            costTag: '分书碎费',
            costLog: '〔分书碎费〕分书抄手、拜帖脚费与塾师回话小耗一起冒头：铜钱-{cost}。不是大账，却正是春分书最先咬人的那层细钱。',
            failTag: '分书硬扛',
            failLog: '〔分书碎费〕这一旬连分书抄手和拜帖脚费都腾挪不开，只得先硬顶过去；这一房刚立户，人情面先薄了一线（家族-1）。',
            hardship: 'clan'
          },
          springMid: {
            handledIds: ['h_exam_lease', 'h_literate', 'h_clan', 'h_spring_mid_packet'],
            doneTag: '税则回话已理',
            doneLog: '〔税则回话〕税则抄手、租账脚费与给保结递话的小脚费已被你先分开；春分书的中旬不再只剩“名色和薄田摆一起看”，而是真把制度碎账压回了这一旬。',
            cost: 45,
            costTag: '税则回话',
            costLog: '〔税则回话〕税则抄手、租账脚费和给保结递话的小脚费一起要钱：铜钱-{cost}。不是大账，却正把举业路当户这一年的制度碎费往前拖出来。',
            failTag: '税则回话硬顶',
            failLog: '〔税则回话〕这一旬连税则抄手和递话脚费都腾挪不开，只得先硬顶过去；刚立户时这层名色回话又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          springLower: {
            handledIds: ['h_copy_mid', 'h_side', 'h_spring_tail', 'h_clan'],
            doneTag: '春尾馆账已理',
            doneLog: '〔春尾馆账〕旧馆回话、清明香纸、回馆脚费与差钱后手已被你先分开；春分书到了下旬，不再把“馆账明明还在路上”拖成下一季的空等。',
            cost: 50,
            costTag: '春尾馆账',
            costLog: '〔春尾馆账〕旧馆回话、清明香纸、回馆脚费和差钱小耗一起要钱：铜钱-{cost}。不是大账，却正把举业路当户开春最尾上那层碎账重新拖回了真账。',
            failTag: '春尾馆账硬顶',
            failLog: '〔春尾馆账〕这一旬连香纸和回馆脚费都腾挪不开，只得先硬顶过去；立户第一季末这层门路又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          summer: {
            handledIds: ['h_copy_mid', 'h_exempt', 'h_rest', 'h_literate', 'h_clan', 'h_side', 'h_exam_split', 'h_summer_packet', 'h_summer_soup', 'h_summer_surety'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把纸墨、凉药、馆账、保结薄礼和家里锅火顾住了；识字底子没有再被伏夏杂耗一点点磨空。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕纸墨、凉药、馆账碎费、保结小礼和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是举业路当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连纸墨、凉药和保结薄礼都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          summerLower: {
            handledIds: ['h_summer_tail_packet', 'h_exam_split', 'h_literate', 'h_side', 'h_rest'],
            doneTag: '夏尾馆信已理',
            doneLog: '〔夏尾馆信〕旧馆回信、秋前纸样、学生家递话脚费与锅火凉药已被你先分开；夏催账到了下旬，也不再把“伏夏还没收干净、秋前门路已先来追钱”混成一口现钱。',
            cost: 45,
            costTag: '夏尾馆信',
            costLog: '〔夏尾馆信〕旧馆回信、秋前纸样、学生家递话脚费与锅火凉药一起要钱：铜钱-{cost}。不是大账，却正把举业路当户伏夏下旬那层最容易被一句“秋里再说”拖过去的尾账重新压回真账。',
            failTag: '夏尾馆信硬顶',
            failLog: '〔夏尾馆信〕这一旬连旧馆回信和秋前纸样都腾挪不开，只得先硬顶过去；伏夏尾声这层学生家与旧馆门路又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          autumnUpper: {
            handledIds: ['h_autumn_packet', 'h_side', 'h_pay', 'h_copy_mid', 'h_exempt', 'h_clan'],
            doneTag: '秋帖回话已理',
            doneLog: '〔秋帖回话〕秋帖、保结回话、回馆脚费与锅火后手已被你先分开；秋定租的头一旬不再只剩一句“等回话”，而是真把门路摩擦压回了同一年里。',
            cost: 45,
            costTag: '秋帖回话',
            costLog: '〔秋帖回话〕拜帖、保结回话、回馆脚费与锅火零用一起要钱：铜钱-{cost}。不是大账，却正把举业路秋头最容易被拖成空等的那层小耗重新压回了这一旬。',
            failTag: '秋帖回话硬顶',
            failLog: '〔秋帖回话〕这一旬连回馆脚费和拜帖薄礼都腾挪不开，只得先硬顶过去；秋头这层名色门路又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          autumn: {
            handledIds: ['h_pay', 'h_copy_mid', 'h_clan', 'h_exam_lease', 'h_side', 'h_literate', 'h_exam_split', 'h_autumn_packet', 'h_autumn_mid_packet'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋后馆课、租谷、锅火与差钱已被你先拆开；润笔与抄写钱这旬没再被误写成宽裕。',
            cost: 70,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕秋后纸墨、馆课碎费和锅火差钱一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房在人情面上更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          autumnLower: {
            handledIds: ['h_exam_split', 'h_autumn_tail_packet', 'h_side', 'h_rest'],
            doneTag: '秋尾帖脚已理',
            doneLog: '〔秋尾帖脚〕秋尾回签、炭脚锅火、学生回礼与来春帖路后手已被你先分开；秋定租到了下旬，不再只剩“把馆钱拆一下”，连举业路自己那层秋尾门路碎账也先压回了这一旬。',
            cost: 50,
            costTag: '秋尾帖脚',
            costLog: '〔秋尾帖脚〕秋尾回签、炭脚锅火、学生回礼与来春帖路后手一起要钱：铜钱-{cost}。不是大账，却正把举业路当户秋尾那层“秋账未净、明春门路先来”的尾账重新拖回真账。',
            failTag: '秋尾帖脚硬顶',
            failLog: '〔秋尾帖脚〕这一旬连秋尾回签和炭脚锅火都腾挪不开，只得先硬顶过去；秋尾这层学生家与旧馆门路又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_exempt', 'h_copy_mid', 'h_pay', 'h_literate', 'h_side', 'h_rest', 'h_exam_split', 'h_winter_packet', 'h_winter_school_packet'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕旧馆账、明春纸墨、灯油炭火与差钱已被你先分开；年关没再把同一口现钱重新搅混。',
            cost: 50,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、纸墨、炭火和来春第一口笔墨钱一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          },
          winterMid: {
            handledIds: ['h_copy_mid', 'h_side', 'h_rest', 'h_exam_split', 'h_winter_mid_packet', 'h_winter_mid_copy'],
            doneTag: '冬馆回话已理',
            doneLog: '〔冬馆回话〕旧馆回话、灯油纸墨、冬中馆札与给学生家递话的小脚费已被你先分开；冬应役中旬不再只剩翻总账，也把“人情怎么续到明春、家里读写后手怎么不断”一起压回了这一旬。',
            cost: 45,
            costTag: '冬馆回话',
            costLog: '〔冬馆回话〕旧馆回话脚费、灯油纸墨、冬中馆札与递话小礼一起要钱：铜钱-{cost}。不是大账，却正把年关前最容易被一句“回头再说”带过的笔墨门路和家内读写后手一起拖回真账。',
            failTag: '冬馆回话硬顶',
            failLog: '〔冬馆回话〕这一旬连回话脚费、灯油纸墨与冬中馆札都腾挪不开，只得先硬顶过去；举业路这层旧馆门路和家里读写后手又一起薄了一线（家族-1）。',
            hardship: 'clan'
          },
          winterLower: {
            handledIds: ['h_exam_split', 'h_copy_mid', 'h_winter_tail', 'h_winter_receipt', 'h_rest'],
            doneTag: '冬尾笔炭已理',
            doneLog: '〔冬尾笔炭〕来春帖费、开馆脚路、学生家回话与锅火炭钱已被你先分开；冬应役到了下旬，也不再把明春第一口笔墨门路拖到年后才慌着找。',
            cost: 55,
            costTag: '冬尾笔炭',
            costLog: '〔冬尾笔炭〕炭火、来春帖费、开馆脚路与学生家回话一起要钱：铜钱-{cost}。不是大账，却正把举业路当户冬尾最细、也最躲不开的那层碎账重新压回了这一旬。',
            failTag: '冬尾笔炭硬顶',
            failLog: '〔冬尾笔炭〕这一旬连炭火和来春帖费都腾挪不开，只得先硬顶过去；明春门路还没开，冬尾这层后手先薄了一线（家族-1）。',
            hardship: 'clan'
          }
        });
        if (season.id === 'spring' && xun === 1 && hasSchoolChildren) {
          if (picked.h_spring_school_packet || picked.h_spring_packet || picked.h_copy_mid || picked.h_clan || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '春头课纸已分');
            log.push(['〔春头课纸〕这一旬先把孩子春课纸包、炭笔碎钱、保结帖脚与旧馆递话门包分开了；举业路立户开年第一旬不再只顾自己名色，连家里读写后手也开始同年见光。', 'good']);
          } else if (spendCopper(30)) {
            pushHouseholdSeasonTag(stepLabel + '春头课纸');
            log.push(['〔春头课纸〕孩子春课纸包、炭笔碎钱、保结帖脚与旧馆递话门包一起要钱：铜钱-30。不是大账，却正把举业路当户春头那层“自己刚立住，家里读写已先追钱”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春头课纸硬顶');
            log.push(['〔春头课纸〕这一旬连孩子春课纸包和保结帖脚都腾挪不开，只得先硬顶过去；立户开年这层家里读写与保结口风又一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 1 && hasSchoolChildren) {
          if (picked.h_winter_school_packet || picked.h_winter_packet || picked.h_copy_mid || picked.h_rest || picked.h_literate) {
            pushHouseholdSeasonTag(stepLabel + '冬头课纸已分');
            log.push(['〔冬头课纸〕这一旬先把孩子灯课纸包、炭笔小钱、旧馆门包与锅火后手分开了；举业路当户到了年关第一旬，不再只顾旧馆门路和灯炭，连家里读写后手也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬头课纸');
            log.push(['〔冬头课纸〕孩子灯课纸包、炭笔小钱、旧馆门包与锅火后手一起要钱：铜钱-35。不是大账，却正把举业路当户冬头那层“旧馆还在回话、家里也得续灯课”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬头课纸硬顶');
            log.push(['〔冬头课纸〕这一旬连孩子灯课纸包和旧馆门包都腾挪不开，只得先硬顶过去；冬头这层旧馆与家里读写口风又一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_receipt || picked.h_winter_tail || picked.h_exam_split || picked.h_copy_mid || picked.h_rest) {
            pushHouseholdSeasonTag(stepLabel + '冬尾帖样已理');
            log.push(['〔冬尾帖样〕这一旬先把旧馆回信、孩子来春帖样、递话门包与锅火次序理开了；冬应役收束前不再只剩“留明春帖费”，连家里续帖样和旧馆回音这层细账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '冬尾帖样');
            log.push(['〔冬尾帖样〕旧馆回信、孩子来春帖样、递话门包与锅火后手一起要钱：铜钱-35。不是大账，却正把举业路当户冬尾那层“旧馆未断、家里也得续帖样”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '冬尾帖样硬顶');
            log.push(['〔冬尾帖样〕这一旬连旧馆回信脚费和孩子帖样都腾挪不开，只得先硬顶过去；冬尾这层旧馆与家里两头口风又一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'autumn' && xun === 1 && hasSchoolChildren) {
          if (picked.h_school_roll) {
            pushHouseholdSeasonTag(stepLabel + '秋里供读已理');
            log.push(['〔秋里供读〕这一旬先把孩子夹衣、来春纸包、递话脚费与锅火后手分开了；举业路当户到了秋头，不再只剩秋帖回话和锅火，连家里换季与读写后手也开始在同一年里见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '秋里供读');
            log.push(['〔秋里供读〕孩子夹衣、来春纸包、递话脚费与锅火小耗一起要钱：铜钱-35。不是大账，却正把举业路当户秋头那层“自己刚立住，孩子读写已来追钱”的细账重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋里供读硬顶');
            log.push(['〔秋里供读〕这一旬连孩子夹衣和来春纸包都腾挪不开，只得先硬顶过去；秋头这层家里换季与读写口风又一起紧了一线（家族-1）。', 'bad']);
          }
        }
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_spring_mid_packet || picked.h_exam_lease || picked.h_literate || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚已分');
            log.push(['〔春中香脚〕这一旬先把税则抄手、清明香纸、租账脚费与给保结递话的小门包分开了；举业路开春中段不再只剩“名色和薄田摆一起看”，连清明前后最躲不开的香脚与制度碎账也开始同年见光。', 'good']);
          } else if (spendCopper(35)) {
            pushHouseholdSeasonTag(stepLabel + '春中香脚');
            log.push(['〔春中香脚〕税则抄手、清明香纸、租账脚费与给保结递话的小门包一起要钱：铜钱-35。不是大账，却正把举业路当户春中那层“名色未稳、清明家用先来”的细摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '春中香脚硬顶');
            log.push(['〔春中香脚〕这一旬连清明香纸和递话脚费都腾挪不开，只得先硬顶过去；春分书刚到中段，这层名色、乡里与家里香火的口风就先紧了一线（家族-1）。', 'bad']);
          }
        }
        clampAttr('体魄');
        clampAttr('家族');
        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、税则与差钱亲手核清，最容易吃的就是“明明有识字底子，却仍在糊涂账里磨掉家底”。', 'bad']);
        if ((S.本年户催账 || 0) <= 0) log.push(['这一任当户你一整年都没把馆课、润笔与抄契钱真正结回这一房；举业路最容易吃的，正是“明明能写能抄，现钱却一直挂在外头”。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把分得薄田立成了租账，这一房从此不再只是嘴上“名下还有 4 亩”。', 'good']);
        else log.push(['这一任当户你始终没把分得薄田坐成租账；田还在名下，却还没开始真替这一房回口粮。', 'bad']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书碎费') >= 0; })) log.push(['这一任当户连分书抄手、拜帖脚费和塾师回话这层春头碎费都先摊回账里了；立户开年不再只剩一句“已经分过家”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春头帖样') >= 0; })) log.push(['这一任当户你先把阄书抄样、拜帖脚费、旧馆回话与保结门包压进了春分书上旬；举业路立户开年的第一口碎账终于也有了专属的年内密度。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春头课纸') >= 0; })) log.push(['这一任当户你还把孩子春课纸包、炭笔碎钱与保结帖脚压进了春分书上旬；举业路立户开年终于不只顾自己名色，连家里读写后手也从春头就开始在同一年里抢钱。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('税则回话') >= 0; })) log.push(['这一任当户你又把税则抄手、租账脚费和给保结递话的小脚费压进了春分书中旬；举业路的制度细账不再只在春头一句话带过。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中税香') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春中香脚') >= 0; })) log.push(['这一任当户你还把清明香纸、税则抄手、租账脚费与保结门包压进了春分书中旬；举业路开春中段终于也有了“生活与制度一起先来抢钱”的专属细账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('春尾馆账') >= 0; })) log.push(['这一任当户连春尾旧馆回话、香纸脚费和回馆脚路都先拆开了；举业路立户第一季末终于也像同一年里不断冒头的小事，而不再只等到夏里一起算。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('夏馆纸香') >= 0; })) log.push(['这一任当户你又把伏夏潮纸、馆里茶汤与学生家回话脚费压进了夏催账上旬；举业路的伏夏不再只剩“纸墨很费”，而开始像同一年里不断冒头的小耗。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏馆汤') >= 0; })) log.push(['这一任当户你还把馆里茶汤、凉药、递话门包与家里伏热小耗压进了夏催账上旬；举业路伏夏终于不只是纸墨细账，连身子与门路一起被暑气磨薄的那层真生活也开始在同一年里见光。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('夏尾馆信') >= 0; })) log.push(['这一任当户你又把旧馆回信、秋前纸样、学生家递话脚费与锅火凉药压进了夏催账下旬；举业路夏里终于不再只靠中旬那一下撑密度，连伏夏尾声也开始在同一年里持续咬人。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋帖回话') >= 0; })) log.push(['这一任当户你还把秋帖、保结回话与回馆脚费压进了秋定租上旬；秋头那层“回话还没落定、锅火已先要用”的制度摩擦，也终于被压回了同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋中馆脚') >= 0; })) log.push(['这一任当户你又把秋中馆账、租路饭钱、回话脚费与锅火差钱压进了秋定租中旬；举业路秋中终于不再只靠通用拆账撑着，而有了自己那层“馆账刚回、租路和家用先追钱”的同旬细账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾帖脚') >= 0; })) log.push(['这一任当户你又把秋尾回签、炭脚锅火、学生回礼与来春帖路后手拆进了秋定租下旬；举业路到秋尾也不再只靠通用拆账撑着，而是真有了自己的门路尾账。', 'good']);
        if (exemptSet || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('名色缓派') >= 0; })) log.push(['这一任当户你把生员/优免这层名色真正拿来顶过了一层制度外流；名色不再只是一行旧文案。', 'good']);
        if (copySettled || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('结回馆账') >= 0; })) log.push(['这一任当户你把“识字能补家计”写成了真钱，不再只是体面话。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('拆账') >= 0; })) log.push(['这一任当户你至少有一回把润笔或馆钱先拆进锅火、差钱与纸墨；举业路的当户也开始有了更细的年内流转。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬中帖路') >= 0; })) log.push(['这一任当户你又把冬中递帖门包、旧馆回话与来春纸样提前拆开；举业路的冬中不再只是翻总账，而是在同一年里继续替明春续门路。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬中馆札') >= 0; })) log.push(['这一任当户你还把冬中馆札、孩子来春炭笔与递话脚费压进了冬应役中旬；举业路年关前那层家内读写后手，终于也被你压回了同一年里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬馆灯炭') >= 0; })) log.push(['这一任当户连旧馆回话、灯油炭火和递帖脚费都在冬应役上旬先拆开了；举业路年关刚起头就开始有专属的细账摩擦，而不再只靠通用年关碎账代写。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬头课纸') >= 0; })) log.push(['这一任当户你还把孩子灯课纸包、炭笔小钱、旧馆门包与锅火后手压进了冬应役上旬；举业路到年关第一旬终于也不再只顾旧馆门路和灯炭，连家里读写这层冬头细账都开始同年见光。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬馆回话') >= 0; })) log.push(['这一任当户连旧馆回话、灯油纸墨与递话脚费都在冬应役中旬先拆开；举业路年关前那层“门路怎么续住”终于也成了同一年里的真细账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾笔炭') >= 0; })) log.push(['这一任当户又把冬尾炭火、来春帖费和开馆脚路先拆开了；举业路到年尾也终于不只是在等一个总账结果。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾馆信') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬尾帖样') >= 0; })) log.push(['这一任当户你又把旧馆回信、孩子来春帖样、递话门包与锅火后手压进了冬应役下旬；举业路到年尾终于不再只剩“留明春帖费”，连家里续帖样这层生活细账也开始同年见光。', 'good']);
        if ((S.本年户供读 || 0) > 0) log.push(['这一任当户你还给孩子夹衣、来春纸包或冬里炭笔另划了供读真账；举业路中年不再只顾自己名色和应役，连家里下一口读写后手也开始被压回同一年里。', 'good']);
        if ((S.本年户季务 || []).length <= 6) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);

        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.10, (S.本年户催账 || 0) * 0.05);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) risk -= 0.08;
        if (exemptSet || !!S.生员身份 || !!S.优免启用) risk -= 0.08;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if ((S.识字转业值 || 0) >= 2) risk -= 0.03;
        if ((S.本年户供读 || 0) > 0) risk -= 0.04;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        if (S.负债银 > 0) risk += 0.04;
        risk = Math.max(0.03, Math.min(0.85, risk));

        var levyP = risk * 0.75, ruinP = risk * 0.25, safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        var pct = Math.round(risk * 100);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          if ((S.委托租谷 || 0) > 0) S.委托待收租谷 = Math.max(S.委托待收租谷 || 0, S.委托租谷);
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        } else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        } else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
        curStage.next = 'elder';
        curStage.nextLabel = '步入老年 →';
      }
    };
  }

  function stageHousehold() {
    if (isFarmRouteState()) return stageFarmHousehold();
    if (isWageRouteState()) return stageWageHousehold();
    if (isApprenticeRouteState()) return stageApprenticeHousehold();
    if (isMerchantRouteState()) return stageMerchantHousehold();
    if (isCivilExamRouteState()) return stageExamHousehold();
    var hp = householdRoutePack();
    var seasonIdx = Math.max(1, Math.min(HOUSEHOLD_SEASONS.length, S.户季 || 1));
    var xun = Math.max(1, Math.min(3, S.户旬 || 1));
    var season = householdSeasonInfo(seasonIdx);
    var stepLabel = season.name + '·' + householdXunLabel(xun);
    var isYearEnd = seasonIdx >= HOUSEHOLD_SEASONS.length && xun >= 3;
    var nextSeason = isYearEnd ? null : (xun >= 3 ? householdSeasonInfo(seasonIdx + 1) : season);
    var canPay = S.白银 >= 2 && S.应役 !== '纳银代役';
    var eventTxt;
    if (season.id === 'spring' && xun === 1) eventTxt = '春分书的上旬最怕把“分家”误当成“这一任已经结完”。阄书、水口、差钱与谁肯替这一房说话，都得先拆开记。';
    else if (season.id === 'spring' && xun === 2) eventTxt = '春分书的中旬像第一次真把“另起一房”落到账里：旧账、清明脚费与家里锅火会先来咬钱。';
    else if (season.id === 'spring' && xun === 3) eventTxt = '春分书的下旬更像给夏前留后手：差钱、回话门包与小锅火，不能再拖到下一季才想起。';
    else if (season.id === 'summer' && xun === 1) eventTxt = '夏催账的上旬最怕暑气先把人和锅火一起磨薄；田面、差票与凉药脚费会抢同一口现钱。';
    else if (season.id === 'summer' && xun === 2) eventTxt = '夏催账的中旬像把“守家”和“跑里甲”一起拆开：只顾外头口风，家里就发虚；只顾锅火，年关又会追账。';
    else if (season.id === 'summer' && xun === 3) eventTxt = '夏催账的下旬更像给秋后和年关留后手：差钱、灯油和来春脚路，不能再等到冬里才想。';
    else if (season.id === 'autumn' && xun === 1) eventTxt = '秋定租的上旬最像看“脚路和口粮哪口先落袋”：催租、回话和锅火一起冒头，不会等你把总账翻完。';
    else if (season.id === 'autumn' && xun === 2) eventTxt = '秋定租的中旬看似仓里该宽一口，其实租路饭钱、差票脚费与家里零耗反而一起更急。';
    else if (season.id === 'autumn' && xun === 3) eventTxt = '秋定租的下旬更像把这一房真正坐稳：秋里回来的粮、钱与口风，得真写进账里，不能只停在“差不多”。';
    else if (season.id === 'winter' && xun === 1) eventTxt = '冬应役的上旬不是只看敢不敢扛，而是看这一年有没有先把差钱、人情与灯炭后手一层层垫起来。';
    else if (season.id === 'winter' && xun === 2) eventTxt = '冬应役的中旬最像翻总账：哪笔回话真落了、哪层乡里肯替你说话、哪口现钱先留住了，都在这一旬见真章。';
    else eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把旧账、差票、锅火与人情分开，都会在这一旬里一起现形。';
    return {
      title: '当户 · ' + season.name,
      label: '当户',
      next: isYearEnd ? 'elder' : 'household',
      nextLabel: isYearEnd ? '步入老年 →' : (xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →')),
      ap: 2,
      shock: false,
      commitLabel: isYearEnd ? '了这一任当户 →' : '收住这一旬当户账 →',
      note: '当户阶段的默认兜底口径也按“四季三旬”推进。分家、旧账、差钱与里甲人情，不再一口气结成“一次 4 点”，而要在同一年里逐旬拆开。〔均分与破家为制度事实，具体银额为占位〕' + (hp.note ? ' ' + hp.note : ''),
      narrative: season.actionLead + '你已<span class="em">' + S.年龄 + '岁</span>，正式立户。' + season.note + ' 这一旬不是把当户一次结掉，而是先把旧账、差钱和人情里最要紧的那两手坐实。',
      dossier: function () {
        return lifeDossier('当户默认兜底也按四季三旬｜户程=' + stepLabel + '｜应役=' + S.应役 + '｜本年户季务=' + ((S.本年户季务 || []).join(' / ') || '无') + (hp.dossier ? '｜' + hp.dossier : ''));
      },
      events: [
        { t: 'rel', tag: '[分家]', txt: '立阄书、品搭均分只是开始。真正难的是把这一房的旧账、差钱、人情与锅火在同一年里逐旬坐实。' },
        { t: 'rel', tag: '[' + season.name + ']', txt: season.note },
        { t: 'rel', tag: '[户账]', txt: eventTxt },
        hp.event,
        householdSeasonPulseEvent(season.id, xun)
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把当户这一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        if (canPay) A.push({ id: 'h_pay', name: season.id === 'winter' ? '纳银代役' : '先留纳银代役现钱', cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，等到冬里真轮到这一房时就不至把整年后手一起赔进去。', can: true, once: true });
        A.push({ id: 'h_literate', name: season.id === 'winter' ? '识字·对年关差钱' : '识字·亲核这一旬账册', cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、差票、锅火、水口与人情脚费抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: season.id === 'winter' ? '年关先托乡里说话' : '先托乡里与兄房通气', cost: 1, eff: '家族+2·乡里通气', desc: '先把谁肯替这一房说话坐实，到冬里就不至一口气全吃人情亏。', can: (S.本年户通融 || 0) < 2, once: true });
        A.push({ id: 'h_hire', name: season.id === 'autumn' || season.id === 'winter' ? '雇短工顾住秋后田面' : '雇工顾住田面', cost: 1, eff: '铜钱-300·田面不至空转', desc: '当户这一年照样要跑里甲与旧账，先花钱把田面顾住，少让这一房的根脚漏掉。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: season.id === 'winter' ? '再接一口零活补差钱' : '抽身贴补这一房', cost: 1, eff: side.effect, desc: S.家传手艺 > 0 && S.技艺 === '无' ? '当户这一年也要养家。你虽未另学成一门手艺，但家里留过的那层手艺底子，已经够你接些比纯打杂更熟的零活。' : '当户这一年也要现钱。哪怕只是多接一层零活，也是在给锅火与差钱添后手。', can: true });
        A.push({ id: 'h_rest', name: '将养身子', cost: 1, eff: '体魄+5', desc: '中年劳碌，别把身子先熬垮。', can: true });
        return A;
      },
      settle: function (log) {
        doInherit(log);
        var actionCount = 0;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });
        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'h_pay':
              if (spendSilver(2)) {
                S.应役 = '纳银代役';
                S.本年户备役 += 2;
                pushHouseholdSeasonTag('纳银代役');
                log.push(['你在' + stepLabel + '先把纳银代役的现钱坐实：白银-2。等到冬里真轮到这一房，就不至把整年后手一起赔进去。', 'good']);
                actionCount += 1;
              } else log.push(['想在' + stepLabel + '先留纳银代役现钱，但这一旬现银已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'h_literate':
              S.本年户核账 += 1;
              pushHouseholdSeasonTag(season.name + '核账');
              log.push(['你在' + stepLabel + '先把分书、差票与锅火账抄清。识字不是加分，而是少让这一房在糊涂账里白漏一层。', 'good']);
              actionCount += 1;
              break;
            case 'h_clan':
              S.家族 += 2;
              S.本年户通融 += 1;
              pushHouseholdSeasonTag('乡里通气');
              log.push(['你在' + stepLabel + '先把兄房、邻里与里甲的人情面压实：家族+2。到冬里真轮值时，至少不是独自去吃那层人情亏。', 'good']);
              actionCount += 1;
              break;
            case 'h_hire':
              if (spendCopper(300)) {
                S.本年户备役 += 1;
                pushHouseholdSeasonTag('雇工顾田');
                log.push(['你在' + stepLabel + '先花 300 文顾住田面，免得这一房“田还在名下，却白荒一旬”。', 'good']);
                actionCount += 1;
              } else log.push(['想在' + stepLabel + '雇工顾住田面，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'h_side':
              var side = sideHustleProfile();
              S.铜钱 += side.gain;
              S.最近农闲营生层级 = side.mode;
              S.最近农闲营生收益 = side.gain;
              pushHouseholdSeasonTag(season.name + '贴补');
              log.push(['你在' + stepLabel + '又抽身贴补这一房：' + (side.mode === '自有手艺' ? '凭自有手艺' : (side.mode === '家传手艺底子' ? '凭家传手艺底子接零活' : '打杂工')) + '，铜钱+' + side.gain + '。', 'good']);
              actionCount += 1;
              break;
            case 'h_rest':
              S.体魄 += 5;
              log.push(['你在' + stepLabel + '先将养身子：体魄+5。', 'good']);
              actionCount += 1;
              break;
          }
        });
        if (actionCount === 0) log.push(['这一旬你几乎没把任何实账坐下，当户这一年便更容易在年关前忽然一起撞账。', 'bad']);
        applySeasonalHouseholdFriction(log, stepLabel, season, xun, picked, {
          summer: {
            handledIds: ['h_hire', 'h_literate', 'h_clan', 'h_side', 'h_rest'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬你至少把锅火、水口或凉药草鞋里的一层顾住；伏夏损耗没有消失，但没再把身子与家计一并熬穿。',
            cost: 55,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕凉药、草鞋、水口与小脚费一齐冒头：铜钱-{cost}。不是大祸，只是当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连凉药草鞋钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_hire', 'h_literate', 'h_clan', 'h_side'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋里租路、差票、锅火与人情脚路已被你先拆开；“秋后总会宽一点”没有再被误写成自然发生。',
            cost: 65,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕催租差票、人情脚路与锅火碎用一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房的人情面更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_pay', 'h_literate', 'h_clan', 'h_side', 'h_rest'],
            doneTag: '年关碎账已分',
            doneLog: '〔年关碎账〕差钱、灯油、草鞋与来春第一口后手已被你先分开；年关没再把同一口现钱搅成一团。',
            cost: 45,
            costTag: '年关碎账',
            costLog: '〔年关碎账〕灯油、草鞋、来春后手定钱与小脚费一齐要钱：铜钱-{cost}。不是大账，却正是最磨人的年关小耗。',
            failTag: '年关硬顶',
            failLog: '〔年关碎账〕这一旬连年关碎用都挪不开，只得靠身子硬顶过去（体魄-1）。',
            hardship: 'body'
          }
        });
        clampAttr('体魄');
        clampAttr('家族');
        if (!isYearEnd) {
          if (xun >= 3) {
            S.户季 = seasonIdx + 1;
            S.户旬 = 1;
          } else {
            S.户旬 = xun + 1;
          }
          curStage.next = 'household';
          curStage.nextLabel = xun >= 3 ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + householdXunLabel(xun + 1) + ' →');
          return;
        }
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、旧账与差票亲手核清，最容易吃的就是“明明已经另起一房，却还是在糊涂账上再漏掉一层”。', 'bad']);
        if ((S.本年户通融 || 0) <= 0) log.push(['这一任当户你几乎没先替这一房压住乡里口风；等到轮差时，最容易发现“账是自己的，人情却还没坐稳”。', 'bad']);
        if ((S.本年户季务 || []).length <= 5) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);
        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if (S.应役 === '纳银代役') risk -= 0.14;
        if (S.家族 >= 60) risk -= 0.04;
        if (S.识字) risk -= 0.04;
        if (S.负债银 > 0) risk += 0.04;
        risk = Math.max(0.05, Math.min(0.85, risk));
        var pct = Math.round(risk * 100);
        var levyP = risk * 0.75;
        var ruinP = risk * 0.25;
        var safeP = 1 - risk;
        var r = rollProb([{ p: safeP, r: 'safe' }, { p: levyP, r: 'levy' }, { p: ruinP, r: 'ruin' }]);
        if (r === 'safe') {
          S.家族 += 5;
          if (!S.应役 || S.应役 === '未役') S.应役 = '平安应役';
          log.push(['〔当役了讫〕这一整年拆账后，赔累风险约 ' + pct + '%，你总算把这一任当户平稳压过：家族+5。', 'good']);
        } else if (r === 'levy') {
          S.铜钱 = Math.max(0, S.铜钱 - 1200);
          S.应役 = '赔累';
          log.push(['〔遭加派〕这一年虽先留了后手，赔累风险约 ' + pct + '%仍被命中：为解运垫赔，铜钱-1200。', 'bad']);
        } else {
          S.田亩 = Math.max(0, S.田亩 - 2);
          S.负债银 += 2;
          S.应役 = '破家';
          log.push(['〔当役破家〕这一任当户最后还是压成了制度账：失田2亩、负债+2两。不是你“不够努力”，而是这层风险本就会往个体头上塌。', 'bad']);
        }
      }
    };
  }
  // 分家均分结算（进入当户即自动发生一次）
  function doInherit(log) {
    if (S.分家) return;
    S.分家 = true;
    var inheritedDelegation = (S.委托营生 || '无') !== '无';
    var inheritedDelegationLabel = S.委托营生 || '无';
    var inheritedLeaseRent = Math.max(0, S.委托租谷 || 0);
    var inheritedPendingRent = Math.max(0, S.委托待收租谷 || 0);
    function pushInheritedDelegationCarryLog() {
      if (!inheritedDelegation && inheritedLeaseRent <= 0 && inheritedPendingRent <= 0) return;
      var parts = [];
      if (inheritedDelegation && inheritedDelegationLabel !== '无') parts.push('上一代留下的委托经营账“' + inheritedDelegationLabel + '”还挂在这一房名下');
      if (inheritedLeaseRent > 0) parts.push('年租谷仍按旧账记着' + inheritedLeaseRent + '石');
      if (inheritedPendingRent > 0) parts.push('另有待收租谷' + inheritedPendingRent + '石尚未结回');
      log.push([parts.join('，') + '；父故分家不会把这层旧账自动洗掉。若要改回自耕、另换代管或改写租账，得在这一任当户里自己动手。', 'good']);
    }
    S.存米 += 2; S.家族 += 4; S.口食田 = 1;
    if (isFarmRouteState()) {
      if (S.合爨状态 === '随兄合户') {
        log.push(['分家均分：先前一直随兄合爨，到父故这一步才把共账清开。你这一房照样分得应有那份田与口粮，只是多带着几年的合爨余绪一起立户。', 'good']);
        S.合爨状态 = '已析爨';
        if (!inheritedDelegation) S.委托营生 = '分得薄田自耕';
        pushInheritedDelegationCarryLog();
        return;
      }
      if (!inheritedDelegation) S.委托营生 = '分得薄田自耕';
      log.push([inheritedDelegation
        ? '分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你这一房眼下先带着上一代留下的委托经营账往后过，若要改回自耕或另换租账，得在这一任当户里自己改写。'
        : '分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你这一房眼下先把薄田按自耕账守住，往后若撑不住，再改写成出佃/换工的账。', 'good']);
      pushInheritedDelegationCarryLog();
      return;
    }
    if (isWageRouteState()) {
      if (S.合爨状态 === '随兄合户') {
        log.push(['分家均分：这些年先随兄合爨，父故后才把共账清开。你这时第一次把该归自己这一房的田与口粮真正写进独户账里，不再只是跟着兄户吃饭。', 'good']);
        S.合爨状态 = '已析爨';
        pushInheritedDelegationCarryLog();
        return;
      }
      log.push([inheritedDelegation
        ? '分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你这一房不是白纸得田，而是带着上一代已经挂着的委托经营账进这一步；若要改回自耕或另换租账，得在这一任当户里自己改写。'
        : '分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。这 4 亩是你前半生第一次真正攥到手里的田面：可改作自耕，也可另立租账，但无论怎么选，都不再只是“纯卖工”的账。', 'good']);
      pushInheritedDelegationCarryLog();
      return;
    }
    if ((S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') && (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商')) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。只是你人在城里，这 4 亩薄田更像待立约的租谷来路，不再是能日日亲耕的田面。', 'good']);
      pushInheritedDelegationCarryLog();
      return;
    }
    if (S.路线.indexOf('徽商') === 0 || S.累计回钱银 > 0 || S.累计反哺银 > 0 || S.商历练 > 0) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。你常年在外，这份田更接近“委托兄长/佃户代管后按账回租”的资产。', 'good']);
      pushInheritedDelegationCarryLog();
      return;
    }
    if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
      log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩。只是父账早被多年供读侵蚀过，这一份分到你手里，更显得薄。', 'good']);
      pushInheritedDelegationCarryLog();
      return;
    }
    log.push(['分家均分：品搭拈阄，分得存粮存米+2、家族+4；另立养老田1亩(口食田，不入可支配)', 'good']);
    pushInheritedDelegationCarryLog();
  }

  function elderRoutePack() {
    var pack = { note: '', dossier: '', event: null, negotiateAdj: 0, extraActions: [] };
    if (isFarmRouteState() || isWageRouteState()) {
      pack.note = isFarmRouteState()
        ? '留乡佃田一路到了晚年，真正托底的不是“曾经佃过田”，而是分家后那 4 亩薄田到底守成了自耕、还是改成了租谷。'
        : '雇工一路到了晚年，老来靠不靠得住，不看你年轻时卖过多少工，而看分家后这 4 亩薄田有没有真的替你挡住断炊。';
      if (S.定额佃状态 === '已立定额佃') pack.note += ' 早年那次“先押租、后议亲”的决定，到了老来仍会体现在你守薄田时更不陌生。';
      if (S.合爨状态 === '已析爨') pack.note += ' 先前合爨再析爨留下的那层共账缓冲，也会继续改写你如今向兄弟与子孙开口时的分寸。';
      if (isWageRouteState() && (S.婚配路径 === '先应差·外出佣工' || S.城里门路 > 0)) pack.note += ' 早年先应差再外出佣工攒下的那层旧牙口与城里熟识，到老来仍可能替你换回一点外头照应，不必只靠家里这口饭。';
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
      if (isWageRouteState() && (S.婚配路径 === '先应差·外出佣工' || S.城里门路 > 0 || S.雇身份 === '外出佣工' || S.雇工历练 >= 3)) {
        pack.negotiateAdj += 0.03;
      pack.note = '卖工一路到了晚年，看的是旧工路数还能不能继续回成真账：春里回话、伏夏工汤与药脚、秋头欠单、秋中锅火饭脚、秋尾草鞋工脚、冬头炭药回签、冬中回话、冬尾草鞋与来春工路，都会在同一年里一旬旬咬回来。';
        pack.extraActions.push({ id: 'e_wage_note_old', name: '先问旧工头与春里回话', cost: 1, eff: '铜钱-40·家族+1', desc: '先托旧工头把春里哪处还能留脚、哪笔旧工棚欠工先结、哪口回话该先递问清。钱还没回，但老来开春这层活路先不至两眼一抹黑。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
        pack.extraActions.push({ id: 'e_wage_spring_packet_old', name: '把春尾草鞋香纸拆作回话与盐药', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '春尾最怕草鞋、清明香纸、回话脚费和家里盐药一起冒头。先把这层小账拆开，卖工路晚景开春收束时就不必再让工棚门路和灶下锅火继续抢同一口现钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_wage_summer_soup_old', name: '先把伏夏工汤与草鞋药脚分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '伏夏刚起头时，最怕工棚茶汤、草鞋药脚、带话门包和家里凉药一起冒头。先把这层小钱拆开，热里就不必一边硬扛身子、一边还替旧工路数垫锅火钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_wage_bundle_old', name: '托旧工头捎凉药与布鞋', cost: 1, eff: '铜钱-90·家族+1·体魄+1', desc: '伏夏最怕人还想硬撑，凉汤药、布鞋和回乡带话脚费却先一起冒头。先托旧工头把最急的小物捎回来，身子和家里都少熬一层。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文', once: true });
        pack.extraActions.push({ id: 'e_wage_summer_tail_old', name: '先把夏尾回工信与秋前草料分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '伏夏收尾最怕旧工棚回话、秋前草料、递话脚费和过路药包一起冒头。先把这层小账拆开，卖工路晚景的夏尾就不必再把秋前后手一股脑拖进下一季。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
        pack.extraActions.push({ id: 'e_wage_receipt_old', name: '先抄秋工欠单与租路次序', cost: 1, eff: '铜钱-40·家族+1', desc: '秋头最怕“旧工头都说会结、佃路都说会回”，却没人说得清哪口该先催。先把欠工次序、租路口风和回乡脚单抄明，秋里的养老账才不至继续糊着走。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
        pack.extraActions.push({ id: 'e_wage_autumn_head_old', name: '先把秋头工签与夹衣药包分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋头最怕旧工头回签、夹衣药包、回乡门包和锅火小耗一起冒头。先把这层换季小账拆开，不让“秋里活路快有回音”这一口钱转眼就被身上穿用、药包和家里锅火先啃薄。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_wage_collect_old', name: '结回旧工棚欠工与回乡脚钱', cost: 1, eff: '铜钱+160~210·家族+1', desc: '趁秋里还走得动，把旧工棚压着的欠工、回乡脚钱和零碎食钱真正结回养老账。', can: true, once: true });
        pack.extraActions.push({ id: 'e_wage_autumn_mid_old', name: '先把秋中工签与锅火饭脚分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '秋中最怕旧工头回签、租路饭钱、回乡脚费和锅火小耗一起追着找钱。先把这层秋中小账拆开，结回来的旧欠工才不至一落袋就被锅火和脚路先磨薄。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
        pack.extraActions.push({ id: 'e_wage_autumn_tail_old', name: '先把秋尾锅火与回乡草鞋脚分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋尾最怕“欠工还没真到手，锅火和回乡草鞋先来要钱”。先把这层尾账拆开，不让卖工路晚景的秋尾顺手滚进冬里。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_wage_winter_head_old', name: '先把冬头炭药与旧工回签分开', cost: 1, eff: '铜钱-65·家族+1·体魄+1', desc: '冬头最怕旧工头回签、灯油炭火、年下药包和来春头程脚费一起冒头。先把这层冬头小账拆开，年关工礼和明春工路才不必继续抢同一口过冬钱。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
        pack.extraActions.push({ id: 'e_wage_gift_old', name: '先备旧工头薄礼与回话脚费', cost: 1, eff: '铜钱-70·家族+2·体魄+1', desc: '年关若把旧工头、工棚熟手和带话人的薄礼一并省掉，明春往往得从头求人。先把这层小钱记下，老路数才不至在冬里断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
        pack.extraActions.push({ id: 'e_wage_winter_reply_old', name: '先把冬中回话脚费与灯炭小钱分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬中最怕旧工头回话、灯炭小钱、来春草鞋定钱和递话门包一起冒头。先把这层小账拆开，年下就不必再拿同一口过冬钱四处堵漏。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_wage_winter_tail_old', name: '先把年下回签与来春草鞋分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '冬尾最怕年下回签、来春草鞋、递话门包和头程脚路一起压上来。先把这层冬尾小账拆开，卖工路晚景的最后一旬也不至只剩“明春再去问工”一句空话。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_wage_route_old', name: '先问明春工棚与头程脚路', cost: 1, eff: '铜钱-50·家族+1', desc: '趁年关旧工头还肯回话，先把明春哪处工棚肯留脚、哪口头程脚费得先留摸明。它不立刻变现，却能让来年不至重新瞎撞。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      }
    } else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      pack.note = '学徒一路到了晚年，看的是城中门路有没有坐实：留店、坐店工、跟货，都会改变你老来靠谁照应。养老不只剩“诸子养不养”，还要看旧掌柜肯不肯回话、伏夏铺药与夏尾回铺回签能不能先顾住、铺里旧脚钱与分得薄田的租谷回不回得来、来春回铺脚路有没有在今冬先留出来。';
      pack.dossier = '学徒去向=' + S.学徒去向 + '｜学徒历练=' + S.学徒历练 + '｜授艺度=' + S.学徒授艺度 + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜待收租谷=' + (S.委托待收租谷 || 0);
      pack.event = { t: 'rel', tag: '[旧识]', txt: '你年轻时若在城里站稳过，老来可托旧东家、旧同门、旧行口照应；若只是归乡另谋，养老结构就更接近普通薄田人家。学徒路真正磨人的，是铺里旧识、乡里租路与年关后手会在同一年里一层层往回咬。' };
      if (S.学徒去向 === '留店伙计') pack.negotiateAdj += 0.08;
      else if (S.学徒去向 === '店铺做工') pack.negotiateAdj += 0.05;
      else if (S.学徒去向 === '随行商') pack.negotiateAdj += 0.03;
      if (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') {
        pack.extraActions.push({ id: 'e_city', name: '托城中旧识照应', cost: 1, eff: '铜钱+180·家族+1', desc: '老来还能托城里旧东家或旧同行给些照应，不全靠家里硬扛。', can: true, once: true });
        pack.extraActions.push({ id: 'e_shop_spring_reply_old', name: '先把春中回铺回话与灯油盐药分开', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '春中最怕旧掌柜回话、回铺脚费、递话门包和家里灯油盐药一起冒头。先把这层春中小账拆开，旧铺口风与家里锅火就不必继续挤同一口现钱。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
        pack.extraActions.push({ id: 'e_shop_spring_packet_old', name: '先把春尾香纸抄手与回铺脚费分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '春尾最怕清明香纸、抄手纸费、回铺脚费和灶下锅火一起磨人。先把这层春尾小账拆开，伏夏铺药和年里门路才不至还没到就先被春尾挤薄。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
        pack.extraActions.push({ id: 'e_shop_summer_note_old', name: '先把伏夏回铺回签与茶汤药脚分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '伏夏刚起头，最怕旧掌柜回签、铺里茶汤、凉药脚费和递话门包一起来找钱。先把这层夏头小账拆开，学徒路晚景的身子、门路和锅火就不必一起硬扛。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_shop_bundle_old', name: '托旧同门捎布药针线', cost: 1, eff: '铜钱-90·家族+1·体魄+1', desc: '伏夏最怕人还撑得住，家里和自己却先缺布药、汗药与针线。先托旧同门把这层小物捎回去，少让铺里门路和家里锅火一起熬薄。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文', once: true });
        pack.extraActions.push({ id: 'e_shop_summer_tail_old', name: '先把夏尾回铺回签与秋前脚单分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '伏夏收尾最怕旧掌柜回签、秋前脚单、递话门包和过路药包一起冒头。先把这层夏尾小账拆开，不让学徒路晚景的秋前脚路又继续去挤同一口过夏钱。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
        pack.extraActions.push({ id: 'e_shop_autumn_note_old', name: '先把秋头回铺脚单与租路次序分开', cost: 1, eff: '铜钱-40·家族+1', desc: '秋头最怕“旧铺都说会回、佃路都说会到”，却没人说得清哪口该先催。先把回铺脚单、租路次序和递话口风抄明，秋里的养老账才不至句句都在等。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
        pack.extraActions.push({ id: 'e_shop_collect_old', name: '结回铺里旧脚钱', cost: 1, eff: '铜钱+160~220·家族+1', desc: '趁还走得动，把铺里旧脚钱、旧掌柜压着的零碎回款和替家里带回的话路结回来一点。', can: true, once: true });
        pack.extraActions.push({ id: 'e_shop_autumn_mid_old', name: '先把秋中铺账脚费与租路饭钱分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '秋中最怕旧铺脚钱刚结回手，租路饭钱、回话脚费和家里锅火又一起追着找钱。先把这层秋中小账拆开，秋尾和冬里的后手才不至继续堵在同一口现钱上。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
        pack.extraActions.push({ id: 'e_shop_autumn_tail_old', name: '先把秋尾锅火与回铺脚费分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋尾最怕回铺脚费、催单脚路、灯炭锅火和过路药包一起冒头。先把这层尾账拆开，不让学徒路晚景的秋尾顺手滚进冬里。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_shop_gift_old', name: '给旧掌柜留薄礼续门路', cost: 1, eff: '铜钱-80·家族+2·体魄+1', desc: '年关先把旧掌柜、同门与脚夫该给的薄礼留出来，顺带托回话与药引，别让明春还得从冷脸求人开始。', can: true, once: true });
        pack.extraActions.push({ id: 'e_shop_winter_reply_old', name: '先把冬中回铺回签与灯炭针线分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬中最怕旧掌柜回签、灯炭针线、脚夫门包和来春回铺脚单一起冒头。先把这层冬中小账拆开，年下客礼和来春铺路才不必继续拿同一口现钱四处堵漏。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
        pack.extraActions.push({ id: 'e_shop_winter_tail_old', name: '先把年下回铺回签与灯炭针线分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '冬尾最怕旧掌柜年下回签、灯炭针线、递话脚费和来春回铺脚单一起压来。先把这层冬尾小账拆开，别让旧铺回音和眼前锅火继续抢同一口过冬钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
        pack.extraActions.push({ id: 'e_shop_route_old', name: '先问来春回铺脚路与递话口风', cost: 1, eff: '铜钱-50·家族+1', desc: '趁年关旧掌柜和同门还肯回话，先把来春回铺脚路、递话薄礼与催佃回城的口风摸明。它不立刻变现，却能让明春第一旬不必重新瞎撞。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      }
    } else if (S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计回钱银 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0) {
      pack.note = '商路一路到了晚年，关键不只在旧账、分红和反哺名声能不能真的落回养老账，也在于春头样纸、春价回话、伏夏水脚与布药、秋后脚单与冬里熟号门路能不能一旬旬接住。';
      pack.dossier = '累计回钱=' + (S.累计回钱银 || 0) + '两｜累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜商身份=' + S.商身份 + '｜委托营生=' + S.委托营生;
      pack.event = { t: 'rand', tag: '[旧账]', txt: '商路上最怕的是老来还有账压在外头：你年轻时寄回家的银会被诸子记住，路上的旧账却未必能赶在身子垮前收齐。' };
      if (S.累计反哺银 >= 2) pack.negotiateAdj += 0.06;
      else if ((S.累计回钱银 || 0) >= 2) pack.negotiateAdj += 0.03;
      if (S.商路供读银 >= 1) pack.negotiateAdj += 0.04;
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'e_collect_old', name: '催回商路旧账', cost: 1, eff: '未回款→部分现银', desc: '趁还走得动，把商路上的旧账催回一部分作养老钱。', can: true, once: true });
      }
      pack.extraActions.push({ id: 'e_route_spring_head_old', name: '先把春头样纸与递话脚费分开', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '开春头一旬，熟号还只肯先递口风，样纸、递话脚费和家里灯油盐药却已一起要钱。先把这层春头小账拆开，议轮养和后头问春价时就不必先拿同一口现钱两头堵漏。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
      pack.extraActions.push({ id: 'e_route_price_old', name: '先问春价与旧账次序', cost: 1, eff: '铜钱-50·家族+1', desc: '先托熟号把春价、回话次序和哪笔旧账更该先动问清。钱还没回，但养老账先不至两头乱猜。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_route_spring_reply_old', name: '先把春中回签与样纸门包分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '春安顿到了中旬，最怕熟号回签、样纸门包、递话脚费和家里盐药一起冒头。先把这层春中小账拆开，春价还没坐实前，也不至让门路和锅火继续挤在同一口现钱里。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_route_spring_packet_old', name: '把春尾香纸拆作回话与盐药', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '春尾最怕清明香纸、回话脚费和家里盐药锅火一起挤上来。先把这层小账拆开，旧账还没真回到手时，家里和熟号也不至一齐空等。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_route_summer_note_old', name: '先把伏夏回签与凉药脚费分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '伏夏刚起头时，最怕上一程回签还没稳，熟号递话、凉药脚费和行栈茶钱就一起冒头。先把这层小钱拆开，后头捎布药与催旧账才不至拿同一口现钱四处堵漏。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_route_summer_wharf_old', name: '先把伏夏水脚与凉药门包分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '伏夏到了中旬，最怕熟号水脚、凉药门包、捎布脚费和家里茶汤一起冒头。先把这层中腰小账拆开，托熟号捎布药与回乡脚路就不必继续抢同一口现钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_route_bundle_old', name: '托熟号捎布药回家', cost: 1, eff: '铜钱-100·家族+2·体魄+1', desc: '伏夏不是只缺现银，也缺布、药和一口真能落到锅火边的小物。先托熟号把这一包捎回去，家里与身子都能少熬一层。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文', once: true });
      pack.extraActions.push({ id: 'e_route_summer_packet_old', name: '先把夏尾客签与秋前样纸分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '伏夏收尾最怕秋路未开，客签回话、秋前样纸、递话门包和过路药包却先一起找上门。先把这层秋前后手拆开，不让同一口现钱既顾夏尾锅火、又顾秋前脚路。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_route_receipt_old', name: '先抄旧账脚单与租路次序', cost: 1, eff: '铜钱-40·家族+1', desc: '秋后最怕“都说在路上，却不知道先催哪笔”。先把脚单、拖欠次序和租路回话抄明，后面的养老账才不至继续糊着走。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
      pack.extraActions.push({ id: 'e_route_autumn_note_old', name: '先把秋头回签与米脚锅火分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋头租谷刚起时，最怕熟号回签、米脚锅火和收租脚费一起冒头。先把这层头账拆开，秋中催旧账时才不必一边等回钱、一边让家里和熟号都空着。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_route_autumn_mid_old', name: '先把秋中回签与租路饭钱分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋中最怕熟号回签刚有回音，租路饭钱、递话脚费和家里锅火就先一起追着找钱。先把这层秋中回签拆开，不让“账说快回”的这口现钱还没落手，就先被回乡路费和锅火小耗挤薄。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_route_autumn_tail_old', name: '先把秋尾回话与锅火脚费分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋尾最怕“账说快回、锅火先紧”。先把回话脚费、催单脚路和锅火碎用拆开，不让这层尾账顺手滚进冬里。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_route_winter_medicine_old', name: '先把冬头炭药与熟号回签分开', cost: 1, eff: '铜钱-65·家族+1·体魄+1', desc: '冬头最怕炭米、年下药包、熟号回签与回话脚费一起冒头。先把这层小钱拆开，不让年关锅火和明春路数继续挤在同一口现钱上。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
      pack.extraActions.push({ id: 'e_route_guest_old', name: '先备熟号薄礼与回话脚费', cost: 1, eff: '铜钱-70·家族+1·体魄+1', desc: '年关若把熟号、脚夫和带话人的薄礼一并省掉，明春常常就得从头求人。先把这层小钱记下，门路才不至到冬里忽然断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
      pack.extraActions.push({ id: 'e_route_winter_reply_old', name: '先把冬中回话脚费与样纸定钱分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬中最怕熟号回话脚费、脚夫门包、来春样纸定钱和柜边回签门包一起冒头。先把这层回话碎账拆开，年下客礼和明春水脚才不必继续拿同一口现钱四处堵漏。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      if (S.商路供读银 >= 1) {
        pack.extraActions.push({ id: 'e_route_winter_school_old', name: '先把冬中供读底银与灯炭炭笔分开', cost: 1, eff: '铜钱-65·家族+1·体魄+1', desc: '冬中最怕孙辈炭笔、来春蒙馆定钱、灯炭药包和熟号回话脚费一起追钱。先把这层供读余绪拆开，商路一路攒下的供读底银就不必在晚景里被锅火和回话先吞掉。', can: S.铜钱 >= 65, why: S.铜钱 >= 65 ? '' : '铜钱不足65文', once: true });
      }
      pack.extraActions.push({ id: 'e_route_wharf_old', name: '托熟号问明春水脚', cost: 1, eff: '铜钱-50·家族+1', desc: '趁年关熟号还在，先把哪条水脚肯接、哪笔旧账还可缓一旬摸明。它不立刻变现，却能让来年不至从两眼一抹黑开始。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_route_winter_tail_old', name: '先把年下回签与来春样纸分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '冬尾最怕年下回签、来春样纸定钱、递话脚费和眼前锅火一起压上来。先把这层冬尾小账拆开，明春第一程和今冬家里口风才不必继续挤在同一口现钱上。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      if (S.商路供读银 >= 1) {
        pack.extraActions.push({ id: 'e_route_winter_school_tail_old', name: '先把冬尾供读帖样与年下锅火分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬尾最怕孙辈来春帖样、炭笔门包、年下锅火和熟号回签一起冒头。先把这层供读帖样拆开，不让家里读写后手和明春商路门路继续抢同一口过冬钱。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      }
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用) {
      pack.note = '举业一路到了晚年，看的是名色留下多少实际照应：生员能减一层外流，笔墨底子则更容易换来教馆、抄写和体面；更磨人的，是春头馆契、旧馆回话、伏夏馆汤、伏夏纸药、夏尾回签、秋初回签、秋中馆脚、秋尾回帖、秋尾炭脚、冬中馆札、年关帖礼与冬尾馆信会不会在同一年里一旬旬咬回来。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜优免=' + (S.优免启用 ? '启用' : '未启用') + '｜识字转业值=' + S.识字转业值;
      pack.event = { t: 'rel', tag: '[名色]', txt: S.生员身份 ? '名色到了晚年仍有余温：不必然给你现钱，却更容易让诸子和乡里愿意按体面来办。' : '若多年应举未成，老来能靠的不是“读过几年书”，而是这点笔墨底子能不能真换来教馆、抄写与照应。' };
      if (S.生员身份 || S.优免启用) pack.negotiateAdj += 0.10;
      else if (S.举业结局 === '屡试未第' && S.识字转业值 >= 2) pack.negotiateAdj += 0.04;
      if (S.生员身份 || (S.识字 && S.识字转业值 >= 2)) {
        pack.extraActions.push({ id: 'e_write_old', name: '凭笔墨换照应', cost: 1, eff: '铜钱+120·家族+2', desc: '老来仍可凭名色、笔墨或代书，换一点体面与照应。', can: true, once: true });
      }
      pack.extraActions.push({ id: 'e_tutor_spring_head_old', name: '先把春头馆契与灯油抄手分开', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '开春最怕旧馆回帖、抄手纸费、递话脚费和灯油锅火一起找钱。先把这层春头馆契拆开，轮养协商与旧馆口风才不至一开始就挤成同一口现钱。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
      pack.extraActions.push({ id: 'e_tutor_note_old', name: '先问旧馆回话与学生口风', cost: 1, eff: '铜钱-40·家族+1', desc: '春里先把旧馆还收不收人、学生家还认不认这层字面、哪张帖子该先递问清。钱没变多，但后头的馆账和帖子才不至一齐悬着。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
      pack.extraActions.push({ id: 'e_tutor_spring_reply_old', name: '先把春中帖样与回馆门包分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '春中最怕旧馆帖样、回馆门包、递话脚费和家里盐药一起冒头。先把这层帖样脚费拆开，春尾清明和夏头馆课才不至继续挤同一口现钱。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_tutor_spring_packet_old', name: '把春尾抄手拆作香纸与回馆脚费', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '春尾最怕抄手小钱、清明香纸和回馆脚费一起磨人。先把这层小账拆开，夏里就不必再拿灯油和锅火去替旧馆门路垫。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_tutor_summer_soup_old', name: '先把伏夏馆汤与潮纸脚费分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '伏夏刚起头时，最怕馆里茶汤、潮纸脚费、递话门包和家里凉药一起冒头。先把这层小账拆开，不让旧馆门路和锅火在夏头就先挤成一口钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_tutor_bundle_old', name: '把伏夏纸墨拆作凉药与回话脚费', cost: 1, eff: '铜钱-90·家族+1·体魄+1', desc: '伏夏最怕纸墨、凉药和递话脚费一起磨人。先把这层小账拆开，不让旧馆门路和身子一并熬薄。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文', once: true });
      pack.extraActions.push({ id: 'e_tutor_summer_tail_old', name: '先把夏尾回签与秋前纸样分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '伏夏收尾时，最怕学生家回签、秋前纸样、递话脚费和过路药包先来要钱。先把这层小账拆开，秋头就不必再拿同一口锅火钱去替旧馆门路垫。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_tutor_receipt_old', name: '先抄秋馆回签与租路次序', cost: 1, eff: '铜钱-40·家族+1', desc: '秋头最怕“学生家都说会回、佃户都说会到”，却没人说得清哪张回签该先盯、哪条租路该先跑。先把次序抄明，秋里才不至句句都在等。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
      pack.extraActions.push({ id: 'e_tutor_autumn_reply_old', name: '先把秋头馆帖与回礼门包分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '秋头最怕馆帖回话、学生家门包、租路小脚费和锅火一起找钱。先把这层秋头帖脚拆开，秋中结馆账时才不必再拿同一口现钱四处堵漏。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_tutor_collect_old', name: '结回旧馆润笔与抄手钱', cost: 1, eff: '铜钱+160~210·家族+1', desc: '趁秋里还走得动，把旧馆润笔、代写契纸和学生家拖着没回的那点笔墨钱真正拢回养老账。', can: true, once: true });
      pack.extraActions.push({ id: 'e_tutor_autumn_mid_old', name: '先把秋中馆账脚费与租路饭钱分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '秋中最怕旧馆润笔刚回到手，租路饭钱、回话脚费和家里锅火就一起追着找钱。先把这层秋中馆脚拆开，秋尾炭脚和冬里帖费才不至都来堵这一口现钱。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_tutor_autumn_tail_reply_old', name: '先把秋尾学生回帖与灯炭脚费分开', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '秋尾最怕学生家回帖、灯炭脚费、递话门包和锅火零用一起冒头。先把这层回帖小账拆开，冬里年关帖礼和来春帖费才不至又去挤同一口现钱。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
      pack.extraActions.push({ id: 'e_tutor_autumn_bundle_old', name: '把秋尾炭脚拆作锅火与学生回礼', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '秋尾最怕炭脚、锅火零用和学生家谢回小礼一起冒头。先把这层小账拆开，冬里就不必再拿来春帖费去垫秋尾余账。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_tutor_gift_old', name: '先备塾师薄礼与年关帖费', cost: 1, eff: '铜钱-70·家族+2·体魄+1', desc: '年关若把塾师、旧学生家和递帖人的薄礼一并省掉，明春常常就得从头求人。先把这层小钱记下，门路才不至到冬里忽然断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
      pack.extraActions.push({ id: 'e_tutor_winter_reply_old', name: '先把冬头馆信与灯炭脚费分开', cost: 1, eff: '铜钱-60·家族+1·体魄+1', desc: '冬头最怕旧馆回签、灯油炭火、年下药包和递帖脚费一起冒头。先把这层冬头馆信拆开，年关帖礼和来春帖费才不至继续挤同一口过冬钱。', can: S.铜钱 >= 60, why: S.铜钱 >= 60 ? '' : '铜钱不足60文', once: true });
      pack.extraActions.push({ id: 'e_tutor_winter_mid_old', name: '先把冬中馆札与孩子炭笔分开', cost: 1, eff: '铜钱-55·家族+1·体魄+1', desc: '冬中最怕旧馆回札、孩子炭笔、递话门包和守岁锅火一起冒头。先把这层冬中馆札拆开，不让旧馆门路与家里读写再继续抢同一口过冬钱。', can: S.铜钱 >= 55, why: S.铜钱 >= 55 ? '' : '铜钱不足55文', once: true });
      pack.extraActions.push({ id: 'e_tutor_post_old', name: '先留来春帖费与纸墨定钱', cost: 1, eff: '铜钱-50·家族+1', desc: '趁旧馆门路还热，先把来春递帖、回话和纸墨定钱分开。它不立刻回现钱，却能让明春第一旬不至从冷面递帖开始。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_tutor_winter_bundle_old', name: '把冬尾笔炭拆作守岁零用与学生回话', cost: 1, eff: '铜钱-45·家族+1·体魄+1', desc: '冬尾最怕炭药、守岁零用和学生家回话脚费一起冒头。先把这层小账拆开，让举业路晚景不必把明春口风又押回同一口过冬钱上。', can: S.铜钱 >= 45, why: S.铜钱 >= 45 ? '' : '铜钱不足45文', once: true });
      pack.extraActions.push({ id: 'e_tutor_winter_tail_note_old', name: '先把年下馆信与来春帖样分开', cost: 1, eff: '铜钱-50·家族+1·体魄+1', desc: '冬尾最怕旧馆年下回信、来春帖样、递话门包和守岁锅火一起冒头。先把这层冬尾馆信拆开，旧馆回音与家里续帖样就不必继续抢同一口过冬钱。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
    }
    var bridge = lifecycleInheritanceBridge();
    if (bridge.note) pack.note += (pack.note ? ' ' : '') + bridge.note;
    if (bridge.dossier) pack.dossier += (pack.dossier ? '｜' : '') + bridge.dossier;
    if (bridge.event) pack.event = bridge.event;
    return pack;
  }

  // ── 养老：拆成四季（春安顿/夏将养/秋结租/冬收束），让老年也有同年节奏 ──
  function stageElder() {
    var ep = elderRoutePack();
    var seasonIdx = Math.max(1, Math.min(ELDER_SEASONS.length, S.老季 || 1));
    var season = elderSeasonInfo(seasonIdx);
    var xun = Math.max(1, Math.min(3, S.老旬 || 1));
    var xunLabel = elderXunLabel(xun);
    var isSeasonEnd = xun >= 3;
    var isYearEnd = (season.id === 'winter') && isSeasonEnd;
    var nextSeason = isYearEnd ? null : elderSeasonInfo(Math.min(ELDER_SEASONS.length, isSeasonEnd ? (seasonIdx + 1) : seasonIdx));

    var events = [
      { t: 'rel', tag: '[季节]', txt: season.note + ' ' + season.actionLead },
      { t: 'rel', tag: '[养老]', txt: S.子数 > 0 ? '诸子就"谁出米、谁出工"各持立场——他们也有自己的妻儿要养，奉养须双方同意、镜像入各自账本。' : '无子可依，只能靠口食田薄租、自身积蓄，或变卖田产。' }
    ];
    if (ep.event) events.push(ep.event);

    return {
      title: '养老·' + season.name + '·' + xunLabel,
      label: '养老',
      next: isYearEnd ? 'death' : 'elder',
      nextLabel: isYearEnd
        ? '走向人生终点 →'
        : (isSeasonEnd
          ? ('转入' + nextSeason.name + '·上旬 →')
          : ('转入' + season.name + '·' + elderXunLabel(xun + 1) + ' →')),
      ap: (season.id === 'winter' ? 3 : 2),
      commitLabel: isSeasonEnd ? '了这一季养老账 →' : '收住这一旬养老账 →',
      note: '功能容量随龄下降，劳作让位于休息医药。奉养是与诸子协商的结果、不是默认义务；口食田与委托田租要靠人去收，旧识照应也要靠钱去维。〔机制事实，标准为占位〕' + (ep.note ? ' ' + ep.note : ''),
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>。这一程是<span class="em">' + season.name + '·' + xunLabel + '</span>，这一旬 <span class="em">' + (season.id === 'winter' ? 3 : 2) + ' 个行动点</span>，仍要把奉养、医药、租谷与年关后手一笔笔拆开过。你年轻时走的那条路，此时会变成旧识、旧账、名色和体面。',
      dossier: function () {
        var seasonFoot = '｜老程=' + season.name + '·' + xunLabel + '｜本年养老季务=' + ((S.本年养老季务 || []).length);
        return lifeDossier((S.子数 > 0 ? ('诸子 ' + S.子数 + ' 人各有小家，奉养多寡要看协商成算。') : '无子可依，奉养这条路走不通，须自筹。') + (ep.dossier ? '｜' + ep.dossier : '') + seasonFoot);
      },
      events: events,
      prompt: season.name + '·' + xunLabel + '怎么过？（分配 ' + (season.id === 'winter' ? 3 : 2) + ' 点）',
      actions: function () {
        var A = [];
        var canNegotiate = (season.id === 'spring') && xun === 1 && S.子数 > 0 && (S.本年养老协商 || 0) <= 0;
        A.push({
          id: 'e_negotiate',
          name: '与诸子协商轮养',
          cost: 2,
          eff: S.子数 > 0 ? '按成算得诸子供养·家族+' : '（无子·此路不通）',
          desc: '召集诸子议定谁出米谁出工——他们可应可辞。春里先说清，后头才不至旬旬扯皮。',
          can: canNegotiate,
          why: S.子数 <= 0 ? '膝下无育成之子' : ((season.id !== 'spring') ? '这一季不便召集诸子议定轮养' : '本年已议定过轮养'),
          once: true,
          prob: S.子数 > 0 ? '足额 / 半额 / 只象征奉养' : ''
        });
        A.push({
          id: 'e_med',
          name: '延医问药·调养',
          cost: 1,
          eff: '铜钱-500·体魄+8',
          desc: '伏夏最伤人，花钱请郎中调养，先把这口气续住。',
          can: (season.id === 'summer') && (S.本年养老医药 || 0) <= 0 && S.铜钱 >= 500,
          why: (season.id !== 'summer') ? '这一季不急着动大药钱' : ((S.本年养老医药 || 0) > 0 ? '本年已延医问药过' : '铜钱不足500文'),
          once: true
        });
        A.push({
          id: 'e_rent',
          name: '收口食田薄租',
          cost: 1,
          eff: '存米+' + (2 + (S.委托待收租谷 || 0)) + '（口食田' + ((S.委托待收租谷 || 0) > 0 ? '+待收委托田租' : '') + '）',
          desc: '秋后把口食田与委托田租一并结回养老账。田在名下不等于租谷自然回，得亲手去收。',
          can: (season.id === 'autumn') && (S.本年养老收租 || 0) <= 0 && (S.口食田 > 0 || S.委托待收租谷 > 0),
          why: (season.id !== 'autumn') ? '这一季不便跑租谷' : (((S.本年养老收租 || 0) > 0) ? '本年已收过租谷' : '眼下无可收租谷'),
          once: true
        });
        A.push({
          id: 'e_sell',
          name: '变卖田产养老',
          cost: 1,
          eff: '田-1亩·白银+2·存米+2',
          desc: '年关把现钱与口粮先换出一口防身的后手，但下一代可分田减少。',
          can: (season.id === 'winter') && (S.本年养老卖田 || 0) <= 0 && S.田亩 >= 2,
          why: (season.id !== 'winter') ? '这一季不宜轻动田契' : (((S.本年养老卖田 || 0) > 0) ? '本年已卖过田' : '需田产≥2亩'),
          once: true
        });

        // 路线附加动作：按季节与“本年仅一次”约束
        ep.extraActions.forEach(function (x) {
          var a = {};
          Object.keys(x).forEach(function (k) { a[k] = x[k]; });
          if (a.id === 'e_field_keep') {
            a.can = a.can !== false
              && (season.id === 'spring' || season.id === 'summer')
              && (S.本年养老守田 || 0) <= 0
              && S.田亩 > 0;
            a.why = (S.田亩 <= 0) ? '眼下已无田面可守'
              : ((S.本年养老守田 || 0) > 0 ? '本年已守过一回薄田' : '这一季不宜再硬扛田头');
            a.once = true;
          } else if (a.id === 'e_city') {
            a.can = (season.id === 'spring') && (S.本年养老旧识 || 0) <= 0;
            a.why = (season.id !== 'spring') ? '这一季不便跑城里旧识' : ((S.本年养老旧识 || 0) > 0 ? '本年已托过旧识' : '');
            a.once = true;
          } else if (a.id === 'e_shop_spring_reply_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 45;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先拆春中铺话账' : (S.铜钱 >= 45 ? '' : '铜钱不足45文');
            a.once = true;
          } else if (a.id === 'e_shop_spring_packet_old') {
            a.can = (season.id === 'spring') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'spring' && xun === 3) ? '这一旬不便先拆春尾铺脚账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_shop_summer_note_old') {
            a.can = (season.id === 'summer') && xun === 1 && S.铜钱 >= 55;
            a.why = !(season.id === 'summer' && xun === 1) ? '这一旬不便先拆伏夏铺签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_shop_autumn_note_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 40;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先抄秋头铺单' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_shop_collect_old') {
            a.can = (season.id === 'autumn') && (S.本年养老铺账 || 0) <= 0;
            a.why = (season.id !== 'autumn') ? '这一季不便结铺里旧脚钱' : ((S.本年养老铺账 || 0) > 0 ? '本年已结过一回铺账' : '');
            a.once = true;
          } else if (a.id === 'e_shop_autumn_mid_old') {
            a.can = (season.id === 'autumn') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便先拆秋中铺账脚费' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_shop_autumn_tail_old') {
            a.can = (season.id === 'autumn') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 3) ? '这一旬不便先拆秋尾铺脚账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_shop_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 90;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏铺药账' : (S.铜钱 >= 90 ? '' : '铜钱不足90文');
            a.once = true;
          } else if (a.id === 'e_shop_summer_tail_old') {
            a.can = (season.id === 'summer') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'summer' && xun === 3) ? '这一旬不便先拆夏尾铺签账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_shop_gift_old') {
            a.can = (season.id === 'winter') && (S.本年养老节礼 || 0) <= 0 && S.铜钱 >= 80;
            a.why = (season.id !== 'winter') ? '这一季不便续旧掌柜门路' : ((S.本年养老节礼 || 0) > 0 ? '本年已留过旧掌柜薄礼' : (S.铜钱 >= 80 ? '' : '铜钱不足80文'));
            a.once = true;
          } else if (a.id === 'e_shop_winter_reply_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 60;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先拆冬中铺签账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_shop_winter_tail_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆冬尾铺签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_shop_route_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先问来春回铺脚路' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_collect_old') {
            a.can = (season.id === 'autumn') && (S.本年养老旧识 || 0) <= 0 && (S.未回款银 || 0) > 0;
            a.why = (season.id !== 'autumn') ? '这一季不便催旧账' : (((S.本年养老旧识 || 0) > 0) ? '本年已催过旧账' : ((S.未回款银 || 0) > 0 ? '' : '眼下无旧账可催'));
            a.once = true;
          } else if (a.id === 'e_wage_note_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 40;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问旧工头回话' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_wage_spring_packet_old') {
            a.can = (season.id === 'spring') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'spring' && xun === 3) ? '这一旬不便先拆春尾工包账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_wage_summer_soup_old') {
            a.can = (season.id === 'summer') && xun === 1 && S.铜钱 >= 55;
            a.why = !(season.id === 'summer' && xun === 1) ? '这一旬不便先拆伏夏工汤账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_wage_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 90;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏药脚账' : (S.铜钱 >= 90 ? '' : '铜钱不足90文');
            a.once = true;
          } else if (a.id === 'e_wage_summer_tail_old') {
            a.can = (season.id === 'summer') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'summer' && xun === 3) ? '这一旬不便先拆夏尾工信账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_wage_receipt_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 40;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先抄秋工欠单' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_wage_autumn_head_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先拆秋头夹衣账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_wage_collect_old') {
            a.can = (season.id === 'autumn') && xun === 2 && (S.本年养老铺账 || 0) <= 0;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便结回旧工棚欠工' : ((S.本年养老铺账 || 0) > 0 ? '本年已结过一回工账' : '');
            a.once = true;
          } else if (a.id === 'e_wage_autumn_mid_old') {
            a.can = (season.id === 'autumn') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便先拆秋中工签账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_wage_autumn_tail_old') {
            a.can = (season.id === 'autumn') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 3) ? '这一旬不便先拆秋尾工脚账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_wage_winter_head_old') {
            a.can = (season.id === 'winter') && xun === 1 && S.铜钱 >= 65;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先拆冬头炭药账' : (S.铜钱 >= 65 ? '' : '铜钱不足65文');
            a.once = true;
          } else if (a.id === 'e_wage_gift_old') {
            a.can = (season.id === 'winter') && xun === 1 && (S.本年养老节礼 || 0) <= 0 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先备旧工头薄礼' : ((S.本年养老节礼 || 0) > 0 ? '本年已留过旧工头薄礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文'));
            a.once = true;
          } else if (a.id === 'e_wage_winter_reply_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 60;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先拆冬中回话账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_wage_winter_tail_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆冬尾草鞋账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_wage_route_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先问明春工棚' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_route_spring_head_old') {
            a.can = (season.id === 'spring') && xun === 1 && S.铜钱 >= 45;
            a.why = !(season.id === 'spring' && xun === 1) ? '这一旬不便先拆春头样纸账' : (S.铜钱 >= 45 ? '' : '铜钱不足45文');
            a.once = true;
          } else if (a.id === 'e_route_price_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问春价与旧账次序' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_route_spring_reply_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 55;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先拆春中回签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_spring_packet_old') {
            a.can = (season.id === 'spring') && xun === 3 && S.铜钱 >= 60;
            a.why = !(season.id === 'spring' && xun === 3) ? '这一旬不便先拆春尾香脚账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_route_summer_wharf_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 55;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏水脚账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 100;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便托熟号捎布药' : (S.铜钱 >= 100 ? '' : '铜钱不足100文');
            a.once = true;
          } else if (a.id === 'e_route_summer_packet_old') {
            a.can = (season.id === 'summer') && xun === 3 && S.铜钱 >= 60;
            a.why = !(season.id === 'summer' && xun === 3) ? '这一旬不便先拆夏尾客签账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_route_summer_note_old') {
            a.can = (season.id === 'summer') && xun === 1 && S.铜钱 >= 60;
            a.why = !(season.id === 'summer' && xun === 1) ? '这一旬不便先拆伏夏回签账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_route_receipt_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 40;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先抄旧账脚单' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_route_autumn_note_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先拆秋头回签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_autumn_mid_old') {
            a.can = (season.id === 'autumn') && xun === 2 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便先拆秋中回签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_autumn_tail_old') {
            a.can = (season.id === 'autumn') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 3) ? '这一旬不便先拆秋尾账脚' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_winter_medicine_old') {
            a.can = (season.id === 'winter') && xun === 1 && S.铜钱 >= 65;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先拆冬头炭药账' : (S.铜钱 >= 65 ? '' : '铜钱不足65文');
            a.once = true;
          } else if (a.id === 'e_route_guest_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先备熟号薄礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文');
            a.once = true;
          } else if (a.id === 'e_route_winter_reply_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 60;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先拆冬中回话账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_route_winter_school_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.商路供读银 >= 1 && S.铜钱 >= 65;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先拆冬中供读底银'
              : (S.商路供读银 >= 1 ? (S.铜钱 >= 65 ? '' : '铜钱不足65文') : '眼下没有可守的商路供读底银');
            a.once = true;
          } else if (a.id === 'e_route_wharf_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先问明春水脚' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_route_winter_tail_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆年下回签账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_route_winter_school_tail_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.商路供读银 >= 1 && S.铜钱 >= 60;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆冬尾供读帖样'
              : (S.商路供读银 >= 1 ? (S.铜钱 >= 60 ? '' : '铜钱不足60文') : '眼下没有可守的商路供读底银');
            a.once = true;
          } else if (a.id === 'e_write_old') {
            a.can = (season.id === 'spring' || season.id === 'winter') && (S.本年养老旧识 || 0) <= 0;
            a.why = (!(season.id === 'spring' || season.id === 'winter')) ? '这一季不便出门代书' : ((S.本年养老旧识 || 0) > 0 ? '本年已凭笔墨换过照应' : '');
            a.once = true;
          } else if (a.id === 'e_tutor_spring_head_old') {
            a.can = (season.id === 'spring') && xun === 1 && S.铜钱 >= 45;
            a.why = !(season.id === 'spring' && xun === 1) ? '这一旬不便先拆春头馆契账' : (S.铜钱 >= 45 ? '' : '铜钱不足45文');
            a.once = true;
          } else if (a.id === 'e_tutor_note_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 40;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问旧馆回话' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_tutor_spring_reply_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先拆春中帖样账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_tutor_spring_packet_old') {
            a.can = (season.id === 'spring') && xun === 3 && S.铜钱 >= 60;
            a.why = !(season.id === 'spring' && xun === 3) ? '这一旬不便先拆春尾纸香账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_tutor_summer_soup_old') {
            a.can = (season.id === 'summer') && xun === 1 && S.铜钱 >= 55;
            a.why = !(season.id === 'summer' && xun === 1) ? '这一旬不便先拆伏夏馆汤账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_tutor_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 90;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏纸药账' : (S.铜钱 >= 90 ? '' : '铜钱不足90文');
            a.once = true;
          } else if (a.id === 'e_tutor_summer_tail_old') {
            a.can = (season.id === 'summer') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'summer' && xun === 3) ? '这一旬不便先拆夏尾馆信账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_tutor_receipt_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 40;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先抄秋馆回签' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_tutor_autumn_reply_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 50;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先拆秋头馆帖账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_tutor_collect_old') {
            a.can = (season.id === 'autumn') && xun === 2;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便结回旧馆润笔' : '';
            a.once = true;
          } else if (a.id === 'e_tutor_autumn_mid_old') {
            a.can = (season.id === 'autumn') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便先拆秋中馆脚账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_tutor_autumn_tail_reply_old') {
            a.can = (season.id === 'autumn') && xun === 3 && S.铜钱 >= 45;
            a.why = !(season.id === 'autumn' && xun === 3) ? '这一旬不便先拆秋尾回帖账' : (S.铜钱 >= 45 ? '' : '铜钱不足45文');
            a.once = true;
          } else if (a.id === 'e_tutor_autumn_bundle_old') {
            a.can = (season.id === 'autumn') && xun === 3 && S.铜钱 >= 55;
            a.why = !(season.id === 'autumn' && xun === 3) ? '这一旬不便先拆秋尾炭脚账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_tutor_gift_old') {
            a.can = (season.id === 'winter') && xun === 1 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先备年关帖礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文');
            a.once = true;
          } else if (a.id === 'e_tutor_winter_reply_old') {
            a.can = (season.id === 'winter') && xun === 1 && S.铜钱 >= 60;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先拆冬头馆信账' : (S.铜钱 >= 60 ? '' : '铜钱不足60文');
            a.once = true;
          } else if (a.id === 'e_tutor_winter_mid_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 55;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先拆冬中馆札账' : (S.铜钱 >= 55 ? '' : '铜钱不足55文');
            a.once = true;
          } else if (a.id === 'e_tutor_post_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先留来春帖费' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_tutor_winter_bundle_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 45;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆冬尾笔炭账' : (S.铜钱 >= 45 ? '' : '铜钱不足45文');
            a.once = true;
          } else if (a.id === 'e_tutor_winter_tail_note_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先拆冬尾馆信账' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          }
          A.push(a);
        });

        A.push({ id: 'e_rest', name: '静养含饴', cost: 1, eff: '体魄+4·家族+2', desc: '不再劳作，含饴弄孙，安养身心。', can: true });
        return A;
      },
      settle: function (log) {
        var stepLabel = season.name + '·' + xunLabel;
        var picked = {};
        lifePicks.forEach(function (p) { picked[p.id] = true; });

        lifePicks.forEach(function (p) {
          switch (p.id) {
            case 'e_negotiate': {
              S.本年养老协商 = 1;
              pushElderSeasonTag(stepLabel + '·议轮养');
              var base = 0.30 + (S.家族 >= 65 ? 0.25 : 0.10) + (S.识字 ? 0.10 : 0) + ep.negotiateAdj;
              base = Math.min(0.9, base);
              var out = rollProb([{ p: base, r: 'full' }, { p: (1 - base) * 0.6, r: 'half' }, { p: (1 - base) * 0.4, r: 'token' }]);
              if (out === 'full') { var m = 2 * S.子数; S.存米 += m; S.家族 += 8; log.push(['〔诸子应允〕协商成算约 ' + Math.round(base * 100) + '%：足额轮养，存米+' + m + '、家族+8', 'good']); }
              else if (out === 'half') { var m2 = S.子数; S.存米 += m2; S.家族 += 3; log.push(['〔各有难处〕诸子只能半额奉养：存米+' + m2 + '、家族+3', 'bad']); }
              else { S.存米 += 1; S.家族 -= 2; log.push(['〔诸子推辞〕只象征性奉养：存米+1、家族-2（他们也有自己的妻儿要养）', 'bad']); }
              break;
            }
            case 'e_med':
              if (S.本年养老医药 <= 0 && spendCopper(500)) {
                S.本年养老医药 = 1;
                S.体魄 += 8;
                pushElderSeasonTag(stepLabel + '·延医问药');
                log.push(['延医问药：铜钱-500、体魄+8（益寿）', 'good']);
              } else {
                log.push(['想延医问药，但这程现钱已先被别处占住，只得暂缓，免得把铜钱记成负数。', 'bad']);
              }
              break;
            case 'e_rent': {
              if (S.本年养老收租 <= 0) {
                S.本年养老收租 = 1;
                var rentGain = 2 + (S.委托待收租谷 || 0);
                S.存米 += rentGain;
                pushElderSeasonTag(stepLabel + '·结租谷');
                log.push(['收口食田薄租' + ((S.委托待收租谷 || 0) > 0 ? '并结委托田租' : '') + '：存米+' + rentGain, 'good']);
                S.委托待收租谷 = 0;
              }
              break;
            }
            case 'e_sell':
              if (S.本年养老卖田 <= 0 && S.田亩 >= 1) {
                S.本年养老卖田 = 1;
                S.田亩 -= 1; S.白银 += 2; S.存米 += 2;
                pushElderSeasonTag(stepLabel + '·卖田');
                log.push(['变卖田1亩养老：田-1、白银+2、存米+2（下一代起点降低）', 'bad']);
              }
              break;
            case 'e_field_keep': {
              if (S.本年养老守田 <= 0) {
                S.本年养老守田 = 1;
                var fieldGain = isFarmRouteState() ? 2 : 1;
                S.存米 += fieldGain;
                S.体魄 -= 1;
                pushElderSeasonTag(stepLabel + '·守薄田');
                log.push([isFarmRouteState()
                  ? '守薄田慢慢收：自耕薄田仍替你收回口粮，存米+' + fieldGain + '、体魄-1'
                  : '守着薄田慢慢收：卖工出身的晚景终于还能靠自家田收一口饭，存米+' + fieldGain + '、体魄-1', 'good']);
              }
              break;
            }
            case 'e_city':
              if (S.本年养老旧识 <= 0) {
                S.本年养老旧识 = 1;
                S.铜钱 += 180; S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·托旧识');
                log.push(['托城中旧识照应：铜钱+180、家族+1（老来还能吃到些年轻时攒下的门路）', 'good']);
              }
              break;
            case 'e_shop_spring_reply_old':
              if (spendCopper(45)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春中铺话');
                log.push(['先把春中回铺回话与灯油盐药分开：铜钱-45、家族+1、体魄+1。旧掌柜回话、回铺脚费、递话门包和家里灯油盐药终于不再一起挤在春中这一口现钱上。', 'good']);
              } else log.push(['想先把春中回铺回话与灯油盐药分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_spring_packet_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春尾铺脚');
                log.push(['先把春尾香纸抄手与回铺脚费分开：铜钱-50、家族+1、体魄+1。清明香纸、抄手纸费、回铺脚费和灶下锅火终于不再一起挤在春尾这一口现钱上。', 'good']);
              } else log.push(['想先把春尾香纸抄手与回铺脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_summer_note_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·伏夏铺签');
                log.push(['先把伏夏回铺回签与茶汤药脚分开：铜钱-55、家族+1、体魄+1。旧掌柜回签、铺里茶汤、凉药脚费和递话门包终于不再一起挤在伏夏头一旬这一口现钱上。', 'good']);
              } else log.push(['想先把伏夏回铺回签与茶汤药脚分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_autumn_note_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·秋头铺单');
                log.push(['先把秋头回铺脚单与租路次序分开：铜钱-40、家族+1。你先把回铺脚单、租路次序和递话口风抄明，秋里的养老账不必再句句都在等。', 'good']);
              } else log.push(['想先把秋头回铺脚单与租路次序分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_collect_old':
              if (S.本年养老铺账 <= 0) {
                S.本年养老铺账 = 1;
                var shopOldGain = 150
                  + (S.学徒去向 === '留店伙计' ? 40 : (S.学徒去向 === '店铺做工' ? 20 : 30))
                  + Math.min(20, Math.max(0, S.学徒历练 || 0) * 5);
                S.铜钱 += shopOldGain;
                if ((S.委托待收租谷 || 0) > 0) S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·结铺账');
                log.push(['结回铺里旧脚钱：铜钱+' + shopOldGain + (((S.委托待收租谷 || 0) > 0) ? '、家族+1（顺带把租路回话也催紧了一层）' : '（把旧掌柜压着的那点脚钱与回话真正落回养老账）'), 'good']);
              }
              break;
            case 'e_shop_autumn_mid_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋中铺账');
                log.push(['先把秋中铺账脚费与租路饭钱分开：铜钱-50、家族+1、体魄+1。旧铺脚钱、租路饭钱、回话脚费和家里锅火终于不再一起挤在秋中这一口现钱上。', 'good']);
              } else log.push(['想先把秋中铺账脚费与租路饭钱分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_autumn_mid_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋中回签');
                log.push(['先把秋中回签与租路饭钱分开：铜钱-55、家族+1、体魄+1。熟号回签、租路饭钱、递话脚费和家里锅火终于不再一起挤在秋中这一口现钱上，商路晚景也不再只靠“账在路上”一句话硬顶。', 'good']);
              } else log.push(['想先把秋中回签与租路饭钱分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_autumn_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋尾铺脚');
                log.push(['先把秋尾锅火与回铺脚费分开：铜钱-55、家族+1、体魄+1。回铺脚费、催单脚路、灯炭锅火和过路药包终于不再一起挤在秋尾这一口现钱上。', 'good']);
              } else log.push(['想先把秋尾锅火与回铺脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_bundle_old':
              if (spendCopper(90)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·拆伏夏铺药');
                log.push(['托旧同门捎布药针线：铜钱-90、家族+1、体魄+1。不是另起一笔大账，只是让学徒路晚景伏夏最磨人的铺药与脚费别再一起咬住家里和身子。', 'good']);
              } else log.push(['想托旧同门捎布药针线，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_summer_tail_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·夏尾铺签');
                log.push(['先把夏尾回铺回签与秋前脚单分开：铜钱-50、家族+1、体魄+1。旧掌柜回签、秋前脚单、递话门包和过路药包终于不再一起挤在伏夏最后一旬这一口现钱上。', 'good']);
              } else log.push(['想先把夏尾回铺回签与秋前脚单分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_collect_old': {
              if (S.本年养老旧识 <= 0) {
                S.本年养老旧识 = 1;
                var oldOwed = S.未回款银;
                var oldGot = Math.max(1, Math.ceil(oldOwed * 0.5));
                var oldLost = Math.max(0, oldOwed - oldGot);
                S.白银 += oldGot; S.未回款银 = 0; if (oldLost > 0) S.商路亏折 += oldLost;
                pushElderSeasonTag(stepLabel + '·催旧账');
                log.push(['催回商路旧账：未回款' + oldOwed + '两里先收回白银+' + oldGot + (oldLost > 0 ? '，仍有' + oldLost + '两收不齐' : '') + '。', 'good']);
              }
              break;
            }
            case 'e_wage_note_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问旧工头');
                log.push(['先问旧工头与春里回话：铜钱-40、家族+1。不是立刻回钱，而是把哪口欠工先结、哪处工棚还认你这层熟面先摸明。', 'good']);
              } else log.push(['想先问旧工头与春里回话，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_spring_packet_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春尾工包');
                log.push(['把春尾草鞋香纸拆作回话与盐药：铜钱-55、家族+1、体魄+1。草鞋香纸、回话脚费和家里盐药锅火先被拆开，卖工路晚景开春收束时不必再让工棚口风和灶下锅火继续抢同一口现钱。', 'good']);
              } else log.push(['想把春尾草鞋香纸拆作回话与盐药，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_summer_soup_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·伏夏工汤');
                log.push(['先把伏夏工汤与草鞋药脚分开：铜钱-55、家族+1、体魄+1。工棚茶汤、草鞋药脚、带话门包和家里凉药终于不再一起挤在伏夏头一旬这一口现钱上。', 'good']);
              } else log.push(['想先把伏夏工汤与草鞋药脚分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_bundle_old':
              if (spendCopper(90)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·拆伏夏药脚');
                log.push(['托旧工头捎凉药与布鞋：铜钱-90、家族+1、体魄+1。不是另起主线，只是让卖工路晚景伏夏最先起皱的药脚与家用别一起熬坏。', 'good']);
              } else log.push(['想托旧工头捎凉药与布鞋，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_summer_tail_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·夏尾工信');
                log.push(['先把夏尾回工信与秋前草料分开：铜钱-50、家族+1、体魄+1。旧工棚回话、秋前草料、递话脚费和过路药包终于不再一起挤在伏夏最后一旬。', 'good']);
              } else log.push(['想先把夏尾回工信与秋前草料分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_receipt_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·抄秋工欠单');
                log.push(['先抄秋工欠单与租路次序：铜钱-40、家族+1。你先把哪口欠工该先问、哪条租路该先跑、哪张回乡脚单还没落定逐条抄明，秋头这层“都说会回”的细账终于不再只剩空等。', 'good']);
              } else log.push(['想先抄秋工欠单与租路次序，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_autumn_head_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋头夹衣');
                log.push(['先把秋头工签与夹衣药包分开：铜钱-55、家族+1、体魄+1。旧工头回签、夹衣药包、回乡门包和锅火小耗先被拆开，卖工路晚景秋头不再只是抄单等回音，连换季穿用与药包也开始同旬咬这口现钱。', 'good']);
              } else log.push(['想先把秋头工签与夹衣药包分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_collect_old': {
              if (S.本年养老铺账 <= 0) {
                S.本年养老铺账 = 1;
                var wageOldGain = 160
                  + (S.雇身份 === '外出佣工' ? 30 : 0)
                  + Math.min(20, Math.max(0, S.雇工历练 || 0) * 5);
                S.铜钱 += wageOldGain;
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·结工账');
                log.push(['结回旧工棚欠工与回乡脚钱：铜钱+' + wageOldGain + '、家族+1。不是凭空添一笔，只把旧工头压着的那点欠工与脚钱真正拢回养老账。', 'good']);
              }
              break;
            }
            case 'e_wage_autumn_mid_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋中工签');
                log.push(['先把秋中工签与锅火饭脚分开：铜钱-50、家族+1、体魄+1。旧工头回签、租路饭钱、回乡脚费和锅火小耗终于不再一起追着秋中这一口现钱。', 'good']);
              } else log.push(['想先把秋中工签与锅火饭脚分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_autumn_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋尾工脚');
                log.push(['先把秋尾锅火与回乡草鞋脚分开：铜钱-55、家族+1、体魄+1。秋尾这层锅火、回乡草鞋脚和催单脚费终于没再被拖进冬里和年关工礼搅成一团。', 'good']);
              } else log.push(['想先把秋尾锅火与回乡草鞋脚分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_winter_head_old':
              if (spendCopper(65)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬头炭药拆开');
                log.push(['先把冬头炭药与旧工回签分开：铜钱-65、家族+1、体魄+1。旧工头回签、灯油炭火、年下药包和来春头程脚费终于不再一起挤在冬头这一口过冬钱上。', 'good']);
              } else log.push(['想先把冬头炭药与旧工回签分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_gift_old':
              if (S.本年养老节礼 <= 0 && spendCopper(70)) {
                S.本年养老节礼 = 1;
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·备工头薄礼');
                log.push(['先备旧工头薄礼与回话脚费：铜钱-70、家族+2、体魄+1。不是排场，而是把旧工头、工棚熟手与带话人的门路先续到明春。', 'good']);
              } else if (S.本年养老节礼 <= 0) {
                log.push(['想先备旧工头薄礼与回话脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              }
              break;
            case 'e_wage_winter_reply_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬中回话');
                log.push(['先把冬中回话脚费与灯炭小钱分开：铜钱-60、家族+1、体魄+1。旧工头回话、灯炭小钱、来春草鞋定钱和递话门包终于不再一起挤在冬中这一口过冬钱上。', 'good']);
              } else log.push(['想先把冬中回话脚费与灯炭小钱分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_winter_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬尾草鞋');
                log.push(['先把年下回签与来春草鞋分开：铜钱-55、家族+1、体魄+1。年下回签、来春草鞋、递话门包和头程脚路终于不再一起挤在冬尾这一口过冬钱上。', 'good']);
              } else log.push(['想先把年下回签与来春草鞋分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_wage_route_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问明春工棚');
                log.push(['先问明春工棚与头程脚路：铜钱-50、家族+1。你先把来年第一程往哪处去、哪口脚费该先留摸明，不让卖工路明春又从瞎撞开始。', 'good']);
              } else log.push(['想先问明春工棚与头程脚路，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_spring_head_old':
              if (spendCopper(45)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春头样纸');
                log.push(['先把春头样纸与递话脚费分开：铜钱-45、家族+1、体魄+1。样纸、递话脚费和家里灯油盐药先被拆开，开春议轮养与后头问春价时就不必继续拿同一口现钱四处堵漏。', 'good']);
              } else log.push(['想先把春头样纸与递话脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_price_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问春价');
                log.push(['先问春价与旧账次序：铜钱-50、家族+1。不是立刻回钱，而是把开春哪口该先催、哪口该先顾家理顺。', 'good']);
              } else log.push(['想先问春价与旧账次序，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'e_route_spring_reply_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春中回签');
                log.push(['先把春中回签与样纸门包分开：铜钱-55、家族+1、体魄+1。熟号回签、样纸门包、递话脚费和家里盐药锅火先被拆开，春价未稳时也不必再让门路和锅火继续挤同一口现钱。', 'good']);
              } else log.push(['想先把春中回签与样纸门包分开，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'e_route_spring_packet_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春尾香脚');
                log.push(['把春尾香纸拆作回话与盐药：铜钱-60、家族+1、体魄+1。不是另起一笔大账，而是把春尾香纸、回话脚费和家里盐药锅火先拆开，不让开春最后这层小耗一直拖到夏里。', 'good']);
              } else log.push(['想把春尾香纸拆作回话与盐药，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_summer_wharf_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·伏夏水脚');
                log.push(['先把伏夏水脚与凉药门包分开：铜钱-55、家族+1、体魄+1。熟号水脚、凉药门包、捎布脚费和家里茶汤先被拆开，捎布药与回乡脚路不必再继续抢同一口现钱。', 'good']);
              } else log.push(['想先把伏夏水脚与凉药门包分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_bundle_old':
              if (spendCopper(100)) {
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·捎布药');
                log.push(['托熟号捎布药回家：铜钱-100、家族+2、体魄+1。不是空等旧账，而是把伏夏最缺的布药和针线真送回锅火边。', 'good']);
              } else log.push(['想托熟号捎布药回家，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_summer_packet_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·夏尾客签拆开');
                log.push(['先把夏尾客签与秋前样纸分开：铜钱-60、家族+1、体魄+1。客签回话、秋前样纸、递话门包和过路药包先被拆回了这一旬，秋路未开时也不必再拿夏尾锅火去替它们垫。', 'good']);
              } else log.push(['想先把夏尾客签与秋前样纸分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_summer_note_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·伏夏回签拆开');
                log.push(['先把伏夏回签与凉药脚费分开：铜钱-60、家族+1、体魄+1。熟号回签、凉药脚费和行栈茶钱先被拆开，后头捎布药与催旧账不必再抢同一口现钱。', 'good']);
              } else log.push(['想先把伏夏回签与凉药脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_receipt_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·抄脚单');
                log.push(['先抄旧账脚单与租路次序：铜钱-40、家族+1。把拖欠次序、租路回话和该先催的口风抄明，秋后养老账才不至继续糊着走。', 'good']);
              } else log.push(['想先抄旧账脚单与租路次序，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_autumn_note_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋头回签');
                log.push(['先把秋头回签与米脚锅火分开：铜钱-55、家族+1、体魄+1。秋头这层回签、米脚锅火和收租脚费终于不再一起抢同一口现钱，后头催旧账时也不必把家里先晾着。', 'good']);
              } else log.push(['想先把秋头回签与米脚锅火分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_autumn_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋尾账脚');
                log.push(['先把秋尾回话与锅火脚费分开：铜钱-55、家族+1、体魄+1。秋尾最怕“账说快回、锅火先紧”；你先把回话脚费、催单脚路和锅火碎用拆开，不让这层尾账顺手滚进冬里。', 'good']);
              } else log.push(['想先把秋尾回话与锅火脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_write_old':
              if (S.本年养老旧识 <= 0) {
                S.本年养老旧识 = 1;
                S.铜钱 += 120; S.家族 += 2;
                pushElderSeasonTag(stepLabel + '·凭笔墨');
                log.push(['凭笔墨换照应：铜钱+120、家族+2（老来体面仍能换一点活路）', 'good']);
              }
              break;
            case 'e_tutor_spring_head_old':
              if (spendCopper(45)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春头馆契');
                log.push(['先把春头馆契与灯油抄手分开：铜钱-45、家族+1、体魄+1。旧馆回帖、抄手纸费、递话脚费和灯油锅火终于不再一起挤在开春第一旬这一口现钱上。', 'good']);
              } else log.push(['想先把春头馆契与灯油抄手分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_note_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问旧馆回话');
                log.push(['先问旧馆回话与学生口风：铜钱-40、家族+1。不是立刻回钱，而是把春里该先递哪张帖子、哪家学生家还认这层字面摸明。', 'good']);
              } else log.push(['想先问旧馆回话与学生口风，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_spring_reply_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春中帖脚');
                log.push(['先把春中帖样与回馆门包分开：铜钱-50、家族+1、体魄+1。旧馆帖样、回馆门包、递话脚费和家里盐药终于不再一起挤在春中这一口现钱上。', 'good']);
              } else log.push(['想先把春中帖样与回馆门包分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_spring_packet_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·春尾纸香');
                log.push(['把春尾抄手拆作香纸与回馆脚费：铜钱-60、家族+1、体魄+1。春尾这层抄手、香纸和回馆脚路终于没再被挤成一句“过了清明再说”。', 'good']);
              } else log.push(['想把春尾抄手拆作香纸与回馆脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_summer_soup_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·伏夏馆汤');
                log.push(['先把伏夏馆汤与潮纸脚费分开：铜钱-55、家族+1、体魄+1。馆里茶汤、潮纸脚费、递话门包和家里凉药终于不再一齐抢夏头这一口现钱。', 'good']);
              } else log.push(['想先把伏夏馆汤与潮纸脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_bundle_old':
              if (spendCopper(90)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·拆伏夏纸药');
                log.push(['把伏夏纸墨拆作凉药与回话脚费：铜钱-90、家族+1、体魄+1。不是另起一条主线，只是让旧馆门路与身子不必一起熬坏。', 'good']);
              } else log.push(['想把伏夏纸墨拆作凉药与回话脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_summer_tail_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·夏尾馆信');
                log.push(['先把夏尾回签与秋前纸样分开：铜钱-50、家族+1、体魄+1。学生家回签、秋前纸样、递话脚费和过路药包终于不再一起挤在伏夏最后一旬。', 'good']);
              } else log.push(['想先把夏尾回签与秋前纸样分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_receipt_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·抄秋馆回签');
                log.push(['先抄秋馆回签与租路次序：铜钱-40、家族+1。你先把哪家学生该先问、哪条租路该先跑、哪张回签还没落定逐条抄明，秋头这层“都说在回”的细账终于不再只剩空等。', 'good']);
              } else log.push(['想先抄秋馆回签与租路次序，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_autumn_reply_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋头帖脚');
                log.push(['先把秋头馆帖与回礼门包分开：铜钱-50、家族+1、体魄+1。馆帖回话、学生家门包、租路小脚费和锅火终于不再一起挤在秋头这一口现钱上。', 'good']);
              } else log.push(['想先把秋头馆帖与回礼门包分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_collect_old': {
              var tutorOldGain = 160 + (S.生员身份 ? 30 : 0) + Math.min(20, Math.max(0, S.识字转业值 || 0) * 5);
              S.铜钱 += tutorOldGain;
              S.家族 += 1;
              pushElderSeasonTag(stepLabel + '·结馆账');
              log.push(['结回旧馆润笔与抄手钱：铜钱+' + tutorOldGain + '、家族+1。不是凭空添一笔，只把旧馆压着的那点笔墨钱真正拢回养老账。', 'good']);
              break;
            }
            case 'e_tutor_autumn_mid_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋中馆脚');
                log.push(['先把秋中馆账脚费与租路饭钱分开：铜钱-50、家族+1、体魄+1。旧馆润笔刚回到手，租路饭钱、回话脚费和锅火终于没再一起追着这一口秋中现钱。', 'good']);
              } else log.push(['想先把秋中馆账脚费与租路饭钱分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_autumn_tail_reply_old':
              if (spendCopper(45)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋尾回帖');
                log.push(['先把秋尾学生回帖与灯炭脚费分开：铜钱-45、家族+1、体魄+1。学生家回帖、灯炭脚费、递话门包和锅火零用终于不再一起挤在秋尾这一口现钱上。', 'good']);
              } else log.push(['想先把秋尾学生回帖与灯炭脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_autumn_bundle_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·秋尾馆炭');
                log.push(['把秋尾炭脚拆作锅火与学生回礼：铜钱-55、家族+1、体魄+1。秋尾这层炭脚、锅火与学生家小回礼终于没再被拖进冬里和帖费搅成一团。', 'good']);
              } else log.push(['想把秋尾炭脚拆作锅火与学生回礼，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_gift_old':
              if (spendCopper(70)) {
                S.本年养老节礼 = 1;
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·备年关帖礼');
                log.push(['先备塾师薄礼与年关帖费：铜钱-70、家族+2、体魄+1。不是体面消费，而是把旧馆、旧学生家和递帖人的门路先续到明春。', 'good']);
              } else log.push(['想先备塾师薄礼与年关帖费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_winter_reply_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬头馆信');
                log.push(['先把冬头馆信与灯炭脚费分开：铜钱-60、家族+1、体魄+1。旧馆回签、灯油炭火、年下药包和递帖脚费终于不再一起挤在冬头这一口过冬钱上。', 'good']);
              } else log.push(['想先把冬头馆信与灯炭脚费分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_winter_mid_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬中馆札');
                log.push(['〔冬中馆札〕先把冬中馆札与孩子炭笔分开：铜钱-55、家族+1、体魄+1。旧馆回札、孩子炭笔、递话门包和守岁锅火终于不再一起挤在冬中这一口过冬钱上。', 'good']);
              } else log.push(['想先把冬中馆札与孩子炭笔分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_post_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·留来春帖费');
                log.push(['先留来春帖费与纸墨定钱：铜钱-50、家族+1。你先把明春递帖、回话和纸墨分开，不让举业路的旧门路在冬尾忽然断掉。', 'good']);
              } else log.push(['想先留来春帖费与纸墨定钱，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_winter_bundle_old':
              if (spendCopper(45)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬尾笔炭');
                log.push(['把冬尾笔炭拆作守岁零用与学生回话：铜钱-45、家族+1、体魄+1。炭药、守岁零碎和学生家回话脚费终于不再一起挤在年尾这一口现钱上。', 'good']);
              } else log.push(['想把冬尾笔炭拆作守岁零用与学生回话，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_winter_tail_note_old':
              if (spendCopper(50)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬尾馆信');
                log.push(['先把年下馆信与来春帖样分开：铜钱-50、家族+1、体魄+1。旧馆年下回信、来春帖样、递话门包和守岁锅火终于不再一起挤在冬尾这一口过冬钱上。', 'good']);
              } else log.push(['想先把年下馆信与来春帖样分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_guest_old':
              if (spendCopper(70)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·备熟号薄礼');
                log.push(['先备熟号薄礼与回话脚费：铜钱-70、家族+1、体魄+1。不是体面消费，而是把熟号、脚夫和带话人这层门路先续到明春。', 'good']);
              } else log.push(['想先备熟号薄礼与回话脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_winter_reply_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬中回话');
                log.push(['〔冬中回话〕先把冬中回话脚费与样纸定钱分开：铜钱-60、家族+1、体魄+1。熟号回话脚费、脚夫门包、来春样纸定钱和柜边回签门包终于不再一起挤在冬中这一口现钱上。', 'good']);
              } else log.push(['〔冬中回话〕想先把冬中回话脚费与样纸定钱分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_winter_school_old':
              if (S.商路供读银 >= 1 && spendCopper(65)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬中供读');
                log.push(['〔冬中供读〕先把冬中供读底银与灯炭炭笔分开：铜钱-65、家族+1、体魄+1。孙辈炭笔、来春蒙馆定钱、灯炭药包和熟号回话脚费终于不再一起挤在冬中这一口现钱上，商路留下的供读底银也没被锅火顺手吞掉。', 'good']);
              } else if (S.商路供读银 >= 1) log.push(['〔冬中供读〕想先把冬中供读底银与灯炭炭笔分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_winter_medicine_old':
              if (spendCopper(65)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬头炭药拆开');
                log.push(['先把冬头炭药与熟号回签分开：铜钱-65、家族+1、体魄+1。炭米、年下药包、熟号回签与回话脚费先被拆开，冬头这层锅火与门路不必再一起硬顶。', 'good']);
              } else log.push(['想先把冬头炭药与熟号回签分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_wharf_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问水脚');
                log.push(['托熟号问明春水脚：铜钱-50、家族+1。你先把来年第一程能不能走、哪层旧账还可缓一旬摸明，不让明春又从瞎撞开始。', 'good']);
              } else log.push(['想托熟号问明春水脚，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_winter_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·年下回签');
                log.push(['〔冬尾铺签〕先把年下回签与来春样纸分开：铜钱-55、家族+1、体魄+1。年下回签、来春样纸定钱、递话脚费和眼前锅火终于不再一起挤在冬尾这一口现钱上。', 'good']);
              } else log.push(['〔冬尾铺签〕想先把年下回签与来春样纸分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_winter_school_tail_old':
              if (S.商路供读银 >= 1 && spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬尾供读');
                log.push(['〔冬尾供读〕先把冬尾供读帖样与年下锅火分开：铜钱-60、家族+1、体魄+1。孙辈来春帖样、炭笔门包、年下锅火和熟号回签终于不再一起挤在冬尾这一口过冬钱上，家里读写后手也没再去硬抢明春商路门路。', 'good']);
              } else if (S.商路供读银 >= 1) log.push(['〔冬尾供读〕想先把冬尾供读帖样与年下锅火分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_gift_old':
              if (S.本年养老节礼 <= 0 && spendCopper(80)) {
                S.本年养老节礼 = 1;
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·续旧门路');
                log.push(['给旧掌柜与同门留薄礼并托回话：铜钱-80、家族+2、体魄+1（明春不必从冷脸求人重新起手）', 'good']);
              } else if (S.本年养老节礼 <= 0) {
                log.push(['想给旧掌柜留薄礼续门路，但现钱已被别处先占，只得暂缓，免得把铜钱记成负数。', 'bad']);
              }
              break;
            case 'e_shop_winter_reply_old':
              if (spendCopper(60)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬中铺签');
                log.push(['先把冬中回铺回签与灯炭针线分开：铜钱-60、家族+1、体魄+1。旧掌柜回签、灯炭针线、脚夫门包和来春回铺脚单终于不再一起挤在冬中这一口现钱上。', 'good']);
              } else log.push(['想先把冬中回铺回签与灯炭针线分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_winter_tail_old':
              if (spendCopper(55)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·冬尾铺签');
                log.push(['先把年下回铺回签与灯炭针线分开：铜钱-55、家族+1、体魄+1。旧掌柜年下回签、灯炭针线、递话脚费和来春回铺脚单终于不再一起挤在冬尾这一口现钱上。', 'good']);
              } else log.push(['想先把年下回铺回签与灯炭针线分开，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_shop_route_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问来春铺路');
                log.push(['先问来春回铺脚路与递话口风：铜钱-50、家族+1。你先把来春回铺、催佃回城与递话的小后手理顺，不让学徒路明春再从冷面求人起步。', 'good']);
              } else log.push(['想先问来春回铺脚路与递话口风，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_rest':
              S.体魄 += 4; S.家族 += 2;
              pushElderSeasonTag(stepLabel + '·静养');
              log.push(['静养含饴：体魄+4、家族+2', 'good']);
              break;
          }
        });

        applySeasonalElderFriction(log, stepLabel, season, xun, picked);

        if (isSeasonEnd) {
          // 夏季额外磨损：若整季既不延医也没静养过，热耗会多啃一口（不额外耗 RNG）
          if (season.id === 'summer'
            && (S.本年养老医药 || 0) <= 0
            && !(S.本年养老季务 || []).some(function (t) { return String(t).indexOf(season.name + '·上旬·静养') >= 0 || String(t).indexOf(season.name + '·中旬·静养') >= 0 || String(t).indexOf(season.name + '·下旬·静养') >= 0; })) {
            S.体魄 -= 1;
            pushElderSeasonTag(season.name + '·伏夏硬扛');
            log.push(['〔伏夏硬扛〕这一季既没舍得动药钱也没能静养，伏夏热耗更重：体魄-1', 'bad']);
          }

          // 每季自然衰老（全年合计约 -4，不额外耗 RNG）
          S.体魄 -= 1;
          log.push(['岁月不居：这一季自然衰老，体魄-1', 'bad']);

          // 关键季节未做要紧事的提醒（不强制扣分，只让因果更可读）
          if (season.id === 'spring' && S.子数 > 0 && (S.本年养老协商 || 0) <= 0) log.push(['春里未议定轮养，后头更容易旬旬扯皮（不评分，只记因果）。', 'bad']);
          if (season.id === 'autumn' && (S.口食田 > 0 || (S.委托待收租谷 || 0) > 0) && (S.本年养老收租 || 0) <= 0) log.push(['秋后未结租谷，口粮更容易落成“田在名下却空转”。', 'bad']);
          if (S.子数 === 0 && !picked.e_sell && !picked.e_rent && !picked.e_rest && season.id === 'winter') {
            S.体魄 -= 1;
            log.push(['无子无进项，这一年冬终仍未换出一口后手，晚景更清苦：体魄-1', 'bad']);
          }

          // 年末再回看“这一年到底有没有被做厚”：
          // 不给分、不排优劣，只把哪条路已经在同一年里摊开细账、哪条路仍偏空，明说给玩家看。
          if (isYearEnd) {
            var elderTags = S.本年养老季务 || [];
            if ((S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定')
              && elderTags.some(function (tag) { return String(tag).indexOf('春中铺话') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('伏夏铺签') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('秋中铺账') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬中铺签') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬尾铺签') >= 0; })) {
              log.push(['这一养老年里，旧铺回话、伏夏铺签、秋中铺账、冬中铺签与冬尾铺签都已逐旬落账；学徒路晚景终于不再只剩“年关再看”，而是一整年都在被旧门路、锅火和来春脚路一点点咬住。', 'good']);
            }
            if (isWageRouteState()
              && elderTags.some(function (tag) { return String(tag).indexOf('问旧工头') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('伏夏工汤') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('秋中工签') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬中回话') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬尾草鞋') >= 0; })) {
              log.push(['这一养老年里，旧工头回话、伏夏工汤、秋中工签、冬中回话与冬尾草鞋都已压回同一年；卖工路晚景终于像真实日子，而不只是秋后催欠工、冬里留后手两笔粗账。', 'good']);
            }
            if ((S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0)
              && elderTags.some(function (tag) { return String(tag).indexOf('春头样纸') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('伏夏水脚') >= 0 || String(tag).indexOf('伏夏回签拆开') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('秋中回签') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬中回话') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('年下回签') >= 0; })) {
              log.push(['这一养老年里，春头样纸、伏夏水脚、秋中回签、冬中回话与冬尾年下回签都已逐旬见光；商路晚景终于不再只剩“旧账在外头”，而是把门路、锅火、租路和来春样纸都压回了同一年。', 'good']);
            }
            if ((S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份)
              && elderTags.some(function (tag) { return String(tag).indexOf('春头馆契') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('伏夏馆汤') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('秋中馆脚') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬中馆札') >= 0; })
              && elderTags.some(function (tag) { return String(tag).indexOf('冬尾馆信') >= 0; })) {
              log.push(['这一养老年里，春头馆契、伏夏馆汤、秋中馆脚、冬中馆札与冬尾馆信都已逐旬落账；举业路晚景终于不再只剩“凭笔墨换照应”，连帖样、馆札、孩子炭笔和守岁锅火也开始在同一年里自己找钱。', 'good']);
            }
            if (elderTags.length <= 8) {
              log.push(['这一养老年虽已拆成四季三旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);
            }
          }
        }

        // 推进到下一旬/下一季
        if (!isYearEnd) S._advanceElderSeason = true;
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
      var nextRole = S.子数 <= 0 ? '旁支继子' : (S.子数 === 1 ? '独子' : '次子');
      var nextVia = composeLineageSource(S.承嗣来路, directHeirLineageTag(nextRole));
      if (S.子数 > 0 && isCollateralCarry(S)) nextVia = composeLineageSource(nextVia, '旁支续承');
      var legacy = {
        父辈路线: S.路线 || '未定',
        承嗣来路: nextVia,
        承继定位: S.承继定位 || '本房次子另起一手',
        // 这里要把“已经继承到这一代的底子”继续带到身后结算里，
        // 否则上一代留下的供读专账/亦贾亦儒分工/旧门路衰减只会活在入口文案里，
        // 一旦本代没有再次显式加码，就会在死亡与重开之间被悄悄洗掉。
        家传书香: Math.max(0, Number(S.家传书香 || 0)),
        城里门路: Math.max(0, Number(S.城里门路 || 0)),
        商路门路: Math.max(0, Number(S.商路门路 || 0)),
        家传手艺: Math.max(0, Number(S.家传手艺 || 0)),
        家传农事: Math.max(0, Number(S.家传农事 || 0)),
        亦贾亦儒底子: Math.max(0, Number(S.亦贾亦儒底子 || 0)),
        供读底子: Math.max(0, Number(S.供读底子 || 0)),
        旧门路衰减: currentLineageDecayLevel()
      };
      if (S.技艺 !== '无' || S.雇技进度 >= 2 || S.雇工历练 >= 3) legacy.家传手艺 = Math.max(legacy.家传手艺, 1);
      if (S.学徒去向 === '留店伙计') legacy.城里门路 = Math.max(legacy.城里门路, 2);
      else if (S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') legacy.城里门路 = Math.max(legacy.城里门路, 1);
      if (isWageRouteState() && (S.雇身份 === '外出佣工' || S.婚配路径 === '先应差·外出佣工')) {
        legacy.城里门路 = Math.max(legacy.城里门路, S.雇工历练 >= 3 ? 2 : 1);
      }
      if (S.商历练 > 0 || (S.累计回钱银 || 0) > 0 || S.累计反哺银 > 0 || S.商身份 !== '未定') legacy.商路门路 = Math.max(legacy.商路门路, 1);
      if ((S.账房进度 + S.商信誉) >= 3 || (S.累计回钱银 || 0) >= 2 || S.累计反哺银 >= 2) legacy.商路门路 = Math.max(legacy.商路门路, 2);
      if (S.生员身份) legacy.家传书香 = Math.max(legacy.家传书香, 2);
      else if (S.识字 || S.识字转业值 >= 2 || S.举业结局 === '屡试未第') legacy.家传书香 = Math.max(legacy.家传书香, 1);
      if (S.商路供读银 >= 1) legacy.供读底子 = Math.max(legacy.供读底子, S.商路供读银 >= 2 ? 2 : 1);
      if ((legacy.商路门路 > 0 && legacy.家传书香 > 0) || legacy.供读底子 > 0 || S.商路供读银 >= 1) {
        legacy.亦贾亦儒底子 = Math.max(legacy.亦贾亦儒底子, 1);
      }
      if (S.子数 <= 0) {
        legacy.承继定位 = '旁支接祧续户';
      } else if (S.子数 === 1) {
        legacy.承继定位 = '独子承家';
      } else if ((S.路线.indexOf('徽商') === 0 || (S.累计回钱银 || 0) > 0 || S.累计反哺银 > 0 || S.商历练 > 0) && S.子数 > 1) {
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
      if (isFarmRouteState() && (S.定额佃状态 === '已立定额佃' || S.婚配路径 === '暂不婚·改定额佃')) {
        legacy.家传农事 = Math.max(legacy.家传农事, 1);
      }
      if (isFarmRouteState() && S.委托营生 === '分得薄田自耕' && S.农事历练 >= 5) legacy.家传农事 = Math.max(legacy.家传农事, 2);
      else if ((isFarmRouteState() && S.农事历练 >= 3) || (isWageRouteState() && S.委托营生 === '分得薄田自耕' && S.农事历练 >= 2)) legacy.家传农事 = Math.max(legacy.家传农事, 1);

      // “旧门路衰减”是代际累计项：已因旁支接续而变薄的门路，不能在本代有嗣时突然洗回 0；
      // 只有本代再次走到绝嗣/旁支过继时，才在既有层数上继续再薄一层。
      var inheritedDecay = currentLineageDecayLevel();
      var addedDecay = S.子数 <= 0 ? 1 : 0;
      legacy.旧门路衰减 = inheritedDecay + addedDecay;
      if (addedDecay > 0) attenuateLegacy(legacy, addedDecay);
      return legacy;
    }
    function deathLifecycleResidueSummary(legacy, pendingRentMi) {
      var parts = [];
      if (S.定额佃状态 === '已立定额佃' || S.婚配路径 === '暂不婚·改定额佃') {
        parts.push('早年那回“先押租、后议亲”的定额佃旧约，临了已沉成这一房更熟的守田/租账底子');
      }
      if (S.合爨状态 === '随兄合户') {
        parts.push('先前随兄合爨留下的共账余绪，临终前仍算作这一房要继续清的家内结构');
      } else if (S.合爨状态 === '已析爨') {
        parts.push('先合爨、后析爨留下的那层共账缓冲，临了已结成这一房自己的独户账');
      }
      if (isWageRouteState() && (S.婚配路径 === '先应差·外出佣工' || S.雇身份 === '外出佣工' || (legacy.城里门路 || 0) > 0)) {
        parts.push('年轻时先应差、后外出佣工攒下的旧牙口与城里熟识，也继续写进这房后来可续的门路');
      }
      if ((legacy.供读底子 || 0) > 0) {
        parts.push((S.商路供读银 || 0) > 0
          ? '商路里另划出来的供读专账，并没有随着本人身故抹平，仍按老规矩压在下一代门前'
          : '这一房前代留下的供读底子，并没有在本代中后段悄悄洗掉，临终时仍按老规矩压在下一代门前');
      }
      if ((S.委托营生 || '无') !== '无' && ((S.委托租谷 || 0) > 0 || pendingRentMi > 0)) {
        parts.push('这房临终前留下的委托经营账，也要连着待收租谷一起结清，不能当作已经落袋');
      }
      return {
        text: parts.join('；')
      };
    }
    function ordinalRemainderItem(total, count, ordinal, label, unit) {
      var whole = Math.max(0, Math.floor(total || 0));
      var n = Math.max(1, Math.floor(count || 1));
      var idx = Math.max(1, Math.min(n, Math.floor(ordinal || 1)));
      var extra = whole % n;
      if (n <= 1 || extra <= 0 || idx > extra) return '';
      return label + '1' + unit;
    }
    function ordinalRemainderSummary(count, ordinal, specs) {
      var parts = [];
      if (Math.max(1, Math.floor(count || 1)) <= 1) return '';
      (specs || []).forEach(function (spec) {
        var item = ordinalRemainderItem(spec.total, count, ordinal, spec.label, spec.unit);
        if (item) parts.push(item);
      });
      if (!parts.length) return '';
      return '按第' + ordinal + '子落份，这一房另吃到余下的' + parts.join('、') + '。';
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
    // “待结委托田租”是应收，不是已得存米；必须随代际承接，而不是自动折算为存米。
    var estateMi = Math.max(0, S.存米 - funeralMi);
    var estateTian = S.田亩;
    var estateCopper = Math.max(0, S.铜钱);
    var sons = S.子数;
    var heirOrdinal = sons > 1 ? 2 : 1;
    // 仅用于 UI 文案与回放断言，不参与任何评分；避免“独子/过继”仍显示“次子”造成闭环误读。
    S._heirOrdinal = heirOrdinal;
    var legacyCarry = nextGenLegacy();
    var lifecycleResidue = deathLifecycleResidueSummary(legacyCarry, pendingRentMi);
    S._deathLifecycleResidueText = lifecycleResidue.text || '';
    var heirIdentity = sons <= 0 ? '旁支继子' : (sons === 1 ? '独子' : (heirOrdinal === 2 ? '次子' : '长子'));
    var narrative, deathTag, collateralEstateNote = '';
    if (sons > 0) {
      var shareSilver = shareByOrdinal(estateSilver, sons, heirOrdinal);
      var shareMi = shareByOrdinal(estateMi, sons, heirOrdinal);
      var shareTian = shareByOrdinal(estateTian, sons, heirOrdinal);
      var shareCopper = shareByOrdinal(estateCopper, sons, heirOrdinal);
      var shareDebt = shareByOrdinal(estateDebt, sons, heirOrdinal);
      var leaseEnabled = shareTian > 0
        && (S.委托营生 || '无') !== '无'
        && ((S.委托租谷 || 0) > 0 || pendingRentMi > 0);
      var shareLease = leaseEnabled ? shareByOrdinal(S.委托租谷 || 0, sons, heirOrdinal) : 0;
      var sharePendingRent = leaseEnabled ? shareByOrdinal(pendingRentMi, sons, heirOrdinal) : 0;
      var remainderText = ordinalRemainderSummary(sons, heirOrdinal, [
        { total: estateSilver, label: '白银', unit: '两' },
        { total: estateCopper, label: '铜钱', unit: '文' },
        { total: estateMi, label: '存米', unit: '石' },
        { total: estateTian, label: '田', unit: '亩' },
        { total: estateDebt, label: '旧债', unit: '两' },
        { total: leaseEnabled ? (S.委托租谷 || 0) : 0, label: '委托定额租谷', unit: '石' },
        { total: leaseEnabled ? pendingRentMi : 0, label: '待收委托田租', unit: '石' }
      ]);
      S._carry = {
        白银: shareSilver, 存米: shareMi, 田亩: shareTian, 铜钱: shareCopper, 负债银: shareDebt, 家族: Math.min(80, S.家族), 承继身份: heirIdentity,
        父辈路线: legacyCarry.父辈路线, 承嗣来路: legacyCarry.承嗣来路, 家传书香: legacyCarry.家传书香,
        承继定位: legacyCarry.承继定位, 城里门路: legacyCarry.城里门路, 商路门路: legacyCarry.商路门路, 家传手艺: legacyCarry.家传手艺, 家传农事: legacyCarry.家传农事, 亦贾亦儒底子: legacyCarry.亦贾亦儒底子, 供读底子: legacyCarry.供读底子,
        旧门路衰减: legacyCarry.旧门路衰减,
        委托营生: leaseEnabled ? (S.委托营生 || '无') : '无',
        委托租谷: shareLease,
        委托待收租谷: sharePendingRent
      };
      S._deathRemainderText = remainderText;
      if (S.路线.indexOf('徽商') === 0 || (S.累计回钱银 || 0) > 0 || S.累计反哺银 > 0 || S.商历练 > 0) deathTag = '你这一生在外跑过商路，身后连旧账、回钱与反哺名声' + (S.商路供读银 > 0 ? '与供读专账' : '') + (pendingRentMi > 0 ? '、尚未结回的委托田租' : '') + '也一并结进遗产。';
      else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') deathTag = '你这一生把乡里与城里缝到了一起，临了能传下去的不只是薄田' + ((S.委托租谷 > 0 || pendingRentMi > 0) ? '与委托田租' : '') + '，还有一层见过世面的门路。';
      else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) deathTag = '你这一生的名分与笔墨不会直接分成银两，却会作为体面与起点留在下一代门前。';
      else deathTag = '你这一辈子的每一分积累与亏空，都成了子孙的期初。';
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>。丧礼依家礼办讫（棺木等丧葬支出白银1两、米1石从遗产扣除）' + (pendingRentMi > 0 ? '；另有委托经营账上待结的租谷 ' + pendingRentMi + ' 石（未取得），记作应收，随房分到下一代' : '') + '。遗产按<span class="em">诸子均分</span>传给下一代' + (estateDebt > 0 ? '，未抵清的旧债也随房分担' : '') + (remainderText ? '；' + remainderText.replace(/。$/, '') : '') + (lifecycleResidue.text ? '。' + lifecycleResidue.text : '') + '——' + deathTag;
    } else {
      collateralEstateNote = '结清丧葬与旧债后，这一房真正还能被过继承走的，只剩白银' + estateSilver + '两、铜钱' + estateCopper + '文、存米' + estateMi + '石、田' + estateTian + '亩' + (pendingRentMi > 0 ? ('，另有账上待结租谷' + pendingRentMi + '石（未取得）') : '') + '。';
      var collateralLeaseEnabled = estateTian > 0
        && (S.委托营生 || '无') !== '无'
        && ((S.委托租谷 || 0) > 0 || pendingRentMi > 0);
      S._carry = {
        白银: estateSilver, 存米: estateMi, 田亩: estateTian, 铜钱: estateCopper, 负债银: estateDebt, 家族: Math.max(35, Math.min(75, S.家族 - 5)), 承继身份: heirIdentity,
        父辈路线: legacyCarry.父辈路线, 承嗣来路: legacyCarry.承嗣来路, 家传书香: legacyCarry.家传书香,
        承继定位: legacyCarry.承继定位, 城里门路: legacyCarry.城里门路, 商路门路: legacyCarry.商路门路, 家传手艺: legacyCarry.家传手艺, 家传农事: legacyCarry.家传农事, 亦贾亦儒底子: legacyCarry.亦贾亦儒底子, 供读底子: legacyCarry.供读底子,
        旧门路衰减: legacyCarry.旧门路衰减,
        委托营生: collateralLeaseEnabled ? (S.委托营生 || '无') : '无',
        委托租谷: collateralLeaseEnabled ? Math.max(0, S.委托租谷 || 0) : 0,
        委托待收租谷: collateralLeaseEnabled ? pendingRentMi : 0
      };
      S._deathRemainderText = '';
      if (S.路线.indexOf('徽商') === 0 || (S.累计回钱银 || 0) > 0 || S.累计反哺银 > 0 || S.商历练 > 0) deathTag = '你这一生在外跑过商路，临了虽未留下亲生承嗣，旧账、回钱与顾家名声' + (S.商路供读银 > 0 ? '与供读专账' : '') + (pendingRentMi > 0 ? '、委托经营账上的待结田租' : '') + '仍要在旁支账里结清。';
      else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') deathTag = '你这一生把乡里与城里缝到了一起，临了虽绝嗣，城中门路与见识' + ((S.委托租谷 > 0 || pendingRentMi > 0) ? '连同委托田租的薄底子' : '') + '也只剩旁支可续。';
      else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) deathTag = '你这一生的名分与笔墨终究未能直接传给亲子，只在旁支门前留下些体面与余绪。';
      else deathTag = '这不是"游戏失败"，而是明代极高绝嗣率下的真实分支。';
      narrative = '你走完了这一生，享年 <span class="em">' + ageRoll + ' 岁</span>，然膝下无育成之子。依明代常俗，触发<span class="em">过继/立嗣</span>：族中侄辈过继承祧，但承的不是一张重置模板，而是这户结清后的真实余产' + (pendingRentMi > 0 ? '、账上待结委托田租（未取得）' : '') + (estateDebt > 0 ? '与未了旧债' : '') + (lifecycleResidue.text ? '。' + lifecycleResidue.text : '') + '——' + deathTag;
    }
    return {
      title: '死亡与传承', label: '传承', next: null, nextLabel: '递归重开 →',
      note: '死亡不是失败结算，而是把资源账结清、生成下一代期初快照。绝嗣/破家是真实分支，不评分。',
      narrative: narrative,
      events: [
        { t: 'rand', tag: '[丧葬]', txt: '丧葬支出：棺木等白银1两、米1石，从遗产/诸子分摊账扣除（镜像入出资子账，不凭空消失）。' },
        (lifecycleResidue.text ? { t: 'life', tag: '[旧账余绪]', txt: lifecycleResidue.text + '。' } : null),
        { t: 'rel', tag: '[传承]', txt: sons > 0
          ? ('遗产品搭均分给 ' + sons + ' 子：你继续跟的是第' + heirOrdinal + '子这一房，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩'
            + (S._carry.委托待收租谷 > 0 ? ('，另有待收委托田租' + S._carry.委托待收租谷 + '石') : '')
            + (S._carry.负债银 > 0 ? ('，并分担旧债' + S._carry.负债银 + '两') : '')
            + '。田不足整分时，这一房也可能暂时分不到整亩，只能带着旧门路再外求。' + inheritedCarryNote(S._carry))
          : ('无嗣过继：旁支承进这一房结清后的真实余产，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩'
            + (S._carry.委托待收租谷 > 0 ? ('，另有待收委托田租' + S._carry.委托待收租谷 + '石') : '')
            + (S._carry.负债银 > 0 ? ('，并接过旧债' + S._carry.负债银 + '两') : '')
            + '。' + collateralEstateNote + inheritedCarryNote(S._carry)) }
      ].filter(Boolean),
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
      if (S.子数 > 0) rh += '<div class="line good">· 遗产品搭均分给 ' + S.子数 + ' 子；你继续跟的这一房分得白银' + (S._carry.白银) + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.委托待收租谷 > 0 ? ('，另有待收委托田租' + S._carry.委托待收租谷 + '石') : '') + (S._carry.负债银 > 0 ? ('，并分担旧债' + S._carry.负债银 + '两') : '') + '</div>';
      else rh += '<div class="line bad">· 绝嗣过继：旁支承进这一房结清后的真实余产，分得白银' + S._carry.白银 + '两、铜钱' + S._carry.铜钱 + '文、存米' + S._carry.存米 + '石、田' + S._carry.田亩 + '亩' + (S._carry.委托待收租谷 > 0 ? ('，另有待收委托田租' + S._carry.委托待收租谷 + '石') : '') + (S._carry.负债银 > 0 ? ('，并接过旧债' + S._carry.负债银 + '两') : '') + '</div>';
      if (S._deathRemainderText) rh += '<div class="line">· 余数落房：' + S._deathRemainderText + '</div>';
      if (S._deathLifecycleResidueText) rh += '<div class="line">· 生命周期残账：' + S._deathLifecycleResidueText + '</div>';
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
