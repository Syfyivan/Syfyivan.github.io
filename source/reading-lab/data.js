// Original learning content. Levels describe display length, not measured equivalence.
const BANKS = {
  daily: {
    zh: [
      '清晨 微风 厨房 公园 车站 咖啡 雨伞 晚霞',
      '早餐店 自行车 便利店 图书馆 红绿灯 明信片 洗衣机 向日葵',
      '周末去逛公园 给朋友写封信 窗边的一束光 刚出炉的面包 桌上的玻璃杯 雨后清新的空气 街角的水果摊 放慢脚步看风景',
      '清晨的阳光照进了厨房 我们沿着河边慢慢散步 下雨之前记得收好衣服 今天晚饭一起做番茄汤 那家书店藏在街道尽头 公交车准时停在了路口 把窗台上的植物浇点水 周末约朋友去附近爬山'
    ],
    en: [
      'home rain milk walk shop cook book road',
      'coffee garden window dinner market travel morning kitchen',
      'breakfast umbrella sunshine afternoon newspaper restaurant friendship bookshelf',
      'a quiet morning take a short walk a cup of coffee open the window dinner with friends wait for the bus fresh bread and milk a little flower shop'
    ]
  },
  school: {
    zh: [
      '课本 铅笔 操场 黑板 同学 老师 太阳 月亮',
      '三角形 运动会 课程表 乘法表 小朋友 植物园 自然课 橡皮擦',
      '认真观察变化 读懂一篇课文 学会提出问题 记录实验结果 一起打扫教室 认识不同植物 练习口头表达 发现身边的科学',
      '小组同学一起完成了实验 操场上的同学正在做早操 读完故事试着说出主要内容 我们用尺子量出桌子的长度 写作之前先把事情想清楚 每天坚持观察植物的变化 遇到不懂的问题及时请教 把课文中的好句子记下来'
    ],
    en: [
      'pen desk read draw math bell flag quiz',
      'pencil lesson school teacher student science history library',
      'homework notebook textbook sentence question painting alphabet education',
      'read a short story solve the problem ask a good question learn something new write in your notebook work with your classmates observe the little plant explain your answer'
    ]
  },
  computer: {
    zh: [
      '变量 函数 数组 指针 内存 磁盘 网络 缓存',
      '数据库 操作系统 浏览器 编译器 服务器 客户端 版本控制 垃圾回收',
      '关系型数据库 分布式文件系统 应用程序接口 面向对象编程 自动化单元测试 结构化查询语言 多线程并发编程 计算机网络协议',
      '浏览器向服务器发送请求 数据库事务保证操作的一致性 缓存可以减少重复数据读取 编译器把源代码转换为机器码 使用版本控制记录代码变化 操作系统负责分配内存资源 单元测试验证函数的预期行为 网络协议规定数据传输方式'
    ],
    en: [
      'code byte file disk heap node port loop',
      'array cache stack server client thread kernel socket',
      'function variable compiler database protocol debugger interface algorithm',
      'version control garbage collection operating system relational database application interface distributed systems continuous integration object oriented programming'
    ]
  },
  ai: {
    zh: [
      '模型 训练 推理 样本 特征 权重 向量 标注',
      '机器学习 深度学习 神经网络 语言模型 提示词 注意力 训练集 测试集',
      '检索增强生成 自然语言处理 多模态大模型 强化学习算法 监督学习任务 无监督学习方法 文本向量表示 模型推理延迟',
      '训练数据影响模型的表现 检索结果为回答提供参考资料 提示词应明确说明任务要求 测试集用于评估模型泛化能力 模型生成的答案仍然需要核实 向量相似度可以帮助查找文本 标注质量会影响监督学习效果 多模态模型能够处理图像文本'
    ],
    en: [
      'data loss bias chat task test tune seed',
      'model train token vector prompt tensor sample neural',
      'training learning gradient inference attention embedding alignment reasoning',
      'machine learning neural network language model training dataset supervised learning natural language processing retrieval augmented generation human feedback'
    ]
  }
};

// English phrases use a separate delimiter to preserve word boundaries.
const EN_PHRASES = {
  daily: ['a quiet morning', 'take a short walk', 'a cup of coffee', 'open the window', 'dinner with friends', 'wait for the bus', 'fresh bread and milk', 'a little flower shop'],
  school: ['read a short story', 'solve the problem', 'ask a good question', 'learn something new', 'write in your notebook', 'work with your classmates', 'observe the little plant', 'explain your answer'],
  computer: ['version control', 'garbage collection', 'operating system', 'relational database', 'application interface', 'distributed systems', 'continuous integration', 'object oriented programming'],
  ai: ['machine learning', 'neural network', 'language model', 'training dataset', 'supervised learning', 'natural language processing', 'retrieval augmented generation', 'human feedback']
};

export const WORDS = Object.entries(BANKS).flatMap(([category, types]) =>
  Object.entries(types).flatMap(([type, levels]) => levels.flatMap((list, index) =>
    (type === 'en' && index === 3 ? EN_PHRASES[category] : list.split(' ')).map(text => ({ text, type, category, level: index + 1 }))
  ))
);

export const STORIES = [
  {
    id: 'rain-map', title: '雨天的地图',
    text: `周六早晨，小满准备去河对岸看望外婆。出门时天色很亮，她把画了一半的地图放进书包，想沿途补上自己喜欢的地方。走到老桥附近，雨突然落了下来。桥边正在施工，熟悉的近路被围栏挡住，手机也只剩下一点电。她躲进一家修伞铺，打算等雨小些再走。
铺子的主人是一位戴眼镜的阿姨。听说小满要去河对岸，她拿出一张旧纸，在上面画了三个记号：面包店、蓝色水塔和一棵很大的榕树。阿姨说，经过面包店向左转，看到水塔后沿河走，榕树旁边就是新开的步行桥。小满认真看了一遍，把路线记在心里，又向阿姨借了一把伞。
面包店很容易找到，可是水塔被新建的楼房挡住了。小满差点跟着一群人走进市场。她停下来回想，阿姨说的是沿河走，于是仔细听了听，果然在另一条街尽头听见了水声。转过街角，蓝色水塔露出了半边，榕树也出现在远处。树下还有一位推着婴儿车的叔叔，正为台阶发愁。小满帮他找到旁边的缓坡，两个人一起过了桥。
到了外婆家，小满没有先讲自己淋了多少雨，而是摊开地图，把看不见水塔时的岔路和桥边的缓坡补了上去。下午回家，她把伞送回铺子，还送给阿姨一张重新画好的路线图。阿姨把它贴在门口。后来，每当有人在雨天问路，地图上的蓝色水塔旁边，总会多出一句提醒：如果看不见它，就先找到河。`,
    keypoints: ['老桥施工，小满在修伞铺问路并借伞。', '阿姨用面包店、水塔、榕树说明路线。', '水塔被楼房遮挡，小满听水声找到河。', '她帮助推婴儿车的人找到缓坡。', '她还伞时送回了补充细节的地图。'],
    questions: [
      { prompt: '小满为什么不能走原来的近路？', options: ['老桥附近施工', '她忘记带地图', '面包店关门', '河水淹没街道'], answer: 0 },
      { prompt: '看不见水塔时，她靠什么重新确认方向？', options: ['跟随市场里的人', '查看手机导航', '听水声找到河', '等待阿姨来接'], answer: 2 },
      { prompt: '小满还伞时额外带回了什么？', options: ['新买的面包', '补充细节的路线图', '外婆的眼镜', '一辆婴儿车'], answer: 1 }
    ]
  },
  {
    id: 'seed-box', title: '没有名字的种子',
    text: `学校整理储物室时，林老师找到一盒没有标签的种子。科学小组的四个同学都想知道它会长成什么。有人说像牵牛花，有人猜是豆子。阿禾提议先别急着找答案，每个人种下一粒，看看它们会给出什么线索。老师给了他们四只相同的小花盆，让大家自己制定观察计划。
第一周，阿禾每天放学都给种子浇水。她担心自己的种子落后，总比别人多浇一些。几天过去，另外三只盆里陆续冒出了绿芽，只有她的盆没有动静。她想再加一点水，伙伴却发现盆底一直湿着。他们翻开记录才看清，阿禾的浇水次数和水量都比别人多。老师没有替她下结论，只建议大家先观察泥土，再想想植物的根需要什么。
阿禾把花盆搬到通风的窗边，暂时停止浇水。她又在记录本上增加了泥土干湿这一栏。三天以后，一点嫩绿终于顶开土面。她高兴得想立刻通知全班，却先蹲下来画了第一对叶子的形状。接下来的日子，小组轮流测量高度，也记下阴天和晴天的变化。他们发现，长得最快的那株并不是每天浇水最多的那株。
一个月后，细细的藤爬上了老师搭的小架子，开出一朵紫色的花。大家拿着叶片图和花朵照片查阅图书，终于确认这是一种牵牛花。展示会上，阿禾把最初那张空白的观察页也贴了出来。有同学问她为什么保留失败的记录，她说，如果删掉这一页，大家就不知道她后来为什么改变办法。展示板的最后一句话写着：先把看到的事情记清楚，再决定相信哪个答案。`,
    keypoints: ['同学们种下没有标签的种子，通过观察辨认植物。', '阿禾浇水太多，种子迟迟不发芽。', '她改善通风、停止浇水，并记录泥土干湿。', '藤上开出紫花后，大家查书确认是牵牛花。', '她保留失败记录，说明改变办法的原因。'],
    questions: [
      { prompt: '阿禾的种子一开始为什么迟迟没有发芽？', options: ['没有晒到月光', '花盆太小', '浇水过多，泥土一直很湿', '同学拿错了种子'], answer: 2 },
      { prompt: '她后来在记录本里增加了哪一栏？', options: ['花盆的价格', '泥土干湿', '教室温度排名', '每个人的猜测次数'], answer: 1 },
      { prompt: '阿禾为什么保留最初的失败记录？', options: ['为了让展示板更大', '因为老师不许删除', '为了比较谁写得好', '为了说明后来改变办法的原因'], answer: 3 }
    ]
  },
  {
    id: 'night-light', title: '最后一盏灯',
    text: `镇上的旧图书馆准备搬家，最后一天仍然开放到晚上八点。志愿者小川负责收拾儿童阅览室。下午，他发现窗边坐着一位小女孩，一直在翻一本很厚的故事集，却很少翻页。离关门还有半个小时，其他读者已经陆续离开，她仍然没有起身。小川走过去，轻声提醒她可以办理借阅，把书带回家。
女孩摇了摇头，说借书证在哥哥那里，而哥哥正在医院陪妈妈。她答应晚上给妈妈讲一个新故事，可书里有些字她不认识，想在这里多看一会儿。小川原本还要检查三排书架，听完便拉来一把椅子。他没有从第一页开始念，而是请女孩先说说已经看懂的部分。女孩讲到一只迷路的小鹿，接着就停住了。
小川陪她读完后面的两页，遇到难字就写在便签上。随后，他合上书，请她按自己的话再讲一遍。第一次，她记得小鹿遇见了很多动物，却忘了为什么最后回到家。小川提醒她留意故事里的河流。第二次，她说清楚了小鹿顺着河流找到熟悉的大树，也记住了帮助它的刺猬。窗外的路灯亮起来时，她终于能把整个故事连起来讲了。
八点整，管理员来到门口。小川解释了情况，管理员从服务台拿出一张临时借阅单，让女孩留下必要的信息，把书带走。女孩认真道谢，又把写着难字的便签夹进书里。收拾完最后一排书架，小川才关掉阅览室的灯。几天后，新馆收到一封信，里面画着一只小鹿和一盏黄色的灯。信上说，妈妈听完故事睡得很好，女孩还给故事加了一个结尾：小鹿回家以后，也学会了给别人指路。`,
    keypoints: ['旧图书馆搬家前最后一天，小女孩迟迟没有离开。', '她想给住院的妈妈讲故事，但有不认识的字。', '小川先让她复述已懂的部分，再陪读并提示河流线索。', '管理员办理临时借阅，让女孩带走书。', '新馆收到感谢信，女孩为故事补了结尾。'],
    questions: [
      { prompt: '女孩为什么坚持留在阅览室？', options: ['等同学一起做作业', '想学会一个故事讲给妈妈听', '找不到回家的钥匙', '想帮助图书馆搬家'], answer: 1 },
      { prompt: '小川用什么办法帮助女孩理清结尾？', options: ['让她重新抄写全文', '给她换了一本书', '提醒她留意河流这条线索', '直接让她背最后一页'], answer: 2 },
      { prompt: '女孩最后怎样把书带回家？', options: ['管理员办理了临时借阅', '哥哥送来了借书证', '小川把书买下送给她', '她等到新馆开门才借到'], answer: 0 }
    ]
  }
];
