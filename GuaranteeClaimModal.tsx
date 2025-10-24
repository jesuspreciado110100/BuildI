import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RentalGuaranteeService, { GuaranteeClaim } from '../services/RentalGuaranteeService';

interface GuaranteeClaimModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  contractorId: string;
  renterId: string;
  onClaimFiled?: (claim: GuaranteeClaim) => void;
}

export default function GuaranteeClaimModal({ 
  visible, 
  onClose, 
  bookingId, 
  contractorId, 
  renterId,
  onClaimFiled 
}: GuaranteeClaimModalProps) {
  const [reason, setReason] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim() || !claimAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(claimAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid claim amount');
      return;
    }

    setSubmitting(true);
    try {
      const claim = await RentalGuaranteeService.fileClaim({
        booking_id: bookingId,
        contractor_id: contractorId,
        renter_id: renterId,
        reason: reason.trim(),
        claim_amount: amount,
        photo_url: photoUrl || undefined
      });

      Alert.alert('Success', 'Guarantee claim filed successfully. You will be notified of the outcome.');
      onClaimFiled?.(claim);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to file claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setClaimAmount('');
    setPhotoUrl('');
    onClose();
  };

  const handlePhotoUpload = () => {
    // Mock photo upload
    const mockPhotoUrl = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop';
    setPhotoUrl(mockPhotoUrl);
    Alert.alert('Success', 'Photo uploaded successfully');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>File Guarantee Claim</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Reason for Claim *</Text>
          <TextInput
            style={styles.textArea}
            value={reason}
            onChangeText={setReason}
            placeholder="Describe the damage, theft, or misuse incident..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Claim Amount *</Text>
          <TextInput
            style={styles.input}
            value={claimAmount}
            onChangeText={setClaimAmount}
            placeholder="Enter repair/replacement cost"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Photo Evidence</Text>
          <TouchableOpacity style={styles.photoUpload} onPress={handlePhotoUpload}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.uploadedPhoto} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color="#6b7280" />
                <Text style={styles.photoText}>Upload Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Claims are reviewed within 24-48 hours. Coverage is up to $5,000.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Filing...' : 'File Claim'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  content: {
    flex: 1,
    padding: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827'
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100
  },
  photoUpload: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120
  },
  uploadedPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8
  },
  photoText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  disabledButton: {
    backgroundColor: '#9ca3af'
  }
});