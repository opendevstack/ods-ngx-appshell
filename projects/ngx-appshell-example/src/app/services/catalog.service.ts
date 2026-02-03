import { Injectable } from '@angular/core';
import { AppShellProduct, AppShellFilter } from 'ngx-appshell';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private products: AppShellProduct[] = [
    {
      id: '1',
      title: 'Product 1',
      shortDescription: 'Short description of product 1',
      description: 'Longer Description of product 1 <br/> <img src="https://placehold.co/300x300" width="800px"/>',
      image: 'https://placehold.co/300x300',
      tags: [
        {
          label: 'Filter 1',
          options: ['Option 1', 'Option 2']
        },
        {
          label: 'Filter 2',
          options: ['Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10', 'Option 11', 'Option 12']
        }
      ],
      authors: ['author1', 'author2'],
      date: new Date(),
      link: 'https://www.google.com'
    } as AppShellProduct,
    {
      id: '2',
      title: 'Product 2',
      shortDescription: 'Short description of product 2',
      description: 'Longer Description of product 2',
      image: 'https://placehold.co/300x300',
      tags: [
        {
          label: 'Filter 3',
          options: ['Option 8']
        }
      ],
      authors: ['author1', 'author2'],
      date: new Date()
    } as AppShellProduct,
    {
      id: '3',
      title: 'Product 3',
      shortDescription: 'Short description of product 3',
      description: 'Longer Description of product 3',
      image: 'https://placehold.co/300x300',
      tags: [],
      authors: ['author1', 'author2'],
      date: new Date(),
      link: 'https://www.google.com'
    } as AppShellProduct,
    {
      id: '4',
      title: 'Product 4',
      shortDescription: 'Short description of product 4',
      description: 'Longer Description of product 4',
      image: 'https://placehold.co/300x300',
      tags: [],
      authors: ['author1', 'author2'],
      date: new Date(),
      link: 'https://www.google.com'
    } as AppShellProduct
  ];
  private filters: AppShellFilter[] = [
    {label: 'Filter 1', options: ['Option 1', 'Option 2', 'Option 3'], placeholder: 'Select an option'} as AppShellFilter,
    {label: 'Filter 2', options: ['Option 4', 'Option 5', 'Option 6'], placeholder: 'Select an option'} as AppShellFilter,
    {label: 'Filter 3', options: ['Option 7', 'Option 8', 'Option 9'], placeholder: 'Select an option'} as AppShellFilter
  ];

  constructor() {}

  getProductsList(): Observable<AppShellProduct[]> {
    return of(this.products.map(product => {product.link = `/item/${product.id}`; return product;}));
  }

  getProduct(id: string): Observable<AppShellProduct> {
    const filteredProducts = this.products.filter(product => product.id === id);
    if(filteredProducts && filteredProducts.length > 0) {
      return of(filteredProducts[0]);
    }
    return throwError(() => new Error('Product not found'));
  }

  getFilters(): Observable<AppShellFilter[]> {
    return of(this.filters);
  }

}
