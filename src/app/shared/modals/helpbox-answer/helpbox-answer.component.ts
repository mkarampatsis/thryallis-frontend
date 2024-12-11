import { Component } from '@angular/core';

@Component({
  selector: 'app-helpbox-answer',
  standalone: true,
  imports: [],
  templateUrl: './helpbox-answer.component.html',
  styleUrl: './helpbox-answer.component.css'
})
export class HelpboxAnswerComponent {
    modalRef: any;
    id: string

    ngOnInit() : void {
        console.log(">>>", this.id)
    }
}
