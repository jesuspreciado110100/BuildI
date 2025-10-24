import { supabase } from '@/app/lib/supabase';

export interface Job {
  id?: string;
  site_id: string;
  concept_id: string;
  job_id: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobInsertResult {
  success: boolean;
  data?: Job[];
  error?: string;
  insertedCount?: number;
  skippedCount?: number;
}

export class JobSupabaseService {
  static async insertJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<JobInsertResult> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .insert([{
          ...job,
          category: job.job_id.split('-')[0],
          status: 'pending'
        }])
        .select();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || [],
        insertedCount: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async insertJobsBatch(jobs: Omit<Job, 'id' | 'created_at' | 'updated_at'>[]): Promise<JobInsertResult> {
    try {
      const jobsToInsert = jobs.map(job => ({
        ...job,
        category: job.job_id.split('-')[0],
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('tareas')
        .insert(jobsToInsert)
        .select();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || [],
        insertedCount: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getJobsBySite(siteId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('site_id', siteId)
        .order('job_id');

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getJobsBySite:', error);
      return [];
    }
  }

  static async getJobsByConcept(siteId: string, conceptId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('site_id', siteId)
        .eq('concept_id', conceptId)
        .order('job_id');

      if (error) {
        console.error('Error fetching jobs by concept:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getJobsByConcept:', error);
      return [];
    }
  }

  static async updateJobStatus(jobId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      return false;
    }
  }

  static async deleteJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJob:', error);
      return false;
    }
  }

  static async getJobStatistics(siteId: string): Promise<{
    totalJobs: number;
    totalValue: number;
    jobsByCategory: Record<string, number>;
    jobsByStatus: Record<string, number>;
  }> {
    try {
      const jobs = await this.getJobsBySite(siteId);
      
      const totalJobs = jobs.length;
      const totalValue = jobs.reduce((sum, job) => sum + (job.quantity * job.unit_price), 0);
      
      const jobsByCategory = jobs.reduce((acc, job) => {
        const category = job.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const jobsByStatus = jobs.reduce((acc, job) => {
        const status = job.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalJobs,
        totalValue,
        jobsByCategory,
        jobsByStatus
      };
    } catch (error) {
      console.error('Error getting job statistics:', error);
      return {
        totalJobs: 0,
        totalValue: 0,
        jobsByCategory: {},
        jobsByStatus: {}
      };
    }
  }
}