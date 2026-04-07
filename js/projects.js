document.addEventListener('DOMContentLoaded', () => {
    VanillaTilt.init(document.querySelector('.construction-content'), {
        max: 8,
        speed: 300,
        glare: true,
        'max-glare': 0.2,
        scale: 1.02,
        perspective: 1500,
        transition: true,
        easing: "cubic-bezier(.03,.98,.52,.99)"
    });

    particlesJS('particles-js', {
        particles: {
            number: {
                value: 40,
                density: {
                    enable: true,
                    value_area: 1000
                }
            },
            color: {
                value: ["#8093F1", "#B388EB", "#F7AEF8"]
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.3,
                random: true
            },
            size: {
                value: 2,
                random: true
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                out_mode: "out"
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        const flares = document.querySelectorAll('.flare');
        flares.forEach((flare, index) => {
            const depth = (index + 1) * 0.2;
            flare.style.transform = `translate3d(${mouseX * -70 * depth}px, ${mouseY * -70 * depth}px, 0)`;
        });

        const space = document.querySelector('.space');
        if (space) {
            space.style.transform = `translate3d(${mouseX * -30}px, ${mouseY * -30}px, 0)`;
        }
    });

    function createMeteor() {
        const meteor = document.createElement('div');
        meteor.className = 'meteoro';
        meteor.style.left = Math.random() * window.innerWidth + 'px';
        meteor.style.top = Math.random() * window.innerHeight / 2 + 'px';
        meteor.style.animationDuration = Math.random() * 1 + 0.5 + 's';
        document.querySelector('.chuvaMeteoro').appendChild(meteor);

        setTimeout(() => {
            meteor.remove();
        }, 1000);
    }

    setInterval(() => {
        if (Math.random() > 0.5) {
            createMeteor();
        }
    }, Math.random() * 5000 + 3000);
});