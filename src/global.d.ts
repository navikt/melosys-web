/* eslint-disable no-undef */

declare module 'AppTypes' {
  export type RootState = ReturnType<ReturnType<typeof import('./reducer').default>>;
  export type AppThunk<ReturnType = void, ActionType> = import('redux-thunk').ThunkAction<ReturnType, RootState, unknown, ActionType>;

  export interface StateSection<TData> {
    status: string;
    data: TData;
  }
}

declare module 'Domene' {
  export type AnmodningOmUnntakBestilling = import('./@types').AnmodningOmUnntakBestilling;
  export type Fagsak = import('./@types').Fagsak;
  export type Oppsummering = import('./@types').Oppsummering;
  export type Person = import('./@types').Person;
  export type Videresending = import('./@types').Videresending;
}

declare module 'melosys-kodeverk' {
  export type KTObject = { kode: string, term: string | null };
}
