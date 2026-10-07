import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ChiefOfLaborService,
  Course,
  OpenSession,
  ProLevel,
  ProjectOption,
  coursePriceFor,
  formatSessionDate,
} from '@/app/services/ChiefOfLaborService';

// Piezas compartidas de las pantallas del contratista de mano de obra:
// hoja inferior, campos, ligar una obra real de BuildI e inscribir a un
// curso eligiendo fecha (con los lugares que quedan).

export const LABOR_COLORS = {
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

const C = LABOR_COLORS;

export const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function LaborSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function LaborField({
  label,
  hint,
  keyboardType,
  autoCapitalize,
  ...input
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...input}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map(o => (
        <TouchableOpacity key={o.value} style={[styles.chip, o.value === value && styles.chipActive]} onPress={() => onChange(o.value)}>
          <Text style={[styles.chipText, o.value === value && styles.chipTextActive]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function MultiChips({
  options,
  values,
  onChange,
}: {
  options: { value: string; label: string; muted?: boolean }[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map(o => {
        const on = values.includes(o.value);
        return (
          <TouchableOpacity
            key={o.value}
            style={[styles.chip, on && styles.chipActive]}
            onPress={() => onChange(on ? values.filter(v => v !== o.value) : [...values, o.value])}
          >
            <Text style={[styles.chipText, on && styles.chipTextActive, !on && o.muted && { color: '#9CA3AF' }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Número escrito por el usuario ("1,5" o "1.5"); null si no es válido. */
export function parseAmount(text: string): number | null {
  const n = parseFloat(text.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function SheetButton({ label, icon, onPress, disabled, busy }: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.button, (disabled || busy) && { opacity: 0.5 }]} onPress={onPress} disabled={disabled || busy}>
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color="#FFFFFF" /> : null}
          <Text style={styles.buttonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Buscar un proyecto real de BuildI y ligarlo como obra del contratista. */
export function AddSiteSheet({ visible, linkedProjectIds, onClose, onLinked }: {
  visible: boolean;
  linkedProjectIds: string[];
  onClose: () => void;
  onLinked: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProjectOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const t = setTimeout(() => {
      ChiefOfLaborService.searchProjects(query)
        .then(r => {
          if (cancelled) return;
          setResults(r);
          setError(null);
        })
        .catch(e => {
          if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo buscar.');
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, visible]);

  const link = async (p: ProjectOption) => {
    setLinking(p.project_id);
    try {
      await ChiefOfLaborService.linkProject(p.project_id);
      setQuery('');
      onLinked();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo agregar la obra.');
    } finally {
      setLinking(null);
    }
  };

  const available = (results ?? []).filter(p => !linkedProjectIds.includes(p.project_id));

  return (
    <LaborSheet visible={visible} onClose={onClose}>
      <Text style={styles.eyebrow}>Obras de BuildI</Text>
      <Text style={styles.title}>Agregar obra</Text>
      <Text style={styles.text}>Busca la obra donde trabaja tu gente. La hora de la obra se toma de su ubicación.</Text>
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nombre de la obra"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {results === null ? (
        <ActivityIndicator color={C.primary} />
      ) : available.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.text}>
            {query.trim()
              ? 'No encontramos esa obra. Pide a la constructora que la dé de alta en BuildI o que te comparta el nombre exacto.'
              : 'No hay obras para mostrar.'}
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {available.map((p, i) => (
            <TouchableOpacity key={p.project_id} style={[styles.row, i > 0 && styles.rowBorder]} onPress={() => link(p)} disabled={!!linking}>
              <Ionicons name="business" size={22} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.name}</Text>
                {p.location ? <Text style={styles.rowMeta} numberOfLines={2}>{p.location}</Text> : null}
              </View>
              {linking === p.project_id ? (
                <ActivityIndicator color={C.primary} />
              ) : (
                <View style={styles.actionButton}>
                  <Text style={styles.actionText}>Agregar</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </LaborSheet>
  );
}

/**
 * Inscribir a un curso: muestra las fechas programadas con lugares; si no
 * hay ninguna (o el curso es en la app), el lugar se aparta sin fecha.
 */
export function CourseEnrollPanel({
  course,
  level,
  people,
  workerIds,
  forMe,
  onEnrolled,
}: {
  course: Course;
  level: ProLevel;
  people: number;
  workerIds?: string[];
  forMe?: boolean;
  onEnrolled: (message: string) => void;
}) {
  const [sessions, setSessions] = useState<OpenSession[] | null>(course.delivery === 'app' ? [] : null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (course.delivery === 'app') return;
    ChiefOfLaborService.getOpenSessions(course.id)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [course.id, course.delivery]);

  // Primera fecha con lugar para todos (si la elegida ya no alcanza).
  useEffect(() => {
    if (!sessions?.length) return;
    setSessionId(current =>
      sessions.some(s => s.id === current && s.seats_left >= people) ? current : sessions.find(s => s.seats_left >= people)?.id ?? null,
    );
  }, [sessions, people]);

  const unit = coursePriceFor(course, level);
  const discount = course.discount_by_level?.[level] ?? 0;
  const session = sessions?.find(s => s.id === sessionId) ?? null;
  const mustPick = !!sessions && sessions.length > 0;

  const enroll = async () => {
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.enroll({
        courseId: course.id,
        workerIds,
        seats: workerIds?.length || forMe ? 0 : people,
        forMe,
        sessionId: session?.id ?? null,
      });
      onEnrolled(
        course.delivery === 'app'
          ? 'Ya puede empezar las clases en la app.'
          : session
            ? `Lugar para el ${formatSessionDate(session.starts_at, session.timezone)}${session.venue_name ? ` en ${session.venue_name}` : ''}.`
            : 'Lugar apartado. Te avisamos cuando haya fecha.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo inscribir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      {sessions === null ? (
        <ActivityIndicator color={C.primary} />
      ) : mustPick ? (
        <>
          <Text style={styles.label}>Fecha</Text>
          {sessions.map(s => {
            const full = s.seats_left < people;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.session, s.id === sessionId && styles.sessionActive, full && { opacity: 0.5 }]}
                onPress={() => setSessionId(s.id)}
                disabled={full}
              >
                <Ionicons name="calendar" size={18} color={s.id === sessionId ? C.primary : C.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{formatSessionDate(s.starts_at, s.timezone)}</Text>
                  <Text style={styles.rowMeta}>
                    {[s.venue_name, s.provider_name].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={[styles.rowMeta, full && { color: C.errorText }]}>
                  {s.seats_left === 1 ? '1 lugar' : `${s.seats_left} lugares`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </>
      ) : course.delivery !== 'app' ? (
        <View style={[styles.notice, { backgroundColor: C.primarySoft }]}>
          <Text style={[styles.noticeText, { color: C.primary }]}>
            Todavía no hay fecha programada. Apartamos {people === 1 ? 'el lugar' : `${people} lugares`} y te avisamos cuando la haya.
          </Text>
        </View>
      ) : null}

      <View style={styles.priceRow}>
        <Text style={styles.rowMeta}>Precio por persona</Text>
        <Text style={styles.price}>
          {unit === null ? 'Por confirmar' : unit === 0 ? 'Gratis' : money(unit)}
          {unit !== null && discount > 0 && discount < 1 ? `  (−${Math.round(discount * 100)}% por tu nivel)` : ''}
        </Text>
      </View>
      {unit !== null && unit > 0 && people > 1 && (
        <View style={styles.priceRow}>
          <Text style={[styles.rowMeta, { color: C.text, fontWeight: '600' }]}>Total</Text>
          <Text style={styles.price}>{money(unit * people)}</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <SheetButton
        label={course.delivery === 'app' ? 'Inscribir' : mustPick ? 'Inscribir' : 'Apartar lugar'}
        onPress={enroll}
        busy={saving}
        disabled={mustPick && !session}
      />
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

export const sheetStyles = StyleSheet.create({
  eyebrow: { fontSize: 13, color: C.muted },
  title: { fontSize: 24, fontWeight: 'bold', color: C.text },
  text: { fontSize: 15, color: C.body },
  label: { fontSize: 14, fontWeight: '600', color: C.text },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 16, gap: 10, ...cardShadow },
  notice: { borderRadius: 12, padding: 14, gap: 10 },
  noticeText: { fontSize: 14 },
  error: { fontSize: 14, color: C.errorText },
});

const styles = StyleSheet.create({
  ...sheetStyles,
  scrim: { flex: 1, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: C.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 8 },
  sheetContent: { padding: 20, paddingBottom: 40, gap: 12 },
  hint: { fontSize: 12, color: C.muted },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.text,
  },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, ...cardShadow },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: C.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.divider },
  chipActive: { backgroundColor: C.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: C.body },
  chipTextActive: { color: '#FFFFFF' },
  button: { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.divider },
  rowTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  rowMeta: { fontSize: 13, color: C.muted },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: C.primarySoft },
  actionText: { fontSize: 12, color: C.primary, fontWeight: '500' },
  session: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  sessionActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 15, fontWeight: '600', color: C.text },
});
