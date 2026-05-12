import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  LucideAngularModule,
  Package,
  RefreshCcw,
  Search,
  Trash2,
  X
} from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataGridPaginationComponent } from '../../../../shared/components/data-grid-pagination/data-grid-pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import {
  StatusBadgeComponent,
  StatusBadgeVariant
} from '../../../../shared/components/status-badge/status-badge.component';
import {
  CancelProductRequest,
  InsertProductRequest,
  ProductItem,
  ProductSaleStatus,
  UpdateProductRequest
} from '../../models/product-maintenance.model';
import { ProductMaintenanceService } from '../../services/product-maintenance.service';

type ProductModalMode = 'create' | 'edit';
type ProductStatusFilter = 'all' | 'active' | 'inactive';
type BackendErrorBody = Record<string, unknown>;

interface ProductForm {
  code: string;
  name: string;
  short_name: string;
  description: string;
  cost_price: number | null;
  price_mayor: number | null;
  price_public: number | null;
  oem: string;
  currency: string;
  status: ProductSaleStatus;
}

@Component({
  selector: 'app-product-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ConfirmDialogComponent,
    DataGridPaginationComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent
  ],
  templateUrl: './product-maintenance.component.html',
  styleUrl: './product-maintenance.component.scss'
})
export class ProductMaintenanceComponent implements OnInit {
  readonly productIcon = Package;
  readonly addIcon = CirclePlus;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly editIcon = Edit3;
  readonly refreshIcon = RefreshCcw;
  readonly searchIcon = Search;
  readonly trashIcon = Trash2;
  readonly closeIcon = X;
  readonly statusOptions: ProductSaleStatus[] = [
    'activo venta',
    'inactivo venta',
    'descontinuado venta'
  ];

  products: ProductItem[] = [];
  selectedProductId: number | null = null;
  searchTerm = '';
  statusFilter: ProductStatusFilter = 'all';
  currentPage = 1;
  pageSize = 6;
  isLoading = false;
  isSaving = false;
  isLoadingDetail = false;
  successMessage = '';
  errorMessage = '';
  formError = '';

  modalOpen = false;
  modalMode: ProductModalMode = 'create';
  editingProduct: ProductItem | null = null;
  productToCancel: ProductItem | null = null;

  productForm: ProductForm = this.createEmptyForm();

  constructor(private readonly productService: ProductMaintenanceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get modalTitle(): string {
    return this.modalMode === 'create' ? 'Nuevo producto' : 'Editar producto';
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get activeProducts(): number {
    return this.products.filter((product) => this.isActiveProduct(product)).length;
  }

  get inactiveProducts(): number {
    return this.products.filter((product) => !this.isActiveProduct(product)).length;
  }

  get selectedProduct(): ProductItem | null {
    if (!this.selectedProductId) {
      return null;
    }

    return this.products.find((product) => product.id === this.selectedProductId) ?? null;
  }

  get filteredProducts(): ProductItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.products.filter((product) => {
      const isActive = this.isActiveProduct(product);
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && isActive) ||
        (this.statusFilter === 'inactive' && !isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        product.code,
        product.name,
        product.short_name,
        product.description,
        product.oem,
        product.currency,
        product.status
      ].some((value) => (value ?? '').toLowerCase().includes(term));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get paginatedProducts(): ProductItem[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;

    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get showingCount(): number {
    return this.paginatedProducts.length;
  }

  get cancelProductMessage(): string {
    const productName = this.productToCancel?.name ?? 'este producto';

    return `Esta seguro de que desea borrar ${productName}?`;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.selectedProductId = products.some((product) => product.id === this.selectedProductId)
          ? this.selectedProductId
          : null;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.handleHttpError(error, 'No se pudo cargar el listado de productos.');
      }
    });
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  setStatusFilter(filter: ProductStatusFilter): void {
    this.statusFilter = filter;
    this.onFiltersChange();
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  selectProduct(product: ProductItem): void {
    this.selectedProductId = product.id;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingProduct = null;
    this.productForm = this.createEmptyForm();
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEditModal(product: ProductItem): void {
    this.modalMode = 'edit';
    this.editingProduct = product;
    this.productForm = this.createFormFromProduct(product);
    this.formError = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
    this.isLoadingDetail = true;

    this.productService.getProductById(product.id).subscribe({
      next: (loadedProduct) => {
        this.isLoadingDetail = false;
        this.editingProduct = loadedProduct;
        this.productForm = this.createFormFromProduct(loadedProduct);
      },
      error: (error) => {
        this.isLoadingDetail = false;
        this.handleHttpError(
          error,
          'No se pudo cargar el producto seleccionado para editar.',
          true
        );
      }
    });
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.modalOpen = false;
    this.editingProduct = null;
    this.formError = '';
    this.isLoadingDetail = false;
  }

  saveProduct(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.formError = '';

    const code = this.productForm.code.trim();
    const name = this.productForm.name.trim();
    const shortName = this.productForm.short_name.trim();
    const description = this.productForm.description.trim();
    const costPrice = Number(this.productForm.cost_price);
    const priceMayor = Number(this.productForm.price_mayor);
    const pricePublic = Number(this.productForm.price_public);
    const oem = this.productForm.oem.trim();
    const currency = this.productForm.currency.trim().toUpperCase();
    const status = this.productForm.status;

    if (!code) {
      this.formError = 'El codigo es obligatorio.';
      return;
    }

    if (!name) {
      this.formError = 'El nombre es obligatorio.';
      return;
    }

    if (!shortName) {
      this.formError = 'El nombre corto es obligatorio.';
      return;
    }

    if (!description) {
      this.formError = 'La descripcion es obligatoria.';
      return;
    }

    if (!this.isValidAmount(costPrice)) {
      this.formError = 'El costo es obligatorio y debe ser numerico.';
      return;
    }

    if (!this.isValidAmount(priceMayor)) {
      this.formError = 'El precio mayor es obligatorio y debe ser numerico.';
      return;
    }

    if (!this.isValidAmount(pricePublic)) {
      this.formError = 'El precio publico es obligatorio y debe ser numerico.';
      return;
    }

    if (!oem) {
      this.formError = 'El OEM es obligatorio.';
      return;
    }

    if (!currency) {
      this.formError = 'La moneda es obligatoria.';
      return;
    }

    if (!status) {
      this.formError = 'El estado es obligatorio.';
      return;
    }

    this.isSaving = true;

    if (this.modalMode === 'create') {
      const payload: InsertProductRequest = {
        code,
        name,
        short_name: shortName,
        description,
        cost_price: costPrice,
        price_mayor: priceMayor,
        price_public: pricePublic,
        oem,
        currency,
        status,
        created_by: this.getUsername()
      };

      this.productService.insertProduct(payload).subscribe({
        next: () => this.afterSuccessfulSave('Producto creado correctamente.'),
        error: (error) => this.handleSaveError(error, 'No se pudo crear el producto.')
      });

      return;
    }

    if (!this.editingProduct) {
      this.isSaving = false;
      this.formError = 'No se encontro el producto seleccionado.';
      return;
    }

    const payload: UpdateProductRequest = {
      product_id: this.editingProduct.id,
      code,
      name,
      short_name: shortName,
      description,
      cost_price: costPrice,
      price_mayor: priceMayor,
      price_public: pricePublic,
      oem,
      currency,
      status,
      updated_by: this.getUsername()
    };

    this.productService.updateProduct(payload).subscribe({
      next: () => this.afterSuccessfulSave('Producto actualizado correctamente.'),
      error: (error) => this.handleSaveError(error, 'No se pudo actualizar el producto.')
    });
  }

  askCancel(product: ProductItem): void {
    this.productToCancel = product;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCancelConfirm(): void {
    if (this.isSaving) {
      return;
    }

    this.productToCancel = null;
  }

  confirmCancel(): void {
    if (!this.productToCancel) {
      return;
    }

    const payload: CancelProductRequest = {
      product_id: this.productToCancel.id,
      canceled_by: this.getUsername()
    };

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.productService.cancelProduct(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.productToCancel = null;
        this.selectedProductId = null;
        this.successMessage = 'Producto anulado correctamente.';
        this.loadProducts();
      },
      error: (error) => {
        this.isSaving = false;
        this.handleHttpError(error, 'No se pudo anular el producto.');
      }
    });
  }

  formatDate(value?: string | null): string {
    return value || 'Sin registro';
  }

  formatAmount(value?: number | null): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  getProductInitial(product: ProductItem): string {
    return (product.name || product.code || '?').trim().charAt(0).toUpperCase();
  }

  getStatusLabel(product: ProductItem): string {
    return product.status || (product.canceled ? 'inactivo venta' : 'activo venta');
  }

  getStatusVariant(product: ProductItem): StatusBadgeVariant {
    const status = this.normalizeStatus(product.status);

    if (product.canceled || status === 'inactivo venta') {
      return 'inactive';
    }

    if (status === 'descontinuado venta') {
      return 'warning';
    }

    if (status === 'activo venta') {
      return 'active';
    }

    return 'neutral';
  }

  trackByProductId(_: number, product: ProductItem): number {
    return product.id;
  }

  private createEmptyForm(): ProductForm {
    return {
      code: '',
      name: '',
      short_name: '',
      description: '',
      cost_price: 0,
      price_mayor: 0,
      price_public: 0,
      oem: '',
      currency: 'USD',
      status: 'activo venta'
    };
  }

  private createFormFromProduct(product: ProductItem): ProductForm {
    return {
      code: product.code ?? '',
      name: product.name ?? '',
      short_name: product.short_name ?? '',
      description: product.description ?? '',
      cost_price: product.cost_price ?? 0,
      price_mayor: product.price_mayor ?? 0,
      price_public: product.price_public ?? 0,
      oem: product.oem ?? '',
      currency: product.currency ?? 'USD',
      status: product.status || 'activo venta'
    };
  }

  private isActiveProduct(product: ProductItem): boolean {
    return !product.canceled && this.normalizeStatus(product.status) === 'activo venta';
  }

  private normalizeStatus(status?: string | null): string {
    return (status ?? '').trim().toLowerCase();
  }

  private isValidAmount(value: number): boolean {
    return Number.isFinite(value) && value >= 0;
  }

  private afterSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.modalOpen = false;
    this.editingProduct = null;
    this.successMessage = message;
    this.loadProducts();
  }

  private handleSaveError(error: unknown, fallback: string): void {
    this.isSaving = false;
    this.handleHttpError(error, fallback, true);
  }

  private handleHttpError(error: unknown, fallback: string, formError = false): void {
    console.error('Error completo:', error);
    console.error('Respuesta backend:', (error as { error?: unknown }).error);
    console.error(
      'Detalles validacion:',
      (error as { error?: { error?: { details_error?: unknown } } }).error?.error?.details_error
    );

    const message = this.extractErrorMessage(this.getErrorBody(error), fallback);

    if (formError) {
      this.formError = message;
      return;
    }

    this.errorMessage = message;
  }

  private getErrorBody(error: unknown): BackendErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const errorRecord = error as BackendErrorBody;
    const body = errorRecord['error'];

    return this.isRecord(body) ? body : null;
  }

  private extractErrorMessage(errorBody: BackendErrorBody | null, fallback: string): string {
    const nestedError = this.isRecord(errorBody?.['error']) ? errorBody?.['error'] : null;
    const details = this.isRecord(nestedError?.['details_error'])
      ? nestedError?.['details_error']
      : errorBody?.['details_error'];
    const detail = this.isRecord(details) ? details['error_detail'] : null;

    if (this.isStringArrayRecord(detail)) {
      const messages: string[] = [];

      if (detail['code']?.includes('validation.required')) {
        messages.push('El codigo es obligatorio.');
      }

      if (detail['name']?.includes('validation.required')) {
        messages.push('El nombre es obligatorio.');
      }

      if (detail['short_name']?.includes('validation.required')) {
        messages.push('El nombre corto es obligatorio.');
      }

      if (detail['description']?.includes('validation.required')) {
        messages.push('La descripcion es obligatoria.');
      }

      if (detail['cost_price']?.includes('validation.required')) {
        messages.push('El costo es obligatorio.');
      }

      if (detail['price_mayor']?.includes('validation.required')) {
        messages.push('El precio mayor es obligatorio.');
      }

      if (detail['price_public']?.includes('validation.required')) {
        messages.push('El precio publico es obligatorio.');
      }

      if (detail['oem']?.includes('validation.required')) {
        messages.push('El OEM es obligatorio.');
      }

      if (detail['currency']?.includes('validation.required')) {
        messages.push('La moneda es obligatoria.');
      }

      if (detail['status']?.includes('validation.required')) {
        messages.push('El estado es obligatorio.');
      }

      if (messages.length) {
        return messages.join(' ');
      }
    }

    const detailsMessage = this.isRecord(details) ? details['error_message'] : null;
    const bodyMessage = errorBody?.['message'];
    const nestedMessage = nestedError?.['message'];

    if (typeof detailsMessage === 'string') {
      return detailsMessage;
    }

    if (typeof bodyMessage === 'string') {
      return bodyMessage;
    }

    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }

    return fallback;
  }

  private isRecord(value: unknown): value is BackendErrorBody {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  private isStringArrayRecord(value: unknown): value is Record<string, string[]> {
    if (!this.isRecord(value)) {
      return false;
    }

    return Object.values(value).every(
      (item) => Array.isArray(item) && item.every((entry) => typeof entry === 'string')
    );
  }

  private getUsername(): string {
    return (
      localStorage.getItem('username') ||
      localStorage.getItem('userName') ||
      localStorage.getItem('user') ||
      localStorage.getItem('email') ||
      'Usuario'
    );
  }
}
