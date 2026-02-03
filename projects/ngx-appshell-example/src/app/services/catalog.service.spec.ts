import { TestBed } from '@angular/core/testing';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogService
      ]
    });

    service = TestBed.inject(CatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of products', (done) => {
    service.getProductsList().subscribe(products => {
      expect(products.length).toBeGreaterThan(0);
      done();
    });
  });
  
  it('should return a product', (done) => {
    service.getProduct('1').subscribe(product => {
      expect(product).toBeTruthy();
      done();
    });
  });
  
  it('should throw an error if the product does not exist', (done) => {
    service.getProduct('wrong').subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should return a list of filters', (done) => {
    service.getFilters().subscribe(filters => {
      expect(filters.length).toBeGreaterThan(0);
      done();
    });
  });

});
