import { Component, input, ViewEncapsulation } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'appshell-chip',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './appshell-chip.component.html',
  styleUrl: './appshell-chip.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppshellChipComponent {
  label = input.required<string>();
}
