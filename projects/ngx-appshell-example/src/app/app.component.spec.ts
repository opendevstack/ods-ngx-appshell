import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AzureService } from './services/azure.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAzureService: jasmine.SpyObj<AzureService>;

  beforeEach(async () => {
    mockAzureService = jasmine.createSpyObj('AzureService', ['initialize', 'login', 'logout'], { loggedUser$: of(null) });

    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule],
      providers: [
        { provide: AzureService, useValue: mockAzureService },
        provideHttpClient()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

});
