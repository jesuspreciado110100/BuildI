import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Benefit,
  Certificate,
  ChiefOfLaborService,
  ComplianceDoc,
  Contractor,
  Course as CourseRow_,
  CredentialType,
  DocKind,
  Enrollment,
  ProLevel,
  Score,
  ScoreFactor,
  coursePriceFor,
  deviceTimezone,
  docStatus,
  formatDate,
  hasValidCertificate,
  localDateIn,
} from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';
import { Chips, CourseEnrollPanel, LaborField, LaborSheet, MultiChips, SheetButton, money } from '@/app/components/LaborSheets';

// Perfil del contratista de mano de obra: nivel BuildI Pro calculado en el
// servidor con su desempeño, beneficios que se desbloquean por nivel,
// expediente de cumplimiento (REPSE, IMSS, Infonavit, SAT) que revisa BuildI
// y cursos con su tipo de constancia, fechas y lugares. Datos en Supabase:
// labor_my_score(), labor_compliance_docs, labor_benefits, labor_courses,
// labor_open_sessions(), labor_enrollments y labor_certificates.

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Level {
  key: ProLevel;
  name: string;
  min: number;
  color: string;
}

interface Course extends CourseRow_ {
  certified: number;
  enrolled: number;
  /** Quién de la cuadrilla no lo tiene vigente ni está inscrito. */
  pending: { id: string; name: string }[];
  mine: Enrollment | null;
  myCertificate: Certificate | null;
}

interface ProfileData {
  contractor: Contractor;
  score: Score;
  docs: ComplianceDoc[];
  benefits: Benefit[];
  courses: Course[];
  crewSize: number;
  crews: number;
  sites: number;
}

const COLORS = {
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  body: '#374151',
  muted: '#6B7280',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  primary: '#2563EB',
  primarySoft: '#EBF4FF',
  success: '#10B981',
  successSoft: '#D1FAE5',
  successText: '#047857',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningText: '#B45309',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
  errorText: '#B91C1C',
};

const LEVELS: Level[] = [
  { key: 'bronce', name: 'Bronce', min: 0, color: '#B45309' },
  { key: 'plata', name: 'Plata', min: 60, color: '#64748B' },
  { key: 'oro', name: 'Oro', min: 80, color: '#D97706' },
];

const CREDENTIALS: Record<CredentialType, { label: string; color: string; bg: string; issuer: string; steps: string[] }> = {
  buildi: {
    label: 'Constancia BuildI',
    color: COLORS.primary,
    bg: COLORS.primarySoft,
    issuer: 'La emite BuildI. No es oficial, pero cuenta para tu nivel y se verifica con el QR del gafete.',
    steps: [
      'Clases en video de 3 a 5 minutos, con audio y sin internet.',
      'Examen corto en la app; se califica solo (3 intentos por día).',
      'Prueba práctica en obra, validada por el residente con foto.',
      'La constancia sale sola y aparece en el gafete.',
    ],
  },
  dc3: {
    label: 'DC-3 · STPS',
    color: COLORS.warningText,
    bg: COLORS.warningSoft,
    issuer: 'La emite un agente capacitador registrado ante la STPS, aliado de BuildI.',
    steps: [
      'Eliges fecha y sede. Si todavía no hay fecha, apartas el lugar.',
      'Curso presencial con el instructor del agente capacitador.',
      'Pase de lista con identificación y evaluación del instructor.',
      'Con la CURP de tu trabajador y tu RFC se emite la DC-3 y queda en el gafete.',
    ],
  },
  conocer: {
    label: 'Certificado CONOCER',
    color: COLORS.successText,
    bg: COLORS.successSoft,
    issuer: 'Lo emite CONOCER después de una evaluación con un evaluador acreditado.',
    steps: [
      'Evaluación práctica en obra con un evaluador acreditado.',
      'Se guardan fotos, video e identificación como evidencia.',
      'Si resulta competente, CONOCER emite el certificado con su folio.',
      'Queda en el gafete y sube el precio de la cuadrilla.',
    ],
  },
};

// Expediente que piden las constructoras. Vigencia: opiniones de
// cumplimiento 30 días naturales desde su emisión; REPSE, 3 años.
const REQUIRED_DOCS: { kind: DocKind; name: string; detail: string; validity: string }[] = [
  { kind: 'repse', name: 'Registro REPSE', detail: 'STPS · obras especializadas', validity: 'Vale 3 años desde su emisión.' },
  { kind: 'imss', name: 'Opinión de cumplimiento IMSS', detail: 'La constructora la pide cada mes', validity: 'Vale 30 días desde su emisión.' },
  { kind: 'infonavit', name: 'Opinión de cumplimiento Infonavit', detail: 'La constructora la pide cada mes', validity: 'Vale 30 días desde su emisión.' },
  { kind: 'sat', name: 'Opinión de cumplimiento SAT (32-D)', detail: 'Positiva', validity: 'Vale 30 días desde su emisión.' },
];

const FACTOR_LABELS: Record<ScoreFactor['key'], string> = {
  on_time: 'Entregas a tiempo',
  adjusted: 'Volumen ajustado por el residente',
  rating: 'Calificación de constructoras',
  docs: 'Papeles al día (revisados por BuildI)',
  months: 'Antigüedad en BuildI',
};

const MENU_ITEMS: { title: string; icon: IconName; color: string }[] = [
  { title: 'Datos de la cuenta', icon: 'settings-outline', color: '#6B7280' },
  { title: 'Notificaciones', icon: 'notifications-outline', color: '#6B7280' },
  { title: 'Protocolos de seguridad', icon: 'shield-outline', color: '#10B981' },
  { title: 'Reportes de la cuadrilla', icon: 'document-text-outline', color: '#3B82F6' },
  { title: 'Ayuda', icon: 'help-circle-outline', color: '#6B7280' },
  { title: 'Cerrar sesión', icon: 'log-out-outline', color: '#EF4444' },
];

const RFC_PATTERN = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;

const levelIndex = (key: ProLevel) => LEVELS.findIndex(l => l.key === key);
const levelOf = (key: ProLevel) => LEVELS[Math.max(0, levelIndex(key))];
const benefitIcon = (name: string) => name as IconName;

function factorValue(f: ScoreFactor): string {
  if (f.key === 'docs') return `${f.value ?? 0} de ${f.required ?? 4}`;
  if (f.key === 'months') return `${f.value ?? 0} ${f.value === 1 ? 'mes' : 'meses'}`;
  if (f.value === null) return 'Sin datos todavía';
  if (f.key === 'on_time') return `${Math.round(f.value * 100)}%`;
  if (f.key === 'adjusted') return `${(f.value * 100).toFixed(1)}%`;
  return `★ ${f.value.toFixed(1)}`;
}

type DocView = { kind: DocKind; name: string; detail: string; validity: string; doc: ComplianceDoc | null };

function docLine(v: DocView): { icon: IconName; color: string; text: string; action: string | null; danger?: boolean } {
  const d = v.doc;
  if (!d) return { icon: 'add-circle', color: COLORS.muted, text: 'Falta registrarlo', action: 'Registrar' };
  const expires = d.expires_on ? ` · vence ${formatDate(d.expires_on)}` : '';
  if (d.review_status === 'rejected') {
    return { icon: 'close-circle', color: COLORS.error, text: `Rechazado${d.review_note ? `: ${d.review_note}` : ''}`, action: 'Volver a registrar', danger: true };
  }
  const status = docStatus(d.expires_on);
  if (status === 'vencido') return { icon: 'alert-circle', color: COLORS.error, text: `Venció el ${formatDate(d.expires_on)}`, action: 'Renovar', danger: true };
  if (d.review_status === 'pending_review') return { icon: 'time', color: COLORS.warning, text: `En revisión de BuildI${expires}`, action: 'Actualizar' };
  if (status === 'por_vencer') return { icon: 'time', color: COLORS.warning, text: `Vence ${formatDate(d.expires_on)}`, action: 'Renovar' };
  return { icon: 'checkmark-circle', color: COLORS.success, text: `Verificado${expires}`, action: null };
}

async function loadProfile(): Promise<ProfileData> {
  const [contractor, score, docs, benefits, courseRows, enrollments, crews, sites, myCertificates] = await Promise.all([
    ChiefOfLaborService.getContractor(),
    ChiefOfLaborService.getScore(),
    ChiefOfLaborService.getComplianceDocs(),
    ChiefOfLaborService.getBenefits(),
    ChiefOfLaborService.getCourses(),
    ChiefOfLaborService.getEnrollments(),
    ChiefOfLaborService.getCrews(),
    ChiefOfLaborService.getSites(),
    ChiefOfLaborService.getMyCertificates(),
  ]);
  if (!contractor) throw new Error('No hay contratista.');
  const workers = await ChiefOfLaborService.getWorkers(sites);
  const live = (e: Enrollment) => e.status === 'reserved' || e.status === 'enrolled' || e.status === 'attended';
  const courses: Course[] = courseRows.map(c => ({
    ...c,
    certified: workers.filter(w => hasValidCertificate(w, c.id)).length,
    enrolled: enrollments.filter(e => e.course_id === c.id && !e.for_contractor && live(e)).length,
    pending: workers
      .filter(w => !hasValidCertificate(w, c.id) && !enrollments.some(e => e.worker_id === w.id && e.course_id === c.id && live(e)))
      .map(w => ({ id: w.id, name: w.full_name })),
    mine: enrollments.find(e => e.course_id === c.id && e.for_contractor && e.status !== 'cancelled') ?? null,
    myCertificate: myCertificates.find(cr => cr.course_id === c.id) ?? null,
  }));
  return {
    contractor,
    score,
    docs,
    benefits,
    courses,
    crewSize: workers.length,
    crews: crews.length,
    sites: sites.filter(s => s.active).length,
  };
}

export default function ChiefOfLaborProfile() {
  const { state, reload } = useLaborData(loadProfile);
  return (
    <LaborDataGate title="Perfil" state={state} reload={reload}>
      {data => <ProfileScreen data={data} reload={reload} />}
    </LaborDataGate>
  );
}

function ProfileScreen({ data, reload }: { data: ProfileData; reload: (silent?: boolean) => Promise<void> }) {
  const { contractor, docs, courses, benefits, crewSize, score } = data;
  const [benefitId, setBenefitId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [docKind, setDocKind] = useState<DocKind | null>(null);
  const [editingFiscal, setEditingFiscal] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const benefit = benefits.find(b => b.id === benefitId) ?? null;
  const course = courses.find(c => c.id === courseId) ?? null;

  const level = levelOf(score.level);
  const next = LEVELS[levelIndex(level.key) + 1];
  const docViews: DocView[] = REQUIRED_DOCS.map(r => ({ ...r, doc: docs.find(d => d.kind === r.kind) ?? null }));
  const otherDocs = docs.filter(d => !REQUIRED_DOCS.some(r => r.kind === d.kind));
  const docsFactor = score.factors.find(f => f.key === 'docs');
  const docView = docViews.find(v => v.kind === docKind) ?? null;

  const pop = useRef(new Animated.Value(1)).current;
  const prevLevel = useRef(level.key);
  useEffect(() => {
    if (levelIndex(level.key) > levelIndex(prevLevel.current)) {
      Animated.sequence([
        Animated.spring(pop, { toValue: 1.15, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      Alert.alert(`¡Subiste a ${level.name}!`, 'Se desbloquearon nuevos beneficios para ti y tu cuadrilla.');
    }
    prevLevel.current = level.key;
  }, [level.key, level.name, pop]);

  const run = async (work: () => Promise<void>, done?: [string, string]) => {
    try {
      await work();
      await reload(true);
      if (done) Alert.alert(done[0], done[1]);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    }
  };

  const requestBenefit = (b: Benefit) => {
    setBenefitId(null);
    run(() => ChiefOfLaborService.requestBenefit(b.id), [b.title, 'Solicitud enviada. Te avisamos por WhatsApp cuando esté aplicado.']);
  };

  const shareDocs = () => {
    const lines = docViews.map(v => {
      const d = v.doc;
      if (!d) return `• ${v.name}: pendiente`;
      const state = d.review_status === 'verified' ? 'verificado por BuildI' : d.review_status === 'pending_review' ? 'en revisión' : 'rechazado';
      return `• ${v.name}: ${state}${d.expires_on ? `, vence ${formatDate(d.expires_on)}` : ''}`;
    });
    Share.share({ message: `Expediente de ${contractor.business_name}${contractor.rfc ? ` (RFC ${contractor.rfc})` : ''}:\n${lines.join('\n')}` }).catch(
      () => undefined,
    );
  };

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const crewCourses = courses.filter(c => c.audience === 'crew');
  const myCourses = courses.filter(c => c.audience === 'contractor');
  const activeBenefits = benefits.filter(b => levelIndex(b.min_level) <= levelIndex(level.key)).length;
  const missingDocs = docViews.filter(v => !v.doc || v.doc.review_status !== 'verified' || docStatus(v.doc.expires_on) === 'vencido');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{contractor.display_name}</Text>
          <Text style={styles.title}>Contratista de mano de obra</Text>
          <Text style={styles.company}>{contractor.business_name}{contractor.city ? ` · ${contractor.city}` : ''}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.crews}</Text>
            <Text style={styles.statLabel}>Cuadrillas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{crewSize}</Text>
            <Text style={styles.statLabel}>Trabajadores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.sites}</Text>
            <Text style={styles.statLabel}>Obras activas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BuildI Pro</Text>
          <TouchableOpacity style={styles.infoCard} onPress={() => setShowScore(true)} activeOpacity={0.85}>
            <View style={styles.levelTop}>
              <View style={[styles.levelIcon, { backgroundColor: COLORS.warningSoft }]}>
                <Ionicons name="medal" size={26} color={level.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelEyebrow}>Tu nivel</Text>
                <Animated.Text style={[styles.levelName, { color: level.color, transform: [{ scale: pop }] }]}>
                  {level.name}
                </Animated.Text>
              </View>
              <View style={styles.scoreBubble}>
                <Text style={styles.scoreValue}>{Math.round(score.score)}</Text>
                <Text style={styles.scoreMax}>de 100</Text>
              </View>
            </View>
            <LevelBar score={score.score} />
            {next ? (
              <Text style={styles.levelHint}>
                Te faltan {Math.max(0, next.min - score.score).toFixed(1)} puntos para {next.name}.
                {missingDocs.length ? ` Cada papel revisado y al día suma ${(20 / REQUIRED_DOCS.length).toFixed(0)} puntos.` : ''}
              </Text>
            ) : (
              <Text style={styles.levelHint}>Estás en el nivel más alto. Mantén tus papeles al día para conservarlo.</Text>
            )}
            <Text style={styles.link}>Ver cómo se calcula</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Tus beneficios" note={`${activeBenefits} de ${benefits.length} activos`} />
          {benefits.map(b => {
            const unlocked = levelIndex(b.min_level) <= levelIndex(level.key);
            const minName = levelOf(b.min_level).name;
            return (
              <TouchableOpacity key={b.id} style={styles.achievementCard} onPress={() => setBenefitId(b.id)} activeOpacity={0.8}>
                <View style={[styles.achievementIcon, !unlocked && { backgroundColor: COLORS.divider }]}>
                  <Ionicons name={unlocked ? benefitIcon(b.icon) : 'lock-closed'} size={22} color={unlocked ? COLORS.warning : '#9CA3AF'} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, !unlocked && { color: COLORS.muted }]}>{b.title}</Text>
                  <Text style={styles.achievementYear} numberOfLines={2}>
                    {unlocked ? b.by_level?.[level.key] ?? b.summary : `Se desbloquea en ${minName}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Expediente de cumplimiento" note="lo ven las constructoras" />
          <View style={styles.infoCard}>
            {docViews.map((v, i) => {
              const line = docLine(v);
              return (
                <View key={v.kind} style={[styles.docRow, i > 0 && styles.rowBorder]}>
                  <Ionicons name={line.icon} size={22} color={line.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{v.name}</Text>
                    <Text style={styles.docDetail}>{line.text}</Text>
                  </View>
                  {line.action && (
                    <TouchableOpacity
                      style={[styles.actionButton, line.danger && { backgroundColor: COLORS.errorSoft }]}
                      onPress={() => setDocKind(v.kind)}
                    >
                      <Text style={[styles.actionText, line.danger && { color: COLORS.errorText }]}>{line.action}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            {otherDocs.map(d => (
              <View key={d.id} style={[styles.docRow, styles.rowBorder]}>
                <Ionicons name="document-text" size={22} color={COLORS.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docDetail}>{d.detail ?? (d.review_status === 'verified' ? 'Verificado' : 'En revisión de BuildI')}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.outlineButton} onPress={shareDocs}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Compartir expediente</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Cursos para tu cuadrilla" note={`${crewSize} personas`} />
          {crewCourses.map(c => (
            <CourseRow key={c.id} course={c} crewSize={crewSize} level={level.key} onPress={() => setCourseId(c.id)} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Cursos para ti" note="negocio" />
          {myCourses.map(c => (
            <CourseRow key={c.id} course={c} crewSize={crewSize} level={level.key} onPress={() => setCourseId(c.id)} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información profesional</Text>
          <View style={styles.infoCard}>
            {contractor.years_experience ? <InfoRow icon="briefcase" text={`Experiencia: ${contractor.years_experience} años`} /> : null}
            {docViews.some(v => v.kind === 'repse' && v.doc?.review_status === 'verified' && docStatus(v.doc.expires_on) !== 'vencido') ? (
              <InfoRow icon="ribbon" text="REPSE vigente · obras especializadas" />
            ) : null}
            <TouchableOpacity onPress={() => setEditingFiscal(true)}>
              <InfoRow
                icon="document-text"
                text={contractor.rfc ? `RFC ${contractor.rfc}${contractor.legal_name ? ` · ${contractor.legal_name}` : ''}` : 'Agrega tu RFC y razón social (van en las DC-3)'}
              />
            </TouchableOpacity>
            {contractor.email ? <InfoRow icon="mail" text={contractor.email} /> : null}
            {contractor.phone ? <InfoRow icon="call" text={contractor.phone} last /> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity key={item.title} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color={item.color} />
                <Text style={[styles.menuItemText, { color: item.color }]}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <LaborSheet visible={showScore} onClose={() => setShowScore(false)}>
        <Text style={styles.sheetEyebrow}>BuildI Pro</Text>
        <Text style={styles.sheetTitle}>Cómo se calcula tu nivel</Text>
        <View style={styles.infoCard}>
          {score.factors.map((f, i) => (
            <View key={f.key} style={[styles.factor, i > 0 && styles.rowBorder]}>
              <View style={styles.factorTop}>
                <Text style={styles.factorLabel}>{FACTOR_LABELS[f.key]}</Text>
                <Text style={[styles.factorValue, f.value === null && { color: COLORS.muted, fontWeight: '500' }]}>{factorValue(f)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${f.max ? (f.points / f.max) * 100 : 0}%` as const }]} />
              </View>
              <Text style={styles.factorPoints}>{f.points.toFixed(1)} de {f.max} puntos</Text>
            </View>
          ))}
        </View>
        <View style={styles.infoCard}>
          {LEVELS.map((l, i) => (
            <View key={l.key} style={[styles.levelRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.levelDot, { backgroundColor: l.color }]} />
              <Text style={styles.levelRowName}>{l.name}</Text>
              <Text style={styles.levelRowMin}>desde {l.min} puntos</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sheetNote}>
          Las entregas, los ajustes y las calificaciones salen de tus estimaciones firmadas en BuildI; mientras no haya, no suman.
          {docsFactor ? ' Los papeles cuentan cuando BuildI los revisa y están vigentes.' : ''}
        </Text>
      </LaborSheet>

      <LaborSheet visible={!!benefit} onClose={() => setBenefitId(null)}>
        {benefit && <BenefitDetail benefit={benefit} level={level} onUse={() => requestBenefit(benefit)} />}
      </LaborSheet>

      <LaborSheet visible={!!course} onClose={() => setCourseId(null)}>
        {course && (
          <CourseDetail
            course={course}
            crewSize={crewSize}
            level={level.key}
            onEnrolled={message => {
              setCourseId(null);
              reload(true);
              Alert.alert(course.title, message);
            }}
          />
        )}
      </LaborSheet>

      <LaborSheet visible={!!docView} onClose={() => setDocKind(null)}>
        {docView && (
          <DocForm
            view={docView}
            onSaved={() => {
              setDocKind(null);
              reload(true);
              Alert.alert(docView.name, 'Registrado. BuildI lo revisa y, si está bien, empieza a contar para tu nivel.');
            }}
          />
        )}
      </LaborSheet>

      <LaborSheet visible={editingFiscal} onClose={() => setEditingFiscal(false)}>
        {editingFiscal && (
          <FiscalForm
            contractor={contractor}
            onSaved={() => {
              setEditingFiscal(false);
              reload(true);
            }}
          />
        )}
      </LaborSheet>
    </View>
  );
}

function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1 }]}>{title}</Text>
      {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
    </View>
  );
}

function InfoRow({ icon, text, last }: { icon: IconName; text: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && { marginBottom: 0 }]}>
      <Ionicons name={icon} size={20} color="#6B7280" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function LevelBar({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(score)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 600, useNativeDriver: false }).start();
  }, [score, anim]);

  return (
    <View style={styles.levelBarWrap}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}
        />
      </View>
      {LEVELS.slice(1).map(l => (
        <View key={l.key} style={[styles.levelMark, { left: `${l.min}%` as const }]}>
          <View style={styles.levelTick} />
          <Text style={styles.levelMarkText}>{l.name}</Text>
        </View>
      ))}
    </View>
  );
}

function priceLabel(course: Course, level: ProLevel) {
  const price = coursePriceFor(course, level);
  return price === null ? 'Por confirmar' : price === 0 ? 'Gratis' : money(price);
}

function CourseRow({ course, crewSize, level, onPress }: { course: Course; crewSize: number; level: ProLevel; onPress: () => void }) {
  const cred = CREDENTIALS[course.credential_type];
  const mine = course.audience === 'contractor';
  const pct = mine ? (course.myCertificate ? 1 : course.mine?.progress ?? 0) : crewSize ? course.certified / crewSize : 0;
  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.courseTop}>
        <View style={[styles.badge, { backgroundColor: cred.bg }]}>
          <Text style={[styles.badgeText, { color: cred.color }]}>{cred.label}</Text>
        </View>
        <Text style={styles.coursePrice}>{priceLabel(course, level)}</Text>
      </View>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.courseMeta}>{course.hours_label} · {course.modality}</Text>
      {course.recommended_for && <Text style={styles.courseRequired}>{course.recommended_for}</Text>}
      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { flex: 1 }]}>
          <View style={[styles.progressFill, { width: `${Math.min(1, pct) * 100}%` as const }]} />
        </View>
        <Text style={styles.courseMeta}>
          {mine
            ? course.myCertificate
              ? 'Aprobado'
              : course.mine
                ? `${Math.round(pct * 100)}%`
                : 'Sin empezar'
            : `${course.certified} de ${crewSize}${course.enrolled ? ` · ${course.enrolled} inscritos` : ''}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <>
      {steps.map((s, i) => (
        <View key={s} style={styles.stepRow}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{s}</Text>
        </View>
      ))}
    </>
  );
}

function BenefitDetail({ benefit, level, onUse }: { benefit: Benefit; level: Level; onUse: () => void }) {
  const unlocked = levelIndex(benefit.min_level) <= levelIndex(level.key);
  return (
    <>
      <Text style={styles.sheetEyebrow}>
        {unlocked ? `Activo en tu nivel ${level.name}` : `Se desbloquea en ${levelOf(benefit.min_level).name}`}
      </Text>
      <Text style={styles.sheetTitle}>{benefit.title}</Text>
      <Text style={styles.sheetText}>{benefit.summary}</Text>
      {benefit.by_level && (
        <View style={styles.infoCard}>
          {LEVELS.map((l, i) => (
            <View key={l.key} style={[styles.levelRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.levelDot, { backgroundColor: l.color }]} />
              <Text style={[styles.levelRowName, l.key === level.key && { color: COLORS.primary }]}>{l.name}</Text>
              <Text style={[styles.levelRowMin, l.key === level.key && { color: COLORS.text, fontWeight: '600' }]}>
                {benefit.by_level?.[l.key]}
              </Text>
            </View>
          ))}
        </View>
      )}
      {benefit.how.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Cómo funciona</Text>
          <Steps steps={benefit.how} />
        </View>
      )}
      {benefit.partner && <Text style={styles.sheetNote}>{benefit.partner}. BuildI lo ofrece; el aliado lo otorga.</Text>}
      {unlocked ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onUse}>
          <Text style={styles.primaryButtonText}>Usar beneficio</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.notice, { backgroundColor: COLORS.primarySoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.primary }]}>Sube de nivel con entregas a tiempo, menos ajustes del residente y tus papeles al día.</Text>
        </View>
      )}
    </>
  );
}

function CourseDetail({ course, crewSize, level, onEnrolled }: { course: Course; crewSize: number; level: ProLevel; onEnrolled: (message: string) => void }) {
  const cred = CREDENTIALS[course.credential_type];
  const mine = course.audience === 'contractor';
  const [people, setPeople] = useState<string[]>(course.pending.map(p => p.id));

  return (
    <>
      <View style={[styles.badge, { backgroundColor: cred.bg, alignSelf: 'flex-start' }]}>
        <Text style={[styles.badgeText, { color: cred.color }]}>{cred.label}</Text>
      </View>
      <Text style={styles.sheetTitle}>{course.title}</Text>
      <Text style={styles.sheetText}>{course.hours_label} · {course.modality}</Text>
      {course.recommended_for && (
        <View style={[styles.notice, { backgroundColor: COLORS.warningSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.warningText }]}>
            {course.recommended_for}. Si alguien no la tiene, la app te lo recomienda antes de mandarlo a un frente en altura; tú decides.
          </Text>
        </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>Cómo se certifica</Text>
        <Steps steps={cred.steps} />
        <Text style={styles.sheetNote}>{course.provider_id ? cred.issuer : `${cred.issuer} Estamos cerrando el acuerdo con el aliado; puedes apartar lugar.`}</Text>
      </View>

      {mine ? (
        course.myCertificate ? (
          <View style={[styles.notice, { backgroundColor: COLORS.successSoft }]}>
            <Text style={[styles.noticeText, { color: COLORS.successText }]}>Aprobado · folio {course.myCertificate.folio}</Text>
          </View>
        ) : course.mine ? (
          <View style={[styles.notice, { backgroundColor: COLORS.primarySoft }]}>
            <Text style={[styles.noticeText, { color: COLORS.primary }]}>
              Ya estás inscrito. Las clases en video se publican en la app; te avisamos cuando estén listas.
            </Text>
          </View>
        ) : (
          <CourseEnrollPanel course={course} level={level} people={1} forMe onEnrolled={onEnrolled} />
        )
      ) : course.pending.length === 0 ? (
        <View style={[styles.notice, { backgroundColor: COLORS.successSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.successText }]}>
            {crewSize ? 'Toda tu cuadrilla ya lo tiene o está inscrita.' : 'Da de alta a tu gente en Cuadrillas para inscribirla.'}
          </Text>
        </View>
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Inscribir a tu gente</Text>
          <Text style={styles.sheetNote}>
            {course.pending.length === 1 ? 'Le falta a 1 persona.' : `Les falta a ${course.pending.length} personas.`} Toca para quitar o poner.
          </Text>
          <MultiChips options={course.pending.map(p => ({ value: p.id, label: p.name }))} values={people} onChange={setPeople} />
          {people.length > 0 ? (
            <CourseEnrollPanel course={course} level={level} people={people.length} workerIds={people} onEnrolled={onEnrolled} />
          ) : (
            <Text style={styles.sheetNote}>Elige al menos a una persona.</Text>
          )}
        </View>
      )}
    </>
  );
}

// Registrar o renovar un documento del expediente con su fecha de emisión.
function DocForm({ view, onSaved }: { view: DocView; onSaved: () => void }) {
  const today = localDateIn(deviceTimezone());
  const options = [0, 1, 2, 3, 7].map(daysAgo => {
    const d = new Date(today + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - daysAgo);
    const iso = d.toISOString().slice(0, 10);
    return { value: iso, label: daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : formatDate(iso) };
  });
  const [issuedOn, setIssuedOn] = useState(options[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.saveComplianceDoc(view.kind, view.name, issuedOn);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={styles.sheetEyebrow}>Expediente</Text>
      <Text style={styles.sheetTitle}>{view.name}</Text>
      <Text style={styles.sheetText}>{view.detail}. {view.validity}</Text>
      <Text style={styles.cardLabel}>¿Cuándo se emitió?</Text>
      <Chips options={options} value={issuedOn} onChange={setIssuedOn} />
      <View style={[styles.notice, { backgroundColor: COLORS.primarySoft }]}>
        <Text style={[styles.noticeText, { color: COLORS.primary }]}>
          Queda en revisión hasta que BuildI vea el documento. Ya revisado y vigente, suma a tu nivel.
        </Text>
      </View>
      {error && <Text style={[styles.noticeText, { color: COLORS.errorText }]}>{error}</Text>}
      <SheetButton label="Guardar" onPress={save} busy={saving} />
    </>
  );
}

// RFC y razón social: los pide la DC-3 de tu gente.
function FiscalForm({ contractor, onSaved }: { contractor: Contractor; onSaved: () => void }) {
  const [rfc, setRfc] = useState(contractor.rfc ?? '');
  const [legalName, setLegalName] = useState(contractor.legal_name ?? contractor.business_name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = rfc.trim().toUpperCase();
  const ok = RFC_PATTERN.test(value);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.updateContractor(contractor.id, { rfc: value, legal_name: legalName.trim() || null });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={styles.sheetEyebrow}>Datos fiscales</Text>
      <Text style={styles.sheetTitle}>RFC y razón social</Text>
      <Text style={styles.sheetText}>Van en la DC-3 de cada trabajador como datos del patrón.</Text>
      <LaborField label="RFC" value={rfc} onChangeText={setRfc} placeholder="12 o 13 caracteres" autoCapitalize="characters" hint={value && !ok ? 'Revisa el RFC: letras, 6 dígitos de fecha y 3 de homoclave.' : undefined} />
      <LaborField label="Razón social o nombre" value={legalName} onChangeText={setLegalName} placeholder="Como aparece en tu constancia del SAT" />
      {error && <Text style={[styles.noticeText, { color: COLORS.errorText }]}>{error}</Text>}
      <SheetButton label="Guardar" onPress={save} busy={saving} disabled={!ok} />
    </>
  );
}

const cardShadow = {
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

const lightShadow = {
  elevation: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: COLORS.card },
  profileImageContainer: { position: 'relative', marginBottom: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  editImageButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.card },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  title: { fontSize: 16, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  company: { fontSize: 14, color: COLORS.muted },
  statsContainer: { flexDirection: 'row', backgroundColor: COLORS.card, paddingVertical: 20, justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: COLORS.divider },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.muted },
  section: { padding: 20, paddingBottom: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  sectionNote: { fontSize: 12, color: COLORS.muted, marginLeft: 8 },
  infoCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, ...cardShadow },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, color: COLORS.body, marginLeft: 12, flex: 1 },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  levelEyebrow: { fontSize: 13, color: COLORS.muted },
  levelName: { fontSize: 24, fontWeight: 'bold' },
  scoreBubble: { alignItems: 'center', backgroundColor: COLORS.primarySoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  scoreValue: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold' },
  scoreMax: { color: COLORS.muted, fontSize: 11 },
  levelBarWrap: { height: 36, marginTop: 16 },
  levelMark: { position: 'absolute', top: 0, alignItems: 'center', marginLeft: -16, width: 32 },
  levelTick: { width: 2, height: 14, backgroundColor: '#9CA3AF' },
  levelMarkText: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  levelHint: { color: COLORS.body, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: '600', fontSize: 14, marginTop: 8 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  achievementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 8, ...lightShadow },
  achievementIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.warningSoft, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  achievementYear: { fontSize: 14, color: COLORS.muted },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.divider },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  docName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  docDetail: { fontSize: 13, color: COLORS.muted },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.primarySoft, gap: 4 },
  actionText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  outlineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, marginTop: 10 },
  outlineButtonText: { fontWeight: '600', color: COLORS.primary, fontSize: 15 },
  courseCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 8, gap: 4, ...lightShadow },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  coursePrice: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  courseTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  courseMeta: { fontSize: 13, color: COLORS.muted },
  courseRequired: { fontSize: 13, color: COLORS.warningText, fontWeight: '500' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 8, ...lightShadow },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 12, fontWeight: '500' },
  factor: { paddingVertical: 10, gap: 6 },
  factorTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  factorLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500', flex: 1 },
  factorValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  factorPoints: { fontSize: 12, color: COLORS.muted },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  levelDot: { width: 14, height: 14, borderRadius: 7 },
  levelRowName: { fontSize: 15, fontWeight: '600', color: COLORS.text, width: 64 },
  levelRowMin: { fontSize: 14, color: COLORS.muted, flex: 1, textAlign: 'right' },
  sheetEyebrow: { fontSize: 13, color: COLORS.muted },
  sheetTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  sheetText: { fontSize: 15, color: COLORS.body },
  sheetNote: { fontSize: 13, color: COLORS.muted },
  cardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 5 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primarySoft, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: COLORS.primary, fontWeight: '600', fontSize: 12 },
  stepText: { flex: 1, fontSize: 14, color: COLORS.body },
  notice: { borderRadius: 12, padding: 14 },
  noticeText: { fontSize: 14 },
  primaryButton: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
