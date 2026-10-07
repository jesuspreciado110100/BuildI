-- BuildI · Escaneo de gafetes desde la app de constructor
-- El residente o supervisor escanea el gafete: queda registro de quién lo
-- verificó y, si registra la entrada, el pase de lista del contratista se
-- llena solo. Requiere 20261007120000_chief_of_labor.sql.

create table if not exists public.labor_badge_scans (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.labor_workers(id) on delete cascade,
  contractor_id uuid not null references public.labor_contractors(id) on delete cascade,
  labor_site_id uuid references public.labor_sites(id) on delete set null,
  scanned_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  checked_in boolean not null default false,
  -- Copia de lo que vio el residente, para su historial (no puede leer labor_workers).
  worker_name text not null,
  worker_trade text not null,
  contractor_name text not null,
  site_name text,
  imss_registered boolean not null,
  heights_ok boolean not null,
  expired_count int not null default 0,
  scanned_at timestamptz not null default now(),
  checked_in_at timestamptz
);

create index if not exists labor_badge_scans_scanner_idx on public.labor_badge_scans(scanned_by, scanned_at desc);
create index if not exists labor_badge_scans_worker_idx on public.labor_badge_scans(worker_id, scanned_at desc);

alter table public.labor_badge_scans enable row level security;

-- Lectura: quien escaneó y el contratista del trabajador. Escritura solo por funciones.
drop policy if exists labor_badge_scans_read on public.labor_badge_scans;
create policy labor_badge_scans_read on public.labor_badge_scans for select to authenticated
  using (scanned_by = auth.uid() or contractor_id = public.labor_my_contractor_id());

-- Escanear: verifica, deja registro y devuelve las obras del contratista para registrar la entrada.
create or replace function public.labor_scan_badge(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.labor_workers%rowtype;
  c public.labor_contractors%rowtype;
  v_verification jsonb;
  v_heights boolean;
  v_expired int;
  v_scan uuid;
begin
  if auth.uid() is null then
    raise exception 'Necesitas iniciar sesión';
  end if;

  select * into w from public.labor_workers where verify_code = upper(p_code) and active;
  if not found then
    return null;
  end if;
  select * into c from public.labor_contractors where id = w.contractor_id;

  v_verification := public.labor_verify_badge(w.verify_code);

  select exists (
           select 1 from public.labor_credentials
            where worker_id = w.id and course_id = 'alturas' and (renew_on is null or renew_on >= current_date)),
         (select count(*) from public.labor_credentials where worker_id = w.id and renew_on < current_date)
    into v_heights, v_expired;

  insert into public.labor_badge_scans
    (worker_id, contractor_id, scanned_by, worker_name, worker_trade, contractor_name, imss_registered, heights_ok, expired_count)
  values
    (w.id, w.contractor_id, auth.uid(), w.full_name, w.trade, c.business_name, w.imss_registered, v_heights, v_expired)
  returning id into v_scan;

  return v_verification || jsonb_build_object(
    'scan_id', v_scan,
    'code', w.verify_code,
    'heights_ok', v_heights,
    'expired_count', v_expired,
    'checked_in_today', exists (
      select 1 from public.labor_attendance
       where worker_id = w.id and work_date = current_date and status in ('present', 'late')),
    'sites', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'builder_name', s.builder_name) order by s.sort)
        from public.labor_sites s
       where s.contractor_id = w.contractor_id and s.active), '[]'::jsonb));
end $$;

-- Registrar la entrada a la obra del escaneo (máximo 2 horas después de escanear).
create or replace function public.labor_check_in(p_scan_id uuid, p_site_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.labor_badge_scans%rowtype;
  v_site public.labor_sites%rowtype;
begin
  select * into s from public.labor_badge_scans where id = p_scan_id and scanned_by = auth.uid();
  if not found then
    raise exception 'Escaneo no encontrado';
  end if;
  if s.scanned_at < now() - interval '2 hours' then
    raise exception 'El escaneo ya expiró; vuelve a escanear el gafete';
  end if;

  select * into v_site from public.labor_sites where id = p_site_id and contractor_id = s.contractor_id and active;
  if not found then
    raise exception 'Esa obra no es de este contratista';
  end if;

  update public.labor_badge_scans
     set checked_in = true, checked_in_at = now(), labor_site_id = v_site.id, site_name = v_site.name
   where id = s.id;

  insert into public.labor_attendance (worker_id, work_date, status, checked_in_at)
  values (s.worker_id, current_date, 'present', now())
  on conflict (worker_id, work_date) do update
    set status = case when public.labor_attendance.status = 'absent' then 'present' else public.labor_attendance.status end,
        checked_in_at = coalesce(public.labor_attendance.checked_in_at, excluded.checked_in_at);

  return jsonb_build_object('site_name', v_site.name, 'checked_in_at', now());
end $$;

revoke all on function public.labor_scan_badge(text) from public, anon;
revoke all on function public.labor_check_in(uuid, uuid) from public, anon;
grant execute on function public.labor_scan_badge(text) to authenticated;
grant execute on function public.labor_check_in(uuid, uuid) to authenticated;
