import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Share, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import {
  BadgeScanLog,
  ChiefOfLaborService,
  Contractor,
  Course,
  Crew,
  CredentialType,
  Enrollment,
  RecommendationAction,
  Worker,
  WorkerLevel,
  badgeVerifyUrl,
  formatDate,
  formatDayTime,
  isExpiringSoon,
} from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';

// Cuadrillas y gafete digital de cada trabajador: sus constancias (BuildI,
// DC-3 de la STPS, CONOCER), un QR que abre la verificación pública
// (labor_verify_badge), las obras donde ha trabajado y recomendaciones
// (no bloqueos). Datos en Supabase: tablas labor_*.

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface CrewData {
  contractor: Contractor;
  crews: Crew[];
  workers: Worker[];
  courses: Course[];
  enrollments: Enrollment[];
  actions: RecommendationAction[];
  lastScans: Record<string, BadgeScanLog>;
}

interface Recommendation {
  key: string;
  icon: IconName;
  color: string;
  title: string;
  text: string;
  action: string;
  kind: 'imss' | 'enroll';
  courseId?: string;
  done: string;
}

const TYPE_STYLE: Record<CredentialType, { label: string; color: string; bg: string }> = {
  buildi: { label: 'Constancia BuildI', color: '#2563EB', bg: '#EBF4FF' },
  dc3: { label: 'DC-3 · STPS', color: '#B45309', bg: '#FEF3C7' },
  conocer: { label: 'Certificado CONOCER', color: '#047857', bg: '#D1FAE5' },
};

const LEVEL_LABEL: Record<WorkerLevel, string> = { ayudante: 'Ayudante', oficial: 'Oficial', maestro: 'Maestro' };

// Recomendaciones: la app sugiere, el contratista decide.
function recommendationsFor(w: Worker, data: CrewData): Recommendation[] {
  const crew = data.crews.find(c => c.id === w.crew_id);
  const has = (courseId: string) => w.credentials.some(c => c.course_id === courseId);
  const enrolled = (courseId: string) => data.enrollments.some(e => e.worker_id === w.id && e.course_id === courseId);
  const handled = (key: string) => data.actions.some(a => a.worker_id === w.id && a.rec_key === key);
  const title = (courseId: string) => data.courses.find(c => c.id === courseId)?.title ?? courseId;
  const recs: Recommendation[] = [];
  if (!w.imss_registered) {
    recs.push({ key: 'imss', kind: 'imss', icon: 'alert-circle', color: '#EF4444', title: 'Dar de alta en IMSS', text: 'Las constructoras piden que todos estén dados de alta. Te recomendamos hacerlo antes de su siguiente turno.', action: 'Dar de alta', done: 'Alta en IMSS registrada.' });
  }
  if (crew?.height_note && !has('alturas') && !enrolled('alturas')) {
    recs.push({ key: 'alturas', kind: 'enroll', courseId: 'alturas', icon: 'warning', color: '#F59E0B', title: 'Curso de trabajo en alturas', text: `Su cuadrilla trabaja en ${crew.height_note}. Te recomendamos la DC-3 de alturas (NOM-009) o asignarlo a un frente a nivel de piso.`, action: 'Inscribir', done: 'Inscrito al curso del sábado.' });
  }
  w.credentials
    .filter(c => isExpiringSoon(c.renew_on) && !enrolled(c.course_id))
    .forEach(c => {
      recs.push({ key: `renovar:${c.course_id}`, kind: 'enroll', courseId: c.course_id, icon: 'time', color: '#F59E0B', title: `Renovar: ${title(c.course_id)}`, text: `Se recomienda revalidar antes del ${formatDate(c.renew_on)}.`, action: 'Renovar', done: 'Inscrito a la renovación.' });
    });
  if (!has('seguridad') && !enrolled('seguridad')) {
    recs.push({ key: 'seguridad', kind: 'enroll', courseId: 'seguridad', icon: 'school', color: '#2563EB', title: title('seguridad'), text: 'Curso gratis de 2 h en la app, sin internet.', action: 'Inscribir', done: 'Le llegó el curso por WhatsApp.' });
  }
  return recs.filter(r => !handled(r.key));
}

async function loadCrewData(): Promise<CrewData> {
  const [contractor, crews, workers, courses, enrollments, actions, lastScans] = await Promise.all([
    ChiefOfLaborService.getContractor(),
    ChiefOfLaborService.getCrews(),
    ChiefOfLaborService.getWorkers(),
    ChiefOfLaborService.getCourses(),
    ChiefOfLaborService.getEnrollments(),
    ChiefOfLaborService.getRecommendationActions(),
    ChiefOfLaborService.getLastScans(),
  ]);
  if (!contractor) throw new Error('No hay contratista.');
  return { contractor, crews, workers, courses, enrollments, actions, lastScans };
}

export default function CrewManager() {
  const { state, reload } = useLaborData(loadCrewData);
  return (
    <LaborDataGate title="Cuadrillas" state={state} reload={reload}>
      {data => <CrewScreen data={data} reload={reload} />}
    </LaborDataGate>
  );
}

function CrewScreen({ data, reload }: { data: CrewData; reload: (silent?: boolean) => Promise<void> }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCrew, setOpenCrew] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { crews, workers } = data;
  const badge = workers.find(w => w.id === badgeId) ?? null;

  const query = searchQuery.trim().toLowerCase();
  const matches = useMemo(
    () => (query ? workers.filter(w => w.full_name.toLowerCase().includes(query) || w.trade.toLowerCase().includes(query)) : []),
    [query, workers],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'break': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const avgEfficiency = crews.length ? Math.round(crews.reduce((a, c) => a + c.efficiency, 0) / crews.length) : 0;

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuadrillas</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Agregar trabajador', 'Abriría el alta con su INE, IMSS y oficio.')}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar trabajador u oficio..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{crews.filter(c => c.status === 'active').length}</Text>
            <Text style={styles.summaryLabel}>Cuadrillas activas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{workers.length}</Text>
            <Text style={styles.summaryLabel}>Trabajadores</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgEfficiency}%</Text>
            <Text style={styles.summaryLabel}>Rendimiento prom.</Text>
          </View>
        </View>

        {query ? (
          <View style={styles.crewsList}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            <View style={styles.crewCard}>
              {matches.length ? (
                matches.map((w, i) => <WorkerRow key={w.id} worker={w} recs={recommendationsFor(w, data).length} first={i === 0} onPress={() => setBadgeId(w.id)} />)
              ) : (
                <Text style={styles.detailText}>Nadie con ese nombre u oficio.</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.crewsList}>
            {crews.map(crew => {
              const members = workers.filter(w => w.crew_id === crew.id);
              const lead = workers.find(w => w.id === crew.lead_worker_id);
              const recs = members.reduce((a, w) => a + recommendationsFor(w, data).length, 0);
              const open = openCrew === crew.id;
              return (
                <View key={crew.id} style={styles.crewCard}>
                  <View style={styles.crewHeader}>
                    <View style={styles.crewInfo}>
                      <Text style={styles.crewName}>{crew.name}</Text>
                      <Text style={styles.crewLeader}>{lead ? `Cabo: ${lead.full_name}` : 'Sin cabo asignado'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crew.status) }]}>
                      <Text style={styles.statusText}>{crew.status === 'active' ? 'ACTIVA' : crew.status === 'break' ? 'EN DESCANSO' : 'INACTIVA'}</Text>
                    </View>
                  </View>

                  <View style={styles.crewDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{members.length} trabajadores</Text>
                    </View>
                    {crew.site_label ? (
                      <View style={styles.detailItem}>
                        <Ionicons name="construct" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{crew.site_label}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailItem}>
                      <Ionicons name="trending-up" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{crew.efficiency}% de rendimiento</Text>
                    </View>
                    {recs > 0 && (
                      <View style={styles.detailItem}>
                        <Ionicons name="bulb" size={16} color="#F59E0B" />
                        <Text style={[styles.detailText, { color: '#B45309' }]}>
                          {recs} {recs === 1 ? 'recomendación' : 'recomendaciones'} para tu gente
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.crewActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setOpenCrew(open ? null : crew.id)}>
                      <Ionicons name={open ? 'chevron-up' : 'id-card'} size={16} color="#2563EB" />
                      <Text style={styles.actionText}>{open ? 'Ocultar' : 'Gafetes'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert(crew.name, 'Abriría la edición de la cuadrilla.')}>
                      <Ionicons name="create" size={16} color="#2563EB" />
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                  </View>

                  {open && (
                    <View style={styles.memberList}>
                      {members.map((w, i) => (
                        <WorkerRow key={w.id} worker={w} recs={recommendationsFor(w, data).length} first={i === 0} onPress={() => setBadgeId(w.id)} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!badge} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBadgeId(null)}>
        {badge && <BadgeSheet worker={badge} data={data} reload={reload} onClose={() => setBadgeId(null)} />}
      </Modal>
    </View>
  );
}

function Avatar({ worker, size }: { worker: Worker; size: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: worker.color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{worker.code}</Text>
    </View>
  );
}

function WorkerRow({ worker, recs, first, onPress }: { worker: Worker; recs: number; first: boolean; onPress: () => void }) {
  const n = worker.credentials.length;
  return (
    <TouchableOpacity style={[styles.workerRow, !first && styles.rowBorder]} onPress={onPress}>
      <Avatar worker={worker} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.workerName}>{worker.full_name}</Text>
        <Text style={styles.workerMeta}>
          {worker.trade} · {n} {n === 1 ? 'constancia' : 'constancias'}
        </Text>
      </View>
      {recs > 0 && (
        <View style={styles.recDot}>
          <Text style={styles.recDotText}>{recs}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function BadgeSheet({ worker, data, reload, onClose }: { worker: Worker; data: CrewData; reload: (silent?: boolean) => Promise<void>; onClose: () => void }) {
  const crew = data.crews.find(c => c.id === worker.crew_id);
  const [busy, setBusy] = useState<string | null>(null);
  const recs = recommendationsFor(worker, data);
  const courseTitle = (id: string) => data.courses.find(c => c.id === id);
  const verifyUrl = badgeVerifyUrl(worker.verify_code);

  const act = async (r: Recommendation, choice: 'done' | 'later') => {
    setBusy(r.key);
    try {
      if (choice === 'done') {
        if (r.kind === 'imss') await ChiefOfLaborService.markImssRegistered(worker.id);
        else if (r.courseId) await ChiefOfLaborService.enroll(r.courseId, [worker.id]);
      }
      await ChiefOfLaborService.setRecommendationAction(worker.id, r.key, choice);
      await reload(true);
      if (choice === 'done') Alert.alert(r.action, r.done);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  const share = () => {
    Share.share({
      message: `Gafete BuildI de ${worker.full_name} (${worker.trade}). Verifícalo aquí: ${verifyUrl}`,
    }).catch(() => undefined);
  };

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Gafete</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.sheetDone}>Listo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.sheetContent}>
        <View style={styles.badgeCard}>
          <View style={styles.badgeBand}>
            <Text style={styles.badgeBrand}>BuildI · Gafete digital</Text>
            <Text style={styles.badgeBandMeta}>{worker.imss_registered ? 'Verificado' : 'Falta IMSS'}</Text>
          </View>
          <View style={styles.badgeBody}>
            <Avatar worker={worker} size={72} />
            <Text style={styles.badgeName}>{worker.full_name}</Text>
            <Text style={styles.badgeTrade}>{worker.trade}</Text>
            <View style={styles.badgeChips}>
              <View style={[styles.chip, { backgroundColor: '#EBF4FF' }]}>
                <Text style={[styles.chipText, { color: '#2563EB' }]}>{LEVEL_LABEL[worker.level]}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: worker.imss_registered ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.chipText, { color: worker.imss_registered ? '#047857' : '#B91C1C' }]}>{worker.imss_registered ? 'IMSS vigente' : 'Sin IMSS'}</Text>
              </View>
              {worker.joined_year ? (
                <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.chipText, { color: '#374151' }]}>Desde {worker.joined_year}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.badgeCrew}>{crew ? `${crew.name} · ` : ''}{data.contractor.business_name}</Text>
            <View style={styles.qr}>
              <QRCode value={verifyUrl} size={132} color="#111827" backgroundColor="#FFFFFF" />
            </View>
            <Text style={styles.badgeCode}>{worker.verify_code}</Text>
            <Text style={styles.badgeHint}>El residente lo escanea desde la app de constructor para ver sus constancias y registrar su entrada.</Text>
            {data.lastScans[worker.id] && (
              <View style={styles.lastScan}>
                <Ionicons name={data.lastScans[worker.id].checked_in ? 'log-in' : 'eye'} size={16} color="#047857" />
                <Text style={styles.lastScanText}>
                  {data.lastScans[worker.id].checked_in
                    ? `Entrada registrada ${formatDayTime(data.lastScans[worker.id].checked_in_at ?? data.lastScans[worker.id].scanned_at)} · ${data.lastScans[worker.id].site_name ?? ''}`
                    : `Verificado en obra ${formatDayTime(data.lastScans[worker.id].scanned_at)}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {recs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            {recs.map(r => (
              <View key={r.key} style={styles.recCard}>
                <View style={[styles.recIcon, { backgroundColor: r.color + '22' }]}>
                  <Ionicons name={r.icon} size={20} color={r.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{r.title}</Text>
                  <Text style={styles.recText}>{r.text}</Text>
                  <View style={styles.recActions}>
                    <TouchableOpacity style={[styles.actionButton, busy === r.key && { opacity: 0.5 }]} disabled={busy === r.key} onPress={() => act(r, 'done')}>
                      <Text style={styles.actionText}>{r.action}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.laterButton} disabled={busy === r.key} onPress={() => act(r, 'later')}>
                      <Text style={styles.laterText}>Después</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Constancias</Text>
        {worker.credentials.length ? (
          worker.credentials.map(c => {
            const course = courseTitle(c.course_id);
            const t = TYPE_STYLE[course?.credential_type ?? 'buildi'];
            const soon = isExpiringSoon(c.renew_on);
            return (
              <View key={c.id} style={styles.credCard}>
                <View style={styles.credTop}>
                  <View style={[styles.chip, { backgroundColor: t.bg }]}>
                    <Text style={[styles.chipText, { color: t.color }]}>{t.label}</Text>
                  </View>
                  <Text style={[styles.credStatus, { color: soon ? '#B45309' : '#047857' }]}>{soon ? 'Por renovar' : 'Vigente'}</Text>
                </View>
                <Text style={styles.credTitle}>{course?.title ?? c.course_id}</Text>
                {course ? <Text style={styles.credMeta}>{course.issuer}</Text> : null}
                <Text style={styles.credMeta}>
                  Folio {c.folio} · {formatDate(c.issued_on)}{c.renew_on ? ` · renovar ${formatDate(c.renew_on)}` : ' · sin vencimiento'}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.credCard}>
            <Text style={styles.credMeta}>Todavía no tiene constancias. Empieza con Seguridad básica en obra: es gratis.</Text>
          </View>
        )}

        {worker.sites.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Obras con BuildI</Text>
            <View style={styles.credCard}>
              {worker.sites.map((s, i) => (
                <View key={`${s.site_name}-${s.year}`} style={[styles.siteRow, i > 0 && styles.rowBorder]}>
                  <Ionicons name="business" size={18} color="#6B7280" />
                  <Text style={styles.detailText}>{s.site_name} · {s.year}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={share}>
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Compartir gafete</Text>
        </TouchableOpacity>
      </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    ...cardShadow,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    ...cardShadow,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  crewsList: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  crewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  crewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  crewLeader: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  crewDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  crewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  memberList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  workerMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  recDot: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  recDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 48,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    ...cardShadow,
  },
  badgeBand: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  badgeBrand: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  badgeBandMeta: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '500',
  },
  badgeBody: {
    alignItems: 'center',
    padding: 20,
    gap: 6,
  },
  badgeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },
  badgeTrade: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },
  badgeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeCrew: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  qr: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  badgeCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 1,
    marginTop: 6,
  },
  lastScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  lastScanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  badgeHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  recCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    ...cardShadow,
  },
  recIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recText: {
    fontSize: 13,
    color: '#374151',
  },
  recActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  laterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  laterText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  credCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  credTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  credTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  credMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
