import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private API_URL = 'http://localhost:3001/music';

  constructor(private http: HttpClient) {}

  getAllTracks(): Observable<any> {
    return this.http.get(`${this.API_URL}/all`);
  }

  searchTracks(name: string): Observable<any> {
    return this.http.get(`${this.API_URL}/search/${name}`);
  }
}
