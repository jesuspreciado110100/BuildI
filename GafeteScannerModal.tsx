import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BadgeVerification, ChiefOfLaborService, parseBadgeCode } from '@/app/services/ChiefOfLaborService';
import { BadgeVerificationCard } from '@/app/components/BadgeVerificationCard';

// Lector de gafetes para el residente o supervisor (app de constructor).
// Lee el QR con la cámara o el código escrito a mano y muestra las
// constancias del trabajador con labor_verify_badge.

type Result = { code: string; data: BadgeVerification | null };

export function GafeteScannerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const verify = async (raw: string) => {
    const code = parseBadgeCode(raw);
    if (!code) {
      setError('Ese QR no es un gafete BuildI.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setResult({ code, data: await ChiefOfLaborService.verifyBadge(code) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo verificar.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setManual('');
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{result ? 'Gafete' : 'Escanear gafete'}</Text>
          <TouchableOpacity onPress={close} accessibilityLabel="Cerrar">
            <Text style={styles.done}>Listo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {result ? (
            <>
              <BadgeVerificationCard code={result.code} result={result.data} />
              <TouchableOpacity style={styles.primary} onPress={reset}>
                <Ionicons name="qr-code" size={20} color="#FFFFFF" />
                <Text style={styles.primaryText}>Escanear otro</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.cameraBox}>
                {permission?.granted ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={busy ? undefined : ({ data }) => verify(data)}
                  />
                ) : (
                  <View style={styles.permission}>
                    <Ionicons name="camera" size={36} color="#0EA5E9" />
                    <Text style={styles.permissionText}>Para leer el QR del gafete necesitamos usar la cámara.</Text>
                    <TouchableOpacity style={styles.primary} onPress={requestPermission}>
                      <Text style={styles.primaryText}>Permitir cámara</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {busy && (
                  <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.hint}>Apunta al QR del gafete del trabajador.</Text>

              {error && (
                <View style={styles.error}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.label}>¿No lee el QR? Escribe el código</Text>
              <View style={styles.manualRow}>
                <TextInput
                  style={styles.input}
                  placeholder="BLD-XXXXXXXX"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={manual}
                  onChangeText={setManual}
                  onSubmitEditing={() => verify(manual)}
                />
                <TouchableOpacity style={[styles.verifyButton, (!manual.trim() || busy) && { opacity: 0.5 }]} disabled={!manual.trim() || busy} onPress={() => verify(manual)}>
                  <Text style={styles.primaryText}>Verificar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  done: { fontSize: 16, fontWeight: '600', color: '#0EA5E9' },
  content: { padding: 20, paddingBottom: 48, gap: 12 },
  cameraBox: { height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0F172A' },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: '#FFFFFF' },
  permissionText: { fontSize: 15, color: '#475569', textAlign: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12 },
  errorText: { flex: 1, fontSize: 14, color: '#B91C1C' },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 8 },
  manualRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  verifyButton: { backgroundColor: '#0EA5E9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
