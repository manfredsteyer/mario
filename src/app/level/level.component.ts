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
import { FormsModule } from '@angular/forms';
import { TilesMapLoader } from '../data/tiles-map.loader';
import { LevelLoader } from '../data/level.loader';
import { HttpProgressEvent, HttpResourceRef } from '@angular/common/http';

//
//  In this example, we treat the game "engine" as a black box
//
import { Style } from '../engine/palettes';
import { extractTiles } from '../engine/tiles';
import { animateLevel, renderLevel, stopAnimation } from '../engine/level';

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

  levelKey = signal<string | undefined>('01');
  style = signal<Style>('overworld');
  animation = signal(false);

  tilesMapResource = this.tilesMapLoader.getTilesMapResource();
  levelResource = this.levelLoader.getLevelResource(this.levelKey);
  levelOverviewResource = this.levelLoader.getLevelOverviewResource();

  tilesResource = createTilesResource(this.tilesMapResource, this.style);

  tilesMapProgress = computed(() =>
    calcProgress(this.tilesMapResource.progress()),
  );

  constructor() {
    effect(() => {
      this.initCanvas();
    });

    effect(() => {
      this.render();
    });
  }

  ngOnDestroy(): void {
    stopAnimation();
  }

  toggleAnimation() {
    this.animation.update((animation) => !animation);
  }

  reload() {
    this.tilesMapResource.reload();
    this.levelResource.reload();
  }

  private initCanvas() {
    const canvas = this.canvas();
    if (canvas) {
      const context = getContext(canvas);
      context.scale(3, 3);
    }
  }

  private render() {
    const tiles = this.tilesResource.value();
    const level = this.levelResource.value();
    const canvas = this.canvas();
    const animation = this.animation();

    if (!tiles || !canvas) {
      return;
    }

    // If the game is already running, stop it
    stopAnimation();

    if (animation) {
      animateLevel({
        canvas,
        level,
        tiles,
      });
    } else {
      renderLevel({
        canvas,
        level,
        tiles,
      });
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

function toTilesRequest(tilesMap: () => Blob | undefined, style: () => Style) {
  const tilesMapValue = tilesMap();
  if (typeof tilesMapValue === 'undefined') {
    return undefined;
  }
  return {
    tilesMap: tilesMapValue,
    style: style(),
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
) {
  const tilesRequest = computed(() =>
    toTilesRequest(tilesMapResource.value, style),
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

      const { tilesMap, style } = params.request;
      return extractTiles(tilesMap, style);
    },
  });

  return tilesResource;
}

function calcProgress(progress: HttpProgressEvent | undefined): string {
  if (!progress) {
    return '-';
  }

  if (progress.total) {
    const percent = Math.round((progress.loaded / progress.total) * 100);
    return percent + '%';
  }

  const kb = Math.round(progress.loaded / 1024);
  return kb + ' KB';
}
