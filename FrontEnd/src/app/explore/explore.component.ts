import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { NavbarComponent } from '../navbar/navbar.component';
import { MusicPlayerComponent } from '../music-player/music-player.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponentComponent,
    MusicPlayerComponent
  ],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {

}
