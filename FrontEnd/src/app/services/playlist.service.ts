import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  tracks: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl = 'http://localhost:3002';

  constructor(private http: HttpClient) { }

  getPlaylists(limit: number = 8): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/playlists-Api`);
  }

  createPlaylist(playlistData: FormData): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/playlists-Api`, playlistData);
  }
}
