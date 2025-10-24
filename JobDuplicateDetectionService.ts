import { supabase } from '@/app/lib/supabase';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingJob?: any;
  similarJobs: any[];
}

export interface DuplicateBatchResult {
  duplicates: any[];
  newJobs: any[];
  summary: string;
}

export class JobDuplicateDetectionService {
  static async checkDuplicate(siteId: string, jobId: string): Promise<DuplicateCheckResult> {
    try {
      // Check exact duplicate by job_id
      const { data: exactMatch, error: exactError } = await supabase
        .from('jobs')
        .select('*')
        .eq('site_id', siteId)
        .eq('job_id', jobId)
        .single();

      if (exactError && exactError.code !== 'PGRST116') {
        console.error('Error checking exact duplicate:', exactError);
      }

      // Check similar jobs by description (fuzzy match)
      const { data: allJobs, error: allError } = await supabase
        .from('jobs')
        .select('*')
        .eq('site_id', siteId);

      if (allError) {
        console.error('Error fetching jobs for similarity check:', allError);
        return {
          isDuplicate: !!exactMatch,
          existingJob: exactMatch || undefined,
          similarJobs: []
        };
      }

      const similarJobs = allJobs?.filter(job => 
        job.job_id !== jobId && 
        this.calculateSimilarity(job.description, jobId) > 0.8
      ) || [];

      return {
        isDuplicate: !!exactMatch,
        existingJob: exactMatch || undefined,
        similarJobs
      };
    } catch (error) {
      console.error('Error in duplicate detection:', error);
      return {
        isDuplicate: false,
        similarJobs: []
      };
    }
  }

  static async checkBatchDuplicates(siteId: string, jobs: any[]): Promise<DuplicateBatchResult> {
    const duplicates: any[] = [];
    const newJobs: any[] = [];

    for (const job of jobs) {
      const duplicateCheck = await this.checkDuplicate(siteId, job.job_id);
      
      if (duplicateCheck.isDuplicate) {
        duplicates.push({
          ...job,
          existingJob: duplicateCheck.existingJob,
          similarJobs: duplicateCheck.similarJobs
        });
      } else {
        newJobs.push({
          ...job,
          similarJobs: duplicateCheck.similarJobs
        });
      }
    }

    const summary = `Duplicate check: ${newJobs.length} new jobs, ${duplicates.length} duplicates found`;
    
    return { duplicates, newJobs, summary };
  }

  private static calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation using Levenshtein distance
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static async getExistingJobIds(siteId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('job_id')
        .eq('site_id', siteId);

      if (error) {
        console.error('Error fetching existing job IDs:', error);
        return [];
      }

      return data?.map(job => job.job_id) || [];
    } catch (error) {
      console.error('Error in getExistingJobIds:', error);
      return [];
    }
  }
}