import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Artist {
  image: string;
  name: string;
}

export interface Playlist {
  image: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  username: string;
  profilePic?: string;
  musicStyle?: string;
  likedPlaylists: Playlist[];
  favArtists: Artist[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
  }

  updateProfile(userData: Partial<User>, currentPassword: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/update`, { ...userData, currentPassword }, { headers });
  }
}
