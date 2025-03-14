import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-example-product-view-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent],
  templateUrl: './example-product-view-dialog.component.html',
  styleUrl: './example-product-view-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExampleProductViewDialogComponent {
  constructor(public dialogRef: MatDialogRef<ExampleProductViewDialogComponent>) {}
}
