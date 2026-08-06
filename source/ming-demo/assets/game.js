/* 明·江南一生 · 文字版 Demo v2 —— 完整人生链路
 * 农事一季（旬循环）→ 成家 → 当户（分家/当役）→ 养老 → 死亡传承 → 下一代递归重开
 * 三内核不变：① 行动点取舍 ② 逐人资源守恒台账 ③ 看天吃饭的不确定性
 * 全部点数与概率显式标注。数值均为玩法占位（非史实精确值），全部可调。
 * 史料红线：不评分（无孝顺/毅力/成败分）；生育夭折寿命破家均为概率；资源守恒；务农不写成低等。
 */
(function () {
  'use strict';

  // ── 常量：节气·旬 ────────────────────────────────
  // 农路的“年内节奏”先不强行改成完整十二月月历（那会牵动过多史料口径与既有叙事），
  // 而是在原“立夏→芒种→夏至（九旬农事）”之外补上“冬闲三旬”，让同一年里
  // 秋收后仍有修缮、冬闲零活、还债与年关后手等细账可玩，避免“收割即年终结算”过早收束。
  var SOLAR = ['立夏', '芒种', '夏至', '冬闲'];
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
      带本银: 0, 未回款银: 0, 累计反哺银: 0, 商路供读银: 0, 商路亏折: 0, _merchantLockedTradeTable: null, _advanceMerchantYear: false, _advanceMerchantSeason: false,
      本年商路坐店: 0, 本年商路跑单: 0, 本年商路认货: 0, 本年商路问价: 0, 本年商路核账: 0, 本年商路催账: 0, 本年商路贴家: 0, 本年商路归乡: 0, 本年商路家书: 0, 本年商路试贩: 0, 本年商路备役: 0, 本年商路歇养: 0, 本年商路季务: [],
      // 科举路径字段
      举业年: 1, 举季: 1, 举段: 1, 读书方式: '未定', 童试层级: 0, 保结进度: 0, 文章火候: 0,
      供读状态: '家中供读', 供读压力: 0, 读书成本档: 0, 本年下场: false,
      生员身份: false, 生员层级: '无', 优免启用: false, 举业结局: '未定', 识字转业值: 0, _advanceExamYear: false, _advanceExamSeason: false,
      本年馆课次数: 0, 本年半读次数: 0, 本年寄读次数: 0, 本年评文次数: 0, 本年保结次数: 0, 本年誊抄次数: 0, 本年归家次数: 0, 本年备役次数: 0, 本年将养次数: 0, 本年举业季务: [],
      // 人生链路字段
      妻室: false, 子数: 0, 女数: 0, 负债银: 0, 口食田: 0, 分家: false, 应役: '未役',
      婚配路径: '未定', 合爨状态: '未合爨', 定额佃状态: '未立',
      // “人情欠条”不是评分字段，只是把“借出一口急钱/回收一口人情钱”显式写进账，
      // 避免被口头带过或被误解为“凭空通融”。欠条不计入现银，只有讨回时才入铜钱流水。
      人情欠条: 0,
      // 成家后的“养家”阶段：按四季三旬推进，用更细的年内节奏把 20~40 岁之间的家计过细（不引入成功分/最优评分）
      家年: 1, 家季: 1, 家旬: 1, 本年家做活: 0, 本年家粜米: 0, 本年家问价: 0, 本年家备役: 0, 本年家衣药: 0, 本年家照家: 0, 本年家借粮: 0, 本年家还债: 0, 本年家贴家: 0, 本年家催账: 0, 本年家将养: 0, 本年家修缮: 0, 本年家通融: 0, 本年家捎信: 0, 本年家供读: 0, 本年家季务: [],
      // 当户样板：先把商路的“中年当户”拆成四季三旬，让分家、催账、委托田面与应役在同一年里分段落账
      户季: 1, 户旬: 1, 本年户核账: 0, 本年户催账: 0, 本年户备役: 0, 本年户通融: 0, 本年户委托: 0, 本年户供读: 0, 本年户季务: [],
      委托营生: '无', 委托租谷: 0, 委托待收租谷: 0, 最近农闲营生层级: '未定', 最近农闲营生收益: 0,
      // 养老阶段：按四季推进（同一年内继续拆账），避免“老年只点一次就结算”
      老季: 1, 老旬: 1, 本年养老协商: 0, 本年养老收租: 0, 本年养老卖田: 0, 本年养老医药: 0, 本年养老守田: 0, 本年养老旧识: 0, 本年养老铺账: 0, 本年养老节礼: 0, 本年养老季务: [],
      _advanceElderSeason: false,
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
    if (S.本年商路问价 > 0) {
      weights.flat += 0.03; weights.profit += 0.03; weights.loss -= 0.04; weights.receivable -= 0.02;
      notes.push('这一年先拿脚费与茶钱去抄过行市、摸过牙价，试贩时不至拿最生的价去硬碰');
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
    S.本年商路季务 = [];
    S._merchantLockedTradeTable = null;
  }
  function examSeasonInfo(index) {
    var i = Math.max(1, Math.min(EXAM_SEASONS.length, index || 1)) - 1;
    return EXAM_SEASONS[i];
  }
  function examXunLabel(index) {
    var i = Math.max(1, Math.min(3, Number(index) || 1)) - 1;
    return XUN[i];
  }
  function pushExamSeasonTag(tag) {
    if (!tag) return;
    if (!S.本年举业季务) S.本年举业季务 = [];
    if (S.本年举业季务.indexOf(tag) < 0) S.本年举业季务.push(tag);
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
        pushExamSeasonTag(stepLabel + entry.costTag);
        log.push([entry.costLog.replace('{cost}', entry.cost), 'bad']);
      } else {
        if (entry.hardship === 'body') S.体魄 -= 1;
        if (entry.hardship === 'clan') S.家族 = Math.max(0, S.家族 - 1);
        pushExamSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['e_essay', 'e_copy', 'e_mend', 'e_rest'],
      doneTag: '馆课零耗已顾',
      doneLog: '〔馆课零耗〕这一旬先把潮纸、投帖脚费、塾馆茶汤和家里凉热小耗顾住了；举业路这层最容易被一句“不过几文钱”带过的小耗，没有继续滚成更大的缺口。',
      cost: 35,
      costTag: '馆课零耗',
      costLog: '〔馆课零耗〕潮纸、投帖脚费、塾馆茶汤和家里凉热小耗一起冒头：铜钱-{cost}。不是大账，却正把举业路这一年的细钱一点点磨薄。',
      failTag: '馆课零耗硬顶',
      failLog: '〔馆课零耗〕这一旬连潮纸脚费与塾馆茶汤都腾挪不开，只得先硬扛过去；塾师和学生家眼里这层门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'autumn' && xun === 2) apply({
      handledIds: ['e_guarantee', 'e_copy', 'e_home'],
      doneTag: '秋后纸墨已拆',
      doneLog: '〔秋后纸墨〕这一旬先把保结薄礼、学生家回话脚费和润笔纸墨拆开了；秋试前最容易把“还能不能再往前推一口气”磨薄的那层碎耗，没有继续滚大。',
      cost: 45,
      costTag: '秋后纸墨',
      costLog: '〔秋后纸墨〕保结薄礼、学生家回话脚费和秋后纸墨杂支一起要钱：铜钱-{cost}。不是新主线，只是把举业路这一年的细账又往下压了一层。',
      failTag: '秋后纸墨硬顶',
      failLog: '〔秋后纸墨〕这一旬连保结薄礼和学生家回话脚费都腾挪不开，只得先硬顶过去；这一房靠笔墨吃饭的人情面又紧了一层（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['e_home', 'e_rest', 'e_copy', 'e_mend'],
      doneTag: '年关纸墨已分',
      doneLog: '〔年关纸墨〕旧馆账、来春纸墨定钱、灯油和拜帖脚费已被你先分开；举业路这层门路没有在年关忽然断掉。',
      cost: 40,
      costTag: '年关纸墨',
      costLog: '〔年关纸墨〕旧馆账脚费、来春纸墨定钱和灯油一起要钱：铜钱-{cost}。不是体面消费，而是让“读书这一路还续得下去”不至在年关先断掉。',
      failTag: '年关纸墨硬顶',
      failLog: '〔年关纸墨〕这一旬连纸墨定钱和拜帖脚费都腾挪不开，只得先硬顶过去；举业路这层门路又薄了一线（家族-1）。',
      hardship: 'clan'
    });
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
  var isMerchantElder = (S.路线.indexOf('徽商') === 0 || (S.商历练 || 0) > 0 || (S.累计反哺银 || 0) > 0 || (S.未回款银 || 0) > 0);
  var isExamElder = (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用);
  if (season.id === 'spring' && xun === 2) apply(isApprenticeElder ? {
    handledIds: ['e_negotiate', 'e_city', 'e_rest'],
    doneTag: '旧铺回话已理',
    doneLog: '〔旧铺回话〕这一旬先把托旧掌柜递话、回铺脚费和家里灯油锅火分开了；养老开春最容易起皱的那层铺里回话，没有再拖成旬旬空等。',
    cost: 35,
    costTag: '旧铺回话',
    costLog: '〔旧铺回话〕托旧掌柜递话、回铺脚费和灯油锅火一起要钱：铜钱-{cost}。不是大账，却正把学徒路晚年开春最先冒头的回话细账重新压回真账。',
    failTag: '旧铺回话硬顶',
    failLog: '〔旧铺回话〕这一旬连递话脚费和灯油都腾挪不开，只得先硬顶过去；那层旧铺门路在人情面上又薄了一线（家族-1）。',
    hardship: 'clan'
  } : isMerchantElder ? {
    handledIds: ['e_negotiate', 'e_route_price_old', 'e_rest'],
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
  if (isMerchantElder && season.id === 'summer' && xun === 2) apply({
    handledIds: ['e_med', 'e_route_bundle_old', 'e_rest'],
    doneTag: '伏夏布药已顾',
    doneLog: '〔伏夏布药〕这一旬先把熟号捎布药、凉茶汗药和回乡脚费分开了；商路养老最怕“人还撑着、家里先病着”的那层伏夏耗损，没有再顺着热里一起滚大。',
    cost: 45,
    costTag: '伏夏布药',
    costLog: '〔伏夏布药〕熟号捎布药、凉茶汗药和回乡脚费一起要钱：铜钱-{cost}。不是大祸，却正把晚景伏夏最磨人的那层家用与身子摩擦重新压回这一旬。',
    failTag: '伏夏布药硬扛',
    failLog: '〔伏夏布药〕这一旬连布药脚费与凉茶汗药都腾挪不开，只得先硬扛过去；热里家里和身子都更吃紧了一层（体魄-1）。',
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
  if (season.id === 'autumn' && xun === 2) apply(isApprenticeElder ? {
    handledIds: ['e_rent', 'e_shop_collect_old', 'e_rest'],
    doneTag: '铺账租路已顾',
    doneLog: '〔铺账租路〕这一旬先把催回旧脚钱、催佃回话和回城脚路分开了；老来最怕“旧门路还在却回不到养老账”的那层秋后碎费，没有再悄悄磨空。',
    cost: 45,
    costTag: '铺账租路',
    costLog: '〔铺账租路〕催回旧脚钱、催佃回话和回城脚路一起要钱：铜钱-{cost}。不是新主线，只是把学徒路老年这一层真脚路重新压回养老账。',
    failTag: '铺账租路硬顶',
    failLog: '〔铺账租路〕这一旬连回城脚费和催佃回话都腾挪不开，只得先硬顶过去；旧铺与乡里两头的话路都慢了一层（家族-1）。',
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
    handledIds: ['e_rent', 'e_tutor_collect_old', 'e_rest'],
    doneTag: '馆账租路已顾',
    doneLog: '〔馆账租路〕这一旬先把旧馆润笔、秋后租谷和回话脚费分开了；举业路老来最怕“纸上还认你，养老账却接不回来”的那层秋后细账，没有再悄悄磨空。',
    cost: 45,
    costTag: '馆账租路',
    costLog: '〔馆账租路〕旧馆润笔、秋后租谷和回话脚费一起要钱：铜钱-{cost}。不是新主线，只是把举业路老年这一层真正磨人的馆账与租路重新压回养老账。',
    failTag: '馆账租路硬顶',
    failLog: '〔馆账租路〕这一旬连回话脚费和秋后租路都腾挪不开，只得先硬顶过去；旧馆与乡里两头的应声都慢了一层（家族-1）。',
    hardship: 'clan'
  } : isWageElder ? {
    handledIds: ['e_rent', 'e_wage_collect_old', 'e_rest'],
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
    handledIds: ['e_sell', 'e_rest', 'e_route_guest_old'],
    doneTag: '年关账火已分',
    doneLog: '〔年关账火〕这一旬先把灯油炭火、卖田后手和熟号回话脚费分开了；冬里不再把“年关先熬过去”与“明春还走不走得动这条商路”混作一团。',
    cost: 45,
    costTag: '年关账火',
    costLog: '〔年关账火〕灯油炭火、熟号回话脚费和卖田后手一起要钱：铜钱-{cost}。不是大账，却正把商路养老年关最磨人的那层账火重新压回这一旬。',
    failTag: '年关账火硬顶',
    failLog: '〔年关账火〕这一旬连灯油炭火和回话脚费都挪不开，只得靠身子硬顶过去；冬里的锅火与明春路数一并更紧了一线（体魄-1）。',
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
    handledIds: ['e_sell', 'e_wage_gift_old', 'e_rest'],
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
  if (isMerchantElder && season.id === 'winter' && xun === 2) apply({
    handledIds: ['e_route_guest_old', 'e_rest'],
    doneTag: '熟号薄礼已留',
    doneLog: '〔熟号薄礼〕这一旬先把熟号薄礼、脚夫回话和来春样纸定钱分开了；商路老来最怕“人情还在，却没有哪口小钱把它续到明春”，这一层门路没有在冬里忽然断掉。',
    cost: 40,
    costTag: '熟号薄礼',
    costLog: '〔熟号薄礼〕熟号薄礼、脚夫回话和来春样纸定钱一起要钱：铜钱-{cost}。不是体面消费，而是让明春第一旬不必重新从冷面求人开始。',
    failTag: '熟号薄礼硬顶',
    failLog: '〔熟号薄礼〕这一旬连薄礼与样纸定钱都腾挪不开，只得先硬顶过去；熟号与脚夫这层门路又薄了一线（家族-1）。',
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
  if (isMerchantElder && season.id === 'winter' && xun === 3) apply({
    handledIds: ['e_route_wharf_old', 'e_rest'],
    doneTag: '明春水脚已问',
    doneLog: '〔明春水脚〕这一旬先把来春水脚、旧账缓催次序和给家里回话的口风留住了；人虽然老了，明春却不必再从两眼一抹黑开始。',
    cost: 35,
    costTag: '明春水脚',
    costLog: '〔明春水脚〕来春水脚、旧账缓催口风和回话脚费一起要钱：铜钱-{cost}。不是立刻变现，却正把商路晚景最关键的后手留在今冬。',
    failTag: '明春水脚硬顶',
    failLog: '〔明春水脚〕这一旬连回话脚费和来春水脚都腾挪不开，只得先硬顶过去；明春第一程又更像瞎撞了一层（家族-1）。',
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
        pushMerchantSeasonTag(stepLabel + entry.failTag);
        log.push([entry.failLog, 'bad']);
      }
    }
    if (season.id === 'spring' && xun === 1) apply({
      handledIds: ['m_shop', 'm_goods', 'm_market', 'm_letter'],
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
      handledIds: ['m_book', 'm_market', 'm_letter'],
      doneTag: '开路回话已压',
      doneLog: '〔开路回话〕这一旬先把样价抄单、回话脚费和柜边包纸拆开了；春里第二程不再只剩“继续学生意”，而是真把人情回话和门面零耗压回同一年里。',
      cost: 30,
      costTag: '开路回话',
      costLog: '〔开路回话〕样价抄单、回话脚费和柜边包纸一起要钱：铜钱-{cost}。不是大账，却正把“要不要继续认你这一手”这层门面慢慢磨薄。',
      failTag: '开路回话硬顶',
      failLog: '〔开路回话〕这一旬连回话脚费和柜边包纸都挪不开，只得先硬顶过去；柜上看你这层门面又生了一线（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'summer' && xun === 2) apply({
      handledIds: ['m_shop', 'm_book', 'm_mend', 'm_rest', 'm_letter'],
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
      handledIds: ['m_shop', 'm_market', 'm_letter', 'm_mend'],
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
      handledIds: ['m_market', 'm_run', 'm_goods', 'm_collect'],
      doneTag: '秋市碎费已拆',
      doneLog: '〔秋市碎费〕这一旬先把样货、牙行照面和秋路脚费拆开了；看着只是小钱，却没再把本年试手前的商路判断搅浑。',
      cost: 50,
      costTag: '秋市碎费',
      costLog: '〔秋市碎费〕样货茶钱、牙行照面和秋路脚费一起要钱：铜钱-{cost}。不是新主线，只是把秋里试手前的摩擦重新摊回同一年。',
      failTag: '秋市硬顶',
      failLog: '〔秋市碎费〕这一旬连牙行照面和样货脚费都先挪不开，只得硬顶过去；旧相识看你更生了一层（商信誉-1）。',
      hardship: 'trust'
    });
    if (season.id === 'autumn' && xun === 3) apply({
      handledIds: ['m_support', 'm_home', 'm_collect', 'm_letter'],
      doneTag: '回钱碎耗已拆',
      doneLog: '〔回钱碎耗〕这一旬先把回乡带话、样货耗损和催回钱前的脚费拆开了；秋里最后这层“银快回却还没落手”的摩擦没再混成一团。',
      cost: 45,
      costTag: '回钱碎耗',
      costLog: '〔回钱碎耗〕回乡带话、样货耗损和催回钱前的脚费一起要钱：铜钱-{cost}。不是新主线，只是把秋试手收束前的真摩擦重新摊回同一年。',
      failTag: '回钱硬扛',
      failLog: '〔回钱碎耗〕这一旬连带话脚费和样货耗损都挪不开，只得先硬扛过去；家里等钱的口风更急了一层（家族-1）。',
      hardship: 'clan'
    });
    if (season.id === 'winter' && xun === 1) apply({
      handledIds: ['m_collect', 'm_book', 'm_letter', 'm_reserve', 'm_mend'],
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
      handledIds: ['m_collect', 'm_book', 'm_letter', 'm_reserve'],
      doneTag: '清账回话已压',
      doneLog: '〔清账回话〕这一旬先把回话脚费、清账门包、来春样纸定钱和给熟号递话的小礼分开了；冬里第二程不再只剩“催账”，而是真把清账的人情碎费摊回这一旬。',
      cost: 45,
      costTag: '清账回话',
      costLog: '〔清账回话〕回话脚费、清账门包、来春样纸定钱和递话小礼一起要钱：铜钱-{cost}。不是大账，却正把“旧账能不能顺顺当当地回”这层路数一点点磨出来。',
      failTag: '清账回话硬顶',
      failLog: '〔清账回话〕这一旬连回话脚费和清账门包都腾挪不开，只得先硬顶过去；熟号那层回话也迟滞了一线（家族-1）。',
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
    if (season.id === 'summer' && xun === 2) apply(pack.summer);
    if (season.id === 'autumn' && xun === 1) apply(pack.autumnUpper);
    if (season.id === 'autumn' && xun === 2) apply(pack.autumn);
    if (season.id === 'winter' && xun === 1) apply(pack.winter);
    if (season.id === 'winter' && xun === 2) apply(pack.winterMid);
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
    if (!S.已插秧 && xunIndex <= 2) curEvents.push({ t: 'nong', tag: '[农时]', txt: '秧苗待插，立夏正是插秧时。错过则误农时、影响收成。' });
    if (S.已插秧 && xunIndex >= 2 && xunIndex < HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '禾苗生长中，需时时看水、除草。当前生长 ' + S.秧苗进度 + '/' + GROW_TARGET + '。' });
    if (xunIndex === HARVEST_XUN) curEvents.push({ t: 'nong', tag: '[农时]', txt: '夏至已过，稻谷成熟，正是收割之时！秋收之后还有冬闲：修屋、接零活、清旧账、备年关后手，最后才到<b>年终结账</b>。' });
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
      h += '<span class="chip">举程 <b>' + examSeasonInfo(S.举季 || 1).name + '·' + examXunLabel(S.举段 || 1) + '</b></span>';
      h += '<span class="chip">童试层级 <b>' + (S.生员身份 ? '生员' : ('第' + S.童试层级 + '层')) + '</b></span>';
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
      '<div class="cb-tip">' + (g.planted ? (S.秧苗进度 >= GROW_TARGET ? '禾苗已<b>长足封顶（12/12）</b>，再看水也不会长了——把人手匀去挣钱或顾家更划算。' : '离"长足丰收（12/12）"还差 ' + (GROW_TARGET - S.秧苗进度) + ' 点生长；勤看水除草、遇喜雨可加快。到 12 即封顶。') : '立夏正是插秧时，越早插下，可生长的旬数越多（生长满 12 即达丰收上限）。') + '</div>' +
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
      if ((S.举段 || 1) < 3) {
        S.举段 = (S.举段 || 1) + 1;
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
    else if ((S.举季 || 1) === 1 && (S.举段 || 1) === 1) recordEntry('第 ' + S.举业年 + ' 举业年·春课上旬开账', snapshot(), '这一举业年不再按“整年四点一次结账”推进，而是拆成春课、夏课、秋试、冬清账四季、每季三旬。馆课、评文、保结、盘缠、抄写补贴、回家缓家计、差役钱与衣药小账，都要在同一年里逐旬配平。');
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
    else if (p === 'marriage') { S.年龄 = currentLifeProfile().marriageAge; curStage = stageMarriage(); }
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
          note: '首版先做“随号学生意 + 少量带本试贩 + 年终结账”，把未回款、反哺银、原籍赋役先接进运行时。' + (generation > 1 ? ' ' + routeEntryHook('merchant', carryOver) : ''),
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
      ap: 2, commitLabel: isYearEnd ? '了这一工年 →' : '结这一旬工食细账 →',
      note: '这一路现已从“全年一点式结算”继续拆成“每季上中下三旬”：上旬先排工路，中旬把家用与市面摊开，下旬再收差役、衣药与旧债。一年里真有很多小账一起发生，仍保持三币种守恒，不写成功分。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一工年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + (wagePass === 1 ? '这一旬先把主工路定下来。' : (wagePass === 2 ? '这一旬更像把家里、市面与脚下活路往一处拢。' : '这一旬最像收后账：差役、衣药、旧债与年关后手都不肯再往后拖。')) + ' 你这一旬有 <span class="em">2 个行动点</span>。',
      dossier: function () {
        var seasonTags = (S.本年季务 && S.本年季务.length) ? S.本年季务.join('、') : '尚未坐实';
        return lifeDossier('当前工季=' + season.name + '·' + xunLabel + '｜本年雇约=' + S.本年雇约 + '｜本年工食银=' + S.本年工食银 + '两｜本年工食钱=' + S.本年工食钱 + '文｜口粮减免=' + S.本年口粮减免 + '石｜' + wageCounts + '｜已坐实=' + seasonTags + '。');
      },
      events: events,
      prompt: wagePass === 1 ? '这一旬怎么排主工路？（分配 2 点）' : (wagePass === 2 ? '这一旬怎么把家计和市面拢住？（分配 2 点）' : '这一旬怎么把后账收住？（分配 2 点）'),
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
    return {
      title: '入城学徒 · 第' + S.学年 + '学年·' + season.name + xunLabel, label: '学徒第' + S.学年 + '年',
      next: 'apprentice',
      nextLabel: isYearEnd
        ? (S.学年 < APPRENTICE_YEARS ? '翻到下一学年投师季上旬 →' : '带着这门去向去议亲 →')
        : (xun >= 3 ? ('转入' + nextSeason.name + '上旬 →') : ('转入' + season.name + apprenticeXunLabel(xun + 1) + ' →')),
      ap: 2, commitLabel: isYearEnd ? '了这一学年 →' : '了这一旬学徒 →',
      note: '学徒路现改成“每学年四季三旬”推进：投师季先跑说合/作保/立据，坐店季熬守店/抄账，行市季把问价、送货、贴家与归省一并压进同一年，年关季再把口粮、差役、衣药与去留结清。保证金、食宿、去留数额仍是玩法占位，不当作明代精确契约。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一学年走到<span class="em">' + season.name + xunLabel + '</span>。' + season.actionLead + '投师不是自动成功；立据不等于学成，学成也不等于准你留下。你这一旬有 <span class="em">2 个行动点</span>，要在说合、守店、学账、奔走、问价、贴家、帮家、备差、衣药与养身之间取舍。',
      dossier: function () {
        return lifeDossier('立据≠学成≠出师；师傅收不收、留不留、准不准你转伙计，都是分开判的。当前：合同=' + S.学徒合同 + '｜阶段=' + S.学徒阶段 + '｜授艺度=' + S.学徒授艺度 + '｜信任=' + S.学徒信任 + '｜' + seasonalCounts + '。');
      },
      events: [
        { t: 'rel', tag: '[师傅]', txt: S.学徒合同 === '已立据' ? '字据立成后，师傅看的是你这一旬守不守得住、账看不看得明，不会因为你已经进店就自动一路留你。' : '师傅收徒先看年貌、门路、保人和手脚是不是稳当，不因你可怜或勤快自动点头。' },
        { t: 'rand', tag: season.id === 'autumn' ? '[行市]' : (season.id === 'winter' ? '[年关]' : '[店规]'), txt: season.note + (isYearEnd ? ' 这一旬还要把口粮、差役、旧债、衣药与去留一并结账。' : (season.id === 'autumn' ? ' 同一旬里，铺里的行市、家里的口粮和你脚上的鞋药，常常争的是同一笔现钱。' : ' 同一旬里，店里和家里往往同时来要你这双手。')) }
      ],
      prompt: '这一旬怎么过？（分配 2 点）',
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
    var marketCost = season.id === 'autumn' ? (isLate ? 60 : 50) : (season.id === 'winter' ? 40 : 30);
    var marketGoods = season.id === 'autumn' ? (isLate ? 2 : 1) : 1;
    var marketTrust = (season.id === 'autumn' || season.id === 'winter') ? 1 : 0;
    var letterCost = season.id === 'winter' ? (isLate ? 60 : 50) : 30;
    var letterFamily = season.id === 'winter' ? (isLate ? 3 : 2) : 2;
    var seasonalCounts = '本年坐店=' + S.本年商路坐店 + '｜跑单=' + S.本年商路跑单 + '｜认货=' + S.本年商路认货 + '｜问价=' + S.本年商路问价 + '｜核账=' + S.本年商路核账 + '｜催账=' + S.本年商路催账 + '｜贴家=' + S.本年商路贴家 + '｜家书=' + S.本年商路家书 + '｜试贩=' + S.本年商路试贩;
    return {
      title: '徽商学生意 · 第' + S.商年 + '商年·' + season.name + '·' + xunLabel,
      label: '商路第' + S.商年 + '年·' + season.name + '·' + xunLabel,
      next: 'merchant',
      nextLabel: isYearEnd
        ? (S.商年 < MERCHANT_YEARS ? '翻到下一商年春开路上旬 →' : '攒着商路底子去议亲 →')
        : (isLate ? ('转入' + nextSeason.name + '·上旬 →') : ('转入' + season.name + '·' + merchantXunLabel(xun + 1) + ' →')),
      ap: 2,
      commitLabel: isYearEnd ? '了这一商年 →' : '了这一旬商路 →',
      note: '商路现改成“春开路→夏坐店→秋试手→冬清账”四季、每季三旬。关键不是多给几次发财判定，而是把认货、问价、跑单、家书、催账、贴家、差役准备、补衣药与旧债都拆回一年里的真实节奏。' + (generation > 1 ? ' ' + tradePreview.note : ''),
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
      prompt: '这一旬怎么过？（分配 2 点）',
      actions: function () {
        var A = [];
        A.push({ id: 'm_shop', name: season.id === 'summer' ? '伏夏守柜看店' : '坐店学生意', cost: 1, eff: '铜钱+' + shopCopper + '·账房进度+1·商历练+1·体魄-' + shopBody, desc: season.id === 'summer' ? '伏夏守柜、搬货、看人情，钱不算最厚，却最能把柜上这层底子坐实。' : '守柜、搬货、看着人来人往，把规矩学会。', can: true });
        A.push({ id: 'm_goods', name: season.id === 'autumn' ? (isLate ? '趁尾市复核货价' : '趁旺季认货辨价') : '认货辨价', cost: 1, eff: goodsGain > 0 ? ('识货进度+' + goodsGain) : '稳住货眼·不退步', desc: season.id === 'autumn' ? '秋里的货最活，也最容易看走眼；这一步不是发财，而是少吃一次生。' : '先学会认货，不然谈不上自己试着带本。', can: goodsGain > 0 || season.id === 'autumn' });
        A.push({ id: 'm_market', name: season.id === 'autumn' ? (isLate ? '拿脚费再抄一遍行市' : '拿脚费去抄行市') : (season.id === 'winter' ? '问米价与牙价' : '托熟客问一遍行市'), cost: 1, eff: '铜钱-' + marketCost + '·识货进度+' + marketGoods + (marketTrust > 0 ? '·商信誉+1' : '') + '·问价+1', desc: season.id === 'autumn' ? '先花一点脚费与茶钱，把市价和牙口摸熟；这一步不直接进账，却能让后头那笔试贩少吃一层生价。' : '先托熟客把米价、脚价和牙口问清，不必每一步都拿现钱去硬撞。', can: S.铜钱 >= marketCost, why: S.铜钱 >= marketCost ? '' : ('铜钱不足' + marketCost + '文'), once: true });
        A.push({ id: 'm_run', name: season.id === 'autumn' ? (isLate ? '趁旺季外出催单回钱' : '跟号外出探价走货') : (season.id === 'winter' ? (isLate ? '年关短路催最后一笔账' : '趁年关外出收账') : '跟号外出跑单'), cost: 1, eff: (runSilver > 0 ? ('白银+' + runSilver + '·') : '') + '铜钱+' + runCopper + '·商历练+2·体魄-' + runBody + (runFamilyCost > 0 ? ('·家族-' + runFamilyCost) : ''), desc: season.id === 'autumn' ? '秋里跟单问价、认牙口，也把今年能不能往试贩上迈一步坐实。' : (season.id === 'winter' ? '把“账面上有”与“手里真回了钱”分开看清。' : '跟着押货、跑埠、走路子，钱厚一些，离乡也久些。'), can: !(season.id === 'winter' && isLate && S.本年商路催账 > 0), why: (season.id === 'winter' && isLate && S.本年商路催账 > 0) ? '这一旬已催过旧账' : '', once: true });
        A.push({ id: 'm_book', name: season.id === 'winter' ? (isLate ? '年关总盘账' : '年关盘账核账') : (isLate ? '趁旬尾收一遍流水' : '识字帮核账'), cost: 1, eff: '铜钱+' + bookCopper + '·账房进度+1·商信誉+1', desc: '若你识字，可帮着抄单、核账，比纯跑腿更值钱。', can: S.识字, why: S.识字 ? '' : '尚不识字', once: true });
        A.push({ id: 'm_collect', name: S.未回款银 > 0 ? '追催旧账回钱' : (season.id === 'winter' ? '先去盯几笔散账' : '带口信催几笔小账'), cost: 1, eff: S.未回款银 > 0 ? ('未回款银-1·白银+1' + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')) : ('铜钱+' + collectCopper + (collectTrust > 0 ? ('·商信誉+' + collectTrust) : '')), desc: S.未回款银 > 0 ? '把“还挂在账面上”的一两先催回手里，省得年关只剩一堆空账。' : '就算还没有大笔拖账，也先把散碎口信、回话和小账盯紧。', can: season.id === 'winter' || season.id === 'autumn' || S.未回款银 > 0, once: true });
        A.push({ id: 'm_try', name: isLate ? '赶在旬尾定试贩' : '争取带本试贩', cost: 2, eff: '白银-1锁作本钱·冬里按门路/账房/承继定位判回本/小利/亏折/未回款', desc: '拿一两本钱试着跑一单。钱先锁在货里，回没回得来，不只看运气，也看你这一年把门路和账面坐实到哪一步。', can: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) && S.本年商路试贩 < 1 && S.带本银 <= 0 && S.白银 >= 1 && (S.识货进度 >= 1 || S.账房进度 >= 1), why: ((season.id === 'autumn' && xun >= 2) || (season.id === 'winter' && xun === 1)) ? (S.本年商路试贩 < 1 ? (S.带本银 <= 0 ? (S.白银 >= 1 ? ((S.识货进度 >= 1 || S.账房进度 >= 1) ? '' : '尚未学会最基本认货/核账') : '白银不足1两') : '已有一笔本钱锁在货里') : '本年已试贩过一回') : '通常要到秋中旬以后才谈得上试贩', once: true });
        A.push({ id: 'm_support', name: season.id === 'autumn' ? '先把回钱贴回家' : '寄银回家供读', cost: 1, eff: supportProfile.effect, desc: supportProfile.desc, can: S.白银 >= 1, why: S.白银 >= 1 ? '' : '白银不足1两', once: true });
        A.push({ id: 'm_letter', name: season.id === 'winter' ? '托客脚捎家书回乡' : '托熟客捎家书回乡', cost: 1, eff: '铜钱-' + letterCost + '·家族+' + letterFamily + '·家书+1', desc: season.id === 'winter' ? '不一定立刻把银寄回去，但至少先让家里知道哪笔账还在外头、哪笔钱可等，省得年关两边都空等。' : '先花一点脚钱托人带家书报平安、问家计；不代替贴银，却能把家里的焦躁先压一线。', can: S.铜钱 >= letterCost, why: S.铜钱 >= letterCost ? '' : ('铜钱不足' + letterCost + '文'), once: true });
        A.push({ id: 'm_home', name: season.id === 'autumn' ? '回乡省亲搭秋收' : (isLate ? '回乡把家里这旬过住' : '回乡省亲'), cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : ''), desc: season.id === 'autumn' ? '秋里先回乡搭一把，虽少跑一程货，却把家里口粮与脸面先稳住。' : '回乡看看父母，也把一点心力和米粮带回去。', can: true, once: true });
        A.push({ id: 'm_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把年关差役钱留出一角，等真轮到本户时，不至两手一空。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
        A.push({ id: 'm_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '年关前先补棉袄、药钱和脚力，别让这一年最后一程先把身子拖垮。' : '先把这程跑出来的劳损压住，免得后面账还没清，人先垮了。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
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
        if (S.本年商路问价 > 0) log.push(['这一商年你有 ' + S.本年商路问价 + ' 次先花脚费去问行市、抄牙价；这点小钱没有直接变利，却把最生的那层价先摸薄了一些。', 'good']);
        if (S.本年商路家书 > 0) log.push(['这一商年你有 ' + S.本年商路家书 + ' 次托人捎家书回乡；家里未必立刻见钱，却少了几回“人在哪里、银什么时候回”的空等。', 'good']);
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
    var xun = S.举段 || 1;
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
      ap: 2,
      commitLabel: isYearEnd ? '了这一举业年 →' : '了这一旬举业细账 →',
      note: '举业路现改成“春课→夏课→秋试→冬清账”四季、每季三旬：上旬先定主读法，中旬再磨文章、跑资格、抄写补贴，下旬把应场、回家缓家计、差役钱与衣药后手一笔笔收紧。供读不推出录取，仍不展开乡试会试。',
      narrative: '你已<span class="em">' + age + '岁</span>，这一举业年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + xunLead + (isLate ? '这一旬最像清账：若哪笔钱、哪口气、哪段家计没先留住，到了年关就会一起反噬。' : '同一年里，文章火候、保结、盘缠、家里锅火和身子亏空都在争同一笔钱。') + ' 你这一旬有 <span class="em">2 个行动点</span>。',
      dossier: function () {
        return lifeDossier('当前举程=' + season.name + '·' + xunLabel + '｜童试层级=' + S.童试层级 + '｜保结进度=' + S.保结进度 + '｜文章火候=' + S.文章火候 + '｜供读状态=' + S.供读状态 + '｜本年馆课=' + S.本年馆课次数 + '｜半读=' + S.本年半读次数 + '｜评文=' + S.本年评文次数 + '｜保结=' + S.本年保结次数 + '｜誊抄=' + S.本年誊抄次数 + '｜归家=' + S.本年归家次数 + '｜备役=' + S.本年备役次数 + (S.生员身份 ? '｜已是生员' : '') + '。');
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
      prompt: xun === 1 ? '这一旬先怎么定主读法？（分配 2 点）' : (xun === 2 ? '这一旬怎么把文章、资格与补贴往前推？（分配 2 点）' : '这一旬怎么把应场、家计与后手收住？（分配 2 点）'),
      actions: function () {
        var A = [];
        if (xun === 1) {
          A.push({ id: 'e_tutor', name: season.id === 'spring' ? '先入塾定今年馆课' : '继续塾馆温书', cost: 2, eff: '文章火候+' + tutorGain + '·成本档+' + (season.id === 'spring' ? 2 : 1) + '·供读压力+1', desc: season.id === 'spring' ? '先把今年最重也最贵的读法定下来：银钱、纸墨、人情都得先压进去。' : '继续把时辰压在馆课与温书上，推得稳，也更吃家里。', can: S.供读状态 !== '已断供', once: true });
          A.push({ id: 'e_half', name: '半耕半读', cost: 1, eff: '文章火候+1' + (season.id === 'autumn' ? '·存米+1' : '') + '·体魄-1', desc: '农忙帮家里、农闲读书，推进慢些，却能把家里那口气续住。', can: true });
          A.push({ id: 'e_school', name: season.id === 'spring' ? '投社学/寄读' : '低成本寄读', cost: 1, eff: '成本档+1·文章火候+1', desc: '不走正经塾馆，先把这一年读书成本压低一线。', can: S.供读状态 !== '已断供', once: true });
          A.push({ id: 'e_home', name: season.id === 'autumn' ? '回家帮父缓秋里家计' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '这一旬少读一点，先让家里那口锅别翻。', can: true, once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '别把眼睛和身子先熬坏。', can: true });
        } else if (xun === 2) {
          A.push({ id: 'e_essay', name: season.id === 'summer' ? '伏夏专心评文改卷' : '请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '再花一点纸墨和人情，把文章火候往前磨一层。', can: S.供读状态 !== '已断供' });
          A.push({ id: 'e_guarantee', name: season.id === 'autumn' ? '赶在秋里通保结' : '奔走保结与报名', cost: 1, eff: '保结进度+1·铜钱-80', desc: '资格不通，本年就算想下场也不成。', can: !S.生员身份 && S.保结进度 < 1 && (season.id === 'autumn' || season.id === 'winter') && S.铜钱 >= 80, why: !S.生员身份 ? (S.保结进度 < 1 ? ((season.id === 'autumn' || season.id === 'winter') ? (S.铜钱 >= 80 ? '' : '铜钱不足80文') : '通常到秋冬才真跑保结') : '本年保结已通') : '已是生员', once: true });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '年关抄单写契补贴' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '就算不中，识字、誊抄和替人看账也会慢慢沉成转业底子。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          A.push({ id: 'e_home', name: season.id === 'autumn' ? '回家帮父缓秋里家计' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '这一旬少读一点，先让家里那口锅别翻。', can: true, once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '让眼睛和身子缓一口气。', can: true });
        } else {
          A.push({ id: 'e_essay', name: season.id === 'autumn' ? '临场再磨一轮文章' : '再请塾师评文改卷', cost: 1, eff: '文章火候+' + essayGain + '·成本档+1', desc: '把这一旬能再稳一稳的文章火候压出来。', can: S.供读状态 !== '已断供' });
          A.push({ id: 'e_exam', name: season.id === 'winter' ? '冬前补撞一回童试' : '下场应童试', cost: 2, eff: '触发童试结果·盘缠档+1', desc: '只有保结通了、这一年又真下了功夫，才值得去撞一撞。', can: !S.生员身份 && !S.本年下场 && (season.id === 'autumn' || season.id === 'winter') && S.保结进度 >= 1 && S.供读状态 !== '已断供', why: !S.生员身份 ? (!S.本年下场 ? ((season.id === 'autumn' || season.id === 'winter') ? (S.保结进度 >= 1 ? (S.供读状态 !== '已断供' ? '' : '家中已断供') : '保结未通') : '通常要到秋冬才真正下场') : '本年已下场过') : '已是生员', once: true });
          A.push({ id: 'e_copy', name: season.id === 'winter' ? '誊抄契字补年关钱' : '抄书/看账补贴', cost: 1, eff: '铜钱+' + copyCopper + '·识字转业值+1·文章火候+1', desc: '把识字底子临时换成一点现钱，也算给后路添一层。', can: S.识字, why: S.识字 ? '' : '尚不识字' });
          A.push({ id: 'e_home', name: season.id === 'winter' ? '回家陪着把年关过住' : '回家帮父与缓冲家计', cost: 1, eff: '家族+' + homeFamily + (homeRice > 0 ? ('·存米+' + homeRice) : '') + '·供读压力-1', desc: '读书这条路还没坐实的时候，家里先稳住就是一笔真账。', can: true, once: true });
          A.push({ id: 'e_reserve', name: '先留一角差役钱', cost: 1, eff: '铜钱-' + reserveCost + '·本年差役准备+1', desc: '先把差役钱留出来，免得到年关再把读书账拆得满地都是。', can: S.铜钱 >= reserveCost, why: S.铜钱 >= reserveCost ? '' : ('铜钱不足' + reserveCost + '文'), once: true });
          A.push({ id: 'e_mend', name: season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身', cost: 1, eff: '铜钱-' + mendCost + '·体魄+' + mendBody, desc: season.id === 'winter' ? '先补棉衣、药钱和灯下熬出来的亏空。' : '先把眼睛和身子这口气养回一点。', can: S.铜钱 >= mendCost, why: S.铜钱 >= mendCost ? '' : ('铜钱不足' + mendCost + '文'), once: true });
          A.push({ id: 'e_rest', name: '歇息养身', cost: 1, eff: '体魄+5', desc: '让这一旬别只剩下硬熬。', can: true });
        }
        return A;
      },
      settle: function (log) {
        var didStudy = false, progressed = false;
        var picked = {};
        var stepTag = season.name + '·' + xunLabel;
        lifePicks.forEach(function (p) {
          picked[p.id] = true;
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
                log.push(['想把保结赶紧通下，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
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
                log.push(['想先留差役钱，但这一旬零碎开销已先把铜钱占住，只得暂缓。', 'bad']);
              }
              break;
            case 'e_mend':
              if (spendCopper(mendCost)) {
                S.体魄 += mendBody; S.本年将养次数 += 1;
                pushExamSeasonTag(stepTag + '补衣买药');
                log.push([(season.id === 'winter' ? '补衣买药过冬' : '补鞋买药养身') + '：铜钱-' + mendCost + '、体魄+' + mendBody, 'good']);
              } else {
                log.push(['想先补衣药钱，但这一旬手头铜钱不够，只能先硬熬。', 'bad']);
              }
              break;
            case 'e_rest':
              S.体魄 += 5; S.本年将养次数 += 1;
              pushExamSeasonTag(stepTag + '歇养');
              log.push(['歇息养身：体魄+5', 'good']);
              break;
          }
        });
        applySeasonalExamFriction(log, stepTag, season, xun, picked);

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
        pack.dossier = '累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜账房=' + S.账房进度 + '｜信誉=' + S.商信誉;
        pack.event = { t: 'rand', tag: '[商路]', txt: (season.id === 'spring' && xun === 3)
          ? '春起下旬最像把“问来的路数”真拆成家里日用：哪口钱先作盐药，哪口钱还得留作脚费与旧账后手，都不能再糊成一句“回头再说”。'
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
            id: 'f_route_summer_cool',
            name: '先把行栈茶钱与家里凉药分开',
            cost: 1,
            eff: '铜钱-60·衣药+1·捎信+1·通融+1',
            desc: '伏夏开头最怕哪条水脚能走还没问稳，行栈茶钱、带话脚费和家里凉药却先一起冒头。你先把这口小钱拆开，后头催账与捎布药才不至两头都空。',
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
        }
      } else if (route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) {
        pack.note = '学徒路成家后也不只是“在铺里站着”：铺里脚钱能不能捎回家、师门旧识还认不认你、哪一口人情能先替你打听差役，都会改写这一旬家计。现在连伏夏布药、秋里脚钱拆账与年关铺账，也继续拆回同一年里逐旬结算。';
        pack.dossier = '学徒去向=' + S.学徒去向 + '｜授艺度=' + S.学徒授艺度 + '｜学徒历练=' + S.学徒历练;
        pack.event = { t: 'rel', tag: '[铺面]', txt: season.id === 'summer' && xun === 2
          ? '伏夏最怕的是人还站在铺里，家里却先缺了布药和针线；这一旬脚钱、布药和家口细耗会一起冒头。'
          : (season.id === 'autumn' && xun === 2
            ? '秋里脚钱看着比夏里厚些，可锅火、差钱和年关后手也正一齐来抢；不先拆账，就很容易误当“这一旬终于宽了”。'
            : (season.id === 'winter' && xun === 1
              ? '年关先要分清哪笔脚钱仍压在铺里、哪笔该留作明春脚路与差役后手；铺账不先理，明春就会拿同一口现钱连着撞墙。'
              : (xun === 2 ? '这一旬最像“铺里脚钱怎么回家”：你若真在城里站住过，带回家的不只是钱，还有门路。' : (xun === 3 ? '下旬更像把旧掌柜、同门和铺里零碎脚钱一起翻出来：哪口钱先结、哪口人情先用，都是真后手。' : '成家后仍吃铺里这碗饭，最怕的是家里只知道你在外头忙，却看不见哪笔钱真回来了。')))) };
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
        }
      } else if (route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) {
        pack.note = '举业路成家后要把“体面”和“家计”同时算：笔墨底子若只停在文案里，家里这一旬就真会翻锅。现在不只春里先问馆课和保结，连伏夏的课账、秋里的润笔拆账、年关的旧馆账与明春纸墨后手，也都继续压回同一年逐旬结算。';
        pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜识字转业值=' + S.识字转业值;
        var examEventTxt;
        if (season.id === 'summer' && xun === 1) {
          examEventTxt = '伏夏上旬先问的是哪家还开馆、哪位塾师肯续这层人情；天热纸潮，家里又催汤药和草鞋，这一口门路若不先摸清，后头的笔墨钱就落不住。';
        } else if (season.id === 'summer' && xun === 2) {
          examEventTxt = '伏夏中旬最像把笔墨底子换成药钱与锅火：代写、誊录、开蒙和凉热小耗一起来抢同一口现钱。';
        } else if (season.id === 'summer' && xun === 3) {
          examEventTxt = '伏夏下旬更像清两本账：馆课钱能不能催回、塾师人情要不要先拿来探差役，都得在暑气最重时先说定。';
        } else if (season.id === 'autumn' && xun === 1) {
          examEventTxt = '秋里上旬先问的是哪家学生家肯续馆课、哪层保结还认你；笔墨路若只剩一句“我读过书”，秋后这口家计就很难撑厚。';
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
          }
        }
        if (xun === 3) {
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
        }
      } else if (route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) {
        pack.note = '卖工路成家后也不该只剩“这一年总共挣了多少工钱”。活路要先问、工食要分口回家、欠工要回头去结、差役也得先托旧工头探一层；现在又把伏夏汤药、秋收旺工与回乡搭手、年关欠工与明春工棚脚路继续拆回同一年里逐旬结算。';
        pack.dossier = '雇技进度=' + S.雇技进度 + '｜雇工历练=' + S.雇工历练 + '｜婚配路径=' + S.婚配路径;
        var wageEventTxt;
        if (season.id === 'summer' && xun === 1) {
          wageEventTxt = '伏夏上旬最怕活还没断，人先被暑气和热病磨垮：先问哪处工棚肯留脚、哪口凉汤药能先赊，比空想“今年能挣多少”更要紧。';
        } else if (season.id === 'summer' && xun === 2) {
          wageEventTxt = '伏夏中旬最像把工食拆薄：锅火、草鞋、汤药和家里那口急米都来抢同一口现钱。';
        } else if (season.id === 'autumn' && xun === 1) {
          wageEventTxt = '秋里一头是外头旺工，一头是家里也催你回去搭手；先问哪边更急，才不至两头都误。';
        } else if (season.id === 'autumn' && xun === 2) {
          wageEventTxt = '秋工钱看着比夏里厚一点，可锅火、差钱和回乡口粮也一起更急；若不先拆账，很容易错把忙季当宽裕。';
        } else if (season.id === 'winter' && xun === 1) {
          wageEventTxt = '冬里看着像缓下来，实际最像翻旧账：欠工结没结、明春哪处还有活、棉衣炭钱先留哪一口，都要今冬先说清。';
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
        }
      }
      return pack;
    }

    var wp = workProfile();
    var rp = familyRoutePack();
    var events = [
      { t: 'life', tag: '[家计]', txt: '成家之后，日子不再是“几年一把结账”。这一阶段按<span class="em">四季三旬</span>推进：同一年的口粮、差役、市场、孩子、身子和旧债，会在同一年里轮流冒头。' },
      { t: 'rand', tag: '[行情]', txt: '今旬米价走' + (priceHigh ? '高' : '低') + '（1石≈' + miPrice + '文，占位）。' },
      { t: 'body', tag: '[身子]', txt: season.note + (xun === 3 ? ' 到了下旬，衣药、汗疹、腰腿酸痛和明年后手常常不肯再往后拖。' : ' 这一旬里，锅火、孩子、身子和人情都在争同一笔钱。') }
    ];
    if (rp.event) events.push(rp.event);
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
      note: '养家阶段现改成“春起→夏长→秋收→冬藏”四季、每季三旬，并把每旬操作厚到 3 手：通常要同时兼顾一手主营生、一手家内或市面细账，再留一手给差役、衣药、旧债或明春后手。仍不评分，只把家计与制度压力摊回同一年。' + (rp.note ? ' ' + rp.note : ''),
      narrative: '你已<span class="em">' + S.年龄 + '岁</span>，这一养家年走到<span class="em">' + season.name + '·' + xunLabel + '</span>。' + season.actionLead + xunLead + ' 这一旬你有 <span class="em">3 个行动点</span>，得尽量把主营生、家里细账和制度后手一起摊开；若只顾一头，另一头往往会在同一年里立刻反咬回来。',
      dossier: function () {
        return lifeDossier('家年=' + year + '｜家程=' + season.name + '·' + xunLabel + '｜米价=' + (priceHigh ? '高' : '低') + '｜本年做活=' + (S.本年家做活 || 0) + '｜粜米=' + (S.本年家粜米 || 0) + '｜问价=' + (S.本年家问价 || 0) + '｜贴家=' + (S.本年家贴家 || 0) + '｜催账=' + (S.本年家催账 || 0) + '｜备役=' + (S.本年家备役 || 0) + '｜修缮=' + (S.本年家修缮 || 0) + '｜通融=' + (S.本年家通融 || 0) + '｜捎信=' + (S.本年家捎信 || 0) + '｜供读=' + (S.本年家供读 || 0) + '｜人情欠条=' + (S.人情欠条 || 0) + (rp.dossier ? '｜' + rp.dossier : '') + '。');
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
            case 'f_route_autumn_quote':
              if (spendCopper(40)) {
                S.本年家问价 += 1;
                pushFamilySeasonTag(stepTag + '抄秋价');
                log.push(['抄牙价认秋市：铜钱-40、问价+1。秋价不是“凭感觉”，你先拿腿脚把哪口货正热问明。', 'good']);
              } else log.push(['想先抄牙价认秋市，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_receipt':
              if (spendCopper(50)) {
                S.本年家捎信 += 1;
                S.本年家问价 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '抄回钱脚单');
                log.push(['先抄回钱脚单与拖欠次序：铜钱-50、捎信+1、问价+1、通融+1。秋里哪笔该催、哪笔还能压一程、哪笔得先回家续锅火，先被你理成了真账。', 'good']);
              } else log.push(['想先抄回钱脚单与拖欠次序，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_spring_ritual':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家贴家 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '春礼脚费');
                log.push(['先把清明香纸与回话脚费分开：铜钱-60、贴家+1、捎信+1、家族+1。春中这一口小钱先被拆作家里春礼与回话脚费，不再等着路上银一到才临时抓瞎。', 'good']);
              } else log.push(['想先把清明香纸与回话脚费分开，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_spring_bundle':
              if (spendCopper(110)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春拆家用');
                log.push(['先把春钱拆作盐药与锅火：铜钱-110、贴家+1、衣药+1、家族+2。春里家计最怕空等，你先把最急的盐药与锅火拆回去了。', 'good']);
              } else log.push(['想先把春钱拆作盐药与锅火，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_shop_note':
              if (spendCopper(30)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                pushFamilySeasonTag(stepTag + '问铺账');
                log.push(['托旧同门捎口信问铺账：铜钱-30、家族+1。钱还没回，可这一季哪笔脚钱能结、哪笔杂支还压着，先被你摸清了一层。', 'good']);
              } else log.push(['想托旧同门先问铺账，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_shop_collect':
              var shopCollectGain = (S.本年家捎信 || 0) > 0 ? 120 : 90;
              S.铜钱 += shopCollectGain;
              S.本年家催账 += 1;
              pushFamilySeasonTag(stepTag + '结回脚钱');
              log.push(['回铺结一回旧脚钱：铜钱+' + shopCollectGain + ((S.本年家捎信 || 0) > 0 ? '。因前头先问过铺账，这一口钱回得更实。' : '。这不是凭空添一笔，只把该你的零碎脚钱真正拢回来。'), 'good']);
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
            case 'f_route_shop_winter_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '来春铺路已留');
                log.push(['先留来春回铺脚费与递话薄礼：铜钱-60、捎信+1、通融+1、备役+1。你先把来春回铺脚路、递话薄礼和差役后手分开，不让明春第一旬又拿同一口现钱四处堵漏。', 'good']);
              } else log.push(['想先留来春回铺脚费与递话薄礼，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_school_spring_copy':
              if (spendCopper(90)) {
                S.家族 += 2;
                S.本年家贴家 += 1;
                S.本年家衣药 += 1;
                pushFamilySeasonTag(stepTag + '春课拆家用');
                log.push(['把春里纸笔拆作香纸与课本：铜钱-90、贴家+1、衣药+1、家族+2。春头这口能写字换来的小钱，没有被误当成“先宽一旬”，而是先拆回家里眼前最缺的几样细账。', 'good']);
              } else log.push(['想把春里纸笔拆作香纸与课本，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_school_winter_post':
              if (spendCopper(60)) {
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '来春帖费');
                log.push(['先留来春拜帖与开馆脚费：铜钱-60、捎信+1、通融+1、备役后手+1。明春该递哪张帖子、哪口脚费先留给开馆与差钱，这一旬先被你写进后手。', 'good']);
              } else log.push(['想先留来春拜帖与开馆脚费，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_wage_summer_note':
              if (spendCopper(40)) {
                S.家族 += 1;
                S.本年家捎信 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '问工棚药路');
                log.push(['先问工棚落脚与凉汤药脚路：铜钱-40、家族+1、捎信+1、通融+1。你先把哪处工棚肯留脚、哪家药铺肯先赊一口凉汤药摸清，不让伏夏把人和工路一并熬断。', 'good']);
              } else log.push(['想先问工棚落脚与凉汤药脚路，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_wage_split':
              if (spendCopper(140)) {
                S.家族 += (S.本年家捎信 || 0) > 0 ? 3 : 2;
                S.本年家贴家 += 1;
                S.本年家备役 += 1;
                pushFamilySeasonTag(stepTag + '工钱拆账');
                log.push(['把工钱拆作家用与差钱：铜钱-140、家族+' + ((S.本年家捎信 || 0) > 0 ? 3 : 2) + '、备役后手+1。同一口工钱先被拆进锅火与差役两本账里。', 'good']);
              } else log.push(['想把工钱拆作家用与差钱，但这一旬铜钱不够，只得暂缓。', 'bad']);
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
            case 'f_route_wage_duty':
              if (spendCopper(60)) {
                S.家族 += 1;
                S.本年家备役 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '工头探差');
                log.push(['凭工头旧识先探差役：铜钱-60、家族+1、备役后手+1。不是到催差那天才求人，而是先把工头与熟手这层门路压进后手里。', 'good']);
              } else log.push(['想凭工头旧识先探差役，但这一旬铜钱不够，只得暂缓。', 'bad']);
              break;
            case 'f_social':
              if (spendCopper(socialCost)) {
                S.家族 += 1;
                S.本年家通融 += 1;
                pushFamilySeasonTag(stepTag + '里甲通融');
                log.push(['走里甲人情：铜钱-' + socialCost + '、家族+1。不是买平安，而是把“到期才慌”改成“平日先通一层气口”。', 'good']);
              } else log.push(['想走里甲人情，但这一旬铜钱已被别处占住，只得暂缓。', 'bad']);
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
            || picked.f_route_bundle || picked.f_route_shop_bundle || picked.f_route_wage_summer_bundle || picked.f_route_write);
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
          var taxHandled = !!(picked.f_duty || picked.f_tax
            || picked.f_route_autumn_split || picked.f_route_school_split || picked.f_route_shop_split
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
            || picked.f_route_shop_book || picked.f_route_wage_winter_book || picked.f_route_school_winter_book);
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
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_bundle || picked.f_route_sample || picked.f_route_wharf || picked.f_market || picked.f_work) {
            pushFamilySeasonTag(stepTag + '行中小耗已顾');
            log.push(['〔行中小耗〕这一旬先把样纸、门包、回程脚费和家里布药拆开了；“银还在路上”最磨人的那层小耗没有继续滚大。', 'good']);
          } else if (spendCopper(45)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '行中小耗');
            log.push(['〔行中小耗〕样纸、门包、托栈带话和家里布药一起冒头：铜钱-45、衣药+1。不是大账，却正把商路养家这一年的细钱一点点磨薄。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '行中硬扛');
            log.push(['〔行中小耗〕这一旬连样纸门包和布药都腾挪不开，只得先硬扛过去；熟号和家里都更吃紧了一层（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'summer' && xun === 1) {
          if (picked.f_route_wharf || picked.f_route_summer_cool || picked.f_route_letter || picked.f_child || picked.f_repair) {
            pushFamilySeasonTag(stepTag + '伏夏路药已分');
            log.push(['〔伏夏路药〕这一旬先把行栈茶钱、带话脚费和家里凉药拆开了；伏夏刚起头时最容易一起冒头的那层路上与家里小耗，没有再把现钱先磨薄。', 'good']);
          } else if (spendCopper(35)) {
            S.本年家衣药 += 1;
            pushFamilySeasonTag(stepTag + '伏夏路药');
            log.push(['〔伏夏路药〕行栈茶钱、带话脚费和家里凉药一起要钱：铜钱-35、衣药+1。不是大账，却正把商路养家这一年伏夏开头最先起皱的一层摩擦压回真账。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushFamilySeasonTag(stepTag + '伏夏硬顶');
            log.push(['〔伏夏路药〕这一旬连带话脚费和家里凉药都腾挪不开，只得先硬顶过去；熟号与家里锅火两头都更紧了一线（家族-1）。', 'bad']);
          }
        }
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 1) {
          if (picked.f_route_letter || picked.f_route_spring_price || picked.f_route_spring_packet || picked.f_work || picked.f_repair || picked.f_child) {
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
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'spring' && xun === 3) {
          if (picked.f_route_spring_bundle || picked.f_route_school || picked.f_duty || picked.f_route_collect || picked.f_route_letter || picked.f_route_spring_price) {
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
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'autumn' && xun === 3) {
          if (picked.f_route_receipt || picked.f_route_collect || picked.f_route_autumn_quote || picked.f_social || picked.f_duty) {
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
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_guest_gift || picked.f_route_winter_book || picked.f_work || picked.f_rest) {
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
        if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && season.id === 'winter' && xun === 3) {
          if (picked.f_route_winter_wharf || picked.f_route_school || picked.f_duty || picked.f_route_winter_split || picked.f_route_guest_gift || picked.f_route_winter_book) {
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
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_shop_bundle || picked.f_route_shop || picked.f_route_shop_note || picked.f_mend || picked.f_rest) {
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
        if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_shop_book || picked.f_work || picked.f_repair || picked.f_rest) {
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
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'summer' && xun === 2) {
          if (picked.f_route_write || picked.f_route_school_note || picked.f_mend || picked.f_rest) {
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
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'autumn' && xun === 2) {
          if (picked.f_route_school_split || picked.f_social || picked.f_market || picked.f_route_write) {
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
        if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && season.id === 'winter' && xun === 1) {
          if (picked.f_route_school_winter_book || picked.f_route_write || picked.f_repair || picked.f_rest) {
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
          if ((route.indexOf('路径三') === 0 || route.indexOf('入城学徒') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年下客礼已分') >= 0 || String(tag).indexOf('年下客礼已理') >= 0; })) log.push(['这一养家年你又把年下炭药、守岁零用和回铺薄礼先分开；学徒路连年尾那层最碎的人情账，也开始像同一年里不断冒头的小事。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家贴家 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你至少有一回把同一口现钱拆作家用与差役后手；商路顾家不再只是“年末寄没寄银”，而是年内一直在拆账。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.未回款银 || 0) > 0 && (S.本年家催账 || 0) <= 0) log.push(['这一养家年仍有路上旧账没被催回；家里等钱与外头账期的摩擦，被完整留到了下一年。', 'bad']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家衣药 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你不只把银钱捎回去，还把布药针线也拆进了家计；“商路顾家”第一次不只剩下银两本身。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家问价 || 0) > 0 && (S.本年家通融 || 0) > 0) log.push(['这一养家年你还跑过水脚、问过价、通过行栈与乡里气口；市场与制度的细缝，也被一旬旬写进商路家账。', 'good']);
          if ((route.indexOf('路径四') === 0 || route.indexOf('徽商') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春路碎账') >= 0; })) log.push(['这一养家年你连熟号回话脚费、样纸门包与家里盐药锅火这层春路小耗都摊回了开春第一旬；商路成年期不必等到伏夏和秋后，春头就已经开始被细账咬住。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家捎信 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你不只卖工，还先问过活路、再把工食真捎回家里；卖工路成年后也开始有了“先摸活、再回钱”的年内节奏。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家催账 || 0) > 0) log.push(['这一养家年你还回工棚结过 ' + S.本年家催账 + ' 回欠工；家计不再只看“挣了没有”，也看“结了没有”。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家通融 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你还把工头旧识压进差役后手里；卖工路成年后的制度压力，也开始在同一年里被提前摊开。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家衣药 || 0) > 0 && (S.本年家贴家 || 0) > 0) log.push(['这一养家年你至少有一回把伏夏工食拆成汤药和家用；卖工路成年后的身体消耗，也开始在同一年里跟工钱正面碰账。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家问价 || 0) > 0 && (S.本年家捎信 || 0) > 0) log.push(['这一养家年你还先问过秋收旺工与回乡搭手；同一条卖工路里，“外头结现”和“家里缺手”也被你提前摊回了同一年。', 'good']);
          if ((route.indexOf('路径二') === 0 || route.indexOf('受雇') === 0) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年关问欠工') >= 0; })) log.push(['这一养家年你在冬里先把欠工、明春活路和差钱后手分开；卖工路不再只是忙时挣钱、闲时挨过。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家捎信 || 0) > 0 && (S.本年家催账 || 0) > 0) log.push(['这一养家年你不只写字补贴，还先问过馆课与保结、再把馆课钱真正结回家里；举业路成年后也开始有了年内来回到账的节奏。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家通融 || 0) > 0 && (S.本年家备役 || 0) > 0) log.push(['这一养家年你还把塾师、廪保和学生家的门路提前压进差役后手里；“读书人脉”第一次在本代年内真实落到制度账上。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('春课纸香') >= 0; })) log.push(['这一养家年你连清明香纸、课本纸笔和灯油草鞋都在开春先分开；举业路成年期终于不再默认“春头先空过去再说”。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('馆课零耗') >= 0; })) log.push(['这一养家年你连潮纸、投帖脚费和塾馆茶汤这层碎耗都摊回了伏夏；举业路成年期不再只剩“接没接到馆课”的大开关。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('秋后纸墨') >= 0; })) log.push(['这一养家年你还把润笔、保结薄礼与学生家回话脚费拆进了秋后细账；“笔墨钱”第一次不再被误写成整口宽裕。', 'good']);
          if ((route.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份) && (S.本年家季务 || []).some(function (tag) { return String(tag).indexOf('年关纸墨') >= 0; })) log.push(['这一养家年你连旧馆账、来春纸墨定钱和灯油脚费都在年关先分开；举业路成年后的后手开始更像同一年里不断冒头的小事。', 'good']);
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
      wageEventTxt = '伏夏中旬最像把工食和田面同时拆薄：若只顾外头做活，家里薄田就会发虚；若只顾守田，这一房眼前的现钱又会先断。';
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
        hp.event
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
            handledIds: ['h_hire', 'h_side', 'h_rest', 'h_proxy_wage', 'h_hold_field', 'h_literate'],
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
            handledIds: ['h_wage_collect', 'h_proxy_wage', 'h_pay', 'h_lease_home', 'h_clan', 'h_side'],
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
            handledIds: ['h_pay', 'h_proxy_wage', 'h_literate', 'h_wage_collect', 'h_side', 'h_rest'],
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
          if (picked.h_split_joint || picked.h_literate || picked.h_clan) {
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
          if (picked.h_hold_field || picked.h_lease_home || picked.h_literate || picked.h_proxy_wage) {
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
        if (season.id === 'summer' && xun === 2) {
          if (picked.h_hold_field || picked.h_hire || picked.h_side || picked.h_rest || picked.h_literate) {
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
        if (season.id === 'autumn' && xun === 1) {
          if (picked.h_hold_field || picked.h_lease_home || picked.h_hire || picked.h_clan || S.委托营生 === '分得薄田自耕' || (S.委托租谷 || 0) > 0) {
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
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_wage_collect || picked.h_proxy_wage || picked.h_pay || picked.h_clan || picked.h_side) {
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
        if (season.id === 'winter' && xun === 1) {
          var oldWorkContact = S.婚配路径 === '先应差·外出佣工' || (S.城里门路 || 0) > 0;
          if (picked.h_proxy_wage || picked.h_pay || picked.h_clan || picked.h_wage_collect) {
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
          if (picked.h_wage_collect || picked.h_side || picked.h_rest || picked.h_proxy_wage || picked.h_literate) {
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
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书地角') >= 0; })) log.push(['这一任当户你把分书抄样、地角丈绳和田头界纸压进了春分书中旬；“分到 4 亩”终于不再只是一个静态结果，而是同一年里要自己去坐实的制度细账。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('伏夏田工') >= 0; })) log.push(['这一任当户你又把凉汤、田埂草鞋、看水饭食和工棚脚路拆进了伏夏中旬；卖工路当户终于更像一年里田、工、家用和身子一直互相咬住。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋工锅火') >= 0; })) log.push(['这一任当户你还把旺工茶水、回乡脚费、锅火与差票后手压进了秋定租中旬；秋里有回钱也不再会被误写成“自然稳了”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('欠工活路') >= 0; })) log.push(['这一任当户你连年下欠工回话、灯油炭钱和明春头程脚费都先分开了；卖工路的冬尾终于也像同一年里不断冒头的小事，而不只是一句“等明春再说”。', 'good']);
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
        A.push({ id: 'h_hire', name: seasonIdx <= 2 ? '雇工顾住田面' : '雇短工把秋后田面收住', cost: 1, eff: '铜钱-300·田面不至空转', desc: '当户这一年照样要应役与跑腿，先花钱把田面顾住，少让这一房的根脚漏掉。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口零活补差钱', cost: 1, eff: side.effect, desc: '当户这一年也要现钱。哪怕只是多接一层零活，也是在给锅火与差钱添后手。', can: true });
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
            handledIds: ['h_pay', 'h_clan', 'h_literate', 'h_side', 'h_rest'],
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
      eventTxt = '春分书的中旬最像第一次真把“城里门路”和“乡里薄田”摆在一张账上：你要不要先把 4 亩薄田立成租账，决定这一房有没有一口不靠铺里脸色的口粮。';
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
      eventTxt = '秋定租的中旬看着最像“总该宽一口了”，其实锅火、差钱、租谷与旧脚钱一起更急；若不先拆账，忙季的钱会立刻漏光。';
    } else if (season.id === 'autumn' && xun === 3) {
      eventTxt = '秋定租的下旬最像把这一房真正坐稳：铺里旧账、师门旧识与乡里薄田，哪一项都不能只停在纸上。';
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
        hp.event
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
        if (season.id === 'autumn' && xun === 2) {
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
            handledIds: ['h_shop_book', 'h_side', 'h_rest', 'h_proxy', 'h_hire', 'h_literate'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把铺里脚路、家里汤药和伏夏布药顾住了；在城里的人情没有再跟家里锅火一起空转。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕凉药、布药、脚路碎费和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连伏夏布药和凉汤钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_shop_collect', 'h_proxy', 'h_pay', 'h_clan', 'h_lease_city', 'h_side'],
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
            handledIds: ['h_pay', 'h_proxy', 'h_shop_book', 'h_shop_collect', 'h_literate', 'h_rest'],
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
        if (season.id === 'autumn' && xun === 1) {
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
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_bundle || picked.h_pay || picked.h_shop_collect || picked.h_side || picked.h_clan) {
            pushHouseholdSeasonTag(stepLabel + '秋脚拆账已坐');
            log.push(['〔秋脚拆账〕这一旬先把秋脚钱、锅火、差钱和租路后手拆开了；忙季脚钱看着厚，却不再转头就被几本账一起吃空。', 'good']);
          } else if (spendCopper(50)) {
            pushHouseholdSeasonTag(stepLabel + '秋脚拆账');
            log.push(['〔秋脚拆账〕秋脚钱回话、锅火、差钱和租路碎费一起要钱：铜钱-50。不是新主线，却把学徒路当户秋中那层“钱将回未回、账先撞上”的摩擦重新压回这一旬。', 'bad']);
          } else {
            S.家族 = Math.max(0, S.家族 - 1);
            pushHouseholdSeasonTag(stepLabel + '秋脚硬顶');
            log.push(['〔秋脚拆账〕这一旬连锅火和差钱后手都腾挪不开，只得先硬顶过去；秋里家里和师门两头都更难替这一房说话了（家族-1）。', 'bad']);
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
      eventTxt = '春分书的中旬最像第一次真把“在外头的商路”和“分到手的 4 亩薄田”摆在同一本账上：你若不先坐实代管与租路，这房田很容易继续只停在纸上。';
    } else if (season.id === 'spring' && xun === 3) {
      eventTxt = '春分书的下旬更像清旧账：春路货款、分书杂支、家里锅火和差钱后手一起来要钱。路上银若还没拢回来，乡里可不会替你等。';
    } else if (season.id === 'summer' && xun === 1) {
      eventTxt = '夏催账的上旬最怕人先被暑气和路耗熬住，账却还在外头。伏夏的布药、水脚、行栈与家里小耗，都会来抢同一口现钱。';
    } else if (season.id === 'summer' && xun === 2) {
      eventTxt = '夏催账的中旬最像把“商路门道”和“锅火现实”一起拆开：若只顾外头行栈，家里会空等；若只顾眼前家用，旧账、水脚和明春路数又会悄悄断掉。';
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
      eventTxt = '冬应役的下旬没有突然掉下来的“结果”。你前头一年有没有先把旧账、水脚、薄田、供读与差钱分开，都会在这一旬里一起现形。';
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
        hp.event
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
        }
        if (season.id === 'spring' && xun === 3) {
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
        }
        A.push({ id: 'h_hire', name: '雇工顾住田面', cost: 1, eff: '铜钱-300·分家薄田不至空转', desc: '你人在外头，先花钱把薄田顾住，别让“分得了田”变成一年的空账。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: '抽身贴补这一房', cost: 1, eff: side.effect, desc: '当户这一年照样要找现钱。哪怕只是多接一层零活，也是在给差钱和家用添后手。', can: true });
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
            handledIds: ['h_collect', 'h_school_fund', 'h_side', 'h_rest', 'h_literate', 'h_clan', 'h_wharf', 'h_summer_tail'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把伏夏布药、水脚与家里零耗顾住了；商路现钱没有再被小耗悄悄磨薄。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕伏夏布药、水脚碎费和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是商路当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连伏夏布药和凉热小耗都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_collect', 'h_pay', 'h_school_fund', 'h_clan', 'h_trust_field', 'h_side', 'h_wharf', 'h_autumn_tail'],
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
            handledIds: ['h_pay', 'h_collect', 'h_literate', 'h_school_fund', 'h_clan', 'h_side', 'h_rest', 'h_wharf', 'h_winter_route_split'],
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
          if (picked.h_wharf || picked.h_collect || picked.h_clan || picked.h_side || picked.h_trust_field) {
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
        if (season.id === 'autumn' && xun === 2) {
          if (picked.h_autumn_split || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_wharf || picked.h_clan) {
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
          if (picked.h_autumn_tail || picked.h_pay || picked.h_collect || picked.h_school_fund || picked.h_side || picked.h_rest) {
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
        if (season.id === 'spring' && xun === 2) {
          if (picked.h_collect || picked.h_trust_field || picked.h_literate || picked.h_clan || picked.h_wharf) {
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
        if (season.id === 'spring' && xun === 1) {
          if (picked.h_spring_packet || picked.h_collect || picked.h_literate || picked.h_clan || picked.h_wharf) {
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
        }
        if (season.id === 'winter' && xun === 1) {
          if (picked.h_wharf || picked.h_literate || picked.h_clan || picked.h_side || picked.h_collect || picked.h_rest) {
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
        if (season.id === 'winter' && xun === 3) {
          if (picked.h_winter_coal || picked.h_pay || picked.h_school_fund || picked.h_wharf || picked.h_rest) {
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
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('问水脚') >= 0; })) log.push(['这一任当户你不只会“催旧账”，还一旬旬去摸水脚、行栈与熟号门路；市场摩擦终于也被写进了这一年的细账里。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('夏尾账脚拆开') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('秋尾催单纸包') >= 0; })) log.push(['这一任当户你连夏尾回话脚费、秋尾催单纸包这种末尾细账都主动拆开了；商路这一年不再只是“季中有事”，连季尾也在持续咬人。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('年关客礼') >= 0; }) || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('客礼已分') >= 0; })) log.push(['这一任当户连年关熟号薄礼、脚夫脚费与明春水脚都被拆开记了；“门路要不要养”不再只停在一句设定里。', 'good']);
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
      eventTxt = '夏催账的中旬最像把“识字底子”和“锅火现实”一起拆开：若只顾塾馆体面，这一房现钱会先断；若只顾眼前现钱，来年那层名色又会发虚。';
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
      eventTxt = '冬应役的中旬最像翻总账：哪笔润笔赶回来了、哪层名色还真认你、哪口租谷能真落回这一房，都在这一旬见真章。';
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
        hp.event
      ].filter(Boolean),
      prompt: '这一旬先顾哪几笔？（分配 2 点，把举业路的当户一年逐旬拆开）',
      actions: function () {
        var A = [];
        var side = sideHustleProfile();
        if (canCopy) A.push({ id: 'h_copy_mid', name: copyName, cost: 1, eff: '铜钱+160·核账/备役更实', desc: '把识字底子真换成馆课、代写与抄契的现钱，不让“读过几年书”只剩一层空体面。', can: true, once: true });
        if (canExempt) A.push({ id: 'h_exempt', name: exemptName, cost: 1, eff: '名色缓派·风险降', desc: '若这一房真还有生员或优免名色，就先把它坐实为可用的缓派后手，而不是留到冬里才临时翻找。', can: true, once: true });
        if (canLeaseField) A.push({ id: 'h_exam_lease', name: leaseName, cost: 1, eff: '立租账·年租谷+1·风险降', desc: '你不可能日日守田，就先把分得薄田立成租账，让它先替这一房回一口口粮。', can: true, once: true });
        if (canPay) A.push({ id: 'h_pay', name: payName, cost: 2, eff: '白银-2·纳银代役', desc: '先把这一任最硬的那口现银留下，年关轮值时就不至只剩硬扛。', can: true, once: true });
        if (season.id !== 'spring' && xun >= 2) A.push({ id: 'h_exam_split', name: splitName, cost: 1, eff: splitEffect, desc: splitDesc, can: S.铜钱 >= splitCost, why: S.铜钱 >= splitCost ? '' : ('铜钱不足' + splitCost + '文'), once: true });
        A.push({ id: 'h_literate', name: literateName, cost: 1, eff: S.识字 ? '核账次数+1·少吃糊涂账' : '（不识字·无从核账）', desc: '把分书、税则、租谷与差钱抄进自己看得懂的账里。', can: S.识字 && (S.本年户核账 || 0) < 2, why: S.识字 ? '' : '不识字，看不懂账册', once: true });
        A.push({ id: 'h_clan', name: clanName, cost: 1, eff: '家族+2·乡里通气', desc: '先把塾师、保结旧识、兄房与乡里谁肯替这一房说话坐实，不让名色只停在牌面上。', can: (S.本年户通融 || 0) < 2, once: true });
        A.push({ id: 'h_hire', name: hireName, cost: 1, eff: '铜钱-300·田面不至空转', desc: '先花钱顾住田面，别让“分得了田”变成忙完馆账回头只剩一地荒账。', can: S.铜钱 >= 300 && (S.本年户备役 || 0) < 3, why: S.铜钱 >= 300 ? '' : '铜钱不足300文', once: true });
        A.push({ id: 'h_side', name: seasonIdx <= 2 ? '抽身贴补这一房' : '再接一口润笔补差钱', cost: 1, eff: side.effect, desc: '当户这一年照样得找现钱。哪怕只是多接一层润笔、抄写或零活，也是在给锅火、租路和差钱添后手。', can: true });
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
            handledIds: ['h_copy_mid', 'h_exempt', 'h_literate', 'h_clan'],
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
            handledIds: ['h_exam_lease', 'h_literate', 'h_clan'],
            doneTag: '税则回话已理',
            doneLog: '〔税则回话〕税则抄手、租账脚费与给保结递话的小脚费已被你先分开；春分书的中旬不再只剩“名色和薄田摆一起看”，而是真把制度碎账压回了这一旬。',
            cost: 45,
            costTag: '税则回话',
            costLog: '〔税则回话〕税则抄手、租账脚费和给保结递话的小脚费一起要钱：铜钱-{cost}。不是大账，却正把举业路当户这一年的制度碎费往前拖出来。',
            failTag: '税则回话硬顶',
            failLog: '〔税则回话〕这一旬连税则抄手和递话脚费都腾挪不开，只得先硬顶过去；刚立户时这层名色回话又薄了一线（家族-1）。',
            hardship: 'clan'
          },
          summer: {
            handledIds: ['h_copy_mid', 'h_exempt', 'h_rest', 'h_literate', 'h_clan', 'h_side', 'h_exam_split'],
            doneTag: '伏夏小耗已顾',
            doneLog: '〔伏夏小耗〕这一旬先把纸墨、凉药、馆账和家里锅火顾住了；识字底子没有再被伏夏杂耗一点点磨空。',
            cost: 60,
            costTag: '伏夏小耗',
            costLog: '〔伏夏小耗〕纸墨、凉药、馆账碎费和家里小耗一起冒头：铜钱-{cost}。不是大祸，只是举业路当户这一年里又一口真支出。',
            failTag: '伏夏硬扛',
            failLog: '〔伏夏小耗〕这一旬连纸墨和凉药钱都腾挪不开，只得先硬扛过去：体魄-1。',
            hardship: 'body'
          },
          autumn: {
            handledIds: ['h_pay', 'h_copy_mid', 'h_clan', 'h_exam_lease', 'h_side', 'h_literate', 'h_exam_split'],
            doneTag: '秋后细账已拆',
            doneLog: '〔秋后细账〕秋后馆课、租谷、锅火与差钱已被你先拆开；润笔与抄写钱这旬没再被误写成宽裕。',
            cost: 70,
            costTag: '秋后杂支',
            costLog: '〔秋后杂支〕秋后纸墨、馆课碎费和锅火差钱一起压来：铜钱-{cost}。不是新主线，只是同一年里又一层真支出。',
            failTag: '秋后硬顶',
            failLog: '〔秋后杂支〕现钱腾挪不开，这一旬只得先硬顶过去；这一房在人情面上更紧了一层（家族-1）。',
            hardship: 'clan'
          },
          winter: {
            handledIds: ['h_exempt', 'h_copy_mid', 'h_pay', 'h_literate', 'h_side', 'h_rest', 'h_exam_split'],
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
            handledIds: ['h_copy_mid', 'h_side', 'h_rest', 'h_exam_split'],
            doneTag: '冬馆回话已理',
            doneLog: '〔冬馆回话〕旧馆回话、灯油纸墨与给学生家递话的小脚费已被你先分开；冬应役中旬不再只剩翻总账，也把“人情怎么续到明春”压回了这一旬。',
            cost: 45,
            costTag: '冬馆回话',
            costLog: '〔冬馆回话〕旧馆回话脚费、灯油纸墨与递话小礼一起要钱：铜钱-{cost}。不是大账，却正把年关前最容易被一句“回头再说”带过的笔墨门路拖回真账。',
            failTag: '冬馆回话硬顶',
            failLog: '〔冬馆回话〕这一旬连回话脚费和灯油纸墨都腾挪不开，只得先硬顶过去；举业路这层旧馆门路又薄了一线（家族-1）。',
            hardship: 'clan'
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
        if ((S.本年户核账 || 0) <= 0) log.push(['这一任当户你始终没把分书、税则与差钱亲手核清，最容易吃的就是“明明有识字底子，却仍在糊涂账里磨掉家底”。', 'bad']);
        if ((S.本年户催账 || 0) <= 0) log.push(['这一任当户你一整年都没把馆课、润笔与抄契钱真正结回这一房；举业路最容易吃的，正是“明明能写能抄，现钱却一直挂在外头”。', 'bad']);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) log.push(['这一任当户你先把分得薄田立成了租账，这一房从此不再只是嘴上“名下还有 4 亩”。', 'good']);
        else log.push(['这一任当户你始终没把分得薄田坐成租账；田还在名下，却还没开始真替这一房回口粮。', 'bad']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('分书碎费') >= 0; })) log.push(['这一任当户连分书抄手、拜帖脚费和塾师回话这层春头碎费都先摊回账里了；立户开年不再只剩一句“已经分过家”。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('税则回话') >= 0; })) log.push(['这一任当户你又把税则抄手、租账脚费和给保结递话的小脚费压进了春分书中旬；举业路的制度细账不再只在春头一句话带过。', 'good']);
        if (exemptSet || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('名色缓派') >= 0; })) log.push(['这一任当户你把生员/优免这层名色真正拿来顶过了一层制度外流；名色不再只是一行旧文案。', 'good']);
        if (copySettled || (S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('结回馆账') >= 0; })) log.push(['这一任当户你把“识字能补家计”写成了真钱，不再只是体面话。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('拆账') >= 0; })) log.push(['这一任当户你至少有一回把润笔或馆钱先拆进锅火、差钱与纸墨；举业路的当户也开始有了更细的年内流转。', 'good']);
        if ((S.本年户季务 || []).some(function (tag) { return String(tag).indexOf('冬馆回话') >= 0; })) log.push(['这一任当户连旧馆回话、灯油纸墨与递话脚费都在冬应役中旬先拆开；举业路年关前那层“门路怎么续住”终于也成了同一年里的真细账。', 'good']);
        if ((S.本年户季务 || []).length <= 4) log.push(['这一任当户虽拆成了年内各旬，但真正落到账里的细务仍偏少，说明这一年还没有被你完全做厚。', 'bad']);

        var risk = 0.40 + hp.baseAdj;
        risk -= Math.min(0.16, (S.本年户核账 || 0) * 0.08);
        risk -= Math.min(0.10, (S.本年户催账 || 0) * 0.05);
        risk -= Math.min(0.12, (S.本年户通融 || 0) * 0.06);
        risk -= Math.min(0.12, (S.本年户备役 || 0) * 0.06);
        if ((S.本年户委托 || 0) > 0 || (S.委托租谷 || 0) > 0) risk -= 0.08;
        if (exemptSet || !!S.生员身份 || !!S.优免启用) risk -= 0.08;
        if (S.应役 === '纳银代役') risk -= 0.14;
        if ((S.识字转业值 || 0) >= 2) risk -= 0.03;
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
      if (isWageRouteState() && (S.婚配路径 === '先应差·外出佣工' || S.城里门路 > 0 || S.雇身份 === '外出佣工' || S.雇工历练 >= 3)) {
        pack.negotiateAdj += 0.03;
        pack.extraActions.push({ id: 'e_wage_note_old', name: '先问旧工头与春里回话', cost: 1, eff: '铜钱-40·家族+1', desc: '先托旧工头把春里哪处还能留脚、哪笔旧工棚欠工先结、哪口回话该先递问清。钱还没回，但老来开春这层活路先不至两眼一抹黑。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
        pack.extraActions.push({ id: 'e_wage_bundle_old', name: '托旧工头捎凉药与布鞋', cost: 1, eff: '铜钱-90·家族+1·体魄+1', desc: '伏夏最怕人还想硬撑，凉汤药、布鞋和回乡带话脚费却先一起冒头。先托旧工头把最急的小物捎回来，身子和家里都少熬一层。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文', once: true });
        pack.extraActions.push({ id: 'e_wage_collect_old', name: '结回旧工棚欠工与回乡脚钱', cost: 1, eff: '铜钱+160~210·家族+1', desc: '趁秋里还走得动，把旧工棚压着的欠工、回乡脚钱和零碎食钱真正结回养老账。', can: true, once: true });
        pack.extraActions.push({ id: 'e_wage_gift_old', name: '先备旧工头薄礼与回话脚费', cost: 1, eff: '铜钱-70·家族+2·体魄+1', desc: '年关若把旧工头、工棚熟手和带话人的薄礼一并省掉，明春往往得从头求人。先把这层小钱记下，老路数才不至在冬里断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
        pack.extraActions.push({ id: 'e_wage_route_old', name: '先问明春工棚与头程脚路', cost: 1, eff: '铜钱-50·家族+1', desc: '趁年关旧工头还肯回话，先把明春哪处工棚肯留脚、哪口头程脚费得先留摸明。它不立刻变现，却能让来年不至重新瞎撞。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      }
    } else if (S.路线.indexOf('入城学徒') === 0 || S.学徒去向 !== '未定') {
      pack.note = '学徒一路到了晚年，看的是城中门路有没有坐实：留店、坐店工、跟货，都会改变你老来靠谁照应。养老不只剩“诸子养不养”，还要看旧掌柜肯不肯回话、铺里旧脚钱能不能结回、分得薄田的租谷回不回得来。';
      pack.dossier = '学徒去向=' + S.学徒去向 + '｜学徒历练=' + S.学徒历练 + '｜授艺度=' + S.学徒授艺度 + '｜委托营生=' + S.委托营生 + '｜委托租谷=' + (S.委托租谷 || 0) + '｜待收租谷=' + (S.委托待收租谷 || 0);
      pack.event = { t: 'rel', tag: '[旧识]', txt: '你年轻时若在城里站稳过，老来可托旧东家、旧同门、旧行口照应；若只是归乡另谋，养老结构就更接近普通薄田人家。学徒路真正磨人的，是铺里旧识、乡里租路与年关后手会在同一年里一层层往回咬。' };
      if (S.学徒去向 === '留店伙计') pack.negotiateAdj += 0.08;
      else if (S.学徒去向 === '店铺做工') pack.negotiateAdj += 0.05;
      else if (S.学徒去向 === '随行商') pack.negotiateAdj += 0.03;
      if (S.学徒去向 === '留店伙计' || S.学徒去向 === '店铺做工' || S.学徒去向 === '随行商') {
        pack.extraActions.push({ id: 'e_city', name: '托城中旧识照应', cost: 1, eff: '铜钱+180·家族+1', desc: '老来还能托城里旧东家或旧同行给些照应，不全靠家里硬扛。', can: true, once: true });
        pack.extraActions.push({ id: 'e_shop_collect_old', name: '结回铺里旧脚钱', cost: 1, eff: '铜钱+160~220·家族+1', desc: '趁还走得动，把铺里旧脚钱、旧掌柜压着的零碎回款和替家里带回的话路结回来一点。', can: true, once: true });
        pack.extraActions.push({ id: 'e_shop_gift_old', name: '给旧掌柜留薄礼续门路', cost: 1, eff: '铜钱-80·家族+2·体魄+1', desc: '年关先把旧掌柜、同门与脚夫该给的薄礼留出来，顺带托回话与药引，别让明春还得从冷脸求人开始。', can: true, once: true });
      }
    } else if (S.路线.indexOf('徽商') === 0 || S.商历练 > 0 || S.累计反哺银 > 0 || S.未回款银 > 0) {
      pack.note = '商路一路到了晚年，关键不只在旧账、分红和反哺名声能不能真的落回养老账，也在于春价回话、伏夏布药、秋后脚单与冬里熟号门路能不能一旬旬接住。';
      pack.dossier = '累计反哺=' + S.累计反哺银 + '两｜未回款=' + S.未回款银 + '两｜商路供读=' + S.商路供读银 + '两｜商身份=' + S.商身份 + '｜委托营生=' + S.委托营生;
      pack.event = { t: 'rand', tag: '[旧账]', txt: '商路上最怕的是老来还有账压在外头：你年轻时寄回家的银会被诸子记住，路上的旧账却未必能赶在身子垮前收齐。' };
      if (S.累计反哺银 >= 2) pack.negotiateAdj += 0.06;
      if (S.商路供读银 >= 1) pack.negotiateAdj += 0.04;
      if (S.未回款银 > 0) {
        pack.extraActions.push({ id: 'e_collect_old', name: '催回商路旧账', cost: 1, eff: '未回款→部分现银', desc: '趁还走得动，把商路上的旧账催回一部分作养老钱。', can: true, once: true });
      }
      pack.extraActions.push({ id: 'e_route_price_old', name: '先问春价与旧账次序', cost: 1, eff: '铜钱-50·家族+1', desc: '先托熟号把春价、回话次序和哪笔旧账更该先动问清。钱还没回，但养老账先不至两头乱猜。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
      pack.extraActions.push({ id: 'e_route_bundle_old', name: '托熟号捎布药回家', cost: 1, eff: '铜钱-100·家族+2·体魄+1', desc: '伏夏不是只缺现银，也缺布、药和一口真能落到锅火边的小物。先托熟号把这一包捎回去，家里与身子都能少熬一层。', can: S.铜钱 >= 100, why: S.铜钱 >= 100 ? '' : '铜钱不足100文', once: true });
      pack.extraActions.push({ id: 'e_route_receipt_old', name: '先抄旧账脚单与租路次序', cost: 1, eff: '铜钱-40·家族+1', desc: '秋后最怕“都说在路上，却不知道先催哪笔”。先把脚单、拖欠次序和租路回话抄明，后面的养老账才不至继续糊着走。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
      pack.extraActions.push({ id: 'e_route_guest_old', name: '先备熟号薄礼与回话脚费', cost: 1, eff: '铜钱-70·家族+1·体魄+1', desc: '年关若把熟号、脚夫和带话人的薄礼一并省掉，明春常常就得从头求人。先把这层小钱记下，门路才不至到冬里忽然断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
      pack.extraActions.push({ id: 'e_route_wharf_old', name: '托熟号问明春水脚', cost: 1, eff: '铜钱-50·家族+1', desc: '趁年关熟号还在，先把哪条水脚肯接、哪笔旧账还可缓一旬摸明。它不立刻变现，却能让来年不至从两眼一抹黑开始。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
    } else if (S.路线.indexOf('读书应举') === 0 || S.举业结局 !== '未定' || S.生员身份 || S.优免启用) {
      pack.note = '举业一路到了晚年，看的是名色留下多少实际照应：生员能减一层外流，笔墨底子则更容易换来教馆、抄写和体面；更磨人的，是旧馆回话、伏夏纸药、秋后馆账与年关帖礼会不会在同一年里一旬旬咬回来。';
      pack.dossier = '举业结局=' + S.举业结局 + '｜生员=' + (S.生员身份 ? '是' : '否') + '｜优免=' + (S.优免启用 ? '启用' : '未启用') + '｜识字转业值=' + S.识字转业值;
      pack.event = { t: 'rel', tag: '[名色]', txt: S.生员身份 ? '名色到了晚年仍有余温：不必然给你现钱，却更容易让诸子和乡里愿意按体面来办。' : '若多年应举未成，老来能靠的不是“读过几年书”，而是这点笔墨底子能不能真换来教馆、抄写与照应。' };
      if (S.生员身份 || S.优免启用) pack.negotiateAdj += 0.10;
      else if (S.举业结局 === '屡试未第' && S.识字转业值 >= 2) pack.negotiateAdj += 0.04;
      if (S.生员身份 || (S.识字 && S.识字转业值 >= 2)) {
        pack.extraActions.push({ id: 'e_write_old', name: '凭笔墨换照应', cost: 1, eff: '铜钱+120·家族+2', desc: '老来仍可凭名色、笔墨或代书，换一点体面与照应。', can: true, once: true });
      }
      pack.extraActions.push({ id: 'e_tutor_note_old', name: '先问旧馆回话与学生口风', cost: 1, eff: '铜钱-40·家族+1', desc: '春里先把旧馆还收不收人、学生家还认不认这层字面、哪张帖子该先递问清。钱没变多，但后头的馆账和帖子才不至一齐悬着。', can: S.铜钱 >= 40, why: S.铜钱 >= 40 ? '' : '铜钱不足40文', once: true });
      pack.extraActions.push({ id: 'e_tutor_bundle_old', name: '把伏夏纸墨拆作凉药与回话脚费', cost: 1, eff: '铜钱-90·家族+1·体魄+1', desc: '伏夏最怕纸墨、凉药和递话脚费一起磨人。先把这层小账拆开，不让旧馆门路和身子一并熬薄。', can: S.铜钱 >= 90, why: S.铜钱 >= 90 ? '' : '铜钱不足90文', once: true });
      pack.extraActions.push({ id: 'e_tutor_collect_old', name: '结回旧馆润笔与抄手钱', cost: 1, eff: '铜钱+160~210·家族+1', desc: '趁秋里还走得动，把旧馆润笔、代写契纸和学生家拖着没回的那点笔墨钱真正拢回养老账。', can: true, once: true });
      pack.extraActions.push({ id: 'e_tutor_gift_old', name: '先备塾师薄礼与年关帖费', cost: 1, eff: '铜钱-70·家族+2·体魄+1', desc: '年关若把塾师、旧学生家和递帖人的薄礼一并省掉，明春常常就得从头求人。先把这层小钱记下，门路才不至到冬里忽然断线。', can: S.铜钱 >= 70, why: S.铜钱 >= 70 ? '' : '铜钱不足70文', once: true });
      pack.extraActions.push({ id: 'e_tutor_post_old', name: '先留来春帖费与纸墨定钱', cost: 1, eff: '铜钱-50·家族+1', desc: '趁旧馆门路还热，先把来春递帖、回话和纸墨定钱分开。它不立刻回现钱，却能让明春第一旬不至从冷面递帖开始。', can: S.铜钱 >= 50, why: S.铜钱 >= 50 ? '' : '铜钱不足50文', once: true });
    }
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
          } else if (a.id === 'e_shop_collect_old') {
            a.can = (season.id === 'autumn') && (S.本年养老铺账 || 0) <= 0;
            a.why = (season.id !== 'autumn') ? '这一季不便结铺里旧脚钱' : ((S.本年养老铺账 || 0) > 0 ? '本年已结过一回铺账' : '');
            a.once = true;
          } else if (a.id === 'e_shop_gift_old') {
            a.can = (season.id === 'winter') && (S.本年养老节礼 || 0) <= 0 && S.铜钱 >= 80;
            a.why = (season.id !== 'winter') ? '这一季不便续旧掌柜门路' : ((S.本年养老节礼 || 0) > 0 ? '本年已留过旧掌柜薄礼' : (S.铜钱 >= 80 ? '' : '铜钱不足80文'));
            a.once = true;
          } else if (a.id === 'e_collect_old') {
            a.can = (season.id === 'autumn') && (S.本年养老旧识 || 0) <= 0 && (S.未回款银 || 0) > 0;
            a.why = (season.id !== 'autumn') ? '这一季不便催旧账' : (((S.本年养老旧识 || 0) > 0) ? '本年已催过旧账' : ((S.未回款银 || 0) > 0 ? '' : '眼下无旧账可催'));
            a.once = true;
          } else if (a.id === 'e_wage_note_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 40;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问旧工头回话' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_wage_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 90;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏药脚账' : (S.铜钱 >= 90 ? '' : '铜钱不足90文');
            a.once = true;
          } else if (a.id === 'e_wage_collect_old') {
            a.can = (season.id === 'autumn') && xun === 2 && (S.本年养老铺账 || 0) <= 0;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便结回旧工棚欠工' : ((S.本年养老铺账 || 0) > 0 ? '本年已结过一回工账' : '');
            a.once = true;
          } else if (a.id === 'e_wage_gift_old') {
            a.can = (season.id === 'winter') && xun === 1 && (S.本年养老节礼 || 0) <= 0 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先备旧工头薄礼' : ((S.本年养老节礼 || 0) > 0 ? '本年已留过旧工头薄礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文'));
            a.once = true;
          } else if (a.id === 'e_wage_route_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先问明春工棚' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_route_price_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问春价与旧账次序' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_route_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 100;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便托熟号捎布药' : (S.铜钱 >= 100 ? '' : '铜钱不足100文');
            a.once = true;
          } else if (a.id === 'e_route_receipt_old') {
            a.can = (season.id === 'autumn') && xun === 1 && S.铜钱 >= 40;
            a.why = !(season.id === 'autumn' && xun === 1) ? '这一旬不便先抄旧账脚单' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_route_guest_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先备熟号薄礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文');
            a.once = true;
          } else if (a.id === 'e_route_wharf_old') {
            a.can = (season.id === 'winter') && xun === 3 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 3) ? '这一旬不便先问明春水脚' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
            a.once = true;
          } else if (a.id === 'e_write_old') {
            a.can = (season.id === 'spring' || season.id === 'winter') && (S.本年养老旧识 || 0) <= 0;
            a.why = (!(season.id === 'spring' || season.id === 'winter')) ? '这一季不便出门代书' : ((S.本年养老旧识 || 0) > 0 ? '本年已凭笔墨换过照应' : '');
            a.once = true;
          } else if (a.id === 'e_tutor_note_old') {
            a.can = (season.id === 'spring') && xun === 2 && S.铜钱 >= 40;
            a.why = !(season.id === 'spring' && xun === 2) ? '这一旬不便先问旧馆回话' : (S.铜钱 >= 40 ? '' : '铜钱不足40文');
            a.once = true;
          } else if (a.id === 'e_tutor_bundle_old') {
            a.can = (season.id === 'summer') && xun === 2 && S.铜钱 >= 90;
            a.why = !(season.id === 'summer' && xun === 2) ? '这一旬不便先拆伏夏纸药账' : (S.铜钱 >= 90 ? '' : '铜钱不足90文');
            a.once = true;
          } else if (a.id === 'e_tutor_collect_old') {
            a.can = (season.id === 'autumn') && xun === 2;
            a.why = !(season.id === 'autumn' && xun === 2) ? '这一旬不便结回旧馆润笔' : '';
            a.once = true;
          } else if (a.id === 'e_tutor_gift_old') {
            a.can = (season.id === 'winter') && xun === 1 && S.铜钱 >= 70;
            a.why = !(season.id === 'winter' && xun === 1) ? '这一旬不便先备年关帖礼' : (S.铜钱 >= 70 ? '' : '铜钱不足70文');
            a.once = true;
          } else if (a.id === 'e_tutor_post_old') {
            a.can = (season.id === 'winter') && xun === 2 && S.铜钱 >= 50;
            a.why = !(season.id === 'winter' && xun === 2) ? '这一旬不便先留来春帖费' : (S.铜钱 >= 50 ? '' : '铜钱不足50文');
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
            case 'e_wage_bundle_old':
              if (spendCopper(90)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·拆伏夏药脚');
                log.push(['托旧工头捎凉药与布鞋：铜钱-90、家族+1、体魄+1。不是另起主线，只是让卖工路晚景伏夏最先起皱的药脚与家用别一起熬坏。', 'good']);
              } else log.push(['想托旧工头捎凉药与布鞋，但这一旬现钱不够，只得暂缓。', 'bad']);
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
            case 'e_wage_route_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问明春工棚');
                log.push(['先问明春工棚与头程脚路：铜钱-50、家族+1。你先把来年第一程往哪处去、哪口脚费该先留摸明，不让卖工路明春又从瞎撞开始。', 'good']);
              } else log.push(['想先问明春工棚与头程脚路，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_price_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问春价');
                log.push(['先问春价与旧账次序：铜钱-50、家族+1。不是立刻回钱，而是把开春哪口该先催、哪口该先顾家理顺。', 'good']);
              } else log.push(['想先问春价与旧账次序，但这一旬现钱已被别处占住，只得暂缓。', 'bad']);
              break;
            case 'e_route_bundle_old':
              if (spendCopper(100)) {
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·捎布药');
                log.push(['托熟号捎布药回家：铜钱-100、家族+2、体魄+1。不是空等旧账，而是把伏夏最缺的布药和针线真送回锅火边。', 'good']);
              } else log.push(['想托熟号捎布药回家，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_receipt_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·抄脚单');
                log.push(['先抄旧账脚单与租路次序：铜钱-40、家族+1。把拖欠次序、租路回话和该先催的口风抄明，秋后养老账才不至继续糊着走。', 'good']);
              } else log.push(['想先抄旧账脚单与租路次序，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_write_old':
              if (S.本年养老旧识 <= 0) {
                S.本年养老旧识 = 1;
                S.铜钱 += 120; S.家族 += 2;
                pushElderSeasonTag(stepLabel + '·凭笔墨');
                log.push(['凭笔墨换照应：铜钱+120、家族+2（老来体面仍能换一点活路）', 'good']);
              }
              break;
            case 'e_tutor_note_old':
              if (spendCopper(40)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问旧馆回话');
                log.push(['先问旧馆回话与学生口风：铜钱-40、家族+1。不是立刻回钱，而是把春里该先递哪张帖子、哪家学生家还认这层字面摸明。', 'good']);
              } else log.push(['想先问旧馆回话与学生口风，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_bundle_old':
              if (spendCopper(90)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·拆伏夏纸药');
                log.push(['把伏夏纸墨拆作凉药与回话脚费：铜钱-90、家族+1、体魄+1。不是另起一条主线，只是让旧馆门路与身子不必一起熬坏。', 'good']);
              } else log.push(['想把伏夏纸墨拆作凉药与回话脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_collect_old': {
              var tutorOldGain = 160 + (S.生员身份 ? 30 : 0) + Math.min(20, Math.max(0, S.识字转业值 || 0) * 5);
              S.铜钱 += tutorOldGain;
              S.家族 += 1;
              pushElderSeasonTag(stepLabel + '·结馆账');
              log.push(['结回旧馆润笔与抄手钱：铜钱+' + tutorOldGain + '、家族+1。不是凭空添一笔，只把旧馆压着的那点笔墨钱真正拢回养老账。', 'good']);
              break;
            }
            case 'e_tutor_gift_old':
              if (spendCopper(70)) {
                S.本年养老节礼 = 1;
                S.家族 += 2; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·备年关帖礼');
                log.push(['先备塾师薄礼与年关帖费：铜钱-70、家族+2、体魄+1。不是体面消费，而是把旧馆、旧学生家和递帖人的门路先续到明春。', 'good']);
              } else log.push(['想先备塾师薄礼与年关帖费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_tutor_post_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·留来春帖费');
                log.push(['先留来春帖费与纸墨定钱：铜钱-50、家族+1。你先把明春递帖、回话和纸墨分开，不让举业路的旧门路在冬尾忽然断掉。', 'good']);
              } else log.push(['想先留来春帖费与纸墨定钱，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_guest_old':
              if (spendCopper(70)) {
                S.家族 += 1; S.体魄 += 1;
                pushElderSeasonTag(stepLabel + '·备熟号薄礼');
                log.push(['先备熟号薄礼与回话脚费：铜钱-70、家族+1、体魄+1。不是体面消费，而是把熟号、脚夫和带话人这层门路先续到明春。', 'good']);
              } else log.push(['想先备熟号薄礼与回话脚费，但这一旬现钱不够，只得暂缓。', 'bad']);
              break;
            case 'e_route_wharf_old':
              if (spendCopper(50)) {
                S.家族 += 1;
                pushElderSeasonTag(stepLabel + '·问水脚');
                log.push(['托熟号问明春水脚：铜钱-50、家族+1。你先把来年第一程能不能走、哪层旧账还可缓一旬摸明，不让明春又从瞎撞开始。', 'good']);
              } else log.push(['想托熟号问明春水脚，但这一旬现钱不够，只得暂缓。', 'bad']);
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
