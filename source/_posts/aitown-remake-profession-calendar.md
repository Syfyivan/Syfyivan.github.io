---
title: "AI 小镇改造手记 · 二：职业与日历，给模拟世界叠一层 RPG"
date: 2026-06-15 12:00:00
tags: [AI, Agent, AI Town, 改造手记, RPG, 系统设计]
categories: [技术笔记, AI 小镇改造手记]
---

上一篇我把"观众变居民"这件事讲完了：每个浏览器有自己的角色，能走进镇子，右侧面板成了我的居民仪表盘。

但身份立住之后，我很快撞到下一个问题——**住进去了，然后呢？**

## 为什么：光有 AI 居民，住进去也没事干

居民模式跑通的那天我挺高兴，进去转了两圈就泄气了。我能走、能看 NPC 聊天、能开菜地，但本质上还是在"逛"。镇子是 AI 在过日子，我顶多算个串门的。

我想要的是一种很具体的东西：**有事可做，而且做了有进度。**

进度这两个字很关键。逛一圈不留痕迹，再逛一圈还是从零开始，这种世界待不住人。生活模拟之所以让人上头，是因为今天的你比昨天强一点——多了几个铜币、技能涨了一级、解锁了一样昨天做不出的东西。这种"昨天的我留下了什么"的累积感，正是原版 AI Town 对人类玩家完全没有的。它的累积全发生在 AI 身上：NPC 记得彼此说过的话，关系在变，而"我"刷新一下就回到原点。

这正是 Stardew 这类生活模拟给人的钩子——你不是在看世界，你在世界里一天天变强。所以我给自己定了个方向，写进了那次 commit 的说明里：

> Give residents a daily life loop.
> The town needs more Stardew-like structure before deeper multiplayer professions.

落到玩法上就三样东西：**职业**（我能去铁铺、木作坊打工）、**经济**（打工有铜币，钱能改变我能做什么）、**日历**（这一切发生在镇子自己的时间里，干一天活要睡一觉才能再干）。

说白了，我想往这个模拟世界上叠一层 RPG 的进度和经济。

## 难在哪：RPG 进度和模拟世界不是天生合得来

真动手才发现，这层叠加有四个不那么显然的难点。

**第一，一套 RPG 进度怎么和模拟世界共存。** 原版 AI Town 的核心是单线程 engine + historical replay，时间是给 AI 仿真用的。我要加的经验值、等级、解锁，是给"我"这个人看的进度。两套东西塞在一个世界里，不能互相打架。

**第二，班次、经验、货币怎么持久化。** 这些是真实玩家数据，刷新页面不能丢，俩浏览器进来也不能塌成一个人。得有自己的 Convex 表，还得想清楚老记录没有这些字段时怎么办——本地后端经常返回旧形状。

**第三，日历怎么和世界时间挂钩。** "干一天活"听起来简单，但镇子里的"一天"到底是什么？是现实时间一天？显然不行。它得是个游戏内的、可推进的天数。

**第四，打工怎么"在职业建筑里发生"。** 最早我把打工做成了一个 45 秒的进度条，点一下读条领钱。做完自己都觉得别扭——这不是小镇上班，这是网页计时器。真正的"上班"应该是走进那栋楼、走到报名桌前、确认，才开始。

下面逐个说我怎么解的。

## 怎么做

### 一、PROFESSION_CONFIG：把十二种职业写成一张配置表

我先把职业这件事彻底数据化。`convex/world.ts` 里有一张 `PROFESSION_CONFIG`，十二种职业，每种都规定了 NPC 是谁、在哪栋楼、干什么活、给多少钱、给多少经验，以及十级各自解锁什么。

```ts
const PROFESSION_CONFIG: Record<ProfessionId, {
  label: string;
  skillName: string;
  npcName: string;
  workplace: string;
  jobTitle: string;
  payCoins: number;
  xpGain: number;
  levelUnlocks: string[];
}> = {
  carpenter: {
    label: '木匠',
    skillName: '木工等级',
    npcName: '木匠闻桐',
    workplace: '木作坊',
    jobTitle: '裁木板和修门窗',
    payCoins: 15,
    xpGain: 14,
    levelUnlocks: [
      '木板和简易修补', '木箱和储物柜', '木栅栏和小门', /* …… */
      '开设木作坊和承接建筑订单',
    ],
  },
  // blacksmith / farmer / fisher / artist / mage / …… 共 12 种
};
```

这张表是整套系统的源头。`previewCareerJobs`、`summarizeCareerProgress`、`createCareerShift` 全都从它读数据。我想调一种职业的报酬、改一条解锁，只动这一处，前后端跟着一起变，不会出现"前端写 15 铜币、后端发 16 铜币"那种对不上的尴尬。

等级算法也极简——就是一行纯函数：

```ts
function professionLevel(experience: number) {
  return Math.min(CAREER_MAX_LEVEL, Math.floor(experience / CAREER_LEVEL_XP) + 1);
}
```

每 50 点经验（`CAREER_LEVEL_XP`）升一级，封顶 10 级（`CAREER_MAX_LEVEL`），每级对应 `levelUnlocks` 里的一行字。这就回答了难点一：RPG 进度从头到尾是**一条只吃经验值、吐等级和解锁的纯函数**，它不读 engine 的仿真状态，也不往里写任何东西。AI 那套时间继续自己跑，我这套等级继续自己算，两边**井水不犯河水**。十二种职业里，我让画室（artist）单独走了一条更重的成长线，剩下十一种共用这套轻量的"经验→等级"模型，先把骨架铺满，细节后面再补。

### 二、Town calendar：给镇子一个自己的"今天"

日历我没有去碰 engine 的时间，而是单独算了一个 `getTownCalendar`：

```ts
export function getTownCalendar(now: number, daysSlept = 0) {
  const dayNumber = Math.max(1, Math.floor(daysSlept) + 1);
  const month = Math.floor((dayNumber - 1) / TOWN_MONTH_DAYS) + 1;
  const dayOfMonth = ((dayNumber - 1) % TOWN_MONTH_DAYS) + 1;
  const date = new Date(now);
  return {
    dayNumber, month, dayOfMonth,
    hour: date.getHours(),
    minute: date.getMinutes(),
    label: `溪山历 ${month}月${dayOfMonth}日 ${/* HH:mm */}`,
    isMarketDay: dayOfMonth === TOWN_MARKET_DAY,
    daysUntilMarket,
  };
}
```

这里有个我自己挺满意的设计：**"哪一天"和"几点"是两套时间。**

"几点"取现实时钟（`new Date(now).getHours()`），所以镇子的早晚和你现实里的早晚同步，看着自然。但"第几天"完全由 `daysSlept` 决定——这个数存在居民档案里，只有睡觉才会 +1。一个月 30 天（`TOWN_MONTH_DAYS`），第 15 天是集市日（`TOWN_MARKET_DAY`）。

于是镇子有了自己可推进、可持久化的日历，而且推进权在玩家手里：你不睡觉，今天永远是今天。这就为下一步"一天只能打一次工"埋好了锚点——判定"是不是同一天"，只要比一个整数 `dayNumber` 就行，不用去算时间戳的零点、时区这些烦人的东西。

`getTownCalendar` 还顺手算了集市日：一个月第 15 天是集市，并给出"还有几天到集市"。这条信息眼下只是日历上的一个标记，但它是故意留的伏笔——经济系统真正铺开后，集市日就是买卖、供货合同发生的那一天。日历不只是个计时器，它是后面所有"什么时候发生"的总开关。

### 三、residentProfiles / artStudioWorkers / careerProfiles：三张表各管一摊

持久化我拆成了三张 Convex 表，职责分得很清楚。

`residentProfiles` 管"我是谁、过到第几天"，关键就是那个 `daysSlept`，日历的天数全靠它。

`careerProfiles` 管职业进度：

```ts
careerProfiles: defineTable({
  worldId: v.id('worlds'),
  playerId,
  residentName: v.string(),
  experience: v.object({
    blacksmith: v.number(), carpenter: v.number(), farmer: v.number(),
    /* …… 十二种职业各一个经验字段 */
  }),
  totalJobs: v.number(),
  totalCoinsEarned: v.number(),
  lastWorkDayNumber: v.optional(v.number()),
  lastWorkDateLabel: v.optional(v.string()),
})
```

注意 `experience` 是个**定死十二个字段的对象**，不是 map。这样 schema 校验能帮我兜住打错的职业名。`lastWorkDayNumber` 记下我上次打工是镇上第几天——这是"一天一次"判定的核心字段。

第三张 `artStudioWorkers` 是画室那条线单独的账本，它字段更细：`florins`（画室用的货币）、`paintingSkill`、`creativity`、`reputation`、`shiftsCompleted`。画室是我做的一个更完整的职业样板，用的是班次（shift）模型而不是日历模型——一个班次有明确的 `startedAt` / `endsAt`，`getStudioShiftProgress` 按时间算 0 到 1 的进度，做完一笔 `settleArtStudioShift` 才结算报酬和三维成长。它跟通用 `careerProfiles` 平行存在、互不污染：前者是"打一个班"，后者是"上一天班"，两种节奏我都想留着，看哪种玩起来更顺。

这里还有个我反复强调过的约束，写在每次 commit 的 Constraint 里：**老记录可能没有这些新字段。** 本地 Convex 后端经常返回旧形状的文档，所以无论 schema 怎么加字段，读取侧都得能容错。`normalizeProfessionExperience` 就是干这个的——它把一个可能残缺的 `experience` 对象补齐成十二个职业都有值的完整对象，缺的填 0，负的归零。新系统不能因为一条老数据就整个炸掉，这是难点二里最容易被忽略、但最磨人的一半。

### 四、在职业建筑里开工：把"读条"换成"走进去"

最后是手感。我先把那个 45 秒进度条砍了，理由写在 commit 里很直白：

> Rejected: Keep the 45-second career shift model — It made day labor feel like a web timer instead of a town schedule.

换成的模型是：打工不是点按钮，而是**走进职业建筑、走到报名桌前**。每栋楼的几何位置、报名桌、接待区都写在 `src/components/professionCatalog.ts` 里（木作坊、铁铺、星井小塔、溪山酒馆四栋），`ProfessionBuildingHotspot.tsx` 负责进楼，`ProfessionWorkOverlay.tsx` 负责屋里的交互。前端的守卫很严，必须人到桌前才让报名：

```ts
const requestRegistration = useCallback(() => {
  if (!status?.player) {
    toast.info('先加入小镇，再来报名临时工。');
    return;
  }
  if (!canReachPaper) {
    toast.info('先走到接待桌前，再查看桌上的报名纸。');
    return;
  }
  if (workedToday) {
    toast.info(workedHereToday
      ? `今天已经在${building.buildingName}做过一天工了。`
      : `今天已经做过一份临时工了，睡一觉明天再来。`);
    return;
  }
  setConfirmOpen(true);
}, [/* …… */]);
```

确认之后才走到后端那一笔。后端的 `workCareerDay` mutation 是真正把四样东西缝在一起的地方：

```ts
const calendar = getTownCalendar(now, residentProfile?.daysSlept ?? 0);
const careerProfile = await findCareerProfile(ctx.db, world._id, args.playerId);
if (careerProfile?.lastWorkDayNumber === calendar.dayNumber) {
  throw new Error('今天已经做过一天临时工了，睡一觉明天再去。');
}
// …… 扣体力、发铜币、加经验
const dayWork = createCareerShift(args.profession, now, calendar);
const nextExperience = applyCareerShiftExperience(experience, dayWork);
```

这一段把全部线索收口了：日历的 `dayNumber` 和档案里的 `lastWorkDayNumber` 一比，就实现了"一天只能打一次工"——你想再打，得先睡觉让 `daysSlept` 涨上去。报酬和经验立即结算（`payCoins`、`xpGain` 来自 `PROFESSION_CONFIG`），不再读条。所谓"打工在建筑里发生"，前端管空间（人必须在桌前），后端管时间（天必须没打过）。难点三、四一起解决。

## 小结

这一篇我给模拟世界叠了一层 RPG：

- **职业**用 `PROFESSION_CONFIG` 一张表数据化，等级是不碰 engine 的纯函数；
- **经济**靠 `careerProfiles` 的铜币和经验、`artStudioWorkers` 的 florins 持久化，老记录有 fallback；
- **日历**用 `getTownCalendar` 单算，"几点"跟现实、"第几天"跟 `daysSlept`，推进权在玩家；
- **打工**搬进职业建筑，前端守空间、后端守"一天一次"。

最让我满意的不是某段代码，而是这层 RPG 和原版仿真**没有打架**：进度是给人看的纯函数，时间是玩家能推进的日历，两套时间各走各的。

但写到这你可能也看出来了——现在的"打工"还是单机的、立即结算的。真正的经济得是**多人的**：我打的工、攒的钱，要能和别人、和 AI 居民产生交换。那是后面要啃的硬骨头。下一篇见。
