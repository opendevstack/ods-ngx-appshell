import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'appshell-select',
    imports: [MatSelectModule],
    templateUrl: './appshell-select.component.html',
    styleUrl: './appshell-select.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellSelectComponent {
  label = input.required<string>();
  options = input.required<string[]>();
  placeholder = input.required<string>();

  selectValueChange = output<string[]>();
}
