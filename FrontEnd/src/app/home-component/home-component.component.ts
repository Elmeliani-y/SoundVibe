import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { MusicPlayerComponent } from '../music-player/music-player.component';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule, MusicPlayerComponent, SidebarComponentComponent],
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.css'],
  providers: [MusicService]
})
export class HomeComponentComponent implements OnInit {
  tracks: any[] = [];
  searchQuery: string = '';

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.musicService.getAllTracks().subscribe(
      (data) => {
        this.tracks = data.results || [];
      },
      (error) => {
        console.error('Error loading tracks', error);
      }
    );
  }

  searchTrackByName(): void {
    if (this.searchQuery.trim() === '') {
      this.loadTracks(); // Reload all tracks if search query is empty
      return;
    }

    this.musicService.searchTracks(this.searchQuery).subscribe(
      (data) => {
        this.tracks = data.results || [];
      },
      (error) => {
        console.error('Error searching tracks', error);
      }
    );
  }
}