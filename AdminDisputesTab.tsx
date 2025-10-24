import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { AdminDispute } from '../types';
import { AdminService } from '../services/AdminService';
import RentalGuaranteeService, { GuaranteeClaim } from '../services/RentalGuaranteeService';
import { styles } from './AdminDisputesTabStyles';

interface AdminDisputesTabProps {
  onDisputeSelect: (dispute: AdminDispute) => void;
}

export const AdminDisputesTab: React.FC<AdminDisputesTabProps> = ({ onDisputeSelect }) => {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [guaranteeClaims, setGuaranteeClaims] = useState<GuaranteeClaim[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<AdminDispute[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<GuaranteeClaim | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDisputes();
  }, [disputes, guaranteeClaims, statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      const [disputesData, claimsData] = await Promise.all([
        AdminService.getAllDisputes(),
        RentalGuaranteeService.getClaims()
      ]);
      setDisputes(disputesData);
      setGuaranteeClaims(claimsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDisputes = () => {
    let filtered = disputes;
    let filteredClaims = guaranteeClaims;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === statusFilter);
      filteredClaims = filteredClaims.filter(claim => claim.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      if (typeFilter === 'guarantee') {
        filtered = [];
      } else {
        filtered = filtered.filter(dispute => dispute.type === typeFilter);
        filteredClaims = [];
      }
    }

    const combinedData = [
      ...filtered,
      ...filteredClaims.map(claim => ({
        ...claim,
        type: 'guarantee' as const,
        order_id: claim.booking_id,
        description: claim.reason,
        provider_id: claim.renter_id,
        contractor_id: claim.contractor_id
      }))
    ];

    setFilteredDisputes(combinedData);
  };

  const handleDisputeAction = async (disputeId: string, action: 'resolve' | 'escalate' | 'refund') => {
    try {
      await AdminService.updateDisputeStatus(disputeId, action, resolutionNotes);
      setDisputes(disputes.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: action === 'resolve' ? 'resolved' : 'escalated', resolution_notes: resolutionNotes }
          : dispute
      ));
      setSelectedDispute(null);
      setResolutionNotes('');
      Alert.alert('Success', `Dispute ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing dispute:`, error);
      Alert.alert('Error', `Failed to ${action} dispute`);
    }
  };

  const handleClaimAction = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await RentalGuaranteeService.approveClaim(claimId, resolutionNotes);
      } else {
        await RentalGuaranteeService.rejectClaim(claimId, resolutionNotes);
      }
      
      setGuaranteeClaims(guaranteeClaims.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: action === 'approve' ? 'approved' : 'rejected', admin_notes: resolutionNotes }
          : claim
      ));
      setSelectedClaim(null);
      setResolutionNotes('');
      Alert.alert('Success', `Claim ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing claim:`, error);
      Alert.alert('Error', `Failed to ${action} claim`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'pending': return '#FFA500';
      case 'investigating': return '#007AFF';
      case 'resolved':
      case 'approved': return '#28A745';
      case 'escalated':
      case 'rejected': return '#DC3545';
      default: return '#666';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labor': return '#FF6B6B';
      case 'machinery': return '#4ECDC4';
      case 'material': return '#45B7D1';
      case 'guarantee': return '#8B5CF6';
      default: return '#666';
    }
  };

  const renderDispute = ({ item }: { item: any }) => {
    const isGuaranteeClaim = item.type === 'guarantee';
    
    return (
      <View style={styles.disputeCard}>
        <TouchableOpacity onPress={() => onDisputeSelect(item)} style={styles.disputeInfo}>
          <View style={styles.disputeHeader}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.typeBadgeText}>{item.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={styles.disputeDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.disputeDetails}>
            <Text style={styles.disputeInfo}>
              {isGuaranteeClaim ? 'Booking ID:' : 'Order ID:'} {item.order_id}
            </Text>
            {isGuaranteeClaim && (
              <Text style={styles.disputeInfo}>
                Claim Amount: ${item.claim_amount?.toFixed(2)}
              </Text>
            )}
            <Text style={styles.disputeDate}>
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        
        {(item.status === 'open' || item.status === 'pending') && (
          <View style={styles.disputeActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={() => {
                if (isGuaranteeClaim) {
                  setSelectedClaim(item);
                } else {
                  setSelectedDispute(item);
                }
              }}
            >
              <Text style={styles.actionButtonText}>Actions</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterRow}>
          {['all', 'open', 'pending', 'investigating', 'resolved', 'approved', 'rejected', 'escalated'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.activeFilter]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.activeFilterText]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.filterLabel}>Type:</Text>
        <View style={styles.filterRow}>
          {['all', 'labor', 'machinery', 'material', 'guarantee'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, typeFilter === type && styles.activeFilter]}
              onPress={() => setTypeFilter(type)}
            >
              <Text style={[styles.filterText, typeFilter === type && styles.activeFilterText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <FlatList
        data={filteredDisputes}
        renderItem={renderDispute}
        keyExtractor={(item) => item.id}
        style={styles.disputeList}
      />
      
      {selectedDispute && (
        <View style={styles.actionModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dispute Actions</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Resolution notes..."
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resolveButton]}
                onPress={() => handleDisputeAction(selectedDispute.id, 'resolve')}
              >
                <Text style={styles.modalButtonText}>Resolve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.escalateButton]}
                onPress={() => handleDisputeAction(selectedDispute.id, 'escalate')}
              >
                <Text style={styles.modalButtonText}>Escalate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.refundButton]}
                onPress={() => handleDisputeAction(selectedDispute.id, 'refund')}
              >
                <Text style={styles.modalButtonText}>Refund</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedDispute(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {selectedClaim && (
        <View style={styles.actionModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guarantee Claim Actions</Text>
            <Text style={styles.claimDetails}>
              Amount: ${selectedClaim.claim_amount?.toFixed(2)}
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Admin notes..."
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resolveButton]}
                onPress={() => handleClaimAction(selectedClaim.id, 'approve')}
              >
                <Text style={styles.modalButtonText}>Approve Payout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.refundButton]}
                onPress={() => handleClaimAction(selectedClaim.id, 'reject')}
              >
                <Text style={styles.modalButtonText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedClaim(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};