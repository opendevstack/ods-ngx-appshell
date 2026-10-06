import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AzureService } from './azure.service';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from "@azure/msal-angular";
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus, InteractionType, RedirectRequest } from '@azure/msal-browser';
import { Router } from '@angular/router';

describe('AzureService', () => {
    let service: AzureService;
    let msalService: jasmine.SpyObj<MsalService>;
    const msalGuardConfig: jasmine.SpyObj<MsalGuardConfiguration> = jasmine.createSpyObj('MsalGuardConfiguration', ['authRequest', 'interactionType']);
    let msalSubject$: Subject<EventMessage>;
    let inProgress$: Subject<InteractionStatus>;
    const msalInstanceSpy = jasmine.createSpyObj('instance', ['enableAccountStorageEvents', 'getAllAccounts', 'getActiveAccount', 'setActiveAccount', 'acquireTokenSilent']);
    const mockRouter: jasmine.SpyObj<Router> =  jasmine.createSpyObj('Router', ['navigate']);;

    beforeEach(() => {
        msalSubject$ = new Subject<EventMessage>();
        inProgress$ = new BehaviorSubject<InteractionStatus>(InteractionStatus.Startup);
        
        const msalServiceSpy = jasmine.createSpyObj('MsalService', ['handleRedirectObservable', 'instance', 'loginRedirect', 'logoutRedirect']);
        const msalBroadcastServiceSpy = jasmine.createSpyObj('MsalBroadcastService', [], {
            msalSubject$: msalSubject$.asObservable(),
            inProgress$: inProgress$.asObservable()
        });
        
        TestBed.configureTestingModule({
            providers: [
                AzureService,
                { provide: MSAL_GUARD_CONFIG, useValue: msalGuardConfig },
                { provide: MsalService, useValue: msalServiceSpy },
                { provide: MsalBroadcastService, useValue: msalBroadcastServiceSpy },
                { provide: Router, useValue: mockRouter }
            ]
        });

        service = TestBed.inject(AzureService);
        msalService = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
        msalInstanceSpy.getAllAccounts.and.returnValue([{}]);
        msalService.instance = msalInstanceSpy;
        msalGuardConfig.interactionType = InteractionType.Redirect;
        
        window.onbeforeunload = () => "Oh no!"; // Prevent page reloads during tests 
    });
    

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize properties in the constructor', () => {
        expect(service.loginDisplay).toBeFalse();
        expect(service.isFirstTime).toBeTrue();
        expect(service.loggedUser$).toBeInstanceOf(BehaviorSubject);
        expect(service.loggedUser$.value).toBeNull();
    });

    it('initialize method works', () => {
        msalService.handleRedirectObservable.and.returnValue(of({} as AuthenticationResult));
        service.initialize();
        msalSubject$.next({eventType: EventType.LOGIN_SUCCESS} as EventMessage);
        inProgress$.next(InteractionStatus.None);
        expect(msalService.handleRedirectObservable).toHaveBeenCalled();
    });

    it('initialize - should not restart login while a redirect response is pending', () => {
        const redirectResponse$ = new Subject<AuthenticationResult | null>();
        msalService.handleRedirectObservable.and.returnValue(redirectResponse$);
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        spyOn(service, 'login');

        service.initialize();
        inProgress$.next(InteractionStatus.None);

        expect(service.login).not.toHaveBeenCalled();
    });

    it('initialize - should not restart login when MSAL becomes idle before rejecting the redirect', () => {
        const redirectResponse$ = new Subject<AuthenticationResult | null>();
        const error = new Error('Redirect token exchange failed');
        msalService.handleRedirectObservable.and.returnValue(redirectResponse$);
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        spyOn(service, 'login');
        spyOn(console, 'error');

        service.initialize();
        inProgress$.next(InteractionStatus.HandleRedirect);
        inProgress$.next(InteractionStatus.None);
        redirectResponse$.error(error);

        expect(service.login).not.toHaveBeenCalled();
        expect(service.isFirstTime).toBeFalse();
        expect(console.error).toHaveBeenCalledWith('Error handling login redirect', error);
    });

    it('initialize - should restore the account after the redirect without restarting login', () => {
        const redirectResponse$ = new Subject<AuthenticationResult | null>();
        const account = { username: 'testuser' };
        msalService.handleRedirectObservable.and.returnValue(redirectResponse$);
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        spyOn(service, 'login');
        spyOn(service, 'refreshLoggedUser');
        msalInstanceSpy.setActiveAccount.calls.reset();

        service.initialize();
        msalInstanceSpy.getAllAccounts.and.returnValue([account]);
        inProgress$.next(InteractionStatus.None);
        redirectResponse$.next({ account } as AuthenticationResult);
        redirectResponse$.complete();

        expect(msalInstanceSpy.setActiveAccount).toHaveBeenCalledWith(account);
        expect(service.login).not.toHaveBeenCalled();
        expect(service.refreshLoggedUser).toHaveBeenCalledTimes(1);
    });

    it('initialize - should start login once after a completed empty redirect on first load', () => {
        msalService.handleRedirectObservable.and.returnValue(of(null));
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        spyOn(service, 'login');

        service.initialize();
        inProgress$.next(InteractionStatus.None);
        inProgress$.next(InteractionStatus.None);

        expect(service.login).toHaveBeenCalledTimes(1);
    });

    it('initialize - should set window.location.pathname to "/" when all accounts are removed', fakeAsync(() => {
        msalService.handleRedirectObservable.and.returnValue(of({} as AuthenticationResult));
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        service.initialize();
        msalSubject$.next({ eventType: EventType.LOGOUT_SUCCESS } as EventMessage);
        tick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('refreshLoggedUser - should set loggedUser$ to null if no msalUser and isFirstTime is true', fakeAsync(() => {
        service.isFirstTime = true;
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        service.refreshLoggedUser();
        expect(service.isFirstTime).toBe(false);
        tick();
        expect(service.loggedUser$.value).toBeNull();
    }));

    it('refreshLoggedUser - should set loggedUser$ to null if no msalUser and isFirstTime is false', fakeAsync(() => {
        service.isFirstTime = false;
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        service.refreshLoggedUser();
        tick();
        expect(service.loggedUser$.value).toBeNull();
    }));

    it('refreshLoggedUser - should set loggedUser$ with user details if msalUser exists', (done) => {
        const msalUser = { name: 'Test User' };
        msalInstanceSpy.getActiveAccount.and.returnValue(msalUser);
        msalInstanceSpy.acquireTokenSilent.and.returnValue(Promise.resolve({ accessToken: 'test-token' }));

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(new Blob())));

        service.refreshLoggedUser();

        setTimeout(() => {
            expect(service.loggedUser$.value!.fullName).toBe(msalUser.name);
            done();
        }, 0);
    });

    it('refreshLoggedUser - should handle error when acquiring token silently', (done) => {
        const msalUser = { name: 'Test User' };
        msalInstanceSpy.getActiveAccount.and.returnValue(msalUser);
        msalInstanceSpy.acquireTokenSilent.and.returnValue(Promise.reject('Error acquiring token silently'));

        service.refreshLoggedUser();

        setTimeout(() => {
            expect(service.loggedUser$.value!.fullName).toBe(msalUser.name);
            done();
        }, 0);
    });

    it('refreshLoggedUser - should handle error when fetching profile picture', (done) => {
        const msalUser = { name: 'Test User' };
        msalInstanceSpy.getActiveAccount.and.returnValue(msalUser);
        msalInstanceSpy.acquireTokenSilent.and.returnValue(Promise.resolve({ accessToken: 'test-token' }));

        spyOn(window, 'fetch').and.returnValue(Promise.reject('Error fetching profile picture'));

        service.refreshLoggedUser();

        setTimeout(() => {
            expect(service.loggedUser$.value!.fullName).toBe(msalUser.name);
            done();
        }, 0);
    });
    
    it('refreshLoggedUser - should handle 404 error when fetching profile picture', (done) => {
        const msalUser = { name: 'Test User' };
        msalInstanceSpy.getActiveAccount.and.returnValue(msalUser);
        msalInstanceSpy.acquireTokenSilent.and.returnValue(Promise.resolve({ accessToken: 'test-token' }));
    
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 404 })));
    
        service.refreshLoggedUser();
    
        setTimeout(() => {
            expect(service.loggedUser$.value!.fullName).toBe(msalUser.name);
            expect(service.loggedUser$.value!.avatarSrc).toBeUndefined();
            done();
        }, 0);
    });

    it('login - should call loginRedirect with authRequest if msalGuardConfig.authRequest is defined', () => {
        msalGuardConfig.authRequest = { scopes: ['User.Read'] }

        service.login();

        expect(msalService.loginRedirect).toHaveBeenCalledWith({
            ...{ scopes: ['User.Read'] }
        } as RedirectRequest);
    });

    it('login - should call loginRedirect without parameters if msalGuardConfig.authRequest is not defined', () => {
        msalGuardConfig.authRequest = undefined;

        service.login();

        expect(msalService.loginRedirect).toHaveBeenCalledWith();
    });

    it('logout - should call logout on msalService', () => {
        service.logout();
        expect(msalService.logoutRedirect).toHaveBeenCalled();
    });

    it('checkAndSetActiveAccount - should set the first account as active if no active account is set', () => {
        msalInstanceSpy.setActiveAccount.calls.reset();
        msalInstanceSpy.getActiveAccount.calls.reset();
        msalInstanceSpy.getAllAccounts.calls.reset();
        const accounts = [{ username: 'testuser' }];
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        msalInstanceSpy.getAllAccounts.and.returnValue(accounts);
        service.checkAndSetActiveAccount();
        expect(msalInstanceSpy.setActiveAccount).toHaveBeenCalledWith(accounts[0]);
        expect(msalInstanceSpy.getActiveAccount).toHaveBeenCalled();
        expect(msalInstanceSpy.getAllAccounts).toHaveBeenCalled();
    });

    it('checkAndSetActiveAccount - should not set active account if an active account is already set', () => {
        msalInstanceSpy.setActiveAccount.calls.reset();
        msalInstanceSpy.getActiveAccount.calls.reset();
        const activeAccount = { username: 'activeuser' };
        msalInstanceSpy.getActiveAccount.and.returnValue(activeAccount);
        msalInstanceSpy.acquireTokenSilent.and.returnValue(Promise.resolve({ accessToken: 'test-token' }));
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(new Blob())));
        service.checkAndSetActiveAccount();
        expect(msalInstanceSpy.setActiveAccount).not.toHaveBeenCalled();
        expect(msalInstanceSpy.getActiveAccount).toHaveBeenCalled();
    });

    it('checkAndSetActiveAccount - should not set active account if there are no accounts', () => {
        msalInstanceSpy.setActiveAccount.calls.reset();
        msalInstanceSpy.getActiveAccount.calls.reset();
        msalInstanceSpy.getAllAccounts.calls.reset();
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        msalInstanceSpy.getAllAccounts.and.returnValue([]);
        service.checkAndSetActiveAccount();
        expect(msalInstanceSpy.setActiveAccount).not.toHaveBeenCalled();
        expect(msalInstanceSpy.getActiveAccount).toHaveBeenCalled();
        expect(msalInstanceSpy.getAllAccounts).toHaveBeenCalled();
    });

    it('checkAndSetActiveAccount - should call refreshLoggedUser', () => {
        msalInstanceSpy.setActiveAccount.calls.reset();
        msalInstanceSpy.getActiveAccount.calls.reset();
        msalInstanceSpy.getAllAccounts.calls.reset();
        spyOn(service, 'refreshLoggedUser');
        msalInstanceSpy.getActiveAccount.and.returnValue(null);
        msalInstanceSpy.getAllAccounts.and.returnValue([{ username: 'testuser' }]);
        service.checkAndSetActiveAccount();
        expect(service.refreshLoggedUser).toHaveBeenCalled();
    });
    
    it('ngOnDestroy - should complete the _destroying$ subject', () => {
        spyOn(service['_destroying$'], 'next');
        spyOn(service['_destroying$'], 'complete');

        service.ngOnDestroy();

        expect(service['_destroying$'].next).toHaveBeenCalledWith(undefined);
        expect(service['_destroying$'].complete).toHaveBeenCalled();
    });
});

