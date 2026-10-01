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
