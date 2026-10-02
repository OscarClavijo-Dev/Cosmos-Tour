'use strict';

/* =============================================================================
   COSMOS TOUR — SCRIPT PRINCIPAL (VANILLA JAVASCRIPT ES6+)
   =============================================================================
   Descripción:
   Landing page inmersiva de turismo espacial de lujo. Este archivo implementa
   la totalidad de la lógica interactiva del sitio SIN frameworks ni librerías
   externas: validación de formulario, animaciones con Intersection Observer,
   contadores, tema claro/oscuro, selector de planeta, acordeón y filtros,
   física de microgravedad, parallax de cupola, simulador de lanzamiento,
   modal de destinos y generación de tarjeta de embarque.

   Librerías externas (GSAP / AOS):
   NO se utilizan. Toda la animación se resuelve con APIs nativas del navegador:
   - requestAnimationFrame → contadores, lanzamiento, física zero-g.
   - Intersection Observer → apariciones de secciones y contadores.
   - CSS Transitions      → acordeón, filtros, tema, sticky header.
   - transform             → parallax de la cupola.
   Justificación: cero dependencias, mejor rendimiento y demostración directa
   del dominio de las APIs del navegador (requisito académico).

   Estructura del código:
   1. CONFIGURACIÓN INICIAL (constantes, reglas, catálogo de destinos)
   2. UTILIDADES Y ALMACENAMIENTO (throttle, debounce, localStorage seguro)
   3. TOASTS Y FEEDBACK VISUAL (sustituyen alert/confirm/prompt)
   4. VALIDACIÓN DE FORMULARIO (F1)
   5. ANIMACIONES SCROLL / INTERSECTION OBSERVER (F2)
   6. HEADER STICKY + PROGRESO DE SCROLL (F3 y F12)
   7. CONTADORES ANIMADOS DEL HERO (F4)
   8. TEMA OSCURO / CLARO (F5)
   9. SELECTOR DE PLANETA (F6)
  10. ACORDEÓN Y FILTROS DE SERVICIOS (F7 y F8)
  11. SIMULADOR DE GRAVEDAD CERO (F9)
  12. CUPOLA INTERACTIVA + TOOLTIP (F10)
  13. SCROLL SUAVE Y NAVEGACIÓN ACTIVA (F11)
  14. SIMULACIÓN DE LANZAMIENTO (F13)
  15. MODAL DOSSIER DE NAVEGACIÓN (F14)
  16. BOARDING PASS / ESCANEO BIOMÉTRICO (F15)
  17. INICIALIZACIÓN (init + DOMContentLoaded)

   Requisitos de conexión:
   - index.html: <script src="script.js" defer></script>
   - styles.css: variables de tema (--bg-primary, --text-primary, ...) y
     clases de soporte (.animate-on-scroll, .error-message, .header-sticky, ...)
   ========================================================================== */

/* ============================ 1. CONFIGURACIÓN INICIAL ==================== */

/** Clave de localStorage para la preferencia de tema. */
const THEME_STORAGE_KEY = 'cosmos-tour-theme';

/** Expresión regular de validación de correo electrónico. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Constantes de animación, física y umbrales. */
const COUNTER_DURATION_MS = 2000;
const STICKY_HEADER_THRESHOLD = 80;
const SCROLL_THROTTLE_MS = 100;
const LAUNCH_DURATION_MS = 6000;
const MICRO_GRAVITY = 0.035;
const ZERO_G_FRICTION = 0.995;
const ZERO_G_RESTITUTION = 0.75;
const ZERO_G_MAX_SPEED = 6;
const CUPOLA_PARALLAX_PX = 16;

/** Respeta la preferencia de sistema "reducir movimiento". */
const prefersReducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Referencias cacheadas del DOM (se rellenan en cacheDomElements). */
const DOM = {};

/** Estado global de la aplicación (único punto de verdad mutable). */
const appState = {
  initialized: false,
  theme: 'dark',
  headerSticky: false,
  formValidation: {},
  launchRunning: false,
  launchRafId: null,
  launchStartTimestamp: 0,
  initialGauges: null,
  zeroGItems: [],
  zeroGRafId: null,
  zeroGVisible: false,
  modalOpen: false,
  lastFocusedElement: null,
  previousBodyOverflow: ''
};

/**
 * Reglas de validación declarativas del formulario de manifiesto.
 * Cada regla recibe el campo y devuelve '' si es válido o un mensaje de error.
 */
const VALIDATION_RULES = [
  {
    id: 'manifest-name',
    check: (field) =>
      field.value.trim().length >= 5
        ? ''
        : 'El nombre completo debe tener al menos 5 caracteres.'
  },
  {
    id: 'manifest-email',
    check: (field) =>
      EMAIL_REGEX.test(field.value.trim())
        ? ''
        : 'Introduce un correo electrónico válido (ej. nombre@dominio.com).'
  },
  {
    id: 'manifest-passport',
    check: (field) =>
      field.value.trim().length > 0 ? '' : 'El número de pasaporte es obligatorio.'
  },
  {
    id: 'manifest-destination',
    check: (field) => (field.value ? '' : 'Selecciona una expedición.')
  },
  {
    id: 'manifest-suite',
    check: (field) => (field.value ? '' : 'Selecciona una categoría de suite.')
  },
  {
    id: 'manifest-window',
    check: (field) => (field.value ? '' : 'Selecciona una ventana de despegue.')
  },
  {
    id: 'manifest-role',
    check: (field) => (field.value ? '' : 'Selecciona tu rol en el manifiesto.')
  },
  {
    id: 'manifest-terms',
    check: (field) =>
      field.checked ? '' : 'Debes aceptar los términos y condiciones de vuelo.'
  }
];

/**
 * Catálogo de expediciones usado por el modal dossier (F14).
 * Claves: luna | marte | iss (coinciden con data-dest de los botones).
 */
const DESTINATION_FILES = {
  luna: {
    departure: 'Noviembre 2026',
    title: 'La Luna',
    subtitle: 'Expedición Cis-Lunar Artemisa Prime',
    dist: '384,400 KM',
    duration: '6 Días Terrestres',
    gravity: '0.16 G',
    temp: '-53 °C',
    price: '$1,250,000 USD',
    highlights: [
      'Aterrizaje en el Cráter Shackleton con pernocta presurizada',
      'Caminata lunar (EVA) con traje a medida en baja gravedad',
      'Almuerzo privado en el borde del Polo Sur Lunar'
    ],
    luxuries: [
      'Suite Celestial Sovereign de 42 m³ presurizada a 1 ATM',
      'Chef personal y cava de colección a bordo',
      'Enlace cuántico continuo con la Tierra'
    ]
  },
  marte: {
    departure: 'Marzo 2027',
    title: 'Marte',
    subtitle: 'Odisea Valles Marineris & Oasis Rojo',
    dist: '225,000,000 KM',
    duration: '180 Días de Travesía',
    gravity: '0.38 G',
    temp: '-63 °C',
    price: '$4,800,000 USD',
    highlights: [
      'Travesía en crucero con anillo de gravedad centrífuga 1g',
      'Exploración de los cañones de Valles Marineris',
      'Estancia en el Domo Biosférico Geodésico'
    ],
    luxuries: [
      'Stateroom con cúpula de observación privada',
      'Laboratorio culinario y huerta hidropónica a bordo',
      'Retransmisión holográfica de eventos en la Tierra'
    ]
  },
  iss: {
    departure: 'Diciembre 2026',
    title: 'Estación Espacial',
    subtitle: 'Residencia Apex Cupola',
    dist: '408 KM (Órbita Baja)',
    duration: '10 Días en Órbita',
    gravity: '0.00 G',
    temp: '-120 °C (exterior)',
    price: '$750,000 USD',
    highlights: [
      '16 amaneceres diarios observando auroras polares',
      'Flote en gravedad cero absoluta (microgravedad)',
      'Meditación y entrenamiento acrobático en órbita'
    ],
    luxuries: [
      'Residencia exclusiva en la Cupola panorámica 360°',
      'Pod privado de ingravidez con ventana de cuarzo de zafiro',
      'Enlace láser de 10 Gbps con la Tierra'
    ]
  }
};

/* ===================== 2. UTILIDADES Y ALMACENAMIENTO ===================== */

/**
 * Limita la frecuencia de ejecución de una función (throttle con ejecución
 * final garantizada para no perder el último estado del scroll).
 * @param {Function} callback - Función a limitar.
 * @param {number} limit - Milisegundos mínimos entre ejecuciones.
 * @returns {Function} Función envolvente limitada.
 */
function throttle(callback, limit) {
  let waiting = false;
  let lastArgs = null;
  return function throttled(...args) {
    if (waiting) {
      lastArgs = args;
      return;
    }
    waiting = true;
    callback.apply(this, args);
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        callback.apply(this, lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
}

/**
 * Retrasa la ejecución hasta que el usuario deja de invocar la función.
 * @param {Function} callback - Función a posponer.
 * @param {number} delay - Milisegundos de espera.
 * @returns {Function} Función con debounce aplicado.
 */
function debounce(callback, delay) {
  let timerId = null;
  return function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback.apply(this, args), delay);
  };
}

/**
 * Limita un valor numérico dentro de un rango.
 * @param {number} value - Valor de entrada.
 * @param {number} min - Límite inferior.
 * @param {number} max - Límite superior.
 * @returns {number} Valor contenido en el rango.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Aceleración suave "ease-out cúbico" para animaciones.
 * @param {number} progress - Progreso normalizado (0 a 1).
 * @returns {number} Progreso con easing aplicado.
 */
function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * Genera un entero aleatorio dentro de un rango inclusive.
 * @param {number} min - Mínimo.
 * @param {number} max - Máximo.
 * @returns {number} Entero aleatorio.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Lectura segura de localStorage (try/catch obligatorio).
 * @param {string} key - Clave a leer.
 * @returns {string|null} Valor almacenado o null si no existe o falla.
 */
function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('[Cosmos Tour] localStorage no disponible (lectura):', error);
    return null;
  }
}

/**
 * Escritura segura de localStorage (try/catch obligatorio).
 * @param {string} key - Clave a guardar.
 * @param {string} value - Valor a guardar.
 * @returns {boolean} true si se guardó correctamente.
 */
function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('[Cosmos Tour] localStorage no disponible (escritura):', error);
    return false;
  }
}

/**
 * Cachea en la constante DOM todas las referencias necesarias del HTML.
 * Se ejecuta una sola vez desde init() (script con defer = DOM disponible).
 * @returns {void}
 */
function cacheDomElements() {
  DOM.header = document.querySelector('.top-nav');
  DOM.navActions = document.querySelector('.nav-actions');
  DOM.navLinks = Array.from(document.querySelectorAll('.nav-links .nav-link'));
  DOM.form = document.getElementById('manifest-form');
  DOM.hudMetrics = document.querySelector('.hud-metrics');
  DOM.canvas = document.getElementById('universe-canvas');
  DOM.arena = document.getElementById('zero-g-arena');
  DOM.cupolaWindow = document.getElementById('cupola-window');
  DOM.cupolaSky = document.getElementById('cupola-sky');
  DOM.modal = document.getElementById('dossier-modal');
  DOM.modalClose = document.getElementById('modal-close-btn');
  DOM.ignitionBtn = document.getElementById('btn-ignition-toggle');
  DOM.throttleFill = document.getElementById('throttle-fill');
  DOM.launchLayout = document.querySelector('.launch-layout');
  DOM.scannerBox = document.getElementById('biometric-scanner-box');
  DOM.scanBar = document.getElementById('scan-progress-bar');
  DOM.scanText = document.getElementById('scan-progress-text');
  DOM.sealStatus = document.getElementById('manifest-seal-status');
  DOM.passResult = document.getElementById('boarding-pass-result');
  DOM.btnPrintPass = document.getElementById('btn-print-pass');
  DOM.btnModifyManifest = document.getElementById('btn-modify-manifest');
}

/* ======================== 3. TOASTS Y FEEDBACK VISUAL ===================== */

/**
 * Crea (si no existe) el contenedor de notificaciones flotantes.
 * @returns {HTMLElement} Contenedor #toast-container.
 */
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Muestra una notificación toast visual (sustituye alert/confirm/prompt).
 * @param {string} message - Texto a mostrar.
 * @param {'success'|'error'|'info'} type - Variante visual (por defecto info).
 * @returns {HTMLElement} Elemento toast creado.
 */
function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 350);
  }, 4200);

  return toast;
}

/* ====================== 4. VALIDACIÓN DE FORMULARIO (F1) ================== */

/**
 * Obtiene (creándolo si hace falta) el <span class="error-message"> asociado
 * a un campo y lo coloca debajo de él dentro de su .form-group.
 * @param {HTMLElement} field - Campo del formulario.
 * @returns {HTMLElement} Span de mensaje de error.
 */
function getErrorElement(field) {
  const errorId = `${field.id}-error`;
  const existing = document.getElementById(errorId);
  if (existing) {
    return existing;
  }

  const span = document.createElement('span');
  span.className = 'error-message';
  span.id = errorId;
  span.setAttribute('aria-live', 'polite');

  const container =
    field.type === 'checkbox'
      ? field.closest('.form-group') || field.parentElement
      : field.parentElement;
  container.appendChild(span);

  field.setAttribute('aria-describedby', errorId);
  return span;
}

/**
 * Valida un campo concreto y pinta su resultado inline (.error-message).
 * @param {string} ruleId - id del campo (coincide con VALIDATION_RULES).
 * @returns {boolean} true si el campo es válido.
 */
function validateFieldById(ruleId) {
  const rule = VALIDATION_RULES.find((item) => item.id === ruleId);
  const field = document.getElementById(ruleId);
  if (!rule || !field) {
    return true;
  }

  const message = rule.check(field);
  const isValid = message === '';
  const errorElement = getErrorElement(field);

  errorElement.textContent = isValid ? '' : message;
  field.classList.toggle('field-invalid', !isValid);
  field.setAttribute('aria-invalid', String(!isValid));
  appState.formValidation[ruleId] = isValid;

  return isValid;
}

/**
 * Valida la totalidad de los campos del manifiesto.
 * @returns {boolean} true si todo el formulario es válido.
 */
function validateAllFields() {
  const results = VALIDATION_RULES.map((rule) => validateFieldById(rule.id));
  return results.every(Boolean);
}

/**
 * Recupera los datos del formulario ya validado.
 * @returns {Object|null} Objeto con los datos o null si falta el formulario.
 */
function collectManifestData() {
  if (!DOM.form) {
    return null;
  }
  const getValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  };

  return {
    name: getValue('manifest-name'),
    email: getValue('manifest-email'),
    passport: getValue('manifest-passport'),
    destination: getValue('manifest-destination'),
    suite: getValue('manifest-suite'),
    window: getValue('manifest-window'),
    role: getValue('manifest-role')
  };
}

/**
 * Genera un código de misión aleatorio coherente con el destino.
 * @param {string} destination - Nombre de la expedición.
 * @returns {string} Código tipo CT-2026-LUN-123.
 */
function generateMissionCode(destination) {
  const prefixes = {
    'La Luna': 'LUN',
    'Marte': 'MAR',
    'Estación Espacial Internacional': 'ISS'
  };
  const prefix = prefixes[destination] || 'ORB';
  return `CT-2026-${prefix}-${randomInt(100, 999)}`;
}

/**
 * Manejador de submit: prevenir el envío si hay errores y disparar el flujo
 * de escaneo biométrico + boarding pass si todo es válido.
 * @param {SubmitEvent} event - Evento de envío del formulario.
 * @returns {void}
 */
function handleManifestSubmit(event) {
  event.preventDefault();

  if (!validateAllFields()) {
    showToast('Revisa los campos marcados antes de continuar.', 'error');
    const firstInvalid = VALIDATION_RULES.find(
      (rule) => !appState.formValidation[rule.id]
    );
    const field = firstInvalid ? document.getElementById(firstInvalid.id) : null;
    if (field) {
      field.focus();
    }
    return;
  }

  startBoardingPassFlow();
}

/**
 * Inicializa la validación en tiempo real (blur/input/change) y el submit.
 * Se desactiva la validación nativa (novalidate) para controlar los mensajes
 * inline con .error-message, conservando los atributos required del HTML.
 * @returns {void}
 */
function initFormValidation() {
  if (!DOM.form) {
    return;
  }

  DOM.form.setAttribute('novalidate', 'novalidate');

  VALIDATION_RULES.forEach((rule) => {
    const field = document.getElementById(rule.id);
    if (!field) {
      return;
    }

    field.addEventListener('blur', () => validateFieldById(rule.id));

    field.addEventListener('input', () => {
      if (field.classList.contains('field-invalid')) {
        validateFieldById(rule.id);
      }
    });

    if (field.type === 'checkbox' || field.tagName === 'SELECT') {
      field.addEventListener('change', () => validateFieldById(rule.id));
    }
  });

  DOM.form.addEventListener('submit', handleManifestSubmit);
}

/* ================= 5. ANIMACIONES SCROLL / OBSERVER (F2) ================== */

/**
 * Aplica la animación de aparición (fade-in + translateY(30px)) a las secciones
 * clave usando Intersection Observer NATIVA. Una vez animadas conservan la clase
 * .animated y dejan de observarse (no se repiten).
 * Secciones objetivo: #destinos, #testimonios y #servicios (el id "servicios"
 * fue renombrado a #beneficios en la corrección semántica: se incluyen ambos
 * selectores para cumplir la especificación sin perder la referencia).
 * @returns {void}
 */
function initScrollAnimations() {
  const sections = Array.from(
    document.querySelectorAll('#destinos, #testimonios, #servicios, #beneficios')
  );

  if (!sections.length) {
    return;
  }

  sections.forEach((section) => section.classList.add('animate-on-scroll'));

  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
    sections.forEach((section) => section.classList.add('animated'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* =============== 6. HEADER STICKY + PROGRESO DE SCROLL (F3 / F12) ========= */

/**
 * Actualiza el ancho de la barra de progreso de scroll (0% a 100%).
 * @returns {void}
 */
function updateScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    return;
  }
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${clamp(percentage, 0, 100).toFixed(2)}%`;
}

/**
 * Activa/desactiva la clase .header-sticky al superar 80px de scroll y
 * mantiene actualizada la barra de progreso (F12).
 * @returns {void}
 */
function handleScrollState() {
  const shouldStick = window.scrollY > STICKY_HEADER_THRESHOLD;

  if (shouldStick !== appState.headerSticky && DOM.header) {
    DOM.header.classList.toggle('header-sticky', shouldStick);
    appState.headerSticky = shouldStick;
  }

  updateScrollProgress();
}

/**
 * Sincroniza la variable CSS --nav-h con la altura real de la cabecera fija.
 * La cabecera cambia de 1 fila (desktop) a 2–3 filas (tablet/móvil) y además
 * se comprime al hacer sticky: el desplazamiento del contenido principal y el
 * scroll-margin de las anclas se calculan con la altura máxima (estado no
 * sticky) para que la cabecera nunca tape el hero ni las secciones.
 *
 * Se mide sin tocar la clase .header-sticky para no interrumpir la transición
 * de compresión al hacer scroll: altura = contenido + 2 × padding máximo.
 * @returns {void}
 */
function syncNavOffset() {
  if (!DOM.header) {
    return;
  }

  const header = DOM.header;
  const headerStyle = getComputedStyle(header);
  const rootStyle = getComputedStyle(document.documentElement);
  const rootFontSize = parseFloat(rootStyle.fontSize) || 16;

  const padValue = (rootStyle.getPropertyValue('--nav-pad-y') || '1.1rem').trim();
  const padNumber = parseFloat(padValue);
  if (!padNumber) {
    return;
  }
  const maxPadPx = padValue.indexOf('rem') !== -1 ? padNumber * rootFontSize : padNumber;

  const currentPadY =
    (parseFloat(headerStyle.paddingTop) || 0) + (parseFloat(headerStyle.paddingBottom) || 0);
  const contentHeight = header.getBoundingClientRect().height - currentPadY;

  /* Si la cabecera aún no está maquetada no se toca la variable. */
  if (!(contentHeight > 0)) {
    return;
  }

  document.documentElement.style.setProperty(
    '--nav-h',
    `${Math.ceil(contentHeight + maxPadPx * 2)}px`
  );
}

/**
 * Crea la barra de progreso dentro de la cabecera y conecta el listener de
 * scroll con throttle de 100ms para optimizar el rendimiento.
 * @returns {void}
 */
function initHeaderAndScrollIndicator() {
  if (DOM.header) {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    DOM.header.appendChild(progressBar);
  }

  window.addEventListener('scroll', throttle(handleScrollState, SCROLL_THROTTLE_MS), {
    passive: true
  });

  handleScrollState();

  /* La altura de la cabecera depende del breakpoint, de las web fonts y de
     styles.css (se carga vía preload+onload): ResizeObserver la resincroniza
     automáticamente ante cualquier cambio de tamaño, con los listeners de
     respaldo por si el navegador no soporta el observer. */
  syncNavOffset();
  if ('ResizeObserver' in window) {
    const headerObserver = new ResizeObserver(() => syncNavOffset());
    headerObserver.observe(DOM.header);
  }
  window.addEventListener('resize', debounce(syncNavOffset, 150));
  window.addEventListener('load', syncNavOffset);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavOffset).catch(() => {});
  }
}

/* ==================== 7. CONTADORES ANIMADOS DEL HERO (F4) ================ */

/**
 * Prepara un elemento .metric-value para la animación: extrae valor y número
 * de decimales, y separa el número del texto de unidad (KM, KM/S, MIN).
 * @param {HTMLElement} element - Elemento .metric-value.
 * @returns {Object|null} Datos del contador o null si no es numérico.
 */
function prepareMetricCounter(element) {
  const rawText = element.textContent.trim();
  const value = parseFloat(rawText);
  if (Number.isNaN(value)) {
    return null;
  }

  const decimalPart = rawText.includes('.') ? rawText.split('.')[1] : '';
  const hasDecimalDigits = /^\d/.test(decimalPart);
  const decimals = hasDecimalDigits ? decimalPart.length : 0;

  const unitElement = element.querySelector('.metric-unit');
  const unitHTML = unitElement ? ` ${unitElement.outerHTML}` : '';

  element.innerHTML = `<span class="metric-number">0</span>${unitHTML}`;

  return {
    element,
    numberElement: element.querySelector('.metric-number'),
    value,
    decimals
  };
}

/**
 * Anima un contador desde 0 hasta su valor final con easing suave.
 * @param {Object} counter - Datos devueltos por prepareMetricCounter.
 * @returns {void}
 */
function animateCounter(counter) {
  const startTime = performance.now();

  const step = (now) => {
    const progress = clamp((now - startTime) / COUNTER_DURATION_MS, 0, 1);
    const current = counter.value * easeOutCubic(progress);
    counter.numberElement.textContent = current.toFixed(counter.decimals);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.numberElement.textContent = counter.value.toFixed(counter.decimals);
    }
  };

  requestAnimationFrame(step);
}

/**
 * Detecta las métricas del HUD del hero (Altitud, Velocidad, Período orbital)
 * y las anima de 0 a su valor final al entrar al viewport: 2000ms con easing
 * suave y requestAnimationFrame.
 * @returns {void}
 */
function initHeroCounters() {
  const metricElements = Array.from(document.querySelectorAll('.metric-value'));
  if (!metricElements.length) {
    return;
  }

  const counters = metricElements
    .map(prepareMetricCounter)
    .filter((counter) => counter !== null);

  if (!counters.length) {
    return;
  }

  const revealAll = () => {
    counters.forEach((counter) => {
      counter.numberElement.textContent = counter.value.toFixed(counter.decimals);
    });
  };

  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          currentObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(DOM.hudMetrics || counters[0].element);
}

/* ====================== 8. TEMA OSCURO / CLARO (F5) ======================= */

/**
 * Aplica un tema al documento: variable CSS data-theme en <html> y actualiza
 * el icono/etiqueta del botón conmutador (🌙 oscuro / ☀️ claro).
 * @param {'dark'|'light'} theme - Tema a aplicar.
 * @returns {void}
 */
function applyTheme(theme) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', normalizedTheme);
  appState.theme = normalizedTheme;

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const icon = toggle.querySelector('.theme-icon');
    const label = toggle.querySelector('.theme-label');
    if (icon) {
      icon.textContent = normalizedTheme === 'dark' ? '🌙' : '☀️';
    }
    if (label) {
      label.textContent = normalizedTheme === 'dark' ? 'MODO OSCURO' : 'MODO CLARO';
    }
    toggle.setAttribute(
      'aria-label',
      normalizedTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
    );
    toggle.setAttribute('aria-pressed', String(normalizedTheme === 'light'));
  }
}

/**
 * Alterna entre tema oscuro y claro persistiendo la preferencia en
 * localStorage (con manejo de errores).
 * @returns {void}
 */
function toggleTheme() {
  const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);

  const saved = writeStorage(THEME_STORAGE_KEY, nextTheme);
  if (!saved) {
    showToast('El tema cambió, pero no se pudo guardar tu preferencia.', 'error');
  }
}

/**
 * Crea el botón de tema en la cabecera, carga la preferencia guardada
 * (localStorage con try/catch) y conecta el evento click.
 * @returns {void}
 */
function initThemeToggle() {
  if (DOM.navActions && !document.getElementById('theme-toggle')) {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.type = 'button';
    button.className = 'btn-icon theme-toggle';
    button.innerHTML =
      '<span class="theme-icon" aria-hidden="true">🌙</span>' +
      '<span class="theme-label">MODO OSCURO</span>';

    const callToAction = DOM.navActions.querySelector('a.btn-primary');
    DOM.navActions.insertBefore(button, callToAction);
  }

  /* El botón se sirve estático en el HTML (evita CLS): aquí solo se conecta
     el evento, tanto si vino del markup como si hubo que crearlo. */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle && !themeToggle.dataset.bound) {
    themeToggle.dataset.bound = '1';
    themeToggle.addEventListener('click', toggleTheme);
  }

  const storedTheme = readStorage(THEME_STORAGE_KEY);
  applyTheme(storedTheme === 'light' ? 'light' : 'dark');
}

/* ====================== 9. SELECTOR DE PLANETA (F6) ======================= */

/**
 * Gestiona los botones .segmented-btn del hero (Tierra ↔ Marte):
 * actualiza la clase .active, sincroniza el atributo data-planet del canvas 3D,
 * emite el evento personalizado "planetchange" (para futuras librerías 3D) y
 * muestra feedback visual mediante toast si no hay canvas funcional.
 * @returns {void}
 */
function initPlanetSelector() {
  const buttons = Array.from(document.querySelectorAll('.segmented-btn'));
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');

      const planet = button.dataset.planetTarget || 'earth';
      const planetLabels = { earth: 'Tierra', mars: 'Marte', luna: 'La Luna', jupiter: 'Júpiter', saturno: 'Saturno' };
      const planetLabel = planetLabels[planet] || planet;

      if (DOM.canvas) {
        DOM.canvas.dataset.planet = planet;
        DOM.canvas.dispatchEvent(
          new CustomEvent('planetchange', { detail: { planet } })
        );
      }

      document.body.dataset.planet = planet;
      showToast(`Cuerpo celeste sincronizado en el HUD: ${planetLabel}.`, 'info');
    });
  });
}

/* =============== 10. ACORDEÓN Y FILTROS DE SERVICIOS (F7 / F8) =========== */

/**
 * Alterna la apertura del drawer de especificaciones asociado a un botón
 * .amenity-accordion-btn, animando max-height y actualizando el icono (↕/↥).
 * @param {HTMLElement} button - Botón del acordeón.
 * @returns {void}
 */
function toggleSpecsDrawer(button) {
  const drawerId = button.dataset.targetDrawer;
  const drawer = drawerId ? document.getElementById(drawerId) : null;
  if (!drawer) {
    return;
  }

  const isOpen = button.getAttribute('aria-expanded') === 'true';
  const icon = button.querySelector('span:last-child');

  if (isOpen) {
    // Colapsar: fijar altura actual para poder transicionar hasta 0.
    drawer.style.maxHeight = `${drawer.scrollHeight}px`;
    requestAnimationFrame(() => {
      drawer.style.maxHeight = '0px';
    });
    button.setAttribute('aria-expanded', 'false');
    if (icon) {
      icon.textContent = '↕';
    }
  } else {
    // Expandir: pasar de 0 a la altura del contenido.
    drawer.style.maxHeight = `${drawer.scrollHeight}px`;
    button.setAttribute('aria-expanded', 'true');
    if (icon) {
      icon.textContent = '↥';
    }
  }
}

/**
 * Inicializa los acordeones de especificaciones técnicas de los servicios.
 * @returns {void}
 */
function initServiceAccordions() {
  const buttons = Array.from(document.querySelectorAll('.amenity-accordion-btn'));
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button, index) => {
    const drawerId = button.dataset.targetDrawer;
    const drawer = drawerId ? document.getElementById(drawerId) : null;
    if (!drawer) {
      return;
    }

    if (!button.id) {
      button.id = `amenity-accordion-btn-${index}`;
    }
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', drawer.id);
    drawer.style.maxHeight = '0px';

    button.addEventListener('click', () => toggleSpecsDrawer(button));
  });
}

/**
 * Filtra las tarjetas .amenity-card según la categoría del botón pulsado,
 * animando la salida (opacity/scale) y la entrada de las tarjetas.
 * @param {string} filter - Categoría: all | suites | gastronomia | observatorio | academia.
 * @returns {void}
 */
function filterServiceCards(filter) {
  const cards = Array.from(document.querySelectorAll('.amenity-card'));

  cards.forEach((card) => {
    const matches = filter === 'all' || card.dataset.category === filter;

    if (matches) {
      card.style.display = '';
      requestAnimationFrame(() => card.classList.remove('is-filtered-out'));
    } else {
      card.classList.add('is-filtered-out');
      setTimeout(() => {
        if (card.classList.contains('is-filtered-out')) {
          card.style.display = 'none';
        }
      }, 300);
    }
  });
}

/**
 * Inicializa los filtros de categoría de la sección de servicios.
 * @returns {void}
 */
function initServiceFilters() {
  const filterButtons = Array.from(document.querySelectorAll('.amenity-filter-btn'));
  if (!filterButtons.length) {
    return;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      filterServiceCards(button.dataset.filter || 'all');
    });
  });
}

/* ================ 11. SIMULADOR DE GRAVEDAD CERO (F9) ==================== */

/**
 * Posiciona los elementos flotantes dentro de la arena y crea su estado
 * físico (posición + velocidad).
 * @returns {void}
 */
function initZeroGItems() {
  if (!DOM.arena) {
    return;
  }

  const elements = Array.from(DOM.arena.querySelectorAll('.zero-g-item'));
  const arenaWidth = DOM.arena.clientWidth;
  const arenaHeight = DOM.arena.clientHeight;

  appState.zeroGItems = elements.map((element, index) => {
    element.style.left = '0px';
    element.style.top = '0px';

    const itemWidth = element.offsetWidth;
    const itemHeight = element.offsetHeight;
    const positionX = clamp(24 + (index % 3) * ((arenaWidth - itemWidth) / 3), 0, arenaWidth - itemWidth);
    const positionY = clamp(28 + Math.floor(index / 3) * 110, 0, arenaHeight - itemHeight);

    return {
      element,
      x: positionX,
      y: positionY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    };
  });

  renderZeroGItems();
}

/**
 * Dibuja la posición de cada elemento flotante con transform 3D.
 * @returns {void}
 */
function renderZeroGItems() {
  appState.zeroGItems.forEach((item) => {
    item.element.style.transform = `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, 0)`;
  });
}

/**
 * Un paso de física: gravedad simulada, fricción, rebote en los límites de
 * la arena y límite de velocidad. Los elementos jamás salen del contenedor.
 * @returns {void}
 */
function updateZeroGPhysics() {
  if (!DOM.arena) {
    return;
  }

  const maxX = Math.max(0, DOM.arena.clientWidth);
  const maxY = Math.max(0, DOM.arena.clientHeight);

  appState.zeroGItems.forEach((item) => {
    const itemWidth = item.element.offsetWidth;
    const itemHeight = item.element.offsetHeight;

    item.vy += MICRO_GRAVITY;
    item.vx *= ZERO_G_FRICTION;
    item.vy *= ZERO_G_FRICTION;

    const speed = Math.hypot(item.vx, item.vy);
    if (speed > ZERO_G_MAX_SPEED) {
      item.vx = (item.vx / speed) * ZERO_G_MAX_SPEED;
      item.vy = (item.vy / speed) * ZERO_G_MAX_SPEED;
    }

    item.x += item.vx;
    item.y += item.vy;

    // Rebotes elásticos contra las paredes de la arena.
    if (item.x <= 0) {
      item.x = 0;
      item.vx = Math.abs(item.vx) * ZERO_G_RESTITUTION;
    } else if (item.x + itemWidth >= maxX) {
      item.x = maxX - itemWidth;
      item.vx = -Math.abs(item.vx) * ZERO_G_RESTITUTION;
    }

    if (item.y <= 0) {
      item.y = 0;
      item.vy = Math.abs(item.vy) * ZERO_G_RESTITUTION;
    } else if (item.y + itemHeight >= maxY) {
      item.y = maxY - itemHeight;
      item.vy = -Math.abs(item.vy) * ZERO_G_RESTITUTION;
    }
  });

  renderZeroGItems();
}

/**
 * Inicia el bucle de animación de física si no está corriendo.
 * @returns {void}
 */
function startZeroGLoop() {
  if (appState.zeroGRafId !== null) {
    return;
  }
  const step = () => {
    updateZeroGPhysics();
    appState.zeroGRafId = requestAnimationFrame(step);
  };
  appState.zeroGRafId = requestAnimationFrame(step);
}

/**
 * Detiene el bucle de física (ahorro de CPU cuando la arena no es visible).
 * @returns {void}
 */
function stopZeroGLoop() {
  if (appState.zeroGRafId !== null) {
    cancelAnimationFrame(appState.zeroGRafId);
    appState.zeroGRafId = null;
  }
}

/**
 * Reinicia las posiciones de los elementos tras un redimensionado.
 * @returns {void}
 */
function handleZeroGResize() {
  if (!DOM.arena) {
    return;
  }
  const maxX = Math.max(0, DOM.arena.clientWidth);
  const maxY = Math.max(0, DOM.arena.clientHeight);
  appState.zeroGItems.forEach((item) => {
    item.x = clamp(item.x, 0, maxX - item.element.offsetWidth);
    item.y = clamp(item.y, 0, maxY - item.element.offsetHeight);
  });
  renderZeroGItems();
}

/**
 * Inicializa el simulador: impulso aleatorio al hacer clic sobre cada
 * elemento y bucle rAF pausado cuando la arena sale del viewport.
 * @returns {void}
 */
function initZeroGravitySimulator() {
  if (!DOM.arena) {
    return;
  }

  initZeroGItems();

  appState.zeroGItems.forEach((item) => {
    item.element.addEventListener('click', () => {
      // Fuerza de impulso aleatoria en ambos ejes.
      item.vx += (Math.random() * 2 - 1) * 6;
      item.vy += (Math.random() * 2 - 1) * 6 - 2;
      startZeroGLoop();
    });
  });

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          appState.zeroGVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            startZeroGLoop();
          } else {
            stopZeroGLoop();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(DOM.arena);
  } else {
    startZeroGLoop();
  }

  window.addEventListener('resize', debounce(handleZeroGResize, 150));
}

/* =============== 12. CUPOLA INTERACTIVA + TOOLTIP (F10) ================== */

/**
 * Inicializa el parallax de ratón sobre #cupola-sky (el contenido se desplaza
 * ligeramente sin salirse de los bordes) y el tooltip de los puntos de
 * interés .poi-marker.
 * @returns {void}
 */
function initCupolaInteractivity() {
  if (!DOM.cupolaWindow || !DOM.cupolaSky) {
    return;
  }

  const sky = DOM.cupolaSky;

  DOM.cupolaWindow.addEventListener('mousemove', (event) => {
    const rect = DOM.cupolaWindow.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

    // Desplazamiento limitado: el contenido nunca sale de los bordes.
    const offsetX = clamp(-ratioX * 2 * CUPOLA_PARALLAX_PX, -CUPOLA_PARALLAX_PX, CUPOLA_PARALLAX_PX);
    const offsetY = clamp(-ratioY * 2 * CUPOLA_PARALLAX_PX, -CUPOLA_PARALLAX_PX, CUPOLA_PARALLAX_PX);

    sky.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
  });

  DOM.cupolaWindow.addEventListener('mouseleave', () => {
    sky.style.transform = 'translate3d(0, 0, 0)';
  });

  // Tooltip dinámico para los puntos de interés estelares.
  const tooltip = document.createElement('div');
  tooltip.className = 'poi-tooltip';
  tooltip.setAttribute('aria-hidden', 'true');
  sky.appendChild(tooltip);

  const markers = Array.from(sky.querySelectorAll('.poi-marker'));
  markers.forEach((marker) => {
    marker.addEventListener('mouseenter', () => {
      tooltip.textContent = marker.dataset.poi || '';
      tooltip.style.left = `${marker.offsetLeft + marker.offsetWidth / 2}px`;
      tooltip.style.top = `${marker.offsetTop - 14}px`;
      tooltip.classList.add('is-visible');
    });
    marker.addEventListener('mouseleave', () => {
      tooltip.classList.remove('is-visible');
    });
  });
}

/* ============== 13. SCROLL SUAVE Y NAVEGACIÓN ACTIVA (F11) =============== */

/**
 * Desplaza la ventana hasta la sección indicada con scroll suave, teniendo
 * en cuenta la altura de la cabecera fija.
 * @param {string} targetId - id de la sección destino.
 * @returns {boolean} true si se encontró y desplazó la sección.
 */
function scrollToSectionById(targetId) {
  let target = null;
  try {
    target = document.getElementById(targetId);
  } catch (error) {
    return false;
  }

  if (!target) {
    return false;
  }

  const headerOffset = DOM.header ? DOM.header.offsetHeight : 80;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 10;

  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  return true;
}

/**
 * Interceptor global de anclas internas (#...): prevenir el comportamiento por
 * defecto y usar window.scrollTo con behavior 'smooth' (F11).
 * @param {MouseEvent} event - Evento click sobre un enlace.
 * @returns {void}
 */
function handleInternalAnchorClick(event) {
  const link = event.target.closest('a[href^="#"]');
  if (!link) {
    return;
  }

  const href = link.getAttribute('href');
  if (!href || href === '#') {
    return;
  }

  const targetId = href.slice(1);
  if (scrollToSectionById(targetId)) {
    event.preventDefault();
  }
}

/**
 * Marca como .active el enlace de navegación correspondiente a la sección
 * visible mediante Intersection Observer.
 * @returns {void}
 */
function initActiveNavTracking() {
  if (typeof IntersectionObserver === 'undefined' || !DOM.navLinks.length) {
    return;
  }

  const linksById = new Map(
    DOM.navLinks.map((link) => [link.getAttribute('href').slice(1), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          DOM.navLinks.forEach((link) => link.classList.remove('active'));
          const activeLink = linksById.get(entry.target.id);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}

/**
 * Inicializa el scroll suave de anclas, la navegación activa y el CTA del
 * hero (#btn-initiate-launch) que enlaza al catálogo de destinos.
 * @returns {void}
 */
function initSmoothScroll() {
  document.addEventListener('click', handleInternalAnchorClick);

  initActiveNavTracking();

  const heroCta = document.getElementById('btn-initiate-launch');
  if (heroCta) {
    heroCta.addEventListener('click', () => scrollToSectionById('destinos'));
  }
}

/* ================== 13b. PESTAÑAS DE EXPERIENCIA DE VUELO ================= */

/**
 * Cambia el panel visible de la sección de vuelo según la pestaña pulsada.
 * @param {string} stage - Clave de la fase: lanzamiento | gravedad_cero | ventana.
 * @returns {void}
 */
function activateFlightStage(stage) {
  document.querySelectorAll('.flight-tab-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.stage === stage);
  });

  document.querySelectorAll('.flight-stage-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `stage-${stage}`);
  });
}

/**
 * Inicializa las pestañas de las 3 fases de la experiencia de vuelo.
 * @returns {void}
 */
function initFlightTabs() {
  const buttons = Array.from(document.querySelectorAll('.flight-tab-btn'));
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => activateFlightStage(button.dataset.stage));
  });
}

/* ================= 14. SIMULACIÓN DE LANZAMIENTO (F13) ==================== */

/**
 * Captura los valores iniciales de los medidores para poder restaurarlos
 * al abortar la secuencia.
 * @returns {void}
 */
function captureInitialGauges() {
  appState.initialGauges = {
    mach: DOM.gaugeMach ? DOM.gaugeMach.textContent : '',
    alt: DOM.gaugeAlt ? DOM.gaugeAlt.textContent : '',
    g: DOM.gaugeG ? DOM.gaugeG.textContent : '',
    time: DOM.gaugeTime ? DOM.gaugeTime.textContent : '',
    throttle: DOM.throttleFill ? DOM.throttleFill.style.width || '0%' : '0%'
  };
}

/**
 * Actualiza en tiempo real los gauges del panel de lanzamiento.
 * @param {number} elapsedMs - Milisegundos transcurridos.
 * @param {number} progress - Progreso normalizado (0 a 1).
 * @returns {void}
 */
function updateLaunchGauges(elapsedMs, progress) {
  const seconds = elapsedMs / 1000;

  if (DOM.gaugeTime) {
    DOM.gaugeTime.textContent = `${seconds.toFixed(1)} S`;
  }
  if (DOM.gaugeMach) {
    DOM.gaugeMach.textContent = `Mach ${(progress * 8.7).toFixed(1)}`;
  }
  if (DOM.gaugeAlt) {
    DOM.gaugeAlt.textContent = `${(progress * 420.5).toFixed(1)} KM`;
  }
  if (DOM.gaugeG) {
    const gForce = 1 + 2.6 * Math.sin(Math.PI * progress);
    DOM.gaugeG.textContent = `${gForce.toFixed(2)} G`;
  }
}

/**
 * Restaura los medidores a su estado inicial.
 * @returns {void}
 */
function resetLaunchGauges() {
  const initial = appState.initialGauges;
  if (!initial) {
    return;
  }
  if (DOM.gaugeMach) {
    DOM.gaugeMach.textContent = initial.mach;
  }
  if (DOM.gaugeAlt) {
    DOM.gaugeAlt.textContent = initial.alt;
  }
  if (DOM.gaugeG) {
    DOM.gaugeG.textContent = initial.g;
  }
  if (DOM.gaugeTime) {
    DOM.gaugeTime.textContent = initial.time;
  }
  if (DOM.throttleFill) {
    DOM.throttleFill.style.width = initial.throttle;
  }
}

/**
 * Finaliza la secuencia de lanzamiento limpiando estados y animaciones.
 * @param {boolean} completed - true si llegó al 100% del throttle.
 * @returns {void}
 */
function finishLaunchSequence(completed) {
  appState.launchRunning = false;
  appState.launchRafId = null;

  if (DOM.ignitionBtn) {
    DOM.ignitionBtn.textContent = 'Iniciar Secuencia';
  }
  if (DOM.launchLayout) {
    DOM.launchLayout.classList.remove('shake-active');
  }

  if (completed) {
    showToast('Secuencia completada: órbita de inserción alcanzada (T+ 6.0 S).', 'success');
  }
}

/**
 * Inicia la secuencia de lanzamiento: barra de throttle 0% → 100%, gauges en
 * tiempo real, vibración visual y botón en modo "Abortar Secuencia".
 * @returns {void}
 */
function startLaunchSequence() {
  if (appState.launchRunning || !DOM.throttleFill) {
    return;
  }

  if (prefersReducedMotion) {
    showToast('Modo "reducir movimiento" activo: secuencia sin vibración.', 'info');
  }

  appState.launchRunning = true;
  appState.launchStartTimestamp = performance.now();

  if (DOM.ignitionBtn) {
    DOM.ignitionBtn.textContent = 'Abortar Secuencia';
  }
  if (DOM.launchLayout && !prefersReducedMotion) {
    DOM.launchLayout.classList.add('shake-active');
  }

  const step = (now) => {
    const elapsed = now - appState.launchStartTimestamp;
    const progress = clamp(elapsed / LAUNCH_DURATION_MS, 0, 1);

    DOM.throttleFill.style.width = `${(progress * 100).toFixed(1)}%`;
    updateLaunchGauges(elapsed, progress);

    if (progress >= 1) {
      finishLaunchSequence(true);
      return;
    }

    appState.launchRafId = requestAnimationFrame(step);
  };

  appState.launchRafId = requestAnimationFrame(step);
}

/**
 * Aborta la secuencia de lanzamiento en curso y restaura los medidores.
 * @returns {void}
 */
function abortLaunchSequence() {
  if (!appState.launchRunning) {
    return;
  }

  if (appState.launchRafId !== null) {
    cancelAnimationFrame(appState.launchRafId);
    appState.launchRafId = null;
  }

  appState.launchRunning = false;
  resetLaunchGauges();
  finishLaunchSequence(false);
  showToast('Secuencia de lanzamiento abortada por el operador.', 'error');
}

/**
 * Inicializa el botón #btn-ignition-toggle con comportamiento de
 * iniciar/abortar la simulación de lanzamiento.
 * @returns {void}
 */
function initLaunchSimulation() {
  if (!DOM.ignitionBtn) {
    return;
  }

  DOM.gaugeMach = document.getElementById('gauge-mach');
  DOM.gaugeAlt = document.getElementById('gauge-alt');
  DOM.gaugeG = document.getElementById('gauge-g');
  DOM.gaugeTime = document.getElementById('gauge-time');

  captureInitialGauges();

  DOM.ignitionBtn.addEventListener('click', () => {
    if (appState.launchRunning) {
      abortLaunchSequence();
    } else {
      startLaunchSequence();
    }
  });
}

/* ============= 15. MODAL DOSSIER DE NAVEGACIÓN (F14) ====================== */

/**
 * Rellena una lista del modal con un array de textos.
 * @param {HTMLElement} listElement - Lista <ul> destino.
 * @param {string[]} items - Textos a insertar.
 * @returns {void}
 */
function fillModalList(listElement, items) {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = '';
  items.forEach((text) => {
    const listItem = document.createElement('li');
    listItem.textContent = text;
    listElement.appendChild(listItem);
  });
}

/**
 * Puebla el modal con los datos de la expedición seleccionada.
 * @param {string} destinationKey - Clave del destino: luna | marte | iss.
 * @returns {boolean} true si el destino existía en el catálogo.
 */
function populateModalData(destinationKey) {
  const file = DESTINATION_FILES[destinationKey];
  if (!file || !DOM.modal) {
    return false;
  }

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  };

  setText('modal-departure', file.departure);
  setText('modal-title', file.title);
  setText('modal-subtitle', file.subtitle);
  setText('modal-dist', file.dist);
  setText('modal-duration', file.duration);
  setText('modal-gravity', file.gravity);
  setText('modal-temp', file.temp);
  setText('modal-price', file.price);

  fillModalList(document.getElementById('modal-highlights'), file.highlights);
  fillModalList(document.getElementById('modal-luxuries'), file.luxuries);

  return true;
}

/**
 * Abre el modal dossier bloqueando el scroll del body y guardando el foco.
 * @param {string} destinationKey - Clave del destino.
 * @returns {void}
 */
function openDossierModal(destinationKey) {
  if (!DOM.modal || !populateModalData(destinationKey)) {
    showToast('Expediente no disponible para ese destino.', 'error');
    return;
  }

  appState.lastFocusedElement = document.activeElement;
  appState.previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  appState.modalOpen = true;

  DOM.modal.classList.add('is-open');
  DOM.modal.setAttribute('aria-hidden', 'false');

  if (DOM.modalClose) {
    DOM.modalClose.focus();
  }
}

/**
 * Cierra el modal dossier restaurando el scroll y el foco anterior.
 * @returns {void}
 */
function closeDossierModal() {
  if (!DOM.modal || !appState.modalOpen) {
    return;
  }

  appState.modalOpen = false;
  DOM.modal.classList.remove('is-open');
  DOM.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = appState.previousBodyOverflow;

  if (appState.lastFocusedElement && typeof appState.lastFocusedElement.focus === 'function') {
    appState.lastFocusedElement.focus();
  }
}

/**
 * Inicializa el modal: botones .btn-warp-action, cierre por botón, por clic
 * fuera del panel y por la tecla Escape.
 * @returns {void}
 */
function initModalDossier() {
  if (!DOM.modal) {
    return;
  }

  const warpButtons = Array.from(document.querySelectorAll('.btn-warp-action'));
  warpButtons.forEach((button) => {
    button.addEventListener('click', () => openDossierModal(button.dataset.dest));
  });

  if (DOM.modalClose) {
    DOM.modalClose.addEventListener('click', closeDossierModal);
  }

  DOM.modal.addEventListener('click', (event) => {
    if (event.target === DOM.modal) {
      closeDossierModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && appState.modalOpen) {
      closeDossierModal();
    }
  });
}

/* ============ 16. BOARDING PASS / ESCANEO BIOMÉTRICO (F15) =============== */

/**
 * Puebla la tarjeta de embarque con los datos del manifiesto.
 * @param {Object} data - Datos del formulario.
 * @returns {void}
 */
function populateBoardingPass(data) {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  };

  setText('pass-name', data.name);
  setText('pass-role-country', `${data.role} · Misión Privada`);
  setText('pass-dest', data.destination);
  setText('pass-suite', data.suite);
  setText('pass-window', data.window);
  setText('pass-mission-code', generateMissionCode(data.destination));
}

/**
 * Actualiza el estado de la barra de escaneo biométrico.
 * @param {number} percentage - Progreso 0 a 100.
 * @returns {void}
 */
function updateBiometricProgress(percentage) {
  if (DOM.scanBar) {
    DOM.scanBar.style.width = `${clamp(percentage, 0, 100).toFixed(1)}%`;
  }
  if (DOM.scanText) {
    if (percentage < 35) {
      DOM.scanText.textContent = 'Leyendo huella dactilar y firma ocular...';
    } else if (percentage < 70) {
      DOM.scanText.textContent = 'Cotejando pasaporte con base de datos aeroespacial...';
    } else if (percentage < 100) {
      DOM.scanText.textContent = 'Verificando aptitud médica Clase 1...';
    } else {
      DOM.scanText.textContent = 'Autorización biométrica concedida.';
    }
  }
}

/**
 * Simula el escaneo biométrico con rAF y, al terminar, muestra la tarjeta.
 * @param {Object} data - Datos del formulario.
 * @returns {void}
 */
function runBiometricScan(data) {
  const duration = prefersReducedMotion ? 400 : 2200;
  const startTime = performance.now();

  const step = (now) => {
    const progress = clamp(((now - startTime) / duration) * 100, 0, 100);
    updateBiometricProgress(progress);

    if (progress < 100) {
      requestAnimationFrame(step);
      return;
    }

    // Escaneo completado: sello, ocultación y revelado de la credencial.
    if (DOM.sealStatus) {
      DOM.sealStatus.textContent = '● AUTORIZADO · BIO-CLEARED';
      DOM.sealStatus.style.color = '#34d399';
    }
    if (DOM.scannerBox) {
      DOM.scannerBox.classList.remove('is-visible');
    }

    populateBoardingPass(data);

    if (DOM.passResult) {
      DOM.passResult.classList.add('is-visible');
      DOM.passResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showToast(`¡Embarque autorizado, ${data.name.split(' ')[0]}! Credencial lista.`, 'success');
  };

  requestAnimationFrame(step);
}

/**
 * Flujo completo tras un submit válido: oculta el formulario, muestra la caja
 * de escaneo, anima la barra biométrica y revela el boarding pass.
 * @returns {void}
 */
function startBoardingPassFlow() {
  const data = collectManifestData();
  if (!data) {
    return;
  }

  showToast('Manifiesto validado. Iniciando escaneo biométrico...', 'success');

  if (DOM.form) {
    DOM.form.style.display = 'none';
  }
  if (DOM.passResult) {
    DOM.passResult.classList.remove('is-visible');
  }
  if (DOM.scannerBox) {
    DOM.scannerBox.classList.add('is-visible');
    if (DOM.scannerBox.scrollIntoView) {
      DOM.scannerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  updateBiometricProgress(0);

  runBiometricScan(data);
}

/**
 * Reinicia el flujo para editar el manifiesto de nuevo.
 * @returns {void}
 */
function resetBoardingPassFlow() {
  if (DOM.passResult) {
    DOM.passResult.classList.remove('is-visible');
  }
  if (DOM.scannerBox) {
    DOM.scannerBox.classList.remove('is-visible');
  }
  if (DOM.scanBar) {
    DOM.scanBar.style.width = '0%';
  }
  if (DOM.scanText) {
    DOM.scanText.textContent = 'Iniciando validación...';
  }
  if (DOM.sealStatus) {
    DOM.sealStatus.textContent = '○ PENDIENTE DE ESCANEO';
    DOM.sealStatus.style.color = 'var(--color-gold)';
  }
  if (DOM.form) {
    DOM.form.style.display = '';
    DOM.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Conecta los botones de impresión (window.print) y de modificación del
 * manifiesto con el flujo de la tarjeta de embarque.
 * @returns {void}
 */
function initBoardingPassFlow() {
  if (DOM.btnPrintPass) {
    DOM.btnPrintPass.addEventListener('click', () => {
      if (typeof window.print === 'function') {
        window.print();
      } else {
        showToast('La impresión no está disponible en este navegador.', 'error');
      }
    });
  }

  if (DOM.btnModifyManifest) {
    DOM.btnModifyManifest.addEventListener('click', resetBoardingPassFlow);
  }
}

/* ======================= 17. INICIALIZACIÓN ============================== */

/**
 * Ejecuta una inicialización concreta protegida por try/catch para que un
 * error puntual no detenga el resto del script.
 * @param {string} label - Nombre legible de la funcionalidad.
 * @param {Function} initializer - Función a ejecutar.
 * @returns {void}
 */
/* ====================== 16. FICHAS EMERGENTES Y MATRIZ ==================== */

/**
 * Datos de las fichas celestes que abren los botones .planet-btn del hero.
 * Claves: tierra | marte | luna | jupiter | saturno.
 */
const PLANET_FICHAS = {
  tierra: {
    name: 'La Tierra',
    sub: 'PLANETA DE ORIGEN · ÓRBITA DE SALIDA',
    img: './assets/imagenes/planeta-tierra.jpg',
    dist: '0 km',
    diam: '12,742 km',
    grav: '1.00 g',
    temp: '+15 °C',
    viaje: 'Punto de partida',
    desc: 'El único planeta conocido con vida. Desde 400 km de altitud, su curvatura azul y las auroras polares se despliegan en el ventanal: el mejor recordatorio de por qué valió la pena partir.'
  },
  marte: {
    name: 'Marte',
    sub: 'ODISEA VALLES MARINERIS · MISIÓN CT-2026-MAR',
    img: './assets/imagenes/planeta-marte.jpg',
    dist: '225 M km',
    diam: '6,779 km',
    grav: '0.38 g',
    temp: '-63 °C',
    viaje: '180 días',
    desc: 'El destino cumbre de la civilización humana: cañones de 4,000 km, el Monte Olimpo —el más alto del sistema solar— y el primer domo biosférico geodésico reservado para nuestros tripulantes.'
  },
  luna: {
    name: 'La Luna',
    sub: 'EXPEDICIÓN CIS-LUNAR ARTEMISA PRIME',
    img: './assets/imagenes/planeta-luna.jpg',
    dist: '384,400 km',
    diam: '3,474 km',
    grav: '0.16 g',
    temp: '-20 °C',
    viaje: '3 días',
    desc: 'Aterrizaje en el Cráter Shackleton con pernocta en suites presurizadas de titanio. Caminatas lunares con vista perpetua a la Tierra y almuerzo privado en el borde del Polo Sur.'
  },
  jupiter: {
    name: 'Júpiter',
    sub: 'OBSERVATORIO JOVIANO · PRÓXIMA TEMPORADA',
    img: './assets/imagenes/planeta-jupiter.jpg',
    dist: '628 M km',
    diam: '139,820 km',
    grav: '2.40 g',
    temp: '-108 °C',
    viaje: 'Próximamente',
    desc: 'El gigante gasoso con la Gran Mancha Roja, un huracán mayor que la Tierra. Nuestro programa de reconocimiento joviano abrirá reservas tras consolidar la ruta cis-joviana.'
  },
  saturno: {
    name: 'Saturno',
    sub: 'VIDRIERAS DE LOS ANILLOS · PRÓXIMA TEMPORADA',
    img: './assets/imagenes/planeta-saturno.jpg',
    dist: '1.4 B km',
    diam: '116,460 km',
    grav: '1.04 g',
    temp: '-139 °C',
    viaje: 'Próximamente',
    desc: 'Sus anillos de hielo se extienden 280,000 km. El programa de cruceros al sistema saturniano está en fase de certificación para vuelos de ultra-larga travesía.'
  }
};

let fichaPlanetaAbierta = false;
let fichaPoiAbierta = false;

/**
 * Rellena y abre la ficha emergente del cuerpo celeste seleccionado.
 * @param {string} key - Clave de PLANET_FICHAS.
 * @returns {void}
 */
function openPlanetFicha(key) {
  const data = PLANET_FICHAS[key];
  const modal = document.getElementById('planet-modal');
  if (!data || !modal) {
    return;
  }
  document.getElementById('planet-modal-img').src = data.img;
  document.getElementById('planet-modal-img').alt = `Imagen real de ${data.name} (NASA)`;
  document.getElementById('planet-modal-title').textContent = data.name;
  document.getElementById('planet-modal-sub').textContent = data.sub;
  document.getElementById('planet-modal-dist').textContent = data.dist;
  document.getElementById('planet-modal-diam').textContent = data.diam;
  document.getElementById('planet-modal-grav').textContent = data.grav;
  document.getElementById('planet-modal-temp').textContent = data.temp;
  document.getElementById('planet-modal-viaje').textContent = data.viaje;
  document.getElementById('planet-modal-desc').textContent = data.desc;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  fichaPlanetaAbierta = true;
  const close = document.getElementById('planet-modal-close');
  if (close) {
    close.focus();
  }
}

/**
 * Cierra la ficha emergente de planetas.
 * @returns {void}
 */
function closePlanetFicha() {
  const modal = document.getElementById('planet-modal');
  if (!modal) {
    return;
  }
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  fichaPlanetaAbierta = false;
  if (!fichaPoiAbierta) {
    document.body.style.overflow = '';
  }
}

/**
 * Inicializa la apertura/cierre de la ficha planetaria desde .planet-btn,
 * el botón ✕, el clic fuera de la caja, Escape y el CTA interno.
 * @returns {void}
 */
function initPlanetFichas() {
  const modal = document.getElementById('planet-modal');
  if (!modal) {
    return;
  }
  document.querySelectorAll('.planet-btn[data-planet-info]').forEach((button) => {
    button.addEventListener('click', () => openPlanetFicha(button.dataset.planetInfo));
  });
  const closeBtn = document.getElementById('planet-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePlanetFicha);
  }
  const cta = document.getElementById('planet-modal-cta');
  if (cta) {
    cta.addEventListener('click', closePlanetFicha);
  }
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closePlanetFicha();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && fichaPlanetaAbierta) {
      closePlanetFicha();
    }
  });
}

/**
 * Inicializa la ficha celeste del Mirador Estelar: cada .poi-marker abre un
 * pop-up con su imagen real (NASA) y su historia breve (atributos data-poi-*).
 * @returns {void}
 */
function initPoiFichas() {
  const modal = document.getElementById('poi-modal');
  if (!modal) {
    return;
  }
  document.querySelectorAll('.poi-marker[data-poi-img]').forEach((marker) => {
    marker.addEventListener('click', () => {
      const img = document.getElementById('poi-modal-img');
      img.src = marker.dataset.poiImg;
      img.alt = `Imagen real: ${marker.dataset.poiTitle || marker.dataset.poi} (NASA)`;
      document.getElementById('poi-modal-title').textContent = marker.dataset.poiTitle || marker.dataset.poi;
      document.getElementById('poi-modal-meta').textContent = marker.dataset.poiMeta || '';
      document.getElementById('poi-modal-story').textContent = marker.dataset.poiStory || '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      fichaPoiAbierta = true;
      const close = document.getElementById('poi-modal-close');
      if (close) {
        close.focus();
      }
    });
  });
  const closeBtn = document.getElementById('poi-modal-close');
  const doneBtn = document.getElementById('poi-modal-done');
  const closePoi = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    fichaPoiAbierta = false;
    if (!fichaPlanetaAbierta) {
      document.body.style.overflow = '';
    }
  };
  if (closeBtn) {
    closeBtn.addEventListener('click', closePoi);
  }
  if (doneBtn) {
    doneBtn.addEventListener('click', closePoi);
  }
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closePoi();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && fichaPoiAbierta) {
      closePoi();
    }
  });
}

/**
 * Matriz comparativa interactiva: al pasar el mouse por una celda se resalta
 * toda su columna (clase .col-hot); al salir de la tabla se limpia.
 * @returns {void}
 */
function initComparisonHighlight() {
  const table = document.querySelector('.comparison-table');
  if (!table) {
    return;
  }
  const clear = () => {
    table.querySelectorAll('.col-hot').forEach((cell) => cell.classList.remove('col-hot'));
  };
  table.addEventListener('mouseover', (event) => {
    const cell = event.target.closest('td, th');
    if (!cell || !table.contains(cell)) {
      return;
    }
    const idx = cell.cellIndex;
    clear();
    table.querySelectorAll('tr').forEach((row) => {
      const target = row.cells[idx];
      if (target) {
        target.classList.add('col-hot');
      }
    });
  });
  table.addEventListener('mouseleave', clear);
}

function safeInit(label, initializer) {
  try {
    initializer();
  } catch (error) {
    console.error(`[Cosmos Tour] Error al inicializar ${label}:`, error);
  }
}

/**
 * Punto de entrada: cachea el DOM e inicializa las 15 funcionalidades.
 * Es idempotente: solo la primera llamada efectiva ejecuta los arranques,
 * de modo que un segundo DOMContentLoaded (o una carga tardía del script)
 * nunca duplica listeners.
 * @returns {void}
 */
function init() {
  if (appState.initialized) {
    return;
  }
  appState.initialized = true;

  safeInit('referencias DOM', cacheDomElements);
  safeInit('tema oscuro/claro', initThemeToggle);
  safeInit('cabecera sticky + progreso', initHeaderAndScrollIndicator);
  safeInit('validación de formulario', initFormValidation);
  safeInit('animaciones de scroll', initScrollAnimations);
  safeInit('contadores del hero', initHeroCounters);
  safeInit('selector de planeta', initPlanetSelector);
  safeInit('acordeón de servicios', initServiceAccordions);
  safeInit('filtros de servicios', initServiceFilters);
  safeInit('simulador de gravedad cero', initZeroGravitySimulator);
  safeInit('cupola interactiva', initCupolaInteractivity);
  safeInit('scroll suave', initSmoothScroll);
  safeInit('pestañas de vuelo', initFlightTabs);
  safeInit('simulación de lanzamiento', initLaunchSimulation);
  safeInit('modal dossier', initModalDossier);
  safeInit('boarding pass', initBoardingPassFlow);
  safeInit('fichas de planetas', initPlanetFichas);
  safeInit('fichas del mirador estelar', initPoiFichas);
  safeInit('matriz comparativa interactiva', initComparisonHighlight);
}

/* Con defer el DOM ya está parseado (readyState "interactive"): se inicializa
   de inmediato; solo se espera a DOMContentLoaded si el documento aún se está
   construyendo (carga asíncrona/retardada). { once: true } + el guard de
   appState.initialized garantizan una única ejecución. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
