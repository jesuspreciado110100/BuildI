import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TopNavigation } from './TopNavigation';
import { AnimatedTabBar } from './AnimatedTabBar';
import { MySitesTab } from './MySitesTab';
import { ReadOnlyConceptDetailsModal } from './ReadOnlyConceptDetailsModal';
import { ConceptTimeLapseTab } from './ConceptTimeLapseTab';
import { ClientReportsTab } from './ClientReportsTab';
import { User } from '../types';

interface EnhancedClientDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EnhancedClientDashboard: React.FC<EnhancedClientDashboardProps> = ({
  user,
  onLogout
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('sites');
  const [showConceptModal, setShowConceptModal] = useState(false);

  const tabs = [
    {
      key: 'sites',
      label: 'My Sites',
      icon: '🏗️',
      component: MySitesTab
    },
    {
      key: 'concept',
      label: 'Concept View',
      icon: '👁️',
      component: null // Special handling
    },
    {
      key: 'timelapse',
      label: 'Time-Lapse',
      icon: '⏱️',
      component: ConceptTimeLapseTab
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: '📊',
      component: ClientReportsTab
    }
  ];

  const renderTabContent = () => {
    if (activeTab === 'concept') {
      return (
        <View style={[styles.conceptContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.conceptHeader}>
            <Text style={[styles.conceptTitle, { color: theme.colors.text }]}>
              Project Concept View
            </Text>
            <Text style={[styles.conceptSubtitle, { color: theme.colors.textSecondary }]}>
              View your project concepts and progress (Read-only)
            </Text>
          </View>
          
          <View style={[styles.conceptCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.conceptCardTitle, { color: theme.colors.text }]}>
              📋 Downtown Plaza Project
            </Text>
            <Text style={[styles.conceptCardDescription, { color: theme.colors.textSecondary }]}>
              Commercial development with retail and office spaces
            </Text>
            <View style={styles.conceptProgress}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                Progress: 75%
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.colors.primary, width: '75%' }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={[styles.conceptCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.conceptCardTitle, { color: theme.colors.text }]}>
              🏢 Shopping Center Project
            </Text>
            <Text style={[styles.conceptCardDescription, { color: theme.colors.textSecondary }]}>
              Large-scale retail complex with parking facilities
            </Text>
            <View style={styles.conceptProgress}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                Progress: 45%
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.colors.primary, width: '45%' }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      );
    }

    const activeTabData = tabs.find(tab => tab.key === activeTab);
    if (!activeTabData?.component) return null;

    const TabComponent = activeTabData.component;
    return <TabComponent userId={user.id} userRole={user.role} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavigation
        user={user}
        onLogout={onLogout}
      />
      
      <AnimatedTabBar
        tabs={tabs.map(tab => ({
          key: tab.key,
          label: tab.label,
          icon: tab.icon
        }))}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      <ReadOnlyConceptDetailsModal
        visible={showConceptModal}
        onClose={() => setShowConceptModal(false)}
        conceptId="concept-1"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  conceptContainer: {
    flex: 1,
    padding: 16,
  },
  conceptHeader: {
    marginBottom: 20,
  },
  conceptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conceptSubtitle: {
    fontSize: 16,
  },
  conceptCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  conceptCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  conceptCardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  conceptProgress: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});