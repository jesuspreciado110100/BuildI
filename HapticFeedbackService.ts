export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection'
}

export class HapticFeedbackService {
  static triggerHaptic(type: HapticType = HapticType.LIGHT): void {
    // Mock haptic feedback - in real app would use Expo.Haptics
    console.log(`Haptic feedback: ${type}`);
    
    // Simulate different intensities
    switch (type) {
      case HapticType.LIGHT:
        // Expo.Haptics.impactAsync(Expo.Haptics.ImpactFeedbackStyle.Light);
        break;
      case HapticType.MEDIUM:
        // Expo.Haptics.impactAsync(Expo.Haptics.ImpactFeedbackStyle.Medium);
        break;
      case HapticType.HEAVY:
        // Expo.Haptics.impactAsync(Expo.Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case HapticType.SUCCESS:
        // Expo.Haptics.notificationAsync(Expo.Haptics.NotificationFeedbackType.Success);
        break;
      case HapticType.WARNING:
        // Expo.Haptics.notificationAsync(Expo.Haptics.NotificationFeedbackType.Warning);
        break;
      case HapticType.ERROR:
        // Expo.Haptics.notificationAsync(Expo.Haptics.NotificationFeedbackType.Error);
        break;
      case HapticType.SELECTION:
        // Expo.Haptics.selectionAsync();
        break;
    }
  }

  static onButtonPress(): void {
    this.triggerHaptic(HapticType.LIGHT);
  }

  static onSuccess(): void {
    this.triggerHaptic(HapticType.SUCCESS);
  }

  static onError(): void {
    this.triggerHaptic(HapticType.ERROR);
  }

  static onTabChange(): void {
    this.triggerHaptic(HapticType.SELECTION);
  }

  static onBookingCreated(): void {
    this.triggerHaptic(HapticType.SUCCESS);
  }

  static onMessageSent(): void {
    this.triggerHaptic(HapticType.MEDIUM);
  }
}