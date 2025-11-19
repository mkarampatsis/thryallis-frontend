import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-admin.component.html',
  styleUrl: './employee-admin.component.css'
})
export class EmployeeAdminComponent {
  categories = signal(['ΠΕ', 'ΤΕ', 'ΔΕ', 'ΥΕ']);
  branches = signal(['Μηχανικός', 'Πληροφορικός']);
  specialties = signal(['Αρχιτέκτονας', 'Χημικός Μηχανικός']);

  newCategory = '';
  newBranch = '';
  newSpecialty = '';

  add(listSignal: any, value: string) {
    if (!value.trim()) return;
    listSignal.set([...listSignal(), value.trim()]);
  }

  remove(listSignal: any, index: number) {
    const arr = [...listSignal()];
    arr.splice(index, 1);
    listSignal.set(arr);
  }

  update(listSignal: any, index: number, newValue: string) {
    const arr = [...listSignal()];
    arr[index] = newValue.trim();
    listSignal.set(arr);
  }
}
