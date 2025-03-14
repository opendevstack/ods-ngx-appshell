import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AppShellProduct } from '../../models/appshell-product';
import { AppshellProductViewScreenComponent } from './appshell-product-view-screen.component';
import { provideMarkdown } from 'ngx-markdown';

describe('AppshellProductViewScreenComponent', () => {
  let component: AppshellProductViewScreenComponent;
  let fixture: ComponentFixture<AppshellProductViewScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellProductViewScreenComponent],
      providers: [provideMarkdown()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellProductViewScreenComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pageTitle', '');
    fixture.componentRef.setInput('breadcrumbLinks', []);
    fixture.componentRef.setInput('actionButtonText', '');
    fixture.componentRef.setInput('product', {} as AppShellProduct);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute product labels correctly', fakeAsync(() => {
    const mockProduct: AppShellProduct = {
      tags: [
        { label: '', options: ['Option1', 'Option2'] },
        { label: '', options: ['Option3'] }
      ]
    } as AppShellProduct;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
    const expectedLabels = ['Option1', 'Option2', 'Option3'];
    tick();
    expect(component.productLabels()).toEqual(expectedLabels);
  }));
  
  it('should return an empty array if product tags are undefined', fakeAsync(() => {
    const mockProduct: AppShellProduct = {} as AppShellProduct;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  
    tick();
    expect(component.productLabels()).toEqual([]);
  }));
  
  it('should emit actionButtonClicked event when buttonFn is called', () => {
    spyOn(component.actionButtonClicked, 'emit');

    component.buttonFn();

    expect(component.actionButtonClicked.emit).toHaveBeenCalled();
  });
});
