import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AddWorkerModalStyles } from './AddWorkerModalStyles';
import { SkillMatchingPanel } from './SkillMatchingPanel';

interface ProjectConcept {
  id: string;
  name: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  requiredSkills: string[];
  tradeType: string;
}

interface AddWorkerModalProps {
  visible: boolean;
  onClose: () => void;
  onAddWorker: (workerData: any) => void;
  projectConcepts: ProjectConcept[];
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  visible,
  onClose,
  onAddWorker,
  projectConcepts
}) => {
  const [workerName, setWorkerName] = useState('');
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'skill_match'>('manual');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showSkillMatching, setShowSkillMatching] = useState(false);

  const handleConceptToggle = (conceptId: string) => {
    setSelectedConcepts(prev => 
      prev.includes(conceptId) 
        ? prev.filter(id => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const getSelectedConceptsSkills = () => {
    const selectedConceptsData = projectConcepts.filter(c => selectedConcepts.includes(c.id));
    const allSkills = selectedConceptsData.flatMap(c => c.requiredSkills);
    return [...new Set(allSkills)]; // Remove duplicates
  };

  const getSelectedConceptsTradeType = () => {
    const selectedConceptsData = projectConcepts.filter(c => selectedConcepts.includes(c.id));
    return selectedConceptsData[0]?.tradeType || '';
  };

  const handleSubmit = () => {
    if (!workerName.trim()) {
      Alert.alert('Error', 'Please enter worker name');
      return;
    }

    if (selectedConcepts.length === 0) {
      Alert.alert('Error', 'Please select at least one concept');
      return;
    }

    const workerData = {
      name: workerName,
      selectedConcepts,
      assignmentMode,
      selectedWorkerId: assignmentMode === 'manual' ? selectedWorkerId : null,
    };

    onAddWorker(workerData);
    
    // Reset form
    setWorkerName('');
    setSelectedConcepts([]);
    setAssignmentMode('manual');
    setSelectedWorkerId(null);
    setShowSkillMatching(false);
    onClose();
  };

  const handleWorkerSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setShowSkillMatching(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={AddWorkerModalStyles.container}>
        <View style={AddWorkerModalStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={AddWorkerModalStyles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={AddWorkerModalStyles.title}>Add Worker</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!workerName.trim()}>
            <Text style={[AddWorkerModalStyles.saveButton, !workerName.trim() && AddWorkerModalStyles.disabledButton]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={AddWorkerModalStyles.content}>
          <View style={AddWorkerModalStyles.section}>
            <Text style={AddWorkerModalStyles.sectionTitle}>Worker Name</Text>
            <TextInput
              style={AddWorkerModalStyles.input}
              value={workerName}
              onChangeText={setWorkerName}
              placeholder="Enter worker name"
              autoCapitalize="words"
            />
          </View>

          <View style={AddWorkerModalStyles.section}>
            <Text style={AddWorkerModalStyles.sectionTitle}>Assign Concepts</Text>
            {projectConcepts.slice(0, 3).map((concept) => (
              <TouchableOpacity
                key={concept.id}
                style={AddWorkerModalStyles.conceptCard}
                onPress={() => handleConceptToggle(concept.id)}
              >
                <View style={AddWorkerModalStyles.conceptHeader}>
                  <Text style={AddWorkerModalStyles.conceptName}>{concept.name}</Text>
                  <View style={[
                    AddWorkerModalStyles.checkbox,
                    selectedConcepts.includes(concept.id) && AddWorkerModalStyles.checkedBox
                  ]}>
                    {selectedConcepts.includes(concept.id) && (
                      <Text style={AddWorkerModalStyles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
                <View style={AddWorkerModalStyles.conceptDetails}>
                  <Text style={AddWorkerModalStyles.volumeText}>
                    Volume: {concept.volume} {concept.unit}
                  </Text>
                  <Text style={AddWorkerModalStyles.priceText}>
                    ${concept.pricePerUnit.toFixed(2)} per {concept.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={AddWorkerModalStyles.viewAllButton}>
              <Text style={AddWorkerModalStyles.viewAllText}>ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={AddWorkerModalStyles.section}>
            <View style={AddWorkerModalStyles.assignmentRow}>
              <TouchableOpacity 
                style={[AddWorkerModalStyles.assignmentButton, assignmentMode === 'manual' && AddWorkerModalStyles.activeAssignmentButton]}
                onPress={() => setAssignmentMode('manual')}
              >
                <Text style={[AddWorkerModalStyles.assignmentButtonText, assignmentMode === 'manual' && AddWorkerModalStyles.activeAssignmentButtonText]}>
                  Assign
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[AddWorkerModalStyles.assignmentButton, assignmentMode === 'skill_match' && AddWorkerModalStyles.activeAssignmentButton]}
                onPress={() => {
                  setAssignmentMode('skill_match');
                  setShowSkillMatching(true);
                }}
              >
                <Text style={[AddWorkerModalStyles.assignmentButtonText, assignmentMode === 'skill_match' && AddWorkerModalStyles.activeAssignmentButtonText]}>
                  Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showSkillMatching && selectedConcepts.length > 0 && (
            <View style={AddWorkerModalStyles.section}>
              <SkillMatchingPanel
                requiredSkills={getSelectedConceptsSkills()}
                tradeType={getSelectedConceptsTradeType()}
                startDate={new Date().toISOString()}
                endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
                onWorkerSelect={handleWorkerSelect}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};