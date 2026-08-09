const STORAGE_KEY = 'ruyi-college-journal-v1';

const DEFAULT_STATE = {
  schemaVersion: 2,
  profile: { school: '我的大学', date: '2026-09-02T08:00' },
  items: [
    { id:'sunscreen', category:'🧴 护肤 · 日用', emoji:'☀️', title:'防晒霜', note:'想选一支不黏、适合每天用的防晒。', done:false, picked:'', plans:[
      { id:'A', name:'清爽型防晒', price:'79', thought:'肤感轻薄，平时上课和通勤都能用。' }
    ]},
    { id:'id-card', category:'🪪 证件 · 报到', emoji:'🪪', title:'身份证和复印件', note:'原件随身带，复印件单独放。', done:false, picked:'', plans:[] },
    { id:'admission', category:'🪪 证件 · 报到', emoji:'💌', title:'录取通知书', note:'出发前再检查一次。', done:false, picked:'', plans:[] },
    { id:'photos', category:'🪪 证件 · 报到', emoji:'🖼️', title:'一寸 / 两寸证件照', note:'纸质版和电子版都留好。', done:false, picked:'', plans:[] },
    { id:'laptop', category:'🔌 数码 · 学习', emoji:'💻', title:'笔记本电脑和充电器', note:'资料提前备份。', done:false, picked:'', plans:[] },
    { id:'powerbank', category:'🔌 数码 · 学习', emoji:'🔋', title:'充电宝', note:'确认符合乘车规定。', done:false, picked:'', plans:[] },
    { id:'earphone', category:'🔌 数码 · 学习', emoji:'🎧', title:'耳机', note:'自习和路上都能用。', done:false, picked:'', plans:[] },
    { id:'bedding', category:'🛏️ 宿舍 · 收纳', emoji:'🛏️', title:'床单被套', note:'先确认宿舍床的尺寸。', done:false, picked:'', plans:[
      {id:'A',name:'在家买好',price:'159',thought:'可以提前洗晒，开学到宿舍就能直接用。'}
    ]},
    { id:'hanger', category:'🛏️ 宿舍 · 收纳', emoji:'🧺', title:'衣架和收纳袋', note:'不一次买太多，住进去再补。', done:false, picked:'', plans:[] },
    { id:'medicine', category:'🌿 健康 · 军训', emoji:'💊', title:'常用药和创可贴', note:'按自己的实际需要准备。', done:false, picked:'', plans:[] },
    { id:'shoes', category:'🌿 健康 · 军训', emoji:'👟', title:'舒服的运动鞋', note:'提前穿几次，别让新鞋磨脚。', done:false, picked:'', plans:[] }
  ],
  diaries: [{ id:'first-note', date:'2026-08-09', mood:'🌻 期待', title:'我的大学准备手账开张啦', content:'离出发还有一段时间。我要一边慢慢收拾东西，一边记住这个很特别的夏天。希望开学后的我回来看，会觉得现在的期待很可爱。' }],
  wish: '希望我可以慢慢认识新的朋友，认真喜欢自己的专业，也别忘了好好吃饭、好好睡觉。第一次离家很远也没关系，我会长成更勇敢的大人。',
  wishes: ['在校园里找到最喜欢的那棵树','认识可以一起吃饭的新朋友','勇敢参加一次社团活动','给家里拍很多校园照片']
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const safeText = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.items)) return clone(DEFAULT_STATE);
    const migrated = { ...clone(DEFAULT_STATE), ...saved };
    migrated.items = saved.items.map(item => {
      let plans = (item.plans || []).map((plan,index) => ({
        id: String.fromCharCode(65 + index),
        name: String(plan.name || '').replace(/^Plan [A-Z] ·\s*/, ''),
        price: plan.price || '',
        thought: plan.thought || plan.reason || ''
      }));
      const isOldSunscreenExample = item.id === 'sunscreen' && plans.length === 3 && plans[0].name === '清爽型防晒';
      const isOldBeddingExample = item.id === 'bedding' && plans.length === 2 && plans[0].name === '在家买好';
      if (saved.schemaVersion !== 2 && (isOldSunscreenExample || isOldBeddingExample)) plans = plans.slice(0,1);
      const picked = plans.some(plan => plan.id === item.picked) ? item.picked : '';
      return { ...item, picked, plans };
    });
    migrated.schemaVersion = 2;
    return migrated;
  } catch { return clone(DEFAULT_STATE); }
}
let state = loadState();
let activeFilter = 'all';
let countdownTimer;

function save(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) toast(message);
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('is-show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('is-show'), 1800);
}

function setupTabs() {
  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(node => node.classList.toggle('is-active', node === tab));
    $$('.tab-page').forEach(page => page.classList.remove('is-active'));
    $(`#${tab.dataset.tab}-page`).classList.add('is-active');
    window.scrollTo({top:0, behavior:'smooth'});
  }));
}

function updateCountdown() {
  const target = new Date(state.profile.date).getTime();
  let diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000); diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  $('#cd-days').textContent = days;
  $('#cd-hours').textContent = String(hours).padStart(2,'0');
  $('#cd-mins').textContent = String(mins).padStart(2,'0');
  $('#cd-secs').textContent = String(secs).padStart(2,'0');
  const date = new Date(state.profile.date);
  $('#school-date-text').innerHTML = Date.now() >= target
    ? '🎓 <strong>新生活已经开始啦！</strong>'
    : `🚜 目的地：<strong>${safeText(state.profile.school)}</strong> · ${date.getFullYear()} 年 ${date.getMonth()+1} 月 ${date.getDate()} 日`;
}

function updateProgress() {
  const total = state.items.length;
  const done = state.items.filter(item => item.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('#done-count').textContent = done;
  $('#total-count').textContent = total;
  $('#progress-fill').style.width = `${pct}%`;
  const tips = pct === 100 ? '🎉 全部准备好啦，我可以安心出发了！' : pct >= 70 ? '就差一点点，行李箱快装满啦。' : pct >= 35 ? '已经完成不少了，继续慢慢来。' : '一件一件慢慢来，我会准备好的。';
  $('#progress-tip').textContent = tips;
  const pickedItems = state.items.filter(item => item.plans?.some(plan => plan.id === item.picked));
  const budget = pickedItems.reduce((sum,item) => {
    const price = item.plans.find(plan => plan.id === item.picked)?.price || '';
    const match = String(price).match(/\d+(?:\.\d+)?/);
    return sum + (match ? Number(match[0]) : 0);
  },0);
  $('#todo-count').textContent = `${total - done} 件`;
  $('#picked-count').textContent = `${pickedItems.length} 项`;
  $('#budget-total').textContent = budget ? `¥${budget.toFixed(budget % 1 ? 2 : 0)}` : '待填写';
}

function renderList() {
  const root = $('#list-root');
  const visible = state.items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'done') return item.done;
    if (activeFilter === 'undecided') return !item.done && !item.picked;
    return !item.done;
  });
  if (!visible.length) {
    root.innerHTML = '<div class="empty-state">🌱 这里暂时空空的，换个筛选看看吧。</div>';
    updateProgress(); return;
  }
  const groups = visible.reduce((map,item) => { (map[item.category] ||= []).push(item); return map; },{});
  root.innerHTML = Object.entries(groups).map(([category,items]) => `
    <section class="category"><h3 class="category__title">${safeText(category)}</h3>
      ${items.map(itemTemplate).join('')}
    </section>`).join('');
  bindListEvents();
  updateProgress();
}

function itemTemplate(item) {
  const picked = item.plans?.find(plan => plan.id === item.picked);
  return `<article class="list-item ${item.done?'is-done':''}" data-id="${safeText(item.id)}">
    <div class="item-main">
      <button class="pixel-check" type="button" role="checkbox" aria-label="${item.done?'取消完成':'标记完成'}：${safeText(item.title)}" aria-checked="${item.done}"></button>
      <span class="item-emoji">${safeText(item.emoji || '📦')}</span>
      <div class="item-copy"><strong class="item-title">${safeText(item.title)}</strong>${item.note?`<small class="item-note">${safeText(item.note)}</small>`:''}${picked?`<span class="decision-badge">决定买：${safeText(picked.name)}</span>`:''}</div>
      <button class="expand-btn" type="button" aria-expanded="false" aria-label="展开${safeText(item.title)}的候选方案">⌄</button>
    </div>
    <div class="item-details">
      <div class="detail-head"><h4>🌼 我的选择小铺</h4><span class="kicker">MY OPTIONS</span></div>
      ${item.plans?.length ? `<div class="plan-grid">${item.plans.map(plan => `<div class="plan-card ${item.picked===plan.id?'is-picked':''}"><label><span class="plan-letter"><input type="radio" name="pick-${safeText(item.id)}" value="${safeText(plan.id)}" ${item.picked===plan.id?'checked':''}>选择 ${safeText(plan.id)}</span><strong class="plan-name">${safeText(plan.name)}</strong>${plan.price?`<span class="plan-price">¥ ${safeText(plan.price)}</span>`:''}<small class="plan-thought">${safeText(plan.thought || '')}</small></label></div>`).join('')}</div>` : '<div class="empty-plans">还没有选择。点“编辑”写下名字、价格和我的想法吧。</div>'}
      <div class="item-actions">${item.picked?'<button class="text-btn clear-pick" type="button">取消决定</button>':''}<button class="text-btn edit-item" type="button">编辑</button><button class="text-btn danger delete-item" type="button">删除</button></div>
    </div>
  </article>`;
}

function bindListEvents() {
  $$('.list-item').forEach(card => {
    const id = card.dataset.id;
    $('.pixel-check',card).addEventListener('click', () => {
      const item = state.items.find(x => x.id === id); item.done = !item.done; save('进度保存好啦'); renderList();
    });
    $('.expand-btn',card).addEventListener('click', () => {
      const open = card.classList.toggle('is-open'); $('.expand-btn',card).setAttribute('aria-expanded',String(open));
    });
    $$('input[type=radio]',card).forEach(radio => radio.addEventListener('change', () => {
      const item = state.items.find(x => x.id === id);
      item.picked = radio.value;
      save('最终选择记下来啦');
      $$('.plan-card',card).forEach(planCard => planCard.classList.toggle('is-picked',$('input',planCard).checked));
      let badge = $('.decision-badge',card);
      if (!badge) { badge = document.createElement('span'); badge.className='decision-badge'; $('.item-copy',card).appendChild(badge); }
      badge.textContent = `决定买：${item.plans.find(plan => plan.id === item.picked).name}`;
      if (!$('.clear-pick',card)) { const clear=document.createElement('button'); clear.className='text-btn clear-pick'; clear.type='button'; clear.textContent='取消决定'; $('.item-actions',card).prepend(clear); bindClearPick(clear,item,card); }
      updateProgress();
    }));
    const clearPick = $('.clear-pick',card);
    if (clearPick) bindClearPick(clearPick,state.items.find(x => x.id === id),card);
    $('.edit-item',card).addEventListener('click', () => openItemDialog(id));
    $('.delete-item',card).addEventListener('click', () => {
      const item = state.items.find(x => x.id === id);
      if (confirm(`要从清单里删除“${item.title}”吗？`)) { state.items = state.items.filter(x => x.id !== id); save('已经删掉了'); renderList(); }
    });
  });
}

function bindClearPick(button,item,card) {
  button.addEventListener('click',()=>{
    item.picked='';
    save('已经取消这个决定');
    $$('.plan-card',card).forEach(planCard => planCard.classList.remove('is-picked'));
    $$('input[type=radio]',card).forEach(radio => { radio.checked=false; });
    $('.decision-badge',card)?.remove();
    button.remove();
    updateProgress();
  },{once:true});
}

function addPlanRow(plan={}) {
  const count = $$('.plan-edit-row', $('#plan-editor')).length;
  const letter = plan.id || String.fromCharCode(65 + Math.min(count,25));
  const row = document.createElement('div');
  row.className = 'plan-edit-row';
  row.innerHTML = `<div class="plan-row-title"><strong>选择 ${letter}</strong><button class="remove-plan" type="button" aria-label="删除这个选择">×</button></div><label><span>名字</span><input class="plan-name-input" value="${safeText(plan.name||'')}" placeholder="品牌、型号或方案名"></label><label><span>价格</span><input class="plan-price-input" inputmode="decimal" value="${safeText(plan.price||'')}" placeholder="例如 79"></label><label class="plan-thought-field"><span>我的想法</span><textarea class="plan-thought-input" rows="2" placeholder="喜欢哪里、担心什么、为什么想选它……">${safeText(plan.thought||plan.reason||'')}</textarea></label>`;
  row.dataset.letter = letter;
  $('.remove-plan',row).addEventListener('click',()=>row.remove());
  $('#plan-editor').appendChild(row);
}

function openItemDialog(id='') {
  const item = state.items.find(x => x.id === id);
  $('#item-dialog-title').textContent = item ? '编辑准备项' : '添加准备项';
  $('#item-id').value = item?.id || '';
  $('#item-category').value = item?.category || '🧴 护肤 · 日用';
  $('#item-emoji').value = item?.emoji || '📦';
  $('#item-title').value = item?.title || '';
  $('#item-note').value = item?.note || '';
  $('#plan-editor').innerHTML = '';
  (item?.plans?.length ? item.plans : [{}]).forEach(addPlanRow);
  $('#item-dialog').showModal();
  setTimeout(()=>$('#item-title').focus(),0);
}

function setupItemEditor() {
  $('#add-item-btn').addEventListener('click',()=>openItemDialog());
  $('#add-plan-row').addEventListener('click',()=>addPlanRow());
  $('#item-form').addEventListener('submit',event=>{
    event.preventDefault();
    const existing = state.items.find(x=>x.id === $('#item-id').value);
    const plans = $$('.plan-edit-row', $('#plan-editor')).map((row,index)=>({id:String.fromCharCode(65+index),name:$('.plan-name-input',row).value.trim(),price:$('.plan-price-input',row).value.trim(),thought:$('.plan-thought-input',row).value.trim()})).filter(plan=>plan.name);
    const data = { id: existing?.id || uid(), category:$('#item-category').value.trim(), emoji:$('#item-emoji').value.trim() || '📦', title:$('#item-title').value.trim(), note:$('#item-note').value.trim(), done:existing?.done||false, picked:existing?.picked||'', plans };
    if (data.picked && !plans.some(plan=>plan.id===data.picked)) data.picked='';
    if (existing) state.items[state.items.indexOf(existing)] = data; else state.items.push(data);
    save(existing?'修改保存好啦':'已经加进清单啦'); $('#item-dialog').close(); renderList();
  });
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{
    activeFilter=button.dataset.filter; $$('.filter').forEach(node=>node.classList.toggle('is-active',node===button)); renderList();
  }));
}

function setupProfile() {
  $('#edit-profile-btn').addEventListener('click',()=>{
    $('#school-name-input').value=state.profile.school; $('#school-date-input').value=state.profile.date; $('#profile-dialog').showModal();
  });
  $('#profile-form').addEventListener('submit',event=>{
    event.preventDefault(); state.profile={school:$('#school-name-input').value.trim(),date:$('#school-date-input').value}; save('报到信息更新啦'); $('#profile-dialog').close(); updateCountdown();
  });
}

function renderDiaries() {
  const root=$('#diary-root');
  if(!state.diaries.length){root.innerHTML='<div class="diary-empty">📖 第一页还空着。<br>等我写下此刻的心情。</div>';return;}
  root.innerHTML=[...state.diaries].sort((a,b)=>b.date.localeCompare(a.date)).map(note=>`<article class="diary-card" data-id="${safeText(note.id)}"><div class="diary-card__meta"><span>${safeText(note.mood)}</span><time>${safeText(note.date)}</time></div><h3>${safeText(note.title)}</h3><p>${safeText(note.content)}</p><div class="diary-card__actions"><button class="text-btn edit-diary" type="button">编辑</button><button class="text-btn danger delete-diary" type="button">删除</button></div></article>`).join('');
  $$('.diary-card').forEach(card=>{
    $('.edit-diary',card).addEventListener('click',()=>openDiaryDialog(card.dataset.id));
    $('.delete-diary',card).addEventListener('click',()=>{if(confirm('要删除这篇随笔吗？')){state.diaries=state.diaries.filter(n=>n.id!==card.dataset.id);save('随笔已经删除');renderDiaries();}});
  });
}

function openDiaryDialog(id='') {
  const note=state.diaries.find(n=>n.id===id);
  $('#diary-dialog-title').textContent=note?'编辑这篇随笔':'写一篇新的'; $('#diary-id').value=note?.id||''; $('#diary-mood').value=note?.mood||'🌻 期待'; $('#diary-date').value=note?.date||new Date().toISOString().slice(0,10); $('#diary-title').value=note?.title||''; $('#diary-content').value=note?.content||''; $('#diary-dialog').showModal();
}

function setupDiary() {
  $('#add-diary-btn').addEventListener('click',()=>openDiaryDialog());
  $('#diary-form').addEventListener('submit',event=>{
    event.preventDefault(); const existing=state.diaries.find(n=>n.id===$('#diary-id').value); const note={id:existing?.id||uid(),mood:$('#diary-mood').value,date:$('#diary-date').value,title:$('#diary-title').value.trim(),content:$('#diary-content').value.trim()}; if(existing)state.diaries[state.diaries.indexOf(existing)]=note;else state.diaries.push(note); save('随笔收好啦'); $('#diary-dialog').close(); renderDiaries();
  });
}

function renderWishes(){
  $('#wish-text').textContent=state.wish; $('#wish-grid').innerHTML=state.wishes.map((wish,index)=>`<div class="wish-chip"><span>${['🌸','🍀','⭐','🍓','🌼'][index%5]}</span><span>${safeText(wish)}</span><button type="button" data-index="${index}" aria-label="删除这件期待">×</button></div>`).join('');
  $$('#wish-grid button').forEach(button=>button.addEventListener('click',()=>{state.wishes.splice(Number(button.dataset.index),1);save();renderWishes();}));
}

function setupWishes(){
  $('#edit-wish-btn').addEventListener('click',()=>{const next=prompt('写给即将出发的自己：',state.wish);if(next?.trim()){state.wish=next.trim();save('这段话保存好啦');renderWishes();}});
  $('#add-wish-btn').addEventListener('click',()=>{const next=prompt('我期待在大学里……');if(next?.trim()){state.wishes.push(next.trim());save('又多了一件期待的事');renderWishes();}});
}

function setupBackup(){
  $('#export-btn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='如一的大学准备手账-备份.json';a.click();URL.revokeObjectURL(url);toast('备份下载好啦');});
  $('#import-input').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{const next=JSON.parse(await file.text());if(!Array.isArray(next.items))throw new Error();localStorage.setItem(STORAGE_KEY,JSON.stringify(next));state=loadState();save('手账已经恢复');renderAll();}catch{alert('这个备份文件好像不对，请换一个试试。')}event.target.value='';});
}

function setupDialogs(){
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  $$('.pixel-dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
}

function renderAll(){renderList();renderDiaries();renderWishes();updateCountdown();}
function init(){setupTabs();setupItemEditor();setupProfile();setupDiary();setupWishes();setupBackup();setupDialogs();renderAll();clearInterval(countdownTimer);countdownTimer=setInterval(updateCountdown,1000);}
document.addEventListener('DOMContentLoaded',init);
