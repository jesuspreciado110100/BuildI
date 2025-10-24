import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: 'pending' | 'verified' | 'expired' | 'error';
  showText?: boolean;
}

export default function VerificationStatusBadge({ status, showText = true }: Props) {
  const config = {
    pending: { icon: '⏳', text: 'Pending', color: '#FFA500' },
    verified: { icon: '✅', text: 'Verified', color: '#28a745' },
    expired: { icon: '⏰', text: 'Expired', color: '#dc3545' },
    error: { icon: '❌', text: 'Error', color: '#dc3545' }
  };

  const current = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: current.color + '20' }]}>
      <Text style={styles.icon}>{current.icon}</Text>
      {showText && (
        <Text style={[styles.text, { color: current.color }]}>{current.text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  icon: { fontSize: 16, marginRight: 6 },
  text: { fontSize: 14, fontWeight: '600' }
});
