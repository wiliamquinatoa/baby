// Configuración básica de la escena
const container = document.getElementById('canvas-container');
const btn = document.getElementById('start-btn');
const msg = document.getElementById('message');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a); // Noche suave

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 22);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 45;
controls.target.set(0, 0, 0);

// --- CONFIGURACIÓN DEL RAMO DE FLORES AMARILLAS ---
const particleCount = 18000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

const color = new THREE.Color();

// --- FUNCIONES PARA GENERAR LAS PARTES DEL RAMO ---

// TALLO: línea vertical con ligera curvatura
function generarTallo(alturaBase, alturaMax, radio) {
    const t = Math.random();
    const y = alturaBase + t * (alturaMax - alturaBase);
    // Curvatura suave del tallo
    const curvatura = Math.sin(t * Math.PI) * 0.5;
    const x = (Math.random() - 0.5) * radio + curvatura * 0.3;
    const z = (Math.random() - 0.5) * radio;
    return [x, y, z];
}

// HOJA: óvalo pequeño en el tallo
function generarHoja(baseX, baseY, baseZ) {
    const t = Math.random();
    const lado = Math.random() < 0.5 ? -1 : 1;
    // Hoja ovalada
    const ancho = 0.6;
    const largo = 1.2;
    const angulo = Math.random() * Math.PI * 2;
    const radioHoja = Math.sqrt(Math.random());
    
    const x = baseX + lado * (Math.cos(angulo) * radioHoja * ancho * 0.5 + 0.3);
    const y = baseY + Math.sin(angulo) * radioHoja * largo * 0.3;
    const z = baseZ + Math.sin(angulo) * radioHoja * ancho * 0.3;
    return [x, y, z];
}

// FLOR: centro + pétalos
function generarFlor(centroX, centroY, centroZ, tamano) {
    const parte = Math.random();
    
    if (parte < 0.25) {
        // CENTRO de la flor (marrón oscuro)
        const r = Math.random() * tamano * 0.25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = centroX + r * Math.sin(phi) * Math.cos(theta);
        const y = centroY + r * Math.sin(phi) * Math.sin(theta);
        const z = centroZ + r * Math.cos(phi);
        return [x, y, z, 'centro'];
    } else {
        // PÉTALOS (amarillos)
        const numPetalos = 6 + Math.floor(Math.random() * 3);
        const anguloPetalo = Math.floor(Math.random() * numPetalos) * (Math.PI * 2 / numPetalos);
        const distancia = tamano * (0.4 + Math.random() * 0.4);
        
        // Forma de pétalo (elipse alargada)
        const anchoPetalo = tamano * 0.3;
        const largoPetalo = tamano * 0.8;
        const t = Math.random();
        const radioPetalo = Math.sqrt(Math.random());
        
        const px = Math.cos(anguloPetalo) * distancia + Math.cos(anguloPetalo + Math.PI/2) * (Math.random() - 0.5) * anchoPetalo;
        const py = Math.sin(anguloPetalo) * distancia + Math.sin(anguloPetalo + Math.PI/2) * (Math.random() - 0.5) * anchoPetalo;
        const pz = (Math.random() - 0.5) * tamano * 0.3;
        
        return [centroX + px, centroY + py * 0.6, centroZ + pz, 'petalo'];
    }
}

// --- GENERAR EL RAMO ---
// El ramo tiene varias flores en diferentes posiciones
const flores = [
    { x: 0, y: 4, z: 0, tamano: 2.0 },      // Flor central
    { x: -2.5, y: 3, z: 0.5, tamano: 1.7 },  // Flor izquierda
    { x: 2.5, y: 3.2, z: -0.5, tamano: 1.8 }, // Flor derecha
    { x: -1.2, y: 5, z: -0.8, tamano: 1.5 },  // Flor arriba izquierda
    { x: 1.5, y: 5.2, z: 0.8, tamano: 1.6 },  // Flor arriba derecha
    { x: 0, y: 6.2, z: 0, tamano: 1.4 },      // Flor superior
    { x: -3.5, y: 1.8, z: -0.5, tamano: 1.4 }, // Flor lateral izquierda
    { x: 3.5, y: 2, z: 0.5, tamano: 1.5 }     // Flor lateral derecha
];

// Distribuir partículas entre tallos, hojas y flores
let index = 0;
while (index < particleCount) {
    const tipo = Math.random();
    let targetX, targetY, targetZ;
    let colorHue, colorSat, colorLight;
    let size;
    
    if (tipo < 0.30) {
        // TALLOS (30%)
        // Cada tallo va desde la base hasta una flor
        const florIdx = Math.floor(Math.random() * flores.length);
        const flor = flores[florIdx];
        
        // Altura base del ramo
        const alturaBase = -6;
        const t = Math.random();
        const y = alturaBase + t * (flor.y - alturaBase);
        
        // El tallo se curva ligeramente hacia la flor
        const progreso = t;
        const x = flor.x * progreso * 0.8 + (Math.random() - 0.5) * 0.15;
        const z = flor.z * progreso * 0.8 + (Math.random() - 0.5) * 0.15;
        
        targetX = x;
        targetY = y;
        targetZ = z;
        
        // Color verde del tallo (variaciones)
        colorHue = 0.25 + Math.random() * 0.1;
        colorSat = 0.5 + Math.random() * 0.4;
        colorLight = 0.15 + Math.random() * 0.25;
        size = 0.15 + Math.random() * 0.15;
        
    } else if (tipo < 0.45) {
        // HOJAS (15%)
        const florIdx = Math.floor(Math.random() * flores.length);
        const flor = flores[florIdx];
        
        // Las hojas van en la parte media del tallo
        const t = 0.3 + Math.random() * 0.4;
        const y = -6 + t * (flor.y - (-6));
        const x = flor.x * t * 0.8;
        const z = flor.z * t * 0.8;
        
        const lado = Math.random() < 0.5 ? -1 : 1;
        const tamañoHoja = 0.4 + Math.random() * 0.3;
        
        targetX = x + lado * (0.3 + Math.random() * 0.5);
        targetY = y + (Math.random() - 0.5) * 0.3;
        targetZ = z + (Math.random() - 0.5) * 0.4;
        
        // Verde más claro para las hojas
        colorHue = 0.28 + Math.random() * 0.08;
        colorSat = 0.6 + Math.random() * 0.3;
        colorLight = 0.2 + Math.random() * 0.3;
        size = 0.2 + Math.random() * 0.2;
        
    } else {
        // FLORES (55%)
        const florIdx = Math.floor(Math.random() * flores.length);
        const flor = flores[florIdx];
        
        const [fx, fy, fz, parte] = generarFlor(flor.x, flor.y, flor.z, flor.tamano);
        
        targetX = fx;
        targetY = fy;
        targetZ = fz;
        
        if (parte === 'centro') {
            // Centro de la flor: marrón oscuro
            colorHue = 0.08;
            colorSat = 0.7;
            colorLight = 0.1 + Math.random() * 0.15;
            size = 0.15 + Math.random() * 0.15;
        } else {
            // Pétalos: AMARILLO (diferentes tonos)
            const variacion = Math.random();
            if (variacion < 0.3) {
                // Amarillo brillante
                colorHue = 0.13;
                colorSat = 1.0;
                colorLight = 0.5 + Math.random() * 0.3;
            } else if (variacion < 0.7) {
                // Amarillo dorado
                colorHue = 0.11;
                colorSat = 0.9;
                colorLight = 0.4 + Math.random() * 0.3;
            } else {
                // Amarillo claro
                colorHue = 0.15;
                colorSat = 0.8;
                colorLight = 0.6 + Math.random() * 0.3;
            }
            size = 0.2 + Math.random() * 0.25;
        }
    }
    
    targetPositions[index * 3] = targetX;
    targetPositions[index * 3 + 1] = targetY;
    targetPositions[index * 3 + 2] = targetZ;

    // Posición inicial (dispersa)
    let startX = (Math.random() - 0.5) * 200;
    let startY = (Math.random() - 0.5) * 200;
    let startZ = (Math.random() - 0.5) * 200;
    
    initialPositions[index * 3] = startX;
    initialPositions[index * 3 + 1] = startY;
    initialPositions[index * 3 + 2] = startZ;

    positions[index * 3] = startX;
    positions[index * 3 + 1] = startY;
    positions[index * 3 + 2] = startZ;

    color.setHSL(colorHue, colorSat, colorLight);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
    sizes[index] = size;

    index++;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Textura de partícula con brillo suave
const canvas = document.createElement('canvas');
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.3, 'rgba(255,240,180,0.9)');
gradient.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 64, 64);
const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true
});

const ramo = new THREE.Points(geometry, material);
scene.add(ramo);

// --- PARTÍCULAS DE POLEN (flotando alrededor del ramo) ---
const polenCount = 400;
const polenGeo = new THREE.BufferGeometry();
const polenPos = new Float32Array(polenCount * 3);
const polenVel = new Float32Array(polenCount * 3);
const polenColors = new Float32Array(polenCount * 3);

for (let i = 0; i < polenCount; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const radio = 2 + Math.random() * 8;
    const altura = (Math.random() - 0.5) * 12;
    
    polenPos[i * 3] = Math.cos(angulo) * radio;
    polenPos[i * 3 + 1] = altura;
    polenPos[i * 3 + 2] = Math.sin(angulo) * radio;
    
    polenVel[i * 3] = (Math.random() - 0.5) * 0.01;
    polenVel[i * 3 + 1] = 0.003 + Math.random() * 0.008;
    polenVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    
    // Polen: dorado brillante
    color.setHSL(0.12, 0.9, 0.5 + Math.random() * 0.4);
    polenColors[i * 3] = color.r;
    polenColors[i * 3 + 1] = color.g;
    polenColors[i * 3 + 2] = color.b;
}

polenGeo.setAttribute('position', new THREE.BufferAttribute(polenPos, 3));
polenGeo.setAttribute('color', new THREE.BufferAttribute(polenColors, 3));

const polenMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const polen = new THREE.Points(polenGeo, polenMat);
scene.add(polen);

// --- LUCIÉRNAGAS (puntos brillantes que flotan) ---
const luciernagaCount = 60;
const luciernagaGeo = new THREE.BufferGeometry();
const luciernagaPos = new Float32Array(luciernagaCount * 3);
const luciernagaVel = new Float32Array(luciernagaCount * 3);
const luciernagaFase = new Float32Array(luciernagaCount);

for (let i = 0; i < luciernagaCount; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const radio = 5 + Math.random() * 10;
    
    luciernagaPos[i * 3] = Math.cos(angulo) * radio;
    luciernagaPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
    luciernagaPos[i * 3 + 2] = Math.sin(angulo) * radio;
    
    luciernagaVel[i * 3] = (Math.random() - 0.5) * 0.02;
    luciernagaVel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    luciernagaVel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    
    luciernagaFase[i] = Math.random() * Math.PI * 2;
}

luciernagaGeo.setAttribute('position', new THREE.BufferAttribute(luciernagaPos, 3));

const luciernagaMat = new THREE.PointsMaterial({
    size: 0.3,
    color: 0xffdd44,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const luciernagas = new THREE.Points(luciernagaGeo, luciernagaMat);
scene.add(luciernagas);

// --- ESTRELLAS DE FONDO ---
const bgCount = 2500;
const bgGeo = new THREE.BufferGeometry();
const bgPos = new Float32Array(bgCount * 3);
const bgColors = new Float32Array(bgCount * 3);

for (let i = 0; i < bgCount; i++) {
    const r = 40 + Math.random() * 150;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    bgPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    bgPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    bgPos[i * 3 + 2] = r * Math.cos(phi);
    
    const brightness = 0.08 + Math.random() * 0.25;
    bgColors[i * 3] = brightness;
    bgColors[i * 3 + 1] = brightness * 0.9;
    bgColors[i * 3 + 2] = brightness * 0.5;
}

bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
bgGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

const bgMat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const bgStars = new THREE.Points(bgGeo, bgMat);
scene.add(bgStars);

// Variables de animación
let isAnimating = false;
let animationProgress = 0;
let time = 0;

// Bucle principal
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    time += 0.01;

    // Balanceo suave del ramo (como si lo mecara el viento)
    ramo.rotation.z = Math.sin(time * 0.5) * 0.03;
    ramo.rotation.y += 0.0015;
    ramo.rotation.x = Math.sin(time * 0.3) * 0.02;
    
    bgStars.rotation.y += 0.0001;

    // --- POLEN FLOTANDO ---
    if (animationProgress > 0.4) {
        polenMat.opacity = Math.min((animationProgress - 0.4) * 3, 0.7);
        
        const polenPosAttr = polenGeo.attributes.position.array;
        for (let i = 0; i < polenCount; i++) {
            polenPosAttr[i * 3] += polenVel[i * 3] + Math.sin(time + i) * 0.002;
            polenPosAttr[i * 3 + 1] += polenVel[i * 3 + 1];
            polenPosAttr[i * 3 + 2] += polenVel[i * 3 + 2] + Math.cos(time + i) * 0.002;
            
            // Reiniciar si sube demasiado
            if (polenPosAttr[i * 3 + 1] > 12) {
                const angulo = Math.random() * Math.PI * 2;
                const radio = 2 + Math.random() * 8;
                polenPosAttr[i * 3] = Math.cos(angulo) * radio;
                polenPosAttr[i * 3 + 1] = -8 - Math.random() * 2;
                polenPosAttr[i * 3 + 2] = Math.sin(angulo) * radio;
            }
        }
        polenGeo.attributes.position.needsUpdate = true;
    }

    // --- LUCIÉRNAGAS ---
    if (animationProgress > 0.6) {
        luciernagaMat.opacity = Math.min((animationProgress - 0.6) * 3, 0.9);
        
        const lucPos = luciernagaGeo.attributes.position.array;
        for (let i = 0; i < luciernagaCount; i++) {
            lucPos[i * 3] += luciernagaVel[i * 3] + Math.sin(time * 2 + luciernagaFase[i]) * 0.01;
            lucPos[i * 3 + 1] += luciernagaVel[i * 3 + 1] + Math.cos(time * 1.5 + luciernagaFase[i]) * 0.01;
            lucPos[i * 3 + 2] += luciernagaVel[i * 3 + 2] + Math.sin(time * 1.8 + luciernagaFase[i]) * 0.01;
            
            // Mantener cerca del ramo
            const dist = Math.sqrt(lucPos[i*3]*lucPos[i*3] + lucPos[i*3+2]*lucPos[i*3+2]);
            if (dist > 15) {
                luciernagaVel[i * 3] *= -1;
                luciernagaVel[i * 3 + 2] *= -1;
            }
            if (Math.abs(lucPos[i * 3 + 1]) > 12) {
                luciernagaVel[i * 3 + 1] *= -1;
            }
        }
        luciernagaGeo.attributes.position.needsUpdate = true;
        
        // Parpadeo de luciérnagas
        luciernagaMat.size = 0.3 + Math.sin(time * 3) * 0.1;
    }

    // --- ANIMACIÓN DE FORMACIÓN ---
    if (isAnimating && animationProgress < 1) {
        animationProgress += 0.0022;
        const ease = 1 - Math.pow(1 - animationProgress, 3);
        material.opacity = Math.min(ease * 2.5, 1);

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i++) {
            pos[i] = initialPositions[i] + (targetPositions[i] - initialPositions[i]) * ease;
        }
        geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}
animate();

// Ajuste de pantalla
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Evento del botón
btn.addEventListener('click', () => {
    btn.style.transition = "opacity 0.5s ease";
    btn.style.opacity = "0";
    
    setTimeout(() => {
        btn.style.display = 'none';
        isAnimating = true;
        
        setTimeout(() => {
            msg.style.opacity = "1";
        }, 3500);
    }, 500);
});