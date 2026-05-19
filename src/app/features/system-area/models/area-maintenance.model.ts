export interface AreaItem {
  id: number;
  code: string;
  name: string;
  order: number;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AreaListResponse {
  list: AreaItem[];
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

export interface InsertAreaRequest {
  code: string;
  name: string;
  order: number;
  created_by: string;
}

export interface UpdateAreaRequest {
  area_id: number;
  name: string;
  order: number;
  updated_by: string;
}

export interface CancelAreaRequest {
  area_id: number;
  canceled_by: string;
}
