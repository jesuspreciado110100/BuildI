import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChiefOfLaborService } from '@/app/services/ChiefOfLaborService';

// Carga de datos del contratista de mano de obra con estados de carga,
// error y "todavía no tienes perfil" (alta con los datos que ya tiene el
// usuario en BuildI).

type State<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

export function useLaborData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(async (silent = false) => {
    if (!silent) setState({ status: 'loading' });
    try {
      const contractor = await ChiefOfLaborService.getContractor();
      if (!contractor) {
        setState({ status: 'empty' });
        return;
      }
      setState({ status: 'ready', data: await loadRef.current() });
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'No se pudo cargar la información.' });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload };
}

export function LaborDataGate<T>({
  title,
  state,
  reload,
  children,
}: {
  title: string;
  state: State<T>;
  reload: (silent?: boolean) => Promise<void>;
  children: (data: T) => React.ReactNode;
}) {
  if (state.status === 'ready') return <>{children(state.data)}</>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{title}</Text>
      {state.status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Cargando…</Text>
        </View>
      )}
      {state.status === 'error' && (
        <View style={styles.card}>
          <Ionicons name="cloud-offline" size={32} color="#EF4444" />
          <Text style={styles.cardTitle}>No se pudo cargar</Text>
          <Text style={styles.muted}>{state.message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => reload()}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
      {state.status === 'empty' && <ContractorSignup onCreated={() => reload()} />}
    </ScrollView>
  );
}

// Alta del contratista con lo que BuildI ya sabe del usuario.
function ContractorSignup({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ChiefOfLaborService.getMyUserProfile()
      .then(p => {
        setName(n => n || p.name);
        setBusiness(b => b || p.company_name);
        setCity(c => c || p.location);
        setPhone(t => t || p.phone);
        setEmail(p.email);
      })
      .catch(() => undefined);
  }, []);

  const ready = name.trim().length > 1 && business.trim().length > 1;

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      await ChiefOfLaborService.createContractor({ display_name: name, business_name: business, city, phone, email });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear tu perfil.');
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { alignItems: 'stretch' }]}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Ionicons name="people" size={32} color="#2563EB" />
        <Text style={styles.cardTitle}>Crea tu perfil de contratista</Text>
        <Text style={styles.muted}>
          Con tu perfil das de alta a tu gente, ligas las obras donde trabajas y llevas tus frentes, cursos y papeles.
        </Text>
      </View>
      <Field label="Tu nombre" value={name} onChangeText={setName} placeholder="Como te conocen en obra" />
      <Field label="Nombre de tu negocio" value={business} onChangeText={setBusiness} placeholder="Ej. Mano de Obra Pérez" />
      <Field label="Ciudad" value={city} onChangeText={setCity} placeholder="Donde trabajas" />
      <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="10 dígitos" keyboardType="phone-pad" />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={[styles.button, (!ready || saving) && { opacity: 0.5 }]} disabled={!ready || saving} onPress={create}>
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Crear mi perfil</Text>}
      </TouchableOpacity>
    </View>
  );
}

function Field({
  label,
  keyboardType,
  ...input
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'phone-pad';
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9CA3AF" keyboardType={keyboardType} {...input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  center: { alignItems: 'center', gap: 12, marginTop: 60 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  muted: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#111827' },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  error: { fontSize: 14, color: '#B91C1C' },
  button: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
