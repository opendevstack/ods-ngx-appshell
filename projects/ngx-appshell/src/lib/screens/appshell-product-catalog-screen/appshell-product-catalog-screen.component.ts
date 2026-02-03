import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { AppShellProductCardComponent } from "../../components/appshell-product-card/appshell-product-card.component";
import { AppShellLink } from '../../models/appshell-link';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppShellProduct } from '../../models/appshell-product';
import { AppShellFilter } from '../../models/appshell-filter';
import { MatChipsModule } from '@angular/material/chips';
import { AppShellPageHeaderComponent } from "../../components/appshell-page-header/appshell-page-header.component";
import { AppShellFiltersComponent } from '../../components/appshell-filters/appshell-filters.component';
import { AppShellIconComponent } from '../../components/appshell-icon/appshell-icon.component';

@Component({
  selector: 'appshell-product-catalog-screen',
  standalone: true,
  imports: [AppShellProductCardComponent, MatFormFieldModule, MatInputModule, MatButtonModule, MatChipsModule, AppShellPageHeaderComponent, AppShellFiltersComponent, AppShellIconComponent],
  templateUrl: './appshell-product-catalog-screen.component.html',
  styleUrl: './appshell-product-catalog-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppShellProductCatalogScreenComponent {

  pageTitle = input.required<string>();
  breadcrumbLinks = input.required<AppShellLink[]>();
  products = input.required<AppShellProduct[]>();
  filters = input.required<AppShellFilter[]>();
  noProductsIcon = input<string>();
  noProductsHtmlMessage = input<string>();
  activeFiltersChange = output<Map<string, string[]>>();

  getProductLabels(product: AppShellProduct) {
    return product.tags?.flatMap(tag => tag.options) || [];
  }
}
