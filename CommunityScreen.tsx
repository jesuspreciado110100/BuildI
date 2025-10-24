import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const CommunityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('network');

  const networkMembers = [
    { id: '1', name: 'John Smith', role: 'Contractor', rating: 4.8, projects: 25 },
    { id: '2', name: 'Sarah Johnson', role: 'Architect', rating: 4.9, projects: 18 },
    { id: '3', name: 'Mike Davis', role: 'Electrician', rating: 4.7, projects: 32 },
    { id: '4', name: 'Lisa Wilson', role: 'Project Manager', rating: 4.8, projects: 15 },
  ];

  const discussions = [
    { id: '1', title: 'Best practices for concrete pouring', author: 'John Smith', replies: 12 },
    { id: '2', title: 'Safety protocols update', author: 'Sarah Johnson', replies: 8 },
    { id: '3', title: 'Equipment maintenance tips', author: 'Mike Davis', replies: 15 },
    { id: '4', title: 'Project timeline optimization', author: 'Lisa Wilson', replies: 6 },
  ];

  const tabs = [
    { id: 'network', label: 'Network', icon: '👥' },
    { id: 'discussions', label: 'Discussions', icon: '💬' },
    { id: 'events', label: 'Events', icon: '📅' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with construction professionals</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.icon} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'network' && (
          <View>
            {networkMembers.map((member) => (
              <TouchableOpacity key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <View style={styles.memberStats}>
                    <Text style={styles.rating}>⭐ {member.rating}</Text>
                    <Text style={styles.projects}>{member.projects} projects</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.connectButton}>
                  <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'discussions' && (
          <View>
            {discussions.map((discussion) => (
              <TouchableOpacity key={discussion.id} style={styles.discussionCard}>
                <Text style={styles.discussionTitle}>{discussion.title}</Text>
                <Text style={styles.discussionAuthor}>by {discussion.author}</Text>
                <Text style={styles.discussionReplies}>{discussion.replies} replies</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No upcoming events</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  memberStats: {
    flexDirection: 'row',
    gap: 16,
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
  },
  projects: {
    fontSize: 12,
    color: '#6B7280',
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectText: {
    color: 'white',
    fontWeight: '500',
  },
  discussionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  discussionAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  discussionReplies: {
    fontSize: 12,
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});