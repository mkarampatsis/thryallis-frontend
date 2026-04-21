import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const HasOneRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.user()) {
    const roles = authService.user()?.roles ?? [];
    if (roles.length === 1) {
      return true;
    }    
  }
  return router.navigate(['/user-roles']);
};