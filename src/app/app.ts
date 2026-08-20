import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { PortalService } from '../shared/portal.service';
import { CommonModule } from '@angular/common';
import { AuthModal } from './main/auth-modal/auth-modal';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    Navbar,
    Footer,
    AuthModal,
    RouterOutlet
],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ScholarFund');
  
  public portalService = inject(PortalService);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 20) {
      this.portalService.isScrolled = true;
    } else {
      this.portalService.isScrolled = false;
    }
  }
}
