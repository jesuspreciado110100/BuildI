import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BadgeVerification,
  CredentialState,
  CredentialType,
  credentialState,
  formatDate,
} from '@/app/services/ChiefOfLaborService';

// Resultado de verificar un gafete, para el residente o supervisor en la app
// de constructor. Usa la paleta del constructor (slate + azul cielo).

const TYPE_LABEL: Record<CredentialType, { label: string; color: string; bg: string }> = {
  buildi: { label: 'Constancia BuildI', color: '#0369A1', bg: '#E0F2FE' },
  dc3: { label: 'DC-3 · STPS', color: '#B45309', bg: '#FEF3C7' },
  conocer: { label: 'Certificado CONOCER', color: '#047857', bg: '#D1FAE5' },
};

const STATE_STYLE: Record<CredentialState, { label: string; color: string }> = {
  vigente: { label: 'Vigente', color: '#059669' },
  por_renovar: { label: 'Por renovar', color: '#D97706' },
  vencida: { label: 'Vencida', color: '#DC2626' },
};

const LEVEL_LABEL = { ayudante: 'Ayudante', oficial: 'Oficial', maestro: 'Maestro' } as const;

const HEIGHTS_TITLE = 'Trabajo en alturas (NOM-009)';

export function BadgeVerificationCard({ code, result }: { code: string; result: BadgeVerification | null }) {
  if (!result) {
    return (
      <View style={[styles.verdict, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
        <Ionicons name="close-circle" size={28} color="#DC2626" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.verdictTitle, { color: '#B91C1C' }]}>Gafete no encontrado</Text>
          <Text style={styles.verdictText}>El código {code} no existe o el trabajador ya no está activo.</Text>
        </View>
      </View>
    );
  }

  const heights = result.credentials.find(c => c.title === HEIGHTS_TITLE);
  const heightsOk = heights && credentialState(heights.renew_on) !== 'vencida';
  const expired = result.credentials.filter(c => credentialState(c.renew_on) === 'vencida').length;
  const allGood = result.imss_registered && expired === 0;

  return (
    <View style={{ gap: 12 }}>
      <View
        style={[
          styles.verdict,
          allGood ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' } : { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
        ]}
      >
        <Ionicons name={allGood ? 'checkmark-circle' : 'alert-circle'} size={28} color={allGood ? '#059669' : '#D97706'} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.verdictTitle, { color: allGood ? '#047857' : '#B45309' }]}>
            {allGood ? 'Gafete válido' : 'Gafete válido, con pendientes'}
          </Text>
          <Text style={styles.verdictText}>
            {!result.imss_registered ? 'Sin alta en IMSS. ' : ''}
            {expired ? `${expired} ${expired === 1 ? 'constancia vencida' : 'constancias vencidas'}.` : ''}
            {allGood ? 'IMSS vigente y constancias al día.' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{result.name}</Text>
        <Text style={styles.trade}>{result.trade} · {LEVEL_LABEL[result.level]}</Text>
        <Text style={styles.muted}>{result.contractor} · {code}</Text>
        <View style={styles.checks}>
          <Check ok={result.imss_registered} label={result.imss_registered ? 'IMSS vigente' : 'Sin IMSS'} />
          <Check ok={!!heightsOk} label={heightsOk ? 'Puede trabajar en alturas' : 'Sin DC-3 de alturas'} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Constancias</Text>
      {result.credentials.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.muted}>No tiene constancias registradas.</Text>
        </View>
      )}
      {result.credentials.map(c => {
        const t = TYPE_LABEL[c.type];
        const st = STATE_STYLE[credentialState(c.renew_on)];
        return (
          <View key={c.folio} style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: t.bg }]}>
                <Text style={[styles.badgeText, { color: t.color }]}>{t.label}</Text>
              </View>
              <Text style={[styles.state, { color: st.color }]}>{st.label}</Text>
            </View>
            <Text style={styles.credTitle}>{c.title}</Text>
            <Text style={styles.muted}>{c.issuer}</Text>
            <Text style={styles.muted}>
              Folio {c.folio} · {formatDate(c.issued_on)}{c.renew_on ? ` · renovar ${formatDate(c.renew_on)}` : ' · sin vencimiento'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={[styles.check, { backgroundColor: ok ? '#ECFDF5' : '#FEF2F2' }]}>
      <Ionicons name={ok ? 'checkmark' : 'close'} size={14} color={ok ? '#059669' : '#DC2626'} />
      <Text style={[styles.checkText, { color: ok ? '#047857' : '#B91C1C' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  verdictTitle: { fontSize: 17, fontWeight: '700' },
  verdictText: { fontSize: 14, color: '#475569', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  trade: { fontSize: 15, fontWeight: '600', color: '#0EA5E9' },
  muted: { fontSize: 13, color: '#64748B' },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  checkText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  state: { fontSize: 12, fontWeight: '600' },
  credTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginTop: 4 },
});
