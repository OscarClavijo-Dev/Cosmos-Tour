import React, { useEffect, useRef } from 'react';
import { DESTINATION_FILES } from '../data/catalog';
import { DestinationKey } from '../types';

interface DossierModalProps {
  destinationKey: DestinationKey | null;
  onClose: () => void;
  onSelectDestination: (destOptionValue: string) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  destinationKey,
  onClose,
  onSelectDestination
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = destinationKey !== null;
  const file = destinationKey ? DESTINATION_FILES[destinationKey] : null;

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      id="dossier-modal"
      className={`modal-overlay${isOpen ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      onClick={handleBackdropClick}
    >
      <div className="modal-box">
        <button
          ref={closeBtnRef}
          type="button"
          id="modal-close-btn"
          className="modal-close-btn"
          aria-label="Cerrar expediente"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="modal-block">
          <div className="telemetry-text modal-kicker">
            EXPEDIENTE DE NAVEGACIÓN · DESPEGUE:{' '}
            <span id="modal-departure">{file?.departure || 'Noviembre 2026'}</span>
          </div>
          <h3 id="modal-title" className="modal-title">
            {file?.title || 'Destino'}
          </h3>
          <div id="modal-subtitle" className="telemetry-text modal-subtitle">
            {file?.subtitle || 'Subtítulo'}
          </div>
        </div>

        <div className="telemetry-text modal-telemetry-grid">
          <div>
            <span className="modal-metric-label">DISTANCIA</span>
            <span id="modal-dist" className="modal-metric-value">
              {file?.dist || '-'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">DURACIÓN</span>
            <span id="modal-duration" className="modal-metric-value">
              {file?.duration || '-'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">GRAVEDAD</span>
            <span id="modal-gravity" className="modal-metric-value-gold">
              {file?.gravity || '-'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">TEMPERATURA</span>
            <span id="modal-temp" className="modal-metric-value">
              {file?.temp || '-'}
            </span>
          </div>
        </div>

        <div className="modal-block">
          <h4 className="telemetry-text modal-section-title">
            Experiencias y Misiones en Destino
          </h4>
          <ul id="modal-highlights" className="dest-highlights">
            {(file?.highlights || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="modal-block-lg">
          <h4 className="telemetry-text modal-section-title">Servicios Exclusivos a Bordo</h4>
          <ul id="modal-luxuries" className="dest-highlights">
            {(file?.luxuries || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="modal-footer-row">
          <div>
            <span className="telemetry-text modal-fare-label">TARIFA ALL-INCLUSIVE</span>
            <div id="modal-price" className="telemetry-text modal-price">
              {file?.price || '$0'}
            </div>
          </div>
          <button
            type="button"
            className="btn-primary btn-book-dest btn-cta-md"
            onClick={() => {
              const targetDest = file?.formOptionValue || 'La Luna';
              onClose();
              onSelectDestination(targetDest);
            }}
          >
            Seleccionar Este Destino
          </button>
        </div>
      </div>
    </div>
  );
};
