import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellSidebarMenuComponent } from './appshell-sidebar-menu.component';
import { Router } from '@angular/router';
import { AppShellLinksGroup } from '../../models/appshell-links-group';

describe('AppShellSidebarMenuComponent', () => {
  let component: AppShellSidebarMenuComponent;
  let fixture: ComponentFixture<AppShellSidebarMenuComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['url'], { url: '/test-path' });

    await TestBed.configureTestingModule({
      imports: [AppShellSidebarMenuComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppShellSidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sections', []);
    fixture.componentRef.setInput('links', { label: 'Test', links: [] });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have sections input', () => {
    const sections: AppShellLinksGroup[] = [];
    fixture.componentRef.setInput('sections', sections);
    fixture.detectChanges();
    expect(component.sections()).toEqual(sections);
  });

  it('should have links input', () => {
    const links: AppShellLinksGroup = { label: 'Test', links: [] };
    fixture.componentRef.setInput('links', links);
    fixture.detectChanges();
    expect(component.links()).toEqual(links);
  });

  it('should return the current URL path', () => {
    const urlPath = component.getCurrentUrlPath();
    expect(urlPath).toBe('/test-path');
  });
});