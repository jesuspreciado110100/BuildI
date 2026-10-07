import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeScan, ChiefOfLaborService, formatTime } from '@/app/services/ChiefOfLaborService';
import { BadgeVerificationCard } from '@/app/components/BadgeVerificationCard';

// Resultado de escanear un gafete en la app de constructor: la verificación y
// el registro de entrada a la obra, que llena el pase de lista del contratista.

export function BadgeScanResult({ code, scan, onCheckedIn }: { code: string; scan: BadgeScan | null; onCheckedIn?: () => void }) {
  const [siteId, setSiteId] = useState(scan?.sites[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ site_name: string; checked_in_at: string } | null>(null);

  const checkIn = async () => {
    if (!scan || !siteId) return;
    setSaving(true);
    setError(null);
    try {
      setDone(await ChiefOfLaborService.checkIn(scan.scan_id, siteId));
      onCheckedIn?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la entrada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <BadgeVerificationCard code={code} result={scan} />

      {scan && (
        <View style={styles.card}>
          <Text style={styles.title}>Registrar entrada a la obra</Text>
          {done ? (
            <View style={[styles.notice, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="log-in" size={20} color="#059669" />
              <Text style={[styles.noticeText, { color: '#047857' }]}>
                Entrada registrada a las {formatTime(done.checked_in_at)} en {done.site_name}. Ya aparece en el pase de lista de {scan.contractor}.
              </Text>
            </View>
          ) : scan.sites.length === 0 ? (
            <Text style={styles.muted}>{scan.contractor} no tiene obras activas registradas.</Text>
          ) : (
            <>
              {scan.checked_in_today && (
                <View style={[styles.notice, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="information-circle" size={20} color="#0284C7" />
                  <Text style={[styles.noticeText, { color: '#0369A1' }]}>Ya tiene entrada registrada hoy.</Text>
                </View>
              )}
              {(!scan.heights_ok || !scan.imss_registered) && (
                <View style={[styles.notice, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="bulb" size={20} color="#D97706" />
                  <Text style={[styles.noticeText, { color: '#B45309' }]}>
                    {!scan.imss_registered ? 'No tiene alta en IMSS. ' : ''}
                    {!scan.heights_ok ? 'Recomendación: no asignarlo a trabajos a más de 1.8 m.' : ''}
                  </Text>
                </View>
              )}
              <Text style={styles.label}>Obra</Text>
              <View style={styles.chips}>
                {scan.sites.map(s => (
                  <TouchableOpacity key={s.id} style={[styles.chip, s.id === siteId && styles.chipActive]} onPress={() => setSiteId(s.id)}>
                    <Text style={[styles.chipText, s.id === siteId && styles.chipTextActive]}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {error && <Text style={styles.error}>{error}</Text>}
              <TouchableOpacity style={[styles.button, (saving || !siteId) && { opacity: 0.6 }]} disabled={saving || !siteId} onPress={checkIn}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Registrar entrada</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  muted: { fontSize: 14, color: '#64748B' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12 },
  noticeText: { flex: 1, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#0EA5E9' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  error: { fontSize: 14, color: '#DC2626' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
