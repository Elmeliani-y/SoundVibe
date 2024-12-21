import { Component, OnInit } from '@angular/core';
import { ArtistService, Artist } from '../services/artist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-artist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choose-artist.component.html',
  styleUrls: ['./choose-artist.component.css'],
})
export class ChooseArtistComponent implements OnInit {
  allArtists: Artist[] = [];
  filteredArtists: Artist[] = [];
  selectedArtists: Artist[] = [];
  errorMessage: string = '';
  searchQuery: string = '';
  isLoading: boolean = false;
  minArtistsRequired: number = 5;
  isSaving: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(
    private artistService: ArtistService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterArtists(query);
    });
  }

  ngOnInit(): void {
    this.fetchArtists();
  }

  fetchArtists(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.artistService.getArtists().subscribe({
      next: (data) => {
        this.allArtists = data;
        this.filteredArtists = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to fetch artists';
        this.isLoading = false;
      },
    });
  }

  onSearchChange(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  filterArtists(query: string): void {
    if (!query.trim()) {
      this.filteredArtists = this.allArtists;
    } else {
      this.filteredArtists = this.allArtists.filter(artist =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  toggleArtistSelection(artist: Artist): void {
    const index = this.selectedArtists.findIndex(a => a.id === artist.id);
    if (index === -1) {
      // Add artist if not already selected
      this.selectedArtists.push(artist);
    } else {
      // Remove artist if already selected
      this.selectedArtists.splice(index, 1);
    }
  }

  isArtistSelected(artist: Artist): boolean {
    return this.selectedArtists.some(a => a.id === artist.id);
  }

  canProceed(): boolean {
    return this.selectedArtists.length >= this.minArtistsRequired;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredArtists = this.allArtists;
  }

  proceedWithSelection(): void {
    if (this.canProceed() && !this.isSaving) {
      this.isSaving = true;
      this.errorMessage = '';

      // For now, using a temporary user ID
      const tempUserId = 'temp-user-id';

      this.artistService.saveFavoriteArtists(this.selectedArtists).subscribe({
        next: (response) => {
          console.log('Favorite artists saved:', response);
          this.isSaving = false;
          // Navigate to the next page or show success message
          // this.router.navigate(['/next-page']);
        },
        error: (error) => {
          console.error('Error saving favorite artists:', error);
          this.errorMessage = 'Failed to save favorite artists. Please try again.';
          this.isSaving = false;
        }
      });
    }
  }
}
