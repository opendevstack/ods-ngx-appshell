import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    Component, OnDestroy, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation,
    afterNextRender, computed, inject, input, output, signal
} from '@angular/core';
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
export class AppShellFeedbackLauncherComponent implements OnDestroy {

    /** Questionnaire to ask. Omit it for the five default questions. */
    feedback = input<AppShellFeedback>();
    /** Wording on the tab. */
    label = input<string>('Feedback');
    /** Material symbol shown on the tab. */
    icon = input<string>('rate_review');
    /**
     * How the trigger looks. `fab` is a round action button in the bottom
     * corner, the shape people expect; `tab` is a vertical strip against the
     * side of the page.
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
    @ViewChild('trigger') triggerTpl!: TemplateRef<unknown>;

    private readonly dialog = inject(MatDialog);
    private dialogRef?: MatDialogRef<unknown>;

    private readonly overlay = inject(Overlay);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private triggerRef?: OverlayRef;

    constructor() {
        // The trigger is drawn in the CDK overlay container, a child of <body>,
        // not where this element sits. Inside the AppShell layout that is
        // mat-sidenav-content, a stacking context at z-index 1 under the side
        // menu at 2: whatever the trigger's own z-index, a tab on the left went
        // under the menu and could be neither seen nor clicked. In the overlay
        // container it floats above the page chrome in any host layout, and the
        // dialog it opens, added to the same container later, still lands on top.
        afterNextRender(() => {
            this.triggerRef = this.overlay.create({ panelClass: 'appshell-feedback-launcher-pane' });
            this.triggerRef.attach(new TemplatePortal(this.triggerTpl, this.viewContainerRef));
        });
    }

    ngOnDestroy(): void {
        this.triggerRef?.dispose();
    }

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
            // The question, not the first tabbable element: that is the close
            // cross, so the dialog opened on it and one Enter dismissed the
            // questionnaire. The question heading takes focus programmatically
            // only, and is what a screen reader should announce first.
            autoFocus: '.feedback-question',
            restoreFocus: true,
            // The card's own width. Left to size itself, the dialog shrank to its
            // content and the questionnaire came out narrower than designed.
            width: '25rem',
            maxWidth: 'calc(100vw - 2rem)'
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
