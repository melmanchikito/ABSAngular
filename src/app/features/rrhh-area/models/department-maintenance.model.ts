export interface DepartmentItem {
  id: number;
  code: string;
  name: string;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DepartmentListResponse {
  list: DepartmentItem[];
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

export interface InsertDepartmentRequest {
  code: string;
  name: string;
  created_by: string;
}

export interface UpdateDepartmentRequest {
  department_id: number;
  name: string;
  updated_by: string;
}

export interface CancelDepartmentRequest {
  department_id: number;
  canceled_by: string;
}
