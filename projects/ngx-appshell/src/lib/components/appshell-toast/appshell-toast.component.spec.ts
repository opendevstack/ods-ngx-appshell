import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellToastComponent } from './appshell-toast.component';
import { AppShellNotification } from 'ngx-appshell';

describe('AppShellToastComponent', () => {
  let component: AppShellToastComponent;
  let fixture: ComponentFixture<AppShellToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellToastComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('notification', {} as AppShellNotification);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should emit closed event when closeToast is called', () => {
    spyOn(component.closed, 'emit');
  
    component.closeToast();
  
    expect(component.closed.emit).toHaveBeenCalledWith(true);
  });
  
});