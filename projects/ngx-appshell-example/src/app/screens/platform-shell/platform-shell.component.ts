import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellConfiguration as AppShellConfig } from '../../appshell.configuration';
import { AppShellLinksGroup, AppShellLink, AppShellUser, AppShellPlatformLayoutComponent, AppShellPicker, AppShellToastService, AppShellNotification, AppShellIconComponent } from 'ngx-appshell';
import { Subject, Subscription } from 'rxjs';
import { AzureService } from '../../services/azure.service';
import { NatsService } from '../../services/nats.service';
import { AppConfigService } from '../../services/app-config.service';

@Component({
    selector: 'app-platform-shell',
    imports: [CommonModule, AppShellPlatformLayoutComponent, AppShellIconComponent],
    templateUrl: './platform-shell.component.html',
    styleUrl: './platform-shell.component.scss'
})
export class PlatformShellComponent implements OnInit, OnDestroy {

  headerVariant: string = AppShellConfig.headerVariant;
  applicationSymbol?: string = AppShellConfig.applicationSymbol;
  applicationLogo?: string = AppShellConfig.applicationLogo;
  applicationName: string = AppShellConfig.applicationName;
  applicationNameLink: string = AppShellConfig.applicationNameLink;
  appShellHelpLink: AppShellLink = AppShellConfig.appShellHelpLink;
  headerLinks: AppShellLink[] = AppShellConfig.headerLinks;
  sidenavSections: AppShellLinksGroup[] = AppShellConfig.sidenavSections;
  sidenavLinks: AppShellLinksGroup = AppShellConfig.sidenavLinks;
  headerProjectPicker: AppShellPicker;
  headerSecondaryPicker: AppShellPicker;
  loggedUser: AppShellUser | null = null;
  appShellNotificationsLink: AppShellLink = AppShellConfig.appShellNotificationsLink;
  appShellNotificationsCount: number = 0;

  private readonly _destroying$ = new Subject<void>();
  private natsUrl: string | undefined;
  private unreadMessagesCountSubscription!: Subscription;
  private liveMessageSubscription!: Subscription;

  constructor(
    private azureService: AzureService,
    private toastService: AppShellToastService,
    private natsService: NatsService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.headerSecondaryPicker = {
      label: 'Catalog: ',
      options: ['Option 1', 'Option 2', 'Option 3'],
      selected: 'Option 2'
    };
    this.headerProjectPicker = {
      label: 'Project: ',
      options: ['Value 1', 'Project 2', 'Project 3',
      'Project 4', 'Project 5', 'Project 6',
      'Project 7', 'Project 8', 'Project 9',
      'Project 10', 'Project 11', 'Project 12',
      'Project 13', 'Project 14', 'Project 15'],
      selected: 'Project 2',
      noOptionsMessage: 'You don\'t have access to any projects in the Marketplace.<br/><br/>You can either <a href="#" target="_blank">create a project</a> or <a href="#" target="_blank">request access</a> to an existing project.',
      noFilteredOptionsMessage: 'No projects match the search term.'
    };
    this.natsUrl = this.appConfigService.getConfig()?.natsUrl;
  }

  async ngOnInit(): Promise<void> {
    await this.natsService.initialize(this.natsUrl!);
    this.azureService.initialize();
    this.azureService.loggedUser$.subscribe((user) => {
      this.loggedUser = user;
      this.initUserNotifications(user);
    });
    this.initializeNatsListeners();
  }

  extraHeaderIconClick(iconNum: string) {
    console.log(`Extra header icon ${iconNum} clicked`);
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
    this.liveMessageSubscription?.unsubscribe();
    this.unreadMessagesCountSubscription?.unsubscribe();
  }

  private initUserNotifications(user: AppShellUser | null) {
    if (user) {
      const natsUser = user.username.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
      this.natsService.initializeUser(natsUser);

      setTimeout(() => {
        if (this.appShellNotificationsCount > 0) {
          const notification = {
            id: new Date().getTime().toString() + `-logged`,
            title: `You have ${this.appShellNotificationsCount} unread notifications`,
            read: false,
            subject: 'only-toast'
          } as AppShellNotification;
          this.toastService.showToast(notification, 8000);
        }
      }, 4000);
    }
  }

  private initializeNatsListeners() {
    this.unreadMessagesCountSubscription = this.natsService.unreadMessagesCount$.subscribe((count) => {
      this.appShellNotificationsCount = count;
    });
    this.liveMessageSubscription = this.natsService.liveMessage$.subscribe((message) => {
      if (!message || !message.data) {
        return;
      }
      try {
        if (this.natsService.isValidMessage(message.data)) {
          console.log('Received valid message:', message);
          const notification = {
            id: message.id,
            type: message.data.type,
            title: `You have 1 new notification`,
            date: new Date(message.data.date),
            read: message.read,
            subject: message.subject
          };
          this.toastService.showToast(notification, 8000);
        } else {
          console.log('Invalid message format:', message);
        }
      } catch (error) {
        console.log('Invalid message format:', message);
      }
    });
  }

  projectPickerChanged(option: string) {
    console.log(option);
  }

  secondaryPickerChanged(option: string) {
    console.log(option);
  }
}
