(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BlogFarm = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
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
  return {walk:walk};
});
