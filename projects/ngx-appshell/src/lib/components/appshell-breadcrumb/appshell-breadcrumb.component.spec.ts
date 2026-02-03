import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellBreadcrumbComponent } from './appshell-breadcrumb.component';

describe('AppShellBreadcrumbComponent', () => {
  let component: AppShellBreadcrumbComponent;
  let fixture: ComponentFixture<AppShellBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellBreadcrumbComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('links', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
