export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  specifications: string;
  deliveryTime: string;
  minOrderQuantity: number;
}

export interface MaterialQuoteRequest {
  id: string;
  materialType: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: string;
  deliveryDate: string;
  deliveryLocation: string;
  budget?: number;
  priority: string;
  notes: string;
  qualityGrade: string;
  status: 'pending' | 'quoted' | 'approved' | 'rejected';
  siteId?: string;
  materialId?: string;
  createdAt: string;
}

export class MaterialService {
  private static materials: Material[] = [
    {
      id: '1',
      name: 'Concrete Blocks',
      category: 'Concrete',
      unit: 'pieces',
      price: 2.50,
      supplier: 'BuildCorp Materials',
      availability: 'in_stock',
      description: 'Standard concrete blocks for construction',
      specifications: '8x8x16 inches, 2000 PSI',
      deliveryTime: '2-3 days',
      minOrderQuantity: 100
    },
    {
      id: '2',
      name: 'Steel Rebar',
      category: 'Steel',
      unit: 'tons',
      price: 650.00,
      supplier: 'Steel Solutions Inc',
      availability: 'in_stock',
      description: 'Grade 60 steel reinforcement bars',
      specifications: '#4 rebar, 20ft lengths',
      deliveryTime: '1-2 days',
      minOrderQuantity: 1
    }
  ];

  private static quoteRequests: MaterialQuoteRequest[] = [];

  static async getMaterials(category?: string): Promise<Material[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (category) {
      return this.materials.filter(m => m.category === category);
    }
    return this.materials;
  }

  static async getMaterialById(id: string): Promise<Material | null> {
    return this.materials.find(m => m.id === id) || null;
  }

  static async createQuoteRequest(request: Omit<MaterialQuoteRequest, 'id' | 'createdAt'>): Promise<MaterialQuoteRequest> {
    const newRequest: MaterialQuoteRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.quoteRequests.push(newRequest);
    return newRequest;
  }

  static async getQuoteRequests(userId: string): Promise<MaterialQuoteRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.quoteRequests;
  }

  static async updateQuoteRequest(id: string, updates: Partial<MaterialQuoteRequest>): Promise<MaterialQuoteRequest | null> {
    const index = this.quoteRequests.findIndex(req => req.id === id);
    if (index === -1) return null;
    
    this.quoteRequests[index] = { ...this.quoteRequests[index], ...updates };
    return this.quoteRequests[index];
  }

  static async searchMaterials(query: string): Promise<Material[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.materials.filter(m => 
      m.name.toLowerCase().includes(lowercaseQuery) ||
      m.category.toLowerCase().includes(lowercaseQuery) ||
      m.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getCategories(): string[] {
    return [
      'Concrete', 'Steel', 'Lumber', 'Electrical', 'Plumbing',
      'Insulation', 'Roofing', 'Flooring', 'Paint', 'Hardware'
    ];
  }

  static getUnits(): string[] {
    return [
      'pieces', 'tons', 'cubic yards', 'square feet', 'linear feet',
      'gallons', 'bags', 'rolls', 'sheets', 'boxes'
    ];
  }

  static getQualityGrades(): string[] {
    return ['Economy', 'Standard', 'Premium', 'Commercial'];
  }

  static getPriorityLevels(): string[] {
    return ['Low', 'Medium', 'High', 'Urgent'];
  }
}