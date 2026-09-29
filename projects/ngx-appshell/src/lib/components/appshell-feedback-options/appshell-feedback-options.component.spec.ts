import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    AppShellFeedbackOptionsComponent,
    AppShellFeedbackToggle,
    appShellFeedbackScaleLabel
} from './appshell-feedback-options.component';
import { AppShellFeedbackQuestion } from '../../models/appshell-feedback';

const MULTIPLE: AppShellFeedbackQuestion = { id: 'goal', type: 'multiple', label: 'Goal?', options: ['A', 'B', 'Other'] };
const CHOICE: AppShellFeedbackQuestion = { id: 'done', type: 'choice', label: 'Done?', options: ['Yes', 'No'] };
const SCALE: AppShellFeedbackQuestion = {
    id: 'csat', type: 'scale', label: 'How satisfied?', min: 1, max: 3, optionLabels: ['Low', 'Mid', 'High']
};

describe('AppShellFeedbackOptionsComponent', () => {
    let fixture: ComponentFixture<AppShellFeedbackOptionsComponent>;
    let component: AppShellFeedbackOptionsComponent;
    const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

    function render(question: AppShellFeedbackQuestion, options: string[], answer?: string | string[]): void {
        fixture.componentRef.setInput('question', question);
        fixture.componentRef.setInput('options', options);
        fixture.componentRef.setInput('name', 'q-' + question.id);
        fixture.componentRef.setInput('answer', answer);
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [AppShellFeedbackOptionsComponent] }).compileComponents();
        fixture = TestBed.createComponent(AppShellFeedbackOptionsComponent);
        component = fixture.componentInstance;
    });

    it('draws a multiple question as checkboxes, ticked from the answer', () => {
        render(MULTIPLE, MULTIPLE.options!, ['B']);

        const boxes = el().querySelectorAll<HTMLInputElement>('input.feedback-checkbox');
        expect(boxes.length).toBe(3);
        expect(Array.from(boxes).map(b => b.checked)).toEqual([false, true, false]);
        expect(el().querySelectorAll('.feedback-option span')[2].textContent?.trim()).toBe('Other');
    });

    it('reports which option was ticked or unticked', () => {
        render(MULTIPLE, MULTIPLE.options!);
        const toggles: AppShellFeedbackToggle[] = [];
        component.toggled.subscribe(t => toggles.push(t));

        const box = el().querySelectorAll<HTMLInputElement>('input.feedback-checkbox')[0];
        box.checked = true;
        box.dispatchEvent(new Event('change'));

        expect(toggles).toEqual([{ option: 'A', checked: true }]);
    });

    it('draws a choice question as one radio group and reports the pick', () => {
        render(CHOICE, CHOICE.options!, 'No');
        const picks: string[] = [];
        component.picked.subscribe(p => picks.push(p));

        const radios = el().querySelectorAll<HTMLInputElement>('input.feedback-radio');
        expect(Array.from(radios).map(r => r.name)).toEqual(['q-done', 'q-done']);
        expect(radios[1].checked).toBe(true);

        radios[0].dispatchEvent(new Event('change'));
        expect(picks).toEqual(['Yes']);
    });

    it('labels every point of a scale and reports the point picked', () => {
        render(SCALE, ['1', '2', '3']);
        const picks: string[] = [];
        component.picked.subscribe(p => picks.push(p));

        const points = Array.from(el().querySelectorAll('.feedback-scale-point')).map(p => p.textContent?.trim());
        const labels = Array.from(el().querySelectorAll('.feedback-scale-label')).map(l => l.textContent?.trim());
        expect(points).toEqual(['1', '2', '3']);
        expect(labels).toEqual(['Low', 'Mid', 'High']);
        expect(el().querySelector('.feedback-options--scale')).not.toBeNull();

        el().querySelectorAll<HTMLInputElement>('input.feedback-radio')[2].dispatchEvent(new Event('change'));
        expect(picks).toEqual(['3']);
    });

    it('falls back to the end labels of a scale without a label per point', () => {
        const ends: AppShellFeedbackQuestion = { id: 's', type: 'scale', label: 'S', minLabel: 'Bad', maxLabel: 'Good' };

        expect([0, 1, 2].map(i => appShellFeedbackScaleLabel(ends, i, 3))).toEqual(['Bad', '', 'Good']);
    });
});
