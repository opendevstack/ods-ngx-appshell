import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { AppShellIconComponent } from 'projects/ngx-appshell/src/lib/components/appshell-icon/appshell-icon.component';

@Component({
    selector: 'app-example-product-view-dialog',
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent, AppShellIconComponent],
    templateUrl: './example-product-view-dialog.component.html',
    styleUrl: './example-product-view-dialog.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ExampleProductViewDialogComponent {
  constructor(public dialogRef: MatDialogRef<ExampleProductViewDialogComponent>) {}
}
