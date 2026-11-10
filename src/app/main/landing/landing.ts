import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Authservice } from '../../../shared/auth/authservice';

@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  
  public portalService = inject(PortalService);
  public authService = inject(Authservice);


  studentPortalImg = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop";
  adminPortalImg = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop";


  ngOnInit(): void {
    console.log("Landing page..");
    
    // If a student/user arrives at the public home page while still possessing credentials, log out
    if (this.authService.getAccessToken()) {
      this.portalService.logout();
    }
  }
}
