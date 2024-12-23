import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

// Define the Artist type
export interface Artist {
  id: string;
  name: string;
  image: string;
  joindate?: string;
  website?: string;
  shorturl?: string;
  shareurl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private apiUrl = 'http://localhost:3003'; // Artist service URL
  private userApiUrl = 'http://localhost:3000'; // User service URL

  constructor(private http: HttpClient) {}

  /**
   * Function to get artists from the backend
   * @returns Observable<Artist[]> - List of artists
   */
  getArtists(): Observable<Artist[]> {
    return this.http.get<any>(`${this.apiUrl}/artists`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(artist => ({
            id: artist.id,
            name: artist.name,
            image: artist.image
          }));
        } else {
          console.error('Unexpected response format:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching artists:', error);
        return throwError(() => new Error('Failed to fetch artists. Please try again later.'));
      })
    );
  }

  /**
   * Function to search for artists
   * @param query - The search query
   * @returns Observable<Artist[]> - List of matching artists
   */
  searchArtists(query: string): Observable<Artist[]> {
    const url = `${this.apiUrl}/artists/search?q=${encodeURIComponent(query)}`;
    return this.http.get<Artist[]>(url).pipe(
      catchError((error: any) => {
        console.error('Error searching artists:', error.message, error);
        return throwError(() => new Error('Failed to search artists'));
      })
    );
  }

  /**
   * Function to add an artist to favorites
   * @param artist - The artist to add to favorites
   * @returns Observable<any> - The response from the backend
   */
  addToFavorites(artist: Artist): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Authentication token not found. Please log in again.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Send artist details in the request body
    const body = {
      name: artist.name,
      image: artist.image
    };

    return this.http.post(`${this.userApiUrl}/artists/${artist.id}/favorite`, body, { headers }).pipe(
      catchError(error => {
        console.error('Error adding artist to favorites:', error);
        if (error.status === 401 || error.status === 403) {
          return throwError(() => new Error('Please log in to add artists to favorites'));
        }
        return throwError(() => new Error('Failed to add artist to favorites. Please try again.'));
      })
    );
  }

  /**
   * Function to remove an artist from favorites
   * @param artist - The artist to remove from favorites
   * @returns Observable<any> - The response from the backend
   */
  removeFromFavorites(artist: Artist): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.userApiUrl}/artists/${artist.id}/unfavorite`, {}, { headers }).pipe(
      catchError(error => {
        console.error('Error removing artist from favorites:', error);
        return throwError(() => new Error('Failed to remove artist from favorites'));
      })
    );
  }

  /**
   * Function to get favorite artists for the current user
   * @returns Observable<string[]> - Array of favorite artist IDs
   */
  getFavoriteArtists(): Observable<string[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get(`${this.userApiUrl}/profile`, { headers }).pipe(
      map((response: any) => response.favArtists || []),
      catchError(error => {
        console.error('Error getting favorite artists:', error);
        return throwError(() => new Error('Failed to get favorite artists'));
      })
    );
  }

  /**
   * Helper function to create headers for the HTTP request
   * @returns HttpHeaders - The headers for the request
   */
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // You can add more headers here like Authorization if needed
    });
  }

  /**
   * Error handling function for HTTP requests
   * @param error - The error from the HTTP request
   * @returns Observable - Throws an error observable with a custom message
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }
    // Return an observable with an error message
    return throwError(() => new Error(errorMessage));
  }
}
