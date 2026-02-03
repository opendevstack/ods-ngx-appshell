import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AppShellChipComponent } from '../../components/appshell-chip/appshell-chip.component';
import { AppShellPageHeaderComponent } from '../../components/appshell-page-header/appshell-page-header.component';
import { AppShellLink } from '../../models/appshell-link';
import { AppShellProduct } from '../../models/appshell-product';
import { MarkdownComponent } from 'ngx-markdown';
import { AppShellPicker } from '../../models/appshell-picker';
import { AppShellButton } from '../../models/appshell-button';

@Component({
  selector: 'appshell-product-view-screen',
  standalone: true,
  imports: [AppShellPageHeaderComponent, MatButtonModule, MatChipsModule, AppShellChipComponent, MarkdownComponent],
  templateUrl: './appshell-product-view-screen.component.html',
  styleUrl: './appshell-product-view-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppShellProductViewScreenComponent {

  pageTitle = input.required<string>();
  breadcrumbLinks = input.required<AppShellLink[]>();
  actionButton = input<AppShellButton>();
  actionButtonClicked = output<void>();
  product = input.required<AppShellProduct>();
  secondaryButton = input<AppShellButton>();
  secondaryButtonClicked = output<void>();
  actionPicker = input<AppShellPicker>();
  actionPick = output<string>();
  
  productLabels = computed(() => this.product().tags?.flatMap(tag => tag.options) || []);
}