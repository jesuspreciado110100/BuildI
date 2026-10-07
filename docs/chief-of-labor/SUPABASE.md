# Contratista de mano de obra · Supabase

Inicio, Frentes, Cuadrillas (con gafete) y Perfil leen y escriben en Supabase con los datos reales de BuildI. No hay datos de ejemplo:

- **Las obras son tus proyectos reales** (`projects`). El contratista busca la obra y la liga; de ahí cuelgan sus frentes, su pase de lista y las entradas que registra el residente.
- **Los frentes salen del catálogo de conceptos de la obra** (`catalog_items`), sin los precios de la constructora.
- **El alta del contratista** toma su nombre, negocio, ciudad y teléfono de `users`.
- **Cada obra guarda su zona horaria** en `projects.timezone`. "Hoy" es el día en la obra, no el del servidor (UTC).

## 1. Instalar paquetes

En tu proyecto local (este repo no tiene `package.json`):

```bash
npx expo install react-native-qrcode-svg react-native-svg expo-camera
```

`app.json` ya trae el plugin de `expo-camera` con el texto del permiso de cámara.

## 2. Aplicar las migraciones

En este orden:

1. `supabase/migrations/20261007120000_chief_of_labor.sql`: obras, zona horaria, contratista, cuadrillas, gente, pase de lista, frentes, cotizaciones, expediente, beneficios y nivel BuildI Pro.
2. `supabase/migrations/20261007130000_labor_training.sql`: cursos, sesiones, inscripciones, evaluaciones, evidencias y constancias (ver [CURSOS.md](CURSOS.md)).
3. `supabase/migrations/20261007140000_badge_scans.sql`: escaneo del gafete y registro de entrada.

Formas de aplicarlas:

- Con Supabase CLI: `supabase db push`.
- En el **SQL Editor** de tu proyecto en Supabase: pega cada archivo completo y ejecútalo.
- Con el conector de Supabase en Claude: así las aplico yo directamente.

Se pueden volver a correr sin errores.

### Si corriste la versión anterior

La versión anterior (obras sueltas y "Cargar datos de ejemplo") solo tenía datos de ejemplo. Si la corriste, la primera migración se detiene con un aviso. Bórrala en el SQL Editor y vuelve a correr las tres:

```sql
drop table if exists labor_badge_scans, labor_benefit_requests, labor_benefits, labor_compliance_docs, labor_quotes,
  labor_quote_catalog, labor_front_progress, labor_front_members, labor_fronts, labor_recommendation_actions,
  labor_enrollments, labor_credentials, labor_courses, labor_attendance, labor_worker_sites, labor_workers,
  labor_crews, labor_sites, labor_contractor_metrics, labor_contractors cascade;
drop function if exists labor_seed_demo(), labor_verify_badge(text), labor_record_progress(uuid, numeric, text),
  labor_scan_badge(text), labor_check_in(uuid, uuid), labor_my_contractor_id() cascade;
```

### Lo que cambia en tus tablas

| Tabla | Cambio |
|---|---|
| `projects` | Columna nueva `timezone`. Un trigger la llena al crear o editar un proyecto si viene vacía, y la migración la llena una vez en los que ya existen. Ese llenado toca cada proyecto una vez, así que su `updated_at` cambia. |

Nada más se modifica en tus tablas. `catalog_items` y `users` solo se leen.

### Cómo se calcula la zona horaria de una obra

`labor_guess_timezone()` usa, en este orden:

1. **Coordenadas** (`latitude`, `longitude`).
2. **Código postal** que venga en `location` (los dos primeros dígitos dicen el estado).
3. **Ciudad o estado** en las últimas partes de la dirección. No toma la calle: "Av. Baja California 245, Roma Sur, CDMX" queda en hora del centro.

Las zonas desde 2022:

- Casi todo México: UTC-6 sin horario de verano.
- Quintana Roo: UTC-5.
- Sonora, Sinaloa, BCS y Nayarit: UTC-7.
- Baja California: UTC-8 con horario de verano.
- Franja fronteriza: cambia de horario con Estados Unidos.

Si la zona sale mal, se corrige editando `projects.timezone` con un nombre IANA (por ejemplo `America/Cancun`). El trigger respeta cualquier zona válida.

## 3. Tablas y funciones

| Tabla / función | Para qué |
|---|---|
| `labor_contractors` | El contratista. RFC y razón social van en las DC-3. Incluye su raya promedio, que solo ve él. |
| `labor_contractor_metrics` | Entregas a tiempo, ajustes del residente y calificación. Solo se escriben con la llave de servicio; `null` = sin datos. |
| `labor_admins` | Personal de BuildI que revisa expedientes y constancias externas. Se da de alta desde el panel. |
| `labor_sites` | Liga contratista ↔ `projects`. Desligar = `active false`; el historial se queda. |
| `labor_my_sites()` | Obras del contratista con nombre, dirección, constructora, zona horaria y fecha de hoy en la obra. |
| `labor_link_project(id)` | Ligar un proyecto (solo los que el usuario puede ver). |
| `labor_site_concepts(obra)` | Conceptos del catálogo de la obra **sin precios** de la constructora. |
| `labor_crews`, `labor_workers` | Cuadrillas (con su obra) y gente. Las iniciales y el código del gafete los pone el servidor. La CURP es opcional y va en la DC-3. |
| `labor_attendance` | Pase de lista con el día de la obra. `source = 'scan'` cuando lo registró el residente; el contratista ya no lo cambia. |
| `labor_mark_attendance()` | Pase de lista del contratista. |
| `labor_worker_site_days` (vista) | Obras donde ha trabajado cada persona, de su asistencia real. Se muestra en el gafete. |
| `labor_fronts`, `labor_front_members`, `labor_front_progress`, `labor_fronts_summary` | Frentes a destajo con referencia al concepto del catálogo, gente y avance diario. "Esta semana" empieza el lunes en la hora de la obra. |
| `labor_record_progress()` | Guarda el avance del día de la obra y marca el frente terminado. |
| `labor_quotes` | Propuestas a destajo. La constructora dueña de la obra las ve y decide con `labor_decide_quote()`. La raya y la utilidad no se guardan. |
| `labor_compliance_docs` | Expediente. La vigencia la calcula el servidor: opiniones de cumplimiento 30 días, REPSE 3 años. Queda **en revisión** hasta que BuildI lo valide con `labor_review_compliance_doc()`. |
| `labor_my_score()` | Puntaje y nivel BuildI Pro. Se calcula en el servidor porque cambia precios y beneficios. |
| `labor_benefits`, `labor_request_benefit()` | Beneficios por nivel. Solo se piden los que el nivel ya desbloqueó. |
| `labor_badge_scans`, `labor_scan_badge()`, `labor_check_in()` | Escaneo del gafete y entrada a la obra, con la hora de la obra. |

**Seguridad.** Todas las tablas `labor_*` tienen RLS:

- Cada contratista ve y cambia solo lo suyo.
- La constructora ve qué contratistas ligaron su obra y las cotizaciones que le mandan.
- El residente solo ve sus propios escaneos.
- La app solo puede escribir las columnas que le tocan. Las fechas de alta, el estado de revisión, el estado de cotizaciones y solicitudes y las métricas no se pueden escribir desde el teléfono, porque cambiarían el nivel y los precios.
- Ninguna función se puede llamar sin sesión.

**Si tus proyectos son privados** (RLS de `projects` que solo deja verlos a su constructora), el contratista no los encuentra en "Agregar obra". Las obras ya ligadas siguen funcionando. En ese caso conviene agregar una invitación de la constructora al contratista.

## 4. Dónde van los archivos

En este repo todo está en la raíz. En tu proyecto van donde ya los importa el código:

| Archivo en el repo | En tu proyecto |
|---|---|
| `ChiefOfLaborService.ts` | `app/services/` |
| `LaborDataState.tsx`, `LaborSheets.tsx` | `app/components/` |
| `BadgeVerificationCard.tsx`, `BadgeScanResult.tsx`, `GafeteScannerModal.tsx` | `app/components/` |
| `chief-of-labor/*.tsx` | `app/chief-of-labor/` |
| `builder/workforce.tsx` | `app/builder/` |
| `gafete/[code].tsx` | `app/gafete/` |

## 5. Primer uso

1. Inicia sesión y abre la app del contratista. Aparece **Crea tu perfil de contratista** con tus datos de BuildI ya llenos.
2. **Frentes → Agregar obra.** Busca el proyecto y agrégalo. Arriba se ve la constructora y la hora de la obra.
3. **Cuadrillas → +.** Crea la cuadrilla con su obra (y si trabaja en altura). Luego da de alta a tu gente; cada persona recibe su gafete con QR.
4. **Pase de lista** en cada cuadrilla. Se guarda con el día de la obra.
5. **Frentes → Nuevo frente.** Elige el concepto del catálogo de la obra, pon tu precio a destajo, el rendimiento y quién trabaja.
6. **Perfil.** Tu nivel parte de 0 y sube con datos reales. Registra tu expediente: cuenta cuando BuildI lo revisa. Agrega tu RFC para las DC-3.

## 6. QR del gafete

El QR codifica `construction-operations-management://gafete/BLD-…`. El residente o supervisor lo verifica con la app de constructor, con sesión iniciada:

- **Desde la app:** pestaña de mano de obra del constructor → **Escanear gafete**.
- **Con la cámara del teléfono:** el enlace abre BuildI en `gafete/[code]`.

Muestra si el gafete es válido, el IMSS, si puede trabajar en alturas (DC-3 NOM-009 vigente) y las constancias válidas. Las constancias por revisar o revocadas no aparecen.

**Registro de entrada.** El residente elige la obra (primero salen las suyas) y toca **Registrar entrada**. El trabajador queda presente en el pase de lista del contratista con el día y la hora de la obra.

## Pendiente

- **Subir archivos:** los buckets privados (`labor-docs`, `labor-evidence`, `labor-certificates`) y sus permisos ya están en la migración. Falta la pantalla para tomar o elegir el PDF o la foto y subirlo.
- **Revisión de BuildI:** `labor_review_compliance_doc()` y `labor_review_certificate()` ya existen. Falta la pantalla del personal de BuildI.
- **Métricas del nivel:** falta el proceso que llene `labor_contractor_metrics` con estimaciones firmadas, ajustes del residente y calificaciones.
- **Invitar contratistas:** si tus proyectos son privados, falta que la constructora invite al contratista a su obra.
