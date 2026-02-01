// auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const authGuard = (route: import('@angular/router').ActivatedRouteSnapshot, state: import('@angular/router').RouterStateSnapshot) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const token = localStorage.getItem('val_token');
  if (!token) {
    // No token — redirect to login
    return router.createUrlTree(['/']);
  }

  // Verify token with backend; response must include hasAccepted: boolean
  return http.get<{ hasAccepted?: boolean }>('/api/verify-token').pipe(
    map(res => {
      const hasAccepted = !!res?.hasAccepted;
      const requestedUrl = state.url || '';

      // If user already accepted but is trying to visit /invitation, redirect to /card
      if (hasAccepted && requestedUrl.startsWith('/invitation')) {
        return router.createUrlTree(['/card']);
      }

      // If user has not accepted yet but is trying to visit /card, redirect to /invitation
      if (!hasAccepted && requestedUrl.startsWith('/card')) {
        return router.createUrlTree(['/invitation']);
      }

      // Otherwise allow the navigation
      return true;
    }),
    catchError(err => {
      // Verification failed (invalid/expired token or server error).
      console.warn('Token verification failed:', err);
      try { localStorage.removeItem('val_token'); } catch (e) { /* ignore */ }

      // Redirect to login
      return of(router.createUrlTree(['/']));
    })
  );
};
