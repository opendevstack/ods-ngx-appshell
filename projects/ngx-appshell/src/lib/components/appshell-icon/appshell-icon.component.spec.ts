import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, Observable } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { AppShellIconComponent } from './appshell-icon.component';

@Component({
  standalone: true,
  imports: [AppShellIconComponent],
  template: `<appshell-icon [icon]="icon"></appshell-icon>`
})
class HostComponent {
  icon = 'home';
  @ViewChild(AppShellIconComponent) comp!: AppShellIconComponent;
}

describe('AppShellIconComponent (constructor effect)', () => {
  let matIconRegistrySpy: jasmine.SpyObj<MatIconRegistry>;

  beforeEach(async () => {
    matIconRegistrySpy = jasmine.createSpyObj('MatIconRegistry', ['getNamedSvgIcon', 'getDefaultFontSetClass']);
    matIconRegistrySpy.getDefaultFontSetClass.and.returnValue(['material-icons']);

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: MatIconRegistry, useValue: matIconRegistrySpy }]
    }).compileComponents();
  });

  function createHost(icon: string) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.icon = icon;
    fixture.detectChanges();
    return fixture;
  }

  it('resolves namespaced svg icon when registry has it', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    matIconRegistrySpy.getNamedSvgIcon.and.returnValue(of(svg));

    const fixture = createHost('dashboard');
    const comp = fixture.debugElement.query(By.directive(AppShellIconComponent)).componentInstance as AppShellIconComponent;

    expect(matIconRegistrySpy.getNamedSvgIcon).toHaveBeenCalledWith('dashboard', 'appshell');
    expect(comp.resolvedSvgIcon()).toBe('appshell:dashboard');
    expect(comp.resolvedFontIcon()).toBe('');
  });

  it('falls back to material font icon when registry errors', () => {
    matIconRegistrySpy.getNamedSvgIcon.and.returnValue(throwError(() => new Error('not found')));

    const fixture = createHost('settings');
    const comp = fixture.debugElement.query(By.directive(AppShellIconComponent)).componentInstance as AppShellIconComponent;

    expect(matIconRegistrySpy.getNamedSvgIcon).toHaveBeenCalledWith('settings', 'appshell');
    expect(comp.resolvedSvgIcon()).toBe('');
    expect(comp.resolvedFontIcon()).toBe('settings');
  });

  it('unsubscribes previous registry subscription when input changes', () => {
    let unsubscribed = false;
    const neverObservable = new Observable<SVGElement>(() => () => { unsubscribed = true; });
    matIconRegistrySpy.getNamedSvgIcon.and.returnValue(neverObservable);

    const fixture = createHost('first');
    const host = fixture.componentInstance;

    // Change the input to trigger effect cleanup and re-subscription
    host.icon = 'second';
    fixture.detectChanges();

    expect(unsubscribed).toBeTrue();
    // Ensure it subscribed again for the new icon name
    expect(matIconRegistrySpy.getNamedSvgIcon.calls.mostRecent().args).toEqual(['second', 'appshell']);
  });

  it('cleans up subscription when component is destroyed', fakeAsync(() => {
    let unsubscribedOnDestroy = false;
    const obs = new Observable<SVGElement>(() => () => { unsubscribedOnDestroy = true; });
    matIconRegistrySpy.getNamedSvgIcon.and.returnValue(obs);

    const fixture = createHost('trash');

    // Destroying the fixture should invoke the effect cleanup (unsubscribe)
    fixture.destroy();

    tick();
    expect(unsubscribedOnDestroy).toBeTrue();
  }));
});
