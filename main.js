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

/* ============================================
   CARD TILT (subtle magnetic hover)
   ============================================ */
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
