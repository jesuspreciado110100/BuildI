import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TeamPresence } from '../services/CollaborationService';

interface TeamPresenceIndicatorProps {
  presence: TeamPresence[];
}

export const TeamPresenceIndicator: React.FC<TeamPresenceIndicatorProps> = ({ presence }) => {
  const onlineUsers = presence.filter(p => p.status === 'online');
  const awayUsers = presence.filter(p => p.status === 'away');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  if (presence.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No team members online</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team ({presence.length})</Text>
        <View style={styles.statusSummary}>
          {onlineUsers.length > 0 && (
            <View style={styles.statusCount}>
              <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.statusCountText}>{onlineUsers.length}</Text>
            </View>
          )}
          {awayUsers.length > 0 && (
            <View style={styles.statusCount}>
              <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusCountText}>{awayUsers.length}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.usersList}>
        {presence.slice(0, 8).map((user) => (
          <View key={user.user_id} style={styles.userItem}>
            {user.user_avatar ? (
              <Image source={{ uri: user.user_avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.user_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(user.status) }
            ]} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.user_name}
              </Text>
              <Text style={styles.userStatus}>
                {getStatusText(user.status)}
              </Text>
            </View>
          </View>
        ))}

        {presence.length > 8 && (
          <View style={styles.moreUsers}>
            <View style={styles.moreUsersCircle}>
              <Text style={styles.moreUsersText}>+{presence.length - 8}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCountText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  usersList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userItem: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 18,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: {
    marginTop: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  userStatus: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  moreUsers: {
    alignItems: 'center',
  },
  moreUsersCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  moreUsersText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});