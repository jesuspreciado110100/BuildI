import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ActiveSitesCarousel } from './ActiveSitesCarousel';
import { ActionItemCard } from './ActionItemCard';
import { NotificationBell } from './NotificationBell';
import { FABCreateMenu } from './FABCreateMenu';
import { ProgressCheckIntegration } from './ProgressCheckIntegration';
import { ProgressHeatmapPanel } from './ProgressHeatmapPanel';
import ProgressSnapshotTriggerService from '@/app/services/ProgressSnapshotTriggerService';
import { useAuth } from '@/app/context/AuthContext';
import SiteService from '@/app/services/SiteService';

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

export default function ContractorHomePanel() {
  const { user } = useAuth();
  const [fabVisible, setFabVisible] = useState(false);
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

  const fabActions = [
    {
      label: 'Add Site',
      icon: 'business',
      onPress: () => {
        setFabVisible(false);
        router.push('/contractor/sites/create');
      }
    },
    {
      label: 'Request Labor',
      icon: 'people',
      onPress: () => {
        setFabVisible(false);
        router.push('/contractor/workforce/labor/hire');
      }
    },
    {
      label: 'Order Materials',
      icon: 'cube',
      onPress: () => {
        setFabVisible(false);
        router.push('/contractor/workforce/materials/request');
      }
    },
    {
      label: 'Book Machinery',
      icon: 'construct',
      onPress: () => {
        setFabVisible(false);
        router.push('/contractor/machinery/requests');
      }
    }
  ];

  // Realtime trigger for snapshot reminders
  useEffect(() => {
    const triggerSnapshotReminders = async () => {
      if (!user) return;
      
      try {
        const userSites = await SiteService.getSitesForUser(user.id);
        for (const site of userSites) {
          await ProgressSnapshotTriggerService.watchAndNotify(site.id);
        }
      } catch (error) {
        console.error('Failed to trigger snapshot reminders:', error);
      }
    };
    
    triggerSnapshotReminders();
  }, [user]);

  const handleSitePress = (siteId: string) => {
    router.push(`/contractor/sites/${siteId}`);
  };

  const handleActionPress = (action: ActionItem) => {
    switch (action.type) {
      case 'labor':
        router.push('/contractor/workforce/labor/hire');
        break;
      case 'materials':
        router.push('/contractor/workforce/materials/request');
        break;
      case 'machinery':
        router.push('/contractor/machinery/requests');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.role}>Contractor Dashboard</Text>
        </View>
        <NotificationBell count={5} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressCheckIntegration />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sites</Text>
          <ActiveSitesCarousel sites={sites} onSitePress={handleSitePress} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {actionItems.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onPress={() => handleActionPress(item)}
            />
          ))}
        </View>
      </ScrollView>

      <ProgressHeatmapPanel siteId="demo" />
      
      <FABCreateMenu
        visible={fabVisible}
        onToggle={() => setFabVisible(!fabVisible)}
        actions={fabActions}
      />
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
  }
});