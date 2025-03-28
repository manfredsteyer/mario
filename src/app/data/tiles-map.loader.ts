import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TilesMapLoader {

  private http = inject(HttpClient);

  loadTilesMap(): Observable<Blob> {
    return this.http.get('/tiles.png', {
      responseType: 'blob',
      reportProgress: true,
    })
  }

  getTilesMapResource(): HttpResourceRef<Blob | undefined> {
    return httpResource.blob(() => ({
      url: '/tiles.png',
      reportProgress: true,
    }));
  }
}
