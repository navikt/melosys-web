import { FieldValues } from "react-hook-form";
import { BasePeriode } from "../../../../../../services/modules/types/periodeTyper";

export interface MedlemskapsperiodeProp extends BasePeriode {
  ny: boolean;
  feil?: string;
  periodeId: number;
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
