import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { AppShellLink } from '../../models/appshell-link';
import { AppshellBreadcrumbComponent } from '../appshell-breadcrumb/appshell-breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'appshell-page-header',
  standalone: true,
  imports: [MatButtonModule, AppshellBreadcrumbComponent],
  templateUrl: './appshell-page-header.component.html',
  styleUrl: './appshell-page-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppshellPageHeaderComponent {
  breadcrumbLinks = input<AppShellLink[]>();
  title = input<string>();
  buttonText = input<string>();
  buttonClicked = output<void>();

  clickButton() {
    this.buttonClicked.emit();
  }
}
