import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { AddWorkerModal } from './AddWorkerModal';

interface ProjectConcept {
  id: string;
  name: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  requiredSkills: string[];
  tradeType: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  profileImage?: string;
  status: 'active' | 'busy' | 'offline';
  assignedConcepts: string[];
}

export const WorkerCarousel: React.FC = () => {
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      name: 'Carlos M.',
      role: 'Foreman',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      assignedConcepts: ['concept1']
    },
    {
      id: '2',
      name: 'Maria S.',
      role: 'Electrician',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'busy',
      assignedConcepts: ['concept2']
    }
  ]);

  const projectConcepts: ProjectConcept[] = [
    {
      id: 'concept1',
      name: 'Foundation Work',
      volume: 150,
      unit: 'm³',
      pricePerUnit: 85.00,
      requiredSkills: ['Concrete', 'Excavation', 'Rebar'],
      tradeType: 'Concrete'
    },
    {
      id: 'concept2',
      name: 'Framing',
      volume: 200,
      unit: 'm²',
      pricePerUnit: 45.00,
      requiredSkills: ['Carpentry', 'Framing', 'Blueprint Reading'],
      tradeType: 'Carpentry'
    },
    {
      id: 'concept3',
      name: 'Electrical Installation',
      volume: 50,
      unit: 'points',
      pricePerUnit: 125.00,
      requiredSkills: ['Electrical', 'Wiring', 'Code Compliance'],
      tradeType: 'Electrical'
    }
  ];

  const handleAddWorker = (workerData: any) => {
    const newWorker: Worker = {
      id: Date.now().toString(),
      name: workerData.name,
      role: 'Worker',
      status: 'active',
      assignedConcepts: workerData.selectedConcepts
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderWorkerCard = (worker: Worker) => (
    <TouchableOpacity key={worker.id} style={styles.workerCard}>
      <View style={styles.workerImageContainer}>
        {worker.profileImage ? (
          <Image source={{ uri: worker.profileImage }} style={styles.workerImage} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarText}>{worker.name.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(worker.status) }]} />
      </View>
      <Text style={styles.workerName}>{worker.name}</Text>
      <Text style={styles.workerRole}>{worker.role}</Text>
    </TouchableOpacity>
  );

  const renderAddButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => setShowAddWorkerModal(true)}>
      <View style={styles.addButtonContent}>
        <Text style={styles.addIcon}>+</Text>
      </View>
      <Text style={styles.addButtonText}>Add Worker</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Team Members</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {workers.map(renderWorkerCard)}
        {renderAddButton()}
      </ScrollView>
      
      <AddWorkerModal
        visible={showAddWorkerModal}
        onClose={() => setShowAddWorkerModal(false)}
        onAddWorker={handleAddWorker}
        projectConcepts={projectConcepts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  workerCard: {
    alignItems: 'center',
    width: 80,
  },
  workerImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  workerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
  },
  workerRole: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  addButton: {
    alignItems: 'center',
    width: 80,
  },
  addButtonContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addIcon: {
    fontSize: 24,
    color: '#0EA5E9',
    fontWeight: 'bold',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0EA5E9',
    textAlign: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748B',
  },
});