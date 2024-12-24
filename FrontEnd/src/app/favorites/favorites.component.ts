import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MusicService, Track } from '../services/music.service';
import { SidebarComponentComponent } from '../sidebar-component/sidebar-component.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponentComponent,
    NavbarComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  @ViewChild('trackList') trackList!: ElementRef;
  favoriteTracks: Track[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadFavoriteTracks();
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

  playTrack(track: Track): void {
    this.musicService.playTrack(track);
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
}
