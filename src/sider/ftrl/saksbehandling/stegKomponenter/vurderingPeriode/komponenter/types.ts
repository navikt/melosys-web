import { FieldValues } from "react-hook-form";

export interface MedlemskapsperiodeProp {
  ny: boolean;
  feil?: string;
  periodeId: number;
  fomDato: string;
  tomDato: string;
  innvilgelsesResultat: string;
  bestemmelse: string;
  trygdedekning: string;
  redigerbar?: boolean;
}

export interface FieldArrayProps {
  medlemskapsperioder: MedlemskapsperiodeProp[];
}

export type FormValuesProps = FieldValues & FieldArrayProps;

export interface VurderingPerioderProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}
