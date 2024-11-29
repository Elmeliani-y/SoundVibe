import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { SideComponentComponent } from "../side-component/side-component.component";
import { MusicService } from '../services/music.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [SideComponentComponent, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.css'], // Corrected property name
  providers: [MusicService] // Register the service here if not already done globally
})
export class HomeComponentComponent {
  searchQuery: string = '';
  tracks: any[] = [];
  artists: any[] = [];

  constructor(private musicService: MusicService) {}

  searchTracks(): void {
    this.musicService.searchTracks(this.searchQuery).subscribe(
      (data) => {
        this.tracks = data.results; // Adjust based on the API response structure
      },
      (error) => {
        console.error('Error fetching tracks:', error);
      }
    );
  }
}
