import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const authGuard = () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const token = localStorage.getItem('val_token');

  if (!token) {
    router.navigate(['/']);
    return false;
  }

  // Ask the backend if this token is actually legit
  return http.get('/api/verify-token').pipe(
    map(() => true), // If 200 OK, allow access
    catchError(() => {
      console.error("Token invalid or expired. Redirecting...");
      localStorage.removeItem('val_token'); // Clean up the bad token
      router.navigate(['/']);
      return of(false); // Deny access
    })
  );
};