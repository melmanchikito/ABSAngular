export interface OptionItem {
  id: number;
  code: string;
  name: string;
  order: number;
  module_id: number;
  type_id: number;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OptionTypeItem {
  id: number;
  code?: string | null;
  name: string;
  canceled?: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OptionListResponse {
  list: OptionItem[];
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

export interface InsertOptionRequest {
  code: string;
  name: string;
  order: number;
  module_id: number;
  type_id: number;
  created_by: string;
}

export interface UpdateOptionRequest {
  option_id: number;
  name: string;
  order: number;
  module_id: number;
  type_id: number;
  updated_by: string;
}

export interface CancelOptionRequest {
  option_id: number;
  canceled_by: string;
}
