import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private baseURL: string = 'http://localhost:3001'; 

  constructor() {}

  //search 
  async searchTracks(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/music/all`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error; 
    }
  }

  // for search bar by track's name
  async searchTrackByName(name: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/music/search/${name}`);
      return response.data; 
    } catch (error) {
      console.error('Error fetching track by name:', error);
      throw error; 
    }
  }
}
