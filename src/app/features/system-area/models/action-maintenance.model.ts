export interface ActionItem {
  id: number;
  code: string;
  name: string;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ActionListResponse {
  list: ActionItem[];
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

export interface InsertActionRequest {
  code: string;
  name: string;
  created_by: string;
}

export interface UpdateActionRequest {
  action_id: number;
  name: string;
  updated_by: string;
}

export interface CancelActionRequest {
  action_id: number;
  canceled_by: string;
}
