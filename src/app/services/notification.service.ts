import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'blocked';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private idCounter = 0;

  show(notification: Omit<Notification, 'id'>) {
    const id = `notif-${++this.idCounter}`;
    const notif: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    console.log('Showing notification:', notif);
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notif]);

    // Auto-remove after duration
    if (notif.duration && notif.duration > 0) {
      setTimeout(() => this.remove(id), notif.duration);
    }

    return id;
  }

  success(title: string, message: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration: duration || 6000 });
  }

  warning(title: string, message: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }

  blocked(message: string) {
    return this.show({
      type: 'blocked',
      title: '🚫 Access Denied',
      message,
      duration: 0 // Don't auto-dismiss
    });
  }

  remove(id: string) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clear() {
    this.notificationsSubject.next([]);
  }
}
