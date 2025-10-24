import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LaborRequestScreen } from '../components/LaborRequestScreen';

export default function WorkforceTab() {
  return (
    <View style={styles.container}>
      <LaborRequestScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});