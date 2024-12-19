import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Ensure FormsModule is imported for ngModel
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-playlist',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    FormsModule , // Add FormsModule here
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; // Référence au champ d'entrée de fichier

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      // Create a URL for the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }
  
  
  onCreatePlaylist(): void {
    if (this.playlistName && this.description) {
      // Handle playlist creation logic here
      console.log('Playlist Name:', this.playlistName);
      console.log('Description:', this.description);
      console.log('Selected Image:', this.selectedImage);
    } else {
      console.error('Please fill in all fields!');
    }
  }
}
