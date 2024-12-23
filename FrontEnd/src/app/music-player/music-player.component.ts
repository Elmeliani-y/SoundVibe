import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class MusicPlayerComponent implements OnInit {
  audio: HTMLAudioElement = new Audio();
  currentTrack: { name: string; artist: string; albumImage: string; audioUrl: string } | null = null;
  isPlaying: boolean = false;
  isShuffle: boolean = false;
  repeatMode: boolean = false; // Property to track repeat mode
  repeatModes = ['none', 'one', 'all'];
  currentRepeatModeIndex = 0;
  currentRepeatMode = this.repeatModes[0];
  volume: number = 1;
  currentTime: number = 0;
  totalTime: number = 0;
  currentTimePercentage: number = 0;
  playlist: { name: string; artist: string; albumImage: string; audioUrl: string }[] = [];
  currentTrackIndex: number = 0;
  currentTrackNumber: number = 0;
  timingOptions: string[] = ['0:00', '0:30', '1:00', '1:30', '2:00'];
  songs: { name: string; artist: string; albumImage: string; audioUrl: string }[] = []; 
  pausedTime: number = 0; 

  constructor() {
    this.audio.volume = this.volume;

    this.audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(this.audio.duration)) {
        this.totalTime = this.audio.duration;
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.repeatModes[this.currentRepeatModeIndex] === 'one') {
        this.play();
      } else if (this.repeatModes[this.currentRepeatModeIndex] === 'all') {
        this.nextTrack();
      } else {
        this.isPlaying = false;
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration && !isNaN(this.audio.currentTime)) {
        this.currentTime = this.audio.currentTime;
        this.currentTimePercentage = (this.currentTime / this.audio.duration) * 100;
      }
    });

    this.fetchSongsFromJamendo();
  }

  ngOnInit(): void {
    this.audio.addEventListener('ended', () => {
      if (this.repeatMode) {
        this.audio.currentTime = 0; // Restart the song
        this.audio.play(); // Play the song again
      } else {
        this.nextTrack(); // Skip to the next track
      }
    });
    this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
  }

  fetchSongsFromJamendo() {
    const clientId = 'f9409435';
    fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=10`)
      .then(response => response.json())
      .then(data => {
        this.playlist = data.results.map((track: any) => ({
          name: track.name,
          artist: track.artist_name,
          albumImage: track.album_image || 'default-image.jpg',
          audioUrl: track.audio,
        }));
        // Automatically select the first track
        if (this.playlist.length > 0) {
          this.selectTrack(this.playlist[0]);
        }
      })
      .catch(error => console.error('Error fetching songs:', error));
  }

  play() {
    if (this.currentTrack) {
      if (!this.isPlaying) {
        this.audio.src = this.currentTrack.audioUrl; // Set the audio source
        this.audio.currentTime = this.pausedTime; // Ensure it resumes from the paused time
        this.audio.play();
        this.isPlaying = true;
        console.log('Playing:', this.currentTrack.name);
      }
    } else {
      console.log('No track selected');
    }
  }

  pause() {
    console.log('Pause button clicked');
    this.pausedTime = this.audio.currentTime; // Store the current time when paused
    this.audio.pause();
    this.isPlaying = false;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
  }

  toggleRepeat() {
    this.repeatMode = !this.repeatMode;
  }

  seekTo(value: number) {
    const time = (value / 100) * this.audio.duration;
    this.audio.currentTime = time;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.songs.length;
    this.currentTrack = this.songs[this.currentTrackIndex];
    this.play(); // Automatically play the next track
  }

  previousTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.songs.length) % this.songs.length;
    this.currentTrack = this.songs[this.currentTrackIndex];
    this.play(); // Automatically play the previous track
  }

  toggleRepeatMode() {
    this.currentRepeatModeIndex = (this.currentRepeatModeIndex + 1) % this.repeatModes.length;
    this.currentRepeatMode = this.repeatModes[this.currentRepeatModeIndex];
    this.audio.loop = this.currentRepeatMode === 'one';
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
    console.log('Volume set to:', volume);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) {
      return '0:00'; // If time is NaN, return 0:00
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  selectTrack(track: { name: string; artist: string; albumImage: string; audioUrl: string }) {
    this.currentTrack = track;
    this.currentTrackNumber = this.currentTrackIndex;
    this.audio.src = track.audioUrl;
    this.audio.load();
    this.play();
  }

  onTimingSelect(selectedTime: string): void {
    const timeParts = selectedTime.split(':');
    const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    this.audio.currentTime = seconds;
  }

  onProgressChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    this.seekTo(value);
  }

  public onProgressChangeValue(selectedTime: number | null): void {
    if (selectedTime !== null && this.audio.readyState >= 2) {
      console.log('Setting currentTime to:', selectedTime);
      this.audio.currentTime = selectedTime;
    } else {
      console.log('Audio not ready or selectedTime is null');
    }
  }

  updateProgressBar() {
    if (this.audio && !isNaN(this.audio.currentTime) && this.audio.duration) {
      this.currentTime = this.audio.currentTime;
      this.totalTime = this.audio.duration;
    }
  }

  isPlayButtonDisabled(): boolean {
    return this.songs.length === 0;
  }
}
