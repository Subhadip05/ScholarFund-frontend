import { Routes } from '@angular/router';
import { Landing } from './main/landing/landing';
import { StudentDashboard } from './main/student-dashboard/student-dashboard';
import { CollageDashboard } from './main/collage-dashboard/collage-dashboard';
import { GovernmentDashboard } from './main/government-dashboard/government-dashboard';
import { ApplicationForm } from './main/application-form/application-form';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'student', component: StudentDashboard },
  { path: 'college', component: CollageDashboard },
  { path: 'government', component: GovernmentDashboard },
  {path: 'application-form', component: ApplicationForm},
  { path: '**', redirectTo: '' },
];
