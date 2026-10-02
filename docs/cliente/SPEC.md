# BuildI · App del cliente — Especificación

Esta especificación resume todo lo que se diseñó para la app del cliente (el dueño de la casa) en los prototipos de `docs/cliente/prototipos/`. Los prototipos son HTML interactivos: ábrelos en el navegador para ver cómo se comporta cada pantalla. El texto alrededor del teléfono en cada prototipo explica la intención; el teléfono muestra la interacción.

> **Regla de oro:** si un prototipo y este documento no coinciden, manda este documento. En particular, `05-inicio-redistribucion.html` reemplaza la organización en subpestañas de los prototipos 02, 03 y 04 (sus piezas se conservan, pero cambian de lugar).

---

## 1. Idea central

El cliente no llega con un proyecto, llega con una duda: *"¿qué hago con este espacio?"*. La app lo acompaña desde ahí hasta muchos años después de vivir en la casa, en un ciclo de 8 etapas (ver `01-ciclo-completo.html`):

| # | Etapa | Pregunta del cliente | Dónde vive |
|---|---|---|---|
| 01 | Inspirarse | "No sé qué hacer con este espacio." | Inicio |
| 02 | Diagnosticar | "¿Se puede hacer en mi casa?" | Inicio → se crea la obra |
| 03 | Diseñar | "¿Cómo se va a ver y cuánto cuesta?" | Mis obras |
| 04 | Decidir y financiar | "¿Cómo lo pago y qué firmo?" | Mis obras |
| 05 | Construir | "¿Cómo va mi obra?" | Mis obras |
| 06 | Recibir | "¿Todo quedó bien?" | Mis obras → Mi hogar |
| 07 | Vivir y cuidar | "¿Qué le toca a mi casa?" | Mi hogar |
| 08 | Mejorar y continuar | "Ya cambió mi vida, ¿y mi casa?" | Mi hogar → Inicio |

Las etapas de un proyecto (`ProjectStage`): `idea → diagnostico → diseno → presupuesto → obra → entrega → hogar`.

---

## 2. Navegación final

Cuatro pestañas en una barra flotante de vidrio con indicador que se desliza con resorte:

1. **Inicio** — descubrir. Solo 3 subpestañas: **Para ti**, **Explorar**, **Guardado**.
2. **Mis obras** — todo lo que ya se contrató o se está diseñando.
3. **Mi hogar** — la casa ya vivida: cuidado, uso, valor, largo plazo.
4. **Perfil** — quién eres, quién más entra, cómo pagas, ajustes.

### Qué pasa con las pestañas actuales del cliente

Hoy el cliente tiene `home`, `market-insight`, `community`, `financials`, `profile`. Se reorganizan así (no borres lógica útil; muévela):

| Actual | Pasa a |
|---|---|
| `home` | **Inicio** |
| `market-insight` | **Mi hogar › Valor** (reutiliza gráficas de valor/plusvalía) |
| `financials` | **Mis obras › Dinero** y **Perfil › Pagos** |
| `community` | **Inicio › Para ti** (sección "En tu colonia") |
| `profile` | **Perfil** |

---

## 3. Sistema de diseño (cliente)

### Colores

| Token | Valor | Uso |
|---|---|---|
| `plaster` | `#e4e8e1` | fondo exterior |
| `screen` | `#f6f2ea` | fondo de pantalla |
| `paper` / `card` | `#fbfaf6` / `#fffdf9` | tarjetas |
| `ink` | `#2b2a26` | texto principal |
| `ink2` | `#5e6259` | texto secundario |
| `mute` | `#7a746a` | etiquetas |
| `line` | `rgba(43,42,38,.13)` | bordes |
| `sage` / `sage2` | `#4f7d61` / `#dfe9e2` | acento principal, éxito |
| `clay` / `clay2` | `#b0561f` / `#f6e3d6` | alertas, "de Inicio", llamados |
| `brass` | `#c9a24a` | dorado: llave, premium |
| `blue` | `#3c6e9e` | información |

### Tipografía

- **Fraunces** (serif) para títulos; la segunda parte del título va en itálica color sage: *"¿Qué quieres hacer **con tu espacio?**"*.
- **Archivo** (sans) para texto y botones.
- **IBM Plex Mono** para etiquetas pequeñas en MAYÚSCULAS con tracking, precios y datos.

### Formas

- Tarjetas con radio 18–22, sin sombra dura.
- Chips/pastillas con radio completo; seleccionado = fondo `ink`, texto blanco.
- Bottom sheets con radio 26 arriba, "grab" de 40×5, fondo `screen`.
- Toast oscuro que baja desde arriba.

### Movimiento

- Resortes suaves (Reanimated). Barra de pestañas con indicador que salta al tocar.
- Respeta "reducir movimiento": sin animaciones decorativas ni efecto holográfico.
- Háptica corta en acciones importantes (aprobar, pagar, abrir puerta).

---

## 4. Componentes compartidos

Créalos una vez y reúsalos en las 4 pestañas.

| Componente | Dónde se usa | Prototipo de referencia |
|---|---|---|
| `GlassTabBar` (4 pestañas, indicador con resorte, badges) | Toda la app | todos |
| `ScreenHeader` (eyebrow mono + título serif con itálica) | Todas las pantallas | todos |
| `SubTabs` (pastillas) y `SegmentedControl` | Inicio, Mis obras, Mi hogar, Perfil | todos |
| `Card`, `KpiTile`, `Pill`/`Badge`, etiqueta "de Inicio" | Todas | 05, 09 |
| `BottomSheet` | Hoja de idea, mueble, acabado, diseñador, permisos | 02–06, 09 |
| `Toast` | Confirmaciones | todos |
| `Switch`, `Slider`, `Stepper`, `ChipGroup` | Formularios | 04, 09 |
| `ProgressRing`, `Bar`, gráfica de barras y de línea | Mi hogar, Mis obras, Perfil | 07, 08, 09 |
| `BeforeAfterSlider` (divisor arrastrable) | Antes y después, "En tu casa" | 02, 03 |
| `SlideToConfirm` (llave que se desliza para pagar) | Mis obras › Dinero | 07, 10 |
| `Stamp` (sello que cae al aprobar) | Mis obras › Decisiones | 07 |
| `HoloCard` (Home Key holográfica, se voltea, mantener para abrir) | Perfil › Yo | 09, 10 |
| `FloorPlan` (SVG con muebles arrastrables y detección de choques) | Mi hogar › Expediente, ideas de muebles | 04 |
| `LayerStack` (capas en vista explotada) | Idea › Cómo se construye | 04 |
| `TextureSwatch` (textura de material: madera, mármol, terrazo…) | Explorar › Acabados | 06 |
| `RoomIllustration` (placeholder dibujado de cuartos) | Mientras no haya fotos reales | todos |

---

## 5. Inicio

Referencia: `05-inicio-redistribucion.html` (organización final) + `02`, `03`, `04` (detalle de cada pieza) + `06` (diseñadores, muebles, acabados).

### 5.1 Para ti (un solo feed con secciones deslizables y aire entre ellas)

1. **Asistente "¿No sabes por dónde empezar?"** — 4 preguntas (espacio, qué molesta, inversión, estilo) → foto opcional → "escaneo" con etiquetas → 3 opciones con una recomendada → pedir visita o guardar. (02)
2. **¿Qué te preocupa?** — atajos por necesidad: casa oscura, mucho calor, viene un bebé, home office, mucho ruido, papás en casa. Llevan a Explorar filtrado. (03, 05)
3. **Caben en tu casa** — ideas que caben en las medidas reales del cliente, ordenadas por su estilo. (02, 05)
4. **Invitación a tu estilo** — si no hay perfil de estilo, invita a jugarlo (vive en Perfil). (05)
5. **Antes y después** — obras reales con divisor. (02)
6. **Hecho a mano cerca de ti** — talleres y diseñadores. (06)
7. **Aprende en 30 segundos** — comparativas (p. ej. cuarzo vs. granito). (06)
8. **Oficios que quizá no conocías**. (06)
9. **Caja de muestras gratis**. (06)
10. **Guías y En tu colonia** — al final. (03)

### 5.2 Explorar — 4 modos

- **Espacios**: cocina, sala, recámara, baño, terraza, fachada, clósets, home office.
- **Muebles**: 10 espacios × tipos de mueble (73). Hoja de mueble: materiales con pros/contras, medida que cabe según el plano, dos caminos con precio: *comprarlo hecho* (proveedores) o *a medida* (talleres). (06)
- **Acabados**: 10 familias × materiales (56) con textura, $/m², resistencia, mantenimiento, dónde sí / dónde no, cuánto cuesta en tu cuarto, quién lo instala, agregar a la caja de muestras. (06)
- **Diseñadores**: 53 oficios en 6 grupos; perfiles con portafolio, calificación, distancia, entrega; **encargo a medida** en 3 pasos (pieza, medidas y fotos tomadas del plano, presupuesto) y seguimiento: solicitud → visita → boceto → render 3D → fabricación (taller en vivo) → instalación. Pago 40% al aprobar el render, 60% al instalar; la garantía se guarda en Mi hogar. (06)
- Filtro por necesidad disponible en todos los modos.

### 5.3 Guardado

Tableros con mosaico y costo sumado; compartir; convertir en proyecto; **comparar dos ideas** lado a lado (costo, tiempo, resultado, valor, días sin usar el espacio). (02, 03, 05)

### 5.4 Hoja de idea (lo que antes eran subpestañas, ahora vive dentro de cada idea)

Pestañas contextuales — **solo aparecen las que aplican a la idea**:

| Pestaña | Contenido | Prototipo |
|---|---|---|
| En tu casa | Divisor antes/después sobre la foto del cliente, 3 estilos que cambian precio | 03 |
| En tu plano | Medidas reales, qué cabe, advertencias (muro de carga) | 03 |
| Luz y color | Pintura, piso y focos; hora del día 7:00–22:00 según orientación; consejos; litros de pintura | 04 |
| Cómo se construye | Capas en vista explotada con material, grosor, $/m², oficio; pasos día por día; qué revisa BuildI | 04 |
| Cómo se vive | Ruido, polvo, molestia; semana por semana; cocineta provisional | 03 |
| Pagarlo | Nivel de acabados (Básico .85 / Medio 1 / Premium 1.4), enganche y plazo → mensualidad, otras formas de pago | 02, 03 |
| Quién lo hace | Diseñador, equipo de obra, taller; "compra el look" / solo los muebles | 02, 03 |

Botones fijos: **Guardar** y **Hazlo con BuildI** (crea el proyecto en Mis obras con fotos, plano, estilo y simulación de pago).

---

## 6. Mis obras

Referencia: `07-mis-obras.html` (+ partes movidas desde Inicio según `05`).

- **Selector de obra** arriba (p. ej. Depto 6B en obra, Cocina en diseño, Terraza en idea) y **barra de etapa**.
- Seis subpestañas: **Resumen, Avance, Dinero, Decisiones, Documentos, Equipo**. Lo que aparece primero en Resumen depende de la etapa (tabla en el prototipo 07).
- **Resumen**: foto en vivo, clima, cuántas personas trabajan, lo que espera al cliente. Incluye **"Esta semana en casa"** (ruido/polvo/sin cocina) — movido desde "Cómo se vive". Incluye **quién está hoy en tu casa** (nombres y oficios).
- **Avance**: fases con % planeado vs. real, diario semanal de fotos con antes/después; **Revisiones de BuildI con foto** (prueba de inundación, nivel, presión) — movido desde "Cómo se construye".
- **Dinero**: total del contrato, calendario de pagos, cambios aprobados, facturas; pagar **deslizando la llave**; plan de financiamiento (movido desde "Pagarlo" al contratar).
- **Decisiones**: acabados para elegir (muestras), cambios con impacto en costo y días (aprobar el cambio "Ventana de piso a techo" suma $38,400 y 6 días al total y a la fecha), renders para revisar; al aprobar cae el **sello**.
- **Documentos**: contrato, planos, permisos, facturas (solo lo del cliente).
- **Equipo**: arquitecta, residente, asesora; chat con fotos (`.msg.mine/.msg.theirs`); agendar visitas a la obra.

---

## 7. Mi hogar

Referencia: `08-mi-hogar.html` (+ piezas movidas desde Inicio según `05`).

- **Selector de propiedad**. Mismo esqueleto que Mis obras: seis subpestañas.
- **Resumen**: anillo de salud del hogar por sistema (estructura, agua, electricidad, impermeabilización), alerta de posible fuga, avisos por clima.
- **Mantenimiento**: año de 12 meses por temporada; cada tarea con por qué importa, qué pasa si no se hace y costo; **Plan Hogar $590/mes** (activarlo sube la salud del hogar).
- **Uso**: luz, agua y gas por mes, consejos con ahorro en pesos, sensores, **modo vacaciones**.
- **Reparaciones**: tocar el cuarto en el plano → tipo de problema → revisa garantía → horario → seguimiento del técnico (reportado → asignado → en camino → resuelto).
- **Expediente**: colores exactos de pintura (**Tus colores**, abre Luz y color), equipos con modelo y garantía, planos finales, historial; **Tu plano con muebles** (acomodar muebles con detección de choques, puerta y paso de 60 cm — movido desde Inicio parte 3).
- **Valor**: valor estimado y gráfica, mejoras con ROI, predial y seguro con fecha, rentar o vender; **Plan a 5 años** (ideas guardadas acomodadas por año según presupuesto anual y prioridad: ahorrar / que valga más / vivir cómodo; lo urgente primero; gráfica de valor) — movido desde Inicio parte 3. Aquí se reutiliza `market-insight`.
- Los servicios recurrentes (limpieza, plagas, jardín, lavado de salas, mudanza, organización) se ofrecen desde Mi hogar.

---

## 8. Perfil

Referencia: `09-perfil.html` y `10-home-key.html`.

Encabezado con avatar, nombre, "Cliente desde…", insignias (Plan Hogar, Cliente ★4.9). Cuatro subpestañas:

- **Yo**: **Home Key** holográfica (se inclina con el dedo, se voltea con un toque; atrás: código y botón "Abrir" que se mantiene presionado 1 s con anillo de progreso y háptica); **Mis casas** (propietaria, en obra, invitada); **Mi estilo** (paleta, mezcla en %, volver a jugar — el juego de tarjetas deslizables de `03`); **Cómo trabajo con BuildI** (presupuesto anual, prioridad, canal de contacto, horarios de visita); **Mi reputación como cliente** (pagos a tiempo, días para decidir, trato → mejor tasa y prioridad); guardados.
- **Familia**: personas con 6 permisos (ver obras, aprobar cambios, pagar, abrir la puerta, ver cámaras, recibir avisos); **regla de dos firmas** con monto configurable; **llaves temporales** (técnico, trabajadora del hogar, invitado, mudanza) con horario, código y cancelar; contacto si algo me pasa.
- **Pagos**: **dinero protegido** (en resguardo, se libera al aprobar avance) con desglose; financiamiento; métodos (tarjeta, SPEI, Infonavit); Face ID para pagar; facturas CFDI automáticas; Plan Hogar; invita a tus vecinos con crédito.
- **Ajustes**: notificaciones por tema con horario silencioso (pagos siempre activas); privacidad en una línea por opción; "Quién vio qué"; sesiones; **texto grande** (escala toda la app); menos movimiento; idioma; asesora con nombre (chat, llamada, garantías); cerrar sesión.

---

## 9. Flujos que cruzan pestañas

1. Inicio › idea › **Hazlo con BuildI** → crea proyecto en **Mis obras** (etapa idea/diagnóstico) con fotos, plano, estilo y simulación de pago.
2. Inicio › diseñador › **encargo a medida** → aparece en Mis obras; al instalar, la garantía va a **Mi hogar › Expediente**.
3. Mis obras › **entrega** → la obra pasa a **Mi hogar** con su expediente y se entrega la **Home Key** (Perfil).
4. Mi hogar › alerta de fuga → **Reparaciones** con el baño marcado.
5. Mi hogar › Valor › mejoras / Plan 5 años → **Inicio** (idea) → vuelve a empezar el ciclo.
6. Perfil › estilo y presupuesto → ordenan y filtran todo Inicio.
7. Perfil › Familia › regla de dos firmas → afecta aprobaciones y pagos en Mis obras.

---

## 10. Datos

Todo con datos de ejemplo en **un solo módulo** (`mock`), detrás de una interfaz de repositorio para conectar Supabase después (`lib/supabase.ts` ya existe). Persona de ejemplo única: **Ana García**, Casa Providencia (propietaria, salud 86%), Depto 6B (en obra, semana 6), Cocina abierta (en diseño), Casa de mamá (invitada). *Los prototipos a veces dicen "Mariana": úsalo como Ana.*

Tipos mínimos: `Property`, `Project` (con `stage`), `Idea` (con `tools` aplicables), `Board`, `Need`, `Trade` (oficio, grupo), `Designer`, `FurnitureType`, `Finish`, `CustomOrder` (encargo a medida y su etapa), `Phase`, `Payment`, `ChangeOrder`, `Decision`, `ProjectDocument`, `TeamMember`, `MaintenanceTask`, `RepairTicket`, `Consumption`, `ValueEstimate`, `PlanYear`, `StyleProfile`, `Preferences`, `FamilyMember` (permisos), `TemporaryKey`, `PaymentMethod`, `Invoice`, `NotificationSettings`.

Montos, precios y personas de los prototipos son de ejemplo; no presentes ninguno como dato real.

---

## 11. Librerías sugeridas

Revisa primero qué ya está instalado. Lo que se necesita para que se sienta como los prototipos:

- `react-native-reanimated`, `react-native-gesture-handler` — resortes, deslizables, arrastrar muebles, divisor antes/después, llave deslizable.
- `react-native-svg` — planos, capas, gráficas, anillos.
- `expo-haptics`, `expo-blur` (barra de vidrio), `expo-linear-gradient`.
- `@expo-google-fonts/fraunces`, `@expo-google-fonts/archivo`, `@expo-google-fonts/ibm-plex-mono` con `expo-font`.
- Opcional: `@shopify/react-native-skia` para el efecto holográfico y texturas procedurales (si no, usar imágenes y gradientes).

---

## Apéndice A — Lógica exacta de los prototipos 02, 03 y 05

Este apéndice existe para que **no haga falta leer el HTML/JS**. Copia estas reglas tal cual. Aun así, aísla cada una en una función pura (p. ej. `lib/cliente/logic.ts`) con pruebas, para poder cambiarla después.

### A.1 Asistente "¿No sabes por dónde empezar?" (02)

**Preguntas** (índices empiezan en 0; las respuestas se guardan como índices):

| # | Pregunta | Opciones (ícono · texto · subtexto) |
|---|---|---|
| 0 | ¿Qué espacio quieres cambiar? | 🍳 Cocina · 🛁 Baño · 🛋 Sala · 🛏 Recámara · 🌿 Exterior · 🤷 No sé, toda la casa |
| 1 | ¿Qué es lo que más te molesta hoy? | 🌑 Es oscuro · Falta luz natural / 📦 No me cabe nada · Falta guardado / 🧱 Está cerrado · Quiero integrarlo / 🕰 Se ve viejo · Acabados gastados |
| 2 | ¿Cuánto quieres invertir? | $ Menos de $80k · Cambios rápidos / $$ $80k–$200k · Remodelación / $$$ $200k–$400k · Obra completa / ? No sé todavía · Ayúdame a decidir |
| 3 | ¿Qué estilo te gusta? | 🌿 Cálido y natural · Madera, verde, luz cálida / ⬜ Minimalista · Blanco, líneas limpias / 🏺 Mexicano contemporáneo · Barro, piedra, color / 🖤 Industrial · Concreto, negro, metal |

Al tocar una opción avanza solo (220 ms). Barra de 4 segmentos, "PREGUNTA n DE 4", botón Atrás desde la 2.

**Paso foto (opcional):** "¿Nos mandas una foto de tu {espacio}?" → *Tomar o subir foto* / *Saltar, ver opciones*.
**Escaneo simulado (2.5 s):** etiquetas que aparecen una cada 330 ms: `≈ 12 m²`, `Ventana al norte · poca luz`, `Muro de 3.1 m hacia sala`, `Gabinetes de los 2000`, `Piso cerámico 33×33`, `Techo a 2.5 m`.

**Las 3 opciones** (fijas en el prototipo; luego vendrán del backend):

| idx | Título | Descripción | Rango | Tiempo |
|---|---|---|---|---|
| 0 | Refrescar | gabinetes nuevos, luz cálida y pintura | $58k–$95k | 2 sem |
| 1 | Abrir y renovar | muro abierto a la sala, isla y acabados nuevos | $220k–$340k | 6 sem |
| 2 | Más luz y guardado | alacena a techo, cubierta nueva y tragaluz | $140k–$210k | 4 sem |

**Recomendación** (`pain` = respuesta 1, `budget` = respuesta 2):

```ts
export function recommendOption(pain: number, budget: number): 0 | 1 | 2 {
  if (pain === 2) return budget === 0 ? 0 : 1; // "Está cerrado": abrir, salvo presupuesto bajo
  if (pain === 3) return 0;                    // "Se ve viejo": refrescar
  return budget === 0 ? 0 : 2;                 // oscuro / sin guardado: luz y guardado, salvo presupuesto bajo
}
```

Texto: "3 caminos para tu {espacio}" · "Porque {molestia en minúsculas}, con estilo {estilo}{budget === 3 ? '' : ' y tu presupuesto'}." La recomendada lleva borde sage y etiqueta "Recomendado para ti". Botones: *Pedir visita técnica sin costo* · *Guardar en un tablero* (crea tablero "Mi {espacio}" y abre Guardado).

### A.2 Ideas de ejemplo y "Caben en tu casa" (02)

Campos: `space`, `title`, `type`, `lo`, `hi`, `weeks`, `desc`, `fits` (cabe en la cocina de 12.4 m² de Casa Providencia).

| Título | Espacio | Tipo | Rango | Tiempo | Cabe |
|---|---|---|---|---|---|
| Cocina abierta con isla | Cocina | Constructivo | 220k–340k | 5–7 sem | sí |
| Gabinetes nuevos sin obra | Cocina | Muebles | 68k–120k | 2 sem | sí |
| Clóset de piso a techo | Recámara | Muebles | 32k–58k | 3 sem | |
| Pérgola en azotea | Exterior | Exterior | 95k–160k | 4 sem | |
| Home office en recámara de visitas | Home office | Interiorismo | 38k–70k | 2 sem | |
| Baño con regadera de piso | Baño | Constructivo | 85k–140k | 3 sem | |
| Sala con muro de madera | Sala | Interiorismo | 45k–90k | 2 sem | |
| Renovar fachada y entrada | Fachada | Exterior | 120k–210k | 4 sem | |
| Cocina con desayunador | Cocina | Interiorismo | 140k–210k | 4 sem | sí |
| Recámara para un bebé | Recámara | Interiorismo | 30k–55k | 2 sem | |

"Caben en tu casa" = ideas con `fits`, título "Caben en tu cocina · 12.4 m² · Casa Providencia", cada tarjeta "✓ cabe · $Xk+".
Tipos para filtrar: Interiorismo, Muebles, Constructivo, Exterior. Tableros iniciales: "Cocina soñada" (cocina abierta, cocina con desayunador, gabinetes), "Azotea" (pérgola), "Para el bebé" (recámara bebé, clóset).

### A.3 Nivel de acabados y precio (02, 03)

```ts
export const FINISH_FACTOR = { basico: 0.85, medio: 1, premium: 1.4 };
export const STYLE_FACTOR = [1, 0.95, 1.1]; // Cálido, Minimalista, Mexicano (pestaña "En tu casa")
export const priceRange = (lo: number, hi: number, finish: keyof typeof FINISH_FACTOR, style = 0) =>
  [lo * FINISH_FACTOR[finish] * STYLE_FACTOR[style], hi * FINISH_FACTOR[finish] * STYLE_FACTOR[style]];
```

Descripciones por estilo (cocina): Cálido "Gabinetes laca salvia, cubierta cuarzo negro, piso roble." · Minimalista "Gabinetes blancos sin jaladeras, cubierta blanca, piso porcelanato." · Mexicano "Gabinetes terracota, cubierta de piedra clara, piso de barro."

### A.4 Pagarlo (03)

```ts
export function monthlyPayment(total: number, downPct: number, months: number, rate = 0.012) {
  const financed = total * (1 - downPct / 100);
  return financed * rate / (1 - Math.pow(1 + rate, -months));
}
```

`total` = punto medio del rango. Enganche 10–60% en pasos de 5 (inicial 30). Plazo 6–48 meses en pasos de 6 (inicial 24). Leyenda: "Ejemplo con tasa de 1.2% mensual. El financiamiento lo da un aliado y requiere aprobación." Otras formas: Meses sin intereses (hasta 12), Crédito de mejoras (banco o Infonavit), Pago por avance (4 partes). En Perfil, la buena reputación baja la tasa a 1.0%.

### A.5 Tu estilo: tarjetas deslizables (03)

8 tarjetas, cada una con un estilo: Sala con madera y luz cálida (cálido) · Baño blanco y limpio (mini) · Terraza con pérgola (cálido) · Fachada de barro y celosía (mex) · Clóset de madera oscura (cálido) · Oficina de concreto y negro (ind) · Recámara verde y suave (cálido) · Cocina con color terracota (mex).

Deslizar > 90 px decide (derecha = me gusta), si no regresa. Sellos "ME GUSTA"/"NO" con opacidad = desplazamiento/90. Botones ✕ y ♥ hacen lo mismo.

```ts
export function styleProfile(likes: boolean[], cards: StyleKey[]) {
  const liked = cards.filter((_, i) => likes[i]);
  const n = liked.length || 1;
  const pct = Object.fromEntries(STYLE_KEYS.map(k => [k, Math.round(liked.filter(s => s === k).length / n * 100)]));
  const top = [...STYLE_KEYS].sort((a, b) => pct[b] - pct[a])[0];
  return { top, pct, ...STYLES[top] };
}
```

| Clave | Nombre | Paleta | Palabras |
|---|---|---|---|
| calido | Cálido natural | #efe8dc #b98b5a #4f7d61 #9fb7a6 #c9a24a | Madera, Luz cálida, Verde salvia, Textiles, Plantas |
| mini | Minimalista | #f4f4f2 #d9d9d6 #cfcac2 #2b2a26 #9aa1a4 | Blanco, Líneas limpias, Sin adornos, Mucho guardado |
| mex | Mexicano contemporáneo | #efe2cf #b0561f #8a5a3c #e8b04a #4f7d61 | Barro, Piedra, Celosías, Color tierra |
| ind | Industrial | #9aa1a4 #2b2a26 #6b6f70 #b98b5a #d9d9d6 | Concreto, Metal negro, Ladrillo, Focos expuestos |

### A.6 Por necesidad (03)

Campos por solución: `title`, `desc`, `lo`, `hi`, `time`, `result`.

- **🌑 Mi casa es oscura** (Falta luz natural): Tragaluz en pasillo 28k–45k · 1 sem · "Entra 3× más luz al pasillo" / Ventana de piso a techo 38k–60k · 2 sem · "+2 h de sol en invierno" / Abrir cocina a sala 220k–340k · 6 sem · "Un solo espacio iluminado"
- **🌡 Hace mucho calor** (Arriba de 30 °C adentro): Azotea verde o aislante 45k–90k · 2 sem · "−4 °C en planta alta" / Ventilación cruzada 18k–32k · 1 sem · "−2 °C sin aire acondicionado" / Minisplit inverter 16k–24k · 1 día · "40% menos luz que uno normal"
- **👶 Viene un bebé** (Necesito un cuarto más): Recámara para el bebé 30k–55k · 2 sem · "Lista antes de la fecha" / Dividir la recámara grande 60k–95k · 3 sem · "+1 recámara, +$400k de valor"
- **👵 Mis papás vienen a vivir** (Accesibilidad): Baño accesible 70k–110k · 3 sem · "Seguro para adultos mayores" / Recámara en planta baja 180k–260k · 6 sem · "Sin subir escaleras"
- **💻 Trabajo desde casa** (Necesito concentrarme): Home office cerrado 45k–80k · 2 sem · "Menos ruido de la casa" / Clóset convertido en escritorio 18k–30k · 1 sem · "Sin perder un cuarto"
- **🔇 Hay mucho ruido** (Calle o vecinos): Ventanas de doble vidrio 32k–55k · 1 sem · "−25 dB de la calle" / Muro acústico 24k–40k · 1 sem · "−15 dB del vecino"

### A.7 Comparar dos ideas (03)

Máximo 2 seleccionadas (la tercera muestra "Solo dos a la vez"). Filas y regla del ganador (verde); **si los dos valores mostrados son iguales, ninguno gana**:

| Fila | Valor mostrado | Gana |
|---|---|---|
| Costo | `$lo k–$hi k` | menor `lo + hi` |
| Tiempo | `time` | menor número |
| Resultado | `result` | — |
| Sube valor | `lo > 100000 ? 'Mucho' : 'Algo'` | mayor `lo` |
| Sin usar el espacio | `lo > 100000 ? '2–3 sem' : '2–4 días'` | menor `lo` |

Nota al pie: "Las dos se pueden hacer juntas: si lo pides así, se programan en la misma obra y ahorras un 10% en mano de obra." Botones: Pedir visita · Cotizar las dos.

### A.8 Cómo se vive la obra (03)

Medidores 1–5: Ruido 4 ("Días 1–6 fuerte"), Polvo 3 ("Con sellado de puertas"), Molestia 3 ("Casa habitable"). Línea de tiempo (cocina abierta): Sem 1 Demolición del muro · Sem 2–3 Sin cocina (cocineta provisional en el comedor: parrilla, tarja y refri) · Sem 4 Instalaciones y piso · Sem 5–6 Gabinetes y cubierta · Día 42 Lista (limpieza profunda incluida).

### A.9 Redistribución (05) — dónde vive cada pieza

| Pieza | Destino |
|---|---|
| Asistente | Inicio › Para ti (arriba; se oculta cuando ya hay ideas guardadas) |
| Ideas que caben, Antes y después, Expertos, Guías y tu colonia | Inicio › Para ti (secciones deslizables) |
| Por necesidad | Atajos en Para ti + filtro en Explorar |
| Explorar espacios | Inicio › Explorar |
| Mis tableros, Comparar | Inicio › Guardado |
| En tu casa, En tu plano, Luz y color, Cómo se construye, Nivel de acabados, Pagarlo, Quién lo hace, Compra el look | Dentro de la hoja de idea (solo las que aplican) |
| Cómo se vive la obra | Idea › Cómo se vive → al contratar: Mis obras › "Esta semana en casa" |
| Revisiones con foto | Mis obras › Avance |
| Plan a 5 años | Mi hogar › Plan / Valor |
| Muebles en tu plano | Mi hogar › Tu plano (también se abre desde ideas de muebles) |
| Tu estilo | Perfil › Mi estilo (en Inicio solo una invitación si falta) |
| Presupuesto anual | Perfil › Preferencias |

Lo que llega a otra pestaña desde Inicio lleva la etiqueta "de Inicio · {pieza}". Pestañas de la hoja de idea, en orden: En tu casa, En tu plano, Luz y color, Cómo se construye, Cómo se vive, Pagarlo, Quién lo hace. Pie fijo: Guardar · Hazlo con BuildI (crea el proyecto, cambia a Mis obras, toast "Proyecto creado · ya está en Mis obras").
