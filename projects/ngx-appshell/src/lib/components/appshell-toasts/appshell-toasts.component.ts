import { SlicePipe } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { AppShellToastComponent } from '../appshell-toast/appshell-toast.component'
import { AppShellToastService } from '../../services/appshell-toast.service';
import { AppShellToast } from '../../models/appshell-toast';

@Component({
    selector: 'appshell-toasts',
    imports: [AppShellToastComponent, SlicePipe],
    templateUrl: './appshell-toasts.component.html',
    styleUrl: './appshell-toasts.component.scss'
})
export class AppShellToastsComponent implements OnInit {

  toastsLimit = input<number>(3);

  toasts: AppShellToast[] = [];

  constructor(private readonly toastService: AppShellToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe((toasts: any) => this.toasts = toasts);
  }

  closeToast(id: number) {
    this.toastService.removeToast(id);
  }
}
