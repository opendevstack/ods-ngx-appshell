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
  multipleSelection = input<boolean>(false);

  selectValue = input<string | string[]>();
  selectValueChange = output<string | string[]>();
}
