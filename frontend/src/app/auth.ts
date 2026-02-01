import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  login(password: string) {
    // Note: URL is relative because of our Nginx proxy!
    return this.http.post<any>('/api/login', { password }).pipe(
      tap(res => {
        this.token = res.token;
        localStorage.setItem('val_token', res.token);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('val_token');
  }
}
