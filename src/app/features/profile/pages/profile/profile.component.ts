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
  Upload
} from 'lucide-angular';
import { Subscription } from 'rxjs';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AccentColor, AppTheme, CardDensity, FontSize, SystemWallpaper } from '../../../../core/models/preferences.model';
import { ProfileImageService } from '../../services/profile-image.service';

interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  asset?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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

  readonly themeOptions: readonly SelectOption<AppTheme>[] = [
    { value: 'light', label: 'Claro', description: 'Interfaz limpia para espacios iluminados.' },
    { value: 'dark', label: 'Oscuro', description: 'Mayor contraste para trabajo continuo.' },
    { value: 'system', label: 'Sistema', description: 'Usa la preferencia del dispositivo.' },
    { value: 'liquid-glass', label: 'Liquid Glass', description: 'Vidrio translúcido con profundidad visual.' }
  ];

  readonly accentOptions: readonly SelectOption<AccentColor>[] = [
    { value: 'absRed', label: 'Rojo ABS', description: 'Marca principal' },
    { value: 'executiveRed', label: 'Rojo ejecutivo', description: 'Formal y elegante' },
    { value: 'enterpriseGray', label: 'Gris empresarial', description: 'Neutro y serio' },
    { value: 'premiumNight', label: 'Nocturno premium', description: 'Rojo, dorado y gris oscuro' }
  ];

  readonly wallpaperOptions: readonly SelectOption<SystemWallpaper>[] = [
    { value: 'none', label: 'Sin fondo' },
    { value: 'arwallaros', label: 'AR Wall Aros', asset: 'assets/auth/arwallaros.webp' },
    { value: 'arwallpaper', label: 'AR Wallpaper', asset: 'assets/auth/arwallpaper.webp' },
    { value: 'autofondo', label: 'Auto fondo', asset: 'assets/auth/autofondo.svg' },
    { value: 'fondonnewpass', label: 'Fondo new pass', asset: 'assets/auth/fondonnewpass.webp' },
    { value: 'fondonnew', label: 'Fondo new', asset: 'assets/auth/fondonnew.webp' },
    { value: 'lockScreen', label: 'Lock screen', asset: 'assets/auth/lockScreen.webp' }
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
    private readonly profileImageService: ProfileImageService
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

  get wallpaperPreviewLabel(): string {
    return this.wallpaperOptions.find((option) => option.value === this.prefs.wallpaper)?.label ?? 'Sin fondo';
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
      this.imageError = 'Selecciona una imagen válida.';
      input.value = '';
      return;
    }

    const maxSizeMb = 2;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.imageError = `La imagen no debe superar los ${maxSizeMb} MB.`;
      input.value = '';
      return;
    }

    this.isUploadingImage = true;

    this.profileImageService.uploadUserImage(file).subscribe({
      next: (imageUrl) => {
        this.profileImageUrl = imageUrl;
        this.imageMessage = 'Foto actualizada correctamente.';
        this.isUploadingImage = false;
        input.value = '';

        this.imageMessageTimer = setTimeout(() => {
          this.imageMessage = '';
        }, 1800);
      },
      error: () => {
        this.imageError = 'No se pudo actualizar la foto.';
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
