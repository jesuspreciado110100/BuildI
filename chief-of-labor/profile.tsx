import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Perfil del contratista de mano de obra: nivel BuildI Pro calculado con su
// desempeño, beneficios que se desbloquean por nivel, expediente de
// cumplimiento (REPSE, IMSS, Infonavit, SAT) y cursos con su tipo de
// constancia. Todos los montos, comisiones y personas son de ejemplo.

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type LevelKey = 'bronce' | 'plata' | 'oro';
type DocStatus = 'vigente' | 'por_vencer' | 'vencido';
type Credential = 'buildi' | 'dc3' | 'conocer';

interface Level {
  key: LevelKey;
  name: string;
  min: number;
  color: string;
}

interface ProMetrics {
  onTimeRate: number;
  adjustedShare: number;
  builderRating: number;
  monthsOnBuildI: number;
}

interface ComplianceDoc {
  id: string;
  name: string;
  detail: string;
  status: DocStatus;
  expires: string;
}

interface Benefit {
  id: string;
  title: string;
  summary: string;
  icon: IconName;
  minLevel: LevelKey;
  byLevel?: Record<LevelKey, string>;
  partner?: string;
  how: string[];
}

interface Course {
  id: string;
  title: string;
  credential: Credential;
  audience: 'cuadrilla' | 'tu';
  hours: string;
  modality: string;
  price: number;
  discountByLevel: Record<LevelKey, number>;
  certified: number;
  enrolled: number;
  requiredFor?: string;
  progress?: number;
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

const CREW_SIZE = 24;

const METRICS: ProMetrics = {
  onTimeRate: 0.92,
  adjustedShare: 0.018,
  builderRating: 4.7,
  monthsOnBuildI: 14,
};

const INITIAL_DOCS: ComplianceDoc[] = [
  { id: 'repse', name: 'Registro REPSE', detail: 'STPS · obras especializadas', status: 'vigente', expires: 'Vence mar 2028' },
  { id: 'imss', name: 'Opinión de cumplimiento IMSS', detail: 'La constructora la pide cada mes', status: 'vencido', expires: 'Venció el 30 sep' },
  { id: 'infonavit', name: 'Opinión de cumplimiento Infonavit', detail: 'La constructora la pide cada mes', status: 'vigente', expires: 'Vence 31 oct' },
  { id: 'sat', name: 'Opinión de cumplimiento SAT (32-D)', detail: 'Positiva', status: 'por_vencer', expires: 'Vence 12 oct' },
  { id: 'contrato', name: 'Contrato de destajo · Torre Alameda', detail: 'Firmado por ambas partes', status: 'vigente', expires: 'Hasta fin de obra' },
];

const BENEFITS: Benefit[] = [
  {
    id: 'cobro',
    title: 'Cobro en 48 h',
    summary: 'Cobra la estimación firmada sin esperar a la constructora.',
    icon: 'flash',
    minLevel: 'bronce',
    byLevel: { bronce: 'Comisión 2.5%', plata: 'Comisión 1.8%', oro: 'Comisión 1.2%' },
    partner: 'Con un aliado financiero',
    how: [
      'El residente firma la estimación en la app.',
      'El dinero de la constructora ya está en resguardo en BuildI.',
      'Te lo adelantamos en 48 h y descontamos la comisión de tu nivel.',
    ],
  },
  {
    id: 'herramienta',
    title: 'Descuento en herramienta y equipo de protección',
    summary: 'Precio de volumen con proveedores BuildI.',
    icon: 'construct',
    minLevel: 'bronce',
    byLevel: { bronce: '5% de descuento', plata: '8% de descuento', oro: '12% de descuento' },
    partner: 'Proveedores BuildI',
    how: ['Compra desde la app o en sucursal mostrando tu gafete BuildI.', 'Te llega a la obra o al taller.'],
  },
  {
    id: 'cursos',
    title: 'Cursos BuildI gratis',
    summary: 'Seguridad, cotizar a destajo y finanzas de tu cuadrilla.',
    icon: 'school',
    minLevel: 'bronce',
    how: ['Clases cortas en video que se descargan para verlas sin internet.', 'Al aprobar, la constancia queda en el gafete de cada persona.'],
  },
  {
    id: 'seguro',
    title: 'Seguro de accidentes para tu cuadrilla',
    summary: 'Cubre a tu gente mientras está en obra.',
    icon: 'medkit',
    minLevel: 'plata',
    byLevel: { bronce: 'Con costo por persona', plata: 'Incluido hasta 15 personas', oro: 'Incluido para toda tu gente' },
    partner: 'Con una aseguradora aliada',
    how: ['Se activa con el pase de lista de cada día.', 'Si hay un accidente, lo reportas desde la app con foto.'],
  },
  {
    id: 'adelanto',
    title: 'Adelanto de raya para tu gente',
    summary: 'Tus trabajadores cobran parte de lo ya trabajado antes del sábado, sin que tú pongas el dinero.',
    icon: 'cash',
    minLevel: 'plata',
    partner: 'Con un aliado financiero',
    how: ['Solo sobre días ya trabajados y registrados.', 'Se descuenta solo de la raya del sábado.'],
  },
  {
    id: 'destacado',
    title: 'Perfil destacado',
    summary: 'Apareces primero cuando una constructora busca mano de obra.',
    icon: 'star',
    minLevel: 'plata',
    how: ['Tu ficha muestra tus números verificados: entregas, ajustes y calificación.'],
  },
  {
    id: 'raya',
    title: 'Raya garantizada',
    summary: 'Con la estimación firmada, la raya del sábado sale aunque la constructora no haya pagado.',
    icon: 'shield-checkmark',
    minLevel: 'oro',
    partner: 'Con un aliado financiero',
    how: ['Aplica a estimaciones firmadas por el residente.', 'BuildI cobra después a la constructora.'],
  },
  {
    id: 'credito',
    title: 'Crédito para equipo',
    summary: 'Revolvedora, andamios o herramienta, pagando con tus estimaciones.',
    icon: 'card',
    minLevel: 'oro',
    byLevel: { bronce: 'No disponible', plata: 'No disponible', oro: 'Hasta $150,000' },
    partner: 'Con un aliado financiero',
    how: ['Se aprueba con tu historial en BuildI, sin buró.', 'Se paga con un porcentaje de cada estimación.'],
  },
  {
    id: 'prioridad',
    title: 'Prioridad en obras grandes',
    summary: 'Te avisamos primero de las obras que necesitan tu especialidad.',
    icon: 'trophy',
    minLevel: 'oro',
    how: ['Cuando un frente tuyo va al 80%, te mostramos las siguientes obras cerca.'],
  },
];

const CREDENTIALS: Record<Credential, { label: string; color: string; bg: string; issuer: string; steps: string[] }> = {
  buildi: {
    label: 'Constancia BuildI',
    color: COLORS.primary,
    bg: COLORS.primarySoft,
    issuer: 'La emite BuildI. No es oficial, pero cuenta para tu nivel y se verifica con el QR del gafete.',
    steps: [
      'Clases en video de 3 a 5 minutos, con audio y sin internet.',
      'Examen corto con imágenes en la app.',
      'Prueba práctica en obra, validada por el residente con foto.',
      'La constancia aparece en el gafete y en tu expediente.',
    ],
  },
  dc3: {
    label: 'DC-3 · STPS',
    color: COLORS.warningText,
    bg: COLORS.warningSoft,
    issuer: 'La emite un agente capacitador registrado ante la STPS, aliado de BuildI.',
    steps: [
      'Te inscribes y eliges fecha y sede.',
      'Curso presencial con el instructor del agente capacitador.',
      'Asistencia con pase de lista e identificación.',
      'El agente capacitador emite la DC-3 y se guarda en tu expediente.',
    ],
  },
  conocer: {
    label: 'Certificado CONOCER',
    color: COLORS.successText,
    bg: COLORS.successSoft,
    issuer: 'Lo emite CONOCER después de una evaluación con un evaluador acreditado.',
    steps: [
      'Curso de preparación en la app.',
      'Evaluación práctica en obra con un evaluador acreditado.',
      'Si aprueba, se tramita el certificado oficial.',
      'Queda en el gafete y sube el precio de la cuadrilla.',
    ],
  },
};

const INITIAL_COURSES: Course[] = [
  { id: 'seguridad', title: 'Seguridad básica en obra', credential: 'buildi', audience: 'cuadrilla', hours: '2 h', modality: 'En la app · sin internet', price: 0, discountByLevel: { bronce: 1, plata: 1, oro: 1 }, certified: 18, enrolled: 0 },
  { id: 'alturas', title: 'Trabajo en alturas (NOM-009)', credential: 'dc3', audience: 'cuadrilla', hours: '8 h', modality: 'Presencial · sábado', price: 950, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 9, enrolled: 0, requiredFor: 'Recomendado para trabajar a más de 1.8 m' },
  { id: 'construccion', title: 'Seguridad en obras de construcción (NOM-031)', credential: 'dc3', audience: 'cuadrilla', hours: '8 h', modality: 'Presencial · sábado', price: 900, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 6, enrolled: 0 },
  { id: 'epp', title: 'Uso de equipo de protección (NOM-017)', credential: 'dc3', audience: 'cuadrilla', hours: '4 h', modality: 'Presencial en obra', price: 600, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 14, enrolled: 0 },
  { id: 'albanil', title: 'Certificación de albañil', credential: 'conocer', audience: 'cuadrilla', hours: 'Evaluación en obra', modality: 'Con evaluador acreditado', price: 2800, discountByLevel: { bronce: 0, plata: 0.25, oro: 0.5 }, certified: 2, enrolled: 0 },
  { id: 'cotizar', title: 'Cómo cotizar a destajo', credential: 'buildi', audience: 'tu', hours: '3 h', modality: 'En la app', price: 0, discountByLevel: { bronce: 1, plata: 1, oro: 1 }, certified: 0, enrolled: 1, progress: 0.6 },
  { id: 'finanzas', title: 'Finanzas de tu cuadrilla: raya, IMSS e impuestos', credential: 'buildi', audience: 'tu', hours: '3 h', modality: 'En la app', price: 0, discountByLevel: { bronce: 1, plata: 1, oro: 1 }, certified: 0, enrolled: 0, progress: 0 },
];

const MENU_ITEMS: { title: string; icon: IconName; color: string }[] = [
  { title: 'Datos de la cuenta', icon: 'settings-outline', color: '#6B7280' },
  { title: 'Notificaciones', icon: 'notifications-outline', color: '#6B7280' },
  { title: 'Protocolos de seguridad', icon: 'shield-outline', color: '#10B981' },
  { title: 'Reportes de la cuadrilla', icon: 'document-text-outline', color: '#3B82F6' },
  { title: 'Ayuda', icon: 'help-circle-outline', color: '#6B7280' },
  { title: 'Cerrar sesión', icon: 'log-out-outline', color: '#EF4444' },
];

const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const levelIndex = (key: LevelKey) => LEVELS.findIndex(l => l.key === key);

// Puntaje BuildI Pro (0–100). Cinco factores con su peso máximo.
function scoreFactors(m: ProMetrics, docs: ComplianceDoc[]) {
  const ok = docs.filter(d => d.status !== 'vencido').length;
  return [
    { label: 'Entregas a tiempo', value: `${Math.round(m.onTimeRate * 100)}%`, points: 30 * clamp01(m.onTimeRate), max: 30 },
    { label: 'Volumen ajustado por el residente', value: `${(m.adjustedShare * 100).toFixed(1)}%`, points: 20 * clamp01(1 - m.adjustedShare / 0.05), max: 20 },
    { label: 'Calificación de constructoras', value: `★ ${m.builderRating.toFixed(1)}`, points: 20 * clamp01((m.builderRating - 3) / 2), max: 20 },
    { label: 'Papeles al día', value: `${ok} de ${docs.length}`, points: 20 * (docs.length ? ok / docs.length : 0), max: 20 },
    { label: 'Antigüedad en BuildI', value: `${m.monthsOnBuildI} meses`, points: 10 * clamp01(m.monthsOnBuildI / 24), max: 10 },
  ];
}

function levelFor(score: number): Level {
  return [...LEVELS].reverse().find(l => score >= l.min) ?? LEVELS[0];
}

function coursePrice(course: Course, level: LevelKey) {
  return course.price * (1 - course.discountByLevel[level]);
}

export default function ChiefOfLaborProfile() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [showScore, setShowScore] = useState(false);

  const factors = useMemo(() => scoreFactors(METRICS, docs), [docs]);
  const score = factors.reduce((a, f) => a + f.points, 0);
  const level = levelFor(score);
  const next = LEVELS[levelIndex(level.key) + 1];
  const expired = docs.filter(d => d.status === 'vencido');

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

  const renewDoc = (id: string) => {
    setDocs(prev => prev.map(d => (d.id === id ? { ...d, status: 'vigente', expires: 'Vence 31 oct' } : d)));
  };

  const enroll = (id: string, people: number) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, enrolled: c.enrolled + people } : c)));
    setCourse(null);
  };

  const crewCourses = courses.filter(c => c.audience === 'cuadrilla');
  const myCourses = courses.filter(c => c.audience === 'tu');
  const activeBenefits = BENEFITS.filter(b => levelIndex(b.minLevel) <= levelIndex(level.key)).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Ramiro Pérez</Text>
          <Text style={styles.title}>Contratista de mano de obra</Text>
          <Text style={styles.company}>Mano de Obra Pérez · Guadalajara</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Cuadrillas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{CREW_SIZE}</Text>
            <Text style={styles.statLabel}>Trabajadores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
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
                <Text style={styles.scoreValue}>{Math.round(score)}</Text>
                <Text style={styles.scoreMax}>de 100</Text>
              </View>
            </View>
            <LevelBar score={score} />
            {next ? (
              <Text style={styles.levelHint}>
                Te faltan {Math.max(0, next.min - score).toFixed(1)} puntos para {next.name}.
                {expired.length ? ` Renueva "${expired[0].name}" y sumas ${(20 / docs.length).toFixed(0)} puntos.` : ''}
              </Text>
            ) : (
              <Text style={styles.levelHint}>Estás en el nivel más alto. Mantén tus papeles al día para conservarlo.</Text>
            )}
            <Text style={styles.link}>Ver cómo se calcula</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Tus beneficios" note={`${activeBenefits} de ${BENEFITS.length} activos`} />
          {BENEFITS.map(b => {
            const unlocked = levelIndex(b.minLevel) <= levelIndex(level.key);
            const minName = LEVELS[levelIndex(b.minLevel)].name;
            return (
              <TouchableOpacity key={b.id} style={styles.achievementCard} onPress={() => setBenefit(b)} activeOpacity={0.8}>
                <View style={[styles.achievementIcon, !unlocked && { backgroundColor: COLORS.divider }]}>
                  <Ionicons name={unlocked ? b.icon : 'lock-closed'} size={22} color={unlocked ? COLORS.warning : '#9CA3AF'} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, !unlocked && { color: COLORS.muted }]}>{b.title}</Text>
                  <Text style={styles.achievementYear} numberOfLines={2}>
                    {unlocked ? b.byLevel?.[level.key] ?? b.summary : `Se desbloquea en ${minName}`}
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
            {docs.map((d, i) => (
              <View key={d.id} style={[styles.docRow, i > 0 && styles.rowBorder]}>
                <Ionicons
                  name={d.status === 'vigente' ? 'checkmark-circle' : d.status === 'por_vencer' ? 'time' : 'alert-circle'}
                  size={22}
                  color={d.status === 'vigente' ? COLORS.success : d.status === 'por_vencer' ? COLORS.warning : COLORS.error}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docDetail}>{d.detail} · {d.expires}</Text>
                </View>
                {d.status !== 'vigente' && (
                  <TouchableOpacity
                    style={[styles.actionButton, d.status === 'vencido' && { backgroundColor: COLORS.errorSoft }]}
                    onPress={() => renewDoc(d.id)}
                  >
                    <Text style={[styles.actionText, d.status === 'vencido' && { color: COLORS.errorText }]}>
                      {d.status === 'vencido' ? 'Renovar' : 'Actualizar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => Alert.alert('Expediente compartido', 'La constructora recibe un enlace con tus documentos vigentes.')}
            >
              <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Compartir expediente</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Cursos para tu cuadrilla" note={`${CREW_SIZE} personas`} />
          {crewCourses.map(c => (
            <CourseRow key={c.id} course={c} level={level.key} onPress={() => setCourse(c)} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Cursos para ti" note="negocio" />
          {myCourses.map(c => (
            <CourseRow key={c.id} course={c} level={level.key} onPress={() => setCourse(c)} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información profesional</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="briefcase" text="Experiencia: 12 años" />
            <InfoRow icon="ribbon" text="REPSE vigente · obras especializadas" />
            <InfoRow icon="mail" text="ramiro.perez@ejemplo.com" />
            <InfoRow icon="call" text="+52 33 0000 0000" last />
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

      <Sheet visible={showScore} onClose={() => setShowScore(false)}>
        <Text style={styles.sheetEyebrow}>BuildI Pro</Text>
        <Text style={styles.sheetTitle}>Cómo se calcula tu nivel</Text>
        <View style={styles.infoCard}>
          {factors.map((f, i) => (
            <View key={f.label} style={[styles.factor, i > 0 && styles.rowBorder]}>
              <View style={styles.factorTop}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={styles.factorValue}>{f.value}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(f.points / f.max) * 100}%` as const }]} />
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
        <Text style={styles.sheetNote}>El nivel se recalcula cada semana con tus estimaciones firmadas, las calificaciones de las constructoras y tu expediente.</Text>
      </Sheet>

      <Sheet visible={!!benefit} onClose={() => setBenefit(null)}>
        {benefit && <BenefitDetail benefit={benefit} level={level} />}
      </Sheet>

      <Sheet visible={!!course} onClose={() => setCourse(null)}>
        {course && <CourseDetail course={course} level={level.key} onEnroll={enroll} />}
      </Sheet>
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

function CourseRow({ course, level, onPress }: { course: Course; level: LevelKey; onPress: () => void }) {
  const cred = CREDENTIALS[course.credential];
  const price = coursePrice(course, level);
  const mine = course.audience === 'tu';
  const pct = mine ? course.progress ?? 0 : course.certified / CREW_SIZE;
  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.courseTop}>
        <View style={[styles.badge, { backgroundColor: cred.bg }]}>
          <Text style={[styles.badgeText, { color: cred.color }]}>{cred.label}</Text>
        </View>
        <Text style={styles.coursePrice}>{price === 0 ? 'Gratis' : money(price)}</Text>
      </View>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.courseMeta}>{course.hours} · {course.modality}</Text>
      {course.requiredFor && <Text style={styles.courseRequired}>{course.requiredFor}</Text>}
      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { flex: 1 }]}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` as const }]} />
        </View>
        <Text style={styles.courseMeta}>
          {mine
            ? `${Math.round(pct * 100)}%`
            : `${course.certified} de ${CREW_SIZE}${course.enrolled ? ` · ${course.enrolled} inscritos` : ''}`}
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

function BenefitDetail({ benefit, level }: { benefit: Benefit; level: Level }) {
  const unlocked = levelIndex(benefit.minLevel) <= levelIndex(level.key);
  return (
    <>
      <Text style={styles.sheetEyebrow}>
        {unlocked ? `Activo en tu nivel ${level.name}` : `Se desbloquea en ${LEVELS[levelIndex(benefit.minLevel)].name}`}
      </Text>
      <Text style={styles.sheetTitle}>{benefit.title}</Text>
      <Text style={styles.sheetText}>{benefit.summary}</Text>
      {benefit.byLevel && (
        <View style={styles.infoCard}>
          {LEVELS.map((l, i) => (
            <View key={l.key} style={[styles.levelRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.levelDot, { backgroundColor: l.color }]} />
              <Text style={[styles.levelRowName, l.key === level.key && { color: COLORS.primary }]}>{l.name}</Text>
              <Text style={[styles.levelRowMin, l.key === level.key && { color: COLORS.text, fontWeight: '600' }]}>
                {benefit.byLevel?.[l.key]}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>Cómo funciona</Text>
        <Steps steps={benefit.how} />
      </View>
      {benefit.partner && <Text style={styles.sheetNote}>{benefit.partner}. BuildI lo ofrece; el aliado lo otorga.</Text>}
      {unlocked ? (
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert(benefit.title, 'Listo. Te avisamos por WhatsApp cuando esté aplicado.')}>
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

function CourseDetail({ course, level, onEnroll }: { course: Course; level: LevelKey; onEnroll: (id: string, people: number) => void }) {
  const cred = CREDENTIALS[course.credential];
  const missing = Math.max(0, CREW_SIZE - course.certified - course.enrolled);
  const mine = course.audience === 'tu';
  const [people, setPeople] = useState(Math.min(missing, 6) || 1);
  const unit = coursePrice(course, level);
  const discount = course.discountByLevel[level];

  return (
    <>
      <View style={[styles.badge, { backgroundColor: cred.bg, alignSelf: 'flex-start' }]}>
        <Text style={[styles.badgeText, { color: cred.color }]}>{cred.label}</Text>
      </View>
      <Text style={styles.sheetTitle}>{course.title}</Text>
      <Text style={styles.sheetText}>{course.hours} · {course.modality}</Text>
      {course.requiredFor && (
        <View style={[styles.notice, { backgroundColor: COLORS.warningSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.warningText }]}>
            {course.requiredFor}. Si alguien no la tiene, la app te lo recomienda antes de mandarlo a un frente en altura; tú decides.
          </Text>
        </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>Cómo se certifica</Text>
        <Steps steps={cred.steps} />
        <Text style={styles.sheetNote}>{cred.issuer}</Text>
      </View>

      {mine ? (
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert(course.title, 'Abriría la siguiente clase.')}>
          <Text style={styles.primaryButtonText}>{course.progress ? 'Continuar' : 'Empezar'}</Text>
        </TouchableOpacity>
      ) : missing === 0 ? (
        <View style={[styles.notice, { backgroundColor: COLORS.successSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.successText }]}>Toda tu cuadrilla ya lo tiene o está inscrita.</Text>
        </View>
      ) : (
        <>
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>Inscribir a tu gente</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(Math.max(1, people - 1))} accessibilityLabel="Menos personas">
                <Ionicons name="remove" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{people} {people === 1 ? 'persona' : 'personas'}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(Math.min(missing, people + 1))} accessibilityLabel="Más personas">
                <Ionicons name="add" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetNote}>Faltan {missing} de tu cuadrilla.</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio por persona</Text>
              <Text style={styles.priceValue}>
                {unit === 0 ? 'Gratis' : money(unit)}
                {discount > 0 && discount < 1 ? `  (−${Math.round(discount * 100)}% por tu nivel)` : ''}
              </Text>
            </View>
            <View style={[styles.priceRow, styles.rowBorder]}>
              <Text style={[styles.priceLabel, { fontWeight: '600', color: COLORS.text }]}>Total</Text>
              <Text style={[styles.priceValue, { fontSize: 18 }]}>{unit * people === 0 ? 'Gratis' : money(unit * people)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              onEnroll(course.id, people);
              Alert.alert('Inscritos', `${people} ${people === 1 ? 'persona' : 'personas'} en "${course.title}". Les llega la fecha por WhatsApp.`);
            }}
          >
            <Text style={styles.primaryButtonText}>Inscribir</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <ScrollView contentContainerStyle={styles.sheetContent}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
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
  infoText: { fontSize: 16, color: COLORS.body, marginLeft: 12 },
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
  factorTop: { flexDirection: 'row', justifyContent: 'space-between' },
  factorLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500', flex: 1 },
  factorValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  factorPoints: { fontSize: 12, color: COLORS.muted },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  levelDot: { width: 14, height: 14, borderRadius: 7 },
  levelRowName: { fontSize: 15, fontWeight: '600', color: COLORS.text, width: 64 },
  levelRowMin: { fontSize: 14, color: COLORS.muted, flex: 1, textAlign: 'right' },
  scrim: { flex: 1, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 8 },
  sheetContent: { padding: 20, paddingBottom: 40, gap: 12 },
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
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginTop: 4 },
  priceLabel: { fontSize: 14, color: COLORS.muted },
  priceValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  primaryButton: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
