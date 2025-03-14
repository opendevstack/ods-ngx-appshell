import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AppShellLink } from '../../models/appshell-link';
import { Router } from '@angular/router';

@Component({
  selector: 'appshell-header',
  standalone: true,
  imports: [AppShellLinkDirective, MatTooltipModule, CommonModule, MatMenuModule],
  templateUrl: './appshell-header.component.html',
  styleUrl: './appshell-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppShellHeaderComponent {

  applicationName = input.required<string>();
  symbol = input<string>();
  helpLink = input<AppShellLink>();
  links = input.required<AppShellLink[]>();
  loggedUser=input<AppShellUser|null>();
  userLoggedIn = output();
  userLoggedOut = output();

  constructor(private router: Router) {}

  getCurrentUrlPath(): string {
    return this.router.url;
  }

}
