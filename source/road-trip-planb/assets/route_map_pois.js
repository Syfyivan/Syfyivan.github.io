(function () {
  const categories = {
    stay: { label: '全程住宿', short: '住', color: '#7c3aed', defaultVisible: true },
    scenic: { label: '景点与徒步', short: '景', color: '#059669', defaultVisible: true },
    food: { label: '吃饭区域', short: '吃', color: '#ea580c', defaultVisible: true },
    supply: { label: '采购与加油', short: '补', color: '#2563eb', defaultVisible: false },
    toilet: { label: '厕所参考点', short: '厕', color: '#0f766e', defaultVisible: false },
    service: { label: '医疗与救援', short: '医', color: '#dc2626', defaultVisible: false }
  };

  // Plan B（川进滇出）路段说明：与 days.js 的 36 天骨架对应。
  const segmentNotes = {
    'seg-01': { roads: 'G5 / G20', note: '北京—平遥—西安的华北高速压缩段；按服务区节奏停车，不为吃饭临时下高速。' },
    'seg-02': { roads: 'G5 京昆高速', note: '西安经秦岭入蜀到广元、成都，隧道多、限速严，按导航实时限速走。' },
    'seg-03': { roads: 'G318 / 雅康高速', note: '成都翻二郎山、折多山正式上高原，遇雪按实时管制走。' },
    'seg-04': { roads: 'G318 / 稻城公路', note: '新都桥—理塘—稻城—日瓦，抢亚丁长线窗口。' },
    'seg-05': { roads: 'G318', note: '理塘—巴塘—芒康—左贡—八宿，川藏正式进藏段。' },
    'seg-06': { roads: 'G318', note: '八宿—然乌—波密—林芝—拉萨，翻业拉山72拐与色季拉山。' },
    'seg-07': { roads: 'G4218 林拉高速', note: '拉萨深度恢复后反向回林芝、芒康，衔接滇藏线。' },
    'seg-08': { roads: 'G214 滇藏线', note: '芒康—德钦—飞来寺—香格里拉—丽江，翻白马雪山垭口。' },
    'seg-09': { roads: 'G5 京昆 / 雅西高速', note: '丽江—攀枝花—西昌—成都，走低海拔雅西线冬季更稳。' },
    'seg-10': { roads: 'G5 京昆 / G4', note: '成都—西安—平遥—石家庄—北京的回程高速段。' }
  };

  const pois = [
    // —— 全程 20 个住宿（川进滇出，10/9 出发；多次入住的酒店合并为一条）——
    { id: 'stay-pingyao', category: 'stay', name: '平遥一得客栈', lng: 112.180, lat: 37.204, area: 'N1 / N19 平遥', note: '10月9—10日与11月11—12日各1晚；客栈房2间，古城外停车步行入住。' },
    { id: 'stay-xian', category: 'stay', name: '西安千浔民宿', lng: 109.008616, lat: 34.332446, area: 'N2 / N18 西安', note: '10月10—11日与11月10—11日各1晚；首选两室一厅整套房，可做饭，停车另收费。', bookingUrl: 'https://us.trip.com/hotels/xi-an-hotel-detail-78099745/xi-an-qianxun-homestay/' },
    { id: 'stay-guangyuan', category: 'stay', name: '广元利州皇冠假日酒店', lng: 105.843357, lat: 32.435435, area: 'N3 广元', note: '10月11—12日，1晚；酒店2间。入蜀翻秦岭后落脚，次日顺路看剑门关。' },
    { id: 'stay-chengdu', category: 'stay', name: '玖境 ZEN9·设计师套房公寓', lng: 104.086899, lat: 30.653489, area: 'N4 / N15—N16 成都', note: '10月12—13日与11月8—10日，共3晚；首选90㎡双卧整套房，厨房洗衣机齐全，进川藏前大补给。', bookingUrl: 'https://www.trip.com/hotels/chengdu-hotel-detail-123334753/ninth-realm-designer-suites-residences/' },
    { id: 'stay-xinduqiao', category: 'stay', name: '康定新都桥318国道亚朵酒店', lng: 101.513562, lat: 30.033208, area: 'N5 新都桥', note: '10月13—14日，1晚；供氧2间可分住，翻折多山后第一晚上高原。' },
    { id: 'stay-litang', category: 'stay', name: '理塘雅砻酒店', lng: 100.263451, lat: 29.985148, area: 'N6 / N10 理塘', note: '10月14—15日与10月18—19日各1晚；全屋供氧+地暖，世界高城恢复夜。' },
    { id: 'stay-riwa', category: 'stay', name: '念想酒店（稻城亚丁景区店）', lng: 100.348112, lat: 28.558377, area: 'N7—N9 日瓦/香格里拉镇', note: '10月15—18日，3晚；供氧双床房2间，连住覆盖亚丁长线+短线。' },
    { id: 'stay-batang', category: 'stay', name: '巴塘蜀巴大酒店', lng: 99.109509, lat: 30.004452, area: 'N11 巴塘', note: '10月19—20日，1晚；酒店2间。海拔降到2500m，进藏前难得的低海拔恢复夜。' },
    { id: 'stay-zogang', category: 'stay', name: '左贡维尔纳国际酒店', lng: 97.841148, lat: 29.669777, area: 'N12 / N23 左贡', note: '10月20—21日与10月31日—11月1日各1晚；酒店2间含早。' },
    { id: 'stay-baxoi', category: 'stay', name: '全季酒店（昌都八宿县店）', lng: 96.931548, lat: 30.058649, area: 'N13 八宿', note: '10月21—22日，1晚；酒店2间，过怒江72拐后收车点。' },
    { id: 'stay-bomi', category: 'stay', name: '全季酒店（波密县店）', lng: 95.760998, lat: 29.859889, area: 'N14—N15 波密', note: '10月22—24日，2晚；酒店2间，低海拔恢复与等天气。' },
    { id: 'stay-linzhi', category: 'stay', name: '林芝悦皇冠度假酒店', lng: 94.376175, lat: 29.604960, area: 'N16 / N21 林芝', note: '10月24—25日与10月29—30日各1晚；酒店2间，坐标核到八一镇阿杰路。' },
    { id: 'stay-lhasa', category: 'stay', name: '如家酒店·neo（大昭寺八廓街店）', lng: 91.148678, lat: 29.649323, area: 'N17—N20 拉萨', note: '10月25—29日，4晚；供氧房2间，连续深度恢复与车辆保养。' },
    { id: 'stay-ranwu', category: 'stay', name: '然乌蓝湖驿站', lng: 96.75225, lat: 29.503373, area: 'N22 然乌镇', note: '10月30—31日，1晚；供氧客房2间，住湖边补看米堆/然乌。' },
    { id: 'stay-markam', category: 'stay', name: '芒康康愿假日酒店', lng: 98.598025, lat: 29.685725, area: 'N24 芒康', note: '11月1—2日，1晚；全屋地暖2间，川藏与滇藏的分岔点。' },
    { id: 'stay-feilaisi', category: 'stay', name: '德钦飞来寺梅里往事酒店', lng: 98.877466, lat: 28.437903, area: 'N25 飞来寺', note: '11月2—3日，1晚；客房2间，靠日照金山观景动线。' },
    { id: 'stay-shangrila', category: 'stay', name: '卓越逸墅 EaseVilla·全屋供氧度假美宿', lng: 99.698889, lat: 27.858264, area: 'N26—N27 香格里拉', note: '11月3—5日，2晚；整套两居或客房2间可分住（全屋供氧，高海拔恢复优先）。' },
    { id: 'stay-lijiang', category: 'stay', name: '丽江蓝汐君临民宿', lng: 100.246, lat: 26.876, area: 'N28—N29 丽江', note: '11月5—7日，2晚；首选171㎡两卧三卫带厨房整套房，免费停车，适合4人做饭与洗衣。', bookingUrl: 'https://www.trip.com/hotels/lijiang-hotel-detail-127173268/lijianglanxijunlin/' },
    { id: 'stay-xichang', category: 'stay', name: '西昌邛海亚朵酒店', lng: 102.267537, lat: 27.881407, area: 'N30 西昌', note: '11月7—8日，1晚；酒店2间。海拔降到1500m，晚上吃西昌烧烤。' },
    { id: 'stay-shijiazhuang', category: 'stay', name: '石家庄站万豪万枫酒店', lng: 114.451984, lat: 38.019422, area: 'N31 石家庄', note: '11月12—13日，1晚；酒店2间，最后一个外地住宿夜。' },

    // —— 景点与徒步（川西 + 川藏 G318 + 滇藏 G214 + 雅西回程）——
    { id: 'scene-jianmen', category: 'scenic', name: '剑门关', lng: 105.56, lat: 32.25, area: '广元', note: 'D4顺路上午看，不硬赶时间，下午进成都。' },
    { id: 'scene-erlang', category: 'scenic', name: '二郎山 / 大渡河谷', lng: 102.32, lat: 29.87, area: '雅安—康定', note: 'D5雅康高速穿二郎山隧道，出隧道即大渡河谷。' },
    { id: 'scene-zheduo', category: 'scenic', name: '折多山垭口（4298m）', lng: 101.79, lat: 30.06, area: '康定', note: 'D5正式上高原第一道垭口，10月中尚可，遇雪按实时管制、带防滑链。' },
    { id: 'scene-xinduqiao', category: 'scenic', name: '新都桥摄影长廊', lng: 101.49, lat: 30.05, area: '川西', note: 'D5川西公路摄影与恢复节点，光影草甸。' },
    { id: 'scene-haizishan', category: 'scenic', name: '海子山古冰帽 / 姊妹湖', lng: 100.00, lat: 29.40, area: '理塘—巴塘', note: 'D7、D11途经，海子星罗棋布，姊妹湖在G318边正规停车看。' },
    { id: 'scene-sangdui', category: 'scenic', name: '桑堆红草地', lng: 100.15, lat: 29.19, area: '稻城', note: 'D7季节对就是一片红，正规停车带短停。' },
    { id: 'scene-yading-gate', category: 'scenic', name: '亚丁游客中心', lng: 100.34, lat: 28.56, area: '香格里拉镇', note: 'D8—D9从日瓦住宿后由此换乘进景区。' },
    { id: 'scene-luorong', category: 'scenic', name: '洛绒牛场', lng: 100.34, lat: 28.37, area: '亚丁', note: 'D8长线状态判断点；高反明显就停止上升。' },
    { id: 'scene-milk', category: 'scenic', name: '牛奶海 / 五色海方向', lng: 100.34, lat: 28.34, area: '亚丁', note: 'D8长线终点，仅在天气、开放和身体状态都允许时继续；抢11/20停线前。' },
    { id: 'scene-chonggu', category: 'scenic', name: '冲古寺 / 珍珠海', lng: 100.34, lat: 28.43, area: '亚丁', note: 'D9短线轻量走约4km，下午回同一住宿恢复。' },
    { id: 'scene-jinshajiang', category: 'scenic', name: '金沙江大桥（川藏界）', lng: 99.02, lat: 29.92, area: '巴塘—芒康', note: 'D12过江正式入藏，翻觉巴山、东达山（5130m）。' },
    { id: 'scene-72guai', category: 'scenic', name: '怒江72拐 / 业拉山', lng: 96.90, lat: 29.86, area: '八宿', note: 'D13、D23只在正规观景台停车，绝不在弯道停留拍照。' },
    { id: 'scene-ranwu', category: 'scenic', name: '然乌湖', lng: 96.74, lat: 29.45, area: '昌都', note: 'D14、D22天气窗口好时停留；反向回程住湖边补看。' },
    { id: 'scene-midui', category: 'scenic', name: '米堆冰川方向', lng: 96.50, lat: 29.39, area: '波密', note: 'D14按天气和道路取舍，不挤占收车时间。' },
    { id: 'scene-lulang', category: 'scenic', name: '鲁朗林海 / 色季拉山', lng: 94.70, lat: 29.70, area: '林芝', note: 'D16翻色季拉山看南迦巴瓦方向，鲁朗石锅鸡放白天正餐。' },
    { id: 'scene-niyang', category: 'scenic', name: '尼洋河谷 / 米拉山', lng: 92.90, lat: 29.80, area: '林芝—拉萨', note: 'D17林拉高速沿尼洋河上行，翻米拉山到拉萨。' },
    { id: 'scene-barkhor', category: 'scenic', name: '拉萨八廓街 / 布达拉宫广场', lng: 91.13, lat: 29.65, area: '拉萨', note: 'D18—D20恢复日轻量步行，不爬高不赶点。' },
    { id: 'scene-baima', category: 'scenic', name: '白马雪山垭口（4292m）', lng: 98.95, lat: 28.36, area: '德钦', note: 'D25翻红拉山、白马雪山进云南的滇藏最高垭口。' },
    { id: 'scene-feilai', category: 'scenic', name: '飞来寺观景台 / 梅里雪山', lng: 98.87, lat: 28.44, area: '德钦', note: 'D25日照金山观景点，不以拍到为硬目标，看天吃饭。' },
    { id: 'scene-jinshawan', category: 'scenic', name: '金沙江大湾 / 奔子栏', lng: 99.29, lat: 28.24, area: '德钦—香格里拉', note: 'D26滇藏线下行沿途景观。' },
    { id: 'scene-pudacuo', category: 'scenic', name: '普达措 / 独克宗古城', lng: 99.90, lat: 27.87, area: '香格里拉', note: 'D27连续高原后的缓冲日，轻量走，松赞林寺看天。' },
    { id: 'scene-tiger', category: 'scenic', name: '虎跳峡观景台', lng: 100.11, lat: 27.24, area: '虎跳峡', note: 'D28只在观景台看，不走高路徒步，安全优先。' },
    { id: 'scene-lijiang', category: 'scenic', name: '丽江古城 / 束河', lng: 100.23, lat: 26.87, area: '丽江', note: 'D28—D29重要休整整补点，车停古城外，玉龙雪山看天可选。' },
    { id: 'scene-qionghai', category: 'scenic', name: '西昌邛海', lng: 102.28, lat: 27.79, area: '西昌', note: 'D30回程低海拔落点，湖边散步，晚上吃烧烤。' },
    { id: 'scene-yaxi', category: 'scenic', name: '雅西高速 / 大相岭', lng: 102.60, lat: 29.30, area: '雅安—西昌', note: 'D31穿大相岭，桥梁隧道多、限速严，冬季比川西回头更稳。' },

    // —— 吃饭区域（餐饮商圈 / 小吃街 / 夜市片区）——
    { id: 'food-pingyao', category: 'food', name: '平遥古城明清街 / 南大街', lng: 112.18, lat: 37.20, area: '平遥', note: '平遥牛肉、碗托、面食；住进古城步行解决。' },
    { id: 'food-xian', category: 'food', name: '西安永兴坊 / 回民街', lng: 108.97, lat: 34.27, area: '西安', note: '泡馍、biangbiang面、小吃集中，停车后步行。' },
    { id: 'food-guangyuan', category: 'food', name: '广元利州万达 / 老城餐饮区', lng: 105.84, lat: 32.44, area: '广元', note: '广元凉面、剑门豆腐、川北家常菜。' },
    { id: 'food-chengdu', category: 'food', name: '成都春熙路 / 太古里餐饮区', lng: 104.08, lat: 30.66, area: '成都', note: '火锅、川菜集中；住宿附近吃，不为单店跨城排队。' },
    { id: 'food-kangding', category: 'food', name: '新都桥 / 康定沿线馆子', lng: 101.51, lat: 30.03, area: '新都桥', note: '牦牛肉、藏式家常菜；上高原第一晚吃清淡。' },
    { id: 'food-litang', category: 'food', name: '理塘县城餐饮街', lng: 100.26, lat: 29.99, area: '理塘', note: '牦牛肉汤锅、藏面；高城吃热食暖身。' },
    { id: 'food-batang', category: 'food', name: '巴塘县城主街', lng: 99.11, lat: 30.00, area: '巴塘', note: '低海拔恢复夜，川菜藏餐都方便。' },
    { id: 'food-bomi', category: 'food', name: '波密县城主街', lng: 95.76, lat: 29.86, area: '波密', note: '川菜、藏餐；低海拔恢复吃热菜。' },
    { id: 'food-linzhi', category: 'food', name: '林芝八一镇步行街 / 石锅鸡一带', lng: 94.36, lat: 29.65, area: '林芝', note: '藏餐、川菜、鲁朗石锅鸡集中。' },
    { id: 'food-lhasa', category: 'food', name: '拉萨八廓街 / 甜茶馆区域', lng: 91.13, lat: 29.65, area: '拉萨', note: '恢复日轻量步行吃饭，藏面、甜茶、牦牛肉。' },
    { id: 'food-shangrila', category: 'food', name: '香格里拉独克宗古城 / 月光广场', lng: 99.70, lat: 27.86, area: '香格里拉', note: '藏餐、菌菇馆；野生菌只吃正规店充分煮熟的。' },
    { id: 'food-lijiang', category: 'food', name: '丽江古城 / 忠义市场周边', lng: 100.23, lat: 26.87, area: '丽江', note: '腊排骨、纳西菜、米线；采购食材也方便。' },
    { id: 'food-xichang', category: 'food', name: '西昌邛海 / 航天大道烧烤区', lng: 102.27, lat: 27.88, area: '西昌', note: '西昌火盆烧烤招牌，回程低海拔放松吃一顿。' },

    // —— 采购与加油 ——
    { id: 'supply-chengdu', category: 'supply', name: '成都进川藏大补给', lng: 104.08, lat: 30.66, area: '成都', note: 'D4取车验车、洗衣，把进藏几天的速食、干粮、气罐补满。' },
    { id: 'supply-kangding', category: 'supply', name: '康定 / 新都桥补给', lng: 101.51, lat: 30.03, area: '康定', note: 'D5上高原前补油、饮水和高原药品。' },
    { id: 'supply-litang', category: 'supply', name: '理塘县城补给', lng: 100.26, lat: 29.99, area: '理塘', note: 'D6、D10进出亚丁支线的补给与油量确认点。' },
    { id: 'supply-riwa', category: 'supply', name: '香格里拉镇补给', lng: 100.34, lat: 28.56, area: '日瓦', note: 'D7亚丁进山前补路餐、氧气和保暖用品。' },
    { id: 'supply-bomi', category: 'supply', name: '波密恢复补给', lng: 95.76, lat: 29.86, area: '波密', note: 'D15低海拔缓冲、补水和车况检查。' },
    { id: 'supply-lhasa', category: 'supply', name: '拉萨保养与大补给', lng: 91.13, lat: 29.65, area: '拉萨', note: 'D19车辆保养、洗衣、药品和滇藏/雅西方向天气复核；速食补到够滇藏川西用。' },
    { id: 'supply-deqin', category: 'supply', name: '德钦 / 飞来寺补给', lng: 98.91, lat: 28.49, area: '德钦', note: 'D25进滇藏前补路餐、现金和保暖用品。' },
    { id: 'supply-lijiang', category: 'supply', name: '丽江综合整补', lng: 100.23, lat: 26.87, area: '丽江', note: 'D29采购、洗衣、车辆和装备整理，准备雅西回程。' },
    { id: 'supply-xichang', category: 'supply', name: '西昌补给', lng: 102.27, lat: 27.88, area: '西昌', note: 'D30回到低海拔成熟城市，补油补给。' },

    // —— 厕所参考点 ——
    { id: 'toilet-zheduo', category: 'toilet', name: '折多山观景台厕所', lng: 101.79, lat: 30.06, area: '康定', note: '垭口公共设施参考点；以现场标识为准。' },
    { id: 'toilet-yading', category: 'toilet', name: '亚丁游客中心厕所', lng: 100.34, lat: 28.56, area: '亚丁', note: '进景区前公共设施参考点。' },
    { id: 'toilet-72guai', category: 'toilet', name: '怒江72拐观景台厕所', lng: 96.90, lat: 29.86, area: '八宿', note: '观景台公共设施参考点；不要在弯道停留。' },
    { id: 'toilet-ranwu', category: 'toilet', name: '然乌镇公共厕所参考', lng: 96.74, lat: 29.45, area: '然乌', note: '停车与厕所均以现场正规设施为准。' },
    { id: 'toilet-feilai', category: 'toilet', name: '飞来寺观景区厕所', lng: 98.87, lat: 28.44, area: '德钦', note: '观景区公共设施参考点。' },
    { id: 'toilet-tiger', category: 'toilet', name: '虎跳峡观景台厕所', lng: 100.11, lat: 27.24, area: '虎跳峡', note: '观景前公共设施参考点。' },

    // —— 医疗与救援参考 ——
    { id: 'service-chengdu', category: 'service', name: '成都医疗与车辆救援', lng: 104.08, lat: 30.66, area: '成都', note: '进藏前最重要的医疗、保养和调整节点；急症拨打120。' },
    { id: 'service-litang', category: 'service', name: '理塘县医疗救援参考', lng: 100.26, lat: 29.99, area: '理塘', note: '高城高反评估节点；高反明显往低处退。' },
    { id: 'service-lhasa', category: 'service', name: '拉萨医疗与车辆救援', lng: 91.13, lat: 29.65, area: '拉萨', note: '全程最重要的医疗、保养和调整节点之一。' },
    { id: 'service-linzhi', category: 'service', name: '林芝医疗救援参考', lng: 94.36, lat: 29.65, area: '林芝', note: '低海拔恢复方向；具体机构实时导航。' },
    { id: 'service-deqin', category: 'service', name: '德钦医疗救援参考', lng: 98.91, lat: 28.49, area: '德钦', note: '滇藏高海拔段身体异常优先留成熟县城；急症拨打120。' },
    { id: 'service-shangrila', category: 'service', name: '香格里拉医疗救援参考', lng: 99.70, lat: 27.86, area: '香格里拉', note: '海拔3200m仍偏高，恢复日观察身体状态。' }
  ];

  // —— 住宿价格（4人当晚总价区间，元）——
  // Plan B 为国庆后（10/9起）出发，避开中秋/国庆峰值，价格按淡季规划估算；
  // 出发前须用订单页与实时地图逐项复核，不代表锁定报价。
  const CHECKED = '2026-08-18';
  const STAY_PRICES = {
    'stay-pingyao':      { p: [420, 560], n: '淡季规划估算价', inc: '客栈2间可分住（大床）；古城内，往返两次入住', cid: 104, ci: '2026-10-09', co: '2026-10-10' },
    'stay-xian':         { p: [360, 620], n: '淡季规划估算价', inc: '首选两室一厅整套（4人一套），可做饭；或2间可分住，往返两次入住', cid: 10, ci: '2026-10-10', co: '2026-10-11' },
    'stay-guangyuan':    { p: [360, 520], n: '规划估算价', inc: '2间可分住（大床+双床）；市区商务酒店', cid: 226, ci: '2026-10-11', co: '2026-10-12' },
    'stay-chengdu':      { p: [400, 700], n: '淡季规划估算价', inc: '首选90㎡双卧整套（4人一套），厨房洗衣机齐全；共3晚（进藏1+回程2）', cid: 28, ci: '2026-10-12', co: '2026-10-13' },
    'stay-xinduqiao':    { p: [480, 700], n: '淡季规划估算价', inc: '供氧2间可分住（大床+双床）；318国道连锁', cid: 4130, ci: '2026-10-13', co: '2026-10-14' },
    'stay-litang':       { p: [520, 780], n: '淡季规划估算价', inc: '2间可分住；全屋供氧+地暖，县城中心，往返两次入住', cid: 20972, ci: '2026-10-14', co: '2026-10-15' },
    'stay-riwa':         { p: [400, 680], n: '淡季规划估算价', inc: '供氧2间可分住（大床+双床，连住3晚）；亚丁景区落点', cid: 1222, ci: '2026-10-15', co: '2026-10-18' },
    'stay-batang':       { p: [320, 480], n: '规划估算价', inc: '2间可分住；县城酒店，低海拔恢复夜', cid: 21836, ci: '2026-10-19', co: '2026-10-20' },
    'stay-zogang':       { p: [460, 640], n: '淡季规划估算价', inc: '2间可分住（供氧大床+双床）；县城酒店含早，往返两次入住', cid: 21163, ci: '2026-10-20', co: '2026-10-21' },
    'stay-baxoi':        { p: [420, 600], n: '淡季规划估算价', inc: '供氧房2间可分住（大床+双床）；县城连锁', cid: 21120, ci: '2026-10-21', co: '2026-10-22' },
    'stay-bomi':         { p: [480, 720], n: '淡季规划估算价', inc: '2间可分住（大床+双床，住2晚）；低海拔恢复', cid: 21979, ci: '2026-10-22', co: '2026-10-24' },
    'stay-linzhi':       { p: [360, 580], n: '淡季规划估算价', inc: '2间可分住（大床+双床）；度假酒店含停车充电，往返两次入住', cid: 108, ci: '2026-10-24', co: '2026-10-25' },
    'stay-lhasa':        { p: [420, 600], n: '淡季规划估算价', inc: '供氧房2间可分住（住4晚）；连续深度恢复', cid: 41, ci: '2026-10-25', co: '2026-10-29' },
    'stay-ranwu':        { p: [440, 600], n: '淡季规划估算价', inc: '供氧客房2间可分住；确认供暖热水', cid: 21120, ci: '2026-10-30', co: '2026-10-31' },
    'stay-markam':       { p: [360, 500], n: '淡季规划估算价', inc: '2间可分住双床；全屋地暖，县城酒店', cid: 21835, ci: '2026-11-01', co: '2026-11-02' },
    'stay-feilaisi':     { p: [560, 900], n: '淡季规划估算价', inc: '2间可分住；地暖+供氧，观景房近日照金山动线', cid: 3928, ci: '2026-11-02', co: '2026-11-03' },
    'stay-shangrila':    { p: [560, 900], n: '淡季规划估算价', inc: '整套两居或客房2间可分住（全屋供氧，住2晚）', cid: 660, ci: '2026-11-03', co: '2026-11-05' },
    'stay-lijiang':      { p: [360, 700], n: '淡季规划估算价', inc: '首选171㎡两卧三卫带厨房整套（4人一套），或2间可分住；免费停车', cid: 37, ci: '2026-11-05', co: '2026-11-07' },
    'stay-xichang':      { p: [360, 520], n: '规划估算价', inc: '2间可分住（大床+双床）；邛海度假酒店', cid: 141, ci: '2026-11-07', co: '2026-11-08' },
    'stay-shijiazhuang': { p: [320, 440], n: '规划估算价', inc: '2间可分住（大床+双床）；末站前最后外地住宿夜', cid: 428, ci: '2026-11-12', co: '2026-11-13' }
  };
  pois.forEach(poi => {
    if (poi.category !== 'stay') return;
    const price = STAY_PRICES[poi.id];
    if (!price) return;
    poi.priceParty4 = price.p;
    poi.priceNature = price.n;
    poi.priceIncludes = price.inc;
    poi.priceUpdatedAt = CHECKED;
    if (!poi.sourceUrl) {
      poi.sourceUrl = price.cid
        ? `https://hotels.ctrip.com/hotels/list?cityId=${price.cid}&checkin=${price.ci}&checkout=${price.co}&crn=2&adult=4&curr=CNY`
        : `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(poi.name)}`;
    }
  });

  window.ROAD_TRIP_POI_DATA = {
    meta: {
      version: 'planb-route-pois-v1',
      updatedAt: '2026-08-18',
      note: 'Plan B（川进滇出，10/9出发）住宿、景点、吃饭与补给点；砍掉新疆、青甘与新藏阿里。价格为淡季规划估算，出发前须用订单页与实时地图逐项复核。',
      priceDisclaimer: '价格用于行程预算，不代表锁定报价。住宿、门票、区间车、油价和餐饮价格应在预订时及出发前再次核验。'
    },
    categories,
    segmentNotes,
    pois
  };
})();
