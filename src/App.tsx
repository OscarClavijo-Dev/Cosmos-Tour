import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AmenitiesSection } from './components/AmenitiesSection';
import { CountdownSection } from './components/CountdownSection';
import { DestinationsSection } from './components/DestinationsSection';
import { DossierModal } from './components/DossierModal';
import { FlightSimulationSection } from './components/FlightSimulationSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { PlanetModal } from './components/PlanetModal';
import { PoiModal } from './components/PoiModal';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { RegistrationSection } from './components/RegistrationSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ToastContainer } from './components/ToastContainer';
import {
  DestinationKey,
  PlanetKey,
  PoiItem,
  ThemeMode,
  ToastItem,
  VisorOrbitalState
} from './types';
import {
  THEME_STORAGE_KEY,
  VISOR_SESSION_KEY,
  formatDate,
  parsearJSONSeguro,
  readSession,
  readStorage,
  writeSession,
  writeStorage
} from './utils/storage';

const VISOR_VALORES_BASE = { altitud: 420.5, velocidad: 7.66, periodo: 92.68 };
const RADIO_TERRESTRE_KM = 6371;

function derivarMetricasVisor(altitud: number): { velocidad: number; periodo: number } {
  const radioBase = RADIO_TERRESTRE_KM + VISOR_VALORES_BASE.altitud;
  const radioActual = RADIO_TERRESTRE_KM + Math.max(altitud, 1);
  const velocidad = VISOR_VALORES_BASE.velocidad * Math.sqrt(radioBase / radioActual);
  const periodo = VISOR_VALORES_BASE.periodo * Math.pow(radioActual / radioBase, 1.5);
  return {
    velocidad: Number(velocidad.toFixed(2)),
    periodo: Number(periodo.toFixed(2))
  };
}

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = readStorage(THEME_STORAGE_KEY);
    return stored === 'light' ? ThemeMode.Light : ThemeMode.Dark;
  });

  const [activeSection, setActiveSection] = useState<string>('ct-hero');
  const [isConverted, setIsConverted] = useState<boolean>(false);
  const [preselectedDestination, setPreselectedDestination] = useState<string | null>(null);
  const [activeDossier, setActiveDossier] = useState<DestinationKey | null>(null);
  const [activePlanetModal, setActivePlanetModal] = useState<PlanetKey | null>(null);
  const [activePoiModal, setActivePoiModal] = useState<PoiItem | null>(null);
  const [legalView, setLegalView] = useState<{ open: boolean; anchor?: string }>({ open: false });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [visorState, setVisorState] = useState<VisorOrbitalState>(() => {
    const raw = readSession(VISOR_SESSION_KEY);
    const parsed = parsearJSONSeguro<VisorOrbitalState>(raw);
    if (
      parsed &&
      typeof parsed.altitud === 'number' &&
      Number.isFinite(parsed.altitud) &&
      typeof parsed.velocidad === 'number' &&
      Number.isFinite(parsed.velocidad) &&
      typeof parsed.periodo === 'number' &&
      Number.isFinite(parsed.periodo) &&
      typeof parsed.destinoActivo === 'string'
    ) {
      return parsed;
    }
    return {
      altitud: VISOR_VALORES_BASE.altitud,
      velocidad: VISOR_VALORES_BASE.velocidad,
      periodo: VISOR_VALORES_BASE.periodo,
      destinoActivo: 'earth',
      timestamp: formatDate(new Date())
    };
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, visible: false }]);

      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, visible: true } : item))
        );
      });

      window.setTimeout(() => {
        setToasts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, visible: false } : item))
        );
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((item) => item.id !== id));
        }, 350);
      }, 4200);
    },
    []
  );

  // Sync theme to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync active planet to body and canvas
  useEffect(() => {
    document.body.dataset.planet = visorState.destinoActivo;
    if (canvasRef.current) {
      canvasRef.current.dataset.planet = visorState.destinoActivo;
    }
  }, [visorState.destinoActivo]);

  const handleToggleTheme = () => {
    const nextTheme = theme === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
    setTheme(nextTheme);
    const saved = writeStorage(THEME_STORAGE_KEY, nextTheme);
    if (!saved) {
      showToast('El tema cambió, pero no se pudo guardar tu preferencia.', 'error');
    }
  };

  const scrollToSectionById = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return false;
    const header = document.querySelector('.top-nav') as HTMLElement | null;
    const headerOffset = header ? header.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 10;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    return true;
  }, []);

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      if (legalView.open) {
        setLegalView({ open: false });
        window.setTimeout(() => {
          scrollToSectionById(sectionId);
        }, 60);
      } else {
        scrollToSectionById(sectionId);
      }
    },
    [legalView.open, scrollToSectionById]
  );

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (legalView.open || typeof IntersectionObserver === 'undefined') return;

    const sections = Array.from(document.querySelectorAll('main section[id]'));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [legalView.open]);

  // Orbital canvas wheel zoom & pointer drag persistence
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      setVisorState((prev) => {
        const altitudNueva = Number(
          Math.min(Math.max(prev.altitud - e.deltaY * 0.5, 160), 2000).toFixed(1)
        );
        const derivadas = derivarMetricasVisor(altitudNueva);
        const nextState: VisorOrbitalState = {
          altitud: altitudNueva,
          velocidad: derivadas.velocidad,
          periodo: derivadas.periodo,
          destinoActivo: prev.destinoActivo,
          timestamp: formatDate(new Date())
        };
        writeSession(VISOR_SESSION_KEY, JSON.stringify(nextState));
        return nextState;
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleSelectPlanet = (_planetKey: PlanetKey, targetKey: string, label: string) => {
    setVisorState((prev) => {
      const nextState: VisorOrbitalState = {
        ...prev,
        destinoActivo: targetKey,
        timestamp: formatDate(new Date())
      };
      writeSession(VISOR_SESSION_KEY, JSON.stringify(nextState));
      return nextState;
    });
    showToast(`Cuerpo celeste sincronizado en el HUD: ${label}.`, 'info');
  };

  const handleBookDestination = (destOptionValue: string) => {
    setPreselectedDestination(destOptionValue);
    handleNavigateSection('registro');
  };

  return (
    <>
      <a
        className="skip-link"
        href="#ct-hero"
        onClick={(e) => {
          e.preventDefault();
          handleNavigateSection('ct-hero');
        }}
      >
        Saltar al contenido principal
      </a>

      <canvas ref={canvasRef} id="universe-canvas" aria-hidden="true" />

      {legalView.open ? (
        <PrivacyPolicyPage
          initialAnchor={legalView.anchor}
          onBackToLanding={() => setLegalView({ open: false })}
        />
      ) : (
        <>
          <Navbar
            theme={theme}
            onToggleTheme={handleToggleTheme}
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
            isConverted={isConverted}
          />

          <main className="main-wrapper">
            <HeroSection
              onNavigateSection={handleNavigateSection}
              isConverted={isConverted}
              visorState={visorState}
              onSelectPlanet={handleSelectPlanet}
              onOpenPlanetModal={(pk) => setActivePlanetModal(pk)}
            />

            <DestinationsSection
              onOpenDossier={(dk) => setActiveDossier(dk)}
              onBookDestination={handleBookDestination}
            />

            <FlightSimulationSection
              onShowToast={showToast}
              onOpenPoiModal={(poi) => setActivePoiModal(poi)}
            />

            <AmenitiesSection />

            <TestimonialsSection />

            <CountdownSection
              onNavigateSection={handleNavigateSection}
              isConverted={isConverted}
            />

            <RegistrationSection
              preselectedDestination={preselectedDestination}
              onClearPreselectedDestination={() => setPreselectedDestination(null)}
              isConverted={isConverted}
              onConversionChange={setIsConverted}
              onShowToast={showToast}
              onNavigateSection={handleNavigateSection}
            />
          </main>

          <DossierModal
            destinationKey={activeDossier}
            onClose={() => setActiveDossier(null)}
            onSelectDestination={handleBookDestination}
          />

          <PlanetModal
            planetKey={activePlanetModal}
            onClose={() => setActivePlanetModal(null)}
            onNavigateSection={handleNavigateSection}
          />

          <PoiModal poi={activePoiModal} onClose={() => setActivePoiModal(null)} />

          <Footer
            onNavigateSection={handleNavigateSection}
            onOpenPrivacyPolicy={(anchor) => setLegalView({ open: true, anchor })}
            isConverted={isConverted}
          />
        </>
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}
export default App;
