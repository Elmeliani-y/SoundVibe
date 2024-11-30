import { Component, OnInit } from '@angular/core';
import { MusicService } from '../services/music.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideComponentComponent } from "../side-component/side-component.component";

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [SideComponentComponent, CommonModule, FormsModule],
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.css'],
  providers: [MusicService]
})
export class HomeComponentComponent implements OnInit {
  searchQuery: string = '';  
  tracks: any[] = [];        
  artists: any[] = [];       

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.searchQuery = ''; 
    this.searchTracks();      
  }

 
  async searchTracks(): Promise<void> {
    try {
      const data = await this.musicService.searchTracks(this.searchQuery);
      this.tracks = data.results; 
      this.artists = data.artists || []; 
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }
}
