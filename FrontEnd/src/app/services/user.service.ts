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

  private getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication token missing');
    }
    console.log('Using token:', token);
    return token;
  }

  private getHttpOptions(isFormData: boolean = false) {
    const headers: any = {
      'Authorization': `Bearer ${this.getToken()}`
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return {
      headers: new HttpHeaders(headers),
      withCredentials: true
    };
  }

  getProfile(): Observable<User> {
    console.log('Getting user profile...');
    try {
      const options = this.getHttpOptions();
      return this.http.get<User>(`${this.apiUrl}/profile`, options).pipe(
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
      const options = this.getHttpOptions();
      return this.http.get<User>(`${this.apiUrl}/profile`, options).pipe(
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
      // Use isFormData=true to skip Content-Type header for FormData
      const options = this.getHttpOptions(true);
      return this.http.put<User>(`${this.apiUrl}/update`, formData, options).pipe(
        tap(updatedUser => {
          console.log('User profile updated:', updatedUser);
          if (updatedUser.profilePicture) {
            console.log('New profile picture URL:', updatedUser.profilePicture);
          }
        }),
        catchError(error => {
          console.error('Error updating user profile:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error getting headers:', error);
      return throwError(() => error);
    }
  }
}
