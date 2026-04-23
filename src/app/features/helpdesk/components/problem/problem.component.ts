import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistFormService } from '../../state/assist-form.service';
import { MasterDataService } from '../../services/master-data.service';
import { Category, Problem } from '../../../../core/models/master-data.model';
import { countChar } from '../../../../core/utils/validators.utils';

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

  constructor(
    public readonly assistFormService: AssistFormService,
    private readonly masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.masterDataService.getCategories().subscribe((data) => this.categories = data);
    this.masterDataService.getProblems().subscribe((data) => this.problems = data);
  }

  get form() {
    return this.assistFormService.snapshot;
  }

  get filteredProblems(): Problem[] {
    return this.form.selectedCategory?.id
      ? this.problems.filter((p) => p.category_id === this.form.selectedCategory?.id)
      : this.problems;
  }

  onCategoryChange(categoryId: number): void {
    const category = this.categories.find((c) => c.id === categoryId);
    this.assistFormService.setSelectedCategory(category);
    this.assistFormService.setSelectedProblem(undefined);
  }

  onProblemChange(problemId: number): void {
    const problem = this.problems.find((p) => p.id === problemId);
    this.assistFormService.setSelectedProblem(problem);
  }

  onTextChange(field: 'issue_description' | 'solution_description' | 'observation', value: string): void {
    this.assistFormService.setSelectedTicketDt({ [field]: value });
    this.assistFormService.setCharCount({ [field]: countChar(value) });
  }

  onRemoteChange(value: boolean): void {
    this.assistFormService.setSelectedTicketDt({ is_remote: value });
  }
}