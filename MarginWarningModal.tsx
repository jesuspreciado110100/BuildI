import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MarginWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
  warningMessage: string;
  marginDrop: number;
  delayDays: number;
}

const MarginWarningModal: React.FC<MarginWarningModalProps> = ({
  visible,
  onClose,
  onProceed,
  warningMessage,
  marginDrop,
  delayDays
}) => {
  const { theme } = useTheme();

  const handleProceed = () => {
    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to proceed with this quote despite the margin risk?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', style: 'destructive', onPress: onProceed }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Margin Risk Warning</Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.warningText, { color: theme.colors.text }]}>
              {warningMessage}
            </Text>

            <View style={styles.riskDetails}>
              <View style={styles.riskItem}>
                <Text style={[styles.riskLabel, { color: theme.colors.textSecondary }]}>Potential Delay:</Text>
                <Text style={[styles.riskValue, { color: '#ff4444' }]}>{delayDays} days</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={[styles.riskLabel, { color: theme.colors.textSecondary }]}>Margin Impact:</Text>
                <Text style={[styles.riskValue, { color: '#ff4444' }]}>-{marginDrop}%</Text>
              </View>
            </View>

            <View style={styles.recommendations}>
              <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>Recommendations:</Text>
              <Text style={[styles.recommendationItem, { color: theme.colors.textSecondary }]}>• Add buffer time to project timeline</Text>
              <Text style={[styles.recommendationItem, { color: theme.colors.textSecondary }]}>• Include contingency costs in quote</Text>
              <Text style={[styles.recommendationItem, { color: theme.colors.textSecondary }]}>• Consider alternative scheduling</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Revise Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.proceedButton]}
              onPress={handleProceed}
            >
              <Text style={styles.proceedButtonText}>Proceed Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  content: {
    marginBottom: 24
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  riskDetails: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20
  },
  riskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '500'
  },
  riskValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  recommendations: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  recommendationItem: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1
  },
  proceedButton: {
    backgroundColor: '#ff4444'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default MarginWarningModal;