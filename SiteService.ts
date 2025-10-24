import { supabase } from '../lib/supabase';
import { Site } from '../types';

export class SiteService {
  static async getUserSites(userId: string): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*');

      if (error) {
        console.error('Error fetching sites:', error);
        throw error;
      }

      return (data || []).map(site => ({
        id: site.id,
        name: site.name || 'Unnamed Site',
        location: site.location || 'No location',
        status: site.status || 'planning',
        description: site.description || '',
        budget: site.budget || 0,
        overall_progress: site.overall_progress || 0,
        start_date: site.start_date,
        end_date: site.end_date,
        created_at: site.created_at,
        updated_at: site.updated_at
      }));
    } catch (error) {
      console.error('Error in getUserSites:', error);
      return [];
    }
  }

  static async createSite(siteData: Partial<Site>): Promise<Site> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .insert({
          name: siteData.name,
          location: siteData.location,
          description: siteData.description,
          budget: siteData.budget,
          status: siteData.status || 'planning',
          overall_progress: 0,
          start_date: siteData.start_date,
          end_date: siteData.end_date
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating site:', error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        location: data.location,
        status: data.status,
        description: data.description,
        budget: data.budget,
        overall_progress: data.overall_progress || 0,
        start_date: data.start_date,
        end_date: data.end_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating site:', error);
      throw error;
    }
  }
}