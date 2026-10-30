import React, { useEffect, useMemo, useState } from 'react';

interface CountdownSectionProps {
  onNavigateSection: (sectionId: string) => void;
  isConverted: boolean;
  daysFromToday?: number;
}

const DEFAULT_PROMO_DAYS = 30;

const padTwo = (val: number): string => String(val).padStart(2, '0');

const calculateTimeDifference = (targetTimestamp: number) => {
  const diffMs = Math.max(0, targetTimestamp - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  const dias = Math.floor(totalSeconds / 86400);
  const horas = Math.floor((totalSeconds % 86400) / 3600);
  const minutos = Math.floor((totalSeconds % 3600) / 60);
  const segundos = totalSeconds % 60;

  return {
    dias: padTwo(dias),
    horas: padTwo(horas),
    minutos: padTwo(minutos),
    segundos: padTwo(segundos),
    finished: diffMs <= 0
  };
};

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  onNavigateSection,
  isConverted,
  daysFromToday = DEFAULT_PROMO_DAYS
}) => {
  // Fecha objetivo: 30 días desde hoy por defecto (ajustable)
  const targetTimestamp = useMemo(() => {
    const now = new Date();
    return now.getTime() + daysFromToday * 24 * 60 * 60 * 1000;
  }, [daysFromToday]);

  const targetDateFormatted = useMemo(() => {
    return new Date(targetTimestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [targetTimestamp]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeDifference(targetTimestamp));

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeDifference(targetTimestamp));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [targetTimestamp]);

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateSection('registro');
  };

  return (
    <section
      id="cuenta-atras"
      className="ct-countdown ct-countdown-block"
      aria-labelledby="ct-countdown-title"
      data-days={daysFromToday}
    >
      <div className="ct-countdown-inner container">
        <div className="ct-countdown-copy">
          <span className="ct-countdown-badge">¡Oferta de Lanzamiento!</span>
          <p className="ct-countdown-kicker">Promoción Especial · Tours Espaciales</p>
          <h2 id="ct-countdown-title" className="ct-countdown-title">
            ¡Oferta de Lanzamiento!
          </h2>
          <p className="ct-countdown-fecha" data-ct-estado aria-live="polite">
            {timeLeft.finished
              ? '¡La promoción de lanzamiento ha finalizado!'
              : `Reserva tu plaza orbital antes del ${targetDateFormatted} (${daysFromToday} días desde hoy)`}
          </p>
        </div>

        <div
          className="ct-countdown-grid"
          role="timer"
          aria-label="Contador regresivo para la Oferta de Lanzamiento de Cosmos Tour"
        >
          <div className="ct-countdown-unit ct-countdown-box">
            <span className="ct-countdown-value ct-countdown-number" data-ct-unit="dias">
              {timeLeft.dias}
            </span>
            <span className="ct-countdown-label">Días</span>
          </div>

          <div className="ct-countdown-unit ct-countdown-box">
            <span className="ct-countdown-value ct-countdown-number" data-ct-unit="horas">
              {timeLeft.horas}
            </span>
            <span className="ct-countdown-label">Horas</span>
          </div>

          <div className="ct-countdown-unit ct-countdown-box">
            <span className="ct-countdown-value ct-countdown-number" data-ct-unit="minutos">
              {timeLeft.minutos}
            </span>
            <span className="ct-countdown-label">Minutos</span>
          </div>

          <div className="ct-countdown-unit ct-countdown-box">
            <span className="ct-countdown-value ct-countdown-number" data-ct-unit="segundos">
              {timeLeft.segundos}
            </span>
            <span className="ct-countdown-label">Segundos</span>
          </div>
        </div>

        <a
          className={`ct-countdown-cta${isConverted ? ' hidden' : ''}`}
          href="#registro"
          onClick={handleCtaClick}
        >
          Aprovechar Oferta de Lanzamiento →
        </a>
      </div>
    </section>
  );
};
