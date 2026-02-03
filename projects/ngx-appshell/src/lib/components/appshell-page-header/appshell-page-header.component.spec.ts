import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellPageHeaderComponent } from './appshell-page-header.component';

describe('AppShellPageHeaderComponent', () => {
  let component: AppShellPageHeaderComponent;
  let fixture: ComponentFixture<AppShellPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellPageHeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('breadcrumbLinks', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should emit buttonClicked event when clickButton is called', () => {
    spyOn(component.buttonClicked, 'emit');

    component.clickButton();

    expect(component.buttonClicked.emit).toHaveBeenCalled();
  });
  
  it('should emit secondaryButtonClicked event when clickSecondaryButton is called', () => {
    spyOn(component.secondaryButtonClicked, 'emit');

    component.clickSecondaryButton();

    expect(component.secondaryButtonClicked.emit).toHaveBeenCalled();
  });
});
