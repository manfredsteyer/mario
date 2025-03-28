import { HttpResourceRef } from "@angular/common/http";
import { Style } from "../engine/palettes";
import { extractTiles } from "../engine/tiles";

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

  // TODO
  
}