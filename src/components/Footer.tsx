import React from 'react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenPrivacyPolicy: (anchorId?: string) => void;
  isConverted: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenPrivacyPolicy,
  isConverted
}) => {
  const handleSectionLink = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigateSection(sectionId);
  };

  const handleLegalLink = (e: React.MouseEvent<HTMLAnchorElement>, anchorId?: string) => {
    e.preventDefault();
    onOpenPrivacyPolicy(anchorId);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cta">
          <div className="footer-cta-copy">
            <h2 className="footer-cta-title">Tu asiento en la órbita te espera</h2>
            <p className="footer-cta-text">
              Cupos limitados por temporada. Reserva una consultoría privada con nuestro equipo de
              vuelo y diseña tu expedición a medida.
            </p>
          </div>
          <a
            href="#registro"
            className={`btn-primary btn-cta-lg${isConverted ? ' hidden' : ''}`}
            onClick={(e) => handleSectionLink(e, 'registro')}
          >
            Reservar Misión
          </a>
        </div>

        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <span className="brand-wordmark footer-brand-mark">COSMOS TOUR</span>
            <p className="footer-about">
              Agencia pionera de turismo espacial de alto lujo. Convertimos la exploración cósmica
              en una obra de arte viviente.
            </p>
            <nav className="footer-socials" aria-label="Redes sociales de Cosmos Tour">
              <a
                href="#ct-hero"
                aria-label="X (Twitter)"
                className="footer-social-link"
                onClick={(e) => handleSectionLink(e, 'ct-hero')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M4 4l16 16M20 4L4 20"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <a
                href="#ct-hero"
                aria-label="Instagram"
                className="footer-social-link"
                onClick={(e) => handleSectionLink(e, 'ct-hero')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#ct-hero"
                aria-label="YouTube"
                className="footer-social-link"
                onClick={(e) => handleSectionLink(e, 'ct-hero')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#ct-hero"
                aria-label="LinkedIn"
                className="footer-social-link"
                onClick={(e) => handleSectionLink(e, 'ct-hero')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 10.5V17M7 7.6v.01M11 17v-4a2.5 2.5 0 015 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            </nav>
            <ul className="footer-badges">
              <li>Miembro de la Asociación de Turismo Espacial</li>
              <li>Certificación ISO 9001:2015</li>
              <li>Pago seguro con cifrado AES-256</li>
            </ul>
          </div>

          <nav className="footer-col" aria-label="Legal">
            <div className="section-kicker footer-kicker">Legal y Términos</div>
            <ul className="footer-links">
              <li>
                <a
                  href="#privacidad"
                  onClick={(e) => handleLegalLink(e, 'privacidad')}
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#terminos"
                  onClick={(e) => handleLegalLink(e, 'terminos')}
                >
                  Términos y Condiciones de Vuelo
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  onClick={(e) => handleLegalLink(e, 'cookies')}
                >
                  Política de Cookies
                </a>
              </li>
              <li>
                <a
                  href="#seguro"
                  onClick={(e) => handleLegalLink(e, 'seguro')}
                >
                  Seguro Interplanetario Lloyd&apos;s
                </a>
              </li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Expediciones">
            <div className="section-kicker footer-kicker">Expediciones Activas</div>
            <ul className="footer-links">
              <li>
                <a href="#destinos" onClick={(e) => handleSectionLink(e, 'destinos')}>
                  Órbita Baja Terrestre (EEI)
                </a>
              </li>
              <li>
                <a href="#destinos" onClick={(e) => handleSectionLink(e, 'destinos')}>
                  Expedición Cis-Lunar (La Luna)
                </a>
              </li>
              <li>
                <a href="#destinos" onClick={(e) => handleSectionLink(e, 'destinos')}>
                  Odisea Valles Marineris (Marte)
                </a>
              </li>
              <li>
                <a href="#vuelo" onClick={(e) => handleSectionLink(e, 'vuelo')}>
                  Simulador de Gravedad Cero
                </a>
              </li>
              <li>
                <a href="#testimonios" onClick={(e) => handleSectionLink(e, 'testimonios')}>
                  Bitácora de Tripulantes
                </a>
              </li>
            </ul>
          </nav>

          <div className="footer-col">
            <div className="section-kicker footer-kicker">Contacto 24/7</div>
            <ul className="footer-links">
              <li>
                <a href="mailto:tripulacion@cosmostour.space">tripulacion@cosmostour.space</a>
              </li>
              <li>
                <a href="tel:+41445550126">+41 44 555 0126</a>
              </li>
              <li>
                <span>Despacho: Zúrich, Suiza</span>
              </li>
              <li>
                <span>Despegues: Cabo Cañaveral / Guayana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-project">Cosmos Tour</div>
          <div className="footer-legal-row">
            <a href="#privacidad" onClick={(e) => handleLegalLink(e)}>
              Política de Privacidad
            </a>
            <span aria-hidden="true">·</span>
            <span className="footer-year">© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
