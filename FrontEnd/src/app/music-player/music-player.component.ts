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

  play() {
    if (this.currentTrack) {
      this.musicService.resume();
    }
  }

  pause() {
    this.musicService.pause();
  }

  nextTrack() {
    // Implement next track logic
  }

  previousTrack() {
    // Implement previous track logic
  }

  onProgressChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.musicService.seekTo(Number(input.value));
  }

  setVolume(volume: number) {
    this.musicService.setVolume(volume);
  }

  toggleRepeatMode() {
    this.isRepeatMode = !this.isRepeatMode;
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  loadPlaylists() {
    this.http.get<Playlist[]>('http://localhost:3002/playlists-user').subscribe(
      (playlists) => {
        this.playlists = playlists;
      },
      (error) => {
        console.error('Error loading playlists:', error);
      }
    );
  }

  openAddToPlaylistMenu(event: MouseEvent) {
    event.stopPropagation();
    // Position the menu near the button
    this.playlistMenuTop = `${event.clientY}px`;
    this.playlistMenuLeft = `${event.clientX}px`;
    this.showPlaylistMenu = true;
  }

  addToPlaylist(playlistId: string) {
    if (!this.currentTrack) return;
    
    this.http.post(`http://localhost:3002/playlists/${playlistId}/tracks`, {
      trackId: this.currentTrack.id
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
    this.http.get<boolean>(`http://localhost:3002/playlists/check-track/${trackId}`).subscribe(
      (isInPlaylist) => {
        this.isInPlaylist = isInPlaylist;
      },
      (error) => {
        console.error('Error checking track in playlist:', error);
      }
    );
  }

  openCreatePlaylistDialog() {
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('http://localhost:3002/playlists/new-pl', result).subscribe(
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
}

