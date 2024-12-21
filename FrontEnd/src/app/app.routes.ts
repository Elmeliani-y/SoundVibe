import { ChooseArtistComponent } from './choose-artist/choose-artist.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeAppComponent } from './home-app/home-app.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  
  {
    path:'',
    component:ChooseArtistComponent,
    title:'choose Artists'
  },

  {
    path: 'home-app',
    component: HomeAppComponent, 
    title: 'home',
  },
  
  
 
  { path: 'sign-up', component: SignUpComponent },
  
  { path: 'login',
     component: LoginComponent
    
  },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'explore', component: ExploreComponent },
  {
   path: 'profile/:userId',
    component: ProfileComponent
  },
  {
    path: 'profile',
    redirectTo: 'profile/user1',
    pathMatch: 'full'
  },
  
];
