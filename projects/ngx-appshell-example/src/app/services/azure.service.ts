import { Inject, Injectable, OnDestroy } from "@angular/core";
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from "@azure/msal-angular";
import { EventMessage, EventType, InteractionStatus, RedirectRequest } from "@azure/msal-browser";
import { BehaviorSubject, filter, Subject, takeUntil } from "rxjs";
import { AppShellUser } from "ngx-appshell";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AzureService implements OnDestroy {
    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();

    isFirstTime = true;
    loggedUser$ = new BehaviorSubject<AppShellUser | null >(null);
  
    constructor(
      @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
      private msalService: MsalService,
      private msalBroadcastService: MsalBroadcastService,
      private router: Router
    ) {}

    initialize() {
        this.msalService.handleRedirectObservable().subscribe();
        this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal

        this.setLoginDisplay();

        this.msalService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
        this.msalBroadcastService.msalSubject$
        .pipe(
            filter((msg: EventMessage) =>
                msg.eventType === EventType.ACCOUNT_ADDED ||
                msg.eventType === EventType.ACCOUNT_REMOVED
            )
        )
        .subscribe(() => {
            if (this.msalService.instance.getAllAccounts().length === 0) {
                this.router.navigate(['/']);
            } else {
                this.setLoginDisplay();
            }
        });

        this.msalBroadcastService.inProgress$
        .pipe(
            filter((status: InteractionStatus) => status === InteractionStatus.None),
            takeUntil(this._destroying$)
        )
        .subscribe(() => {
            this.setLoginDisplay();
            this.checkAndSetActiveAccount();
        });
    }

    setLoginDisplay() {
        this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;
    }

    refreshLoggedUser(): void {
        const msalUser = this.msalService.instance.getActiveAccount();
        if (!msalUser) {
            if(this.isFirstTime) {
                this.isFirstTime = false;
                this.login();
            }
            this.loggedUser$.next(null);
        } else {
            const loggedUser = {
                fullName: msalUser.name,
                username: msalUser.username
            } as AppShellUser;
            
            this.msalService.instance.acquireTokenSilent({
                scopes: ["User.Read"]
            }).then(response => {
                fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`
                    }
                })
                .then(res => {
                    if (!res.ok) {
                        return null;
                    }
                    return res.blob();
                })
                .then(blob => {
                    if (!blob) {
                        console.warn('Microsoft profile picture not found');
                        return;
                    }
                    const url = URL.createObjectURL(blob);
                    if (loggedUser) {
                        loggedUser.avatarSrc = url;
                    }
                })
                .catch(error => {
                    console.error('Error fetching profile picture', error);
                });
            }).catch(error => {
                console.error('Error acquiring token silently', error);
            }).finally(() => {
                this.loggedUser$.next(loggedUser);
            });
        }
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        const activeAccount = this.msalService.instance.getActiveAccount();

        if (
            !activeAccount &&
            this.msalService.instance.getAllAccounts().length > 0
        ) {
            const accounts = this.msalService.instance.getAllAccounts();
            this.msalService.instance.setActiveAccount(accounts[0]);
        }
        this.refreshLoggedUser();
    }

    login() {
        if (this.msalGuardConfig.authRequest) {
            this.msalService.loginRedirect({
                ...this.msalGuardConfig.authRequest,
            } as RedirectRequest);
        } else {
            this.msalService.loginRedirect();
        }
    }

    logout() {
        this.msalService.logout();
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}