import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellConfiguration as AppShellConfig } from './appshell.configuration';
import { AppShellToastsComponent } from 'ngx-appshell';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AppShellToastsComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  toastLimitInScreen: number = AppShellConfig.toastLimitInScreen;

  constructor(private matIconReg: MatIconRegistry) {}

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }
}
