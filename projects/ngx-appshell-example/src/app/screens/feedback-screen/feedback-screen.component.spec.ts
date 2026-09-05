import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FeedbackScreenComponent } from './feedback-screen.component';

describe('FeedbackScreenComponent', () => {
  let component: FeedbackScreenComponent;
  let fixture: ComponentFixture<FeedbackScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, FeedbackScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show both the default questionnaire and the supplied one', () => {
    const questionnaires = fixture.nativeElement.querySelectorAll('appshell-feedback');
    expect(questionnaires.length).toBe(2);
  });

  it('should keep the answers the component emits', () => {
    component.onSubmitted({ taskSuccess: 'Yes', perceivedEfficiency: 4 });
    expect(component.lastAnswers).toEqual({ taskSuccess: 'Yes', perceivedEfficiency: 4 });
  });

  it('should clear them again when the questionnaire is dismissed', () => {
    component.onSubmitted({ taskSuccess: 'Yes' });
    component.onDismissed();
    expect(component.lastAnswers).toBeUndefined();
  });
});
