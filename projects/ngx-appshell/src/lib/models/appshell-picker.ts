export interface AppShellPicker {
    label: string;
    options: string[];
    selected?: string;
    noOptionsTitle?: string;
    noOptionsMessage?: string;
    noFilteredOptionsTitle?: string;
    noFilteredOptionsMessage?: string;
}