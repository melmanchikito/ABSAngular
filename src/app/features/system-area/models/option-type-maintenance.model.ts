export interface OptionTypeItem {
  id: number;
  code: string;
  name: string;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OptionTypeListResponse {
  list: OptionTypeItem[];
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

export interface InsertOptionTypeRequest {
  code: string;
  name: string;
  created_by: string;
}

export interface UpdateOptionTypeRequest {
  option_type_id: number;
  name: string;
  updated_by: string;
}

export interface CancelOptionTypeRequest {
  option_type_id: number;
  canceled_by: string;
}
