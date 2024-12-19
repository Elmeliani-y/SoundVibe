import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeComponentComponent } from './home-component/home-component.component';
import { ChooseArtistComponent } from './choose-artist/choose-artist.component';
import { HomeAppComponent } from './home-app/home-app.component';
export const routes: Routes = [
 
  {
    path: '',
    component: HomeAppComponent, 
    title: 'home',
  },
  {
    path: '',
    component: HomeComponentComponent, 
    title: 'home',
  },
 
  { path: 'sign-up', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'explore',
    component: ExploreComponent,
    title: 'Explore',
  },
];
