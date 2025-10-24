import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MachineryScreen } from '../components/MachineryScreen';

export default function MachineryTab() {
  return (
    <View style={styles.container}>
      <MachineryScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});