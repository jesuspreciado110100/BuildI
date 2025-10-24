import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LanguagePickerProps {
  onClose: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguagePicker({ onClose }: LanguagePickerProps) {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you would typically save to storage and update app language
    console.log('Language selected:', languageCode);
    onClose();
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Language</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[styles.languageItem, { backgroundColor: theme.cardBackground }]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={[styles.languageName, { color: theme.text }]}>{language.name}</Text>
              {selectedLanguage === language.code && (
                <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});