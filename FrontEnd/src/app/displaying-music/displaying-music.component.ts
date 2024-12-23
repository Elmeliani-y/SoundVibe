import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface Track {
  id: string;
  name: string;
  artist_name: string;
  genre?: string;
  image?: string;
}

interface Artist {
  id: string;
  name: string;
  image: string;
  fanCount: number;
  joindate?: string;
}

interface Album {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  image: string;
  releaseDate?: string;
}

interface ArtistAlbums {
  artist: {
    id: string;
    name: string;
    image?: string;
  };
  albums: {
    id: string;
    name: string;
    artist_name: string;
    image: string;
    releaseDate?: string;
  }[];
}

@Component({
  selector: 'app-displaying-music',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './displaying-music.component.html',
  styleUrls: ['./displaying-music.component.css']
})
export class DisplayingMusicComponent implements OnInit {
  favoriteTracks: Track[] = [];
  newArtists: Artist[] = [];
  favoriteArtistAlbums: ArtistAlbums[] = [];
  popularTracks: Track[] = [];
  isLoading = true;
  error: string | null = null;
  featuredArtists: Artist[] = [
    {
      id: '1',
      name: 'Travis Scott',
      image: 'assets/images/travis-scott.jpg',
      fanCount: 2689321
    },
    {
      id: '2',
      name: 'Adele',
      image: 'assets/images/adele.jpg',
      fanCount: 14591283
    },
    {
      id: '3',
      name: 'Kendrick Lamar',
      image: 'assets/images/kendrick-lamar.jpg',
      fanCount: 5422435
    }
  ];

  private musicApiUrl = 'http://localhost:3001';
  private artistApiUrl = 'http://localhost:3003';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadContent();
  }

  private loadContent() {
    // Load favorite artist's tracks
    this.loadFavoriteArtistTracks();
    
    // Load new artists
    this.loadNewArtists();
    
    // Load favorite artist's albums
    this.loadFavoriteArtistAlbums();
    
    // Load popular tracks
    this.loadPopularTracks();
  }

  private loadFavoriteArtistTracks() {
    const userId = localStorage.getItem('userId');
    this.http.get<any>(`${this.musicApiUrl}/music/favorite-artist-tracks/${userId}`).pipe(
      catchError(error => {
        console.error('Error loading favorite tracks:', error);
        return of({ results: [] });
      })
    ).subscribe(response => {
      this.favoriteTracks = response.results.slice(0, 8).map((track: any) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        genre: track.genre,
        image: track.image || 'assets/default-track.png',
      }));
      this.isLoading = false;
    });
  }

  private loadNewArtists() {
    this.http.get<any>(`${this.artistApiUrl}/artists/discover`).pipe(
      catchError(error => {
        console.error('Error loading new artists:', error);
        return of({ results: [] });
      })
    ).subscribe(response => {
      this.newArtists = response.results.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.image || 'assets/default-artist.png',
        fanCount: artist.fanCount,
        joindate: artist.joindate
      }));
    });
  }

  private loadFavoriteArtistAlbums() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    
    this.isLoading = true;
    this.error = null;

    this.http.get<{ results: ArtistAlbums[] }>(`http://localhost:3004/albums/favorite/${userId}`).pipe(
      catchError(error => {
        console.error('Error loading favorite artist albums:', error);
        this.error = 'Failed to load albums. Please try again later.';
        return of({ results: [] });
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      console.log('Albums response:', response);
      
      // Get one album per favorite artist
      const oneAlbumPerArtist = response.results.map(item => {
        // Get the first album from this artist
        const firstAlbum = item.albums[0];
        if (firstAlbum) {
          return {
            id: firstAlbum.id,
            name: firstAlbum.name,
            artist_name: item.artist.name,
            image: firstAlbum.image || 'assets/default-album.png',
            releaseDate: firstAlbum.releaseDate
          };
        }
        return null;
      }).filter(album => album !== null); // Remove any null entries

      // Create a single entry with one album per artist
      this.favoriteArtistAlbums = [{
        artist: {
          id: 'all',
          name: 'Your Favorite Artists',
          image: ''
        },
        albums: oneAlbumPerArtist
      }];
    });
  }

  private loadPopularTracks() {
    this.http.get<any>(`${this.musicApiUrl}/music/popular`).pipe(
      catchError(error => {
        console.error('Error loading popular tracks:', error);
        return of({ results: [] });
      })
    ).subscribe(response => {
      this.popularTracks = response.results.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist_name: track.artist_name,
        genre: track.genre,
        image: track.image || 'assets/default-track.png',
      }));
    });
  }

  playTrack(track: Track) {
    // Implement play functionality
    console.log('Playing track:', track);
  }
}
