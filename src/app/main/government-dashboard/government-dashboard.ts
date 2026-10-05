import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit, output, signal } from '@angular/core';
import { DocType, InstituteDto, MainTab, ScholarshipApplicationDto } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';
import { GovtAdminStore } from '../govt-admin-module/service/govt-admin-store';
import { ApplicationDetailModalComponent } from '../govt-admin-module/component/application-detail-modal.component';
import { ApplicationsViewComponent } from '../govt-admin-module/component/applications-view.component';
import { BatchDisburseModalComponent } from '../govt-admin-module/component/batch-disburse-modal.component';
import { DisbursementViewComponent } from '../govt-admin-module/component/disbursement-view.component';
import { DocumentViewerModalComponent } from '../govt-admin-module/component/document-viewer-modal.component';
import { InstituteDetailModalComponent } from '../govt-admin-module/component/institute-detail-modal.component';
import { InstitutesViewComponent } from '../govt-admin-module/component/institutes-view.component';

@Component({
  selector: 'app-government-dashboard',
  imports: [
    CommonModule,
    ApplicationsViewComponent,
    InstitutesViewComponent,
    DisbursementViewComponent,
    ApplicationDetailModalComponent,
    InstituteDetailModalComponent,
    DocumentViewerModalComponent,
    BatchDisburseModalComponent,
  ],
  templateUrl: './government-dashboard.html',
  styleUrl: './government-dashboard.css',
  providers: [GovtAdminStore],
})
export class GovernmentDashboard implements OnInit {
  public service = inject(GovtAdminStore);

  readonly currentTab = model<MainTab>('APPLICATIONS');
  readonly tabChange = output<MainTab>();
  readonly formatCurrency = formatCurrency;

  // View Event Outputs for Modals
  readonly openApplication = output<ScholarshipApplicationDto>();
  readonly openInstitute = output<InstituteDto>();
  readonly openBatchDisburse = output<ScholarshipApplicationDto[]>();
  readonly viewDocument = output<{
    app: ScholarshipApplicationDto | null;
    inst: InstituteDto | null;
    type: DocType;
  }>();

  ngOnInit(): void {
    console.log('Govt dashboard ...');
    this.service.fetchUnverifiedInstitutes();
    this.service.fetchApplications();
  }

  onSelectTab(tab: MainTab) {
    console.log('tab selected: ', tab);
    this.currentTab.set(tab);
  }

  readonly selectedAppForDetail = signal<ScholarshipApplicationDto | null>(null);
  readonly selectedInstituteForDetail = signal<InstituteDto | null>(null);
  readonly isBatchDisburseOpen = signal<boolean>(false);
  readonly batchDisburseApps = signal<ScholarshipApplicationDto[]>([]);

  // Document Viewer Modal State
  readonly isDocViewerOpen = signal<boolean>(false);
  readonly docViewerType = signal<DocType>('INCOME');
  readonly docViewerApp = signal<ScholarshipApplicationDto | null>(null);
  readonly docViewerInst = signal<InstituteDto | null>(null);

  openDocViewer(app: ScholarshipApplicationDto | null, inst: InstituteDto | null, type: DocType) {
    this.docViewerApp.set(app);
    this.docViewerInst.set(inst);
    this.docViewerType.set(type);
    this.isDocViewerOpen.set(true);
  }

  openBatchModal(apps: ScholarshipApplicationDto[]) {
    this.batchDisburseApps.set(apps);
    this.isBatchDisburseOpen.set(true);
  }
}
