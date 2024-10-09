import { createAction, props, createReducer, on, createSelector } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';

import { AppState } from './app.state';
import { IOrganizationList } from '../interfaces/organization';
import { OrganizationService } from '../services/organization.service';
import { catchError, map, of, switchMap } from 'rxjs';

// Organization State
export interface OrganizationsState {
    organizations: IOrganizationList[];
    loading: boolean;
    error: string;
}

export const organizationInitialState: OrganizationsState = {
    organizations: [],
    loading: false,
    error: '',
};

// Organization Actions
export const loadOrganizations = createAction('[Organization] Load Organizations');
export const loadOrganizationsSuccess = createAction(
    '[Organization] Load Organizations Success',
    props<{ organizations: IOrganizationList[] }>(),
);
export const loadOrganizationsFailure = createAction(
    '[Organization] Load Organizations Failure',
    props<{ error: string }>(),
);

// Organizations Reducer
export const organizationReducer = createReducer<OrganizationsState>(
    organizationInitialState,
    on(loadOrganizations, (state) => ({ ...state, loading: true })),
    on(loadOrganizationsSuccess, (state, { organizations }) => ({ ...state, organizations, loading: false })),
    on(loadOrganizationsFailure, (state, { error }) => ({ ...state, error, loading: false })),
);

// Organizations Selectors
export const selectOrganizationState$ = (state: AppState) => state.organizations;
export const getOrganizations$ = (state: AppState) => state.organizations.organizations;
export const organizationsLoading$ = (state: AppState) => state.organizations.loading;
// Use createSelector to create memoized selectors
export const selectOrganizations$ = createSelector(selectOrganizationState$, (state) => state.organizations);

// Organizations Effects
export const getOrganizationsEffect = createEffect(
    (actions$ = inject(Actions), organizationService = inject(OrganizationService)) => {
        return actions$.pipe(
            ofType(loadOrganizations),
            switchMap(() =>
                organizationService.getAllOrganizations().pipe(
                    map((organizations) => loadOrganizationsSuccess({ organizations })),
                    catchError((error) => of(loadOrganizationsFailure({ error: error.message }))),
                ),
            ),
        );
    },
    { functional: true },
);
