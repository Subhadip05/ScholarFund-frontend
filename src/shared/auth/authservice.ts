import { inject, Injectable } from '@angular/core';
import { Apiservice } from '../api/apiservice';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  #apiService = inject(Apiservice);
  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);
}
