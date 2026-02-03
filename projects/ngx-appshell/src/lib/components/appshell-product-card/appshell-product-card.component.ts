import { AfterViewChecked, Component, ElementRef, input, NgZone, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AppShellChipComponent } from "../appshell-chip/appshell-chip.component";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'appshell-product-card',
    imports: [MatCardModule, MatButtonModule, MatChipsModule, AppShellChipComponent, AppShellChipComponent, MatTooltipModule],
    templateUrl: './appshell-product-card.component.html',
    styleUrl: './appshell-product-card.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AppShellProductCardComponent implements AfterViewChecked, OnDestroy {
  
  @ViewChild('labelsChipSet', { static: true, read: ElementRef }) labelsChipSet!: ElementRef<HTMLElement>;

  title = input.required<string>();
  description = input.required<string>();
  image = input<string>();
  labels = input<string[]>();
  redirectTo = input<string>();

  resizeObserver: ResizeObserver = new ResizeObserver(
    this.debounce(() => {
      this.ngZone.run(() => {
        window.requestAnimationFrame(() => {
          this.hideOverflowingLabels();
        });
      });
    }, 100)
  );

  constructor(private readonly router: Router, private readonly ngZone: NgZone) {}

  debounce(func: Function, wait: number) {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  ngAfterViewChecked() {
    this.hideOverflowingLabels();
    this.resizeObserver.observe(this.labelsChipSet.nativeElement);
  }

  onClick() {
    this.router.navigate([this.redirectTo()]);
  }

  hideOverflowingLabels() {
    const twoLinesHeight = 4.5 * 16; // Each label uses 2 rem with a gap of .5 rem where 1 rem = 16px
    const labelsChipSetDiv = this.labelsChipSet.nativeElement.firstChild as HTMLElement;

    const chipsChildren = Array.from(labelsChipSetDiv.children).filter((child: Element) => child.tagName.toLowerCase() === 'appshell-chip');
    
    chipsChildren.forEach((child: Element) => {
      if (child.id === 'extra-labels') {
        (child as HTMLElement).style.display = 'none';
      } else {
        (child as HTMLElement).style.display = 'block';
      }
    });
    
    if(chipsChildren.length <= 2) {return;}
    let index = chipsChildren.length - 2; // Start from the second last child

    const hiddenLabels: string[] = [];

    const extraLabels = labelsChipSetDiv.querySelector('#extra-labels');
    if(labelsChipSetDiv.scrollHeight > twoLinesHeight && extraLabels) {
        (extraLabels as HTMLElement).style.display = 'block';
    }

    while (labelsChipSetDiv.scrollHeight > twoLinesHeight && index >= 0) {
      const label = chipsChildren[index] as HTMLElement;
      label.style.display = 'none';
      const labelText = label.querySelector('.mdc-evolution-chip__text-label.mat-mdc-chip-action-label')?.textContent;
      if(labelText) {
        hiddenLabels.push(labelText);
        index--;
      }
    }

    if(hiddenLabels.length > 0 && extraLabels) {
      this.changeExtraLabel(extraLabels, hiddenLabels);
    }
  }

  changeExtraLabel(labelEl: Element, removedLabels: Array<string>) {
    labelEl.classList.add('tooltip-chip');
    let existingSpan = labelEl.querySelector('.tooltip-text');
    if(existingSpan) {labelEl.removeChild(existingSpan);}
    existingSpan = document.createElement('span')
    existingSpan.classList.add('tooltip-text');
    existingSpan.textContent = `${[...removedLabels].reverse().join(', ')}`;
    labelEl.appendChild(existingSpan);
    const textLabel = labelEl?.querySelector('.mdc-evolution-chip__text-label.mat-mdc-chip-action-label');
    if (textLabel) {
      textLabel.textContent = `+${removedLabels.length}`;
    }
  }

  ngOnDestroy() {
    if(this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
