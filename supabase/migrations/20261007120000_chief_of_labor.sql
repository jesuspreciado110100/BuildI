-- BuildI · Contratista de mano de obra (chief-of-labor)
--
-- Las obras son los proyectos reales de BuildI (public.projects). El
-- contratista liga los proyectos donde trabaja y de esa liga cuelgan sus
-- frentes, el pase de lista y las entradas que registra el residente.
--
-- Cada obra guarda su zona horaria en projects.timezone. "Hoy" es el día en
-- la obra, no el del servidor (UTC): a las 7 pm en Guadalajara ya es mañana
-- en UTC, y en Cancún o Tijuana la hora es otra.
--
-- No hay datos de ejemplo: cada contratista da de alta su negocio, su gente
-- y sus frentes desde la app, y toma los conceptos del catálogo de la obra.
--
-- Todas las tablas labor_* tienen RLS. Lo que cambia el nivel BuildI Pro
-- (métricas, revisión del expediente) no lo puede escribir el contratista.
-- Requiere las tablas de la app public.projects y public.users; lee
-- public.catalog_items si existe.

create extension if not exists pgcrypto;

-- La versión anterior de estas tablas (obras sueltas y datos de ejemplo) no
-- se puede convertir sola: se detiene aquí con las instrucciones.
do $$
begin
  if to_regclass('public.labor_sites') is not null
     and not exists (select 1 from information_schema.columns
                      where table_schema = 'public' and table_name = 'labor_sites' and column_name = 'project_id') then
    raise exception using
      message = 'Hay una versión anterior de las tablas labor_* (con datos de ejemplo).',
      hint = 'Bórrala con el SQL de "Si corriste la versión anterior" en docs/chief-of-labor/SUPABASE.md y vuelve a correr las migraciones.';
  end if;
end $$;

-- ─────────────────────────── Zona horaria de cada obra ───────────────────────────

alter table public.projects add column if not exists timezone text;

comment on column public.projects.timezone is
  'Zona horaria IANA de la obra (America/Mexico_City, America/Cancun, America/Tijuana…). Define qué día es en la obra para el pase de lista y el avance.';

-- Solo nombres IANA tipo Region/Ciudad que Postgres reconoce.
create or replace function public.labor_valid_timezone(p_tz text)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
begin
  if p_tz is null or p_tz !~ '^[A-Za-z]+(/[A-Za-z0-9_+-]+)+$' then
    return false;
  end if;
  perform now() at time zone p_tz;
  return true;
exception when others then
  return false;
end $$;

-- Longitud de una frontera a cierta latitud. p_points = [lat, lng, lat, lng, …]
-- con latitudes crecientes; entre puntos se interpola en línea recta.
create or replace function public.labor_border_lng(p_lat double precision, p_points double precision[])
returns double precision
language plpgsql
immutable
set search_path = ''
as $$
declare
  i int;
begin
  for i in 1 .. array_length(p_points, 1) / 2 - 1 loop
    if p_lat <= p_points[2 * i + 1] or i = array_length(p_points, 1) / 2 - 1 then
      return p_points[2 * i]
        + (p_lat - p_points[2 * i - 1]) / (p_points[2 * i + 1] - p_points[2 * i - 1]) * (p_points[2 * i + 2] - p_points[2 * i]);
    end if;
  end loop;
  return p_points[2];
end $$;

-- Zona horaria de una obra en México con sus coordenadas, su código postal
-- o su dirección (en ese orden). Desde 2022 casi todo el país es UTC-6 sin
-- horario de verano; las excepciones son Quintana Roo (UTC-5), el Pacífico
-- (UTC-7: Sonora, Sinaloa, BCS y Nayarit), Baja California (UTC-8) y la
-- franja fronteriza que cambia de horario con Estados Unidos.
create or replace function public.labor_guess_timezone(p_location text, p_lat text, p_lng text)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  lat double precision;
  lng double precision;
  cp int;
  place text;
  tz text;
begin
  -- 1. Coordenadas
  if p_lat ~ '^\s*-?\d+(\.\d+)?\s*$' and p_lng ~ '^\s*-?\d+(\.\d+)?\s*$' then
    lat := p_lat::double precision;
    lng := p_lng::double precision;
    if lat between 14.3 and 32.8 and lng between -118.5 and -86.5 then
      tz := case
        when lat >= 28.0
         and lng < public.labor_border_lng(lat, array[28.0, -112.6, 29.0, -113.1, 31.3, -114.4, 32.0, -114.95, 32.8, -114.95])
          then 'America/Tijuana'
        when lat between 31.25 and 31.85 and lng between -106.95 and -106.0
          then 'America/Ciudad_Juarez'
        when lat >= 22.75
         and lng < public.labor_border_lng(lat, array[22.75, -105.5, 23.5, -105.8, 24.4, -106.3, 25.0, -107.1, 26.0, -107.8,
                                                     26.7, -108.0, 27.3, -108.65, 28.5, -108.6, 31.4, -108.2, 32.8, -108.2])
          then case when lat >= 28.0 or (lat >= 26.3 and lng > -111.5) then 'America/Hermosillo' else 'America/Mazatlan' end
        when lat >= 20.95 and lat < 22.75 and lng < -104.25
          then 'America/Mazatlan'
        when lat >= 20.68 and lat < 20.95 and lng between -105.6 and -105.15
          then 'America/Bahia_Banderas'
        when lat between 17.8 and 21.7
         and lng > public.labor_border_lng(lat, array[17.8, -89.15, 19.6, -89.15, 19.8, -88.95, 20.2, -88.55, 20.62, -87.85, 21.7, -87.5])
          then 'America/Cancun'
        else 'America/Mexico_City'
      end;
    end if;
  end if;

  -- 2. Código postal (los dos primeros dígitos dicen el estado)
  if tz is null and p_location is not null then
    cp := coalesce(substring(p_location from '[Cc]\.?\s?[Pp]\.?\s*(\d{5})'), substring(p_location from '\m(\d{5})\M'))::int;
    tz := case
      when cp is null then null
      when cp between 21000 and 22999 then 'America/Tijuana'
      when cp between 23000 and 23999 then 'America/Mazatlan'
      when cp between 77000 and 77999 then 'America/Cancun'
      when cp between 80000 and 82999 then 'America/Mazatlan'
      when cp between 83000 and 85999 then 'America/Hermosillo'
      when cp between 63730 and 63739 then 'America/Bahia_Banderas'
      when cp between 63000 and 63999 then 'America/Mazatlan'
      when cp between 32000 and 32799 then 'America/Ciudad_Juarez'
      when cp between 26000 and 26299 or cp between 87300 and 87599 or cp between 88000 and 88999 then 'America/Matamoros'
      when cp between 1000 and 99999 then 'America/Mexico_City'
    end;
  end if;

  -- 3. Ciudad o estado en las últimas partes de la dirección (no la calle:
  --    "Av. Baja California" o "Calle Sonora" están en Guadalajara y la CDMX).
  if tz is null and p_location is not null then
    select string_agg(seg, ' ') into place
    from (
      select lower(translate(trim(s), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')) as seg
      from unnest(string_to_array(p_location, ',')) with ordinality as u(s, ord)
      order by ord desc
      limit 3
    ) last_parts
    where seg !~ '\d'
      and seg !~ '^(calle|av|avenida|blvd|boulevard|bulevar|calz|calzada|prol|prolongacion|privada|priv|cerrada|andador|carretera|carr|eje|circuito|paseo)\M';
    tz := case
      when place ~ '(quintana roo|\mq\.? ?roo\M|\mq\.? ?r\.|cancun|playa del carmen|tulum|cozumel|chetumal|bacalar|isla mujeres|puerto morelos|holbox|mahahual)'
        then 'America/Cancun'
      when place ~ '(baja california sur|\mb\.? ?c\.? ?s\M|los cabos|cabo san lucas|san jose del cabo)'
        then 'America/Mazatlan'
      when place ~ '(baja california|\mb\.? ?c\M|tijuana|mexicali|ensenada|tecate|rosarito)'
        then 'America/Tijuana'
      when place ~ '(sonora|hermosillo|obregon|guaymas|navojoa|puerto penasco|san luis rio colorado)'
        then 'America/Hermosillo'
      when place ~ '(bahia de banderas|nuevo vallarta|bucerias|punta (de )?mita|sayulita|san pancho)'
        then 'America/Bahia_Banderas'
      when place ~ '(sinaloa|mazatlan|culiacan|los mochis|nayarit|tepic)'
        then 'America/Mazatlan'
      when place ~ '(ciudad juarez|\mcd\.? ?juarez)'
        then 'America/Ciudad_Juarez'
      when place ~ '(nuevo laredo|reynosa|piedras negras|ciudad acuna|\mcd\.? ?acuna)'
        then 'America/Matamoros'
    end;
  end if;

  tz := coalesce(tz, 'America/Mexico_City');
  if not public.labor_valid_timezone(tz) then
    -- Postgres con datos de zonas horarias anteriores a 2022.
    tz := case when tz = 'America/Ciudad_Juarez' then 'America/Denver' else 'America/Mexico_City' end;
  end if;
  return tz;
end $$;

-- Llena la zona horaria de las obras nuevas (o con una zona inválida). Nunca
-- impide guardar el proyecto: si algo falla, queda la hora del centro.
create or replace function public.labor_projects_fill_timezone()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  p jsonb;
begin
  if tg_op = 'UPDATE' and new.timezone is not distinct from old.timezone and new.timezone is not null then
    return new;
  end if;
  if public.labor_valid_timezone(new.timezone) then
    return new;
  end if;
  begin
    p := to_jsonb(new);
    new.timezone := public.labor_guess_timezone(p ->> 'location', p ->> 'latitude', p ->> 'longitude');
  exception when others then
    new.timezone := 'America/Mexico_City';
  end;
  return new;
end $$;

drop trigger if exists labor_projects_fill_timezone on public.projects;
create trigger labor_projects_fill_timezone
  before insert or update on public.projects
  for each row execute function public.labor_projects_fill_timezone();

-- Obras que ya existen: se guarda su zona horaria una vez (el trigger la calcula).
update public.projects set timezone = timezone where not public.labor_valid_timezone(timezone);

-- Zona horaria de una obra. security definer: el contratista puede no tener
-- permiso de leer el proyecto completo.
create or replace function public.labor_project_timezone(p_project_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.timezone from public.projects p
      where p.project_id = p_project_id and public.labor_valid_timezone(p.timezone)),
    'America/Mexico_City')
$$;

create or replace function public.labor_local_date(p_tz text)
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone coalesce(p_tz, 'America/Mexico_City'))::date
$$;

-- ─────────────────────────── Contratista ───────────────────────────

create table if not exists public.labor_contractors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0),
  business_name text not null check (length(trim(business_name)) > 0),
  legal_name text,           -- razón social; va en la DC-3
  rfc text check (rfc is null or rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  city text,
  email text,
  phone text,
  years_experience int check (years_experience between 0 and 80),
  avg_daily_wage numeric(10,2) check (avg_daily_wage > 0), -- raya promedio por persona al día (solo la ve el contratista)
  created_at timestamptz not null default now()
);

-- Personal de BuildI que revisa expedientes y constancias externas. Se da de
-- alta desde el panel de Supabase.
create table if not exists public.labor_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Insumos del puntaje BuildI Pro que llegan de otros procesos (estimaciones
-- firmadas, ajustes del residente, calificaciones). null = todavía sin datos.
-- Solo se escriben con la llave de servicio, nunca desde la app.
create table if not exists public.labor_contractor_metrics (
  contractor_id uuid primary key references public.labor_contractors(id) on delete cascade,
  on_time_rate numeric(4,3) check (on_time_rate between 0 and 1),
  adjusted_share numeric(5,4) check (adjusted_share >= 0),
  builder_rating numeric(2,1) check (builder_rating between 0 and 5),
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

create or replace function public.labor_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.labor_admins where user_id = auth.uid())
$$;

-- ¿El usuario es la constructora dueña del proyecto?
create or replace function public.labor_is_project_builder(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
     where p.project_id = p_project_id and (to_jsonb(p) ->> 'builder_id') = auth.uid()::text)
$$;

-- ─────────────────────────── Obras ───────────────────────────

-- Proyectos de BuildI donde trabaja el contratista. Desligar = active false
-- (el historial de asistencia y avance se queda).
create table if not exists public.labor_sites (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  unique (contractor_id, project_id)
);

-- ─────────────────────────── Cuadrillas y gente ───────────────────────────

create table if not exists public.labor_crews (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  labor_site_id uuid references public.labor_sites(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  status text not null default 'active' check (status in ('active', 'break', 'inactive')),
  height_note text,          -- si trabaja en altura, dónde (activa la recomendación de alturas)
  lead_worker_id uuid,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.labor_workers (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  crew_id uuid references public.labor_crews(id) on delete set null,
  code text not null,        -- iniciales del avatar; el servidor las pone si llegan vacías
  full_name text not null check (length(trim(full_name)) > 0),
  trade text not null,
  level text not null default 'ayudante' check (level in ('ayudante', 'oficial', 'maestro')),
  color text not null default '#2563EB',
  curp text check (curp is null or curp ~ '^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HMX][A-Z]{5}[A-Z0-9][0-9]$'), -- va en la DC-3
  imss_registered boolean not null default false,
  joined_year int check (joined_year between 1950 and 2100),
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

-- Iniciales si no llegan (sin repetir dentro del contratista) y código de
-- verificación que nadie puede elegir ni cambiar.
create or replace function public.labor_workers_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base text;
  n int := 1;
begin
  if tg_op = 'UPDATE' then
    new.verify_code := old.verify_code;
    new.contractor_id := old.contractor_id;
    return new;
  end if;

  new.verify_code := 'BLD-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  if new.code is null or trim(new.code) = '' then
    select upper(string_agg(left(w, 1), '' order by i)) into base
      from unnest(regexp_split_to_array(trim(new.full_name), '\s+')) with ordinality as t(w, i)
     where i <= 2;
    base := coalesce(base, 'XX');
    new.code := base;
    while exists (select 1 from public.labor_workers where contractor_id = new.contractor_id and code = new.code) loop
      n := n + 1;
      new.code := base || n;
    end loop;
  end if;
  new.joined_year := coalesce(new.joined_year, extract(year from now())::int);
  return new;
end $$;

drop trigger if exists labor_workers_defaults on public.labor_workers;
create trigger labor_workers_defaults
  before insert or update on public.labor_workers
  for each row execute function public.labor_workers_defaults();

-- Pase de lista diario. work_date es el día en la zona horaria de la obra.
create table if not exists public.labor_attendance (
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  work_date date not null,
  labor_site_id uuid references public.labor_sites(id) on delete set null,
  status text not null check (status in ('present', 'late', 'absent')),
  checked_in_at timestamptz,
  source text not null default 'contractor' check (source in ('contractor', 'scan')),
  recorded_by uuid default auth.uid(),
  primary key (worker_id, work_date)
);

-- Obras donde ha trabajado cada persona (de su asistencia real); se muestra en el gafete.
create or replace view public.labor_worker_site_days
with (security_invoker = true) as
select a.worker_id, a.labor_site_id, extract(year from a.work_date)::int as year, count(*)::int as days
from public.labor_attendance a
where a.labor_site_id is not null and a.status in ('present', 'late')
group by a.worker_id, a.labor_site_id, extract(year from a.work_date);

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
  catalog_item_id text,      -- concepto del catálogo de la obra (catalog_items.item_id), si salió de ahí
  item_code text,
  description text not null check (length(trim(description)) > 0),
  unit text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  done_before numeric(12,2) not null default 0 check (done_before >= 0), -- avance previo a usar la app
  unit_price numeric(10,2) not null check (unit_price > 0),             -- precio a destajo por unidad
  people_needed int not null default 0 check (people_needed >= 0),
  rate_per_person_day numeric(8,2) not null default 1 check (rate_per_person_day > 0),
  at_height_note text,       -- p. ej. "el nivel 3"; activa la recomendación de alturas
  blocked_reason text,
  due_on date,
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
  work_date date not null,   -- día en la zona horaria de la obra
  quantity numeric(12,2) not null check (quantity > 0),
  delay_reason text,
  photo_url text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- ¿El usuario es la constructora de la obra de esta liga?
create or replace function public.labor_is_site_builder(p_labor_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.labor_sites s
     where s.id = p_labor_site_id and public.labor_is_project_builder(s.project_id))
$$;

-- Zona horaria de la obra de un frente.
create or replace function public.labor_site_timezone(p_labor_site_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select public.labor_project_timezone(s.project_id) from public.labor_sites s where s.id = p_labor_site_id),
    'America/Mexico_City')
$$;

-- "Esta semana" empieza el lunes en la hora de la obra.
create or replace view public.labor_fronts_summary
with (security_invoker = true) as
select
  f.*,
  f.done_before + coalesce(sum(p.quantity), 0) as done,
  coalesce(sum(p.quantity) filter (where p.work_date >= w.week_start), 0) as week
from public.labor_fronts f
cross join lateral (
  select date_trunc('week', public.labor_local_date(public.labor_site_timezone(f.labor_site_id)))::date as week_start
) w
left join public.labor_front_progress p on p.front_id = f.id
group by f.id, w.week_start;

-- ─────────────────────────── Cotizaciones ───────────────────────────

-- Propuesta a destajo para un concepto de una obra ligada. La ve la
-- constructora dueña del proyecto; la raya y la utilidad no se guardan aquí
-- (solo las ve el contratista en su teléfono).
create table if not exists public.labor_quotes (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  labor_site_id uuid not null references public.labor_sites(id) on delete cascade,
  catalog_item_id text,
  description text not null,
  unit text not null,
  volume numeric(12,2) not null check (volume > 0),
  people int not null check (people > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),
  est_days int not null check (est_days > 0),
  status text not null default 'sent' check (status in ('sent', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

-- ─────────────────────────── Expediente y beneficios ───────────────────────────

create table if not exists public.labor_compliance_docs (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  kind text not null check (kind in ('repse', 'imss', 'infonavit', 'sat', 'contract', 'other')),
  name text not null,
  detail text,
  issued_on date,
  expires_on date,           -- la calcula el servidor según el tipo
  file_path text,            -- PDF en Storage
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create unique index if not exists labor_docs_required_kind_idx
  on public.labor_compliance_docs(contractor_id, kind)
  where kind in ('repse', 'imss', 'infonavit', 'sat');

-- Vigencia por tipo: las opiniones de cumplimiento (SAT 32-D, IMSS,
-- Infonavit) valen 30 días naturales desde su emisión; el registro REPSE,
-- 3 años. Cambiar la fecha o el archivo lo regresa a revisión.
create or replace function public.labor_compliance_docs_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.kind in ('sat', 'imss', 'infonavit') and new.issued_on is not null then
    new.expires_on := new.issued_on + 30;
  elsif new.kind = 'repse' and new.issued_on is not null then
    new.expires_on := (new.issued_on + interval '3 years')::date;
  end if;
  if tg_op = 'INSERT'
     or new.issued_on is distinct from old.issued_on
     or new.file_path is distinct from old.file_path then
    new.review_status := 'pending_review';
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.review_note := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists labor_compliance_docs_defaults on public.labor_compliance_docs;
create trigger labor_compliance_docs_defaults
  before insert or update on public.labor_compliance_docs
  for each row execute function public.labor_compliance_docs_defaults();

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
create index if not exists labor_sites_project_idx on public.labor_sites(project_id);
create index if not exists labor_crews_contractor_idx on public.labor_crews(contractor_id);
create index if not exists labor_workers_contractor_idx on public.labor_workers(contractor_id);
create index if not exists labor_workers_crew_idx on public.labor_workers(crew_id);
create index if not exists labor_attendance_site_idx on public.labor_attendance(labor_site_id, work_date);
create index if not exists labor_fronts_site_idx on public.labor_fronts(labor_site_id);
create index if not exists labor_front_progress_front_idx on public.labor_front_progress(front_id, work_date);
create index if not exists labor_quotes_contractor_idx on public.labor_quotes(contractor_id);
create index if not exists labor_quotes_site_idx on public.labor_quotes(labor_site_id);
create index if not exists labor_docs_contractor_idx on public.labor_compliance_docs(contractor_id);

-- ─────────────────────────── RLS y permisos ───────────────────────────

alter table public.labor_contractors enable row level security;
alter table public.labor_admins enable row level security;
alter table public.labor_contractor_metrics enable row level security;
alter table public.labor_sites enable row level security;
alter table public.labor_crews enable row level security;
alter table public.labor_workers enable row level security;
alter table public.labor_attendance enable row level security;
alter table public.labor_recommendation_actions enable row level security;
alter table public.labor_fronts enable row level security;
alter table public.labor_front_members enable row level security;
alter table public.labor_front_progress enable row level security;
alter table public.labor_quotes enable row level security;
alter table public.labor_compliance_docs enable row level security;
alter table public.labor_benefits enable row level security;
alter table public.labor_benefit_requests enable row level security;

drop policy if exists labor_contractors_own on public.labor_contractors;
create policy labor_contractors_own on public.labor_contractors
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists labor_admins_self on public.labor_admins;
create policy labor_admins_self on public.labor_admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists labor_contractor_metrics_read on public.labor_contractor_metrics;
create policy labor_contractor_metrics_read on public.labor_contractor_metrics
  for select to authenticated using (contractor_id = public.labor_my_contractor_id());

-- Ligar una obra: tiene que ser un proyecto que el usuario puede ver.
drop policy if exists labor_sites_own on public.labor_sites;
create policy labor_sites_own on public.labor_sites for all to authenticated
  using (contractor_id = public.labor_my_contractor_id())
  with check (contractor_id = public.labor_my_contractor_id()
              and exists (select 1 from public.projects p where p.project_id = labor_sites.project_id));

drop policy if exists labor_sites_builder_read on public.labor_sites;
create policy labor_sites_builder_read on public.labor_sites for select to authenticated
  using (public.labor_is_project_builder(project_id));

-- La obra de una cuadrilla tiene que ser del mismo contratista.
drop policy if exists labor_crews_own on public.labor_crews;
create policy labor_crews_own on public.labor_crews for all to authenticated
  using (contractor_id = public.labor_my_contractor_id())
  with check (contractor_id = public.labor_my_contractor_id()
              and (labor_site_id is null
                   or labor_site_id in (select id from public.labor_sites where contractor_id = public.labor_my_contractor_id())));

drop policy if exists labor_workers_own on public.labor_workers;
create policy labor_workers_own on public.labor_workers for all to authenticated
  using (contractor_id = public.labor_my_contractor_id())
  with check (contractor_id = public.labor_my_contractor_id()
              and (crew_id is null
                   or crew_id in (select id from public.labor_crews where contractor_id = public.labor_my_contractor_id())));

drop policy if exists labor_recommendation_actions_own on public.labor_recommendation_actions;
create policy labor_recommendation_actions_own on public.labor_recommendation_actions for all to authenticated
  using (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()))
  with check (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()));

-- Pase de lista: el contratista ve todo lo de su gente, pero solo escribe
-- lo que él registra; las entradas del residente llegan por labor_check_in.
drop policy if exists labor_attendance_read on public.labor_attendance;
create policy labor_attendance_read on public.labor_attendance for select to authenticated
  using (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()));
drop policy if exists labor_attendance_write on public.labor_attendance;
create policy labor_attendance_write on public.labor_attendance for all to authenticated
  using (source = 'contractor'
         and worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()))
  with check (source = 'contractor'
              and worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id())
              and (labor_site_id is null
                   or labor_site_id in (select id from public.labor_sites where contractor_id = public.labor_my_contractor_id())));

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

-- Quien mueve gente entre frentes solo puede usar a su propia gente.
drop policy if exists labor_front_members_worker on public.labor_front_members;
create policy labor_front_members_worker on public.labor_front_members as restrictive for insert to authenticated
  with check (worker_id in (select id from public.labor_workers where contractor_id = public.labor_my_contractor_id()));

-- Cotizaciones: el contratista las manda; la constructora dueña de la obra las ve y decide.
drop policy if exists labor_quotes_read on public.labor_quotes;
create policy labor_quotes_read on public.labor_quotes for select to authenticated
  using (contractor_id = public.labor_my_contractor_id() or public.labor_is_site_builder(labor_site_id));
drop policy if exists labor_quotes_insert on public.labor_quotes;
create policy labor_quotes_insert on public.labor_quotes for insert to authenticated
  with check (contractor_id = public.labor_my_contractor_id()
              and labor_site_id in (select id from public.labor_sites where contractor_id = public.labor_my_contractor_id() and active));

drop policy if exists labor_compliance_docs_own on public.labor_compliance_docs;
create policy labor_compliance_docs_own on public.labor_compliance_docs for all to authenticated
  using (contractor_id = public.labor_my_contractor_id())
  with check (contractor_id = public.labor_my_contractor_id());

drop policy if exists labor_benefits_read on public.labor_benefits;
create policy labor_benefits_read on public.labor_benefits for select to authenticated using (true);

drop policy if exists labor_benefit_requests_read on public.labor_benefit_requests;
create policy labor_benefit_requests_read on public.labor_benefit_requests for select to authenticated
  using (contractor_id = public.labor_my_contractor_id());

-- Columnas que la app puede escribir. Lo demás (fechas de alta, estado de
-- revisión, estado de cotizaciones y solicitudes, métricas) solo lo cambian
-- las funciones de abajo o la llave de servicio.
revoke insert, update on public.labor_contractors from anon, authenticated;
grant insert (display_name, business_name, legal_name, rfc, city, email, phone, years_experience, avg_daily_wage)
  on public.labor_contractors to authenticated;
grant update (display_name, business_name, legal_name, rfc, city, email, phone, years_experience, avg_daily_wage)
  on public.labor_contractors to authenticated;

revoke insert, update, delete on public.labor_admins from anon, authenticated;
revoke insert, update, delete on public.labor_contractor_metrics from anon, authenticated;

revoke insert, update on public.labor_compliance_docs from anon, authenticated;
grant insert (contractor_id, kind, name, detail, issued_on, file_path, sort) on public.labor_compliance_docs to authenticated;
grant update (name, detail, issued_on, file_path, sort) on public.labor_compliance_docs to authenticated;

revoke insert, update, delete on public.labor_quotes from anon, authenticated;
grant insert (contractor_id, labor_site_id, catalog_item_id, description, unit, volume, people, unit_price, est_days)
  on public.labor_quotes to authenticated;

revoke insert, update, delete on public.labor_benefit_requests from anon, authenticated;
revoke insert, update, delete on public.labor_benefits from anon, authenticated;

-- ─────────────────────────── Funciones ───────────────────────────

-- Obras del contratista con los datos reales del proyecto y la hora de la obra.
create or replace function public.labor_my_sites()
returns table (
  id uuid, project_id uuid, name text, location text, builder_name text,
  timezone text, local_date date, active boolean, sort int
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.project_id, p.name::text, to_jsonb(p) ->> 'location',
         coalesce(nullif(to_jsonb(u) ->> 'company_name', ''), nullif(to_jsonb(u) ->> 'name', ''), nullif(to_jsonb(u) ->> 'full_name', '')),
         tz.name, public.labor_local_date(tz.name), s.active, s.sort
  from public.labor_sites s
  join public.projects p on p.project_id = s.project_id
  left join public.users u on u.id::text = to_jsonb(p) ->> 'builder_id'
  cross join lateral (select public.labor_project_timezone(s.project_id) as name) tz
  where s.contractor_id = public.labor_my_contractor_id()
  order by s.active desc, s.sort, p.name
$$;

-- Ligar un proyecto (o volver a ligarlo si se había quitado).
create or replace function public.labor_link_project(p_project_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if public.labor_my_contractor_id() is null then
    raise exception 'Primero crea tu perfil de contratista';
  end if;
  insert into public.labor_sites (contractor_id, project_id, sort)
  values (public.labor_my_contractor_id(), p_project_id,
          coalesce((select max(sort) + 1 from public.labor_sites where contractor_id = public.labor_my_contractor_id()), 0))
  on conflict (contractor_id, project_id) do update set active = true
  returning id into v_id;
  return v_id;
end $$;

-- Conceptos del catálogo de una obra ligada, sin los precios de la constructora.
create or replace function public.labor_site_concepts(p_labor_site_id uuid)
returns table (item_id text, item_code text, description text, unit text, quantity numeric, section text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_project uuid;
begin
  select project_id into v_project from public.labor_sites
   where id = p_labor_site_id and contractor_id = public.labor_my_contractor_id();
  if v_project is null or to_regclass('public.catalog_items') is null then
    return;
  end if;
  return query execute
    'select j ->> ''item_id'', j ->> ''item_code'',
            coalesce(nullif(j ->> ''description'', ''''), j ->> ''name''),
            coalesce(j ->> ''unit'', ''''),
            case when j ->> ''quantity'' ~ ''^-?\d+(\.\d+)?$'' then (j ->> ''quantity'')::numeric end,
            null::text
       from public.catalog_items i
       cross join lateral (select to_jsonb(i) as j) x
      where i.project_id::text = $1::text
      order by j ->> ''item_code'' nulls last
      limit 500'
    using v_project;
exception when undefined_column or undefined_table then
  return;
end $$;

-- Pase de lista del contratista: el día lo pone la hora de la obra.
create or replace function public.labor_mark_attendance(p_worker_ids uuid[], p_labor_site_id uuid, p_status text)
returns date
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_date date := public.labor_local_date(public.labor_site_timezone(p_labor_site_id));
begin
  if p_status not in ('present', 'late', 'absent') then
    raise exception 'Estado inválido';
  end if;
  if not exists (select 1 from public.labor_sites where id = p_labor_site_id and contractor_id = public.labor_my_contractor_id()) then
    raise exception 'Esa obra no es tuya';
  end if;
  insert into public.labor_attendance (worker_id, work_date, labor_site_id, status, checked_in_at, source)
  select w, v_date, p_labor_site_id, p_status, case when p_status = 'absent' then null else now() end, 'contractor'
    from unnest(p_worker_ids) as w
  on conflict (worker_id, work_date) do update
    set status = excluded.status,
        labor_site_id = excluded.labor_site_id,
        checked_in_at = case when excluded.status = 'absent' then null
                             else coalesce(public.labor_attendance.checked_in_at, excluded.checked_in_at) end
  where public.labor_attendance.source = 'contractor';
  return v_date;
end $$;

-- Registrar avance del día (en la hora de la obra) y marcar terminado si se completó.
create or replace function public.labor_record_progress(p_front_id uuid, p_quantity numeric, p_reason text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_site uuid;
begin
  select labor_site_id into v_site from public.labor_fronts where id = p_front_id;
  if v_site is null then
    raise exception 'Frente no encontrado';
  end if;

  insert into public.labor_front_progress (front_id, work_date, quantity, delay_reason)
  values (p_front_id, public.labor_local_date(public.labor_site_timezone(v_site)), p_quantity, p_reason);

  update public.labor_fronts f
     set completed = f.done_before + (select coalesce(sum(quantity), 0) from public.labor_front_progress where front_id = f.id) >= f.quantity
   where f.id = p_front_id;
end $$;

-- Guardar un documento del expediente. La vigencia la calcula el servidor y
-- queda en revisión hasta que BuildI lo valide.
create or replace function public.labor_save_compliance_doc(p_kind text, p_name text, p_issued_on date, p_file_path text default null)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_kind not in ('repse', 'imss', 'infonavit', 'sat') then
    insert into public.labor_compliance_docs (contractor_id, kind, name, issued_on, file_path)
    values (public.labor_my_contractor_id(), p_kind, p_name, p_issued_on, p_file_path)
    returning id into v_id;
    return v_id;
  end if;
  insert into public.labor_compliance_docs (contractor_id, kind, name, issued_on, file_path)
  values (public.labor_my_contractor_id(), p_kind, p_name, p_issued_on, p_file_path)
  on conflict (contractor_id, kind) where kind in ('repse', 'imss', 'infonavit', 'sat')
  do update set issued_on = excluded.issued_on, file_path = coalesce(excluded.file_path, public.labor_compliance_docs.file_path)
  returning id into v_id;
  return v_id;
end $$;

-- Revisión del expediente por BuildI.
create or replace function public.labor_review_compliance_doc(p_doc_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.labor_is_admin() then
    raise exception 'Solo el personal de BuildI revisa expedientes';
  end if;
  update public.labor_compliance_docs
     set review_status = case when p_approve then 'verified' else 'rejected' end,
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note
   where id = p_doc_id;
end $$;

-- Puntaje BuildI Pro (0–100) con sus cinco factores. Lo calcula el servidor
-- porque el nivel cambia precios y beneficios.
create or replace function public.labor_contractor_score(p_contractor_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      m.on_time_rate, m.adjusted_share, m.builder_rating,
      (select count(*) from public.labor_compliance_docs d
        where d.contractor_id = c.id and d.kind in ('repse', 'imss', 'infonavit', 'sat')
          and d.review_status = 'verified' and (d.expires_on is null or d.expires_on >= current_date))::int as docs_ok,
      (extract(year from age(now(), c.created_at)) * 12 + extract(month from age(now(), c.created_at)))::int as months
    from public.labor_contractors c
    left join public.labor_contractor_metrics m on m.contractor_id = c.id
    where c.id = p_contractor_id
  ), points as (
    select base.*,
      -- least/greatest ignoran null: sin datos se cuenta aparte como 0.
      round(case when on_time_rate is null then 0 else 30 * greatest(0, least(1, on_time_rate)) end, 1) as p_on_time,
      round(case when adjusted_share is null then 0 else 20 * greatest(0, least(1, 1 - adjusted_share / 0.05)) end, 1) as p_adjusted,
      round(case when builder_rating is null then 0 else 20 * greatest(0, least(1, (builder_rating - 3) / 2)) end, 1) as p_rating,
      round(20 * docs_ok / 4.0, 1) as p_docs,
      round(10 * greatest(0, least(1, months / 24.0)), 1) as p_months
    from base
  )
  select jsonb_build_object(
    'score', p_on_time + p_adjusted + p_rating + p_docs + p_months,
    'level', case when p_on_time + p_adjusted + p_rating + p_docs + p_months >= 80 then 'oro'
                  when p_on_time + p_adjusted + p_rating + p_docs + p_months >= 60 then 'plata'
                  else 'bronce' end,
    'factors', jsonb_build_array(
      jsonb_build_object('key', 'on_time', 'value', on_time_rate, 'points', p_on_time, 'max', 30),
      jsonb_build_object('key', 'adjusted', 'value', adjusted_share, 'points', p_adjusted, 'max', 20),
      jsonb_build_object('key', 'rating', 'value', builder_rating, 'points', p_rating, 'max', 20),
      jsonb_build_object('key', 'docs', 'value', docs_ok, 'required', 4, 'points', p_docs, 'max', 20),
      jsonb_build_object('key', 'months', 'value', months, 'points', p_months, 'max', 10)))
  from points
$$;

create or replace function public.labor_my_score()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.labor_contractor_score(public.labor_my_contractor_id())
$$;

create or replace function public.labor_level_rank(p_level text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_level when 'oro' then 2 when 'plata' then 1 else 0 end
$$;

-- Pedir un beneficio: solo si el nivel ya lo desbloqueó.
create or replace function public.labor_request_benefit(p_benefit_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contractor uuid := public.labor_my_contractor_id();
  v_min text;
  v_id uuid;
begin
  if v_contractor is null then
    raise exception 'Primero crea tu perfil de contratista';
  end if;
  select min_level into v_min from public.labor_benefits where id = p_benefit_id;
  if v_min is null then
    raise exception 'Beneficio no encontrado';
  end if;
  if public.labor_level_rank(public.labor_contractor_score(v_contractor) ->> 'level') < public.labor_level_rank(v_min) then
    raise exception 'Ese beneficio se desbloquea en un nivel más alto';
  end if;
  insert into public.labor_benefit_requests (contractor_id, benefit_id) values (v_contractor, p_benefit_id)
  returning id into v_id;
  return v_id;
end $$;

-- La constructora acepta o rechaza una cotización de su obra.
create or replace function public.labor_decide_quote(p_quote_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project uuid;
begin
  select s.project_id into v_project
    from public.labor_quotes q join public.labor_sites s on s.id = q.labor_site_id
   where q.id = p_quote_id and q.status = 'sent';
  if v_project is null or not public.labor_is_project_builder(v_project) then
    raise exception 'Cotización no encontrada';
  end if;
  update public.labor_quotes
     set status = case when p_accept then 'accepted' else 'rejected' end, decided_at = now()
   where id = p_quote_id;
end $$;

-- Postgres da EXECUTE a PUBLIC por defecto: se quita y se da solo a quien lo usa.
do $$
declare f text;
begin
  foreach f in array array[
    'labor_my_contractor_id()', 'labor_is_admin()', 'labor_is_project_builder(uuid)', 'labor_is_site_builder(uuid)',
    'labor_project_timezone(uuid)', 'labor_site_timezone(uuid)',
    'labor_my_sites()', 'labor_link_project(uuid)', 'labor_site_concepts(uuid)',
    'labor_mark_attendance(uuid[], uuid, text)', 'labor_record_progress(uuid, numeric, text)',
    'labor_save_compliance_doc(text, text, date, text)', 'labor_review_compliance_doc(uuid, boolean, text)',
    'labor_contractor_score(uuid)', 'labor_my_score()', 'labor_request_benefit(text)', 'labor_decide_quote(uuid, boolean)']
  loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- El puntaje de otro contratista no se consulta desde la app.
revoke execute on function public.labor_contractor_score(uuid) from authenticated;

-- Funciones puras de zona horaria: las usa el trigger de projects con el rol de quien guarda.
grant execute on function public.labor_valid_timezone(text) to anon, authenticated;
grant execute on function public.labor_border_lng(double precision, double precision[]) to anon, authenticated;
grant execute on function public.labor_guess_timezone(text, text, text) to anon, authenticated;
grant execute on function public.labor_local_date(text) to anon, authenticated;
grant execute on function public.labor_level_rank(text) to anon, authenticated;

-- ─────────────────────────── Catálogo de beneficios ───────────────────────────
-- Configuración del programa BuildI Pro (no son datos de ejemplo). Los
-- porcentajes y montos se confirman con cada aliado antes de publicarse.

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
