import { Component } from '@angular/core';
import { AppShellIconComponent, AppShellLayoutComponent, AppShellLink, AppShellLinksGroup, AppShellPicker, AppShellUser } from 'ngx-appshell';
import { AppShellConfiguration as AppShellConfig } from '../../appshell.configuration';

@Component({
    selector: 'app-basic-shell',
    imports: [AppShellLayoutComponent, AppShellIconComponent],
    templateUrl: './basic-shell.component.html',
    styleUrl: './basic-shell.component.scss'
})
export class BasicShellComponent {

  applicationSymbol = 'symbol.svg';
  applicationName = AppShellConfig.applicationName + ' - Basic Layout';
  applicationNameLink = '/basic-shell';
  headerVariant = AppShellConfig.headerVariant;

  appShellHelpLink: AppShellLink = AppShellConfig.appShellHelpLink;
  appShellNotificationsLink: AppShellLink = AppShellConfig.appShellNotificationsLink;
  appShellNotificationsCount = 3;

  headerLinks: AppShellLink[] = AppShellConfig.headerLinks;

  headerPicker: AppShellPicker = {
    label: 'Environment',
    options: ['Development', 'Staging', 'Production'],
    selected: 'Development',
    showSelectedInLabel: false
  };

  sidenavSections: AppShellLinksGroup[] = AppShellConfig.sidenavSections;

  sidenavLinks: AppShellLinksGroup = AppShellConfig.sidenavLinks;

  loggedUser: AppShellUser | null = {
    username: 'demo.user@example.com',
    fullName: 'Demo User',
  };

  onUserLoggedIn() {
    console.log('[BasicLayoutDemo] Mock login triggered');
  }

  onUserLoggedOut() {
    console.log('[BasicLayoutDemo] Mock logout triggered');
  }

  onUserPick(option: string) {
    console.log('[BasicLayoutDemo] Environment picked:', option);
  }

  extraHeaderIconClick(iconNum: string) {
    console.log(`Extra header icon ${iconNum} clicked`);
  }
}
