document.addEventListener('DOMContentLoaded', () => {
    const scrollButton = document.querySelector('.scroll-button-container');
    const hero = document.querySelector('.hero');
    const projectsSection = document.querySelector('.projects-section');

    if (!scrollButton || !hero || !projectsSection) return;

    // Fonction pour vérifier si le hero est entièrement visible
    function isHeroFullyVisible() {
        const heroRect = hero.getBoundingClientRect();
        return heroRect.top >= 0 && heroRect.bottom <= window.innerHeight;
    }

    // Fonction pour gérer la visibilité du bouton
    function updateButtonVisibility() {
        if (isHeroFullyVisible()) {
            scrollButton.classList.remove('hidden');
        } else {
            scrollButton.classList.add('hidden');
        }
    }

    // Gérer le clic sur le bouton
    scrollButton.addEventListener('click', () => {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Mettre à jour la visibilité du bouton au scroll
    window.addEventListener('scroll', updateButtonVisibility);
    
    // Vérifier la visibilité initiale
    updateButtonVisibility();
});