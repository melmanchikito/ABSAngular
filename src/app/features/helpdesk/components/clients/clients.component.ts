import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MasterDataService } from '../../services/master-data.service';
import { AssistFormService } from '../../state/assist-form.service';
import { Branch, Company, Department, Employee } from '../../../../core/models/master-data.model';
import { validateDate } from '../../../../core/utils/validators.utils';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit {
  employees: Employee[] = [];
  companies: Company[] = [];
  branches: Branch[] = [];
  departments: Department[] = [];

  alertStart: string | null = null;
  alertEnd: string | null = null;

  isLoading = false;
  loadError = '';

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
    this.validateDates();
  }

  get form() {
    return this.assistFormService.snapshot;
  }

  private loadMasterData(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      employees: this.masterDataService.getEmployees(),
      companies: this.masterDataService.getCompanies(),
      branches: this.masterDataService.getBranches(),
      departments: this.masterDataService.getDepartments()
    }).subscribe({
      next: ({ employees, companies, branches, departments }) => {
        this.employees = employees;
        this.companies = companies;
        this.branches = branches;
        this.departments = departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando datos del solicitante:', error);
        this.loadError = 'No se pudieron cargar los datos de referencia.';
        this.isLoading = false;
      }
    });
  }

  handleChange(field: string, value: unknown): void {
    switch (field) {
      case 'employeeId': {
        const employeeId = this.toNumberOrUndefined(value);

        this.assistFormService.setForm({ employeeId });

        if (this.form.isOwner) {
          const emp = this.employees.find((e) => e.id === employeeId);

          this.assistFormService.setForm({
            companyId: emp?.company_id,
            branchId: emp?.branch_id,
            departmentId: emp?.department_id
          });
        }

        break;
      }

      case 'ownerId': {
        const ownerId = this.toNumberOrUndefined(value);

        this.assistFormService.setForm({ ownerId });

        if (!this.form.isOwner) {
          const owner = this.employees.find((e) => e.id === ownerId);

          this.assistFormService.setForm({
            companyId: owner?.company_id,
            branchId: owner?.branch_id,
            departmentId: owner?.department_id
          });
        }

        break;
      }

      case 'isOwner': {
        const isOwner = Boolean(value);

        this.assistFormService.setForm({
          isOwner,
          ownerId: isOwner ? undefined : this.form.ownerId
        });

        const employee = this.employees.find((e) =>
          isOwner
            ? e.id === this.form.employeeId
            : e.id === this.form.ownerId
        );

        this.assistFormService.setForm({
          companyId: employee?.company_id,
          branchId: employee?.branch_id,
          departmentId: employee?.department_id
        });

        break;
      }

      case 'companyId': {
        this.assistFormService.setForm({
          companyId: this.toNumberOrUndefined(value)
        });

        break;
      }

      case 'branchId': {
        this.assistFormService.setForm({
          branchId: this.toNumberOrUndefined(value)
        });

        break;
      }

      case 'departmentId': {
        this.assistFormService.setForm({
          departmentId: this.toNumberOrUndefined(value)
        });

        break;
      }

      case 'dateInit': {
        this.assistFormService.setForm({
          dateInit: String(value ?? '')
        });

        break;
      }

      case 'dateEnd': {
        this.assistFormService.setForm({
          dateEnd: String(value ?? '')
        });

        break;
      }

      case 'priority': {
        this.assistFormService.setForm({
          priority: String(value ?? '')
        });

        break;
      }

      default:
        break;
    }

    this.validateDates();
  }

  validateDates(): void {
    if (!this.form.dateInit || !this.form.dateEnd) {
      this.alertStart = null;
      this.alertEnd = null;
      return;
    }

    const result = validateDate(this.form.dateInit, this.form.dateEnd);

    this.alertStart =
      result.field === 'start' && !result.valid
        ? result.message ?? null
        : null;

    this.alertEnd =
      result.field === 'end' && !result.valid
        ? result.message ?? null
        : null;
  }

  get filteredEmployees(): Employee[] {
    return this.form.companyId
      ? this.employees.filter((e) => e.company_id === this.form.companyId)
      : this.employees;
  }

  get filteredCompanies(): Company[] {
    const employee = this.employees.find((e) => e.id === this.form.employeeId);

    return employee
      ? this.companies.filter((c) => c.id === employee.company_id)
      : this.companies;
  }

  get filteredBranches(): Branch[] {
    const employee = this.employees.find((e) => e.id === this.form.employeeId);

    if (employee) {
      return this.branches.filter((b) => b.id === employee.branch_id);
    }

    if (this.form.companyId) {
      return this.branches.filter((b) => b.company_id === this.form.companyId);
    }

    return this.branches;
  }

  get filteredDepartments(): Department[] {
    const employee = this.employees.find((e) => e.id === this.form.employeeId);

    return employee
      ? this.departments.filter((d) => d.id === employee.department_id)
      : this.departments;
  }

  get ownerOptions(): Employee[] {
    return this.employees.filter((emp) => emp.id !== this.form.employeeId);
  }

  private toNumberOrUndefined(value: unknown): number | undefined {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) && numericValue > 0
      ? numericValue
      : undefined;
  }
}