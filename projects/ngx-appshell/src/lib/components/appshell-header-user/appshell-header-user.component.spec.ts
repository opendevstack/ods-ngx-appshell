import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellHeaderUserComponent } from './appshell-header-user.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const FAKE_USER = { fullName: 'Jane Doe', username: 'janedoe' };
const FAKE_USER_AVATAR = { fullName: 'Jane Doe', username: 'janedoe', avatarSrc: 'https://example.com/pic.jpg' };

describe('AppShellHeaderUserComponent', () => {
    let component: AppShellHeaderUserComponent;
    let fixture: ComponentFixture<AppShellHeaderUserComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellHeaderUserComponent],
            providers: [provideAnimationsAsync()],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellHeaderUserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    // --- null / guest state ---

    it('should show a login button when loggedUser is null', () => {
        fixture.componentRef.setInput('loggedUser', null);
        fixture.detectChanges();
        const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Login"]');
        expect(btn).toBeTruthy();
    });

    it('should emit loggedIn when the login button is clicked', () => {
        fixture.componentRef.setInput('loggedUser', null);
        fixture.detectChanges();
        spyOn(component.loggedIn, 'emit');
        const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Login"]');
        btn.click();
        expect(component.loggedIn.emit).toHaveBeenCalled();
    });

    // --- logged-in state ---

    it('should show the user full name when loggedUser is set', () => {
        fixture.componentRef.setInput('loggedUser', FAKE_USER);
        fixture.detectChanges();
        const text: HTMLElement = fixture.nativeElement.querySelector('.user-text');
        expect(text.textContent?.trim()).toBe('Jane Doe');
    });

    it('should show a generic person icon when user has no avatarSrc', () => {
        fixture.componentRef.setInput('loggedUser', FAKE_USER);
        fixture.detectChanges();
        const pic: HTMLElement = fixture.nativeElement.querySelector('.header-profile-picture');
        expect(pic).toBeNull();
        const icon = fixture.nativeElement.querySelector('appshell-icon');
        expect(icon).toBeTruthy();
    });

    it('should show a profile-picture div when user has avatarSrc', () => {
        fixture.componentRef.setInput('loggedUser', FAKE_USER_AVATAR);
        fixture.detectChanges();
        const pic: HTMLElement = fixture.nativeElement.querySelector('.header-profile-picture');
        expect(pic).toBeTruthy();
    });

    it('should emit loggedOut when the logout menu item is clicked', () => {
        fixture.componentRef.setInput('loggedUser', FAKE_USER);
        fixture.detectChanges();
        spyOn(component.loggedOut, 'emit');
        // open the menu first
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.user-ctn button');
        trigger.click();
        fixture.detectChanges();
        const logoutBtn: HTMLButtonElement = document.querySelector('button[aria-label="Logout"]')!;
        logoutBtn.click();
        expect(component.loggedOut.emit).toHaveBeenCalled();
    });
});
