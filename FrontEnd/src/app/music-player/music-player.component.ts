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
import {CreatePlaylistDialogComponent} from './CreatePlaylistDialogComponent';

interface Playlist {
  id: string;
  name: string;
  owner: string;
  tracks: Track[];
}

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule,CreatePlaylistDialogComponent]
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  private readonly USER_API_URL = 'http://localhost:3001';
  currentTrack: Track | null = null;
  isPlaying: boolean = false;
  volume: number = 1;
  currentTime: number = 0;
  totalTime: number = 0;
  isRepeatMode: boolean = false;
  private subscriptions: Subscription[] = [];
  
  // Playlist related properties
  playlists: Playlist[] = [];
  showPlaylistMenu: boolean = false;
  playlistMenuTop: string = '0px';
  playlistMenuLeft: string = '0px';
  isInPlaylist: boolean = false;
  isInFavorites: boolean = false;

  constructor(
    private musicService: MusicService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    setInterval(() => {
      if (this.isPlaying) {
        this.currentTime = this.musicService.getCurrentTime();
        this.totalTime = this.musicService.getDuration();
      }
    }, 1000);
  }

  ngOnInit() {
    this.loadPlaylists();
    
    this.subscriptions.push(
      this.musicService.getCurrentTrack().subscribe(track => {
        this.currentTrack = track;
        if (track) {
          this.checkIfInPlaylist(track.id);
          this.checkIfInFavorites(track.id);
        }
      })
    );

    this.subscriptions.push(
      this.musicService.getIsPlaying().subscribe(isPlaying => {
        this.isPlaying = isPlaying;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  togglePlay() {
    if (this.currentTrack) {
      if (this.isPlaying) {
        this.musicService.pause();
      } else {
        this.musicService.resume();
      }
    }
  }

  playNext() {
    this.musicService.playNext();
  }

  playPrevious() {
    this.musicService.playPrevious();
  }

  setVolume(value: string | number) {
    const volume = typeof value === 'string' ? parseFloat(value) : value;
    this.volume = volume;
    this.musicService.setVolume(volume);
  }

  toggleRepeat() {
    this.isRepeatMode = !this.isRepeatMode;
    this.musicService.setRepeatMode(this.isRepeatMode);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  loadPlaylists() {
    this.http.get<Playlist[]>('http://localhost:3002/playlists-user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe(
      (playlists) => {
        this.playlists = playlists;
      },
      (error) => {
        console.error('Error loading playlists:', error);
      }
    );
  }

  addToPlaylist(playlistId: string) {
    if (!this.currentTrack) {
      return;
    }
    
    this.http.post(`http://localhost:3002/playlists/${playlistId}/tracks`, {
      trackId: this.currentTrack.id
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe(
      () => {
        this.showPlaylistMenu = false;
        this.isInPlaylist = true;
      },
      (error) => {
        console.error('Error adding track to playlist:', error);
      }
    );
  }

  checkIfInPlaylist(trackId: string) {
    this.http.get<boolean>(`http://localhost:3002/playlists/check-track/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe(
      (isInPlaylist) => {
        this.isInPlaylist = isInPlaylist;
      },
      (error) => {
        console.error('Error checking playlist:', error);
      }
    );
  }

  checkIfInFavorites(trackId: string) {
    this.http.get<{ isInFavorites: boolean }>(
      `${this.USER_API_URL}/users/favorites/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    ).subscribe(
      (response) => {
        this.isInFavorites = response.isInFavorites;
      },
      (error) => {
        console.error('Error checking favorites:', error);
        this.isInFavorites = false;
      }
    );
  }

  async toggleFavorite() {
    if (!this.currentTrack) return;
    
    try {
      if (this.isInFavorites) {
        // Remove from favorites
        await this.http.delete(
          `${this.USER_API_URL}/users/favorites/tracks/${this.currentTrack.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        ).toPromise();
        this.isInFavorites = false;
      } else {
        // Add to favorites
        await this.http.post(
          `${this.USER_API_URL}/users/favorites/tracks`,
          {
            trackId: this.currentTrack.id,
            name: this.currentTrack.name,
            artist: this.currentTrack.artist_name,
            image: this.currentTrack.image || 'default-image.jpg'
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        ).toPromise();
        this.isInFavorites = true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  openCreatePlaylistDialog() {
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('http://localhost:3002/playlists/new-pl', result, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }).subscribe(
          () => {
            this.loadPlaylists();
          },
          (error) => {
            console.error('Error creating playlist:', error);
          }
        );
      }
    });
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.setVolume(input.value);
    }
  }

  onProgressChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.musicService.seekTo(Number(input.value));
    }
  }
}
