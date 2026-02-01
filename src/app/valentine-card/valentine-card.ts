import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-valentine-card',
  standalone: true,
  templateUrl: './valentine-card.html',
  styleUrls: ['./valentine-card.css']
})
export class ValentineCard implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  message = signal('Loading our memories...');
  photoUrl = signal<SafeUrl | null>(null);
  bgSvgUrl = signal<SafeUrl | null>(null);

  ngOnInit() {
    // 1. Fetch Text Content
    this.http.get<any>('/api/card-content').subscribe(res => {
      this.message.set(res.message);
    });

    // 2. Fetch Protected Photo as Blob
    this.loadCurrentPhoto();
  }

  loadCurrentPhoto() {
    // Add a timestamp query param to bypass browser cache so it actually reloads
    const cacheBuster = `?t=${new Date().getTime()}`;
    this.http.get('/api/photo/current' + cacheBuster, { responseType: 'blob' }).subscribe(blob => {
      const objectURL = URL.createObjectURL(blob);
      this.photoUrl.set(this.sanitizer.bypassSecurityTrustUrl(objectURL));
    });
  }

  navigate(dir: 'next' | 'prev') {
    this.http.post('/api/photo/navigate', { direction: dir }).subscribe(() => {
      this.loadCurrentPhoto();
    });
  }

  reset() {
    this.http.post('/api/reset', {}).subscribe(() => {
      this.router.navigate(['/invitation']);
    });
  }
}