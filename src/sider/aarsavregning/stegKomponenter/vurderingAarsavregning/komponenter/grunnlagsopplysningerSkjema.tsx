import "./tidligereGrunnlagsoversikt.css";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Control, FieldArrayWithId } from "react-hook-form";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";

interface GrunnlagsopplysningerSkjemaProps {
  defaultPeriode?: { fomDato: string; tomDato: string };
  formValues: FormValuesProps;
  inntektFields: FieldArrayWithId<FieldArrayProps, "inntektskilder">[];
  skattFields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  control: Control;
  inntektUpdate: (index: number, inntektskilde: Inntektskilde) => void;
  inntektRemove: (index: number) => void;
  inntektAppend: (inntektskilde: Inntektskilde) => void;
  skattRemove: (index: number) => void;
  skattAppend: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  medlemskapsTypeErPliktig: boolean;
}

function GrunnlagsopplysningerSkjema({
  defaultPeriode,
  formValues,
  inntektFields,
  skattFields,
  control,
  inntektUpdate,
  inntektRemove,
  inntektAppend,
  skattRemove,
  skattAppend,
  redigerbart,
  medlemskapsTypeErPliktig,
}: GrunnlagsopplysningerSkjemaProps) {
  return (
    <div className="grunnlagsopplysningerSkjema">
      <Skatteforholdsperioder
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      <Inntektskilder
        defaultPeriode={defaultPeriode}
        formValues={formValues}
        redigerbart={redigerbart}
        update={inntektUpdate}
        remove={inntektRemove}
        append={inntektAppend}
        control={control}
        fields={inntektFields}
        medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
        skalViseErMaanedsBelopRadioGroup
      />
    </div>
  );
}

export default GrunnlagsopplysningerSkjema;
