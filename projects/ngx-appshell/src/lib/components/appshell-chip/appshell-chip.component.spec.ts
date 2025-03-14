import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppshellChipComponent } from './appshell-chip.component';

describe('AppshellChipComponent', () => {
  let component: AppshellChipComponent;
  let fixture: ComponentFixture<AppshellChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellChipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
