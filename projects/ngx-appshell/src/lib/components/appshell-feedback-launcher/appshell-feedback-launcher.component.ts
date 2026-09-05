import { Component, TemplateRef, ViewChild, ViewEncapsulation, computed, inject, input, output, signal } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppShellFeedback, AppShellFeedbackAnswers } from '../../models/appshell-feedback';
import { AppShellFeedbackComponent } from '../appshell-feedback/appshell-feedback.component';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

/** Kept out of the template: a fresh literal there would be a new input on
 *  every change detection pass. An empty list makes the questionnaire ask
 *  its own default questions. */
const NO_QUESTIONNAIRE: AppShellFeedback = { questions: [] };

/**
 * A tab pinned to the edge of the screen that opens the feedback questionnaire
 * in a dialog.
 *
 * The questionnaire itself is `appshell-feedback`, which can also be used on its
 * own wherever a page has room for it. This adds only the way in: without it,
 * every product that wants the questionnaire has to rebuild the same trigger and
 * the same dialog, and they drift apart.
 *
 * The dialog is Angular Material's, so the focus trap, Escape to close, restoring
 * focus to the tab afterwards and `aria-modal` all come from the CDK rather than
 * being hand-rolled here.
 *
 * Whether this person should be asked at all stays with the host: hide the tab
 * with `hidden` once they have answered, on whatever rule that product applies.
 */
@Component({
    selector: 'appshell-feedback-launcher',
    imports: [MatDialogModule, MatTooltipModule, AppShellFeedbackComponent, AppShellIconComponent],
    templateUrl: './appshell-feedback-launcher.component.html',
    styleUrl: './appshell-feedback-launcher.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellFeedbackLauncherComponent {

    /** Questionnaire to ask. Omit it for the five default questions. */
    feedback = input<AppShellFeedback>();
    /** Wording on the tab. */
    label = input<string>('Feedback');
    /** Material symbol shown on the tab. */
    icon = input<string>('rate_review');
    /**
     * How the trigger looks. `fab` is a round action button in the bottom
     * corner, the shape people expect; `tab` is a vertical strip against the
     * side, which is what the Onboarding Hub has used until now.
     */
    shape = input<'fab' | 'tab'>('fab');
    /** Which side the trigger sits against. */
    side = input<'left' | 'right'>('right');
    /** Hide the tab entirely, e.g. once this person has already answered. */
    hidden = input<boolean>(false);

    /** What the dialog renders: the supplied questionnaire, or the defaults. */
    readonly questionnaire = computed(() => this.feedback() ?? NO_QUESTIONNAIRE);

    submitted = output<AppShellFeedbackAnswers>();
    dismissed = output<void>();
    opened = output<void>();

    @ViewChild('dialogContent') dialogContentTpl!: TemplateRef<unknown>;

    private readonly dialog = inject(MatDialog);
    private dialogRef?: MatDialogRef<unknown>;

    private readonly _open = signal(false);
    readonly isOpen = this._open.asReadonly();

    open(): void {
        if (this._open()) {
            return;
        }
        this._open.set(true);
        this.opened.emit();
        this.dialogRef = this.dialog.open(this.dialogContentTpl, {
            panelClass: 'appshell-feedback-dialog',
            ariaLabel: this.label(),
            // Stated rather than assumed: the questionnaire is modal, and the
            // dialog did not carry aria-modal on its own.
            ariaModal: true,
            autoFocus: 'first-tabbable',
            restoreFocus: true
        });
        // One exit for every way out — Escape, the backdrop, or the
        // questionnaire's own close button — so `dismissed` is reported once and
        // from a single place.
        this.dialogRef.afterClosed().subscribe(() => {
            this._open.set(false);
            this.dialogRef = undefined;
            this.dismissed.emit();
        });
    }

    close(): void {
        this.dialogRef?.close();
    }

    onSubmitted(answers: AppShellFeedbackAnswers): void {
        // The dialog stays open on purpose: the questionnaire shows its own
        // success state, and closing it here would snatch that away.
        this.submitted.emit(answers);
    }
}
