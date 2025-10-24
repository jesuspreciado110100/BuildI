import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionItem {
  id: string;
  title: string;
  type: 'labor' | 'materials' | 'machinery' | 'progress' | 'chat';
  priority: 'high' | 'medium' | 'low';
  description: string;
  dueDate?: string;
}

interface ActionItemCardProps {
  item: ActionItem;
  onPress: () => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  item,
  onPress
}) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labor':
        return 'people';
      case 'materials':
        return 'cube';
      case 'machinery':
        return 'construct';
      case 'progress':
        return 'trending-up';
      case 'chat':
        return 'chatbubble';
      default:
        return 'alert-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labor':
        return '#3B82F6';
      case 'materials':
        return '#10B981';
      case 'machinery':
        return '#F59E0B';
      case 'progress':
        return '#8B5CF6';
      case 'chat':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Ionicons 
            name={getTypeIcon(item.type) as any} 
            size={24} 
            color={getTypeColor(item.type)} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          </View>
          
          <Text style={styles.description}>{item.description}</Text>
          
          {item.dueDate && (
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          )}
        </View>
        
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 12,
  },
});