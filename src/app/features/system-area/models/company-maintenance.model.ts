export interface Company {
  id: number;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
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

export interface CompanyListResponse {
  list: Company[];
}

export interface InsertCompanyRequest {
  code: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  created_by: string;
}

export interface UpdateCompanyRequest {
  company_id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  updated_by: string;
}

export interface CancelCompanyRequest {
  company_id: number;
  canceled_by: string;
}
