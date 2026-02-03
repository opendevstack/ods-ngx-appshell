import { Component, DebugElement } from '@angular/core';
import { AppShellLinkDirective } from './appshell-link.directive';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
    template: `<a appShellLink="http://google.com">An External Link</a>
    <a appShellLink="www.google.com">Another External Link</a>
    <a appShellLink="/route">An Internal Link</a>`,
    imports: [AppShellLinkDirective]
})
class TestComponent {}

describe('AppShellLinkDirective', () => {

  let fixture;
  let links: DebugElement[];
  const routerStub = jasmine.createSpyObj('router', ['navigate']);

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [AppShellLinkDirective, TestComponent],
      providers: [
        {provide: Router, useValue: routerStub},
      ]
    }).createComponent(TestComponent);
    fixture.detectChanges();
    links = fixture.debugElement.queryAll(By.directive(AppShellLinkDirective));
  });

  it('should define the href for the elements', () => {
    const externalLink = links[0].nativeElement as HTMLInputElement;
    const externalLink2 = links[1].nativeElement as HTMLInputElement;
    const internalLink = links[2].nativeElement as HTMLInputElement;

    expect(externalLink.getAttribute('href')).toEqual('http://google.com');
    expect(externalLink2.getAttribute('href')).toEqual('www.google.com');
    expect(internalLink.getAttribute('href')).toEqual('/route');
  });

  it('on clicking, uses routerLink only for internal links', () => {
    const externalLink = links[0].nativeElement as HTMLInputElement;
    externalLink.dispatchEvent(new Event('click'));
    expect(routerStub.navigate).not.toHaveBeenCalled();
    const externalLink2 = links[1].nativeElement as HTMLInputElement;
    externalLink2.dispatchEvent(new Event('click'));
    expect(routerStub.navigate).not.toHaveBeenCalled();
    const internalLink = links[2].nativeElement as HTMLInputElement;
    internalLink.dispatchEvent(new Event('click'));
    expect(routerStub.navigate).toHaveBeenCalledTimes(1);
  })
});
