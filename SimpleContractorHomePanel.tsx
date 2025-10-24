import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function SimpleContractorHomePanel() {
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
    }
  ]);

  const [actionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Labor Request Pending',
      type: 'labor',
      priority: 'high',
      description: '3 electricians needed for Site 1',
      dueDate: '2024-01-20'
    },
    {
      id: '2',
      title: 'Material Delivery',
      type: 'materials',
      priority: 'medium',
      description: 'Steel beams arriving tomorrow',
      dueDate: '2024-01-19'
    },
    {
      id: '3',
      title: 'Machinery Rental',
      type: 'machinery',
      priority: 'low',
      description: 'Crane rental expires in 3 days'
    }
  ]);

  const quickActions = [
    {
      id: 'workforce',
      title: 'Workforce',
      icon: 'people-outline',
      route: '/contractor/workforce',
      color: '#10B981'
    },
    {
      id: 'community',
      title: 'Community',
      icon: 'chatbubbles-outline',
      route: '/contractor/community',
      color: '#8B5CF6'
    }
  ];

  const handleSitePress = (siteId: string) => {
    console.log('Site pressed:', siteId);
  };

  const handleActionPress = (action: ActionItem) => {
    if (action.type === 'labor') {
      router.push('/contractor/workforce');
    } else {
      console.log('Action pressed:', action.type);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'delayed':
        return '#F59E0B';
      case 'at risk':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={() => router.push(action.route)}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sites</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={styles.siteCard}
                onPress={() => handleSitePress(site.id)}
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionCard}
              onPress={() => handleActionPress(item)}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>
              <Text style={styles.actionDescription}>{item.description}</Text>
              {item.dueDate && (
                <Text style={styles.actionDueDate}>Due: {item.dueDate}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  role: {
    fontSize: 14,
    color: '#666',
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
    color: '#333'
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8
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
    color: '#333',
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
    color: '#666',
    marginBottom: 12
  },
  progressSection: {
    marginTop: 8
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  actionDueDate: {
    fontSize: 12,
    color: '#999'
  }
});