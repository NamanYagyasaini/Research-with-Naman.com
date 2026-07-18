/* =========================================================
   main.js — shared behavior across all pages
   No build step, no frameworks. Edit data/*.json to update content.
   ========================================================= */

/* ---------- Theme toggle ---------- */
(function themeInit(){
  const saved = localStorage.getItem('theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  if(next === 'light'){ document.documentElement.setAttribute('data-theme','light'); }
  else{ document.documentElement.removeAttribute('data-theme'); }
  localStorage.setItem('theme', next);
  const btn = document.querySelector('.theme-toggle');
  if(btn) btn.textContent = next === 'light' ? '☾' : '☀';
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.theme-toggle');
  if(btn){
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☾' : '☀';
    btn.addEventListener('click', toggleTheme);
  }

  /* Mobile nav */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(navToggle && navLinks){
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('aos-in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('[data-aos]').forEach(el => io.observe(el));

  /* Animated counters */
  const counters = document.querySelectorAll('.num[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(target / 40, 0.1);
      const tick = () => {
        cur += step;
        if(cur >= target){ el.textContent = target + suffix; return; }
        el.textContent = Math.floor(cur) + suffix;
        requestAnimationFrame(tick);
      };
      tick();
      cio.unobserve(el);
    });
  }, { threshold: .4 });
  counters.forEach(el => cio.observe(el));

  /* Skill bars */
  const bars = document.querySelectorAll('.bar-fill[data-level]');
  const bio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.level + '%';
      bio.unobserve(e.target);
    });
  }, { threshold: .3 });
  bars.forEach(el => bio.observe(el));

  /* Typing effect */
  const typeEl = document.querySelector('.type-line .type-text');
  if(typeEl){
    const phrases = JSON.parse(typeEl.dataset.phrases || '[]');
    let pi = 0, ci = 0, deleting = false;
    const tick = () => {
      const phrase = phrases[pi];
      if(!deleting){
        ci++;
        typeEl.textContent = phrase.slice(0, ci);
        if(ci === phrase.length){ deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        typeEl.textContent = phrase.slice(0, ci);
        if(ci === 0){ deleting = false; pi = (pi + 1) % phrases.length; }
      }
      setTimeout(tick, deleting ? 35 : 55);
    };
    if(phrases.length) tick();
  }

  /* Back to top + reading progress */
  const backBtn = document.querySelector('.back-to-top');
  const progressBar = document.querySelector('.progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if(backBtn) backBtn.classList.toggle('show', scrolled > 500);
    if(progressBar){
      const h = document.documentElement;
      const pct = (scrolled / (h.scrollHeight - h.clientHeight)) * 100;
      progressBar.style.width = pct + '%';
    }
  });
  if(backBtn) backBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* Mark current nav link */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if(a.getAttribute('href') === path) a.setAttribute('aria-current','page');
  });
});

/* ---------- JSON data loader ---------- */
async function loadJSON(path){
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error('fetch failed');
    return await res.json();
  }catch(err){
    console.warn('Could not load', path, '— if you are opening this file directly (file://), run a local server instead. See README.md.', err);
    return null;
  }
}

/* ---------- Renderers used by individual pages ---------- */
function renderProjects(container, projects){
  if(!projects || !projects.length){
    container.innerHTML = '<div class="empty-state">No research projects added yet — add one in data/projects.json</div>';
    return;
  }
  container.innerHTML = projects.map(p => `
    <div class="card" data-aos>
      <div class="eyebrow">${p.period || ''}</div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="tag-row">${(p.tags||[]).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${p.link ? `<div style="margin-top:16px"><a href="${p.link}">${p.linkLabel || 'Learn more →'}</a></div>` : ''}
    </div>
  `).join('');
}

function renderTimeline(container, items){
  if(!items || !items.length){
    container.innerHTML = '<div class="empty-state">Timeline is empty — add entries in data/timeline.json</div>';
    return;
  }
  container.innerHTML = items.map(t => `
    <div class="tl-item ${t.future ? 'future' : ''}" data-aos>
      <div class="tl-dot"></div>
      <div class="tl-date">${t.date}</div>
      <h3>${t.title}</h3>
      <div class="tl-inst">${t.institution || ''}</div>
      <p>${t.description || ''}</p>
    </div>
  `).join('');
}

function renderNews(container, items){
  if(!items || !items.length){
    container.innerHTML = '<div class="empty-state">No updates yet — add entries in data/news.json</div>';
    return;
  }
  container.innerHTML = items.map(n => `
    <div class="card" data-aos>
      <div class="eyebrow">${n.date}</div>
      <h3>${n.title}</h3>
      <p>${n.description}</p>
    </div>
  `).join('');
}
