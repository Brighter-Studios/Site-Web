
class GlareHover {
  constructor(element, options = {}) {
      this.element = element;
      this.options = {
          width: options.width || '500px',
          height: options.height || '500px',
          background: options.background || '#000',
          borderRadius: options.borderRadius || '10px',
          borderColor: options.borderColor || '#333',
          glareColor: options.glareColor || '#ffffff',
          glareOpacity: options.glareOpacity || 0.5,
          glareAngle: options.glareAngle || -45,
          glareSize: options.glareSize || 250,
          transitionDuration: options.transitionDuration || 650,
          playOnce: options.playOnce || false
      };

      this.init();
  }

  convertHexToRGBA(hex, opacity) {
      hex = hex.replace('#', '');
      if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
          const r = parseInt(hex[0] + hex[0], 16);
          const g = parseInt(hex[1] + hex[1], 16);
          const b = parseInt(hex[2] + hex[2], 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return hex;
  }

  init() {
      const rgba = this.convertHexToRGBA(this.options.glareColor, this.options.glareOpacity);
      
      this.element.classList.add('glare-hover');
      if (this.options.playOnce) {
          this.element.classList.add('glare-hover--play-once');
      }

      const styles = {
          '--gh-width': this.options.width,
          '--gh-height': this.options.height,
          '--gh-bg': this.options.background,
          '--gh-br': this.options.borderRadius,
          '--gh-angle': `${this.options.glareAngle}deg`,
          '--gh-duration': `${this.options.transitionDuration}ms`,
          '--gh-size': `${this.options.glareSize}%`,
          '--gh-rgba': rgba,
          '--gh-border': this.options.borderColor
      };

      Object.entries(styles).forEach(([property, value]) => {
          this.element.style.setProperty(property, value);
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
      new GlareHover(heroContent, {
          width: 'auto',
          height: 'auto',
          background: 'transparent',
          borderRadius: '2rem',
          borderColor: 'rgba(0, 0, 0, 0.51)',
          glareColor: '#ffffff',
          glareOpacity: 0.3,
          glareAngle: -30,
          glareSize: 300,
          transitionDuration: 800,
          playOnce: false
      });
  }
});