import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AppShellFeedbackComponent, AppShellFeedback, AppShellFeedbackAnswers } from 'ngx-appshell';

@Component({
    selector: 'app-feedback-screen',
    imports: [AppShellFeedbackComponent, JsonPipe],
    templateUrl: './feedback-screen.component.html',
    styleUrl: './feedback-screen.component.scss'
})
export class FeedbackScreenComponent {

    /** Left as the default questionnaire: no configuration, five questions. */
    lastAnswers?: AppShellFeedbackAnswers;

    /** The same component asked to carry a different questionnaire. */
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
}
