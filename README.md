# aqui iran los prompts ejecutados


## Lesly 
Promt 1 
"Actúa como un desarrollador Frontend Web Senior. Genera el código para el archivo index.html de una landing page inmersiva de turismo espacial llamada Cosmos Tour. Contexto y requerimientos del proyecto:

[Contexto del Proyecto: Cosmos Tour... La página se comporta como una película interactiva... A. Sección de Bienvenida (El Despegue), B. Catálogo de Destinos (La Exploración), C. Simulación de la Experiencia de Vuelo (El Viaje), D. Paquetes de Lujo y Servicios a Bordo, E. Reserva y Contacto (La Tripulación)]"

Promt 2 
"Ajusta el código para que sea HTML5 semántico nativo estático (Vanilla HTML) sin usar React, JSX, TypeScript ni Vite. Necesito el contenido estructurado completo dentro del <body> del archivo index.html (sin <div id="root">), listo para enlazar directamente con styles.css y script.js nativo."

## Sofia

 prompt: Genera el archivo styles.css completo para la página 'Cosmos Tour'. Utiliza una paleta de colores de espacio profundo (#030712, neón cian #06b6d4, azul #3b82f6 y oro #f59e0b). Incluye tipografía 'Space Grotesk' o sans-serif, estructura de layout mediante CSS Grid y Flexbox, estilizado para navegación, hero, tarjetas y formulario. Implementa diseño responsive con breakpoints específicos para móvil (320px), tablet (768px) y desktop (1280px)."


Características Implementadas:
Paleta de Colores de Espacio Profundo:
Fondo de lienzo principal: #030712 (con degradados radiales sutiles para ambientación cósmica).
Superficies estructurales: #0b1120 y #0f172a.
Acentos de alta luminiscencia: Neón Cian (#06b6d4), Azul Espacial (#3b82f6) y Oro / Ámbar Estelar (#f59e0b).
Estados de estado y telemetría: Esmeralda (#10b981) para ● NOMINAL y Rosa/Rojo (#f43f5e) para alertas.

Tipografía:
Fuente principal: Space Grotesk, sans-serif (importada y enlazada con pesos 400, 500, 600 y 700).
Fuente técnica de telemetría y datos numéricos: IBM Plex Mono con alineación tabular (font-variant-numeric: tabular-nums).
Estructura de Layout con CSS Grid y Flexbox:
Navegación (.site-header): Flexbox con barra fija traslúcida (backdrop-filter: blur(14px)), logotipo con indicador estelar y acciones de audio/reserva.
Hero (.hero-section): Layout CSS Grid asimétrico (5:7) que coordina el titular de impacto con el escenario 16:9 del ascenso del crucero Valkyrie IV y cuadrícula de estadísticas de seguridad.
Catálogo de Destinos (.destinations-section): Flexbox para la barra de filtros por región y CSS Grid (1 a 2 columnas) para las tarjetas de destino y el expediente interactivo día por día.
Simulador de Vuelo (.simulation-section): Consola técnica dividida (5:7 en escritorio) con barra de telemetría superior, panel de mandos con regulador de gravedad y lienzo de partículas/gráfica de altitud.
Hospitalidad y Suites (.hospitality-section): Grid de 3 columnas para los paquetes de lujo, tarjeta insignia resaltada en cian y bento grid (7:5) para el visor de iluminación circadiana y degustación molecular.
Formulario y Tripulación (.booking-section): Roster de oficiales de vuelo en 3 columnas, formulario de reserva con inputs estilizados (:focus con halo cian) y calculadora de inversión y fianza en tiempo real.
Breakpoints Responsive Específicos:
Móvil (min-width: 320px base): Disposición vertical fluida a 1 sola columna, controles táctiles ergonómicos (
), menús desplazables horizontalmente y navegación optimizada para pulgares.
Tablet (min-width: 768px): Despliegue del menú de navegación completo, cuadrículas a 2 columnas en destinos y testimonios, y alineación horizontal en barras de control y pie de página.
Desktop (min-width: 1280px): Expansión del contenedor a 1320px, disposición asimétrica de pantalla ancha (5:7 en hero y consola de simulación, 7:5 en hospitalidad y formulario de reserva), y cuadrícula de 4 columnas en telemetría y cronogramas.