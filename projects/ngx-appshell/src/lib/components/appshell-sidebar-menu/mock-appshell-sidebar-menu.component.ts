import { Component, input } from '@angular/core';
import { AppShellLinksGroup } from '../../models/appshell-links-group';

@Component({
  selector: 'appshell-sidebar-menu',
  standalone: true,
  template: 'MOCK'
})
export class MockAppShellSidebarMenuComponent {
  sections = input.required<AppShellLinksGroup[]>();
  links = input<AppShellLinksGroup>();
}
