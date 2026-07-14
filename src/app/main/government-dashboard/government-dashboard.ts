import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';

@Component({
  selector: 'app-government-dashboard',
  imports: [CommonModule],
  templateUrl: './government-dashboard.html',
  styleUrl: './government-dashboard.css',
})
export class GovernmentDashboard {
  public portalService = inject(PortalService);

  ministryList = [
    "All Schemes",
    "Ministry of Education (MoE)",
    "Ministry of Social Justice & Empowerment",
    "Ministry of Minority Affairs (MoMA)",
    "Ministry of Tribal Affairs"
  ];

  selectScheme(scheme: string) {
    this.portalService.selectedDeptScheme = scheme;
  }

  toggleDisbursal() {
    const nextStatus = !this.portalService.disbursalApprovedStatus;
    this.portalService.disbursalApprovedStatus = nextStatus;
    if (nextStatus) {
      this.portalService.systemAlertMessage = "Direct bank transfer releases initialized successfully. System dispatch pending.";
    } else {
      this.portalService.systemAlertMessage = "Releases paused. Verification cycle logged.";
    }
  }


}
