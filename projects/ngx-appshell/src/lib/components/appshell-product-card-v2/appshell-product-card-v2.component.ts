import { Component, input, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

@Component({
  selector: 'appshell-product-card-v2',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: './appshell-product-card-v2.component.html',
  styleUrl: './appshell-product-card-v2.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppshellProductCardV2Component {
  title = input.required<string>();
  description = input.required<string>();
  image = input<string>();
  link = input<string>();
  buttonText = input<string>();
  labels = input<string[]>();
  redirectTo = input<string>();

  constructor(private router: Router) {}

  onClick() {
    this.router.navigate([this.redirectTo()]);
  }
}
