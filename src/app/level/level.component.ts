import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { TilesMapLoader } from '../data/tiles-map.loader';
import { Style } from '../rendering/palettes';
import { extractTiles } from '../rendering/tiles';
import { LevelLoader } from '../data/level.loader';
import { HttpProgressEvent, HttpResourceRef } from '@angular/common/http';
import { animateLevel, render as renderLevel } from '../rendering/level';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-level',
  imports: [FormsModule],
  templateUrl: './level.component.html',
})
export class LevelComponent implements OnDestroy {
  private tilesMapLoader = inject(TilesMapLoader);
  private levelLoader = inject(LevelLoader);

  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  canvas = computed(() => this.canvasRef()?.nativeElement);

  levelKey = signal<string | undefined>('02');
  style = signal<Style>('overworld');

  tilesMapResource = this.tilesMapLoader.getTilesMapResource();
  levelResource = this.levelLoader.getLevelResource(this.levelKey);

  levelBackground = computed(() => this.levelResource.value().backgroundColor);

  tilesResource = createTilesResource(
    this.tilesMapResource,
    this.style,
    this.levelBackground
  );

  tilesMapProgress = computed(() =>
    calcProgress(this.tilesMapResource.progress())
  );

  levelProgress = computed(() =>
    calcProgress(this.levelResource.progress())
  );

  animationAbortController?: AbortController;

  constructor() {
    effect(() => {
      this.initCanvas();
    });

    effect(() => {
      this.render();
    });
  }

  ngOnDestroy(): void {
    this.animationAbortController?.abort();
  }

  private initCanvas() {
    const canvas = this.canvas();
    if (canvas) {
      const context = getContext(canvas);
      context.scale(3, 3);
    }
  }

  animate() {
    const tiles = this.tilesResource.value();
    const level = this.levelResource.value();
    const canvas = this.canvas();

    if (!tiles || !canvas) {
      return;
    }

    this.animationAbortController?.abort();
    this.animationAbortController = new AbortController();

    animateLevel({
      canvas,
      level,
      tiles,
      abortSignal: this.animationAbortController.signal,
    });
  }

  render() {
    const tiles = this.tilesResource.value();
    const level = this.levelResource.value();
    const canvas = this.canvas();

    if (!tiles || !canvas) {
      return;
    }

    this.animationAbortController?.abort();

    renderLevel({
      canvas,
      level,
      tiles,
    });
  }

  reload() {
    this.tilesMapResource.reload();
    this.levelResource.reload();
  }
}

function getContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2d context expected');
  }
  return context;
}

function toTilesRequest(
  tilesMap: () => Blob | undefined,
  style: () => Style,
  bgColor: () => string
) {
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
function createTilesResource(
  tilesMapResource: HttpResourceRef<Blob | undefined>,
  style: () => Style,
  bgColor: () => string
) {
  const tilesRequest = computed(() =>
    toTilesRequest(tilesMapResource.value, style, bgColor)
  );

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
      return extractTiles(tilesMap, style, bgColor);
    },
  });

  return tilesResource;
}

function calcProgress(progress: HttpProgressEvent | undefined): string {
  if (!progress) {
    return '-';
  }

  if (progress.total) {
    const percent = Math.round(progress.loaded / progress.total * 100);
    return percent + '%';
  }

  const kb = Math.round(progress.loaded / 1024);
  return kb + ' KB';
}