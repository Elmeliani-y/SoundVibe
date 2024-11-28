import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeComponentComponent } from './home-component/home-component.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponentComponent, 
    title: 'Home',
  },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'explore',
    component: ExploreComponent,
    title: 'Explore',
  },
];
