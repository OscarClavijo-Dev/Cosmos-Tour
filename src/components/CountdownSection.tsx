import React, { useEffect, useState } from 'react';

interface CountdownSectionProps {
  onNavigateSection: (sectionId: string) => void;
  isConverted: boolean;
}

const CT_TARGET_ISO = '2026-11-15T09:00:00';

const padTwo = (val: number) => String(val).padStart(2, '0');

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  onNavigateSection,
  isConverted
}) => {
  const [timeLeft, setTimeLeft] = useState({
    dias: '00',
    horas: '00',
    minutos: '00',
    segundos: '00',
    finished: false
  });

  useEffect(() => {
    const targetDate = new Date(CT_TARGET_ISO);

    const tick = () => {
      const remainingMs = targetDate.getTime() - Date.now();
      const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
      const dias = Math.floor(totalSeconds / 86400);
      const horas = Math.floor((totalSeconds % 86400) / 3600);
      const minutos = Math.floor((totalSeconds % 3600) / 60);
      const segundos = totalSeconds % 60;

      setTimeLeft({
        dias: padTwo(dias),
        horas: padTwo(horas),
        minutos: padTwo(minutos),
        segundos: padTwo(segundos),
        finished: remainingMs <= 0
      });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateSection('registro');
  };

  return (
    <section
      id="cuenta-atras"
      className="ct-countdown-block"
      aria-labelledby="ct-countdown-title"
      data-ct-target={CT_TARGET_ISO}
    >
      <div className="ct-countdown-inner container">
        <div className="ct-countdown-copy">
          <p className="ct-countdown-kicker">Próxima ventana de despegue</p>
          <h2 id="ct-countdown-title" className="ct-countdown-title">
            Cuenta regresiva T-menos
          </h2>
          <p className="ct-countdown-fecha" data-ct-estado aria-live="polite">
            {timeLeft.finished
              ? '¡Ventana abierta! El despegue está en curso.'
              : 'Ventana programada: 15/11/2026 · 09:00 (hora local)'}
          </p>
        </div>

        <div
          className="ct-countdown-grid"
          role="timer"
          aria-label="Cuenta regresiva hasta el despegue del 15 de noviembre de 2026 a las 9:00"
        >
          <div className="ct-countdown-unit">
            <span className="ct-countdown-value" data-ct-unit="dias">
              {timeLeft.dias}
            </span>
            <span className="ct-countdown-label">Días</span>
          </div>
          <div className="ct-countdown-unit">
            <span className="ct-countdown-value" data-ct-unit="horas">
              {timeLeft.horas}
            </span>
            <span className="ct-countdown-label">Horas</span>
          </div>
          <div className="ct-countdown-unit">
            <span className="ct-countdown-value" data-ct-unit="minutos">
              {timeLeft.minutos}
            </span>
            <span className="ct-countdown-label">Min</span>
          </div>
          <div className="ct-countdown-unit">
            <span className="ct-countdown-value" data-ct-unit="segundos">
              {timeLeft.segundos}
            </span>
            <span className="ct-countdown-label">Seg</span>
          </div>
        </div>

        <a
          className={`ct-countdown-cta${isConverted ? ' hidden' : ''}`}
          href="#registro"
          onClick={handleCtaClick}
        >
          Reservar en esta ventana →
        </a>
      </div>
    </section>
  );
};
