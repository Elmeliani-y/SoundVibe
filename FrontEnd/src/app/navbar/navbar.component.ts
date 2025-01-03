import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';
import { SearchService, SearchResult } from '../services/search.service';
import { ProfileUpdateService } from '../services/profile-update.service';
import { UserService } from '../services/user.service';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUserId: string = 'user1';
  userProfilePic: string | null = null;
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  showResults: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  showProfileDropdown: boolean = false;

  constructor(
    private searchService: SearchService,
    private router: Router,
    private profileUpdateService: ProfileUpdateService,
    private userService: UserService,
    private musicService: MusicService
  ) {}

  ngOnInit() {
    // Subscribe to profile picture updates
    this.profileUpdateService.profilePicture$
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        this.userProfilePic = url;
      });

    // Get initial profile picture
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.profilePicture) {
          this.userProfilePic = this.getProfilePictureUrl(user.profilePicture);
        }
      }
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProfilePictureUrl(url: string | null): string {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/uploads')) {
      return `http://localhost:3000${url}`;
    }
    
    return `http://localhost:3000/${url}`;
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.error = null;
    this.searchSubject.next(query);
  }

  private performSearch(query: string) {
    if (!query.trim()) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.isLoading = true;
    this.searchService.search(query)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results) => {
          console.log('Search Results:', results); // Debug log
          this.searchResults = results;
          this.showResults = results.length > 0;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = 'An error occurred while searching. Please try again.';
          this.searchResults = [];
          this.showResults = false;
        }
      });
  }

  selectResult(result: SearchResult) {
    if (result.type === 'track') {
      // Convert SearchResult to Track format
      const track = {
        id: result.id,
        name: result.name,
        artist_name: result.artist_name || 'Unknown Artist',
        image: result.imageUrl,
        audio_url: `https://mp3d.jamendo.com/download/track/${result.id}/mp32`
      };
      
      // Play the track
      this.musicService.playTrack(track);
      this.showResults = false; // Hide search results after selection
      this.searchQuery = ''; // Clear search query
    } else {
      this.showResults = false;
      this.searchQuery = '';
      
      switch (result.type) {
        case 'artist':
          this.router.navigate(['/artist', result.id]);
          break;
        default:
          console.error('Unknown result type:', result.type);
      }
    }
  }

  onFocusSearch() {
    if (this.searchQuery) {
      this.showResults = true;
    }
  }

  onBlurSearch() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
    this.error = null;
  }

  getResultsByType(type: 'track' | 'artist'): SearchResult[] {
    return this.searchResults.filter(result => result.type === type);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateToProfile() {
    this.router.navigate(['/profile', this.currentUserId]);
    this.showProfileDropdown = false;
  }

  logout() {
    // TODO: Add your logout logic here
    localStorage.removeItem('token'); // Remove the auth token
    this.router.navigate(['/login']);
    this.showProfileDropdown = false;
  }

  closeProfileDropdown() {
    setTimeout(() => {
      this.showProfileDropdown = false;
    }, 150); // Small delay to allow click events to register
  }
}
