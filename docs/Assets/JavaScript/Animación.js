// Configuración básica de la escena
const container = document.getElementById('canvas-container');
const btn = document.getElementById('start-btn');
const msg = document.getElementById('message');

const scene = new THREE.Scene();
        
// Cámara con perspectiva
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Controles 3D (Mouse en PC, dedos en Smartphone)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 50;

// Configuración de las partículas
const particleCount = 7000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const color = new THREE.Color();

// Generar coordenadas matemáticas para un Corazón 3D
let index = 0;
while (index < particleCount) {
    let x = (Math.random() - 0.5) * 3.5;
    let y = (Math.random() - 0.5) * 3.5;
    let z = (Math.random() - 0.5) * 3.5;
    
    // Ecuación matemática de un volumen de corazón
    let eq = Math.pow(x*x + 9/4 * z*z + y*y - 1, 3) - x*x * y*y*y - 9/80 * z*z * y*y*y;
        if (eq < 0) {
            // Posición final (forma de corazón)
            targetPositions[index * 3] = x * 8;
            targetPositions[index * 3 + 1] = y * 8;
            targetPositions[index * 3 + 2] = z * 8;

            // Posición inicial (dispersa por todo el espacio para el efecto de "aparecer de la nada")
            let startX = (Math.random() - 0.5) * 200;
            let startY = (Math.random() - 0.5) * 200;
            let startZ = (Math.random() - 0.5) * 200;
                
            initialPositions[index * 3] = startX;
            initialPositions[index * 3 + 1] = startY;
            initialPositions[index * 3 + 2] = startZ;

            // Setear posición actual igual a la inicial
            positions[index * 3] = startX;
            positions[index * 3 + 1] = startY;
            positions[index * 3 + 2] = startZ;

            // Colores (variaciones de rojos, púrpuras y rosados para los destellos)
            color.setHSL(0.95 + Math.random() * 0.05, 1.0, 0.4 + Math.random() * 0.4);
            colors[index * 3] = color.r;
            colors[index * 3 + 1] = color.g;
            colors[index * 3 + 2] = color.b;
            
            index++;
        }
    }

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Crear textura circular con brillo para simular luz de destello
const canvas = document.createElement('canvas');
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.2, 'rgba(255,50,100,1)');
gradient.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 64, 64);
const texture = new THREE.CanvasTexture(canvas);

// Material brillante de los puntos
const material = new THREE.PointsMaterial({
    size: 0.8,
        vertexColors: true,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0 // Inician invisibles
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Variables de animación
let isAnimating = false;
let animationProgress = 0;

// Bucle de renderizado 3D
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Rotación suave e infinita
    particles.rotation.y += 0.003;
    particles.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;

    // Lógica para trasladar los puntos de "la nada" al corazón
    if (isAnimating && animationProgress < 1) {
        animationProgress += 0.003; // Velocidad de formación
                
        // Función de aceleración suave (Ease Out Cubic)
        const ease = 1 - Math.pow(1 - animationProgress, 3); 

        // Hacer que brillen de golpe y se mantengan
        material.opacity = Math.min(ease * 3, 1); 

        const pos = geometry.attributes.position.array;
        for(let i = 0; i < particleCount * 3; i++) {
            pos[i] = initialPositions[i] + (targetPositions[i] - initialPositions[i]) * ease;
        }

        geometry.attributes.position.needsUpdate = true;
        }
        
        renderer.render(scene, camera);
        }
        animate();

// Ajuste de pantalla al redimensionar
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Evento principal: Al hacer click en el botón
btn.addEventListener('click', () => {

    // Desvanecer el botón
    btn.style.transition = "opacity 0.5s ease";
    btn.style.opacity = "0";
    
    setTimeout(() => {
        btn.style.display = 'none';
        isAnimating = true; // Arranca la magia 3D

        // Mostrar el texto de "Te Amo Mucho" después de un retraso
        setTimeout(() => {
            msg.style.opacity = "1";
        }, 3500); 

    }, 500);
});