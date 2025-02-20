import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TilesMapLoader {
    getTilesMapResource(): HttpResourceRef<Blob | undefined> {
        return httpResource.blob('/tiles.png');
    }
}
