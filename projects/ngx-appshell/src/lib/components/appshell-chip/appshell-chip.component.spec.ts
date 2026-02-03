import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellChipComponent } from './appshell-chip.component';

describe('AppShellChipComponent', () => {
  let component: AppShellChipComponent;
  let fixture: ComponentFixture<AppShellChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellChipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
