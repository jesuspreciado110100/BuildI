import { supabase } from '@/app/lib/supabase';

export class DatabaseCleanupService {
  static async deleteAllProjects(): Promise<void> {
    try {
      console.log('Deleting all projects from database...');
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .neq('project_id', ''); // This will delete all rows
      
      if (error) {
        console.error('Error deleting projects:', error);
        throw error;
      }
      
      console.log('All projects deleted successfully');
    } catch (error) {
      console.error('Failed to delete projects:', error);
      throw error;
    }
  }

  static async clearProjectsTable(): Promise<void> {
    try {
      // Alternative method using truncate-like approach
      const { data: allProjects, error: fetchError } = await supabase
        .from('projects')
        .select('project_id');
      
      if (fetchError) {
        console.error('Error fetching projects for deletion:', fetchError);
        return;
      }

      if (allProjects && allProjects.length > 0) {
        const projectIds = allProjects.map(p => p.project_id);
        
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .in('project_id', projectIds);
        
        if (deleteError) {
          console.error('Error deleting projects:', deleteError);
          throw deleteError;
        }
        
        console.log(`Deleted ${projectIds.length} projects from database`);
      } else {
        console.log('No projects found to delete');
      }
    } catch (error) {
      console.error('Failed to clear projects table:', error);
      throw error;
    }
  }
}