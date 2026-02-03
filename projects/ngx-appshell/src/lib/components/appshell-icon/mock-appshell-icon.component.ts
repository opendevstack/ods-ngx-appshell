import { Component, input, output } from '@angular/core';

@Component({
  selector: 'appshell-icon',
  standalone: true,
  template: 'MOCK',
})
export class MockAppShellIconComponent {

  icon = input.required<string>();

}
