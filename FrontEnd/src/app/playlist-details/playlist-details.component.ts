import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from '../services/playlist.service';

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: string;
  genre: string;
  audioUrl: string;
  image: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  tracks: Track[];
}

@Component({
  selector: 'app-playlist-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-details.component.html',
  styleUrls: ['./playlist-details.component.css']
})
export class PlaylistDetailsComponent implements OnInit {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  
  playlist: Playlist | null = null;
  currentTrack: Track | null = null;
  isPlaying: boolean = false;
  progress: number = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const playlistId = params['id'];
      this.loadPlaylist(playlistId);
    });
  }

  loadPlaylist(id: string) {
    this.loading = true;
    this.error = null;

    this.playlistService.getPlaylistById(id).subscribe({
      next: (data) => {
        this.playlist = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load playlist. Please try again.';
        this.loading = false;
        console.error('Error loading playlist:', error);
      }
    });
  }

  playTrack(track: Track) {
    if (this.currentTrack?.id === track.id) {
      this.togglePlay();
      return;
    }
    
    this.currentTrack = track;
    this.isPlaying = true;
    
    // Wait for the audio element to be ready
    setTimeout(() => {
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.play();
      }
    });
  }

  togglePlay() {
    if (!this.audioPlayer) return;

    if (this.isPlaying) {
      this.audioPlayer.nativeElement.pause();
    } else {
      this.audioPlayer.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  previousTrack() {
    if (!this.playlist || !this.currentTrack) return;
    
    const currentIndex = this.playlist.tracks.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex > 0) {
      this.playTrack(this.playlist.tracks[currentIndex - 1]);
    }
  }

  nextTrack() {
    if (!this.playlist || !this.currentTrack) return;
    
    const currentIndex = this.playlist.tracks.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex < this.playlist.tracks.length - 1) {
      this.playTrack(this.playlist.tracks[currentIndex + 1]);
    }
  }

  onTrackEnded() {
    this.nextTrack();
  }

  onTimeUpdate(event: Event) {
    const audio = event.target as HTMLAudioElement;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }
}
