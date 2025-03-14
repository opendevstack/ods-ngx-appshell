import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProductViewScreenComponent } from './product-view-screen.component';
import { CatalogService } from '../../services/catalog.service';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
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
  let activatedRouteSubject = new Subject();

  beforeEach(async () => {
    activatedRouteSubject.next({'id': '1'});
    catalogServiceSpy = jasmine.createSpyObj('CatalogService', ['getProduct']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {'params': activatedRouteSubject});
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

  it('should navigate to / if there is no id in the route params', fakeAsync(() => {
    component.ngOnInit();
    activatedRouteSubject.next({});
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should navigate to / if the call to retrieve the product fails', fakeAsync(() => {
    catalogServiceSpy.getProduct.and.returnValue(throwError(() => new Error('test')));
    component.ngOnInit();
    activatedRouteSubject.next({'id': '1'});
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  }));

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
});
