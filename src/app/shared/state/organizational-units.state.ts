import { createAction, props, createReducer, on, createSelector } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';

import { AppState } from './app.state';
import { IOrganizationUnitList } from '../interfaces/organization-unit';
import { OrganizationalUnitService } from '../services/organizational-unit.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ConstService } from '../services/const.service';

export interface OrganizationalUnitsState {
    organizationalUnits: IOrganizationUnitList[];
    loading: boolean;
    error: string;
}

export const organizationalUnitsInitialState: OrganizationalUnitsState = {
    organizationalUnits: [],
    loading: false,
    error: '',
};

// Organizational Units Actions
export const loadOrganizationalUnits = createAction('[OrganizationalUnit] Load Organizational Units');
export const loadOrganizationalUnitsSuccess = createAction(
    '[OrganizationalUnit] Load Organizational Units Success',
    props<{ organizationalUnits: IOrganizationUnitList[] }>(),
);
export const loadOrganizationalUnitsFailure = createAction(
    '[OrganizationalUnit] Load Organizational Units Failure',
    props<{ error: string }>(),
);
export const setOrgnizationalUnitremitsFinalized = createAction(
    '[OrganizationalUnit] Set Organizational Unit Remits Finalized',
    props<{ code: string; remitsFinalized: boolean }>(),
);

// Organizational Units Reducer
export const organizationalUnitsReducer = createReducer<OrganizationalUnitsState>(
    organizationalUnitsInitialState,
    on(loadOrganizationalUnits, (state) => ({ ...state, loading: true })),
    on(loadOrganizationalUnitsSuccess, (state, { organizationalUnits }) => ({
        ...state,
        organizationalUnits,
        loading: false,
    })),
    on(loadOrganizationalUnitsFailure, (state, { error }) => ({ ...state, error, loading: false })),
    on(setOrgnizationalUnitremitsFinalized, (state, { code, remitsFinalized }) => ({
        ...state,
        organizationalUnits: state.organizationalUnits.map((ou) =>
            ou.code === code ? { ...ou, remitsFinalized } : ou,
        ),
    })),
);

// Organizational Units Selectors
export const selectOrganizationalUnitsState$ = (state: AppState) => state.organizationalUnits;
export const organizationalUnits$ = (state: AppState) => state.organizationalUnits.organizationalUnits;
// export const organizationalUnitsLoading$ = (state: AppState) => state.organizationalUnits.loading;

// Use createSelector to create memoized selectors
export const selectOrganizationalUnitsLoading$ = createSelector(
    selectOrganizationalUnitsState$,
    (state) => state.loading,
);
export const selectOrganizationalUnits$ = createSelector(
    selectOrganizationalUnitsState$,
    (state) => state.organizationalUnits,
);
// Lets create a selector to return the organization code for a given organizational unit code
export const selectOrganizationCodeByOrganizationalUnitCode$ = (organizationalUnitCode: string) =>
    createSelector(selectOrganizationalUnits$, (organizationalUnits) => {
        const ou = organizationalUnits.find((ou) => ou.code === organizationalUnitCode);
        return ou ? ou.organizationCode : null;
    });

// A selector to return the organization unit codes for a given organizational code
export const selectOrganizationalUnitCodeByOrganizationCode$ = (organizationCode: string) =>
    createSelector(selectOrganizationalUnits$, (organizationalUnits) => {
        const codes = organizationalUnits
                    .filter(ou => ou.organizationCode === organizationCode)
                    .map(ou => ou.code);
        return codes ? codes : null;
    });    

// Organizational Units Effects
export const getOrganizationalUnitsEffect = createEffect(
    (
        actions$ = inject(Actions),
        organizationUnitService = inject(OrganizationalUnitService),
        constService = inject(ConstService),
    ) => {
        return actions$.pipe(
            ofType(loadOrganizationalUnits),
            switchMap(() =>
                organizationUnitService.getAllOrganizationalUnits().pipe(
                    // tap((orgUnits) => {
                    //     orgUnits.forEach((ou) => {
                    //         if (ou.code === '800399' || ou.code === '573529')
                    //             console.log('AAAAA', constService.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP.get(ou.code));
                    //         // console.log(ou.code, constService.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP[ou.code]);
                    //         if (constService.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP[ou.code])
                    //             console.log('ou FINALIZED', ou);
                    //     });
                    // }),
                    // Use the ORGANIZATION_UNIT_REMITS_FINALIZED_MAP to map the remitsFinalized property
                    map((organizationalUnits) => {
                        // console.log(
                        //     'organizationalUnits',
                        //     organizationalUnits.map(
                        //         (ou) => constService.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP[ou.code] ?? false,
                        //     ),
                        // );
                        return organizationalUnits.map((organizationalUnit) => ({
                            ...organizationalUnit,
                            remitsFinalized:
                                constService.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP.get(organizationalUnit.code) ??
                                false,
                        }));
                    }),
                    map((organizationalUnits) => loadOrganizationalUnitsSuccess({ organizationalUnits })),
                    catchError((error) => of(loadOrganizationalUnitsFailure({ error: error.message }))),
                ),
            ),
        );
    },
    { functional: true },
);
