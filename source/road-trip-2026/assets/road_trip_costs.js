(function () {
  // 统一费用数据：门票、区间车、停车、接驳、油费与高速费，以及当天预算合计。
  // 所有金额均为“规划估算价”（区间），用于行程预算，不代表锁定报价。
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
  // 走高速的日子按约 0.45—0.55 元/km 估算；国道段（G219/G318/G227/G314/G214/独库等）无过路费。
  const TOLL = { rateLow: 0.45, rateHigh: 0.55 };

  // 明确以高速为主的日子（其余按国道/景区路计，无高速费）。
  const EXPRESSWAY_DAYS = new Set([1, 2, 6, 7, 15, 19, 20, 63, 65, 67, 68, 69]);

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
  // type: ticket=门票, shuttle=区间车/景区观光车, transfer=接驳/包车, parking=停车, permit=边境证件
  // nature 统一为“规划估算价”，避免把单次搜索价当成固定价；出发前逐项核验。
  const t = (name, type, party4) => ({ name, type, party4 });
  const TICKETS = {
    2: [t('张掖七彩丹霞门票+区间车（视到达时间与光线决定是否进）', 'ticket', [280, 440])],
    11: [t('喀纳斯景区门票+区间车（含白哈巴方向，按当期边防规则）', 'shuttle', [520, 900])],
    12: [t('喀纳斯三湾+禾木景区区间车', 'shuttle', [240, 480])],
    13: [t('禾木景区内换乘/区间车（美丽峰方向按当期规则）', 'shuttle', [0, 240])],
    14: [t('五彩滩门票（魔鬼城视到达时间可选）', 'ticket', [120, 320])],
    15: [t('赛里木湖门票+区间车', 'shuttle', [280, 520])],
    17: [t('那拉提或巴音布鲁克门票+区间车（择一，按当天路况）', 'shuttle', [400, 760])],
    21: [t('卡拉库勒湖/白沙湖帕米尔景区门票（按当期规则）', 'ticket', [0, 400])],
    42: [t('来古冰川门票+景区交通（视道路与开放状态）', 'shuttle', [0, 400])],
    47: [t('西当停车场停车（多日）', 'parking', [40, 120]), t('雨崩景区门票+西当往返越野车', 'shuttle', [520, 900])],
    48: [t('雨崩冰湖方向骡马备用（按需，可不选）', 'transfer', [0, 800])],
    49: [t('雨崩神瀑方向骡马备用（按需，可不选）', 'transfer', [0, 800])],
    50: [t('尼农出口至西当停车点接驳（务必提前预约）', 'transfer', [200, 480])],
    53: [t('虎跳峡高路徒步门票+桥头停车', 'parking', [120, 320])],
    55: [t('Tina\'s 回桥头取车接驳（班车或包车）', 'transfer', [120, 320])],
    59: [t('稻城亚丁门票+景区观光车（长线）', 'shuttle', [800, 1200]), t('洛绒牛场电瓶车（按需，可步行）', 'shuttle', [0, 320])],
    60: [t('稻城亚丁次日观光车（同一景区二次进入）', 'shuttle', [320, 520])]
  };

  // 边境证件：全程一次性办理，不逐日计费，这里标注在 D24 出发新藏线前提示。
  const PERMIT_NOTE = { day: 24, name: '边防证（喀什塔县、阿里、日喀则方向）为提前办理项，本身通常不额外收费；请按当期政策确认覆盖范围。' };

  // 住宿价格：从 POI stay 数据读取（4人当晚总价区间）。
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
      version: 'daily-costs-v1',
      updatedAt: '2026-08-16',
      priceNature: '规划估算价',
      fuelAssumption: `油耗 ${FUEL.consumptionLow}—${FUEL.consumptionHigh} L/100km，油价 ${FUEL.priceLow}—${FUEL.priceHigh} 元/L`,
      tollAssumption: `高速日约 ${TOLL.rateLow}—${TOLL.rateHigh} 元/km，国道与景区路不计过路费`,
      disclaimer: '门票、区间车、接驳、停车、油价与高速费均为估算区间，用于行程预算；出发前请用官方票务、订单页或实时导航核验，不代表锁定报价。'
    },
    items
  };
})();
