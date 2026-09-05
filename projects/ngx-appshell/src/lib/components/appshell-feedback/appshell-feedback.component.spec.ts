import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppShellFeedbackComponent } from './appshell-feedback.component';
import { AppShellFeedback } from '../../models/appshell-feedback';

const CUSTOM: AppShellFeedback = {
    title: 'Two quick questions',
    questions: [
        { id: 'mood', type: 'choice', label: 'How did it go?', options: ['Well', 'Badly'] },
        { id: 'why', type: 'text', label: 'Why?', required: false, maxLength: 40 }
    ]
};

describe('AppShellFeedbackComponent', () => {
    let component: AppShellFeedbackComponent;
    let fixture: ComponentFixture<AppShellFeedbackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppShellFeedbackComponent],
            providers: [provideAnimationsAsync()],
        }).compileComponents();

        fixture = TestBed.createComponent(AppShellFeedbackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // --- default questionnaire ---

    it('should ask the five default questions in order when none are supplied', () => {
        expect(component.questions().map(q => q.id)).toEqual([
            'taskSuccess', 'perceivedEfficiency', 'clarityOfGuidance', 'recommendationIntent', 'comment'
        ]);
    });

    it('should word the default questions as agreed', () => {
        const labels = component.questions().map(q => q.label);
        expect(labels[0]).toBe('Did you achieve what you came for today?');
        expect(labels[3]).toBe('Would you recommend this tool to a teammate?');
    });

    it('should offer the whole range for a scale question', () => {
        component.next();
        expect(component.currentOptions()).toEqual(['1', '2', '3', '4', '5']);
    });

    it('should treat the free-text question as optional and capped', () => {
        const comment = component.questions()[4];
        expect(comment.required).toBeFalse();
        expect(comment.maxLength).toBe(500);
    });

    // --- a supplied questionnaire replaces the default ---

    it('should ask the supplied questions instead of the defaults', () => {
        fixture.componentRef.setInput('feedback', CUSTOM);
        fixture.detectChanges();
        expect(component.questions().map(q => q.id)).toEqual(['mood', 'why']);
        expect(component.text().title).toBe('Two quick questions');
    });

    it('should fall back to the defaults when the supplied list is empty', () => {
        fixture.componentRef.setInput('feedback', { questions: [] });
        fixture.detectChanges();
        expect(component.questions().length).toBe(5);
    });

    // --- navigation ---

    it('should keep an answer when navigating away and back', () => {
        component.answer(component.current(), 'Yes');
        component.next();
        component.back();
        expect(component.currentAnswer()).toBe('Yes');
    });

    it('should not move past the ends', () => {
        component.back();
        expect(component.index()).toBe(0);
        for (let i = 0; i < 10; i++) {
            component.next();
        }
        expect(component.index()).toBe(component.total() - 1);
    });

    it('should count the steps in the progress line', () => {
        component.next();
        expect(component.progress()).toBe('Question 2 of 5');
    });

    // --- validation ---

    it('should hold the step back until a mandatory question is answered', () => {
        expect(component.currentUnanswered()).toBeTrue();
        component.answer(component.current(), 'Yes');
        expect(component.currentUnanswered()).toBeFalse();
    });

    it('should let an optional question through unanswered', () => {
        fixture.componentRef.setInput('feedback', CUSTOM);
        fixture.detectChanges();
        component.next();
        expect(component.currentUnanswered()).toBeFalse();
    });

    it('should refuse to submit until every mandatory question has an answer', () => {
        expect(component.canSubmit()).toBeFalse();
        answerEveryMandatoryQuestion();
        expect(component.canSubmit()).toBeTrue();
    });

    it('should treat whitespace as no answer at all', () => {
        component.answer(component.current(), '   ');
        expect(component.currentUnanswered()).toBeTrue();
    });

    // --- emitting ---

    it('should emit every answer under its question id, and send nothing itself', () => {
        let emitted: Record<string, string | number> | undefined;
        component.submitted.subscribe(a => emitted = a);

        answerEveryMandatoryQuestion();
        component.answer(component.questions()[4], 'More keyboard shortcuts');
        component.submit();

        expect(emitted).toEqual({
            taskSuccess: 'Yes',
            perceivedEfficiency: 4,
            clarityOfGuidance: 5,
            recommendationIntent: 'Maybe',
            comment: 'More keyboard shortcuts'
        });
    });

    it('should record a scale answer as a number and a choice as its text', () => {
        answerEveryMandatoryQuestion();
        component.submit();
        component.submitted.subscribe(a => {
            expect(typeof a['perceivedEfficiency']).toBe('number');
            expect(typeof a['taskSuccess']).toBe('string');
        });
    });

    it('should show the success state after submitting', () => {
        expect(component.done()).toBeFalse();
        answerEveryMandatoryQuestion();
        component.submit();
        expect(component.done()).toBeTrue();
    });

    it('should not emit or finish when a mandatory answer is missing', () => {
        let emitted = false;
        component.submitted.subscribe(() => emitted = true);
        component.submit();
        expect(emitted).toBeFalse();
        expect(component.done()).toBeFalse();
    });

    it('should drop an answer that is cleared again', () => {
        const question = component.current();
        component.answer(question, 'Yes');
        component.answer(question, undefined);
        expect(component.currentAnswer()).toBeUndefined();
    });

    it('should take the first value when the chip listbox reports an array', () => {
        component.onSelectionChange(component.current(), ['Partially']);
        expect(component.currentAnswer()).toBe('Partially');
    });

    it('should emit dismissed without submitting anything', () => {
        let dismissed = false;
        let emitted = false;
        component.dismissed.subscribe(() => dismissed = true);
        component.submitted.subscribe(() => emitted = true);

        component.dismiss();

        expect(dismissed).toBeTrue();
        expect(emitted).toBeFalse();
    });

    function answerEveryMandatoryQuestion(): void {
        const questions = component.questions();
        component.answer(questions[0], 'Yes');
        component.answer(questions[1], 4);
        component.answer(questions[2], 5);
        component.answer(questions[3], 'Maybe');
    }
});
