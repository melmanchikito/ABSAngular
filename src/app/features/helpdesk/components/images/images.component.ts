import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Camera, ImagePlus, LucideAngularModule, Trash2 } from 'lucide-angular';
import { AssistFormService } from '../../state/assist-form.service';
import { RequestImage } from '../../../../core/models/master-data.model';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss'
})
export class ImagesComponent {
  readonly cameraIcon = Camera;
  readonly imagePlusIcon = ImagePlus;
  readonly trashIcon = Trash2;

  errorMessage = '';

  constructor(public readonly assistFormService: AssistFormService) {}

  get images(): RequestImage[] {
    return this.assistFormService.snapshot.requestImages;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.errorMessage = '';
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Solo se pueden agregar archivos de imagen.';
        return false;
      }

      if (file.size > 3 * 1024 * 1024) {
        this.errorMessage = 'Cada imagen debe pesar 3 MB o menos.';
        return false;
      }

      return true;
    });

    void this.readFiles(validFiles);
    input.value = '';
  }

  removeImage(id: string): void {
    this.assistFormService.removeRequestImage(id);
  }

  formatSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  private async readFiles(files: File[]): Promise<void> {
    const images = await Promise.all(files.map((file) => this.fileToImage(file)));
    this.assistFormService.addRequestImages(images);
  }

  private fileToImage(file: File): Promise<RequestImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          id: `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: String(reader.result ?? '')
        });
      };

      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.readAsDataURL(file);
    });
  }
}
