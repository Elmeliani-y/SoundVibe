import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false; 

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private snackBar: MatSnackBar, 
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      musicStyle: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      this.errorMessage = 'Please fill out the form correctly.';
      return;
    }

    this.isLoading = true;
    const { name, lastname, email, password, musicStyle } = this.signUpForm.value;

    this.authService.signUp(name, lastname, email, password, musicStyle).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Response:', response);
        
        if (response && response.message === 'User created successfully') {
          // Show success message
          this.snackBar.open('Account created successfully! Please login.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          // Navigate to login page
          this.router.navigate(['/login']).then(
            () => {
              console.log('Successfully navigated to login page');
            },
            (error) => {
              console.error('Navigation error:', error);
            }
          );
        } else {
          this.errorMessage = response.message || 'Sign Up failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.message?.includes('E11000 duplicate key error')) {
          this.errorMessage = 'This lastname is already taken. Please choose a different one.';
        } else {
          this.errorMessage = err.error?.message || 'An error occurred during sign up.';
        }
      }
    });
  }
}
