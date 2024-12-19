import { Component } from '@angular/core';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { NavbarComponent } from "../navbar/navbar.component";


@Component({
  standalone: true,
  selector: 'app-home-app',
  imports: [SidebarComponentComponent, NavbarComponent],
  templateUrl: './home-app.component.html',
  styleUrl: './home-app.component.css'
})
export class HomeAppComponent {

}
