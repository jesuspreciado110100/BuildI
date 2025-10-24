import { supabase } from '@/app/lib/supabase';

export class SampleDataService {
  static async insertSampleWorkers() {
    const sampleWorkers = [
      {
        id: '1',
        name: 'John Smith',
        trade: 'Electrician',
        hourly_rate: 45.00,
        rating: 4.8,
        availability: 'available',
        location: 'Downtown',
        skills: ['Wiring', 'Panel Installation', 'Troubleshooting'],
        experience_years: 8
      },
      {
        id: '2',
        name: 'Maria Garcia',
        trade: 'Plumber',
        hourly_rate: 42.00,
        rating: 4.9,
        availability: 'available',
        location: 'Midtown',
        skills: ['Pipe Installation', 'Leak Repair', 'Drain Cleaning'],
        experience_years: 12
      },
      {
        id: '3',
        name: 'David Johnson',
        trade: 'Carpenter',
        hourly_rate: 38.00,
        rating: 4.7,
        availability: 'busy',
        location: 'Uptown',
        skills: ['Framing', 'Finish Work', 'Cabinet Installation'],
        experience_years: 15
      }
    ];

    const { data, error } = await supabase
      .from('workers')
      .insert(sampleWorkers);

    if (error) {
      console.error('Error inserting sample workers:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  static async insertSampleLaborRequests() {
    const sampleRequests = [
      {
        id: '1',
        site_id: 'site-1',
        trade: 'Electrician',
        workers_needed: 2,
        start_date: '2024-01-15',
        end_date: '2024-01-20',
        hourly_rate: 45.00,
        description: 'Install electrical panels and wiring for new office building',
        status: 'open',
        urgency: 'medium',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        site_id: 'site-2',
        trade: 'Plumber',
        workers_needed: 1,
        start_date: '2024-01-18',
        end_date: '2024-01-25',
        hourly_rate: 42.00,
        description: 'Plumbing installation for residential complex',
        status: 'open',
        urgency: 'high',
        created_at: new Date().toISOString()
      }
    ];

    const { data, error } = await supabase
      .from('labor_requests')
      .insert(sampleRequests);

    if (error) {
      console.error('Error inserting sample labor requests:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  static async insertSampleMachinery() {
    const sampleMachinery = [
      {
        id: '1',
        name: 'Caterpillar 320 Excavator',
        type: 'Excavator',
        daily_rate: 450.00,
        availability: 'available',
        location: 'Equipment Yard A',
        specifications: {
          weight: '20 tons',
          reach: '9.5m',
          bucket_capacity: '1.2 cubic meters'
        },
        operator_required: true,
        rating: 4.6
      },
      {
        id: '2',
        name: 'John Deere 544K Wheel Loader',
        type: 'Wheel Loader',
        daily_rate: 380.00,
        availability: 'available',
        location: 'Equipment Yard B',
        specifications: {
          weight: '15 tons',
          bucket_capacity: '3.1 cubic meters',
          lift_capacity: '7.2 tons'
        },
        operator_required: true,
        rating: 4.8
      }
    ];

    const { data, error } = await supabase
      .from('machinery')
      .insert(sampleMachinery);

    if (error) {
      console.error('Error inserting sample machinery:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  static async insertSampleMaterials() {
    const sampleMaterials = [
      {
        id: '1',
        name: 'Portland Cement',
        category: 'Concrete',
        unit: 'bag',
        price_per_unit: 12.50,
        supplier: 'BuildCorp Materials',
        availability: 'in_stock',
        description: '50lb bags of Type I Portland Cement',
        minimum_order: 10
      },
      {
        id: '2',
        name: 'Steel Rebar #4',
        category: 'Steel',
        unit: 'ton',
        price_per_unit: 850.00,
        supplier: 'Metro Steel Supply',
        availability: 'in_stock',
        description: 'Grade 60 steel reinforcement bars',
        minimum_order: 1
      }
    ];

    const { data, error } = await supabase
      .from('materials')
      .insert(sampleMaterials);

    if (error) {
      console.error('Error inserting sample materials:', error);
      return { success: false, error };
    }

    return { success: true, data };
  }

  static async insertAllSampleData() {
    console.log('Inserting sample data...');
    
    const results = await Promise.all([
      this.insertSampleWorkers(),
      this.insertSampleLaborRequests(),
      this.insertSampleMachinery(),
      this.insertSampleMaterials()
    ]);

    const success = results.every(result => result.success);
    
    if (success) {
      console.log('All sample data inserted successfully');
    } else {
      console.error('Some sample data failed to insert:', results);
    }

    return { success, results };
  }
}