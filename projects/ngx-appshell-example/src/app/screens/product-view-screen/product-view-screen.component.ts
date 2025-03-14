import { Component } from '@angular/core';
import { AppshellProductViewScreenComponent, AppShellProduct, AppShellLink } from 'ngx-appshell';
import { CatalogService } from '../../services/catalog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExampleProductViewDialogComponent } from '../../components/example-product-view-dialog/example-product-view-dialog.component';

@Component({
  selector: 'app-product-view-screen',
  standalone: true,
  imports: [AppshellProductViewScreenComponent, MatDialogModule],
  templateUrl: './product-view-screen.component.html',
  styleUrl: './product-view-screen.component.scss'
})
export class ProductViewScreenComponent {

  product: AppShellProduct = {} as AppShellProduct;
  actionButtonText: string | undefined;
  breadcrumbLinks: AppShellLink[] = []

  constructor(
    private catalogService: CatalogService,
    private router: Router, 
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'] || '';

      if(id === '') {
        this.router.navigate(['/']);
      }
      
      this.catalogService.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          this.actionButtonText = 'View Code';
          this.breadcrumbLinks = [
            {
              anchor: '/item/' + this.product.id,
              label: this.product.title,
            }
          ]
        }, 
        error: () => {
          console.log('Error loading product');
          this.router.navigate(['/']);
        }
      });
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
}
