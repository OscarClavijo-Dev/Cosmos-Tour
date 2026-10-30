import React, { useEffect } from 'react';

interface PrivacyPolicyPageProps {
  initialAnchor?: string;
  onBackToLanding: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  initialAnchor,
  onBackToLanding
}) => {
  useEffect(() => {
    document.body.classList.add('legal-page');
    if (initialAnchor) {
      const target = document.getElementById(initialAnchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return () => {
      document.body.classList.remove('legal-page');
    };
  }, [initialAnchor]);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onBackToLanding();
  };

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <header className="legal-top">
        <a
          href="#ct-hero"
          className="brand-wordmark"
          aria-label="Cosmos Tour — volver a la landing"
          onClick={handleBack}
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
        <a href="#ct-hero" className="btn-secondary" onClick={handleBack}>
          Volver a la landing
        </a>
      </header>

      <main className="legal-main">
        <article className="legal-doc">
          <p className="section-kicker">
            Documentación legal · Última actualización: octubre de 2026
          </p>
          <h1>Política de Privacidad, Términos y Cookies</h1>
          <p className="legal-lead">
            Este documento regula el uso del sitio de Cosmos Tour y la trata de los datos
            personales recopilados a través del formulario de registro de tripulación. Al aceptar
            los términos en el manifiesto de vuelo, declaras haber leído esta información completa.
          </p>

          <section aria-labelledby="privacidad">
            <h2 id="privacidad">Política de Privacidad</h2>
            <p>
              El responsable del tratamiento es <strong>Cosmos Tour S.A.</strong>, con despacho en
              Zúrich, Suiza, y operaciones de despegue en Cabo Cañaveral (Estados Unidos) y Guayana
              (Venezuela). Tratamos tus datos conforme a la Ley 1581 de 2012 y el Decreto 1377 de
              2013 (Colombia), y, para clientes europeos y suizos, al RGPD y a la Ley Federal Suiza
              de Protección de Datos.
            </p>

            <h3>Datos que recopilamos</h3>
            <ul>
              <li>
                <strong>Identificación y contacto:</strong> nombre completo, correo electrónico y
                teléfono de emergencia.
              </li>
              <li>
                <strong>Datos de viaje:</strong> número de pasaporte, expedición seleccionada,
                categoría de suite, ventana temporal de despegue y rol en el manifiesto.
              </li>
              <li>
                <strong>Datos técnicos locales:</strong> preferencia de tema (claro/oscuro),
                guardada únicamente en tu navegador mediante almacenamiento local.
              </li>
            </ul>

            <h3>Finalidades del tratamiento</h3>
            <ul>
              <li>
                Gestionar la reserva, emitir el manifiesto de vuelo y la credencial de tripulación.
              </li>
              <li>
                Verificar la elegibilidad documental ante las autoridades aeroespaciales
                competentes.
              </li>
              <li>Enviarte comunicaciones operativas y de seguridad de tu expedición.</li>
              <li>Cumplir obligaciones contables y de protección al viajero.</li>
            </ul>

            <h3>Derechos del titular</h3>
            <p>
              Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión,
              actualización y revocación escribiendo a{' '}
              <a href="mailto:tripulacion@cosmostour.space">tripulacion@cosmostour.space</a>,
              indicando tu nombre y el código de misión. Responderemos en un plazo máximo de 15
              días hábiles. Si resides en Colombia, también puedes presentar una consulta ante la
              Superintendencia de Industria y Comercio (SIC).
            </p>
          </section>

          <section aria-labelledby="terminos">
            <h2 id="terminos">Términos y Condiciones de Vuelo</h2>
            <ul>
              <li>
                <strong>Capacidad:</strong> las reservas son para personas mayores de 18 años con
                pasaporte vigente apto para viaje internacional.
              </li>
              <li>
                <strong>Exactitud de datos:</strong> el titular responde por la veracidad del
                pasaporte y de la información entregada en el manifiesto; datos incorrectos pueden
                causar la denegación del embarque.
              </li>
              <li>
                <strong>Cupos y temporada:</strong> cada expedición tiene cupos limitados por
                ventana de despegue; la plaza queda confirmada únicamente contra abono conforme al
                cronograma de pagos.
              </li>
              <li>
                <strong>Cancelaciones y reprogramación:</strong> por condiciones meteorológicas o
                decisión de la autoridad aeroespacial, el vuelo se reprograma sin costo adicional;
                por causas imprimibles al cliente aplica una política de reembolso escalonada según
                los días previos al despegue.
              </li>
              <li>
                <strong>Limitación de responsabilidad:</strong> las operaciones están sujetas a la
                certificación vigente de la autoridad correspondiente (FAA Commercial Spaceflight u
                homóloga) y a las condiciones del contrato de transporte que se firma antes del
                embarque.
              </li>
              <li>
                <strong>Propiedad intelectual:</strong> la marca Cosmos Tour, el diseño del sitio y
                sus contenidos son propiedad de Cosmos Tour S.A. Las fotografías astronómicas
                provienen de la NASA y se usan con crédito de la agencia.
              </li>
            </ul>
          </section>

          <section aria-labelledby="cookies">
            <h2 id="cookies">Política de Cookies</h2>
            <p>
              Este sitio no instala cookies publicitarias ni de terceros con fines de perfilado.
              Utiliza exclusivamente almacenamiento local (localStorage) para:
            </p>
            <ul>
              <li>
                <strong>Preferencia de tema:</strong> recuerda si activaste el modo claro u oscuro
                (clave <span className="mono-text">cosmos-tour-theme</span>).
              </li>
              <li>
                <strong>Estado de interacción:</strong> permite que contadores y animaciones de
                sección no se repitan durante tu visita.
              </li>
            </ul>
            <p>
              Puedes eliminar esta información en cualquier momento desde la configuración de
              privacidad de tu navegador; el sitio seguirá funcionando con los valores por defecto.
            </p>
          </section>

          <section aria-labelledby="seguro">
            <h2 id="seguro">Seguro Interplanetario Lloyd&apos;s</h2>
            <p>
              Todas las expediciones incluyen una póliza colectiva suscrita con Lloyd&apos;s de
              Londres que cubre cancelación por motivos meteorológicos, reprogramación de la
              ventana de despegue y asistencia en la fase de recuperación posvuelo. Los montos
              máximos de cobertura y exclusiones se detallan en el contrato de transporte que se
              entrega al confirmar la reserva.
            </p>
          </section>
        </article>
      </main>

      <footer className="legal-footer">
        <span>© 2026 Cosmos Tour S.A. — Todos los derechos reservados.</span>
        <a href="#ct-hero" onClick={handleBack}>
          Volver a la página principal
        </a>
      </footer>
    </div>
  );
};
