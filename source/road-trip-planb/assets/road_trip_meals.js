(function () {
  // Plan B 餐饮（29天，川进滇出，10/4出发，最晚11/1回京）：菜品与用餐方式为出行建议；
  // 每人/4人价格均为“规划估算价”，反映当地常见家常正餐消费区间，不代表锁定报价。
  // 出发前请在点餐或到店时按实际菜单再次核对。

  // 目的地进店（restaurant）：写清当地适合尝试的菜与点菜组合。
  const FEATURED_MEALS = {
    1: '平遥古城内吃平遥牛肉、碗托和面食；4人点1份平遥牛肉、2份面、2份碗托、1份时蔬，住进古城步行解决。',
    2: '西安回民街 / 永兴坊吃泡馍、biangbiang面和小吃；4人点2份泡馍、1份油泼面、1份凉皮加烤串，分着尝、别吃太撑。',
    3: '广元进店吃广元凉面、剑门豆腐或川北家常菜；4人点1份凉面、1份豆腐、1份回锅肉、1份时蔬，翻秦岭后补一顿热的。',
    4: '成都第一晚吃火锅或川菜，点鸳鸯锅、控制辣度；4人点1个鸳鸯锅配肉菜拼盘和时蔬，进川藏前吃顿好的，晚到就改附近小馆。',
    10: '巴塘低海拔恢复夜，川菜藏餐都方便；4人点2份主食、1份炖肉、1份蔬菜、1份热汤，趁海拔低好好吃一顿。',
    13: '波密进店吃川菜或藏餐热食；4人点2份主食、1份炖肉或石锅鸡、1份时蔬，低海拔县城好好补一顿。',
    14: '林芝八一镇进店吃藏餐或川菜（午餐已在鲁朗吃过石锅鸡）；4人点2份主食、1份炖肉、1份时蔬，给明天林拉高速补能量。',
    16: '拉萨深度日在八廓街周边吃清淡藏餐或家常菜；4人点2份主食、1份炖菜、2份蔬菜，不饮酒，让身体在高原充分适应。',
    21: '芒康县城进店吃川菜或藏餐热食；4人点1个清淡汤锅、2份主食、1份蔬菜，海拔与弯道多的一天以易消化为主。',
    23: '香格里拉独克宗古城吃藏餐或云南菌菇餐；4人点2份主食、1份牦牛肉、1份菌汤，野生菌只吃正规店充分煮熟的。',
    24: '丽江入住后吃腊排骨、纳西菜或米线；4人合点1锅腊排骨、2份米线、1份蔬菜，下到低海拔放松吃。',
    25: '西昌邛海 / 航天大道吃火盆烧烤——西昌招牌，回程低海拔放松吃一顿；4人点烤五花、烤小猪肉、烤蔬菜配主食，别贪多。',
    26: '成都返程就近吃川菜或小吃；4人点1荤2素加主食，太古里、春熙路选择多，连续外食挑清淡家常馆。',
    27: '西安到店后吃泡馍、面食或家常菜；4人点2份主食、1份肉菜、1份时蔬，超长转场后补一顿热的。',
    28: '平遥再吃一次平遥牛肉、碗托和面食；4人点1份牛肉、2份面、1份蔬菜，住进古城后步行解决。'
  };

  // 厨房自炊（cook）：不设固定自炊日。自炊只作为“吃饭不方便时的备选”，
  // 由当天所在区域的吃饭便利度决定；大城市默认进店，不在此列。
  const COOK_MEALS = {};

  // 回家吃饭（home）
  const HOME_MEALS = {
    29: '回北京家里吃，晚餐以清淡热食为主，先卸车休息再慢慢整理物品。'
  };

  // 在哪吃（晚餐落点）：给出可核查的“餐饮商圈 / 小吃街 / 夜市”片区，停车后步行可达，不锁定单店；
  // 偏远/无餐饮街的节点如实写清“靠住宿餐或自带热食”，不臆造店名。
  const EAT_SPOT = {
    1: '平遥古城明清街 / 南大街（平遥牛肉、碗托、面食集中区），住进古城步行解决；不锁定单店。',
    2: '西安回民街 / 永兴坊（泡馍、biangbiang面、小吃集中区），停好车步行进街区。',
    3: '广元利州万达 / 老城餐饮区（广元凉面、剑门豆腐、川北家常菜）。',
    4: '成都春熙路 / 太古里餐饮区（火锅、川菜集中），住宿附近吃，不为单店跨城排队。',
    5: '新都桥镇 318 国道沿线几家牦牛肉 / 藏式家常馆，上高原第一晚就近吃清淡热食。',
    6: '理塘县城主街几家牦牛肉汤锅 / 藏面馆，高城就近吃热食暖身。',
    7: '稻城 / 日瓦（香格里拉镇）主街几家藏餐、川菜小馆，进山前一晚就近吃热的。',
    8: '亚丁徒步日，晚餐回日瓦住宿或镇上小馆吃热食，徒步后清淡易消化为主。',
    9: '理塘县城主街，返程再吃一次牦牛肉汤锅或藏面，就近解决。',
    10: '巴塘县城主街，低海拔恢复夜，川菜藏餐都方便。',
    11: '左贡县城主街几家川菜 / 藏餐小馆，县城餐饮有限、就近吃热食。',
    12: '八宿县城主街几家小馆，选择不多、就近吃热的。',
    13: '波密县城主街（川菜、藏餐集中），低海拔县城吃热菜。',
    14: '林芝八一镇步行街 / 石锅鸡一带（藏餐、川菜、鲁朗石锅鸡集中）。',
    15: '拉萨八廓街 / 甜茶馆区域，长转场到拉萨就近轻量步行吃清淡藏餐。',
    16: '拉萨八廓街 / 甜茶馆区域，深度日就近轻量步行吃饭。',
    17: '拉萨市区就近餐饮，跑保养 / 羊湖回来找营业稳定的馆子吃热饭。',
    18: '林芝八一镇步行街，反向到林芝就近吃热餐。',
    19: '然乌镇餐馆很少，靠湖边客栈餐或镇中心唯一几家小馆；不方便就自带热食。',
    20: '左贡县城主街小馆，就近吃热食。',
    21: '芒康县城主街几家川菜 / 藏餐小馆，县城餐饮有限、就近吃热食。',
    22: '飞来寺观景台一条街几家牦牛汤锅 / 家常菜馆，就近吃。',
    23: '香格里拉独克宗古城 / 月光广场周边（藏餐、菌菇馆），到店海拔仍高、注意保暖。',
    24: '丽江古城 / 忠义市场周边（腊排骨、纳西菜、米线）。',
    25: '西昌邛海 / 航天大道烧烤区（西昌火盆烧烤招牌）。',
    26: '成都春熙路 / 太古里就近吃，连续外食挑清淡家常馆。',
    27: '西安回民街 / 永兴坊或酒店附近餐饮，超长转场后就近吃热餐。',
    28: '平遥古城明清街 / 南大街，住进古城步行解决。',
    29: '回北京，在家里吃。'
  };

  // 晚餐“在哪吃”：进店晚餐的点菜建议里已写明商圈（如“回民街/永兴坊”），不再重复“在哪吃”，避免冗余；
  // 只有靠住宿餐/就近小馆/自带热食的日子，才补一句落脚说明。
  const whereToEatDinner = (day, mode) => {
    if (mode === 'restaurant') return '';
    if (EAT_SPOT[day.day]) return EAT_SPOT[day.day];
    if (mode === 'home') return '在家吃。';
    if (mode === 'lodging') return '这一带没有像样的餐饮街，靠客栈 / 酒店餐或住宿附近唯一几家小馆；不方便就用自热饭/自热麻辣烫或煮米线泡面（遵守当地防火管制）。';
    return '住宿步行范围内找一家营业稳定、出餐快的小馆吃热食；实在没有合适的店，就用自热饭/自热麻辣烫或煮米线泡面。';
  };

  // 午餐“在哪吃”：徒步/长途多为路餐，写清没有餐馆时怎么办。
  const whereForLunch = day => {
    if (day.type === 'hike') return '徒步途中没有餐馆，全靠自带午餐；出山回住宿地再吃正餐。';
    if (day.type === 'mixed') return '接驳 + 徒步组合，沿途餐饮不稳定，先吃自带餐，遇到可靠热食节点再补一碗汤面。';
    if (day.distanceKm >= 400) return '长途高速沿线以自带热食为主，非必要不进服务区；路过可靠县城可下道吃碗热食。';
    if (['rest', 'local', 'service'].includes(day.type)) return '中午在当天城市餐饮区坐下吃，把当地特色放在午餐。';
    return '沿途可靠县城主街吃碗热食，或吃自带路餐；尽量不在高速服务区吃。';
  };

  // 偏远/高海拔/徒步/晚到节点，晚餐以住宿或就近可靠热食为主（lodging）。
  const REMOTE_DAYS = new Set([7, 8, 9, 12, 19, 20, 22]);

  // “自带食材·怎么带”：只在真正要靠自带热食的日子给出——徒步/接驳/长途高速/偏远住宿。
  // 补货节点写清「买多少 + 撑几天」；数量为 4 人估算，按实际食量增减。
  // 蔬果常温保质期（车载阴凉、别闷塑料袋）：黄瓜 3—4 天最不耐放先吃、圣女果/胡萝卜 5—7 天、苹果 7—10 天最耐放垫后；
  // 苹果会释放乙烯催熟别的，单独放。原则：在每个补给点只买够撑到下一个补给点的量，边走边吃、吃完在下个节点补，不囤到坏。
  const RESTOCK_NOTE = {
    4: '成都大补给（进藏前唯一一次囤够，撑 D5—D17 拉萨这 13 天）——在成都大型超市/永辉一次配齐：自热米饭/自热麻辣烫 约30—36 盒、米线/泡面 约16—20 份、单独料包若干（备着减盐用）、火腿肠/午餐肉 约20 根/罐、卤蛋当天煮 16—20 个、异丁烷+丙烷高山混合气罐 3—4 罐（勿买纯丁烷，高原低温点不着）。蔬果分批策略：黄瓜只买 2—3 天量（3—4 天就蔫，先吃），圣女果/胡萝卜各买 5—7 天量，苹果买足能放 10 天（最耐放、单独放别催熟别的）；蔬果吃完不用等大补给，沿途理塘/巴塘/波密县城随时补新鲜的。同时取车验车、洗衣。全程不依赖冷冻，靠常温速食。',
    7: '香格里拉镇（日瓦）亚丁进山路餐（只备 1 天长线用，不囤）：三明治/饭团 每人 1—2 个、熟牛肉/火腿 约1 斤、水煮蛋 6—8 个、坚果 2 袋、巧克力/能量棒 6—8 根、水果若干（苹果/橘子耐揣好带），另备氧气、保暖和每人 1.5L 以上饮水，长线全程随身背。',
    10: '巴塘县城补新鲜蔬果（成都带的黄瓜已吃完、圣女果也差不多）：低海拔县城超市/菜市补黄瓜、圣女果、苹果各 2—3 天量，趁海拔低吃顿有蔬菜的正餐；速食主食这里还够，不用大补。',
    13: '波密县城补给（低海拔、物资较全）：补新鲜蔬果各 3—4 天量续上，自热盒饭/泡面若见底补 6—8 盒到拉萨，气罐够就不补。',
    17: '拉萨机动日补给（补到够 D18—D24 丽江这 7 天用）：自热米饭 约18—22 盒、米线/泡面 约10 份、气罐 2 罐、卤蛋/午餐肉补一轮、蔬果按“黄瓜少买勤补、苹果多备”原则再配 5—7 天量。同时在店里认真吃几顿有蔬菜蛋白的正餐，把速食日欠的营养补回来。',
    24: '丽江返程补给（补 D25—D29 高速日午餐，约 5 天）：自热米饭/麻辣烫 约14—18 盒、卤蛋/午餐肉补一轮；蔬果随买随吃不用大囤（往后全程低海拔成熟高速，西昌/攀枝花随处能买）；住带厨房整套房，当天可买菜现做一顿热的放松。'
  };
  // 每顿常温速食的“具体吃多少”（4 人一顿的量），写进各类型午餐/兜底晚餐。
  const PORTION = {
    hwy: '自热盒饭 4 盒（每人 1 盒）或自热麻辣烫 4 份',
    mx: '米线/泡面 4 份（每人 1 份），料包只下一半降钠',
    boost: '每人加 1 个卤蛋或 1 根火腿肠 + 一把耐放蔬果（按黄瓜→圣女果/胡萝卜→苹果的顺序先吃易坏的）补蛋白和维C'
  };
  const carryNote = day => {
    const restock = RESTOCK_NOTE[day.day] ? '　补给：' + RESTOCK_NOTE[day.day] : '';
    if (day.type === 'hike') return '前一晚在住宿把三明治/饭团（每人 1—2 个）、水煮蛋（每人 1—2 个）、熟肉、坚果、水果装进背包保温袋；徒步全程随身带，出山回住宿再吃正餐。' + restock;
    if (day.type === 'mixed') return `带上 ${PORTION.hwy} 或泡好的 ${PORTION.mx}，接驳段随身背，遇可靠热食点再补碗汤面。` + restock;
    if (day.distanceKm >= 400) return `长途高速日午餐走常温速食：${PORTION.hwy}，或 ${PORTION.mx}；${PORTION.boost}。即开即热不依赖冷链，主食口味每天换着来别重复。` + restock;
    if (REMOTE_DAYS.has(day.day)) return `这一带餐饮少：晚餐靠住宿餐或就近小馆，吃不惯就 ${PORTION.hwy}，或用高山炉煮 ${PORTION.mx}（丢 4 个鸡蛋 + 一把耐放菜同煮，料包减量降钠；只在通风露天处点火，守当地防火管制）。` + restock;
    return restock ? restock.replace(/^　/, '') : '';
  };

  const DAILY = window.ROAD_TRIP_DAY_DATA;
  if (!DAILY) return;

  // 区域价格档：反映当地常见家常正餐的每人消费区间（元）。
  // city=成熟城市/低海拔县城；village=进山客栈/景区村；plateau=高原偏远小镇；return=返程内地城市。
  const REGION = {};
  const setRegion = (tier, days) => days.forEach(day => { REGION[day] = tier; });
  setRegion('city', [1, 2, 3, 4, 10, 13, 14]);
  setRegion('village', [7, 8, 9]);
  setRegion('plateau', [5, 6, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  setRegion('return', [24, 25, 26, 27, 28, 29]);

  const DINNER_PERPAX = {
    restaurant: { city: [60, 110], village: [60, 100], plateau: [55, 95], recovery: [65, 105], return: [70, 130] },
    lodging: { city: [45, 80], village: [50, 90], plateau: [45, 85], recovery: [50, 85], return: [45, 80] },
    nearby: { city: [40, 75], village: [45, 80], plateau: [40, 75], recovery: [45, 80], return: [40, 75] }
  };

  const round5 = value => Math.round(value / 5) * 5;
  const perPaxToParty4 = range => [round5(range[0] * 4), round5(range[1] * 4)];

  const breakfastFor = day => {
    const region = REGION[day.day] || 'city';
    if (day.day === 29) return { plan: '回京后在家或路上简单吃：主食、鸡蛋和水果，先补觉；饭后把车加油准备还车。', perPax: [0, 20] };
    if (['rest', 'local', 'service'].includes(day.type)) {
      return { plan: '休整日可在酒店吃早餐或出门吃当地早点（面片、包子、粥、甜茶等），从容一点。', perPax: [15, 35] };
    }
    if (region === 'village' || region === 'plateau') {
      return { plan: '客栈/酒店早餐或前夜采购：牛奶、鸡蛋、面包/馕、燕麦，配热水或热粥，司机不空腹出发。', perPax: [15, 35] };
    }
    return { plan: '酒店早餐或自备：牛奶/酸奶 + 鸡蛋 + 面包/包子 + 水果；长途日不为早餐排队。', perPax: [20, 40] };
  };

  const lunchFor = day => {
    if (day.type === 'hike') {
      return { plan: '自带三明治/饭团、鸡蛋或熟肉、坚果、水果和足量饮水；能量棒只作加餐，不当正餐。', perPax: [25, 45], backup: '' };
    }
    if (day.type === 'mixed') {
      return { plan: '接驳+徒步组合日：自带完整便携午餐，遇到可靠热食节点再补一碗汤面。', perPax: [25, 50], backup: '若接驳耽搁，先吃自带餐，热食顺路再补。' };
    }
    if (day.distanceKm >= 400) {
      return { plan: '以常温速食为主：自热米饭·自热麻辣烫，或米线泡面配料包、户外煮一锅面，加个鸡蛋和耐放蔬果凑成主食+蛋白+蔬菜。全程不依赖冷冻，非必要不进服务区。', perPax: [30, 55], backup: '路过可靠县城可下高速吃碗热食；实在赶不及才在服务区快吃，不为餐馆折返绕路。' };
    }
    if (['rest', 'local', 'service'].includes(day.type)) {
      return { plan: '中午可以坐下吃，把当地特色放在午餐，晚餐更轻；主食、肉菜和蔬菜各一份。', perPax: [40, 80], backup: '' };
    }
    return { plan: '优先常温速食或沿途可靠县城热食：自热米饭·自热麻辣烫、米线泡面配料包或户外煮均可，至少含主食、蛋白质和水果；尽量不进服务区。', perPax: [30, 55], backup: '' };
  };

  const dinnerFor = day => {
    const region = REGION[day.day] || 'city';
    let mode; let label; let plan;
    if (FEATURED_MEALS[day.day]) { mode = 'restaurant'; label = '目的地进店'; plan = FEATURED_MEALS[day.day]; }
    else if (COOK_MEALS[day.day]) { mode = 'cook'; label = '厨房自炊'; plan = COOK_MEALS[day.day]; }
    else if (HOME_MEALS[day.day]) { mode = 'home'; label = '回家吃饭'; plan = HOME_MEALS[day.day]; }
    else if (REMOTE_DAYS.has(day.day)) { mode = 'lodging'; label = '住宿热餐'; plan = '用客栈/酒店餐或最近的可靠小馆解决：只选现做、全熟、热着上桌的主食、蛋白质和蔬菜，不用零食顶晚饭。'; }
    else { mode = 'nearby'; label = '就近热餐'; plan = '在住宿步行范围内吃一顿简单热饭，优先营业稳定、出餐快的餐馆，保证蔬菜、蛋白质和主食。'; }

    if (mode === 'cook') {
      const party4 = [120, 220];
      return { mode, label, plan, perPax: [round5(party4[0] / 4), round5(party4[1] / 4)], party4, priceNote: '按4人一顿自炊的食材采购估算' };
    }
    if (mode === 'home') {
      return { mode, label, plan, perPax: [0, 25], party4: [0, 100], priceNote: '在家用餐，不计入行程餐饮预算' };
    }
    const perPax = DINNER_PERPAX[mode][region];
    return { mode, label, plan, perPax, party4: perPaxToParty4(perPax), priceNote: '当地常见家常正餐估算区间' };
  };

  // 逐日手写明细：覆盖按类型批量生成的早/午餐模板，并提供“今日安排”叙述。
  const DETAIL = window.ROAD_TRIP_DAILY_DETAIL || {};

  const meals = DAILY.days.map(day => {
    const breakfast = breakfastFor(day);
    const lunch = lunchFor(day);
    const dinner = dinnerFor(day);
    lunch.where = whereForLunch(day);
    dinner.where = whereToEatDinner(day, dinner.mode);
    const detail = DETAIL[day.day];
    if (detail && detail.bf) breakfast.plan = detail.bf;
    if (detail && detail.ln) lunch.plan = detail.ln;
    if (detail && detail.dn) dinner.plan = detail.dn;
    const todo = detail && detail.todo ? detail.todo : '';
    const prep = detail && detail.prep ? detail.prep : '';
    const carry = carryNote(day);
    const dayTotal4 = [
      round5(breakfast.perPax[0] * 4 + lunch.perPax[0] * 4 + dinner.party4[0]),
      round5(breakfast.perPax[1] * 4 + lunch.perPax[1] * 4 + dinner.party4[1])
    ];
    return { day: day.day, todo, breakfast, lunch, dinner, prep, carry, dayTotal4 };
  });

  const dinnerCounts = meals.reduce((counts, meal) => {
    counts[meal.dinner.mode] = (counts[meal.dinner.mode] || 0) + 1;
    return counts;
  }, {});

  window.ROAD_TRIP_MEAL_DATA = {
    meta: {
      version: 'planb-daily-meals-v4',
      updatedAt: '2026-08-21',
      priceNature: '规划估算价',
      priceBasis: '价格反映当地常见家常正餐消费区间，用于行程预算，不代表锁定报价；点餐或到店时以实际菜单为准。',
      kitchenNights: [],
      plannedCookDinners: [],
      note: '不设固定自炊日。原则：吃饭方便就进店尝当地特色；只有偏远、吃不惯或吃饭不便的节点才考虑自己弄（民宿开火或常温速食均可，并遵守当地防火管制）。长途午餐默认常温速食（自热米饭·自热麻辣烫、米线泡面或户外煮），优先路过可靠县城热食；非必要不在高速服务区吃饭。'
    },
    dinnerCounts,
    meals
  };
})();
