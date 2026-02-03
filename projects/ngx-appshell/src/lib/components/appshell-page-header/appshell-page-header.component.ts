import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellBreadcrumbComponent } from '../appshell-breadcrumb/appshell-breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { AppShellPicker } from '../../models/appshell-picker';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellButton } from '../../models/appshell-button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
  selector: 'appshell-page-header',
  imports: [MatButtonModule, AppShellBreadcrumbComponent, MatMenuModule, MatTooltipModule, AppShellIconComponent],
  templateUrl: './appshell-page-header.component.html',
  styleUrl: './appshell-page-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppShellPageHeaderComponent {
  breadcrumbLinks = input<AppShellLink[]>();
  title = input<string>();
  button = input<AppShellButton>();
  buttonClicked = output<void>();
  secondaryButton = input<AppShellButton>();
  secondaryButtonClicked = output<void>();
  picker = input<AppShellPicker>();
  pick = output<string>();

  clickButton() {
    this.buttonClicked.emit();
  }

  clickSecondaryButton() {
    this.secondaryButtonClicked.emit();
  }
}
