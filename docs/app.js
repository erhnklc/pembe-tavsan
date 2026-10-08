'use strict';

// Sesi hazır olan kelimeler (audio/<id>.mp3). Diğerleri tarayıcının sesiyle yavaşça okunur.
// Yeni ses eklemek için dosyayı audio/ klasörüne koyup id'yi buraya yazman yeterli.
const AUDIO_IDS = new Set(['cat', 'dog', 'apple', 'banana', 'red', 'blue', 'one', 'two']);

const color = (c) => ({ color: c });
const digit = (n) => ({ digit: n });

const TOPICS = [
  {
    id: 'animals', name: 'Hayvanlar', emoji: '🐱',
    items: [
      { id: 'cat', en: 'Cat', tr: 'Kedi', v: '🐱' },
      { id: 'dog', en: 'Dog', tr: 'Köpek', v: '🐶' },
      { id: 'rabbit', en: 'Rabbit', tr: 'Tavşan', v: '🐰' },
      { id: 'bird', en: 'Bird', tr: 'Kuş', v: '🐦' },
      { id: 'fish', en: 'Fish', tr: 'Balık', v: '🐟' },
      { id: 'cow', en: 'Cow', tr: 'İnek', v: '🐮' },
      { id: 'duck', en: 'Duck', tr: 'Ördek', v: '🦆' },
      { id: 'horse', en: 'Horse', tr: 'At', v: '🐴' },
      { id: 'elephant', en: 'Elephant', tr: 'Fil', v: '🐘' },
      { id: 'lion', en: 'Lion', tr: 'Aslan', v: '🦁' },
    ],
  },
  {
    id: 'colors', name: 'Renkler', emoji: '🎨',
    items: [
      { id: 'red', en: 'Red', tr: 'Kırmızı', v: color('#ff4d4d') },
      { id: 'blue', en: 'Blue', tr: 'Mavi', v: color('#4dabf7') },
      { id: 'yellow', en: 'Yellow', tr: 'Sarı', v: color('#ffd43b') },
      { id: 'green', en: 'Green', tr: 'Yeşil', v: color('#51cf66') },
      { id: 'pink', en: 'Pink', tr: 'Pembe', v: color('#ff8fc0') },
      { id: 'purple', en: 'Purple', tr: 'Mor', v: color('#9775fa') },
      { id: 'orange', en: 'Orange', tr: 'Turuncu', v: color('#ff922b') },
      { id: 'white', en: 'White', tr: 'Beyaz', v: color('#ffffff') },
    ],
  },
  {
    id: 'numbers', name: 'Sayılar', emoji: '🔢',
    items: [
      ['one', 'One', 'Bir'], ['two', 'Two', 'İki'], ['three', 'Three', 'Üç'],
      ['four', 'Four', 'Dört'], ['five', 'Five', 'Beş'], ['six', 'Six', 'Altı'],
      ['seven', 'Seven', 'Yedi'], ['eight', 'Eight', 'Sekiz'], ['nine', 'Nine', 'Dokuz'],
      ['ten', 'Ten', 'On'],
    ].map(([id, en, tr], i) => ({ id, en, tr, v: digit(i + 1) })),
  },
  {
    id: 'fruits', name: 'Meyveler', emoji: '🍎',
    items: [
      { id: 'apple', en: 'Apple', tr: 'Elma', v: '🍎' },
      { id: 'banana', en: 'Banana', tr: 'Muz', v: '🍌' },
      { id: 'strawberry', en: 'Strawberry', tr: 'Çilek', v: '🍓' },
      { id: 'grapes', en: 'Grapes', tr: 'Üzüm', v: '🍇' },
      { id: 'watermelon', en: 'Watermelon', tr: 'Karpuz', v: '🍉' },
      { id: 'cherry', en: 'Cherry', tr: 'Kiraz', v: '🍒' },
      { id: 'lemon', en: 'Lemon', tr: 'Limon', v: '🍋' },
      { id: 'pear', en: 'Pear', tr: 'Armut', v: '🍐' },
      { id: 'peach', en: 'Peach', tr: 'Şeftali', v: '🍑' },
      { id: 'orange-fruit', en: 'Orange', tr: 'Portakal', v: '🍊' },
    ],
  },
];

const $ = (id) => document.getElementById(id);
const screens = ['home', 'topic', 'learn', 'game', 'parent', 'result'];
const REPO_URL = 'https://github.com/erhnklc/pembe-tavsan';
const ROUNDS = 5;

let topic = null;
let cardIndex = 0;
let game = null;
let current = null;
let player = null;

/* ---------- Kayıt (yıldızlar) ---------- */
function loadStars() {
  try { return Number(localStorage.getItem('stars')) || 0; } catch { return 0; }
}
function saveStars(n) {
  try { localStorage.setItem('stars', String(n)); } catch { /* özel pencere vb. */ }
}
let totalStars = loadStars();
const renderStars = () => { $('starCount').textContent = totalStars; };

/* ---------- Ses ---------- */
function stopAudio() {
  if (player) { player.pause(); player = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function speakFallback(text) {
  if (!('speechSynthesis' in window)) return;
  const say = (delay) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.45;
    u.pitch = 1.25;
    setTimeout(() => speechSynthesis.speak(u), delay);
  };
  say(0);
}

function playFile(name) {
  stopAudio();
  player = new Audio(`audio/${name}.mp3`);
  player.play().catch(() => {});
}

function playWord(item) {
  if (AUDIO_IDS.has(item.id)) playFile(item.id);
  else { stopAudio(); speakFallback(item.en); }
}

/* ---------- Görsel ---------- */
function visualHTML(item) {
  const v = item.v;
  if (typeof v === 'string') return `<div class="visual">${v}</div>`;
  if (v.color) return `<div class="visual"><span class="swatch" style="background:${v.color}"></span></div>`;
  const dots = '⭐'.repeat(v.digit);
  return `<div class="visual"><span class="digit">${v.digit}</span><span class="count">${dots}</span></div>`;
}

/* ---------- Gezinme ---------- */
function show(name) {
  screens.forEach((s) => { $(s).hidden = s !== name; });
  $('backBtn').hidden = name === 'home';
  $('title').textContent = (name === 'home' || !topic) ? 'Pembe Tavşan' : `${topic.emoji} ${topic.name}`;
  if (name === 'home') $('title').textContent = 'Pembe Tavşan';
  if (name === 'parent') $('title').textContent = '👪 Ebeveyn';
  window.scrollTo(0, 0);
}

let screenNow = 'home';
function go(name) { screenNow = name; show(name); }

$('backBtn').onclick = () => {
  stopAudio();
  if (screenNow === 'topic' || screenNow === 'parent') go('home');
  else if (screenNow === 'learn' || screenNow === 'game' || screenNow === 'result') go('topic');
};

/* ---------- Ana ekran ---------- */
function buildHome() {
  const grid = $('topicGrid');
  grid.innerHTML = '';
  TOPICS.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'topic-btn';
    b.innerHTML = `<span class="emoji">${t.emoji}</span>${t.name}`;
    b.onclick = () => openTopic(t);
    grid.appendChild(b);
  });
}

$('startBtn').onclick = () => { playFile('hosgeldin'); burst('💖'); };

function openTopic(t) {
  topic = t;
  $('topicEmoji').textContent = t.emoji;
  go('topic');
}

$('learnBtn').onclick = () => { cardIndex = 0; go('learn'); renderCard(true); };
$('playBtn').onclick = startGame;
$('homeBtn').onclick = () => { topic = null; go('home'); };
$('againBtn').onclick = startGame;

/* ---------- Öğren ---------- */
function renderCard(autoplay) {
  const item = topic.items[cardIndex];
  $('learnVisual').innerHTML = visualHTML(item);
  $('learnEn').textContent = item.en;
  $('learnTr').textContent = item.tr;
  $('dots').innerHTML = topic.items.map((_, i) => `<i class="${i === cardIndex ? 'on' : ''}"></i>`).join('');
  if (autoplay) playWord(item);
}

const step = (d) => {
  const n = topic.items.length;
  cardIndex = (cardIndex + d + n) % n;
  renderCard(true);
};
$('nextCard').onclick = () => step(1);
$('prevCard').onclick = () => step(-1);
$('wordCard').onclick = () => playWord(topic.items[cardIndex]);
$('repeatLearn').onclick = () => playWord(topic.items[cardIndex]);

/* ---------- Oyun ---------- */
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

function startGame() {
  stopAudio();
  game = { round: 0, stars: 0, picked: shuffle(topic.items).slice(0, ROUNDS), missed: false };
  go('game');
  nextRound();
}

function renderProgress() {
  const total = game.picked.length;
  $('progress').textContent = Array.from({ length: total }, (_, i) =>
    i < game.stars ? '⭐' : (i < game.round ? '💔' : '🤍')).join('');
}

function nextRound() {
  if (game.round >= game.picked.length) return finishGame();
  current = game.picked[game.round];
  game.missed = false;
  $('promptWord').textContent = current.en;
  const others = shuffle(topic.items.filter((i) => i.id !== current.id)).slice(0, 2);
  const options = shuffle([current, ...others]);
  const box = $('choices');
  box.innerHTML = '';
  options.forEach((opt) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.innerHTML = visualHTML(opt);
    b.setAttribute('aria-label', opt.tr);
    b.onclick = () => choose(b, opt);
    box.appendChild(b);
  });
  renderProgress();
  setTimeout(() => playWord(current), 250);
}

function choose(btn, opt) {
  if (btn.classList.contains('good')) return;
  if (opt.id === current.id) {
    btn.classList.add('good');
    if (!game.missed) game.stars += 1;
    burst('💖');
    playFile('aferin');
    game.round += 1;
    renderProgress();
    setTimeout(nextRound, 1500);
  } else {
    game.missed = true;
    btn.classList.add('bad');
    setTimeout(() => btn.classList.remove('bad'), 450);
    setTimeout(() => playWord(current), 500);
  }
}

$('listenBtn').onclick = () => playWord(current);

function finishGame() {
  totalStars += game.stars;
  saveStars(totalStars);
  renderStars();
  $('resultStars').textContent = '⭐'.repeat(game.stars) || '🌸';
  go('result');
  burst('🎀');
  burst('💖');
  setTimeout(() => playFile('aferin'), 300);
}

/* ---------- Bozuk ses bildirimi ---------- */
// Bildirimler önce cihazda saklanır. Ebeveyn ekranından hazır doldurulmuş bir GitHub issue
// olarak gönderilir (sunucu ya da anahtar gerekmez).
const FILE_CLIPS = [
  ['hosgeldin', 'Merhaba cümlesi (Türkçe)'], ['aferin', 'Aferin sana (Türkçe)'],
  ...[...AUDIO_IDS].map((id) => [id, id]),
];

function loadReports() {
  try { return JSON.parse(localStorage.getItem('soundReports')) || []; } catch { return []; }
}
function saveReports(list) {
  try { localStorage.setItem('soundReports', JSON.stringify(list)); } catch { /* özel pencere vb. */ }
}

function reportKind(id) {
  return (AUDIO_IDS.has(id) || id === 'hosgeldin' || id === 'aferin') ? 'ses dosyası' : 'tarayıcı sesi (üretilmiş dosya yok)';
}

function toggleReport(id) {
  const list = loadReports();
  const at = list.findIndex((r) => r.id === id);
  if (at >= 0) list.splice(at, 1);
  else list.push({ id, kind: reportKind(id), t: new Date().toISOString().slice(0, 16).replace('T', ' ') });
  saveReports(list);
  return at < 0;
}

function flash(btn, text) {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 1200);
}

function flagCurrent(btn, id) {
  if (!id) return;
  flash(btn, toggleReport(id) ? '✅ Bildirildi' : '↩️ Geri alındı');
}
$('flagLearn').onclick = (e) => flagCurrent(e.currentTarget, topic && topic.items[cardIndex].id);
$('flagGame').onclick = (e) => flagCurrent(e.currentTarget, current && current.id);

function reportText() {
  const list = loadReports();
  if (!list.length) return '';
  const lines = list.map((r) => `- ${r.id} (${r.kind}) · ${r.t}`);
  return `Bozuk ses bildirimi:\n${lines.join('\n')}\n\nCihaz: ${navigator.userAgent}`;
}

function renderParent() {
  const reported = new Set(loadReports().map((r) => r.id));
  const clips = $('clipList');
  clips.innerHTML = '';
  FILE_CLIPS.forEach(([id, label]) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${label}</span>`;
    const play = document.createElement('button');
    play.textContent = '▶️';
    play.setAttribute('aria-label', `${label} dinle`);
    play.onclick = () => playFile(id);
    const flag = document.createElement('button');
    flag.textContent = reported.has(id) ? '🚩' : '⚑';
    flag.setAttribute('aria-label', `${label} bozuk`);
    flag.onclick = () => { toggleReport(id); renderParent(); };
    li.append(play, flag);
    clips.appendChild(li);
  });
  const list = loadReports();
  $('reportCount').textContent = list.length;
  $('reportList').innerHTML = list.length
    ? list.map((r) => `<li><span>${r.id} <small>${r.kind}</small></span></li>`).join('')
    : '<li><span>Henüz bildirim yok</span></li>';
}

function openParent() { stopAudio(); renderParent(); $('parentMsg').textContent = ''; go('parent'); }

// Çocuklar yanlışlıkla girmesin diye basılı tutarak açılır.
let holdTimer = null;
const link = $('parentLink');
link.addEventListener('pointerdown', () => { holdTimer = setTimeout(openParent, 1200); });
['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => link.addEventListener(ev, () => clearTimeout(holdTimer)));
link.addEventListener('contextmenu', (e) => e.preventDefault());

$('sendReports').onclick = () => {
  const body = reportText();
  if (!body) { $('parentMsg').textContent = 'Önce bozuk bir sesi 🚩 ile işaretle.'; return; }
  const url = `${REPO_URL}/issues/new?title=${encodeURIComponent('Bozuk ses bildirimi')}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank', 'noopener');
  $('parentMsg').textContent = 'GitHub açıldı. "Submit new issue" de, sonra buraya dönüp Temizle\'ye bas.';
};

$('copyReports').onclick = async () => {
  const body = reportText();
  if (!body) { $('parentMsg').textContent = 'Önce bozuk bir sesi 🚩 ile işaretle.'; return; }
  try { await navigator.clipboard.writeText(body); $('parentMsg').textContent = 'Kopyalandı.'; }
  catch { $('parentMsg').textContent = 'Kopyalanamadı. Metni elle seçip kopyala.'; }
};

$('clearReports').onclick = () => { saveReports([]); renderParent(); $('parentMsg').textContent = 'Temizlendi.'; };

/* ---------- Efekt ---------- */
function burst(emoji) {
  const fx = $('fx');
  for (let i = 0; i < 16; i += 1) {
    const s = document.createElement('span');
    s.textContent = emoji;
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    s.style.fontSize = `${24 + Math.random() * 24}px`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 2400);
  }
}

/* ---------- Başlat ---------- */
buildHome();
renderStars();
go('home');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
