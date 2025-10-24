import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { LanguagePicker } from './LanguagePicker';
import { UnitSystemPicker } from './UnitSystemPicker';
import { LocalizationService } from '../services/LocalizationService';
import { User } from '../types';

interface UserSettingsPanelProps {
  user: User;
  onUserUpdate: (updatedUser: Partial<User>) => void;
}

export const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({
  user,
  onUserUpdate
}) => {
  const [language, setLanguage] = useState<'en' | 'es'>(user.language as 'en' | 'es' || 'en');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(user.unit_system || 'metric');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(false);

  useEffect(() => {
    // Initialize LocalizationService with user preferences
    LocalizationService.setLanguage(language);
    LocalizationService.setUnitSystem(unitSystem);
  }, [language, unitSystem]);

  const handleLanguageChange = (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage);
    onUserUpdate({ language: newLanguage });
  };

  const handleUnitSystemChange = (newUnitSystem: 'metric' | 'imperial') => {
    setUnitSystem(newUnitSystem);
    onUserUpdate({ unit_system: newUnitSystem });
  };

  const handleAutoDetectToggle = (enabled: boolean) => {
    setAutoDetectLanguage(enabled);
    
    if (enabled) {
      const detectedLanguage = LocalizationService.detectBrowserLanguage();
      if (detectedLanguage !== language) {
        Alert.alert(
          LocalizationService.t('common.info'),
          `${LocalizationService.t('common.language')} ${detectedLanguage === 'es' ? 'Español' : 'English'}?`,
          [
            {
              text: LocalizationService.t('common.cancel'),
              style: 'cancel'
            },
            {
              text: LocalizationService.t('common.ok'),
              onPress: () => handleLanguageChange(detectedLanguage)
            }
          ]
        );
      }
    }
  };

  const getUnitSystemDescription = () => {
    if (unitSystem === 'metric') {
      return LocalizationService.t('common.metric') + ' (kg, m, m², °C)';
    }
    return LocalizationService.t('common.imperial') + ' (lbs, ft, ft², °F)';
  };

  const getLanguageDescription = () => {
    const languages = LocalizationService.getAvailableLanguages();
    const current = languages.find(lang => lang.code === language);
    return current?.name || 'English';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{LocalizationService.t('common.language')}</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-detect Language</Text>
            <Text style={styles.settingDescription}>
              Automatically detect browser/device language
            </Text>
          </View>
          <Switch
            value={autoDetectLanguage}
            onValueChange={handleAutoDetectToggle}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>

        <LanguagePicker
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          style={styles.picker}
        />
        
        <Text style={styles.currentSetting}>
          {LocalizationService.t('common.language')}: {getLanguageDescription()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{LocalizationService.t('common.units')}</Text>
        
        <UnitSystemPicker
          currentUnitSystem={unitSystem}
          onUnitSystemChange={handleUnitSystemChange}
          style={styles.picker}
        />
        
        <Text style={styles.currentSetting}>
          {LocalizationService.t('common.units')}: {getUnitSystemDescription()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{LocalizationService.t('dashboard.title')}</Text>
          <Text style={styles.previewText}>
            {LocalizationService.formatProgressMessage(18, 'volume', 'concrete', 'poured')}
          </Text>
          <Text style={styles.previewText}>
            {LocalizationService.formatMeasurement(1200, 'weight')} {LocalizationService.t('concepts.steel')}
          </Text>
          <Text style={styles.previewText}>
            {LocalizationService.formatNotification('booking_confirmed', {
              measurement: 5.2,
              unitType: 'area'
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  picker: {
    marginBottom: 12,
  },
  currentSetting: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  previewText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});