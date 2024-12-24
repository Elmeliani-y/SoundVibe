import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError } from 'rxjs';

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  genre?: string;
  image?: string;
  audio_url?: string;
  lyrics?: string;
  isLiked?: boolean;
}

interface AudioError extends Error {
  name: string;
  message: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  image?: string;
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
  private repeatMode = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.audio.addEventListener('ended', () => {
      if (this.repeatMode.value) {
        // If repeat is on, restart the current track
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        // Otherwise, play next track
        this.playNext();
      }
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

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      }),
      withCredentials: true
    };
  }

  getAllTracks(): Observable<any> {
    return this.http.get(`${this.API_URL}/all`, this.getHttpOptions());
  }

  searchTracks(name: string): Observable<any> {
    return this.http.get(`${this.API_URL}/search/${name}`, this.getHttpOptions());
  }

  getTrackById(id: string): Observable<Track> {
    return this.http.get<Track>(`${this.API_URL}/track/${id}`, this.getHttpOptions());
  }

  getLyrics(trackId: string): Observable<string> {
    return this.http.get<string>(`${this.API_URL}/lyrics/${trackId}`, this.getHttpOptions());
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

  likeTrack(trackId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/like/${trackId}`, {}, this.getHttpOptions());
  }

  unlikeTrack(trackId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/like/${trackId}`, this.getHttpOptions());
  }

  getUserPlaylists(): Observable<any> {
    return this.http.get(`${this.API_URL}/playlists-user`, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('Error fetching playlists:', error);
        throw error;
      })
    );
  }

  addToPlaylist(playlistId: string, trackId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/playlists/${playlistId}/tracks`,
      { trackId },
      this.getHttpOptions()
    ).pipe(
      catchError(error => {
        console.error('Error adding track to playlist:', error);
        throw error;
      })
    );
  }

  createPlaylist(name: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/playlists`,
      { name },
      this.getHttpOptions()
    ).pipe(
      catchError(error => {
        console.error('Error creating playlist:', error);
        throw error;
      })
    );
  }

  getRepeatMode(): Observable<boolean> {
    return this.repeatMode.asObservable();
  }

  setRepeatMode(repeat: boolean) {
    this.repeatMode.next(repeat);
  }

  private getToken(): string {
    // implement token retrieval logic here
    return '';
  }
}
