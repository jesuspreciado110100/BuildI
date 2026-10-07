import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChiefOfLaborService } from '@/app/services/ChiefOfLaborService';

// Carga de datos del contratista de mano de obra con estados de carga,
// error y "sin datos todavía" (con botón para cargar datos de ejemplo).

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
  const [seeding, setSeeding] = useState(false);

  if (state.status === 'ready') return <>{children(state.data)}</>;

  const seed = async () => {
    setSeeding(true);
    try {
      await ChiefOfLaborService.seedDemo();
      await reload();
    } catch (e) {
      setSeeding(false);
    }
  };

  return (
    <View style={styles.container}>
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
      {state.status === 'empty' && (
        <View style={styles.card}>
          <Ionicons name="people" size={32} color="#2563EB" />
          <Text style={styles.cardTitle}>Aún no tienes cuadrillas</Text>
          <Text style={styles.muted}>Da de alta tu negocio y tu gente, o carga datos de ejemplo para conocer la app.</Text>
          <TouchableOpacity style={[styles.button, seeding && { opacity: 0.6 }]} onPress={seed} disabled={seeding}>
            {seeding ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Cargar datos de ejemplo</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  center: { alignItems: 'center', gap: 12, marginTop: 60 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  muted: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  button: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignSelf: 'stretch', alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
