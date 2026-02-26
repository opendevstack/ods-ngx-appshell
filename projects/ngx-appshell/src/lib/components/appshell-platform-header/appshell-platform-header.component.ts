import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellPicker } from '../../models/appshell-picker';
import { AppShellUser } from '../../models/appshell-user';
import { Router } from '@angular/router';
import { AppShellHeaderPickerComponent } from '../appshell-header-picker/appshell-header-picker.component';
import { AppShellHeaderUserComponent } from '../appshell-header-user/appshell-header-user.component';
import { AppShellHeaderIconLinkComponent } from '../appshell-header-icon-link/appshell-header-icon-link.component';

@Component({
    selector: 'appshell-platform-header',
    imports: [
        AppShellLinkDirective,
        AppShellHeaderPickerComponent,
        AppShellHeaderUserComponent,
        AppShellHeaderIconLinkComponent,
    ],
    templateUrl: './appshell-platform-header.component.html',
    styleUrl: './appshell-platform-header.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellPlatformHeaderComponent {

    applicationName = input.required<string>();
    symbol = input<string>();
    logo = input<string>();
    applicationNameLink = input<string>();
    helpLink = input<AppShellLink>();
    notificationsLink = input<AppShellLink>();
    notificationsCount = input<number>(0);
    links = input.required<AppShellLink[]>();
    projectPicker = input<AppShellPicker>();
    secondaryPicker = input<AppShellPicker>();
    loggedUser = input<AppShellUser | null>();
    userLoggedIn = output();
    userLoggedOut = output();
    userProjectPick = output<string>();
    userSecondaryPick = output<string>();
    isPlatformPickerOpened = input<boolean | null>(null);
    platformPickerClick = output<void>();

    constructor(private readonly router: Router) {}

    getCurrentUrlPath(): string {
        return this.router.url;
    }

    openPlatformPicker(): void {
        this.platformPickerClick.emit();
    }
}
