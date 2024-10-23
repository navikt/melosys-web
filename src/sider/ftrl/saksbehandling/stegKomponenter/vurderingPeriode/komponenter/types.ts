import { FieldValues } from "react-hook-form";

export type MedlemskapsperiodeProp = {
  ny: boolean;
  feil?: string;
  periodeId: number;
  fomDato: string;
  tomDato: string;
  innvilgelsesResultat: string;
  bestemmelse: string;
  trygdedekning: string;
  trygdedekninger?: [];
};

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
