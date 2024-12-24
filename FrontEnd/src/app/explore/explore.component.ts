import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponentComponent } from "../sidebar-component/sidebar-component.component";
import { CommonModule } from '@angular/common';
import { ExploreBodyComponent } from '../explore-body/explore-body.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  imports: [NavbarComponent, SidebarComponentComponent, CommonModule, ExploreBodyComponent]
})
export class ExploreComponent {
  scrollAlbums(direction: 'left' | 'right') {
    this.scrollContainer('.albums-grid', direction);
  }

  private scrollContainer(containerSelector: string, direction: 'left' | 'right') {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (container) {
      const scrollAmount = 200;
      const scrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  navigateToAllAlbums() {
    // TODO: Implement navigation to all albums page
    console.log('Navigating to all albums...');
  }
}
