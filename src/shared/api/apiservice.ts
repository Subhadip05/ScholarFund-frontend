import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, StudentProfileDto, StudentProfileResponse } from '../types';
import { Observable } from 'rxjs';

export const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class Apiservice {
  client = inject(HttpClient);

  getURL(url: string) {
    return this.client.get(url);
  }

  getStudentProfile() {
    return this.client.get<ApiResponse<StudentProfileResponse>>(
      `${baseUrl}/student/profile`
    );
  }

  saveStudentProfile(payload: StudentProfileDto): Observable<ApiResponse<StudentProfileResponse>> {
    return this.client.post<ApiResponse<StudentProfileResponse>>(
      `${baseUrl}/student/profile`, 
      payload
    );
  }

  uploadDocument(file: File, folder: string): Observable<ApiResponse<{ documentId: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.client.post<ApiResponse<{ documentId: number }>>(
      `${baseUrl}/documents/upload`,
      formData
    );
  }
}
