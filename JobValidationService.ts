export interface JobValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'decimal';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

export class JobValidationService {
  private static validationRules: ValidationRule[] = [
    { field: 'job_id', required: true, type: 'string', minLength: 3, maxLength: 20, pattern: /^[A-Z]{3}-\d{3}$/ },
    { field: 'description', required: true, type: 'string', minLength: 10, maxLength: 1000 },
    { field: 'unit', required: true, type: 'string', minLength: 1, maxLength: 20 },
    { field: 'quantity', required: true, type: 'decimal', min: 0.01, max: 999999.99 },
    { field: 'unit_price', required: true, type: 'decimal', min: 0.01, max: 999999.99 }
  ];

  private static validUnits = [
    'M3', 'M2', 'ML', 'PZA', 'TON', 'KG', 'LT', 'GL', 'JGO', 'LOT', 'SRV'
  ];

  private static validCategories = [
    'CIM', 'EST', 'ALB', 'INS', 'ACB', 'URB', 'ELE', 'HID', 'GAS', 'CLI'
  ];

  static validateJob(job: any): JobValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate against rules
    for (const rule of this.validationRules) {
      const value = job[rule.field];
      
      if (rule.required && (!value || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value) {
        if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`${rule.field} must be a string`);
        } else if (rule.type === 'number' || rule.type === 'decimal') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push(`${rule.field} must be a valid number`);
          } else {
            if (rule.min !== undefined && numValue < rule.min) {
              errors.push(`${rule.field} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors.push(`${rule.field} must not exceed ${rule.max}`);
            }
          }
        }

        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.field} format is invalid`);
        }
      }
    }

    // Validate unit
    if (job.unit && !this.validUnits.includes(job.unit.toUpperCase())) {
      warnings.push(`Unit '${job.unit}' is not in standard list: ${this.validUnits.join(', ')}`);
    }

    // Validate category from job_id
    if (job.job_id) {
      const category = job.job_id.split('-')[0];
      if (!this.validCategories.includes(category)) {
        warnings.push(`Category '${category}' is not in standard list: ${this.validCategories.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateJobBatch(jobs: any[]): { validJobs: any[], invalidJobs: any[], summary: string } {
    const validJobs: any[] = [];
    const invalidJobs: any[] = [];
    let totalWarnings = 0;

    jobs.forEach((job, index) => {
      const validation = this.validateJob(job);
      totalWarnings += validation.warnings.length;
      
      if (validation.isValid) {
        validJobs.push({ ...job, warnings: validation.warnings });
      } else {
        invalidJobs.push({ ...job, errors: validation.errors, warnings: validation.warnings, rowIndex: index + 1 });
      }
    });

    const summary = `Processed ${jobs.length} jobs: ${validJobs.length} valid, ${invalidJobs.length} invalid, ${totalWarnings} warnings`;
    
    return { validJobs, invalidJobs, summary };
  }
}