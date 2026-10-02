# Contexto Cosmos-Tour

Agencia de Turismo Espacial de Lujo y Experiencias Inmersivas

1. Visión General y Propósito
Cosmos Tour no es una página web tradicional; es una experiencia digital inmersiva diseñada para comercializar viajes espaciales de alto lujo. El objetivo principal es transportar al usuario al espacio desde el primer segundo en que ingresa al sitio. La página debe evocar asombro, exclusividad y vanguardia, convenciendo al visitante de que la agencia ofrece la experiencia definitiva de exploración cósmica.
La narrativa del sitio se construye a medida que el usuario avanza, transformando la lectura de información en un viaje interactivo a través del sistema solar.
2. Experiencia de Usuario (UX) y Narrativa Interactiva
La página se comporta como una película interactiva. El usuario no hace clic en enlaces tradicionales; en su lugar, "navega" a través del espacio. Las transiciones entre secciones son fluidas, cinematográficas y responden a las acciones del usuario (como el desplazamiento o el movimiento del cursor).
3. Desglose de Secciones y Dinámicas Interactivas
A. Sección de Bienvenida (El Despegue)
Concepto: El usuario ingresa a un entorno espacial profundo. En el centro de la pantalla flota un planeta (la Tierra o Marte) en alta definición.
Interacción: El usuario puede interactuar con el planeta, rotándolo y acercándolo con el cursor para explorar su superficie.

Dinámica: Al comenzar a desplazarse hacia abajo, el planeta se aleja suavemente, dando la sensación de que la nave espacial del usuario está despegando y adentrándose en el cosmos.

B. Catálogo de Destinos (La Exploración)

Concepto: Presentación de los destinos disponibles: La Luna, Marte y la Estación Espacial Internacional.
Interacción: Cada destino se presenta como un modelo tridimensional flotante. Al pasar el cursor sobre ellos, los elementos reaccionan (se iluminan, rotan o expanden).
Simulación: Al hacer clic en un destino, la pantalla realiza una transición inmersiva (como un "salto hiperespacial" o un acercamiento rápido) para mostrar detalles específicos de ese lugar: gravedad, clima, duración del viaje y vistas panorámicas.

C. Simulación de la Experiencia de Vuelo (El Viaje)

Concepto: Una sección dedicada a mostrar qué se siente viajar con Cosmos Tour.

Interacción y Animaciones:

Fase de Lanzamiento: Vibración visual sutil y aceleración de elementos en la pantalla.
Gravedad Cero: Los elementos de la interfaz (texto, iconos, imágenes) comienzan a flotar y moverse lentamente, simulando la ingravidez.
La Ventana: Se muestra una vista desde la "ventana de la nave", donde el usuario puede interactuar con el paisaje estelar que pasa a su lado.

D. Paquetes de Lujo y Servicios a Bordo

Concepto: Detalle de las comodidades de la nave (suites presurizadas, gastronomía espacial de alta cocina, observatorios privados).
Dinámica: Presentación mediante tarjetas elegantes que aparecen con animaciones suaves y sincronizadas. Al interactuar con cada servicio, se despliega información detallada con un diseño minimalista y sofisticado.

E. Reserva y Contacto (La Tripulación)

Concepto: El cierre de la venta. Debe transmitir seguridad, exclusividad y facilidad.
Interacción: Un formulario de reserva que no parece un formulario tradicional, sino una "hoja de registro de tripulación" futurista. Los campos se validan en tiempo real con retroalimentación visual elegante (ej. un escaneo biométrico simulado al completar los datos).

4. Estética y Atmósfera General

Ambiente: Oscuro, profundo y elegante. Se utiliza el espacio como lienzo principal.
Iluminación: Uso de luces de neón sutiles, brillos estelares y reflejos metálicos para resaltar los elementos importantes.
Movimiento: Todo en la página debe tener una sensación de fluidez y física realista. Nada se detiene de golpe; los elementos tienen inercia, desaceleración y movimiento orgánico.

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

## Oscar 
# Correciones HTML

# [R] ROL
Actúa como un Senior Frontend Developer especializado en HTML5 semántico y accesibilidad web, con amplia experiencia en desarrollo de landing pages comerciales y cumplimiento de estándares WCAG. Tu tono debe ser técnico, preciso y directo.

# [C] CONTEXTO
- El objetivo principal de este proyecto es: Corregir y optimizar el código HTML de la landing page "Cosmos Tour" (agencia de turismo espacial de lujo) para que cumpla estrictamente con los requisitos académicos obligatorios de una electiva universitaria.
- El público objetivo o audiencia es: Estudiantes de ingeniería de sistemas y profesor evaluador que revisará el cumplimiento de especificaciones técnicas.
- Los antecedentes o situación actual son: El HTML actual tiene una estructura avanzada con Three.js y animaciones, pero NO cumple con 2 requisitos obligatorios: (1) Falta completamente la sección de testimonios/prueba social, (2) El formulario no incluye el checkbox de términos y condiciones.
- Restricciones o limitaciones: NO modificar el diseño visual existente, NO cambiar las clases CSS personalizadas, mantener la estética de lujo y aeroespacial, conservar todos los IDs existentes excepto donde sea estrictamente necesario para cumplir requisitos.

# [I] INSTRUCCIÓN
Necesito que realices las siguientes correcciones paso a paso:

1. INSERTAR una nueva sección de testimonios ANTES de la sección "tripulacion" (formulario) con:
   - ID obligatorio: id="testimonios"
   - Mínimo 2 testimonios de clientes ficticios pero verosímiles
   - Cada testimonio debe incluir: nombre completo, cargo/profesión, ciudad/país, y texto del testimonio (2-3 líneas)
   - Usar etiquetas semánticas: <article> o <blockquote> para cada testimonio
   - Mantener la estética visual oscura y de lujo del sitio

2. AGREGAR al formulario existente (id="manifest-form") el campo faltante:
   - Checkbox obligatorio con label "Acepto los términos y condiciones de vuelo"
   - Atributo required en el checkbox
   - Ubicarlo antes del botón de submit

3. CORREGIR los IDs de las secciones para que coincidan con los requisitos:
   - Cambiar id="despegue" por id="hero" (mantener también la clase section-despegue)
   - Cambiar id="servicios" por id="beneficios" (mantener también la clase section-servicios)
   - Cambiar id="tripulacion" por id="registro" (mantener también la clase section-tripulacion)

4. VALIDAR que todas las secciones tengan las etiquetas HTML semánticas correctas según la guía

# [F] FORMATO
Entrega la respuesta estructurada de la siguiente manera:
- Tipo de salida: Código HTML completo y funcional listo para copiar y pegar
- Estructura: 
  * Primero muestra SOLO las 3 secciones modificadas/insertadas (testimonios, formulario corregido, y el hero con ID corregido)
  * Luego proporciona el archivo HTML COMPLETO con todas las correcciones integradas
- Extensión aproximada: Código completo sin resúmenes, debe ser funcional al 100%

NOTA: Mantén intactas todas las demás secciones (destinos, vuelo, servicios, footer) y los scripts. Solo modifica lo estrictamente necesario para cumplir los requisitos.