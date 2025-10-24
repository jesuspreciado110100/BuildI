import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  viewMode: 'dashboard' | 'map';
  onToggle: (mode: 'dashboard' | 'map') => void;
}

export const ViewModeToggle: React.FC<Props> = ({ viewMode, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.leftButton,
          viewMode === 'dashboard' && styles.activeButton
        ]}
        onPress={() => onToggle('dashboard')}
      >
        <Text style={[
          styles.toggleText,
          viewMode === 'dashboard' && styles.activeText
        ]}>
          📊 Dashboard
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.rightButton,
          viewMode === 'map' && styles.activeButton
        ]}
        onPress={() => onToggle('map')}
      >
        <Text style={[
          styles.toggleText,
          viewMode === 'map' && styles.activeText
        ]}>
          🗺️ Map
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 2,
    margin: 16,
    marginTop: 8,
    marginBottom: 8
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftButton: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18
  },
  rightButton: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18
  },
  activeButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  activeText: {
    color: 'white'
  }
});