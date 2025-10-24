import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DailyLogTab from './DailyLogTab';

interface DailyLogPanelProps {
  userId: string;
  userRole: string;
  siteId: string;
}

export default function DailyLogPanel({ userId, userRole, siteId }: DailyLogPanelProps) {
  return (
    <View style={styles.container}>
      <DailyLogTab userId={userId} userRole={userRole} siteId={siteId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  }
});