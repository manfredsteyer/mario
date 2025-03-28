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
import { extractTiles } from '../engine/tiles';
import { animateLevel, renderLevel, stopAnimation } from '../engine/level';
import { createTilesResource } from '../utils/tiles';

@Component({
  selector: 'app-level',
  imports: [FormsModule],
  templateUrl: './level.component.html',
})
export class LevelComponent implements OnDestroy {
  private tilesMapLoader = inject(TilesMapLoader);
  private levelLoader = inject(LevelLoader);

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  levelKey = linkedSignal<string | undefined>(() => this.getFirstLevelKey());
  style = signal<Style>('overworld');
  animation = signal(false);

  tilesMapResource = // TODO
  levelResource = // TODO
  levelOverviewResource = // TODO

  tilesResource = // TODO

  tilesMapProgress = computed(() => null); // TODO 

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
    // TODO: realod tilesMap and level
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

    if (!tiles || !canvas) {
      return;
    }

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
