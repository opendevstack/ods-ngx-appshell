import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellPicker } from '../../models/appshell-picker';
import { Router } from '@angular/router';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-header',
    imports: [AppShellLinkDirective, MatTooltipModule, CommonModule, MatMenuModule, AppShellIconComponent],
    templateUrl: './appshell-header.component.html',
    styleUrl: './appshell-header.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellHeaderComponent {

  applicationName = input.required<string>();
  symbol = input<string>();
  applicationNameLink = input<string>();
  helpLink = input<AppShellLink>();
  notificationsLink = input<AppShellLink>();
  notificationsCount = input<number>(0);
  links = input.required<AppShellLink[]>();
  picker = input<AppShellPicker>();
  loggedUser=input<AppShellUser|null>();
  userLoggedIn = output();
  userLoggedOut = output();
  userPick = output<string>();

  constructor(private readonly router: Router) {}

  getCurrentUrlPath(): string {
    return this.router.url;
  }

}
