import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { AppShellFeedbackQuestion } from '../../models/appshell-feedback';

/** One option of a `multiple` question, ticked or unticked. */
export interface AppShellFeedbackToggle {
    option: string;
    checked: boolean;
}

/**
 * Label of one point of a `scale` question: its own label from `optionLabels`,
 * or `minLabel` / `maxLabel` on the two ends. Empty for the points in between.
 */
export function appShellFeedbackScaleLabel(
    question: AppShellFeedbackQuestion,
    pointIndex: number,
    pointCount: number
): string {
    const own = question.optionLabels?.[pointIndex];
    if (own) {
        return own;
    }
    if (pointIndex === 0) {
        return question.minLabel ?? '';
    }
    return pointIndex === pointCount - 1 ? question.maxLabel ?? '' : '';
}

/**
 * The answers of one questionnaire step, as the feedback design draws them:
 * checkboxes for `multiple`, radio buttons for `choice`, and radio buttons with
 * a label per point for `scale`.
 *
 * Presentational only: it shows what `answer` says is picked and reports every
 * change, while the questionnaire (`appshell-feedback`) keeps the answers. It
 * is its own component so that each piece of the questionnaire stays within
 * the component style budget, and so any form can reuse the small native
 * controls.
 */
@Component({
    selector: 'appshell-feedback-options',
    templateUrl: './appshell-feedback-options.component.html',
    styleUrl: './appshell-feedback-options.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellFeedbackOptionsComponent {

    /** The question whose answers are shown: `choice`, `multiple` or `scale`. */
    question = input.required<AppShellFeedbackQuestion>();
    /** The answers offered, in order; for a `scale`, its points. */
    options = input.required<string[]>();
    /** Radio group name. Unique per questionnaire, so two on one page never share a group. */
    name = input.required<string>();
    /** What is picked: one option, or the ticked ones of a `multiple` question. */
    answer = input<string | string[] | undefined>(undefined);

    /** A `choice` or `scale` option was picked. */
    picked = output<string>();
    /** A `multiple` option was ticked or unticked. */
    toggled = output<AppShellFeedbackToggle>();

    isPicked(option: string): boolean {
        const answer = this.answer();
        return Array.isArray(answer) ? answer.includes(option) : answer === option;
    }

    scaleLabel(pointIndex: number, pointCount: number): string {
        return appShellFeedbackScaleLabel(this.question(), pointIndex, pointCount);
    }

    onToggle(option: string, event: Event): void {
        this.toggled.emit({ option, checked: (event.target as HTMLInputElement).checked });
    }
}
