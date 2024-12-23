import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  message: string;
  userId?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('Attempting login for:', email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => console.log('Login response:', response)),
      map((response) => {
        if (response.token) {
          console.log('Storing token and user info');
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id);
          localStorage.setItem('email', email);
        }
        return response;
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  signUp(
    name: string,
    lastname: string,
    email: string,
    password: string,
    musicStyle: string
  ): Observable<AuthResponse> {
    console.log('Attempting signup for:', email);
    const body = { name, lastname, email, password, musicStyle };

    return this.http.post<AuthResponse>(`${this.apiUrl}/sign-up`, body).pipe(
      tap(response => console.log('Signup response:', response)),
      map((response) => {
        if (response.token) {
          console.log('Storing token and user info');
          localStorage.setItem('token', response.token);
          // Store user ID from either response.user.id or response.userId
          const userId = response.user?.id || response.userId;
          if (userId) {
            localStorage.setItem('userId', userId);
          }
          localStorage.setItem('email', email);
        }
        return response;
      }),
      catchError((error) => {
        console.error('Sign up error:', error);
        if (error.error && error.error.message) {
          return throwError(() => new Error(error.error.message));
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    // You could add token expiration check here if needed
    return true;
  }

  getProfile(): Observable<any> {
    console.log('Getting user profile');
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(profile => console.log('Profile data:', profile)),
      catchError((error) => {
        console.error('Failed to fetch profile:', error);
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

 

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

 
}
