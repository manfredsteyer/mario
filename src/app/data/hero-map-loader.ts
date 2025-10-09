import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from '../config';

@Injectable({ providedIn: 'root' })
export class HeroMapLoader {
  getHeroMapResource(): HttpResourceRef<Blob | undefined> {
    return httpResource.blob(() => ({
      url: config.hero,
      reportProgress: true,
    }));
  }
}