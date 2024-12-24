import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlbumsService, Album, Track } from '../services/albums.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-album-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-details.component.html',
  styleUrls: ['./album-details.component.css']
})
export class AlbumDetailsComponent implements OnInit {
  album: Album | null = null;
  loading = true;
  error: string | null = null;
  isLiked = false;

  constructor(
    private route: ActivatedRoute,
    private albumsService: AlbumsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('Album ID from route:', id);
      if (id) {
        this.loadAlbumDetails(id);
      } else {
        console.error('No album ID provided in route');
        this.error = 'No album ID provided';
        this.loading = false;
      }
    });
  }

  loadAlbumDetails(id: string): void {
    console.log('Loading album details for ID:', id);
    this.loading = true;
    this.error = null;

    this.albumsService.getAlbumById(id).subscribe({
      next: (album) => {
        console.log('Album details loaded successfully:', album);
        this.album = album;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading album details:', {
          id,
          error: error.message,
          fullError: error
        });
        this.error = 'Failed to load album details. Please try again.';
        this.loading = false;
      }
    });
  }

  playTrack(track: Track): void {
    // TODO: Implement track playback functionality
    console.log('Playing track:', track);
  }

  playAlbum(): void {
    if (this.album?.tracks && this.album.tracks.length > 0) {
      this.playTrack(this.album.tracks[0]);
    }
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
    // TODO: Implement like functionality
    console.log('Album like status:', this.isLiked);
  }

  addToPlaylist(track: Track): void {
    // TODO: Implement add to playlist functionality
    console.log('Adding track to playlist:', track);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
