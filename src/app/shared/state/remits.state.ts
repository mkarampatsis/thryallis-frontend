import { createAction, props, createReducer, on, createSelector } from '@ngrx/store';
import { Actions, act, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';

import { AppState } from './app.state';
import { IRemit } from '../interfaces/remit/remit.interface';
import { RemitService } from '../services/remit.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface RemitsState {
    remits: IRemit[];
    loading: boolean;
    error: string;
}

export const remitsInitialState: RemitsState = {
    remits: [],
    loading: false,
    error: '',
};

// Remits Actions
export const loadRemits = createAction('[Remit] Load Remits');
export const loadRemitsSuccess = createAction('[Remit] Load Remits Success', props<{ remits: IRemit[] }>());
export const loadRemitsFailure = createAction('[Remit] Load Remits Failure', props<{ error: string }>());

// Remits Reducer
export const remitsReducer = createReducer<RemitsState>(
    remitsInitialState,
    on(loadRemits, (state) => ({ ...state, loading: true })),
    on(loadRemitsSuccess, (state, { remits }) => ({
        ...state,
        remits,
        loading: false,
    })),
    on(loadRemitsFailure, (state, { error }) => ({ ...state, error, loading: false })),
);

// Remits Selectors
export const selectRemitsState$ = (state: AppState) => state.remits;
export const remits$ = (state: AppState) => state.remits.remits;
export const remitsLoading$ = (state: AppState) => state.remits.loading;
// Use createSelector to create memoized selectors
export const selectRemits$ = createSelector(selectRemitsState$, (state) => state.remits);
export const selectRemitsLoading$ = createSelector(selectRemitsState$, (state) => state.loading);
export const selectRemitsError$ = createSelector(selectRemitsState$, (state) => state.error);

// Remits Effects
export const loadRemitsEffect = createEffect(
    (actions$ = inject(Actions), remitService = inject(RemitService)) => {
        return actions$.pipe(
            ofType(loadRemits),
            switchMap(() =>
                remitService.getAllRemits().pipe(
                    map((remits) => loadRemitsSuccess({ remits })),
                    catchError((error) => of(loadRemitsFailure({ error }))),
                ),
            ),
        );
    },
    { functional: true },
);
