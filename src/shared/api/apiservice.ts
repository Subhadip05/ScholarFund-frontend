import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ApiResponse,
  ApplicationResponse,
  ApplicationSubmitRequest,
  DocumentUploadResponse,
  InstituteProfileDto,
  InstituteProfileResponse,
  StudentProfileDto,
  StudentProfileResponse,
} from '../types';
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
    return this.client.get<ApiResponse<StudentProfileResponse>>(`${baseUrl}/student/profile`);
  }

  saveStudentProfile(payload: StudentProfileDto): Observable<ApiResponse<StudentProfileResponse>> {
    return this.client.post<ApiResponse<StudentProfileResponse>>(
      `${baseUrl}/student/profile`,
      payload,
    );
  }

  uploadDocument(file: File, folder: string): Observable<ApiResponse<DocumentUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.client.post<ApiResponse<DocumentUploadResponse>>(
      `${baseUrl}/documents/upload`,
      formData,
    );
  }

  getVerifiedInstitutes() {
    return this.client.get<ApiResponse<InstituteProfileResponse[]>>(
      `${baseUrl}/institute/verified-list`,
    );
  }

  submitApplication(payload: ApplicationSubmitRequest): Observable<ApiResponse<ApplicationResponse>> {
    return this.client.post<ApiResponse<ApplicationResponse>>(
      `${baseUrl}/applications/submit`,
      payload,
    );
  }

  getInstituteProfile() {
    return this.client.get<ApiResponse<InstituteProfileResponse>>(`${baseUrl}/institute/get-profile`);
  }

  saveInstituteProfile(payload: InstituteProfileDto): Observable<ApiResponse<InstituteProfileResponse>> {
    return this.client.post<ApiResponse<InstituteProfileResponse>>(
      `${baseUrl}/institute/save-profile`,
      payload,
    );
  }
}
