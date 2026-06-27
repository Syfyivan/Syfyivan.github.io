const rooms = [
  {
    id: "quality",
    floor: "第1章",
    label: "质量基础",
    short: "质量属性 + 客户关系",
    icon: "质",
    color: "#326aa3",
    scene: "这一块直接背质量定义、五个属性、客户关系和质量管理三部曲，不再额外背比喻词。",
    mnemonic: "顺序：先客户，再成本和社会，最后可测、可预见。",
    points: [
      "质量不仅要满足明示需求，也要满足隐含需求",
      "质量属性：客户属性、成本属性、社会属性、可测性、可预见性",
      "客户是质量的接受者，质量相对于客户存在，服务于客户，而且由客户判定",
      "朱兰质量管理三部曲：质量策划、质量控制、质量改进",
      "质量管理是在质量方面指挥和控制组织的协调活动"
    ],
    answer: "质量是产品、过程或体系满足客户明确需求和隐含期望的程度。质量相对于客户存在，服务于客户，并由客户判定。",
    prompt: "遮住后按“定义 -> 五个属性 -> 客户关系 -> 三部曲”复述。"
  },
  {
    id: "sqa",
    floor: "第3/7章",
    label: "质量体系与 SQA",
    short: "体系组成 + SQA 组织",
    icon: "保",
    color: "#22776d",
    scene: "这一块把“体系怎么构成”和“SQA 怎么组织、做什么”分开背。",
    mnemonic: "体系按闭环背；SQA 按“独立性”和“深入项目”两条轴背。",
    points: [
      "质量管理体系：质量方针、质量目标、质量策划、管理职责、资源管理、产品实现、测量、分析和改进",
      "独立 SQA 部门：独立性和客观性强，有利于资源共享，但难深入项目",
      "独立 SQA 工程师：能深入项目，问题解决较快，但独立性和经验共享较弱",
      "独立 SQA 小组：兼顾相对独立、融入项目和经验共享",
      "SQA 工作：制定计划、参与过程描述、评审、审计、记录偏差、报告、跟踪问题、协调变更并帮助度量分析"
    ],
    answer: "开发人员主要负责技术工作；SQA 人员负责质量保证的计划、监督、记录、分析和报告工作，辅助开发组得到高质量产品。",
    prompt: "先答质量管理体系组成；遇到 SQA 题，再按组织结构和工作内容分两段写。"
  },
  {
    id: "review",
    floor: "第6章",
    label: "评审与缺陷",
    short: "走查/审查 + 早发现",
    icon: "审",
    color: "#a3312b",
    scene: "这一块背评审为什么有用、走查和审查怎么区分、缺陷内外两种表述。",
    mnemonic: "评审理由按三类展开：成本、技术、效率。",
    points: [
      "软件缺陷：从内部看是开发或维护中的错误、毛病等问题；从外部看是功能失效或违背需求",
      "走查较不正式；审查更正式，对 SQA 贡献更大",
      "从成本看：缺陷发现越晚，纠正费用越高；评审能尽早发现缺陷，减少后期返工",
      "从技术看：前一阶段错误会导致后一阶段错误，并逐渐累积",
      "从效率看：减少修订、测试、调试和维护时间，缩短周期，控制风险"
    ],
    answer: "软件评审的主要目的，是在软件生命周期早期发现缺陷，减少后期返工和维护成本，提高开发、测试和维护效率。",
    prompt: "评审题按“成本、技术、效率”写；同行评审题按“走查较不正式，审查更正式”写。"
  },
  {
    id: "cost",
    floor: "第4/5章",
    label: "度量、费用与标准",
    short: "度量原则 + CMMI/IDEAL",
    icon: "费",
    color: "#b57918",
    scene: "这一块最容易变成填空和选择：度量过程、测量原则、质量费用、CMMI、IDEAL。",
    mnemonic: "度量按过程背，费用按控制/失效背，标准按级别/步骤背。",
    points: [
      "度量过程：识别目标和度量描述、定义度量过程、搜集数据、数据分析与反馈、过程改进",
      "基本测量原则：理论和目标；一致、客观、无二义；经验和直觉有说服力；简单可计算；适应产品和过程并尽量自动化；统计建立关系；结果可靠；建立反馈",
      "质量费用：预防费用、评价费用、内部失效费用、外部失效费用",
      "CMMI 五级：初始级、可重复级、已定义级、已管理级、优化级",
      "IDEAL 五步：初始化、诊断、建立、行动、学习"
    ],
    answer: "软件质量费用分为控制费用和失效费用。控制费用包括预防费用、评价费用；失效费用包括内部失效费用、外部失效费用。",
    prompt: "客观题先看关键词归属；简答题重点默写测量原则和费用模型。"
  },
  {
    id: "design",
    floor: "第8/9章",
    label: "设计与编码",
    short: "耦合内聚 + 编码细点",
    icon: "设",
    color: "#5b4aa8",
    scene: "这一块的重点是两个顺序表：耦合从高到低，内聚从低到高。",
    mnemonic: "设计目标只有一句：降低耦合，提高内聚。",
    points: [
      "耦合从高到低：内容耦合、公共环境耦合、外部耦合、控制耦合、特征耦合、数据耦合、非直接耦合",
      "内聚从低到高：偶然内聚、逻辑内聚、时间内聚、过程内聚、通信内聚、信息内聚、功能内聚",
      "如果参数是指针且仅作输入用，应在类型前加 const",
      "函数没有参数时用 void 填充；参数命名要恰当，顺序要合理",
      "动态内存申请与释放配对，free/delete 后立即置 NULL，避免野指针"
    ],
    answer: "提高设计质量应重视模块化、信息隐藏、低耦合、高内聚和接口清晰；提高编程质量应遵守编码规范，保持代码清晰、可读、可测试、可维护。",
    prompt: "设计题背两个顺序表；编码题背 const、void、命名、申请检查、释放置 NULL。"
  },
  {
    id: "testing",
    floor: "第10/13-15章",
    label: "测试基础与层级",
    short: "测试定义 + 层级侧重点",
    icon: "测",
    color: "#467b42",
    scene: "这一块背测试定义、测试与调试区别、测试用例和四个测试层级。",
    mnemonic: "层级顺序：单元看模块，集成看接口，系统看整体，验收看需求。",
    points: [
      "软件测试是为了发现错误而执行程序的过程",
      "测试是有计划地发现错误；调试是在发现错误后定位原因并修改错误",
      "测试用例包括测试输入、执行条件和预期结果，是执行测试的最小实体",
      "单元测试关注独立单元/模块",
      "集成测试关注模块间衔接、接口和参数传递",
      "系统测试关注完整系统运行以及与其他软件/环境的兼容性",
      "验收测试在发布前按需求规格说明书检查是否满足用户预期"
    ],
    answer: "软件测试是为了发现错误而执行程序的过程。测试层次包括单元测试、集成测试、系统测试和验收测试，分别关注模块、接口、整体系统和用户需求满足情况。",
    prompt: "先背定义，再背测试/调试区别，最后按四个层级写侧重点。"
  },
  {
    id: "whitebox",
    floor: "第11章",
    label: "白盒与基本路径",
    short: "逻辑覆盖 + 基本路径",
    icon: "白",
    color: "#2f7597",
    scene: "这一块背白盒关注点、逻辑覆盖强弱顺序和基本路径大题步骤。",
    mnemonic: "逻辑覆盖从弱到强：语句 -> 判定 -> 条件 -> 判定/条件 -> 条件组合 -> 路径。",
    points: [
      "模块接口测试",
      "局部数据结构测试",
      "边界条件测试",
      "独立执行路径测试",
      "内部错误处理测试",
      "白盒测试适合单元测试、集成测试",
      "基本路径测试步骤：画控制流图、计算环路复杂度、列出独立路径、设计测试用例"
    ],
    answer: "白盒测试已知程序内部结构，重点检查模块接口、局部数据结构、边界条件、独立执行路径和内部错误处理。",
    prompt: "白盒简答写五个关注点；大题按画控制流图、算复杂度、列路径、配用例。"
  },
  {
    id: "blackbox",
    floor: "第12-14章",
    label: "黑盒、集成与性能",
    short: "等价类/边界/因果图",
    icon: "黑",
    color: "#2f3f4f",
    scene: "这一块背黑盒常用方法、等价类用例规则、边界值数量、桩驱动和性能类测试。",
    mnemonic: "黑盒方法按输入处理顺序背：分类、边界、组合关系、判定表、经验推测。",
    points: [
      "黑盒测试不看内部结构，只看输入、输出和功能",
      "常用方法：等价类划分、边界值分析、因果图、判定表、错误推测法",
      "等价类规则：有效类尽可能多覆盖；无效类一次只覆盖一个",
      "一般边界值分析常用 4n+1；健壮性边界值分析常用 6n+1",
      "驱动模块模拟上级模块，桩模块模拟下级模块",
      "性能测试模拟正常、峰值、异常负载；负载看工作负荷和响应时间；强度看长时间高负荷；容量看指标极限"
    ],
    answer: "黑盒测试从用户和功能角度出发，不考虑程序内部结构，常用方法包括等价类划分、边界值分析、因果图、判定表和错误推测法。驱动模块模拟上级模块，桩模块模拟下级模块。",
    prompt: "黑盒方法题按五种方法写；集成题补桩/驱动；性能题区分性能、负载、强度、容量。"
  }
];

const drills = [
  {
    q: "质量的属性包括哪些？",
    hint: "按“客户、成本、社会、能否测量、能否预见”说正式词。",
    a: "客户属性、成本属性、社会属性、可测性、可预见性。"
  },
  {
    q: "如何辨证看待质量和客户的关系？",
    hint: "先说相互依赖，再说客户如何判定质量。",
    a: "客户与质量是相互依赖关系。客户是质量的接受者，可以直接观察或感觉质量的存在；质量相对于客户存在，服务于客户，而且由客户判定。"
  },
  {
    q: "朱兰质量管理三部曲是什么？",
    hint: "先计划，再控制，再改进。",
    a: "质量策划、质量控制、质量改进。"
  },
  {
    q: "质量管理体系怎么答？",
    hint: "按方针目标、职责资源、产品实现、测量分析改进展开。",
    a: "质量管理体系是在质量方面指挥和控制组织的管理体系。它由质量方针、质量目标、质量策划、管理职责、资源管理、产品实现、测量、分析和改进等过程组成。"
  },
  {
    q: "三种 SQA 组织结构是什么，各自怎么抓重点？",
    hint: "按独立性、深入项目、折中三种情况区分。",
    a: "独立 SQA 部门：独立客观、利于资源共享，但难深入项目；独立 SQA 工程师：能深入项目、问题解决快，但独立性和经验共享弱；独立 SQA 小组：综合两者优点，兼顾相对独立、融入项目和经验共享。"
  },
  {
    q: "SQA 人员的主要工作内容有哪些？",
    hint: "按计划、过程、评审、审计、记录、报告、跟踪、度量说。",
    a: "制定 SQA 计划；参与软件过程描述；评审软件工程活动；审计软件工作产品；记录偏差并按规程处理；报告不符合项；跟踪问题直到解决；协调变更控制并帮助收集和分析软件度量信息。"
  },
  {
    q: "什么是软件缺陷？",
    hint: "从内部和外部两个角度答。",
    a: "从产品内部看，软件缺陷是开发或维护过程中存在的错误、毛病等各种问题；从外部看，软件缺陷是系统需要实现的某种功能的失效或违背。"
  },
  {
    q: "为什么要做软件评审？",
    hint: "按成本、技术、效率三类展开。",
    a: "成本上：缺陷发现越晚纠正费用越高，评审能尽早发现缺陷、减少返工。技术上：前一阶段错误会导致后一阶段错误并逐渐累积。效率上：减少修订、测试、调试和维护时间，缩短周期，控制风险。"
  },
  {
    q: "走查和审查有什么区别？",
    hint: "主要抓正式性和对 SQA 的贡献。",
    a: "走查和审查的区别在正式性等级，审查更正式。走查的发现主要限于被评审文档的意见；审查还和改进开发方法自身相结合，因此审查对 SQA 的贡献更大。"
  },
  {
    q: "软件质量费用四类是什么？",
    hint: "先分控制费用和失效费用，再各拆两类。",
    a: "控制费用包括预防费用和评价费用；失效费用包括内部失效费用和外部失效费用。"
  },
  {
    q: "软件质量度量的一般过程是什么？",
    hint: "目标、过程、数据、分析反馈、改进。",
    a: "识别目标和度量描述，定义度量过程，搜集数据，数据分析与反馈，过程改进。"
  },
  {
    q: "基本测量原则至少要抓住哪些关键词？",
    hint: "按定义清楚、方法可行、结果可靠、有反馈整理。",
    a: "基于正确理论并确定目标；定义一致、客观、无二义；经验和直觉上有说服力；简单可计算；适应产品和过程并尽量自动化；用统计技术建立关系；结果可靠；建立反馈机制。"
  },
  {
    q: "CMMI 五级是什么？",
    hint: "从低成熟度到持续改进。",
    a: "初始级、可重复级、已定义级、已管理级、优化级。"
  },
  {
    q: "IDEAL 模型五步是什么？",
    hint: "启动改进、诊断现状、建立方案、行动实施、学习复盘。",
    a: "初始化、诊断、建立、行动、学习。"
  },
  {
    q: "耦合从高到低怎么排？",
    hint: "耦合越高越不好，所以题目常要求从高到低背。",
    a: "内容耦合、公共环境耦合、外部耦合、控制耦合、特征耦合、数据耦合、非直接耦合。"
  },
  {
    q: "内聚从低到高怎么排？",
    hint: "内聚越高越好，所以题目常要求从低到高背。",
    a: "偶然内聚、逻辑内聚、时间内聚、过程内聚、通信内聚、信息内聚、功能内聚。"
  },
  {
    q: "高质量编程里指针参数和动态内存要注意什么？",
    hint: "只输入加 const；释放后置 NULL。",
    a: "如果参数是指针且仅作输入用，应在类型前加 const。动态内存申请后要检查是否成功，申请与释放配对，free/delete 后立即置 NULL，避免野指针。"
  },
  {
    q: "什么是软件测试？",
    hint: "先给最短定义，再补测试用例和规格说明。",
    a: "软件测试是为了发现错误而执行程序的过程。也可以说，它是根据规格说明和程序结构设计测试用例，并利用这些用例运行程序以发现错误的过程。"
  },
  {
    q: "软件测试和调试有什么区别？",
    hint: "测试发现错误；调试定位并修改错误。",
    a: "测试是为了发现软件中存在的错误，是有计划的，需要测试设计，经常可由独立测试组完成；调试是在发现错误后定位原因并修改错误，通常由了解详细设计的开发人员完成，是推理过程。"
  },
  {
    q: "什么是测试用例？",
    hint: "输入、执行条件、预期结果。",
    a: "测试用例是为特定目的而设计的一组测试输入、执行条件和预期结果，是执行测试的最小实体。"
  },
  {
    q: "单元、集成、系统、验收分别侧重什么？",
    hint: "模块、接口、整体、需求。",
    a: "单元测试侧重独立单元/模块；集成测试侧重模块间衔接、接口和参数传递；系统测试侧重完整系统运行及与其他软件/环境兼容；验收测试按需求规格说明书检查是否满足用户预期。"
  },
  {
    q: "白盒测试的重点有哪些？",
    hint: "接口、数据、边界、路径、错误处理。",
    a: "模块接口测试、模块局部数据结构测试、模块边界条件测试、模块独立执行路径测试、模块内部错误处理测试。"
  },
  {
    q: "逻辑覆盖从弱到强怎么排？",
    hint: "从只执行语句，到覆盖所有路径。",
    a: "语句覆盖、判定覆盖、条件覆盖、判定/条件覆盖、条件组合覆盖、路径覆盖。"
  },
  {
    q: "基本路径测试大题四步是什么？",
    hint: "画图、算复杂度、列路径、配用例。",
    a: "画控制流图，计算环路复杂度，列出基本独立路径，为每条路径设计测试用例。"
  },
  {
    q: "黑盒测试常用方法有哪些？",
    hint: "分类、边界、因果、判定表、经验推测。",
    a: "等价类划分、边界值分析、因果图、判定表、错误推测法。"
  },
  {
    q: "等价类设计测试用例的关键规则是什么？",
    hint: "有效类尽量多覆盖；无效类一次只测一个。",
    a: "先给每个等价类编号；一个新用例尽可能多覆盖尚未覆盖的有效等价类；一个新用例只覆盖一个尚未覆盖的无效等价类，直到所有无效等价类被覆盖。"
  },
  {
    q: "一般边界值和健壮性边界值分别常用多少个用例？",
    hint: "一般不包含越界，健壮包含越界。",
    a: "n 个变量时，一般边界值分析常用 4n+1；健壮性边界值分析常用 6n+1。"
  },
  {
    q: "因果图法的基本步骤是什么？",
    hint: "原因、结果、关系、约束、判定表、用例。",
    a: "找出原因和结果，画出因果关系，标明约束，把因果图转换成判定表，再为判定表每一列设计测试用例。"
  },
  {
    q: "桩模块和驱动模块分别是什么？",
    hint: "驱动模拟上级，桩模拟下级。",
    a: "驱动模块模拟被测模块的上一级模块，接收数据、传给被测模块、启动被测模块并给出结果；桩模块模拟被测模块调用的下级模块，通常只做少量数据处理，用于检查接口。"
  },
  {
    q: "负载测试、强度测试、容量测试怎么区分？",
    hint: "负载看工作量和响应，强度看长时间高压，容量看极限。",
    a: "负载测试关注一定工作负荷下系统的负荷和响应时间；强度测试关注一定负荷条件下较长时间连续运行造成的影响；容量测试通过测试分析某项指标极限值，看系统在极限状态下是否仍能正常运行或保持主要功能。"
  }
];

const stack = document.querySelector("#floorStack");
const roomPanel = document.querySelector(".room-panel");
const roomFloor = document.querySelector("#roomFloor");
const roomCode = document.querySelector("#roomCode");
const roomTitle = document.querySelector("#roomTitle");
const roomScene = document.querySelector("#roomScene");
const roomMnemonic = document.querySelector("#roomMnemonic");
const roomPoints = document.querySelector("#roomPoints");
const roomAnswer = document.querySelector("#roomAnswer");
const roomPrompt = document.querySelector("#roomPrompt");

const drillLabel = document.querySelector("#drillLabel");
const drillQuestion = document.querySelector("#drillQuestion");
const drillHint = document.querySelector("#drillHint");
const drillAnswer = document.querySelector("#drillAnswer");
const showAnswer = document.querySelector("#showAnswer");
const prevDrill = document.querySelector("#prevDrill");
const nextDrill = document.querySelector("#nextDrill");

let activeRoom = rooms[0].id;
let activeDrill = 0;

function renderRooms() {
  stack.innerHTML = "";
  rooms.slice().reverse().forEach((room) => {
    const row = document.createElement("div");
    row.className = "floor-row";

    const label = document.createElement("div");
    label.className = "floor-label";
    label.textContent = room.floor;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-button";
    button.style.setProperty("--room-color", room.color);
    button.dataset.room = room.id;
    button.setAttribute("aria-pressed", room.id === activeRoom ? "true" : "false");
    button.innerHTML = `
      <span class="room-icon" aria-hidden="true">${room.icon}</span>
      <span>
        <strong>${room.label}</strong>
        <span>${room.short}</span>
      </span>
    `;
    if (room.id === activeRoom) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", () => setRoom(room.id));

    row.append(label, button);
    stack.append(row);
  });
}

function setRoom(id) {
  const room = rooms.find((item) => item.id === id) || rooms[0];
  activeRoom = room.id;
  roomPanel.style.setProperty("--active-color", room.color);
  roomFloor.textContent = room.floor;
  roomCode.textContent = room.short;
  roomTitle.textContent = room.label;
  roomScene.textContent = room.scene;
  roomMnemonic.textContent = room.mnemonic;
  roomAnswer.textContent = room.answer;
  roomPrompt.textContent = room.prompt;
  roomPoints.innerHTML = "";
  room.points.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    roomPoints.append(li);
  });
  document.querySelectorAll(".room-button").forEach((button) => {
    const isActive = button.dataset.room === room.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setDrill(index) {
  activeDrill = (index + drills.length) % drills.length;
  const drill = drills[activeDrill];
  drillLabel.textContent = `题 ${activeDrill + 1} / ${drills.length}`;
  drillQuestion.textContent = drill.q;
  drillHint.textContent = drill.hint;
  drillAnswer.textContent = drill.a;
  drillAnswer.hidden = true;
  showAnswer.textContent = "显示答案";
}

showAnswer.addEventListener("click", () => {
  const willShow = drillAnswer.hidden;
  drillAnswer.hidden = !willShow;
  showAnswer.textContent = willShow ? "隐藏答案" : "显示答案";
});

prevDrill.addEventListener("click", () => setDrill(activeDrill - 1));
nextDrill.addEventListener("click", () => setDrill(activeDrill + 1));

renderRooms();
setRoom(activeRoom);
setDrill(activeDrill);
