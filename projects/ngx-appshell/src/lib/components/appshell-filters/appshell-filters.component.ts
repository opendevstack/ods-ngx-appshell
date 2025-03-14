import { Component, input, output } from '@angular/core';
import { AppShellFilter } from '../../models/appshell-filter';
import { AppshellSelectComponent } from '../appshell-select/appshell-select.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'appshell-filters',
  standalone: true,
  imports: [MatButtonModule, AppshellSelectComponent],
  templateUrl: './appshell-filters.component.html',
  styleUrl: './appshell-filters.component.scss'
})
export class AppshellFiltersComponent {
  filters = input<AppShellFilter[]>();
  
  activeFilters: Map<string, string[]> = new Map<string, string[]>();
  activeFiltersChange = output<Map<string, string[]>>();

  onFilterChange(label: string, values: string | string[]) {
    if (typeof values === 'string') {
      if(values === '') {
        this.activeFilters.delete(label);
      } else {
        this.activeFilters.set(label, [values]);
      }
    } else {
      if(values.length === 0) {
        this.activeFilters.delete(label);
      } else {
        this.activeFilters.set(label, values);
      }
    }
    this.activeFiltersChange.emit(this.activeFilters);
  }
}
