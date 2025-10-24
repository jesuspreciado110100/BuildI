import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionItem {
  id: string;
  title: string;
  type: 'labor' | 'materials' | 'machinery' | 'progress' | 'chat';
  priority: 'high' | 'medium' | 'low';
  description: string;
  dueDate?: string;
}

interface SiteActionItemsModalProps {
  visible: boolean;
  onClose: () => void;
  siteName: string;
  actionItems: ActionItem[];
  onActionPress: (action: ActionItem) => void;
}

export default function SiteActionItemsModal({ 
  visible, 
  onClose, 
  siteName, 
  actionItems, 
  onActionPress 
}: SiteActionItemsModalProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labor': return 'people-outline';
      case 'materials': return 'cube-outline';
      case 'machinery': return 'construct-outline';
      case 'progress': return 'trending-up-outline';
      case 'chat': return 'chatbubble-outline';
      default: return 'alert-circle-outline';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{siteName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>Action Items</Text>
        
        <ScrollView style={styles.content}>
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.actionCard}
              onPress={() => onActionPress(item)}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionTitleRow}>
                  <Ionicons 
                    name={getTypeIcon(item.type)} 
                    size={20} 
                    color={getPriorityColor(item.priority)} 
                  />
                  <Text style={styles.actionTitle}>{item.title}</Text>
                </View>
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
        </ScrollView>
      </View>
    </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  closeButton: {
    padding: 8
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    padding: 16,
    paddingBottom: 8
  },
  content: {
    flex: 1,
    padding: 16
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
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8
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
    color: '#6B7280',
    marginBottom: 4
  },
  actionDueDate: {
    fontSize: 12,
    color: '#9CA3AF'
  }
});
