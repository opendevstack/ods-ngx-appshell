import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductViewScreenComponent } from './product-view-screen.component';
import { CatalogService } from '../../services/catalog.service';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AppShellProduct } from 'ngx-appshell';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { ExampleProductViewDialogComponent } from '../../components/example-product-view-dialog/example-product-view-dialog.component';

describe('ProductViewScreenComponent', () => {
  let component: ProductViewScreenComponent;
  let fixture: ComponentFixture<ProductViewScreenComponent>;
  let catalogServiceSpy: jasmine.SpyObj<CatalogService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    catalogServiceSpy = jasmine.createSpyObj('CatalogService', ['getProduct']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {'snapshot': {params: {'id': '1'}}});
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductViewScreenComponent],
      providers: [
        { provide: CatalogService, useValue: catalogServiceSpy },
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteSpy
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        provideMarkdown()
      ]
    })
    .compileComponents();

    catalogServiceSpy.getProduct.and.returnValue(of({} as AppShellProduct));
    fixture = TestBed.createComponent(ProductViewScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to / if there is no id in the route params', () => {
    activatedRouteSpy.snapshot.params = {};
    fixture = TestBed.createComponent(ProductViewScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to / if the call to retrieve the product fails', () => {
    activatedRouteSpy.snapshot.params = {'id': '1'};
    catalogServiceSpy.getProduct.and.returnValue(throwError(() => new Error('test')));
    fixture = TestBed.createComponent(ProductViewScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should open the product link in a new tab if the product has a link', () => {
    spyOn(window, 'open');
    component.product = { link: 'http://example.com' } as AppShellProduct;
    component.actionButtonFn();
    expect(window.open).toHaveBeenCalledWith('http://example.com', '_blank');
  });

  it('should open the ExampleProductViewDialogComponent if the product does not have a link', () => {
    const dialogSpy = spyOn(component.dialog, 'open');
    component.product = {} as AppShellProduct;
    component.actionButtonFn();
    expect(dialogSpy).toHaveBeenCalledWith(ExampleProductViewDialogComponent, {
      width: '480px',
      autoFocus: false
    });
  });

  it('should log "Secondary button clicked" to the console when clicking on secondary button', () => {
    const consoleSpy = spyOn(console, 'log');
    component.secondaryButtonFn();
    expect(consoleSpy).toHaveBeenCalledWith('Secondary button clicked');
  });

  it('should log "Picked Option" to the console when picking an option', () => {
    const consoleSpy = spyOn(console, 'log');
    component.actionPickFn('Option 1');
    expect(consoleSpy).toHaveBeenCalledWith('Picked option:', 'Option 1');
  });
});
