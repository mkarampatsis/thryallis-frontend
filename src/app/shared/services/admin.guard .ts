import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';


export const AdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const router = inject(Router);

    if (authService.user() && userService.hasAdminRole()) {
        return true;
    }
    return router.navigate(['/login']);
};
