import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class roleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.role === expectedRole) {
      return true;
    }

    // Redirect to role-appropriate home
    if (currentUser?.role === 'admin') {
      this.router.navigate(['/admin/requests']);
    } else {
      this.router.navigate(['/dashboard']);
    }
    return false;
  }
}