import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public portalService = inject(PortalService);

}
