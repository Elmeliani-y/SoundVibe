import { ChooseArtistComponent } from './choose-artist/choose-artist.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeAppComponent } from './home-app/home-app.component';
import { ProfileComponent } from './profile/profile.component';
import { AlbumDetailsComponent } from './album-details/album-details.component';

export const routes: Routes = [
  { path: '', redirectTo:'sign-up', pathMatch: 'full' },
  {
    path: 'sign-up',
    component: SignUpComponent,
    title: 'Sign Up'
  },
  {
    path:'choose-artist',
    component:ChooseArtistComponent,
    title:'choose Artists'
  },
  {
    path: 'home-app',
    component: HomeAppComponent, 
    title: 'home',
  },
  { 
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'explore', 
    component: ExploreComponent 
  },
  {
    path: 'album/:id',
    component: AlbumDetailsComponent,
    title: 'Album Details'
  },
  {
    path: 'profile/:userId',
    component: ProfileComponent
  },
  {
    path: 'profile',
    redirectTo: 'profile/user1',
    pathMatch: 'full'
  }
];
