import { Component } from '@angular/core';
import { AppShellProductCatalogScreenComponent, AppShellProduct, AppShellLink, AppShellFilter } from 'ngx-appshell';
import { CatalogService } from '../../services/catalog.service';

@Component({
    selector: 'app-product-catalog-screen',
    imports: [AppShellProductCatalogScreenComponent],
    templateUrl: './product-catalog-screen.component.html',
    styleUrl: './product-catalog-screen.component.scss'
})
export class ProductCatalogScreenComponent {
  products: AppShellProduct[] = [];
  filteredProducts: AppShellProduct[] = [];
  filters: AppShellFilter[] = [];

  noProductsIcon?: string;
  noProductsHtmlMessage?: string;
  isLoading = false;

  constructor(private catalogService: CatalogService) {
    this.isLoading = true;
    this.catalogService.getProductsList().subscribe(products => {
      if(!products || products.length === 0) {
        this.noProductsIcon = 'sentiment_dissatisfied';
        this.noProductsHtmlMessage = 'Sorry, we are having trouble loading the results.<br/> Please check back in a few minutes.';
      }
      setTimeout(() => {
        this.products = products;
        this.filterProducts(new Map<string, string[]>());
        this.isLoading = false;
      }, 3000);
    });
    this.catalogService.getFilters().subscribe(filters => {
      this.filters = filters;
    });
    this.filterProducts(new Map<string, string[]>());
  }

  breadcrumbLinks: AppShellLink[] = []

  filterProducts(activeFilters: Map<string, string[]>): void {
    const filters = Array.from(activeFilters.values()).flat();
    if(filters.length === 0) { 
      this.filteredProducts = [...this.products]
    } else {
      this.filteredProducts = this.products.filter(product => {
        if(!product.tags) return false;
        for (const [key, values] of activeFilters) {
          const tag = product.tags.find(tag => tag.label === key);
          if (!tag || !values.every(value => tag.options.includes(value))) {
            return false;
          }
        }
        return true
      });
    }
    if(!this.products || this.products.length === 0) {
      this.noProductsIcon = 'sentiment_dissatisfied';
      this.noProductsHtmlMessage = 'Sorry, we are having trouble loading the results.<br/> Please check back in a few minutes.';
    } else {
      if(!this.filteredProducts || this.filteredProducts.length === 0) {
        this.noProductsIcon = 'search';
        this.noProductsHtmlMessage = '<b>NO RESULTS.</b><br/>Adjust your filters to see more options.';
      }
    }
  }
}
