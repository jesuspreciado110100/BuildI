// Simple storage service without external dependencies
export interface ConceptStatus {
  id?: string;
  conceptId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  updatedAt: string;
}

class ConceptStatusService {
  private storage = new Map<string, ConceptStatus>();

  async saveStatus(conceptId: string, status: ConceptStatus['status']): Promise<void> {
    try {
      const statusData: ConceptStatus = {
        conceptId,
        status,
        updatedAt: new Date().toISOString()
      };
      
      this.storage.set(conceptId, statusData);
      
      // Try to persist to localStorage if available (web)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`concept_status_${conceptId}`, JSON.stringify(statusData));
      }
    } catch (error) {
      console.error('Failed to save concept status:', error);
    }
  }

  async getStatus(conceptId: string): Promise<ConceptStatus | null> {
    try {
      // Check memory first
      let status = this.storage.get(conceptId);
      
      // Fallback to localStorage if available
      if (!status && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(`concept_status_${conceptId}`);
        if (stored) {
          status = JSON.parse(stored);
          this.storage.set(conceptId, status!);
        }
      }
      
      return status || null;
    } catch (error) {
      console.error('Failed to get concept status:', error);
      return null;
    }
  }
}

export default new ConceptStatusService();
