import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeScan, ChiefOfLaborService, parseBadgeCode } from '@/app/services/ChiefOfLaborService';
import { BadgeScanResult } from '@/app/components/BadgeScanResult';

// Destino del QR del gafete (construction-operations-management://gafete/BLD-…).
// Si el residente lo escanea con la cámara del teléfono, abre la app aquí:
// verifica el gafete y permite registrar la entrada a la obra.

export default function GafeteDeepLink() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = parseBadgeCode(String(params.code ?? ''));
  const [state, setState] = useState<{ loading: boolean; data?: BadgeScan | null; error?: string }>({ loading: true });

  useEffect(() => {
    if (!code) {
      setState({ loading: false, error: 'Este enlace no es de un gafete BuildI.' });
      return;
    }
    ChiefOfLaborService.scanBadge(code)
      .then(data => setState({ loading: false, data }))
      .catch(e => setState({ loading: false, error: e instanceof Error ? e.message : 'No se pudo verificar.' }));
  }, [code]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} accessibilityLabel="Regresar" style={styles.back}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <Text style={styles.title}>Verificar gafete</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {state.loading && <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 40 }} />}
        {state.error && (
          <View style={styles.error}>
            <Ionicons name="alert-circle" size={22} color="#DC2626" />
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}
        {!state.loading && !state.error && code && <BadgeScanResult code={code} scan={state.data ?? null} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  back: { padding: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  content: { padding: 20, paddingBottom: 48 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14 },
  errorText: { flex: 1, fontSize: 15, color: '#B91C1C' },
});
