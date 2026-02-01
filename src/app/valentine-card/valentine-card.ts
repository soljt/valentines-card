import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-valentine-card',
  standalone: true,
  templateUrl: './valentine-card.html',
  styleUrls: ['./valentine-card.css']
})
export class ValentineCard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  message = signal('Loading our memories...');
  photoUrl = signal<SafeUrl | null>(null);
  bgSvgUrl = signal<SafeUrl | null>(null);

  // track the last object URL so we can revoke it
  private lastObjectUrl: string | null = null;

  ngOnInit() {
    // 1. Fetch Text Content
    this.http.get<any>('/api/card-content').subscribe(res => {
      this.message.set(res.message);
    });

    // 2. Fetch Protected Photo as Blob
    this.loadCurrentPhoto();
  }

  loadCurrentPhoto() {
    const cacheBuster = `?t=${new Date().getTime()}`;
    this.http.get('/api/photo/current' + cacheBuster, { responseType: 'blob' }).subscribe(blob => {
      const objectURL = URL.createObjectURL(blob);

      // revoke previous object URL if present
      if (this.lastObjectUrl) {
        try { URL.revokeObjectURL(this.lastObjectUrl); } catch (e) { /* ignore */ }
      }
      this.lastObjectUrl = objectURL;

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

  logout() {
    try {
      this.http.post('/api/reset', {}).subscribe(() => {
        localStorage.removeItem('val_token');
        this.router.navigate(['/']);
      });
    } catch (e) {
      // ignore storage errors, but still navigate
    }
  }

  // Called from the img (load) event. Adds classes to trigger CSS animations.
  onImageLoad(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (!img) return;

    // trigger fade keyframe on img
    img.classList.remove('img-enter');
    // force a reflow so the animation can re-trigger
    void img.offsetWidth;
    img.classList.add('img-enter');

    // trigger shimmer on parent container
    const container = img.closest('.image-container') as HTMLElement | null;
    if (container) {
      container.classList.remove('shimmer');
      void container.offsetWidth;
      container.classList.add('shimmer');

      // remove shimmer class after animation completes
      const cleanup = () => {
        container.classList.remove('shimmer');
        container.removeEventListener('animationend', cleanup);
      };
      container.addEventListener('animationend', cleanup);
    }

    // remove the img-enter class after the animation ends so it can be retriggered later
    const imgCleanup = () => {
      img.classList.remove('img-enter');
      img.removeEventListener('animationend', imgCleanup);
    };
    img.addEventListener('animationend', imgCleanup);
  }

  ngOnDestroy() {
    if (this.lastObjectUrl) {
      try { URL.revokeObjectURL(this.lastObjectUrl); } catch (e) { /* ignore */ }
      this.lastObjectUrl = null;
    }
  }
}
