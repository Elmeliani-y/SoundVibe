import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';
import { SearchService, SearchResult } from '../services/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUserId: string = 'user1';
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  showResults: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
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
    this.showResults = false;
    this.searchQuery = '';
    
    switch (result.type) {
      case 'artist':
        this.router.navigate(['/artist', result.id]);
        break;
      case 'track':
        this.router.navigate(['/track', result.id]);
        break;
      default:
        console.error('Unknown result type:', result.type);
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
}
