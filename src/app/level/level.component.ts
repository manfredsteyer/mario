import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TilesLoaderService } from './tiles.loader.service';
import { getPalettes, Style } from '../tiles/palettes';
import { extractTiles, loadTiles, TileSet } from '../tiles/tiles';
import { demoLevel } from '../tiles/demo-level';
import { animate, render } from '../tiles/level';

@Component({
  selector: 'app-level',
  imports: [],
  templateUrl: './level.component.html',
})
export class LevelComponent {
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  canvas = computed(() => this.canvasRef()?.nativeElement);

  tilesLoader = inject(TilesLoaderService);

  tilesResource = this.tilesLoader.getTilesResource();
  tilesMap = this.tilesResource.value;

  style = signal<Style>('overworld');
  level = signal(demoLevel);

  async animate() {
    const tilesMap = this.tilesMap();
    const canvas = this.canvas();

    if (!tilesMap || !canvas) {
      return;
    }

    const style = this.style();
    const tiles = await extractTiles(tilesMap, style);
    const level = this.level();

    animate({ canvas, level, tiles });
  }

  async render() {
    const tilesMap = this.tilesMap();
    const canvas = this.canvas();

    if (!tilesMap || !canvas) {
      return;
    }

    const bitmap = await createImageBitmap(tilesMap);

    const palettes = getPalettes('overworld');
    const tiles = await loadTiles(bitmap, palettes);
    const level = demoLevel;
    render({ canvas, level, tiles });
  }

  constructor() {

    effect(() => {
      this.initCanvas();
    });

    effect(() => {
      console.log('tilesMap', this.tilesMap());
      console.log('canvas', this.canvasRef());

      this.render();
    });
  }


  private initCanvas() {
    const canvas = this.canvas();
    if (canvas) {
      const context = getContext(canvas);
      context.scale(3, 3);
    }
  }
}

function getContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2d context expected');
  }
  return context;
}
