export interface LocationItem {
  id: number;
  code: string;
  name: string;
  address: string;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

export interface LocationListResponse {
  list: LocationItem[];
}

export interface InsertLocationRequest {
  code: string;
  name: string;
  address: string;
  created_by: string;
}

export interface UpdateLocationRequest {
  location_id: number;
  name: string;
  address: string;
  updated_by: string;
}

export interface CancelLocationRequest {
  location_id: number;
  canceled_by: string;
}
