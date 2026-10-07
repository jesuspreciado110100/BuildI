import { supabase } from '@/app/lib/supabase';

// Datos del contratista de mano de obra (Frentes, Cuadrillas y Perfil).
// Las obras son los proyectos reales de BuildI (projects); cada una trae su
// zona horaria y su fecha de hoy calculada en el servidor.
// Tablas y funciones: supabase/migrations/20261007120000_chief_of_labor.sql,
// 20261007130000_labor_training.sql y 20261007140000_badge_scans.sql.

export type WorkerLevel = 'ayudante' | 'oficial' | 'maestro';
export type CredentialType = 'buildi' | 'dc3' | 'conocer';
export type ProLevel = 'bronce' | 'plata' | 'oro';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type DocKind = 'repse' | 'imss' | 'infonavit' | 'sat' | 'contract' | 'other';

export interface Contractor {
  id: string;
  display_name: string;
  business_name: string;
  legal_name: string | null;
  rfc: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  years_experience: number | null;
  avg_daily_wage: number | null;
  created_at: string;
}

export interface ContractorInput {
  display_name: string;
  business_name: string;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
}

/** Datos del usuario en la tabla users de la app, para llenar el alta. */
export interface UserProfile {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  location: string;
}

/** Obra del contratista: un proyecto real de BuildI. */
export interface LaborSite {
  id: string;
  project_id: string;
  name: string;
  location: string | null;
  builder_name: string | null;
  timezone: string;
  local_date: string;
  active: boolean;
}

export interface ProjectOption {
  project_id: string;
  name: string;
  location: string | null;
}

/** Concepto del catálogo de la obra (sin los precios de la constructora). */
export interface Concept {
  item_id: string;
  item_code: string | null;
  description: string;
  unit: string;
  quantity: number | null;
}

export interface Crew {
  id: string;
  name: string;
  labor_site_id: string | null;
  status: 'active' | 'break' | 'inactive';
  height_note: string | null;
  lead_worker_id: string | null;
}

export interface Course {
  id: string;
  title: string;
  credential_type: CredentialType;
  provider_id: string | null;
  audience: 'crew' | 'contractor';
  delivery: 'app' | 'presencial' | 'en_obra';
  hours: number | null;
  hours_label: string;
  modality: string;
  price: number | null;
  discount_by_level: Record<ProLevel, number>;
  renew_years: number | null;
  requires_quiz: boolean;
  requires_practical: boolean;
  required_evidence: string[];
  recommended_for: string | null;
}

export interface Certificate {
  id: string;
  course_id: string;
  credential_type: CredentialType;
  folio: string;
  issued_on: string;
  expires_on: string | null;
  issuer_name: string;
  status: 'valid' | 'pending_review' | 'rejected' | 'revoked';
  source: 'course' | 'external';
}

export interface Worker {
  id: string;
  crew_id: string | null;
  code: string;
  full_name: string;
  trade: string;
  level: WorkerLevel;
  color: string;
  curp: string | null;
  imss_registered: boolean;
  joined_year: number | null;
  verify_code: string;
  /** Pase de lista de hoy (el día de la obra donde se registró). */
  attendance: AttendanceStatus | null;
  attendance_site_id: string | null;
  /** 'scan' = la registró el residente al escanear el gafete; el contratista ya no la cambia. */
  attendance_source: 'contractor' | 'scan' | null;
  /** Constancias válidas o por revisar (no las revocadas ni rechazadas). */
  credentials: Certificate[];
  /** Obras donde ha trabajado, de su asistencia real. */
  sites: { labor_site_id: string; year: number; days: number }[];
}

export interface WorkerInput {
  full_name: string;
  trade: string;
  level: WorkerLevel;
  crew_id: string | null;
  imss_registered: boolean;
  curp?: string | null;
}

export interface Enrollment {
  id: string;
  course_id: string;
  session_id: string | null;
  worker_id: string | null;
  for_contractor: boolean;
  status: 'reserved' | 'enrolled' | 'attended' | 'passed' | 'failed' | 'no_show' | 'cancelled';
  progress: number;
  amount_due: number | null;
}

export interface OpenSession {
  id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  venue_name: string | null;
  address: string | null;
  instructor_name: string | null;
  provider_name: string;
  capacity: number;
  seats_left: number;
}

export interface Front {
  id: string;
  labor_site_id: string;
  catalog_item_id: string | null;
  item_code: string | null;
  description: string;
  unit: string;
  quantity: number;
  done: number;
  week: number;
  unit_price: number;
  people_needed: number;
  rate_per_person_day: number;
  at_height_note: string | null;
  blocked_reason: string | null;
  completed: boolean;
  member_ids: string[];
}

export interface FrontInput {
  siteId: string;
  catalogItemId: string | null;
  itemCode: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  peopleNeeded: number;
  ratePerPersonDay: number;
  atHeightNote: string | null;
  memberIds: string[];
}

export interface ScoreFactor {
  key: 'on_time' | 'adjusted' | 'rating' | 'docs' | 'months';
  value: number | null;
  points: number;
  max: number;
  required?: number;
}

export interface Score {
  score: number;
  level: ProLevel;
  factors: ScoreFactor[];
}

export interface ComplianceDoc {
  id: string;
  kind: DocKind;
  name: string;
  detail: string | null;
  issued_on: string | null;
  expires_on: string | null;
  review_status: 'pending_review' | 'verified' | 'rejected';
  review_note: string | null;
}

export interface Benefit {
  id: string;
  title: string;
  summary: string;
  icon: string;
  min_level: ProLevel;
  by_level: Record<ProLevel, string> | null;
  partner: string | null;
  how: string[];
}

export interface BadgeVerification {
  name: string;
  trade: string;
  level: WorkerLevel;
  imss_registered: boolean;
  contractor: string;
  credentials: {
    title: string;
    type: CredentialType;
    issuer: string;
    folio: string;
    issued_on: string;
    renew_on: string | null;
  }[];
}

/** Resultado de escanear un gafete desde la app de constructor. */
export interface BadgeScan extends BadgeVerification {
  scan_id: string;
  code: string;
  heights_ok: boolean;
  expired_count: number;
  checked_in_today: boolean;
  /** Obras del contratista; primero las de la constructora que escanea. */
  sites: { id: string; name: string; timezone: string; mine: boolean }[];
}

export interface CheckInResult {
  site_name: string;
  checked_in_at: string;
  timezone: string;
  /** "7:02" en la hora de la obra. */
  local_time: string;
  work_date: string;
}

export interface BadgeScanLog {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_trade: string;
  contractor_name: string;
  site_name: string | null;
  site_timezone: string | null;
  checked_in: boolean;
  imss_registered: boolean;
  heights_ok: boolean;
  expired_count: number;
  scanned_at: string;
  checked_in_at: string | null;
}

export interface ActivityItem {
  id: string;
  at: string;
  timezone: string | null;
  type: 'success' | 'info' | 'warning';
  title: string;
}

export interface RecommendationAction {
  worker_id: string;
  rec_key: string;
  action: 'done' | 'later';
}

/** Factor de salario real (raya → costo con IMSS, Infonavit y prestaciones); el mismo que usa BoQParsingService. */
export const REAL_SALARY_FACTOR = 1.5186;

/** Colores del avatar de cada trabajador. */
export const WORKER_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#059669', '#B45309', '#0891B2', '#4B5563', '#9333EA', '#0F766E', '#DC2626', '#65A30D', '#EA580C'];

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

function groupBy<T>(rows: T[], key: (row: T) => string): T[][] {
  const groups = new Map<string, T[]>();
  rows.forEach(r => groups.set(key(r), [...(groups.get(key(r)) ?? []), r]));
  return [...groups.values()];
}

/** "Juan, Julio y Toño" */
export function listNames(names: string[]): string {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0] ?? '';
}
const numOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const str = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v));

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function currentUserId(): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Inicia sesión para ver tus datos.');
  return auth.user.id;
}

export class ChiefOfLaborService {
  /** Contratista del usuario con sesión, o null si aún no tiene. */
  static async getContractor(): Promise<Contractor | null> {
    const uid = await currentUserId();
    const row = check(await supabase.from('labor_contractors').select('*').eq('owner_id', uid).maybeSingle()) as any;
    return row ? { ...row, avg_daily_wage: numOrNull(row.avg_daily_wage) } : null;
  }

  /** Lo que ya sabemos del usuario (tabla users), para no volver a pedirlo. */
  static async getMyUserProfile(): Promise<UserProfile> {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    const { data } = uid ? await supabase.from('users').select('*').eq('id', uid).maybeSingle() : { data: null };
    const row = (data ?? {}) as Record<string, unknown>;
    return {
      name: str(row.name || row.full_name || auth.user?.user_metadata?.name),
      company_name: str(row.company_name),
      phone: str(row.phone),
      email: str(row.email || auth.user?.email),
      location: str(row.location),
    };
  }

  static async createContractor(input: ContractorInput): Promise<void> {
    await currentUserId();
    check(await supabase.from('labor_contractors').insert({
      display_name: input.display_name.trim(),
      business_name: input.business_name.trim(),
      city: input.city?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
    }));
  }

  static async updateContractor(
    id: string,
    changes: Partial<Pick<Contractor, 'legal_name' | 'rfc' | 'avg_daily_wage' | 'city' | 'phone' | 'years_experience'>>,
  ): Promise<void> {
    check(await supabase.from('labor_contractors').update(changes).eq('id', id));
  }

  // ─────────── Obras ───────────

  /** Obras ligadas (activas primero) con nombre, constructora, zona horaria y fecha de hoy en la obra. */
  static async getSites(): Promise<LaborSite[]> {
    const rows = check(await supabase.rpc('labor_my_sites')) as LaborSite[];
    return rows ?? [];
  }

  /** Proyectos de BuildI que el usuario puede ver, para ligarlos como obra. */
  static async searchProjects(query: string): Promise<ProjectOption[]> {
    let q = supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(20);
    const text = query.trim();
    if (text) q = q.ilike('name', `%${text.replace(/[%_,()]/g, ' ')}%`);
    const rows = check(await q) as Record<string, unknown>[];
    return rows.map(r => ({ project_id: str(r.project_id), name: str(r.name), location: r.location ? str(r.location) : null }));
  }

  static async linkProject(projectId: string): Promise<string> {
    return check(await supabase.rpc('labor_link_project', { p_project_id: projectId })) as string;
  }

  /** Quita la obra de la lista; su historial de asistencia y avance se queda. */
  static async unlinkSite(siteId: string): Promise<void> {
    check(await supabase.from('labor_sites').update({ active: false }).eq('id', siteId));
  }

  static async getSiteConcepts(siteId: string): Promise<Concept[]> {
    const rows = check(await supabase.rpc('labor_site_concepts', { p_labor_site_id: siteId })) as any[];
    return (rows ?? []).map(r => ({
      item_id: r.item_id,
      item_code: r.item_code,
      description: r.description,
      unit: r.unit,
      quantity: numOrNull(r.quantity),
    }));
  }

  // ─────────── Cuadrillas y gente ───────────

  static async getCrews(): Promise<Crew[]> {
    return check(await supabase.from('labor_crews').select('*').order('sort').order('created_at')) as Crew[];
  }

  static async createCrew(crew: { name: string; labor_site_id: string | null; height_note: string | null }): Promise<void> {
    const contractor = await this.requireContractor();
    check(await supabase.from('labor_crews').insert({ contractor_id: contractor.id, ...crew }));
  }

  static async updateCrew(id: string, changes: Partial<Omit<Crew, 'id'>>): Promise<void> {
    check(await supabase.from('labor_crews').update(changes).eq('id', id));
  }

  /**
   * Trabajadores con su pase de lista de hoy, constancias y obras. "Hoy" es
   * el día de la obra donde se registró la asistencia (lo da labor_my_sites).
   */
  static async getWorkers(sites: LaborSite[]): Promise<Worker[]> {
    const todayBySite: Record<string, string> = Object.fromEntries(sites.map(s => [s.id, s.local_date]));
    const fallbackToday = sites.find(s => s.active)?.local_date ?? localDateIn(deviceTimezone());
    const since = [fallbackToday, ...sites.map(s => s.local_date)].sort()[0];
    const [rows, history] = await Promise.all([
      supabase
        .from('labor_workers')
        .select(
          '*, labor_certificates(id, course_id, credential_type, folio, issued_on, expires_on, issuer_name, status, source), ' +
            'labor_attendance(status, work_date, labor_site_id, source)',
        )
        .eq('active', true)
        .gte('labor_attendance.work_date', addDays(since, -1))
        .order('created_at'),
      supabase.from('labor_worker_site_days').select('*'),
    ]);
    const days = check(history) as { worker_id: string; labor_site_id: string; year: number; days: number }[];
    return (check(rows) as any[]).map(r => {
      const attendance = (r.labor_attendance ?? []) as {
        status: AttendanceStatus;
        work_date: string;
        labor_site_id: string | null;
        source: 'contractor' | 'scan';
      }[];
      const today = attendance.find(
        a => a.work_date === (a.labor_site_id ? todayBySite[a.labor_site_id] ?? fallbackToday : fallbackToday),
      );
      return {
        id: r.id,
        crew_id: r.crew_id,
        code: r.code,
        full_name: r.full_name,
        trade: r.trade,
        level: r.level,
        color: r.color,
        curp: r.curp,
        imss_registered: r.imss_registered,
        joined_year: r.joined_year,
        verify_code: r.verify_code,
        attendance: today?.status ?? null,
        attendance_site_id: today?.labor_site_id ?? null,
        attendance_source: today?.source ?? null,
        credentials: ((r.labor_certificates ?? []) as Certificate[]).filter(c => c.status === 'valid' || c.status === 'pending_review'),
        sites: days.filter(d => d.worker_id === r.id).sort((a, b) => b.year - a.year || b.days - a.days),
      };
    });
  }

  /** Alta de un trabajador. Las iniciales y el código del gafete los pone el servidor. */
  static async addWorker(input: WorkerInput, colorIndex: number): Promise<void> {
    const contractor = await this.requireContractor();
    check(
      await supabase.from('labor_workers').insert({
        contractor_id: contractor.id,
        code: '',
        full_name: input.full_name.trim(),
        trade: input.trade.trim(),
        level: input.level,
        crew_id: input.crew_id,
        imss_registered: input.imss_registered,
        curp: input.curp?.trim().toUpperCase() || null,
        color: WORKER_COLORS[colorIndex % WORKER_COLORS.length],
      }),
    );
  }

  static async updateWorker(id: string, changes: Partial<Pick<Worker, 'crew_id' | 'trade' | 'level' | 'curp' | 'imss_registered'>>): Promise<void> {
    check(await supabase.from('labor_workers').update(changes).eq('id', id));
  }

  static async markImssRegistered(workerId: string): Promise<void> {
    await this.updateWorker(workerId, { imss_registered: true });
  }

  /** Pase de lista del contratista: el día lo pone la hora de la obra. */
  static async markAttendance(workerIds: string[], siteId: string, status: AttendanceStatus): Promise<void> {
    if (!workerIds.length) return;
    check(await supabase.rpc('labor_mark_attendance', { p_worker_ids: workerIds, p_labor_site_id: siteId, p_status: status }));
  }

  static async getRecommendationActions(): Promise<RecommendationAction[]> {
    return check(await supabase.from('labor_recommendation_actions').select('worker_id, rec_key, action')) as RecommendationAction[];
  }

  static async setRecommendationAction(workerId: string, recKey: string, action: 'done' | 'later'): Promise<void> {
    check(
      await supabase
        .from('labor_recommendation_actions')
        .upsert({ worker_id: workerId, rec_key: recKey, action }, { onConflict: 'worker_id,rec_key' }),
    );
  }

  // ─────────── Cursos ───────────

  static async getCourses(): Promise<Course[]> {
    const rows = check(await supabase.from('labor_courses').select('*').eq('active', true).order('sort')) as any[];
    return rows.map(c => ({ ...c, price: numOrNull(c.price), hours: numOrNull(c.hours) }));
  }

  static async getEnrollments(): Promise<Enrollment[]> {
    const rows = check(await supabase.from('labor_enrollments').select('*').neq('status', 'cancelled')) as any[];
    return rows.map(e => ({ ...e, progress: num(e.progress), amount_due: numOrNull(e.amount_due) }));
  }

  /** Fechas programadas de un curso con los lugares que quedan. */
  static async getOpenSessions(courseId: string): Promise<OpenSession[]> {
    return (check(await supabase.rpc('labor_open_sessions', { p_course_id: courseId })) as OpenSession[]) ?? [];
  }

  /**
   * Inscribe a personas concretas, aparta lugares sin nombre o inscribe al
   * contratista. Sin sesión, el lugar queda apartado hasta que haya fecha.
   */
  static async enroll(opts: { courseId: string; workerIds?: string[]; sessionId?: string | null; seats?: number; forMe?: boolean }): Promise<void> {
    check(
      await supabase.rpc('labor_enroll', {
        p_course_id: opts.courseId,
        p_worker_ids: opts.workerIds ?? [],
        p_session_id: opts.sessionId ?? null,
        p_seats: opts.seats ?? 0,
        p_for_me: opts.forMe ?? false,
      }),
    );
  }

  /** Constancias del propio contratista (cursos para él). */
  static async getMyCertificates(): Promise<Certificate[]> {
    return check(
      await supabase.from('labor_certificates').select('*').is('worker_id', null).in('status', ['valid', 'pending_review']),
    ) as Certificate[];
  }

  // ─────────── Frentes ───────────

  static async getFronts(siteId: string): Promise<Front[]> {
    const fronts = check(
      await supabase.from('labor_fronts_summary').select('*').eq('labor_site_id', siteId).order('sort').order('created_at'),
    ) as any[];
    if (!fronts.length) return [];
    const members = check(
      await supabase.from('labor_front_members').select('front_id, worker_id').in('front_id', fronts.map(f => f.id)),
    ) as { front_id: string; worker_id: string }[];
    return fronts.map(f => ({
      id: f.id,
      labor_site_id: f.labor_site_id,
      catalog_item_id: f.catalog_item_id,
      item_code: f.item_code,
      description: f.description,
      unit: f.unit,
      quantity: num(f.quantity),
      done: num(f.done),
      week: num(f.week),
      unit_price: num(f.unit_price),
      people_needed: f.people_needed,
      rate_per_person_day: num(f.rate_per_person_day),
      at_height_note: f.at_height_note,
      blocked_reason: f.blocked_reason,
      completed: f.completed,
      member_ids: members.filter(m => m.front_id === f.id).map(m => m.worker_id),
    }));
  }

  static async createFront(input: FrontInput): Promise<void> {
    const created = check(
      await supabase
        .from('labor_fronts')
        .insert({
          labor_site_id: input.siteId,
          catalog_item_id: input.catalogItemId,
          item_code: input.itemCode,
          description: input.description.trim(),
          unit: input.unit.trim(),
          quantity: input.quantity,
          unit_price: input.unitPrice,
          people_needed: input.peopleNeeded,
          rate_per_person_day: input.ratePerPersonDay,
          at_height_note: input.atHeightNote?.trim() || null,
        })
        .select('id')
        .single(),
    ) as { id: string };
    if (input.memberIds.length) {
      check(await supabase.from('labor_front_members').insert(input.memberIds.map(worker_id => ({ front_id: created.id, worker_id }))));
    }
  }

  /** Marcar el frente detenido (con motivo) o reanudarlo (null). */
  static async setFrontBlocked(frontId: string, reason: string | null): Promise<void> {
    check(await supabase.from('labor_fronts').update({ blocked_reason: reason }).eq('id', frontId));
  }

  static async recordProgress(frontId: string, quantity: number, reason: string | null): Promise<void> {
    check(await supabase.rpc('labor_record_progress', { p_front_id: frontId, p_quantity: quantity, p_reason: reason }));
  }

  static async moveMembers(fromFrontId: string, toFrontId: string, workerIds: string[]): Promise<void> {
    check(await supabase.from('labor_front_members').delete().eq('front_id', fromFrontId).in('worker_id', workerIds));
    check(await supabase.from('labor_front_members').insert(workerIds.map(worker_id => ({ front_id: toFrontId, worker_id }))));
  }

  /** Propuesta a destajo para un concepto de la obra; la ve la constructora dueña del proyecto. */
  static async sendQuote(q: {
    siteId: string;
    catalogItemId: string | null;
    description: string;
    unit: string;
    volume: number;
    people: number;
    unitPrice: number;
    estDays: number;
  }): Promise<void> {
    const contractor = await this.requireContractor();
    check(
      await supabase.from('labor_quotes').insert({
        contractor_id: contractor.id,
        labor_site_id: q.siteId,
        catalog_item_id: q.catalogItemId,
        description: q.description,
        unit: q.unit,
        volume: q.volume,
        people: q.people,
        unit_price: q.unitPrice,
        est_days: q.estDays,
      }),
    );
  }

  // ─────────── Perfil ───────────

  /** Puntaje y nivel BuildI Pro calculados en el servidor. */
  static async getScore(): Promise<Score> {
    const s = check(await supabase.rpc('labor_my_score')) as any;
    return {
      score: num(s?.score),
      level: (s?.level ?? 'bronce') as ProLevel,
      factors: ((s?.factors ?? []) as any[]).map(f => ({ ...f, value: numOrNull(f.value), points: num(f.points), max: num(f.max) })),
    };
  }

  static async getComplianceDocs(): Promise<ComplianceDoc[]> {
    return check(
      await supabase
        .from('labor_compliance_docs')
        .select('id, kind, name, detail, issued_on, expires_on, review_status, review_note')
        .order('sort'),
    ) as ComplianceDoc[];
  }

  /**
   * Registra un documento con su fecha de emisión. El servidor calcula la
   * vigencia (opiniones de cumplimiento: 30 días; REPSE: 3 años) y lo deja en
   * revisión hasta que BuildI lo valide.
   */
  static async saveComplianceDoc(kind: DocKind, name: string, issuedOn: string): Promise<void> {
    check(await supabase.rpc('labor_save_compliance_doc', { p_kind: kind, p_name: name, p_issued_on: issuedOn }));
  }

  static async getBenefits(): Promise<Benefit[]> {
    return check(await supabase.from('labor_benefits').select('*').order('sort')) as Benefit[];
  }

  static async requestBenefit(benefitId: string): Promise<void> {
    check(await supabase.rpc('labor_request_benefit', { p_benefit_id: benefitId }));
  }

  // ─────────── Gafete ───────────

  /** Lo que ve el residente al escanear un gafete. null = código no encontrado. */
  static async verifyBadge(code: string): Promise<BadgeVerification | null> {
    await currentUserId();
    const data = check(await supabase.rpc('labor_verify_badge', { p_code: code }));
    return (data as BadgeVerification | null) ?? null;
  }

  /** Escanea un gafete: verifica, deja registro y trae las obras para registrar la entrada. */
  static async scanBadge(code: string): Promise<BadgeScan | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Inicia sesión en BuildI para verificar gafetes.');
    const data = check(await supabase.rpc('labor_scan_badge', { p_code: code }));
    return (data as BadgeScan | null) ?? null;
  }

  /** Registra la entrada del trabajador a la obra; llena el pase de lista del contratista con el día de la obra. */
  static async checkIn(scanId: string, siteId: string): Promise<CheckInResult> {
    return check(await supabase.rpc('labor_check_in', { p_scan_id: scanId, p_site_id: siteId })) as CheckInResult;
  }

  /** Escaneos que hizo hoy el usuario (residente o supervisor), con el día de su teléfono. */
  static async getMyScansToday(): Promise<BadgeScanLog[]> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return check(
      await supabase
        .from('labor_badge_scans')
        .select('*')
        .eq('scanned_by', auth.user.id)
        .gte('scanned_at', start.toISOString())
        .order('scanned_at', { ascending: false }),
    ) as BadgeScanLog[];
  }

  /** Última verificación en obra de cada trabajador del contratista. */
  static async getLastScans(): Promise<Record<string, BadgeScanLog>> {
    const contractor = await this.getContractor();
    if (!contractor) return {};
    const rows = check(
      await supabase
        .from('labor_badge_scans')
        .select('*')
        .eq('contractor_id', contractor.id)
        .order('scanned_at', { ascending: false })
        .limit(500),
    ) as BadgeScanLog[];
    const last: Record<string, BadgeScanLog> = {};
    rows.forEach(r => {
      if (!last[r.worker_id]) last[r.worker_id] = r;
    });
    return last;
  }

  /** Frentes detenidos (con motivo) que no se han terminado. */
  static async countBlockedFronts(): Promise<number> {
    const { count, error } = await supabase
      .from('labor_fronts')
      .select('id', { count: 'exact', head: true })
      .not('blocked_reason', 'is', null)
      .eq('completed', false);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  /** Lo último que pasó: entradas registradas por el residente, avance, inscripciones y constancias. */
  static async getRecentActivity(limit = 8): Promise<ActivityItem[]> {
    const [scans, progress, enrollments, certificates] = await Promise.all([
      supabase.from('labor_badge_scans').select('*').order('scanned_at', { ascending: false }).limit(limit),
      supabase
        .from('labor_front_progress')
        .select('id, quantity, created_at, delay_reason, labor_fronts(description, unit)')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('labor_enrollments')
        .select('id, created_at, status, for_contractor, labor_courses(title), labor_workers(full_name)')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(limit * 4),
      supabase
        .from('labor_certificates')
        .select('id, created_at, status, labor_courses(title), labor_workers(full_name)')
        .eq('status', 'valid')
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);
    const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
    const items: ActivityItem[] = [
      ...(check(scans) as BadgeScanLog[]).map(s => ({
        id: `scan-${s.id}`,
        at: s.checked_in_at ?? s.scanned_at,
        timezone: s.checked_in ? s.site_timezone : null,
        type: (s.checked_in ? 'success' : 'info') as ActivityItem['type'],
        title: s.checked_in ? `El residente registró la entrada de ${s.worker_name} en ${s.site_name ?? 'la obra'}` : `El residente verificó el gafete de ${s.worker_name}`,
      })),
      ...(check(progress) as any[]).map(p => {
        const front = one<{ description: string; unit: string }>(p.labor_fronts);
        return {
          id: `progress-${p.id}`,
          at: p.created_at,
          timezone: null,
          type: (p.delay_reason ? 'warning' : 'success') as ActivityItem['type'],
          title: `+${Number(p.quantity)} ${front?.unit ?? ''} en ${front?.description ?? 'un frente'}${p.delay_reason ? ` · ${p.delay_reason}` : ''}`,
        };
      }),
      // Las inscripciones hechas juntas (mismo curso, mismo momento) van en una sola línea.
      ...groupBy(check(enrollments) as any[], e => `${e.created_at}|${one<{ title: string }>(e.labor_courses)?.title}`).map(group => {
        const course = one<{ title: string }>(group[0].labor_courses)?.title ?? 'un curso';
        const names = group.map(e => one<{ full_name: string }>(e.labor_workers)?.full_name).filter((n): n is string => !!n);
        const seats = group.filter(e => !e.for_contractor && !one(e.labor_workers)).length;
        return {
          id: `enroll-${group[0].id}`,
          at: group[0].created_at,
          timezone: null,
          type: 'info' as const,
          title: group[0].for_contractor
            ? `Te inscribiste a ${course}`
            : names.length
              ? `Inscribiste a ${listNames(names)} a ${course}`
              : `Apartaste ${seats === 1 ? 'un lugar' : `${seats} lugares`} en ${course}`,
        };
      }),
      ...(check(certificates) as any[]).map(c => ({
        id: `cert-${c.id}`,
        at: c.created_at,
        timezone: null,
        type: 'success' as const,
        title: `${one<{ full_name: string }>(c.labor_workers)?.full_name ?? 'Tú'} obtuvo la constancia de ${one<{ title: string }>(c.labor_courses)?.title ?? 'un curso'}`,
      })),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  }

  private static async requireContractor(): Promise<Contractor> {
    const contractor = await this.getContractor();
    if (!contractor) throw new Error('Primero crea tu perfil de contratista.');
    return contractor;
  }
}

// ─────────── Fechas y zonas horarias ───────────

/** Zona horaria del teléfono. */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City';
  } catch {
    return 'America/Mexico_City';
  }
}

/** Partes de la fecha y hora de un instante en una zona horaria (o la del teléfono si no se puede). */
function zonedParts(date: Date, timezone?: string | null) {
  if (timezone) {
    try {
      const text = date.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      const m = text.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})/);
      if (m) return { y: +m[3], mo: +m[1], d: +m[2], h: +m[4] % 24, mi: +m[5] };
    } catch {
      // Sin soporte de zonas horarias: se usa la hora del teléfono.
    }
  }
  return { y: date.getFullYear(), mo: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), mi: date.getMinutes() };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-10-07": el día de hoy en una zona horaria. */
export function localDateIn(timezone?: string | null, at: Date = new Date()): string {
  const p = zonedParts(at, timezone);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "12 oct 2026" */
export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "7:02" en la hora de la obra (o del teléfono si no se da zona). */
export function formatTime(iso: string, timezone?: string | null): string {
  const p = zonedParts(new Date(iso), timezone);
  return `${p.h}:${pad(p.mi)}`;
}

/** "hoy · 7:02" o "3 oct 2026 · 7:02", en la hora de la obra. */
export function formatDayTime(iso: string, timezone?: string | null): string {
  const p = zonedParts(new Date(iso), timezone);
  const day = `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
  return `${day === localDateIn(timezone) ? 'hoy' : formatDate(day)} · ${p.h}:${pad(p.mi)}`;
}

/** "hace 5 min", "hace 2 h", "ayer · 7:02" o "3 oct · 7:02". */
export function formatAgo(iso: string, timezone?: string | null): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  if (minutes < 12 * 60) return `hace ${Math.round(minutes / 60)} h`;
  const p = zonedParts(new Date(iso), timezone);
  const day = `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
  const today = localDateIn(timezone);
  const label = day === today ? 'hoy' : day === addDays(today, -1) ? 'ayer' : `${p.d} ${MONTHS[p.mo - 1]}`;
  return `${label} · ${p.h}:${pad(p.mi)}`;
}

/** "sáb 10 oct · 8:00" para las fechas de los cursos. */
export function formatSessionDate(iso: string, timezone: string): string {
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const p = zonedParts(new Date(iso), timezone);
  const weekday = days[new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay()];
  return `${weekday} ${p.d} ${MONTHS[p.mo - 1]} · ${p.h}:${pad(p.mi)}`;
}

const TIMEZONE_LABELS: Record<string, string> = {
  'America/Mexico_City': 'Hora del centro',
  'America/Monterrey': 'Hora del centro',
  'America/Merida': 'Hora del centro',
  'America/Chihuahua': 'Hora del centro',
  'America/Bahia_Banderas': 'Hora del centro',
  'America/Cancun': 'Hora de Quintana Roo',
  'America/Hermosillo': 'Hora del Pacífico',
  'America/Mazatlan': 'Hora del Pacífico',
  'America/Tijuana': 'Hora de Baja California',
  'America/Ciudad_Juarez': 'Hora de Ciudad Juárez',
  'America/Matamoros': 'Hora de la frontera',
};

/** "Hora de Quintana Roo · 21:40" */
export function timezoneLabel(timezone: string): string {
  return `${TIMEZONE_LABELS[timezone] ?? timezone} · ${formatTime(new Date().toISOString(), timezone)}`;
}

/** Días entre hoy (en una zona) y una fecha. */
function daysUntil(isoDate: string, today: string): number {
  return (new Date(isoDate + 'T00:00:00Z').getTime() - new Date(today + 'T00:00:00Z').getTime()) / 86400000;
}

/** Estado de un documento según su vigencia. */
export function docStatus(expiresOn: string | null, today: string = localDateIn(deviceTimezone())): 'vigente' | 'por_vencer' | 'vencido' {
  if (!expiresOn) return 'vigente';
  const days = daysUntil(expiresOn, today);
  if (days < 0) return 'vencido';
  if (days <= 15) return 'por_vencer';
  return 'vigente';
}

/** Constancia que conviene renovar en los próximos 30 días. */
export function isExpiringSoon(expiresOn: string | null): boolean {
  if (!expiresOn) return false;
  return daysUntil(expiresOn, localDateIn(deviceTimezone())) <= 30;
}

export type CredentialState = 'vigente' | 'por_renovar' | 'vencida';

export function credentialState(expiresOn: string | null): CredentialState {
  if (!expiresOn) return 'vigente';
  const days = daysUntil(expiresOn, localDateIn(deviceTimezone()));
  if (days < 0) return 'vencida';
  return days <= 30 ? 'por_renovar' : 'vigente';
}

/** Constancia válida y sin vencer de un curso. */
export function hasValidCertificate(worker: Worker, courseId: string): boolean {
  return worker.credentials.some(c => c.course_id === courseId && c.status === 'valid' && credentialState(c.expires_on) !== 'vencida');
}

/** Precio por persona con el descuento del nivel (null = por confirmar). */
export function coursePriceFor(course: Course, level: ProLevel): number | null {
  if (course.price === null) return null;
  return Math.round(course.price * (1 - (course.discount_by_level?.[level] ?? 0)) * 100) / 100;
}

// ─────────── Gafete ───────────

/**
 * Enlace que se codifica en el QR del gafete. Abre la app en la ruta
 * gafete/[code]; el residente también lo puede leer con "Escanear gafete"
 * en la app de constructor. Solo usuarios con sesión pueden verificar.
 */
export const BADGE_VERIFY_BASE_URL = 'construction-operations-management://gafete/';

export const badgeVerifyUrl = (verifyCode: string) => `${BADGE_VERIFY_BASE_URL}${encodeURIComponent(verifyCode)}`;

/** Saca el código BLD-… de lo que leyó la cámara (enlace completo o código solo). */
export function parseBadgeCode(scanned: string): string | null {
  const text = decodeURIComponent(scanned.trim());
  const match = text.match(/BLD-[A-Z0-9]{4,}/i);
  return match ? match[0].toUpperCase() : null;
}
