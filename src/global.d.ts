declare module "AppTypes" {
  export type RootState = ReturnType<ReturnType<typeof import('./reducer').default>>;
  export type AppThunk<ReturnType = void, ActionType> = import('redux-thunk').ThunkAction<ReturnType, RootState, unknown, ActionType>;
}
