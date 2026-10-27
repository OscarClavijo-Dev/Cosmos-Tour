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

---

# Auditoría de seguridad — Manejo de inputs (Prompt 2: XSS / inyección / sanitización)

> Fecha: 27 de octubre de 2026
> Alcance: `script.js` (validación F1, recolección de datos, renderizado del boarding pass, contadores del hero) e `index.html` (campos del formulario `#manifest-form`).

---

## Veredicto general

**No existe un XSS ejecutable hoy.** Todo el flujo del formulario renderiza datos de usuario con `textContent` (nunca `innerHTML`):

- `showToast()` → `toast.textContent = message` (`script.js:367`)
- `validateFieldById()` → `errorElement.textContent` (`script.js:480`)
- `populateBoardingPass()` → `setText()` con `textContent` (`script.js:1749-1752`)
- `fillModalList()` → `listItem.textContent` (`script.js:1625-1628`)

Tampoco hay `eval`, `new Function`, `setTimeout` con string, `document.write` ni `insertAdjacentHTML` con datos de entrada en todo el proyecto.

Sin embargo, la revisión identificó **5 riesgos residuales de defensa en profundidad** que quedaron corregidos en esta pasada.

---

## Hallazgos y correcciones aplicadas

| # | Hallazgo | Categoría | Severidad | Corrección |
|---|----------|-----------|-----------|------------|
| S1 | **Sin saneado de caracteres de control/NUL ni límite de longitud** en los campos libres (`manifest-name`, `manifest-email`, `manifest-passport`): solo se hacía `.trim()`. Un valor manipulado (consola, autofill malicioso, futuro backend) podía transportar `\u0000`, caracteres de control o 10.000 caracteres sin filtrar. | Seguridad (sanitización) | Menor → corregido | Nueva utilidad `sanitizeText()` (`script.js:72-83`): elimina `[\u0000-\u001F\u007F]`, colapsa espacios, recorta y limita longitud. Constantes `FIELD_MAX_LENGTHS` (`script.js:61`). |
| S2 | **Sin whitelist en los 4 `<select>`**: si se manipulaba el `value` del DOM por consola, cualquier string arbitrario pasaba a la credencial y a `generateMissionCode()`. | Seguridad (validación) | Menor → corregido | Nueva utilidad `isAllowedSelectValue()` (`script.js:86-93`) que verifica el valor contra las `<option>` reales del propio select. Aplicada en las 4 reglas de `VALIDATION_RULES` y en `collectManifestData()`. |
| S3 | **Regex de nombre/pasaporte demasiado permisivas**: nombre validaba solo longitud ≥5; pasaporte solo no-vacío. Ambos aceptaban cualquier carácter, incluidos potenciales payloads HTML. | Seguridad (validación) | Menor → corregido | Whitelists estrictas: `NAME_REGEX` (`script.js:57`, letras acentuadas, espacios, apóstrofes, guiones, máx. 80) y `PASSPORT_REGEX` (`script.js:58`, alfanumérico + guion, 3–20). |
| S4 | **`prepareMetricCounter()` reconstruía el DOM con `innerHTML` + `outerHTML`** (`script.js` antiguo:717). Contenido estático hoy, pero patrón inseguro: si los datos del HUD se volvieran dinámicos sería un vector de inyección directo. | Seguridad (código inseguro) | Menor → corregido | Reescrito con `createElement`/`replaceChildren`/`textContent` (`script.js:780-791`): cero interpolación de markup. |
| S5 | **HTML sin `maxlength`/`minlength`/`pattern`** en los inputs libres: sin barrera nativa contra pegado masivo o entrada fuera de formato. | Seguridad / Calidad | Menor → corregido | Añadidos `maxlength`, `minlength`, `pattern` (espejo de las regex JS) y `title` descriptivo en los 3 inputs (`index.html:1053-1084`). |

---

## Defensa en profundidad resultante (capas activas)

```
Capa 1 — HTML nativo:     maxlength / minlength / pattern en los inputs
Capa 2 — Validación JS:   VALIDATION_RULES con whitelists (regex + options de select)
Capa 3 — Sanitización:    sanitizeText() en collectManifestData() ANTES de usar los datos
Capa 4 — Renderizado:     100% textContent (nunca innerHTML con datos de usuario)
```

Si en el futuro se integra un backend (pendiente: hallazgo C1), los datos ya llegan saneados y acotados; la única capa que faltaría sería la **validación en servidor** (obligatoria cualquierday: el cliente nunca es confiable).

---

## Nota sobre `novalidate`

El formulario desactiva la validación nativa vía JS (`script.js:577`) para controlar los mensajes inline. Los atributos `pattern`/`minlength` añadidos en HTML **no bloquean el submit** mientras `novalidate` esté activo, pero:

- `maxlength` **sí** funciona incluso con `novalidate` (límite al tecleo/pegado).
- Las reglas equivalentes ya están duplicadas en `VALIDATION_RULES` (capa 2).
- Si el script fallara y `novalidate` no se aplicara, los atributos nativos respaldan.

---

## Correcciones NO aplicadas (requieren decisión de producto)

- **C1/C2 de la auditoría inicial** (sin backend, biométrico simulado): fuera del alcance de esta pasada de seguridad; dependen de decisión de negocio.
- **CSP (Content-Security-Policy)**: no se añadió meta-tag porque el sitio carga fuentes de terceros (gstatic) y tiene estilos inline; una política estricta rompería la página. Recomendación: definirla en cabecera HTTP al desplegar, con `script-src 'self'` y sin `unsafe-inline` para scripts.
