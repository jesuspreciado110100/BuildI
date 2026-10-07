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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ChiefOfLaborService,
  Enrollment,
  Front,
  LaborSite,
  QuoteConcept,
  Worker,
} from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';

// Frentes a destajo: cada frente es un concepto con precio unitario
// (volumen × precio) que la cuadrilla ejecuta para la constructora.
// Datos en Supabase: labor_sites, labor_fronts_summary, labor_front_members,
// labor_front_progress, labor_quote_catalog y labor_quotes.

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

const HEIGHT_COURSE = 'alturas';
const DELAY_REASONS = ['Faltó material', 'Faltó gente', 'Lluvia', 'Cambio del residente'];
const AVG_DAILY_WAGE = 560;
const PAYROLL_TAX = 0.12;

interface FrontsData {
  sites: LaborSite[];
  frontsBySite: Record<string, Front[]>;
  workers: Record<string, Worker>;
  enrollments: Enrollment[];
  catalog: QuoteConcept[];
}

async function loadFronts(): Promise<FrontsData> {
  const [sites, workers, enrollments, catalog] = await Promise.all([
    ChiefOfLaborService.getSites(),
    ChiefOfLaborService.getWorkers(),
    ChiefOfLaborService.getEnrollments(),
    ChiefOfLaborService.getQuoteCatalog(),
  ]);
  const fronts = await Promise.all(sites.map(s => ChiefOfLaborService.getFronts(s.id)));
  return {
    sites,
    frontsBySite: Object.fromEntries(sites.map((s, i) => [s.id, fronts[i]])),
    workers: Object.fromEntries(workers.map(w => [w.id, w])),
    enrollments,
    catalog,
  };
}

const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const isPresent = (w?: Worker) => w?.attendance === 'present' || w?.attendance === 'late';
const hasHeightCert = (w?: Worker) => !!w?.credentials.some(c => c.course_id === HEIGHT_COURSE);

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

function statusOf(front: Front) {
  if (front.completed) return { label: 'TERMINADO', color: COLORS.success };
  if (front.blocked_reason) return { label: 'DETENIDO', color: COLORS.error };
  return { label: 'EN CURSO', color: COLORS.primary };
}

export default function WorkFronts() {
  const { state, reload } = useLaborData(loadFronts);
  return (
    <LaborDataGate title="Frentes a destajo" state={state} reload={reload}>
      {data => <FrontsScreen data={data} reload={reload} />}
    </LaborDataGate>
  );
}

function FrontsScreen({ data, reload }: { data: FrontsData; reload: (silent?: boolean) => Promise<void> }) {
  const [siteId, setSiteId] = useState(data.sites[0]?.id ?? '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [today, setToday] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const list = data.frontsBySite[siteId] ?? [];
  const site = data.sites.find(s => s.id === siteId);
  const selected = list.find(f => f.id === selectedId) ?? null;
  const W = data.workers;

  const presentCount = (front: Front) => front.member_ids.filter(id => isPresent(W[id])).length;
  const enrolledInHeights = (id: string) => data.enrollments.some(e => e.worker_id === id && e.course_id === HEIGHT_COURSE);
  // Recomendación (no bloqueo): quién trabaja en altura sin la DC-3 de alturas.
  const missingHeightCert = (front: Front) =>
    front.at_height_note && !front.completed
      ? front.member_ids.filter(id => W[id] && !hasHeightCert(W[id]) && !enrolledInHeights(id))
      : [];
  const namesList = (ids: string[]) => {
    const names = ids.map(id => W[id]?.full_name ?? '');
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  };

  const totals = useMemo(() => {
    const contract = list.reduce((a, f) => a + f.quantity * f.unit_price, 0);
    const executed = list.reduce((a, f) => a + f.done * f.unit_price, 0);
    const week = list.reduce((a, f) => a + f.week * f.unit_price, 0);
    return { contract, pct: contract ? Math.round((executed / contract) * 100) : 0, week };
  }, [list]);

  const openFront = (front: Front) => {
    setSelectedId(front.id);
    setReason(null);
    setToday(front.blocked_reason || front.completed ? 0 : Math.min(24, front.quantity - front.done));
  };

  const run = async (work: () => Promise<void>, done?: string) => {
    setSaving(true);
    try {
      await work();
      await reload(true);
      if (done) Alert.alert('Listo', done);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const saveProgress = () => {
    if (!selected || today <= 0) return;
    const front = selected;
    const qty = today;
    setSelectedId(null);
    run(() => ChiefOfLaborService.recordProgress(front.id, qty, reason));
  };

  const moveCrewFromBlocked = (blocked: Front) => {
    const target = list.find(f => !f.blocked_reason && !f.completed && presentCount(f) < f.people_needed);
    if (!target) {
      Alert.alert('Sin frentes cortos', 'Todos los frentes tienen la gente que necesitan.');
      return;
    }
    const moving = blocked.member_ids.filter(id => isPresent(W[id])).slice(0, target.people_needed - presentCount(target));
    if (!moving.length) {
      Alert.alert('Sin gente disponible', 'Nadie de este frente llegó hoy.');
      return;
    }
    const noCert = target.at_height_note ? moving.filter(id => !hasHeightCert(W[id])) : [];
    setSelectedId(null);
    run(
      () => ChiefOfLaborService.moveMembers(blocked.id, target.id, moving),
      `${namesList(moving)} pasa a ${target.description}.` +
        (noCert.length ? ` Recomendación: ${namesList(noCert)} no tiene la DC-3 de alturas y ese frente es en ${target.at_height_note}.` : ''),
    );
  };

  const enroll = (ids: string[]) =>
    run(() => ChiefOfLaborService.enroll(HEIGHT_COURSE, ids), `${namesList(ids)} al curso de trabajo en alturas del sábado.`);

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Frentes a destajo</Text>
          {site ? <Text style={styles.subtitle}>{site.builder_name}</Text> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.siteRow}>
          {data.sites.map(s => (
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
          {list.length === 0 && <Text style={styles.metaText}>Esta obra todavía no tiene frentes.</Text>}
          {list.map(front => {
            const short = !front.blocked_reason && !front.completed && presentCount(front) < front.people_needed;
            const noCert = missingHeightCert(front);
            const status = statusOf(front);
            return (
              <TouchableOpacity key={front.id} style={styles.card} onPress={() => openFront(front)} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{front.description}</Text>
                    <Text style={styles.cardSubtitle}>{money(front.unit_price)}/{front.unit} · {front.item_code}</Text>
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
                    {front.member_ids.filter(id => W[id]).map((id, i) => (
                      <View
                        key={id}
                        style={[
                          styles.avatar,
                          { backgroundColor: W[id].color, marginLeft: i ? -6 : 0 },
                          !isPresent(W[id]) && styles.avatarAbsent,
                        ]}
                      >
                        <Text style={styles.avatarText}>{W[id].code}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                {front.blocked_reason && (
                  <View style={styles.detailItem}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={[styles.detailText, { color: COLORS.error }]}>{front.blocked_reason}</Text>
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
                      Hay {presentCount(front)} de {front.people_needed} personas hoy
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

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelectedId(null)}>
        <View style={styles.scrim}>
          <TouchableOpacity style={styles.scrimTap} onPress={() => setSelectedId(null)} accessibilityLabel="Cerrar" />
          {selected && site && (
            <FrontSheet
              front={selected}
              siteName={site.name}
              people={Math.max(1, presentCount(selected))}
              today={today}
              setToday={setToday}
              reason={reason}
              setReason={setReason}
              noCert={missingHeightCert(selected)}
              namesList={namesList}
              saving={saving}
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
          {data.catalog.length > 0 && (
            <QuoteSheet
              catalog={data.catalog}
              site={site ?? null}
              onSent={() => setQuoteOpen(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function FrontSheet({ front, siteName, people, today, setToday, reason, setReason, noCert, namesList, saving, onEnroll, onSave, onMoveCrew }: {
  front: Front;
  siteName: string;
  people: number;
  today: number;
  setToday: (v: number) => void;
  reason: string | null;
  setReason: (r: string) => void;
  noCert: string[];
  namesList: (ids: string[]) => string;
  saving: boolean;
  onEnroll: (ids: string[]) => void;
  onSave: () => void;
  onMoveCrew: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const expected = front.rate_per_person_day * people;
  const remaining = Math.max(0, front.quantity - front.done);
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
                Este frente es en {front.at_height_note}. {namesList(noCert)} no {noCert.length === 1 ? 'tiene' : 'tienen'} la DC-3 de trabajo en alturas (NOM-009). Te recomendamos inscribirlos o pasarlos a un frente a nivel de piso.
              </Text>
              <View style={styles.recActions}>
                <TouchableOpacity style={[styles.actionButton, saving && { opacity: 0.5 }]} disabled={saving} onPress={() => onEnroll(noCert)}>
                  <Text style={styles.actionText}>Inscribir al curso</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.laterButton} onPress={() => setDismissed(true)}>
                  <Text style={styles.laterText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {front.blocked_reason ? (
          <View style={[styles.notice, { backgroundColor: COLORS.errorSoft }]}>
            <Text style={[styles.noticeText, { color: '#B91C1C' }]}>
              {front.blocked_reason}. Mientras, la cuadrilla puede pasar a otro frente.
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
          <Row label="Precio unitario a destajo" value={`${money(front.unit_price)}/${front.unit}`} />
          {!front.completed && !front.blocked_reason && <Row label="A este ritmo terminas en" value={`${daysLeft} días`} />}
          {!front.completed && !front.blocked_reason && <Row label="Lo de hoy vale" value={money(today * front.unit_price)} />}
        </View>

        {!front.blocked_reason && !front.completed && (
          <TouchableOpacity
            style={[styles.primaryButton, styles.sheetButton, (today <= 0 || saving) && { opacity: 0.4 }]}
            onPress={onSave}
            disabled={today <= 0 || saving}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Guardar avance</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function QuoteSheet({ catalog, site, onSent }: { catalog: QuoteConcept[]; site: LaborSite | null; onSent: () => void }) {
  const [index, setIndex] = useState(0);
  const concept = catalog[index];
  const [volume, setVolume] = useState(180);
  const [people, setPeople] = useState(4);
  const [price, setPrice] = useState(concept.default_unit_price);
  const [sending, setSending] = useState(false);
  const builder = site?.builder_name ?? 'la constructora';

  const days = Math.ceil(volume / (concept.rate_per_person_day * people));
  const payroll = days * people * AVG_DAILY_WAGE * (1 + PAYROLL_TAX);
  const amount = volume * price;
  const profit = amount - payroll;
  const diff = (price - concept.market_unit_price) / concept.market_unit_price;
  const inRange = Math.abs(diff) <= 0.1;

  const pick = (i: number) => {
    setIndex(i);
    setPrice(catalog[i].default_unit_price);
  };

  const send = async () => {
    setSending(true);
    try {
      await ChiefOfLaborService.sendQuote({
        siteId: site?.id ?? null,
        builderName: builder,
        catalogId: concept.id,
        volume,
        people,
        unitPrice: price,
        estDays: days,
        estPayroll: payroll,
      });
      Alert.alert('Propuesta enviada', `${concept.description}: ${volume} ${concept.unit} a ${money(price)} para ${builder}.`);
      onSent();
    } catch (e) {
      Alert.alert('No se pudo enviar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.grab} />
      <ScrollView contentContainerStyle={styles.sheetContent}>
        <Text style={styles.sheetEyebrow}>Propuesta para {builder}</Text>
        <Text style={styles.sheetTitle}>Cotizar concepto</Text>

        <View style={styles.chipRow}>
          {catalog.map((c, i) => (
            <TouchableOpacity key={c.id} style={[styles.chip, i === index && styles.chipActive]} onPress={() => pick(i)}>
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
            Promedio en la zona: {money(concept.market_unit_price)}/{concept.unit}.{' '}
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

        <TouchableOpacity style={[styles.primaryButton, styles.sheetButton, sending && { opacity: 0.5 }]} onPress={send} disabled={sending}>
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
