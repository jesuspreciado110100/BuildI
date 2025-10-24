import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { EmailVerificationService } from '../services/EmailVerificationService';


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
  updateUserRole: (role: string) => Promise<void>;
  switchViewRole: (role: string) => void;
  permanentRole: string | null;
  currentViewRole: string | null;
  isAuthenticated: boolean;
  error: string | null;
  needsProfileCompletion: boolean;
  setNeedsProfileCompletion: (value: boolean) => void;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  skipEmailVerification: () => void;
  hasSkippedVerification: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [permanentRole, setPermanentRole] = useState<string | null>(null);
  const [currentViewRole, setCurrentViewRole] = useState<string | null>(null);
  const [hasSkippedVerification, setHasSkippedVerification] = useState(false);



  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsEmailVerified(!!session.user.email_confirmed_at);
          const { data: profile, error } = await supabase
            .from('users').select('*').eq('id', session.user.id).single();
          
          if (profile && !error) {
            setPermanentRole(profile.role);
            setCurrentViewRole(profile.role);
            setUser({
              id: profile.id, email: profile.email, name: profile.name,
              role: profile.role, phone: profile.phone || '',
              onboarding_completed: profile.onboarding_completed || false,
              created_at: profile.created_at
            });
          } else {
            setPermanentRole('contractor');
            setCurrentViewRole('contractor');
            setUser({
              id: session.user.id, email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: 'contractor', phone: '', onboarding_completed: false,
              created_at: session.user.created_at
            });
          }
        }
      } catch (error) {
        console.log('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsEmailVerified(!!session.user.email_confirmed_at);
        try {
          const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (profile) {
            setPermanentRole(profile.role);
            setCurrentViewRole(profile.role);
            setUser({
              id: profile.id, email: profile.email, name: profile.name,
              role: profile.role, phone: profile.phone || '',
              onboarding_completed: profile.onboarding_completed || false,
              created_at: profile.created_at
            });
          }
        } catch (error) {
          console.log('Profile fetch failed:', error);
        }
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);


  const resendVerificationEmail = async () => {
    if (!user?.email) throw new Error('No email found');
    try {
      await EmailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
        user.name
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email.');
    }
  };


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        if (profile) {
          setPermanentRole(profile.role);
          setCurrentViewRole(profile.role);
          setUser({
            id: profile.id, email: profile.email, name: profile.name,
            role: profile.role, phone: profile.phone || '',
            onboarding_completed: profile.onboarding_completed || false,
            created_at: profile.created_at
          });
          console.log('User logged in successfully:', profile.email, 'Role:', profile.role);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signup = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!data || !data.user) throw new Error('Signup failed');
      
      await supabase.from('users').insert([{
        id: data.user.id, email: data.user.email,
        name: userData.name || 'New User', role: userData.role || 'contractor',
        phone: userData.phone || '', onboarding_completed: false,
        created_at: new Date().toISOString()
      }]);

      // Send verification email automatically
      try {
        await EmailVerificationService.sendVerificationEmail(
          data.user.id,
          data.user.email || email,
          userData.name || 'New User'
        );
      } catch (emailError) {
        console.log('Verification email failed:', emailError);
      }

      setPermanentRole(userData.role || 'contractor');
      setCurrentViewRole(userData.role || 'contractor');
      setUser({
        id: data.user.id, email: data.user.email || email,
        name: userData.name || 'New User', role: userData.role || 'contractor',
        phone: userData.phone || '', onboarding_completed: false
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setPermanentRole(null);
      setCurrentViewRole(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  const updateUserRole = async (role: string) => {
    if (!user) {
      setPermanentRole(role);
      setCurrentViewRole(role);
      setUser({
        id: 'guest-' + Date.now(), email: 'guest@example.com',
        name: 'Guest User', role: role, phone: '', onboarding_completed: false
      });
      return;
    }
    try {
      await supabase.from('users').update({ role }).eq('id', user.id);
      setPermanentRole(role);
      setCurrentViewRole(role);
      setUser({ ...user, role });
    } catch (error) {
      setUser({ ...user, role });
    }
  };

  const switchViewRole = (role: string) => {
    setCurrentViewRole(role);
    if (user) setUser({ ...user, role });
  };

  const skipEmailVerification = () => {
    setHasSkippedVerification(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, isLoading, updateUser, updateUserRole,
      switchViewRole, permanentRole, currentViewRole,
      isAuthenticated: !!user, error, needsProfileCompletion,
      setNeedsProfileCompletion, isEmailVerified, resendVerificationEmail,
      skipEmailVerification, hasSkippedVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
