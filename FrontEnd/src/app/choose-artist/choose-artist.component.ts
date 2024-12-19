// artist-list.component.ts

import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../services/artist.service';

@Component({
  selector: 'app-choose-artist',
  templateUrl: './choose-artist.component.html',
  styleUrls: ['./choose-artist.component.css']
})
export class ChooseArtistComponent implements OnInit {
  artists: any[] = [];

  constructor(private artistService: ArtistService) {}

  ngOnInit(): void {
    this.fetchArtists();
  }

  fetchArtists(): void {
    this.artistService.getArtists().subscribe(
      (data) => {
        this.artists = data; // Assuming 'data' is an array of artists
      },
      (error) => {
        console.error('Error fetching artists', error);
      }
    );
  }
}

