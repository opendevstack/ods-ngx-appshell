import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellNotificationsScreenComponent } from './appshell-notifications-screen.component';
import { provideMarkdown } from 'ngx-markdown';

describe('AppShellNotificationsScreenComponent', () => {
  let component: AppShellNotificationsScreenComponent;
  let fixture: ComponentFixture<AppShellNotificationsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellNotificationsScreenComponent],
      providers: [provideMarkdown()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellNotificationsScreenComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pageTitle', '');
    fixture.componentRef.setInput('breadcrumbLinks', []);
    fixture.componentRef.setInput('notifications', []);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computedNotifications should return notifications with expanded property set to true if id is in expandedNotifications', () => {
    const notifications = [
      { id: 'n1', type: 'info', message: 'Test 1' },
      { id: 'n2', type: 'success', message: 'Test 2' }
    ] as any[];
    fixture.componentRef.setInput('notifications', notifications);
    component.expandedNotifications = ['n1'];
    fixture.detectChanges();

    const computed = component.computedNotifications();
    expect(computed.length).toBe(2);
    expect(computed[0].expanded).toBeTrue();
    expect(computed[1].expanded).toBeFalse();
  });

  it('should return "notification success" for success type in getIconClasses', () => {
    const notification = { type: 'success' } as any;
    const result = component.getIconClasses(notification);
    expect(result).toBe('notification success');
  });

  it('should return "notification error" for error type in getIconClasses', () => {
    const notification = { type: 'error' } as any;
    const result = component.getIconClasses(notification);
    expect(result).toBe('notification error');
  });

  it('should return "notification" for other types in getIconClasses', () => {
    const notification = { type: 'info' } as any;
    const result = component.getIconClasses(notification);
    expect(result).toBe('notification');
  });

  it('should return "check_circle" for success type in getIcon', () => {
    const notification = { type: 'success' } as any;
    const result = component.getIcon(notification);
    expect(result).toBe('check_circle');
  });

  it('should return "x_circle" for error type in getIcon', () => {
    const notification = { type: 'error' } as any;
    const result = component.getIcon(notification);
    expect(result).toBe('x_circle');
  });

  it('should return "info" for other types in getIcon', () => {
    const notification = { type: 'info' } as any;
    const result = component.getIcon(notification);
    expect(result).toBe('info');
  });

  it('should emit the readNotification event when markAsRead is called', () => {
    spyOn(component.readNotification, 'emit');
    const notification = { id: 1, type: 'info', message: 'Test notification' } as any;
  
    component.markAsRead(notification);
  
    expect(component.readNotification.emit).toHaveBeenCalledWith(notification);
  });
  
  it('should emit the readAllNotifications event when markAllAsRead is called', () => {
    spyOn(component.readAllNotifications, 'emit');
  
    component.markAllAsRead();
  
    expect(component.readAllNotifications.emit).toHaveBeenCalled();
  });

  it('should add notification id to expandedNotifications if not already present', () => {
    const notification = { id: 'notif-1' } as any;
    component.expandedNotifications = [];
    component.expandNotification(notification);
    expect(component.expandedNotifications).toContain('notif-1');
  });

  it('should remove notification id from expandedNotifications if already present', () => {
    const notification = { id: 'notif-2' } as any;
    component.expandedNotifications = ['notif-2'];
    component.expandNotification(notification);
    expect(component.expandedNotifications).not.toContain('notif-2');
  });

  it('should only toggle the specified notification id', () => {
    const notification1 = { id: 'notif-3' } as any;
    const notification2 = { id: 'notif-4' } as any;
    component.expandedNotifications = ['notif-4'];
    component.expandNotification(notification1);
    expect(component.expandedNotifications).toContain('notif-3');
    expect(component.expandedNotifications).toContain('notif-4');
    component.expandNotification(notification2);
    expect(component.expandedNotifications).toContain('notif-3');
    expect(component.expandedNotifications).not.toContain('notif-4');
  });

  it('should return true if notification id is in expandedNotifications', () => {
    const notification = { id: 'notif-10' } as any;
    component.expandedNotifications = ['notif-10', 'notif-11'];
    expect(component.isNotificationExpanded(notification)).toBeTrue();
  });

  it('should return false if notification id is not in expandedNotifications', () => {
    const notification = { id: 'notif-12' } as any;
    component.expandedNotifications = ['notif-13', 'notif-14'];
    expect(component.isNotificationExpanded(notification)).toBeFalse();
  });

  it('should return false if expandedNotifications is empty', () => {
    const notification = { id: 'notif-15' } as any;
    component.expandedNotifications = [];
    expect(component.isNotificationExpanded(notification)).toBeFalse();
  });
});