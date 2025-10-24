import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { documentApprovalService, ApprovalWorkflow, WorkflowStage } from '@/app/services/DocumentApprovalService';

interface ApprovalWorkflowManagerProps {
  projectId?: string;
  onWorkflowCreated?: (workflow: ApprovalWorkflow) => void;
}

export const ApprovalWorkflowManager: React.FC<ApprovalWorkflowManagerProps> = ({
  projectId,
  onWorkflowCreated
}) => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    document_type: '',
    stages: [{ stage_name: '', required_role: '', deadline_hours: 72 }]
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      // Load all workflows for project
      const allWorkflows = await documentApprovalService.getWorkflowsByType('', projectId);
      setWorkflows(allWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const workflow = await documentApprovalService.createWorkflow({
        name: formData.name,
        description: formData.description,
        document_type: formData.document_type,
        project_id: projectId,
        is_active: true
      });

      Alert.alert('Success', 'Workflow created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        document_type: '',
        stages: [{ stage_name: '', required_role: '', deadline_hours: 72 }]
      });
      loadWorkflows();
      onWorkflowCreated?.(workflow);
    } catch (error) {
      Alert.alert('Error', 'Failed to create workflow');
      console.error(error);
    }
  };

  const addStage = () => {
    setFormData({
      ...formData,
      stages: [...formData.stages, { stage_name: '', required_role: '', deadline_hours: 72 }]
    });
  };

  const updateStage = (index: number, field: string, value: string | number) => {
    const newStages = [...formData.stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setFormData({ ...formData, stages: newStages });
  };

  const removeStage = (index: number) => {
    if (formData.stages.length > 1) {
      const newStages = formData.stages.filter((_, i) => i !== index);
      setFormData({ ...formData, stages: newStages });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
          Approval Workflows
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: '#2563EB',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {showCreateForm ? 'Cancel' : 'Create Workflow'}
          </Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Create New Workflow</Text>
          
          <TextInput
            placeholder="Workflow Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12
            }}
          />

          <TextInput
            placeholder="Document Type (e.g., blueprint, contract, report)"
            value={formData.document_type}
            onChangeText={(text) => setFormData({ ...formData, document_type: text })}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12
            }}
          />

          <TextInput
            placeholder="Description (optional)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={2}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              textAlignVertical: 'top'
            }}
          />

          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Approval Stages</Text>
          
          {formData.stages.map((stage, index) => (
            <View key={index} style={{
              backgroundColor: '#F3F4F6',
              padding: 12,
              borderRadius: 8,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: '600' }}>Stage {index + 1}</Text>
                {formData.stages.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeStage(index)}
                    style={{ backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                placeholder="Stage Name"
                value={stage.stage_name}
                onChangeText={(text) => updateStage(index, 'stage_name', text)}
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 6,
                  padding: 8,
                  marginBottom: 8,
                  backgroundColor: 'white'
                }}
              />
              
              <TextInput
                placeholder="Required Role (e.g., project_manager, engineer, client)"
                value={stage.required_role}
                onChangeText={(text) => updateStage(index, 'required_role', text)}
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: 'white'
                }}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={addStage}
            style={{
              backgroundColor: '#10B981',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Add Stage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateWorkflow}
            style={{
              backgroundColor: '#2563EB',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Workflow</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Existing Workflows */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Existing Workflows</Text>
        {workflows.map((workflow) => (
          <View key={workflow.id} style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{workflow.name}</Text>
            <Text style={{ color: '#6B7280', marginBottom: 8 }}>Type: {workflow.document_type}</Text>
            {workflow.description && (
              <Text style={{ color: '#6B7280', marginBottom: 8 }}>{workflow.description}</Text>
            )}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Text style={{ color: '#10B981', fontWeight: '500' }}>
                {workflow.stages?.length || 0} stages
              </Text>
              <View style={{
                backgroundColor: workflow.is_active ? '#10B981' : '#6B7280',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {workflow.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};