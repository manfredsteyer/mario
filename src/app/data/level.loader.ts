import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '../engine/level';
import { initLevel } from './init-level';
import { initLevelOverview, LevelOverview } from './level-info';

@Injectable({ providedIn: 'root' })
export class LevelLoader {
  getLevelOverviewResource(): HttpResourceRef<LevelOverview> {
    return httpResource<LevelOverview>(() => '/levels/overview.json', {
      defaultValue: initLevelOverview,
    });
  }

  getLevelResource(
    levelKey: () => string | undefined
  ): HttpResourceRef<Level> {
    return httpResource<Level>(() => !levelKey() ? undefined : `/levels/${levelKey()}.json`, {
      defaultValue: initLevel,
      // parse: toLevel,
    });
  }

  getLevelResource4(levelKey: () => string): HttpResourceRef<Level> {
    return httpResource<Level>(
      () => ({
        url: `/levels/${levelKey()}.json`,
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
        params: {
          levelId: levelKey(),
        },
        reportProgress: false,
        body: null,
        transferCache: false,
        withCredentials: false,
      }),
      { defaultValue: initLevel }
    );
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
