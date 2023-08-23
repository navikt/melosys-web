export const OKFakturaserie = "fakturainformasjon/OKFakturaserie";
export const OKFakturainfo = "fakturainformasjon/OKFakturainfo";
export const FEILET = "fakturainformasjon/FEILET";
export const PENDING = "fakturainformasjon/PENDING";

export interface Data {
  fakturaserie?: any;
  fakturainfo?: any;
}

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkActionFakturaserie {
  type: typeof OKFakturaserie;
  data: any;
}

interface OkActionFakturainfo {
  type: typeof OKFakturainfo;
  data: any;
}

export type Action = FeiletAction | PendingAction | OkActionFakturaserie | OkActionFakturainfo;
