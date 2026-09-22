(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FarmWorld = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var discoveries = [
    { id: 'berry', title: '第一颗草莓', hint: '去左边菜地，摘一颗熟透的草莓。', icon: 'berry', x: 10, y: 39,
      message: '摘到一颗带着阳光味道的草莓。慢慢生长的东西，总值得等一等。' },
    { id: 'fish', title: '池塘的礼物', hint: '到木栈桥坐坐，试试今天的手气。', icon: 'fish', x: 48, y: 72,
      message: '一条小银鱼探出了水面！看过它闪亮的鳞片，再轻轻放回池塘。' },
    { id: 'chick', title: '新朋友', hint: '广场东边的小鸡，正在等你打招呼。', icon: 'chicken', x: 62, y: 43,
      message: '啾！小鸡绕着你转了一圈。恭喜，你在小院里多了一位朋友。' }
  ];
  var places = [
    { id: 'library', name: '课程书屋', subtitle: '把零散知识，串成一条路', href: '/courses/', icon: 'book', x: 22, y: 29, w: 19, h: 24 },
    { id: 'workshop', name: '项目工坊', subtitle: '从一个念头，到一件作品', href: '/projects/', icon: 'house', x: 70, y: 34, w: 25, h: 25 },
    { id: 'observatory', name: '星光观测站', subtitle: 'AI 视觉与无限探索', href: '/flipbook/', icon: 'mushroom', x: 93, y: 23, w: 12, h: 21 },
    { id: 'studio', name: '玻璃花房', subtitle: '一起画画，让灵感开花', href: '/painters-guild/', icon: 'flower', x: 24, y: 69, w: 17, h: 22 },
    { id: 'tavern', name: '晚风小酒馆', subtitle: '打一局麻将，歇一歇', href: '/mahjong/', icon: 'jar', x: 76, y: 67, w: 22, h: 26 },
    { id: 'mail', name: '晨读信箱', subtitle: '一封新鲜的技术来信', href: '/morning-read/', icon: 'letter', x: 28, y: 30 }
  ];
  function restore(raw) {
    try {
      var data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.found)) return [];
      return discoveries.map(function (d) { return d.id; }).filter(function (id) { return data.found.includes(id); });
    } catch (_) { return []; }
  }
  function collect(found, id) {
    if (!discoveries.some(function (d) { return d.id === id; }) || found.includes(id)) return found.slice();
    return found.concat(id);
  }
  function save(storage, found) {
    try { storage.setItem('yifan-farm-discoveries', JSON.stringify({ version: 1, found: found })); return true; }
    catch (_) { return false; }
  }
  return { discoveries: discoveries, places: places, restore: restore, collect: collect, save: save };
});
