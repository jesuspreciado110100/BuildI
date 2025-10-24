import { Concept } from '../types';

export class MachinerySuggestionService {
  // Mock concept type to machinery category mapping
  private static conceptToMachineryMap: Record<string, string[]> = {
    'Foundations': ['Excavator', 'Compactor', 'Concrete Mixer'],
    'Earthwork': ['Excavator', 'Bulldozer', 'Dump Truck'],
    'Site Preparation': ['Bulldozer', 'Grader', 'Compactor'],
    'Concrete Work': ['Concrete Mixer', 'Concrete Pump', 'Vibrator'],
    'Steel Work': ['Crane', 'Welder', 'Lift'],
    'Roofing': ['Crane', 'Lift', 'Compressor'],
    'Electrical': ['Lift', 'Generator', 'Compressor'],
    'Plumbing': ['Trencher', 'Pipe Layer', 'Compressor'],
    'Landscaping': ['Skid Steer', 'Compactor', 'Trencher'],
    'Demolition': ['Excavator', 'Bulldozer', 'Dump Truck'],
    'Paving': ['Paver', 'Roller', 'Compactor'],
    'Utilities': ['Trencher', 'Excavator', 'Pipe Layer']
  };

  static getSuggestedCategories(conceptName: string): string[] {
    // Try exact match first
    if (this.conceptToMachineryMap[conceptName]) {
      return this.conceptToMachineryMap[conceptName];
    }

    // Try partial match
    const lowerConceptName = conceptName.toLowerCase();
    for (const [key, categories] of Object.entries(this.conceptToMachineryMap)) {
      if (lowerConceptName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerConceptName)) {
        return categories;
      }
    }

    // Default suggestions for unknown concepts
    return ['Excavator', 'Crane', 'Dump Truck'];
  }

  static updateConceptWithSuggestions(concept: Concept): Concept {
    return {
      ...concept,
      suggested_categories: this.getSuggestedCategories(concept.name)
    };
  }

  static getAllMachineryCategories(): string[] {
    const allCategories = new Set<string>();
    Object.values(this.conceptToMachineryMap).forEach(categories => {
      categories.forEach(category => allCategories.add(category));
    });
    return Array.from(allCategories).sort();
  }

  static getConceptsForMachinery(machineryCategory: string): string[] {
    const concepts: string[] = [];
    for (const [conceptName, categories] of Object.entries(this.conceptToMachineryMap)) {
      if (categories.includes(machineryCategory)) {
        concepts.push(conceptName);
      }
    }
    return concepts;
  }
}