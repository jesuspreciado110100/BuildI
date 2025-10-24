import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LaborProposal } from '../types';

interface ContractViewerModalProps {
  visible: boolean;
  onClose: () => void;
  proposal: LaborProposal | null;
  onSign?: () => void;
}

const ContractViewerModal: React.FC<ContractViewerModalProps> = ({
  visible,
  onClose,
  proposal,
  onSign
}) => {
  if (!proposal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Labor Contract</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.contractInfo}>
            <Text style={styles.sectionTitle}>Contract Details</Text>
            <Text style={styles.infoText}>Proposal ID: {proposal.id}</Text>
            <Text style={styles.infoText}>Total Amount: ${proposal.proposed_price}</Text>
            <Text style={styles.infoText}>Start Date: {proposal.available_start_date}</Text>
            <Text style={styles.infoText}>Payment Terms: {proposal.payment_terms || 'Standard terms'}</Text>
          </View>

          <View style={styles.contractText}>
            <Text style={styles.sectionTitle}>Agreement Terms</Text>
            <Text style={styles.legalText}>
              This Labor Service Agreement outlines the terms and conditions for construction services.
              {"\n\n"}
              The labor chief agrees to provide skilled workers for the specified project duration.
              Payment will be made according to the agreed schedule.
              {"\n\n"}
              Both parties must comply with all safety regulations and local labor laws.
              Either party may terminate this agreement with proper notice.
            </Text>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Signature Status</Text>
            {proposal.is_signed ? (
              <View style={styles.signedBadge}>
                <Text style={styles.signedText}>✓ Signed</Text>
                <Text style={styles.signedDate}>Signed on: {proposal.signed_at}</Text>
              </View>
            ) : (
              <View style={styles.unsignedBadge}>
                <Text style={styles.unsignedText}>⚠ Awaiting Signature</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {!proposal.is_signed && onSign && (
            <TouchableOpacity onPress={onSign} style={styles.signButton}>
              <Text style={styles.signButtonText}>Mark as Signed</Text>
            </TouchableOpacity>
          )}
          {proposal.contract_url && (
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contractInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  contractText: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  signatureSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  signedBadge: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  signedText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signedDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  unsignedBadge: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  unsignedText: {
    color: '#856404',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  signButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  signButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ContractViewerModal;