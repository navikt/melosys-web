declare module "AppTypes" {
  export type RootState = ReturnType<ReturnType<typeof import("./reducer").default>>;
  export type AppThunk<ReturnType = void, ActionType> = import("redux-thunk").ThunkAction<
    ReturnType,
    RootState,
    unknown,
    ActionType
  >;

  export interface StateSection<TData> {
    status: string;
    data: TData;
  }
}

/**
 * window.env settes i env-config.js og blir lastet inn i index.html. Ved deploy mountes filen fra Nais ConfigMap.
 */
interface Window {
  env: {
    [key: string]: string;
  };
}

declare module "Domene" {
  export type Periode = import("./@types").Periode;
  export type DokumentOversikt = import("./@types").DokumentOversikt;
  export type Dokument = import("./@types").Dokument;
  export type FysiskDokument = import("./@types").FysiskDokument;
  export type Mottaksretning = import("./@types").Mottaksretning;
  export type SedPdfData = import("./@types").SedPdfData;
}

declare module "@navikt/melosys-kodeverk" {
  export interface KTObject {
    kode: string;
    term: string | null;
  }
}

declare module "melosys-api" {
  interface Feilkode {
    kode: string;
    felter: string[];
  }

  export interface ErrorResponse {
    error: string;
    status: number;
    message: string;
    feilkoder?: Feilkode[];
  }
}

declare module "nav-frontend-grid" {
  export type ColumnWidth = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
}
