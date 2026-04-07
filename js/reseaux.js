document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.style.opacity = '1';
    }, 200);
  }

  document.addEventListener('mousemove', (e) => {
    const space = document.querySelector('.space');
    const flares = document.querySelectorAll('.flare');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    if (space) {
      space.style.transform = `translate3d(${mouseX * -30}px, ${mouseY * -30}px, 0)`;
    }
    flares.forEach((flare, index) => {
      const depth = (index + 1) * 0.2;
      flare.style.transform = `translate3d(${mouseX * -70 * depth}px, ${mouseY * -70 * depth}px, 0)`;
    });
  });

  const flares = document.querySelectorAll('.flare');
  flares.forEach((flare, index) => {
    const delay = index * 0.5;
    flare.style.animation = `float 20s ${delay}s ease-in-out infinite alternate`;
  });
});
