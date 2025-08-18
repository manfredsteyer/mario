export type Direction = 'right' | 'left';


export type HeroState = {
  position: Position;
  acceleration: number;
};

export type Position = {
  x: number;
  y: number;
}

export const initHeroState: HeroState = {
  position: { 
    x: 4, 
    y: 16 
  },
  acceleration: 0
}

export type GameState = {
  offset: number;
  levelId: number;
  hero: HeroState;
  animation: boolean;
  direction: Direction;
};

let _state: GameState = {
  offset: 0,
  levelId: 0,
  hero: initHeroState,
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
