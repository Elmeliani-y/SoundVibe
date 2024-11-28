import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import {SideComponentComponent} from "../side-component/side-component.component";


@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [NavbarComponent, SideComponentComponent, CommonModule],
  templateUrl: './home-component.component.html',
  styleUrl: './home-component.component.css'
})
export class HomeComponentComponent {

}
