import { WORDS, STORIES } from './data.js';
import { buildPool, parseWords, normalizeAnswer, wrapText, shuffle, summarize } from './core.js';

const $ = id => document.getElementById(id);
const KEY = 'reading-lab-v1';
const LABELS = {flash:'闪视记忆',read:'故事滚读',grid:'视线寻踪'};
const state = { words:[], history:[], customStory:'' };
let view='flash', flash=null, flashTimer=0, read=null, readFrame=0, grid=null, gridFrame=0;
function notice(message) { $('notice').textContent=message; $('notice').hidden=!message; }
function node(tag,text,className) { const el=document.createElement(tag); if(text!==undefined)el.textContent=text; if(className)el.className=className; return el; }
function action(text,handler,cls='primary') { const el=node('button',text,cls); el.type='button'; el.addEventListener('click',handler); return el; }
function checked(id) { return [...$(id).querySelectorAll('input:checked')].map(el=>el.value); }
function safeHistory(items) { return Array.isArray(items)?items.filter(x=>x&&Object.hasOwn(LABELS,x.mode)&&Number.isFinite(x.at)&&typeof x.summary==='string').slice(0,100).map(x=>({mode:x.mode,at:x.at,summary:x.summary.slice(0,300),retelling:typeof x.retelling==='string'?x.retelling.slice(0,20000):''})):[]; }
function persist() { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { notice('浏览器未能保存数据（空间不足或禁用了存储）。本次仍可练习，请用“导出我的数据”备份。'); } }
try { const saved=JSON.parse(localStorage.getItem(KEY)||'null'); if(saved&&typeof saved==='object') { state.words=parseWords(JSON.stringify({words:saved.words||[]})).words; state.history=safeHistory(saved.history); state.customStory=typeof saved.customStory==='string'?saved.customStory.slice(0,20000):''; } } catch { notice('本机存储无法读取，已启用临时练习。可导出数据保存。'); }
function record(mode,summary,extra={}) { state.history.unshift({mode,summary,at:Date.now(),...extra}); state.history=state.history.slice(0,100); persist(); renderLibrary(); }
function renderLibrary() {
  $('word-count').textContent=state.words.length;
  $('word-preview').replaceChildren(...state.words.slice(-40).map(w=>node('span',w.text)));
  $('history').replaceChildren(...state.history.slice(0,12).map(item=>{const row=node('div',`${LABELS[item.mode]} · ${item.summary}`,'history-item');row.append(node('small',new Date(item.at).toLocaleString('zh-CN')));if(item.retelling){const detail=node('details');detail.append(node('summary','查看我的复述'),node('p',item.retelling));row.append(detail);}return row;}));
  if(!state.history.length)$('history').append(node('p','还没有记录。从一次小练习开始。','history-empty'));
  $('today-count').textContent=`${state.history.filter(x=>new Date(x.at).toDateString()===new Date().toDateString()).length} 次`;
}
function lockFlash(locked) { document.querySelectorAll('#view-flash .settings input,#view-flash .settings select').forEach(el=>el.disabled=locked); }
function poolInfo() {
  const level=Number($('level').value),types=checked('types'),categories=checked('categories');
  $('level-hint').textContent=['','中文 1–2 字 / 数字 2 位 / 英文 2–4 字母','中文 3–4 字 / 数字 4 位 / 英文 5–7 字母','中文 5–8 字 / 数字 6 位 / 英文 8–10 字母','中文 9–24 字 / 数字 10 位 / 英文 11–40 字符（含短语）'][level]+'。各语言为游戏档位，并非严格等难。';
  const pool=buildPool([...WORDS,...state.words],types,categories,level);
  const numbers=pool.filter(w=>w.type==='number').length;
  $('pool-info').textContent=`当前可用 ${pool.filter(w=>w.type!=='number').length} 条词语${types.includes('number')?numbers?` + ${numbers} 条导入数字`:' + 随机数字':''}`;
  return pool;
}
function resetFlash() {
  clearTimeout(flashTimer);flash=null;lockFlash(false);
  $('flash-idle').hidden=false;$('flash-stimulus').hidden=true;$('flash-result').hidden=true;$('flash-answer').hidden=true;$('flash-feedback').hidden=true;
  $('flash-stage').style.minHeight='';$('flash-status').textContent='准备就绪';$('flash-counter').textContent='一眼捕捉 · 整体记忆';$('flash-progress').style.width='0%';
}
function startFlash(retry) {
  clearTimeout(flashTimer);
  const types=checked('types'),categories=checked('categories'),level=Number($('level').value);
  if(!types.length){notice('至少选择一种内容类型。');return;}
  const pool=poolInfo(),available=types.filter(type=>type==='number'||pool.some(w=>w.type===type));
  if(!available.length){notice('这个难度与主题组合没有词语，请换一个主题，或导入相应长度的词库。');return;}
  const missing=types.filter(type=>!available.includes(type));
  notice(missing.length?'部分所选类型在当前主题、难度下没有词语，本组只使用有内容的类型。':'');
  const total=Number($('rounds').value),bags={};
  for(const type of available) bags[type]=shuffle(pool.filter(w=>w.type===type));
  const queues={};
  const items=retry||Array.from({length:total},(_,i)=>{
    const type=available[i%available.length];
    if(type==='number'&&!bags.number.length){const length=[0,2,4,6,10][level];return {text:Array.from({length},()=>Math.floor(Math.random()*10)).join(''),type,level};}
    if(!queues[type]?.length)queues[type]=shuffle(bags[type]);
    return queues[type].pop();
  });
  flash={items:shuffle(items),index:0,results:[],phase:'ready',exposure:Number($('exposure').value),level};
  lockFlash(true);$('flash-idle').hidden=true;$('flash-result').hidden=true;nextFlash();
}
function fitStimulus() { const el=$('flash-stimulus');el.style.fontSize='';el.style.letterSpacing=[...el.textContent].length>12?'0':'2px';el.style.transform='';let size=parseFloat(getComputedStyle(el).fontSize);const limit=$('flash-stage').clientWidth-48;while(el.scrollWidth>limit&&size>12){size-=1;el.style.fontSize=`${size}px`;}if(el.scrollWidth>limit)el.style.transform=`scale(${limit/el.scrollWidth})`; }
function nextFlash() {
  if(!flash)return;
  if(flash.index>=flash.items.length){finishFlash();return;}
  const current=flash;current.phase='countdown';
  $('flash-answer').hidden=true;$('flash-feedback').hidden=true;$('flash-stimulus').hidden=false;
  $('flash-stage').style.minHeight='330px';$('flash-counter').textContent=`${current.index+1} / ${current.items.length}`;
  $('flash-stage').scrollIntoView({block:'center',behavior:'instant'});
  $('flash-status').textContent='注视中心';$('flash-stimulus').textContent='＋';$('flash-stimulus').style.fontSize='48px';$('flash-stimulus').style.transform='';
  flashTimer=setTimeout(()=>{
    if(flash!==current)return;
    current.phase='show';$('flash-status').textContent='捕捉整体';$('flash-stimulus').textContent=current.items[current.index].text;fitStimulus();
    // Two animation frames ensure the stimulus has actually reached a paint before timing it.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(flash!==current||current.phase!=='show')return;
      flashTimer=setTimeout(()=>{if(flash!==current)return;current.phase='answer';$('flash-stimulus').textContent='· · ·';$('flash-status').textContent='回忆刚刚看到的内容';$('flash-answer').hidden=false;$('answer').value='';$('answer').focus({preventScroll:true});},current.exposure);
    }));
  },800);
}
function submitFlash(skip=false) {
  if(!flash||flash.phase!=='answer')return;
  const answer=$('answer').value;
  if(!skip&&!answer.trim()){$('answer').focus();return;}
  const item=flash.items[flash.index],correct=!skip&&normalizeAnswer(answer)===normalizeAnswer(item.text);
  flash.results.push({item,answer,correct});flash.index++;flash.phase='feedback';
  $('flash-answer').hidden=true;$('flash-stimulus').hidden=true;$('flash-feedback').hidden=false;
  $('flash-feedback').replaceChildren(node('strong',correct?'✓ 记住了！':`再看一眼：${item.text}`),node('span',correct?'保持这个节奏。':skip?'没关系，下一题再试试。':`你的输入：${answer}`),document.createElement('br'),action(flash.index===flash.items.length?'查看本组成绩':'下一题 →',nextFlash));
  $('flash-feedback').querySelector('button').focus({preventScroll:true});$('flash-progress').style.width=`${flash.index/flash.items.length*100}%`;
  $('flash-status').textContent=correct?'回答正确':'一起校对';
}
function finishFlash(partial=false) {
  clearTimeout(flashTimer);if(!flash)return;
  if(!flash.results.length){resetFlash();return;}
  const current=flash,{correct,total,accuracy}=summarize(current.results),wrong=current.results.filter(x=>!x.correct).map(x=>x.item);
  flash=null;lockFlash(false);$('flash-stimulus').hidden=true;$('flash-answer').hidden=true;$('flash-feedback').hidden=true;$('flash-result').hidden=false;
  $('flash-result').replaceChildren(node('p',partial?'这一小步，也算数。':'一组完成，把目光放远一点。','eyebrow'),node('div',`${accuracy}%`,'score'),node('h2',accuracy>=80?'稳稳记住，慢慢加速。':'给记忆多一点时间。'),node('p',`${correct} / ${total} 题正确 · Lv.${current.level} · ${current.exposure} ms`),action('再练一组',()=>startFlash()));
  if(wrong.length)$('flash-result').append(document.createTextNode(' '),action(`重练 ${wrong.length} 道错题`,()=>startFlash(wrong),'secondary'));
  record('flash',`Lv.${current.level} · ${current.exposure} ms · ${correct}/${total} 正确${partial?' · 提前结束':''}`);$('flash-status').textContent='本组完成';
}
$('flash-start').onclick=()=>startFlash();$('flash-answer').onsubmit=e=>{e.preventDefault();submitFlash();};$('flash-skip').onclick=()=>submitFlash(true);$('flash-stop').onclick=()=>finishFlash(true);
document.querySelectorAll('#view-flash .settings input,#view-flash .settings select').forEach(el=>el.addEventListener('change',poolInfo));
$('exposure').oninput=()=>{$('exposure-value').textContent=`${$('exposure').value} ms`;};

// Story playback uses elapsed foreground time, not a drifting setInterval counter.
for(const story of STORIES){const option=node('option',story.title);option.value=story.id;$('story-select').append(option);}
const customOption=node('option','＋ 导入自己的文章');customOption.value='custom';$('story-select').append(customOption);$('custom-story').value=state.customStory;
function selectedStory() {return $('story-select').value==='custom'?{id:'custom',title:'我的故事',text:state.customStory,keypoints:'复述核对：人物、目标、阻碍、行动和结果。',questions:[]}:STORIES.find(x=>x.id===$('story-select').value);}
function lockRead(locked) {for(const id of ['story-select','line-width','custom-story','story-file','save-story'])$(id).disabled=locked;}
function setupStory() {
  cancelAnimationFrame(readFrame);read=null;lockRead(false);$('read-start').disabled=false;$('read-pause').disabled=true;$('read-pause').textContent='暂停';$('recall').hidden=true;$('reader-window').hidden=false;
  $('read-finish').disabled=false;$('read-finish').textContent='保存复述与成绩';$('retelling').value='';$('read-status').textContent='准备阅读';$('read-percent').textContent='0%';$('read-progress').style.width='0%';
  const story=selectedStory();$('story-title').textContent=story.title;$('custom-story-fields').hidden=story.id!=='custom';
  const lines=wrapText(story.text,Number($('line-width').value));
  $('reader-lines').replaceChildren(...lines.map(text=>node('div',text,'reading-line')));$('reader-lines').style.transform='translateY(0)';
  $('story-meta').textContent=story.text?`${[...story.text.replace(/\s/g,'')].length} 字 · 约 ${Math.ceil([...story.text.replace(/\s/g,'')].length/Number($('read-speed').value)*60)} 秒 · ${story.id==='custom'?'自定义文章':'本站原创故事'}`:'粘贴或导入一篇文章，然后保存。';
  fitReader();
}
function fitReader() {
  const el=$('reader-lines'),width=$('reader-window').clientWidth-14;if(width<=0)return;
  // Narrow screens use shorter rows instead of shrinking an entire story into tiny type.
  const requested=Number($('line-width').value),effective=Math.max(6,Math.min(requested,Math.floor(width/18)-1));
  const lines=wrapText((read?.story||selectedStory()).text,effective);
  el.replaceChildren(...lines.map(text=>node('div',text,'reading-line')));el.style.fontSize='';
  let size=parseFloat(getComputedStyle(el).fontSize);while([...el.children].some(row=>row.scrollWidth>width)&&size>16){size-=1;el.style.fontSize=`${size}px`;}
  if(read&&!read.done){read.counts=lines.map(text=>Math.max(1,[...text.replace(/\s/g,'')].length));read.total=read.counts.reduce((a,b)=>a+b,0);paintRead();}
}
function paintRead() {
  if(!read)return;
  const story=read.story,ratio=Math.min(1,read.units/read.total);
  // Each line's duration is proportional to its character count, including the short final line.
  let offset=0,remaining=read.units,completed=0;
  for(const count of read.counts){if(remaining>=count){remaining-=count;offset+=50;completed++;}else{offset+=remaining/count*50;break;}}
  $('reader-lines').style.transform=`translateY(-${offset}px)`;
  [...$('reader-lines').children].forEach((el,i)=>el.classList.toggle('read',i<completed));
  $('read-percent').textContent=`${Math.round(ratio*100)}%`;$('read-progress').style.width=`${ratio*100}%`;
  if(ratio>=1){read.running=false;read.done=true;$('read-pause').disabled=true;$('read-status').textContent='读完了，试着复述';$('reader-window').hidden=true;showRecall(story);}
}
function readTick(now) {
  if(!read?.running)return;
  const delta=Math.min(now-read.last,250);read.last=now;read.elapsed+=delta;read.units+=delta*Number($('read-speed').value)/60000;paintRead();if(read.running)readFrame=requestAnimationFrame(readTick);
}
function startRead() {
  const story=selectedStory();if([...story.text.trim()].length<30){notice('请先保存至少 30 字的自定义文章。');return;}
  notice('');setupStory();
  const counts=[...$('reader-lines').children].map(el=>Math.max(1,[...el.textContent.replace(/\s/g,'')].length));
  read={story,counts,total:counts.reduce((a,b)=>a+b,0),units:0,elapsed:0,last:performance.now(),running:true,done:false,saved:false};
  lockRead(true);$('read-start').disabled=true;$('read-pause').disabled=false;$('read-status').textContent='跟着阅读线，读懂故事';$('reader-window').scrollIntoView({block:'center',behavior:'instant'});readFrame=requestAnimationFrame(readTick);
}
function pauseRead() {if(!read||read.done)return;read.running=!read.running;$('read-pause').textContent=read.running?'暂停':'继续';$('read-status').textContent=read.running?'跟着阅读线，读懂故事':'已暂停';cancelAnimationFrame(readFrame);if(read.running){read.last=performance.now();readFrame=requestAnimationFrame(readTick);}}
function showRecall(story) {
  $('recall').hidden=false;$('quiz').replaceChildren();$('story-source').textContent=story.text;$('story-keypoints').textContent=Array.isArray(story.keypoints)?story.keypoints.join(' → '):story.keypoints;
  $('recall').querySelector('details').open=false;
  story.questions.forEach((q,i)=>{const field=node('fieldset',undefined,'quiz-question');field.append(node('legend',`${i+1}. ${q.prompt}`));q.options.forEach((text,j)=>{const label=node('label'),radio=document.createElement('input');radio.type='radio';radio.name=`question-${i}`;radio.value=j;label.append(radio,document.createTextNode(text));field.append(label);});$('quiz').append(field);});
}
$('read-finish').onclick=()=>{
  if(!read?.done||read.saved)return;
  const retelling=$('retelling').value.trim(),questions=read.story.questions,answers=questions.map((_,i)=>document.querySelector(`input[name="question-${i}"]:checked`));
  if(!retelling){notice('先写下几句话复述故事，再保存本次练习。');$('retelling').focus();return;}
  if(answers.some(x=>!x)){notice('还有理解题未作答，完成后再保存。');return;}
  const correct=answers.filter((el,i)=>Number(el.value)===questions[i].answer).length,speed=Math.round(read.total/(read.elapsed/60000));
  record('read',`${read.story.title} · ${speed} 字/分钟${questions.length?` · 理解 ${correct}/${questions.length}`:' · 自评复述'}`,{retelling});
  questions.forEach((q,i)=>{$('quiz').children[i].append(node('p',`${Number(answers[i].value)===q.answer?'✓ 正确':'再核对一下'} · ${q.options[q.answer]}`,'hint'));});
  read.saved=true;$('read-finish').disabled=true;$('read-finish').textContent='✓ 已保存';notice('本次故事练习已保存。打开原文与要点，看看哪些因果关系还可以补充。');
};
$('read-start').onclick=startRead;$('read-pause').onclick=pauseRead;$('read-reset').onclick=setupStory;
$('story-select').onchange=setupStory;$('line-width').onchange=setupStory;
$('mask').onchange=()=>{$('reader-window').className=`reader-window mask-${$('mask').value}`;};
$('read-speed').oninput=()=>{$('read-speed-value').textContent=`${$('read-speed').value} 字/分钟`;if(!read)setupStory();};
$('save-story').onclick=()=>{const text=$('custom-story').value.trim();if([...text].length<30){notice('文章至少需要 30 字。');return;}state.customStory=text.slice(0,20000);persist();setupStory();notice('文章已保存在当前浏览器。');};
$('story-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw new Error('文章文件请控制在 1 MB 内。');const text=(await file.text()).trim();if(text.length>20000||[...text].length<30)throw new Error('文章需要 30～20000 字。');$('custom-story').value=text;state.customStory=text;persist();setupStory();notice('文章已导入。');}catch(error){notice(error.message);}finally{e.target.value='';}};

function setupGrid() {cancelAnimationFrame(gridFrame);grid=null;const size=Number($('grid-size').value);$('number-grid').style.gridTemplateColumns=`repeat(${size},1fr)`;$('number-grid').replaceChildren(...shuffle(Array.from({length:size*size},(_,i)=>i+1)).map(number=>{const btn=action(String(number),()=>pickNumber(number,btn),'');btn.disabled=true;return btn;}));$('grid-next').textContent='1';$('grid-time').textContent='0.0 s';$('grid-errors').textContent='0';$('grid-status').textContent='按顺序，慢慢来';$('grid-start').textContent='开始寻找 ↗';}
function gridTick(now) {if(!grid?.running)return;grid.elapsed+=now-grid.last;grid.last=now;$('grid-time').textContent=`${(grid.elapsed/1000).toFixed(1)} s`;gridFrame=requestAnimationFrame(gridTick);}
function startGrid() {
  if(grid&&!grid.running&&!grid.done){grid.running=true;grid.last=performance.now();$('number-grid').querySelectorAll('button:not(.found)').forEach(el=>el.disabled=false);$('grid-start').textContent='重新开始';$('grid-status').textContent='寻找下一个数字';gridFrame=requestAnimationFrame(gridTick);return;}
  setupGrid();grid={running:true,done:false,next:1,total:Number($('grid-size').value)**2,errors:0,elapsed:0,last:performance.now()};$('number-grid').querySelectorAll('button').forEach(el=>el.disabled=false);$('grid-start').textContent='重新开始';$('grid-status').textContent='寻找下一个数字';$('number-grid').scrollIntoView({block:'center',behavior:'instant'});gridFrame=requestAnimationFrame(gridTick);
}
function pickNumber(number,btn) {if(!grid?.running)return;if(number!==grid.next){grid.errors++;$('grid-errors').textContent=grid.errors;btn.classList.add('miss');setTimeout(()=>btn.classList.remove('miss'),250);return;}btn.classList.add('found');btn.disabled=true;grid.next++;$('grid-next').textContent=grid.next<=grid.total?grid.next:'完成';if(grid.next>grid.total){grid.elapsed+=performance.now()-grid.last;grid.running=false;grid.done=true;cancelAnimationFrame(gridFrame);$('grid-time').textContent=`${(grid.elapsed/1000).toFixed(1)} s`;$('grid-status').textContent='全部找到，专注完成！';record('grid',`${$('grid-size').value}×${$('grid-size').value} · ${(grid.elapsed/1000).toFixed(1)} 秒 · 点错 ${grid.errors} 次`);}}
function pauseGrid() {if(!grid?.running)return;grid.elapsed+=performance.now()-grid.last;grid.running=false;cancelAnimationFrame(gridFrame);$('number-grid').querySelectorAll('button').forEach(el=>el.disabled=true);$('grid-start').textContent='继续寻找';$('grid-status').textContent='已暂停';}
$('grid-start').onclick=startGrid;$('grid-size').onchange=setupGrid;

function download(filename,data) {const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=node('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function importWords(raw) {
  let backup=null;try{const obj=JSON.parse(raw);if(obj?.version===1&&Array.isArray(obj.words))backup=obj;}catch{}
  const bytes=new Blob([raw]).size;
  if(bytes>(backup?12000000:1000000))throw new Error(backup?'备份不能超过 12 MB。':'词库不能超过 1 MB。');
  const {words,rejected}=parseWords(raw,$('import-type').value,$('import-category').value);
  if(!words.length&&!backup){$('import-result').textContent=`没有可导入的条目。${rejected.length} 条不符合所选类型或长度要求。`;return;}
  const keys=new Set(state.words.map(x=>`${x.type}:${x.category}:${normalizeAnswer(x.text)}`));let added=0,duplicate=0,overflow=0;
  for(const word of words){const key=`${word.type}:${word.category}:${normalizeAnswer(word.text)}`;if(keys.has(key)){duplicate++;continue;}if(state.words.length>=5000){overflow++;continue;}keys.add(key);state.words.push(word);added++;}
  if(backup){const oldKeys=new Set(state.history.map(x=>`${x.mode}:${x.at}`));state.history=[...state.history,...safeHistory(backup.history).filter(x=>!oldKeys.has(`${x.mode}:${x.at}`))].sort((a,b)=>b.at-a.at).slice(0,100);if(typeof backup.customStory==='string'&&backup.customStory.trim()){state.customStory=backup.customStory.slice(0,20000);$('custom-story').value=state.customStory;}}
  persist();renderLibrary();poolInfo();$('word-paste').value='';$('import-result').textContent=`已导入 ${added} 条；跳过 ${duplicate} 条重复、${rejected.length} 条无效${overflow?`、${overflow} 条超出容量`:''}。${backup?'备份中的文章与记录也已恢复。':'在闪视训练中勾选对应主题即可使用。'}`;
}
$('word-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>12000000)throw new Error('文件不能超过 12 MB。');importWords(await file.text());}catch(error){$('import-result').textContent=`导入失败：${error.message}`;}finally{e.target.value='';}};
$('import-paste').onclick=()=>{try{const raw=$('word-paste').value;if(raw.length>12000000)throw new Error('粘贴内容过大，请控制在 12 MB 内。');importWords(raw);}catch(error){$('import-result').textContent=`导入失败：${error.message}`;}};
$('sample-download').onclick=()=>download('一目词库示例.json',[{text:'缓存',type:'zh',category:'computer'},{text:'春暖花开',type:'zh',category:'school'},{text:'token',type:'en',category:'ai'},{text:'123456',type:'number',category:'custom'}]);
$('export-data').onclick=()=>download('一目阅读实验室-备份.json',{version:1,...state});
$('clear-words').onclick=()=>{if(!state.words.length)return;if(!confirm('清空所有导入词语？内置词库和训练记录会保留。'))return;state.words=[];persist();renderLibrary();poolInfo();$('import-result').textContent='导入词库已清空。';};
function suspendFlash() {if(!flash||!['show','countdown'].includes(flash.phase))return;clearTimeout(flashTimer);flash.phase='paused';$('flash-stimulus').hidden=true;$('flash-feedback').hidden=false;$('flash-feedback').replaceChildren(node('strong','已暂停，本题不计分。'),action('重新显示本题',nextFlash));$('flash-status').textContent='已暂停';}
document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{
  const next=tab.dataset.view;if(next===view)return;
  suspendFlash();if(read?.running)pauseRead();pauseGrid();view=next;
  document.querySelectorAll('.tab').forEach(el=>{const active=el===tab;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==`view-${view}`);notice('');if(view==='library')renderLibrary();if(view==='read'){if(!read)setupStory();else fitReader();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){suspendFlash();if(read?.running)pauseRead();pauseGrid();}});
window.addEventListener('resize',()=>{fitReader();if(flash?.phase==='show')fitStimulus();});
poolInfo();renderLibrary();setupStory();setupGrid();
