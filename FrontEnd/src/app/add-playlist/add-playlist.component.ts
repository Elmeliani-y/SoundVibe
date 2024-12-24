import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PlaylistService } from '../services/playlist.service';

@Component({
  selector: 'app-add-playlist',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './add-playlist.component.html',
  styleUrls: ['./add-playlist.component.css']
})
export class AddPlaylistComponent {
  playlistName: string = '';
  description: string = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private playlistService: PlaylistService,
    private dialogRef: MatDialogRef<AddPlaylistComponent>
  ) {}

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }
  
  onCreatePlaylist(): void {
    if (this.playlistName && this.description) {
      const formData = new FormData();
      formData.append('name', this.playlistName);
      formData.append('description', this.description);
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this.playlistService.createPlaylist(formData).subscribe({
        next: (response) => {
          console.log('Playlist created successfully:', response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating playlist:', error);
        }
      });
    } else {
      console.error('Please fill in all required fields!');
    }
  }
}
