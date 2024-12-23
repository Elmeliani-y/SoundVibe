import { Component } from '@angular/core';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
<<<<<<< HEAD
import { MusicPlayerComponent } from '../music-player/music-player.component';
=======
import { NavbarComponent } from '../navbar/navbar.component';
>>>>>>> e0b4a316b1d482360a5e51732e77a6b10324e03f

@Component({
  selector: 'app-explore',
  standalone: true,
<<<<<<< HEAD
  imports: [NavbarComponent, SidebarComponentComponent,MusicPlayerComponent],
=======
  imports: [NavbarComponent,SidebarComponentComponent],
>>>>>>> e0b4a316b1d482360a5e51732e77a6b10324e03f
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {

}
