import { LucideIconData } from 'lucide-angular';

export type ClientsAreaKey = 'clientes';
export type ClientsAreaCategoryKey = 'mantenimientos' | 'documentos' | 'procesos' | 'informes';
export type ClientsAreaSubmoduleKey = 'marketing' | 'cobranza' | 'codigo-imp' | 'legal' | 'comercial';

export interface ClientsAreaOption {
  label: string;
  description: string;
  icon: LucideIconData;
  route?: string;
}

export interface ClientsAreaCategory {
  key: ClientsAreaCategoryKey;
  label: string;
  description: string;
  icon: LucideIconData;
  options: ClientsAreaOption[];
}

export interface ClientsAreaSubmodule {
  key: ClientsAreaSubmoduleKey;
  label: string;
  description: string;
  icon: LucideIconData;
  categories: ClientsAreaCategory[];
}

export interface ClientsAreaConfig {
  key: ClientsAreaKey;
  title: string;
  subtitle: string;
  icon: LucideIconData;
  defaultSubmoduleKey: ClientsAreaSubmoduleKey;
  submodules: ClientsAreaSubmodule[];
}
