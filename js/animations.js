// Scroll-triggered animations con IntersectionObserver

document.addEventListener('DOMContentLoaded', () => {

  // Agregamos clases iniciales a los elementos que van a animar
  const animTargets = [
    { selector: '.section-copy',    animation: 'slide-left' },
    { selector: '.section-graphic', animation: 'slide-right' },
    { selector: '.section-tag',     animation: 'fade-up' },
    { selector: '.section-title',   animation: 'fade-up' },
    { selector: '.section-desc',    animation: 'fade-up' },
    { selector: '.section-link',    animation: 'fade-up' },
    { selector: '.quote-strip',     animation: 'fade-up' },
    { selector: '.section-divider', animation: 'fade-in' },
  ];

  animTargets.forEach(({ selector, animation }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('will-animate', `anim-${animation}`);
    });
  });

  // Observer: cuando el elemento entra al viewport, lo animamos
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Una vez animado no lo reseteamos — queda visible
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,   // empieza cuando el 12% del elemento es visible
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.will-animate').forEach(el => observer.observe(el));

  // Animación especial para los items dentro de section-copy (escalonada)
  document.querySelectorAll('.section-copy').forEach(copy => {
    const children = copy.querySelectorAll('.section-tag, .section-title, .section-desc, .section-link');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

});
