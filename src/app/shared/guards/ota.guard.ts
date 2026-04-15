import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';


export const OtaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  if (authService.user() && (userService.hasOtaAdminRole() || userService.hasOtaEditorRole())) {
    return true;
  }
  return router.navigate(['/login']);
};