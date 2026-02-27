import type { StepContext } from './step-context';
import { SIZE } from './palettes';

const RISE_DURATION_MS = 500;
const RISE_DISTANCE = SIZE * 3;

export function drawRisingCoins(ctx: StepContext): void {
  const coinTile = ctx.tiles.coin as ImageBitmap;
  const stillRising: typeof ctx.risingCoins = [];
  for (const rc of ctx.risingCoins) {
    const progress = (ctx.timeStamp - rc.startTime) / RISE_DURATION_MS;
    if (progress >= 1) continue;
    stillRising.push(rc);
    const upProgress = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
    const yOffset = upProgress * RISE_DISTANCE;
    const x = SIZE * rc.col + ctx.scrollOffset;
    const y = SIZE * rc.row - yOffset;
    ctx.context.drawImage(coinTile, x, y);
  }
  ctx.risingCoins.length = 0;
  ctx.risingCoins.push(...stillRising);
}
