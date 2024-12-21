import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  providers: [AuthService], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent  {
  loginForm: FormGroup;
  loginError: string | null = null;
  isLoading = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true; 
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false; 
          if (response.token && response.user) {
            console.log('Login successful!');
            this.loginError = null;
            this.router.navigate([`/profile/${response.user.id}`]);
          } else {
            this.loginError = 'Login failed. Please check your credentials.';
          }
        },
        error: (err) => {
          this.isLoading = false; 
          if (err.error?.message) {
            this.loginError = err.error.message;
          } else {
            this.loginError = 'Login failed. Please try again.';
          }
          console.error('Login error:', err);
        },
      });
    }
  }
}
