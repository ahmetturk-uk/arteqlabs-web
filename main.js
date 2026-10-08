// Language switch, header state, fast in-page scrolling and reveal-on-scroll.

function getLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'tr') return saved;
  } catch (e) {}
  return 'en';
}

function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.classList.toggle('active', b.dataset.setLang === lang));
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

function initFastScroll() {
  const DURATION = 300;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = id === '#top' ? 0 : (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    const startY = window.scrollY;
    const endY = id === '#top' ? 0 : Math.max(0, target.getBoundingClientRect().top + startY - offset);
    if (reduce) { window.scrollTo({ top: endY, behavior: 'instant' }); return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DURATION);
      window.scrollTo({ top: startY + (endY - startY) * ease(t), behavior: 'instant' });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function initHeader() {
  const h = document.querySelector('.header');
  const update = () => h.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

document.documentElement.setAttribute('data-lang', getLang());

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.dataset.setLang);
  });
  setLang(getLang());
  initHeader();
  initFastScroll();
  initReveal();
});
