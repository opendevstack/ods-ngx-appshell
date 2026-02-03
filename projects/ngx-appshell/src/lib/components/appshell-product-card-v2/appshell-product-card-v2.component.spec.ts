import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellProductCardV2Component } from './appshell-product-card-v2.component';
import { Router } from '@angular/router';

describe('AppShellProductCardV2Component', () => {
  let component: AppShellProductCardV2Component;
  let fixture: ComponentFixture<AppShellProductCardV2Component>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellProductCardV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellProductCardV2Component);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('title', 'FakeTitle');
    fixture.componentRef.setInput('description', 'FakeDescription');
    fixture.componentRef.setInput('image', 'FakeImage');
    fixture.componentRef.setInput('link', 'FakeLink');
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
});
