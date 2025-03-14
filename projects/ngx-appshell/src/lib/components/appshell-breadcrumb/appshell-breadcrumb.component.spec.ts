import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppshellBreadcrumbComponent } from './appshell-breadcrumb.component';

describe('AppshellBreadcrumbComponent', () => {
  let component: AppshellBreadcrumbComponent;
  let fixture: ComponentFixture<AppshellBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellBreadcrumbComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('links', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
