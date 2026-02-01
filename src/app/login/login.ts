import { Component, signal, OnInit } from '@angular/core'; // <--- Import signal
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  password = '';

  // Define them as signals
  errorMessage = signal(''); 
  isLoading = signal(false);
  isVerifying = signal(true);

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // If there is a token in localStorage, verify it and redirect accordingly.
    const token = localStorage.getItem('val_token');
    if (!token) {
      this.isVerifying.set(false);
      return;
    }

    this.isLoading.set(true);

    this.http.get<{ hasAccepted: boolean }>('/api/verify-token').subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.hasAccepted) {
          this.router.navigate(['/card']);
        } else {
          this.router.navigate(['/invitation']);
        }
      },
      error: (err) => {
        // Verification failed (expired/invalid token or server error). Remove token and remain on login.
        console.warn('Token verification failed:', err);
        try { localStorage.removeItem('val_token'); } catch (e) { /* ignore */ }
        this.isVerifying.set(false); // allow login UI to show

        // Optionally surface an error for non-auth failures
        if (err?.status && err.status !== 401) {
          this.errorMessage.set('Unable to verify login status (server issue). Please sign in.');
        }
      }
    });
  }

  checkPassword() {
    console.log("Button clicked...");

    if (!this.password) return;

    // Update signals using .set()
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.password).subscribe({
      next: (res) => {
        console.log("Success");
        this.isLoading.set(false);

        if (res.hasAccepted) {
          this.router.navigate(['/card']);
        } else {
          this.router.navigate(['/invitation']);
        }
      },
      error: (err) => {
        console.error("Error block hit:", err);

        // This will force the UI to update immediately
        this.isLoading.set(false);

        if (err.status === 401) {
           this.errorMessage.set("That's not the secret code! 💔");
        } else {
           this.errorMessage.set("Server error. Is the backend running?");
        }
      }
    });
  }
}