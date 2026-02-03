import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellPlatformLayoutComponent } from './appshell-platform-layout.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MockAppShellSidebarMenuComponent } from '../appshell-sidebar-menu/mock-appshell-sidebar-menu.component';
import { AppShellSidebarMenuComponent } from '../appshell-sidebar-menu/appshell-sidebar-menu.component';
import { AppShellHeaderComponent } from '../appshell-header/appshell-header.component';
import { MockAppShellHeaderComponent } from '../appshell-header/mock-appshell-header.component';

describe('AppShellPlatformLayoutComponent', () => {
  let component: AppShellPlatformLayoutComponent;
  let fixture: ComponentFixture<AppShellPlatformLayoutComponent>;

  TestBed.overrideComponent(AppShellPlatformLayoutComponent, {
    remove: { imports: [AppShellHeaderComponent, AppShellSidebarMenuComponent] },
    add: { imports: [MockAppShellHeaderComponent, MockAppShellSidebarMenuComponent] },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellPlatformLayoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellPlatformLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headerVariant', '');
    fixture.componentRef.setInput('applicationSymbol', 'logo.svg');
    fixture.componentRef.setInput('applicationName', 'FakeName');
    fixture.componentRef.setInput('appShellHelpLink', 'fakeLink');
    fixture.componentRef.setInput('headerLinks', []);
    fixture.componentRef.setInput('sidenavSections', []);
    fixture.componentRef.setInput('sidenavLinks', []);
    fixture.componentRef.setInput('loggedUser', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
