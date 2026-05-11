export interface BranchItem {
  id: number;
  code: string;
  name: string;
  company_id: number;
  location_id: number;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BranchListResponse {
  list: BranchItem[];
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

export interface InsertBranchRequest {
  code: string;
  name: string;
  company_id: number;
  location_id: number;
  created_by: string;
}

export interface UpdateBranchRequest {
  branch_id: number;
  name: string;
  company_id: number;
  location_id: number;
  updated_by: string;
}

export interface CancelBranchRequest {
  branch_id: number;
  canceled_by: string;
}
