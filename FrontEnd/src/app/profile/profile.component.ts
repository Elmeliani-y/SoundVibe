import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService, User } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ProfileUpdateService } from '../services/profile-update.service'; 
import {SidebarComponentComponent} from '../sidebar-component/sidebar-component.component'


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponentComponent,
    HttpClientModule
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  selectedFile: File | null = null;
  updateForm: FormGroup;
  isCurrentUser = true;
  loading = true;
  error: string | null = null;
  hasUnsavedChanges = false;
  initialFormValues: any;


  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private profileUpdateService: ProfileUpdateService, // Add ProfileUpdateService to constructor
    public dialog: MatDialog
  ) {
    this.updateForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      musicStyle: [''],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.minLength(6)]],
      confirmNewPassword: ['']
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;

    if (!newPassword && !confirmNewPassword) {
      return null; // Both fields empty is valid
    }

    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  ngOnInit() {
    console.log('Profile component initializing...');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
  }

  loadUserProfile() {
    console.log('Loading user profile...');
    this.loading = true;
    this.error = null;

    this.userService.getCurrentUser().subscribe({
      next: (userData: User) => {
        console.log('User data received:', userData);
        this.user = userData;
        this.loading = false;
        
        // Update form with current values
        this.updateForm.patchValue({
          name: userData.name || '',
          email: userData.email || '',
          musicStyle: userData.musicStyle || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });

        // Store initial form values
        this.initialFormValues = {
          name: userData.name,
          email: userData.email,
          musicStyle: userData.musicStyle
        };
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.loading = false;
        this.error = 'Failed to load profile';
        
        if (error.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
        
        this.snackBar.open('Error loading profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  isFormUnchanged(): boolean {
    if (!this.user) return true;
    
    const formValue = this.updateForm.value;
    return (
      formValue.name === this.user.name &&
      formValue.email === this.user.email &&
      formValue.musicStyle === this.user.musicStyle &&
      !formValue.newPassword &&
      !this.selectedFile
    );
  }

  toggleEdit() {
    if (!this.isEditing && this.user) {
      this.isEditing = true;
      this.updateForm.patchValue({
        name: this.user.name || '',
        email: this.user.email || '',
        musicStyle: this.user.musicStyle || '',
      });
    } else {
      this.isEditing = false;
    }
  }

  getProfilePictureUrl(url: string | undefined | null): string {
    console.log('Getting profile picture URL for:', url);
    
    // If no URL is provided or it's null, use default image
    if (!url) {
      const defaultUrl = 'assets/default-profile.png';
      console.log('No URL provided, using default:', defaultUrl);
      return defaultUrl;
    }
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) {
      console.log('Using full URL:', url);
      return url;
    }
    
    // If it's a relative path starting with /uploads, prepend the API URL
    if (url.startsWith('/uploads')) {
      const fullUrl = `http://localhost:3000${url}`;
      console.log('Created full URL from uploads path:', fullUrl);
      return fullUrl;
    }
    
    // If it starts with assets/, return as is
    if (url.startsWith('assets/')) {
      console.log('Using assets URL:', url);
      return url;
    }
    
    // For any other case, prepend the API URL
    const fullUrl = `http://localhost:3000/${url}`;
    console.log('Created full URL from relative path:', fullUrl);
    return fullUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.log('No file selected');
      return;
    }

    const file = input.files[0];
    console.log('Selected file:', file);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      this.snackBar.open('Please select an image file', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      this.snackBar.open('Image size should be less than 5MB', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.querySelector('.profile-pic img') as HTMLImageElement;
      if (img && e.target?.result) {
        console.log('Updating preview image');
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);

    // Upload the file immediately
    console.log('Uploading profile picture...');
    const formData = new FormData();
    formData.append('profilePicture', file);

    // Add other form fields if they exist
    if (this.user) {
      formData.append('name', this.user.name);
      formData.append('email', this.user.email);
      if (this.user.musicStyle) {
        formData.append('musicStyle', this.user.musicStyle);
      }
    }

    this.userService.updateUser(formData).subscribe({
      next: (updatedUser: User) => {
        console.log('Profile picture updated successfully:', updatedUser);
        this.user = updatedUser;
        // Update the navbar profile picture
        if (updatedUser.profilePicture) {
          this.profileUpdateService.updateProfilePicture(this.getProfilePictureUrl(updatedUser.profilePicture));
        }
        this.snackBar.open('Profile picture updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating profile picture:', error);
        this.snackBar.open('Error updating profile picture', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        // Revert to old image if update fails
        if (this.user?.profilePicture) {
          const img = document.querySelector('.profile-pic img') as HTMLImageElement;
          if (img) {
            img.src = this.getProfilePictureUrl(this.user.profilePicture);
          }
        }
      }
    });
  }

  onSubmit() {
    if (this.updateForm.valid && (!this.isFormUnchanged() || this.selectedFile)) {
      console.log('Submitting form with changes');
      const formData = new FormData();
      
      // Add form fields to formData
      const formValue = this.updateForm.value;
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== '') {
          console.log(`Adding form field: ${key}:`, formValue[key]);
          formData.append(key, formValue[key]);
        }
      });

      // Add profile picture if selected
      if (this.selectedFile) {
        console.log('Adding profile picture to form data:', this.selectedFile.name);
        formData.append('profilePicture', this.selectedFile);
      }

      console.log('Sending update request...');
      this.userService.updateUser(formData).subscribe({
        next: (updatedUser: User) => {
          console.log('Profile updated successfully:', updatedUser);
          this.user = updatedUser;
          this.isEditing = false;
          this.selectedFile = null;
          this.hasUnsavedChanges = false;
          
          // Update form with new values
          this.updateForm.patchValue({
            name: updatedUser.name || '',
            email: updatedUser.email || '',
            musicStyle: updatedUser.musicStyle || '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
          
          // Store initial form values
          this.initialFormValues = {
            name: updatedUser.name,
            email: updatedUser.email,
            musicStyle: updatedUser.musicStyle
          };
          
          this.snackBar.open('Profile updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: { error: { message: string } }) => {
          console.error('Error updating profile:', error);
          this.snackBar.open(error.error.message || 'Error updating profile', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.log('Form is invalid or unchanged');
    }
  }
}
