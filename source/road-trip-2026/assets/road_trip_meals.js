(function () {
  // 说明：菜品与用餐方式为出行建议；每人/4人价格均为“规划估算价”，
  // 反映当地常见家常正餐消费区间，不代表某家餐馆的锁定报价。
  // 出发前请在点餐或到店时按实际菜单再次核对。

  // 目的地进店（restaurant）：写清当地适合尝试的菜与点菜组合。
  const FEATURED_MEALS = {
    1: '巴彦淖尔临河进店吃河套焖面或清炖羊肉；4人点1份焖面、1份炖羊肉、1个凉拌菜和1份时蔬，主食管够、分量不过量。',
    2: '张掖进店吃搓鱼面、牛羊肉和当地家常菜；4人点2份主食面、1份牛羊肉、1份炒时蔬，给次日 G227 留体力。',
    4: '德令哈进店吃炕锅羊肉或青海面片；4人点1个炕锅、2份面片、1份绿叶菜，主动加一份蔬菜。',
    6: '敦煌进店吃驴肉黄面或胡羊焖饼；4人点2份黄面、1份焖饼、1份凉菜；公寓虽有厨房，这晚以进店为主。',
    7: '哈密进店吃手抓饭、烤包子和新疆家常菜；4人点2份抓饭、4个烤包子、1份拌菜，第一次入疆控制油腻。',
    8: '木垒县城进店吃羊肉焖饼或一荤一素热菜；4人点1份焖饼、1份炒菜、1份汤，早点收餐休息。',
    10: '布尔津补给后吃当地冷水鱼或新疆炒菜；4人合点1条烤/炖鱼、1份大盘鸡、1份时蔬，别拖成夜宵。',
    14: '乌尔禾到店后吃新疆家常热菜；4人点2份主食、1份过油肉或拌面、1份蔬菜，长转场后从简。',
    15: '伊宁安排手抓饭、烤肉和拌面；4人分点2份抓饭、6串烤肉、1份拌面，配酸奶和蔬菜。',
    16: '特克斯八卦城内坐下吃汤饭和牛羊肉；4人点2份汤饭、1份手抓肉、1份蔬菜，优先热汤热饭。',
    17: '库车进店吃大盘鸡或馕坑肉；4人合点1份大盘鸡配皮带面、1份烤肉、1份蔬菜，不喝酒、不吃过饱。',
    18: '库车休整日再选本地小馆，午餐吃特色、晚餐转清淡；4人点1荤2素加主食汤面即可。',
    19: '阿克苏进店吃手抓饭、拌面或椒麻鸡；4人点2份主食、1份椒麻鸡、1份蔬菜，补足蛋白质。',
    20: '喀什第一晚在古城周边吃正餐，特色小吃分着尝；4人点2份主食、1份烤肉、1份蔬菜，不拿零食顶晚饭。',
    22: '返回喀什后进店吃热饭，重点补主食、蛋白质和蔬菜；4人点2份主食、1份肉菜、1份时蔬。',
    23: '新藏线前最后一顿城市正餐：全熟、清淡、少油、不饮酒；4人点2份主食、1份清炖肉、2份蔬菜。',
    28: '狮泉河恢复日坐下吃完整热餐；4人点2份主食、1份肉、1份蛋、1份蔬菜，主食肉蛋菜都要有。',
    32: '日喀则进店吃藏餐或川菜热食；4人点2份主食、1份牦牛肉、1份蔬菜、1份热汤，不用一顿补偿前几天。',
    33: '拉萨恢复段第一晚选清淡藏餐或家常菜；4人点2份主食、1份炖菜、2份蔬菜，继续不饮酒。',
    36: '拉萨连续恢复结束前吃一次藏面、甜茶或牦牛肉；4人点2份藏面、1份牦牛肉、1壶甜茶、1份蔬菜。',
    38: '林芝进店吃本地热菜；4人点2份主食、1份石锅鸡或炖肉、1份时蔬，给下一段 G318 补能量。',
    39: '鲁朗石锅鸡放在白天正餐窗口，4人合吃1锅配主食和蔬菜；到波密后晚餐从简，一荤一素加主食。',
    45: '芒康县城进店吃热菜；4人点1个清淡汤锅、2份主食、1份蔬菜，海拔与弯道多的一天以易消化为主。',
    46: '飞来寺附近吃牦牛肉汤锅或家常菜；4人合吃1锅配2份主食、1份蔬菜，观景不作为熬夜理由。',
    51: '雨崩出山后的第一顿正式恢复餐放在香格里拉；4人点1个汤锅、2份主食、2份蔬菜，优先热汤蔬菜。',
    52: '香格里拉再留一顿藏式或云南特色餐；4人点2份主食、1份牦牛肉、1份菌汤，野生菌只吃正规店充分煮熟的。',
    55: '丽江入住后吃腊排骨、纳西菜或米线；4人合点1锅腊排骨、2份米线、1份蔬菜，次日再用民宿厨房。',
    63: '成都第一晚吃火锅或川菜，点鸳鸯锅、控制辣度；4人点1个鸳鸯锅配肉菜拼盘和时蔬，晚到就改附近小馆。',
    67: '平遥吃平遥牛肉、碗托和面食；4人点1份牛肉、2份面、2份碗托、1份蔬菜，住进古城后步行解决。',
    68: '石家庄最后一个外地夜吃酒店附近热餐；4人点2份主食、1份肉菜、2份蔬菜，就近吃即可。'
  };

  // 厨房自炊（cook）：仅用于已确认有厨房且从容的恢复日。
  const COOK_MEALS = {
    56: '丽江民宿自炊：白天在忠义市场采购蔬菜、鸡蛋、豆制品和肉类，晚上做一荤两素加主食。',
    64: '成都公寓自炊：用清淡家常菜给连续外食降油盐，顺便清理可带走的食材。',
    66: '西安民宿自炊：午餐在外尝小吃，晚餐回住处做一荤两素，为返京长途段恢复。'
  };

  // 回家吃饭（home）
  const HOME_MEALS = {
    69: '回北京家里吃，晚餐以清淡热食为主，先休息再整理车辆物品。',
    70: '在家正常吃饭，还车前保持常规饮食。'
  };

  // 偏远/高海拔/徒步/晚到节点，晚餐以住宿或就近可靠热食为主（lodging）。
  const REMOTE_DAYS = new Set([11, 12, 13, 21, 25, 26, 27, 29, 30, 31, 41, 42, 43, 44, 47, 48, 49, 50, 53, 54, 57, 58, 59, 60, 61, 62]);

  const DAILY = window.ROAD_TRIP_DAY_DATA;
  if (!DAILY) return;

  // 区域价格档：反映当地常见家常正餐的每人消费区间（元）。
  // city=成熟城市；village=进山客栈/景区村；plateau=高原偏远小镇；return=返程内地城市。
  const REGION = {};
  const setRegion = (tier, days) => days.forEach(day => { REGION[day] = tier; });
  setRegion('city', [1, 2, 4, 6, 7, 8, 10, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24]);
  setRegion('village', [11, 12, 13, 21, 47, 48, 49, 53, 54, 55, 56, 58, 59, 60]);
  setRegion('plateau', [3, 5, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 57, 61, 62]);
  setRegion('recovery', [50, 51, 52]);
  setRegion('return', [63, 64, 65, 66, 67, 68, 69, 70]);

  const DINNER_PERPAX = {
    restaurant: { city: [60, 110], village: [60, 100], plateau: [55, 95], recovery: [65, 105], return: [70, 130] },
    lodging: { city: [45, 80], village: [50, 90], plateau: [45, 85], recovery: [50, 85], return: [45, 80] },
    nearby: { city: [40, 75], village: [45, 80], plateau: [40, 75], recovery: [45, 80], return: [40, 75] }
  };

  const round5 = value => Math.round(value / 5) * 5;
  const perPaxToParty4 = range => [round5(range[0] * 4), round5(range[1] * 4)];

  const breakfastFor = day => {
    const region = REGION[day.day] || 'city';
    if (day.day === 70) return { plan: '在家吃常规早餐：牛奶或豆浆、鸡蛋、主食和水果。', perPax: [0, 15] };
    if (day.day === 69) return { plan: '回京后在家或路上简单吃：主食、鸡蛋和水果，先补觉。', perPax: [0, 20] };
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
      return { plan: '服务区或沿线县城快吃，车上另备一份完整冷餐；主食+蛋白质+水果齐全。', perPax: [35, 65], backup: '错过县城就吃车上备餐，不为餐馆折返绕路。' };
    }
    if (['rest', 'local', 'service'].includes(day.type)) {
      return { plan: '中午可以坐下吃，把当地特色放在午餐，晚餐更轻；主食、肉菜和蔬菜各一份。', perPax: [40, 80], backup: '' };
    }
    return { plan: '沿途县城吃热食或用自备路餐，至少包含主食、蛋白质和水果。', perPax: [30, 55], backup: '' };
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

  const meals = DAILY.days.map(day => {
    const breakfast = breakfastFor(day);
    const lunch = lunchFor(day);
    const dinner = dinnerFor(day);
    // 当天餐饮合计（4人）：早餐、午餐按每人区间×4，晚餐用party4。
    const dayTotal4 = [
      round5(breakfast.perPax[0] * 4 + lunch.perPax[0] * 4 + dinner.party4[0]),
      round5(breakfast.perPax[1] * 4 + lunch.perPax[1] * 4 + dinner.party4[1])
    ];
    return { day: day.day, breakfast, lunch, dinner, dayTotal4 };
  });

  const dinnerCounts = meals.reduce((counts, meal) => {
    counts[meal.dinner.mode] = (counts[meal.dinner.mode] || 0) + 1;
    return counts;
  }, {});

  window.ROAD_TRIP_MEAL_DATA = {
    meta: {
      version: 'daily-meals-v2',
      updatedAt: '2026-08-16',
      priceNature: '规划估算价',
      priceBasis: '价格反映当地常见家常正餐消费区间，用于行程预算，不代表锁定报价；点餐或到店时以实际菜单为准。',
      kitchenNights: [6, 55, 56, 63, 64, 65, 66],
      plannedCookDinners: [56, 64, 66],
      note: '仅自炊日（丽江、成都、西安）才要求厨房；其余住宿按位置、价格和休息安排，不做饭就不考虑厨房，也不安排开火。'
    },
    dinnerCounts,
    meals
  };
})();
