import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MusicService, Track } from '../services/music.service';
import { SidebarComponentComponent } from '../sidebar-component/sidebar-component.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MusicPlayerComponent } from '../music-player/music-player.component';

interface Artist {
  id: string;
  name: string;
  image?: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponentComponent,
    NavbarComponent,
    MusicPlayerComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  @ViewChild('trackList') trackList!: ElementRef;
  @ViewChild('artistList') artistList!: ElementRef;
  
  favoriteTracks: Track[] = [];
  favoriteArtists: Artist[] = [];
  isLoading = false;
  error: string | null = null;
  showMusicPlayer = false;

  constructor(private musicService: MusicService) {
    // Subscribe to current track to show/hide music player
    this.musicService.getCurrentTrack().subscribe(track => {
      this.showMusicPlayer = !!track;
    });
  }

  ngOnInit(): void {
    this.loadFavoriteTracks();
    this.loadFavoriteArtists();
  }

  loadFavoriteTracks(): void {
    this.isLoading = true;
    this.error = null;
    
    this.musicService.getFavoriteTracks().subscribe({
      next: (response) => {
        this.favoriteTracks = response.tracks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorite tracks:', error);
        this.error = 'Failed to load favorite tracks. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadFavoriteArtists(): void {
    this.isLoading = true;
    this.error = null;
    
    this.musicService.getFavoriteArtists().subscribe({
      next: (artists) => {
        this.favoriteArtists = artists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorite artists:', error);
        this.error = 'Failed to load favorite artists. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  playTrack(track: Track): void {
    this.musicService.playTrack(track);
    this.showMusicPlayer = true;
  }

  removeFavorite(trackId: string): void {
    this.musicService.unlikeTrack(trackId).subscribe({
      next: () => {
        this.favoriteTracks = this.favoriteTracks.filter(track => track.id !== trackId);
      },
      error: (error) => {
        console.error('Error removing track from favorites:', error);
      }
    });
  }

  onScroll(event: Event): void {
    const element = this.trackList.nativeElement;
    const scrollPercentage = (element.scrollLeft / (element.scrollWidth - element.clientWidth)) * 100;
    const progressThumb = document.querySelector('.progress-thumb') as HTMLElement;
    if (progressThumb) {
      progressThumb.style.width = `${scrollPercentage}%`;
    }
  }

  onArtistScroll(event: Event): void {
    // You can add similar scroll behavior for artists section if needed
  }
}
