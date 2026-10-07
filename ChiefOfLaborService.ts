import { supabase } from '@/app/lib/supabase';

// Datos del contratista de mano de obra (Frentes, Cuadrillas y Perfil).
// Tablas y funciones: supabase/migrations/20261007120000_chief_of_labor.sql

export type WorkerLevel = 'ayudante' | 'oficial' | 'maestro';
export type CredentialType = 'buildi' | 'dc3' | 'conocer';
export type ProLevel = 'bronce' | 'plata' | 'oro';
export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface Contractor {
  id: string;
  display_name: string;
  business_name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  years_experience: number | null;
}

export interface ContractorMetrics {
  on_time_rate: number;
  adjusted_share: number;
  builder_rating: number;
  months_on_buildi: number;
}

export interface LaborSite {
  id: string;
  name: string;
  builder_name: string;
}

export interface Crew {
  id: string;
  name: string;
  site_label: string | null;
  status: 'active' | 'break' | 'inactive';
  efficiency: number;
  height_note: string | null;
  lead_worker_id: string | null;
}

export interface Course {
  id: string;
  title: string;
  credential_type: CredentialType;
  issuer: string;
  audience: 'crew' | 'contractor';
  hours_label: string;
  modality: string;
  price: number;
  discount_by_level: Record<ProLevel, number>;
  renew_years: number | null;
  recommended_for: string | null;
}

export interface Credential {
  id: string;
  course_id: string;
  folio: string;
  issued_on: string;
  renew_on: string | null;
}

export interface Worker {
  id: string;
  crew_id: string | null;
  code: string;
  full_name: string;
  trade: string;
  level: WorkerLevel;
  color: string;
  imss_registered: boolean;
  joined_year: number | null;
  verify_code: string;
  attendance: AttendanceStatus | null;
  credentials: Credential[];
  sites: { site_name: string; year: number }[];
}

export interface Enrollment {
  id: string;
  course_id: string;
  worker_id: string | null;
  seats: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
}

export interface Front {
  id: string;
  labor_site_id: string;
  item_code: string;
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

export interface QuoteConcept {
  id: string;
  description: string;
  unit: string;
  default_unit_price: number;
  rate_per_person_day: number;
  market_unit_price: number;
}

export interface ComplianceDoc {
  id: string;
  kind: string;
  name: string;
  detail: string | null;
  expires_on: string | null;
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

export interface RecommendationAction {
  worker_id: string;
  rec_key: string;
  action: 'done' | 'later';
}

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const today = () => new Date().toISOString().slice(0, 10);

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export class ChiefOfLaborService {
  /** Contratista del usuario con sesión, o null si aún no tiene. */
  static async getContractor(): Promise<Contractor | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Inicia sesión para ver tus datos.');
    const row = check(await supabase.from('labor_contractors').select('*').eq('owner_id', auth.user.id).maybeSingle());
    return (row as Contractor | null) ?? null;
  }

  /** Crea "Mano de Obra Pérez" con datos de ejemplo para el usuario actual. */
  static async seedDemo(): Promise<void> {
    check(await supabase.rpc('labor_seed_demo'));
  }

  static async getSites(): Promise<LaborSite[]> {
    return check(await supabase.from('labor_sites').select('id, name, builder_name').eq('active', true).order('sort')) as LaborSite[];
  }

  static async getCrews(): Promise<Crew[]> {
    return check(await supabase.from('labor_crews').select('*').order('sort')) as Crew[];
  }

  static async getCourses(): Promise<Course[]> {
    const rows = check(await supabase.from('labor_courses').select('*').order('sort')) as Course[];
    return rows.map(c => ({ ...c, price: num(c.price) }));
  }

  /** Trabajadores con su pase de lista de hoy, constancias e historial de obras. */
  static async getWorkers(): Promise<Worker[]> {
    const rows = check(
      await supabase
        .from('labor_workers')
        .select('*, labor_credentials(id, course_id, folio, issued_on, renew_on), labor_worker_sites(site_name, year), labor_attendance(status, work_date)')
        .eq('active', true)
        .eq('labor_attendance.work_date', today())
        .order('created_at'),
    ) as any[];
    return rows.map(r => ({
      id: r.id,
      crew_id: r.crew_id,
      code: r.code,
      full_name: r.full_name,
      trade: r.trade,
      level: r.level,
      color: r.color,
      imss_registered: r.imss_registered,
      joined_year: r.joined_year,
      verify_code: r.verify_code,
      attendance: r.labor_attendance?.[0]?.status ?? null,
      credentials: r.labor_credentials ?? [],
      sites: (r.labor_worker_sites ?? []).sort((a: { year: number }, b: { year: number }) => b.year - a.year),
    }));
  }

  static async getEnrollments(): Promise<Enrollment[]> {
    const rows = check(await supabase.from('labor_enrollments').select('*').neq('status', 'cancelled')) as Enrollment[];
    return rows.map(e => ({ ...e, progress: num(e.progress) }));
  }

  /** Inscribe trabajadores concretos o, si no hay ids, lugares sin asignar. */
  static async enroll(courseId: string, workerIds: string[], seats = 1): Promise<void> {
    const contractor = await this.getContractor();
    if (!contractor) throw new Error('No hay contratista.');
    const rows: { contractor_id: string; course_id: string; worker_id: string | null; seats: number }[] = workerIds.length
      ? workerIds.map(worker_id => ({ contractor_id: contractor.id, course_id: courseId, worker_id, seats: 1 }))
      : [{ contractor_id: contractor.id, course_id: courseId, worker_id: null, seats }];
    check(await supabase.from('labor_enrollments').insert(rows));
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

  static async markImssRegistered(workerId: string): Promise<void> {
    check(await supabase.from('labor_workers').update({ imss_registered: true }).eq('id', workerId));
  }

  static async getFronts(siteId: string): Promise<Front[]> {
    const fronts = check(
      await supabase.from('labor_fronts_summary').select('*').eq('labor_site_id', siteId).order('sort'),
    ) as any[];
    if (!fronts.length) return [];
    const members = check(
      await supabase.from('labor_front_members').select('front_id, worker_id').in('front_id', fronts.map(f => f.id)),
    ) as { front_id: string; worker_id: string }[];
    return fronts.map(f => ({
      id: f.id,
      labor_site_id: f.labor_site_id,
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

  static async recordProgress(frontId: string, quantity: number, reason: string | null): Promise<void> {
    check(await supabase.rpc('labor_record_progress', { p_front_id: frontId, p_quantity: quantity, p_reason: reason }));
  }

  static async moveMembers(fromFrontId: string, toFrontId: string, workerIds: string[]): Promise<void> {
    check(await supabase.from('labor_front_members').delete().eq('front_id', fromFrontId).in('worker_id', workerIds));
    check(await supabase.from('labor_front_members').insert(workerIds.map(worker_id => ({ front_id: toFrontId, worker_id }))));
  }

  static async getQuoteCatalog(): Promise<QuoteConcept[]> {
    const rows = check(await supabase.from('labor_quote_catalog').select('*').order('sort')) as QuoteConcept[];
    return rows.map(r => ({
      ...r,
      default_unit_price: num(r.default_unit_price),
      rate_per_person_day: num(r.rate_per_person_day),
      market_unit_price: num(r.market_unit_price),
    }));
  }

  static async sendQuote(q: {
    siteId: string | null;
    builderName: string;
    catalogId: string;
    volume: number;
    people: number;
    unitPrice: number;
    estDays: number;
    estPayroll: number;
  }): Promise<void> {
    const contractor = await this.getContractor();
    if (!contractor) throw new Error('No hay contratista.');
    check(
      await supabase.from('labor_quotes').insert({
        contractor_id: contractor.id,
        labor_site_id: q.siteId,
        builder_name: q.builderName,
        catalog_id: q.catalogId,
        volume: q.volume,
        people: q.people,
        unit_price: q.unitPrice,
        est_days: q.estDays,
        est_payroll: Math.round(q.estPayroll),
        status: 'sent',
      }),
    );
  }

  static async getMetrics(): Promise<ContractorMetrics | null> {
    const row = check(await supabase.from('labor_contractor_metrics').select('*').maybeSingle()) as any;
    if (!row) return null;
    return {
      on_time_rate: num(row.on_time_rate),
      adjusted_share: num(row.adjusted_share),
      builder_rating: num(row.builder_rating),
      months_on_buildi: row.months_on_buildi,
    };
  }

  static async getComplianceDocs(): Promise<ComplianceDoc[]> {
    return check(await supabase.from('labor_compliance_docs').select('id, kind, name, detail, expires_on').order('sort')) as ComplianceDoc[];
  }

  /** Por ahora solo mueve la fecha; el siguiente paso es subir el PDF a Storage. */
  static async renewComplianceDoc(id: string, days = 30): Promise<void> {
    const expires = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    check(await supabase.from('labor_compliance_docs').update({ expires_on: expires, updated_at: new Date().toISOString() }).eq('id', id));
  }

  static async getBenefits(): Promise<Benefit[]> {
    return check(await supabase.from('labor_benefits').select('*').order('sort')) as Benefit[];
  }

  /** Lo que ve el residente al escanear un gafete. null = código no encontrado. */
  static async verifyBadge(code: string): Promise<BadgeVerification | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error('Inicia sesión en BuildI para verificar gafetes.');
    const data = check(await supabase.rpc('labor_verify_badge', { p_code: code }));
    return (data as BadgeVerification | null) ?? null;
  }

  static async requestBenefit(benefitId: string): Promise<void> {
    const contractor = await this.getContractor();
    if (!contractor) throw new Error('No hay contratista.');
    check(await supabase.from('labor_benefit_requests').insert({ contractor_id: contractor.id, benefit_id: benefitId }));
  }
}

/** Estado de un documento según su fecha de vencimiento. */
export function docStatus(expiresOn: string | null): 'vigente' | 'por_vencer' | 'vencido' {
  if (!expiresOn) return 'vigente';
  const days = (new Date(expiresOn + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime()) / 86400000;
  if (days < 0) return 'vencido';
  if (days <= 15) return 'por_vencer';
  return 'vigente';
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "12 oct 2026" */
export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Credencial que conviene renovar en los próximos 30 días. */
export function isExpiringSoon(renewOn: string | null): boolean {
  if (!renewOn) return false;
  const days = (new Date(renewOn + 'T00:00:00').getTime() - Date.now()) / 86400000;
  return days <= 30;
}

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

export type CredentialState = 'vigente' | 'por_renovar' | 'vencida';

export function credentialState(renewOn: string | null): CredentialState {
  if (!renewOn) return 'vigente';
  const days = (new Date(renewOn + 'T00:00:00').getTime() - Date.now()) / 86400000;
  if (days < 0) return 'vencida';
  return days <= 30 ? 'por_renovar' : 'vigente';
}
