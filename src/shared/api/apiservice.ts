import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  ApiResponse,
  ApplicationResponse,
  ApplicationStatus,
  ApplicationStatusUpdateRequest,
  ApplicationSubmitRequest,
  DocumentUploadResponse,
  InstituteProfileDto,
  InstituteProfileResponse,
  PresignedUploadData,
  StudentProfileDto,
  StudentProfileResponse,
} from '../types';
import { Observable, switchMap } from 'rxjs';

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

  // uploadDocument(file: File, folder: string): Observable<ApiResponse<DocumentUploadResponse>> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('folder', folder);

  //   return this.client.post<ApiResponse<DocumentUploadResponse>>(
  //     `${baseUrl}/documents/upload`,
  //     formData,
  //   );
  // }

  uploadDocument(file: File, folder: string): Observable<ApiResponse<DocumentUploadResponse>> {
    const fileType = file.type || 'application/octet-stream';

    // Fetch Presigned URL
    return this.client
      .get<ApiResponse<PresignedUploadData>>(`${baseUrl}/documents/presigned-upload-url`, {
        params: {
          fileName: file.name,
          folder: folder,
        },
      })
      .pipe(
        switchMap((presignedRes) => {
          const { uploadUrl, s3Key } = presignedRes.data;

          // Direct PUT of the raw file binary to AWS S3
          return this.client
            .put(uploadUrl, file, {
              headers: new HttpHeaders({
                'Content-Type': fileType,
              }),
            })
            .pipe(
              switchMap(() => {
                // Confirm metadata with key save with in db
                return this.client.post<ApiResponse<DocumentUploadResponse>>(
                  `${baseUrl}/documents/confirm-upload`,
                  {
                    fileName: file.name,
                    s3Key: s3Key,
                    contentType: fileType,
                    fileSize: file.size,
                  },
                );
              }),
            );
        }),
      );
  }

  getVerifiedInstitutes() {
    return this.client.get<ApiResponse<InstituteProfileResponse[]>>(
      `${baseUrl}/institute/verified-list`,
    );
  }

  submitApplication(
    payload: ApplicationSubmitRequest,
  ): Observable<ApiResponse<ApplicationResponse>> {
    return this.client.post<ApiResponse<ApplicationResponse>>(
      `${baseUrl}/applications/submit`,
      payload,
    );
  }

  getInstituteProfile() {
    return this.client.get<ApiResponse<InstituteProfileResponse>>(
      `${baseUrl}/institute/get-profile`,
    );
  }

  saveInstituteProfile(
    payload: InstituteProfileDto,
  ): Observable<ApiResponse<InstituteProfileResponse>> {
    return this.client.post<ApiResponse<InstituteProfileResponse>>(
      `${baseUrl}/institute/save-profile`,
      payload,
    );
  }

  getApplicationsByInstituteId(
    instituteProfileId: number,
  ): Observable<ApiResponse<ApplicationResponse[]>> {
    return this.client.get<ApiResponse<ApplicationResponse[]>>(
      `${baseUrl}/applications/institute/${instituteProfileId}`,
    );
  }

  getApplicationsByStudentId(
    studentProfileId: number,
  ): Observable<ApiResponse<ApplicationResponse[]>> {
    return this.client.get<ApiResponse<ApplicationResponse[]>>(
      `${baseUrl}/applications/student/${studentProfileId}`,
    );
  }

  updateApplicationStatus(
    applicationId: number,
    request: ApplicationStatusUpdateRequest,
  ): Observable<ApiResponse<ApplicationResponse>> {
    return this.client.put<ApiResponse<ApplicationResponse>>(
      `${baseUrl}/applications/${applicationId}/update-status`,
      request,
    );
  }

  getApplicationsList(status?: ApplicationStatus): Observable<ApiResponse<ApplicationResponse[]>> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.client.get<ApiResponse<ApplicationResponse[]>>(`${baseUrl}/applications`, {
      params,
    });
  }

  getAllInstitutes(): Observable<ApiResponse<InstituteProfileResponse[]>> {
    return this.client.get<ApiResponse<InstituteProfileResponse[]>>(
      `${baseUrl}/admin/institutes-list`,
    );
  }

  verifyInstitute(instituteId: number): Observable<ApiResponse<string | null>> {
    return this.client.put<ApiResponse<string | null>>(
      `${baseUrl}/admin/verify-institute/${instituteId}`,
      {},
    );
  }

  downloadApplicationPdf(applicationId: number): Observable<Blob> {
    return this.client.get(`${baseUrl}/applications/${applicationId}/download-pdf`, {
      responseType: 'blob',
    });
  }
}
