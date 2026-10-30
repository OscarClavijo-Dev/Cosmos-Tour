import React, { useCallback, useEffect, useRef, useState } from 'react';
import { POI_ITEMS, ZERO_G_ITEMS_INITIAL } from '../data/catalog';
import { FlightStage, PoiItem } from '../types';
import { clamp } from '../utils/storage';

interface FlightSimulationSectionProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenPoiModal: (poi: PoiItem) => void;
}

const LAUNCH_DURATION_MS = 6000;
const MICRO_GRAVITY = 0.035;
const ZERO_G_FRICTION = 0.995;
const ZERO_G_RESTITUTION = 0.75;
const ZERO_G_MAX_SPEED = 6;
const CUPOLA_PARALLAX_PX = 16;

interface ZeroGBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const FlightSimulationSection: React.FC<FlightSimulationSectionProps> = ({
  onShowToast,
  onOpenPoiModal
}) => {
  const [activeStage, setActiveStage] = useState<FlightStage>(FlightStage.Lanzamiento);

  // Stage 1: Launch Simulation state
  const [launchRunning, setLaunchRunning] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);
  const [throttlePct, setThrottlePct] = useState('0%');
  const [gaugeMach, setGaugeMach] = useState('Mach 1.0');
  const [gaugeAlt, setGaugeAlt] = useState('12.4 KM');
  const [gaugeG, setGaugeG] = useState('1.00 G');
  const [gaugeTime, setGaugeTime] = useState('0.0 S');
  const launchRafRef = useRef<number | null>(null);
  const launchStartRef = useRef<number>(0);

  // Stage 2: Zero-G Arena state
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const bodiesRef = useRef<ZeroGBody[]>([]);
  const zeroGRafRef = useRef<number | null>(null);

  // Stage 3: Cupola Window state
  const cupolaWindowRef = useRef<HTMLDivElement | null>(null);
  const [skyOffset, setSkyOffset] = useState({ x: 0, y: 0 });
  const [hoveredPoi, setHoveredPoi] = useState<{
    text: string;
    left: number;
    top: number;
    visible: boolean;
  }>({ text: '', left: 0, top: 0, visible: false });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stopLaunchRaf = useCallback(() => {
    if (launchRafRef.current !== null) {
      cancelAnimationFrame(launchRafRef.current);
      launchRafRef.current = null;
    }
  }, []);

  const handleToggleIgnition = () => {
    if (launchRunning) {
      // Abort sequence
      stopLaunchRaf();
      setLaunchRunning(false);
      setShakeActive(false);
      setThrottlePct('0%');
      setGaugeMach('Mach 1.0');
      setGaugeAlt('12.4 KM');
      setGaugeG('1.00 G');
      setGaugeTime('0.0 S');
      onShowToast('Secuencia de lanzamiento abortada por el operador.', 'error');
      return;
    }

    if (prefersReducedMotion) {
      onShowToast('Modo "reducir movimiento" activo: secuencia sin vibración.', 'info');
    }

    setLaunchRunning(true);
    if (!prefersReducedMotion) {
      setShakeActive(true);
    }
    launchStartRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - launchStartRef.current;
      const progress = clamp(elapsed / LAUNCH_DURATION_MS, 0, 1);
      const seconds = elapsed / 1000;

      setThrottlePct(`${(progress * 100).toFixed(1)}%`);
      setGaugeTime(`${seconds.toFixed(1)} S`);
      setGaugeMach(`Mach ${(progress * 8.7).toFixed(1)}`);
      setGaugeAlt(`${(progress * 420.5).toFixed(1)} KM`);
      const gForce = 1 + 2.6 * Math.sin(Math.PI * progress);
      setGaugeG(`${gForce.toFixed(2)} G`);

      if (progress >= 1) {
        launchRafRef.current = null;
        setLaunchRunning(false);
        setShakeActive(false);
        onShowToast('Secuencia completada: órbita de inserción alcanzada (T+ 6.0 S).', 'success');
        return;
      }

      launchRafRef.current = requestAnimationFrame(step);
    };

    launchRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      stopLaunchRaf();
    };
  }, [stopLaunchRaf]);

  // Zero-G Physics initialization & loop
  const renderZeroGBodies = useCallback(() => {
    bodiesRef.current.forEach((body) => {
      const el = itemRefs.current[body.id];
      if (el) {
        el.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0)`;
      }
    });
  }, []);

  const stopZeroGLoop = useCallback(() => {
    if (zeroGRafRef.current !== null) {
      cancelAnimationFrame(zeroGRafRef.current);
      zeroGRafRef.current = null;
    }
  }, []);

  const startZeroGLoop = useCallback(() => {
    if (zeroGRafRef.current !== null) return;

    const step = () => {
      const arena = arenaRef.current;
      if (!arena) {
        zeroGRafRef.current = null;
        return;
      }

      const maxX = Math.max(0, arena.clientWidth);
      const maxY = Math.max(0, arena.clientHeight);

      bodiesRef.current.forEach((item) => {
        const el = itemRefs.current[item.id];
        const itemWidth = el ? el.offsetWidth : 120;
        const itemHeight = el ? el.offsetHeight : 80;

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

        if (item.x <= 0) {
          item.x = 0;
          item.vx = Math.abs(item.vx) * ZERO_G_RESTITUTION;
        } else if (item.x + itemWidth >= maxX) {
          item.x = Math.max(0, maxX - itemWidth);
          item.vx = -Math.abs(item.vx) * ZERO_G_RESTITUTION;
        }

        if (item.y <= 0) {
          item.y = 0;
          item.vy = Math.abs(item.vy) * ZERO_G_RESTITUTION;
        } else if (item.y + itemHeight >= maxY) {
          item.y = Math.max(0, maxY - itemHeight);
          item.vy = -Math.abs(item.vy) * ZERO_G_RESTITUTION;
        }
      });

      renderZeroGBodies();
      zeroGRafRef.current = requestAnimationFrame(step);
    };

    zeroGRafRef.current = requestAnimationFrame(step);
  }, [renderZeroGBodies]);

  useEffect(() => {
    if (activeStage !== FlightStage.GravedadCero) {
      stopZeroGLoop();
      return;
    }

    const arena = arenaRef.current;
    if (!arena) return;

    const arenaWidth = arena.clientWidth || 720;
    const arenaHeight = arena.clientHeight || 360;

    if (bodiesRef.current.length === 0) {
      bodiesRef.current = ZERO_G_ITEMS_INITIAL.map((item, index) => {
        const el = itemRefs.current[item.id];
        const itemWidth = el ? el.offsetWidth : 130;
        const itemHeight = el ? el.offsetHeight : 76;
        const positionX = clamp(
          24 + (index % 3) * ((arenaWidth - itemWidth) / 3),
          0,
          Math.max(0, arenaWidth - itemWidth)
        );
        const positionY = clamp(
          28 + Math.floor(index / 3) * 110,
          0,
          Math.max(0, arenaHeight - itemHeight)
        );
        return {
          id: item.id,
          x: positionX,
          y: positionY,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8
        };
      });
    }

    renderZeroGBodies();
    startZeroGLoop();

    const handleResize = () => {
      if (!arenaRef.current) return;
      const maxX = Math.max(0, arenaRef.current.clientWidth);
      const maxY = Math.max(0, arenaRef.current.clientHeight);
      bodiesRef.current.forEach((item) => {
        const el = itemRefs.current[item.id];
        const w = el ? el.offsetWidth : 130;
        const h = el ? el.offsetHeight : 76;
        item.x = clamp(item.x, 0, Math.max(0, maxX - w));
        item.y = clamp(item.y, 0, Math.max(0, maxY - h));
      });
      renderZeroGBodies();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      stopZeroGLoop();
    };
  }, [activeStage, renderZeroGBodies, startZeroGLoop, stopZeroGLoop]);

  const handleImpulseZeroGItem = (id: string) => {
    const target = bodiesRef.current.find((b) => b.id === id);
    if (target) {
      target.vx += (Math.random() * 2 - 1) * 6;
      target.vy += (Math.random() * 2 - 1) * 6 - 2;
      startZeroGLoop();
    }
  };

  // Cupola parallax handlers
  const handleCupolaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const win = cupolaWindowRef.current;
    if (!win) return;
    const rect = win.getBoundingClientRect();
    const ratioX = (e.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (e.clientY - rect.top) / rect.height - 0.5;
    const offsetX = clamp(-ratioX * 2 * CUPOLA_PARALLAX_PX, -CUPOLA_PARALLAX_PX, CUPOLA_PARALLAX_PX);
    const offsetY = clamp(-ratioY * 2 * CUPOLA_PARALLAX_PX, -CUPOLA_PARALLAX_PX, CUPOLA_PARALLAX_PX);
    setSkyOffset({ x: offsetX, y: offsetY });
  };

  const handleCupolaMouseLeave = () => {
    setSkyOffset({ x: 0, y: 0 });
  };

  const handlePoiMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, tooltipText: string) => {
    const btn = e.currentTarget;
    setHoveredPoi({
      text: tooltipText,
      left: btn.offsetLeft + btn.offsetWidth / 2,
      top: btn.offsetTop - 14,
      visible: true
    });
  };

  const handlePoiMouseLeave = () => {
    setHoveredPoi((prev) => ({ ...prev, visible: false }));
  };

  return (
    <section id="vuelo" className="section-vuelo" aria-labelledby="vuelo-title">
      <div className="container">
        <header className="section-head-center">
          <div className="section-kicker">Simulador Sensorial · Protocolo de Travesía</div>
          <h2 id="vuelo-title" className="section-title">
            La Experiencia de Vuelo
          </h2>
          <p className="section-intro section-intro-center">
            Desde la potencia física de la ignición hasta el silencio absoluto de la microgravedad y
            la vista panorámica estelar.
          </p>
        </header>

        <div className="flight-tabs">
          <button
            type="button"
            className={`flight-tab-btn${activeStage === FlightStage.Lanzamiento ? ' active' : ''}`}
            data-stage="lanzamiento"
            onClick={() => setActiveStage(FlightStage.Lanzamiento)}
          >
            1. El Lanzamiento
          </button>
          <button
            type="button"
            className={`flight-tab-btn${activeStage === FlightStage.GravedadCero ? ' active' : ''}`}
            data-stage="gravedad_cero"
            onClick={() => setActiveStage(FlightStage.GravedadCero)}
          >
            2. Gravedad Cero
          </button>
          <button
            type="button"
            className={`flight-tab-btn${activeStage === FlightStage.Ventana ? ' active' : ''}`}
            data-stage="ventana"
            onClick={() => setActiveStage(FlightStage.Ventana)}
          >
            3. El Mirador Estelar
          </button>
        </div>

        {/* Panel 1: Fase de Lanzamiento */}
        <div
          id="stage-lanzamiento"
          className={`flight-stage-panel${
            activeStage === FlightStage.Lanzamiento ? ' active' : ''
          }`}
        >
          <div className={`launch-layout${shakeActive ? ' shake-active' : ''}`}>
            <div>
              <div className="throttle-bar-container">
                <div className="throttle-bar-label">
                  <span>EMPUJE DE PROPULSORES DE PLASMA</span>
                  <span className="throttle-dyn-label">POTENCIA DINÁMICA</span>
                </div>
                <div className="throttle-track">
                  <div
                    id="throttle-fill"
                    className="throttle-fill"
                    style={{ width: throttlePct }}
                  />
                </div>
              </div>

              <div className="launch-gauges">
                <div className="gauge-box">
                  <div className="gauge-title">Velocímetro</div>
                  <div id="gauge-mach" className="gauge-val">
                    {gaugeMach}
                  </div>
                </div>
                <div className="gauge-box">
                  <div className="gauge-title">Altitud</div>
                  <div id="gauge-alt" className="gauge-val gauge-val-cyan">
                    {gaugeAlt}
                  </div>
                </div>
                <div className="gauge-box">
                  <div className="gauge-title">Fuerza G</div>
                  <div id="gauge-g" className="gauge-val gauge-val-gold">
                    {gaugeG}
                  </div>
                </div>
                <div className="gauge-box">
                  <div className="gauge-title">Tiempo T+</div>
                  <div id="gauge-time" className="gauge-val">
                    {gaugeTime}
                  </div>
                </div>
              </div>

              <p className="launch-desc">
                Nuestros asientos presurizados de fibra de carbono absorben la mayor parte de la
                vibración mecánica, garantizando un ascenso seguro y confortable hacia la órbita.
              </p>
            </div>

            <div className="ignition-station">
              <div className="flame-icon">🚀</div>
              <h3 className="ignition-title">Palanca de Propulsión</h3>
              <p className="ignition-hint">
                Pulse para experimentar la aceleración y vibración visual controlada.
              </p>
              <button
                type="button"
                id="btn-ignition-toggle"
                className="btn-ignition"
                onClick={handleToggleIgnition}
              >
                {launchRunning ? 'Abortar Secuencia' : 'Iniciar Secuencia'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Fase de Gravedad Cero */}
        <div
          id="stage-gravedad_cero"
          className={`flight-stage-panel${
            activeStage === FlightStage.GravedadCero ? ' active' : ''
          }`}
        >
          <div className="stage-head-row">
            <h3 className="stage-title">Cámara de Microgravedad (0.0001g)</h3>
            <span className="telemetry-text stage-hint">
              Haz clic sobre los objetos para impulsarlos
            </span>
          </div>

          <div ref={arenaRef} id="zero-g-arena" className="zero-g-arena">
            {ZERO_G_ITEMS_INITIAL.map((item) => (
              <div
                key={item.id}
                id={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                className="zero-g-item"
                onClick={() => handleImpulseZeroGItem(item.id)}
              >
                <span className="zero-g-emoji">{item.emoji}</span>
                <span className="zero-g-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Fase La Ventana (El Mirador) */}
        <div
          id="stage-ventana"
          className={`flight-stage-panel${activeStage === FlightStage.Ventana ? ' active' : ''}`}
        >
          <div className="stage-head-row">
            <h3 className="stage-title">Ventanal Elíptico de Cuarzo de Zafiro</h3>
            <span className="telemetry-text stage-hint">
              Haz clic en un punto de interés para abrir su ficha celeste
            </span>
          </div>

          <div
            ref={cupolaWindowRef}
            id="cupola-window"
            className="cupola-window"
            onMouseMove={handleCupolaMouseMove}
            onMouseLeave={handleCupolaMouseLeave}
          >
            <div
              id="cupola-sky"
              className="cupola-sky"
              style={{
                transform: `translate3d(${skyOffset.x.toFixed(1)}px, ${skyOffset.y.toFixed(1)}px, 0)`
              }}
            >
              <div className="earth-horizon-arc" />

              {POI_ITEMS.map((poi) => (
                <button
                  key={poi.id}
                  type="button"
                  className={`poi-marker ${poi.modifierClass}`}
                  data-poi={poi.tooltip}
                  data-poi-img={poi.img}
                  data-poi-title={poi.title}
                  data-poi-meta={poi.meta}
                  data-poi-story={poi.story}
                  onMouseEnter={(e) => handlePoiMouseEnter(e, poi.tooltip)}
                  onMouseLeave={handlePoiMouseLeave}
                  onClick={() => onOpenPoiModal(poi)}
                >
                  <span>{poi.symbol}</span>
                  <span>{poi.label}</span>
                </button>
              ))}

              <div
                className={`poi-tooltip${hoveredPoi.visible ? ' is-visible' : ''}`}
                aria-hidden="true"
                style={{ left: `${hoveredPoi.left}px`, top: `${hoveredPoi.top}px` }}
              >
                {hoveredPoi.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
