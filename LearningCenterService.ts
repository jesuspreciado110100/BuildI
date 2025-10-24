import { LearningModule, OnboardingStep, LearningProgress, FAQ, HelpTicket } from '../types/Learning';

class LearningCenterService {
  private modules: LearningModule[] = [
    {
      id: '1',
      title: 'Getting Started as a Contractor',
      role: 'contractor',
      content_type: 'video',
      completed: false,
      order: 1,
      description: 'Learn the basics of using the platform',
      content: 'Welcome to the contractor platform...',
      video_url: 'https://example.com/contractor-intro.mp4',
      duration_minutes: 5,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Managing Your Projects',
      role: 'contractor',
      content_type: 'tip',
      completed: false,
      order: 2,
      description: 'Best practices for project management',
      content: 'Use the dashboard to track all your active projects...',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Labor Chief Basics',
      role: 'labor_chief',
      content_type: 'video',
      completed: false,
      order: 1,
      description: 'Introduction to labor management',
      content: 'As a labor chief, you coordinate teams...',
      video_url: 'https://example.com/labor-chief-intro.mp4',
      duration_minutes: 7,
      created_at: new Date().toISOString()
    }
  ];

  private onboardingSteps: OnboardingStep[] = [
    {
      id: '1',
      title: 'Welcome to Your Dashboard',
      role: 'contractor',
      content_type: 'walkthrough',
      completed: false,
      order: 1,
      description: 'Overview of your main dashboard',
      content: 'This is your main control center...',
      target_element: '.dashboard-overview',
      action_required: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Navigate Your Tabs',
      role: 'contractor',
      content_type: 'walkthrough',
      completed: false,
      order: 2,
      description: 'Learn about each tab function',
      content: 'Each tab provides different functionality...',
      target_element: '.tab-navigation',
      action_required: true,
      created_at: new Date().toISOString()
    }
  ];

  private faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a new project?',
      answer: 'Click the "New Project" button in your dashboard...',
      category: 'Projects',
      role: 'contractor',
      tags: ['project', 'creation', 'basics'],
      helpful_count: 15,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      question: 'How do I assign workers to a task?',
      answer: 'Go to the Labor tab and click "Assign Workers"...',
      category: 'Labor Management',
      role: 'labor_chief',
      tags: ['workers', 'assignment', 'labor'],
      helpful_count: 23,
      created_at: new Date().toISOString()
    }
  ];

  async getModulesForRole(role: string): Promise<LearningModule[]> {
    return this.modules.filter(module => module.role === role);
  }

  async markStepComplete(step_id: string): Promise<void> {
    const module = this.modules.find(m => m.id === step_id);
    if (module) {
      module.completed = true;
    }
    const step = this.onboardingSteps.find(s => s.id === step_id);
    if (step) {
      step.completed = true;
    }
  }

  async getProgress(role: string, user_id: string): Promise<LearningProgress> {
    const roleModules = this.modules.filter(m => m.role === role);
    const roleSteps = this.onboardingSteps.filter(s => s.role === role);
    const completedModules = roleModules.filter(m => m.completed);
    const completedSteps = roleSteps.filter(s => s.completed);
    
    const totalItems = roleModules.length + roleSteps.length;
    const completedItems = completedModules.length + completedSteps.length;
    
    return {
      user_id,
      role,
      completed_modules: completedModules.map(m => m.id),
      completed_steps: completedSteps.map(s => s.id),
      total_modules: roleModules.length,
      total_steps: roleSteps.length,
      progress_percent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      last_updated: new Date().toISOString(),
      onboarding_completed: completedSteps.length === roleSteps.length
    };
  }

  async getOnboardingSteps(role: string): Promise<OnboardingStep[]> {
    return this.onboardingSteps.filter(step => step.role === role);
  }

  async getFAQs(role?: string, searchTerm?: string): Promise<FAQ[]> {
    let filtered = this.faqs;
    
    if (role) {
      filtered = filtered.filter(faq => !faq.role || faq.role === role);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }

  async createHelpTicket(ticket: Omit<HelpTicket, 'id' | 'created_at'>): Promise<HelpTicket> {
    const newTicket: HelpTicket = {
      ...ticket,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    return newTicket;
  }
}

export const learningCenterService = new LearningCenterService();