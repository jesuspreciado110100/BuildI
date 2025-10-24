export interface FleetUploadData {
  category: string;
  brand: string;
  model: string;
  photos: {
    front?: string;
    side?: string;
    control?: string;
  };
  nickname: string;
  dailyRate: string;
  availability: 'available' | 'unavailable';
  contactPhone: string;
  operatorLanguage: string;
  uploadedBy: 'agent' | 'owner';
  status: 'unverified' | 'verified' | 'suspicious';
  createdAt: string;
  uploaderId?: string;
  ownerId?: string;
  verificationNotes?: string;
}

export class FleetUploadService {
  private static uploads: FleetUploadData[] = [];

  static async submitUpload(data: FleetUploadData): Promise<{ success: boolean; id?: string }> {
    try {
      const uploadData = {
        ...data,
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'unverified' as const
      };
      
      this.uploads.push(uploadData);
      
      // Mock notification to potential owner
      if (data.uploadedBy === 'agent') {
        await this.notifyPotentialOwner(uploadData);
      }
      
      return { success: true, id: uploadData.id };
    } catch (error) {
      console.error('Fleet upload error:', error);
      return { success: false };
    }
  }

  static async getUnverifiedUploads(): Promise<FleetUploadData[]> {
    return this.uploads.filter(upload => upload.status === 'unverified');
  }

  static async getUploadsByUser(userId: string): Promise<FleetUploadData[]> {
    return this.uploads.filter(upload => upload.uploaderId === userId);
  }

  static async verifyUpload(uploadId: string, status: 'verified' | 'suspicious', notes?: string): Promise<boolean> {
    const uploadIndex = this.uploads.findIndex(upload => upload.id === uploadId);
    if (uploadIndex === -1) return false;
    
    this.uploads[uploadIndex].status = status;
    if (notes) {
      this.uploads[uploadIndex].verificationNotes = notes;
    }
    
    // Notify uploader of verification result
    await this.notifyUploader(this.uploads[uploadIndex], status);
    
    return true;
  }

  static async claimMachine(uploadId: string, ownerId: string, verificationCode: string): Promise<boolean> {
    // Mock verification code check
    if (verificationCode !== '123456') {
      return false;
    }
    
    const uploadIndex = this.uploads.findIndex(upload => upload.id === uploadId);
    if (uploadIndex === -1) return false;
    
    this.uploads[uploadIndex].ownerId = ownerId;
    this.uploads[uploadIndex].status = 'verified';
    
    return true;
  }

  private static async notifyPotentialOwner(upload: FleetUploadData): Promise<void> {
    // Mock notification - in real app would send to potential owners
    console.log(`Notification: Machine "${upload.nickname}" (${upload.category}) was added by yard staff. If this is your machine, please verify ownership.`);
  }

  private static async notifyUploader(upload: FleetUploadData, status: 'verified' | 'suspicious'): Promise<void> {
    const message = status === 'verified' 
      ? `Your uploaded machine "${upload.nickname}" has been verified and is now live.`
      : `Your uploaded machine "${upload.nickname}" requires additional verification.`;
    
    console.log(`Notification to uploader: ${message}`);
  }

  static async getFleetVerificationStats(): Promise<{
    total: number;
    unverified: number;
    verified: number;
    suspicious: number;
  }> {
    const total = this.uploads.length;
    const unverified = this.uploads.filter(u => u.status === 'unverified').length;
    const verified = this.uploads.filter(u => u.status === 'verified').length;
    const suspicious = this.uploads.filter(u => u.status === 'suspicious').length;
    
    return { total, unverified, verified, suspicious };
  }

  static async searchUploads(query: string): Promise<FleetUploadData[]> {
    const lowerQuery = query.toLowerCase();
    return this.uploads.filter(upload => 
      upload.nickname.toLowerCase().includes(lowerQuery) ||
      upload.category.toLowerCase().includes(lowerQuery) ||
      upload.brand.toLowerCase().includes(lowerQuery)
    );
  }
}