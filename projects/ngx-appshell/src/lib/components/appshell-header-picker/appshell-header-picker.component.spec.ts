import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellHeaderPickerComponent } from './appshell-header-picker.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const BASE_PICKER = { label: 'Project: ', options: ['Alpha', 'Beta', 'Gamma'] };

describe('AppShellHeaderPickerComponent', () => {
    let component: AppShellHeaderPickerComponent;
    let fixture: ComponentFixture<AppShellHeaderPickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellHeaderPickerComponent],
            providers: [provideAnimationsAsync()],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellHeaderPickerComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('picker', BASE_PICKER);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // --- selectedLabel ---

    it('should return label only when no option is selected', () => {
        fixture.componentRef.setInput('picker', { label: 'Project: ', options: [] });
        fixture.detectChanges();
        expect(component.selectedLabel()).toBe('Project: ');
    });

    it('should append the selected value to the label', () => {
        fixture.componentRef.setInput('picker', { label: 'Project: ', options: ['Alpha'], selected: 'Alpha' });
        fixture.detectChanges();
        expect(component.selectedLabel()).toBe('Project: Alpha');
    });

    // --- filteredOptions ---

    it('should return all options when search is empty', () => {
        expect(component.filteredOptions()).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('should filter options case-insensitively based on search', () => {
        component.search = 'be';
        expect(component.filteredOptions()).toEqual(['Beta']);
    });

    it('should return an empty array when no options match the search', () => {
        component.search = 'xyz';
        expect(component.filteredOptions()).toEqual([]);
    });

    it('should return an empty array when picker has no options', () => {
        fixture.componentRef.setInput('picker', { label: 'P', options: [] });
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual([]);
    });

    it('should return an empty array when picker.options is undefined', () => {
        fixture.componentRef.setInput('picker', { label: 'P' } as any);
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual([]);
    });

    // --- search getter / setter ---

    it('should reflect the value set via the search setter in the getter', () => {
        component.search = 'test';
        expect(component.search).toBe('test');
    });

    // --- onPick ---

    it('should emit pick with the selected option', () => {
        spyOn(component.pick, 'emit');
        component.onPick('Alpha');
        expect(component.pick.emit).toHaveBeenCalledWith('Alpha');
    });

    it('should reset the search after picking', () => {
        component.search = 'al';
        component.onPick('Alpha');
        expect(component.search).toBe('');
    });

    // --- onSearchKeydown ---

    it('should call stopPropagation on the keyboard event', () => {
        const event = new KeyboardEvent('keydown');
        spyOn(event, 'stopPropagation');
        component.onSearchKeydown(event);
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should not throw when onSearchKeydown is called', () => {
        const event = new KeyboardEvent('keydown');
        expect(() => component.onSearchKeydown(event)).not.toThrow();
    });

    // --- onMenuOpened ---

    it('should not throw when onMenuOpened is called and searchable is false', () => {
        fixture.componentRef.setInput('searchable', false);
        fixture.detectChanges();
        expect(() => component.onMenuOpened()).not.toThrow();
    });

    it('should not throw when onMenuOpened is called and searchable is true but no input ref', () => {
        fixture.componentRef.setInput('searchable', true);
        fixture.detectChanges();
        // searchInputEl is only available once @if block renders; calling should be safe
        expect(() => component.onMenuOpened()).not.toThrow();
    });
});
