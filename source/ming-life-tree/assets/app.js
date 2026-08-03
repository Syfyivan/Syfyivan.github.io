/* 明代人生选择图谱 · 交互引擎
 * 基于 ECharts graph 系列（其底层渲染引擎即 zrender），layout:'none' 分层 DAG + 回环。
 * 功能：平移缩放 / 五路+交汇着色 / 点击节点做选择 / 条件门槛解锁 / 实时三币种·属性结算 /
 *       走过路径高亮 / 死亡后递归生成下一代重开。
 */
(function () {
  var D = window.LIFE_TREE;

  // ── 主题色（从 CSS 变量取，避免硬编码）──────────────────
  var css = getComputedStyle(document.documentElement);
  function v(name, fb) { var x = css.getPropertyValue(name).trim(); return x || fb; }
  var C = {
    bg: v('--bg', '#241a12'),
    ink: v('--ink', '#f2e7d5'),
    muted: v('--muted', '#a9967c'),
    rule: v('--rule', '#4a3a2a'),
    p0: v('--c0', '#d9c7a3'),
    p1: v('--c1', '#8bbf6a'),
    p2: v('--c2', '#e0a44e'),
    p3: v('--c3', '#5fb0c9'),
    p4: v('--c4', '#d98040'),
    p5: v('--c5', '#b98cd6'),
    p6: v('--c6', '#c96a6a')
  };
  var catColors = [C.p0, C.p1, C.p2, C.p3, C.p4, C.p5, C.p6];

  // ── 玩家状态（属性）──────────────────────────────────
  var ATTRS = ['学识', '体魄', '家族', '白银', '铜钱', '存米'];
  var state, visited, generation, atNode;

  function initState() {
    state = { 年龄: 16, 学识: 20, 体魄: 90, 家族: 60, 身份: '民籍·白身', 白银: 0, 铜钱: 0, 存米: 0, 功名: '无' };
    visited = ['start'];
    atNode = 'start';
    if (generation == null) generation = 1;
  }

  var nodeById = {};
  D.nodes.forEach(function (nd) { nodeById[nd.id] = nd; });
  // 邻接表：从某节点出发的选择边
  var outLinks = {};
  D.links.forEach(function (lk) { (outLinks[lk.source] = outLinks[lk.source] || []).push(lk); });

  // ── 条件判定 ─────────────────────────────────────────
  function meetCond(cond) {
    if (!cond) return { ok: true, miss: [] };
    var miss = [];
    Object.keys(cond).forEach(function (k) {
      if ((state[k] == null ? 0 : state[k]) < cond[k]) miss.push(k + '≥' + cond[k]);
    });
    return { ok: miss.length === 0, miss: miss };
  }

  // ── 到达某节点后的结算 ───────────────────────────────
  function applyArrive(nd) {
    var a = nd.arrive; if (!a) return;
    if (a.set) Object.keys(a.set).forEach(function (k) { state[k] = a.set[k]; });
    if (a.add) Object.keys(a.add).forEach(function (k) { state[k] = (state[k] || 0) + a.add[k]; });
    if (a.setStatus) state.功名 = a.setStatus;
    // 属性夹在 0-100（年龄/身份/白银/存米不夹）
    ['学识', '体魄', '家族'].forEach(function (k) {
      if (state[k] < 0) state[k] = 0; if (state[k] > 100) state[k] = 100;
    });
  }

  // ── ECharts 实例 ─────────────────────────────────────
  var chart = echarts.init(document.getElementById('graph'), null, { renderer: 'canvas' });

  function buildData() {
    var edgeSet = {};
    visited.forEach(function (id, i) { if (i) edgeSet[visited[i - 1] + '>' + id] = true; });

    var enData = D.nodes.map(function (nd) {
      var isCur = nd.id === atNode;
      var isVisited = visited.indexOf(nd.id) >= 0;
      var col = catColors[nd.category];
      return {
        id: nd.id, name: nd.name, x: nd.x, y: nd.y, category: nd.category,
        symbolSize: isCur ? 30 : (nd.category === 6 || nd.category === 0 ? 22 : 18),
        itemStyle: {
          color: isVisited ? col : C.bg,
          borderColor: col,
          borderWidth: isCur ? 4 : 2,
          shadowBlur: isCur ? 20 : 0, shadowColor: col
        },
        label: {
          color: isVisited ? C.ink : C.muted,
          fontWeight: isCur ? 'bold' : 'normal'
        }
      };
    });

    var lkData = D.links.map(function (lk) {
      var walked = edgeSet[lk.source + '>' + lk.target];
      var reachable = lk.source === atNode; // 当前可选
      var cnd = meetCond(lk.cond);
      var col = catColors[lk.category];
      return {
        source: lk.source, target: lk.target,
        label: { show: reachable, formatter: lk.label + (lk.cond && !cnd.ok ? ' 🔒' : '') },
        lineStyle: {
          color: walked ? col : (reachable ? (cnd.ok ? col : C.muted) : C.rule),
          width: walked ? 4 : (reachable ? 2.5 : 1),
          opacity: walked ? 0.95 : (reachable ? 0.9 : 0.28),
          type: reachable && !cnd.ok ? 'dashed' : 'solid',
          curveness: curveOf(lk)
        }
      };
    });
    return { nodes: enData, links: lkData };
  }

  // 交汇/回环边给一点弧度，避免重叠
  function curveOf(lk) {
    if (lk.category === 6) return 0.2;
    if (lk.target === 'start') return -0.3;
    return 0;
  }

  function render() {
    var d = buildData();
    chart.setOption({
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        confine: true, backgroundColor: 'rgba(30,22,15,0.95)', borderColor: C.rule,
        textStyle: { color: C.ink },
        formatter: function (p) {
          if (p.dataType === 'node') {
            var nd = nodeById[p.data.id];
            return '<b style="color:' + catColors[nd.category] + '">' + nd.name + '</b><br/>' +
              '<span style="color:' + C.muted + '">' + nd.stage + '</span>';
          }
          return '';
        }
      },
      legend: [{
        data: D.categories.map(function (c) { return c.name; }),
        textStyle: { color: C.muted }, top: 8, left: 8, orient: 'horizontal',
        itemWidth: 14, itemHeight: 10, itemGap: 12
      }],
      series: [{
        type: 'graph', layout: 'none', roam: true, zoom: 0.85,
        focusNodeAdjacency: false,
        categories: D.categories.map(function (c, i) { return { name: c.name, itemStyle: { color: catColors[i] } }; }),
        label: { show: true, position: 'bottom', fontSize: 11, fontFamily: 'inherit' },
        edgeSymbol: ['none', 'arrow'], edgeSymbolSize: 7,
        edgeLabel: { fontSize: 10, color: C.ink, backgroundColor: 'rgba(30,22,15,0.75)', padding: [2, 4], borderRadius: 3 },
        data: d.nodes, links: d.links,
        lineStyle: { curveness: 0 }
      }]
    });
  }

  // ── 侧栏渲染 ─────────────────────────────────────────
  function bar(k) {
    var val = Math.max(0, Math.min(100, state[k] || 0));
    var color = k === '学识' ? C.p5 : k === '体魄' ? C.p1 : C.p4;
    return '<div class="attr"><span class="attr-k">' + k + '</span>' +
      '<span class="attr-bar"><i style="width:' + val + '%;background:' + color + '"></i></span>' +
      '<span class="attr-v">' + (state[k] || 0) + '</span></div>';
  }

  function renderPanel() {
    var nd = nodeById[atNode];
    var h = '';
    h += '<div class="gen">第 ' + generation + ' 代 · 陈家次子</div>';
    h += '<div class="stat-row"><span>年龄 <b>' + state.年龄 + '</b></span>' +
      '<span>身份 <b>' + state.身份 + '</b></span>' +
      '<span>功名 <b>' + state.功名 + '</b></span></div>';
    h += ATTRS.filter(function (k) { return ['学识', '体魄', '家族'].indexOf(k) >= 0; }).map(bar).join('');
    h += '<div class="coin"><span>白银 <b>' + state.白银 + '</b> 两</span>' +
      '<span>铜钱 <b>' + state.铜钱 + '</b> 文</span>' +
      '<span>存米 <b>' + state.存米 + '</b> 石</span></div>';

    h += '<hr/><div class="node-title" style="color:' + catColors[nd.category] + '">' + nd.name + '</div>';
    h += '<div class="node-stage">' + nd.stage + '</div>';
    h += '<div class="node-desc">' + nd.desc + '</div>';
    if (nd.arrive && nd.arrive.note) h += '<div class="node-note">守恒/说明：' + nd.arrive.note + '</div>';

    // 可选择项
    var outs = outLinks[atNode] || [];
    h += '<div class="choices-title">可做的选择</div>';
    if (!outs.length) {
      h += '<div class="dead">此处已是终点。</div>';
    } else {
      h += '<div class="choices">';
      outs.forEach(function (lk) {
        var cnd = meetCond(lk.cond);
        var tgt = nodeById[lk.target];
        var condTxt = lk.cond ? Object.keys(lk.cond).map(function (k) { return k + '≥' + lk.cond[k]; }).join('、') : '';
        h += '<button class="choice ' + (cnd.ok ? '' : 'locked') + '" data-t="' + lk.target + '"' +
          (cnd.ok ? '' : ' disabled') + ' style="border-color:' + catColors[lk.category] + '">' +
          '<span class="c-label">' + lk.label + (cnd.ok ? '' : ' 🔒') + '</span>' +
          '<span class="c-to">→ ' + tgt.name + '</span>' +
          (condTxt ? '<span class="c-cond">条件：' + condTxt + (cnd.ok ? ' ✓' : '（缺 ' + cnd.miss.join('、') + '）') + '</span>' : '') +
          (lk.note ? '<span class="c-note">' + lk.note + '</span>' : '') +
          '</button>';
      });
      h += '</div>';
    }
    document.getElementById('panel').innerHTML = h;

    // 绑定选择
    Array.prototype.forEach.call(document.querySelectorAll('.choice:not(.locked)'), function (btn) {
      btn.addEventListener('click', function () { choose(btn.getAttribute('data-t')); });
    });
  }

  // ── 做选择 ───────────────────────────────────────────
  function choose(targetId) {
    var nd = nodeById[targetId];
    if (targetId === 'start') { // 递归下一代重开
      generation += 1;
      var carry = { 白银: state.白银, 存米: state.存米, 家族: state.家族 }; // 起点由上一代真实结余决定（简化承接）
      initStateKeepGen();
      state.白银 = Math.max(0, carry.白银);
      state.存米 = Math.max(0, carry.存米);
      state.家族 = Math.max(20, Math.min(80, carry.家族));
      render(); renderPanel(); focusNode('start'); return;
    }
    atNode = targetId;
    visited.push(targetId);
    applyArrive(nd);
    render(); renderPanel(); focusNode(targetId);
  }

  function initStateKeepGen() { var g = generation; generation = g; initState(); }

  function focusNode(id) {
    var nd = nodeById[id];
    // 让 ECharts 视图大致居中到该节点（通过 dispatch highlight）
    chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataType: 'node', name: nd.name });
    setTimeout(function () { chart.dispatchAction({ type: 'downplay', seriesIndex: 0 }); }, 600);
  }

  // 点击图上节点：若是当前节点的可达目标则等同于做选择，否则仅查看
  chart.on('click', function (p) {
    if (p.dataType !== 'node') return;
    var outs = outLinks[atNode] || [];
    var hit = outs.filter(function (lk) { return lk.target === p.data.id; })[0];
    if (hit) {
      var cnd = meetCond(hit.cond);
      if (cnd.ok) { choose(hit.target); return; }
    }
    // 仅查看：把面板节点信息切到该节点（不改变 atNode / 状态）
    previewNode(p.data.id);
  });

  function previewNode(id) {
    var nd = nodeById[id];
    var box = document.getElementById('preview');
    box.style.display = 'block';
    box.innerHTML = '<div class="pv-title" style="color:' + catColors[nd.category] + '">🔍 ' + nd.name + '</div>' +
      '<div class="node-stage">' + nd.stage + '</div>' +
      '<div class="node-desc">' + nd.desc + '</div>' +
      (nd.arrive && nd.arrive.note ? '<div class="node-note">守恒/说明：' + nd.arrive.note + '</div>' : '') +
      '<button id="pv-close">关闭预览</button>';
    document.getElementById('pv-close').addEventListener('click', function () { box.style.display = 'none'; });
  }

  // ── 控件 ─────────────────────────────────────────────
  document.getElementById('btn-restart').addEventListener('click', function () {
    generation = 1; initState(); render(); renderPanel();
  });
  document.getElementById('btn-fit').addEventListener('click', function () {
    chart.setOption({ series: [{ zoom: 0.85, center: null }] }); render();
  });

  window.addEventListener('resize', function () { chart.resize(); });

  // ── 启动 ─────────────────────────────────────────────
  initState();
  render();
  renderPanel();
})();
