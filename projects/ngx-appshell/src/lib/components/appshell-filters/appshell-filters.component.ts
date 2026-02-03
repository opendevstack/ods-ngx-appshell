import { Component, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { AppShellFilter } from '../../models/appshell-filter';
import { AppShellSelectComponent } from '../appshell-select/appshell-select.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'appshell-filters',
    imports: [MatButtonModule, AppShellSelectComponent],
    templateUrl: './appshell-filters.component.html',
    styleUrl: './appshell-filters.component.scss'
})
export class AppShellFiltersComponent implements OnChanges {
  filters = input<AppShellFilter[]>();
  
  activeFilters: Map<string, string[]> = new Map<string, string[]>();
  activeFiltersChange = output<Map<string, string[]>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.activeFilters.clear();
    }
  }

  onFilterChange(label: string, values: string | string[]) {
    if (typeof values === 'string') {
      if(values === '') {
        this.activeFilters.delete(label);
      } else {
        this.activeFilters.set(label, [values]);
      }
    } else if(values.length === 0) {
      this.activeFilters.delete(label);
    } else {
      this.activeFilters.set(label, values);
    }
    
    this.activeFiltersChange.emit(this.activeFilters);
  }
}
