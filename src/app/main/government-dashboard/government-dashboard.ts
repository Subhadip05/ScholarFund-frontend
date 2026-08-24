import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output, signal } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { DocType, InstituteDto, MainTab, ScholarshipApplicationDto } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';
import { ApplicationsViewComponent } from "../govt-admin-module/applications-view.component";
import { InstitutesViewComponent } from "../govt-admin-module/institutes-view.component";
import { DisbursementViewComponent } from "../govt-admin-module/disbursement-view.component";
import { ApplicationDetailModalComponent } from "../govt-admin-module/application-detail-modal.component";
import { InstituteDetailModalComponent } from "../govt-admin-module/institute-detail-modal.component";
import { DocumentViewerModalComponent } from "../govt-admin-module/document-viewer-modal.component";
import { BatchDisburseModalComponent } from "../govt-admin-module/batch-disburse-modal.component";

@Component({
  selector: 'app-government-dashboard',
  imports: [CommonModule, ApplicationsViewComponent, InstitutesViewComponent, DisbursementViewComponent, ApplicationDetailModalComponent, InstituteDetailModalComponent, DocumentViewerModalComponent, BatchDisburseModalComponent],
  templateUrl: './government-dashboard.html',
  styleUrl: './government-dashboard.css',
})
export class GovernmentDashboard {
  public service = inject(PortalService);

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

  onSelectTab(tab: MainTab) {
    console.log("tab selected: ", tab);
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

  openDocViewer(
    app: ScholarshipApplicationDto | null,
    inst: InstituteDto | null,
    type: DocType
  ) {
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
