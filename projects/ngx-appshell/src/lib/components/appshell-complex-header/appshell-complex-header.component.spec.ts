import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellComplexHeaderComponent } from './appshell-complex-header.component';
import { Router } from '@angular/router';

describe('AppShellComplexHeaderComponent', () => {
  let component: AppShellComplexHeaderComponent;
  let fixture: ComponentFixture<AppShellComplexHeaderComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComplexHeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellComplexHeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('headerVariant', '');
    fixture.componentRef.setInput('applicationName', 'FakeName');
    fixture.componentRef.setInput('logo', 'logo-accent-green.svg');
    fixture.componentRef.setInput('symbol', 'logo-accent-green.svg');
    fixture.componentRef.setInput('helpLink', {});
    fixture.componentRef.setInput('headerLinks', []);
    fixture.componentRef.setInput('links', []);
    fixture.componentRef.setInput('loggedUser', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should return the current URL path', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/test-path');
    expect(component.getCurrentUrlPath()).toBe('/test-path');
  });
});
