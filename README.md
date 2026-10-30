# Cosmos Tour | Turismo Espacial de Lujo (React + TypeScript + Vite)

Plataforma web interactiva de **Cosmos Tour**, agencia de turismo espacial de alto lujo y experiencias inmersivas con expediciones orbitales a la Tierra, la Luna, Marte y la Estación Espacial Internacional.

## Stack Tecnológico

- **Framework:** React 19 + TypeScript
- **Bundler & Dev Server:** Vite 6 (puerto `3000`)
- **Estilos:** Tailwind CSS v4 + Sistema de diseño aeroespacial original (`src/index.css`) con soporte de tema claro/oscuro (`data-theme="dark" | "light"`).

## Características Principales

- **Visor Orbital Interactivo (Hero):** Telemetría orbital en tiempo real (Altitud, Velocidad, Período) y fichas técnicas modales para Tierra, Marte, La Luna, Júpiter y Saturno con persistencia en `sessionStorage`.
- **Expediciones Orbitales:** Catálogo de misiones (Órbita Terrestre, La Luna, Marte) con Dossier de Navegación "Salto Warp" y preselección directa en el manifiesto de reserva.
- **Simulación de Vuelo en 3 Etapas:**
  1. **Secuencia de Ignición:** Simulación en bucle `requestAnimationFrame` con telemetría de velocidad, altitud y empuje, sacudida de cámara y aborto de misión.
  2. **Entrenamiento en Gravedad Cero (0G):** Arena física interactiva con rebote elástico y restitución en paredes.
  3. **Mirador de Estrellas (Cúpula):** Ventana de observación con paralaje táctil/ratón y puntos de interés astronómicos (Pléyades, Nebulosa de Orión, Aurora Australis).
- **Amenidades y Matriz Comparativa:** Filtrado por categorías (`Todo`, `Suites`, `Gastronomía`, `Mirador`, `Academia`), fichas técnicas desplegables y tabla comparativa interactiva frente a aerolíneas Primera Clase y competidores suborbitales.
- **Cuenta Regresiva T-Minus:** Reloj en vivo hacia el lanzamiento del 15 de noviembre de 2026 (`AST-2026`).
- **Manifiesto de Embarque y Carrito de Experiencias Extras:**
  - Selección de experiencias adicionales con persistencia en `localStorage` y sincronización entre pestañas.
  - Autoguardado en tiempo real, copias de seguridad automáticas cada 5 minutos, envío a Formspree y generación de credencial de embarque (`AST-2026`).
- **Política de Privacidad y Protección de Datos:** Vista legal integrada con navegación directa desde el pie de página y el formulario.

## Scripts de Desarrollo

```bash
# Iniciar servidor de desarrollo en http://0.0.0.0:3000
npm run dev

# Compilar para producción
npm run build

# Verificación de tipos TypeScript
npm run lint
```