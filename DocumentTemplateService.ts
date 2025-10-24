export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'signature' | 'photo';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  autoPopulate?: {
    source: 'project' | 'site' | 'user' | 'date';
    field: string;
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: 'safety' | 'daily-log' | 'inspection' | 'change-order' | 'progress' | 'custom';
  description: string;
  fields: TemplateField[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  version: number;
}

export class DocumentTemplateService {
  private templates: DocumentTemplate[] = [];

  async getBuiltInTemplates(): Promise<DocumentTemplate[]> {
    return [
      {
        id: 'safety-report',
        name: 'Safety Report',
        category: 'safety',
        description: 'Daily safety inspection and incident report',
        fields: [
          { id: 'date', name: 'Date', type: 'date', required: true, autoPopulate: { source: 'date', field: 'current' } },
          { id: 'inspector', name: 'Inspector', type: 'text', required: true, autoPopulate: { source: 'user', field: 'name' } },
          { id: 'site', name: 'Site Location', type: 'text', required: true, autoPopulate: { source: 'site', field: 'name' } },
          { id: 'hazards', name: 'Hazards Identified', type: 'multiselect', required: false, validation: { options: ['Fall Risk', 'Electrical', 'Chemical', 'Equipment', 'Other'] } },
          { id: 'incidents', name: 'Incidents Reported', type: 'text', required: false },
          { id: 'corrective_actions', name: 'Corrective Actions', type: 'text', required: false },
          { id: 'signature', name: 'Inspector Signature', type: 'signature', required: true }
        ],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        version: 1
      },
      {
        id: 'daily-log',
        name: 'Daily Construction Log',
        category: 'daily-log',
        description: 'Daily progress and activity log',
        fields: [
          { id: 'date', name: 'Date', type: 'date', required: true, autoPopulate: { source: 'date', field: 'current' } },
          { id: 'weather', name: 'Weather Conditions', type: 'select', required: true, validation: { options: ['Clear', 'Cloudy', 'Rain', 'Snow', 'Wind'] } },
          { id: 'crew_size', name: 'Crew Size', type: 'number', required: true, validation: { min: 1, max: 100 } },
          { id: 'activities', name: 'Activities Completed', type: 'text', required: true },
          { id: 'materials_delivered', name: 'Materials Delivered', type: 'text', required: false },
          { id: 'equipment_used', name: 'Equipment Used', type: 'text', required: false },
          { id: 'delays', name: 'Delays/Issues', type: 'text', required: false },
          { id: 'photos', name: 'Progress Photos', type: 'photo', required: false }
        ],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        version: 1
      }
    ];
  }

  async validateTemplate(template: DocumentTemplate): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!template.name?.trim()) errors.push('Template name is required');
    if (!template.fields?.length) errors.push('At least one field is required');
    
    template.fields?.forEach((field, index) => {
      if (!field.name?.trim()) errors.push(`Field ${index + 1}: Name is required`);
      if (!field.type) errors.push(`Field ${index + 1}: Type is required`);
    });

    return { isValid: errors.length === 0, errors };
  }

  async saveTemplate(template: DocumentTemplate): Promise<void> {
    // In real app, save to Supabase
    this.templates.push(template);
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    const builtIn = await this.getBuiltInTemplates();
    return [...builtIn, ...this.templates];
  }
}