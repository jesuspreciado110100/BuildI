# Cursos y constancias · modelo de datos

Migración: `supabase/migrations/20261007130000_labor_training.sql` (va después de `20261007120000_chief_of_labor.sql`).

## Tres tipos de constancia

| Tipo | Quién la emite | Cómo se gana | Folio |
|---|---|---|---|
| **Constancia BuildI** | BuildI | Clases y examen en la app, más prueba práctica en obra que valida el residente con foto | `BLD-2026-000123` (lo genera BuildI) |
| **DC-3 (STPS)** | Agente capacitador externo con registro ante la STPS | Curso presencial con pase de lista e identificación, y evaluación del instructor | El del agente o `DC3-2026-000124` |
| **Certificado CONOCER** | CONOCER, a través de un centro de evaluación acreditado | Evaluación práctica en obra con fotos, video e identificación | El que da CONOCER (obligatorio) |

## Tablas

| Tabla | Qué guarda |
|---|---|
| `labor_training_providers` | Quién capacita o evalúa: BuildI, agentes capacitadores (con su registro STPS) y centros de evaluación CONOCER (con su acreditación). |
| `labor_provider_staff` | Usuarios de BuildI que trabajan para un proveedor: instructor, evaluador o coordinador. |
| `labor_courses` | Catálogo. Incluye: tipo, proveedor, horas, si pide examen o práctica, evidencia obligatoria, área temática STPS, estándar CONOCER, calificación mínima, vigencia, precio y descuento por nivel. |
| `labor_course_lessons` | Clases en video de los cursos en la app. |
| `labor_quiz_questions` | Preguntas del examen. La respuesta correcta nunca sale a la app. |
| `labor_course_sessions` | Fechas de los cursos presenciales: sede o la obra, instructor, cupo, estado y **zona horaria**. |
| `labor_enrollments` | Una fila por lugar: persona, lugar apartado sin nombre o el propio contratista. Guarda el nivel, el precio de lista, el descuento y el monto al inscribir, además de la asistencia y el avance de las clases. |
| `labor_lesson_progress` | Qué clases vio cada inscripción. |
| `labor_evaluations` | Examen (calificado por la app) o práctica (registrada por instructor, evaluador o residente), con calificación, notas, obra y ubicación. |
| `labor_evidence` | Fotos, video, INE, lista de asistencia o firma, con ruta en Storage, huella SHA-256, ubicación y hora. |
| `labor_certificates` | La constancia: folio, código para el QR (`CRT-…`), fechas de emisión y vencimiento, quién la emitió, PDF, lo que lleva impreso (`details`) y estado: válida, por revisar, rechazada o revocada. |

## Reglas que cuida la base de datos

- **Nadie se evalúa a sí mismo.** El contratista no puede registrar evaluaciones de su gente. Evalúa el instructor o evaluador del proveedor del curso, o el residente (constructora de una obra ligada al contratista), y el residente solo en constancias BuildI.
- **No hay constancia sin requisitos.** `labor_enrollment_missing()` dice qué falta: examen aprobado, práctica aprobada, asistencia (si hubo sesión) y cada evidencia obligatoria del curso.
- **La DC-3 exige sus datos:**
  - CURP del trabajador.
  - RFC y razón social del patrón (el contratista).
  - Registro STPS del agente capacitador.
  - Horas del curso.
  - Periodo, que sale de la sesión.

  Lo que va impreso queda guardado en `details`.
- **Cupo y precio en el servidor.** `labor_enroll()` bloquea la sesión mientras revisa el cupo. El precio sale del nivel BuildI Pro calculado en el servidor, no de lo que mande el teléfono.
- **Examen.** Se califica en el servidor y permite máximo 3 intentos por día. La constancia BuildI sale sola cuando ya está todo (`labor_try_auto_issue()`).
- **Constancias de fuera.** `labor_add_external_certificate()` las deja **por revisar**. No aparecen al escanear el gafete ni cuentan para "puede trabajar en alturas" hasta que BuildI las valida con `labor_review_certificate()`.
- **Revocar.** `labor_revoke_certificate()` la puede usar el coordinador o evaluador del proveedor, o BuildI, siempre con motivo. Al verificarla dice "revocada".
- **Archivos privados.** Los buckets `labor-evidence`, `labor-certificates` y `labor-docs` guardan con la ruta `<contratista>/<inscripción>/<archivo>`. Ve los archivos el contratista dueño, quien evalúa esa inscripción, el proveedor del curso y BuildI.
- **Todo se escribe con funciones.** La app no puede insertar ni cambiar estas tablas directo.

## Flujos

**Curso BuildI en la app** (ej. Seguridad básica):

1. `labor_enroll` (gratis).
2. Clases con `labor_complete_lesson`.
3. Examen: `labor_course_quiz` y luego `labor_submit_quiz`.
4. El residente valida la práctica en obra con `labor_record_evaluation`.
5. Evidencia (selfie y foto) con `labor_add_evidence`.
6. La constancia sale sola: vence en 2 años y aparece en el gafete.

**DC-3** (alturas, NOM-031, NOM-017):

1. El coordinador del agente capacitador crea la sesión.
2. El contratista inscribe a su gente con `labor_enroll`. Elige la fecha si hay; si no, aparta el lugar.
3. El instructor pasa lista con `labor_mark_session_attendance`.
4. El instructor evalúa con `labor_record_evaluation`.
5. Se suben la lista de asistencia y la identificación.
6. El instructor emite con `labor_issue_certificate`. Vence en 1 año.

**CONOCER** (albañil):

1. El evaluador evalúa en obra con fotos, video e identificación.
2. Cuando CONOCER da el folio, el centro de evaluación lo registra con `labor_issue_certificate(inscripción, folio)`.

**Verificar:**

- El gafete (`labor_verify_badge`) muestra solo las constancias válidas.
- El QR de una constancia impresa (`labor_verify_certificate('CRT-…')`) dice si es válida, está vencida o fue revocada.

## Precios

- Los cursos BuildI son gratis.
- DC-3 y CONOCER quedan con `price = null` ("Por confirmar") y sin proveedor hasta firmar con los aliados. Mientras, el contratista puede apartar lugar.
- El descuento por nivel ya está configurado: en DC-3, 50% en Plata y gratis en Oro; en CONOCER, 25% y 50%.

Para dar de alta un aliado (SQL Editor, como administrador):

```sql
insert into labor_training_providers (kind, name, legal_name, stps_registry)
values ('agente_capacitador', 'Nombre comercial', 'Razón social SA de CV', 'REGISTRO-STPS')
returning id;

insert into labor_provider_staff (provider_id, user_id, role, full_name)
values ('<id del proveedor>', '<auth.users.id del instructor>', 'instructor', 'Nombre del instructor'),
       ('<id del proveedor>', '<auth.users.id del instructor>', 'coordinador', 'Nombre del instructor');

update labor_courses set provider_id = '<id del proveedor>', price = 950 where id = 'alturas';
```

El personal de BuildI que revisa constancias y expedientes va en `labor_admins`.

## Lo que ya usa la app

- **Perfil → Cursos:**
  - Precio según tu nivel ("Gratis" o "Por confirmar").
  - Fechas con lugares (`labor_open_sessions`).
  - Inscribir por nombre o apartar lugar.
  - Cuántos de tu cuadrilla ya la tienen vigente.
- **Gafete:**
  - Constancias válidas y por revisar, con vigencia.
  - Recomendaciones de alturas, de renovar y de seguridad básica, con inscripción ahí mismo.
- **Frentes:** recomendación de alturas para quien va a un frente en altura sin la DC-3 vigente, con inscripción ahí mismo.

## Falta para cerrar el ciclo

- Pantalla del instructor y evaluador: sus sesiones, pase de lista, evaluación con fotos y emitir.
- Captura y subida de evidencias desde la cámara a Storage.
- Reproductor de clases y examen en la app.
- PDF de la DC-3 con los datos de `details`.
- Pantalla de BuildI para revisar constancias externas y expedientes.
- Cobro de los cursos con precio.
