import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPlaylistComponent } from '../add-playlist/add-playlist.component';
import { PlaylistService, Playlist } from '../services/playlist.service';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [RouterModule, CommonModule, MatDialogModule],
  templateUrl: './sidebar-component.component.html',
  styleUrls: ['./sidebar-component.component.css']
})
export class SidebarComponentComponent implements OnInit {
  playlists: Playlist[] = [];

  constructor(
    private dialog: MatDialog,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    this.playlistService.getPlaylists().subscribe({
      next: (data) => {
        this.playlists = data;
      },
      error: (error) => {
        console.error('Error loading playlists:', error);
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddPlaylistComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlaylists(); // Reload playlists after creating a new one
      }
    });
  }
}
