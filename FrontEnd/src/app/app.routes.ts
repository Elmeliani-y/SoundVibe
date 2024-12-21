import { Routes } from '@angular/router';
import { HomeComponentComponent } from './home-component/home-component.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ExploreComponent } from './explore/explore.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponentComponent,
    title: 'Home',
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
  }
];
