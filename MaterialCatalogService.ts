import { MaterialItem, MaterialQuoteRequest } from '../types';

interface QuoteComparison {
  quote: MaterialQuoteRequest;
  material: MaterialItem;
  supplierName: string;
}

class MaterialCatalogServiceClass {
  private materials: MaterialItem[] = [];
  private quoteRequests: MaterialQuoteRequest[] = [];
  private suppliers: { [id: string]: string } = {
    'supplier1': 'BuildCorp Materials',
    'supplier2': 'ProSupply Co.',
    'supplier3': 'Quality Materials Ltd'
  };

  // Mock data generation
  generateMockMaterials(supplierId: string): MaterialItem[] {
    const categories = [
      'Cement & Concrete', 'Steel & Rebar', 'Aggregates', 'Lumber & Wood',
      'Roofing Materials', 'Insulation', 'Plumbing Supplies', 'Electrical'
    ];
    
    const unitTypes = ['kg', 'm²', 'piece', 'sack', 'liter', 'm³', 'ton'];
    
    const mockMaterials: MaterialItem[] = [
      {
        id: '1',
        supplier_id: supplierId,
        name: 'Portland Cement',
        category: 'Cement & Concrete',
        unit_price: 12.50,
        unit_type: 'sack',
        stock_quantity: 500,
        perishable: false,
        lead_time_days: 3,
        rating: 4.5,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        supplier_id: supplierId,
        name: 'Steel Rebar 12mm',
        category: 'Steel & Rebar',
        unit_price: 850.00,
        unit_type: 'ton',
        stock_quantity: 50,
        perishable: false,
        lead_time_days: 7,
        rating: 4.8,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        supplier_id: supplierId,
        name: 'Crushed Stone Aggregate',
        category: 'Aggregates',
        unit_price: 45.00,
        unit_type: 'm³',
        stock_quantity: 200,
        perishable: false,
        lead_time_days: 2,
        rating: 4.2,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        supplier_id: supplierId,
        name: 'Pressure Treated Lumber 2x4',
        category: 'Lumber & Wood',
        unit_price: 8.75,
        unit_type: 'piece',
        stock_quantity: 1000,
        perishable: false,
        lead_time_days: 5,
        rating: 4.3,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        supplier_id: supplierId,
        name: 'Asphalt Shingles',
        category: 'Roofing Materials',
        unit_price: 95.00,
        unit_type: 'bundle',
        stock_quantity: 150,
        perishable: false,
        lead_time_days: 4,
        rating: 4.6,
        created_at: new Date().toISOString()
      }
    ];

    return mockMaterials;
  }

  // Material management
  async getMaterialsBySupplier(supplierId: string): Promise<MaterialItem[]> {
    return this.materials.filter(m => m.supplier_id === supplierId);
  }

  async getAllMaterials(): Promise<MaterialItem[]> {
    // Generate mock data for demo
    if (this.materials.length === 0) {
      this.materials = [
        ...this.generateMockMaterials('supplier1'),
        ...this.generateMockMaterials('supplier2')
      ];
    }
    return this.materials;
  }

  async searchMaterials(searchTerm: string): Promise<MaterialItem[]> {
    const allMaterials = await this.getAllMaterials();
    return allMaterials.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getQuotesByMaterial(materialName: string, contractorId: string): Promise<QuoteComparison[]> {
    // Generate mock quotes for comparison
    const materials = await this.getAllMaterials();
    const matchingMaterials = materials.filter(m => m.name.toLowerCase().includes(materialName.toLowerCase()));
    
    const comparisons: QuoteComparison[] = [];
    
    for (const material of matchingMaterials) {
      const quote: MaterialQuoteRequest = {
        id: `quote_${material.id}_${Date.now()}`,
        contractor_id: contractorId,
        material_id: material.id,
        supplier_id: material.supplier_id,
        site_id: 'site1',
        quantity: 100,
        status: 'pending',
        counter_offer_price: material.unit_price * (0.9 + Math.random() * 0.2), // Vary prices
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        material_name: material.name,
        requested_by_contractor_id: contractorId
      };
      
      comparisons.push({
        quote,
        material,
        supplierName: this.suppliers[material.supplier_id] || 'Unknown Supplier'
      });
    }
    
    return comparisons;
  }

  async acceptQuote(quoteId: string, contractorId: string): Promise<void> {
    // Mark quote as accepted and decline others for same material
    const quote = this.quoteRequests.find(q => q.id === quoteId);
    if (quote) {
      quote.status = 'accepted';
      quote.updated_at = new Date().toISOString();
      
      // Decline other quotes for same material
      this.quoteRequests
        .filter(q => q.material_name === quote.material_name && q.id !== quoteId)
        .forEach(q => {
          q.status = 'declined';
          q.updated_at = new Date().toISOString();
        });
    }
  }

  async sendBatchQuoteRequest(materialName: string, contractorId: string): Promise<void> {
    // Send quote requests to all suppliers with this material
    const materials = await this.getAllMaterials();
    const matchingMaterials = materials.filter(m => m.name.toLowerCase().includes(materialName.toLowerCase()));
    
    for (const material of matchingMaterials) {
      const quote: MaterialQuoteRequest = {
        id: `batch_${material.id}_${Date.now()}`,
        contractor_id: contractorId,
        material_id: material.id,
        supplier_id: material.supplier_id,
        site_id: 'site1',
        quantity: 100,
        status: 'pending',
        notes: `Batch RFQ: ${materialName}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        material_name: materialName,
        requested_by_contractor_id: contractorId
      };
      
      this.quoteRequests.push(quote);
    }
  }

  async addMaterial(materialData: Partial<MaterialItem>): Promise<MaterialItem> {
    const newMaterial: MaterialItem = {
      id: Date.now().toString(),
      supplier_id: materialData.supplier_id || 'current_user',
      name: materialData.name || '',
      category: materialData.category || '',
      unit_price: materialData.unit_price || 0,
      unit_type: materialData.unit_type || 'piece',
      stock_quantity: materialData.stock_quantity || 0,
      perishable: materialData.perishable || false,
      lead_time_days: materialData.lead_time_days || 0,
      photo_url: materialData.photo_url,
      rating: 0,
      created_at: new Date().toISOString()
    };

    this.materials.push(newMaterial);
    return newMaterial;
  }

  async updateMaterial(material: MaterialItem): Promise<MaterialItem> {
    const index = this.materials.findIndex(m => m.id === material.id);
    if (index !== -1) {
      this.materials[index] = material;
    }
    return material;
  }

  async deleteMaterial(materialId: string): Promise<void> {
    this.materials = this.materials.filter(m => m.id !== materialId);
  }

  // Quote request management
  async createQuoteRequest(quoteData: Partial<MaterialQuoteRequest>): Promise<MaterialQuoteRequest> {
    const newQuote: MaterialQuoteRequest = {
      id: Date.now().toString(),
      contractor_id: quoteData.contractor_id || 'current_user',
      material_id: quoteData.material_id || '',
      supplier_id: quoteData.supplier_id || '',
      site_id: quoteData.site_id || '',
      quantity: quoteData.quantity || 0,
      notes: quoteData.notes,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      material_name: quoteData.material_name || '',
      requested_by_contractor_id: quoteData.requested_by_contractor_id || quoteData.contractor_id || ''
    };

    this.quoteRequests.push(newQuote);
    return newQuote;
  }

  async getQuoteRequestsBySupplier(supplierId: string): Promise<MaterialQuoteRequest[]> {
    return this.quoteRequests.filter(q => q.supplier_id === supplierId);
  }

  async getQuoteRequestsByContractor(contractorId: string): Promise<MaterialQuoteRequest[]> {
    return this.quoteRequests.filter(q => q.contractor_id === contractorId);
  }

  async acceptQuoteRequest(quoteId: string, counterOfferPrice?: number): Promise<MaterialQuoteRequest> {
    const quote = this.quoteRequests.find(q => q.id === quoteId);
    if (quote) {
      quote.status = 'accepted';
      quote.counter_offer_price = counterOfferPrice;
      quote.updated_at = new Date().toISOString();
    }
    return quote!;
  }

  async declineQuoteRequest(quoteId: string): Promise<MaterialQuoteRequest> {
    const quote = this.quoteRequests.find(q => q.id === quoteId);
    if (quote) {
      quote.status = 'declined';
      quote.updated_at = new Date().toISOString();
    }
    return quote!;
  }

  // Filter materials
  async filterMaterials(filters: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    perishable?: boolean;
    leadTimeRange?: { min: number; max: number };
    unitType?: string;
  }): Promise<MaterialItem[]> {
    let filtered = await this.getAllMaterials();

    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes('All Categories')) {
      filtered = filtered.filter(m => filters.categories!.includes(m.category));
    }

    if (filters.priceRange) {
      filtered = filtered.filter(m => 
        m.unit_price >= filters.priceRange!.min && m.unit_price <= filters.priceRange!.max
      );
    }

    if (filters.perishable !== undefined) {
      filtered = filtered.filter(m => m.perishable === filters.perishable);
    }

    if (filters.leadTimeRange) {
      filtered = filtered.filter(m => 
        m.lead_time_days >= filters.leadTimeRange!.min && m.lead_time_days <= filters.leadTimeRange!.max
      );
    }

    if (filters.unitType && filters.unitType !== 'All Units') {
      filtered = filtered.filter(m => m.unit_type === filters.unitType);
    }

    return filtered;
  }
}

export const MaterialCatalogService = new MaterialCatalogServiceClass();
export default MaterialCatalogService;