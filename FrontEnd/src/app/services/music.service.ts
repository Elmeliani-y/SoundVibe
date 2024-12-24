import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private API_URL = 'http://localhost:3004/music';

  constructor(private http: HttpClient) {}

  getAllTracks(): Observable<any> {
    return this.http.get(`${this.API_URL}/all`);
  }

  searchTracks(name: string): Observable<any> {
    return this.http.get(`${this.API_URL}/search/${name}`);
  }

  getAlbums(limit: number = 8): Observable<any> {
    return this.http.get(`${this.API_URL}/albums?limit=${limit}`);
  }

  getAlbumById(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/albums/${id}`);
  }

  searchAlbums(query: string): Observable<any> {
    return this.http.get(`${this.API_URL}/albums/search?q=${query}`);
  }

  getAlbumsByGenre(genre: string, limit: number = 8): Observable<any> {
    return this.http.get(`${this.API_URL}/albums/genre/${genre}?limit=${limit}`);
  }
}
