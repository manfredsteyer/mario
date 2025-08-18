import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  linkedSignal,
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
import { extractHeroTiles, extractTiles } from '../engine/tiles';
import { animateLevel, renderLevel, stopAnimation } from '../engine/level';
import { HeroMapLoader } from '../data/hero-map-loader';

@Component({
  selector: 'app-level',
  imports: [FormsModule],
  templateUrl: './level.component.html',
})
export class LevelComponent implements OnDestroy {
  private tilesMapLoader = inject(TilesMapLoader);
  private levelLoader = inject(LevelLoader);
  private heroMapLoader = inject(HeroMapLoader);

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  levelKey = signal('01');  // linkedSignal<string | undefined>(() => this.getFirstLevelKey());

  style = signal<Style>('overworld');
  animation = signal(false);
  
  tilesMapResource = this.tilesMapLoader.getTilesMapResource();
  tilesResource = createTilesResource(this.tilesMapResource, this.style);

  heroMapResource = this.heroMapLoader.getHeroMapResource();
  heroResource = createHeroResource(this.heroMapResource);

  levelResource = this.levelLoader.getLevelResource(this.levelKey);
  levelOverviewResource = this.levelLoader.getLevelOverviewResource();

  tilesMapProgress = computed(() =>
    calcProgress(this.tilesMapResource.progress())
  );

  constructor() {
    effect(() => {
      this.initCanvas();
    });

    effect(() => {
      this.render();
    });

    effect(() => {
      console.log('status', this.levelOverviewResource.status());
      console.log('statusCode', this.levelOverviewResource.statusCode());
      console.log('headers', this.levelOverviewResource.headers()?.keys());
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

  private getFirstLevelKey(): string | undefined {
    return this.levelOverviewResource.value()?.levels?.[0]?.levelKey;
  }

  private initCanvas() {
    const canvas = this.canvas()?.nativeElement;
    if (canvas) {
      const context = getContext(canvas);
      context.scale(3, 3);
    }
  }

  private render() {
    const tiles = this.tilesResource.value();
    const level = this.levelResource.value();
    const canvas = this.canvas()?.nativeElement;
    const animation = this.animation();
    const heroTiles = this.heroResource.value();

    if (!tiles || !heroTiles || !canvas) {
      return;
    }

    if (animation) {
      animateLevel({
        canvas,
        level,
        tiles,
        heroTiles
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

function createTilesResource(
  tilesMapResource: HttpResourceRef<Blob | undefined>,
  style: () => Style
) {

  const params = computed(() => {
    const tilesMap = tilesMapResource.value();
    return !tilesMap
      ? undefined
      : {
          tilesMap,
          style: style(),
        };
  });

  return resource({
    params,
    loader: (loderParams) => {
      const { tilesMap, style } = loderParams.params;
      return extractTiles(tilesMap, style);
    },
  });
}

function createHeroResource(
  heroMapResource: HttpResourceRef<Blob | undefined>,
) {

  const params = computed(() => {
    const heroMap = heroMapResource.value();
    return !heroMap
      ? undefined
      : {
          heroMap,
        };
  });

  return resource({
    params,
    loader: (loderParams) => {
      const { heroMap } = loderParams.params;
      return extractHeroTiles(heroMap);
    },
  });
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
