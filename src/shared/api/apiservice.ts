import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class Apiservice {
  client = inject(HttpClient);

  getURL(url: string) {
    return this.client.get(url);
  }
}
