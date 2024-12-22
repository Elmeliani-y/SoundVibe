import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponentComponent } from './side-component/side-component.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SideComponentComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
