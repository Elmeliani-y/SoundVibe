import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError, tap } from 'rxjs';

export interface Artist {
  image: string;
  name: string;
}

export interface Playlist {
  image: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  lastname: string;
  musicStyle?: string;
  profilePicture?: string;
  likedPlaylists: Playlist[];
  favArtists: Artist[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication token missing');
    }
    console.log('Using token:', token);
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(): Observable<User> {
    console.log('Getting user profile...');
    try {
      const headers = this.getHeaders();
      return this.http.get<User>(`${this.apiUrl}/profile`, { headers }).pipe(
        tap(user => console.log('Profile data received:', user)),
        catchError((error) => {
          console.error('Error fetching profile:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error getting headers:', error);
      return throwError(() => error);
    }
  }
  
  getCurrentUser(): Observable<User> {
    console.log('Getting current user...');
    try {
      const headers = this.getHeaders();
      return this.http.get<User>(`${this.apiUrl}/profile`, { headers }).pipe(
        tap(user => {
          console.log('Retrieved user data:', user);
          if (user.profilePicture) {
            console.log('Profile picture URL:', user.profilePicture);
          } else {
            console.log('No profile picture set');
          }
        }),
        catchError(error => {
          console.error('Error getting current user:', error);
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
          }
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error getting headers:', error);
      return throwError(() => error);
    }
  }

  updateUser(formData: FormData): Observable<User> {
    console.log('Updating user profile...');
    try {
      const headers = this.getHeaders();
      
      // Log form data contents
      console.log('Form data contents:');
      formData.forEach((value, key) => {
        if (key === 'profilePicture') {
          const file = value as File;
          console.log('Profile picture file:', {
            name: file.name,
            type: file.type,
            size: file.size
          });
        } else {
          console.log(`${key}:`, value);
        }
      });

      return this.http.put<User>(`${this.apiUrl}/update`, formData, { headers }).pipe(
        tap(updatedUser => {
          console.log('Update response:', updatedUser);
          if (updatedUser.profilePicture) {
            console.log('New profile picture URL:', updatedUser.profilePicture);
          } else {
            console.log('No profile picture in updated user');
          }
        }),
        catchError(error => {
          console.error('Error updating user:', error);
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
          }
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error getting headers:', error);
      return throwError(() => error);
    }
  }
}
