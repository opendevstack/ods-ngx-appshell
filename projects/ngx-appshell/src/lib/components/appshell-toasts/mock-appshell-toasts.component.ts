import { Component, input } from '@angular/core';

@Component({
  selector: 'appshell-toasts',
  standalone: true,
  template: 'MOCK',
})
export class MockAppShellToastsComponent {
  toastsLimit = input<number>(3);
}
