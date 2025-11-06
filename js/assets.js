document.addEventListener('DOMContentLoaded', () => {
  initPaletteCopy();
  initBannerCarousel();
});

function initPaletteCopy() {
  const swatches = document.querySelectorAll('.color-swatch');
  if (!swatches.length) {
    return;
  }

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // continue with fallback
      }
    }
    return fallbackCopy(text);
  };

  swatches.forEach((swatch) => {
    const colorCode = swatch.dataset.color;
    const button = swatch.querySelector('.copy-btn');
    if (!colorCode || !button) {
      return;
    }

    button.addEventListener('click', async (event) => {
      event.preventDefault();

      const copied = await copyToClipboard(colorCode);

      if (copied) {
        swatch.classList.remove('copied');
        void swatch.offsetWidth; // force reflow
        swatch.classList.add('copied');
        setTimeout(() => swatch.classList.remove('copied'), 1400);
      } else {
        button.textContent = 'Erreur';
        setTimeout(() => {
          button.textContent = 'Copier';
        }, 1500);
      }
    });
  });
}

function initBannerCarousel() {
  const carousel = document.querySelector('[data-component="carousel"]');
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('.carousel-track');
  const slides = track ? Array.from(track.querySelectorAll('img')) : [];
  if (!slides.length) {
    return;
  }

  let current = 0;
  const prevButton = carousel.querySelector('.carousel-btn.prev');
  const nextButton = carousel.querySelector('.carousel-btn.next');
  const hint = carousel.parentElement?.querySelector('.carousel-hint');

  if (!prevButton || !nextButton) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyState = () => {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'left', 'right');
      if (index === current) {
        slide.classList.add('active');
      } else if (index === (current - 1 + slides.length) % slides.length) {
        slide.classList.add('left');
      } else if (index === (current + 1) % slides.length) {
        slide.classList.add('right');
      }
    });
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    applyState();
    if (hint) {
      hint.classList.add('is-visible');
      if (hint._timeoutId) {
        clearTimeout(hint._timeoutId);
      }
      hint._timeoutId = window.setTimeout(() => {
        hint.classList.remove('is-visible');
        hint._timeoutId = undefined;
      }, 2200);
    }
  };

  applyState();

  const animateButton = (button) => {
    if (prefersReducedMotion) {
      return;
    }
    button.classList.add('is-active');
    setTimeout(() => button.classList.remove('is-active'), 260);
  };

  prevButton.addEventListener('click', () => {
    goTo(current - 1);
    animateButton(prevButton);
  });

  nextButton.addEventListener('click', () => {
    goTo(current + 1);
    animateButton(nextButton);
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (!slide.classList.contains('active')) {
        goTo(index);
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'asset-overlay';
      overlay.innerHTML = `
        <div class="asset-overlay__inner">
          <img src="${slide.src}" alt="${slide.alt}">
          ${slide.dataset.caption ? `<p>${slide.dataset.caption}</p>` : ''}
        </div>
      `;

      const closeOverlay = () => {
        overlay.remove();
        document.removeEventListener('keydown', onKeyDown);
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') {
          closeOverlay();
        }
      };

      overlay.addEventListener('click', closeOverlay);
      document.addEventListener('keydown', onKeyDown);

      document.body.appendChild(overlay);
    });
  });
}