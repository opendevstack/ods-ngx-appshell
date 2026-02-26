export interface AppShellPicker {
    label: string;
    options: string[];
    selected?: string;
    showSelectedInLabel?: boolean;
    noOptionsTitle?: string;
    noOptionsMessage?: string;
    noFilteredOptionsTitle?: string;
    noFilteredOptionsMessage?: string;
}