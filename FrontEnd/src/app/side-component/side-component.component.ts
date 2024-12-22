import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPlaylistComponent } from '../add-playlist/add-playlist.component';

@Component({
  selector: 'app-side-component',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './side-component.component.html',
  styleUrl: './side-component.component.css'
})
export class SideComponentComponent {
  constructor(private dialog: MatDialog) {}

  openAddPlaylistDialog(): void {
    this.dialog.open(AddPlaylistComponent, {
      width: '400px',
      data: { title: 'Add New Playlist' }
    });
  }
}
