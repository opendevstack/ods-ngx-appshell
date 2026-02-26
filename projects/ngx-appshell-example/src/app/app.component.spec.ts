import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AppShellToastsComponent, AppShellToastService } from 'ngx-appshell';
import { RouterModule } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockToastService: jasmine.SpyObj<AppShellToastService>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('AppShellToastService', ['showToast'], { toasts$: of([]) });

    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule, AppShellToastsComponent, RouterModule.forRoot([])],
      providers: [
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

  it('should have a toastLimitInScreen value', () => {
    expect(component.toastLimitInScreen).toBeGreaterThan(0);
  });
});

