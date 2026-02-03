import { Component, input, output } from '@angular/core';
import { AppShellNotification } from '../../models/appshell-notification';
import { AppShellIconComponent } from "../appshell-icon/appshell-icon.component";

@Component({
    selector: 'appshell-toast',
    imports: [AppShellIconComponent],
    templateUrl: './appshell-toast.component.html',
    styleUrl: './appshell-toast.component.scss'
})
export class AppShellToastComponent {

  notification = input<AppShellNotification>();
  closed = output<boolean>();

  closeToast() {
    this.closed.emit(true);
  }
}
