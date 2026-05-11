export interface HelpdeskItem {
  id: number;
  name: string;
  user_id: number;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HelpdeskListResponse {
  list: HelpdeskItem[];
}

export interface InsertHelpdeskRequest {
  name: string;
  user_id: number;
  created_by: string;
}

export interface UpdateHelpdeskRequest {
  helpdesk_id: number;
  name: string;
  user_id: number;
  updated_by: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  error_code?: string;
}
