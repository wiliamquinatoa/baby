document.addEventListener('DOMContentLoaded', () => {
  const hojas = Array.from(document.querySelectorAll('.hoja'));
  const total = hojas.length;
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const indicador = document.getElementById('indicador');

  // estado: cuántas hojas están volteadas (0 = libro cerrado, total = libro terminado)
  let abiertas = 0;

  const etiquetas = [
    'Portada cerrada',
    'Página 1',
    'Páginas 2 y 3',
    'Página 4',
    'Página final'
  ];

  function actualizarZIndex() {
    hojas.forEach((hoja, i) => {
      const volteada = i < abiertas;
      // hoja sin voltear: se apila a la derecha, la primera pendiente arriba (z bajo = 1..total)
      // hoja ya volteada: se apila a la izquierda, SIEMPRE por encima de las pendientes,
      // y entre las volteadas, la más reciente queda arriba
      hoja.style.zIndex = volteada ? (total + i + 1) : (total - i);
      hoja.classList.toggle('volteada', volteada);
    });
    mostrarCaraActual();
  }

  function actualizarControles() {
    btnPrev.disabled = abiertas === 0;
    btnNext.disabled = abiertas === total;
    indicador.textContent = etiquetas[abiertas] ?? '';

    document.querySelectorAll('.pestana').forEach((pestana) => {
      pestana.classList.toggle('activa', Number(pestana.dataset.ir) === abiertas);
    });

    if (abiertas === total) {
      iniciarFinalEspectacular();
    } else {
      detenerFinalEspectacular();
    }
  }

  function siguiente() {
    if (abiertas >= total) return;
    abiertas++;
    actualizarZIndex();
    actualizarControles();
  }

  function anterior() {
    if (abiertas <= 0) return;
    abiertas--;
    actualizarZIndex();
    actualizarControles();
  }

  // Click directo sobre una hoja: si está arriba de la pila, la voltea
  hojas.forEach((hoja, i) => {
    hoja.addEventListener('click', () => {
      if (i === abiertas) siguiente();
      else if (i === abiertas - 1) anterior();
    });
  });

  btnNext.addEventListener('click', siguiente);
  btnPrev.addEventListener('click', anterior);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') siguiente();
    if (e.key === 'ArrowLeft') anterior();
  });

  actualizarZIndex();
//   actualizarControles();

  // ==========================================
  // MÚSICA
  // ==========================================
  const audio = document.getElementById('audio-fondo');
  const btnMusica = document.getElementById('btn-musica');

  btnMusica.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // El navegador puede bloquear la reproducción automática; con el clic ya es un gesto del usuario
      });
      btnMusica.classList.add('sonando');
      btnMusica.setAttribute('aria-pressed', 'true');
      btnMusica.setAttribute('aria-label', 'Pausar música');
    } else {
      audio.pause();
      btnMusica.classList.remove('sonando');
      btnMusica.setAttribute('aria-pressed', 'false');
      btnMusica.setAttribute('aria-label', 'Reproducir música');
    }
  });

  // ==========================================
  // PARTÍCULAS BRILLANTES AMBIENTALES
  // ==========================================
  const capaParticulas = document.getElementById('capa-particulas');
  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function crearParticula() {
    const p = document.createElement('div');
    p.className = 'particula';
    const tam = 2 + Math.random() * 3;
    p.style.width = `${tam}px`;
    p.style.height = `${tam}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.setProperty('--brillo-max', (0.4 + Math.random() * 0.5).toFixed(2));
    p.style.animationDuration = `${4 + Math.random() * 5}s`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    capaParticulas.appendChild(p);
  }

  if (!prefiereMenosMovimiento) {
    for (let i = 0; i < 40; i++) crearParticula();
  }

  // ==========================================
  // PÉTALOS Y ROSAS CAYENDO
  // ==========================================
  const capaPetalos = document.getElementById('capa-petalos');
  const simbolosPetalo = ['🌸', '🌹', '💮'];

  function crearPetalo() {
    const petalo = document.createElement('span');
    petalo.className = 'petalo';
    petalo.textContent = simbolosPetalo[Math.floor(Math.random() * simbolosPetalo.length)];
    petalo.style.left = `${Math.random() * 100}%`;
    petalo.style.fontSize = `${14 + Math.random() * 14}px`;
    petalo.style.setProperty('--deriva', `${(Math.random() * 160 - 80).toFixed(0)}px`);
    petalo.style.setProperty('--giro', `${(Math.random() * 360 + 180).toFixed(0)}deg`);
    petalo.style.animationDuration = `${7 + Math.random() * 8}s`;
    capaPetalos.appendChild(petalo);

    // se elimina del DOM al terminar su caída para no acumular nodos
    setTimeout(() => petalo.remove(), 16000);
  }

  if (!prefiereMenosMovimiento) {
    crearPetalo();
    setInterval(crearPetalo, 900);
  }

  // ==========================================
  // CORAZONES SIGUIENDO EL MOUSE
  // ==========================================
  const capaCorazones = document.getElementById('capa-corazones');
  let ultimoCorazon = 0;

  function crearCorazon(x, y) {
    const ahora = Date.now();
    if (ahora - ultimoCorazon < 120) return; // limita la frecuencia
    ultimoCorazon = ahora;

    const corazon = document.createElement('span');
    corazon.className = 'corazon-cursor';
    corazon.textContent = '❤';
    corazon.style.left = `${x}px`;
    corazon.style.top = `${y}px`;
    capaCorazones.appendChild(corazon);
    setTimeout(() => corazon.remove(), 1500);
  }

  if (!prefiereMenosMovimiento) {
    window.addEventListener('mousemove', (e) => crearCorazon(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) crearCorazon(t.clientX, t.clientY);
    }, { passive: true });
  }

  // ==========================================
  // TEXTO QUE SE ESCRIBE SOLO
  // ==========================================
  function escribirTexto(elemento) {
    if (!elemento || elemento.dataset.escrito === 'true') return;
    elemento.dataset.escrito = 'true';

    const texto = elemento.textContent.trim();
    elemento.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor-escritura';
    elemento.appendChild(cursor);

    let i = 0;
    function siguienteLetra() {
      cursor.insertAdjacentText('beforebegin', texto[i]);
      i++;
      if (i < texto.length) {
        setTimeout(siguienteLetra, 32);
      } else {
        setTimeout(() => cursor.remove(), 900);
      }
    }
    setTimeout(siguienteLetra, 250);
  }

  // Determina qué cara está actualmente visible (comparando z-index reales)
  // y dispara su efecto de escritura la primera vez que se muestra
  function mostrarCaraActual() {
    if (abiertas === 0) return; // la portada no lleva efecto de escritura

    const frenteActual = abiertas < total ? hojas[abiertas].querySelector('.cara-frente') : null;
    const dorsoPrevio = hojas[abiertas - 1].querySelector('.cara-dorso');

    let caraVisible = dorsoPrevio;
    if (frenteActual) {
      const zDorso = parseInt(hojas[abiertas - 1].style.zIndex, 10);
      const zFrente = parseInt(hojas[abiertas].style.zIndex, 10);
      caraVisible = zFrente > zDorso ? frenteActual : dorsoPrevio;
    }

    const texto = caraVisible.querySelector('.texto-pagina, .contenido-final p');
    escribirTexto(texto);
  }

  // ==========================================
  // LUZ E INCLINACIÓN QUE SIGUEN AL MOUSE
  // ==========================================
  const perspectiva = document.getElementById('perspectiva');
  const libroTilt = document.getElementById('libro-tilt');
  const brilloLibro = document.getElementById('brillo-libro');

  if (!prefiereMenosMovimiento && window.matchMedia('(hover: hover)').matches) {
    perspectiva.addEventListener('mousemove', (e) => {
      const rect = perspectiva.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0 a 1
      const y = (e.clientY - rect.top) / rect.height;    // 0 a 1

      libroTilt.style.setProperty('--tilt-x', ((x - 0.5) * 14).toFixed(2));
      libroTilt.style.setProperty('--tilt-y', ((y - 0.5) * 14).toFixed(2));

      brilloLibro.style.setProperty('--luz-x', `${x * 100}%`);
      brilloLibro.style.setProperty('--luz-y', `${y * 100}%`);
      brilloLibro.classList.add('activa');
    });

    perspectiva.addEventListener('mouseleave', () => {
      libroTilt.style.setProperty('--tilt-x', 0);
      libroTilt.style.setProperty('--tilt-y', 0);
      brilloLibro.classList.remove('activa');
    });
  }

  // dispara el efecto de escritura para el estado inicial (portada, sin texto)
  mostrarCaraActual();

  // ==========================================
  // MARCADOR DEL LIBRO (saltar directo a una página)
  // ==========================================
  document.querySelectorAll('.pestana').forEach((pestana) => {
    pestana.addEventListener('click', () => {
      abiertas = Number(pestana.dataset.ir);
      actualizarZIndex();
      actualizarControles();
    });
  });

  // ==========================================
  // CONTADOR DEL TIEMPO JUNTOS
  // ==========================================
  // 👉 Cambia esta fecha por la de ustedes (año, mes-1, día, hora, minuto)
  const FECHA_INICIO = new Date(2022, 9, 7, 14, 21, 0);
  const spanContador = document.getElementById('contador-valores');

  function actualizarContador() {
    const diferencia = Date.now() - FECHA_INICIO.getTime();
    if (diferencia < 0 || !spanContador) return;

    const segundosTotales = Math.floor(diferencia / 1000);
    const dias = Math.floor(segundosTotales / 86400);
    const horas = Math.floor((segundosTotales % 86400) / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    spanContador.textContent =
      `${dias} días, ${horas}h ${minutos}m ${segundos}s`;
  }

  actualizarContador();
  setInterval(actualizarContador, 1000);

  // ==========================================
  // MODAL REUTILIZABLE (cartas ocultas y video)
  // ==========================================
  const modalFondo = document.getElementById('modal-fondo');
  const modalContenido = document.getElementById('modal-contenido');
  const modalCerrar = document.getElementById('modal-cerrar');

  function abrirModal(html) {
    modalContenido.innerHTML = html;
    modalFondo.classList.add('visible');
  }

  function cerrarModal() {
    modalFondo.classList.remove('visible');
    // se detiene cualquier video que estuviera reproduciéndose
    const video = modalContenido.querySelector('video');
    if (video) video.pause();
    setTimeout(() => { modalContenido.innerHTML = ''; }, 250);
  }

  modalCerrar.addEventListener('click', cerrarModal);
  modalFondo.addEventListener('click', (e) => {
    if (e.target === modalFondo) cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // ==========================================
  // CARTAS OCULTAS
  // ==========================================
  // 👉 Escribe aquí el mensaje secreto de cada sobre (mismo orden que data-carta="0,1,2,3,4")
  const mensajesSecretos = [
  'Selena, cuando te conocí no sabía que me estabas salvando de la soledad más profunda. Tú llegaste sin pedir nada, y sin darte cuenta, te convertiste en la primera persona en la que confié. Gracias por haber sido mi refugio.',
  'El día que te vi en Ecuador supe que no eras una persona cualquiera. Eras la persona que desafiaría al mundo solo para estar conmigo. Y yo, en silencio, te prometí que nunca olvidaría ese gesto.',
  'Las madrugadas no eran pesadas, porque esperaba tu voz. Cada llamada, cada risa, cada silencio compartido... todo eso fue más valioso que cualquier relación que pude haber tenido. Fuiste mi tiempo favorito.',
  'Cuando te dije que te amaba y tú me dijiste "no podemos", sentí que el mundo se detenía. Pero entendí que no lo decías por falta de amor, sino por exceso de miedo. Nunca te reproché nada. Solo quise que supieras que siempre estuve, y siempre estaré.',
  'Hoy es tu día, Selena. Y aunque nuestras conversaciones ya no sean las mismas, aunque el silencio a veces sea más largo que las palabras, quiero que sepas algo que nunca te dije: Me enseñaste a confiar, a abrirme, a querer. Puede que el destino nos haya puesto en caminos diferentes, pero siempre serás la persona que me hizo sentir que no estaba solo. Gracias por existir. Te quiero. Siempre.'
];

  document.querySelectorAll('.sobre-carta').forEach((sobre) => {
    sobre.addEventListener('click', (e) => {
      e.stopPropagation(); // evita que el clic también voltee la hoja
      const indice = Number(sobre.dataset.carta);
      abrirModal(`
        <h3>Una carta para ti</h3>
        <p>${mensajesSecretos[indice] ?? ''}</p>
      `);
    });
  });

  // ==========================================
  // FOTOS VOLTEABLES (pequeños recuerdos interactivos)
  // ==========================================
  document.querySelectorAll('.foto-flip').forEach((foto) => {
    function alternar(e) {
      e.stopPropagation(); // evita que el clic también voltee la hoja del libro
      foto.classList.toggle('volteada');
    }
    foto.addEventListener('click', alternar);
    foto.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') alternar(e);
    });
  });

  // ==========================================
  // VIDEO SORPRESA
  // ==========================================
  const botonVideo = document.getElementById('boton-video');
  if (botonVideo) {
    botonVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModal(`
        <h3>Nuestro video</h3>
        <video controls playsinline>
          <!-- Coloca tu archivo dentro de la carpeta videos/ y actualiza el nombre aquí -->
          <source src="videos/recuerdo.mp4" type="video/mp4">
        </video>
      `);
      // reproduce automáticamente al abrir (gesto de usuario ya realizado con el clic)
      setTimeout(() => {
        const video = modalContenido.querySelector('video');
        if (video) video.play().catch(() => {});
      }, 100);
    });
  }

  // ==========================================
  // ESTRELLAS DEL CIELO NOCTURNO
  // ==========================================
  const capaEstrellas = document.getElementById('capa-estrellas');
  for (let i = 0; i < 60; i++) {
    const estrella = document.createElement('div');
    estrella.className = 'estrella';
    estrella.style.left = `${Math.random() * 100}%`;
    estrella.style.top = `${Math.random() * 70}%`;
    estrella.style.animationDelay = `${Math.random() * 3}s`;
    capaEstrellas.appendChild(estrella);
  }

  // ==========================================
  // FUEGOS ARTIFICIALES (canvas)
  // ==========================================
  const canvasFuegos = document.getElementById('canvas-fuegos');
  const ctxFuegos = canvasFuegos.getContext('2d');
  let particulasFuegos = [];
  let idAnimacionFuegos = null;
  let idIntervaloCohetes = null;

  function ajustarTamanoCanvas() {
    canvasFuegos.width = window.innerWidth;
    canvasFuegos.height = window.innerHeight;
  }
  window.addEventListener('resize', ajustarTamanoCanvas);
  ajustarTamanoCanvas();

  const coloresFuegos = ['#e4c878', '#7c2d3b', '#fbf6ec', '#c9a24b', '#a94456'];

  function lanzarCohete() {
    const x = canvasFuegos.width * (0.2 + Math.random() * 0.6);
    const yDestino = canvasFuegos.height * (0.15 + Math.random() * 0.35);
    const color = coloresFuegos[Math.floor(Math.random() * coloresFuegos.length)];
    const cantidad = 46;

    for (let i = 0; i < cantidad; i++) {
      const angulo = (Math.PI * 2 * i) / cantidad;
      const velocidad = 2.2 + Math.random() * 2.2;
      particulasFuegos.push({
        x, y: yDestino,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        vida: 1,
        color
      });
    }
  }

  function animarFuegos() {
    ctxFuegos.fillStyle = 'rgba(18,13,10,0.18)';
    ctxFuegos.fillRect(0, 0, canvasFuegos.width, canvasFuegos.height);

    particulasFuegos.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravedad suave
      p.vida -= 0.012;

      ctxFuegos.globalAlpha = Math.max(p.vida, 0);
      ctxFuegos.fillStyle = p.color;
      ctxFuegos.beginPath();
      ctxFuegos.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctxFuegos.fill();
    });
    ctxFuegos.globalAlpha = 1;

    particulasFuegos = particulasFuegos.filter((p) => p.vida > 0);
    idAnimacionFuegos = requestAnimationFrame(animarFuegos);
  }

  function iniciarFuegosArtificiales() {
    canvasFuegos.classList.add('activo');
    if (!idAnimacionFuegos) animarFuegos();
    lanzarCohete();
    idIntervaloCohetes = setInterval(lanzarCohete, 900);
  }

  function detenerFuegosArtificiales() {
    canvasFuegos.classList.remove('activo');
    clearInterval(idIntervaloCohetes);
    idIntervaloCohetes = null;
    if (idAnimacionFuegos) {
      cancelAnimationFrame(idAnimacionFuegos);
      idAnimacionFuegos = null;
    }
    particulasFuegos = [];
    ctxFuegos.clearRect(0, 0, canvasFuegos.width, canvasFuegos.height);
  }

  // ==========================================
  // MILES DE CORAZONES (estallido final)
  // ==========================================
  const capaCorazonesFinal = document.getElementById('capa-corazones-final');
  let idIntervaloCorazonesFinal = null;

  function lanzarTandaCorazonesFinal() {
    for (let i = 0; i < 14; i++) {
      const corazon = document.createElement('span');
      corazon.className = 'corazon-final';
      corazon.textContent = Math.random() > 0.5 ? '❤' : '💛';
      corazon.style.left = `${Math.random() * 100}%`;
      corazon.style.fontSize = `${14 + Math.random() * 22}px`;
      corazon.style.animationDuration = `${3.5 + Math.random() * 3}s`;
      corazon.style.setProperty('--giro-final', `${(Math.random() * 80 - 40).toFixed(0)}deg`);
      capaCorazonesFinal.appendChild(corazon);
      setTimeout(() => corazon.remove(), 7000);
    }
  }

  function iniciarLluviaCorazonesFinal() {
    lanzarTandaCorazonesFinal();
    idIntervaloCorazonesFinal = setInterval(lanzarTandaCorazonesFinal, 700);
  }

  function detenerLluviaCorazonesFinal() {
    clearInterval(idIntervaloCorazonesFinal);
    idIntervaloCorazonesFinal = null;
  }

  // ==========================================
  // ORQUESTA EL FINAL ESPECTACULAR
  // ==========================================
  let finalActivo = false;
  
  actualizarControles();

  function iniciarFinalEspectacular() {
    if (finalActivo || prefiereMenosMovimiento) return;
    finalActivo = true;
    iniciarFuegosArtificiales();
    iniciarLluviaCorazonesFinal();
  }

  function detenerFinalEspectacular() {
    if (!finalActivo) return;
    finalActivo = false;
    detenerFuegosArtificiales();
    detenerLluviaCorazonesFinal();
  }
});
