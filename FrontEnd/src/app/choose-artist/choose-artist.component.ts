import { HttpClientModule } from '@angular/common/http';

import { Component, OnInit } from '@angular/core';
import { ArtistService, Artist } from '../services/artist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs'; // Import forkJoin

@Component({
  selector: 'app-choose-artist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ArtistService], 
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
    private router: Router,
    private snackBar: MatSnackBar
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
      
      // Show loading message
      this.snackBar.open('Saving your favorite artists...', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      // Use forkJoin to handle multiple requests
      const addFavoriteRequests = this.selectedArtists.map(artist => 
        this.artistService.addToFavorites(artist)
      );

      // Execute all requests in parallel
      forkJoin(addFavoriteRequests).subscribe({
        next: (responses) => {
          console.log('All favorite artists saved:', responses);
          this.isSaving = false;
          
          // Show success message
          this.snackBar.open('Your favorite artists have been saved!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          // Navigate to the home-app page
          this.router.navigate(['/app-home']);
        },
        error: (error) => {
          console.error('Error saving favorite artists:', error);
          this.isSaving = false;

          // Show specific error message
          const errorMessage = error.message || 'Failed to save favorite artists. Please try again.';
          this.errorMessage = errorMessage;
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });

          // If it's an authentication error, redirect to login
          if (errorMessage.includes('log in') || errorMessage.includes('token')) {
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }
}
