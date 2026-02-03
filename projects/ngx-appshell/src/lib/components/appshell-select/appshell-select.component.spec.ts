import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellSelectComponent } from './appshell-select.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('AppShellSelectComponent', () => {
  let component: AppShellSelectComponent;
  let fixture: ComponentFixture<AppShellSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellSelectComponent, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Text');
    fixture.componentRef.setInput('options', ['Option 1', 'Option 2']);
    fixture.componentRef.setInput('placeholder', 'Text');
  
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
