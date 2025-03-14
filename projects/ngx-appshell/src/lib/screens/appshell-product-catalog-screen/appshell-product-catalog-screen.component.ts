import { Component, input, output } from '@angular/core';
import { AppshellProductCardComponent } from "../../components/appshell-product-card/appshell-product-card.component";
import { AppShellLink } from '../../models/appshell-link';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppShellProduct } from '../../models/appshell-product';
import { AppShellFilter } from '../../models/appshell-filter';
import { MatChipsModule } from '@angular/material/chips';
import { AppshellPageHeaderComponent } from "../../components/appshell-page-header/appshell-page-header.component";
import { AppshellFiltersComponent } from '../../components/appshell-filters/appshell-filters.component';

@Component({
  selector: 'appshell-product-catalog-screen',
  standalone: true,
  imports: [AppshellProductCardComponent, MatFormFieldModule, MatInputModule, MatButtonModule, MatChipsModule, AppshellPageHeaderComponent, AppshellFiltersComponent],
  templateUrl: './appshell-product-catalog-screen.component.html',
  styleUrl: './appshell-product-catalog-screen.component.scss'
})
export class AppshellProductCatalogScreenComponent {

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
