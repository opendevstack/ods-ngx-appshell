import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleProductViewDialogComponent } from './example-product-view-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

describe('ExampleProductViewDialogComponent', () => {
  let component: ExampleProductViewDialogComponent;
  let fixture: ComponentFixture<ExampleProductViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogContent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => { },
            componentInstance: () => { }
          }
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleProductViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
