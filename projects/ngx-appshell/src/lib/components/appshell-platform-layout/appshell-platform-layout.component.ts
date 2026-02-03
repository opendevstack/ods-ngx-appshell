import { Component, input, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellPicker } from '../../models/appshell-picker';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppShellLinksGroup } from '../../models/appshell-links-group';
import { AppShellSidebarMenuComponent } from '../appshell-sidebar-menu/appshell-sidebar-menu.component';
import { AppShellPlatformHeaderComponent } from '../appshell-platform-header/appshell-platform-header.component';

@Component({
    selector: 'appshell-platform-layout',
    imports: [AppShellSidebarMenuComponent, RouterOutlet, MatSidenavModule, AppShellPlatformHeaderComponent],
    templateUrl: './appshell-platform-layout.component.html',
    styleUrl: './appshell-platform-layout.component.scss'
})
export class AppShellPlatformLayoutComponent {

  headerVariant = input<string>('');
  applicationSymbol = input<string>();
  applicationLogo = input<string>();
  applicationName = input.required<string>();
  applicationNameLink = input<string>();
  appShellHelpLink = input<AppShellLink>();
  appShellNotificationsLink = input<AppShellLink>();
  appShellNotificationsCount = input<number>(0);
  headerLinks = input.required<AppShellLink[]>();
  headerProjectPicker = input<AppShellPicker>();
  headerSecondaryPicker = input<AppShellPicker>();
  sidenavSections = input.required<AppShellLinksGroup[]>();
  sidenavLinks = input<AppShellLinksGroup>();
  loggedUser = input.required<AppShellUser|null>();
  isPlatformPickerOpened = input<boolean | null>(null);
  
  userLoggedIn = output();
  userLoggedOut = output();
  userProjectPick = output<string>();
  userSecondaryPick = output<string>();
  platformPickerClick = output<void>();

  constructor() {}
}
