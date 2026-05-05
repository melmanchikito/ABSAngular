import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getLocalDateTime } from '../../../core/utils/date.utils';
import {
  AddedEquipment,
  HelpdeskFormData,
  Category,
  Device,
  Problem,
  RemovedEquipment,
  RequestImage,
  TicketDt
} from '../../../core/models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class AssistFormService {
  private readonly formSubject = new BehaviorSubject<HelpdeskFormData>({
    isOwner: true,
    dateInit: getLocalDateTime(),
    dateEnd: getLocalDateTime(1),
    priority: '',
    selectedDevice: undefined,
    selectedCategory: undefined,
    selectedProblem: undefined,
    selectedTicketDt: undefined,
    requestImages: [],
    addedEquipments: [],
    removedEquipments: [],
    charCount: {
      issue_description: 0,
      solution_description: 0,
      observation: 0
    }
  });

  readonly form$ = this.formSubject.asObservable();

  get snapshot(): HelpdeskFormData {
    return this.formSubject.value;
  }

  setForm(data: Partial<HelpdeskFormData>): void {
    this.formSubject.next({
      ...this.snapshot,
      ...data
    });
  }

  setSelectedDevice(data?: Partial<Device>): void {
    this.formSubject.next({
      ...this.snapshot,
      selectedDevice: data
        ? { ...this.snapshot.selectedDevice, ...data }
        : undefined
    });
  }

  setSelectedCategory(data?: Partial<Category>): void {
    this.formSubject.next({
      ...this.snapshot,
      selectedCategory: data
        ? { ...this.snapshot.selectedCategory, ...data }
        : undefined
    });
  }

  setSelectedProblem(data?: Partial<Problem>): void {
    this.formSubject.next({
      ...this.snapshot,
      selectedProblem: data
        ? { ...this.snapshot.selectedProblem, ...data }
        : undefined
    });
  }

  setSelectedTicketDt(data?: Partial<TicketDt>): void {
    this.formSubject.next({
      ...this.snapshot,
      selectedTicketDt: data
        ? { ...this.snapshot.selectedTicketDt, ...data }
        : undefined
    });
  }

  setCharCount(data: Partial<HelpdeskFormData['charCount']>): void {
    this.formSubject.next({
      ...this.snapshot,
      charCount: {
        ...this.snapshot.charCount,
        ...data
      }
    });
  }

  addRequestImages(images: RequestImage[]): void {
    this.formSubject.next({
      ...this.snapshot,
      requestImages: [
        ...this.snapshot.requestImages,
        ...images
      ]
    });
  }

  removeRequestImage(id: string): void {
    this.formSubject.next({
      ...this.snapshot,
      requestImages: this.snapshot.requestImages.filter((image) => image.id !== id)
    });
  }

  addEquipment(data: AddedEquipment): void {
    this.formSubject.next({
      ...this.snapshot,
      addedEquipments: [
        ...this.snapshot.addedEquipments,
        data
      ]
    });
  }

  removeAddedEquipment(id: string): void {
    this.formSubject.next({
      ...this.snapshot,
      addedEquipments: this.snapshot.addedEquipments.filter((equipment) => equipment.id !== id)
    });
  }

  addRemovedEquipment(data: RemovedEquipment): void {
    this.formSubject.next({
      ...this.snapshot,
      removedEquipments: [
        ...this.snapshot.removedEquipments,
        data
      ]
    });
  }

  removeRemovedEquipment(id: string): void {
    this.formSubject.next({
      ...this.snapshot,
      removedEquipments: this.snapshot.removedEquipments.filter((equipment) => equipment.id !== id)
    });
  }
}
