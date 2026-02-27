import { resetGumbas } from './gumba';

export type Direction = 'right' | 'left';

export type ObjectState = {
  position: Position;
};

export type HeroState = ObjectState & {
  position: Position;
  acceleration: number;
  jumpStart: number;
  runStart: number;
};

export type GumbaState = ObjectState & {
  direction: Direction;
  alive: boolean;
};
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

export type RisingCoin = {
  col: number;
  row: number;
  startTime: number;
};

export type GameState = {
  offset: number;
  levelId: number;
  hero: HeroState;
  gumbas: GumbaState[];
  risingCoins: RisingCoin[];
  hitQuestionBlocks: Set<string>;
  animation: boolean;
  direction: Direction;
  isFalling: boolean;
};

export const initGameState: GameState = {
  offset: 0,
  levelId: 0,
  hero: initHeroState,
  gumbas: [],
  risingCoins: [],
  hitQuestionBlocks: new Set(),
  animation: false,
  direction: 'right',
  isFalling: false,
};

let _state = getInitState();

function getInitState(): GameState {
  return {
    ...initGameState,
    hero: {
      ...initHeroState,
      position: { ...initPosition },
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
  _state.gumbas = resetGumbas(level);
  _state.risingCoins = [];
  _state.hitQuestionBlocks = new Set();
}
