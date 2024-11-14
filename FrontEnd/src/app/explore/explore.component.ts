import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SidebarComponentComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {

}
