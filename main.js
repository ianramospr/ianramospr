/* ============================================
   SCROLL REVEAL — IntersectionObserver
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));

/* ============================================
   NAV SCROLL STATE
   ============================================ */
const nav = document.querySelector('.nav');

const navObserver = new IntersectionObserver(
  ([entry]) => {
    nav.classList.toggle('scrolled', !entry.isIntersecting);
  },
  { threshold: 0 }
);

// Observe the hero heading as the scroll sentinel
const heroHeading = document.querySelector('.hero__heading');
if (heroHeading) navObserver.observe(heroHeading);
