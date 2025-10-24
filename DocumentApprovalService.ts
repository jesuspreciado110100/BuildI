import { supabase } from '@/app/lib/supabase';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  document_type: string;
  project_id?: string;
  is_active: boolean;
  stages: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  workflow_id: string;
  stage_order: number;
  stage_name: string;
  required_role: string;
  approver_user_id?: string;
  is_parallel: boolean;
  auto_approve: boolean;
  deadline_hours: number;
}

export interface DocumentApproval {
  id: string;
  document_id: string;
  document_name?: string;
  workflow_id: string;
  current_stage_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  submitted_at: string;
  submitted_by?: string;
  completed_at?: string;
  rejection_reason?: string;
}

export interface StageApproval {
  id: string;
  document_approval_id: string;
  stage_id: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
  signature_data?: string;
}

class DocumentApprovalService {
  async createWorkflow(workflow: Partial<ApprovalWorkflow>): Promise<ApprovalWorkflow> {
    const { data, error } = await supabase
      .from('approval_workflows')
      .insert(workflow)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkflowsByType(documentType: string, projectId?: string): Promise<ApprovalWorkflow[]> {
    let query = supabase
      .from('approval_workflows')
      .select(`
        *,
        workflow_stages (*)
      `)
      .eq('document_type', documentType)
      .eq('is_active', true);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async submitDocumentForApproval(
    documentId: string,
    documentName: string,
    workflowId: string,
    submitterId: string
  ): Promise<DocumentApproval> {
    // Get workflow stages
    const { data: stages } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('stage_order');

    if (!stages?.length) throw new Error('No workflow stages found');

    const firstStage = stages[0];

    // Create document approval
    const { data: approval, error } = await supabase
      .from('document_approvals')
      .insert({
        document_id: documentId,
        document_name: documentName,
        workflow_id: workflowId,
        current_stage_id: firstStage.id,
        status: 'in_progress',
        submitted_by: submitterId
      })
      .select()
      .single();

    if (error) throw error;

    // Create stage approvals
    const stageApprovals = stages.map(stage => ({
      document_approval_id: approval.id,
      stage_id: stage.id,
      approver_id: stage.approver_user_id,
      status: 'pending' as const
    }));

    await supabase.from('stage_approvals').insert(stageApprovals);

    // Send notification for first stage
    await this.sendApprovalNotification(approval.id, 'approval_request');

    return approval;
  }

  async approveStage(
    stageApprovalId: string,
    approverId: string,
    comments?: string,
    signature?: string
  ): Promise<void> {
    // Update stage approval
    await supabase
      .from('stage_approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        comments,
        signature_data: signature
      })
      .eq('id', stageApprovalId);

    // Check if all stages are approved
    await this.checkAndAdvanceWorkflow(stageApprovalId);
  }

  async rejectStage(
    stageApprovalId: string,
    approverId: string,
    reason: string
  ): Promise<void> {
    // Update stage approval
    await supabase
      .from('stage_approvals')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        comments: reason
      })
      .eq('id', stageApprovalId);

    // Update document approval status
    const { data: stageApproval } = await supabase
      .from('stage_approvals')
      .select('document_approval_id')
      .eq('id', stageApprovalId)
      .single();

    if (stageApproval) {
      await supabase
        .from('document_approvals')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          completed_at: new Date().toISOString()
        })
        .eq('id', stageApproval.document_approval_id);

      await this.sendApprovalNotification(stageApproval.document_approval_id, 'approval_rejected');
    }
  }

  private async checkAndAdvanceWorkflow(stageApprovalId: string): Promise<void> {
    const { data: stageApproval } = await supabase
      .from('stage_approvals')
      .select(`
        *,
        document_approvals!inner(*),
        workflow_stages!inner(*)
      `)
      .eq('id', stageApprovalId)
      .single();

    if (!stageApproval) return;

    // Get all stage approvals for this document
    const { data: allStageApprovals } = await supabase
      .from('stage_approvals')
      .select('*, workflow_stages!inner(*)')
      .eq('document_approval_id', stageApproval.document_approval_id);

    if (!allStageApprovals) return;

    // Check if current stage is complete
    const currentStageOrder = stageApproval.workflow_stages.stage_order;
    const currentStageApprovals = allStageApprovals.filter(
      sa => sa.workflow_stages.stage_order === currentStageOrder
    );

    const allCurrentStageApproved = currentStageApprovals.every(sa => sa.status === 'approved');

    if (allCurrentStageApproved) {
      // Find next stage
      const nextStageApprovals = allStageApprovals.filter(
        sa => sa.workflow_stages.stage_order === currentStageOrder + 1
      );

      if (nextStageApprovals.length > 0) {
        // Advance to next stage
        const nextStage = nextStageApprovals[0].workflow_stages;
        await supabase
          .from('document_approvals')
          .update({ current_stage_id: nextStage.id })
          .eq('id', stageApproval.document_approval_id);

        await this.sendApprovalNotification(stageApproval.document_approval_id, 'approval_request');
      } else {
        // All stages complete
        await supabase
          .from('document_approvals')
          .update({
            status: 'approved',
            completed_at: new Date().toISOString()
          })
          .eq('id', stageApproval.document_approval_id);

        await this.sendApprovalNotification(stageApproval.document_approval_id, 'approval_completed');
      }
    }
  }

  private async sendApprovalNotification(documentApprovalId: string, type: string): Promise<void> {
    try {
      await supabase.functions.invoke('document-approval-notifications', {
        body: {
          type,
          documentApprovalId,
          // Additional notification data would be populated here
        }
      });
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  async getDocumentApprovals(documentId: string): Promise<DocumentApproval[]> {
    const { data, error } = await supabase
      .from('document_approvals')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPendingApprovals(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('stage_approvals')
      .select(`
        *,
        document_approvals!inner(*),
        workflow_stages!inner(*)
      `)
      .eq('approver_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }
}

export const documentApprovalService = new DocumentApprovalService();