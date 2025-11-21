import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employee-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-admin.component.html',
  styleUrl: './employee-admin.component.css'
})
export class EmployeeAdminComponent {

  employeeCategories = signal<any[]>([
    {
      category: {
        name: 'ΠΕ',
        branches: [
          { name: 'Μηχανικός', specialties: ['Αρχιτέκτονας', 'Χημικός Μηχανικός'] },
          { name: 'Πληροφορικός', specialties: ['Προγραμματιστής', 'Διαχειριστής Δικτύων'] }
        ]
      }
    },
    {
      category: {
        name: 'ΤΕ',
        branches: [
          { name: 'Τεχνολόγος', specialties: ['Ηλεκτρολόγος', 'Μηχανολόγος'] },
          { name: 'Διοικητικός', specialties: ['Γραμματέας', 'Υπάλληλος'] }
        ]
      }
    }
  ]);

  private clone() {
    // deep-ish clone for this structure (categories -> category -> branches -> specialties)
    return JSON.parse(JSON.stringify(this.employeeCategories()));
  }

  updateCategoryName(catIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ?? '';

    const data = this.clone();
    data[catIndex].category.name = value;
    this.employeeCategories.set(data);
  }

  addCategory() {
    const name = prompt('Νέα Κατηγορία');
    if (!name) return;
    const data = this.clone();
    data.push({ category: { name, branches: [] } });
    this.employeeCategories.set(data);
  }

  removeCategory(catIndex: number) {
    const data = this.clone();
    data.splice(catIndex, 1);
    this.employeeCategories.set(data);
  }

  // --- Branch ops ---
  addBranch(catIndex: number) {
    const name = prompt('Νέος Κλάδος');
    if (!name) return;
    const data = this.clone();
    data[catIndex].category.branches.push({ name, specialties: [] });
    this.employeeCategories.set(data);
  }

  updateBranchName(catIndex: number, branchIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ?? '';

    const data = this.clone();
    data[catIndex].category.branches[branchIndex].name = value ?? '';
    this.employeeCategories.set(data);
  }

  removeBranch(catIndex: number, branchIndex: number) {
    const data = this.clone();
    data[catIndex].category.branches.splice(branchIndex, 1);
    this.employeeCategories.set(data);
  }

  // --- Specialty ops ---
  addSpecialty(catIndex: number, branchIndex: number) {
    const name = prompt('Νέα Ειδικότητα');
    if (!name) return;
    const data = this.clone();
    data[catIndex].category.branches[branchIndex].specialties.push(name);
    this.employeeCategories.set(data);
  }

  updateSpecialty(catIndex: number, branchIndex: number, specIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ?? '';

    const data = this.clone();
    data[catIndex].category.branches[branchIndex].specialties[specIndex] = value ?? '';
    this.employeeCategories.set(data);
  }

  removeSpecialty(catIndex: number, branchIndex: number, specIndex: number) {
    const data = this.clone();
    data[catIndex].category.branches[branchIndex].specialties.splice(specIndex, 1);
    this.employeeCategories.set(data);
  }

}
