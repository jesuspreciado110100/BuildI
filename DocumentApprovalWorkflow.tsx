import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { documentApprovalService, DocumentApproval, StageApproval } from '@/app/services/DocumentApprovalService';

interface DocumentApprovalWorkflowProps {
  documentId: string;
  documentName: string;
  documentType: string;
  projectId?: string;
  onApprovalComplete?: () => void;
}

export const DocumentApprovalWorkflow: React.FC<DocumentApprovalWorkflowProps> = ({
  documentId,
  documentName,
  documentType,
  projectId,
  onApprovalComplete
}) => {
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  useEffect(() => {
    loadApprovalData();
  }, [documentId]);

  const loadApprovalData = async () => {
    try {
      const [documentApprovals, userPendingApprovals] = await Promise.all([
        documentApprovalService.getDocumentApprovals(documentId),
        documentApprovalService.getPendingApprovals('current-user-id') // Replace with actual user ID
      ]);

      setApprovals(documentApprovals);
      setPendingApprovals(userPendingApprovals.filter(
        pa => pa.document_approvals.document_id === documentId
      ));
    } catch (error) {
      console.error('Failed to load approval data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartApproval = async () => {
    try {
      const workflows = await documentApprovalService.getWorkflowsByType(documentType, projectId);
      
      if (workflows.length === 0) {
        Alert.alert('No Workflow', 'No approval workflow found for this document type.');
        return;
      }

      const workflow = workflows[0]; // Use first available workflow
      await documentApprovalService.submitDocumentForApproval(
        documentId,
        documentName,
        workflow.id,
        'current-user-id' // Replace with actual user ID
      );

      Alert.alert('Success', 'Document submitted for approval.');
      loadApprovalData();
    } catch (error) {
      Alert.alert('Error', 'Failed to start approval process.');
      console.error(error);
    }
  };

  const handleApprove = async (stageApprovalId: string) => {
    try {
      await documentApprovalService.approveStage(
        stageApprovalId,
        'current-user-id', // Replace with actual user ID
        comments
      );

      Alert.alert('Success', 'Stage approved successfully.');
      setComments('');
      setSelectedApproval(null);
      loadApprovalData();
      onApprovalComplete?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve stage.');
      console.error(error);
    }
  };

  const handleReject = async (stageApprovalId: string) => {
    if (!comments.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection.');
      return;
    }

    try {
      await documentApprovalService.rejectStage(
        stageApprovalId,
        'current-user-id', // Replace with actual user ID
        comments
      );

      Alert.alert('Success', 'Stage rejected successfully.');
      setComments('');
      setSelectedApproval(null);
      loadApprovalData();
      onApprovalComplete?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject stage.');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'in_progress': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✓';
      case 'rejected': return '✗';
      case 'in_progress': return '⏳';
      default: return '⏸';
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#6B7280' }}>Loading approval workflow...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>
          Document Approval Workflow
        </Text>

        {/* Document Info */}
        <View style={{ 
          backgroundColor: 'white', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            {documentName}
          </Text>
          <Text style={{ color: '#6B7280', marginBottom: 4 }}>Type: {documentType}</Text>
          <Text style={{ color: '#6B7280' }}>Document ID: {documentId}</Text>
        </View>

        {/* Current Approvals */}
        {approvals.length > 0 ? (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
              Approval Status
            </Text>
            {approvals.map((approval) => (
              <View key={approval.id} style={{
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ 
                    fontSize: 20, 
                    marginRight: 8,
                    color: getStatusColor(approval.status)
                  }}>
                    {getStatusIcon(approval.status)}
                  </Text>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600',
                    color: getStatusColor(approval.status),
                    textTransform: 'capitalize'
                  }}>
                    {approval.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={{ color: '#6B7280', marginBottom: 4 }}>
                  Submitted: {new Date(approval.submitted_at).toLocaleDateString()}
                </Text>
                {approval.completed_at && (
                  <Text style={{ color: '#6B7280' }}>
                    Completed: {new Date(approval.completed_at).toLocaleDateString()}
                  </Text>
                )}
                {approval.rejection_reason && (
                  <Text style={{ color: '#EF4444', marginTop: 8, fontStyle: 'italic' }}>
                    Rejection Reason: {approval.rejection_reason}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              onPress={handleStartApproval}
              style={{
                backgroundColor: '#2563EB',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Start Approval Process
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Approvals for Current User */}
        {pendingApprovals.length > 0 && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
              Pending Your Approval
            </Text>
            {pendingApprovals.map((pendingApproval) => (
              <View key={pendingApproval.id} style={{
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
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                  {pendingApproval.workflow_stages.stage_name}
                </Text>
                <Text style={{ color: '#6B7280', marginBottom: 12 }}>
                  Role: {pendingApproval.workflow_stages.required_role}
                </Text>

                {selectedApproval === pendingApproval.id && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                      Comments:
                    </Text>
                    <TextInput
                      value={comments}
                      onChangeText={setComments}
                      placeholder="Add your comments..."
                      multiline
                      numberOfLines={3}
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 8,
                        padding: 12,
                        backgroundColor: '#F9FAFB',
                        textAlignVertical: 'top'
                      }}
                    />
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {selectedApproval === pendingApproval.id ? (
                    <>
                      <TouchableOpacity
                        onPress={() => handleApprove(pendingApproval.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#10B981',
                          padding: 12,
                          borderRadius: 8,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Confirm Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleReject(pendingApproval.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#EF4444',
                          padding: 12,
                          borderRadius: 8,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Confirm Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedApproval(null);
                          setComments('');
                        }}
                        style={{
                          backgroundColor: '#6B7280',
                          padding: 12,
                          borderRadius: 8,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setSelectedApproval(pendingApproval.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#2563EB',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Review & Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};