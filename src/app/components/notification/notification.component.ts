import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notification-container">
      <div *ngFor="let notif of notifications" 
           class="notification" 
           [class]="'notif-' + notif.type">
        <div class="notif-icon">
          <i [class]="getIcon(notif.type)"></i>
        </div>
        <div class="notif-content">
          <div class="notif-title">{{ notif.title }}</div>
          <div class="notif-message">{{ notif.message }}</div>
        </div>
        <button class="notif-close" (click)="close(notif.id)">
          <i class="ti ti-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 420px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      margin-bottom: 10px;
      border-radius: 8px;
      background: white;
      border-left: 4px solid #14b8a6;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
      animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: all;
      align-items: flex-start;

      &.notif-success {
        border-left-color: #16a34a;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      }

      &.notif-error {
        border-left-color: #dc2626;
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      }

      &.notif-warning {
        border-left-color: #f59e0b;
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      }

      &.notif-info {
        border-left-color: #3b82f6;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      }

      &.notif-blocked {
        border-left-color: #ef4444;
        background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
        padding: 16px;
        border-left-width: 5px;
      }
    }

    .notif-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      flex-shrink: 0;
      font-size: 18px;

      .notification.notif-success & {
        background: rgba(22, 163, 74, 0.15);
        color: #16a34a;
      }

      .notification.notif-error & {
        background: rgba(220, 38, 38, 0.15);
        color: #dc2626;
      }

      .notification.notif-warning & {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .notification.notif-info & {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }

      .notification.notif-blocked & {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        font-size: 24px;
      }
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 4px;

      .notification.notif-success & {
        color: #15803d;
      }

      .notification.notif-error & {
        color: #991b1b;
      }

      .notification.notif-warning & {
        color: #92400e;
      }

      .notification.notif-info & {
        color: #1e40af;
      }

      .notification.notif-blocked & {
        color: #7f1d1d;
        font-size: 1rem;
      }
    }

    .notif-message {
      font-size: 0.85rem;
      line-height: 1.4;

      .notification.notif-success & {
        color: #166534;
      }

      .notification.notif-error & {
        color: #7f1d1d;
      }

      .notification.notif-warning & {
        color: #78350f;
      }

      .notification.notif-info & {
        color: #1e3a8a;
      }

      .notification.notif-blocked & {
        color: #7f1d1d;
      }
    }

    .notif-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 4px;
      flex-shrink: 0;
      transition: all 0.2s;

      i {
        font-size: 16px;
      }

      &:hover {
        background: rgba(15, 23, 42, 0.08);
        color: #475569;
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('NotificationComponent initialized');
    this.notificationService.notifications$.subscribe(notifs => {
      console.log('Notifications updated:', notifs);
      this.notifications = notifs;
      this.cdr.markForCheck();
    });
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'ti ti-check-circle',
      error: 'ti ti-alert-circle',
      warning: 'ti ti-alert-triangle',
      info: 'ti ti-info-circle',
      blocked: 'ti ti-shield-off'
    };
    return icons[type] || 'ti ti-bell';
  }

  close(id: string) {
    this.notificationService.remove(id);
  }
}
