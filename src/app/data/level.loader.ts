import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Level } from '../engine/level';
import { initLevel } from './init-level';
import { initLevelOverview, LevelOverview } from './level-info';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LevelLoader {

  private http = inject(HttpClient);

  loadLevelOverview(): Observable<LevelOverview> {
    return this.http.get<LevelOverview>('/levels/overview.json');
  }

  getLevelOverviewResource(): HttpResourceRef<LevelOverview> {
    // TODO
  }

  loadLevel(levelKey: number): Observable<Level> {
    return this.http.get<Level>(`/levels/${levelKey}.json`);
  }

  getLevelResource(
    levelKey: () => string | undefined
  ): HttpResourceRef<Level> {
   // TODO
  }
}
