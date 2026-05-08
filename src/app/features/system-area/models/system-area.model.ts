import { LucideIconData } from 'lucide-angular';

export type SystemAreaKey =
  | 'finanzas'
  | 'rrhh'
  | 'clientes'
  | 'producto'
  | 'analisis'
  | 'sistema';

export type SystemAreaCategoryKey =
  | 'mantenimientos'
  | 'documentos'
  | 'procesos'
  | 'informes';

export type SystemAreaSubmoduleKey =
  | 'contable-sri'
  | 'caja-tesoreria'
  | 'empleado'
  | 'proveedores'
  | 'administracion'
  | 'marketing'
  | 'cobranza'
  | 'codigo-imp'
  | 'legal'
  | 'produccion-distribucion'
  | 'compras-importaciones'
  | 'am-r'
  | 'configuracion'
  | 'help-desk'
  | 'developer';

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
