import { Component, computed, input, output } from '@angular/core';
import { AppShellPageHeaderComponent } from '../../components/appshell-page-header/appshell-page-header.component';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellNotification } from 'ngx-appshell';
import { DatePipe, SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MarkdownService } from 'ngx-markdown';
import { AppShellIconComponent } from '../../components/appshell-icon/appshell-icon.component';

@Component({
  selector: 'appshell-notifications-screen',
  standalone: true,
  imports: [AppShellPageHeaderComponent, DatePipe, SlicePipe, MatButtonModule, AppShellIconComponent],
  templateUrl: './appshell-notifications-screen.component.html',
  styleUrl: './appshell-notifications-screen.component.scss'
})
export class AppShellNotificationsScreenComponent {
  pageTitle = input.required<string>();
  breadcrumbLinks = input.required<AppShellLink[]>();
  notifications = input.required<AppShellNotification[]>();

  computedNotifications = computed(() => { 
    return this.notifications().map((notification) => {
      notification.expanded = this.expandedNotifications.includes(notification.id);
      if(notification.message) {
        const parsed = this.markdownService.parse(notification.message.replace(/\\n/g, '\n'), { markedOptions: { gfm: true, breaks: false } }) as string;
        notification.message = parsed;
      }
      return notification;
    });
  });

  readNotification = output<AppShellNotification>();
  readAllNotifications = output<void>();
  expandedNotifications: string[] = [];

  constructor(private readonly markdownService: MarkdownService) {}

  getIcon(notification: AppShellNotification): string {
    if (notification.type === 'success') {
      return 'check_circle';
    }
    if (notification.type === 'error') {
      return 'x_circle';
    }
    // Default to info  
    return 'info';
  }

  getIconClasses(notification: AppShellNotification): string {
    if (notification.type === 'success') {
      return 'notification success';
    }
    if (notification.type === 'error') {
      return 'notification error';
    }
    return 'notification';
  }

  expandNotification(notification: AppShellNotification) {
    const index = this.expandedNotifications.indexOf(notification.id);
    if (index === -1) {
      this.expandedNotifications.push(notification.id);
    } else {
      this.expandedNotifications.splice(index, 1);
    }
  }

  isNotificationExpanded(notification: AppShellNotification): boolean {
    return this.expandedNotifications.includes(notification.id);
  }

  markAsRead(notification: AppShellNotification) {
    this.readNotification.emit(notification);
  }

  markAllAsRead() {
    this.readAllNotifications.emit();
  }
}