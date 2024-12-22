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
  private apiUrl = 'http://localhost:3003'; // Backend API URL

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
   * Function to save favorite artists
   * @param payload - Object containing userId and artists array
   * @returns Observable<any> - The response from the backend
   */
  saveFavoriteArtists(payload: { userId: string; artists: Artist[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/favartists`, payload);
  }

  /**
   * Function to get favorite artists for a user
   * @param userId - The ID of the user
   * @returns Observable<Artist[]> - The list of favorite artists
   */
  getFavoriteArtists(userId: string): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/favartists/${userId}`);
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
