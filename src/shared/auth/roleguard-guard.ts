import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Authservice } from './authservice';

export const roleguardGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as Array<string>) || [];
  const currentUserRole = authService.getUserRole();

  console.log('User role in roleguardGuard', currentUserRole);

  if (currentUserRole && allowedRoles.includes(currentUserRole)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
