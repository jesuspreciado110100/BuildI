import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LocalizationService } from '../services/LocalizationService';
import { LanguagePicker } from './LanguagePicker';
import { UnitSystemPicker } from './UnitSystemPicker';
import { LocalizedProgressCard } from './LocalizedProgressCard';
import { LocalizedNotificationCard } from './LocalizedNotificationCard';
import { User, Site } from '../types';

interface LocalizationSystemProps {
  user: User;
  sites: Site[];
  onUserUpdate: (user: Partial<User>) => void;
}

export const LocalizationSystem: React.FC<LocalizationSystemProps> = ({
  user,
  sites,
  onUserUpdate
}) => {
  const [currentTab, setCurrentTab] = useState<'settings' | 'preview'>('settings');
  const [language, setLanguage] = useState<'en' | 'es'>(user.language as 'en' | 'es' || 'en');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(user.unit_system || 'metric');

  useEffect(() => {
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

  const handleAutoDetect = () => {
    const detected = LocalizationService.detectBrowserLanguage();
    if (detected !== language) {
      Alert.alert(
        'Language Detected',
        `Switch to ${detected === 'es' ? 'Spanish' : 'English'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => handleLanguageChange(detected) }
        ]
      );
    }
  };

  const mockNotifications = [
    {
      type: 'booking_confirmed',
      measurement: 1200,
      unitType: 'weight' as const,
      conceptName: 'steel',
      timestamp: new Date().toISOString()
    },
    {
      type: 'progress_updated',
      measurement: 18,
      unitType: 'volume' as const,
      conceptName: 'concrete',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      type: 'material_delivered',
      measurement: 5.2,
      unitType: 'area' as const,
      conceptName: 'flooring',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const mockProgress = [
    { concept: 'concrete', progress: 85, measurement: 18, unitType: 'volume' as const },
    { concept: 'steel', progress: 92, measurement: 1200, unitType: 'weight' as const },
    { concept: 'electrical', progress: 67, measurement: 450, unitType: 'length' as const },
    { concept: 'flooring', progress: 34, measurement: 125, unitType: 'area' as const }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{LocalizationService.t('common.language')} & {LocalizationService.t('common.units')}</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'settings' && styles.activeTab]}
            onPress={() => setCurrentTab('settings')}
          >
            <Text style={[styles.tabText, currentTab === 'settings' && styles.activeTabText]}>
              {LocalizationService.t('common.settings')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'preview' && styles.activeTab]}
            onPress={() => setCurrentTab('preview')}
          >
            <Text style={[styles.tabText, currentTab === 'preview' && styles.activeTabText]}>
              Preview
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {currentTab === 'settings' ? (
          <View style={styles.settingsContainer}>
            <View style={styles.section}>
              <LanguagePicker
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
              />
              <TouchableOpacity style={styles.autoDetectButton} onPress={handleAutoDetect}>
                <Text style={styles.autoDetectText}>Auto-detect Language</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <UnitSystemPicker
                currentUnitSystem={unitSystem}
                onUnitSystemChange={handleUnitSystemChange}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Settings</Text>
              <Text style={styles.settingText}>
                {LocalizationService.t('common.language')}: {language === 'es' ? 'Español' : 'English'}
              </Text>
              <Text style={styles.settingText}>
                {LocalizationService.t('common.units')}: {LocalizationService.t(`common.${unitSystem}`)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{LocalizationService.t('dashboard.progress')}</Text>
              {mockProgress.map((item, index) => (
                <LocalizedProgressCard
                  key={index}
                  conceptName={item.concept}
                  progress={item.progress}
                  measurement={item.measurement}
                  unitType={item.unitType}
                  action="completed"
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{LocalizationService.t('common.notifications')}</Text>
              {mockNotifications.map((notification, index) => (
                <LocalizedNotificationCard
                  key={index}
                  type={notification.type}
                  measurement={notification.measurement}
                  unitType={notification.unitType}
                  conceptName={notification.conceptName}
                  timestamp={notification.timestamp}
                  isRead={index > 0}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: 16,
  },
  previewContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  autoDetectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  autoDetectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
});