import { TemplateField } from './DocumentTemplateService';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class FieldValidationService {
  static validateField(field: TemplateField, value: any): ValidationResult {
    // Required field validation
    if (field.required && this.isEmpty(value)) {
      return {
        isValid: false,
        error: `${field.name} is required`
      };
    }

    // Skip further validation if field is empty and not required
    if (this.isEmpty(value)) {
      return { isValid: true };
    }

    // Type-specific validation
    switch (field.type) {
      case 'number':
        return this.validateNumber(field, value);
      case 'date':
        return this.validateDate(field, value);
      case 'text':
        return this.validateText(field, value);
      case 'select':
        return this.validateSelect(field, value);
      case 'multiselect':
        return this.validateMultiSelect(field, value);
      default:
        return { isValid: true };
    }
  }

  private static isEmpty(value: any): boolean {
    return value === null || value === undefined || 
           (typeof value === 'string' && value.trim() === '') ||
           (Array.isArray(value) && value.length === 0);
  }

  private static validateNumber(field: TemplateField, value: any): ValidationResult {
    const num = Number(value);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        error: `${field.name} must be a valid number`
      };
    }

    if (field.validation?.min !== undefined && num < field.validation.min) {
      return {
        isValid: false,
        error: `${field.name} must be at least ${field.validation.min}`
      };
    }

    if (field.validation?.max !== undefined && num > field.validation.max) {
      return {
        isValid: false,
        error: `${field.name} must be no more than ${field.validation.max}`
      };
    }

    return { isValid: true };
  }

  private static validateDate(field: TemplateField, value: any): ValidationResult {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${field.name} must be a valid date`
      };
    }

    return { isValid: true };
  }

  private static validateText(field: TemplateField, value: any): ValidationResult {
    const text = value.toString();

    if (field.validation?.min !== undefined && text.length < field.validation.min) {
      return {
        isValid: false,
        error: `${field.name} must be at least ${field.validation.min} characters`
      };
    }

    if (field.validation?.max !== undefined && text.length > field.validation.max) {
      return {
        isValid: false,
        error: `${field.name} must be no more than ${field.validation.max} characters`
      };
    }

    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(text)) {
        return {
          isValid: false,
          error: `${field.name} format is invalid`
        };
      }
    }

    return { isValid: true };
  }

  private static validateSelect(field: TemplateField, value: any): ValidationResult {
    if (field.validation?.options && !field.validation.options.includes(value)) {
      return {
        isValid: false,
        error: `${field.name} must be one of the available options`
      };
    }

    return { isValid: true };
  }

  private static validateMultiSelect(field: TemplateField, value: any): ValidationResult {
    if (!Array.isArray(value)) {
      return {
        isValid: false,
        error: `${field.name} must be an array of values`
      };
    }

    if (field.validation?.options) {
      const invalidOptions = value.filter(v => !field.validation!.options!.includes(v));
      if (invalidOptions.length > 0) {
        return {
          isValid: false,
          error: `${field.name} contains invalid options: ${invalidOptions.join(', ')}`
        };
      }
    }

    return { isValid: true };
  }

  static validateForm(fields: TemplateField[], formData: { [key: string]: any }): { 
    isValid: boolean; 
    errors: { [key: string]: string } 
  } {
    const errors: { [key: string]: string } = {};
    
    fields.forEach(field => {
      const result = this.validateField(field, formData[field.id]);
      if (!result.isValid && result.error) {
        errors[field.id] = result.error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}