(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Days allocation pie (85-day version) ---
  var el = document.getElementById('chart-days');
  if (el) {
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: '{b}: {c}天 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: ink, fontSize: 12 },
        itemGap: 10
      },
      color: [accent, '#5B7FA6', '#D4880F', '#8B5E3C', '#6B8E7A', accent2, '#B8866B', '#9B8FB0'],
      series: [{
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['32%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          color: ink,
          fontSize: 11,
          formatter: '{c}天'
        },
        labelLine: { lineStyle: { color: rule } },
        data: [
          { value: 6,  name: 'G7北京→额济纳' },
          { value: 8,  name: '甘青大环线' },
          { value: 10, name: '北疆喀纳斯金秋' },
          { value: 7,  name: '伊犁+独库+南疆帕米尔' },
          { value: 9,  name: '新藏线G219→阿里' },
          { value: 14, name: '转山+珠峰+拉萨+林芝' },
          { value: 12, name: '滇藏线+雨崩+虎跳峡' },
          { value: 19, name: '云南慢旅行' }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();
