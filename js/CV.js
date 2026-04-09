
document.addEventListener('DOMContentLoaded', () => {
    const jimboCard = document.getElementById('jimbo-card');
    let isGif = false;

    if (jimboCard) {
        jimboCard.addEventListener('click', () => {
            isGif = !isGif;
            jimboCard.style.transform = 'scale(0.9)';
            setTimeout(() => {
                jimboCard.src = isGif ? 'assets/CV/balatro-jimbo.gif' : 'assets/CV/jimbo.webp';
                // La transformation sera réinitialisée par le mousemove ou le mouseleave
            }, 150);
        });

        const handleTilt = (e) => {
            const rect = jimboCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Max rotation (degrees)
            const maxRotate = 25; 
            const rotateX = ((y - centerY) / centerY) * -maxRotate;
            const rotateY = ((x - centerX) / centerX) * maxRotate;
            
            jimboCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08) translateY(-10px)`;
        };

        const resetTilt = () => {
            jimboCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            // Petite pause avant de laisser l'animation 'float' du CSS reprendre si besoin
            setTimeout(() => {
                jimboCard.style.transform = '';
            }, 100);
        };

        jimboCard.addEventListener('mousemove', handleTilt);
        jimboCard.addEventListener('mouseleave', resetTilt);
    }

    const playlist = [
        {
            src: 'assets/CV/balatro.mp3',
            title: 'Main Theme',
            artist: 'Balatro OST - Louis V',
            colors: ['#ff4c40', '#009dff', '#c52321', '#7b559c', '#0059aa'],
            bgColor: 'black'
        },
        {
            src: 'assets/CV/balatro-b-side.mp3',
            title: 'B-sides',
            artist: 'Balatro OST - Louis V',
            colors: ['#ff4c40', '#009dff', '#c52321', '#7b559c', '#0059aa'],
            bgColor: '#630000ff'
        },
        {
            src: 'assets/CV/balatrocryptid.mp3',
            title: 'Madness theme',
            artist: 'Cryptid OST - Mod Theme',
            colors: ['#009dff', '#ffe680', '#1d8ced', '#f5b244', '#0f65b8'],
            bgColor: '#5377C4'
        }
    ];

    let currentTrackIdx = 0;
    const audio = new Audio();
    audio.volume = 0.5;

    const playBtn = document.getElementById('playStatus');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const iconVolHigh = document.querySelector('.icon-vol-high');
    const iconVolMute = document.querySelector('.icon-vol-mute');
    const progressSlider = document.querySelector('.progress-slider');
    const timeStart = document.querySelector('.time.start');
    const timeEnd = document.querySelector('.time.end');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const listBtn = document.querySelector('.list-btn');
    const playlistMenu = document.querySelector('.playlist-menu');
    const titleEl = document.querySelector('.player-info .title');
    const artistEl = document.querySelector('.player-info .artist');
    const playerWrapper = document.querySelector('.player-wrapper');

    const updateSliderBackground = (percent) => {
        progressSlider.style.background = `linear-gradient(to right, oklch(0% 0 0) ${percent}%, var(--gray-300) ${percent}%)`;
    };

    const loadTrack = (idx) => {
        const track = playlist[idx];
        audio.src = track.src;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;

        // Update SVG colors
        track.colors.forEach((color, i) => {
            const paths = document.querySelectorAll(`.v-path-${i + 1}`);
            paths.forEach(p => p.setAttribute('fill', color));
        });

        // Update Background color
        const rects = document.querySelectorAll('.vinyl-svg rect, .hover-vinyl-svg rect');
        rects.forEach(r => r.setAttribute('fill', track.bgColor));

        // Setup initial background
        progressSlider.value = 0;
        updateSliderBackground(0);

        // Active stat in playlist
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === idx) item.classList.add('active');
            else item.classList.remove('active');
        });
    };

    const togglePlay = () => {
        if (playBtn.checked) {
            audio.play().then(() => {
                playerWrapper.classList.add('playing');
            }).catch(err => {
                console.error("Erreur de lecture audio :", err);
                playBtn.checked = false;
            });
        } else {
            audio.pause();
            playerWrapper.classList.remove('playing');
        }
    };

    const playNext = () => {
        currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
        loadTrack(currentTrackIdx);
        if (playBtn.checked) togglePlay();
    };

    const playPrev = () => {
        currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIdx);
        if (playBtn.checked) togglePlay();
    };

    // Render Playlist UI
    if (playlistMenu) {
        playlist.forEach((track, idx) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';

            // create mini vinyl using svg html
            const svgContent = `
                <svg width="32" height="32" viewBox="0 0 128 128" class="mini-vinyl">
                    <rect width="128" height="128" fill="${track.bgColor}"></rect>
                    <circle cx="20" cy="20" r="2" fill="white"></circle>
                    <circle cx="40" cy="30" r="2" fill="white"></circle>
                    <circle cx="60" cy="10" r="2" fill="white"></circle>
                    <circle cx="80" cy="40" r="2" fill="white"></circle>
                    <circle cx="100" cy="20" r="2" fill="white"></circle>
                    <circle cx="120" cy="50" r="2" fill="white"></circle>
                    <circle cx="90" cy="30" r="10" fill="white" fill-opacity="0.5"></circle>
                    <circle cx="90" cy="30" r="8" fill="white"></circle>
                    <path d="M0 128 Q32 64 64 128 T128 128" fill="${track.colors[0]}" stroke="black" stroke-width="1"></path>
                    <path d="M0 128 Q32 48 64 128 T128 128" fill="${track.colors[1]}" stroke="black" stroke-width="1"></path>
                    <path d="M0 128 Q32 32 64 128 T128 128" fill="${track.colors[2]}" stroke="black" stroke-width="1"></path>
                    <path d="M0 128 Q16 64 32 128 T64 128" fill="${track.colors[3]}" stroke="black" stroke-width="1"></path>
                    <path d="M64 128 Q80 64 96 128 T128 128" fill="${track.colors[4]}" stroke="black" stroke-width="1"></path>
                    <!-- Center Hole -->
                    <circle cx="64" cy="64" r="12" fill="white" stroke="#ccc" stroke-width="2"></circle>
                    <circle cx="64" cy="64" r="4" fill="black"></circle>
                </svg>
            `;

            item.innerHTML = `
                ${svgContent}
                <div class="infos">
                    <p class="t-title">${track.title}</p>
                    <p class="t-artist">${track.artist}</p>
                </div>
            `;

            item.addEventListener('click', () => {
                currentTrackIdx = idx;
                loadTrack(idx);
                playBtn.checked = true;
                togglePlay();
            });
            playlistMenu.appendChild(item);
        });
    }

    if (playBtn && progressSlider) {
        const formatTime = (timeInSeconds) => {
            if (isNaN(timeInSeconds)) return "0:00";
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.floor(timeInSeconds % 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        audio.addEventListener('loadedmetadata', () => {
            timeEnd.textContent = formatTime(audio.duration);
        });

        playBtn.addEventListener('change', togglePlay);

        // prev / next buttons
        if (prevBtn) prevBtn.addEventListener('click', playPrev);
        if (nextBtn) nextBtn.addEventListener('click', playNext);

        // toggle playlist menu
        if (listBtn) {
            listBtn.addEventListener('click', (e) => {
                playlistMenu.classList.toggle('show');
                e.stopPropagation();
            });
            document.addEventListener('click', (e) => {
                // hide clicking outside
                if (!e.target.closest('.list-btn') && !e.target.closest('.playlist-menu')) {
                    playlistMenu.classList.remove('show');
                }
            });
        }

        audio.addEventListener('timeupdate', () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration;

            timeStart.textContent = formatTime(currentTime);

            if (duration) {
                const progressPercent = (currentTime / duration) * 100;
                progressSlider.value = progressPercent;
                updateSliderBackground(progressPercent);
            }
        });

        progressSlider.addEventListener('input', (e) => {
            const duration = audio.duration;
            if (duration) {
                const seekTime = (e.target.value / 100) * duration;
                audio.currentTime = seekTime;
                updateSliderBackground(e.target.value);
            }
        });

        audio.addEventListener('ended', () => {
            playNext();
        });

        let previousVolume = 0.5;
        if (muteBtn && volumeSlider) {
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume * 100;

            const updateVolumeUI = (vol) => {
                if (vol === 0) {
                    iconVolHigh.style.display = 'none';
                    iconVolMute.style.display = 'inline-block';
                } else {
                    iconVolHigh.style.display = 'inline-block';
                    iconVolMute.style.display = 'none';
                }
                volumeSlider.style.background = `linear-gradient(to right, oklch(0% 0 0) ${vol * 100}%, var(--gray-300) ${vol * 100}%)`;
            };

            updateVolumeUI(audio.volume);

            muteBtn.addEventListener('click', () => {
                if (audio.volume > 0) {
                    previousVolume = audio.volume;
                    audio.volume = 0;
                    volumeSlider.value = 0;
                } else {
                    audio.volume = previousVolume || 0.5;
                    volumeSlider.value = audio.volume * 100;
                }
                updateVolumeUI(audio.volume);
            });

            volumeSlider.addEventListener('input', (e) => {
                const vol = e.target.value / 100;
                audio.volume = vol;
                if (vol > 0) {
                    previousVolume = vol;
                }
                updateVolumeUI(vol);
            });
        }

        loadTrack(0);
    }

    const initBalatroBg = () => {
        const canvas = document.getElementById('balatro-bg');
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not supported');
            return;
        }

        const config = {
            spinRotation: -2.0,
            spinSpeed: 7.0,
            offset: [0.0, 0.0],
            color1: '#DE443B',
            color2: '#006BB4',
            color3: '#162325',
            contrast: 3.5,
            lighting: 0.4,
            spinAmount: 0.25,
            pixelFilter: 745.0,
            spinEase: 1.0,
            isRotate: false,
            mouseInteraction: true
        };

        function hexToVec4(hex) {
            let hexStr = hex.replace('#', '');
            let r = 0, g = 0, b = 0, a = 1;
            if (hexStr.length === 6) {
                r = parseInt(hexStr.slice(0, 2), 16) / 255;
                g = parseInt(hexStr.slice(2, 4), 16) / 255;
                b = parseInt(hexStr.slice(4, 6), 16) / 255;
            } else if (hexStr.length === 8) {
                r = parseInt(hexStr.slice(0, 2), 16) / 255;
                g = parseInt(hexStr.slice(2, 4), 16) / 255;
                b = parseInt(hexStr.slice(4, 6), 16) / 255;
                a = parseInt(hexStr.slice(6, 8), 16) / 255;
            }
            return [r, g, b, a];
        }

        const vertexShaderSource = `
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = position * 0.5 + 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;

            #define PI 3.14159265359

            uniform float iTime;
            uniform vec3 iResolution;
            uniform float uSpinRotation;
            uniform float uSpinSpeed;
            uniform vec2 uOffset;
            uniform vec4 uColor1;
            uniform vec4 uColor2;
            uniform vec4 uColor3;
            uniform float uContrast;
            uniform float uLighting;
            uniform float uSpinAmount;
            uniform float uPixelFilter;
            uniform float uSpinEase;
            uniform bool uIsRotate;
            uniform vec2 uMouse;

            varying vec2 vUv;

            vec4 effect(vec2 screenSize, vec2 screen_coords) {
                float pixel_size = length(screenSize.xy) / uPixelFilter;
                vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
                float uv_len = length(uv);
                
                float speed = (uSpinRotation * uSpinEase * 0.2);
                if(uIsRotate){
                   speed = iTime * speed;
                }
                speed += 302.2;
                
                float mouseInfluence = (uMouse.x * 2.0 - 1.0);
                speed += mouseInfluence * 0.1;
                
                float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
                vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
                uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
                
                uv *= 30.0;
                float baseSpeed = iTime * uSpinSpeed;
                speed = baseSpeed + mouseInfluence * 2.0;
                
                vec2 uv2 = vec2(uv.x + uv.y);
                
                for(int i = 0; i < 5; i++) {
                    uv2 += sin(max(uv.x, uv.y)) + uv;
                    uv += 0.5 * vec2(
                        cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
                        sin(uv2.x - 0.113 * speed)
                    );
                    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
                }
                
                float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
                float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
                float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
                float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
                float c3p = 1.0 - min(1.0, c1p + c2p);
                float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
                
                return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
            }

            void main() {
                vec2 uv = vUv * iResolution.xy;
                gl_FragColor = effect(iResolution.xy, uv);
            }
        `;

        function compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const locs = {
            iResolution: gl.getUniformLocation(program, "iResolution"),
            iTime: gl.getUniformLocation(program, "iTime"),
            uSpinRotation: gl.getUniformLocation(program, "uSpinRotation"),
            uSpinSpeed: gl.getUniformLocation(program, "uSpinSpeed"),
            uOffset: gl.getUniformLocation(program, "uOffset"),
            uColor1: gl.getUniformLocation(program, "uColor1"),
            uColor2: gl.getUniformLocation(program, "uColor2"),
            uColor3: gl.getUniformLocation(program, "uColor3"),
            uContrast: gl.getUniformLocation(program, "uContrast"),
            uLighting: gl.getUniformLocation(program, "uLighting"),
            uSpinAmount: gl.getUniformLocation(program, "uSpinAmount"),
            uPixelFilter: gl.getUniformLocation(program, "uPixelFilter"),
            uSpinEase: gl.getUniformLocation(program, "uSpinEase"),
            uIsRotate: gl.getUniformLocation(program, "uIsRotate"),
            uMouse: gl.getUniformLocation(program, "uMouse"),
        };

        let mousePos = [0.5, 0.5];
        if (config.mouseInteraction) {
            window.addEventListener('mousemove', (e) => {
                mousePos[0] = e.clientX / window.innerWidth;
                mousePos[1] = 1.0 - (e.clientY / window.innerHeight);
            });
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let startTime = performance.now();

        const c1 = hexToVec4(config.color1);
        const c2 = hexToVec4(config.color2);
        const c3 = hexToVec4(config.color3);

        function render(time) {
            gl.useProgram(program);

            gl.uniform3f(locs.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);
            gl.uniform1f(locs.iTime, (time - startTime) / 1000.0);
            gl.uniform1f(locs.uSpinRotation, config.spinRotation);
            gl.uniform1f(locs.uSpinSpeed, config.spinSpeed);
            gl.uniform2f(locs.uOffset, config.offset[0], config.offset[1]);
            gl.uniform4f(locs.uColor1, c1[0], c1[1], c1[2], c1[3]);
            gl.uniform4f(locs.uColor2, c2[0], c2[1], c2[2], c2[3]);
            gl.uniform4f(locs.uColor3, c3[0], c3[1], c3[2], c3[3]);
            gl.uniform1f(locs.uContrast, config.contrast);
            gl.uniform1f(locs.uLighting, config.lighting);
            gl.uniform1f(locs.uSpinAmount, config.spinAmount);
            gl.uniform1f(locs.uPixelFilter, config.pixelFilter);
            gl.uniform1f(locs.uSpinEase, config.spinEase);
            gl.uniform1i(locs.uIsRotate, config.isRotate ? 1 : 0);
            gl.uniform2f(locs.uMouse, mousePos[0], mousePos[1]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    };

    initBalatroBg();
});