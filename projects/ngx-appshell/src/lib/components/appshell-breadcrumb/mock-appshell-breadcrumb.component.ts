import { Component, input } from '@angular/core';
import { AppShellLink } from '../../models/appshell-link';

@Component({
    selector: 'appshell-breadcrumb',
    imports: [],
    template: 'MOCK'
})
export class MockAppShellBreadcrumbComponent {
  links = input<AppShellLink[]>();
}
