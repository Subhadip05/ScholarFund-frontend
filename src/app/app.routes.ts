import { Routes } from '@angular/router';
import { Landing } from './main/landing/landing';
import { StudentDashboard } from './main/student-dashboard/student-dashboard';
import { CollageDashboard } from './main/collage-dashboard/collage-dashboard';
import { GovernmentDashboard } from './main/government-dashboard/government-dashboard';
import { ApplicationForm } from './main/application-form/application-form';
import { roleguardGuard } from '../shared/auth/roleguard-guard';

export const routes: Routes = [
  { path: '', component: Landing },
  {
    path: 'student',
    component: StudentDashboard,
    canActivate: [roleguardGuard],
    data: { roles: ['STUDENT'] },
  },
  {
    path: 'college',
    component: CollageDashboard,
    canActivate: [roleguardGuard],
    data: { roles: ['COLLEGE'] },
  },
  {
    path: 'government',
    component: GovernmentDashboard,
    canActivate: [roleguardGuard],
    data: { roles: ['GOVT'] },
  },
  {
    path: 'application-form',
    component: ApplicationForm,
    canActivate: [roleguardGuard],
    data: { roles: ['STUDENT'] },
  },
  { path: '**', redirectTo: '' },
];
