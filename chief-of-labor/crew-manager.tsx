import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Share, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import {
  AttendanceStatus,
  BadgeScanLog,
  ChiefOfLaborService,
  Contractor,
  Course,
  Crew,
  CredentialType,
  Enrollment,
  LaborSite,
  ProLevel,
  RecommendationAction,
  Worker,
  WorkerLevel,
  badgeVerifyUrl,
  credentialState,
  formatDate,
  formatDayTime,
  hasValidCertificate,
  isExpiringSoon,
} from '@/app/services/ChiefOfLaborService';
import { LaborDataGate, useLaborData } from '@/app/components/LaborDataState';
import { Chips, CourseEnrollPanel, LaborField, LaborSheet, SheetButton, sheetStyles } from '@/app/components/LaborSheets';

// Cuadrillas y gafete digital de cada trabajador: sus constancias (BuildI,
// DC-3 de la STPS, CONOCER), un QR que verifica el residente desde la app
// de constructor, las obras donde ha trabajado y recomendaciones (no
// bloqueos). Aquí se da de alta a la gente, se arman las cuadrillas y se
// pasa lista con el día de cada obra. Datos en Supabase: tablas labor_*.

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface CrewData {
  contractor: Contractor;
  sites: LaborSite[];
  crews: Crew[];
  workers: Worker[];
  courses: Course[];
  enrollments: Enrollment[];
  actions: RecommendationAction[];
  lastScans: Record<string, BadgeScanLog>;
  level: ProLevel;
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
}

const TYPE_STYLE: Record<CredentialType, { label: string; color: string; bg: string }> = {
  buildi: { label: 'Constancia BuildI', color: '#2563EB', bg: '#EBF4FF' },
  dc3: { label: 'DC-3 · STPS', color: '#B45309', bg: '#FEF3C7' },
  conocer: { label: 'Certificado CONOCER', color: '#047857', bg: '#D1FAE5' },
};

const LEVEL_LABEL: Record<WorkerLevel, string> = { ayudante: 'Ayudante', oficial: 'Oficial', maestro: 'Maestro' };
const LEVEL_OPTIONS = (Object.keys(LEVEL_LABEL) as WorkerLevel[]).map(value => ({ value, label: LEVEL_LABEL[value] }));
const TRADES = ['Albañil', 'Ayudante general', 'Yesero', 'Pintor', 'Tablaroquero', 'Pisero', 'Electricista', 'Plomero', 'Herrero', 'Carpintero'];
const CURP_PATTERN = /^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HMX][A-Z]{5}[A-Z0-9][0-9]$/;

const isPresent = (w: Worker) => w.attendance === 'present' || w.attendance === 'late';
const activeEnrollment = (data: CrewData, workerId: string, courseId: string) =>
  data.enrollments.some(e => e.worker_id === workerId && e.course_id === courseId && (e.status === 'enrolled' || e.status === 'attended'));

// Recomendaciones: la app sugiere, el contratista decide.
function recommendationsFor(w: Worker, data: CrewData): Recommendation[] {
  const crew = data.crews.find(c => c.id === w.crew_id);
  const handled = (key: string) => data.actions.some(a => a.worker_id === w.id && a.rec_key === key);
  const course = (courseId: string) => data.courses.find(c => c.id === courseId);
  const recs: Recommendation[] = [];
  if (!w.imss_registered) {
    recs.push({ key: 'imss', kind: 'imss', icon: 'alert-circle', color: '#EF4444', title: 'Dar de alta en IMSS', text: 'Las constructoras piden que todos estén dados de alta. Te recomendamos hacerlo antes de su siguiente turno.', action: 'Ya está dado de alta' });
  }
  if (crew?.height_note && course('alturas') && !hasValidCertificate(w, 'alturas') && !activeEnrollment(data, w.id, 'alturas')) {
    recs.push({ key: 'alturas', kind: 'enroll', courseId: 'alturas', icon: 'warning', color: '#F59E0B', title: 'Curso de trabajo en alturas', text: `Su cuadrilla trabaja en ${crew.height_note}. Te recomendamos la DC-3 de alturas (NOM-009) o asignarlo a un frente a nivel de piso.`, action: 'Inscribir' });
  }
  w.credentials
    .filter(c => c.status === 'valid' && isExpiringSoon(c.expires_on) && course(c.course_id) && !activeEnrollment(data, w.id, c.course_id))
    .forEach(c => {
      recs.push({ key: `renovar:${c.course_id}`, kind: 'enroll', courseId: c.course_id, icon: 'time', color: '#F59E0B', title: `Renovar: ${course(c.course_id)?.title}`, text: `Se recomienda revalidar antes del ${formatDate(c.expires_on)}.`, action: 'Renovar' });
    });
  if (course('seguridad') && !w.credentials.some(c => c.course_id === 'seguridad') && !activeEnrollment(data, w.id, 'seguridad')) {
    recs.push({ key: 'seguridad', kind: 'enroll', courseId: 'seguridad', icon: 'school', color: '#2563EB', title: course('seguridad')!.title, text: `Curso gratis de ${course('seguridad')!.hours_label} en la app, sin internet.`, action: 'Inscribir' });
  }
  return recs.filter(r => !handled(r.key));
}

async function loadCrewData(): Promise<CrewData> {
  const [contractor, sites, crews, courses, enrollments, actions, lastScans, score] = await Promise.all([
    ChiefOfLaborService.getContractor(),
    ChiefOfLaborService.getSites(),
    ChiefOfLaborService.getCrews(),
    ChiefOfLaborService.getCourses(),
    ChiefOfLaborService.getEnrollments(),
    ChiefOfLaborService.getRecommendationActions(),
    ChiefOfLaborService.getLastScans(),
    ChiefOfLaborService.getScore(),
  ]);
  if (!contractor) throw new Error('No hay contratista.');
  const workers = await ChiefOfLaborService.getWorkers(sites);
  return { contractor, sites, crews, workers, courses, enrollments, actions, lastScans, level: score.level };
}

export default function CrewManager() {
  const { state, reload } = useLaborData(loadCrewData);
  return (
    <LaborDataGate title="Cuadrillas" state={state} reload={reload}>
      {data => <CrewScreen data={data} reload={reload} />}
    </LaborDataGate>
  );
}

type SheetState =
  | { kind: 'menu' }
  | { kind: 'worker' }
  | { kind: 'crew'; crew: Crew | null }
  | { kind: 'attendance'; crew: Crew | null };

function CrewScreen({ data, reload }: { data: CrewData; reload: (silent?: boolean) => Promise<void> }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCrew, setOpenCrew] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { crews, workers } = data;
  const badge = workers.find(w => w.id === badgeId) ?? null;
  const siteName = (id: string | null) => data.sites.find(s => s.id === id)?.name ?? null;
  const unassigned = workers.filter(w => !w.crew_id || !crews.some(c => c.id === w.crew_id));

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

  const refresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  const saved = async (message?: string) => {
    setSheet(null);
    await reload(true);
    if (message) Alert.alert('Listo', message);
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuadrillas</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setSheet({ kind: 'menu' })} accessibilityLabel="Agregar">
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
            <Text style={styles.summaryValue}>{workers.filter(isPresent).length}</Text>
            <Text style={styles.summaryLabel}>Llegaron hoy</Text>
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
            {crews.length === 0 && (
              <View style={[styles.crewCard, styles.emptyCard]}>
                <Ionicons name="people" size={32} color="#2563EB" />
                <Text style={styles.crewName}>Arma tu primera cuadrilla</Text>
                <Text style={styles.emptyText}>Dale un nombre, elige la obra donde trabaja y después agrega a tu gente.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setSheet({ kind: 'crew', crew: null })}>
                  <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Nueva cuadrilla</Text>
                </TouchableOpacity>
              </View>
            )}
            {crews.map(crew => {
              const members = workers.filter(w => w.crew_id === crew.id);
              const lead = workers.find(w => w.id === crew.lead_worker_id);
              const recs = members.reduce((a, w) => a + recommendationsFor(w, data).length, 0);
              const open = openCrew === crew.id;
              const site = siteName(crew.labor_site_id);
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
                      <Text style={styles.detailText}>{members.length} {members.length === 1 ? 'trabajador' : 'trabajadores'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="construct" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{site ?? 'Sin obra asignada'}</Text>
                    </View>
                    {members.length > 0 && (
                      <View style={styles.detailItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{members.filter(isPresent).length} de {members.length} llegaron hoy</Text>
                      </View>
                    )}
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
                    {members.length > 0 && (
                      <TouchableOpacity style={styles.actionButton} onPress={() => setSheet({ kind: 'attendance', crew })}>
                        <Ionicons name="checkbox" size={16} color="#2563EB" />
                        <Text style={styles.actionText}>Pase de lista</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.actionButton} onPress={() => setSheet({ kind: 'crew', crew })}>
                      <Ionicons name="create" size={16} color="#2563EB" />
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                  </View>

                  {open && (
                    <View style={styles.memberList}>
                      {members.length ? (
                        members.map((w, i) => (
                          <WorkerRow key={w.id} worker={w} recs={recommendationsFor(w, data).length} first={i === 0} onPress={() => setBadgeId(w.id)} />
                        ))
                      ) : (
                        <TouchableOpacity style={styles.workerRow} onPress={() => setSheet({ kind: 'worker' })}>
                          <Ionicons name="person-add" size={20} color="#2563EB" />
                          <Text style={[styles.detailText, { color: '#2563EB' }]}>Agregar a alguien a esta cuadrilla</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
            {unassigned.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Sin cuadrilla</Text>
                <View style={styles.crewCard}>
                  {unassigned.map((w, i) => (
                    <WorkerRow key={w.id} worker={w} recs={recommendationsFor(w, data).length} first={i === 0} onPress={() => setBadgeId(w.id)} />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!badge} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBadgeId(null)}>
        {badge && <BadgeSheet worker={badge} data={data} reload={reload} onClose={() => setBadgeId(null)} />}
      </Modal>

      <LaborSheet visible={sheet?.kind === 'menu'} onClose={() => setSheet(null)}>
        <Text style={sheetStyles.title}>Agregar</Text>
        <View style={sheetStyles.card}>
          <MenuRow icon="person-add" title="Trabajador" text="Su nombre, oficio, cuadrilla e IMSS. El gafete sale al guardar." onPress={() => setSheet({ kind: 'worker' })} />
          <MenuRow icon="people" title="Cuadrilla" text="Un grupo con su obra y su cabo." onPress={() => setSheet({ kind: 'crew', crew: null })} border />
        </View>
      </LaborSheet>

      <LaborSheet visible={sheet?.kind === 'worker'} onClose={() => setSheet(null)}>
        {sheet?.kind === 'worker' && <WorkerForm data={data} onSaved={saved} />}
      </LaborSheet>

      <LaborSheet visible={sheet?.kind === 'crew'} onClose={() => setSheet(null)}>
        {sheet?.kind === 'crew' && <CrewForm data={data} crew={sheet.crew} onSaved={saved} />}
      </LaborSheet>

      <LaborSheet visible={sheet?.kind === 'attendance'} onClose={() => setSheet(null)}>
        {sheet?.kind === 'attendance' && <AttendanceForm data={data} crew={sheet.crew} onSaved={saved} />}
      </LaborSheet>
    </View>
  );
}

function MenuRow({ icon, title, text, onPress, border }: { icon: IconName; title: string; text: string; onPress: () => void; border?: boolean }) {
  return (
    <TouchableOpacity style={[styles.workerRow, border && styles.rowBorder]} onPress={onPress}>
      <View style={[styles.recIcon, { backgroundColor: '#EBF4FF' }]}>
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.workerName}>{title}</Text>
        <Text style={styles.workerMeta}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

// Alta de un trabajador.
function WorkerForm({ data, onSaved }: { data: CrewData; onSaved: (message?: string) => void }) {
  const [name, setName] = useState('');
  const [trade, setTrade] = useState<string | null>(null);
  const [otherTrade, setOtherTrade] = useState('');
  const [level, setLevel] = useState<WorkerLevel>('ayudante');
  const [crewId, setCrewId] = useState<string>(data.crews[0]?.id ?? 'none');
  const [imss, setImss] = useState<'yes' | 'no'>('yes');
  const [curp, setCurp] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tradeValue = trade === 'Otro' ? otherTrade.trim() : trade ?? '';
  const curpValue = curp.trim().toUpperCase();
  const curpOk = !curpValue || CURP_PATTERN.test(curpValue);
  const ready = name.trim().split(/\s+/).length >= 2 && tradeValue.length > 1 && curpOk;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.addWorker(
        { full_name: name, trade: tradeValue, level, crew_id: crewId === 'none' ? null : crewId, imss_registered: imss === 'yes', curp: curpValue || null },
        data.workers.length,
      );
      onSaved(`${name.trim()} ya tiene su gafete BuildI.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={sheetStyles.eyebrow}>{data.contractor.business_name}</Text>
      <Text style={sheetStyles.title}>Nuevo trabajador</Text>
      <LaborField label="Nombre completo" value={name} onChangeText={setName} placeholder="Nombre y apellidos" autoCapitalize="words" />
      <Text style={sheetStyles.label}>Oficio</Text>
      <Chips options={[...TRADES, 'Otro'].map(t => ({ value: t, label: t }))} value={trade} onChange={setTrade} />
      {trade === 'Otro' && <LaborField label="¿Cuál?" value={otherTrade} onChangeText={setOtherTrade} placeholder="Ej. Impermeabilizador" />}
      <Text style={sheetStyles.label}>Nivel</Text>
      <Chips options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
      <Text style={sheetStyles.label}>Cuadrilla</Text>
      <Chips options={[...data.crews.map(c => ({ value: c.id, label: c.name })), { value: 'none', label: 'Sin cuadrilla' }]} value={crewId} onChange={setCrewId} />
      <Text style={sheetStyles.label}>¿Tiene alta en el IMSS?</Text>
      <Chips options={[{ value: 'yes' as const, label: 'Sí' }, { value: 'no' as const, label: 'Todavía no' }]} value={imss} onChange={setImss} />
      <LaborField
        label="CURP (opcional)"
        value={curp}
        onChangeText={setCurp}
        placeholder="18 caracteres"
        autoCapitalize="characters"
        hint={curpOk ? 'Va en su DC-3 cuando tome un curso de la STPS.' : 'Revisa la CURP: son 18 letras y números.'}
      />
      {error && <Text style={sheetStyles.error}>{error}</Text>}
      <SheetButton label="Guardar y crear gafete" icon="id-card" onPress={save} busy={saving} disabled={!ready} />
    </>
  );
}

// Nueva cuadrilla o editar una.
function CrewForm({ data, crew, onSaved }: { data: CrewData; crew: Crew | null; onSaved: (message?: string) => void }) {
  const activeSites = data.sites.filter(s => s.active);
  const members = crew ? data.workers.filter(w => w.crew_id === crew.id) : [];
  const [name, setName] = useState(crew?.name ?? '');
  const [siteId, setSiteId] = useState<string>(crew?.labor_site_id ?? activeSites[0]?.id ?? 'none');
  const [heightNote, setHeightNote] = useState(crew?.height_note ?? '');
  const [status, setStatus] = useState<Crew['status']>(crew?.status ?? 'active');
  const [leadId, setLeadId] = useState<string>(crew?.lead_worker_id ?? 'none');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const fields = {
      name: name.trim(),
      labor_site_id: siteId === 'none' ? null : siteId,
      height_note: heightNote.trim() || null,
    };
    try {
      if (crew) await ChiefOfLaborService.updateCrew(crew.id, { ...fields, status, lead_worker_id: leadId === 'none' ? null : leadId });
      else await ChiefOfLaborService.createCrew(fields);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={sheetStyles.title}>{crew ? 'Editar cuadrilla' : 'Nueva cuadrilla'}</Text>
      <LaborField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Cuadrilla Albañilería" />
      <Text style={sheetStyles.label}>Obra</Text>
      {activeSites.length ? (
        <Chips options={[...activeSites.map(s => ({ value: s.id, label: s.name })), { value: 'none', label: 'Sin obra' }]} value={siteId} onChange={setSiteId} />
      ) : (
        <Text style={styles.workerMeta}>Agrega tus obras en la pestaña Frentes y aquí podrás elegirlas.</Text>
      )}
      <LaborField
        label="¿Trabaja en altura? ¿Dónde?"
        value={heightNote}
        onChangeText={setHeightNote}
        placeholder="Ej. el nivel 3 o andamios a 2.5 m"
        hint="Si trabaja a más de 1.8 m, la app te recomienda el curso de alturas para quien no lo tenga."
      />
      {crew && (
        <>
          <Text style={sheetStyles.label}>Estado</Text>
          <Chips
            options={[
              { value: 'active' as const, label: 'Activa' },
              { value: 'break' as const, label: 'En descanso' },
              { value: 'inactive' as const, label: 'Inactiva' },
            ]}
            value={status}
            onChange={setStatus}
          />
          {members.length > 0 && (
            <>
              <Text style={sheetStyles.label}>Cabo</Text>
              <Chips options={[...members.map(w => ({ value: w.id, label: w.full_name })), { value: 'none', label: 'Sin cabo' }]} value={leadId} onChange={setLeadId} />
            </>
          )}
        </>
      )}
      {error && <Text style={sheetStyles.error}>{error}</Text>}
      <SheetButton label="Guardar" onPress={save} busy={saving} disabled={name.trim().length < 2} />
    </>
  );
}

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Llegó' },
  { value: 'late', label: 'Tarde' },
  { value: 'absent', label: 'Faltó' },
];

// Pase de lista: el día y la hora son los de la obra de la cuadrilla.
function AttendanceForm({ data, crew, onSaved }: { data: CrewData; crew: Crew | null; onSaved: (message?: string) => void }) {
  const activeSites = data.sites.filter(s => s.active);
  const members = data.workers.filter(w => (crew ? w.crew_id === crew.id : true));
  const [siteId, setSiteId] = useState<string | null>(crew?.labor_site_id ?? activeSites[0]?.id ?? null);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(members.filter(w => w.attendance).map(w => [w.id, w.attendance as AttendanceStatus])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const site = data.sites.find(s => s.id === siteId) ?? null;

  const save = async () => {
    if (!site) return;
    setSaving(true);
    setError(null);
    try {
      const editable = members.filter(w => w.attendance_source !== 'scan' && marks[w.id]);
      for (const status of ['present', 'late', 'absent'] as AttendanceStatus[]) {
        await ChiefOfLaborService.markAttendance(editable.filter(w => marks[w.id] === status).map(w => w.id), site.id, status);
      }
      onSaved(`Pase de lista del ${formatDate(site.local_date)} guardado.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <>
      <Text style={sheetStyles.eyebrow}>{crew?.name ?? 'Toda tu gente'}</Text>
      <Text style={sheetStyles.title}>Pase de lista</Text>
      {activeSites.length === 0 ? (
        <View style={sheetStyles.card}>
          <Text style={sheetStyles.text}>Primero agrega la obra donde trabajan en la pestaña Frentes: el pase de lista se guarda con el día de esa obra.</Text>
        </View>
      ) : (
        <>
          <Chips options={activeSites.map(s => ({ value: s.id, label: s.name }))} value={siteId} onChange={setSiteId} />
          {site && <Text style={styles.workerMeta}>Día de la obra: {formatDate(site.local_date)}</Text>}
          <View style={sheetStyles.card}>
            {members.map((w, i) => (
              <View key={w.id} style={[styles.attendanceRow, i > 0 && styles.rowBorder]}>
                <View style={styles.attendanceName}>
                  <Avatar worker={w} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerName} numberOfLines={1}>{w.full_name}</Text>
                    {w.attendance_source === 'scan' && <Text style={styles.workerMeta}>Entrada registrada por el residente</Text>}
                  </View>
                </View>
                {w.attendance_source !== 'scan' && (
                  <Chips options={ATTENDANCE_OPTIONS} value={marks[w.id] ?? null} onChange={v => setMarks(m => ({ ...m, [w.id]: v }))} />
                )}
              </View>
            ))}
          </View>
          {error && <Text style={sheetStyles.error}>{error}</Text>}
          <SheetButton label="Guardar pase de lista" icon="checkmark-circle" onPress={save} busy={saving} disabled={!site || !Object.keys(marks).length} />
        </>
      )}
    </>
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
  const n = worker.credentials.filter(c => c.status === 'valid').length;
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
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const recs = recommendationsFor(worker, data);
  const course = (id: string) => data.courses.find(c => c.id === id);
  const siteName = (id: string) => data.sites.find(s => s.id === id)?.name ?? 'Obra';
  const verifyUrl = badgeVerifyUrl(worker.verify_code);
  const lastScan = data.lastScans[worker.id];

  const act = async (r: Recommendation, choice: 'done' | 'later') => {
    setBusy(r.key);
    try {
      if (choice === 'done' && r.kind === 'imss') await ChiefOfLaborService.markImssRegistered(worker.id);
      await ChiefOfLaborService.setRecommendationAction(worker.id, r.key, choice);
      await reload(true);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  };

  const enrolled = async (r: Recommendation, message: string) => {
    setEnrolling(null);
    await ChiefOfLaborService.setRecommendationAction(worker.id, r.key, 'done').catch(() => undefined);
    await reload(true);
    Alert.alert(r.title, message);
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
            <Text style={styles.badgeBandMeta}>{worker.imss_registered ? 'Con IMSS' : 'Falta IMSS'}</Text>
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
            {lastScan && (
              <View style={styles.lastScan}>
                <Ionicons name={lastScan.checked_in ? 'log-in' : 'eye'} size={16} color="#047857" />
                <Text style={styles.lastScanText}>
                  {lastScan.checked_in
                    ? `Entrada registrada ${formatDayTime(lastScan.checked_in_at ?? lastScan.scanned_at, lastScan.site_timezone)} · ${lastScan.site_name ?? ''}`
                    : `Verificado en obra ${formatDayTime(lastScan.scanned_at)}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {recs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            {recs.map(r => {
              const recCourse = r.courseId ? course(r.courseId) : undefined;
              return (
                <View key={r.key} style={styles.recCard}>
                  <View style={[styles.recIcon, { backgroundColor: r.color + '22' }]}>
                    <Ionicons name={r.icon} size={20} color={r.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>{r.title}</Text>
                    <Text style={styles.recText}>{r.text}</Text>
                    {enrolling === r.key && recCourse ? (
                      <View style={{ marginTop: 10 }}>
                        <CourseEnrollPanel course={recCourse} level={data.level} people={1} workerIds={[worker.id]} onEnrolled={m => enrolled(r, m)} />
                      </View>
                    ) : (
                      <View style={styles.recActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, busy === r.key && { opacity: 0.5 }]}
                          disabled={busy === r.key}
                          onPress={() => (r.kind === 'enroll' ? setEnrolling(r.key) : act(r, 'done'))}
                        >
                          <Text style={styles.actionText}>{r.action}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.laterButton} disabled={busy === r.key} onPress={() => act(r, 'later')}>
                          <Text style={styles.laterText}>Después</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.sectionTitle}>Constancias</Text>
        {worker.credentials.length ? (
          worker.credentials.map(c => {
            const t = TYPE_STYLE[c.credential_type];
            const state = credentialState(c.expires_on);
            const pending = c.status === 'pending_review';
            return (
              <View key={c.id} style={styles.credCard}>
                <View style={styles.credTop}>
                  <View style={[styles.chip, { backgroundColor: t.bg }]}>
                    <Text style={[styles.chipText, { color: t.color }]}>{t.label}</Text>
                  </View>
                  <Text style={[styles.credStatus, { color: pending || state !== 'vigente' ? '#B45309' : '#047857' }, state === 'vencida' && { color: '#B91C1C' }]}>
                    {pending ? 'Por revisar' : state === 'vencida' ? 'Vencida' : state === 'por_renovar' ? 'Por renovar' : 'Vigente'}
                  </Text>
                </View>
                <Text style={styles.credTitle}>{course(c.course_id)?.title ?? c.course_id}</Text>
                <Text style={styles.credMeta}>{c.issuer_name}</Text>
                <Text style={styles.credMeta}>
                  Folio {c.folio} · {formatDate(c.issued_on)}{c.expires_on ? ` · vence ${formatDate(c.expires_on)}` : ' · sin vencimiento'}
                </Text>
                {pending && <Text style={styles.credMeta}>BuildI la está revisando; mientras, no aparece al escanear el gafete.</Text>}
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
                <View key={`${s.labor_site_id}-${s.year}`} style={[styles.siteRow, i > 0 && styles.rowBorder]}>
                  <Ionicons name="business" size={18} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {siteName(s.labor_site_id)} · {s.year} · {s.days} {s.days === 1 ? 'día' : 'días'}
                  </Text>
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
  emptyCard: {
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    flexWrap: 'wrap',
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
  attendanceRow: {
    paddingVertical: 10,
    gap: 8,
  },
  attendanceName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
