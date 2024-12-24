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
        this.playlists = [];
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
    this.http.get<{ isInPlaylist: boolean }>(`http://localhost:3002/playlists/check-track/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }).subscribe(
      (response) => {
        this.isInPlaylist = response.isInPlaylist;
      },
      (error) => {
        console.error('Error checking playlist:', error);
        this.isInPlaylist = false;
      }
    );
  }

  checkIfInFavorites(trackId: string) {
    this.musicService.checkIfFavorite(trackId).subscribe(
      (response) => {
        this.isInFavorites = response.isLiked;
      },
      (error) => {
        console.error('Error checking favorites:', error);
        this.isInFavorites = false;
      }
    );
  }

  toggleFavorite() {
    if (!this.currentTrack) return;

    if (this.isInFavorites) {
      this.musicService.unlikeTrack(this.currentTrack.id).subscribe(
        (response) => {
          if (response.success) {
            this.isInFavorites = false;
          }
        },
        (error) => {
          console.error('Error removing track from favorites:', error);
        }
      );
    } else {
      this.musicService.likeTrack(this.currentTrack.id).subscribe(
        (response) => {
          if (response.success) {
            this.isInFavorites = true;
          }
        },
        (error) => {
          console.error('Error adding track to favorites:', error);
        }
      );
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
