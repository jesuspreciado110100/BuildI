-- BuildI · Capacitación de la mano de obra
-- Cursos, sesiones, inscripciones, evaluaciones, evidencias y constancias.
--
-- Tres tipos de constancia:
--   · Constancia BuildI: la emite BuildI. Curso en la app con examen y, si el
--     curso lo pide, prueba práctica en obra validada por el residente.
--   · DC-3: la emite un agente capacitador externo registrado ante la STPS.
--     Curso presencial con lista de asistencia y evaluación del instructor.
--   · Certificado CONOCER: evaluación práctica con un evaluador de un centro
--     de evaluación acreditado; el folio lo da CONOCER.
--
-- Reglas que cuida la base de datos:
--   · Nadie se evalúa a sí mismo: el contratista no registra evaluaciones de
--     su gente. Lo hace el instructor o evaluador del curso, o el residente
--     de una de sus obras (solo constancias BuildI).
--   · Una constancia solo se emite con las evaluaciones aprobadas, la
--     asistencia y la evidencia que pide el curso.
--   · Cada constancia tiene folio, vigencia, código para verificarla con QR
--     y se puede revocar.
--   · Las constancias que el contratista sube de fuera quedan "por revisar"
--     y no cuentan hasta que BuildI las valida.
--   · El precio sale del nivel BuildI Pro calculado en el servidor.
--
-- Requiere 20261007120000_chief_of_labor.sql. Los archivos van en Storage
-- (buckets privados labor-evidence, labor-certificates y labor-docs).

-- ─────────────────────────── Quién capacita ───────────────────────────

create table if not exists public.labor_training_providers (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('buildi', 'agente_capacitador', 'centro_evaluacion')),
  name text not null,
  legal_name text,
  rfc text,
  stps_registry text,          -- registro de agente capacitador externo ante la STPS (va en la DC-3)
  conocer_accreditation text,  -- acreditación del centro de evaluación ante CONOCER
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Usuarios de BuildI que trabajan para un proveedor: instructores,
-- evaluadores y coordinadores (programan sesiones y emiten constancias).
create table if not exists public.labor_provider_staff (
  provider_id uuid not null references public.labor_training_providers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('instructor', 'evaluador', 'coordinador')),
  full_name text not null,
  evaluator_code text,         -- cédula de evaluador CONOCER, si aplica
  active boolean not null default true,
  primary key (provider_id, user_id, role)
);

-- BuildI emite sus propias constancias.
insert into public.labor_training_providers (id, kind, name)
values ('00000000-0000-4000-8000-00000000b11d', 'buildi', 'BuildI')
on conflict (id) do nothing;

-- ─────────────────────────── Cursos ───────────────────────────

create table if not exists public.labor_courses (
  id text primary key,
  title text not null,
  credential_type text not null check (credential_type in ('buildi', 'dc3', 'conocer')),
  provider_id uuid references public.labor_training_providers(id),  -- null = aliado por confirmar
  audience text not null check (audience in ('crew', 'contractor')),
  delivery text not null check (delivery in ('app', 'presencial', 'en_obra')),
  hours numeric(5,1),          -- duración (va en la DC-3)
  hours_label text not null,
  modality text not null,      -- cómo se le muestra al contratista
  price numeric(10,2) check (price >= 0), -- precio de lista por persona; null = por confirmar con el aliado
  discount_by_level jsonb not null default '{"bronce": 0, "plata": 0, "oro": 0}',
  renew_years int check (renew_years > 0), -- null = no vence
  passing_score int not null default 80 check (passing_score between 1 and 100),
  requires_quiz boolean not null default false,
  requires_practical boolean not null default false,
  required_evidence text[] not null default '{}',
  stps_area text,              -- área temática del catálogo de la STPS (DC-3)
  conocer_standard text,       -- clave del estándar de competencia que se evalúa (CONOCER)
  recommended_for text,
  active boolean not null default true,
  sort int not null default 0,
  check (required_evidence <@ array['selfie', 'id_document', 'photo', 'video', 'attendance_sheet', 'signature', 'document'])
);

-- Clases en video de los cursos en la app.
create table if not exists public.labor_course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.labor_courses(id) on delete cascade,
  sort int not null,
  title text not null,
  video_path text,             -- Storage, bucket labor-training
  duration_min int check (duration_min > 0),
  unique (course_id, sort)
);

-- Examen de los cursos en la app. La respuesta correcta nunca sale a la app:
-- las preguntas se leen con labor_course_quiz() y se califican en el servidor.
create table if not exists public.labor_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.labor_courses(id) on delete cascade,
  sort int not null,
  prompt text not null,
  image_path text,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  answer_index int not null check (answer_index >= 0),
  unique (course_id, sort)
);

-- ─────────────────────────── Sesiones ───────────────────────────

-- Fechas de los cursos presenciales y evaluaciones (grupo con sede, instructor y cupo).
create table if not exists public.labor_course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.labor_courses(id),
  provider_id uuid not null references public.labor_training_providers(id),
  instructor_user_id uuid references auth.users(id),
  instructor_name text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Mexico_City',
  venue_name text,
  address text,
  project_id uuid references public.projects(project_id) on delete set null, -- si se da en una obra
  capacity int not null check (capacity > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (public.labor_valid_timezone(timezone))
);

-- ─────────────────────────── Inscripciones ───────────────────────────

-- Una fila por lugar. Sin persona = lugar apartado ('reserved') que el
-- contratista asigna después. for_contractor = el curso es para él mismo.
create table if not exists public.labor_enrollments (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  course_id text not null references public.labor_courses(id),
  session_id uuid references public.labor_course_sessions(id) on delete set null,
  worker_id uuid references public.labor_workers(id) on delete cascade,
  for_contractor boolean not null default false,
  status text not null default 'enrolled'
    check (status in ('reserved', 'enrolled', 'attended', 'passed', 'failed', 'no_show', 'cancelled')),
  progress numeric(4,3) not null default 0 check (progress between 0 and 1), -- clases vistas
  level_at_enroll text check (level_at_enroll in ('bronce', 'plata', 'oro')),
  list_price numeric(10,2),
  discount numeric(4,3) check (discount between 0 and 1),
  amount_due numeric(10,2),    -- null = precio por confirmar
  attended_at timestamptz,
  attendance_marked_by uuid references auth.users(id),
  completed_at timestamptz,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  check (not (for_contractor and worker_id is not null)),
  check ((status = 'reserved') = (worker_id is null and not for_contractor) or status = 'cancelled')
);

-- Una inscripción viva por persona y curso.
create unique index if not exists labor_enrollments_active_worker_idx
  on public.labor_enrollments(course_id, worker_id)
  where worker_id is not null and status in ('enrolled', 'attended');
create unique index if not exists labor_enrollments_active_owner_idx
  on public.labor_enrollments(course_id, contractor_id)
  where for_contractor and status in ('enrolled', 'attended');

create table if not exists public.labor_lesson_progress (
  enrollment_id uuid not null references public.labor_enrollments(id) on delete cascade,
  lesson_id uuid not null references public.labor_course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (enrollment_id, lesson_id)
);

-- ─────────────────────────── Evaluaciones y evidencias ───────────────────────────

create table if not exists public.labor_evaluations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.labor_enrollments(id) on delete cascade,
  kind text not null check (kind in ('quiz', 'practical')),
  score numeric(5,2) check (score between 0 and 100),
  passed boolean not null,
  evaluator_user_id uuid references auth.users(id),   -- null = examen calificado por la app
  evaluator_role text not null check (evaluator_role in ('app', 'instructor', 'evaluador', 'residente')),
  evaluator_name text,
  answers jsonb,
  notes text,
  project_id uuid references public.projects(project_id) on delete set null, -- obra donde se evaluó
  lat double precision,
  lng double precision,
  evaluated_at timestamptz not null default now(),
  check ((kind = 'quiz') = (evaluator_role = 'app'))
);

-- Fotos, videos, identificación y listas de asistencia. El archivo vive en
-- Storage (bucket labor-evidence) en <contratista>/<inscripción>/<archivo>.
create table if not exists public.labor_evidence (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.labor_enrollments(id) on delete cascade,
  evaluation_id uuid references public.labor_evaluations(id) on delete set null,
  kind text not null check (kind in ('selfie', 'id_document', 'photo', 'video', 'attendance_sheet', 'signature', 'document')),
  storage_path text not null,
  sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  lat double precision,
  lng double precision,
  captured_at timestamptz,
  uploaded_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- ─────────────────────────── Constancias ───────────────────────────

create sequence if not exists public.labor_certificate_seq;

create table if not exists public.labor_certificates (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  worker_id uuid references public.labor_workers(id) on delete cascade, -- null = del contratista
  course_id text not null references public.labor_courses(id),
  enrollment_id uuid unique references public.labor_enrollments(id) on delete set null,
  credential_type text not null check (credential_type in ('buildi', 'dc3', 'conocer')),
  source text not null default 'course' check (source in ('course', 'external')),
  folio text not null,
  verify_code text not null unique default ('CRT-' || upper(substr(md5(gen_random_uuid()::text), 1, 10))),
  issued_on date not null,
  expires_on date,
  provider_id uuid references public.labor_training_providers(id),
  issuer_name text not null,
  issued_by uuid references auth.users(id),
  file_path text,              -- PDF en Storage (bucket labor-certificates)
  details jsonb not null default '{}', -- lo que lleva impreso; en la DC-3: CURP, ocupación, patrón, RFC, horas, periodo, área temática y agente
  status text not null default 'valid' check (status in ('valid', 'pending_review', 'rejected', 'revoked')),
  status_note text,
  reviewed_by uuid references auth.users(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists labor_certificates_folio_idx
  on public.labor_certificates(credential_type, folio) where source = 'course';

create index if not exists labor_sessions_course_idx on public.labor_course_sessions(course_id, starts_at);
create index if not exists labor_enrollments_contractor_idx on public.labor_enrollments(contractor_id);
create index if not exists labor_enrollments_session_idx on public.labor_enrollments(session_id);
create index if not exists labor_evaluations_enrollment_idx on public.labor_evaluations(enrollment_id);
create index if not exists labor_evidence_enrollment_idx on public.labor_evidence(enrollment_id);
create index if not exists labor_certificates_worker_idx on public.labor_certificates(worker_id);
create index if not exists labor_certificates_contractor_idx on public.labor_certificates(contractor_id);

-- ─────────────────────────── Quién puede qué ───────────────────────────

-- Texto a uuid sin error (rutas de Storage escritas por cualquiera).
create or replace function public.labor_try_uuid(p text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case when p ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then p::uuid end
$$;

create or replace function public.labor_is_provider_staff(p_provider_id uuid, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.labor_provider_staff
     where provider_id = p_provider_id and user_id = auth.uid() and active
       and (p_roles is null or role = any (p_roles)))
$$;

-- Proveedor responsable de una inscripción: el de la sesión o el del curso.
create or replace function public.labor_enrollment_provider(p_enrollment_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(s.provider_id, c.provider_id)
    from public.labor_enrollments e
    join public.labor_courses c on c.id = e.course_id
    left join public.labor_course_sessions s on s.id = e.session_id
   where e.id = p_enrollment_id
$$;

-- Con qué papel puede evaluar el usuario esta inscripción (null = no puede).
-- El contratista nunca evalúa a su propia gente.
create or replace function public.labor_evaluator_role(p_enrollment_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  v_type text;
  v_provider uuid;
begin
  select * into e from public.labor_enrollments where id = p_enrollment_id;
  if not found or auth.uid() is null then
    return null;
  end if;
  if exists (select 1 from public.labor_contractors where id = e.contractor_id and owner_id = auth.uid()) then
    return null;
  end if;
  select credential_type into v_type from public.labor_courses where id = e.course_id;
  v_provider := public.labor_enrollment_provider(p_enrollment_id);
  if v_provider is not null and public.labor_is_provider_staff(v_provider, array['evaluador']) then
    return 'evaluador';
  end if;
  if v_provider is not null and public.labor_is_provider_staff(v_provider, array['instructor', 'coordinador']) then
    return 'instructor';
  end if;
  if v_type = 'buildi' and exists (
       select 1 from public.labor_sites s
        where s.contractor_id = e.contractor_id and s.active and public.labor_is_project_builder(s.project_id)) then
    return 'residente';
  end if;
  return null;
end $$;

-- Ver una inscripción: el contratista, el personal del proveedor, quien
-- puede evaluarla y BuildI.
create or replace function public.labor_can_see_enrollment(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
           select 1 from public.labor_enrollments e
            where e.id = p_enrollment_id and e.contractor_id = public.labor_my_contractor_id())
      or public.labor_is_provider_staff(public.labor_enrollment_provider(p_enrollment_id))
      or public.labor_evaluator_role(p_enrollment_id) is not null
      or public.labor_is_admin()
$$;

-- ─────────────────────────── RLS ───────────────────────────

alter table public.labor_training_providers enable row level security;
alter table public.labor_provider_staff enable row level security;
alter table public.labor_courses enable row level security;
alter table public.labor_course_lessons enable row level security;
alter table public.labor_quiz_questions enable row level security;
alter table public.labor_course_sessions enable row level security;
alter table public.labor_enrollments enable row level security;
alter table public.labor_lesson_progress enable row level security;
alter table public.labor_evaluations enable row level security;
alter table public.labor_evidence enable row level security;
alter table public.labor_certificates enable row level security;

do $$
declare t text;
begin
  foreach t in array array['labor_training_providers', 'labor_courses', 'labor_course_lessons']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select to authenticated using (true)', t);
  end loop;
end $$;

drop policy if exists labor_provider_staff_read on public.labor_provider_staff;
create policy labor_provider_staff_read on public.labor_provider_staff for select to authenticated
  using (user_id = auth.uid() or public.labor_is_admin());

-- Sesiones: las ven todos con sesión (para inscribirse); las programa el
-- coordinador o instructor del proveedor.
drop policy if exists labor_course_sessions_read on public.labor_course_sessions;
create policy labor_course_sessions_read on public.labor_course_sessions for select to authenticated
  using (status <> 'cancelled' or public.labor_is_provider_staff(provider_id));
drop policy if exists labor_course_sessions_staff on public.labor_course_sessions;
create policy labor_course_sessions_staff on public.labor_course_sessions for all to authenticated
  using (public.labor_is_provider_staff(provider_id, array['coordinador', 'instructor']))
  with check (public.labor_is_provider_staff(provider_id, array['coordinador', 'instructor']));

drop policy if exists labor_enrollments_read on public.labor_enrollments;
create policy labor_enrollments_read on public.labor_enrollments for select to authenticated
  using (public.labor_can_see_enrollment(id));

drop policy if exists labor_lesson_progress_read on public.labor_lesson_progress;
create policy labor_lesson_progress_read on public.labor_lesson_progress for select to authenticated
  using (public.labor_can_see_enrollment(enrollment_id));

drop policy if exists labor_evaluations_read on public.labor_evaluations;
create policy labor_evaluations_read on public.labor_evaluations for select to authenticated
  using (public.labor_can_see_enrollment(enrollment_id));

drop policy if exists labor_evidence_read on public.labor_evidence;
create policy labor_evidence_read on public.labor_evidence for select to authenticated
  using (public.labor_can_see_enrollment(enrollment_id));

drop policy if exists labor_certificates_read on public.labor_certificates;
create policy labor_certificates_read on public.labor_certificates for select to authenticated
  using (contractor_id = public.labor_my_contractor_id()
         or (provider_id is not null and public.labor_is_provider_staff(provider_id))
         or public.labor_is_admin());

-- Todo se escribe con las funciones de abajo (llevan las reglas). Las
-- preguntas del examen no se leen directo (traen la respuesta).
do $$
declare t text;
begin
  foreach t in array array['labor_training_providers', 'labor_provider_staff', 'labor_courses', 'labor_course_lessons',
                           'labor_quiz_questions', 'labor_enrollments', 'labor_lesson_progress', 'labor_evaluations',
                           'labor_evidence', 'labor_certificates']
  loop
    execute format('revoke insert, update, delete on public.%s from anon, authenticated', t);
  end loop;
end $$;
revoke select on public.labor_quiz_questions from anon, authenticated;

-- ─────────────────────────── Inscribirse ───────────────────────────

-- Inscribe a personas concretas, aparta lugares sin nombre (p_seats) o
-- inscribe al propio contratista (p_for_me). Con sesión revisa el cupo. El
-- precio sale del nivel calculado en el servidor.
create or replace function public.labor_enroll(
  p_course_id text,
  p_worker_ids uuid[] default '{}',
  p_session_id uuid default null,
  p_seats int default 0,
  p_for_me boolean default false)
returns setof uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contractor uuid := public.labor_my_contractor_id();
  c public.labor_courses%rowtype;
  s public.labor_course_sessions%rowtype;
  v_level text;
  v_discount numeric;
  v_amount numeric;
  v_people int;
  v_taken int;
  v_worker uuid;
  v_id uuid;
begin
  if v_contractor is null then
    raise exception 'Primero crea tu perfil de contratista';
  end if;
  select * into c from public.labor_courses where id = p_course_id and active;
  if not found then
    raise exception 'Curso no disponible';
  end if;
  if p_for_me and c.audience <> 'contractor' then
    raise exception 'Este curso es para tu cuadrilla';
  end if;
  if not p_for_me and c.audience = 'contractor' then
    raise exception 'Este curso es para ti';
  end if;
  if exists (select 1 from unnest(coalesce(p_worker_ids, '{}')) w
              where w not in (select id from public.labor_workers where contractor_id = v_contractor and active)) then
    raise exception 'Solo puedes inscribir a tu gente';
  end if;

  v_people := coalesce(array_length(p_worker_ids, 1), 0) + greatest(coalesce(p_seats, 0), 0) + case when p_for_me then 1 else 0 end;
  if v_people = 0 then
    raise exception 'Elige al menos una persona';
  end if;

  if p_session_id is not null then
    select * into s from public.labor_course_sessions where id = p_session_id for update;
    if not found or s.course_id <> p_course_id or s.status <> 'scheduled' or s.starts_at <= now() then
      raise exception 'Esa fecha ya no está disponible';
    end if;
    select count(*) into v_taken from public.labor_enrollments
     where session_id = p_session_id and status not in ('cancelled', 'no_show');
    if v_taken + v_people > s.capacity then
      raise exception 'Solo quedan % lugares en esa fecha', greatest(s.capacity - v_taken, 0);
    end if;
  elsif c.delivery <> 'app' and exists (
          select 1 from public.labor_course_sessions
           where course_id = p_course_id and status = 'scheduled' and starts_at > now()) then
    -- Hay fechas: se aparta lugar sin fecha solo si no hay ninguna programada.
    raise exception 'Elige una de las fechas programadas';
  end if;

  v_level := public.labor_contractor_score(v_contractor) ->> 'level';
  v_discount := coalesce((c.discount_by_level ->> v_level)::numeric, 0);
  v_amount := case when c.price is null then null else round(c.price * (1 - v_discount), 2) end;

  foreach v_worker in array coalesce(p_worker_ids, '{}') loop
    insert into public.labor_enrollments
      (contractor_id, course_id, session_id, worker_id, status, level_at_enroll, list_price, discount, amount_due)
    values (v_contractor, p_course_id, p_session_id, v_worker, 'enrolled', v_level, c.price, v_discount, v_amount)
    returning id into v_id;
    return next v_id;
  end loop;

  for i in 1 .. greatest(coalesce(p_seats, 0), 0) loop
    insert into public.labor_enrollments
      (contractor_id, course_id, session_id, status, level_at_enroll, list_price, discount, amount_due)
    values (v_contractor, p_course_id, p_session_id, 'reserved', v_level, c.price, v_discount, v_amount)
    returning id into v_id;
    return next v_id;
  end loop;

  if p_for_me then
    insert into public.labor_enrollments
      (contractor_id, course_id, for_contractor, status, level_at_enroll, list_price, discount, amount_due)
    values (v_contractor, p_course_id, true, 'enrolled', v_level, c.price, v_discount, v_amount)
    returning id into v_id;
    return next v_id;
  end if;
exception
  when unique_violation then
    raise exception 'Alguien ya está inscrito a este curso';
end $$;

-- Fechas abiertas de un curso con los lugares que quedan.
create or replace function public.labor_open_sessions(p_course_id text)
returns table (
  id uuid, starts_at timestamptz, ends_at timestamptz, timezone text, venue_name text, address text,
  instructor_name text, provider_name text, capacity int, seats_left int)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.starts_at, s.ends_at, s.timezone, s.venue_name, s.address, s.instructor_name, p.name, s.capacity,
         greatest(s.capacity - (select count(*) from public.labor_enrollments e
                                 where e.session_id = s.id and e.status not in ('cancelled', 'no_show')), 0)::int
    from public.labor_course_sessions s
    join public.labor_training_providers p on p.id = s.provider_id
   where s.course_id = p_course_id and s.status = 'scheduled' and s.starts_at > now()
   order by s.starts_at
   limit 20
$$;

-- Ponerle nombre a un lugar apartado.
create or replace function public.labor_assign_seat(p_enrollment_id uuid, p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.labor_workers
                  where id = p_worker_id and contractor_id = public.labor_my_contractor_id() and active) then
    raise exception 'Solo puedes inscribir a tu gente';
  end if;
  update public.labor_enrollments set worker_id = p_worker_id, status = 'enrolled'
   where id = p_enrollment_id and contractor_id = public.labor_my_contractor_id() and status = 'reserved';
  if not found then
    raise exception 'Lugar no encontrado';
  end if;
exception
  when unique_violation then
    raise exception 'Esa persona ya está inscrita a este curso';
end $$;

create or replace function public.labor_cancel_enrollment(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.labor_enrollments set status = 'cancelled'
   where id = p_enrollment_id and contractor_id = public.labor_my_contractor_id() and status in ('reserved', 'enrolled');
  if not found then
    raise exception 'Esa inscripción ya no se puede cancelar';
  end if;
end $$;

-- ─────────────────────────── Cursos en la app ───────────────────────────

create or replace function public.labor_complete_lesson(p_enrollment_id uuid, p_lesson_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  v_progress numeric;
begin
  select * into e from public.labor_enrollments
   where id = p_enrollment_id and contractor_id = public.labor_my_contractor_id() and status in ('enrolled', 'attended');
  if not found or not exists (select 1 from public.labor_course_lessons where id = p_lesson_id and course_id = e.course_id) then
    raise exception 'Clase no encontrada';
  end if;
  insert into public.labor_lesson_progress (enrollment_id, lesson_id) values (p_enrollment_id, p_lesson_id)
  on conflict do nothing;
  select round(count(p.lesson_id)::numeric / nullif(count(l.id), 0), 3) into v_progress
    from public.labor_course_lessons l
    left join public.labor_lesson_progress p on p.lesson_id = l.id and p.enrollment_id = p_enrollment_id
   where l.course_id = e.course_id;
  update public.labor_enrollments set progress = coalesce(v_progress, 0) where id = p_enrollment_id;
  return coalesce(v_progress, 0);
end $$;

-- Preguntas del examen sin la respuesta.
create or replace function public.labor_course_quiz(p_enrollment_id uuid)
returns table (id uuid, sort int, prompt text, image_path text, options jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select q.id, q.sort, q.prompt, q.image_path, q.options
    from public.labor_quiz_questions q
    join public.labor_enrollments e on e.course_id = q.course_id
   where e.id = p_enrollment_id and e.contractor_id = public.labor_my_contractor_id()
   order by q.sort
$$;

-- ─────────────────────────── Constancias ───────────────────────────

-- ¿Ya cumple todo lo que pide el curso? Devuelve lo que falta (vacío = listo).
create or replace function public.labor_enrollment_missing(p_enrollment_id uuid)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  c public.labor_courses%rowtype;
  v_missing text[] := '{}';
  v_kind text;
begin
  select * into e from public.labor_enrollments where id = p_enrollment_id;
  select * into c from public.labor_courses where id = e.course_id;
  if e.status in ('cancelled', 'no_show', 'failed', 'reserved') then
    return array[case e.status when 'reserved' then 'asignar el lugar a una persona'
                               when 'no_show' then 'no asistió'
                               when 'failed' then 'no aprobó'
                               else 'inscripción cancelada' end];
  end if;
  if c.requires_quiz and not exists (
       select 1 from public.labor_evaluations where enrollment_id = e.id and kind = 'quiz' and passed) then
    v_missing := v_missing || 'examen aprobado'::text;
  end if;
  if c.requires_practical and not exists (
       select 1 from public.labor_evaluations where enrollment_id = e.id and kind = 'practical' and passed) then
    v_missing := v_missing || 'evaluación práctica aprobada'::text;
  end if;
  if e.session_id is not null and e.attended_at is null then
    v_missing := v_missing || 'asistencia'::text;
  end if;
  foreach v_kind in array c.required_evidence loop
    if not exists (select 1 from public.labor_evidence where enrollment_id = e.id and kind = v_kind) then
      v_missing := v_missing || ('evidencia: ' || v_kind);
    end if;
  end loop;
  return v_missing;
end $$;

-- Emite la constancia. Interna: la llaman las funciones que ya revisaron
-- quién la pide. En la DC-3 guarda lo que va impreso y exige los datos que
-- pide la STPS.
create or replace function public.labor_issue_certificate_internal(p_enrollment_id uuid, p_folio text, p_file_path text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  c public.labor_courses%rowtype;
  k public.labor_contractors%rowtype;
  w public.labor_workers%rowtype;
  s public.labor_course_sessions%rowtype;
  p public.labor_training_providers%rowtype;
  v_missing text[];
  v_details jsonb := '{}';
  v_folio text := nullif(trim(p_folio), '');
  v_today date;
  v_id uuid;
begin
  select * into e from public.labor_enrollments where id = p_enrollment_id for update;
  if not found then
    raise exception 'Inscripción no encontrada';
  end if;
  if exists (select 1 from public.labor_certificates where enrollment_id = e.id) then
    raise exception 'Esta inscripción ya tiene constancia';
  end if;
  v_missing := public.labor_enrollment_missing(e.id);
  if array_length(v_missing, 1) > 0 then
    raise exception 'Falta: %', array_to_string(v_missing, ', ');
  end if;

  select * into c from public.labor_courses where id = e.course_id;
  select * into k from public.labor_contractors where id = e.contractor_id;
  select * into w from public.labor_workers where id = e.worker_id;
  select * into s from public.labor_course_sessions where id = e.session_id;
  select * into p from public.labor_training_providers where id = coalesce(s.provider_id, c.provider_id);
  v_today := public.labor_local_date(coalesce(s.timezone, 'America/Mexico_City'));

  if c.credential_type = 'dc3' then
    v_missing := '{}';
    if w.id is not null and w.curp is null then v_missing := v_missing || 'CURP del trabajador'::text; end if;
    if k.rfc is null then v_missing := v_missing || 'RFC del patrón'::text; end if;
    if p.stps_registry is null then v_missing := v_missing || 'registro STPS del agente capacitador'::text; end if;
    if c.hours is null then v_missing := v_missing || 'duración del curso'::text; end if;
    if s.id is null then v_missing := v_missing || 'sesión (periodo del curso)'::text; end if;
    if array_length(v_missing, 1) > 0 then
      raise exception 'Para la DC-3 falta: %', array_to_string(v_missing, ', ');
    end if;
    v_details := jsonb_build_object(
      'trabajador', jsonb_build_object('nombre', coalesce(w.full_name, k.display_name), 'curp', w.curp,
                                       'ocupacion', w.trade, 'puesto', w.trade),
      'empresa', jsonb_build_object('razon_social', coalesce(k.legal_name, k.business_name), 'rfc', k.rfc),
      'curso', jsonb_build_object('nombre', c.title, 'horas', c.hours, 'area_tematica', c.stps_area,
                                  'inicio', (s.starts_at at time zone s.timezone)::date,
                                  'fin', (s.ends_at at time zone s.timezone)::date),
      'agente_capacitador', jsonb_build_object('nombre', coalesce(p.legal_name, p.name), 'registro_stps', p.stps_registry),
      'instructor', s.instructor_name);
  elsif c.credential_type = 'conocer' then
    if v_folio is null then
      raise exception 'El certificado CONOCER lleva el folio que da CONOCER';
    end if;
    v_details := jsonb_build_object('estandar', c.conocer_standard, 'centro_evaluacion', p.name,
                                    'acreditacion', p.conocer_accreditation);
  end if;

  insert into public.labor_certificates
    (contractor_id, worker_id, course_id, enrollment_id, credential_type, source, folio, issued_on, expires_on,
     provider_id, issuer_name, issued_by, file_path, details)
  values
    (e.contractor_id, e.worker_id, c.id, e.id, c.credential_type, 'course',
     coalesce(v_folio, upper(case c.credential_type when 'buildi' then 'BLD' when 'dc3' then 'DC3' else 'CON' end)
                       || '-' || to_char(v_today, 'YYYY') || '-' || lpad(nextval('public.labor_certificate_seq')::text, 6, '0')),
     v_today,
     case when c.renew_years is null then null else (v_today + make_interval(years => c.renew_years))::date end,
     p.id, coalesce(p.name, 'BuildI'), auth.uid(), p_file_path, v_details)
  returning id into v_id;

  update public.labor_enrollments set status = 'passed', completed_at = now() where id = e.id;
  return v_id;
end $$;

-- La pide el instructor/coordinador (DC-3), el centro de evaluación
-- (CONOCER) o BuildI. Las constancias BuildI salen solas al aprobar.
create or replace function public.labor_issue_certificate(p_enrollment_id uuid, p_folio text default null, p_file_path text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider uuid := public.labor_enrollment_provider(p_enrollment_id);
begin
  if not (public.labor_is_admin()
          or (v_provider is not null and public.labor_is_provider_staff(v_provider, array['coordinador', 'instructor', 'evaluador']))) then
    raise exception 'Solo el proveedor del curso o BuildI emiten constancias';
  end if;
  return public.labor_issue_certificate_internal(p_enrollment_id, p_folio, p_file_path);
end $$;

-- Si ya cumple todo y es constancia BuildI, se emite sola.
create or replace function public.labor_try_auto_issue(p_enrollment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.labor_enrollments e join public.labor_courses c on c.id = e.course_id
              where e.id = p_enrollment_id and c.credential_type = 'buildi')
     and coalesce(array_length(public.labor_enrollment_missing(p_enrollment_id), 1), 0) = 0
     and not exists (select 1 from public.labor_certificates where enrollment_id = p_enrollment_id) then
    return public.labor_issue_certificate_internal(p_enrollment_id, null, null);
  end if;
  return null;
end $$;

-- ─────────────────────────── Evaluar ───────────────────────────

-- Examen en la app: se califica aquí. Máximo 3 intentos por día.
create or replace function public.labor_submit_quiz(p_enrollment_id uuid, p_answers int[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  c public.labor_courses%rowtype;
  v_total int;
  v_right int;
  v_score numeric;
  v_passed boolean;
  v_eval uuid;
  v_cert uuid;
begin
  select * into e from public.labor_enrollments
   where id = p_enrollment_id and contractor_id = public.labor_my_contractor_id() for update;
  if not found or e.status not in ('enrolled', 'attended') then
    raise exception 'Inscripción no encontrada';
  end if;
  select * into c from public.labor_courses where id = e.course_id;
  if not c.requires_quiz then
    raise exception 'Este curso no tiene examen en la app';
  end if;
  if (select count(*) from public.labor_evaluations
       where enrollment_id = e.id and kind = 'quiz' and evaluated_at > now() - interval '1 day') >= 3 then
    raise exception 'Ya hiciste 3 intentos hoy; vuelve a intentarlo mañana';
  end if;

  select count(*), count(*) filter (where q.answer_index = p_answers[q.ord])
    into v_total, v_right
    from (select answer_index, row_number() over (order by sort)::int as ord
            from public.labor_quiz_questions where course_id = e.course_id) q;
  if v_total = 0 then
    raise exception 'Este curso todavía no tiene examen';
  end if;
  v_score := round(100.0 * v_right / v_total, 2);
  v_passed := v_score >= c.passing_score;

  insert into public.labor_evaluations (enrollment_id, kind, score, passed, evaluator_role, answers)
  values (e.id, 'quiz', v_score, v_passed, 'app', to_jsonb(p_answers))
  returning id into v_eval;

  if v_passed then
    v_cert := public.labor_try_auto_issue(e.id);
  end if;
  return jsonb_build_object('evaluation_id', v_eval, 'score', v_score, 'passed', v_passed,
                            'passing_score', c.passing_score, 'certificate_id', v_cert);
end $$;

-- Evaluación práctica: la registra el instructor, el evaluador o el
-- residente (constancias BuildI), nunca el contratista.
create or replace function public.labor_record_evaluation(
  p_enrollment_id uuid,
  p_passed boolean,
  p_score numeric default null,
  p_notes text default null,
  p_project_id uuid default null,
  p_lat double precision default null,
  p_lng double precision default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.labor_evaluator_role(p_enrollment_id);
  v_status text;
  v_eval uuid;
  v_cert uuid;
begin
  if v_role is null then
    raise exception 'No puedes evaluar esta inscripción';
  end if;
  select status into v_status from public.labor_enrollments where id = p_enrollment_id for update;
  if v_status not in ('enrolled', 'attended') then
    raise exception 'Esta inscripción no está en curso';
  end if;
  insert into public.labor_evaluations
    (enrollment_id, kind, score, passed, evaluator_user_id, evaluator_role, evaluator_name, notes, project_id, lat, lng)
  values
    (p_enrollment_id, 'practical', p_score, p_passed, auth.uid(), v_role,
     coalesce((select full_name from public.labor_provider_staff where user_id = auth.uid() and active limit 1),
              (select coalesce(nullif(to_jsonb(u) ->> 'name', ''), to_jsonb(u) ->> 'full_name') from public.users u where u.id = auth.uid())),
     p_notes, p_project_id, p_lat, p_lng)
  returning id into v_eval;

  if not p_passed then
    update public.labor_enrollments set status = 'failed', completed_at = now() where id = p_enrollment_id;
  else
    v_cert := public.labor_try_auto_issue(p_enrollment_id);
  end if;
  return jsonb_build_object('evaluation_id', v_eval, 'role', v_role, 'certificate_id', v_cert);
end $$;

-- Pase de lista del curso presencial (instructor o coordinador).
create or replace function public.labor_mark_session_attendance(p_session_id uuid, p_enrollment_ids uuid[], p_attended boolean)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not exists (select 1 from public.labor_course_sessions
                  where id = p_session_id and public.labor_is_provider_staff(provider_id, array['instructor', 'coordinador'])) then
    raise exception 'Solo el instructor de la sesión pasa lista';
  end if;
  update public.labor_enrollments
     set status = case when p_attended then 'attended' else 'no_show' end,
         attended_at = case when p_attended then now() end,
         attendance_marked_by = auth.uid()
   where session_id = p_session_id and id = any (p_enrollment_ids) and status in ('enrolled', 'attended', 'no_show');
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- Registrar evidencia ya subida a Storage (labor-evidence/<contratista>/<inscripción>/…).
create or replace function public.labor_add_evidence(
  p_enrollment_id uuid,
  p_kind text,
  p_storage_path text,
  p_sha256 text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_captured_at timestamptz default null,
  p_evaluation_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.labor_enrollments%rowtype;
  v_id uuid;
begin
  select * into e from public.labor_enrollments where id = p_enrollment_id;
  if not found or not (e.contractor_id = public.labor_my_contractor_id()
                       or public.labor_evaluator_role(p_enrollment_id) is not null
                       or public.labor_is_admin()) then
    raise exception 'Inscripción no encontrada';
  end if;
  if p_storage_path not like e.contractor_id::text || '/' || e.id::text || '/%' then
    raise exception 'El archivo tiene que estar en %/%/', e.contractor_id, e.id;
  end if;
  insert into public.labor_evidence (enrollment_id, evaluation_id, kind, storage_path, sha256, lat, lng, captured_at)
  values (p_enrollment_id, p_evaluation_id, p_kind, p_storage_path, lower(p_sha256), p_lat, p_lng, p_captured_at)
  returning id into v_id;
  perform public.labor_try_auto_issue(p_enrollment_id);
  return v_id;
end $$;

-- ─────────────────────────── Revocar, subir de fuera y verificar ───────────────────────────

create or replace function public.labor_revoke_certificate(p_certificate_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Escribe el motivo';
  end if;
  update public.labor_certificates
     set status = 'revoked', revoked_at = now(), status_note = p_reason, reviewed_by = auth.uid()
   where id = p_certificate_id and status = 'valid'
     and (public.labor_is_admin()
          or (provider_id is not null and public.labor_is_provider_staff(provider_id, array['coordinador', 'evaluador'])));
  if not found then
    raise exception 'Constancia no encontrada';
  end if;
end $$;

-- El contratista sube una constancia que su trabajador ya tenía. No cuenta
-- (ni para el gafete ni para las recomendaciones) hasta que BuildI la valida.
create or replace function public.labor_add_external_certificate(
  p_worker_id uuid,
  p_course_id text,
  p_folio text,
  p_issued_on date,
  p_issuer_name text,
  p_file_path text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contractor uuid := public.labor_my_contractor_id();
  c public.labor_courses%rowtype;
  v_id uuid;
begin
  if not exists (select 1 from public.labor_workers where id = p_worker_id and contractor_id = v_contractor) then
    raise exception 'Solo puedes subir constancias de tu gente';
  end if;
  select * into c from public.labor_courses where id = p_course_id;
  if not found then
    raise exception 'Curso no encontrado';
  end if;
  if coalesce(trim(p_folio), '') = '' or p_issued_on is null or p_issued_on > current_date or coalesce(trim(p_file_path), '') = '' then
    raise exception 'Falta el folio, la fecha o el archivo de la constancia';
  end if;
  insert into public.labor_certificates
    (contractor_id, worker_id, course_id, credential_type, source, folio, issued_on, expires_on, issuer_name, file_path, status)
  values
    (v_contractor, p_worker_id, c.id, c.credential_type, 'external', trim(p_folio), p_issued_on,
     case when c.renew_years is null then null else (p_issued_on + make_interval(years => c.renew_years))::date end,
     coalesce(nullif(trim(p_issuer_name), ''), 'Sin dato'), p_file_path, 'pending_review')
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.labor_review_certificate(p_certificate_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.labor_is_admin() then
    raise exception 'Solo el personal de BuildI revisa constancias';
  end if;
  update public.labor_certificates
     set status = case when p_approve then 'valid' else 'rejected' end, status_note = p_note, reviewed_by = auth.uid()
   where id = p_certificate_id and status = 'pending_review';
  if not found then
    raise exception 'Constancia no encontrada';
  end if;
end $$;

-- Lo que ve quien escanea el QR de una constancia impresa.
create or replace function public.labor_verify_certificate(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'status', case when ct.status = 'revoked' then 'revoked'
                   when ct.expires_on is not null and ct.expires_on < current_date then 'expired'
                   else 'valid' end,
    'title', co.title, 'type', ct.credential_type, 'folio', ct.folio, 'issuer', ct.issuer_name,
    'issued_on', ct.issued_on, 'expires_on', ct.expires_on,
    'holder', coalesce(w.full_name, k.display_name), 'contractor', k.business_name)
  from public.labor_certificates ct
  join public.labor_courses co on co.id = ct.course_id
  join public.labor_contractors k on k.id = ct.contractor_id
  left join public.labor_workers w on w.id = ct.worker_id
  where ct.verify_code = upper(p_code) and ct.status in ('valid', 'revoked')
$$;

-- Gafete: lo que ve el residente al escanear el QR desde la app de
-- constructor. Solo constancias válidas; sin teléfono, CURP ni correo.
create or replace function public.labor_verify_badge(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'name', w.full_name,
    'trade', w.trade,
    'level', w.level,
    'imss_registered', w.imss_registered,
    'contractor', c.business_name,
    'credentials', coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', co.title, 'type', ct.credential_type, 'issuer', ct.issuer_name,
        'folio', ct.folio, 'issued_on', ct.issued_on, 'renew_on', ct.expires_on) order by co.sort)
      from public.labor_certificates ct
      join public.labor_courses co on co.id = ct.course_id
      where ct.worker_id = w.id and ct.status = 'valid'), '[]'::jsonb))
  from public.labor_workers w
  join public.labor_contractors c on c.id = w.contractor_id
  where w.verify_code = upper(p_code) and w.active
$$;

-- ─────────────────────────── Permisos de las funciones ───────────────────────────

do $$
declare f text;
begin
  foreach f in array array[
    'labor_is_provider_staff(uuid, text[])', 'labor_enrollment_provider(uuid)', 'labor_evaluator_role(uuid)',
    'labor_open_sessions(text)',
    'labor_can_see_enrollment(uuid)', 'labor_enroll(text, uuid[], uuid, int, boolean)', 'labor_assign_seat(uuid, uuid)',
    'labor_cancel_enrollment(uuid)', 'labor_complete_lesson(uuid, uuid)', 'labor_course_quiz(uuid)',
    'labor_enrollment_missing(uuid)', 'labor_issue_certificate_internal(uuid, text, text)',
    'labor_issue_certificate(uuid, text, text)', 'labor_try_auto_issue(uuid)', 'labor_submit_quiz(uuid, int[])',
    'labor_record_evaluation(uuid, boolean, numeric, text, uuid, double precision, double precision)',
    'labor_mark_session_attendance(uuid, uuid[], boolean)',
    'labor_add_evidence(uuid, text, text, text, double precision, double precision, timestamptz, uuid)',
    'labor_revoke_certificate(uuid, text)', 'labor_add_external_certificate(uuid, text, text, date, text, text)',
    'labor_review_certificate(uuid, boolean, text)', 'labor_verify_certificate(text)', 'labor_verify_badge(text)']
  loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

grant execute on function public.labor_try_uuid(text) to authenticated;

-- Internas: solo las llaman otras funciones.
revoke execute on function public.labor_issue_certificate_internal(uuid, text, text) from authenticated;
revoke execute on function public.labor_try_auto_issue(uuid) from authenticated;

-- ─────────────────────────── Archivos (Storage) ───────────────────────────
-- Privados. Ruta: <contratista>/<inscripción o constancia>/<archivo>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('labor-evidence', 'labor-evidence', false, 26214400,
   array['image/jpeg', 'image/png', 'image/heic', 'video/mp4', 'video/quicktime', 'application/pdf']),
  ('labor-certificates', 'labor-certificates', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('labor-docs', 'labor-docs', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- El contratista sube y ve lo de su carpeta; quien evalúa la inscripción,
-- el proveedor del curso y BuildI también. El PDF de una constancia va en
-- labor-certificates/<contratista>/<inscripción>/… (o …/externas/… si la
-- sube el contratista).
drop policy if exists labor_evidence_files_read on storage.objects;
create policy labor_evidence_files_read on storage.objects for select to authenticated
  using (bucket_id in ('labor-evidence', 'labor-certificates')
         and ((storage.foldername(name))[1] = public.labor_my_contractor_id()::text
              or public.labor_can_see_enrollment(public.labor_try_uuid((storage.foldername(name))[2]))));
drop policy if exists labor_evidence_files_insert on storage.objects;
create policy labor_evidence_files_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('labor-evidence', 'labor-certificates')
              and ((storage.foldername(name))[1] = public.labor_my_contractor_id()::text
                   or public.labor_evaluator_role(public.labor_try_uuid((storage.foldername(name))[2])) is not null
                   or public.labor_is_provider_staff(public.labor_enrollment_provider(public.labor_try_uuid((storage.foldername(name))[2])))));

drop policy if exists labor_docs_files on storage.objects;
create policy labor_docs_files on storage.objects for all to authenticated
  using (bucket_id = 'labor-docs'
         and ((storage.foldername(name))[1] = public.labor_my_contractor_id()::text or public.labor_is_admin()))
  with check (bucket_id = 'labor-docs' and (storage.foldername(name))[1] = public.labor_my_contractor_id()::text);

drop policy if exists labor_certificate_files_read on storage.objects;
drop policy if exists labor_certificate_files_insert on storage.objects;

-- ─────────────────────────── Catálogo de cursos ───────────────────────────
-- Oferta de BuildI. Los cursos BuildI son gratis (beneficio de todos los
-- niveles). DC-3 y CONOCER quedan sin proveedor ni precio hasta firmar con el
-- agente capacitador y el centro de evaluación aliados; los descuentos por
-- nivel ya aplican cuando tengan precio.

insert into public.labor_courses
  (id, title, credential_type, provider_id, audience, delivery, hours, hours_label, modality, price, discount_by_level,
   renew_years, passing_score, requires_quiz, requires_practical, required_evidence, stps_area, recommended_for, sort)
values
  ('seguridad', 'Seguridad básica en obra', 'buildi', '00000000-0000-4000-8000-00000000b11d', 'crew', 'app', 2, '2 h',
   'En la app · sin internet', 0, '{"bronce": 1, "plata": 1, "oro": 1}', 2, 80, true, true, array['selfie', 'photo'],
   null, null, 1),
  ('alturas', 'Trabajo en alturas (NOM-009)', 'dc3', null, 'crew', 'presencial', 8, '8 h',
   'Presencial', null, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, 80, false, true, array['attendance_sheet', 'id_document'],
   '6000 Seguridad', 'Recomendado para trabajar a más de 1.8 m', 2),
  ('construccion', 'Seguridad en obras de construcción (NOM-031)', 'dc3', null, 'crew', 'presencial', 8, '8 h',
   'Presencial', null, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, 80, false, true, array['attendance_sheet', 'id_document'],
   '6000 Seguridad', null, 3),
  ('epp', 'Uso de equipo de protección (NOM-017)', 'dc3', null, 'crew', 'en_obra', 4, '4 h',
   'Presencial en obra', null, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, 80, false, true, array['attendance_sheet', 'id_document'],
   '6000 Seguridad', null, 4),
  ('albanil', 'Certificación de albañil', 'conocer', null, 'crew', 'en_obra', null, 'Evaluación en obra',
   'Con evaluador acreditado', null, '{"bronce": 0, "plata": 0.25, "oro": 0.5}', null, 80, false, true,
   array['photo', 'video', 'id_document'], null, null, 5),
  ('cotizar', 'Cómo cotizar a destajo', 'buildi', '00000000-0000-4000-8000-00000000b11d', 'contractor', 'app', 3, '3 h',
   'En la app', 0, '{"bronce": 1, "plata": 1, "oro": 1}', null, 80, true, false, '{}', null, null, 6),
  ('finanzas', 'Finanzas de tu cuadrilla: raya, IMSS e impuestos', 'buildi', '00000000-0000-4000-8000-00000000b11d', 'contractor', 'app', 3, '3 h',
   'En la app', 0, '{"bronce": 1, "plata": 1, "oro": 1}', null, 80, true, false, '{}', null, null, 7)
on conflict (id) do update set
  title = excluded.title, credential_type = excluded.credential_type, audience = excluded.audience,
  delivery = excluded.delivery, hours = excluded.hours, hours_label = excluded.hours_label, modality = excluded.modality,
  discount_by_level = excluded.discount_by_level, renew_years = excluded.renew_years, passing_score = excluded.passing_score,
  requires_quiz = excluded.requires_quiz, requires_practical = excluded.requires_practical,
  required_evidence = excluded.required_evidence, stps_area = excluded.stps_area,
  recommended_for = excluded.recommended_for, sort = excluded.sort;
