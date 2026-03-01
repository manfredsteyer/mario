import {
  FALL_GRAVITY,
  HERO_PADDING,
  INITIAL_JUMP_VELOCITY,
  JUMP_GRAVITY,
} from './constants';
import { getHeroTile } from './hero-tiles';
import { keyboard } from './keyboard';
import { SIZE } from './palettes';
import { toBottom, toLeft, toRight } from './coordinates';
import type { GameContext } from './game-context';
import type { Item } from './tiles';
import { calcMaxX, calcMaxY, calcMinX, calcMinY } from './walls';

export type GravityStatus = 'NOT_FALLING' | 'FALLING';
export type JumpStatus = 'NOT_JUMPING' | 'JUMPING';

export function drawHero(ctx: GameContext): void {
  const tile = getHeroTile(
    ctx,
    ctx.timeStamp,
    ctx.heroTiles,
    ctx.movedVertically,
    ctx.direction,
  );
  const { y } = ctx.hero.position;
  ctx.context.drawImage(tile, ctx.renderX, y);
}

export function moveHero(ctx: GameContext): void {
  let hitGround = false;
  const initY = ctx.hero.position.y;

  if (!keyboard.up) {
    ctx.isJumping = false;
    ctx.hero.jumpVelocity = 0;
  }

  if (!ctx.isJumping) {
   const gravityStatus = applyGravity(ctx);
    hitGround = (gravityStatus === 'NOT_FALLING');
  } else {
    const status = jump(ctx, ctx.delta, ctx.timeStamp);
    ctx.isJumping = (status === 'JUMPING');
    ctx.hitTop = (status === 'NOT_JUMPING');
  }

  if (keyboard.up && hitGround) {
    ctx.isJumping = true;
  }

  if (keyboard.left) {
    goLeft(ctx);
  } else if (keyboard.right) {
    goRight(ctx);
  }

  ctx.hero.runStart =
    (keyboard.left || keyboard.right) ? ctx.hero.runStart || ctx.timeStamp : 0;

  ctx.hero.position.x = Math.max(0, ctx.hero.position.x);
  ctx.isFalling = ctx.hero.position.y > initY;
  ctx.movedVertically = initY !== ctx.hero.position.y;
}

export function goRight(ctx: GameContext): void {
  const hero = ctx.hero;
  const maxX = calcMaxX(hero, ctx.level);
  const candX = hero.position.x + 1 * ctx.delta;
  hero.position.x = Math.min(candX, maxX);
  ctx.direction = 'right';
}

export function goLeft(ctx: GameContext): void {
  const hero = ctx.hero;
  const minX = calcMinX(hero, ctx.level);
  const candX = hero.position.x - 1 * ctx.delta;
  hero.position.x = Math.max(candX, minX);
  ctx.direction = 'left';
}

function jump(ctx: GameContext, delta: number, timeStamp: number): JumpStatus {
  
  const y = ctx.hero.position.y;
  const minY = calcMinY(ctx.hero, ctx.level);

  const formerVelocity = ctx.hero.jumpVelocity || INITIAL_JUMP_VELOCITY;
  const velocity = Math.max(0, formerVelocity - JUMP_GRAVITY * delta);
  const candY = y - velocity * delta;
  const newY = Math.max(candY, minY);

  ctx.hero.position.y = newY;

  if (newY === y) {
    ctx.hero.jumpVelocity = 0;
    return 'NOT_JUMPING';
  }
  else {
    ctx.hero.jumpVelocity = velocity;
    return 'JUMPING';
  } 

}

export function checkHitQuestionMark(ctx: GameContext): void {
  if (!ctx.hitTop) {
    return;
  }
  const timeStamp = ctx.hitTopTimeStamp ?? ctx.timeStamp;

  const y = ctx.hero.position.y;
  const leftX = ctx.hero.position.x + SIZE - HERO_PADDING;
  const rightX = ctx.hero.position.x + HERO_PADDING;

  const blockIndex = ctx.level.items.findIndex((item: Item) => {
    return (
      item.tileKey === 'questionMark' &&
      toBottom(item) === y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX
    );
  });

  const block = blockIndex === -1 ? null : ctx.level.items[blockIndex];
  if (!block) {
    ctx.hitTop = false;
    ctx.hitTopTimeStamp = undefined;
    return;
  }

  const repeatCol = block.repeatCol ?? 1;
  const baseRow = block.row;
  const baseCol = block.col;
  const centerX = (leftX + rightX) / 2;
  const hitColIndex = Math.min(
    Math.max(0, Math.floor((centerX - toLeft(block)) / SIZE)),
    repeatCol - 1
  );

  const hitCol = baseCol + hitColIndex;
  const hitRow = baseRow;

  if (repeatCol === 1) {
    block.tileKey = 'empty';
    ctx.risingCoins.push({ col: hitCol, row: hitRow, startTime: timeStamp });
  } else {
    block.col = hitCol;
    block.repeatCol = 1;
    block.tileKey = 'empty';

    const otherItems: Item[] = [];
    for (let i = 0; i < repeatCol; i++) {
      if (i === hitColIndex) {
        continue;
      }
      otherItems.push({
        ...block,
        col: baseCol + i,
        row: baseRow,
        repeatCol: 1,
        tileKey: 'questionMark',
      });
    }
    ctx.level.items.splice(blockIndex, 1, block, ...otherItems);
    ctx.risingCoins.push({ col: hitCol, row: hitRow, startTime: timeStamp });
  }

  const { levelGrid } = ctx.level;
  for (let c = 0; c < repeatCol; c++) {
    const col = baseCol + c;
    const isEmpty = c === hitColIndex;
    levelGrid[baseRow][col] = {
      tileKey: isEmpty ? 'empty' : 'questionMark',
      tile: isEmpty ? ctx.tiles.empty : ctx.tiles.questionMark,
      col,
      row: baseRow,
    };
  }

  ctx.hitTop = false;
  ctx.hitTopTimeStamp = undefined;
}

function applyGravity(ctx: GameContext): GravityStatus {
  
  // TODO 1: Implement velocity
  
  // 1.1: Check how far the hero can fall 
  // 1.2: Increase velocity while falling
  // 1.3: Incrase y by velocity
  //
  // You need: ctx.hero, getMaxY

  return 'NOT_FALLING';
}
