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

  it('should show the standard, the four-step and the host-supplied questionnaires', () => {
    const questionnaires = fixture.nativeElement.querySelectorAll('appshell-feedback');
    expect(questionnaires.length).toBe(3);
  });

  it('should name the product for the standard questionnaire', () => {
    expect(component.standard.productName).toBe('Onboarding Hub');
    expect(component.standard.questions).toEqual([]);
  });

  it('should give the standard questionnaire the product-specific fifth step', () => {
    const cards = fixture.nativeElement.querySelectorAll('appshell-feedback');
    expect(component.standard.productQuestion?.id).toBe('productQuestion');
    expect(cards[0].querySelector('.feedback-progress')?.textContent).toContain('of 5');
  });

  it('should leave the four-step variant without it, so its fourth step submits', () => {
    const cards = fixture.nativeElement.querySelectorAll('appshell-feedback');
    expect(component.fourSteps.productQuestion).toBeUndefined();
    expect(cards[1].querySelector('.feedback-progress')?.textContent).toContain('of 4');
  });

  it('should keep the answers the component emits', () => {
    component.onSubmitted({ goal: ['Other'], satisfaction: 4 });
    expect(component.lastAnswers).toEqual({ goal: ['Other'], satisfaction: 4 });
  });

  it('should clear them again when the questionnaire is dismissed', () => {
    component.onSubmitted({ goalAchieved: 'Yes' });
    component.onDismissed();
    expect(component.lastAnswers).toBeUndefined();
  });

  it('should hide the launchers once they have been answered', () => {
    component.onLauncherSubmitted({ goalAchieved: 'Yes' });
    expect(component.alreadyAsked).toBeTrue();
    expect(component.lastAnswers).toEqual({ goalAchieved: 'Yes' });
  });
});
