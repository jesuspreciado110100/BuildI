import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { CollaborationService, ActivityFeedItem } from '../services/CollaborationService';

interface ActivityFeedProps {
  siteId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ siteId }) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [siteId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await CollaborationService.getActivityFeed(siteId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_created': return '📄';
      case 'document_updated': return '✏️';
      case 'comment_added': return '💬';
      case 'approval_requested': return '🔍';
      case 'approval_given': return '✅';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document_created': return '#3b82f6';
      case 'document_updated': return '#f59e0b';
      case 'comment_added': return '#8b5cf6';
      case 'approval_requested': return '#ef4444';
      case 'approval_given': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderActivityItem = (activity: ActivityFeedItem) => (
    <TouchableOpacity key={activity.id} style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <View style={styles.userInfo}>
          {activity.user_avatar ? (
            <Image source={{ uri: activity.user_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {activity.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={[
            styles.activityIconContainer,
            { backgroundColor: getActivityColor(activity.type) }
          ]}>
            <Text style={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.timestamp}>
          {formatTimeAgo(activity.created_at)}
        </Text>
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.userName}>{activity.user_name}</Text>
          {' '}
          {activity.content}
          {' '}
          <Text style={styles.documentName}>{activity.document_name}</Text>
        </Text>
        
        {activity.metadata && activity.metadata.preview && (
          <Text style={styles.activityPreview} numberOfLines={2}>
            "{activity.metadata.preview}"
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity onPress={loadActivities} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>
              Activity will appear here when team members interact with documents
            </Text>
          </View>
        ) : (
          activities.map(renderActivityItem)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 4,
  },
  refreshText: {
    fontSize: 18,
    color: '#3b82f6',
  },
  scrollView: {
    flex: 1,
  },
  activityItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  activityIconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  activityIcon: {
    fontSize: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityContent: {
    marginLeft: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  documentName: {
    fontWeight: '500',
    color: '#3b82f6',
  },
  activityPreview: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});