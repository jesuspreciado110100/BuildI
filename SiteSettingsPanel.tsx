import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Site } from '../types';
import { TimezoneService } from '../services/TimezoneService';

interface SiteSettingsPanelProps {
  site: Site;
  onSiteUpdate: (site: Site) => void;
  onClose: () => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'America/Mexico_City', label: 'Mexico City Time (UTC-6)' },
  { value: 'Europe/London', label: 'GMT (UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (UTC+9)' }
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'CAD', label: 'Canadian Dollar' },
  { value: 'MXN', label: 'Mexican Peso' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
  { value: 'JPY', label: 'Japanese Yen' }
];

export const SiteSettingsPanel: React.FC<SiteSettingsPanelProps> = ({
  site,
  onSiteUpdate,
  onClose
}) => {
  const { theme } = useTheme();
  const [editedSite, setEditedSite] = useState<Site>(site);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleSave = () => {
    onSiteUpdate(editedSite);
    onClose();
  };

  const updateSiteField = (field: keyof Site, value: any) => {
    setEditedSite(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentTime = () => {
    if (editedSite.timezone) {
      return TimezoneService.getCurrentSiteTime(editedSite.timezone);
    }
    return 'Select timezone';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Site Settings</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, { color: theme.colors.primary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Site Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editedSite.name}
              onChangeText={(text) => updateSiteField('name', text)}
              placeholder="Enter site name"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editedSite.location}
              onChangeText={(text) => updateSiteField('location', text)}
              placeholder="Enter location"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Country</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editedSite.country}
              onChangeText={(text) => updateSiteField('country', text)}
              placeholder="Enter country"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Region</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editedSite.region}
              onChangeText={(text) => updateSiteField('region', text)}
              placeholder="Enter region"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timezone & Currency</Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Timezone</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
            >
              <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
                {TIMEZONES.find(tz => tz.value === editedSite.timezone)?.label || 'Select timezone'}
              </Text>
              <Text style={[styles.currentTime, { color: theme.colors.textSecondary }]}>
                Current: {getCurrentTime()}
              </Text>
            </TouchableOpacity>
            
            {showTimezoneDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {TIMEZONES.map(timezone => (
                  <TouchableOpacity
                    key={timezone.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateSiteField('timezone', timezone.value);
                      setShowTimezoneDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                      {timezone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Currency</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            >
              <Text style={[styles.dropdownText, { color: theme.colors.text }]}>
                {CURRENCIES.find(curr => curr.value === editedSite.currency)?.label || 'Select currency'}
              </Text>
            </TouchableOpacity>
            
            {showCurrencyDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                {CURRENCIES.map(currency => (
                  <TouchableOpacity
                    key={currency.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateSiteField('currency', currency.value);
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                      {currency.label} ({currency.value})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
  },
  currentTime: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});