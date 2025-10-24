import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { LocalizationService } from '../services/LocalizationService';

interface UnitSystemPickerProps {
  currentUnitSystem: 'metric' | 'imperial';
  onUnitSystemChange: (unitSystem: 'metric' | 'imperial') => void;
  style?: any;
}

export const UnitSystemPicker: React.FC<UnitSystemPickerProps> = ({
  currentUnitSystem,
  onUnitSystemChange,
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const unitSystems = LocalizationService.getAvailableUnitSystems();

  const handleUnitSystemSelect = (unitSystemCode: 'metric' | 'imperial') => {
    onUnitSystemChange(unitSystemCode);
    LocalizationService.setUnitSystem(unitSystemCode);
    setIsVisible(false);
  };

  const getCurrentUnitSystemName = () => {
    const current = unitSystems.find(system => system.code === currentUnitSystem);
    return current?.name || 'Metric';
  };

  const getUnitExamples = (system: 'metric' | 'imperial') => {
    if (system === 'metric') {
      return 'kg, m, m²';
    }
    return 'lbs, ft, ft²';
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{LocalizationService.t('common.units')}</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setIsVisible(true)}
      >
        <View>
          <Text style={styles.pickerText}>{getCurrentUnitSystemName()}</Text>
          <Text style={styles.exampleText}>{getUnitExamples(currentUnitSystem)}</Text>
        </View>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{LocalizationService.t('common.units')}</Text>
            <FlatList
              data={unitSystems}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    currentUnitSystem === item.code && styles.selectedOption
                  ]}
                  onPress={() => handleUnitSystemSelect(item.code)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.unitText,
                      currentUnitSystem === item.code && styles.selectedText
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.unitExampleText,
                      currentUnitSystem === item.code && styles.selectedExampleText
                    ]}>
                      {getUnitExamples(item.code)}
                    </Text>
                  </View>
                  {currentUnitSystem === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 250,
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionContent: {
    flex: 1,
  },
  unitText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  unitExampleText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedExampleText: {
    color: '#cce7ff',
  },
  checkmark: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});