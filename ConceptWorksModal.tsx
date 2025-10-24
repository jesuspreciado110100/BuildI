import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, FlatList } from 'react-native';

interface Work {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
}

interface ConceptWorksModalProps {
  visible: boolean;
  concept: string;
  onClose: () => void;
}

export const ConceptWorksModal: React.FC<ConceptWorksModalProps> = ({ visible, concept, onClose }) => {
  // Mock data for works - in production, this would come from a service
  const getWorksForConcept = (conceptName: string): Work[] => {
    const worksByConcept: { [key: string]: Work[] } = {
      'Foundation': [
        { id: '1', title: 'Site Excavation', description: 'Excavate foundation area', status: 'completed', estimatedHours: 24, priority: 'high' },
        { id: '2', title: 'Concrete Pouring', description: 'Pour foundation concrete', status: 'in_progress', estimatedHours: 16, priority: 'high' },
        { id: '3', title: 'Rebar Installation', description: 'Install reinforcement bars', status: 'pending', estimatedHours: 12, priority: 'medium' },
        { id: '4', title: 'Foundation Inspection', description: 'Quality inspection of foundation', status: 'pending', estimatedHours: 4, priority: 'high' },
      ],
      'Framing': [
        { id: '5', title: 'Wall Framing', description: 'Frame exterior and interior walls', status: 'pending', estimatedHours: 32, priority: 'high' },
        { id: '6', title: 'Roof Framing', description: 'Install roof trusses and framing', status: 'pending', estimatedHours: 24, priority: 'high' },
        { id: '7', title: 'Floor Joists', description: 'Install floor joist system', status: 'pending', estimatedHours: 16, priority: 'medium' },
      ],
      'Electrical': [
        { id: '8', title: 'Rough Wiring', description: 'Install electrical rough-in wiring', status: 'pending', estimatedHours: 20, priority: 'medium' },
        { id: '9', title: 'Panel Installation', description: 'Install electrical panel', status: 'pending', estimatedHours: 8, priority: 'high' },
        { id: '10', title: 'Outlet Installation', description: 'Install outlets and switches', status: 'pending', estimatedHours: 12, priority: 'low' },
      ],
      'Plumbing': [
        { id: '11', title: 'Rough Plumbing', description: 'Install rough plumbing lines', status: 'pending', estimatedHours: 18, priority: 'medium' },
        { id: '12', title: 'Fixture Installation', description: 'Install plumbing fixtures', status: 'pending', estimatedHours: 10, priority: 'low' },
        { id: '13', title: 'Water Heater', description: 'Install water heater system', status: 'pending', estimatedHours: 6, priority: 'medium' },
      ],
    };
    return worksByConcept[conceptName] || [];
  };

  const works = getWorksForConcept(concept);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'pending': return '#6B7280';
      default: return '#EF4444';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderWorkItem = ({ item }: { item: Work }) => (
    <View style={styles.workItem}>
      <View style={styles.workHeader}>
        <Text style={styles.workTitle}>{item.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>{item.priority}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.workDescription}>{item.description}</Text>
      <Text style={styles.workHours}>Estimated: {item.estimatedHours} hours</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{concept} Works</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {works.length} works • {works.reduce((sum, work) => sum + work.estimatedHours, 0)} total hours
            </Text>
          </View>

          <FlatList
            data={works}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkItem}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summary: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  workItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  workDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  workHours: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});