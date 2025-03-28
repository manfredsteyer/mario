import { LevelOverview } from "../data/level-info";
import { Level } from "../engine/level";

//
//  Just for the sake of demonstration
//  Use something like Zod in real world projects
//

export function toLevelOverview(raw: unknown): LevelOverview {
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

export function toLevel(raw: unknown): Level {
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
