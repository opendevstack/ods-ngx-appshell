import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellFiltersComponent } from './appshell-filters.component';

describe('AppShellFiltersComponent', () => {
  let component: AppShellFiltersComponent;
  let fixture: ComponentFixture<AppShellFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellFiltersComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellFiltersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filters', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set activeFilters with a single value when values is a string', () => {
    const label = 'category';
    const value = 'category1';

    spyOn(component.activeFiltersChange, 'emit').and.callThrough();

    component.onFilterChange(label, value);

    expect(component.activeFilters.get(label)).toEqual([value]);
    expect(component.activeFiltersChange.emit).toHaveBeenCalled();
  });
  
  it('should remove from activeFilters when values is an empty string', () => {
    const label = 'category';
    const value = '';

    spyOn(component.activeFiltersChange, 'emit').and.callThrough();
    component.activeFilters.set(label, ['category1']);
    component.onFilterChange(label, value);

    expect(component.activeFilters.get(label)).toEqual(undefined);
    expect(component.activeFiltersChange.emit).toHaveBeenCalled();
  });

  it('should set activeFilters with multiple values when values is an array of strings', () => {
    const label = 'category';
    const values = ['category1', 'category2'];

    spyOn(component.activeFiltersChange, 'emit').and.callThrough();

    component.onFilterChange(label, values);

    expect(component.activeFilters.get(label)).toEqual(values);
    expect(component.activeFiltersChange.emit).toHaveBeenCalled();
  });
  
  it('should remove from activeFilters when values is an empty array', () => {
    const label = 'category';
    const value: string[] = [];

    spyOn(component.activeFiltersChange, 'emit').and.callThrough();
    component.activeFilters.set(label, ['category1']);
    component.onFilterChange(label, value);

    expect(component.activeFilters.get(label)).toEqual(undefined);
    expect(component.activeFiltersChange.emit).toHaveBeenCalled();
  });
});
