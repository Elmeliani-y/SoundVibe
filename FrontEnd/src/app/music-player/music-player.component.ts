import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MusicService, Track } from '../services/music.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isPlaying: boolean = false;
  volume: number = 1;
  currentTime: number = 0;
  totalTime: number = 0;
  isShuffleMode: boolean = false;
  isRepeatMode: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private musicService: MusicService) {
    // Update current time every second
    setInterval(() => {
      if (this.isPlaying) {
        this.currentTime = this.musicService.getCurrentTime();
        this.totalTime = this.musicService.getDuration();
      }
    }, 1000);
  }

  ngOnInit() {
    // Subscribe to track changes
    this.subscriptions.push(
      this.musicService.getCurrentTrack().subscribe(track => {
        this.currentTrack = track;
      })
    );

    // Subscribe to playing state changes
    this.subscriptions.push(
      this.musicService.getIsPlaying().subscribe(isPlaying => {
        this.isPlaying = isPlaying;
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  play() {
    this.musicService.resume();
  }

  pause() {
    this.musicService.pause();
  }

  previousTrack() {
    this.musicService.playPrevious();
  }

  nextTrack() {
    this.musicService.playNext();
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
    // Implement repeat logic in music service if needed
  }

  toggleShuffle() {
    this.isShuffleMode = !this.isShuffleMode;
    // Implement shuffle logic in music service if needed
  }

  formatTime(time: number): string {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
