import { Material, Store } from '../types';

// Mock API service for inventory sync
class InventoryService {
  private static instance: InventoryService;
  private stores: Store[] = [];
  private materials: Material[] = [];

  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  // Mock API endpoint for inventory sync
  async syncInventory(apiKey: string, storeId: string, materials: {
    sku: string;
    stock: number;
    price: number;
  }[]): Promise<{ success: boolean; message: string }> {
    // Simulate API validation
    const store = this.stores.find(s => s.id === storeId && s.apiKey === apiKey);
    if (!store) {
      return { success: false, message: 'Invalid API key or store ID' };
    }

    // Simulate inventory update
    materials.forEach(item => {
      const existingMaterial = this.materials.find(m => 
        m.sku === item.sku && m.storeId === storeId
      );
      
      if (existingMaterial) {
        existingMaterial.stockQuantity = item.stock;
        existingMaterial.unitPrice = item.price;
      } else {
        // Create new material entry
        const newMaterial: Material = {
          id: Date.now().toString(),
          name: `Material ${item.sku}`,
          category: 'General',
          unitPrice: item.price,
          stockQuantity: item.stock,
          deliveryAreaRadius: store.deliveryRadius,
          deliveryTimeEstimate: 24,
          supplierId: store.supplierId,
          storeId: storeId,
          sku: item.sku
        };
        this.materials.push(newMaterial);
      }
    });

    return { success: true, message: 'Inventory synced successfully' };
  }

  // Store management methods
  addStore(store: Store): void {
    this.stores.push(store);
  }

  getStores(): Store[] {
    return this.stores;
  }

  updateStore(store: Store): void {
    const index = this.stores.findIndex(s => s.id === store.id);
    if (index !== -1) {
      this.stores[index] = store;
    }
  }

  deleteStore(storeId: string): void {
    this.stores = this.stores.filter(s => s.id !== storeId);
    // Also remove materials from this store
    this.materials = this.materials.filter(m => m.storeId !== storeId);
  }

  // Material management methods
  getMaterialsByStore(storeId: string): Material[] {
    return this.materials.filter(m => m.storeId === storeId);
  }

  addMaterial(material: Material): void {
    this.materials.push(material);
  }

  updateMaterial(material: Material): void {
    const index = this.materials.findIndex(m => m.id === material.id);
    if (index !== -1) {
      this.materials[index] = material;
    }
  }

  deleteMaterial(materialId: string): void {
    this.materials = this.materials.filter(m => m.id !== materialId);
  }

  // Find nearby stores based on contractor location
  findNearbyStores(contractorLat: number, contractorLng: number, maxDistance: number = 50): Store[] {
    return this.stores.filter(store => {
      const distance = this.calculateDistance(
        contractorLat, contractorLng,
        store.latitude, store.longitude
      );
      return distance <= Math.min(maxDistance, store.deliveryRadius);
    });
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Generate API key for store
  generateApiKey(): string {
    return 'sk_' + Math.random().toString(36).substr(2, 32);
  }

  // Global price update
  updateGlobalPrice(materialName: string, newPrice: number, supplierId: string): void {
    this.materials
      .filter(m => m.name === materialName && m.supplierId === supplierId)
      .forEach(m => m.unitPrice = newPrice);
  }

  // Store-specific price override
  overrideStorePrice(storeId: string, materialId: string, newPrice: number): void {
    const material = this.materials.find(m => m.id === materialId && m.storeId === storeId);
    if (material) {
      material.unitPrice = newPrice;
    }
  }
}

export default InventoryService;