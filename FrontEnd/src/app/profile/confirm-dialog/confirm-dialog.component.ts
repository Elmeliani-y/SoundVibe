import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
        <button mat-button class="confirm-button" (click)="onConfirm()">{{ data.confirmText }}</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: rgba(45, 43, 82, 0.95);
      backdrop-filter: blur(10px);
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .dialog-content {
      min-width: 320px;
    }
    h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 500;
      color: #fff;
    }
    p {
      margin: 0 0 24px 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }
    [mat-dialog-actions] {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 0;
      margin: 0;
    }
    button {
      text-transform: uppercase;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
    }
    .confirm-button {
      background: #6C63FF;
      color: white;
    }
    .confirm-button:hover {
      background: #5A52E3;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    dialogRef.addPanelClass('custom-dialog-container');
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
