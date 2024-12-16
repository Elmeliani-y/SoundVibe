import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponentComponent } from '../sidebar-component/sidebar-component.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    SidebarComponentComponent, 
    MatDialogModule,
    MatSnackBarModule,
    ConfirmDialogComponent
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  updateForm: FormGroup;
  isEditing = false;
  hasUnsavedChanges = false;
  isCurrentUser = false;
  userId: string = '';
  initialFormValues: any;
  private formSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      musicStyle: ['']
    });

    this.formSubscription = this.updateForm.valueChanges.subscribe(() => {
      if (this.isEditing) {
        this.hasUnsavedChanges = !this.isFormUnchanged();
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.isCurrentUser = this.userId === 'user1';
      this.loadUserProfile();
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  isFormUnchanged(): boolean {
    const currentValue = this.updateForm.value;
    return JSON.stringify(this.initialFormValues) === JSON.stringify(currentValue);
  }

  loadUserProfile(): void {
    // Mock user data
    this.user = {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      profilePic: 'assets/default-profile.png',
      musicStyle: 'Rock',
      likedPlaylists: [],
      favArtists: []
    };

    if (this.user) {
      const formValues = {
        name: this.user.name,
        email: this.user.email,
        musicStyle: this.user.musicStyle
      };
      this.updateForm.patchValue(formValues);
      this.initialFormValues = { ...formValues };
    }
  }

  toggleEdit(): void {
    if (!this.isCurrentUser) return;

    if (this.isEditing && this.hasUnsavedChanges) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.data = {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      };
      dialogConfig.disableClose = true;
      dialogConfig.panelClass = 'custom-dialog-container';

      const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cancelEdit();
        }
      });
    } else {
      this.isEditing = !this.isEditing;
      if (!this.isEditing) {
        this.cancelEdit();
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.hasUnsavedChanges = false;
    this.updateForm.patchValue(this.initialFormValues);
  }

  onSubmit(): void {
    if (!this.isCurrentUser || !this.updateForm.valid) return;

    if (this.hasUnsavedChanges) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.data = {
        title: 'Save Changes',
        message: 'Are you sure you want to save these changes to your profile?',
        confirmText: 'Save',
        cancelText: 'Cancel'
      };
      dialogConfig.disableClose = true;
      dialogConfig.panelClass = 'custom-dialog-container';

      const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveChanges();
        }
      });
    } else {
      // Close the form even if no changes were made
      this.isEditing = false;
    }
  }

  private saveChanges(): void {
    if (this.user) {
      this.user = {
        ...this.user,
        ...this.updateForm.value
      };
      this.initialFormValues = { ...this.updateForm.value };
      this.isEditing = false;
      this.hasUnsavedChanges = false;
      this.snackBar.open('Profile updated successfully', 'Close', { 
        duration: 3000,
        panelClass: ['custom-snackbar']
      });
    }
  }
}
