(function () {
  // Plan B 统一费用数据（36天，川进滇出，10/9出发）：门票、区间车、停车、接驳、油费与高速费，
  // 以及当天预算合计。所有金额均为“规划估算价”（区间），用于行程预算，不代表锁定报价。
  // 油费/高速费由当天里程按下方假设推算；门票/区间车/停车为常见消费区间的估算，
  // 出发前必须用官方票务、订单页或实时导航再次核验。

  const DAILY = window.ROAD_TRIP_DAY_DATA;
  const POI = window.ROAD_TRIP_POI_DATA;
  if (!DAILY) return;

  const round5 = value => Math.round(value / 5) * 5;

  // —— 油费假设 ——
  // 坦克300四驱综合油耗约 11—14 L/100km（含高海拔与满载），92#油价按 7.4—8.4 元/L 估算。
  const FUEL = { consumptionLow: 11, consumptionHigh: 14, priceLow: 7.4, priceHigh: 8.4 };
  // —— 高速费假设 ——
  // 走高速的日子按约 0.45—0.55 元/km 估算；国道段（G318/G214/稻城公路等）无过路费。
  const TOLL = { rateLow: 0.45, rateHigh: 0.55 };

  // 明确以高速为主的日子（其余按国道/景区路计，无高速费）。
  // 进川转场 D1—D4 全程高速；D5 雅康高速段收费；进出藏主体走 G318/G214 国道不计费；
  // D17/D21 林拉高速；回程 D30 丽攀、D31 雅西、D33—D36 京昆/京港澳。
  const EXPRESSWAY_DAYS = new Set([1, 2, 3, 4, 5, 17, 21, 30, 31, 33, 34, 35, 36]);

  const fuelForKm = km => {
    if (!km) return [0, 0];
    const low = km / 100 * FUEL.consumptionLow * FUEL.priceLow;
    const high = km / 100 * FUEL.consumptionHigh * FUEL.priceHigh;
    return [round5(low), round5(high)];
  };
  const tollForDay = day => {
    if (!EXPRESSWAY_DAYS.has(day.day) || !day.distanceKm) return [0, 0];
    return [round5(day.distanceKm * TOLL.rateLow), round5(day.distanceKm * TOLL.rateHigh)];
  };

  // —— 门票 / 区间车 / 停车 / 接驳（按天，4人合计区间，元）——
  // type: ticket=门票, shuttle=区间车/景区观光车, transfer=接驳/包车, parking=停车
  // nature 统一为“规划估算价”，避免把单次搜索价当成固定价；出发前逐项核验。
  const t = (name, type, party4) => ({ name, type, party4 });
  const TICKETS = {
    4: [t('剑门关门票+景区观光车（顺路半日，不追求全程徒步）', 'shuttle', [440, 620])],
    8: [t('稻城亚丁门票+景区观光车（长线，抢11/20停线前）', 'shuttle', [800, 1200]), t('洛绒牛场电瓶车（按需，可步行）', 'shuttle', [0, 320])],
    9: [t('稻城亚丁次日观光车（短线，同一景区二次进入）', 'shuttle', [320, 520])],
    14: [t('然乌湖 / 米堆冰川方向门票或景交（视天气与道路，可不进）', 'shuttle', [0, 400])],
    25: [t('飞来寺梅里雪山观景台门票（看天，日照金山不作硬目标）', 'ticket', [0, 320])],
    27: [t('普达措国家公园门票+区间车（择机，或改独克宗古城/松赞林寺）', 'shuttle', [0, 900])],
    28: [t('虎跳峡上虎跳观景台门票+桥头停车（只观景，不走高路徒步）', 'ticket', [120, 320])],
    29: [t('玉龙雪山门票+索道+环保车（看天气可选，可不上）', 'shuttle', [0, 1400])]
  };

  // Plan B 走川藏进、滇藏出，不经边境管理区，无需边防证；亚丁门票需提前网上预约。
  const PERMIT_NOTE = { day: 7, name: '稻城亚丁门票与观光车建议提前在官方渠道预约并核对当期开放/停线信息；本段无边境管理区，不需办边防证。' };

  // 住宿价格：从 POI stay 数据读取（4人当晚总价区间），无价则不计入当日合计。
  const stayPrice = stayId => {
    if (!POI) return null;
    const stay = POI.pois.find(poi => poi.id === stayId);
    if (!stay || !stay.priceParty4) return null;
    return stay.priceParty4; // [low, high]
  };

  const items = DAILY.days.map(day => {
    const fuel = fuelForKm(day.distanceKm);
    const toll = tollForDay(day);
    const fuelToll = [fuel[0] + toll[0], fuel[1] + toll[1]];
    const tickets = (TICKETS[day.day] || []).map(entry => ({ ...entry }));
    const ticketTotal = tickets.reduce((sum, entry) => [sum[0] + entry.party4[0], sum[1] + entry.party4[1]], [0, 0]);
    const stay = day.stayId ? stayPrice(day.stayId) : null;
    return {
      day: day.day,
      fuel, toll, fuelToll,
      tickets, ticketTotal,
      stayParty4: stay,
      permitNote: PERMIT_NOTE.day === day.day ? PERMIT_NOTE.name : ''
    };
  });

  window.ROAD_TRIP_COST_DATA = {
    meta: {
      version: 'planb-daily-costs-v1',
      updatedAt: '2026-08-18',
      priceNature: '规划估算价',
      fuelAssumption: `油耗 ${FUEL.consumptionLow}—${FUEL.consumptionHigh} L/100km，油价 ${FUEL.priceLow}—${FUEL.priceHigh} 元/L`,
      tollAssumption: `高速日约 ${TOLL.rateLow}—${TOLL.rateHigh} 元/km，国道与景区路不计过路费`,
      disclaimer: '门票、区间车、接驳、停车、油价与高速费均为估算区间，用于行程预算；出发前请用官方票务、订单页或实时导航核验，不代表锁定报价。'
    },
    items
  };
})();
