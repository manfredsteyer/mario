import type { GameState } from './game-state';
import { SIZE } from './palettes';
import type { TileSet } from './tiles';

const RISE_DURATION_MS = 500;
const RISE_DISTANCE = SIZE * 3;

export function drawRisingCoins(
  context: CanvasRenderingContext2D,
  tiles: TileSet,
  offset: number,
  timeStamp: number,
  gameState: GameState
): void {
  const coinTile = tiles.coin as ImageBitmap;
  const stillRising: typeof gameState.risingCoins = [];
  for (const rc of gameState.risingCoins) {
    const progress = (timeStamp - rc.startTime) / RISE_DURATION_MS;
    if (progress >= 1) continue;
    stillRising.push(rc);
    const upProgress = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
    const yOffset = upProgress * RISE_DISTANCE;
    const x = SIZE * rc.col + offset;
    const y = SIZE * rc.row - yOffset;
    context.drawImage(coinTile, x, y);
  }
  gameState.risingCoins.length = 0;
  gameState.risingCoins.push(...stillRising);
}
