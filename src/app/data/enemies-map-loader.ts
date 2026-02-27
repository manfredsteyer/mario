import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnemiesMapLoader {
  getEnemiesMapResource(): HttpResourceRef<Blob | undefined> {
    return httpResource.blob(() => ({
      url: '/enemies.png',
      reportProgress: true,
    }));
  }
}
