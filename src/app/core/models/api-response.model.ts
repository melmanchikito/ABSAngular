export interface ApiResponseSuccess<T> {
  code: number;
  message: string;
  data?: T;
}

export interface ApiResponseError {
  code: number;
  error_code: string;
  message: string;
  details_error?: {
    error_message?: string;
    error_detail?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;