import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard {
    public portalService = inject(PortalService);

    isSchemeEligible(scheme: any): boolean {
    const meta = this.portalService.userMetadata;
    if (!meta) return false;
    const isIncomeEligible = meta.income <= scheme.maxIncome;
    const isCategoryEligible = scheme.category.includes(meta.category);
    const isGPAEligible = (meta.gpa * 10) >= scheme.minGPA;
    return isIncomeEligible && isCategoryEligible && isGPAEligible;
  }

  isSchemeApplied(schemeId: string): boolean {
    return this.portalService.appliedScholarships.includes(schemeId);
  }

  getMatchedCount(): number {
    const meta = this.portalService.userMetadata;
    if (!meta) return 0;
    return this.portalService.scholarshipSchemes.filter(scheme => {
      return meta.income <= scheme.maxIncome &&
             scheme.category.includes(meta.category) &&
             (meta.gpa * 10) >= scheme.minGPA;
    }).length;
  }

}
