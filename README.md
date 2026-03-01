# ngMario - Labs

In this lab, you will implement selected aspects of the ngMario side scrolling platformer game.

The goals of these labs are:

- Having fun!
- Learning or repeating typical game development patterns

Besides this, such labs are a nice way to train programming skills and a good fit for hackathons.


## Task 1: Gravity

Implement gravity in `src/app/engine/hero.ts`:

### First Implementation

- To get started, assume the floor below 12 * SIZE
- Look at `ctx.hero.position` and `ctx.delta`

### Bonus: Acceleration

- Find a way to accelerate the falling velocity during time
- You can find/ store the current velocity here: `ctx.hero.fallVelocity`
- Don't forget to reset the velocity to `0` when you hit the ground

## Task 2: Check for Floor

In `src/app/engine/walls.ts`, find out what's the first tile that stops you from falling any further:

- Search the `levelGrid` from the hero's position downwards
- Look at `entity.position` and `colCount`
- When you are done, call `getMaxY` in your gravity implementation in `hero.ts`

## Task 3: Side Scrolling

In `src/app/engine/level.ts`, implement side scrolling:

- When reaching the screen's center, instead of moving the hero, scroll the level
- `renderX` is the position where the hero is paint in the window
- `scrollOffset` defines how much to scroll

## Task 4: Only Paint View Port

In `src/app/engine/level.ts`, make sure, only the view port is rendered. Invisible columns on the left and right of it should be skipped:

- Set `firstCol` and `lastCol` accordingly
- Use `width / SCALE` and `scrollOffset`

## Task 5: Collision Detection

In `src/app/engine/gumba.ts`, implement collision detection:

- Just set `collision` to `true` or `false`
- Compare the hero's bounding box to the gumba's bounding box


## Solutions

- [Solutions](./solutions.md)
- Running Version: `main` branch