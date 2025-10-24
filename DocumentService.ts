import { supabase } from '../lib/supabase';

export interface Document {
  id: string;
  project_id: string;
  name: string;
  category: 'plans' | 'permits' | 'contracts' | 'photos' | 'reports' | 'other';
  type: string;
  size: number;
  url: string;
  version: number;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  uploaded_by: string;
  uploaded_at: string;
  approved_by?: string;
  approved_at?: string;
  annotations?: any[];
  tags?: string[];
  parent_id?: string;
}

export class DocumentService {
  static async uploadDocument(projectId: string, file: any, category: string, uploadedBy: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          name: file.name,
          category,
          type: file.type,
          size: file.size,
          url: file.url,
          version: 1,
          status: 'pending',
          uploaded_by: uploadedBy,
          uploaded_at: new Date().toISOString(),
          tags: file.tags || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  static async getDocuments(projectId: string, category?: string): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  static async createVersion(documentId: string, file: any, uploadedBy: string): Promise<Document> {
    try {
      const { data: parent } = await supabase
        .from('documents')
        .select('version')
        .eq('id', documentId)
        .single();

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...file,
          version: (parent?.version || 0) + 1,
          parent_id: documentId,
          uploaded_by: uploadedBy,
          uploaded_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }

  static async updateStatus(documentId: string, status: string, approvedBy?: string): Promise<void> {
    try {
      const updates: any = { status };
      if (status === 'approved' && approvedBy) {
        updates.approved_by = approvedBy;
        updates.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  static async searchDocuments(projectId: string, query: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .or(`name.ilike.%${query}%,tags.cs.{${query}}`)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}