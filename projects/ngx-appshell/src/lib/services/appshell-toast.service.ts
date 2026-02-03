import { Injectable } from '@angular/core';
import { AppShellNotification, AppShellToast } from 'ngx-appshell';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppShellToastService {
  toastsSubject = new BehaviorSubject<AppShellToast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private currentId = 0;

  showToast(notification: AppShellNotification, duration?: number, closeFn?: () => void) {
    if (closeFn) {
      const originalCloseFn = closeFn;
      closeFn = () => {
        originalCloseFn();
        this.removeToast(this.currentId);
      };
    } else {
      closeFn = () => this.removeToast(this.currentId);
    }

    const toast: AppShellToast = { id: this.currentId++, notification, closeFn: () => closeFn() };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    
    if(duration) {
      setTimeout(() => this.removeToast(toast.id), duration);
    }
  }

  removeToast(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(toast => toast.id !== id));
  }
}
