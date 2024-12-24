import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Track {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  position: number;
  audio: string;
}

export interface Album {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  image: string;
  releasedate: string;
  zip?: string;
  shorturl?: string;
  shareurl?: string;
  popularity?: number;
  tracks?: Track[];
}

@Injectable({
  providedIn: 'root'
})
export class AlbumsService {
  private apiUrl = 'http://localhost:3004'; // Album service URL

  constructor(private http: HttpClient) {}

  /**
   * Function to get albums
   * @returns Observable<Album[]> - List of albums
   */
  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/albums?limit=8`).pipe(
      map(response => {
        if (response && Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching albums:', error);
        return throwError(() => new Error('Failed to fetch albums. Please try again later.'));
      })
    );
  }

  /**
   * Function to get album by ID
   * @param id - Album ID
   * @returns Observable<Album> - Album details
   */
  getAlbumById(id: string): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/albums/id/${id}`).pipe(
      map(response => {
        if (response && response.id) {
          return response;
        }
        throw new Error('Album not found');
      }),
      catchError(error => {
        console.error(`Error fetching album ${id}:`, error);
        return throwError(() => new Error('Failed to fetch album details. Please try again later.'));
      })
    );
  }
}
