import React, { useEffect, useRef, useState } from 'react';
import { DESTINATION_FILES } from '../data/catalog';
import { DestinationKey } from '../types';

interface DestinationsSectionProps {
  onOpenDossier: (destKey: DestinationKey) => void;
  onBookDestination: (destOptionValue: string) => void;
}

const DESTINATION_ORDER: DestinationKey[] = [
  DestinationKey.Luna,
  DestinationKey.Marte,
  DestinationKey.Iss
];

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  onOpenDossier,
  onBookDestination
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="destinos"
      className={`section-destinos animate-on-scroll${animated ? ' animated' : ''}`}
      aria-labelledby="destinos-title"
    >
      <div className="container">
        <header className="section-header">
          <div>
            <div className="section-kicker">Catálogo de Expediciones · Temporada 2026-2027</div>
            <h2 id="destinos-title" className="section-title">
              Rutas Exclusivas del Cosmos
            </h2>
          </div>
          <p className="section-intro">
            Cada destino cuenta con rigurosos protocolos aeroespaciales y comodidades concebidas
            para el descanso y la contemplación estelar.
          </p>
        </header>

        <div className="destinations-grid">
          {DESTINATION_ORDER.map((destKey) => {
            const dest = DESTINATION_FILES[destKey];
            return (
              <article key={dest.key} className="destination-card">
                <div>
                  <div className="dest-meta-top">
                    <span>{dest.dist}</span>
                    <span className="dest-meta-duration">{dest.duration}</span>
                  </div>
                  <h3 className="dest-title">{dest.title}</h3>
                  <div className="dest-subtitle">{dest.subtitle}</div>
                  <p className="dest-desc">{dest.cardDesc}</p>
                  <ul className="dest-highlights">
                    {dest.cardHighlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                </div>
                <div className="dest-footer">
                  <div className="dest-price-row">
                    <span className="dest-price-label">Inversión por plaza</span>
                    <span className="dest-price-val">{dest.price}</span>
                  </div>
                  <div className="dest-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-warp-action"
                      data-dest={dest.key}
                      aria-label={`Salto Warp a ${dest.formOptionValue}`}
                      onClick={() => onOpenDossier(dest.key)}
                    >
                      Salto Warp
                    </button>
                    <button
                      type="button"
                      className="btn-primary btn-book-dest"
                      data-dest-name={dest.formOptionValue}
                      aria-label={`Reservar expedición a ${dest.formOptionValue}`}
                      onClick={() => onBookDestination(dest.formOptionValue)}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
