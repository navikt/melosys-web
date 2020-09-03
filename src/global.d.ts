declare module "AppTypes" {
  export type RootState = ReturnType<ReturnType<typeof import('./reducer').default>>;
  export type AppThunk<ReturnType = void, ActionType> = import('redux-thunk').ThunkAction<ReturnType, RootState, unknown, ActionType>;
}

declare module "Domene" {
  // TODO: Fjern dette eksempelet når vi begynner å legge inn domenetyper
  // export type Saksbehandler = import('./@types').Saksbehandler;
}

declare module "melosys-kodeverk" {
  export type KTObject = { kode: string, term: string | null };
}
