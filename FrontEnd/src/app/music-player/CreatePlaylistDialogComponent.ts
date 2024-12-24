
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MusicService, Track } from '../services/music.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@Component({
    selector: 'app-create-playlist-dialog',
    template: `
      <h2 mat-dialog-title>Create New Playlist</h2>
      <mat-dialog-content>
        <mat-form-field>
          <input matInput [(ngModel)]="name" placeholder="Playlist Name">
        </mat-form-field>
        <mat-form-field>
          <textarea matInput [(ngModel)]="description" placeholder="Description"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-button color="primary" (click)="onCreate()">Create</button>
      </mat-dialog-actions>
    `,
    standalone: true,
    imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
  })
  export class CreatePlaylistDialogComponent {
    name: string = '';
    description: string = '';
  
    constructor(private dialogRef: MatDialogRef<CreatePlaylistDialogComponent>) {}
  
    onCancel(): void {
      this.dialogRef.close();
    }
  
    onCreate(): void {
      if (this.name.trim()) {
        this.dialogRef.close({ name: this.name, description: this.description });
      }
    }
  }
  