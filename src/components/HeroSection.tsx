import React from 'react';
import { PLANET_FICHAS } from '../data/catalog';
import { PlanetKey, VisorOrbitalState } from '../types';

interface HeroSectionProps {
  onNavigateSection: (sectionId: string) => void;
  isConverted: boolean;
  visorState: VisorOrbitalState;
  onSelectPlanet: (planetKey: PlanetKey, targetKey: string, label: string) => void;
  onOpenPlanetModal: (planetKey: PlanetKey) => void;
}

const PLANET_ORDER: PlanetKey[] = [
  PlanetKey.Tierra,
  PlanetKey.Marte,
  PlanetKey.Luna,
  PlanetKey.Jupiter,
  PlanetKey.Saturno
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateSection,
  isConverted,
  visorState,
  onSelectPlanet,
  onOpenPlanetModal
}) => {
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigateSection(sectionId);
  };

  return (
    <section id="ct-hero" className="ct-hero" aria-labelledby="ct-hero-title">
      <div className="ct-hero-bg" aria-hidden="true" />
      <div className="ct-hero-orb" aria-hidden="true" />

      <div className="ct-hero-content">
        <p className="ct-hero-kicker">Agencia de Turismo Espacial · Ventana 2026</p>

        <h1 id="ct-hero-title" className="ct-hero-title">
          Explora el Universo
        </h1>

        <p className="ct-hero-subtitle">
          Tours espaciales de alto lujo a la Luna, Marte y la Estación Espacial Internacional.
          Despega a bordo de nuestra flota privada y vive la experiencia definitiva más allá de la
          atmósfera terrestre.
        </p>

        <div className="ct-hero-actions">
          <a
            className={`ct-hero-cta ct-hero-cta-primary${isConverted ? ' hidden' : ''}`}
            href="#registro"
            onClick={(e) => handleAnchor(e, 'registro')}
          >
            Reserva tu Viaje
          </a>
          <a
            className="ct-hero-cta ct-hero-cta-secondary"
            href="#destinos"
            onClick={(e) => handleAnchor(e, 'destinos')}
          >
            Conoce Más
          </a>
        </div>

        <p className="ct-hero-meta">Despegue: Noviembre 2026 · Solo 24 plazas por ventana</p>

        <div className="planet-picker" style={{ justifyContent: 'center' }}>
          {PLANET_ORDER.map((planetKey) => {
            const ficha = PLANET_FICHAS[planetKey];
            const isActive = visorState.destinoActivo === ficha.targetKey;
            return (
              <button
                key={planetKey}
                type="button"
                className={`planet-btn segmented-btn${isActive ? ' active' : ''}`}
                data-planet-target={ficha.targetKey}
                data-planet-info={planetKey}
                onClick={() => {
                  onSelectPlanet(planetKey, ficha.targetKey, ficha.shortName);
                  onOpenPlanetModal(planetKey);
                }}
              >
                <img
                  src={ficha.thumbWebp}
                  alt={ficha.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                />
                <span className="planet-btn-name">{ficha.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="hero-telemetry-bottom" style={{ justifyContent: 'center' }}>
          <div className="hud-metrics">
            <div className="metric-item">
              <span className="metric-label">Altitud Orbital</span>
              <span className="metric-value">
                <span className="metric-number">{visorState.altitud.toFixed(1)}</span>{' '}
                <span className="metric-unit">KM</span>
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Velocidad</span>
              <span className="metric-value">
                <span className="metric-number">{visorState.velocidad.toFixed(2)}</span>{' '}
                <span className="metric-unit">KM/S</span>
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Período Orbital</span>
              <span className="metric-value">
                <span className="metric-number">{visorState.periodo.toFixed(2)}</span>{' '}
                <span className="metric-unit">MIN</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
