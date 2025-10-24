import { BIMConceptMapping, BIMObject } from '../types';

// Mock data for BIM objects
const mockBIMObjects: Record<string, BIMObject[]> = {
  '2': [ // Building_Model.ifc
    {
      id: 'obj-1',
      guid: 'guid-wall-001',
      name: 'Exterior Wall - North',
      type: 'Wall',
      geometry: { x: 0, y: 0, z: 0, width: 10, height: 3, depth: 0.3 },
      properties: { material: 'Concrete', thickness: '300mm' },
      material: 'Concrete',
      layer: 'Walls'
    },
    {
      id: 'obj-2',
      guid: 'guid-beam-001',
      name: 'Steel Beam - Main',
      type: 'Beam',
      geometry: { x: 0, y: 0, z: 3, width: 10, height: 0.4, depth: 0.2 },
      properties: { material: 'Steel', profile: 'IPE300' },
      material: 'Steel',
      layer: 'Structure'
    },
    {
      id: 'obj-3',
      guid: 'guid-column-001',
      name: 'Concrete Column - C1',
      type: 'Column',
      geometry: { x: 0, y: 0, z: 0, width: 0.4, height: 3, depth: 0.4 },
      properties: { material: 'Concrete', reinforcement: 'Grade 60' },
      material: 'Concrete',
      layer: 'Structure'
    },
    {
      id: 'obj-4',
      guid: 'guid-slab-001',
      name: 'Floor Slab - Level 1',
      type: 'Slab',
      geometry: { x: 0, y: 0, z: 0, width: 10, height: 0.2, depth: 8 },
      properties: { material: 'Concrete', thickness: '200mm' },
      material: 'Concrete',
      layer: 'Floors'
    }
  ],
  '4': [ // Structure_3D.glb
    {
      id: 'obj-5',
      guid: 'guid-foundation-001',
      name: 'Foundation Wall',
      type: 'Foundation',
      geometry: { x: 0, y: 0, z: -1, width: 12, height: 1, depth: 0.5 },
      properties: { material: 'Concrete', grade: 'C30' },
      material: 'Concrete',
      layer: 'Foundation'
    },
    {
      id: 'obj-6',
      guid: 'guid-roof-001',
      name: 'Roof Structure',
      type: 'Roof',
      geometry: { x: 0, y: 0, z: 4, width: 12, height: 0.3, depth: 10 },
      properties: { material: 'Steel', type: 'Truss' },
      material: 'Steel',
      layer: 'Roof'
    }
  ]
};

// Mock mappings storage
let mockMappings: BIMConceptMapping[] = [
  {
    id: 'map-1',
    bim_file_id: '2',
    bim_object_id: 'obj-1',
    concept_id: 'concept-1',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'map-2',
    bim_file_id: '2',
    bim_object_id: 'obj-3',
    concept_id: 'concept-2',
    created_at: '2024-01-20T11:00:00Z'
  }
];

export class BIMConceptMapService {
  static async getBIMObjects(bimFileId: string): Promise<BIMObject[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockBIMObjects[bimFileId] || [];
  }

  static async getLinkedConcepts(bimFileId: string): Promise<BIMConceptMapping[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockMappings.filter(mapping => mapping.bim_file_id === bimFileId);
  }

  static async linkObjectToConcept(bimFileId: string, bimObjectId: string, conceptId: string): Promise<BIMConceptMapping> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove existing mapping for this object
    mockMappings = mockMappings.filter(m => !(m.bim_file_id === bimFileId && m.bim_object_id === bimObjectId));
    
    // Create new mapping
    const newMapping: BIMConceptMapping = {
      id: `map-${Date.now()}`,
      bim_file_id: bimFileId,
      bim_object_id: bimObjectId,
      concept_id: conceptId,
      created_at: new Date().toISOString()
    };
    
    mockMappings.push(newMapping);
    return newMapping;
  }

  static async unlinkObject(bimFileId: string, bimObjectId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    mockMappings = mockMappings.filter(m => !(m.bim_file_id === bimFileId && m.bim_object_id === bimObjectId));
  }

  static async getConceptMappings(conceptId: string): Promise<BIMConceptMapping[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockMappings.filter(mapping => mapping.concept_id === conceptId);
  }
}