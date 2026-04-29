import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  LoginResponse,
  LogoutResponse,
  NewPasswordResponse,
  OtpResponse,
  ValidateEmailResponse
} from '../../../core/models/auth.model';
import { UserPermissions } from '../../../core/models/permissions.model';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { NavigationService } from '../../../core/services/navigation.service';

interface PermissionsApiResponse {
  user_id?: number;
  priority_permissions?: string[];
  permissions?: string[];
}

export interface LoginFlowResult {
  success: boolean;
  route?: 'main' | 'two-factor' | 'new-password';
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService,
    private readonly navigationService: NavigationService
  ) {}

  async handleLogin(email: string, password: string): Promise<LoginFlowResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>(
        `${this.apiUrl}/login`,
        { email, password }
      ).pipe(
        catchError((error) =>
          of({
            code: error.status ?? 0,
            error_code: 'FETCH_ERROR',
            message: error.error?.message ?? 'Error desconocido al iniciar sesión'
          })
        )
      )
    );

    if ('error_code' in response) {
      return {
        success: false,
        error: response.message || 'No se pudo iniciar sesión'
      };
    }

    const data = response.data;

    if (!data) {
      return {
        success: false,
        error: 'La respuesta del servidor no contiene datos'
      };
    }

    const userIdStr = String(data.user_id ?? 0);

    if (data.key_change) {
      this.authService.setEmail(email);
      this.authService.setFirstPassword('true');
      this.authService.setUserId(userIdStr);

      return {
        success: true,
        route: 'new-password',
        message: 'Se requiere cambio de contraseña'
      };
    }

    if (data.twofa) {
      this.authService.setIsLogin('true');
      this.authService.setName(data.name || 'Usuario');
      this.authService.setUserId(userIdStr);
      this.authService.setEmail(email);

      return {
        success: true,
        route: 'two-factor',
        message: 'Validación OTP requerida'
      };
    }

    const loginToken = this.extractToken(data);
    const loginUserId = data.user_id || 0;
    const loginName = data.name || 'Usuario';

    this.authService.login({
      token: loginToken,
      userId: loginUserId,
      nameUsuario: loginName,
      email
    });

    this.saveAuthData(loginToken, loginUserId, loginName, email);

    const permissionsResponse = await this.handlePermissions(loginUserId);

    if (!permissionsResponse.success) {
      return {
        success: false,
        error: permissionsResponse.error
      };
    }

    return {
      success: true,
      route: 'main'
    };
  }

  async handlePermissions(userId: number): Promise<{ success: boolean; error?: string }> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<PermissionsApiResponse>>(
        `${this.apiUrl}/user-permissions_module`,
        { params: { user_id: userId } }
      ).pipe(
        catchError((error) =>
          of({
            code: error.status ?? 0,
            error_code: 'FETCH_ERROR',
            message: error.error?.message ?? 'Error al consultar permisos'
          })
        )
      )
    );

    if ('error_code' in response) {
      return {
        success: false,
        error: response.message || 'No se pudieron cargar los permisos'
      };
    }

    const data = response.data;

    if (!data) {
      return {
        success: false,
        error: 'No se recibió información de permisos'
      };
    }

    const permissions: UserPermissions = {
      id: data.user_id,
      priorityPermissions: data.priority_permissions,
      permissions: data.permissions
    };

    this.permissionsService.setPermissions(permissions);

    return { success: true };
  }

  async handleLogout(): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<LogoutResponse>>(
        `${this.apiUrl}/logout`,
        {}
      ).pipe(
        catchError(() => of(null))
      )
    );

    this.authService.setIsLogin('false');
    this.authService.logout();

    this.clearAuthData();

    await this.navigationService.goToLogin();
  }

  async handleRecover(
    email: string
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    route?: 'two-factor' | 'new-password';
  }> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<ValidateEmailResponse>>(
        `${this.apiUrl}/validate-email`,
        { email }
      ).pipe(
        catchError((error) =>
          of({
            code: error.status ?? 0,
            error_code: 'FETCH_ERROR',
            message: error.error?.message ?? 'Error al validar el correo'
          })
        )
      )
    );

    if ('error_code' in response) {
      return {
        success: false,
        error: response.message || 'No se pudo validar el correo'
      };
    }

    const requires2FA = response.data?.twofa ?? false;
    const userId = response.data?.user_id ?? 0;
    const isSeller = response.data?.is_seller ?? false;

    if (requires2FA && !isSeller) {
      this.authService.setEmail(email);
      this.authService.setUserId(String(userId));

      return {
        success: true,
        route: 'two-factor'
      };
    }

    if (isSeller) {
      return {
        success: true,
        route: 'new-password'
      };
    }

    return {
      success: true,
      message: 'Contacta a Desarrollo para activar 2FA.'
    };
  }

  async handleNewPassword(
    password: string,
    passwordConfirmation: string,
    userId?: number,
    isFirstChange?: boolean
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (password !== passwordConfirmation) {
      return {
        success: false,
        error: 'Las contraseñas no coinciden'
      };
    }

    const url = isFirstChange
      ? `${this.apiUrl}/new-password-first`
      : `${this.apiUrl}/new-password`;

    const body = isFirstChange
      ? { user_id: userId, password, password_confirmation: passwordConfirmation }
      : { password, password_confirmation: passwordConfirmation };

    const response = await firstValueFrom(
      this.http.post<ApiResponse<NewPasswordResponse>>(url, body).pipe(
        catchError((error) =>
          of({
            code: error.status ?? 0,
            error_code: 'FETCH_ERROR',
            message: error.error?.message ?? 'Error al cambiar la contraseña'
          })
        )
      )
    );

    if ('error_code' in response) {
      return {
        success: false,
        error: response.message || 'No se pudo cambiar la contraseña'
      };
    }

    return {
      success: true,
      message: response.message || 'Contraseña actualizada correctamente'
    };
  }

  async handleOtp(
    otpCode: string,
    email: string,
    userId: number
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    route?: 'main' | 'login';
  }> {
    const isLogin = this.authService.getIsLogin() === 'true';
    const url = isLogin
      ? `${this.apiUrl}/validate-login-2fa`
      : `${this.apiUrl}/validate-2fa`;

    const body = isLogin
      ? { otp: otpCode, user_id: userId }
      : { otp: otpCode, email };

    const response = await firstValueFrom(
      this.http.post<ApiResponse<OtpResponse>>(url, body).pipe(
        catchError((error) =>
          of({
            code: error.status ?? 0,
            error_code: 'FETCH_ERROR',
            message: error.error?.message ?? 'Error al validar OTP'
          })
        )
      )
    );

    if ('error_code' in response) {
      return {
        success: false,
        error: response.message || 'No se pudo validar el código OTP'
      };
    }

    if (isLogin) {
      const token = this.extractToken(response.data);
      const storedUserId = Number(this.authService.getUserId() || 0);
      const nameUsuario = this.authService.getName() || 'Usuario';

      this.authService.login({
        token,
        userId: storedUserId,
        nameUsuario,
        email
      });

      this.saveAuthData(token, storedUserId, nameUsuario, email);

      const permissionsResponse = await this.handlePermissions(storedUserId);

      if (!permissionsResponse.success) {
        return {
          success: false,
          error: permissionsResponse.error
        };
      }

      return {
        success: true,
        message: 'Validación de login realizada con éxito.',
        route: 'main'
      };
    }

    return {
      success: true,
      message: 'Validación correcta. Continúa con la recuperación.',
      route: 'login'
    };
  }

  private extractToken(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const objectData = data as Record<string, unknown>;

    const token =
      objectData['token'] ||
      objectData['access_token'] ||
      objectData['accessToken'] ||
      objectData['jwt'] ||
      objectData['jwt_token'] ||
      objectData['authorization'];

    if (typeof token === 'string') {
      return token.replace('Bearer ', '').replaceAll('"', '').trim();
    }

    const auth = objectData['auth'];
    if (auth && typeof auth === 'object') {
      const authData = auth as Record<string, unknown>;
      const authToken = authData['token'];

      if (typeof authToken === 'string') {
        return authToken.replace('Bearer ', '').replaceAll('"', '').trim();
      }
    }

    const nestedData = objectData['data'];
    if (nestedData && typeof nestedData === 'object') {
      return this.extractToken(nestedData);
    }

    return '';
  }

  private saveAuthData(token: string, userId: number, name: string, email: string): void {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn('Login exitoso, pero la API no devolvió token.');
    }

    localStorage.setItem('user_id', String(userId));
    localStorage.setItem('username', name || 'Usuario');
    localStorage.setItem('email', email);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('profileImageUrl');
  }
}