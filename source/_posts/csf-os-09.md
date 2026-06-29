---
title: "《计算机基本功路线图 · 操作系统》第09讲 · 排队的艺术：锁与死锁"
date: 2026-07-06 18:00:00
tags: [计算机基础, 操作系统, 零基础, 编程入门, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.csf-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.csf-core{color:#fff;background:#3f5d7e}
.csf-key{color:#34506e;background:rgba(63,93,126,.12);border:1px solid rgba(63,93,126,.32)}
.csf-skim{color:#7a8390;background:rgba(122,131,144,.1);border:1px solid rgba(122,131,144,.25)}
.csf-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.csf-note,.csf-why,.csf-key-note,.csf-card,.csf-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.csf-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.csf-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.csf-key-note{background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-card{background:rgba(63,93,126,.07);border:1px solid rgba(63,93,126,.34);border-radius:10px}
.csf-legend{background:var(--wash);font-size:14px;line-height:2}
.csf-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.csf-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.csf-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .csf-key{color:#8fb6dd;background:rgba(63,93,126,.22);border-color:rgba(63,93,126,.5)}
html[data-user-color-scheme="dark"] .csf-note{background:rgba(63,93,126,.2)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
html[data-user-color-scheme="dark"] .csf-card{background:rgba(63,93,126,.16)}
</style>

<div class="csf-key-note">上一讲我们亲眼看到：两个线程同时改一个数，结果总是少了一截。这一讲我们给它装上一把"锁"，让"同时改"变成"排队改"，数字稳稳回到 200 万。但锁是把双刃剑——用得不对，两个线程会卡死在原地，谁也不动。这就是<strong>死锁</strong>。今天我们把这两件事都亲手做一遍。</div>

## 🎯 这一讲你会学到什么

上一讲的结尾留了个悬念：明明让两个线程各加 100 万次，最后却数不到 200 万。我们说那是"竞态"——两个人抢着改同一个数，改丢了。这一讲就来收尾，并且故意踩一个新坑。

学完这一讲，你应该能做到：

- 说清楚**锁（互斥锁）**是干什么的：把"同时进行"变成"排队进行"。
- 知道什么叫**临界区**，以及"加锁 / 解锁"该把哪几行代码包起来。
- 亲手给上一讲的程序加锁，看到结果**稳稳变成 200 万**，每次都一样。
- 亲手跑一个**会死锁**的小程序，看着它卡住不动，体会"互相等待、谁都不放手"是什么感觉。
- 明白锁不是免费的——加得太多太粗，程序会变慢，并发的好处全没了。

<div class="csf-note">这一讲有两段代码要你亲手敲、亲手跑。<strong>请一定自己写、自己运行</strong>，别让 AI 替你贴答案。锁和死锁是那种"看一百遍不如自己卡死一次"的东西——你得亲眼看到屏幕停住、亲手按下 Ctrl+C 终止它，那个直觉才会长在你脑子里。AI 可以在你卡住时解释，但替你跑的话，这一讲就白学了。</div>

## 🛠 跟我做

### 先回顾：上一讲那个"数不准"的程序 <span class="csf-b csf-core">必读</span>

我们先把上一讲的"问题程序"原样请回来。它做的事很简单：一个共享的数 `counter` 从 0 开始，开两个线程，每个线程给它加 100 万次。按理说最后应该是 200 万。

新建一个文件，叫 `race.py`，敲进去（**自己敲，别复制**，敲的过程就是在读代码）：

```python
import threading

counter = 0

def work():
    global counter
    for _ in range(1000000):
        # 故意把"加 1"拆成两步：先读出来，再写回去
        tmp = counter
        counter = tmp + 1

t1 = threading.Thread(target=work)
t2 = threading.Thread(target=work)

t1.start()
t2.start()
t1.join()   # 等线程 1 跑完
t2.join()   # 等线程 2 跑完

print("最后的结果是:", counter)
print("我们期望的是: 2000000")
```

<div class="csf-note">代码里有两个新面孔，先一句话各自交代清楚，免得你卡在这里：<br>1. <code>global counter</code> 的意思是：告诉函数里的代码——我要改的是<strong>外面那个共享的 counter</strong>，不是另造一个新的。没有这行，函数里写 <code>counter = ...</code> 时 Python 会以为你在函数内部新建了一个同名的小变量，外面那个真正的 counter 根本不会变，结果就不对了。所以这行不能删。<br>2. <code>for _ in range(1000000):</code> 里的 <code>_</code> 是一个"我不关心它叫什么"的占位变量。这行的意思就是"这件事重复做一百万次"，至于第几次、计数是多少，我们用不上，所以干脆用下划线 <code>_</code> 来占位——这是约定俗成的"用不到的名字"，不是打错了，也不是什么特殊语法。</div>

<div class="csf-note">这里我把 <code>counter += 1</code> 故意写成了 <code>tmp = counter</code> 再 <code>counter = tmp + 1</code> 两行。为什么？因为这正是上一讲讲过的"读—改—写"三步。把它摊开写，竞态会暴露得更明显、更容易复现。<strong>这不是啰嗦，这是在还原 CPU 真正干的事。</strong></div>

**先猜后做**：运行之前，先在心里押个数——你觉得这次会打印出多少？正好 200 万？还是偏小？大概小多少？把你的猜测写在纸上或者心里默念一遍，再运行：

```bash
python3 race.py
```

我在自己机器上跑出来是这样的（**你的数字几乎肯定和我不一样**，这正是竞态的特征——不可预测）：

```text
最后的结果是: 1374905
我们期望的是: 2000000
```

少了六十多万。多跑几次，每次的数字还都不一样。如果你跑出来正好是 200 万也别惊讶——竞态是"有时候出错"，不是"每次都错"，这种**时对时错**才是它最坑的地方。多跑几次（连续跑五六遍），你大概率会撞见一次明显偏小的。

<details class="csf-fold"><summary>为什么"读—改—写"会丢数？再过一遍<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
想象 counter 现在是 100。线程 1 读到 100，正准备写回 101，结果操作系统在这一瞬间把 CPU 切给了线程 2。线程 2 也读到 100，写回 101。然后切回线程 1，它手里还攥着旧的 100，写回 101。两个线程各加了一次，结果只涨了 1，应该涨 2 的。这一次"加法"就这么蒸发了。一百万次里只要发生几十万次这种"撞车"，结果就少几十万。<strong>根因只有一句话：读、改、写这三步中间，可以被别人插队。</strong>
</details>

### 装上锁：让"同时改"变成"排队改" <span class="csf-b csf-key">重点</span>

问题的根子是：读—改—写这三步会被插队。那解法也很直白——**在这三步外面拉一道门，一次只放一个线程进去，进去的人没出来之前，别人在门口等着。** 这道门，就是**锁**。

把 `race.py` 另存为 `lock.py`，改成下面这样（改动只有三处，我标了注释）：

```python
import threading

counter = 0
lock = threading.Lock()   # 改动 1：造一把锁

def work():
    global counter
    for _ in range(1000000):
        with lock:                 # 改动 2：进门（加锁）
            tmp = counter          #   |
            counter = tmp + 1      #   |  这两行是"临界区"
        # 改动 3：缩进结束 = 出门（自动解锁）

t1 = threading.Thread(target=work)
t2 = threading.Thread(target=work)

t1.start()
t2.start()
t1.join()
t2.join()

print("最后的结果是:", counter)
print("我们期望的是: 2000000")
```

这里有三个新词，先把它们对上号：

- **互斥锁（Lock）**：就是那把锁。"互斥"的意思是"互相排斥"——同一时刻只允许一个线程占着它。
- **加锁 / 解锁**：`with lock:` 这一行就是"加锁"（进门把门锁上）；缩进结束、跳出 `with` 的那一刻就是"解锁"（出门把门打开）。
- **临界区**：被锁包起来的那几行代码（这里就是读和写那两行）。临界区的含义是"这段代码同一时刻只能有一个线程在执行"。

<div class="csf-why"><code>with lock:</code> 是 Python 替你省心的写法：进入这个缩进块时自动加锁，无论是正常跑完还是中途报错，离开时都会自动解锁。<strong>千万别自己 lock.acquire() 之后忘了 lock.release()</strong>——忘了解锁，后面排队的人就永远进不来了。用 with 就不会犯这个错。</div>

**先猜后做**：这回再运行之前先猜——加了锁之后，结果会是多少？还会忽大忽小吗？

```bash
python3 lock.py
```

```text
最后的结果是: 2000000
我们期望的是: 2000000
```

**正好 200 万。** 而且你连跑十次，十次都是 200 万，不再飘了。

这就是锁的全部魔法：它没让加法变快，它只是强制让两个线程**排队**经过那段"读—改—写"。一个进去做完整套、出来，下一个才进去。既然永远不会有人在中间插队，那个会"蒸发的加法"也就不存在了。

<div class="csf-note">把这句话刻进脑子：<strong>锁保护的不是"数据"，是"那段操作数据的代码"。</strong> 你锁住的是临界区（那几行代码），效果是让所有想碰这个数的线程都得排队走这道门。门只有一道，钥匙只有一把，谁拿到钥匙谁进。</div>

### 故意翻车：亲手造一个死锁 <span class="csf-b csf-core">必读</span>

锁这么好用，那是不是到处加锁就万事大吉了？不是。锁用不好，会出一种更吓人的毛病：程序**卡死**，不报错、不退出、就那么僵在原地。这就是**死锁**。

死锁的经典画面是这样的：有两把锁 A 和 B。线程 1 先拿了 A，想再拿 B；线程 2 先拿了 B，想再拿 A。结果——线程 1 攥着 A 等 B，线程 2 攥着 B 等 A，**两个人各占一半、互相等对方先松手，谁都不肯放，于是永远等下去。**

打个生活里的比方：两个人过一条独木桥，一个从东头上，一个从西头上，走到中间面对面了。东边的说"你先退我就过"，西边的也说"你先退我就过"。两人都不退，就这么僵着。这就是死锁。

我们来亲手造一个。新建 `deadlock.py`：

```python
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def task1():
    print("线程1：想拿锁A...")
    with lock_a:
        print("线程1：拿到了锁A，歇口气...")
        time.sleep(0.5)            # 故意停一下，确保线程2也拿到了它的锁
        print("线程1：现在想拿锁B...")
        with lock_b:
            print("线程1：A和B都拿到了！")   # 这行多半永远打印不出来

def task2():
    print("线程2：想拿锁B...")
    with lock_b:
        print("线程2：拿到了锁B，歇口气...")
        time.sleep(0.5)
        print("线程2：现在想拿锁A...")
        with lock_a:
            print("线程2：B和A都拿到了！")   # 这行多半也打印不出来

t1 = threading.Thread(target=task1)
t2 = threading.Thread(target=task2)
t1.start()
t2.start()
t1.join()
t2.join()
print("程序结束")   # 这行你大概率永远等不到
```

注意两个函数拿锁的**顺序是反的**：`task1` 是先 A 后 B，`task2` 是先 B 后 A。这个"顺序不一致"就是死锁的种子。中间那个 `time.sleep(0.5)` 是为了让两个线程都先稳稳拿到自己的第一把锁，把死锁制造得百分百稳定，方便你观察。

**先猜后做**：运行之前先猜——这个程序会打印出几行？最后那句"程序结束"会出现吗？程序会自己停下来吗？

```bash
python3 deadlock.py
```

你会看到类似这样的输出，然后**光标就停在那里，程序再也不动了**：

```text
线程1：想拿锁A...
线程1：拿到了锁A，歇口气...
线程2：想拿锁B...
线程2：拿到了锁B，歇口气...
线程1：现在想拿锁B...
线程2：现在想拿锁A...
```

打印停在这里。没有报错，没有"程序结束"，程序也不退出。它就这么**永远卡住**了——线程 1 攥着 A 等 B，线程 2 攥着 B 等 A。

它不会自己醒过来，你得手动终止它：按 **Ctrl + C**（Mac 也是 Ctrl+C，不是 Command）。

<div class="csf-note">死锁最阴的地方就在这里：<strong>它不报错。</strong> 程序崩溃了你至少能看到一行红字，知道哪儿出事了；死锁是干脆不动，像电脑死机一样安静。你在真实项目里遇到"程序卡住不退出、CPU 占用还很低"，第一个该怀疑的就是死锁。记住这个画面，以后你会用得上。</div>

### 怎么破这个死锁？<span class="csf-b csf-key">重点</span>

死锁看着玄乎，破法却很朴素：**让所有线程都按同一个顺序拿锁。** 比如规定"谁都得先拿 A、再拿 B"，那就永远不会出现"你攥着我要的、我攥着你要的"这种环。

把 `task2` 改成和 `task1` 一样的顺序（先 A 后 B）：

```python
def task2():
    print("线程2：想拿锁A...")
    with lock_a:                       # 改成先拿 A
        print("线程2：拿到了锁A，歇口气...")
        time.sleep(0.5)
        print("线程2：现在想拿锁B...")
        with lock_b:                   # 再拿 B
            print("线程2：A和B都拿到了！")
```

再跑一次：

```bash
python3 deadlock.py
```

这次屏幕上会完整跑完、自己停下来，类似这样（哪个线程先抢到 A 看运气，所以你看到的先后顺序可能和我相反，但一定是"一个全做完、另一个再开始"，而且最后一定有"程序结束"）：

```text
线程1：想拿锁A...
线程1：拿到了锁A，歇口气...
线程2：想拿锁A...
线程1：现在想拿锁B...
线程1：A和B都拿到了！
线程2：拿到了锁A，歇口气...
线程2：现在想拿锁B...
线程2：A和B都拿到了！
程序结束
```

看出区别了吗？这次两个线程都先抢同一把锁 A：线程 1 抢到了 A，线程 2 就只能在门口等；线程 1 把 A、B 都做完、全松手出来，线程 2 才拿到 A 接着往下走。它们老老实实排队，再也不会互相卡住，最后那句"程序结束"也稳稳打印了出来。<strong>关键标志就是：屏幕不再停住，光标回到你手里，能继续敲命令了。</strong>如果你跑出来也是这样、最后有"程序结束"，那就对了。

道理是：既然大家都先抢 A，那同一时刻只有一个线程能拿到 A，拿到 A 的那个才有资格去拿 B——它绝不会被另一个攥着 B 的线程卡住，因为另一个根本还没摸到 A。**环断了，死锁就没了。**

<details class="csf-fold"><summary>想多了解一点：死锁成立的四个条件<span class="csf-b csf-skip">选学</span></summary>
教科书上说，死锁要同时满足四个条件，缺一个就锁不死：<br>
1. <strong>互斥</strong>：资源（锁）一次只能被一个线程占用——这是锁的本性，去不掉。<br>
2. <strong>占有并等待</strong>：一个线程攥着已有的锁，又去等新的锁。<br>
3. <strong>不可抢占</strong>：别人手里的锁，你不能硬抢，只能等他自己放。<br>
4. <strong>循环等待</strong>：线程之间形成一个等待的环（你等我、我等你）。<br>
我们上面"统一加锁顺序"的破法，破的就是第 4 条——把环打断。这是工程上最常用、最实在的招。其它三条要么是锁的天性、要么改起来代价大，初学阶段记住"统一顺序破环"这一招就够用了。
</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**锁是用来干什么的？死锁又是怎么发生的？**

试着这样说：锁是把"同时改一个东西"强行变成"排队改"，一次只放一个进去；而死锁是两个线程各攥着一把锁、又互相等着对方那把，谁也不放手，于是永远卡住。

说不顺没关系，回去把"独木桥对峙"那个画面再想一遍——它基本就把锁和死锁讲全了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：锁加得太粗，并发优势全没了。</strong><br>有人一紧张，把整个函数、甚至整个循环都包进 <code>with lock:</code> 里。结果呢？两个线程虽然没出错，但全程都在排队，等于退化成一个线程在跑，还白白多花了加锁解锁的开销，<strong>反而比不加锁更慢</strong>。锁有性能代价：它强制别人等待，等待就是在浪费时间。<br><strong>原则：临界区越小越好</strong>——只把"真正会冲突的那几行"锁起来，其它能并行的部分留在锁外面。锁是创可贴，贴在伤口上就好，别把整条胳膊缠满。</div>

<div class="csf-note"><strong>翻车二：多把锁的加锁顺序不一致，亲手造出死锁。</strong><br>这正是我们 deadlock.py 干的事：一个先 A 后 B，一个先 B 后 A。代码看着都对，单独跑也没事，凑一起就卡死。<strong>解法：全项目统一一个拿锁顺序</strong>，谁都先 A 再 B。这是最省心的防死锁规则。</div>

<div class="csf-note"><strong>翻车三：该锁的没锁，不该锁的全锁。</strong><br>"该锁的没锁"=竞态（数据改乱），"不该锁的全锁"=慢（白排队）。新手常在这两个极端之间摇摆。<strong>判断标准只有一条：这段代码会不会被多个线程同时碰同一份数据？</strong> 会，就锁；不会，就别锁。只读不改的地方、各管各的局部变量，统统不用锁。</div>

<div class="csf-note"><strong>翻车四：手动 acquire 之后忘了 release。</strong><br>用 <code>lock.acquire()</code> 加锁却忘了 <code>lock.release()</code>，或者中间报错没解到锁，后面排队的线程就永远进不来，看着也像死锁。<strong>解法：优先用 with lock，让它替你自动解锁</strong>，从源头上杜绝忘记。</div>

## ✅ 自检三问

1. 锁保护的到底是"数据"还是"代码"？为什么我们说要锁住的是"临界区"？
2. 上一讲那个数不准的程序，加了锁之后为什么就稳稳是 200 万了？锁在中间挡掉了什么？
3. 两个线程死锁卡住时，程序会报错吗？你怎么从"程序卡住但不报错、CPU 还不高"判断它可能死锁了？怎么破？

（答不上来很正常，回到对应小节再跑一遍代码，比硬背强十倍。）

## 🚀 挑战

给你一个**自己动手**的小任务，别让 AI 代写——它最多在你卡壳时给你讲讲思路。

把今天的 `deadlock.py` 改造成一个"哲学家吃饭"的迷你版：

- 想象有两位"哲学家"（两个线程），中间放着两根筷子（两把锁），每人要**同时拿到两根筷子**才能吃饭（打印一句"我吃到饭了"）。
- 第一步：让哲学家 1 先拿左边筷子、再拿右边；哲学家 2 先拿右边、再拿左边。运行，观察它**死锁卡住**（和今天一样）。
- 第二步：只改加锁顺序，让两位哲学家都"先拿编号小的筷子、再拿编号大的"。运行，确认两人都能吃上饭、程序正常结束。

做完你就亲手验证了"统一加锁顺序能破死锁"这件事。如果想再进一步，可以加到三位哲学家、三根筷子，看看规律还成不成立。

## 📦 复制带走

<div class="csf-card"><strong>这一讲带走这几条就够：</strong><br>1. <strong>锁 = 排队</strong>。把"同时改一个数"强行变成"一次只进一个人"，竞态就消失了——上一讲数不准的程序，加锁后稳稳 200 万。<br>2. <strong>锁住的是代码，不是数据</strong>。被锁包起来的那几行叫"临界区"，临界区越小越好；包太大，并发优势全没、程序变慢。<br>3. <strong>死锁 = 互相等、谁都不放</strong>。两个线程各攥一把锁又互等对方那把，于是永远卡住，而且<strong>不报错</strong>，安静地僵死。<br>4. <strong>破死锁最实在的一招：统一加锁顺序</strong>。所有线程都按同一顺序拿锁，等待的"环"断了，死锁就没了。</div>

下一讲（第10讲《程序怎么"求"操作系统办事：系统调用》），我们换个角度：程序想读文件、想开线程、想申请内存，其实都得"求"操作系统帮忙办——这个"求"的动作叫**系统调用**。我们会看清你写的每一行普通代码，背后到底偷偷喊了操作系统多少次。
