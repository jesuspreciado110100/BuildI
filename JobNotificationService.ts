export interface JobNotification {
  id: string;
  job_id: string;
  recipient_id: string;
  recipient_type: 'labor_chief' | 'contractor' | 'worker';
  message: string;
  type: 'new_job' | 'job_update' | 'application_received';
  read: boolean;
  created_at: string;
}

export class JobNotificationService {
  private static notifications: JobNotification[] = [];
  private static listeners: ((notifications: JobNotification[]) => void)[] = [];

  static addListener(callback: (notifications: JobNotification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
  }

  static removeListener(callback: (notifications: JobNotification[]) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  static sendJobPostedNotification(jobId: string, tradeType: string, contactName: string) {
    const notification: JobNotification = {
      id: Date.now().toString(),
      job_id: jobId,
      recipient_id: 'labor_chief_1',
      recipient_type: 'labor_chief',
      message: `New ${tradeType} job posted by ${contactName}`,
      type: 'new_job',
      read: false,
      created_at: new Date().toISOString()
    };

    this.notifications.unshift(notification);
    this.notifyListeners();
  }

  static markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  static getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  static getNotifications(): JobNotification[] {
    return this.notifications;
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}
