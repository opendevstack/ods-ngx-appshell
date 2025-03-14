import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppConfigService, provideHttpClientTesting()]
    });
    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load config', async () => {
    const mockConfig = { apiUrl: 'http://example.com' };

    const loadConfigPromise = service.loadConfig();
    const req = httpMock.expectOne('./config/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    await loadConfigPromise;
    expect(service.getConfig()).toEqual(mockConfig);
  });

  it('should handle error when loading config', async () => {
    const consoleSpy = spyOn(console, 'error');

    const loadConfigPromise = service.loadConfig();
    const req = httpMock.expectOne('./config/config.json');
    req.error(new ErrorEvent('Network error'));

    await loadConfigPromise;
    expect(consoleSpy).toHaveBeenCalled();
    expect(service.getConfig()).toBeUndefined();
  });
});
