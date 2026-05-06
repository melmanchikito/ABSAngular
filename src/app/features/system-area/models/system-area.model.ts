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

export type SystemAreaSubmoduleKey =
  | 'desarrollo'
  | 'generales'
  | 'correccion-datos'
  | 'help-desk'
  | 'seguridad';

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

export interface SystemAreaSubmodule {
  key: SystemAreaSubmoduleKey;
  label: string;
  description: string;
  icon: LucideIconData;
  categories: SystemAreaCategory[];
}

export interface SystemAreaConfig {
  key: SystemAreaKey;
  title: string;
  subtitle: string;
  icon: LucideIconData;
  categories: SystemAreaCategory[];
  defaultSubmoduleKey?: SystemAreaSubmoduleKey;
  submodules?: SystemAreaSubmodule[];
}
