import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { escrowService } from '../services/EscrowService';

interface EscrowCompletionButtonProps {
  escrowId: string;
  onComplete: () => void;
}

const EscrowCompletionButton: React.FC<EscrowCompletionButtonProps> = ({ escrowId, onComplete }) => {
  const handleConfirmCompletion = async () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to release the escrow funds?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await escrowService.releaseEscrow(escrowId);
            Alert.alert('Success', 'Escrow funds released!');
            onComplete();
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#4caf50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
      }}
      onPress={handleConfirmCompletion}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm Completion</Text>
    </TouchableOpacity>
  );
};

export default EscrowCompletionButton;