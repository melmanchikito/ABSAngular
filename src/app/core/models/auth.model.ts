export interface AuthUser {
  token: string;
  userId: number;
  nameUsuario: string;
  email: string;
}

export interface LoginResponse {
  user_id: number;
  name: string;
  email: string;
  token: string;
  key_change: boolean;
  expires_at: string;
  twofa: boolean;
}

export interface LogoutResponse {
  success: boolean;
}

export interface NewPasswordResponse {
  code: number;
  message: string;
  data?: Record<string, unknown>;
}

export interface OtpResponse {
  token?: string;
  UserId?: number;
  nameUsuario?: string;
}

export interface ValidateEmailResponse {
  user_id?: number;
  twofa?: boolean;
  is_seller?: boolean;
}