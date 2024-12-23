import { Component } from '@angular/core';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent,SidebarComponentComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {

}
