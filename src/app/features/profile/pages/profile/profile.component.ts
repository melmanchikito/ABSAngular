import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Bell,
  Check,
  Earth,
  FileText,
  LucideAngularModule,
  Palette,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Upload,
  UserCircle
} from 'lucide-angular';
import { Subscription } from 'rxjs';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  AccentColor,
  AppLanguage,
  AppTheme,
  CardDensity,
  FontSize,
  HeaderVariant,
  SidebarPosition,
  SystemWallpaper
} from '../../../../core/models/preferences.model';
import { ProfileImageService } from '../../services/profile-image.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  asset?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  readonly bellIcon = Bell;
  readonly checkIcon = Check;
  readonly documentsIcon = FileText;
  readonly privacyIcon = ShieldCheck;
  readonly regionalIcon = Earth;
  readonly syncIcon = RefreshCcw;
  readonly appearanceIcon = Palette;
  readonly ordersIcon = ShoppingCart;
  readonly uploadIcon = Upload;
  readonly profileIcon = UserCircle;

  readonly themeOptions: readonly SelectOption<AppTheme>[] = [
    { value: 'light', label: 'PROFILE.THEME_LIGHT', description: 'PROFILE.THEME_LIGHT_DESCRIPTION' },
    { value: 'dark', label: 'PROFILE.THEME_DARK', description: 'PROFILE.THEME_DARK_DESCRIPTION' },
    { value: 'system', label: 'PROFILE.THEME_SYSTEM', description: 'PROFILE.THEME_SYSTEM_DESCRIPTION' },
    { value: 'liquid-glass', label: 'PROFILE.THEME_LIQUID', description: 'PROFILE.THEME_LIQUID_DESCRIPTION' }
  ];

  readonly headerVariantOptions: readonly SelectOption<HeaderVariant>[] = [
    { value: 'classic', label: 'PROFILE.HEADER_CLASSIC', description: 'PROFILE.HEADER_CLASSIC_DESCRIPTION' },
    { value: 'floating', label: 'PROFILE.HEADER_FLOATING', description: 'PROFILE.HEADER_FLOATING_DESCRIPTION' }
  ];

  readonly sidebarPositionOptions: readonly SelectOption<SidebarPosition>[] = [
    { value: 'left', label: 'PROFILE.SIDEBAR_LEFT', description: 'PROFILE.SIDEBAR_LEFT_DESCRIPTION' },
    { value: 'right', label: 'PROFILE.SIDEBAR_RIGHT', description: 'PROFILE.SIDEBAR_RIGHT_DESCRIPTION' }
  ];

  readonly accentOptions: readonly SelectOption<AccentColor>[] = [
    { value: 'absRed', label: 'PROFILE.ACCENT_ABS_RED', description: 'PROFILE.ACCENT_ABS_RED_DESCRIPTION' },
    { value: 'executiveRed', label: 'PROFILE.ACCENT_EXECUTIVE_RED', description: 'PROFILE.ACCENT_EXECUTIVE_RED_DESCRIPTION' },
    { value: 'enterpriseGray', label: 'PROFILE.ACCENT_ENTERPRISE_GRAY', description: 'PROFILE.ACCENT_ENTERPRISE_GRAY_DESCRIPTION' },
    { value: 'premiumNight', label: 'PROFILE.ACCENT_PREMIUM_NIGHT', description: 'PROFILE.ACCENT_PREMIUM_NIGHT_DESCRIPTION' }
  ];

  readonly wallpaperOptions: readonly SelectOption<SystemWallpaper>[] = [
    { value: 'none', label: 'PROFILE.WALLPAPER_NONE' },
    { value: 'arwallaros', label: 'AR Wall Aros', asset: 'assets/auth/arwallaros.webp' },
    { value: 'arwallpaper', label: 'AR Wallpaper', asset: 'assets/auth/arwallpaper.webp' },
    { value: 'autofondo', label: 'PROFILE.WALLPAPER_AUTO', asset: 'assets/auth/autofondo.svg' },
    { value: 'fondonnewpass', label: 'PROFILE.WALLPAPER_NEW_PASS', asset: 'assets/auth/fondonnewpass.webp' },
    { value: 'fondonnew', label: 'PROFILE.WALLPAPER_NEW', asset: 'assets/auth/fondonnew.webp' },
    { value: 'lockScreen', label: 'Lock screen', asset: 'assets/auth/lockScreen.webp' }
  ];

  readonly languageOptions: readonly SelectOption<AppLanguage>[] = [
    { value: 'es', label: 'Español', description: 'PROFILE.LANGUAGE_DESCRIPTION' },
    { value: 'en', label: 'English', description: 'PROFILE.LANGUAGE_DESCRIPTION' },
    { value: 'it', label: 'Italiano', description: 'PROFILE.LANGUAGE_DESCRIPTION' }
  ];

  savedBadge = false;
  showResetConfirm = false;

  profileImageUrl: string | null = null;
  isUploadingImage = false;
  imageMessage = '';
  imageError = '';

  private imageSubscription?: Subscription;
  private imageMessageTimer?: ReturnType<typeof setTimeout>;
  private savedBadgeTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public readonly preferencesService: PreferencesService,
    private readonly authService: AuthService,
    private readonly profileImageService: ProfileImageService,
    private readonly languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.imageSubscription = this.profileImageService.imageUrl$.subscribe((imageUrl) => {
      this.profileImageUrl = imageUrl;
    });

    this.profileImageService.loadUserImage().subscribe();
  }

  ngOnDestroy(): void {
    this.imageSubscription?.unsubscribe();

    if (this.imageMessageTimer) {
      clearTimeout(this.imageMessageTimer);
    }

    if (this.savedBadgeTimer) {
      clearTimeout(this.savedBadgeTimer);
    }
  }

  get prefs() {
    return this.preferencesService.snapshot;
  }

  get username(): string {
    return this.authService.getName() || 'Usuario';
  }

  get email(): string {
    return this.authService.getEmail() || 'correo@empresa.com';
  }

  update(data: Partial<typeof this.prefs>): void {
    this.preferencesService.update(data);
    this.flashSaved();
  }

  setTheme(theme: AppTheme): void {
    this.update({ theme });
  }

  setFontSize(fontSize: FontSize): void {
    this.update({ fontSize });
  }

  setAccentColor(accentColor: AccentColor): void {
    this.update({ accentColor });
  }

  setWallpaper(wallpaper: SystemWallpaper): void {
    this.update({
      wallpaper,
      wallpaperEnabled: wallpaper === 'none' ? false : this.prefs.wallpaperEnabled
    });
  }

  setWallpaperEnabled(wallpaperEnabled: boolean): void {
    this.update({
      wallpaperEnabled,
      wallpaper: wallpaperEnabled && this.prefs.wallpaper === 'none' ? 'arwallpaper' : this.prefs.wallpaper
    });
  }

  setLanguage(language: AppLanguage): void {
    this.languageService.setLanguage(language);
    this.flashSaved();
  }

  get wallpaperPreviewLabel(): string {
    return this.wallpaperOptions.find((option) => option.value === this.prefs.wallpaper)?.label ?? 'PROFILE.WALLPAPER_NONE';
  }

  get wallpaperPreviewStyle(): Record<string, string> {
    const selectedWallpaper = this.wallpaperOptions.find((option) => option.value === this.prefs.wallpaper);

    if (!this.prefs.wallpaperEnabled || !selectedWallpaper?.asset) {
      return {};
    }

    return {
      'background-image': `linear-gradient(135deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.56)), url("${selectedWallpaper.asset}")`
    };
  }

  setCardDensity(cardDensity: CardDensity): void {
    this.update({ cardDensity });
  }

  setHeaderVariant(headerVariant: HeaderVariant): void {
    this.update({ headerVariant });
  }

  setSidebarPosition(sidebarPosition: SidebarPosition): void {
    this.update({ sidebarPosition });
  }

  setAnimationsDisabled(disabled: boolean): void {
    this.update({ showAnimations: !disabled });
  }

  openImagePicker(input: HTMLInputElement): void {
    input.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imageMessage = '';
    this.imageError = '';

    if (!file.type.startsWith('image/')) {
      this.imageError = 'PROFILE.IMAGE_INVALID';
      input.value = '';
      return;
    }

    const maxSizeMb = 2;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.imageError = 'PROFILE.IMAGE_TOO_LARGE';
      input.value = '';
      return;
    }

    this.isUploadingImage = true;

    this.profileImageService.uploadUserImage(file).subscribe({
      next: (imageUrl) => {
        this.profileImageUrl = imageUrl;
        this.imageMessage = 'PROFILE.IMAGE_UPDATED';
        this.isUploadingImage = false;
        input.value = '';

        this.imageMessageTimer = setTimeout(() => {
          this.imageMessage = '';
        }, 1800);
      },
      error: () => {
        this.imageError = 'PROFILE.IMAGE_UPDATE_ERROR';
        this.isUploadingImage = false;
        input.value = '';
      }
    });
  }

  reset(): void {
    this.preferencesService.reset();
    this.showResetConfirm = false;
    this.flashSaved();
  }

  private flashSaved(): void {
    this.savedBadge = true;
    this.savedBadgeTimer = setTimeout(() => {
      this.savedBadge = false;
    }, 1500);
  }
}
