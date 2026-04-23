export interface Employee {
  id: number;
  code: string;
  name: string;
  company_id: number;
  branch_id: number;
  department_id: number;
}

export interface Company {
  id: number;
  code: string;
  name: string;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  company_id: number;
  location_id: number;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface ComponentItem {
  id: number;
  code: string;
  name: string;
  type?: string;
  state?: string;
  serial_number?: string;
  capacity?: string;
  volts?: string;
  amps?: string;
  watts?: string;
  reusable?: boolean;
  assignment_at?: string;
  warranty_expire_at?: string;
  supplier_id?: number;
  brand_id?: number;
  device_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  id: number;
  code: string;
  name: string;
  model?: string;
  description?: string;
  type?: string;
  state?: string;
  serial_number?: string;
  ip_address?: string;
  mac?: string;
  last_ip_assignment_at?: string;
  allow_take_home?: boolean;
  assignment_at?: string;
  last_maintenance_at?: string;
  warranty_expire_at?: string;
  supplier_id?: number;
  company_id?: number;
  brand_id?: number;
  equipment_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
  components?: ComponentItem[];
}

export interface EquipmentWithDevices {
  id: number;
  code: string;
  name: string;
  description?: string;
  assignment_at?: string;
  responsible_id?: number;
  helpdesk_id?: number;
  canceled?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
  devices?: Device[];
}

export interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Problem {
  id: number;
  code: string;
  name: string;
  description: string;
  category_id: number;
}

export interface TicketDt {
  problem_id?: number;
  issue_description?: string;
  solution_description?: string;
  observation?: string;
  device_id?: number;
  component_id?: number;
  is_remote?: boolean;
}

export interface HelpdeskFormData {
  employeeId?: number;
  ownerId?: number;
  companyId?: number;
  branchId?: number;
  departmentId?: number;
  isOwner: boolean;
  dateInit: string;
  dateEnd: string;
  priority?: string;
  selectedDevice?: Partial<Device>;
  selectedCategory?: Partial<Category>;
  selectedProblem?: Partial<Problem>;
  selectedTicketDt?: Partial<TicketDt>;
  charCount: {
    issue_description: number;
    solution_description: number;
    observation: number;
  };
}