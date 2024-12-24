import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  name: string;
  type: 'artist' | 'track';
  imageUrl?: string;
  artist_name?: string;
}

// Jamendo API Track interface
interface JamendoTrack {
  id: string;
  name: string;
  image?: string;
  audio: string;
  duration: number;
  artist_name: string;
  artist_id: string;
}

// Jamendo API Artist interface
interface JamendoArtist {
  id: string;
  name: string;
  image?: string;
  joindate: string;
  website?: string;
  shorturl?: string;
  shareurl?: string;
}

interface JamendoTrackResponse {
  results: JamendoTrack[];
  headers: any;
}

interface JamendoArtistResponse {
  results: JamendoArtist[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private musicApiUrl = 'http://localhost:3001';
  private artistApiUrl = 'http://localhost:3003';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult[]> {
    return forkJoin({
      tracks: this.searchTracks(query),
      artists: this.searchArtists(query)
    }).pipe(
      map(results => {
        const combinedResults: SearchResult[] = [];

        // Add tracks to results
        if (results.tracks?.results?.length) {
          combinedResults.push(...results.tracks.results.map((track: JamendoTrack) => ({
            id: track.id,
            name: track.name,
            type: 'track' as const,
            imageUrl: track.image || 'default-track-image-url',
            artist_name: track.artist_name
          })));
        }

        // Add artists to results
        if (results.artists?.results?.length) {
          combinedResults.push(...results.artists.results.map((artist: JamendoArtist) => ({
            id: artist.id,
            name: artist.name,
            type: 'artist' as const,
            imageUrl: artist.image || 'default-artist-image-url'
          })));
        }

        return combinedResults;
      }),
      catchError((error) => {
        console.error('Search error:', error);
        return this.handleError(error);
      })
    );
  }

  private searchTracks(query: string): Observable<JamendoTrackResponse> {
    return this.http.get<JamendoTrackResponse>(`${this.musicApiUrl}/music/all`, {
      params: { query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private searchArtists(query: string): Observable<JamendoArtistResponse> {
    return this.http.get<JamendoArtistResponse>(`${this.artistApiUrl}/search`, {
      params: { query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
