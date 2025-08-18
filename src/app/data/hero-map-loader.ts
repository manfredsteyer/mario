import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeroMapLoader {
  getHeroMapResource(): HttpResourceRef<Blob | undefined> {
    return httpResource.blob(() => ({
      url: `/hero.png`,
      reportProgress: true,
    }));
  }
}