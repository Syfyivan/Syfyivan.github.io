(function () {
  // Plan B 29 天海拔剖面数据。
  // sleep = 当晚住宿点海拔（防高反的核心：睡得越高恢复越差）；
  // pass  = 当天翻越的最高垭口/最高点海拔（决定单日爬升强度）；
  // 数值为沿 G318 / G214 / 稻城亚丁公开的城镇与垭口参考海拔（单位 m，约数），
  // 仅供高反防控参考，非实测；实际以现场导航与路牌为准。
  const profile = [
    { day: 1,  date: '10-04', place: '平遥',        sleep: 750,  pass: 800,  passName: '华北平原' },
    { day: 2,  date: '10-05', place: '西安',        sleep: 400,  pass: 800,  passName: '关中盆地' },
    { day: 3,  date: '10-06', place: '广元',        sleep: 500,  pass: 1000, passName: '秦岭隧道群' },
    { day: 4,  date: '10-07', place: '成都',        sleep: 500,  pass: 800,  passName: '剑门关' },
    { day: 5,  date: '10-08', place: '新都桥',      sleep: 3300, pass: 4298, passName: '折多山' },
    { day: 6,  date: '10-09', place: '理塘',        sleep: 4014, pass: 4718, passName: '剪子弯山/海子山' },
    { day: 7,  date: '10-10', place: '香格里拉镇',  sleep: 2900, pass: 4500, passName: '海子山古冰帽' },
    { day: 8,  date: '10-11', place: '香格里拉镇',  sleep: 2900, pass: 4600, passName: '牛奶海徒步' },
    { day: 9,  date: '10-12', place: '理塘',        sleep: 4014, pass: 4500, passName: '海子山' },
    { day: 10, date: '10-13', place: '巴塘',        sleep: 2580, pass: 4685, passName: '海子山（姊妹湖）' },
    { day: 11, date: '10-14', place: '左贡',        sleep: 3780, pass: 5130, passName: '东达山' },
    { day: 12, date: '10-15', place: '八宿',        sleep: 3260, pass: 4658, passName: '业拉山72拐' },
    { day: 13, date: '10-16', place: '波密',        sleep: 2750, pass: 4468, passName: '安久拉山' },
    { day: 14, date: '10-17', place: '林芝',        sleep: 2900, pass: 4728, passName: '色季拉山' },
    { day: 15, date: '10-18', place: '拉萨',        sleep: 3650, pass: 5013, passName: '米拉山' },
    { day: 16, date: '10-19', place: '拉萨',        sleep: 3650, pass: 3650, passName: '市内深度日' },
    { day: 17, date: '10-20', place: '拉萨',        sleep: 3650, pass: 4998, passName: '岗巴拉山（羊湖可选）' },
    { day: 18, date: '10-21', place: '林芝',        sleep: 2900, pass: 5013, passName: '米拉山' },
    { day: 19, date: '10-22', place: '然乌',        sleep: 3960, pass: 4468, passName: '安久拉山' },
    { day: 20, date: '10-23', place: '左贡',        sleep: 3780, pass: 4658, passName: '业拉山72拐' },
    { day: 21, date: '10-24', place: '芒康',        sleep: 3780, pass: 4376, passName: '拉乌山' },
    { day: 22, date: '10-25', place: '德钦飞来寺',  sleep: 3400, pass: 4448, passName: '红拉山/白马雪山' },
    { day: 23, date: '10-26', place: '香格里拉',    sleep: 3280, pass: 4292, passName: '白马雪山垭口' },
    { day: 24, date: '10-27', place: '丽江',        sleep: 2400, pass: 3280, passName: '小中甸（下行）' },
    { day: 25, date: '10-28', place: '西昌',        sleep: 1500, pass: 2400, passName: '丽攀高速' },
    { day: 26, date: '10-29', place: '成都',        sleep: 500,  pass: 2000, passName: '大相岭隧道' },
    { day: 27, date: '10-30', place: '西安',        sleep: 400,  pass: 1000, passName: '秦岭隧道群' },
    { day: 28, date: '10-31', place: '平遥',        sleep: 750,  pass: 1000, passName: '京昆高速' },
    { day: 29, date: '11-01', place: '北京',        sleep: 50,   pass: 800,  passName: '回家收官' }
  ];

  // 高反风险分级（按当晚睡觉海拔）：绿=低海拔恢复，橙=中高原，红=高原（>3500m 睡）。
  function riskColor(sleep) {
    if (sleep >= 3500) return '#B33A3A';
    if (sleep >= 2500) return '#D4880F';
    return '#4A7C59';
  }

  function render(hostId) {
    const host = document.getElementById(hostId);
    if (!host) return;
    const W = 960, H = 380, padL = 46, padR = 16, padT = 22, padB = 62;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const maxAlt = 5300, minAlt = 0;
    const n = profile.length;
    const stepX = innerW / (n - 1);
    const x = i => padL + i * stepX;
    const y = alt => padT + innerH * (1 - (alt - minAlt) / (maxAlt - minAlt));

    // 网格线（每 1000m）
    let grid = '';
    for (let a = 0; a <= 5000; a += 1000) {
      const gy = y(a);
      grid += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}" stroke="#E5DFD8" stroke-width="1"/>`;
      grid += `<text x="${padL - 8}" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#6B6560">${a}</text>`;
    }
    // 3500m 高原睡眠警戒线
    const warnY = y(3500);
    grid += `<line x1="${padL}" y1="${warnY.toFixed(1)}" x2="${W - padR}" y2="${warnY.toFixed(1)}" stroke="#B33A3A" stroke-width="1.2" stroke-dasharray="6 4"/>`;
    grid += `<text x="${W - padR}" y="${(warnY - 6).toFixed(1)}" text-anchor="end" font-size="10.5" fill="#B33A3A" font-weight="700">3500m 高原睡眠警戒线</text>`;

    // 睡觉海拔面积图 + 折线
    const sleepPts = profile.map((d, i) => `${x(i).toFixed(1)},${y(d.sleep).toFixed(1)}`).join(' ');
    const areaPath = `${padL},${y(0).toFixed(1)} ${sleepPts} ${x(n - 1).toFixed(1)},${y(0).toFixed(1)}`;

    // 垭口最高点折线（虚线）
    const passPts = profile.map((d, i) => `${x(i).toFixed(1)},${y(d.pass).toFixed(1)}`).join(' ');

    // 数据点 + 悬停标签
    let dots = '';
    profile.forEach((d, i) => {
      const px = x(i), pyS = y(d.sleep), pyP = y(d.pass);
      // 垭口点
      dots += `<circle cx="${px.toFixed(1)}" cy="${pyP.toFixed(1)}" r="2.6" fill="#8b6b4a" opacity="0.7"/>`;
      // 睡觉点
      dots += `<circle cx="${px.toFixed(1)}" cy="${pyS.toFixed(1)}" r="4" fill="${riskColor(d.sleep)}" stroke="#fff" stroke-width="1.4">`
        + `<title>D${d.day} ${d.date} ${d.place}\n睡觉海拔≈${d.sleep}m\n当日最高：${d.passName}≈${d.pass}m</title></circle>`;
      // x 轴天号（每 2 天标一次，防拥挤）
      if (i % 2 === 0 || i === n - 1) {
        dots += `<text x="${px.toFixed(1)}" y="${(H - padB + 16)}" text-anchor="middle" font-size="10" fill="#6B6560">D${d.day}</text>`;
        dots += `<text x="${px.toFixed(1)}" y="${(H - padB + 30)}" text-anchor="middle" font-size="8.5" fill="#9a938c">${d.date}</text>`;
      }
    });

    const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Plan B 29天海拔剖面图">
      ${grid}
      <polygon points="${areaPath}" fill="rgba(74,124,89,0.10)"/>
      <polyline points="${passPts}" fill="none" stroke="#8b6b4a" stroke-width="1.4" stroke-dasharray="4 4" opacity="0.75"/>
      <polyline points="${sleepPts}" fill="none" stroke="#4A7C59" stroke-width="2.4"/>
      ${dots}
      <text x="${padL}" y="14" font-size="11" fill="#6B6560">海拔 (m)</text>
    </svg>`;

    const legend = `<div class="alt-legend">
      <span><i style="background:#4A7C59"></i>睡觉海拔折线</span>
      <span><i class="dash" style="background:#8b6b4a"></i>当日最高垭口</span>
      <span><i style="background:#B33A3A"></i>高原睡眠 ≥3500m</span>
      <span><i style="background:#D4880F"></i>中海拔 2500–3500m</span>
      <span><i style="background:#4A7C59"></i>低海拔 &lt;2500m</span>
    </div>`;

    host.innerHTML = svg + legend;
  }

  window.ROAD_TRIP_ALTITUDE = { profile, render };
  if (document.readyState !== 'loading') { render('altitudeChart'); }
  else { document.addEventListener('DOMContentLoaded', function () { render('altitudeChart'); }); }
})();
