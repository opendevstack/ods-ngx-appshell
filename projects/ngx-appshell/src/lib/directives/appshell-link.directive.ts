import { Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appShellLink]',
  standalone: true
})
export class AppShellLinkDirective implements OnChanges {

  @Input('appShellLink') link!: string;

  constructor(private readonly el: ElementRef, private readonly router: Router, private readonly renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['link']?.currentValue) {
      this.renderer.setAttribute(this.el.nativeElement, 'href', this.link);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: UIEvent) {
    if (!this.isExternalLink()) {
      event.preventDefault();
      this.router.navigate([this.link]);
    }
  }

  private isExternalLink() {
    return this.link.startsWith('http') || this.link.startsWith('www.');
  }

}
