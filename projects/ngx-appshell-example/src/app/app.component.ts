import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellConfiguration as AppShellConfig } from './appshell.configuration';
import { AppShellLinksGroup, AppShellLink, AppShellUser, AppShellLayoutComponent } from 'ngx-appshell';
import { Subject } from 'rxjs';
import { AzureService } from './services/azure.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AppShellLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  headerVariant: string = AppShellConfig.headerVariant;
  applicationSymbol: string = AppShellConfig.applicationSymbol;
  applicationName: string = AppShellConfig.applicationName;
  appShellHelpLink: AppShellLink = AppShellConfig.appShellHelpLink;
  headerLinks: AppShellLink[] = AppShellConfig.headerLinks;
  sidenavSections: AppShellLinksGroup[] = AppShellConfig.sidenavSections;
  sidenavLinks: AppShellLinksGroup = AppShellConfig.sidenavLinks;

  loggedUser: AppShellUser|null = null;
  
  private readonly _destroying$ = new Subject<void>();

  constructor(private azureService: AzureService) {}

  ngOnInit(): void {
		this.azureService.initialize();
		this.azureService.loggedUser$.subscribe((user) => {
			this.loggedUser = user
		});
	}

  login() {
    this.azureService.login();
  }

  logout() {
    this.azureService.logout();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
