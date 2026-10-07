# Contratista de mano de obra · Supabase

Frentes, Cuadrillas (con gafete) y Perfil leen y escriben en Supabase. No hay datos escritos en el código.

## 1. Instalar paquetes

En tu proyecto local (este repo no tiene `package.json`):

```bash
npx expo install react-native-qrcode-svg react-native-svg expo-camera
```

`app.json` ya trae el plugin de `expo-camera` con el texto del permiso de cámara. Instala los paquetes antes de correr la app; si no, Expo no encuentra el plugin.

`@supabase/supabase-js` ya lo usa `lib/supabase.ts`.

## 2. Aplicar la migración

Archivos, en este orden:

1. `supabase/migrations/20261007120000_chief_of_labor.sql`
2. `supabase/migrations/20261007140000_badge_scans.sql` (escaneos y registro de entrada)

- Con Supabase CLI: `supabase db push`
- O cópialos completos en **SQL Editor** de tu proyecto en Supabase y ejecútalos.

Se puede ejecutar más de una vez sin errores. Crea:

| Tabla / función | Para qué |
|---|---|
| `labor_contractors`, `labor_contractor_metrics` | El contratista y los datos de su nivel BuildI Pro |
| `labor_sites`, `labor_crews`, `labor_workers`, `labor_worker_sites`, `labor_attendance` | Obras, cuadrillas, trabajadores, historial de obras y pase de lista |
| `labor_courses`, `labor_credentials`, `labor_enrollments` | Catálogo de cursos, constancias (BuildI, DC-3, CONOCER) e inscripciones |
| `labor_recommendation_actions` | "Inscribir" / "Después" en las recomendaciones del gafete |
| `labor_fronts`, `labor_front_members`, `labor_front_progress`, vista `labor_fronts_summary` | Frentes a destajo, quién trabaja en cada uno y avance diario |
| `labor_quote_catalog`, `labor_quotes` | Conceptos con precio de referencia de la zona y cotizaciones enviadas |
| `labor_compliance_docs` | Expediente de cumplimiento (REPSE, IMSS, Infonavit, SAT, contrato) |
| `labor_benefits`, `labor_benefit_requests` | Beneficios por nivel y solicitudes |
| `labor_record_progress()` | Guarda el avance del día y marca el frente terminado si se completa |
| `labor_verify_badge(code)` | Lo que ve el residente al escanear el gafete desde la app de constructor |
| `labor_seed_demo()` | Crea "Mano de Obra Pérez" de ejemplo para el usuario que la llama |
| `labor_badge_scans` | Cada escaneo de gafete: quién lo escaneó, qué vio y si registró la entrada |
| `labor_scan_badge(code)` | Verifica, deja registro y devuelve las obras del contratista |
| `labor_check_in(scan, obra)` | Registra la entrada a la obra y marca presente en el pase de lista |

**Seguridad (RLS):** cada contratista solo ve y modifica lo suyo; los catálogos los lee cualquier usuario con sesión. Ninguna función se puede llamar sin sesión. `labor_verify_badge` solo devuelve nombre, oficio, nivel, IMSS, negocio y constancias (sin teléfono ni correo).

Si ya habías corrido una versión anterior de esta migración, vuelve a correrla: quita el acceso sin sesión a las funciones.

## 3. Dónde van los archivos

En este repo todo está en la raíz; en tu proyecto van donde ya los importa el código:

| Archivo en el repo | En tu proyecto | Se importa como |
|---|---|---|
| `ChiefOfLaborService.ts` | `app/services/` | `@/app/services/ChiefOfLaborService` |
| `LaborDataState.tsx` | `app/components/` | `@/app/components/LaborDataState` |
| `BadgeVerificationCard.tsx`, `BadgeScanResult.tsx`, `GafeteScannerModal.tsx` | `app/components/` | `@/app/components/…` y `../components/…` |
| `chief-of-labor/*.tsx` | `app/chief-of-labor/` | rutas de expo-router |
| `builder/workforce.tsx` | `app/builder/` | pestaña de mano de obra del constructor |
| `gafete/[code].tsx` | `app/gafete/` | destino del enlace del QR |

El servicio usa `@/app/lib/supabase`, igual que `LaborSupabaseService.ts`.

## 4. Probar

1. Inicia sesión en la app con cualquier usuario.
2. Abre la pestaña de Cuadrillas, Frentes o Perfil: aparece "Aún no tienes cuadrillas".
3. Toca **Cargar datos de ejemplo**. Llama a `labor_seed_demo()` y carga 3 cuadrillas, 24 trabajadores, 2 obras, 7 frentes y su expediente.

## 5. QR del gafete

El QR codifica `construction-operations-management://gafete/BLD-…` (el esquema de la app). No hace falta página web: el residente o supervisor lo verifica con la app de constructor, con sesión iniciada.

- **Desde la app:** pestaña de mano de obra del constructor → botón **Escanear gafete**. Lee el QR con la cámara o se escribe el código a mano.
- **Con la cámara del teléfono:** el enlace abre BuildI en `gafete/[code]` y muestra lo mismo.

Muestra si el gafete es válido, IMSS, si puede trabajar en alturas (DC-3 NOM-009) y cada constancia con folio y si está vigente, por renovar o vencida.

**Registro de entrada:** después de escanear, el residente elige la obra y toca **Registrar entrada**. El trabajador queda presente en el pase de lista del contratista (Frentes lo cuenta como presente). Solo se puede registrar en obras de ese contratista y hasta 2 horas después de escanear. Sin IMSS o sin DC-3 de alturas, la app lo avisa como recomendación; no bloquea.

**Historial:** debajo del lector, "Escaneos de hoy" con cada persona, hora, obra y pendientes (sin IMSS, sin alturas, constancias vencidas).

**Lado del contratista:** en el gafete de su trabajador ve "Entrada registrada hoy · 7:02 · Torre Alameda" o "Verificado en obra". Cada contratista solo ve los escaneos de su gente; cada residente, los suyos.

## Pendiente

- **Subir archivos:** "Renovar" en el expediente solo mueve la fecha de vencimiento 30 días. Falta subir el PDF a Supabase Storage (`file_url`) y que alguien lo valide.
- **Métricas del nivel:** `labor_contractor_metrics` se llena a mano o con el ejemplo. Falta el proceso semanal que las calcule con estimaciones firmadas, ajustes del residente y calificaciones.
- **Fechas:** "hoy" se calcula en UTC (servidor y app). Para el pase de lista nocturno en México conviene guardar la zona horaria de la obra.
