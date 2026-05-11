export type ProductSaleStatus =
  | 'activo venta'
  | 'inactivo venta'
  | 'descontinuado venta'
  | string;

export interface ProductItem {
  id: number;
  code: string;
  name: string;
  short_name: string;
  description: string;
  cost_price: number;
  price_mayor: number;
  price_public: number;
  oem: string;
  currency: string;
  status: ProductSaleStatus;
  canceled: boolean;
  canceled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductListResponse {
  list: ProductItem[];
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

export interface InsertProductRequest {
  code: string;
  name: string;
  short_name: string;
  description: string;
  cost_price: number;
  price_mayor: number;
  price_public: number;
  oem: string;
  currency: string;
  status: ProductSaleStatus;
  created_by: string;
}

export interface UpdateProductRequest {
  product_id: number;
  code: string;
  name: string;
  short_name: string;
  description: string;
  cost_price: number;
  price_mayor: number;
  price_public: number;
  oem: string;
  currency: string;
  status: ProductSaleStatus;
  updated_by: string;
}

export interface CancelProductRequest {
  product_id: number;
  canceled_by: string;
}
