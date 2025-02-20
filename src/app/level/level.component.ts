import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { TilesMapLoader } from './tiles-map.loader';
import { Style } from '../rendering/palettes';
import { extractTiles } from '../rendering/tiles';
import { LevelLoader } from './level.loader';
import { HttpResourceRef } from '@angular/common/http';
import { render as renderLevel } from '../rendering/level';

@Component({
  selector: 'app-level',
  imports: [],
  templateUrl: './level.component.html',
})
export class LevelComponent {
  private tilesMapLoader = inject(TilesMapLoader);
  private levelLoader = inject(LevelLoader);

  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  canvas = computed(() => this.canvasRef()?.nativeElement);

  levelKey = signal<string | undefined>('02');
  style = signal<Style>('overworld');

  tilesMapResource = this.tilesMapLoader.getTilesMapResource();
  levelResource = this.levelLoader.getLevelResource(this.levelKey);
  
  levelBackground = computed(() => this.levelResource.value().backgroundColor);

  tilesResource = createTilesResource(this.tilesMapResource, this.style, this.levelBackground);

  async animate() {
    // const tilesMap = this.tilesMap();
    // const canvas = this.canvas();

    // if (!tilesMap || !canvas) {
    //   return;
    // }

    // const style = this.style();
    // const tiles = await extractTiles(tilesMap, style);
    // const level = this.level();

    // animate({ canvas, level, tiles });
  }

  render() {
    const tiles = this.tilesResource.value();
    const level = this.levelResource.value();
    const canvas = this.canvas();

    if (!tiles || !canvas) {
      return;
    }

    console.log('tiles', tiles);
    renderLevel({
      canvas,
      level,
      tiles
    });
  }

  constructor() {
    effect(() => {
      this.initCanvas();
    });

    effect(() => {
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

function toTilesRequest(tilesMap: () => Blob | undefined, style: () => Style, bgColor: () => string) {
  const tilesMapValue = tilesMap();
  if (typeof tilesMapValue === 'undefined') {
    return undefined;
  }
  return {
    tilesMap: tilesMapValue,
    style: style(),
    bgColor: bgColor(),
  };
}

//
// I have the impression that it is in general a good idea to
// hide the creation of a resource in such a function so that
// we see the high-level data flow more clearly in the component
// Is this observation correct?
//
function createTilesResource(tilesMapResource: HttpResourceRef<Blob | undefined>, style: () => Style, bgColor: () => string) {

  const tilesRequest = computed(() => toTilesRequest(tilesMapResource.value, style, bgColor));

  const tilesResource = resource({
    request: tilesRequest,
    loader: (params) => {
      console.log('tiles Resource request', params.request);
      //
      //  Here, TypeScript does not know that the request cannot be
      //  undefined and insists on a check
      //
      if (!params.request) {
        throw new Error('I will never occour!');
      }

      const { tilesMap, style, bgColor } = params.request;
      return extractTiles(tilesMap, style, bgColor)
    }
  });

  return tilesResource;
}
