declare module "AppTypes" {
  export type RootState = ReturnType<ReturnType<typeof import('./reducer').default>>;
}
