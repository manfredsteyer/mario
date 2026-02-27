export type Direction = 'right' | 'left';

export type HeroState = {
  position: Position;
  acceleration: number;
  jumpStart: number;
  runStart: number;
};

import { SIZE } from './palettes';

export type Position = {
  x: number;
  y: number;
};

export const initPosition: Position = {
  x: 16,
  y: 0,
};

export const initHeroState: HeroState = {
  position: initPosition,
  acceleration: 0,
  jumpStart: 0,
  runStart: 0,
};

export type GumbaState = {
  position: Position;
  direction: Direction;
  alive: boolean;
};

export type GameState = {
  offset: number;
  levelId: number;
  hero: HeroState;
  gumbas: GumbaState[];
  animation: boolean;
  direction: Direction;
};

export const initGameState: GameState = {
  offset: 0,
  levelId: 0,
  hero: initHeroState,
  gumbas: [],
  animation: false,
  direction: 'right',
};

let _state = getInitState();

function getInitState(): GameState {
  return {
    ...initGameState,
    hero: {
      ...initHeroState,
      position: { ...initPosition }
    },
  };
}

export function setGameState(state: GameState): void {
  _state = state;
}

export function getGameState(): GameState {
  return _state;
}

export type Updater = (state: GameState) => GameState;

export function updateGameState(updater: Updater): void {
  const newState = updater(getGameState());
  setGameState(newState);
}

export type LevelForReset = {
  levelId: number;
  gumbas?: { col: number; row: number }[];
};

export function resetGameState(level?: LevelForReset): void {
  _state = getInitState();
  if (level?.gumbas?.length) {
    _state.gumbas = level.gumbas.map(({ col, row }) => ({
      position: { x: col * SIZE, y: row * SIZE },
      direction: 'left' as const,
      alive: true,
    }));
  }
}
