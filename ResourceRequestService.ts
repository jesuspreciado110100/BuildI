import { supabase } from '@/app/lib/supabase';

export interface ResourceRequest {
  id?: string;
  siteId: string;
  conceptName: string;
  resourceType: 'machinery' | 'labor';
  resourceDetails: any;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export class ResourceRequestService {
  static async requestMachinery(siteId: string, conceptName: string, machinery: any[], userId: string): Promise<boolean> {
    try {
      const request: ResourceRequest = {
        siteId,
        conceptName,
        resourceType: 'machinery',
        resourceDetails: machinery,
        requestedBy: userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for now
      const key = `machinery_request_${Date.now()}_${Math.random()}`;
      localStorage.setItem(key, JSON.stringify(request));
      
      return true;
    } catch (error) {
      console.error('Error requesting machinery:', error);
      return false;
    }
  }

  static async requestLabor(siteId: string, conceptName: string, labor: any[], userId: string): Promise<boolean> {
    try {
      const request: ResourceRequest = {
        siteId,
        conceptName,
        resourceType: 'labor',
        resourceDetails: labor,
        requestedBy: userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for now
      const key = `labor_request_${Date.now()}_${Math.random()}`;
      localStorage.setItem(key, JSON.stringify(request));
      
      return true;
    } catch (error) {
      console.error('Error requesting labor:', error);
      return false;
    }
  }
}