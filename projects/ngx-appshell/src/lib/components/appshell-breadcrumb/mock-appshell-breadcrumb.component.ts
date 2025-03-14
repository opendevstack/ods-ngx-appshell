import { Component, input } from '@angular/core';
import { AppShellLink } from '../../models/appshell-link';

@Component({
  selector: 'appshell-breadcrumb',
  standalone: true,
  imports: [],
  template: 'MOCK',
})
export class MockAppshellBreadcrumbComponent {
  links = input<AppShellLink[]>();
}
