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
import { AddPlaylistComponent } from '../add-playlist/add-playlist.component';

@Component({
    selector: 'app-create-playlist-dialog',
    template: `
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    <style>
      *{
        background-color: #1A181F;
      }
      .plus{
        background-color: #1A181F;
        color: #C969E6;
        border: none;
        box-shadow: none;
      }
      
      .cancel{
        background-color: #C969E6;
        border-radius: 16px;
        padding: 10px;
        margin-left: 300px;
      }
      .cancel:hover{
        background-color:rgb(205, 157, 219);
      }
      h2{
        box-shadow: none;
        border:none;
      }
    </style>
      <h2 mat-dialog-title>Add to playlist</h2>
      <mat-dialog-content>
        <mat-form-field>
          <button class="plus" (click)="openDialogAddPlaylist()">
            <i class='bx bx-plus' style="color:#C969E6;font-size:20px;font-weight: 400;"></i>
            create new playlist
          </button>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="onCancel()" class="cancel">Cancel</button>
      </mat-dialog-actions>
    `,
    standalone: true,
    imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class CreatePlaylistDialogComponent {
    name: string = '';
    description: string = '';
  
    constructor(
        private dialogRef: MatDialogRef<CreatePlaylistDialogComponent>,
        private dialog: MatDialog
    ) {}
  
    onCancel(): void {
      this.dialogRef.close();
    }
  
    onCreate(): void {
      if (this.name.trim()) {
        this.dialogRef.close({ name: this.name, description: this.description });
      }
    }
    
    openDialogAddPlaylist(): void {
        const dialogRef = this.dialog.open(AddPlaylistComponent, {
          width: '800px',
        });
    }
}