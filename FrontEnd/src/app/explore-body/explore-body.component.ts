import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumsService } from '../services/albums.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-body.component.html',
  styleUrls: ['./explore-body.component.css']
})
export class ExploreBodyComponent implements OnInit {
navigateToAllAlbums() {
throw new Error('Method not implemented.');
}
  albums: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private albumsService: AlbumsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAlbums();
  }

  loadAlbums() {
    this.loading = true;
    this.error = null;
    
    this.albumsService.getAlbums().subscribe({
      next: (data) => {
        this.albums = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load albums. Please try again.';
        this.loading = false;
        console.error('Error loading albums:', error);
      }
    });
  }

  onAlbumClick(albumId: string) {
    this.router.navigate(['/album', albumId]);
  }

  scrollAlbums(direction: 'left' | 'right') {
    const container = document.querySelector('.albums-grid');
    if (container) {
      const scrollAmount = 300;
      const scrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }
}
