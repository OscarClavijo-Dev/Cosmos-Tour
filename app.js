/**
 * ============================================================================
 * AGENCIA COSMOS TOUR — ARQUITECTURA MODULAR ES6+ (app.js)
 * ============================================================================
 * Implementación de 3 snippets independientes y autocontenidos utilizando
 * IIFE (Immediately Invoked Function Expression) y protocolo de namespacing
 * sobre `window.CosmosTour`.
 *
 * - Sin dependencias externas ni frameworks (100% Vanilla JavaScript ES6+)
 * - Manejo defensivo de errores mediante bloques try-catch
 * - Cero errores de consola en producción
 * ============================================================================
 */
(function () {
  'use strict';

  // Namespace principal de la aplicación
  window.CosmosTour = window.CosmosTour || {};

  /* ==========================================================================
     MÓDULO 1: CosmosTour.FormManager (IIFE)
     --------------------------------------------------------------------------
     Responsabilidades:
     1. Validación de campos en tiempo real (input, blur, change).
     2. Autoguardado automático en localStorage cada 30 segundos y al editar.
     3. Envío asíncrono a Formspree con Fetch API.
     4. Lógica de "usuario convertido" (mensaje de éxito, credencial y limpieza).
     5. Prevención estricta de envíos duplicados (lock de estado + UI).
     ========================================================================== */
  window.CosmosTour.FormManager = (function () {
    // Configuración privada del módulo
    const CONFIG = {
      // Endpoint oficial de Formspree (compatible con https://formspree.io/f/YOUR_ID)
      endpoint: 'https://formspree.io/f/mjyyolgb',
      autosaveIntervalMs: 30000, // 30 segundos
      storageKeys: {
        draft: 'cosmostour_reserva_activa',
        converted: 'cosmostour_pasajero_convertido',
        extras: 'cosmostour_experiencias_extras'
      },
      fieldMap: [
        { id: 'manifest-name', key: 'nombreCompleto' },
        { id: 'manifest-email', key: 'correoElectronico' },
        { id: 'manifest-passport', key: 'numeroPasaporte' },
        { id: 'manifest-destination', key: 'expedicionSeleccionada' },
        { id: 'manifest-suite', key: 'categoriaSuite' },
        { id: 'manifest-window', key: 'ventanaDespegue' },
        { id: 'manifest-role', key: 'rolManifiesto' },
        { id: 'manifest-terms', key: 'terminosAceptados' }
      ]
    };

    // Expresiones regulares de validación
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const PASSPORT_REGEX = /^[A-Za-z0-9]{6,20}$/;

    // Estado interno privado
    let isSubmitting = false;
    let autosaveTimerId = null;
    let isInitialized = false;

    /**
     * Formatea una fecha en formato legible DD/MM/YYYY HH:MM:SS.
     * @param {Date} dateObj
     * @returns {string}
     */
    const formatTimestamp = (dateObj = new Date()) => {
      try {
        const pad = (n) => String(n).padStart(2, '0');
        return (
          `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} ` +
          `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`
        );
      } catch (err) {
        return new Date().toISOString();
      }
    };

    /**
     * Genera un código único de misión espacial según el destino elegido.
     * @param {string} destination
     * @returns {string}
     */
    const generateMissionCode = (destination = '') => {
      const prefixes = {
        'La Luna': 'LUN',
        'Marte': 'MAR',
        'Estación Espacial Internacional': 'EEI'
      };
      const prefix = prefixes[destination] || 'ORB';
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      return `CT-2026-${prefix}-${randomDigits}`;
    };

    /**
     * Reglas declarativas de validación por campo.
     */
    const VALIDATION_RULES = {
      'manifest-name': (field) => {
        const val = field.value.trim();
        if (!val) return 'Ingresa tu nombre completo tal como figura en tu pasaporte.';
        if (val.length < 3) return 'El nombre debe contener al menos 3 caracteres.';
        return '';
      },
      'manifest-email': (field) => {
        const val = field.value.trim();
        if (!val) return 'Ingresa un correo electrónico de contacto.';
        if (!EMAIL_REGEX.test(val)) return 'Formato de correo inválido (ejemplo: nombre@dominio.com).';
        return '';
      },
      'manifest-passport': (field) => {
        const val = field.value.trim();
        if (!val) return 'Ingresa tu número de pasaporte o ID de ciudadano.';
        if (!PASSPORT_REGEX.test(val)) {
          return 'El pasaporte debe tener al menos 6 caracteres alfanuméricos sin espacios.';
        }
        return '';
      },
      'manifest-destination': (field) =>
        field.value.trim() ? '' : 'Selecciona la expedición espacial a la que deseas postularte.',
      'manifest-suite': (field) =>
        field.value.trim() ? '' : 'Selecciona una categoría de suite presurizada.',
      'manifest-window': (field) =>
        field.value.trim() ? '' : 'Selecciona una ventana temporal de despegue.',
      'manifest-role': (field) =>
        field.value.trim() ? '' : 'Selecciona tu rol dentro del manifiesto de tripulación.',
      'manifest-terms': (field) =>
        field.checked ? '' : 'Debes aceptar los protocolos médicos de ingravidez y términos orbitales.'
    };

    /**
     * Obtiene o crea el nodo DOM donde se pinta el mensaje de error de un campo.
     * @param {HTMLElement} field
     * @returns {HTMLElement}
     */
    const getOrCreateErrorElement = (field) => {
      const errorId = `${field.id}-error`;
      let errorEl = document.getElementById(errorId);
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.id = errorId;
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        const container = field.closest('.form-group') || field.parentElement;
        if (container) {
          container.appendChild(errorEl);
        }
      }
      return errorEl;
    };

    /**
     * Valida un campo individual por su ID y actualiza su estado visual y ARIA.
     * @param {string} fieldId
     * @returns {boolean} true si el campo es válido
     */
    const validateField = (fieldId) => {
      try {
        const field = document.getElementById(fieldId);
        const rule = VALIDATION_RULES[fieldId];
        if (!field || typeof rule !== 'function') {
          return true;
        }

        const errorMessage = rule(field);
        const isValid = errorMessage === '';
        const errorEl = getOrCreateErrorElement(field);

        errorEl.textContent = isValid ? '' : errorMessage;
        field.classList.toggle('field-invalid', !isValid);
        field.classList.toggle('error', !isValid);
        field.setAttribute('aria-invalid', String(!isValid));

        return isValid;
      } catch (err) {
        return true;
      }
    };

    /**
     * Valida todos los campos del formulario antes del envío.
     * @returns {{ valid: boolean, errors: Array<{ fieldId: string, message: string }> }}
     */
    const validateAll = () => {
      const errors = [];
      try {
        Object.keys(VALIDATION_RULES).forEach((fieldId) => {
          const isValid = validateField(fieldId);
          if (!isValid) {
            const field = document.getElementById(fieldId);
            const errorEl = document.getElementById(`${fieldId}-error`);
            errors.push({
              fieldId,
              message: errorEl ? errorEl.textContent : 'Campo inválido',
              element: field
            });
          }
        });
      } catch (err) {
        // Fallback silencioso sin romper la ejecución
      }
      return {
        valid: errors.length === 0,
        errors
      };
    };

    /**
     * Recolecta los valores actuales del formulario en un objeto estructurado.
     * @returns {Object}
     */
    const collectFormData = () => {
      const data = {
        timestamp: formatTimestamp(new Date())
      };

      try {
        CONFIG.fieldMap.forEach(({ id, key }) => {
          const field = document.getElementById(id);
          if (!field) {
            data[key] = '';
            return;
          }
          data[key] = field.type === 'checkbox' ? Boolean(field.checked) : field.value.trim();
        });
      } catch (err) {
        // Ignorar errores de lectura de DOM
      }

      return data;
    };

    /**
     * Guarda el borrador actual en localStorage (usado por el timer de 30s y eventos input).
     * @returns {boolean}
     */
    const saveDraftToStorage = () => {
      try {
        const form = document.getElementById('manifest-form');
        if (!form || form.hidden || form.style.display === 'none') {
          return false;
        }

        const draft = collectFormData();
        const hasAnyValue = CONFIG.fieldMap.some(({ key }) => {
          const val = draft[key];
          return val !== '' && val !== false && val !== null && val !== undefined;
        });

        if (!hasAnyValue) {
          return false;
        }

        window.localStorage.setItem(CONFIG.storageKeys.draft, JSON.stringify(draft));
        const cancelBtn = document.getElementById('btn-cancelar-reserva');
        if (cancelBtn) {
          cancelBtn.hidden = false;
        }
        return true;
      } catch (err) {
        return false;
      }
    };

    /**
     * Restaura el borrador guardado en localStorage al cargar la página.
     * @returns {boolean}
     */
    const restoreDraftFromStorage = () => {
      try {
        const raw = window.localStorage.getItem(CONFIG.storageKeys.draft);
        if (!raw) {
          return false;
        }

        const draft = JSON.parse(raw);
        if (!draft || typeof draft !== 'object') {
          return false;
        }

        let restored = false;
        CONFIG.fieldMap.forEach(({ id, key }) => {
          const field = document.getElementById(id);
          if (!field || draft[key] === undefined) {
            return;
          }
          if (field.type === 'checkbox') {
            field.checked = Boolean(draft[key]);
          } else {
            field.value = String(draft[key]);
          }
          restored = true;
        });

        if (restored) {
          const notification = document.getElementById('restore-notification');
          if (notification && draft.timestamp) {
            notification.textContent = `Reserva restaurada - Última actualización: ${draft.timestamp}`;
            notification.hidden = false;
            notification.classList.add('is-visible');
          }
          const cancelBtn = document.getElementById('btn-cancelar-reserva');
          if (cancelBtn) {
            cancelBtn.hidden = false;
          }
        }

        return restored;
      } catch (err) {
        return false;
      }
    };

    /**
     * Inicia el intervalo de autoguardado automático cada 30 segundos.
     */
    const startAutosaveTimer = () => {
      try {
        if (autosaveTimerId !== null) {
          clearInterval(autosaveTimerId);
        }
        autosaveTimerId = window.setInterval(() => {
          saveDraftToStorage();
        }, CONFIG.autosaveIntervalMs);
      } catch (err) {
        // Silencioso en caso de restricción de timers
      }
    };

    /**
     * Muestra el estado de "Usuario Convertido", oculta el formulario y limpia borradores.
     * @param {Object} conversionRecord
     */
    const renderConvertedUserState = (conversionRecord) => {
      try {
        const form = document.getElementById('manifest-form');
        if (form) {
          form.reset();
          form.style.display = 'none';
          form.classList.add('hidden');
        }

        const successBanner = document.getElementById('envio-exito');
        if (successBanner) {
          successBanner.hidden = false;
        }

        const credentialPanel = document.getElementById('credencial-embarque');
        if (credentialPanel && conversionRecord) {
          const setFieldText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
          };

          setFieldText('cred-nombre', conversionRecord.nombrePasajero || 'Explorador Orbital');
          setFieldText('cred-codigo', conversionRecord.codigoMision || 'CT-2026-ORB');
          setFieldText('cred-destino', conversionRecord.destinoConfirmado || 'Órbita Terrestre');
          setFieldText('cred-ventana', conversionRecord.ventanaDespegue || 'Q4 · Nov 2026');
          setFieldText('cred-suite', conversionRecord.categoriaSuite || 'Suite Orbital');
          setFieldText(
            'cred-experiencias',
            Array.isArray(conversionRecord.experienciasExtras) &&
              conversionRecord.experienciasExtras.length > 0
              ? conversionRecord.experienciasExtras.join(' · ')
              : 'Paquete Estándar Imperial'
          );

          credentialPanel.hidden = false;
        }
      } catch (err) {
        // Fallback seguro
      }
    };

    /**
     * Verifica al cargar si el usuario ya completó una conversión previamente.
     * @returns {boolean}
     */
    const checkConvertedUserOnLoad = () => {
      try {
        const raw = window.localStorage.getItem(CONFIG.storageKeys.converted);
        if (!raw) {
          return false;
        }
        const record = JSON.parse(raw);
        if (record && record.convertido === true) {
          renderConvertedUserState(record);
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    };

    /**
     * Envía los datos del formulario a Formspree usando Fetch API.
     * Incluye prevención de envíos duplicados y manejo de errores try-catch.
     * @param {Object} payloadData
     * @returns {Promise<Response>}
     */
    const sendToFormspree = async (payloadData) => {
      const formData = new FormData();
      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'boolean' ? String(value) : value);
      });

      formData.append('email', payloadData.correoElectronico || '');
      formData.append('_subject', `Nueva Reserva Cosmos Tour — ${payloadData.expedicionSeleccionada || 'Misión'}`);

      const formElement = document.getElementById('manifest-form');
      const targetEndpoint =
        (formElement && formElement.getAttribute('action')) || CONFIG.endpoint;

      return fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      });
    };

    /**
     * Procesa el evento submit del formulario con bloqueo anti-duplicados.
     * @param {Event} [event]
     * @returns {Promise<boolean>}
     */
    const handleFormSubmit = async (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      // Prevención estricta de envíos duplicados
      if (isSubmitting) {
        return false;
      }

      const validation = validateAll();
      if (!validation.valid) {
        if (validation.errors[0] && validation.errors[0].element) {
          validation.errors[0].element.focus();
        }
        return false;
      }

      const form = document.getElementById('manifest-form');
      const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
      const originalBtnText = submitBtn ? submitBtn.textContent : '';

      try {
        isSubmitting = true;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('is-loading');
          submitBtn.setAttribute('aria-busy', 'true');
          submitBtn.textContent = 'Procesando reserva espacial...';
        }

        const payload = collectFormData();
        const response = await sendToFormspree(payload);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} al enviar a Formspree`);
        }

        // Construir registro de usuario convertido
        let selectedExtras = [];
        if (
          window.CosmosTour.DataManager &&
          typeof window.CosmosTour.DataManager.getSelectedExtrasLabels === 'function'
        ) {
          selectedExtras = window.CosmosTour.DataManager.getSelectedExtrasLabels();
        }

        const conversionRecord = {
          convertido: true,
          timestamp: formatTimestamp(new Date()),
          codigoMision: generateMissionCode(payload.expedicionSeleccionada),
          nombrePasajero: payload.nombreCompleto,
          destinoConfirmado: payload.expedicionSeleccionada,
          categoriaSuite: payload.categoriaSuite,
          ventanaDespegue: payload.ventanaDespegue,
          experienciasExtras: selectedExtras
        };

        // Guardar estado convertido y limpiar borradores activos
        window.localStorage.setItem(
          CONFIG.storageKeys.converted,
          JSON.stringify(conversionRecord)
        );
        window.localStorage.removeItem(CONFIG.storageKeys.draft);
        window.localStorage.removeItem(CONFIG.storageKeys.extras);

        renderConvertedUserState(conversionRecord);
        return true;
      } catch (err) {
        // En caso de error de red, conservar borrador en localStorage
        saveDraftToStorage();
        const retryBtn = document.getElementById('btn-reintentar-envio');
        if (retryBtn) {
          retryBtn.hidden = false;
        }
        return false;
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = originalBtnText;
        }
      }
    };

    /**
     * Reinicia el estado de conversión para permitir registrar una nueva reserva.
     */
    const resetConversionState = () => {
      try {
        window.localStorage.removeItem(CONFIG.storageKeys.converted);
        window.localStorage.removeItem(CONFIG.storageKeys.draft);
        window.localStorage.removeItem(CONFIG.storageKeys.extras);

        const form = document.getElementById('manifest-form');
        if (form) {
          form.reset();
          form.style.display = '';
          form.classList.remove('hidden');
        }

        const credentialPanel = document.getElementById('credencial-embarque');
        if (credentialPanel) {
          credentialPanel.hidden = true;
        }

        const successBanner = document.getElementById('envio-exito');
        if (successBanner) {
          successBanner.hidden = true;
        }
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa los listeners de validación en tiempo real, autoguardado y envío.
     */
    const init = () => {
      try {
        if (isInitialized) {
          return;
        }
        isInitialized = true;

        const form = document.getElementById('manifest-form');
        if (!form) {
          return;
        }

        form.setAttribute('novalidate', 'novalidate');

        // 1. Verificar si ya es un usuario convertido
        if (!checkConvertedUserOnLoad()) {
          // 2. Restaurar borrador previo si existe
          restoreDraftFromStorage();
        }

        // 3. Validación en tiempo real por campo + autoguardado al escribir
        Object.keys(VALIDATION_RULES).forEach((fieldId) => {
          const field = document.getElementById(fieldId);
          if (!field) return;

          field.addEventListener('blur', () => validateField(fieldId));
          field.addEventListener('input', () => {
            if (field.classList.contains('field-invalid') || field.classList.contains('error')) {
              validateField(fieldId);
            }
            saveDraftToStorage();
          });
          field.addEventListener('change', () => {
            validateField(fieldId);
            saveDraftToStorage();
          });
        });

        // 4. Autoguardado periódico cada 30 segundos
        startAutosaveTimer();

        // 5. Listener de envío (solo se adjunta si el script principal no lo maneja ya)
        if (!form.dataset.ctFormBound) {
          form.dataset.ctFormBound = 'true';
          form.addEventListener('submit', handleFormSubmit);
        }

        // 6. Botón para nueva reserva tras conversión
        const newReservationBtn = document.getElementById('btn-nueva-reserva');
        if (newReservationBtn && !newReservationBtn.dataset.ctBound) {
          newReservationBtn.dataset.ctBound = 'true';
          newReservationBtn.addEventListener('click', resetConversionState);
        }
      } catch (err) {
        // Cero errores en consola
      }
    };

    // API pública expuesta en CosmosTour.FormManager
    return {
      init,
      validateField,
      validateAll,
      saveDraft: saveDraftToStorage,
      restoreDraft: restoreDraftFromStorage,
      submit: handleFormSubmit,
      resetConversion: resetConversionState,
      isSubmitting: () => isSubmitting
    };
  })();

  /* ==========================================================================
     MÓDULO 2: CosmosTour.UIModule (IIFE)
     --------------------------------------------------------------------------
     Responsabilidades:
     1. Countdown timer en tiempo real para la fecha de despegue (15/11/2026).
     2. Acordeón accesible para la sección FAQ (.ct-faq) con delegación.
     3. Modal/lightbox accesible para mostrar detalles de destinos (#dossier-modal).
     4. Smooth scroll para enlaces de navegación interna.
     5. Lazy loading de imágenes con IntersectionObserver.
     ========================================================================== */
  window.CosmosTour.UIModule = (function () {
    // Fecha objetivo oficial de despegue: 15 de noviembre de 2026 a las 09:00:00
    const LAUNCH_TARGET_DATE = new Date('2026-11-15T09:00:00');
    let countdownIntervalId = null;
    let lastFocusedElement = null;
    let isInitialized = false;

    /**
     * Formatea números a 2 dígitos con cero a la izquierda.
     * @param {number} value
     * @returns {string}
     */
    const padTwoDigits = (value) => String(Math.max(0, Math.floor(value))).padStart(2, '0');

    /**
     * Calcula la diferencia de tiempo restante hasta la fecha de despegue (15/11/2026).
     * @param {Date} [targetDate]
     * @returns {{ days: number, hours: number, minutes: number, seconds: number, expired: boolean }}
     */
    const getRemainingTime = (targetDate = LAUNCH_TARGET_DATE) => {
      const now = Date.now();
      const diffMs = Math.max(0, targetDate.getTime() - now);

      return {
        days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diffMs / 1000 / 60) % 60),
        seconds: Math.floor((diffMs / 1000) % 60),
        expired: diffMs <= 0
      };
    };

    /**
     * Inicializa y actualiza cada segundo el contador regresivo de lanzamiento.
     */
    const initCountdown = () => {
      try {
        const updateDOM = () => {
          const { days, hours, minutes, seconds, expired } = getRemainingTime(LAUNCH_TARGET_DATE);

          const map = {
            days: padTwoDigits(days),
            hours: padTwoDigits(hours),
            minutes: padTwoDigits(minutes),
            seconds: padTwoDigits(seconds)
          };

          // Actualizar tanto IDs directos (#cd-days...) como atributos data-unit
          Object.entries(map).forEach(([unit, formatted]) => {
            const byId = document.getElementById(`cd-${unit}`);
            if (byId && byId.textContent !== formatted) {
              byId.textContent = formatted;
            }
            document
              .querySelectorAll(`.ct-countdown [data-unit="${unit}"]`)
              .forEach((node) => {
                if (node.textContent !== formatted) {
                  node.textContent = formatted;
                }
              });
          });

          if (expired && countdownIntervalId !== null) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
          }
        };

        updateDOM();
        if (countdownIntervalId !== null) {
          clearInterval(countdownIntervalId);
        }
        countdownIntervalId = window.setInterval(updateDOM, 1000);
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa el acordeón de Preguntas Frecuentes (.ct-faq) con delegación de eventos.
     * Garantiza que solo una pregunta permanezca abierta a la vez.
     */
    const initFaqAccordion = () => {
      try {
        const faqContainer = document.querySelector('.ct-faq');
        if (!faqContainer || faqContainer.dataset.ctFaqBound === 'true') {
          return;
        }

        faqContainer.dataset.ctFaqBound = 'true';

        faqContainer.addEventListener('click', (event) => {
          const questionBtn = event.target.closest('.ct-faq-question');
          if (!questionBtn || !faqContainer.contains(questionBtn)) {
            return;
          }

          const currentItem = questionBtn.closest('.ct-faq-item');
          if (!currentItem) {
            return;
          }

          const isOpen =
            currentItem.classList.contains('active') ||
            currentItem.classList.contains('open');

          // Cerrar todos los demás ítems del acordeón
          faqContainer.querySelectorAll('.ct-faq-item').forEach((item) => {
            const btn = item.querySelector('.ct-faq-question');
            const answer = item.querySelector('.ct-faq-answer');
            const shouldOpen = item === currentItem ? !isOpen : false;

            item.classList.toggle('active', shouldOpen);
            item.classList.toggle('open', shouldOpen);

            if (btn) {
              btn.setAttribute('aria-expanded', String(shouldOpen));
            }
            if (answer) {
              answer.setAttribute('aria-hidden', String(!shouldOpen));
            }
          });
        });
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Abre el modal/lightbox de detalles de un destino espacial (#dossier-modal).
     * @param {string} destKey - Clave del destino ('luna' | 'marte' | 'iss')
     * @param {HTMLElement} [triggerElement]
     */
    const openDestinationModal = (destKey, triggerElement = null) => {
      try {
        const modal = document.getElementById('dossier-modal');
        if (!modal) {
          return;
        }

        const destination =
          window.CosmosTour.DataManager &&
          typeof window.CosmosTour.DataManager.getDestinationByKey === 'function'
            ? window.CosmosTour.DataManager.getDestinationByKey(destKey)
            : null;

        if (!destination) {
          return;
        }

        lastFocusedElement = triggerElement || document.activeElement;

        const setModalText = (id, text) => {
          const el = document.getElementById(id);
          if (el) el.textContent = text;
        };

        setModalText('modal-code', destination.code);
        setModalText('modal-title', destination.title);
        setModalText('modal-sub', destination.sub);
        setModalText('modal-desc', destination.desc);
        setModalText('modal-dist', destination.dist);
        setModalText('modal-duration', destination.duration);
        setModalText('modal-gravity', destination.gravity);
        setModalText('modal-price', destination.priceFormatted);
        setModalText('modal-ship', destination.ship);

        const imgEl = document.getElementById('modal-img');
        if (imgEl && destination.img) {
          imgEl.src = destination.img;
          imgEl.alt = destination.title;
        }

        const itineraryList = document.getElementById('modal-itinerary');
        if (itineraryList && Array.isArray(destination.itinerary)) {
          itineraryList.innerHTML = destination.itinerary
            .map(
              (step) =>
                `<li><strong>${step.phase}:</strong> ${step.detail}</li>`
            )
            .join('');
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Cierra el modal de detalles de destino y restaura el foco.
     */
    const closeDestinationModal = () => {
      try {
        const modal = document.getElementById('dossier-modal');
        if (!modal) {
          return;
        }
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
          lastFocusedElement.focus();
          lastFocusedElement = null;
        }
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa los triggers del modal/lightbox de destinos.
     */
    const initDestinationModal = () => {
      try {
        const modal = document.getElementById('dossier-modal');
        if (!modal || modal.dataset.ctModalBound === 'true') {
          return;
        }
        modal.dataset.ctModalBound = 'true';

        document.querySelectorAll('.btn-dossier[data-dest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            openDestinationModal(btn.getAttribute('data-dest'), btn);
          });
        });

        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', closeDestinationModal);
        }

        modal.addEventListener('click', (event) => {
          if (event.target === modal) {
            closeDestinationModal();
          }
        });

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeDestinationModal();
          }
        });
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa el desplazamiento suave (Smooth Scroll) para la navegación interna.
     */
    const initSmoothScroll = () => {
      try {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
          if (anchor.dataset.ctSmoothBound === 'true') {
            return;
          }
          anchor.dataset.ctSmoothBound = 'true';

          anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
              return;
            }
            const target = document.querySelector(href);
            if (!target) {
              return;
            }
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa Lazy Loading de imágenes utilizando IntersectionObserver.
     */
    const initLazyLoading = () => {
      try {
        const lazyImages = Array.from(
          document.querySelectorAll('img[data-src], img[loading="lazy"]')
        );
        if (!lazyImages.length) {
          return;
        }

        const loadImage = (img) => {
          if (img.dataset && img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          img.classList.add('is-loaded');
        };

        if (!('IntersectionObserver' in window)) {
          lazyImages.forEach(loadImage);
          return;
        }

        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          { rootMargin: '150px 0px', threshold: 0.01 }
        );

        lazyImages.forEach((img) => imageObserver.observe(img));
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa todos los subcomponentes del módulo UIModule.
     */
    const init = () => {
      try {
        if (isInitialized) {
          return;
        }
        isInitialized = true;

        initCountdown();
        initFaqAccordion();
        initDestinationModal();
        initSmoothScroll();
        initLazyLoading();
      } catch (err) {
        // Silencioso
      }
    };

    // API pública expuesta en CosmosTour.UIModule
    return {
      init,
      initCountdown,
      initFaqAccordion,
      initDestinationModal,
      initSmoothScroll,
      initLazyLoading,
      openDestinationModal,
      closeDestinationModal,
      getRemainingTime
    };
  })();

  /* ==========================================================================
     MÓDULO 3: CosmosTour.DataManager (IIFE)
     --------------------------------------------------------------------------
     Responsabilidades:
     1. Almacenamiento de datos de destinos espaciales (Luna, Marte, EEI).
     2. Renderizado dinámico y control del carrusel de testimonios (.ct-testimonials).
     3. Cálculo de precios con experiencias adicionales en USD.
     4. Persistencia de preferencias del usuario en localStorage.
     ========================================================================== */
  window.CosmosTour.DataManager = (function () {
    const STORAGE_KEYS = {
      preferences: 'cosmostour_user_preferences',
      extras: 'cosmostour_experiencias_extras',
      theme: 'cosmos_tour_theme'
    };

    // 1. Catálogo estructurado de destinos (Luna, Marte, EEI)
    const DESTINATIONS = {
      luna: {
        id: 'luna',
        name: 'La Luna',
        code: 'EXPEDICIÓN LUNA-01 // ARTEMIS LUXURY',
        title: 'La Luna — Cráter Shackleton & Mare Tranquillitatis',
        sub: 'Santuario Selenita Presurizado · Polo Sur Lunar',
        desc: 'Sobrevuelo rasante del histórico Mare Tranquillitatis y alunizaje suave junto al Cráter Shackleton en domos geodésicos de cristal de zafiro.',
        dist: '384,400 km',
        duration: '7 Días',
        gravity: '0.16 G (1/6 Tierra)',
        basePriceUSD: 450000,
        priceFormatted: '$450,000 USD',
        ship: 'Crucero Selenita Aether-IX',
        img: 'assets/imagenes/luna.jpg',
        itinerary: [
          { phase: 'Día 1–2', detail: 'Inserción translunar y brindis en gravedad cero.' },
          { phase: 'Día 3–5', detail: 'Estancia en el Domo Shackleton y caminata lunar guiada.' },
          { phase: 'Día 6–7', detail: 'Retorno orbital y amerizaje asistido en el Pacífico.' }
        ]
      },
      marte: {
        id: 'marte',
        name: 'Marte',
        code: 'EXPEDICIÓN MARTE-04 // ARES HORIZON',
        title: 'Marte — Valles Marineris & Olympus Mons',
        sub: 'Colonia Presurizada Ares Prime · Cañón Ecuatorial',
        desc: 'La travesía interplanetaria definitiva hacia el Planeta Rojo, con exploración presurizada de Valles Marineris y observación del Monte Olimpo.',
        dist: '225,000,000 km',
        duration: '210 Días',
        gravity: '0.38 G',
        basePriceUSD: 2800000,
        priceFormatted: '$2,800,000 USD',
        ship: 'Crucero Interplanetario Hyperion-V',
        img: 'assets/imagenes/marte.jpg',
        itinerary: [
          { phase: 'Mes 1–3', detail: 'Crucero interplanetario con gravedad rotacional artificial.' },
          { phase: 'Mes 4–5', detail: 'Descenso en Ares Prime y expedición a Valles Marineris.' },
          { phase: 'Mes 6–7', detail: 'Retorno a la Tierra en suite criogénica asistida.' }
        ]
      },
      iss: {
        id: 'iss',
        name: 'Estación Espacial Internacional',
        code: 'EXPEDICIÓN EEI-02 // ORBITAL APEX',
        title: 'Estación Espacial Internacional — Módulo Cupola',
        sub: 'Órbita Terrestre Baja · 16 Amaneceres por Día',
        desc: 'Inmersión orbital a 408 km sobre la Tierra con acceso privado al módulo Cupola de 360° y cenas gastronómicas en microgravedad.',
        dist: '408 km',
        duration: '10 Días',
        gravity: 'Microgravedad (0 G)',
        basePriceUSD: 280000,
        priceFormatted: '$280,000 USD',
        ship: 'Cápsula Orbital Valkyrie-II',
        img: 'assets/imagenes/estacion_espacial.jpg',
        itinerary: [
          { phase: 'Día 1', detail: 'Ascenso supersónico y acoplamiento automático con la EEI.' },
          { phase: 'Día 2–8', detail: 'Sesiones privadas en la Cupola y paseo espacial opcional.' },
          { phase: 'Día 9–10', detail: 'Desacoplamiento y reentrada atmosférica suave.' }
        ]
      }
    };

    // Catálogo de experiencias adicionales con tarifas en USD
    const EXTRA_EXPERIENCES = [
      { id: 'cena-molecular', name: 'Cena Molecular con Chef Michelin', priceUSD: 15000 },
      { id: 'cupola-panoramica', name: 'Sesión Privada en Cupola Panorámica', priceUSD: 8500 },
      { id: 'eva-personalizado', name: 'Entrenamiento EVA Personalizado', priceUSD: 22000 },
      { id: 'fotografia-zero-g', name: 'Fotografía Profesional en Gravedad Cero', priceUSD: 5000 },
      { id: 'suite-upgrade', name: 'Suite Celestial Sovereign Upgrade', priceUSD: 50000 }
    ];

    // 2. Datos de testimonios de viajeros espaciales
    const TESTIMONIALS = [
      {
        id: 'ct-2026-lun-014',
        name: 'Isabela Fontaine Rivas',
        role: 'Directora de Arte · Ciudad de México, México',
        initials: 'IF',
        rating: 5,
        tour: 'Expedición Lunar Artemisa Prime',
        mission: 'MISIÓN CT-2026-LUN-014',
        quote:
          'El instante en que la Tierra reapareció tras el ventanal de cuarzo de zafiro no se compara con nada que haya vivido. La suite presurizada y el amanecer sobre el cráter Shackleton superaron cada expectativa.'
      },
      {
        id: 'ct-2026-eei-087',
        name: 'Rafael Augusto Miranda Cardona',
        role: 'CEO de Fintech Andina · Bogotá, Colombia',
        initials: 'RM',
        rating: 5,
        tour: 'Estación Espacial Apex Cupola',
        mission: 'MISIÓN CT-2026-EEI-087',
        quote:
          'Diez días en microgravedad reordenan por completo la mente. El equipo médico estuvo presente en cada fase y la Cupola Panorámica convirtió cada órbita en una cena privada frente al planeta.'
      },
      {
        id: 'ct-2027-mar-006',
        name: 'Claire Bouchard Lefèvre',
        role: 'Cirujana Cardiovascular Consultora · Lyon, Francia',
        initials: 'CB',
        rating: 5,
        tour: 'Odisea Marte Valles Marineris',
        mission: 'MISIÓN CT-2027-MAR-006',
        quote:
          'La secuencia de ignición fue sorprendentemente suave y los asientos de fibra de carbono absorben la vibración mejor que cualquier primera clase aérea. Ver Valles Marineris desde la cúpula es inolvidable.'
      },
      {
        id: 'ct-2026-lun-031',
        name: 'Hiroshi Tanaka Endo',
        role: 'Ingeniero Jefe de Robótica (Jubilado) · Kioto, Japón',
        initials: 'HT',
        rating: 5,
        tour: 'Expedición Lunar Artemisa Prime',
        mission: 'MISIÓN CT-2026-LUN-031',
        quote:
          'Reservé la expedición como regalo de jubilación y terminó siendo el viaje definitorio de mi vida. Desde el traje confeccionado a medida hasta el menú molecular en ingravidez, todo superó mis expectativas.'
      }
    ];

    let carouselIndex = 0;
    let carouselTimerId = null;
    let isInitialized = false;

    /**
     * Obtiene un destino por su clave ('luna', 'marte', 'iss') o por su nombre.
     * @param {string} keyOrName
     * @returns {Object|null}
     */
    const getDestinationByKey = (keyOrName) => {
      if (!keyOrName) return null;
      const normalized = String(keyOrName).toLowerCase().trim();
      if (DESTINATIONS[normalized]) {
        return { ...DESTINATIONS[normalized] };
      }
      const found = Object.values(DESTINATIONS).find(
        (d) => d.name.toLowerCase() === normalized
      );
      return found ? { ...found } : null;
    };

    /**
     * Lee los IDs de experiencias adicionales guardados en localStorage.
     * @returns {string[]}
     */
    const getSelectedExtraIds = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.extras);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id) =>
          EXTRA_EXPERIENCES.some((exp) => exp.id === id)
        );
      } catch (err) {
        return [];
      }
    };

    /**
     * Devuelve las etiquetas legibles de las experiencias adicionales seleccionadas.
     * @returns {string[]}
     */
    const getSelectedExtrasLabels = () => {
      const ids = getSelectedExtraIds();
      return ids
        .map((id) => {
          const item = EXTRA_EXPERIENCES.find((exp) => exp.id === id);
          return item ? `${item.name} ($${item.priceUSD.toLocaleString('en-US')} USD)` : null;
        })
        .filter(Boolean);
    };

    /**
     * Calcula el precio total sumando el destino base y las experiencias adicionales.
     * @param {string} [destinationKey] - Clave o nombre del destino ('luna', 'marte', 'iss')
     * @param {string[]} [extraIds] - Lista de IDs de experiencias adicionales
     * @returns {{ basePriceUSD: number, extrasTotalUSD: number, totalUSD: number, formattedTotal: string }}
     */
    const calculateTotalPrice = (
      destinationKey = '',
      extraIds = getSelectedExtraIds()
    ) => {
      try {
        const destination = getDestinationByKey(destinationKey);
        const basePriceUSD = destination ? destination.basePriceUSD : 0;

        const extrasTotalUSD = (Array.isArray(extraIds) ? extraIds : []).reduce(
          (sum, id) => {
            const found = EXTRA_EXPERIENCES.find((item) => item.id === id);
            return sum + (found ? found.priceUSD : 0);
          },
          0
        );

        const totalUSD = basePriceUSD + extrasTotalUSD;
        return {
          basePriceUSD,
          extrasTotalUSD,
          totalUSD,
          formattedTotal: `$${totalUSD.toLocaleString('en-US')} USD`
        };
      } catch (err) {
        return {
          basePriceUSD: 0,
          extrasTotalUSD: 0,
          totalUSD: 0,
          formattedTotal: '$0 USD'
        };
      }
    };

    /**
     * Guarda preferencias del usuario en localStorage (tema, destino favorito, extras).
     * @param {Object} partialPrefs
     * @returns {Object} Preferencias actualizadas
     */
    const saveUserPreferences = (partialPrefs = {}) => {
      try {
        const current = getUserPreferences();
        const updated = {
          ...current,
          ...partialPrefs,
          updatedAt: new Date().toISOString()
        };
        window.localStorage.setItem(
          STORAGE_KEYS.preferences,
          JSON.stringify(updated)
        );
        return updated;
      } catch (err) {
        return {};
      }
    };

    /**
     * Recupera las preferencias del usuario desde localStorage.
     * @returns {Object}
     */
    const getUserPreferences = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.preferences);
        const parsed = raw ? JSON.parse(raw) : {};
        const theme = window.localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
        return {
          theme,
          preferredDestination: parsed.preferredDestination || 'luna',
          selectedExtras: getSelectedExtraIds(),
          ...parsed
        };
      } catch (err) {
        return {
          theme: 'dark',
          preferredDestination: 'luna',
          selectedExtras: []
        };
      }
    };

    /**
     * Renderiza dinámicamente las tarjetas de testimonios si el contenedor está vacío
     * y configura la navegación del carrusel (.ct-testimonials).
     */
    const initTestimonialsCarousel = () => {
      try {
        const root = document.querySelector('.ct-testimonials');
        if (!root) {
          return;
        }

        const track = root.querySelector('.ct-testimonials__track');
        if (!track) {
          return;
        }

        // Si el track no tiene tarjetas en el HTML, las renderiza dinámicamente
        if (track.children.length === 0) {
          track.innerHTML = TESTIMONIALS.map(
            (item) => `
              <article class="ct-testimonial-card">
                <div class="ct-testimonial-card__top">
                  <div class="ct-testimonial-card__stars" aria-label="Calificación: ${item.rating} de 5 estrellas">
                    ${'★'.repeat(item.rating)}
                  </div>
                  <span class="ct-testimonial-card__mission">${item.mission}</span>
                </div>
                <blockquote class="ct-testimonial-card__quote">
                  "${item.quote}"
                </blockquote>
                <div class="ct-testimonial-card__tour">
                  <span>Tour realizado: <strong>${item.tour}</strong></span>
                </div>
                <footer class="ct-testimonial-card__author">
                  <div class="ct-testimonial-card__meta">
                    <h3 class="ct-testimonial-card__name">${item.name}</h3>
                    <p class="ct-testimonial-card__role">${item.role}</p>
                  </div>
                </footer>
              </article>
            `
          ).join('');
        }

        // Si el carrusel ya fue enlazado por el script principal, evitar duplicar intervalos
        if (root.dataset.ctCarouselBound === 'true') {
          return;
        }
        root.dataset.ctCarouselBound = 'true';

        const cards = Array.from(track.querySelectorAll('.ct-testimonial-card'));
        const prevBtn = root.querySelector('.ct-testimonials__btn--prev');
        const nextBtn = root.querySelector('.ct-testimonials__btn--next');
        const dots = Array.from(root.querySelectorAll('.ct-testimonials__dot'));

        if (!cards.length) {
          return;
        }

        const getVisibleColumns = () => {
          if (window.innerWidth >= 1100) return 3;
          if (window.innerWidth >= 768) return 2;
          return 1;
        };

        const updateCarouselPosition = () => {
          const cardRect = cards[0].getBoundingClientRect();
          const styles = window.getComputedStyle(track);
          const gap = parseFloat(styles.columnGap || styles.gap || '24') || 24;
          const offset = carouselIndex * (cardRect.width + gap);
          track.style.transform = `translate3d(-${offset}px, 0, 0)`;

          dots.forEach((dot, idx) => {
            const isActive = idx === carouselIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-selected', String(isActive));
          });
        };

        const goToSlide = (index) => {
          const maxIndex = Math.max(0, cards.length - getVisibleColumns());
          if (index > maxIndex) {
            carouselIndex = 0;
          } else if (index < 0) {
            carouselIndex = maxIndex;
          } else {
            carouselIndex = index;
          }
          updateCarouselPosition();
        };

        const startAutoplay = () => {
          if (carouselTimerId !== null) {
            clearInterval(carouselTimerId);
          }
          carouselTimerId = window.setInterval(() => {
            goToSlide(carouselIndex + 1);
          }, 5000);
        };

        const stopAutoplay = () => {
          if (carouselTimerId !== null) {
            clearInterval(carouselTimerId);
            carouselTimerId = null;
          }
        };

        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            goToSlide(carouselIndex - 1);
            startAutoplay();
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            goToSlide(carouselIndex + 1);
            startAutoplay();
          });
        }
        dots.forEach((dot, idx) => {
          dot.addEventListener('click', () => {
            goToSlide(idx);
            startAutoplay();
          });
        });

        root.addEventListener('mouseenter', stopAutoplay);
        root.addEventListener('mouseleave', startAutoplay);
        window.addEventListener('resize', updateCarouselPosition);

        updateCarouselPosition();
        startAutoplay();
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Sincroniza la calculadora de precios de experiencias adicionales con el DOM y localStorage.
     */
    const initExtrasCalculator = () => {
      try {
        const checkboxes = Array.from(document.querySelectorAll('.carrito-check'));
        if (!checkboxes.length) {
          return;
        }

        const updateSummaryUI = () => {
          const ids = getSelectedExtraIds();
          checkboxes.forEach((cb) => {
            cb.checked = ids.includes(cb.dataset.expId);
          });

          const destSelect = document.getElementById('manifest-destination');
          const destName = destSelect ? destSelect.value : '';
          const calc = calculateTotalPrice(destName, ids);

          const countEl = document.getElementById('carrito-count');
          const totalEl = document.getElementById('carrito-total-monto');
          if (countEl) {
            countEl.textContent =
              ids.length === 1
                ? '1 experiencia seleccionada'
                : `${ids.length} experiencias seleccionadas`;
          }
          if (totalEl) {
            totalEl.textContent = `$${calc.extrasTotalUSD.toLocaleString('en-US')} USD`;
          }
        };

        updateSummaryUI();
      } catch (err) {
        // Silencioso
      }
    };

    /**
     * Inicializa el módulo de datos, carrusel de testimonios y calculadora de precios.
     */
    const init = () => {
      try {
        if (isInitialized) {
          return;
        }
        isInitialized = true;

        initTestimonialsCarousel();
        initExtrasCalculator();
      } catch (err) {
        // Silencioso
      }
    };

    // API pública expuesta en CosmosTour.DataManager
    return {
      init,
      getDestinations: () => ({ ...DESTINATIONS }),
      getDestinationByKey,
      getExperiencesCatalog: () => [...EXTRA_EXPERIENCES],
      getTestimonials: () => [...TESTIMONIALS],
      getSelectedExtraIds,
      getSelectedExtrasLabels,
      calculateTotalPrice,
      saveUserPreferences,
      getUserPreferences,
      initTestimonialsCarousel
    };
  })();

  /* ==========================================================================
     INICIALIZACIÓN AUTOMÁTICA DE LOS 3 MÓDULOS AL CARGAR EL DOM
     ========================================================================== */
  const bootstrapCosmosTour = () => {
    try {
      window.CosmosTour.DataManager.init();
      window.CosmosTour.UIModule.init();
      window.CosmosTour.FormManager.init();
    } catch (err) {
      // Garantiza cero errores no capturados en consola
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapCosmosTour, { once: true });
  } else {
    bootstrapCosmosTour();
  }
})();
