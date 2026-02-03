import { TestBed } from "@angular/core/testing";
import { AppShellToastService } from "./appshell-toast.service";
import { fakeAsync, tick } from "@angular/core/testing";
import { AppShellNotification, AppShellToast } from 'ngx-appshell';

describe('AppShellToastService', () => {
  let service: AppShellToastService;

  beforeEach(() => {        
    TestBed.configureTestingModule({
      providers: [ AppShellToastService ]
    });

    service = TestBed.inject(AppShellToastService);
  });
  
  it('should be created', () => {
      expect(service).toBeTruthy();
  });
    
  it('should add a toast and remove it after the specified duration', fakeAsync(() => {
    const notification: AppShellNotification = { id: '1', subject: 'sub', title: 'Test', message: 'Test message', read: false };
    service.showToast(notification, 3000);

    expect(service.toastsSubject.value.length).toBe(1);
    expect(service.toastsSubject.value[0].notification).toEqual(notification);

    tick(3000);
    expect(service.toastsSubject.value.length).toBe(0);
  }));

  it('should remove a toast when closeFn is called', fakeAsync(() => {
    const notification: AppShellNotification = { id: '1', subject: 'sub', title: 'Test', message: 'Test message', read: false };
    const closeFn = jasmine.createSpy('closeFn');
    closeFn.and.callFake(() => {service.removeToast(0);});
    service.showToast(notification, undefined, closeFn);

    expect(service.toastsSubject.value.length).toBe(1);
    service.toastsSubject.value[0].closeFn();
    tick();
    expect(service.toastsSubject.value.length).toBe(0);
    expect(closeFn).toHaveBeenCalled();
  }));

  it('should remove a toast when closeFn is called using default method and after a timeout', fakeAsync(() => {
    const notification: AppShellNotification = { id: '1', subject: 'sub', title: 'Test', message: 'Test message', read: false };
    service.showToast(notification, 1000);

    expect(service.toastsSubject.value.length).toBe(1);
    service.toastsSubject.value[0].closeFn();
    tick(2000);
    expect(service.toastsSubject.value.length).toBe(0);
  }));

  it('should increment the toast ID for each new toast', () => {
    const notification1: AppShellNotification = { id: '1', subject: 'sub', title: 'Toast 1', message: 'Message 1', read: false };
    const notification2: AppShellNotification = { id: '2', subject: 'sub', title: 'Toast 2', message: 'Message 2', read: false };

    service.showToast(notification1);
    service.showToast(notification2);

    expect(service.toastsSubject.value.length).toBe(2);
    expect(service.toastsSubject.value[0].id).toBe(0);
    expect(service.toastsSubject.value[1].id).toBe(1);
  });

  it('should remove a toast by ID', () => {
    const notification: AppShellNotification = { id: '1', subject: 'sub', title: 'Test', message: 'Test message', read: false };
    service.showToast(notification);

    const toastId = service.toastsSubject.value[0].id;
    service.removeToast(toastId);

    expect(service.toastsSubject.value.length).toBe(0);

  });
});
