export interface ModuleItem {
  id: number;
  code: string;
  name: string;
  order: number;
  area_id?: number | string | null;
  area?: {
    id?: number | string | null;
    code?: string | null;
    name?: string | null;
  } | null;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ModuleListResponse {
  list: ModuleItem[];
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

export interface InsertModuleRequest {
  code: string;
  name: string;
  order: number;
  area_id: number;
  created_by: string;
}

export interface UpdateModuleRequest {
  module_id: number;
  code: string;
  name: string;
  order: number;
  area_id: number;
  updated_by: string;
}

export interface CancelModuleRequest {
  module_id: number;
  canceled_by: string;
}
