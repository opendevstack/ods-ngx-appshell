import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppshellSelectComponent } from './appshell-select.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('AppshellSelectComponent', () => {
  let component: AppshellSelectComponent;
  let fixture: ComponentFixture<AppshellSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppshellSelectComponent, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppshellSelectComponent);
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
