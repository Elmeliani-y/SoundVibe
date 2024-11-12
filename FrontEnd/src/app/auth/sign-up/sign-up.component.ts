import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {

    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(18)]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.mockSignUp(this.signUpForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Sign Up successful!');
            this.errorMessage = null;
          } else {
            this.errorMessage = 'Sign Up failed. Please try again.';
          }
        },
        error: (err: any) => {
          this.errorMessage = 'Sign Up failed due to an error.';
          console.error('Sign Up error', err);
        }
      });
    }
  }

  private mockSignUp(formData: any): Observable<{ success?: boolean; error?: boolean }> {
    const isSuccess = formData.username && formData.email;
    return isSuccess ? of({ success: true }).pipe(delay(1000)) : of({ error: true }).pipe(delay(1000));
  }
}
