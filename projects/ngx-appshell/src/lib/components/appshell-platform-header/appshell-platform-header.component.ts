import { Component, effect, input, output, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellUser } from '../../models/appshell-user';
import { AppShellLinkDirective } from '../../directives/appshell-link.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellPicker } from '../../models/appshell-picker';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-platform-header',
    imports: [AppShellLinkDirective, MatTooltipModule, CommonModule, MatMenuModule, FormsModule, MatFormFieldModule, MatInputModule, AppShellIconComponent],
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
  loggedUser=input<AppShellUser|null>();
  userLoggedIn = output();
  userLoggedOut = output();
  userProjectPick = output<string>();
  userProjectPickChoice: string | null = null;
  userSecondaryPick = output<string>();
  userSecondaryPickChoice: string | null = null;
  isPlatformPickerOpened = input<boolean | null>(null);
  platformPickerClick = output<void>();

  projectPickerSearch: string = '';

  constructor(private readonly router: Router) {
    effect(() => {
        if (this.projectPicker()) {
            this.userProjectPickChoice = this.projectPicker()!.selected ?? null;
        }
    })
    effect(() => {
        if (this.secondaryPicker()) {
            this.userSecondaryPickChoice = this.secondaryPicker()!.selected ?? null;
        }
    })
  }

  getCurrentUrlPath(): string {
    return this.router.url;
  }

  filteredProjectPickerOptions(): string[] {
      const picker = this.projectPicker();
      if (!picker?.options) {
          return [];
      }
      if (!this.projectPickerSearch) {
          return picker.options;
      }
      return picker.options.filter(opt =>
          opt.toLowerCase().includes(this.projectPickerSearch.toLowerCase())
      );
  }

  pickProject(option: string): void {
    this.userProjectPickChoice = option;
    this.userProjectPick.emit(option);
    this.projectPickerSearch = '';
  }

  pickSecondChoice(option: string): void {
    this.userSecondaryPickChoice = option;
    this.userSecondaryPick.emit(option);
  }

  openPlatformPicker() {
    this.platformPickerClick.emit();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    // Prevent mat-menu's keyboard navigation from interfering
    event.stopPropagation();
  }

}
