import { HttpResourceRef } from "@angular/common/http";
import { computed, resource } from "@angular/core";
import { Style } from "../engine/palettes";
import { extractTiles } from "../engine/tiles";

export function createTilesResource(
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
