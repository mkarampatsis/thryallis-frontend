import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-editors',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editors.component.html',
  styleUrl: './editors.component.css'
})
export class EditorsComponent {

  loading: boolean = false;

  form = new FormGroup({
    email: new FormControl('', Validators.required),
    firstName: new FormControl(''),
    lastName: new FormControl('', Validators.required),
    foreas : new FormControl([], Validators.required),
    question: new FormControl('', Validators.required)
  });


  onSubmit() {
    this.loading = true;

    console.log(this.form.value);
  }

}
