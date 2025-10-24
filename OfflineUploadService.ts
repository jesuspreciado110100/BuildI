import { Platform } from 'react-native';

interface MachineryDraft {
  id: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  description: string;
  photos: string[];
  location: string;
  isSynced: boolean;
  createdAt: string;
}

class OfflineUploadService {
  private storageKey = 'machinery_drafts';
  private memoryStorage: { [key: string]: string } = {};

  private async getStorage(): Promise<Storage | null> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage;
    }
    return null;
  }

  private async setItem(key: string, value: string): Promise<void> {
    const storage = await this.getStorage();
    if (storage) {
      storage.setItem(key, value);
    } else {
      this.memoryStorage[key] = value;
    }
  }

  private async getItem(key: string): Promise<string | null> {
    const storage = await this.getStorage();
    if (storage) {
      return storage.getItem(key);
    }
    return this.memoryStorage[key] || null;
  }

  async saveDraftLocally(machine: Omit<MachineryDraft, 'id' | 'isSynced' | 'createdAt'>): Promise<string> {
    const draft: MachineryDraft = {
      ...machine,
      id: Date.now().toString(),
      isSynced: false,
      createdAt: new Date().toISOString()
    };

    const existingDrafts = await this.getPendingUploads();
    const updatedDrafts = [...existingDrafts, draft];
    
    await this.setItem(this.storageKey, JSON.stringify(updatedDrafts));
    return draft.id;
  }

  async getPendingUploads(): Promise<MachineryDraft[]> {
    const draftsJson = await this.getItem(this.storageKey);
    if (!draftsJson) return [];
    
    try {
      return JSON.parse(draftsJson);
    } catch {
      return [];
    }
  }

  async syncPendingUploads(): Promise<{ success: number; failed: number }> {
    const pendingDrafts = await this.getPendingUploads();
    const unsyncedDrafts = pendingDrafts.filter(draft => !draft.isSynced);
    
    let success = 0;
    let failed = 0;

    for (const draft of unsyncedDrafts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        draft.isSynced = true;
        success++;
      } catch {
        failed++;
      }
    }

    await this.setItem(this.storageKey, JSON.stringify(pendingDrafts));
    return { success, failed };
  }

  async isOnline(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }
    return true;
  }
}

export const offlineUploadService = new OfflineUploadService();
export type { MachineryDraft };