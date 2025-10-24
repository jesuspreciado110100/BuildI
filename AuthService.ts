export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  avatar?: string;
  rating: number;
  completedProjects: number;
  notifications: boolean;
  darkMode: boolean;
  language: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  role: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'John Contractor',
        email: credentials.email,
        phone: '+1 (555) 123-4567',
        company: 'ABC Construction',
        role: 'contractor',
        rating: 4.7,
        completedProjects: 45,
        notifications: true,
        darkMode: false,
        language: 'en',
        createdAt: '2023-01-15',
        lastLogin: new Date().toISOString(),
      };

      const token = 'mock-jwt-token-' + Date.now();
      
      this.currentUser = mockUser;
      this.authToken = token;
      
      return { user: mockUser, token };
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        role: data.role,
        rating: 0,
        completedProjects: 0,
        notifications: true,
        darkMode: false,
        language: 'en',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const token = 'mock-jwt-token-' + Date.now();
      
      this.currentUser = newUser;
      this.authToken = token;
      
      return { user: newUser, token };
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.currentUser = null;
      this.authToken = null;
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }
      
      this.currentUser = { ...this.currentUser, ...updates };
      return this.currentUser;
    } catch (error) {
      throw new Error('Profile update failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }
      
      // In real implementation, verify current password
      // and update with new password
    } catch (error) {
      throw new Error('Password change failed');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, send reset email
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return this.authToken !== null && this.currentUser !== null;
  }
}

export default new AuthService();
