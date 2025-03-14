import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppshellPageHeaderComponent } from './appshell-page-header.component';

describe('AppshellPageHeaderComponent', () => {
  let component: AppshellPageHeaderComponent;
  let fixture: ComponentFixture<AppshellPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellPageHeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellPageHeaderComponent);
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
});
