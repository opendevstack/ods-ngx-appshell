import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AzureService } from './services/azure.service';
import { of, Subject } from 'rxjs';
import { NatsMessage, NatsService } from './services/nats.service';
import { AppShellToastsComponent, AppShellToastService, AppShellUser } from 'ngx-appshell';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAzureService: jasmine.SpyObj<AzureService>;
  let mockNatsService: jasmine.SpyObj<NatsService>;
  let mockToastService: jasmine.SpyObj<AppShellToastService>;
  let azureLoggedUser$: Subject<AppShellUser>;
  let natsLiveMessage$: Subject<NatsMessage | null>;
  let natsMessageCount$: Subject<number>;

  beforeEach(async () => {
    azureLoggedUser$ = new Subject<AppShellUser>();
    natsLiveMessage$ = new Subject<NatsMessage | null>();
    natsMessageCount$ = new Subject<number>();
    mockAzureService = jasmine.createSpyObj('AzureService', ['initialize', 'login', 'logout'], { loggedUser$: azureLoggedUser$.asObservable() });
    mockNatsService = jasmine.createSpyObj('NatsService', ['initialize', 'initializeUser', 'readMessages', 'isValidMessage'], { liveMessage$: natsLiveMessage$.asObservable(), unreadMessagesCount$: natsMessageCount$.asObservable() });
    mockToastService = jasmine.createSpyObj('AppShellToastService', ['showToast'], { toasts$: of([]) });

    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule, AppShellToastsComponent],
      providers: [
        { provide: AzureService, useValue: mockAzureService },
        { provide: NatsService, useValue: mockNatsService },
        { provide: AppShellToastService, useValue: mockToastService },
        provideHttpClient()
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the service and subscribe to loggedUser$ on ngOnInit', () => {
    component.ngOnInit();
    expect(mockAzureService.initialize).toHaveBeenCalled();
    expect(component.loggedUser).toBeNull();
  });

  it('should call login method of AzureService on login', () => {
    component.login();
    expect(mockAzureService.login).toHaveBeenCalled();
  });

  it('should call logout method of AzureService on logout', () => {
    component.logout();
    expect(mockAzureService.logout).toHaveBeenCalled();
  });

  it('should complete the _destroying$ subject on ngOnDestroy', () => {
    const completeSpy = spyOn(component['_destroying$'], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });
  
  it('should log the selected option when pickerChanged is called', () => {
    const consoleSpy = spyOn(console, 'log');
    const testOption = 'Test Option';

    component.projectPickerChanged(testOption);

    expect(consoleSpy).toHaveBeenCalledWith(testOption);
  });
  
  it('should log the selected option when secondaryPickerChanged is called', () => {
    const consoleSpy = spyOn(console, 'log');
    const testOption = 'Test Option';

    component.secondaryPickerChanged(testOption);

    expect(consoleSpy).toHaveBeenCalledWith(testOption);
  });

  it('should call initializeUser with a valid NATS user name', fakeAsync(() => {
    azureLoggedUser$.next({fullName: 'Fake', username: 'fake.user@fakemail.com'} as AppShellUser);
    natsMessageCount$.next(0);
    tick(5000);
    expect(mockNatsService.initializeUser).toHaveBeenCalledWith('fake_user');
    expect(mockToastService.showToast).not.toHaveBeenCalled();
  }));

  it('should show a toast with the initial notifications count', fakeAsync(() => {
    azureLoggedUser$.next({fullName: 'Fake', username: 'fake.user@fakemail.com'} as AppShellUser);
    natsMessageCount$.next(3);
    tick(5000);
    expect(mockNatsService.initializeUser).toHaveBeenCalledWith('fake_user');
    expect(mockToastService.showToast).toHaveBeenCalled();
  }));

  it('should manage properly the received message from nats service', fakeAsync(() => {
    mockToastService.showToast.calls.reset();
    natsLiveMessage$.next(null);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    natsLiveMessage$.next({data: null} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.returnValue(false);
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.throwError(new Error('Invalid message format'));
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.returnValue(true);
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).toHaveBeenCalled();
  }));
});
