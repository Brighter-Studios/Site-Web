document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Image Toggling
    const jimboCard = document.getElementById('jimbo-card');
    let isGif = false;

    jimboCard.addEventListener('click', () => {
        isGif = !isGif;
        jimboCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
            jimboCard.src = isGif ? 'assets/CV/balatro-jimbo.gif' : 'assets/CV/jimbo.webp';
            jimboCard.style.transform = ''; // reset to let hover take over
        }, 150);
    });

    // 2. WebGL Background (React-Bits Balatro recreation)
    const initBalatroBg = () => {
        const canvas = document.getElementById('balatro-bg');
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not supported');
            return;
        }

        // Config variables derived from the requested react-bits component props
        const config = {
            spinRotation: -2.0,
            spinSpeed: 7.0,
            color1: [222/255, 68/255, 59/255],  // #DE443B
            color2: [0/255, 107/255, 180/255],  // #006BB4
            color3: [22/255, 35/255, 37/255],   // #162325
            contrast: 3.5,
            lighting: 0.4,
            spinAmount: 0.25,
            pixelFilter: 700.0
        };

        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;
            varying vec2 v_uv;
            uniform vec2 iResolution;
            uniform float iTime;
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 color3;
            uniform float spinRotation;
            uniform float spinSpeed;
            uniform float contrast;
            uniform float lighting;
            uniform float spinAmount;
            uniform float pixelFilter;

            float random(in vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            float noise(in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f*f*(3.0-2.0*f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            float fbm(in vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / iResolution.xy;
                if (pixelFilter > 0.0) {
                    vec2 res = vec2(pixelFilter, pixelFilter * (iResolution.y / iResolution.x));
                    uv = floor(uv * res) / res;
                }
                
                vec2 p = uv * 2.0 - 1.0;
                p.x *= iResolution.x / iResolution.y;

                float t = iTime * spinSpeed * 0.1;

                float c = cos(spinRotation);
                float s = sin(spinRotation);
                mat2 rot = mat2(c, -s, s, c);
                p = rot * p;

                vec2 q = vec2(0.0);
                q.x = fbm(p + t * 0.3);
                q.y = fbm(p + vec2(1.0) + t * 0.2);

                vec2 r = vec2(0.0);
                r.x = fbm(p + 1.0 * q + vec2(1.7, 9.2) + t * 0.15);
                r.y = fbm(p + 1.0 * q + vec2(8.3, 2.8) + t * 0.126);

                float f = fbm(p + r * spinAmount);

                vec3 col = color2;
                col = mix(col, color1, clamp((f * f) * 1.5, 0.0, 1.0));

                col = (col - 0.5) * contrast + 0.5;
                col = clamp(col, 0.0, 1.0);

                float rLen = length(q);
                col = mix(col, color3, clamp(rLen * 0.5 - 0.1, 0.0, 1.0));

                col += lighting * r.x * 0.5;

                gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
            }
        `;

        function compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const locs = {
            iResolution: gl.getUniformLocation(program, "iResolution"),
            iTime: gl.getUniformLocation(program, "iTime"),
            color1: gl.getUniformLocation(program, "color1"),
            color2: gl.getUniformLocation(program, "color2"),
            color3: gl.getUniformLocation(program, "color3"),
            spinRotation: gl.getUniformLocation(program, "spinRotation"),
            spinSpeed: gl.getUniformLocation(program, "spinSpeed"),
            contrast: gl.getUniformLocation(program, "contrast"),
            lighting: gl.getUniformLocation(program, "lighting"),
            spinAmount: gl.getUniformLocation(program, "spinAmount"),
            pixelFilter: gl.getUniformLocation(program, "pixelFilter"),
        };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let startTime = performance.now();

        function render(time) {
            gl.useProgram(program);

            gl.uniform2f(locs.iResolution, canvas.width, canvas.height);
            gl.uniform1f(locs.iTime, (time - startTime) / 1000.0);
            gl.uniform3f(locs.color1, config.color1[0], config.color1[1], config.color1[2]);
            gl.uniform3f(locs.color2, config.color2[0], config.color2[1], config.color2[2]);
            gl.uniform3f(locs.color3, config.color3[0], config.color3[1], config.color3[2]);
            gl.uniform1f(locs.spinRotation, config.spinRotation);
            gl.uniform1f(locs.spinSpeed, config.spinSpeed);
            gl.uniform1f(locs.contrast, config.contrast);
            gl.uniform1f(locs.lighting, config.lighting);
            gl.uniform1f(locs.spinAmount, config.spinAmount);
            gl.uniform1f(locs.pixelFilter, config.pixelFilter);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }
        
        requestAnimationFrame(render);
    };

    initBalatroBg();
});
