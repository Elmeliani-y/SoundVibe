import { Component } from '@angular/core';
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    SidebarComponentComponent,
    NavbarComponent,
    HttpClientModule
  ],
  templateUrl: './home-app.component.html',
  styleUrls: ['./home-app.component.css']
})
export class HomeAppComponent {

}
