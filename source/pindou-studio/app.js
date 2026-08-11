(() => {
  'use strict';

  const LEGACY_PORTRAIT_PALETTE = [
    { code: 'H7', name: '黑色', hex: '#000000' },
    { code: 'C18', name: '深蓝黑', hex: '#1C3344' },
    { code: 'H16', name: '深咖啡', hex: '#3B2F23' },
    { code: 'G8', name: '深棕', hex: '#592A21' },
    { code: 'M12', name: '暗豆沙', hex: '#644749' },
    { code: 'M8', name: '豆沙粉', hex: '#B38281' },
    { code: 'F9', name: '珊瑚粉', hex: '#E2677A' },
    { code: 'F17', name: '肤色阴影', hex: '#F79B71' },
    { code: 'G2', name: '肤色', hex: '#FFCAAA' },
    { code: 'G4', name: '奶咖阴影', hex: '#E1B383' },
    { code: 'G16', name: '奶咖色', hex: '#F2D9BA' },
    { code: 'G1', name: '浅肤色', hex: '#FFE2CE' },
    { code: 'H2', name: '白色', hex: '#FFFFFF' },
  ];
  const MARD_PALETTE = (Array.isArray(window.Mard221Palette) && window.Mard221Palette.length === 221
    ? window.Mard221Palette
    : LEGACY_PORTRAIT_PALETTE)
    .map((color) => ({ ...color, rgb: hexToRgb(color.hex) }));
  const PORTRAIT_CODES = new Set(LEGACY_PORTRAIT_PALETTE.map((color) => color.code));
  const PORTRAIT_PALETTE = MARD_PALETTE.filter((color) => PORTRAIT_CODES.has(color.code));
  const GRID_OPTIONS = [60, 80, 100, 120];
  const COMPLEXITY_COPY = [
    '轻量版：豆子少，适合物品和单人头像，合照五官可能不够清楚。',
    '清晰基础版：适合两人或轮廓简单的三人合照。',
    '平衡版：脸部较清楚，工作量仍低于小王子示例。',
    '细节版：优先保住多人五官，豆子数量也会明显增加。',
  ];
  const OUTLINE_COPY = ['柔和', '适中', '清晰'];

  const state = {
    image: null,
    fileName: 'pindou-pattern',
    sourceCanvas: document.createElement('canvas'),
    cartoonCanvas: document.createElement('canvas'),
    cells: [],
    grid: 100,
    palette: PORTRAIT_PALETTE,
    view: 'preview',
    tool: 'pen',
    selectedCode: 'H7',
    undoStack: [],
    analysis: null,
    busy: false,
  };

  const els = {
    input: byId('photo-input'),
    uploadZone: byId('upload-zone'),
    uploadTitle: byId('upload-title'),
    uploadCopy: byId('upload-copy'),
    gridSize: byId('grid-size'),
    gridOutput: byId('grid-output'),
    complexityHint: byId('complexity-hint'),
    outline: byId('outline-strength'),
    outlineOutput: byId('outline-output'),
    background: byId('background-mode'),
    paletteMode: byId('palette-mode'),
    connect: byId('connect-toggle'),
    smooth: byId('smooth-toggle'),
    skinClean: byId('skin-clean-toggle'),
    generate: byId('generate-button'),
    status: byId('status-message'),
    canvas: byId('preview-canvas'),
    canvasShell: byId('canvas-shell'),
    emptyState: byId('empty-state'),
    zoom: byId('zoom-button'),
    editor: byId('editor-panel'),
    paletteRow: byId('palette-row'),
    editorTip: byId('editor-tip'),
    undo: byId('undo-button'),
    statGrid: byId('stat-grid'),
    statBeads: byId('stat-beads'),
    statColors: byId('stat-colors'),
    statComponents: byId('stat-components'),
    downloadPreview: byId('download-preview'),
    downloadChart: byId('download-chart'),
    downloadGrid: byId('download-grid'),
    downloadCounts: byId('download-counts'),
  };

  setup();

  function setup() {
    renderPalette();
    bindUpload();
    bindControls();
    bindEditor();
    updateRangeLabels();
    renderEmptyBoard();
  }

  function bindUpload() {
    els.input.addEventListener('change', () => {
      if (els.input.files && els.input.files[0]) loadFile(els.input.files[0]);
    });
    els.uploadZone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        els.input.click();
      }
    });
    for (const type of ['dragenter', 'dragover']) {
      els.uploadZone.addEventListener(type, (event) => {
        event.preventDefault();
        els.uploadZone.classList.add('dragging');
      });
    }
    for (const type of ['dragleave', 'drop']) {
      els.uploadZone.addEventListener(type, (event) => {
        event.preventDefault();
        els.uploadZone.classList.remove('dragging');
      });
    }
    els.uploadZone.addEventListener('drop', (event) => {
      const file = [...event.dataTransfer.files].find((item) => item.type.startsWith('image/'));
      if (file) loadFile(file);
    });
  }

  function bindControls() {
    els.gridSize.addEventListener('input', updateRangeLabels);
    els.outline.addEventListener('input', updateRangeLabels);
    els.generate.addEventListener('click', generatePattern);
    document.querySelectorAll('input[name="route"]').forEach((input) => {
      input.addEventListener('change', () => {
        document.querySelectorAll('.route-option').forEach((label) => label.classList.toggle('active', label.contains(input) && input.checked));
        if (state.image) generatePattern();
      });
    });
    for (const element of [els.background, els.paletteMode, els.connect, els.smooth, els.skinClean]) {
      element.addEventListener('change', () => {
        if (state.image) generatePattern();
      });
    }
    els.zoom.addEventListener('click', () => {
      const zoomed = els.canvasShell.classList.toggle('zoomed');
      els.zoom.setAttribute('aria-pressed', String(zoomed));
      els.zoom.textContent = zoomed ? '适应窗口' : '放大编辑';
    });
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
    els.downloadPreview.addEventListener('click', exportPreview);
    els.downloadChart.addEventListener('click', exportChart);
    els.downloadGrid.addEventListener('click', exportGridCsv);
    els.downloadCounts.addEventListener('click', exportCountsCsv);
  }

  function bindEditor() {
    document.querySelectorAll('[data-tool]').forEach((button) => {
      button.addEventListener('click', () => {
        state.tool = button.dataset.tool;
        document.querySelectorAll('[data-tool]').forEach((item) => item.classList.toggle('active', item === button));
        const tips = {
          pen: '画笔会使用下面选中的 MARD 色号。',
          erase: '橡皮会移除豆子；注意不要把头像之间的连接擦断。',
          'oval-eye': '点击眼睛中心，放置完整的 2×4 黑色小椭圆。',
          'anime-eye': '点击眼睛中心，放置完整的 4×5 黑色动漫大眼，并保留一颗白色高光。',
          'closed-eye': '点击眼睛中心，放置一条完整的弯曲闭眼。',
          smile: '点击嘴部中心，放置闭嘴微笑。',
          kiss: '点击嘴部中心，放置小型亲嘴表情。',
          glasses: '点击鼻梁中心，放置两圈边对边连续的白色眼镜。',
        };
        els.editorTip.textContent = tips[state.tool];
        if (!['source', 'cartoon'].includes(state.view)) setView('chart');
      });
    });
    els.canvas.addEventListener('pointerdown', editAtPointer);
    els.undo.addEventListener('click', undoEdit);
  }

  async function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      setStatus('请选择 JPG、PNG 或 WebP 图片。', true);
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      await image.decode();
      state.image = image;
      state.fileName = safeFileName(file.name.replace(/\.[^.]+$/, '')) || 'pindou-pattern';
      els.uploadTitle.textContent = file.name;
      els.uploadCopy.textContent = `${image.naturalWidth} × ${image.naturalHeight} · 点击可重新选择`;
      els.generate.disabled = false;
      els.generate.textContent = '重新生成图纸';
      els.canvasShell.classList.remove('empty');
      setStatus('照片读取完成，正在生成第一版…');
      await generatePattern();
    } catch (error) {
      console.error(error);
      setStatus('这张图片没有读取成功，请换一张或先另存为 JPG。', true);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function generatePattern() {
    if (!state.image || state.busy) return;
    state.busy = true;
    els.generate.disabled = true;
    els.generate.textContent = '正在整理轮廓…';
    setStatus('先简化颜色与轮廓，再映射 MARD 色号。');
    await nextFrame();
    try {
      const route = checkedValue('route');
      const outlineStrength = Number(els.outline.value);
      state.grid = GRID_OPTIONS[Number(els.gridSize.value)];
      drawSourceCanvas();
      drawCartoonCanvas(outlineStrength);
      const inputCanvas = route === 'cartoon' ? state.cartoonCanvas : state.sourceCanvas;
      const paletteMode = els.paletteMode.value;
      if (paletteMode === 'portrait13') {
        state.palette = PORTRAIT_PALETTE;
      } else {
        const samples = collectColorSamples(inputCanvas, state.grid, els.background.value, route);
        state.palette = window.PindouPatternUtils.selectAdaptivePalette(samples, MARD_PALETTE, Number(paletteMode));
        if (!state.palette.length) state.palette = PORTRAIT_PALETTE;
      }
      state.cells = quantizeToPattern(inputCanvas, state.grid, state.palette, els.background.value);
      if (els.smooth.checked) smoothConcaveContours(state.cells);
      const skinCleanup = els.skinClean.checked
        ? window.PindouPatternUtils.cleanSkinToneNoise(state.cells, colorByCode)
        : { replaced: 0, components: 0 };
      cleanTinyComponents(state.cells);
      if (els.connect.checked) connectPattern(state.cells);
      state.undoStack = [];
      refreshAnalysis();
      renderPalette();
      setView('preview');
      setReady(true);
      const connectedCopy = state.analysis.components === 1 ? '已经连成一整片' : `仍有 ${state.analysis.components} 个连通块`;
      const cleanupCopy = skinCleanup.replaced
        ? `已合并 ${skinCleanup.replaced} 格零碎肤色阴影，`
        : '';
      const colorCopy = paletteMode === 'portrait13'
        ? '使用旧版人像 13 色限制'
        : `已从 221 色库自动挑选最多 ${paletteMode} 色`;
      const routeCopy = route === 'direct' && state.grid < 100
        ? ' 照片直转的低格数不适合多人脸；合照请切到“卡通化后转图纸”并用 100 格以上。'
        : '';
      setStatus(`完成：${state.analysis.total.toLocaleString('zh-CN')} 颗豆，${colorCopy}，${cleanupCopy}${connectedCopy}。${routeCopy || '建议放大检查五官。'}`);
    } catch (error) {
      console.error(error);
      setStatus('生成时遇到问题，请换一张尺寸更小的图片再试。', true);
    } finally {
      state.busy = false;
      els.generate.disabled = false;
      els.generate.textContent = '重新生成图纸';
    }
  }

  function drawSourceCanvas() {
    const size = 512;
    const canvas = state.sourceCanvas;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#f7f3ec';
    ctx.fillRect(0, 0, size, size);
    drawImageContain(ctx, state.image, size, size);
  }

  function drawCartoonCanvas(strength) {
    const size = state.sourceCanvas.width;
    const canvas = state.cartoonCanvas;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.filter = `blur(${[0.45, 0.8, 1.1][strength]}px) saturate(${[1.06, 1.14, 1.2][strength]}) contrast(1.04)`;
    ctx.drawImage(state.sourceCanvas, 0, 0);
    ctx.filter = 'none';
    const image = ctx.getImageData(0, 0, size, size);
    const source = new Uint8ClampedArray(image.data);
    const levels = [8, 7, 6][strength];
    const step = 255 / (levels - 1);
    const threshold = [76, 58, 43][strength];
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = (y * size + x) * 4;
        const right = (y * size + Math.min(size - 1, x + 1)) * 4;
        const down = (Math.min(size - 1, y + 1) * size + x) * 4;
        const lum = luminance(source[index], source[index + 1], source[index + 2]);
        const grad = Math.abs(lum - luminance(source[right], source[right + 1], source[right + 2]))
          + Math.abs(lum - luminance(source[down], source[down + 1], source[down + 2]));
        for (let channel = 0; channel < 3; channel += 1) {
          const posterized = Math.round(source[index + channel] / step) * step;
          image.data[index + channel] = grad > threshold ? Math.round(posterized * .28) : posterized;
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function quantizeToPattern(canvas, grid, palette, backgroundMode) {
    const sample = document.createElement('canvas');
    sample.width = grid;
    sample.height = grid;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, grid, grid);
    const pixels = ctx.getImageData(0, 0, grid, grid).data;
    const backgrounds = estimateCornerColors(pixels, grid);
    const cells = Array.from({ length: grid }, () => Array(grid).fill(null));
    const tolerance = checkedValue('route') === 'cartoon' ? 37 : 31;
    for (let y = 0; y < grid; y += 1) {
      for (let x = 0; x < grid; x += 1) {
        const index = (y * grid + x) * 4;
        const rgb = [pixels[index], pixels[index + 1], pixels[index + 2]];
        const alpha = pixels[index + 3];
        if (alpha < 128) continue;
        if (backgroundMode === 'auto' && backgrounds.some((bg) => colorDistance(rgb, bg) < tolerance)) continue;
        cells[y][x] = nearestColor(rgb, palette);
      }
    }
    return cells;
  }

  function collectColorSamples(canvas, grid, backgroundMode, route) {
    const sample = document.createElement('canvas');
    sample.width = grid;
    sample.height = grid;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, grid, grid);
    const pixels = ctx.getImageData(0, 0, grid, grid).data;
    const backgrounds = estimateCornerColors(pixels, grid);
    const tolerance = route === 'cartoon' ? 37 : 31;
    const samples = [];
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 128) continue;
      const rgb = [pixels[index], pixels[index + 1], pixels[index + 2]];
      if (backgroundMode === 'auto' && backgrounds.some((bg) => colorDistance(rgb, bg) < tolerance)) continue;
      samples.push(rgb);
    }
    return samples;
  }

  function cleanTinyComponents(cells) {
    const components = findComponents(cells);
    const minSize = Math.max(2, Math.floor(state.grid * state.grid * .0005));
    components.forEach((component) => {
      if (component.length >= minSize) return;
      component.forEach(([x, y]) => { cells[y][x] = null; });
    });
  }

  function smoothConcaveContours(cells) {
    const source = cells.map((row) => row.slice());
    for (let y = 1; y < source.length - 1; y += 1) {
      for (let x = 1; x < source[y].length - 1; x += 1) {
        if (source[y][x]) continue;
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const cell = source[y + dy][x + dx];
            if (cell) neighbors.push(cell);
          }
        }
        const orthogonal = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => source[y + dy][x + dx]).length;
        if (neighbors.length < 5 || orthogonal < 2) continue;
        const counts = new Map();
        neighbors.forEach((cell) => counts.set(cell.code, (counts.get(cell.code) || 0) + 1));
        const code = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        cells[y][x] = colorByCode(code);
      }
    }
  }

  function connectPattern(cells) {
    let components = findComponents(cells).sort((a, b) => b.length - a.length).slice(0, 18);
    if (components.length <= 1) return;
    const dark = colorByCode('H7');
    const connected = [...components.shift()];
    for (const component of components) {
      const boundaryA = boundaryPoints(connected, cells);
      const boundaryB = boundaryPoints(component, cells);
      let best = null;
      for (const a of samplePoints(boundaryA, 240)) {
        for (const b of samplePoints(boundaryB, 160)) {
          const distance = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
          if (!best || distance < best.distance) best = { a, b, distance };
        }
      }
      if (!best) continue;
      const horizontalFirst = Math.abs(best.a[0] - best.b[0]) >= Math.abs(best.a[1] - best.b[1]);
      const corner = horizontalFirst ? [best.b[0], best.a[1]] : [best.a[0], best.b[1]];
      const path = [...linePoints(best.a, corner), ...linePoints(corner, best.b)];
      for (const [x, y] of path) {
        if (inside(cells, x, y) && !cells[y][x]) cells[y][x] = dark;
        const neighbor = horizontalFirst ? [x, y + 1] : [x + 1, y];
        if (inside(cells, neighbor[0], neighbor[1]) && !cells[neighbor[1]][neighbor[0]]) cells[neighbor[1]][neighbor[0]] = dark;
      }
      connected.push(...component, ...path);
    }
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
    renderCurrentView();
  }

  function renderCurrentView() {
    if (!state.image) return renderEmptyBoard();
    const ctx = els.canvas.getContext('2d');
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    if (state.view === 'source' || state.view === 'cartoon') {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(state.view === 'source' ? state.sourceCanvas : state.cartoonCanvas, 0, 0, els.canvas.width, els.canvas.height);
      els.canvas.style.cursor = 'default';
      return;
    }
    els.canvas.style.cursor = 'crosshair';
    drawPatternCanvas(ctx, els.canvas.width, state.view);
  }

  function drawPatternCanvas(ctx, size, view) {
    const cellSize = size / state.grid;
    ctx.fillStyle = view === 'connectivity' ? '#8fa8b7' : '#f5f1eb';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < state.grid; y += 1) {
      for (let x = 0; x < state.grid; x += 1) {
        const cell = state.cells[y][x];
        if (!cell) continue;
        const left = Math.floor(x * cellSize);
        const top = Math.floor(y * cellSize);
        const right = Math.ceil((x + 1) * cellSize);
        const bottom = Math.ceil((y + 1) * cellSize);
        ctx.fillStyle = cell.hex;
        ctx.fillRect(left, top, right - left, bottom - top);
        if (view === 'chart') {
          ctx.fillStyle = readableTextColor(cell.rgb);
          ctx.font = `700 ${Math.max(5, cellSize * .34)}px ui-monospace, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.code, (x + .5) * cellSize, (y + .52) * cellSize);
        }
      }
    }
    if (view === 'chart') {
      for (let index = 0; index <= state.grid; index += 1) {
        ctx.beginPath();
        ctx.strokeStyle = index % 10 === 0 ? 'rgba(24,22,20,.68)' : 'rgba(24,22,20,.16)';
        ctx.lineWidth = index % 10 === 0 ? Math.max(1.3, cellSize * .12) : Math.max(.45, cellSize * .045);
        ctx.moveTo(index * cellSize, 0);
        ctx.lineTo(index * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, index * cellSize);
        ctx.lineTo(size, index * cellSize);
        ctx.stroke();
      }
    }
  }

  function renderEmptyBoard() {
    const ctx = els.canvas.getContext('2d');
    ctx.fillStyle = '#f4f1eb';
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
  }

  function editAtPointer(event) {
    if (!state.cells.length || ['source', 'cartoon'].includes(state.view)) return;
    const rect = els.canvas.getBoundingClientRect();
    const x = Math.min(state.grid - 1, Math.max(0, Math.floor((event.clientX - rect.left) / rect.width * state.grid)));
    const y = Math.min(state.grid - 1, Math.max(0, Math.floor((event.clientY - rect.top) / rect.height * state.grid)));
    pushUndo();
    applyTool(x, y);
    refreshAnalysis();
    renderCurrentView();
    setStatus(`已修改第 ${x + 1} 列、第 ${y + 1} 行；当前 ${state.analysis.components} 个连通块。`);
  }

  function applyTool(x, y) {
    const set = (px, py, code) => {
      if (inside(state.cells, px, py)) state.cells[py][px] = code ? colorByCode(code) : null;
    };
    if (state.tool === 'pen') return set(x, y, state.selectedCode);
    if (state.tool === 'erase') return set(x, y, null);
    if (state.tool === 'oval-eye') {
      for (let py = y - 2; py <= y + 1; py += 1) for (let px = x; px <= x + 1; px += 1) set(px, py, 'H7');
      return;
    }
    if (state.tool === 'anime-eye') {
      for (let px = x - 1; px <= x; px += 1) set(px, y - 2, 'H7');
      for (let py = y - 1; py <= y + 1; py += 1) {
        for (let px = x - 2; px <= x + 1; px += 1) set(px, py, 'H7');
      }
      for (let px = x - 1; px <= x; px += 1) set(px, y + 2, 'H7');
      set(x - 1, y - 1, 'H2');
      return;
    }
    if (state.tool === 'closed-eye') {
      [[-2, 0], [-1, -1], [0, -1], [1, -1], [2, 0]].forEach(([dx, dy]) => set(x + dx, y + dy, 'H7'));
      return;
    }
    if (state.tool === 'smile') {
      [[-3, -1], [-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0], [3, -1]].forEach(([dx, dy]) => set(x + dx, y + dy, 'H7'));
      return;
    }
    if (state.tool === 'kiss') {
      [[-1, -1, 'M12'], [0, -1, 'M12'], [-2, 0, 'M12'], [-1, 0, 'F9'], [0, 0, 'F9'], [1, 0, 'M12'], [-1, 1, 'M12'], [0, 1, 'M12']]
        .forEach(([dx, dy, code]) => set(x + dx, y + dy, code));
      return;
    }
    if (state.tool === 'glasses') stampGlasses(x, y, set);
  }

  function stampGlasses(centerX, centerY, set) {
    const ring = (left, top) => {
      for (let x = left + 2; x <= left + 5; x += 1) set(x, top, 'H2');
      for (const x of [left + 1, left + 2, left + 5, left + 6]) set(x, top + 1, 'H2');
      for (const x of [left, left + 1, left + 6, left + 7]) set(x, top + 2, 'H2');
      for (let y = top + 3; y <= top + 4; y += 1) { set(left, y, 'H2'); set(left + 7, y, 'H2'); }
      for (const x of [left, left + 1, left + 6, left + 7]) set(x, top + 5, 'H2');
      for (const x of [left + 1, left + 2, left + 5, left + 6]) set(x, top + 6, 'H2');
      for (let x = left + 2; x <= left + 5; x += 1) set(x, top + 7, 'H2');
    };
    const top = centerY - 4;
    const left = centerX - 9;
    ring(left, top);
    ring(left + 11, top);
    for (let x = left + 8; x <= left + 10; x += 1) { set(x, centerY - 1, 'H2'); set(x, centerY, 'H2'); }
  }

  function pushUndo() {
    state.undoStack.push(state.cells.map((row) => row.slice()));
    if (state.undoStack.length > 24) state.undoStack.shift();
    els.undo.disabled = false;
  }

  function undoEdit() {
    const previous = state.undoStack.pop();
    if (!previous) return;
    state.cells = previous;
    els.undo.disabled = state.undoStack.length === 0;
    refreshAnalysis();
    renderCurrentView();
    setStatus('已撤销上一步修改。');
  }

  function refreshAnalysis() {
    const counts = new Map();
    let total = 0;
    for (const row of state.cells) {
      for (const cell of row) {
        if (!cell) continue;
        total += 1;
        counts.set(cell.code, (counts.get(cell.code) || 0) + 1);
      }
    }
    const components = findComponents(state.cells);
    state.analysis = { total, counts, components: components.length, componentSizes: components.map((item) => item.length).sort((a, b) => b - a) };
    els.statGrid.textContent = `${state.grid}×${state.grid}`;
    els.statBeads.textContent = total.toLocaleString('zh-CN');
    els.statColors.textContent = counts.size;
    els.statComponents.textContent = components.length;
    els.statComponents.style.color = components.length === 1 ? '#527563' : '#a94135';
  }

  function renderPalette() {
    els.paletteRow.innerHTML = '';
    const editorColors = uniqueColors([colorByCode('H7'), colorByCode('H2'), ...state.palette]);
    editorColors.forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `palette-chip${readableTextColor(color.rgb) === '#1f1c1a' ? ' light' : ''}${state.selectedCode === color.code ? ' active' : ''}`;
      button.style.background = color.hex;
      button.textContent = color.code;
      button.title = `${color.code} · ${color.name} · ${color.hex}`;
      button.setAttribute('aria-label', `${color.code} ${color.name}`);
      button.addEventListener('click', () => {
        state.selectedCode = color.code;
        renderPalette();
      });
      els.paletteRow.appendChild(button);
    });
  }

  function setReady(ready) {
    els.editor.classList.toggle('ready', ready);
    els.undo.disabled = true;
    for (const button of [els.downloadPreview, els.downloadChart, els.downloadGrid, els.downloadCounts]) button.disabled = !ready;
  }

  function updateRangeLabels() {
    const gridIndex = Number(els.gridSize.value);
    els.gridOutput.textContent = `${GRID_OPTIONS[gridIndex]} × ${GRID_OPTIONS[gridIndex]}`;
    els.complexityHint.textContent = COMPLEXITY_COPY[gridIndex];
    els.outlineOutput.textContent = OUTLINE_COPY[Number(els.outline.value)];
  }

  function exportPreview() {
    const cellSize = Math.max(8, Math.floor(1200 / state.grid));
    const canvas = document.createElement('canvas');
    canvas.width = state.grid * cellSize;
    canvas.height = state.grid * cellSize;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f1eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.cells.forEach((row, y) => row.forEach((cell, x) => {
      if (!cell) return;
      ctx.fillStyle = cell.hex;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }));
    downloadCanvas(canvas, `${state.fileName}-拼豆预览-${state.grid}x${state.grid}.png`);
  }

  function exportChart() {
    const cellSize = 18;
    const marginX = 74;
    const header = 112;
    const legendHeight = 330;
    const canvas = document.createElement('canvas');
    canvas.width = marginX * 2 + state.grid * cellSize;
    canvas.height = header + state.grid * cellSize + legendHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffdf9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1f1c1a';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('豆格工坊 · MARD 色号拼豆图纸', marginX, 46);
    ctx.fillStyle = '#746d66';
    ctx.font = '18px sans-serif';
    ctx.fillText(`${state.grid}×${state.grid} 格 · ${state.analysis.total} 颗 · ${state.analysis.counts.size} 色 · 空白格不放豆`, marginX, 78);
    const top = header;
    for (let y = 0; y < state.grid; y += 1) {
      for (let x = 0; x < state.grid; x += 1) {
        const cell = state.cells[y][x];
        ctx.fillStyle = cell ? cell.hex : '#ffffff';
        ctx.fillRect(marginX + x * cellSize, top + y * cellSize, cellSize, cellSize);
        if (cell) {
          ctx.fillStyle = readableTextColor(cell.rgb);
          ctx.font = '700 6.2px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.code, marginX + (x + .5) * cellSize, top + (y + .52) * cellSize);
        }
      }
    }
    for (let index = 0; index <= state.grid; index += 1) {
      ctx.beginPath();
      ctx.strokeStyle = index % 10 === 0 ? 'rgba(31,28,26,.82)' : 'rgba(31,28,26,.18)';
      ctx.lineWidth = index % 10 === 0 ? 2 : .55;
      ctx.moveTo(marginX + index * cellSize, top);
      ctx.lineTo(marginX + index * cellSize, top + state.grid * cellSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(marginX, top + index * cellSize);
      ctx.lineTo(marginX + state.grid * cellSize, top + index * cellSize);
      ctx.stroke();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#746d66';
    ctx.font = '10px ui-monospace, monospace';
    for (let index = 0; index < state.grid; index += 1) {
      if (index % 5 !== 0) continue;
      ctx.fillText(String(index + 1), marginX + (index + .5) * cellSize, top - 8);
      ctx.textAlign = 'right';
      ctx.fillText(String(index + 1), marginX - 8, top + (index + .72) * cellSize);
      ctx.textAlign = 'center';
    }
    const legendTop = top + state.grid * cellSize + 46;
    const used = MARD_PALETTE.filter((color) => state.analysis.counts.has(color.code));
    const columns = 4;
    const columnWidth = (canvas.width - marginX * 2) / columns;
    used.forEach((color, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const left = marginX + col * columnWidth;
      const y = legendTop + row * 64;
      ctx.fillStyle = color.hex;
      ctx.fillRect(left, y, 42, 42);
      ctx.strokeStyle = 'rgba(31,28,26,.28)';
      ctx.strokeRect(left, y, 42, 42);
      ctx.fillStyle = '#1f1c1a';
      ctx.font = '800 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${color.code} · ${color.name} × ${state.analysis.counts.get(color.code)}`, left + 54, y + 17);
      ctx.fillStyle = '#746d66';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillText(color.hex, left + 54, y + 35);
    });
    ctx.fillStyle = '#746d66';
    ctx.font = '13px sans-serif';
    ctx.fillText('提示：做挂饰时请双面充分熨烫，并使用两个以上受力点。', marginX, canvas.height - 28);
    downloadCanvas(canvas, `${state.fileName}-MARD拼豆图纸-${state.grid}x${state.grid}.png`);
  }

  function exportGridCsv() {
    const header = ['', ...Array.from({ length: state.grid }, (_, index) => index + 1)].join(',');
    const lines = [header];
    state.cells.forEach((row, index) => lines.push([index + 1, ...row.map((cell) => cell ? cell.code : '')].join(',')));
    downloadText(`\uFEFF${lines.join('\n')}`, `${state.fileName}-逐格色号-${state.grid}x${state.grid}.csv`, 'text/csv;charset=utf-8');
  }

  function exportCountsCsv() {
    const lines = ['code,name,hex,count'];
    MARD_PALETTE.forEach((color) => {
      const count = state.analysis.counts.get(color.code);
      if (count) lines.push(`${color.code},${color.name},${color.hex},${count}`);
    });
    lines.push(`TOTAL,,,${state.analysis.total}`);
    downloadText(`\uFEFF${lines.join('\n')}`, `${state.fileName}-MARD用量.csv`, 'text/csv;charset=utf-8');
  }

  function findComponents(cells) {
    const height = cells.length;
    const width = height ? cells[0].length : 0;
    const seen = Array.from({ length: height }, () => new Uint8Array(width));
    const components = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!cells[y][x] || seen[y][x]) continue;
        const component = [];
        const queue = [[x, y]];
        seen[y][x] = 1;
        for (let index = 0; index < queue.length; index += 1) {
          const [cx, cy] = queue[index];
          component.push([cx, cy]);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen[ny][nx] || !cells[ny][nx]) continue;
            seen[ny][nx] = 1;
            queue.push([nx, ny]);
          }
        }
        components.push(component);
      }
    }
    return components;
  }

  function boundaryPoints(points, cells) {
    return points.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(cells, x + dx, y + dy) || !cells[y + dy][x + dx]));
  }

  function samplePoints(points, limit) {
    if (points.length <= limit) return points;
    const result = [];
    const step = points.length / limit;
    for (let index = 0; index < limit; index += 1) result.push(points[Math.floor(index * step)]);
    return result;
  }

  function linePoints(from, to) {
    const points = [];
    let [x, y] = from;
    const [targetX, targetY] = to;
    const dx = Math.sign(targetX - x);
    const dy = Math.sign(targetY - y);
    while (x !== targetX) { points.push([x, y]); x += dx; }
    while (y !== targetY) { points.push([x, y]); y += dy; }
    points.push([x, y]);
    return points;
  }

  function estimateCornerColors(pixels, grid) {
    const radius = Math.max(2, Math.floor(grid * .035));
    const corners = [[0, 0], [grid - radius, 0], [0, grid - radius], [grid - radius, grid - radius]];
    const colors = corners.map(([left, top]) => {
      const sum = [0, 0, 0];
      let count = 0;
      for (let y = top; y < Math.min(grid, top + radius); y += 1) {
        for (let x = left; x < Math.min(grid, left + radius); x += 1) {
          const index = (y * grid + x) * 4;
          sum[0] += pixels[index]; sum[1] += pixels[index + 1]; sum[2] += pixels[index + 2]; count += 1;
        }
      }
      return sum.map((value) => value / count);
    });
    let dominant = [];
    for (const color of colors) {
      const group = colors.filter((candidate) => colorDistance(color, candidate) < 44);
      if (group.length > dominant.length) dominant = group;
    }
    if (dominant.length >= 2) return dominant;
    return [colors.sort((a, b) => luminance(b[0], b[1], b[2]) - luminance(a[0], a[1], a[2]))[0]];
  }

  function nearestColor(rgb, palette) {
    let best = palette[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const color of palette) {
      const distance = colorDistance(rgb, color.rgb);
      if (distance < bestDistance) { best = color; bestDistance = distance; }
    }
    return best;
  }

  function colorDistance(a, b) {
    const meanRed = (a[0] + b[0]) / 2;
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt((2 + meanRed / 256) * dr * dr + 4 * dg * dg + (2 + (255 - meanRed) / 256) * db * db);
  }

  function drawImageContain(ctx, image, width, height) {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function uniqueColors(colors) {
    const seen = new Set();
    return colors.filter((color) => {
      if (!color || seen.has(color.code)) return false;
      seen.add(color.code);
      return true;
    });
  }

  function downloadCanvas(canvas, name) {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, name);
    }, 'image/png');
  }

  function downloadText(text, name, type) {
    downloadBlob(new Blob([text], { type }), name);
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setStatus(message, error = false) {
    els.status.textContent = message;
    els.status.style.color = error ? '#a94135' : '';
  }

  function checkedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`).value;
  }

  function colorByCode(code) {
    return MARD_PALETTE.find((color) => color.code === code) || MARD_PALETTE[0];
  }

  function inside(cells, x, y) {
    return y >= 0 && y < cells.length && x >= 0 && x < cells[0].length;
  }

  function readableTextColor(rgb) {
    return luminance(rgb[0], rgb[1], rgb[2]) > 165 ? '#1f1c1a' : '#ffffff';
  }

  function luminance(red, green, blue) {
    return red * .299 + green * .587 + blue * .114;
  }

  function hexToRgb(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function safeFileName(name) {
    return name.replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 70);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
})();
