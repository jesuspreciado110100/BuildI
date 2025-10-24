import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { GuaranteeClaim } from '../types';
import { GuaranteeService } from '../services/GuaranteeService';

export const AdminGuaranteeClaimsTab: React.FC = () => {
  const [claims, setClaims] = useState<GuaranteeClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<GuaranteeClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const claimsData = await GuaranteeService.getGuaranteeClaims();
      setClaims(claimsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guarantee claims');
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, status: 'approved' | 'rejected' | 'resolved') => {
    try {
      const success = await GuaranteeService.updateClaimStatus(claimId, status, adminNotes);
      if (success) {
        Alert.alert('Success', `Claim ${status} successfully`);
        loadClaims();
        setSelectedClaim(null);
        setAdminNotes('');
      } else {
        Alert.alert('Error', 'Failed to update claim status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update claim status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'resolved': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading claims...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Guarantee Claims</Text>
      
      {claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No guarantee claims found</Text>
        </View>
      ) : (
        claims.map(claim => (
          <View key={claim.id} style={styles.claimCard}>
            <View style={styles.claimHeader}>
              <Text style={styles.claimId}>Claim #{claim.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                <Text style={styles.statusText}>{claim.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.claimDetail}>Booking: {claim.booking_id}</Text>
            <Text style={styles.claimDetail}>Amount: ${claim.claim_amount}</Text>
            <Text style={styles.claimDetail}>Date: {formatDate(claim.created_at)}</Text>
            <Text style={styles.claimReason}>Reason: {claim.reason}</Text>
            
            {claim.photo_url && (
              <Text style={styles.photoLink}>📷 Photo attached</Text>
            )}
            
            {claim.admin_notes && (
              <View style={styles.adminNotesSection}>
                <Text style={styles.adminNotesLabel}>Admin Notes:</Text>
                <Text style={styles.adminNotesText}>{claim.admin_notes}</Text>
              </View>
            )}
            
            {claim.status === 'pending' && (
              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => setSelectedClaim(claim)}
                >
                  <Text style={styles.buttonText}>Review Claim</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
      
      {selectedClaim && (
        <View style={styles.reviewModal}>
          <Text style={styles.modalTitle}>Review Claim #{selectedClaim.id}</Text>
          
          <Text style={styles.modalLabel}>Admin Notes:</Text>
          <TextInput
            style={styles.notesInput}
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Add notes about your decision..."
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => updateClaimStatus(selectedClaim.id, 'approved')}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => updateClaimStatus(selectedClaim.id, 'rejected')}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setSelectedClaim(null);
                setAdminNotes('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  claimCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  claimDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  claimReason: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoLink: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 8,
  },
  adminNotesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  adminNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionSection: {
    marginTop: 12,
  },
  reviewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reviewModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});