-- BuildI · Contratista de mano de obra (chief-of-labor)
-- Tablas para Frentes, Cuadrillas/Gafetes y Perfil (nivel, beneficios,
-- expediente de cumplimiento y cursos). Todas con RLS: cada contratista ve
-- solo lo suyo. Los catálogos (cursos, beneficios, conceptos) los lee
-- cualquier usuario autenticado. El gafete se verifica sin sesión con
-- labor_verify_badge(code).

create extension if not exists pgcrypto;

-- ─────────────────────────── Contratista ───────────────────────────

create table if not exists public.labor_contractors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  business_name text not null,
  city text,
  email text,
  phone text,
  years_experience int,
  created_at timestamptz not null default now()
);

-- Insumos del puntaje BuildI Pro (los recalcula un proceso semanal).
create table if not exists public.labor_contractor_metrics (
  contractor_id uuid primary key references public.labor_contractors(id) on delete cascade,
  on_time_rate numeric(4,3) not null default 0 check (on_time_rate between 0 and 1),
  adjusted_share numeric(5,4) not null default 0 check (adjusted_share >= 0),
  builder_rating numeric(2,1) not null default 0 check (builder_rating between 0 and 5),
  months_on_buildi int not null default 0 check (months_on_buildi >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.labor_my_contractor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.labor_contractors where owner_id = auth.uid()
$$;

-- ─────────────────────────── Obras, cuadrillas y gente ───────────────────────────

create table if not exists public.labor_sites (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  name text not null,
  builder_name text not null,
  site_id uuid,              -- obra del constructor en BuildI, si existe
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.labor_crews (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  name text not null,
  site_label text,
  status text not null default 'active' check (status in ('active', 'break', 'inactive')),
  efficiency int not null default 0 check (efficiency between 0 and 100),
  height_note text,          -- si la cuadrilla trabaja en altura, dónde
  lead_worker_id uuid,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.labor_workers (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  crew_id uuid references public.labor_crews(id) on delete set null,
  code text not null,        -- iniciales que se muestran en el avatar
  full_name text not null,
  trade text not null,
  level text not null default 'ayudante' check (level in ('ayudante', 'oficial', 'maestro')),
  color text not null default '#2563EB',
  imss_registered boolean not null default false,
  joined_year int,
  verify_code text not null unique default ('BLD-' || upper(substr(md5(gen_random_uuid()::text), 1, 8))),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (contractor_id, code)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'labor_crews_lead_worker_fk') then
    alter table public.labor_crews
      add constraint labor_crews_lead_worker_fk
      foreign key (lead_worker_id) references public.labor_workers(id) on delete set null;
  end if;
end $$;

-- Historial verificado de obras (se muestra en el gafete).
create table if not exists public.labor_worker_sites (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  site_name text not null,
  year int not null
);

-- Pase de lista diario.
create table if not exists public.labor_attendance (
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  work_date date not null default current_date,
  status text not null check (status in ('present', 'late', 'absent')),
  checked_in_at timestamptz,
  primary key (worker_id, work_date)
);

-- ─────────────────────────── Cursos y constancias ───────────────────────────

create table if not exists public.labor_courses (
  id text primary key,
  title text not null,
  credential_type text not null check (credential_type in ('buildi', 'dc3', 'conocer')),
  issuer text not null,
  audience text not null check (audience in ('crew', 'contractor')),
  hours_label text not null,
  modality text not null,
  price numeric(10,2) not null default 0,
  discount_by_level jsonb not null default '{"bronce": 0, "plata": 0, "oro": 0}',
  renew_years int,           -- null = sin vencimiento
  recommended_for text,
  sort int not null default 0
);

create table if not exists public.labor_credentials (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  course_id text not null references public.labor_courses(id),
  folio text not null,
  issued_on date not null,
  renew_on date,
  file_url text,             -- PDF de la DC-3 o certificado
  verified_by text,          -- residente, agente capacitador o evaluador
  created_at timestamptz not null default now(),
  unique (worker_id, course_id)
);

create table if not exists public.labor_enrollments (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  course_id text not null references public.labor_courses(id),
  worker_id uuid references public.labor_workers(id) on delete cascade, -- null = lugares sin asignar o curso del contratista
  seats int not null default 1 check (seats > 0),
  status text not null default 'enrolled' check (status in ('enrolled', 'in_progress', 'completed', 'cancelled')),
  progress numeric(4,3) not null default 0 check (progress between 0 and 1),
  session_date date,
  created_at timestamptz not null default now()
);

-- "Inscribir", "Dar de alta" o "Después" en las recomendaciones del gafete.
create table if not exists public.labor_recommendation_actions (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  rec_key text not null,
  action text not null check (action in ('done', 'later')),
  created_at timestamptz not null default now(),
  unique (worker_id, rec_key)
);

-- ─────────────────────────── Frentes a destajo ───────────────────────────

create table if not exists public.labor_fronts (
  id uuid primary key default gen_random_uuid(),
  labor_site_id uuid not null references public.labor_sites(id) on delete cascade,
  item_code text not null,
  description text not null,
  unit text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  done_before numeric(12,2) not null default 0,  -- avance previo a registrar en la app
  unit_price numeric(10,2) not null,
  people_needed int not null default 0,
  rate_per_person_day numeric(8,2) not null default 1 check (rate_per_person_day > 0),
  at_height_note text,       -- p. ej. "el nivel 3"; activa la recomendación de alturas
  blocked_reason text,
  completed boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.labor_front_members (
  front_id uuid not null references public.labor_fronts(id) on delete cascade,
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  primary key (front_id, worker_id)
);

create table if not exists public.labor_front_progress (
  id uuid primary key default gen_random_uuid(),
  front_id uuid not null references public.labor_fronts(id) on delete cascade,
  work_date date not null default current_date,
  quantity numeric(12,2) not null check (quantity > 0),
  delay_reason text,
  photo_url text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create or replace view public.labor_fronts_summary
with (security_invoker = true) as
select
  f.*,
  f.done_before + coalesce(sum(p.quantity), 0) as done,
  coalesce(sum(p.quantity) filter (where p.work_date >= date_trunc('week', current_date)::date), 0) as week
from public.labor_fronts f
left join public.labor_front_progress p on p.front_id = f.id
group by f.id;

-- ─────────────────────────── Cotizaciones ───────────────────────────

create table if not exists public.labor_quote_catalog (
  id text primary key,
  description text not null,
  unit text not null,
  default_unit_price numeric(10,2) not null,
  rate_per_person_day numeric(8,2) not null,
  market_unit_price numeric(10,2) not null,  -- promedio de la zona
  region text not null default 'Guadalajara',
  sort int not null default 0
);

create table if not exists public.labor_quotes (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  labor_site_id uuid references public.labor_sites(id) on delete set null,
  builder_name text not null,
  catalog_id text not null references public.labor_quote_catalog(id),
  volume numeric(12,2) not null check (volume > 0),
  people int not null check (people > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),
  est_days int,
  est_payroll numeric(12,2),
  status text not null default 'sent' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────── Expediente y beneficios ───────────────────────────

create table if not exists public.labor_compliance_docs (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  kind text not null check (kind in ('repse', 'imss', 'infonavit', 'sat', 'contract', 'other')),
  name text not null,
  detail text,
  expires_on date,           -- null = no vence; el estado se calcula con esta fecha
  file_url text,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.labor_benefits (
  id text primary key,
  title text not null,
  summary text not null,
  icon text not null,
  min_level text not null check (min_level in ('bronce', 'plata', 'oro')),
  by_level jsonb,
  partner text,
  how jsonb not null default '[]',
  sort int not null default 0
);

create table if not exists public.labor_benefit_requests (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  benefit_id text not null references public.labor_benefits(id),
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'applied')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────── Índices ───────────────────────────

create index if not exists labor_sites_contractor_idx on public.labor_sites(contractor_id);
create index if not exists labor_crews_contractor_idx on public.labor_crews(contractor_id);
create index if not exists labor_workers_contractor_idx on public.labor_workers(contractor_id);
create index if not exists labor_workers_crew_idx on public.labor_workers(crew_id);
create index if not exists labor_credentials_worker_idx on public.labor_credentials(worker_id);
create index if not exists labor_enrollments_contractor_idx on public.labor_enrollments(contractor_id);
create index if not exists labor_fronts_site_idx on public.labor_fronts(labor_site_id);
create index if not exists labor_front_progress_front_idx on public.labor_front_progress(front_id, work_date);
create index if not exists labor_quotes_contractor_idx on public.labor_quotes(contractor_id);
create index if not exists labor_docs_contractor_idx on public.labor_compliance_docs(contractor_id);

-- ─────────────────────────── RLS ───────────────────────────

alter table public.labor_contractors enable row level security;
alter table public.labor_contractor_metrics enable row level security;
alter table public.labor_sites enable row level security;
alter table public.labor_crews enable row level security;
alter table public.labor_workers enable row level security;
alter table public.labor_worker_sites enable row level security;
alter table public.labor_attendance enable row level security;
alter table public.labor_courses enable row level security;
alter table public.labor_credentials enable row level security;
alter table public.labor_enrollments enable row level security;
alter table public.labor_recommendation_actions enable row level security;
alter table public.labor_fronts enable row level security;
alter table public.labor_front_members enable row level security;
alter table public.labor_front_progress enable row level security;
alter table public.labor_quote_catalog enable row level security;
alter table public.labor_quotes enable row level security;
alter table public.labor_compliance_docs enable row level security;
alter table public.labor_benefits enable row level security;
alter table public.labor_benefit_requests enable row level security;

drop policy if exists labor_contractors_own on public.labor_contractors;
create policy labor_contractors_own on public.labor_contractors
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Tablas que cuelgan directo del contratista.
do $$
declare t text;
begin
  foreach t in array array['labor_contractor_metrics', 'labor_sites', 'labor_crews', 'labor_workers',
                           'labor_enrollments', 'labor_quotes', 'labor_compliance_docs', 'labor_benefit_requests']
  loop
    execute format('drop policy if exists %1$s_own on public.%1$s', t);
    execute format(
      'create policy %1$s_own on public.%1$s for all to authenticated
         using (contractor_id = public.labor_my_contractor_id())
         with check (contractor_id = public.labor_my_contractor_id())', t);
  end loop;
end $$;

-- Tablas que cuelgan de un trabajador.
do $$
declare t text;
begin
  foreach t in array array['labor_worker_sites', 'labor_attendance', 'labor_credentials', 'labor_recommendation_actions']
  loop
    execute format('drop policy if exists %1$s_own on public.%1$s', t);
    execute format(
      'create policy %1$s_own on public.%1$s for all to authenticated
         using (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()))
         with check (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()))', t);
  end loop;
end $$;

drop policy if exists labor_fronts_own on public.labor_fronts;
create policy labor_fronts_own on public.labor_fronts for all to authenticated
  using (labor_site_id in (select id from public.labor_sites where contractor_id = public.labor_my_contractor_id()))
  with check (labor_site_id in (select id from public.labor_sites where contractor_id = public.labor_my_contractor_id()));

do $$
declare t text;
begin
  foreach t in array array['labor_front_members', 'labor_front_progress']
  loop
    execute format('drop policy if exists %1$s_own on public.%1$s', t);
    execute format(
      'create policy %1$s_own on public.%1$s for all to authenticated
         using (front_id in (select f.id from public.labor_fronts f join public.labor_sites s on s.id = f.labor_site_id
                             where s.contractor_id = public.labor_my_contractor_id()))
         with check (front_id in (select f.id from public.labor_fronts f join public.labor_sites s on s.id = f.labor_site_id
                                  where s.contractor_id = public.labor_my_contractor_id()))', t);
  end loop;
end $$;

-- Catálogos: lectura para usuarios autenticados.
do $$
declare t text;
begin
  foreach t in array array['labor_courses', 'labor_quote_catalog', 'labor_benefits']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select to authenticated using (true)', t);
  end loop;
end $$;

-- ─────────────────────────── Funciones ───────────────────────────

-- Registrar avance del día y marcar terminado si se completó el volumen.
create or replace function public.labor_record_progress(p_front_id uuid, p_quantity numeric, p_reason text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.labor_front_progress (front_id, quantity, delay_reason)
  values (p_front_id, p_quantity, p_reason);

  update public.labor_fronts f
     set completed = f.done_before + (select coalesce(sum(quantity), 0) from public.labor_front_progress where front_id = f.id) >= f.quantity
   where f.id = p_front_id;
end $$;

-- Verificación pública del gafete (lo que ve quien escanea el QR).
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
        'title', co.title, 'type', co.credential_type, 'issuer', co.issuer,
        'folio', cr.folio, 'issued_on', cr.issued_on, 'renew_on', cr.renew_on) order by co.sort)
      from public.labor_credentials cr
      join public.labor_courses co on co.id = cr.course_id
      where cr.worker_id = w.id), '[]'::jsonb))
  from public.labor_workers w
  join public.labor_contractors c on c.id = w.contractor_id
  where w.verify_code = p_code and w.active
$$;

grant execute on function public.labor_verify_badge(text) to anon, authenticated;
grant execute on function public.labor_record_progress(uuid, numeric, text) to authenticated;
grant execute on function public.labor_my_contractor_id() to authenticated;

-- ─────────────────────────── Catálogos ───────────────────────────

insert into public.labor_courses (id, title, credential_type, issuer, audience, hours_label, modality, price, discount_by_level, renew_years, recommended_for, sort) values
  ('seguridad', 'Seguridad básica en obra', 'buildi', 'BuildI', 'crew', '2 h', 'En la app · sin internet', 0, '{"bronce": 1, "plata": 1, "oro": 1}', 2, null, 1),
  ('alturas', 'Trabajo en alturas (NOM-009)', 'dc3', 'Agente capacitador aliado · registro STPS', 'crew', '8 h', 'Presencial · sábado', 950, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, 'Recomendado para trabajar a más de 1.8 m', 2),
  ('construccion', 'Seguridad en obras de construcción (NOM-031)', 'dc3', 'Agente capacitador aliado · registro STPS', 'crew', '8 h', 'Presencial · sábado', 900, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, null, 3),
  ('epp', 'Uso de equipo de protección (NOM-017)', 'dc3', 'Agente capacitador aliado · registro STPS', 'crew', '4 h', 'Presencial en obra', 600, '{"bronce": 0, "plata": 0.5, "oro": 1}', 1, null, 4),
  ('albanil', 'Certificación de albañil', 'conocer', 'CONOCER · evaluador acreditado', 'crew', 'Evaluación en obra', 'Con evaluador acreditado', 2800, '{"bronce": 0, "plata": 0.25, "oro": 0.5}', null, null, 5),
  ('cotizar', 'Cómo cotizar a destajo', 'buildi', 'BuildI', 'contractor', '3 h', 'En la app', 0, '{"bronce": 1, "plata": 1, "oro": 1}', null, null, 6),
  ('finanzas', 'Finanzas de tu cuadrilla: raya, IMSS e impuestos', 'buildi', 'BuildI', 'contractor', '3 h', 'En la app', 0, '{"bronce": 1, "plata": 1, "oro": 1}', null, null, 7)
on conflict (id) do update set
  title = excluded.title, credential_type = excluded.credential_type, issuer = excluded.issuer, audience = excluded.audience,
  hours_label = excluded.hours_label, modality = excluded.modality, price = excluded.price,
  discount_by_level = excluded.discount_by_level, renew_years = excluded.renew_years,
  recommended_for = excluded.recommended_for, sort = excluded.sort;

insert into public.labor_quote_catalog (id, description, unit, default_unit_price, rate_per_person_day, market_unit_price, sort) values
  ('block15', 'Muro de block 15 cm', 'm²', 185, 9, 172, 1),
  ('aplanado', 'Aplanado fino', 'm²', 95, 16, 98, 2),
  ('tablaroca', 'Tablaroca muro', 'm²', 160, 12, 151, 3),
  ('porcelanato', 'Piso porcelanato', 'm²', 210, 10, 225, 4),
  ('pintura', 'Pintura vinílica 2 manos', 'm²', 38, 45, 36, 5),
  ('salida', 'Salida eléctrica', 'pza', 350, 6, 380, 6)
on conflict (id) do update set
  description = excluded.description, unit = excluded.unit, default_unit_price = excluded.default_unit_price,
  rate_per_person_day = excluded.rate_per_person_day, market_unit_price = excluded.market_unit_price, sort = excluded.sort;

insert into public.labor_benefits (id, title, summary, icon, min_level, by_level, partner, how, sort) values
  ('cobro', 'Cobro en 48 h', 'Cobra la estimación firmada sin esperar a la constructora.', 'flash', 'bronce',
   '{"bronce": "Comisión 2.5%", "plata": "Comisión 1.8%", "oro": "Comisión 1.2%"}', 'Con un aliado financiero',
   '["El residente firma la estimación en la app.", "El dinero de la constructora ya está en resguardo en BuildI.", "Te lo adelantamos en 48 h y descontamos la comisión de tu nivel."]', 1),
  ('herramienta', 'Descuento en herramienta y equipo de protección', 'Precio de volumen con proveedores BuildI.', 'construct', 'bronce',
   '{"bronce": "5% de descuento", "plata": "8% de descuento", "oro": "12% de descuento"}', 'Proveedores BuildI',
   '["Compra desde la app o en sucursal mostrando tu gafete BuildI.", "Te llega a la obra o al taller."]', 2),
  ('cursos', 'Cursos BuildI gratis', 'Seguridad, cotizar a destajo y finanzas de tu cuadrilla.', 'school', 'bronce', null, null,
   '["Clases cortas en video que se descargan para verlas sin internet.", "Al aprobar, la constancia queda en el gafete de cada persona."]', 3),
  ('seguro', 'Seguro de accidentes para tu cuadrilla', 'Cubre a tu gente mientras está en obra.', 'medkit', 'plata',
   '{"bronce": "Con costo por persona", "plata": "Incluido hasta 15 personas", "oro": "Incluido para toda tu gente"}', 'Con una aseguradora aliada',
   '["Se activa con el pase de lista de cada día.", "Si hay un accidente, lo reportas desde la app con foto."]', 4),
  ('adelanto', 'Adelanto de raya para tu gente', 'Tus trabajadores cobran parte de lo ya trabajado antes del sábado, sin que tú pongas el dinero.', 'cash', 'plata', null, 'Con un aliado financiero',
   '["Solo sobre días ya trabajados y registrados.", "Se descuenta solo de la raya del sábado."]', 5),
  ('destacado', 'Perfil destacado', 'Apareces primero cuando una constructora busca mano de obra.', 'star', 'plata', null, null,
   '["Tu ficha muestra tus números verificados: entregas, ajustes y calificación."]', 6),
  ('raya', 'Raya garantizada', 'Con la estimación firmada, la raya del sábado sale aunque la constructora no haya pagado.', 'shield-checkmark', 'oro', null, 'Con un aliado financiero',
   '["Aplica a estimaciones firmadas por el residente.", "BuildI cobra después a la constructora."]', 7),
  ('credito', 'Crédito para equipo', 'Revolvedora, andamios o herramienta, pagando con tus estimaciones.', 'card', 'oro',
   '{"bronce": "No disponible", "plata": "No disponible", "oro": "Hasta $150,000"}', 'Con un aliado financiero',
   '["Se aprueba con tu historial en BuildI, sin buró.", "Se paga con un porcentaje de cada estimación."]', 8),
  ('prioridad', 'Prioridad en obras grandes', 'Te avisamos primero de las obras que necesitan tu especialidad.', 'trophy', 'oro', null, null,
   '["Cuando un frente tuyo va al 80%, te mostramos las siguientes obras cerca."]', 9)
on conflict (id) do update set
  title = excluded.title, summary = excluded.summary, icon = excluded.icon, min_level = excluded.min_level,
  by_level = excluded.by_level, partner = excluded.partner, how = excluded.how, sort = excluded.sort;

-- ─────────────────────────── Datos de ejemplo ───────────────────────────
-- Crea "Mano de Obra Pérez" para el usuario que la llama (botón "Cargar
-- datos de ejemplo" en la app). Si ya tiene contratista, no hace nada.

create or replace function public.labor_seed_demo()
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_c uuid;
  v_site_a uuid;
  v_site_b uuid;
  v_alb uuid;
  v_aca uuid;
  v_tab uuid;
begin
  if v_uid is null then
    raise exception 'Necesitas iniciar sesión';
  end if;

  select id into v_c from public.labor_contractors where owner_id = v_uid;
  if v_c is not null then
    return v_c;
  end if;

  insert into public.labor_contractors (owner_id, display_name, business_name, city, email, phone, years_experience)
  values (v_uid, 'Ramiro Pérez', 'Mano de Obra Pérez', 'Guadalajara', 'ramiro.perez@ejemplo.com', '+52 33 0000 0000', 12)
  returning id into v_c;

  insert into public.labor_contractor_metrics (contractor_id, on_time_rate, adjusted_share, builder_rating, months_on_buildi)
  values (v_c, 0.92, 0.018, 4.7, 14);

  insert into public.labor_sites (contractor_id, name, builder_name, sort) values (v_c, 'Torre Alameda', 'Constructora Torres', 1) returning id into v_site_a;
  insert into public.labor_sites (contractor_id, name, builder_name, sort) values (v_c, 'Depto 6B', 'Constructora Torres', 2) returning id into v_site_b;

  insert into public.labor_crews (contractor_id, name, site_label, status, efficiency, height_note, sort)
  values (v_c, 'Cuadrilla Albañilería', 'Torre Alameda', 'active', 95, 'el nivel 3 de Torre Alameda', 1) returning id into v_alb;
  insert into public.labor_crews (contractor_id, name, site_label, status, efficiency, height_note, sort)
  values (v_c, 'Cuadrilla Acabados', 'Torre Alameda', 'active', 88, 'andamios a 2.5 m en Torre Alameda', 2) returning id into v_aca;
  insert into public.labor_crews (contractor_id, name, site_label, status, efficiency, height_note, sort)
  values (v_c, 'Cuadrilla Tablaroca y Pisos', 'Torre Alameda · Depto 6B', 'break', 92, null, 3) returning id into v_tab;

  insert into public.labor_workers (contractor_id, crew_id, code, full_name, trade, level, color, imss_registered, joined_year)
  select v_c,
         case r.crew when 'alb' then v_alb when 'aca' then v_aca else v_tab end,
         r.code, r.name, r.trade, r.level, r.color, r.imss, r.yr
  from (values
    ('JL', 'Juan López', 'Albañil · cabo', 'oficial', 'alb', '#2563EB', true, 2021),
    ('MA', 'Miguel Ángel Ruiz', 'Albañil', 'oficial', 'alb', '#7C3AED', true, 2022),
    ('IC', 'Iván Cruz', 'Albañil', 'oficial', 'alb', '#DB2777', true, 2024),
    ('EG', 'Esteban García', 'Ayudante general', 'ayudante', 'alb', '#059669', true, 2025),
    ('AM', 'Arturo Méndez', 'Albañil', 'maestro', 'alb', '#B45309', true, 2019),
    ('RN', 'Rogelio Navarro', 'Albañil', 'oficial', 'alb', '#0891B2', true, 2023),
    ('DF', 'Daniel Flores', 'Ayudante general', 'ayudante', 'alb', '#4B5563', true, 2026),
    ('SL', 'Saúl Lara', 'Ayudante general', 'ayudante', 'alb', '#9333EA', true, 2026),
    ('CV', 'Carlos Vega', 'Yesero · cabo', 'oficial', 'aca', '#0F766E', true, 2020),
    ('PS', 'Pedro Sánchez', 'Ayudante general', 'ayudante', 'aca', '#DC2626', true, 2025),
    ('JD', 'Jorge Domínguez', 'Pintor', 'oficial', 'aca', '#65A30D', true, 2022),
    ('MR', 'Mario Ríos', 'Pintor', 'oficial', 'aca', '#EA580C', true, 2023),
    ('FG', 'Felipe Gómez', 'Ayudante general', 'ayudante', 'aca', '#6366F1', true, 2026),
    ('OH', 'Óscar Hernández', 'Yesero', 'oficial', 'aca', '#0284C7', true, 2024),
    ('NA', 'Noé Aguilar', 'Ayudante general', 'ayudante', 'aca', '#A16207', true, 2026),
    ('GT', 'Gilberto Torres', 'Pintor', 'maestro', 'aca', '#BE185D', true, 2018),
    ('BM', 'Beto Morales', 'Pisero · cabo', 'maestro', 'tab', '#C2410C', true, 2019),
    ('TR', 'Toño Ramírez', 'Ayudante general', 'ayudante', 'tab', '#0E7490', false, 2026),
    ('LR', 'Luis Ramos', 'Tablaroquero', 'oficial', 'tab', '#D97706', true, 2022),
    ('HT', 'Hugo Treviño', 'Ayudante general', 'ayudante', 'tab', '#4338CA', true, 2025),
    ('EC', 'Eduardo Castro', 'Tablaroquero', 'oficial', 'tab', '#15803D', true, 2023),
    ('RV', 'Raúl Villa', 'Pisero', 'oficial', 'tab', '#9F1239', true, 2021),
    ('KP', 'Kevin Pineda', 'Ayudante general', 'ayudante', 'tab', '#475569', true, 2026),
    ('AS', 'Alan Solís', 'Ayudante general', 'ayudante', 'tab', '#7E22CE', true, 2026)
  ) as r(code, name, trade, level, crew, color, imss, yr);

  update public.labor_crews c set lead_worker_id = w.id
    from public.labor_workers w
   where w.contractor_id = v_c
     and ((c.id = v_alb and w.code = 'JL') or (c.id = v_aca and w.code = 'CV') or (c.id = v_tab and w.code = 'BM'));

  -- Historial de obras
  insert into public.labor_worker_sites (worker_id, site_name, year)
  select w.id, s.name, 2026
  from public.labor_workers w
  cross join lateral unnest(case when w.crew_id = v_tab then array['Torre Alameda', 'Depto 6B'] else array['Torre Alameda'] end) as s(name)
  where w.contractor_id = v_c;
  insert into public.labor_worker_sites (worker_id, site_name, year)
  select id, 'Residencial Las Lomas', 2025 from public.labor_workers where contractor_id = v_c and joined_year <= 2024;
  insert into public.labor_worker_sites (worker_id, site_name, year)
  select id, 'Plaza Centro Sur', 2023 from public.labor_workers where contractor_id = v_c and joined_year <= 2021;

  -- Pase de lista de hoy
  insert into public.labor_attendance (worker_id, work_date, status, checked_in_at)
  select id, current_date, case when code = 'IC' then 'absent' when code = 'MA' then 'late' else 'present' end,
         case when code = 'IC' then null else now() end
  from public.labor_workers where contractor_id = v_c;

  -- Constancias
  insert into public.labor_credentials (worker_id, course_id, folio, issued_on, renew_on, verified_by)
  select w.id, h.course_id,
         h.prefix || '-' || to_char(current_date, 'YYYY') || '-' || upper(substr(md5(w.id::text || h.course_id), 1, 6)),
         current_date - (30 + abs(hashtext(w.code || h.course_id)) % 150),
         case
           when w.code = 'MA' and h.course_id = 'alturas' then current_date + 20
           when co.renew_years is null then null
           else (current_date - (30 + abs(hashtext(w.code || h.course_id)) % 150) + make_interval(years => co.renew_years))::date
         end,
         case co.credential_type when 'buildi' then 'Residente de obra' when 'dc3' then 'Agente capacitador' else 'Evaluador CONOCER' end
  from (values
    ('seguridad', 'BLD', array['JL', 'MA', 'IC', 'EG', 'AM', 'RN', 'CV', 'PS', 'JD', 'MR', 'OH', 'GT', 'BM', 'TR', 'LR', 'HT', 'EC', 'RV']),
    ('alturas', 'DC3', array['JL', 'MA', 'AM', 'CV', 'JD', 'GT', 'LR', 'EC', 'BM']),
    ('construccion', 'DC3', array['JL', 'AM', 'CV', 'GT', 'BM', 'RV']),
    ('epp', 'DC3', array['JL', 'MA', 'IC', 'AM', 'RN', 'CV', 'JD', 'MR', 'GT', 'OH', 'BM', 'LR', 'RV', 'EC']),
    ('albanil', 'CON', array['AM', 'JL'])
  ) as h(course_id, prefix, holders)
  join public.labor_courses co on co.id = h.course_id
  join public.labor_workers w on w.contractor_id = v_c and w.code = any (h.holders);

  -- Cursos del contratista
  insert into public.labor_enrollments (contractor_id, course_id, status, progress)
  values (v_c, 'cotizar', 'in_progress', 0.6);

  -- Frentes (done_before = avance antes de esta semana)
  insert into public.labor_fronts (labor_site_id, item_code, description, unit, quantity, done_before, unit_price, people_needed, rate_per_person_day, at_height_note, blocked_reason, completed, sort) values
    (v_site_a, 'ALB-015', 'Muro de block 15 cm', 'm²', 420, 166, 185, 4, 9, 'el nivel 3', null, false, 1),
    (v_site_a, 'ALB-030', 'Aplanado fino en muros', 'm²', 840, 150, 95, 3, 16, 'andamios a 2.5 m', null, false, 2),
    (v_site_a, 'TAB-010', 'Tablaroca muro divisorio', 'm²', 260, 30, 160, 2, 12, null, null, false, 3),
    (v_site_a, 'PIS-060', 'Piso porcelanato 60×60', 'm²', 380, 0, 210, 2, 10, null, 'Falta porcelanato: llega el jueves', false, 4),
    (v_site_a, 'CIM-008', 'Firme de concreto 8 cm', 'm²', 120, 60, 140, 0, 20, null, null, true, 5),
    (v_site_b, 'DEM-001', 'Demolición de muro de cocina', 'm²', 18, 0, 120, 0, 8, null, null, true, 1),
    (v_site_b, 'PIN-002', 'Pintura vinílica 2 manos', 'm²', 160, 0, 38, 1, 45, null, null, false, 2);

  insert into public.labor_front_members (front_id, worker_id)
  select f.id, w.id
  from (values
    ('ALB-015', array['JL', 'MA', 'IC', 'EG']),
    ('ALB-030', array['CV', 'PS', 'JD']),
    ('TAB-010', array['LR', 'HT']),
    ('PIS-060', array['BM', 'TR']),
    ('PIN-002', array['JD'])
  ) as m(item_code, codes)
  join public.labor_fronts f on f.item_code = m.item_code and f.labor_site_id in (v_site_a, v_site_b)
  join public.labor_workers w on w.contractor_id = v_c and w.code = any (m.codes);

  insert into public.labor_front_progress (front_id, work_date, quantity)
  select f.id, current_date, p.qty
  from (values ('ALB-015', 120), ('ALB-030', 260), ('TAB-010', 120), ('CIM-008', 60), ('DEM-001', 18), ('PIN-002', 40)) as p(item_code, qty)
  join public.labor_fronts f on f.item_code = p.item_code and f.labor_site_id in (v_site_a, v_site_b);

  -- Expediente de cumplimiento
  insert into public.labor_compliance_docs (contractor_id, kind, name, detail, expires_on, sort) values
    (v_c, 'repse', 'Registro REPSE', 'STPS · obras especializadas', (current_date + interval '30 months')::date, 1),
    (v_c, 'imss', 'Opinión de cumplimiento IMSS', 'La constructora la pide cada mes', current_date - 7, 2),
    (v_c, 'infonavit', 'Opinión de cumplimiento Infonavit', 'La constructora la pide cada mes', current_date + 24, 3),
    (v_c, 'sat', 'Opinión de cumplimiento SAT (32-D)', 'Positiva', current_date + 5, 4),
    (v_c, 'contract', 'Contrato de destajo · Torre Alameda', 'Firmado por ambas partes', null, 5);

  return v_c;
end $$;

grant execute on function public.labor_seed_demo() to authenticated;
