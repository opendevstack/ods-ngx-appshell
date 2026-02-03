import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellConfiguration as AppShellConfig } from './appshell.configuration';
import { AppShellLinksGroup, AppShellLink, AppShellUser, AppShellPlatformLayoutComponent, AppShellPicker, AppShellToastService, AppShellToastsComponent, AppShellNotification } from 'ngx-appshell';
import { Subject, Subscription } from 'rxjs';
import { AzureService } from './services/azure.service';
import { NatsService } from './services/nats.service';
import { MatIconRegistry } from '@angular/material/icon';
import { AppConfigService } from './services/app-config.service';

@Component({
    selector: 'app-root',
    imports: [CommonModule, AppShellPlatformLayoutComponent, AppShellToastsComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  headerVariant: string = AppShellConfig.headerVariant;
  applicationSymbol?: string = AppShellConfig.applicationSymbol;
  applicationLogo?: string = AppShellConfig.applicationLogo;
  applicationName: string = AppShellConfig.applicationName;
  applicationNameLink: string = AppShellConfig.applicationNameLink;
  appShellHelpLink: AppShellLink = AppShellConfig.appShellHelpLink;
  headerLinks: AppShellLink[] = AppShellConfig.headerLinks;
  sidenavSections: AppShellLinksGroup[] = AppShellConfig.sidenavSections;
  sidenavLinks: AppShellLinksGroup = AppShellConfig.sidenavLinks;
  toastLimitInScreen: number = AppShellConfig.toastLimitInScreen;
  headerProjectPicker: AppShellPicker;
  headerSecondaryPicker: AppShellPicker;
  loggedUser: AppShellUser|null = null;
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
    private readonly appConfigService :AppConfigService,
    private matIconReg: MatIconRegistry
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
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
    await this.natsService.initialize(this.natsUrl!);
    this.azureService.initialize();
    this.azureService.loggedUser$.subscribe((user) => {
      this.loggedUser = user;
      this.initUserNotifications(user);
    });
    this.initializeNatsListeners();
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
    this.liveMessageSubscription.unsubscribe();
    this.unreadMessagesCountSubscription.unsubscribe();
  }

  private initUserNotifications(user: AppShellUser|null) {
    if(user) {
      // We convert the username to a valid NATS user name based on their validations:
      // validBucketRe = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
      // validKeyRe = regexp.MustCompile(`^[-/_=\.a-zA-Z0-9]+$`)
      const natsUser = user.username.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_')
      this.natsService.initializeUser(natsUser);
      
      // On login, leave 4 seconds for the NATS connection to be established and show a toast with the unread messages count
      setTimeout(() => {
        if(this.appShellNotificationsCount > 0) {
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
          // If you want to show the actual notification, you can show message.data instead of notification
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
