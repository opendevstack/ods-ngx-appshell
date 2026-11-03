import { firstValueFrom, isObservable } from 'rxjs';
import { AppShellFeedbackAnswers, AppShellFeedbackSave } from '../../models/appshell-feedback';

/**
 * Runs a host's `save` and tells whether the answers were stored.
 *
 * Failed means the Promise rejected, the Observable errored, `save` threw, or
 * either one gave back `false`. An Observable is read up to its first value;
 * one that completes without a value counts as saved.
 *
 * Shared by the questionnaire and its launcher so both read a save the same
 * way. Internal: not exported from the library.
 */
export async function runFeedbackSave(save: AppShellFeedbackSave, answers: AppShellFeedbackAnswers): Promise<boolean> {
    try {
        const result = save(answers);
        const value = isObservable(result)
            ? await firstValueFrom(result, { defaultValue: undefined })
            : await result;
        return value !== false;
    } catch {
        return false;
    }
}
