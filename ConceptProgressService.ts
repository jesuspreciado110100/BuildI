export interface ConceptProgress {
  conceptId: string;
  progress: number;
  evidence: string[];
  lastUpdated: Date;
}

export class ConceptProgressService {
  private static progressData: Map<string, ConceptProgress> = new Map();

  static async saveProgress(conceptId: string, progress: number, evidence?: string): Promise<void> {
    const existing = this.progressData.get(conceptId) || {
      conceptId,
      progress: 0,
      evidence: [],
      lastUpdated: new Date()
    };

    existing.progress = progress;
    existing.lastUpdated = new Date();
    
    if (evidence) {
      existing.evidence.push(evidence);
    }

    this.progressData.set(conceptId, existing);
  }

  static async getProgress(conceptId: string): Promise<ConceptProgress | null> {
    return this.progressData.get(conceptId) || null;
  }

  static async uploadEvidence(conceptId: string): Promise<string> {
    // Simulate photo upload
    const mockPhotoUrl = `photo_${conceptId}_${Date.now()}.jpg`;
    await this.saveProgress(conceptId, 0, mockPhotoUrl);
    return mockPhotoUrl;
  }
}