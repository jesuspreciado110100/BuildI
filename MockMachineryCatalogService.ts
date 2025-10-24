// Mock Machinery Catalog Service to replace the undefined service
export interface MachinerySpec {
  type: string;
  brand: string;
  model: string;
  specifications?: Record<string, string>;
  dailyRate?: number;
  availability?: boolean;
}

class MockMachineryCatalogService {
  private mockData: MachinerySpec[] = [
    {
      type: 'Excavator',
      brand: 'Caterpillar',
      model: '320D',
      specifications: {
        'Operating Weight': '20,000 kg',
        'Engine Power': '122 kW',
        'Bucket Capacity': '1.2 m³'
      },
      dailyRate: 450,
      availability: true
    },
    {
      type: 'Bulldozer',
      brand: 'Komatsu',
      model: 'D65PX',
      specifications: {
        'Operating Weight': '18,500 kg',
        'Engine Power': '141 kW',
        'Blade Capacity': '3.8 m³'
      },
      dailyRate: 520,
      availability: true
    },
    {
      type: 'Crane',
      brand: 'Liebherr',
      model: 'LTM 1050',
      specifications: {
        'Max Lifting Capacity': '50 tons',
        'Boom Length': '34 m',
        'Engine Power': '270 kW'
      },
      dailyRate: 850,
      availability: true
    }
  ];

  getAllTypes(): string[] {
    return [...new Set(this.mockData.map(item => item.type))];
  }

  getMachineryByType(type: string): MachinerySpec[] {
    return this.mockData.filter(item => item.type === type);
  }

  getModelsByBrand(brand: string): string[] {
    return this.mockData
      .filter(item => item.brand === brand)
      .map(item => item.model);
  }

  getMachinerySpecs(type: string, brand: string, model: string): MachinerySpec | null {
    return this.mockData.find(item => 
      item.type === type && item.brand === brand && item.model === model
    ) || null;
  }

  getAllMachinery(): MachinerySpec[] {
    return this.mockData;
  }
}

export default new MockMachineryCatalogService();
