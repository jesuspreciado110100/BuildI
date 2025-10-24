import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SiteProgressPanel } from './SiteProgressPanel';
import { ProgressGraph } from './ProgressGraph';
import { ConceptList } from './ConceptList';
import { BIMViewer } from './BIMViewer';
import { SharedFilesTab } from './SharedFilesTab';
import { PaymentFlowPanel, ROIEstimatorPanel, CostComparisonPanel, ExportPanel, SafetyLogTab, MilestoneCalendarView, TradeOfferBookingsTimeline } from './MissingComponents';

interface SiteOverviewPanelProps {
  siteId: string;
  siteName: string;
  onConceptPress: (conceptId: string) => void;
}

type TabType = 'overview' | 'tasks' | 'documents' | 'calendar' | 'payments' | 'analytics' | 'safety';

export const SiteOverviewPanel: React.FC<SiteOverviewPanelProps> = ({
  siteId,
  siteName,
  onConceptPress
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks & Concepts' },
    { id: 'documents', label: 'Documents' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'payments', label: 'Payments' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'safety', label: 'Safety' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <SiteProgressPanel siteId={siteId} />
            <ProgressGraph siteId={siteId} />
            <BIMViewer siteId={siteId} />
            <ConceptList siteId={siteId} onConceptPress={onConceptPress} />
          </View>
        );
      case 'tasks':
        return (
          <View>
            <ConceptList siteId={siteId} onConceptPress={onConceptPress} showCreateButton />
          </View>
        );
      case 'documents':
        return <SharedFilesTab siteId={siteId} />;
      case 'calendar':
        return (
          <View>
            <MilestoneCalendarView siteId={siteId} />
            <TradeOfferBookingsTimeline siteId={siteId} />
          </View>
        );
      case 'payments':
        return <PaymentFlowPanel siteId={siteId} />;
      case 'analytics':
        return (
          <View>
            <ROIEstimatorPanel siteId={siteId} />
            <CostComparisonPanel siteId={siteId} />
            <ExportPanel siteId={siteId} />
          </View>
        );
      case 'safety':
        return <SafetyLogTab siteId={siteId} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{siteName}</Text>
        <Text style={styles.subtitle}>Site Overview</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});