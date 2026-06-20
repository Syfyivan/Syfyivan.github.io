/**
 * 课程文章头图：随章节自动变化的动画卡片图案。
 * 仅作用于软件质量课程（寓言版 software-quality-fables / 修仙版 software-quality-xianxia）
 * 与两版对比文。给 #banner 加 .sqc-banner 类、按章节设色相与纹理变体；
 * 具体样式见 /css/course-banner.css。
 */
(function () {
  function detect(path) {
    path = decodeURIComponent(path || '');
    var m = path.match(/software-quality-(fables|xianxia)-(\d{2})/);
    if (m) {
      return { series: m[1], idx: parseInt(m[2], 10) };
    }
    if (/software-quality-two-styles-compare/.test(path)) {
      return { series: 'compare', idx: 0 };
    }
    // 课程目录页也给一个稳定的封面观感
    var mm = path.match(/\/courses\/software-quality-(fables|xianxia)\//);
    if (mm) {
      return { series: mm[1], idx: 0 };
    }
    return null;
  }

  function init() {
    var banner = document.getElementById('banner');
    if (!banner) return;
    var info = detect(location.pathname);
    if (!info) return;

    // 三个系列各一套基色：寓言=绿、修仙=紫、对比=琥珀
    var palette = {
      fables: { h: 158, s: 40 },
      xianxia: { h: 262, s: 46 },
      compare: { h: 28, s: 54 }
    }[info.series] || { h: 158, s: 40 };

    var idx = isNaN(info.idx) ? 0 : info.idx;
    var hue = ((palette.h + idx * 15) % 360 + 360) % 360; // 每章相位偏移，章章不同
    var hue2 = (hue + 28) % 360;
    var variant = idx % 4; // 4 种卡片纹理轮换

    document.documentElement.classList.add('sqc-on');
    banner.classList.add('sqc-banner');
    banner.setAttribute('data-sqc-variant', String(variant));
    banner.style.setProperty('--sqc-h', String(hue));
    banner.style.setProperty('--sqc-h2', String(hue2));
    banner.style.setProperty('--sqc-s', palette.s + '%');
  }

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
