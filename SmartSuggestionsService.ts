interface SmartSuggestion {
  id: string;
  type: 'equipment' | 'material' | 'concept' | 'labor' | 'booking';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionType: 'book' | 'order' | 'start' | 'invite' | 'view';
  actionData?: any;
  context: string;
  dismissedAt?: Date;
}

interface UserAction {
  type: string;
  data: any;
  timestamp: Date;
}

interface ProjectProgress {
  conceptId: string;
  progress: number;
  phase: string;
}

class SmartSuggestionsService {
  private dismissedSuggestions: Set<string> = new Set();
  private userActions: UserAction[] = [];
  private projectProgress: ProjectProgress[] = [];

  // Track user actions for contextual suggestions
  trackAction(type: string, data: any) {
    this.userActions.push({
      type,
      data,
      timestamp: new Date()
    });
    
    // Keep only last 50 actions
    if (this.userActions.length > 50) {
      this.userActions = this.userActions.slice(-50);
    }
  }

  // Update project progress
  updateProgress(conceptId: string, progress: number, phase: string) {
    const existing = this.projectProgress.find(p => p.conceptId === conceptId);
    if (existing) {
      existing.progress = progress;
      existing.phase = phase;
    } else {
      this.projectProgress.push({ conceptId, progress, phase });
    }
  }

  // Get suggestions for contractor dashboard
  getContractorSuggestions(userId: string, siteId: string): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // Recent action-based suggestions
    const recentActions = this.userActions.slice(-10);
    
    // If booked concrete, suggest mixer
    const concreteBooking = recentActions.find(a => 
      a.type === 'material_order' && a.data.material?.includes('concrete')
    );
    if (concreteBooking && !this.isDismissed('concrete-mixer-suggestion')) {
      suggestions.push({
        id: 'concrete-mixer-suggestion',
        type: 'equipment',
        title: 'Book Concrete Mixer',
        description: 'You ordered concrete - need a mixer for efficient pouring?',
        priority: 'high',
        actionType: 'book',
        actionData: { equipmentType: 'concrete_mixer' },
        context: 'recent_concrete_order'
      });
    }

    // Progress-based suggestions
    const foundationProgress = this.projectProgress.find(p => 
      p.phase === 'foundations' && p.progress >= 80
    );
    if (foundationProgress && !this.isDismissed('rebar-suggestion')) {
      suggestions.push({
        id: 'rebar-suggestion',
        type: 'concept',
        title: 'Start Steel Reinforcement',
        description: 'Foundations are 80% complete - time to begin rebar work?',
        priority: 'high',
        actionType: 'start',
        actionData: { conceptType: 'steel_reinforcement' },
        context: 'foundation_progress'
      });
    }

    // General equipment suggestion
    if (!this.isDismissed('equipment-suggestion')) {
      suggestions.push({
        id: 'equipment-suggestion',
        type: 'equipment',
        title: 'Book Equipment for Next Trade',
        description: 'Stay ahead of schedule - book equipment for upcoming phases',
        priority: 'medium',
        actionType: 'book',
        actionData: { category: 'upcoming_trades' },
        context: 'proactive_planning'
      });
    }

    return suggestions.filter(s => !this.isDismissed(s.id));
  }

  // Get suggestions for concept details
  getConceptSuggestions(conceptId: string, progress: number, phase: string): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    if (progress >= 70 && !this.isDismissed(`next-concept-${conceptId}`)) {
      suggestions.push({
        id: `next-concept-${conceptId}`,
        type: 'concept',
        title: 'Next Phase Ready',
        description: `You're ${progress}% done — next concept: Steel Reinforcement?`,
        priority: 'high',
        actionType: 'start',
        actionData: { nextConcept: 'steel_reinforcement' },
        context: 'concept_progress'
      });
    }

    return suggestions.filter(s => !this.isDismissed(s.id));
  }

  // Dismiss a suggestion
  dismissSuggestion(suggestionId: string) {
    this.dismissedSuggestions.add(suggestionId);
  }

  // Check if suggestion is dismissed
  private isDismissed(suggestionId: string): boolean {
    return this.dismissedSuggestions.has(suggestionId);
  }

  // Clear dismissed suggestions (for testing)
  clearDismissed() {
    this.dismissedSuggestions.clear();
  }
}

export const smartSuggestionsService = new SmartSuggestionsService();
export type { SmartSuggestion };