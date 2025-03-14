import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AppshellChipComponent } from '../../components/appshell-chip/appshell-chip.component';
import { AppshellPageHeaderComponent } from '../../components/appshell-page-header/appshell-page-header.component';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellProduct } from '../../models/appshell-product';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'appshell-product-view-screen',
  standalone: true,
  imports: [AppshellPageHeaderComponent, MatButtonModule, MatChipsModule, AppshellChipComponent, MarkdownComponent],
  templateUrl: './appshell-product-view-screen.component.html',
  styleUrl: './appshell-product-view-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppshellProductViewScreenComponent {

  pageTitle = input.required<string>();
  breadcrumbLinks = input.required<AppShellLink[]>();
  actionButtonText = input<string>();
  product = input.required<AppShellProduct>();
  actionButtonClicked = output<void>();
  
  productLabels = computed(() => this.product().tags?.flatMap(tag => tag.options) || []);

  buttonFn() {
    this.actionButtonClicked.emit();
  };
}