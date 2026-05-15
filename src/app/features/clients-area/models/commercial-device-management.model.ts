export type CommercialDeviceAssignmentStatus = 'active' | 'inactive';

export interface CommercialDeviceOption {
  id: number;
  code: string;
  name: string;
  serial?: string;
}

export interface CommercialSellerOption {
  id: number;
  code: string;
  name: string;
}

export interface CommercialDeviceAssignment {
  id: number;
  seller_id: number;
  seller_code: string;
  seller_name: string;
  device_id: number;
  device_code: string;
  device_name: string;
  device_serial?: string;
  status: CommercialDeviceAssignmentStatus;
  assigned_at: string;
  updated_at?: string | null;
  canceled_at?: string | null;
}

export interface SaveCommercialDeviceAssignmentRequest {
  seller_id: number;
  device_id: number;
  updated_by: string;
}
