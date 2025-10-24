import { JobValidationService } from './JobValidationService';
import { JobDuplicateDetectionService } from './JobDuplicateDetectionService';

export interface JobData {
  job_id: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  concept_id: string;
}

export interface ParsedJobCatalog {
  jobs: JobData[];
  validJobs: JobData[];
  invalidJobs: any[];
  duplicates: any[];
  totalJobs: number;
  totalValue: number;
  validationSummary: string;
  duplicateSummary: string;
}

export class JobCatalogParser {
  static async parseAndValidateExcel(content: string, siteId: string): Promise<ParsedJobCatalog> {
    const rawJobs = this.parseExcelContent(content);
    return await this.processJobs(rawJobs.jobs, siteId);
  }

  static async parseAndValidateCSV(content: string, siteId: string): Promise<ParsedJobCatalog> {
    const rawJobs = this.parseCSVContent(content);
    return await this.processJobs(rawJobs.jobs, siteId);
  }

  private static async processJobs(jobs: JobData[], siteId: string): Promise<ParsedJobCatalog> {
    // Validate jobs
    const validation = JobValidationService.validateJobBatch(jobs);
    
    // Check for duplicates
    const duplicateCheck = await JobDuplicateDetectionService.checkBatchDuplicates(
      siteId, 
      validation.validJobs
    );

    const totalValue = validation.validJobs.reduce((sum, job) => 
      sum + (job.quantity * job.unit_price), 0
    );

    return {
      jobs,
      validJobs: duplicateCheck.newJobs,
      invalidJobs: validation.invalidJobs,
      duplicates: duplicateCheck.duplicates,
      totalJobs: jobs.length,
      totalValue,
      validationSummary: validation.summary,
      duplicateSummary: duplicateCheck.summary
    };
  }

  private static parseExcelContent(content: string): { jobs: JobData[] } {
    const lines = content.split('\n');
    const jobs: JobData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length >= 5) {
        const jobId = parts[0]?.trim() || `JOB-${i}`;
        const quantity = parseFloat(parts[3]) || 0;
        const unitPrice = parseFloat(parts[4]) || 0;
        
        const job: JobData = {
          job_id: jobId,
          description: parts[1]?.trim() || '',
          unit: parts[2]?.trim() || 'PZA',
          quantity,
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          category: this.extractCategory(jobId),
          concept_id: this.extractConceptId(jobId)
        };
        
        jobs.push(job);
      }
    }

    return { jobs };
  }

  private static parseCSVContent(content: string): { jobs: JobData[] } {
    const lines = content.split('\n');
    const jobs: JobData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length >= 5) {
        const jobId = parts[0]?.replace(/"/g, '').trim() || `JOB-${i}`;
        const quantity = parseFloat(parts[3]?.replace(/"/g, '')) || 0;
        const unitPrice = parseFloat(parts[4]?.replace(/"/g, '')) || 0;
        
        const job: JobData = {
          job_id: jobId,
          description: parts[1]?.replace(/"/g, '').trim() || '',
          unit: parts[2]?.replace(/"/g, '').trim() || 'PZA',
          quantity,
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          category: this.extractCategory(jobId),
          concept_id: this.extractConceptId(jobId)
        };
        
        jobs.push(job);
      }
    }

    return { jobs };
  }

  private static extractCategory(jobId: string): string {
    const prefix = jobId.split('-')[0];
    const categoryMap: { [key: string]: string } = {
      'CIM': 'Cimentación',
      'EST': 'Estructura', 
      'ALB': 'Albañilería',
      'INS': 'Instalaciones',
      'ACB': 'Acabados',
      'URB': 'Urbanización',
      'ELE': 'Eléctrico',
      'HID': 'Hidráulico',
      'GAS': 'Gas',
      'CLI': 'Climatización'
    };
    return categoryMap[prefix] || 'General';
  }

  private static extractConceptId(jobId: string): string {
    const prefix = jobId.split('-')[0];
    const conceptMap: { [key: string]: string } = {
      'CIM': 'cimentacion-principal',
      'EST': 'estructura-principal',
      'ALB': 'albanileria-general',
      'INS': 'instalaciones-generales',
      'ACB': 'acabados-finales',
      'URB': 'urbanizacion-exterior'
    };
    return conceptMap[prefix] || 'concepto-general';
  }

  static generateSampleCSV(): string {
    return `job_id,description,unit,quantity,unit_price
CIM-001,EXCAVACIÓN POR MEDIOS MECÁNICOS EN MATERIAL TIPO B,M3,150.50,85.75
CIM-002,EXCAVACIÓN POR MEDIOS MANUALES EN MATERIAL TIPO B,M3,25.30,125.40
EST-001,CONCRETO PREMEZCLADO F'C=250 KG/CM2,M3,45.20,2850.00
ALB-001,MURO DE BLOCK 15-20-40 CM,M2,180.75,245.60`;
  }
}