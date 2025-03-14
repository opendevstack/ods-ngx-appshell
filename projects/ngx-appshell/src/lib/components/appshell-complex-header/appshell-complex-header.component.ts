import { Component, input, output } from '@angular/core';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AppShellLink } from '../../models/appshell-link';
import { Router } from '@angular/router';
import { AppShellHeaderComponent } from '../appshell-header/appshell-header.component';

@Component({
  selector: 'appshell-complex-header',
  standalone: true,
  imports: [AppShellLinkDirective, MatTooltipModule, CommonModule, AppShellHeaderComponent],
  templateUrl: './appshell-complex-header.component.html',
  styleUrl: './appshell-complex-header.component.scss'
})
export class AppShellComplexHeaderComponent {

  headerVariant = input<string>('');
  applicationName = input.required<string>();
  logo = input.required<string>();
  symbol = input.required<string>();
  helpLink = input<AppShellLink>();
  headerLinks = input.required<AppShellLink[]>();
  links = input.required<AppShellLink[]>();
  loggedUser=input<AppShellUser|null>();
  userLoggedIn = output();
  userLoggedOut = output();

  constructor(private router: Router) {}

  getCurrentUrlPath(): string {
    return this.router.url;
  }

}
