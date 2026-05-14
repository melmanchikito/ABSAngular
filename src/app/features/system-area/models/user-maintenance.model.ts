export type UserState = 'active' | 'inactive' | 'blocked' | 'pending' | string;

export interface UserItem {
  id: number;
  username: string;
  name: string;
  lastname?: string | null;
  email: string;
  code?: string | null;
  role_id?: number | null;
  state?: UserState | boolean | number | null;
  phone?: string | null;
  employee_id?: number | string | null;
  employee_code?: string | null;
  employee_name?: string | null;
  employee?: {
    id?: number | string | null;
    code?: string | null;
    employee_code?: string | null;
    name?: string | null;
  } | null;
  identification?: string | null;
  is_developer?: boolean | number | string | null;
  developer?: boolean | number | string | null;
  canceled?: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserListResponse {
  list: UserItem[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  error_code?: string;
  details_error?: {
    error_message?: string;
    error_detail?: Record<string, string[]>;
  };
}

export interface InsertUserRequest {
  name: string;
  email: string;
  phone: string;
  is_developer: boolean;
  employee_id: number;
  created_by: string;
}

export interface UpdateUserRequest {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  is_developer: boolean;
  employee_id: number;
  updated_by: string;
}

export interface CancelUserRequest {
  user_id: number;
  canceled_by: string;
}
