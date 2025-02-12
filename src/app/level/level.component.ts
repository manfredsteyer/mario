import { Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core';
import { TilesLoaderService } from './tiles.loader.service';

@Component({
  selector: 'app-level',
  imports: [],
  templateUrl: './level.component.html',
})
export class LevelComponent {

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  context = computed(() => this.canvas()?.nativeElement.getContext('2d'));

  tilesLoader = inject(TilesLoaderService);
  
  tilesResource = this.tilesLoader.getTilesResource();
  tilesMap = this.tilesResource.value;

  constructor() {
    effect(() => {
      console.log('tilesMap', this.tilesMap());
      console.log('canvas', this.canvas());

      const tilesMap = this.tilesMap();
      const context = this.context();

      const c = this.canvas();

      if (c) {
        // c.nativeElement.width = 2000;
        // c.nativeElement.height = 768;
      }

      if (context && tilesMap) {
        render(context, tilesMap);
      }

    });
  }

}

const SIZE = 16;
type Palette = {
  x: number,
  y: number;
};

async function render(context: CanvasRenderingContext2D, tiles: Blob): Promise<void> {
  const bitmap = await createImageBitmap(tiles);

context.scale(2,2)
  const p1 = {
    x: 0, 
    y: 16
  };

  const p3 = {
    x: 298,
    y: 78,
  }

  const p2 = {
    x: 298,
    y: 78 -62,
  }


  const p0 = {
    x: 0, 
    y: 12 * (SIZE+1) - 8
  };


  const cloudTopLeft = await getTile(bitmap, p2, 0, 0);
  const cloudTopMiddle = await getTile(bitmap, p2, 1, 0);
  const cloudTopRight = await getTile(bitmap, p2, 2, 0);

  const cloudBottomLeft = await getTile(bitmap, p2, 0, 1);
  const cloudBottomMiddle = await getTile(bitmap, p2, 1, 1);
  const cloudBottomRight = await getTile(bitmap, p2, 2, 1);

  const waves = await getTile(bitmap, p2, 3, 0);
  const water = await getTile(bitmap, p2, 3, 1);


  const floor = await getTile(bitmap, p1, 0, 0);
  const brick = await getTile(bitmap, p1, 1, 0);

  const stump = await getTile(bitmap, p1, 1, 3);


  const qm = await getTile(bitmap, p3, 0, 0);
  const coin = await getTile(bitmap, p3, 0, 1);

  const topLeft = await getTile(bitmap, p0, 0, 0);
  const topMiddle = await getTile(bitmap, p0, 1, 0);
  const topRight = await getTile(bitmap, p0, 2, 0);

  const bushLeft = await getTile(bitmap, p0, 0, 1);
  const bushMiddle = await getTile(bitmap, p0, 1, 1);
  const bushRight = await getTile(bitmap, p0, 2, 1);

  const hillLeft = await getTile(bitmap, p0, 0, 3);
  const hillInnerLeft = await getTile(bitmap, p0, 1, 3);
  const hillMiddle = await getTile(bitmap, p0, 2, 3);
  const hillInnerRight = await getTile(bitmap, p0, 3, 3);
  const hillRight = await getTile(bitmap, p0, 4, 3);
  const hillTop = await getTile(bitmap, p0, 2, 2);


  const pipeTopLeft = await getTile(bitmap, p0, 7, 0);
  const pipeLeft = await getTile(bitmap, p0, 7, 1);
  const pipeTopRight = await getTile(bitmap, p0, 8, 0);
  const pipeRight = await getTile(bitmap, p0, 8, 1);


  const treeTop = await getTile(bitmap, p0, 6, 0);
  const treeBottom = await getTile(bitmap, p0, 6, 1);


  // const brick = await createImageBitmap(bitmap, p1.x + SIZE+1, p1.y, SIZE, SIZE);

  context.drawImage(floor, 0, 0);
  context.drawImage(brick, SIZE, 0);
  context.drawImage(qm, 2*SIZE, 0);
  context.drawImage(coin, 3*SIZE, 0);
  context.drawImage(topLeft, 4*SIZE, 0);
  context.drawImage(topMiddle, 5*SIZE, 0);
  context.drawImage(topRight, 6*SIZE, 0);
  context.drawImage(pipeTopLeft, 7*SIZE, 0);
  context.drawImage(pipeTopRight, 8*SIZE, 0);
  context.drawImage(pipeLeft, 7*SIZE, SIZE);
  context.drawImage(pipeRight, 8*SIZE, SIZE);

  context.drawImage(bushLeft, 9*SIZE, 0);
  context.drawImage(bushMiddle, 10*SIZE, 0);
  context.drawImage(bushRight, 11*SIZE, 0);

  context.drawImage(hillLeft, SIZE*1, SIZE*4);
  context.drawImage(hillInnerLeft, SIZE*2, SIZE*4);
  context.drawImage(hillMiddle, SIZE*3, SIZE*4);
  context.drawImage(hillInnerRight, SIZE*4, SIZE*4);
  context.drawImage(hillRight, SIZE*5, SIZE*4);

  context.drawImage(hillLeft, SIZE*2, SIZE*3);
  context.drawImage(hillMiddle, SIZE*3, SIZE*3);
  context.drawImage(hillRight, SIZE*4, SIZE*3);

  context.drawImage(hillTop, SIZE*3, SIZE*2);

  context.drawImage(treeTop, SIZE*6, SIZE*2);
  context.drawImage(treeBottom, SIZE*6, SIZE*3);
  context.drawImage(stump, SIZE*6, SIZE*4);

  context.drawImage(cloudTopLeft, SIZE*8, SIZE*3);
  context.drawImage(cloudTopMiddle, SIZE*9, SIZE*3);
  context.drawImage(cloudTopRight, SIZE*10, SIZE*3);
  context.drawImage(cloudBottomLeft, SIZE*8, SIZE*4);
  context.drawImage(cloudBottomMiddle, SIZE*9, SIZE*4);
  context.drawImage(cloudBottomRight, SIZE*10, SIZE*4);

  context.drawImage(waves, SIZE*12, SIZE*3);
  context.drawImage(water, SIZE*12, SIZE*4);



}

async function getTile(bitmap: ImageBitmap, p: Palette,row: number, col: number) {
  return await createImageBitmap(bitmap, p.x + row * (SIZE+1) , p.y + col * (SIZE+1), SIZE, SIZE);
}
