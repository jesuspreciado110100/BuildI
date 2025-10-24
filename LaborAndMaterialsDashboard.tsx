import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HireLaborTab } from './HireLaborTab';
import { LaborRequestHistoryTab } from './LaborRequestHistoryTab';
import { MicroJobRequestForm } from './MicroJobRequestForm';
import { MicroJobHistoryTab } from './MicroJobHistoryTab';
import { LaborPerformanceTab } from './LaborPerformanceTab';
import { MaterialCatalogView } from './MaterialCatalogView';
import { MaterialQuoteRequestForm } from './MaterialQuoteRequestForm';
import { CompareQuotesTab } from './CompareQuotesTab';
import { MaterialOrdersTab } from './MaterialOrdersTab';

export default function LaborAndMaterialsDashboard() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('labor');
  const [activeLaborTab, setActiveLaborTab] = useState('hire');
  const [activeMaterialTab, setActiveMaterialTab] = useState('catalog');
  const [showMicroJobForm, setShowMicroJobForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const laborTabs = [
    { key: 'hire', label: 'Hire Labor', icon: '🔍' },
    { key: 'requests', label: 'Requests', icon: '📩' },
    { key: 'microjobs', label: 'Microjobs', icon: '📋' },
    { key: 'performance', label: 'Performance', icon: '📊' }
  ];

  const materialTabs = [
    { key: 'catalog', label: 'Browse Catalog', icon: '🛒' },
    { key: 'quotes', label: 'Request Quotes', icon: '📨' },
    { key: 'compare', label: 'Compare Offers', icon: '📊' },
    { key: 'orders', label: 'Orders', icon: '📦' }
  ];

  const renderLaborContent = () => {
    if (activeLaborTab === 'microjobs' && showMicroJobForm) {
      return <MicroJobRequestForm onClose={() => setShowMicroJobForm(false)} />;
    }

    switch (activeLaborTab) {
      case 'hire':
        return <HireLaborTab />;
      case 'requests':
        return <LaborRequestHistoryTab />;
      case 'microjobs':
        return <MicroJobHistoryTab onCreateNew={() => setShowMicroJobForm(true)} />;
      case 'performance':
        return <LaborPerformanceTab />;
      default:
        return <HireLaborTab />;
    }
  };

  const renderMaterialContent = () => {
    if (activeMaterialTab === 'quotes' && showQuoteForm) {
      return <MaterialQuoteRequestForm onClose={() => setShowQuoteForm(false)} />;
    }

    switch (activeMaterialTab) {
      case 'catalog':
        return <MaterialCatalogView />;
      case 'quotes':
        return <MaterialQuoteRequestForm onClose={() => setShowQuoteForm(false)} />;
      case 'compare':
        return <CompareQuotesTab />;
      case 'orders':
        return <MaterialOrdersTab />;
      default:
        return <MaterialCatalogView />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Main Section Tabs */}
      <View style={[styles.sectionTabs, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.sectionTab, activeSection === 'labor' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveSection('labor')}
        >
          <Text style={[styles.sectionTabText, { color: activeSection === 'labor' ? '#fff' : theme.colors.text }]}>
            👷 Labor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, activeSection === 'materials' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveSection('materials')}
        >
          <Text style={[styles.sectionTabText, { color: activeSection === 'materials' ? '#fff' : theme.colors.text }]}>
            🧱 Materials
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsContainer}>
        <View style={styles.subTabs}>
          {(activeSection === 'labor' ? laborTabs : materialTabs).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.subTab,
                (activeSection === 'labor' ? activeLaborTab : activeMaterialTab) === tab.key && 
                { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => {
                if (activeSection === 'labor') {
                  setActiveLaborTab(tab.key);
                } else {
                  setActiveMaterialTab(tab.key);
                }
              }}
            >
              <Text style={[styles.subTabText, { 
                color: (activeSection === 'labor' ? activeLaborTab : activeMaterialTab) === tab.key ? '#fff' : theme.colors.text 
              }]}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeSection === 'labor' ? renderLaborContent() : renderMaterialContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  sectionTabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTabsContainer: {
    maxHeight: 60,
  },
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});