# Prompts para Claude Code en VS Code — App del cliente

Secuencia para pasar al código todo lo diseñado para el cliente, desde el ciclo completo hasta el Perfil. La fuente de verdad es `docs/cliente/SPEC.md` y los prototipos en `docs/cliente/prototipos/`.

## Antes de empezar

1. **Trae esta carpeta a tu proyecto.** Si tu proyecto local es este mismo repo:
   ```bash
   git fetch origin claude/vibrant-bell-egw3pu
   git checkout origin/claude/vibrant-bell-egw3pu -- docs/cliente
   ```
   Si tu proyecto local es otro, copia la carpeta `docs/cliente/` completa a la raíz.
2. **Elige el modelo:** en la extensión de Claude Code escribe `/model` y elige Opus.
3. **Trabaja en una rama nueva**, por ejemplo `feat/cliente-v2`.
4. **Un prompt por sesión.** Al terminar cada uno, revisa, prueba en Expo, haz commit, y usa `/clear` antes del siguiente. Así cada fase empieza con contexto limpio.
5. Para los prompts grandes (marcados con 🧭), activa el **modo plan** (con el selector de modo de la extensión o Shift+Tab) para que primero proponga y tú apruebes.
6. Si algo no te gusta en una fase, corrígelo ahí mismo antes de pasar a la siguiente.

---

## Prompt 0 — Contexto y diagnóstico 🧭

```
Vamos a rediseñar por completo la app del CLIENTE (dueño de la casa) de BuildI.
Todo el diseño ya está hecho y documentado:
- docs/cliente/SPEC.md  → la especificación (manda sobre todo lo demás)
- docs/cliente/prototipos/*.html → prototipos interactivos en HTML (01 a 10)

En esta sesión NO escribas código de pantallas todavía. Quiero que:
1. Leas SPEC.md completo y hojees los 10 prototipos (lee el HTML y el JS de cada uno
   para entender interacciones, datos y estados).
2. Explores el proyecto real: estructura de rutas de expo-router, dónde vive el grupo
   del cliente (pestañas home, market-insight, community, financials, profile),
   ThemeContext, componentes compartidos, servicios, Supabase (lib/supabase.ts),
   alias "@/" y qué librerías ya están instaladas en package.json.
3. Me entregues:
   - Mapa de la estructura actual relevante para el cliente.
   - Qué librerías de la sección 11 del SPEC faltan y el comando exacto para instalarlas
     con `npx expo install`.
   - Riesgos (imports rotos, pantallas que dependen de cosas que cambiarán, etc.).
   - Un plan de carpetas propuesto para la nueva app del cliente
     (pantallas, components/cliente, theme, data/mock, data/repositories, types).
4. Crea o actualiza CLAUDE.md en la raíz con una sección corta "App del cliente" que
   apunte a docs/cliente/SPEC.md y a los prototipos, y resuma las reglas:
   tokens de diseño, una sola fuente de datos mock, textos en español de México,
   respetar "reducir movimiento".

No borres nada. Termina con el plan para que yo lo apruebe.
```

---

## Prompt 1 — Fundaciones: diseño, componentes y datos 🧭

```
Lee CLAUDE.md y docs/cliente/SPEC.md (secciones 3, 4, 10 y 11).

Construye las FUNDACIONES de la nueva app del cliente, sin pantallas finales todavía:

1. Instala las librerías faltantes que acordamos (npx expo install ...) y configura lo que
   necesiten (plugin de reanimated en babel, GestureHandlerRootView, carga de fuentes
   Fraunces / Archivo / IBM Plex Mono con expo-font).
2. Tema del cliente: tokens de color, tipografía, espaciado y radios del SPEC §3,
   integrados con el ThemeContext existente (no lo rompas para otros roles).
3. Componentes compartidos del SPEC §4, cada uno en su archivo, tipados en TypeScript estricto:
   GlassTabBar, ScreenHeader, SubTabs, SegmentedControl, Card, KpiTile, Pill/Badge
   (incluye la etiqueta "de Inicio"), BottomSheet, Toast (con provider), Switch, Slider,
   Stepper, ChipGroup, ProgressRing, Bar, BarChart, LineChart, BeforeAfterSlider,
   SlideToConfirm, Stamp, RoomIllustration (placeholder con SVG).
   Deja HoloCard, FloorPlan, LayerStack y TextureSwatch para sus fases.
   Todos con accesibilidad (accessibilityRole/Label) y respetando reducir movimiento
   (useReducedMotion de reanimated).
4. Datos: tipos del SPEC §10 en types/, un módulo de datos mock ÚNICO con la persona
   Ana García y sus propiedades/proyectos, y una interfaz de repositorio
   (ClientRepository) con una implementación mock. Las pantallas solo deben hablar con
   el repositorio, para conectar Supabase después.
5. Layout del cliente: reemplaza las pestañas actuales por las 4 nuevas
   (Inicio, Mis obras, Mi hogar, Perfil) usando GlassTabBar. Cada pestaña puede mostrar
   por ahora solo su ScreenHeader. Conserva el código de market-insight, financials y
   community (no lo borres): lo moveremos en sus fases según SPEC §2.
6. Una pantalla temporal "Catálogo de componentes" (solo en desarrollo) donde se vea cada
   componente funcionando, para revisarlos en Expo.

Al terminar: corre el typecheck (npx tsc --noEmit) y arregla errores de lo que tocaste,
dime cómo verlo en Expo y resume qué hiciste.
```

---

## Prompt 2 — Inicio: Para ti y Guardado

```
Lee CLAUDE.md y SPEC.md §5.1 y §5.3. Prototipos de referencia:
05-inicio-redistribucion.html (organización final), 02-inicio-parte1.html y
03-inicio-parte2.html (detalle de cada pieza). Lee su JS para copiar comportamientos.

Construye la pestaña INICIO con 3 subpestañas (Para ti, Explorar, Guardado).
En esta fase haz Para ti y Guardado; Explorar queda con un placeholder.

Para ti, como un solo feed con secciones deslizables horizontales y buen aire entre ellas,
en el orden del SPEC §5.1:
- Asistente "¿No sabes por dónde empezar?" completo (4 preguntas, foto opcional,
  escaneo simulado con etiquetas, 3 opciones con recomendada, pedir visita / guardar).
  Reproduce la lógica de recomendación del prototipo 02.
- ¿Qué te preocupa? (atajos por necesidad que abren Explorar filtrado).
- Caben en tu casa, invitación a tu estilo (si no hay perfil), Antes y después con
  BeforeAfterSlider, Expertos cerca de ti, Guías y En tu colonia (aquí reutiliza lo útil
  de la pantalla community actual).
- Las secciones de diseñadores/muebles/acabados del feed (Hecho a mano, Aprende en 30 s,
  Oficios que no conocías, Caja de muestras) pueden quedar como tarjetas que abren
  Explorar; se completan en la fase 4.

Guardado: tableros con mosaico y costo sumado, compartir, convertir en proyecto, y
comparar dos ideas lado a lado (prototipo 03).

Al tocar una idea, por ahora abre un BottomSheet sencillo con título, imagen y precio;
la hoja completa se hace en la siguiente fase.

Todo desde ClientRepository. Al terminar: typecheck y resumen.
```

---

## Prompt 3 — Hoja de idea con sus herramientas 🧭

```
Lee SPEC.md §5.4 y §9 (flujo 1). Prototipos: 03-inicio-parte2.html (En tu casa,
En tu plano, Cómo se vive, Pagarlo, Quién lo hace), 04-inicio-parte3.html (Luz y color,
Cómo se construye) y 02-inicio-parte1.html (nivel de acabados, compra el look).

Construye la HOJA DE IDEA (BottomSheet grande) con pestañas contextuales: solo aparecen
las herramientas que la idea declara en su campo `tools`.

- En tu casa: BeforeAfterSlider sobre la foto del cliente con 3 estilos que cambian precio.
- En tu plano: plano SVG con medidas, qué cabe y advertencias.
- Luz y color: escena del cuarto con pintura, piso y focos; slider de hora 7:00–22:00 que
  mueve el sol según la orientación; consejos según el color; litros de pintura.
  Usa Skia si quedó instalado; si no, SVG con capas y opacidades.
- Cómo se construye: componente LayerStack (capas isométricas en SVG que se separan con
  un slider, tocar una capa muestra material, grosor, $/m² y oficio) + pasos día por día
  + "qué revisa BuildI". Incluye las 3 ideas del prototipo 04.
- Cómo se vive: medidores de ruido/polvo/molestia y semana por semana.
- Pagarlo: nivel de acabados Básico/Medio/Premium (factores 0.85/1/1.4) que recalcula
  precios, enganche y plazo con mensualidad, otras formas de pago.
- Quién lo hace: diseñador, equipo, taller, y "Compra el look / solo los muebles".
Botones fijos abajo: Guardar y "Hazlo con BuildI", que crea un proyecto en Mis obras
(etapa idea) a través del repositorio y lleva al usuario ahí.

Al terminar: typecheck y resumen.
```

---

## Prompt 4 — Explorar: espacios, muebles, acabados y diseñadores 🧭

```
Lee SPEC.md §5.2. Prototipo: 06-inicio-disenadores-muebles-acabados.html — lee todo su
JS: ahí están los datos completos (TRADES con 53 oficios y su grupo, FURN con 10 espacios
y sus muebles, MATS, FIN con 10 familias de acabados, DES con diseñadores).

1. Pasa esos catálogos al módulo de datos mock (tipados), no los copies dentro de pantallas.
2. Explorar con SegmentedControl de 4 modos: Espacios, Muebles, Acabados, Diseñadores,
   más el filtro por necesidad.
3. Muebles: rejilla de íconos por espacio; hoja de mueble con materiales y pros/contras,
   medida que cabe según el plano, y dos caminos con precio (hecho / a medida) con los
   talleres que lo hacen.
4. Acabados: lista con TextureSwatch (crea el componente; texturas procedurales con Skia
   o, si no hay, imágenes/gradientes), $/m², resistencia, mantenimiento; hoja con dónde sí
   / dónde no, costo en un cuarto de 22 m², quién lo instala, agregar a la caja de muestras.
5. Diseñadores: chips por oficio (53) y por grupo; tarjetas con portafolio, calificación,
   distancia y entrega; perfil con el encargo a medida en 3 pasos y su seguimiento de
   6 etapas (solicitud → visita → boceto → render 3D → fabricación → instalación) con
   pago 40/60 y garantía a Mi hogar.
6. Completa en Para ti las secciones de la fase 2 que quedaron como tarjetas.

Al terminar: typecheck y resumen.
```

---

## Prompt 5 — Mis obras 🧭

```
Lee SPEC.md §6 y §9. Prototipo principal: 07-mis-obras.html (lee su JS: estados,
aprobación de cambios, pago deslizando la llave, chat, visitas). Las partes movidas desde
Inicio están en 03-inicio-parte2.html ("Cómo se vive") y 04-inicio-parte3.html
("Lo que revisa BuildI"). La pantalla financials actual se integra en Dinero.

Construye MIS OBRAS:
- Selector de obra y barra de etapa (idea → diagnóstico → diseño → presupuesto → obra →
  entrega → hogar). El Resumen cambia lo primero que muestra según la etapa (tabla del
  prototipo 07).
- Subpestañas Resumen, Avance, Dinero, Decisiones, Documentos, Equipo, con todo lo del
  SPEC §6, incluyendo "Esta semana en casa", "Quién está hoy en tu casa" y
  "Revisiones de BuildI con foto".
- Aprobar un cambio en Decisiones actualiza el total en Dinero y la fecha de entrega
  (el ejemplo "Ventana de piso a techo" suma $38,400 y 6 días). Al aprobar cae el Stamp.
- Pagar con SlideToConfirm.
- El proyecto creado desde una idea (fase 3) aparece aquí con su etapa.
- Etiqueta "de Inicio" en lo que viene de la hoja de idea.

Al terminar: typecheck y resumen.
```

---

## Prompt 6 — Mi hogar 🧭

```
Lee SPEC.md §7 y §9. Prototipo principal: 08-mi-hogar.html (lee su JS). Piezas movidas
desde Inicio: 04-inicio-parte3.html (acomodar muebles en el plano y Plan a 5 años).
La pantalla market-insight actual se integra en Valor.

Construye MI HOGAR:
- Selector de propiedad y subpestañas Resumen, Mantenimiento, Uso, Reparaciones,
  Expediente, Valor, con todo lo del SPEC §7.
- Reparaciones: tocar un cuarto en el plano SVG → tipo de problema → garantía → horario →
  seguimiento del técnico en 4 estados.
- Plan Hogar: al activarlo sube la salud del hogar.
- Expediente › Tu plano: componente FloorPlan con muebles arrastrables (gesture-handler),
  girar/quitar, detección de choques, puerta y paso de 60 cm, catálogo y total.
  Tus colores abre la herramienta Luz y color de la fase 3.
- Valor: gráfica, mejoras con ROI, Plan a 5 años con presupuesto anual y prioridad
  (lógica del prototipo 04: lo urgente primero, acomodo por año, gráfica de valor).
  El presupuesto anual y la prioridad se leen de Preferences (Perfil).
- La alerta de fuga en Resumen lleva a Reparaciones con el baño marcado.

Al terminar: typecheck y resumen.
```

---

## Prompt 7 — Perfil 🧭

```
Lee SPEC.md §8 y §9. Prototipos: 09-perfil.html (lee su JS) y 10-home-key.html
(llave holográfica). La pantalla profile actual se reemplaza; conserva lo útil
(cerrar sesión, datos de cuenta, AuthContext).

Construye PERFIL con encabezado y subpestañas Yo, Familia, Pagos, Ajustes:
- Yo: componente HoloCard (Home Key) que se inclina con el dedo, se voltea con un toque y
  atrás tiene "Abrir" que se mantiene presionado 1 s con anillo de progreso y háptica.
  Sin efecto holográfico si está "reducir movimiento". Mis casas, Mi estilo (paleta, mezcla,
  volver a jugar con el juego de tarjetas deslizables del prototipo 03), Cómo trabajo con
  BuildI, Mi reputación como cliente, guardados.
- Familia: personas con 6 permisos en BottomSheet, regla de dos firmas con monto,
  llaves temporales con horario y código, cancelar, contacto si algo me pasa.
- Pagos: dinero protegido con desglose, financiamiento, métodos, Face ID para pagar,
  facturas, Plan Hogar, invita a tus vecinos.
- Ajustes: notificaciones por tema con horario silencioso (pagos siempre activas),
  privacidad, quién vio qué, sesiones, Texto grande (escala la app de verdad),
  Menos movimiento, idioma, asesora.
- Preferences y StyleProfile se guardan en el repositorio y Inicio/Mi hogar los usan.
- La regla de dos firmas se aplica en las aprobaciones y pagos de Mis obras.

Al terminar: typecheck y resumen.
```

---

## Prompt 8 — Ciclo completo y pulido final

```
Lee SPEC.md §1, §2 y §9 y el prototipo 01-ciclo-completo.html.

Revisa la app del cliente de punta a punta como si fueras Ana García:
1. Recorre los 7 flujos del SPEC §9 y arregla lo que no esté conectado.
2. Verifica las 8 etapas del ciclo: cada una debe tener un lugar claro en la app.
   Agrega lo que falte en pequeño (por ejemplo la entrega: lista de pendientes, acta,
   llave → la obra pasa a Mi hogar).
3. Consistencia visual contra los prototipos: tipografías, colores, radios, espacios,
   estados vacíos, cargando y error.
4. Accesibilidad: etiquetas, tamaños táctiles de 44 px, contraste, Texto grande,
   reducir movimiento.
5. Elimina la pantalla temporal "Catálogo de componentes" o déjala solo en desarrollo.
6. Confirma que market-insight, financials y community quedaron integradas y que no
   quedó código muerto ni imports rotos.
7. Typecheck limpio.

Entrégame una lista de lo que corregiste y de lo que queda pendiente para conectar
Supabase (qué tablas y qué métodos del repositorio).
```

---

## Consejos

- Si una fase se pone muy grande, divídela: "solo haz Resumen y Avance de Mis obras".
- Si el resultado se ve distinto al prototipo, pídelo así: *"Compara con 07-mis-obras.html, sección Decisiones, y ajusta espaciado, tipografía y la animación del sello para que se parezca."*
- Pide capturas o abre Expo en tu teléfono después de cada fase.
- Los montos, nombres y precios son de ejemplo: no deben mostrarse como datos reales.
