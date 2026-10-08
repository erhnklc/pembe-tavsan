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


/* ---------- Şirin yıldız ve kalpler (yüzlü, yanaklı) ---------- */
const FACE = '<ellipse cx="41" cy="52" rx="3.6" ry="4.6" fill="#7a2a52"/><ellipse cx="59" cy="52" rx="3.6" ry="4.6" fill="#7a2a52"/>' +
  '<circle cx="42.2" cy="50.4" r="1.3" fill="#fff"/><circle cx="60.2" cy="50.4" r="1.3" fill="#fff"/>' +
  '<path d="M45 60 q5 5.5 10 0" stroke="#7a2a52" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  '<circle cx="33" cy="60" r="5.5" fill="#ff8fb8" opacity=".55"/><circle cx="67" cy="60" r="5.5" fill="#ff8fb8" opacity=".55"/>';

function starSVG(size = 44) {
  return `<svg class="kawaii" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">` +
    '<path d="M50 11 L61 37 L89 39 L67 57 L74 85 L50 70 L26 85 L33 57 L11 39 L39 37 Z" fill="#ffd84d" stroke="#ffd84d" stroke-width="12" stroke-linejoin="round"/>' +
    '<path d="M50 11 L61 37 L89 39 L67 57 L74 85 L50 70 L26 85 L33 57 L11 39 L39 37 Z" fill="none" stroke="#ffb703" stroke-width="3" stroke-linejoin="round" opacity=".35" transform="translate(0 2)"/>' +
    '<ellipse cx="34" cy="31" rx="5" ry="3" fill="#fff" opacity=".8" transform="rotate(-30 34 31)"/>' + FACE + '</svg>';
}

function heartSVG(kind = 'full', size = 44) {
  const body = 'M50 88 C8 60 4 30 27 21 C40 16 48 24 50 31 C52 24 60 16 73 21 C96 30 92 60 50 88 Z';
  if (kind === 'empty') {
    return `<svg class="kawaii" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">` +
      `<path d="${body}" fill="#fff" fill-opacity=".75" stroke="#ffb3d1" stroke-width="6" stroke-dasharray="3 9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  return `<svg class="kawaii" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">` +
    `<path d="${body}" fill="#ff7eb6" stroke="#ff7eb6" stroke-width="6" stroke-linejoin="round"/>` +
    '<ellipse cx="29" cy="33" rx="6" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-35 29 33)"/>' + FACE + '</svg>';
}

/* ---------- Yanlış cevap sesi: yumuşak, iki notalık "bu-bum" ---------- */
let audioCtx = null;
function playWrong() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime + 0.02;
    [[392, 0], [311, 0.2]].forEach(([freq, at]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + at);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.32);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0 + at);
      osc.stop(t0 + at + 0.34);
    });
  } catch { /* ses desteklenmiyorsa sessiz geç */ }
}

/* ---------- Kayıt (yıldızlar) ---------- */
function loadStars() {
  try { return Number(localStorage.getItem('stars')) || 0; } catch { return 0; }
}
function saveStars(n) {
  try { localStorage.setItem('stars', String(n)); } catch { /* özel pencere vb. */ }
}
let totalStars = loadStars();
const renderStars = () => { $('starIcon').innerHTML = starSVG(30); $('starCount').textContent = totalStars; };

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

// Aynı kelime her çalındığında kelimenin kendisi farklı bir animasyon yapar: tekrar edildiği anlaşılır.
const WORD_ANIMS = ['w-bounce', 'w-jelly', 'w-flip', 'w-rainbow'];
let echoCount = 0;
const wordEl = () => $(screenNow === 'game' ? 'promptWord' : 'learnEn');

function resetEcho() {
  echoCount = 0;
  ['promptWord', 'learnEn'].forEach((id) => $(id).classList.remove(...WORD_ANIMS));
}

function bumpEcho() {
  const el = wordEl();
  const cls = WORD_ANIMS[echoCount % WORD_ANIMS.length];
  echoCount += 1;
  el.classList.remove(...WORD_ANIMS);
  void el.offsetWidth; // animasyonu baştan başlat
  el.classList.add(cls);
}

function playWord(item) {
  bumpEcho();
  if (AUDIO_IDS.has(item.id)) playFile(item.id);
  else { stopAudio(); speakFallback(item.en); }
}

/* ---------- Görsel ---------- */
function visualHTML(item) {
  const v = item.v;
  if (typeof v === 'string') return `<div class="visual">${v}</div>`;
  if (v.color) return `<div class="visual"><span class="swatch" style="background:${v.color}"></span></div>`;
  const dots = starSVG(22).repeat(v.digit);
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
  resetEcho();
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
  game = { round: 0, stars: 0, results: [], picked: shuffle(topic.items).slice(0, ROUNDS), missed: false };
  go('game');
  nextRound();
}

function renderProgress(pop = false) {
  const total = game.picked.length;
  // ilk denemede bilinen: yıldız; ikinci denemede bilinen: kalp; sıradaki: boş kalp
  $('progress').innerHTML = Array.from({ length: total }, (_, i) => {
    const done = i < game.results.length;
    const html = !done ? heartSVG('empty') : (game.results[i] ? starSVG() : heartSVG('full'));
    return `<span class="slot${pop && done && i === game.results.length - 1 ? ' pop' : ''}">${html}</span>`;
  }).join('');
}

function nextRound() {
  if (game.round >= game.picked.length) return finishGame();
  current = game.picked[game.round];
  game.missed = false;
  resetEcho();
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
  if (btn.classList.contains('good') || btn.classList.contains('bad') || btn.classList.contains('dim')) return;
  if (opt.id === current.id) {
    btn.classList.add('good');
    if (!game.missed) game.stars += 1;
    game.results.push(!game.missed);
    burst('💖');
    playFile('aferin');
    game.round += 1;
    renderProgress(true);
    setTimeout(nextRound, 1500);
  } else {
    game.missed = true;
    btn.classList.add('bad');
    playWrong();
    setTimeout(() => { btn.classList.remove('bad'); btn.classList.add('dim'); }, 650);
  }
}

$('listenBtn').onclick = () => playWord(current);

function finishGame() {
  totalStars += game.stars;
  saveStars(totalStars);
  renderStars();
  $('resultStars').innerHTML = game.stars ? starSVG(56).repeat(game.stars) : heartSVG('full', 56);
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
function burst() {
  const fx = $('fx');
  for (let i = 0; i < 14; i += 1) {
    const s = document.createElement('span');
    s.innerHTML = i % 3 === 0 ? starSVG(40) : heartSVG('full', 40);
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    s.style.transform = `scale(${0.6 + Math.random() * 0.7})`;
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
