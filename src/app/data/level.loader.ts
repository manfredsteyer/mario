import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '../engine/level';
import { initLevel } from './init-level';
import { initLevelOverview, LevelOverview } from './level-info';

@Injectable({ providedIn: 'root' })
export class LevelLoader {
  
  getLevelResource(levelKey: () => string | undefined): HttpResourceRef<Level> {
    
    return httpResource<Level>(
      () => (!levelKey() ? undefined : `/levels/${levelKey()}.json`),
      {
        defaultValue: initLevel,
        parse: raw => toLevel(raw), // zod
      }
    );
    
  }

  getLevelResource2(levelKey: () => string | undefined): HttpResourceRef<Level> {
    return httpResource<Level>(
      () => !levelKey() ? undefined : ({
        url: `/levels/${levelKey()}.json`,
        headers: {
          accept: 'application/json',
        },
        params: {
          levelId: levelKey() ?? '',
        },
        method: 'GET',
        body: null,
        reportProgress: false,
        transferCache: false,
        withCredentials: false,
      }),
      { defaultValue: initLevel }
    );
  }

  getLevelOverviewResource(): HttpResourceRef<LevelOverview> {
    return httpResource<LevelOverview>(() => `/levels/overview.json`, {
      defaultValue: initLevelOverview,
    });
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
