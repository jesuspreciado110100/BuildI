import { supabase } from '@/app/lib/supabase';

export interface Project {
  project_id: string;
  name: string;
  description: string;
  status: string;
  construction_type: string;
  budget?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  builder_id?: string;
  progress?: number;
  created_at: string;
  updated_at?: string;
  image?: string;
  image_url?: string;
}

export interface LocationFilter {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export class ProjectService {
  static async getProjects(constructionType?: string): Promise<Project[]> {
    try {
      let query = supabase.from('projects').select('*');
      
      if (constructionType && constructionType !== 'all') {
        query = query.eq('construction_type', constructionType);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  static async getProjectsByIds(projectIds: string[]): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects by IDs:', error);
      return [];
    }
  }

  static async getNearbyProjects(
    location: LocationFilter,
    constructionType?: string
  ): Promise<Project[]> {
    try {
      const radiusKm = location.radiusKm || 50;
      let query = supabase.from('projects').select('*');
      
      if (constructionType && constructionType !== 'all') {
        query = query.eq('construction_type', constructionType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const nearbyProjects = (data || []).filter((project) => {
        if (!project.latitude || !project.longitude) return false;
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          Number(project.latitude),
          Number(project.longitude)
        );
        return distance <= radiusKm;
      });
      
      return nearbyProjects.sort((a, b) => {
        const distA = this.calculateDistance(
          location.latitude,
          location.longitude,
          Number(a.latitude!),
          Number(a.longitude!)
        );
        const distB = this.calculateDistance(
          location.latitude,
          location.longitude,
          Number(b.latitude!),
          Number(b.longitude!)
        );
        return distA - distB;
      });
    } catch (error) {
      console.error('Error fetching nearby projects:', error);
      return [];
    }
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static async addProject(project: any): Promise<void> {
    try {
      const newProject = {
        name: project.title,
        description: project.description,
        location: project.location,
        latitude: project.latitude || null,
        longitude: project.longitude || null,
        budget: project.budget,
        construction_type: project.construction_type,
        status: project.status || 'pending',
        progress: project.progress || 0,
        client_id: project.client_id || null,
        builder_id: project.builder_id || null,
        image_url: project.image_url || null,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();

      if (error) throw error;
      console.log('Project added successfully:', data);
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('project_id', projectId)
        .select();

      if (error) throw error;
      console.log('Project updated successfully:', data);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
}
