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

function toLevelOverview(raw: unknown): LevelOverview {
  const correct =
    typeof raw === 'object' &&
    raw !== null &&
    'levels' in raw &&
    Array.isArray(raw.levels);

  if (!correct) {
    throw new Error('LevelOverview has an invalid structure!');
  }

  return raw as LevelOverview;
}

function toLevel(raw: unknown): Level {
  const correct =
    typeof raw === 'object' &&
    raw !== null &&
    'levelId' in raw &&
    typeof raw.levelId === 'number' &&
    'backgroundColor' in raw &&
    'items' in raw &&
    Array.isArray(raw.items);

  if (!correct) {
    throw new Error('Level has an invalid structure!');
  }

  return raw as Level;
}
