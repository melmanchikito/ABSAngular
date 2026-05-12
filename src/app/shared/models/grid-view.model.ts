import { LucideIconData } from 'lucide-angular';

export interface PageViewConfig {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIconData;
  module?: string;
  breadcrumb?: string[];
}

export interface GridColumnConfig<TColumnKey extends string = string> {
  key: TColumnKey;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface GridFilterOption<TValue extends string = string> {
  value: TValue;
  label: string;
}
