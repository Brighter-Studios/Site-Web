class ClickSpark {
    constructor(options = {}) {
        this.sparkColor = options.sparkColor || '#fff';
        this.sparkSize = options.sparkSize || 10;
        this.sparkRadius = options.sparkRadius || 15;
        this.sparkCount = options.sparkCount || 8;
        this.duration = options.duration || 400;
        this.easing = options.easing || 'ease-out';
        this.extraScale = options.extraScale || 1.0;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sparks = [];
        this.startTime = null;
        this.animationId = null;

        // Bind the methods to maintain correct 'this' context
        this.handleClick = this.handleClick.bind(this);
        this.draw = this.draw.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);

        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
            user-select: none;
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    easeFunc(t) {
        switch (this.easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t * (2 - t); // ease-out
        }
    }

    draw(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sparks = this.sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= this.duration) {
                return false;
            }

            const progress = elapsed / this.duration;
            const eased = this.easeFunc(progress);

            const distance = eased * this.sparkRadius * this.extraScale;
            const lineLength = this.sparkSize * (1 - eased);

            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            this.ctx.strokeStyle = this.sparkColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            return true;
        });

        if (this.sparks.length > 0) {
            this.animationId = requestAnimationFrame(this.draw);
        } else {
            // Important: Reset animationId when there are no more sparks
            this.animationId = null;
        }
    }

    handleClick(e) {
        const x = e.clientX;
        const y = e.clientY;

        const now = performance.now();
        const newSparks = Array.from({ length: this.sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / this.sparkCount,
            startTime: now
        }));

        this.sparks.push(...newSparks);

        // Start the animation if it's not already running
        if (!this.animationId) {
            this.animationId = requestAnimationFrame(this.draw);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.resizeCanvas);
        this.canvas.remove();
    }
}

// Initialize the click spark effect
document.addEventListener('DOMContentLoaded', () => {
    new ClickSpark({
        sparkColor: '#ffffffff', 
        sparkSize: 12,
        sparkRadius: 20,
        sparkCount: 10,
        duration: 500,
        extraScale: 3
    });
});