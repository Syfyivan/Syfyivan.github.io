(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BlogFarm = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var crops = { carrot: {name:'胡萝卜', time:12000}, turnip: {name:'白萝卜', time:18000} };
  function count(n) { return Number.isSafeInteger(n) && n >= 0 ? Math.min(n, 999999) : 0; }
  function restore(raw, now) {
    raw = raw && raw.version === 1 ? raw : {};
    return {version:1, harvest:count(raw.harvest), fish:count(raw.fish), plots:Array.from({length:6}, function (_, i) {
      var p = Array.isArray(raw.plots) && raw.plots[i];
      if (!p || !Object.prototype.hasOwnProperty.call(crops, p.kind)) return null;
      return {kind:p.kind, wateredAt: Number.isFinite(p.wateredAt) && p.wateredAt >= 0 && p.wateredAt <= now ? p.wateredAt : null};
    })};
  }
  function status(p, now) {
    if (!p) return 'empty';
    if (p.wateredAt === null) return 'seed';
    return now - p.wateredAt >= crops[p.kind].time ? 'ready' : 'growing';
  }
  function act(state, i, now, kind) {
    if (!Number.isInteger(i) || i < 0 || i >= state.plots.length) return 'invalid';
    var stage = status(state.plots[i], now);
    if (stage === 'empty') {
      if (!Object.prototype.hasOwnProperty.call(crops, kind)) return 'invalid';
      state.plots[i] = {kind:kind, wateredAt:null}; return 'planted';
    }
    if (stage === 'seed') { state.plots[i].wateredAt = now; return 'watered'; }
    if (stage === 'ready') { state.plots[i] = null; state.harvest = count(state.harvest + 1); return 'harvested'; }
    return 'growing';
  }
  function rod() { return {phase:'idle', biteAt:0}; }
  function cast(r, now, wait) { if (r.phase !== 'idle') return false; r.phase='waiting'; r.biteAt=now+wait; return true; }
  function cancel(r) { r.phase='idle'; r.biteAt=0; }
  function reel(r, now) { if (r.phase==='idle' || now<r.biteAt) return false; cancel(r); return true; }
  function clamp(n, max) { return Math.max(0, Math.min(max, n)); }
  function walk(a, dt, width, height, random) {
    width=Math.max(0,width); height=Math.max(0,height); dt=Math.max(0,Math.min(dt,.05));
    a.x=clamp(a.x,width); a.y=clamp(a.y,height); a.tx=clamp(a.tx,width); a.ty=clamp(a.ty,height);
    var dx=a.tx-a.x, dy=a.ty-a.y, distance=Math.hypot(dx,dy);
    if (distance<1) {
      a.moving=false; a.rest-=dt;
      if(a.rest<=0) { a.tx=random()*width; a.ty=random()*height; a.rest=.7+random()*2; }
      return;
    }
    var step=Math.min(distance,a.speed*dt);
    a.x+=dx/distance*step; a.y+=dy/distance*step; a.moving=true;
    if(Math.abs(dx)>.2) a.flip=dx<0;
    a.row=Math.abs(dx)>Math.abs(dy) ? 2 : dy<0 ? 1 : 0;
  }
  return {crops:crops,restore:restore,status:status,act:act,rod:rod,cast:cast,cancel:cancel,reel:reel,walk:walk};
});
