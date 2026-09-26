(() => {
  'use strict';
  const questions = window.PUZZLES;
  const key = 'interview-puzzles-progress-v1';
  const $ = id => document.getElementById(id);
  let mastered = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(stored)) mastered = new Set(stored.filter(id => questions.some(q => q.id === id)));
  } catch { $('notice').textContent = '无法读取本机进度，本次仍可正常练习。'; }
  let category = '全部';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = ['全部', ...new Set(questions.map(q => q.category))];
  $('categories').innerHTML = categories.map(c => `<button type="button" data-category="${escape(c)}" aria-pressed="${c === category}">${escape(c)}</button>`).join('');
  function selected() {
    const term = $('search').value.trim().toLowerCase();
    return questions.filter(q => (category === '全部' || q.category === category) && (!$('priority').checked || q.priority) && (!$('pending').checked || !mastered.has(q.id)) && (!term || `${q.title} ${q.question} ${q.category}`.toLowerCase().includes(term)));
  }
  function updateProgress() {
    $('learned').textContent = mastered.size;
    $('progress').value = mastered.size;
    $('progress').max = questions.length;
    $('total').textContent = questions.length;
    $('progress').textContent = `${mastered.size} / ${questions.length}`;
  }
  function render() {
    const list = selected();
    $('count').textContent = `${list.length} 道题目`;
    $('empty').hidden = !!list.length;
    $('random').disabled = !list.length;
    $('questions').innerHTML = list.map(q => `<article class="card" id="q${q.id}"><div class="card-top"><span class="number">${String(q.id).padStart(2,'0')}</span><span>${escape(q.category)}</span>${q.priority ? '<span class="star">★ 优先练习</span>' : ''}</div><h3 tabindex="-1">${escape(q.title)}</h3><p class="question">${escape(q.question)}</p><details><summary>给我一点提示</summary><p class="explanation">${escape(q.hint)}</p></details><details class="answer"><summary>查看解答与推导</summary><p class="explanation">${escape(q.answer)}</p></details><details><summary>面试官可能追问</summary><p class="explanation">${escape(q.followup)}</p></details><div class="card-bottom"><button class="master" data-id="${q.id}" aria-pressed="${mastered.has(q.id)}">${mastered.has(q.id) ? '✓ 已掌握' : '标记为已掌握'}</button><a class="permalink" href="#q${q.id}" aria-label="第 ${q.id} 题链接">题目链接 ↗</a></div></article>`).join('');
    updateProgress();
  }
  $('categories').addEventListener('click', e => {
    const button = e.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    $('categories').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  });
  ['search','priority','pending'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('questions').addEventListener('click', e => {
    const button = e.target.closest('[data-id]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (mastered.has(id)) mastered.delete(id); else mastered.add(id);
    try { localStorage.setItem(key, JSON.stringify([...mastered])); }
    catch { $('notice').textContent = '当前浏览器无法保存进度；本次标记有效，刷新后可能丢失。'; }
    updateProgress();
    if ($('pending').checked) { render(); return; }
    button.setAttribute('aria-pressed', String(mastered.has(id)));
    button.textContent = mastered.has(id) ? '✓ 已掌握' : '标记为已掌握';
  });
  $('random').addEventListener('click', () => {
    const list = selected();
    if (!list.length) return;
    const q = list[Math.floor(Math.random()*list.length)];
    document.querySelectorAll('.spotlight').forEach(el => el.classList.remove('spotlight'));
    const card = $(`q${q.id}`);
    card.querySelectorAll('details').forEach(el => { el.open = false; });
    card.classList.add('spotlight');
    history.replaceState(null, '', `#q${q.id}`);
    card.scrollIntoView({block:'start'});
    card.querySelector('h3').focus({preventScroll:true});
  });
  render();
  if (/^#q\d+$/.test(location.hash)) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
})();
