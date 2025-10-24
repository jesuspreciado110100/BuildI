import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SiteActionItemsModal from './SiteActionItemsModal';
import HomeFAB from './HomeFAB';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
}

interface ActionItem {
  id: string;
  title: string;
  type: 'labor' | 'materials' | 'machinery' | 'progress' | 'chat';
  priority: 'high' | 'medium' | 'low';
  description: string;
  dueDate?: string;
}

export default function UpdatedContractorHomePanel() {
  const [sites] = useState<Site[]>([
    {
      id: '1',
      name: 'Downtown Office Complex',
      location: 'New York, NY',
      status: 'Active',
      progress: 65
    },
    {
      id: '2',
      name: 'Residential Tower',
      location: 'Los Angeles, CA',
      status: 'Active',
      progress: 30
    },
    {
      id: '3',
      name: 'Shopping Center',
      location: 'Chicago, IL',
      status: 'Active',
      progress: 85
    }
  ]);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock action items for each site
  const getSiteActionItems = (siteId: string): ActionItem[] => {
    const allActionItems: { [key: string]: ActionItem[] } = {
      '1': [
        {
          id: '1-1',
          title: 'Labor Request Pending',
          type: 'labor',
          priority: 'high',
          description: '3 electricians needed for electrical work',
          dueDate: '2024-01-20'
        },
        {
          id: '1-2',
          title: 'Material Delivery',
          type: 'materials',
          priority: 'medium',
          description: 'Steel beams arriving tomorrow',
          dueDate: '2024-01-19'
        },
        {
          id: '1-3',
          title: 'Progress Update Required',
          type: 'progress',
          priority: 'low',
          description: 'Weekly progress report due'
        }
      ],
      '2': [
        {
          id: '2-1',
          title: 'Machinery Rental',
          type: 'machinery',
          priority: 'high',
          description: 'Crane rental expires in 2 days',
          dueDate: '2024-01-21'
        },
        {
          id: '2-2',
          title: 'Safety Meeting',
          type: 'chat',
          priority: 'medium',
          description: 'Monthly safety briefing scheduled'
        }
      ],
      '3': [
        {
          id: '3-1',
          title: 'Final Inspection',
          type: 'progress',
          priority: 'high',
          description: 'Building inspection scheduled for next week',
          dueDate: '2024-01-25'
        }
      ]
    };
    return allActionItems[siteId] || [];
  };

  const handleSitePress = (site: Site) => {
    setSelectedSite(site);
    setModalVisible(true);
  };

  const handleActionPress = (action: ActionItem) => {
    console.log('Action pressed:', action.type);
    setModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#10B981';
      case 'delayed': return '#F59E0B';
      case 'at risk': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.role}>Contractor Dashboard</Text>
        </View>
        <View style={styles.notificationBell}>
          <Text style={styles.notificationCount}>5</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Sites Section - Now at the top */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sites</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={styles.siteCard}
                onPress={() => handleSitePress(site)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
                    <Text style={styles.statusText}>{site.status}</Text>
                  </View>
                </View>
                <Text style={styles.siteLocation}>{site.location}</Text>
                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>Progress: {site.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${site.progress}%` }]} />
                  </View>
                </View>
                <View style={styles.actionItemsHint}>
                  <Ionicons name="list-outline" size={16} color="#666" />
                  <Text style={styles.hintText}>Tap to view action items</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>Material delivery completed at Downtown Office Complex</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>New labor request submitted for Residential Tower</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </View>
        </View>
      </ScrollView>

      {/* Site Action Items Modal */}
      <SiteActionItemsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        siteName={selectedSite?.name || ''}
        actionItems={selectedSite ? getSiteActionItems(selectedSite.id) : []}
        onActionPress={handleActionPress}
      />

      {/* Floating Action Button */}
      <HomeFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  role: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  notificationBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827'
  },
  siteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  siteLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  progressSection: {
    marginTop: 8
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3
  },
  actionItemsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF'
  }
});
