export type AppTheme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = 'red' | 'darkRed' | 'gray';

export interface AppPreferences {
  theme: AppTheme;
  fontSize: FontSize;
  accentColor: AccentColor;
}