import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onSubmit: (paymentData: any) => Promise<void>;
}

export function PaymentModal({ visible, onClose, orderId, amount, onSubmit }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all payment details');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        orderId,
        amount,
        cardNumber,
        expiryDate,
        cvv
      });
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Payment Details</Text>
          <Text style={styles.amount}>Amount: ${amount.toFixed(2)}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={16}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={setExpiryDate}
              maxLength={5}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVV"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Processing...' : 'Pay Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  amount: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1,
    marginBottom: 16
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  }
});