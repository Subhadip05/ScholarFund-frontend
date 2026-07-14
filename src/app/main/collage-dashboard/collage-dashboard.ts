import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';

@Component({
  selector: 'app-collage-dashboard',
  imports: [CommonModule],
  templateUrl: './collage-dashboard.html',
  styleUrl: './collage-dashboard.css',
})
export class CollageDashboard {
  public portalService = inject(PortalService);

  getPendingCount(): number {
    return this.portalService.collegeApplications.filter(a => a.status === 'Pending').length;
  }

  getApprovedCount(): number {
    return this.portalService.collegeApplications.filter(a => a.status === 'Approved').length;
  }
}
