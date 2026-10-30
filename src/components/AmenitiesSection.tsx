import React, { useEffect, useRef, useState } from 'react';
import { AMENITIES_LIST, COMPARISON_ROWS } from '../data/catalog';
import { AmenityCategory } from '../types';

const FILTER_OPTIONS: { key: AmenityCategory; label: string }[] = [
  { key: AmenityCategory.All, label: 'Todo' },
  { key: AmenityCategory.Suites, label: 'Suites' },
  { key: AmenityCategory.Gastronomia, label: 'Gastronomía' },
  { key: AmenityCategory.Observatorio, label: 'Mirador' },
  { key: AmenityCategory.Academia, label: 'Academia' }
];

export const AmenitiesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [animated, setAnimated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AmenityCategory>(AmenityCategory.All);
  const [openDrawers, setOpenDrawers] = useState<Record<string, boolean>>({});
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);

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

  const toggleDrawer = (drawerId: string) => {
    setOpenDrawers((prev) => ({
      ...prev,
      [drawerId]: !prev[drawerId]
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="beneficios"
      className={`section-servicios animate-on-scroll${animated ? ' animated' : ''}`}
      aria-labelledby="beneficios-title"
    >
      <div className="container">
        <header className="section-header">
          <div>
            <div className="section-kicker">Hospitalidad Sin Fronteras Gravitacionales</div>
            <h2 id="beneficios-title" className="section-title">
              Paquetes de Lujo & Vida a Bordo
            </h2>
          </div>

          <div className="amenity-filters">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`amenity-filter-btn${activeFilter === opt.key ? ' active' : ''}`}
                data-filter={opt.key}
                onClick={() => setActiveFilter(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        <div className="amenities-grid">
          {AMENITIES_LIST.map((amenity, index) => {
            const matches =
              activeFilter === AmenityCategory.All || amenity.category === activeFilter;
            const isOpen = Boolean(openDrawers[amenity.id]);

            if (!matches) {
              return null;
            }

            return (
              <article
                key={amenity.id}
                className="amenity-card"
                data-category={amenity.category}
              >
                <div className="amenity-img-wrapper">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={`${amenity.webp640} 640w, ${amenity.webpLarge} ${amenity.webpLargeWidth}`}
                      sizes="(max-width: 767px) 92vw, 580px"
                    />
                    <img
                      src={amenity.jpg}
                      alt={amenity.alt}
                      className="amenity-img"
                      width={800}
                      height={450}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div className="amenity-scrim" />
                  <div className="amenity-badge-row">
                    <span>{amenity.badgeLeft}</span>
                    <span className="amenity-badge-gold">{amenity.badgeRight}</span>
                  </div>
                </div>

                <div className="amenity-body">
                  <div>
                    <h3 className="amenity-title">{amenity.title}</h3>
                    <div className="amenity-subtitle">{amenity.subtitle}</div>
                    <p className="amenity-desc">{amenity.desc}</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      id={`amenity-accordion-btn-${index}`}
                      className="amenity-accordion-btn"
                      data-target-drawer={amenity.id}
                      aria-expanded={isOpen}
                      aria-controls={amenity.id}
                      onClick={() => toggleDrawer(amenity.id)}
                    >
                      <span>Ver Especificaciones Técnicas</span>
                      <span>{isOpen ? '↥' : '↕'}</span>
                    </button>
                    <div
                      id={amenity.id}
                      className="amenity-specs-drawer"
                      style={{ maxHeight: isOpen ? '320px' : '0px' }}
                    >
                      <div className="specs-grid">
                        {amenity.specs.map((spec) => (
                          <div key={spec.name} className="spec-cell">
                            <span className="spec-name">{spec.name}</span>
                            <span className="spec-val">{spec.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Tabla Comparativa de Paquetes */}
        <div className="comparison-container">
          <h3 className="comparison-title">Matriz Comparativa de Paquetes de Viaje</h3>
          <div className="comparison-scroll">
            <table
              className="comparison-table"
              onMouseLeave={() => setHoveredColIndex(null)}
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    className={hoveredColIndex === 0 ? 'col-hot' : ''}
                    onMouseEnter={() => setHoveredColIndex(0)}
                  >
                    Beneficio / Servicio
                  </th>
                  <th
                    scope="col"
                    className={`th-apex${hoveredColIndex === 1 ? ' col-hot' : ''}`}
                    onMouseEnter={() => setHoveredColIndex(1)}
                  >
                    Órbita Apex (EEI)
                  </th>
                  <th
                    scope="col"
                    className={`th-artemis${hoveredColIndex === 2 ? ' col-hot' : ''}`}
                    onMouseEnter={() => setHoveredColIndex(2)}
                  >
                    Odisea Artemisa (Luna)
                  </th>
                  <th
                    scope="col"
                    className={`th-sovereign${hoveredColIndex === 3 ? ' col-hot' : ''}`}
                    onMouseEnter={() => setHoveredColIndex(3)}
                  >
                    Sovereign (Marte)
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td
                      className={hoveredColIndex === 0 ? 'col-hot' : ''}
                      onMouseEnter={() => setHoveredColIndex(0)}
                    >
                      {row.feature}
                    </td>
                    <td
                      className={hoveredColIndex === 1 ? 'col-hot' : ''}
                      onMouseEnter={() => setHoveredColIndex(1)}
                    >
                      {row.apex}
                    </td>
                    <td
                      className={`comparison-hl${hoveredColIndex === 2 ? ' col-hot' : ''}`}
                      onMouseEnter={() => setHoveredColIndex(2)}
                    >
                      {row.artemis}
                    </td>
                    <td
                      className={hoveredColIndex === 3 ? 'col-hot' : ''}
                      onMouseEnter={() => setHoveredColIndex(3)}
                    >
                      {row.sovereign}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="comparison-footnote">
            * Todos los paquetes incluyen seguro interplanetario Lloyd&apos;s, traje a medida y
            enlace cuántico 24/7 con la Tierra.
          </p>
        </div>
      </div>
    </section>
  );
};
