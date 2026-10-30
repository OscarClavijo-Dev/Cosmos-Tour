import React, { useEffect, useRef } from 'react';
import { PLANET_FICHAS } from '../data/catalog';
import { PlanetKey } from '../types';

interface PlanetModalProps {
  planetKey: PlanetKey | null;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const PlanetModal: React.FC<PlanetModalProps> = ({
  planetKey,
  onClose,
  onNavigateSection
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = planetKey !== null;
  const data = planetKey ? PLANET_FICHAS[planetKey] : null;

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
      id="planet-modal"
      className={`modal-overlay${isOpen ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Ficha del cuerpo celeste"
      aria-hidden={!isOpen}
      onClick={handleBackdropClick}
    >
      <div className="modal-box planet-box">
        <button
          ref={closeBtnRef}
          type="button"
          id="planet-modal-close"
          className="modal-close-btn"
          aria-label="Cerrar ficha planetaria"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="planet-visual">
          {data && (
            <img
              id="planet-modal-img"
              src={data.img}
              alt={`Imagen real de ${data.name} (NASA)`}
              width={640}
              height={360}
              decoding="async"
            />
          )}
        </div>
        <div className="modal-block">
          <div className="telemetry-text modal-kicker">FICHA CELESTE · CATÁLOGO COSMOS TOUR</div>
          <h3 id="planet-modal-title" className="modal-title">
            {data?.name || 'Planeta'}
          </h3>
          <div id="planet-modal-sub" className="telemetry-text modal-subtitle">
            {data?.sub || '—'}
          </div>
        </div>
        <div className="telemetry-text modal-telemetry-grid">
          <div>
            <span className="modal-metric-label">DISTANCIA</span>
            <span id="planet-modal-dist" className="modal-metric-value">
              {data?.dist || '—'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">DIÁMETRO</span>
            <span id="planet-modal-diam" className="modal-metric-value">
              {data?.diam || '—'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">GRAVEDAD</span>
            <span id="planet-modal-grav" className="modal-metric-value-gold">
              {data?.grav || '—'}
            </span>
          </div>
          <div>
            <span className="modal-metric-label">TEMPERATURA</span>
            <span id="planet-modal-temp" className="modal-metric-value">
              {data?.temp || '—'}
            </span>
          </div>
        </div>
        <div className="modal-block">
          <p id="planet-modal-desc" className="planet-desc">
            {data?.desc || '—'}
          </p>
        </div>
        <div className="modal-footer-row">
          <div>
            <span className="telemetry-text modal-fare-label">TRAVESÍA ESTIMADA</span>
            <div id="planet-modal-viaje" className="telemetry-text modal-price">
              {data?.viaje || '—'}
            </div>
          </div>
          <a
            href="#destinos"
            className="btn-primary btn-cta-md"
            id="planet-modal-cta"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              onNavigateSection('destinos');
            }}
          >
            Ver Rutas Disponibles
          </a>
        </div>
      </div>
    </div>
  );
};
