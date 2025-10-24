import { supabase } from '@/app/lib/supabase';

export interface MachineryItem {
  id: string;
  name: string;
  description?: string;
  model?: string;
  capacity?: string;
  rate?: number;
  daily_rate?: number;
  hourly_rate?: number;
  type?: string;
  machinery_type_id?: string;
  category?: string;
  location?: string;
  availability_status: 'available' | 'rented' | 'maintenance';
  owner_id?: string;
  image_url?: string;
  specifications?: any;
  created_at?: string;
  updated_at?: string;
  eta?: string;
}

export interface MachineryType {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
}

export class MachinerySupabaseService {
  // Get all machinery types
  static async getMachineryTypes() {
    try {
      const { data, error } = await supabase
        .from('machinery_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching machinery types:', error);
      return [];
    }
  }

  // Get machinery by type ID with pagination
  static async getMachineryByTypeId(
    machineryTypeId: string, 
    page: number = 0, 
    pageSize: number = 10,
    filters?: {
      model?: string;
      attachment?: string;
      maxPrice?: number;
      unitRate?: 'hourly' | 'daily' | 'weekly' | 'monthly';
      bucketCapacity?: string;
      screedWidth?: string;
      millingWidth?: string;
      pullDownCapacity?: string;
    }
  ) {
    try {
      const start = page * pageSize;
      let query = supabase
        .from('machinery')
        .select('machinery_id, name, model, rate, daily_rate, hourly_rate, weekly_rate, monthly_rate, availability, specifications, machinery_types!machinery_machinery_type_id_fkey(name)', { count: 'exact' })
        .eq('machinery_type_id', machineryTypeId)
        .eq('availability', true)
        .range(start, start + pageSize - 1);

      // Apply filters
      if (filters?.model) {
        query = query.eq('model', filters.model);
      }
      
      if (filters?.attachment) {
        query = query.contains('specifications', { attachment: filters.attachment });
      }
      
      // Filter by appropriate rate column based on unitRate
      if (filters?.maxPrice) {
        if (filters?.unitRate === 'hourly') {
          query = query.lte('hourly_rate', filters.maxPrice);
        } else if (filters?.unitRate === 'weekly') {
          query = query.lte('weekly_rate', filters.maxPrice);
        } else if (filters?.unitRate === 'monthly') {
          query = query.lte('monthly_rate', filters.maxPrice);
        } else {
          // Default to daily_rate
          query = query.lte('daily_rate', filters.maxPrice);
        }
      }

      // Specification filters (JSONB contains queries)
      if (filters?.bucketCapacity) {
        query = query.contains('specifications', { bucket_capacity: filters.bucketCapacity });
      }
      
      if (filters?.screedWidth) {
        query = query.contains('specifications', { screed_width: filters.screedWidth });
      }
      
      if (filters?.millingWidth) {
        query = query.contains('specifications', { milling_width: filters.millingWidth });
      }
      
      if (filters?.pullDownCapacity) {
        query = query.contains('specifications', { pull_down_capacity: filters.pullDownCapacity });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Machinery fetch error:', error);
        throw new Error(`Machinery fetch error: ${error.message}`);
      }
      
      console.log(`Found ${data?.length || 0} machinery items for type ${machineryTypeId}`);
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching machinery by type ID:', error);
      throw error;
    }
  }





  // Get machinery by ID
  // Get machinery by ID
  static async getMachineryById(machineryId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery')
        .select(`
          *,
          machinery_types (
            machinery_type_id,
            name,
            slug
          ),
          profiles:owner_id (
            user_id,
            full_name,
            avatar_url,
            company_name
          )
        `)
        .eq('machinery_id', machineryId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching machinery by ID:', error);
      return null;
    }
  }


  // Get all machinery with pagination
  static async getMachinery(page: number = 0, pageSize: number = 10) {
    try {
      const { data, error, count } = await supabase
        .from('machinery')
        .select('*', { count: 'exact' })
        .eq('availability_status', 'available')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching machinery:', error);
      return { data: [], count: 0 };
    }
  }

  // Subscribe to real-time machinery updates
  static subscribeMachinery(callback: (data: MachineryItem[]) => void) {
    const subscription = supabase
      .channel('machinery_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'machinery' },
        async () => {
          const result = await this.getMachinery();
          callback(result.data);
        }
      )
      .subscribe();

    return subscription;
  }

  // Search machinery
  static async searchMachinery(query: string, page: number = 0, pageSize: number = 10) {
    try {
      const { data, error, count } = await supabase
        .from('machinery')
        .select('*', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .eq('availability_status', 'available')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error searching machinery:', error);
      return { data: [], count: 0 };
    }
  }

  // Get default rate from machinery.rate table
  static async getDefaultRate(machineryTypeId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery')
        .select('rate')
        .eq('machinery_type_id', machineryTypeId)
        .eq('availability', true)
        .order('rate', { ascending: true })
        .limit(1)
        .single();

      if (error) throw new Error(`Default rate error: ${error.message}`);
      return data?.rate || 0;
    } catch (error) {
      console.error('Error fetching default rate:', error);
      return 100;
    }
  }

  // Get featured machinery
  static async getFeaturedMachinery() {
    try {
      const { data, error } = await supabase
        .from('machinery')
        .select('machinery_id, name, model, rate, specifications, is_featured, machinery_types!machinery_machinery_type_id_fkey(name)')
        .eq('is_featured', true)
        .eq('availability', true);

      if (error) throw new Error(`Featured machinery error: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching featured machinery:', error);
      return [];
    }
  }


  // Upload machinery photos
  static async uploadMachineryPhotos(
    machineryId: string,
    photos: { uri: string; displayOrder: number; caption?: string }[]
  ) {
    try {
      const uploadedPhotos = [];
      for (const photo of photos) {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const fileName = `${machineryId}_${Date.now()}_${photo.displayOrder}.jpg`;
        const filePath = `${machineryId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('machinery-photos')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('machinery-photos')
          .getPublicUrl(filePath);

        const { data, error } = await supabase
          .from('machinery_photos')
          .insert({
            machinery_id: machineryId,
            photo_url: publicUrl,
            display_order: photo.displayOrder,
            caption: photo.caption,
          })
          .select()
          .single();

        if (error) throw error;
        uploadedPhotos.push(data);
      }
      return uploadedPhotos;
    } catch (error) {
      console.error('Error uploading machinery photos:', error);
      throw error;
    }
  }

  // Get machinery photos
  static async getMachineryPhotos(machineryId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery_photos')
        .select('*')
        .eq('machinery_id', machineryId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching machinery photos:', error);
      return [];
    }
  }

  // Update machinery main image
  static async updateMachineryMainImage(machineryId: string, imageUrl: string) {
    try {
      const { error } = await supabase
        .from('machinery')
        .update({ image_url: imageUrl })
        .eq('machinery_id', machineryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating machinery main image:', error);
      return false;
    }
  }

  // Delete machinery photo
  static async deleteMachineryPhoto(photoId: string) {
    try {
      const { error } = await supabase
        .from('machinery_photos')
        .delete()
        .eq('photo_id', photoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting machinery photo:', error);
      return false;
    }
  }

  // Update photo display order
  static async updatePhotoDisplayOrder(photoId: string, displayOrder: number) {
    try {
      const { error } = await supabase
        .from('machinery_photos')
        .update({ display_order: displayOrder })
        .eq('photo_id', photoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating photo display order:', error);
      return false;
    }
  }

  // Get machinery by owner ID
  // Get machinery by owner ID
  static async getMachineryByOwnerId(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery')
        .select(`
          *,
          machinery_types (
            machinery_type_id,
            name,
            slug
          )
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching machinery by owner ID:', error);
      return [];
    }
  }


  // Validate machinery data
  static validateMachineryData(data: Partial<MachineryItem>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Machinery name is required');
    }

    if (!data.machinery_type_id) {
      errors.push('Machinery type is required');
    }

    if (!data.model || data.model.trim().length === 0) {
      errors.push('Model is required');
    }

    if (data.daily_rate && data.daily_rate < 0) {
      errors.push('Daily rate must be a positive number');
    }

    if (data.hourly_rate && data.hourly_rate < 0) {
      errors.push('Hourly rate must be a positive number');
    }

    if (!data.location || data.location.trim().length === 0) {
      errors.push('Location is required');
    }

    return { valid: errors.length === 0, errors };
  }

  // Create new machinery entry
  static async createMachinery(machineryData: Partial<MachineryItem>) {
    try {
      // Validate data
      const validation = this.validateMachineryData(machineryData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const { data, error } = await supabase
        .from('machinery')
        .insert({
          name: machineryData.name,
          description: machineryData.description,
          model: machineryData.model,
          capacity: machineryData.capacity,
          machinery_type_id: machineryData.machinery_type_id,
          location: machineryData.location,
          daily_rate: machineryData.daily_rate,
          hourly_rate: machineryData.hourly_rate,
          availability_status: machineryData.availability_status || 'available',
          owner_id: machineryData.owner_id,
          image_url: machineryData.image_url,
          specifications: machineryData.specifications,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating machinery:', error);
      return { success: false, error: error.message };
    }
  }
  // Update machinery entry
  static async updateMachinery(machineryId: string, updates: Partial<MachineryItem>) {
    try {
      // Validate data if key fields are being updated
      if (updates.name || updates.machinery_type_id || updates.model) {
        const validation = this.validateMachineryData(updates);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      const { data, error } = await supabase
        .from('machinery')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('machinery_id', machineryId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating machinery:', error);
      return { success: false, error: error.message };
    }
  }


  // Delete machinery entry
  static async deleteMachinery(machineryId: string) {
    try {
      // First, delete all associated photos
      const photos = await this.getMachineryPhotos(machineryId);
      for (const photo of photos) {
        await this.deleteMachineryPhoto(photo.photo_id);
      }

      // Delete the machinery entry
      const { error } = await supabase
        .from('machinery')
        .delete()
        .eq('machinery_id', machineryId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting machinery:', error);
      return { success: false, error: error.message };
    }
  }


  // Upload single photo and return URL
  static async uploadSinglePhoto(machineryId: string, photoUri: string): Promise<string | null> {
    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const fileName = `${machineryId}_${Date.now()}.jpg`;
      const filePath = `${machineryId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('machinery-photos')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('machinery-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading single photo:', error);
      return null;
    }
  }
}



