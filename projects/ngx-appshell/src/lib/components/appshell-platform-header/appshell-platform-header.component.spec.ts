import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellPlatformHeaderComponent } from './appshell-platform-header.component';
import { provideRouter, Router } from '@angular/router';

describe('AppShellPlatformHeaderComponent', () => {
    let component: AppShellPlatformHeaderComponent;
    let fixture: ComponentFixture<AppShellPlatformHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellPlatformHeaderComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellPlatformHeaderComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('applicationName', 'FakeName');
        fixture.componentRef.setInput('links', []);
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
});
