import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APPSHELL_FEEDBACK_STANDARD_QUESTIONS, AppShellFeedbackComponent } from './appshell-feedback.component';
import { AppShellFeedback, AppShellFeedbackAnswers, AppShellFeedbackQuestion } from '../../models/appshell-feedback';

const CUSTOM: AppShellFeedback = {
    title: 'Two quick questions',
    productName: 'Data Hub',
    questions: [
        { id: 'mood', type: 'choice', label: 'How did {product} go?', options: ['Well', 'Badly'] },
        { id: 'why', type: 'text', label: 'Why?', required: false, maxLength: 40 }
    ]
};

/** The four standard steps plus an optional, product-specific fifth one. */
const FIVE_STEPS = (defaults: AppShellFeedbackQuestion[]): AppShellFeedback => ({
    productName: 'Onboarding Hub',
    questions: [
        ...defaults,
        {
            id: 'productQuestion',
            type: 'choice',
            label: 'Which data product were you looking for?',
            required: false,
            options: ['Customer 360', 'Not listed']
        }
    ]
});

describe('AppShellFeedbackComponent', () => {
    let component: AppShellFeedbackComponent;
    let fixture: ComponentFixture<AppShellFeedbackComponent>;

    const byId = (id: string) => component.questions().find(q => q.id === id)!;

    /** Answers the four standard steps, leaving the questionnaire on the last one. */
    const answerStandardSteps = () => {
        component.toggle(byId('goal'), 'Find a data product', true);
        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();
        component.answer(byId('satisfaction'), '4');
        component.next();
        component.answer(byId('ratingReason'), 'Quick and clear');
    };

    const submitAndCapture = (): AppShellFeedbackAnswers[] => {
        const emitted: AppShellFeedbackAnswers[] = [];
        component.submitted.subscribe(a => emitted.push(a));
        component.submit();
        return emitted;
    };

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

    // --- the standard questionnaire ---

    it('should ask the four standard steps in order when none are supplied', () => {
        expect(component.questions().map(q => [q.id, q.type])).toEqual([
            ['goal', 'multiple'],
            ['goalAchieved', 'choice'],
            ['satisfaction', 'scale'],
            ['ratingReason', 'text']
        ]);
    });

    it('should word the standard steps as designed', () => {
        expect(byId('goal').label).toBe('What did you come here to do today?');
        expect(byId('goal').options).toEqual([
            'Create a support ticket',
            'Find a data product',
            'Request access to data products',
            'Check status on test executions',
            'Discover learning activities',
            'Other'
        ]);
        expect(byId('goalAchieved').options).toEqual(['Yes', 'Partially', 'No']);
        expect(byId('ratingReason').label).toBe('What is the main reason for your rating?');
        expect(byId('ratingReason').inputLabel).toBe('Type your answer');
    });

    it('should count four steps and make the fourth the one that submits', () => {
        expect(component.progress()).toBe('Step 1 of 4');
        expect(component.isFirst()).toBeTrue();
        component.toggle(byId('goal'), 'Other', true);
        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();
        component.answer(byId('satisfaction'), '3');
        component.next();
        expect(component.progress()).toBe('Step 4 of 4');
        expect(component.isLast()).toBeTrue();
    });

    it('should fall back to the standard steps when the supplied list is empty', () => {
        fixture.componentRef.setInput('feedback', { questions: [], productName: 'Onboarding Hub' });
        fixture.detectChanges();
        expect(component.total()).toBe(4);
        expect(component.text().productName).toBe('Onboarding Hub');
    });

    it('should ask the supplied questions instead of the defaults', () => {
        fixture.componentRef.setInput('feedback', CUSTOM);
        fixture.detectChanges();
        expect(component.questions().map(q => q.id)).toEqual(['mood', 'why']);
        expect(component.text().title).toBe('Two quick questions');
        expect(component.progress()).toBe('Step 1 of 2');
    });

    // --- the step indicator ---

    it('should split the step indicator so the current step can be bold', () => {
        expect(component.progressParts()).toEqual({ strong: 'Step 1', rest: ' of 4' });
    });

    it('should split a translated step indicator at its own current step', () => {
        fixture.componentRef.setInput('feedback', { questions: [], progressLabel: 'Paso {current} de {total}' });
        fixture.detectChanges();
        expect(component.progressParts()).toEqual({ strong: 'Paso 1', rest: ' de 4' });
        expect(component.progress()).toBe('Paso 1 de 4');
    });

    it('should show a step indicator without a current step entirely in regular weight', () => {
        fixture.componentRef.setInput('feedback', { questions: [], progressLabel: '{total} questions' });
        fixture.detectChanges();
        expect(component.progressParts()).toEqual({ strong: '', rest: '4 questions' });
    });

    // --- the product name ---

    it('should rate "this product" when the host names none', () => {
        component.toggle(byId('goal'), 'Other', true);
        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();
        expect(component.currentLabel()).toBe('How satisfied were you with this product?');
        expect(component.text().successTitle).toBe('Thank you!');
        expect(component.text().successMessage).toBe('Your feedback helps us shape the future of this product.');
    });

    it('should put the host product name wherever {product} is written', () => {
        fixture.componentRef.setInput('feedback', CUSTOM);
        fixture.detectChanges();
        expect(component.currentLabel()).toBe('How did Data Hub go?');
        expect(component.text().successMessage).toBe('Your feedback helps us shape the future of Data Hub.');
    });

    it('should leave the raw question untouched while replacing the product on screen', () => {
        fixture.componentRef.setInput('feedback', CUSTOM);
        fixture.detectChanges();
        expect(component.current().label).toBe('How did {product} go?');
    });

    // --- required questions ---

    it('should treat a question as required unless it says otherwise', () => {
        expect(component.currentRequired()).toBeTrue();
        expect(component.currentUnanswered()).toBeTrue();
    });

    it('should not move on while a required question is unanswered', () => {
        component.next();
        expect(component.index()).toBe(0);

        component.toggle(byId('goal'), 'Create a support ticket', true);
        component.next();
        expect(component.index()).toBe(1);
    });

    it('should treat an answer of only spaces as no answer', () => {
        answerStandardSteps();
        component.answer(byId('ratingReason'), '   ');
        expect(component.currentUnanswered()).toBeTrue();
        expect(component.canSubmit()).toBeFalse();
    });

    // --- multiple answers ---

    it('should keep ticked options in the order they are offered', () => {
        const goal = byId('goal');
        component.toggle(goal, 'Other', true);
        component.toggle(goal, 'Create a support ticket', true);
        component.toggle(goal, 'Find a data product', true);
        expect(component.currentAnswer()).toEqual(['Create a support ticket', 'Find a data product', 'Other']);
        expect(component.isSelected(goal, 'Other')).toBeTrue();
        expect(component.isSelected(goal, 'Discover learning activities')).toBeFalse();
    });

    it('should forget the answer once every option is unticked again', () => {
        const goal = byId('goal');
        component.toggle(goal, 'Other', true);
        component.toggle(goal, 'Other', false);
        expect(component.currentAnswer()).toBeUndefined();
        expect(component.currentUnanswered()).toBeTrue();
    });

    // --- follow-up fields ---

    it('should open the follow-up only while its option is ticked', () => {
        const goal = byId('goal');
        expect(component.currentFollowUp()).toBeUndefined();

        component.toggle(goal, 'Other', true);
        expect(component.currentFollowUp()?.label).toBe('What was it?');

        component.toggle(goal, 'Other', false);
        expect(component.currentFollowUp()).toBeUndefined();
    });

    it('should let the person go on without filling in the follow-up', () => {
        component.toggle(byId('goal'), 'Other', true);
        expect(component.currentUnanswered()).toBeFalse();
        component.next();
        expect(component.index()).toBe(1);
    });

    it('should emit a follow-up under its own id', () => {
        const goal = byId('goal');
        component.toggle(goal, 'Other', true);
        component.answerFollowUp(goal, 'Browse the catalogue');
        expect(component.followUpText()).toBe('Browse the catalogue');

        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();
        component.answer(byId('satisfaction'), '5');
        component.next();
        component.answer(byId('ratingReason'), 'Fast');

        const [answers] = submitAndCapture();
        expect(answers['goalOther']).toBe('Browse the catalogue');
    });

    it('should drop a follow-up once its ticked option is unticked', () => {
        const goal = byId('goal');
        component.toggle(goal, 'Other', true);
        component.answerFollowUp(goal, 'Something else');
        component.toggle(goal, 'Find a data product', true);
        component.toggle(goal, 'Other', false);
        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();
        component.answer(byId('satisfaction'), '5');
        component.next();
        component.answer(byId('ratingReason'), 'Fast');

        const [answers] = submitAndCapture();
        expect('goalOther' in answers).toBeFalse();
        expect(answers['goal']).toEqual(['Find a data product']);
    });

    it('should open the follow-up of a single choice on its option, and drop it on another', () => {
        component.toggle(byId('goal'), 'Other', true);
        component.next();
        const achieved = byId('goalAchieved');

        component.answer(achieved, 'No');
        expect(component.currentFollowUp()?.label).toBe('What prevented you from achieving it?');
        component.answerFollowUp(achieved, 'No access');

        component.answer(achieved, 'Partially');
        expect(component.currentFollowUp()).toBeUndefined();

        component.answer(achieved, 'No');
        expect(component.followUpText()).toBe('');
    });

    it('should name a follow-up after its question when it has no id of its own', () => {
        const question: AppShellFeedbackQuestion = {
            id: 'reached',
            type: 'choice',
            label: 'Did you get there?',
            options: ['Yes', 'No'],
            followUp: { option: 'No', label: 'What stopped you?' }
        };
        fixture.componentRef.setInput('feedback', { questions: [question] });
        fixture.detectChanges();

        component.answer(question, 'No');
        component.answerFollowUp(question, 'A broken link');
        const [answers] = submitAndCapture();

        expect(component.followUpId(question, question.followUp!)).toBe('reachedDetail');
        expect(answers).toEqual({ reached: 'No', reachedDetail: 'A broken link' });
    });

    it('should forget a follow-up cleared back to nothing', () => {
        const goal = byId('goal');
        component.toggle(goal, 'Other', true);
        component.answerFollowUp(goal, 'Something');
        component.answerFollowUp(goal, '  ');
        expect(component.followUpText()).toBe('');
    });

    // --- the satisfaction scale ---

    it('should offer the whole range of the scale, each point with its own label', () => {
        component.toggle(byId('goal'), 'Other', true);
        component.next();
        component.answer(byId('goalAchieved'), 'Yes');
        component.next();

        const satisfaction = component.current();
        expect(component.currentOptions()).toEqual(['1', '2', '3', '4', '5']);
        expect([0, 1, 2, 3, 4].map(i => component.scaleLabel(satisfaction, i, 5))).toEqual([
            'Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'
        ]);
    });

    it('should label only the ends of a scale that names only its ends', () => {
        const scale: AppShellFeedbackQuestion = {
            id: 'effort', type: 'scale', label: 'Effort?', min: 1, max: 3, minLabel: 'Low', maxLabel: 'High'
        };
        expect([0, 1, 2].map(i => component.scaleLabel(scale, i, 3))).toEqual(['Low', '', 'High']);
    });

    it('should keep a scale point selected as text while answering', () => {
        const satisfaction = byId('satisfaction');
        component.answer(satisfaction, 4);
        expect(component.isSelected(satisfaction, '4')).toBeTrue();
    });

    // --- navigation ---

    it('should keep an answer when navigating away and back', () => {
        component.toggle(byId('goal'), 'Find a data product', true);
        component.next();
        component.answer(byId('goalAchieved'), 'Partially');
        component.back();
        component.next();
        expect(component.currentAnswer()).toBe('Partially');
    });

    it('should not go back from the first step', () => {
        component.back();
        expect(component.index()).toBe(0);
    });

    it('should report a dismissal to the host', () => {
        let dismissed = 0;
        component.dismissed.subscribe(() => dismissed++);
        component.dismiss();
        expect(dismissed).toBe(1);
    });

    it('should count characters of the text answer for its counter', () => {
        answerStandardSteps();
        expect(component.textLength()).toBe('Quick and clear'.length);
    });

    // --- submitting ---

    it('should not submit while a required question is unanswered', () => {
        const emitted = submitAndCapture();
        expect(emitted.length).toBe(0);
        expect(component.done()).toBeFalse();
    });

    it('should emit the scale as a number and the multiple answer as a list', () => {
        answerStandardSteps();
        const emitted = submitAndCapture();

        expect(emitted.length).toBe(1);
        expect(emitted[0]).toEqual({
            goal: ['Find a data product'],
            goalAchieved: 'Yes',
            satisfaction: 4,
            ratingReason: 'Quick and clear'
        });
        expect(component.done()).toBeTrue();
    });

    it('should emit only answers to questions in this questionnaire', () => {
        const stray: AppShellFeedbackQuestion = { id: 'stray', type: 'text', label: 'Not asked' };
        component.answer(stray, 'should not travel');
        answerStandardSteps();

        const [answers] = submitAndCapture();
        expect('stray' in answers).toBeFalse();
    });

    it('should submit a fifth, optional product question left unanswered', () => {
        const standard = component.questions();
        fixture.componentRef.setInput('feedback', FIVE_STEPS(standard));
        fixture.detectChanges();

        answerStandardSteps();
        component.next();
        expect(component.progress()).toBe('Step 5 of 5');
        expect(component.currentRequired()).toBeFalse();
        expect(component.canSubmit()).toBeTrue();

        const [answers] = submitAndCapture();
        expect('productQuestion' in answers).toBeFalse();
        expect(answers['satisfaction']).toBe(4);
    });

    it('should append productQuestion as an optional fifth step after the standard four', () => {
        fixture.componentRef.setInput('feedback', {
            questions: [],
            productQuestion: { id: 'dataProduct', type: 'text', label: 'Which data product?' }
        });
        fixture.detectChanges();

        expect(component.total()).toBe(5);
        const last = component.questions().at(-1)!;
        expect(last.id).toBe('dataProduct');
        expect(last.required).toBeFalse();
        answerStandardSteps();
        component.next();
        expect(component.isLast()).toBeTrue();
        expect(component.canSubmit()).toBeTrue();
    });

    it('should keep productQuestion mandatory when it says so', () => {
        fixture.componentRef.setInput('feedback', {
            questions: [],
            productQuestion: { id: 'dataProduct', type: 'text', label: 'Which data product?', required: true }
        });
        fixture.detectChanges();

        answerStandardSteps();
        expect(component.canSubmit()).toBeFalse();
    });

    it('should let a product keep the standard steps and change only its own goals', () => {
        const questions = APPSHELL_FEEDBACK_STANDARD_QUESTIONS.map(q =>
            q.id === 'goal' ? { ...q, options: ['Book a room', 'Other'] } : q);
        fixture.componentRef.setInput('feedback', { questions, productName: 'Rooms' });
        fixture.detectChanges();

        expect(component.total()).toBe(4);
        expect(component.currentOptions()).toEqual(['Book a room', 'Other']);
        // The follow-up of the standard step still works with the product's options.
        component.toggle(component.current(), 'Other', true);
        expect(component.currentFollowUp()?.label).toBe('What was it?');
        // And the export itself cannot be changed by accident.
        expect(Object.isFrozen(APPSHELL_FEEDBACK_STANDARD_QUESTIONS)).toBeTrue();
        expect(Object.isFrozen(APPSHELL_FEEDBACK_STANDARD_QUESTIONS[0])).toBeTrue();
        expect(APPSHELL_FEEDBACK_STANDARD_QUESTIONS[0].options).toContain('Create a support ticket');
    });

    // --- rendering ---

    describe('rendering', () => {
        const el = () => fixture.nativeElement as HTMLElement;

        it('should show the current step in bold before the total', () => {
            const progress = el().querySelector('.feedback-progress');
            expect(progress?.querySelector('strong')?.textContent?.trim()).toBe('Step 1');
            expect(progress?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Step 1 of 4');
        });

        it('should mark a required question with an asterisk', () => {
            expect(el().querySelector('.feedback-question')?.textContent).toContain('What did you come here to do today?');
            expect(el().querySelector('.feedback-required')).not.toBeNull();
        });

        it('should render the goals as checkboxes and hide Back on the first step', () => {
            expect(el().querySelectorAll('input[type=checkbox]').length).toBe(6);
            expect(el().querySelector('.feedback-back')).toBeNull();
            expect((el().querySelector('.feedback-next') as HTMLButtonElement).disabled).toBeTrue();
        });

        it('should open the follow-up field when Other is ticked', () => {
            expect(el().querySelector('.feedback-followup textarea')).toBeNull();
            component.toggle(byId('goal'), 'Other', true);
            fixture.detectChanges();
            expect(el().querySelector('.feedback-followup textarea')).not.toBeNull();
            expect((el().querySelector('.feedback-next') as HTMLButtonElement).disabled).toBeFalse();
        });

        it('should render the achievement question as radio buttons with Back', () => {
            component.toggle(byId('goal'), 'Other', true);
            component.next();
            fixture.detectChanges();
            expect(el().querySelectorAll('input[type=radio]').length).toBe(3);
            expect(el().querySelector('.feedback-back')).not.toBeNull();
        });

        it('should show Submit instead of Next on the last step', () => {
            answerStandardSteps();
            fixture.detectChanges();
            expect(el().querySelector('.feedback-next')).toBeNull();
            expect(el().querySelector('.feedback-submit')).not.toBeNull();
        });

        it('should thank the person and offer to close once submitted', () => {
            answerStandardSteps();
            component.submit();
            fixture.detectChanges();
            expect(el().querySelector('.feedback-success-title')?.textContent?.trim()).toBe('Thank you!');
            expect(el().querySelector('.feedback-close')).not.toBeNull();
            expect(el().querySelector('.feedback-dismiss')).not.toBeNull();
        });

        it('should keep ids and radio groups apart when two questionnaires share a page', () => {
            const other = TestBed.createComponent(AppShellFeedbackComponent);
            other.detectChanges();
            for (const f of [fixture, other]) {
                f.componentInstance.answer(f.componentInstance.current(), undefined);
                f.componentInstance.toggle(f.componentInstance.current(), 'Other', true);
                f.componentInstance.next();
                f.detectChanges();
            }

            expect(component.uid).not.toBe(other.componentInstance.uid);
            const names = [fixture, other].map(f =>
                (f.nativeElement as HTMLElement).querySelector('input[type=radio]')?.getAttribute('name'));
            expect(names[0]).toBeTruthy();
            expect(names[0]).not.toBe(names[1]);
            const legendIds = [fixture, other].map(f =>
                (f.nativeElement as HTMLElement).querySelector('.feedback-question')?.id);
            expect(legendIds[0]).not.toBe(legendIds[1]);
        });
    });
});
