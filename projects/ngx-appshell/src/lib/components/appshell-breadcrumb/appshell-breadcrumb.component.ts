import { Component, input } from '@angular/core';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { AppShellLink } from '../../models/appshell-link';

@Component({
  selector: 'appshell-breadcrumb',
  standalone: true,
  imports: [AppShellLinkDirective],
  templateUrl: './appshell-breadcrumb.component.html',
  styleUrl: './appshell-breadcrumb.component.scss'
})
export class AppshellBreadcrumbComponent {
  links = input<AppShellLink[]>();
}
