import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { AddPlaylistComponent } from '../add-playlist/add-playlist.component';
@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [ RouterModule,CommonModule],
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.css'
})
export class SidebarComponentComponent {

  constructor(private dialog: MatDialog) {}

  openAddPlaylistDialog(): void {
    this.dialog.open(AddPlaylistComponent, {
      width: '400px',
      data: { title: 'Add New Playlist' }
    });
  }
}
