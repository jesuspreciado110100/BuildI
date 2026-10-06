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
  ink: '#1C2124',
  ink2: '#5D666E',
  concrete: '#E9EBEA',
  card: '#FFFFFF',
  line: '#E2E5E4',
  orange: '#FF5F0F',
  orangeSoft: '#FFE6D9',
  hivis: '#D8F526',
  green: '#1F8A4C',
  greenSoft: '#DCF1E3',
  red: '#D23A1F',
  redSoft: '#FBE1DB',
  amber: '#E8A100',
  amberSoft: '#FCEFCF',
  blue: '#2D6FD6',
  blueSoft: '#DFE9F8',
};

const LEVELS: Level[] = [
  { key: 'bronce', name: 'Bronce', min: 0, color: '#A8521C' },
  { key: 'plata', name: 'Plata', min: 60, color: '#AEB7BF' },
  { key: 'oro', name: 'Oro', min: 80, color: '#C9A24A' },
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
    icon: 'flash-outline',
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
    icon: 'construct-outline',
    minLevel: 'bronce',
    byLevel: { bronce: '5% de descuento', plata: '8% de descuento', oro: '12% de descuento' },
    partner: 'Proveedores BuildI',
    how: ['Compra desde la app o en sucursal mostrando tu gafete BuildI.', 'Te llega a la obra o al taller.'],
  },
  {
    id: 'cursos',
    title: 'Cursos BuildI gratis',
    summary: 'Seguridad, cotizar a destajo y finanzas de tu cuadrilla.',
    icon: 'school-outline',
    minLevel: 'bronce',
    how: ['Clases cortas en video que se descargan para verlas sin internet.', 'Al aprobar, la constancia queda en el gafete de cada persona.'],
  },
  {
    id: 'seguro',
    title: 'Seguro de accidentes para tu cuadrilla',
    summary: 'Cubre a tu gente mientras está en obra.',
    icon: 'medkit-outline',
    minLevel: 'plata',
    byLevel: { bronce: 'Con costo por persona', plata: 'Incluido hasta 15 personas', oro: 'Incluido para toda tu gente' },
    partner: 'Con una aseguradora aliada',
    how: ['Se activa con el pase de lista de cada día.', 'Si hay un accidente, lo reportas desde la app con foto.'],
  },
  {
    id: 'adelanto',
    title: 'Adelanto de raya para tu gente',
    summary: 'Tus trabajadores cobran parte de lo ya trabajado antes del sábado, sin que tú pongas el dinero.',
    icon: 'cash-outline',
    minLevel: 'plata',
    partner: 'Con un aliado financiero',
    how: ['Solo sobre días ya trabajados y registrados.', 'Se descuenta solo de la raya del sábado.'],
  },
  {
    id: 'destacado',
    title: 'Perfil destacado',
    summary: 'Apareces primero cuando una constructora busca mano de obra.',
    icon: 'star-outline',
    minLevel: 'plata',
    how: ['Tu ficha muestra tus números verificados: entregas, ajustes y calificación.'],
  },
  {
    id: 'raya',
    title: 'Raya garantizada',
    summary: 'Con la estimación firmada, la raya del sábado sale aunque la constructora no haya pagado.',
    icon: 'shield-checkmark-outline',
    minLevel: 'oro',
    partner: 'Con un aliado financiero',
    how: ['Aplica a estimaciones firmadas por el residente.', 'BuildI cobra después a la constructora.'],
  },
  {
    id: 'credito',
    title: 'Crédito para equipo',
    summary: 'Revolvedora, andamios o herramienta, pagando con tus estimaciones.',
    icon: 'card-outline',
    minLevel: 'oro',
    byLevel: { bronce: 'No disponible', plata: 'No disponible', oro: 'Hasta $150,000' },
    partner: 'Con un aliado financiero',
    how: ['Se aprueba con tu historial en BuildI, sin buró.', 'Se paga con un porcentaje de cada estimación.'],
  },
  {
    id: 'prioridad',
    title: 'Prioridad en obras grandes',
    summary: 'Te avisamos primero de las obras que necesitan tu especialidad.',
    icon: 'trophy-outline',
    minLevel: 'oro',
    how: ['Cuando un frente tuyo va al 80%, te mostramos las siguientes obras cerca.'],
  },
];

const CREDENTIALS: Record<Credential, { label: string; color: string; soft: string; issuer: string; steps: string[] }> = {
  buildi: {
    label: 'Constancia BuildI',
    color: COLORS.ink,
    soft: COLORS.hivis,
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
    color: COLORS.blue,
    soft: COLORS.blueSoft,
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
    color: COLORS.green,
    soft: COLORS.greenSoft,
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
  { id: 'alturas', title: 'Trabajo en alturas (NOM-009)', credential: 'dc3', audience: 'cuadrilla', hours: '8 h', modality: 'Presencial · sábado', price: 950, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 9, enrolled: 0, requiredFor: 'Obligatorio para trabajar a más de 1.8 m' },
  { id: 'construccion', title: 'Seguridad en obras de construcción (NOM-031)', credential: 'dc3', audience: 'cuadrilla', hours: '8 h', modality: 'Presencial · sábado', price: 900, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 6, enrolled: 0 },
  { id: 'epp', title: 'Uso de equipo de protección (NOM-017)', credential: 'dc3', audience: 'cuadrilla', hours: '4 h', modality: 'Presencial en obra', price: 600, discountByLevel: { bronce: 0, plata: 0.5, oro: 1 }, certified: 14, enrolled: 0 },
  { id: 'albanil', title: 'Certificación de albañil', credential: 'conocer', audience: 'cuadrilla', hours: 'Evaluación en obra', modality: 'Con evaluador acreditado', price: 2800, discountByLevel: { bronce: 0, plata: 0.25, oro: 0.5 }, certified: 2, enrolled: 0 },
  { id: 'cotizar', title: 'Cómo cotizar a destajo', credential: 'buildi', audience: 'tu', hours: '3 h', modality: 'En la app', price: 0, discountByLevel: { bronce: 1, plata: 1, oro: 1 }, certified: 0, enrolled: 1, progress: 0.6 },
  { id: 'finanzas', title: 'Finanzas de tu cuadrilla: raya, IMSS e impuestos', credential: 'buildi', audience: 'tu', hours: '3 h', modality: 'En la app', price: 0, discountByLevel: { bronce: 1, plata: 1, oro: 1 }, certified: 0, enrolled: 0, progress: 0 },
];

const SETTINGS: { title: string; icon: IconName; color: string }[] = [
  { title: 'Datos de la cuenta', icon: 'settings-outline', color: COLORS.ink2 },
  { title: 'Notificaciones', icon: 'notifications-outline', color: COLORS.ink2 },
  { title: 'Invitar a otro contratista', icon: 'gift-outline', color: COLORS.orange },
  { title: 'Ayuda', icon: 'help-circle-outline', color: COLORS.ink2 },
  { title: 'Cerrar sesión', icon: 'log-out-outline', color: COLORS.red },
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RP</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Ramiro Pérez</Text>
            <Text style={styles.role}>Contratista de mano de obra</Text>
            <Text style={styles.company}>Mano de Obra Pérez · Guadalajara</Text>
          </View>
        </View>

        <View style={styles.kpis}>
          <Kpi label="CUADRILLAS" value="3" />
          <Kpi label="PERSONAS" value={String(CREW_SIZE)} />
          <Kpi label="OBRAS ACTIVAS" value="2" />
        </View>

        <TouchableOpacity style={[styles.levelCard, { borderColor: level.color }]} onPress={() => setShowScore(true)} activeOpacity={0.85}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelEyebrow}>BUILDI PRO</Text>
              <Animated.Text style={[styles.levelName, { color: level.color, transform: [{ scale: pop }] }]}>
                Nivel {level.name}
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
          <Text style={styles.link}>Ver cómo se calcula ›</Text>
        </TouchableOpacity>

        <Section title="Tus beneficios" note={`${BENEFITS.filter(b => levelIndex(b.minLevel) <= levelIndex(level.key)).length} de ${BENEFITS.length} activos`} />
        {BENEFITS.map(b => {
          const unlocked = levelIndex(b.minLevel) <= levelIndex(level.key);
          const minName = LEVELS[levelIndex(b.minLevel)].name;
          return (
            <TouchableOpacity key={b.id} style={[styles.benefit, !unlocked && styles.benefitLocked]} onPress={() => setBenefit(b)} activeOpacity={0.8}>
              <View style={[styles.benefitIcon, { backgroundColor: unlocked ? COLORS.hivis : COLORS.line }]}>
                <Ionicons name={unlocked ? b.icon : 'lock-closed'} size={20} color={COLORS.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitSummary} numberOfLines={2}>
                  {unlocked ? b.byLevel?.[level.key] ?? b.summary : `Se desbloquea en ${minName}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#B9C0C5" />
            </TouchableOpacity>
          );
        })}

        <Section title="Expediente de cumplimiento" note="lo ven las constructoras" />
        <View style={styles.card}>
          {docs.map((d, i) => (
            <View key={d.id} style={[styles.docRow, i > 0 && styles.rowBorder]}>
              <Ionicons
                name={d.status === 'vigente' ? 'checkmark-circle' : d.status === 'por_vencer' ? 'time-outline' : 'alert-circle'}
                size={22}
                color={d.status === 'vigente' ? COLORS.green : d.status === 'por_vencer' ? COLORS.amber : COLORS.red}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{d.name}</Text>
                <Text style={styles.docDetail}>{d.detail} · {d.expires}</Text>
              </View>
              {d.status !== 'vigente' && (
                <TouchableOpacity style={[styles.smallBtn, d.status === 'vencido' && { backgroundColor: COLORS.red }]} onPress={() => renewDoc(d.id)}>
                  <Text style={styles.smallBtnText}>{d.status === 'vencido' ? 'Renovar' : 'Actualizar'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => Alert.alert('Expediente compartido', 'La constructora recibe un enlace con tus documentos vigentes.')}
          >
            <Ionicons name="share-social-outline" size={18} color={COLORS.ink} />
            <Text style={styles.ghostBtnText}>Compartir expediente</Text>
          </TouchableOpacity>
        </View>

        <Section title="Cursos para tu cuadrilla" note={`${CREW_SIZE} personas`} />
        {crewCourses.map(c => (
          <CourseRow key={c.id} course={c} level={level.key} onPress={() => setCourse(c)} />
        ))}

        <Section title="Cursos para ti" note="negocio" />
        {myCourses.map(c => (
          <CourseRow key={c.id} course={c} level={level.key} onPress={() => setCourse(c)} />
        ))}

        <Section title="Ajustes" />
        <View style={styles.card}>
          {SETTINGS.map((item, i) => (
            <TouchableOpacity key={item.title} style={[styles.menuItem, i > 0 && styles.rowBorder]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
              <Text style={[styles.menuText, { color: item.color }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#B9C0C5" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Sheet visible={showScore} onClose={() => setShowScore(false)}>
        <Text style={styles.sheetEyebrow}>BuildI Pro</Text>
        <Text style={styles.sheetTitle}>Cómo se calcula tu nivel</Text>
        <View style={styles.card}>
          {factors.map((f, i) => (
            <View key={f.label} style={[styles.factor, i > 0 && styles.rowBorder]}>
              <View style={styles.factorTop}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={styles.factorValue}>{f.value}</Text>
              </View>
              <View style={styles.factorBar}>
                <View style={[styles.factorFill, { width: `${(f.points / f.max) * 100}%` as const }]} />
              </View>
              <Text style={styles.factorPoints}>{f.points.toFixed(1)} de {f.max} puntos</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          {LEVELS.map(l => (
            <View key={l.key} style={styles.levelRow}>
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

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function Section({ title, note }: { title: string; note?: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
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
      <View style={styles.levelBar}>
        <Animated.View
          style={[styles.levelFill, { width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}
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
  return (
    <TouchableOpacity style={styles.course} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.courseTop}>
        <View style={[styles.credBadge, { backgroundColor: cred.soft }]}>
          <Text style={[styles.credText, { color: cred.color }]}>{cred.label}</Text>
        </View>
        <Text style={styles.coursePrice}>{price === 0 ? 'Gratis' : money(price)}</Text>
      </View>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.courseMeta}>{course.hours} · {course.modality}</Text>
      {course.requiredFor && <Text style={styles.courseRequired}>{course.requiredFor}</Text>}
      {mine ? (
        <View style={styles.progressRow}>
          <View style={styles.factorBar}>
            <View style={[styles.factorFill, { width: `${(course.progress ?? 0) * 100}%` as const }]} />
          </View>
          <Text style={styles.courseMeta}>{Math.round((course.progress ?? 0) * 100)}%</Text>
        </View>
      ) : (
        <View style={styles.progressRow}>
          <View style={styles.factorBar}>
            <View style={[styles.factorFill, { width: `${(course.certified / CREW_SIZE) * 100}%` as const }]} />
          </View>
          <Text style={styles.courseMeta}>
            {course.certified} de {CREW_SIZE}{course.enrolled ? ` · ${course.enrolled} inscritos` : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function BenefitDetail({ benefit, level }: { benefit: Benefit; level: Level }) {
  const unlocked = levelIndex(benefit.minLevel) <= levelIndex(level.key);
  return (
    <>
      <Text style={styles.sheetEyebrow}>{unlocked ? `Activo en tu nivel ${level.name}` : `Se desbloquea en ${LEVELS[levelIndex(benefit.minLevel)].name}`}</Text>
      <Text style={styles.sheetTitle}>{benefit.title}</Text>
      <Text style={styles.sheetText}>{benefit.summary}</Text>
      {benefit.byLevel && (
        <View style={styles.card}>
          {LEVELS.map((l, i) => (
            <View key={l.key} style={[styles.levelRow, i > 0 && styles.rowBorder]}>
              <View style={[styles.levelDot, { backgroundColor: l.color }]} />
              <Text style={[styles.levelRowName, l.key === level.key && { fontWeight: '900' }]}>{l.name}</Text>
              <Text style={[styles.levelRowMin, l.key === level.key && { color: COLORS.ink, fontWeight: '700' }]}>
                {benefit.byLevel?.[l.key]}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CÓMO FUNCIONA</Text>
        {benefit.how.map((h, i) => (
          <View key={h} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={styles.stepText}>{h}</Text>
          </View>
        ))}
      </View>
      {benefit.partner && <Text style={styles.sheetNote}>{benefit.partner}. BuildI lo ofrece; el aliado lo otorga.</Text>}
      {unlocked ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert(benefit.title, 'Listo. Te avisamos por WhatsApp cuando esté aplicado.')}>
          <Text style={styles.primaryBtnText}>USAR BENEFICIO</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.notice, { backgroundColor: COLORS.orangeSoft }]}>
          <Text style={styles.noticeText}>Sube de nivel con entregas a tiempo, menos ajustes del residente y tus papeles al día.</Text>
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
      <View style={[styles.credBadge, { backgroundColor: cred.soft, alignSelf: 'flex-start' }]}>
        <Text style={[styles.credText, { color: cred.color }]}>{cred.label}</Text>
      </View>
      <Text style={styles.sheetTitle}>{course.title}</Text>
      <Text style={styles.sheetText}>{course.hours} · {course.modality}</Text>
      {course.requiredFor && (
        <View style={[styles.notice, { backgroundColor: COLORS.redSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.red }]}>{course.requiredFor}. Sin esta constancia la app no deja asignar a la persona a ese frente.</Text>
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>CÓMO SE CERTIFICA</Text>
        {cred.steps.map((s, i) => (
          <View key={s} style={styles.stepRow}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
        <Text style={styles.sheetNote}>{cred.issuer}</Text>
      </View>

      {mine ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert(course.title, 'Abriría la siguiente clase.')}>
          <Text style={styles.primaryBtnText}>{course.progress ? 'CONTINUAR' : 'EMPEZAR'}</Text>
        </TouchableOpacity>
      ) : missing === 0 ? (
        <View style={[styles.notice, { backgroundColor: COLORS.greenSoft }]}>
          <Text style={[styles.noticeText, { color: COLORS.green }]}>Toda tu cuadrilla ya lo tiene o está inscrita.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>INSCRIBIR A TU GENTE</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(Math.max(1, people - 1))} accessibilityLabel="Menos personas">
                <Ionicons name="remove" size={22} color={COLORS.ink} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{people} {people === 1 ? 'persona' : 'personas'}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeople(Math.min(missing, people + 1))} accessibilityLabel="Más personas">
                <Ionicons name="add" size={22} color={COLORS.ink} />
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
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { fontWeight: '800', color: COLORS.ink }]}>Total</Text>
              <Text style={[styles.priceValue, { fontSize: 18 }]}>{unit * people === 0 ? 'Gratis' : money(unit * people)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              onEnroll(course.id, people);
              Alert.alert('Inscritos', `${people} ${people === 1 ? 'persona' : 'personas'} en "${course.title}". Les llega la fecha por WhatsApp.`);
            }}
          >
            <Text style={styles.primaryBtnText}>INSCRIBIR</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.concrete },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 12, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.hivis, fontSize: 24, fontWeight: '900' },
  name: { fontSize: 26, fontWeight: '900', color: COLORS.ink, textTransform: 'uppercase' },
  role: { fontSize: 13, fontWeight: '700', color: COLORS.orange },
  company: { fontSize: 12.5, color: COLORS.ink2 },
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: COLORS.card, borderRadius: 6, padding: 10 },
  kpiLabel: { fontSize: 9, fontWeight: '700', color: COLORS.ink2, letterSpacing: 0.5 },
  kpiValue: { fontSize: 24, fontWeight: '900', color: COLORS.ink, marginTop: 2 },
  levelCard: { backgroundColor: COLORS.ink, borderRadius: 10, padding: 14, gap: 10, borderWidth: 2 },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelEyebrow: { color: '#AAB4BD', fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2 },
  levelName: { fontSize: 30, fontWeight: '900', textTransform: 'uppercase' },
  scoreBubble: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  scoreValue: { color: COLORS.hivis, fontSize: 28, fontWeight: '900' },
  scoreMax: { color: '#AAB4BD', fontSize: 10 },
  levelBarWrap: { height: 30, justifyContent: 'flex-start' },
  levelBar: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: COLORS.hivis },
  levelMark: { position: 'absolute', top: 0, alignItems: 'center', marginLeft: -14, width: 28 },
  levelTick: { width: 2, height: 14, backgroundColor: '#FFFFFF' },
  levelMarkText: { color: '#D5DADE', fontSize: 9.5, fontWeight: '700' },
  levelHint: { color: '#E8EDF2', fontSize: 13 },
  link: { color: COLORS.hivis, fontWeight: '700', fontSize: 12.5 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 },
  sectionTitle: { flex: 1, fontSize: 20, fontWeight: '900', color: COLORS.ink, textTransform: 'uppercase' },
  sectionNote: { fontSize: 11, color: COLORS.ink2, marginLeft: 8 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 8, padding: 12 },
  benefitLocked: { opacity: 0.6 },
  benefitIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontSize: 14.5, fontWeight: '700', color: COLORS.ink },
  benefitSummary: { fontSize: 12, color: COLORS.ink2, marginTop: 1 },
  card: { backgroundColor: COLORS.card, borderRadius: 8, padding: 12, gap: 6 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: COLORS.ink2, letterSpacing: 0.8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.line },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  docName: { fontSize: 13.5, fontWeight: '700', color: COLORS.ink },
  docDetail: { fontSize: 11.5, color: COLORS.ink2 },
  smallBtn: { backgroundColor: COLORS.ink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  smallBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 2, borderColor: COLORS.ink, borderRadius: 8, paddingVertical: 10, marginTop: 6 },
  ghostBtnText: { fontWeight: '800', color: COLORS.ink },
  course: { backgroundColor: COLORS.card, borderRadius: 8, padding: 12, gap: 4 },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  credBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  credText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  coursePrice: { fontSize: 13, fontWeight: '800', color: COLORS.ink },
  courseTitle: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginTop: 2 },
  courseMeta: { fontSize: 11.5, color: COLORS.ink2 },
  courseRequired: { fontSize: 11.5, color: COLORS.red, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  factor: { paddingVertical: 8, gap: 4 },
  factorTop: { flexDirection: 'row', justifyContent: 'space-between' },
  factorLabel: { fontSize: 13, color: COLORS.ink, fontWeight: '600', flex: 1 },
  factorValue: { fontSize: 13, color: COLORS.ink, fontWeight: '800' },
  factorBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.line, overflow: 'hidden' },
  factorFill: { height: '100%', backgroundColor: COLORS.orange },
  factorPoints: { fontSize: 11, color: COLORS.ink2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  levelDot: { width: 14, height: 14, borderRadius: 7 },
  levelRowName: { fontSize: 14, fontWeight: '700', color: COLORS.ink, width: 64 },
  levelRowMin: { fontSize: 13, color: COLORS.ink2, flex: 1, textAlign: 'right' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600' },
  scrim: { flex: 1, backgroundColor: 'rgba(17,21,24,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', backgroundColor: '#F3F4F3', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#C4C9C7', alignSelf: 'center', marginTop: 8 },
  sheetContent: { padding: 16, paddingBottom: 36, gap: 12 },
  sheetEyebrow: { fontSize: 11, color: COLORS.ink2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  sheetTitle: { fontSize: 26, fontWeight: '900', color: COLORS.ink, textTransform: 'uppercase' },
  sheetText: { fontSize: 14, color: COLORS.ink2 },
  sheetNote: { fontSize: 12, color: COLORS.ink2 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 4 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.ink, color: COLORS.hivis, textAlign: 'center', lineHeight: 22, fontWeight: '800', fontSize: 12, overflow: 'hidden' },
  stepText: { flex: 1, fontSize: 13.5, color: COLORS.ink },
  notice: { borderRadius: 8, padding: 10 },
  noticeText: { fontSize: 13, color: '#6E2A08' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 48, height: 48, borderRadius: 8, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 },
  priceLabel: { fontSize: 13, color: COLORS.ink2 },
  priceValue: { fontSize: 14, fontWeight: '800', color: COLORS.ink },
  primaryBtn: { backgroundColor: COLORS.orange, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.6 },
});
