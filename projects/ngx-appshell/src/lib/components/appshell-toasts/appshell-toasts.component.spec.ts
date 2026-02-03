import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellToastsComponent } from './appshell-toasts.component';

describe('AppShellToastsComponent', () => {
  let component: AppShellToastsComponent;
  let fixture: ComponentFixture<AppShellToastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellToastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call toastService.removeToast with the correct id when closeToast is called', () => {
    const toastServiceSpy = spyOn(component['toastService'], 'removeToast');
    const toastId = 1;

    component.closeToast(toastId);

    expect(toastServiceSpy).toHaveBeenCalledWith(toastId);
  });
});
