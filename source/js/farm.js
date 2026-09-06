(function () {
  'use strict';
  function init() {
    if(location.pathname!=='/' && location.pathname!=='/index.html')return;
    var village=document.querySelector('.village'),core=window.BlogFarm;
    if(!village || !core || document.getElementById('farm'))return;
    var farm=document.createElement('div');
    farm.id='farm';farm.className='farm';farm.setAttribute('aria-hidden','true');
    farm.innerHTML='<div class="farm__beds"></div><div class="farm__pond"><div class="farm__water"><i class="farm__ripple farm__ripple--a"></i><i class="farm__ripple farm__ripple--b"></i><span class="farm__lily farm__lily--a"></span><span class="farm__lily farm__lily--b"></span><div class="farm__duck-lane"></div><div class="farm__fish-lane"></div><span class="farm__bobber"></span></div><div class="farm__dock"></div><span class="farm__fisher"></span><i class="farm__reeds"></i></div><div class="farm__trail"></div><div class="farm__animal-lane"></div>';
    for(var i=0;i<6;i++) {
      var bed=document.createElement('div');bed.className='farm__bed';
      for(var j=0;j<4;j++) {
        var plant=document.createElement('span');plant.className='farm__plant';plant.style.setProperty('--delay',(-i*1.7-j*.4)+'s');
        bed.appendChild(plant);
      }
      farm.querySelector('.farm__beds').appendChild(bed);
    }
    var details=document.createElement('div');details.className='farm__details';
    [[3,68],[18,83],[38,51],[53,38],[96,65],[81,94],[8,10],[91,5]].forEach(function(p,i){var el=document.createElement('span');el.className=i%3===0?'farm__flowers':'farm__tuft';el.style.left=p[0]+'%';el.style.top=p[1]+'%';details.appendChild(el);});
    for(var k=0;k<5;k++){var stone=document.createElement('span');stone.className='farm__stone';stone.style.left=(48-Math.sin(k*.6)*5)+'%';stone.style.top=(k*30+4)+'px';details.appendChild(stone);}
    farm.appendChild(details);
    var line=document.createElementNS('http://www.w3.org/2000/svg','svg');line.setAttribute('viewBox','0 0 100 100');line.setAttribute('preserveAspectRatio','none');line.setAttribute('class','farm__fishing-line');line.innerHTML='<path d="M94 66 L83 36" stroke="#775237" stroke-width=".8" fill="none"/><path d="M83 36 Q71 36 65 56" stroke="#e1dfc6" stroke-width=".3" fill="none"/>';farm.querySelector('.farm__pond').appendChild(line);
    village.appendChild(farm);
    // Actors move inside separate walkable lanes, so they cannot cross buildings,
    // vegetable beds or the pond bank. Positions are pixels, never frame offsets.
    var actors=[], zones=[], motion=matchMedia('(prefers-reduced-motion: reduce)'), raf=0, last=0, clock=0;
    function zone(el) { var z={el:el,visible:true,width:0,height:0}; zones.push(z); return z; }
    function actor(z,kind,size,frames,speed,x,y) {
      var el=document.createElement('span'); el.className='farm__actor farm__actor--'+kind; el.setAttribute('aria-hidden','true');
      el.style.width=size+'px'; el.style.height=size+'px'; el.style.backgroundSize=(size*frames)+'px '+(kind==='player'?size*3:kind==='chicken'?size*2:size)+'px';
      z.el.appendChild(el);
      var a={el:el,zone:z,kind:kind,size:size,frames:frames,speed:speed,phase:actors.length*317,x:0,y:0,tx:0,ty:0,rest:0,flip:false,row:0,start:[x,y]}; actors.push(a); return a;
    }
    function pasture(kind) { var el=document.createElement('div'); el.className='farm__paddock farm__paddock--'+kind; farm.querySelector('.farm__animal-lane').appendChild(el); return zone(el); }
    actor(pasture('horse'),'horse',64,6,24,.12,.25); actor(pasture('cow'),'cow',64,4,17,.66,.25);
    actor(pasture('sheep'),'sheep',56,4,20,.42,.45); actor(pasture('rabbit'),'rabbit',40,4,32,.84,.5); actor(pasture('babychick'),'babychick',32,4,23,.3,.75);
    var duckLane=farm.querySelector('.farm__duck-lane'); for(var d=0;d<2;d++){var waterLane=document.createElement('div');waterLane.className='farm__duck-route farm__duck-route--'+d;duckLane.appendChild(waterLane);actor(zone(waterLane),'duck',d?28:32,4,d?10:12,.25,.4);}
    var fishes=zone(farm.querySelector('.farm__fish-lane')); actor(fishes,'silhouette',24,1,18,.2,.2); actor(fishes,'silhouette',20,1,14,.8,.4);
    var trail=zone(farm.querySelector('.farm__trail')); actor(trail,'player',48,6,23,.4,.3);
    var village=document.querySelector('.village');
    if(village) { var lane=document.createElement('div'); lane.className='farm__town-lane'; lane.setAttribute('aria-hidden','true'); village.appendChild(lane); var street=zone(lane); actor(street,'player',44,6,28,.5,.1); actor(street,'chicken',32,4,22,.2,.1); actor(street,'rabbit',32,4,25,.8,.2); }
    function measure() {
      zones.forEach(function(z) { z.width=z.el.clientWidth; z.height=z.el.clientHeight; });
      actors.forEach(function(a) { var w=Math.max(0,a.zone.width-a.size),h=Math.max(0,a.zone.height-a.size); if(a.start && a.zone.width>a.size) { a.x=a.start[0]*w; a.y=a.start[1]*h; a.tx=(1-a.start[0])*w; a.ty=(1-a.start[1])*h; a.start=null; } core.walk(a,0,w,h,Math.random); draw(a); });
    }
    function draw(a) { var frame=a.moving ? Math.floor((clock+a.phase)/170)%a.frames : 0; if(a.kind==='horse')frame=(a.row===2?4:a.row===1?2:0)+(a.moving?Math.floor((clock+a.phase)/210)%2:0); a.el.style.zIndex=String(Math.round(a.y+a.size)); a.el.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)'+(a.flip?' scaleX(-1)':''); a.el.style.backgroundPosition=-(frame*a.size)+'px '+(a.kind==='player'?-a.row*a.size:0)+'px'; }
    function allowed() { return !document.hidden && !motion.matches && document.documentElement.dataset.motion!=='paused'; }
    function resume() { cancelAnimationFrame(raf); raf=0; last=0; if(allowed() && zones.some(function(z){return z.visible;})) raf=requestAnimationFrame(tick); }
    function tick(now) {
      raf=0; if(!allowed()) return;
      var dt=last?Math.min((now-last)/1000,.05):0; last=now; clock+=dt*1000;
      actors.forEach(function(a) { if(!a.zone.visible)return; core.walk(a,dt,a.zone.width-a.size,a.zone.height-a.size,Math.random); draw(a); });
      raf=requestAnimationFrame(tick);
    }

    measure();
    if ('ResizeObserver' in window) { var sizing=new ResizeObserver(measure); zones.forEach(function(z){sizing.observe(z.el);}); }
    requestAnimationFrame(measure);
    window.addEventListener('resize',measure);
    if ('IntersectionObserver' in window) {
      var observer=new IntersectionObserver(function(entries){ entries.forEach(function(e){ var z=zones.find(function(z){return z.el===e.target;}); if(z)z.visible=e.isIntersecting; }); resume(); });
      zones.forEach(function(z){observer.observe(z.el);});
    }
    document.addEventListener('visibilitychange',resume);
    document.addEventListener('blog:motion',resume);
    motion.addEventListener('change',resume);
    window.addEventListener('pageshow',resume);
    resume();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
