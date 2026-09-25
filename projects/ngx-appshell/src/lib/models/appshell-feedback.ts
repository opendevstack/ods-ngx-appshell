/**
 * A free-text field that opens under a question when one particular option is
 * picked — "Other" on a list of goals, "No" on "Were you able to achieve it?".
 *
 * Its text is emitted only while that option is still selected, so an answer
 * typed and then abandoned by changing the choice does not travel with the rest.
 */
export interface AppShellFeedbackFollowUp {
    /** The option that opens the field, exactly as written in `options`. */
    option: string;
    /** Key the text is emitted under. Defaults to `<question id>Detail`. */
    id?: string;
    /** The question the field asks, shown above it. */
    label: string;
    placeholder?: string;
    maxLength?: number;
}

/**
 * One question in a feedback questionnaire, shown one step at a time.
 *
 * - `choice`: one answer, as radio buttons.
 * - `multiple`: any number of answers, as checkboxes.
 * - `scale`: one point of a numeric range, as radio buttons, each point with
 *   its own label (the satisfaction scale: 1 Very dissatisfied … 5 Very satisfied).
 * - `text`: a free-text answer.
 */
export interface AppShellFeedbackQuestion {
    /** Stable key this question's answer is emitted under. */
    id: string;
    type: 'choice' | 'multiple' | 'scale' | 'text';
    /** The question as the person reads it. `{product}` is replaced by the product name. */
    label: string;
    /** Must be answered before moving on. Defaults to true; shown with an asterisk. */
    required?: boolean;

    /** `choice` and `multiple`: the answers offered, in the order they are shown. */
    options?: string[];
    /** `choice` and `multiple`: a free-text field opened by one of the options. */
    followUp?: AppShellFeedbackFollowUp;

    /** `scale` only: the ends of the range. Default 1 to 5. */
    min?: number;
    max?: number;
    /** `scale` only: one label per point, lowest first. */
    optionLabels?: string[];
    /** `scale` only: labels for the two ends, used when `optionLabels` is not given. */
    minLabel?: string;
    maxLabel?: string;

    /** `text` only: a caption above the field, e.g. "Type your answer". */
    inputLabel?: string;
    /** `text` only: placeholder and length cap. */
    placeholder?: string;
    maxLength?: number;
}

/**
 * A questionnaire and the wording around it.
 *
 * Every visible string lives here rather than in the template, so a consuming
 * application can translate the component without forking it. `{product}` in
 * any of them is replaced by `productName`.
 */
export interface AppShellFeedback {
    questions: AppShellFeedbackQuestion[];

    /** The product being rated, e.g. "Onboarding Hub". Defaults to "this product". */
    productName?: string;

    /**
     * The optional fifth, product-specific step, added after `questions` (or
     * after the four standard questions when `questions` is empty). Optional to
     * answer unless it says `required: true`. With it the widget has five steps
     * and the fourth says "Next"; without it the fourth step submits.
     */
    productQuestion?: AppShellFeedbackQuestion;

    /** Optional heading above the questions. The standard widget shows none. */
    title?: string;
    /** Optional sentence under the heading, shown on the first step only. */
    subtitle?: string;

    /**
     * Step indicator. `{current}` and `{total}` are replaced; everything up to
     * and including `{current}` is shown in bold ("**Step 1** of 5").
     */
    progressLabel?: string;
    backLabel?: string;
    nextLabel?: string;
    submitLabel?: string;
    /** Read out by screen readers instead of the asterisk on a required question. */
    requiredLabel?: string;

    /** Shown in place of the questions once the answers have been emitted. */
    successTitle?: string;
    successMessage?: string;
    closeLabel?: string;
}

/**
 * One person's answers, keyed by question id (and follow-up id).
 * `scale` answers are numbers, `multiple` answers are lists, the rest text.
 */
export type AppShellFeedbackAnswers = Record<string, string | number | string[]>;
