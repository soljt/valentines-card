import { Component, signal } from '@angular/core'; // <--- Import signal
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login {
  password = '';
  
  // Define them as signals
  errorMessage = signal(''); 
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

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