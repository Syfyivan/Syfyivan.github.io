(function () {
  'use strict';
  function init() {
    if (location.pathname !== '/' && location.pathname !== '/index.html') return;
    var main=document.querySelector('main'), core=window.BlogFarm;
    if (!main || !core || document.getElementById('farm')) return;
    var farm=document.createElement('section');
    farm.id='farm'; farm.className='farm'; farm.setAttribute('aria-labelledby','farm-title');
    farm.innerHTML=`
      <div class="farm__inner">
        <header class="farm__heading"><div><p class="farm__eyebrow">LIFE IN THE GARDEN · 小镇南边</p><h2 id="farm-title">留一块地，慢慢长大。</h2><p>种点菜，等鱼咬钩，看看动物们散步。</p></div><div class="farm__basket" aria-label="农场收获"><span>菜篮 <b data-harvest>0</b></span><span>鱼篓 <b data-fish>0</b></span></div></header>
        <div class="farm__land">
          <section class="farm__field" aria-labelledby="field-title">
            <div class="farm__section-head"><h3 id="field-title">一方菜地</h3><label>种子 <select id="farm-seed"><option value="carrot">胡萝卜 · 12 秒</option><option value="turnip">白萝卜 · 18 秒</option></select></label></div>
            <p class="farm__help">点空地播种 → 再点浇水 → 成熟后收获</p>
            <div class="farm__plots"></div>
            <p class="farm__field-note">浇过水就会生长，下次回来也能收菜。</p>
          </section>
          <section class="farm__fishing" aria-labelledby="pond-title">
            <div class="farm__section-head"><h3 id="pond-title">风吹过池塘</h3><span class="farm__small">等一等，好事会发生</span></div>
            <div class="farm__pond" aria-hidden="true"><div class="farm__water"><i class="farm__ripple farm__ripple--a"></i><i class="farm__ripple farm__ripple--b"></i><span class="farm__lily farm__lily--a"></span><span class="farm__lily farm__lily--b"></span><div class="farm__duck-lane"></div><div class="farm__fish-lane"></div><span class="farm__bobber"></span></div><div class="farm__dock"></div><span class="farm__fisher"></span><i class="farm__reeds"></i></div>
            <div class="farm__fishing-controls"><button type="button" class="farm__cast">抛竿钓鱼</button><button type="button" class="farm__cancel" hidden>收起鱼竿</button><span class="farm__rod-note">咬钩后点击收竿，不用抢时间。</span></div>
          </section>
          <div class="farm__trail" tabindex="0" role="group" aria-label="农场小路，点击目的地或使用方向键带小人散步"><span class="farm__trail-hint">小路上点一点，带小人散步 <span aria-hidden="true">↔</span></span></div>
          <section class="farm__pasture" aria-labelledby="pasture-title"><div class="farm__section-head"><div><h3 id="pasture-title">牧场里的邻居</h3><p class="farm__help">吃草、散步、发会儿呆，各有各的节奏。</p></div><button type="button" class="farm__feed">撒一把牧草</button></div><div class="farm__grazing" aria-hidden="true"><span class="farm__hay"></span><div class="farm__animal-lane"></div><span class="farm__pasture-tree"></span><span class="farm__flowers"></span></div></section>
        </div>
        <footer class="farm__footer"><p class="farm__status" role="status" aria-live="polite">选好种子，从第一块地开始吧。</p><span class="farm__save-note">收获保存在当前浏览器 · 无需登录</span></footer>
      </div>`;
    main.insertBefore(farm,main.firstElementChild);
    var toggle=document.createElement('button'); toggle.type='button'; toggle.className='farm__motion';
    farm.querySelector('.farm__basket').appendChild(toggle);
    function syncToggle() { var paused=document.documentElement.dataset.motion==='paused'; toggle.textContent=paused?'播放农场动效':'暂停农场动效'; toggle.setAttribute('aria-pressed',String(paused)); var original=document.querySelector('.motion-toggle'); toggle.disabled=!!(original && original.disabled); }
    toggle.addEventListener('click',function(){var original=document.querySelector('.motion-toggle');if(original)original.click();});
    document.addEventListener('blog:motion',syncToggle); syncToggle();
    var key='yifan-farm-v1', state;
    function load() { try { state=core.restore(JSON.parse(localStorage.getItem(key)),Date.now()); } catch (_) { state=state || core.restore(null,Date.now()); } }
    function save() { try { localStorage.setItem(key,JSON.stringify(state)); } catch (_) { farm.querySelector('.farm__save-note').textContent='当前浏览器无法保存，刷新后进度可能丢失'; } }
    load();
    var message=farm.querySelector('.farm__status'), seed=farm.querySelector('#farm-seed'), plots=[];
    function say(text) { message.textContent=text; }
    var cropArt='<svg viewBox="0 0 32 36" aria-hidden="true" class="farm__crop"><path fill="#315f36" d="M14 17V5h4v12zM10 13H6V5h4v4h4v8h-4zm8 0V9h4V1h4v12h-4v4h-4z"/><path fill="#78a643" d="M14 1h4v12h-4zm8 4h4v4h-4z"/><path class="farm__root" fill="#e78a37" d="M8 16h16v8h-4v6h-4v6h-4V26H8z"/><path fill="#ffd184" d="M8 18h8v3H8zm8 6h4v3h-4z"/></svg>';
    for(var i=0;i<6;i++) {
      var button=document.createElement('button'); button.type='button'; button.className='farm__plot';
      button.dataset.plot=String(i); button.innerHTML='<span class="farm__seed-mark" aria-hidden="true">＋</span>'+cropArt+'<span class="farm__plot-label"></span><span class="farm__growth" aria-hidden="true"></span>';
      farm.querySelector('.farm__plots').appendChild(button); plots.push(button);
    }
    var rod=core.rod(), cast=farm.querySelector('.farm__cast'), cancel=farm.querySelector('.farm__cancel');
    function render() {
      var now=Date.now();
      plots.forEach(function(button,i) {
        var p=state.plots[i], stage=core.status(p,now), name=p ? core.crops[p.kind].name : core.crops[seed.value].name;
        var remaining=p && p.wateredAt!==null ? Math.max(0,Math.ceil((core.crops[p.kind].time-now+p.wateredAt)/1000)) : 0;
        var label=stage==='empty'?'播种':stage==='seed'?'浇水':stage==='ready'?'收获':remaining+' 秒';
        if(stage==='ready' && button.dataset.stage==='growing') say('有蔬菜成熟了，点亮起的菜地收获吧。');
        button.dataset.stage=stage; button.dataset.crop=p ? p.kind : seed.value;
        button.setAttribute('aria-label','第 '+(i+1)+' 块地：'+name+'，'+(stage==='growing'?'生长中，还需 '+remaining+' 秒':label));
        button.setAttribute('aria-disabled',String(stage==='growing'));
        button.querySelector('.farm__plot-label').textContent=label;
        button.style.setProperty('--growth',stage==='ready'?'1':stage==='growing'?String(Math.min(1,Math.max(0,(now-p.wateredAt)/core.crops[p.kind].time))):'0');
      });
      farm.querySelector('[data-harvest]').textContent=state.harvest;
      farm.querySelector('[data-fish]').textContent=state.fish;
      if(rod.phase==='waiting' && now>=rod.biteAt) { rod.phase='bite'; say('鱼咬钩了！点击“收竿”，这条鱼会等你。'); }
      farm.dataset.fishing=rod.phase;
      cast.textContent=rod.phase==='idle'?'抛竿钓鱼':rod.phase==='waiting'?'等待咬钩…':'收竿 · 鱼咬钩了！';
      cast.setAttribute('aria-disabled',String(rod.phase==='waiting'));
      cancel.hidden=rod.phase==='idle';
    }
    farm.querySelector('.farm__plots').addEventListener('click',function(e) {
      var button=e.target.closest('[data-plot]'); if(!button || e.detail>1) return;
      load();
      var result=core.act(state,Number(button.dataset.plot),Date.now(),seed.value);
      var notes={planted:'种子已经埋好，再点这块地浇水。',watered:'浇好水了，叶子正在慢慢长大。',growing:'还在生长，等倒计时结束就能收获。',harvested:'收获成功！蔬菜放进菜篮，空地可以继续种。'};
      say(notes[result] || '请重新选择一块地。'); save(); render();
    });
    seed.addEventListener('change',render);
    cast.addEventListener('click',function() {
      if(rod.phase==='idle') { core.cast(rod,Date.now(),2400+Math.random()*1800); say('鱼竿抛好了，留意水面上的浮标。'); }
      else if(core.reel(rod,Date.now())) { load(); state.fish=Math.min(999999,state.fish+1); save(); say('钓到一条鱼！已经放进鱼篓。'); }
      render();
    });
    function cancelFishing() { if(rod.phase!=='idle') { core.cancel(rod); say('已收起鱼竿，回来后可以重新抛竿。'); render(); } }
    cancel.addEventListener('click',cancelFishing);
    window.addEventListener('storage',function(e) { if(e.key===key || e.key===null) { load(); render(); } });

    // Actors move inside separate walkable lanes, so they cannot cross buildings,
    // vegetable beds or the pond bank. Positions are pixels, never frame offsets.
    var actors=[], zones=[], motion=matchMedia('(prefers-reduced-motion: reduce)'), raf=0, last=0, visible=true, clock=0;
    function zone(el) { var z={el:el,visible:true,width:0,height:0}; zones.push(z); return z; }
    function actor(z,kind,size,frames,speed,x,y) {
      var el=document.createElement('span'); el.className='farm__actor farm__actor--'+kind; el.setAttribute('aria-hidden','true');
      el.style.width=size+'px'; el.style.height=size+'px'; el.style.backgroundSize=(size*frames)+'px '+(kind==='player'?size*3:kind==='chicken'?size*2:size)+'px';
      z.el.appendChild(el);
      var a={el:el,zone:z,kind:kind,size:size,frames:frames,speed:speed,x:0,y:0,tx:0,ty:0,rest:0,flip:false,row:0,start:[x,y]}; actors.push(a); return a;
    }
    var pasture=zone(farm.querySelector('.farm__animal-lane'));
    actor(pasture,'horse',64,6,24,.12,.25); actor(pasture,'cow',64,4,17,.66,.25);
    actor(pasture,'sheep',56,4,20,.42,.45); actor(pasture,'rabbit',40,4,32,.84,.5); actor(pasture,'babychick',32,4,23,.3,.75);
    var ducks=zone(farm.querySelector('.farm__duck-lane')); actor(ducks,'duck',40,4,15,.15,.3); actor(ducks,'duck',32,4,18,.7,.7);
    var fishes=zone(farm.querySelector('.farm__fish-lane')); actor(fishes,'silhouette',24,1,18,.2,.2); actor(fishes,'silhouette',20,1,14,.8,.4);
    var trail=zone(farm.querySelector('.farm__trail')), farmer=actor(trail,'player',56,6,45,.4,.3);
    var village=document.querySelector('.village');
    if(village) { var lane=document.createElement('div'); lane.className='farm__town-lane'; lane.setAttribute('aria-hidden','true'); village.appendChild(lane); var street=zone(lane); actor(street,'player',44,6,28,.5,.1); actor(street,'chicken',32,4,22,.2,.1); actor(street,'rabbit',32,4,25,.8,.2); }
    function measure() {
      zones.forEach(function(z) { z.width=z.el.clientWidth; z.height=z.el.clientHeight; });
      actors.forEach(function(a) { var w=Math.max(0,a.zone.width-a.size),h=Math.max(0,a.zone.height-a.size); if(a.start && a.zone.width>a.size) { a.x=a.start[0]*w; a.y=a.start[1]*h; a.tx=(1-a.start[0])*w; a.ty=(1-a.start[1])*h; a.start=null; } core.walk(a,0,w,h,Math.random); draw(a); });
    }
    function draw(a) { var frame=a.moving ? Math.floor(clock/140)%a.frames : 0; if(a.kind==='horse')frame=(a.row===2?4:a.row===1?2:0)+(a.moving?Math.floor(clock/180)%2:0); a.el.style.zIndex=String(Math.round(a.y+a.size)); a.el.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)'+(a.flip?' scaleX(-1)':''); a.el.style.backgroundPosition=-(frame*a.size)+'px '+(a.kind==='player'?-a.row*a.size:0)+'px'; }
    function allowed() { return !document.hidden && !motion.matches && document.documentElement.dataset.motion!=='paused'; }
    function resume() { cancelAnimationFrame(raf); raf=0; last=0; if(allowed() && zones.some(function(z){return z.visible;})) raf=requestAnimationFrame(tick); }
    function tick(now) {
      raf=0; if(!allowed()) return;
      var dt=last?Math.min((now-last)/1000,.05):0; last=now; clock+=dt*1000;
      actors.forEach(function(a) { if(!a.zone.visible)return; core.walk(a,dt,a.zone.width-a.size,a.zone.height-a.size,Math.random); draw(a); });
      raf=requestAnimationFrame(tick);
    }
    function guide(x,y) {
      farmer.tx=Math.max(0,Math.min(trail.width-farmer.size,x)); farmer.ty=Math.max(0,Math.min(trail.height-farmer.size,y)); farmer.rest=7;
      if(!allowed()) { farmer.x=farmer.tx; farmer.y=farmer.ty; farmer.moving=false; draw(farmer); }
    }
    trail.el.addEventListener('click',function(e) { var r=trail.el.getBoundingClientRect(); guide(e.clientX-r.left-farmer.size/2,e.clientY-r.top-farmer.size/2); });
    trail.el.addEventListener('keydown',function(e) {
      var d={ArrowLeft:[-40,0],ArrowRight:[40,0],ArrowUp:[0,-15],ArrowDown:[0,15]}[e.key];
      if(!d || e.altKey || e.metaKey || e.ctrlKey)return;
      e.preventDefault(); guide(farmer.tx+d[0],farmer.ty+d[1]);
    });
    var feed=farm.querySelector('.farm__feed'), fedUntil=0;
    feed.addEventListener('click',function() {
      if(Date.now()<fedUntil)return; fedUntil=Date.now()+6000; farm.classList.add('farm--feeding');
      feed.setAttribute('aria-disabled','true'); feed.textContent='邻居们来吃草了'; say('牧草撒好了，动物们正往食槽走。');
      actors.filter(function(a){return a.zone===pasture;}).forEach(function(a,i) { a.tx=Math.max(0,(pasture.width-a.size)*(.25+i*.11)); a.ty=Math.max(0,(pasture.height-a.size)*.55); a.rest=6; if(!allowed()){a.x=a.tx;a.y=a.ty;draw(a);} });
    });
    function update() { if(document.hidden || !visible)return; render(); if(fedUntil && Date.now()>=fedUntil) { fedUntil=0; feed.setAttribute('aria-disabled','false'); feed.textContent='撒一把牧草'; farm.classList.remove('farm--feeding'); } }
    measure(); render();
    if('ResizeObserver' in window) { var sizing=new ResizeObserver(measure); zones.forEach(function(z){sizing.observe(z.el);}); }
    requestAnimationFrame(measure);
    window.addEventListener('resize',measure);
    if('IntersectionObserver' in window) {
      var observer=new IntersectionObserver(function(entries){ entries.forEach(function(e){ var z=zones.find(function(z){return z.el===e.target;}); if(z) {z.visible=e.isIntersecting;z.el.classList.toggle('scene-offscreen',!z.visible);} else {visible=e.isIntersecting; farm.classList.toggle('scene-offscreen',!visible); if(!visible)cancelFishing(); else update();} }); resume(); });
      zones.forEach(function(z){observer.observe(z.el);}); observer.observe(farm);
    }
    document.addEventListener('visibilitychange',function(){ if(document.hidden)cancelFishing(); else {load();update();} resume(); });
    document.addEventListener('blog:motion',resume); motion.addEventListener('change',resume);
    window.addEventListener('pageshow',function(){load();render();resume();});
    setInterval(update,250); resume();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
