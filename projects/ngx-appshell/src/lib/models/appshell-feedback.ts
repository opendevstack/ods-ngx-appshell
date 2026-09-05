/**
 * One question in a feedback questionnaire.
 *
 * `choice` renders its `options` as they are written; `scale` renders the whole
 * range between `min` and `max`, labelling only the ends. Both are answered from
 * the same chip listbox, so a scale is really a choice whose options are numbers
 * and whose extremes carry a word.
 */
export interface AppShellFeedbackQuestion {
    /** Stable key this question's answer is emitted under. */
    id: string;
    type: 'choice' | 'scale' | 'text';
    /** The question as the person reads it. */
    label: string;
    /** Answered before the questionnaire can be submitted. Defaults to true. */
    required?: boolean;

    /** `choice` only: the answers offered, in the order they are shown. */
    options?: string[];

    /** `scale` only: the ends of the range. Default 1 to 5. */
    min?: number;
    max?: number;
    /** `scale` only: what the ends mean, e.g. "Very inefficient" and "Very efficient". */
    minLabel?: string;
    maxLabel?: string;

    /** `text` only: placeholder and length cap. */
    placeholder?: string;
    maxLength?: number;
}

/**
 * A questionnaire and the wording around it.
 *
 * Every visible string lives here rather than in the template, so a consuming
 * application can translate the component without forking it.
 */
export interface AppShellFeedback {
    questions: AppShellFeedbackQuestion[];

    /** Heading above the questions. */
    title?: string;
    /** Sentence under the heading, shown on the first question only. */
    subtitle?: string;

    /** Progress line. `{current}` and `{total}` are replaced. */
    progressLabel?: string;
    backLabel?: string;
    nextLabel?: string;
    submitLabel?: string;

    /** Shown in place of the questions once the answers have been emitted. */
    successTitle?: string;
    successMessage?: string;
    closeLabel?: string;
}

/** One person's answers, keyed by question id. */
export type AppShellFeedbackAnswers = Record<string, string | number>;
