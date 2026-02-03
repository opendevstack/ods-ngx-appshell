import { Component, input, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellPicker } from '../../models/appshell-picker';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppShellLinksGroup } from '../../models/appshell-links-group';
import { AppShellSidebarMenuComponent } from '../appshell-sidebar-menu/appshell-sidebar-menu.component';
import { AppShellHeaderComponent } from '../appshell-header/appshell-header.component';

@Component({
    selector: 'appshell-layout',
    imports: [AppShellSidebarMenuComponent, RouterOutlet, MatSidenavModule, AppShellHeaderComponent],
    templateUrl: './appshell-layout.component.html',
    styleUrl: './appshell-layout.component.scss'
})
export class AppShellLayoutComponent {

  headerVariant = input<string>('');
  applicationSymbol = input.required<string>();
  applicationName = input.required<string>();
  applicationNameLink = input<string>();
  appShellHelpLink = input<AppShellLink>();
  appShellNotificationsLink = input<AppShellLink>();
  appShellNotificationsCount = input<number>(0);
  headerLinks = input.required<AppShellLink[]>();
  headerPicker = input<AppShellPicker>();
  sidenavSections = input.required<AppShellLinksGroup[]>();
  sidenavLinks = input<AppShellLinksGroup>();
  loggedUser = input.required<AppShellUser|null>();
  
  userLoggedIn = output();
  userLoggedOut = output();
  userPick = output<string>();

  constructor() {}
}
