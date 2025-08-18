export type Direction = 'right' | 'left';

export type Position = {
  x: number;
  y: number;
}

export const initPosition = {
  x: 20,
  y: 20
}

export type GameState = {
  offset: number;
  levelId: number;
  heroPosition: Position;
  animation: boolean;
  direction: Direction;
};

let _state: GameState = {
  offset: 0,
  levelId: 0,
  heroPosition: initPosition,
  animation: false,
  direction: 'right',
};

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
