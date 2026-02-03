import { Component, input, ViewEncapsulation } from '@angular/core';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-breadcrumb',
    imports: [AppShellLinkDirective, AppShellIconComponent],
    templateUrl: './appshell-breadcrumb.component.html',
    styleUrl: './appshell-breadcrumb.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppShellBreadcrumbComponent {
  links = input<AppShellLink[]>();
}
