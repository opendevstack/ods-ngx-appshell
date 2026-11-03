import {
    afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, input, output, signal, ViewChild, ViewEncapsulation
} from '@angular/core';
import {
    AppShellFeedback,
    AppShellFeedbackAnswers,
    AppShellFeedbackFollowUp,
    AppShellFeedbackQuestion,
    AppShellFeedbackSave
} from '../../models/appshell-feedback';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';
import { AppShellFeedbackOptionsComponent, appShellFeedbackScaleLabel } from '../appshell-feedback-options/appshell-feedback-options.component';
import { AppShellFeedbackTextFieldComponent } from '../appshell-feedback-text-field/appshell-feedback-text-field.component';
import { runFeedbackSave } from './run-feedback-save';

/**
 * The standard four steps: what the person came to do, whether they managed it,
 * how satisfied they are (the CSAT score) and why. A fifth, product-specific
 * question is the host's to add with `productQuestion`.
 *
 * Exported, frozen, so a product can keep the standard steps and change only
 * what is its own — typically the goals offered in step 1:
 *
 *     questions: APPSHELL_FEEDBACK_STANDARD_QUESTIONS.map(q =>
 *         q.id === 'goal' ? { ...q, options: ['Book a room', 'Other'] } : q)
 */
const DEFAULT_QUESTIONS: AppShellFeedbackQuestion[] = [
    {
        id: 'goal',
        type: 'multiple',
        label: 'What did you come here to do today?',
        options: [
            'Create a support ticket',
            'Find a data product',
            'Request access to data products',
            'Check status on test executions',
            'Discover learning activities',
            'Other'
        ],
        followUp: { option: 'Other', id: 'goalOther', label: 'What was it?', placeholder: 'Describe it briefly', maxLength: 500 }
    },
    {
        id: 'goalAchieved',
        type: 'choice',
        label: 'Were you able to achieve it?',
        options: ['Yes', 'Partially', 'No'],
        followUp: { option: 'No', id: 'goalBlocker', label: 'What prevented you from achieving it?', maxLength: 1000 }
    },
    {
        id: 'satisfaction',
        type: 'scale',
        label: 'How satisfied were you with {product}?',
        min: 1,
        max: 5,
        optionLabels: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied']
    },
    {
        id: 'ratingReason',
        type: 'text',
        label: 'What is the main reason for your rating?',
        inputLabel: 'Type your answer',
        maxLength: 1000
    }
];

export const APPSHELL_FEEDBACK_STANDARD_QUESTIONS: readonly Readonly<AppShellFeedbackQuestion>[] =
    Object.freeze(DEFAULT_QUESTIONS.map(q => Object.freeze({ ...q })));

const DEFAULTS: Required<Omit<AppShellFeedback, 'questions' | 'title' | 'subtitle' | 'productQuestion'>> = {
    productName: 'this product',
    progressLabel: 'Step {current} of {total}',
    backLabel: 'Back',
    nextLabel: 'Next',
    submitLabel: 'Submit',
    requiredLabel: 'required',
    successTitle: 'Thank you!',
    successMessage: 'Your feedback helps us shape the future of {product}.',
    closeLabel: 'Close',
    sendingLabel: 'Sending…',
    errorMessage: 'Your feedback could not be sent. Please try again.',
    retryLabel: 'Try again'
};

type StoredAnswer = string | string[];

/**
 * Where the questionnaire stands: being answered, waiting for `save`, back on
 * the last step after `save` failed, or thanking the person.
 */
type FeedbackStatus = 'answering' | 'sending' | 'failed' | 'done';

/** Several questionnaires can share a page; ids and radio names must not collide. */
let nextInstanceId = 0;

/**
 * A questionnaire that asks one question at a time.
 *
 * The component collects answers and emits them; it never sends them anywhere.
 * Where they go, and whether this person should have been asked at all, depend
 * on the host application's own storage and identity, so both stay with the host.
 *
 * A host that passes `save` lets the questionnaire wait for the answers to be
 * stored: the thank-you appears only once they are, and a failed save leaves
 * the person on the last step with an error and a way to send them again.
 */
@Component({
    selector: 'appshell-feedback',
    // The answers are drawn by two presentational pieces of their own: the
    // checkbox, radio and scale lists, and the free-text field.
    imports: [AppShellIconComponent, AppShellFeedbackOptionsComponent, AppShellFeedbackTextFieldComponent],
    templateUrl: './appshell-feedback.component.html',
    styleUrl: './appshell-feedback.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellFeedbackComponent {

    /** Questionnaire and wording. Omit it to ask the four standard questions. */
    feedback = input<AppShellFeedback>({ questions: DEFAULT_QUESTIONS });

    /**
     * Stores the answers before the thank-you appears. Without it the answers
     * are emitted and the thank-you shows at once, whatever the host does next.
     */
    save = input<AppShellFeedbackSave>();

    /**
     * Answers, keyed by question id, emitted once the questionnaire is
     * finished: on submit, or once `save` has succeeded when there is one.
     */
    submitted = output<AppShellFeedbackAnswers>();
    /** The person closed the questionnaire, before or after answering it. */
    dismissed = output<void>();

    @ViewChild('questionHeading') questionHeadingEl?: ElementRef<HTMLElement>;
    @ViewChild('successHeading') successHeadingEl?: ElementRef<HTMLElement>;

    private readonly injector = inject(Injector);

    /** Prefix for element ids and radio group names, unique per instance. */
    readonly uid = `appshell-feedback-${nextInstanceId++}`;

    private readonly _index = signal(0);
    private readonly _answers = signal<Record<string, StoredAnswer>>({});
    private readonly _status = signal<FeedbackStatus>('answering');

    // A save still running when the questionnaire goes, e.g. its dialog closed,
    // must not emit on an output that no longer exists (NG0953).
    private destroyed = false;

    constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
    }

    readonly questions = computed(() => {
        const { questions: supplied, productQuestion } = this.feedback();
        const base = supplied && supplied.length > 0 ? supplied : DEFAULT_QUESTIONS;
        // The product-specific step is optional to answer unless it says otherwise.
        return productQuestion ? [...base, { required: false, ...productQuestion }] : base;
    });

    /** Every string, defaults filled in and `{product}` already replaced. */
    readonly text = computed(() => {
        const merged = { ...DEFAULTS, ...this.feedback() };
        const product = merged.productName;
        return {
            ...merged,
            title: merged.title ? this.withProduct(merged.title, product) : undefined,
            subtitle: merged.subtitle ? this.withProduct(merged.subtitle, product) : undefined,
            successTitle: this.withProduct(merged.successTitle, product),
            successMessage: this.withProduct(merged.successMessage, product),
            errorMessage: this.withProduct(merged.errorMessage, product)
        };
    });

    readonly index = this._index.asReadonly();
    readonly status = this._status.asReadonly();
    readonly done = computed(() => this._status() === 'done');
    /** `save` is running: the submit button waits and says so. */
    readonly sending = computed(() => this._status() === 'sending');
    /** `save` failed: the answers are still here to send again. */
    readonly failed = computed(() => this._status() === 'failed');

    /** Submit's wording: Submit, Sending… while saving, Try again after a failure. */
    readonly submitText = computed(() => {
        const text = this.text();
        if (this.sending()) {
            return text.sendingLabel;
        }
        return this.failed() ? text.retryLabel : text.submitLabel;
    });

    readonly current = computed(() => this.questions()[this._index()]);
    readonly total = computed(() => this.questions().length);
    readonly isFirst = computed(() => this._index() === 0);
    readonly isLast = computed(() => this._index() === this.total() - 1);

    /** The question on screen, with `{product}` replaced. */
    readonly currentLabel = computed(() => this.withProduct(this.current()?.label ?? '', this.text().productName));
    readonly currentRequired = computed(() => this.current()?.required !== false);

    /** "Step 1 of 5", split so the first part can be bold. */
    readonly progressParts = computed(() => {
        const template = this.text().progressLabel;
        const current = String(this._index() + 1);
        const total = String(this.total());
        const at = template.indexOf('{current}');
        if (at < 0) {
            return { strong: '', rest: template.replace('{total}', total) };
        }
        return {
            strong: template.slice(0, at + '{current}'.length).replace('{current}', current),
            rest: template.slice(at + '{current}'.length).replace('{total}', total)
        };
    });

    readonly progress = computed(() => this.progressParts().strong + this.progressParts().rest);

    /** Options of a choice or multiple question, or the points of a scale. */
    readonly currentOptions = computed<string[]>(() => {
        const q = this.current();
        if (!q) {
            return [];
        }
        if (q.type === 'choice' || q.type === 'multiple') {
            return q.options ?? [];
        }
        if (q.type === 'scale') {
            const min = q.min ?? 1;
            const max = q.max ?? 5;
            return Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => String(min + i));
        }
        return [];
    });

    /** The answer already given to the question on screen, if any. */
    readonly currentAnswer = computed(() => {
        const q = this.current();
        return q ? this._answers()[q.id] : undefined;
    });

    /** The text answer on screen, empty until something is typed. */
    readonly textAnswer = computed(() => {
        const answer = this.currentAnswer();
        return typeof answer === 'string' ? answer : '';
    });

    /** Characters typed in the text answer on screen, for its counter. */
    readonly textLength = computed(() => this.textAnswer().length);

    /** The follow-up field of the question on screen, while its option is picked. */
    readonly currentFollowUp = computed<AppShellFeedbackFollowUp | undefined>(() => {
        const q = this.current();
        return q?.followUp && this.isSelected(q, q.followUp.option) ? q.followUp : undefined;
    });

    readonly followUpText = computed(() => {
        const q = this.current();
        const followUp = this.currentFollowUp();
        if (!q || !followUp) {
            return '';
        }
        const value = this._answers()[this.followUpId(q, followUp)];
        return typeof value === 'string' ? value : '';
    });

    /** True while the question on screen still needs an answer. */
    readonly currentUnanswered = computed(() => {
        const q = this.current();
        return !!q && q.required !== false && !this.hasAnswer(this._answers()[q.id]);
    });

    /** Every mandatory question has an answer, wherever the person is standing. */
    readonly canSubmit = computed(() => {
        const answers = this._answers();
        return this.questions()
            .filter(q => q.required !== false)
            .every(q => this.hasAnswer(answers[q.id]));
    });

    /** Label of one point of a scale: its own label, or the end labels on the ends. */
    scaleLabel(question: AppShellFeedbackQuestion, pointIndex: number, pointCount: number): string {
        return appShellFeedbackScaleLabel(question, pointIndex, pointCount);
    }

    isSelected(question: AppShellFeedbackQuestion, option: string): boolean {
        const answer = this._answers()[question.id];
        return Array.isArray(answer) ? answer.includes(option) : answer === option;
    }

    /**
     * Records the answer to a `choice`, `scale` or `text` question without
     * moving: navigating back must find it again. Answers are held as text,
     * scale points included, and become numbers on the way out, in `submit`.
     */
    answer(question: AppShellFeedbackQuestion, value: string | number | undefined | null): void {
        const next = { ...this._answers() };
        if (value === undefined || value === null || String(value).trim() === '') {
            delete next[question.id];
        } else {
            next[question.id] = String(value);
        }
        this._answers.set(this.withoutStaleFollowUp(question, next));
    }

    /** Ticks or unticks one option of a `multiple` question, keeping the options' order. */
    toggle(question: AppShellFeedbackQuestion, option: string, checked: boolean): void {
        const current = this._answers()[question.id];
        const picked = new Set(Array.isArray(current) ? current : []);
        if (checked) {
            picked.add(option);
        } else {
            picked.delete(option);
        }
        const ordered = (question.options ?? []).filter(o => picked.has(o));
        const next = { ...this._answers() };
        if (ordered.length) {
            next[question.id] = ordered;
        } else {
            delete next[question.id];
        }
        this._answers.set(this.withoutStaleFollowUp(question, next));
    }

    answerFollowUp(question: AppShellFeedbackQuestion, value: string): void {
        if (!question.followUp) {
            return;
        }
        const key = this.followUpId(question, question.followUp);
        const next = { ...this._answers() };
        if (value.trim() === '') {
            delete next[key];
        } else {
            next[key] = value;
        }
        this._answers.set(next);
    }

    followUpId(question: AppShellFeedbackQuestion, followUp: AppShellFeedbackFollowUp): string {
        return followUp.id ?? `${question.id}Detail`;
    }

    next(): void {
        if (!this.isLast() && !this.currentUnanswered()) {
            this._index.set(this._index() + 1);
            this.focusQuestion();
        }
    }

    back(): void {
        if (!this.isFirst() && !this.sending()) {
            // The error belongs to the last step; going back to change an
            // answer leaves it behind, and the next submit tries afresh.
            this._status.set('answering');
            this._index.set(this._index() - 1);
            this.focusQuestion();
        }
    }

    /**
     * Without `save`, emits the answers and thanks the person straight away.
     * With it, waits for the save: thanks the person once it succeeds, or stays
     * on the last step with an error when it fails. A second press while the
     * save is running does nothing.
     */
    async submit(): Promise<void> {
        if (!this.canSubmit() || this.sending()) {
            return;
        }
        const answers = this.answersForEmission();
        const save = this.save();
        if (!save) {
            this.finish(answers);
            return;
        }
        this._status.set('sending');
        const saved = await runFeedbackSave(save, answers);
        if (this.destroyed) {
            return;
        }
        if (saved) {
            this.finish(answers);
        } else {
            this._status.set('failed');
        }
    }

    dismiss(): void {
        this.dismissed.emit();
    }

    /**
     * Emits the answers and shows the thank-you. Focus goes to its heading:
     * the submit button that held it is gone, and left alone the keyboard
     * would fall back to the page behind the questionnaire.
     */
    private finish(answers: AppShellFeedbackAnswers): void {
        this.submitted.emit(answers);
        this._status.set('done');
        afterNextRender(() => this.successHeadingEl?.nativeElement.focus(), { injector: this.injector });
    }

    /**
     * Move focus to the question that just appeared.
     *
     * Without this the keyboard stays on the button that was pressed, so someone
     * tabbing through has to walk backwards to reach the answers, and a screen
     * reader says nothing at all about the new question. The heading takes focus
     * only programmatically, so it never joins the tab order itself.
     */
    private focusQuestion(): void {
        queueMicrotask(() => this.questionHeadingEl?.nativeElement.focus());
    }

    private withProduct(text: string, product: string): string {
        return text.replace(/\{product\}/g, product);
    }

    private hasAnswer(answer: StoredAnswer | undefined): boolean {
        if (Array.isArray(answer)) {
            return answer.length > 0;
        }
        return answer !== undefined && answer.trim() !== '';
    }

    /** A follow-up's text goes when the option that opened it is no longer picked. */
    private withoutStaleFollowUp(
        question: AppShellFeedbackQuestion,
        answers: Record<string, StoredAnswer>
    ): Record<string, StoredAnswer> {
        const followUp = question.followUp;
        if (!followUp) {
            return answers;
        }
        const answer = answers[question.id];
        const stillPicked = Array.isArray(answer) ? answer.includes(followUp.option) : answer === followUp.option;
        if (!stillPicked) {
            delete answers[this.followUpId(question, followUp)];
        }
        return answers;
    }

    /**
     * Scale answers leave as numbers, multiple answers as lists, everything else
     * as the text it is. Only answers to questions in this questionnaire leave.
     */
    private answersForEmission(): AppShellFeedbackAnswers {
        const answers = this._answers();
        const out: AppShellFeedbackAnswers = {};
        for (const q of this.questions()) {
            const value = answers[q.id];
            if (value !== undefined) {
                out[q.id] = q.type === 'scale' ? Number(value) : value;
            }
            if (q.followUp) {
                const key = this.followUpId(q, q.followUp);
                if (answers[key] !== undefined) {
                    out[key] = answers[key];
                }
            }
        }
        return out;
    }
}
