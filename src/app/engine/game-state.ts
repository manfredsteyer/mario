export type Direction = 'right' | 'left';

export type HeroState = {
  position: Position;
  acceleration: number;
  jumpStart: number;
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
};

export type GameState = {
  offset: number;
  levelId: number;
  hero: HeroState;
  animation: boolean;
  direction: Direction;
};

export const initGameState: GameState = {
  offset: 0,
  levelId: 0,
  hero: initHeroState,
  animation: false,
  direction: 'right',
};

let _state = getInitState();

function getInitState() {
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

export function resetGameState(): void {
  _state = getInitState();
}
