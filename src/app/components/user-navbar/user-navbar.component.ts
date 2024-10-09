import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-user-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './user-navbar.component.html',
    styleUrl: './user-navbar.component.css',
})
export class UserNavbarComponent {}
