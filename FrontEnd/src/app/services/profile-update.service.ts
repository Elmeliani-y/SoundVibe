import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileUpdateService {
  private profilePictureSource = new BehaviorSubject<string | null>(null);
  profilePicture$ = this.profilePictureSource.asObservable();

  updateProfilePicture(pictureUrl: string | null) {
    this.profilePictureSource.next(pictureUrl);
  }
}
