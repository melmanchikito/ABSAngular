import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterDataService } from '../../services/master-data.service';
import { AssistFormService } from '../../state/assist-form.service';
import { Branch, Company, Department, Employee } from '../../../../core/models/master-data.model';
import { FormsModule } from '@angular/forms';
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

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.masterDataService.getEmployees().subscribe((data) => this.employees = data);
    this.masterDataService.getCompanies().subscribe((data) => this.companies = data);
    this.masterDataService.getBranches().subscribe((data) => this.branches = data);
    this.masterDataService.getDepartments().subscribe((data) => this.departments = data);
  }

  get form() {
    return this.assistFormService.snapshot;
  }

  handleChange(field: string, value: any): void {
    switch (field) {
      case 'employeeId': {
        this.assistFormService.setForm({ employeeId: value });

        if (this.form.isOwner) {
          const emp = this.employees.find((e) => e.id === value);
          this.assistFormService.setForm({
            companyId: emp?.company_id,
            branchId: emp?.branch_id,
            departmentId: emp?.department_id
          });
        }
        break;
      }

      case 'ownerId': {
        this.assistFormService.setForm({ ownerId: value });

        if (!this.form.isOwner) {
          const owner = this.employees.find((e) => e.id === value);
          this.assistFormService.setForm({
            companyId: owner?.company_id,
            branchId: owner?.branch_id,
            departmentId: owner?.department_id
          });
        }
        break;
      }

      case 'isOwner': {
        this.assistFormService.setForm({
          isOwner: value,
          ownerId: value ? undefined : this.form.ownerId
        });

        const employee = this.employees.find((e) =>
          value ? e.id === this.form.employeeId : e.id === this.form.ownerId
        );

        this.assistFormService.setForm({
          companyId: employee?.company_id,
          branchId: employee?.branch_id,
          departmentId: employee?.department_id
        });
        break;
      }

      default:
        this.assistFormService.setForm({ [field]: value });
    }

    this.validateDates();
  }

  validateDates(): void {
    const result = validateDate(this.form.dateInit, this.form.dateEnd);
    this.alertStart = result.field === 'start' && !result.valid ? result.message ?? null : null;
    this.alertEnd = result.field === 'end' && !result.valid ? result.message ?? null : null;
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
}