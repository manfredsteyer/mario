import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TilesMapLoader } from '../data/tiles-map.loader';
import { LevelLoader } from '../data/level.loader';
import { HttpProgressEvent } from '@angular/common/http';

//
//  In this example, we treat the game "engine" as a black box
//
import { runHeroDemo } from '../engine/hero-demo';
import { playLevel, renderLevel, stopGame } from '../engine/level';
import { Style } from '../engine/palettes';
import { config } from '../config';
import { HeroMapLoader } from '../data/hero-map-loader';
import { EnemiesMapLoader } from '../data/enemies-map-loader';
import { BlurOnChangeDirective } from '../shared/blur-on-change.directive';
import { createTilesResource } from '../data/tile-resources';
import { createHeroResource } from '../data/hero-resource';
import { createEnemiesResource } from '../data/enemies-resource';

@Component({
  selector: 'app-level',
  imports: [FormsModule, BlurOnChangeDirective],
  templateUrl: './level.component.html',
})
export class LevelComponent implements OnDestroy {
  private tilesMapLoader = inject(TilesMapLoader);
  private levelLoader = inject(LevelLoader);
  private heroMapLoader = inject(HeroMapLoader);
  private enemiesMapLoader = inject(EnemiesMapLoader);

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  levelKey = signal('01');

  style = signal<Style>('overworld');
  play = signal(false);

  tilesMapResource = this.tilesMapLoader.getTilesMapResource();
  tilesResource = createTilesResource(this.tilesMapResource, this.style);

  heroMapResource = this.heroMapLoader.getHeroMapResource();
  heroResource = createHeroResource(this.heroMapResource);

  enemiesMapResource = this.enemiesMapLoader.getEnemiesMapResource();
  enemiesResource = createEnemiesResource(this.enemiesMapResource);

  levelOverviewResource = this.levelLoader.getLevelOverviewResource();
  levelResource = this.levelLoader.getLevelResource(this.levelKey);

  constructor() {
    effect(() => {
      this.initCanvas();
    });

    // this.runMiniDemo();

    effect(() => {
      this.render();
    });
  }

  private runMiniDemo() {
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;
      runHeroDemo(canvas);
    });
  }

  ngOnDestroy(): void {
    stopGame();
  }

  togglePlay() {
    this.play.update((animation) => !animation);
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
    const play = this.play();
    const heroTiles = this.heroResource.value();
    const gumbaTiles = this.enemiesResource.value();

    if (!tiles || !heroTiles || !gumbaTiles || !canvas) {
      return;
    }

    if (play) {
      playLevel({
        canvas,
        level,
        tiles,
        heroTiles,
        gumbaTiles,
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

/*
    effect(() => {
      console.log('status', this.levelOverviewResource.status());
      console.log('statusCode', this.levelOverviewResource.statusCode());
      console.log('headers', this.levelOverviewResource.headers()?.keys());
    });
*/
