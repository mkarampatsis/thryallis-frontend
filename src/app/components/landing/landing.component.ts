import { CommonModule } from '@angular/common';
import { Component, inject, computed, effect } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  store = inject(Store<AppState>);
  authService = inject(AuthService)
  
  organizationsLoading$ = this.store.select((state) => state.organizations.loading);
  organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
  remitsLoading$ = this.store.select((state) => state.remits.loading);
}
