import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Level } from '../engine/level';
import { initLevel } from './init-level';
import { initLevelOverview, LevelOverview } from './level-info';

//
//  The following methods ending with 1, 2, 3, ... are just to show
//  the different options in the article
//

@Injectable({ providedIn: 'root' })
export class LevelLoader {
  getLevelOverviewResource(): HttpResourceRef<LevelOverview> {
    return httpResource<LevelOverview>('/levels/overview.json', {
      defaultValue: initLevelOverview,
    });
  }

  getLevelOverviewResource1(): HttpResourceRef<LevelOverview> {
    return httpResource<LevelOverview>('/levels/overview.json', {
      defaultValue: initLevelOverview,
      parse: (raw) => {
        return toLevelOverview(raw);
      },
    });
  }

  getLevelResource(
    levelKey: () => string | undefined
  ): HttpResourceRef<Level> {
    return httpResource<Level>(() => !levelKey() ? undefined : `/levels/${levelKey()}.json`, {
      defaultValue: initLevel,
    });
  }

  getLevelResource2(levelKey: () => string): HttpResourceRef<Level> {
    return httpResource<Level>(() => `/levels/${levelKey()}.json`, {
      defaultValue: initLevel,
      parse: (raw) => {
        return toLevel(raw);
      },
      // equal
      // injector
    });
  }

  getLevelResource3(
    levelKey: () => string
  ): HttpResourceRef<Level | undefined> {
    return httpResource<Level>(() => ({
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
    }));
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

  getLevelResource5(
    levelKey: () => string | undefined
  ): HttpResourceRef<Level> {
    return httpResource<Level>(
      () => {
        const key = levelKey();
        if (!key) {
          return undefined;
        }
        return {
          url: `/levels/${key}.json`,
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
          params: {
            levelId: key,
          },
          reportProgress: true,
          body: null,
          transferCache: false,
          withCredentials: false,
        };
      },
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
