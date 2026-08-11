(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Days allocation pie (72-day version, 7 segments) ---
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
      color: [accent, '#5B7FA6', '#D4880F', '#8B5E3C', '#6B8E7A', accent2, '#B8866B'],
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
          { value: 7,  name: 'G7北京→敦煌→哈密' },
          { value: 10, name: '北疆喀纳斯+伊犁+独库' },
          { value: 6,  name: '南疆库车+喀什+帕米尔' },
          { value: 9, name: '新藏线G219→阿里→日喀则' },
          { value: 11, name: '拉萨恢复→林芝→波密→然乌' },
          { value: 12, name: '滇藏线→雨崩→虎跳峡→丽江' },
          { value: 17, name: '丽江→稻城亚丁→成都→北京' }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();
