import { keyboard } from './keyboard';

export type HeroDemoContext = {
  x: number;
  y: number;
  context: CanvasRenderingContext2D;
  heroTile: ImageBitmap;
};

async function loadImage() {
  const response = await fetch('/hero.png');
  const blob = await response.blob();

  const heroTile = await createImageBitmap(
    blob,
    0, // x
    8, // y
    16, // width
    16 // height
  );
  return heroTile;
}

export async function runHeroDemo(
  canvas: HTMLCanvasElement
): Promise<void> {

  const heroTile = await loadImage();
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('context not available');
  }

 const ctx: HeroDemoContext = {
  heroTile,
  context,
  x: 10,
  y: 10
 }

  requestAnimationFrame((timeStamp) => tick(ctx, timeStamp));
}


function tick(ctx: HeroDemoContext, timeStamp: number): void {
  console.log('timeStamp', timeStamp);

  if (keyboard.right) {
    ctx.x += 1;
  }
  if (keyboard.left) {
    ctx.x -= 1;
  }
  ctx.context.clearRect(0, 0, 1000, 1000);
  ctx.context.drawImage(ctx.heroTile, ctx.x, ctx.y, 16, 16);

  requestAnimationFrame((timeStamp) => tick(ctx, timeStamp));
}