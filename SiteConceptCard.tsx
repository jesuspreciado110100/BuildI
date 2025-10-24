import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SiteConceptCardProps {
  concept: {
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    status: 'pending' | 'in-progress' | 'completed' | 'confirmed';
    photoEvidence?: string[];
    workerName?: string;
  };
  onConfirm: (conceptCode: string) => void;
  onReject: (conceptCode: string) => void;
}

export default function SiteConceptCard({ concept, onConfirm, onReject }: SiteConceptCardProps) {
  const [showPhotos, setShowPhotos] = useState(false);

  const getStatusColor = () => {
    switch (concept.status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (concept.status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Progreso';
      case 'confirmed': return 'Confirmado';
      default: return 'Pendiente';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.code}>{concept.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        <Text style={styles.total}>${concept.total.toLocaleString()}</Text>
      </View>

      <Text style={styles.description}>{concept.description}</Text>
      
      <View style={styles.details}>
        <Text style={styles.quantity}>
          {concept.quantity} {concept.unit} × ${concept.unitPrice}
        </Text>
        {concept.workerName && (
          <Text style={styles.worker}>👷 {concept.workerName}</Text>
        )}
      </View>

      {concept.photoEvidence && concept.photoEvidence.length > 0 && (
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={() => setShowPhotos(!showPhotos)}
          >
            <Ionicons name="camera" size={16} color="#3B82F6" />
            <Text style={styles.photoButtonText}>
              Ver evidencia ({concept.photoEvidence.length})
            </Text>
          </TouchableOpacity>
          
          {showPhotos && (
            <View style={styles.photoGrid}>
              {concept.photoEvidence.slice(0, 3).map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
            </View>
          )}
        </View>
      )}

      {concept.status === 'completed' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject(concept.code)}
          >
            <Ionicons name="close" size={16} color="#EF4444" />
            <Text style={styles.rejectText}>Rechazar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => onConfirm(concept.code)}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    marginBottom: 12,
  },
  quantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  worker: {
    fontSize: 12,
    color: '#3B82F6',
  },
  photoSection: {
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  photoButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  rejectText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});