import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellHeaderComponent } from './appshell-header.component';
import { Router } from '@angular/router';

describe('AppShellHeaderComponent', () => {
  let component: AppShellHeaderComponent;
  let fixture: ComponentFixture<AppShellHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellHeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('applicationName', 'FakeName');
    fixture.componentRef.setInput('symbol', 'logo.svg');
    fixture.componentRef.setInput('helpLink', 'FakeLink');
    fixture.componentRef.setInput('links', []);
    fixture.componentRef.setInput('loggedUser', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should return the current URL path', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/test-path');
    expect(component.getCurrentUrlPath()).toBe('/test-path');
  });
});
