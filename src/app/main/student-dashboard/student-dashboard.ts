import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Apiservice } from '../../../shared/api/apiservice';
import { StudentProfileResponse } from '../../../shared/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard implements OnInit {
  public portalService = inject(PortalService);
  private apiService = inject(Apiservice);
  private router = inject(Router);

  
  ngOnInit(): void {
    this.fetchStudentProfile();
  }

  studentProfile: StudentProfileResponse | null = null;

  fetchStudentProfile() {
    this.apiService.getStudentProfile().subscribe({
      next: (res) => {
        this.studentProfile = res.data;

        console.log('Student Profile response:', this.studentProfile);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  readonly schemeId = '1';

  get isApplied(): boolean {
    return this.portalService.appliedScholarships.includes(this.schemeId);
  }

  applyForScheme() {
    this.router.navigate(['/application-form']);
    // this.portalService.applyScholarship(this.schemeId);
  }

}
