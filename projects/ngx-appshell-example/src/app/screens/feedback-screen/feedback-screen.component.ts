import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
    AppShellFeedbackComponent,
    AppShellFeedbackLauncherComponent,
    AppShellFeedback,
    AppShellFeedbackAnswers
} from 'ngx-appshell';

@Component({
    selector: 'app-feedback-screen',
    imports: [AppShellFeedbackComponent, AppShellFeedbackLauncherComponent, JsonPipe],
    templateUrl: './feedback-screen.component.html',
    styleUrl: './feedback-screen.component.scss'
})
export class FeedbackScreenComponent {

    lastAnswers?: AppShellFeedbackAnswers;

    /**
     * The widget as designed: the four standard steps plus the optional,
     * product-specific fifth one. An empty question list means "the standard
     * questions"; `{product}` in their wording becomes the product name.
     */
    standard: AppShellFeedback = {
        questions: [],
        productName: 'Onboarding Hub',
        productQuestion: {
            id: 'productQuestion',
            type: 'choice',
            label: 'Which data product were you looking for?',
            options: ['Customer 360', 'Clinical trials', 'Supply chain', 'Not listed']
        }
    };

    /** Without the product-specific step: four steps, and the fourth one submits. */
    fourSteps: AppShellFeedback = { questions: [], productName: 'Onboarding Hub' };

    /** The same component asked to carry a different questionnaire and wording. */
    shortSurvey: AppShellFeedback = {
        title: 'One question',
        subtitle: 'A shorter questionnaire, supplied by the host.',
        submitLabel: 'Send',
        successTitle: 'Noted',
        successMessage: 'Thanks for telling us.',
        questions: [
            {
                id: 'foundIt',
                type: 'choice',
                label: 'Did you find what you were looking for?',
                options: ['Yes', 'No']
            }
        ]
    };

    /**
     * The host decides what happens to the answers. Here they are only shown on
     * screen; a real application would post them to its own endpoint and record
     * that this person has now been asked.
     */
    onSubmitted(answers: AppShellFeedbackAnswers): void {
        this.lastAnswers = answers;
    }

    onDismissed(): void {
        this.lastAnswers = undefined;
    }

    /**
     * A real product would remember this per person and keep the tab hidden on
     * later visits; the component leaves that decision to whoever embeds it.
     */
    alreadyAsked = false;

    onLauncherSubmitted(answers: AppShellFeedbackAnswers): void {
        this.lastAnswers = answers;
        this.alreadyAsked = true;
    }
}
