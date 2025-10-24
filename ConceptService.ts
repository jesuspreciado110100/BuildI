export interface Concept {
  id: string;
  site_id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  group?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Mock concepts data - replace with actual Supabase queries
const mockConcepts: Concept[] = [
  // Auditorio de Magdalena concepts
  {
    id: 'concept_1',
    site_id: '1',
    description: 'Excavación de cimientos',
    unit: 'M3',
    quantity: 120,
    unitPrice: 45000,
    group: 'Cimentación',
    progress: 75,
    status: 'in_progress',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'concept_2',
    site_id: '1',
    description: 'Concreto para zapatas',
    unit: 'M3',
    quantity: 80,
    unitPrice: 320000,
    group: 'Cimentación',
    progress: 30,
    status: 'in_progress',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T09:15:00Z'
  },
  {
    id: 'concept_3',
    site_id: '1',
    description: 'Estructura metálica',
    unit: 'KG',
    quantity: 5000,
    unitPrice: 8500,
    group: 'Estructura',
    progress: 0,
    status: 'not_started',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  // Canal del Calichi concepts
  {
    id: 'concept_4',
    site_id: '2',
    description: 'Excavación de canal',
    unit: 'M3',
    quantity: 2500,
    unitPrice: 35000,
    group: 'Movimiento de tierra',
    progress: 0,
    status: 'not_started',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'concept_5',
    site_id: '2',
    description: 'Revestimiento en concreto',
    unit: 'M2',
    quantity: 1200,
    unitPrice: 180000,
    group: 'Revestimientos',
    progress: 0,
    status: 'not_started',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  // Escuela Akyami concepts
  {
    id: 'concept_6',
    site_id: '3',
    description: 'Mampostería estructural',
    unit: 'M2',
    quantity: 800,
    unitPrice: 95000,
    group: 'Mampostería',
    progress: 90,
    status: 'in_progress',
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2024-01-25T16:20:00Z'
  },
  {
    id: 'concept_7',
    site_id: '3',
    description: 'Instalaciones eléctricas',
    unit: 'PTO',
    quantity: 45,
    unitPrice: 125000,
    group: 'Instalaciones',
    progress: 60,
    status: 'in_progress',
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2024-01-20T11:45:00Z'
  },
  // Casa Ventura concepts (completed)
  {
    id: 'concept_8',
    site_id: '4',
    description: 'Acabados de lujo',
    unit: 'M2',
    quantity: 350,
    unitPrice: 450000,
    group: 'Acabados',
    progress: 100,
    status: 'completed',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2024-01-30T18:00:00Z'
  },
  {
    id: 'concept_9',
    site_id: '4',
    description: 'Piscina y jardines',
    unit: 'GLB',
    quantity: 1,
    unitPrice: 85000000,
    group: 'Exteriores',
    progress: 100,
    status: 'completed',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  }
];

export class ConceptService {
  static async getConceptsBySite(siteId: string): Promise<Concept[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockConcepts.filter(concept => concept.site_id === siteId);
  }

  static async updateConceptProgress(conceptId: string, progress: number): Promise<Concept> {
    const conceptIndex = mockConcepts.findIndex(c => c.id === conceptId);
    if (conceptIndex === -1) {
      throw new Error('Concept not found');
    }

    const status = progress === 0 ? 'not_started' : 
                  progress === 100 ? 'completed' : 'in_progress';

    mockConcepts[conceptIndex] = {
      ...mockConcepts[conceptIndex],
      progress,
      status,
      updatedAt: new Date().toISOString()
    };

    return mockConcepts[conceptIndex];
  }
}