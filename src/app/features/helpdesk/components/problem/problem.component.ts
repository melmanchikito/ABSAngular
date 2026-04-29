import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AssistFormService } from '../../state/assist-form.service';
import { MasterDataService } from '../../services/master-data.service';
import {
  Category,
  HelpdeskFormData,
  Problem
} from '../../../../core/models/master-data.model';
import { countChar } from '../../../../core/utils/validators.utils';

type TicketTextField =
  | 'issue_description'
  | 'solution_description'
  | 'observation';

@Component({
  selector: 'app-problem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problem.component.html',
  styleUrl: './problem.component.scss'
})
export class ProblemComponent implements OnInit {
  categories: Category[] = [];
  problems: Problem[] = [];

  isLoading = false;
  loadError = '';

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadProblemData();
  }

  get form(): HelpdeskFormData {
    return this.assistFormService.snapshot;
  }

  get categoryId(): number | undefined {
    return this.form.selectedCategory?.id;
  }

  get filteredProblems(): Problem[] {
    if (!this.categoryId) {
      return this.problems;
    }

    return this.problems.filter(
      (problem) => problem.category_id === this.categoryId
    );
  }

  private loadProblemData(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      categories: this.masterDataService.getCategories(),
      problems: this.masterDataService.getProblems()
    }).subscribe({
      next: ({ categories, problems }) => {
        this.categories = categories;
        this.problems = problems;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando categorías y problemas:', error);
        this.loadError = 'No se pudieron cargar las categorías y problemas.';
        this.isLoading = false;
      }
    });
  }

  onCategoryChange(value: string | number): void {
    const categoryId = Number(value);

    const category = this.categories.find((c) => c.id === categoryId);

    this.assistFormService.setSelectedCategory(category);
    this.assistFormService.setSelectedProblem(undefined);
  }

  onProblemChange(value: string | number): void {
    const problemId = Number(value);

    const problem = this.problems.find((p) => p.id === problemId);

    this.assistFormService.setSelectedProblem(problem);
  }

  onTextChange(field: TicketTextField, value: string): void {
    const textValue = value ?? '';

    this.assistFormService.setSelectedTicketDt({
      [field]: textValue
    });

    this.assistFormService.setCharCount({
      [field]: countChar(textValue)
    });
  }

  onRemoteChange(value: boolean): void {
    this.assistFormService.setSelectedTicketDt({
      is_remote: value
    });
  }
}