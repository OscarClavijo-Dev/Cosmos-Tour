import React, { useEffect, useRef, useState } from 'react';
import { ThemeMode } from '../types';
import { clamp } from '../utils/storage';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  isConverted: boolean;
}

const NAV_ITEMS = [
  { id: 'ct-hero', label: 'El Despegue' },
  { id: 'destinos', label: 'Destinos' },
  { id: 'vuelo', label: 'Experiencia de Vuelo' },
  { id: 'beneficios', label: 'Suites & Lujo' },
  { id: 'registro', label: 'Tripulación' }
];

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeSection,
  onNavigateSection,
  isConverted
}) => {
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerSticky, setHeaderSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const syncNavOffset = () => {
      const header = headerRef.current;
      if (!header) return;
      const headerStyle = getComputedStyle(header);
      const rootStyle = getComputedStyle(document.documentElement);
      const rootFontSize = parseFloat(rootStyle.fontSize) || 16;
      const padValue = (rootStyle.getPropertyValue('--nav-pad-y') || '1.1rem').trim();
      const padNumber = parseFloat(padValue);
      if (!padNumber) return;
      const maxPadPx = padValue.indexOf('rem') !== -1 ? padNumber * rootFontSize : padNumber;
      const currentPadY =
        (parseFloat(headerStyle.paddingTop) || 0) + (parseFloat(headerStyle.paddingBottom) || 0);
      const contentHeight = header.getBoundingClientRect().height - currentPadY;
      if (contentHeight > 0) {
        document.documentElement.style.setProperty(
          '--nav-h',
          `${Math.ceil(contentHeight + maxPadPx * 2)}px`
        );
      }
    };

    const handleScroll = () => {
      setHeaderSticky(window.scrollY > 80);
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setScrollProgress(clamp(percentage, 0, 100));
    };

    syncNavOffset();
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncNavOffset);

    let observer: ResizeObserver | null = null;
    if ('ResizeObserver' in window && headerRef.current) {
      observer = new ResizeObserver(syncNavOffset);
      observer.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncNavOffset);
      if (observer) observer.disconnect();
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigateSection(sectionId);
  };

  return (
    <header ref={headerRef} className={`top-nav${headerSticky ? ' header-sticky' : ''}`}>
      <div className="nav-container">
        <a
          href="#ct-hero"
          className="brand-wordmark"
          aria-label="Cosmos Tour — ir al inicio"
          onClick={(e) => handleLinkClick(e, 'ct-hero')}
        >
          <span className="brand-emblem" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="34" height="34" focusable="false">
              <ellipse
                className="emblem-orbit"
                cx="24"
                cy="24"
                rx="19.5"
                ry="9.5"
                transform="rotate(-28 24 24)"
              />
              <circle className="emblem-core" cx="24" cy="24" r="7.5" />
              <circle className="emblem-sat" cx="41.2" cy="14.9" r="3" />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">
              <span className="brand-name-lead">Cosmos</span>
              <span className="brand-name-tail">Tour</span>
            </span>
            <span className="brand-tag">Turismo orbital</span>
          </span>
        </a>

        <nav>
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => {
              const isRegistro = item.id === 'registro';
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`nav-link${activeSection === item.id ? ' active' : ''}${
                      isRegistro && isConverted ? ' hidden' : ''
                    }`}
                    onClick={(e) => handleLinkClick(e, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            id="theme-toggle"
            className="btn-icon theme-toggle"
            aria-label={
              theme === ThemeMode.Dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
            }
            aria-pressed={theme === ThemeMode.Light}
            onClick={onToggleTheme}
          >
            <span className="theme-icon" aria-hidden="true">
              {theme === ThemeMode.Dark ? '🌙' : '☀️'}
            </span>
            <span className="theme-label">
              {theme === ThemeMode.Dark ? 'MODO OSCURO' : 'MODO CLARO'}
            </span>
          </button>
          <a
            href="#registro"
            className={`btn-primary${isConverted ? ' hidden' : ''}`}
            onClick={(e) => handleLinkClick(e, 'registro')}
          >
            Reservar Misión
          </a>
        </div>
      </div>
      <div
        id="scroll-progress"
        className="scroll-progress"
        aria-hidden="true"
        style={{ width: `${scrollProgress.toFixed(2)}%` }}
      />
    </header>
  );
};
