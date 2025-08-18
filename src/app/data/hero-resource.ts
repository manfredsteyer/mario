import { HttpResourceRef } from "@angular/common/http";
import { computed, resource } from "@angular/core";
import { extractHeroTiles } from "../engine/hero";

export function createHeroResource(
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
