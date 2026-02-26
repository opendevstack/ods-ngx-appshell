import { Component, computed, ElementRef, input, output, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { AppShellPicker } from '../../models/appshell-picker';
import { AppShellIconComponent } from '../appshell-icon/appshell-icon.component';

@Component({
    selector: 'appshell-header-picker',
    imports: [MatMenuModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, AppShellIconComponent],
    templateUrl: './appshell-header-picker.component.html',
    styleUrl: './appshell-header-picker.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellHeaderPickerComponent {

    picker = input.required<AppShellPicker>();
    searchable = input<boolean>(false);
    pick = output<string>();

    @ViewChild('searchInput') searchInputEl?: ElementRef<HTMLInputElement>;

    private readonly _search = signal('');

    get search(): string {
        return this._search();
    }

    set search(value: string) {
        this._search.set(value);
    }

    selectedLabel = computed(() => {
        const p = this.picker();
        return p.selected && p.showSelectedInLabel !== false ? `${p.label}${p.selected}` : p.label;
    });

    filteredOptions = computed(() => {
        const opts = this.picker().options ?? [];
        const s = this._search();
        if (!s) {
            return opts;
        }
        return opts.filter(o => o.toLowerCase().includes(s.toLowerCase()));
    });

    onPick(option: string): void {
        this.pick.emit(option);
        this.search = '';
    }

    onMenuOpened(): void {
        if (this.searchable()) {
            this.searchInputEl?.nativeElement.focus();
        }
    }

    onSearchKeydown(event: KeyboardEvent): void {
        event.stopPropagation();
    }
}
