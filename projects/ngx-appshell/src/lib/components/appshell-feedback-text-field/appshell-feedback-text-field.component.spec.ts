import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellFeedbackTextFieldComponent } from './appshell-feedback-text-field.component';

describe('AppShellFeedbackTextFieldComponent', () => {
    let fixture: ComponentFixture<AppShellFeedbackTextFieldComponent>;
    let component: AppShellFeedbackTextFieldComponent;
    const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
    const textarea = (): HTMLTextAreaElement => el().querySelector('textarea.feedback-textarea')!;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [AppShellFeedbackTextFieldComponent] }).compileComponents();
        fixture = TestBed.createComponent(AppShellFeedbackTextFieldComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('fieldId', 'f-1');
    });

    it('ties its caption to the field', () => {
        fixture.componentRef.setInput('label', 'Type your answer');
        fixture.detectChanges();

        const label = el().querySelector<HTMLLabelElement>('label.feedback-field-label')!;
        expect(label.textContent?.trim()).toBe('Type your answer');
        expect(label.htmlFor).toBe('f-1');
        expect(textarea().id).toBe('f-1');
        expect(textarea().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('is named by another element when it has no caption', () => {
        fixture.componentRef.setInput('labelledBy', 'question-1');
        fixture.detectChanges();

        expect(el().querySelector('label')).toBeNull();
        expect(textarea().getAttribute('aria-labelledby')).toBe('question-1');
    });

    it('shows the counter only once the text nears its cap, as the design shows none', () => {
        fixture.componentRef.setInput('maxLength', 40);
        fixture.componentRef.setInput('value', 'x'.repeat(31));
        fixture.detectChanges();
        expect(textarea().getAttribute('maxlength')).toBe('40');
        expect(el().querySelector('.feedback-counter')).toBeNull();

        fixture.componentRef.setInput('value', 'x'.repeat(32));
        fixture.detectChanges();
        expect(el().querySelector('.feedback-counter')?.textContent?.trim()).toBe('32 / 40');

        fixture.componentRef.setInput('showCounter', false);
        fixture.detectChanges();
        expect(el().querySelector('.feedback-counter')).toBeNull();
    });

    it('renders aria-required only when it is set', () => {
        fixture.detectChanges();
        expect(textarea().hasAttribute('aria-required')).toBe(false);

        fixture.componentRef.setInput('required', true);
        fixture.detectChanges();
        expect(textarea().getAttribute('aria-required')).toBe('true');
    });

    it('reports the text after every keystroke', () => {
        fixture.detectChanges();
        const values: string[] = [];
        component.valueChange.subscribe(v => values.push(v));

        textarea().value = 'Hi';
        textarea().dispatchEvent(new Event('input'));

        expect(values).toEqual(['Hi']);
    });
});
