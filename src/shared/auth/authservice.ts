import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {
  AdminLoginDto,
  ApiResponse,
  AuthResponse,
  RegisterCollegeDto,
  RegisterStudentDto,
  RequestOtpDto,
  VerifyOtpDto,
} from '../types';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  http = inject(HttpClient);
  router = inject(Router);
  private apiUrl = `${environment.baseUrl}/auth`;

  registerStudent(data: RegisterStudentDto) {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/register-student`, data);
  }

  registerCollege(data: RegisterCollegeDto) {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/register-college`, data);
  }

  requestOtp(data: RequestOtpDto) {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/request-otp`, data);
  }

  verifyOtpAndLogin(data: VerifyOtpDto) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-otp`, data);
  }

  adminLogin(data: AdminLoginDto) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/admin-login`, data);
  }

  refreshAccessToken(refreshToken: string) {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {
      refreshToken: refreshToken,
    });
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_metadata');
    this.router.navigate(['/']);
  }
}
