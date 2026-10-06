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

// Frentes a destajo: cada frente es un concepto con precio unitario
// (volumen × precio) que la cuadrilla ejecuta para la constructora. Usa la
// misma forma que WorkConcept / JobBoardPost (item_code, unit, quantity,
// unit_price_mxn) más el avance diario. Datos de ejemplo.

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
  atHeight?: string;
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
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  body: '#374151',
  muted: '#6B7280',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  primary: '#2563EB',
  primarySoft: '#EBF4FF',
  primaryLight: '#BFDBFE',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningText: '#B45309',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
};

// heights: tiene la DC-3 de trabajo en alturas (NOM-009).
const WORKERS: Record<string, { name: string; color: string; present: boolean; heights: boolean }> = {
  JL: { name: 'Juan López', color: '#2563EB', present: true, heights: true },
  MA: { name: 'Miguel Ángel', color: '#7C3AED', present: true, heights: true },
  IC: { name: 'Iván Cruz', color: '#DB2777', present: false, heights: false },
  EG: { name: 'Esteban García', color: '#059669', present: true, heights: false },
  CV: { name: 'Carlos Vega', color: '#0F766E', present: true, heights: true },
  PS: { name: 'Pedro Sánchez', color: '#DC2626', present: true, heights: false },
  JD: { name: 'Jorge Domínguez', color: '#65A30D', present: true, heights: true },
  LR: { name: 'Luis Ramos', color: '#D97706', present: true, heights: true },
  HT: { name: 'Hugo Treviño', color: '#4338CA', present: true, heights: false },
  BM: { name: 'Beto Morales', color: '#C2410C', present: true, heights: true },
  TR: { name: 'Toño Ramírez', color: '#0E7490', present: true, heights: false },
};

const SITES: Site[] = [
  { id: 'alameda', name: 'Torre Alameda', builder: 'Constructora Torres' },
  { id: 'depto6b', name: 'Depto 6B', builder: 'Constructora Torres' },
];

const INITIAL_FRONTS: Record<string, WorkFront[]> = {
  alameda: [
    { id: 'f1', item_code: 'ALB-015', description: 'Muro de block 15 cm', unit: 'm²', quantity: 420, done: 286, week: 120, unit_price_mxn: 185, crew: ['JL', 'MA', 'IC', 'EG'], needed: 4, rate_per_person_day: 9, atHeight: 'el nivel 3' },
    { id: 'f2', item_code: 'ALB-030', description: 'Aplanado fino en muros', unit: 'm²', quantity: 840, done: 410, week: 260, unit_price_mxn: 95, crew: ['CV', 'PS', 'JD'], needed: 3, rate_per_person_day: 16, atHeight: 'andamios a 2.5 m' },
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
// Recomendación (no bloqueo): quién trabaja en altura sin la DC-3 de alturas.
const missingHeightCert = (front: WorkFront) =>
  front.atHeight && !front.completed ? front.crew.filter(id => !WORKERS[id]?.heights) : [];
const namesList = (ids: string[]) => {
  const names = ids.map(id => WORKERS[id].name);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
};

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
        <Ionicons name="remove" size={22} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value} {suffix}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} accessibilityLabel="Más">
        <Ionicons name="add" size={22} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

function statusOf(front: WorkFront) {
  if (front.completed) return { label: 'TERMINADO', color: COLORS.success };
  if (front.blocked) return { label: 'DETENIDO', color: COLORS.error };
  return { label: 'EN CURSO', color: COLORS.primary };
}

export default function WorkFronts() {
  const [siteId, setSiteId] = useState(SITES[0].id);
  const [fronts, setFronts] = useState(INITIAL_FRONTS);
  const [selected, setSelected] = useState<WorkFront | null>(null);
  const [today, setToday] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [enrolled, setEnrolled] = useState<string[]>([]);

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
    const noCert = target.atHeight ? moving.filter(id => !WORKERS[id].heights) : [];
    Alert.alert(
      'Gente movida',
      `${namesList(moving)} pasa a ${target.description}.` +
        (noCert.length ? ` Recomendación: ${namesList(noCert)} no tiene la DC-3 de alturas y ese frente es en ${target.atHeight}.` : ''),
    );
  };

  const enroll = (ids: string[]) => {
    setEnrolled(prev => [...prev, ...ids]);
    Alert.alert('Inscritos', `${namesList(ids)} al curso de trabajo en alturas del sábado.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Frentes a destajo</Text>
          <Text style={styles.subtitle}>Mano de Obra Pérez · {site.builder}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.siteRow}>
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

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{money(totals.contract / 1000)}k</Text>
            <Text style={styles.summaryLabel}>Contrato</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.pct}%</Text>
            <Text style={styles.summaryLabel}>Ejecutado</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{money(totals.week / 1000)}k</Text>
            <Text style={styles.summaryLabel}>Esta semana</Text>
          </View>
        </View>

        <View style={styles.list}>
          {list.map(front => {
            const short = !front.blocked && !front.completed && presentCount(front) < front.needed;
            const noCert = missingHeightCert(front).filter(id => !enrolled.includes(id));
            const status = statusOf(front);
            return (
              <TouchableOpacity key={front.id} style={styles.card} onPress={() => openFront(front)} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{front.description}</Text>
                    <Text style={styles.cardSubtitle}>{money(front.unit_price_mxn)}/{front.unit} · {front.item_code}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                    <Text style={styles.statusText}>{status.label}</Text>
                  </View>
                </View>
                <ProgressBar done={front.done} week={front.week} total={front.quantity} />
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>{front.done} de {front.quantity} {front.unit}</Text>
                  <Text style={[styles.metaText, { color: COLORS.primary }]}>+{front.week} esta semana</Text>
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
                {front.blocked && (
                  <View style={styles.detailItem}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={[styles.detailText, { color: COLORS.error }]}>{front.blocked}</Text>
                  </View>
                )}
                {front.completed && (
                  <View style={styles.detailItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.detailText}>Terminado y recibido por el residente</Text>
                  </View>
                )}
                {short && (
                  <View style={styles.detailItem}>
                    <Ionicons name="people" size={16} color={COLORS.warning} />
                    <Text style={[styles.detailText, { color: COLORS.warningText }]}>
                      Hay {presentCount(front)} de {front.needed} personas hoy
                    </Text>
                  </View>
                )}
                {noCert.length > 0 && (
                  <View style={styles.detailItem}>
                    <Ionicons name="bulb" size={16} color={COLORS.warning} />
                    <Text style={[styles.detailText, { color: COLORS.warningText }]}>
                      Recomendación: {noCert.length} {noCert.length === 1 ? 'persona' : 'personas'} sin curso de alturas
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => setQuoteOpen(true)}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Cotizar concepto nuevo</Text>
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
              noCert={missingHeightCert(selected).filter(id => !enrolled.includes(id))}
              onEnroll={enroll}
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

function FrontSheet({ front, siteName, today, setToday, reason, setReason, noCert, onEnroll, onSave, onMoveCrew }: {
  front: WorkFront;
  siteName: string;
  today: number;
  setToday: (v: number) => void;
  reason: string | null;
  setReason: (r: string) => void;
  noCert: string[];
  onEnroll: (ids: string[]) => void;
  onSave: () => void;
  onMoveCrew: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
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

        {noCert.length > 0 && !dismissed && (
          <View style={styles.recCard}>
            <View style={styles.recIcon}>
              <Ionicons name="bulb" size={20} color={COLORS.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recTitle}>Recomendación de seguridad</Text>
              <Text style={styles.recText}>
                Este frente es en {front.atHeight}. {namesList(noCert)} no {noCert.length === 1 ? 'tiene' : 'tienen'} la DC-3 de trabajo en alturas (NOM-009). Te recomendamos inscribirlos o pasarlos a un frente a nivel de piso.
              </Text>
              <View style={styles.recActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onEnroll(noCert)}>
                  <Text style={styles.actionText}>Inscribir al curso</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.laterButton} onPress={() => setDismissed(true)}>
                  <Text style={styles.laterText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {front.blocked ? (
          <View style={[styles.notice, { backgroundColor: COLORS.errorSoft }]}>
            <Text style={[styles.noticeText, { color: '#B91C1C' }]}>
              {front.blocked}. Mientras, la cuadrilla puede pasar a otro frente.
            </Text>
            <TouchableOpacity style={styles.actionButton} onPress={onMoveCrew}>
              <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Mover gente</Text>
            </TouchableOpacity>
          </View>
        ) : front.completed ? (
          <View style={[styles.notice, { backgroundColor: COLORS.successSoft }]}>
            <Text style={[styles.noticeText, { color: '#047857' }]}>
              Terminado: {front.quantity} {front.unit} recibidos por el residente.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.compare}>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Esperado hoy ({people} pers.)</Text>
                <Text style={styles.compareValue}>{expected} {front.unit}</Text>
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Real hoy</Text>
                <Text style={[styles.compareValue, { color: onPace ? COLORS.success : COLORS.warning }]}>
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
            style={[styles.primaryButton, styles.sheetButton, today <= 0 && { opacity: 0.4 }]}
            onPress={onSave}
            disabled={today <= 0}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Guardar avance</Text>
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

        <View style={[styles.notice, { backgroundColor: inRange ? COLORS.successSoft : COLORS.warningSoft }]}>
          <Text style={[styles.noticeText, { color: inRange ? '#047857' : COLORS.warningText }]}>
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
            <Text style={[styles.totalValue, { color: profit > 0 ? COLORS.success : COLORS.error }]}>{money(profit)}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryButton, styles.sheetButton]} onPress={send}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Enviar propuesta</Text>
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

const cardShadow = {
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.muted },
  siteRow: { paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  siteChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.primarySoft },
  siteChipActive: { backgroundColor: COLORS.primary },
  siteChipText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  siteChipTextActive: { color: '#FFFFFF' },
  summary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.card, marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 20, ...cardShadow },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },
  list: { paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, gap: 10, ...cardShadow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: COLORS.muted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  bar: { height: 8, borderRadius: 4, backgroundColor: COLORS.divider, overflow: 'hidden', flexDirection: 'row' },
  barBefore: { backgroundColor: COLORS.primaryLight },
  barWeek: { backgroundColor: COLORS.primary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: COLORS.muted },
  crew: { flexDirection: 'row', marginLeft: 'auto' },
  avatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  avatarAbsent: { opacity: 0.3 },
  avatarText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 14, color: COLORS.body, marginLeft: 8, flex: 1 },
  primaryButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, margin: 20, borderRadius: 12, gap: 8 },
  sheetButton: { margin: 0 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  scrim: { flex: 1, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end' },
  scrimTap: { flex: 1 },
  sheet: { maxHeight: '88%', backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 8 },
  sheetContent: { padding: 20, paddingBottom: 40, gap: 12 },
  sheetEyebrow: { fontSize: 13, color: COLORS.muted },
  sheetTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  recCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.warning, ...cardShadow },
  recIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.warningSoft, justifyContent: 'center', alignItems: 'center' },
  recTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  recText: { fontSize: 13, color: COLORS.body },
  recActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.primarySoft, gap: 4 },
  actionText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  laterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.divider },
  laterText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  compare: { flexDirection: 'row', gap: 12 },
  compareBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, alignItems: 'center', ...cardShadow },
  compareLabel: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },
  compareValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  sheetCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, gap: 10, ...cardShadow },
  sheetLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, backgroundColor: COLORS.primarySoft, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  quickBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  hint: { fontSize: 13, color: COLORS.muted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.divider },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.body },
  chipTextActive: { color: '#FFFFFF' },
  notice: { borderRadius: 12, padding: 14, gap: 10 },
  noticeText: { fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowLabel: { fontSize: 14, color: COLORS.muted, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 2 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
});
