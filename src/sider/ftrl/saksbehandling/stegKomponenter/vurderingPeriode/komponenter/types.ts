import { FieldValues } from "react-hook-form";
import { ErrorResponse } from "melosys-api";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemskapsperioder";

export type MedlemskapsperiodeProp = {
  ny: boolean;
  feil?: string;
  periodeId: number;
  fomDato: string;
  tomDato: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
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

export interface ResponsFeilet {
  data: ErrorResponse;
}

export interface Medlemskapsrespons {
  type: string;
  data: Medlemskapsperiode | ResponsFeilet;
}
