import { Component, input, output } from '@angular/core';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellUser } from '../../models/appshell-user';

@Component({
  selector: 'appshell-header',
  standalone: true,
  template: 'MOCK',
})
export class MockAppShellPlatformHeaderComponent {

  applicationName = input.required<string>();
  symbol = input<string>();
  helpLink = input<AppShellLink>();
  links = input.required<AppShellLink[]>();
  loggedUser=input<AppShellUser|null>();
  userLoggedIn = output();
  userLoggedOut = output();

}
