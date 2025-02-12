import { HttpClient } from '@angular/common/http';
import { inject, Injectable, resource } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable({providedIn: 'root'})
export class TilesLoaderService {

    http = inject(HttpClient);

    getTilesResource() {
        return rxResource({
            loader: () => {
                return this.http.get('/tiles.png', {
                    responseType: 'blob',
                });
            }
        })
    }

}