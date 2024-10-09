import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-content',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './content.component.html',
    styleUrl: './content.component.css',
})
export class ContentComponent {
    authService = inject(AuthService);
    user = this.authService.user;
}
