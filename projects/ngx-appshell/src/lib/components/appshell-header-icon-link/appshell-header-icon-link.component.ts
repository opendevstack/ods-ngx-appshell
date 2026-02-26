import { Component, input, ViewEncapsulation } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-header-icon-link',
    imports: [AppShellLinkDirective, MatTooltipModule, AppShellIconComponent],
    templateUrl: './appshell-header-icon-link.component.html',
    styleUrl: './appshell-header-icon-link.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellHeaderIconLinkComponent {
    link = input.required<AppShellLink>();
    badge = input<number>(0);
}
