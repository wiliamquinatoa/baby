// Configuración básica de la escena
const container = document.getElementById('canvas-container');
const btn = document.getElementById('start-btn');
const msg = document.getElementById('message');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 24);
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

// --- CONFIGURACIÓN DEL RAMO DE NOMEOLVIDES ---
const particleCount = 20000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const color = new THREE.Color();

// --- FUNCIONES PARA GENERAR LAS PARTES ---

// FLOR: pétalos azules + centro amarillo
function generarFlor(centroX, centroY, centroZ, tamano, numPetalos) {
    const parte = Math.random();
    const esCentro = parte < 0.2; // 20% centro, 80% pétalos
    
    if (esCentro) {
        // CENTRO AMARILLO con puntitos
        const r = Math.random() * tamano * 0.3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = centroX + r * Math.sin(phi) * Math.cos(theta);
        const y = centroY + r * Math.sin(phi) * Math.sin(theta);
        const z = centroZ + r * Math.cos(phi);
        
        // Pequeños puntitos marrones/naranjas dentro del centro
        const esPuntito = Math.random() < 0.15;
        if (esPuntito) {
            color.setHSL(0.08, 1.0, 0.3 + Math.random() * 0.2); // Naranja/marrón
        } else {
            color.setHSL(0.13, 1.0, 0.5 + Math.random() * 0.3); // Amarillo brillante
        }
        
        return [x, y, z, color];
    } else {
        // PÉTALOS AZULES (5 pétalos como la flor real)
        const petaloIdx = Math.floor(Math.random() * numPetalos);
        const anguloPetalo = (petaloIdx / numPetalos) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        
        // Cada pétalo es una elipse alargada
        const distanciaBase = tamano * 0.3;
        const largoPetalo = tamano * 0.9;
        const anchoPetalo = tamano * 0.45;
        
        // Posición dentro del pétalo (elipse)
        const t = Math.random();
        const radio = Math.sqrt(Math.random()); // Distribución uniforme en elipse
        
        // Coordenadas locales del pétalo (eje X = largo, Y = ancho)
        const localX = distanciaBase + t * largoPetalo * 0.8;
        const localY = (Math.random() - 0.5) * anchoPetalo * (1 - t * 0.5); // Se estrecha al final
        
        // Rotar el pétalo según su ángulo
        const x = centroX + Math.cos(anguloPetalo) * localX - Math.sin(anguloPetalo) * localY;
        const y = centroY + Math.sin(anguloPetalo) * localX + Math.cos(anguloPetalo) * localY;
        const z = centroZ + (Math.random() - 0.5) * tamano * 0.2;
        
        // COLOR AZUL con degradado (más claro en la punta, más oscuro cerca del centro)
        const gradiente = t; // 0 = cerca del centro, 1 = punta
        const hue = 0.55 + gradiente * 0.05; // Azul a azul más claro
        const sat = 0.7 + gradiente * 0.3;
        const light = 0.3 + gradiente * 0.4; // Más claro en las puntas
        
        // Variación aleatoria para dar textura
        color.setHSL(
            hue + (Math.random() - 0.5) * 0.03,
            sat + (Math.random() - 0.5) * 0.1,
            light + (Math.random() - 0.5) * 0.1
        );
        
        return [x, y, z, color];
    }
}

// HOJA: forma de elipse alargada verde
function generarHoja(baseX, baseY, baseZ, tamano, angulo, curvatura) {
    const t = Math.random();
    
    // Hoja: elipse alargada
    const largoHoja = tamano * 2.5;
    const anchoHoja = tamano * 0.8;
    
    // Coordenadas locales
    const localX = (t - 0.5) * largoHoja;
    const localY = (Math.random() - 0.5) * anchoHoja * Math.sin(t * Math.PI); // Se estrecha en los extremos
    
    // Curvatura de la hoja
    const curvaY = Math.sin(t * Math.PI) * curvatura;
    
    // Rotar según ángulo
    const x = baseX + Math.cos(angulo) * localX - Math.sin(angulo) * localY;
    const y = baseY + Math.sin(angulo) * localX + Math.cos(angulo) * localY + curvaY;
    const z = baseZ + (Math.random() - 0.5) * tamano * 0.3;
    
    // Verde con degradado (más oscuro en el centro, más claro en los bordes)
    const intensidad = Math.sin(t * Math.PI); // 0 en los extremos, 1 en el centro
    color.setHSL(
        0.3 + Math.random() * 0.05,
        0.7 + Math.random() * 0.3,
        0.15 + intensidad * 0.2 + Math.random() * 0.1
    );
    
    return [x, y, z, color];
}

// TALLO: línea curva verde
function generarTallo(desdeX, desdeY, desdeZ, hastaX, hastaY, hastaZ) {
    const t = Math.random();
    
    // Interpolación con curvatura
    const curvaX = Math.sin(t * Math.PI) * 0.5;
    const curvaZ = Math.cos(t * Math.PI) * 0.3;
    
    const x = desdeX + (hastaX - desdeX) * t + curvaX * 0.5;
    const y = desdeY + (hastaY - desdeY) * t;
    const z = desdeZ + (hastaZ - desdeZ) * t + curvaZ * 0.5;
    
    // Verde oscuro del tallo
    color.setHSL(
        0.28 + Math.random() * 0.05,
        0.6 + Math.random() * 0.3,
        0.12 + Math.random() * 0.15
    );
    
    return [x, y, z, color];
}

// --- POSICIONES DE LAS FLORES (como en la imagen) ---
// Grupo izquierdo (5 flores)
const floresIzquierda = [
    { x: -3.5, y: 2.5, z: 0, tamano: 1.6, petalos: 5 },  // Flor principal izquierda
    { x: -5, y: 1.2, z: 0.3, tamano: 1.3, petalos: 5 },   // Flor abajo izquierda
    { x: -4.5, y: 3.8, z: -0.3, tamano: 1.4, petalos: 5 },// Flor arriba izquierda
    { x: -2.2, y: 3.8, z: 0.4, tamano: 1.3, petalos: 5 }, // Flor arriba derecha
    { x: -3.2, y: 0.8, z: -0.4, tamano: 1.2, petalos: 5 } // Flor abajo centro
];

// Grupo derecho (4 flores)
const floresDerecha = [
    { x: 3, y: 2.8, z: 0, tamano: 1.5, petalos: 5 },      // Flor principal derecha
    { x: 4.8, y: 2, z: 0.3, tamano: 1.3, petalos: 5 },    // Flor arriba derecha
    { x: 3.5, y: 1.2, z: -0.3, tamano: 1.4, petalos: 5 }, // Flor abajo derecha
    { x: 5.2, y: 3.5, z: -0.2, tamano: 1.2, petalos: 5 }  // Flor arriba extrema
];

const todasLasFlores = [...floresIzquierda, ...floresDerecha];

// --- DISTRIBUCIÓN DE PARTÍCULAS ---
let index = 0;
while (index < particleCount) {
    const tipo = Math.random();
    let targetX, targetY, targetZ;
    let partColor;
    
    if (tipo < 0.55) {
        // FLORES (55%)
        const flor = todasLasFlores[Math.floor(Math.random() * todasLasFlores.length)];
        const [fx, fy, fz, c] = generarFlor(flor.x, flor.y, flor.z, flor.tamano, flor.petalos);
        targetX = fx;
        targetY = fy;
        targetZ = fz;
        partColor = c;
        
    } else if (tipo < 0.75) {
        // HOJAS (20%)
        // Hojas grandes que salen de los tallos
        const hojaTipo = Math.floor(Math.random() * 6);
        const hojas = [
            // Hoja izquierda superior (grande)
            () => generarHoja(-4, 1, 0, 1.2, Math.PI * 0.7, 0.5),
            // Hoja izquierda inferior
            () => generarHoja(-4.5, 0, 0, 1.0, Math.PI * 0.8, -0.3),
            // Hoja derecha superior
            () => generarHoja(3.5, 1.5, 0, 1.1, Math.PI * 0.3, 0.4),
            // Hoja derecha inferior
            () => generarHoja(4, 0.5, 0, 0.9, Math.PI * 0.2, -0.4),
            // Hoja central izquierda
            () => generarHoja(-2.5, 0.5, 0, 0.8, Math.PI * 0.75, 0.3),
            // Hoja central derecha
            () => generarHoja(2.5, 0.8, 0, 0.85, Math.PI * 0.25, -0.3)
        ];
        const [hx, hy, hz, c] = hojas[hojaTipo]();
        targetX = hx;
        targetY = hy;
        targetZ = hz;
        partColor = c;
        
    } else {
        // TALLOS (25%)
        // Tallos que conectan las flores
        const talloTipo = Math.floor(Math.random() * 6);
        let desde, hasta;
        
        if (talloTipo === 0) {
            desde = { x: -2, y: -5, z: 0 };
            hasta = { x: -3.5, y: 2.5, z: 0 };
        } else if (talloTipo === 1) {
            desde = { x: -2, y: -5, z: 0 };
            hasta = { x: -5, y: 1.2, z: 0 };
        } else if (talloTipo === 2) {
            desde = { x: -2, y: -5, z: 0 };
            hasta = { x: -4.5, y: 3.8, z: 0 };
        } else if (talloTipo === 3) {
            desde = { x: 2, y: -5, z: 0 };
            hasta = { x: 3, y: 2.8, z: 0 };
        } else if (talloTipo === 4) {
            desde = { x: 2, y: -5, z: 0 };
            hasta = { x: 4.8, y: 2, z: 0 };
        } else {
            desde = { x: 2, y: -5, z: 0 };
            hasta = { x: 5.2, y: 3.5, z: 0 };
        }
        
        const [tx, ty, tz, c] = generarTallo(desde.x, desde.y, desde.z, hasta.x, hasta.y, hasta.z);
        targetX = tx;
        targetY = ty;
        targetZ = tz;
        partColor = c;
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

    colors[index * 3] = partColor.r;
    colors[index * 3 + 1] = partColor.g;
    colors[index * 3 + 2] = partColor.b;

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
gradient.addColorStop(0.4, 'rgba(200,230,255,0.9)');
gradient.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 64, 64);
const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
    size: 0.25,
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

// --- PARTÍCULAS DE POLEN DORADO ---
const polenCount = 300;
const polenGeo = new THREE.BufferGeometry();
const polenPos = new Float32Array(polenCount * 3);
const polenVel = new Float32Array(polenCount * 3);
const polenColors = new Float32Array(polenCount * 3);

for (let i = 0; i < polenCount; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const radio = 3 + Math.random() * 8;
    
    polenPos[i * 3] = Math.cos(angulo) * radio;
    polenPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    polenPos[i * 3 + 2] = Math.sin(angulo) * radio;
    
    polenVel[i * 3] = (Math.random() - 0.5) * 0.01;
    polenVel[i * 3 + 1] = 0.003 + Math.random() * 0.008;
    polenVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    
    // Polen dorado
    color.setHSL(0.13, 0.9, 0.5 + Math.random() * 0.4);
    polenColors[i * 3] = color.r;
    polenColors[i * 3 + 1] = color.g;
    polenColors[i * 3 + 2] = color.b;
}

polenGeo.setAttribute('position', new THREE.BufferAttribute(polenPos, 3));
polenGeo.setAttribute('color', new THREE.BufferAttribute(polenColors, 3));

const polenMat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

const polen = new THREE.Points(polenGeo, polenMat);
scene.add(polen);

// --- LUCIÉRNAGAS ---
const luciernagaCount = 50;
const luciernagaGeo = new THREE.BufferGeometry();
const luciernagaPos = new Float32Array(luciernagaCount * 3);
const luciernagaVel = new Float32Array(luciernagaCount * 3);
const luciernagaFase = new Float32Array(luciernagaCount);

for (let i = 0; i < luciernagaCount; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const radio = 6 + Math.random() * 10;
    
    luciernagaPos[i * 3] = Math.cos(angulo) * radio;
    luciernagaPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    luciernagaPos[i * 3 + 2] = Math.sin(angulo) * radio;
    
    luciernagaVel[i * 3] = (Math.random() - 0.5) * 0.02;
    luciernagaVel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    luciernagaVel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    
    luciernagaFase[i] = Math.random() * Math.PI * 2;
}

luciernagaGeo.setAttribute('position', new THREE.BufferAttribute(luciernagaPos, 3));

const luciernagaMat = new THREE.PointsMaterial({
    size: 0.25,
    color: 0xaaddff, // Azul claro (como las flores)
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
    
    // Estrellas azuladas/blancas (como las flores)
    const brightness = 0.08 + Math.random() * 0.25;
    bgColors[i * 3] = brightness * 0.7;
    bgColors[i * 3 + 1] = brightness * 0.9;
    bgColors[i * 3 + 2] = brightness;
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

    // Balanceo suave del ramo
    ramo.rotation.z = Math.sin(time * 0.4) * 0.04;
    ramo.rotation.y += 0.001;
    ramo.rotation.x = Math.sin(time * 0.25) * 0.02;
    
    bgStars.rotation.y += 0.0001;

    // --- POLEN ---
    if (animationProgress > 0.4) {
        polenMat.opacity = Math.min((animationProgress - 0.4) * 3, 0.7);
        
        const polenPosAttr = polenGeo.attributes.position.array;
        for (let i = 0; i < polenCount; i++) {
            polenPosAttr[i * 3] += polenVel[i * 3] + Math.sin(time + i) * 0.002;
            polenPosAttr[i * 3 + 1] += polenVel[i * 3 + 1];
            polenPosAttr[i * 3 + 2] += polenVel[i * 3 + 2] + Math.cos(time + i) * 0.002;
            
            if (polenPosAttr[i * 3 + 1] > 12) {
                const angulo = Math.random() * Math.PI * 2;
                const radio = 3 + Math.random() * 8;
                polenPosAttr[i * 3] = Math.cos(angulo) * radio;
                polenPosAttr[i * 3 + 1] = -8 - Math.random() * 2;
                polenPosAttr[i * 3 + 2] = Math.sin(angulo) * radio;
            }
        }
        polenGeo.attributes.position.needsUpdate = true;
    }

    // --- LUCIÉRNAGAS ---
    if (animationProgress > 0.6) {
        luciernagaMat.opacity = Math.min((animationProgress - 0.6) * 3, 0.8);
        
        const lucPos = luciernagaGeo.attributes.position.array;
        for (let i = 0; i < luciernagaCount; i++) {
            lucPos[i * 3] += luciernagaVel[i * 3] + Math.sin(time * 2 + luciernagaFase[i]) * 0.01;
            lucPos[i * 3 + 1] += luciernagaVel[i * 3 + 1] + Math.cos(time * 1.5 + luciernagaFase[i]) * 0.01;
            lucPos[i * 3 + 2] += luciernagaVel[i * 3 + 2] + Math.sin(time * 1.8 + luciernagaFase[i]) * 0.01;
            
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
        luciernagaMat.size = 0.25 + Math.sin(time * 3) * 0.08;
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
