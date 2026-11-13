(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'danaocarlklientosorio@gmail.com';

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- Theme (light / dark) ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  function setTheme(t) {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ---------- Confetti ---------- */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  let pieces = [], raf = null;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize);
  resize();
  function confetti(x = innerWidth / 2, y = innerHeight / 3) {
    if (reduceMotion) return;
    const colors = ['#f05a28', '#f7a10d', '#2f80ed', '#9333ea', '#22c55e', '#ef4444'];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        x, y, vx: (Math.random() - .5) * 14, vy: Math.random() * -13 - 3,
        s: 6 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
        c: colors[i % colors.length], life: 0
      });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter(p => p.y < canvas.height + 20 && p.life < 150);
    pieces.forEach(p => {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6);
      ctx.restore();
    });
    raf = pieces.length ? requestAnimationFrame(frame) : null;
    if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* ---------- Tabs ---------- */
  const tabs = $$('[role="tab"]');
  const panels = $$('[role="tabpanel"]');
  function showTab(name, focus) {
    const tab = tabs.find(t => t.dataset.tab === name) || tabs[0];
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => {
      const on = p.id === 'section-' + tab.dataset.tab;
      p.hidden = !on;
      p.classList.remove('enter');
      if (on) { void p.offsetWidth; p.classList.add('enter'); }
    });
    if (focus) tab.focus();
    if (tab.dataset.tab === 'about') animateSkills();
    try { history.replaceState(null, '', '#' + tab.dataset.tab); } catch (e) {}
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
    tab.addEventListener('keydown', e => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      showTab(tabs[(keys[e.key] + tabs.length) % tabs.length].dataset.tab, true);
    });
  });
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => {
    showTab(b.dataset.goto);
    scrollTo({ top: 0 });
  }));
  addEventListener('hashchange', () => showTab(location.hash.slice(1)));

  /* ---------- Typing effect ---------- */
  const roles = ['BSCS student', 'future software developer', 'web designer in training', 'problem solver'];
  const typed = $('#typed');
  let ri = 0, ci = 0, deleting = false;
  function type() {
    const word = roles[ri];
    ci += deleting ? -1 : 1;
    typed.textContent = word.slice(0, ci);
    let delay = deleting ? 40 : 90;
    if (!deleting && ci === word.length) { deleting = true; delay = 1500; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 400; }
    setTimeout(type, delay);
  }
  if (reduceMotion) typed.textContent = roles[0]; else type();

  /* ---------- Fun facts and profile picture ---------- */
  const facts = [
    'The first computer bug was a real moth, found in a Harvard Mark II relay in 1947.',
    'The first website went online in 1991 and explained the World Wide Web project itself.',
    'Python is named after the comedy group Monty Python, not the snake.',
    'JavaScript was created in just ten days in 1995 by Brendan Eich.',
    'Ray Tomlinson chose the @ symbol for email addresses in 1971.'
  ];
  let last = -1;
  $('#fact-btn').addEventListener('click', () => {
    let n;
    do { n = Math.floor(Math.random() * facts.length); } while (n === last);
    last = n;
    $('#fact-text').textContent = facts[n];
  });
  $('#pic').addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    toast('You found the surprise!');
  });

  /* ---------- Skill bars ---------- */
  function animateSkills() {
    $$('.skill').forEach(s => {
      const level = s.dataset.level;
      const fill = $('.bar span', s);
      $('em', s).textContent = level + '%';
      fill.style.width = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = level + '%'; }));
    });
  }

  /* ---------- Gallery: filter + lightbox ---------- */
  const shots = $$('.shot');
  shots.forEach(s => $('img', s).addEventListener('error', () => s.classList.add('missing')));
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(c => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    shots.forEach(s => { s.hidden = !(chip.dataset.filter === 'all' || s.dataset.type === chip.dataset.filter); });
  }));

  const lb = $('#lightbox');
  let list = [], cur = 0;
  function paint() {
    const s = list[cur], img = $('img', s);
    $('#lb-img').src = img.src;
    $('#lb-img').alt = img.alt;
    $('#lb-cap').textContent = $('figcaption', s).textContent + ' (' + (cur + 1) + ' of ' + list.length + ')';
  }
  function step(d) { cur = (cur + d + list.length) % list.length; paint(); }
  shots.forEach(s => $('button', s).addEventListener('click', () => {
    list = shots.filter(x => !x.hidden);
    cur = list.indexOf(s);
    paint();
    lb.showModal();
  }));
  $('#lb-prev').addEventListener('click', () => step(-1));
  $('#lb-next').addEventListener('click', () => step(1));
  $('#lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const msgBox = $('#form-msg');
  const area = $('textarea', form);
  area.addEventListener('input', () => { $('#count').textContent = area.value.length + ' / 500'; });

  $('#copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); toast('Email copied!'); }
    catch (e) { toast('Could not copy. Select the email and copy it.'); }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    [form.name, form.email, area].forEach(f => f.classList.remove('bad'));
    msgBox.textContent = '';
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
      if (!name) form.name.classList.add('bad');
      if (!/^\S+@\S+\.\S+$/.test(email)) form.email.classList.add('bad');
      if (!message) area.classList.add('bad');
      msgBox.textContent = 'Please fill in your name, a valid email, and a message.';
      return;
    }
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');
    location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
    confetti();
    toast('Opening your email app...');
    form.reset();
    $('#count').textContent = '0 / 500';
  });

  /* ---------- Start ---------- */
  $('#year').textContent = new Date().getFullYear();
  showTab(location.hash.slice(1) || 'home');
})();