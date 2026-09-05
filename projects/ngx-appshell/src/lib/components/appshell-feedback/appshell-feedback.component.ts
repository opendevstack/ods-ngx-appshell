import { Component, computed, ElementRef, input, output, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    AppShellFeedback,
    AppShellFeedbackAnswers,
    AppShellFeedbackQuestion
} from '../../models/appshell-feedback';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

/** Asked when the host supplies no questionnaire of its own. */
const DEFAULT_QUESTIONS: AppShellFeedbackQuestion[] = [
    {
        id: 'taskSuccess',
        type: 'choice',
        label: 'Did you achieve what you came for today?',
        options: ['Yes', 'Partially', 'No']
    },
    {
        id: 'perceivedEfficiency',
        type: 'scale',
        label: 'How efficient was the experience?',
        min: 1,
        max: 5,
        minLabel: 'Very inefficient',
        maxLabel: 'Very efficient'
    },
    {
        id: 'clarityOfGuidance',
        type: 'scale',
        label: 'How clear were the guidance and next steps?',
        min: 1,
        max: 5,
        minLabel: 'Not clear',
        maxLabel: 'Very clear'
    },
    {
        id: 'recommendationIntent',
        type: 'choice',
        label: 'Would you recommend this tool to a teammate?',
        options: ['Yes', 'Maybe', 'No']
    },
    {
        id: 'comment',
        type: 'text',
        label: 'What should we improve?',
        required: false,
        placeholder: 'Optional',
        maxLength: 500
    }
];

const DEFAULTS: Required<Omit<AppShellFeedback, 'questions'>> = {
    title: 'Help us improve',
    subtitle: 'Five short questions about how today went.',
    progressLabel: 'Question {current} of {total}',
    backLabel: 'Back',
    nextLabel: 'Next',
    submitLabel: 'Submit',
    successTitle: 'Thank you',
    successMessage: 'Your answers help us decide what to improve next.',
    closeLabel: 'Close'
};

/**
 * A questionnaire that asks one question at a time.
 *
 * The component collects answers and emits them; it never sends them anywhere.
 * Where they go, and whether this person should have been asked at all, depend
 * on the host application's own storage and identity, so both stay with the host.
 */
@Component({
    selector: 'appshell-feedback',
    imports: [
        FormsModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        AppShellIconComponent
    ],
    templateUrl: './appshell-feedback.component.html',
    styleUrl: './appshell-feedback.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellFeedbackComponent {

    /** Questionnaire and wording. Omit it to ask the five default questions. */
    feedback = input<AppShellFeedback>({ questions: DEFAULT_QUESTIONS });

    /** Answers, keyed by question id, emitted once on submit. */
    submitted = output<AppShellFeedbackAnswers>();
    /** The person dismissed the questionnaire instead of answering it. */
    dismissed = output<void>();

    @ViewChild('questionHeading') questionHeadingEl?: ElementRef<HTMLElement>;

    private readonly _index = signal(0);
    private readonly _answers = signal<AppShellFeedbackAnswers>({});
    private readonly _done = signal(false);

    readonly questions = computed(() => {
        const supplied = this.feedback().questions;
        return supplied && supplied.length > 0 ? supplied : DEFAULT_QUESTIONS;
    });

    readonly text = computed(() => ({ ...DEFAULTS, ...this.feedback() }));

    readonly index = this._index.asReadonly();
    readonly done = this._done.asReadonly();

    readonly current = computed(() => this.questions()[this._index()]);
    readonly total = computed(() => this.questions().length);
    readonly isFirst = computed(() => this._index() === 0);
    readonly isLast = computed(() => this._index() === this.total() - 1);

    readonly progress = computed(() =>
        this.text().progressLabel
            .replace('{current}', String(this._index() + 1))
            .replace('{total}', String(this.total()))
    );

    /** Options for a choice question, or the whole range for a scale one. */
    readonly currentOptions = computed<string[]>(() => {
        const q = this.current();
        if (!q) {
            return [];
        }
        if (q.type === 'choice') {
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

    readonly commentLength = computed(() => String(this.currentAnswer() ?? '').length);

    /**
     * True while the question on screen still needs an answer. A question is
     * mandatory unless it says otherwise, so an omitted `required` means required.
     */
    readonly currentUnanswered = computed(() => {
        const q = this.current();
        if (!q || q.required === false) {
            return false;
        }
        const answer = this.currentAnswer();
        return answer === undefined || String(answer).trim() === '';
    });

    /** Every mandatory question has an answer, wherever the person is standing. */
    readonly canSubmit = computed(() => {
        const answers = this._answers();
        return this.questions()
            .filter(q => q.required !== false)
            .every(q => {
                const answer = answers[q.id];
                return answer !== undefined && String(answer).trim() !== '';
            });
    });

    /** Records an answer without moving: navigating back must find it again. */
    answer(question: AppShellFeedbackQuestion, value: string | number | undefined): void {
        const next = { ...this._answers() };
        if (value === undefined || String(value).trim() === '') {
            delete next[question.id];
        } else {
            next[question.id] = question.type === 'scale' ? Number(value) : value;
        }
        this._answers.set(next);
    }

    /** Chips emit an array even when only one option can be selected. */
    onSelectionChange(question: AppShellFeedbackQuestion, value: string | string[] | null): void {
        const picked = Array.isArray(value) ? value[0] : value;
        this.answer(question, picked ?? undefined);
    }

    next(): void {
        if (!this.isLast()) {
            this._index.set(this._index() + 1);
            this.focusQuestion();
        }
    }

    back(): void {
        if (!this.isFirst()) {
            this._index.set(this._index() - 1);
            this.focusQuestion();
        }
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

    submit(): void {
        if (!this.canSubmit()) {
            return;
        }
        this.submitted.emit({ ...this._answers() });
        this._done.set(true);
    }

    dismiss(): void {
        this.dismissed.emit();
    }
}
