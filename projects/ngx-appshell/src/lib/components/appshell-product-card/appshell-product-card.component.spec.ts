import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AppShellProductCardComponent } from './appshell-product-card.component';
import { Router } from '@angular/router';

describe('AppShellProductCardComponent', () => {
  let component: AppShellProductCardComponent;
  let fixture: ComponentFixture<AppShellProductCardComponent>;
  let router: Router;

  const myMockWindow = <any> window;
  myMockWindow.requestAnimationFrame = (callback: FrameRequestCallback) => {callback(0); return 0};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellProductCardComponent],
      providers: [ {provide: Window, useValue: myMockWindow} ]
    })
    .compileComponents();

    spyOn(window, 'requestAnimationFrame').and.callFake(callback => { callback(0); return 0} );

    fixture = TestBed.createComponent(AppShellProductCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('title', 'FakeTitle');
    fixture.componentRef.setInput('description', 'FakeDescription');
    fixture.componentRef.setInput('image', 'FakeImage');
    fixture.componentRef.setInput('labels', ['LabelNumOne', 'LabelNumTwo', 'LabelNumThree', 'LabelNumFour', 'LabelNumFive', 'LabelNumSix', 'LabelNumSeven', 'LabelNumEight', 'LabelNumNine', 'LabelNumTen', 'LabelNumEleven', 'LabelNumTwelve', 'LabelNumThirteen', 'LabelNumFourteen']);
    fixture.componentRef.setInput('redirectTo', '/fakeRoute');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the given route', async () => {
    const navigateSpy = spyOn(router, 'navigate');
    const route = '/fakeRoute';
    component.onClick();
    expect(navigateSpy).toHaveBeenCalledWith([route]);
  });

  it('should hide overflowing labels and show extra label', () => {
    const labelsChipSetDiv = component.labelsChipSet.nativeElement.firstChild as HTMLElement;
    spyOnProperty(labelsChipSetDiv as HTMLElement, 'scrollHeight').and.returnValue(100);
    spyOn(component, 'changeExtraLabel').and.callThrough();
  
    component.hideOverflowingLabels();
  
    const hiddenLabels = Array.from(labelsChipSetDiv.children).filter(child => (child as HTMLElement).style.display === 'none');
    expect(hiddenLabels.length).toBeGreaterThan(0);
    expect(component.changeExtraLabel).toHaveBeenCalled();
  });

  it('should call hideOverflowingLabels on window resize', fakeAsync(() => {
    spyOn(component, 'hideOverflowingLabels');
    window.innerWidth = 480;
    window.innerHeight = 600;
    window.resizeTo(480, 600);
    window.dispatchEvent(new Event('resize'));
    tick(1000);
    fixture.detectChanges();
    tick(1000);
    expect(component.hideOverflowingLabels).toHaveBeenCalled();
  }));
  
  it('should not hide labels if there are less than or equal to two labels', () => {
    const labelsChipSetDiv = component.labelsChipSet.nativeElement.firstChild as HTMLElement;
    spyOnProperty(labelsChipSetDiv as HTMLElement, 'scrollHeight').and.returnValue(50);
    labelsChipSetDiv.innerHTML = `
      <div class="label">Label1</div>
      <div class="label">Label2</div>
    `;
  
    component.hideOverflowingLabels();
  
    const hiddenLabels = Array.from(labelsChipSetDiv.children).filter(child => (child as HTMLElement).style.display === 'none');
    expect(hiddenLabels.length).toBe(0);
  });

  it('should change extra label correctly', () => {
    const labelEl = document.createElement('div');
    const existingSpan = document.createElement('span')
    existingSpan.classList.add('mdc-evolution-chip__text-label');
    existingSpan.classList.add('mat-mdc-chip-action-label');
    existingSpan.textContent = 'Something';
    labelEl.appendChild(existingSpan);
    const removedLabels = ['Label4', 'Label5', 'Label6'];
    component.changeExtraLabel(labelEl, removedLabels);
    expect(labelEl.querySelector('.tooltip-text')?.textContent).toBe(removedLabels.reverse().join(', '));
    expect(labelEl.querySelector('.mdc-evolution-chip__text-label.mat-mdc-chip-action-label')?.textContent).toBe(`+${removedLabels.length}`);
  });

  it('should remove existing tooltips if already exist when changing extra label correctly', () => {
    const labelEl = document.createElement('div');
    const existingSpan = document.createElement('span')
    existingSpan.classList.add('tooltip-text');
    existingSpan.textContent = 'Something';
    labelEl.appendChild(existingSpan);
    const removedLabels = ['Label4', 'Label5', 'Label6'];
    component.changeExtraLabel(labelEl, removedLabels);
    expect(labelEl.querySelector('.tooltip-text')?.textContent).toBe(removedLabels.reverse().join(', '));
  });
});

