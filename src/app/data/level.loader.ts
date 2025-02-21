import { httpResource } from '@angular/common/http';
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
    
  getLevelOverviewResource() {
    return httpResource<LevelOverview>('/levels/overview.json', {
      defaultValue: initLevelOverview,
    });
  }

  getLevelOverviewResource1() {
    return httpResource<LevelOverview>('/levels/overview.json', {
      defaultValue: initLevelOverview,
      map: (raw) => {
        assertOverview(raw);
        return raw as LevelOverview;
      },
    });
  }

  getLevelResource1(levelKey: () => string) {
    return httpResource<Level>(() => `/levels/${levelKey()}.json`);
  }

  getLevelResource2(levelKey: () => string) {
    return httpResource<Level>(() => `/levels/${levelKey()}.json`, {
      defaultValue: initLevel,
    });
  }

  getLevelResource3(levelKey: () => string) {
    return httpResource<Level>(() => ({
      url: `/levels/${levelKey()}.json`,
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      params: {
        levelId: levelKey(),
      },
      reportProgress: true,
      body: null,
      transferCache: false,
      withCredentials: false,
    }));
  }

  getLevelResource4(levelKey: () => string) {
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
        reportProgress: true,
        body: null,
        transferCache: false,
        withCredentials: false,
      }),
      { defaultValue: initLevel }
    );
  }

  getLevelResource(levelKey: () => string | undefined) {
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

function assertOverview(raw: unknown): void {
  const correct =
    typeof raw === 'object' &&
    raw !== null &&
    'levels' in raw &&
    Array.isArray(raw.levels);

  if (!correct) {
    throw new Error('LevelOverview has an invalid structure!');
  }
}
