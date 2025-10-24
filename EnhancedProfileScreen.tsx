import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileWidget from './ProfileWidget';
import { BuilderWidget } from './BuilderDataWidgets';
import BottomSlidePanel from './BottomSlidePanel';
import TeamMembersTab from './TeamMembersTab';
import WorkConceptsTab from './WorkConceptsTab';

export default function EnhancedProfileScreen() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const profileData = {
    name: 'Alfonso Preciado',
    company: 'Constructora Preciado',
    phone: '+52 662 123 4567',
    location: 'Magdalena de Kino, Sonora',
    completedProjects: 23,
    rating: 4.8,
    totalEarnings: 2450000,
    experience: 15
  };

  const builderWidgets = [
    { title: 'AI Notifications', subtitle: 'Smart alerts system', value: 'Active', icon: 'notifications', color: '#F59E0B', panel: 'ai-notifications' },
    { title: 'Analytics', subtitle: 'Performance insights', value: '94%', icon: 'analytics', color: '#10B981', panel: 'analytics' },
    { title: 'BIM Concepts', subtitle: 'Model mapping', value: '12 maps', icon: 'cube-outline', color: '#3B82F6', panel: 'bim-concepts' },
    { title: 'Booking Match', subtitle: 'Auto scheduling', value: '8 matches', icon: 'calendar', color: '#8B5CF6', panel: 'booking' },
    { title: 'Chat Service', subtitle: 'Team communication', value: '24 active', icon: 'chatbubbles', color: '#06B6D4', panel: 'chat' },
    { title: 'Client Portal', subtitle: 'Customer access', value: '5 clients', icon: 'people-circle', color: '#EF4444', panel: 'client-portal' },
    { title: 'Cost Analysis', subtitle: 'Budget tracking', value: '$180K', icon: 'calculator', color: '#F59E0B', panel: 'cost-analysis' },
    { title: 'Crew Optimizer', subtitle: 'Team efficiency', value: '92%', icon: 'people', color: '#10B981', panel: 'crew-optimizer' },
    { title: 'Delay Tracker', subtitle: 'Schedule monitoring', value: '2 delays', icon: 'time', color: '#3B82F6', panel: 'delay-tracker' },
    { title: 'Delivery Service', subtitle: 'Material logistics', value: '15 pending', icon: 'car', color: '#8B5CF6', panel: 'delivery' },
    { title: 'Equipment Analytics', subtitle: 'Machine performance', value: '8 units', icon: 'construct', color: '#06B6D4', panel: 'equipment' },
    { title: 'Escrow Service', subtitle: 'Payment security', value: '$45K', icon: 'shield-checkmark', color: '#EF4444', panel: 'escrow' },
    { title: 'Fleet Upload', subtitle: 'Vehicle management', value: '12 vehicles', icon: 'bus', color: '#F59E0B', panel: 'fleet' },
    { title: 'Forecast Service', subtitle: 'Project predictions', value: '3 reports', icon: 'trending-up', color: '#10B981', panel: 'forecast' },
    { title: 'Guarantee Service', subtitle: 'Work warranties', value: '5 active', icon: 'ribbon', color: '#3B82F6', panel: 'guarantee' },
    { title: 'Inventory Service', subtitle: 'Stock management', value: '156 items', icon: 'cube', color: '#8B5CF6', panel: 'inventory' },
    { title: 'Invoice Service', subtitle: 'Billing system', value: '8 pending', icon: 'receipt', color: '#06B6D4', panel: 'invoice' },
    { title: 'Labor Matching', subtitle: 'Worker assignment', value: '24 workers', icon: 'hammer', color: '#EF4444', panel: 'labor-matching' },
    { title: 'Material Catalog', subtitle: 'Product database', value: '2.3K items', icon: 'library', color: '#F59E0B', panel: 'material-catalog' },
    { title: 'Payment Service', subtitle: 'Transaction handling', value: '$320K', icon: 'card', color: '#10B981', panel: 'payment' },
    { title: 'Progress Tracking', subtitle: 'Work monitoring', value: '5 projects', icon: 'checkmark-circle', color: '#3B82F6', panel: 'progress' },
    { title: 'Safety Service', subtitle: 'Risk management', value: '0 incidents', icon: 'medical', color: '#8B5CF6', panel: 'safety' },
    { title: 'Site Access', subtitle: 'Entry control', value: '3 sites', icon: 'key', color: '#06B6D4', panel: 'site-access' },
    { title: 'Smart Suggestions', subtitle: 'AI recommendations', value: '12 tips', icon: 'bulb', color: '#EF4444', panel: 'suggestions' }
  ];

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'team':
        return <TeamMembersTab />;
      case 'concepts':
        return <WorkConceptsTab />;
      default:
        return (
          <View style={styles.panelPlaceholder}>
            <Ionicons name="information-circle" size={48} color="#9CA3AF" />
            <Text style={styles.panelText}>Service details coming soon</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AP</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileData.name}</Text>
            <Text style={styles.userCompany}>{profileData.company}</Text>
            <Text style={styles.userLocation}>📍 {profileData.location}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.widgetsContainer}>
          {builderWidgets.map((widget, index) => (
            <BuilderWidget
              key={index}
              title={widget.title}
              subtitle={widget.subtitle}
              value={widget.value}
              icon={widget.icon}
              color={widget.color}
              onPress={() => setActivePanel(widget.panel)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomSlidePanel
        isVisible={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={builderWidgets.find(w => w.panel === activePanel)?.title || ''}
      >
        {renderPanelContent()}
      </BottomSlidePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: 'white',
    padding: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2
  },
  userCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  userLocation: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  content: {
    flex: 1
  },
  widgetsContainer: {
    padding: 16
  },
  panelPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  panelText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center'
  }
});