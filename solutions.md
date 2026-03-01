# Solution

## Lab 1: Apply Gravity

```ts
// src/app/engine/hero.ts

function applyGravity(ctx: GameContext): GravityStatus {
  const y = ctx.hero.position.y;
  const maxY = 12 * SIZE;

  const velocity = ctx.hero.fallVelocity + FALL_GRAVITY * ctx.delta;
  const candY = y + velocity * ctx.delta;

  const newY = Math.min(maxY, candY);
  ctx.hero.position.y = newY;

  if (newY !== y) {
    ctx.hero.fallVelocity = velocity;
    return 'FALLING';
  }
  else {
    ctx.hero.fallVelocity = 0;
    return 'NOT_FALLING';
  }
}
```

## Lab 2: Check for Floor

```ts
// src/app/engine/walls.ts

export function getAboveSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;

  const startRow = Math.floor(y / SIZE) - 1;
  const leftCol = Math.max(0, Math.floor(x / SIZE));
  const rightCol = Math.min(
    colCount - 1,
    Math.ceil(x  / SIZE)
  );

  for (let row = startRow; row >= 0; row--) {
    for (let col = leftCol; col <= rightCol; col++) {
      const cell = levelGrid[row][col];
      if (isSolid(cell.tileKey)) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}
```

```ts
// src/app/engine/hero.ts

function applyGravity(ctx: GameContext): GravityStatus {
  const y = ctx.hero.position.y;

  // Call calcMaxY
  const maxY = calcMaxY(ctx.hero, ctx.level);

  const velocity = ctx.hero.fallVelocity + FALL_GRAVITY * ctx.delta;
  const candY = y + velocity * ctx.delta;

  const newY = Math.min(maxY, candY);
  ctx.hero.position.y = newY;

  if (newY !== y) {
    ctx.hero.fallVelocity = velocity;
    return 'FALLING';
  }
  else {
    ctx.hero.fallVelocity = 0;
    return 'NOT_FALLING';
  }
}
```

## Lab 3: Side Scrolling

```ts
// src/app/engine/level.ts

function scrollLevel(ctx: GameContext): void {
  const center = ctx.width / SCALE / 2;
  const x = ctx.hero.position.x;

  ctx.renderX = Math.min(x, center - SIZE);
  ctx.scrollOffset = (x - ctx.renderX);
}
```

## Lab 4: Only Paint View Port

```ts
// src/app/engine/level.ts

function drawLevel(ctx: LevelDrawContext): void {
  [...]

  const firstCol = Math.max(0, Math.floor(scrollOffset / SIZE) - 1);
  const lastCol = Math.min(
    colCount - 1,
    Math.ceil(((width / SCALE) + scrollOffset) / SIZE) + 1
  );

  [...]
}
```

## Lab 5: Collision Detection

```ts
// src/app/engine/gumba.ts

export function checkHeroGumbaCollision(ctx: GameContext): void {
  [...]

    const collision =
      heroRight > gumbaLeft &&
      heroLeft < gumbaRight &&
      heroBottom > gumbaTop &&
      heroTop < gumbaBottom;

  [...]
}
```