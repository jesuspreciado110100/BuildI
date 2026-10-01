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

// Frentes a destajo: each work front is a priced concept (volume × unit price)
// the crew executes for the builder. Mirrors the WorkConcept / JobBoardPost
// shape (item_code, unit, quantity, unit_price_mxn) plus daily progress.

interface WorkFront {
  id: string;
  item_code: string;
  description: string;
  unit: string;
  quantity: number;
  done: number;
  week: number;
  unit_price_mxn: number;
  crew: string[];
  needed: number;
  rate_per_person_day: number;
  blocked?: string;
  completed?: boolean;
}

interface Site {
  id: string;
  name: string;
  builder: string;
}

interface CatalogConcept {
  description: string;
  unit: string;
  unit_price_mxn: number;
  rate_per_person_day: number;
  market_price_mxn: number;
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
};

const WORKERS: Record<string, { name: string; color: string; present: boolean }> = {
  JL: { name: 'Juan López', color: '#FF5F0F', present: true },
  MA: { name: 'Miguel Ángel', color: '#2D6FD6', present: true },
  IC: { name: 'Iván Cruz', color: '#7A4BB8', present: false },
  EG: { name: 'Esteban G.', color: '#1F8A4C', present: true },
  CV: { name: 'Carlos V.', color: '#5D666E', present: true },
  PS: { name: 'Pedro S.', color: '#D23A1F', present: true },
  JD: { name: 'Jorge D.', color: '#6B7D2A', present: true },
  LR: { name: 'Luis Ramos', color: '#E8A100', present: true },
  HT: { name: 'Hugo T.', color: '#3C4F8A', present: true },
  BM: { name: 'Beto M.', color: '#A8521C', present: true },
  TR: { name: 'Toño R.', color: '#0E7C86', present: true },
};

const SITES: Site[] = [
  { id: 'alameda', name: 'Torre Alameda', builder: 'Constructora Torres' },
  { id: 'depto6b', name: 'Depto 6B', builder: 'Constructora Torres' },
];

const INITIAL_FRONTS: Record<string, WorkFront[]> = {
  alameda: [
    { id: 'f1', item_code: 'ALB-015', description: 'Muro de block 15 cm', unit: 'm²', quantity: 420, done: 286, week: 120, unit_price_mxn: 185, crew: ['JL', 'MA', 'IC', 'EG'], needed: 4, rate_per_person_day: 9 },
    { id: 'f2', item_code: 'ALB-030', description: 'Aplanado fino en muros', unit: 'm²', quantity: 840, done: 410, week: 260, unit_price_mxn: 95, crew: ['CV', 'PS', 'JD'], needed: 3, rate_per_person_day: 16 },
    { id: 'f3', item_code: 'TAB-010', description: 'Tablaroca muro divisorio', unit: 'm²', quantity: 260, done: 150, week: 120, unit_price_mxn: 160, crew: ['LR', 'HT'], needed: 2, rate_per_person_day: 12 },
    { id: 'f4', item_code: 'PIS-060', description: 'Piso porcelanato 60×60', unit: 'm²', quantity: 380, done: 0, week: 0, unit_price_mxn: 210, crew: ['BM', 'TR'], needed: 2, rate_per_person_day: 10, blocked: 'Falta porcelanato: llega el jueves' },
    { id: 'f5', item_code: 'CIM-008', description: 'Firme de concreto 8 cm', unit: 'm²', quantity: 120, done: 120, week: 60, unit_price_mxn: 140, crew: [], needed: 0, rate_per_person_day: 20, completed: true },
  ],
  depto6b: [
    { id: 'g1', item_code: 'DEM-001', description: 'Demolición de muro de cocina', unit: 'm²', quantity: 18, done: 18, week: 18, unit_price_mxn: 120, crew: [], needed: 0, rate_per_person_day: 8, completed: true },
    { id: 'g2', item_code: 'PIN-002', description: 'Pintura vinílica 2 manos', unit: 'm²', quantity: 160, done: 40, week: 40, unit_price_mxn: 38, crew: ['JD'], needed: 1, rate_per_person_day: 45 },
  ],
};

const CATALOG: CatalogConcept[] = [
  { description: 'Muro de block 15 cm', unit: 'm²', unit_price_mxn: 185, rate_per_person_day: 9, market_price_mxn: 172 },
  { description: 'Aplanado fino', unit: 'm²', unit_price_mxn: 95, rate_per_person_day: 16, market_price_mxn: 98 },
  { description: 'Tablaroca muro', unit: 'm²', unit_price_mxn: 160, rate_per_person_day: 12, market_price_mxn: 151 },
  { description: 'Piso porcelanato', unit: 'm²', unit_price_mxn: 210, rate_per_person_day: 10, market_price_mxn: 225 },
  { description: 'Pintura vinílica 2 manos', unit: 'm²', unit_price_mxn: 38, rate_per_person_day: 45, market_price_mxn: 36 },
  { description: 'Salida eléctrica', unit: 'pza', unit_price_mxn: 350, rate_per_person_day: 6, market_price_mxn: 380 },
];

const DELAY_REASONS = ['Faltó material', 'Faltó gente', 'Lluvia', 'Cambio del residente'];
const AVG_DAILY_WAGE = 560;
const PAYROLL_TAX = 0.12;

const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const presentCount = (front: WorkFront) => front.crew.filter(id => WORKERS[id]?.present).length;

function ProgressBar({ done, week, total }: { done: number; week: number; total: number }) {
  const before = Math.max(0, done - week) / total;
  const thisWeek = Math.min(week, done) / total;
  const anim = useRef(new Animated.Value(thisWeek)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: thisWeek, duration: 450, useNativeDriver: false }).start();
  }, [thisWeek, anim]);

  return (
    <View style={styles.bar}>
      <View style={[styles.barBefore, { width: `${before * 100}%` as const }]} />
      <Animated.View
        style={[styles.barWeek, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      />
    </View>
  );
}

function Stepper({ value, onChange, step, min, max, suffix }: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  suffix: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(clamp(value - step))} accessibilityLabel="Menos">
        <Ionicons name="remove" size={22} color={COLORS.ink} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value} {suffix}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} accessibilityLabel="Más">
        <Ionicons name="add" size={22} color={COLORS.ink} />
      </TouchableOpacity>
    </View>
  );
}

export default function WorkFronts() {
  const [siteId, setSiteId] = useState(SITES[0].id);
  const [fronts, setFronts] = useState(INITIAL_FRONTS);
  const [selected, setSelected] = useState<WorkFront | null>(null);
  const [today, setToday] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const list = fronts[siteId];
  const site = SITES.find(s => s.id === siteId)!;

  const totals = useMemo(() => {
    const contract = list.reduce((a, f) => a + f.quantity * f.unit_price_mxn, 0);
    const executed = list.reduce((a, f) => a + f.done * f.unit_price_mxn, 0);
    const week = list.reduce((a, f) => a + f.week * f.unit_price_mxn, 0);
    return { contract, pct: contract ? Math.round((executed / contract) * 100) : 0, week };
  }, [list]);

  const openFront = (front: WorkFront) => {
    setSelected(front);
    setReason(null);
    setToday(front.blocked || front.completed ? 0 : Math.min(24, front.quantity - front.done));
  };

  const saveProgress = () => {
    if (!selected || today <= 0) return;
    setFronts(prev => ({
      ...prev,
      [siteId]: prev[siteId].map(f =>
        f.id === selected.id
          ? { ...f, done: Math.min(f.quantity, f.done + today), week: f.week + today, completed: f.done + today >= f.quantity }
          : f,
      ),
    }));
    setSelected(null);
  };

  const moveCrewFromBlocked = (blocked: WorkFront) => {
    const target = list.find(f => !f.blocked && !f.completed && presentCount(f) < f.needed);
    if (!target) {
      Alert.alert('Sin frentes cortos', 'Todos los frentes tienen la gente que necesitan.');
      return;
    }
    const moving = blocked.crew.filter(id => WORKERS[id]?.present).slice(0, target.needed - presentCount(target));
    setFronts(prev => ({
      ...prev,
      [siteId]: prev[siteId].map(f => {
        if (f.id === blocked.id) return { ...f, crew: f.crew.filter(id => !moving.includes(id)) };
        if (f.id === target.id) return { ...f, crew: [...f.crew, ...moving] };
        return f;
      }),
    }));
    setSelected(null);
    Alert.alert('Gente movida', `${moving.map(id => WORKERS[id].name).join(', ')} pasa a ${target.description}.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>CUADRILLA PÉREZ · {site.builder.toUpperCase()}</Text>
        <Text style={styles.title}>
          Frentes <Text style={styles.titleAccent}>a destajo</Text>
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.siteRow}>
          {SITES.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.siteChip, s.id === siteId && styles.siteChipActive]}
              onPress={() => setSiteId(s.id)}
            >
              <Text style={[styles.siteChipText, s.id === siteId && styles.siteChipTextActive]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.kpis}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>CONTRATO</Text>
            <Text style={styles.kpiValue}>{money(totals.contract / 1000)}k</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>EJECUTADO</Text>
            <Text style={[styles.kpiValue, { color: COLORS.orange }]}>{totals.pct}%</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>ESTA SEMANA</Text>
            <Text style={styles.kpiValue}>{money(totals.week / 1000)}k</Text>
          </View>
        </View>

        {list.map(front => {
          const short = !front.blocked && !front.completed && presentCount(front) < front.needed;
          return (
            <TouchableOpacity
              key={front.id}
              style={[
                styles.front,
                front.completed && styles.frontDone,
                front.blocked && styles.frontBlocked,
              ]}
              onPress={() => openFront(front)}
              activeOpacity={0.8}
            >
              <View style={styles.frontHeader}>
                <Text style={styles.frontTitle}>{front.description}</Text>
                <Text style={styles.frontPrice}>{money(front.unit_price_mxn)}/{front.unit}</Text>
              </View>
              <ProgressBar done={front.done} week={front.week} total={front.quantity} />
              <View style={styles.frontMeta}>
                <Text style={styles.metaText}>{front.done} de {front.quantity} {front.unit}</Text>
                <Text style={[styles.metaText, { color: COLORS.orange }]}>+{front.week} esta semana</Text>
                <View style={styles.crew}>
                  {front.crew.map((id, i) => (
                    <View
                      key={id}
                      style={[
                        styles.avatar,
                        { backgroundColor: WORKERS[id].color, marginLeft: i ? -6 : 0 },
                        !WORKERS[id].present && styles.avatarAbsent,
                      ]}
                    >
                      <Text style={styles.avatarText}>{id}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {front.blocked && <Text style={styles.blockedText}>⛔ {front.blocked}</Text>}
              {front.completed && <Text style={styles.doneText}>✓ Terminado y recibido por el residente</Text>}
              {short && (
                <Text style={styles.shortText}>
                  Hay {presentCount(front)} de {front.needed} personas hoy
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setQuoteOpen(true)}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>COTIZAR CONCEPTO NUEVO</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.scrim}>
          <TouchableOpacity style={styles.scrimTap} onPress={() => setSelected(null)} accessibilityLabel="Cerrar" />
          {selected && (
            <FrontSheet
              front={selected}
              siteName={site.name}
              today={today}
              setToday={setToday}
              reason={reason}
              setReason={setReason}
              onSave={saveProgress}
              onMoveCrew={() => moveCrewFromBlocked(selected)}
            />
          )}
        </View>
      </Modal>

      <Modal visible={quoteOpen} transparent animationType="slide" onRequestClose={() => setQuoteOpen(false)}>
        <View style={styles.scrim}>
          <TouchableOpacity style={styles.scrimTap} onPress={() => setQuoteOpen(false)} accessibilityLabel="Cerrar" />
          <QuoteSheet builder={site.builder} onSend={() => setQuoteOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

function FrontSheet({ front, siteName, today, setToday, reason, setReason, onSave, onMoveCrew }: {
  front: WorkFront;
  siteName: string;
  today: number;
  setToday: (v: number) => void;
  reason: string | null;
  setReason: (r: string) => void;
  onSave: () => void;
  onMoveCrew: () => void;
}) {
  const people = Math.max(1, presentCount(front));
  const expected = front.rate_per_person_day * people;
  const remaining = front.quantity - front.done;
  const daysLeft = Math.ceil(remaining / expected);
  const onPace = today >= expected * 0.9;

  return (
    <View style={styles.sheet}>
      <View style={styles.grab} />
      <ScrollView contentContainerStyle={styles.sheetContent}>
        <Text style={styles.sheetEyebrow}>{siteName} · {front.item_code}</Text>
        <Text style={styles.sheetTitle}>{front.description}</Text>

        {front.blocked ? (
          <View style={[styles.notice, { backgroundColor: COLORS.redSoft }]}>
            <Text style={[styles.noticeText, { color: COLORS.red }]}>
              ⛔ {front.blocked}. Mientras, la cuadrilla puede pasar a otro frente.
            </Text>
            <TouchableOpacity style={styles.darkBtn} onPress={onMoveCrew}>
              <Text style={styles.darkBtnText}>Mover gente</Text>
            </TouchableOpacity>
          </View>
        ) : front.completed ? (
          <View style={[styles.notice, { backgroundColor: COLORS.greenSoft }]}>
            <Text style={[styles.noticeText, { color: COLORS.green }]}>
              Terminado: {front.quantity} {front.unit} recibidos por el residente.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.compare}>
              <View style={styles.compareBox}>
                <Text style={styles.kpiLabel}>ESPERADO HOY ({people} PERS.)</Text>
                <Text style={styles.compareValue}>{expected} {front.unit}</Text>
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.kpiLabel}>REAL HOY</Text>
                <Text style={[styles.compareValue, { color: onPace ? COLORS.green : COLORS.orange }]}>
                  {today} {front.unit}
                </Text>
              </View>
            </View>

            <View style={styles.sheetCard}>
              <Text style={styles.sheetLabel}>Avance de hoy</Text>
              <Stepper value={today} onChange={setToday} step={1} min={0} max={remaining} suffix={front.unit} />
              <View style={styles.quickRow}>
                {[5, 10, 20].map(n => (
                  <TouchableOpacity key={n} style={styles.quickBtn} onPress={() => setToday(Math.min(remaining, today + n))}>
                    <Text style={styles.quickBtnText}>+{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!onPace && (
                <>
                  <Text style={styles.hint}>Debajo de lo esperado. ¿Por qué?</Text>
                  <View style={styles.chipRow}>
                    {DELAY_REASONS.map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.chip, reason === r && styles.chipActive]}
                        onPress={() => setReason(r)}
                      >
                        <Text style={[styles.chipText, reason === r && styles.chipTextActive]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          </>
        )}

        <View style={styles.sheetCard}>
          <Row label="Hecho" value={`${front.done} de ${front.quantity} ${front.unit}`} />
          <Row label="Precio unitario a destajo" value={`${money(front.unit_price_mxn)}/${front.unit}`} />
          {!front.completed && !front.blocked && <Row label="A este ritmo terminas en" value={`${daysLeft} días`} />}
          {!front.completed && !front.blocked && <Row label="Lo de hoy vale" value={money(today * front.unit_price_mxn)} />}
        </View>

        {!front.blocked && !front.completed && (
          <TouchableOpacity
            style={[styles.primaryBtn, today <= 0 && { opacity: 0.4 }]}
            onPress={onSave}
            disabled={today <= 0}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>GUARDAR AVANCE</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function QuoteSheet({ builder, onSend }: { builder: string; onSend: () => void }) {
  const [index, setIndex] = useState(0);
  const concept = CATALOG[index];
  const [volume, setVolume] = useState(180);
  const [people, setPeople] = useState(4);
  const [price, setPrice] = useState(concept.unit_price_mxn);

  const days = Math.ceil(volume / (concept.rate_per_person_day * people));
  const payroll = days * people * AVG_DAILY_WAGE * (1 + PAYROLL_TAX);
  const amount = volume * price;
  const profit = amount - payroll;
  const diff = (price - concept.market_price_mxn) / concept.market_price_mxn;
  const inRange = Math.abs(diff) <= 0.1;

  const pick = (i: number) => {
    setIndex(i);
    setPrice(CATALOG[i].unit_price_mxn);
  };

  const send = () => {
    Alert.alert('Propuesta enviada', `${concept.description}: ${volume} ${concept.unit} a ${money(price)} para ${builder}.`);
    onSend();
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.grab} />
      <ScrollView contentContainerStyle={styles.sheetContent}>
        <Text style={styles.sheetEyebrow}>Propuesta para {builder}</Text>
        <Text style={styles.sheetTitle}>Cotizar concepto</Text>

        <View style={styles.chipRow}>
          {CATALOG.map((c, i) => (
            <TouchableOpacity key={c.description} style={[styles.chip, i === index && styles.chipActive]} onPress={() => pick(i)}>
              <Text style={[styles.chipText, i === index && styles.chipTextActive]}>{c.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sheetCard}>
          <Text style={styles.sheetLabel}>Volumen</Text>
          <Stepper value={volume} onChange={setVolume} step={10} min={10} max={2000} suffix={concept.unit} />
          <Text style={styles.sheetLabel}>Personas en el frente</Text>
          <Stepper value={people} onChange={setPeople} step={1} min={1} max={12} suffix="" />
          <Text style={styles.sheetLabel}>Tu precio unitario</Text>
          <Stepper value={price} onChange={setPrice} step={5} min={5} max={5000} suffix={`$/${concept.unit}`} />
        </View>

        <View style={[styles.notice, { backgroundColor: inRange ? COLORS.greenSoft : COLORS.orangeSoft }]}>
          <Text style={[styles.noticeText, { color: inRange ? COLORS.green : '#6E2A08' }]}>
            Promedio en la zona: {money(concept.market_price_mxn)}/{concept.unit}.{' '}
            {inRange
              ? 'Estás en rango.'
              : diff > 0
                ? `Estás ${Math.round(diff * 100)}% arriba: puede que te ganen la obra.`
                : `Estás ${Math.round(-diff * 100)}% abajo: estás dejando dinero.`}
          </Text>
        </View>

        <View style={styles.sheetCard}>
          <Row label="Rendimiento" value={`${concept.rate_per_person_day} ${concept.unit}/persona/día`} />
          <Row label="Duración" value={`${days} días con ${people}`} />
          <Row label="Importe" value={money(amount)} />
          <Row label="Raya + IMSS" value={`−${money(payroll)}`} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tu utilidad</Text>
            <Text style={[styles.totalValue, { color: profit > 0 ? COLORS.green : COLORS.red }]}>{money(profit)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={send}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>ENVIAR PROPUESTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.concrete },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40, gap: 12 },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, color: COLORS.ink2, fontWeight: '600' },
  title: { fontSize: 34, fontWeight: '900', color: COLORS.ink, textTransform: 'uppercase', marginTop: -6 },
  titleAccent: { color: COLORS.orange },
  siteRow: { flexGrow: 0 },
  siteChip: { borderWidth: 2, borderColor: COLORS.ink, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, backgroundColor: COLORS.card },
  siteChipActive: { backgroundColor: COLORS.ink },
  siteChipText: { fontWeight: '700', color: COLORS.ink },
  siteChipTextActive: { color: COLORS.hivis },
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: COLORS.card, borderRadius: 6, padding: 10 },
  kpiLabel: { fontSize: 9, fontWeight: '700', color: COLORS.ink2, letterSpacing: 0.5 },
  kpiValue: { fontSize: 24, fontWeight: '900', color: COLORS.ink, marginTop: 2 },
  front: { backgroundColor: COLORS.card, borderRadius: 6, padding: 12, gap: 8, borderLeftWidth: 5, borderLeftColor: COLORS.orange },
  frontDone: { borderLeftColor: COLORS.green, opacity: 0.85 },
  frontBlocked: { borderLeftColor: COLORS.red },
  frontHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  frontTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.ink },
  frontPrice: { fontSize: 12, fontWeight: '600', color: COLORS.ink2 },
  bar: { height: 10, borderRadius: 2, backgroundColor: COLORS.line, overflow: 'hidden', flexDirection: 'row' },
  barBefore: { backgroundColor: COLORS.ink },
  barWeek: { backgroundColor: COLORS.orange },
  frontMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: COLORS.ink2, fontWeight: '500' },
  crew: { flexDirection: 'row', marginLeft: 'auto' },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  avatarAbsent: { opacity: 0.3 },
  avatarText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  blockedText: { color: COLORS.red, fontWeight: '700', fontSize: 12 },
  doneText: { color: COLORS.green, fontWeight: '600', fontSize: 12 },
  shortText: { color: COLORS.orange, fontWeight: '700', fontSize: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.orange, borderRadius: 8, paddingVertical: 14 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.6 },
  scrim: { flex: 1, backgroundColor: 'rgba(17,21,24,0.5)', justifyContent: 'flex-end' },
  scrimTap: { flex: 1 },
  sheet: { maxHeight: '88%', backgroundColor: '#F3F4F3', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#C4C9C7', alignSelf: 'center', marginTop: 8 },
  sheetContent: { padding: 16, paddingBottom: 36, gap: 12 },
  sheetEyebrow: { fontSize: 11, color: COLORS.ink2 },
  sheetTitle: { fontSize: 28, fontWeight: '900', color: COLORS.ink, textTransform: 'uppercase' },
  compare: { flexDirection: 'row', gap: 8 },
  compareBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 6, padding: 10 },
  compareValue: { fontSize: 26, fontWeight: '900', color: COLORS.ink, marginTop: 2 },
  sheetCard: { backgroundColor: COLORS.card, borderRadius: 6, padding: 12, gap: 8 },
  sheetLabel: { fontSize: 13, color: COLORS.ink, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 48, height: 48, borderRadius: 8, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 22, fontWeight: '800', color: COLORS.ink },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, backgroundColor: COLORS.ink, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  quickBtnText: { color: COLORS.hivis, fontWeight: '800' },
  hint: { fontSize: 12.5, color: COLORS.ink2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1.5, borderColor: COLORS.ink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.card },
  chipActive: { backgroundColor: COLORS.ink },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.ink },
  chipTextActive: { color: COLORS.hivis },
  notice: { borderRadius: 6, padding: 10, gap: 8 },
  noticeText: { fontSize: 13, fontWeight: '500' },
  darkBtn: { alignSelf: 'flex-start', backgroundColor: COLORS.ink, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  darkBtnText: { color: COLORS.hivis, fontWeight: '700', fontSize: 12.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 8 },
  rowLabel: { fontSize: 13, color: COLORS.ink2, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '700', color: COLORS.ink },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 3, borderTopColor: COLORS.ink, paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.ink },
  totalValue: { fontSize: 24, fontWeight: '900' },
});
