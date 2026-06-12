---
title: "用 Expo 把一个旅行 App 从想法做到能跑：Tripmates 项目拆解"
date: 2026-06-12 18:00:00
tags: [React Native, Expo, 移动端, TypeScript, 全栈]
categories: [技术笔记, 项目工坊]
---

我和朋友计划新疆、广西两条旅行线路时，遇到一个很俗但很真实的问题：小红书链接散在微信群里，攻略文档躺在飞书里，行程表又是另一个表格。于是我做了 Tripmates——一个「以城市为单位」的私人旅行资料库 App：每张城市卡片下面挂四个板块，灵感、攻略、行程、回忆。

这篇不讲产品，讲工程：一个人怎么用 Expo 把一个跨平台 App 从零做到朋友手机上能装、能同步、还能远程推更新。整个项目不大，但麻雀虽小，移动端工程的关键决策一个不少。

## 为什么选 Expo，而不是 Ionic 或原生

做之前我认真比较过 Ionic。Ionic 本质是 WebView 里跑网页，适合「长得像 App 的网页」；但 Tripmates 以后大概率要碰照片回忆、分享面板、推送、地图、离线访问这些原生能力，WebView 路线会越走越别扭。

React Native + Expo 的组合是另一种取舍：一套 TypeScript 代码，渲染走原生 UI 控件，现在轻量，以后留有余地。而 Expo 在 RN 之上又解决了三件最劝退新手的事：

- **不用装 Xcode/Android Studio 就能跑**：`expo start` 出二维码，手机装个 Expo Go 扫码就能看到 App，热更新秒级生效；
- **云端构建**：EAS Build 在云上帮你出 APK / iOS 包，本机不需要完整原生工具链；
- **OTA 热更新**：EAS Update 可以跳过应用商店，直接把 JS 层更新推到用户手机上。

对「想法还在变、用户只有几个朋友」的阶段，这套组合的迭代成本几乎是最低的。

## 项目结构：没有路由库，也是一种路由决策

整个项目的源码结构出乎意料地朴素：

```text
tripmates/
├── index.ts            # 入口，registerRootComponent(App)
├── App.tsx             # 全部 UI 和页面逻辑
├── app.json            # Expo 应用配置（包名、图标、OTA）
├── eas.json            # EAS 构建配置（preview/production）
├── src/
│   ├── config/env.ts           # 环境变量读取
│   ├── types.ts                # 领域类型
│   ├── data/seed.ts            # 种子数据（新疆、广西）
│   ├── storage/localCityStore.ts  # AsyncStorage 持久化
│   └── services/
│       ├── supabaseClient.ts   # Supabase 客户端
│       └── citySync.ts         # 同步、登录、邀请码
└── supabase/           # 数据库 schema 与迁移
```

注意：这里没有 expo-router，也没有 react-navigation。入口 `index.ts` 只有一行有效代码：

```ts
// index.ts
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

「路由」是 App.tsx 里的两个 state：

```tsx
// App.tsx
const [screen, setScreen] = useState<'home' | 'detail'>('home');
const [activeTab, setActiveTab] = useState<EntryKind>('idea');
```

首页是城市卡片列表，点一张卡 `setScreen('detail')` 进城市详情，详情页里四个 tab 切板块。就这么多。

这是个有意识的决策，不是偷懒。App 只有两个页面时，引入路由库的收益是负的：多一层依赖、多一套心智模型、Expo Go 里多一类可能出问题的东西。等页面真的多起来（比如邀请链接要深链到具体城市，`app.json` 里已经预埋了 `"scheme": "tripmates"`），再换 expo-router 也不迟。**起步阶段，结构跟着页面数量走，而不是跟着教程走。**

## 状态与数据层：本地优先，云端可选

Tripmates 的数据架构可以总结成一句话：**AsyncStorage 是事实来源，Supabase 是可选的共享层**。

### 本地持久化：带版本号的快照

所有状态收敛在一个 `LocalCityState` 对象里（`src/types.ts`）：

```ts
export type LocalCityState = {
  version: 3;
  activeCityId: string;
  cities: CitySpace[];
  entries: CityEntry[];
};
```

`src/storage/localCityStore.ts` 负责读写，读取时做版本和形状校验，对不上就直接回退种子数据：

```ts
const LOCAL_STATE_KEY = 'tripmates:v3:city-library-state';

export async function loadLocalCityState(): Promise<LocalCityState> {
  const storedValue = await AsyncStorage.getItem(LOCAL_STATE_KEY);
  if (!storedValue) return defaultLocalState;

  const parsed = JSON.parse(storedValue) as Partial<LocalCityState>;
  if (
    parsed.version !== 3 ||
    !parsed.activeCityId ||
    !Array.isArray(parsed.cities) ||
    !Array.isArray(parsed.entries)
  ) {
    return defaultLocalState;
  }
  // ...
}
```

key 里带 `v3`、对象里也带 `version: 3`，看着重复，其实是 OTA 更新逼出来的防御：JS 代码可以热更，但用户手机里的旧数据不会跟着热更。结构一变，新代码读旧数据就可能崩。版本号校验保证最坏情况是「数据重置」而不是「白屏」。

App.tsx 里用两个 effect 把状态和存储接起来——启动时水合（hydrate），之后每次变更自动落盘：

```tsx
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  loadLocalCityState()
    .then((storedState) => { setCityState(storedState); /* ... */ })
    .finally(() => setIsHydrated(true));
}, []);

useEffect(() => {
  if (!isHydrated) return;
  saveLocalCityState(cityState);
}, [isHydrated, cityState]);
```

`isHydrated` 这个标志位很关键：没有它，第二个 effect 会在首次渲染时就把默认种子数据写进存储，覆盖用户的真实数据。这是「状态 + 持久化」组合里最经典的坑。

状态管理本身就是 useState + useMemo，没有 Redux 也没有 Zustand。单组件、单状态树的体量下，派生数据（当前城市的条目、各板块计数）用 useMemo 从 `cityState` 算出来就够了。

### 云端层：配置即开关

Supabase 客户端的初始化方式值得一看（`src/services/supabaseClient.ts`）：

```ts
import 'react-native-url-polyfill/auto';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
```

三个细节：

1. **环境变量没配，客户端就是 `null`**，App 整体退化为纯本地模式，照样能用。`src/config/env.ts` 读的是 `EXPO_PUBLIC_` 前缀变量（值在 `.env.local`，不进仓库）；
2. **`storage: AsyncStorage`**：RN 没有 localStorage，登录会话要显式存到 AsyncStorage 才能跨重启保持；
3. **`detectSessionInUrl: false`**：这是给浏览器 OAuth 回跳用的，App 里没有 URL 可言，必须关掉。

登录用的是邮箱 Magic Link（`signInWithOtp`），免去密码体系；同步是手动按钮触发的「推送整城」：把当前城市和它的条目整批 upsert 上去，成功后把本地条目标成 `synced`。`citySync.ts` 里还有个有意思的容错——如果远端表是老版本、缺 `source_url` 列，捕获错误后自动降级成不带新列的 payload 重试。朋友用的旧数据库不用立刻跑迁移 SQL，App 不会因此报死。

权限靠 Supabase 的 RLS（行级安全）兜底，邀请码加入和导出码都走数据库 RPC 函数，手机端始终只持有 publishable key，敏感逻辑全部留在服务端。

## OTA 更新：发版不求人

这是整个项目里我觉得最值得学的部分。朋友装的是 EAS Build 出的 preview APK，之后所有 JS 层改动都通过 EAS Update 推送，不用重新发包。App 里做了一个更新面板，核心逻辑在 App.tsx：

```tsx
async function checkForAppUpdate(isAutomatic = false) {
  // ...
  const update = await Updates.checkForUpdateAsync();
  if (!update.isAvailable) { /* 已是最新 */ return; }

  setUpdateStatus('downloading');
  await Updates.fetchUpdateAsync();
  setUpdateStatus('ready');   // 等用户点「重启更新」
}
```

启动时查一次，App 从后台切回前台再查一次（监听 `AppState`）。但真正的经验藏在两个不起眼的地方：

**第一，Expo Go 里 OTA 不可用，要显式探测。**

```tsx
function isOtaUpdateRuntimeAvailable() {
  return Updates.isEnabled && Boolean(Updates.channel) && Boolean(Updates.runtimeVersion);
}
```

本地开发跑在 Expo Go 里时这些值都是空的，不判断就会在开发环境里报一堆莫名其妙的更新错误。

**第二，用户根本不知道 OTA 有没有生效。** 所以代码里硬编码了一个肉眼可见的版本签名：

```tsx
const appCapabilityVersion = '版本 1.0.8 · 功能 2026-06-06.6';
```

每次发 OTA 都手动 bump 这个字符串，朋友打开 App 看一眼就知道自己在哪个版本。土办法，但对「给朋友用的 App」来说，比任何遥测都管用。

## 跨平台踩坑记录

按踩到的顺序列几个：

- **`URL` 不是处处都有**。RN 的 JS 运行时（Hermes）没有完整的 WHATWG URL 实现，Supabase SDK 又依赖它，所以 `supabaseClient.ts` 第一行必须是 `import 'react-native-url-polyfill/auto'`，漏掉就是运行时报错。
- **OTA 有边界**。改 JS、样式、文案、图片可以热更；装新原生模块、改权限、改图标启动屏、升 Expo SDK，都必须重新出包。判断标准就一条：动没动原生层。
- **Android 升级靠 `versionCode`**。发新 APK 时要记得 bump `app.json` 里的 `android.versionCode`（项目里已经是 6 了），否则 Android 不认为是升级，朋友装不上。
- **`runtimeVersion` 策略要想清楚**。项目用的 `"policy": "appVersion"`：runtime 跟着 `expo.version` 走，纯 JS 更新不动它就能兼容旧安装包，动了就等于宣布旧包不再接收更新。
- **Expo SDK 版本要钉死再查文档**。这个项目用 SDK 56，仓库的 AGENTS.md 里就一句话：「Expo 变了，写代码前先看对应版本的官方文档」。Expo 大版本之间 API 变动不小，网上教程的保质期很短。

## 给想做 App 的人的路线建议

照着 Tripmates 的实际路径，我会这样排序：

1. **第 0 天**：`npx create-expo-app` + Expo Go 扫码，先让东西在自己手机上动起来，这一步的正反馈最重要；
2. **第一周**：单文件写 UI，state 当路由，AsyncStorage 做持久化（记得 hydration 标志位和数据版本号），不引任何状态库和路由库；
3. **需要多人/多端时**：接 Supabase 这类 BaaS，客户端做成「配置即开关」的可选层，本地模式永远可用；权限走 RLS，密钥只用 publishable key，任何要私密凭据的逻辑放服务端（Edge Function）；
4. **要给朋友装时**：Android 走 EAS Build 出 preview APK 直接发链接，iOS 走 TestFlight，同时把 EAS Update 配好——之后 90% 的迭代都不用重新发包；
5. **页面多起来再补课**：expo-router、深链、推送、地图，按需引入，每一个都等到「不引入就难受」的时候再上。

一个人、一套 TypeScript、两个平台、还能远程发版——这条路在 2026 年已经被 Expo 铺得相当平了。剩下的，就是先把那个你自己每周都会打开的小需求做出来。
