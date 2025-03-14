import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppshellProductCatalogScreenComponent } from './appshell-product-catalog-screen.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockAppshellBreadcrumbComponent } from '../../components/appshell-breadcrumb/mock-appshell-breadcrumb.component';
import { AppShellProduct } from '../../models/appshell-product';

describe('AppshellProductCatalogScreenComponent', () => {
  let component: AppshellProductCatalogScreenComponent;
  let fixture: ComponentFixture<AppshellProductCatalogScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellProductCatalogScreenComponent, BrowserAnimationsModule, MockAppshellBreadcrumbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellProductCatalogScreenComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pageTitle', '');
    fixture.componentRef.setInput('breadcrumbLinks', []);
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('filters', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return an empty array if product has no tags', () => {
    const product = { tags: [] } as unknown as AppShellProduct;
    const result = component.getProductLabels(product);
    expect(result).toEqual([]);
  });

  it('should return an array of tag options if product has tags', () => {
    const product = {
      tags: [
        { options: ['option1', 'option2'] },
        { options: ['option3'] }
      ]
    } as AppShellProduct;
    const result = component.getProductLabels(product);
    expect(result).toEqual(['option1', 'option2', 'option3']);
  });

  it('should return an empty array if product tags are undefined', () => {
    const product = {} as AppShellProduct;
    const result = component.getProductLabels(product);
    expect(result).toEqual([]);
  });
});
