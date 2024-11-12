import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.mockLogin(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Login successful!');
            this.loginError = null;
          } else {
            this.loginError = 'Login failed. Please check your credentials.';
          }
        },
        error: (err: any) => {
          this.loginError = 'Login failed due to an error.';
          console.error('Login error', err);
        }
      });
    }
  }

  // Mock login function simulating API response with a typed Observable
  private mockLogin(email: string, password: string): Observable<{ success?: boolean; error?: boolean }> {
    const isSuccess = email === 'test@example.com' && password === 'password123';
    return isSuccess ? of({ success: true }).pipe(delay(1000)) : of({ error: true }).pipe(delay(1000));
  }
}
