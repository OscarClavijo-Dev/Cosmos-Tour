# Auditoría — Hoja de Registro de Tripulación (`#registro`)

> Rama: `feature/auditoria`
> Fecha: 26 de octubre de 2026
> Alcance: `index.html:961-1131` (sección F), reglas y flujo de envío en `script.js` (validación F1 + boarding pass F15), estilos asociados en `styles.css`.

---

## Hallazgos por severidad

### CRÍTICO

| # | Hallazgo | Categoría | Ubicación |
|---|----------|-----------|-----------|
| C1 | **El formulario no envía datos a ningún backend.** No hay `action`/`method`, el submit llama `preventDefault()` y nunca existe `fetch`/XHR. El flujo termina mostrando una credencial generada en cliente. | Lógica | `index.html:1049`, `script.js:488-504`, `script.js:1780-1803` |
| C2 | **Escaneo biométrico simulado con PII sensible.** Se pide pasaporte (documento de identidad) y el usuario ve mensajes falsos: *"Cotejando pasaporte con base de datos aeroespacial…"*, *"Verificando aptitud médica"*, sello *"● AUTORIZADO · BIO-CLEARED"*. No hay verificación real, ni enlace a política de privacidad junto al campo, ni consentimiento específico de tratamiento de datos personales (solo acepta "términos de vuelo"). | Seguridad / Legal (LGPD-GDPR) | `index.html:983-994`, `script.js:1718-1733`, `script.js:1754-1757` |

**Impacto si se despliega sin corrección (C1+C2):** cada "reserva" se pierde silenciosamente — el negocio no recibe ni un lead. Peor: el usuario confirma un embarque que no existe en ningún registro, y puede creer que su pasaporte fue verificado o almacenado. Riesgo de reclamación legal por recolección de PII engañosa y de pérdida total de confianza.

---

### MODERADO

| # | Hallazgo | Categoría | Ubicación |
|---|----------|-----------|-----------|
| M1 | **Contraste WCAG AA fallido en tema claro:** `.error-message` usa `#fb7185` fijo; sobre el fondo claro (`#ffffff`/`#eef3fa`) el contraste es ≈3.2:1, inferior al 4.5:1 exigido para texto pequeño (0.75rem). Los mensajes de error quedan casi ilegibles en modo claro. | Incompatibilidad / Accesibilidad | `styles.css:2787-2796` (sin override en bloque light `styles.css:2288-2317`) |
| M2 | **CSS crítico inline duplicado en `<head>` (~11KB) que replica `styles.css`.** Cualquier cambio posterior en el diseño (p.ej. corregir M1) obliga a editar dos copias; si se olvida una, el formulario se renderiza distinto según el estado de carga. Ruido de mantenimiento y riesgo de desincronización visual. | Desactualizado / Rendimiento | `index.html:54-66` vs `styles.css:2746+` |
| M3 | **Fuentes dependientes de URLs directas de Google/gstatic** precargadas en el `<head>`: si Google rota los archivos woff2, los preloads devuelven 404 y la tipografía cambia sin previo aviso; además cada visita dispara peticiones a un tercero (exposición de IP del usuario). | Desactualizado / Seguridad-privacidad | `index.html:48-51` |
| M4 | **Validación "en tiempo real" con lag:** el listener `input` solo re-valida si el campo *ya* tiene `field-invalid` (`script.js:527-531`). Un campo válido que se vuelve inválido mientras se escribe no muestra error hasta el siguiente `blur`. El usuario ve el botón "Validar" con datos que ya no son válidos. | Lógica | `script.js:525-536` |
| M5 | **Reglas de validación muertas en los 4 `select`:** `manifest-destination/suite/window/role` siempre tienen opción por defecto seleccionada, por lo que `field.value` nunca está vacío y las 4 reglas de `VALIDATION_RULES` jamás fallan. Código engañoso para quien mantenga el formulario. | Lógica | `script.js:118-133`, `index.html:1067-1100` |
| M6 | **Impresión de la credencial sin estilos `@media print`:** el botón llama `window.print()` pero no existe ninguna regla de impresión; se imprime la landing completa (canvas 3D, nav, footer, fondos) en lugar de solo la tarjeta. | Lógica / Incompatibilidad | `index.html:1042-1044`, `script.js:1839-1844`, `styles.css` (sin `@media print`) |
| M7 | **Barra de progreso del escaneo invisible en modo claro:** `.scan-progress-track` usa `rgba(255,255,255,0.07)` sobre `.biometric-scanner-box` que en tema claro pasa a fondo claro (`--color-space-deep` = `#eef3fa`); el riel queda casi imperceptible. | Incompatibilidad | `styles.css:3381-3397` + `styles.css:2288-2292` |

---

### MENOR

| # | Hallazgo | Categoría | Ubicación |
|---|----------|-----------|-----------|
| m1 | **Sin guard explícito anti doble envío:** la prevención se apoya solo en `form.style.display='none'`. Un `requestSubmit()` programático o dos eventos de submit casi simultáneos ejecutarían dos veces `startBoardingPassFlow` (dos bucles `requestAnimationFrame`, doble toast). Hoy es difícil de provocar, pero es frágil si se añade backend. | Lógica | `script.js:1788-1789` |
| m2 | **Inputs sin `name`, `maxlength` ni `autocomplete`:** solo `manifest-terms` tiene `name`. Si mañana se conecta un backend con envío nativo o `FormData`, solo se enviaría el checkbox. Sin `maxlength`, pegar 10.000 caracteres en nombre rompe la maquetación de la credencial. Sin `autocomplete="name"/"email"`, los gestores de contraseñas no completan. | Lógica / Calidad | `index.html:1051-1100` |
| m3 | **Etiqueta engañosa `pass-role-country`:** muestra `${role} · Misión Privada`, pero nunca se colecta país. El id/semántica prometen un dato inexistente. | Lógica | `script.js:1706` |
| m4 | **Código muerto en `initThemeToggle`:** la rama que crea dinámicamente el botón de tema quedó obsoleta tras servirlo estático en HTML. | Desactualizado | `script.js:848-859` |
| m5 | **Regex de email que rechaza TLDs Unicode** (dominios IDN internacionales). | Incompatibilidad | `script.js:54` |
| m6 | **Ventanas de despegue hardcodeadas** ("Octubre 2026", "Marzo 2027"…): caducan automáticamente con el tiempo; además `<meta name="keywords">` es ignorado por los buscadores actuales. | Desactualizado | `index.html:1086-1090`, `index.html:10` |
| m7 | **Feedback de escaneo fuera de regiones `aria-live`:** los textos de `#scan-progress-text` y `#manifest-seal-status` cambian sin avisar a lectores de pantalla; el foco no se mueve tras enviar. | Accesibilidad | `index.html:977-993`, `script.js:1718-1733` |

---

## Lo que está bien (verificado)

- **Anti-XSS:** todo el flujo del formulario renderiza con `textContent` (`populateBoardingPass`, toasts, errores) — no hay inyección posible hoy vía nombre/email/pasaporte.
- **localStorage seguro:** `readStorage`/`writeStorage` con `try/catch`; además **no** persiste PII (solo el tema), lo que elimina fugas por almacenamiento local.
- **Progresivo:** `novalidate` se aplica por JS conservando `required` en HTML — si el script falla, la validación nativa respalda.
- **Accesibilidad básica correcta:** `aria-invalid`, `aria-describedby` hacia el mensaje de error, foco al primer campo inválido (`script.js:493-500`), toasts con `role="status"` + `aria-live`.
- **Responsive:** `.form-grid` colapsa a 1 columna ≤767px (`styles.css:3427-3432`).

---

## Resumen de impacto

| Severidad | Cantidad | Consecuencia dominante si se despliega tal cual |
|-----------|----------|--------------------------------------------------|
| Crítico | 2 | El formulario es una **simulación**: no captura reservas y expone PII con verificación falsa. |
| Moderado | 7 | Inaccesible en modo claro, fricción de validación, impresión rota, mantenimiento en doble copia. |
| Menor | 7 | Deuda técnica y fragilidad ante futura integración con backend. |

**Prioridad de corrección sugerida:** C1/C2 (decidir si el formulario pasa a ser funcional con backend o se re-etiqueta explícitamente como demo) → M1 (contraste de errores en tema claro) → M4 (lag de validación) → M6 (impresión) → resto.
