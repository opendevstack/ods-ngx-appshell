import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';

/**
 * A free-text answer as the feedback design draws it: an optional caption and a
 * five-row textarea. When the answer has a length cap, a "820 / 1000" counter
 * appears under it once the text reaches 80% of the cap — the design shows no
 * counter, and most answers never come near it.
 *
 * Presentational only: it shows `value` and reports every keystroke, while the
 * questionnaire (`appshell-feedback`) keeps the answer. It is its own component
 * so that each piece of the questionnaire stays within the component style
 * budget, and so a text step and a follow-up field are drawn by the same code.
 */
@Component({
    selector: 'appshell-feedback-text-field',
    templateUrl: './appshell-feedback-text-field.component.html',
    styleUrl: './appshell-feedback-text-field.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellFeedbackTextFieldComponent {

    /** Id of the textarea, which its caption points at. */
    fieldId = input.required<string>();
    /** Caption above the field. Without one, name the field with `labelledBy`. */
    label = input<string | undefined>(undefined);
    /** Id of the element that names the field when it has no caption of its own. */
    labelledBy = input<string | null>(null);
    value = input<string>('');
    placeholder = input<string | undefined>(undefined);
    maxLength = input<number | undefined>(undefined);
    /** `aria-required`; left null, the attribute is not rendered at all. */
    required = input<boolean | null>(null);
    /** Allow the character counter at all (it still waits for 80% of the cap). */
    showCounter = input<boolean>(true);

    /** The text as it stands after each keystroke. */
    valueChange = output<string>();

    /** The counter shows once the text reaches 80% of its cap, where it starts to matter. */
    readonly counterVisible = computed(() => {
        const cap = this.maxLength();
        return this.showCounter() && !!cap && this.value().length >= Math.ceil(cap * 0.8);
    });

    onInput(event: Event): void {
        this.valueChange.emit((event.target as HTMLTextAreaElement).value);
    }
}
