import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private baseUrl = 'http://localhost:3000/api'; // 

  constructor(private http: HttpClient) {}

  searchTracks(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/tracks`, { params: { query } });
  }

  searchArtists(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/artists`, { params: { query } });
  }

  getTrackDetails(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/track/${id}`);
  }
}
