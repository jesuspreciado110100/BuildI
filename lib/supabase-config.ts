// Supabase Configuration for FamousAI Construction Platform
// This file contains the configuration and helper functions for Supabase integration

import { supabase } from './supabase';

// Database table names
export const TABLES = {
  USERS: 'users',
  SITES: 'sites',
  WORKERS: 'workers',
  MACHINERY: 'machinery',
  MATERIALS: 'materials',
  LABOR_REQUESTS: 'labor_requests',
  MATERIAL_ORDERS: 'material_orders'
} as const;

// User roles
export const USER_ROLES = {
  CONTRACTOR: 'contractor',
  WORKER: 'worker',
  SUPPLIER: 'supplier',
  ADMIN: 'admin'
} as const;

// Site status options
export const SITE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const;

// Helper function to check if Supabase is connected
export const checkSupabaseConnection = async () => {
  try {
    // Use a simple query that doesn't depend on specific tables
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
    if (error) {
      console.log('Supabase connection check - using mock data mode');
      return false;
    }
    return true;
  } catch (error) {
    console.log('Supabase connection failed - using mock data mode');
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.log('Auth check failed - using mock user');
    return null;
  }
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    return !error;
  } catch (error) {
    console.log('Sign out failed - mock mode');
    return true;
  }
};

export default supabase;