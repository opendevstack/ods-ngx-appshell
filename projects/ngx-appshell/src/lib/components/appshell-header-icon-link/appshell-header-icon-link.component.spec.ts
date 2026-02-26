import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellHeaderIconLinkComponent } from './appshell-header-icon-link.component';
import { provideRouter } from '@angular/router';

const BASE_LINK = { anchor: '/help', icon: 'help', label: 'Help' };

describe('AppShellHeaderIconLinkComponent', () => {
    let component: AppShellHeaderIconLinkComponent;
    let fixture: ComponentFixture<AppShellHeaderIconLinkComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellHeaderIconLinkComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellHeaderIconLinkComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('link', BASE_LINK);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render an anchor element', () => {
        const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a.header-icon');
        expect(anchor).toBeTruthy();
    });

    it('should not show a badge when badge is 0 (default)', () => {
        const badge = fixture.nativeElement.querySelector('.notification-count');
        expect(badge).toBeNull();
    });

    it('should show the badge count when badge is between 1 and 9', () => {
        fixture.componentRef.setInput('badge', 5);
        fixture.detectChanges();
        const badge: HTMLElement = fixture.nativeElement.querySelector('.notification-count');
        expect(badge).toBeTruthy();
        expect(badge.textContent?.trim()).toBe('5');
    });

    it('should show "9+" when badge is greater than 9', () => {
        fixture.componentRef.setInput('badge', 12);
        fixture.detectChanges();
        const badge: HTMLElement = fixture.nativeElement.querySelector('.notification-count');
        expect(badge.textContent?.trim()).toBe('9+');
    });

    it('should show "9+" when badge is exactly 10', () => {
        fixture.componentRef.setInput('badge', 10);
        fixture.detectChanges();
        const badge: HTMLElement = fixture.nativeElement.querySelector('.notification-count');
        expect(badge.textContent?.trim()).toBe('9+');
    });
});
