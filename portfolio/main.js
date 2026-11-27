// Loaded in <head> so .reveal content is only hidden when this script runs.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  /* Scroll reveal */
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
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  /* Nav border once the hero heading scrolls away */
  const nav = document.querySelector('.nav');
  const heroHeading = document.querySelector('.hero__heading');
  if (nav && heroHeading) {
    new IntersectionObserver(([entry]) => {
      nav.classList.toggle('scrolled', !entry.isIntersecting);
    }).observe(heroHeading);
  }
});
