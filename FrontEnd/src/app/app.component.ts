import { Component } from '@angular/core';
<<<<<<< HEAD
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { MusicPlayerComponent } from './music-player/music-player.component';
import { FormsModule } from '@angular/forms';
=======
import { RouterOutlet } from '@angular/router';
>>>>>>> e0b4a316b1d482360a5e51732e77a6b10324e03f

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, RouterModule, NavbarComponent, MusicPlayerComponent, FormsModule],
=======
  imports: [
    RouterOutlet,
  ],
>>>>>>> e0b4a316b1d482360a5e51732e77a6b10324e03f
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
