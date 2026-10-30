import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EXPERIENCIAS_CATALOGO } from '../data/catalog';
import { PasajeroConvertido, ReservaDraft } from '../types';
import {
  EMAIL_REGEX,
  EXPERIENCIAS_EXTRAS_KEY,
  FORMSPREE_ENDPOINT,
  PASAJERO_CONVERTIDO_KEY,
  RESERVA_ACTIVA_KEY,
  calcularTotalCarrito,
  crearBackupReserva,
  formatDate,
  formatearMontoUSD,
  generateMissionCode,
  guardarIdsCarrito,
  leerIdsCarrito,
  leerPasajeroConvertido,
  leerReservaBorrador,
  obtenerExperienciasExtrasTextos,
  obtenerIconoDestino,
  obtenerInfoDestino,
  removeStorage,
  writeStorage
} from '../utils/storage';

interface RegistrationSectionProps {
  preselectedDestination: string | null;
  onClearPreselectedDestination: () => void;
  isConverted: boolean;
  onConversionChange: (converted: boolean) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateSection: (sectionId: string) => void;
}

const DEFAULT_DRAFT: ReservaDraft = {
  nombreCompleto: '',
  correoElectronico: '',
  numeroPasaporte: '',
  expedicionSeleccionada: 'La Luna',
  categoriaSuite: 'Celestial Sovereign Suite',
  ventanaDespegue: 'Octubre 2026',
  rolManifiesto: 'Comandante Civil de Travesía',
  terminosAceptados: false,
  timestamp: ''
};

type FormFieldKey =
  | 'nombreCompleto'
  | 'correoElectronico'
  | 'numeroPasaporte'
  | 'expedicionSeleccionada'
  | 'categoriaSuite'
  | 'ventanaDespegue'
  | 'rolManifiesto'
  | 'terminosAceptados';

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  preselectedDestination,
  onClearPreselectedDestination,
  isConverted,
  onConversionChange,
  onShowToast,
  onNavigateSection
}) => {
  const [draft, setDraft] = useState<ReservaDraft>(DEFAULT_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<FormFieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>({});
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>([]);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [restoreBanner, setRestoreBanner] = useState<{ text: string; visible: boolean }>({
    text: '',
    visible: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [convertedRecord, setConvertedRecord] = useState<PasajeroConvertido | null>(null);

  const credencialRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passportInputRef = useRef<HTMLInputElement | null>(null);
  const termsInputRef = useRef<HTMLInputElement | null>(null);

  const validateSingleField = useCallback(
    (key: FormFieldKey, currentDraft: ReservaDraft): string => {
      switch (key) {
        case 'nombreCompleto': {
          const val = currentDraft.nombreCompleto.trim();
          if (!val) return 'El campo nombreCompleto es requerido';
          if (val.length < 3) return 'El campo nombreCompleto debe tener al menos 3 caracteres.';
          if (val.length > 100)
            return 'El campo nombreCompleto no puede superar los 100 caracteres.';
          return '';
        }
        case 'correoElectronico': {
          const val = currentDraft.correoElectronico.trim();
          if (!val) return 'El campo correoElectronico es requerido';
          return EMAIL_REGEX.test(val)
            ? ''
            : 'El campo correoElectronico no es un correo electrónico válido (ej. nombre@dominio.com).';
        }
        case 'numeroPasaporte': {
          const limpio = currentDraft.numeroPasaporte.trim().replace(/[\s-]/g, '');
          if (!limpio) return 'El campo numeroPasaporte es requerido';
          return /^[a-zA-Z0-9]{6,20}$/.test(limpio)
            ? ''
            : 'El campo numeroPasaporte debe tener entre 6 y 20 caracteres alfanuméricos.';
        }
        case 'expedicionSeleccionada':
          return currentDraft.expedicionSeleccionada
            ? ''
            : 'El campo expedicionSeleccionada es requerido';
        case 'categoriaSuite':
          return currentDraft.categoriaSuite ? '' : 'El campo categoriaSuite es requerido';
        case 'ventanaDespegue':
          return currentDraft.ventanaDespegue ? '' : 'El campo ventanaDespegue es requerido';
        case 'rolManifiesto':
          return currentDraft.rolManifiesto ? '' : 'El campo rolManifiesto es requerido';
        case 'terminosAceptados':
          return currentDraft.terminosAceptados
            ? ''
            : 'El campo terminosAceptados debe ser true.';
        default:
          return '';
      }
    },
    []
  );

  // Initial load: check converted passenger or restore draft + cart
  useEffect(() => {
    const converted = leerPasajeroConvertido();
    if (converted) {
      setConvertedRecord(converted);
      onConversionChange(true);
      return;
    }

    const savedIds = leerIdsCarrito();
    setSelectedExpIds(savedIds);

    const savedDraft = leerReservaBorrador();
    if (savedDraft) {
      setDraft({
        ...DEFAULT_DRAFT,
        ...savedDraft
      });
      setHasSavedDraft(true);
      const fechaLegible = formatDate(savedDraft.timestamp) || savedDraft.timestamp || '';
      setRestoreBanner({
        text: `Reserva restaurada - Última actualización: ${fechaLegible}`,
        visible: true
      });
      const timer = window.setTimeout(() => {
        setRestoreBanner((prev) => ({ ...prev, visible: false }));
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [onConversionChange]);

  // 5-minute automatic backup + cross-tab storage synchronization
  useEffect(() => {
    crearBackupReserva();
    const backupId = window.setInterval(crearBackupReserva, 300000);

    const handleStorageEvent = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === PASAJERO_CONVERTIDO_KEY && event.newValue) {
        const converted = leerPasajeroConvertido();
        if (converted) {
          setConvertedRecord(converted);
          onConversionChange(true);
        }
        return;
      }
      if (event.key === EXPERIENCIAS_EXTRAS_KEY) {
        setSelectedExpIds(leerIdsCarrito());
        return;
      }
      if (event.key === RESERVA_ACTIVA_KEY && event.newValue) {
        const updatedDraft = leerReservaBorrador();
        if (updatedDraft) {
          setDraft((prev) => ({ ...prev, ...updatedDraft }));
          setHasSavedDraft(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.clearInterval(backupId);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [onConversionChange]);

  // Preselect destination when triggered from Destinations cards or Dossier modal
  useEffect(() => {
    if (preselectedDestination) {
      setDraft((prev) => {
        const updated: ReservaDraft = {
          ...prev,
          expedicionSeleccionada: preselectedDestination,
          timestamp: formatDate(new Date())
        };
        writeStorage(RESERVA_ACTIVA_KEY, JSON.stringify(updated));
        setHasSavedDraft(true);
        return updated;
      });
      onClearPreselectedDestination();
    }
  }, [preselectedDestination, onClearPreselectedDestination]);

  const persistDraft = (nextDraft: ReservaDraft) => {
    const withTimestamp: ReservaDraft = {
      ...nextDraft,
      timestamp: formatDate(new Date())
    };
    setDraft(withTimestamp);
    if (writeStorage(RESERVA_ACTIVA_KEY, JSON.stringify(withTimestamp))) {
      setHasSavedDraft(true);
    }
    return withTimestamp;
  };

  const handleFieldChange = <K extends FormFieldKey>(key: K, value: ReservaDraft[K]) => {
    const updated = persistDraft({
      ...draft,
      [key]: value
    });

    if (touched[key] || errors[key]) {
      const msg = validateSingleField(key, updated);
      setErrors((prev) => ({ ...prev, [key]: msg }));
    }
  };

  const handleFieldBlur = (key: FormFieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = validateSingleField(key, draft);
    setErrors((prev) => ({ ...prev, [key]: msg }));
  };

  const handleToggleExperience = (expId: string) => {
    setSelectedExpIds((prev) => {
      const next = prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId];
      guardarIdsCarrito(next);
      return next;
    });
  };

  const handleCancelReserva = () => {
    removeStorage(RESERVA_ACTIVA_KEY);
    setDraft(DEFAULT_DRAFT);
    setErrors({});
    setTouched({});
    setHasSavedDraft(false);
    setShowRetryButton(false);
    setRestoreBanner({ text: '', visible: false });
    onShowToast('Reserva en curso cancelada y datos locales eliminados.', 'info');
  };

  const validateAllForSubmit = (): boolean => {
    const allKeys: FormFieldKey[] = [
      'nombreCompleto',
      'correoElectronico',
      'numeroPasaporte',
      'expedicionSeleccionada',
      'categoriaSuite',
      'ventanaDespegue',
      'rolManifiesto',
      'terminosAceptados'
    ];
    const nextErrors: Partial<Record<FormFieldKey, string>> = {};
    const nextTouched: Partial<Record<FormFieldKey, boolean>> = {};
    let firstInvalidKey: FormFieldKey | null = null;

    allKeys.forEach((key) => {
      nextTouched[key] = true;
      const msg = validateSingleField(key, draft);
      if (msg) {
        nextErrors[key] = msg;
        if (!firstInvalidKey) {
          firstInvalidKey = key;
        }
      }
    });

    setTouched(nextTouched);
    setErrors(nextErrors);

    if (firstInvalidKey) {
      if (firstInvalidKey === 'nombreCompleto') nameInputRef.current?.focus();
      else if (firstInvalidKey === 'correoElectronico') emailInputRef.current?.focus();
      else if (firstInvalidKey === 'numeroPasaporte') passportInputRef.current?.focus();
      else if (firstInvalidKey === 'terminosAceptados') termsInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const submitReservation = async () => {
    setShowRetryButton(false);
    setIsSubmitting(true);

    const payloadDraft: ReservaDraft = {
      ...draft,
      timestamp: formatDate(new Date())
    };

    try {
      const body = new FormData();
      Object.entries(payloadDraft).forEach(([key, value]) => {
        body.append(key, typeof value === 'boolean' ? String(value) : String(value));
      });
      body.append('email', payloadDraft.correoElectronico || '');
      body.append('_cc', payloadDraft.correoElectronico || '');
      body.append(
        '_subject',
        `Nueva reserva Cosmos Tour — ${payloadDraft.expedicionSeleccionada}`
      );
      body.append('_template', 'table');

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body
      });

      if (!response.ok) {
        let detalle: { errors?: { field?: string; message?: string }[] } | null = null;
        try {
          detalle = await response.json();
        } catch {
          detalle = null;
        }
        const err = new Error(`Formspree respondió con estado ${response.status}`) as Error & {
          formspree?: { errors?: { field?: string; message?: string }[] } | null;
        };
        err.formspree = detalle;
        throw err;
      }

      const registro: PasajeroConvertido = {
        convertido: true,
        timestamp: formatDate(new Date()),
        destinoConfirmado: payloadDraft.expedicionSeleccionada,
        codigoMision: generateMissionCode(payloadDraft.expedicionSeleccionada),
        nombrePasajero: payloadDraft.nombreCompleto.trim(),
        ventanaDespegue: payloadDraft.ventanaDespegue,
        categoriaSuite: payloadDraft.categoriaSuite,
        rolManifiesto: payloadDraft.rolManifiesto,
        experienciasExtras: obtenerExperienciasExtrasTextos(selectedExpIds),
        totalExperienciasUSD: calcularTotalCarrito(selectedExpIds)
      };

      writeStorage(PASAJERO_CONVERTIDO_KEY, JSON.stringify(registro));
      onShowToast('¡Reserva Confirmada! Tu credencial AST-2026 está lista.', 'success');
      setShowSuccessBanner(true);

      await new Promise((resolve) => window.setTimeout(resolve, 2000));

      removeStorage(RESERVA_ACTIVA_KEY);
      removeStorage(EXPERIENCIAS_EXTRAS_KEY);
      setHasSavedDraft(false);
      setShowSuccessBanner(false);
      setConvertedRecord(registro);
      onConversionChange(true);

      window.setTimeout(() => {
        credencialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    } catch (error: unknown) {
      const isNetworkError = error instanceof TypeError;
      if (isNetworkError) {
        onShowToast(
          'Error de conexión. Tu reserva está guardada localmente. Intenta nuevamente.',
          'error'
        );
      } else {
        const errWithFormspree = error as {
          formspree?: { errors?: { field?: string; message?: string }[] } | null;
        };
        const fsErrors = errWithFormspree.formspree?.errors || [];
        const fieldErrUpdates: Partial<Record<FormFieldKey, string>> = {};
        fsErrors.forEach((item) => {
          if (item?.field) {
            fieldErrUpdates[item.field as FormFieldKey] = item.message || 'Revisa este campo.';
          }
        });
        if (Object.keys(fieldErrUpdates).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrUpdates }));
        }
        const firstMessage =
          fsErrors.length > 0 && fsErrors[0]?.message
            ? fsErrors[0].message
            : 'No se pudo confirmar la reserva. Tu reserva está guardada localmente. Intenta nuevamente.';
        onShowToast(firstMessage, 'error');
      }

      persistDraft(payloadDraft);
      setShowRetryButton(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAllForSubmit()) {
      onShowToast('Revisa los campos marcados antes de continuar.', 'error');
      return;
    }
    submitReservation();
  };

  const handleDescargarCredencial = () => {
    const codigo = convertedRecord?.codigoMision || 'CT-2026-ORB';
    onShowToast(`Credencial ${codigo} generada. Revisa tu correo.`, 'success');
  };

  const handleContactarConcierge = () => {
    const codigo = convertedRecord?.codigoMision || 'CT-2026-ORB';
    const nombre = convertedRecord?.nombrePasajero || '—';
    const asunto = encodeURIComponent(`Consulta Misión ${codigo}`);
    const cuerpo = encodeURIComponent(
      `Hola Concierge Espacial,\n\nQuiero consultar los detalles de la misión ${codigo}.\n\nPasajero: ${nombre}\n\nAtentamente.`
    );
    window.location.href = `mailto:concierge@cosmos-tour.space?subject=${asunto}&body=${cuerpo}`;
  };

  const handleNuevaReserva = () => {
    removeStorage(PASAJERO_CONVERTIDO_KEY);
    removeStorage(RESERVA_ACTIVA_KEY);
    removeStorage(EXPERIENCIAS_EXTRAS_KEY);
    setConvertedRecord(null);
    onConversionChange(false);
    setDraft(DEFAULT_DRAFT);
    setErrors({});
    setTouched({});
    setSelectedExpIds([]);
    setHasSavedDraft(false);
    setShowRetryButton(false);
    setShowSuccessBanner(false);
    setRestoreBanner({ text: '', visible: false });
    onNavigateSection('registro');
  };

  const totalCarritoUSD = calcularTotalCarrito(selectedExpIds);
  const countCarritoText =
    selectedExpIds.length === 1
      ? '1 experiencia seleccionada'
      : `${selectedExpIds.length} experiencias seleccionadas`;

  // Render converted passenger details
  const iconoDestino = convertedRecord
    ? obtenerIconoDestino(convertedRecord.destinoConfirmado)
    : '🛸';
  const infoDestino = convertedRecord
    ? obtenerInfoDestino(convertedRecord.destinoConfirmado)
    : { dist: '—', duration: '—' };
  const resumenExtras =
    convertedRecord &&
    Array.isArray(convertedRecord.experienciasExtras) &&
    convertedRecord.experienciasExtras.length > 0
      ? `${convertedRecord.experienciasExtras.join(' · ')} — Total: $${(
          convertedRecord.totalExperienciasUSD || 0
        ).toLocaleString('en-US')} USD`
      : 'Ninguna';

  return (
    <section id="registro" className="section-tripulacion" aria-labelledby="registro-title">
      <div className="container">
        <header className="section-head-center-narrow">
          <div className="section-kicker">Despacho Aeroespacial Privado · Manifiesto de Vuelo</div>
          <h2 id="registro-title" className="section-title">
            Hoja de Registro de Tripulación
          </h2>
          <p className="section-intro section-intro-center">
            Formalice su ingreso en el selecto padrón de exploradores. Tras validar sus datos, se
            activará el escaneo biométrico preliminar de autorización.
          </p>
        </header>

        <div className="manifest-card">
          {/* Sello Superior de Acreditación */}
          <div className="manifest-top-seal">
            <div className="manifest-seal-text">
              COSMOS TOUR CREW ACCREDITATION · PROTOCOLO AST-2026
            </div>
            <div className="telemetry-text seal-status-row">
              ESTADO:{' '}
              <span
                id="manifest-seal-status"
                className="seal-status"
                style={{ color: isConverted ? '#34d399' : undefined }}
              >
                {isConverted ? '● AUTORIZADO · BIO-CLEARED' : '○ PENDIENTE DE ESCANEO'}
              </span>
            </div>
          </div>

          {/* Notificación discreta de restauración de reserva */}
          <div
            id="restore-notification"
            className={`restore-notification${restoreBanner.visible ? ' is-visible' : ''}`}
            role="status"
            aria-live="polite"
            hidden={!restoreBanner.visible || isConverted}
          >
            {restoreBanner.text}
          </div>

          {/* Confirmación visual del envío */}
          <div
            id="envio-exito"
            className="envio-exito"
            role="status"
            aria-live="polite"
            hidden={!showSuccessBanner}
          >
            ✅ ¡Reserva Confirmada! Tu credencial AST-2026 está lista.
          </div>

          {/* CARRITO DE EXPERIENCIAS PREMIUM */}
          <section
            className={`experiencias-carrito${isConverted ? ' hidden' : ''}`}
            id="experiencias-carrito"
            aria-labelledby="carrito-title"
          >
            <div className="carrito-header">
              <h3 id="carrito-title" className="carrito-title">
                🚀 Experiencias Premium a Bordo
              </h3>
              <p className="carrito-subtitle">
                Añade vivencias exclusivas a tu manifiesto de vuelo
              </p>
            </div>

            <div className="carrito-grid" id="carrito-grid">
              {EXPERIENCIAS_CATALOGO.map((exp) => {
                const checked = selectedExpIds.includes(exp.id);
                return (
                  <label key={exp.id} className="carrito-item" htmlFor={exp.inputId}>
                    <input
                      type="checkbox"
                      id={exp.inputId}
                      className="carrito-check"
                      data-exp-id={exp.id}
                      checked={checked}
                      onChange={() => handleToggleExperience(exp.id)}
                    />
                    <span className="carrito-info">
                      <span className="carrito-nombre">{exp.nombre}</span>
                      <span className="carrito-precio">{formatearMontoUSD(exp.precio)}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="carrito-total">
              <span id="carrito-count" className="carrito-count">
                {countCarritoText}
              </span>
              <strong id="carrito-total-monto" className="carrito-total-monto">
                {formatearMontoUSD(totalCarritoUSD)}
              </strong>
            </div>
          </section>

          {/* Formulario de Manifiesto */}
          <form
            id="manifest-form"
            action={FORMSPREE_ENDPOINT}
            method="POST"
            noValidate
            className={isConverted ? 'hidden' : ''}
            style={{ display: isConverted ? 'none' : undefined }}
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="manifest-name">
                  Nombre Completo del Astronauta *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="manifest-name"
                  name="nombreCompleto"
                  className={`form-input${errors.nombreCompleto ? ' field-invalid error' : ''}`}
                  required
                  placeholder="Ej. Helena Valenzuela Ruiz"
                  value={draft.nombreCompleto}
                  aria-invalid={Boolean(errors.nombreCompleto)}
                  aria-describedby="manifest-name-error"
                  onChange={(e) => handleFieldChange('nombreCompleto', e.target.value)}
                  onBlur={() => handleFieldBlur('nombreCompleto')}
                />
                <span id="manifest-name-error" className="error-message" aria-live="polite">
                  {errors.nombreCompleto || ''}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manifest-email">
                  Correo Electrónico Confidencial *
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="manifest-email"
                  name="correoElectronico"
                  className={`form-input${errors.correoElectronico ? ' field-invalid error' : ''}`}
                  required
                  placeholder="h.valenzuela@cosmos-private.com"
                  value={draft.correoElectronico}
                  aria-invalid={Boolean(errors.correoElectronico)}
                  aria-describedby="manifest-email-error"
                  onChange={(e) => handleFieldChange('correoElectronico', e.target.value)}
                  onBlur={() => handleFieldBlur('correoElectronico')}
                />
                <span id="manifest-email-error" className="error-message" aria-live="polite">
                  {errors.correoElectronico || ''}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manifest-passport">
                  Número de Pasaporte Internacional *
                </label>
                <input
                  ref={passportInputRef}
                  type="text"
                  id="manifest-passport"
                  name="numeroPasaporte"
                  className={`form-input${errors.numeroPasaporte ? ' field-invalid error' : ''}`}
                  required
                  placeholder="P-89240177A"
                  value={draft.numeroPasaporte}
                  aria-invalid={Boolean(errors.numeroPasaporte)}
                  aria-describedby="manifest-passport-error"
                  onChange={(e) => handleFieldChange('numeroPasaporte', e.target.value)}
                  onBlur={() => handleFieldBlur('numeroPasaporte')}
                />
                <span id="manifest-passport-error" className="error-message" aria-live="polite">
                  {errors.numeroPasaporte || ''}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manifest-destination">
                  Expedición Seleccionada
                </label>
                <select
                  id="manifest-destination"
                  name="expedicionSeleccionada"
                  className={`form-select${
                    errors.expedicionSeleccionada ? ' field-invalid error' : ''
                  }`}
                  value={draft.expedicionSeleccionada}
                  onChange={(e) => handleFieldChange('expedicionSeleccionada', e.target.value)}
                  onBlur={() => handleFieldBlur('expedicionSeleccionada')}
                >
                  <option value="La Luna">La Luna (Expedición Cis-Lunar Artemisa)</option>
                  <option value="Marte">Marte (Odisea Valles Marineris)</option>
                  <option value="Estación Espacial Internacional">
                    Estación Espacial Internacional (Apex Cupola)
                  </option>
                </select>
                <span id="manifest-destination-error" className="error-message" aria-live="polite">
                  {errors.expedicionSeleccionada || ''}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manifest-suite">
                  Categoría de Suite a Bordo
                </label>
                <select
                  id="manifest-suite"
                  name="categoriaSuite"
                  className={`form-select${errors.categoriaSuite ? ' field-invalid error' : ''}`}
                  value={draft.categoriaSuite}
                  onChange={(e) => handleFieldChange('categoriaSuite', e.target.value)}
                  onBlur={() => handleFieldBlur('categoriaSuite')}
                >
                  <option value="Celestial Sovereign Suite">
                    Celestial Sovereign Suite (42 m³)
                  </option>
                  <option value="Mirador Cupola Stateroom">
                    Mirador Cupola Stateroom (35 m³)
                  </option>
                  <option value="Pod Privado de Ingravidez">
                    Pod Privado de Ingravidez (24 m³)
                  </option>
                </select>
                <span id="manifest-suite-error" className="error-message" aria-live="polite">
                  {errors.categoriaSuite || ''}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manifest-window">
                  Ventana Temporal de Despegue
                </label>
                <select
                  id="manifest-window"
                  name="ventanaDespegue"
                  className={`form-select${errors.ventanaDespegue ? ' field-invalid error' : ''}`}
                  value={draft.ventanaDespegue}
                  onChange={(e) => handleFieldChange('ventanaDespegue', e.target.value)}
                  onBlur={() => handleFieldBlur('ventanaDespegue')}
                >
                  <option value="Octubre 2026">Octubre 2026</option>
                  <option value="Noviembre 2026">Noviembre 2026</option>
                  <option value="Marzo 2027">Marzo 2027</option>
                  <option value="Junio 2027">Junio 2027</option>
                </select>
                <span id="manifest-window-error" className="error-message" aria-live="polite">
                  {errors.ventanaDespegue || ''}
                </span>
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="manifest-role">
                  Rol en el Manifiesto de Vuelo
                </label>
                <select
                  id="manifest-role"
                  name="rolManifiesto"
                  className={`form-select${errors.rolManifiesto ? ' field-invalid error' : ''}`}
                  value={draft.rolManifiesto}
                  onChange={(e) => handleFieldChange('rolManifiesto', e.target.value)}
                  onBlur={() => handleFieldBlur('rolManifiesto')}
                >
                  <option value="Comandante Civil de Travesía">
                    Comandante Civil de Travesía
                  </option>
                  <option value="Especialista de Observación Astronómica">
                    Especialista de Observación Astronómica
                  </option>
                  <option value="Pasajero de Placer & Bienestar">
                    Pasajero de Placer &amp; Bienestar
                  </option>
                </select>
                <span id="manifest-role-error" className="error-message" aria-live="polite">
                  {errors.rolManifiesto || ''}
                </span>
              </div>
            </div>

            <div className="form-group full-width form-terms-group">
              <div className="terms-row">
                <input
                  ref={termsInputRef}
                  type="checkbox"
                  id="manifest-terms"
                  name="terminosAceptados"
                  required
                  className={`terms-checkbox${
                    errors.terminosAceptados ? ' field-invalid error' : ''
                  }`}
                  checked={draft.terminosAceptados}
                  aria-invalid={Boolean(errors.terminosAceptados)}
                  aria-describedby="manifest-terms-error"
                  onChange={(e) => handleFieldChange('terminosAceptados', e.target.checked)}
                  onBlur={() => handleFieldBlur('terminosAceptados')}
                />
                <label className="form-label terms-label" htmlFor="manifest-terms">
                  Acepto los términos y condiciones de vuelo
                </label>
              </div>
              <span id="manifest-terms-error" className="error-message" aria-live="polite">
                {errors.terminosAceptados || ''}
              </span>
            </div>

            <div className="form-footer-row">
              <span className="telemetry-text form-footnote">
                El envío activará el escaneo biométrico seguro de tolerancia de vuelo.
              </span>
              <div className="form-footer-actions">
                <button
                  type="button"
                  id="btn-cancelar-reserva"
                  className="btn-cancel-reserva"
                  hidden={!hasSavedDraft}
                  onClick={handleCancelReserva}
                >
                  Cancelar Reserva
                </button>
                <button
                  type="button"
                  id="btn-reintentar-envio"
                  className="btn-primary btn-retry-envio"
                  hidden={!showRetryButton}
                  onClick={() => submitReservation()}
                >
                  Reintentar Envío
                </button>
                <button
                  type="submit"
                  className={`btn-primary btn-cta-lg${isSubmitting ? ' is-loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      🚀 Procesando tu reserva en Cosmos Tour...
                    </>
                  ) : (
                    'Validar y Emitir Credencial'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Bloque de credencial AST-2026 */}
          <div
            ref={credencialRef}
            id="credencial-embarque"
            className="credencial-ast2026"
            role="status"
            hidden={!isConverted || !convertedRecord}
          >
            <div className="header-credencial">
              <h2>✈️ TARJETA OFICIAL DE EMBARQUE ESPACIAL</h2>
              <p className="subtitulo">COSMOS TOUR CREW ACCREDITATION · PROTOCOLO AST-2026</p>
            </div>
            <div className="datos-pasajero">
              <p>
                <strong>ESTADO:</strong> <span className="status">● BIO-CLEARED</span>
              </p>
              <p>
                <strong>NOMBRE DEL PASAJERO:</strong>{' '}
                <span id="cred-nombre">{convertedRecord?.nombrePasajero || '—'}</span>
              </p>
              <p>
                <strong>CÓDIGO DE MISIÓN:</strong>{' '}
                <span id="cred-codigo">{convertedRecord?.codigoMision || '—'}</span>
              </p>
              <p>
                <strong>DESTINO:</strong>{' '}
                <span id="cred-destino">
                  {convertedRecord
                    ? `${iconoDestino} ${convertedRecord.destinoConfirmado} (${infoDestino.dist}, ${infoDestino.duration})`
                    : '—'}
                </span>
              </p>
              <p>
                <strong>VENTANA DE DESPEGUE:</strong>{' '}
                <span id="cred-ventana">{convertedRecord?.ventanaDespegue || '—'}</span>
              </p>
              <p>
                <strong>CATEGORÍA DE SUITE:</strong>{' '}
                <span id="cred-suite">{convertedRecord?.categoriaSuite || '—'}</span>
              </p>
              <p>
                <strong>EXPERIENCIAS ADICIONALES:</strong>{' '}
                <span id="cred-experiencias">{resumenExtras}</span>
              </p>
            </div>
            <div className="acciones">
              <button type="button" onClick={handleDescargarCredencial}>
                📥 Descargar Credencial PDF
              </button>
              <button type="button" onClick={handleContactarConcierge}>
                📞 Contactar Concierge Espacial
              </button>
              <button
                type="button"
                id="btn-nueva-reserva"
                className="btn-cancel-reserva"
                onClick={handleNuevaReserva}
              >
                Registrar otra expedición
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
