import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppShellFeedbackLauncherComponent } from './appshell-feedback-launcher.component';

describe('AppShellFeedbackLauncherComponent', () => {
    let component: AppShellFeedbackLauncherComponent;
    let fixture: ComponentFixture<AppShellFeedbackLauncherComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellFeedbackLauncherComponent],
            providers: [provideAnimationsAsync()],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellFeedbackLauncherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component.close();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // --- the tab ---

    it('should show a tab labelled Feedback by default', () => {
        const tab: HTMLElement = fixture.nativeElement.querySelector('.appshell-feedback-launcher');
        expect(tab).toBeTruthy();
        expect(tab.textContent?.trim()).toContain('Feedback');
    });

    it('should take its label and side from the host', () => {
        fixture.componentRef.setInput('label', 'Tell us');
        fixture.componentRef.setInput('side', 'left');
        fixture.detectChanges();

        const tab: HTMLElement = fixture.nativeElement.querySelector('.appshell-feedback-launcher');
        expect(tab.textContent?.trim()).toContain('Tell us');
        expect(tab.classList).toContain('appshell-feedback-launcher--left');
    });

    it('should hide the tab when the host says this person was already asked', () => {
        fixture.componentRef.setInput('hidden', true);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.appshell-feedback-launcher')).toBeNull();
    });

    it('should tell assistive technology the tab opens a dialog', () => {
        const tab: HTMLElement = fixture.nativeElement.querySelector('.appshell-feedback-launcher');
        expect(tab.getAttribute('aria-haspopup')).toBe('dialog');
        expect(tab.getAttribute('aria-expanded')).toBe('false');
    });

    // --- opening ---

    it('should not build the questionnaire until the tab is pressed', () => {
        expect(document.querySelector('appshell-feedback')).toBeNull();

        component.open();
        fixture.detectChanges();

        expect(document.querySelector('appshell-feedback')).not.toBeNull();
    });

    it('should mark the tab as expanded while the dialog is open', () => {
        component.open();
        fixture.detectChanges();

        const tab: HTMLElement = fixture.nativeElement.querySelector('.appshell-feedback-launcher');
        expect(tab.getAttribute('aria-expanded')).toBe('true');
    });

    it('should emit opened once, however many times the tab is pressed', () => {
        let opens = 0;
        component.opened.subscribe(() => opens++);

        component.open();
        component.open();

        expect(opens).toBe(1);
    });

    // --- closing and forwarding ---

    it('should close the dialog and report it when the questionnaire is dismissed', fakeAsync(() => {
        let dismissed = 0;
        component.dismissed.subscribe(() => dismissed++);

        component.open();
        fixture.detectChanges();
        component.close();
        // The dialog only reports its closure once the overlay has animated away.
        flush();
        fixture.detectChanges();

        expect(dismissed).toBe(1);
        expect(component.isOpen()).toBeFalse();
    }));

    it('should pass the answers straight through without closing the dialog', () => {
        let received: Record<string, string | number> | undefined;
        component.submitted.subscribe(a => received = a);

        component.open();
        fixture.detectChanges();
        component.onSubmitted({ taskSuccess: 'Yes' });

        expect(received).toEqual({ taskSuccess: 'Yes' });
        // The questionnaire shows its own success state; closing here would take it away.
        expect(component.isOpen()).toBeTrue();
    });

    it('should ask the default questions when the host supplies none', () => {
        expect(component.questionnaire().questions).toEqual([]);

        component.open();
        fixture.detectChanges();

        const questions = document.querySelectorAll('.feedback-question');
        expect(questions.length).toBe(1);
        expect(questions[0].textContent?.trim()).toBe('Did you achieve what you came for today?');
    });

    it('should ask a supplied questionnaire instead', () => {
        fixture.componentRef.setInput('feedback', {
            questions: [{ id: 'q', type: 'choice', label: 'Only one?', options: ['Yes'] }]
        });
        fixture.detectChanges();

        component.open();
        fixture.detectChanges();

        expect(document.querySelector('.feedback-question')?.textContent?.trim()).toBe('Only one?');
    });
});
