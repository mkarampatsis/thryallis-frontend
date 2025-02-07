import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, effect } from '@angular/core';
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

  organization = toSignal(this.organizationsLoading$,{ initialValue: false })
  organizationalUnits = toSignal(this.organizationalUnitsLoading$,{ initialValue: false })
  remits = toSignal(this.remitsLoading$,{ initialValue: false })

  // loading$ = this.organizationsLoading$ || this.organizationalUnitsLoading$ || this.remitsLoading$;
  loading$ = computed(() => 
    this.organization() || this.organizationalUnits() || this.remits()
  );


  constructor() {
    // Watch for changes in loading$ and update synchronization
    effect(
      () => {
        // console.log("1>>>loading>>", this.loading$());
        // console.log(">>>>Status", this.organization() || this.organizationalUnits() || this.remits());
        if (!this.loading$()) {
          // console.log("2>>>loading>>", this.loading$());
          console.log("Finish synchronization ", this.organization() || this.organizationalUnits() || this.remits());
          this.authService.synchronization.set(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

}
