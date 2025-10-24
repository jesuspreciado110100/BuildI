import { supabase } from '../lib/supabase';

// Simple in-memory storage fallback for missing AsyncStorage
const memoryStorage: { [key: string]: string } = {};
const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return memoryStorage[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage[key] = value;
  },
  getAllKeys: async (): Promise<string[]> => {
    return Object.keys(memoryStorage);
  }
};

// Simple network status fallback
const NetInfo = {
  addEventListener: (callback: (state: { isConnected: boolean }) => void) => {
    // Assume online by default
    callback({ isConnected: true });
    return () => {};
  }
};

export interface OfflineDocument {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  version: number;
  isOffline: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'downloading';
  priority: 'high' | 'medium' | 'low';
  size: number;
  downloadedAt?: string;
}

export interface ConflictResolution {
  documentId: string;
  localVersion: number;
  remoteVersion: number;
  conflictType: 'content' | 'metadata';
  resolution: 'local' | 'remote' | 'merge';
}

class OfflineDocumentService {
  private syncQueue: string[] = [];
  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        this.performAutoSync();
      }
    });
  }

  async cacheDocument(document: any): Promise<void> {
    const offlineDoc: OfflineDocument = {
      id: document.id,
      title: document.title,
      content: document.content,
      lastModified: new Date().toISOString(),
      version: document.version || 1,
      isOffline: true,
      syncStatus: 'synced',
      priority: 'medium',
      size: JSON.stringify(document).length,
      downloadedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(
      `offline_doc_${document.id}`, 
      JSON.stringify(offlineDoc)
    );
  }

  async getOfflineDocument(documentId: string): Promise<OfflineDocument | null> {
    const stored = await AsyncStorage.getItem(`offline_doc_${documentId}`);
    return stored ? JSON.parse(stored) : null;
  }

  async updateOfflineDocument(documentId: string, updates: Partial<OfflineDocument>): Promise<void> {
    const existing = await this.getOfflineDocument(documentId);
    if (existing) {
      const updated = { ...existing, ...updates, lastModified: new Date().toISOString() };
      await AsyncStorage.setItem(`offline_doc_${documentId}`, JSON.stringify(updated));
      
      if (!this.syncQueue.includes(documentId)) {
        this.syncQueue.push(documentId);
      }
    }
  }

  async performAutoSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    const prioritizedQueue = await this.prioritizeSync();
    
    for (const docId of prioritizedQueue) {
      await this.syncDocument(docId);
    }
    
    this.syncInProgress = false;
  }

  private async prioritizeSync(): Promise<string[]> {
    const docs = await Promise.all(
      this.syncQueue.map(id => this.getOfflineDocument(id))
    );
    
    return docs
      .filter(doc => doc !== null)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b!.priority] - priorityOrder[a!.priority];
      })
      .map(doc => doc!.id);
  }

  private async syncDocument(documentId: string): Promise<void> {
    const offlineDoc = await this.getOfflineDocument(documentId);
    if (!offlineDoc) return;

    try {
      await this.updateOfflineDocument(documentId, { syncStatus: 'pending' });
      
      const { data: remoteDoc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      if (remoteDoc.version > offlineDoc.version) {
        await this.handleConflict(offlineDoc, remoteDoc);
      } else {
        await this.uploadChanges(offlineDoc);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      await this.updateOfflineDocument(documentId, { syncStatus: 'conflict' });
    }
  }

  private async handleConflict(local: OfflineDocument, remote: any): Promise<void> {
    await this.updateOfflineDocument(local.id, { syncStatus: 'conflict' });
  }

  private async uploadChanges(document: OfflineDocument): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({
        content: document.content,
        version: document.version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', document.id);

    if (!error) {
      await this.updateOfflineDocument(document.id, { 
        syncStatus: 'synced',
        version: document.version + 1
      });
      this.syncQueue = this.syncQueue.filter(id => id !== document.id);
    }
  }

  async downloadForOffline(documentId: string): Promise<boolean> {
    try {
      await this.updateOfflineDocument(documentId, { syncStatus: 'downloading' });
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      await this.cacheDocument(data);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  async getOfflineDocuments(): Promise<OfflineDocument[]> {
    const keys = await AsyncStorage.getAllKeys();
    const docKeys = keys.filter(key => key.startsWith('offline_doc_'));
    
    const docs = await Promise.all(
      docKeys.map(async key => {
        const stored = await AsyncStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      })
    );
    
    return docs.filter(doc => doc !== null);
  }

  getSyncStatus(): { isOnline: boolean; syncInProgress: boolean; queueLength: number } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length
    };
  }
}

export const offlineDocumentService = new OfflineDocumentService();