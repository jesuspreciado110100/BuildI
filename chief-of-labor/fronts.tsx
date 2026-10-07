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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ChiefOfLaborService,
  Concept,
  Contractor,
  Course,
  Enrollment,
  Front,
  LaborSite,
  ProLevel,
  REAL_SALARY_FACTOR,
  Worker,
  hasValidCertificate,
  timezoneLabel,
} from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';
import {
  AddSiteSheet,
  CourseEnrollPanel,
  LaborField,
  LaborSheet,
  MultiChips,
  SheetButton,
  money,
  parseAmount,
  sheetStyles,
} from '@/app/components/LaborSheets';

// Frentes a destajo: cada frente es un concepto del catálogo de la obra con
// precio unitario (volumen × precio) que la cuadrilla ejecuta para la
// constructora. Las obras son los proyectos reales de BuildI y el avance se
// guarda con el día de cada obra. Datos en Supabase: labor_my_sites(),
// labor_site_concepts(), labor_fronts_summary, labor_front_members,
// labor_front_progress y labor_quotes.

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
const STOP_REASONS = ['Falta material', 'Falta frente libre', 'Lluvia', 'Cambio del residente'];

interface FrontsData {
  contractor: Contractor;
  sites: LaborSite[];
  frontsBySite: Record<string, Front[]>;
  workers: Record<string, Worker>;
  enrollments: Enrollment[];
  heightCourse: Course | null;
  level: ProLevel;
}

async function loadFronts(): Promise<FrontsData> {
  const [contractor, allSites, enrollments, courses, score] = await Promise.all([
    ChiefOfLaborService.getContractor(),
    ChiefOfLaborService.getSites(),
    ChiefOfLaborService.getEnrollments(),
    ChiefOfLaborService.getCourses(),
    ChiefOfLaborService.getScore(),
  ]);
  if (!contractor) throw new Error('No hay contratista.');
  const sites = allSites.filter(s => s.active);
  const [workers, fronts] = await Promise.all([
    ChiefOfLaborService.getWorkers(allSites),
    Promise.all(sites.map(s => ChiefOfLaborService.getFronts(s.id))),
  ]);
  return {
    contractor,
    sites,
    frontsBySite: Object.fromEntries(sites.map((s, i) => [s.id, fronts[i]])),
    workers: Object.fromEntries(workers.map(w => [w.id, w])),
    enrollments,
    heightCourse: courses.find(c => c.id === HEIGHT_COURSE) ?? null,
    level: score.level,
  };
}

const isPresent = (w?: Worker) => w?.attendance === 'present' || w?.attendance === 'late';
const hasHeightCert = (w?: Worker) => !!w && hasValidCertificate(w, HEIGHT_COURSE);
const fmtQty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

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
      <Text style={styles.stepValue}>{fmtQty(value)} {suffix}</Text>
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
  const [sheet, setSheet] = useState<'site' | 'front' | 'quote' | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const site = data.sites.find(s => s.id === siteId) ?? data.sites[0];
  const list = site ? data.frontsBySite[site.id] ?? [] : [];
  const selected = list.find(f => f.id === selectedId) ?? null;
  const W = data.workers;

  const presentCount = (front: Front) => front.member_ids.filter(id => isPresent(W[id])).length;
  const enrolledInHeights = (id: string) =>
    data.enrollments.some(e => e.worker_id === id && e.course_id === HEIGHT_COURSE && (e.status === 'enrolled' || e.status === 'attended'));
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
    const executed = list.reduce((a, f) => a + Math.min(f.done, f.quantity) * f.unit_price, 0);
    const week = list.reduce((a, f) => a + f.week * f.unit_price, 0);
    return { contract, pct: contract ? Math.round((executed / contract) * 100) : 0, week };
  }, [list]);

  const openFront = (front: Front) => {
    setSelectedId(front.id);
    setReason(null);
    setToday(front.blocked_reason || front.completed ? 0 : Math.min(Math.round(front.rate_per_person_day * Math.max(1, presentCount(front))), front.quantity - front.done));
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

  const setBlocked = (front: Front, blocked: string | null) => {
    setSelectedId(null);
    run(() => ChiefOfLaborService.setFrontBlocked(front.id, blocked));
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

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const afterSheet = async (message?: string) => {
    setSheet(null);
    await reload(true);
    if (message) Alert.alert('Listo', message);
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Frentes a destajo</Text>
          {site ? (
            <Text style={styles.subtitle}>
              {site.builder_name ? `${site.builder_name} · ` : ''}{timezoneLabel(site.timezone)}
            </Text>
          ) : null}
        </View>

        {data.sites.length === 0 ? (
          <View style={styles.list}>
            <View style={[styles.card, { alignItems: 'center' }]}>
              <Ionicons name="business" size={32} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Agrega la obra donde trabajas</Text>
              <Text style={[styles.metaText, { textAlign: 'center' }]}>
                Busca la obra en BuildI. Sus frentes salen del catálogo de conceptos de la constructora y el avance se guarda con la hora de la obra.
              </Text>
              <TouchableOpacity style={[styles.primaryButton, styles.sheetButton, { alignSelf: 'stretch' }]} onPress={() => setSheet('site')}>
                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Agregar obra</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.siteRow}>
              {data.sites.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.siteChip, s.id === site?.id && styles.siteChipActive]}
                  onPress={() => setSiteId(s.id)}
                >
                  <Text style={[styles.siteChipText, s.id === site?.id && styles.siteChipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.siteChip} onPress={() => setSheet('site')} accessibilityLabel="Agregar obra">
                <Text style={styles.siteChipText}>+ Obra</Text>
              </TouchableOpacity>
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
              {list.length === 0 && (
                <View style={[styles.card, { alignItems: 'center' }]}>
                  <Text style={styles.cardTitle}>Esta obra todavía no tiene frentes</Text>
                  <Text style={[styles.metaText, { textAlign: 'center' }]}>
                    Elige un concepto del catálogo de la obra, pon tu precio a destajo y quién trabaja en él.
                  </Text>
                </View>
              )}
              {list.map(front => {
                const short = !front.blocked_reason && !front.completed && presentCount(front) < front.people_needed;
                const noCert = missingHeightCert(front);
                const status = statusOf(front);
                return (
                  <TouchableOpacity key={front.id} style={styles.card} onPress={() => openFront(front)} activeOpacity={0.8}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{front.description}</Text>
                        <Text style={styles.cardSubtitle}>
                          {money(front.unit_price)}/{front.unit}{front.item_code ? ` · ${front.item_code}` : ''}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.label}</Text>
                      </View>
                    </View>
                    <ProgressBar done={Math.min(front.done, front.quantity)} week={front.week} total={front.quantity} />
                    <View style={styles.cardMeta}>
                      <Text style={styles.metaText}>{fmtQty(front.done)} de {fmtQty(front.quantity)} {front.unit}</Text>
                      <Text style={[styles.metaText, { color: COLORS.primary }]}>+{fmtQty(front.week)} esta semana</Text>
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
                        <Text style={styles.detailText}>Terminado</Text>
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

            <TouchableOpacity style={styles.primaryButton} onPress={() => setSheet('front')}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Nuevo frente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => setSheet('quote')}>
              <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
              <Text style={styles.outlineButtonText}>Cotizar un concepto a la constructora</Text>
            </TouchableOpacity>
          </>
        )}
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
              heightCourse={data.heightCourse}
              level={data.level}
              saving={saving}
              onEnrolled={message => {
                setSelectedId(null);
                reload(true);
                Alert.alert('Curso de alturas', message);
              }}
              onSave={saveProgress}
              onBlock={r => setBlocked(selected, r)}
              onMoveCrew={() => moveCrewFromBlocked(selected)}
            />
          )}
        </View>
      </Modal>

      <AddSiteSheet
        visible={sheet === 'site'}
        linkedProjectIds={data.sites.map(s => s.project_id)}
        onClose={() => setSheet(null)}
        onLinked={() => afterSheet()}
      />

      <LaborSheet visible={sheet === 'front' && !!site} onClose={() => setSheet(null)}>
        {sheet === 'front' && site && (
          <NewFrontForm site={site} fronts={list} workers={Object.values(W)} onSaved={afterSheet} />
        )}
      </LaborSheet>

      <LaborSheet visible={sheet === 'quote' && !!site} onClose={() => setSheet(null)}>
        {sheet === 'quote' && site && (
          <QuoteForm site={site} fronts={list} contractor={data.contractor} onSent={afterSheet} />
        )}
      </LaborSheet>
    </View>
  );
}

function FrontSheet({ front, siteName, people, today, setToday, reason, setReason, noCert, namesList, heightCourse, level, saving, onEnrolled, onSave, onBlock, onMoveCrew }: {
  front: Front;
  siteName: string;
  people: number;
  today: number;
  setToday: (v: number) => void;
  reason: string | null;
  setReason: (r: string) => void;
  noCert: string[];
  namesList: (ids: string[]) => string;
  heightCourse: Course | null;
  level: ProLevel;
  saving: boolean;
  onEnrolled: (message: string) => void;
  onSave: () => void;
  onBlock: (reason: string | null) => void;
  onMoveCrew: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [stopping, setStopping] = useState(false);
  const expected = Math.round(front.rate_per_person_day * people * 10) / 10;
  const remaining = Math.max(0, front.quantity - front.done);
  const daysLeft = Math.ceil(remaining / expected);
  const onPace = today >= expected * 0.9;

  return (
    <View style={styles.sheet}>
      <View style={styles.grab} />
      <ScrollView contentContainerStyle={styles.sheetContent}>
        <Text style={styles.sheetEyebrow}>{siteName}{front.item_code ? ` · ${front.item_code}` : ''}</Text>
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
              {enrolling && heightCourse ? (
                <View style={{ marginTop: 10 }}>
                  <CourseEnrollPanel course={heightCourse} level={level} people={noCert.length} workerIds={noCert} onEnrolled={onEnrolled} />
                </View>
              ) : (
                <View style={styles.recActions}>
                  {heightCourse && (
                    <TouchableOpacity style={[styles.actionButton, saving && { opacity: 0.5 }]} disabled={saving} onPress={() => setEnrolling(true)}>
                      <Text style={styles.actionText}>Inscribir al curso</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.laterButton} onPress={() => setDismissed(true)}>
                    <Text style={styles.laterText}>Entendido</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {front.blocked_reason ? (
          <View style={[styles.notice, { backgroundColor: COLORS.errorSoft }]}>
            <Text style={[styles.noticeText, { color: '#B91C1C' }]}>
              {front.blocked_reason}. Mientras, la cuadrilla puede pasar a otro frente.
            </Text>
            <View style={styles.recActions}>
              <TouchableOpacity style={styles.actionButton} onPress={onMoveCrew}>
                <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
                <Text style={styles.actionText}>Mover gente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => onBlock(null)} disabled={saving}>
                <Ionicons name="play" size={16} color={COLORS.primary} />
                <Text style={styles.actionText}>Reanudar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : front.completed ? (
          <View style={[styles.notice, { backgroundColor: COLORS.successSoft }]}>
            <Text style={[styles.noticeText, { color: '#047857' }]}>
              Terminado: {fmtQty(front.done)} de {fmtQty(front.quantity)} {front.unit}.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.compare}>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Esperado hoy ({people} pers.)</Text>
                <Text style={styles.compareValue}>{fmtQty(expected)} {front.unit}</Text>
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Real hoy</Text>
                <Text style={[styles.compareValue, { color: onPace ? COLORS.success : COLORS.warning }]}>
                  {fmtQty(today)} {front.unit}
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
          <Row label="Hecho" value={`${fmtQty(front.done)} de ${fmtQty(front.quantity)} ${front.unit}`} />
          <Row label="Precio unitario a destajo" value={`${money(front.unit_price)}/${front.unit}`} />
          <Row label="Rendimiento" value={`${fmtQty(front.rate_per_person_day)} ${front.unit}/persona/día`} />
          {!front.completed && !front.blocked_reason && <Row label="A este ritmo terminas en" value={`${daysLeft} días`} />}
          {!front.completed && !front.blocked_reason && <Row label="Lo de hoy vale" value={money(today * front.unit_price)} />}
        </View>

        {!front.blocked_reason && !front.completed && (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, styles.sheetButton, (today <= 0 || saving) && { opacity: 0.4 }]}
              onPress={onSave}
              disabled={today <= 0 || saving}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Guardar avance</Text>
            </TouchableOpacity>
            {stopping ? (
              <View style={styles.sheetCard}>
                <Text style={styles.sheetLabel}>¿Por qué se detuvo?</Text>
                <View style={styles.chipRow}>
                  {STOP_REASONS.map(r => (
                    <TouchableOpacity key={r} style={styles.chip} onPress={() => onBlock(r)} disabled={saving}>
                      <Text style={styles.chipText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity style={[styles.laterButton, { alignSelf: 'center' }]} onPress={() => setStopping(true)}>
                <Text style={styles.laterText}>Se detuvo este frente</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Conceptos del catálogo de la obra que todavía no son frente (con buscador).
function ConceptPicker({ siteId, exclude, selected, onSelect }: {
  siteId: string;
  exclude: string[];
  selected: Concept | null;
  onSelect: (c: Concept | null) => void;
}) {
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    ChiefOfLaborService.getSiteConcepts(siteId)
      .then(setConcepts)
      .catch(() => setConcepts([]));
  }, [siteId]);

  if (concepts === null) return <ActivityIndicator color={COLORS.primary} />;
  const q = query.trim().toLowerCase();
  const available = concepts.filter(
    c => !exclude.includes(c.item_id) && (!q || c.description.toLowerCase().includes(q) || (c.item_code ?? '').toLowerCase().includes(q)),
  );

  if (selected) {
    return (
      <View style={styles.sheetCard}>
        <Text style={styles.sheetEyebrow}>{selected.item_code ?? 'Concepto del catálogo'}</Text>
        <Text style={styles.sheetLabel}>{selected.description}</Text>
        <Text style={styles.metaText}>
          {selected.quantity !== null ? `${fmtQty(selected.quantity)} ${selected.unit} en el catálogo de la obra` : selected.unit}
        </Text>
        <TouchableOpacity style={styles.laterButton} onPress={() => onSelect(null)}>
          <Text style={styles.laterText}>Cambiar concepto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (concepts.length === 0) {
    return (
      <Text style={styles.metaText}>
        Esta obra no tiene catálogo de conceptos en BuildI (o la constructora no lo ha compartido). Escribe el concepto abajo.
      </Text>
    );
  }

  return (
    <View style={styles.sheetCard}>
      <TextInput style={styles.searchInput} placeholder="Buscar concepto o clave" placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} />
      {available.slice(0, 30).map((c, i) => (
        <TouchableOpacity key={c.item_id} style={[styles.conceptRow, i > 0 && styles.rowBorder]} onPress={() => onSelect(c)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.conceptTitle} numberOfLines={2}>{c.description}</Text>
            <Text style={styles.metaText}>
              {[c.item_code, c.quantity !== null ? `${fmtQty(c.quantity)} ${c.unit}` : c.unit].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>
      ))}
      {available.length === 0 && <Text style={styles.metaText}>Ningún concepto con ese texto.</Text>}
    </View>
  );
}

// Nuevo frente desde el catálogo de la obra (o escrito a mano si no hay catálogo).
function NewFrontForm({ site, fronts, workers, onSaved }: {
  site: LaborSite;
  fronts: Front[];
  workers: Worker[];
  onSaved: (message?: string) => void;
}) {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('m²');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');
  const [people, setPeople] = useState(2);
  const [height, setHeight] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (c: Concept | null) => {
    setConcept(c);
    if (c) {
      setDescription(c.description);
      setUnit(c.unit || 'm²');
      setQuantity(c.quantity !== null ? String(c.quantity) : '');
    }
  };

  const qty = parseAmount(quantity);
  const unitPrice = parseAmount(price);
  const ratePerDay = parseAmount(rate);
  const ready = description.trim().length > 2 && unit.trim().length > 0 && qty !== null && unitPrice !== null && ratePerDay !== null;

  const save = async () => {
    if (!ready) return;
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.createFront({
        siteId: site.id,
        catalogItemId: concept?.item_id ?? null,
        itemCode: concept?.item_code ?? null,
        description,
        unit,
        quantity: qty!,
        unitPrice: unitPrice!,
        peopleNeeded: people,
        ratePerPersonDay: ratePerDay!,
        atHeightNote: height,
        memberIds: members,
      });
      onSaved(`${description.trim()}: ${fmtQty(qty!)} ${unit} a ${money(unitPrice!)}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={sheetStyles.eyebrow}>{site.name}</Text>
      <Text style={sheetStyles.title}>Nuevo frente</Text>
      <Text style={sheetStyles.label}>Concepto del catálogo de la obra</Text>
      <ConceptPicker siteId={site.id} exclude={fronts.map(f => f.catalog_item_id).filter((x): x is string => !!x)} selected={concept} onSelect={pick} />
      {!concept && (
        <>
          <LaborField label="O escríbelo" value={description} onChangeText={setDescription} placeholder="Ej. Muro de block 15 cm" />
          <LaborField label="Unidad" value={unit} onChangeText={setUnit} placeholder="m², m, pza…" />
        </>
      )}
      <LaborField label={`Volumen para tu cuadrilla (${unit})`} value={quantity} onChangeText={setQuantity} placeholder="Ej. 420" keyboardType="decimal-pad" />
      <LaborField label={`Tu precio a destajo ($/${unit})`} value={price} onChangeText={setPrice} placeholder="Lo que te paga la constructora" keyboardType="decimal-pad" />
      <LaborField
        label={`Rendimiento (${unit} por persona al día)`}
        value={rate}
        onChangeText={setRate}
        placeholder="Ej. 9"
        keyboardType="decimal-pad"
        hint="Con esto la app calcula cuánto deberían avanzar al día y cuándo terminan."
      />
      <Text style={sheetStyles.label}>Personas que necesita</Text>
      <Stepper value={people} onChange={setPeople} step={1} min={1} max={30} suffix={people === 1 ? 'persona' : 'personas'} />
      {workers.length > 0 && (
        <>
          <Text style={sheetStyles.label}>Quién trabaja en él</Text>
          <MultiChips options={workers.map(w => ({ value: w.id, label: w.full_name, muted: !isPresent(w) }))} values={members} onChange={setMembers} />
        </>
      )}
      <LaborField
        label="¿Es en altura? ¿Dónde? (opcional)"
        value={height}
        onChangeText={setHeight}
        placeholder="Ej. el nivel 3"
        hint="Si es a más de 1.8 m, la app te recomienda el curso de alturas para quien no lo tenga."
      />
      {error && <Text style={sheetStyles.error}>{error}</Text>}
      <SheetButton label="Crear frente" icon="add-circle" onPress={save} busy={saving} disabled={!ready} />
    </>
  );
}

// Propuesta a destajo para un concepto de la obra. La raya y la utilidad
// solo las ves tú; la constructora recibe volumen, precio, gente y días.
function QuoteForm({ site, fronts, contractor, onSent }: {
  site: LaborSite;
  fronts: Front[];
  contractor: Contractor;
  onSent: (message?: string) => void;
}) {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('m²');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState('');
  const [people, setPeople] = useState(4);
  const [wage, setWage] = useState(contractor.avg_daily_wage ? String(contractor.avg_daily_wage) : '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (c: Concept | null) => {
    setConcept(c);
    if (c) {
      setDescription(c.description);
      setUnit(c.unit || 'm²');
      setVolume(c.quantity !== null ? String(c.quantity) : '');
    }
  };

  const vol = parseAmount(volume);
  const unitPrice = parseAmount(price);
  const ratePerDay = parseAmount(rate);
  const dailyWage = parseAmount(wage);
  const days = vol && ratePerDay ? Math.ceil(vol / (ratePerDay * people)) : null;
  const amount = vol && unitPrice ? vol * unitPrice : null;
  const payroll = days && dailyWage ? days * people * dailyWage * REAL_SALARY_FACTOR : null;
  const profit = amount !== null && payroll !== null ? amount - payroll : null;
  const ready = description.trim().length > 2 && !!vol && !!unitPrice && !!days;
  const builder = site.builder_name ?? 'la constructora';

  const send = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    try {
      await ChiefOfLaborService.sendQuote({
        siteId: site.id,
        catalogItemId: concept?.item_id ?? null,
        description,
        unit,
        volume: vol!,
        people,
        unitPrice: unitPrice!,
        estDays: days!,
      });
      if (dailyWage && dailyWage !== contractor.avg_daily_wage) {
        await ChiefOfLaborService.updateContractor(contractor.id, { avg_daily_wage: dailyWage }).catch(() => undefined);
      }
      onSent(`${description.trim()}: ${fmtQty(vol!)} ${unit} a ${money(unitPrice!)} para ${builder}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar.');
      setSending(false);
    }
  };

  return (
    <>
      <Text style={sheetStyles.eyebrow}>Propuesta para {builder} · {site.name}</Text>
      <Text style={sheetStyles.title}>Cotizar concepto</Text>
      <ConceptPicker siteId={site.id} exclude={fronts.map(f => f.catalog_item_id).filter((x): x is string => !!x)} selected={concept} onSelect={pick} />
      {!concept && (
        <>
          <LaborField label="Concepto" value={description} onChangeText={setDescription} placeholder="Ej. Aplanado fino en muros" />
          <LaborField label="Unidad" value={unit} onChangeText={setUnit} placeholder="m², m, pza…" />
        </>
      )}
      <LaborField label={`Volumen (${unit})`} value={volume} onChangeText={setVolume} placeholder="Ej. 840" keyboardType="decimal-pad" />
      <LaborField label={`Tu precio unitario ($/${unit})`} value={price} onChangeText={setPrice} placeholder="Ej. 95" keyboardType="decimal-pad" />
      <LaborField label={`Rendimiento (${unit} por persona al día)`} value={rate} onChangeText={setRate} placeholder="Ej. 16" keyboardType="decimal-pad" />
      <Text style={sheetStyles.label}>Personas en el frente</Text>
      <Stepper value={people} onChange={setPeople} step={1} min={1} max={30} suffix="" />
      <LaborField
        label="Raya promedio por persona al día"
        value={wage}
        onChangeText={setWage}
        placeholder="Lo que pagas al día"
        keyboardType="decimal-pad"
        hint="Solo la ves tú. Se guarda para tus siguientes cotizaciones."
      />

      <View style={styles.sheetCard}>
        <Row label="Duración" value={days ? `${days} días con ${people}` : '—'} />
        <Row label="Importe" value={amount !== null ? money(amount) : '—'} />
        <Row label={`Raya con IMSS y prestaciones (×${REAL_SALARY_FACTOR})`} value={payroll !== null ? `−${money(payroll)}` : '—'} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tu utilidad</Text>
          <Text style={[styles.totalValue, { color: profit === null ? COLORS.muted : profit > 0 ? COLORS.success : COLORS.error }]}>
            {profit !== null ? money(profit) : '—'}
          </Text>
        </View>
      </View>
      {error && <Text style={sheetStyles.error}>{error}</Text>}
      <SheetButton label="Enviar propuesta" icon="send" onPress={send} busy={sending} disabled={!ready} />
    </>
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
  primaryButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, margin: 20, marginBottom: 0, borderRadius: 12, gap: 8 },
  sheetButton: { margin: 0 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  outlineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 20, marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primaryLight, backgroundColor: COLORS.card },
  outlineButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
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
  laterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.divider, alignSelf: 'flex-start' },
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
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.divider },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 2 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
  searchInput: { height: 44, borderRadius: 10, backgroundColor: COLORS.background, paddingHorizontal: 12, fontSize: 15, color: COLORS.text },
  conceptRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  conceptTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
});
