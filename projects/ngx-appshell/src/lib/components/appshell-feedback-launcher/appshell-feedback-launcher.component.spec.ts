import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppShellFeedbackLauncherComponent } from './appshell-feedback-launcher.component';
import { AppShellFeedbackAnswers, AppShellFeedbackSave } from '../../models/appshell-feedback';

/** The first standard step, as its heading reads (a required question also carries an asterisk). */
const FIRST_QUESTION = 'What did you come here to do today?';

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

    // --- where the trigger lives ---

    it('should draw the trigger in the overlay container, outside the page layout', () => {
        const trigger = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
        // Not inside its own element, which in the AppShell layout sits under the
        // side menu's stacking context, but in the CDK overlay container on <body>.
        expect(fixture.nativeElement.contains(trigger)).toBeFalse();
        expect(trigger.closest('.cdk-overlay-container')).not.toBeNull();
    });

    it('should take the trigger away with the component', () => {
        fixture.destroy();
        expect(document.querySelector('.appshell-feedback-launcher')).toBeNull();
    });

    // --- the tab ---

    it('should show a round action button by default, named for assistive technology', () => {
        const trigger = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
        expect(trigger).toBeTruthy();
        // The round shape carries no visible text, so the name lives in the label.
        expect(trigger.classList).not.toContain('appshell-feedback-launcher--tab');
        expect(trigger.getAttribute('aria-label')).toBe('Feedback');
    });

    it('should spell the label out when it takes the side-strip shape', () => {
        fixture.componentRef.setInput('shape', 'tab');
        fixture.componentRef.setInput('label', 'Tell us');
        fixture.detectChanges();

        const trigger = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
        expect(trigger.classList).toContain('appshell-feedback-launcher--tab');
        expect(trigger.textContent).toContain('Tell us');
        expect(trigger.getAttribute('aria-label')).toBe('Tell us');
    });

    it('should take its side from the host', () => {
        fixture.componentRef.setInput('side', 'left');
        fixture.detectChanges();

        const trigger = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
        expect(trigger.classList).toContain('appshell-feedback-launcher--left');
    });

    it('should hide the tab when the host says this person was already asked', () => {
        fixture.componentRef.setInput('hidden', true);
        fixture.detectChanges();
        expect(document.querySelector('.appshell-feedback-launcher')).toBeNull();
    });

    it('should tell assistive technology the tab opens a dialog', () => {
        const tab = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
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

        const tab = document.querySelector<HTMLElement>('.appshell-feedback-launcher')!;
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

    it('should close its dialog when it is destroyed, and not report anything afterwards', fakeAsync(() => {
        let dismissed = 0;
        component.dismissed.subscribe(() => dismissed++);

        component.open();
        fixture.detectChanges();
        expect(document.querySelector('appshell-feedback')).not.toBeNull();

        // Leaving the page with the questionnaire open: the dialog goes too,
        // and its later closure no longer reaches the destroyed component
        // (it used to emit on a destroyed output, NG0953).
        fixture.destroy();
        flush();

        expect(document.querySelector('appshell-feedback')).toBeNull();
        expect(dismissed).toBe(0);
    }));

    it('should pass the answers straight through without closing the dialog', () => {
        let received: AppShellFeedbackAnswers | undefined;
        component.submitted.subscribe(a => received = a);

        component.open();
        fixture.detectChanges();
        component.onSubmitted({ goalAchieved: 'Yes', goal: ['Other'] });

        expect(received).toEqual({ goalAchieved: 'Yes', goal: ['Other'] });
        // The questionnaire shows its own success state; closing here would take it away.
        expect(component.isOpen()).toBeTrue();
    });

    it('should build a fresh questionnaire every time it is reopened', fakeAsync(() => {
        const question = () => document.querySelector('.feedback-question')?.textContent?.trim();

        component.open();
        fixture.detectChanges();
        expect(question()).toContain(FIRST_QUESTION);

        component.close();
        flush();
        fixture.detectChanges();
        // Closing takes the questionnaire with it, so nothing survives to be
        // shown again - no half-answered form, no lingering success state.
        expect(document.querySelector('appshell-feedback')).toBeNull();

        component.open();
        fixture.detectChanges();
        expect(question()).toContain(FIRST_QUESTION);
    }));

    it('should ask the default questions when the host supplies none', () => {
        expect(component.questionnaire().questions).toEqual([]);

        component.open();
        fixture.detectChanges();

        const questions = document.querySelectorAll('.feedback-question');
        expect(questions.length).toBe(1);
        expect(questions[0].textContent).toContain(FIRST_QUESTION);
    });

    it('should ask a supplied questionnaire instead', () => {
        fixture.componentRef.setInput('feedback', {
            questions: [{ id: 'q', type: 'choice', label: 'Only one?', options: ['Yes'] }]
        });
        fixture.detectChanges();

        component.open();
        fixture.detectChanges();

        expect(document.querySelector('.feedback-question')?.textContent).toContain('Only one?');
    });

    // --- saving through the host ---

    describe('with a save', () => {
        /** A save the test settles by hand. */
        const pendingSave = () => {
            let settle!: (value: unknown) => void;
            const save: AppShellFeedbackSave = () => new Promise(resolve => settle = resolve);
            return { save, settle: (v?: unknown) => settle(v) };
        };

        const answers: AppShellFeedbackAnswers = { foundIt: 'Yes' };

        beforeEach(() => {
            fixture.componentRef.setInput('feedback', {
                questions: [{ id: 'foundIt', type: 'choice', label: 'Found it?', options: ['Yes', 'No'] }]
            });
        });

        it('should hand the questionnaire a save that ends in the host\'s own', async () => {
            const received: AppShellFeedbackAnswers[] = [];
            fixture.componentRef.setInput('save', (a: AppShellFeedbackAnswers) => { received.push(a); return Promise.resolve(); });
            fixture.detectChanges();

            expect(await component.dialogSave()!(answers)).toBeTrue();
            expect(received).toEqual([answers]);
        });

        it('should report the answers once, after they are saved', async () => {
            const pending = pendingSave();
            fixture.componentRef.setInput('save', pending.save);
            fixture.detectChanges();
            const emitted: AppShellFeedbackAnswers[] = [];
            component.submitted.subscribe(a => emitted.push(a));

            const running = component.dialogSave()!(answers);
            expect(emitted).toEqual([]);
            pending.settle();
            await running;
            // The questionnaire emits too once it shows its thank-you; that must
            // not report the same answers a second time.
            component.onSubmitted(answers);

            expect(emitted).toEqual([answers]);
        });

        it('should still report saved answers when the dialog was closed while saving', fakeAsync(() => {
            const pending = pendingSave();
            fixture.componentRef.setInput('save', pending.save);
            fixture.detectChanges();
            const emitted: AppShellFeedbackAnswers[] = [];
            component.submitted.subscribe(a => emitted.push(a));

            component.open();
            fixture.detectChanges();
            const radio = document.querySelector<HTMLInputElement>('.feedback-radio')!;
            radio.click();
            fixture.detectChanges();
            document.querySelector<HTMLButtonElement>('.feedback-submit')!.click();
            fixture.detectChanges();

            component.close();
            flush();
            expect(document.querySelector('appshell-feedback')).toBeNull();

            pending.settle();
            flush();
            expect(emitted).toEqual([answers]);
        }));

        it('should not report a failed save', async () => {
            fixture.componentRef.setInput('save', () => Promise.reject(new Error('500')));
            fixture.detectChanges();
            const emitted: AppShellFeedbackAnswers[] = [];
            component.submitted.subscribe(a => emitted.push(a));

            expect(await component.dialogSave()!(answers)).toBeFalse();
            expect(emitted).toEqual([]);
        });

        it('should not report anything once the launcher itself is gone', async () => {
            const pending = pendingSave();
            fixture.componentRef.setInput('save', pending.save);
            fixture.detectChanges();
            const emitted: AppShellFeedbackAnswers[] = [];
            component.submitted.subscribe(a => emitted.push(a));

            const running = component.dialogSave()!(answers);
            fixture.destroy();
            pending.settle();

            expect(await running).toBeTrue();
            expect(emitted).toEqual([]);
        });
    });
});
