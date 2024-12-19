// artist.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {

  private apiUrl = 'http://localhost:3002/artists';  // Update the URL if necessary

  constructor(private http: HttpClient) {}

  getArtists(): Observable<any> {
    return this.http.get<any>(this.apiUrl);  // Fetching all artists from backend
  }
}
