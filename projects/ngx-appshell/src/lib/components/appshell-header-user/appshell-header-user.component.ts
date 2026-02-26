import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-header-user',
    imports: [MatMenuModule, AppShellIconComponent],
    templateUrl: './appshell-header-user.component.html',
    styleUrl: './appshell-header-user.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellHeaderUserComponent {
    loggedUser = input<AppShellUser | null>();
    loggedIn = output();
    loggedOut = output();
}
