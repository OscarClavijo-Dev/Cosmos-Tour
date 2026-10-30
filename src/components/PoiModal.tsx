import React, { useEffect, useRef } from 'react';
import { PoiItem } from '../types';

interface PoiModalProps {
  poi: PoiItem | null;
  onClose: () => void;
}

export const PoiModal: React.FC<PoiModalProps> = ({ poi, onClose }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = poi !== null;

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
      id="poi-modal"
      className={`modal-overlay${isOpen ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Ficha celeste"
      aria-hidden={!isOpen}
      onClick={handleBackdropClick}
    >
      <div className="modal-box poi-box">
        <button
          ref={closeBtnRef}
          type="button"
          id="poi-modal-close"
          className="modal-close-btn"
          aria-label="Cerrar ficha celeste"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="poi-visual">
          {poi && (
            <img
              id="poi-modal-img"
              src={poi.img}
              alt={`Imagen real: ${poi.title} (NASA)`}
              width={640}
              height={360}
              decoding="async"
            />
          )}
        </div>
        <div className="modal-block">
          <div className="telemetry-text modal-kicker">ARCHIVO CELESTE · MIRADOR ESTELAR</div>
          <h3 id="poi-modal-title" className="modal-title">
            {poi?.title || '—'}
          </h3>
          <div id="poi-modal-meta" className="telemetry-text modal-subtitle">
            {poi?.meta || '—'}
          </div>
          <p id="poi-modal-story" className="poi-story">
            {poi?.story || '—'}
          </p>
        </div>
        <div className="modal-footer-row">
          <span className="telemetry-text modal-fare-label">
            OBSERVADO DESDE LA CUPOLA · MISIÓN CT-VUELO-03
          </span>
          <button
            type="button"
            className="btn-secondary btn-cta-md"
            id="poi-modal-done"
            onClick={onClose}
          >
            Cerrar Archivo
          </button>
        </div>
      </div>
    </div>
  );
};
