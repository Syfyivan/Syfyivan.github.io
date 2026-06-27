const rooms = [
  {
    id: "quality",
    floor: "大门",
    label: "质量大门",
    short: "客成社测预",
    icon: "质",
    color: "#326aa3",
    scene: "门口站着客户，手里拿着需求单。旁边五块牌子写着“客、成、社、测、预”。",
    mnemonic: "质量五属性：客成社测预。",
    points: ["客户属性", "成本属性", "社会属性", "可测性", "可预见性", "质量由客户判定，既满足明示需求，也满足隐含需求"],
    answer: "质量是产品、过程或体系满足客户明确需求和隐含期望的程度。质量相对于客户存在，服务于客户，并由客户判定。",
    prompt: "遮住答案后，先说五个属性，再补一句“质量服务于客户，由客户判定”。"
  },
  {
    id: "sqa",
    floor: "一楼前台",
    label: "SQA 前台",
    short: "部门 工程师 小组",
    icon: "保",
    color: "#22776d",
    scene: "一楼有三个窗口：独立部门窗口、项目工程师窗口、小组窗口。每个窗口代表一种 SQA 组织结构。",
    mnemonic: "SQA：部门独立，工程师深入，小组折中。",
    points: ["独立 SQA 部门：独立客观，但不易深入项目", "独立 SQA 工程师：深入项目，但独立性较弱", "独立 SQA 小组：折中兼顾，便于深入项目和共享经验", "SQA 工作：计划、过程、评审、审计、记录、报告、跟踪、度量"],
    answer: "开发人员主要负责技术实现；SQA 人员负责质量保证计划、监督、记录、分析和报告，确保过程被执行并跟踪问题解决。",
    prompt: "看到三个窗口，先说组织结构；看到前台工作清单，再说 SQA 的主要工作。"
  },
  {
    id: "review",
    floor: "二楼检查室",
    label: "评审室",
    short: "早抓缺陷",
    icon: "审",
    color: "#a3312b",
    scene: "二楼评审室里有两位医生：走查医生穿便装，审查医生穿正装。墙上写着“越晚发现，越贵”。",
    mnemonic: "评审为早抓，晚抓代价大。",
    points: ["走查：较不正式", "审查：更正式，对 SQA 贡献更大", "评审能尽早发现缺陷", "评审能减少返工、降低成本、缩短周期、控制风险"],
    answer: "软件评审的主要目的，是在软件生命周期早期发现缺陷，减少后期返工和维护成本，提高开发、测试和维护效率。",
    prompt: "先比较走查和审查，再围绕“早发现、少返工、降成本、控风险”展开。"
  },
  {
    id: "cost",
    floor: "二楼费用室",
    label: "质量费用室",
    short: "预评内外",
    icon: "费",
    color: "#b57918",
    scene: "费用室桌上放着四本账：预防账、评价账、内部失效账、外部失效账。",
    mnemonic: "质量费用：预评内外。",
    points: ["控制费用包括预防费用和评价费用", "失效费用包括内部失效费用和外部失效费用", "预防费用：防止错误发生", "评价费用：检查、评审、测试", "内部失效：交付前发现并修改", "外部失效：交付后用户或维护组发现并修改"],
    answer: "软件质量费用通常分为控制费用和失效费用。控制费用包括预防费用、评价费用；失效费用包括内部失效费用、外部失效费用。",
    prompt: "看到四本账，先按“控制/失效”分两类，再展开成预防、评价、内部、外部。"
  },
  {
    id: "design",
    floor: "三楼手术室",
    label: "设计与编码",
    short: "低耦合 高内聚",
    icon: "设",
    color: "#5b4aa8",
    scene: "三楼手术室有两张床：一张写“设计”，一张写“编程”。医生先看结构，再看实现。",
    mnemonic: "设计看模块，编码看规范。",
    points: ["设计质量：模块清楚、接口合理、低耦合、高内聚、便于维护", "编程质量：命名清晰、结构清楚、注释适当、异常处理合理", "设计阶段防结构问题", "编码阶段防实现问题"],
    answer: "提高设计质量应重视模块化、信息隐藏、低耦合、高内聚和接口清晰；提高编程质量应遵守编码规范，保持代码清晰、可读、可测试、可维护。",
    prompt: "设计题先答模块和接口；编程题再答规范、清晰、异常处理和维护。"
  },
  {
    id: "testing",
    floor: "四楼检测中心",
    label: "测试流水线",
    short: "单集系验",
    icon: "测",
    color: "#467b42",
    scene: "四楼是一条检测流水线，依次经过单元机、集成机、系统机、验收机。旁边一人拿放大镜找错，另一人拿扳手改错。",
    mnemonic: "单测模块，集测接口，系统测整体，验收看用户。",
    points: ["测试是为了发现错误而执行程序", "调试是定位并修改错误", "测试用例包括测试输入、执行条件和预期结果", "单元测试测模块", "集成测试测接口和参数传递", "系统测试测完整系统", "验收测试按需求规格说明书检查是否满足用户预期"],
    answer: "软件测试是为了发现错误而执行程序的过程。测试层次包括单元测试、集成测试、系统测试和验收测试，分别关注模块、接口、整体系统和用户需求满足情况。",
    prompt: "先背“测试找错、调试改错”；再按单元、集成、系统、验收依次展开。"
  },
  {
    id: "whitebox",
    floor: "五楼白盒实验室",
    label: "白盒实验室",
    short: "接数边路错",
    icon: "白",
    color: "#2f7597",
    scene: "透明盒子里所有电线都看得见。桌上贴着五张标签：接口、数据、边界、路径、错误处理。",
    mnemonic: "白盒：接数边路错。",
    points: ["模块接口测试", "局部数据结构测试", "边界条件测试", "独立执行路径测试", "内部错误处理测试", "白盒测试适合单元测试、集成测试"],
    answer: "白盒测试已知程序内部结构，重点检查模块接口、局部数据结构、边界条件、独立执行路径和内部错误处理。",
    prompt: "看到透明盒子，就按“接口、数据、边界、路径、错误处理”五个点默写。"
  },
  {
    id: "blackbox",
    floor: "五楼黑盒实验室",
    label: "黑盒实验室",
    short: "等边因判错",
    icon: "黑",
    color: "#2f3f4f",
    scene: "黑盒子只露出输入口和输出口。旁边站着“上驱下桩”的小模型：驱动在上，桩在下。",
    mnemonic: "黑盒：等边因判错；上驱下桩别记反。",
    points: ["黑盒测试不看内部结构，只看输入、输出和功能", "等价类划分", "边界值分析", "因果图", "判定表", "错误推测法", "驱动模块模拟上级模块，桩模块模拟下级模块", "性能找瓶颈，负载看响应，强度看持续高压，容量看极限"],
    answer: "黑盒测试从用户和功能角度出发，不考虑程序内部结构，常用方法包括等价类划分、边界值分析、因果图、判定表和错误推测法。驱动模块模拟上级模块，桩模块模拟下级模块。",
    prompt: "先说黑盒五法，再补“上驱下桩”。如果问性能类，按“性瓶、负响、强久、容极”区分。"
  }
];

const drills = [
  {
    q: "“客成社测预”分别是什么？",
    hint: "先回到医院大门，看五块牌子。",
    a: "客户属性、成本属性、社会属性、可测性、可预见性。"
  },
  {
    q: "SQA 三种组织结构怎么记？",
    hint: "回到一楼前台三个窗口。",
    a: "独立 SQA 部门、独立 SQA 工程师、独立 SQA 小组。口诀是：部门独立，工程师深入，小组折中。"
  },
  {
    q: "为什么要做软件评审？",
    hint: "二楼评审室墙上写着“越晚发现，越贵”。",
    a: "为了尽早发现缺陷，减少后期返工，降低成本，缩短周期，控制风险，提高开发、测试和维护效率。"
  },
  {
    q: "软件质量费用四类是什么？",
    hint: "费用室桌上四本账。",
    a: "预防费用、评价费用、内部失效费用、外部失效费用。"
  },
  {
    q: "单元、集成、系统、验收分别侧重什么？",
    hint: "四楼检测流水线，从左到右说。",
    a: "单元测试测模块，集成测试测接口和参数传递，系统测试测完整系统，验收测试按需求规格说明书看是否满足用户预期。"
  },
  {
    q: "测试和调试有什么区别？",
    hint: "放大镜找错，扳手改错。",
    a: "测试是为了发现错误而执行程序；调试是在发现错误后定位原因并修改错误。"
  },
  {
    q: "白盒测试的重点“接数边路错”是什么？",
    hint: "透明盒实验室的五张标签。",
    a: "模块接口、局部数据结构、边界条件、独立执行路径、内部错误处理。"
  },
  {
    q: "黑盒测试的“等边因判错”是什么？",
    hint: "黑盒旁边只有输入口和输出口。",
    a: "等价类划分、边界值分析、因果图、判定表、错误推测法。"
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
