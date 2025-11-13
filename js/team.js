// team.js
// Handles theme switching on scroll and member-card hover pointer effects
document.addEventListener('DOMContentLoaded', function () {
  const body = document.querySelector('body.team-page');
  if (!body) return;

  // Theme switching: observe sections with data-team-theme
  const sections = Array.from(document.querySelectorAll('section[data-team-theme]'));
  if (sections.length) {
    const observer = new IntersectionObserver((entries) => {
      // choose the most visible section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        const theme = visible.target.getAttribute('data-team-theme') || 'violet';
        body.setAttribute('data-theme', theme);
      }
    }, { root: null, rootMargin: '0px 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach(s => observer.observe(s));

    // set initial theme to first section's theme (or attribute on body)
    const initial = sections.find(s => s.getAttribute('id')) || sections[0];
    if (initial) body.setAttribute('data-theme', initial.getAttribute('data-team-theme') || 'violet');
  }

  // Member card pointer-driven accent and hover state
  const memberCards = Array.from(document.querySelectorAll('.member-card'));
  memberCards.forEach(card => {
    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--pointer-x', x + '%');
      card.style.setProperty('--pointer-y', y + '%');
    }

    function enter() { card.classList.add('is-hovered'); }
    function leave() { card.classList.remove('is-hovered'); card.style.removeProperty('--pointer-x'); card.style.removeProperty('--pointer-y'); }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);
  });

  // Accessibility: allow keyboard focus to toggle hover effect
  memberCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('focus', () => card.classList.add('is-hovered'));
    card.addEventListener('blur', () => card.classList.remove('is-hovered'));
  });
});
