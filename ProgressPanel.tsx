import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressReviewPanel from './ProgressReviewPanel';

interface ProgressPanelProps {
  contractorId: string;
}

export default function ProgressPanel({ contractorId }: ProgressPanelProps) {
  return (
    <View style={styles.container}>
      <ProgressReviewPanel contractorId={contractorId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  }
});