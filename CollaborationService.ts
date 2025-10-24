import { supabase } from '@/app/lib/supabase';

export interface DocumentSession {
  id: string;
  document_id: string;
  user_id: string;
  cursor_position: { line: number; column: number };
  selection_range: { start: number; end: number };
  is_active: boolean;
  last_seen: string;
  user_color: string;
}

export interface DocumentChange {
  id: string;
  document_id: string;
  user_id: string;
  change_type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  timestamp: string;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private activeChannels: Map<string, any> = new Map();

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  async joinDocument(documentId: string, userId: string): Promise<void> {
    // Create or update document session
    const { error } = await supabase
      .from('document_sessions')
      .upsert({
        document_id: documentId,
        user_id: userId,
        is_active: true,
        last_seen: new Date().toISOString(),
        user_color: this.generateUserColor(userId)
      });

    if (error) {
      throw new Error(`Failed to join document: ${error.message}`);
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`document:${documentId}`)
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync(documentId);
      })
      .on('broadcast', { event: 'document_change' }, (payload) => {
        this.handleDocumentChange(payload);
      })
      .on('broadcast', { event: 'cursor_update' }, (payload) => {
        this.handleCursorUpdate(payload);
      })
      .subscribe();

    this.activeChannels.set(documentId, channel);
  }

  async leaveDocument(documentId: string, userId: string): Promise<void> {
    // Mark session as inactive
    await supabase
      .from('document_sessions')
      .update({ is_active: false })
      .eq('document_id', documentId)
      .eq('user_id', userId);

    // Unsubscribe from channel
    const channel = this.activeChannels.get(documentId);
    if (channel) {
      supabase.removeChannel(channel);
      this.activeChannels.delete(documentId);
    }
  }

  async updateCursor(documentId: string, position: { line: number; column: number }): Promise<void> {
    const channel = this.activeChannels.get(documentId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor_update',
        payload: { position, timestamp: Date.now() }
      });
    }
  }

  async broadcastChange(documentId: string, change: Partial<DocumentChange>): Promise<void> {
    const channel = this.activeChannels.get(documentId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'document_change',
        payload: { ...change, timestamp: Date.now() }
      });
    }
  }

  async createVersion(documentId: string, content: any, summary: string): Promise<void> {
    const { data: maxVersion } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const newVersionNumber = (maxVersion?.version_number || 0) + 1;

    const { error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        content,
        change_summary: summary,
        is_current: true,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      throw new Error(`Failed to create version: ${error.message}`);
    }

    // Mark previous versions as not current
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId)
      .neq('version_number', newVersionNumber);
  }

  async addComment(
    documentId: string, 
    content: string, 
    position: { line: number; column: number }
  ): Promise<void> {
    const { error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        content,
        position,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    // Notify other users
    await supabase.functions.invoke('collaboration-notifications', {
      body: {
        action: 'notify_comment',
        documentId,
        data: { content, position }
      }
    });
  }

  async addSuggestion(
    documentId: string,
    originalText: string,
    suggestedText: string,
    position: { start: number; end: number }
  ): Promise<void> {
    const { error } = await supabase
      .from('document_suggestions')
      .insert({
        document_id: documentId,
        original_text: originalText,
        suggested_text: suggestedText,
        position,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      throw new Error(`Failed to add suggestion: ${error.message}`);
    }

    // Notify other users
    await supabase.functions.invoke('collaboration-notifications', {
      body: {
        action: 'notify_suggestion',
        documentId,
        data: { originalText, suggestedText, position }
      }
    });
  }

  private handlePresenceSync(documentId: string): void {
    // Handle presence synchronization
    console.log(`Presence synced for document: ${documentId}`);
  }

  private handleDocumentChange(payload: any): void {
    // Handle document changes from other users
    console.log('Document change received:', payload);
  }

  private handleCursorUpdate(payload: any): void {
    // Handle cursor updates from other users
    console.log('Cursor update received:', payload);
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  }
}

export default CollaborationService;