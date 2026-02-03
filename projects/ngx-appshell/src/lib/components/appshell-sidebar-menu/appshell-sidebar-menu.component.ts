import { Component, input, ViewEncapsulation } from '@angular/core';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { Router } from '@angular/router';
import { AppShellLinksGroup } from '../../models/appshell-links-group';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-sidebar-menu',
    imports: [AppShellLinkDirective, AppShellIconComponent],
    templateUrl: './appshell-sidebar-menu.component.html',
    styleUrl: './appshell-sidebar-menu.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellSidebarMenuComponent {

  sections = input.required<AppShellLinksGroup[]>();
  links = input<AppShellLinksGroup>();

  constructor(private readonly router: Router) {}

  getCurrentUrlPath(): string {
    return this.router.url;
  }
}
