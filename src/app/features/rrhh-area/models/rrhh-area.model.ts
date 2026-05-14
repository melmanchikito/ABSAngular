import { LucideIconData } from 'lucide-angular';

export type RrhhAreaKey = 'rrhh';
export type RrhhAreaCategoryKey = 'mantenimientos' | 'documentos' | 'procesos' | 'informes';
export type RrhhAreaSubmoduleKey = 'empleado' | 'proveedores' | 'administracion';

export interface RrhhAreaOption {
  label: string;
  description: string;
  icon: LucideIconData;
  route?: string;
}

export interface RrhhAreaCategory {
  key: RrhhAreaCategoryKey;
  label: string;
  description: string;
  icon: LucideIconData;
  options: RrhhAreaOption[];
}

export interface RrhhAreaSubmodule {
  key: RrhhAreaSubmoduleKey;
  label: string;
  description: string;
  icon: LucideIconData;
  categories: RrhhAreaCategory[];
}

export interface RrhhAreaConfig {
  key: RrhhAreaKey;
  title: string;
  subtitle: string;
  icon: LucideIconData;
  defaultSubmoduleKey: RrhhAreaSubmoduleKey;
  submodules: RrhhAreaSubmodule[];
}
