import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import TaxService from '../services/TaxService';

interface ComplianceSettings {
  default_country: string;
  default_invoice_footer: string;
  enable_cfdi: boolean;
  auto_tax_calculation: boolean;
  require_tax_id: boolean;
}

const ComplianceSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ComplianceSettings>({
    default_country: 'US',
    default_invoice_footer: 'Thank you for your business',
    enable_cfdi: false,
    auto_tax_calculation: true,
    require_tax_id: false,
  });

  const supportedRegions = TaxService.getSupportedRegions();
  const [selectedCountry, setSelectedCountry] = useState(settings.default_country);

  const countryNames: Record<string, string> = {
    'MX': 'Mexico',
    'US': 'United States',
    'CA': 'Canada',
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSettings(prev => ({ ...prev, default_country: country }));
    
    // Auto-enable CFDI for Mexico
    if (country === 'MX') {
      setSettings(prev => ({ ...prev, enable_cfdi: true, require_tax_id: true }));
    } else {
      setSettings(prev => ({ ...prev, enable_cfdi: false }));
    }
  };

  const handleFooterChange = (text: string) => {
    setSettings(prev => ({ ...prev, default_invoice_footer: text }));
  };

  const toggleCFDI = (value: boolean) => {
    setSettings(prev => ({ ...prev, enable_cfdi: value }));
  };

  const toggleAutoTax = (value: boolean) => {
    setSettings(prev => ({ ...prev, auto_tax_calculation: value }));
  };

  const toggleRequireTaxId = (value: boolean) => {
    setSettings(prev => ({ ...prev, require_tax_id: value }));
  };

  const getRegionConfig = () => {
    return TaxService.getTaxRegionConfig(selectedCountry);
  };

  const regionConfig = getRegionConfig();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compliance Settings</Text>
      
      {/* Country Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Country/Region</Text>
        <Text style={styles.sectionDescription}>
          Set the default tax region for new invoices and suppliers
        </Text>
        
        <View style={styles.countryGrid}>
          {supportedRegions.map((country) => (
            <TouchableOpacity
              key={country}
              style={[
                styles.countryButton,
                selectedCountry === country && styles.countryButtonSelected
              ]}
              onPress={() => handleCountrySelect(country)}
            >
              <Text style={[
                styles.countryCode,
                selectedCountry === country && styles.countryCodeSelected
              ]}>
                {country}
              </Text>
              <Text style={[
                styles.countryName,
                selectedCountry === country && styles.countryNameSelected
              ]}>
                {countryNames[country]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Region Details */}
      {regionConfig && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Default Tax Rate:</Text>
            <Text style={styles.configValue}>{(regionConfig.tax_rate * 100).toFixed(1)}%</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Tax Label:</Text>
            <Text style={styles.configValue}>{regionConfig.tax_label}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Currency Symbol:</Text>
            <Text style={styles.configValue}>{regionConfig.currency_symbol}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Date Format:</Text>
            <Text style={styles.configValue}>{regionConfig.date_format}</Text>
          </View>
        </View>
      )}

      {/* Invoice Footer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Invoice Footer</Text>
        <Text style={styles.sectionDescription}>
          This text will appear at the bottom of all invoices
        </Text>
        <TextInput
          style={styles.textArea}
          value={settings.default_invoice_footer}
          onChangeText={handleFooterChange}
          placeholder="Enter default footer text..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Compliance Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Options</Text>
        
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Enable Digital Tax Stamp (CFDI)</Text>
            <Text style={styles.toggleDescription}>
              Generate CFDI XML for Mexican tax compliance
            </Text>
          </View>
          <Switch
            value={settings.enable_cfdi}
            onValueChange={toggleCFDI}
            disabled={selectedCountry !== 'MX'}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Auto Tax Calculation</Text>
            <Text style={styles.toggleDescription}>
              Automatically calculate tax based on region settings
            </Text>
          </View>
          <Switch
            value={settings.auto_tax_calculation}
            onValueChange={toggleAutoTax}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Require Tax ID</Text>
            <Text style={styles.toggleDescription}>
              Require suppliers to provide tax identification
            </Text>
          </View>
          <Switch
            value={settings.require_tax_id}
            onValueChange={toggleRequireTaxId}
          />
        </View>
      </View>

      {/* CFDI Status */}
      {settings.enable_cfdi && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CFDI Status</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Digital Tax Stamp Enabled</Text>
            <Text style={styles.statusDescription}>
              CFDI XML files will be generated for Mexican invoices
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>MOCK MODE</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  countryButton: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  countryButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  countryCodeSelected: {
    color: '#007AFF',
  },
  countryName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  countryNameSelected: {
    color: '#007AFF',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
  },
  configValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
});

export default ComplianceSettingsPanel;