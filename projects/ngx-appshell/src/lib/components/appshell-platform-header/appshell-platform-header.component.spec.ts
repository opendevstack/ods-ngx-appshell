import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellPlatformHeaderComponent } from './appshell-platform-header.component';
import { Router } from '@angular/router';

describe('AppShellPlatformHeaderComponent', () => {
  let component: AppShellPlatformHeaderComponent;
  let fixture: ComponentFixture<AppShellPlatformHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellPlatformHeaderComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellPlatformHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('applicationName', 'FakeName');
    fixture.componentRef.setInput('symbol', 'logo.svg');
    fixture.componentRef.setInput('helpLink', 'FakeLink');
    fixture.componentRef.setInput('links', []);
    fixture.componentRef.setInput('loggedUser', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should return the current URL path', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/test-path');
    expect(component.getCurrentUrlPath()).toBe('/test-path');
  });

  it('should initialize userProjectPickChoice with projectPicker.selected', () => {
    const picker = { selected: 'projectA', options: ['projectA', 'projectB'] };
    fixture.componentRef.setInput('projectPicker', picker);
    fixture.detectChanges();
    expect(component.userProjectPickChoice).toBe('projectA');
  });

    it('should initialize userProjectPickChoice with no projectPicker.selected', () => {
    const picker = { options: ['projectA', 'projectB'] };
    fixture.componentRef.setInput('projectPicker', picker);
    fixture.detectChanges();
    expect(component.userProjectPickChoice).toBeNull();
  });

  it('should set userProjectPickChoice to null if projectPicker is not set', () => {
    fixture.componentRef.setInput('projectPicker', undefined);
    fixture.detectChanges();
    expect(component.userProjectPickChoice).toBeNull();
  });

  it('should initialize userSecondaryPickChoice with secondaryPicker.selected', () => {
    const secondaryPicker = { selected: 'choiceA', options: ['choiceA', 'choiceB'] };
    fixture.componentRef.setInput('secondaryPicker', secondaryPicker);
    fixture.detectChanges();
    expect(component.userSecondaryPickChoice).toBe('choiceA');
  });

  it('should initialize userSecondaryPickChoice with no secondaryPicker.selected', () => {
    const secondaryPicker = { options: ['choiceA', 'choiceB'] };
    fixture.componentRef.setInput('secondaryPicker', secondaryPicker);
    fixture.detectChanges();
    expect(component.userSecondaryPickChoice).toBeNull();
  });

  it('should set userSecondaryPickChoice to null if secondaryPicker is not set', () => {
    fixture.componentRef.setInput('secondaryPicker', undefined);
    fixture.detectChanges();
    expect(component.userSecondaryPickChoice).toBeNull();
  });
  
  it('should return all options when projectPickerSearch is empty in filteredProjectPickerOptions', () => {
    const picker = { options: ['Alpha', 'Beta', 'Gamma'] };
    fixture.componentRef.setInput('projectPicker', picker);
    component.projectPickerSearch = '';
    fixture.detectChanges();
    expect(component.filteredProjectPickerOptions()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('should filter options case-insensitively based on projectPickerSearch in filteredProjectPickerOptions', () => {
    const picker = { options: ['Alpha', 'Beta', 'Gamma'] };
    fixture.componentRef.setInput('projectPicker', picker);
    component.projectPickerSearch = 'be';
    fixture.detectChanges();
    expect(component.filteredProjectPickerOptions()).toEqual(['Beta']);
  });

  it('should return an empty array if projectPicker is undefined in filteredProjectPickerOptions', () => {
    fixture.componentRef.setInput('projectPicker', undefined);
    component.projectPickerSearch = '';
    fixture.detectChanges();
    expect(component.filteredProjectPickerOptions()).toEqual([]);
  });

  it('should return an empty array if projectPicker.options is undefined in filteredProjectPickerOptions', () => {
    const picker = {};
    fixture.componentRef.setInput('projectPicker', picker as any);
    component.projectPickerSearch = '';
    fixture.detectChanges();
    expect(component.filteredProjectPickerOptions()).toEqual([]);
  });

  it('should return an empty array if no options match the search in filteredProjectPickerOptions', () => {
    const picker = { options: ['Alpha', 'Beta', 'Gamma'] };
    fixture.componentRef.setInput('projectPicker', picker);
    component.projectPickerSearch = 'xyz';
    fixture.detectChanges();
    expect(component.filteredProjectPickerOptions()).toEqual([]);
  });

  it('should set userProjectPickChoice to the selected option', () => {
    component.pickProject('projectX');
    expect(component.userProjectPickChoice).toBe('projectX');
  });

  it('should emit userProjectPick with the selected option', () => {
    spyOn(component.userProjectPick, 'emit');
    component.pickProject('projectY');
    expect(component.userProjectPick.emit).toHaveBeenCalledWith('projectY');
  });

  it('should update userProjectPickChoice when called multiple times', () => {
    component.pickProject('projectA');
    expect(component.userProjectPickChoice).toBe('projectA');
    component.pickProject('projectB');
    expect(component.userProjectPickChoice).toBe('projectB');
  });

  it('should set userSecondaryPickChoice to the selected option in pickSecondChoice', () => {
    component.pickSecondChoice('choiceX');
    expect(component.userSecondaryPickChoice).toBe('choiceX');
  });

  it('should emit userSecondaryPick with the selected option in pickSecondChoice', () => {
    spyOn(component.userSecondaryPick, 'emit');
    component.pickSecondChoice('choiceY');
    expect(component.userSecondaryPick.emit).toHaveBeenCalledWith('choiceY');
  });

  it('should update userSecondaryPickChoice when called multiple times in pickSecondChoice', () => {
    component.pickSecondChoice('choiceA');
    expect(component.userSecondaryPickChoice).toBe('choiceA');
    component.pickSecondChoice('choiceB');
    expect(component.userSecondaryPickChoice).toBe('choiceB');
  });

  it('should emit platformPickerClick when openPlatformPicker is called', () => {
    spyOn(component.platformPickerClick, 'emit');
    component.openPlatformPicker();
    expect(component.platformPickerClick.emit).toHaveBeenCalled();
  });

  it('should emit platformPickerClick only once per call to openPlatformPicker', () => {
    spyOn(component.platformPickerClick, 'emit');
    component.openPlatformPicker();
    component.openPlatformPicker();
    expect(component.platformPickerClick.emit).toHaveBeenCalledTimes(2);
  });
  
  it('should call stopPropagation on event in onSearchKeydown', () => {
    const event = new KeyboardEvent('keydown');
    spyOn(event, 'stopPropagation');
    component.onSearchKeydown(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should not throw when onSearchKeydown is called with a KeyboardEvent', () => {
    const event = new KeyboardEvent('keydown');
    expect(() => component.onSearchKeydown(event)).not.toThrow();
  });
});
