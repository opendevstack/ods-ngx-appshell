import { Component } from '@angular/core';
import { AppShellProductViewScreenComponent, AppShellProduct, AppShellLink, AppShellPicker, AppShellButton } from 'ngx-appshell';
import { CatalogService } from '../../services/catalog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExampleProductViewDialogComponent } from '../../components/example-product-view-dialog/example-product-view-dialog.component';

@Component({
    selector: 'app-product-view-screen',
    imports: [AppShellProductViewScreenComponent, MatDialogModule],
    templateUrl: './product-view-screen.component.html',
    styleUrl: './product-view-screen.component.scss'
})
export class ProductViewScreenComponent {

  product: AppShellProduct = {} as AppShellProduct;
  actionButton: AppShellButton = { label: 'Provision', tooltip: 'Provision this model', disabled: true };
  secondaryButton: AppShellButton = { label: 'View Code', disabled: true, tooltip: 'View source code on GitHub' };
  actionPicker: AppShellPicker = {
      label: 'More actions',
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
  breadcrumbLinks: AppShellLink[] = []

  constructor(
    private catalogService: CatalogService,
    private router: Router, 
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    const id = this.route.snapshot.params['id'] || '';

    if(id === '') {
      this.router.navigate(['/']);
    }
    
    this.catalogService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.breadcrumbLinks = [];
        this.breadcrumbLinks.push(
          {
            anchor: '/',
            icon: 'house',
          },
          {
            anchor: '/item/' + this.product.id,
            label: this.product.title,
          }
        );
      }, 
      error: () => {
        console.log('Error loading product');
        this.router.navigate(['/']);
      }
    });
  }
  
  actionButtonFn() {
    if(this.product.link) {
      window.open(this.product.link, '_blank');
    } else {
      const buttonElement = document.activeElement as HTMLElement; 
      buttonElement.blur();
      this.dialog.open(ExampleProductViewDialogComponent, {
        width: '480px',
        autoFocus: false
      });
    }
  };

  secondaryButtonFn() {
    console.log('Secondary button clicked');
  };

  actionPickFn(picked: string) {
    console.log('Picked option:', picked);
  }
}
