export type Direction = 'right' | 'left';

export type GameState = {
    offset: number;
    levelId: number;
    animation: boolean;
    direction: Direction;
};

let _state: GameState = {
    offset: 0,
    levelId: 0,
    animation: false,
    direction: 'right'
};

export function setGameState(state: GameState): void {
    _state = state;
}

export function getGameState(): GameState {
    return _state;
}

export type Updater = (state: GameState) => GameState;

export function updateGateState(updater: Updater): void {
    const newState = updater(getGameState());
    setGameState(newState);
}
