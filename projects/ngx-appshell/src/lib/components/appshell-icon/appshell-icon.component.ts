import { Component, effect, input, signal, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

@Component({
    selector: 'appshell-icon',
    imports: [MatIconModule],
    templateUrl: './appshell-icon.component.html',
    styleUrls: ['./appshell-icon.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppShellIconComponent {

  icon = input.required<string>();
  private namespace = 'appshell';

  // Resolved values for template rendering
  resolvedSvgIcon = signal<string>('');
  resolvedFontIcon = signal<string>('');

  constructor(private iconRegistry: MatIconRegistry) {
    effect((onCleanup) => {
      const iconName = this.icon();

      // Try to resolve namespaced appshell icon; fall back to material font icon
      // getNamedSvgIcon emits if the icon exists, errors if it doesn't.
      let sub: Subscription | undefined;
      sub = this.iconRegistry.getNamedSvgIcon(iconName, this.namespace).subscribe({
        next: () => {
          this.resolvedSvgIcon.set(`${this.namespace}:${iconName}`);
          this.resolvedFontIcon.set('');
        },
        error: () => {
          this.resolvedSvgIcon.set('');
          this.resolvedFontIcon.set(iconName);
        }
      });

      onCleanup(() => sub?.unsubscribe());
    });
  }

}
