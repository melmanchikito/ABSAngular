import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AccentColor, AppTheme, CardDensity, FontSize } from '../../../../core/models/preferences.model';
import { ProfileImageService } from '../../services/profile-image.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
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

  setCardDensity(cardDensity: CardDensity): void {
    this.update({ cardDensity });
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
