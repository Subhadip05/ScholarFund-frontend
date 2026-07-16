import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Authservice } from './authservice';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Authservice);

  // 1. Helper function: Attaches the token if it exists
  const attachToken = (request: HttpRequest<any>, token: string | null) => {
    if (!token) return request;
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  };

  // 2. Send the original request with the current Access Token
  return next(attachToken(req, authService.getAccessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      // 3. If it's NOT a 401 error (or we don't have a refresh token), just fail normally
      if (error.status !== 401 || !authService.getRefreshToken()) {
        return throwError(() => error);
      }

      // 4. It is a 401 error. Call the refresh API.
      return authService.refreshAccessToken(authService.getRefreshToken()!).pipe(
        // 5. Once the refresh API succeeds, switch back to the original request
        switchMap((response) => {
          const newAuthData = response.data;

          // Save the new tokens
          authService.saveTokens(newAuthData.accessToken, newAuthData.refreshToken);

          // Retry the original request with the NEW Access Token
          return next(attachToken(req, newAuthData.accessToken));
        }),

        // 6. If the refresh API also fails (e.g., refresh token expired), log them out
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
