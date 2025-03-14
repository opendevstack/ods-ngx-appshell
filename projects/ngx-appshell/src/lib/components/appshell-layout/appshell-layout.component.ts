import { Component, input, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLink } from '../../models/appshell-link';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppShellLinksGroup } from '../../models/appshell-links-group';
import { AppShellSidebarMenuComponent } from '../appshell-sidebar-menu/appshell-sidebar-menu.component';
import { AppShellHeaderComponent } from '../appshell-header/appshell-header.component';

@Component({
  selector: 'appshell-layout',
  standalone: true,
  imports: [AppShellSidebarMenuComponent, RouterOutlet, MatSidenavModule, AppShellHeaderComponent],
  templateUrl: './appshell-layout.component.html',
  styleUrl: './appshell-layout.component.scss'
})
export class AppShellLayoutComponent {

  headerVariant = input<string>('');
  applicationSymbol = input.required<string>();
  applicationName = input.required<string>();
  appShellHelpLink = input<AppShellLink>();
  headerLinks = input.required<AppShellLink[]>();
  sidenavSections = input.required<AppShellLinksGroup[]>();
  sidenavLinks = input<AppShellLinksGroup>();
  loggedUser = input.required<AppShellUser|null>();
  
  userLoggedIn = output();
  userLoggedOut = output();

  constructor() {}
}
