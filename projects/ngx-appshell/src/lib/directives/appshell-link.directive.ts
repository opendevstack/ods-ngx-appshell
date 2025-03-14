import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appShellLink]',
  standalone: true
})
export class AppShellLinkDirective implements OnInit {

  @Input('appShellLink') link!: string;

  constructor(private el: ElementRef, private router: Router, private renderer: Renderer2) { }

  ngOnInit() {
    this.renderer.setAttribute(this.el.nativeElement, 'href', this.link);
  }

  @HostListener('click', ['$event'])
  onClick(event: UIEvent) {
    if(!this.isExternalLink()) {
      event.preventDefault();
      this.router.navigate([this.link]);
    }
  }

  private isExternalLink() {
    return this.link.startsWith('http') || this.link.startsWith('www.');
  }

}
