import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellSelectComponent } from './appshell-select.component';

describe('AppShellSelectComponent', () => {
  let component: AppShellSelectComponent;
  let fixture: ComponentFixture<AppShellSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellSelectComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('options', ['A', 'B', 'C']);
    fixture.componentRef.setInput('placeholder', 'Select status');
    fixture.componentRef.setInput('multipleSelection', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive required inputs', () => {
    expect(component.label()).toBe('Status');
    expect(component.options()).toEqual(['A', 'B', 'C']);
    expect(component.placeholder()).toBe('Select status');
    expect(component.multipleSelection()).toBeFalse();
  });

  it('should receive value input', () => {
    fixture.componentRef.setInput('value', 'A');
    fixture.detectChanges();

    expect(component.selectValue()).toBe('A');
  });

  it('should receive array value input', () => {
    fixture.componentRef.setInput('value', ['A', 'B']);
    fixture.detectChanges();

    expect(component.selectValue()).toEqual(['A', 'B']);
  });

  it('should emit value change', () => {
    const emitSpy = spyOn(component.selectValueChange, 'emit');

    component.selectValueChange.emit('A');

    expect(emitSpy).toHaveBeenCalledWith('A');
  });

  it('should emit array value change', () => {
    const emitSpy = spyOn(component.selectValueChange, 'emit');

    component.selectValueChange.emit(['A', 'B']);

    expect(emitSpy).toHaveBeenCalledWith(['A', 'B']);
  });
});
