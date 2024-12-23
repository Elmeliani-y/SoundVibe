import { Component } from '@angular/core';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { HttpClientModule } from '@angular/common/http';
import { DisplayingMusicComponent } from '../displaying-music/displaying-music.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    SidebarComponentComponent,
    NavbarComponent,
    HttpClientModule,
    DisplayingMusicComponent
  ],
  templateUrl: './home-app.component.html',
  styleUrls: ['./home-app.component.css']
})
export class HomeAppComponent {}
