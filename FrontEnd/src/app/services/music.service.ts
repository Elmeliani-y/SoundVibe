import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  genre?: string;
  image?: string;
  audio_url?: string;
}

interface AudioError extends Error {
  name: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private API_URL = 'http://localhost:3001/music';
  private currentTrack = new BehaviorSubject<Track | null>(null);
  private isPlaying = new BehaviorSubject<boolean>(false);
  private audio: HTMLAudioElement = new Audio();
  private playlist: Track[] = [];
  private currentTrackIndex = -1;
  private isLoading = false;

  constructor(private http: HttpClient) {
    this.audio.addEventListener('ended', () => {
      this.playNext();
    });

    this.audio.addEventListener('loadstart', () => {
      this.isLoading = true;
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading = false;
    });
  }

  getCurrentTrack(): Observable<Track | null> {
    return this.currentTrack.asObservable();
  }

  getIsPlaying(): Observable<boolean> {
    return this.isPlaying.asObservable();
  }

  getAllTracks(): Observable<any> {
    return this.http.get(`${this.API_URL}/all`);
  }

  searchTracks(name: string): Observable<any> {
    return this.http.get(`${this.API_URL}/search/${name}`);
  }

  async playTrack(track: Track) {
    try {
      // If same track, toggle play/pause
      if (this.currentTrack.value?.id === track.id) {
        if (this.isPlaying.value) {
          await this.pause();
        } else {
          await this.resume();
        }
        return;
      }

      // If different track
      if (this.isPlaying.value) {
        await this.pause();
      }

      this.currentTrack.next(track);
      
      if (track.audio_url) {
        this.audio.src = track.audio_url;
        this.audio.load();
        
        try {
          await this.audio.play();
          this.isPlaying.next(true);
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Playback was aborted, this is normal when changing tracks quickly');
          } else {
            console.error('Error playing track:', error);
            this.isPlaying.next(false);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error in playTrack:', error);
      this.isPlaying.next(false);
    }
  }

  async pause() {
    try {
      if (!this.isLoading) {
        await this.audio.pause();
        this.isPlaying.next(false);
      }
    } catch (error: unknown) {
      console.error('Error pausing track:', error);
    }
  }

  async resume() {
    try {
      if (!this.isLoading && this.audio.src) {
        await this.audio.play();
        this.isPlaying.next(true);
      }
    } catch (error: unknown) {
      console.error('Error resuming track:', error);
      this.isPlaying.next(false);
    }
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  seekTo(time: number) {
    if (!this.isLoading && this.audio.src) {
      this.audio.currentTime = time;
    }
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration;
  }

  setPlaylist(tracks: Track[]) {
    this.playlist = tracks;
    this.currentTrackIndex = this.playlist.findIndex(
      track => track.id === this.currentTrack.value?.id
    );
  }

  async playNext() {
    if (this.playlist.length === 0) return;
    
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    await this.playTrack(this.playlist[this.currentTrackIndex]);
  }

  async playPrevious() {
    if (this.playlist.length === 0) return;
    
    this.currentTrackIndex = this.currentTrackIndex - 1;
    if (this.currentTrackIndex < 0) {
      this.currentTrackIndex = this.playlist.length - 1;
    }
    await this.playTrack(this.playlist[this.currentTrackIndex]);
  }
}
