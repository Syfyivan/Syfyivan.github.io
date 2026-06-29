---
title: "《nanoGPT 源码逐行》第04讲 · 训练循环：从一个 batch 到会写字的模型"
date: 2026-06-29 10:05:00
tags: [AI, 深度学习, GPT, Transformer, nanoGPT, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.ng-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.ng-core{color:#fff;background:#b73a2c}
.ng-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.ng-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.ng-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.ng-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.ng-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.ng-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.ng-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.ng-fold[open]{padding-bottom:8px}
.ng-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .ng-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .ng-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .ng-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .ng-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .ng-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .ng-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="ng-key-note"><strong>一句话</strong>：本讲把 <code>train.py</code> 的训练循环拆开——<code>get_batch</code> 喂数据、<code>get_lr</code> 调学习率、<code>configure_optimizers</code> 配优化器、主循环做"前向→反向→更新"。它就是 micrograd 第 04 讲那个训练循环的<strong>工业版</strong>：原理一模一样，只是多了混合精度、梯度累积、学习率调度、梯度裁剪四件"护具"。</div>

micrograd 里我们亲手写了 `backward()`，知道每一个梯度是怎么沿计算图回流的。nanoGPT 站在 PyTorch 的 autograd 之上，`loss.backward()` 一行就把整张图的梯度算好了。所以本讲的重点不是"梯度怎么来的"（那是 micrograd 教的），而是：**一个真 Transformer 要训起来，工业训练循环额外操心了哪些工程问题**。

先记住贯穿全篇的几个超参（节选自 `train.py`）：

```python
gradient_accumulation_steps = 5 * 8 # 模拟更大 batch
batch_size = 12                     # 每个 micro-batch
block_size = 1024
warmup_iters = 2000
lr_decay_iters = 600000
```

`5 * 8 = 40`，即每 40 个 micro-batch 才真正更新一次参数。这个数字后面会反复出现。

---

## 一、get_batch：把磁盘上的 token 流切成 (B, T) 训练对 <span class="ng-b ng-core">必读</span>

```python
def get_batch(split):
    # 每次重建 memmap 避免内存泄漏
    if split == 'train':
        data = np.memmap(os.path.join(data_dir, 'train.bin'), dtype=np.uint16, mode='r')
    else:
        data = np.memmap(os.path.join(data_dir, 'val.bin'), dtype=np.uint16, mode='r')
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([torch.from_numpy((data[i:i+block_size]).astype(np.int64)) for i in ix])
    y = torch.stack([torch.from_numpy((data[i+1:i+1+block_size]).astype(np.int64)) for i in ix])
    x, y = x.to(device), y.to(device)
    return x, y
```

逐行看，重点盯**形状**：

- `data = np.memmap(...)`：把磁盘上的 `train.bin` 映射成一个一维数组 **`(N,)`**，N 是语料里 token 的总数。`memmap` 不会把整个文件读进内存，而是按需把用到的页"换页"进来——所以哪怕语料几十 GB 也能在小内存机器上随机取样。
- `ix = torch.randint(len(data) - block_size, (batch_size,))`：随机抽 `batch_size` 个**起点**，形状 **`(batch_size,)`**。上界 `len(data) - block_size` 是开区间，保证 `i + block_size` 以及后面 `y` 要用的 `i + 1 + block_size` 都不越界。
- `x = torch.stack([... data[i:i+block_size] ...])`：每个起点切出连续 `block_size` 个 token（一条 **`(block_size,)`**），堆叠 `batch_size` 条 → **`(batch_size, block_size)`**，即 `(B, T)`。
- `y` 同理，但切片整体右移一位 `data[i+1 : i+1+block_size]` → 也是 **`(batch_size, block_size)`**。

<div class="ng-key-note"><strong>最关键</strong>：<code>y</code> 就是 <code>x</code> 右移一位。于是 <code>x[b, t]</code> 这个位置要预测的"下一个 token"正好是 <code>y[b, t]</code>。一个 <code>(B, T)</code> 的 batch 一次性提供了 <code>B × T</code> 个"下一个词"监督信号——这就是 GPT 的训练信号来源：next-token prediction。</div>

<div class="ng-card"><strong>x / y 错位示意</strong>（某一条序列）<br/>x: &nbsp;[the,&nbsp; cat,&nbsp; sat,&nbsp; on ]<br/>y: &nbsp;[cat,&nbsp; sat,&nbsp; on,&nbsp;&nbsp; the]<br/>读法：看到 the → 该预测 cat；看到 the cat → 该预测 sat …… 每个位置都是一道"接下一个词"的题。</div>

几个容易被忽略的工程细节：

<div class="ng-why"><strong>为什么用 uint16</strong>：GPT-2 的 BPE 词表是 50257 个 token，小于 2^16=65536，每个 id 用 2 字节存够了——比 int32 省一半磁盘和 IO。读出来后 <code>.astype(np.int64)</code> 转成 int64，是因为 PyTorch 的 embedding 查表和 cross_entropy 的 target 都要求 LongTensor（int64）。</div>

<div class="ng-note"><strong>关键</strong>：注释"每次重建 memmap 避免内存泄漏"——复用同一个 memmap 对象在长训练里会让常驻内存不断累积，每次 <code>get_batch</code> 都重建可让操作系统及时回收页缓存。</div>

<div class="ng-note"><strong>注意</strong>：这里没有"epoch / shuffle"概念。每一步都是从整条语料里<strong>有放回地随机取样</strong>，靠海量随机 batch 覆盖数据，简单又适合超大语料。</div>

---

## 二、get_lr：先线性热身，再余弦退火 <span class="ng-b ng-key">重点</span>

```python
def get_lr(it):
    # 1) 线性 warmup
    if it < warmup_iters:
        return learning_rate * (it + 1) / (warmup_iters + 1)
    # 2) 超过衰减步数，返回最小 lr
    if it > lr_decay_iters:
        return min_lr
    # 3) 中间用 cosine 衰减到 min_lr
    decay_ratio = (it - warmup_iters) / (lr_decay_iters - warmup_iters)
    assert 0 <= decay_ratio <= 1
    coeff = 0.5 * (1.0 + math.cos(math.pi * decay_ratio)) # 0..1
    return min_lr + coeff * (learning_rate - min_lr)
```

输入是当前步数 `it`（标量），输出是这一步该用的学习率（标量）。三段：

- **warmup 段**（`it < warmup_iters`）：`learning_rate * (it+1)/(warmup_iters+1)`，随 `it` 从约 0 **线性升到** `learning_rate`。
- **平台段**（`it > lr_decay_iters`）：训练拖得很久就钉死在 `min_lr`。
- **cosine 段**（中间）：`decay_ratio` 从 0 走到 1；`coeff = 0.5*(1+cos(π·ratio))` 随之从 **1 平滑降到 0**；于是 lr 从 `learning_rate` **余弦衰减到** `min_lr`。

代入几个关键点（只用代码里出现的变量），把曲线钉死：

| `it` | 命中分支 | 返回的 lr |
| --- | --- | --- |
| `0` | warmup | `learning_rate × 1/(warmup_iters+1)` ≈ 0 |
| `warmup_iters-1` | warmup | ≈ `learning_rate` |
| `warmup_iters` | cosine, ratio=0 | `learning_rate`（与 warmup 末端衔接） |
| 中点 | cosine, ratio=0.5 | `min_lr + 0.5×(learning_rate − min_lr)` |
| `lr_decay_iters` | cosine, ratio=1 | `min_lr` |
| `> lr_decay_iters` | 平台 | `min_lr` |

<div class="ng-why"><strong>为什么要 warmup</strong>：刚开始权重是随机的，梯度又大又噪；而 AdamW 的一二阶矩（滑动平均）还没"预热"、估计有偏。这时直接上大 lr 极易把训练带飞。先用很小的 lr 让模型和优化器状态稳下来，再升上去。</div>

<div class="ng-why"><strong>为什么要衰减</strong>：训练后期接近某个低谷，步子太大就会在谷底来回横跳、收不进去。cosine 把 lr 平滑压小，让后期精细收敛——经验上比线性衰减更稳。</div>

<div class="ng-note"><strong>注意</strong>：nanoGPT 没用 <code>torch.optim.lr_scheduler</code>，而是每步手算一个 lr，下面在循环里手动写回 <code>optimizer</code>——更透明，也方便配合梯度累积。</div>

---

## 三、configure_optimizers：该衰减的衰减，不该衰减的放过 <span class="ng-b ng-skim">可跳读</span>

这个函数在 `model.py` 里（本讲不贴它的源码，只讲它干了什么，因为它产出的 `optimizer` 正是下面循环要驱动的对象）。它做了一件很"讲究"的事：**把参数按维度分成两组**。

| 参数类型 | 维度 | 是否 weight decay |
| --- | --- | --- |
| 权重矩阵（Linear 的 weight、embedding 表） | `dim() >= 2` | **做**（如 0.1） |
| bias、LayerNorm 的 weight/bias | `dim() < 2` | **不做**（0.0） |

然后把这两组（带不同的 `weight_decay`）一起交给 `torch.optim.AdamW`，能用 fused 内核就用（CUDA 上更快）。

<div class="ng-why"><strong>为什么按 2D / 1D 分</strong>：weight decay 本质是把权重往 0 拉的正则，对大块权重矩阵有意义；但 bias 和 LayerNorm 的 scale/shift 是 1D 的"校准"参数，把它们往 0 拉只会帮倒忙。"2D 衰减、1D 放过"是 Transformer 训练里的常见手法。</div>

<div class="ng-note"><strong>关键</strong>：用的是 <strong>AdamW</strong> 而不是 Adam——AdamW 把 weight decay 从梯度更新里<strong>解耦</strong>出来、直接作用在权重上，这才是 Adam 系做权重衰减的正确姿势。</div>

---

## 四、训练循环：一步到底 <span class="ng-b ng-core">必读</span>

```python
# ===== 训练循环 =====
X, Y = get_batch('train') # 取第一个 batch
while True:
    # 设置本轮 lr
    lr = get_lr(iter_num) if decay_lr else learning_rate
    for param_group in optimizer.param_groups:
        param_group['lr'] = lr

    # 定期 eval + 存 checkpoint
    if iter_num % eval_interval == 0 and master_process:
        losses = estimate_loss()
        if losses['val'] < best_val_loss or always_save_checkpoint:
            best_val_loss = losses['val']
            checkpoint = {'model': raw_model.state_dict(), 'optimizer': optimizer.state_dict(), ...}
            torch.save(checkpoint, os.path.join(out_dir, 'ckpt.pt'))

    # 前向 + 反向 + 更新，带梯度累积
    for micro_step in range(gradient_accumulation_steps):
        with ctx:
            logits, loss = model(X, Y)
            loss = loss / gradient_accumulation_steps # 缩放损失以匹配梯度累积
        X, Y = get_batch('train')           # 异步预取下一个 batch
        scaler.scale(loss).backward()       # 反向（fp16 时带梯度缩放）
    # 梯度裁剪
    if grad_clip != 0.0:
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
    # 优化器 step
    scaler.step(optimizer)
    scaler.update()
    optimizer.zero_grad(set_to_none=True)   # 清梯度
    iter_num += 1
```

一段段拆：

**① 循环前先取第一个 batch**　`X, Y = get_batch('train')`，形状各 `(B, T)`。注意它在 `while` **之外**——循环里采用"先用当前 batch、再预取下一个"的节奏。

**② 设置本轮 lr**　`lr = get_lr(iter_num)`，再用 `for param_group in optimizer.param_groups: param_group['lr'] = lr` 手动写回。PyTorch 优化器是从 `param_groups['lr']` 读学习率的，所以调度就是"每步改这个字段"。

**③ 定期 eval + 存 checkpoint**　每隔 `eval_interval` 步、且只在 `master_process` 上执行：

<div class="ng-note"><strong>关键</strong>：<code>master_process</code> 是多卡（DDP）下的 0 号进程标记——评估、打日志、写 checkpoint 只让它做一份，避免多卡重复算、抢着写同一个文件。</div>

`estimate_loss()`（定义在别处）会切到 eval 模式、在 `no_grad` 下对 train/val 各跑若干 batch 求平均 loss，返回一个 dict。val 更好（或开了 `always_save_checkpoint`）就把 **模型权重 + 优化器状态（Adam 的动量）+ iter_num/best_val_loss 等**（代码里的 `...`）打包 `torch.save` 到 `ckpt.pt`——存优化器状态是为了能<strong>精确续训</strong>。

**④ 梯度累积内层循环**　`for micro_step in range(gradient_accumulation_steps)`：

- `with ctx:`：`ctx` 是别处建好的 autocast 上下文（混合精度），让里面的算子在 bf16/fp16 下跑、该用 fp32 的地方自动用 fp32。
- `logits, loss = model(X, Y)`：前向。给了 target，模型返回所有位置的 `logits` **`(B, T, vocab_size)`** 和一个**标量** `loss`（这一 micro-batch 上 `B×T` 个位置的平均交叉熵）。
- `loss = loss / gradient_accumulation_steps`：把损失除以 40。
- `X, Y = get_batch('train')`：**立刻预取下一个 micro-batch**，覆盖 `X, Y`。在 GPU 忙着算上一步前向/反向时，CPU 可以并行把下一批数据准备好（异步预取）。
- `scaler.scale(loss).backward()`：反传，梯度<strong>累加</strong>进各参数的 `.grad`（注意循环里没清梯度，所以 40 次的梯度是叠加的）。

<div class="ng-why"><strong>为什么 loss 要除以 40</strong>：40 个 micro-batch 的梯度会累加，不除的话总梯度是单个 batch 的 40 倍。每个 loss 先除以 40，累加后正好等于"整个大 batch 上的平均梯度"——等价于一次性喂进 40 倍数据。这就是<strong>梯度累积</strong>：用 12 的小 batch 模拟一个大 batch，省显存。</div>

<div class="ng-card"><strong>一次 optimizer.step() 实际吃掉多少数据？</strong><br/>序列数 = gradient_accumulation_steps × batch_size = 40 × 12 = 480 条<br/>token 数 = 480 × block_size = 480 × 1024 = 491,520 个 token<br/>多卡(DDP)时再 × world_size。即"用 12 的小 batch 模拟约 480 的大 batch"。</div>

<div class="ng-why"><strong>为什么要 scaler（GradScaler）</strong>：fp16 能表示的范围窄，很小的梯度会下溢成 0。scaler 在 backward 前把 loss 乘上一个大因子 S，梯度同步放大 S 倍、落进 fp16 能表示的范围；step 前再除回去。它还会检查梯度有没有 inf/nan（溢出），有就跳过这步更新。bf16 因为指数范围和 fp32 一样大，其实不太需要 scaler，但代码路径统一这么写。</div>

**⑤ 梯度裁剪**　`if grad_clip != 0.0:` 先 `scaler.unscale_(optimizer)`，再 `clip_grad_norm_(model.parameters(), grad_clip)`。

<div class="ng-why"><strong>为什么裁剪前要先 unscale_</strong>：此刻 .grad 还被 scaler 放大了 S 倍。裁剪是拿"真实梯度范数"和 grad_clip（如 1.0）比的，不先 unscale，算出的范数会大 S 倍，阈值就完全错了。<code>unscale_</code> 把梯度除回 S，<code>clip_grad_norm_</code> 再把全局梯度范数压到不超过 grad_clip，防止偶发的超大梯度把训练一步带崩。</div>

**⑥ 真正更新参数**

- `scaler.step(optimizer)`：检查梯度无 inf/nan 后，让 AdamW 走一步更新。
- `scaler.update()`：自适应调整下一轮的缩放因子 S。
- `optimizer.zero_grad(set_to_none=True)`：清空梯度，为下一个累积周期做准备。

<div class="ng-note"><strong>关键</strong>：<code>set_to_none=True</code> 是把 <code>.grad</code> 置为 <code>None</code> 而不是写一堆 0——省显存、也略快，是官方推荐的默认做法。</div>

---

## 关键点：这就是 micrograd 04 那个循环，穿上了护具 <span class="ng-b ng-key">重点</span>

把本讲和 micrograd 第 04 讲的训练循环并排看，骨架完全一致：

| 步骤 | micrograd 第 04 讲 | nanoGPT `train.py` |
| --- | --- | --- |
| 取数据 | 手搓小数据 | `get_batch` 从 `.bin` memmap 随机取 `(B, T)` |
| 前向 | 手写 MLP 调用 | `logits, loss = model(X, Y)` |
| 算梯度 | `loss.backward()`（手写 autograd） | `scaler.scale(loss).backward()`（PyTorch autograd） |
| 防爆梯度 | 无 | `clip_grad_norm_` |
| 更新参数 | 手写 `p.data -= lr * p.grad` | `scaler.step(optimizer)`（AdamW） |
| 清梯度 | 手写 `p.grad = 0` | `optimizer.zero_grad(set_to_none=True)` |
| 学习率 | 固定 | `get_lr` 调度（warmup + cosine） |
| 省显存/提速 | 无 | 梯度累积 + 混合精度(scaler) |

<div class="ng-key-note"><strong>记住这句</strong>：原理零变化——还是"前向→loss→backward→更新→清梯度"。nanoGPT 多出来的全是工程护具：<strong>混合精度</strong>（省显存提速）、<strong>梯度累积</strong>（小卡模拟大 batch）、<strong>lr 调度</strong>（warmup+cosine 稳收敛）、<strong>梯度裁剪</strong>（防训练崩）。把这四件事剥掉，剩下的就是你在 micrograd 里亲手写过的那个循环。</div>

---

<details class="ng-fold"><summary>自测：三道题检查你真的读懂了 <span class="ng-b ng-skim">可跳读</span></summary>

**Q1．`get_batch` 里 `y` 为什么是 `x` 右移一位？这对应模型在学什么？**

`y[b, t]` 正好是 `x[b, t]` 的下一个 token。模型学的是"给定前面的 token，预测下一个 token"（next-token prediction）。一个 `(B, T)` 的 batch 一次性给出了 `B × T` 个监督信号——每个位置都是一道"接下一个词"的题。

**Q2．`gradient_accumulation_steps=40`、`batch_size=12`、`block_size=1024`，单卡一次 `optimizer.step()` 实际用了多少 token？为什么 loss 要除以 40？**

`40 × 12 × 1024 = 491,520` 个 token。除以 40 是因为这 40 个 micro-batch 的梯度会累加；不除的话梯度幅度是单 batch 的 40 倍。每个 loss 先除以 40，累加结果就等于整个大 batch 上的平均梯度，等价于一次性喂进约 49 万 token——这就是梯度累积"用小 batch 模拟大 batch"的原理。

**Q3．为什么 `clip_grad_norm_` 之前要先 `scaler.unscale_(optimizer)`？**

fp16 训练时 scaler 把 loss 乘了一个大因子 S，反传得到的梯度也被放大了 S 倍。裁剪是按"真实梯度范数"和 `grad_clip` 比较的；不先 unscale，算出来的范数会大 S 倍，裁剪阈值就完全失真了。`unscale_` 先把梯度除回 S，再裁剪才正确。

</details>

---

## 小结 / 下一讲预告

本讲我们把 `train.py` 的训练循环从头走了一遍：`get_batch` 把磁盘 token 流随机切成 `(B, T)` 的"输入 / 右移一位的目标"对，`get_lr` 用 warmup+cosine 控制步长，`configure_optimizers` 给 2D 权重加 weight decay、放过 1D 参数后交给 AdamW，主循环则在"前向→反向→更新"的老骨架上套了混合精度、梯度累积、梯度裁剪三层护具。**把护具拆掉，它就是 micrograd 第 04 讲那个循环。**

到这里，一个会写字的模型已经被"训"出来了——权重存进了 `ckpt.pt`。**下一讲**：`sample.py` / `model.generate`——加载训练好的权重，让模型自回归地一个 token 一个 token 把句子写下去，顺便讲清 `temperature` 和 `top-k` 这两个采样旋钮到底在调什么。
