import { LucideIconData } from 'lucide-angular';

export type SystemAreaKey =
  | 'sistema'
  | 'gerencial'
  | 'operativa'
  | 'administrativa'
  | 'financiera';

export type SystemAreaCategoryKey =
  | 'mantenimientos'
  | 'documentos'
  | 'procesos'
  | 'informes';

export interface SystemAreaOption {
  label: string;
  description: string;
  icon: LucideIconData;
  route?: string;
}

export interface SystemAreaCategory {
  key: SystemAreaCategoryKey;
  label: string;
  description: string;
  icon: LucideIconData;
  options: SystemAreaOption[];
}

export interface SystemAreaConfig {
  key: SystemAreaKey;
  title: string;
  subtitle: string;
  icon: LucideIconData;
  categories: SystemAreaCategory[];
}
