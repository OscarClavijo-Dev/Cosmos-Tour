import React, { useEffect, useRef, useState } from 'react';
import { TESTIMONIALS_LIST } from '../data/catalog';

export const TestimonialsSection: React.FC = () => {
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
      id="testimonios"
      className={`section-testimonios animate-on-scroll${animated ? ' animated' : ''}`}
      aria-labelledby="testimonios-title"
    >
      <div className="container">
        <header className="section-header">
          <div>
            <div className="section-kicker">
              Bitácora de Tripulantes Civiles · Prueba Social Verificada
            </div>
            <h2 id="testimonios-title" className="section-title">
              Testimonios de Nuestros Exploradores
            </h2>
          </div>
          <p className="section-intro">
            Pasajeros que ya completaron una expedición privada describen, en sus propias palabras,
            la travesía más extraordinaria de sus vidas.
          </p>
        </header>

        <div className="testimonials-grid">
          {TESTIMONIALS_LIST.map((t) => (
            <article key={t.id} className="testimonial-card">
              <blockquote className="testimonial-quote">{t.quote}</blockquote>
              <footer className="testimonial-footer">
                <span className="author-name">{t.authorName}</span>
                <span className="author-role">{t.authorRole}</span>
                <span className="mission-tag">{t.missionTag}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
