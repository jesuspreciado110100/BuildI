import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  company?: string;
  location?: string;
  bio?: string;
  role: string;
  avatar_url?: string;
}

export interface UserStats {
  projects_completed: number;
  rating: number;
  total_earnings: number;
  years_experience: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  specialty?: string;
  status: string;
}

export interface WorkConcept {
  item_code: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price_mxn: number;
  total_price_mxn: number;
  category: string;
  status: string;
}

export class UserService {
  // Mock Alfonso Preciado's data
  private static alfonsoData = {
    profile: {
      id: '1',
      full_name: 'Alfonso Preciado',
      phone: '+52 662 123 4567',
      company: 'Constructora Preciado',
      location: 'Magdalena de Kino, Sonora, México',
      bio: 'Constructor especializado en obras civiles y edificación con más de 15 años de experiencia.',
      role: 'contractor',
      avatar_url: null
    },
    statistics: {
      projects_completed: 23,
      rating: 4.8,
      total_earnings: 2450000,
      years_experience: 15
    },
    teamMembers: [
      {
        id: '1',
        name: 'Martin Albelais',
        role: 'Supervisor de Obra',
        phone: '+52 662 234 5678',
        specialty: 'Estructuras',
        status: 'active'
      },
      {
        id: '2',
        name: 'Felipe Miranda',
        role: 'Maestro de Obra',
        phone: '+52 662 345 6789',
        specialty: 'Albañilería',
        status: 'active'
      }
    ],
    workConcepts: [
      {
        item_code: 'PRE-001',
        description: 'Trazo y nivelación del terreno por medios manuales y con equipo topográfico',
        unit: 'M2',
        quantity: 1300.00,
        unit_price_mxn: 13.13,
        total_price_mxn: 17069.00,
        category: 'Preliminares',
        status: 'completed'
      },
      {
        item_code: 'CIM-001',
        description: 'Excavación por medios mecánicos en material tipo B',
        unit: 'M3',
        quantity: 816.00,
        unit_price_mxn: 94.08,
        total_price_mxn: 76769.28,
        category: 'Cimentación',
        status: 'in_progress'
      },
      {
        item_code: 'ALB-001',
        description: 'Suministro y fabricación de muros y pretiles a base de ladrillo listón',
        unit: 'M2',
        quantity: 1375.32,
        unit_price_mxn: 799.65,
        total_price_mxn: 1099774.64,
        category: 'Albañilería',
        status: 'pending'
      }
    ]
  };

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      return this.alfonsoData.profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      // Mock update - in real app would update database
      Object.assign(this.alfonsoData.profile, updates);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      return this.alfonsoData.statistics;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  static async getTeamMembers(userId: string): Promise<TeamMember[]> {
    try {
      return this.alfonsoData.teamMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async getWorkConcepts(siteId: string): Promise<WorkConcept[]> {
    try {
      return this.alfonsoData.workConcepts;
    } catch (error) {
      console.error('Error fetching work concepts:', error);
      return [];
    }
  }
}