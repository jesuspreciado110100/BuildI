import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cuadrillas y gafete digital de cada trabajador: sus constancias (BuildI,
// DC-3 de la STPS, CONOCER), un QR para que la constructora las verifique,
// las obras donde ha trabajado y recomendaciones (no bloqueos).
// Datos de ejemplo.

type CredType = 'buildi' | 'dc3' | 'conocer';
type WorkerLevel = 'ayudante' | 'oficial' | 'maestro';
type CrewStatus = 'active' | 'break';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Crew {
  id: string;
  name: string;
  leadId: string;
  site: string;
  status: CrewStatus;
  efficiency: number;
  heightNote?: string;
}

interface WorkerCredential {
  courseId: string;
  title: string;
  type: CredType;
  issuer: string;
  folio: string;
  issued: string;
  renew: string | null;
  expiringSoon: boolean;
}

interface Worker {
  id: string;
  name: string;
  trade: string;
  level: WorkerLevel;
  crewId: string;
  color: string;
  imss: boolean;
  since: number;
  credentials: WorkerCredential[];
}

interface Recommendation {
  icon: IconName;
  color: string;
  title: string;
  text: string;
  action: string;
  done: string;
}

const CREWS: Crew[] = [
  { id: 'alb', name: 'Cuadrilla Albañilería', leadId: 'JL', site: 'Torre Alameda', status: 'active', efficiency: 95, heightNote: 'el nivel 3 de Torre Alameda' },
  { id: 'aca', name: 'Cuadrilla Acabados', leadId: 'CV', site: 'Torre Alameda', status: 'active', efficiency: 88, heightNote: 'andamios a 2.5 m en Torre Alameda' },
  { id: 'tab', name: 'Cuadrilla Tablaroca y Pisos', leadId: 'BM', site: 'Torre Alameda · Depto 6B', status: 'break', efficiency: 92 },
];

// [id, nombre, oficio, nivel, cuadrilla, color, IMSS, año de ingreso]
const ROSTER: [string, string, string, WorkerLevel, string, string, boolean, number][] = [
  ['JL', 'Juan López', 'Albañil · cabo', 'oficial', 'alb', '#2563EB', true, 2021],
  ['MA', 'Miguel Ángel Ruiz', 'Albañil', 'oficial', 'alb', '#7C3AED', true, 2022],
  ['IC', 'Iván Cruz', 'Albañil', 'oficial', 'alb', '#DB2777', true, 2024],
  ['EG', 'Esteban García', 'Ayudante general', 'ayudante', 'alb', '#059669', true, 2025],
  ['AM', 'Arturo Méndez', 'Albañil', 'maestro', 'alb', '#B45309', true, 2019],
  ['RN', 'Rogelio Navarro', 'Albañil', 'oficial', 'alb', '#0891B2', true, 2023],
  ['DF', 'Daniel Flores', 'Ayudante general', 'ayudante', 'alb', '#4B5563', true, 2026],
  ['SL', 'Saúl Lara', 'Ayudante general', 'ayudante', 'alb', '#9333EA', true, 2026],
  ['CV', 'Carlos Vega', 'Yesero · cabo', 'oficial', 'aca', '#0F766E', true, 2020],
  ['PS', 'Pedro Sánchez', 'Ayudante general', 'ayudante', 'aca', '#DC2626', true, 2025],
  ['JD', 'Jorge Domínguez', 'Pintor', 'oficial', 'aca', '#65A30D', true, 2022],
  ['MR', 'Mario Ríos', 'Pintor', 'oficial', 'aca', '#EA580C', true, 2023],
  ['FG', 'Felipe Gómez', 'Ayudante general', 'ayudante', 'aca', '#6366F1', true, 2026],
  ['OH', 'Óscar Hernández', 'Yesero', 'oficial', 'aca', '#0284C7', true, 2024],
  ['NA', 'Noé Aguilar', 'Ayudante general', 'ayudante', 'aca', '#A16207', true, 2026],
  ['GT', 'Gilberto Torres', 'Pintor', 'maestro', 'aca', '#BE185D', true, 2018],
  ['BM', 'Beto Morales', 'Pisero · cabo', 'maestro', 'tab', '#C2410C', true, 2019],
  ['TR', 'Toño Ramírez', 'Ayudante general', 'ayudante', 'tab', '#0E7490', false, 2026],
  ['LR', 'Luis Ramos', 'Tablaroquero', 'oficial', 'tab', '#D97706', true, 2022],
  ['HT', 'Hugo Treviño', 'Ayudante general', 'ayudante', 'tab', '#4338CA', true, 2025],
  ['EC', 'Eduardo Castro', 'Tablaroquero', 'oficial', 'tab', '#15803D', true, 2023],
  ['RV', 'Raúl Villa', 'Pisero', 'oficial', 'tab', '#9F1239', true, 2021],
  ['KP', 'Kevin Pineda', 'Ayudante general', 'ayudante', 'tab', '#475569', true, 2026],
  ['AS', 'Alan Solís', 'Ayudante general', 'ayudante', 'tab', '#7E22CE', true, 2026],
];

const COURSES: Record<string, { title: string; type: CredType; issuer: string; code: string; renewYears: number | null; holders: string[] }> = {
  seg: { title: 'Seguridad básica en obra', type: 'buildi', issuer: 'BuildI', code: 'BLD', renewYears: 2, holders: ['JL', 'MA', 'IC', 'EG', 'AM', 'RN', 'CV', 'PS', 'JD', 'MR', 'OH', 'GT', 'BM', 'TR', 'LR', 'HT', 'EC', 'RV'] },
  alt: { title: 'Trabajo en alturas (NOM-009)', type: 'dc3', issuer: 'Agente capacitador aliado · registro STPS', code: 'DC3', renewYears: 1, holders: ['JL', 'MA', 'AM', 'CV', 'JD', 'GT', 'LR', 'EC', 'BM'] },
  n031: { title: 'Seguridad en obras de construcción (NOM-031)', type: 'dc3', issuer: 'Agente capacitador aliado · registro STPS', code: 'DC3', renewYears: 1, holders: ['JL', 'AM', 'CV', 'GT', 'BM', 'RV'] },
  epp: { title: 'Uso de equipo de protección (NOM-017)', type: 'dc3', issuer: 'Agente capacitador aliado · registro STPS', code: 'DC3', renewYears: 1, holders: ['JL', 'MA', 'IC', 'AM', 'RN', 'CV', 'JD', 'MR', 'GT', 'OH', 'BM', 'LR', 'RV', 'EC'] },
  con: { title: 'Certificación de albañil', type: 'conocer', issuer: 'CONOCER · evaluador acreditado', code: 'CON', renewYears: null, holders: ['AM', 'JL'] },
};

const EXPIRING_SOON = new Set(['MA:alt']);
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun'];

const TYPE_STYLE: Record<CredType, { label: string; color: string; bg: string }> = {
  buildi: { label: 'Constancia BuildI', color: '#2563EB', bg: '#EBF4FF' },
  dc3: { label: 'DC-3 · STPS', color: '#B45309', bg: '#FEF3C7' },
  conocer: { label: 'Certificado CONOCER', color: '#047857', bg: '#D1FAE5' },
};

const LEVEL_LABEL: Record<WorkerLevel, string> = { ayudante: 'Ayudante', oficial: 'Oficial', maestro: 'Maestro' };

function hash(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 100000;
  return h;
}

function credentialsFor(id: string): WorkerCredential[] {
  return Object.entries(COURSES)
    .filter(([, c]) => c.holders.includes(id))
    .map(([courseId, c]) => {
      const h = hash(id + courseId);
      const month = MONTHS[h % MONTHS.length];
      const expiringSoon = EXPIRING_SOON.has(`${id}:${courseId}`);
      return {
        courseId,
        title: c.title,
        type: c.type,
        issuer: c.issuer,
        folio: `${c.code}-2026-${String(h % 10000).padStart(4, '0')}`,
        issued: `${month} 2026`,
        renew: expiringSoon ? 'oct 2026' : c.renewYears ? `${month} ${2026 + c.renewYears}` : null,
        expiringSoon,
      };
    });
}

const WORKERS: Worker[] = ROSTER.map(([id, name, trade, level, crewId, color, imss, since]) => ({
  id, name, trade, level, crewId, color, imss, since, credentials: credentialsFor(id),
}));

const verifyCode = (w: Worker) => `BLD-${w.id}-${String(hash(w.name) % 10000).padStart(4, '0')}`;

function sitesFor(w: Worker) {
  const crew = CREWS.find(c => c.id === w.crewId)!;
  const sites = crew.site.split(' · ').map(s => `${s} · 2026`);
  if (w.since <= 2024) sites.push('Residencial Las Lomas · 2025');
  if (w.since <= 2021) sites.push('Plaza Centro Sur · 2023');
  return sites;
}

// Recomendaciones: la app sugiere, el contratista decide.
function recommendationsFor(w: Worker): Recommendation[] {
  const crew = CREWS.find(c => c.id === w.crewId)!;
  const has = (courseId: string) => w.credentials.some(c => c.courseId === courseId);
  const recs: Recommendation[] = [];
  if (!w.imss) {
    recs.push({ icon: 'alert-circle', color: '#EF4444', title: 'Dar de alta en IMSS', text: 'Las constructoras piden que todos estén dados de alta. Te recomendamos hacerlo antes de su siguiente turno.', action: 'Dar de alta', done: 'Alta en IMSS enviada.' });
  }
  if (crew.heightNote && !has('alt')) {
    recs.push({ icon: 'warning', color: '#F59E0B', title: 'Curso de trabajo en alturas', text: `Su cuadrilla trabaja en ${crew.heightNote}. Te recomendamos la DC-3 de alturas (NOM-009) o asignarlo a un frente a nivel de piso.`, action: 'Inscribir', done: 'Inscrito al curso del sábado.' });
  }
  w.credentials.filter(c => c.expiringSoon).forEach(c => {
    recs.push({ icon: 'time', color: '#F59E0B', title: `Renovar: ${c.title}`, text: `Se recomienda revalidar en ${c.renew}.`, action: 'Renovar', done: 'Inscrito a la renovación.' });
  });
  if (!has('seg')) {
    recs.push({ icon: 'school', color: '#2563EB', title: 'Seguridad básica en obra', text: 'Curso gratis de 2 h en la app, sin internet.', action: 'Inscribir', done: 'Le llegó el curso por WhatsApp.' });
  }
  return recs;
}

export default function CrewManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCrew, setOpenCrew] = useState<string | null>(null);
  const [badge, setBadge] = useState<Worker | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const matches = useMemo(
    () => (query ? WORKERS.filter(w => w.name.toLowerCase().includes(query) || w.trade.toLowerCase().includes(query)) : []),
    [query],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'break': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const avgEfficiency = Math.round(CREWS.reduce((a, c) => a + c.efficiency, 0) / CREWS.length);

  return (
    <View style={styles.container}>
      <ScrollView>
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
            <Text style={styles.summaryValue}>{CREWS.filter(c => c.status === 'active').length}</Text>
            <Text style={styles.summaryLabel}>Cuadrillas activas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{WORKERS.length}</Text>
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
                matches.map((w, i) => <WorkerRow key={w.id} worker={w} first={i === 0} onPress={() => setBadge(w)} />)
              ) : (
                <Text style={styles.detailText}>Nadie con ese nombre u oficio.</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.crewsList}>
            {CREWS.map(crew => {
              const members = WORKERS.filter(w => w.crewId === crew.id);
              const lead = WORKERS.find(w => w.id === crew.leadId)!;
              const recs = members.reduce((a, w) => a + recommendationsFor(w).length, 0);
              const open = openCrew === crew.id;
              return (
                <View key={crew.id} style={styles.crewCard}>
                  <View style={styles.crewHeader}>
                    <View style={styles.crewInfo}>
                      <Text style={styles.crewName}>{crew.name}</Text>
                      <Text style={styles.crewLeader}>Cabo: {lead.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crew.status) }]}>
                      <Text style={styles.statusText}>{crew.status === 'active' ? 'ACTIVA' : 'EN DESCANSO'}</Text>
                    </View>
                  </View>

                  <View style={styles.crewDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="people" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{members.length} trabajadores</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="construct" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{crew.site}</Text>
                    </View>
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
                        <WorkerRow key={w.id} worker={w} first={i === 0} onPress={() => setBadge(w)} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!badge} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBadge(null)}>
        {badge && <BadgeSheet worker={badge} onClose={() => setBadge(null)} />}
      </Modal>
    </View>
  );
}

function Avatar({ worker, size }: { worker: Worker; size: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: worker.color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{worker.id}</Text>
    </View>
  );
}

function WorkerRow({ worker, first, onPress }: { worker: Worker; first: boolean; onPress: () => void }) {
  const recs = recommendationsFor(worker).length;
  return (
    <TouchableOpacity style={[styles.workerRow, !first && styles.rowBorder]} onPress={onPress}>
      <Avatar worker={worker} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={styles.workerName}>{worker.name}</Text>
        <Text style={styles.workerMeta}>
          {worker.trade} · {worker.credentials.length} {worker.credentials.length === 1 ? 'constancia' : 'constancias'}
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

function QrPlaceholder({ seed }: { seed: string }) {
  // Dibujo de muestra. En producción: react-native-qrcode-svg con el enlace de verificación.
  const n = 21;
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    const box = inBox(0, 0) ? [0, 0] : inBox(n - 7, 0) ? [n - 7, 0] : inBox(0, n - 7) ? [0, n - 7] : null;
    if (!box) return null;
    const dx = x - box[0], dy = y - box[1];
    const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6;
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return ring || core;
  };
  let h = hash(seed);
  const rows = [];
  for (let y = 0; y < n; y++) {
    const cells = [];
    for (let x = 0; x < n; x++) {
      h = (h * 9301 + 49297) % 233280;
      const f = finder(x, y);
      const on = f === null ? h / 233280 > 0.5 : f;
      cells.push(<View key={x} style={[styles.qrCell, on && styles.qrOn]} />);
    }
    rows.push(<View key={y} style={styles.qrRow}>{cells}</View>);
  }
  return <View style={styles.qr}>{rows}</View>;
}

function BadgeSheet({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  const crew = CREWS.find(c => c.id === worker.crewId)!;
  const [doneRecs, setDoneRecs] = useState<string[]>([]);
  const recs = recommendationsFor(worker).filter(r => !doneRecs.includes(r.title));
  const code = verifyCode(worker);

  const share = () => {
    Share.share({
      message: `Gafete BuildI de ${worker.name} (${worker.trade}). Constancias: ${worker.credentials.map(c => c.title).join(', ') || 'ninguna'}. Código de verificación: ${code}.`,
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
            <Text style={styles.badgeBandMeta}>{worker.imss ? 'Verificado' : 'Falta IMSS'}</Text>
          </View>
          <View style={styles.badgeBody}>
            <Avatar worker={worker} size={72} />
            <Text style={styles.badgeName}>{worker.name}</Text>
            <Text style={styles.badgeTrade}>{worker.trade}</Text>
            <View style={styles.badgeChips}>
              <View style={[styles.chip, { backgroundColor: '#EBF4FF' }]}>
                <Text style={[styles.chipText, { color: '#2563EB' }]}>{LEVEL_LABEL[worker.level]}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: worker.imss ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.chipText, { color: worker.imss ? '#047857' : '#B91C1C' }]}>{worker.imss ? 'IMSS vigente' : 'Sin IMSS'}</Text>
              </View>
              <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.chipText, { color: '#374151' }]}>Desde {worker.since}</Text>
              </View>
            </View>
            <Text style={styles.badgeCrew}>{crew.name} · Mano de Obra Pérez</Text>
            <QrPlaceholder seed={code} />
            <Text style={styles.badgeCode}>{code}</Text>
            <Text style={styles.badgeHint}>El residente o la constructora lo escanea para ver sus constancias vigentes.</Text>
          </View>
        </View>

        {recs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            {recs.map(r => (
              <View key={r.title} style={styles.recCard}>
                <View style={[styles.recIcon, { backgroundColor: r.color + '22' }]}>
                  <Ionicons name={r.icon} size={20} color={r.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{r.title}</Text>
                  <Text style={styles.recText}>{r.text}</Text>
                  <View style={styles.recActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setDoneRecs(prev => [...prev, r.title]);
                        Alert.alert(r.action, r.done);
                      }}
                    >
                      <Text style={styles.actionText}>{r.action}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.laterButton} onPress={() => setDoneRecs(prev => [...prev, r.title])}>
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
            const t = TYPE_STYLE[c.type];
            return (
              <View key={c.courseId} style={styles.credCard}>
                <View style={styles.credTop}>
                  <View style={[styles.chip, { backgroundColor: t.bg }]}>
                    <Text style={[styles.chipText, { color: t.color }]}>{t.label}</Text>
                  </View>
                  <Text style={[styles.credStatus, { color: c.expiringSoon ? '#B45309' : '#047857' }]}>
                    {c.expiringSoon ? 'Por renovar' : 'Vigente'}
                  </Text>
                </View>
                <Text style={styles.credTitle}>{c.title}</Text>
                <Text style={styles.credMeta}>{c.issuer}</Text>
                <Text style={styles.credMeta}>
                  Folio {c.folio} · {c.issued}{c.renew ? ` · renovar ${c.renew}` : ' · sin vencimiento'}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.credCard}>
            <Text style={styles.credMeta}>Todavía no tiene constancias. Empieza con Seguridad básica en obra: es gratis.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Obras con BuildI</Text>
        <View style={styles.credCard}>
          {sitesFor(worker).map((s, i) => (
            <View key={s} style={[styles.siteRow, i > 0 && styles.rowBorder]}>
              <Ionicons name="business" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{s}</Text>
            </View>
          ))}
        </View>

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
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 6,
    height: 6,
  },
  qrOn: {
    backgroundColor: '#111827',
  },
  badgeCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 1,
    marginTop: 6,
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
