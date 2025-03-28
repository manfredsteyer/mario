import { HttpResourceRef } from "@angular/common/http";
import { Style } from "../engine/palettes";
import { extractTiles } from "../engine/tiles";
import { computed, resource } from "@angular/core";

export async function createTiles(tilesMap: Blob, style: Style) {
  if (!tilesMap) {
    return undefined;
  }
  return await extractTiles(tilesMap, style);
}

export function createTilesResource(
  tilesMapResource: HttpResourceRef<Blob | undefined>,
  style: () => Style
) {

  const request = computed(() => !tilesMapResource.hasValue() ? undefined : {
    tilesMap: tilesMapResource.value(),
    style: style()
  });

  return resource({
    request,
    loader(params) {
      const { tilesMap, style } = params.request!;
      return extractTiles(tilesMap, style);
    }
  })

  // TODO
  
}