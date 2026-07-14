import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { PortalService } from '../shared/portal.service';
import { CommonModule } from '@angular/common';
import { StudentDashboard } from './main/student-dashboard/student-dashboard';
import { CollageDashboard } from './main/collage-dashboard/collage-dashboard';
import { GovernmentDashboard } from './main/government-dashboard/government-dashboard';
import { Landing } from './main/landing/landing';
import { Modals } from './main/modals/modals';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    Navbar,
    Footer,
    StudentDashboard,
    CollageDashboard,
    GovernmentDashboard,
    Landing,
    Modals,
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
