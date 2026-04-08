document.addEventListener('DOMContentLoaded', () => {
    const jimboCard = document.getElementById('jimbo-card');
    let isGif = false;

    jimboCard.addEventListener('click', () => {
        isGif = !isGif;
        jimboCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
            jimboCard.src = isGif ? 'assets/CV/balatro-jimbo.gif' : 'assets/CV/jimbo.webp';
            jimboCard.style.transform = '';
        }, 150);
    });

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

document.addEventListener('DOMContentLoaded', () => {
    const jimboCard = document.getElementById('jimbo-card');
    let isGif = false;

    if (jimboCard) {
        jimboCard.addEventListener('click', () => {
            isGif = !isGif;
            jimboCard.style.transform = 'scale(0.9)';
            setTimeout(() => {
                jimboCard.src = isGif ? 'assets/CV/balatro-jimbo.gif' : 'assets/CV/jimbo.webp';
                jimboCard.style.transform = '';
            }, 150);
        });
    }

    const audio = new Audio('assets/CV/balatro.mp3');
    audio.volume = 0.5;

    const playBtn = document.getElementById('playStatus');
    const playModeBtn = document.getElementById('playMode');
    const progressSlider = document.querySelector('.progress-slider');
    const timeStart = document.querySelector('.time.start');
    const timeEnd = document.querySelector('.time.end');

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

        playBtn.addEventListener('change', (e) => {
            if (e.target.checked) {
                audio.play().catch(err => console.error("Erreur de lecture audio :", err));
            } else {
                audio.pause();
            }
        });

        playModeBtn.addEventListener('change', (e) => {
            audio.loop = e.target.checked;
        });

        audio.addEventListener('timeupdate', () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration;

            timeStart.textContent = formatTime(currentTime);

            if (duration) {
                const progressPercent = (currentTime / duration) * 100;
                progressSlider.value = progressPercent;
            }
        });

        progressSlider.addEventListener('input', (e) => {
            const duration = audio.duration;
            if (duration) {
                const seekTime = (e.target.value / 100) * duration;
                audio.currentTime = seekTime;
            }
        });

        audio.addEventListener('ended', () => {
            if (!audio.loop) {
                playBtn.checked = false;
                progressSlider.value = 0;
                timeStart.textContent = "0:00";
                audio.currentTime = 0;
            }
        });
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