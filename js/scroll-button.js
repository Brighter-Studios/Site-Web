document.addEventListener('DOMContentLoaded', () => {
    const scrollButton = document.querySelector('.scroll-button-container');
    const hero = document.querySelector('.hero');
    const projectsSection = document.querySelector('.projects-section');

    if (!scrollButton || !hero || !projectsSection) return;

    function isHeroFullyVisible() {
        const heroRect = hero.getBoundingClientRect();
        return heroRect.top >= 0 && heroRect.bottom <= window.innerHeight;
    }

    function updateButtonVisibility() {
        if (isHeroFullyVisible()) {
            scrollButton.classList.remove('hidden');
        } else {
            scrollButton.classList.add('hidden');
        }
    }

    scrollButton.addEventListener('click', () => {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateButtonVisibility);

    updateButtonVisibility();
});