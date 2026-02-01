import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation.html'
})
export class Invitation {
  noButtonPos = { x: 0, y: 0 };
  isButtonMoved = false;

  constructor(private router: Router, private http: HttpClient) {}

  moveButton() {
    // Generate random coordinates within the viewport
    // Padding of 150px keeps it from hugging the very edge
    const pad = 150;
    this.noButtonPos = {
      x: Math.random() * (window.innerWidth - pad),
      y: Math.random() * (window.innerHeight - pad)
    };
    this.isButtonMoved = true;
  }

  onYes() {
    // Tell the backend she accepted so it's remembered for next time
    this.http.post('/api/accept', {}).subscribe({
      next: () => {
        this.router.navigate(['/card']);
      },
      error: () => {
        // Fallback: even if backend fails, let her see the card
        this.router.navigate(['/card']);
      }
    });
  }
}
